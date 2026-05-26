// study_request_login: adaptadores que vinculam StudyRequest ao sistema de
// auth passwordless — sem duplicar lógica de magic-link ou criação de user.
//
// Os ports `LoginCodeIssuer` e `UserUpserter` são implementados aqui pra
// permitir que o CreateUseCase de StudyRequest:
//  1. Crie conta passwordless automática pro lead (UserUpserter)
//  2. Emita código de magic-link sem mandar email (LoginCodeIssuer) —
//     o código vai junto da confirmação de recebimento, evitando 2 emails.
package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// LoginCodeAdapter implementa studyrequest.LoginCodeIssuer reusando o
// MagicTokenStore (Redis) já existente. Gera token de 6 dígitos com TTL,
// armazena, e retorna o código — sem enviar email.
type LoginCodeAdapter struct {
	tokenStore identity.MagicTokenStore
	clock      shared.Clock
	tokenTTL   time.Duration
}

// NewLoginCodeAdapter cria o adapter. TTL padrão sugerido: 10 minutos
// (alinhado com o RequestMagicLinkUseCase).
func NewLoginCodeAdapter(tokenStore identity.MagicTokenStore, clock shared.Clock, tokenTTL time.Duration) *LoginCodeAdapter {
	return &LoginCodeAdapter{tokenStore: tokenStore, clock: clock, tokenTTL: tokenTTL}
}

// IssueForEmail implementa studyrequest.LoginCodeIssuer.
func (a *LoginCodeAdapter) IssueForEmail(ctx context.Context, email string) (string, error) {
	emailVO, err := identity.NewEmail(email)
	if err != nil {
		return "", fmt.Errorf("login code: email inválido: %w", err)
	}
	token, err := identity.GenerateMagicToken(a.tokenTTL, a.clock.Now())
	if err != nil {
		return "", fmt.Errorf("login code: gerar token: %w", err)
	}
	if err := a.tokenStore.Store(ctx, emailVO, token); err != nil {
		return "", fmt.Errorf("login code: armazenar token: %w", err)
	}
	return token.Value(), nil
}

// UserUpserterAdapter implementa studyrequest.UserUpserter reusando o
// identity.UserRepository. Cria conta passwordless idempotente:
//   - Email já existe → retorna o ID existente (não atualiza dados)
//   - Email não existe → cria com nome/phone do formulário + referral_id
//     aleatório, marketingConsent do formulário
//
// Phone vazio é aceito (DEFAULT ” na tabela). Telefones inválidos não
// bloqueiam — caem pro vazio (lead anônimo pode não querer dar phone).
type UserUpserterAdapter struct {
	userRepo identity.UserRepository
	clock    shared.Clock
}

func NewUserUpserterAdapter(userRepo identity.UserRepository, clock shared.Clock) *UserUpserterAdapter {
	return &UserUpserterAdapter{userRepo: userRepo, clock: clock}
}

// UpsertPasswordlessUser implementa studyrequest.UserUpserter.
func (a *UserUpserterAdapter) UpsertPasswordlessUser(ctx context.Context, email, name, phone string, marketingConsent bool) (string, bool, error) {
	emailVO, err := identity.NewEmail(email)
	if err != nil {
		return "", false, fmt.Errorf("upsert user: email inválido: %w", err)
	}

	// Já existe? Retorna o ID. Não atualiza dados (PII do form pode ser menos
	// preciso do que o que o user já cadastrou em outras interações).
	existing, err := a.userRepo.FindByEmail(ctx, emailVO)
	if err == nil {
		return existing.ID().String(), false, nil
	}
	if !errors.Is(err, shared.ErrNotFound) {
		return "", false, fmt.Errorf("upsert user: find: %w", err)
	}

	// Cria conta passwordless. Phone vazio é OK.
	phoneVO, err := identity.NewPhone(phone)
	if err != nil {
		// Phone inválido: cria sem (vazio). Não bloqueia o submit.
		phoneVO = identity.Phone{}
	}

	userID := shared.NewUserID()
	referralID := shared.ReferralID(generateShortReferralIDForUpsert())

	user, _, err := identity.NewUser(
		userID, emailVO, phoneVO, name, marketingConsent, referralID, a.clock.Now(),
	)
	if err != nil {
		return "", false, fmt.Errorf("upsert user: new: %w", err)
	}

	if err := a.userRepo.Save(ctx, user); err != nil {
		// Conflict (email duplicado) pode acontecer em race rara entre Find e Save.
		// Re-tentamos Find pra retornar ID existente.
		if errors.Is(err, shared.ErrConflict) {
			if again, findErr := a.userRepo.FindByEmail(ctx, emailVO); findErr == nil {
				return again.ID().String(), false, nil
			}
		}
		return "", false, fmt.Errorf("upsert user: save: %w", err)
	}

	return userID.String(), true, nil
}

// generateShortReferralIDForUpsert — duplica generateShortReferralID do
// pacote identity (que é unexported). Geração de ID alfanumérico de 8 chars.
// Substitua quando o pacote identity expor um helper público.
func generateShortReferralIDForUpsert() string {
	// Reutiliza UUID via shared (simples e seguro). 8 primeiros chars.
	return shared.NewUserID().String()[:8]
}
