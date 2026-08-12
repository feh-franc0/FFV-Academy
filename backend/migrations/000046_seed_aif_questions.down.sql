-- Down: no-op intencional.
--
-- Esta migration só INSERE questões com `simulado_id = 'aws-aif'` — não altera
-- nem apaga nenhuma questão de outra certificação. Reverter via DELETE exigiria
-- filtrar exatamente pelos ids inseridos aqui, o que a duplica desnecessariamente
-- (a fonte da verdade já é o JSON em frontend/data/question-bank/aif-c01-*.json).
-- Para remover o banco AIF, rode `DELETE FROM questions WHERE simulado_id = 'aws-aif'`
-- manualmente, com a consciência de que isso é destrutivo.
SELECT 1;
