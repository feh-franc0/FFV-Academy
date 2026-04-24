//go:build integration

package integration

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/fernandofv/api/internal/infrastructure/persistence/postgres"
)

func newTestUser(t *testing.T, id, email, phone, refID string) *identity.User {
	t.Helper()
	em, err := identity.NewEmail(email)
	if err != nil {
		t.Fatalf("new email: %v", err)
	}
	ph, err := identity.NewPhone(phone)
	if err != nil {
		t.Fatalf("new phone: %v", err)
	}
	u, _, err := identity.NewUser(
		shared.UserID(id), em, ph, "Test User", false,
		shared.ReferralID(refID), time.Now().UTC().Truncate(time.Second),
	)
	if err != nil {
		t.Fatalf("new user: %v", err)
	}
	return u
}

func Test_UserRepo_SaveAndFindByID_RoundTrip(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	SkipIfUsersMissingUpdatedAt(t, pool)

	repo := postgres.NewUserRepo(pool)
	ctx := context.Background()
	u := newTestUser(t, "u-1", "alice@example.com", "+5511987654321", "ref-1")

	if err := repo.Save(ctx, u); err != nil {
		t.Fatalf("save: %v", err)
	}

	got, err := repo.FindByID(ctx, u.ID())
	if err != nil {
		t.Fatalf("find by id: %v", err)
	}
	if got.Email().String() != u.Email().String() {
		t.Errorf("email mismatch: %s vs %s", got.Email(), u.Email())
	}
	if got.Name() != u.Name() {
		t.Errorf("name mismatch: %s vs %s", got.Name(), u.Name())
	}
	if got.Phone().String() != u.Phone().String() {
		t.Errorf("phone mismatch")
	}
}

func Test_UserRepo_FindByEmail_SoftDeleted_ReturnsNotFound(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	SkipIfUsersMissingUpdatedAt(t, pool)

	repo := postgres.NewUserRepo(pool)
	ctx := context.Background()
	u := newTestUser(t, "u-2", "deleted@example.com", "+5511987654322", "ref-2")
	if err := repo.Save(ctx, u); err != nil {
		t.Fatalf("save: %v", err)
	}
	if err := repo.SoftDelete(ctx, u.ID(), time.Now().UTC()); err != nil {
		t.Fatalf("soft delete: %v", err)
	}

	_, err := repo.FindByEmail(ctx, u.Email())
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}

func Test_UserRepo_FindByID_SoftDeleted_ReturnsNotFound(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	SkipIfUsersMissingUpdatedAt(t, pool)

	repo := postgres.NewUserRepo(pool)
	ctx := context.Background()
	u := newTestUser(t, "u-3", "bob@example.com", "+5511987654323", "ref-3")
	if err := repo.Save(ctx, u); err != nil {
		t.Fatalf("save: %v", err)
	}
	if err := repo.SoftDelete(ctx, u.ID(), time.Now().UTC()); err != nil {
		t.Fatalf("soft delete: %v", err)
	}

	_, err := repo.FindByID(ctx, u.ID())
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected ErrNotFound after soft delete, got %v", err)
	}
}

func Test_UserRepo_Save_DuplicateEmail_ReturnsConflict(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	SkipIfUsersMissingUpdatedAt(t, pool)

	repo := postgres.NewUserRepo(pool)
	ctx := context.Background()
	u1 := newTestUser(t, "u-4a", "dup@example.com", "+5511987654324", "ref-4a")
	u2 := newTestUser(t, "u-4b", "dup@example.com", "+5511987654325", "ref-4b")

	if err := repo.Save(ctx, u1); err != nil {
		t.Fatalf("save u1: %v", err)
	}
	err := repo.Save(ctx, u2)
	if !errors.Is(err, shared.ErrConflict) {
		t.Fatalf("expected ErrConflict, got %v", err)
	}
}

func Test_UserRepo_ListForAdmin_ReturnsTotal(t *testing.T) {
	pool, cleanup := StartPostgres(t)
	t.Cleanup(cleanup)
	SkipIfUsersMissingUpdatedAt(t, pool)

	repo := postgres.NewUserRepo(pool)
	ctx := context.Background()
	for i, em := range []string{"a@x.com", "b@x.com", "c@x.com"} {
		u := newTestUser(t, "list-"+string(rune('a'+i)), em, "+551198765430"+string(rune('1'+i)), "ref-list-"+string(rune('a'+i)))
		if err := repo.Save(ctx, u); err != nil {
			t.Fatalf("save: %v", err)
		}
	}

	users, total, err := repo.ListForAdmin(ctx, 2, 0)
	if err != nil {
		t.Fatalf("list: %v", err)
	}
	if total != 3 {
		t.Errorf("expected total=3, got %d", total)
	}
	if len(users) != 2 {
		t.Errorf("expected page size=2, got %d", len(users))
	}
}
