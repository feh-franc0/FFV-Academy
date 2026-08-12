# Backlog da plataforma — auditoria de julho/2026

> Produzido por medição, não por impressão. Todo número aqui saiu de script rodado
> contra `frontend/src/lib/curriculum.ts` e `scripts/seeds/articles/`, e está
> reproduzível. Onde eu não medi, está escrito que não medi.

**Data:** 27–28/jul/2026 · **Branch:** `refactor/foco-ia-claude`

---

## Resposta direta às três perguntas

**"Nossos módulos de IA e certificação já estão com uso de diagramas, arquiteturas etc.?"**
**Não.** 29 dos 388 módulos com conteúdo têm diagrama de arquitetura — **7%**. E os 29
estão todos na mesma trilha (`trail-bedrock`). As outras **36 trilhas com conteúdo têm
zero**. Isso inclui `Engenharia AI-Native`, `AI Engineering Avançado: RLHF & Agents`,
`MLOps`, `LLM Evals`, `Search & Information Retrieval` — trilhas onde o objeto de estudo
*é* topologia e fluxo.

**"Todas as certificações AWS têm exemplos visuais, arquiteturas e diagramas?"**
**Não. Zero.** São 83 módulos em 5 trilhas de certificação; 70 têm conteúdo escrito e
**nenhum** tem um único diagrama. É a lacuna mais grave do backlog, porque o SAA-C03 e o
SAP-C03 são exames de *desenho de arquitetura* — a questão te dá um requisito e pede a
topologia. Ensinar isso em prosa é ensinar a nadar por escrito.

Pior: **27 módulos de certificação servem 404 em produção** (AWS AI Practitioner e
Anthropic Claude AI Practitioner, sem nenhum conteúdo), e o CI passa verde porque eles
estão numa allowlist.

**"Que melhoria você tem pra fazer na plataforma?"** — é o resto deste documento.

---

## Estado medido

| Métrica | Valor |
|---|---|
| Hubs | 7 |
| Trilhas | 39 |
| Módulos declarados no `curriculum.ts` | 415 |
| Módulos com conteúdo (seed JSON) | 388 (93%) |
| **Módulos sem conteúdo → 404 em prod** | **27 (2 trilhas inteiras)** |
| Blocos de conteúdo | 8.387 |
| Módulos com diagrama de arquitetura | 29 (7% dos que têm conteúdo) |
| Trilhas com conteúdo e **zero** diagrama | **36 de 37** |
| Módulos de certificação AWS | 83 (70 com conteúdo, **0 com diagrama**) |
| Entradas na allowlist do drift check | 37 (34 ainda ativas) |

### Diagramas por trilha (as 8 primeiras + o resto)

| Trilha | Módulos | Conteúdo | Diagramas |
|---|---:|---:|---:|
| AWS Bedrock — GenAI em Produção | 31 | 31 | **29** |
| AWS Solutions Architect Associate | 20 | 20 | 0 |
| Claude Code: do zero ao poder total | 18 | 18 | 0 |
| AWS Solutions Architect Professional | 18 | 18 | 0 |
| AWS Cloud Practitioner | 17 | 17 | 0 |
| AWS Developer Associate | 15 | 15 | 0 |
| Anthropic Claude AI Practitioner | 14 | **0** | 0 |
| AWS AI Practitioner (AIF-C01) | 13 | **0** | 0 |
| *…outras 31 trilhas* | 269 | 269 | 0 |

### Como reproduzir

```bash
node scripts/check-curriculum-seed-drift.mjs          # curriculum × seeds × mappings
python3 scripts/validate_bedrock_blocks.py            # forma dos blocos + integridade de arestas
python3 scripts/validate_cobertura_servicos.py        # catálogo de 106 serviços × conteúdo
cd frontend && npx vitest run src/tests/integration/seed-blocks-schema.test.ts
```

> ⚠️ Cuidado com regex ao auditar `curriculum.ts`: as trilhas usam **dois** formatos de
> declaração (`id:` e `name:` em linhas separadas, ou os dois na mesma linha). Um regex que
> assume só o primeiro perde ~10 trilhas como fronteira e faz a trilha anterior absorver as
> seguintes — foi o que aconteceu na primeira passada desta auditoria e produziu uma trilha
> fantasma de "96 módulos". Use `id: 'trailXXX'` como marca, sem exigir o `name` adiante.

---

## ✅ Já corrigido nesta passada

Sete defeitos encontrados durante a auditoria e fechados na hora, porque estavam
perdendo conteúdo em produção agora. Os quatro últimos (C-4 a C-7) só apareceram
depois de o validador passar a varrer **todos** os seeds em vez de só `bedrock-*`.

### ✅ C-7 — o validador cobria 31 de 393 arquivos

