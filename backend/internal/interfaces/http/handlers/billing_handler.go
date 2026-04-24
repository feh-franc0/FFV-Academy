package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/stripe/stripe-go/v82"
	appbilling "github.com/fernandofv/api/internal/application/billing"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// WebhookValidator valida a assinatura de webhooks do Stripe.
type WebhookValidator interface {
	ValidateWebhookSignature(payload []byte, signature string) (*stripe.Event, error)
}

// BillingHandler expõe os endpoints de pagamento.
//
// PADRÃO: webhook idempotente via stripe_events table.
// Segurança: valida assinatura do Stripe antes de processar.
type BillingHandler struct {
	createCheckout   *appbilling.CreateCheckoutUseCase
	handleWebhook    *appbilling.HandleStripeWebhookUseCase
	webhookValidator WebhookValidator
}

func NewBillingHandler(
	checkout *appbilling.CreateCheckoutUseCase,
	webhook *appbilling.HandleStripeWebhookUseCase,
	validator WebhookValidator,
) *BillingHandler {
	return &BillingHandler{
		createCheckout:   checkout,
		handleWebhook:    webhook,
		webhookValidator: validator,
	}
}

// CreateCheckout cria uma sessão de checkout no Stripe.
// POST /api/v1/billing/checkout
func (h *BillingHandler) CreateCheckout(w http.ResponseWriter, r *http.Request) {
	var req struct {
		ProductID string `json:"productId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		WriteError(w, http.StatusBadRequest, "corpo inválido", "bad-request")
		return
	}

	userID := middleware.UserIDFromContext(r.Context())
	cmd := appbilling.CreateCheckoutCommand{
		UserID:    userID,
		ProductID: shared.ProductID(req.ProductID),
	}

	result, err := h.createCheckout.Execute(r.Context(), cmd)
	if err != nil {
		HandleDomainError(w, err)
		return
	}

	WriteJSON(w, http.StatusCreated, map[string]string{
		"checkoutUrl": result.CheckoutURL,
		"sessionId":   result.SessionID,
	})
}

// StripeWebhook recebe e processa os eventos do Stripe.
// POST /api/v1/webhooks/stripe
func (h *BillingHandler) StripeWebhook(w http.ResponseWriter, r *http.Request) {
	body, err := io.ReadAll(io.LimitReader(r.Body, 1<<20)) // 1MB max
	if err != nil {
		WriteError(w, http.StatusBadRequest, "erro ao ler body", "bad-request")
		return
	}

	sig := r.Header.Get("Stripe-Signature")
	event, err := h.webhookValidator.ValidateWebhookSignature(body, sig)
	if err != nil {
		WriteError(w, http.StatusUnauthorized, "assinatura inválida", "invalid-signature")
		return
	}

	// Extrai os dados relevantes do evento do Stripe.
	webhookEvent, err := extractWebhookEvent(event)
	if err != nil {
		WriteError(w, http.StatusBadRequest, "evento inválido", "bad-request")
		return
	}

	if err := h.handleWebhook.Execute(r.Context(), webhookEvent); err != nil {
		HandleDomainError(w, err)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func extractWebhookEvent(e *stripe.Event) (appbilling.StripeWebhookEvent, error) {
	evt := appbilling.StripeWebhookEvent{
		ID:   e.ID,
		Type: string(e.Type),
	}

	// Extrai sessionID para checkout.session.completed.
	if e.Type == "checkout.session.completed" {
		var session stripe.CheckoutSession
		if err := session.UnmarshalJSON(e.Data.Raw); err != nil {
			return evt, fmt.Errorf("unmarshal session: %w", err)
		}
		evt.SessionID = session.ID
		if session.PaymentIntent != nil {
			evt.PaymentIntentID = session.PaymentIntent.ID
		}
	}

	return evt, nil
}
