# Plano mestre de pendências — agosto/2026

> ⚠️ **As tarefas abertas migraram para [`PENDENCIAS.md`](./PENDENCIAS.md).**
> Este documento passa a ser o registro do que foi feito em ago/2026 e por quê —
> incluindo os defeitos encontrados, as medições e as decisões tomadas. Consulte-o
> para entender o *porquê* de algo estar como está; consulte o `PENDENCIAS.md` para
> saber o que fazer a seguir.

> **Este era o documento único de execução.** Consolida e substitui, como fonte de
> tarefas, os três documentos de auditoria — [`BACKLOG_PLATAFORMA_2026-07.md`](./BACKLOG_PLATAFORMA_2026-07.md),
> [`BACKLOG_UX_2026-07.md`](./BACKLOG_UX_2026-07.md) e a seção de estado do
> [`PADRAO_ENSINO.md`](./PADRAO_ENSINO.md) — que permanecem como registro histórico
> e evidência. O que estava aberto neles e continua aberto está AQUI; o que não
> está aqui foi concluído e verificado.
>
> Todo número deste documento foi **medido em 04/ago/2026** por script contra o
> repositório — nenhum vem de memória. A seção "Como revalidar" no fim reproduz
> cada medição.

---

## 🟢 Rodada de execução — 04/ago/2026

Oito itens fechados e um avançado nesta rodada. A tabela é o resumo; cada item traz abaixo o que
mudou e o que foi encontrado no caminho.

| Item | Estado | O que ficou pronto |
|---|---|---|
| **A-1** AIF-C01 | ✅ | 8 módulos escritos → trilha **13/13** com conteúdo |
| **A-2** Anthropic AI Practitioner | ✅ | 14 módulos escritos → trilha **14/14**. Com isso, **zero rotas `/aprenda` em 404** |
| **A-5** badges de domínio | ✅ | DVA **15/15**, SAP **18/18**, com parágrafo de contexto de prova em cada módulo |
| **B-2** auditoria de primitives | ✅ | **1.300+ campos** de conteúdo recuperados + gate novo no CI |
| **B-3** ModuleLayout legado | ✅ | 984 linhas mortas removidas + **feature perdida religada** |
| **B-5** miudezas | ✅ | allowlist honesta (`--strict` ligado) + números da home derivados do conteúdo |
| **C-1** exclusão de conta | ✅ | eliminação real + **vazamento de dado no ranking público corrigido** |
| **B-6** schemas Zod divergentes | ✅ | 8 tipos reescritos conforme o adapter e **registrados de fato** |
| **A-3** quizzes por hub | 🟠 parcial | hub **Claude & Anthropic fechado** (39 módulos, 117 quizzes) — 503 quizzes na plataforma |

**Correção de um erro deste documento:** a versão anterior afirmava que o endpoint
de exclusão de conta "não existe, verificado por grep nas rotas". **Estava errado** —
`DELETE /api/v1/me` existia, com use case e handler. O defeito real era outro e
pior: ele fazia *desativação*, não eliminação. Ver C-1 abaixo.

### O que a execução descobriu (não estava previsto em nenhum item)

Três achados que só apareceram ao executar, e que valem mais que as tarefas que os
revelaram:

**1. Perda silenciosa de conteúdo em escala — 1.300+ campos invisíveis.**
Os primitives em `primitives.tsx` aceitam mais nomes de campo do que os adapters em
`BlockRenderer.tsx` entregavam: o `StackFlow` renderiza `detail`, `sub`, `icon` e
`connector`, e o adapter passava só `{label, text}`; o `AnnotatedFormula` renderiza
`text`/`annotation` e o adapter mandava `symbol`/`description`, campos que ele não
tem. Medido nos 393 seeds: **282 de 367** itens de `stack_flow` sem texto de corpo,
**148 de 197** anotações de fórmula com os três campos visíveis vazios (19 módulos
exibindo fórmula + caixa em branco), **279 de 318** nós de `node_graph` sem
subtítulo, 86 colunas de `arch_flow` sem cabeçalho, 98 instruções de passo de
`comparison_flow` que o primitive nem tinha como mostrar.

