-- Comment votes: upvotes/downvotes em comentários.
-- 1 voto por (user_id, comment_id) — PK composta garante isso.
-- Mudança de voto = UPDATE, não INSERT novo.
--
-- HANDLERS HTTP AINDA NÃO EXISTEM. Schema preparado.

CREATE TABLE comment_votes (
    comment_id   UUID NOT NULL,
    user_id      TEXT NOT NULL,
    vote         SMALLINT NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    PRIMARY KEY (comment_id, user_id),

    CONSTRAINT comment_votes_vote_valid
        CHECK (vote IN (-1, 1)),

    CONSTRAINT fk_comment_votes_comment
        FOREIGN KEY (comment_id) REFERENCES comments(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comment_votes_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE
);

-- Index para agregar votos de um comment (SUM(vote) -> score).
CREATE INDEX idx_comment_votes_comment_score
    ON comment_votes(comment_id, vote);

-- Index para "votos do user" (analytics, undo).
CREATE INDEX idx_comment_votes_user
    ON comment_votes(user_id, created_at DESC);

COMMENT ON TABLE  comment_votes      IS 'Upvotes (1) e downvotes (-1) em comentários. Único por (comment, user).';
COMMENT ON COLUMN comment_votes.vote IS '-1 = downvote, 1 = upvote.';
