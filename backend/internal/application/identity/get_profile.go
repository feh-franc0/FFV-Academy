package identity

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
)

// GetProfileUseCase retorna o perfil do usuário autenticado.
type GetProfileUseCase struct {
	userRepo identity.UserRepository
	logger   *slog.Logger
}

// NewGetProfileUseCase cria o use case com logger padrão.
func NewGetProfileUseCase(userRepo identity.UserRepository) *GetProfileUseCase {
	return &GetProfileUseCase{userRepo: userRepo, logger: slog.Default()}
}

// WithLogger substitui o logger — chamado em main.go após o construtor.
func (uc *GetProfileUseCase) WithLogger(l *slog.Logger) *GetProfileUseCase {
	uc.logger = l
	return uc
}

func (uc *GetProfileUseCase) Execute(ctx context.Context, userID shared.UserID) (*identity.User, error) {
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "GetProfile",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)

	user, err := uc.userRepo.FindByID(ctx, userID)
	if err != nil {
		uc.logger.WarnContext(ctx, "usuário não encontrado",
			"use_case", "GetProfile",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", userID.String(),
			"error", err.Error(),
		)
		return nil, fmt.Errorf("get profile: %w", err)
	}

	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "GetProfile",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)
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
	logger   *slog.Logger
}

// NewUpdateProfileUseCase cria o use case com logger padrão.
func NewUpdateProfileUseCase(userRepo identity.UserRepository) *UpdateProfileUseCase {
	return &UpdateProfileUseCase{userRepo: userRepo, logger: slog.Default()}
}

// WithLogger substitui o logger — chamado em main.go após o construtor.
func (uc *UpdateProfileUseCase) WithLogger(l *slog.Logger) *UpdateProfileUseCase {
	uc.logger = l
	return uc
}

func (uc *UpdateProfileUseCase) Execute(ctx context.Context, cmd UpdateProfileCommand) (*identity.User, error) {
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "UpdateProfile",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", cmd.UserID.String(),
	)

	user, err := uc.userRepo.FindByID(ctx, cmd.UserID)
	if err != nil {
		uc.logger.WarnContext(ctx, "usuário não encontrado",
			"use_case", "UpdateProfile",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", cmd.UserID.String(),
			"error", err.Error(),
		)
		return nil, fmt.Errorf("update profile: find user: %w", err)
	}

	phone := user.Phone()
	if cmd.Phone != "" {
		phone, err = identity.NewPhone(cmd.Phone)
		if err != nil {
			uc.logger.WarnContext(ctx, "telefone inválido",
				"use_case", "UpdateProfile",
				"request_id", middleware.RequestIDFromContext(ctx),
				"user_id", cmd.UserID.String(),
				"error", err.Error(),
			)
			return nil, fmt.Errorf("update profile: %w", err)
		}
	}
	name := user.Name()
	if cmd.Name != "" {
		name = cmd.Name
	}
	if err := user.UpdateProfile(name, phone); err != nil {
		uc.logger.WarnContext(ctx, "falha ao atualizar perfil (validação de domínio)",
			"use_case", "UpdateProfile",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", cmd.UserID.String(),
			"error", err.Error(),
		)
		return nil, fmt.Errorf("update profile: %w", err)
	}

	if cmd.MarketingConsent != nil {
		user.UpdateMarketingConsent(*cmd.MarketingConsent)
	}

	if err := uc.userRepo.Update(ctx, user); err != nil {
		uc.logger.ErrorContext(ctx, "falha ao salvar perfil",
			"use_case", "UpdateProfile",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", cmd.UserID.String(),
			"error", err.Error(),
		)
		return nil, fmt.Errorf("update profile: save: %w", err)
	}

	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "UpdateProfile",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", cmd.UserID.String(),
	)
	return user, nil
}

// DeleteAccountUseCase deleta (soft) a conta do usuário — LGPD.
type DeleteAccountUseCase struct {
	userRepo    identity.UserRepository
	refreshRepo identity.RefreshTokenRepository
	clock       shared.Clock
	logger      *slog.Logger
}

// NewDeleteAccountUseCase cria o use case com logger padrão.
func NewDeleteAccountUseCase(
	userRepo identity.UserRepository,
	refreshRepo identity.RefreshTokenRepository,
	clock shared.Clock,
) *DeleteAccountUseCase {
	return &DeleteAccountUseCase{userRepo: userRepo, refreshRepo: refreshRepo, clock: clock, logger: slog.Default()}
}

// WithLogger substitui o logger — chamado em main.go após o construtor.
func (uc *DeleteAccountUseCase) WithLogger(l *slog.Logger) *DeleteAccountUseCase {
	uc.logger = l
	return uc
}

func (uc *DeleteAccountUseCase) Execute(ctx context.Context, userID shared.UserID) error {
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "DeleteAccount",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)

	now := uc.clock.Now()
	if err := uc.userRepo.SoftDelete(ctx, userID, now); err != nil {
		uc.logger.ErrorContext(ctx, "falha ao deletar conta",
			"use_case", "DeleteAccount",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", userID.String(),
			"error", err.Error(),
		)
		return fmt.Errorf("delete account: %w", err)
	}
	if err := uc.refreshRepo.RevokeAllForUser(ctx, userID); err != nil {
		uc.logger.ErrorContext(ctx, "falha ao revogar tokens",
			"use_case", "DeleteAccount",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", userID.String(),
			"error", err.Error(),
		)
		return fmt.Errorf("delete account: revoke tokens: %w", err)
	}

	uc.logger.InfoContext(ctx, "use case concluído — conta deletada",
		"use_case", "DeleteAccount",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)
	return nil
}

