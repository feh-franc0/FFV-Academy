package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

// Test_RequestID_MaliciousHeader_ReplacedWithServerGenerated é a metade
// "log" da tarefa 4.2 do pack limites-de-recurso-e-auditoria (achado P-13):
// X-Request-ID fornecido pelo cliente era ecoado sem validação em cada linha
// de log — um valor com quebra de linha ou caractere de controle é
// log-injection contra qualquer consumidor de log em texto puro
// (journalctl, docker logs) que não escapa por linha como o slog faz.
func Test_RequestID_MaliciousHeader_ReplacedWithServerGenerated(t *testing.T) {
	var capturedID string
	handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		capturedID = RequestIDFromContext(r.Context())
	}))

	r := httptest.NewRequest(http.MethodGet, "/", nil)
	malicious := "abc\nINJECTED forged-log-line status=200"
	r.Header.Set("X-Request-ID", malicious)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)

	if strings.Contains(capturedID, "\n") {
		t.Fatalf("ID malicioso propagado cru para o contexto (logs/auditoria leem daqui): %q", capturedID)
	}
	if capturedID == malicious {
		t.Fatal("valor malicioso não foi substituído por um ID gerado no servidor")
	}
	if got := w.Header().Get("X-Request-ID"); got != capturedID {
		t.Fatalf("header de resposta (%q) deveria ecoar o mesmo ID sanitizado do contexto (%q)", got, capturedID)
	}
}

// Test_RequestID_ValidHeader_Preserved garante que a validação não é tão
// estrita a ponto de rejeitar IDs legítimos — o formato aceito cobre UUID e
// qualquer ID curto alfanumérico com hífen.
func Test_RequestID_ValidHeader_Preserved(t *testing.T) {
	cases := []string{
		"550e8400-e29b-41d4-a716-446655440000",
		"client-abc-123",
		"a",
	}
	for _, id := range cases {
		handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
		r := httptest.NewRequest(http.MethodGet, "/", nil)
		r.Header.Set("X-Request-ID", id)
		w := httptest.NewRecorder()
		handler.ServeHTTP(w, r)

		if got := w.Header().Get("X-Request-ID"); got != id {
			t.Fatalf("ID válido %q deveria ser preservado, veio %q", id, got)
		}
	}
}

// Test_RequestID_EmptyHeader_GeneratesServerSideID cobre o caso original
// (sem X-Request-ID nenhum) — continua gerando um UUID normalmente.
func Test_RequestID_EmptyHeader_GeneratesServerSideID(t *testing.T) {
	handler := RequestID(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	r := httptest.NewRequest(http.MethodGet, "/", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, r)

	if w.Header().Get("X-Request-ID") == "" {
		t.Fatal("esperava um X-Request-ID gerado no servidor quando o cliente não envia nenhum")
	}
}
