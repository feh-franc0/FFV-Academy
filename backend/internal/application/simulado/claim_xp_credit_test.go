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

// claimXPMockRepo é dedicado a este teste — só ClaimXPCredit tem
// comportamento configurável; os outros métodos existem só para satisfazer
// domsim.AttemptRepository e não são exercitados por este use case.
type claimXPMockRepo struct {
	claimed    bool
	err        error
	calledWith struct {
		attemptID shared.AttemptID
		userID    shared.UserID
	}
}

func (m *claimXPMockRepo) ClaimXPCredit(_ context.Context, attemptID shared.AttemptID, userID shared.UserID, _ time.Time) (bool, error) {
	m.calledWith.attemptID = attemptID
	m.calledWith.userID = userID
	return m.claimed, m.err
}
func (m *claimXPMockRepo) ListFinishedByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) ([]*domsim.Attempt, error) {
	return nil, nil
}

func (m *claimXPMockRepo) Save(_ context.Context, _ *domsim.Attempt) error { return nil }
func (m *claimXPMockRepo) Update(_ context.Context, _ *domsim.Attempt) error {
	return nil
}
func (m *claimXPMockRepo) UpsertAnswer(_ context.Context, _ shared.AttemptID, _ shared.QuestionID, _ domsim.OptionID, _ time.Time) (bool, error) {
	return false, nil
}
func (m *claimXPMockRepo) FindByID(_ context.Context, _ shared.AttemptID) (*domsim.Attempt, error) {
	return nil, shared.ErrNotFound
}
func (m *claimXPMockRepo) FindActiveByUserAndSimulado(_ context.Context, _ shared.UserID, _ shared.SimuladoID) (*domsim.Attempt, error) {
	return nil, shared.ErrNotFound
}
func (m *claimXPMockRepo) ListByUser(_ context.Context, _ shared.UserID, _, _ int) ([]*domsim.Attempt, int, error) {
	return nil, 0, nil
}

func Test_ClaimXPCreditUseCase_FirstCall_ReturnsClaimedTrue(t *testing.T) {
	repo := &claimXPMockRepo{claimed: true}
	uc := appsim.NewClaimXPCreditUseCase(repo, shared.FixedClock{T: time.Now()})

	result, err := uc.Execute(context.Background(), appsim.ClaimXPCreditCommand{
		UserID:    shared.UserID("user-1"),
		AttemptID: shared.AttemptID("att-1"),
	})

	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if !result.Claimed {
		t.Fatal("esperava Claimed=true na primeira chamada")
	}
	if repo.calledWith.attemptID != shared.AttemptID("att-1") || repo.calledWith.userID != shared.UserID("user-1") {
		t.Fatalf("repo chamado com args errados: %+v", repo.calledWith)
	}
}

// Test_ClaimXPCreditUseCase_SecondCall_ReturnsClaimedFalse é a prova direta do
// requisito: reabrir /resultado em outra aba não pode creditar XP de novo. O
// repositório já reivindicou (claimed=false simula a segunda chamada para o
// MESMO attemptId) e o use case propaga isso sem erro — a ausência de erro é
// intencional: "já reivindicado" não é uma falha, é o caminho esperado.
func Test_ClaimXPCreditUseCase_SecondCall_ReturnsClaimedFalse(t *testing.T) {
	repo := &claimXPMockRepo{claimed: false}
	uc := appsim.NewClaimXPCreditUseCase(repo, shared.FixedClock{T: time.Now()})

	result, err := uc.Execute(context.Background(), appsim.ClaimXPCreditCommand{
		UserID:    shared.UserID("user-1"),
		AttemptID: shared.AttemptID("att-1"),
	})

	if err != nil {
		t.Fatalf("erro inesperado: %v", err)
	}
	if result.Claimed {
		t.Fatal("esperava Claimed=false na segunda chamada")
	}
}

func Test_ClaimXPCreditUseCase_RepoError_Propagates(t *testing.T) {
	repo := &claimXPMockRepo{err: errors.New("db indisponível")}
	uc := appsim.NewClaimXPCreditUseCase(repo, shared.FixedClock{T: time.Now()})

	_, err := uc.Execute(context.Background(), appsim.ClaimXPCreditCommand{
		UserID:    shared.UserID("user-1"),
		AttemptID: shared.AttemptID("att-1"),
	})

	if err == nil {
		t.Fatal("esperava erro propagado do repositório")
	}
}
