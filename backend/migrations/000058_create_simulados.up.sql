-- Cria tabela simulados para extrair do catalog.json embedded.
-- Base slug FK liga simulado à sua base de conhecimento.

CREATE TABLE IF NOT EXISTS simulados (
    id             TEXT PRIMARY KEY,
    base_slug      TEXT NOT NULL REFERENCES bases(slug) ON DELETE RESTRICT,
    certification  TEXT NOT NULL DEFAULT '',
    title          TEXT NOT NULL,
    description    TEXT NOT NULL DEFAULT '',
    price_cents    INT  NOT NULL DEFAULT 0,
    question_count INT  NOT NULL DEFAULT 0,
    time_limit_min INT  NOT NULL DEFAULT 90,
    passing_score  INT  NOT NULL DEFAULT 70,
    topics         JSONB NOT NULL DEFAULT '[]',
    status         TEXT NOT NULL DEFAULT 'active',
    position       INT  NOT NULL DEFAULT 0,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT simulados_status_valid
        CHECK (status IN ('active', 'coming_soon', 'archived')),
    CONSTRAINT simulados_passing_score_valid
        CHECK (passing_score BETWEEN 0 AND 100),
    CONSTRAINT simulados_question_count_non_negative
        CHECK (question_count >= 0),
    CONSTRAINT simulados_time_limit_positive
        CHECK (time_limit_min > 0)
);

CREATE INDEX IF NOT EXISTS idx_simulados_base
    ON simulados(base_slug, position);
