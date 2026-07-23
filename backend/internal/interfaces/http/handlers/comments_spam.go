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

	"golang.org/x/text/unicode/norm"
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

	// 5) Banned words — busca case-insensitive em forma normalizada
	//    (NFKC + zero-width strip + lowercase) pra fechar bypass de unicode
	//    lookalikes (e.g. "сompre" com 'с' cirílico) e zero-width joiners
	//    no meio da palavra ("c​ompre").
	normalized := normalizeForSpamCheck(trimmed)
	for _, w := range bannedWords {
		if strings.Contains(normalized, w) {
			return SpamCheckResult{
				OK: false, Code: "spam:banned-word",
				Reason: "linguagem ofensiva ou spam detectado",
			}
		}
	}

	return SpamCheckResult{OK: true}
}

// normalizeForSpamCheck aplica NFKC + strip de zero-width + lowercase.
// NFKC mapeia caracteres compatíveis (ﬁ → fi, ３ → 3) mas NÃO converte
// cirílico/grego lookalikes pra latim (essas são letras distintas em Unicode).
// Pra cobrir isso adicionamos um mapa explícito dos lookalikes mais comuns.
func normalizeForSpamCheck(s string) string {
	// Strip zero-width chars que atacantes meterem no meio de palavras.
	s = stripInvisibleChars(s)
	// NFKC normalization — colapsa formas equivalentes.
	s = norm.NFKC.String(s)
	// Lookalike fold — cobre os mais comuns em PT-BR/EN.
	s = lookalikeFold(s)
	return strings.ToLower(s)
}

func stripInvisibleChars(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		// Bloqueia U+200B..200D (zero-width), U+FEFF (BOM), U+2060 (word joiner),
		// e categoria Mn (combining marks são OK, mantemos).
		if r == 0x200B || r == 0x200C || r == 0x200D || r == 0xFEFF || r == 0x2060 {
			continue
		}
		b.WriteRune(r)
	}
	return b.String()
}

// lookalikeFold mapeia caracteres cirílicos/gregos visualmente idênticos
// aos latinos correspondentes — fecha bypass tipo "сompre" (с=U+0441 cirílico).
var lookalikeMap = map[rune]rune{
	// Cirílico → Latino (lowercase)
	'а': 'a', 'е': 'e', 'о': 'o', 'р': 'p', 'с': 'c', 'у': 'y', 'х': 'x',
	'А': 'A', 'Е': 'E', 'О': 'O', 'Р': 'P', 'С': 'C', 'У': 'Y', 'Х': 'X',
	// Grego → Latino
	'α': 'a', 'ο': 'o', 'ρ': 'p', 'ν': 'v', 'υ': 'y',
	'Α': 'A', 'Ο': 'O', 'Ρ': 'P', 'Ν': 'V', 'Υ': 'Y',
}

func lookalikeFold(s string) string {
	var b strings.Builder
	b.Grow(len(s))
	for _, r := range s {
		if mapped, ok := lookalikeMap[r]; ok {
			b.WriteRune(mapped)
		} else {
			b.WriteRune(r)
		}
	}
	return b.String()
}