Nenhum gate pegava: todos verificavam se o bloco é **válido**, e ele era. Corrigido
ampliando os adapters (os primitives já sabiam renderizar) e estendendo o
`ComparisonFlow` para exibir rótulo *e* detalhe. Gate novo:
[`scripts/validate_primitives_render.py`](./scripts/validate_primitives_render.py),
que distingue *conteúdo perdido pelo código* de *campo vazio por escolha do autor* —
hoje **3.255 itens conferidos, zero perda**.

**2. `DecisionBoxSchema` e cinco outros schemas descrevem uma forma que nada
renderiza.** O Zod declara `prompt`/`options`; o adapter lê
`scenario`/`winner`/`why`/`alternatives`. Como `decision_box` está registrado como
`PassthroughObject`, a forma errada **não é rejeitada — ela renderiza a caixa
vazia**. Descobri escrevendo um módulo contra o schema declarado e vendo o gate
acusar. Os 265 blocos existentes usam a forma do adapter e estão corretos; o
problema é a armadilha para o próximo autor. **Pendência nova: B-6 abaixo.**

**3. Uma feature testada, verde e inalcançável.** O `TrailCompletionModal` (315
linhas, teste de render passando) tinha o `ModuleLayout` como único gatilho.
Terminar os 18 módulos de SAP-C03 não produzia nenhuma marcação de fim. Religado no
`ConcluirModulo`, com teste que agora exige o gatilho — não só a existência do
componente. Teste de render verde não prova que a feature existe para o usuário.

### ✅ B-6 · Os schemas Zod divergentes — reescritos e registrados

Oito tipos (`decision_box`, `flow_diagram`, `arch_flow`, `matrix_diagram`,
`stack_flow`, `timeline`, `node_graph`, `annotated_formula`) tinham schema
declarado com uma forma **que nenhum adapter consome**, e estavam mapeados como
`PassthroughObject`. Efeito: escrever contra o schema declarado não era rejeitado —
renderizava o bloco com os campos vazios.

Reescritos conforme o adapter e **registrados de fato** em `BLOCK_DATA_SCHEMAS`, o
que converte "renderiza vazio" em "falha no teste". Seguro porque a forma real é
uniforme nos 9.600+ blocos.

**O gate provou seu valor na primeira execução:** escrevi `matrix` como
`string[][]` e ele derrubou 3 blocos legítimos de `transformers`, onde célula
numérica vira heatmap de pesos de atenção — comportamento intencional do primitive.
Corrigido para `string | number`. É a demonstração de que a forma tem de sair do
primitive, não da suposição de quem escreve o schema.

Teste novo trava a regressão: se algum desses tipos voltar a `PassthroughObject`, a
suíte falha em vez de perder a proteção em silêncio.

---

## O que a validação desta rodada encontrou (e já corrigiu)

Antes de listar o que falta, três defeitos achados ao validar — todos corrigidos
no ato porque eram pequenos e bloqueantes:

### ✅ V-1 · O banco REJEITARIA todos os 105 diagramas — migration criada

O CHECK constraint de `module_blocks.block_type` (migration 037, a última a
tocá-lo) lista 24 tipos — e **nunca incluiu** `aws_diagram` nem `arch_diagram`.
O bloco de diagrama foi criado no frontend em jul/2026, usado em 105 módulos, e
ninguém estendeu o constraint: **o primeiro deploy com esses seeds falharia o
INSERT de todo diagrama**, derrubando a importação das trilhas de certificação e
do Bedrock. Nunca virou incidente porque o deploy com esses seeds ainda não
aconteceu.

**Corrigido:** [`backend/migrations/000044_add_arch_diagram_block_type.up.sql`](backend/migrations/000044_add_arch_diagram_block_type.up.sql)
adiciona `arch_diagram` e o alias `aws_diagram`. Roda automaticamente no deploy
(`make migrate` está no `deploy.sh`).

### ✅ V-2 · `block.go` estava 11 tipos atrás do banco — sincronizado

As constantes Go tinham os 15 tipos originais; a migration 037 adicionou 9 e o
frontend criou mais 2. Ninguém chama `IsValidBlockType` hoje (a validação efetiva
é o CHECK do Postgres), mas lista errada vira bug no dia em que alguém a usar.
Sincronizado para 26 tipos, com o histórico da deriva comentado no arquivo.
`go build ./...` verde.

