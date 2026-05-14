// Adapters Postgres dos repositórios News / Cheatsheets / Playlists.
package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── News ─────────────────────────────────────────────────────────────────

type pgxNewsRepo struct{ pool *pgxpool.Pool }

var _ handlers.NewsRepository = (*pgxNewsRepo)(nil)

func (r *pgxNewsRepo) List(ctx context.Context, f handlers.NewsFilter) ([]handlers.NewsItem, int64, error) {
	conds := []string{"deleted_at IS NULL"}
	args := []interface{}{}
	idx := 1

	if !f.IncludeAll {
		conds = append(conds, "status = 'published'")
	}
	if f.Category != "" {
		conds = append(conds, fmt.Sprintf("category = $%d", idx))
		args = append(args, f.Category)
		idx++
	}
	if f.HotOnly {
		conds = append(conds, "hot = true")
	}
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM news_articles WHERE "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}

	args = append(args, f.Limit, f.Offset)
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, slug, title, summary, source, source_url,
		       COALESCE(image_url, ''), category, hot, tags,
		       to_char(published_at, 'YYYY-MM-DD'), status, created_at, updated_at
		FROM news_articles
		WHERE `+where+`
		ORDER BY published_at DESC, created_at DESC
		LIMIT $`+itoa(idx)+` OFFSET $`+itoa(idx+1), args...)
	if err != nil {
		return nil, total, err
	}
	defer rows.Close()

	out := make([]handlers.NewsItem, 0)
	for rows.Next() {
		var it handlers.NewsItem
		var tagsBytes []byte
		if err := rows.Scan(&it.ID, &it.Slug, &it.Title, &it.Summary, &it.Source, &it.SourceURL,
			&it.ImageURL, &it.Category, &it.Hot, &tagsBytes, &it.PublishedAt, &it.Status, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return out, total, err
		}
		_ = json.Unmarshal(tagsBytes, &it.Tags)
		if it.Tags == nil {
			it.Tags = []string{}
		}
		out = append(out, it)
	}
	return out, total, nil
}

func (r *pgxNewsRepo) GetBySlug(ctx context.Context, slug string) (*handlers.NewsItem, error) {
	var it handlers.NewsItem
	var tagsBytes []byte
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, slug, title, summary, source, source_url,
		       COALESCE(image_url, ''), category, hot, tags,
		       to_char(published_at, 'YYYY-MM-DD'), status, created_at, updated_at
		FROM news_articles
		WHERE slug = $1 AND deleted_at IS NULL
	`, slug).Scan(&it.ID, &it.Slug, &it.Title, &it.Summary, &it.Source, &it.SourceURL,
		&it.ImageURL, &it.Category, &it.Hot, &tagsBytes, &it.PublishedAt, &it.Status, &it.CreatedAt, &it.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(tagsBytes, &it.Tags)
	if it.Tags == nil {
		it.Tags = []string{}
	}
	return &it, nil
}

