// Package postgres implementa os repositórios usando pgx v5.
//
// PADRÕES:
//   - DIP: cada repositório implementa a interface de port do domínio.
//   - Clean Code: queries SQL em arquivos .sql separados (futuro sqlc).
//   - Segurança: NUNCA concatenar strings em queries — apenas placeholders $N.
package postgres

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/fernandofv/api/internal/config"
)

// NewPool cria e valida o pool de conexões com o Postgres.
// Retorna erro se a conexão falhar.
func NewPool(ctx context.Context, cfg config.DBConfig) (*pgxpool.Pool, error) {
	poolConfig, err := pgxpool.ParseConfig(cfg.URL)
	if err != nil {
		return nil, fmt.Errorf("postgres: parse config: %w", err)
	}

	poolConfig.MaxConns = cfg.MaxConns
	poolConfig.MinConns = cfg.MinConns
	poolConfig.MaxConnLifetime = cfg.ConnMaxLifetime
	poolConfig.MaxConnIdleTime = cfg.ConnMaxIdleTime

	pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("postgres: create pool: %w", err)
	}

	// Testa conexão imediatamente para falhar rápido em startup.
	if err := pool.Ping(ctx); err != nil {
		pool.Close()
		return nil, fmt.Errorf("postgres: ping failed: %w", err)
	}

	return pool, nil
}