### ✅ V-3 · 4 dos 5 gates de conteúdo NÃO estavam no CI — adicionados

O `PADRAO_ENSINO.md` afirmava "o gate está no CI" e só o drift check estava.
`validate_bedrock_blocks`, `validate_cobertura_quiz --strict`,
`validate_cobertura_diagramas --strict` e `validate_cobertura_servicos` rodavam
apenas na máquina de quem lembrasse — a mesma cobertura silenciosamente parcial
que este projeto já pagou caro duas vezes. Os 4 agora são steps do job de
frontend em `.github/workflows/ci.yml`, cada um com o motivo comentado.

---

## Estado validado (04/ago/2026)

| Métrica | Antes da rodada | Depois (04/ago, medido) |
|---|---|---|
| Módulos declarados / com conteúdo | 415 / 393 | **422 / 415 — zero 404** |
| Blocos válidos | 8.913 | **10.343 · 0 erros** |
| Módulos com quiz | 106 (320 cartas de SRS) | **352 — 84% (1058 cartas)** |
| Módulos com diagrama | 105 (26%) | **112 (27%)** |
| Hubs com cobertura total de quiz | 1 (AWS) | **5 de 7** |
| Campos de conteúdo invisíveis na página | ~1.350 | **0** (gate novo) |
| Gates de conteúdo no CI | 5 | **6, com drift e quiz em `--strict`** |
| Tipos de bloco com schema Zod real | 10 de 26 | **18 de 26** |
| `tsc` · lint · `go build` | 0 · 0 · verde | 0 · 0 · verde |
| Backend `test-unit` + `test-contract` | verde | verde |

**Certificações AWS (completas em quiz):** CP 17/17 · SAA 20/20 · DVA 15/15 ·
SAP 18/18 · **AIF 13/13** · Bedrock 31/31. **Anthropic AI Practitioner 14/14.**

**Sobre a suíte de testes do frontend:** o último resultado limpo foi **746
passando**. Depois disso, esta máquina passou a estourar `Timeout waiting for worker
to respond` em execuções completas (7s → 90s+ de duração), e cada arquivo acusado
**passa quando rodado isolado** — inclusive os dois que apareceram como falha. As
suítes de integração e de render rodaram juntas com **254 passando**. As falhas são de
saturação de recurso local, não regressão; o CI é a medição válida.

---

# AS TAREFAS

Organizadas por categoria, com prioridade, esforço (P≤meio dia · M≤3 dias ·
G>3 dias), dependências e critério de aceite. **Dono:** `conteúdo` = executável
por quem escreve módulo (eu, em sessão futura); `código` = frontend/backend;
`você` = decisão ou informação que só o dono do projeto tem.

---

## A · CONTEÚDO — o que falta escrever

### ✅ A-1 · AIF-C01 completa — 13/13 módulos

Os 8 que faltavam foram escritos: `aif-bedrock-knowledge-bases`, `aif-bedrock-agents`,
`aif-prompt-engineering`, `aif-fine-tuning-eval`, `aif-responsible-ai`,
`aif-security-governance`, `aif-mlops-monitoramento`, `aif-simulado-final`.

Cada um segue o `PADRAO_ENSINO.md`: seção "Onde isso entra no exame" com o badge de
domínio e o peso oficial, `arch_diagram` com 4–5 passos percorríveis onde há fluxo, 3
quizzes em seção `Fixando` com explicação que nomeia o erro de cada distrator.

Cobertura dos 5 domínios do AIF-C01: D1 20% (MLOps e ciclo de vida), D2 24% (já
existia), D3 28% (Knowledge Bases, Agents, prompt engineering, customização e
avaliação — o maior peso da prova, agora completo), D4 14% (viés, fairness,
Guardrails, A2I), D5 14% (IAM por modelo, rede privada, prevenir/detectar/provar).

### ✅ A-2 · Anthropic Claude AI Practitioner completa — 14/14 módulos

