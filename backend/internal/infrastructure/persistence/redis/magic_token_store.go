// Package redis implementa os adaptadores de cache usando Redis.
//
// PADRÕES:
//   - DIP: MagicTokenStore implementa identity.MagicTokenStore do domínio.
//   - Segurança: GETDEL atômico garante uso único do token (anti-replay).
//   - Chaves prefixadas para isolamento de namespace.
package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	goredis "github.com/redis/go-redis/v9"
)

// MagicTokenStore implementa identity.MagicTokenStore.
type MagicTokenStore struct {
	client *goredis.Client
}

func NewMagicTokenStore(client *goredis.Client) *MagicTokenStore {
	return &MagicTokenStore{client: client}
}

type storedToken struct {
	Value     string    `json:"v"`
	ExpiresAt time.Time `json:"exp"`
}

func tokenKey(email identity.Email) string {
	return "ffv:magic_token:" + email.String()
}

func attemptsKey(email identity.Email) string {
	return "ffv:magic_attempts:" + email.String()
}

func (s *MagicTokenStore) Store(ctx context.Context, email identity.Email, token identity.MagicToken) error {
	data := storedToken{Value: token.Value(), ExpiresAt: token.ExpiresAt()}
	b, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("magic token store: marshal: %w", err)
	}
	ttl := time.Until(token.ExpiresAt())
	if ttl <= 0 {
		return fmt.Errorf("magic token store: token já expirado")
	}
	return s.client.Set(ctx, tokenKey(email), b, ttl).Err()
}

// Consume recupera e deleta o token atomicamente (GETDEL).
// Retorna ErrNotFound se o token não existe ou já foi consumido.
func (s *MagicTokenStore) Consume(ctx context.Context, email identity.Email) (identity.MagicToken, error) {
	b, err := s.client.GetDel(ctx, tokenKey(email)).Bytes()
	if err != nil {
		if err == goredis.Nil {
			return identity.MagicToken{}, fmt.Errorf("%w: magic token", shared.ErrNotFound)
		}
		return identity.MagicToken{}, fmt.Errorf("magic token store: consume: %w", err)
	}

	var data storedToken
	if err := json.Unmarshal(b, &data); err != nil {
		return identity.MagicToken{}, fmt.Errorf("magic token store: unmarshal: %w", err)
	}

	return identity.Reconstitute(data.Value, data.ExpiresAt), nil
}

func (s *MagicTokenStore) IncrAttempts(ctx context.Context, email identity.Email) (int64, error) {
	pipe := s.client.Pipeline()
	incrCmd := pipe.Incr(ctx, attemptsKey(email))
	pipe.Expire(ctx, attemptsKey(email), 10*time.Minute)
	if _, err := pipe.Exec(ctx); err != nil {
		return 0, fmt.Errorf("magic token store: incr attempts: %w", err)
	}
	return incrCmd.Val(), nil
}

func (s *MagicTokenStore) GetAttempts(ctx context.Context, email identity.Email) (int64, error) {
	val, err := s.client.Get(ctx, attemptsKey(email)).Int64()
	if err == goredis.Nil {
		return 0, nil
	}
	if err != nil {
		return 0, fmt.Errorf("magic token store: get attempts: %w", err)
	}
	return val, nil
}
