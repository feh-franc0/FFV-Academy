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
		RETURNING id::text, user_id, target_type, target_id, COALESCE(parent_id::text, ''), content, status, edited, created_at, updated_at
	`, in.UserID, in.TargetType, in.TargetID, parentID, in.Content).Scan(
		&c.ID, &c.UserID, &c.TargetType, &c.TargetID, &c.ParentID, &c.Content, &c.Status, &c.Edited, &c.CreatedAt, &c.UpdatedAt,
	)
	if err != nil {
		return handlers.Comment{}, fmt.Errorf("insert comment: %w", err)
	}
	// Autor name é melhor populado em ListByTarget com JOIN; aqui retornamos vazio
	// porque o cliente já sabe quem é o autor (acabou de postar).
	return c, nil
}

func (r *pgxCommentsRepo) ListByTarget(ctx context.Context, targetType, targetID string, limit, offset int) ([]handlers.Comment, int64, error) {
	var total int64
	if err := r.pool.QueryRow(ctx, `
		SELECT COUNT(*) FROM comments
		WHERE target_type = $1 AND target_id = $2 AND status = 'visible'
	`, targetType, targetID).Scan(&total); err != nil {
		return nil, 0, err
	}

	rows, err := r.pool.Query(ctx, `
		SELECT c.id::text, c.user_id, COALESCE(u.name, ''), c.target_type, c.target_id,
		       COALESCE(c.parent_id::text, ''), c.content, c.status, c.edited,
		       c.created_at, c.updated_at
		FROM comments c
		LEFT JOIN users u ON u.id = c.user_id
		WHERE c.target_type = $1 AND c.target_id = $2 AND c.status = 'visible'
		ORDER BY c.created_at ASC
		LIMIT $3 OFFSET $4
	`, targetType, targetID, limit, offset)
	if err != nil {
		return nil, total, err
	}
	defer rows.Close()

	var out []handlers.Comment
	for rows.Next() {
		var c handlers.Comment
		if err := rows.Scan(&c.ID, &c.UserID, &c.AuthorName, &c.TargetType, &c.TargetID, &c.ParentID, &c.Content, &c.Status, &c.Edited, &c.CreatedAt, &c.UpdatedAt); err != nil {
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

// Sentinels mapeados para os erros do domain shared — HandleDomainError no
// handler entende e responde com o status HTTP correto.
var (
	errNotFoundComment  = fmt.Errorf("comment: %w", shared.ErrNotFound)
	errForbiddenComment = fmt.Errorf("comment: %w", shared.ErrForbidden)
)