func (r *pgxNewsRepo) Create(ctx context.Context, in handlers.NewsInput) (*handlers.NewsItem, error) {
	tags, _ := json.Marshal(in.Tags)
	var img *string
	if in.ImageURL != "" {
		img = &in.ImageURL
	}
	publishedAt, err := time.Parse("2006-01-02", in.PublishedAt)
	if err != nil {
		return nil, fmt.Errorf("publishedAt inválido: %w", err)
	}

	_, err = r.pool.Exec(ctx, `
		INSERT INTO news_articles (slug, title, summary, source, source_url, image_url, category, hot, tags, published_at, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, in.Slug, in.Title, in.Summary, in.Source, in.SourceURL, img, in.Category, in.Hot, tags, publishedAt, in.Status)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, fmt.Errorf("news: slug já existe: %w", shared.ErrConflict)
		}
		return nil, err
	}
	return r.GetBySlug(ctx, in.Slug)
}

func (r *pgxNewsRepo) Update(ctx context.Context, slug string, in handlers.NewsInput) (*handlers.NewsItem, error) {
	tags, _ := json.Marshal(in.Tags)
	var img *string
	if in.ImageURL != "" {
		img = &in.ImageURL
	}
	publishedAt, err := time.Parse("2006-01-02", in.PublishedAt)
	if err != nil {
		return nil, fmt.Errorf("publishedAt inválido: %w", err)
	}

	cmd, err := r.pool.Exec(ctx, `
		UPDATE news_articles SET title=$2, summary=$3, source=$4, source_url=$5, image_url=$6,
		                          category=$7, hot=$8, tags=$9, published_at=$10, status=$11,
		                          updated_at=now()
		WHERE slug=$1 AND deleted_at IS NULL
	`, slug, in.Title, in.Summary, in.Source, in.SourceURL, img, in.Category, in.Hot, tags, publishedAt, in.Status)
	if err != nil {
		return nil, err
	}
	if cmd.RowsAffected() == 0 {
		return nil, fmt.Errorf("news: %w", shared.ErrNotFound)
	}
	return r.GetBySlug(ctx, slug)
}

func (r *pgxNewsRepo) Delete(ctx context.Context, slug string) error {
	cmd, err := r.pool.Exec(ctx, `UPDATE news_articles SET deleted_at=now() WHERE slug=$1 AND deleted_at IS NULL`, slug)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("news: %w", shared.ErrNotFound)
	}
	return nil
}

// ─── Cheatsheets ──────────────────────────────────────────────────────────

type pgxCheatsheetsRepo struct{ pool *pgxpool.Pool }

var _ handlers.CheatsheetsRepository = (*pgxCheatsheetsRepo)(nil)

func (r *pgxCheatsheetsRepo) List(ctx context.Context) ([]handlers.CheatsheetSummary, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT slug, title, COALESCE(subtitle, ''), COALESCE(description, ''),
		       accent, COALESCE(emoji, ''), "order"
		FROM cheatsheets
		WHERE deleted_at IS NULL AND status = 'published'
		ORDER BY "order" ASC, title ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]handlers.CheatsheetSummary, 0)
	for rows.Next() {
		var it handlers.CheatsheetSummary
		if err := rows.Scan(&it.Slug, &it.Title, &it.Subtitle, &it.Description, &it.Accent, &it.Emoji, &it.Order); err != nil {
			return out, err
		}
		out = append(out, it)
	}
	return out, nil
}

func (r *pgxCheatsheetsRepo) GetBySlug(ctx context.Context, slug string) (*handlers.CheatsheetFull, error) {
	var it handlers.CheatsheetFull
	err := r.pool.QueryRow(ctx, `
		SELECT slug, title, COALESCE(subtitle, ''), COALESCE(description, ''),
		       accent, COALESCE(emoji, ''), "order", body_md, status, created_at, updated_at
		FROM cheatsheets
		WHERE slug = $1 AND deleted_at IS NULL
	`, slug).Scan(&it.Slug, &it.Title, &it.Subtitle, &it.Description, &it.Accent, &it.Emoji, &it.Order,
		&it.BodyMD, &it.Status, &it.CreatedAt, &it.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &it, nil
}

func (r *pgxCheatsheetsRepo) Create(ctx context.Context, in handlers.CheatsheetInput) (*handlers.CheatsheetFull, error) {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO cheatsheets (slug, title, subtitle, description, accent, emoji, body_md, "order", status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, in.Slug, in.Title, in.Subtitle, in.Description, in.Accent, in.Emoji, in.BodyMD, in.Order, in.Status)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, fmt.Errorf("cheatsheets: slug já existe: %w", shared.ErrConflict)
		}
		return nil, err
	}
	return r.GetBySlug(ctx, in.Slug)
}

func (r *pgxCheatsheetsRepo) Update(ctx context.Context, slug string, in handlers.CheatsheetInput) (*handlers.CheatsheetFull, error) {
	cmd, err := r.pool.Exec(ctx, `
		UPDATE cheatsheets SET title=$2, subtitle=$3, description=$4, accent=$5, emoji=$6,
		                       body_md=$7, "order"=$8, status=$9, updated_at=now()
		WHERE slug=$1 AND deleted_at IS NULL
	`, slug, in.Title, in.Subtitle, in.Description, in.Accent, in.Emoji, in.BodyMD, in.Order, in.Status)
	if err != nil {
		return nil, err
	}
	if cmd.RowsAffected() == 0 {
		return nil, fmt.Errorf("cheatsheets: %w", shared.ErrNotFound)
	}
	return r.GetBySlug(ctx, slug)
}

func (r *pgxCheatsheetsRepo) Delete(ctx context.Context, slug string) error {
	cmd, err := r.pool.Exec(ctx, `UPDATE cheatsheets SET deleted_at=now() WHERE slug=$1 AND deleted_at IS NULL`, slug)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("cheatsheets: %w", shared.ErrNotFound)
	}
	return nil
}

// ─── Playlists ────────────────────────────────────────────────────────────

type pgxPlaylistsRepo struct{ pool *pgxpool.Pool }

var _ handlers.PlaylistsRepository = (*pgxPlaylistsRepo)(nil)

func (r *pgxPlaylistsRepo) List(ctx context.Context) ([]handlers.Playlist, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id::text, slug, title, COALESCE(subtitle, ''), COALESCE(audience, ''),
		       color, COALESCE(emoji, ''), module_slugs, "order", status, created_at, updated_at
		FROM playlists
		WHERE deleted_at IS NULL AND status = 'published'
		ORDER BY "order" ASC, title ASC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]handlers.Playlist, 0)
	for rows.Next() {
		var it handlers.Playlist
		var slugsBytes []byte
		if err := rows.Scan(&it.ID, &it.Slug, &it.Title, &it.Subtitle, &it.Audience,
			&it.Color, &it.Emoji, &slugsBytes, &it.Order, &it.Status, &it.CreatedAt, &it.UpdatedAt); err != nil {
			return out, err
		}
		_ = json.Unmarshal(slugsBytes, &it.ModuleSlugs)
		if it.ModuleSlugs == nil {
			it.ModuleSlugs = []string{}
		}
		out = append(out, it)
	}
	return out, nil
}

func (r *pgxPlaylistsRepo) GetBySlug(ctx context.Context, slug string) (*handlers.Playlist, error) {
	var it handlers.Playlist
	var slugsBytes []byte
	err := r.pool.QueryRow(ctx, `
		SELECT id::text, slug, title, COALESCE(subtitle, ''), COALESCE(audience, ''),
		       color, COALESCE(emoji, ''), module_slugs, "order", status, created_at, updated_at
		FROM playlists
		WHERE slug = $1 AND deleted_at IS NULL
	`, slug).Scan(&it.ID, &it.Slug, &it.Title, &it.Subtitle, &it.Audience,
		&it.Color, &it.Emoji, &slugsBytes, &it.Order, &it.Status, &it.CreatedAt, &it.UpdatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	_ = json.Unmarshal(slugsBytes, &it.ModuleSlugs)
	if it.ModuleSlugs == nil {
		it.ModuleSlugs = []string{}
	}
	return &it, nil
}

func (r *pgxPlaylistsRepo) Create(ctx context.Context, in handlers.PlaylistInput) (*handlers.Playlist, error) {
	slugs, _ := json.Marshal(in.ModuleSlugs)
	_, err := r.pool.Exec(ctx, `
		INSERT INTO playlists (slug, title, subtitle, audience, color, emoji, module_slugs, "order", status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`, in.Slug, in.Title, in.Subtitle, in.Audience, in.Color, in.Emoji, slugs, in.Order, in.Status)
	if err != nil {
		if isUniqueViolation(err) {
			return nil, fmt.Errorf("playlists: slug já existe: %w", shared.ErrConflict)
		}
		return nil, err
	}
	return r.GetBySlug(ctx, in.Slug)
}

func (r *pgxPlaylistsRepo) Update(ctx context.Context, slug string, in handlers.PlaylistInput) (*handlers.Playlist, error) {
	slugs, _ := json.Marshal(in.ModuleSlugs)
	cmd, err := r.pool.Exec(ctx, `
		UPDATE playlists SET title=$2, subtitle=$3, audience=$4, color=$5, emoji=$6,
		                     module_slugs=$7, "order"=$8, status=$9, updated_at=now()
		WHERE slug=$1 AND deleted_at IS NULL
	`, slug, in.Title, in.Subtitle, in.Audience, in.Color, in.Emoji, slugs, in.Order, in.Status)
	if err != nil {
		return nil, err
	}
	if cmd.RowsAffected() == 0 {
		return nil, fmt.Errorf("playlists: %w", shared.ErrNotFound)
	}
	return r.GetBySlug(ctx, slug)
}

func (r *pgxPlaylistsRepo) Delete(ctx context.Context, slug string) error {
	cmd, err := r.pool.Exec(ctx, `UPDATE playlists SET deleted_at=now() WHERE slug=$1 AND deleted_at IS NULL`, slug)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return fmt.Errorf("playlists: %w", shared.ErrNotFound)
	}
	return nil
}

// ─── Helpers ──────────────────────────────────────────────────────────────

func isUniqueViolation(err error) bool {
	var pgErr *pgconnError
	if errors.As(err, &pgErr) && pgErr.Code == "23505" {
		return true
	}
	return strings.Contains(err.Error(), "duplicate key") || strings.Contains(err.Error(), "23505")
}

// pgconnError é um stub — pgx retorna *pgconn.PgError mas evitamos import direto
// pra reduzir acoplamento. Usamos string-match como fallback.
type pgconnError struct {
	Code string
}

func (e *pgconnError) Error() string { return e.Code }
