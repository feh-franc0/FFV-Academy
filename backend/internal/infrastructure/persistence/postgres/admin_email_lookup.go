// admin_email_lookup: implementa domain/studyrequest.AdminEmailLookup.
//
// Lista emails de admins ativos pra alimentar o alerta de nova solicitação.
// Fonte = tabela users (role='admin'). Permite cadastro/promoção de admin
// via SQL ou UI futura sem restart do container.
package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AdminEmailLookup expõe ListAdminEmails — consulta simples na tabela users.
// Não cacheamos no adapter; o use case que decide se precisa de cache (hoje
// solicitações chegam esparsas, 1 query a cada submit é negligível).
type AdminEmailLookup struct {
	pool *pgxpool.Pool
}

func NewAdminEmailLookup(pool *pgxpool.Pool) *AdminEmailLookup {
	return &AdminEmailLookup{pool: pool}
}

// ListAdminEmails retorna emails de admins ativos em ordem alfabética.
// Filtra: role='admin' E não deletado E email não-vazio.
//
// Erros são propagados pro caller — caller (CreateUseCase) decide se cai
// pro fallback (env var) ou logga e segue sem notificação.
func (r *AdminEmailLookup) ListAdminEmails(ctx context.Context) ([]string, error) {
	rows, err := r.pool.Query(ctx, `
		SELECT email
		FROM users
		WHERE role = 'admin'
		  AND deleted_at IS NULL
		  AND email IS NOT NULL
		  AND email <> ''
		ORDER BY email
	`)
	if err != nil {
		return nil, fmt.Errorf("admin_email_lookup: query: %w", err)
	}
	defer rows.Close()

	out := make([]string, 0, 4)
	for rows.Next() {
		var email string
		if err := rows.Scan(&email); err != nil {
			return nil, fmt.Errorf("admin_email_lookup: scan: %w", err)
		}
		out = append(out, email)
	}
	return out, rows.Err()
}
