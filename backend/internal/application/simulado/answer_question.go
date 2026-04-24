package simulado

import (
	"context"
	"fmt"

	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
)

// AnswerQuestionCommand registra a resposta do usuário para uma questão.
type AnswerQuestionCommand struct {
	UserID     shared.UserID
	AttemptID  shared.AttemptID
	QuestionID shared.QuestionID
	OptionID   domsimulado.OptionID
	HasPaid    bool
}

// AnswerQuestionUseCase salva a resposta de uma questão (onde o usuário parou).
//
// IDEMPOTENTE: chamar duas vezes com mesma resposta tem mesmo efeito.
// PAYWALL: questões além do limite free requerem pagamento (enforçado aqui).
// SERVIDOR AUTORITATIVO: valida que a questão existe no catálogo.
type AnswerQuestionUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	catalog     domsimulado.CatalogProvider
	paywall     domsimulado.PaywallPolicy
	clock       shared.Clock
}

func NewAnswerQuestionUseCase(
	repo domsimulado.AttemptRepository,
	catalog domsimulado.CatalogProvider,
	clock shared.Clock,
) *AnswerQuestionUseCase {
	return &AnswerQuestionUseCase{
		attemptRepo: repo,
		catalog:     catalog,
		paywall:     domsimulado.PaywallPolicy{},
		clock:       clock,
	}
}

func (uc *AnswerQuestionUseCase) Execute(ctx context.Context, cmd AnswerQuestionCommand) error {
	attempt, err := uc.attemptRepo.FindByID(ctx, cmd.AttemptID)
	if err != nil {
		return fmt.Errorf("answer question: find attempt: %w", err)
	}

	// Garante que o attempt pertence ao usuário que está fazendo a requisição.
	if attempt.UserID() != cmd.UserID {
		return fmt.Errorf("answer question: %w", shared.ErrForbidden)
	}

	// Busca o simulado para encontrar o índice da questão (necessário para paywall).
	sim, err := uc.catalog.GetSimulado(attempt.SimuladoID())
	if err != nil {
		return fmt.Errorf("answer question: get simulado: %w", err)
	}

	// Encontra o índice da questão no simulado.
	questionIndex := -1
	for i, q := range sim.Questions {
		if q.ID == cmd.QuestionID {
			questionIndex = i
			break
		}
	}
	if questionIndex == -1 {
		return fmt.Errorf("answer question: %w", domsimulado.ErrQuestionNotFound)
	}

	// Verifica paywall: questões além do free limit requerem pagamento.
	if !uc.paywall.IsAccessible(questionIndex, cmd.HasPaid) {
		return fmt.Errorf("answer question: %w", domsimulado.ErrPaywallBlocked)
	}

	// Delega a lógica de invariantes ao aggregate.
	now := uc.clock.Now()
	if err := attempt.AnswerQuestion(cmd.QuestionID, cmd.OptionID, now); err != nil {
		return fmt.Errorf("answer question: %w", err)
	}

	if err := uc.attemptRepo.Update(ctx, attempt); err != nil {
		return fmt.Errorf("answer question: update: %w", err)
	}

	return nil
}

// ToggleReviewFlagCommand marca/desmarca uma questão para revisão.
type ToggleReviewFlagCommand struct {
	UserID     shared.UserID
	AttemptID  shared.AttemptID
	QuestionID shared.QuestionID
}

// ToggleReviewFlagUseCase gerencia as flags de revisão.
type ToggleReviewFlagUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	clock       shared.Clock
}

func NewToggleReviewFlagUseCase(repo domsimulado.AttemptRepository, clock shared.Clock) *ToggleReviewFlagUseCase {
	return &ToggleReviewFlagUseCase{attemptRepo: repo, clock: clock}
}

func (uc *ToggleReviewFlagUseCase) Execute(ctx context.Context, cmd ToggleReviewFlagCommand) error {
	attempt, err := uc.attemptRepo.FindByID(ctx, cmd.AttemptID)
	if err != nil {
		return fmt.Errorf("toggle review flag: find: %w", err)
	}
	if attempt.UserID() != cmd.UserID {
		return fmt.Errorf("toggle review flag: %w", shared.ErrForbidden)
	}
	now := uc.clock.Now()
	if err := attempt.ToggleReviewFlag(cmd.QuestionID, now); err != nil {
		return fmt.Errorf("toggle review flag: %w", err)
	}
	return uc.attemptRepo.Update(ctx, attempt)
}
