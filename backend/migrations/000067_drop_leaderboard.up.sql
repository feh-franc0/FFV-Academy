-- 000067: remove feature de ranking/leaderboard.
--
-- POR QUÊ: PO decidiu descontinuar o ranking (mai/2026). A feature será
-- reformulada no futuro com modelo diferente; por ora, removemos tudo do
-- schema pra evitar arrastar tabelas mortas + dados pessoais (display name,
-- xp ganho semanal) que não fazem mais sentido sem o produto público.
--
-- O que dropa:
--   - leaderboard (000010)         : entries semanais de XP por user
--   - leaderboard_opt_ins (000013) : opt-in por user pra aparecer no ranking
--   - índice em leaderboard (000022 perf_indexes)
--
-- Down: recria as 2 tabelas + índice (estado pré-000067). Não restaura
-- dados — apenas estrutura. Backup do snapshot deve ser feito ANTES
-- de aplicar essa migration em prod se quiser preservar histórico.

DROP INDEX IF EXISTS idx_leaderboard_week_xp;
DROP TABLE IF EXISTS leaderboard_opt_ins CASCADE;
DROP TABLE IF EXISTS leaderboard CASCADE;

-- Bases tinham flag pra esconder o widget de ranking na home — sem ranking,
-- flag deixa de ter propósito. Idempotente.
ALTER TABLE bases DROP COLUMN IF EXISTS hide_ranking;
