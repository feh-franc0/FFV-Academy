-- bases: catálogo de "bases de conhecimento" da plataforma.
--
-- Cada base é uma área temática completa (ex.: /tecnologia, /medicina-veterinaria).
-- O frontend lê este catálogo via `GET /api/v1/bases` (lista) e
-- `GET /api/v1/bases/{slug}/page` (descritor completo de página).
--
-- Antes desta migration, a lista de bases vivia hardcoded em
-- `bases_handler.go` (função `buildBases()`) e `frontend/src/lib/bases/registry.ts`.
-- Esta tabela passa a ser a single source of truth.
--
-- Campos:
--   - slug: chave primária canônica (URL-safe).
--   - status: 'live' | 'queued' | 'in_production'.
--   - url: link público se status=live (ex.: '/tecnologia').
--   - modules/trails/hubs: contagens estáticas exibidas em cards.
--   - theme: paleta de cores (BaseThemeDTO) — JSONB pra evoluir sem migration.
--   - slogans / microcopy: textos contextualizados por base.
--   - nav_items / footer: configuração visual de chrome.
--   - features: toggles (gamification, srs, quizzes, community).
--   - hero / paths / hubs_cards / playlists / final_cta: payload do descritor
--     de página completo (usado por GET /bases/{slug}/page).
--
-- Todos os campos JSONB têm default '{}' ou '[]' pra suportar bases queued
-- sem precisar preencher antecipadamente.

CREATE TABLE bases (
    slug                     TEXT         PRIMARY KEY,
    name                     TEXT         NOT NULL,
    area_label               TEXT         NOT NULL DEFAULT '',
    description              TEXT         NOT NULL DEFAULT '',
    icon                     TEXT         NOT NULL DEFAULT '',
    status                   TEXT         NOT NULL DEFAULT 'queued',
    url                      TEXT         NOT NULL DEFAULT '',

    modules                  INTEGER      NOT NULL DEFAULT 0,
    trails                   INTEGER      NOT NULL DEFAULT 0,
    hubs                     INTEGER      NOT NULL DEFAULT 0,

    theme                    JSONB        NOT NULL DEFAULT '{}'::jsonb,
    slogans                  JSONB        NOT NULL DEFAULT '{}'::jsonb,
    microcopy                JSONB        NOT NULL DEFAULT '{}'::jsonb,
    nav_items                JSONB        NOT NULL DEFAULT '[]'::jsonb,
    footer                   JSONB        NOT NULL DEFAULT '{}'::jsonb,
    features                 JSONB        NOT NULL DEFAULT '{}'::jsonb,

    hero                     JSONB        NOT NULL DEFAULT '{}'::jsonb,
    paths                    JSONB        NOT NULL DEFAULT '[]'::jsonb,
    hubs_cards               JSONB        NOT NULL DEFAULT '[]'::jsonb,
    playlists                JSONB        NOT NULL DEFAULT '[]'::jsonb,
    final_cta                JSONB        NOT NULL DEFAULT '{}'::jsonb,

    hide_global_content_nav  BOOLEAN      NOT NULL DEFAULT FALSE,
    hide_ranking             BOOLEAN      NOT NULL DEFAULT FALSE,
    hide_comunidade          BOOLEAN      NOT NULL DEFAULT FALSE,

    sort_order               INTEGER      NOT NULL DEFAULT 100,

    created_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at               TIMESTAMPTZ  NOT NULL DEFAULT now(),

    CONSTRAINT bases_status_valid CHECK (
        status IN ('live', 'queued', 'in_production')
    ),
    CONSTRAINT bases_slug_not_blank CHECK (length(trim(slug)) > 0),
    CONSTRAINT bases_name_not_blank CHECK (length(trim(name)) > 0)
);

CREATE INDEX idx_bases_status_sort ON bases (status, sort_order);

CREATE OR REPLACE FUNCTION set_bases_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER bases_updated_at_trigger
    BEFORE UPDATE ON bases
    FOR EACH ROW
    EXECUTE FUNCTION set_bases_updated_at();
