package identity

import (
	"context"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// GetProfileUseCase retorna o perfil do usuário autenticado.
type GetProfileUseCase struct {
	userRepo identity.UserRepository
}

func NewGetProfileUseCase(userRepo identity.UserRepository) *GetProfileUseCase {
	return &GetProfileUseCase{userRepo: userRepo}
}

func (uc *GetProfileUseCase) Execute(ctx context.Context, userID shared.UserID) (*identity.User, error) {
	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		return nil, fmt.Errorf("get profile: %w", err)
	}
	return user, nil
}

// UpdateProfileCommand é o command de atualização de perfil.
type UpdateProfileCommand struct {
	UserID           shared.UserID
	Name             string
	Phone            string
	MarketingConsent *bool // ponteiro: nil = não alterar
}

// UpdateProfileUseCase atualiza o perfil do usuário.
type UpdateProfileUseCase struct {
	userRepo identity.UserRepository
}

func NewUpdateProfileUseCase(userRepo identity.UserRepository) *UpdateProfileUseCase {
	return &UpdateProfileUseCase{userRepo: userRepo}
}

func (uc *UpdateProfileUseCase) Execute(ctx context.Context, cmd UpdateProfileCommand) (*identity.User, error) {
	user, err := uc.userRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		return nil, fmt.Errorf("update profile: find user: %w", err)
	}

	phone := user.Phone()
	if cmd.Phone != "" {
		phone, err = identity.NewPhone(cmd.Phone)
		if err != nil {
			return nil, fmt.Errorf("update profile: %w", err)
		}
	}
	name := user.Name()
	if cmd.Name != "" {
		name = cmd.Name
	}
	if err := user.UpdateProfile(name, phone); err != nil {
		return nil, fmt.Errorf("update profile: %w", err)
	}

	if cmd.MarketingConsent != nil {
		user.UpdateMarketingConsent(*cmd.MarketingConsent)
	}

	if err := uc.userRepo.Update(ctx, user); err != nil {
		return nil, fmt.Errorf("update profile: save: %w", err)
	}

	return user, nil
}

// DeleteAccountUseCase deleta (soft) a conta do usuário — LGPD.
type DeleteAccountUseCase struct {
	userRepo    identity.UserRepository
	refreshRepo identity.RefreshTokenRepository
	clock       shared.Clock
}

func NewDeleteAccountUseCase(
	userRepo identity.UserRepository,
	refreshRepo identity.RefreshTokenRepository,
	clock shared.Clock,
) *DeleteAccountUseCase {
	return &DeleteAccountUseCase{userRepo: userRepo, refreshRepo: refreshRepo, clock: clock}
}

func (uc *DeleteAccountUseCase) Execute(ctx context.Context, userID shared.UserID) error {
	now := uc.clock.Now()
	if err := uc.userRepo.SoftDelete(ctx, userID, now); err != nil {
		return fmt.Errorf("delete account: %w", err)
	}
	if err := uc.refreshRepo.RevokeAllForUser(ctx, userID); err != nil {
		return fmt.Errorf("delete account: revoke tokens: %w", err)
	}
	return nil
}

// LogoutUseCase revoga o refresh token atual.
type LogoutUseCase struct {
	refreshRepo identity.RefreshTokenRepository
}

func NewLogoutUseCase(refreshRepo identity.RefreshTokenRepository) *LogoutUseCase {
	return &LogoutUseCase{refreshRepo: refreshRepo}
}

func (uc *LogoutUseCase) Execute(ctx context.Context, userID shared.UserID, tokenHash string) error {
	if err := uc.refreshRepo.Revoke(ctx, userID, tokenHash); err != nil {
		return fmt.Errorf("logout: %w", err)
	}
	return nil
}

// RefreshTokenUseCase emite novos tokens usando um refresh token válido.
type RefreshTokenUseCase struct {
	refreshRepo identity.RefreshTokenRepository
	userRepo    identity.UserRepository
	tokenIssuer TokenIssuer
	clock       shared.Clock
	refreshTTL  time.Duration
}

func NewRefreshTokenUseCase(
	refreshRepo identity.RefreshTokenRepository,
	userRepo identity.UserRepository,
	tokenIssuer TokenIssuer,
	clock shared.Clock,
	refreshTTL time.Duration,
) *RefreshTokenUseCase {
	return &RefreshTokenUseCase{
		refreshRepo: refreshRepo,
		userRepo:    userRepo,
		tokenIssuer: tokenIssuer,
		clock:       clock,
		refreshTTL:  refreshTTL,
	}
}

type RefreshTokenResult struct {
	AccessToken      string
	RefreshToken     string
	RefreshExpiresAt time.Time
}

func (uc *RefreshTokenUseCase) Execute(ctx context.Context, tokenHash string) (RefreshTokenResult, error) {
	rt, err := uc.refreshRepo.FindByHash(ctx, tokenHash)
	if err != nil {
		return RefreshTokenResult{}, fmt.Errorf("%w: refresh token inválido", shared.ErrUnauthorized)
	}

	now := uc.clock.Now()
	if !rt.IsValid(now) {
		return RefreshTokenResult{}, fmt.Errorf("%w: refresh token expirado ou revogado", shared.ErrUnauthorized)
	}

	user, err := uc.userRepo.FindByID(ctx, rt.UserID)
	if err != nil {
		return RefreshTokenResult{}, fmt.Errorf("refresh token: find user: %w", err)
	}

	// Rotaciona: revoga o atual e emite novos.
	if err := uc.refreshRepo.Revoke(ctx, rt.UserID, tokenHash); err != nil {
		return RefreshTokenResult{}, fmt.Errorf("refresh token: revoke old: %w", err)
	}

	accessToken, err := uc.tokenIssuer.IssueAccessToken(user.ID(), user.Email(), user.Role())
	if err != nil {
		return RefreshTokenResult{}, fmt.Errorf("refresh token: issue access: %w", err)
	}

	rawRefresh, newHash, err := uc.tokenIssuer.IssueRefreshToken(user.ID())
	if err != nil {
		return RefreshTokenResult{}, fmt.Errorf("refresh token: issue refresh: %w", err)
	}

	expiresAt := now.Add(uc.refreshTTL)
	newRT := identity.RefreshToken{
		ID:        shared.NewUserID().String(),
		UserID:    user.ID(),
		TokenHash: newHash,
		ExpiresAt: expiresAt,
		CreatedAt: now,
	}
	if err := uc.refreshRepo.Save(ctx, newRT); err != nil {
		return RefreshTokenResult{}, fmt.Errorf("refresh token: save new: %w", err)
	}

	return RefreshTokenResult{
		AccessToken:      accessToken,
		RefreshToken:     rawRefresh,
		RefreshExpiresAt: expiresAt,
	}, nil
}
