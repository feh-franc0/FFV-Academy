//go:build security

// Threat model: atacantes tentam acessar endpoints protegidos sem auth, com
// auth malformado, expirado, ou em local errado (query string em vez de
// header). Este arquivo valida os middlewares Authenticate e RequireAdmin.
package security

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// passthrough sempre devolve 200 — usado para confirmar que o middleware NÃO
// bloqueia quando deveria permitir, e para detectar quando bloqueia.
func passthrough() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"ok":true}`))
	})
}

func Test_Security_ProtectedRoute_NoAuth_Returns401(t *testing.T) {
	svc := newTestJWTService()
	h := middleware.Authenticate(svc)(passthrough())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401 sem Authorization, got %d body=%s", rec.Code, rec.Body.String())
	}
}

func Test_Security_ProtectedRoute_MalformedHeader_Returns401(t *testing.T) {
	svc := newTestJWTService()
	h := middleware.Authenticate(svc)(passthrough())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	req.Header.Set("Authorization", "Bearer") // sem token após "Bearer"
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401 para Authorization=\"Bearer\", got %d", rec.Code)
	}
}

func Test_Security_ProtectedRoute_InvalidScheme_Returns401(t *testing.T) {
	svc := newTestJWTService()
	h := middleware.Authenticate(svc)(passthrough())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	req.Header.Set("Authorization", "Basic dXNlcjpwYXNz")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("esperado 401 com scheme=Basic, got %d", rec.Code)
	}
}

func Test_Security_ProtectedRoute_ExpiredToken_Returns401(t *testing.T) {
	tok, err := issueExpiredToken("u-expired")
	if err != nil {
		t.Fatalf("issue expired: %v", err)
	}
	// Valida com um SERVIÇO QUE COMPARTILHA secret — token está
	// estruturalmente correto, mas exp já passou; lib deve rejeitar.
	svc := newTestJWTService()
	h := middleware.Authenticate(svc)(passthrough())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("token expirado deve dar 401, got %d body=%s", rec.Code, rec.Body.String())
	}
}

func Test_Security_AdminRoute_NonAdmin_Returns403(t *testing.T) {
	svc := newTestJWTService()
	tok, err := issueUserToken(svc, "u-normal")
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	// Authenticate → RequireAdmin → passthrough.
	chain := middleware.Authenticate(svc)(middleware.RequireAdmin(passthrough()))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/stats", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	rec := httptest.NewRecorder()
	chain.ServeHTTP(rec, req)

	if rec.Code != http.StatusForbidden {
		t.Fatalf("usuário comum em /admin → esperado 403, got %d", rec.Code)
	}
}

func Test_Security_AdminRoute_NoAuth_Returns401(t *testing.T) {
	svc := newTestJWTService()
	chain := middleware.Authenticate(svc)(middleware.RequireAdmin(passthrough()))

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/stats", nil)
	rec := httptest.NewRecorder()
	chain.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("admin endpoint sem auth → 401, got %d", rec.Code)
	}
}

// Token só pode vir via Authorization header — query string DEVE ser ignorada
// para evitar leak via logs de proxy/CDN e via referer.
func Test_Security_TokenInQueryString_Rejected(t *testing.T) {
	svc := newTestJWTService()
	tok, err := issueUserToken(svc, "u-1")
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	chain := middleware.Authenticate(svc)(passthrough())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me?access_token="+tok, nil)
	// Sem header Authorization de propósito.
	rec := httptest.NewRecorder()
	chain.ServeHTTP(rec, req)

	if rec.Code != http.StatusUnauthorized {
		t.Fatalf("token via ?access_token deve ser ignorado → 401, got %d", rec.Code)
	}
}

// Confirma o caminho feliz: token válido no header → middleware passa adiante.
// (Não é um teste de ataque, mas evita falso positivo nos demais.)
func Test_Security_ValidToken_PassesThrough(t *testing.T) {
	svc := newTestJWTService()
	tok, err := issueUserToken(svc, "u-1")
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	chain := middleware.Authenticate(svc)(passthrough())

	req := httptest.NewRequest(http.MethodGet, "/api/v1/me", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	rec := httptest.NewRecorder()
	chain.ServeHTTP(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("token válido deve passar; got %d body=%s", rec.Code, rec.Body.String())
	}
}
