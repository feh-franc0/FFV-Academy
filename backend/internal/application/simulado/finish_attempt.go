package simulado

import (
	"context"
	"fmt"

	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
)

// FinishAttemptCommand finaliza uma tentativa de simulado.
type FinishAttemptCommand struct {
	UserID    shared.UserID
	AttemptID shared.AttemptID
}

// FinishAttemptResult contém o resultado após finalização.
type FinishAttemptResult struct {
	Attempt      *domsimulado.Attempt
	ScoreResult  domsimulado.ScoreResult
	WeakTopics   []domsimulado.Topic
}

// FinishAttemptUseCase finaliza e calcula o score server-side.
//
// IDEMPOTENTE: se já finalizada, retorna o resultado existente.
// SEGURANÇA: score calculado no servidor contra o catálogo embebido.
// O cliente não pode mentir o score.
type FinishAttemptUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	catalog     domsimulado.CatalogProvider
	scorer      domsimulado.Scorer
	clock       shared.Clock
}

func NewFinishAttemptUseCase(
	repo domsimulado.AttemptRepository,
	catalog domsimulado.CatalogProvider,
	clock shared.Clock,
) *FinishAttemptUseCase {
	return &FinishAttemptUseCase{
		attemptRepo: repo,
		catalog:     catalog,
		scorer:      domsimulado.Scorer{},
		clock:       clock,
	}
}

func (uc *FinishAttemptUseCase) Execute(ctx context.Context, cmd FinishAttemptCommand) (FinishAttemptResult, error) {
	attempt, err := uc.attemptRepo.FindByID(ctx, cmd.AttemptID)
	if err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: find: %w", err)
	}

	if attempt.UserID() != cmd.UserID {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: %w", shared.ErrForbidden)
	}

	sim, err := uc.catalog.GetSimulado(attempt.SimuladoID())
	if err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: get simulado: %w", err)
	}

	// Calcula score server-side.
	scoreResult := uc.scorer.Calculate(sim, attempt.Answers())

	// Se já finalizada, retorna resultado existente (idempotência).
	// Usa NewScore(scoreResult) — Score{} é zero-value e WeakTopics retornaria
	// sempre vazio, perdendo a informação para o cliente em retries.
	if attempt.IsFinished() {
		return FinishAttemptResult{
			Attempt:     attempt,
			ScoreResult: scoreResult,
			WeakTopics:  domsimulado.NewScore(scoreResult).WeakTopics(0.7),
		}, nil
	}

	score := domsimulado.NewScore(scoreResult)
	now := uc.clock.Now()
	if err := attempt.Finish(score, now); err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: %w", err)
	}

	if err := uc.attemptRepo.Update(ctx, attempt); err != nil {
		return FinishAttemptResult{}, fmt.Errorf("finish attempt: save: %w", err)
	}

	weakTopics := score.WeakTopics(0.7)

	return FinishAttemptResult{
		Attempt:     attempt,
		ScoreResult: scoreResult,
		WeakTopics:  weakTopics,
	}, nil
}

// ResumeAttemptUseCase retorna o estado atual de uma attempt ativa.
type ResumeAttemptUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	catalog     domsimulado.CatalogProvider
	clock       shared.Clock
}

func NewResumeAttemptUseCase(
	repo domsimulado.AttemptRepository,
	catalog domsimulado.CatalogProvider,
	clock shared.Clock,
) *ResumeAttemptUseCase {
	return &ResumeAttemptUseCase{attemptRepo: repo, catalog: catalog, clock: clock}
}

type ResumeAttemptResult struct {
	Attempt   *domsimulado.Attempt
	Simulado  *domsimulado.Simulado
}

func (uc *ResumeAttemptUseCase) Execute(ctx context.Context, userID shared.UserID, simuladoID shared.SimuladoID) (ResumeAttemptResult, error) {
	attempt, err := uc.attemptRepo.FindActiveByUserAndSimulado(ctx, userID, simuladoID)
	if err != nil {
		return ResumeAttemptResult{}, fmt.Errorf("resume attempt: %w", err)
	}

	sim, err := uc.catalog.GetSimulado(simuladoID)
	if err != nil {
		return ResumeAttemptResult{}, fmt.Errorf("resume attempt: get simulado: %w", err)
	}

	// Verifica se expirou — se sim, finaliza automaticamente.
	now := uc.clock.Now()
	if attempt.IsExpired(now) {
		scoreResult := domsimulado.Scorer{}.Calculate(sim, attempt.Answers())
		score := domsimulado.NewScore(scoreResult)
		_ = attempt.Finish(score, now)
		_ = uc.attemptRepo.Update(ctx, attempt)
	}

	return ResumeAttemptResult{Attempt: attempt, Simulado: sim}, nil
}

// ListAttemptsUseCase lista as tentativas do usuário.
type ListAttemptsUseCase struct {
	attemptRepo domsimulado.AttemptRepository
}

func NewListAttemptsUseCase(repo domsimulado.AttemptRepository) *ListAttemptsUseCase {
	return &ListAttemptsUseCase{attemptRepo: repo}
}

type ListAttemptsResult struct {
	Attempts []*domsimulado.Attempt
	Total    int
}

func (uc *ListAttemptsUseCase) Execute(ctx context.Context, userID shared.UserID, limit, offset int) (ListAttemptsResult, error) {
	attempts, total, err := uc.attemptRepo.ListByUser(ctx, userID, limit, offset)
	if err != nil {
		return ListAttemptsResult{}, fmt.Errorf("list attempts: %w", err)
	}
	return ListAttemptsResult{Attempts: attempts, Total: total}, nil
}
