-- analytics_events: eventos de analytics (fire-and-forget)
-- Schema: type + payload JSONB — extensível sem migrations para novos eventos
CREATE TABLE IF NOT EXISTS analytics_events (
    id          TEXT        PRIMARY KEY,
    user_id     TEXT        REFERENCES users(id) ON DELETE SET NULL,
    type        TEXT        NOT NULL,
    payload     JSONB       NOT NULL DEFAULT '{}',
    occurred_at TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_type ON analytics_events(type);
CREATE INDEX IF NOT EXISTS idx_events_occurred ON analytics_events(occurred_at DESC);
