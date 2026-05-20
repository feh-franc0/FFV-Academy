// Adapter Postgres do CommentsRepository.
package main

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

type pgxCommentsRepo struct{ pool *pgxpool.Pool }

var _ handlers.CommentsRepository = (*pgxCommentsRepo)(nil)

func (r *pgxCommentsRepo) Create(ctx context.Context, in handlers.CommentCreateInput) (handlers.Comment, error) {
	var c handlers.Comment
	var parentID *string
	if in.ParentID != "" {
		parentID = &in.ParentID
	}
	err := r.pool.QueryRow(ctx, `
		INSERT INTO comments (user_id, target_type, target_id, parent_id, content, status)
		VALUES ($1, $2, $3, $4, $5, 'visible')
		RETURNING id::text, user_id, target_type, target_id, COALESCE(parent_id::text, ''),
		          content, status, edited, score, created_at, updated_at
	`, in.UserID, in.TargetType, in.TargetID, parentID, in.Content).Scan(
		&c.ID, &c.UserID, &c.TargetType, &c.TargetID, &c.ParentID,
		&c.Content, &c.Status, &c.Edited, &c.Score, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return handlers.Comment{}, fmt.Errorf("insert comment: %w", err)
	}
	// Autor name é populado em ListByTarget com JOIN; aqui retornamos vazio porque
	// o cliente já sabe quem é (acabou de postar). UserVote = 0 inicial.
	return c, nil
}

func (r *pgxCommentsRepo) ListByTarget(ctx context.Context, targetType, targetID string, limit, offset int, viewerUserID string) ([]handlers.Comment, int64, error) {
	var total int64
	if err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM comments
		WHERE target_type = $1 AND target_id = $2 AND status = 'visible'
	`, targetType, targetID).Scan(&total); err != nil {
		return nil, 0, err
	}

	// LEFT JOIN comment_votes com filtro pelo viewer (se autenticado) pra trazer
	// o voto que o user atual deu em cada comment. Se anônimo, viewerUserID=''
	// e o JOIN não retorna linha → user_vote vira NULL → COALESCE = 0.
	rows, err := r.pool.Query(ctx, `
		SELECT c.id::text, c.user_id, COALESCE(u.name, ''),
		       c.target_type, c.target_id,
		       COALESCE(c.parent_id::text, ''),
		       c.content, c.status, c.edited, c.score,
		       COALESCE(v.vote, 0),
		       c.created_at, c.updated_at
		FROM comments c
		LEFT JOIN users u ON u.id = c.user_id
		LEFT JOIN comment_votes v ON v.comment_id = c.id AND v.user_id = $3
		WHERE c.target_type = $1 AND c.target_id = $2 AND c.status = 'visible'
		ORDER BY c.score DESC, c.created_at ASC
		LIMIT $4 OFFSET $5
	`, targetType, targetID, viewerUserID, limit, offset)
	if err != nil {
		return nil, total, err
	}
	defer rows.Close()

	var out []handlers.Comment
	for rows.Next() {
		var c handlers.Comment
		if err := rows.Scan(
			&c.ID, &c.UserID, &c.AuthorName, &c.TargetType, &c.TargetID, &c.ParentID,
			&c.Content, &c.Status, &c.Edited, &c.Score, &c.UserVote,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return out, total, err
		}
		out = append(out, c)
	}
	return out, total, nil
}

func (r *pgxCommentsRepo) SoftDelete(ctx context.Context, commentID, userID string, isAdmin bool) error {
	var ownerID string
	err := r.pool.QueryRow(ctx, `SELECT user_id FROM comments WHERE id = $1`, commentID).Scan(&ownerID)
	if errors.Is(err, pgx.ErrNoRows) {
		return errNotFoundComment
	}
	if err != nil {
		return err
	}
	if ownerID != userID && !isAdmin {
		return errForbiddenComment
	}
	_, err = r.pool.Exec(ctx, `UPDATE comments SET status = 'deleted', updated_at = now() WHERE id = $1`, commentID)
	return err
}

func (r *pgxCommentsRepo) UpdateStatus(ctx context.Context, commentID, status string) error {
	cmd, err := r.pool.Exec(ctx, `UPDATE comments SET status = $2, updated_at = now() WHERE id = $1`, commentID, status)
	if err != nil {
		return err
	}
	if cmd.RowsAffected() == 0 {
		return errNotFoundComment
	}
	return nil
}

// Vote — upsert atômico via ON CONFLICT. Trigger update_comment_score()
// propaga pro comments.score.
func (r *pgxCommentsRepo) Vote(ctx context.Context, commentID, userID string, vote int) error {
	cmd, err := r.pool.Exec(ctx, `
		INSERT INTO comment_votes (comment_id, user_id, vote)
		VALUES ($1, $2, $3)
		ON CONFLICT (comment_id, user_id)
		DO UPDATE SET vote = EXCLUDED.vote, updated_at = now()
		WHERE comment_votes.vote <> EXCLUDED.vote
	`, commentID, userID, vote)
	if err != nil {
		return fmt.Errorf("vote: %w", err)
	}
	_ = cmd
	return nil
}

// UnVote — remove o voto do user (se existir). Idempotente.
func (r *pgxCommentsRepo) UnVote(ctx context.Context, commentID, userID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM comment_votes WHERE comment_id = $1 AND user_id = $2`, commentID, userID)
	if err != nil {
		return fmt.Errorf("unvote: %w", err)
	}
	return nil
}

