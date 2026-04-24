-- referrals: tracking de referências entre usuários
CREATE TABLE IF NOT EXISTS referrals (
    id            TEXT        PRIMARY KEY,
    referrer_id   TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referred_id   TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_referral UNIQUE (referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
