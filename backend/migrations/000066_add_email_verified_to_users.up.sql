-- 000066: rastreamento de verificação de email e último login.
--
-- POR QUÊ: estudante que solicita base de conhecimento via formulário público
-- precisa COMPROVAR que o email é real antes do admin investir tempo de
-- curadoria. Solução: ao submeter, o backend dispara um magic-link de
-- boas-vindas. Quando o estudante clica e entra, marcamos:
--   - email_verified_at (primeira vez que loga)
--   - last_login_at      (toda vez que loga, pra "logou há 2h")
--
-- O admin vê esses dois timestamps na listagem de solicitações e prioriza
-- as verificadas. Estudantes que nunca clicam viram "leads frios" no admin.
--
-- Idempotente — usa IF NOT EXISTS em todas as alterações.

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at     TIMESTAMPTZ;

-- Index pra admin filtrar "só solicitações de email verificado" eficientemente.
-- Partial index pra economizar espaço (só não-nulos).
CREATE INDEX IF NOT EXISTS idx_users_email_verified_at
  ON users(email_verified_at)
  WHERE email_verified_at IS NOT NULL;
