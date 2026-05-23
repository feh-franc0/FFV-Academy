// Package middleware contém os middlewares HTTP da aplicação.
package middleware

import (
	"context"
	"log/slog"
	"net/http"
	"strings"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/infrastructure/auth"
	"github.com/fernandofv/api/internal/interfaces/http/httputil"
)

type ctxKey string

const (
	CtxKeyUserID ctxKey = "user_id"
	CtxKeyRole   ctxKey = "role"
	CtxKeyEmail  ctxKey = "email"
)

// Authenticate valida o JWT do header Authorization e injeta o userID no contexto.
// Retorna 401 se o token for inválido ou ausente.
func Authenticate(jwtSvc *auth.JWTService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw := extractBearerToken(r)
			if raw == "" {
				httputil.WriteError(w, http.StatusUnauthorized, "token ausente", "missing-token")
				return
			}

			claims, err := jwtSvc.ValidateAccessToken(raw)
			if err != nil {
				httputil.WriteError(w, http.StatusUnauthorized, "token inválido", "invalid-token")
				return
			}

			ctx := context.WithValue(r.Context(), CtxKeyUserID, shared.UserID(claims.Subject))
			ctx = context.WithValue(ctx, CtxKeyRole, claims.Role)
			ctx = context.WithValue(ctx, CtxKeyEmail, claims.Email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// RequireAdmin verifica se o usuário autenticado tem role=admin.
//
// IMPORTANTE: Este middleware DEVE ser usado após Authenticate. Se chamado sem
// Authenticate, o contexto não terá CtxKeyRole e o acesso será negado com 403
// (comportamento seguro — falha fechada). Mas um log de warning é emitido para
// detectar má configuração de rota.
//
// Compatibilidade: mantém assinatura "RequireAdmin(next http.Handler) http.Handler"
// pra rotas legadas. Não impõe email allowlist nesse caminho — pra defesa em
// profundidade, use RequireAdminWithAllowlist(emails).
func RequireAdmin(next http.Handler) http.Handler {
	return RequireAdminWithAllowlist(nil)(next)
}

// RequireAdminWithAllowlist é a versão hardened do RequireAdmin: além de
// exigir role=admin (do JWT), exige que o email do usuário esteja numa
// allowlist explícita.
//
// Defesa em profundidade: caso um atacante consiga setar role='admin' no DB
// (SQL injection, dump+restore, etc), ainda assim falha aqui porque o email
// não está na allowlist — que vive em env var, fora do DB.
//
// Se allowedEmails for nil ou vazio, a checagem extra é PULADA (modo "só DB",
// compatível com dev/test). Em produção SEMPRE passar a allowlist.
func RequireAdminWithAllowlist(allowedEmails []string) func(http.Handler) http.Handler {
	// Normaliza pra map de lookup O(1) com chaves lowercased.
	allow := make(map[string]struct{}, len(allowedEmails))
	for _, e := range allowedEmails {
		e = strings.ToLower(strings.TrimSpace(e))
		if e != "" {
			allow[e] = struct{}{}
		}
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			roleVal := r.Context().Value(CtxKeyRole)
			if roleVal == nil {
				slog.Warn("RequireAdmin chamado sem Authenticate ter rodado",
					"path", r.URL.Path,
					"method", r.Method,
					"request_id", w.Header().Get("X-Request-ID"),
				)
				httputil.WriteError(w, http.StatusForbidden, "acesso negado", "forbidden")
				return
			}
			role, ok := roleVal.(string)
			if !ok || role != "admin" {
				httputil.WriteError(w, http.StatusForbidden, "acesso negado", "forbidden")
				return
			}

			// Defesa em profundidade: se allowlist está configurada, exige email.
			if len(allow) > 0 {
				emailVal, _ := r.Context().Value(CtxKeyEmail).(string)
				emailLower := strings.ToLower(strings.TrimSpace(emailVal))
				if _, ok := allow[emailLower]; !ok {
					slog.Warn("admin token com email fora da allowlist",
						"email", emailLower,
						"path", r.URL.Path,
						"request_id", w.Header().Get("X-Request-ID"),
					)
					httputil.WriteError(w, http.StatusForbidden, "acesso negado", "forbidden")
					return
				}
			}

			next.ServeHTTP(w, r)
		})
	}
}

// MaybeAuthenticate é como Authenticate, mas NÃO falha quando o token está
// ausente ou é inválido — apenas não injeta o userID no contexto.
//
// Use em endpoints públicos que QUEREM saber se há um user logado (ex.: GET
// /api/v1/comments retorna o userVote do usuário atual quando autenticado,
// mas funciona pra anônimos também).
func MaybeAuthenticate(jwtSvc *auth.JWTService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			raw := extractBearerToken(r)
			if raw == "" {
				next.ServeHTTP(w, r) // anônimo — segue sem injetar contexto
				return
			}
			claims, err := jwtSvc.ValidateAccessToken(raw)
			if err != nil {
				next.ServeHTTP(w, r) // token ruim — trata como anônimo (não 401)
				return
			}
			ctx := context.WithValue(r.Context(), CtxKeyUserID, shared.UserID(claims.Subject))
			ctx = context.WithValue(ctx, CtxKeyRole, claims.Role)
			ctx = context.WithValue(ctx, CtxKeyEmail, claims.Email)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

// UserIDFromContext extrai o UserID do contexto. Panic se não existir (uso incorreto).
func UserIDFromContext(ctx context.Context) shared.UserID {
	id, _ := ctx.Value(CtxKeyUserID).(shared.UserID)
	return id
}

// IsAdminFromContext retorna true se o usuário autenticado tem role=admin.
// Útil para handlers que precisam de check condicional (ex: delete próprio
// comentário vs. admin moderando) sem segregar rota.
func IsAdminFromContext(ctx context.Context) bool {
	role, _ := ctx.Value(CtxKeyRole).(string)
	return role == "admin"
}

func extractBearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(h, "Bearer ")
}
