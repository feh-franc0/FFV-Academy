# Spec de autoria — módulos block-JSON da trilha AWS Bedrock

> Arquivo começa com `_` → o importer o IGNORA. É só referência para autoria.
> Exemplo canônico já validado: `bedrock-o-que-e-e-por-que.json` (LEIA-O).

## Formato do arquivo
```json
{ "slug": "<slug-exato-do-módulo>", "title": null, "blocks": [ ... ] }
```
- `title` DEVE ser `null` (o título humano vem do trails.json).
- Cada bloco: `{ "id": "<string única>", "type": "<tipo>", "position": <int>, "data": {…}, "children": [...]? }`
- `id`: qualquer string única DENTRO do arquivo. Use `m{N}-{k}` com contador crescente (N = número do módulo). Ex.: `m5-0`, `m5-1`, `m5-2`…
- `position`: inteiro 0,1,2… contíguo DENTRO de cada nível (blocos raiz 0..n; filhos de uma section recomeçam em 0..n).
- SÓ `section` renderiza `children`. Todo outro tipo é folha.

## Voz e qualidade (OBRIGATÓRIO)
- PT-BR, engenharia sênior, SEM hype. Denso, direto, prático. Público: dev que quer virar sênior.
- Explique o PORQUÊ e o COMO, não só o quê. Traga números concretos, limites, gotchas.
- Inclua **código real** (boto3 Python e/ou AWS SDK JS/TS) onde o módulo pede "como integrar".
- Inclua **no mínimo 2 `quiz`** por módulo (de preferência 3), com `explanation` que ensina.
- Atualizado para **meados de 2026**. Se um preço/limite for incerto, escreva "verifique no console/pricing" no texto — NÃO invente número preciso.
- Comprimento alvo: 22–34 blocos por módulo (conteúdo rico, equivalente ao readTime do módulo).
- NÃO use o tipo `image` (bloqueado por CSP/allowlist). Use diagramas (`stack_flow`, `arch_flow`, `flow_diagram`, `comparison_table`, `node_graph`).

## Tipos de bloco e SHAPE EXATO de `data` (siga à risca — shape errado = bloco some)

### Estritos (validados por Zod — se o shape falhar, o bloco é DROPADO):
- `section`: `{ "title": "1..200 chars" }` + `children: [...]`
- `paragraph`: `{ "content": [ {"text":"..."}, {"text":"negrito","bold":true}, {"text":"código","code":true}, {"text":"itálico","italic":true}, {"text":"link","link":"https://..."} ] }` (array com ≥1 nó; cada nó tem `text` string)
- `callout`: `{ "variant": "info"|"warning"|"danger"|"success", "title": "opcional ≤120", "content": "≥1 char" }`
- `code_block`: `{ "language": "python"|"typescript"|"bash"|"json"|..., "code": "…", "filename": "opcional" }` (code não-vazio ≤50000)
- `comparison_table`: `{ "columns": ["A","B",...(2 a 8)], "rows": [ ["c1","c2",...], ... ] }` — CADA row DEVE ter o MESMO número de células que columns; todas as células são STRING. Nenhuma coluna pode ser string vazia — **inclusive a primeira**: em tabela-matriz, dê um rótulo real à célula de canto (`"Aspecto"`, `"Critério"`) em vez de `""`, senão o bloco é dropado e a tabela desaparece.
- `quiz`: `{ "question": "…", "options": ["…", "…" (2 a 8)], "correctIndex": <int válido>, "explanation": "…" }`

