-- Down: no-op intencional.
--
-- A migration 000042_reseed_clf_questions_v2 não APAGA dados — ela apenas
-- aplica INSERTs com ON CONFLICT (id) DO UPDATE em cima do estado base
-- estabelecido por 000041_seed_clf_questions. Reverter via DELETE deixaria
-- o banco em estado inconsistente (sem as 595 questões originais da 000041
-- também). Para limpar tudo, use a down.sql da 000041 ou drop+migrate up.
SELECT 1;
