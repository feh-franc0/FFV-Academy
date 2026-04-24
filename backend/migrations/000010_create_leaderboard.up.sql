-- leaderboard: XP por usuário por semana (semana começa na segunda-feira UTC)
-- Ranking calculado via RANK() window function em query time
CREATE TABLE IF NOT EXISTS leaderboard (
    user_id      TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_start   DATE        NOT NULL, -- segunda-feira UTC (ISO 8601)
    xp_gained    INT         NOT NULL DEFAULT 0,
    PRIMARY KEY (user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_week ON leaderboard(week_start, xp_gained DESC);
