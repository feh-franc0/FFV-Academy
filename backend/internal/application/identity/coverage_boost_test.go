// Package identity_test — testes adicionais para aumentar cobertura de branches
// que não foram cobertos pelos testes primários.
//
// Foco:
//   - WithLogger (triviais mas contam para cobertura).
//   - Caminhos de erro em RequestMagicLink: email falha, IncrAttempts falha, Store falha.
//   - Caminhos de erro em VerifyMagicLink: FindByEmail retorna erro genérico,
//     Save do refresh token falha, IssueRefreshToken falha.
//   - RefreshToken: falha ao salvar novo token, falha ao revogar token antigo.
package identity_test

import (
	"context"
	"errors"
	"log/slog"
	"testing"
	"time"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// ─── WithLogger ───────────────────────────────────────────────────────────────
// Testar WithLogger cobre as funções triviais de setter e garante que o logger
// pode ser substituído (padrão funcional options em Go).

func Test_RequestMagicLinkUseCase_WithLogger_ReturnsUC(t *testing.T) {
	uc := appidentity.NewRequestMagicLinkUseCase(
		&mockTokenStore{}, newMockUserRepo(), &mockEmailer{},
		shared.FixedClock{T: time.Now()}, 10*time.Minute, 5, false,
	)
	// WithLogger deve retornar o mesmo use case (para chaining).
	got := uc.WithLogger(slog.Default())
	if got == nil {
		t.Fatal("esperado ponteiro não-nil")
	}
}

func Test_VerifyMagicLinkUseCase_WithLogger_ReturnsUC(t *testing.T) {
	uc := appidentity.NewVerifyMagicLinkUseCase(
		&mockTokenStore{}, newMockUserRepo(), newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: time.Now()}, time.Hour, false,
	)
	got := uc.WithLogger(slog.Default())
	if got == nil {
		t.Fatal("esperado ponteiro não-nil")
	}
}

func Test_GetProfileUseCase_WithLogger_ReturnsUC(t *testing.T) {
	uc := appidentity.NewGetProfileUseCase(newMockUserRepo())
	got := uc.WithLogger(slog.Default())
	if got == nil {
		t.Fatal("esperado ponteiro não-nil")
	}
}

func Test_UpdateProfileUseCase_WithLogger_ReturnsUC(t *testing.T) {
	uc := appidentity.NewUpdateProfileUseCase(newMockUserRepo())
	got := uc.WithLogger(slog.Default())
	if got == nil {
		t.Fatal("esperado ponteiro não-nil")
	}
}

func Test_DeleteAccountUseCase_WithLogger_ReturnsUC(t *testing.T) {
	uc := appidentity.NewDeleteAccountUseCase(newMockUserRepo(), newMockRefreshRepo(), shared.FixedClock{T: time.Now()})
	got := uc.WithLogger(slog.Default())
	if got == nil {
		t.Fatal("esperado ponteiro não-nil")
	}
}

func Test_LogoutUseCase_WithLogger_ReturnsUC(t *testing.T) {
	uc := appidentity.NewLogoutUseCase(newMockRefreshRepo())
	got := uc.WithLogger(slog.Default())
	if got == nil {
		t.Fatal("esperado ponteiro não-nil")
	}
}

func Test_LogoutAllUseCase_WithLogger_ReturnsUC(t *testing.T) {
	uc := appidentity.NewLogoutAllUseCase(newMockRefreshRepo())
	got := uc.WithLogger(slog.Default())
	if got == nil {
		t.Fatal("esperado ponteiro não-nil")
	}
}

// ─── RequestMagicLink — caminhos de erro adicionais ──────────────────────────

// Test_RequestMagicLink_Execute_GetAttemptsFails_ReturnsError cobre falha no Redis.
func Test_RequestMagicLink_Execute_GetAttemptsFails_ReturnsError(t *testing.T) {
	redisErr := errors.New("redis timeout")
	store := &mockTokenStore{getErr: redisErr}

	uc := appidentity.NewRequestMagicLinkUseCase(
		store, newMockUserRepo(), &mockEmailer{},
		shared.FixedClock{T: time.Now()}, 10*time.Minute, 5, false,
	)
	_, err := uc.Execute(context.Background(), appidentity.RequestMagicLinkCommand{
		Email: "user@example.com",
	})
	if err == nil {
		t.Fatal("esperado erro quando GetAttempts falha, got nil")
	}
}

