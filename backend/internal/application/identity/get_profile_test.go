// Package identity_test — testes dos use cases de GetProfile, UpdateProfile,
// DeleteAccount, Logout e LogoutAll.
//
// PADRÃO:
//   - Inline mocks (structs que implementam interfaces) — sem gomock.
//   - Naming: Test_<Type>_<Method>_<Scenario>_<Expected>.
//   - Reutiliza mockUserRepo e mockRefreshRepo de verify_magic_link_test.go
//     (estão no mesmo package identity_test).
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

// ─── GetProfile ───────────────────────────────────────────────────────────────

// Test_GetProfile_Execute_ExistingUser_ReturnsUser verifica o caminho feliz:
// usuário existe → retorna o User sem erro.
func Test_GetProfile_Execute_ExistingUser_ReturnsUser(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("user@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "User", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	repo := newMockUserRepo()
	repo.byID[userID] = user

	uc := appidentity.NewGetProfileUseCase(repo)
	got, err := uc.Execute(context.Background(), userID)

	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if got.ID() != userID {
		t.Fatalf("esperado user ID %s, got %s", userID, got.ID())
	}
}

// Test_GetProfile_Execute_UserNotFound_ReturnsNotFound verifica que ErrNotFound
// é propagado quando o usuário não existe no repositório.
func Test_GetProfile_Execute_UserNotFound_ReturnsNotFound(t *testing.T) {
	uc := appidentity.NewGetProfileUseCase(newMockUserRepo()) // repo vazio
	_, err := uc.Execute(context.Background(), shared.NewUserID())
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("esperado ErrNotFound, got %v", err)
	}
}

// ─── UpdateProfile ────────────────────────────────────────────────────────────

// Test_UpdateProfile_Execute_ValidUpdate_ReturnsUpdatedUser verifica que nome
// é atualizado e o usuário é salvo no repositório.
func Test_UpdateProfile_Execute_ValidUpdate_ReturnsUpdatedUser(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("user@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "Old Name", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	repo := newMockUserRepo()
	repo.byID[userID] = user

	uc := appidentity.NewUpdateProfileUseCase(repo)
	got, err := uc.Execute(context.Background(), appidentity.UpdateProfileCommand{
		UserID: userID,
		Name:   "New Name",
	})

	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if got.Name() != "New Name" {
		t.Fatalf("esperado nome 'New Name', got %q", got.Name())
	}
}

// Test_UpdateProfile_Execute_UserNotFound_ReturnsNotFound garante que
// ErrNotFound é retornado quando o usuário não existe.
func Test_UpdateProfile_Execute_UserNotFound_ReturnsNotFound(t *testing.T) {
	uc := appidentity.NewUpdateProfileUseCase(newMockUserRepo())
	_, err := uc.Execute(context.Background(), appidentity.UpdateProfileCommand{
		UserID: shared.NewUserID(),
		Name:   "Qualquer Nome",
	})
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("esperado ErrNotFound, got %v", err)
	}
}

// Test_UpdateProfile_Execute_InvalidPhone_ReturnsValidation garante que
// um telefone malformado falha na validação e retorna ErrValidation.
func Test_UpdateProfile_Execute_InvalidPhone_ReturnsValidation(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("user@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "Nome", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	repo := newMockUserRepo()
	repo.byID[userID] = user

	uc := appidentity.NewUpdateProfileUseCase(repo)
	_, err = uc.Execute(context.Background(), appidentity.UpdateProfileCommand{
		UserID: userID,
		Phone:  "nao-e-telefone", // formato inválido — falha no VO identity.NewPhone
	})

	// O domínio NewPhone retorna ErrValidation via DomainError.
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation para telefone inválido, got %v", err)
	}
}