// LogoutUseCase revoga o refresh token atual (sessão única).
// Logout é best-effort: erros são logados mas não propagados ao usuário.
type LogoutUseCase struct {
	refreshRepo identity.RefreshTokenRepository
	logger      *slog.Logger
}

// NewLogoutUseCase cria o use case com logger padrão.
func NewLogoutUseCase(refreshRepo identity.RefreshTokenRepository) *LogoutUseCase {
	return &LogoutUseCase{refreshRepo: refreshRepo, logger: slog.Default()}
}

// WithLogger substitui o logger — chamado em main.go após o construtor.
func (uc *LogoutUseCase) WithLogger(l *slog.Logger) *LogoutUseCase {
	uc.logger = l
	return uc
}

func (uc *LogoutUseCase) Execute(ctx context.Context, userID shared.UserID, tokenHash string) error {
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "Logout",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)

	if err := uc.refreshRepo.Revoke(ctx, userID, tokenHash); err != nil {
		// Logout é best-effort: token pode não existir (já expirado, já revogado).
		// Logamos como Warn (não Error) pois não impede a experiência do usuário.
		uc.logger.WarnContext(ctx, "falha ao revogar token (best-effort)",
			"use_case", "Logout",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", userID.String(),
			"error", err.Error(),
		)
		return fmt.Errorf("logout: %w", err)
	}

	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "Logout",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)
	return nil
}

// LogoutAllUseCase revoga todos os refresh tokens do usuário (logout global / todos os dispositivos).
type LogoutAllUseCase struct {
	refreshRepo identity.RefreshTokenRepository
	logger      *slog.Logger
}

// NewLogoutAllUseCase cria o use case com logger padrão.
func NewLogoutAllUseCase(refreshRepo identity.RefreshTokenRepository) *LogoutAllUseCase {
	return &LogoutAllUseCase{refreshRepo: refreshRepo, logger: slog.Default()}
}

// WithLogger substitui o logger — chamado em main.go após o construtor.
func (uc *LogoutAllUseCase) WithLogger(l *slog.Logger) *LogoutAllUseCase {
	uc.logger = l
	return uc
}

func (uc *LogoutAllUseCase) Execute(ctx context.Context, userID shared.UserID) error {
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "LogoutAll",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)

	if err := uc.refreshRepo.RevokeAllForUser(ctx, userID); err != nil {
		uc.logger.WarnContext(ctx, "falha ao revogar todos os tokens (best-effort)",
			"use_case", "LogoutAll",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", userID.String(),
			"error", err.Error(),
		)
		return fmt.Errorf("logout all: %w", err)
	}

	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "LogoutAll",
		"request_id", middleware.RequestIDFromContext(ctx),
		"user_id", userID.String(),
	)
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
	User             *identity.User
}

func (uc *RefreshTokenUseCase) Execute(ctx context.Context, tokenHash string) (RefreshTokenResult, error) {
	rt, err := uc.refreshRepo.FindByHash(ctx, tokenHash)
	if err != nil {
		return RefreshTokenResult{}, fmt.Errorf("%w: refresh token inválido", shared.ErrUnauthorized)
	}

	now := uc.clock.Now()

	// Reuso de token JÁ REVOGADO é o sinal clássico de token roubado: a rotação
	// normal do fluxo (verify → refresh → refresh → …) sempre usa o token MAIS
	// RECENTE, nunca um que já foi trocado. Se um revogado reaparece, alguém
	// tem uma cópia antiga — trata como sessão comprometida e derruba TODA a
	// família de tokens do usuário, não só este.
	if rt.IsRevoked() {
		if revokeErr := uc.refreshRepo.RevokeAllForUser(ctx, rt.UserID); revokeErr != nil {
			slog.Default().ErrorContext(ctx, "refresh token: falha ao revogar família após reuso detectado",
				"error", revokeErr, "user_id", rt.UserID.String())
		} else {
			slog.Default().WarnContext(ctx, "refresh token revogado reapresentado — família inteira invalidada (possível token roubado)",
				"user_id", rt.UserID.String())
		}
		return RefreshTokenResult{}, fmt.Errorf("%w: sessão comprometida, faça login novamente", shared.ErrUnauthorized)
	}

	if !rt.IsValid(now) {
		return RefreshTokenResult{}, fmt.Errorf("%w: refresh token expirado ou revogado", shared.ErrUnauthorized)
	}

	user, err := uc.userRepo.FindByID(ctx, rt.UserID)
	if err != nil {
		return RefreshTokenResult{}, fmt.Errorf("refresh token: find user: %w", err)
	}

	// Gera novos tokens antes de revogar o antigo.
	// Ordem intentional (safe-fail): salva o novo ANTES de revogar o antigo.
	// Se Save falhar → token antigo ainda válido → cliente pode retentar sem lockout.
	// Se Revoke falhar após Save → o token antigo expira naturalmente (TTL = 30d);
	//   o risco é mínimo (window de 30d com token que o cliente não vai mais usar).
	// A ordem inversa (revoke antes de save) causaria lockout permanente se Save falhasse.
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

	// Revoga o token antigo após persistir o novo com sucesso.
	// Falha de revogação é loggada mas não retorna erro ao cliente —
	// o novo token já está salvo e o antigo expira pelo TTL.
	if err := uc.refreshRepo.Revoke(ctx, rt.UserID, tokenHash); err != nil {
		slog.Default().WarnContext(ctx, "refresh token: falha ao revogar token antigo (será expirado via TTL)",
			"error", err, "user_id", rt.UserID.String())
	}

	return RefreshTokenResult{
		AccessToken:      accessToken,
		RefreshToken:     rawRefresh,
		RefreshExpiresAt: expiresAt,
		User:             user,
	}, nil
}
