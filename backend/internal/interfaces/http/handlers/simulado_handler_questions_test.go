// Package handlers — teste de contrato do gating de P-01 em ListSimuladoQuestions.
//
// Mesmo invariante de study_handler_test.go, aplicado à rota
// GET /api/v1/simulados/{simuladoId}/questions.
package handlers_test

import (
	"net/http/httptest"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

func Test_SimuladoHandler_ListSimuladoQuestions_ActiveAttempt_OmitsCorrectID(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1")}}
	active := domsim.StartAttempt("att-1", "u1", shared.SimuladoID(testSimuladoID), 30, []shared.QuestionID{"q1"}, time.Now())
	attemptRepo := &stubAttemptRepoForStudy{active: active}

	h := handlers.NewSimuladoHandler(nil, nil, nil, nil, nil, nil, nil).
		WithQuestionRepo(repo).
		WithAttemptRepoForQuestions(attemptRepo)

	req := requestWithUserAndParam("u1", testSimuladoID, "")
	w := httptest.NewRecorder()
	h.ListSimuladoQuestions(w, req)

	questions := decodeQuestionsResponse(t, w)
	if len(questions) != 1 {
		t.Fatalf("esperava 1 questão, veio %d", len(questions))
	}
	if _, ok := questions[0]["correctId"]; ok {
		t.Fatal("com tentativa ativa, a listagem NÃO PODE incluir correctId")
	}
}

func Test_SimuladoHandler_ListSimuladoQuestions_NoActiveAttempt_IncludesCorrectID(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1")}}
	attemptRepo := &stubAttemptRepoForStudy{}

	h := handlers.NewSimuladoHandler(nil, nil, nil, nil, nil, nil, nil).
		WithQuestionRepo(repo).
		WithAttemptRepoForQuestions(attemptRepo)

	req := requestWithUserAndParam("u1", testSimuladoID, "")
	w := httptest.NewRecorder()
	h.ListSimuladoQuestions(w, req)

	questions := decodeQuestionsResponse(t, w)
	if len(questions) != 1 {
		t.Fatalf("esperava 1 questão, veio %d", len(questions))
	}
	if _, ok := questions[0]["correctId"]; !ok {
		t.Fatal("sem tentativa ativa, a listagem deveria incluir correctId (uso admin/estudo)")
	}
}