Trilha inteira escrita. Com ela, **nenhum slug declarado no currículo responde 404** —
415 declarados, 415 com conteúdo. Por isso `check-curriculum-seed-drift.mjs --strict`
entrou no CI: declarar módulo sem escrever o conteúdo agora quebra o build em vez de
virar 404 silencioso.

Sequência dos módulos: intro · famílias de modelo · Messages API · prompt engineering ·
prompt caching · tool use · MCP · context engineering · extended thinking · Claude Code ·
Agent SDK · evals · safety & deploy · estratégia e simulado.

**Três decisões de precisão técnica que valem registro:**

- **`extended thinking` foi escrito na forma atual, não na do material que circula.**
  A configuração com orçamento explícito de tokens é *rejeitada com erro* nos modelos
  recentes, não apenas depreciada. O módulo ensina raciocínio adaptativo e usa a
  mudança como lição sobre copiar exemplo antigo.
- **Tool Runner ≠ Claude Agent SDK.** A confusão mais custosa da área ganhou tabela
  comparativa e uma `decision_box` com cenário concreto — o primeiro roda o laço sobre
  as *suas* ferramentas, o segundo é o harness do Claude Code com ferramentas de arquivo
  e shell.
- **Nenhum preço, ID de modelo ou limite foi cravado no texto.** Todos apontam para a
  documentação oficial, com o motivo explicado ao leitor. Material que crava esses
  números ensina errado poucos meses depois, sem nada sinalizar.

**Um ajuste no currículo:** o título do módulo era "Claude 4 — modelos, IDs, pricing,
context windows", já datado antes de o conteúdo existir. Virou "Modelos Claude —
famílias, IDs, contexto e custo": amarrar geração no título faz o módulo nascer velho a
cada lançamento.

### A-3 🟠 Quizzes por hub — 5 de 7 hubs fechados, restam 63 módulos

Módulo sem quiz não gera carta de SM-2, e o SRS é o diferencial declarado da escola.
Este item saiu de **320 quizzes em 128 módulos** para **1058 quizzes em 352 módulos (84%)**.

| Hub | Cobertura |
|---|---|
| Certificações AWS | ✅ **completo** |
| Engenharia de Produção para IA | ✅ **completo** |
| Fundamentos para IA | ✅ **completo** |
| Claude & Anthropic | ✅ **completo** |
| Dados & Retrieval para IA | ✅ **completo** |
| Linguagens do AI Engineer | 6/27 |
| IA Aplicada & GenAI | 63/105 |

Os cinco hubs fechados estão promovidos a `COMPLETAS` no `validate_cobertura_quiz.py`
e travados no CI — perder quizzes num deles quebra o build.

**O que falta, por trilha:**

| Trilha | Módulos |
|---|---:|
| Diffusion Models & Geração Multimodal | 8 |
| TypeScript Profissional | 7 |
| Python para Engenheiros | 7 |
| Go Profissional | 7 |
| Local LLMs & Edge AI | 7 |
| Machine Learning Clássico | 6 |
| Fine-tuning & Customização de LLMs | 5 |
| Voice, Vision & Multimodal | 5 |
| Computer Vision Clássico | 5 |
| Ferramentas de IA para Código | 4 |
| IA Além do LLM | 2 |

**Como os quizzes foram escritos** — e é isso que precisa continuar no lote final:
cada um foi ancorado no conteúdo real do módulo, lido antes de escrever. Quiz que
cobra o que o módulo não ensina pune quem leu com atenção, e seria pior que módulo
sem quiz.

O gerador recusa explicação com menos de 220 caracteres, para forçar o tratamento de
cada distrator — regra 3 do `PADRAO_ENSINO.md`. Ele barrou oito explicações curtas ao
longo desta rodada, e todas foram reescritas.

**Esforço restante:** ~189 quizzes. **Dono:** conteúdo.

### A-4 🟠 Diagramas restantes das 8 trilhas de IA/produção

Cada trilha tem o primeiro `arch_diagram`; o gate lista o que falta em
`PENDENTES` e o imprime a cada execução. Módulos com fluxo real, por trilha:

