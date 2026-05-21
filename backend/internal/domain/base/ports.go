package base

import "context"

// Repository — leitura do catálogo de bases.
//
// O catálogo é gerenciado fora da aplicação (via SQL/admin futuro), então
// não há comandos de Save/Update aqui — somente leitura. Adicionar uma base
// nova é INSERT no banco, não chamada de aplicação.
type Repository interface {
	// GetBySlug retorna a base pelo slug. Retorna shared.ErrNotFound se ausente.
	GetBySlug(ctx context.Context, slug string) (*Base, error)
	// List devolve todas as bases ordenadas por sort_order asc.
	List(ctx context.Context) ([]*Base, error)
}
