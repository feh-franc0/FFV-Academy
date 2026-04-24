-- Alinha schema com o que attempt_repo e progress_repo realmente escrevem.
-- Sem esta migration os UPDATE quebram em produção assim que um attempt finaliza.

-- simulado_attempts: adicionar colunas faltantes.
ALTER TABLE simulado_attempts
    ADD COLUMN IF NOT EXISTS updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS passed        BOOLEAN,
    ADD COLUMN IF NOT EXISTS score_details JSONB;

-- Backfill updated_at com started_at para linhas preexistentes (coerente com criação).
UPDATE simulado_attempts SET updated_at = started_at WHERE updated_at IS NULL;

-- progress_snapshots: adicionar state_size e renomear server_updated_at → updated_at
-- para alinhar com o código (progress_repo usa "updated_at").
ALTER TABLE progress_snapshots
    ADD COLUMN IF NOT EXISTS state_size INT NOT NULL DEFAULT 0;

-- Renomeia somente se ainda não foi renomeado (idempotente).
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'progress_snapshots' AND column_name = 'server_updated_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'progress_snapshots' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE progress_snapshots RENAME COLUMN server_updated_at TO updated_at;
    END IF;
END$$;

-- Backfill state_size (aproxima: length do JSONB em bytes).
UPDATE progress_snapshots SET state_size = OCTET_LENGTH(state::text) WHERE state_size = 0;
