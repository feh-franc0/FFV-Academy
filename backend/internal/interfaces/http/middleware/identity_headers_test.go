package middleware_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// ─── Captura ───────────────────────────────────────────────────────────────

func Test_IdentityHeaders_CapturesValidLoggedUser(t *testing.T) {
	var captured middleware.IdentityFromHeaders
	handler := middleware.IdentityHeadersMiddleware(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		captured = middleware.IdentityFromContext(r.Context())
	}))

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-FFV-User-Email", "Fer@Gmail.com")
	req.Header.Set("X-FFV-User-Id", "user-12345abc")
	req.Header.Set("X-FFV-User-Name", "Fernando Franco")
	req.Header.Set("X-FFV-Anon-Id", "anon-abcdef12")
	req.Header.Set("X-FFV-Session-Id", "sess-fedcba98")
	handler.ServeHTTP(httptest.NewRecorder(), req)

	if captured.UserEmail != "fer@gmail.com" {
		t.Errorf("email não normalizado pra lowercase: %q", captured.UserEmail)
	}
	if captured.UserID != "user-12345abc" {
		t.Errorf("user id mismatch: %q", captured.UserID)
	}
	if captured.UserName != "Fernando Franco" {
		t.Errorf("name mismatch: %q", captured.UserName)
	}
	if captured.AnonID != "anon-abcdef12" {
		t.Errorf("anon id mismatch: %q", captured.AnonID)
	}
	if captured.SessionID != "sess-fedcba98" {
		t.Errorf("session id mismatch: %q", captured.SessionID)
	}
	if !captured.IsLoggedIn() {
		t.Errorf("IsLoggedIn deveria ser true")
	}
}

func Test_IdentityHeaders_CapturesAnonOnly(t *testing.T) {
	var captured middleware.IdentityFromHeaders
	handler := middleware.IdentityHeadersMiddleware(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		captured = middleware.IdentityFromContext(r.Context())
	}))

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-FFV-Anon-Id", "anon-abc12345")
	req.Header.Set("X-FFV-Session-Id", "sess-12345abc")
	handler.ServeHTTP(httptest.NewRecorder(), req)

	if captured.UserEmail != "" || captured.UserID != "" {
		t.Errorf("anônimo não deve ter email/userID: %+v", captured)
	}
	if captured.IsLoggedIn() {
		t.Errorf("anônimo IsLoggedIn deveria ser false")
	}
	if captured.DisplayLabel() != "Visitante anônimo (anon-abc)" {
		t.Errorf("display label inesperado: %q", captured.DisplayLabel())
	}
}

func Test_IdentityHeaders_NoHeaders_DesconhecidoLabel(t *testing.T) {
	var captured middleware.IdentityFromHeaders
	handler := middleware.IdentityHeadersMiddleware(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		captured = middleware.IdentityFromContext(r.Context())
	}))

	handler.ServeHTTP(httptest.NewRecorder(), httptest.NewRequest(http.MethodGet, "/", http.NoBody))

	if captured.DisplayLabel() != "Desconhecido" {
		t.Errorf("sem headers, label deveria ser 'Desconhecido', got %q", captured.DisplayLabel())
	}
}

// ─── Sanitização ──────────────────────────────────────────────────────────

func Test_IdentityHeaders_RejectsMalformedEmail(t *testing.T) {
	var captured middleware.IdentityFromHeaders
	handler := middleware.IdentityHeadersMiddleware(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		captured = middleware.IdentityFromContext(r.Context())
	}))

	cases := []string{"not-an-email", "@", "missing@tld", "@no-local.com", "", "<script>x</script>@y.com"}
	for _, c := range cases {
		req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
		req.Header.Set("X-FFV-User-Email", c)
		handler.ServeHTTP(httptest.NewRecorder(), req)
		if captured.UserEmail != "" {
			t.Errorf("email malformado %q deveria sanitizar pra vazio, got %q", c, captured.UserEmail)
		}
	}
}

func Test_IdentityHeaders_RejectsShortOrInvalidID(t *testing.T) {
	var captured middleware.IdentityFromHeaders
	handler := middleware.IdentityHeadersMiddleware(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		captured = middleware.IdentityFromContext(r.Context())
	}))

	cases := []string{"abc", "123", "with space", "with;sql", ""}
	for _, c := range cases {
		req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
		req.Header.Set("X-FFV-Anon-Id", c)
		handler.ServeHTTP(httptest.NewRecorder(), req)
		if captured.AnonID != "" {
			t.Errorf("anon id %q inválido deveria sanitizar pra vazio, got %q", c, captured.AnonID)
		}
	}
}

func Test_IdentityHeaders_TruncatesAndStripsControlChars(t *testing.T) {
	var captured middleware.IdentityFromHeaders
	handler := middleware.IdentityHeadersMiddleware(http.HandlerFunc(func(_ http.ResponseWriter, r *http.Request) {
		captured = middleware.IdentityFromContext(r.Context())
	}))

	longName := ""
	for i := 0; i < 200; i++ {
		longName += "x"
	}
	longName += "\x00\x07evil"

	req := httptest.NewRequest(http.MethodGet, "/", http.NoBody)
	req.Header.Set("X-FFV-User-Name", longName)
	handler.ServeHTTP(httptest.NewRecorder(), req)

	if len(captured.UserName) > 120 {
		t.Errorf("nome deveria truncar em 120 chars, got %d", len(captured.UserName))
	}
	for _, r := range captured.UserName {
		if r < 32 {
			t.Errorf("char de controle não foi removido: %d", r)
		}
	}
}

// ─── DisplayLabel ─────────────────────────────────────────────────────────

func Test_IdentityFromHeaders_DisplayLabel_AllCases(t *testing.T) {
	cases := []struct {
		in   middleware.IdentityFromHeaders
		want string
	}{
		{middleware.IdentityFromHeaders{UserName: "Ana", UserEmail: "ana@x.com"}, "Ana <ana@x.com>"},
		{middleware.IdentityFromHeaders{UserEmail: "lone@x.com"}, "lone@x.com"},
		{middleware.IdentityFromHeaders{UserName: "Just Name"}, "Just Name"},
		{middleware.IdentityFromHeaders{AnonID: "abcdef12345"}, "Visitante anônimo (abcdef12)"},
		{middleware.IdentityFromHeaders{}, "Desconhecido"},
	}
	for _, c := range cases {
		got := c.in.DisplayLabel()
		if got != c.want {
			t.Errorf("DisplayLabel(%+v) = %q, want %q", c.in, got, c.want)
		}
	}
}
