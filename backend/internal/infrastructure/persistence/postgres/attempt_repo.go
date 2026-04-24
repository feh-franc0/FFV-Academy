package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// AttemptRepo implementa domsim.AttemptRepository.
type AttemptRepo struct {
	pool *pgxpool.Pool
}

func NewAttemptRepo(pool *pgxpool.Pool) *AttemptRepo {
	return &AttemptRepo{pool: pool}
}

func (r *AttemptRepo) Save(ctx context.Context, a *domsim.Attempt) error {
	answersJSON, err := marshalAnswers(a.Answers())
	if err != nil {
		return fmt.Errorf("attempt repo: marshal answers: %w", err)
	}
	flagsJSON, err := marshalFlags(a.ReviewFlags())
	if err != nil {
		return fmt.Errorf("attempt repo: marshal flags: %w", err)
	}

	const q = `
		INSERT INTO simulado_attempts
			(id, user_id, simulado_id, started_at, deadline, answers, review_flags, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $4)
	`
	_, err = r.pool.Exec(ctx, q,
		a.ID().String(), a.UserID().String(), a.SimuladoID().String(),
		a.StartedAt(), a.Deadline(), answersJSON, flagsJSON,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return fmt.Errorf("%w: attempt ativa já existe para este simulado", shared.ErrConflict)
		}
		return fmt.Errorf("attempt repo: save: %w", err)
	}
	return nil
}

func (r *AttemptRepo) Update(ctx context.Context, a *domsim.Attempt) error {
	answersJSON, err := marshalAnswers(a.Answers())
	if err != nil {
		return fmt.Errorf("attempt repo: marshal answers: %w", err)
	}
	flagsJSON, err := marshalFlags(a.ReviewFlags())
	if err != nil {
		return fmt.Errorf("attempt repo: marshal flags: %w", err)
	}

	scoreJSON, err := marshalScore(a.Score())
	if err != nil {
		return fmt.Errorf("attempt repo: marshal score: %w", err)
	}

	var scoreValue *int
	var passed *bool
	if s := a.Score(); s != nil {
		v := s.Value()
		scoreValue = &v
		p := s.Passed()
		passed = &p
	}

	const q = `
		UPDATE simulado_attempts SET
			answers = $2,
			review_flags = $3,
			finished_at = $4,
			score = $5,
			passed = $6,
			score_details = $7,
			updated_at = $8
		WHERE id = $1
	`
	res, err := r.pool.Exec(ctx, q,
		a.ID().String(), answersJSON, flagsJSON,
		a.FinishedAt(), scoreValue, passed, scoreJSON,
		time.Now().UTC(),
	)
	if err != nil {
		return fmt.Errorf("attempt repo: update: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("%w: attempt", shared.ErrNotFound)
	}
	return nil
}

func (r *AttemptRepo) FindByID(ctx context.Context, id shared.AttemptID) (*domsim.Attempt, error) {
	const q = `
		SELECT id, user_id, simulado_id, started_at, deadline, finished_at,
		       answers, review_flags, score, passed, score_details
		FROM simulado_attempts WHERE id = $1
	`
	row := r.pool.QueryRow(ctx, q, id.String())
	a, err := scanAttempt(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: attempt", shared.ErrNotFound)
		}
		return nil, fmt.Errorf("attempt repo: find by id: %w", err)
	}
	return a, nil
}

func (r *AttemptRepo) FindActiveByUserAndSimulado(ctx context.Context, userID shared.UserID, simID shared.SimuladoID) (*domsim.Attempt, error) {
	const q = `
		SELECT id, user_id, simulado_id, started_at, deadline, finished_at,
		       answers, review_flags, score, passed, score_details
		FROM simulado_attempts
		WHERE user_id = $1 AND simulado_id = $2 AND finished_at IS NULL
		LIMIT 1
	`
	row := r.pool.QueryRow(ctx, q, userID.String(), simID.String())
	a, err := scanAttempt(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: active attempt", shared.ErrNotFound)
		}
		return nil, fmt.Errorf("attempt repo: find active: %w", err)
	}
	return a, nil
}

