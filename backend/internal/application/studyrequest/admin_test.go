package studyrequest

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
	domsr "github.com/fernandofv/api/internal/domain/studyrequest"
)

// ─── Mocks inline (sem framework) ─────────────────────────────────

type mockRepo struct {
	stored      map[domsr.ID]*domsr.StudyRequest
	listRes     []*domsr.StudyRequest
	listErr     error
	saveErr     error
	updErr      error
	findErr     error
	saveCount   int
	updateCount int
}

func newMockRepo() *mockRepo {
	return &mockRepo{stored: map[domsr.ID]*domsr.StudyRequest{}}
}

func (r *mockRepo) Save(_ context.Context, req *domsr.StudyRequest) error {
	r.saveCount++
	if r.saveErr != nil {
		return r.saveErr
	}
	r.stored[req.ID()] = req
	return nil
}

func (r *mockRepo) FindByID(_ context.Context, id domsr.ID) (*domsr.StudyRequest, error) {
	if r.findErr != nil {
		return nil, r.findErr
	}
	req, ok := r.stored[id]
	if !ok {
		return nil, shared.NewNotFoundError("study_request")
	}
	return req, nil
}

func (r *mockRepo) Update(_ context.Context, req *domsr.StudyRequest) error {
	r.updateCount++
	if r.updErr != nil {
		return r.updErr
	}
	r.stored[req.ID()] = req
	return nil
}

func (r *mockRepo) List(_ context.Context, _ domsr.Filter) ([]*domsr.StudyRequest, int64, error) {
	if r.listErr != nil {
		return nil, 0, r.listErr
	}
	return r.listRes, int64(len(r.listRes)), nil
}

type mockClock struct{ t time.Time }

func (c mockClock) Now() time.Time { return c.t }

type mockNotifier struct {
	statusUpdates []domsr.Status
	failOn        domsr.Status
}

func (n *mockNotifier) SendReceivedConfirmation(_ context.Context, _, _ string, _ domsr.ID, _, _ string) error {
	return nil
}
func (n *mockNotifier) SendAdminNotification(_ context.Context, _ string, _ *domsr.StudyRequest) error {
	return nil
}
func (n *mockNotifier) SendStatusUpdate(_ context.Context, _, _ string, _ domsr.ID, s domsr.Status, _ string, _ string) error {
	n.statusUpdates = append(n.statusUpdates, s)
	if s == n.failOn {
		return errors.New("simulated email failure")
	}
	return nil
}

// ─── ListUseCase ──────────────────────────────────────────────────

func Test_List_DefaultsAndCaps(t *testing.T) {
	repo := newMockRepo()
	uc := NewListUseCase(repo)
	res, err := uc.Execute(context.Background(), ListQuery{})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if res.Limit != 50 {
		t.Errorf("esperado limit default 50, got %d", res.Limit)
	}

	res, err = uc.Execute(context.Background(), ListQuery{Limit: 1000})
	if err != nil {
		t.Fatal(err)
	}
	if res.Limit != 200 {
		t.Errorf("limit deveria ser capped em 200, got %d", res.Limit)
	}
}

func Test_List_RejectsInvalidStatus(t *testing.T) {
	repo := newMockRepo()
	uc := NewListUseCase(repo)
	_, err := uc.Execute(context.Background(), ListQuery{Status: "weird"})
	if err == nil {
		t.Fatal("esperado erro de validação")
	}
	if !errors.Is(err, shared.ErrValidation) {
		t.Errorf("esperado ErrValidation, got %v", err)
	}
}

// ─── GetUseCase ────────────────────────────────────────────────────

func Test_Get_RequiresID(t *testing.T) {
	repo := newMockRepo()
	uc := NewGetUseCase(repo)
	_, err := uc.Execute(context.Background(), "")
	if !errors.Is(err, shared.ErrValidation) {
		t.Errorf("esperado ErrValidation, got %v", err)
	}
}

func Test_Get_NotFound(t *testing.T) {
	repo := newMockRepo()
	uc := NewGetUseCase(repo)
	_, err := uc.Execute(context.Background(), "unknown-id")
	if !errors.Is(err, shared.ErrNotFound) {
		t.Errorf("esperado ErrNotFound, got %v", err)
	}
}

// ─── UpdateUseCase ──────────────────────────────────────────────────

func setupRequest(t *testing.T) (*mockRepo, mockClock, *domsr.StudyRequest) {
	t.Helper()
	repo := newMockRepo()
	clock := mockClock{t: time.Date(2026, 5, 17, 12, 0, 0, 0, time.UTC)}
	req, err := domsr.New(domsr.Input{
		Name:        "Aluno X",
		Email:       "aluno@example.com",
		StudyArea:   "engenharia",
		Subject:     "Cálculo I",
		Description: "Revisão pré-prova",
	}, clock.t)
	if err != nil {
		t.Fatalf("setup: %v", err)
	}
	repo.stored[req.ID()] = req
	return repo, clock, req
}