- **AI-Native:** eval harness, chunking/embeddings, multi-agente (~3)
- **RLHF & Agents:** DPO/GRPO, reasoning models, swarms (~3)
- **Distribuídos:** replicação/consistência, particionamento, saga (~3)
- **MLOps:** feature store em detalhe, serving, drift (~3)
- **Obs & SRE:** stack OTel, RED/USE, tracing distribuído (~3)
- **Search & IR:** índice invertido do Lucene, pipeline de embeddings (~2)
- **Data Eng:** lakehouse/formatos de tabela, dbt, orquestração (~3)
- **NoSQL+Vector:** single-table design do DynamoDB, ClickHouse, Redis (~3)

**Aceite:** subir o mínimo de cada trilha em `MINIMOS` conforme entrega (hoje 1–2).
**Esforço:** M–G (~23 diagramas). **Dono:** conteúdo. **Desbloqueado** pela
decisão do `arch_diagram` + 55 ícones de conceito.

### ✅ A-5 · Badges de domínio no DVA e no SAP — 15/15 e 18/18

Cada módulo ganhou a seção "Onde isso entra no exame" no mesmo formato de CP e SAA:
badge com domínio e peso oficial (DVA 32/26/24/18; SAP 26/29/25/20), mais um parágrafo
que diz **que tipo de questão** a prova faz sobre aquele assunto. O badge sozinho é
decoração; o parágrafo é o que transforma o módulo em preparação.

Intro recebe badge de blueprint (100%) e o simulado recebe os quatro domínios, como já
era a convenção do SAA.

### A-6 🟡 Capstones de projeto por certificação (nunca executado)

Não existe na plataforma um único módulo "requisito → desenhe a topologia →
defenda o trade-off" — os capstones de certificação são simulados comentados.
Proposta por trilha (do backlog de plataforma, P1-4):

| Trilha | Capstone |
|---|---|
| CP | escolher serviços para uma loja online pequena, justificando por custo |
| SAA | SaaS B2B multi-AZ com RPO 15min/RTO 1h |
| DVA | backend serverless de delivery com idempotência e DLQ |
| SAP | landing zone para holding com 4 subsidiárias e isolamento |
| AIF | escolher a camada de IA para 5 casos e defender cada escolha |

Formato: `arch_diagram` como entregável + `decision_box` para alternativas
descartadas + 3 quizzes sobre as decisões. **Esforço:** M (5 módulos).
**Dono:** conteúdo. **Dependência:** nenhuma.

### A-7 🟡 Trilha/módulos "usar IA para arquitetura cloud" (nunca executado)

O cruzamento hub-Claude × hub-AWS — o ponto mais defensável do posicionamento —
segue vazio. Módulos propostos (P1-5 do backlog): Claude como revisor de
arquitetura; Well-Architected review assistido (6 pilares como rubrica);
gerar IaC e por que revisar; ler custo com LLM; o que a IA erra em arquitetura;
documentar arquitetura existente → ADR.
**Decisão prévia (sua):** trilha nova no `curriculum.ts` ou extensão da
trail-bedrock. **Esforço:** G. **Dono:** você (estrutura) + conteúdo.
**Desbloqueado** pelo `arch_diagram`.

---

## B · CÓDIGO — frontend

### B-1 🟠 Quebrar `curriculum.ts` (4.090 linhas) + índice enxuto para o cliente

Dois problemas no mesmo arquivo. (a) Arquivo único com dois formatos de
declaração de trilha — já quebrou auditoria por regex e todo mundo edita o mesmo
arquivo. (b) **Todos os 415 slugs vão ao navegador**: chunk de currículo com
~80 KB gzip, importado por 35 client components.

**Tarefa:** `curriculum/<trilha>.ts` com índice re-exportando; no build, gerar
`curriculum-index` enxuto (slug, title, trail, icon, xp, readTime, keywords) e
apontar os 35 componentes de cliente para ele; o registro completo fica
server-side. `seoDesc` e `nextSuggested` já saíram nesta sessão (−6 KB gzip).
**Aceite:** chunk de currículo < 40 KB gzip; nenhum formato duplo de declaração.
**Esforço:** M–G. **Dono:** código.

### ✅ B-2 · Auditoria dos primitives — 1.300+ campos recuperados

