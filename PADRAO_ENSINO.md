# Padrão de ensino da FFV Academy

> **Este documento é normativo.** Todo módulo novo e toda revisão de módulo existente
> seguem o que está aqui. Não é aspiração — cada regra abaixo tem um gate que a
> verifica, e o gate está no CI.

Consolidado em 29/jul/2026, a partir do que a auditoria pedagógica encontrou e do
que foi corrigido. Cada regra existe porque a ausência dela produziu um defeito
real e mensurável, e cada uma está anotada com esse defeito.

---

## As 5 regras

### 1. Onde há fluxo ou topologia, há diagrama

**Regra:** todo módulo cujo objeto de estudo seja *como as peças se conectam* ou
*em que ordem as coisas acontecem* tem um `arch_diagram`. Não é decoração — é
dupla codificação, e é o que permite ensinar arquitetura sem prosa.

O bloco serve topologia AWS **e** conceito de arquitetura: o catálogo tem 157
entradas, 55 delas de conceito (`llm`, `hnsw`, `reward_model`, `feature_store`,
`quorum`, `cdc`). `aws_diagram` é alias legado — ver a decisão registrada no fim
deste documento.

**O que conta como fluxo:**

| Tem fluxo → precisa de diagrama | Não tem fluxo → não force |
|---|---|
| Topologia de rede, camadas, quem alcança quem | Blueprint de exame, peso de domínio |
| Sequência temporal (ciclo de vida, pipeline, cutover) | Lista de preço, plano de suporte |
| Comparação de caminhos (A vs B vs C num mesmo desenho) | Q&A e simulado |
| Onde cada serviço entra numa solução | Glossário, história de uma tecnologia |
| Espectro de decisão (menos → mais controle) | Sintaxe de linguagem |

**Como o defeito apareceu:** as 4 trilhas de certificação AWS tinham **zero
diagramas** em 70 módulos com conteúdo, enquanto o SAA-C03 e o SAP-C03 são exames
de *desenho de arquitetura*. Cobertura da plataforma era 8%. Ensinar topologia em
prosa é ensinar a nadar por escrito.

**Contrato do bloco:** ver
[`_BEDROCK_AUTHORING_SPEC.md`](scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md).
Resumo do que não é negociável:

- **`caption` obrigatório**, dizendo o que o leitor deve concluir do desenho — não
  o que ele mostra. "Percorra os passos: quase toda questão de VPC é uma variação
  deste desenho" ensina; "diagrama de uma VPC" não.
- **5 a 7 `steps` percorríveis.** O passo é onde a pedagogia vive: cada um nomeia
  uma decisão e diz o que a prova cobra dela. Diagrama sem passo é figura.
- **3 a 4 grupos.** Mais que isso rola horizontalmente no mobile e o leitor perde
  a visão do fluxo — que era o ponto.
- **Aresta com `label`** quando a relação não é óbvia. `dashed` para relação de
  controle ou observação; `solid` para caminho do dado.
- **`service` do catálogo** de `AwsIcon.tsx`. Cuidado: nome de GLIFO (`workflow`,
  `search`, `doc`) não é chave de serviço — o glifo é o desenho, a chave é a
  entrada do catálogo. Escrever o glifo faz `serviceDef()` cair no fallback e
  render um cubo cinza de "Fora da AWS", **sem erro nenhum**. Foi assim que 148
  nós ficaram com a cor errada até ago/2026, inclusive em diagramas de rede das
  trilhas de certificação. `validate_servicos_diagrama.py` agora falha nisso.

**Gate:** `scripts/validate_cobertura_diagramas.py --strict` declara um mínimo por
trilha e falha abaixo dele. Ele também aborta se um id declarado no script não
existir no `curriculum.ts` — guarda que existe porque eu declarei cinco ids
inventados e o gate reportou verde.

---

### 2. Todo módulo tem 3 quizzes — e eles são o SRS

**Regra:** mínimo de 3 `quiz` por módulo. **Ao menos 1 antes de 75% da
leitura** (regra 2c, abaixo) — os demais numa seção `Fixando` antes do
callout final.

