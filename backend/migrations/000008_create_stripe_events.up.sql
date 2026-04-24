-- stripe_events: log de eventos do Stripe para idempotência de webhooks
-- Inserir ANTES de processar; se já existe → evento já foi processado
CREATE TABLE IF NOT EXISTS stripe_events (
    stripe_event_id TEXT        PRIMARY KEY,
    event_type      TEXT        NOT NULL,
    processed_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
