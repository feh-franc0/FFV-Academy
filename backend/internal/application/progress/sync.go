// Package progress contém os use cases de cloud sync do GameState.
package progress

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	domprogress "github.com/fernandofv/api/internal/domain/progress"
	"github.com/fernandofv/api/internal/domain/shared"
)

// SyncPushCommand é o command de push do GameState do cliente para o servidor.
type SyncPushCommand struct {
	UserID          shared.UserID
	SchemaVersion   int
	State           json.RawMessage
	ClientUpdatedAt time.Time
}

// SyncPushUseCase salva ou atualiza o snapshot de progresso do usuário.
//
// POLÍTICA LWW (last-write-wins): o cliente só pode sobrescrever se seu
// clientUpdatedAt é mais recente que o do servidor.
// Retorna ErrConflict se o servidor tem estado mais recente.
type SyncPushUseCase struct {
	repo  domprogress.Repository
	clock shared.Clock
}

func NewSyncPushUseCase(repo domprogress.Repository, clock shared.Clock) *SyncPushUseCase {
	return &SyncPushUseCase{repo: repo, clock: clock}
}

// maxStateSize limita o JSONB de progresso para evitar writes lentos e abuso
// de storage. 1 MB cabe dezenas de milhares de eventos de progresso; além
// disso é sintoma de bug no cliente (vazamento, histórico não podado).
const maxStateSize = 1 * 1024 * 1024

func (uc *SyncPushUseCase) Execute(ctx context.Context, cmd SyncPushCommand) error {
	if len(cmd.State) > maxStateSize {
		return fmt.Errorf("%w: state excede %d bytes (recebido %d)", shared.ErrValidation, maxStateSize, len(cmd.State))
	}

	now := uc.clock.Now()

	existing, err := uc.repo.FindByUser(ctx, cmd.UserID)
	if err != nil && !errors.Is(err, shared.ErrNotFound) {
		return fmt.Errorf("sync push: find existing: %w", err)
	}

	if errors.Is(err, shared.ErrNotFound) {
		// Primeiro sync — cria novo snapshot.
		snapshot, createErr := domprogress.NewSnapshot(
			cmd.UserID, cmd.SchemaVersion, cmd.State, cmd.ClientUpdatedAt, now,
		)
		if createErr != nil {
			return fmt.Errorf("sync push: create snapshot: %w", createErr)
		}
		return uc.repo.Upsert(ctx, snapshot)
	}

	// Snapshot existe — aplica LWW.
	if err := existing.Update(cmd.SchemaVersion, cmd.State, cmd.ClientUpdatedAt, now); err != nil {
		return fmt.Errorf("sync push: %w", err) // ErrConflict se servidor é mais recente
	}
	return uc.repo.Upsert(ctx, existing)
}

// SyncPullResult contém o snapshot atual do servidor.
type SyncPullResult struct {
	SchemaVersion   int
	State           json.RawMessage
	ClientUpdatedAt time.Time
	ServerUpdatedAt time.Time
}

// SyncPullUseCase retorna o snapshot de progresso do servidor.
type SyncPullUseCase struct {
	repo domprogress.Repository
}

func NewSyncPullUseCase(repo domprogress.Repository) *SyncPullUseCase {
	return &SyncPullUseCase{repo: repo}
}

func (uc *SyncPullUseCase) Execute(ctx context.Context, userID shared.UserID) (SyncPullResult, error) {
	snapshot, err := uc.repo.FindByUser(ctx, userID)
	if err != nil {
		return SyncPullResult{}, fmt.Errorf("sync pull: %w", err)
	}
	return SyncPullResult{
		SchemaVersion:   snapshot.SchemaVersion(),
		State:           snapshot.State(),
		ClientUpdatedAt: snapshot.ClientUpdatedAt(),
		ServerUpdatedAt: snapshot.ServerUpdatedAt(),
	}, nil
}
