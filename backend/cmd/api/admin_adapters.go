// Adapters Postgres dos repositórios do AdminHandler.
//
// Vivem no Composition Root (cmd/api) para não inverter dependência de
// camadas — handlers definem a interface, infra implementa, main wira.
package main

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── AdminStatsRepository ───────────────────────────────────────────────────

type pgxAdminStatsRepo struct{ pool *pgxpool.Pool }

var _ handlers.AdminStatsRepository = (*pgxAdminStatsRepo)(nil)

func (r *pgxAdminStatsRepo) GetAdminStats(ctx context.Context) (handlers.AdminStats, error) {
	var s handlers.AdminStats

	// Bloco único: todas as queries em paralelo seriam mais rápido, mas como
	// o dashboard é cacheado 30s, simplicidade ganha aqui.
	queries := []struct {
		sql  string
		dest interface{}
	}{
		{`SELECT COUNT(*) FROM users WHERE deleted_at IS NULL`, &s.TotalUsers},
		{`SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= now() - INTERVAL '7 days'`, &s.UsersLast7Days},
		{`SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= now() - INTERVAL '30 days'`, &s.UsersLast30Days},
		{`SELECT COUNT(*) FROM curriculum_articles`, &s.TotalArticles},
		{`SELECT COUNT(*) FROM module_blocks`, &s.TotalBlocks},
		{`SELECT COALESCE(SUM(xp_gained), 0) FROM leaderboard`, &s.TotalXPAwarded},
		{`SELECT COUNT(*) FROM simulado_attempts`, &s.TotalAttempts},
		{`SELECT COUNT(*) FROM certificates`, &s.TotalCertifs},
	}
	for _, q := range queries {
		if err := r.pool.QueryRow(ctx, q.sql).Scan(q.dest); err != nil {
			// Tabela pode não existir em ambientes recém-migrados — tolera.
			if !errors.Is(err, pgx.ErrNoRows) {
				continue
			}
		}
	}

	// DAU/WAU/MAU vêm da module_views se houver tráfego, caso contrário 0.
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '24 hours' AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveDaily)
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '7 days' AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveWeekly)
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '30 days' AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveMonthly)

	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM module_views WHERE viewed_at >= now() - INTERVAL '7 days'`).Scan(&s.ViewsLast7Days)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM module_views WHERE viewed_at >= now() - INTERVAL '30 days'`).Scan(&s.ViewsLast30Days)

	return s, nil
}

func (r *pgxAdminStatsRepo) GetTopTrails(ctx context.Context, since time.Time, limit int) ([]handlers.TrailViewStat, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT trail_id, COUNT(*) AS n
		FROM module_views
		WHERE viewed_at >= $1 AND trail_id IS NOT NULL AND trail_id <> ''
		GROUP BY trail_id
		ORDER BY n DESC
		LIMIT $2
	`, since, limit)
	if err != nil {
		return nil, nil
	}
	defer rows.Close()

	var out []handlers.TrailViewStat
	for rows.Next() {
		var item handlers.TrailViewStat
		if err := rows.Scan(&item.TrailID, &item.Views); err != nil {
			return out, nil
		}
		out = append(out, item)
	}
	return out, nil
}

func (r *pgxAdminStatsRepo) GetTopModules(ctx context.Context, since time.Time, limit int) ([]handlers.ModuleViewStat, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT v.slug, COALESCE(a.title, v.slug) AS title, COALESCE(a.trail_id, '') AS trail_id, COUNT(*) AS n
		FROM module_views v
		LEFT JOIN curriculum_articles a ON a.slug = v.slug
		WHERE v.viewed_at >= $1
		GROUP BY v.slug, a.title, a.trail_id
		ORDER BY n DESC
		LIMIT $2
	`, since, limit)
	if err != nil {
		return nil, nil
	}
	defer rows.Close()

	var out []handlers.ModuleViewStat
	for rows.Next() {
		var item handlers.ModuleViewStat
		if err := rows.Scan(&item.Slug, &item.Title, &item.TrailID, &item.Views); err != nil {
			return out, nil
		}
		out = append(out, item)
	}
	return out, nil
}

// ─── AdminUsersRepository ──────────────────────────────────────────────────

type pgxAdminUsersRepo struct{ pool *pgxpool.Pool }

var _ handlers.AdminUsersRepository = (*pgxAdminUsersRepo)(nil)

