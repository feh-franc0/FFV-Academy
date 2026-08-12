package identity_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

func Test_RefreshToken_Execute_ValidToken_RotatesAndIssues(t *testing.T) {
	now := time.Now()
	email := domidentity.MustNewEmail("user@example.com")
	userID := shared.NewUserID()
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "Fernando", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}
	userRepo := newMockUserRepo()
	userRepo.byID[userID] = user

	refreshRepo := newMockRefreshRepo()
	oldHash := "old-hash"
	refreshRepo.byHash[oldHash] = domidentity.RefreshToken{
		ID:        "rt1",
		UserID:    userID,
		TokenHash: oldHash,
		ExpiresAt: now.Add(24 * time.Hour),
		CreatedAt: now.Add(-time.Hour),
	}

	issuer := &mockTokenIssuer{rawRefresh: "new-raw", refreshHash: "new-hash"}
	uc := appidentity.NewRefreshTokenUseCase(refreshRepo, userRepo, issuer,
		shared.FixedClock{T: now}, 24*time.Hour)

	res, err := uc.Execute(context.Background(), oldHash)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.RefreshToken != "new-raw" {
		t.Fatalf("expected new raw refresh token, got %q", res.RefreshToken)
	}
	if len(refreshRepo.revoked) != 1 || refreshRepo.revoked[0] != oldHash {
		t.Fatalf("expected old token revoked, got %v", refreshRepo.revoked)
	}
	if len(refreshRepo.saved) != 1 || refreshRepo.saved[0].TokenHash != "new-hash" {
		t.Fatalf("expected new refresh token saved, got %v", refreshRepo.saved)
	}
}

func Test_RefreshToken_Execute_TokenNotFound_ReturnsUnauthorized(t *testing.T) {
	now := time.Now()
	uc := appidentity.NewRefreshTokenUseCase(newMockRefreshRepo(), newMockUserRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour)
	_, err := uc.Execute(context.Background(), "missing-hash")
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func Test_RefreshToken_Execute_Expired_ReturnsUnauthorized(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	refreshRepo := newMockRefreshRepo()
	refreshRepo.byHash["h"] = domidentity.RefreshToken{
		UserID:    userID,
		TokenHash: "h",
		ExpiresAt: now.Add(-time.Minute), // expirado
		CreatedAt: now.Add(-time.Hour),
	}
	uc := appidentity.NewRefreshTokenUseCase(refreshRepo, newMockUserRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour)
	_, err := uc.Execute(context.Background(), "h")
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func Test_RefreshToken_Execute_Revoked_ReturnsUnauthorized(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	revokedAt := now.Add(-time.Minute)
	refreshRepo := newMockRefreshRepo()
	refreshRepo.byHash["h"] = domidentity.RefreshToken{
		UserID:    userID,
		TokenHash: "h",
		ExpiresAt: now.Add(time.Hour),
		CreatedAt: now.Add(-time.Hour),
		RevokedAt: &revokedAt,
	}
	uc := appidentity.NewRefreshTokenUseCase(refreshRepo, newMockUserRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour)
	_, err := uc.Execute(context.Background(), "h")
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

// Reapresentar um refresh JÁ REVOGADO é o sinal clássico de token roubado — a
// rotação normal nunca reusa um hash antigo. A resposta correta não é só
// recusar ESTE token: é derrubar toda a família de sessões do usuário, para
// que a cópia que o atacante tem (e a que o dono legítimo tem) precisem de
// login novo.
func Test_RefreshToken_Execute_ReuseOfRevokedToken_RevokesEntireFamily(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	revokedAt := now.Add(-time.Minute)
	refreshRepo := newMockRefreshRepo()
	refreshRepo.byHash["stolen-and-already-rotated"] = domidentity.RefreshToken{
		UserID:    userID,
		TokenHash: "stolen-and-already-rotated",
		ExpiresAt: now.Add(time.Hour),
		CreatedAt: now.Add(-time.Hour),
		RevokedAt: &revokedAt,
	}
	uc := appidentity.NewRefreshTokenUseCase(refreshRepo, newMockUserRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour)

	_, err := uc.Execute(context.Background(), "stolen-and-already-rotated")
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
	if len(refreshRepo.revokedAll) != 1 || refreshRepo.revokedAll[0] != userID {
		t.Fatalf("expected RevokeAllForUser(%v) to have been called once, got %v", userID, refreshRepo.revokedAll)
	}
	// Reuso não é a rotação normal: NÃO deve emitir novo par de tokens nem
	// tentar Save/Revoke individual — só derrubar a família.
	if len(refreshRepo.saved) != 0 {
		t.Fatalf("expected no new token issued on reuse detection, got %v", refreshRepo.saved)
	}
}
