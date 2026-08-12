# O que falta — plano de execução

> **Documento único de tarefas abertas.** Substitui, como fonte de trabalho, o
> [`PLANO_MESTRE_PENDENCIAS_2026-08.md`](./PLANO_MESTRE_PENDENCIAS_2026-08.md), que
> permanece como registro do que já foi feito e por quê.
>
> **Todo número aqui foi medido por script em 04/ago/2026** contra o repositório.
> A seção [Como revalidar](#como-revalidar) reproduz cada medição. Nada vem de
> memória — e quando uma medição anterior se mostrou errada, a correção está
> registrada em vez de apagada.

---

## Estado de partida

| Métrica | Valor medido |
|---|---|
| Slugs declarados / com conteúdo | 423 / 416 — **zero rotas em 404** |
| Blocos válidos | 10.916 · 0 erros |
| Quizzes (= cartas de SM-2) | **1.283** em 427 módulos — **100%** |
| Hubs com quiz completo | **7 de 7** |
| Módulos com diagrama | **207 de 427 (48%)** — todas as 41 trilhas cobertas · **100 arquiteturas** só na trilha `trail-arq-ia-aws` |
| Módulos com APOIO VISUAL | **427 de 427 (100%)** — verificado no HTML servido |
| Gates de conteúdo no CI | **11** — quiz, diagrama, serviços, ícone, primitives, substância, bedrock, drift, índice leve, lacuna de texto, resposta citável |
| Temas (eixo de assunto) | **21 declarados · 19 com página · 982 atribuições** módulo → tema |
| Consultas de busca mapeadas | **10.000**, com tema, arquétipo, intenção e módulo dono |
| Perguntas respondidas | **1.357** — 57 em página de tema, 1.300 em módulo · hub em `/perguntas` |
| Rotas com canônica | **75** · 7 com `noindex` · `/admin` fora do índice por header |
| Módulos com `Perguntas frequentes` | **427 de 427 (100%)** — gate invertido: ausência agora é regressão |
| Testes frontend | **898 passando** · `tsc` 0 · lint 0 · varredura verde (**16 checagens**, 536 telas renderizadas) |
| `<head>` servido | **0 defeitos** em 100 rotas e nas 521 URLs do sitemap — canônica, Open Graph, `twitter` e dados estruturados medidos no HTML, não no componente |
| Rotas retiradas no pivot | **55 inventariadas** — 34 com 301 (era **6**), 21 em 404 deliberado · `src/lib/rotas-retiradas.ts` |
| Descrições de SEO | **426 entre 74 e 165 caracteres**, mediana **124** (era 89) · faixa e forma de frase travadas no CI |
| Acessibilidade (axe-core) | **0 violações estruturais** graves/críticas em **22 rotas** · dívida de contraste: **479 → 308 nós** nos mesmos 20 alvos (`/mapa` 82 → 2), com teto por rota descido no mesmo commit |
| Backend | `go build` + `go vet` verdes · **247** pacotes unit ok · contract ok |

**O que mudou em 04/ago/2026 (segunda rodada):**

- **A-3 fechada.** Os 63 módulos restantes ganharam 3 quizzes cada. A cobertura
  saiu de 85% para 100%, e o gate foi **invertido**: em vez de listar as trilhas
  já cobertas, ele agora exige cobertura de todo módulo com seed e mantém uma
  lista de exceções — hoje vazia. Módulo novo sem quiz quebra o CI no mesmo
  commit em que entra.
- **A-4 fechada em 44%.** 68 diagramas novos (118 → 186), e **nenhuma trilha ficou
  sem nenhum** — onze estavam completamente sem, incluindo Redes & Web, onde
  topologia é o próprio objeto de estudo. Os mínimos por trilha foram ajustados ao
  que cada uma tem, travando o que existe sem forçar figura onde não há fluxo.
- **Defeito visual encontrado e corrigido.** 148 nós de diagrama usavam o nome da
  categoria como chave de ícone (`service: 'network'`). Como `serviceDef()` tem
  fallback silencioso, todos renderizavam como cubo cinza de "Fora da AWS" —
  inclusive nas trilhas de certificação, onde topologia é o objeto de estudo. O
  texto aparecia certo, porque vem do rótulo do nó; só a cor e o glifo se
  perdiam. Corrigido com genéricos por categoria + 8 motores fora da AWS, e
  travado por um gate novo (`validate_servicos_diagrama.py`) e por um teste que
  renderiza os diagramas **a partir dos seeds reais**.
- **O achado mais sério do dia: módulos que eram esboço.** Seis dos dez módulos
  de System Design tinham ~300 caracteres de conteúdo — o de feed social, inteiro,
  era "Fan-out on write vs read vs hybrid. Celebrity problem.". Todos os gates
  passavam: blocos válidos, quiz presente, seed existente, manifesto contando.
  Reescritos, mais outros 8 abaixo do piso. Gate novo `validate_substancia.py`,
  com o piso deliberadamente baixo (900 caracteres, contra mediana de 6.082) para
  só disparar no indefensável.
- **C-3, B-4 e C-2 entregues.** `CertificateDTO` expõe `score`; a11y foi de 3
  para 8 rotas (e achou um campo sem rótulo em `/progresso`); e a revalidação sob
  demanda substituiu a espera de até 1h do ISR.

---

---

## 🟢 Execução das 10 specs OpenSpec — 76 de 249 tarefas (07/ago/2026)

As specs foram escritas antes; esta é a execução. **Todos os 12 gates de conteúdo
passam e a suíte está em 1.065 testes.** O que ficou aberto está nomeado ao fim,
com o motivo.

### O que foi fechado

| # | Mudança | Feito |
|---|---|---|
| 3 | `contrato-adapter-primitive` | 17/22 — gate `validate_adapter_primitive.py` (23 primitives × 26 tipos), teste `cobertura-de-blocos.test.tsx` (148 casos, dirigido pelos seeds) |
| 5 | `lastmod-real-por-hash-de-conteudo` | 15/20 — migration 000045, `contentHash` normalizado, 9 testes Go, sitemap + 15ª checagem reescritos |
| 4 | `contraste-de-paleta-como-texto` | 17/22 — **308 → 21 nós**, 12 de 22 rotas em zero |
| 1 | `arquitetura-visual-profissional` | 9/43 — barra de qualidade no gate + 8 provas negativas; 16 diagramas e 3 rótulos corrigidos |
| 7 | `explicacao-rica-nos-simulados` | 6/15 — código morto apagado, gate escrito |
| 8 | `entrega-em-producao` | 5/21 — `smoke-imagem-frontend.sh` + job no CI |
| 9 | `conformidade-e-dados-pessoais` | 4/26 — gate de marcador de preenchimento |
| 2 | `serie-100-labs-arquitetura-aws` | 3/34 — `validate_labs_aws.py` + 4 provas negativas |

### Os defeitos que a execução encontrou

Nenhum destes estava previsto nas specs — apareceram porque os gates novos
mediram coisas que nada media antes.

1. **`annotated_formula.name` nunca chegava à tela** — 53 de 201 partes, em 12
   módulos. O primitive normalizava `text ?? label ?? name`, então quem escrevia
   símbolo E nome perdia o nome. É o quarto defeito da família, e o único em que a
   prop **estava declarada**: prova de que declarar não é renderizar, e de que os
   dois gates (estático e de pixel) não são redundantes.

2. **A causa raiz do contraste era a paleta, não o componente** — 287 dos 308 nós.
   Cinco variáveis do tema claro entre 4,17:1 e 4,45:1. E o fundo que importa é o
   **chip tingido da própria cor**, não o fundo da página: `/explorar` tinha 61 nós
   de azul sobre `color-mix(… 12%, transparent)`, mais claro que `--ffv-bg3`.

3. **Hex do tema escuro escrito à mão** — `SimuladoCard` fixava `#f78166`, 2,21:1
   em tema claro. Os 44 nós de `/simulados` saíam de uma linha.

4. **A checagem de slug do gate de labs nunca rodava** quando o seed faltava, por
   ordem de `return`. Descoberto pela própria prova negativa — que é para isso que
   ela existe.

5. **`parseExplanationString` era código morto que prometia migração** — medido:
   das 75 explicações, 75 são string v1 e **zero** tem os blocos `(a)(b)(c)` que a
   função exigia. Ela devolveria `null` para todas. Os `TODO_REVIEW` que geraria
   nunca chegaram ao aluno, porque nunca executou.

### ⛔ A varredura tem UMA checagem vermelha, e ela é o ponto

A 16ª checagem — *nenhuma página servida contém marcador de preenchimento* —
reprova em `/privacidade`, e **isso é o comportamento correto**. A página escreve:

```
A FFV Academy é operada por [PREENCHER: nome/razão social], inscrito sob
[PREENCHER: CPF/CNPJ], com contato em [PREENCHER: e-mail do encarregado].
```

Ela está no repositório e no sitemap, e vai ao ar junto com o resto no momento da
migração de domínio. O gate existe para que isso não aconteça sem alguém decidir.

**O que destrava:** preencher os três campos com o dado real do responsável legal
e passar a política por revisão jurídica. É ação do dono da conta — inventar nome
de controlador, documento ou e-mail de encarregado seria pior que a lacuna, porque
a lacuna é visível e o dado inventado não.

**Detalhe que quase passou:** a primeira versão do gate procurava `[PREENCHER]`
exato e passava VERDE sobre esta página, porque a forma real é
`[PREENCHER: nome/razão social]`. Só apareceu porque a checagem foi conferida
contra o HTML servido em vez de aceita por ter passado. Gate verde não é prova de
que ele mede o que se pensa.

### O que ficou aberto, e por quê

| Aberto | Tamanho | Motivo |
|---|---|---|
| **871 arestas sem rótulo · 218 nós sem nota** | 172 módulos | Redação, não varredura: rótulo específico exige entender o que trafega naquela aresta. Gate em modo relatório com a linha de base registrada, para a descida ser verificável |
| **L02–L100** | 99 laboratórios | O gate e o L01 existem; o corpo é escrita |
| **67 das 75 explicações de simulado** | — | Cada distrator precisa do NOME do erro de raciocínio de quem o escolheria |
| **Os 3 `[PREENCHER: …]` de `/privacidade`** | — | **Bloqueado por terceiro** — e é a ÚNICA checagem vermelha da varredura hoje, de propósito. Ver a seção abaixo |
| **Migração de DNS + TLS** | — | **Ação do dono da conta**: painel de DNS e SSH na VPS |
| **Endpoints de backend (mudança 6)** | 24 tarefas | Não iniciado |
| **Expansão de captação (mudança 10)** | 22 tarefas | Não iniciado |
| **Docker indisponível no ambiente** | — | `smoke-imagem-frontend.sh` está escrito e com a extração de CSS **corrigida contra o build servido** (o Next 16 emite `/_next/static/chunks/*.css`, não `/css/`), mas não foi executado contra uma imagem real |


## 🟢 Série nova: 100 laboratórios de arquitetura AWS — 1 escrito, 99 abertos (07/ago/2026)

Trilha `trail-labs-aws` em `/exemplos-arquitetura-aws`, mapa completo em
[`docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md`](./docs/aws/CATALOGO_100_LABS_ARQUITETURA_AWS.md),
padrão de autoria em
[`.claude/skills/lab-arquitetura-aws.md`](./.claude/skills/lab-arquitetura-aws.md).

**Por que ela não duplica a trilha das 100 arquiteturas.** São dois eixos, e os
namespaces são separados de propósito: `S01`–`S100` são **soluções de IA** (todas
com IA no centro, um parágrafo e um diagrama de 5 passos cada, seeds **gerados** do
catálogo); `L01`–`L100` são **laboratórios reproduzíveis** que começam no básico e
só chegam à IA na banda 9. Renumerar `S` para acomodar `L` quebraria os 100
diagramas, porque `gerar_arquiteturas_100.py` falha quando a cadeia muda por baixo
do desenho. Quando um laboratório da banda 9 ou 10 implementa uma solução, a linha
do catálogo **cita** o `S` em vez de reescrevê-lo.

**Escrito:** `L01` — aplicação .NET 8 em ECS Fargate com RDS em sub-rede privada e
front na borda, Terraform inteiro, 105 blocos, 2 `arch_diagram` percorríveis (5 e 6
passos), 13 tabelas, 9 blocos de código, 7 perguntas frequentes e 3 quizzes.

**Aberto:** 99 laboratórios, em 10 bandas. A tabela **Estado de execução** do
catálogo é o que separa o planejado do construído — e a trilha declara só o que tem
seed, porque slug sem seed é 404 anunciado no sitemap.

**Duas incompatibilidades do formato, medidas antes de escrever:**

1. **Mermaid não renderiza nesta plataforma** (`grep -ri mermaid frontend/src` volta
   vazio). O bloco de diagrama é `arch_diagram`, e ele é percorrível — o leitor
   clica no passo e só aquele caminho acende. Mermaid entra só em documento de
   planejamento, que é lido no GitHub.
2. **Exercício em prosa não fecha o laço de gamificação.** `addCardsFromQuiz` é a
   única fonte de cartas de SRS; "12 dúvidas realistas" e "exercícios" não geram
   carta nenhuma, e `validate_cobertura_quiz.py --strict` reprova. Viraram
   `Perguntas frequentes` (contrato de resposta citável) e `Fixando` (3 `quiz`).

**Um erro na documentação da casa, corrigido:** `.claude/skills/arquitetura-ia-aws.md`
listava `kind: "edge"` como valor válido de grupo. Ele não existe no `z.enum` do
schema, nem na tupla do `validate_bedrock_blocks.py`, nem no `AwsDiagram.tsx`.
O gate reprova em voz alta — então custa uma execução, mas custa a quem seguiu a
documentação. Serviço de borda vai em `plain`.

---

## 🔴 39 páginas de trilha abriam com o MESMO parágrafo — achado RODANDO o site (06/ago/2026)

Nenhuma auditoria de `<head>`, nenhum gate e nenhum teste pegou este. Ele apareceu
quando abri o navegador e li a página: a trilha "100 Arquiteturas de IA na AWS"
começava com *"Para quem já sabe o básico e quer ir fundo. Aqui o assunto é como os
modelos funcionam em produção: memória, roteamento, ferramentas, agentes."*

`TrailBlogClient` tinha **dois parágrafos escritos no código** e escolhia entre eles
com `trail.id === 'trail1'`. As outras **39 trilhas** caíam no `else` e mostravam
todas o mesmo texto — que não descreve nenhuma delas, e menos ainda as
certificações AWS, o Postgres Internals ou o Go.

**Dois danos ao mesmo tempo:**

1. o leitor lia uma promessa que a trilha não cumpria;
2. 39 páginas de **prioridade 0,9 no sitemap** compartilhavam o primeiro parágrafo
   de texto visível — conteúdo duplicado justamente nas páginas que mais importam.

**O detalhe que mais incomoda:** o mesmo componente JÁ usava `trail.desc` para a
descrição do `Course` em JSON-LD. O rastreador recebia o texto certo e específico;
só o humano recebia o genérico. Havia dado bom (mediana de 226 caracteres, escrito
por trilha) sendo ignorado na tela.

Consertado lendo `trail.desc`. As duas `desc` curtas que motivavam o caso especial
— `trail1` (53 caracteres) e `trail5` (66) — foram escritas por extenso, então o
componente ficou uniforme e o texto voltou para o dado.

### Travado por `trilha-texto-proprio.test.ts` (5 checagens, prova negativa feita)

Toda trilha tem `desc` com 70+ caracteres; nenhuma `desc` repetida; o componente
renderiza `{trail.desc}`; nenhum componente de trilha ou hub embute prosa de
leitura; e o parágrafo de abertura não é escolhido por id.

**Duas vezes o gate era meu erro, não o do código:** o regex `/'[^']{120,}'/`
atravessava quebras de linha e pareava o apóstrofo de um literal com o de outro
dezenas de linhas depois — acusou 18 "prosas" inexistentes. Passou a casar por
linha, exigindo 8+ espaços e pontuação de frase. E a primeira versão proibia
QUALQUER `trail.id === '…'`, o que reprovava dois links legítimos.

### Declarado e não mudado

Só **2 das 40** trilhas têm link "Ver também" no rodapé (`trail1` e `trail2`). É
assimetria de navegação, não conteúdo errado — o que aparece está correto.
Generalizar exigiria importar o currículo dentro de `TrailBlogClient`, que é
`'use client'`; é exatamente o que a plataforma evita (as descrições de SEO saíram
do currículo por esse motivo, 38 KB que todo visitante baixava sem ler). Fazer
direito pede computar o irmão no servidor e passar por prop — 40 arquivos. Fica
registrado em vez de meio feito.

---

## 🔴 Auditoria de SEO técnico no HTML servido — 16 defeitos (06/ago/2026)

Medi o que o **servidor entrega**, não o que o código promete: subi o build de
produção e auditei 100 rotas e as 521 URLs do sitemap. Os 16 achados vinham quase
todos da **herança de metadados**, que só existe depois de o Next resolver a
árvore de segmentos — invisível para teste de componente e para leitura de código.

### 1. 58 páginas se anunciavam como a página inicial

O layout raiz declarava `title` e `url` dentro de `openGraph`. Toda página que não
declara o próprio bloco herda o da raiz **inteiro** — então 58 rotas emitiam
`og:url` da home e `twitter:title` genérico do site. Compartilhar qualquer uma
produzia o mesmo cartão, apontando para o mesmo lugar.

Consertado em **um arquivo**: a raiz passou a herdar só o que é verdade para toda
página (`siteName`, `locale`, `images`, `card`). Sem `title` na raiz, o Next cai no
título da própria página — verificado no HTML servido: `/ranking` saiu de
`FFV Academy — Escola de Engenharia…` para `Ranking — FFV Academy`. A home ganhou
o cartão dela em `app/page.tsx`.

### 2. 11 páginas sem `og:image` — pela razão oposta

`openGraph` de uma página **substitui** o da raiz, não mescla campo a campo. Então
`openGraph: { title, description, type, url }` — que parece inofensivo — apaga o
`images` herdado. `/aprenda/<slug>` já havia sido consertada à mão em 05/ago; o
conserto à mão não impediu as outras onze (`/temas`, `/temas/<tema>`, `/news`,
`/perguntas`, `/simulados`, `/certificacoes`, `/cheatsheet`, as duas landings).

Remédio: o helper `social()` em `src/lib/metadata-social.ts` — quem chama não
esquece o campo porque não escreve o campo. Aplicado em **59 rotas**, que agora
têm as quatro propriedades básicas do Open Graph e o par `twitter` completo.

### 3. 12 títulos com a marca duplicada

`title.template = '%s — FFV Academy'` no layout raiz + `title: 'X — FFV Academy'`
na página = `<title>X — FFV Academy — FFV Academy</title>`. Estava nos 6 hubs, em
`/explorar`, `/news`, `/temas`, `/verificar` e nas páginas de simulado.

`openGraph.title` é o caso oposto — **não** passa pelo template, então ali o
sufixo é necessário. O gate distingue os dois.

**A home é exceção legítima:** `app/page.tsx` está no mesmo segmento que
`app/layout.tsx`, e template só desce para segmento filho. Medido: a home emite a
marca uma vez. A primeira versão do meu gate acusava a home — era falso positivo
meu.

### 4. `/cheatsheets/<slug>`: título idêntico em todas, e sem canônica

Quando o build não alcança o backend — CI sem `NEXT_PUBLIC_API_BASE_URL` —,
`generateMetadata` retornava `{ title: 'Cheatsheet' }` e nada mais. Medido:
`/cheatsheets/postgres` e `/cheatsheets/git` com o **mesmo** `<title>`, sem
`description` e **sem canônica**. Título repetido em páginas diferentes é sinal de
conteúdo duplicado; canônica ausente deixa a escolha da URL para o buscador.

Agora o fallback deriva o título do slug e declara a canônica de qualquer jeito.
Este era invisível localmente **e** no HTML servido local, porque o caminho de
fallback vencia nos dois — quem achou foi o gate de código.

### 5. `lastmod` uniforme em 520 URLs

Todas traziam o instante do build. O Google usa `lastmod` **só se for
consistentemente exato**; diante de valor que não confere, passa a ignorar o campo
— inclusive nas páginas que de fato mudaram. O campo falso não era neutro: custava
o sinal.

Procurei data real e **não existe** nesta plataforma: os seeds têm só
`slug`/`title`/`blocks`; `mtime` é a hora do checkout; `git log` não serve porque o
checkout do CI é raso; e `curriculum_articles.updated_at` é bumpado
INCONDICIONALMENTE pelo importador (`DO UPDATE SET updated_at = now()`, mais delete
e reinsert de todos os blocos a cada execução). O timestamp do banco é tão falso
quanto a data de build.

Sem data real, **ausência é a resposta honesta** — o campo saiu.

> **Pendência derivada (backend):** para `lastmod` voltar de verdade, o importador
> precisa guardar um hash do conteúdo por artigo e só tocar `updated_at` quando o
> hash mudar. Aí o campo passa a significar "mudou". Exige coluna nova e migração;
> não foi meio feito.

### 6. Seis rotas indexáveis fora do sitemap — resolvidas por princípio, não caso a caso

`/certificacoes`, `/devcard`, `/plano`, `/times` e
`/simulados/cloud-practitioner/estudo` respondiam 200, eram indexáveis e não
estavam no sitemap. Apliquei o princípio que o repo já tinha para `/progresso` e
`/perfil` — *conteúdo do usuário não é página do site* — e as cinco passaram a
declarar `noindex`: as quatro primeiras mostram dado do visitante (rastreador
anônimo vê o estado vazio) e a última é envolvida em `RequireAuth`, e indexar
parede de login entrega resultado inútil.

A sexta, `/cheatsheet`, é lead magnet com conteúdo do site: **entrou no sitemap**.
Estava fora por esquecimento, não por decisão.

### 7. Sitemap e canônica discordavam sobre a raiz

O sitemap dizia `https://fernandofrancovalle.com/` e a canônica
`https://fernandofrancovalle.com`. Normalizam para a mesma URL, então não havia
dano — mas duas formas para a mesma página é achado de auditor externo.

Tentei alinhar pela barra e **o Next removeu a barra**: escrevi
`alternates.canonical: '…com/'` e o HTML servido trouxe `…com`. Quem cedeu foi o
sitemap, porque a forma que o framework emite é a que o buscador vê.

### O que a auditoria mediu e estava correto

- **canônica**: presente em 100% das rotas indexáveis e igual à URL do sitemap;
  ausente só nas 14 rotas com `noindex` por header (`/admin/*` e
  `/revisar/maratona`) — o que é certo;
- **dados estruturados**: 0 inválidos em 77 rotas. `EducationalOrganization`,
  `Person`, `WebSite`, `Course` (40), `BreadcrumbList` (8), `CollectionPage` (5),
  `ItemList` (7), `Article` (4), `Quiz` (4) — todos com os campos que o Google
  exige, `headline` dentro de 110 caracteres, migalha em ordem;
- **`robots.txt`**: declara o sitemap, e nenhuma URL do sitemap cai em `Disallow`;
- **estrutura**: `lang="pt-BR"`, charset, viewport e exatamente um `<h1>` em toda
  rota indexável; nenhuma `<img>` sem `alt`;
- **duplicação de URL**: `/aprenda/x/` responde 308 e maiúscula responde 404;
- **`meta description`**: presente em 100% das rotas.

### Travado por gate

- **`metadados-sociais.test.ts`** (4 checagens, prova negativa feita): nenhuma
  página declara `openGraph` sem `images`; nenhuma escreve o sufixo da marca no
  `title` de nível superior; o helper entrega o par completo; a base do site tem
  uma definição só (`BASE` é apelido de `BASE_URL`, não segunda fonte).
- **14ª checagem da varredura**: em TODA URL do sitemap — canônica presente e igual
  à URL anunciada, as quatro propriedades básicas do Open Graph, `twitter` próprio
  e não genérico, título sem marca duplicada, e nenhuma URL do sitemap com
  `noindex`. Prova negativa: tirei o `social()` de `/ranking` e ela reprovou.
- **15ª checagem**: `lastmod` ou distingue páginas, ou não existe. Prova negativa:
  reintroduzi data uniforme e reprovou.

---

## 🔴 O pivot ia levar 49 URLs vivas para 404 no dia do deploy (06/ago/2026)

O achado mais consequente desta rodada, e ele não estava em nenhum gate.

O pivot apagou **55 páginas** — 50 trilhas e hubs, mais `/revisao`, `/search` e
`/search-trilha`. O `next.config.ts` tinha **6 redirects**. As outras **49 URLs
são servidas em produção hoje**, e o sitemap de `main` as publica, porque ele
deriva de `trail.href` e `hub.href`. Nada no projeto reclamava: `next build` não
sabe que uma URL existia ontem, e a varredura só visita rota que existe hoje.

**Dois dos 6 redirects existentes também apontavam para o lugar errado:**

| rota | ia para | agora vai para | por quê |
|---|---|---|---|
| `/python-profundo` | `/claude-anthropic` | `/python-engenheiros` | a trilha de Python **existe**; mandar para Claude era perder o leitor |
| `/como-computador-funciona` | `/fundamentos` (hub) | `/fundamentos-tecnicos` | a trilha abre com "Como o computador roda seu código" — é o sucessor literal |

### Três disposições, porque 404 é resposta legítima

A tentação é redirecionar as 49 para algum hub e declarar "zero 404". Isso é
pior: redirect para página que não fala do assunto é o que o Google classifica
como **soft 404**, e entrega ao leitor uma página que não responde o que ele
buscou. Então `src/lib/rotas-retiradas.ts` classifica por ASSUNTO:

- **`sucessor` (16)** — existe página viva sobre o mesmo assunto. Ex.:
  `/search-trilha` → `/search-ir-deep` (é a mesma trilha, renomeada),
  `/chaos-engineering` → `/observabilidade-sre`, `/kafka-streaming` →
  `/data-engineering`.
- **`hub` (18)** — sem sucessor direto, mas o hub é o pai temático honesto. Ex.:
  as seis rotas de linguagem (`/rust-profissional`, `/java-moderno`…) →
  `/programacao`, que hospeda Python, TypeScript e Go.
- **`removido` (21)** — assunto cortado de propósito, sem destino honesto:
  frontend, mobile nativo, Web3, marketing, inglês, hardware hacking. Aqui 404 é
  o sinal correto — o Google desindexa, sem penalidade e sem enganar ninguém.

Resultado: **34 redirects**, verificados no `routes-manifest.json` do build.

### O gate, e o que ele não faz

`rotas-retiradas.test.ts`, 10 checagens. As três que pegam defeito invisível:

1. **destino que não existe** — `destination` é string livre e o build não a
   valida; um 301 para `/python-engenhieros` é 404 com um salto extra;
2. **`source` sombreando página viva** — redirect roda ANTES do roteamento, então
   recriar `/ds-algoritmos/page.tsx` sem tirar do inventário faz a página nova
   nunca renderizar, e o sintoma é "minha página não aparece", sem erro;
3. **cadeia de 301** — fácil de criar sem perceber, porque as 55 origens e os
   destinos moram na mesma tabela.

Prova negativa feita: typo no destino e cadeia artificial reprovam; restaurado
volta ao verde.

**Limite declarado:** o inventário é fonte DECLARADA, não derivada. O gate não
descobre sozinho uma 56ª rota apagada, porque comparar com `main` exige histórico
e o checkout do CI é raso (`fetch-depth` padrão = 1). Quem apagar rota precisa
declarar; o que o gate garante é que o declarado está correto e não encolhe.

**Nota sobre o código HTTP:** `permanent: true` no Next emite **308**, não 301. O
Google trata os dois como permanente equivalente, então mantive o idioma do
framework em vez de trocar 6 redirects que já funcionavam.

---

## 🟡 297 descrições de SEO eram lista de palavra-chave (06/ago/2026)

O gate existente exigia **≥40 caracteres**. Por isso passava
`Image segmentation U-Net SAM Meta — PT-BR.` — 42 caracteres, sem verbo, sem
dizer o que o leitor aprende. Medido em 06/ago: mediana **89**, mínimo **42**,
enquanto o Google mostra cerca de 155. E 11 descrições tinham **204 a 239** e
eram truncadas todas — essas eram minhas, do trabalho das 100 arquiteturas.

O padrão de novo: **o gate media validade, não substância.**

### O que foi feito

- **297 descrições reescritas** em frase real, dizendo o que o módulo ensina.
- **70 selos "— guia PT-BR." removidos** de descrições que já eram prosa boa: o
  selo gasta o fim do snippet — a parte que o Google mostra por último — num
  token que ninguém busca. `em PT-BR` no MEIO da frase ficou: ali sinaliza idioma
  numa página de resultado misturada e lê como português de verdade.
- Resultado: **426 entre 74 e 165 caracteres**, mediana **124**.

### O gate subiu de piso para contrato

Três checagens em `seo-descriptions.test.ts`, no lugar do `≥40`:

1. **faixa 70–165** — abaixo de 70 desperdiça a linha que ganha o clique, acima
   de 165 o Google corta no meio da frase;
2. **sem selo de idioma no fim** — bloqueia a assinatura do gerador antigo;
3. **é frase, não enumeração** — proxy estrutural escolhido depois de medir:
   salada em Title Case quase não tem palavra funcional minúscula, frase em
   português tem várias. O limiar de duas separa os dois grupos no corpus real
   sem falso positivo. Foi ele que revelou **105 descrições** que estavam na
   faixa de tamanho mas ainda eram enumeração — reescritas também.

### Medido e deliberadamente NÃO consertado: os títulos

**237 dos 426 títulos passam de 60 caracteres** com o sufixo
` — FFV Academy` (mediana 62, máximo 100). Não mexi, e a razão é a decisão, não
a preguiça: esses títulos carregam significado pedagógico
("Observability: os 3 pilares (logs, métricas, traces) e por que não basta" — o
que se cortaria?), e o Google trunca o **display** sem penalizar ranking,
costumando descartar justamente o sufixo da marca. Mutilar 237 títulos para caber
numa régua de exibição seria dano, não conserto.

A única alavanca disponível, se algum dia se quiser: encurtar o sufixo de
` — FFV Academy` (14 caracteres) para ` — FFV` (6), no template do layout raiz.
Custa reconhecimento de marca no resultado de busca; é escolha de produto.

### Verificado e limpo

Zero títulos duplicados, zero descrições duplicadas, zero slugs duplicados entre
os 426 módulos — nenhum sinal de conteúdo duplicado para o buscador.

---

## 🟢 Validação de links e coerência de rota (06/ago/2026)

Duas varreduras novas, ambas sem achado — o que também é resultado:

- **Links internos**: todos os `href` do código e dos seeds (incluindo link
  markdown em prosa) contra as 93 rotas estáticas e os 426 slugs de seed.
  **Zero destinos quebrados.** Nenhum link sobrou apontando para as 55 rotas
  apagadas.
- **Coerência currículo ↔ rota ↔ sitemap**: toda trilha com `href` tem
  `page.tsx` naquela rota, todo hub tem página, e nenhuma página renderiza id
  inexistente. **Zero problemas.** Importa porque o sitemap publica
  `trail.href`: divergência ali seria o site anunciando 404 ao Google.

Dívida latente registrada: **29 páginas** fazem `CURRICULUM.find(t => t.id ===
'…')!` com non-null assertion. Todas resolvem hoje, mas o `!` transforma remoção
de trilha em crash sem erro de tipo — foi assim que as páginas apagadas no pivot
quebraram. A checagem reversa (todo `href` tem página) cobre o caso que importa.

---

## 🟡 Primeira auditoria de acessibilidade (06/ago/2026)

Nunca havia sido medida. Rodei axe-core em 20 rotas — uma por classe de página —
contra o build de produção.

### Três violações SÉRIAS em toda página, porque moravam em componente compartilhado

| Violação | Onde | Por que importa |
|---|---|---|
| `aria-progressbar-name` | barra de XP do GameHUD | barra de progresso sem nome é anunciada como "barra de progresso" e nada mais |
| `nested-interactive` | `TooltipTrigger` (um `<button>`) envolvendo um `<a>` | leitor de tela anuncia um e some com o outro; foco de teclado fica ambíguo |
| `scrollable-region-focusable` | contêiner de rolagem do `arch_diagram`, **10 por página** nos módulos de arquitetura | o diagrama é mais largo que a coluna e rola na horizontal; sem `tabIndex`, quem usa teclado não alcança o que está à direita |

**As três corrigidas e zeradas nas 20 rotas.** A terceira era defeito meu, dos
módulos novos: `role="region"` + rótulo + `tabIndex` + anel de foco visível.

### O conserto de acessibilidade introduziu uma regressão PIOR — achada medindo

A primeira versão de `.ffv-acento-texto` escurecia por padrão e restaurava a cor
viva em `:root[data-theme="dark"]`. Parece simétrico e não é: neste projeto o tema
**escuro é o PADRÃO** (`:root, :root[data-theme="dark"]`), e `data-theme` só existe
depois do script de tema — que precisa de JavaScript.

Medido com JS desligado: `data-theme` nulo, fundo `#0d1117`, acento escurecido para
`#325F91`. **Contraste caiu de 7,49:1 para 2,87:1.** Eu tinha trocado um defeito de
tema claro por um pior no tema padrão — e para quem tem JS bloqueado por extensão
ou CSP, seria o estado permanente.

**Invertido:** o valor que serve ao escuro é o padrão; o escurecimento é opt-in por
`[data-theme="light"]`. Regra de tema tem de falhar em SEGURANÇA quando o atributo
falta.

Travado por `tema-falha-em-seguranca.test.ts`, com prova negativa (reintroduzi a
inversão: as 4 checagens acusaram). Ele também varre `globals.css` procurando a
assinatura generalizada do defeito — `[data-theme="dark"] X` desfazendo uma
propriedade que o padrão já define — e exige que todo uso de `.ffv-acento-texto`
declare `--ffv-acento`, porque o fallback `currentColor` escureceria texto normal
em silêncio.

**Terceira vez nesta sessão que um gate meu casou com a documentação em vez do
código:** o comentário do utilitário contém o exemplo `style={{ '--ffv-acento': cor }}`,
e essas chaves quebraram meu parser de CSS. Tirar comentário antes de casar já é
padrão nesta base — e eu esqueci de novo.

### A dívida grande: as paletas são da linhagem dark

`color-contrast` restou em **479 nós**. A causa é sistêmica e foi calculada, não
estimada: as cores de trilha, hub, tema e nível vêm da paleta GitHub **dark**
(`#58a6ff`, `#d2a8ff`, `#ffa657`…). Como TEXTO sobre fundo claro, **41 das 43
falham WCAG AA**, entre **1,57:1 e 4,35:1** — o mínimo é 4,5:1. A pior é amarelo
claro sobre branco, praticamente ilegível.

O mecanismo do conserto existe e preserva a identidade em vez de trocar a paleta:
`.ffv-acento-texto` em `globals.css` mistura a cor com preto em tema claro e a
mantém intacta em tema escuro. **O fator 57% é calculado**: é o menor que leva
todas as 43 cores a 4,5:1 contra `#ffffff` e contra `#f6f8fa`.

Aplicado onde mais repetia (nível no GameHUD, rótulo de trilha em `/explorar`, que
caiu de 102 para 61 nós).

#### Continuação em 07/ago/2026: 479 → 308

O utilitário estava em **dois** lugares, e a paleta continuava entrando como
`style={{ color: cor }}` nos três componentes que mais repetem cor de trilha e de
hub. Aplicado em `HubPageClient` (rótulo `TRILHA nn` e `Abrir`), `TrailBlogClient`
(nome, rótulo `Blog`, contagem de artigos, XP total, progresso, `+XP` por módulo,
seta de hover) e `MapaClient` (nome de hub, nome de trilha, percentual):

| Rota | Antes | Depois |
|---|---|---|
| `/mapa` | 82 | **2** |
| `/aws-bedrock` | 39 | **3** |
| `/ia` | 31 | **1** |
| `/arquiteturas-ia-aws` | 17 | **3** |
| `/aws` | 11 | **1** |
| `/aprenda/bedrock-knowledge-bases-rag` | 8 | **5** |

`/mapa` era a maior dívida da plataforma porque é a única página que desenha os 7
hubs **e** as 41 trilhas juntos: 82 nós de texto colorido numa tela.

**Duas armadilhas medidas, que valem mais que os números:**

1. **Meça sobre o build.** A primeira tentativa mediu no `next dev`, comparou com
   tetos medidos no build e concluiu que sete rotas haviam regredido — nenhuma
   havia. Zere os tetos e leia a contagem real na mensagem de falha da varredura.
2. **O gate `tema-falha-em-seguranca` conta menção em comentário como uso.** Ele
   procura `--ffv-acento` numa janela de 400 caracteres após cada ocorrência da
   classe; um comentário de cinco linhas explicando o utilitário empurra a variável
   para fora da janela e reprova código correto. Comentário curto, ou não escreva o
   nome da classe nele.

**O que sobra, nomeado:** `/glossario` (68), `/explorar` (61), `/simulados` (45),
`/perguntas` (34) e `/temas` (24) concentram a maior parte. Nas rotas de módulo o
padrão restante é outro — não é cor de trilha, é **variável de paleta usada como
texto**: rótulo de passo de `flow_diagram` em `--ffv-blue` a 4,25:1 (falta 0,25) e
botão de TOC a 4,17:1. Corrigir isso mexe nos dois temas e é decisão de paleta, não
de aplicação de utilitário.

### 🔴 A desvantagem da caixa de decisão nunca chegou à tela — 82 de 391 alternativas

Achado em 07/ago/2026 **lendo o HTML servido** ao validar o laboratório L01:

```html
<span class="font-semibold">EC2 com Auto Scaling</span> — </p>
```

O travessão pendurado, e nada depois. `DecisionBox` existe para mostrar **o que se
perde** em cada alternativa, e era exatamente essa parte que não aparecia.

**A causa foi um conserto feito só metade do caminho.** O adapter em
`BlockRenderer.tsx` normaliza a desvantagem para a prop `downside` — o comentário
dele registra que 286 de 355 alternativas saíam sem ela. Mas o primitive nunca
declarou `downside` e lia `note ?? when`. Medido: **82 de 391 alternativas, em 120
módulos**, renderizavam vazio; 78 delas anteriores ao L01.

**Por que nenhum gate pegou.** `validate_primitives_render.py` compara seed contra
**adapter**, e este salto é adapter → **primitive**. `primitives-cms-contract.test.tsx`
cobria `MatrixDiagram` e `NodeGraph` — os dois casos que derrubavam a *página*.
Este não derrubava nada: só emudecia o conteúdo. É a regra 4b do `PADRAO_ENSINO.md`
um nível acima do que ela descreve — **o adapter também tem de casar com o
primitive**, e isso não tinha cobertura.

Corrigido no primitive, com 3 testes e prova negativa. Segundo achado no mesmo
lugar: as **72** alternativas que legitimamente não têm desvantagem escrita
renderizavam `Nome — ` com o separador pendurado — pontuação que promete texto
ausente, o mesmo sinal que `validate_texto_sem_lacuna.py` procura na prosa dos
seeds, produzido aqui pelo componente. O travessão agora só entra se houver texto.

**Dívida que fica nomeada:** nada compara prop de adapter com prop declarada de
primitive. Foram três defeitos dessa família até agora (`matrix_diagram`,
`node_graph`, `decision_box`), todos achados por acidente.

### Rolagem horizontal sem foco de teclado — a correção que não foi generalizada

`overflow-x-auto` sem `tabIndex` deixa o conteúdo à direita **inalcançável por
teclado**. O `arch_diagram` recebeu `tabIndex` em ago/2026; `code_block` e
`ComparisonTable` não, e o axe só acusa onde o elemento **de fato rola** — nas 20
rotas auditadas o conteúdo caberia em 1280 px, então o defeito era invisível para a
checagem. Ele apareceu no primeiro módulo com Terraform de linha longa: **7
violações estruturais numa página só.**

Corrigido nos dois adapters. Alcance medido: **136 dos 427 módulos** têm ao menos um
`code_block` com linha acima de 88 caracteres, de **1.089** blocos de código na
base — a maioria nunca foi exercida pela auditoria.

`role="group"` e não `role="region"`: `region` é landmark, e nove blocos de código
numa página produziriam nove landmarks de ruído no leitor de tela.

E um achado adjacente: `DecisionBox` pintava o rótulo `Alt:` com `--ffv-border`,
**1,34:1** — rótulo que carrega significado e que praticamente não se lia. O `<p>`
pai já era `--ffv-muted`; o span existia só para apagar mais. **Cor de borda não é
cor de texto.**

### Por que o gate tem teto em vez de zero

**13ª checagem da varredura:** violação estrutural é reprovação imediata; contraste
tem **teto por rota**, medido hoje. Exigir zero agora reprovaria o CI sem ninguém
poder consertar no mesmo commit — e a saída real seria desligar a checagem. Teto
transforma a dívida em número que só pode DESCER: baixá-lo é o trabalho, subi-lo
exige explicar por quê.

### O que a auditoria mediu e estava limpo

- **0 links internos quebrados** no conteúdo dos 426 seeds.
- **0 títulos duplicados** e **0 descrições de SEO duplicadas** em 426 módulos.
- Backend: `go build` e `go vet` limpos, 247 pacotes de unit ok, contract ok.

### Achados menores, medidos e não consertados

- **77 descrições abaixo de 70 caracteres** (mediana 89; Google mostra ~155). Não
  é defeito, é espaço de snippet não usado — trabalho de conteúdo.
- **11 descrições acima de 165 caracteres**, que o buscador corta.
- **48 títulos acima de 60 caracteres**; com o sufixo `— FFV Academy` (+14) passam
  do que o resultado de busca exibe.

## 🔴 Auditoria do `<head>` servido (05/ago/2026)

Ler o HTML que o servidor entrega — não o componente, não o `generateMetadata` —
achou quatro defeitos nas 426 páginas de módulo, que é a rota de maior tráfego.

### 1. `og:image` AUSENTE em todas as 426 páginas

Havia só `twitter:image`, herdado do layout raiz. **`twitter:image` serve ao X e a
mais nada:** Facebook, LinkedIn, WhatsApp, Slack, Telegram e Discord leem
`og:image`. Todo link de módulo compartilhado em qualquer um deles ia sem imagem.

A causa é sutil e vale registrar: `generateMetadata` da rota declarava o objeto
`openGraph` **sem** `images`, e nesse caso a imagem da convenção do segmento raiz
não é propagada para `og:image`. Nada quebra, nada avisa.

> **Correção de uma afirmação minha:** eu disse antes que as 426 páginas
> apontavam `og:image` para um arquivo inexistente. Errado — o caminho quebrado
> (`/og/<slug>.png`) estava em `src/lib/metadata.ts`, que **não era importado por
> ninguém**. O defeito real era ausência, não 404. Medir o `<head>` desfez a
> minha hipótese.

**Conserto:** `src/app/aprenda/[slug]/opengraph-image.tsx` — imagem por módulo
gerada sob demanda, com título, trilha, cor da trilha, XP e tempo de leitura.
Pré-gerada no build pelos slugs conhecidos. Serve 200 `image/png`, ~97 KB.

Por que dinâmico e não 426 PNGs: `scripts/generate-og-images.mjs` escrevia em
`out/og/`, diretório do export estático que deixou de existir quando o deploy
virou `output: "standalone"`. **Duas peças mortas apontando uma para a outra** —
as duas removidas.

**Um achado do próprio conserto:** a primeira versão punha o emoji do módulo no
cartão, e o build mostrou `Failed to download dynamic font. Status: 400`.
`ImageResponse` não tem fonte de emoji: ele **baixa fonte de serviço externo** por
glifo desconhecido. Em produção seria requisição externa por imagem, num app cuja
CSP bloqueia host externo por allowlist. O emoji saiu; a identidade da trilha
virou barra de cor, que não custa fonte.

### 2. `twitter:title` e `twitter:description` eram os do site, não do módulo

Compartilhar QUALQUER módulo no X anunciava "FFV Academy — Escola de Engenharia
para a Era da IA". `twitter` não herda de `openGraph`: precisa ser declarado.

### 3. A imagem social do site anunciava um catálogo que não existe

O `og:image` da raiz — a imagem de TODO link compartilhado — dizia **"17 trilhas"**
e **"570+ módulos"**. O real: **40 e 426**. Errado nas duas direções, porque o
catálogo cresceu em trilhas e encolheu em módulos no pivô de julho.

Mais três afirmações defasadas encontradas na varredura: `/explorar` prometia
"600+ artigos" (com 426 — overclaim), a página do Bedrock dizia "28 módulos" e a
descrição da trilha dizia "31" (são 32).

**Travado por `numeros-publicos.test.ts`**, que varre `src/app`, `src/components` e
`curriculum/trails/` comparando toda contagem anunciada com o CURRICULUM.

Três decisões de desenho que o teste precisou aprender, cada uma por ter errado
primeiro:

1. **Remover comentário antes de casar.** A primeira execução acusou os dois
   arquivos que eu tinha acabado de consertar — por causa dos meus comentários,
   que citam os números antigos. Gate que acusa a documentação do conserto ensina
   a apagar a documentação.
2. **"Top 10 trilhas" é ranking, não contagem.** Excluído por prefixo
   linguístico, não por exceção de arquivo: a regra vale para painel futuro.
3. **Contagem por trilha não é contagem global.** "32 módulos" na página do
   Bedrock está certo com 426 no acervo. Comparar contra o total acusava o número
   correto — arquivo que fala de uma trilha sai do escopo global e é cobrado por
   um teste dedicado, contra `t.modules.length`.

### 4. Travado no HTML servido, não no componente

**12ª checagem da varredura:** amostra de módulos onde se confere que `og:image`
existe, que a URL contém o slug (não é o cartão genérico), que responde 200 com
`content-type` de imagem, e que `twitter:title` não é o do layout raiz.

### O que NÃO foi consertado, e por que

**`lastmod` do sitemap continua sendo a data do build para todas as URLs.** É
sinal fraco — buscador aprende a ignorar `lastmod` quando tudo muda junto. Eu
NÃO consertei porque não há de onde tirar a data real: o `mtime` do seed é a hora
do checkout no CI e no Docker, igual para todos os arquivos, então derivar dele
troca um sinal fraco por um sinal falso. O conserto honesto exige campo de data
mantido no próprio seed — é trabalho de conteúdo, não de código, e está aqui como
pendência declarada em vez de melhoria de fachada.

**`satori` e `@resvg/resvg-js` ficaram em `devDependencies` sem uso** depois de o
script de OG sair. Remover mexe no lockfile e não dava para verificar a instalação
neste ambiente; fica como limpeza pendente.

## 🟢 As 100 arquiteturas desenhadas (05/ago/2026)

O catálogo de 100 soluções respondia **o que existe**. A coluna "Arquitetura" era
uma cadeia em texto (`A → B → C`), e cadeia em texto não mostra o que roda em
paralelo, o que é assíncrono, onde entra a revisão humana nem o que a camada de
governança envolve. Duas soluções com a mesma cadeia podem ser desenhos bem
diferentes.

### O que foi entregue

Trilha nova `trail-arq-ia-aws` — **100 Arquiteturas de IA na AWS**, 10 módulos
(um por família), **100 `arch_diagram`**, cada um com legenda que entrega a decisão
e 5 passos percorríveis. Mais 30 perguntas citáveis e 30 quizzes.

Os seeds são **gerados** por `scripts/seo/gerar_arquiteturas_100.py` a partir dos
arquivos `scripts/seo/arq100/familia_*.py`. O catálogo continua sendo a **fonte**
do problema, da cadeia, da decisão e da origem — nada é declarado duas vezes.

### A guarda de deriva

Cada solução declara `checagem`: trechos que têm de continuar na cadeia do
catálogo. Renomear serviço lá sem redesenhar aqui **falha na geração**, em vez de
produzir desenho que contradiz a tabela ao lado. Ela pegou um erro meu na primeira
execução: escrevi `similaridade` na checagem da solução 86, e esse termo está na
coluna "o que ensina", não na cadeia.

O DSL também valida, em tempo de geração, o que o Zod recusaria em silêncio:
`caption` acima de 600 caracteres, `note` acima de 200, `detail` acima de 500,
mais de 5 nós num grupo, menos de 5 passos, aresta de passo que não casa com aresta
declarada. Bloco que estoura limite não aparece como diagrama quebrado — aparece
como diagrama **ausente**.

### O defeito de precisão que isso revelou: 121 selos de VPC falsos

`kind: "vpc"` desenha borda roxa com o selo "VPC" e **afirma isolamento de rede**.
Eu usei como agrupamento visual: 104 grupos na trilha nova marcavam VPC contendo
só Bedrock, Knowledge Bases, S3, Glue, Athena ou DynamoDB — que são regionais e
não moram numa VPC. A base antiga tinha **17** com o mesmo defeito.

Isso ensina errado exatamente a distinção que as provas de certificação
concentram, e o leitor não tem como desconfiar: o desenho parece autoritativo.

**121 acusados, 118 corrigidos** (os outros 3 estão logo abaixo), e a regra virou
gate em `validate_servicos_diagrama.py`, com a lista de serviços elegíveis
(`EM_VPC`) compartilhada com o gerador — uma só lista, para não haver duas
divergindo.

**Uma ressalva registrada, porque errei aqui também:** a primeira execução do
conserto mudou três grupos CORRETOS na base antiga. Em `storage-s3-ebs-efs` o nó
`storage` representa EBS, que está numa subrede; em `rede-hibrida-saa`, `network`
representa o concentrador de trânsito. Chaves genéricas de categoria são ambíguas,
e gate que força mudança errada em caso ambíguo é pior que gate ausente — então
elas contam como elegíveis. Os três foram restaurados.

### Travado por teste

- `src/tests/integration/arquiteturas-100.test.ts` — 8 checagens: 100 diagramas
  (10 por módulo), toda solução do catálogo desenhada, validade pelo **schema Zod
  real** que o renderizador usa, legenda com no mínimo 80 caracteres, 5 a 6 passos
  com detalhe, nó e aresta de passo existentes, **nenhuma topologia repetida** e
  cadeia + origem declaradas por solução.
  Prova negativa feita: apaguei o número de um título e copiei a topologia de outro
  diagrama — as duas checagens acusaram.
- **11ª checagem da varredura** — `as 100 arquiteturas chegam à tela, dez por
  módulo`: conta `data-ffv-visual="ArchDiagram"` e a barra de passos no **HTML
  servido**. É a única prova de que o dado atravessou o importador, a API, o
  adapter e o renderizador. A checagem anterior exigia *ao menos um* apoio visual
  por módulo, o que não distingue dez diagramas de um.

### As duas lacunas que a pergunta "mostra as ligações e o uso de cada serviço?" revelou

Medindo em vez de afirmar: **93 dos 668 nós não tinham `note`** (63 deles serviço
AWS) e **320 das 685 arestas não tinham rótulo**. A `note` é onde mora "o que este
serviço decide AQUI"; o rótulo é a LIGAÇÃO — o que trafega. Sem os dois o diagrama
mostra a topologia e não explica o uso de cada peça: o nó vira um ícone com nome, e
a seta deixa o leitor supondo.

Zod aceita os dois como opcionais e o render desenha bonito sem eles — por isso
nenhum gate cobrava. **Os 413 foram escritos**, e agora o DSL RECUSA nó sem nota e
aresta sem rótulo, com o teste cobrando o mesmo sobre os seeds. Cobertura: 668/668
e 685/685.

### Um quarto sinal em `validate_texto_sem_lacuna.py`: o começo perdido

Varrendo os 426 seeds por respostas fora do contrato, apareceram **duas** que
começavam sem o começo:

    "ou use Data Lifecycle Manager com policy cross-region…"
    ". Fornece o host físico dedicado, permitindo reuso de licenças…"

A segunda perdeu o nome do serviço que ERA a resposta ("Dedicated Host"). Os três
sinais que já existiam não pegam: a lacuna está na BORDA, não no meio. As duas
foram reescritas e o sinal entrou no gate, com prova negativa.

**Restringir o sinal foi metade do trabalho.** A primeira versão olhava todo campo
de texto e acusou centenas de falsos positivos: em `paragraph.content` o texto é
fatiado para marcar negrito, então nó começando com ". " é normal ali. O sinal só
vale para campo que é o valor COMPLETO — `answer`, `question`, `explanation`,
`caption`, `detail`, `desc`.

### Verificação visual

Abri três diagramas no navegador e olhei: título, barra de passos, grupos com
ícone por categoria, notas, arestas rotuladas, legenda de categorias e caption.
Cliquei no passo 2 e conferi que ele acende os dois nós e as duas arestas certas e
atenua o resto. Os novos diagramas são mais estreitos que a média da base —
81 com 3 grupos e 19 com 4, contra 95 com 4, 66 com 5 e 12 com 6 na base antiga.

---

## 🔴 Achados da varredura com Playwright (05/ago/2026)

Escrevi `e2e/todas-as-rotas.spec.ts` — varredura de **88 rotas estáticas + 415 de
módulo** contra o build de produção servido. Ela encontrou três defeitos que
nenhum teste existente pegava, porque todos renderizam COMPONENTE e não PÁGINA.

### 1. As 415 páginas pré-renderizavam como "Módulo não encontrado" — corrigido

O fallback de seeds era liberado só quando `NODE_ENV === 'development'`. A
intenção estava certa: em produção o CMS é a fonte de verdade. O efeito colateral
não era visível: **`next build` roda em modo produção e não alcança o backend** —
a imagem é construída no runner do CI, longe da VPS.

Resultado medido: as 415 páginas de módulo saíam do build sem `<h1>`, sem
conteúdo e com o título "Módulo não encontrado". Como a rota tem revalidação de
1 hora, o **primeiro visitante de cada página após todo deploy** recebia essa
versão — e os rastreadores de busca também.

Corrigido distinguindo BUILD de RUNTIME: durante o build os seeds são usados (são
o mesmo conteúdo que o importer carrega no banco naquele deploy); em runtime de
produção o guarda permanece.

### 2. Duas políticas de segurança de conteúdo se intersectando — corrigido

Havia o header do `next.config.ts` **e** uma `<meta http-equiv>` no layout,
herdada da época do export estático. Políticas simultâneas não somam: o navegador
aplica a **interseção**. Duas consequências:

- a meta fixava `https://api.fernandofrancovalle.com` no código, então qualquer
  ambiente com outra URL de API tinha as chamadas **bloqueadas**, com erro só no
  console do navegador;
- `js.stripe.com` estava na meta e ausente no header. Interseção: ausente. **O
  script do checkout não carregaria em produção.**

A meta foi removida, o header completado, e `csp.test.ts` reescrito para verificar
o header e **falhar se a meta voltar**.

### 3. Seis páginas respondiam 200 sem nenhum `<h1>` no HTML — corrigido

`/progresso`, `/perfil`, `/devcard`, `/preferencias`, `/preferencias-aprendizado`
e o modo de estudo do CLF. Todas renderizavam o título só depois da hidratação:
rastreador e leitor de tela recebiam página sem cabeçalho. O título foi movido
para fora da condição de carregamento — o nome da página é verdade
independentemente de o estado ter carregado.

### O que a varredura garante, e o que não garante

Ela verifica, em todas as rotas: HTTP 200, `<h1>` com texto, volume mínimo de
conteúdo, ausência de mensagem de página não encontrada e — nas rotas de módulo —
presença de apoio visual. Mais uma amostra renderizada de verdade (erro de
console e exceção) e os links internos da home.

**Não** valida o empacotamento standalone: `next start` serve de `.next/`, e o
contêiner roda `node .next/standalone/server.js`. Arquivo estático faltando na
imagem passaria pela varredura e quebraria em produção. Isso pede um teste de
fumaça contra o contêiner, que não existe hoje — está registrado como pendência.

---

## 🔴 Auditoria de SEO e visibilidade em IA (05/ago/2026)

Pesquisei as práticas atuais antes de mexer, e a pesquisa mudou duas decisões.

### O que a pesquisa contradisse

**FAQPage não vale mais.** O resultado enriquecido de FAQ **deixou de ser exibido
no Google em maio de 2026**, e antes disso já era restrito a sites de governo e
saúde. Marcar FAQ seria trabalho para um recurso que não existe. Deixei um teste
que registra a decisão, para ninguém "corrigir" isso de boa-fé no ano que vem.

**Não existe schema para resumo de IA.** O Google é explícito: nenhuma marcação
especial, nenhum schema dedicado, nenhum arquivo. O que os resumos citam é
conteúdo em que **o cabeçalho É a pergunta e a resposta vem nas primeiras
frases** — mais dado próprio e número com fonte.

**`llms.txt` não é SEO.** A adoção medida em 2026 fica em torno de 10% dos
domínios, e nenhuma plataforma grande se comprometeu a ler o arquivo como entrada
de primeira classe. O que ele É: superfície legível por agente — e assistentes de
código o procuram antes de ingerir um site. Para uma escola cujo público é
desenvolvedor usando esses agentes, o custo é uma rota.

### Defeitos encontrados e corrigidos

**1. `ArticleJsonLd.tsx` existia e nunca era importado.** A página de módulo tinha
um JSON-LD embutido, mais pobre — sem autor e sem trilha de navegação. E a
`description` dele era gerada por máquina como `Aprenda X na trilha trail1 (hub
hub-ia)`, com os **identificadores internos**. O `generateMetadata` da mesma
página já havia sido corrigido para usar as descrições escritas à mão; o dado
estruturado, que é a declaração da página sobre si para o buscador, ficou atrás.

**2. As 415 páginas exibiam identificadores de banco no cabeçalho.** Logo acima do
título aparecia `hub-engenharia · trail10 · advanced` — o que o leitor via e o que
o Google indexava. Agora é `Engenharia de Produção para IA · Sistemas Distribuídos
· Avançado`, com link, e casa com a `BreadcrumbList` declarada.

**3. As 1.247 perguntas não eram declaradas em lugar nenhum.** Elas são visíveis na
página e cada uma vira carta de revisão espaçada — ou seja, são literalmente
flashcards. Agora vão como `Quiz` com `eduQuestionType: Flashcard`, que é a
exigência do carrossel de perguntas educacionais.

**4. A pergunta era parágrafo e o cabeçalho era rótulo.** O `<h3>` dizia "Quiz
rápido" e a pergunta era um `<p>`. Invertido: navegação por cabeçalho listava três
"Quiz rápido" idênticos, e o sinal que os resumos de IA procuram — cabeçalho em
forma de pergunta — estava sendo gasto num rótulo genérico.

**5. `Course` declarava aula como oferta.** Os módulos estavam em
`hasCourseInstance` — instância de curso é uma TURMA, com modalidade e datas. A
plataforma dizia ao buscador que cada trilha tem cinco ofertas simultâneas, o que
é falso. Agora é `syllabusSections`, com todos os módulos, e `numberOfCredits`
saiu: crédito é unidade acadêmica que a plataforma não emite.

**6. As páginas de hub não tinham dado estruturado nenhum.** São exatamente a
metade que faltava do par que o carrossel de cursos exige: página-resumo com
`ItemList` de `Course`. Acrescentado nos 7 hubs.

### O que foi acrescentado

- **`/llms.txt`** gerado do currículo — 39 trilhas e 415 módulos com descrição na
  mesma linha do link, porque link sem contexto obriga o agente a baixar a página.
  Gerado, e não estático, pelo mesmo motivo do sitemap: lista à mão apodrece.
- **Agentes de IA no `robots.txt`**: `Claude-User`, `Claude-SearchBot`,
  `OAI-SearchBot`, `ChatGPT-User` e outros. Todos já caíam na regra geral que
  permite tudo — listar é declaração de intenção.
- **Seção "Perguntas frequentes"** em 8 módulos das trilhas de maior intenção de
  busca, com resposta que começa pela conclusão. O gerador recusa resposta com
  menos de 180 caracteres e pergunta sem interrogação.

### Travado por teste

`dados-estruturados.test.tsx` (10 casos) verifica o gerador. E a varredura ganhou
três checagens que leem o **HTML servido das 415 páginas**: schema presente e
parseável, ausência de identificador interno na descrição, pergunta em `<h2>/<h3>`,
`llms.txt` completo e `ItemList` nos hubs. Teste de componente prova que o gerador
funciona; só a leitura do HTML prova que a página emite.

### Pendência honesta

**Perguntas frequentes em 259 módulos.** Hoje **156 dos 415** têm a seção, com
**489 respostas** — as nove trilhas do eixo Claude/IA/certificação de entrada
estão fechadas (Claude Code, Claude Code Pro, API Claude & Agents, Anthropic
Practitioner, Fundamentos da IA, Engenharia AI-Native, AIF-C01, Bedrock e
CLF-C02). Restam as trilhas AWS de nível associado e profissional, os fundamentos
técnicos e as linguagens.

Medição: `python3 scripts/validate_respostas_citaveis.py --cobertura`.

As 1.247 perguntas de fixação já dão a todos os 415 módulos cabeçalhos em forma de
pergunta com resposta — que é o sinal principal. A seção de perguntas abertas
acrescenta cobertura de consulta long-tail, e é trabalho de conteúdo por módulo,
não automatizável sem cair em texto genérico.

**Agora existe a fonte das perguntas.** O levantamento de demanda de ago/2026
produziu 10.000 consultas já atribuídas a módulo dono — ver
[`PESQUISA_DEMANDA_BUSCA_2026-08.md`](./PESQUISA_DEMANDA_BUSCA_2026-08.md) e
[`docs/seo/CORPUS_10K_CONSULTAS.md`](./docs/seo/CORPUS_10K_CONSULTAS.md). O que
faltava não era método, era saber o que perguntar.

---

## 🟢 Levantamento de demanda de busca e taxonomia de temas (05/ago/2026)

Documento completo: **[`PESQUISA_DEMANDA_BUSCA_2026-08.md`](./PESQUISA_DEMANDA_BUSCA_2026-08.md)**.
Corpus: [`docs/seo/CORPUS_10K_CONSULTAS.md`](./docs/seo/CORPUS_10K_CONSULTAS.md) ·
[`docs/seo/corpus-10k.csv`](./docs/seo/corpus-10k.csv).

A auditoria anterior perguntava "a página declara o que ela é?". Esta pergunta é
outra: **"a plataforma tem o que as pessoas procuram?"**.

### O que o levantamento achou

**Três temas sem ensino, todos de alta intenção.** Dos 21 temas de demanda, 18
têm 26–87 módulos. Três não têm: **busca com IA (GEO/AEO)** com cobertura real
**zero**, **conformidade e regulação** com 2 módulos reais, e **carreira** com 2 —
sendo que engenheiro de IA é o **nº 1 do ranking Empregos em Alta 2026 do LinkedIn
no Brasil**.

A medição de perto importou: o classificador de tema apontava 5 módulos de
conformidade e 10 de carreira. Inspecionando **qual termo casou**, a cobertura
sumiu — "geo" de roteamento de DNS, "portfolio" de custos AWS, "compliance" de
retenção de log, "mercado" de contexto. Contagem automática é ponto de partida de
inspeção, não verdade.

**Dois formatos existem como caso isolado.** `/claude-code-vs-cursor` é uma boa
página de comparação, e é **uma** para 107 pares que valem página. `/glossario`
tem 44 termos numa **única URL**, sem link para o módulo que ensina — e o corpus
tem 1.497 consultas de definição. Comparação e definição são justamente os dois
arquétipos que o buscador de IA **gera sozinho** ao decompor uma consulta.

### O que a pesquisa mudou no método

Não existe API pública de volume de busca — e a pesquisa mostrou que ela também
não resolveria: **65% a 85% dos prompts feitos a assistentes de IA não têm
correspondência em base de palavra-chave nenhuma** (Semrush, 126 mi de prompts). A
demanda que mais cresce é a que ferramenta de keyword não vê.

O que a pesquisa dá é a ESTRUTURA: **query fan-out** decompõe uma consulta em 8–12
sub-consultas paralelas, incluindo variações comparativas explícitas. Ou seja,
**não se captura um assunto com uma página** — captura-se cobrindo a superfície de
sub-consultas. E o estudo de 1.094 categorias mostra que presença em 1 de 5
arquétipos é penalizada até se chegar a 3 de 5.

O corpus tem rótulo de origem por linha: **107 `V`** (volume publicado em fonte
citada), **583 `P`** (padrão documentado), **9.310 `D`** (derivada por expansão).
Os volumes `V` são os publicados em inglês, base americana — servem para ordenar
prioridade, não para prever tráfego em português.

### Onda 1 entregue

Taxonomia de temas (`frontend/src/lib/curriculum/temas.ts` + `temas-mapa.ts`
gerado), `/temas`, 19 páginas `/temas/<tema>` com `CollectionPage` e
`BreadcrumbList`, e chips de tema nos 415 módulos. Zero conteúdo novo escrito —
é reorganização do que já existe, e é o que habilita medir o resto.

`MINIMO_PARA_PAGINA = 3`: tema com menos de três módulos não ganha página, e
aparece em `/temas` numa seção "Em produção" com a contagem à vista. Página fina
não é neutra — dilui o resto do domínio.

### O que eu deliberadamente não recomendei

`phishing` (290 mil/mês), `malware` (170 mil) e `blockchain` (160 mil) estão entre
as ausências, somam 620 mil buscas/mês, e **estão fora do eixo** escolhido em
jul/2026. Escrever sobre phishing porque phishing tem volume é o caminho de volta
para "escola de tudo". Volume não é argumento suficiente.

### Pendência

As ondas 2 a 7 são conteúdo: 40 módulos novos (3 trilhas + 14 em trilhas
existentes), 106 comparações, verbetes de glossário com URL própria, e
`Perguntas frequentes` nos 385 módulos que faltam. O plano, com esforço e ordem,
está no documento.

---

## 🟢 Estratégia de SEO orgânico e contrato de resposta citável (05/ago/2026)

Documento: **[`ESTRATEGIA_SEO_ORGANICO_2026-08.md`](./ESTRATEGIA_SEO_ORGANICO_2026-08.md)**.
Fila de trabalho: [`docs/seo/FILA_PERGUNTAS_POR_MODULO.md`](./docs/seo/FILA_PERGUNTAS_POR_MODULO.md).

O levantamento anterior mapeou a demanda. Esta rodada fez a plataforma **responder**:
os quatro formatos, o contrato de escrita, o grafo de link interno, a medição e os
gates.

### O contrato de resposta citável

Três regras, todas com gate: a pergunta é a que se digita e é `<h3>`; a resposta
**começa pela conclusão**; a resposta se sustenta fora da página (mínimo 180
caracteres, primeira frase até 300). Corolário: nunca trocar a resposta por um
ponteiro — quem cita não segue link.

`validate_respostas_citaveis.py` recusa dez aberturas de preâmbulo, cada uma com o
motivo escrito na linha. Ele **não** exige a seção em todo módulo: cobertura é
trabalho em andamento, e gate que falha por conteúdo futuro ensina o time a
desligar gate.

### Dois defeitos encontrados, ambos invisíveis para os testes que existiam

**23 textos com código inline perdido**, em 14 arquivos. O que estava no ar:
`"Sim. , , . API aceita campo (lista base64)"`, `"Para 4 GPUs: ."`,
`"Endpoints suportados (≈parity com OpenAI): , , , ."`. Passava por build, por
`validate_substancia` (conta caracteres), por `validate_primitives_render` (o
bloco é válido) e pela varredura (200 com conteúdo). Só um leitor humano vê.

Corrigidos os 23, sob uma regra: **restaurar só o identificador de que eu tinha
certeza** — comando de CLI documentado, chave de IAM, campo de API estável — e no
resto reescrever a frase para não depender do trecho ausente. Reconstruir de
memória o nome de uma flag ensina algo falso, que é pior que a lacuna. Agora há
`validate_texto_sem_lacuna.py`.

**18 respostas abaixo do piso de substância** (111 a 179 caracteres) e uma seção
com dois pares. Todas expandidas — a expansão acrescentou a ressalva que faltava,
não texto de enchimento.

### Um falso positivo do meu próprio gate

A primeira versão do gate casava `"leia o"` e acusou *"leia o thinking block,
identifique onde o raciocínio descarrila"* — instrução de depuração ao leitor, não
ponteiro para outro conteúdo. O padrão passou a exigir o substantivo de conteúdo
(módulo, artigo, guia…). Gate que reclama de prosa correta ensina o time a
desligar gate.

### Também corrigido: atribuição errada no corpus

As 57 consultas autorais eram atribuídas ao primeiro módulo do tema, e
"Quanto ganha um engenheiro de IA no Brasil?" virou fila de trabalho de um módulo
sobre a linha de produtos da Anthropic. Consulta autoral é de TEMA, não de módulo
— agora o dono é `tema:<id>` e ela sai da fila por módulo. **Dono errado é pior
que dono nenhum: manda escrever no lugar errado.**

### Pendência

A fila está em ordem de retorno no documento de estratégia. O item 1 é o de maior
volume: `Perguntas frequentes` em **370 módulos**, com as consultas de cada um já
listadas. Os itens 2 a 6 são as três trilhas novas, as 106 comparações, os
verbetes com URL própria e os 14 módulos de assunto quase-coberto.

---

## 🟢 Auditoria de indexação e hub de conhecimento (05/ago/2026)

Documento: **[`ESTRATEGIA_SEO_ORGANICO_2026-08.md`](./ESTRATEGIA_SEO_ORGANICO_2026-08.md)**,
seção 6b.

### O pior defeito da plataforma até aqui

O servidor **não** usa `trailingSlash`: `/aprenda/x/` responde **308** para
`/aprenda/x`. E as **415 páginas de módulo declaravam `canonical: /aprenda/x/`** —
canônica apontando para redirect. Sinal conflitante: o buscador descarta a
declaração e escolhe a URL sozinho. A plataforma entregava de graça a decisão mais
importante que uma página toma sobre si mesma.

A mesma forma com barra estava no `Article` em JSON-LD e nos 415 links do
`llms.txt`, enquanto o **sitemap** publicava a forma sem barra. Convenção adotada:
**sem barra final**, porque é a que o servidor já aplica.

### Os outros seis

| Defeito | Escala |
|---|---|
| Rotas indexáveis sem canônica | **71** — incluindo a home, os 7 hubs e as 39 trilhas |
| Rotas de `/admin` indexáveis | **13** |
| Rotas pessoais indexáveis (`/progresso`, `/perfil`, `/revisar`) | 3 |
| Rota com `noindex` anunciada no sitemap | 2 |
| Nenhuma entidade do site — só `publisher` inline sem `@id` | 415 páginas |
| `/perguntas` nasceu órfã | 168 links de saída, 0 de entrada |

### Duas decisões contraintuitivas, com teste

**`/admin` é client component** e não pode exportar `metadata` — daí
`X-Robots-Tag` por header, o único mecanismo que alcança a subárvore e vale mesmo
em página que só existe após hidratação. Mais `disallow` no robots: o robots
impede o rastreamento, o header impede a indexação de URL descoberta por link.

**Rota pessoal NÃO entra no `disallow`.** Ela declara `noindex` na página, e
bloquear o rastreamento impediria o buscador de **ler** esse noindex — a URL
ficaria no índice sem descrição. Há teste registrando a distinção, porque alguém
vai querer "reforçar" a proteção e piorar.

### O grafo de entidades

`src/lib/site-jsonld.ts` — `EducationalOrganization` + `Person` (com `sameAs` para
GitHub, LinkedIn e X) + `WebSite`, emitido uma vez no layout raiz, com `@id`
estável. Antes eram 415 organizações homônimas. **Sem `SearchAction`**: exige rota
de busca com parâmetro, e `/search` saiu no pivot de jul/2026.

### `/perguntas` — o hub de conhecimento

Uma URL com as **168 perguntas** que a plataforma responde, agrupadas por tema,
cada uma com **a pergunta inteira como texto da âncora**. Não repete as respostas:
duas URLs com o mesmo conteúdo competiriam pela mesma consulta.

A nona checagem da varredura pegou um defeito meu aqui — a âncora incluía o nome
do módulo **depois** da pergunta, então o texto do link não era a pergunta. O nome
do destino saiu para fora do `<a>`.

---

## 🟢 Cobertura de perguntas em 100% e skill de arquitetura (05/ago/2026)

### As 1323 perguntas

**415 de 415 módulos** têm a seção `Perguntas frequentes`, com **1266 respostas**
nos módulos e **57** nas páginas de tema. O hub `/perguntas` reúne todas, com a
pergunta inteira como texto da âncora.

**O gate foi INVERTIDO.** `validate_respostas_citaveis.py` nasceu verificando só o
que existia, porque a cobertura era de 30 módulos e gate que falha por conteúdo
futuro ensina o time a desligar gate. Com 100%, a ausência deixou de ser trabalho
pendente e passou a ser **regressão**: módulo novo sem a seção quebra o CI no mesmo
commit em que entra. É a mesma inversão que `validate_cobertura_quiz.py` sofreu, e
pelo mesmo motivo.

**O gate me pegou seis vezes** ao longo dos lotes: uma resposta abrindo em
"Primeiro, verificar…" (preâmbulo) e cinco perguntas curtas demais — "Aurora ou
RDS?", "RAG ou ajuste fino?", "Canal ou mutex?", "Como escalar busca?", "O que CQRS
resolve?". Escrever em lote de 30 a 80 módulos é exatamente onde o contrato escapa,
e rodar o gate **a cada lote** é o que impede acumular defeito em centenas de
respostas.

### A skill de arquitetura

`.claude/skills/arquitetura-ia-aws.md` — para desenhar `arch_diagram` profissional
em módulo de IA/AWS. Ela carrega o esquema exato com os limites que fazem o bloco
desaparecer, a tabela de chaves de `service` do catálogo, e **cinco padrões de
referência** de sistema com IA sobre Bedrock: RAG sem servidor, extração de
documento orientada a evento, agente com ferramentas, copiloto interno e
enriquecimento em lote.

**A própria skill errou ao ser escrita:** documentou o separador de aresta de passo
como `->`, e o renderizador compara a string literal `origem>destino`. Com `->` o
passo acende sem aresta, em silêncio. Corrigido, com a nota registrada na skill.

**11 diagramas novos** nos módulos em que topologia é o objeto de estudo — laço
de tool use, pipeline de RAG, harness do Claude Code, vetores de prompt injection,
exfiltração por ferramenta, arcabouço de avaliação, assistente de voz, RAG local,
pipeline de ajuste fino, custo de agente e escolha de banco vetorial. Total de
módulos com diagrama: **195 de 415**.

### Verificação

844 testes, `tsc` 0, lint 0, build com as 19 páginas de tema, varredura com 9
checagens verdes, 11 gates de conteúdo verdes, 12.468 blocos válidos com 0 erros.

---

## 🟢 Módulo de 100 soluções de IA na AWS (05/ago/2026)

Catálogo de apoio: **[`docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md`](./docs/seo/CATALOGO_100_SOLUCOES_AWS_IA.md)**
· Módulo: **[`/aprenda/aws-ia-100-solucoes`](/aprenda/aws-ia-100-solucoes)**
· Gerador: `python3 scripts/seo/gerar_modulo_100.py`

Cem problemas reais com a arquitetura que os resolve na AWS, em dez famílias e
cinco arquétipos. Cada linha traz problema, topologia de serviços, **a decisão
transferível** e a origem da informação.

### A parte que mais importa: a origem é rotulada

**21 casos públicos** com fonte citada (DoorDash, Toyota, Cox Automotive, OPLOG,
EXL, Trellix, Genentech, Formula 1, Bluesight, Syngenta, Clearwater, ASAPP,
Experian, Luma AI, Agroseguro entre outros), **32 arquiteturas de referência da
AWS** (Solutions Library, Prescriptive Guidance, Well-Architected Generative AI e
Agentic AI Lens, blog oficial) e **47 padrões compostos** — a topologia que se
repete, sem cliente nomeado.

Chamar as 100 de "caso real" seria a distorção mais fácil de cometer, e o catálogo
diz o número em vez de sugerir. **O cabeçalho da primeira versão dizia
"28 · 34 · 38"** — número escrito de cabeça. O gerador conta e falha se o catálogo
mudar de forma; a contagem no documento passou a ser a medida.

### Casos brasileiros: referência de mercado ≠ caso de arquitetura

Itaú (150 soluções em produção, assistente para centenas de milhares de clientes),
Nubank (modelo próprio para subscrição) e Bradesco (plataforma multiagente **em
outra nuvem**) aparecem no documento como referência de mercado e **não** nas
tabelas como caso de Bedrock — porque a fonte pública não confirma isso.

### Três defeitos meus, encontrados pelos gates

1. **`paragraph.content` como string.** O Zod exige array de nós de texto rico; com
   string o bloco desaparece em silêncio. Pego por `validate_bedrock_blocks.py`.
2. **`title` duplicado no seed.** O título humano vem de `trails/*.ts`; duplicar é
   como as duas fontes divergem.
3. **Par de pergunta e resposta em bloco `key_value`.** Em `rlhf-fundamentos-ppo`, o
   script de inserção copiou o tipo do primeiro filho da seção — que era
   `key_value`. A resposta estava salva e **invisível na página**. Pior: o gate de
   resposta citável **aprovou**, porque lia `data.question` sem olhar o tipo do
   bloco. Corrigido nos dois lados, com prova negativa: reintroduzi o defeito e o
   gate novo pegou.

**Gate que valida o texto e ignora o envelope aprova conteúdo que ninguém vê.**

### Um quarto defeito: cache que nunca invalidava

`scripts/seo/gerar_corpus.py` só extraía o currículo quando o cache não existia.
O módulo novo ficou fora do mapa de temas e do corpus **sem erro nenhum** — e o
sintoma apareceu como teste falhando, não como aviso. Passou a comparar o tempo de
modificação de `curriculum/`.

---

## 🔴 Erro de hidratação em produção, achado por renderizar TODAS as telas (05/ago/2026)

### O defeito

`RequireAuth` tinha, dentro do render:

```ts
if (user === null && typeof window === 'undefined') { …esqueleto… }
```

O servidor entregava o esqueleto de "verificando autenticação"; o primeiro render
do cliente entregava a tela de login. **Incompatibilidade de hidratação garantida**
— e é literalmente o primeiro item que a mensagem de erro do React lista como
causa: *"A server/client branch `if (typeof window !== 'undefined')`"*.

`/simulados/cloud-practitioner/estudo` respondia **200**, tinha `<h1>`, tinha
conteúdo e passava em todas as checagens estruturais. O defeito só aparecia ao
**renderizar de verdade** num navegador e escutar o console.

### Por que não tinha sido pego antes

A varredura renderizava **uma amostra de 4%** dos módulos, mais oito rotas de
aplicação — e nenhuma rota de simulado estava entre elas. Amostra prova que
aqueles funcionam; não prova nada sobre os outros 96%.

### O que mudou

**A varredura passou a renderizar TODAS as telas**: 89 rotas estáticas, 19 páginas
de tema e os 416 módulos — **524 telas**, cada uma aberta em navegador com o
console escutado. Custa 2,9 minutos e domina o tempo da varredura; roda em
`npm run varredura`, não a cada commit.

Nas 524, **um** defeito. Corrigido na causa: estado real de carregamento no
contexto de autenticação, começando `true` no servidor **e** no primeiro render do
cliente — é isso que faz os dois concordarem. Ramo por ambiente nunca faz.

### Travado por teste, com prova negativa

`sem-ramo-por-ambiente.test.ts` proíbe condicional de ambiente que governe
**retorno de JSX** em componente de cliente. Reintroduzi o defeito e o teste
pegou; restaurei e ficou verde.

**A primeira versão do teste era grossa:** acusava qualquer `typeof window` em
arquivo de cliente e apontou **11 arquivos, todos corretos** — guarda dentro de
função utilitária (`if (typeof window === 'undefined') return [];`) e dentro de
efeito. Estreitado para exigir que o ramo devolva JSX. Gate que acusa código
correto ensina o time a desligar gate.

---

## 🔴 Fontes citadas: 15 links que resolviam e não sustentavam (05/ago/2026)

Verifiquei os links do catálogo de 100 soluções pela primeira vez com
`scripts/validar_links_externos.py`: **69 de 70 respondem 200**.

Mas responder 200 não é sustentar a afirmação. **15 fontes apontavam para página
de LISTAGEM ou de CATEGORIA** — o blog de aprendizado de máquina da AWS em vez do
post específico, a página de on-demand do re:Invent em vez da sessão. Link que
resolve e não sustenta é pior que link morto: dá aparência de verificabilidade.

O que foi feito:

- **4 URLs específicas localizadas** e substituídas — Formula 1, Bluesight,
  digitalização de prontuário e endpoints de VPC do Bedrock.
- **6 casos que vivem na listagem oficial de histórias de clientes da AWS**
  passaram a dizer isso no rótulo.
- **2 sessões de re:Invent** ficaram identificadas por ID (`IND320`, `IND3329`),
  com a ressalva escrita de que não localizei URL direta.
- **2 páginas de parceiro** passaram a dizer que são de parceiro, não da AWS.

**A verificação de rede NÃO entra no CI**, de propósito: ela depende de terceiro
estar de pé e de não ser bloqueado por agente. O que entra é
`links-citados.test.ts`, que verifica FORMA — nenhuma URL de listagem sem rótulo
que admita, nenhum placeholder, tudo https, data da última verificação registrada,
e a contagem de origem do cabeçalho conferida contra a contagem real das linhas.

Esse último caso pegou outro erro meu: o cabeçalho dizia **"28 C · 34 A · 38 P"**,
escrito de cabeça. A contagem real é **21 · 32 · 47**.

---

## Como este documento está organizado

Cada tarefa tem **prioridade**, **esforço**, **dono** e **critério de aceite**.
Prioridade responde "o que acontece se não fizer":

- 🔴 **P0** — algo está quebrado, errado ou impedindo o resto
- 🟠 **P1** — o produto entrega menos do que promete
- 🟡 **P2** — melhoria real, sem urgência
- 🟢 **P3** — polimento

Esforço: **P** ≤ meio dia · **M** ≤ 3 dias · **G** > 3 dias.

---

# 🔴 P0 — BLOQUEIA TUDO

## D-1 · Migração DNS + SSL

**Só você pode fazer.** Nada produzido nesta plataforma existe para o público
enquanto isso não acontecer.

> **Medido em 09/ago/2026:** o passo 1 JÁ FOI FEITO — o DNS de `@` e `www`
> resolve para `72.60.28.82`. Mas a 443 está fechada e a 80 serve a página
> padrão do nginx: hoje não há NEM o site velho no ar. Faltam os passos 3–5
> (certbot, reload, `DEPLOY_ENABLED`).

**Passos:**

1. Painel Hostinger → DNS → registros `A` de `@` e `www`: `89.116.115.228` →
   `72.60.28.82`
2. Antes de trocar, **reduza o TTL** dos registros com pelo menos algumas horas de
   antecedência — o TTL atual é o tempo que os caches vão continuar mandando gente
   para o servidor antigo depois da mudança
3. SSH na VPS:
   `sudo certbot certonly --webroot -w /var/www/certbot -d fernandofrancovalle.com -d www.fernandofrancovalle.com`
4. `docker compose -f /opt/ffv/docker-compose.prod.yml exec nginx nginx -s reload`
5. GitHub → Settings → Variables → Actions → `DEPLOY_ENABLED` = `true`

**Atenção no primeiro deploy:** a migration `000044` roda automaticamente e é
obrigatória — sem ela o importer rejeita todos os 118 diagramas, porque o CHECK
de `module_blocks.block_type` nunca incluiu `arch_diagram`. Isso já está corrigido
no repositório; só precisa rodar.

**Aceite:** `https://fernandofrancovalle.com` serve o container Next, com
certificado válido, e `/admin` responde.

## E-1 · Os quatro `[PREENCHER]` da política de privacidade

**Só você pode fazer.** A página `/privacidade` tem **4 marcadores** por preencher:
nome/razão social do controlador, CPF/CNPJ, e o e-mail do encarregado.

**Publicar com os marcadores é pior do que não publicar** — uma política de
privacidade que diz `[PREENCHER: CPF/CNPJ]` demonstra que ninguém a leu, sobre
exatamente o documento que deveria demonstrar cuidado.

**Aceite:** zero ocorrências de `PREENCHER` no arquivo, e uma leitura jurídica do
texto inteiro — especialmente a seção 7, que agora descreve a exclusão de conta
implementada e o que ela deliberadamente mantém.

---

# 🟠 P1 — O PRODUTO ENTREGA MENOS DO QUE PROMETE

## ~~A-3 · Quizzes nos 63 módulos restantes~~ — ✅ FEITO em 04/ago/2026

**Estado final:** 415 de 415 módulos com 3+ quizzes. **1.247 cartas de SM-2**
possíveis, contra 1.058 no início do dia e 320 em julho. Os sete hubs fechados.

Os 63 módulos foram escritos em nove lotes, por trilha, sempre lendo as seções do
módulo antes de formular a pergunta. O gerador recusa explicação com menos de 220
caracteres — regra que existe para forçar o tratamento de cada distrator, e que
barrou várias das minhas ao longo da rodada.

**O gate foi invertido, e essa é a parte que dura.** Enquanto existia uma lista de
trilhas "já cobertas", módulo novo entrava sem quiz e nada avisava até alguém
lembrar de promover a trilha. Agora `scripts/validate_cobertura_quiz.py` exige
cobertura de **todo módulo com seed** e mantém `EXCECOES` — hoje vazia, e com a
instrução escrita de que exceção sem prazo vira permanente por inércia. Provado
por teste negativo: zerar os quizzes de um módulo faz o gate sair com código 1 e
nomear o slug.

**Aceite (cumprido):** `python3 scripts/validate_cobertura_quiz.py --strict` sai 0
e reporta `415 módulos com 3+ quizzes`.

## ~~A-4 · Diagramas onde há fluxo ou topologia~~ — ✅ **206 de 426 (48%)**, todas as trilhas cobertas

> **Atualização de 05/ago/2026:** a trilha `trail-arq-ia-aws` acrescentou **100
> arquiteturas** em 10 módulos — uma por solução do catálogo, todas com legenda e
> 5 passos. A cobertura por módulo saiu de 186/415 para **206/426 (48%)**, e o
> número de diagramas na base passou de 201 para **301**. Ver a seção
> "As 100 arquiteturas desenhadas" no topo deste documento, inclusive o defeito de
> 121 selos de VPC falsos que o trabalho revelou.

**De 118 (28%) para 186 (44%)** — 68 diagramas novos em 04/ago/2026. E, mais
importante que o número: **nenhuma trilha ficou sem nenhum**. Antes, onze trilhas
inteiras — incluindo Redes & Web, TypeScript, Python, Diffusion e Computer Vision —
não tinham um único desenho.

**Onde foram, e por quê:**

| Trilha | Diagramas | O que se decidiu desenhar |
|---|---:|---|
| Redes & Web | 7 | é topologia pura: encapsulamento, aperto de mão, cifragem, resolução de nomes, balanceamento, fluxo bidirecional, política de origem |
| Claude & Anthropic | 7 | permissões, subagentes, ganchos, laço de ferramenta, protocolo de contexto, fluxo versus agente, orçamento de janela |
| Postgres / SQL / Distribuídos | 6 | versionamento de linha, índice composto, replicação, eventos como verdade, limite distribuído, chave de idempotência |
| Segurança e fundamentos | 4 | fluxo de autorização, confiança zero, cadeia de suprimentos, anatomia de requisição |
| Internals de LLM | 6 | cache de atenção, especialistas esparsos, transformador, uso de ferramenta, quantização, proteções |
| Produção de IA | 5 | API em produção, plataforma de prompts, publicação progressiva, busca híbrida, injeção de instrução |
| Uma por trilha restante | 11 | laço agêntico, eixos do harness, tipos de aprendizado, multimodal, difusão, validação de borda, laço assíncrono, ajuste fino, avaliação, economia unitária, visão clássica |

**Onde NÃO se forçou:** o padrão continua sendo "onde há fluxo ou topologia".
Módulo de sintaxe, de comparação de ferramentas ou de checklist segue sem figura —
e agora isso é decisão registrada, porque o mínimo por trilha em
`validate_cobertura_diagramas.py` foi ajustado para o que cada uma realmente tem.
Provado por teste negativo: remover um diagrama derruba o gate e nomeia a trilha.

**O catálogo de ícones cresceu de 157 para 205 entradas.** O motivo é uma lição
sobre ergonomia de autoria: o gate acusou a MESMA classe de erro seis vezes
seguidas — escrever o nome do GLIFO (`workflow`, `search`, `doc`, `chars`,
`globe`, `brain`) como se fosse chave de serviço. A intuição de quem escreve é
nomear o desenho. Em vez de corrigir caso a caso, registrei todos os nomes de
glifo como conceitos legítimos, com rótulo próprio. O fallback continua existindo
para o erro de digitação de verdade.

## ~~A-6 · Capstones por certificação~~ — ✅ já existia; medição minha estava errada

**Correção de medição.** Eu havia reportado "5 das 6 trilhas AWS sem capstone".
Errado: procurei `capstone` no slug, e a convenção desta base é `simulado-<cert>`.
As cinco trilhas têm fechamento — `simulado-practitioner`, `simulado-saa-c03`,
`simulado-dva-c02`, `simulado-sap-c03` e `aif-simulado-final` —, todos com
estratégia de prova, checklist por domínio e pesos dos domínios.

**O que de fato havia de errado, e foi corrigido:** o título do fechamento do
DVA prometia "simulado DVA-C02 comentado (15 questões)" e a descrição, "simulado
de 15 questões com explicações completas". O conteúdo tem 3 e diz isso com todas
as letras, apontando para `/simulados`. O módulo era honesto por dentro; a
promessa estava no ÍNDICE — que é o que a pessoa lê antes de decidir estudar.
Retitulado para "Fechamento DVA-C02: estratégia de prova e checklist".

**Gate novo, dentro de `check-curriculum-seed-drift.mjs`:** título ou descrição
que promete N questões passa a exigir N quizzes no seed. Duas defesas contra
ruído: só conta quando a frase atribui as questões ao módulo, e descarta quando
o texto descreve o exame ("65 questões, 130 min, passing 720"). A primeira versão
acusou dois falsos positivos exatamente assim.

**E um buraco no meu próprio gate, achado por prova negativa.** A primeira versão
delimitava a entrada com `[\s\S]{0,900}?(?=slug:)` — lookahead que exige outra
entrada logo adiante. Isso pulava em silêncio o ÚLTIMO módulo de cada trilha, que
é onde ficam os fechamentos: o gate passava verde sobre o único caso que existia
para pegar. Descobri restaurando o título antigo e esperando vermelho — recebi
verde. Corrigido para delimitar pela posição da próxima entrada.

## ~~B-1 · Quebrar o `curriculum.ts`~~ — ✅ dividido, e a redução de bundle veio em 11/ago/2026

### O que foi feito

O arquivo de 4.093 linhas virou `src/lib/curriculum/`:

| Arquivo | Linhas | Papel |
|---|---:|---|
| `trails/<trailId>.ts` × 39 | 3.896 no total | uma trilha por arquivo |
| `trails/index.ts` | 89 | monta o `CURRICULUM` na ordem original |
| `queries.ts` | ~130 | consultas que precisam do currículo |
| `queries-leves.ts` | ~30 | as que não precisam — nível e progresso |
| `badges.ts`, `hubs.ts`, `levels.ts`, `types.ts` | ~260 | o resto |
| `index.ts` | 42 | barrel, com os mesmos nomes de antes |

O barrel existe porque **93 arquivos** importam de `@/lib/curriculum`.
Refatoração que obriga a mexer em 93 lugares para provar que nada quebrou não é
de baixo risco.

Cinco testes travam a estrutura em `curriculum-estrutura.test.ts`: arquivo de
trilha sem import (trilha que existe no disco e não no produto), ordem alterada
(muda a navegação em silêncio), hub apontando para trilha inexistente, trilha
órfã, e arquivo sem a trilha exportada.

**Um achado no caminho:** `trail-bedrock` está em DOIS hubs. É intencional — é a
ponte de IA Aplicada para o anel pago de certificação —, e os totais globais
derivam de `CURRICULUM`, onde cada trilha aparece uma vez, então não há contagem
dupla. Registrei como exceção declarada, com um segundo teste que falha se a
exceção deixar de corresponder à realidade: exceção obsoleta autoriza em silêncio
uma duplicação que ninguém decidiu.

### O índice leve, e o que ele resolveu

`useGameState` calcula progresso e recomendações, vive no layout raiz e importava
`CURRICULUM`. Ele não usa `desc` nem `keywords` — que são ~124 KB dos 265 KB de
fonte das trilhas. `scripts/gerar-indice-leve.mjs` gera um índice com só o que o
cálculo consome: **85 KB contra 265 KB**, verificado por
`indice-leve-fresco.test.ts` e regenerado no CI.

Três caminhos do layout até o currículo completo foram cortados: a busca
(`CommandPalette` dividido em casca leve + corpo sob demanda), o onboarding
(dinâmico — ele só aparece na primeira visita) e o hook de estado (índice leve).
`layout-sem-curriculo.test.ts` trava a propriedade.

### O que NÃO foi alcançado (na época), e por quê

**O bundle não caiu.** Medi antes e depois no `route-bundle-stats.json`:
95 de 95 rotas carregavam o currículo completo no primeiro load, e continuam
carregando. A causa aparente: o Turbopack emite **20 chunks comuns às 95 rotas**,
e o do currículo está entre eles — cerca de 50 páginas de trilha o usam
legitimamente e o agrupador o promove a compartilhado. `/verificar` e
`/aprenda/[slug]` recebem listas de chunk praticamente idênticas.

Corrigir o grafo de imports parecia condição **necessária e não suficiente**. A
hipótese registrada era de configuração do empacotador — e estava **errada**, ver
abaixo.

**Aceite (na época):** parcialmente cumprido. `CURRICULUM` funciona sem mudança em
quem consome (93 arquivos, 790 testes verdes) e a divisão está travada por teste.
A redução mensurável de bundle não tinha acontecido.

### ✅ 11/ago/2026 — a causa real era import RELATIVO, não o empacotador

A hipótese de "limite do Turbopack" media 95 de 95 rotas com o currículo — número
redondo demais para ser coincidência de agrupador. `layout-sem-curriculo.test.ts`
rastreava o grafo de import a partir de `app/layout.tsx`, mas só seguia imports
`@/...`. `engine.ts` e `lib/badges.ts` — alcançados por TODA rota via
`GameHUD` → `useGameState` → `engine.ts` — importavam `CURRICULUM` por caminho
RELATIVO (`from './curriculum'`), invisível para aquela regex. Corrigido o
rastreador (segue `@/...` e `./...`/`../...`, resolvendo pelo ARQUIVO alvo, não
pela string do import) e ele imediatamente pegou os dois caminhos.

**Trocado por `CURRICULO_LEVE`** (índice leve) em `engine.ts`, `lib/badges.ts` e
`lib/random-question.ts` — os três só precisavam de `slug`/`xp`/`id` de trilha,
não de `desc`/`keywords`. Mais 10 componentes client-side (`ContinueCard`,
`TrilhaDoDia`, `HomeClient`, `DailyModuleCard`, `home/Explorar`,
`home/BedrockDestaque`, `TrailCompletionModal`, `ProgressoClient`) tinham o mesmo
padrão. Três componentes de `/aprenda/[slug]` (`ConcluirModulo`,
`TrailCertificateBanner`, `NextSteps`) reimportavam o currículo completo
CLIENTE-SIDE para reencontrar dado que o Server Component já tinha resolvido —
passaram a receber como prop. `Certificate.tsx` (canvas + currículo completo, só
para o texto de LinkedIn) virou `next/dynamic`, carregado só ao clicar.

Zod (~61,5 KB gz) tinha o mesmo defeito em `engine.ts`/`progress-sync.ts` —
`GameStateSchema` só é necessário para validar import de backup e pull/push de
servidor, não a leitura normal do estado. Virou import dinâmico nos dois. (Achado
à parte, fora do escopo desta rodada: `storage.ts`/`auth.ts` têm uma SEGUNDA
dependência síncrona de Zod, via `UserProfileSchema`, usada em `getUser`/`setUser`
— chamadas em ~15 pontos de `auth.ts`, alguns síncronos. Tornar lazy exigiria
async-ificar essa cadeia; não fiz por risco de regressão no fluxo de login sem
tempo para validar cada call site. Fica registrado como próximo passo.)

**Medido, antes → depois (gzip, soma dos chunks de firstLoad — não mais o maior
arquivo isolado):**

| Rota | Antes | Depois |
|---|---:|---:|
| `/` | 443,7 KB | **351,4 KB** |
| `/aprenda/[slug]` | 438,8 KB | **338,0 KB** |
| `/revisar` | 421,2 KB | **323,4 KB** |
| `/verificar` | 421,2 KB | **322,4 KB** |

O currículo completo saiu de **97 de 97 rotas** (o `route-bundle-stats.json` tem
97 rotas distintas, não 617 — cada slug de `/aprenda/<slug>` conta como 1 padrão
de rota) para **54 de 97** — as 43 restantes são hubs e páginas de trilha, que
LEGITIMAMENTE precisam do detalhe (`desc`/`keywords`) para SEO e listagem; a
regra do pacote (`nenhuma rota que não seja listagem/artigo carrega os 490
registros com desc+keywords`) permite isso.

Também RSC dos artigos `lab-*` (os maiores do site): `ConcluirModulo` e
`AnkiExport` recebiam `article.blocks` — a árvore INTEIRA do artigo — como prop,
e por serem `'use client'` isso duplicava o conteúdo já visível no HTML dentro do
payload RSC, MAIS de uma vez. Extração movida para o Server Component
(`lib/article-extract.ts`); só o resultado pequeno (quizzes/Q&A) vira prop. Maior
página (`lab-dominio-tls-cloudfront-estatico`): 1.533 KB → **1.347 KB** de HTML
(199 KB gz), payload RSC de 62,4% → 58,4% do total.

**Gate novo:** `bundlesize.config.json` media arquivo isolado (teto 400 KB; maior
chunk tinha 336 KB — passava) e o passo de CI tinha `continue-on-error: true` —
nem a métrica errada bloqueava. `frontend/scripts/check-route-bundle.mjs` soma o
GZIP de todo chunk em `firstLoadChunkPaths` (o que o navegador de fato baixa) por
rota crítica, com teto declarado, sem `continue-on-error`. Prova negativa: um
import de volta ao currículo completo em `engine.ts` faz as 4 rotas críticas
estourarem o teto em 40-56 KB cada — verificado, revertido, não ficou no código.

**Aceite: cumprido.** `curriculum-full` saiu do bundle comum das 4 rotas críticas
medidas pelo pacote (era o objetivo do `orcamento-de-carga-por-rota`); a causa
raiz documentada acima (import relativo, não limite do empacotador) invalida o
diagnóstico anterior — registrado aqui para quem ler esta seção não repetir a
mesma hipótese errada.

---

# 🟡 P2 — MELHORIA REAL

## ~~B-4 · Acessibilidade nas rotas principais~~ — ✅ FEITO em 04/ago/2026

**De 3 para 8 rotas** com verificação de axe no CI. Entraram: `/aprenda/[slug]`
(a de maior tráfego — 415 páginas), `/progresso`, `/revisar`, `/preferencias` e
`/explorar`, somadas a `home`, `busca` e `ranking` que já existiam.

O teste da rota de módulo renderiza a árvore de blocos de um **seed real**, não um
bloco de exemplo. É a única forma de alcançar os primitives de verdade — tabela,
diagrama, quiz, fórmula anotada —, que é onde problema de rótulo costuma nascer.

**Achou um defeito de verdade:** o campo de importar backup em `/progresso` não
tinha nome acessível nenhum. Ele some da árvore por `display: none` vindo de
classe utilitária, então em produção o impacto é nulo — mas depender de CSS
carregar para um elemento não ficar sem rótulo é frágil de graça. Recebeu
`aria-label`.

**Duas limitações registradas no próprio arquivo**, para ninguém ler mais garantia
do que existe: jsdom não aplica CSS (os testes são mais rígidos que o navegador),
e só violações **críticas** são cobradas — contraste e ordem de foco em fluxo real
continuam pedindo auditoria manual.

**Efeito colateral:** o gate de landmarks varria também `src/tests/`, e como é
varredura textual, bastava um teste MENCIONAR a tag num comentário para acusar
violação. O escopo foi recortado para o que é servido. Verifiquei que ele continua
pegando violação real em `src/app/`.

## ~~C-2 · Webhook do admin → `revalidatePath`~~ — ✅ FEITO em 04/ago/2026

Havia **0 ocorrências** de `revalidatePath` no repositório: artigo editado no
admin esperava até 1h de ISR para aparecer, inclusive correção de erro factual —
o caso em que a espera mais dói. A alternativa era um deploy para propagar uma
vírgula.

Agora o editor chama `POST /api/revalidate` logo após gravar, e a página pública
reflete na hora.

**A decisão de projeto que importa: por que não usar um segredo compartilhado.**
O editor roda no NAVEGADOR — qualquer segredo que ele enviasse estaria no bundle,
legível por qualquer visitante, ou seja, não seria segredo. A rota confere a
credencial que o usuário já tem: repassa o token ao backend e só revalida se ele
responder que o portador é admin. Mantém uma única fonte de verdade sobre quem é
admin, em vez de inventar um segundo mecanismo que envelheceria em separado.

**E por que autorizar, se revalidar parece inofensivo:** não é. Rota aberta
permite invalidar as 415 páginas em laço e forçar re-render de todas — trabalho de
servidor grátis para quem chama e caro para quem hospeda.

**Falha de revalidação é AVISO, não erro de salvamento.** Neste ponto o conteúdo
já está no banco; a única consequência é a página demorar até 1h, que é o
comportamento que existia antes. Dizer "falhou" faria alguém salvar de novo
achando que perdeu a edição.

**12 testes** cobrindo a superfície: sem token (401), usuário comum (403), token
recusado (401), backend fora (502), sem API configurada (503), corpo não-JSON
(400) e cinco formas de slug inválido — inclusive `../../admin`, porque o slug
entra num caminho de revalidação e sem validação o chamador escolheria qual
caminho o servidor invalida.

## ~~C-3 · Expor `score` no DTO de certificado~~ — ✅ FEITO em 04/ago/2026

O agregado sempre teve `Score()`; o DTO não o expunha. Quem abre `/verificar` é um
**terceiro conferindo o documento de outra pessoa** — e "válido" sem pontuação não
diz se a pessoa passou. O cliente contornava lendo o score do `localStorage`, que
só existe no dispositivo que emitiu o certificado, exatamente o caso que
verificação por terceiro não é.

O campo `score` entrou em `CertificateDTO`. O cliente já lia `json.score`
defensivamente, então a tela passou a mostrar a pontuação sem outra mudança — o
que ficou obsoleto foi o comentário, atualizado para registrar por que o campo
segue **opcional** no tipo do cliente: durante deploy, ou contra instância antiga,
a resposta chega sem ele. Tratar ausente como zero foi o defeito original, e fazia
um certificado de 86% aparecer como 0%.

**Aceite (cumprido):** `go build ./...` e testes de contrato verdes.

## C-4 · Teste de fumaça contra o contêiner

**Por que existe:** a varredura de rotas valida o HTML pré-renderizado servido por
`next start`, que lê de `.next/`. O contêiner de produção roda
`node .next/standalone/server.js`, que precisa de `.next/static` e `public`
copiados para dentro da pasta standalone — o Dockerfile faz isso.

A diferença não é teórica: arquivo estático faltando na imagem, variável de
ambiente ausente no contêiner ou verificação de saúde mal configurada passam pela
varredura e quebram em produção. É a última lacuna entre "verde no CI" e
"funciona no ar".

**Proposta:** construir a imagem no CI, subir com `docker run`, e rodar contra
ela uma versão reduzida da varredura — home, uma página de módulo, `/api/health`
e um recurso estático. Não precisa das 503 rotas: precisa provar que o
EMPACOTAMENTO está certo.

**Aceite:** o CI falha se a imagem construída não servir uma página de módulo
completa, com CSS aplicado.
**Esforço:** P. **Dono:** código.

## D-2 · Cloudflare na frente

Elimina o blip de ~5s no swap de container durante deploy e reduz a latência dos
~120ms do datacenter em Boston para o Brasil. **Depende de D-1.**
**Esforço:** P. **Dono:** você.

---

# 🟢 P3 — POLIMENTO E DÍVIDA REGISTRADA

## B-5 · Explicação rica nos 75 simulados do catálogo

> **RESOLVIDO em 10/ago/2026, pela via (a) descrita abaixo — e foi além do
> escopo original.** A investigação de "migrar as 75" achou o problema maior:
> a SAA-C03 não tinha 75 questões corrigíveis, tinha **5** de prévia inline
> (2 sem tratamento de distrator, a R$97). Escrevi um banco ORIGINAL de 65
> questões — ancorado no guia oficial SAA-C03, lido na fonte, nas proporções
> reais dos 4 domínios (30/26/24/20%) — e publiquei pelo mesmo pipeline do
> CLF/DVA/AIF (`frontend/data/question-bank/saa-c03-*.json` →
> `make gen-seed-migration` → Postgres, `simulado_id = 'aws-saa'`).
> `parseExplanationString` continua apagada (confirmado ainda sem uso).
> O catálogo estático (`simulados-catalog.ts`) está com **zero questões
> inline** em todo simulado — `validate_explicacao_simulado.py` roda e reporta
> "nenhuma questão lida" porque não sobrou nada para verificar ali; a garantia
> de qualidade agora é 100% do `validate_question_bank.py --strict` sobre os
> arquivos do Postgres. Efeito colateral achado e corrigido na mesma sessão:
> zerar o array inline da SAA also esvaziou a fonte `'simulado'` do pool da
> "Pergunta do Dia" (`buildPool` lia aquele array direto) — ver
> `lib/random-question.ts`, `fetchSimuladoSample`.

**Achado original desta auditoria, e o diagnóstico mudou no meio dela.**

As 1015 questões CLF vêm do banco com explicação estruturada em JSON — e o
`EstudoClient` renderiza corretamente "por que a opção A está errada", opção por
opção. **Isso funciona.**

Já as **75 questões do catálogo estático** (`simulados-catalog.ts`) trazem
explicação como texto corrido, e o aluno recebe um parágrafo achatado em vez do
tratamento por distrator. Medido: **0 de 75** produzem explicação rica.

**Sobre o `parseExplanationString`:** são 130 linhas escritas para converter o
formato antigo `(a)/(b)/(c)` no formato rico, com marcadores `TODO_REVIEW` dentro.
Medição: **nenhum arquivo a chama**, e ela devolveria `null` para as 75 questões,
porque nenhuma usa aquele formato. Cheguei a suspeitar que os marcadores
`TODO_REVIEW` vazavam para o aluno — **não vazam**, porque a função nunca executa.
É código morto com um TODO enganoso, não um defeito ativo.

**Duas saídas, e a escolha é sua:**
- **(a)** migrar as 75 questões para explicação estruturada e apagar a função morta
- **(b)** apagar a função morta agora e migrar as questões quando forem revisadas

**Esforço:** P para (b), M para (a). **Dono:** conteúdo + código.

## B-7 · TODOs de backend no frontend

Três lugares esperam endpoint que não existe:

| Arquivo | O que espera |
|---|---|
| `TutorAsk.tsx` | `POST /api/v1/tutor/ask` para pergunta livre (hoje só SSE) |
| `PaywallCard.tsx` | integração Stripe Checkout |
| `peer-stats.ts` | `GET /api/v1/module/:id/stats` — hoje os números são locais |

O terceiro é o mais delicado: se a interface sugere comparação com outros alunos e
o dado é local, ela está afirmando algo que não mede. Vale conferir o texto exibido.
**Esforço:** M cada. **Dono:** código.

**Correção de medição (04/ago/2026):** uma varredura por `TODO|FIXME` no frontend
devolve 20 ocorrências, e **nenhuma é marcador de dívida** — são a palavra
portuguesa *todo* em nomes de teste ("TODOS os módulos", "TODO o currículo"). Os
três itens acima foram confirmados um a um. Registro isso porque o número bruto
sugere dívida que não existe, e alguém iria atrás.

## B-8 · Alias `aws_diagram`

Mantido por custo zero. Remover schema, adapter e a entrada no CHECK numa major
futura, quando não houver seed externo usando o nome antigo.

## A-7 · Trilha "IA para arquitetura cloud"

Depende da decisão **E-3** abaixo.

---

# 🤔 DECISÕES QUE SÓ VOCÊ PODE TOMAR

## E-3 · Estrutura da trilha "IA para arquitetura cloud"

Ela existe como ideia e não como currículo. Três recortes possíveis:

- **(a) Ferramenta** — usar IA para gerar IaC, revisar arquitetura, estimar custo
- **(b) Objeto** — arquitetar sistemas que usam IA (parcialmente coberto por
  Bedrock e AI-Native)
- **(c) Híbrido** — IA como copiloto do arquiteto, do diagrama ao Well-Architected

Sem essa definição, escrever os módulos é chutar o público.

## E-4 · O que sobrevive à exclusão de conta

A exclusão implementada apaga e-mail, telefone, nome, progresso sincronizado e a
presença no ranking público. **Mantém** certificados emitidos e registros de compra.

Duas perguntas em aberto:

1. **Certificados** guardam `holder_name` e são verificáveis por terceiros. Apagar
   invalida documento que alguém pode estar conferindo; anonimizar o torna inútil.
   Manter, anonimizar ou apagar sob pedido?
2. **Comentários** são fala pública. Apagar, anonimizar a autoria, ou manter?

A `/privacidade` descreve hoje o recorte implementado. Mudar a política exige
mudar os dois.

## E-2 · Licenciamento dos ícones

O catálogo `AwsIcon.tsx` tem 157 entradas desenhadas à mão, inspiradas na
iconografia AWS. Vale uma verificação de uso de marca antes de o site ir ao ar em
escala.

## F-1 · Migração do deploy de chave SSH para OIDC

**Fora de escopo do pack `supply-chain-cicd-e-infra` (11/ago/2026) — registrado
aqui como o próximo passo natural, não implementado.**

`deploy.yml` hoje autentica na VPS via `appleboy/scp-action`/`appleboy/ssh-action`
com uma chave SSH privada de longa duração guardada em `secrets.VPS_SSH_KEY`. A
mesma chave abre a VPS pra sempre até ser rotacionada manualmente — se o secret
vazar (log mal mascarado, action comprometida, colaborador que sai), a janela de
exposição é indefinida.

**OIDC eliminaria a chave de longa duração**: o GitHub Actions trocaria um token
de curta duração assinado pelo próprio GitHub por credenciais efêmeras no
destino, sem segredo nenhum guardado em `secrets.*`. O obstáculo real é que
OIDC nativo do GitHub Actions é pensado para provedores cloud com STS (AWS,
GCP, Azure) — a VPS Hostinger não tem um endpoint OIDC-aware pra trocar o
token por acesso SSH. Viabilizar isso exigiria uma de duas rotas:
1. Trocar SSH por um agente/bastion que aceite OIDC (ex.: Teleport, ou um
   pequeno serviço próprio que valida o `id_token` do GitHub contra o `sub`
   esperado e emite uma credencial SSH de curtíssima duração).
2. Migrar o deploy de SSH direto pra um provedor com STS nativo (ECS/Fargate,
   Cloud Run) — mudança de infraestrutura maior, não só de autenticação.

Mitigação atual, enquanto isso não acontece: a chave está pinada por SHA nas
actions que a recebem (`appleboy/scp-action`/`appleboy/ssh-action`, achado
P-11) e vive só em `secrets.VPS_SSH_KEY`, nunca em log (as actions mascaram o
valor). **Esforço:** G (rota 1) ou GG (rota 2). **Dono:** você.

## F-2 · Sandboxing do CodePlayground, se ele voltar

**Achado P-16 (auditoria de 11/ago/2026).** `CodePlayground.tsx` (editor +
runtime de código client-side — Python via Pyodide, TS/JS via esbuild-wasm)
foi quarentenado em `frontend/drafts/` em 12/ago/2026: zero importadores
ativos em `src/`, e o componente roda `new Function(...)` sobre código não
confiável carregando runtimes de CDNs (`cdn.jsdelivr.net`, `esm.sh`) que não
estão na CSP declarada. Está fora do caminho de build (`tsconfig.json`
exclui `drafts/`) e travado por
`frontend/scripts/check-no-code-execution-cdns.mjs`, que falha o build se
qualquer chunk de produção voltar a referenciar essas URLs.

**Antes de religá-lo** (trazer de volta para `src/components/article/` e
importar em algum módulo): sandboxing real é pré-requisito, não polimento.
Mínimo:
1. Isolar em `<iframe>` com `sandbox` attribute + CSP própria (não a do
   site) — o runtime de execução de código não pode compartilhar o mesmo
   `document`/origin do resto da página.
2. Declarar os hosts de CDN necessários (`cdn.jsdelivr.net`, `esm.sh`) SÓ na
   CSP do iframe, nunca na CSP raiz do site (`next.config.ts`).
3. Atualizar `check-no-code-execution-cdns.mjs` pra permitir as URLs
   especificamente dentro do chunk do iframe sandboxed, mantendo o gate para
   qualquer OUTRO chunk.

**Esforço:** M. **Dono:** quem decidir trazer o playground de volta.

## F-3 · Reescrever os distratores que entregam o gabarito pelo comprimento

**Achado da auditoria pedagógica de 12/ago/2026, corrigido só na METADE.**
Medido sobre os 1.472 quizzes dos seeds: a alternativa correta era a mais
longa em 93,4% dos casos (135 caracteres de média contra 51 dos distratores)
— "marque sempre a mais longa" acertava ~93% sem ler o enunciado. Causa
redacional: a correta carrega o mecanismo embutido ("...porque o custo cresce
com o quadrado da conversa, não linearmente"), o distrator é frase nominal de
quatro palavras.

**O que FOI corrigido na mesma rodada:** o vazamento por POSIÇÃO (92,6% das
corretas no índice 1) — `scripts/corrigir_gabarito_quiz.py`, determinístico e
idempotente, redistribuiu para 23,8–26,3% por índice. E a recuperação deixou
de estar 100% massada no fim — `scripts/distribuir_quiz_no_meio.py`. Os dois
têm gate (`validate_quiz_respondivel.py`, `validate_recuperacao_distribuida.py`).

**O que NÃO foi corrigido, e por quê:** o vazamento por COMPRIMENTO continua
em 93,4% — `validate_quiz_respondivel.py` trava esse número como RATCHET
(`TETO_MAIS_LONGA`), não como meta zero, de propósito. Diferente do
vazamento de posição (mecanicamente corrigível por um script determinístico
sem tocar o SENTIDO de nenhuma opção), o de comprimento exige reescrever
**4.416 distratores** (3 por quiz × 1.472 quizzes) um a um — julgar se cada
distrator é uma concepção errada plausível de verdade (a regra 2 do
PADRAO_ENSINO.md exige isso: "o distrator tem que ser a concepção errada que
existe de verdade") não é uma transformação mecânica, é redação técnica.

Por que não tentei fazer as 4.416 nesta rodada: a própria base já documentou
o risco de fazer autoria em escala sem supervisão por item — ver
`feedback_escala_degrada_voz` na memória do projeto: callout `danger` foi de
2-3 exemplos manuais para 4-8 em autoria paralela, e a dimensão que degradou
foi voz e precisão, não só volume. Reescrever milhares de distratores por
regex ou por um passe automatizado sem revisão por questão arriscaria trocar
um defeito medível (comprimento) por um pior e invisível (distrator tecnicamente
errado, ou que não testa mais a concepção equivocada real).

**Caminho recomendado, se for atacar:** amostrar por trilha (as piores, por
`explen` curto e por trata-distrator baixo, já saíram nomeadas na auditoria
— `sd-*` e `bedrock-*` piores que `lab-*`), reescrever em lotes pequenos com
revisão humana ou de IA por item, medir com `validate_quiz_respondivel.py
--verbose` a cada lote, e descer `TETO_MAIS_LONGA` só quando o número cair de
verdade — mesma disciplina de ratchet do resto da base.

**Esforço:** GG (4.416 itens, trabalho de redação, não de script).
**Dono:** quem for revisar quiz por quiz.

## F-4 · Os 48 blocos JSON que ainda não fazem parse

**Achado da mesma auditoria, corrigido em 2 de 3 partes.** 97 de 158 blocos
`code_block` com `language: "json"` não faziam `JSON.parse` — a maioria com
`// comentário` antes do JSON, formato inválido em JSON estrito. Quem copia
o bloco pra testar recebe erro de sintaxe na primeira tentativa.

**Corrigido:** `scripts/corrigir_json_comentado.py` consertou os 47 casos do
padrão seguro — comentário-cabeçalho isolado, resto é JSON válido. O
comentário virou `filename` (se tinha cara de nome de arquivo) ou um
parágrafo antes do bloco. Idempotente, verificado.

**Restam 48, sem correção mecânica segura**, por tipo (medido em 12/ago/2026):
- **~22 com comentário INLINE** no meio do JSON (`"campo": "valor",  // nota`)
  — remover por regex arriscaria cortar `//` dentro de uma URL
  (`"https://..."`) que está DENTRO de uma string JSON válida.
- **~26 "outros"** — trechos concatenados no mesmo bloco (duas respostas de
  API, ou um "antes" e um "depois" no mesmo `code_block`), ou variações que
  o script de correção não reconheceu com segurança.

Travado por `scripts/validate_json_code_valido.py` (ratchet, teto 48) — o
teto só desce, e desce quando alguém corrigir um bloco de verdade, não por
regex.

**Caminho recomendado:** `python3 scripts/validate_json_code_valido.py
--strict` lista os 48 pelo slug e id do bloco. Pra cada um: se for comentário
inline, mover a nota pra fora do JSON (parágrafo, ou comentário de qual campo
explica — case a case, olhando se o texto some algo importante). Se for
concatenação de dois trechos, considerar separar em dois `code_block`.

**Esforço:** P/M (48 itens, a maioria é mover uma linha de comentário pra
fora — mas cada um precisa de leitura, não é mecânico).
**Dono:** quem for revisar bloco por bloco.

---

# Ordem de execução recomendada

```
AGORA (só você)          D-1 DNS+SSL ─┬─→ deploy liga → migration 044 roda
                         E-1 privacidade ┘   → o público finalmente vê o trabalho

CONTEÚDO (maior retorno) A-3 os 63 módulos restantes  ← fecha os 7 hubs
                         A-4 diagramas: System Design e API Claude primeiro
                         A-6 capstones de certificação

CÓDIGO (independente)    B-1 split do curriculum.ts
                         B-4 a11y nas 8 rotas
                         C-2 revalidatePath · C-3 score no DTO
                         B-5 e B-7 conforme decisão

QUANDO DECIDIR           E-3 → destrava A-7
                         E-4 → ajusta exclusão de conta e /privacidade
                         E-2 → antes de divulgação em escala
```

**Por que A-3 antes de A-4:** quiz gera carta de SM-2 e alimenta o mecanismo
central da escola; diagrama melhora a explicação de um módulo específico. O
primeiro tem efeito composto, o segundo é local.

---

# Como revalidar

```bash
# os 7 gates de conteúdo — todos no CI
python3 scripts/validate_bedrock_blocks.py                 # 426 arquivos, 13.049 blocos
python3 scripts/validate_cobertura_quiz.py --strict        # 1.283 quizzes, 427/427 módulos
python3 scripts/validate_cobertura_diagramas.py --strict   # 206 módulos com diagrama (48%)
python3 scripts/validate_cobertura_servicos.py
python3 scripts/validate_servicos_diagrama.py              # ícone no fallback + selo VPC falso
python3 scripts/validate_primitives_render.py              # 0 conteúdo escrito invisível
node scripts/check-curriculum-seed-drift.mjs --strict      # 426/426, zero 404

# suíte
cd frontend && npm test && npx tsc --noEmit && npm run lint
cd backend && go build ./... && make test-unit && make test-contract
cd backend && go test ./test/integration/... -tags integration -timeout 180s   # requer Docker

# o manifesto é GERADO e commitado — regenere após mexer em seed
cd scripts/import-blocks && npx tsx src/extract-curriculum.ts
```

**Cobertura por hub, sem escrever laço novo:** `content-manifest.json` traz
`porTrilha[trailId] = {modulos, diagramas, quizzes}`, derivado dos seeds. É a fonte
dos números da home e da medição de cobertura.

---

# Quatro lições que este projeto já pagou caro

Estão aqui porque cada uma custou um defeito real, e cada uma volta a acontecer se
ninguém as tiver em mente ao trabalhar nas tarefas acima.

**1. Gate que verifica se o bloco é VÁLIDO não verifica se ele tem CONTEÚDO.**
Foram 1.300+ campos escritos por autor que nenhuma página mostrava, em 100+
módulos — porque os adapters achatavam o dado antes de entregar aos primitives.
Nada quebrava. `validate_primitives_render.py` existe por isso.

**2. Teste verde não prova que a feature existe para o usuário.** O
`TrailCompletionModal` tinha 315 linhas, teste de render passando e nenhum gatilho
— terminar uma trilha inteira não produzia marcação de fim. O mesmo padrão apareceu
num `it.skip` que documentava um problema já corrigido e ninguém revisitou.

**3. A forma de um bloco vem do ADAPTER, não do schema declarado.** Seis schemas
Zod descreviam formas que nada consumia, e escrever contra eles renderizava caixa
vazia sem erro. Já foram corrigidos e registrados — mas ao criar bloco de tipo novo,
abra o adapter em `BlockRenderer.tsx` antes.

**4. Fallback silencioso é defeito com prazo indeterminado.** `serviceDef()`
devolve um cubo cinza para qualquer chave desconhecida — sensato, porque evita
quebrar a página. O efeito colateral é que erro de digitação não produz sintoma
algum: nem no build, nem no teste, nem no log. Foram 148 nós renderizando na cor
errada, e a descoberta veio por acidente, ao escrever um diagrama novo. Todo
fallback que existe para não quebrar precisa de um gate que o denuncie, senão ele
deixa de ser rede de segurança e vira o comportamento normal.

---

**Manutenção deste documento:** ao concluir uma tarefa, mova-a para o
`PLANO_MESTRE_PENDENCIAS_2026-08.md` com data e commit — não apague. Tarefa que sai
sem rastro é tarefa que alguém redescobre daqui a seis meses.
