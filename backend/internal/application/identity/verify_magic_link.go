package identity

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"math/big"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// TokenIssuer é o port de emissão de JWT.
type TokenIssuer interface {
	IssueAccessToken(userID shared.UserID, email identity.Email, role identity.Role) (string, error)
	IssueRefreshToken(userID shared.UserID) (rawToken string, hash string, err error)
}

// RegistrationData contém os dados necessários para criar um novo usuário.
type RegistrationData struct {
	Name             string
	Phone            string
	MarketingConsent bool
}

// VerifyMagicLinkCommand é o command de verificação do token.
type VerifyMagicLinkCommand struct {
	Email        string
	Token        string
	Registration *RegistrationData // nil se login (usuário já existe)
}

// VerifyMagicLinkResult contém os tokens emitidos após autenticação.
type VerifyMagicLinkResult struct {
	AccessToken      string
	RefreshToken     string // raw token (vai para cookie HttpOnly)
	RefreshExpiresAt time.Time
	User             *identity.User
	IsNewUser        bool
}

// VerifyMagicLinkUseCase autentica o usuário com o token recebido.
//
// FLUXO:
//   1. Valida formato do email.
//   2. Consome token do Redis (GETDEL — uso único, atômico).
//   3. Verifica se o token é válido e não expirado.
//   4. Busca usuário pelo email.
//   5a. Se não existe: requer RegistrationData; cria novo User.
//   5b. Se existe: faz login normal.
//   6. Emite access token (JWT 15min) e refresh token (30d).
//   7. Persiste refresh token (hash) na DB.
type VerifyMagicLinkUseCase struct {
	tokenStore      identity.MagicTokenStore
	userRepo        identity.UserRepository
	refreshRepo     identity.RefreshTokenRepository
	tokenIssuer     TokenIssuer
	clock           shared.Clock
	refreshTokenTTL time.Duration
}

func NewVerifyMagicLinkUseCase(
	tokenStore identity.MagicTokenStore,
	userRepo identity.UserRepository,
	refreshRepo identity.RefreshTokenRepository,
	tokenIssuer TokenIssuer,
	clock shared.Clock,
	refreshTokenTTL time.Duration,
) *VerifyMagicLinkUseCase {
	return &VerifyMagicLinkUseCase{
		tokenStore:      tokenStore,
		userRepo:        userRepo,
		refreshRepo:     refreshRepo,
		tokenIssuer:     tokenIssuer,
		clock:           clock,
		refreshTokenTTL: refreshTokenTTL,
	}
}

func (uc *VerifyMagicLinkUseCase) Execute(ctx context.Context, cmd VerifyMagicLinkCommand) (VerifyMagicLinkResult, error) {
	email, err := identity.NewEmail(cmd.Email)
	if err != nil {
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: %w", err)
	}

	// Consome token do Redis (atômico: GETDEL — garante uso único).
	storedToken, err := uc.tokenStore.Consume(ctx, email)
	if err != nil {
		if errors.Is(err, shared.ErrNotFound) {
			return VerifyMagicLinkResult{}, fmt.Errorf("%w: token não encontrado ou expirado", shared.ErrUnauthorized)
		}
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: consume token: %w", err)
	}

	now := uc.clock.Now()
	if storedToken.IsExpired(now) {
		return VerifyMagicLinkResult{}, fmt.Errorf("%w: token expirado", shared.ErrUnauthorized)
	}
	if !storedToken.Matches(strings.TrimSpace(cmd.Token)) {
		return VerifyMagicLinkResult{}, fmt.Errorf("%w: token inválido", shared.ErrUnauthorized)
	}

	// Busca ou cria usuário.
	user, isNew, err := uc.findOrCreate(ctx, email, cmd.Registration, now)
	if err != nil {
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: %w", err)
	}

	// Emite tokens.
	accessToken, err := uc.tokenIssuer.IssueAccessToken(user.ID(), user.Email(), user.Role())
	if err != nil {
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: issue access token: %w", err)
	}

	rawRefresh, refreshHash, err := uc.tokenIssuer.IssueRefreshToken(user.ID())
	if err != nil {
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: issue refresh token: %w", err)
	}

	expiresAt := now.Add(uc.refreshTokenTTL)
	rt := identity.RefreshToken{
		ID:        shared.NewUserID().String(),
		UserID:    user.ID(),
		TokenHash: refreshHash,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}
	if err := uc.refreshRepo.Save(ctx, rt); err != nil {
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: save refresh token: %w", err)
	}

	return VerifyMagicLinkResult{
		AccessToken:      accessToken,
		RefreshToken:     rawRefresh,
		RefreshExpiresAt: expiresAt,
		User:             user,
		IsNewUser:        isNew,
	}, nil
}

func (uc *VerifyMagicLinkUseCase) findOrCreate(
	ctx context.Context,
	email identity.Email,
	reg *RegistrationData,
	now time.Time,
) (*identity.User, bool, error) {
	existing, err := uc.userRepo.FindByEmail(ctx, email)
	if err == nil {
		return existing, false, nil
	}

	if !errors.Is(err, shared.ErrNotFound) {
		return nil, false, fmt.Errorf("find user: %w", err)
	}

	// Usuário não existe — requer dados de registro.
	if reg == nil {
		return nil, false, fmt.Errorf("%w: dados de registro obrigatórios para novo usuário", shared.ErrValidation)
	}

	phone, err := identity.NewPhone(reg.Phone)
	if err != nil {
		return nil, false, fmt.Errorf("phone inválido: %w", err)
	}

	userID := shared.NewUserID()
	referralID := shared.ReferralID(generateShortReferralID())

	user, _, err := identity.NewUser(
		userID,
		email,
		phone,
		reg.Name,
		reg.MarketingConsent,
		referralID,
		now,
	)
	if err != nil {
		return nil, false, fmt.Errorf("create user: %w", err)
	}

	if err := uc.userRepo.Save(ctx, user); err != nil {
		return nil, false, fmt.Errorf("save user: %w", err)
	}

	return user, true, nil
}

// generateShortReferralID gera um ID alfanumérico de 8 chars para referral.
// Usa crypto/rand para garantia de unicidade suficiente.
func generateShortReferralID() string {
	const chars = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, 8)
	for i := range b {
		n, err := rand.Int(rand.Reader, big.NewInt(int64(len(chars))))
		if err != nil {
			b[i] = chars[0]
			continue
		}
		b[i] = chars[n.Int64()]
	}
	return string(b)
}