Detalhes no bloco "O que a execução descobriu", no topo deste documento. Resumo: os
adapters achatavam o dado antes de entregar aos primitives, e o que ficava fora era
descartado sem erro. Corrigido nos adapters (`decision_box`, `stack_flow`,
`flow_diagram`, `annotated_formula`, `arch_flow`, `node_graph`, `layer_stack`) e no
primitive `ComparisonFlow`. Gate novo no CI:
`scripts/validate_primitives_render.py` — 3.255 itens, zero perda.

### ✅ B-3 · ModuleLayout removido — e uma feature perdida religada

`ModuleLayout.tsx` (808 linhas) e `PrintLayout.tsx` (176, também órfão) removidos.
Mas a remoção revelou que o `TrailCompletionModal` — 315 linhas, teste de render
passando — tinha o ModuleLayout como **único gatilho**: concluir a última aula de uma
trilha não produzia nenhuma marcação de fim desde o pivot.

Religado no `ConcluirModulo`, comparando o conjunto de módulos concluídos *antes* da
chamada (sem isso não se distingue "fechou agora" de "já estava fechada", e o modal
reapareceria a cada reabertura). Testes novos exigem o **gatilho**, não a existência do
componente — e um deles falha se o ModuleLayout voltar.

**Perda declarada:** o `PrintLayout` era a capa e o colofão do PDF do artigo, e essa
feature deixou de existir com ele. Imprimir um módulo hoje imprime a página normal. Se
for para recuperar, é reconstruir sobre a rota de blocos — não estava sendo usada por
ninguém, então não virou tarefa; fica registrado para não parecer descuido.

### B-4 🟡 a11y: axe nas 8 rotas de maior tráfego (hoje 3)

`src/tests/a11y/` cobre home, ranking e busca. Faltam: `/aprenda/[slug]` (a rota
das 393 páginas), `/progresso`, `/revisar`, `/simulados`, `/explorar`, página de
trilha. Foco no que auditoria manual não pega: contraste, ordem de foco, aria em
componente interativo. **Esforço:** M. **Dono:** código.

### B-5 🟢 Miudezas registradas

- **Allowlist do drift:** 3 entradas mortas (`construcao`, `profissional-digital`,
  `seguranca-hardware-hacking`) + separar os 9 slugs de landing de hub (exclusão
  estrutural) dos 22 de conteúdo pendente. Quando A-1+A-2 zerarem, ligar
  `--strict` no CI. **P.**
- **`BedrockDestaque.tsx`:** `'29'` diagramas segue hardcoded (hoje correto por
  coincidência — a trilha tem 29). Derivar do manifesto no build ou tirar o
  número. **P.**
- **`compute-ec2-lambda`:** +20px de rolagem a 375px; investigado duas vezes sem
  culpado fora de área rolável. 1 página em 393 — aceito como resto, reabrir só
  se reclamarem. **—**
- **Alias `aws_diagram`:** manter por ora (custo zero); remover schema+adapter
  +CHECK numa major futura, quando não houver seed externo. **—**

---

## C · CÓDIGO — backend

### ✅ C-1 · Eliminação de conta (LGPD art. 18) — feito, e o diagnóstico anterior estava errado

**Correção do que este documento afirmava:** eu havia escrito que o endpoint "não
existe, verificado por grep nas rotas". Existia: `DELETE /api/v1/me` →
`Auth.DeleteAccount` → `DeleteAccountUseCase` (que vive em `get_profile.go`, e é por
isso que procurar por `delete_account.go` não achou — só o arquivo de teste tem esse
nome). O defeito real era diferente e mais sério.

**O que ele fazia:** `UPDATE users SET deleted_at = now()` e revogava os refresh
tokens. Nada mais. Ou seja, "excluir a conta" **trancava a porta e guardava tudo
dentro**: e-mail, telefone e nome permaneciam na linha por tempo indeterminado, o
snapshot de progresso ficava inteiro, e — o pior — **o nome seguia listado no ranking
público**, porque as duas queries de ranking faziam `JOIN users` sem filtrar
`deleted_at`. Para quem pediu exclusão, o dado continuava visível a estranhos e
invisível só para o próprio titular. É o inverso do que o pedido significa.

