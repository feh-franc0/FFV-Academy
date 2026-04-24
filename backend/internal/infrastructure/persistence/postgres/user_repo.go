package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

// UserRepo implementa identity.UserRepository usando pgx.
//
// DIP: UserRepo satisfaz a interface identity.UserRepository definida no domínio.
// Zero ORM: queries SQL explícitas — simples, auditáveis, sem mágica.
type UserRepo struct {
	pool *pgxpool.Pool
}

func NewUserRepo(pool *pgxpool.Pool) *UserRepo {
	return &UserRepo{pool: pool}
}

func (r *UserRepo) Save(ctx context.Context, user *identity.User) error {
	const q = `
		INSERT INTO users (id, email, phone, name, marketing_consent, referral_id, role, google_id, avatar_url, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, NULLIF($8, ''), $9, $10, $10)
	`
	paidProducts := productIDsToStrings(user.PaidProducts())
	_, err := r.pool.Exec(ctx, q,
		user.ID().String(),
		user.Email().String(),
		user.Phone().String(),
		user.Name(),
		user.MarketingConsent(),
		user.ReferralID().String(),
		string(user.Role()),
		user.GoogleID(),
		user.AvatarURL(),
		user.CreatedAt(),
	)
	if err != nil {
		if isUniqueViolation(err) {
			return fmt.Errorf("%w: email ou telefone já cadastrado", shared.ErrConflict)
		}
		return fmt.Errorf("user repo: save: %w", err)
	}

	// Insere paid_products. Falhas aqui significam que o usuário não terá acesso
	// ao produto pelo qual pagou — portanto propagamos o erro.
	for _, pid := range paidProducts {
		if _, err := r.pool.Exec(ctx,
			`INSERT INTO user_products (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			user.ID().String(), pid,
		); err != nil {
			return fmt.Errorf("user repo: save product %s: %w", pid, err)
		}
	}
	return nil
}

func (r *UserRepo) Update(ctx context.Context, user *identity.User) error {
	const q = `
		UPDATE users SET
			name = $2,
			phone = $3,
			marketing_consent = $4,
			google_id = NULLIF($5, ''),
			avatar_url = $6,
			updated_at = $7
		WHERE id = $1 AND deleted_at IS NULL
	`
	res, err := r.pool.Exec(ctx, q,
		user.ID().String(),
		user.Name(),
		user.Phone().String(),
		user.MarketingConsent(),
		user.GoogleID(),
		user.AvatarURL(),
		time.Now().UTC(),
	)
	if err != nil {
		return fmt.Errorf("user repo: update: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("%w: user", shared.ErrNotFound)
	}

	// Sincroniza paid_products (upsert). Erro aqui quebra grant de produto.
	for _, pid := range user.PaidProducts() {
		if _, err := r.pool.Exec(ctx,
			`INSERT INTO user_products (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
			user.ID().String(), pid.String(),
		); err != nil {
			return fmt.Errorf("user repo: sync product %s: %w", pid, err)
		}
	}
	return nil
}

// FindByID filtra deleted_at IS NULL — user deletado não deve ser retornado
// para consumidores do domínio (LGPD + consistência com FindByEmail).
func (r *UserRepo) FindByID(ctx context.Context, id shared.UserID) (*identity.User, error) {
	const q = `
		SELECT u.id, u.email, u.phone, u.name, u.created_at, u.marketing_consent,
		       u.referral_id, u.role, u.deleted_at,
		       COALESCE(u.google_id, ''), COALESCE(u.avatar_url, ''),
		       COALESCE(array_agg(up.product_id) FILTER (WHERE up.product_id IS NOT NULL), '{}') AS paid_products
		FROM users u
		LEFT JOIN user_products up ON up.user_id = u.id
		WHERE u.id = $1 AND u.deleted_at IS NULL
		GROUP BY u.id
	`
	return r.scanUser(ctx, q, id.String())
}

func (r *UserRepo) FindByEmail(ctx context.Context, email identity.Email) (*identity.User, error) {
	const q = `
		SELECT u.id, u.email, u.phone, u.name, u.created_at, u.marketing_consent,
		       u.referral_id, u.role, u.deleted_at,
		       COALESCE(u.google_id, ''), COALESCE(u.avatar_url, ''),
		       COALESCE(array_agg(up.product_id) FILTER (WHERE up.product_id IS NOT NULL), '{}') AS paid_products
		FROM users u
		LEFT JOIN user_products up ON up.user_id = u.id
		WHERE u.email = $1 AND u.deleted_at IS NULL
		GROUP BY u.id
	`
	return r.scanUser(ctx, q, email.String())
}

func (r *UserRepo) FindByGoogleID(ctx context.Context, googleID string) (*identity.User, error) {
	const q = `
		SELECT u.id, u.email, u.phone, u.name, u.created_at, u.marketing_consent,
		       u.referral_id, u.role, u.deleted_at,
		       COALESCE(u.google_id, ''), COALESCE(u.avatar_url, ''),
		       COALESCE(array_agg(up.product_id) FILTER (WHERE up.product_id IS NOT NULL), '{}') AS paid_products
		FROM users u
		LEFT JOIN user_products up ON up.user_id = u.id
		WHERE u.google_id = $1 AND u.deleted_at IS NULL
		GROUP BY u.id
	`
	return r.scanUser(ctx, q, googleID)
}

func (r *UserRepo) ExistsByEmail(ctx context.Context, email identity.Email) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE email = $1 AND deleted_at IS NULL)`,
		email.String(),
	).Scan(&exists)
	return exists, err
}

func (r *UserRepo) ExistsByPhone(ctx context.Context, phone identity.Phone) (bool, error) {
	var exists bool
	err := r.pool.QueryRow(ctx,
		`SELECT EXISTS(SELECT 1 FROM users WHERE phone = $1 AND deleted_at IS NULL)`,
		phone.String(),
	).Scan(&exists)
	return exists, err
}

func (r *UserRepo) SoftDelete(ctx context.Context, id shared.UserID, now time.Time) error {
	res, err := r.pool.Exec(ctx,
		`UPDATE users SET deleted_at = $2, updated_at = $2 WHERE id = $1 AND deleted_at IS NULL`,
		id.String(), now,
	)
	if err != nil {
		return fmt.Errorf("user repo: soft delete: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("%w: user", shared.ErrNotFound)
	}
	return nil
}

// ListForAdmin usa COUNT(*) OVER () para obter total + página em 1 roundtrip.
// Antes: 2 queries separadas (COUNT + SELECT) — duplicava latência a cada GET.
func (r *UserRepo) ListForAdmin(ctx context.Context, limit, offset int) ([]*identity.User, int, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT u.id, u.email, u.phone, u.name, u.created_at, u.marketing_consent,
		        u.referral_id, u.role, u.deleted_at,
		        COALESCE(u.google_id, ''), COALESCE(u.avatar_url, ''),
		        ARRAY(SELECT product_id FROM user_products WHERE user_id = u.id) AS paid_products,
		        COUNT(*) OVER() AS total
		 FROM users u WHERE u.deleted_at IS NULL
		 ORDER BY u.created_at DESC LIMIT $1 OFFSET $2`,
		limit, offset,
	)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()

	var total int
	users := make([]*identity.User, 0, limit)
	for rows.Next() {
		u, t, scanErr := scanUserRowWithTotal(rows)
		if scanErr != nil {
			return nil, 0, scanErr
		}
		total = t
		users = append(users, u)
	}
	return users, total, rows.Err()
}

