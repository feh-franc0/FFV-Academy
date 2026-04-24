package simulado

import (
	"context"

	"github.com/fernandofv/api/internal/domain/shared"
)

// AttemptRepository é o port de persistência de Attempts.
//
// DIP: o domínio depende desta interface; a impl concreta vive em infra/postgres.
type AttemptRepository interface {
	// Save persiste uma nova Attempt.
	// Retorna ErrConflict se já existe attempt ativa para (userID, simuladoID).
	Save(ctx context.Context, attempt *Attempt) error

	// Update persiste alterações em uma Attempt existente.
	Update(ctx context.Context, attempt *Attempt) error

	// FindByID retorna uma Attempt pelo ID. Retorna ErrNotFound se não existe.
	FindByID(ctx context.Context, id shared.AttemptID) (*Attempt, error)

	// FindActiveByUserAndSimulado retorna a attempt ativa (não finalizada) para o par.
	// Retorna ErrNotFound se não existe.
	FindActiveByUserAndSimulado(ctx context.Context, userID shared.UserID, simuladoID shared.SimuladoID) (*Attempt, error)

	// ListByUser retorna as attempts do usuário, ordenadas por startedAt DESC.
	ListByUser(ctx context.Context, userID shared.UserID, limit, offset int) ([]*Attempt, int, error)
}
