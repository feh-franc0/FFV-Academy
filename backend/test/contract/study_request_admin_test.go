// Package contract_test — testes HTTP dos endpoints admin de StudyRequest.
//
// Padrão: handler real + mocks inline (sem Docker). Auth middleware NÃO é
// exercitado aqui (já coberto em test/security/) — chamamos handler direto.
package contract_test

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	appsr "github.com/fernandofv/api/internal/application/studyrequest"
	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── Mocks inline ──────────────────────────────────────────────────

type srStubRepo struct {
	items map[domsr.ID]*domsr.StudyRequest
}

func newSRStubRepo() *srStubRepo {
	return &srStubRepo{items: map[domsr.ID]*domsr.StudyRequest{}}
}

func (r *srStubRepo) Save(_ context.Context, req *domsr.StudyRequest) error {
	r.items[req.ID()] = req
	return nil
}

func (r *srStubRepo) FindByID(_ context.Context, id domsr.ID) (*domsr.StudyRequest, error) {
	req, ok := r.items[id]
	if !ok {
		return nil, shared.NewNotFoundError("study_request")
	}
	return req, nil
}

func (r *srStubRepo) Update(_ context.Context, req *domsr.StudyRequest) error {
	r.items[req.ID()] = req
	return nil
}

func (r *srStubRepo) List(_ context.Context, f domsr.Filter) ([]*domsr.StudyRequest, int64, error) {
	out := []*domsr.StudyRequest{}
	for _, item := range r.items {
		if f.Status != "" && item.Status() != f.Status {
			continue
		}
		if f.StudyArea != "" && item.StudyArea() != f.StudyArea {
			continue
		}
		out = append(out, item)
	}
	return out, int64(len(out)), nil
}

type srStubStorage struct {
	content map[string][]byte
}

func (s *srStubStorage) Open(_ context.Context, url string) (io.ReadCloser, error) {
	data, ok := s.content[url]
	if !ok {
		return nil, shared.NewNotFoundError("attachment")
	}
	return io.NopCloser(bytes.NewReader(data)), nil
}

// ─── Helpers ───────────────────────────────────────────────────────

func buildAdminHandler(t *testing.T) (*handlers.StudyRequestAdminHandler, *srStubRepo, shared.Clock) {
	t.Helper()
	repo := newSRStubRepo()
	clk := shared.FixedClock{T: time.Date(2026, 5, 17, 12, 0, 0, 0, time.UTC)}
	list := appsr.NewListUseCase(repo)
	get := appsr.NewGetUseCase(repo)
	update := appsr.NewUpdateUseCase(repo, clk)
	storage := &srStubStorage{content: map[string][]byte{}}
	h := handlers.NewStudyRequestAdminHandler(list, get, update).WithStorage(storage)
	// expose storage to caller (via closure pattern not needed — we expose via type assertion)
	return h, repo, clk
}

func makeRequest(t *testing.T, repo *srStubRepo, clk shared.Clock) *domsr.StudyRequest {
	t.Helper()
	req, err := domsr.New(domsr.Input{
		Name:        "Maria",
		Email:       "maria@example.com",
		StudyArea:   "medicina-veterinaria",
		Subject:     "Genética animal",
		Description: "Preciso revisar antes da prova",
	}, clk.Now())
	require.NoError(t, err)
	require.NoError(t, repo.Save(context.Background(), req))
	return req
}

// ─── Tests ─────────────────────────────────────────────────────────

