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

// --- Shared mocks for identity use cases (userRepo, refreshRepo, tokenIssuer) ---

type mockUserRepo struct {
	byID        map[shared.UserID]*domidentity.User
	byEmail     map[string]*domidentity.User
	saveErr     error
	updateErr   error
	softDelErr  error
	savedUsers  []*domidentity.User
	softDeleted []shared.UserID
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{
		byID:    make(map[shared.UserID]*domidentity.User),
		byEmail: make(map[string]*domidentity.User),
	}
}

func (m *mockUserRepo) Save(_ context.Context, u *domidentity.User) error {
	if m.saveErr != nil {
		return m.saveErr
	}
	m.byID[u.ID()] = u
	m.byEmail[u.Email().String()] = u
	m.savedUsers = append(m.savedUsers, u)
	return nil
}
func (m *mockUserRepo) Update(_ context.Context, u *domidentity.User) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	m.byID[u.ID()] = u
	m.byEmail[u.Email().String()] = u
	return nil
}
func (m *mockUserRepo) FindByID(_ context.Context, id shared.UserID) (*domidentity.User, error) {
	u, ok := m.byID[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return u, nil
}
func (m *mockUserRepo) FindByEmail(_ context.Context, e domidentity.Email) (*domidentity.User, error) {
	u, ok := m.byEmail[e.String()]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return u, nil
}
func (m *mockUserRepo) ExistsByEmail(_ context.Context, e domidentity.Email) (bool, error) {
	_, ok := m.byEmail[e.String()]
	return ok, nil
}
func (m *mockUserRepo) ExistsByPhone(_ context.Context, _ domidentity.Phone) (bool, error) {
	return false, nil
}
func (m *mockUserRepo) SoftDelete(_ context.Context, id shared.UserID, _ time.Time) error {
	if m.softDelErr != nil {
		return m.softDelErr
	}
	m.softDeleted = append(m.softDeleted, id)
	return nil
}
func (m *mockUserRepo) ListForAdmin(_ context.Context, _, _ int) ([]*domidentity.User, int, error) {
	return nil, 0, nil
}

type mockRefreshRepo struct {
	saved        []domidentity.RefreshToken
	byHash       map[string]domidentity.RefreshToken
	saveErr      error
	revokeErr    error
	revokeAllErr error
	revokedAll   []shared.UserID
	revoked      []string
	findErr      error
}

func newMockRefreshRepo() *mockRefreshRepo {
	return &mockRefreshRepo{byHash: make(map[string]domidentity.RefreshToken)}
}
func (m *mockRefreshRepo) Save(_ context.Context, t domidentity.RefreshToken) error {
	if m.saveErr != nil {
		return m.saveErr
	}
	m.saved = append(m.saved, t)
	m.byHash[t.TokenHash] = t
	return nil
}
func (m *mockRefreshRepo) FindByHash(_ context.Context, hash string) (domidentity.RefreshToken, error) {
	if m.findErr != nil {
		return domidentity.RefreshToken{}, m.findErr
	}
	t, ok := m.byHash[hash]
	if !ok {
		return domidentity.RefreshToken{}, shared.ErrNotFound
	}
	return t, nil
}
func (m *mockRefreshRepo) Revoke(_ context.Context, _ shared.UserID, hash string) error {
	if m.revokeErr != nil {
		return m.revokeErr
	}
	m.revoked = append(m.revoked, hash)
	return nil
}
func (m *mockRefreshRepo) RevokeAllForUser(_ context.Context, id shared.UserID) error {
	if m.revokeAllErr != nil {
		return m.revokeAllErr
	}
	m.revokedAll = append(m.revokedAll, id)
	return nil
}

type mockTokenIssuer struct {
	accessToken string
	rawRefresh  string
	refreshHash string
	accessErr   error
	refreshErr  error
}

func (m *mockTokenIssuer) IssueAccessToken(_ shared.UserID, _ domidentity.Email, _ domidentity.Role) (string, error) {
	if m.accessErr != nil {
		return "", m.accessErr
	}
	if m.accessToken == "" {
		return "access-token", nil
	}
	return m.accessToken, nil
}
func (m *mockTokenIssuer) IssueRefreshToken(_ shared.UserID) (string, string, error) {
	if m.refreshErr != nil {
		return "", "", m.refreshErr
	}
	raw, hash := m.rawRefresh, m.refreshHash
	if raw == "" {
		raw = "raw-refresh"
	}
	if hash == "" {
		hash = "hash-refresh"
	}
	return raw, hash, nil
}

// --- Tests ---

func makeTokenStoreWithToken(t domidentity.MagicToken) *mockTokenStore {
	tok := t
	return &mockTokenStore{consumed: &tok}
}

func Test_VerifyMagicLink_Execute_ValidLoginExistingUser_ReturnsTokens(t *testing.T) {
	now := time.Now()
	email := domidentity.MustNewEmail("user@example.com")
	phone := domidentity.MustNewPhone("+5511987654321")
	userID := shared.NewUserID()
	user, _, err := domidentity.NewUser(userID, email, phone, "Fernando", false, shared.ReferralID("ref1234"), now)
	if err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	userRepo := newMockUserRepo()
	userRepo.byID[userID] = user
	userRepo.byEmail[email.String()] = user

	token, err := domidentity.GenerateMagicToken(10*time.Minute, now)
	if err != nil {
		t.Fatalf("generate token: %v", err)
	}
	tokenStore := makeTokenStoreWithToken(token)
	refreshRepo := newMockRefreshRepo()
	issuer := &mockTokenIssuer{}

	uc := appidentity.NewVerifyMagicLinkUseCase(tokenStore, userRepo, refreshRepo, issuer,
		shared.FixedClock{T: now}, 30*24*time.Hour, false)
	res, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: email.String(),
		Token: token.Value(),
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.IsNewUser {
		t.Fatalf("expected IsNewUser=false for existing user")
	}
	if res.AccessToken == "" || res.RefreshToken == "" {
		t.Fatalf("expected tokens to be issued")
	}
	if len(refreshRepo.saved) != 1 {
		t.Fatalf("expected refresh token saved once, got %d", len(refreshRepo.saved))
	}
}

func Test_VerifyMagicLink_Execute_TokenNotFound_ReturnsUnauthorized(t *testing.T) {
	now := time.Now()
	tokenStore := &mockTokenStore{} // no token stored
	uc := appidentity.NewVerifyMagicLinkUseCase(tokenStore, newMockUserRepo(), newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false)
	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "user@example.com",
		Token: "123456",
	})
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func Test_VerifyMagicLink_Execute_TokenExpired_ReturnsUnauthorized(t *testing.T) {
	now := time.Now()
	expired := domidentity.Reconstitute("123456", now.Add(-time.Minute))
	tokenStore := makeTokenStoreWithToken(expired)
	uc := appidentity.NewVerifyMagicLinkUseCase(tokenStore, newMockUserRepo(), newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false)
	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "user@example.com",
		Token: "123456",
	})
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func Test_VerifyMagicLink_Execute_TokenMismatch_ReturnsUnauthorized(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	tokenStore := makeTokenStoreWithToken(stored)
	uc := appidentity.NewVerifyMagicLinkUseCase(tokenStore, newMockUserRepo(), newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false)
	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "user@example.com",
		Token: "999999",
	})
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized, got %v", err)
	}
}

