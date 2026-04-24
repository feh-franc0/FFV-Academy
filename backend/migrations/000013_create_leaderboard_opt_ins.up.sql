-- leaderboard_opt_ins: usuários que optaram por aparecer no ranking público
CREATE TABLE IF NOT EXISTS leaderboard_opt_ins (
    user_id     TEXT    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id)
);
