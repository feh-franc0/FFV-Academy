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
		{`SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= now() - INTERVAL '14 days' AND created_at < now() - INTERVAL '7 days'`, &s.UsersPrev7Days},
		{`SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= now() - INTERVAL '30 days'`, &s.UsersLast30Days},
		{`SELECT COUNT(*) FROM users WHERE deleted_at IS NULL AND created_at >= now() - INTERVAL '60 days' AND created_at < now() - INTERVAL '30 days'`, &s.UsersPrev30Days},
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
	// Cada janela "atual" tem seu pareado "prev" deslocado pra trás do mesmo
	// tamanho (24-48h, 7-14d, 30-60d) — usado pelo dashboard pra mostrar delta %.
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '24 hours' AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveDaily)
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '48 hours' AND viewed_at < now() - INTERVAL '24 hours'
		  AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveDailyPrev)
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '7 days' AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveWeekly)
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '14 days' AND viewed_at < now() - INTERVAL '7 days'
		  AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveWeeklyPrev)
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '30 days' AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveMonthly)
	_ = r.pool.QueryRow(ctx, `
		SELECT COUNT(DISTINCT COALESCE(user_id, anon_id, ''))
		FROM module_views
		WHERE viewed_at >= now() - INTERVAL '60 days' AND viewed_at < now() - INTERVAL '30 days'
		  AND COALESCE(user_id, anon_id) IS NOT NULL
	`).Scan(&s.ActiveMonthlyPrev)

	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM module_views WHERE viewed_at >= now() - INTERVAL '7 days'`).Scan(&s.ViewsLast7Days)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM module_views WHERE viewed_at >= now() - INTERVAL '14 days' AND viewed_at < now() - INTERVAL '7 days'`).Scan(&s.ViewsPrev7Days)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM module_views WHERE viewed_at >= now() - INTERVAL '30 days'`).Scan(&s.ViewsLast30Days)
	_ = r.pool.QueryRow(ctx, `SELECT COUNT(*) FROM module_views WHERE viewed_at >= now() - INTERVAL '60 days' AND viewed_at < now() - INTERVAL '30 days'`).Scan(&s.ViewsPrev30Days)

	return s, nil
}

func (r *pgxAdminStatsRepo) GetTopTrails(ctx context.Context, since time.Time, limit int) ([]handlers.TrailViewStat, error) {
	// LEFT JOIN com `trails` traz o nome humano quando o trail_id bate com uma
	// trilha real do currículo. Se não bater (legacy ou trail removido), o
	// COALESCE devolve o próprio id como fallback — não esconde dados, mas
	// também não inventa nome.
	//
	// Filtro kind='module' garante que só views reais de módulo contam. Sem isso,
	// kind=page/admin/simulado polui o ranking (ex: /admin/users gerava trail_id
	// vazio mas tracking antigo enviava trail_id residual).
	rows, err := r.pool.Query(ctx, `
		SELECT v.trail_id, COALESCE(t.name, v.trail_id) AS title, COUNT(*) AS n
		FROM module_views v
		LEFT JOIN trails t ON t.id = v.trail_id
		WHERE v.viewed_at >= $1
		  AND v.trail_id IS NOT NULL AND v.trail_id <> ''
		  AND v.kind = 'module'
		GROUP BY v.trail_id, t.name
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
		if err := rows.Scan(&item.TrailID, &item.Title, &item.Views); err != nil {
			return out, nil
		}
		out = append(out, item)
	}
	return out, nil
}

