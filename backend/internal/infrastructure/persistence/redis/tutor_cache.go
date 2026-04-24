package redis

import (
	"context"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
	domtutor "github.com/fernandofv/api/internal/domain/tutor"
	goredis "github.com/redis/go-redis/v9"
)

// TutorRateLimiter implementa domtutor.RateLimiter usando Redis.
// Rate limit mensal: sliding window por usuário.
type TutorRateLimiter struct {
	client    *goredis.Client
	freeCap   int
	proCap    int
}

func NewTutorRateLimiter(client *goredis.Client, freeCap, proCap int) *TutorRateLimiter {
	return &TutorRateLimiter{client: client, freeCap: freeCap, proCap: proCap}
}

func tutorCountKey(userID shared.UserID) string {
	// Chave com mês corrente para reset automático a cada mês.
	month := time.Now().UTC().Format("2006-01")
	return fmt.Sprintf("ffv:tutor_count:%s:%s", userID.String(), month)
}

func (r *TutorRateLimiter) Check(ctx context.Context, userID shared.UserID, isPro bool) error {
	cap := r.freeCap
	if isPro {
		cap = r.proCap
	}

	count, err := r.client.Get(ctx, tutorCountKey(userID)).Int()
	if err == goredis.Nil {
		return nil // sem uso ainda
	}
	if err != nil {
		return fmt.Errorf("tutor rate limiter: check: %w", err)
	}
	if count >= cap {
		return fmt.Errorf("%w: limite de %d requisições/mês atingido", shared.ErrRateLimited, cap)
	}
	return nil
}

func (r *TutorRateLimiter) Increment(ctx context.Context, userID shared.UserID) error {
	key := tutorCountKey(userID)
	pipe := r.client.Pipeline()
	pipe.Incr(ctx, key)
	// Expira no início do próximo mês + 1 dia (segurança).
	pipe.Expire(ctx, key, 32*24*time.Hour)
	_, err := pipe.Exec(ctx)
	return err
}

// TutorCache implementa cache de respostas do tutor por (questionID, kind).
type TutorCache struct {
	client *goredis.Client
	ttl    time.Duration
}

func NewTutorCache(client *goredis.Client, ttl time.Duration) *TutorCache {
	return &TutorCache{client: client, ttl: ttl}
}

func tutorCacheKey(qID shared.QuestionID, kind domtutor.QueryKind) string {
	return fmt.Sprintf("ffv:tutor_cache:%s:%s", qID.String(), string(kind))
}

func (c *TutorCache) Get(ctx context.Context, qID shared.QuestionID, kind domtutor.QueryKind) (string, bool, error) {
	val, err := c.client.Get(ctx, tutorCacheKey(qID, kind)).Result()
	if err == goredis.Nil {
		return "", false, nil
	}
	if err != nil {
		return "", false, err
	}
	return val, true, nil
}

func (c *TutorCache) Set(ctx context.Context, qID shared.QuestionID, kind domtutor.QueryKind, explanation string) error {
	return c.client.Set(ctx, tutorCacheKey(qID, kind), explanation, c.ttl).Err()
}
