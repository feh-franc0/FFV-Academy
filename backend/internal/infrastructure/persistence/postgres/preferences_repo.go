package postgres

import (
	"context"
	"encoding/json"
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

// frequencyPayload é o shape JSON armazenado em frequency_payload.
// daysPerWeek é usado quando frequency_kind == "weekly".
// weekdays é usado quando frequency_kind == "specific_days".
type frequencyPayload struct {
	DaysPerWeek int   `json:"daysPerWeek,omitempty"`
	Weekdays    []int `json:"weekdays,omitempty"`
}

func (r *PreferencesRepo) FindByUser(ctx context.Context, userID shared.UserID) (*dompref.Preferences, error) {
	const q = `
		SELECT user_id, hub_ids, trail_ids, certification_ids, objectives,
		       skill_level, daily_question_enabled, onboarded_at,
		       created_at, updated_at,
		       interested_bases, home_base, learning_goals, topic_tags,
		       frequency_kind, frequency_payload, preferred_materials
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
		// Fase 3
		interestedBases    []string
		homeBase           *string
		learningGoals      string
		topicTags          []string
		frequencyKind      string
		frequencyPayloadB  []byte // JSONB → bytes
		preferredMaterials []string
	)
	if err := row.Scan(
		&uid, &hubIDs, &trailIDs, &certIDs, &objectives,
		&skillLevel, &dailyQuestionEnabled, &onboardedAt,
		&createdAt, &updatedAt,
		&interestedBases, &homeBase, &learningGoals, &topicTags,
		&frequencyKind, &frequencyPayloadB, &preferredMaterials,
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

	prefs := dompref.Reconstitute(
		shared.UserID(uid),
		hubIDs, trailIDs, certIDs, objectives,
		level,
		dailyQuestionEnabled,
		onboardedAt,
		createdAt,
		updatedAt,
	)

	// Decode frequency payload + reconstrói VO
	var fp frequencyPayload
	if len(frequencyPayloadB) > 0 {
		if err := json.Unmarshal(frequencyPayloadB, &fp); err != nil {
			return nil, fmt.Errorf("preferences repo: decode frequency_payload: %w", err)
		}
	}
	freq, err := dompref.NewFrequency(dompref.FrequencyKind(frequencyKind), fp.DaysPerWeek, fp.Weekdays)
	if err != nil {
		// Fallback gracioso pro default — não queremos quebrar leitura se DB
		// tem valor estranho. Log seria útil aqui (futuro).
		freq = dompref.DefaultFrequency()
	}

	hb := ""
	if homeBase != nil {
		hb = *homeBase
	}

	mats := make([]dompref.MaterialKind, 0, len(preferredMaterials))
	for _, m := range preferredMaterials {
		mats = append(mats, dompref.MaterialKind(m))
	}

	prefs.SetPhase3(interestedBases, hb, learningGoals, topicTags, freq, mats)
	return prefs, nil
}

func (r *PreferencesRepo) Upsert(ctx context.Context, p *dompref.Preferences) error {
	const q = `
		INSERT INTO user_preferences (
			user_id, hub_ids, trail_ids, certification_ids, objectives,
			skill_level, daily_question_enabled, onboarded_at, created_at,
			interested_bases, home_base, learning_goals, topic_tags,
			frequency_kind, frequency_payload, preferred_materials
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9,
			$10, $11, $12, $13, $14, $15, $16
		)
		ON CONFLICT (user_id) DO UPDATE SET
			hub_ids                = EXCLUDED.hub_ids,
			trail_ids              = EXCLUDED.trail_ids,
			certification_ids      = EXCLUDED.certification_ids,
			objectives             = EXCLUDED.objectives,
			skill_level            = EXCLUDED.skill_level,
			daily_question_enabled = EXCLUDED.daily_question_enabled,
			onboarded_at           = COALESCE(user_preferences.onboarded_at, EXCLUDED.onboarded_at),
			interested_bases       = EXCLUDED.interested_bases,
			home_base              = EXCLUDED.home_base,
			learning_goals         = EXCLUDED.learning_goals,
			topic_tags             = EXCLUDED.topic_tags,
			frequency_kind         = EXCLUDED.frequency_kind,
			frequency_payload      = EXCLUDED.frequency_payload,
			preferred_materials    = EXCLUDED.preferred_materials
		-- onboarded_at NUNCA volta a NULL após preenchido (COALESCE preserva valor original).
	`

	var skillLevel *string
	if p.SkillLevel() != "" {
		s := string(p.SkillLevel())
		skillLevel = &s
	}

	var homeBase *string
	if hb := p.HomeBase(); hb != "" {
		homeBase = &hb
	}

	freq := p.Frequency()
	freqPayload, err := json.Marshal(frequencyPayload{
		DaysPerWeek: freq.DaysPerWeek,
		Weekdays:    freq.Weekdays,
	})
	if err != nil {
		return fmt.Errorf("preferences repo: marshal frequency: %w", err)
	}

	// Materials como []string pro driver pgx
	matsRaw := p.PreferredMaterials()
	mats := make([]string, 0, len(matsRaw))
	for _, m := range matsRaw {
		mats = append(mats, string(m))
	}

	_, err = r.pool.Exec(ctx, q,
		string(p.UserID()),
		p.HubIDs(),
		p.TrailIDs(),
		p.CertificationIDs(),
		p.Objectives(),
		skillLevel,
		p.DailyQuestionEnabled(),
		p.OnboardedAt(),
		p.CreatedAt(),
		p.InterestedBases(),
		homeBase,
		p.LearningGoals(),
		p.TopicTags(),
		string(freq.Kind),
		freqPayload,
		mats,
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
