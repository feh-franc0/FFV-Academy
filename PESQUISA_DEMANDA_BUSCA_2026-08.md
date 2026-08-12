# Pesquisa de demanda de busca e plano de captação — ago/2026

> **O que é este documento.** O levantamento do que as pessoas realmente procuram
> sobre IA, engenharia e certificação; o cruzamento disso com os 415 módulos que a
> plataforma tem; e o plano de crescer pela lacuna.
>
> **Corpus completo:** [`docs/seo/CORPUS_10K_CONSULTAS.md`](./docs/seo/CORPUS_10K_CONSULTAS.md)
> (10.000 consultas) · [`docs/seo/corpus-10k.csv`](./docs/seo/corpus-10k.csv) (para máquina)
> · gerador: `python3 scripts/seo/gerar_corpus.py`
>
> **O que vem depois deste documento:**
> [`ESTRATEGIA_SEO_ORGANICO_2026-08.md`](./ESTRATEGIA_SEO_ORGANICO_2026-08.md) —
> os quatro formatos de captação, o contrato de resposta citável, o grafo de link
> interno, a medição e a fila em ordem de retorno.
>
> **Contexto anterior:** a auditoria de SEO e visibilidade em IA está em
> [`PENDENCIAS.md`](./PENDENCIAS.md) (seção de 05/ago/2026). Este documento é o
> passo seguinte: lá era "a página está declarando o que é?"; aqui é "a
> plataforma tem o que as pessoas procuram?".

---

## Resumo da decisão

Três coisas mudaram de status com a pesquisa:

1. **A plataforma é forte em profundidade e cega em três assuntos.** Dos 21 temas
   de demanda, 18 têm 23–87 módulos ensinando. Três têm quase nada:
   **busca com IA (GEO/AEO)**, **conformidade e regulação de IA** e **carreira de
   IA no Brasil** — e os três estão entre os de maior intenção de quem decide
   estudar. A carreira de engenheiro de IA é o **nº 1 do ranking de Empregos em
   Alta 2026 do LinkedIn no Brasil**, e a plataforma tem dois módulos que
   tangenciam o assunto.

2. **Dois formatos existem como caso isolado, não como sistema.** Comparação e
   definição são os dois arquétipos que o buscador de IA gera por conta própria ao
   decompor uma consulta. A plataforma tem **uma** página de comparação
   (`/claude-code-vs-cursor`, e é boa) para **107 pares** que valem página. E tem
   um glossário de **44 termos numa única URL** — que não posiciona para 44
   consultas distintas de "o que é X", porque uma URL tem um assunto. O corpus
   tem 1.497 consultas de definição.

3. **Classificação por hub e trilha não é classificação por assunto.** Hub e
   trilha respondem "onde estou na jornada". Busca não pergunta isso. Quem procura
   "como medir alucinação em produção" não procura por hub — procura por tema, e
   tema é um eixo que atravessa trilhas. É a classificação que falta.

