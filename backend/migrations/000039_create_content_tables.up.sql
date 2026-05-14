-- Conteúdo editorial gerenciável via admin: news, cheatsheets, playlists.
-- Substitui src/data/news.json + src/lib/playlists.ts + 5 page.tsx estáticos.

-- ─── News ─────────────────────────────────────────────────────────────────
CREATE TABLE news_articles (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    summary       TEXT NOT NULL,
    source        TEXT NOT NULL,
    source_url    TEXT NOT NULL,
    image_url     TEXT,
    category      TEXT NOT NULL,
    hot           BOOLEAN NOT NULL DEFAULT false,
    tags          JSONB NOT NULL DEFAULT '[]'::jsonb,
    published_at  DATE NOT NULL,
    status        TEXT NOT NULL DEFAULT 'published',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMPTZ,

    CONSTRAINT news_category_valid CHECK (
        category IN ('launch', 'research', 'business', 'safety', 'regulation')
    ),
    CONSTRAINT news_status_valid CHECK (
        status IN ('draft', 'published', 'archived')
    ),
    CONSTRAINT news_title_length CHECK (length(title) BETWEEN 10 AND 200),
    CONSTRAINT news_summary_length CHECK (length(summary) BETWEEN 20 AND 500)
);

CREATE INDEX idx_news_published_at ON news_articles (published_at DESC) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX idx_news_category ON news_articles (category, published_at DESC) WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX idx_news_hot ON news_articles (published_at DESC) WHERE hot = true AND deleted_at IS NULL AND status = 'published';

-- ─── Cheatsheets ──────────────────────────────────────────────────────────
CREATE TABLE cheatsheets (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    subtitle    TEXT,
    description TEXT,
    accent      TEXT NOT NULL DEFAULT '#58a6ff',
    emoji       TEXT,
    -- Corpo em markdown. Render usa marked + syntax highlighting.
    body_md     TEXT NOT NULL,
    "order"     INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'published',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ,

    CONSTRAINT cheatsheets_status_valid CHECK (
        status IN ('draft', 'published', 'archived')
    ),
    CONSTRAINT cheatsheets_title_length CHECK (length(title) BETWEEN 3 AND 120),
    CONSTRAINT cheatsheets_body_length CHECK (length(body_md) BETWEEN 1 AND 200000)
);

CREATE INDEX idx_cheatsheets_status ON cheatsheets ("order", title) WHERE deleted_at IS NULL AND status = 'published';

-- ─── Playlists ────────────────────────────────────────────────────────────
CREATE TABLE playlists (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    subtitle    TEXT,
    audience    TEXT,
    color       TEXT NOT NULL DEFAULT '#58a6ff',
    emoji       TEXT,
    -- Array de slugs de módulos do curriculum_articles, em ordem.
    module_slugs JSONB NOT NULL DEFAULT '[]'::jsonb,
    "order"     INTEGER NOT NULL DEFAULT 0,
    status      TEXT NOT NULL DEFAULT 'published',
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at  TIMESTAMPTZ,

    CONSTRAINT playlists_status_valid CHECK (
        status IN ('draft', 'published', 'archived')
    ),
    CONSTRAINT playlists_title_length CHECK (length(title) BETWEEN 3 AND 120)
);

CREATE INDEX idx_playlists_status ON playlists ("order", title) WHERE deleted_at IS NULL AND status = 'published';
