package identity_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

func Test_DeleteAccount_Execute_Success_SoftDeletesAndRevokesTokens(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	userRepo := newMockUserRepo()
	refreshRepo := newMockRefreshRepo()
	uc := appidentity.NewDeleteAccountUseCase(userRepo, refreshRepo, shared.FixedClock{T: now})

	if err := uc.Execute(context.Background(), userID); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(userRepo.softDeleted) != 1 || userRepo.softDeleted[0] != userID {
		t.Fatalf("expected SoftDelete once with %s, got %v", userID, userRepo.softDeleted)
	}
	if len(refreshRepo.revokedAll) != 1 || refreshRepo.revokedAll[0] != userID {
		t.Fatalf("expected RevokeAllForUser once with %s, got %v", userID, refreshRepo.revokedAll)
	}
}

func Test_DeleteAccount_Execute_SoftDeleteFails_PropagatesError(t *testing.T) {
	now := time.Now()
	boom := errors.New("db down")
	userRepo := newMockUserRepo()
	userRepo.softDelErr = boom
	uc := appidentity.NewDeleteAccountUseCase(userRepo, newMockRefreshRepo(), shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), shared.NewUserID())
	if err == nil || !errors.Is(err, boom) {
		t.Fatalf("expected wrapped boom, got %v", err)
	}
}

func Test_DeleteAccount_Execute_RevokeAllFails_PropagatesError(t *testing.T) {
	now := time.Now()
	boom := errors.New("redis down")
	refreshRepo := newMockRefreshRepo()
	refreshRepo.revokeAllErr = boom
	uc := appidentity.NewDeleteAccountUseCase(newMockUserRepo(), refreshRepo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), shared.NewUserID())
	if err == nil || !errors.Is(err, boom) {
		t.Fatalf("expected wrapped boom, got %v", err)
	}
}
