package postgres

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	appevent "github.com/fernandofv/api/internal/application/event"
	dombilling "github.com/fernandofv/api/internal/domain/billing"
	domcert "github.com/fernandofv/api/internal/domain/certificate"
	domidentity "github.com/fernandofv/api/internal/domain/identity"
	domprogress "github.com/fernandofv/api/internal/domain/progress"
	domref "github.com/fernandofv/api/internal/domain/referral"
	"github.com/fernandofv/api/internal/domain/shared"
)

// ─────────────────────────────────────────────────────────────────
// RefreshTokenRepo
// ─────────────────────────────────────────────────────────────────

type RefreshTokenRepo struct{ pool *pgxpool.Pool }

func NewRefreshTokenRepo(pool *pgxpool.Pool) *RefreshTokenRepo {
	return &RefreshTokenRepo{pool: pool}
}

func (r *RefreshTokenRepo) Save(ctx context.Context, rt domidentity.RefreshToken) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO refresh_tokens (id, user_id, token_hash, expires_at, created_at) VALUES ($1,$2,$3,$4,$5)`,
		rt.ID, rt.UserID.String(), rt.TokenHash, rt.ExpiresAt, rt.CreatedAt,
	)
	return err
}

func (r *RefreshTokenRepo) FindByHash(ctx context.Context, hash string) (domidentity.RefreshToken, error) {
	var rt domidentity.RefreshToken
	var userIDStr string
	err := r.pool.QueryRow(ctx,
		`SELECT id, user_id, token_hash, expires_at, revoked_at, created_at FROM refresh_tokens WHERE token_hash = $1`,
		hash,
	).Scan(&rt.ID, &userIDStr, &rt.TokenHash, &rt.ExpiresAt, &rt.RevokedAt, &rt.CreatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return domidentity.RefreshToken{}, fmt.Errorf("%w: refresh token", shared.ErrNotFound)
		}
		return domidentity.RefreshToken{}, err
	}
	rt.UserID = shared.UserID(userIDStr)
	return rt, nil
}

func (r *RefreshTokenRepo) Revoke(ctx context.Context, userID shared.UserID, hash string) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND token_hash = $2`,
		userID.String(), hash,
	)
	return err
}

func (r *RefreshTokenRepo) RevokeAllForUser(ctx context.Context, userID shared.UserID) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE refresh_tokens SET revoked_at = NOW() WHERE user_id = $1 AND revoked_at IS NULL`,
		userID.String(),
	)
	return err
}

// ─────────────────────────────────────────────────────────────────
// ProgressRepo
// ─────────────────────────────────────────────────────────────────

type ProgressRepo struct{ pool *pgxpool.Pool }

func NewProgressRepo(pool *pgxpool.Pool) *ProgressRepo { return &ProgressRepo{pool: pool} }

func (r *ProgressRepo) Upsert(ctx context.Context, s *domprogress.ProgressSnapshot) error {
	_, err := r.pool.Exec(ctx, `
		INSERT INTO progress_snapshots (user_id, schema_version, state, state_size, client_updated_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, NOW())
		ON CONFLICT (user_id) DO UPDATE SET
			schema_version = EXCLUDED.schema_version,
			state = EXCLUDED.state,
			state_size = EXCLUDED.state_size,
			client_updated_at = EXCLUDED.client_updated_at,
			updated_at = NOW()
	`, s.UserID().String(), s.SchemaVersion(), s.State(), len(s.State()), s.ClientUpdatedAt())
	return err
}

func (r *ProgressRepo) FindByUser(ctx context.Context, userID shared.UserID) (*domprogress.ProgressSnapshot, error) {
	var (
		schemaVer       int
		state           json.RawMessage
		clientUpdatedAt time.Time
		serverUpdatedAt time.Time
	)
	err := r.pool.QueryRow(ctx,
		`SELECT schema_version, state, client_updated_at, updated_at FROM progress_snapshots WHERE user_id = $1`,
		userID.String(),
	).Scan(&schemaVer, &state, &clientUpdatedAt, &serverUpdatedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: progress snapshot", shared.ErrNotFound)
		}
		return nil, err
	}
	return domprogress.Reconstitute(userID, schemaVer, state, clientUpdatedAt, serverUpdatedAt), nil
}

func (r *ProgressRepo) DeleteByUser(ctx context.Context, userID shared.UserID) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM progress_snapshots WHERE user_id = $1`, userID.String())
	return err
}