O plano está em [Ondas](#ondas-de-execução), e a primeira não escreve conteúdo
nenhum: cria a taxonomia de temas e as 21 páginas de tema. É a que habilita medir
tudo o que vem depois.

---

## Método — e onde ele não alcança

### O que eu não tinha

**Não existe API pública de volume de busca.** Sem Keyword Planner, Semrush ou
Ahrefs autenticados, não há como afirmar "esta pergunta tem N buscas/mês em
português". Qualquer número desse tipo neste documento seria inventado.

E a pesquisa mostrou que a ferramenta também não resolveria o problema:

> **65% a 85% dos prompts feitos a assistentes de IA não têm correspondência em
> base de palavra-chave nenhuma.**
> — Semrush, sobre 126 milhões de prompts de busca por IA

Ou seja: a demanda que mais cresce é exatamente a que ferramenta de keyword não
mede. Comprar acesso a uma resolveria a metade que já está madura e continuaria
cega para a outra.

### O que a pesquisa dá com solidez

A **estrutura** da demanda, que é mais estável que o volume:

| Achado | Número | Fonte |
|---|---|---|
| Consulta com 8+ palavras aciona resumo de IA | **7× mais** que consulta curta | WordStream 2026 |
| Faixa de maior incidência de resumo | **6–10 palavras** | Neil Patel |
| Consulta de 1 palavra aciona resumo | 27,3% das vezes | idem |
| Consulta que começa com palavra interrogativa recebe resumo | **60%** | Pew Research |
| Uma consulta em AI Mode vira quantas sub-consultas | **8 a 12**, em paralelo | iPullRank / NoGood |
| Resumo de IA presente nas buscas | **48%** | 2026 |
| Queda de cliques quando o resumo aparece | **−15,5%** | Semrush |
| Fontes citadas por resposta do ChatGPT | ~15 | Semrush |
| Presença em 1 de 5 arquétipos de prompt | **penalizada até 3 de 5** | Semrush + Kevin Indig, 1.094 categorias |

O achado que mais muda o plano é o **query fan-out**. O buscador de IA não
procura a consulta que o usuário digitou: ele a decompõe em 8–12 sub-consultas
paralelas, e os prompts que geram essas sub-consultas incluem literalmente
*"gere variações comparativas desta consulta"* e *"que perguntas implícitas este
usuário pode ter?"*.

Consequência direta: **não se captura um assunto com uma página**. Captura-se
cobrindo a superfície de sub-consultas que o assunto gera. É o oposto da tática
de "uma página perfeita por palavra-chave".

E o segundo achado, do estudo de 1.094 categorias: quem aparece em **1 de 5**
arquétipos de prompt de uma categoria carrega uma penalidade de menção que só
desaparece ao chegar a **3 de 5**. Cobertura rasa não vira presença — vira nada.

### Como o corpus foi construído

Cruzamento de **entidade real × arquétipo real**:

- **Entidades:** 1.518 extraídas das `keywords` que o autor já escreveu em cada um
  dos 415 módulos — o vocabulário da própria plataforma — mais **60 entidades
  externas** com demanda medida ou documentada em fonte, mais **107 pares de
  comparação** curados à mão.
- **Arquétipos:** 12 moldes de pergunta. Os cinco centrais são os que o estudo de
  1.094 categorias usa por categoria (definição, comparação, alternativa, caso de
  uso, decisão); os outros vêm dos dados de busca clássica — "how" é 51% das
  consultas do top 100, e diagnóstico e custo são a maior fatia da cauda longa em
  tema técnico.
- **Geradas:** 19.991. **Selecionadas: 10.000.**

O corte não é por prioridade global, e a razão é o achado de 3-de-5: um corte por
prioridade levaria 3.141 perguntas de "como implementar" e 12 de "quanto custa" —
exatamente o erro que o estudo descreve. O corte é **estratificado**: cada
entidade entra com sua melhor pergunta antes de qualquer entidade entrar com a
segunda.

### O rótulo de origem — a parte honesta

Cada uma das 10.000 linhas diz de onde veio:

| Origem | Significa | Quantas |
|---|---|---|
| **V** | entidade com **volume publicado** na fonte citada | 107 |
| **P** | **padrão de consulta documentado** em fonte (PAA, fan-out, estudo de arquétipo) | 583 |
| **D** | **derivada** por expansão sistemática | 9.310 |

`D` não é chute: é a mesma expansão de cauda longa que uma ferramenta de
palavra-chave faz para sugerir termo. O que ela **não tem é volume medido**, e o
corpus diz isso em vez de fingir número.

**Os volumes citados em `V` são os publicados para a consulta em inglês (base
americana).** Não são previsão de volume em português. Servem para ordenar o que
importa, não para prometer tráfego — o multiplicador PT-BR/EN varia demais por
termo para eu inventar um.

### Perfil do corpus

- **63%** das consultas têm 6+ palavras — a faixa que mais aciona resumo de IA
- **380** (3%) não têm nenhum módulo que responda — a fila de conteúdo
- Intenção: 3.257 informacional · 3.974 comercial-investigativa · 2.769 transacional

---

## Onde a plataforma está forte, e onde está cega

Os 21 temas, com a demanda medida no corpus e quantos módulos ensinam o assunto:

| Tema | Consultas | Módulos | Situação |
|---|---:|---:|---|
| Dados e engenharia de dados | 1.093 | 87 | ✅ |
| Agentes e orquestração | 1.060 | 78 | ✅ |
| Modelos por dentro | 746 | 72 | ✅ |
| RAG e retrieval | 735 | 43 | ✅ |
| Serviços AWS | 731 | 79 | ✅ |
| Prompt e engenharia de contexto | 667 | 79 | ✅ |
| Fundamentos de computação | 653 | 62 | ✅ |
| Produção, SRE e observabilidade | 652 | 71 | ✅ |
| Linguagens | 608 | 49 | ✅ |
| Avaliação e evals | 493 | 44 | ✅ |
| Segurança de IA | 486 | 31 | ✅ |
| Custo e FinOps | 482 | 75 | ✅ |
| Claude Code | 389 | 36 | ✅ |
| Certificação | 340 | 25 | ✅ |
| Arquitetura e system design | 227 | 30 | ✅ |
| **Ferramentas de IA do mercado** | 200 | 23 | 🟡 disperso entre trilhas |
| API e SDK do Claude | 179 | 51 | ✅ |
| Amazon Bedrock | 81 | 42 | ✅ |
| **Conformidade e regulação de IA** | 75 | **3** | 🟡 no limiar |
| **Busca com IA e visibilidade (GEO/AEO)** | 59 | **0** | 🔴 |
| **Carreira e mercado** | 44 | **2** | 🔴 |

A coluna **Módulos** é a contagem **depois** de remover os falsos positivos do
classificador. Antes deles, a tabela dizia 5 para conformidade, 10 para carreira e
1 para busca com IA — e é essa diferença que o próximo trecho explica.

### Os três buracos, medidos de perto

O classificador de tema casa texto de título, descrição e palavras-chave. Ele
acerta na maioria e erra de um jeito específico: uma palavra do padrão aparece em
outro sentido. Inspecionar **qual termo** casou é o que separa cobertura de
aparência de cobertura.

**Busca com IA (GEO/AEO) — o único casamento era acidente.** `dns-cdn-edge`, pela
palavra "geo" em roteamento geográfico de DNS. **Cobertura real: zero.** A
plataforma acabou de fazer o trabalho — auditoria de dados
estruturados, `llms.txt`, robots para agentes de IA, decisão documentada de não
marcar FAQPage — e **não ensina nada disso**. É o caso mais claro de ativo
subaproveitado que a pesquisa encontrou.

**Conformidade e regulação — de 5 para 3.** `ai-safety-introducao` menciona o AI
Act, `aif-security-governance` menciona LGPD e `governance-compliance-sap` trata de
governança AWS. Saíram dois que casaram por "compliance" em contexto de
armazenamento e de retenção de log. Fica exatamente no limiar de publicação — e não
existe módulo sobre PL 2338, sobre alcance extraterritorial do AI Act, nem sobre a
pergunta corporativa nº 1: *"posso mandar dado de cliente para a API?"*.

**Carreira — de 10 para 2.** Sobraram `capstone-sd-mock-interview` e
`sd-framework-completo`, os dois sobre entrevista. Saíram oito que casaram por
"portfolio" (de custos AWS), "mercado" (de contexto) e "roadmap" (de produto).
Enquanto isso:

| Dado do mercado brasileiro | Número |
|---|---|
| Engenheiro de IA no ranking Empregos em Alta 2026 (LinkedIn Brasil) | **nº 1** |
| Faixa salarial no Brasil | R$ 8 mil – R$ 32 mil/mês |
| Prêmio salarial de vaga que exige alguma habilidade de IA | **+28%** |
| Vagas de estágio que já mencionam IA (mar/2026) | 10,3% |
| Habilidade mais desejada: domínio de ferramentas de IA | 52% |
| Análise de dados com IA | 44,6% |
| Engenharia de prompt | 43% |
| Crescimento anual de matrícula em curso de IA (Coursera) | **+866%** |
| Maior obstáculo apontado na formação: **excesso de teoria** | 27,6% |
| Segundo obstáculo: **conteúdo superficial** | 23,4% |

Os dois obstáculos mais citados — teoria demais e conteúdo raso — são exatamente
o que a plataforma resolve. E ela não tem uma página que fale com quem está
fazendo essa pergunta.

### Demanda externa: 60 entidades verificadas contra o currículo

| Situação | Quantas | Significado |
|---|---:|---|
| ✓ coberto | 29 | o termo aparece como assunto de um módulo |
| ~ só mencionado | 22 | o termo aparece em algum texto, mas não é assunto de nada |
| ✗ ausente | 9 | não aparece em lugar nenhum |

**As 9 ausentes:** `ai overviews`, `llms.txt`, `marco legal da IA`, `dados
sintéticos`, `LlamaIndex`, `n8n`, `blockchain`, `malware`, `phishing`.

**As 22 "só mencionadas"** são a lista mais útil, porque são assuntos que a
plataforma quase tem: `agent memory`, `agent teams`, `computer use`,
`browser agent`, `voice agent`, `model routing`, `semantic caching`,
`token economics`, `small language models`, `on-device AI`,
`detecção de alucinação`, `observabilidade de LLM`, `query fan-out`,
`generative engine optimization`, `answer engine optimization`,
`dados estruturados`, `governança de IA`, `vibe coding`, `agentic AI`,
`engenheiro de IA`, `engenharia de prompt`, `análise de dados com IA`.

Cada um desses é um módulo de 10–14 minutos dentro de uma trilha que já existe.

---

## O que eu deliberadamente NÃO recomendo

Três das nove ausentes têm volume alto e **eu não recomendo cobrir**:

- `blockchain` — 160.000/mês
- `malware` — 170.000/mês
- `phishing` — 290.000/mês

São 620.000 buscas/mês somadas, e estão **fora do eixo** que a plataforma
escolheu em jul/2026 ao estreitar de 10 hubs para o eixo IA/Claude/AWS. Escrever
sobre phishing porque phishing tem volume é a definição de perseguir tráfego, e é
o caminho de volta para "escola de tudo" — que foi abandonado por decisão
consciente, não por falta de volume.

**A exceção que vale:** `prompt injection` já tem módulo, e a analogia com
phishing é pedagogicamente boa — engano do canal de entrada. Cabe como parágrafo
dentro do módulo que existe, não como módulo próprio.

Mesma lógica para `blockchain`: se entrar, entra como contraexemplo em módulo de
arquitetura (por que consenso distribuído custa caro), não como assunto.

Registro isso aqui porque **volume não é argumento suficiente**, e um documento de
SEO que só lista oportunidades empurra o produto para o hype que a plataforma
existe para não ser.

---

## Três classificações novas

### 1. Tema — o eixo de assunto (21 valores)

Hub e trilha são hierarquia de **ensino**: onde o aluno está na jornada, em que
ordem estudar. Tema é eixo de **assunto**, e é o que a busca usa.

Um módulo tem 1 hub, 1 trilha e **N temas**. `bedrock-guardrails-seguranca-ia`
pertence à trilha de Bedrock e aos temas `bedrock`, `seguranca-ia` e
`conformidade-ia` — três portas de entrada de busca para a mesma aula.

Os 21 temas estão em `scripts/seo/gerar_corpus.py` (lista `TEMAS`), cada um com os
padrões que o definem.

Por que isto importa para captação: habilita **21 páginas de tema** com
`ItemList` de módulos, que é a unidade que o estudo de topicalidade mede — o jogo
é por tópico, não por página.

### 2. Arquétipo de página — o formato responde ao tipo de pergunta

Hoje existe uma forma de conteúdo: o módulo. Os arquétipos que ele atende bem:

| Arquétipo | Atendido hoje? | Formato adequado |
|---|---|---|
| Funcionamento — "como funciona por dentro" | ✅ módulo | módulo |
| Implementação — "como fazer" | ✅ módulo | módulo |
| Diagnóstico — "erro X" | 🟡 parcial | módulo + FAQ |
| Decisão — "quando usar" | 🟡 parcial | módulo + FAQ |
| **Definição — "o que é X"** | 🟡 44 termos em **1 URL** | verbete com URL própria |
| **Comparação — "X ou Y"** | 🟡 **1 página** de 107 pares | página de comparação |
| Pergunta aberta — cauda longa | 🟡 30 de 415 módulos | seção `Perguntas frequentes` |

Definição e comparação são os dois arquétipos que o fan-out **gera sozinho** a
partir de qualquer consulta — e são justamente os dois em que a plataforma tem
prova de conceito sem sistema. `/claude-code-vs-cursor` mostra que o formato
funciona e que o time sabe fazê-lo; existe uma dele. O glossário existe com 44
verbetes, sem URL por termo e sem link para o módulo que ensina, o que o torna
uma página de consulta interna, não uma superfície de captação.

Também existem duas landings de aquisição (`/melhores-ferramentas-ia-codigo-2026`,
`/ferramentas-ia-codigo`) em formato de lista. São o mesmo padrão: acerto pontual,
sem sistema por trás.

### 3. Intenção — para onde a página leva

| Intenção | Consultas | Destino |
|---|---:|---|
| informacional | 3.257 | módulo → trilha → conta (XP, streak) |
| comercial-investigativa | 3.974 | comparação → módulo → simulado |
| transacional | 2.769 | passo a passo → simulado / conta |

Classificar por intenção é o que evita a página informacional terminar sem
destino e a comercial terminar sem prova. Hoje todo módulo termina igual.

---

## Conteúdo novo proposto

### Trilha nova 1 — Visibilidade em busca com IA (GEO/AEO) · 10 módulos

**Por que primeiro:** cobertura zero, demanda em crescimento, **zero concorrência
séria em PT-BR**, e a plataforma tem o caso real — acabou de fazer a auditoria,
com os erros documentados. É conteúdo que ninguém consegue copiar sem ter feito o
trabalho.

| # | Módulo | O que ensina |
|---|---|---|
| 1 | Como a busca virou resposta | AI Overviews em 48% das buscas; −15,5% de cliques; o que isso muda |
| 2 | Query fan-out: uma consulta, doze | decomposição em 8–12 sub-consultas; por que uma página não captura um assunto |
| 3 | Os cinco arquétipos de pergunta | definição, comparação, alternativa, caso de uso, decisão; a regra de 3 de 5 |
| 4 | Dados estruturados que existem (e os que não) | Article, BreadcrumbList, Quiz, Course; **por que não existe schema de resumo de IA** |
| 5 | FAQPage e o cemitério de recursos | removido em maio/2026; como decidir marcação por evidência, não por blog |
| 6 | Cabeçalho é pergunta, resposta vem antes do contexto | a inversão que faz o trecho ser citável |
| 7 | `llms.txt`, robots e agentes de IA | ~10% de adoção; o que ele é e o que ele não é |
| 8 | Medir visibilidade em IA | conjunto fixo de prompts, taxa de citação, tráfego por referenciador |
| 9 | Auditoria de uma plataforma real | os seis defeitos encontrados na FFV Academy, um a um |
| 10 | Simulado: 15 questões de GEO/AEO | fecha a trilha |

### Trilha nova 2 — Conformidade e governança de IA · 8 módulos

**Por que:** demanda corporativa, específica do Brasil, e o tipo de assunto em que
conteúdo raso é a norma — ou seja, onde profundidade rende.

| # | Módulo |
|---|---|
| 1 | LGPD para quem constrói com IA: o que muda quando o dado vai para um modelo |
| 2 | Posso mandar dado de cliente para a API? — o fluxo de decisão |
| 3 | PL 2338 e o marco legal brasileiro: o que já vale e o que está em jogo |
| 4 | EU AI Act: por que alcança empresa brasileira |
| 5 | Classificação de risco e o que ela obriga na prática |
| 6 | Governança de IA: comitê, política de uso e registro de decisão |
| 7 | Rastro de auditoria de agente: o que logar, por quanto tempo, com que retenção |
| 8 | Simulado: 12 questões de conformidade |

### Trilha nova 3 — Carreira de engenharia de IA no Brasil · 8 módulos

**Por que:** nº 1 do LinkedIn, 2 módulos reais hoje, e é a trilha de maior
intenção de conversão do corpus inteiro. Os dois obstáculos mais citados na
formação são teoria demais e conteúdo raso — o argumento da plataforma.

| # | Módulo |
|---|---|
| 1 | O que um engenheiro de IA faz, de verdade (e o que não é o trabalho) |
| 2 | Engenheiro de IA, de ML e cientista de dados: três papéis, três rotinas |
| 3 | Faixas salariais e o prêmio de +28% — o que sustenta o número |
| 4 | Roadmap de 6 meses: o que aprender, em que ordem, e o que ignorar |
| 5 | Portfólio que passa por triagem técnica: três projetos e o que provam |
| 6 | Entrevista de system design com IA: agente, custo, avaliação |
| 7 | Certificação ou projeto: onde cada uma pesa |
| 8 | Primeiros 90 dias em vaga de IA |

### Módulos novos em trilhas existentes · 14

Um por entidade "só mencionada", dentro da trilha que já é dona do assunto:

| Módulo | Trilha |
|---|---|
| Memória de agente: o que persistir e o que descartar | Agents |
| Times de agentes: quando coordenar e quando não | Agents |
| Computer use: agente que opera interface | Agents |
| Agente de navegador em produção | Agents |
| Agente de voz: latência como requisito de projeto | Agents |
| Roteamento de modelo por tarefa e por custo | FinOps de IA |
| Cache semântico: quando o quase-igual serve | FinOps de IA |
| Token economics: custo por token como métrica de produto | FinOps de IA |
| Modelos pequenos: quando o grande é desperdício | Modelos por dentro |
| IA no dispositivo: privacidade como arquitetura | Modelos por dentro |
| Dados sintéticos para treino e avaliação | Evals |
| Detectar alucinação em produção | Evals |
| Observabilidade de LLM: trace, span e o que medir | SRE para IA |
| LlamaIndex, LangGraph e código próprio: o que cada um resolve | RAG |

**Total: 40 módulos novos** (26 em trilhas novas + 14 em existentes).

---

## Formatos novos de página

### `/temas/<tema>` — 21 páginas · esforço baixo · impacto alto

Página de tema com descrição, módulos agrupados por trilha, perguntas frequentes
do tema (do corpus) e `ItemList` de `Course` em JSON-LD. **Nenhum conteúdo novo** —
é reorganização do que existe, e é a unidade que o estudo de topicalidade mede.

Requer: campo `temas: TemaId[]` no tipo `Module`, uma rota, e o gerador de índice
por tema.

### Comparações — 106 páginas novas · esforço médio · impacto alto

**O molde já existe e é bom.** `/claude-code-vs-cursor` tem tabela de decisão,
"quem ganha" por linha, metadados e canônica. O que falta é repetir isso para os
outros **106 pares** curados em `PARES_CURADOS` (`scripts/seo/gerar_corpus.py`).

Duas decisões a tomar antes de escalar:

1. **Rota.** A existente é `/claude-code-vs-cursor` na raiz. Para 107, o prefixo
   `/vs/<a>-vs-<b>` agrupa e permite página-índice com `ItemList`; a raiz fica
   plana e sem índice. Recomendo migrar a existente para o prefixo com
   redirecionamento permanente — 30 dias de posição valem menos que uma estrutura
   que aguenta 107.
2. **Dado, não página.** A existente é JSX escrito à mão. Para 107, o par vira
   dado (`{a, b, linhas[], cenarios[], recomendacao}`) e a página é um molde. Sem
   isso, a 20ª divergem em formato e nenhuma checagem consegue verificar.

Regra de qualidade: **comparação sem recomendação é página inútil** — cada uma
termina dizendo qual escolher e sob que condição. A existente já faz isso na linha
"Quem ganha".

### `/glossario/<termo>` — de 44 para ~200 verbetes, cada um com URL

`/glossario` existe: 44 termos, busca no cliente, uma única URL. Duas mudanças:

1. **URL por termo.** `/glossario/<termo>` com o verbete, o "quando importa" e
   **link para o módulo que ensina** — que hoje não existe em nenhuma entrada. A
   página-índice continua, agora linkando para os verbetes.
2. **De 44 para ~200 termos**, priorizados pelas 1.497 consultas de `definicao` do
   corpus.

**Risco a controlar:** verbete raso é conteúdo raso, e 200 páginas rasas são pior
que 44 boas numa página. Mitigação: só entra termo com módulo para linkar e com
mínimo de 600 caracteres — o limiar que `validate_substancia.py` já aplica a
módulo. O campo `long?` do tipo `GlossaryEntry` já existe e está quase sempre
vazio; ele é onde isso vai.

### `Perguntas frequentes` nos 385 módulos restantes

O mecanismo existe (bloco `qa_item`, pergunta em `<h3>`), e **30 dos 415** módulos
têm a seção.
O que faltava era a fonte das perguntas: agora são as 10.000 do corpus, já
atribuídas a módulo dono.

---

## Ondas de execução

| Onda | O que | Esforço | Por que nesta ordem |
|---|---|---|---|
| ~~**1**~~ | ~~Taxonomia de temas + páginas `/temas`~~ — **feito em 05/ago/2026**, ver abaixo | baixo | Zero conteúdo novo. Habilita medição por tema, que é como o resto será avaliado. |
| **2** | Trilha de GEO/AEO (10 módulos) | médio | Cobertura zero, concorrência zero em PT-BR, e a plataforma já viveu o caso. |
| **3** | 106 comparações novas (o molde já existe) | médio | Arquétipo que o fan-out gera sozinho, com prova de conceito no repositório. Reusa módulos existentes. |
| **4** | `Perguntas frequentes` nos módulos, por trilha | alto | Agora tem fonte. É trabalho por módulo — não automatizável sem cair em texto genérico. |
| **5** | Trilha de carreira (8) + conformidade (8) | médio | Maior intenção de conversão, mas exige pesquisa de dado brasileiro atualizado. |
| **6** | 14 módulos em trilhas existentes | médio | Fecha as entidades "só mencionadas". |
| **7** | Glossário (~200 verbetes) | médio | Último de propósito: é o mais próximo da fronteira de conteúdo raso. |

---

## Onda 1 — o que já está no ar

Implementado em 05/ago/2026, sem escrever conteúdo novo.

### A classificação

`frontend/src/lib/curriculum/temas.ts` — os 21 temas com nome, tagline, descrição,
ícone e cor. `temas-mapa.ts` é **gerado** por `scripts/seo/gerar_corpus.py`: **982
atribuições** módulo → tema, derivadas do texto de cada módulo.

Falso positivo se corrige em `EXCECOES_TEMA`, no gerador, com o termo que casou
escrito na linha. As **11 remoções** de hoje são as descritas acima ("geo" de DNS,
"portfolio" de custos AWS, "compliance" de armazenamento). O gerador **falha** se
uma exceção aponta para slug ou tema inexistente, ou para um par que já não
existe — exceção esquecida deixa de proteger e ninguém percebe.

O caminho inverso, `ADICOES_TEMA`, existe e está vazio. A única lacuna que havia
— `ml-mental-model` ficaria sem tema nenhum depois de remover o falso positivo de
carreira — foi resolvida onde devia: ML clássico virou padrão de
`modelos-internals`, porque o caso não era único. Quem pegou foi o teste
`todo módulo com conteúdo tem pelo menos um tema`.

### As páginas

- **`/temas`** — os 21 temas. Os publicados linkam; os que estão abaixo do limiar
  aparecem numa seção **"Em produção"**, com a contagem à vista. A lacuna fica
  visível no produto em vez de escondida num documento.
- **`/temas/<tema>`** — **19 páginas** pré-renderizadas. Módulos agrupados por
  trilha de origem, `CollectionPage` + `ItemList` com os módulos e
  `BreadcrumbList` em JSON-LD.
- **Chips de tema nos 415 módulos** — cada módulo passa a linkar para os temas a
  que pertence. É o que dá ao assunto uma URL que a busca associa ao conjunto, em
  vez de a 415 artigos soltos.

### O limiar, e por que ele existe

`MINIMO_PARA_PAGINA = 3`. Tema com menos de três módulos **não ganha página** — o
número vem do achado de 3-de-5: dois módulos não sustentam três arquétipos, e
página fina não é neutra, dilui o resto do domínio.

Dois temas ficam de fora hoje: **busca com IA (0)** e **carreira (2)**.
Conformidade ficou com exatamente 3 — publicável e rasa. Os três são o alvo das
ondas 2 e 5.

### Travado por teste

- `src/tests/unit/temas.test.ts` — 15 casos. Os que mais importam: todo slug do
  mapa existe no currículo (mapa gerado apodrece quando módulo é renomeado), todo
  módulo com conteúdo tem ao menos um tema, e a ordem do currículo é preservada.
- **Nona checagem da varredura** — as 19 páginas de tema pelo HTML servido:
  `CollectionPage` presente, `numberOfItems` igual ao tamanho da lista, link para
  módulo no HTML, nenhum identificador interno na descrição. Mais a comparação
  com o **sitemap**: o conjunto anunciado tem de ser exatamente o conjunto
  publicado, nos dois sentidos.

`rotasEstaticas()` da varredura deriva rotas do diretório e **ignora segmento
dinâmico** — sem a checagem nova, as páginas de tema seriam a parte do site que
nenhuma varredura olha.

### Verificação

818 testes passando (15 novos), `tsc` limpo, lint limpo, build com as 19 páginas
pré-renderizadas, varredura com as 8 checagens verdes, 9 gates de conteúdo verdes.

---

## Como saber se funcionou

Sem isto, o plano é fé.

**Métricas externas** (mensal):

1. **Search Console por agrupamento de tema** — impressões e cliques por conjunto
   de consultas, usando os 21 temas como grupos. O número que importa é impressão
   por tema, não posição média.
2. **Tráfego por referenciador de IA** — segmentar `chatgpt.com`,
   `perplexity.ai`, `gemini.google.com`, `claude.ai`. É o único sinal direto de
   citação em resposta de IA disponível sem ferramenta paga.
3. **Conjunto fixo de prompts** — 40 prompts (2 por tema) rodados mensalmente
   contra ChatGPT, Claude e Gemini, registrando se a FFV é citada. Amostra
   pequena, mas é medição repetível e comparável no tempo.

**Métricas internas** (a cada geração de corpus):

4. **Consultas sem dono** — hoje 380 de 10.000. Cai conforme as ondas avançam.
5. **Módulos por tema** — nenhum tema declarado com menos de 8 módulos.
6. **Arquétipos atendidos por tema** — a regra de 3 de 5, contada por formato de
   página existente, não por consulta no corpus.

**Gate proposto:** `validate_corpus_fresco.py`, no mesmo padrão do
`check-curriculum-seed-drift.mjs` — falha quando o currículo mudou e o corpus não
foi regerado. O corpus é derivado de `frontend/src/lib/curriculum/`; sem gate ele
apodrece em silêncio na primeira trilha nova, e um documento de captação
desatualizado é pior que nenhum, porque parece atualizado.

As três primeiras métricas **não** viram gate: dependem de dado externo que muda
por razões alheias ao repositório. Gate sobre número que o time não controla
ensina o time a ignorar gate.

---

## Limites deste levantamento

Registrados para que ninguém os descubra depois como se fossem defeito oculto:

1. **Não há volume de busca em português.** Os 107 rótulos `V` citam volume
   publicado em inglês, base americana. Servem para ordenar prioridade, não para
   prever tráfego.
2. **9.310 das 10.000 consultas são derivadas** (`D`). São plausíveis por
   construção — entidade real × arquétipo documentado —, e nenhuma tem volume
   medido. Antes de virar conteúdo, cada uma passa por juízo humano.
3. **O classificador de tema casa texto.** Ele produz falso positivo, e este
   documento mostra três casos ("geo" em DNS, "portfolio" de custos AWS,
   "compliance" de armazenamento). A contagem de módulos por tema é ponto de
   partida de inspeção, não verdade.
4. **Os 107 pares de comparação são curados por mim.** Refletem o que julgo
   comparação relevante, não demanda medida.
5. **O corte em 10.000 é editorial.** Foram geradas 19.991; o conjunto completo
   fica em `scripts/seo/.dados/corpus-completo.csv` (não versionado) para refazer o
   corte com outro limite.

---

## Fontes

**Volume e comportamento de busca**
- [100 Most Asked Questions on Google (jul/2026) — Ahrefs](https://ahrefs.com/blog/top-google-questions/) — base de 28,7 bi de palavras-chave
- [Top Google Searches (jul/2026) — Ahrefs](https://ahrefs.com/blog/top-google-searches/)
- [Most Searched Keywords — Similarweb](https://www.similarweb.com/blog/marketing/seo/top-keywords/)
- [The 100 Most Googled Questions in 2026 — Glimpse](https://meetglimpse.com/top-searched/most-searched-questions/)
- [150+ Google Search Statistics 2026 — Foursets](https://www.foursets.com/blog/google-search-statistics)

**Resumo de IA e AI Mode**
- [Google AI Overviews in 2026: 48% of Searches — Stacc](https://thestacc.com/blog/google-ai-overview-statistics/)
- [AI Overviews Appear Most on 6–10 Word Queries — Neil Patel](https://neilpatel.com/marketing-stats/ai-overviews-by-query-length/)
- [The 7-Word Rule: Ultra-Long-Tail Keywords in AI Overviews — Averi](https://www.averi.ai/how-to/the-7-word-rule-long-tail-keywords-for-ai-overviews)
- [AI Overviews (SGE) Statistics 2026 — Searchlab](https://searchlab.nl/en/statistics/ai-overviews-sge-statistics-2026)
- [Expanding Queries with Fan-Out — iPullRank](https://ipullrank.com/expanding-queries-with-fanout)
- [Query Fan-Out: AI Search's Most Critical Mechanism — NoGood](https://nogood.io/blog/query-fan-out-guide/)
- [Google AI Mode's Query Fan-Out — Aleyda Solis](https://www.aleydasolis.com/en/ai-search/google-query-fan-out/)

**Estudos de prompt e topicalidade**
- [Semrush 2026 AI Visibility Index — 126 mi de prompts](https://www.semrush.com/news/463141-semrush-releases-expanded-2026-ai-visibility-index-analyzing-126-million-ai-search-prompts/)
- [How topical authority spreads in ChatGPT — Semrush + Kevin Indig](https://www.semrush.com/blog/chatgpt-topical-focus-study/) — 1.094 categorias, 5 prompts cada
- [AI visibility is a topic-level game: 50.000 marcas — Semrush](https://www.semrush.com/blog/chatgpt-topic-authority-study/)
- [Tendências de busca com IA — Semrush (PT)](https://pt.semrush.com/blog/ai-search-trends/)
- [Analysis of Top AI Search Engines — SE Ranking](https://seranking.com/blog/ai-traffic-research-study/)

**Desenvolvedores e ferramentas**
- [Stack Overflow Dev Survey 2026: AI em 84%, confiança em 3% — byteiota](https://byteiota.com/stack-overflow-dev-survey-2026-ai-at-84-trust-at-3/)
- [Closing the developer AI trust gap — Stack Overflow](https://stackoverflow.blog/2026/02/18/closing-the-developer-ai-trust-gap/)
- [MCP Server Statistics 2026 — TechRT](https://techrt.com/mcp-server-statistics/)
- [Choosing between skills, subagents and MCP servers](https://smithhorngroup.substack.com/p/choosing-between-skills-subagents)

**Mercado brasileiro**
- [Engenheiro de IA deve ser o profissional mais procurado no Brasil em 2026 — Fenati](https://fenati.org.br/engenheiro-de-ia-profissional-brasil-2026/)
- [IA no trabalho: profissionais brasileiros querem treinamento além da teoria — Hardware.com.br](https://www.hardware.com.br/noticias/habilidades-ia-profissionais-brasileiros-2026/)
- [Demanda por profissionais com habilidades em IA cresce — Folha BV](https://www.folhabv.com.br/concursos-e-emprego/demanda-por-profissionais-com-habilidades-em-ia-cresce-no-brasil-e-no-mundo)
- [Padrões de busca no Google: o que os brasileiros pesquisaram — Estado de Minas](https://www.em.com.br/trends/2026/04/7394218-padroes-de-busca-no-google-o-que-os-brasileiros-pesquisaram-nos-ultimos-anos.html)

**Certificação AWS**
- [Most In-Demand AWS Certifications 2026 (por dado de vaga) — StudyTech](https://studytech.ai/blog/most-in-demand-aws-certifications-2026)
- [AWS Certifications Updated for 2026 — Spoto](https://cciedump.spoto.net/news/aws-certifications-updated-for-2026-new-exam-paths-and-ai-focus-reshape-cloud-training-in-the-us.html)

**Documentação oficial (usada na auditoria anterior)**
- [Education Q&A structured data — Google](https://developers.google.com/search/docs/appearance/structured-data/education-qa)
- [Course structured data — Google](https://developers.google.com/search/docs/appearance/structured-data/course)
- [FAQPage structured data (descontinuado) — Google](https://developers.google.com/search/docs/appearance/structured-data/faqpage)
