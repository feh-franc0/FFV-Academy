package billing_test

import (
	"context"
	"testing"
	"time"

	appbilling "github.com/fernandofv/api/internal/application/billing"
	dombilling "github.com/fernandofv/api/internal/domain/billing"
	"github.com/fernandofv/api/internal/domain/shared"
)

type mockStripeEventRepo struct {
	processed         map[string]bool
	markErr, checkErr error
	claimErr          error
	markCalls         int
	claimCalls        int
	unclaimCalls      int
}

func newMockStripeEventRepo() *mockStripeEventRepo {
	return &mockStripeEventRepo{processed: make(map[string]bool)}
}

// Claim retorna true na primeira chamada, false nas subsequentes (simula
// INSERT ... ON CONFLICT DO NOTHING RETURNING).
func (m *mockStripeEventRepo) Claim(_ context.Context, id string) (bool, error) {
	m.claimCalls++
	if m.claimErr != nil {
		return false, m.claimErr
	}
	if _, exists := m.processed[id]; exists {
		return false, nil
	}
	m.processed[id] = false // claimed but not yet processed
	return true, nil
}

func (m *mockStripeEventRepo) Unclaim(_ context.Context, id string) error {
	m.unclaimCalls++
	delete(m.processed, id)
	return nil
}

func (m *mockStripeEventRepo) MarkProcessed(_ context.Context, id string) error {
	m.markCalls++
	if m.markErr != nil {
		return m.markErr
	}
	m.processed[id] = true
	return nil
}

func (m *mockStripeEventRepo) IsProcessed(_ context.Context, id string) (bool, error) {
	if m.checkErr != nil {
		return false, m.checkErr
	}
	return m.processed[id], nil
}

func Test_HandleStripeWebhook_Execute_CheckoutCompleted_MarksPaidAndGrants(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	productID := shared.ProductID("simulado-aws")
	sessionID := "cs_123"

	user := newUserNoProducts(t, userID, now)
	userRepo := newMockUserRepoBilling()
	userRepo.byID[userID] = user

	purchase := dombilling.NewPurchase(shared.NewPurchaseID(), userID, productID, 4990, sessionID, now)
	purchaseRepo := newMockPurchaseRepo()
	_ = purchaseRepo.Save(context.Background(), purchase)

	events := newMockStripeEventRepo()
	uc := appbilling.NewHandleStripeWebhookUseCase(purchaseRepo, events, userRepo, shared.FixedClock{T: now})

	err := uc.Execute(context.Background(), appbilling.StripeWebhookEvent{
		ID: "evt_1", Type: "checkout.session.completed",
		SessionID: sessionID, PaymentIntentID: "pi_1",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !events.processed["evt_1"] {
		t.Fatalf("expected event marked processed")
	}
	if purchase.Status() != dombilling.StatusPaid {
		t.Fatalf("expected purchase paid, got %s", purchase.Status())
	}
	if !user.HasProduct(productID) {
		t.Fatalf("expected product granted to user")
	}
	if len(userRepo.updated) != 1 {
		t.Fatalf("expected user updated once, got %d", len(userRepo.updated))
	}
}

func Test_HandleStripeWebhook_Execute_DuplicateEvent_SkipsSilently(t *testing.T) {
	now := time.Now()
	events := newMockStripeEventRepo()
	events.processed["evt_dup"] = true

	purchaseRepo := newMockPurchaseRepo()
	uc := appbilling.NewHandleStripeWebhookUseCase(purchaseRepo, events, newMockUserRepoBilling(),
		shared.FixedClock{T: now})

	err := uc.Execute(context.Background(), appbilling.StripeWebhookEvent{
		ID: "evt_dup", Type: "checkout.session.completed",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if events.markCalls != 0 {
		t.Fatalf("expected no MarkProcessed call on duplicate, got %d", events.markCalls)
	}
	if len(purchaseRepo.updated) != 0 {
		t.Fatalf("expected no updates on duplicate, got %d", len(purchaseRepo.updated))
	}
}

func Test_HandleStripeWebhook_Execute_UnknownEventType_IgnoresSilently(t *testing.T) {
	now := time.Now()
	events := newMockStripeEventRepo()
	uc := appbilling.NewHandleStripeWebhookUseCase(newMockPurchaseRepo(), events, newMockUserRepoBilling(),
		shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appbilling.StripeWebhookEvent{
		ID: "evt_x", Type: "invoice.created",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !events.processed["evt_x"] {
		t.Fatalf("event should be marked processed even if ignored")
	}
}