func Test_VerifyMagicLink_Execute_NewUserWithoutRegistration_ReturnsRegistrationRequired(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	store := &statefulTokenStore{token: &stored}
	uc := appidentity.NewVerifyMagicLinkUseCase(store, newMockUserRepo(), newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false)
	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email:        "new@example.com",
		Token:        "123456",
		Registration: nil,
	})
	// ErrRegistrationRequired, não ErrValidation — o código foi VALIDADO (posse
	// provada); o que falta é dado de cadastro, e o frontend reenvia o MESMO
	// código com nome/telefone. Por isso o token não pode ter sido consumido.
	if !errors.Is(err, shared.ErrRegistrationRequired) {
		t.Fatalf("expected ErrRegistrationRequired, got %v", err)
	}
	if store.token == nil {
		t.Fatalf("token foi consumido mesmo faltando registro — o retry com o mesmo código ficaria impossível")
	}
	if store.consumes != 0 {
		t.Fatalf("Consume não deveria ter sido chamado antes do registro chegar, foi chamado %d vez(es)", store.consumes)
	}

	// O mesmo código, agora com registro, deve completar o login.
	res, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "new@example.com",
		Token: "123456",
		Registration: &appidentity.RegistrationData{
			Name:  "Nova Pessoa",
			Phone: "+5511987654321",
		},
	})
	if err != nil {
		t.Fatalf("expected success on retry with registration, got %v", err)
	}
	if !res.IsNewUser {
		t.Fatalf("expected IsNewUser=true")
	}
	if store.consumes != 1 {
		t.Fatalf("expected exactly 1 Consume, got %d", store.consumes)
	}
}

