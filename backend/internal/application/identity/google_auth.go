package identity

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	infraauth "github.com/fernandofv/api/internal/infrastructure/auth"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
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
	logger      *slog.Logger
}

// NewGoogleAuthUseCase cria o use case com logger padrão.
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
		logger:      slog.Default(),
	}
}

// WithLogger substitui o logger — chamado em main.go após o construtor.
func (uc *GoogleAuthUseCase) WithLogger(l *slog.Logger) *GoogleAuthUseCase {
	uc.logger = l
	return uc
}

// GoogleAuthResult contém os tokens emitidos após autenticação Google.
type GoogleAuthResult struct {
	AccessToken      string
	RefreshToken     string
	RefreshExpiresAt time.Time
	User             *identity.User
	IsNewUser        bool
}

// Execute autentica o usuário via Google OAuth2, logando o fluxo completo.
// O email do Google é hasheado antes de qualquer log — nunca em texto claro.
func (uc *GoogleAuthUseCase) Execute(ctx context.Context, info *infraauth.GoogleUserInfo) (GoogleAuthResult, error) {
	// Log de entrada: sub do Google é opaco (não é PII diretamente utilizável).
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "GoogleAuth",
		"request_id", middleware.RequestIDFromContext(ctx),
		"email_hash", hashEmail(info.Email),
		"google_sub_prefix", safePrefix(info.Sub, 8), // prefixo do sub para correlação sem revelar tudo
	)

	now := uc.clock.Now()

	user, isNew, err := uc.findOrCreate(ctx, info, now)
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao buscar/criar usuário Google",
			"use_case", "GoogleAuth",
			"request_id", middleware.RequestIDFromContext(ctx),
			"email_hash", hashEmail(info.Email),
			"error", err.Error(),
		)
		return GoogleAuthResult{}, fmt.Errorf("google auth: %w", err)
	}

	accessToken, err := uc.tokenIssuer.IssueAccessToken(user.ID(), user.Email(), user.Role())
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao emitir access token",
			"use_case", "GoogleAuth",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", user.ID().String(),
			"error", err.Error(),
		)
		return GoogleAuthResult{}, fmt.Errorf("google auth: issue access token: %w", err)
	}

	rawRefresh, refreshHash, err := uc.tokenIssuer.IssueRefreshToken(user.ID())
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao emitir refresh token",
			"use_case", "GoogleAuth",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", user.ID().String(),
			"error", err.Error(),
		)
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
		uc.logger.ErrorContext(ctx, "falha ao salvar refresh token",
			"use_case", "GoogleAuth",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", user.ID().String(),
			"error", err.Error(),
		)
		return GoogleAuthResult{}, fmt.Errorf("google auth: save refresh token: %w", err)
	}

	// Log de saída: confirma autenticação Google com sucesso.
	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "GoogleAuth",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", user.ID().String(),
		"is_new_user", isNew,
	)

	return GoogleAuthResult{
		AccessToken:      accessToken,
		RefreshToken:     rawRefresh,
		RefreshExpiresAt: expiresAt,
		User:             user,
		IsNewUser:        isNew,
	}, nil
}

// safePrefix retorna os primeiros n caracteres de s, ou s completo se len(s) < n.
// Usado para logar prefixos de IDs opacos sem expor o valor completo.
func safePrefix(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "..."
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