**Por que 3 e não 1:** o quiz não é avaliação, é **prática de recuperação** — a
técnica com melhor evidência em ciência do aprendizado. E aqui ela tem uma segunda
função estrutural: `addCardsFromQuiz` é a **única** fonte de cards do SRS. Cada
quiz vira uma carta com algoritmo SM-2. Módulo sem quiz não gera carta, e o
leitor nunca revisa aquele conteúdo.

**Como o defeito apareceu:** **357 de 393 módulos (90%) não tinham nenhum quiz**, e
36 de 38 trilhas com conteúdo estavam em zero. O SM-2 — descrito no `CLAUDE.md`
como diferencial central da escola, "o mesmo do Anki" — estava inerte para quase
toda a plataforma. Quem completava o SAA-C03 inteiro recebia **zero** cartas.

**Anatomia de um quiz que ensina:**

```
question:    cenário com restrição, não definição
             ✓ "O negócio aceita perder 15 min de dado e precisa voltar em 1h.
                Qual estratégia de DR é a MAIS ECONÔMICA que atende?"
             ✗ "O que é Pilot Light?"

options:     4 alternativas, todas plausíveis para quem estudou por cima.
             O distrator tem que ser a concepção errada que existe de verdade.

explanation: 3 partes, nessa ordem —
             (a) por que a correta é correta, com o mecanismo
             (b) por que CADA distrator falha, nomeando o erro de raciocínio
             (c) a regra generalizável, quando houver
             Mediana atual: ~425 caracteres. Menos que 200 raramente cobre (b).
```

**A parte (b) é a que mais ensina.** Quem erra escolheu o distrator por um motivo,
e nomear esse motivo é o que corrige o modelo mental. Exemplos:

> "Multi-AZ mantém um standby síncrono que NÃO serve tráfego. A confusão que a
> questão testa é acreditar que o standby atende leitura: ele não atende, em
> nenhuma circunstância."

> "Comprar Savings Plans antes de fazer rightsizing significa se comprometer com
> capacidade que você não deveria estar usando."

**Gate:** `src/tests/integration/gamificacao-conectada.test.ts` garante que o laço
chegue ao SRS. Cobertura de quiz por trilha: ver seção **Estado atual** abaixo.

#### 2b. O quiz não pode ser acertável sem ler o enunciado

Descoberto em 12/ago/2026, na auditoria pedagógica. A regra 2 exigia "4
alternativas, todas plausíveis" e ninguém media se elas eram. Dois vazamentos
independentes, sobre os 1.472 quizzes dos seeds:

| Vazamento | Medido | Efeito |
|---|---|---|
| **Posição** | 92,6% das corretas no índice 1; índice 3 com 2 ocorrências em 1.472 (0,1%); em 410 dos 490 módulos as TRÊS corretas na mesma posição | marcar sempre a segunda acertava 93% |
| **Comprimento** | a correta é a mais longa em 93,4% (acaso 25%) — 135 caracteres contra 51 dos distratores | marcar sempre a mais longa acertava 93% |

Combinados, **~98% dos quizzes eram acertáveis sem ler a pergunta**.

**Por que isto é pior aqui que em qualquer outro lugar:** o quiz é a única
fonte de cartas do SRS, e `createCard` guarda `options` e `correct` na ORDEM
ORIGINAL. Cada revisão espaçada re-apresentava o artefato — o SM-2, vendido
como o diferencial da escola, treinava reconhecimento de formato.

**O mais constrangedor é que a régua já existia.**
`validate_question_bank.py` reprova acima de **45%** numa letra e roda no CI
desde ago/2026, porque um arquivo do banco de simulados tinha 87% das corretas
em "A". Essa régua nunca foi apontada para os seeds. É `feedback: nome de gate
não garante escopo` outra vez — o gate se chama "question-bank" e cobre
exatamente o que o nome diz, enquanto 1.472 quizzes ao lado estavam em 92,6%.

**Correção da posição:** `scripts/corrigir_gabarito_quiz.py` redistribuiu para
23,8%–26,3% por índice. Ele é **idempotente por construção** — calcula um
índice de destino por SHA-256 de (slug + pergunta) e move a correta para lá,
em vez de permutar a ordem atual. A primeira versão permutava, e rodar duas
vezes compunha a permutação consigo mesma: diff novo nos 490 arquivos a cada
execução e `content_hash` oscilando sem mudança real de conteúdo. Rodar N
vezes hoje tem o mesmo efeito de rodar uma.