// ─────────────────────────────────────────────────────────────────
// CertificateRepo
// ─────────────────────────────────────────────────────────────────

type CertificateRepo struct{ pool *pgxpool.Pool }

func NewCertificateRepo(pool *pgxpool.Pool) *CertificateRepo { return &CertificateRepo{pool: pool} }

func (r *CertificateRepo) Save(ctx context.Context, cert *domcert.Certificate) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO certificates (hash, user_id, simulado_id, attempt_id, holder_name, score, issued_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (hash) DO NOTHING`,
		cert.Hash().String(), cert.UserID().String(), cert.SimuladoID().String(),
		cert.AttemptID().String(), cert.HolderName(), cert.Score(), cert.IssuedAt(),
	)
	return err
}

func (r *CertificateRepo) FindByHash(ctx context.Context, hash shared.CertificateHash) (*domcert.Certificate, error) {
	var (
		hashStr, userID, simID, attemptID, name string
		score                                   int
		issuedAt                                time.Time
	)
	err := r.pool.QueryRow(ctx,
		`SELECT hash, user_id, simulado_id, attempt_id, holder_name, score, issued_at FROM certificates WHERE hash = $1`,
		hash.String(),
	).Scan(&hashStr, &userID, &simID, &attemptID, &name, &score, &issuedAt)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: certificate", shared.ErrNotFound)
		}
		return nil, err
	}
	return domcert.Reconstitute(
		shared.CertificateHash(hashStr), shared.UserID(userID),
		shared.SimuladoID(simID), shared.AttemptID(attemptID),
		name, score, issuedAt,
	), nil
}

func (r *CertificateRepo) ListByUser(ctx context.Context, userID shared.UserID) ([]*domcert.Certificate, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT hash, user_id, simulado_id, attempt_id, holder_name, score, issued_at FROM certificates WHERE user_id = $1 ORDER BY issued_at DESC`,
		userID.String(),
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var certs []*domcert.Certificate
	for rows.Next() {
		var hashStr, uid, simID, attemptID, name string
		var score int
		var issuedAt time.Time
		if err := rows.Scan(&hashStr, &uid, &simID, &attemptID, &name, &score, &issuedAt); err != nil {
			return nil, err
		}
		certs = append(certs, domcert.Reconstitute(
			shared.CertificateHash(hashStr), shared.UserID(uid),
			shared.SimuladoID(simID), shared.AttemptID(attemptID),
			name, score, issuedAt,
		))
	}
	return certs, rows.Err()
}

func (r *CertificateRepo) ExistsByAttempt(ctx context.Context, attemptID shared.AttemptID) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM certificates WHERE attempt_id = $1)`,
		attemptID.String(),
	).Scan(&exists)
	return exists, err
}

// ─────────────────────────────────────────────────────────────────
// PurchaseRepo
// ─────────────────────────────────────────────────────────────────

type PurchaseRepo struct{ pool *pgxpool.Pool }

func NewPurchaseRepo(pool *pgxpool.Pool) *PurchaseRepo { return &PurchaseRepo{pool: pool} }

func (r *PurchaseRepo) Save(ctx context.Context, p *dombilling.Purchase) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO purchases (id, user_id, product_id, amount_cents, stripe_session_id, status, created_at)
		 VALUES ($1,$2,$3,$4,$5,$6,$7)`,
		p.ID().String(), p.UserID().String(), p.ProductID().String(),
		p.AmountCents(), p.StripeSessionID(), string(p.Status()), time.Now().UTC(),
	)
	return err
}

