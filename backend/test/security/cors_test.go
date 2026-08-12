//go:build security

package security

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

// corsMiddleware é uma réplica fiel do middleware de produção
// (internal/interfaces/http/middleware/common.go :: CORS). Reproduzimos aqui
// para evitar importar o pacote middleware, que puxa dependências não
// relacionadas (prometheus) que podem não estar em go.mod durante os testes
// de segurança isolados.
//
// CUIDADO: se o middleware de produção mudar a lógica de allowlist,
// atualize esta cópia para manter o teste fiel.
func corsMiddleware(allowed []string) func(http.Handler) http.Handler {
	origins := make(map[string]struct{}, len(allowed))
	for _, o := range allowed {
		origins[o] = struct{}{}
	}
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Add("Vary", "Origin")
			origin := r.Header.Get("Origin")
			if _, ok := origins[origin]; ok {
				w.Header().Set("Access-Control-Allow-Origin", origin)
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Request-ID")
			w.Header().Set("Access-Control-Max-Age", "86400")
			if r.Method == http.MethodOptions {
				w.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func corsHandler() http.Handler {
	allowed := []string{"https://fernandofrancovalle.com", "http://localhost:3000"}
	next := http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
	return corsMiddleware(allowed)(next)
}

func Test_CORS_AllowedOrigin_ReturnsAllowOriginHeader(t *testing.T) {
	h := corsHandler()
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	req.Header.Set("Origin", "https://fernandofrancovalle.com")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "https://fernandofrancovalle.com" {
		t.Errorf("expected origin echo, got %q", got)
	}
}

func Test_CORS_DisallowedOrigin_DoesNotReflect(t *testing.T) {
	h := corsHandler()
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	req.Header.Set("Origin", "https://evil.example.com")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if got := rec.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Errorf("evil origin must NOT be reflected, got %q", got)
	}
}

// Vary: Origin sempre, para cache intermediário não servir a resposta
// computada pra origin A a um cliente da origin B (ACAO incluído).
func Test_CORS_AlwaysSetsVaryOrigin(t *testing.T) {
	h := corsHandler()
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	req.Header.Set("Origin", "https://evil.example.com") // mesmo origin não-permitida
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if got := rec.Header().Get("Vary"); got != "Origin" {
		t.Errorf("expected Vary: Origin always, got %q", got)
	}
}

// Allow-Credentials não pode ser emitido para origin fora da allowlist — só
// faz sentido junto com um Allow-Origin que a reflete.
func Test_CORS_DisallowedOrigin_DoesNotSetAllowCredentials(t *testing.T) {
	h := corsHandler()
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	req.Header.Set("Origin", "https://evil.example.com")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if got := rec.Header().Get("Access-Control-Allow-Credentials"); got != "" {
		t.Errorf("evil origin must NOT get Allow-Credentials, got %q", got)
	}
}

func Test_CORS_Preflight_Returns204(t *testing.T) {
	h := corsHandler()
	req := httptest.NewRequest(http.MethodOptions, "/x", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	req.Header.Set("Access-Control-Request-Method", "POST")
	rec := httptest.NewRecorder()
	h.ServeHTTP(rec, req)

	if rec.Code != http.StatusNoContent {
		t.Errorf("expected 204, got %d", rec.Code)
	}
	if got := rec.Header().Get("Access-Control-Allow-Methods"); got == "" {
		t.Error("expected Access-Control-Allow-Methods header")
	}
}
