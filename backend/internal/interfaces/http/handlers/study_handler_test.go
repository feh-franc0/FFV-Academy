// Package handlers — testes de contrato do StudyHandler.
//
// Trava o achado P-01 da auditoria de segurança de 11/ago/2026: gabarito
// (correctId/explanation) nunca pode sair para um usuário com tentativa
// ATIVA do mesmo simulado, e questions/batch só revela gabarito para IDs que
// pertencem a uma tentativa FINALIZADA do próprio usuário.
package handlers_test

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// ─── Mocks ────────────────────────────────────────────────────────────────

type stubQuestionRepo struct {
	questions map[string]*domsim.DBQuestion
}

func (s *stubQuestionRepo) GetRandom(_ context.Context, simuladoID string, count int, _ domsim.QuestionQueryOpts) ([]*domsim.DBQuestion, error) {
	out := make([]*domsim.DBQuestion, 0, count)
	for _, q := range s.questions {
		if q.SimuladoID != simuladoID {
			continue
		}
		out = append(out, q)
		if len(out) >= count {
			break
		}
	}
	return out, nil
}
func (s *stubQuestionRepo) FindByID(_ context.Context, id string) (*domsim.DBQuestion, error) {
	q, ok := s.questions[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return q, nil
}
func (s *stubQuestionRepo) FindByIDs(_ context.Context, simuladoID string, ids []string) ([]*domsim.DBQuestion, error) {
	out := make([]*domsim.DBQuestion, 0, len(ids))
	for _, id := range ids {
		if q, ok := s.questions[id]; ok && q.SimuladoID == simuladoID {
			out = append(out, q)
		}
	}
	return out, nil
}
func (s *stubQuestionRepo) List(_ context.Context, filter domsim.QuestionFilter) ([]*domsim.DBQuestion, int, error) {
	out := make([]*domsim.DBQuestion, 0)
	for _, q := range s.questions {
		if q.SimuladoID == filter.SimuladoID {
			out = append(out, q)
		}
	}
	return out, len(out), nil
}
func (s *stubQuestionRepo) Create(_ context.Context, _ *domsim.DBQuestion) error { return nil }
func (s *stubQuestionRepo) Update(_ context.Context, _ *domsim.DBQuestion) error { return nil }
func (s *stubQuestionRepo) Delete(_ context.Context, _ string) error             { return nil }
func (s *stubQuestionRepo) CountBySimulado(_ context.Context, _ string) (int, error) {
	return len(s.questions), nil
}

type stubAttemptRepoForStudy struct {
	active   *domsim.Attempt // nil = sem tentativa ativa
	finished []*domsim.Attempt
}

func (s *stubAttemptRepoForStudy) Save(_ context.Context, _ *domsim.Attempt) error   { return nil }
func (s *stubAttemptRepoForStudy) Update(_ context.Context, _ *domsim.Attempt) error { return nil }
func (s *stubAttemptRepoForStudy) UpsertAnswer(_ context.Context, _ shared.AttemptID, _ shared.QuestionID, _ domsim.OptionID, _ time.Time) (bool, error) {
	return false, nil
}
func (s *stubAttemptRepoForStudy) FindByID(_ context.Context, _ shared.AttemptID) (*domsim.Attempt, error) {
	return nil, shared.ErrNotFound
}
func (s *stubAttemptRepoForStudy) FindActiveByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) (*domsim.Attempt, error) {
	if s.active == nil {
		return nil, shared.ErrNotFound
	}
	return s.active, nil
}
func (s *stubAttemptRepoForStudy) ListFinishedByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) ([]*domsim.Attempt, error) {
	return s.finished, nil
}
func (s *stubAttemptRepoForStudy) ListByUser(_ context.Context, _ shared.UserID, _, _ int) ([]*domsim.Attempt, int, error) {
	return nil, 0, nil
}
func (s *stubAttemptRepoForStudy) ClaimXPCredit(_ context.Context, _ shared.AttemptID, _ shared.UserID, _ time.Time) (bool, error) {
	return true, nil
}

var _ domsim.QuestionRepository = (*stubQuestionRepo)(nil)
var _ domsim.AttemptRepository = (*stubAttemptRepoForStudy)(nil)

// ─── Helpers ────────────────────────────────────────────────────────────────

func requestWithUserAndParam(userID shared.UserID, simuladoID string, query string) *http.Request {
	req := httptest.NewRequest(http.MethodGet, "/api/v1/simulados/"+simuladoID+"/x?"+query, http.NoBody)
	ctx := context.WithValue(req.Context(), middleware.CtxKeyUserID, userID)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("simuladoId", simuladoID)
	ctx = context.WithValue(ctx, chi.RouteCtxKey, rctx)
	return req.WithContext(ctx)
}

