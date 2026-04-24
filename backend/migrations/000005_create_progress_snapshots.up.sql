-- progress_snapshots: GameState do cliente como blob JSONB
-- Política LWW (last-write-wins) enforçada no domínio Go
CREATE TABLE IF NOT EXISTS progress_snapshots (
    user_id           TEXT        PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    schema_version    INT         NOT NULL DEFAULT 1,
    state             JSONB       NOT NULL DEFAULT '{}',
    client_updated_at TIMESTAMPTZ NOT NULL,
    server_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
