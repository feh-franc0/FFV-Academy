// Package curriculum — repository.go define a interface de persistência do currículo.
package curriculum

import "context"

// Repository define o contrato de persistência de artigos do currículo.
// Implementado na camada de infraestrutura — o domínio não conhece o banco de dados.
type Repository interface {
	// FindBySlug retorna um artigo pelo seu slug permanente.
	// Retorna shared.ErrNotFound se o artigo não existir ou estiver soft-deleted.
	FindBySlug(ctx context.Context, slug string) (*Article, error)

	// List retorna artigos de uma trilha com suporte a paginação.
	// publishedOnly=true filtra apenas artigos publicados (para usuários).
	// publishedOnly=false retorna todos (para admins).
	// Retorna (artigos, total, error).
	List(ctx context.Context, trailID string, publishedOnly bool, limit, offset int) ([]*Article, int, error)

	// Search busca artigos por similaridade de título usando pg_trgm.
	// Retorna até limit resultados ordenados por relevância.
	Search(ctx context.Context, q string, limit int) ([]*Article, error)

	// Save persiste um novo artigo no banco de dados.
	Save(ctx context.Context, article *Article) error

	// Update atualiza um artigo existente.
	Update(ctx context.Context, article *Article) error

	// SoftDelete marca o artigo como deletado (deleted_at = NOW()).
	// O artigo não é removido do banco — preserva histórico (LGPD).
	SoftDelete(ctx context.Context, slug string) error
}
