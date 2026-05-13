-- Hubs: agrupamento de mais alto nível do currículo (ex: 'ia', 'aws',
-- 'engenharia'). Cada hub tem várias trilhas, cada trilha tem vários módulos
-- (articles). Ver ARCHITECTURE_BLUEPRINT.md.
--
-- ID é TEXT estável (slug-style) para permitir referenciar em URLs e seeds
-- de forma legível e versionável no git, em vez de UUIDs opacos.

CREATE TABLE hubs (
    id          TEXT PRIMARY KEY,
    name        TEXT        NOT NULL,
    short_name  TEXT        NOT NULL,
    description TEXT        NOT NULL DEFAULT '',
    icon        TEXT        NOT NULL DEFAULT '',
    color       TEXT        NOT NULL DEFAULT '',
    position    INT         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT hubs_id_slug_format
        CHECK (id ~ '^[a-z0-9-]+$' AND length(id) BETWEEN 2 AND 64)
);

CREATE INDEX idx_hubs_position ON hubs(position);

COMMENT ON TABLE  hubs                 IS 'Hubs: agrupamento de mais alto nível do currículo.';
COMMENT ON COLUMN hubs.id              IS 'Slug estável usado em URLs e referências (ex: ia, aws).';
COMMENT ON COLUMN hubs.icon            IS 'Emoji ou ícone para UI (ex: 🤖).';
COMMENT ON COLUMN hubs.color           IS 'Cor hex hex (#58A6FF) para UI.';
COMMENT ON COLUMN hubs.position        IS 'Ordem de exibição (asc).';
