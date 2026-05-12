package tutor_test

import (
	"context"
	"errors"
	"testing"

	apptutor "github.com/fernandofv/api/internal/application/tutor"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	domtutor "github.com/fernandofv/api/internal/domain/tutor"
)

type mockTutorProvider struct {
	resp   domtutor.TutorResponse
	err    error
	called int
}

func (m *mockTutorProvider) Ask(_ context.Context, _ domtutor.Query) (domtutor.TutorResponse, error) {
	m.called++
	return m.resp, m.err
}

type mockRateLimiter struct {
	checkErr  error
	incrErr   error
	incrCalls int
}

func (m *mockRateLimiter) Check(_ context.Context, _ shared.UserID, _ bool) error { return m.checkErr }
func (m *mockRateLimiter) Increment(_ context.Context, _ shared.UserID) error {
	m.incrCalls++
	return m.incrErr
}

type mockTutorCatalog struct {
	sim *domsim.Simulado
	err error
}

func (m *mockTutorCatalog) GetSimulado(_ shared.SimuladoID) (*domsim.Simulado, error) {
	if m.err != nil {
		return nil, m.err
	}
	if m.sim == nil {
		return nil, shared.ErrNotFound
	}
	return m.sim, nil
}
func (m *mockTutorCatalog) ListSimulados() ([]*domsim.Simulado, error) { return nil, nil }

func makeSim(qID shared.QuestionID) *domsim.Simulado {
	return &domsim.Simulado{
		ID: "s1",
		Questions: []domsim.Question{
			{ID: qID, Stem: "Stem?", CorrectID: "A"},
		},
	}
}

func Test_Ask_Execute_HappyPath_CallsProviderAndIncrements(t *testing.T) {
	provider := &mockTutorProvider{resp: domtutor.TutorResponse{Explanation: "ok"}}
	rl := &mockRateLimiter{}
	catalog := &mockTutorCatalog{sim: makeSim("q1")}

	uc := apptutor.NewAskUseCase(provider, rl, catalog)
	res, err := uc.Execute(context.Background(), apptutor.AskCommand{
		UserID: shared.NewUserID(), SimuladoID: "s1", QuestionID: "q1", Kind: domtutor.KindPorQue,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.Explanation != "ok" {
		t.Fatalf("unexpected response: %+v", res)
	}
	if provider.called != 1 {
		t.Fatalf("expected provider called once, got %d", provider.called)
	}
	if rl.incrCalls != 1 {
		t.Fatalf("expected increment called once, got %d", rl.incrCalls)
	}
}

func Test_Ask_Execute_RateLimited_SkipsProvider(t *testing.T) {
	provider := &mockTutorProvider{}
	rl := &mockRateLimiter{checkErr: shared.ErrRateLimited}
	catalog := &mockTutorCatalog{sim: makeSim("q1")}

	uc := apptutor.NewAskUseCase(provider, rl, catalog)
	_, err := uc.Execute(context.Background(), apptutor.AskCommand{
		UserID: shared.NewUserID(), SimuladoID: "s1", QuestionID: "q1", Kind: domtutor.KindPorQue,
	})
	if !errors.Is(err, shared.ErrRateLimited) {
		t.Fatalf("expected ErrRateLimited, got %v", err)
	}
	if provider.called != 0 {
		t.Fatalf("expected provider NOT called when rate-limited, got %d", provider.called)
	}
}

func Test_Ask_Execute_SimuladoNotFound_ReturnsNotFound(t *testing.T) {
	uc := apptutor.NewAskUseCase(&mockTutorProvider{}, &mockRateLimiter{}, &mockTutorCatalog{})
	_, err := uc.Execute(context.Background(), apptutor.AskCommand{
		UserID: shared.NewUserID(), SimuladoID: "x", QuestionID: "q1",
	})
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func Test_Ask_Execute_QuestionNotFound_ReturnsQuestionNotFound(t *testing.T) {
	uc := apptutor.NewAskUseCase(&mockTutorProvider{}, &mockRateLimiter{}, &mockTutorCatalog{sim: makeSim("q1")})
	_, err := uc.Execute(context.Background(), apptutor.AskCommand{
		UserID: shared.NewUserID(), SimuladoID: "s1", QuestionID: "does-not-exist",
	})
	if !errors.Is(err, domsim.ErrQuestionNotFound) {
		t.Fatalf("expected ErrQuestionNotFound, got %v", err)
	}
}

func Test_Ask_Execute_ProviderFails_PropagatesError(t *testing.T) {
	boom := errors.New("claude timeout")
	uc := apptutor.NewAskUseCase(&mockTutorProvider{err: boom}, &mockRateLimiter{},
		&mockTutorCatalog{sim: makeSim("q1")})
	_, err := uc.Execute(context.Background(), apptutor.AskCommand{
		UserID: shared.NewUserID(), SimuladoID: "s1", QuestionID: "q1",
	})
	if err == nil || !errors.Is(err, boom) {
		t.Fatalf("expected wrapped boom, got %v", err)
	}
}

func Test_Ask_Execute_IncrementFails_StillReturnsResponse(t *testing.T) {
	provider := &mockTutorProvider{resp: domtutor.TutorResponse{Explanation: "ok"}}
	rl := &mockRateLimiter{incrErr: errors.New("redis down")}
	catalog := &mockTutorCatalog{sim: makeSim("q1")}

	uc := apptutor.NewAskUseCase(provider, rl, catalog)
	res, err := uc.Execute(context.Background(), apptutor.AskCommand{
		UserID: shared.NewUserID(), SimuladoID: "s1", QuestionID: "q1",
	})
	if err != nil {
		t.Fatalf("increment failure should NOT block response, got %v", err)
	}
	if res.Explanation != "ok" {
		t.Fatalf("expected response returned despite increment failure")
	}
}
