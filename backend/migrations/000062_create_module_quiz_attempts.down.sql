-- Reverte migration 000062

DROP INDEX IF EXISTS idx_mqa_quiz;
DROP INDEX IF EXISTS idx_mqa_user_next_review;
DROP TABLE IF EXISTS module_quiz_attempts;
