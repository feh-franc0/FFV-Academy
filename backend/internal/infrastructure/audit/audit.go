// Package audit implementa o Service de audit log escrevendo na tabela audit_logs.
//
// PADRÃO: fire-and-forget — a chamada retorna imediatamente; a escrita real
// ocorre em goroutine com timeout 2s. Falhas vão para slog.Warn (não bloqueiam).
package audit

import (
	"context"
	"encoding/json"
	"log/slog"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	domaudit "github.com/fernandofv/api/internal/domain/audit"
)

// PostgresService implementa domaudit.Service usando Postgres.
type PostgresService struct {
	pool   *pgxpool.Pool
	logger *slog.Logger
}

func NewPostgresService(pool *pgxpool.Pool, logger *slog.Logger) *PostgresService {
	if logger == nil {
		logger = slog.Default()
	}
	return &PostgresService{pool: pool, logger: logger}
}

// AuditLog enfileira uma escrita assíncrona do audit log.
// Nunca retorna erro (ver contrato do port).
func (s *PostgresService) AuditLog(_ context.Context, entry domaudit.Entry) error {
	go s.write(entry)
	return nil
}

func (s *PostgresService) write(entry domaudit.Entry) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	id := uuid.NewString()

	if entry.OccurredAt.IsZero() {
		entry.OccurredAt = time.Now().UTC()
	}

	metadataJSON := []byte(`{}`)
	if len(entry.Metadata) > 0 {
		b, err := json.Marshal(entry.Metadata)
		if err != nil {
			s.logger.Warn("audit: marshal metadata failed", "error", err, "action", entry.Action)
		} else {
			metadataJSON = b
		}
	}

	actorID := nullableString(entry.ActorID)
	targetType := nullableString(entry.TargetType)
	targetID := nullableString(entry.TargetID)
	ip := nullableString(entry.IP)
	ua := nullableString(entry.UserAgent)
	rid := nullableString(entry.RequestID)

	const q = `
		INSERT INTO audit_logs
			(id, actor_id, actor_type, action, target_type, target_id, metadata, ip, user_agent, request_id, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
	`
	if _, err := s.pool.Exec(ctx, q,
		id, actorID, string(entry.ActorType), entry.Action,
		targetType, targetID, metadataJSON,
		ip, ua, rid, entry.OccurredAt,
	); err != nil {
		s.logger.Warn("audit: write failed",
			"error", err,
			"action", entry.Action,
			"actor_id", entry.ActorID,
		)
	}
}

func nullableString(s string) any {
	if s == "" {
		return nil
	}
	return s
}
