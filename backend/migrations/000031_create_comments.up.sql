-- Comments: discussão em artigos, trilhas e blocos específicos.
-- Polimórfico via (target_type, target_id) — sem foreign key explícita
-- para o target, porque target_id pode ser slug TEXT (article/trail) ou
-- UUID-string (block). Integridade validada na camada de aplicação.
--
-- Estrutura de threads via parent_id (self-reference). Limite de profundidade
-- 2-3 níveis aplicado na app layer para evitar threads ilegíveis.
--
-- HANDLERS HTTP DESTA TABELA AINDA NÃO EXISTEM. Schema é criado agora
-- para evitar migração disruptiva quando feature for ativada (Sprint 11+).

CREATE TABLE comments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      TEXT NOT NULL,
    target_type  TEXT NOT NULL,
    target_id    TEXT NOT NULL,
    parent_id    UUID,
    content      TEXT NOT NULL,
    status       TEXT NOT NULL DEFAULT 'visible',
    edited       BOOLEAN NOT NULL DEFAULT false,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT comments_target_type_valid
        CHECK (target_type IN ('article', 'trail', 'block')),
    CONSTRAINT comments_status_valid
        CHECK (status IN ('visible', 'hidden', 'flagged', 'deleted')),
    CONSTRAINT comments_content_length
        CHECK (length(content) BETWEEN 1 AND 4000),

    CONSTRAINT fk_comments_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_comments_parent
        FOREIGN KEY (parent_id) REFERENCES comments(id)
        ON DELETE CASCADE
);

-- Index principal: listar comentários de um target (article/trail/block) por data DESC.
CREATE INDEX idx_comments_target
    ON comments(target_type, target_id, created_at DESC)
    WHERE status = 'visible';

-- Index para threads: encontrar replies de um parent.
CREATE INDEX idx_comments_parent
    ON comments(parent_id, created_at)
    WHERE parent_id IS NOT NULL AND status = 'visible';

-- Index para "meus comentários" no profile do user.
CREATE INDEX idx_comments_user
    ON comments(user_id, created_at DESC);

-- Index para moderação: encontrar flagged/hidden.
CREATE INDEX idx_comments_status_moderation
    ON comments(status, created_at DESC)
    WHERE status IN ('flagged', 'hidden');

COMMENT ON TABLE  comments              IS 'Comentários em articles/trails/blocks. Polimórfico por (target_type, target_id).';
COMMENT ON COLUMN comments.target_type  IS 'Tipo do alvo: article | trail | block.';
COMMENT ON COLUMN comments.target_id    IS 'ID do alvo: slug do article/trail (TEXT) ou UUID-string do block.';
COMMENT ON COLUMN comments.parent_id    IS 'NULL para comentário raiz, UUID para reply.';
COMMENT ON COLUMN comments.status       IS 'visible (público) | hidden (admin) | flagged (reportado) | deleted (soft-delete).';
COMMENT ON COLUMN comments.edited       IS 'true se foi editado depois de criado. UI mostra (editado).';
