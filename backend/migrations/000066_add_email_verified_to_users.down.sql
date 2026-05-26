-- Reversão da 000066. Drop do index primeiro, depois das colunas.
-- Idempotente.

DROP INDEX IF EXISTS idx_users_email_verified_at;
ALTER TABLE users DROP COLUMN IF EXISTS last_login_at;
ALTER TABLE users DROP COLUMN IF EXISTS email_verified_at;
