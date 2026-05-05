package main

// pgxStatsRepo adapta pgxpool.Pool para implementar handlers.StatsRepository.
//
// Vive no cmd/api (Composition Root) para evitar que o pacote postgres
// importe o pacote handlers, o que criaria dependência de camada invertida.
// O Composition Root é o único lugar onde dependências concretas de infra
// são conectadas a interfaces de interface layer.

import (
	"context"
	"time"

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/jackc/pgx/v5/pgxpool"
)

// pgxStatsRepo implementa handlers.StatsRepository usando pgxpool.Pool.
type pgxStatsRepo struct{ pool *pgxpool.Pool }

// compile-time check: satisfaz a interface.
var _ handlers.StatsRepository = (*pgxStatsRepo)(nil)

func (r *pgxStatsRepo) GetStats(ctx context.Context) (handlers.PlatformStats, error) {
	var stats handlers.PlatformStats

	// Total de usuários ativos (não soft-deleted).
	if err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`,
	).Scan(&stats.TotalUsers); err != nil {
		return handlers.PlatformStats{}, err
	}

	// Ativos na semana corrente (somou XP no leaderboard desta semana).
	weekStart := pgxWeekStartUTC(time.Now().UTC())
	if err := r.pool.QueryRow(ctx,
		`SELECT COUNT(DISTINCT user_id) FROM leaderboard WHERE week_start = $1`,
		weekStart,
	).Scan(&stats.ActiveWeekly); err != nil {
		// Tabela leaderboard pode estar vazia em ambientes novos — tolerância.
		stats.ActiveWeekly = 0
	}

	// Total de XP distribuído (todas as semanas).
	if err := r.pool.QueryRow(ctx,
		`SELECT COALESCE(SUM(xp_gained), 0) FROM leaderboard`,
	).Scan(&stats.TotalXPAwarded); err != nil {
		stats.TotalXPAwarded = 0
	}

	return stats, nil
}

// pgxWeekStartUTC retorna a segunda-feira da semana corrente em UTC.
// Local ao adapter para não depender de domínio ou handlers.
func pgxWeekStartUTC(t time.Time) time.Time {
	t = t.UTC()
	weekday := int(t.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	monday := t.AddDate(0, 0, -(weekday - 1))
	return time.Date(monday.Year(), monday.Month(), monday.Day(), 0, 0, 0, 0, time.UTC)
}
