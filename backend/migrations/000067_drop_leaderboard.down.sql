-- Reverte 000067 — recria as tabelas leaderboard e leaderboard_opt_ins
-- (espelho do estado pré-000067 vindo de 000010 e 000013).
--
-- ATENÇÃO: dados não são restaurados. Estrutura apenas.

CREATE TABLE IF NOT EXISTS leaderboard (
    user_id      TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start   DATE NOT NULL,
    display_name TEXT NOT NULL,
    xp_gained    INTEGER NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_week_xp
    ON leaderboard (week_start, xp_gained DESC);

CREATE TABLE IF NOT EXISTS leaderboard_opt_ins (
    user_id      TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    opted_in     BOOLEAN NOT NULL DEFAULT TRUE,
    display_name TEXT NOT NULL,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE bases ADD COLUMN IF NOT EXISTS hide_ranking BOOLEAN NOT NULL DEFAULT FALSE;
