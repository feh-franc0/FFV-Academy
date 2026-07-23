-- Reverte migration 000055

ALTER TABLE hubs
    DROP CONSTRAINT IF EXISTS hubs_slug_per_base_unique;

DROP INDEX IF EXISTS idx_hubs_base_position;

ALTER TABLE hubs
    DROP COLUMN IF EXISTS tagline,
    DROP COLUMN IF EXISTS slug,
    DROP COLUMN IF EXISTS base_slug;
