package postgres

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
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// QuestionRepo implementa domsim.QuestionRepository.
type QuestionRepo struct {
	pool *pgxpool.Pool
}

func NewQuestionRepo(pool *pgxpool.Pool) *QuestionRepo {
	return &QuestionRepo{pool: pool}
}

// GetRandom retorna até count questões aleatórias do simulado.
func (r *QuestionRepo) GetRandom(ctx context.Context, simuladoID string, count int, opts domsim.QuestionQueryOpts) ([]*domsim.DBQuestion, error) {
	args := []interface{}{simuladoID, count}
	conditions := []string{"simulado_id = $1", "status = 'active'"}
	argIdx := 3

	if len(opts.ExcludeIDs) > 0 {
		conditions = append(conditions, fmt.Sprintf("id != ALL($%d)", argIdx))
		args = append(args, opts.ExcludeIDs)
		argIdx++
	}
	if opts.Domain != "" {
		conditions = append(conditions, fmt.Sprintf("domain = $%d", argIdx))
		args = append(args, opts.Domain)
		argIdx++
	}
	if opts.Difficulty != "" {
		conditions = append(conditions, fmt.Sprintf("difficulty = $%d", argIdx))
		args = append(args, opts.Difficulty)
		// argIdx++ // not needed after last arg
	}

	where := strings.Join(conditions, " AND ")
	q := fmt.Sprintf(`
		SELECT id, simulado_id, stem, options, correct_id, explanation, topic, domain,
		       difficulty, scenario_type, tags, source, status, created_at, updated_at
		FROM questions
		WHERE %s
		ORDER BY RANDOM()
		LIMIT $2
	`, where)

	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, fmt.Errorf("question repo: get random: %w", err)
	}
	defer rows.Close()

	return scanQuestions(rows)
}

// FindByID retorna uma questão pelo ID.
func (r *QuestionRepo) FindByID(ctx context.Context, id string) (*domsim.DBQuestion, error) {
	const q = `
		SELECT id, simulado_id, stem, options, correct_id, explanation, topic, domain,
		       difficulty, scenario_type, tags, source, status, created_at, updated_at
		FROM questions WHERE id = $1
	`
	row := r.pool.QueryRow(ctx, q, id)
	question, err := scanQuestion(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: question", shared.ErrNotFound)
		}
		return nil, fmt.Errorf("question repo: find by id: %w", err)
	}
	return question, nil
}

