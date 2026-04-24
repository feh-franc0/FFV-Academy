-- users: aggregate root de Identity & Access
-- Soft-delete via deleted_at para LGPD
CREATE TABLE IF NOT EXISTS users (
    id               TEXT        PRIMARY KEY,
    email            TEXT        NOT NULL UNIQUE,
    phone            TEXT        NOT NULL DEFAULT '',
    name             TEXT        NOT NULL DEFAULT '',
    role             TEXT        NOT NULL DEFAULT 'student',
    referral_id      TEXT        NOT NULL UNIQUE,
    marketing_consent BOOLEAN    NOT NULL DEFAULT false,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_users_referral_id ON users(referral_id);
