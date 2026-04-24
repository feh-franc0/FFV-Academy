package postgres

import (
	"context"
	"errors"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	appidentity "github.com/fernandofv/api/internal/application/identity"
	"github.com/fernandofv/api/internal/domain/shared"
)

// ─────────────────────────────────────────────────────────────────
// ProgressSnapshotLoader — read-only para /me/export
// ─────────────────────────────────────────────────────────────────

// ProgressExportAdapter lê progress_snapshots como ExportedProgress.
type ProgressExportAdapter struct {
	pool *pgxpool.Pool
}

func NewProgressExportAdapter(pool *pgxpool.Pool) *ProgressExportAdapter {
	return &ProgressExportAdapter{pool: pool}
}

func (a *ProgressExportAdapter) LoadSnapshot(ctx context.Context, userID shared.UserID) (*appidentity.ExportedProgress, error) {
	var (
		schemaVer       int
		state           []byte
		clientUpdatedAt time.Time
		serverUpdatedAt time.Time
	)
	err := a.pool.QueryRow(ctx,
		`SELECT schema_version, state, client_updated_at, updated_at FROM progress_snapshots WHERE user_id = $1`,
		userID.String(),
	).Scan(&schemaVer, &state, &clientUpdatedAt, &serverUpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, nil
		}
		return nil, err
	}
	return &appidentity.ExportedProgress{
		SchemaVersion:   schemaVer,
		State:           state,
		ClientUpdatedAt: clientUpdatedAt,
		ServerUpdatedAt: serverUpdatedAt,
	}, nil
}

// Compile-time check.
var _ appidentity.ProgressSnapshotLoader = (*ProgressExportAdapter)(nil)

// ─────────────────────────────────────────────────────────────────
// PurchaseLister — read-only para /me/export
// ─────────────────────────────────────────────────────────────────

// PurchaseExportAdapter lista purchases do usuário (formato mínimo para export).
type PurchaseExportAdapter struct {
	pool *pgxpool.Pool
}

func NewPurchaseExportAdapter(pool *pgxpool.Pool) *PurchaseExportAdapter {
	return &PurchaseExportAdapter{pool: pool}
}

func (a *PurchaseExportAdapter) ListByUser(ctx context.Context, userID shared.UserID) ([]appidentity.ExportedPurchase, error) {
	rows, err := a.pool.Query(ctx, `
		SELECT id, product_id, amount_cents, COALESCE(currency, 'BRL'), status, created_at
		FROM purchases WHERE user_id = $1 ORDER BY created_at DESC
	`, userID.String())
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	out := make([]appidentity.ExportedPurchase, 0)
	for rows.Next() {
		var p appidentity.ExportedPurchase
		if err := rows.Scan(&p.ID, &p.ProductID, &p.AmountCents, &p.Currency, &p.Status, &p.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, rows.Err()
}

// Compile-time check.
var _ appidentity.PurchaseLister = (*PurchaseExportAdapter)(nil)