// scanUserRowWithTotal lê a linha + coluna agregada `total` adicional.
func scanUserRowWithTotal(row userScanner) (*identity.User, int, error) {
	var (
		idStr            string
		emailStr         string
		phoneStr         string
		name             string
		createdAt        time.Time
		marketingConsent bool
		referralIDStr    string
		roleStr          string
		deletedAt        *time.Time
		googleID         string
		avatarURL        string
		paidProductStrs  []string
		total            int
	)
	if err := row.Scan(
		&idStr, &emailStr, &phoneStr, &name, &createdAt,
		&marketingConsent, &referralIDStr, &roleStr, &deletedAt,
		&googleID, &avatarURL, &paidProductStrs, &total,
	); err != nil {
		return nil, 0, err
	}
	email, err := identity.NewEmail(emailStr)
	if err != nil {
		return nil, 0, fmt.Errorf("reconstruct email: %w", err)
	}
	phone, err := identity.NewPhone(phoneStr)
	if err != nil {
		return nil, 0, fmt.Errorf("reconstruct phone: %w", err)
	}
	return identity.ReconstituteUser(
		shared.UserID(idStr), email, phone, name, createdAt,
		marketingConsent, stringsToProductIDs(paidProductStrs),
		shared.ReferralID(referralIDStr), identity.Role(roleStr), deletedAt,
		googleID, avatarURL,
	), total, nil
}

// scanUser executa uma query que retorna um único usuário.
func (r *UserRepo) scanUser(ctx context.Context, query string, arg interface{}) (*identity.User, error) {
	row := r.pool.QueryRow(ctx, query, arg)
	user, err := scanUserRow(row)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("%w: user", shared.ErrNotFound)
		}
		return nil, fmt.Errorf("user repo: scan: %w", err)
	}
	return user, nil
}

// userScanner abstrai pgx.Row e pgx.Rows para reuso do scan.
type userScanner interface {
	Scan(dest ...any) error
}

func scanUserRow(row userScanner) (*identity.User, error) {
	var (
		idStr            string
		emailStr         string
		phoneStr         string
		name             string
		createdAt        time.Time
		marketingConsent bool
		referralIDStr    string
		roleStr          string
		deletedAt        *time.Time
		googleID         string
		avatarURL        string
		paidProductStrs  []string
	)

	if err := row.Scan(
		&idStr, &emailStr, &phoneStr, &name, &createdAt,
		&marketingConsent, &referralIDStr, &roleStr, &deletedAt,
		&googleID, &avatarURL, &paidProductStrs,
	); err != nil {
		return nil, err
	}

	email, err := identity.NewEmail(emailStr)
	if err != nil {
		return nil, fmt.Errorf("reconstruct email: %w", err)
	}
	phone, err := identity.NewPhone(phoneStr)
	if err != nil {
		return nil, fmt.Errorf("reconstruct phone: %w", err)
	}

	return identity.ReconstituteUser(
		shared.UserID(idStr),
		email,
		phone,
		name,
		createdAt,
		marketingConsent,
		stringsToProductIDs(paidProductStrs),
		shared.ReferralID(referralIDStr),
		identity.Role(roleStr),
		deletedAt,
		googleID,
		avatarURL,
	), nil
}

func productIDsToStrings(ids []shared.ProductID) []string {
	result := make([]string, len(ids))
	for i, id := range ids {
		result[i] = id.String()
	}
	return result
}

func stringsToProductIDs(strs []string) []shared.ProductID {
	result := make([]shared.ProductID, len(strs))
	for i, s := range strs {
		result[i] = shared.ProductID(s)
	}
	return result
}

// isUniqueViolation verifica se o erro é de violação de unicidade no Postgres.
func isUniqueViolation(err error) bool {
	if err == nil {
		return false
	}
	return contains(err.Error(), "23505") || contains(err.Error(), "unique")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsStr(s, substr))
}

func containsStr(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}
