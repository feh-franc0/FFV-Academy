// Contract tests para News, Cheatsheets, Playlists.
//
// Stubs in-memory dos repos. Cobre: list, get, 404, create validation,
// admin gate (sem auth retorna 401 — gate fica no router em produção).
package contract_test

import (
	"bytes"
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── News stub ────────────────────────────────────────────────────────────

type stubNewsRepo struct {
	items map[string]*handlers.NewsItem
}

func newStubNewsRepo() *stubNewsRepo {
	return &stubNewsRepo{
		items: map[string]*handlers.NewsItem{
			"hello": {
				Slug: "hello", Title: "Hello World OpenAI", Summary: "Resumo de teste com pelo menos 20 chars.",
				Source: "OpenAI", SourceURL: "https://openai.com/x",
				Category: "launch", PublishedAt: "2026-05-10",
				Status: "published", Tags: []string{"ai"},
				CreatedAt: time.Now(), UpdatedAt: time.Now(),
			},
		},
	}
}

func (s *stubNewsRepo) List(_ context.Context, f handlers.NewsFilter) ([]handlers.NewsItem, int64, error) {
	out := make([]handlers.NewsItem, 0)
	for _, v := range s.items {
		if f.Category != "" && v.Category != f.Category {
			continue
		}
		out = append(out, *v)
	}
	return out, int64(len(out)), nil
}

func (s *stubNewsRepo) GetBySlug(_ context.Context, slug string) (*handlers.NewsItem, error) {
	return s.items[slug], nil
}

func (s *stubNewsRepo) Create(_ context.Context, in handlers.NewsInput) (*handlers.NewsItem, error) {
	it := &handlers.NewsItem{Slug: in.Slug, Title: in.Title, Summary: in.Summary, Source: in.Source,
		SourceURL: in.SourceURL, Category: in.Category, Hot: in.Hot, Tags: in.Tags,
		PublishedAt: in.PublishedAt, Status: in.Status}
	s.items[in.Slug] = it
	return it, nil
}

func (s *stubNewsRepo) Update(_ context.Context, slug string, in handlers.NewsInput) (*handlers.NewsItem, error) {
	return s.Create(context.Background(), in)
}

func (s *stubNewsRepo) Delete(_ context.Context, slug string) error {
	delete(s.items, slug)
	return nil
}

// ─── News tests ───────────────────────────────────────────────────────────

func Test_News_List_ReturnsItems(t *testing.T) {
	h := handlers.NewNewsHandler(newStubNewsRepo())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/news", http.NoBody)
	rec := httptest.NewRecorder()
	h.List(rec, req)

	assert.Equal(t, http.StatusOK, rec.Code)
	var body struct {
		Data  []handlers.NewsItem `json:"data"`
		Total int64               `json:"total"`
	}
	require.NoError(t, json.NewDecoder(rec.Body).Decode(&body))
	assert.GreaterOrEqual(t, body.Total, int64(1))
}

func Test_News_List_FilterByCategory_Invalid_Returns400(t *testing.T) {
	h := handlers.NewNewsHandler(newStubNewsRepo())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/news?category=invalid", http.NoBody)
	rec := httptest.NewRecorder()
	h.List(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_News_Get_NotFound_Returns404(t *testing.T) {
	h := handlers.NewNewsHandler(newStubNewsRepo())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/news/inexistente", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("slug", "inexistente")
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	rec := httptest.NewRecorder()
	h.Get(rec, req)
	assert.Equal(t, http.StatusNotFound, rec.Code)
}

func Test_News_Create_InvalidCategory_Returns400(t *testing.T) {
	h := handlers.NewNewsHandler(newStubNewsRepo())
	body := `{"slug":"x","title":"Título suficientemente longo","summary":"Resumo com mais de vinte chars aqui.","source":"X","sourceUrl":"https://x.com","category":"foo","publishedAt":"2026-05-10"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/news", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_News_Create_HttpUrl_Returns400(t *testing.T) {
	h := handlers.NewNewsHandler(newStubNewsRepo())
	body := `{"slug":"x","title":"Título suficientemente longo","summary":"Resumo com mais de vinte chars aqui.","source":"X","sourceUrl":"http://insecure.com","category":"launch","publishedAt":"2026-05-10"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/news", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

func Test_News_Create_Valid_Returns201(t *testing.T) {
	h := handlers.NewNewsHandler(newStubNewsRepo())
	body := `{"slug":"new-slug","title":"Título novo bonito","summary":"Resumo bem extenso pra passar validação.","source":"OpenAI","sourceUrl":"https://openai.com","category":"launch","publishedAt":"2026-05-10","status":"published"}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/news", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusCreated, rec.Code)
}

// ─── Cheatsheets stub & tests ─────────────────────────────────────────────

type stubCheatRepo struct {
	items map[string]*handlers.CheatsheetFull
}

func newStubCheatRepo() *stubCheatRepo {
	return &stubCheatRepo{items: map[string]*handlers.CheatsheetFull{
		"git": {
			CheatsheetSummary: handlers.CheatsheetSummary{Slug: "git", Title: "Git", Accent: "#f05032"},
			BodyMD:            "# Git\n\nConteúdo.",
			Status:            "published",
		},
	}}
}

func (s *stubCheatRepo) List(_ context.Context) ([]handlers.CheatsheetSummary, error) {
	out := make([]handlers.CheatsheetSummary, 0)
	for _, v := range s.items {
		out = append(out, v.CheatsheetSummary)
	}
	return out, nil
}
func (s *stubCheatRepo) GetBySlug(_ context.Context, slug string) (*handlers.CheatsheetFull, error) {
	return s.items[slug], nil
}
func (s *stubCheatRepo) Create(_ context.Context, in handlers.CheatsheetInput) (*handlers.CheatsheetFull, error) {
	it := &handlers.CheatsheetFull{
		CheatsheetSummary: handlers.CheatsheetSummary{Slug: in.Slug, Title: in.Title, Accent: in.Accent},
		BodyMD:            in.BodyMD,
		Status:            in.Status,
	}
	s.items[in.Slug] = it
	return it, nil
}
func (s *stubCheatRepo) Update(ctx context.Context, slug string, in handlers.CheatsheetInput) (*handlers.CheatsheetFull, error) {
	return s.Create(ctx, in)
}
func (s *stubCheatRepo) Delete(_ context.Context, slug string) error {
	delete(s.items, slug)
	return nil
}

func Test_Cheatsheets_List_Returns200(t *testing.T) {
	h := handlers.NewCheatsheetsHandler(newStubCheatRepo())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/cheatsheets", http.NoBody)
	rec := httptest.NewRecorder()
	h.List(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func Test_Cheatsheets_Create_EmptyBody_Returns400(t *testing.T) {
	h := handlers.NewCheatsheetsHandler(newStubCheatRepo())
	body := `{"slug":"x","title":"Título","bodyMd":""}`
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/cheatsheets", bytes.NewBufferString(body))
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}

// ─── Playlists stub & tests ───────────────────────────────────────────────

type stubPlayRepo struct {
	items map[string]*handlers.Playlist
}

func newStubPlayRepo() *stubPlayRepo {
	return &stubPlayRepo{items: map[string]*handlers.Playlist{
		"a": {Slug: "a", Title: "Playlist A", Color: "#58a6ff", ModuleSlugs: []string{"x"}, Status: "published"},
	}}
}

func (s *stubPlayRepo) List(_ context.Context) ([]handlers.Playlist, error) {
	out := make([]handlers.Playlist, 0)
	for _, v := range s.items {
		out = append(out, *v)
	}
	return out, nil
}
func (s *stubPlayRepo) GetBySlug(_ context.Context, slug string) (*handlers.Playlist, error) {
	return s.items[slug], nil
}
func (s *stubPlayRepo) Create(_ context.Context, in handlers.PlaylistInput) (*handlers.Playlist, error) {
	it := &handlers.Playlist{Slug: in.Slug, Title: in.Title, Color: in.Color, ModuleSlugs: in.ModuleSlugs, Status: in.Status}
	s.items[in.Slug] = it
	return it, nil
}
func (s *stubPlayRepo) Update(ctx context.Context, slug string, in handlers.PlaylistInput) (*handlers.Playlist, error) {
	return s.Create(ctx, in)
}
func (s *stubPlayRepo) Delete(_ context.Context, slug string) error {
	delete(s.items, slug)
	return nil
}

func Test_Playlists_List_Returns200(t *testing.T) {
	h := handlers.NewPlaylistsHandler(newStubPlayRepo())
	req := httptest.NewRequest(http.MethodGet, "/api/v1/playlists", http.NoBody)
	rec := httptest.NewRecorder()
	h.List(rec, req)
	assert.Equal(t, http.StatusOK, rec.Code)
}

func Test_Playlists_Create_TooManyModules_Returns400(t *testing.T) {
	h := handlers.NewPlaylistsHandler(newStubPlayRepo())
	slugs := make([]string, 51)
	for i := range slugs {
		slugs[i] = "x"
	}
	body, _ := json.Marshal(map[string]interface{}{
		"slug": "p", "title": "Title", "moduleSlugs": slugs,
	})
	req := httptest.NewRequest(http.MethodPost, "/api/v1/admin/playlists", bytes.NewBuffer(body))
	rec := httptest.NewRecorder()
	h.Create(rec, req)
	assert.Equal(t, http.StatusBadRequest, rec.Code)
}
