// Package billing contém os use cases de monetização.
package billing

import (
	"context"
	"errors"
	"fmt"

	dombilling "github.com/fernandofv/api/internal/domain/billing"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// CreateCheckoutUseCase cria uma sessão de checkout no Stripe.
type CreateCheckoutUseCase struct {
	purchaseRepo    dombilling.PurchaseRepository
	paymentProvider dombilling.PaymentProvider
	productCatalog  dombilling.ProductCatalog
	userRepo        domidentity.UserRepository
	clock           shared.Clock
	successURL      string
	cancelURL       string
}

func NewCreateCheckoutUseCase(
	purchaseRepo dombilling.PurchaseRepository,
	paymentProvider dombilling.PaymentProvider,
	productCatalog dombilling.ProductCatalog,
	userRepo domidentity.UserRepository,
	clock shared.Clock,
	successURL, cancelURL string,
) *CreateCheckoutUseCase {
	return &CreateCheckoutUseCase{
		purchaseRepo:    purchaseRepo,
		paymentProvider: paymentProvider,
		productCatalog:  productCatalog,
		userRepo:        userRepo,
		clock:           clock,
		successURL:      successURL,
		cancelURL:       cancelURL,
	}
}

type CreateCheckoutCommand struct {
	UserID    shared.UserID
	ProductID shared.ProductID
}

type CreateCheckoutResult struct {
	CheckoutURL string
	SessionID   string
}

func (uc *CreateCheckoutUseCase) Execute(ctx context.Context, cmd CreateCheckoutCommand) (CreateCheckoutResult, error) {
	// Verifica se o usuário já possui o produto.
	user, err := uc.userRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		return CreateCheckoutResult{}, fmt.Errorf("create checkout: find user: %w", err)
	}
	if user.HasProduct(cmd.ProductID) {
		return CreateCheckoutResult{}, fmt.Errorf("%w: usuário já possui o produto %s", shared.ErrConflict, cmd.ProductID)
	}

	priceID, err := uc.productCatalog.GetStripePriceID(cmd.ProductID)
	if err != nil {
		return CreateCheckoutResult{}, fmt.Errorf("create checkout: get price: %w", err)
	}

	session, err := uc.paymentProvider.CreateCheckoutSession(ctx, dombilling.CreateCheckoutReq{
		UserID:     cmd.UserID,
		ProductID:  cmd.ProductID,
		PriceID:    priceID,
		SuccessURL: uc.successURL,
		CancelURL:  uc.cancelURL,
	})
	if err != nil {
		return CreateCheckoutResult{}, fmt.Errorf("create checkout: create session: %w", err)
	}

	amountCents, err := uc.productCatalog.GetAmountCents(cmd.ProductID)
	if err != nil {
		return CreateCheckoutResult{}, fmt.Errorf("create checkout: get amount: %w", err)
	}

	purchase := dombilling.NewPurchase(
		shared.NewPurchaseID(),
		cmd.UserID,
		cmd.ProductID,
		amountCents,
		session.ID,
		uc.clock.Now(),
	)
	if err := uc.purchaseRepo.Save(ctx, purchase); err != nil {
		return CreateCheckoutResult{}, fmt.Errorf("create checkout: save purchase: %w", err)
	}

	return CreateCheckoutResult{CheckoutURL: session.URL, SessionID: session.ID}, nil
}

// HandleStripeWebhookUseCase processa eventos do Stripe de forma idempotente.
//
// IDEMPOTÊNCIA: usa tabela stripe_events para não processar o mesmo evento duas vezes.
// SEGURANÇA: a assinatura do webhook é validada NO HANDLER antes de chegar aqui.
type HandleStripeWebhookUseCase struct {
	purchaseRepo    dombilling.PurchaseRepository
	stripeEventRepo dombilling.StripeEventRepository
	userRepo        domidentity.UserRepository
	clock           shared.Clock
}

func NewHandleStripeWebhookUseCase(
	purchaseRepo dombilling.PurchaseRepository,
	stripeEventRepo dombilling.StripeEventRepository,
	userRepo domidentity.UserRepository,
	clock shared.Clock,
) *HandleStripeWebhookUseCase {
	return &HandleStripeWebhookUseCase{
		purchaseRepo:    purchaseRepo,
		stripeEventRepo: stripeEventRepo,
		userRepo:        userRepo,
		clock:           clock,
	}
}

type StripeWebhookEvent struct {
	ID              string
	Type            string
	SessionID       string
	PaymentIntentID string
}

func (uc *HandleStripeWebhookUseCase) Execute(ctx context.Context, event StripeWebhookEvent) error {
	// Claim atômico: INSERT ON CONFLICT garante exclusão mútua mesmo em retry
	// concorrente. Se falhar o side-effect, fazemos Unclaim para permitir retry.
	claimed, err := uc.stripeEventRepo.Claim(ctx, event.ID)
	if err != nil {
		return fmt.Errorf("stripe webhook: claim: %w", err)
	}
	if !claimed {
		return nil // outro processo já está tratando ou já processou
	}

	// Executa side-effects. Unclaim em caso de falha para não deixar zumbi.
	if err := uc.dispatch(ctx, event); err != nil {
		if uerr := uc.stripeEventRepo.Unclaim(ctx, event.ID); uerr != nil {
			// Falha ao liberar claim é grave: o evento ficará "zombie" até reset manual.
			// Logar e retornar o erro original para Stripe retentar.
			return fmt.Errorf("stripe webhook: %w (unclaim also failed: %v)", err, uerr)
		}
		return err
	}

	// Sucesso: consolida o claim como "processed" (idempotente).
	if err := uc.stripeEventRepo.MarkProcessed(ctx, event.ID); err != nil {
		return fmt.Errorf("stripe webhook: mark processed: %w", err)
	}
	return nil
}

func (uc *HandleStripeWebhookUseCase) dispatch(ctx context.Context, event StripeWebhookEvent) error {
	switch event.Type {
	case "checkout.session.completed":
		return uc.handleCheckoutCompleted(ctx, event)
	default:
		// Eventos não tratados são ignorados silenciosamente.
		return nil
	}
}

func (uc *HandleStripeWebhookUseCase) handleCheckoutCompleted(ctx context.Context, event StripeWebhookEvent) error {
	purchase, err := uc.purchaseRepo.FindByStripeSession(ctx, event.SessionID)
	if err != nil {
		if errors.Is(err, shared.ErrNotFound) {
			// Sessão não encontrada — pode ser de outro sistema.
			return nil
		}
		return fmt.Errorf("stripe webhook: find purchase: %w", err)
	}

	now := uc.clock.Now()
	if err := purchase.MarkPaid(event.PaymentIntentID, now); err != nil {
		return fmt.Errorf("stripe webhook: mark paid: %w", err)
	}
	if err := uc.purchaseRepo.Update(ctx, purchase); err != nil {
		return fmt.Errorf("stripe webhook: update purchase: %w", err)
	}

	// Concede o produto ao usuário.
	user, err := uc.userRepo.FindByID(ctx, purchase.UserID())
	if err != nil {
		return fmt.Errorf("stripe webhook: find user: %w", err)
	}
	user.GrantProduct(purchase.ProductID(), purchase.ID(), now)
	if err := uc.userRepo.Update(ctx, user); err != nil {
		return fmt.Errorf("stripe webhook: grant product: %w", err)
	}

	return nil
}
