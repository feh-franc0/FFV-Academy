//go:build security

// Threat model: rotas registradas continuam respondendo mesmo após uma feature
// ser desabilitada (billing, tutor IA, phone auth). Este arquivo confere que o
// handler retorna 503 sem invocar qualquer integração externa.
package security

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stripe/stripe-go/v82"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	apptutor "github.com/fernandofv/api/internal/application/tutor"
	"github.com/fernandofv/api/internal/config"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// ─── Stubs mínimos para os use cases ──────────────────────────────────────────

type ffUserRepo struct{}

func (ffUserRepo) Save(context.Context, *domidentity.User) error   { return nil }
func (ffUserRepo) Update(context.Context, *domidentity.User) error { return nil }
func (ffUserRepo) FindByID(context.Context, shared.UserID) (*domidentity.User, error) {
	return nil, shared.ErrNotFound
}
func (ffUserRepo) FindByEmail(context.Context, domidentity.Email) (*domidentity.User, error) {
	return nil, shared.ErrNotFound
}
func (ffUserRepo) ExistsByEmail(context.Context, domidentity.Email) (bool, error) { return false, nil }
func (ffUserRepo) ExistsByPhone(context.Context, domidentity.Phone) (bool, error) { return false, nil }
func (ffUserRepo) SoftDelete(context.Context, shared.UserID, time.Time) error     { return nil }
func (ffUserRepo) ListForAdmin(context.Context, int, int) ([]*domidentity.User, int, error) {
	return nil, 0, nil
}

type ffTokenStore struct{}

func (ffTokenStore) Store(context.Context, domidentity.Email, domidentity.MagicToken) error {
	return nil
}
func (ffTokenStore) Consume(context.Context, domidentity.Email) (domidentity.MagicToken, error) {
	return domidentity.MagicToken{}, shared.ErrNotFound
}
func (ffTokenStore) Peek(context.Context, domidentity.Email) (domidentity.MagicToken, error) {
	return domidentity.MagicToken{}, shared.ErrNotFound
}
func (ffTokenStore) IncrAttempts(context.Context, domidentity.Email) (int64, error) { return 1, nil }
func (ffTokenStore) GetAttempts(context.Context, domidentity.Email) (int64, error)  { return 0, nil }

type ffRefreshRepo struct{}

func (ffRefreshRepo) Save(context.Context, domidentity.RefreshToken) error { return nil }
func (ffRefreshRepo) FindByHash(context.Context, string) (domidentity.RefreshToken, error) {
	return domidentity.RefreshToken{}, shared.ErrNotFound
}
func (ffRefreshRepo) Revoke(context.Context, shared.UserID, string) error { return nil }
func (ffRefreshRepo) RevokeAllForUser(context.Context, shared.UserID) error {
	return nil
}

type ffEmailer struct{}

func (ffEmailer) SendMagicLink(context.Context, domidentity.Email, string, time.Duration) error {
	return nil
}

type ffIssuer struct{}

func (ffIssuer) IssueAccessToken(shared.UserID, domidentity.Email, domidentity.Role) (string, error) {
	return "tok", nil
}
func (ffIssuer) IssueRefreshToken(shared.UserID) (string, string, error) { return "raw", "hash", nil }

// stubWebhookValidator implementa handlers.WebhookValidator e jamais é chamado
// quando o handler está desabilitado — se for chamado, falhamos.
type stubWebhookValidator struct{ called bool }

func (s *stubWebhookValidator) ValidateWebhookSignature(_ []byte, _ string) (*stripe.Event, error) {
	s.called = true
	return nil, nil
}

func buildBillingHandler(enabled bool) *handlers.BillingHandler {
	// As deps reais nunca são chamadas quando desabilitado — nil safe nesse path.
	h := handlers.NewBillingHandler(nil, nil, &stubWebhookValidator{})
	return h.WithEnabled(enabled)
}

func buildTutorHandler(enabled bool) *handlers.TutorHandler {
	// askUC nil — quando desabilitado o handler retorna antes de chamá-lo.
	var ask *apptutor.AskUseCase
	return handlers.NewTutorHandler(ask).WithEnabled(enabled)
}

