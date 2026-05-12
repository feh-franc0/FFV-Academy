// Package billing implementa o bounded context de monetização.
//
// PADRÕES:
//   - DDD: Purchase é o aggregate root.
//   - SOLID/OCP: PaymentProvider é interface — troca Stripe por outro sem mudar domínio.
//   - Segurança: grantProduct NUNCA é chamado client-side; apenas via webhook.
package billing

import (
	"context"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// PurchaseStatus representa o status de uma compra.
type PurchaseStatus string

const (
	StatusPending  PurchaseStatus = "pending"
	StatusPaid     PurchaseStatus = "paid"
	StatusFailed   PurchaseStatus = "failed"
	StatusRefunded PurchaseStatus = "refunded"
)

// Purchase é o aggregate root do bounded context billing.
//
// INVARIANTES:
//  1. paid_at só existe quando status == paid.
//  2. Transição de status é unidirecional: pending → paid | failed, paid → refunded.
type Purchase struct {
	id                  shared.PurchaseID
	userID              shared.UserID
	productID           shared.ProductID
	amountCents         int64
	currency            string
	stripeSessionID     string
	stripePaymentIntent string
	status              PurchaseStatus
	createdAt           time.Time
	paidAt              *time.Time
}

func NewPurchase(
	id shared.PurchaseID,
	userID shared.UserID,
	productID shared.ProductID,
	amountCents int64,
	stripeSessionID string,
	now time.Time,
) *Purchase {
	return &Purchase{
		id:              id,
		userID:          userID,
		productID:       productID,
		amountCents:     amountCents,
		currency:        "BRL",
		stripeSessionID: stripeSessionID,
		status:          StatusPending,
		createdAt:       now,
	}
}

func (p *Purchase) ID() shared.PurchaseID       { return p.id }
func (p *Purchase) UserID() shared.UserID       { return p.userID }
func (p *Purchase) ProductID() shared.ProductID { return p.productID }
func (p *Purchase) AmountCents() int64          { return p.amountCents }
func (p *Purchase) Status() PurchaseStatus      { return p.status }
func (p *Purchase) StripeSessionID() string     { return p.stripeSessionID }

// MarkPaid transiciona o status para paid.
func (p *Purchase) MarkPaid(paymentIntent string, now time.Time) error {
	if p.status != StatusPending {
		return shared.NewConflictError("compra não está em status pending")
	}
	p.status = StatusPaid
	p.stripePaymentIntent = paymentIntent
	p.paidAt = &now
	return nil
}

// PaymentProvider é o port de integração com o gateway de pagamento.
//
// DIP: o domínio depende desta interface; o Stripe fica em infrastructure/payment.
type PaymentProvider interface {
	CreateCheckoutSession(ctx context.Context, req CreateCheckoutReq) (CheckoutSession, error)
}

type CreateCheckoutReq struct {
	UserID     shared.UserID
	ProductID  shared.ProductID
	PriceID    string // Stripe price ID
	SuccessURL string
	CancelURL  string
}

type CheckoutSession struct {
	ID  string
	URL string
}

// PurchaseRepository port
type PurchaseRepository interface {
	Save(ctx context.Context, p *Purchase) error
	Update(ctx context.Context, p *Purchase) error
	FindByStripeSession(ctx context.Context, sessionID string) (*Purchase, error)
	FindByID(ctx context.Context, id shared.PurchaseID) (*Purchase, error)
}

// StripeEventRepository garante idempotência nos webhooks.
//
// Claim retorna (true, nil) quando esta chamada gravou o evento pela primeira
// vez (dono do processamento). Retorna (false, nil) se já existia — outro
// processo já claimou ou concluiu. Isto permite que o UC faça side-effects
// com segurança e desfaça (Unclaim) em caso de falha antes de persistir.
type StripeEventRepository interface {
	Claim(ctx context.Context, eventID string) (claimed bool, err error)
	Unclaim(ctx context.Context, eventID string) error
	MarkProcessed(ctx context.Context, eventID string) error // legado: mantido para compat, use Claim
	IsProcessed(ctx context.Context, eventID string) (bool, error)
}

// ProductCatalog mapeia productID → stripe price ID.
// Em produção, vem de env vars ou arquivo de config.
type ProductCatalog interface {
	GetStripePriceID(productID shared.ProductID) (string, error)
	GetAmountCents(productID shared.ProductID) (int64, error)
}