func Test_AdminList_ReturnsAll(t *testing.T) {
	h, repo, clk := buildAdminHandler(t)
	makeRequest(t, repo, clk)
	makeRequest(t, repo, clk)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/study-requests", nil)
	rec := httptest.NewRecorder()
	h.List(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	var body struct {
		Data  []map[string]any `json:"data"`
		Total int64            `json:"total"`
	}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.Equal(t, int64(2), body.Total)
	assert.Len(t, body.Data, 2)
}

func Test_AdminList_FiltersByStatus(t *testing.T) {
	h, repo, clk := buildAdminHandler(t)
	makeRequest(t, repo, clk) // pending

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/study-requests?status=ready", nil)
	rec := httptest.NewRecorder()
	h.List(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	var body struct {
		Total int64 `json:"total"`
	}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.Equal(t, int64(0), body.Total)
}

func Test_AdminList_RejectsInvalidStatus(t *testing.T) {
	h, _, _ := buildAdminHandler(t)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/study-requests?status=garbage", nil)
	rec := httptest.NewRecorder()
	h.List(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_AdminGet_ReturnsDetailWithAttachments(t *testing.T) {
	h, repo, clk := buildAdminHandler(t)
	stored := makeRequest(t, repo, clk)
	att, _ := domsr.NewAttachment("notas.pdf", "application/pdf", 1024, "file:///fake", clk.Now())
	require.NoError(t, stored.AttachFile(att))
	require.NoError(t, repo.Update(context.Background(), stored))

	r := chi.NewRouter()
	r.Get("/api/v1/admin/study-requests/{id}", h.Get)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/study-requests/"+stored.ID().String(), nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	var body map[string]any
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.Equal(t, "Maria", body["name"])
	assert.Equal(t, stored.ID().String(), body["id"])
	atts := body["attachments"].([]any)
	assert.Len(t, atts, 1)
}

func Test_AdminGet_NotFound(t *testing.T) {
	h, _, _ := buildAdminHandler(t)
	r := chi.NewRouter()
	r.Get("/api/v1/admin/study-requests/{id}", h.Get)
	req := httptest.NewRequest(http.MethodGet, "/api/v1/admin/study-requests/does-not-exist", nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusNotFound, rec.Code)
}

func Test_AdminUpdate_ChangesStatus(t *testing.T) {
	h, repo, clk := buildAdminHandler(t)
	stored := makeRequest(t, repo, clk)

	patch := map[string]any{"status": "in_production"}
	body, _ := json.Marshal(patch)

	r := chi.NewRouter()
	r.Patch("/api/v1/admin/study-requests/{id}", h.Update)

	req := httptest.NewRequest(http.MethodPatch, "/api/v1/admin/study-requests/"+stored.ID().String(), bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	updated := repo.items[stored.ID()]
	assert.Equal(t, domsr.StatusInProduction, updated.Status())
}

func Test_AdminUpdate_RejectsInvalidStatus(t *testing.T) {
	h, repo, clk := buildAdminHandler(t)
	stored := makeRequest(t, repo, clk)

	body, _ := json.Marshal(map[string]any{"status": "garbage"})
	r := chi.NewRouter()
	r.Patch("/api/v1/admin/study-requests/{id}", h.Update)
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/admin/study-requests/"+stored.ID().String(), bytes.NewReader(body))
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_AdminUpdate_UpdatesNotes(t *testing.T) {
	h, repo, clk := buildAdminHandler(t)
	stored := makeRequest(t, repo, clk)

	body, _ := json.Marshal(map[string]any{"internalNotes": "VIP — priorizar"})
	r := chi.NewRouter()
	r.Patch("/api/v1/admin/study-requests/{id}", h.Update)
	req := httptest.NewRequest(http.MethodPatch, "/api/v1/admin/study-requests/"+stored.ID().String(), bytes.NewReader(body))
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "VIP — priorizar", repo.items[stored.ID()].InternalNotes())
}

func Test_AdminDownload_ServesFile(t *testing.T) {
	repo := newSRStubRepo()
	clk := shared.FixedClock{T: time.Date(2026, 5, 17, 12, 0, 0, 0, time.UTC)}
	storage := &srStubStorage{content: map[string][]byte{
		"file:///fake/test.pdf": []byte("%PDF-1.7 fake content"),
	}}
	h := handlers.NewStudyRequestAdminHandler(
		appsr.NewListUseCase(repo),
		appsr.NewGetUseCase(repo),
		appsr.NewUpdateUseCase(repo, clk),
	).WithStorage(storage)

	stored := makeRequest(t, repo, clk)
	att, _ := domsr.NewAttachment("notas.pdf", "application/pdf", 1024, "file:///fake/test.pdf", clk.Now())
	stored.AttachFile(att)                    //nolint:errcheck
	repo.Update(context.Background(), stored) //nolint:errcheck

	r := chi.NewRouter()
	r.Get("/api/v1/admin/study-requests/{id}/attachments/{attachmentId}", h.DownloadAttachment)
	req := httptest.NewRequest(http.MethodGet,
		"/api/v1/admin/study-requests/"+stored.ID().String()+"/attachments/"+att.ID.String(),
		nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)

	require.Equal(t, http.StatusOK, rec.Code)
	assert.Equal(t, "application/pdf", rec.Header().Get("Content-Type"))
	assert.Contains(t, rec.Header().Get("Content-Disposition"), "notas.pdf")
	assert.Contains(t, rec.Body.String(), "PDF-1.7")
}

func Test_AdminDownload_AttachmentNotFound(t *testing.T) {
	h, repo, clk := buildAdminHandler(t)
	stored := makeRequest(t, repo, clk)
	r := chi.NewRouter()
	r.Get("/api/v1/admin/study-requests/{id}/attachments/{attachmentId}", h.DownloadAttachment)
	req := httptest.NewRequest(http.MethodGet,
		"/api/v1/admin/study-requests/"+stored.ID().String()+"/attachments/unknown",
		nil)
	rec := httptest.NewRecorder()
	r.ServeHTTP(rec, req)
	assert.Equal(t, http.StatusNotFound, rec.Code)
}
