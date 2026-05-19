-- Migration 000045 — Estende user_preferences com Fase 3 do PERSONALIZATION_PLAN.
--
-- Adiciona campos pra modelar a plataforma ao perfil do aluno:
--   - interested_bases: slugs das bases que o user marca como interesse
--   - home_base: slug da base "home" (redirect do / quando setado)
--   - learning_goals: texto livre ≤280 chars
--   - topic_tags: tags livres usadas pelo ranker
--   - frequency_kind + frequency_payload: ritmo declarado
--   - preferred_materials: formato preferido (video/text/quiz/srs/cheatsheet)
--
-- Todos os campos têm default seguro → migration não quebra rows existentes.

ALTER TABLE user_preferences
    ADD COLUMN interested_bases    TEXT[]   NOT NULL DEFAULT '{}',
    ADD COLUMN home_base           TEXT,
    ADD COLUMN learning_goals      TEXT     NOT NULL DEFAULT '',
    ADD COLUMN topic_tags          TEXT[]   NOT NULL DEFAULT '{}',
    ADD COLUMN frequency_kind      TEXT     NOT NULL DEFAULT 'weekly',
    ADD COLUMN frequency_payload   JSONB    NOT NULL DEFAULT '{"daysPerWeek": 3}'::jsonb,
    ADD COLUMN preferred_materials TEXT[]   NOT NULL DEFAULT ARRAY['text', 'quiz']::TEXT[];

-- Constraint: frequency_kind ∈ enum conhecido. Validação adicional na app layer.
ALTER TABLE user_preferences
    ADD CONSTRAINT user_preferences_frequency_kind_valid
    CHECK (frequency_kind IN ('daily', 'weekly', 'specific_days'));

-- Constraint: learning_goals ≤ 280 chars (espelha limite do textarea no frontend).
ALTER TABLE user_preferences
    ADD CONSTRAINT user_preferences_learning_goals_length
    CHECK (char_length(learning_goals) <= 280);

-- Índice GIN em interested_bases — query típica é "users com interesse em base X"
-- (ranker / admin dashboards).
CREATE INDEX idx_user_preferences_interested_bases
    ON user_preferences USING GIN (interested_bases);

-- Índice em home_base — query "users com homeBase setado pra redirect default".
CREATE INDEX idx_user_preferences_home_base
    ON user_preferences (home_base)
    WHERE home_base IS NOT NULL;
