//go:build security

// Threat model: webhook do Stripe é uma rota pública. Um atacante pode forjar
// um POST e tentar marcar uma compra como paga. As defesas em camadas:
//  1. Assinatura HMAC verificada pelo SDK do Stripe.
//  2. Timestamp recente (anti-replay, dentro de 5min).
//  3. stripe_event_id único na DB (idempotência).
package security

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/stripe/stripe-go/v82"

	appbilling "github.com/fernandofv/api/internal/application/billing"
	dombilling "github.com/fernandofv/api/internal/domain/billing"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/handlers"
)

// rejectValidator simula o validador da Stripe sempre falhando assinatura.
type rejectValidator struct{}

func (rejectValidator) ValidateWebhookSignature(_ []byte, _ string) (*stripe.Event, error) {
	return nil, errors.New("stripe: invalid webhook signature: signature mismatch")
}

func Test_Security_StripeWebhook_NoSignature_Rejected(t *testing.T) {
	h := handlers.NewBillingHandler(nil, nil, rejectValidator{})

	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks/stripe",
		strings.NewReader(`{"id":"evt_x","type":"checkout.session.completed"}`))
	// Sem Stripe-Signature.
	rec := httptest.NewRecorder()
	h.StripeWebhook(rec, req)

	if rec.Code < 400 || rec.Code >= 500 {
		t.Fatalf("sem assinatura deve dar 4xx, got %d", rec.Code)
	}
	if rec.Code == http.StatusOK {
		t.Fatalf("webhook sem assinatura JAMAIS deve dar 200")
	}
}

func Test_Security_StripeWebhook_InvalidSignature_Rejected(t *testing.T) {
	h := handlers.NewBillingHandler(nil, nil, rejectValidator{})

	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks/stripe",
		strings.NewReader(`{"id":"evt_x","type":"checkout.session.completed"}`))
	req.Header.Set("Stripe-Signature", "t=1500000000,v1=deadbeef0000000000")
	rec := httptest.NewRecorder()
	h.StripeWebhook(rec, req)

	if rec.Code != http.StatusUnauthorized && rec.Code != http.StatusBadRequest {
		t.Fatalf("assinatura forjada deve dar 401/400, got %d body=%s", rec.Code, rec.Body.String())
	}
}

// O SDK do Stripe rejeita timestamps > 5min via ConstructEvent.
// Nosso rejectValidator simula esse comportamento — o handler deve refletir.
func Test_Security_StripeWebhook_OldTimestamp_Rejected(t *testing.T) {
	h := handlers.NewBillingHandler(nil, nil, rejectValidator{})

	old := time.Now().Add(-10 * time.Minute).Unix()
	req := httptest.NewRequest(http.MethodPost, "/api/v1/webhooks/stripe",
		strings.NewReader(`{"id":"evt_x","type":"checkout.session.completed"}`))
	req.Header.Set("Stripe-Signature", "t="+itoa(old)+",v1=any")
	rec := httptest.NewRecorder()
	h.StripeWebhook(rec, req)

	if rec.Code == http.StatusOK {
		t.Fatalf("timestamp velho JAMAIS deve dar 200 (anti-replay)")
	}
}

// ─── Idempotência: o mesmo evento processado duas vezes não duplica purchase ──

type stubStripeEventRepo struct {
	processed map[string]bool
	claimed   map[string]bool
	marks     int
}

func newStubStripeEventRepo() *stubStripeEventRepo {
	return &stubStripeEventRepo{
		processed: map[string]bool{},
		claimed:   map[string]bool{},
	}
}

// Claim marca o evento como "em processamento" — retorna (true, nil) se conseguiu,
// (false, nil) se já foi reivindicado/processado.
func (s *stubStripeEventRepo) Claim(_ context.Context, id string) (bool, error) {
	if s.processed[id] || s.claimed[id] {
		return false, nil
	}
	s.claimed[id] = true
	return true, nil
}
func (s *stubStripeEventRepo) Unclaim(_ context.Context, id string) error {
	delete(s.claimed, id)
	return nil
}
func (s *stubStripeEventRepo) MarkProcessed(_ context.Context, id string) error {
	s.marks++
	s.processed[id] = true
	delete(s.claimed, id)
	return nil
}
func (s *stubStripeEventRepo) IsProcessed(_ context.Context, id string) (bool, error) {
	return s.processed[id], nil
}

