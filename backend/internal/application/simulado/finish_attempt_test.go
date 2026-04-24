package simulado_test

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	appsim "github.com/fernandofv/api/internal/application/simulado"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
)

// --- Mocks inline para teste isolado ---

type mockAttemptRepo struct {
	byID map[shared.AttemptID]*domsim.Attempt
	saved []*domsim.Attempt
}

func (m *mockAttemptRepo) FindByID(_ context.Context, id shared.AttemptID) (*domsim.Attempt, error) {
	a, ok := m.byID[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return a, nil
}

func (m *mockAttemptRepo) Save(_ context.Context, a *domsim.Attempt) error {
	m.saved = append(m.saved, a)
	return nil
}

func (m *mockAttemptRepo) Update(_ context.Context, a *domsim.Attempt) error {
	m.byID[a.ID()] = a
	return nil
}

func (m *mockAttemptRepo) FindActiveByUserAndSimulado(_ context.Context, userID shared.UserID, simID shared.SimuladoID) (*domsim.Attempt, error) {
	for _, a := range m.byID {
		if a.UserID() == userID && a.SimuladoID() == simID && !a.IsFinished() {
			return a, nil
		}
	}
	return nil, shared.ErrNotFound
}

func (m *mockAttemptRepo) ListByUser(_ context.Context, _ shared.UserID, _, _ int) ([]*domsim.Attempt, int, error) {
	return nil, 0, nil
}

type mockCatalog struct {
	sim *domsim.Simulado
}

func (m *mockCatalog) GetSimulado(_ shared.SimuladoID) (*domsim.Simulado, error) {
	if m.sim == nil {
		return nil, shared.ErrNotFound
	}
	return m.sim, nil
}

func (m *mockCatalog) ListSimulados() ([]*domsim.Simulado, error) {
	return []*domsim.Simulado{m.sim}, nil
}

// --- Testes ---

func Test_FinishAttemptUseCase_Execute_ValidAttempt_CalculatesScore(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("aws-clf")
	attemptID := shared.NewAttemptID()

	sim := &domsim.Simulado{
		ID:           simID,
		PassingScore: 70,
		TimeLimitMin: 90,
		Questions: []domsim.Question{
			{ID: shared.QuestionID("q1"), CorrectID: "A", Topic: "Cloud"},
			{ID: shared.QuestionID("q2"), CorrectID: "B", Topic: "Cloud"},
		},
	}

	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	_ = attempt.AnswerQuestion(shared.QuestionID("q1"), domsim.OptionID("A"), now)
	_ = attempt.AnswerQuestion(shared.QuestionID("q2"), domsim.OptionID("B"), now)

	repo := &mockAttemptRepo{
		byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt},
	}
	catalog := &mockCatalog{sim: sim}
	clock := shared.FixedClock{T: now}

	uc := appsim.NewFinishAttemptUseCase(repo, catalog, clock)
	result, err := uc.Execute(context.Background(), appsim.FinishAttemptCommand{
		UserID:    userID,
		AttemptID: attemptID,
	})

	require.NoError(t, err)
	assert.True(t, result.Attempt.IsFinished())
	assert.Equal(t, 100, result.ScoreResult.Value)
	assert.True(t, result.ScoreResult.Passed)
}

func Test_FinishAttemptUseCase_Execute_WrongOwner_ReturnsForbidden(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	otherUserID := shared.NewUserID()
	simID := shared.SimuladoID("aws-clf")
	attemptID := shared.NewAttemptID()

	attempt := domsim.StartAttempt(attemptID, userID, simID, 90, now)
	repo := &mockAttemptRepo{
		byID: map[shared.AttemptID]*domsim.Attempt{attemptID: attempt},
	}
	catalog := &mockCatalog{sim: &domsim.Simulado{ID: simID, PassingScore: 70}}
	clock := shared.FixedClock{T: now}

	uc := appsim.NewFinishAttemptUseCase(repo, catalog, clock)
	_, err := uc.Execute(context.Background(), appsim.FinishAttemptCommand{
		UserID:    otherUserID,
		AttemptID: attemptID,
	})

	require.Error(t, err)
	assert.ErrorIs(t, err, shared.ErrForbidden)
}
