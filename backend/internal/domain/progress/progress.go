// Package progress implementa o cloud sync de GameState.
//
// PADRÕES:
//   - DDD: ProgressSnapshot é o aggregate root.
//   - Política: last-write-wins baseado em clientUpdatedAt.
//   - POR QUÊ JSONB: o schema do GameState pertence ao frontend; backend é cofre.
//     Não modelamos cada campo — apenas validamos envelope e tamanho.
//   - LGPD: snapshot deletado junto com o usuário.
package progress

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/shared"
)

// MaxStateSizeBytes é o limite de tamanho do GameState serializado.
// Espelha IMPORT_STATE_MAX_BYTES do frontend.
const MaxStateSizeBytes = 2_000_000 // 2 MB

// ProgressSnapshot armazena o GameState do usuário como blob JSONB versionado.
//
// AGGREGATE ROOT: ProgressSnapshot
// INVARIANTES:
//   1. state não pode exceder 2 MB.
//   2. schemaVersion deve ser positivo.
//   3. Política LWW: servidor rejeita push se clientUpdatedAt <= serverUpdatedAt.
type ProgressSnapshot struct {
	userID          shared.UserID
	schemaVersion   int
	state           json.RawMessage
	clientUpdatedAt time.Time
	serverUpdatedAt time.Time
}

// NewSnapshot cria um novo snapshot de progresso.
func NewSnapshot(
	userID shared.UserID,
	schemaVersion int,
	state json.RawMessage,
	clientUpdatedAt time.Time,
	serverNow time.Time,
) (*ProgressSnapshot, error) {
	if err := validateSnapshot(schemaVersion, state); err != nil {
		return nil, err
	}
	return &ProgressSnapshot{
		userID:          userID,
		schemaVersion:   schemaVersion,
		state:           state,
		clientUpdatedAt: clientUpdatedAt,
		serverUpdatedAt: serverNow,
	}, nil
}

// Reconstitute reconstrói um snapshot de dados persistidos.
func Reconstitute(
	userID shared.UserID,
	schemaVersion int,
	state json.RawMessage,
	clientUpdatedAt time.Time,
	serverUpdatedAt time.Time,
) *ProgressSnapshot {
	return &ProgressSnapshot{
		userID:          userID,
		schemaVersion:   schemaVersion,
		state:           state,
		clientUpdatedAt: clientUpdatedAt,
		serverUpdatedAt: serverUpdatedAt,
	}
}

func (p *ProgressSnapshot) UserID() shared.UserID       { return p.userID }
func (p *ProgressSnapshot) SchemaVersion() int          { return p.schemaVersion }
func (p *ProgressSnapshot) State() json.RawMessage      { return p.state }
func (p *ProgressSnapshot) ClientUpdatedAt() time.Time  { return p.clientUpdatedAt }
func (p *ProgressSnapshot) ServerUpdatedAt() time.Time  { return p.serverUpdatedAt }

// IsNewerThan reporta se este snapshot é mais recente que o outro.
// Usado para LWW: o cliente pode empurrar se seu timestamp é mais novo.
func (p *ProgressSnapshot) IsNewerThan(other *ProgressSnapshot) bool {
	return p.clientUpdatedAt.After(other.clientUpdatedAt)
}

// Update substitui o estado por um mais recente, respeitando LWW.
// Retorna ErrConflict se o servidor tem estado mais recente.
func (p *ProgressSnapshot) Update(
	schemaVersion int,
	state json.RawMessage,
	clientUpdatedAt time.Time,
	serverNow time.Time,
) error {
	// LWW: cliente só pode sobrescrever se seu timestamp é mais novo.
	if !clientUpdatedAt.After(p.clientUpdatedAt) {
		return shared.NewConflictError(
			fmt.Sprintf("servidor tem versão mais recente: %s > %s",
				p.clientUpdatedAt.Format(time.RFC3339),
				clientUpdatedAt.Format(time.RFC3339),
			),
		)
	}
	if err := validateSnapshot(schemaVersion, state); err != nil {
		return err
	}
	p.schemaVersion = schemaVersion
	p.state = state
	p.clientUpdatedAt = clientUpdatedAt
	p.serverUpdatedAt = serverNow
	return nil
}

func validateSnapshot(schemaVersion int, state json.RawMessage) error {
	if schemaVersion <= 0 {
		return shared.NewValidationError("schemaVersion deve ser positivo")
	}
	if len(state) > MaxStateSizeBytes {
		return shared.NewValidationError(
			fmt.Sprintf("state excede %d bytes: %d bytes", MaxStateSizeBytes, len(state)),
		)
	}
	// Valida que é JSON válido
	if !json.Valid(state) {
		return shared.NewValidationError("state não é JSON válido")
	}
	return nil
}

// Repository port
type Repository interface {
	Upsert(ctx context.Context, snapshot *ProgressSnapshot) error
	FindByUser(ctx context.Context, userID shared.UserID) (*ProgressSnapshot, error)
	DeleteByUser(ctx context.Context, userID shared.UserID) error
}
