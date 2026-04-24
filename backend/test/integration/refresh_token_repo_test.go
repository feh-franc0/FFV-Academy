//go:build integration

package integration

import (
	"context"
	"errors"
	"testing"
	"time"

	domidentity "github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/infrastructure/persistence/postgres"
)

func newRT(id, userID, hash string, ttl time.Duration) domidentity.RefreshToken {
	now := time.Now().UTC().Truncate(time.Second)
	return domidentity.RefreshToken{
		ID:        id,
		UserID:    shared.UserID(userID),
		TokenHash: hash,
		ExpiresAt: now.Add(ttl),
		CreatedAt: now,
	}
}

func Test_RefreshTokenRepo_SaveAndFindByHash(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	SeedUser(t, ctx, pool, "u-rt-1", "rt1@x.com", "ref-rt-1")
	repo := postgres.NewRefreshTokenRepo(pool)

	rt := newRT("rt-id-1", "u-rt-1", "hash-abc", 24*time.Hour)
	if err := repo.Save(ctx, rt); err != nil {
		t.Fatalf("save: %v", err)
	}

	got, err := repo.FindByHash(ctx, "hash-abc")
	if err != nil {
		t.Fatalf("find: %v", err)
	}
	if got.ID != rt.ID || got.UserID != rt.UserID || got.TokenHash != rt.TokenHash {
		t.Errorf("mismatch: got %+v", got)
	}
}

func Test_RefreshTokenRepo_Revoke_SetsRevokedAt(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	SeedUser(t, ctx, pool, "u-rt-2", "rt2@x.com", "ref-rt-2")
	repo := postgres.NewRefreshTokenRepo(pool)
	rt := newRT("rt-id-2", "u-rt-2", "hash-revoke", 24*time.Hour)
	if err := repo.Save(ctx, rt); err != nil {
		t.Fatalf("save: %v", err)
	}

	if err := repo.Revoke(ctx, "u-rt-2", "hash-revoke"); err != nil {
		t.Fatalf("revoke: %v", err)
	}

	got, err := repo.FindByHash(ctx, "hash-revoke")
	if err != nil {
		t.Fatalf("find after revoke: %v", err)
	}
	if got.RevokedAt == nil {
		t.Error("expected RevokedAt != nil after revoke")
	}
}

func Test_RefreshTokenRepo_RevokeAllForUser_OnlyAffectsTarget(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	SeedUser(t, ctx, pool, "u-rev-a", "rva@x.com", "ref-rva")
	SeedUser(t, ctx, pool, "u-rev-b", "rvb@x.com", "ref-rvb")
	repo := postgres.NewRefreshTokenRepo(pool)

	if err := repo.Save(ctx, newRT("ra-1", "u-rev-a", "hA1", 24*time.Hour)); err != nil {
		t.Fatal(err)
	}
	if err := repo.Save(ctx, newRT("ra-2", "u-rev-a", "hA2", 24*time.Hour)); err != nil {
		t.Fatal(err)
	}
	if err := repo.Save(ctx, newRT("rb-1", "u-rev-b", "hB1", 24*time.Hour)); err != nil {
		t.Fatal(err)
	}

	if err := repo.RevokeAllForUser(ctx, "u-rev-a"); err != nil {
		t.Fatalf("revoke all: %v", err)
	}

	a1, _ := repo.FindByHash(ctx, "hA1")
	a2, _ := repo.FindByHash(ctx, "hA2")
	b1, _ := repo.FindByHash(ctx, "hB1")

	if a1.RevokedAt == nil || a2.RevokedAt == nil {
		t.Error("user A tokens should be revoked")
	}
	if b1.RevokedAt != nil {
		t.Error("user B token should NOT be revoked")
	}
}

func Test_RefreshTokenRepo_FindByHash_Missing_ReturnsNotFound(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	repo := postgres.NewRefreshTokenRepo(pool)
	_, err := repo.FindByHash(ctx, "nope")
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}
