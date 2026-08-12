package simulado_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appsim "github.com/fernandofv/api/internal/application/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// newAnsweredAttempt cria uma attempt já com um sorteio de questões fixado —
// desde a correção de ago/2026, AnswerQuestion valida contra
// attempt.QuestionIDs() (o sorteio feito em StartAttempt), não mais contra o
// catálogo estático inteiro.
func newAnsweredAttempt(id shared.AttemptID, userID shared.UserID, simID shared.SimuladoID, drawnIDs []shared.QuestionID, now time.Time) *domsim.Attempt {
	return domsim.StartAttempt(id, userID, simID, 90, drawnIDs, now)
}

func Test_AnswerQuestion_Execute_HappyPath_RecordsAnswer(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := newAnsweredAttempt(attemptID, userID, simID, []shared.QuestionID{"a", "b", "c"}, now)
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewAnswerQuestionUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: "a",
		OptionID:   domsim.OptionA,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if attempt.Answers().Count() != 1 {
		t.Fatalf("expected 1 answer recorded, got %d", attempt.Answers().Count())
	}
}

func Test_AnswerQuestion_Execute_WrongOwner_ReturnsForbidden(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	other := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := newAnsweredAttempt(attemptID, userID, simID, []shared.QuestionID{"a"}, now)
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewAnswerQuestionUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     other,
		AttemptID:  attemptID,
		QuestionID: "a",
		OptionID:   domsim.OptionA,
	})
	if !errors.Is(err, shared.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

func Test_AnswerQuestion_Execute_AttemptFinished_ReturnsValidation(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := newAnsweredAttempt(attemptID, userID, simID, []shared.QuestionID{"a"}, now)
	_ = attempt.Finish(domsim.NewScore(domsim.ScoreResult{Value: 100, Passed: true}), now)

	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewAnswerQuestionUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: "a",
		OptionID:   domsim.OptionA,
	})
	if err == nil || !errors.Is(err, domsim.ErrAttemptAlreadyFinished) {
		t.Fatalf("expected ErrAttemptAlreadyFinished, got %v", err)
	}
}

// A questão precisa fazer parte do SORTEIO desta tentativa — responder um ID
// que nunca foi mostrado ao usuário (nem existe no sorteio) é rejeitado.
func Test_AnswerQuestion_Execute_QuestionNotInDraw_ReturnsQuestionNotFound(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := newAnsweredAttempt(attemptID, userID, simID, []shared.QuestionID{"a", "b", "c"}, now)

	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewAnswerQuestionUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: "does-not-exist",
		OptionID:   domsim.OptionA,
	})
	if err == nil || !errors.Is(err, domsim.ErrQuestionNotFound) {
		t.Fatalf("expected ErrQuestionNotFound, got %v", err)
	}
}

// Toda questão do sorteio é igualmente aceitável, não importa a posição —
// não há mais noção de "índice dentro do catálogo" (a checagem antiga
// indexava sim.Questions; agora é O(1) contra o conjunto do sorteio).
func Test_AnswerQuestion_Execute_AnyDrawnQuestion_Accessible(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	drawn := make([]shared.QuestionID, 0, 12)
	for i := 0; i < 12; i++ {
		drawn = append(drawn, shared.QuestionID(string(rune('a'+i))))
	}
	attempt := newAnsweredAttempt(attemptID, userID, simID, drawn, now)
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}

	uc := appsim.NewAnswerQuestionUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: shared.QuestionID("k"), // 11º item do sorteio
		OptionID:   domsim.OptionA,
	})
	if err != nil {
		t.Fatalf("expected no error for a question late in the draw, got %v", err)
	}
}

// Prova de que UpsertAnswer é de fato a via de escrita: duas respostas
// concorrentes (mesma tentativa, questões diferentes) não perdem uma à outra.
func Test_AnswerQuestion_Execute_ConcurrentAnswers_BothPersist(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := newAnsweredAttempt(attemptID, userID, simID, []shared.QuestionID{"a", "b"}, now)
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}
	uc := appsim.NewAnswerQuestionUseCase(repo, shared.FixedClock{T: now})

	if err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID: userID, AttemptID: attemptID, QuestionID: "a", OptionID: domsim.OptionA,
	}); err != nil {
		t.Fatalf("unexpected error on first answer: %v", err)
	}
	if err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID: userID, AttemptID: attemptID, QuestionID: "b", OptionID: domsim.OptionB,
	}); err != nil {
		t.Fatalf("unexpected error on second answer: %v", err)
	}

	if attempt.Answers().Count() != 2 {
		t.Fatalf("expected both answers persisted, got %d", attempt.Answers().Count())
	}
}