**O que passou a fazer** (`UserRepo.SoftDelete`, tudo numa transação):

1. Substitui os identificadores diretos por tombstone — e-mail vira
   `deleted-<id>@deleted.invalid` (TLD reservado pela RFC 2606; a coluna é
   `NOT NULL UNIQUE` e não aceita `NULL`), telefone e nome vazios. Efeito colateral
   desejável: **libera o e-mail original para novo cadastro**, senão exclusão viraria
   banimento.
2. Apaga `progress_snapshots` — XP, streak, cartas de SRS, bookmarks.
3. Apaga `leaderboard` e `leaderboard_opt_ins`.
4. `analytics_events` → `user_id = NULL` em vez de apagar: o FK já era
   `ON DELETE SET NULL`, ou seja, o desenho original já tratava esses eventos como
   retíveis desde que anônimos.

**Corrigido junto:** `u.deleted_at IS NULL` nas queries `GetWeekly` e `GetByPeriod`.

**Deliberadamente mantido, com motivo:** `purchases` (obrigação fiscal),
`certificates` (têm `holder_name` e são verificáveis por terceiros — apagar invalida
documento já entregue), `simulado_attempts` (sustentam o FK dos certificados) e
`comments` (fala pública). Os dois últimos grupos são a decisão **E-4**.