// List retorna questões paginadas com filtros opcionais.
func (r *QuestionRepo) List(ctx context.Context, filter domsim.QuestionFilter) ([]*domsim.DBQuestion, int, error) {
	conditions := []string{}
	args := []interface{}{}
	argIdx := 1

	if filter.SimuladoID != "" {
		conditions = append(conditions, fmt.Sprintf("simulado_id = $%d", argIdx))
		args = append(args, filter.SimuladoID)
		argIdx++
	}
	if filter.Domain != "" {
		conditions = append(conditions, fmt.Sprintf("domain = $%d", argIdx))
		args = append(args, filter.Domain)
		argIdx++
	}
	if filter.Difficulty != "" {
		conditions = append(conditions, fmt.Sprintf("difficulty = $%d", argIdx))
		args = append(args, filter.Difficulty)
		argIdx++
	}
	if filter.Status != "" {
		conditions = append(conditions, fmt.Sprintf("status = $%d", argIdx))
		args = append(args, filter.Status)
		argIdx++
	}
	if filter.Search != "" {
		conditions = append(conditions, fmt.Sprintf("stem ILIKE $%d", argIdx))
		args = append(args, "%"+filter.Search+"%")
		argIdx++
	}

	where := ""
	if len(conditions) > 0 {
		where = "WHERE " + strings.Join(conditions, " AND ")
	}

	countQ := fmt.Sprintf("SELECT COUNT(*) FROM questions %s", where)
	var total int
	if err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("question repo: list count: %w", err)
	}

	limit := filter.Limit
	if limit <= 0 {
		limit = 50
	}
	offset := filter.Offset
	if offset < 0 {
		offset = 0
	}

	dataQ := fmt.Sprintf(`
		SELECT id, simulado_id, stem, options, correct_id, explanation, topic, domain,
		       difficulty, scenario_type, tags, source, status, created_at, updated_at
		FROM questions %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, argIdx, argIdx+1)
	args = append(args, limit, offset)

	rows, err := r.pool.Query(ctx, dataQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("question repo: list: %w", err)
	}
	defer rows.Close()

	questions, err := scanQuestions(rows)
	if err != nil {
		return nil, 0, err
	}
	return questions, total, nil
}

// Create persiste uma nova questão.
func (r *QuestionRepo) Create(ctx context.Context, q *domsim.DBQuestion) error {
	optionsJSON, err := marshalOptions(q.Options)
	if err != nil {
		return fmt.Errorf("question repo: marshal options: %w", err)
	}
	explJSON, err := marshalExplanation(q.Explanation)
	if err != nil {
		return fmt.Errorf("question repo: marshal explanation: %w", err)
	}
	tagsJSON, err := marshalStringSlice(q.Tags)
	if err != nil {
		return fmt.Errorf("question repo: marshal tags: %w", err)
	}

	status := q.Status
	if status == "" {
		status = "active"
	}

	const query = `
		INSERT INTO questions
			(id, simulado_id, stem, options, correct_id, explanation, topic, domain,
			 difficulty, scenario_type, tags, source, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, now(), now())
	`
	_, err = r.pool.Exec(ctx, query,
		q.ID, q.SimuladoID, q.Stem, optionsJSON, string(q.CorrectID), explJSON,
		string(q.Topic), q.Domain, string(q.Difficulty),
		nullableString(q.ScenarioType), tagsJSON, nullableString(q.Source), status,
	)
	if err != nil {
		if isUniqueViolation(err) {
			return fmt.Errorf("%w: question id já existe: %s", shared.ErrConflict, q.ID)
		}
		return fmt.Errorf("question repo: create: %w", err)
	}
	return nil
}

// Update atualiza uma questão existente.
func (r *QuestionRepo) Update(ctx context.Context, q *domsim.DBQuestion) error {
	optionsJSON, err := marshalOptions(q.Options)
	if err != nil {
		return fmt.Errorf("question repo: marshal options: %w", err)
	}
	explJSON, err := marshalExplanation(q.Explanation)
	if err != nil {
		return fmt.Errorf("question repo: marshal explanation: %w", err)
	}
	tagsJSON, err := marshalStringSlice(q.Tags)
	if err != nil {
		return fmt.Errorf("question repo: marshal tags: %w", err)
	}

	const query = `
		UPDATE questions SET
			simulado_id = $2,
			stem = $3,
			options = $4,
			correct_id = $5,
			explanation = $6,
			topic = $7,
			domain = $8,
			difficulty = $9,
			scenario_type = $10,
			tags = $11,
			source = $12,
			status = $13,
			updated_at = $14
		WHERE id = $1
	`
	res, err := r.pool.Exec(ctx, query,
		q.ID, q.SimuladoID, q.Stem, optionsJSON, string(q.CorrectID), explJSON,
		string(q.Topic), q.Domain, string(q.Difficulty),
		nullableString(q.ScenarioType), tagsJSON, nullableString(q.Source), q.Status,
		time.Now().UTC(),
	)
	if err != nil {
		return fmt.Errorf("question repo: update: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("%w: question", shared.ErrNotFound)
	}
	return nil
}

// Delete faz soft delete: status='archived'.
func (r *QuestionRepo) Delete(ctx context.Context, id string) error {
	const query = `UPDATE questions SET status = 'archived', updated_at = now() WHERE id = $1`
	res, err := r.pool.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("question repo: delete: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("%w: question", shared.ErrNotFound)
	}
	return nil
}

// CountBySimulado retorna total de questões ativas de um simulado.
func (r *QuestionRepo) CountBySimulado(ctx context.Context, simuladoID string) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM questions WHERE simulado_id = $1 AND status = 'active'`,
		simuladoID,
	).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("question repo: count by simulado: %w", err)
	}
	return count, nil
}

