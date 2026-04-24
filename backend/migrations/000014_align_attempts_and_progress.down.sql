ALTER TABLE simulado_attempts
    DROP COLUMN IF EXISTS updated_at,
    DROP COLUMN IF EXISTS passed,
    DROP COLUMN IF EXISTS score_details;

ALTER TABLE progress_snapshots
    DROP COLUMN IF EXISTS state_size;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'progress_snapshots' AND column_name = 'updated_at'
    ) AND NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'progress_snapshots' AND column_name = 'server_updated_at'
    ) THEN
        ALTER TABLE progress_snapshots RENAME COLUMN updated_at TO server_updated_at;
    END IF;
END$$;