// ListByStatus — usado por admin pra moderação. Filtra por status sem
// restringir target. Inclui autor + score + report_count pra contexto.
func (r *pgxCommentsRepo) ListByStatus(ctx context.Context, status string, limit, offset int) ([]handlers.Comment, int64, error) {
	var total int64
	if err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM comments WHERE status = $1
	`, status).Scan(&total); err != nil {
		return nil, 0, err
	}
	rows, err := r.pool.Query(ctx, `
		SELECT c.id::text, c.user_id, COALESCE(u.name, ''),
		       c.target_type, c.target_id, COALESCE(c.parent_id::text, ''),
		       c.content, c.status, c.edited, c.score,
		       c.created_at, c.updated_at
		FROM comments c
		LEFT JOIN users u ON u.id = c.user_id
		WHERE c.status = $1
		ORDER BY c.updated_at DESC
		LIMIT $2 OFFSET $3
	`, status, limit, offset)
	if err != nil {
		return nil, total, err
	}
	defer rows.Close()
	out := []handlers.Comment{}
	for rows.Next() {
		var c handlers.Comment
		if err := rows.Scan(
			&c.ID, &c.UserID, &c.AuthorName, &c.TargetType, &c.TargetID, &c.ParentID,
			&c.Content, &c.Status, &c.Edited, &c.Score,
			&c.CreatedAt, &c.UpdatedAt,
		); err != nil {
			return out, total, err
		}
		out = append(out, c)
	}
	return out, total, nil
}

// Report — registra reporte. PK composta evita duplicata do mesmo user.
// ON CONFLICT DO NOTHING = idempotente (segundo reporte do mesmo user = no-op).
// Trigger auto-flag em ≥3 reports.
func (r *pgxCommentsRepo) Report(ctx context.Context, commentID, reporterID, reason string) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO comment_reports (comment_id, reporter_id, reason)
		VALUES ($1, $2, $3)
		ON CONFLICT (comment_id, reporter_id) DO NOTHING
	`, commentID, reporterID, reason)
	if err != nil {
		return fmt.Errorf("report: %w", err)
	}
	return nil
}

// Sentinels mapeados para os erros do domain shared — HandleDomainError no
// handler entende e responde com o status HTTP correto.
var (
	errNotFoundComment  = fmt.Errorf("comment: %w", shared.ErrNotFound)
	errForbiddenComment = fmt.Errorf("comment: %w", shared.ErrForbidden)
)
