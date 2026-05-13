-- Estende curriculum_articles (migration 023) para suportar o modelo CMS-driven:
--   - FKs reais para hubs e trails (estavam como texto livre)
--   - status com estados draft/published/archived (substitui boolean published)
--   - cover_image_url para OG/SEO
--   - published_at para timeline + analytics
--
-- DEFERRABLE INITIALLY DEFERRED nas FKs permite que seeds carreguem
-- hubs+trails+articles na MESMA transação sem violação durante o INSERT.
-- Verificação só acontece no COMMIT.

ALTER TABLE curriculum_articles
    ADD COLUMN status          TEXT        NOT NULL DEFAULT 'published',
    ADD COLUMN cover_image_url TEXT,
    ADD COLUMN published_at    TIMESTAMPTZ,
    ADD CONSTRAINT curriculum_articles_status_valid
        CHECK (status IN ('draft','published','archived'));

-- Inicializa published_at para artigos já publicados (compat com campo legacy 'published').
UPDATE curriculum_articles
    SET published_at = COALESCE(published_at, created_at)
    WHERE published = true;

-- Sincroniza status com o boolean legacy.
UPDATE curriculum_articles SET status = 'archived' WHERE published = false;
UPDATE curriculum_articles SET status = 'published' WHERE published = true;

-- FKs para hubs e trails. DEFERRABLE permite inserir hubs+trails+articles
-- na mesma transação (importer Go faz isso).
ALTER TABLE curriculum_articles
    ADD CONSTRAINT fk_curriculum_articles_hub
        FOREIGN KEY (hub_id) REFERENCES hubs(id)
        ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED,
    ADD CONSTRAINT fk_curriculum_articles_trail
        FOREIGN KEY (trail_id) REFERENCES trails(id)
        ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED;

-- Index para listagens de catálogo (todos os artigos publicados de uma trilha em ordem)
CREATE INDEX IF NOT EXISTS idx_curriculum_articles_trail_order
    ON curriculum_articles(trail_id, "order")
    WHERE deleted_at IS NULL AND status = 'published';

-- Index para "últimos publicados" (home, news, etc.)
CREATE INDEX IF NOT EXISTS idx_curriculum_articles_published_at
    ON curriculum_articles(published_at DESC)
    WHERE deleted_at IS NULL AND status = 'published';

COMMENT ON COLUMN curriculum_articles.status          IS 'draft (rascunho) | published (público) | archived (oculto).';
COMMENT ON COLUMN curriculum_articles.cover_image_url IS 'URL absoluta da imagem de capa (OG, listings).';
COMMENT ON COLUMN curriculum_articles.published_at    IS 'Momento da primeira publicação. Imutável depois.';
