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
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Verificação explícita em duas etapas:
		// 1. Checa se a chave existe no contexto (Authenticate foi chamado?).
		// 2. Checa se o valor é "admin".
		// Isso distingue "usuário sem role admin" de "middleware mal configurado".
		roleVal := r.Context().Value(CtxKeyRole)
		if roleVal == nil {
			// Contexto sem CtxKeyRole indica que Authenticate não rodou antes deste middleware.
			// Logar como warning — é um erro de configuração de rota, não comportamento normal.
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
		next.ServeHTTP(w, r)
	})
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
