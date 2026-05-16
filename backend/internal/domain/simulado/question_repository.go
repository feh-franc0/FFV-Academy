package simulado

import "context"

// QuestionRepository é o port de persistência de questões.
type QuestionRepository interface {
	// GetRandom retorna até count questões aleatórias do simulado, excluindo excludeIDs.
	// Pode filtrar por domain e difficulty.
	GetRandom(ctx context.Context, simuladoID string, count int, opts QuestionQueryOpts) ([]*DBQuestion, error)

	// FindByID retorna uma questão pelo ID. Retorna shared.ErrNotFound se não existe.
	FindByID(ctx context.Context, id string) (*DBQuestion, error)

	// FindByIDs retorna múltiplas questões por seus IDs, filtrando por simulado_id.
	// Mantém a ordem dos IDs solicitados (IDs ausentes são pulados silenciosamente).
	FindByIDs(ctx context.Context, simuladoID string, ids []string) ([]*DBQuestion, error)

	// List retorna questões paginadas com filtros opcionais.
	List(ctx context.Context, filter QuestionFilter) ([]*DBQuestion, int, error)

	// Create persiste uma nova questão.
	Create(ctx context.Context, q *DBQuestion) error

	// Update atualiza uma questão existente.
	Update(ctx context.Context, q *DBQuestion) error

	// Delete remove (soft delete — status='archived') uma questão.
	Delete(ctx context.Context, id string) error

	// CountBySimulado retorna total de questões ativas de um simulado.
	CountBySimulado(ctx context.Context, simuladoID string) (int, error)
}

// QuestionQueryOpts opções para GetRandom.
type QuestionQueryOpts struct {
	Domain     string
	Difficulty string
	ExcludeIDs []string
}

// QuestionFilter filtros para listagem admin.
type QuestionFilter struct {
	SimuladoID string
	Domain     string
	Difficulty string
	Status     string
	Search     string // busca no stem
	Limit      int
	Offset     int
}
