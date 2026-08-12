package simulado

import (
	"context"
	"fmt"

	"github.com/fernandofv/api/internal/domain/shared"
	domsimulado "github.com/fernandofv/api/internal/domain/simulado"
)

// AnswerQuestionCommand registra a resposta do usuário para uma questão.
type AnswerQuestionCommand struct {
	UserID     shared.UserID
	AttemptID  shared.AttemptID
	QuestionID shared.QuestionID
	OptionID   domsimulado.OptionID
}

// AnswerQuestionUseCase salva a resposta de uma questão (onde o usuário parou).
//
// IDEMPOTENTE: chamar duas vezes com mesma resposta tem mesmo efeito.
// SERVIDOR AUTORITATIVO: valida que a questão faz parte do sorteio desta
// tentativa (attempt.QuestionIDs(), fixado em StartAttempt) — não mais o
// catálogo estático inteiro, que nem corresponde às questões que o usuário
// de fato viu quando o sorteio é uma amostra do banco real.
// ATÔMICO: a escrita usa UpsertAnswer (jsonb_set no SQL), não o padrão
// find→mutate→Update, que perde resposta em corrida entre duas requisições
// concorrentes da mesma tentativa.
type AnswerQuestionUseCase struct {
	attemptRepo domsimulado.AttemptRepository
	clock       shared.Clock
}

func NewAnswerQuestionUseCase(
	repo domsimulado.AttemptRepository,
	clock shared.Clock,
) *AnswerQuestionUseCase {
	return &AnswerQuestionUseCase{
		attemptRepo: repo,
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

	now := uc.clock.Now()

	// Valida as invariantes (finalizada/expirada/questão pertence ao sorteio)
	// no aggregate em memória ANTES de tentar a escrita atômica — dá uma
	// mensagem de erro específica em vez de "0 linhas afetadas" genérico.
	if err := attempt.AnswerQuestion(cmd.QuestionID, cmd.OptionID, now); err != nil {
		return fmt.Errorf("answer question: %w", err)
	}

	updated, err := uc.attemptRepo.UpsertAnswer(ctx, cmd.AttemptID, cmd.QuestionID, cmd.OptionID, now)
	if err != nil {
		return fmt.Errorf("answer question: upsert: %w", err)
	}
	if !updated {
		// A validação em memória passou, mas o UPDATE não afetou nenhuma
		// linha — a tentativa mudou de estado (finalizou/expirou) na janela
		// entre o FindByID e o UpsertAnswer. Trata como o mesmo erro que a
		// validação em memória teria dado.
		return fmt.Errorf("answer question: %w", domsimulado.ErrAttemptExpired)
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
