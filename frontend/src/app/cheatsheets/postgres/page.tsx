import type { Metadata } from 'next';
import { CheatsheetLayout } from '@/components/CheatsheetLayout';

export const metadata: Metadata = {
  title: 'Cheatsheet Postgres — FFV Academy',
  description: 'Postgres essencial: índices que funcionam, EXPLAIN ANALYZE na prática, MVCC, VACUUM, transações, backup. Em PT-BR.',
  keywords: 'cheatsheet postgres, explain analyze postgres, indices postgres, mvcc vacuum, pg_dump restore',
};

export default function Page() {
  return (
    <CheatsheetLayout
      title="Postgres essencial"
      subtitle="Comandos e consultas que você vai usar toda semana em produção."
      accent="#336791"
      emoji="🐘"
    >
      <section>
        <h2>Índices</h2>
        <pre><code>{`-- B-tree (padrão, ordenação, igualdade, range)
CREATE INDEX idx_users_email ON users(email);

-- Composto: primeira coluna MANDA (ordem importa)
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);

-- Parcial: só indexa o que importa (menor, mais rápido)
CREATE INDEX idx_orders_pending ON orders(id) WHERE status = 'pending';

-- Expression: índice em função
CREATE INDEX idx_users_lower_email ON users(LOWER(email));

-- GIN: full-text search, jsonb, arrays
CREATE INDEX idx_posts_fts ON posts USING GIN (to_tsvector('portuguese', body));
CREATE INDEX idx_posts_tags ON posts USING GIN (tags);

-- Listar índices de uma tabela
SELECT indexname, indexdef FROM pg_indexes WHERE tablename = 'users';`}</code></pre>
      </section>

      <section>
        <h2>EXPLAIN ANALYZE — leitura rápida</h2>
        <pre><code>{`EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT * FROM orders WHERE user_id = 123 ORDER BY created_at DESC LIMIT 10;

-- Sinais ruins:
-- Seq Scan em tabela grande  → falta índice
-- Rows Removed by Filter >> 0  → índice inadequado
-- Rows (estimado) muito diferente do real  → ANALYZE não rodou / stats antigas
-- Buffers: read >> Buffers: hit  → cache cold / bufferpool pequeno

-- Sinais bons:
-- Index Scan / Index Only Scan
-- Nested Loop com pequenas tabelas externas, Hash Join para joins grandes`}</code></pre>
      </section>

      <section>
        <h2>MVCC + VACUUM</h2>
        <pre><code>{`-- Transação 'vê' snapshot no início (REPEATABLE READ) ou por statement (READ COMMITTED)
SELECT txid_current(), txid_current_snapshot();

-- Dead tuples acumulados → bloat. VACUUM marca espaço livre.
VACUUM (VERBOSE, ANALYZE) orders;

-- VACUUM FULL re-escreve tabela (ACQUIRES ACCESS EXCLUSIVE LOCK — evite em prod)
-- Alternativa sem lock: pg_repack extension

-- Tabelas com alta rotatividade: ajustar autovacuum
ALTER TABLE orders SET (autovacuum_vacuum_scale_factor = 0.05);`}</code></pre>
      </section>

      <section>
        <h2>Transações</h2>
        <pre><code>{`BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- ou ROLLBACK;

-- Savepoints (nested transactions)
SAVEPOINT sp1;
-- ...
ROLLBACK TO sp1;

-- Níveis de isolamento
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;  -- mais forte, mais lento

-- Advisory locks (application-level)
SELECT pg_try_advisory_lock(12345);
SELECT pg_advisory_unlock(12345);`}</code></pre>
      </section>

      <section>
        <h2>Backup / Restore</h2>
        <pre><code>{`# Backup lógico
pg_dump -Fc -d mydb -f mydb.dump
pg_restore -d mydb_new mydb.dump

# Backup só schema
pg_dump --schema-only -d mydb

# Backup físico contínuo (WAL)
pg_basebackup -D /backup/base -Ft -P
# + arquivamento WAL via archive_command

# Restore point-in-time (PITR) requer WAL archive + base backup`}</code></pre>
      </section>

      <section>
        <h2>Replicação</h2>
        <pre><code>{`-- Ver lag de replica
SELECT application_name, client_addr,
       pg_wal_lsn_diff(sent_lsn, replay_lsn) AS lag_bytes
FROM pg_stat_replication;

-- Logical replication (replica selective)
CREATE PUBLICATION mypub FOR TABLE orders, users;
-- No subscriber:
CREATE SUBSCRIPTION mysub CONNECTION 'host=primary ...' PUBLICATION mypub;`}</code></pre>
      </section>

      <section>
        <h2>Queries úteis de operação</h2>
        <pre><code>{`-- Tabelas maiores
SELECT relname, pg_size_pretty(pg_total_relation_size(oid)) AS size
FROM pg_class WHERE relkind = 'r' ORDER BY pg_total_relation_size(oid) DESC LIMIT 10;

-- Connections ativas
SELECT pid, state, query_start, wait_event_type, wait_event, LEFT(query, 80)
FROM pg_stat_activity WHERE state != 'idle';

-- Kill query travada
SELECT pg_cancel_backend(PID);   -- soft
SELECT pg_terminate_backend(PID); -- hard`}</code></pre>
      </section>
    </CheatsheetLayout>
  );
}
