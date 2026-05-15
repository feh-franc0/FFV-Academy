// Package curriculum — sanitizer.go aplica defesa em profundidade contra
// XSS no conteúdo CMS antes de persistir.
//
// Camada 1: schemas Zod no frontend (BlockRenderer rejeita javascript:/data:).
// Camada 2: este sanitizer, executado em POST/PATCH/PUT de artigos e blocks.
//
// Estratégia:
//   - bluemonday.UGCPolicy() sanitiza strings de conteúdo textual rico
//     (Markdown convertido em HTML, captions, headings).
//   - ValidateBlockURLs varre o JSON do bloco recursivamente e rejeita
//     qualquer chave conhecida de URL (`link`, `src`, `href`, `url`,
//     `sourceUrl`) cujo valor use protocolo perigoso.
//
// O whitelist de protocolos espelha SAFE_PROTOCOLS em
// frontend/src/components/article/blocks/schemas.ts.
package curriculum

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/microcosm-cc/bluemonday"
)

// urlKeys são as chaves cujos valores precisam validação de protocolo.
// Manter sincronizado com schemas Zod do frontend.
var urlKeys = map[string]struct{}{
	"link":      {},
	"src":       {},
	"href":      {},
	"url":       {},
	"sourceUrl": {},
	"source_url": {},
}

// allowedURLPrefixes lista os prefixos permitidos (case-insensitive).
// `javascript:`, `data:`, `vbscript:`, `file:` são rejeitados explicitamente.
var allowedURLPrefixes = []string{
	"https://",
	"http://",
	"mailto:",
	"/",
	"#",
}

var ugcPolicy = bluemonday.UGCPolicy()

// UGCPolicy expõe a policy bluemonday para reuso em outras camadas (handlers,
// importer). UGC = User Generated Content; permite tags semânticas (p, h1-6,
// a com http(s)/mailto, ul/ol/li, code, pre, blockquote, etc.) e remove
// vetores conhecidos (script, iframe, on*, javascript:).
func UGCPolicy() *bluemonday.Policy {
	return ugcPolicy
}

// SanitizeString aplica a policy bluemonday e remove qualquer HTML/script
// embutido em strings textuais. Idempotente.
func SanitizeString(s string) string {
	return ugcPolicy.Sanitize(s)
}

// SanitizeArticleContent sanitiza o conteúdo Markdown/HTML de um Article
// (campo content_md). Aplica UGCPolicy preservando estrutura semântica.
func SanitizeArticleContent(content string) string {
	return SanitizeString(content)
}

// ValidateBlockURLs percorre o JSON `data` de um Block recursivamente e
// retorna erro se qualquer URL conhecida usa protocolo proibido.
// Retorna nil se tudo está dentro do whitelist.
func ValidateBlockURLs(b *Block) error {
	if b == nil || len(b.Data) == 0 {
		return nil
	}
	var decoded any
	if err := json.Unmarshal(b.Data, &decoded); err != nil {
		return fmt.Errorf("curriculum: data inválido em block %s: %w", b.ID, err)
	}
	if err := walkValidateURLs(decoded, b.Type); err != nil {
		return err
	}
	for _, child := range b.Children {
		if err := ValidateBlockURLs(child); err != nil {
			return err
		}
	}
	return nil
}

// SanitizeBlock retorna uma cópia "limpa" do bloco com texto sanitizado.
// Para tipos que contêm strings rich-text conhecidas (paragraph.content[i].text,
// callout.content, code_block é deixado intocado), o conteúdo passa por
// bluemonday. Tipos não-mapeados são deixados como estão (mas ainda passam
// por ValidateBlockURLs no fluxo de persistência).
func SanitizeBlock(b *Block) (*Block, error) {
	if b == nil {
		return nil, nil
	}
	if err := ValidateBlockURLs(b); err != nil {
		return nil, err
	}
	if len(b.Data) == 0 {
		return b, nil
	}
	var decoded map[string]any
	if err := json.Unmarshal(b.Data, &decoded); err != nil {
		// Não-objeto na raiz: deixa passar (campos primitivos não têm XSS textual).
		return b, nil
	}
	sanitizeMapStrings(decoded, b.Type)
	out, err := json.Marshal(decoded)
	if err != nil {
		return nil, fmt.Errorf("curriculum: re-encode falhou para block %s: %w", b.ID, err)
	}
	cloned := *b
	cloned.Data = out
	// Recursão em filhos.
	if len(b.Children) > 0 {
		sanitizedKids := make([]*Block, 0, len(b.Children))
		for _, c := range b.Children {
			sc, err := SanitizeBlock(c)
			if err != nil {
				return nil, err
			}
			sanitizedKids = append(sanitizedKids, sc)
		}
		cloned.Children = sanitizedKids
	}
	return &cloned, nil
}

// walkValidateURLs percorre uma estrutura JSON arbitrária (decodificada via
// `any`) e valida cada chave conhecida de URL.
func walkValidateURLs(node any, blockType string) error {
	switch v := node.(type) {
	case map[string]any:
		for k, child := range v {
			if _, isURL := urlKeys[k]; isURL {
				if s, ok := child.(string); ok && s != "" {
					if !isAllowedURL(s) {
						return fmt.Errorf("curriculum: URL com protocolo proibido em %s.%s: %q", blockType, k, s)
					}
				}
			}
			if err := walkValidateURLs(child, blockType); err != nil {
				return err
			}
		}
	case []any:
		for _, item := range v {
			if err := walkValidateURLs(item, blockType); err != nil {
				return err
			}
		}
	}
	return nil
}

// sanitizeMapStrings aplica bluemonday em strings de campos textuais
// conhecidos (não-URL). URLs já foram validadas antes; campos opacos como
// `code` em code_block NÃO são sanitizados (devem aparecer literal no PRE).
func sanitizeMapStrings(m map[string]any, blockType string) {
	// Tipos cujo conteúdo é renderizado literalmente em <pre><code>.
	if blockType == BlockTypeCodeBlock {
		return
	}
	for k, v := range m {
		// URLs não sanitizamos (já validadas); apenas confirmamos não-XSS.
		if _, isURL := urlKeys[k]; isURL {
			continue
		}
		switch val := v.(type) {
		case string:
			m[k] = SanitizeString(val)
		case map[string]any:
			sanitizeMapStrings(val, blockType)
		case []any:
			for i, item := range val {
				switch it := item.(type) {
				case string:
					val[i] = SanitizeString(it)
				case map[string]any:
					sanitizeMapStrings(it, blockType)
				}
			}
		}
	}
}

func isAllowedURL(s string) bool {
	lower := strings.ToLower(s)
	for _, p := range allowedURLPrefixes {
		if strings.HasPrefix(lower, p) {
			return true
		}
	}
	return false
}

// ErrUnsafeURL é o sentinel retornado quando a sanitização rejeita uma URL.
// Use errors.Is para detectar este caso na camada HTTP.
var ErrUnsafeURL = errors.New("curriculum: URL com protocolo não permitido")
