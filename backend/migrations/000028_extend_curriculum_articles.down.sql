-- Reverte migration 000028. Ordem importa: drop indexes → drop FKs → drop columns.

DROP INDEX IF EXISTS idx_curriculum_articles_published_at;
DROP INDEX IF EXISTS idx_curriculum_articles_trail_order;

ALTER TABLE curriculum_articles
    DROP CONSTRAINT IF EXISTS fk_curriculum_articles_trail,
    DROP CONSTRAINT IF EXISTS fk_curriculum_articles_hub,
    DROP CONSTRAINT IF EXISTS curriculum_articles_status_valid,
    DROP COLUMN IF EXISTS published_at,
    DROP COLUMN IF EXISTS cover_image_url,
    DROP COLUMN IF EXISTS status;
