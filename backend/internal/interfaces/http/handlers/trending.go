// Package handlers — Trending: módulos mais acessados na janela recente.
//
// Endpoint público (sem auth). Usa module_views agregado por slug + JOIN com
// curriculum_articles pra obter título/trilha/hub. Cache curto via header.
package handlers

import (
	"context"
	"net/http"
	"time"
)

// TrendingRepository — port de leitura.
type TrendingRepository interface {
	GetTrending(ctx context.Context, since time.Time, limit int) ([]TrendingItem, error)
}

// TrendingItem — projeção pública.
type TrendingItem struct {
	Slug    string `json:"slug"`
	Title   string `json:"title"`
	TrailID string `json:"trailId,omitempty"`
	HubID   string `json:"hubId,omitempty"`
	Views   int64  `json:"views"`
}

type TrendingHandler struct {
	repo TrendingRepository
}

func NewTrendingHandler(repo TrendingRepository) *TrendingHandler {
	return &TrendingHandler{repo: repo}
}

// Get — GET /api/v1/curriculum/trending?window=7d&limit=10
//
// window: 24h | 7d | 30d (default 7d). Limit max 50.
func (h *TrendingHandler) Get(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()
	limit := parseIntParam(q.Get("limit"), 10)
	if limit > 50 {
		limit = 50
	}
	if limit < 1 {
		limit = 1
	}

	since := time.Now().UTC()
	switch q.Get("window") {
	case "24h":
		since = since.Add(-24 * time.Hour)
	case "30d":
		since = since.AddDate(0, 0, -30)
	default: // 7d
		since = since.AddDate(0, 0, -7)
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	items, err := h.repo.GetTrending(ctx, since, limit)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	if items == nil {
		items = []TrendingItem{}
	}

	// Cache 5 min — trending muda lentamente; reduz custo de query agregada.
	w.Header().Set("Cache-Control", "public, max-age=300, s-maxage=300")
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"data":  items,
		"since": since.Format(time.RFC3339),
	})
}