**O comprimento continua em 93,4% e é dívida aberta.** Corrigir exige
reescrever 4.416 distratores — a correta carrega o mecanismo ("...porque o
custo cresce com o quadrado da conversa") e o distrator é frase nominal de
quatro palavras. É redação técnica, não conversão mecânica, e por isso o gate
trata os dois vazamentos de formas diferentes: **posição tem limite fixo**
(35%, mecanicamente corrigível) e **comprimento é ratchet** (teto que só
desce).

**Gate:** `scripts/validate_quiz_respondivel.py`, no CI.

#### 2c. A recuperação tem de ser distribuída, não massada no fim

Descoberto na mesma auditoria de 12/ago/2026. Medido sobre os 1.472 quizzes:
**95,8% ficavam no último quarto do módulo, zero no primeiro quarto**, e em
94,7% dos módulos os 3 quizzes ficavam TODOS acima de 0,75 da posição de
leitura. Não era prática de recuperação DISTRIBUÍDA — a técnica que a própria
regra 2 invoca como evidência —, era uma sessão única de 3 perguntas coladas
no fim. A convenção antiga ("seção Fixando antes do callout final")
concentrava exatamente o que a justificativa da regra pede pra espalhar.

**Correção:** o quiz que já é o primeiro do módulo (por ordem de leitura) é
posicionado logo depois da seção do meio, não em Fixando. Os outros dois
continuam em Fixando (ou onde já estavam, no caso das trilhas Bedrock/MLA que
não usam essa seção). A ordem relativa entre os quizzes nunca muda — só a
posição do primeiro — porque o id da carta de SRS (`${slug}_q${i}` em
`engine.ts`) vem do ÍNDICE DE DESCOBERTA na caminhada de leitura
(`extrairQuizzes`, `lib/article-extract.ts`), e mudar qual quiz é "o
primeiro" orfanaria cartas de quem já leu o módulo.

**Gate:** `scripts/validate_recuperacao_distribuida.py`, no CI — reprova
módulo em que TODOS os quizzes ficam acima de 0,75. Script de correção:
`scripts/distribuir_quiz_no_meio.py` (idempotente — segunda execução não
move nada).

---

### 3. O laço de gamificação fecha em toda rota de conteúdo

**Regra:** qualquer rota que renderize `BlockTree` renderiza também
`ConcluirModulo`, passando `blocks`.

**Como o defeito apareceu:** `markComplete` — que concede XP, move o streak, avalia
badge, sobe nível e cria as cartas de SRS — era chamado **apenas** pelo
`ModuleLayout`, componente legado da época em que cada módulo era um `page.tsx`
escrito à mão. A rota atual, CMS-driven, não chamava nada. **Ler qualquer um dos
393 módulos não dava XP, não movia streak e não gerava uma única carta.** A página
`/revisar` ficava permanentemente vazia. Nada quebrava: HTTP 200, conteúdo na
tela.

**Detalhe que não pode ser esquecido:** o bloco usa `correctIndex`, o engine espera
`correct`. Passar `data` direto cria carta com a resposta errada marcada como
certa. A tradução está em `ConcluirModulo.tsx` e há teste sobre ela.

**Gate:** `gamificacao-conectada.test.ts` falha se surgir rota com `BlockTree` sem
`ConcluirModulo`.

---

### 4. Nenhum bloco pode desaparecer em silêncio

**Regra:** bloco que não passa o schema Zod volta `null` no `BlockRenderer` e
**some da página sem erro**. Isso é a falha mais perigosa da plataforma, porque
o leitor perde conteúdo e ninguém fica sabendo.

**Como o defeito apareceu, três vezes:**

| Achado | Alcance |
|---|---|
| 14 blocos `comparison_flow` com `left: []` e `right: []` — título escrito, conteúdo nunca preenchido | 12 módulos centrais: `tokens`, `o-que-e-llm`, `tool-calling`, `kv-cache`… |
| 2 tabelas com 7 colunas (cap do schema era 6) e 4 com cabeçalho de canto vazio | 6 módulos |
| `MatrixDiagram` declarava `data: number[][]` e chamava `.toFixed(2)` — o spec manda célula string | derrubava a **página inteira** em 6 artigos |

**Regras que saíram disso:**

- Célula de canto de tabela-matriz recebe rótulo real (`Aspecto`, `Critério`),
  nunca `""`.
- `comparison_flow`, `decision_box` e afins: se você escreveu o título, preencha o
  conteúdo na mesma sessão. Título sem conteúdo é bloco invisível.
- Antes de usar um primitive novo, confira que o contrato declarado é o que o
  adapter do CMS realmente envia — os testes cobriam o formato *declarado*, não o
  formato *entregue*.

**Gates:** `validate_bedrock_blocks.py` (varre **todos** os seeds, não só
`bedrock-*` — o padrão antigo validava 31 de 393 e imprimia verde) e
`src/tests/integration/seed-blocks-schema.test.ts` (8.694 blocos contra os
schemas Zod).

#### 4b. A forma de cada bloco vem do ADAPTER, não do schema Zod

Descoberto em 04/ago/2026, e é a continuação natural da regra 4: bloco pode
**renderizar vazio**, que é pior que desaparecer, porque parece que está tudo certo.

Dois fatos que você precisa saber antes de escrever qualquer bloco:

**1. Seis schemas Zod descrevem formas que nada renderiza.** `DecisionBoxSchema`,
`FlowDiagramSchema`, `ArchFlowSchema`, `NodeGraphSchema`, `MatrixDiagramSchema` e
`AnnotatedFormulaSchema` estão em `schemas.ts` com aparência de contrato e não são
consumidos por ninguém. Exemplo: o schema de `decision_box` declara
`prompt`/`options`; o adapter lê `scenario`/`winner`/`why`/`alternatives`. Como o
tipo está registrado como `PassthroughObject`, a forma "errada" **passa a validação e
renderiza a caixa com todos os campos vazios**. Eu caí nisso escrevendo um módulo
contra o schema declarado.

> **Fonte de verdade é o adapter em `BlockRenderer.tsx`.** Ao escrever um bloco de
> tipo que você não usa há tempo, abra o adapter dele e veja quais chaves ele lê.

**2. Os primitives aceitam mais campos do que os adapters entregavam.** Medido nos
seeds: 282 de 367 itens de `stack_flow` sem texto de corpo (o primitive renderiza
`detail`, o adapter mandava `text`), 148 de 197 anotações de fórmula com os três
campos visíveis vazios, 279 de 318 nós de `node_graph` sem subtítulo. Mais de 1.300
campos escritos por autor que nenhuma página mostrava, em 100+ módulos. Corrigido nos
adapters — mas a lição fica: **conteúdo pode estar no JSON e não estar na tela.**

**Gate:** `scripts/validate_primitives_render.py`, no CI. Ele distingue duas coisas
que se parecem — *campo vazio porque o autor não escreveu* (aceitável, é escolha
editorial) de *campo vazio porque o código não lê a chave* (defeito, sempre). Hoje:
3.255 itens conferidos, zero perda.

---

**3. A cadeia tem TRÊS elos, e o do meio ficou sem gate até ago/2026.**

```
seed JSON  →  adapter (BlockRenderer.tsx)  →  primitive (primitives.tsx)  →  tela
           ↑                               ↑
  validate_primitives_render.py     validate_adapter_primitive.py
                                    cobertura-de-blocos.test.tsx
```

O elo `seed → adapter` estava coberto. O elo `adapter → primitive` não, e três
defeitos da MESMA forma o atravessaram — o adapter entrega uma prop, o primitive
não a declara, e o texto escrito **desaparece da tela sem erro nenhum**:

| bloco | prop perdida | alcance medido |
|---|---|---|
| `decision_box` | `downside` (o primitive lia `note ?? when`) | **82 de 391** alternativas, 120 módulos |
| `annotated_formula` | `name` (o primitive fazia `text ?? label ?? name`) | **53 de 201** partes, 12 módulos |
| `stack_flow` | `text` vs `detail` | 282 de 367 itens |

O de `annotated_formula` mostra por que dois gates são necessários e não um:
`name` **estava declarado** no tipo do primitive — o gate estático passava — e
mesmo assim não chegava à tela, porque a normalização o consumia como fallback de
`text`. **Declarar não é renderizar.** Quem pega esse caso é o teste que afirma
sobre a tela, com o shape real dos seeds.

> **Ao escrever um bloco: abra o adapter E o primitive, nessa ordem.** O schema
> Zod diz o que é aceito; o adapter diz o que é lido; o primitive diz o que é
> **desenhado**. Os três podem discordar, e discordaram.

**Cor de borda não é cor de texto.** No mesmo dia, `DecisionBox` pintava o rótulo
`Alt:` com `--ffv-border` — **1,34:1** em tema claro, num rótulo que carrega
significado. E o travessão que juntava nome e desvantagem aparecia mesmo sem a
desvantagem: pontuação prometendo um texto ausente, produzida pelo componente e
por isso fora do alcance de qualquer gate de conteúdo.

**Correção aplicada em ago/2026:** os oito tipos citados acima deixaram de ser
`PassthroughObject` — os schemas foram reescritos conforme o adapter e registrados
de verdade, então a forma errada agora **falha no teste** em vez de renderizar
vazio. A lição de como escrevê-los veio na hora: declarei a célula de
`matrix_diagram` como texto e o gate derrubou 3 blocos legítimos de `transformers`,
onde célula numérica vira heatmap de pesos de atenção — comportamento intencional
do primitive. A forma sai do primitive, nunca da suposição de quem escreve o
schema.

---

### 5. Voz e verificabilidade

**Voz:** PT-BR, engenharia sênior, sem hype. Densa e direta. Explica o *porquê* e
o *como*, não só o quê. Público: dev que quer virar sênior.

**Números voláteis:** preço, peso de domínio de exame, duração de prova e limite de
serviço mudam. Aponte para a fonte oficial em vez de fixar o valor — nenhum número
decorado sobrevive ao ciclo de vida de uma certificação. O que a prova cobra é o
*modelo* (cobrança por token, por unidade reservada, com desconto em lote), não o
valor.

**Precisão que não pode escorregar** (verificada nesta base):

- ID de modelo no Bedrock leva prefixo de provedor: `anthropic.claude-opus-5`. Na
  API direta da Anthropic é sem prefixo.
- Prompt caching no Bedrock é **explícito**, não automático.
- Claude Platform on AWS **não é** o Bedrock: operada pela Anthropic, outra
  autenticação, paridade de recurso mais rápida.
- O Bedrock **não tem** busca na web gerenciada, execução de código gerenciada nem
  conector MCP. Tem batch inference próprio, com desconto.

---

## Checklist de módulo pronto

```
[ ] 22–34 blocos, coerentes com o readTime declarado
[ ] `objetivo` no Module (curriculum/trails/*.ts) — resultado, não conteúdo. Obrigatório em módulo de entrada de trilha
[ ] aws_diagram se há fluxo ou topologia (regra 1), com caption + 5–7 steps
[ ] 3 quiz — 1 antes de 75% da leitura, os demais numa seção "Fixando" — com explicação que trata cada distrator
[ ] exam_domain_badge, se for módulo de certificação
[ ] ≥1 code_block real quando o tema é integração
[ ] `code_block` com `language: "json"` faz `JSON.parse` de verdade — comentário explicativo vai em `filename` ou em parágrafo antes, nunca dentro do JSON
[ ] 1 decision_box ou comparison_table de "quando usar o quê"
[ ] callout final de próximo passo
[ ] nenhum bloco com título e conteúdo vazio
[ ] python3 scripts/validate_bedrock_blocks.py → 0 erros
[ ] navegador: renderiza, gera carta ao concluir, sem overflow a 375px
```

---

## Os gates, e o que cada um impede

| Gate | Impede |
|---|---|
| `validate_cobertura_quiz.py --strict` | **qualquer** módulo com seed abaixo de 3 quizzes — e, por consequência, conteúdo sem carta de SRS. Desde ago/2026 a regra é geral, com lista de exceções (vazia), em vez de lista de trilhas cobertas: módulo novo sem quiz quebra o CI no commit em que entra |
| `validate_quiz_respondivel.py` | gabarito adivinhável sem ler o enunciado — posição concentrada (limite fixo 35%) e correta sempre mais longa (ratchet). Achado 12/ago/2026: 92,6% no índice 1, 93,4% era a mais longa |
| `validate_cobertura_objetivo.py --strict` | módulo de ENTRADA de trilha (piso fixo, 38/38) ou o total (ratchet) perder `objetivo` — o contrato "resultado, não conteúdo" que `jornada.ts` já tinha nas 5 etapas e faltava no módulo |
| `validate_recuperacao_distribuida.py --strict` | módulo com TODOS os quizzes acima de 0,75 da posição de leitura — recuperação massada no fim em vez de distribuída. Achado 12/ago/2026: 94,7% dos módulos estavam assim |
| `validate_json_code_valido.py --strict` | bloco `language: "json"` que não faz parse — geralmente comentário explicativo colado dentro do JSON. Ratchet (teto 48, era 97); reconhece JSON Lines como formato legítimo, não como quebrado |
| `validate_bedrock_blocks.py` | bloco malformado que sumiria da página; aresta órfã; ícone fora do catálogo |
| `validate_cobertura_diagramas.py --strict` | trilha de arquitetura cair abaixo do mínimo de diagramas; id fantasma no próprio gate |
| `validate_cobertura_servicos.py` | serviço catalogado e nunca explicado |
| `validate_substancia.py` | módulo que é ESBOÇO: passa em todos os outros gates (blocos válidos, quiz presente, seed existente) e não ensina nada. Piso de 900 caracteres, contra mediana de 6.082 — ele só dispara no indefensável |
| `validate_servicos_diagrama.py` | chave de ícone fora do catálogo — que renderiza cubo cinza genérico sem sintoma no build |
| `diagramas-de-seed.test.tsx` | diagrama ESCRITO que não chega à tela: renderiza a partir dos seeds reais e exige título, legenda e todo rótulo de nó visíveis |
| `check-curriculum-seed-drift.mjs --strict` | slug declarado sem seed (404); seed sem mapping (artigo órfão no hub "Legacy"). Em `--strict` desde ago/2026, quando o débito zerou |
| `validate_primitives_render.py` | conteúdo escrito que a página não mostra porque o adapter não lê a chave (1.300+ campos assim em 100+ módulos até ago/2026) |
| `validate_adapter_primitive.py --strict` | prop que o adapter ENTREGA e o tipo do primitive não DECLARA — o 2º elo da cadeia de render, por onde passaram três defeitos que apagavam conteúdo escrito sem erro nenhum |
| `cobertura-de-blocos.test.tsx` | os 26 tipos de bloco renderizados pelo `BlockRenderer` com o shape REAL dos seeds, afirmando que a prosa escrita aparece. Pega o que o gate estático não pega: prop declarada e mesmo assim não desenhada |
| `validate_labs_aws.py --strict` | laboratório da série de 100 com uma só topologia, **sem a terceira arquitetura** (evolução em níveis com risco, custo e o topo em dados/IA), sem seção de limpeza, sem entregável declarado, ou com número no slug |
| `paleta-contraste.test.ts` | variável de paleta usada como texto abaixo de 4,5:1, nos dois temas e sobre chip tingido; cor de identidade pintando texto sem `.ffv-acento-texto`; `--ffv-border` como cor de texto |
| `validate_servicos_diagrama.py` (relatório) | barra de QUALIDADE do diagrama: nó sem nota, aresta sem rótulo, passo fora de 5–7, `kind` inválido. Dívida medida em 07/ago: 871 arestas e 218 nós |
| `validate_explicacao_simulado.py` (relatório) | questão de simulado cuja explicação não trata cada distrator. Medido: 67 das 75 |
| `content-manifest-fresco.test.ts` | manifesto gerado e commitado ficar obsoleto vs. os seeds — o que fazia sitemap e números da home descreverem um passado |
| `seed-blocks-schema.test.ts` | qualquer bloco que falharia o Zod e desapareceria |
| `gamificacao-conectada.test.ts` | rota de conteúdo sem conceder XP nem gerar carta de SRS |
| `paginas-de-trilha.test.ts` | página indexando `CURRICULUM` por posição (11 páginas mostravam a trilha ERRADA após o pivot) |
| `sitemap.test.ts` | URL anunciada ao Google que responde 404 |
| `landmarks.test.ts` | `<main>` aninhado |
| `seo-descriptions.test.ts` | módulo sem descrição de SEO; `seoDesc` voltando ao bundle do cliente |

**A lição transversal:** cobertura silenciosamente parcial é pior que nenhuma
cobertura, porque produz um verde em que as pessoas confiam. O validador que olhava
31 de 393 arquivos imprimia `✅ 0 erros` e todos acreditavam.

---

## Estado atual (04/ago/2026)

| Métrica | Valor |
|---|---|
| Slugs declarados / com conteúdo | 422 / **415 — zero 404** |
| Blocos | **10.623** · 0 erros |
| Módulos com diagrama | **186** (44%) — todas as 39 trilhas com pelo menos um |
| Quizzes | **1.247** em **415** módulos, **100%** (= 1.247 cartas de SM-2) |
| Menor módulo | **915** caracteres de conteúdo que ensina (era 303) |
| Hubs com cobertura total de quiz | **7 de 7** |
| Campos escritos que não chegam à página | **0** (gate 4b) |
| Nós de diagrama com ícone no fallback | **0** (gate novo) |
| Entradas no catálogo de ícones | **205** — inclui todos os nomes de glifo como conceito, porque escrever o nome do DESENHO em vez da chave foi o erro de autoria mais recorrente |

### ✅ Hubs com padrão completo — AWS e Claude

| Trilha | Quiz | Diagrama | Quizzes |
|---|---|---|---|
| AWS Cloud Practitioner | **17/17** | 15/17 | 51 |
| AWS Solutions Architect Associate | **20/20** | 18/20 | 60 |
| AWS Developer Associate (DVA-C02) | **15/15** | 13/15 | 45 |
| AWS Solutions Architect Professional (SAP-C03) | **18/18** | 16/18 | 54 |
| AWS AI Practitioner (AIF-C01) | **13/13** | 12/13 | 40 |
| AWS Bedrock — GenAI em Produção | **31/31** | 29/31 | 94 |
| Anthropic Claude AI Practitioner | **14/14** | 6/14 | 42 |
| Claude Code: do zero ao poder total | **18/18** | — | 54 |
| API Claude & Agents | **12/12** | — | 36 |
| Claude Code Pro: Harness Engineering | **9/9** | — | 27 |
| **Total** | **167/167** | 109/167 | **503** |

As três últimas trilhas fecharam em ago/2026 e entraram em `COMPLETAS` no
`validate_cobertura_quiz.py` — a lista do gate só cresce, e cresce quando um hub
inteiro é fechado. Elas não têm diagrama porque tratam de ferramenta e fluxo de
trabalho, não de topologia; forçar diagrama ali seria decoração, o que a regra 1
proíbe.

Números medidos de `content-manifest.json` (`porTrilha`), gerado dos seeds — não
digitados à mão.

Todo módulo de certificação tem 3+ quizzes e, onde há fluxo real, diagrama de
arquitetura. Os módulos sem diagrama são `intro`, `simulado` e
`precificacao-suporte` — logística de prova, sem topologia para desenhar. A trilha
Anthropic é a exceção declarada: dos 14 módulos, 6 têm diagrama porque os outros
tratam de forma de API e de decisão comparativa, onde tabela e caixa de decisão
ensinam melhor que topologia. Forçar diagrama ali seria decorar, o que a regra 1
proíbe explicitamente. A decisão
está registrada aqui para não ser reaberta a cada revisão.

**Gates que travam isso:**
- `validate_cobertura_quiz.py --strict` — falha se qualquer módulo dessas 6 trilhas
  cair abaixo de 3 quizzes. Ele pegou `bedrock-o-que-e-e-por-que` com 2.
- `validate_cobertura_diagramas.py --strict` — mínimo de diagramas por trilha.

### Trilhas de arquitetura de IA e produção — diagrama iniciado

Destravadas pela decisão do `arch_diagram`. Cada uma tem o primeiro diagrama, e o
mínimo está declarado no gate:

| Trilha | Diagrama escrito |
|---|---|
| Engenharia AI-Native | pipeline RAG completo · workflow vs laço de agente |
| RLHF & Agents | os 3 estágios (SFT → RM → PPO) com a penalidade KL |
| Sistemas Distribuídos | consenso Raft: líder, quórum, heartbeat |
| MLOps | ciclo completo: feature store → registry → serving → drift |
| Observabilidade & SRE | 3 pilares → SLO → error budget → plantão |
| Search & IR | busca híbrida: 2 recalls, fusão RRF, cross-encoder |
| Data Engineering | batch vs streaming convergindo no lakehouse |
| NoSQL + Vector | forma de acesso decide o banco · HNSW vs IVF |

### O que falta, nomeado

1. **~287 módulos fora das certificações sem quiz.** Cada um sem carta de SRS. É a
   maior massa pedagógica restante; o padrão está nas regras 2 e 3, com as 6
   trilhas de certificação como referência de qualidade.
2. **Módulos restantes das 8 trilhas acima**, listados em `PENDENTES` dentro do
   `validate_cobertura_diagramas.py`, que os imprime a cada execução — eval
   harness, DPO/GRPO, replicação, serving em detalhe, OTel stack, índice invertido
   do Lucene, lakehouse, single-table design.

Nenhuma dessas listas depende de memória: estão nos gates e neste documento.

## ✅ Decisão tomada: `arch_diagram` (29/jul/2026)

O bloco chamava-se `aws_diagram` e o catálogo só tinha serviços AWS, o que deixava
as 8 trilhas de IA e produção sem desenho — RLHF, HNSW, consenso e feature store não
são topologia AWS. **Decisão: renomear para `arch_diagram` e abrir o catálogo.**

Como foi executado, e por que nessa ordem:

1. **Alias antes da migração.** `arch_diagram` entrou como canônico e `aws_diagram`
   ficou registrado como alias no schema, no adapter e no validador. Sem isso, o
   instante entre trocar o código e migrar os seeds faria 96 blocos falharem o Zod,
   voltarem `null` e **desaparecerem da página sem erro** — a regra 4 deste
   documento, aplicada a si mesma.
2. **Migração dos 96 blocos**, verificada no navegador: arestas desenhadas, passos
   percorríveis e lista `sr-only` em todos. Nenhum diagrama se perdeu.
3. **Catálogo de 101 → 157 entradas**, com 55 conceitos numa categoria `conceito`
   nova: `llm`, `retriever`, `reranker`, `hnsw`, `ivf`, `bm25`, `reward_model`,
   `ppo`, `feature_store`, `drift`, `quorum`, `log_replicado`, `shard`, `span`,
   `slo`, `error_budget`, `cdc`, `bronze`/`prata`/`ouro`. Reusam os 34 glifos
   existentes — muda o rótulo e a cor da categoria.
4. **Antes de escrever os diagramas novos**, não depois: migrar 96 é melhor que
   migrar 131.

O alias `aws_diagram` permanece aceito para não quebrar seed de terceiro, mas
conteúdo novo usa `arch_diagram`. A spec de autoria já reflete isso.

**Erro que o validador pegou na hora:** usei `service: 'container'` num diagrama —
`container` é nome de *glifo*, não chave do catálogo. Caiu no ícone genérico e o
validador avisou. Chave certa: `compute`.

---

## Referências

- [`scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md`](scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md) — contrato exato de cada tipo de bloco
- [`PLANO_MESTRE_PENDENCIAS_2026-08.md`](PLANO_MESTRE_PENDENCIAS_2026-08.md) — **fonte única de tarefas abertas**
- [`BACKLOG_PLATAFORMA_2026-07.md`](BACKLOG_PLATAFORMA_2026-07.md) — backlog de conteúdo e diagramas (histórico)
- [`BACKLOG_UX_2026-07.md`](BACKLOG_UX_2026-07.md) — auditoria de experiência
- [`PLANO_ECOSSISTEMA_AWS_IA.md`](PLANO_ECOSSISTEMA_AWS_IA.md) — plano do ecossistema AWS/IA