// statefulTokenStore modela Peek (não deleta) e Consume (deleta) como estados
// distintos — a mockTokenStore compartilhada do pacote não distingue os dois,
// então este mock prova especificamente que um palpite errado (Peek +
// mismatch, sem chamar Consume) não queima o código correto pendente.
type statefulTokenStore struct {
	token    *domidentity.MagicToken
	peeks    int
	consumes int
	attempts int64
}

func (s *statefulTokenStore) Store(_ context.Context, _ domidentity.Email, token domidentity.MagicToken) error {
	s.token = &token
	return nil
}
func (s *statefulTokenStore) Peek(_ context.Context, _ domidentity.Email) (domidentity.MagicToken, error) {
	s.peeks++
	if s.token == nil {
		return domidentity.MagicToken{}, shared.ErrNotFound
	}
	return *s.token, nil
}
func (s *statefulTokenStore) Consume(_ context.Context, _ domidentity.Email) (domidentity.MagicToken, error) {
	s.consumes++
	if s.token == nil {
		return domidentity.MagicToken{}, shared.ErrNotFound
	}
	t := *s.token
	s.token = nil
	return t, nil
}
func (s *statefulTokenStore) IncrAttempts(_ context.Context, _ domidentity.Email) (int64, error) {
	s.attempts++
	return s.attempts, nil
}
func (s *statefulTokenStore) GetAttempts(_ context.Context, _ domidentity.Email) (int64, error) {
	return s.attempts, nil
}

func Test_VerifyMagicLink_Execute_WrongGuessThenCorrectGuess_BothSucceedToValidate(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	store := &statefulTokenStore{token: &stored}
	userRepo := newMockUserRepo()
	email := domidentity.MustNewEmail("wrongthenright@example.com")
	phone := domidentity.MustNewPhone("+5511987654321")
	userID := shared.NewUserID()
	user, _, err := domidentity.NewUser(userID, email, phone, "Fernando", false, shared.ReferralID("ref1234"), now)
	if err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	userRepo.byID[userID] = user
	userRepo.byEmail[email.String()] = user

	uc := appidentity.NewVerifyMagicLinkUseCase(store, userRepo, newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false)

	// 1) Palpite errado — deve falhar, mas SEM apagar o token.
	_, err = uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: email.String(),
		Token: "000001",
	})
	if !errors.Is(err, shared.ErrUnauthorized) {
		t.Fatalf("expected ErrUnauthorized on wrong guess, got %v", err)
	}
	if store.token == nil {
		t.Fatalf("token foi apagado por um palpite ERRADO — é exatamente o defeito que este teste prova que não existe mais")
	}
	if store.consumes != 0 {
		t.Fatalf("Consume não deveria ter sido chamado num palpite errado, foi chamado %d vez(es)", store.consumes)
	}

	// 2) Palpite correto em seguida — deve funcionar, porque o token sobreviveu.
	res, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: email.String(),
		Token: "123456",
	})
	if err != nil {
		t.Fatalf("expected success on correct guess after a wrong one, got %v", err)
	}
	if res.AccessToken == "" {
		t.Fatalf("expected access token to be issued")
	}
	if store.consumes != 1 {
		t.Fatalf("expected exactly 1 Consume (on the successful match), got %d", store.consumes)
	}
}

