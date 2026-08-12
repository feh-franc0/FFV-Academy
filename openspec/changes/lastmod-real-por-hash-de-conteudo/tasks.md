## 1. Backend — hash de conteúdo no importador

- [x] 1.1 Migration acrescentando a coluna de hash em `curriculum_articles`, aceitando nulo para o estado atual
- [x] 1.2 Implementar a normalização do conteúdo antes do hash: ordem de chaves estável, `id` de bloco fora do cálculo, espaçamento irrelevante descartado
- [x] 1.3 Calcular e comparar; escrever `updated_at` e hash somente quando divergirem
- [x] 1.4 Relatar no fim da importação quantos artigos foram atualizados e quantos ficaram intactos — hoje o número é sempre 427, e é isso que revela o problema
- [x] 1.5 Teste Go: importar duas vezes o mesmo conteúdo e afirmar que nenhum `updated_at` muda
- [x] 1.6 Teste Go: reformatar o JSON sem mudar texto e afirmar que nenhum hash muda — é o modo de falha que arruinaria o sinal de uma vez
- [ ] 1.7 Preencher o hash dos 427 artigos existentes numa primeira execução, sem tocar `updated_at`, para que a data atual não seja tomada como data de edição

## 2. Frontend — `lastmod` de volta, só onde é verdade

- [x] 2.1 Ler o comentário longo em `src/app/sitemap.ts` antes de mexer: ele documenta cada fonte de data descartada e por quê
- [x] 2.2 Emitir `lastmod` nas URLs de artigo, a partir de `updated_at`
- [x] 2.3 Manter estáticas, hubs, trilhas, temas e simulados sem `lastmod`
- [x] 2.4 Não emitir `lastmod` quando o conteúdo vier do fallback de seeds
- [x] 2.5 Atualizar o comentário: o que mudou, e por que agora a data existe

## 3. Reescrever o gate

- [x] 3.1 A 15ª checagem da varredura deixa de exigir ausência e passa a exigir distinção
- [x] 3.2 Falhar quando todas as URLs que declaram `lastmod` têm o mesmo valor
- [x] 3.3 Falhar quando uma URL sem data real declara `lastmod`
- [x] 3.4 Aceitar ausência total, que é o estado atual e continua válido
- [ ] 3.5 Prova negativa: emitir a data do build em tudo e conferir que o gate reprova

## 4. Verificar o efeito, não só o campo

- [ ] 4.1 Editar um módulo, importar, e conferir que só aquela URL mudou de data no sitemap
- [ ] 4.2 Conferir no `llms.txt` e nos dados estruturados se alguma outra saída afirma data — coerência entre as saídas importa mais que o campo isolado
- [ ] 4.3 Atualizar `PENDENCIAS.md` e `frontend/CLAUDE.md`, que hoje registram a ausência de `lastmod` como decisão deliberada
