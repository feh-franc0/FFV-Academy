-- Tabela de auditoria de mutations — registra quem fez o quê e quando.
-- Permite rastrear acessos, mudanças de perfil, deleções de conta (LGPD).
-- Não armazena body completo (privacidade) — só metadados da ação.
CREATE TABLE IF NOT EXISTS audit_log (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID,            -- NULL para ações de usuários não autenticados
    action      TEXT NOT NULL,   -- ex: "POST /api/v1/me", "DELETE /api/v1/me"
    status_code INT  NOT NULL,
    ip          TEXT NOT NULL DEFAULT '',
    user_agent  TEXT NOT NULL DEFAULT '',
    request_id  TEXT NOT NULL DEFAULT '',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_log_user_id ON audit_log(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);
