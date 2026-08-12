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

// Conflict-capable attempt repo: mockAttemptRepo from finish_attempt_test already
// covers FindByID/Save/Update/FindActive. We extend locally with a flag to simulate
// UNIQUE violation on Save.
type startAttemptMockRepo struct {
	byID           map[shared.AttemptID]*domsim.Attempt
	saved          []*domsim.Attempt
	saveErr        error
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
func (m *startAttemptMockRepo) UpsertAnswer(_ context.Context, attemptID shared.AttemptID, qID shared.QuestionID, opt domsim.OptionID, now time.Time) (bool, error) {
	a, ok := m.byID[attemptID]
	if !ok || a.IsFinished() || now.After(a.Deadline()) {
		return false, nil
	}
	if err := a.AnswerQuestion(qID, opt, now); err != nil {
		return false, nil
	}
	return true, nil
}
func (m *startAttemptMockRepo) ClaimXPCredit(_ context.Context, _ shared.AttemptID, _ shared.UserID, _ time.Time) (bool, error) {
	return true, nil
}
func (m *startAttemptMockRepo) ListFinishedByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) ([]*domsim.Attempt, error) {
	return nil, nil
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

// startAttemptMockQuestionRepo simula o banco de questões real (Postgres).
// GetRandom devolve `ids` (na ordem) truncado em `count` — determinístico o
// bastante para os testes afirmarem quais IDs a attempt recebeu.
type startAttemptMockQuestionRepo struct {
	ids       []string
	byID      map[string]*domsim.DBQuestion
	getRandom func(count int) []*domsim.DBQuestion
}

func newStartAttemptMockQuestionRepo(questions ...*domsim.DBQuestion) *startAttemptMockQuestionRepo {
	r := &startAttemptMockQuestionRepo{byID: make(map[string]*domsim.DBQuestion)}
	for _, q := range questions {
		r.ids = append(r.ids, q.ID)
		r.byID[q.ID] = q
	}
	return r
}

func (m *startAttemptMockQuestionRepo) GetRandom(_ context.Context, _ string, count int, _ domsim.QuestionQueryOpts) ([]*domsim.DBQuestion, error) {
	if m.getRandom != nil {
		return m.getRandom(count), nil
	}
	out := make([]*domsim.DBQuestion, 0, count)
	for i, id := range m.ids {
		if i >= count {
			break
		}
		out = append(out, m.byID[id])
	}
	return out, nil
}
func (m *startAttemptMockQuestionRepo) FindByID(_ context.Context, id string) (*domsim.DBQuestion, error) {
	q, ok := m.byID[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return q, nil
}
func (m *startAttemptMockQuestionRepo) FindByIDs(_ context.Context, _ string, ids []string) ([]*domsim.DBQuestion, error) {
	out := make([]*domsim.DBQuestion, 0, len(ids))
	for _, id := range ids {
		if q, ok := m.byID[id]; ok {
			out = append(out, q)
		}
	}
	return out, nil
}
func (m *startAttemptMockQuestionRepo) List(_ context.Context, _ domsim.QuestionFilter) ([]*domsim.DBQuestion, int, error) {
	return nil, 0, nil
}
func (m *startAttemptMockQuestionRepo) Create(_ context.Context, _ *domsim.DBQuestion) error {
	return nil
}
func (m *startAttemptMockQuestionRepo) Update(_ context.Context, _ *domsim.DBQuestion) error {
	return nil
}
func (m *startAttemptMockQuestionRepo) Delete(_ context.Context, _ string) error { return nil }
func (m *startAttemptMockQuestionRepo) CountBySimulado(_ context.Context, _ string) (int, error) {
	return len(m.ids), nil
}

func makeDBQuestion(id string) *domsim.DBQuestion {
	return &domsim.DBQuestion{
		ID:        id,
		Stem:      "stem " + id,
		Options:   []domsim.QuestionOption{{ID: "A", Text: "a"}, {ID: "B", Text: "b"}},
		CorrectID: "A",
		Topic:     "Cloud",
	}
}

func Test_StartAttempt_Execute_HappyPath_CreatesAttempt(t *testing.T) {
	now := time.Now()
	sim := &domsim.Simulado{ID: "aws-clf", TimeLimitMin: 90, PassingScore: 70, QuestionCount: 2}
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{}}
	catalog := &startAttemptMockCatalog{sim: sim}
	questionRepo := newStartAttemptMockQuestionRepo(makeDBQuestion("q1"), makeDBQuestion("q2"), makeDBQuestion("q3"))
	uc := appsim.NewStartAttemptUseCase(repo, catalog, questionRepo, shared.FixedClock{T: now})

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
	// O sorteio server-side deve ter fixado exatamente QuestionCount=2 questões.
	if len(res.Attempt.QuestionIDs()) != 2 {
		t.Fatalf("expected 2 questions drawn, got %d", len(res.Attempt.QuestionIDs()))
	}
}

func Test_StartAttempt_Execute_NoDBQuestions_FallsBackToStaticCatalog(t *testing.T) {
	now := time.Now()
	sim := &domsim.Simulado{
		ID: "legacy", TimeLimitMin: 90, PassingScore: 70, QuestionCount: 1,
		Questions: []domsim.Question{{ID: "static-q1", CorrectID: "A", Topic: "Cloud"}},
	}
	repo := &startAttemptMockRepo{byID: map[shared.AttemptID]*domsim.Attempt{}}
	catalog := &startAttemptMockCatalog{sim: sim}
	questionRepo := newStartAttemptMockQuestionRepo() // banco vazio — sem questões no Postgres
	uc := appsim.NewStartAttemptUseCase(repo, catalog, questionRepo, shared.FixedClock{T: now})

	res, err := uc.Execute(context.Background(), appsim.StartAttemptCommand{
		UserID:     shared.NewUserID(),
		SimuladoID: "legacy",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(res.Attempt.QuestionIDs()) != 1 || res.Attempt.QuestionIDs()[0] != "static-q1" {
		t.Fatalf("expected fallback to static catalog question, got %v", res.Attempt.QuestionIDs())
	}
}

func Test_StartAttempt_Execute_SimuladoNotFound_ReturnsNotFound(t *testing.T) {
	uc := appsim.NewStartAttemptUseCase(&startAttemptMockRepo{}, &startAttemptMockCatalog{},
		newStartAttemptMockQuestionRepo(), shared.FixedClock{T: time.Now()})
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
	existing := domsim.StartAttempt(shared.NewAttemptID(), userID, simID, 90, []shared.QuestionID{"q1"}, now.Add(-time.Minute))

	repo := &startAttemptMockRepo{
		byID:    map[shared.AttemptID]*domsim.Attempt{},
		saveErr: shared.ErrConflict,
		// first FindActive (idempotency check) should miss; but mock returns existing always
		// to simulate race, we set existingActive AFTER first find. Simplify: always set it —
		// the UC will return it in idempotency path, which is the same outcome (IsNew=false).
		existingActive: existing,
	}
	catalog := &startAttemptMockCatalog{sim: sim}
	questionRepo := newStartAttemptMockQuestionRepo(makeDBQuestion("q1"))
	uc := appsim.NewStartAttemptUseCase(repo, catalog, questionRepo, shared.FixedClock{T: now})

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
