package certificate_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appcert "github.com/fernandofv/api/internal/application/certificate"
	domcert "github.com/fernandofv/api/internal/domain/certificate"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// --- Mocks ---

type mockCertRepo struct {
	byHash        map[shared.CertificateHash]*domcert.Certificate
	existsAttempt map[shared.AttemptID]bool
	saveErr       error
	saved         []*domcert.Certificate
}

func newMockCertRepo() *mockCertRepo {
	return &mockCertRepo{
		byHash:        make(map[shared.CertificateHash]*domcert.Certificate),
		existsAttempt: make(map[shared.AttemptID]bool),
	}
}
func (m *mockCertRepo) Save(_ context.Context, c *domcert.Certificate) error {
	if m.saveErr != nil {
		return m.saveErr
	}
	m.byHash[c.Hash()] = c
	m.saved = append(m.saved, c)
	m.existsAttempt[c.AttemptID()] = true
	return nil
}
func (m *mockCertRepo) FindByHash(_ context.Context, h shared.CertificateHash) (*domcert.Certificate, error) {
	c, ok := m.byHash[h]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return c, nil
}
func (m *mockCertRepo) ListByUser(_ context.Context, _ shared.UserID) ([]*domcert.Certificate, error) {
	return nil, nil
}
func (m *mockCertRepo) ExistsByAttempt(_ context.Context, id shared.AttemptID) (bool, error) {
	return m.existsAttempt[id], nil
}

type mockAttemptRepoCert struct {
	byID map[shared.AttemptID]*domsim.Attempt
}

func (m *mockAttemptRepoCert) Save(_ context.Context, _ *domsim.Attempt) error   { return nil }
func (m *mockAttemptRepoCert) Update(_ context.Context, _ *domsim.Attempt) error { return nil }
func (m *mockAttemptRepoCert) FindByID(_ context.Context, id shared.AttemptID) (*domsim.Attempt, error) {
	a, ok := m.byID[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return a, nil
}
func (m *mockAttemptRepoCert) FindActiveByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) (*domsim.Attempt, error) {
	return nil, shared.ErrNotFound
}
func (m *mockAttemptRepoCert) ListByUser(_ context.Context, _ shared.UserID, _, _ int) ([]*domsim.Attempt, int, error) {
	return nil, 0, nil
}

// --- Helpers ---

func finishedAttempt(t *testing.T, userID shared.UserID, simID shared.SimuladoID, value int, passed bool, now time.Time) *domsim.Attempt {
	t.Helper()
	a := domsim.StartAttempt(shared.NewAttemptID(), userID, simID, 90, now)
	if err := a.Finish(domsim.NewScore(domsim.ScoreResult{Value: value, Passed: passed, TotalQuestions: 10, CorrectCount: value / 10}), now); err != nil {
		t.Fatalf("finish attempt: %v", err)
	}
	return a
}

// --- Tests ---

