// Anti-spam heurístico pra comments — rodado client-side e server-side.
// Não bloqueia 100% (atacantes determinados passam), mas reduz drasticamente
// spam preguiçoso (URLs em massa, all caps, char repeat, palavrões óbvios).
//
// Princípio: rejeitar com mensagem clara — usuário legítimo entende e
// reformula, atacante perde tempo.
package handlers

import (
	"regexp"
	"strings"
	"unicode"
)

// Limites configurados via constantes pra fácil ajuste sem deploy.
const (
	maxCommentChars      = 1000 // bate com CHECK constraint da migration 46
	minCommentChars      = 1
	maxURLsPerComment    = 1    // 1 URL é OK (compartilhar link relevante). 2+ vira spam.
	maxRepeatChars       = 8    // "aaaaaaaaaa" é spam. 8 chars iguais seguidos = stop.
	maxCapsRatio         = 0.70 // >70% maiúsculas em comments com 10+ chars = stop.
	minCharsForCapsCheck = 10   // "OK" não é all caps abuse; "VC TA BURRO LOL" é.
)

// urlPattern bate http(s), www., e bare domains comuns.
var urlPattern = regexp.MustCompile(`(?i)(https?://\S+|www\.\S+|\b\S+\.(com|net|org|io|br|co|tv|me|app|dev|xyz|info|biz)/?\S*)`)

// hasCharRepeat detecta N caracteres iguais seguidos. Go regexp não suporta
// backreferences (\1), então fazemos manual com runas pra suportar Unicode.
func hasCharRepeat(s string, n int) bool {
	if n <= 1 {
		return false
	}
	runs := 1
	var prev rune
	first := true
	for _, r := range s {
		if !first && r == prev {
			runs++
			if runs >= n {
				return true
			}
		} else {
			runs = 1
		}
		prev = r
		first = false
	}
	return false
}

// bannedWords — lista mínima de termos óbvios. Não pretende ser completa
// (filtros sérios usam serviços externos). Bloqueia o lixo mais comum.
//
// Cobertura: insultos PT-BR comuns, scams obvios (compre, ganhe dinheiro),
// e tentativas de spam de URL camuflada. Lista pequena de propósito —
// false positive cresce com lista grande.
var bannedWords = []string{
	"f*da-se", "fdp", "filho da puta", "fdp ", " fdp",
	"puta que pariu",
	"vai se fuder", "vai tomar no",
	"compre agora", "ganhe dinheiro fácil", "ganhe dinheiro facil",
	"clique aqui ganhe",
	"hack grátis", "hack gratis", "hackeie",
	"viagra", "casino online",
	"telegram t.me/", // self-promo via telegram link
}

// SpamCheckResult — resposta detalhada pra ser usada no handler.
type SpamCheckResult struct {
	OK     bool   // true = pode publicar
	Reason string // descrição pro client (português, mostrar pro usuário)
	Code   string // chave estável pra i18n/tracking ("spam:too-many-urls" etc.)
}

// CheckCommentForSpam aplica todas as heurísticas e retorna a primeira que falha.
// Mensagens em PT-BR pra o usuário entender.
func CheckCommentForSpam(content string) SpamCheckResult {
	trimmed := strings.TrimSpace(content)

	// 1) Char limit (defesa em profundidade — o CHECK do banco já garante).
	if len(trimmed) < minCommentChars {
		return SpamCheckResult{OK: false, Code: "validation:empty", Reason: "comentário vazio"}
	}
	if len(trimmed) > maxCommentChars {
		return SpamCheckResult{
			OK: false, Code: "validation:too-long",
			Reason: "comentário acima de 1000 caracteres",
		}
	}

	// 2) URLs em excesso — sinal forte de spam.
	urls := urlPattern.FindAllString(trimmed, -1)
	if len(urls) > maxURLsPerComment {
		return SpamCheckResult{
			OK: false, Code: "spam:too-many-urls",
			Reason: "no máximo 1 link por comentário",
		}
	}

	// 3) Caractere repetido (aaaaaaaa, !!!!!!!!, ----).
	if hasCharRepeat(trimmed, maxRepeatChars) {
		return SpamCheckResult{
			OK: false, Code: "spam:char-repeat",
			Reason: "evite repetir o mesmo caractere muitas vezes",
		}
	}

	// 4) ALL CAPS — só checa em strings com tamanho mínimo (evita falar "OK").
	if len(trimmed) >= minCharsForCapsCheck {
		caps, letters := 0, 0
		for _, r := range trimmed {
			if unicode.IsLetter(r) {
				letters++
				if unicode.IsUpper(r) {
					caps++
				}
			}
		}
		if letters > 0 {
			ratio := float64(caps) / float64(letters)
			if ratio > maxCapsRatio {
				return SpamCheckResult{
					OK: false, Code: "spam:all-caps",
					Reason: "evite escrever tudo em CAIXA ALTA",
				}
			}
		}
	}

	// 5) Banned words — busca case-insensitive.
	lower := strings.ToLower(trimmed)
	for _, w := range bannedWords {
		if strings.Contains(lower, w) {
			return SpamCheckResult{
				OK: false, Code: "spam:banned-word",
				Reason: "linguagem ofensiva ou spam detectado",
			}
		}
	}

	return SpamCheckResult{OK: true}
}
