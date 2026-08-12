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

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"

	domcurriculum "github.com/fernandofv/api/internal/domain/curriculum"
	"github.com/fernandofv/api/internal/domain/shared"
)

// CurriculumRepo implementa domcurriculum.Repository usando pgx.
type CurriculumRepo struct {
	pool *pgxpool.Pool
}

// NewCurriculumRepo cria um novo repositório de artigos do currículo.
func NewCurriculumRepo(pool *pgxpool.Pool) *CurriculumRepo {
	return &CurriculumRepo{pool: pool}
}

// FindBySlug retorna um artigo PUBLICADO pelo slug permanente — uso público.
// Retorna shared.ErrNotFound se não existir, estiver soft-deleted ou não
// estiver publicado (rascunho não é servido por slug adivinhado).
func (r *CurriculumRepo) FindBySlug(ctx context.Context, slug string) (*domcurriculum.Article, error) {
	const q = `
		SELECT id, slug, title, trail_id, hub_id, content_md, xp, read_time,
		       difficulty, "order", published, created_at, updated_at
		FROM curriculum_articles
		WHERE slug = $1 AND deleted_at IS NULL AND published = TRUE
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

// FindBySlugForAdmin retorna um artigo pelo slug SEM filtrar por published —
// uso exclusivo de rotas admin, que precisam editar rascunhos antes de
// publicá-los. Retorna shared.ErrNotFound se não existir ou estiver soft-deleted.
func (r *CurriculumRepo) FindBySlugForAdmin(ctx context.Context, slug string) (*domcurriculum.Article, error) {
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
		return nil, fmt.Errorf("curriculum: find by slug for admin: %w", err)
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
		published                                              bool
		createdAt, updatedAt                                   time.Time
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
		published                                              bool
		createdAt, updatedAt                                   time.Time
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

// ─── Blocks (CMS-driven content) ─────────────────────────────────────────────

// FindBlocksBySlug retorna todos os blocos de um artigo pré-organizados em árvore.
//
// Estratégia: 1 query plana ordenada por position, depois reconstrução da árvore
// em Go (mais simples e rápido que CTE recursivo para profundidade < 5).
// Para artigos típicos (até ~100 blocos, 2 níveis de profundidade), esta abordagem
// gera 1 round-trip ao banco e processa em microssegundos.
func (r *CurriculumRepo) FindBlocksBySlug(ctx context.Context, slug string) ([]*domcurriculum.Block, error) {
	// COALESCE garante string vazia em vez de NULL para parent_id em blocos top-level.
	const q = `
		SELECT id::text, COALESCE(parent_id::text, '') AS parent_id, position, block_type, block_data
		FROM module_blocks
		WHERE article_slug = $1
		ORDER BY parent_id NULLS FIRST, position
	`
	rows, err := r.pool.Query(ctx, q, slug)
	if err != nil {
		return nil, fmt.Errorf("curriculum: query blocks: %w", err)
	}
	defer rows.Close()

	// Coleta plana.
	type flatBlock struct {
		ID       string
		ParentID *string
		Position int
		Type     string
		Data     []byte
	}
	flat := make([]flatBlock, 0, 64)
	for rows.Next() {
		var (
			id, parentIDStr string
			position        int
			blockType       string
			data            []byte
		)
		if err := rows.Scan(&id, &parentIDStr, &position, &blockType, &data); err != nil {
			return nil, fmt.Errorf("curriculum: scan block: %w", err)
		}
		var parentID *string
		if parentIDStr != "" {
			p := parentIDStr
			parentID = &p
		}
		flat = append(flat, flatBlock{ID: id, ParentID: parentID, Position: position, Type: blockType, Data: data})
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("curriculum: iterate blocks: %w", err)
	}

	// Indexa por ID para reconstrução O(n).
	byID := make(map[string]*domcurriculum.Block, len(flat))
	roots := make([]*domcurriculum.Block, 0, len(flat)/2)

	for _, fb := range flat {
		b := &domcurriculum.Block{
			ID:       fb.ID,
			Type:     fb.Type,
			Position: fb.Position,
			Data:     fb.Data,
			ParentID: fb.ParentID,
			Children: []*domcurriculum.Block{},
		}
		byID[fb.ID] = b
	}

	// Anexa filhos aos pais.
	for _, fb := range flat {
		b := byID[fb.ID]
		if fb.ParentID == nil {
			roots = append(roots, b)
			continue
		}
		if parent, ok := byID[*fb.ParentID]; ok {
			parent.Children = append(parent.Children, b)
		}
	}
	return roots, nil
}

// SaveBlocks substitui todos os blocks de um artigo em transação.
// DELETE + INSERT atômico. Recursão recursiva (Section→Callouts) suportada.
func (r *CurriculumRepo) SaveBlocks(ctx context.Context, slug string, blocks []*domcurriculum.Block) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("curriculum: begin tx: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()

	if _, err := tx.Exec(ctx, `DELETE FROM module_blocks WHERE article_slug = $1`, slug); err != nil {
		return fmt.Errorf("curriculum: delete old blocks: %w", err)
	}

	// Walker recursivo: insere bloco, depois children referenciando ID do pai.
	var insertBlock func(b *domcurriculum.Block, parentID *string) error
	insertBlock = func(b *domcurriculum.Block, parentID *string) error {
		var insertedID string
		const q = `
			INSERT INTO module_blocks (article_slug, parent_id, position, block_type, block_data)
			VALUES ($1, $2, $3, $4, $5)
			RETURNING id::text
		`
		if err := tx.QueryRow(ctx, q, slug, parentID, b.Position, b.Type, b.Data).Scan(&insertedID); err != nil {
			return fmt.Errorf("curriculum: insert block (type=%s): %w", b.Type, err)
		}
		for _, child := range b.Children {
			if err := insertBlock(child, &insertedID); err != nil {
				return err
			}
		}
		return nil
	}

	for _, root := range blocks {
		if err := insertBlock(root, nil); err != nil {
			return err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("curriculum: commit tx: %w", err)
	}
	return nil
}
