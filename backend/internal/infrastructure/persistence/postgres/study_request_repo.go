package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// StudyRequestRepo persiste o agregado StudyRequest e seus attachments em
// uma transação atômica.
type StudyRequestRepo struct {
	pool *pgxpool.Pool
}

func NewStudyRequestRepo(pool *pgxpool.Pool) *StudyRequestRepo {
	return &StudyRequestRepo{pool: pool}
}

func (r *StudyRequestRepo) Save(ctx context.Context, req *domsr.StudyRequest) error {
	tx, err := r.pool.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("study_requests: begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	const insertRequest = `
		INSERT INTO study_requests (
			id, user_id, name, email, phone,
			study_area, institution, subject, goal, description,
			status, marketing_consent, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`
	var userIDPtr *string
	if !req.UserID().IsZero() {
		s := req.UserID().String()
		userIDPtr = &s
	}

	if _, err := tx.Exec(ctx, insertRequest,
		req.ID().String(),
		userIDPtr,
		req.Name(),
		req.Email(),
		nullIfEmpty(req.Phone()),
		req.StudyArea(),
		nullIfEmpty(req.Institution()),
		req.Subject(),
		nullIfEmpty(req.Goal()),
		req.Description(),
		req.Status().String(),
		req.MarketingConsent(),
		req.CreatedAt(),
		req.UpdatedAt(),
	); err != nil {
		return fmt.Errorf("study_requests: insert: %w", err)
	}

	const insertAttachment = `
		INSERT INTO study_request_attachments (
			id, study_request_id, file_name, content_type, size_bytes, storage_url, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7)
	`
	for _, a := range req.Attachments() {
		if _, err := tx.Exec(ctx, insertAttachment,
			a.ID.String(),
			req.ID().String(),
			a.FileName,
			a.ContentType,
			a.SizeBytes,
			a.StorageURL,
			a.CreatedAt,
		); err != nil {
			return fmt.Errorf("study_requests: insert attachment: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("study_requests: commit: %w", err)
	}
	return nil
}

// FindByID busca uma solicitação com seus anexos. Retorna shared.ErrNotFound
// se não existir.
func (r *StudyRequestRepo) FindByID(ctx context.Context, id domsr.ID) (*domsr.StudyRequest, error) {
	const reqQ = `
		SELECT id, COALESCE(user_id, ''), name, email,
		       COALESCE(phone, ''), study_area, COALESCE(institution, ''),
		       subject, COALESCE(goal, ''), description,
		       status, COALESCE(internal_notes, ''), marketing_consent,
		       created_at, updated_at
		FROM study_requests
		WHERE id = $1
	`
	var (
		rowID, userID, name, email, phone, studyArea, institution string
		subject, goal, description, status, internalNotes         string
		marketing                                                 bool
		createdAt, updatedAt                                      time.Time
	)
	err := r.pool.QueryRow(ctx, reqQ, id.String()).Scan(
		&rowID, &userID, &name, &email, &phone, &studyArea, &institution,
		&subject, &goal, &description, &status, &internalNotes, &marketing,
		&createdAt, &updatedAt,
	)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: study_request", shared.ErrNotFound)
		}
		return nil, fmt.Errorf("study_requests: find: %w", err)
	}

	attachments, err := r.loadAttachments(ctx, id)
	if err != nil {
		return nil, err
	}

	return domsr.Reconstitute(
		domsr.ID(rowID),
		shared.UserID(userID),
		name, email, phone, studyArea, institution, subject, goal, description,
		domsr.Status(status),
		internalNotes,
		marketing,
		attachments,
		createdAt, updatedAt,
	), nil
}

// Update salva status/notes/userID. Não toca em anexos (imutáveis após criação).
func (r *StudyRequestRepo) Update(ctx context.Context, req *domsr.StudyRequest) error {
	var userIDPtr *string
	if !req.UserID().IsZero() {
		s := req.UserID().String()
		userIDPtr = &s
	}
	const q = `
		UPDATE study_requests
		   SET user_id        = $1,
		       status         = $2,
		       internal_notes = $3
		 WHERE id = $4
	`
	tag, err := r.pool.Exec(ctx, q,
		userIDPtr,
		req.Status().String(),
		nullIfEmpty(req.InternalNotes()),
		req.ID().String(),
	)
	if err != nil {
		return fmt.Errorf("study_requests: update: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("%w: study_request", shared.ErrNotFound)
	}
	return nil
}

// List retorna solicitações filtradas + total para paginação no admin.
// Anexos NÃO são carregados para evitar N+1 em listagens — admin pega via FindByID.
func (r *StudyRequestRepo) List(ctx context.Context, f domsr.Filter) ([]*domsr.StudyRequest, int64, error) {
	conds := []string{"1=1"}
	args := []interface{}{}
	idx := 1

	if f.Status != "" {
		conds = append(conds, fmt.Sprintf("status = $%d", idx))
		args = append(args, string(f.Status))
		idx++
	}
	if s := strings.TrimSpace(f.StudyArea); s != "" {
		conds = append(conds, fmt.Sprintf("study_area = $%d", idx))
		args = append(args, s)
		idx++
	}
	if s := strings.TrimSpace(f.Search); s != "" {
		conds = append(conds, fmt.Sprintf(
			"(name ILIKE $%d OR email ILIKE $%d OR subject ILIKE $%d OR description ILIKE $%d)",
			idx, idx, idx, idx,
		))
		args = append(args, "%"+s+"%")
		idx++
	}
	where := strings.Join(conds, " AND ")

	var total int64
	if err := r.pool.QueryRow(ctx,
		"SELECT COUNT(*) FROM study_requests WHERE "+where, args...,
	).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("study_requests: count: %w", err)
	}

	limit := f.Limit
	if limit <= 0 {
		limit = 50
	}
	offset := f.Offset
	if offset < 0 {
		offset = 0
	}
	args = append(args, limit, offset)
	listQuery := fmt.Sprintf(`
		SELECT id, COALESCE(user_id, ''), name, email,
		       COALESCE(phone, ''), study_area, COALESCE(institution, ''),
		       subject, COALESCE(goal, ''), description,
		       status, COALESCE(internal_notes, ''), marketing_consent,
		       created_at, updated_at
		FROM study_requests
		WHERE %s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, idx, idx+1)

	rows, err := r.pool.Query(ctx, listQuery, args...)
	if err != nil {
		return nil, total, fmt.Errorf("study_requests: list: %w", err)
	}
	defer rows.Close()

	out := []*domsr.StudyRequest{}
	for rows.Next() {
		var (
			rowID, userID, name, email, phone, studyArea, institution string
			subject, goal, description, status, internalNotes         string
			marketing                                                 bool
			createdAt, updatedAt                                      time.Time
		)
		if err := rows.Scan(
			&rowID, &userID, &name, &email, &phone, &studyArea, &institution,
			&subject, &goal, &description, &status, &internalNotes, &marketing,
			&createdAt, &updatedAt,
		); err != nil {
			return nil, total, fmt.Errorf("study_requests: scan: %w", err)
		}
		out = append(out, domsr.Reconstitute(
			domsr.ID(rowID),
			shared.UserID(userID),
			name, email, phone, studyArea, institution, subject, goal, description,
			domsr.Status(status),
			internalNotes,
			marketing,
			nil, // anexos não carregados em listagem
			createdAt, updatedAt,
		))
	}
	if err := rows.Err(); err != nil {
		return nil, total, fmt.Errorf("study_requests: rows iter: %w", err)
	}
	return out, total, nil
}

// FindUserIDByEmail implementa o port studyrequest.UserLookup.
// Match por email lowercased, ignora users deletados.
// CountActiveByArea agrega quantas solicitações ativas (pending/in_review/in_production)
// existem por study_area. Usado pelo BasesHandler para mostrar "X pessoas pediram
// essa área" em /bases, validando demanda pública.
//
// Retorna mapa slug → count. Áreas sem solicitação ativa não aparecem no resultado
// (ausência == 0, simplifica o consumidor).
func (r *StudyRequestRepo) CountActiveByArea(ctx context.Context) (map[string]int, error) {
	const q = `
		SELECT study_area, COUNT(*) AS n
		FROM study_requests
		WHERE status IN ('pending', 'in_review', 'in_production')
		GROUP BY study_area
	`
	rows, err := r.pool.Query(ctx, q)
	if err != nil {
		return nil, fmt.Errorf("study_requests: count by area: %w", err)
	}
	defer rows.Close()

	out := make(map[string]int)
	for rows.Next() {
		var area string
		var n int
		if err := rows.Scan(&area, &n); err != nil {
			return nil, fmt.Errorf("study_requests: scan area count: %w", err)
		}
		out[area] = n
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("study_requests: rows err: %w", err)
	}
	return out, nil
}

func (r *StudyRequestRepo) FindUserIDByEmail(ctx context.Context, email string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return "", nil
	}
	var id string
	err := r.pool.QueryRow(ctx, `
		SELECT id FROM users
		 WHERE lower(email) = $1 AND deleted_at IS NULL
		 LIMIT 1
	`, email).Scan(&id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return "", nil // não encontrado não é erro
		}
		return "", fmt.Errorf("study_requests: user lookup: %w", err)
	}
	return id, nil
}

func (r *StudyRequestRepo) loadAttachments(ctx context.Context, id domsr.ID) ([]domsr.Attachment, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT id, file_name, content_type, size_bytes, storage_url, created_at
		FROM study_request_attachments
		WHERE study_request_id = $1
		ORDER BY created_at ASC
	`, id.String())
	if err != nil {
		return nil, fmt.Errorf("study_requests: load attachments: %w", err)
	}
	defer rows.Close()

	var out []domsr.Attachment
	for rows.Next() {
		var a domsr.Attachment
		var attID string
		if err := rows.Scan(&attID, &a.FileName, &a.ContentType, &a.SizeBytes, &a.StorageURL, &a.CreatedAt); err != nil {
			return nil, fmt.Errorf("study_requests: scan attachment: %w", err)
		}
		a.ID = domsr.AttachmentID(attID)
		out = append(out, a)
	}
	return out, nil
}

func nullIfEmpty(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
