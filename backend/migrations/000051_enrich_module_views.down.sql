DROP INDEX IF EXISTS idx_module_views_base_viewed;
DROP INDEX IF EXISTS idx_module_views_user_email_viewed;
DROP INDEX IF EXISTS idx_module_views_session;
DROP INDEX IF EXISTS idx_module_views_kind_viewed;

ALTER TABLE module_views
    DROP COLUMN IF EXISTS base_slug,
    DROP COLUMN IF EXISTS user_email,
    DROP COLUMN IF EXISTS user_display_name,
    DROP COLUMN IF EXISTS session_id,
    DROP COLUMN IF EXISTS path,
    DROP COLUMN IF EXISTS kind;
