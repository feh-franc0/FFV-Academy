package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	dombase "github.com/fernandofv/api/internal/domain/base"
	"github.com/fernandofv/api/internal/domain/shared"
)

// BaseRepo — leitura do catálogo `bases` (migration 48+).
type BaseRepo struct {
	pool *pgxpool.Pool
}

func NewBaseRepo(pool *pgxpool.Pool) *BaseRepo {
	return &BaseRepo{pool: pool}
}

const baseSelectColumns = `
    slug, name, area_label, description, icon, status, url,
    modules, trails, hubs,
    theme, nav_items, slogans, microcopy, footer, features,
    hero, paths, hubs_cards, playlists, final_cta,
    hide_global_content_nav, hide_comunidade, sort_order
`

// GetBySlug retorna a base pelo slug ou shared.ErrNotFound.
func (r *BaseRepo) GetBySlug(ctx context.Context, slug string) (*dombase.Base, error) {
	row := r.pool.QueryRow(ctx, "SELECT "+baseSelectColumns+" FROM bases WHERE slug = $1", slug)
	b, err := scanBase(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: base %q", shared.ErrNotFound, slug)
		}
		return nil, fmt.Errorf("base_repo: get %q: %w", slug, err)
	}
	return b, nil
}

// List retorna todas as bases ordenadas por sort_order asc.
func (r *BaseRepo) List(ctx context.Context) ([]*dombase.Base, error) {
	rows, err := r.pool.Query(ctx, "SELECT "+baseSelectColumns+" FROM bases ORDER BY sort_order ASC, slug ASC")
	if err != nil {
		return nil, fmt.Errorf("base_repo: list: %w", err)
	}
	defer rows.Close()

	var out []*dombase.Base
	for rows.Next() {
		b, err := scanBase(rows)
		if err != nil {
			return nil, fmt.Errorf("base_repo: scan: %w", err)
		}
		out = append(out, b)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("base_repo: list rows: %w", err)
	}
	return out, nil
}

// rowScanner abstrai *pgx.Rows e *pgx.Row.
type rowScanner interface {
	Scan(dest ...any) error
}

func scanBase(row rowScanner) (*dombase.Base, error) {
	var (
		b                                        dombase.Base
		themeRaw, navRaw, sloganRaw, microRaw    []byte
		footerRaw, featuresRaw                   []byte
		heroRaw, pathsRaw, hubsRaw, playlistsRaw []byte
		finalCtaRaw                              []byte
	)
	err := row.Scan(
		&b.Slug, &b.Name, &b.AreaLabel, &b.Description, &b.Icon, &b.Status, &b.URL,
		&b.Modules, &b.Trails, &b.Hubs,
		&themeRaw, &navRaw, &sloganRaw, &microRaw, &footerRaw, &featuresRaw,
		&heroRaw, &pathsRaw, &hubsRaw, &playlistsRaw, &finalCtaRaw,
		&b.HideGlobalContentNav, &b.HideComunidade, &b.SortOrder,
	)
	if err != nil {
		return nil, err
	}
	if err := unmarshalIfPresent(themeRaw, &b.Theme); err != nil {
		return nil, fmt.Errorf("theme: %w", err)
	}
	if err := unmarshalIfPresent(navRaw, &b.NavItems); err != nil {
		return nil, fmt.Errorf("nav_items: %w", err)
	}
	if err := unmarshalIfPresent(sloganRaw, &b.Slogans); err != nil {
		return nil, fmt.Errorf("slogans: %w", err)
	}
	if err := unmarshalIfPresent(microRaw, &b.Microcopy); err != nil {
		return nil, fmt.Errorf("microcopy: %w", err)
	}
	if len(footerRaw) > 0 {
		b.Footer = json.RawMessage(footerRaw)
	}
	if err := unmarshalIfPresent(featuresRaw, &b.Features); err != nil {
		return nil, fmt.Errorf("features: %w", err)
	}
	if err := unmarshalIfPresent(heroRaw, &b.Hero); err != nil {
		return nil, fmt.Errorf("hero: %w", err)
	}
	if err := unmarshalIfPresent(pathsRaw, &b.Paths); err != nil {
		return nil, fmt.Errorf("paths: %w", err)
	}
	if err := unmarshalIfPresent(hubsRaw, &b.HubCards); err != nil {
		return nil, fmt.Errorf("hubs_cards: %w", err)
	}
	if err := unmarshalIfPresent(playlistsRaw, &b.Playlists); err != nil {
		return nil, fmt.Errorf("playlists: %w", err)
	}
	if err := unmarshalIfPresent(finalCtaRaw, &b.FinalCta); err != nil {
		return nil, fmt.Errorf("final_cta: %w", err)
	}
	return &b, nil
}

// unmarshalIfPresent ignora colunas JSONB vazias '{}' / '[]' / null — útil
// pra bases queued onde só slug/name/status estão preenchidos.
func unmarshalIfPresent(raw []byte, dst any) error {
	if len(raw) == 0 {
		return nil
	}
	// '{}' ou '[]' decodificam para zero value naturalmente; deixamos json
	// resolver. Strings vazias podem aparecer em colunas com default '{}' —
	// nesse caso, json.Unmarshal de '{}' já dá no-op para slices/maps.
	return json.Unmarshal(raw, dst)
}

// Compile-time check.
var _ dombase.Repository = (*BaseRepo)(nil)
