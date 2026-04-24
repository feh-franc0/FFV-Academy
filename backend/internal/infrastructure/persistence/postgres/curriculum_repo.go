// Package postgres — curriculum_repo.go implementa o repositório de artigos do currículo.
//
// Usa pgx direto (zero ORM) com queries SQL explícitas e auditáveis.
// Soft-delete via campo deleted_at — artigos nunca são removidos fisicamente.
package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	domcurriculum "github.com/fernandofv/api/internal/domain/curriculum"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
)

// CurriculumRepo implementa domcurriculum.Repository usando pgx.
type CurriculumRepo struct {
	pool *pgxpool.Pool
}

// NewCurriculumRepo cria um novo repositório de artigos do currículo.
func NewCurriculumRepo(pool *pgxpool.Pool) *CurriculumRepo {
	return &CurriculumRepo{pool: pool}
}

// FindBySlug retorna um artigo pelo slug permanente.
// Retorna shared.ErrNotFound se não existir ou estiver soft-deleted.
func (r *CurriculumRepo) FindBySlug(ctx context.Context, slug string) (*domcurriculum.Article, error) {
	const q = `
		SELECT id, slug, title, trail_id, hub_id, content_md, xp, read_time,
		       difficulty, "order", published, created_at, updated_at
		FROM curriculum_articles
		WHERE slug = $1 AND deleted_at IS NULL
	`
	row := r.pool.QueryRow(ctx, q, slug)
	article, err := scanCurriculumRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: artigo '%s'", shared.ErrNotFound, slug)
		}
		return nil, fmt.Errorf("curriculum: find by slug: %w", err)
	}
	return article, nil
}

// List retorna artigos paginados com filtro por trilha e status de publicação.
// trailID vazio retorna de todas as trilhas.
func (r *CurriculumRepo) List(ctx context.Context, trailID string, publishedOnly bool, limit, offset int) ([]*domcurriculum.Article, int, error) {
	args := []interface{}{}
	where := "WHERE deleted_at IS NULL"
	argIdx := 1

	if publishedOnly {
		where += " AND published = TRUE"
	}
	if trailID != "" {
		where += fmt.Sprintf(" AND trail_id = $%d", argIdx)
		args = append(args, trailID)
		argIdx++
	}

	// Contagem total para paginação no frontend.
	countQ := fmt.Sprintf("SELECT COUNT(*) FROM curriculum_articles %s", where)
	var total int
	if err := r.pool.QueryRow(ctx, countQ, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("curriculum: count: %w", err)
	}

	// Ordenado por order ASC dentro da trilha — mantém sequência didática.
	args = append(args, limit, offset)
	dataQ := fmt.Sprintf(`
		SELECT id, slug, title, trail_id, hub_id, content_md, xp, read_time,
		       difficulty, "order", published, created_at, updated_at
		FROM curriculum_articles
		%s
		ORDER BY trail_id, "order" ASC
		LIMIT $%d OFFSET $%d
	`, where, argIdx, argIdx+1)

	rows, err := r.pool.Query(ctx, dataQ, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("curriculum: list query: %w", err)
	}
	defer rows.Close()

	var articles []*domcurriculum.Article
	for rows.Next() {
		article, err := scanCurriculumRows(rows)
		if err != nil {
			return nil, 0, fmt.Errorf("curriculum: list scan: %w", err)
		}
		articles = append(articles, article)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("curriculum: list rows: %w", err)
	}

	return articles, total, nil
}

// Search busca artigos por similaridade de título usando pg_trgm.
// Requer extensão pg_trgm e índice gin(title gin_trgm_ops).
func (r *CurriculumRepo) Search(ctx context.Context, q string, limit int) ([]*domcurriculum.Article, error) {
	const query = `
		SELECT id, slug, title, trail_id, hub_id, content_md, xp, read_time,
		       difficulty, "order", published, created_at, updated_at
		FROM curriculum_articles
		WHERE deleted_at IS NULL
		  AND published = TRUE
		  AND title ILIKE $1
		ORDER BY similarity(title, $2) DESC
		LIMIT $3
	`
	pattern := "%" + q + "%"
	rows, err := r.pool.Query(ctx, query, pattern, q, limit)
	if err != nil {
		return nil, fmt.Errorf("curriculum: search query: %w", err)
	}
	defer rows.Close()

	var articles []*domcurriculum.Article
	for rows.Next() {
		article, err := scanCurriculumRows(rows)
		if err != nil {
			return nil, fmt.Errorf("curriculum: search scan: %w", err)
		}
		articles = append(articles, article)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("curriculum: search rows: %w", err)
	}

	return articles, nil
}