func decodeQuestionsResponse(t *testing.T, w *httptest.ResponseRecorder) []map[string]interface{} {
	t.Helper()
	var resp struct {
		Questions []map[string]interface{} `json:"questions"`
	}
	if err := json.NewDecoder(w.Body).Decode(&resp); err != nil {
		t.Fatalf("JSON inválido: %v (body=%s)", err, w.Body.String())
	}
	return resp.Questions
}

const testSimuladoID = "sim-aif"

func newQuestion(id string) *domsim.DBQuestion {
	return &domsim.DBQuestion{
		ID:         id,
		SimuladoID: testSimuladoID,
		Stem:       "stem-" + id,
		Options:    []domsim.QuestionOption{{ID: domsim.OptionA, Text: "A"}, {ID: domsim.OptionB, Text: "B"}},
		CorrectID:  domsim.OptionA,
		Topic:      "geral",
		Difficulty: domsim.DifficultyEasy,
		Status:     "active",
	}
}

// ─── study/random ───────────────────────────────────────────────────────────

func Test_StudyHandler_GetRandomQuestions_NoActiveAttempt_IncludesCorrectID(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1")}}
	attemptRepo := &stubAttemptRepoForStudy{} // sem tentativa ativa
	h := handlers.NewStudyHandler(repo, attemptRepo)

	req := requestWithUserAndParam("u1", testSimuladoID, "count=1")
	w := httptest.NewRecorder()
	h.GetRandomQuestions(w, req)

	questions := decodeQuestionsResponse(t, w)
	if len(questions) != 1 {
		t.Fatalf("esperava 1 questão, veio %d", len(questions))
	}
	if _, ok := questions[0]["correctId"]; !ok {
		t.Fatal("modo estudo sem tentativa ativa deveria incluir correctId")
	}
}

// Test_StudyHandler_GetRandomQuestions_ActiveAttempt_OmitsCorrectID é a prova
// direta de P-01: com uma prova em andamento, este endpoint lateral não pode
// mais ser usado para ler o gabarito.
func Test_StudyHandler_GetRandomQuestions_ActiveAttempt_OmitsCorrectID(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1")}}
	active := domsim.StartAttempt("att-1", "u1", shared.SimuladoID(testSimuladoID), 30, []shared.QuestionID{"q1"}, time.Now())
	attemptRepo := &stubAttemptRepoForStudy{active: active}
	h := handlers.NewStudyHandler(repo, attemptRepo)

	req := requestWithUserAndParam("u1", testSimuladoID, "count=1")
	w := httptest.NewRecorder()
	h.GetRandomQuestions(w, req)

	questions := decodeQuestionsResponse(t, w)
	if len(questions) != 1 {
		t.Fatalf("esperava 1 questão, veio %d", len(questions))
	}
	if _, ok := questions[0]["correctId"]; ok {
		t.Fatal("com tentativa ativa, study/random NÃO PODE incluir correctId")
	}
	if _, ok := questions[0]["explanation"]; ok {
		t.Fatal("com tentativa ativa, study/random NÃO PODE incluir explanation")
	}
}

// ─── questions/batch ─────────────────────────────────────────────────────────

func Test_StudyHandler_GetQuestionsByIDs_ActiveAttempt_OmitsCorrectIDForAll(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1"), "q2": newQuestion("q2")}}
	active := domsim.StartAttempt("att-1", "u1", shared.SimuladoID(testSimuladoID), 30, []shared.QuestionID{"q1", "q2"}, time.Now())
	attemptRepo := &stubAttemptRepoForStudy{active: active}
	h := handlers.NewStudyHandler(repo, attemptRepo)

	req := requestWithUserAndParam("u1", testSimuladoID, "ids=q1,q2")
	w := httptest.NewRecorder()
	h.GetQuestionsByIDs(w, req)

	questions := decodeQuestionsResponse(t, w)
	if len(questions) != 2 {
		t.Fatalf("esperava 2 questões, veio %d", len(questions))
	}
	for _, q := range questions {
		if _, ok := q["correctId"]; ok {
			t.Fatalf("com tentativa ativa, batch NÃO PODE incluir correctId (id=%v)", q["id"])
		}
	}
}