func Test_IssueCertificate_Execute_PassingScore_Emits(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("aws-clf")
	attempt := finishedAttempt(t, userID, simID, 80, true, now)

	certRepo := newMockCertRepo()
	attemptRepo := &mockAttemptRepoCert{byID: map[shared.AttemptID]*domsim.Attempt{attempt.ID(): attempt}}

	uc := appcert.NewIssueCertificateUseCase(certRepo, attemptRepo, shared.FixedClock{T: now})
	cert, err := uc.Execute(context.Background(), appcert.IssueCertificateCommand{
		UserID:    userID,
		AttemptID: attempt.ID(),
		Name:      "Fernando",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cert == nil || cert.Score() != 80 {
		t.Fatalf("expected score 80 cert, got %+v", cert)
	}
	if len(certRepo.saved) != 1 {
		t.Fatalf("expected 1 cert saved, got %d", len(certRepo.saved))
	}
}

func Test_IssueCertificate_Execute_WrongOwner_ReturnsForbidden(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	other := shared.NewUserID()
	attempt := finishedAttempt(t, userID, "s1", 80, true, now)
	uc := appcert.NewIssueCertificateUseCase(newMockCertRepo(),
		&mockAttemptRepoCert{byID: map[shared.AttemptID]*domsim.Attempt{attempt.ID(): attempt}},
		shared.FixedClock{T: now})
	_, err := uc.Execute(context.Background(), appcert.IssueCertificateCommand{
		UserID: other, AttemptID: attempt.ID(), Name: "x",
	})
	if !errors.Is(err, shared.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

func Test_IssueCertificate_Execute_AttemptNotFinished_ReturnsValidation(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	attempt := domsim.StartAttempt(shared.NewAttemptID(), userID, "s1", 90, now) // not finished
	uc := appcert.NewIssueCertificateUseCase(newMockCertRepo(),
		&mockAttemptRepoCert{byID: map[shared.AttemptID]*domsim.Attempt{attempt.ID(): attempt}},
		shared.FixedClock{T: now})
	_, err := uc.Execute(context.Background(), appcert.IssueCertificateCommand{
		UserID: userID, AttemptID: attempt.ID(), Name: "x",
	})
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("expected ErrValidation, got %v", err)
	}
}

func Test_IssueCertificate_Execute_ScoreInsufficient_ReturnsValidation(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	attempt := finishedAttempt(t, userID, "s1", 40, false, now)
	uc := appcert.NewIssueCertificateUseCase(newMockCertRepo(),
		&mockAttemptRepoCert{byID: map[shared.AttemptID]*domsim.Attempt{attempt.ID(): attempt}},
		shared.FixedClock{T: now})
	_, err := uc.Execute(context.Background(), appcert.IssueCertificateCommand{
		UserID: userID, AttemptID: attempt.ID(), Name: "x",
	})
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("expected ErrValidation, got %v", err)
	}
}

func Test_IssueCertificate_Execute_Idempotent_ReturnsExisting(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attempt := finishedAttempt(t, userID, simID, 80, true, now)

	certRepo := newMockCertRepo()
	// Insert certificate with hash that UC will recompute; Issue() is deterministic given same inputs.
	existing, err := domcert.Issue(userID, simID, attempt.ID(), "x", 80, now)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	certRepo.byHash[existing.Hash()] = existing
	certRepo.existsAttempt[attempt.ID()] = true

	uc := appcert.NewIssueCertificateUseCase(certRepo,
		&mockAttemptRepoCert{byID: map[shared.AttemptID]*domsim.Attempt{attempt.ID(): attempt}},
		shared.FixedClock{T: now})
	cert, err := uc.Execute(context.Background(), appcert.IssueCertificateCommand{
		UserID: userID, AttemptID: attempt.ID(), Name: "x",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cert.Hash() != existing.Hash() {
		t.Fatalf("expected existing cert returned")
	}
	if len(certRepo.saved) != 0 {
		t.Fatalf("expected no new Save on idempotent path, got %d", len(certRepo.saved))
	}
}

func Test_IssueCertificate_Execute_SaveConflict_ReturnsExistingViaHash(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	simID := shared.SimuladoID("s1")
	attempt := finishedAttempt(t, userID, simID, 80, true, now)

	existing, err := domcert.Issue(userID, simID, attempt.ID(), "x", 80, now)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	certRepo := newMockCertRepo()
	certRepo.saveErr = shared.ErrConflict
	certRepo.byHash[existing.Hash()] = existing

	uc := appcert.NewIssueCertificateUseCase(certRepo,
		&mockAttemptRepoCert{byID: map[shared.AttemptID]*domsim.Attempt{attempt.ID(): attempt}},
		shared.FixedClock{T: now})
	cert, err := uc.Execute(context.Background(), appcert.IssueCertificateCommand{
		UserID: userID, AttemptID: attempt.ID(), Name: "x",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if cert.Hash() != existing.Hash() {
		t.Fatalf("expected existing cert after conflict")
	}
}