// buildAuthHandlerWithPhoneFlag constrói um AuthHandler com use cases reais
// mas com repos stub. O parâmetro `phoneEnabled` é ignorado — o handler aceita
// phone sempre (decisão de produto: coleta de telefone independente de SMS).
// Mantido pra preservar a assinatura dos testes existentes.
func buildAuthHandlerWithPhoneFlag(_ bool) *handlers.AuthHandler {
	tokenStore := ffTokenStore{}
	userRepo := ffUserRepo{}
	refreshRepo := ffRefreshRepo{}
	emailer := ffEmailer{}
	issuer := ffIssuer{}

	requestUC := appidentity.NewRequestMagicLinkUseCase(
		tokenStore, userRepo, emailer, shared.SystemClock{},
		10*time.Minute, 5, false,
	)
	verifyUC := appidentity.NewVerifyMagicLinkUseCase(
		tokenStore, userRepo, refreshRepo, issuer,
		shared.SystemClock{}, 30*24*time.Hour, false,
	)
	refreshUC := appidentity.NewRefreshTokenUseCase(
		refreshRepo, userRepo, issuer, shared.SystemClock{}, 30*24*time.Hour,
	)
	logoutUC := appidentity.NewLogoutUseCase(refreshRepo)
	logoutAllUC := appidentity.NewLogoutAllUseCase(refreshRepo)
	getProfileUC := appidentity.NewGetProfileUseCase(userRepo)
	updateProfileUC := appidentity.NewUpdateProfileUseCase(userRepo)
	deleteUC := appidentity.NewDeleteAccountUseCase(userRepo, refreshRepo, shared.SystemClock{})

	return handlers.NewAuthHandler(
		requestUC, verifyUC, refreshUC, logoutUC, logoutAllUC,
		getProfileUC, updateProfileUC, deleteUC,
	)
}

// ─── Testes ──────────────────────────────────────────────────────────────────

func Test_Security_BillingDisabled_CheckoutReturns503(t *testing.T) {
	h := buildBillingHandler(false)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/billing/checkout",
		strings.NewReader(`{"productId":"p1"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.CreateCheckout(rec, req)

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("billing-off → /checkout deve dar 503; got %d body=%s", rec.Code, rec.Body.String())
	}
	if !strings.Contains(rec.Body.String(), "billing_disabled") {
		t.Fatalf("body deve sinalizar billing_disabled; got %s", rec.Body.String())
	}
}

func Test_Security_BillingDisabled_WebhookReturns503(t *testing.T) {
	validator := &stubWebhookValidator{}
	h := handlers.NewBillingHandler(nil, nil, validator).WithEnabled(false)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks/stripe",
		strings.NewReader(`{}`))
	req.Header.Set("Stripe-Signature", "t=1,v1=fake")
	rec := httptest.NewRecorder()
	h.StripeWebhook(rec, req)

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("billing-off → /webhooks/stripe deve dar 503; got %d", rec.Code)
	}
	if validator.called {
		t.Fatalf("validator de assinatura JAMAIS deve ser chamado quando billing está off")
	}
}

func Test_Security_TutorAIDisabled_AskReturns503(t *testing.T) {
	h := buildTutorHandler(false)

	req := httptest.NewRequest(http.MethodPost, "/api/v1/tutor/ask",
		strings.NewReader(`{"simuladoId":"s","questionId":"q","kind":"por-que"}`))
	req.Header.Set("Content-Type", "application/json")
	rec := httptest.NewRecorder()
	h.Ask(rec, req)

	if rec.Code != http.StatusServiceUnavailable {
		t.Fatalf("tutor-off deve dar 503; got %d", rec.Code)
	}
	if !strings.Contains(rec.Body.String(), "tutor_ai_disabled") {
		t.Fatalf("body deve indicar tutor_ai_disabled; got %s", rec.Body.String())
	}
}

// Nota: removido Test_Security_PhoneAuthDisabled_VerifyWithPhoneReturns503.
// Decisão de produto: o telefone é COLETADO sempre (contato/recovery), mas o
// envio de SMS via Twilio fica controlado pela feature flag separadamente.
// Aceitar o campo phone no /verify não é mais um bypass — é o comportamento
// esperado. O gate de SMS continua válido na camada de infrastructure/sms.

func Test_Security_FeatureFlagState_Public(t *testing.T) {
	cfg := config.FeaturesConfig{
		BillingEnabled:   true,
		TutorAIEnabled:   false,
		PhoneAuthEnabled: true,
	}
	h := handlers.NewFeaturesHandler(cfg)

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", nil)
	rec := httptest.NewRecorder()
	h.Get(rec, req)

	if rec.Code != http.StatusOK {
		t.Fatalf("/features esperado 200, got %d", rec.Code)
	}
	var got map[string]bool
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("json: %v body=%s", err, rec.Body.String())
	}
	if got["billing_enabled"] != true || got["tutor_ai_enabled"] != false || got["phone_auth_enabled"] != true {
		t.Fatalf("estado de flags incorreto: %+v", got)
	}
}

func Test_Security_AllFlagsOff_FeaturesEndpointReturnsAllFalse(t *testing.T) {
	h := handlers.NewFeaturesHandler(config.FeaturesConfig{})

	req := httptest.NewRequest(http.MethodGet, "/api/v1/features", nil)
	rec := httptest.NewRecorder()
	h.Get(rec, req)

	var got map[string]bool
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("json: %v", err)
	}
	for k, v := range got {
		if v {
			t.Fatalf("flag %s deveria ser false, está true", k)
		}
	}
}
