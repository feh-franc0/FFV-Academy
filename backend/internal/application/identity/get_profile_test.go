// Package identity_test — testes dos use cases de GetProfile, UpdateProfile,
// DeleteAccount, Logout, LogoutAll e GoogleAuth.
//
// TASK-12: Cobertura de testes identity → 85%
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
	infraauth "github.com/fernandofv/api/internal/infrastructure/auth"
)

// ─── mockGoogleUserRepo ────────────────────────────────────────────────────────
//
// Versão estendida do mockUserRepo que permite configurar FindByGoogleID
// para simular os 3 fluxos do GoogleAuth.findOrCreate.

type mockGoogleUserRepo struct {
	mockUserRepo
	byGoogleIDMap map[string]*domidentity.User
}

func newMockGoogleUserRepo() *mockGoogleUserRepo {
	return &mockGoogleUserRepo{
		mockUserRepo: mockUserRepo{
			byID:    make(map[shared.UserID]*domidentity.User),
			byEmail: make(map[string]*domidentity.User),
		},
		byGoogleIDMap: make(map[string]*domidentity.User),
	}
}

// FindByGoogleID sobrescreve o mockUserRepo.FindByGoogleID (que sempre retorna ErrNotFound)
// para permitir simular usuários existentes com google_id.
func (m *mockGoogleUserRepo) FindByGoogleID(_ context.Context, sub string) (*domidentity.User, error) {
	u, ok := m.byGoogleIDMap[sub]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return u, nil
}

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

// ─── GoogleAuth ────────────────────────────────────────────────────────────────

// Test_GoogleAuth_Execute_NewUser_CreatesAndReturnsTokens verifica o fluxo 3:
// nenhuma conta existe (nem por google_id, nem por email) → cria novo usuário.
func Test_GoogleAuth_Execute_NewUser_CreatesAndReturnsTokens(t *testing.T) {
	now := time.Now()
	userRepo := newMockGoogleUserRepo()
	refreshRepo := newMockRefreshRepo()
	issuer := &mockTokenIssuer{}

	uc := appidentity.NewGoogleAuthUseCase(
		userRepo, refreshRepo, issuer,
		shared.FixedClock{T: now}, 30*24*time.Hour,
	)

	info := &infraauth.GoogleUserInfo{
		Sub:      "google-sub-123",
		Email:    "googleuser@gmail.com",
		Name:     "Google User",
		Picture:  "https://example.com/pic.jpg",
		Verified: true,
	}

	result, err := uc.Execute(context.Background(), info)
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if !result.IsNewUser {
		t.Fatal("esperado IsNewUser=true para novo usuário Google")
	}
	if result.AccessToken == "" || result.RefreshToken == "" {
		t.Fatal("esperado tokens emitidos, got vazio")
	}
	if len(userRepo.savedUsers) != 1 {
		t.Fatalf("esperado 1 usuário salvo, got %d", len(userRepo.savedUsers))
	}
}

// Test_GoogleAuth_Execute_ExistingGoogleID_LogsInDirectly verifica o fluxo 1:
// usuário já autenticado via Google antes → busca por google_id retorna o usuário.
func Test_GoogleAuth_Execute_ExistingGoogleID_LogsInDirectly(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("existing@gmail.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "Existing", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	userRepo := newMockGoogleUserRepo()
	userRepo.byGoogleIDMap["sub-existing"] = user
	userRepo.byID[userID] = user

	uc := appidentity.NewGoogleAuthUseCase(
		userRepo, newMockRefreshRepo(), &mockTokenIssuer{},
		shared.FixedClock{T: now}, 30*24*time.Hour,
	)

	info := &infraauth.GoogleUserInfo{
		Sub:      "sub-existing",
		Email:    "existing@gmail.com",
		Name:     "Existing",
		Picture:  "https://example.com/pic.jpg",
		Verified: true,
	}

	result, err := uc.Execute(context.Background(), info)
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if result.IsNewUser {
		t.Fatal("esperado IsNewUser=false para usuário existente")
	}
}

// Test_GoogleAuth_Execute_ExistingEmailAccount_LinksGoogle verifica o fluxo 2:
// conta criada via Magic Link → vincula google_id ao usuário existente por email.
func Test_GoogleAuth_Execute_ExistingEmailAccount_LinksGoogle(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("magic@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "Magic User", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	userRepo := newMockGoogleUserRepo()
	// Não tem conta Google (FindByGoogleID → ErrNotFound via byGoogleIDMap vazio)
	userRepo.byEmail[email.String()] = user // mas tem conta por email
	userRepo.byID[userID] = user

	uc := appidentity.NewGoogleAuthUseCase(
		userRepo, newMockRefreshRepo(), &mockTokenIssuer{},
		shared.FixedClock{T: now}, 30*24*time.Hour,
	)

	info := &infraauth.GoogleUserInfo{
		Sub:      "google-sub-new",
		Email:    "magic@example.com",
		Name:     "Magic User",
		Picture:  "pic.jpg",
		Verified: true,
	}

	result, err := uc.Execute(context.Background(), info)
	if err != nil {
		t.Fatalf("inesperado: %v", err)
	}
	if result.IsNewUser {
		t.Fatal("esperado IsNewUser=false ao vincular conta existente")
	}
}

// Test_GoogleAuth_Execute_InvalidEmail_ReturnsError verifica que um email
// inválido retornado pelo Google resulta em erro de validação do domínio.
func Test_GoogleAuth_Execute_InvalidEmail_ReturnsError(t *testing.T) {
	now := time.Now()
	userRepo := newMockGoogleUserRepo()

	uc := appidentity.NewGoogleAuthUseCase(
		userRepo, newMockRefreshRepo(), &mockTokenIssuer{},
		shared.FixedClock{T: now}, 30*24*time.Hour,
	)

	// Email inválido — o domínio NewEmail rejeita, resultando em ErrValidation.
	info := &infraauth.GoogleUserInfo{
		Sub:      "sub-bad-email",
		Email:    "not-an-email", // sem '@' → inválido
		Name:     "Bad",
		Verified: true,
	}

	_, err := uc.Execute(context.Background(), info)
	if err == nil {
		t.Fatal("esperado erro para email inválido do Google")
	}
}

// Test_GoogleAuth_Execute_TokenIssuerFails_ReturnsError verifica que uma falha
// no TokenIssuer (JWT) é propagada corretamente como erro.
func Test_GoogleAuth_Execute_TokenIssuerFails_ReturnsError(t *testing.T) {
	now := time.Now()
	userRepo := newMockGoogleUserRepo()

	issuer := &mockTokenIssuer{accessErr: errors.New("jwt service down")}

	uc := appidentity.NewGoogleAuthUseCase(
		userRepo, newMockRefreshRepo(), issuer,
		shared.FixedClock{T: now}, 30*24*time.Hour,
	)

	info := &infraauth.GoogleUserInfo{
		Sub:      "sub-jwt-fail",
		Email:    "jwtfail@example.com",
		Name:     "JWT Fail",
		Verified: true,
	}

	_, err := uc.Execute(context.Background(), info)
	if err == nil {
		t.Fatal("esperado erro quando JWT issuer falha")
	}
}
