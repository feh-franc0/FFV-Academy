-- Content reports: denúncias de spam, abuso, off-topic feitas por usuários
-- contra comentários, artigos ou outros usuários. Workflow: open → reviewed
-- pelo admin → acted (ação tomada) ou dismissed (sem fundamento).
--
-- Polimórfico via (target_type, target_id), igual `comments` — sem FK
-- explícita para o target, validação na app layer.
--
-- HANDLERS HTTP AINDA NÃO EXISTEM. Schema preparado.

CREATE TABLE content_reports (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_user_id   TEXT NOT NULL,
    target_type        TEXT NOT NULL,
    target_id          TEXT NOT NULL,
    reason             TEXT NOT NULL,
    description        TEXT,
    status             TEXT NOT NULL DEFAULT 'open',
    resolved_by        TEXT,
    resolved_at        TIMESTAMPTZ,
    resolution_note    TEXT,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT content_reports_target_type_valid
        CHECK (target_type IN ('comment', 'article', 'user')),
    CONSTRAINT content_reports_reason_valid
        CHECK (reason IN ('spam', 'abuse', 'off-topic', 'plagiarism',
                          'misinformation', 'inappropriate', 'other')),
    CONSTRAINT content_reports_status_valid
        CHECK (status IN ('open', 'reviewed', 'dismissed', 'acted')),
    CONSTRAINT content_reports_description_length
        CHECK (description IS NULL OR length(description) BETWEEN 1 AND 2000),
    CONSTRAINT content_reports_resolved_consistency
        CHECK (
            (status IN ('open', 'reviewed') AND resolved_at IS NULL AND resolved_by IS NULL)
            OR
            (status IN ('dismissed', 'acted') AND resolved_at IS NOT NULL)
        ),

    CONSTRAINT fk_content_reports_reporter
        FOREIGN KEY (reporter_user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_content_reports_resolver
        FOREIGN KEY (resolved_by) REFERENCES users(id)
        ON DELETE SET NULL
);

-- Index principal: fila de moderação (open primeiro, mais antigo primeiro).
CREATE INDEX idx_content_reports_open_queue
    ON content_reports(created_at ASC)
    WHERE status = 'open';

-- Index para "reports sobre X" (admin investigando).
CREATE INDEX idx_content_reports_target
    ON content_reports(target_type, target_id, created_at DESC);

-- Index para "meus reports" do usuário.
CREATE INDEX idx_content_reports_reporter
    ON content_reports(reporter_user_id, created_at DESC);

COMMENT ON TABLE  content_reports             IS 'Denúncias de conteúdo. Workflow open → reviewed → dismissed|acted.';
COMMENT ON COLUMN content_reports.reason      IS 'Categoria padronizada (spam, abuse, off-topic, ...).';
COMMENT ON COLUMN content_reports.description IS 'Detalhes adicionais do reporter (texto livre).';
COMMENT ON COLUMN content_reports.resolution_note IS 'Nota do admin ao resolver (visível só para admin).';
