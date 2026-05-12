//go:build security

// Threat model: navegadores podem ser usados para atacar usuários se headers
// críticos (CSP/HSTS/X-Frame-Options/etc) faltarem. Este arquivo valida o
// middleware SecurityHeaders sob diferentes condições (HTTP vs HTTPS, com vs
// sem proxy).
package security

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// dummyHandler responde 200 vazio — usado para inspecionar headers do middleware.
func dummyOKHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
}

func runWithSecurity(req *http.Request) *httptest.ResponseRecorder {
	rec := httptest.NewRecorder()
	middleware.SecurityHeaders(dummyOKHandler()).ServeHTTP(rec, req)
	return rec
}

func Test_Security_Headers_XContentTypeOptions_NoSniff(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := runWithSecurity(req)
	if got := rec.Header().Get("X-Content-Type-Options"); got != "nosniff" {
		t.Fatalf("X-Content-Type-Options esperado=nosniff got=%q", got)
	}
}

func Test_Security_Headers_XFrameOptions_Deny(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := runWithSecurity(req)
	if got := rec.Header().Get("X-Frame-Options"); got != "DENY" {
		t.Fatalf("X-Frame-Options esperado=DENY got=%q", got)
	}
}

func Test_Security_Headers_ReferrerPolicy(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := runWithSecurity(req)
	got := rec.Header().Get("Referrer-Policy")
	if got == "" {
		t.Fatalf("Referrer-Policy ausente")
	}
	// Aceita qualquer política sensata (não unsafe-url, não no-referrer-when-downgrade plain).
	if strings.Contains(got, "unsafe") {
		t.Fatalf("Referrer-Policy permissiva demais: %q", got)
	}
}

func Test_Security_Headers_NoServerVersionLeak(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := runWithSecurity(req)
	server := rec.Header().Get("Server")
	if server != "" && (strings.Contains(strings.ToLower(server), "go-http") ||
		strings.Contains(strings.ToLower(server), "nginx/") ||
		strings.Contains(server, "/")) {
		t.Fatalf("header Server vaza versão: %q", server)
	}
}

func Test_Security_Headers_NoXPoweredBy(t *testing.T) {
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := runWithSecurity(req)
	if got := rec.Header().Get("X-Powered-By"); got != "" {
		t.Fatalf("X-Powered-By presente — possível leak de tecnologia: %q", got)
	}
}

// HSTS deve ser emitido quando o request chega via HTTPS direto OU via proxy
// com X-Forwarded-Proto=https — caso contrário, fica omitido (correto em dev).
func Test_Security_Headers_HSTS_OnlyOnHTTPS(t *testing.T) {
	// Sem TLS, sem header de proxy: HSTS NÃO deve ser emitido.
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rec := runWithSecurity(req)
	if got := rec.Header().Get("Strict-Transport-Security"); got != "" {
		t.Fatalf("HSTS não deve aparecer em conexão HTTP plain, got=%q", got)
	}

	// Com X-Forwarded-Proto=https: HSTS deve aparecer.
	req2 := httptest.NewRequest(http.MethodGet, "/x", nil)
	req2.Header.Set("X-Forwarded-Proto", "https")
	rec2 := runWithSecurity(req2)
	if got := rec2.Header().Get("Strict-Transport-Security"); got == "" {
		t.Fatalf("HSTS esperado quando X-Forwarded-Proto=https")
	}
}
