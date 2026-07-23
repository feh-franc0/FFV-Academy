-- Reverte migration 000056

DROP INDEX IF EXISTS idx_trails_hub_slug;

ALTER TABLE trails
    DROP CONSTRAINT IF EXISTS trails_slug_per_hub_unique,
    DROP CONSTRAINT IF EXISTS trails_status_valid;

ALTER TABLE trails
    DROP COLUMN IF EXISTS slug,
    DROP COLUMN IF EXISTS tagline,
    DROP COLUMN IF EXISTS color,
    DROP COLUMN IF EXISTS href,
    DROP COLUMN IF EXISTS status,
    DROP COLUMN IF EXISTS level,
    DROP COLUMN IF EXISTS pos;
