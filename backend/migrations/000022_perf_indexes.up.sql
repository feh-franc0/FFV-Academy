-- Índices de performance para queries de leaderboard e filtragem de attempts.
-- ANTES de criar, EXPLAIN ANALYZE nas queries mais custosas mostra full table scan.

-- Índice partial para leaderboard: filtra apenas attempts finalizados (maioria são active/cancelled).
-- WHERE status = 'finished' reduz o índice ao subconjunto relevante (<<10% das rows tipicamente).
-- Nota: sem CONCURRENTLY para compatibilidade com golang-migrate (não roda fora de transação em dev).
CREATE INDEX IF NOT EXISTS idx_attempts_finished_score
    ON simulado_attempts(simulado_id, score DESC)
    WHERE status = 'finished';

-- Índice para histórico do usuário (listagem de attempts por usuário, ordem cronológica inversa).
-- simulado_attempts usa started_at em vez de created_at.
CREATE INDEX IF NOT EXISTS idx_attempts_user_created
    ON simulado_attempts(user_id, started_at DESC);

-- Índice para busca de usuários ativos por data de criação (admin, leaderboard).
CREATE INDEX IF NOT EXISTS idx_users_created_active
    ON users(created_at DESC)
    WHERE deleted_at IS NULL;

-- Índice para leaderboard semanal (filtra por week_start frequentemente).
CREATE INDEX IF NOT EXISTS idx_leaderboard_week_xp
    ON leaderboard(week_start, xp_gained DESC);
