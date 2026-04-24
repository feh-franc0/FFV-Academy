//go:build integration

package integration

import (
	"context"
	"errors"
	"testing"
	"time"

	domcert "github.com/fernandofv/api/internal/domain/certificate"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/infrastructure/persistence/postgres"
)

func Test_CertificateRepo_Save_IsIdempotent(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	SeedUser(t, ctx, pool, "u-cert-1", "c1@x.com", "ref-c1")
	// seed attempt (FK)
	if _, err := pool.Exec(ctx, `
		INSERT INTO simulado_attempts (id, user_id, simulado_id, deadline, started_at)
		VALUES ('att-c-1','u-cert-1','sim-x', NOW() + INTERVAL '1 hour', NOW())`); err != nil {
		t.Fatalf("seed attempt: %v", err)
	}

	repo := postgres.NewCertificateRepo(pool)
	now := time.Now().UTC().Truncate(time.Second)
	cert, err := domcert.Issue("u-cert-1", "sim-x", "att-c-1", "Alice", 90, now)
	if err != nil {
		t.Fatalf("issue: %v", err)
	}
	if err := repo.Save(ctx, cert); err != nil {
		t.Fatalf("save 1: %v", err)
	}
	if err := repo.Save(ctx, cert); err != nil {
		t.Fatalf("save 2 (expected ON CONFLICT DO NOTHING): %v", err)
	}
}

func Test_CertificateRepo_FindByHash_NotFound_ReturnsErrNotFound(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	repo := postgres.NewCertificateRepo(pool)
	_, err := repo.FindByHash(ctx, shared.CertificateHash("deadbeef"))
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func Test_CertificateRepo_ExistsByAttempt_TrueFalse(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	SeedUser(t, ctx, pool, "u-ex", "ex@x.com", "ref-ex")
	if _, err := pool.Exec(ctx, `
		INSERT INTO simulado_attempts (id, user_id, simulado_id, deadline, started_at)
		VALUES ('att-ex','u-ex','sim-x', NOW() + INTERVAL '1 hour', NOW())`); err != nil {
		t.Fatalf("seed attempt: %v", err)
	}

	repo := postgres.NewCertificateRepo(pool)
	exists, err := repo.ExistsByAttempt(ctx, "att-ex")
	if err != nil || exists {
		t.Fatalf("expected false/nil, got exists=%v err=%v", exists, err)
	}

	cert, _ := domcert.Issue("u-ex", "sim-x", "att-ex", "Bob", 80, time.Now().UTC())
	if err := repo.Save(ctx, cert); err != nil {
		t.Fatalf("save: %v", err)
	}
	exists, err = repo.ExistsByAttempt(ctx, "att-ex")
	if err != nil || !exists {
		t.Fatalf("expected true/nil, got exists=%v err=%v", exists, err)
	}
}

func Test_CertificateRepo_ListByUser_OrderedByIssuedAtDesc(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	ctx := context.Background()

	SeedUser(t, ctx, pool, "u-list", "l@x.com", "ref-l")
	attempts := []struct{ id, sim string }{
		{"att-l1", "sim-l-1"}, {"att-l2", "sim-l-2"}, {"att-l3", "sim-l-3"},
	}
	for _, a := range attempts {
		if _, err := pool.Exec(ctx, `
			INSERT INTO simulado_attempts (id, user_id, simulado_id, deadline, started_at)
			VALUES ($1,'u-list',$2, NOW() + INTERVAL '1 hour', NOW())`, a.id, a.sim); err != nil {
			t.Fatalf("seed attempt: %v", err)
		}
	}

	repo := postgres.NewCertificateRepo(pool)
	base := time.Now().UTC().Truncate(time.Second)
	for i, a := range attempts {
		c, _ := domcert.Issue("u-list", shared.SimuladoID(a.sim), shared.AttemptID(a.id), "Name", 80, base.Add(time.Duration(i)*time.Minute))
		if err := repo.Save(ctx, c); err != nil {
			t.Fatalf("save: %v", err)
		}
	}

	certs, err := repo.ListByUser(ctx, "u-list")
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if len(certs) != 3 {
		t.Fatalf("expected 3 certs, got %d", len(certs))
	}
	// mais novo primeiro
	if !certs[0].IssuedAt().After(certs[1].IssuedAt()) {
		t.Errorf("expected DESC: %v !> %v", certs[0].IssuedAt(), certs[1].IssuedAt())
	}
	if !certs[1].IssuedAt().After(certs[2].IssuedAt()) {
		t.Errorf("expected DESC: %v !> %v", certs[1].IssuedAt(), certs[2].IssuedAt())
	}
}

