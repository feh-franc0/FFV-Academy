-- Reverte migration 000060

DROP INDEX IF EXISTS idx_questions_related_module;

ALTER TABLE questions
    DROP COLUMN IF EXISTS related_module_slug;

ALTER TABLE questions
    DROP CONSTRAINT IF EXISTS fk_questions_simulado;
