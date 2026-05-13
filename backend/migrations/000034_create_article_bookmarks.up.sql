-- Article bookmarks: favoritos do usuário. Hoje vivem no GameState
-- (localStorage); quando handlers forem ativados, fazer push one-time.
--
-- HANDLERS HTTP AINDA NÃO EXISTEM. Schema preparado.

CREATE TABLE article_bookmarks (
    user_id        UUID NOT NULL,
    article_slug   TEXT NOT NULL,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (user_id, article_slug),

    CONSTRAINT fk_article_bookmarks_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_article_bookmarks_article
        FOREIGN KEY (article_slug) REFERENCES curriculum_articles(slug)
        ON DELETE CASCADE
);

-- Index principal: "meus bookmarks" no profile, ordem mais recente primeiro.
CREATE INDEX idx_article_bookmarks_user
    ON article_bookmarks(user_id, created_at DESC);

-- Index para "qual artigo é mais favoritado" (analytics admin).
CREATE INDEX idx_article_bookmarks_article
    ON article_bookmarks(article_slug);

COMMENT ON TABLE article_bookmarks IS 'Favoritos do usuário. Único por (user, article). Sem rich data — toggle pure.';
