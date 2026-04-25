-- Enforça a invariante de domínio: phone é único no sistema (user.go, invariante 2).
-- Usa UNIQUE parcial (WHERE phone != '') para permitir usuários sem telefone cadastrado
-- sem violar a constraint (múltiplos '' seriam conflito com UNIQUE simples).
-- CONCURRENTLY permite rodar sem lock exclusivo em tabela existente.
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_users_phone_unique
    ON users (phone)
    WHERE phone != '' AND deleted_at IS NULL;
