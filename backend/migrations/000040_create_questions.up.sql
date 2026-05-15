-- questions: banco de questões de simulados (CLF-C02, DVA-C02, etc.)
-- Schema rico de explicação armazenado como JSONB.
-- Seed via cmd/seed-clf-questions.

CREATE TABLE IF NOT EXISTS questions (
    id            TEXT        PRIMARY KEY,          -- ex: "clf-cc-001"
    simulado_id   TEXT        NOT NULL,             -- ex: "aws-clf", "aws-dva"
    stem          TEXT        NOT NULL,
    options       JSONB       NOT NULL,             -- [{id:"A",text:"..."},...]
    correct_id    TEXT        NOT NULL,             -- "A" | "B" | "C" | "D"
    explanation   JSONB       NOT NULL DEFAULT '{}', -- QuestionExplanation
    topic         TEXT        NOT NULL,             -- subtópico livre
    domain        TEXT        NOT NULL,             -- domínio canônico do blueprint
    difficulty    TEXT        NOT NULL DEFAULT 'medium',
    scenario_type TEXT,
    tags          JSONB       NOT NULL DEFAULT '[]'::jsonb,
    source        TEXT,
    status        TEXT        NOT NULL DEFAULT 'active',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT questions_difficulty_valid CHECK (
        difficulty IN ('easy', 'medium', 'hard')
    ),
    CONSTRAINT questions_status_valid CHECK (
        status IN ('active', 'draft', 'archived')
    ),
    CONSTRAINT questions_correct_id_valid CHECK (
        correct_id IN ('A', 'B', 'C', 'D', 'E')
    ),
    CONSTRAINT questions_stem_length CHECK (length(stem) BETWEEN 10 AND 2000)
);

CREATE INDEX IF NOT EXISTS idx_questions_simulado_domain
    ON questions (simulado_id, domain)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_questions_simulado_difficulty
    ON questions (simulado_id, difficulty)
    WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_questions_simulado_random
    ON questions (simulado_id, id)
    WHERE status = 'active';
