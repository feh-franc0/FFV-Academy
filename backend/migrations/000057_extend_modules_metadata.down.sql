-- Reverte migration 000057

DROP INDEX IF EXISTS idx_module_next_order;
DROP INDEX IF EXISTS idx_module_prereqs_slug;

DROP TABLE IF EXISTS module_next_suggested;
DROP TABLE IF EXISTS module_prerequisites;

ALTER TABLE curriculum_articles
    DROP COLUMN IF EXISTS keywords,
    DROP COLUMN IF EXISTS seo_description,
    DROP COLUMN IF EXISTS external_url,
    DROP COLUMN IF EXISTS icon,
    DROP COLUMN IF EXISTS level,
    DROP COLUMN IF EXISTS pos;
