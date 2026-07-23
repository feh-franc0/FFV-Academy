-- Reverte seed dos simulados (apenas remove os registros seed, não a tabela)

DELETE FROM simulados WHERE id IN ('aws-clf', 'aws-aif', 'anthropic-ai');
