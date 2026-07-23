-- Adiciona campos de metadata às trilhas para refletir o que existe no curriculum.ts.

ALTER TABLE trails
    ADD COLUMN IF NOT EXISTS slug     TEXT,
    ADD COLUMN IF NOT EXISTS tagline  TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS color    TEXT NOT NULL DEFAULT '',
    ADD COLUMN IF NOT EXISTS href     TEXT,
    ADD COLUMN IF NOT EXISTS status   TEXT NOT NULL DEFAULT 'published',
    ADD COLUMN IF NOT EXISTS level    TEXT,
    ADD COLUMN IF NOT EXISTS pos      INTEGER NOT NULL DEFAULT 0;

-- Backfill: usa o id existente como slug
UPDATE trails SET slug = id WHERE slug IS NULL;

ALTER TABLE trails
    ALTER COLUMN slug SET NOT NULL;

ALTER TABLE trails
    ADD CONSTRAINT trails_status_valid
        CHECK (status IN ('draft', 'published', 'archived'));

ALTER TABLE trails
    ADD CONSTRAINT trails_slug_per_hub_unique UNIQUE (hub_id, slug);

CREATE INDEX IF NOT EXISTS idx_trails_hub_slug ON trails(hub_id, slug);
