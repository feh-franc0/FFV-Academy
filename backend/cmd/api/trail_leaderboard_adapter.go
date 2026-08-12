package main

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

type pgxTrailLeaderboardRepo struct{ pool *pgxpool.Pool }

var _ handlers.TrailLeaderboardRepository = (*pgxTrailLeaderboardRepo)(nil)

func (r *pgxTrailLeaderboardRepo) GetTrailLeaderboard(ctx context.Context, trailID string, since time.Time, limit int) ([]handlers.TrailRankEntry, error) {
	// Considera só usuários autenticados (user_id NOT NULL) para anonimato
	// dos visitantes que não criaram conta. JOIN com users pra pegar nome.
	//
	// leaderboard_opt_ins e u.deleted_at IS NULL: mesma regra que
	// LeaderboardRepo.GetWeekly/GetByPeriod já aplicam (other_repos.go) — sem
	// opt-in, nome real não aparece em ranking público; sem o filtro de
	// deleted_at, quem apaga a conta continua aparecendo pelo nome (o oposto
	// do que uma exclusão deveria significar). Este ranking de trilha tinha
	// ficado de fora das duas regras quando foi escrito.
	rows, err := r.pool.Query(ctx, `
		SELECT
		  COALESCE(u.name, 'Anônimo')         AS display_name,
		  COUNT(DISTINCT v.slug)               AS module_count,
		  COUNT(*)                              AS view_count
		FROM module_views v
		JOIN users u ON u.id = v.user_id
		JOIN leaderboard_opt_ins lo ON lo.user_id = v.user_id
		WHERE v.trail_id = $1
		  AND v.viewed_at >= $2
		  AND v.user_id IS NOT NULL
		  AND u.deleted_at IS NULL
		GROUP BY u.name
		ORDER BY module_count DESC, view_count DESC
		LIMIT $3
	`, trailID, since, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]handlers.TrailRankEntry, 0)
	rank := 1
	for rows.Next() {
		var e handlers.TrailRankEntry
		if err := rows.Scan(&e.DisplayName, &e.ModuleCount, &e.ViewCount); err != nil {
			return out, err
		}
		e.Rank = rank
		rank++
		out = append(out, e)
	}
	return out, nil
}