// Test_RequestMagicLink_Execute_StoreFails_ReturnsError cobre falha ao armazenar token.
func Test_RequestMagicLink_Execute_StoreFails_ReturnsError(t *testing.T) {
	storeErr := errors.New("redis store down")
	store := &mockTokenStore{storeErr: storeErr}

	uc := appidentity.NewRequestMagicLinkUseCase(
		store, newMockUserRepo(), &mockEmailer{},
		shared.FixedClock{T: time.Now()}, 10*time.Minute, 5, false,
	)
	_, err := uc.Execute(context.Background(), appidentity.RequestMagicLinkCommand{
		Email: "user@example.com",
	})
	if err == nil || !errors.Is(err, storeErr) {
		t.Fatalf("esperado wrap de storeErr, got %v", err)
	}
}

// ─── VerifyMagicLink — caminhos de erro adicionais ───────────────────────────

// mockIncrFailStore — store cujo IncrAttempts falha.
type mockIncrFailStore struct {
	mockTokenStore
	incrErr error
}

func (m *mockIncrFailStore) IncrAttempts(_ context.Context, _ domidentity.Email) (int64, error) {
	return 0, m.incrErr
}

// Test_RequestMagicLink_Execute_IncrAttemptsFails_ReturnsError cobre falha ao incrementar.
func Test_RequestMagicLink_Execute_IncrAttemptsFails_ReturnsError(t *testing.T) {
	incrErr := errors.New("incr failed")
	store := &mockIncrFailStore{incrErr: incrErr}

	uc := appidentity.NewRequestMagicLinkUseCase(
		store, newMockUserRepo(), &mockEmailer{},
		shared.FixedClock{T: time.Now()}, 10*time.Minute, 5, false,
	)
	_, err := uc.Execute(context.Background(), appidentity.RequestMagicLinkCommand{
		Email: "user@example.com",
	})
	if err == nil || !errors.Is(err, incrErr) {
		t.Fatalf("esperado wrap de incrErr, got %v", err)
	}
}

// mockUserRepoWithFindByEmailError — FindByEmail retorna erro genérico (não ErrNotFound).
type mockUserRepoWithGenericError struct {
	mockUserRepo
	findByEmailErr error
}

func (m *mockUserRepoWithGenericError) FindByEmail(_ context.Context, _ domidentity.Email) (*domidentity.User, error) {
	return nil, m.findByEmailErr
}

// Test_VerifyMagicLink_Execute_FindByEmailFails_ReturnsError cobre o branch onde
// FindByEmail retorna um erro genérico (não ErrNotFound) — ex: DB timeout.
func Test_VerifyMagicLink_Execute_FindByEmailFails_ReturnsError(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	tokenStore := makeTokenStoreWithToken(stored)

	dbErr := errors.New("db connection reset")
	userRepo := &mockUserRepoWithGenericError{
		mockUserRepo:   *newMockUserRepo(),
		findByEmailErr: dbErr,
	}

	uc := appidentity.NewVerifyMagicLinkUseCase(
		tokenStore, userRepo, newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false,
	)
	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "user@example.com",
		Token: "123456",
	})
	if err == nil {
		t.Fatal("esperado erro quando FindByEmail retorna erro genérico, got nil")
	}
}

// Test_VerifyMagicLink_Execute_IssueRefreshTokenFails_ReturnsError cobre a falha
// ao emitir o refresh token após autenticação bem-sucedida.
func Test_VerifyMagicLink_Execute_IssueRefreshTokenFails_ReturnsError(t *testing.T) {
	now := time.Now()
	email := domidentity.MustNewEmail("user@example.com")
	userID := shared.NewUserID()
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "User", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	tokenStore := makeTokenStoreWithToken(stored)

	userRepo := newMockUserRepo()
	userRepo.byEmail[email.String()] = user

	issuer := &mockTokenIssuer{refreshErr: errors.New("jwt refresh down")}

	uc := appidentity.NewVerifyMagicLinkUseCase(
		tokenStore, userRepo, newMockRefreshRepo(),
		issuer, shared.FixedClock{T: now}, time.Hour, false,
	)
	_, err = uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: email.String(),
		Token: "123456",
	})
	if err == nil {
		t.Fatal("esperado erro quando IssueRefreshToken falha, got nil")
	}
}

