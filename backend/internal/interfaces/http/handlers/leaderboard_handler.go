package handlers

import (
	"net/http"
	"strconv"
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

// GetPublic retorna o ranking público para um período. Endpoint sem auth.
//
// Aceita ?period=weekly|monthly|yearly|all-time (default: weekly).
// Aceita ?limit=N (default: 10, max: 100).
//
// Resposta inclui janela ("periodStart" e "periodEnd") para o cliente exibir
// "ranking de maio" ou "ranking 03/05 – 09/05" sem cálculo extra.
//
// GET /api/v1/leaderboard/public?period=weekly
func (h *LeaderboardHandler) GetPublic(w http.ResponseWriter, r *http.Request) {
	period := domleaderboard.Period(r.URL.Query().Get("period"))
	if !domleaderboard.IsValidPeriod(string(period)) {
		period = domleaderboard.PeriodWeekly
	}

	limit := 10
	if v := r.URL.Query().Get("limit"); v != "" {
		// parse simples — falha silenciosa cai no default
		if n, err := strconv.Atoi(v); err == nil && n > 0 && n <= 100 {
			limit = n
		}
	}

	now := time.Now().UTC()
	entries, err := h.repo.GetByPeriod(r.Context(), period, now, limit)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	start, end := domleaderboard.PeriodWindow(period, now)

	dtos := make([]LeaderboardEntryDTO, len(entries))
	for i, e := range entries {
		dtos[i] = LeaderboardEntryDTO{
			Rank:     int64(e.Rank),
			UserID:   "", // privacidade — não expor IDs em endpoint público
			UserName: e.DisplayName,
			Score:    e.XPGained,
		}
	}

	periodStart := ""
	if !start.IsZero() {
		periodStart = start.Format(time.RFC3339)
	}

	w.Header().Set("Cache-Control", "public, max-age=60, s-maxage=60")
	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"period":      string(period),
		"periodStart": periodStart,
		"periodEnd":   end.Format(time.RFC3339),
		"entries":     dtos,
		"total":       len(dtos),
	})
}

// GetMyRank retorna a posição do usuário autenticado no ranking semanal.
// Mantido por compatibilidade com clients antigos.
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

// GetMyRankAll retorna a posição do usuário autenticado em todos os 4 períodos
// — útil para a tela /progresso e para o badge de rank no app.
//
// GET /api/v1/leaderboard/me/all
func (h *LeaderboardHandler) GetMyRankAll(w http.ResponseWriter, r *http.Request) {
	userID := middleware.UserIDFromContext(r.Context())
	now := time.Now().UTC()

	type periodRank struct {
		Period string `json:"period"`
		Rank   int    `json:"rank"`
		XP     int    `json:"xp"`
	}

	periods := []domleaderboard.Period{
		domleaderboard.PeriodWeekly,
		domleaderboard.PeriodMonthly,
		domleaderboard.PeriodYearly,
		domleaderboard.PeriodAllTime,
	}

	results := make([]periodRank, 0, len(periods))
	for _, p := range periods {
		rank, xp, err := h.repo.GetUserRankByPeriod(r.Context(), userID, p, now)
		if err != nil {
			HandleDomainError(w, err)
			return
		}
		results = append(results, periodRank{Period: string(p), Rank: rank, XP: xp})
	}

	WriteJSON(w, http.StatusOK, map[string]interface{}{
		"ranks": results,
	})
}