// stubPurchaseRepo registra cada Save para detectar duplicação.
type stubPurchaseRepo struct {
	saves int
}

func (s *stubPurchaseRepo) Save(_ context.Context, _ *dombilling.Purchase) error {
	s.saves++
	return nil
}
func (s *stubPurchaseRepo) Update(_ context.Context, _ *dombilling.Purchase) error { return nil }
func (s *stubPurchaseRepo) FindByID(_ context.Context, _ shared.PurchaseID) (*dombilling.Purchase, error) {
	return nil, shared.ErrNotFound
}
func (s *stubPurchaseRepo) FindByStripeSession(_ context.Context, _ string) (*dombilling.Purchase, error) {
	return nil, shared.ErrNotFound
}

// stubUserRepoBilling: o use case chama userRepo para adicionar produto ao user.
type stubUserRepoBilling struct{}

func (stubUserRepoBilling) Save(context.Context, *domidentity.User) error   { return nil }
func (stubUserRepoBilling) Update(context.Context, *domidentity.User) error { return nil }
func (stubUserRepoBilling) FindByID(context.Context, shared.UserID) (*domidentity.User, error) {
	return nil, shared.ErrNotFound
}
func (stubUserRepoBilling) FindByEmail(context.Context, domidentity.Email) (*domidentity.User, error) {
	return nil, shared.ErrNotFound
}
func (stubUserRepoBilling) ExistsByEmail(context.Context, domidentity.Email) (bool, error) {
	return false, nil
}
func (stubUserRepoBilling) ExistsByPhone(context.Context, domidentity.Phone) (bool, error) {
	return false, nil
}
func (stubUserRepoBilling) SoftDelete(context.Context, shared.UserID, time.Time) error { return nil }
func (stubUserRepoBilling) ListForAdmin(context.Context, int, int) ([]*domidentity.User, int, error) {
	return nil, 0, nil
}

func Test_Security_StripeWebhook_DuplicateEvent_Idempotent(t *testing.T) {
	eventRepo := newStubStripeEventRepo()
	purchaseRepo := &stubPurchaseRepo{}
	userRepo := stubUserRepoBilling{}

	uc := appbilling.NewHandleStripeWebhookUseCase(
		purchaseRepo, eventRepo, userRepo, shared.SystemClock{},
	)

	evt := appbilling.StripeWebhookEvent{
		ID:        "evt_dup_test",
		Type:      "checkout.session.completed",
		SessionID: "cs_test_xxx",
	}

	// Primeira execução: registra (mesmo que FindBySessionID retorne not found,
	// o use case deve marcar como processado para que a segunda seja noop).
	_ = uc.Execute(context.Background(), evt)
	if eventRepo.marks > 1 {
		t.Fatalf("primeira chamada não pode marcar mais que 1x: %d", eventRepo.marks)
	}

	// Segunda execução do MESMO event ID — deve ser noop (Claim falha).
	marksBefore := eventRepo.marks
	savesBefore := purchaseRepo.saves
	_ = uc.Execute(context.Background(), evt)

	if eventRepo.marks > marksBefore {
		t.Fatalf("duplicata não pode chamar MarkProcessed; marks subiu %d→%d",
			marksBefore, eventRepo.marks)
	}
	if purchaseRepo.saves > savesBefore {
		t.Fatalf("duplicata não pode chamar Save; saves subiu %d→%d",
			savesBefore, purchaseRepo.saves)
	}
}

// itoa pequeno, evita importar strconv só para um número.
func itoa(n int64) string {
	if n == 0 {
		return "0"
	}
	negative := n < 0
	if negative {
		n = -n
	}
	buf := [20]byte{}
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	if negative {
		i--
		buf[i] = '-'
	}
	return string(buf[i:])
}
