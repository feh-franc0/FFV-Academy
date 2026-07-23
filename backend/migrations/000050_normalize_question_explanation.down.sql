-- Não há down útil — não dá pra "desnormalizar" um array em string sem perder
-- informação (qual elemento volta a ser string?). Como a migration up é uma
-- limpeza de dados quebrados, o down é no-op.
SELECT 1;
