-- Cria module_quiz_attempts para armazenar estado SM-2 de quizzes de módulo.
-- Separado de simulado_attempts: domínio diferente (SRS de fixação vs simulado).
-- user_id é TEXT para corresponder ao tipo de users.id.

CREATE TABLE IF NOT EXISTS module_quiz_attempts (
    id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_id       UUID        NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
    -- SM-2 state
    ease_factor   NUMERIC(4,2) NOT NULL DEFAULT 2.5,
    interval_days INT          NOT NULL DEFAULT 1,
    repetitions   INT          NOT NULL DEFAULT 0,
    -- última resposta
    last_answer_correct BOOLEAN,
    last_seen_at        TIMESTAMPTZ,
    next_review_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

    UNIQUE (user_id, quiz_id),
    CONSTRAINT ease_factor_sane        CHECK (ease_factor BETWEEN 1.3 AND 4.0),
    CONSTRAINT interval_positive       CHECK (interval_days >= 1),
    CONSTRAINT repetitions_non_negative CHECK (repetitions >= 0)
);

CREATE INDEX IF NOT EXISTS idx_mqa_user_next_review
    ON module_quiz_attempts(user_id, next_review_at);

CREATE INDEX IF NOT EXISTS idx_mqa_quiz
    ON module_quiz_attempts(quiz_id);