// --- scanning helpers ---

type questionScanner interface {
	Scan(dest ...any) error
}

func scanQuestion(row questionScanner) (*domsim.DBQuestion, error) {
	var (
		id           string
		simuladoID   string
		stem         string
		optionsJSON  []byte
		correctID    string
		explJSON     []byte
		topic        string
		domain       string
		difficulty   string
		scenarioType *string
		tagsJSON     []byte
		source       *string
		status       string
		createdAt    time.Time
		updatedAt    time.Time
	)

	if err := row.Scan(
		&id, &simuladoID, &stem, &optionsJSON, &correctID, &explJSON,
		&topic, &domain, &difficulty, &scenarioType, &tagsJSON, &source, &status,
		&createdAt, &updatedAt,
	); err != nil {
		return nil, err
	}

	options, err := unmarshalOptions(optionsJSON)
	if err != nil {
		return nil, fmt.Errorf("unmarshal options: %w", err)
	}
	explanation, err := unmarshalExplanation(explJSON)
	if err != nil {
		return nil, fmt.Errorf("unmarshal explanation: %w", err)
	}
	tags, err := unmarshalStringSlice(tagsJSON)
	if err != nil {
		return nil, fmt.Errorf("unmarshal tags: %w", err)
	}

	q := &domsim.DBQuestion{
		ID:          id,
		SimuladoID:  simuladoID,
		Stem:        stem,
		Options:     options,
		CorrectID:   domsim.OptionID(correctID),
		Explanation: explanation,
		Topic:       domsim.Topic(topic),
		Domain:      domain,
		Difficulty:  domsim.Difficulty(difficulty),
		Tags:        tags,
		Status:      status,
	}
	if scenarioType != nil {
		q.ScenarioType = *scenarioType
	}
	if source != nil {
		q.Source = *source
	}
	return q, nil
}

func scanQuestions(rows pgx.Rows) ([]*domsim.DBQuestion, error) {
	var questions []*domsim.DBQuestion
	for rows.Next() {
		q, err := scanQuestion(rows)
		if err != nil {
			return nil, fmt.Errorf("scan question: %w", err)
		}
		questions = append(questions, q)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("question rows: %w", err)
	}
	if questions == nil {
		questions = []*domsim.DBQuestion{}
	}
	return questions, nil
}

// --- JSONB marshal/unmarshal helpers ---

type optionJSON struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

func marshalOptions(opts []domsim.QuestionOption) ([]byte, error) {
	out := make([]optionJSON, len(opts))
	for i, o := range opts {
		out[i] = optionJSON{ID: string(o.ID), Text: o.Text}
	}
	return json.Marshal(out)
}

func unmarshalOptions(data []byte) ([]domsim.QuestionOption, error) {
	if len(data) == 0 {
		return nil, nil
	}
	var raw []optionJSON
	if err := json.Unmarshal(data, &raw); err != nil {
		return nil, err
	}
	opts := make([]domsim.QuestionOption, len(raw))
	for i, o := range raw {
		opts[i] = domsim.QuestionOption{ID: domsim.OptionID(o.ID), Text: o.Text}
	}
	return opts, nil
}

func marshalExplanation(e domsim.QuestionExplanation) ([]byte, error) {
	return json.Marshal(e)
}

func unmarshalExplanation(data []byte) (domsim.QuestionExplanation, error) {
	var e domsim.QuestionExplanation
	if len(data) == 0 || string(data) == "{}" {
		return e, nil
	}
	if err := json.Unmarshal(data, &e); err != nil {
		return e, err
	}
	return e, nil
}

func marshalStringSlice(ss []string) ([]byte, error) {
	if ss == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(ss)
}

func unmarshalStringSlice(data []byte) ([]string, error) {
	if len(data) == 0 || string(data) == "null" {
		return []string{}, nil
	}
	var ss []string
	if err := json.Unmarshal(data, &ss); err != nil {
		return nil, err
	}
	return ss, nil
}

func nullableString(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
