-- Corrige dois defeitos de simulado_attempts (auditoria de 11/ago/2026):
--
-- 1. `status` tinha DEFAULT 'active' e a UNIQUE (user_id, simulado_id, status)
--    dependia dele para permitir uma segunda tentativa — mas nenhum código Go
--    jamais escrevia 'finished' na coluna (INSERT/UPDATE nunca a tocam).
--    Resultado: toda linha ficava com status='active' para sempre, então a
--    2ª tentativa do mesmo simulado violava a UNIQUE e o usuário via
--    "not found" na recuperação de conflito. A fonte de verdade real sempre
--    foi `finished_at IS NULL` (é o que FindActiveByUserAndSimulado já usa) —
--    a coluna `status` era redundante e nunca deveria ter sido a chave da
--    constraint.
--
-- 2. `question_ids`: até agora a Attempt não guardava QUAIS questões foram
--    sorteadas para a tentativa — o sorteio acontecia no CLIENTE, que também
--    calculava o score localmente com o gabarito que já tinha em mãos. Esta
--    coluna passa a guardar o sorteio feito pelo SERVIDOR em StartAttempt,
--    para que FinishAttempt pontue exatamente essas questões contra o banco
--    real do Postgres (não mais o catálogo estático embutido no binário).

ALTER TABLE simulado_attempts DROP CONSTRAINT IF EXISTS uq_active_attempt;
ALTER TABLE simulado_attempts DROP COLUMN IF EXISTS status;
ALTER TABLE simulado_attempts ADD COLUMN IF NOT EXISTS question_ids JSONB NOT NULL DEFAULT '[]';

-- Índice parcial: só uma tentativa ATIVA por usuário+simulado. Tentativas
-- finalizadas (finished_at preenchido, por finish, cancel ou expiração) não
-- entram na restrição — uma segunda tentativa passa a funcionar de verdade.
CREATE UNIQUE INDEX IF NOT EXISTS uq_active_attempt
    ON simulado_attempts (user_id, simulado_id)
    WHERE finished_at IS NULL;
