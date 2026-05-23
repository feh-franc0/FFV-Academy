-- Adiciona delivered_url em study_requests.
--
-- Quando admin marca status=ready, ele cola aqui o link onde o estudante vai
-- acessar o conteúdo gerado (trilha, hub, página dedicada, doc shareado, etc).
-- O email de status=ready usa essa URL como CTA principal.
--
-- NULL é permitido pra todos os outros status (só faz sentido quando ready).
-- Não há CHECK constraint exigindo URL em status=ready pra não complicar
-- migrações — validação fica no domain/application (V1).

ALTER TABLE study_requests
    ADD COLUMN IF NOT EXISTS delivered_url TEXT;

COMMENT ON COLUMN study_requests.delivered_url IS
    'URL do conteúdo gerado pelo admin para o estudante (preenchido ao marcar ready).';
