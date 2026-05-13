-- Article ratings: avaliação 1-5 dos módulos pelos usuários.
-- 1 rating por (user, article) — PK composta. Mudança = UPDATE.
-- Feedback opcional (texto livre, máx 2000 chars).
--
-- HANDLERS HTTP AINDA NÃO EXISTEM. Schema preparado.
--
-- Hoje há `moduleRatings` no GameState (localStorage) — quando ativar
-- handlers, fazer migração one-time (push) dos ratings locais pro DB.

CREATE TABLE article_ratings (
    user_id        UUID NOT NULL,
    article_slug   TEXT NOT NULL,
    rating         SMALLINT NOT NULL,
    feedback       TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, article_slug),

    CONSTRAINT article_ratings_rating_valid
        CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT article_ratings_feedback_length
        CHECK (feedback IS NULL OR length(feedback) BETWEEN 1 AND 2000),

    CONSTRAINT fk_article_ratings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_article_ratings_article
        FOREIGN KEY (article_slug) REFERENCES curriculum_articles(slug)
        ON DELETE CASCADE
);

-- Index para média/distribuição por artigo (dashboard admin).
CREATE INDEX idx_article_ratings_article
    ON article_ratings(article_slug, rating);

-- Index para "meus ratings" no profile.
CREATE INDEX idx_article_ratings_user
    ON article_ratings(user_id, updated_at DESC);

COMMENT ON TABLE  article_ratings          IS 'Avaliação 1-5 de artigos por usuários. Único por (user, article).';
COMMENT ON COLUMN article_ratings.rating   IS 'Nota de 1 (péssimo) a 5 (excelente).';
COMMENT ON COLUMN article_ratings.feedback IS 'Comentário textual opcional. Máx 2000 chars.';
