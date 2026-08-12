// Package simulado contém os use cases do bounded context de simulados.
package simulado

import (
	"context"
	"errors"
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
)

// StartAttemptCommand inicia ou retoma uma tentativa de simulado.
type StartAttemptCommand struct {
	UserID     shared.UserID
	SimuladoID shared.SimuladoID
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
//  1. Valida que o simulado existe no catálogo (metadados: título, tempo, nota de corte).
//  2. Busca attempt ativa existente para (userID, simuladoID).
//  3. Se existe: retorna ela (idempotente) — o sorteio de questões já feito não muda.
//  4. Se não existe: sorteia QuestionCount questões do banco REAL (Postgres,
//     via QuestionRepository) e cria a attempt já com esse sorteio fixado.
//
// O sorteio acontece aqui — SERVIDOR — não mais no cliente. É o que fecha a
// possibilidade de o cliente escolher (ou já ter visto o gabarito de) as
// questões antes de a prova começar.
type StartAttemptUseCase struct {
	attemptRepo  domsimulado.AttemptRepository
	catalog      domsimulado.CatalogProvider
	questionRepo domsimulado.QuestionRepository
	clock        shared.Clock
}

func NewStartAttemptUseCase(
	repo domsimulado.AttemptRepository,
	catalog domsimulado.CatalogProvider,
	questionRepo domsimulado.QuestionRepository,
	clock shared.Clock,
) *StartAttemptUseCase {
	return &StartAttemptUseCase{attemptRepo: repo, catalog: catalog, questionRepo: questionRepo, clock: clock}
}

func (uc *StartAttemptUseCase) Execute(ctx context.Context, cmd StartAttemptCommand) (StartAttemptResult, error) {
	sim, err := uc.catalog.GetSimulado(cmd.SimuladoID)
	if err != nil {
		return StartAttemptResult{}, fmt.Errorf("start attempt: simulado not found: %w", err)
	}

	// Tenta encontrar attempt ativa existente (idempotência) — o sorteio já
	// feito é devolvido como está, nunca refeito no meio de uma prova.
	active, err := uc.attemptRepo.FindActiveByUserAndSimulado(ctx, cmd.UserID, cmd.SimuladoID)
	if err == nil {
		return StartAttemptResult{Attempt: active, IsNew: false, Simulado: sim}, nil
	}
	if !errors.Is(err, shared.ErrNotFound) {
		return StartAttemptResult{}, fmt.Errorf("start attempt: find active: %w", err)
	}

	questionIDs, err := uc.drawQuestions(ctx, cmd.SimuladoID, sim.QuestionCount)
	if err != nil {
		return StartAttemptResult{}, fmt.Errorf("start attempt: draw questions: %w", err)
	}

	// Cria nova attempt.
	now := uc.clock.Now()
	attempt := domsimulado.StartAttempt(
		shared.NewAttemptID(),
		cmd.UserID,
		cmd.SimuladoID,
		sim.TimeLimitMin,
		questionIDs,
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

// drawQuestions sorteia `count` questões do banco real para o simulado. Se o
// banco Postgres não tem questões para este simuladoID (ex: catálogo antigo
// sem banco migrado), cai para o catálogo estático embutido — mantém
// simulados legados funcionando sem exigir banco para todo mundo.
func (uc *StartAttemptUseCase) drawQuestions(ctx context.Context, simuladoID shared.SimuladoID, count int) ([]shared.QuestionID, error) {
	dbQuestions, err := uc.questionRepo.GetRandom(ctx, simuladoID.String(), count, domsimulado.QuestionQueryOpts{})
	if err != nil {
		return nil, fmt.Errorf("get random: %w", err)
	}
	if len(dbQuestions) > 0 {
		ids := make([]shared.QuestionID, len(dbQuestions))
		for i, q := range dbQuestions {
			ids[i] = shared.QuestionID(q.ID)
		}
		return ids, nil
	}

	// Fallback: catálogo estático (sem banco no Postgres para este simulado).
	sim, err := uc.catalog.GetSimulado(simuladoID)
	if err != nil {
		return nil, fmt.Errorf("fallback catalog: %w", err)
	}
	ids := make([]shared.QuestionID, len(sim.Questions))
	for i, q := range sim.Questions {
		ids[i] = q.ID
	}
	return ids, nil
}
