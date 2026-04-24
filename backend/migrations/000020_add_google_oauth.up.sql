-- Suporte a login com Google OAuth.
-- google_id: ID único da conta Google (sub claim do id_token).
-- avatar_url: URL da foto de perfil do Google.
ALTER TABLE users
    ADD COLUMN IF NOT EXISTS google_id  TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS avatar_url TEXT NOT NULL DEFAULT '';

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id) WHERE google_id IS NOT NULL AND deleted_at IS NULL;
