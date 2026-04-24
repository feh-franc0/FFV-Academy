// Package middleware contém os middlewares HTTP da aplicação.
package middleware

import (
	"context"
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
func RequireAdmin(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		role, _ := r.Context().Value(CtxKeyRole).(string)
		if role != "admin" {
			httputil.WriteError(w, http.StatusForbidden, "acesso negado", "forbidden")
			return
		}
		next.ServeHTTP(w, r)
	})
}

// UserIDFromContext extrai o UserID do contexto. Panic se não existir (uso incorreto).
func UserIDFromContext(ctx context.Context) shared.UserID {
	id, _ := ctx.Value(CtxKeyUserID).(shared.UserID)
	return id
}

func extractBearerToken(r *http.Request) string {
	h := r.Header.Get("Authorization")
	if !strings.HasPrefix(h, "Bearer ") {
		return ""
	}
	return strings.TrimPrefix(h, "Bearer ")
}