func (r *AttemptRepo) ListByUser(ctx context.Context, userID shared.UserID, limit, offset int) ([]*domsim.Attempt, int, error) {
	var total int
	if err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM simulado_attempts WHERE user_id = $1`, userID.String(),
	).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.pool.Query(ctx, `
		SELECT id, user_id, simulado_id, started_at, deadline, finished_at,
		       answers, review_flags, score, passed, score_details
		FROM simulado_attempts WHERE user_id = $1
		ORDER BY started_at DESC LIMIT $2 OFFSET $3
	`, userID.String(), limit, offset)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	attempts := make([]*domsim.Attempt, 0, limit)
	for rows.Next() {
		a, scanErr := scanAttempt(rows)
		if scanErr != nil {
			return nil, 0, scanErr
		}
		attempts = append(attempts, a)
	}
	return attempts, total, rows.Err()
}

type attemptScanner interface {
	Scan(dest ...any) error
}

func scanAttempt(row attemptScanner) (*domsim.Attempt, error) {
	var (
		idStr       string
		userIDStr   string
		simIDStr    string
		startedAt   time.Time
		deadline    time.Time
		finishedAt  *time.Time
		answersJSON []byte
		flagsJSON   []byte
		scoreVal    *int
		passed      *bool
		scoreJSON   []byte
	)

	if err := row.Scan(
		&idStr, &userIDStr, &simIDStr, &startedAt, &deadline, &finishedAt,
		&answersJSON, &flagsJSON, &scoreVal, &passed, &scoreJSON,
	); err != nil {
		return nil, err
	}

	answers, err := unmarshalAnswers(answersJSON)
	if err != nil {
		return nil, fmt.Errorf("unmarshal answers: %w", err)
	}
	flags, err := unmarshalFlags(flagsJSON)
	if err != nil {
		return nil, fmt.Errorf("unmarshal flags: %w", err)
	}
	score := unmarshalScore(scoreVal, passed, scoreJSON)

	return domsim.ReconstituteAttempt(
		shared.AttemptID(idStr),
		shared.UserID(userIDStr),
		shared.SimuladoID(simIDStr),
		startedAt, deadline, finishedAt,
		answers, flags, score,
	), nil
}

func marshalAnswers(a domsim.Answers) ([]byte, error) {
	m := make(map[string]string)
	for k, v := range a.ToMap() {
		m[string(k)] = string(v)
	}
	return json.Marshal(m)
}

func unmarshalAnswers(data []byte) (map[shared.QuestionID]domsim.OptionID, error) {
	if len(data) == 0 {
		return make(map[shared.QuestionID]domsim.OptionID), nil
	}
	var m map[string]string
	if err := json.Unmarshal(data, &m); err != nil {
		return nil, err
	}
	result := make(map[shared.QuestionID]domsim.OptionID, len(m))
	for k, v := range m {
		result[shared.QuestionID(k)] = domsim.OptionID(v)
	}
	return result, nil
}

func marshalFlags(s domsim.QuestionIDSet) ([]byte, error) {
	ids := s.ToSlice()
	strs := make([]string, len(ids))
	for i, id := range ids {
		strs[i] = string(id)
	}
	return json.Marshal(strs)
}

func unmarshalFlags(data []byte) ([]shared.QuestionID, error) {
	if len(data) == 0 {
		return nil, nil
	}
	var strs []string
	if err := json.Unmarshal(data, &strs); err != nil {
		return nil, err
	}
	ids := make([]shared.QuestionID, len(strs))
	for i, s := range strs {
		ids[i] = shared.QuestionID(s)
	}
	return ids, nil
}

func marshalScore(s *domsim.Score) ([]byte, error) {
	if s == nil {
		return nil, nil
	}
	type byTopicEntry struct {
		Correct int `json:"correct"`
		Total   int `json:"total"`
	}
	m := map[string]interface{}{
		"value":           s.Value(),
		"passed":          s.Passed(),
		"correctCount":    s.CorrectCount(),
		"totalQuestions":  s.TotalQuestions(),
	}
	bt := make(map[string]byTopicEntry)
	for topic, counts := range s.ByTopic() {
		bt[string(topic)] = byTopicEntry{Correct: counts.Correct, Total: counts.Total}
	}
	m["byTopic"] = bt
	return json.Marshal(m)
}

func unmarshalScore(value *int, passed *bool, data []byte) *domsim.Score {
	if value == nil || passed == nil {
		return nil
	}
	// Score básico — byTopic do JSON completo.
	var scoreData struct {
		CorrectCount   int `json:"correctCount"`
		TotalQuestions int `json:"totalQuestions"`
		ByTopic        map[string]struct {
			Correct int `json:"correct"`
			Total   int `json:"total"`
		} `json:"byTopic"`
	}
	_ = json.Unmarshal(data, &scoreData)

	byTopic := make(map[domsim.Topic]domsim.TopicCounts)
	for k, v := range scoreData.ByTopic {
		byTopic[domsim.Topic(k)] = domsim.TopicCounts{Correct: v.Correct, Total: v.Total}
	}

	s := domsim.NewScore(domsim.ScoreResult{
		Value:          *value,
		Passed:         *passed,
		ByTopic:        byTopic,
		CorrectCount:   scoreData.CorrectCount,
		TotalQuestions: scoreData.TotalQuestions,
	})
	return &s
}
