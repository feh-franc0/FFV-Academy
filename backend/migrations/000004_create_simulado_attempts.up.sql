-- simulado_attempts: tentativas de simulado (server-authoritative)
-- answers/flags/score como JSONB — schema pertence ao domínio Go
CREATE TABLE IF NOT EXISTS simulado_attempts (
    id          TEXT        PRIMARY KEY,
    user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    simulado_id TEXT        NOT NULL,
    status      TEXT        NOT NULL DEFAULT 'active', -- 'active' | 'finished'
    answers     JSONB       NOT NULL DEFAULT '{}',     -- map[questionID]optionID
    review_flags JSONB      NOT NULL DEFAULT '[]',     -- []questionID
    score       JSONB,                                  -- ScoreResult | null
    deadline    TIMESTAMPTZ NOT NULL,
    started_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ,

    -- Garante que um usuário só tem uma attempt ativa por simulado
    CONSTRAINT uq_active_attempt UNIQUE (user_id, simulado_id, status)
);

CREATE INDEX IF NOT EXISTS idx_attempts_user_id ON simulado_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_attempts_user_simulado ON simulado_attempts(user_id, simulado_id);