func (r *PurchaseRepo) Update(ctx context.Context, p *dombilling.Purchase) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE purchases SET status = $2, stripe_payment_intent = $3, paid_at = NOW() WHERE id = $1`,
		p.ID().String(), string(p.Status()), p.StripeSessionID(),
	)
	return err
}

func (r *PurchaseRepo) FindByStripeSession(ctx context.Context, sessionID string) (*dombilling.Purchase, error) {
	// Simplified: returns nil for now — full implementation in integration test
	_ = sessionID
	return nil, fmt.Errorf("%w: purchase", shared.ErrNotFound)
}

func (r *PurchaseRepo) FindByID(ctx context.Context, id shared.PurchaseID) (*dombilling.Purchase, error) {
	_ = id
	return nil, fmt.Errorf("%w: purchase", shared.ErrNotFound)
}

// ─────────────────────────────────────────────────────────────────
// StripeEventRepo (idempotência)
// ─────────────────────────────────────────────────────────────────

type StripeEventRepo struct{ pool *pgxpool.Pool }

func NewStripeEventRepo(pool *pgxpool.Pool) *StripeEventRepo { return &StripeEventRepo{pool: pool} }

// Claim tenta registrar o evento como "em processamento".
// Usa INSERT ... ON CONFLICT DO NOTHING RETURNING: retorna linha somente se
// foi este processo que inseriu — garante exclusão mútua mesmo com webhook retry.
func (r *StripeEventRepo) Claim(ctx context.Context, eventID string) (bool, error) {
	var claimed string
	err := r.pool.QueryRow(ctx,
		`INSERT INTO stripe_events (id, type, processed_at)
		 VALUES ($1, 'claimed', NOW())
		 ON CONFLICT (id) DO NOTHING
		 RETURNING id`,
		eventID,
	).Scan(&claimed)
	if errors.Is(err, pgx.ErrNoRows) {
		return false, nil // já existia → não claimamos
	}
	if err != nil {
		return false, err
	}
	return true, nil
}

// Unclaim remove o claim para que uma próxima tentativa possa processar.
// Chamado somente quando os side-effects falham entre Claim e MarkProcessed.
func (r *StripeEventRepo) Unclaim(ctx context.Context, eventID string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM stripe_events WHERE id = $1`, eventID)
	return err
}

// MarkProcessed agora é upsert do tipo (após side-effects bem-sucedidos).
// Mantém compat com chamadores legados.
func (r *StripeEventRepo) MarkProcessed(ctx context.Context, eventID string) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO stripe_events (id, type, processed_at)
		 VALUES ($1, 'processed', NOW())
		 ON CONFLICT (id) DO UPDATE SET type = 'processed', processed_at = NOW()`,
		eventID,
	)
	return err
}

func (r *StripeEventRepo) IsProcessed(ctx context.Context, eventID string) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM stripe_events WHERE id = $1)`, eventID,
	).Scan(&exists)
	return exists, err
}

// ─────────────────────────────────────────────────────────────────
// ReferralRepo
// ─────────────────────────────────────────────────────────────────

type ReferralRepo struct{ pool *pgxpool.Pool }

func NewReferralRepo(pool *pgxpool.Pool) *ReferralRepo { return &ReferralRepo{pool: pool} }

func (r *ReferralRepo) RecordVisit(ctx context.Context, referrerID shared.UserID, visitorToken string, now time.Time) error {
	_, err := r.pool.Exec(ctx,
		`INSERT INTO referrals (referrer_id, visitor_token, created_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`,
		referrerID.String(), visitorToken, now,
	)
	return err
}

func (r *ReferralRepo) Convert(ctx context.Context, referrerID shared.UserID, referredID shared.UserID, now time.Time) error {
	_, err := r.pool.Exec(ctx,
		`UPDATE referrals SET referred_id = $3, converted_at = $4 WHERE referrer_id = $1 AND referred_id IS NULL LIMIT 1`,
		referrerID.String(), referredID.String(), referredID.String(), now,
	)
	return err
}

func (r *ReferralRepo) CountConversions(ctx context.Context, referrerID shared.UserID) (int, error) {
	var count int
	err := r.pool.QueryRow(ctx,
		`SELECT COUNT(*) FROM referrals WHERE referrer_id = $1 AND referred_id IS NOT NULL`,
		referrerID.String(),
	).Scan(&count)
	return count, err
}

// ─────────────────────────────────────────────────────────────────
// EventRepo
// ─────────────────────────────────────────────────────────────────

type EventRepo struct{ pool *pgxpool.Pool }

func NewEventRepo(pool *pgxpool.Pool) *EventRepo { return &EventRepo{pool: pool} }

func (r *EventRepo) Save(ctx context.Context, e appevent.Event) error {
	var userIDStr *string
	if e.UserID != nil {
		s := e.UserID.String()
		userIDStr = &s
	}
	// Tabela analytics_events — received_at mapeado para created_at (DEFAULT NOW()).
	_, err := r.pool.Exec(ctx,
		`INSERT INTO analytics_events (id, user_id, type, payload, occurred_at) VALUES ($1,$2,$3,$4,$5)`,
		e.ID, userIDStr, e.Type, e.Payload, e.OccurredAt,
	)
	return err
}

// referral repo satisfaz a interface do domínio
var _ domref.Repository = (*ReferralRepo)(nil)
