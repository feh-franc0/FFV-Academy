package handlers

import (
	"net/http"
	"time"

	domleaderboard "github.com/fernandofv/api/internal/domain/leaderboard"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// LeaderboardHandler expõe os endpoints de ranking.
type LeaderboardHandler struct {
	repo domleaderboard.Repository
}

func NewLeaderboardHandler(repo domleaderboard.Repository) *LeaderboardHandler {
	return &LeaderboardHandler{repo: repo}
}

// GetWeekly retorna o ranking semanal.
// GET /api/v1/leaderboard
func (h *LeaderboardHandler) GetWeekly(w http.ResponseWriter, r *http.Request) {
	weekStart := domleaderboard.WeekStart(time.Now().UTC())
	entries, err := h.repo.GetWeekly(r.Context(), weekStart, 50)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	dtos := make([]LeaderboardEntryDTO, len(entries))
	for i, e := range entries {
		dtos[i] = LeaderboardEntryDTO{
			Rank:     int64(e.Rank),
			UserID:   e.UserID.String(),
			UserName: e.DisplayName,
			Score:    e.XPGained,
		}
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"weekStart": weekStart.UTC().Format(time.RFC3339),
		"entries":   dtos,
		"total":     len(dtos),
	})
}

// GetMyRank retorna a posição do usuário autenticado no ranking.
// GET /api/v1/leaderboard/me
func (h *LeaderboardHandler) GetMyRank(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	weekStart := domleaderboard.WeekStart(time.Now().UTC())

	rank, err := h.repo.GetUserRank(r.Context(), userID, weekStart)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"rank":      rank,
		"weekStart": weekStart.UTC().Format(time.RFC3339),
	})
}
