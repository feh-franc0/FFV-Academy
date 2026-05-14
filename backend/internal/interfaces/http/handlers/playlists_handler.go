// Package handlers — Playlists: agrupamentos curados de slugs de módulos.
package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
)

type PlaylistsRepository interface {
	List(ctx context.Context) ([]Playlist, error)
	GetBySlug(ctx context.Context, slug string) (*Playlist, error)
	Create(ctx context.Context, in PlaylistInput) (*Playlist, error)
	Update(ctx context.Context, slug string, in PlaylistInput) (*Playlist, error)
	Delete(ctx context.Context, slug string) error
}

type Playlist struct {
	ID          string    `json:"id"`
	Slug        string    `json:"slug"`
	Title       string    `json:"title"`
	Subtitle    string    `json:"subtitle,omitempty"`
	Audience    string    `json:"audience,omitempty"`
	Color       string    `json:"color"`
	Emoji       string    `json:"emoji,omitempty"`
	ModuleSlugs []string  `json:"moduleSlugs"`
	Order       int       `json:"order"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type PlaylistInput struct {
	Slug        string   `json:"slug"`
	Title       string   `json:"title"`
	Subtitle    string   `json:"subtitle"`
	Audience    string   `json:"audience"`
	Color       string   `json:"color"`
	Emoji       string   `json:"emoji"`
	ModuleSlugs []string `json:"moduleSlugs"`
	Order       int      `json:"order"`
	Status      string   `json:"status"`
}

type PlaylistsHandler struct {
	repo PlaylistsRepository
}

func NewPlaylistsHandler(repo PlaylistsRepository) *PlaylistsHandler {
	return &PlaylistsHandler{repo: repo}
}

func (h *PlaylistsHandler) List(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteJSON(w, http.StatusOK, map[string]interface{}{"data": []Playlist{}})
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
		items = []Playlist{}
	}
	w.Header().Set("Cache-Control", "public, max-age=600")
	WriteJSON(w, http.StatusOK, map[string]interface{}{"data": items})
}

func (h *PlaylistsHandler) Get(w http.ResponseWriter, r *http.Request) {
	if h.repo == nil {
		WriteError(w, http.StatusServiceUnavailable, "playlists não configuradas", "service-unavailable")
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

func (h *PlaylistsHandler) Create(w http.ResponseWriter, r *http.Request) {
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

func (h *PlaylistsHandler) Update(w http.ResponseWriter, r *http.Request) {
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

func (h *PlaylistsHandler) Delete(w http.ResponseWriter, r *http.Request) {
	slug := chi.URLParam(r, "slug")
	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()
	if err := h.repo.Delete(ctx, slug); err != nil {
		HandleDomainError(w, err)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *PlaylistsHandler) decode(w http.ResponseWriter, r *http.Request) (PlaylistInput, bool) {
	var in PlaylistInput
	if err := json.NewDecoder(r.Body).Decode(&in); err != nil {
		WriteError(w, http.StatusBadRequest, "json inválido", "validation")
		return in, false
	}
	in.Slug = strings.TrimSpace(in.Slug)
	in.Title = strings.TrimSpace(in.Title)
	if in.Color == "" {
		in.Color = "#58a6ff"
	}
	if in.Status == "" {
		in.Status = "published"
	}
	if in.ModuleSlugs == nil {
		in.ModuleSlugs = []string{}
	}
	if in.Slug == "" || len(in.Slug) > 80 {
		WriteError(w, http.StatusBadRequest, "slug entre 1 e 80 chars", "validation")
		return in, false
	}
	if len(in.Title) < 3 || len(in.Title) > 120 {
		WriteError(w, http.StatusBadRequest, "title entre 3 e 120 chars", "validation")
		return in, false
	}
	if len(in.ModuleSlugs) > 50 {
		WriteError(w, http.StatusBadRequest, "máximo 50 módulos por playlist", "validation")
		return in, false
	}
	return in, true
}
