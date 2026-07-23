-- Rollback da 000045 — remove campos da Fase 3 do PERSONALIZATION_PLAN.

DROP INDEX IF EXISTS idx_user_preferences_home_base;
DROP INDEX IF EXISTS idx_user_preferences_interested_bases;

ALTER TABLE user_preferences
    DROP CONSTRAINT IF EXISTS user_preferences_learning_goals_length,
    DROP CONSTRAINT IF EXISTS user_preferences_frequency_kind_valid;

ALTER TABLE user_preferences
    DROP COLUMN IF EXISTS preferred_materials,
    DROP COLUMN IF EXISTS frequency_payload,
    DROP COLUMN IF EXISTS frequency_kind,
    DROP COLUMN IF EXISTS topic_tags,
    DROP COLUMN IF EXISTS learning_goals,
    DROP COLUMN IF EXISTS home_base,
    DROP COLUMN IF EXISTS interested_bases;
