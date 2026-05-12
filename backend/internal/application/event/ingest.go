// Package event contém o use case de ingestão de eventos de analytics.
package event

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"

	"github.com/fernandofv/api/internal/domain/shared"
)

// Event representa um evento de analytics enviado pelo frontend.
type Event struct {
	ID         string
	UserID     *shared.UserID // nil se anônimo
	Type       string
	Payload    json.RawMessage
	OccurredAt time.Time
	ReceivedAt time.Time
}

// EventRepository é o port de persistência de eventos.
type EventRepository interface {
	Save(ctx context.Context, event Event) error
}

// IngestEventCommand é o command de ingestão.
type IngestEventCommand struct {
	UserID     *shared.UserID
	Type       string
	Payload    json.RawMessage
	OccurredAt time.Time
}

// IngestEventUseCase persiste um evento de analytics.
// Fire-and-forget: retorna 202 imediatamente; persistência é async.
type IngestEventUseCase struct {
	repo  EventRepository
	clock shared.Clock
}

func NewIngestEventUseCase(repo EventRepository, clock shared.Clock) *IngestEventUseCase {
	return &IngestEventUseCase{repo: repo, clock: clock}
}

func (uc *IngestEventUseCase) Execute(ctx context.Context, cmd IngestEventCommand) error {
	event := Event{
		ID:         uuid.NewString(),
		UserID:     cmd.UserID,
		Type:       cmd.Type,
		Payload:    cmd.Payload,
		OccurredAt: cmd.OccurredAt,
		ReceivedAt: uc.clock.Now(),
	}
	// Persistência assíncrona — não bloqueia a resposta HTTP.
	go func() {
		bgCtx := context.Background()
		_ = uc.repo.Save(bgCtx, event)
	}()
	return nil
}
