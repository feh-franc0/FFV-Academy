package event_test

import (
	"context"
	"encoding/json"
	"errors"
	"sync"
	"testing"
	"time"

	appevent "github.com/fernandofv/api/internal/application/event"
	"github.com/fernandofv/api/internal/domain/shared"
)

type mockEventRepo struct {
	mu    sync.Mutex
	saved []appevent.Event
	err   error
	done  chan struct{}
}

func newMockEventRepo() *mockEventRepo {
	return &mockEventRepo{done: make(chan struct{}, 1)}
}

func (m *mockEventRepo) Save(_ context.Context, e appevent.Event) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.saved = append(m.saved, e)
	select {
	case m.done <- struct{}{}:
	default:
	}
	return m.err
}

func Test_IngestEvent_Execute_HappyPath_PersistsAsync(t *testing.T) {
	now := time.Now()
	repo := newMockEventRepo()
	uc := appevent.NewIngestEventUseCase(repo, shared.FixedClock{T: now})

	err := uc.Execute(context.Background(), appevent.IngestEventCommand{
		Type:       "page_view",
		Payload:    json.RawMessage(`{"path":"/"}`),
		OccurredAt: now,
	})
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	// Wait for goroutine to Save.
	select {
	case <-repo.done:
	case <-time.After(time.Second):
		t.Fatalf("timeout waiting for async save")
	}
	repo.mu.Lock()
	defer repo.mu.Unlock()
	if len(repo.saved) != 1 {
		t.Fatalf("expected 1 event saved, got %d", len(repo.saved))
	}
	if repo.saved[0].Type != "page_view" {
		t.Fatalf("unexpected type: %s", repo.saved[0].Type)
	}
}

func Test_IngestEvent_Execute_RepoSaveFails_DoesNotBlock(t *testing.T) {
	now := time.Now()
	repo := newMockEventRepo()
	repo.err = errors.New("db down")
	uc := appevent.NewIngestEventUseCase(repo, shared.FixedClock{T: now})

	err := uc.Execute(context.Background(), appevent.IngestEventCommand{
		Type: "click", Payload: json.RawMessage(`{}`), OccurredAt: now,
	})
	if err != nil {
		t.Fatalf("fire-and-forget should not surface Save errors, got %v", err)
	}
	select {
	case <-repo.done:
	case <-time.After(time.Second):
		t.Fatalf("expected async save attempt even on error")
	}
}
