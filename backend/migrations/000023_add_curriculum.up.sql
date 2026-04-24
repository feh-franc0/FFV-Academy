-- Tabela de artigos do currículo.
-- Migra o array estático curriculum.ts para banco de dados gerenciável.
-- content_md armazena o conteúdo Markdown — renderizado pelo frontend.
CREATE TABLE IF NOT EXISTS curriculum_articles (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,          -- ID permanente, nunca renomear sem migração
    title       TEXT NOT NULL,
    trail_id    TEXT NOT NULL,                 -- ex: "trail1"
    hub_id      TEXT NOT NULL,                 -- ex: "hub-ia"
    content_md  TEXT NOT NULL DEFAULT '',      -- conteúdo Markdown do artigo
    xp          INT  NOT NULL DEFAULT 30,
    read_time   INT  NOT NULL DEFAULT 5,       -- minutos
    difficulty  TEXT NOT NULL DEFAULT 'beginner', -- beginner | intermediate | advanced
    "order"     INT  NOT NULL DEFAULT 0,       -- ordem dentro da trilha
    published   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ                    -- soft-delete
);

CREATE INDEX idx_curriculum_trail_id ON curriculum_articles(trail_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_curriculum_slug ON curriculum_articles(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_curriculum_published ON curriculum_articles(published, trail_id) WHERE deleted_at IS NULL;

-- Extensão para busca full-text em português
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE INDEX idx_curriculum_title_trgm ON curriculum_articles USING gin(title gin_trgm_ops) WHERE deleted_at IS NULL;