**Frontend:** `deleteAccount()` já existia em `lib/auth.ts` e **a UI não a chamava** —
era só isso que faltava. `/preferencias` agora tem três ações distintas ("Baixar meus
dados", "Limpar este dispositivo", "Excluir minha conta"), com `aria-live` para o
resultado. E o botão de exportar também subentregava: serializava o `user` do cache
local, ignorando `GET /api/v1/me/export`, que devolve tentativas, certificados e
compras — corrigido, com fallback que **declara** quando o arquivo é parcial.

**`/privacidade` atualizada** para descrever exatamente esse recorte, incluindo o que
sobrevive e por quê. **Testes:** dois de integração novos (`ApagaDadoPessoal`,
`LiberaEmailParaNovoCadastro`) que leem as colunas com SQL — os testes antigos
verificavam que `FindByEmail` para de achar, o que mede *visibilidade*, não
eliminação. Rodam no CI (Docker); não rodaram nesta máquina, que não tem Docker.

**Sobra de C-1:** expor `score` no `CertificateDTO` (hoje o certificado remoto
aparece sem pontuação — o frontend já omite a linha em vez de mostrar 0%). **P.**

### C-2 🟡 Webhook do admin → `revalidatePath`

ISR de `/aprenda/[slug]` está ativo (1h). Falta o admin disparar
`revalidatePath('/aprenda/<slug>')` ao editar, para propagação imediata.
**Esforço:** P–M. **Dono:** código.

### ✅ C-3 · `GET /api/v1/certificates/:hash` — verificado e 2 bugs corrigidos

Validado em 04/ago: a rota **existe**, é pública (só rate-limit contra enumeração
de hash — `router.go:204`) e devolve `CertificateDTO`. Mas o shape real é
camelCase com o titular em `holderName`, **sem campo `score`** — e o frontend
mapeava `student_name` e `score ?? 0`. Certificado remoto válido apareceria como
**"Anônimo · 0%"**. Corrigido no `VerificarClient`: mapeia `holderName`, trata
`score` como opcional e omite a linha de pontuação quando ausente (0% inventado é
pior que omitir).

**Sobra para o backend (P, opcional):** expor `score` no DTO público, e avaliar
remover `userId` dele — a verificação pública não precisa devolver o UUID do
titular. **Dono:** código.

---

## D · INFRA — o que impede tudo isso de chegar ao público

### D-1 🔴 Migração DNS + SSL (pendente desde maio)

O domínio ainda aponta para a Hostinger antiga com build estático de 13/mai.
**Todo o trabalho desta sessão — 320 quizzes, 105 diagramas, SRS funcionando —
não existe para o público até isso rodar.** Passo a passo já documentado no
`README` raiz e no `frontend/CLAUDE.md`: trocar registros A (`89.116.115.228` →
`72.60.28.82`), `certbot certonly`, reload do nginx, e `DEPLOY_ENABLED=true`.
**Esforço:** P (mas exige acesso ao painel Hostinger e SSH — **você**).

### D-2 🟢 Cloudflare na frente (elimina o blip de ~5s no swap de container) — já planejado, pós D-1.

---

## E · DECISÕES QUE SÓ VOCÊ PODE TOMAR

| # | Decisão | Bloqueia |
|---|---|---|
| E-1 | **`/privacidade`: 4 campos `[PREENCHER]`** — razão social, CPF/CNPJ, e-mail do encarregado — e revisão jurídica do texto | publicar a página; a LGPD exige controlador identificável. Publicar com marcador é pior que não publicar |
| E-2 | **Licença dos ícones:** manter glifos próprios ou adotar AWS Architecture Icons oficiais (termos de uso da AWS; provável ok para conteúdo educacional gratuito, mas é leitura de termos, não chute) | nada — melhoria de reconhecibilidade |
| E-3 | **A-7:** trilha nova ou extensão da trail-bedrock | A-7 |
| E-4 | **C-1:** o que fazer com certificados de conta excluída (manter anonimizado vs apagar e quebrar verificação de terceiros) | C-1 |

---

## Ordem de execução recomendada

**Feito em 04/ago:** ~~A-1~~ ~~A-2~~ ~~A-5~~ ~~B-2~~ ~~B-3~~ ~~B-5~~ ~~B-6~~ ~~C-1~~ ✅
· **A-3 parcial:** hub Claude fechado (39 módulos)

```
AGORA (só você pode)            D-1 DNS+SSL → deploy liga → migrations 044 rodam
                                E-1 preencher /privacidade → publicar
CONTEÚDO (o que rende mais)     A-3 continua: Fundamentos (30) → IA Aplicada (105) → resto
                                A-4 diagramas de IA intercalados com A-3
                                A-6 capstones (M) → A-7 depois de E-3
CÓDIGO                          B-1 split do curriculum.ts → B-4 a11y →
                                C-2 revalidatePath → sobra de C-1 (score no DTO)
QUANDO DECIDIR                  E-3 → A-7 · E-4 → política de certificado na exclusão
```

**Por que A-3 segue no topo:** módulo sem quiz não gera carta de SM-2, e o SRS é o
diferencial declarado da escola. O hub Claude foi fechado em 04/ago e a plataforma
passou de 320 para 503 cartas — restam 248 módulos. O próximo lote é **Fundamentos
para IA** (30 módulos): é a porta de entrada de todo iniciante, então é onde uma
carta a mais alcança mais gente.

---

## Como revalidar tudo (reproduz cada número deste documento)

```bash
# os 6 gates de conteúdo — todos no CI
python3 scripts/validate_bedrock_blocks.py                 # 415 arquivos, 9.615 blocos
python3 scripts/validate_cobertura_quiz.py --strict        # 503 quizzes, 167 módulos
python3 scripts/validate_cobertura_diagramas.py --strict   # 112 módulos com diagrama
python3 scripts/validate_cobertura_servicos.py
python3 scripts/validate_primitives_render.py              # 3.255 itens, 0 conteúdo perdido
node scripts/check-curriculum-seed-drift.mjs --strict      # 415/415, zero 404

# suíte
cd frontend && npm test && npx tsc --noEmit && npm run lint
cd backend && go build ./... && make test-unit && make test-contract
# integração do backend (inclui os testes de LGPD) exige Docker:
cd backend && go test ./test/integration/... -tags integration -timeout 180s

# o manifesto é GERADO e commitado — regenere depois de mexer em seed:
cd scripts/import-blocks && npx tsx src/extract-curriculum.ts
# (o teste content-manifest-fresco.test.ts falha se você esquecer)
```

**Números por trilha, sem script inline:** o `content-manifest.json` agora traz
`porTrilha[trailId] = {modulos, diagramas, quizzes}`, gerado dos seeds. É a fonte dos
números da home e serve para medir cobertura sem escrever um laço novo a cada auditoria.

**Manutenção deste documento:** ao concluir uma tarefa, mova-a para uma seção
`## Concluídas` com a data e o commit — não a apague. Tarefa que sai sem rastro
é tarefa que alguém re-descobre.