// Test_VerifyMagicLink_Execute_SaveRefreshTokenFails_ReturnsError cobre a falha
// ao salvar o refresh token no banco.
func Test_VerifyMagicLink_Execute_SaveRefreshTokenFails_ReturnsError(t *testing.T) {
	now := time.Now()
	email := domidentity.MustNewEmail("user@example.com")
	userID := shared.NewUserID()
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "User", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	tokenStore := makeTokenStoreWithToken(stored)

	userRepo := newMockUserRepo()
	userRepo.byEmail[email.String()] = user

	refreshRepo := newMockRefreshRepo()
	refreshRepo.saveErr = errors.New("db save failed")

	uc := appidentity.NewVerifyMagicLinkUseCase(
		tokenStore, userRepo, refreshRepo,
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false,
	)
	_, err = uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: email.String(),
		Token: "123456",
	})
	if err == nil {
		t.Fatal("esperado erro quando Save do refresh token falha, got nil")
	}
}

// Test_VerifyMagicLink_Execute_NewUserWithInvalidPhone_ReturnsValidation cobre o branch
// onde o usuário é novo mas o telefone de registro é inválido.
func Test_VerifyMagicLink_Execute_NewUserWithInvalidPhone_ReturnsValidation(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	tokenStore := makeTokenStoreWithToken(stored)

	uc := appidentity.NewVerifyMagicLinkUseCase(
		tokenStore, newMockUserRepo(), newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false,
	)
	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "new@example.com",
		Token: "123456",
		Registration: &appidentity.RegistrationData{
			Name:  "New User",
			Phone: "invalid-phone-number", // inválido
		},
	})
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("esperado ErrValidation para phone inválido no registro, got %v", err)
	}
}

// ─── RefreshToken — caminhos adicionais ──────────────────────────────────────

// Test_RefreshToken_Execute_RevokeFails_StillReturnsSuccess verifica que falha ao revogar
// o token antigo NÃO causa lockout do usuário — o novo token já foi salvo e é retornado.
// O token antigo expirará naturalmente via TTL (30 dias).
// Comportamento intentional: save-first, revoke-after para evitar lockout permanente.
func Test_RefreshToken_Execute_RevokeFails_StillReturnsSuccess(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("user@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "User", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	userRepo := newMockUserRepo()
	userRepo.byID[userID] = user

	refreshRepo := newMockRefreshRepo()
	oldHash := "old-hash-revoke-fail"
	refreshRepo.byHash[oldHash] = domidentity.RefreshToken{
		UserID:    userID,
		TokenHash: oldHash,
		ExpiresAt: now.Add(24 * time.Hour),
		CreatedAt: now.Add(-time.Hour),
	}
	refreshRepo.revokeErr = errors.New("revoke failed")

	uc := appidentity.NewRefreshTokenUseCase(
		refreshRepo, userRepo, &mockTokenIssuer{},
		shared.FixedClock{T: now}, 24*time.Hour,
	)
	result, err := uc.Execute(context.Background(), oldHash)
	if err != nil {
		t.Fatalf("esperado sucesso mesmo com Revoke falhando, got erro: %v", err)
	}
	if result.AccessToken == "" {
		t.Fatal("esperado access token não-vazio")
	}
}

// Test_RefreshToken_Execute_SaveNewTokenFails_ReturnsError cobre falha ao salvar
// o novo refresh token (após revogar o antigo com sucesso).
func Test_RefreshToken_Execute_SaveNewTokenFails_ReturnsError(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	email := domidentity.MustNewEmail("user@example.com")
	user, _, err := domidentity.NewUser(userID, email, domidentity.Phone{}, "User", false, shared.ReferralID("ref0"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}

	userRepo := newMockUserRepo()
	userRepo.byID[userID] = user

	// refreshRepo que revoga ok mas falha no Save.
	refreshRepo := &mockSaveFailRefreshRepo{
		mockRefreshRepo: *newMockRefreshRepo(),
	}
	oldHash := "old-hash-save-fail"
	refreshRepo.byHash[oldHash] = domidentity.RefreshToken{
		UserID:    userID,
		TokenHash: oldHash,
		ExpiresAt: now.Add(24 * time.Hour),
		CreatedAt: now.Add(-time.Hour),
	}

	uc := appidentity.NewRefreshTokenUseCase(
		refreshRepo, userRepo, &mockTokenIssuer{},
		shared.FixedClock{T: now}, 24*time.Hour,
	)
	_, err = uc.Execute(context.Background(), oldHash)
	if err == nil {
		t.Fatal("esperado erro quando Save do novo token falha, got nil")
	}
}

// mockSaveFailRefreshRepo — Save sempre falha, mas Revoke e FindByHash funcionam.
type mockSaveFailRefreshRepo struct {
	mockRefreshRepo
}

func (m *mockSaveFailRefreshRepo) Save(_ context.Context, _ domidentity.RefreshToken) error {
	// Primeira chamada (durante Revoke não há Save) — Save é chamado para o NOVO token.
	return errors.New("save new token failed")
}
