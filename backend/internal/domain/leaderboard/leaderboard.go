// Package leaderboard implementa o ranking opt-in com múltiplas janelas
// temporais — semanal, mensal, anual e geral.
package leaderboard

import (
	"context"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// WeekStart retorna o início da semana (segunda-feira UTC) para uma data.
func WeekStart(t time.Time) time.Time {
	t = t.UTC()
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7 // domingo = 7
	}
	daysBack := weekday - 1 // voltar até segunda
	monday := t.AddDate(0, 0, -daysBack)
	return time.Date(monday.Year(), monday.Month(), monday.Day(), 0, 0, 0, 0, time.UTC)
}

// RankEntry representa a posição de um usuário no leaderboard.
type RankEntry struct {
	UserID      shared.UserID
	DisplayName string
	XPGained    int
	Rank        int
}

// Period define a janela temporal do ranking. Janelas são fixas (não rolling)
// — "monthly" é o mês corrente, "yearly" é o ano corrente, "all-time" é tudo
// desde o início.
type Period string

const (
	PeriodWeekly  Period = "weekly"
	PeriodMonthly Period = "monthly"
	PeriodYearly  Period = "yearly"
	PeriodAllTime Period = "all-time"
)

// IsValidPeriod retorna true se p é um período conhecido.
func IsValidPeriod(p string) bool {
	switch Period(p) {
	case PeriodWeekly, PeriodMonthly, PeriodYearly, PeriodAllTime:
		return true
	}
	return false
}

// PeriodWindow retorna início (inclusivo) e fim (exclusivo) do período corrente
// em UTC. Para PeriodAllTime, start é zero e end é a hora atual.
func PeriodWindow(p Period, now time.Time) (time.Time, time.Time) {
	now = now.UTC()
	switch p {
	case PeriodWeekly:
		ws := WeekStart(now)
		return ws, ws.AddDate(0, 0, 7)
	case PeriodMonthly:
		ms := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
		return ms, ms.AddDate(0, 1, 0)
	case PeriodYearly:
		ys := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, time.UTC)
		return ys, ys.AddDate(1, 0, 0)
	case PeriodAllTime:
		return time.Time{}, now
	}
	ws := WeekStart(now)
	return ws, ws.AddDate(0, 0, 7)
}

// Repository port
type Repository interface {
	UpsertXP(ctx context.Context, userID shared.UserID, weekStart time.Time, xpGained int) error
	GetWeekly(ctx context.Context, weekStart time.Time, limit int) ([]RankEntry, error)
	GetUserRank(ctx context.Context, userID shared.UserID, weekStart time.Time) (int, error)
	// GetByPeriod agrega XP nas semanas dentro da janela do período.
	GetByPeriod(ctx context.Context, p Period, now time.Time, limit int) ([]RankEntry, error)
	// GetUserRankByPeriod retorna (rank, xp) do usuário na janela do período.
	// rank=0 indica que o usuário não ganhou XP no período.
	GetUserRankByPeriod(ctx context.Context, userID shared.UserID, p Period, now time.Time) (rank, xp int, err error)
	SetOptIn(ctx context.Context, userID shared.UserID, optIn bool) error
	IsOptedIn(ctx context.Context, userID shared.UserID) (bool, error)
}
