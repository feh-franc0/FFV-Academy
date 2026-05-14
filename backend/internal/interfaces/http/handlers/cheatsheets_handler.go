// Package handlers — Cheatsheets: referências rápidas em markdown.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

type CheatsheetsRepository interface {
	List(ctx context.Context) ([]CheatsheetSummary, error)
	GetBySlug(ctx context.Context, slug string) (*CheatsheetFull, error)
	Create(ctx context.Context, in CheatsheetInput) (*CheatsheetFull, error)
	Update(ctx context.Context, slug string, in CheatsheetInput) (*CheatsheetFull, error)
	Delete(ctx context.Context, slug string) error
}

type CheatsheetSummary struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle,omitempty"`
	Description string `json:"description,omitempty"`
	Accent      string `json:"accent"`
	Emoji       string `json:"emoji,omitempty"`
	Order       int    `json:"order"`
}

type CheatsheetFull struct {
	CheatsheetSummary
	BodyMD    string    `json:"bodyMd"`
	Status    string    `json:"status"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type CheatsheetInput struct {
	Slug        string `json:"slug"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle"`
	Description string `json:"description"`
	Accent      string `json:"accent"`
	Emoji       string `json:"emoji"`
	BodyMD      string `json:"bodyMd"`
	Order       int    `json:"order"`
	Status      string `json:"status"`
}

type CheatsheetsHandler struct {
	repo CheatsheetsRepository
}

func NewCheatsheetsHandler(repo CheatsheetsRepository) *CheatsheetsHandler {
	return &CheatsheetsHandler{repo: repo}
}

func (h *CheatsheetsHandler) List(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteJSON(w, http.StatusOK, map[string]interface{}{"data": []CheatsheetSummary{}})
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	items, err := h.repo.List(ctx)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	if items == nil {
		items = []CheatsheetSummary{}
	}
	w.Header().Set("Cache-Control", "public, max-age=600")
	WriteJSON(w, http.StatusOK, map[string]interface{}{"data": items})
}

func (h *CheatsheetsHandler) Get(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "cheatsheets não configurados", "service-unavailable")
		return
	}
	slug := chi.URLParam(r, "slug")
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
	w.Header().Set("Cache-Control", "public, max-age=600")
	WriteJSON(w, http.StatusOK, item)
}

func (h *CheatsheetsHandler) Create(w http.ResponseWriter, r *http.Request) {
	in, ok := h.decode(w, r)
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

func (h *CheatsheetsHandler) Update(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	in, ok := h.decode(w, r)
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

func (h *CheatsheetsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	if err := h.repo.Delete(ctx, slug); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *CheatsheetsHandler) decode(w http.ResponseWriter, r *http.Request) (CheatsheetInput, bool) {
	var in CheatsheetInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		WriteError(w, http.StatusBadRequest, "json inválido", "validation")
		return in, false
	}
	in.Slug = strings.TrimSpace(in.Slug)
	in.Title = strings.TrimSpace(in.Title)
	in.BodyMD = strings.TrimSpace(in.BodyMD)
	if in.Accent == "" {
		in.Accent = "#58a6ff"
	}
	if in.Status == "" {
		in.Status = "published"
	}
	if in.Slug == "" || len(in.Slug) > 80 {
		WriteError(w, http.StatusBadRequest, "slug entre 1 e 80 chars", "validation")
		return in, false
	}
	if len(in.Title) < 3 || len(in.Title) > 120 {
		WriteError(w, http.StatusBadRequest, "title entre 3 e 120 chars", "validation")
		return in, false
	}
	if len(in.BodyMD) < 1 || len(in.BodyMD) > 200000 {
		WriteError(w, http.StatusBadRequest, "bodyMd entre 1 e 200000 chars", "validation")
		return in, false
	}
	return in, true
}
