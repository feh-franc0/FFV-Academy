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

func makeSimulado(simID shared.SimuladoID, numFree, numPaid int) *domsim.Simulado {
	total := numFree + numPaid
	questions := make([]domsim.Question, 0, total)
	for i := 0; i < total; i++ {
		questions = append(questions, domsim.Question{
			ID:        shared.QuestionID(string(rune('a' + i))),
			CorrectID: "A",
			Topic:     "Cloud",
		})
	}
	return &domsim.Simulado{
		ID:           simID,
		TimeLimitMin: 90,
		PassingScore: 70,
		Questions:    questions,
	}
}

func Test_AnswerQuestion_Execute_HappyPath_RecordsAnswer(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}
	catalog := &startAttemptMockCatalog{sim: makeSimulado(simID, 3, 0)}

	uc := appsim.NewAnswerQuestionUseCase(repo, catalog, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: "a",
		OptionID:   domsim.OptionA,
		HasPaid:    false,
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
	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}
	catalog := &startAttemptMockCatalog{sim: makeSimulado(simID, 3, 0)}

	uc := appsim.NewAnswerQuestionUseCase(repo, catalog, shared.FixedClock{T: now})
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
	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	_ = attempt.Finish(domsim.NewScore(domsim.ScoreResult{Value: 100, Passed: true}), now)

	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}
	catalog := &startAttemptMockCatalog{sim: makeSimulado(simID, 3, 0)}

	uc := appsim.NewAnswerQuestionUseCase(repo, catalog, shared.FixedClock{T: now})
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

func Test_AnswerQuestion_Execute_QuestionNotInSimulado_ReturnsQuestionNotFound(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)

	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}
	catalog := &startAttemptMockCatalog{sim: makeSimulado(simID, 3, 0)}

	uc := appsim.NewAnswerQuestionUseCase(repo, catalog, shared.FixedClock{T: now})
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

func Test_AnswerQuestion_Execute_PaywallBlocked_ReturnsPaywallBlocked(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attemptID := shared.NewAttemptID()
	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)

	// Criar simulado com 12 perguntas; índices 10 e 11 são pagos (>= FreeQuestionsLimit=10).
	// Rune 'a' + 10 = 'k'.
	sim := makeSimulado(simID, 10, 2)
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt}}
	catalog := &startAttemptMockCatalog{sim: sim}

	uc := appsim.NewAnswerQuestionUseCase(repo, catalog, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     userID,
		AttemptID:  attemptID,
		QuestionID: shared.QuestionID("k"),
		OptionID:   domsim.OptionA,
		HasPaid:    false,
	})
	if err == nil || !errors.Is(err, domsim.ErrPaywallBlocked) {
		t.Fatalf("expected ErrPaywallBlocked, got %v", err)
	}
}
