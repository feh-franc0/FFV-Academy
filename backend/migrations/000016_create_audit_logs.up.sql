-- Audit log estruturado para ações sensíveis (login, delete, webhook, admin).
-- Append-only: sem UPDATE, sem DELETE (exceto política de retenção).
CREATE TABLE IF NOT EXISTS audit_logs (
    id          TEXT        PRIMARY KEY,
    actor_id    TEXT,       -- user_id do ator; NULL para atores anônimos (webhook, cron).
    actor_type  TEXT        NOT NULL, -- 'user'|'admin'|'webhook'|'system'
    action      TEXT        NOT NULL, -- 'auth.login'|'auth.logout'|'account.delete'|'billing.webhook'|...
    target_type TEXT,       -- tipo da entidade alvo (opcional): 'user'|'attempt'|'certificate'|'purchase'
    target_id   TEXT,       -- id da entidade alvo (opcional)
    metadata    JSONB       NOT NULL DEFAULT '{}'::jsonb,
    ip          TEXT,
    user_agent  TEXT,
    request_id  TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor    ON audit_logs(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_action   ON audit_logs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created  ON audit_logs(created_at DESC);

-- Retenção sugerida: manter 2 anos (LGPD compliance para logs de segurança).
-- Implementar via cron: DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '2 years';