// Test_StudyHandler_GetQuestionsByIDs_OwnFinishedAttempt_IncludesCorrectID
// cobre a revisão pós-prova legítima: IDs que pertencem a uma tentativa
// finalizada do PRÓPRIO usuário continuam revelando gabarito.
func Test_StudyHandler_GetQuestionsByIDs_OwnFinishedAttempt_IncludesCorrectID(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1")}}
	finished := domsim.StartAttempt("att-1", "u1", shared.SimuladoID(testSimuladoID), 30, []shared.QuestionID{"q1"}, time.Now())
	score := domsim.NewScore(domsim.ScoreResult{ByTopic: map[domsim.Topic]domsim.TopicCounts{}})
	if err := finished.Finish(score, time.Now()); err != nil {
		t.Fatalf("finish: %v", err)
	}
	attemptRepo := &stubAttemptRepoForStudy{finished: []*domsim.Attempt{finished}}
	h := handlers.NewStudyHandler(repo, attemptRepo)

	req := requestWithUserAndParam("u1", testSimuladoID, "ids=q1")
	w := httptest.NewRecorder()
	h.GetQuestionsByIDs(w, req)

	questions := decodeQuestionsResponse(t, w)
	if len(questions) != 1 {
		t.Fatalf("esperava 1 questão, veio %d", len(questions))
	}
	if _, ok := questions[0]["correctId"]; !ok {
		t.Fatal("revisão de tentativa finalizada própria deveria incluir correctId")
	}
}

// Test_StudyHandler_GetQuestionsByIDs_NotOwned_OmitsCorrectID é a prova
// direta do segundo pilar de P-01: um ID que não pertence a NENHUMA
// tentativa finalizada do usuário não pode revelar gabarito, mesmo sem
// tentativa ativa — fecha o "escolha qualquer ID e leia a resposta".
func Test_StudyHandler_GetQuestionsByIDs_NotOwned_OmitsCorrectID(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1"), "q2": newQuestion("q2")}}
	// Tentativa finalizada existe, mas cobre só q1 — q2 não é "dele".
	finished := domsim.StartAttempt("att-1", "u1", shared.SimuladoID(testSimuladoID), 30, []shared.QuestionID{"q1"}, time.Now())
	score := domsim.NewScore(domsim.ScoreResult{ByTopic: map[domsim.Topic]domsim.TopicCounts{}})
	if err := finished.Finish(score, time.Now()); err != nil {
		t.Fatalf("finish: %v", err)
	}
	attemptRepo := &stubAttemptRepoForStudy{finished: []*domsim.Attempt{finished}}
	h := handlers.NewStudyHandler(repo, attemptRepo)

	req := requestWithUserAndParam("u1", testSimuladoID, "ids=q1,q2")
	w := httptest.NewRecorder()
	h.GetQuestionsByIDs(w, req)

	questions := decodeQuestionsResponse(t, w)
	byID := map[string]map[string]interface{}{}
	for _, q := range questions {
		byID[q["id"].(string)] = q
	}
	if _, ok := byID["q1"]["correctId"]; !ok {
		t.Fatal("q1 pertence à tentativa finalizada do usuário, deveria ter correctId")
	}
	if _, ok := byID["q2"]["correctId"]; ok {
		t.Fatal("q2 NÃO pertence a nenhuma tentativa do usuário — correctId não pode vazar")
	}
}

func Test_StudyHandler_GetQuestionsByIDs_NoUserInContext_FailsClosed(t *testing.T) {
	repo := &stubQuestionRepo{questions: map[string]*domsim.DBQuestion{"q1": newQuestion("q1")}}
	finished := domsim.StartAttempt("att-1", "u1", shared.SimuladoID(testSimuladoID), 30, []shared.QuestionID{"q1"}, time.Now())
	score := domsim.NewScore(domsim.ScoreResult{ByTopic: map[domsim.Topic]domsim.TopicCounts{}})
	if err := finished.Finish(score, time.Now()); err != nil {
		t.Fatalf("finish: %v", err)
	}
	attemptRepo := &stubAttemptRepoForStudy{finished: []*domsim.Attempt{finished}}
	h := handlers.NewStudyHandler(repo, attemptRepo)

	// Sem middleware.CtxKeyUserID no contexto — não deveria acontecer via
	// roteador real (a rota exige JWT), mas o handler precisa falhar fechado
	// mesmo assim.
	req := httptest.NewRequest(http.MethodGet, "/api/v1/simulados/"+testSimuladoID+"/x?ids=q1", http.NoBody)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("simuladoId", testSimuladoID)
	req = req.WithContext(context.WithValue(req.Context(), chi.RouteCtxKey, rctx))
	w := httptest.NewRecorder()
	h.GetQuestionsByIDs(w, req)

	questions := decodeQuestionsResponse(t, w)
	if len(questions) != 1 {
		t.Fatalf("esperava 1 questão, veio %d", len(questions))
	}
	if _, ok := questions[0]["correctId"]; ok {
		t.Fatal("sem userID no contexto deveria falhar fechado (sem correctId)")
	}
}
