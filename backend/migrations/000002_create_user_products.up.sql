-- user_products: produtos pagos (relation N:M users ← products)
CREATE TABLE IF NOT EXISTS user_products (
    user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  TEXT        NOT NULL,
    purchase_id TEXT        NOT NULL,
    granted_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_products_user_id ON user_products(user_id);
