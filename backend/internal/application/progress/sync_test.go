package progress_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	appprogress "github.com/fernandofv/api/internal/application/progress"
	domprogress "github.com/fernandofv/api/internal/domain/progress"
	"github.com/fernandofv/api/internal/domain/shared"
)

type mockProgressRepo struct {
	byUser    map[shared.UserID]*domprogress.ProgressSnapshot
	upsertErr error
	upserts   []*domprogress.ProgressSnapshot
}

func newMockProgressRepo() *mockProgressRepo {
	return &mockProgressRepo{byUser: make(map[shared.UserID]*domprogress.ProgressSnapshot)}
}
func (m *mockProgressRepo) Upsert(_ context.Context, s *domprogress.ProgressSnapshot) error {
	if m.upsertErr != nil {
		return m.upsertErr
	}
	m.byUser[s.UserID()] = s
	m.upserts = append(m.upserts, s)
	return nil
}
func (m *mockProgressRepo) FindByUser(_ context.Context, id shared.UserID) (*domprogress.ProgressSnapshot, error) {
	s, ok := m.byUser[id]
	if !ok {
		return nil, shared.ErrNotFound
	}
	return s, nil
}
func (m *mockProgressRepo) DeleteByUser(_ context.Context, _ shared.UserID) error { return nil }

func Test_SyncPush_Execute_FirstSync_CreatesSnapshot(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	repo := newMockProgressRepo()
	uc := appprogress.NewSyncPushUseCase(repo, shared.FixedClock{T: now})

	err := uc.Execute(context.Background(), appprogress.SyncPushCommand{
		UserID:          userID,
		SchemaVersion:   1,
		State:           json.RawMessage(`{"xp":10}`),
		ClientUpdatedAt: now,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(repo.upserts) != 1 {
		t.Fatalf("expected 1 upsert, got %d", len(repo.upserts))
	}
}

func Test_SyncPush_Execute_ClientNewer_UpdatesSnapshot(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	existing := domprogress.Reconstitute(userID, 1, json.RawMessage(`{"xp":5}`),
		now.Add(-2*time.Hour), now.Add(-2*time.Hour))
	repo := newMockProgressRepo()
	repo.byUser[userID] = existing

	uc := appprogress.NewSyncPushUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appprogress.SyncPushCommand{
		UserID:          userID,
		SchemaVersion:   1,
		State:           json.RawMessage(`{"xp":10}`),
		ClientUpdatedAt: now.Add(-time.Hour),
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if !bytes.Equal(existing.State(), []byte(`{"xp":10}`)) {
		t.Fatalf("expected state updated, got %s", existing.State())
	}
}

func Test_SyncPush_Execute_ServerNewer_ReturnsConflict(t *testing.T) {
	now := time.Now()
	userID := shared.NewUserID()
	existing := domprogress.Reconstitute(userID, 1, json.RawMessage(`{"xp":50}`),
		now, now)
	repo := newMockProgressRepo()
	repo.byUser[userID] = existing

	uc := appprogress.NewSyncPushUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appprogress.SyncPushCommand{
		UserID:          userID,
		SchemaVersion:   1,
		State:           json.RawMessage(`{"xp":5}`),
		ClientUpdatedAt: now.Add(-time.Hour),
	})
	if !errors.Is(err, shared.ErrConflict) {
		t.Fatalf("expected ErrConflict, got %v", err)
	}
}

func Test_SyncPush_Execute_StateTooLarge_ReturnsValidation(t *testing.T) {
	now := time.Now()
	// Build JSON blob > 1 MB
	big := make([]byte, 1024*1024+10)
	for i := range big {
		big[i] = 'a'
	}
	// Make it look like valid JSON string wrapping.
	payload := append([]byte(`"`), big...)
	payload = append(payload, '"')

	repo := newMockProgressRepo()
	uc := appprogress.NewSyncPushUseCase(repo, shared.FixedClock{T: now})
	err := uc.Execute(context.Background(), appprogress.SyncPushCommand{
		UserID:          shared.NewUserID(),
		SchemaVersion:   1,
		State:           json.RawMessage(payload),
		ClientUpdatedAt: now,
	})
	if !errors.Is(err, shared.ErrValidation) {
		t.Fatalf("expected ErrValidation, got %v", err)
	}
}

func Test_SyncPull_Execute_NoSnapshot_ReturnsNotFound(t *testing.T) {
	uc := appprogress.NewSyncPullUseCase(newMockProgressRepo())
	_, err := uc.Execute(context.Background(), shared.NewUserID())
	if !errors.Is(err, shared.ErrNotFound) {
		t.Fatalf("expected ErrNotFound, got %v", err)
	}
}
