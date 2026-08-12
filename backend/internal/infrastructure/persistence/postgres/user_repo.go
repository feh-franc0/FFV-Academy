package postgres

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/domain/identity"
	"github.com/fernandofv/api/internal/domain/shared"
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

// Save persiste um novo usuário e seus produtos pagos dentro de uma única transação.
//
// ATOMICIDADE: Se a inserção de qualquer user_product falhar após o INSERT do usuário,
// a transação inteira é revertida — evita o estado corrompido onde o usuário existe
// no banco mas não tem acesso ao produto pelo qual pagou.
func (r *UserRepo) Save(ctx context.Context, user *identity.User) error {
	const insertUser = `
		INSERT INTO users (id, email, phone, name, marketing_consent, referral_id, role, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
	`
	const insertProduct = `INSERT INTO user_products (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`

	// Abre transação — garante que usuário + produtos são inseridos atomicamente.
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("user repo: begin tx: %w", err)
	}
	// Rollback automático se Commit não for chamado (pânico, return antecipado, etc.).
	defer tx.Rollback(ctx) //nolint:errcheck

	_, err = tx.Exec(ctx, insertUser,
		user.ID().String(),
		user.Email().String(),
		user.Phone().String(),
		user.Name(),
		user.MarketingConsent(),
		user.ReferralID().String(),
		string(user.Role()),
		user.CreatedAt(),
	)
	if err != nil {
		if isUniqueViolation(err) {
			return fmt.Errorf("%w: email ou telefone já cadastrado", shared.ErrConflict)
		}
		return fmt.Errorf("user repo: save: %w", err)
	}

	for _, pid := range user.PaidProducts() {
		if _, err := tx.Exec(ctx, insertProduct, user.ID().String(), pid.String()); err != nil {
			return fmt.Errorf("user repo: save product %s: %w", pid, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("user repo: commit save: %w", err)
	}
	return nil
}

// Update persiste alterações no usuário e sincroniza produtos dentro de uma transação.
//
// ATOMICIDADE: Se o grant de qualquer produto falhar, a atualização do perfil é
// revertida junto — o cliente recebe erro e pode tentar novamente de forma segura.
func (r *UserRepo) Update(ctx context.Context, user *identity.User) error {
	const updateUser = `
		UPDATE users SET
			name = $2,
			phone = $3,
			marketing_consent = $4,
			updated_at = $5
		WHERE id = $1 AND deleted_at IS NULL
	`
	const insertProduct = `INSERT INTO user_products (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`

	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("user repo: begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	res, err := tx.Exec(ctx, updateUser,
		user.ID().String(),
		user.Name(),
		user.Phone().String(),
		user.MarketingConsent(),
		time.Now().UTC(),
	)
	if err != nil {
		return fmt.Errorf("user repo: update: %w", err)
	}
	if res.RowsAffected() == 0 {
		return fmt.Errorf("%w: user", shared.ErrNotFound)
	}

	// Sincroniza paid_products dentro da mesma transação — grant e update são atômicos.
	for _, pid := range user.PaidProducts() {
		if _, err := tx.Exec(ctx, insertProduct, user.ID().String(), pid.String()); err != nil {
			return fmt.Errorf("user repo: sync product %s: %w", pid, err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("user repo: commit update: %w", err)
	}
	return nil
}

// FindByID filtra deleted_at IS NULL — user deletado não deve ser retornado
// para consumidores do domínio (LGPD + consistência com FindByEmail).
func (r *UserRepo) FindByID(ctx context.Context, id shared.UserID) (*identity.User, error) {
	const q = `
		SELECT u.id, u.email, u.phone, u.name, u.created_at, u.marketing_consent,
		       u.referral_id, u.role, u.deleted_at,
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
		       COALESCE(array_agg(up.product_id) FILTER (WHERE up.product_id IS NOT NULL), '{}') AS paid_products
		FROM users u
		LEFT JOIN user_products up ON up.user_id = u.id
		WHERE u.email = $1 AND u.deleted_at IS NULL
		GROUP BY u.id
	`
	return r.scanUser(ctx, q, email.String())
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

// SoftDelete atende ao pedido de exclusão de conta (LGPD art. 18, V e VI).
//
// ─── Por que não é só `deleted_at = now()` ───
//
// Até ago/2026 este método fazia exatamente isso: marcava a data e nada mais. O
// resultado é que "excluir a conta" apenas trancava a porta — e-mail, telefone e
// nome continuavam na linha por tempo indeterminado, o estado de progresso
// continuava inteiro, e o nome seguia listado no ranking público, porque a query
// do ranking fazia JOIN em `users` sem filtrar `deleted_at` (corrigido junto).
// Para quem pediu exclusão, o dado permanecia; só ficava invisível para o próprio
// titular. É o inverso do que o pedido significa.
//
// O que este método faz agora, atomicamente:
//
//  1. Substitui os identificadores diretos por tombstone. O e-mail vira
//     `deleted-<id>@deleted.invalid` (`.invalid` é TLD reservado pela RFC 2606,
//     não roteável) porque a coluna é NOT NULL UNIQUE e não aceita NULL nem
//     duplicata. Efeito colateral desejável: libera o e-mail original para um
//     cadastro futuro, se a pessoa voltar.
//  2. Apaga o snapshot de progresso — XP, streak, cartas de SRS, bookmarks,
//     último artigo lido. É dado pessoal derivado, sem outra base legal.
//  3. Apaga a participação no ranking e o opt-in que a autorizava.
//  4. Desassocia os eventos de analytics em vez de apagá-los: o FK já era
//     `ON DELETE SET NULL`, ou seja, o desenho original já tratava esses eventos
//     como retíveis desde que anônimos. Agregado histórico sobrevive, o vínculo
//     com a pessoa não.
//
// O que este método deliberadamente NÃO apaga, e por quê:
//
//   - `purchases` — registro fiscal, tem base legal própria (obrigação legal).
//   - `certificates` — guardam `holder_name` e são verificáveis por terceiros
//     (empregador conferindo um certificado). Apagar invalida um documento já
//     emitido; anonimizar torna-o inútil. Decisão do titular do produto,
//     rastreada como E-4 em PLANO_MESTRE_PENDENCIAS_2026-08.md.
//   - `simulado_attempts` — sustentam a integridade dos certificados via FK.
//   - `comments` — conteúdo público de autoria; remover fala alheia do fio é
//     decisão de política, não de implementação. Também E-4.
//
// Enquanto E-4 não for decidida, a `/privacidade` não pode prometer eliminação
// total: o texto precisa descrever exatamente este recorte.
func (r *UserRepo) SoftDelete(ctx context.Context, id shared.UserID, now time.Time) error {
	tx, err := r.pool.Begin(ctx)
	if err != nil {
		return fmt.Errorf("user repo: soft delete: begin tx: %w", err)
	}
	defer tx.Rollback(ctx) //nolint:errcheck

	res, err := tx.Exec(ctx, `
		UPDATE users
		   SET deleted_at = $2,
		       updated_at = $2,
		       email      = 'deleted-' || id || '@deleted.invalid',
		       phone      = '',
		       name       = ''
		 WHERE id = $1 AND deleted_at IS NULL`,
		id.String(), now,
	)
	if err != nil {
		return fmt.Errorf("user repo: soft delete: %w", err)
	}
	if res.RowsAffected() == 0 {
		// Idempotente pelo lado de fora: conta inexistente e conta já excluída são
		// indistinguíveis para quem chama, e é a resposta certa nos dois casos.
		return fmt.Errorf("%w: user", shared.ErrNotFound)
	}

	for _, stmt := range []string{
		`DELETE FROM progress_snapshots WHERE user_id = $1`,
		`DELETE FROM leaderboard WHERE user_id = $1`,
		`DELETE FROM leaderboard_opt_ins WHERE user_id = $1`,
		`UPDATE analytics_events SET user_id = NULL WHERE user_id = $1`,
	} {
		if _, err := tx.Exec(ctx, stmt, id.String()); err != nil {
			return fmt.Errorf("user repo: soft delete: purgar dados derivados: %w", err)
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return fmt.Errorf("user repo: soft delete: commit: %w", err)
	}
	return nil
}

// ListForAdmin usa COUNT(*) OVER () para obter total + página em 1 roundtrip.
// Antes: 2 queries separadas (COUNT + SELECT) — duplicava latência a cada GET.
func (r *UserRepo) ListForAdmin(ctx context.Context, limit, offset int) ([]*identity.User, int, error) {
	rows, err := r.pool.Query(ctx,
		`SELECT u.id, u.email, u.phone, u.name, u.created_at, u.marketing_consent,
		        u.referral_id, u.role, u.deleted_at,
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
		paidProductStrs  []string
		total            int
	)
	if err := row.Scan(
		&idStr, &emailStr, &phoneStr, &name, &createdAt,
		&marketingConsent, &referralIDStr, &roleStr, &deletedAt,
		&paidProductStrs, &total,
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
		paidProductStrs  []string
	)

	if err := row.Scan(
		&idStr, &emailStr, &phoneStr, &name, &createdAt,
		&marketingConsent, &referralIDStr, &roleStr, &deletedAt,
		&paidProductStrs,
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
	), nil
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
