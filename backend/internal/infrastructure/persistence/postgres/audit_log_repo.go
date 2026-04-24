// Package postgres — AuditLogRepo persiste e consulta eventos de auditoria HTTP
// na tabela audit_log. Inserções são fire-and-forget: falhas não quebram a request.
package postgres

import (
	"context"
	"fmt"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

// AuditLogRepo persiste e lista eventos de auditoria no PostgreSQL.
// Inserções são fire-and-forget — falhas não quebram a request principal.
type AuditLogRepo struct {
	pool *pgxpool.Pool
}

// NewAuditLogRepo cria um novo repositório de audit log.
func NewAuditLogRepo(pool *pgxpool.Pool) *AuditLogRepo {
	return &AuditLogRepo{pool: pool}
}

// LogEntry representa uma entrada no log de auditoria HTTP.
// Registra metadados da ação sem armazenar o body completo (privacidade).
type LogEntry struct {
	UserID     *string // nil para usuários não autenticados
	Action     string  // "METHOD /path"
	StatusCode int
	IP         string
	UserAgent  string
	RequestID  string
}

// AuditLogRow é a linha lida do banco de dados, usada nas respostas de listagem.
type AuditLogRow struct {
	ID         string    `json:"id"`
	UserID     *string   `json:"user_id,omitempty"`
	Action     string    `json:"action"`
	StatusCode int       `json:"status_code"`
	IP         string    `json:"ip"`
	UserAgent  string    `json:"user_agent"`
	RequestID  string    `json:"request_id"`
	CreatedAt  time.Time `json:"created_at"`
}

// AuditLogFilter define os filtros e paginação para a listagem do audit log.
type AuditLogFilter struct {
	UserID string     // filtra por user_id exato (opcional)
	Action string     // filtra por prefixo de ação usando LIKE (opcional)
	From   *time.Time // data de início (opcional)
	To     *time.Time // data de fim (opcional)
	Limit  int
	Offset int
}

// AdminAuditReader é a interface de leitura do audit log para o handler admin.
// Separa a leitura da escrita — admin lê, middleware escreve.
type AdminAuditReader interface {
	List(ctx context.Context, filter AuditLogFilter) ([]AuditLogRow, int, error)
}

// Insert persiste uma entrada de auditoria no banco.
// Usa um background context com timeout de 2s para não cancelar junto com a request.
func (r *AuditLogRepo) Insert(ctx context.Context, entry LogEntry) error {
	// Usa background context para não cancelar junto com a request principal.
	// Timeout de 2s: suficiente para uma INSERT simples sem degradar latência.
	bgCtx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	const q = `
		INSERT INTO audit_log (user_id, action, status_code, ip, user_agent, request_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
	`
	_, err := r.pool.Exec(bgCtx, q,
		entry.UserID,
		entry.Action,
		entry.StatusCode,
		entry.IP,
		entry.UserAgent,
		entry.RequestID,
	)
	return err
}

// List retorna entradas do audit_log paginadas e filtradas.
// Retorna também a contagem total (para paginação no frontend).
func (r *AuditLogRepo) List(ctx context.Context, filter AuditLogFilter) ([]AuditLogRow, int, error) {
	// Constrói query dinâmica com filtros opcionais.
	args := []interface{}{}
	where := "WHERE 1=1"
	argIdx := 1

	if filter.UserID != "" {
		where += fmt.Sprintf(" AND user_id = $%d", argIdx)
		args = append(args, filter.UserID)
		argIdx++
	}
	if filter.Action != "" {
		where += fmt.Sprintf(" AND action LIKE $%d", argIdx)
		args = append(args, filter.Action+"%")
		argIdx++
	}
	if filter.From != nil {
		where += fmt.Sprintf(" AND created_at >= $%d", argIdx)
		args = append(args, filter.From)
		argIdx++
	}
	if filter.To != nil {
		where += fmt.Sprintf(" AND created_at <= $%d", argIdx)
		args = append(args, filter.To)
		argIdx++
	}

	// Contagem total para paginação.
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM audit_log %s", where)
	var total int
	if err := r.pool.QueryRow(ctx, countQuery, args...).Scan(&total); err != nil {
		return nil, 0, fmt.Errorf("audit_log: count: %w", err)
	}

	// Query paginada — ORDER BY created_at DESC para exibir eventos recentes primeiro.
	args = append(args, filter.Limit, filter.Offset)
	dataQuery := fmt.Sprintf(`
		SELECT id, user_id, action, status_code, ip, user_agent, request_id, created_at
		FROM audit_log
		%s
		ORDER BY created_at DESC
		LIMIT $%d OFFSET $%d
	`, where, argIdx, argIdx+1)

	rows, err := r.pool.Query(ctx, dataQuery, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("audit_log: query: %w", err)
	}
	defer rows.Close()

	var entries []AuditLogRow
	for rows.Next() {
		var row AuditLogRow
		if err := rows.Scan(
			&row.ID, &row.UserID, &row.Action, &row.StatusCode,
			&row.IP, &row.UserAgent, &row.RequestID, &row.CreatedAt,
		); err != nil {
			return nil, 0, fmt.Errorf("audit_log: scan: %w", err)
		}
		entries = append(entries, row)
	}
	if err := rows.Err(); err != nil {
		return nil, 0, fmt.Errorf("audit_log: rows: %w", err)
	}

	return entries, total, nil
}
