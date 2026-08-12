package middleware

import (
	"context"
	"net/http"
	"net/http/httptest"
	"strconv"
	"strings"
	"sync"
	"testing"
	"time"
)

// fakeAuditLogger é um AuditLogger de teste — grava as entradas recebidas e
// sinaliza em `done` a cada inserção, para que os testes possam esperar a
// entrega do worker assíncrono sem sleep arbitrário.
type fakeAuditLogger struct {
	mu      sync.Mutex
	entries []AuditEntry
	done    chan struct{}
}

func newFakeAuditLogger() *fakeAuditLogger {
	return &fakeAuditLogger{done: make(chan struct{}, 64)}
}

func (f *fakeAuditLogger) InsertAuditEntry(_ context.Context, entry AuditEntry) error {
	f.mu.Lock()
	f.entries = append(f.entries, entry)
	f.mu.Unlock()
	f.done <- struct{}{}
	return nil
}

func (f *fakeAuditLogger) waitForEntry(t *testing.T) {
	t.Helper()
	select {
	case <-f.done:
	case <-time.After(2 * time.Second):
		t.Fatal("timeout esperando o worker de auditoria entregar a entrada")
	}
}

func (f *fakeAuditLogger) snapshot() []AuditEntry {
	f.mu.Lock()
	defer f.mu.Unlock()
	out := make([]AuditEntry, len(f.entries))
	copy(out, f.entries)
	return out
}

func statusEchoHandler() http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		status, err := strconv.Atoi(r.Header.Get("X-Test-Status"))
		if err != nil {
			status = http.StatusOK
		}
		w.WriteHeader(status)
	})
}

// Test_AuditLog_Default_OnlyRecords2xx trava o comportamento histórico: sem
// IncludeFailures, uma resposta 401 nunca chega ao repositório de auditoria.
func Test_AuditLog_Default_OnlyRecords2xx(t *testing.T) {
	logger := newFakeAuditLogger()
	handler := AuditLog(logger)(statusEchoHandler())

	// 401 — não deve gerar entrada.
	failReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/verify", nil)
	failReq.Header.Set("X-Test-Status", "401")
	handler.ServeHTTP(httptest.NewRecorder(), failReq)

	// 200 — deve gerar entrada. Esperar por ela prova, por ordenação de
	// canal, que a 401 (que nunca é submetida ao worker) não vai aparecer.
	okReq := httptest.NewRequest(http.MethodPost, "/api/v1/auth/verify", nil)
	okReq.Header.Set("X-Test-Status", "200")
	handler.ServeHTTP(httptest.NewRecorder(), okReq)
	logger.waitForEntry(t)

	entries := logger.snapshot()
	if len(entries) != 1 {
		t.Fatalf("esperava exatamente 1 entrada (só a 2xx), vieram %d: %+v", len(entries), entries)
	}
	if entries[0].StatusCode != http.StatusOK {
		t.Fatalf("esperava a entrada da resposta 200, veio status %d", entries[0].StatusCode)
	}
}

// Test_AuditLog_IncludeFailures_RecordsLoginFailure é o teste da tarefa 4.3
// do pack limites-de-recurso-e-auditoria (achado P-13): uma tentativa de
// login que falha (código errado/expirado) DEVE gerar uma linha de
// auditoria — antes da correção, /api/v1/auth/* não tinha NENHUMA trilha,
// sucesso ou falha.
func Test_AuditLog_IncludeFailures_RecordsLoginFailure(t *testing.T) {
	logger := newFakeAuditLogger()
	handler := AuditLog(logger, AuditLogOptions{IncludeFailures: true})(statusEchoHandler())

	r := httptest.NewRequest(http.MethodPost, "/api/v1/auth/verify", nil)
	r.Header.Set("X-Test-Status", "401") // código errado/expirado
	handler.ServeHTTP(httptest.NewRecorder(), r)
	logger.waitForEntry(t)

	entries := logger.snapshot()
	if len(entries) != 1 {
		t.Fatalf("esperava 1 entrada para a tentativa de login falha, vieram %d", len(entries))
	}
	if entries[0].StatusCode != http.StatusUnauthorized {
		t.Fatalf("esperava status 401 registrado, veio %d", entries[0].StatusCode)
	}
	if entries[0].Action != "POST /api/v1/auth/verify" {
		t.Fatalf("Action inesperada: %q", entries[0].Action)
	}
}

// Test_AuditLog_MaliciousRequestID_NeverReachesAuditEntry é a metade
// "auditoria" da tarefa 4.2: um X-Request-ID com quebra de linha, que
// chegaria cru numa linha de auditoria em texto simples, é substituído pelo
// RequestID middleware ANTES do AuditLog rodar — a cadeia real de
// middlewares (RequestID → ... → AuditLog) garante que o valor gravado é
// sempre o ID sanitizado, nunca o header do cliente.
func Test_AuditLog_MaliciousRequestID_NeverReachesAuditEntry(t *testing.T) {
	logger := newFakeAuditLogger()
	handler := RequestID(AuditLog(logger, AuditLogOptions{IncludeFailures: true})(statusEchoHandler()))

	r := httptest.NewRequest(http.MethodPost, "/api/v1/auth/verify", nil)
	r.Header.Set("X-Test-Status", "401")
	r.Header.Set("X-Request-ID", "legit-id\nfake_audit_line action=\"DELETE /api/v1/me\" status=200")
	handler.ServeHTTP(httptest.NewRecorder(), r)
	logger.waitForEntry(t)

	entries := logger.snapshot()
	if len(entries) != 1 {
		t.Fatalf("esperava 1 entrada, vieram %d", len(entries))
	}
	if strings.Contains(entries[0].RequestID, "\n") {
		t.Fatalf("RequestID malicioso propagado cru para a auditoria: %q", entries[0].RequestID)
	}
	if entries[0].RequestID == "legit-id\nfake_audit_line action=\"DELETE /api/v1/me\" status=200" {
		t.Fatal("valor malicioso não foi substituído antes de chegar na auditoria")
	}
}