// Save persiste um novo artigo no banco de dados.
// Retorna shared.ErrConflict se o slug já existir.
func (r *CurriculumRepo) Save(ctx context.Context, article *domcurriculum.Article) error {
	const q = `
		INSERT INTO curriculum_articles
			(slug, title, trail_id, hub_id, content_md, xp, read_time, difficulty, "order", published, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
	`
	_, err := r.pool.Exec(ctx, q,
		article.Slug(),
		article.Title(),
		article.TrailID(),
		article.HubID(),
		article.ContentMD(),
		article.XP(),
		article.ReadTime(),
		article.Difficulty(),
		article.Order(),
		article.Published(),
	)
	if err != nil {
		if isPostgresUniqueViolation(err) {
			return fmt.Errorf("%w: slug '%s' já existe", shared.ErrConflict, article.Slug())
		}
		return fmt.Errorf("curriculum: save: %w", err)
	}
	return nil
}

// Update atualiza um artigo existente pelo slug.
// Retorna shared.ErrNotFound se o artigo não existir.
func (r *CurriculumRepo) Update(ctx context.Context, article *domcurriculum.Article) error {
	const q = `
		UPDATE curriculum_articles
		SET title = $1, content_md = $2, xp = $3, read_time = $4,
		    difficulty = $5, "order" = $6, published = $7, updated_at = NOW()
		WHERE slug = $8 AND deleted_at IS NULL
	`
	tag, err := r.pool.Exec(ctx, q,
		article.Title(),
		article.ContentMD(),
		article.XP(),
		article.ReadTime(),
		article.Difficulty(),
		article.Order(),
		article.Published(),
		article.Slug(),
	)
	if err != nil {
		return fmt.Errorf("curriculum: update: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("%w: artigo '%s'", shared.ErrNotFound, article.Slug())
	}
	return nil
}

// SoftDelete marca o artigo como deletado sem remover do banco.
func (r *CurriculumRepo) SoftDelete(ctx context.Context, slug string) error {
	const q = `
		UPDATE curriculum_articles
		SET deleted_at = NOW(), updated_at = NOW()
		WHERE slug = $1 AND deleted_at IS NULL
	`
	tag, err := r.pool.Exec(ctx, q, slug)
	if err != nil {
		return fmt.Errorf("curriculum: soft delete: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return fmt.Errorf("%w: artigo '%s'", shared.ErrNotFound, slug)
	}
	return nil
}

// ─── Helpers de scan ─────────────────────────────────────────────────────────

// scanCurriculumRow escaneia um pgx.Row para um Article.
func scanCurriculumRow(row pgx.Row) (*domcurriculum.Article, error) {
	var (
		id, slug, title, trailID, hubID, contentMD, difficulty string
		xp, readTime, order                                    int
		published                                               bool
		createdAt, updatedAt                                    time.Time
	)
	if err := row.Scan(&id, &slug, &title, &trailID, &hubID, &contentMD,
		&xp, &readTime, &difficulty, &order, &published, &createdAt, &updatedAt); err != nil {
		return nil, err
	}
	return domcurriculum.Reconstitute(id, slug, title, trailID, hubID, contentMD, difficulty, xp, readTime, order, published, createdAt, updatedAt), nil
}

// scanCurriculumRows escaneia uma linha de pgx.Rows para um Article.
func scanCurriculumRows(rows pgx.Rows) (*domcurriculum.Article, error) {
	var (
		id, slug, title, trailID, hubID, contentMD, difficulty string
		xp, readTime, order                                    int
		published                                               bool
		createdAt, updatedAt                                    time.Time
	)
	if err := rows.Scan(&id, &slug, &title, &trailID, &hubID, &contentMD,
		&xp, &readTime, &difficulty, &order, &published, &createdAt, &updatedAt); err != nil {
		return nil, err
	}
	return domcurriculum.Reconstitute(id, slug, title, trailID, hubID, contentMD, difficulty, xp, readTime, order, published, createdAt, updatedAt), nil
}

// isPostgresUniqueViolation detecta violação de constraint UNIQUE via código de erro PostgreSQL.
// Código 23505 = unique_violation (SQLSTATE).
func isPostgresUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	if errors.As(err, &pgErr) {
		return pgErr.Code == "23505"
	}
	return false
}
