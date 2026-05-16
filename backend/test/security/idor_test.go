//go:build security

// Testes de IDOR (Insecure Direct Object Reference): garantem que um usuário A
// não consegue executar operações em recursos do usuário B, mesmo com um JWT
// válido. A autorização é feita dentro do use case (defense-in-depth).
package security

import (
	"context"
	"errors"
	"testing"
	"time"

	appcert "github.com/fernandofv/api/internal/application/certificate"
	appsim "github.com/fernandofv/api/internal/application/simulado"
	domcert "github.com/fernandofv/api/internal/domain/certificate"
	"github.com/fernandofv/api/internal/domain/shared"
	domsim "github.com/fernandofv/api/internal/domain/simulado"
)

// ───── Stubs in-memory ────────────────────────────────────────────────────

type stubAttemptRepo struct {
	attempts map[shared.AttemptID]*domsim.Attempt
}

func (r *stubAttemptRepo) Save(_ context.Context, a *domsim.Attempt) error {
	r.attempts[a.ID()] = a
	return nil
}
func (r *stubAttemptRepo) Update(_ context.Context, a *domsim.Attempt) error {
	r.attempts[a.ID()] = a
	return nil
}
func (r *stubAttemptRepo) FindByID(_ context.Context, id shared.AttemptID) (*domsim.Attempt, error) {
	a, ok := r.attempts[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return a, nil
}
func (r *stubAttemptRepo) FindActiveByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) (*domsim.Attempt, error) {
	return nil, shared.ErrNotFound
}
func (r *stubAttemptRepo) ListByUser(_ context.Context, _ shared.UserID, _, _ int) ([]*domsim.Attempt, int, error) {
	return nil, 0, nil
}

type stubCatalog struct{ sim *domsim.Simulado }

func (c *stubCatalog) GetSimulado(_ shared.SimuladoID) (*domsim.Simulado, error) {
	return c.sim, nil
}
func (c *stubCatalog) ListSimulados() ([]*domsim.Simulado, error) {
	return []*domsim.Simulado{c.sim}, nil
}

type stubCertRepo struct {
	certs map[shared.CertificateHash]*domcert.Certificate
}

func (r *stubCertRepo) Save(_ context.Context, c *domcert.Certificate) error {
	r.certs[c.Hash()] = c
	return nil
}
func (r *stubCertRepo) FindByHash(_ context.Context, h shared.CertificateHash) (*domcert.Certificate, error) {
	c, ok := r.certs[h]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return c, nil
}
func (r *stubCertRepo) ListByUser(_ context.Context, _ shared.UserID) ([]*domcert.Certificate, error) {
	return nil, nil
}
func (r *stubCertRepo) ExistsByAttempt(_ context.Context, _ shared.AttemptID) (bool, error) {
	return false, nil
}

// ───── Testes ──────────────────────────────────────────────────────────────

func makeFinishedAttempt(userID shared.UserID) *domsim.Attempt {
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-idor", userID, "sim-x", 60, now)
	score := domsim.NewScore(domsim.ScoreResult{
		Value: 90, Passed: true, CorrectCount: 18, TotalQuestions: 20,
		ByTopic: map[domsim.Topic]domsim.TopicCounts{},
	})
	_ = a.Finish(score, now.Add(1*time.Minute))
	return a
}

func Test_IDOR_FinishAttempt_UserB_CannotFinish_UserA(t *testing.T) {
	// A cria e não finaliza; B tenta finalizar.
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-A", "user-A", "sim-x", 60, now)

	repo := &stubAttemptRepo{attempts: map[shared.AttemptID]*domsim.Attempt{"att-A": a}}
	cat := &stubCatalog{sim: &domsim.Simulado{
		ID: "sim-x", PassingScore: 70, Questions: []domsim.Question{},
	}}

	uc := appsim.NewFinishAttemptUseCase(repo, cat, shared.FixedClock{T: now})
	_, err := uc.Execute(context.Background(), appsim.FinishAttemptCommand{
		UserID:    "user-B", // atacante
		AttemptID: "att-A",
	})
	if !errors.Is(err, shared.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

func Test_IDOR_IssueCertificate_UserB_CannotIssue_ForUserA(t *testing.T) {
	a := makeFinishedAttempt("user-A")
	repo := &stubAttemptRepo{attempts: map[shared.AttemptID]*domsim.Attempt{a.ID(): a}}
	certRepo := &stubCertRepo{certs: map[shared.CertificateHash]*domcert.Certificate{}}

	uc := appcert.NewIssueCertificateUseCase(certRepo, repo, shared.FixedClock{T: time.Now()})
	_, err := uc.Execute(context.Background(), appcert.IssueCertificateCommand{
		UserID:    "user-B", // atacante
		AttemptID: a.ID(),
		Name:      "Eve",
	})
	if !errors.Is(err, shared.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}

func Test_IDOR_AnswerQuestion_UserB_CannotAnswer_UserA(t *testing.T) {
	now := time.Now().UTC()
	a := domsim.StartAttempt("att-A", "user-A", "sim-x", 60, now)
	repo := &stubAttemptRepo{attempts: map[shared.AttemptID]*domsim.Attempt{"att-A": a}}
	cat := &stubCatalog{sim: &domsim.Simulado{ID: "sim-x", PassingScore: 70}}

	uc := appsim.NewAnswerQuestionUseCase(repo, cat, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appsim.AnswerQuestionCommand{
		UserID:     "user-B", // atacante
		AttemptID:  "att-A",
		QuestionID: "q1",
		OptionID:   domsim.OptionA,
	})
	if !errors.Is(err, shared.ErrForbidden) {
		t.Fatalf("expected ErrForbidden, got %v", err)
	}
}
