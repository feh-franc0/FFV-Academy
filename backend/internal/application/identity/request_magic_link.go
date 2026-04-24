// Package identity contém os use cases do bounded context Identity & Access.
//
// PADRÕES:
//   - Application Layer: orquestra domain objects e ports; sem lógica de negócio.
//   - Command pattern: cada UC tem struct de Command e método Execute(ctx, cmd).
//   - SRP: cada arquivo é um único use case.
//   - TDD: cada UC é testado com mocks dos ports (gomock).
package identity

import (
	"context"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// EmailSender é o port de envio de email.
type EmailSender interface {
	SendMagicLink(ctx context.Context, to identity.Email, token string, expiresIn time.Duration) error
}

// SMSSender é o port de envio de SMS.
type SMSSender interface {
	SendMagicToken(ctx context.Context, to identity.Phone, token string) error
}

// RequestMagicLinkCommand é o command de solicitação de magic link.
type RequestMagicLinkCommand struct {
	Email string
	Phone string
}

// RequestMagicLinkUseCase orquestra o envio de token de login.
//
// FLUXO:
//   1. Valida email e phone (VOs).
//   2. Verifica rate-limit (5 tentativas/10min por email).
//   3. Gera token de 6 dígitos (crypto/rand).
//   4. Armazena em Redis com TTL 10min.
//   5. Envia email (Resend) e SMS (Twilio) em paralelo.
//
// POR QUÊ paralelo: latência de email+SMS em série seria > 2s; em paralelo < 1s.
type RequestMagicLinkUseCase struct {
	tokenStore identity.MagicTokenStore
	emailer    EmailSender
	sms        SMSSender
	clock      shared.Clock
	tokenTTL   time.Duration
	maxAttempts int64
}

func NewRequestMagicLinkUseCase(
	tokenStore identity.MagicTokenStore,
	emailer EmailSender,
	sms SMSSender,
	clock shared.Clock,
	tokenTTL time.Duration,
	maxAttempts int64,
) *RequestMagicLinkUseCase {
	return &RequestMagicLinkUseCase{
		tokenStore:  tokenStore,
		emailer:     emailer,
		sms:         sms,
		clock:       clock,
		tokenTTL:    tokenTTL,
		maxAttempts: maxAttempts,
	}
}

type RequestMagicLinkResult struct {
	ExpiresIn time.Duration
}

func (uc *RequestMagicLinkUseCase) Execute(ctx context.Context, cmd RequestMagicLinkCommand) (RequestMagicLinkResult, error) {
	email, err := identity.NewEmail(cmd.Email)
	if err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: %w", err)
	}

	phone, err := identity.NewPhone(cmd.Phone)
	if err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: %w", err)
	}

	// Verifica rate limit antes de gerar token.
	attempts, err := uc.tokenStore.GetAttempts(ctx, email)
	if err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: check attempts: %w", err)
	}
	if attempts >= uc.maxAttempts {
		return RequestMagicLinkResult{}, shared.ErrRateLimited
	}

	now := uc.clock.Now()
	token, err := identity.GenerateMagicToken(uc.tokenTTL, now)
	if err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: generate token: %w", err)
	}

	if err := uc.tokenStore.Store(ctx, email, token); err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: store token: %w", err)
	}
	if _, err := uc.tokenStore.IncrAttempts(ctx, email); err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: incr attempts: %w", err)
	}

	// Envia email e SMS em paralelo para minimizar latência.
	type result struct{ err error }
	emailCh := make(chan result, 1)
	smsCh := make(chan result, 1)

	go func() {
		emailCh <- result{err: uc.emailer.SendMagicLink(ctx, email, token.Value(), uc.tokenTTL)}
	}()
	go func() {
		smsCh <- result{err: uc.sms.SendMagicToken(ctx, phone, token.Value())}
	}()

	emailRes := <-emailCh
	smsRes := <-smsCh

	if emailRes.err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: send email: %w", emailRes.err)
	}
	if smsRes.err != nil {
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: send sms: %w", smsRes.err)
	}

	return RequestMagicLinkResult{ExpiresIn: uc.tokenTTL}, nil
}
