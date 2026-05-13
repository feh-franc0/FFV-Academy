-- Module revisions: snapshot completo do artigo a cada edição, para
-- versionamento e rollback. Cada edição via /admin/articles/.../edit
-- ou via MCP gera uma nova linha aqui.
--
-- snapshot armazena o artigo INTEIRO (metadata + todos os blocks) em JSONB,
-- permitindo rollback 1-click sem precisar replay de mudanças.

CREATE TABLE module_revisions (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_slug  TEXT NOT NULL,
    revision      INT  NOT NULL,
    snapshot      JSONB NOT NULL,
    edited_by     TEXT,
    edited_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    note          TEXT,

    CONSTRAINT module_revisions_revision_positive CHECK (revision > 0),
    CONSTRAINT module_revisions_unique_revision UNIQUE (article_slug, revision),

    -- Se artigo for deletado, revisões vão junto.
    CONSTRAINT fk_module_revisions_article
        FOREIGN KEY (article_slug) REFERENCES curriculum_articles(slug)
        ON DELETE CASCADE,

    -- Se usuário editor for deletado, mantém revisão mas nullable (LGPD).
    CONSTRAINT fk_module_revisions_user
        FOREIGN KEY (edited_by) REFERENCES users(id)
        ON DELETE SET NULL
);

-- Index para listar histórico de um artigo (revision DESC = mais recente primeiro).
CREATE INDEX idx_module_revisions_article
    ON module_revisions(article_slug, revision DESC);

-- Index para "edições recentes" no painel admin.
CREATE INDEX idx_module_revisions_edited_at
    ON module_revisions(edited_at DESC);

COMMENT ON TABLE  module_revisions          IS 'Histórico de edições de artigos. 1 linha por edição. Permite rollback.';
COMMENT ON COLUMN module_revisions.revision IS 'Número sequencial da revisão (1, 2, 3, ...). Único por artigo.';
COMMENT ON COLUMN module_revisions.snapshot IS 'JSONB com artigo completo + blocks no momento da edição.';
COMMENT ON COLUMN module_revisions.edited_by IS 'Usuário que fez a edição. NULL se usuário foi deletado (LGPD).';
COMMENT ON COLUMN module_revisions.note     IS 'Mensagem opcional da edição (estilo git commit message).';
