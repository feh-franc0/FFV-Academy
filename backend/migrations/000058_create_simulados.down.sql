-- Reverte migration 000058

DROP INDEX IF EXISTS idx_simulados_base;
DROP TABLE IF EXISTS simulados;
