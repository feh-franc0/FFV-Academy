-- Índices para queries quentes identificadas no code review.

-- simulado_attempts.ListByUser ordena por started_at DESC com filtro por user_id.
CREATE INDEX IF NOT EXISTS idx_attempts_user_started
    ON simulado_attempts(user_id, started_at DESC);

-- ResumeAttempt faz WHERE user_id = ? AND simulado_id = ? AND status = 'active'.
-- Partial index reduz tamanho drasticamente (99% das linhas ficam como 'finished').
CREATE INDEX IF NOT EXISTS idx_attempts_active
    ON simulado_attempts(user_id, simulado_id)
    WHERE finished_at IS NULL;

-- certificates.ListByUser ordena por issued_at DESC.
CREATE INDEX IF NOT EXISTS idx_certificates_user_issued
    ON certificates(user_id, issued_at DESC);

-- refresh_tokens: busca ativa por user_id onde revoked_at IS NULL (logout flows).
CREATE INDEX IF NOT EXISTS idx_refresh_active
    ON refresh_tokens(user_id)
    WHERE revoked_at IS NULL;

-- users: admin list ordena por created_at DESC.
CREATE INDEX IF NOT EXISTS idx_users_created
    ON users(created_at DESC)
    WHERE deleted_at IS NULL;