func (r *pgxAdminUsersRepo) ListUsers(ctx context.Context, f handlers.AdminUserFilter) ([]handlers.AdminUserListItem, int64, error) {
	conds := []string{"1=1"}
	args := []interface{}{}
	idx := 1

	if s := strings.TrimSpace(f.Search); s != "" {
		conds = append(conds, "(email ILIKE $"+itoa(idx)+" OR COALESCE(name,'') ILIKE $"+itoa(idx)+")")
		args = append(args, "%"+s+"%")
		idx++
	}
	if f.Role != "" {
		conds = append(conds, "role = $"+itoa(idx))
		args = append(args, f.Role)
		idx++
	}

	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM users WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	limitArg := idx
	offsetArg := idx + 1
	args = append(args, f.Limit, f.Offset)

	rows, err := r.pool.Query(ctx, `
		SELECT id, email, COALESCE(name,''), COALESCE(phone,''), role,
		       COALESCE(marketing_consent, false), created_at, updated_at, deleted_at
		FROM users
		WHERE `+where+`
		ORDER BY created_at DESC
		LIMIT $`+itoa(limitArg)+` OFFSET $`+itoa(offsetArg),
		args...,
	)
	if err != nil {
		return nil, total, err
	}
	defer rows.Close()

	var out []handlers.AdminUserListItem
	for rows.Next() {
		var u handlers.AdminUserListItem
		var deletedAt *time.Time
		if err := rows.Scan(&u.ID, &u.Email, &u.Name, &u.Phone, &u.Role, &u.MarketingConsent, &u.CreatedAt, &u.UpdatedAt, &deletedAt); err != nil {
			return out, total, err
		}
		u.DeletedAt = deletedAt
		out = append(out, u)
	}
	return out, total, nil
}

// itoa minimal — evita import strconv pra usar inline em SQL builders.
func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	neg := n < 0
	if neg {
		n = -n
	}
	buf := [20]byte{}
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if neg {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}

// ─── ModuleViewRepository ──────────────────────────────────────────────────

type pgxModuleViewRepo struct{ pool *pgxpool.Pool }

var _ handlers.ModuleViewRepository = (*pgxModuleViewRepo)(nil)

func (r *pgxModuleViewRepo) Insert(ctx context.Context, v handlers.ModuleViewInput) error {
	var userID, anonID, hubID, trailID, ref, ua *string
	if v.UserID != "" {
		userID = &v.UserID
	}
	if v.AnonID != "" {
		anonID = &v.AnonID
	}
	if v.HubID != "" {
		hubID = &v.HubID
	}
	if v.TrailID != "" {
		trailID = &v.TrailID
	}
	if v.Referrer != "" {
		ref = &v.Referrer
	}
	if v.UserAgent != "" {
		ua = &v.UserAgent
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO module_views (user_id, anon_id, slug, hub_id, trail_id, referrer, user_agent, viewed_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, userID, anonID, v.Slug, hubID, trailID, ref, ua, v.ViewedAt)
	return err
}

// ─── AdminGrowthRepository ─────────────────────────────────────────────────

type pgxAdminGrowthRepo struct{ pool *pgxpool.Pool }

var _ handlers.AdminGrowthRepository = (*pgxAdminGrowthRepo)(nil)

// GetGrowth retorna time-series diário de cadastros e tentativas de simulado.
func (r *pgxAdminGrowthRepo) GetGrowth(ctx context.Context, days int) (handlers.GrowthData, error) {
	var data handlers.GrowthData

	signups, err := r.queryDailySeries(ctx, days, `
		WITH dates AS (
		  SELECT generate_series(
		    (NOW() - make_interval(days := $1 - 1))::date,
		    NOW()::date,
		    '1 day'::interval
		  )::date AS d
		)
		SELECT d, COALESCE(COUNT(u.created_at), 0)
		FROM dates
		LEFT JOIN users u ON u.created_at::date = d AND u.deleted_at IS NULL
		GROUP BY d ORDER BY d
	`)
	if err != nil {
		return data, fmt.Errorf("admin growth: user signups: %w", err)
	}
	data.UserSignups = signups

	attempts, err := r.queryDailySeries(ctx, days, `
		WITH dates AS (
		  SELECT generate_series(
		    (NOW() - make_interval(days := $1 - 1))::date,
		    NOW()::date,
		    '1 day'::interval
		  )::date AS d
		)
		SELECT d, COALESCE(COUNT(sa.started_at), 0)
		FROM dates
		LEFT JOIN simulado_attempts sa ON sa.started_at::date = d
		GROUP BY d ORDER BY d
	`)
	if err != nil {
		return data, fmt.Errorf("admin growth: simulado attempts: %w", err)
	}
	data.SimuladoAttempts = attempts

	return data, nil
}

func (r *pgxAdminGrowthRepo) queryDailySeries(ctx context.Context, days int, query string) ([]handlers.DayCount, error) {
	rows, err := r.pool.Query(ctx, query, days)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var series []handlers.DayCount
	for rows.Next() {
		var d time.Time
		var count int64
		if err := rows.Scan(&d, &count); err != nil {
			return nil, err
		}
		series = append(series, handlers.DayCount{
			Date:  d.Format("2006-01-02"),
			Count: count,
		})
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	if series == nil {
		series = []handlers.DayCount{}
	}
	return series, nil
}
