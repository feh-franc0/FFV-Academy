// Package payment implementa o adapter Stripe para pagamentos.
package payment

import (
	"context"
	"fmt"

	"github.com/stripe/stripe-go/v82"
	"github.com/stripe/stripe-go/v82/checkout/session"
	"github.com/stripe/stripe-go/v82/webhook"

	"github.com/fernandofv/api/internal/config"
	dombilling "github.com/fernandofv/api/internal/domain/billing"
)

// StripeClient implementa billing.PaymentProvider.
type StripeClient struct {
	cfg config.StripeConfig
}

func NewStripeClient(cfg config.StripeConfig) *StripeClient {
	stripe.Key = cfg.SecretKey
	return &StripeClient{cfg: cfg}
}

func (c *StripeClient) CreateCheckoutSession(_ context.Context, req dombilling.CreateCheckoutReq) (dombilling.CheckoutSession, error) {
	params := &stripe.CheckoutSessionParams{
		LineItems: []*stripe.CheckoutSessionLineItemParams{
			{
				Price:    stripe.String(req.PriceID),
				Quantity: stripe.Int64(1),
			},
		},
		Mode:       stripe.String(string(stripe.CheckoutSessionModePayment)),
		SuccessURL: stripe.String(req.SuccessURL),
		CancelURL:  stripe.String(req.CancelURL),
		Metadata: map[string]string{
			"user_id":    req.UserID.String(),
			"product_id": req.ProductID.String(),
		},
		PaymentMethodTypes: stripe.StringSlice([]string{"card", "boleto"}),
	}

	s, err := session.New(params)
	if err != nil {
		return dombilling.CheckoutSession{}, fmt.Errorf("stripe: create session: %w", err)
	}

	return dombilling.CheckoutSession{ID: s.ID, URL: s.URL}, nil
}

// ValidateWebhookSignature valida a assinatura de um webhook Stripe.
// Deve ser chamado ANTES de processar qualquer payload do webhook.
//
// SEGURANÇA: nunca processar webhook sem validar a assinatura.
func (c *StripeClient) ValidateWebhookSignature(payload []byte, signature string) (*stripe.Event, error) {
	event, err := webhook.ConstructEvent(payload, signature, c.cfg.WebhookSecret)
	if err != nil {
		return nil, fmt.Errorf("stripe: invalid webhook signature: %w", err)
	}
	return &event, nil
}

// Compile-time check
var _ dombilling.PaymentProvider = (*StripeClient)(nil)