`validate_bedrock_blocks.py` tinha como padrão o glob `scripts/seeds/articles/bedrock-*.json`.
Rodar sem argumento — o que o CI e todo mundo faz — validava 31 arquivos e imprimia
`✅ 0 erros`, dando a impressão de plataforma verificada. **362 arquivos nunca passaram por
ele.** Padrão trocado para `*.json`; ao ampliar, apareceram 16 erros reais (C-4 a C-6) que
estavam em produção.

Essa é a lição mais importante desta passada: **cobertura silenciosamente parcial é pior
que nenhuma cobertura**, porque produz um sinal verde em que as pessoas confiam.

### ✅ C-6 — 14 blocos `comparison_flow` vazios em 12 módulos centrais

Dos 16 blocos `comparison_flow` da plataforma, **14 tinham `left: []` e `right: []`** — o
título da comparação escrito, o conteúdo nunca preenchido. Bloco inválido → `null` → nada
na página, nem o título. Os únicos 2 funcionando eram os desta sessão.

Os módulos afetados são de alto tráfego e conceituais: `tokens`, `o-que-e-llm`,
`o-que-e-ia`, `tool-calling` (2), `kv-cache` (2), `cap-pacelc`, `event-sourcing-cqrs`,
`distributed-tracing`, `rag-evaluation`, `mcp-servers`, `como-ia-aprende`,
`incident-response-postmortem`.

Todos os 14 escritos — cada um a comparação que o título prometia: temperature 0 vs 0.7 com
saída real, sequential vs parallel tool calls, CP vs AP em partição, head vs tail sampling,
CRUD vs event sourcing, MHA/GQA vs MLA, alocação contígua vs PagedAttention, N×M vs N+M no
MCP. Os 2 sem título ganharam um, derivado do contexto da seção.

### ✅ C-5 — `decision_box` sem `why` e sem alternativas

`hybrid-search-rerank`: cenário e vencedor preenchidos, `why: ""` e `alternatives: []` —
ou seja, a caixa afirmava a conclusão e omitia o raciocínio, que é a única coisa que ela
existe para ensinar. Escrito, com as 3 alternativas e o custo de cada uma.

### ✅ C-4 — dois validadores com regras divergentes, e 9 títulos-lixo

O cap de colunas de `comparison_table` ficou em 6 no `validate_bedrock_blocks.py` depois de
subir para 8 no `schemas.ts` — o Zod aceitava, o Python reprovava. Sincronizados.

E 9 seeds tinham `title` não-nulo com valor claramente artefato do conversor TSX→JSON
(`'Título'`, `'Source'`, `'In-memory buffer'`, `'1. Business'`). Normalizados para `null`,
que é o contrato (o título humano vem do `article-mappings.json`).

Também: a lista de ícones válidos era um `set` copiado à mão no validador, que
dessincronizou do catálogo real (91 vs 101 — faltavam os ícones genéricos de categoria).
Agora é **lida de `AwsIcon.tsx` em tempo de execução**, com guarda que aborta se o regex
extrair menos de 50 chaves.

### ✅ C-1 — 17 módulos do Bedrock iam para o hub "Legacy" em produção

