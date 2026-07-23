// Testes do GET /api/v1/study-requests/{id}/status — endpoint público.
//
// PADRÃO: Contract tests — mock do StatusReader, sem DB.
package handlers_test

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── Mock do StatusReader ──────────────────────────────────────────────────

type mockStatusReader struct {
	req *domsr.StudyRequest
	err error
}

func (m *mockStatusReader) FindByID(_ context.Context, _ domsr.ID) (*domsr.StudyRequest, error) {
	return m.req, m.err
}

// compile-time check
var _ handlers.StatusReader = (*mockStatusReader)(nil)

// helper — monta StudyRequest via Reconstitute pra testes
func newTestReq(id string, status domsr.Status, createdAt time.Time) *domsr.StudyRequest {
	return domsr.Reconstitute(
		domsr.ID(id),
		"",
		"Maria",
		"maria@test.dev",
		"",
		"medicina-veterinaria",
		"",
		"genética",
		"",
		"quero estudar genética animal",
		status,
		"",
		false,
		nil,
		createdAt,
		createdAt,
	)
}

// helper — monta request HTTP + chi context com {id}
func newStatusReq(id string) *http.Request {
	req := httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/v1/study-requests/%s/status", id), http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("id", id)
	return req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
}

// ─── Testes ──────────────────────────────────────────────────────────────

func Test_StudyRequestHandler_GetStatus_Pending_Returns_Received(t *testing.T) {
	reader := &mockStatusReader{
		req: newTestReq("abc-123", domsr.StatusPending, time.Now().UTC()),
	}
	h := handlers.NewStudyRequestHandler(nil).WithStatusReader(reader)

	req := newStatusReq("abc-123")
	w := httptest.NewRecorder()
	h.GetStatus(w, req)

	if w.Code != http.StatusOK {
		t.Fatalf("esperado 200, got %d: %s", w.Code, w.Body.String())
	}
	var dto struct {
		ID          string    `json:"id"`
		Status      string    `json:"status"`
		SubmittedAt time.Time `json:"submittedAt"`
		EtaHoursMax int       `json:"etaHoursMax"`
		EtaHoursAvg int       `json:"etaHoursAvg"`
	}
	if err := json.NewDecoder(w.Body).Decode(&dto); err != nil {
		t.Fatalf("JSON inválido: %v", err)
	}
	if dto.Status != "received" {
		t.Errorf("status: esperado 'received', got %q", dto.Status)
	}
	if dto.ID != "abc-123" {
		t.Errorf("id: esperado abc-123, got %q", dto.ID)
	}
	if dto.EtaHoursMax != 24 {
		t.Errorf("etaHoursMax: esperado 24, got %d", dto.EtaHoursMax)
	}
	if dto.EtaHoursAvg != 12 {
		t.Errorf("etaHoursAvg: esperado 12, got %d", dto.EtaHoursAvg)
	}
}

func Test_StudyRequestHandler_GetStatus_StatusMapping(t *testing.T) {
	cases := []struct {
		domain   domsr.Status
		expected string
	}{
		{domsr.StatusPending, "received"},
		{domsr.StatusInReview, "received"},
		{domsr.StatusInProduction, "curating"},
		{domsr.StatusReady, "delivered"},
		{domsr.StatusRejected, "rejected"},
	}
	for _, c := range cases {
		t.Run(string(c.domain), func(t *testing.T) {
			reader := &mockStatusReader{req: newTestReq("xyz", c.domain, time.Now())}
			h := handlers.NewStudyRequestHandler(nil).WithStatusReader(reader)
			req := newStatusReq("xyz")
			w := httptest.NewRecorder()
			h.GetStatus(w, req)
			if w.Code != http.StatusOK {
				t.Fatalf("esperado 200, got %d", w.Code)
			}
			var dto struct {
				Status string `json:"status"`
			}
			_ = json.NewDecoder(w.Body).Decode(&dto)
			if dto.Status != c.expected {
				t.Errorf("status: esperado %q, got %q", c.expected, dto.Status)
			}
		})
	}
}

func Test_StudyRequestHandler_GetStatus_NotFound_Returns404(t *testing.T) {
	reader := &mockStatusReader{err: fmt.Errorf("%w: study request", shared.ErrNotFound)}
	h := handlers.NewStudyRequestHandler(nil).WithStatusReader(reader)
	req := newStatusReq("nao-existe")
	w := httptest.NewRecorder()
	h.GetStatus(w, req)
	if w.Code != http.StatusNotFound {
		t.Errorf("esperado 404, got %d", w.Code)
	}
}

func Test_StudyRequestHandler_GetStatus_NoReader_Returns503(t *testing.T) {
	// Handler sem WithStatusReader
	h := handlers.NewStudyRequestHandler(nil)
	req := newStatusReq("qualquer")
	w := httptest.NewRecorder()
	h.GetStatus(w, req)
	if w.Code != http.StatusServiceUnavailable {
		t.Errorf("esperado 503, got %d", w.Code)
	}
}

func Test_StudyRequestHandler_GetStatus_NoID_Returns400(t *testing.T) {
	reader := &mockStatusReader{req: newTestReq("x", domsr.StatusPending, time.Now())}
	h := handlers.NewStudyRequestHandler(nil).WithStatusReader(reader)

	// Sem chi context com {id}
	req := httptest.NewRequest(http.MethodGet, "/api/v1/study-requests//status", http.NoBody)
	w := httptest.NewRecorder()
	h.GetStatus(w, req)
	if w.Code != http.StatusBadRequest {
		t.Errorf("esperado 400, got %d", w.Code)
	}
}

func Test_StudyRequestHandler_GetStatus_DoesNotLeakPII(t *testing.T) {
	// Garante que email/nome/descrição NÃO aparecem no payload
	reader := &mockStatusReader{
		req: newTestReq("abc", domsr.StatusInProduction, time.Now()),
	}
	h := handlers.NewStudyRequestHandler(nil).WithStatusReader(reader)
	req := newStatusReq("abc")
	w := httptest.NewRecorder()
	h.GetStatus(w, req)
	body := w.Body.String()
	for _, leak := range []string{"maria@test.dev", "Maria", "quero estudar genética animal"} {
		if contains(body, leak) {
			t.Errorf("body vazou PII %q: %s", leak, body)
		}
	}
}

func Test_StudyRequestHandler_GetStatus_SetsCacheControl(t *testing.T) {
	reader := &mockStatusReader{req: newTestReq("x", domsr.StatusReady, time.Now())}
	h := handlers.NewStudyRequestHandler(nil).WithStatusReader(reader)
	req := newStatusReq("x")
	w := httptest.NewRecorder()
	h.GetStatus(w, req)
	if cc := w.Header().Get("Cache-Control"); cc == "" {
		t.Error("esperado Cache-Control header")
	}
}

func Test_StudyRequestHandler_GetStatus_RepoError_Returns500(t *testing.T) {
	reader := &mockStatusReader{err: errors.New("conexão perdida")}
	h := handlers.NewStudyRequestHandler(nil).WithStatusReader(reader)
	req := newStatusReq("x")
	w := httptest.NewRecorder()
	h.GetStatus(w, req)
	if w.Code == http.StatusOK {
		t.Error("esperado erro, got 200")
	}
}

// helper local — strings.Contains evita import
func contains(s, sub string) bool {
	if len(sub) == 0 {
		return true
	}
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return true
		}
	}
	return false
}
