## ADDED Requirements

### Requirement: Módulo do hub Base técnica tem apoio visual estrutural ou exceção declarada

Todo módulo do hub Base técnica (as 6 trilhas de fundamentos) DEVE (MUST) conter ao menos
um bloco visual estrutural — `arch_diagram`, `flow_diagram`, `layer_stack`,
`hierarchy_diagram`, `matrix_diagram`, `node_graph`, `stack_flow`, `comparison_flow`,
`arch_flow`, `timeline`, `annotated_formula` ou `decision_box` — OU constar na lista
`EXCECOES` de `scripts/validate_apoio_visual_fundamentos.py` com um motivo em uma linha.

Prosa que descreve uma topologia, uma hierarquia ou uma sequência sem um bloco visual é o
defeito que este requisito impede: o iniciante vê o hub Base técnica primeiro, e era o hub
com menor densidade visual (0,4 bloco/módulo contra 4,8 do hub AWS).

#### Scenario: módulo sem visual e sem exceção
- **WHEN** um módulo do hub Base técnica não tem nenhum bloco visual estrutural e não está em `EXCECOES`
- **THEN** `validate_apoio_visual_fundamentos.py --strict` falha nomeando o módulo

#### Scenario: exceção obsoleta
- **WHEN** um módulo está em `EXCECOES` mas ganhou um bloco visual desde então
- **THEN** o gate falha pedindo a remoção da exceção — a lista não pode guardar desculpas vencidas

#### Scenario: módulo com visual
- **WHEN** o módulo tem ao menos um dos tipos visuais aceitos
- **THEN** o gate conta o módulo como coberto e passa

### Requirement: O bloco visual entrega a ideia em campos preenchidos, não vazios

Cada bloco visual inserido DEVE (MUST) ter rótulo, nota ou legenda preenchidos nos campos que
o primitive exige, para não renderizar vazio e silenciosamente (a classe de defeito da regra 4b
do `PADRAO_ENSINO.md`).

#### Scenario: campo obrigatório vazio
- **WHEN** um bloco visual tem `title`/`caption`/`label` obrigatório em branco
- **THEN** `validate_primitives_render.py` acusa o item como potencialmente invisível
