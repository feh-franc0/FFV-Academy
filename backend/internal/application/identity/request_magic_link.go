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
	"crypto/sha256"
	"fmt"
	"log/slog"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// hashEmail gera um hash SHA-256 truncado do email para logging seguro.
// NUNCA logar email em texto claro — esta função garante que o log seja
// rastreável (mesmo hash para o mesmo email) mas não revele PII.
func hashEmail(email string) string {
	h := sha256.Sum256([]byte(email))
	// Retorna apenas os primeiros 16 chars do hex — suficiente para correlação, curto para o log.
	return fmt.Sprintf("%x", h[:8])
}

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
	tokenStore  identity.MagicTokenStore
	emailer     EmailSender
	sms         SMSSender
	clock       shared.Clock
	tokenTTL    time.Duration
	maxAttempts int64
	logger      *slog.Logger
}

// NewRequestMagicLinkUseCase cria o use case injetando o logger para rastreabilidade.
// O logger é usado para registrar entrada, saída e erros com request_id correlacionado.
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
		logger:      slog.Default(),
	}
}

// WithLogger substitui o logger padrão — usado em main.go para injetar o logger configurado.
func (uc *RequestMagicLinkUseCase) WithLogger(l *slog.Logger) *RequestMagicLinkUseCase {
	uc.logger = l
	return uc
}

type RequestMagicLinkResult struct {
	ExpiresIn time.Duration
}

// Execute orquestra o envio do magic link, logando entrada, saída e erros.
// O email é sempre hasheado antes de logar — nunca em texto claro.
func (uc *RequestMagicLinkUseCase) Execute(ctx context.Context, cmd RequestMagicLinkCommand) (RequestMagicLinkResult, error) {
	// Log de entrada: request_id correlaciona este log com o request HTTP.
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "RequestMagicLink",
		"request_id", middleware.RequestIDFromContext(ctx),
		"email_hash", hashEmail(cmd.Email),
	)

	email, err := identity.NewEmail(cmd.Email)
	if err != nil {
		uc.logger.WarnContext(ctx, "email inválido",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: %w", err)
	}

	phone, err := identity.NewPhone(cmd.Phone)
	if err != nil {
		uc.logger.WarnContext(ctx, "telefone inválido",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: %w", err)
	}

	// Verifica rate limit antes de gerar token.
	attempts, err := uc.tokenStore.GetAttempts(ctx, email)
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao verificar rate limit",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: check attempts: %w", err)
	}
	if attempts >= uc.maxAttempts {
		uc.logger.WarnContext(ctx, "rate limit atingido",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"email_hash", hashEmail(cmd.Email),
			"attempts", attempts,
		)
		return RequestMagicLinkResult{}, shared.ErrRateLimited
	}

	now := uc.clock.Now()
	token, err := identity.GenerateMagicToken(uc.tokenTTL, now)
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao gerar token",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: generate token: %w", err)
	}

	if err := uc.tokenStore.Store(ctx, email, token); err != nil {
		uc.logger.ErrorContext(ctx, "falha ao armazenar token",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: store token: %w", err)
	}
	if _, err := uc.tokenStore.IncrAttempts(ctx, email); err != nil {
		uc.logger.ErrorContext(ctx, "falha ao incrementar tentativas",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
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
		uc.logger.ErrorContext(ctx, "falha ao enviar email",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", emailRes.err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: send email: %w", emailRes.err)
	}
	if smsRes.err != nil {
		uc.logger.ErrorContext(ctx, "falha ao enviar SMS",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", smsRes.err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: send sms: %w", smsRes.err)
	}

	// Log de saída: confirma que o token foi enviado com sucesso.
	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "RequestMagicLink",
		"request_id", middleware.RequestIDFromContext(ctx),
		"email_hash", hashEmail(cmd.Email),
		"expires_in", uc.tokenTTL.String(),
	)
	return RequestMagicLinkResult{ExpiresIn: uc.tokenTTL}, nil
}
