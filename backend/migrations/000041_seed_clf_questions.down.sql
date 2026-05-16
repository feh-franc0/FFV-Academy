-- Down: remove todas as questões CLF-C02 inseridas pela seed (1015).
-- Outras certificações (DVA, AIF, anthropic) permanecem.
DELETE FROM questions WHERE simulado_id = 'aws-clf';
