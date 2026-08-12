package identity

import (
	"context"
	"crypto/rand"
	"errors"
	"fmt"
	"log/slog"
	"math/big"
	"strings"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/interfaces/http/middleware"
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
//  1. Valida formato do email.
//  2. Consome token do Redis (GETDEL — uso único, atômico).
//  3. Verifica se o token é válido e não expirado.
//  4. Busca usuário pelo email.
//     5a. Se não existe: requer RegistrationData; cria novo User.
//     5b. Se existe: faz login normal.
//  6. Emite access token (JWT 15min) e refresh token (30d).
//  7. Persiste refresh token (hash) na DB.
type VerifyMagicLinkUseCase struct {
	tokenStore      identity.MagicTokenStore
	userRepo        identity.UserRepository
	refreshRepo     identity.RefreshTokenRepository
	tokenIssuer     TokenIssuer
	clock           shared.Clock
	refreshTokenTTL time.Duration
	logger          *slog.Logger
	devMode         bool
	// maxAttempts é o teto de AÇÕES relacionadas a magic-link (pedidos +
	// verificações, combinados) por email dentro da janela de 10min do
	// contador Redis — mesmo `attemptsKey` que RequestMagicLinkUseCase já
	// usava só para limitar pedido de código novo. Achado P-01/P-03 da
	// auditoria de 11/ago/2026: verify nunca chamava IncrAttempts, então um
	// atacante com poucos IPs conseguia varrer boa parte do espaço de 10⁶
	// códigos dentro do TTL do token — o único freio era rate-limit por IP.
	maxAttempts int64
}

// defaultVerifyMaxAttempts é o valor usado quando WithMaxAttempts não é
// chamado — 5 é conservador o bastante pra não incomodar um usuário real
// (erro de digitação raramente passa de 1-2) e apertado o bastante pra
// inviabilizar varredura de 10⁶ combinações.
const defaultVerifyMaxAttempts = 5

// NewVerifyMagicLinkUseCase cria o use case com logger padrão (slog.Default)
// e maxAttempts padrão. Use WithLogger/WithMaxAttempts para substituir.
func NewVerifyMagicLinkUseCase(
	tokenStore identity.MagicTokenStore,
	userRepo identity.UserRepository,
	refreshRepo identity.RefreshTokenRepository,
	tokenIssuer TokenIssuer,
	clock shared.Clock,
	refreshTokenTTL time.Duration,
	devMode bool,
) *VerifyMagicLinkUseCase {
	return &VerifyMagicLinkUseCase{
		tokenStore:      tokenStore,
		userRepo:        userRepo,
		refreshRepo:     refreshRepo,
		tokenIssuer:     tokenIssuer,
		clock:           clock,
		refreshTokenTTL: refreshTokenTTL,
		logger:          slog.Default(),
		devMode:         devMode,
		maxAttempts:     defaultVerifyMaxAttempts,
	}
}

// WithLogger substitui o logger — chamado em main.go após o construtor.
func (uc *VerifyMagicLinkUseCase) WithLogger(l *slog.Logger) *VerifyMagicLinkUseCase {
	uc.logger = l
	return uc
}

// WithMaxAttempts substitui o teto de tentativas — em produção, chamado com
// o MESMO valor passado a NewRequestMagicLinkUseCase (main.go), pra que os
// dois use cases compartilhem um único orçamento por email.
func (uc *VerifyMagicLinkUseCase) WithMaxAttempts(n int64) *VerifyMagicLinkUseCase {
	uc.maxAttempts = n
	return uc
}

// Execute verifica o magic link e emite tokens de sessão, logando cada etapa.
func (uc *VerifyMagicLinkUseCase) Execute(ctx context.Context, cmd VerifyMagicLinkCommand) (VerifyMagicLinkResult, error) {
	// Log de entrada: registra o início da verificação sem revelar o token ou email.
	uc.logger.InfoContext(ctx, "use case iniciado",
		"use_case", "VerifyMagicLink",
		"request_id", middleware.RequestIDFromContext(ctx),
		"email_hash", hashEmail(cmd.Email),
	)

	email, err := identity.NewEmail(cmd.Email)
	if err != nil {
		uc.logger.WarnContext(ctx, "email inválido",
			"use_case", "VerifyMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: %w", err)
	}

	now := uc.clock.Now()

	// Dev bypass: em desenvolvimento, o código 000000 autentica qualquer email sem Redis.
	if !uc.devMode || strings.TrimSpace(cmd.Token) != "000000" {
		// Peek (GET, não deleta) antes de validar — um palpite errado NÃO PODE
		// apagar o código correto que ainda está pendente. Só Consume (GETDEL)
		// depois do match confirmado, para manter o uso único (anti-replay).
		storedToken, err := uc.tokenStore.Peek(ctx, email)
		if err != nil {
			if errors.Is(err, shared.ErrNotFound) {
				uc.logger.WarnContext(ctx, "token não encontrado ou expirado",
					"use_case", "VerifyMagicLink",
					"request_id", middleware.RequestIDFromContext(ctx),
					"email_hash", hashEmail(cmd.Email),
				)
				return VerifyMagicLinkResult{}, fmt.Errorf("%w: token não encontrado ou expirado", shared.ErrUnauthorized)
			}
			uc.logger.ErrorContext(ctx, "falha ao ler token do Redis",
				"use_case", "VerifyMagicLink",
				"request_id", middleware.RequestIDFromContext(ctx),
				"error", err.Error(),
			)
			return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: peek token: %w", err)
		}

		// Lockout por tentativas (achado P-03): checa ANTES de avaliar
		// expiry/match, pra que a checagem em si não vire mais uma tentativa
		// "grátis". attempts >= maxAttempts recusa mesmo que o código enviado
		// agora esteja correto — sem isso, um código de 6 dígitos com TTL de
		// 10min é varrível por quem controla poucos IPs (o rate-limit de
		// requestToken é por IP; este é por EMAIL, o eixo que o atacante não
		// controla).
		attempts, attErr := uc.tokenStore.GetAttempts(ctx, email)
		if attErr != nil {
			uc.logger.ErrorContext(ctx, "falha ao verificar contador de tentativas",
				"use_case", "VerifyMagicLink",
				"request_id", middleware.RequestIDFromContext(ctx),
				"error", attErr.Error(),
			)
			return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: check attempts: %w", attErr)
		}
		if attempts >= uc.maxAttempts {
			uc.logger.WarnContext(ctx, "lockout de verificação atingido",
				"use_case", "VerifyMagicLink",
				"request_id", middleware.RequestIDFromContext(ctx),
				"email_hash", hashEmail(cmd.Email),
				"attempts", attempts,
			)
			return VerifyMagicLinkResult{}, shared.ErrRateLimited
		}
		// Conta ESTA tentativa antes de saber o resultado — inclusive a
		// correta soma pro orçamento (mesmo contador que RequestMagicLink usa
		// pra limitar pedido de código novo; os dois dividem a mesma janela
		// de 10min por email). Falha ao incrementar é logada mas não trava o
		// login: contar errado é preferível a derrubar login legítimo por
		// instabilidade do Redis que o próprio Peek acima já teria pego.
		if _, incrErr := uc.tokenStore.IncrAttempts(ctx, email); incrErr != nil {
			uc.logger.ErrorContext(ctx, "falha ao incrementar contador de tentativas",
				"use_case", "VerifyMagicLink",
				"request_id", middleware.RequestIDFromContext(ctx),
				"error", incrErr.Error(),
			)
		}

		if storedToken.IsExpired(now) {
			uc.logger.WarnContext(ctx, "token expirado",
				"use_case", "VerifyMagicLink",
				"request_id", middleware.RequestIDFromContext(ctx),
				"email_hash", hashEmail(cmd.Email),
			)
			return VerifyMagicLinkResult{}, fmt.Errorf("%w: token expirado", shared.ErrUnauthorized)
		}
		if !storedToken.Matches(strings.TrimSpace(cmd.Token)) {
			uc.logger.WarnContext(ctx, "token inválido (mismatch)",
				"use_case", "VerifyMagicLink",
				"request_id", middleware.RequestIDFromContext(ctx),
				"email_hash", hashEmail(cmd.Email),
			)
			return VerifyMagicLinkResult{}, fmt.Errorf("%w: token inválido", shared.ErrUnauthorized)
		}

		// A posse do código já está PROVADA neste ponto (Peek+Matches). Antes de
		// queimar o token (Consume), checa se o email é de usuário novo sem dados
		// de registro — se for, devolve ErrRegistrationRequired SEM consumir: o
		// mesmo código volta a ser reenviado, agora com nome/telefone, no
		// próximo POST. Checar isso ANTES do match seria enumeração de conta
		// (responder "precisa cadastro" para qualquer email, sem provar posse);
		// checar DEPOIS de consumir queimaria o código à toa.
		if cmd.Registration == nil {
			if _, findErr := uc.userRepo.FindByEmail(ctx, email); errors.Is(findErr, shared.ErrNotFound) {
				uc.logger.InfoContext(ctx, "código válido, registro pendente — token preservado",
					"use_case", "VerifyMagicLink",
					"request_id", middleware.RequestIDFromContext(ctx),
					"email_hash", hashEmail(cmd.Email),
				)
				return VerifyMagicLinkResult{}, fmt.Errorf("%w: dados de registro obrigatórios para novo usuário", shared.ErrRegistrationRequired)
			}
		}

		// Match confirmado e (se novo usuário) registro presente — consome
		// agora (GETDEL), garantindo uso único. Erro aqui (ex: outra requisição
		// já consumiu em corrida) é tratado como token inválido, não como 500:
		// a corrida é exatamente o cenário que o uso único deve barrar.
		if _, err := uc.tokenStore.Consume(ctx, email); err != nil {
			uc.logger.WarnContext(ctx, "token consumido em corrida com outra requisição",
				"use_case", "VerifyMagicLink",
				"request_id", middleware.RequestIDFromContext(ctx),
				"email_hash", hashEmail(cmd.Email),
			)
			return VerifyMagicLinkResult{}, fmt.Errorf("%w: token já utilizado", shared.ErrUnauthorized)
		}
	}

	// Busca ou cria usuário.
	user, isNew, err := uc.findOrCreate(ctx, email, cmd.Registration, now)
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao buscar/criar usuário",
			"use_case", "VerifyMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"error", err.Error(),
		)
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: %w", err)
	}

	// Emite tokens.
	accessToken, err := uc.tokenIssuer.IssueAccessToken(user.ID(), user.Email(), user.Role())
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao emitir access token",
			"use_case", "VerifyMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", user.ID().String(),
			"error", err.Error(),
		)
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: issue access token: %w", err)
	}

	rawRefresh, refreshHash, err := uc.tokenIssuer.IssueRefreshToken(user.ID())
	if err != nil {
		uc.logger.ErrorContext(ctx, "falha ao emitir refresh token",
			"use_case", "VerifyMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", user.ID().String(),
			"error", err.Error(),
		)
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
		uc.logger.ErrorContext(ctx, "falha ao salvar refresh token",
			"use_case", "VerifyMagicLink",
			"request_id", middleware.RequestIDFromContext(ctx),
			"user_id", user.ID().String(),
			"error", err.Error(),
		)
		return VerifyMagicLinkResult{}, fmt.Errorf("verify magic link: save refresh token: %w", err)
	}

	// Log de saída: confirma autenticação bem-sucedida.
	uc.logger.InfoContext(ctx, "use case concluído",
		"use_case", "VerifyMagicLink",
		"request_id", middleware.RequestIDFromContext(ctx),
		"email_hash", hashEmail(cmd.Email),
		"user_id", user.ID().String(),
		"is_new_user", isNew,
	)

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
		// Decisão explícita: dados de registro enviados para um email que já
		// tem conta são IGNORADOS, não aplicados — login não é o fluxo de
		// edição de perfil (isso é PATCH /me). Antes esse descarte era
		// silencioso (nenhum log); agora fica registrado, para não parecer
		// perda de dado por omissão.
		if reg != nil {
			uc.logger.InfoContext(ctx, "dados de registro enviados para email já cadastrado — ignorados",
				"use_case", "VerifyMagicLink",
				"email_hash", hashEmail(email.String()),
			)
		}
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
