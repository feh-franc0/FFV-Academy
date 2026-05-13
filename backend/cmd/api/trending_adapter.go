package main

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

type pgxTrendingRepo struct{ pool *pgxpool.Pool }

var _ handlers.TrendingRepository = (*pgxTrendingRepo)(nil)

func (r *pgxTrendingRepo) GetTrending(ctx context.Context, since time.Time, limit int) ([]handlers.TrendingItem, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT v.slug,
		       COALESCE(a.title, v.slug)        AS title,
		       COALESCE(a.trail_id, '')         AS trail_id,
		       COALESCE(a.hub_id, '')           AS hub_id,
		       COUNT(*)                          AS n
		FROM module_views v
		LEFT JOIN curriculum_articles a ON a.slug = v.slug
		WHERE v.viewed_at >= $1
		GROUP BY v.slug, a.title, a.trail_id, a.hub_id
		ORDER BY n DESC
		LIMIT $2
	`, since, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]handlers.TrendingItem, 0)
	for rows.Next() {
		var it handlers.TrendingItem
		if err := rows.Scan(&it.Slug, &it.Title, &it.TrailID, &it.HubID, &it.Views); err != nil {
			return out, err
		}
		out = append(out, it)
	}
	return out, nil
}
