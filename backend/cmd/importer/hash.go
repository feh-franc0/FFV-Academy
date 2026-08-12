package main

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"sort"
	"strings"
)

// contentHash devolve o SHA-256 do conteúdo NORMALIZADO de um artigo.
//
// Ele existe para responder uma pergunta que o importador não sabia responder:
// este artigo mudou desde a última importação? Sem ela, `updated_at = now()`
// rodava em todos os 427 artigos a cada execução, e o `lastmod` do sitemap ficava
// uniforme — valor uniforme o Google descarta, inclusive nas URLs onde ele seria
// verdade.
//
// A normalização é a parte que importa, e cada regra impede um modo de falha
// concreto:
//
//	ordem de chave estável   um mapa serializado em ordem aleatória daria hash
//	                         diferente a cada execução, e TODO artigo pareceria
//	                         editado sempre — pior que o estado atual.
//	`id` de bloco fora       o id é gerado pelo parser e pode mudar sem o texto
//	                         mudar. Incluí-lo faria refatorar o parser bumpar a
//	                         data dos 427.
//	fim de linha e espaço    reformatar o JSON, trocar CRLF por LF ou rodar um
//	à direita descartados    formatador mudaria a data de tudo de uma vez. É o
//	                         modo de falha que arruinaria o sinal de forma
//	                         permanente, porque não há como distinguir depois.
//
// O que ENTRA no hash: o título e, de cada bloco, o tipo, a posição, os dados e
// os filhos. Título entra porque trocar o título é editar o artigo.
func contentHash(title string, blocks []Block) string {
	h := sha256.New()
	canon, err := json.Marshal(struct {
		Title  string       `json:"title"`
		Blocks []canonBlock `json:"blocks"`
	}{
		Title:  strings.TrimSpace(title),
		Blocks: canonicalizar(blocks),
	})
	if err != nil {
		// json.Marshal sobre estrutura sem canal, func nem ciclo não falha. Se
		// falhar, devolver hash vazio faria o artigo parecer sempre modificado —
		// menos ruim que travar a importação inteira.
		return ""
	}
	h.Write(canon)
	return hex.EncodeToString(h.Sum(nil))
}

// canonBlock é o bloco sem `id`, com os campos em ordem fixa pela declaração.
type canonBlock struct {
	Type     string       `json:"type"`
	Position int          `json:"position"`
	Data     interface{}  `json:"data"`
	Children []canonBlock `json:"children"`
}

func canonicalizar(blocks []Block) []canonBlock {
	saida := make([]canonBlock, 0, len(blocks))
	for _, b := range blocks {
		saida = append(saida, canonBlock{
			Type:     b.Type,
			Position: b.Position,
			Data:     normalizarValor(b.Data),
			Children: canonicalizar(b.Children),
		})
	}
	return saida
}

// normalizarValor percorre o `data` do bloco aplicando as regras de
// normalização. Devolve `interface{}` em vez de mapa porque o valor pode ser
// escalar, lista ou mapa em qualquer profundidade.
//
// Mapa vira lista de pares ORDENADA por chave. `encoding/json` já ordena chave
// de mapa ao serializar, mas depender disso é depender de detalhe de
// implementação da biblioteca padrão para a estabilidade do hash de 427 artigos.
// A ordenação explícita torna a garantia local e legível.
func normalizarValor(v interface{}) interface{} {
	switch t := v.(type) {
	case map[string]interface{}:
		chaves := make([]string, 0, len(t))
		for k := range t {
			chaves = append(chaves, k)
		}
		sort.Strings(chaves)
		pares := make([][2]interface{}, 0, len(chaves))
		for _, k := range chaves {
			pares = append(pares, [2]interface{}{k, normalizarValor(t[k])})
		}
		return pares
	case []interface{}:
		saida := make([]interface{}, 0, len(t))
		for _, item := range t {
			saida = append(saida, normalizarValor(item))
		}
		return saida
	case string:
		return normalizarTexto(t)
	default:
		return v
	}
}

// normalizarTexto descarta o que não muda o que o leitor vê.
//
// Só fim de linha e espaço à DIREITA. Espaço à esquerda fica: num bloco de
// código a indentação é o conteúdo, e removê-la mudaria o significado do que
// está na tela — que é exatamente o que o hash deve detectar.
func normalizarTexto(s string) string {
	s = strings.ReplaceAll(s, "\r\n", "\n")
	linhas := strings.Split(s, "\n")
	for i, l := range linhas {
		linhas[i] = strings.TrimRight(l, " \t")
	}
	return strings.TrimRight(strings.Join(linhas, "\n"), "\n")
}
