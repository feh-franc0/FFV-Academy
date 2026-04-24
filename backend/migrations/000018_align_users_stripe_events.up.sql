-- Alinha schemas com o que os repos realmente escrevem.

-- users.updated_at: UserRepo usa em INSERT/UPDATE (Save, Update, SoftDelete).
-- Sem esta coluna, qualquer Save/Update explode em produção.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

UPDATE users SET updated_at = created_at WHERE updated_at < created_at;

-- stripe_events: migration 8 criou (stripe_event_id, event_type); repo escreve
-- em (id, type). Renomeamos em vez de recriar para preservar idempotência.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stripe_events' AND column_name = 'stripe_event_id'
    ) THEN
        ALTER TABLE stripe_events RENAME COLUMN stripe_event_id TO id;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'stripe_events' AND column_name = 'event_type'
    ) THEN
        ALTER TABLE stripe_events RENAME COLUMN event_type TO type;
    END IF;
END$$;
