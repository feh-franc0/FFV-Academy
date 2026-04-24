package billing_test

import (
	"context"
	"errors"
	"testing"
	"time"

	appbilling "github.com/fernandofv/api/internal/application/billing"
	dombilling "github.com/fernandofv/api/internal/domain/billing"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// --- Mocks ---

type mockPurchaseRepo struct {
	saved   []*dombilling.Purchase
	updated []*dombilling.Purchase
	bySess  map[string]*dombilling.Purchase
	byID    map[shared.PurchaseID]*dombilling.Purchase
	saveErr error
}

func newMockPurchaseRepo() *mockPurchaseRepo {
	return &mockPurchaseRepo{
		bySess: make(map[string]*dombilling.Purchase),
		byID:   make(map[shared.PurchaseID]*dombilling.Purchase),
	}
}
func (m *mockPurchaseRepo) Save(_ context.Context, p *dombilling.Purchase) error {
	if m.saveErr != nil {
		return m.saveErr
	}
	m.saved = append(m.saved, p)
	m.bySess[p.StripeSessionID()] = p
	m.byID[p.ID()] = p
	return nil
}
func (m *mockPurchaseRepo) Update(_ context.Context, p *dombilling.Purchase) error {
	m.updated = append(m.updated, p)
	m.byID[p.ID()] = p
	return nil
}
func (m *mockPurchaseRepo) FindByStripeSession(_ context.Context, id string) (*dombilling.Purchase, error) {
	p, ok := m.bySess[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return p, nil
}
func (m *mockPurchaseRepo) FindByID(_ context.Context, id shared.PurchaseID) (*dombilling.Purchase, error) {
	p, ok := m.byID[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return p, nil
}

type mockPaymentProvider struct {
	session dombilling.CheckoutSession
	err     error
	called  int
}

func (m *mockPaymentProvider) CreateCheckoutSession(_ context.Context, _ dombilling.CreateCheckoutReq) (dombilling.CheckoutSession, error) {
	m.called++
	if m.err != nil {
		return dombilling.CheckoutSession{}, m.err
	}
	return m.session, nil
}

type mockProductCatalog struct{}

func (mockProductCatalog) GetStripePriceID(_ shared.ProductID) (string, error) { return "price_123", nil }
func (mockProductCatalog) GetAmountCents(_ shared.ProductID) (int64, error)    { return 4990, nil }

// mockUserRepoBilling: minimal UserRepository for billing tests
type mockUserRepoBilling struct {
	byID      map[shared.UserID]*domidentity.User
	updateErr error
	updated   []*domidentity.User
}

func newMockUserRepoBilling() *mockUserRepoBilling {
	return &mockUserRepoBilling{byID: make(map[shared.UserID]*domidentity.User)}
}
func (m *mockUserRepoBilling) Save(_ context.Context, u *domidentity.User) error {
	m.byID[u.ID()] = u
	return nil
}
func (m *mockUserRepoBilling) Update(_ context.Context, u *domidentity.User) error {
	if m.updateErr != nil {
		return m.updateErr
	}
	m.byID[u.ID()] = u
	m.updated = append(m.updated, u)
	return nil
}
func (m *mockUserRepoBilling) FindByID(_ context.Context, id shared.UserID) (*domidentity.User, error) {
	u, ok := m.byID[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return u, nil
}
func (m *mockUserRepoBilling) FindByEmail(_ context.Context, _ domidentity.Email) (*domidentity.User, error) {
	return nil, shared.ErrNotFound
}
func (m *mockUserRepoBilling) FindByGoogleID(_ context.Context, _ string) (*domidentity.User, error) {
	return nil, shared.ErrNotFound
}
func (m *mockUserRepoBilling) ExistsByEmail(_ context.Context, _ domidentity.Email) (bool, error) {
	return false, nil
}
func (m *mockUserRepoBilling) ExistsByPhone(_ context.Context, _ domidentity.Phone) (bool, error) {
	return false, nil
}
func (m *mockUserRepoBilling) SoftDelete(_ context.Context, _ shared.UserID, _ time.Time) error {
	return nil
}
func (m *mockUserRepoBilling) ListForAdmin(_ context.Context, _, _ int) ([]*domidentity.User, int, error) {
	return nil, 0, nil
}

func newUserNoProducts(t *testing.T, id shared.UserID, now time.Time) *domidentity.User {
	t.Helper()
	email := domidentity.MustNewEmail("u@example.com")
	u, _, err := domidentity.NewUser(id, email, domidentity.Phone{}, "User", false, shared.ReferralID("r"), now)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}
	return u
}

// --- Tests ---

func Test_CreateCheckout_Execute_HappyPath_Succeeds(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	userRepo := newMockUserRepoBilling()
	userRepo.byID[userID] = newUserNoProducts(t, userID, now)

	purchaseRepo := newMockPurchaseRepo()
	payment := &mockPaymentProvider{session: dombilling.CheckoutSession{ID: "cs_123", URL: "https://stripe/checkout/cs_123"}}

	uc := appbilling.NewCreateCheckoutUseCase(purchaseRepo, payment, mockProductCatalog{}, userRepo,
		shared.FixedClock{T: now}, "https://success", "https://cancel")

	res, err := uc.Execute(context.Background(), appbilling.CreateCheckoutCommand{
		UserID: userID, ProductID: "simulado-aws",
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if res.SessionID != "cs_123" || res.CheckoutURL == "" {
		t.Fatalf("unexpected result: %+v", res)
	}
	if len(purchaseRepo.saved) != 1 {
		t.Fatalf("expected 1 purchase saved, got %d", len(purchaseRepo.saved))
	}
	if purchaseRepo.saved[0].Status() != dombilling.StatusPending {
		t.Fatalf("expected pending status, got %s", purchaseRepo.saved[0].Status())
	}
}

func Test_CreateCheckout_Execute_UserAlreadyHasProduct_ReturnsConflict(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	productID := shared.ProductID("simulado-aws")
	user := newUserNoProducts(t, userID, now)
	user.GrantProduct(productID, shared.NewPurchaseID(), now)

	userRepo := newMockUserRepoBilling()
	userRepo.byID[userID] = user

	uc := appbilling.NewCreateCheckoutUseCase(newMockPurchaseRepo(), &mockPaymentProvider{},
		mockProductCatalog{}, userRepo, shared.FixedClock{T: now}, "s", "c")

	_, err := uc.Execute(context.Background(), appbilling.CreateCheckoutCommand{
		UserID: userID, ProductID: productID,
	})
	if !errors.Is(err, shared.ErrConflict) {
		t.Fatalf("expected ErrConflict, got %v", err)
	}
}
