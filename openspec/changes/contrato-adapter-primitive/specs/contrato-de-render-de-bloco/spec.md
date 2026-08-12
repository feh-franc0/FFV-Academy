## ADDED Requirements

### Requirement: Prop entregue pelo adapter é declarada pelo primitive

Para todo tipo de bloco com adapter, o conjunto de props que o adapter entrega DEVE (MUST)
estar contido no conjunto de props que o primitive declara. Prop entregue e não
declarada é falha de CI.

#### Scenario: adapter entrega prop que o primitive ignora
- **WHEN** o adapter de `decision_box` entrega `downside` em cada alternativa e o tipo
  do primitive declara apenas `name`, `label`, `text`, `note` e `when`
- **THEN** o gate falha nomeando o tipo de bloco, a prop e os dois arquivos

#### Scenario: prop declarada e nunca entregue
- **WHEN** o primitive declara `tone` e nenhum adapter a entrega
- **THEN** o gate emite **aviso**, não erro: o primitive também é usado direto em JSX, e
  prop sem uso pelo CMS pode ser legítima

#### Scenario: cadeia coerente
- **WHEN** adapter e primitive concordam em todas as props de um tipo
- **THEN** o gate passa e imprime o tipo como conferido

---

### Requirement: Todo tipo de bloco com adapter tem teste de render com o shape dos seeds

Cada tipo de bloco registrado em `BLOCK_DATA_SCHEMAS` DEVE (MUST) ter ao menos um teste que
renderize **através do `BlockRenderer`**, com o shape exato que os seeds usam, e que
afirme que o conteúdo escrito aparece na tela.

Renderizar o primitive direto não satisfaz o requisito: é justamente o salto adapter →
primitive que os três defeitos atravessaram.

#### Scenario: tipo de bloco sem teste de render
- **WHEN** um tipo está em `BLOCK_DATA_SCHEMAS` e nenhum teste o renderiza via
  `BlockRenderer`
- **THEN** o gate de cobertura de contrato falha, listando os tipos descobertos

#### Scenario: teste que só renderiza o primitive
- **WHEN** o teste importa o primitive e passa props tipadas à mão
- **THEN** não conta como cobertura: o shape do CMS não foi exercido

---

### Requirement: Separador só aparece quando há texto depois dele

Componente que junta dois textos com pontuação — travessão, dois-pontos, barra — NÃO
DEVE (MUST NOT) renderizar o separador quando a segunda parte está vazia.

Pontuação que promete um texto ausente é o mesmo sinal que
`validate_texto_sem_lacuna.py` procura na prosa dos seeds. A diferença é que ali ele é
escrito pelo autor, e aqui é produzido pelo componente — e por isso nenhum gate de
conteúdo o alcança.

#### Scenario: alternativa sem desvantagem escrita
- **WHEN** uma alternativa de `decision_box` tem apenas `name`
- **THEN** a linha renderiza `Alt: App Runner`, sem travessão

#### Scenario: alternativa com desvantagem
- **WHEN** a alternativa tem `name` e `downside`
- **THEN** a linha renderiza nome, travessão e a desvantagem

---

### Requirement: Cor de borda não é cor de texto

Variável de paleta destinada a **borda** NÃO DEVE (MUST NOT) ser usada como cor de texto.

O caso medido: `DecisionBox` pintava o rótulo `Alt:` com `--ffv-border`, **1,34:1** em
tema claro — um rótulo que carrega significado e que praticamente não se lia. O
elemento pai já era `--ffv-muted`; o span existia para apagar mais, e apagou até
desaparecer.

#### Scenario: `--ffv-border` como cor de texto
- **WHEN** um componente define `color: var(--ffv-border)` num elemento com texto
- **THEN** o lint de estilo falha, indicando `--ffv-muted` como a variável de texto de
  menor ênfase

---

### Requirement: A regra de leitura fica registrada como norma

O documento normativo de ensino DEVE (MUST) registrar que a forma de um bloco vem do adapter
**e** que o adapter tem de casar com o primitive, com o alcance medido dos três
defeitos como justificativa.

#### Scenario: autor escreve bloco contra o schema declarado
- **WHEN** alguém escreve um bloco novo consultando apenas o schema Zod
- **THEN** o documento normativo o direciona ao adapter e ao primitive, nessa ordem, e
  cita que 82 de 391 alternativas ficaram vazias por esse caminho