// Test_VerifyMagicLink_Execute_ExceedsMaxAttempts_LocksOutEvenCorrectCode é a
// prova direta de P-03: depois do teto de tentativas, nem o código CERTO
// passa — o lockout é por contagem de tentativas, não por "só bloqueia
// palpite errado".
func Test_VerifyMagicLink_Execute_ExceedsMaxAttempts_LocksOutEvenCorrectCode(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	store := &statefulTokenStore{token: &stored}
	userRepo := newMockUserRepo()
	email := domidentity.MustNewEmail("bruteforce@example.com")

	uc := appidentity.NewVerifyMagicLinkUseCase(store, userRepo, newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false).
		WithMaxAttempts(5)

	// 5 palpites errados — todos contam.
	for i := 0; i < 5; i++ {
		_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
			Email: email.String(),
			Token: "000000",
		})
		if !errors.Is(err, shared.ErrUnauthorized) {
			t.Fatalf("tentativa %d: esperava ErrUnauthorized, veio %v", i+1, err)
		}
	}

	// 6ª tentativa — mesmo com o código CERTO, o lockout já bateu o teto.
	_, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: email.String(),
		Token: "123456",
	})
	if !errors.Is(err, shared.ErrRateLimited) {
		t.Fatalf("esperava ErrRateLimited na 6ª tentativa (código correto incluso), veio %v", err)
	}
	if store.consumes != 0 {
		t.Fatalf("token não deveria ter sido consumido — a 6ª chamada nem chegou a checar o código")
	}
}

// Test_VerifyMagicLink_Execute_CorrectCodeOnFirstTry_NeverLocksOut garante
// que o caso comum (usuário digita certo de primeira) não é penalizado.
func Test_VerifyMagicLink_Execute_CorrectCodeOnFirstTry_NeverLocksOut(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	store := &statefulTokenStore{token: &stored}
	userRepo := newMockUserRepo()
	email := domidentity.MustNewEmail("firsttry@example.com")
	phone := domidentity.MustNewPhone("+5511987654321")
	userID := shared.NewUserID()
	user, _, err := domidentity.NewUser(userID, email, phone, "Fernando", false, shared.ReferralID("ref5678"), now)
	if err != nil {
		t.Fatalf("failed to create user: %v", err)
	}
	userRepo.byID[userID] = user
	userRepo.byEmail[email.String()] = user

	uc := appidentity.NewVerifyMagicLinkUseCase(store, userRepo, newMockRefreshRepo(),
		&mockTokenIssuer{}, shared.FixedClock{T: now}, time.Hour, false).
		WithMaxAttempts(5)

	res, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: email.String(),
		Token: "123456",
	})
	if err != nil {
		t.Fatalf("código correto na primeira tentativa deveria funcionar, veio erro: %v", err)
	}
	if res.AccessToken == "" {
		t.Fatalf("esperava access token emitido")
	}
}

func Test_VerifyMagicLink_Execute_NewUserWithRegistration_CreatesUser(t *testing.T) {
	now := time.Now()
	stored := domidentity.Reconstitute("123456", now.Add(5*time.Minute))
	tokenStore := makeTokenStoreWithToken(stored)
	userRepo := newMockUserRepo()
	refreshRepo := newMockRefreshRepo()
	uc := appidentity.NewVerifyMagicLinkUseCase(tokenStore, userRepo, refreshRepo, &mockTokenIssuer{},
		shared.FixedClock{T: now}, time.Hour, false)

	res, err := uc.Execute(context.Background(), appidentity.VerifyMagicLinkCommand{
		Email: "new@example.com",
		Token: "123456",
		Registration: &appidentity.RegistrationData{
			Name:             "New User",
			Phone:            "+5511987654321",
			MarketingConsent: true,
		},
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !res.IsNewUser {
		t.Fatalf("expected IsNewUser=true")
	}
	if len(userRepo.savedUsers) != 1 {
		t.Fatalf("expected 1 user saved, got %d", len(userRepo.savedUsers))
	}
}
