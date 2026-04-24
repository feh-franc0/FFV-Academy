ALTER TABLE users DROP COLUMN IF EXISTS updated_at;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stripe_events' AND column_name = 'id'
    ) THEN
        ALTER TABLE stripe_events RENAME COLUMN id TO stripe_event_id;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stripe_events' AND column_name = 'type'
    ) THEN
        ALTER TABLE stripe_events RENAME COLUMN type TO event_type;
    END IF;
END$$;
