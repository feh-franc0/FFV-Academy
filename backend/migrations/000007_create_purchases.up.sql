-- purchases: compras de produtos via Stripe
-- Status: pending → paid | failed → refunded
CREATE TABLE IF NOT EXISTS purchases (
    id                 TEXT        PRIMARY KEY,
    user_id            TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id         TEXT        NOT NULL,
    stripe_session_id  TEXT        NOT NULL UNIQUE,
    stripe_payment_intent TEXT,
    amount_cents       BIGINT      NOT NULL,
    currency           TEXT        NOT NULL DEFAULT 'brl',
    status             TEXT        NOT NULL DEFAULT 'pending',
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_session_id ON purchases(stripe_session_id);