// Test_UpdateProfile_Execute_NameTooLong_ReturnsDomainError garante que
// um nome com mais de 120 caracteres é rejeitado pelo domínio (user.UpdateProfile).
//
// NOTA: O domínio permite nomes de 1-120 chars. O handler HTTP (`validateName`)
// rejeita nomes < 2 chars, mas isso é responsabilidade da camada HTTP, não do use case.
// Testamos aqui o limite superior do domínio (> 120 chars).
func Test_UpdateProfile_Execute_NameTooLong_ReturnsDomainError(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("user@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "Nome Original", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	repo := newMockUserRepo()
	repo.byID[userID] = user

	uc := appidentity.NewUpdateProfileUseCase(repo)
	// Nome com 121 caracteres — excede o limite de 120 definido no domínio.
	longName := "A" + string(make([]byte, 120)) // 121 chars
	_, err = uc.Execute(context.Background(), appidentity.UpdateProfileCommand{
		UserID: userID,
		Name:   longName,
	})

	// user.UpdateProfile retorna ErrValidation para nomes > 120 chars.
	if err == nil {
		t.Fatal("esperado erro para nome com 121 chars, got nil")
	}
}

// Test_UpdateProfile_Execute_MarketingConsentToggle_UpdatesConsent garante que
// o ponteiro *bool é aplicado corretamente (nil = não alterar).
func Test_UpdateProfile_Execute_MarketingConsentToggle_UpdatesConsent(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("user@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "Nome", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	repo := newMockUserRepo()
	repo.byID[userID] = user

	uc := appidentity.NewUpdateProfileUseCase(repo)
	consent := true
	got, err := uc.Execute(context.Background(), appidentity.UpdateProfileCommand{
		UserID:           userID,
		MarketingConsent: &consent,
	})

	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if !got.MarketingConsent() {
		t.Fatal("esperado MarketingConsent=true após toggle")
	}
}

// ─── DeleteAccount ─────────────────────────────────────────────────────────────

// Test_DeleteAccount_Execute_UserAlreadyDeleted_ReturnsNotFound verifica que
// tentar deletar um usuário já deletado retorna ErrNotFound.
func Test_DeleteAccount_Execute_UserAlreadyDeleted_ReturnsNotFound(t *testing.T) {
	now := time.Now()
	userRepo := newMockUserRepo()
	userRepo.softDelErr = shared.ErrNotFound // simula usuário já deletado no banco

	uc := appidentity.NewDeleteAccountUseCase(userRepo, newMockRefreshRepo(), shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), shared.NewUserID())

	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("esperado ErrNotFound para usuário já deletado, got %v", err)
	}
}

// ─── Logout ────────────────────────────────────────────────────────────────────

// Test_Logout_Execute_ValidToken_RevokesToken verifica o caminho feliz:
// token existe → é revogado com sucesso.
func Test_Logout_Execute_ValidToken_RevokesToken(t *testing.T) {
	refreshRepo := newMockRefreshRepo()
	userID := shared.NewUserID()
	tokenHash := "token-hash-abc"

	uc := appidentity.NewLogoutUseCase(refreshRepo)
	err := uc.Execute(context.Background(), userID, tokenHash)

	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if len(refreshRepo.revoked) != 1 || refreshRepo.revoked[0] != tokenHash {
		t.Fatalf("esperado token revogado %q, got %v", tokenHash, refreshRepo.revoked)
	}
}

// Test_Logout_Execute_InvalidToken_PropagatesError verifica que um token que não existe
// retorna erro — o handler auth_handler.go o ignora (best-effort).
// O use case em si deve propagar o erro sem pânicar.
func Test_Logout_Execute_InvalidToken_PropagatesError(t *testing.T) {
	refreshRepo := newMockRefreshRepo()
	refreshRepo.revokeErr = shared.ErrNotFound // simula token inválido/inexistente

	uc := appidentity.NewLogoutUseCase(refreshRepo)
	err := uc.Execute(context.Background(), shared.NewUserID(), "hash-invalido")

	// O use case propaga o erro; o handler (auth_handler.go linha ~236) o descarta.
	if err == nil {
		t.Fatal("esperado erro quando token não existe no repo, got nil")
	}
}

// ─── LogoutAll ─────────────────────────────────────────────────────────────────

// Test_LogoutAll_Execute_Success_RevokesAllTokens verifica o caminho feliz.
func Test_LogoutAll_Execute_Success_RevokesAllTokens(t *testing.T) {
	refreshRepo := newMockRefreshRepo()
	userID := shared.NewUserID()

	uc := appidentity.NewLogoutAllUseCase(refreshRepo)
	err := uc.Execute(context.Background(), userID)

	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if len(refreshRepo.revokedAll) != 1 || refreshRepo.revokedAll[0] != userID {
		t.Fatalf("esperado RevokeAllForUser com %s, got %v", userID, refreshRepo.revokedAll)
	}
}

// Test_LogoutAll_Execute_UserNotFound_PropagatesError verifica que se o
// repositório retornar erro, ele é propagado (o handler o ignora — best-effort).
func Test_LogoutAll_Execute_UserNotFound_PropagatesError(t *testing.T) {
	refreshRepo := newMockRefreshRepo()
	refreshRepo.revokeAllErr = shared.ErrNotFound

	uc := appidentity.NewLogoutAllUseCase(refreshRepo)
	err := uc.Execute(context.Background(), shared.NewUserID())

	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("esperado ErrNotFound wrappado, got %v", err)
	}
}