O importer Go roda em duas fases: a fase 1 insere **todo** artigo com
`trail_id='legacy-auto'`, `hub_id='legacy'`, `xp=10`, `read_time=5`,
`difficulty='beginner'`; a fase 2 corrige isso a partir de
`scripts/seeds/article-mappings.json` ([seed_curriculum.go:162](backend/cmd/importer/seed_curriculum.go#L162)).
Os 17 módulos novos do Bedrock não estavam nesse arquivo — em produção teriam sido
publicados órfãos, no hub "Legacy (auto-import)", fora da trilha, com XP e tempo de
leitura errados. Sem erro nenhum: falha silenciosa.

Corrigido regenerando o mapping (`extract-curriculum.ts`) → 415 entradas, drift 0. Também
ressincronizou `hubs.json` e `trails.json`, que estavam atrasados em relação à promoção do
`trail-bedrock` no `hub-ia` e à sua adição ao `hub-aws`.

### ✅ C-2 — o drift check não olhava o `article-mappings.json`

A lacuna que deixou C-1 passar. O gate validava `curriculum.ts` × arquivos de seed e
parava aí. Adicionada a terceira validação em
[check-curriculum-seed-drift.mjs](scripts/check-curriculum-seed-drift.mjs): todo seed
precisa ter entrada no mapping, e toda entrada precisa de `trail_id`. Falha com o comando
de correção na mensagem.

### ✅ C-3 — 8 blocos desaparecendo calados de 7 módulos

Quando `safeParse` falha, o `BlockRenderer` devolve `null` e loga um `console.warn` **no
servidor**. O bloco não aparece na página e o leitor não tem como saber. Estavam invisíveis:

| Módulo | Bloco | Causa |
|---|---|---|
| `embeddings-busca-bge` | tabela de 7 colunas | cap do schema era 6 |
| `mlx-apple-silicon` | tabela de 7 colunas | cap do schema era 6 |
| `o-que-e-ia`, `rede-hibrida-saa`, `redes-neurais` (×2) | 4 tabelas | `columns[0] === ''` (célula de canto de matriz) |
| `capstone-sistemas-distribuidos-saga`, `sd-url-shortener` | 2 callouts | `content` vazio |

Os dois callouts vazios eram o **único filho** de uma seção "Armadilhas" — a seção
renderizava como título com nada embaixo. Escrevi o conteúdo (5 armadilhas fatais de saga;
6 erros que eliminam candidato no URL shortener). As 4 células de canto ganharam rótulo
real (`Aspecto`, `Critério`) em vez de branco — melhor para leitor e para screen reader.
O cap de colunas subiu de 6 → 8, porque a `<table>` desktop já está dentro de
`overflow-x-auto` e o mobile vira cards empilhados: coluna extra rola, não estoura.

**Gate novo:** [seed-blocks-schema.test.ts](frontend/src/tests/integration/seed-blocks-schema.test.ts)
valida todos os 8.387 blocos dos 388 seeds contra os schemas Zod, em CI. Esta classe de
defeito não volta calada.

**Lição que vale registrar:** os testes existentes cobriam os *componentes*, não o
*conteúdo que o CMS entrega a eles*. Os três bugs desta classe encontrados nesta sessão
(`MatrixDiagram` com célula string, `NodeGraph` com legenda em array, e estes 8) passaram
por 700 testes verdes. Ver **T-9**.

---

## P0 — quebrado em produção

### P0-1 · 🔄 EM ANDAMENTO — 27 módulos servem 404 (duas trilhas vazias)

| Trilha | Módulos | Conteúdo | Estado |
|---|---:|---:|---|
| `trail-aws-aif` — AWS AI Practitioner (AIF-C01) | 13 | **5** | 🔄 Domínios 1 e 2 escritos (44% da prova) |
| `trail-anthropic-ai` — Anthropic Claude AI Practitioner | 14 | 0 | ⬜ não iniciada |

**Escritos e validados** (172 blocos, 0 erros, renderizando em `/aprenda/`):
`aif-intro` (32 blocos) · `aif-ai-ml-fundamentos` (34) · `aif-sagemaker-overview` (32) ·
`aif-genai-conceitos` (37) · `aif-bedrock-overview` (37).

Cada um com `exam_domain_badge`, 3 quizzes com explicação que ensina, e diagrama de
arquitetura onde a topologia é o objeto — as três camadas da stack de IA da AWS, os
serviços de IA por tipo de dado de entrada, os componentes do SageMaker ao longo do ciclo
de vida, e as quatro alavancas de adaptação de FM.

**Faltam 8:** `aif-bedrock-knowledge-bases`, `aif-bedrock-agents`, `aif-prompt-engineering`,
`aif-fine-tuning-eval` (Domínio 3, 28%), `aif-responsible-ai` (D4, 14%),
`aif-security-governance`, `aif-mlops-monitoramento` (D5, 14%), `aif-simulado-final`.

Estão declaradas no `curriculum.ts`, aparecem na navegação, no `/mapa`, no `/explorar` e
no sitemap. O usuário clica e toma 404. São as duas trilhas **mais estratégicas** do
posicionamento novo: AIF-C01 é a porta de entrada do anel pago de certificações, e a
Anthropic AIP é o centro do moat ("Claude & Anthropic no centro").

**Agravante:** o CI passa porque os 27 slugs estão na `KNOWN_MISSING_ALLOWLIST`. A
allowlist foi criada como registro consciente de dívida — e virou anestésico.

**Tarefa:** escrever os 27 módulos. É o maior item deste backlog e não tem atalho.
Ordem sugerida: AIF-C01 primeiro (13 módulos, currículo do exame já é público e fechado,
e conecta direto no Bedrock que já está escrito), Anthropic AIP depois (14).

**Aceite:** `node scripts/check-curriculum-seed-drift.mjs --strict` passa sem as 27
entradas na allowlist. Todos os 27 respondem 200 em `/aprenda/<slug>`.

**Esforço:** G — 27 módulos de conteúdo denso.

---

### P0-2 · Allowlist do drift check está anestesiando o gate

37 entradas, 34 ativas. Mistura três coisas diferentes que precisam de tratamento
diferente:

1. **9 slugs de landing de hub** (`aws`, `ia`, `fundamentos`, `dados`, …) — não são
   módulos, são `href` de hub. Nunca vão ter seed. Deveriam ser **excluídos do escopo**
   do check (filtrar antes de comparar), não perdoados por allowlist.
2. **27 slugs de conteúdo faltando** (P0-1) — dívida real, sai quando o conteúdo entra.
3. **3 entradas mortas** — `construcao`, `profissional-digital` e
   `seguranca-hardware-hacking` não existem mais no `curriculum.ts` (resquícios do
   currículo pré-pivot). São perdão para slug que ninguém declara. Remover.

**Tarefa:** separar as três categorias. Landing de hub vira exclusão estrutural; entradas
mortas saem; só o item 2 continua sendo allowlist, com a regra "só entra com issue
vinculada".

**Aceite:** allowlist contém exclusivamente slugs de P0-1. Rodar `--strict` no CI assim
que P0-1 fechar.

**Esforço:** P.

---

## P1 — diagramas onde eles decidem o aprendizado

O bloco `aws_diagram` já existe e está validado: ícones SVG inline (91 serviços), arestas
medidas no DOM, highlight passo-a-passo, lista `sr-only` descrevendo o fluxo para leitor
de tela. Contrato em
[`_BEDROCK_AUTHORING_SPEC.md`](scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md). O custo
marginal de um diagrama novo é baixo — o caro já foi pago.

**Princípio:** diagrama entra onde o objeto de estudo *é* topologia ou fluxo. Não é meta
de cobertura por cobertura; um módulo sobre `git rebase` não precisa de diagrama de
arquitetura.

### P1-1 · Certificações AWS — 51 diagramas em 4 trilhas · **maior ROI do backlog**

O exame pede topologia. Hoje temos 70 módulos de certificação e zero desenhos.

**SAA-C03 — 16 diagramas** (comece por aqui: é a certificação mais procurada e a mais
visual)

| Módulo | Diagrama |
|---|---|
| `vpc-avancado` | VPC com subnets pública/privada, NAT GW, peering e Transit Gateway |
| `rede-hibrida-saa` | Direct Connect + VPN backup + PrivateLink + VPC Endpoints lado a lado |
| `disaster-recovery` | as 4 estratégias em sequência, com RPO/RTO anotados em cada |
| `ec2-autoscaling-elb` | ALB → target groups → ASG multi-AZ, com health check |
| `rds-aurora-dynamodb` | Multi-AZ (síncrono) vs read replica (assíncrono) — o par que o exame confunde |
| `caching-performance` | as 3 camadas: CloudFront → ElastiCache → DAX |
| `messaging-eventos` | fan-out SNS→SQS, EventBridge por regra, Kinesis por shard |
| `serverless-lambda-avancado` | API GW → Lambda → Step Functions, com DLQ |
| `containers-ecs-eks` | ECS/Fargate vs EKS: plano de controle e de dados |
| `dns-cdn-edge` | Route 53 (políticas de roteamento) → CloudFront → Global Accelerator |
| `s3-avancado` | lifecycle entre classes de storage, com Object Lock |
| `analytics-bigdata` | pipeline Kinesis → Glue → Athena/EMR sobre S3 |
| `seguranca-avancada` | KMS envelope + Secrets Manager rotation + WAF na borda |
| `migracao-transferencia-saa` | DMS + SCT + MGN + DRS: qual caminho para cada origem |
| `iam-avancado-organizations` | Organizations → OU → SCP → role assumida via STS |
| `ml-ia-arquiteto-saa` | SageMaker vs Bedrock no mesmo desenho de pipeline |

**SAP-C03 — 14 diagramas** (densidade arquitetural mais alta da plataforma)
`organizations-control-tower` (landing zone multi-account), `advanced-networking-sap`
(Cloud WAN hub-and-spoke + RAM), `hibrido-direct-connect`, `disaster-recovery-estrategias`,
`edge-hibrido-sap` (Outposts/Wavelength/Local Zones no mesmo mapa),
`analytics-bigdata-sap` (lake com Lake Formation), `seguranca-sap-avancada`
(GuardDuty→Detective→Security Hub), `governance-compliance-sap`,
`observability-enterprise`, `cicd-enterprise-sap` (CDK Pipelines cross-account),
`containers-serverless-sap`, `ml-ia-arquiteto-sap`, `migracao-7rs-sap`,
`well-architected-aplicado`.

**DVA-C02 — 12 diagramas**
`lambda-profundo` (ciclo de vida do cold start — é fluxo temporal, não topologia),
`api-gateway-rest-http-ws`, `dynamodb-para-dev` (partition key + GSI + Streams),
`s3-dev-features` (fluxo do presigned URL), `step-functions-workflows`,
`eventbridge-sqs-sns-para-dev`, `cognito-fluxos` (user pool vs identity pool — o desenho
resolve a confusão clássica), `kms-encryption-dev` (envelope encryption),
`cicd-aws-nativo`, `x-ray-observability` (trace distribuído), `ecs-fargate-para-dev`,
`cloudformation-sam-cdk`.

**Cloud Practitioner — 9 diagramas** (mais simples, público iniciante)
`aws-global-infra` (região → AZ → edge), `modelo-responsabilidade-compartilhada` (a linha
divisória, que é a questão mais recorrente do CLF), `networking-vpc-route53`,
`compute-ec2-lambda`, `storage-s3-ebs-efs`, `well-architected-framework`,
`migracao-aws-servicos`, `ai-ml-aws-servicos`, `developer-tools-aws`.

### ✅ EXECUTADO em 29/jul/2026 — os 51 diagramas estão no ar

| Trilha | Diagramas | Módulos com diagrama |
|---|---:|---|
| AWS Solutions Architect Associate | 16 | 16 de 20 |
| AWS Solutions Architect Professional | 14 | 14 de 18 |
| AWS Developer Associate | 12 | 12 de 15 |
| AWS Cloud Practitioner | 9 | 9 de 17 |

Os módulos sem diagrama em cada trilha são intro, Q&A e simulado — onde topologia não é o
objeto. **Cobertura da plataforma: 8% → 21%** (33 → 84 módulos com diagrama).

Cada diagrama tem 5 passos percorríveis, `caption` dizendo o que concluir, e lista
`sr-only` para leitor de tela. Verificado em navegador real: 70 medições (35 módulos × 2
viewports), arestas desenhadas, zero erro de JS, um `<main>` por página.

**Gate novo:** [`validate_cobertura_diagramas.py`](scripts/validate_cobertura_diagramas.py)
declara um mínimo por trilha e falha se cair abaixo. Ele também aborta se um id declarado
no script não existir no `curriculum.ts` — guarda que peguei escrevendo depois de eu mesmo
inventar cinco ids (`trail-mlops`, `trail-obs-sre`, `trail-search-ir`, `trail-data-eng`,
`trail-nosql-vector`), nenhum dos quais existia. Declaração que não casa não valida nada, e
pior: reporta verde.

**Dois defeitos de CSS descobertos ao verificar os diagramas** (não eram dos diagramas):
token longo sem espaço — `SageMakerVariantInvocationsPerInstance` (373px) em `code` inline e
`IAMUser/AnomalousBehavior:NetworkPortProbeUnprotectedPort` (56 caracteres) em parágrafo —
empurrava a página lateralmente no mobile em 19+ artigos. Corrigido com `overflow-wrap:
anywhere` nos dois primitivos.

**Resto conhecido:** `compute-ec2-lambda` ainda rola 20px a 375px. Investiguei: nenhum
elemento fora de área rolável, nenhum container rolável mais largo que a viewport. 20px em
1 de 393 páginas — registrado em vez de perseguido.

---

### P1-2 · Trilhas de IA e produção — ~45 diagramas

Onde a ausência mais dói, por trilha:

| Trilha | Diagramas sugeridos | Exemplos |
|---|---:|---|
| Engenharia AI-Native | 6 | pipeline RAG, loop de agente, arquitetura de eval |
| AI Engineering Avançado: RLHF & Agents | 6 | RLHF (SFT→RM→PPO), multi-agente, orquestração |
| MLOps — ML em produção | 5 | feature store, serving, retraining, drift |
| Observabilidade & SRE | 4 | traces distribuídos, SLO→alerta, coleta de métrica |
| Search & Information Retrieval | 4 | índice invertido, busca híbrida + rerank |
| Sistemas Distribuídos | 4 | consenso, replicação, particionamento |
| NoSQL + Vector Databases | 3 | HNSW/IVF, sharding |
| Data Engineering Moderna | 4 | lakehouse, CDC, batch vs streaming |
| LLM Evals Profissional | 3 | harness de eval, LLM-as-judge, golden set |
| Local LLMs & Edge AI | 3 | quantização, serving on-device |
| Fine-tuning & Customização | 3 | LoRA/QLoRA, pipeline de dados |
| **Claude & Anthropic (3 trilhas)** | ~8 | harness do Claude Code, MCP, tool loop, subagentes |

**Nota de escopo:** o bloco chama-se `aws_diagram` e o catálogo de ícones é de serviços
AWS. Para diagramas não-AWS (RLHF, HNSW, consenso) hoje só existem `flow_diagram`,
`arch_flow`, `stack_flow` e `node_graph` — que funcionam, mas não têm o percurso
passo-a-passo nem os ícones. **Decisão necessária antes de começar:** ver **T-1**.

**Esforço:** G, e depende de T-1.

---

### P1-3 · `exam_domain_badge` só existe em 2 das 5 trilhas de certificação

Medido: Cloud Practitioner 17 badges, SAA 33, **DVA 0, SAP 0, AIF 0**. O bloco existe e
mapeia o módulo para o domínio e o peso do exame — é exatamente o que orienta estudo para
prova. Duas trilhas inteiras não usam.

**Tarefa:** adicionar `exam_domain_badge` nos 33 módulos de DVA-C02 e SAP-C03 (+ nos 13 do
AIF quando P0-1 fechar). Os pesos por domínio são públicos no guia de cada exame.

**Aceite:** todo módulo de trilha de certificação tem badge de domínio; a soma dos pesos
por trilha fecha em 100%.

**Esforço:** P — é metadado, não redação.

---

### P1-4 · Nenhuma trilha de certificação AWS tem capstone de projeto

Medido: existem capstones de projeto em MLOps, SRE, saga distribuída, RAG, visão
computacional, Go, Python, TypeScript, pentest, eval harness — 20+ módulos `capstone-*`.
Nas 5 trilhas de certificação AWS, o único módulo de fecho é `simulado-*`: **prova
comentada**.

Ou seja: **não existe um único módulo na plataforma do tipo "aqui está o requisito de
negócio, desenhe a topologia, defenda o trade-off"**. A plataforma ensina o que cada
serviço faz e como o exame cobra. Ela não ensina a projetar — que é a habilidade que o
cargo exerce e a que o SAA/SAP realmente medem.

Isso não é um defeito (nada está quebrado); é a ausência que separa uma plataforma de
referência de uma plataforma de ensino.

**Tarefa:** um capstone de projeto por trilha de certificação, no formato requisito →
desenho → defesa:

| Trilha | Capstone proposto |
|---|---|
| Cloud Practitioner | Escolher os serviços para uma loja online pequena, e justificar por custo |
| SAA-C03 | Desenhar a arquitetura multi-AZ de um SaaS B2B com RPO 15min / RTO 1h |
| DVA-C02 | Desenhar o backend serverless de um app de delivery, com idempotência e DLQ |
| SAP-C03 | Landing zone multi-account para uma holding com 4 subsidiárias e requisito de isolamento |
| AIF-C01 | Escolher a camada da stack de IA para 5 casos de uso e defender cada escolha |

Cada um usando `aws_diagram` como entregável de estudo, mais `decision_box` para as
alternativas descartadas. **Esforço:** M (5 módulos).

---

### P1-5 · "Usar IA para arquitetura cloud" não existe como conteúdo

Grep na plataforma inteira: as menções a IaC, Well-Architected review e geração de
Terraform/CloudFormation são incidentais, dentro de módulos sobre outra coisa. **Não há
nenhum módulo sobre usar Claude para projetar, revisar ou criticar arquitetura AWS.**

É a segunda metade explícita do objetivo declarado da plataforma, e é o cruzamento entre
`hub-claude-anthropic` e `hub-aws` — o ponto mais defensável do posicionamento pós-pivot
("Claude & Anthropic no centro, Bedrock como ponte para Certificações AWS"). Hoje esse
cruzamento está vazio.

**Tarefa:** trilha nova (ou extensão de `trail-bedrock`), com módulos do tipo:

- Claude como revisor de arquitetura: dar o diagrama e o requisito, receber os furos
- Well-Architected review assistido: os 6 pilares como rubrica de avaliação por LLM
- Gerar IaC a partir da topologia — e por que revisar o que saiu não é opcional
- Ler uma conta da AWS com LLM: de Cost Explorer a hipótese de desperdício
- O que a IA erra em arquitetura: alucinação de serviço, limite inventado, padrão obsoleto
- Documentar arquitetura existente: de código e config para ADR

**Ordem importa:** este item depende de **T-1** estar decidido, porque metade dos diagramas
não é topologia AWS pura. **Esforço:** G.

---

## P2 — dívida técnica e consistência

### T-1 · Decidir o escopo do `aws_diagram` antes de escalar (bloqueia P1-2)

O componente é genérico (nós, grupos, arestas, passos); só o catálogo de ícones é AWS.
Três caminhos:

| Opção | Custo | Consequência |
|---|---|---|
| Renomear para `arch_diagram` e abrir o catálogo de ícones a conceitos não-AWS (LoRA, HNSW, RM) | M — migração de 29 blocos + schema + validador | Um único bloco de arquitetura na plataforma |
| Manter `aws_diagram` e criar `concept_diagram` irmão | M — duplica componente | Dois blocos parecidos, risco de divergirem |
| Manter `aws_diagram` só para AWS; usar `flow_diagram`/`node_graph` no resto | 0 | P1-2 perde percurso passo-a-passo e ícones — a parte que faz o diagrama ensinar |

**Recomendação:** opção 1. O componente já é agnóstico; a limitação é só o nome e o
catálogo. Fazer isso **antes** dos ~45 diagramas de P1-2 evita migrar 74 blocos depois.

**Esforço:** M. **Bloqueia:** P1-2.

---

### T-2 · Licenciamento dos ícones — decisão do dono do repo

`AwsIcon.tsx` tem 91 serviços com **glifos próprios**, desenhados aqui. Não são os AWS
Architecture Icons oficiais. Isso foi deliberado (evita a questão de licença), está
documentado no topo do arquivo, e o campo `glyph` é o único que mudaria numa eventual
troca.

**A decisão é sua, não minha:** usar a arte oficial da AWS deixa os diagramas
instantaneamente reconhecíveis para quem estuda para a prova — e traz os termos de uso do
asset pack da AWS junto. Como o conteúdo é gratuito e educacional, provavelmente cabe; mas
é leitura de termos, não chute de engenheiro.

**Esforço:** P para trocar; a decisão é que trava.

---

### T-3 · Diagramas largos rolam horizontalmente em telas médias

Duas medidas, que não são a mesma coisa:

- **Largura declarada:** 24 dos 29 diagramas têm 4 ou mais grupos (19 com 4, 4 com 5, 1
  com 6 — `bedrock-arquitetura-referencia-ia-corporativa`, que desenha 7 camadas).
- **Rolagem observada:** ~10 rolaram de fato a 1500px de viewport. Não é função só da
  contagem de grupos — depende da largura dos nós dentro de cada um.

Não quebra layout (rola dentro do container, como projetado), mas o leitor perde a visão
do fluxo completo — que é justamente o ponto de ter o diagrama.

**Correção é editorial, não de código:** fundir grupos para 3, ou dividir em dois
diagramas (ex: ingestão | consulta). Alternativa de código: layout responsivo que quebra
em duas fileiras abaixo de um breakpoint — resolve os 24 de uma vez, em vez de 24 edições.

**Esforço:** P por diagrama na via editorial; M na via de layout (mas resolve tudo).

---

### T-4 · `29` diagramas hardcoded no destaque da home

[BedrockDestaque.tsx:51](frontend/src/components/home/BedrockDestaque.tsx#L51) — módulos,
horas e XP são derivados do `CURRICULUM` em tempo de render; a contagem de diagramas não,
porque o dado não está no `curriculum.ts` (está nos seeds). Envelhece mal e o próprio
comentário do arquivo promete o contrário.

**Correção:** ou expor a contagem no build (script que conta `aws_diagram` nos seeds e
emite um JSON), ou trocar por texto sem número. Não deixar um número manual num arquivo que
diz que não tem números manuais.

**Esforço:** P.

---

### T-5 · `extract-curriculum.ts` não roda no CI nem no deploy

A causa-raiz de C-1. O gerador que produz `article-mappings.json`, `hubs.json` e
`trails.json` a partir do `curriculum.ts` é manual — quem esquece de rodar publica dado
inconsistente. C-2 agora *detecta* a divergência; melhor seria não deixar divergir.

**Correção:** rodar o gerador no CI e falhar se o resultado diferir do commitado (padrão
"generated files are checked in and verified"), ou rodar no passo de deploy antes do
importer.

**Esforço:** P.

---

### T-6 · `hubs.json` / `trails.json` também dessincronizaram

Mesma causa. A regeneração desta sessão trouxe 299 linhas de diferença em `trails.json` e
a reordenação do `trail-bedrock` no `hub-ia`. Já corrigido, mas fica coberto por T-5.

---

### T-7 · Comentário do `.env.local` promete um mock que não existe

O comentário diz que há um "mock local" quando o backend está fora. Não há — nunca houve.
Foi o que fez o 404 de `/aprenda/*` parecer misterioso: `NEXT_PUBLIC_API_BASE_URL` **está**
setado, então o caminho de placeholder (que só dispara com a variável **vazia**) nunca
rodava, e a página caía direto em `notFound()`.

O fallback de dev agora existe de verdade
([curriculum-local.ts](frontend/src/lib/curriculum-local.ts), lê os seeds do disco,
bloqueado fora de `development`).

**Tarefa:** corrigir o comentário para descrever o comportamento real e apontar para o
fallback.

**Esforço:** P.

---

### T-8 · `curriculum.ts` com ~5.000 linhas em arquivo único

Já registrado como backlog no `frontend/CLAUDE.md`. Dois sintomas concretos apareceram
nesta auditoria: os **dois formatos de declaração de trilha** conviverem no mesmo arquivo
(que quebrou meu regex de auditoria — ver a nota em "Como reproduzir"), e qualquer edição
de currículo tocar um arquivo que todo mundo edita.

**Correção:** quebrar em `curriculum/<trilha>.ts` com um índice que reexporta. Ao fazer,
normalizar o formato de declaração.

**Esforço:** M. Puramente mecânico, mas toca muita coisa.

---

### T-9 · Auditar os primitives restantes contra o que o CMS realmente envia

O padrão que gerou 3 bugs nesta sessão: **o primitive declara um contrato de tipos que o
adapter do CMS não honra**, o TypeScript não pega (o adapter faz cast), e a página quebra
só quando aquele bloco específico é renderizado com dado real.

Casos já corrigidos: `MatrixDiagram` (declarava `data: number[][]`, chamava
`val.toFixed(2)`, e o spec de autoria manda célula string → derrubava a **página inteira**
em 6 artigos) e `NodeGraph` (declarava `legend?: string`, o adapter passa
`[{label, color}]` → "Objects are not valid as a React child").

**Não auditados**, com uso real em produção: `flow_diagram` (84 blocos), `stack_flow` (72),
`annotated_formula` (51), `arch_flow` (33), `timeline` (24), `comparison_flow` (16),
`layer_stack` (12), `mind_map` (6), `split_flow` (6), `hierarchy_diagram` (5).

O novo gate de schema (C-3) cobre o formato **declarado**; não cobre a divergência entre o
que o adapter passa e o que o primitive espera. Isso precisa de teste de render com dado
real de seed — o padrão de
[primitives-cms-contract.test.tsx](frontend/src/tests/render/primitives-cms-contract.test.tsx).

**Aceite:** cada um dos 10 tipos acima tem um teste que o renderiza com um bloco real
extraído dos seeds, não com um fixture escrito à mão.

**Esforço:** M. **Prioridade real:** alta — é a única classe de bug aqui que derruba página.

---

### T-10 · Cobertura de diagrama não é medida por nenhum gate

Os validadores hoje checam forma de bloco e cobertura de serviços do catálogo. Ninguém
mede "esta trilha de arquitetura tem 0 diagramas". Foi por isso que 7% passou despercebido.

**Correção:** script que reporta cobertura de diagrama por trilha, com um mínimo esperado
declarado por trilha (as trilhas conceituais declaram 0 e isso é legítimo e explícito).
Warning, não erro — mas visível.

**Esforço:** P.

---

## P3 — melhorias de produto (não são defeitos)

Estas não estão quebradas; são oportunidades. O `CLAUDE.md` raiz já tem um roadmap de 18
itens em 3 tiers — **não vou duplicá-lo aqui**. Só o que a auditoria acrescenta:

### T-11 · Diagrama como objeto de estudo, não só ilustração
Os `steps` do `aws_diagram` já percorrem o fluxo. O passo natural: transformar em
exercício — esconder um nó e pedir para o aluno identificar, ou dar o requisito e pedir a
topologia. Para quem estuda SAA/SAP isso é *o* exercício do exame. Reaproveita o
componente e o SRS que já existem.

### T-12 · `/mapa` não mostra o que tem diagrama
Sinal de qualidade e de completude que já está no dado e não aparece na navegação.

### T-13 · Reaproveitar o toolchain de scoring do `drawio-tools/`
Existe um pipeline com `aws-arch-scorer.py`, `aws-arch-fixer.py` e `layout-linter.py`, com
histórico v0→v4 (score visual 58→93), usado em
`drawio-tools/docs/completo-todas-fases.drawio`. Ele pontua legibilidade de layout de
arquitetura AWS — e está desconectado dos diagramas da plataforma. Adaptar o linter de
layout para os `aws_diagram` daria uma medida objetiva de qualidade visual (e pegaria T-3
automaticamente).

> Nota: aquele diagrama do `drawio-tools/` usa os shapes **oficiais** `mxgraph.aws4.*` e
> trata IA como *ferramenta* (Bedrock isolado numa lane `F3 — IA / Async`) — o oposto da
> arquitetura de referência da trilha, onde a IA é o centro. Os dois estão certos para
> públicos diferentes; vale saber que existem e divergem.

---

## Ordem sugerida de execução

1. **T-9** — bug que derruba página, e cada dia que passa é conteúdo lido com bloco faltando.
2. **P0-1** — 27 módulos em 404 são a coisa mais visível e mais estratégica.
3. **P1-1 (SAA-C03, 16 diagramas)** — maior ROI: conteúdo já escrito, público maior, exame visual.
4. **T-1** — decidir o escopo do bloco antes de escalar, ou migra 74 blocos depois.
5. **P1-1 restante** (SAP, DVA, CP) e **P1-3** (badges de domínio).
6. **P1-2** — diagramas das trilhas de IA, já com o bloco genérico de T-1.
7. **P0-2, T-4, T-5, T-7, T-10** — pequenos, agrupáveis num commit de arrumação.
8. **T-2, T-3, T-8, T-11..T-13** — quando a fila acima esvaziar.

---

## Verificação no fecho desta passada

```
node scripts/check-curriculum-seed-drift.mjs      ✓ 415 mappings, drift 0
python3 scripts/validate_bedrock_blocks.py        ✓ 393 arquivos, 8.559 blocos, 0 erros, 0 avisos
python3 scripts/validate_cobertura_servicos.py    ✓ 106/106 serviços, 0 pendentes
npx vitest run (suite completa)                   ✓ 709 passando, 7 skipped
npm run lint                                      ✓ zero warnings
npx tsc --noEmit                                  ✓ limpo
```

Compare a segunda linha com a versão anterior deste documento: era `31 arquivos, 1.113
blocos`. O número não subiu porque a plataforma cresceu — subiu porque o validador passou a
olhar o que já estava lá.
