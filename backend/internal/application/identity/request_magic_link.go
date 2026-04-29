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
	"errors"
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

// RequestMagicLinkCommand é o command de solicitação de magic link.
// Aceita apenas email — telefone é coletado em /auth/verify para novos usuários.
type RequestMagicLinkCommand struct {
	Email string
}

// RequestMagicLinkUseCase orquestra o envio de token de login por email.
//
// FLUXO:
//  1. Valida email (VO).
//  2. Verifica rate-limit (5 tentativas/10min por email).
//  3. Verifica se o email já tem conta (para informar o frontend: novo ou retornante).
//  4. Gera token de 6 dígitos (crypto/rand).
//  5. Armazena em Redis com TTL 10min.
//  6. Envia email (Resend).
//
// Novo usuário: IsNewUser=true → frontend exibe campos de nome/telefone junto com o código.
// Usuário retornante: IsNewUser=false → frontend exibe apenas o campo de código.
type RequestMagicLinkUseCase struct {
	tokenStore  identity.MagicTokenStore
	userRepo    identity.UserRepository // consulta se o email já tem conta
	emailer     EmailSender
	clock       shared.Clock
	tokenTTL    time.Duration
	maxAttempts int64
	logger      *slog.Logger
	devMode     bool
}

// NewRequestMagicLinkUseCase cria o use case injetando o logger para rastreabilidade.
// O logger é usado para registrar entrada, saída e erros com request_id correlacionado.
func NewRequestMagicLinkUseCase(
	tokenStore identity.MagicTokenStore,
	userRepo identity.UserRepository,
	emailer EmailSender,
	clock shared.Clock,
	tokenTTL time.Duration,
	maxAttempts int64,
	devMode bool,
) *RequestMagicLinkUseCase {
	return &RequestMagicLinkUseCase{
		tokenStore:  tokenStore,
		userRepo:    userRepo,
		emailer:     emailer,
		clock:       clock,
		tokenTTL:    tokenTTL,
		maxAttempts: maxAttempts,
		logger:      slog.Default(),
		devMode:     devMode,
	}
}

// WithLogger substitui o logger padrão — usado em main.go para injetar o logger configurado.
func (uc *RequestMagicLinkUseCase) WithLogger(l *slog.Logger) *RequestMagicLinkUseCase {
	uc.logger = l
	return uc
}

// RequestMagicLinkResult é o resultado do use case de solicitação de magic link.
type RequestMagicLinkResult struct {
	ExpiresIn time.Duration
	// IsNewUser informa se o email não tem conta cadastrada.
	// O frontend usa este campo para exibir os campos de cadastro (nome, telefone)
	// junto com o campo de código, poupando uma tela extra para novos usuários.
	IsNewUser bool
}

// Execute orquestra o envio do magic link, logando cada etapa.
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

	// Verifica se o email já tem conta cadastrada.
	// Resultado usado pelo frontend para exibir ou não os campos de registro.
	// Falha não-crítica: se o DB estiver lento, envia o token normalmente.
	isNewUser := false
	if _, findErr := uc.userRepo.FindByEmail(ctx, email); errors.Is(findErr, shared.ErrNotFound) {
		isNewUser = true
	} else if findErr != nil {
		uc.logger.WarnContext(ctx, "falha ao verificar existência do usuário (não crítico — token será enviado mesmo assim)",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", findErr.Error(),
		)
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

	// Em dev, loga o token para facilitar testes sem abrir o MailHog.
	if uc.devMode {
		uc.logger.InfoContext(ctx, "DEV MODE — token gerado",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"email_hash", hashEmail(cmd.Email),
			"token", token.Value(),
			"hint", "verifique o email no MailHog (localhost:8025) ou use 000000 como bypass",
		)
	}

	if err := uc.emailer.SendMagicLink(ctx, email, token.Value(), uc.tokenTTL); err != nil {
		uc.logger.ErrorContext(ctx, "falha ao enviar email",
			"use_case", "RequestMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return RequestMagicLinkResult{}, fmt.Errorf("request magic link: send email: %w", err)
	}

	// Log de saída: confirma que o token foi enviado com sucesso.
	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "RequestMagicLink",
		"request_id", middleware.RequestIDFromContext(ctx),
		"email_hash", hashEmail(cmd.Email),
		"expires_in", uc.tokenTTL.String(),
		"is_new_user", isNewUser,
	)
	return RequestMagicLinkResult{ExpiresIn: uc.tokenTTL, IsNewUser: isNewUser}, nil
}
