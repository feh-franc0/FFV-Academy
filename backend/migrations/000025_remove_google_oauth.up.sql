-- Remove suporte a Google OAuth — autenticação via magic link (email/SMS) é o único método.
DROP INDEX IF EXISTS idx_users_google_id;
ALTER TABLE users DROP COLUMN IF EXISTS google_id;
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
