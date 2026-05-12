package redis

import (
	"context"
	"fmt"

	goredis "github.com/redis/go-redis/v9"

	"github.com/fernandofv/api/internal/config"
)

// NewClient cria e valida o cliente Redis.
func NewClient(cfg config.RedisConfig) (*goredis.Client, error) {
	opt, err := goredis.ParseURL(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("redis: parse url: %w", err)
	}
	if cfg.Password != "" {
		opt.Password = cfg.Password
	}
	opt.DB = cfg.DB

	client := goredis.NewClient(opt)
	ctx := context.Background()
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis: ping failed: %w", err)
	}
	return client, nil
}
