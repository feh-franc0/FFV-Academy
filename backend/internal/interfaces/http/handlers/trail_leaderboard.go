// Package handlers — Trail leaderboard: top usuários por trilha.
//
// Derivado de module_views (não há tabela XP-por-trilha; views capturam
// "engagement por trilha"). Anonimizado por padrão — só nome+id, sem email.
package handlers

import (
	"context"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
)

type TrailLeaderboardRepository interface {
	GetTrailLeaderboard(ctx context.Context, trailID string, since time.Time, limit int) ([]TrailRankEntry, error)
}

type TrailRankEntry struct {
	Rank        int    `json:"rank"`
	DisplayName string `json:"displayName"`
	ModuleCount int64  `json:"moduleCount"` // módulos distintos vistos
	ViewCount   int64  `json:"viewCount"`   // total de views
}

type TrailLeaderboardHandler struct {
	repo TrailLeaderboardRepository
}

func NewTrailLeaderboardHandler(repo TrailLeaderboardRepository) *TrailLeaderboardHandler {
	return &TrailLeaderboardHandler{repo: repo}
}

// Get — GET /api/v1/leaderboard/trail/{trailId}?window=30d&limit=10
func (h *TrailLeaderboardHandler) Get(w http.ResponseWriter, r *http.Request) {
	trailID := chi.URLParam(r, "trailId")
	if trailID == "" {
		WriteError(w, http.StatusBadRequest, "trailId obrigatório", "validation")
		return
	}

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
	case "7d":
		since = since.AddDate(0, 0, -7)
	case "all":
		since = time.Date(2020, 1, 1, 0, 0, 0, 0, time.UTC)
	default:
		since = since.AddDate(0, 0, -30) // default 30d
	}

	ctx, cancel := context.WithTimeout(r.Context(), 3*time.Second)
	defer cancel()

	items, err := h.repo.GetTrailLeaderboard(ctx, trailID, since, limit)
	if err != nil {
		HandleDomainError(w, err)
		return
	}
	if items == nil {
		items = []TrailRankEntry{}
	}

	w.Header().Set("Cache-Control", "public, max-age=120")
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"trailId": trailID,
		"data":    items,
		"since":   since.Format(time.RFC3339),
	})
}
