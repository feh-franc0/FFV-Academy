-- `lastmod` real no sitemap depende de saber QUANDO o conteúdo mudou — e o
-- importador não sabia: ele escrevia `updated_at = now()` em todo artigo, em toda
-- execução. Com 427 artigos recebendo a mesma data a cada deploy, o campo não
-- distingue nada, e o Google ignora `lastmod` uniforme (inclusive nas URLs onde
-- ele seria verdade).
--
-- O hash é do CONTEÚDO NORMALIZADO, não do arquivo: ordem de chave estável, `id`
-- de bloco fora do cálculo, fim de linha e espaço à direita descartados. Sem
-- isso, reformatar o JSON mudaria a data de 427 artigos de uma vez — o modo de
-- falha que arruinaria o sinal permanentemente.
--
-- Nulo é aceito para o estado atual: a primeira execução preenche os 427 sem
-- tocar `updated_at`, para a data de hoje não ser tomada como data de edição.
ALTER TABLE curriculum_articles
  ADD COLUMN IF NOT EXISTS content_hash TEXT;

COMMENT ON COLUMN curriculum_articles.content_hash IS
  'SHA-256 do conteúdo normalizado (título + blocos sem id). updated_at só muda quando este valor muda.';