func Test_Update_ChangesStatusAndNotifies(t *testing.T) {
	repo, clock, req := setupRequest(t)
	notifier := &mockNotifier{}
	uc := NewUpdateUseCase(repo, clock).WithNotifier(notifier)

	newStatus := "in_production"
	updated, err := uc.Execute(context.Background(), UpdateCommand{
		ID:     req.ID().String(),
		Status: &newStatus,
	})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if updated.Status() != domsr.StatusInProduction {
		t.Errorf("status não foi alterado: %v", updated.Status())
	}
	if repo.updateCount != 1 {
		t.Errorf("esperado 1 update no repo, got %d", repo.updateCount)
	}
	if len(notifier.statusUpdates) != 1 || notifier.statusUpdates[0] != domsr.StatusInProduction {
		t.Errorf("notifier não chamado corretamente: %+v", notifier.statusUpdates)
	}
}

func Test_Update_NoStatusChange_DoesNotNotify(t *testing.T) {
	repo, clock, req := setupRequest(t)
	notifier := &mockNotifier{}
	uc := NewUpdateUseCase(repo, clock).WithNotifier(notifier)

	notes := "anotação"
	_, err := uc.Execute(context.Background(), UpdateCommand{
		ID:            req.ID().String(),
		InternalNotes: &notes,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(notifier.statusUpdates) != 0 {
		t.Errorf("não deveria notificar se status não mudou")
	}
}

func Test_Update_SameStatus_NoNotification(t *testing.T) {
	repo, clock, req := setupRequest(t)
	notifier := &mockNotifier{}
	uc := NewUpdateUseCase(repo, clock).WithNotifier(notifier)

	same := "pending"
	_, err := uc.Execute(context.Background(), UpdateCommand{
		ID:     req.ID().String(),
		Status: &same,
	})
	if err != nil {
		t.Fatal(err)
	}
	if len(notifier.statusUpdates) != 0 {
		t.Errorf("não deveria notificar para idempotent status change")
	}
}

func Test_Update_NotifierFailure_DoesNotBlock(t *testing.T) {
	repo, clock, req := setupRequest(t)
	notifier := &mockNotifier{failOn: domsr.StatusReady}
	uc := NewUpdateUseCase(repo, clock).WithNotifier(notifier)

	target := "ready"
	updated, err := uc.Execute(context.Background(), UpdateCommand{
		ID:     req.ID().String(),
		Status: &target,
	})
	if err != nil {
		t.Fatalf("falha no email não deveria bloquear: %v", err)
	}
	if updated.Status() != domsr.StatusReady {
		t.Errorf("status deveria ter sido salvo mesmo com email falhando")
	}
}

// ─── CreateUseCase (associação por email) ───────────────────────────

type mockLookup struct {
	emailToID map[string]string
}

func (l *mockLookup) FindUserIDByEmail(_ context.Context, email string) (string, error) {
	return l.emailToID[email], nil
}

type mockStorage struct{}

func (s *mockStorage) Upload(_ context.Context, _ domsr.UploadInput) (string, error) {
	return "file:///fake/path", nil
}

func Test_Create_AssociatesUserByEmail(t *testing.T) {
	repo := newMockRepo()
	clock := mockClock{t: time.Now()}
	lookup := &mockLookup{emailToID: map[string]string{"aluno@example.com": "user-abc-123"}}
	notifier := &mockNotifier{}

	uc := NewCreateUseCase(repo, &mockStorage{}, clock).
		WithUserLookup(lookup).
		WithNotifier(notifier, "")

	res, err := uc.Execute(context.Background(), CreateCommand{
		Name:        "Aluno",
		Email:       "aluno@example.com",
		StudyArea:   "direito",
		Subject:     "Constitucional",
		Description: "Vou prestar OAB",
	})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}

	stored := repo.stored[domsr.ID(res.ID)]
	if stored == nil {
		t.Fatal("solicitação não foi persistida")
	}
	if stored.UserID().String() != "user-abc-123" {
		t.Errorf("esperado userID associado, got %q", stored.UserID())
	}
}

func Test_Create_NoMatchingUser_StaysAnonymous(t *testing.T) {
	repo := newMockRepo()
	clock := mockClock{t: time.Now()}
	lookup := &mockLookup{emailToID: map[string]string{}}

	uc := NewCreateUseCase(repo, &mockStorage{}, clock).
		WithUserLookup(lookup)

	res, err := uc.Execute(context.Background(), CreateCommand{
		Name:        "Lead",
		Email:       "lead@novo.com",
		StudyArea:   "saude",
		Subject:     "Anatomia",
		Description: "Curso preparatório",
	})
	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	stored := repo.stored[domsr.ID(res.ID)]
	if !stored.UserID().IsZero() {
		t.Errorf("não deveria associar a um user, got %q", stored.UserID())
	}
}
