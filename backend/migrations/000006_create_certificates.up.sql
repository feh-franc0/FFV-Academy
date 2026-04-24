-- certificates: certificados emitidos (imutáveis, hash determinístico)
-- Hash = SHA-256(userID|simuladoID|attemptID)
CREATE TABLE IF NOT EXISTS certificates (
    hash        TEXT        PRIMARY KEY, -- SHA-256 determinístico
    user_id     TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    simulado_id TEXT        NOT NULL,
    attempt_id  TEXT        NOT NULL REFERENCES simulado_attempts(id),
    holder_name TEXT        NOT NULL,
    issued_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cert_attempt UNIQUE (attempt_id)
);

CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON certificates(user_id);
