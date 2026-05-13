-- Trails: trilhas de aprendizado dentro de um hub. Ex: hub 'ia' tem
-- trilhas 'rag-essential', 'fine-tuning-llms', 'fundamentos-da-ia', etc.
--
-- Difficulty é nullable porque algumas trilhas misturam módulos de níveis
-- diferentes (curva progressiva). Quando preenchido, indica nível médio.

CREATE TABLE trails (
    id          TEXT PRIMARY KEY,
    hub_id      TEXT        NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
    name        TEXT        NOT NULL,
    short_name  TEXT,
    description TEXT        NOT NULL DEFAULT '',
    difficulty  TEXT,
    est_hours   INT,
    icon        TEXT        NOT NULL DEFAULT '',
    position    INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT trails_id_slug_format
        CHECK (id ~ '^[a-z0-9-]+$' AND length(id) BETWEEN 2 AND 80),
    CONSTRAINT trails_difficulty_valid
        CHECK (difficulty IS NULL OR difficulty IN ('beginner','intermediate','advanced')),
    CONSTRAINT trails_est_hours_sane
        CHECK (est_hours IS NULL OR est_hours BETWEEN 0 AND 500)
);

CREATE INDEX idx_trails_hub_position ON trails(hub_id, position);

COMMENT ON TABLE  trails               IS 'Trilhas dentro de hubs.';
COMMENT ON COLUMN trails.id            IS 'Slug estável (ex: rag-essential).';
COMMENT ON COLUMN trails.est_hours     IS 'Estimativa total de horas para concluir a trilha.';
