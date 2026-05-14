// Package handlers — News: curadoria editorial de notícias de IA.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

type NewsRepository interface {
	List(ctx context.Context, filter NewsFilter) ([]NewsItem, int64, error)
	GetBySlug(ctx context.Context, slug string) (*NewsItem, error)
	Create(ctx context.Context, n NewsInput) (*NewsItem, error)
	Update(ctx context.Context, slug string, n NewsInput) (*NewsItem, error)
	Delete(ctx context.Context, slug string) error
}

type NewsItem struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	Title       string    `json:"title"`
	Summary     string    `json:"summary"`
	Source      string    `json:"source"`
	SourceURL   string    `json:"sourceUrl"`
	ImageURL    string    `json:"imageUrl,omitempty"`
	Category    string    `json:"category"`
	Hot         bool      `json:"hot"`
	Tags        []string  `json:"tags"`
	PublishedAt string    `json:"publishedAt"` // YYYY-MM-DD
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type NewsInput struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Summary     string   `json:"summary"`
	Source      string   `json:"source"`
	SourceURL   string   `json:"sourceUrl"`
	ImageURL    string   `json:"imageUrl"`
	Category    string   `json:"category"`
	Hot         bool     `json:"hot"`
	Tags        []string `json:"tags"`
	PublishedAt string   `json:"publishedAt"`
	Status      string   `json:"status"`
}

type NewsFilter struct {
	Category   string
	HotOnly    bool
	Limit      int
	Offset     int
	IncludeAll bool // admin pode ver draft/archived
}

type NewsHandler struct {
	repo NewsRepository
}

func NewNewsHandler(repo NewsRepository) *NewsHandler {
	return &NewsHandler{repo: repo}
}

var validNewsCategories = map[string]bool{
	"launch": true, "research": true, "business": true, "safety": true, "regulation": true,
}

// List — GET /api/v1/news?category=&hot=&limit=&offset=
func (h *NewsHandler) List(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteJSON(w, http.StatusOK, map[string]interface{}{"data": []NewsItem{}, "total": 0})
		return
	}
	q := r.URL.Query()
	limit := parseIntParam(q.Get("limit"), 50)
	if limit > 200 {
		limit = 200
	}
	if limit < 1 {
		limit = 1
	}
	offset := parseIntParam(q.Get("offset"), 0)
	if offset < 0 {
		offset = 0
	}

	cat := q.Get("category")
	if cat != "" && !validNewsCategories[cat] {
		WriteError(w, http.StatusBadRequest, "categoria inválida", "validation")
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	items, total, err := h.repo.List(ctx, NewsFilter{
		Category: cat,
		HotOnly:  q.Get("hot") == "true",
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	if items == nil {
		items = []NewsItem{}
	}

	w.Header().Set("Cache-Control", "public, max-age=300, s-maxage=300")
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data": items, "total": total, "limit": limit, "offset": offset,
	})
}

// Get — GET /api/v1/news/{slug}
func (h *NewsHandler) Get(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "news não configuradas", "service-unavailable")
		return
	}
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		WriteError(w, http.StatusBadRequest, "slug obrigatório", "validation")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	item, err := h.repo.GetBySlug(ctx, slug)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	if item == nil {
		WriteError(w, http.StatusNotFound, "not found", "not-found")
		return
	}
	w.Header().Set("Cache-Control", "public, max-age=300, s-maxage=300")
	WriteJSON(w, http.StatusOK, item)
}

// Create — POST /api/v1/admin/news
func (h *NewsHandler) Create(w http.ResponseWriter, r *http.Request) {
	in, ok := h.decodeAndValidate(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	item, err := h.repo.Create(ctx, in)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusCreated, item)
}

// Update — PATCH /api/v1/admin/news/{slug}
func (h *NewsHandler) Update(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	in, ok := h.decodeAndValidate(w, r)
	if !ok {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	item, err := h.repo.Update(ctx, slug, in)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	WriteJSON(w, http.StatusOK, item)
}

// Delete — DELETE /api/v1/admin/news/{slug} (soft-delete)
func (h *NewsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	if slug == "" {
		WriteError(w, http.StatusBadRequest, "slug obrigatório", "validation")
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	if err := h.repo.Delete(ctx, slug); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *NewsHandler) decodeAndValidate(w http.ResponseWriter, r *http.Request) (NewsInput, bool) {
	var in NewsInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		WriteError(w, http.StatusBadRequest, "json inválido", "validation")
		return in, false
	}
	in.Slug = strings.TrimSpace(in.Slug)
	in.Title = strings.TrimSpace(in.Title)
	in.Summary = strings.TrimSpace(in.Summary)
	in.Source = strings.TrimSpace(in.Source)
	in.SourceURL = strings.TrimSpace(in.SourceURL)
	in.Category = strings.TrimSpace(in.Category)
	in.Status = strings.TrimSpace(in.Status)
	if in.Status == "" {
		in.Status = "published"
	}

	if !validNewsCategories[in.Category] {
		WriteError(w, http.StatusBadRequest, "categoria inválida (launch|research|business|safety|regulation)", "validation")
		return in, false
	}
	if in.Slug == "" || len(in.Slug) > 80 {
		WriteError(w, http.StatusBadRequest, "slug entre 1 e 80 chars", "validation")
		return in, false
	}
	if len(in.Title) < 10 || len(in.Title) > 200 {
		WriteError(w, http.StatusBadRequest, "title entre 10 e 200 chars", "validation")
		return in, false
	}
	if len(in.Summary) < 20 || len(in.Summary) > 500 {
		WriteError(w, http.StatusBadRequest, "summary entre 20 e 500 chars", "validation")
		return in, false
	}
	if !strings.HasPrefix(in.SourceURL, "https://") {
		WriteError(w, http.StatusBadRequest, "sourceUrl deve ser https://", "validation")
		return in, false
	}
	if in.ImageURL != "" && !strings.HasPrefix(in.ImageURL, "https://") {
		WriteError(w, http.StatusBadRequest, "imageUrl deve ser https://", "validation")
		return in, false
	}
	if in.PublishedAt == "" {
		in.PublishedAt = time.Now().UTC().Format("2006-01-02")
	}
	if _, err := time.Parse("2006-01-02", in.PublishedAt); err != nil {
		WriteError(w, http.StatusBadRequest, "publishedAt deve ser YYYY-MM-DD", "validation")
		return in, false
	}
	return in, true
}
