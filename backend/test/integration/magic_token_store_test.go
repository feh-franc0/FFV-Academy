//go:build integration

package integration

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	redisadapter "github.com/fernandofv/api/internal/infrastructure/persistence/redis"
)

func Test_MagicTokenStore_StoreAndConsume_SecondReturnsNotFound(t *testing.T) {
	client, cleanup := StartRedis(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	store := redisadapter.NewMagicTokenStore(client)
	email, _ := identity.NewEmail("mt@example.com")
	tok, err := identity.GenerateMagicToken(5*time.Minute, time.Now().UTC())
	if err != nil {
		t.Fatalf("gen: %v", err)
	}
	if err := store.Store(ctx, email, tok); err != nil {
		t.Fatalf("store: %v", err)
	}

	got, err := store.Consume(ctx, email)
	if err != nil {
		t.Fatalf("first consume: %v", err)
	}
	if got.Value() != tok.Value() {
		t.Errorf("value mismatch: %s vs %s", got.Value(), tok.Value())
	}

	_, err = store.Consume(ctx, email)
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("second consume should be ErrNotFound, got %v", err)
	}
}

func Test_MagicTokenStore_IncrAttempts_HonorsTTL(t *testing.T) {
	client, cleanup := StartRedis(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	store := redisadapter.NewMagicTokenStore(client)
	email, _ := identity.NewEmail("attempts@example.com")

	if v, err := store.GetAttempts(ctx, email); err != nil || v != 0 {
		t.Fatalf("initial attempts: %d, err=%v", v, err)
	}
	for i := 1; i <= 3; i++ {
		v, err := store.IncrAttempts(ctx, email)
		if err != nil {
			t.Fatalf("incr: %v", err)
		}
		if v != int64(i) {
			t.Errorf("incr=%d, want %d", v, i)
		}
	}
	if v, _ := store.GetAttempts(ctx, email); v != 3 {
		t.Errorf("expected 3, got %d", v)
	}
}

func Test_MagicTokenStore_TTL_ExpiresKey(t *testing.T) {
	client, cleanup := StartRedis(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	store := redisadapter.NewMagicTokenStore(client)
	email, _ := identity.NewEmail("ttl@example.com")
	// TTL muito curto via expiresAt = now+1s
	tok, err := identity.GenerateMagicToken(1*time.Second, time.Now().UTC())
	if err != nil {
		t.Fatalf("gen: %v", err)
	}
	if err := store.Store(ctx, email, tok); err != nil {
		t.Fatalf("store: %v", err)
	}

	time.Sleep(1500 * time.Millisecond)

	_, err = store.Consume(ctx, email)
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected expired (ErrNotFound), got %v", err)
	}
}