### Não-estritos (o adapter exige estes campos; faltar = render vazio/null):
- `list`: `{ "items": ["...","..."], "ordered": true|false? }` (items = strings)
- `key_value`: `{ "items": [ {"k":"chave","v":"valor"}, ... ] }`
- `qa_item`: `{ "question":"…", "answer":"…" }`
- `stack_flow`: `{ "title":"…", "items": [ {"label":"…","text":"…"}, ... ] }`  (pilha vertical)
- `flow_diagram`: `{ "title":"…", "orientation":"horizontal"|"vertical", "steps": [ {"label":"…","desc":"…"}, ... ] }` (usa `steps`, NÃO `nodes`)
- `arch_flow`: `{ "title":"…", "columns": [ {"title":"Camada","items":["comp1","comp2"]}, ... ] }` (colunas → itens)
- `node_graph`: `{ "title":"…", "columns":[ {"title":"…","nodes":[ {"label":"…","note":"…"} ]} ], "legend":[ {"label":"…","color":"#hex"} ] }`
- `timeline`: `{ "title":"…", "events": [ {"when":"2025","label":"…","detail":"…"}, ... ] }`
- `hierarchy_diagram`: `{ "title":"…", "levels":[ {"label":"…","desc":"…"} ] }`
- `layer_stack`: `{ "title":"…", "layers":[ {"label":"…","instruction":"…","note":"…"} ] }`
- `split_flow`: `{ "title":"…", "center":"…", "left": {"label":"…","items":[{"label":"…","sub":"…"}]}, "right": {"label":"…","items":[...]} }`
- `comparison_flow`: `{ "title":"…", "left":[ {"label":"…","steps":[{"label":"…","instruction":"…"}]} ], "right":[ {…} ] }` (left/right são LISTAS não-vazias — 14 blocos deste tipo ficaram anos com `left: []` e `right: []` em produção, com título escrito e conteúdo nunca preenchido: renderizavam `null` e sumiam sem aviso)
- `matrix_diagram`: `{ "title":"…", "rowLabels":["…"], "colLabels":["…"], "matrix":[["célula", ...], ...] }`
- `mind_map`: `{ "root":"…", "branches":[ {"title":"…","items":["…","…"]} ] }`
- `decision_box`: `{ "scenario":"…", "winner":"…", "why":"…", "alternatives":[ {"name":"…","downside":"…"}, ... ] }`
- `annotated_formula`: `{ "title":"…", "formula":"custo = tokens_in × preço_in + …", "parts":[ {"symbol":"tokens_in","name":"…","color":"var(--ffv-blue)","description":"…"} ] }`

### `arch_diagram` — diagrama de arquitetura com ícones (validado estrito)

> **Renomeado de `aws_diagram` em jul/2026.** O componente sempre foi agnóstico
> (nós, grupos, arestas, passos); só o nome e o catálogo de ícones limitavam, e por
> isso as 8 trilhas de IA e produção ficaram sem desenho. O catálogo ganhou 55
> entradas de conceito não-AWS (`llm`, `hnsw`, `reward_model`, `feature_store`,
> `quorum`, `cdc`…). `aws_diagram` segue aceito como alias para não quebrar seed
> antigo, mas **use `arch_diagram` em conteúdo novo**.

Único bloco com ícones. SVG inline (nenhuma requisição externa — a CSP bloqueia).
Suporta navegação passo a passo: com `steps`, o leitor clica no número e só o
caminho daquele passo fica aceso.

```json
{ "type": "arch_diagram", "data": {
  "title": "…", "caption": "opcional, ≤600",
  "groups": [ { "label": "Camada", "kind": "account|vpc|region|plain",
                "nodes": [ {"id":"gw","service":"apigateway","label":"opcional","note":"opcional"} ] } ],
  "edges": [ {"from":"gw","to":"fn","label":"opcional","style":"solid|dashed"} ],
  "steps": [ {"label":"…","detail":"…","nodes":["gw","fn"],"edges":["gw>fn"]} ]
}}
```

Regras (o validador falha se quebrar):
- 1 a 8 grupos, cada um com ≥1 nó. `id` único no diagrama inteiro.
- `service` precisa existir no catálogo de `frontend/src/components/article/AwsIcon.tsx`
  (serviço fora do catálogo cai no ícone genérico → vira aviso).
- **`edges.from`/`edges.to` precisam referenciar `id` de nó existente.** Id errado
  faz a aresta sumir no render sem aviso — por isso é erro, não warning.
- `steps.nodes` referenciam ids; `steps.edges` usam o formato `"from>to"` e
  precisam corresponder a uma aresta declarada. Máximo 12 passos.
- Prefira 4 a 6 grupos e 6 a 8 passos: mais que isso vira mapa ilegível no mobile.
- Todo diagrama deve ter `caption` dizendo o que o leitor deve concluir dele.

## Estrutura recomendada de um módulo
1. `paragraph` de abertura (fisga o leitor com o problema real).
2. Várias `section` temáticas, cada uma com `paragraph` + tabela/diagrama/código/callout.
3. Pelo menos 1 `code_block` prático (boto3/TS) quando o tema for integração.
4. Um `decision_box` ou `comparison_table` para "quando usar o quê".
5. 2–3 `quiz` distribuídos ou ao final.
6. `callout` final "Próximo passo" apontando para o próximo módulo.

## Validação (rode até 0 erros)
```
python3 scripts/validate_bedrock_blocks.py 'scripts/seeds/articles/<slug>.json'
```
Só considere o módulo pronto quando imprimir `✅ … 0 erros.`
