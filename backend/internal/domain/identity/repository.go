package identity

import (
	"context"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// UserRepository é o port de persistência do bounded context Identity.
//
// PADRÕES:
//   - DDD Port: interface no domínio; implementação na infra.
//   - DIP: o domínio depende desta interface, não de pgx ou qualquer lib.
//   - ISP: métodos separados por caso de uso (não um mega-repo).
type UserRepository interface {
	// Save persiste um novo User. Retorna ErrConflict se email/phone já existem.
	Save(ctx context.Context, user *User) error

	// Update persiste alterações em um User existente.
	Update(ctx context.Context, user *User) error

	// FindByID retorna o User pelo ID. Retorna ErrNotFound se não existe.
	FindByID(ctx context.Context, id shared.UserID) (*User, error)

	// FindByEmail retorna o User pelo email. Retorna ErrNotFound se não existe.
	FindByEmail(ctx context.Context, email Email) (*User, error)

	// FindByGoogleID retorna o User pelo google_id. Retorna ErrNotFound se não existe.
	FindByGoogleID(ctx context.Context, googleID string) (*User, error)

	// ExistsByEmail reporta se já existe um User com o email fornecido.
	ExistsByEmail(ctx context.Context, email Email) (bool, error)

	// ExistsByPhone reporta se já existe um User com o telefone fornecido.
	ExistsByPhone(ctx context.Context, phone Phone) (bool, error)

	// SoftDelete marca o User como deletado.
	SoftDelete(ctx context.Context, id shared.UserID, now time.Time) error

	// ListForAdmin retorna usuários paginados para o admin.
	ListForAdmin(ctx context.Context, limit, offset int) ([]*User, int, error)
}

// MagicTokenStore é o port de armazenamento de tokens de magic link.
//
// POR QUÊ Redis (não Postgres): TTL automático, operações atômicas (GETDEL),
// zero custo em tabelas da DB principal.
type MagicTokenStore interface {
	// Store armazena o token com TTL.
	Store(ctx context.Context, email Email, token MagicToken) error

	// Consume recupera e deleta o token atomicamente.
	// Retorna ErrNotFound se não existe (expirado ou nunca criado).
	Consume(ctx context.Context, email Email) (MagicToken, error)

	// IncrAttempts incrementa o contador de tentativas para o email.
	// Retorna o número atual de tentativas.
	IncrAttempts(ctx context.Context, email Email) (int64, error)

	// GetAttempts retorna o número atual de tentativas.
	GetAttempts(ctx context.Context, email Email) (int64, error)
}

// RefreshTokenRepository é o port de persistência de refresh tokens.
type RefreshTokenRepository interface {
	// Save persiste um novo refresh token (hash).
	Save(ctx context.Context, token RefreshToken) error

	// FindByHash retorna um refresh token pelo hash. Retorna ErrNotFound se não existe.
	FindByHash(ctx context.Context, hash string) (RefreshToken, error)

	// Revoke marca um refresh token como revogado.
	Revoke(ctx context.Context, id shared.UserID, hash string) error

	// RevokeAllForUser revoga todos os refresh tokens de um usuário (logout global).
	RevokeAllForUser(ctx context.Context, userID shared.UserID) error
}

// RefreshToken representa um token de refresh persistido.
type RefreshToken struct {
	ID        string
	UserID    shared.UserID
	TokenHash string
	ExpiresAt time.Time
	RevokedAt *time.Time
	CreatedAt time.Time
}

func (t RefreshToken) IsExpired(now time.Time) bool { return now.After(t.ExpiresAt) }
func (t RefreshToken) IsRevoked() bool               { return t.RevokedAt != nil }
func (t RefreshToken) IsValid(now time.Time) bool    { return !t.IsExpired(now) && !t.IsRevoked() }
