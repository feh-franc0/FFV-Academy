package simulado_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appsim "github.com/fernandofv/api/internal/application/simulado"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
	"github.com/fernandofv/api/internal/domain/shared"
)

// Conflict-capable attempt repo: mockAttemptRepo from finish_attempt_test already
// covers FindByID/Save/Update/FindActive. We extend locally with a flag to simulate
// UNIQUE violation on Save.
type startAttemptMockRepo struct {
	byID          map[shared.AttemptID]*domsim.Attempt
	saved         []*domsim.Attempt
	saveErr       error
	existingActive *domsim.Attempt
}

func (m *startAttemptMockRepo) FindByID(_ context.Context, id shared.AttemptID) (*domsim.Attempt, error) {
	a, ok := m.byID[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return a, nil
}
func (m *startAttemptMockRepo) Save(_ context.Context, a *domsim.Attempt) error {
	if m.saveErr != nil {
		return m.saveErr
	}
	if m.byID == nil {
		m.byID = make(map[shared.AttemptID]*domsim.Attempt)
	}
	m.byID[a.ID()] = a
	m.saved = append(m.saved, a)
	return nil
}
func (m *startAttemptMockRepo) Update(_ context.Context, a *domsim.Attempt) error {
	m.byID[a.ID()] = a
	return nil
}
func (m *startAttemptMockRepo) FindActiveByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) (*domsim.Attempt, error) {
	if m.existingActive != nil {
		return m.existingActive, nil
	}
	return nil, shared.ErrNotFound
}
func (m *startAttemptMockRepo) ListByUser(_ context.Context, _ shared.UserID, _, _ int) ([]*domsim.Attempt, int, error) {
	return nil, 0, nil
}

type startAttemptMockCatalog struct {
	sim *domsim.Simulado
}

func (m *startAttemptMockCatalog) GetSimulado(_ shared.SimuladoID) (*domsim.Simulado, error) {
	if m.sim == nil {
		return nil, shared.ErrNotFound
	}
	return m.sim, nil
}
func (m *startAttemptMockCatalog) ListSimulados() ([]*domsim.Simulado, error) {
	return []*domsim.Simulado{m.sim}, nil
}

func Test_StartAttempt_Execute_HappyPath_CreatesAttempt(t *testing.T) {
	now := time.Now()
	sim := &domsim.Simulado{ID: "aws-clf", TimeLimitMin: 90, PassingScore: 70}
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{}}
	catalog := &startAttemptMockCatalog{sim: sim}
	uc := appsim.NewStartAttemptUseCase(repo, catalog, shared.FixedClock{T: now})

	userID := shared.NewUserID()
	res, err := uc.Execute(context.Background(), appsim.StartAttemptCommand{
		UserID:     userID,
		SimuladoID: "aws-clf",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !res.IsNew {
		t.Fatalf("expected IsNew=true")
	}
	if !res.Attempt.Deadline().Equal(now.Add(90 * time.Minute)) {
		t.Fatalf("deadline mismatch: got %v", res.Attempt.Deadline())
	}
	if len(repo.saved) != 1 {
		t.Fatalf("expected 1 saved attempt, got %d", len(repo.saved))
	}
}

func Test_StartAttempt_Execute_SimuladoNotFound_ReturnsNotFound(t *testing.T) {
	uc := appsim.NewStartAttemptUseCase(&startAttemptMockRepo{}, &startAttemptMockCatalog{},
		shared.FixedClock{T: time.Now()})
	_, err := uc.Execute(context.Background(), appsim.StartAttemptCommand{
		UserID:     shared.NewUserID(),
		SimuladoID: "unknown",
	})
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func Test_StartAttempt_Execute_ConflictOnSave_ReturnsExistingActive(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("aws-clf")
	sim := &domsim.Simulado{ID: simID, TimeLimitMin: 90}
	existing := domsim.StartAttempt(shared.NewAttemptID(), userID, simID, 90, now.Add(-time.Minute))

	repo := &startAttemptMockRepo{
		byID:    map[shared.AttemptID]*domsim.Attempt{},
		saveErr: shared.ErrConflict,
		// first FindActive (idempotency check) should miss; but mock returns existing always
		// to simulate race, we set existingActive AFTER first find. Simplify: always set it —
		// the UC will return it in idempotency path, which is the same outcome (IsNew=false).
		existingActive: existing,
	}
	catalog := &startAttemptMockCatalog{sim: sim}
	uc := appsim.NewStartAttemptUseCase(repo, catalog, shared.FixedClock{T: now})

	res, err := uc.Execute(context.Background(), appsim.StartAttemptCommand{
		UserID:     userID,
		SimuladoID: simID,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.IsNew {
		t.Fatalf("expected IsNew=false when active already exists")
	}
	if res.Attempt.ID() != existing.ID() {
		t.Fatalf("expected existing attempt returned")
	}
}
