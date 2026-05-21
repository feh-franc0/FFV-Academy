package middleware

import (
	"context"
	"net/http"
	"regexp"
	"strings"
)

// IdentityHeaders — middleware que captura `X-FFV-*` headers e injeta no
// contexto pra que handlers downstream (tracking, audit) saibam QUEM fez a
// request mesmo em endpoints públicos (sem auth).
//
// Decisão de produto (2026-05-21): admin precisa ver QUEM viu cada módulo.
// Antes só user_id (via JWT) era propagado; isso vazava só pra endpoints
// autenticados. Páginas anônimas (`/aprenda/X` sem login) não chegavam ao
// admin com identidade. Solução: o client envia headers separados que o
// backend trata como SOURCE OF TRUTH NÃO-CONFIÁVEL — pra display only.
//
// Headers aceitos:
//   - X-FFV-User-Email      → email do usuário LOGADO (snapshot do auth client)
//   - X-FFV-User-Id         → UUID do usuário (igual ao JWT sub quando logado)
//   - X-FFV-User-Name       → nome amigável (opcional)
//   - X-FFV-Anon-Id         → UUID anônimo do localStorage (sempre presente)
//   - X-FFV-Session-Id      → UUID por aba/sessão de navegador (sempre)
//
// SEGURANÇA: estes headers são CONTROLADOS PELO CLIENT, podem ser forjados.
// NUNCA usar pra autorização — pra isso temos JWT/Authenticate middleware.
// Uso permitido: display, tracking, atribuição de view counts. Se autorização
// for crítica, o handler precisa cruzar com middleware.UserIDFromContext (JWT).

type identityHeadersKey struct{}

// IdentityFromHeaders — payload extraído dos X-FFV-* headers.
type IdentityFromHeaders struct {
	UserEmail string
	UserID    string
	UserName  string
	AnonID    string
	SessionID string
}

// IsLoggedIn reporta se o client enviou identificação de usuário logado.
// Não é uma garantia de auth — só sinaliza "client diz que tá logado".
func (i IdentityFromHeaders) IsLoggedIn() bool {
	return i.UserEmail != "" || i.UserID != ""
}

// DisplayLabel — string amigável pra UI do admin.
// Logado: "Fernando Franco <fer@gmail.com>" ou só email.
// Anônimo: "Visitante anônimo (anon_id curto)" ou "Desconhecido".
func (i IdentityFromHeaders) DisplayLabel() string {
	if i.UserName != "" && i.UserEmail != "" {
		return i.UserName + " <" + i.UserEmail + ">"
	}
	if i.UserEmail != "" {
		return i.UserEmail
	}
	if i.UserName != "" {
		return i.UserName
	}
	if i.AnonID != "" {
		short := i.AnonID
		if len(short) > 8 {
			short = short[:8]
		}
		return "Visitante anônimo (" + short + ")"
	}
	return "Desconhecido"
}

// ─── Validação ────────────────────────────────────────────────────────────

// emailRegex permissivo — só pra evitar lixo no banco. RFC compliance fica
// pro JWT/Authenticate.
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)

// uuidRegex aceita UUIDs com ou sem hifens, qualquer versão. Permite IDs
// curtos (>=8 chars) pra anon_ids legados.
var idRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]{8,80}$`)

func sanitizeEmail(s string) string {
	s = strings.TrimSpace(strings.ToLower(s))
	if len(s) > 254 || !emailRegex.MatchString(s) {
		return ""
	}
	return s
}

func sanitizeID(s string) string {
	s = strings.TrimSpace(s)
	if !idRegex.MatchString(s) {
		return ""
	}
	return s
}

func sanitizeName(s string) string {
	s = strings.TrimSpace(s)
	if len(s) > 120 {
		return s[:120]
	}
	// Remove caracteres de controle
	out := make([]rune, 0, len(s))
	for _, r := range s {
		if r >= 32 {
			out = append(out, r)
		}
	}
	return string(out)
}

// ─── Middleware ───────────────────────────────────────────────────────────

// IdentityHeadersMiddleware envolve um handler injetando IdentityFromHeaders
// no contexto. Falha silenciosa em headers inválidos — campos sanitizados
// que não passam ficam vazios (NÃO bloqueia a request).
func IdentityHeadersMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		id := IdentityFromHeaders{
			UserEmail: sanitizeEmail(r.Header.Get("X-FFV-User-Email")),
			UserID:    sanitizeID(r.Header.Get("X-FFV-User-Id")),
			UserName:  sanitizeName(r.Header.Get("X-FFV-User-Name")),
			AnonID:    sanitizeID(r.Header.Get("X-FFV-Anon-Id")),
			SessionID: sanitizeID(r.Header.Get("X-FFV-Session-Id")),
		}
		ctx := context.WithValue(r.Context(), identityHeadersKey{}, id)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// IdentityFromContext extrai a identidade dos X-FFV-* headers do contexto.
// Retorna zero value (`IdentityFromHeaders{}`) se o middleware não rodou.
func IdentityFromContext(ctx context.Context) IdentityFromHeaders {
	v, _ := ctx.Value(identityHeadersKey{}).(IdentityFromHeaders)
	return v
}
