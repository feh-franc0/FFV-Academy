-- Reports de usuários sobre questões (wrong_answer, typo, ambiguous, outdated, other).
-- Usado para backlog editorial + rate-limit por usuário (10/24h via COUNT).
CREATE TABLE IF NOT EXISTS question_reports (
    id           TEXT        PRIMARY KEY,
    user_id      TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    simulado_id  TEXT        NOT NULL,
    question_id  TEXT        NOT NULL,
    reason       TEXT        NOT NULL CHECK (reason IN ('wrong_answer','typo','ambiguous','outdated','other')),
    comment      TEXT        NOT NULL DEFAULT '',
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at  TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_question_reports_user_created  ON question_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_reports_question     ON question_reports(simulado_id, question_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_reports_unresolved   ON question_reports(created_at DESC) WHERE resolved_at IS NULL;
