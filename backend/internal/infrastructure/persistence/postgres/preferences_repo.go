package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	dompref "github.com/fernandofv/api/internal/domain/preferences"
	"github.com/fernandofv/api/internal/domain/shared"
)

// PreferencesRepo implementa dompref.Repository sobre Postgres.
//
// PADRÕES:
//   - Listas armazenadas como TEXT[] (Postgres array nativo) — driver pgx
//     mapeia naturalmente para []string sem JSON intermediate.
//   - Upsert via INSERT ... ON CONFLICT (user_id) DO UPDATE — atomicidade
//     garantida pelo PRIMARY KEY constraint.
//   - updated_at é gerenciado por trigger na 000043 (sem manipulação manual).
type PreferencesRepo struct {
	pool *pgxpool.Pool
}

func NewPreferencesRepo(pool *pgxpool.Pool) *PreferencesRepo {
	return &PreferencesRepo{pool: pool}
}

func (r *PreferencesRepo) FindByUser(ctx context.Context, userID shared.UserID) (*dompref.Preferences, error) {
	const q = `
		SELECT user_id, hub_ids, trail_ids, certification_ids, objectives,
		       skill_level, daily_question_enabled, onboarded_at,
		       created_at, updated_at
		FROM user_preferences
		WHERE user_id = $1
	`
	row := r.pool.QueryRow(ctx, q, string(userID))

	var (
		uid                  string
		hubIDs               []string
		trailIDs             []string
		certIDs              []string
		objectives           []string
		skillLevel           *string
		dailyQuestionEnabled bool
		onboardedAt          *time.Time
		createdAt            time.Time
		updatedAt            time.Time
	)
	if err := row.Scan(
		&uid, &hubIDs, &trailIDs, &certIDs, &objectives,
		&skillLevel, &dailyQuestionEnabled, &onboardedAt,
		&createdAt, &updatedAt,
	); err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: preferences", shared.ErrNotFound)
		}
		return nil, fmt.Errorf("preferences repo: find by user: %w", err)
	}

	level := dompref.SkillLevel("")
	if skillLevel != nil {
		level = dompref.SkillLevel(*skillLevel)
	}

	return dompref.Reconstitute(
		shared.UserID(uid),
		hubIDs, trailIDs, certIDs, objectives,
		level,
		dailyQuestionEnabled,
		onboardedAt,
		createdAt,
		updatedAt,
	), nil
}

func (r *PreferencesRepo) Upsert(ctx context.Context, p *dompref.Preferences) error {
	const q = `
		INSERT INTO user_preferences (
			user_id, hub_ids, trail_ids, certification_ids, objectives,
			skill_level, daily_question_enabled, onboarded_at, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (user_id) DO UPDATE SET
			hub_ids                = EXCLUDED.hub_ids,
			trail_ids              = EXCLUDED.trail_ids,
			certification_ids      = EXCLUDED.certification_ids,
			objectives             = EXCLUDED.objectives,
			skill_level            = EXCLUDED.skill_level,
			daily_question_enabled = EXCLUDED.daily_question_enabled,
			onboarded_at           = COALESCE(user_preferences.onboarded_at, EXCLUDED.onboarded_at)
		-- onboarded_at NUNCA volta a NULL após preenchido (COALESCE preserva valor original).
	`

	var skillLevel *string
	if p.SkillLevel() != "" {
		s := string(p.SkillLevel())
		skillLevel = &s
	}

	_, err := r.pool.Exec(ctx, q,
		string(p.UserID()),
		p.HubIDs(),
		p.TrailIDs(),
		p.CertificationIDs(),
		p.Objectives(),
		skillLevel,
		p.DailyQuestionEnabled(),
		p.OnboardedAt(),
		p.CreatedAt(),
	)
	if err != nil {
		return fmt.Errorf("preferences repo: upsert: %w", err)
	}
	return nil
}

func (r *PreferencesRepo) DeleteByUser(ctx context.Context, userID shared.UserID) error {
	const q = `DELETE FROM user_preferences WHERE user_id = $1`
	_, err := r.pool.Exec(ctx, q, string(userID))
	if err != nil {
		return fmt.Errorf("preferences repo: delete: %w", err)
	}
	return nil
}
