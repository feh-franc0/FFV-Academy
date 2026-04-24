// Package simulado contém os use cases do bounded context de simulados.
package simulado

import (
	"context"
	"errors"
	"fmt"

	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
)

// StartAttemptCommand inicia ou retoma uma tentativa de simulado.
type StartAttemptCommand struct {
	UserID     shared.UserID
	SimuladoID shared.SimuladoID
	HasPaid    bool
}

// StartAttemptResult contém a attempt resultante.
type StartAttemptResult struct {
	Attempt  *domsimulado.Attempt
	IsNew    bool
	Simulado *domsimulado.Simulado
}

// StartAttemptUseCase inicia ou retoma uma tentativa de simulado.
//
// FLUXO:
//   1. Valida que o simulado existe no catálogo.
//   2. Busca attempt ativa existente para (userID, simuladoID).
//   3. Se existe: retorna ela (idempotente).
//   4. Se não existe: cria nova.
type StartAttemptUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	catalog     domsimulado.CatalogProvider
	clock       shared.Clock
}

func NewStartAttemptUseCase(
	repo domsimulado.AttemptRepository,
	catalog domsimulado.CatalogProvider,
	clock shared.Clock,
) *StartAttemptUseCase {
	return &StartAttemptUseCase{attemptRepo: repo, catalog: catalog, clock: clock}
}

func (uc *StartAttemptUseCase) Execute(ctx context.Context, cmd StartAttemptCommand) (StartAttemptResult, error) {
	sim, err := uc.catalog.GetSimulado(cmd.SimuladoID)
	if err != nil {
		return StartAttemptResult{}, fmt.Errorf("start attempt: simulado not found: %w", err)
	}

	// Tenta encontrar attempt ativa existente (idempotência).
	active, err := uc.attemptRepo.FindActiveByUserAndSimulado(ctx, cmd.UserID, cmd.SimuladoID)
	if err == nil {
		return StartAttemptResult{Attempt: active, IsNew: false, Simulado: sim}, nil
	}
	if !errors.Is(err, shared.ErrNotFound) {
		return StartAttemptResult{}, fmt.Errorf("start attempt: find active: %w", err)
	}

	// Cria nova attempt.
	now := uc.clock.Now()
	attempt := domsimulado.StartAttempt(
		shared.NewAttemptID(),
		cmd.UserID,
		cmd.SimuladoID,
		sim.TimeLimitMin,
		now,
	)

	if err := uc.attemptRepo.Save(ctx, attempt); err != nil {
		if errors.Is(err, shared.ErrConflict) {
			// Race condition: outra goroutine criou; busca a existente.
			active, findErr := uc.attemptRepo.FindActiveByUserAndSimulado(ctx, cmd.UserID, cmd.SimuladoID)
			if findErr != nil {
				return StartAttemptResult{}, fmt.Errorf("start attempt: conflict recovery: %w", findErr)
			}
			return StartAttemptResult{Attempt: active, IsNew: false, Simulado: sim}, nil
		}
		return StartAttemptResult{}, fmt.Errorf("start attempt: save: %w", err)
	}

	return StartAttemptResult{Attempt: attempt, IsNew: true, Simulado: sim}, nil
}
