// Package leaderboard implementa o ranking semanal opt-in.
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

// Repository port
type Repository interface {
	UpsertXP(ctx context.Context, userID shared.UserID, weekStart time.Time, xpGained int) error
	GetWeekly(ctx context.Context, weekStart time.Time, limit int) ([]RankEntry, error)
	GetUserRank(ctx context.Context, userID shared.UserID, weekStart time.Time) (int, error)
	SetOptIn(ctx context.Context, userID shared.UserID, optIn bool) error
	IsOptedIn(ctx context.Context, userID shared.UserID) (bool, error)
}
