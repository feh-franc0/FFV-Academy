## 1. Descobrir o alcance real antes de escrever o gate

- [x] 1.1 Levantar, por tipo de bloco, as props que o adapter entrega — lendo `ADAPTERS` em `BlockRenderer.tsx`
- [x] 1.2 Levantar, por primitive, as props declaradas no tipo — incluindo campos de item dentro de array (`alternatives[]`, `layers[]`, `parts[]`, `steps[]`), que é onde os três defeitos moraram
- [x] 1.3 Cruzar e publicar a lista de divergências encontradas hoje, antes de qualquer correção — o número inicial é o que torna a descida verificável
- [x] 1.4 Separar as divergências em três grupos: prop entregue e ignorada (erro), prop declarada e nunca entregue (aviso), nome diferente para a mesma coisa (o caso `downside`/`note`)

## 2. Escrever o gate

- [x] 2.1 Implementar a comparação adapter ↔ primitive, começando em modo relatório
- [x] 2.2 Fazer o gate falhar em prop entregue e não declarada, e avisar em prop declarada e não entregue
- [x] 2.3 Cobrir campos de item dentro de array, e não apenas props de primeiro nível
- [x] 2.4 Prova negativa: remover `downside` do tipo de `DecisionBox` e conferir que o gate reprova; remover `tone` e conferir que só avisa
- [x] 2.5 Ligar no CI depois que as divergências existentes estiverem em zero

## 3. Cobrir os ~25 tipos com teste de render pelo BlockRenderer

- [x] 3.1 Escrever o teste de cobertura que falha quando um tipo de `BLOCK_DATA_SCHEMAS` não tem teste de render — o gate que garante que a lista não fique parcial
- [x] 3.2 Tipos que já quebraram: `matrix_diagram`, `node_graph`, `decision_box` (feitos)
- [x] 3.3 Tipos com item dentro de array, que são os de maior risco: `layer_stack`, `annotated_formula`, `stack_flow`, `flow_diagram`, `comparison_flow`, `split_flow`, `mind_map`, `hierarchy_diagram`, `timeline`, `node_graph`
- [x] 3.4 Tipos simples: `paragraph`, `callout`, `code_block`, `comparison_table`, `quiz`, `qa_item`, `key_value`, `list`, `section`, `exam_domain_badge`, `arch_flow`
- [x] 3.5 `arch_diagram` — já coberto por `diagramas-de-seed.test.tsx` a partir dos seeds reais; conferir que o teste afirma rótulo de nó **e** de aresta visíveis
- [x] 3.6 Cada teste usa o shape exato de um seed real, copiado do disco, e não um shape inventado

## 4. Separador pendurado e cor de borda como texto

- [x] 4.1 Varrer os primitives por junção de dois textos com pontuação fixa e tornar o separador condicional em todos
- [x] 4.2 Varrer `color: 'var(--ffv-border)'` em elemento com texto e trocar por `--ffv-muted`
- [ ] 4.3 Acrescentar a checagem ao lint de estilo, para não voltar

## 5. Fechar o laço normativo

- [ ] 5.1 Estender a regra 4b do `PADRAO_ENSINO.md` para o elo adapter → primitive, com os três defeitos e o alcance de cada
- [ ] 5.2 Atualizar `scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md`: onde ele documenta `alternatives[].downside`, registrar que a prop é lida pelo primitive desde 07/ago/2026 e que antes não era
- [ ] 5.3 `frontend/CLAUDE.md`: acrescentar a cadeia de três elos e qual gate cobre cada um
- [ ] 5.4 Rodar a suíte, os gates e a varredura
