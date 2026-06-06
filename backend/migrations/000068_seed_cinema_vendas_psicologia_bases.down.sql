-- Reverte seed das bases cinema, vendas, psicologia-do-consumo e restaura
-- contagens originais de marketing e ingles.

DELETE FROM bases WHERE slug IN ('cinema', 'vendas', 'psicologia-do-consumo');

UPDATE bases SET modules = 5, trails = 1 WHERE slug = 'marketing';
UPDATE bases SET modules = 19, trails = 1 WHERE slug = 'ingles';
