package identity

import (
	"context"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	infraauth "github.com/fernandofv/api/internal/infrastructure/auth"
)

// GoogleAuthUseCase autentica ou registra um usuário via Google OAuth2.
//
// FLUXO:
//  1. Busca usuário pelo google_id → login direto.
//  2. Busca pelo email (conta criada via Magic Link) → vincula google_id.
//  3. Nenhum dos dois: cria novo usuário com dados do Google (sem telefone).
//  4. Emite access token (JWT 15min) e refresh token (30d).
type GoogleAuthUseCase struct {
	userRepo    identity.UserRepository
	refreshRepo identity.RefreshTokenRepository
	tokenIssuer TokenIssuer
	clock       shared.Clock
	refreshTTL  time.Duration
}

func NewGoogleAuthUseCase(
	userRepo identity.UserRepository,
	refreshRepo identity.RefreshTokenRepository,
	tokenIssuer TokenIssuer,
	clock shared.Clock,
	refreshTTL time.Duration,
) *GoogleAuthUseCase {
	return &GoogleAuthUseCase{
		userRepo:    userRepo,
		refreshRepo: refreshRepo,
		tokenIssuer: tokenIssuer,
		clock:       clock,
		refreshTTL:  refreshTTL,
	}
}

// GoogleAuthResult contém os tokens emitidos após autenticação Google.
type GoogleAuthResult struct {
	AccessToken      string
	RefreshToken     string
	RefreshExpiresAt time.Time
	User             *identity.User
	IsNewUser        bool
}

func (uc *GoogleAuthUseCase) Execute(ctx context.Context, info *infraauth.GoogleUserInfo) (GoogleAuthResult, error) {
	now := uc.clock.Now()

	user, isNew, err := uc.findOrCreate(ctx, info, now)
	if err != nil {
		return GoogleAuthResult{}, fmt.Errorf("google auth: %w", err)
	}

	accessToken, err := uc.tokenIssuer.IssueAccessToken(user.ID(), user.Email(), user.Role())
	if err != nil {
		return GoogleAuthResult{}, fmt.Errorf("google auth: issue access token: %w", err)
	}

	rawRefresh, refreshHash, err := uc.tokenIssuer.IssueRefreshToken(user.ID())
	if err != nil {
		return GoogleAuthResult{}, fmt.Errorf("google auth: issue refresh token: %w", err)
	}

	expiresAt := now.Add(uc.refreshTTL)
	rt := identity.RefreshToken{
		ID:        shared.NewUserID().String(),
		UserID:    user.ID(),
		TokenHash: refreshHash,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}
	if err := uc.refreshRepo.Save(ctx, rt); err != nil {
		return GoogleAuthResult{}, fmt.Errorf("google auth: save refresh token: %w", err)
	}

	return GoogleAuthResult{
		AccessToken:      accessToken,
		RefreshToken:     rawRefresh,
		RefreshExpiresAt: expiresAt,
		User:             user,
		IsNewUser:        isNew,
	}, nil
}

func (uc *GoogleAuthUseCase) findOrCreate(
	ctx context.Context,
	info *infraauth.GoogleUserInfo,
	now time.Time,
) (*identity.User, bool, error) {
	// 1. Busca por google_id (login recorrente).
	user, err := uc.userRepo.FindByGoogleID(ctx, info.Sub)
	if err == nil {
		user.LinkGoogle(info.Sub, info.Picture)
		if err := uc.userRepo.Update(ctx, user); err != nil {
			return nil, false, fmt.Errorf("update google link: %w", err)
		}
		return user, false, nil
	}

	// 2. Busca por email (vincula conta existente Magic Link → Google).
	email, err := identity.NewEmail(info.Email)
	if err != nil {
		return nil, false, fmt.Errorf("email inválido do Google: %w", err)
	}

	user, err = uc.userRepo.FindByEmail(ctx, email)
	if err == nil {
		user.LinkGoogle(info.Sub, info.Picture)
		if err := uc.userRepo.Update(ctx, user); err != nil {
			return nil, false, fmt.Errorf("link google to existing user: %w", err)
		}
		return user, false, nil
	}

	// 3. Novo usuário — cria conta com dados do Google (telefone vazio).
	userID := shared.NewUserID()
	referralID := shared.ReferralID(generateShortReferralID())

	name := info.Name
	if name == "" {
		name = email.String()
	}

	newUser, _, err := identity.NewUser(
		userID,
		email,
		identity.Phone{}, // telefone opcional; usuário preenche depois
		name,
		false,
		referralID,
		now,
	)
	if err != nil {
		return nil, false, fmt.Errorf("create user from google: %w", err)
	}
	newUser.LinkGoogle(info.Sub, info.Picture)

	if err := uc.userRepo.Save(ctx, newUser); err != nil {
		return nil, false, fmt.Errorf("save google user: %w", err)
	}

	return newUser, true, nil
}
