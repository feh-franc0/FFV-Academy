DROP INDEX IF EXISTS uq_active_attempt;
ALTER TABLE simulado_attempts DROP COLUMN IF EXISTS question_ids;
ALTER TABLE simulado_attempts ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active';
ALTER TABLE simulado_attempts ADD CONSTRAINT uq_active_attempt UNIQUE (user_id, simulado_id, status);