func (r *pgxAdminStatsRepo) GetTopModules(ctx context.Context, since time.Time, limit int) ([]handlers.ModuleViewStat, error) {
	// Filtro kind='module' essencial: sem isso o ranking misturava homepage (/),
	// /bases, home de bases (tecnologia, medicina-veterinaria) e rotas admin
	// (/admin, /admin/study-requests), todas tratadas como "módulo" só por terem
	// slug preenchido.
	rows, err := r.pool.Query(ctx, `
		SELECT v.slug, COALESCE(a.title, v.slug) AS title, COALESCE(a.trail_id, '') AS trail_id, COUNT(*) AS n
		FROM module_views v
		LEFT JOIN curriculum_articles a ON a.slug = v.slug
		WHERE v.viewed_at >= $1
		  AND v.kind = 'module'
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
	// Helpers pra converter "" em NULL — Postgres usa NULL pra "sem valor"
	// e isso permite que os índices parciais (WHERE col IS NOT NULL) sejam
	// eficientes.
	nullable := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}

	_, err := r.pool.Exec(ctx, `
		INSERT INTO module_views (
			user_id, user_email, user_display_name, anon_id, session_id,
			base_slug, slug, hub_id, trail_id, path, kind,
			referrer, user_agent, viewed_at
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
	`,
		nullable(v.UserID),
		nullable(v.UserEmail),
		nullable(v.UserDisplayName),
		nullable(v.AnonID),
		nullable(v.SessionID),
		nullable(v.BaseSlug),
		v.Slug,
		nullable(v.HubID),
		nullable(v.TrailID),
		nullable(v.Path),
		v.Kind, // NOT NULL com default 'module' — sempre setado pelo handler
		nullable(v.Referrer),
		nullable(v.UserAgent),
		v.ViewedAt,
	)
	return err
}

// ─── UserEventsRepository (ingest de ações deliberadas) ───────────────────

type pgxUserEventsRepo struct{ pool *pgxpool.Pool }

var _ handlers.UserEventsRepository = (*pgxUserEventsRepo)(nil)

func (r *pgxUserEventsRepo) Insert(ctx context.Context, in handlers.UserEventInput) error {
	nullable := func(s string) *string {
		if s == "" {
			return nil
		}
		return &s
	}
	meta := in.Metadata
	if len(meta) == 0 {
		meta = []byte("{}")
	}
	_, err := r.pool.Exec(ctx, `
		INSERT INTO user_events (
			event_type, target_type, target_id,
			user_id, user_email, anon_id, session_id,
			base_slug, path, referrer, user_agent,
			value_num, metadata, occurred_at
		)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
	`,
		in.EventType,
		nullable(in.TargetType),
		nullable(in.TargetID),
		nullable(in.UserID),
		nullable(in.UserEmail),
		nullable(in.AnonID),
		nullable(in.SessionID),
		nullable(in.BaseSlug),
		nullable(in.Path),
		nullable(in.Referrer),
		nullable(in.UserAgent),
		in.ValueNum,
		string(meta),
		in.OccurredAt,
	)
	return err
}

// ─── AdminEventsRepository (feed de interações) ───────────────────────────

type pgxAdminEventsRepo struct{ pool *pgxpool.Pool }

var _ handlers.AdminEventsRepository = (*pgxAdminEventsRepo)(nil)

func (r *pgxAdminEventsRepo) ListEvents(ctx context.Context, q handlers.ListEventsQuery) ([]handlers.EventEntry, error) {
	conds := []string{"occurred_at >= $1", "occurred_at < $2"}
	args := []any{q.Since, q.Until}
	add := func(sql string, val any) {
		args = append(args, val)
		conds = append(conds, sql+"$"+itoa(len(args)))
	}
	if q.EventType != "" {
		add("event_type = ", q.EventType)
	}
	if q.TargetType != "" {
		add("target_type = ", q.TargetType)
	}
	if q.TargetID != "" {
		add("target_id = ", q.TargetID)
	}
	if q.BaseSlug != "" {
		add("base_slug = ", q.BaseSlug)
	}
	if q.UserEmail != "" {
		add("lower(user_email) = ", q.UserEmail)
	}
	args = append(args, q.Limit)
	limitIdx := "$" + itoa(len(args))

	query := `
		SELECT id, occurred_at, event_type,
		       COALESCE(target_type,''), COALESCE(target_id,''),
		       COALESCE(base_slug,''), COALESCE(path,''),
		       COALESCE(user_email,''), '',
		       COALESCE(anon_id,''), COALESCE(session_id,''),
		       value_num, metadata
		FROM user_events
		WHERE ` + joinAnd(conds) + `
		ORDER BY occurred_at DESC
		LIMIT ` + limitIdx

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, fmt.Errorf("admin_events: query: %w", err)
	}
	defer rows.Close()

	out := make([]handlers.EventEntry, 0, q.Limit)
	for rows.Next() {
		var e handlers.EventEntry
		var rawMeta []byte
		if err := rows.Scan(
			&e.ID, &e.OccurredAt, &e.EventType,
			&e.TargetType, &e.TargetID,
			&e.BaseSlug, &e.Path,
			&e.UserEmail, &e.UserDisplayName,
			&e.AnonID, &e.SessionID,
			&e.ValueNum, &rawMeta,
		); err != nil {
			return nil, fmt.Errorf("admin_events: scan: %w", err)
		}
		if len(rawMeta) > 0 {
			e.Metadata = rawMeta
		}
		out = append(out, e)
	}
	return out, rows.Err()
}

func (r *pgxAdminEventsRepo) CountByType(ctx context.Context, since, until time.Time) ([]handlers.EventTypeCount, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT event_type, COUNT(*)
		FROM user_events
		WHERE occurred_at >= $1 AND occurred_at < $2
		GROUP BY event_type
		ORDER BY 2 DESC
		LIMIT 30
	`, since, until)
	if err != nil {
		return nil, fmt.Errorf("admin_events: byType: %w", err)
	}
	defer rows.Close()
	out := []handlers.EventTypeCount{}
	for rows.Next() {
		var c handlers.EventTypeCount
		if err := rows.Scan(&c.EventType, &c.Count); err != nil {
			return nil, err
		}
		out = append(out, c)
	}
	return out, rows.Err()
}

// ─── AdminViewsRepository (feed "quem acessou o quê") ─────────────────────

type pgxAdminViewsRepo struct{ pool *pgxpool.Pool }

var _ handlers.AdminViewsRepository = (*pgxAdminViewsRepo)(nil)

func (r *pgxAdminViewsRepo) ListViews(ctx context.Context, q handlers.ListViewsQuery) ([]handlers.ViewEntry, string, bool, error) {
	// Construímos SQL dinamicamente com placeholders posicionais. Cada filtro
	// vira um AND opcional. Postgres aproveita os índices parciais da mig 51
	// (idx_module_views_base_viewed, idx_module_views_user_email_viewed,
	// idx_module_views_kind_viewed) quando o filtro correspondente é usado.
	//
	// Paginação keyset: ordenação fixa por (viewed_at DESC, id DESC). Quando há
	// cursor, condição extra `(viewed_at, id) < (cursorTime, cursorID)` salta
	// pra próxima página em O(log n) — sem custo de OFFSET com milhões de rows.
	// Truque do limit+1: pedimos limit+1 rows; se o backend devolver >limit,
	// existe próxima página e usamos o último item de `out` como cursor.
	conds := []string{"viewed_at >= $1", "viewed_at < $2"}
	args := []any{q.Since, q.Until}
	add := func(sql string, val any) {
		args = append(args, val)
		conds = append(conds, sql+"$"+itoa(len(args)))
	}
	if q.BaseSlug != "" {
		add("base_slug = ", q.BaseSlug)
	}
	if q.Kind != "" {
		add("kind = ", q.Kind)
	}
	if q.UserEmail != "" {
		add("lower(user_email) = ", q.UserEmail)
	}
	if q.Slug != "" {
		add("slug = ", q.Slug)
	}
	if !q.CursorTime.IsZero() {
		args = append(args, q.CursorTime, q.CursorID)
		idxT := "$" + itoa(len(args)-1)
		idxID := "$" + itoa(len(args))
		conds = append(conds, "(viewed_at, id) < ("+idxT+", "+idxID+")")
	}
	// limit + 1 sentinela
	args = append(args, q.Limit+1)
	limitIdx := "$" + itoa(len(args))

	query := `
		SELECT id, viewed_at,
		       COALESCE(base_slug,'') , kind, slug,
		       COALESCE(path,''), COALESCE(hub_id,''), COALESCE(trail_id,''),
		       COALESCE(user_id,''), COALESCE(user_email,''),
		       COALESCE(user_display_name,''), COALESCE(anon_id,''),
		       COALESCE(session_id,'')
		FROM module_views
		WHERE ` + joinAnd(conds) + `
		ORDER BY viewed_at DESC, id DESC
		LIMIT ` + limitIdx

	rows, err := r.pool.Query(ctx, query, args...)
	if err != nil {
		return nil, "", false, fmt.Errorf("admin_views: query: %w", err)
	}
	defer rows.Close()

	out := make([]handlers.ViewEntry, 0, q.Limit+1)
	for rows.Next() {
		var e handlers.ViewEntry
		if err := rows.Scan(
			&e.ID, &e.ViewedAt,
			&e.BaseSlug, &e.Kind, &e.Slug,
			&e.Path, &e.HubID, &e.TrailID,
			&e.UserID, &e.UserEmail,
			&e.UserDisplayName, &e.AnonID,
			&e.SessionID,
		); err != nil {
			return nil, "", false, fmt.Errorf("admin_views: scan: %w", err)
		}
		out = append(out, e)
	}
	if err := rows.Err(); err != nil {
		return nil, "", false, err
	}

	hasMore := len(out) > q.Limit
	if hasMore {
		out = out[:q.Limit] // descarta o sentinela
	}
	nextCursor := ""
	if hasMore && len(out) > 0 {
		last := out[len(out)-1]
		nextCursor = handlers.EncodeCursor(last.ViewedAt, last.ID)
	}
	return out, nextCursor, hasMore, nil
}

func joinAnd(conds []string) string {
	if len(conds) == 0 {
		return "TRUE"
	}
	out := ""
	for i, c := range conds {
		if i > 0 {
			out += " AND "
		}
		out += c
	}
	return out
}

// ─── AdminMetricsRepository (overview por base) ───────────────────────────

type pgxAdminMetricsRepo struct{ pool *pgxpool.Pool }

var _ handlers.AdminMetricsRepository = (*pgxAdminMetricsRepo)(nil)

// GetOverview agrupa module_views por base/kind no intervalo dado.
// 3 queries paralelas seriam mais rápidas, mas a cardinalidade típica
// (algumas dezenas de milhares de views/semana) cabe numa única query
// agregada com CTEs.
func (r *pgxAdminMetricsRepo) GetOverview(ctx context.Context, since, until time.Time) (handlers.MetricsOverview, error) {
	var o handlers.MetricsOverview

	// Totais agregados (logged = user_email NOT NULL).
	const totalsSQL = `
		SELECT
		    COUNT(*)                                                    AS total,
		    COUNT(*) FILTER (WHERE user_email IS NOT NULL)              AS logged,
		    COUNT(*) FILTER (WHERE user_email IS NULL)                  AS anon
		FROM module_views
		WHERE viewed_at >= $1 AND viewed_at < $2
	`
	if err := r.pool.QueryRow(ctx, totalsSQL, since, until).Scan(
		&o.ViewsTotal, &o.ViewsLogged, &o.ViewsAnon,
	); err != nil {
		return o, fmt.Errorf("admin_metrics: totals: %w", err)
	}

	// By kind.
	rows, err := r.pool.Query(ctx, `
		SELECT kind, COUNT(*)
		FROM module_views
		WHERE viewed_at >= $1 AND viewed_at < $2
		GROUP BY kind
		ORDER BY 2 DESC
	`, since, until)
	if err != nil {
		return o, fmt.Errorf("admin_metrics: by kind: %w", err)
	}
	defer rows.Close()
	for rows.Next() {
		var k handlers.KindCount
		if err := rows.Scan(&k.Kind, &k.Count); err != nil {
			return o, err
		}
		o.ByKind = append(o.ByKind, k)
	}

	// By base — agregação principal.
	baseRows, err := r.pool.Query(ctx, `
		SELECT
		    COALESCE(base_slug, '(sem base)') AS base_slug,
		    COUNT(*) AS total,
		    COUNT(*) FILTER (WHERE user_email IS NOT NULL) AS logged,
		    COUNT(*) FILTER (WHERE user_email IS NULL) AS anon,
		    COUNT(DISTINCT user_email) FILTER (WHERE user_email IS NOT NULL) AS uniq_users,
		    COUNT(DISTINCT anon_id) FILTER (WHERE anon_id IS NOT NULL) AS uniq_visitors,
		    COUNT(DISTINCT session_id) FILTER (WHERE session_id IS NOT NULL) AS uniq_sessions
		FROM module_views
		WHERE viewed_at >= $1 AND viewed_at < $2
		GROUP BY 1
		ORDER BY total DESC
	`, since, until)
	if err != nil {
		return o, fmt.Errorf("admin_metrics: by base: %w", err)
	}
	defer baseRows.Close()
	byBase := []handlers.BaseMetrics{}
	for baseRows.Next() {
		var b handlers.BaseMetrics
		if err := baseRows.Scan(
			&b.BaseSlug, &b.ViewsTotal, &b.ViewsLogged, &b.ViewsAnon,
			&b.UniqueUsers, &b.UniqueVisitors, &b.UniqueSessions,
		); err != nil {
			return o, err
		}
		byBase = append(byBase, b)
	}

	// Top module por base — 1 query por base (cardinalidade baixa, OK).
	for i := range byBase {
		var slug string
		var views int64
		if byBase[i].BaseSlug == "(sem base)" {
			continue
		}
		err := r.pool.QueryRow(ctx, `
			SELECT slug, COUNT(*) AS views
			FROM module_views
			WHERE viewed_at >= $1 AND viewed_at < $2
			  AND base_slug = $3
			  AND kind = 'module'
			GROUP BY slug
			ORDER BY views DESC
			LIMIT 1
		`, since, until, byBase[i].BaseSlug).Scan(&slug, &views)
		if err == nil {
			byBase[i].TopModule = slug
			byBase[i].TopModuleViews = views
		}
		// Erro = sem dados — segue, não falha.
	}
	o.ByBase = byBase
	return o, nil
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
