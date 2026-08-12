# Plano de execução — Ecossistema AWS para IA (trilha Bedrock)

> **Documento de handoff.** Escrito para ser executado por alguém (ou uma sessão
> nova) **sem nenhum contexto prévio**. Tudo que é preciso saber está aqui ou
> referenciado por caminho exato.
>
> **Status:** ✅ EXECUTADO. Os 6 módulos escritos, os 16 ícones criados, os 5
> diagramas pendentes autorados e o currículo religado (31 módulos). Fica como
> registro da decisão tomada e das armadilhas encontradas no caminho.
> **Última atualização:** 2026-07-28 (execução concluída)

---

## Índice

1. [O que já existe](#1-o-que-já-existe)
2. [O que vamos construir](#2-o-que-vamos-construir)
3. [Decisões já tomadas](#3-decisões-já-tomadas)
4. [Contrato técnico](#4-contrato-técnico)
5. [Armadilhas conhecidas](#5-armadilhas-conhecidas)
6. [Etapa 0 — os 16 ícones](#6-etapa-0--os-16-ícones)
7. [Etapas 1 a 6 — os módulos](#7-etapas-1-a-6--os-módulos)
8. [Etapa 7 — rewiring do currículo](#8-etapa-7--rewiring-do-currículo)
9. [Definição de pronto](#9-definição-de-pronto)
10. [Decisões em aberto](#10-decisões-em-aberto)

---

## 1. O que já existe

### A trilha

`trail-bedrock` em `frontend/src/lib/curriculum.ts` — **28 módulos**, 1845 XP,
~7h20 de leitura. Ordem atual:

| # | Slug | Papel |
|---|---|---|
| 1–14 | `bedrock-o-que-e-e-por-que` … `bedrock-arquiteturas-e-cases-reais` | Construção: API, modalidades, tool use, RAG, agents, guardrails, preço, FinOps, padrões |
| 15 | `bedrock-arquitetura-referencia-ia-corporativa` | As 7 camadas da plataforma corporativa |
| 16 | `bedrock-claude-na-aws-ecossistema` | Os 4 caminhos até o Claude na AWS |
| **17** | `bedrock-servicos-borda-orquestracao` | **Será absorvido → M1 + M2** |
| **18** | `bedrock-servicos-dados-midia` | **Será absorvido → M3 + M4** |
| **19** | `bedrock-servicos-seguranca-observabilidade` | **Será absorvido → M5 + M6** |
| 20 | `bedrock-rag-producao-padroes` | RAG de produção |
| 21 | `bedrock-tool-use-producao` | Tool use profissional |
| 22 | `bedrock-padroes-agenticos` | Padrões agênticos e context engineering |
| 23 | `bedrock-evals-qualidade-producao` | Evals |
| 24 | `bedrock-playbook-reducao-custo` | 14 alavancas de custo |
| 25 | `bedrock-catalogo-cases-setor` | Cases por setor |
| 26–28 | `bedrock-case-atendimento-inteligente`, `-documentos-setor-regulado`, `-copiloto-interno-engenharia` | Três cases visuais |

### Como o conteúdo funciona

- **`frontend/src/lib/curriculum.ts`** é o **índice**: slug, título, xp, readTime,
  desc, seoDesc, keywords, prerequisites, nextSuggested, level.
- **`scripts/seeds/articles/<slug>.json`** é o **conteúdo**: árvore de blocos.
- O importer Go carrega os seeds no Postgres; `/aprenda/<slug>` busca do backend.
- **`scripts/check-curriculum-seed-drift.mjs`** falha o CI se um slug declarado no
  curriculum.ts não tiver JSON correspondente.

### Artefatos de apoio já criados

| Arquivo | O que é |
|---|---|
| `scripts/seeds/_catalogo-servicos-aws.json` | **106 serviços**, cada um com família, módulo de destino, chave de ícone, prioridade e papel. Fonte da verdade. |
| `scripts/validate_cobertura_servicos.py` | Cruza catálogo × conteúdo. Falha se serviço `estrutural`/`padrao` estiver catalogado mas ausente do texto. |
| `scripts/validate_bedrock_blocks.py` | Valida shape dos blocos. Rodar até `0 erros`. |
| `scripts/seeds/articles/_BEDROCK_AUTHORING_SPEC.md` | Shape exato de cada tipo de bloco. **Leitura obrigatória antes de escrever.** |
| `frontend/src/components/article/AwsIcon.tsx` | Catálogo de 73 glifos SVG (65 AWS + 8 externos). |
| `frontend/src/components/article/AwsDiagram.tsx` | Diagrama com ícones, arestas medidas no DOM e passo a passo interativo. |
| `frontend/src/app/dev-preview/[slug]/page.tsx` | Preview local (só dev) lendo os seeds do disco. |

---

## 2. O que vamos construir

**Seis módulos de referência de serviço**, substituindo os módulos 17–19.
Trilha: **28 → 31 módulos**.

| # | Slug | Título | Serviços |
|---|---|---|---|
| M1 | `bedrock-servicos-canais-borda` | Canais e borda: como o pedido chega até o modelo | 14 |
| M2 | `bedrock-servicos-compute-orquestracao` | Compute, orquestração e estado | 17 |
| M3 | `bedrock-servicos-dados-retrieval` | Dados, retrieval e conhecimento | 13 |
| M4 | `bedrock-servicos-ia-especializada` | IA especializada e ML clássico: quando não usar o LLM | 15 |
| M5 | `bedrock-servicos-seguranca-conformidade` | Segurança, identidade e conformidade | 16 |
| M6 | `bedrock-servicos-observabilidade-finops` | Observabilidade, FinOps e entrega | 16 |

Os 15 restantes do catálogo são peças do próprio Bedrock, já cobertas pelos
módulos 1–14. Estão no catálogo só para fechar o mapa.

---

## 3. Decisões já tomadas

**Substituir, não empilhar.** Os módulos 17–19 tratam ~45 serviços em nível de
mapa; o catálogo tem 106. Empilhar referência sobre survey daria 9 módulos de
serviço numa trilha de 28 e faria o leitor ler a mesma tabela duas vezes.

**Migração obrigatória** — de cada módulo absorvido, nada do que já funciona pode
se perder:

| Do módulo 17 | Para |
|---|---|
| `decision_box` "Chat corporativo no navegador…" | M1 |
| `decision_box` "Processar 40 mil documentos por mês…" | M2 |
| `callout` danger "O erro nº 1 desta camada: timeout na borda" | M1 |
| `callout` warning "O teto de 15 minutos e as três saídas" | M2 |
| `callout` danger "Os três erros clássicos deste desenho" (fila) | M2 |
| `callout` warning "Histórico infinito é bug de custo" | M2 |
| `aws_diagram` "Streaming de token até o navegador" | M1 |
| `flow_diagram` "Passo a passo de um pipeline assíncrono resiliente" | M2 |
| `stack_flow` "Passo a passo de um atendimento por voz com IA" | M1 |
| `code_block` `borda/ws_conversa.py` | M1 |
| `code_block` `estado/sessao.py` | M2 |
| `matrix_diagram` "Qual combinação usar em cada fluxo" | M2 |

| Do módulo 18 | Para |
|---|---|
| `decision_box` "Piloto de RAG com 30 mil documentos…" | M3 |
| `callout` warning "Confirme dois números antes de decidir" | M3 |
| `callout` success "Athena é a resposta certa para pergunta de agregação" | M3 |
| `callout` success "A economia mais previsível que existe" | M4 |
| `callout` success "Duas peças do SageMaker que quase todo projeto deveria usar" | M4 |
| `callout` danger "O passo 4 é o que ninguém faz e todo mundo lamenta" | M3 |
| `aws_diagram` "O pipeline que combina IA especializada e generativa" | M4 |
| `node_graph` "Quem faz o quê na camada de dados e mídia" | M3 |
| `stack_flow` "Da fonte ao índice, em sete passos" | M3 |

| Do módulo 19 | Para |
|---|---|
| `code_block` `iam/politica-app-credito.json` | M5 |
| `callout` success "A negação condicional é o que impressiona a auditoria" | M5 |
| `callout` warning "Um endpoint de IA exposto é um cartão de crédito exposto" | M5 |
| `callout` info "Endpoint privado resolve mais que segurança" | M5 |
| `callout` danger "Varra a origem antes de indexar, não depois" | M5 |
| `layer_stack` "Os três níveis de registro" | M6 |
| `comparison_table` "Pergunta da auditoria / quem responde" | M6 |
| `callout` danger "O log de invocação é um passivo de privacidade" | M6 |
| `code_block` `obs/telemetria.py` | M6 |
| `callout` warning "Log de IA não pode ser texto solto" | M6 |
| `callout` success "Orçamento mensal avisa tarde demais" | M6 |
| `callout` info "Prompt e guardrail são artefatos versionados" | M6 |
| `list` "Checklist do dia 1" | Dividir: itens 1–7 → M5, itens 8–14 → M6 |

---

## 4. Contrato técnico

### Anatomia obrigatória por serviço

Todo serviço `estrutural` ou `padrao` responde **quatro perguntas fixas**:

| Coluna | Regra |
|---|---|
| **O que é** | Uma frase, sem jargão. Nunca começar com "serviço gerenciado que…" |
| **O que soma ao Bedrock** | O vínculo **específico** com IA. Se puder ser escrito sem mencionar IA, o serviço não pertence a esta trilha |
| **Quando usar** | Um cenário concreto, não uma categoria |
| **O limite que decide** | O número/teto/custo que muda a arquitetura. Valor incerto → "confirme no console" |

Entrega: `comparison_table` de 4 colunas por família (3 a 6 linhas).
Serviço `nicho` pode ficar só na linha da tabela.

**Tratamento estendido** — obrigatório para os `estrutural`:
`paragraph` (3–5 frases) + **um** de {`code_block`, `flow_diagram`,
`annotated_formula`} + `callout` com o erro clássico.

### Estrutura fixa do módulo

```
1.  paragraph        abertura: o problema que esta camada resolve
2.  section          "Como escolher nesta camada" → list (3 perguntas) + callout
3.  section por família (3 a 5 por módulo)
      ├─ paragraph        o que a família resolve
      ├─ comparison_table  ← a anatomia de 4 campos
      ├─ tratamento estendido dos estruturais
      └─ callout          o gotcha da família
4.  aws_diagram      a camada inteira, com steps interativos
5.  section          "Combinações que se repetem" → matrix_diagram
6.  section          "Erros clássicos desta camada" → list (6 a 8)
7.  quiz × 3         cada um sobre um serviço diferente
8.  callout          próximo passo
```

**Alvo:** 42–50 blocos · `readTime` 19–22 · `xp` 80 · `level` `'advanced'`

### Bloco `aws_diagram`

```json
{ "type": "aws_diagram", "data": {
  "title": "…", "caption": "argumentativo: o que concluir do diagrama",
  "groups": [ { "label": "Camada", "kind": "account|vpc|region|plain",
                "nodes": [ {"id":"gw","service":"apigateway","label":"opcional","note":"opcional"} ] } ],
  "edges": [ {"from":"gw","to":"fn","label":"opcional","style":"solid|dashed"} ],
  "steps": [ {"label":"…","detail":"…","nodes":["gw","fn"],"edges":["gw>fn"]} ]
}}
```

Regras que o validador **falha** se quebrar:
- 1–8 grupos, cada um com ≥1 nó; `id` único no diagrama inteiro.
- `edges.from`/`to` precisam referenciar `id` existente (aresta órfã some no render).
- `steps.edges` no formato `"from>to"`, correspondendo a aresta declarada.
- `service` precisa existir em `AwsIcon.tsx` (senão vira aviso e cai no genérico).
- **Prefira 4 grupos.** Com 5–6 o diagrama estoura a largura e a última coluna
  fica fora da tela (tem scroll, mas prejudica a leitura).

### Comandos de verificação

```bash
# Blocos (rodar até 0 erros)
python3 scripts/validate_bedrock_blocks.py 'scripts/seeds/articles/bedrock-*.json'

# Cobertura de serviços (0 erros e 0 avisos ao final da série)
python3 scripts/validate_cobertura_servicos.py
python3 scripts/validate_cobertura_servicos.py --pendente   # pauta de autoria

# Drift currículo ↔ seeds
node scripts/check-curriculum-seed-drift.mjs

# Frontend
cd frontend && npx tsc --noEmit -p tsconfig.json && npm run lint && npm test

# Ver renderizado (dev; a rota real depende de Postgres + backend Go)
cd frontend && npm run dev
# http://localhost:3000/dev-preview/<slug>
```

---

## 5. Armadilhas conhecidas

Coisas que custaram tempo e uma sessão nova não teria como saber:

1. **Python do repo é 3.9.** Scripts com anotações modernas (`str | None`,
   `list[str]`) precisam de `from __future__ import annotations` no topo.

2. **Os primitives declaram um contrato que o CMS não honra.** Dois bugs já
   corrigidos, mas o padrão pode se repetir com outro primitive:
   - `MatrixDiagram` declarava `data: number[][]` e chamava `val.toFixed()` —
     célula de texto derrubava a **página inteira**. Corrigido para aceitar
     `(number | string)[][]`.
   - `NodeGraph` declarava `legend?: string` e o adapter passa
     `[{label, color}]` → *"Objects are not valid as a React child"*. Corrigido.
   - **Lição:** antes de usar um primitive novo, confira a assinatura em
     `frontend/src/components/article/primitives.tsx` contra o que o adapter
     em `BlockRenderer.tsx` realmente passa. Testes não pegavam isso porque
     cobriam o formato declarado, não o formato enviado.
   - Regressão coberta em `frontend/src/tests/render/primitives-cms-contract.test.tsx`.

3. **O tipo `image` é proibido.** CSP + allowlist de host. Use diagramas.

4. **Ícones AWS são glifos próprios**, não os AWS Architecture Icons oficiais.
   A arte oficial tem termos de uso e redistribuí-la no bundle é decisão do dono
   do projeto. Para trocar: substituir o campo `glyph` de cada entrada mantendo
   as chaves — nada mais muda. Nota completa no topo do `AwsIcon.tsx`.

5. **`scripts/seeds/article-mappings.json` está desatualizado** — não contém a
   trilha Bedrock. É gerado por `scripts/import-blocks/src/extract-curriculum.ts`,
   que **não está no CI nem no deploy**. Os 28 módulos atuais funcionam sem ele.
   Não tente "consertar" durante esta série; é assunto separado.

6. **`trail-bedrock` está só em `hub-ia`**, na 12ª posição de 14, e fora do
   `hub-aws` — apesar do CLAUDE.md dizer que Bedrock é a ponte para o anel pago.
   Também é assunto separado, mas vale saber.

7. **Existe um diagrama profissional em `drawio-tools/`** com ícones oficiais da
   AWS (`completo-todas-fases.drawio` / `.png` / `.svg`), documentando a própria
   plataforma. É "IA como ferramenta" (Bedrock isolado numa faixa assíncrona),
   não "IA como centro". Não é material da trilha.

---

## 6. Etapa 0 — os 16 ícones

Antes de qualquer módulo. Adicionar em `frontend/src/components/article/AwsIcon.tsx`
(mapa `AWS_SERVICES`) **e** em `scripts/validate_bedrock_blocks.py` (set `AWS_SERVICES`).

| Chave | Rótulo | Categoria | Glifo sugerido (reaproveitar de `G.*`) |
|---|---|---|---|
| `amplify` | AWS Amplify | `network` | `G.window` |
| `chime` | Chime SDK | `integration` | `G.mic` |
| `endusermessaging` | End User Messaging | `integration` | `G.broadcast` |
| `lakeformation` | Lake Formation | `analytics` | `G.shield` |
| `datazone` | DataZone | `analytics` | `G.graph` |
| `frauddetector` | Fraud Detector | `ai` | `G.eye` |
| `q` | Amazon Q | `ai` | `G.sparkle` |
| `organizations` | Organizations | `security` | `G.graph` |
| `controltower` | Control Tower | `security` | `G.audit` |
| `securityhub` | Security Hub | `security` | `G.shield` |
| `shield` | AWS Shield | `security` | `G.shield` |
| `otel` | OpenTelemetry | `management` | `G.trace` |
| `computeoptimizer` | Compute Optimizer | `management` | `G.monitor` |
| `cdk` | CDK / IaC | `management` | `G.cube` |
| `codepipeline` | CodePipeline | `management` | `G.workflow` |
| `ecr` | Amazon ECR | `compute` | `G.container` |

Só criar glifo novo se nenhum existente servir. Depois:
`python3 scripts/validate_cobertura_servicos.py` deve zerar os avisos.

---

## 7. Etapas 1 a 6 — os módulos

> **Ordem recomendada:** M4 → M5 → M6 → M1 → M2 → M3.
> M4 primeiro porque tem a tese mais forte, menor dependência dos outros, e
> valida a anatomia de 4 campos com o menor risco. M3 por último porque depende
> de decisões de custo que M4 e M6 fixam.

Para cada módulo abaixo: entrada pronta do `curriculum.ts`, tese, famílias com
seus serviços, quem ganha tratamento estendido, spec do diagrama e tópicos de quiz.

---

### M4 — `bedrock-servicos-ia-especializada` *(escrever primeiro)*

```ts
{
  slug: 'bedrock-servicos-ia-especializada',
  title: 'IA especializada e ML clássico: quando não usar o LLM',
  icon: '🎯',
  xp: 80,
  readTime: 20,
  desc: 'A família de serviços que faz uma coisa só, muito bem e muito barato: Textract, Comprehend, Transcribe, Polly, Translate, Rekognition, Personalize, Fraud Detector, Amazon Q — mais as peças do SageMaker que todo projeto de Bedrock deveria usar sem treinar nada. Onde cada um substitui ou prepara a chamada de modelo.',
  seoDesc: 'Serviços de IA especializada da AWS junto do Bedrock: Textract, Comprehend, Transcribe, Rekognition e SageMaker Ground Truth — quando não usar o LLM. PT-BR.',
  keywords: 'textract comprehend transcribe bedrock, quando não usar llm, ia especializada aws, sagemaker ground truth golden set, augmented ai revisão humana',
  prerequisites: ['bedrock-claude-na-aws-ecossistema'],
  nextSuggested: ['bedrock-servicos-seguranca-conformidade'],
  level: 'advanced',
}
```

**Tese:** metade do que se manda para o LLM é resolvido melhor e mais barato por
um serviço dedicado. É a alavanca nº 1 do playbook de custo aplicada a serviços
concretos.

**Famílias e serviços:**

| Família | Serviços | Estruturais |
|---|---|---|
| Documento e texto | Textract, Comprehend, Translate | Textract, Comprehend |
| Voz | Transcribe, Polly | Transcribe |
| Visão | Rekognition | — |
| Decisão especializada | Personalize, Fraud Detector | — |
| Assistente pronto | Amazon Q Developer / Q Business | — |
| SageMaker para quem usa Bedrock | Ground Truth, A2I, treino e hospedagem, JumpStart, Model Monitor/Clarify, Pipelines/Feature Store | Ground Truth, A2I |

**Tratamento estendido:**
- **Textract** — `flow_diagram` do pipeline OCR → regra → modelo, mostrando o que
  cada etapa remove do caminho do LLM.
- **Comprehend** — `code_block` de detecção/mascaramento de PII antes do prompt.
- **Ground Truth** — `paragraph` + `callout`: é o que destrava o golden set da
  eval, que por sua vez destrava todas as alavancas de custo (liga com módulo 23).
- **A2I** — `paragraph` + `callout`: é o ramo de revisão do confidence routing
  pronto, a parte que os times constroem às pressas e mal.

**Migrar do módulo 18:** callouts "A economia mais previsível que existe" e
"Duas peças do SageMaker…", e o `aws_diagram` "O pipeline que combina IA
especializada e generativa" (já validado, 12 nós / 12 arestas / 7 passos).

**Diagrama:** reaproveitar o existente. Se refizer, manter 4 grupos.

**Quizzes (serviços distintos):**
1. PDF escaneado inteiro no modelo multimodal → a correção é OCR estrutural antes.
2. Golden set travando a eval → Ground Truth resolve sem treinar nada.
3. Confidence routing precisando de fila de revisão → A2I entrega pronta.

---

### M5 — `bedrock-servicos-seguranca-conformidade`

```ts
{
  slug: 'bedrock-servicos-seguranca-conformidade',
  title: 'Segurança, identidade e conformidade',
  icon: '🛡️',
  xp: 80,
  readTime: 21,
  desc: 'A camada que não aparece no diagrama e decide se o projeto é aprovado: IAM com negação condicional, Identity Center, Cognito, KMS, Secrets Manager, PrivateLink, WAF, Shield, Macie, GuardDuty, Config, Organizations, Control Tower, Audit Manager e Security Hub — cada um com o vínculo específico com uma arquitetura de IA.',
  seoDesc: 'Segurança e conformidade para IA na AWS: IAM, KMS, PrivateLink, WAF, Macie e Organizations junto do Amazon Bedrock — guia PT-BR.',
  keywords: 'segurança bedrock iam kms privatelink, macie antes de indexar rag, waf endpoint ia custo, organizations scp modelo homologado, conformidade ia aws',
  prerequisites: ['bedrock-servicos-ia-especializada'],
  nextSuggested: ['bedrock-servicos-observabilidade-finops'],
  level: 'advanced',
}
```

**Tese:** um controle ausente não impede nada durante o desenvolvimento e vira
bloqueio absoluto na véspera do lançamento, quando não dá mais para retroagir.

**Famílias e serviços:**

| Família | Serviços | Estruturais |
|---|---|---|
| Identidade | IAM, Identity Center, Cognito | os três |
| Segredo e criptografia | KMS, Secrets Manager, Parameter Store | KMS, Secrets Manager |
| Rede | PrivateLink / VPC endpoints, WAF, Shield | PrivateLink, WAF |
| Proteção de dado | Macie, GuardDuty | Macie |
| Governança organizacional | Organizations + SCP, Control Tower, Config, Audit Manager, Security Hub | Organizations |

**Tratamento estendido:**
- **IAM** — migrar o `code_block` `iam/politica-app-credito.json` + o callout
  "A negação condicional é o que impressiona a auditoria".
- **PrivateLink** — callout "Endpoint privado resolve mais que segurança"
  (decisão de rede que vira controle de identidade verificável na policy).
- **WAF** — callout "Um endpoint de IA exposto é um cartão de crédito exposto";
  custo como superfície de ataque.
- **Macie** — callout danger "Varra a origem antes de indexar, não depois".
- **Identity Center** — `paragraph` sobre propagar o grupo do funcionário até o
  filtro de metadados do retrieval (liga com o case de copiloto interno).

**Diagrama:** 4 grupos — *Identidade* / *Rede e segredo* / *Dado e conteúdo* /
*Governança organizacional*, com passos mostrando o caminho de uma requisição
autenticada até o retrieval filtrado. Nós: `cognito`, `identitycenter`, `iam`,
`privatelink`, `waf`, `kms`, `secretsmanager`, `macie`, `guardrails`,
`knowledgebases`, `organizations`, `config`.

**Checklist do dia 1** — itens 1 a 7 do módulo 19 (role por app, negação
condicional, endpoint de interface, CMK, gerenciador de segredos, logging com
retenção acordada, varredura de sensibilidade).

**Quizzes:**
1. Garantir que nenhuma app invoque sem guardrail → negação condicional na policy.
2. Onde entra o Macie no ciclo de vida do RAG → antes da indexação.
3. Endpoint de chat autenticado mas sem limite de taxa → risco é custo.

---

### M6 — `bedrock-servicos-observabilidade-finops`

```ts
{
  slug: 'bedrock-servicos-observabilidade-finops',
  title: 'Observabilidade, FinOps e entrega',
  icon: '📈',
  xp: 80,
  readTime: 21,
  desc: 'O que você mede e como isso sobe: CloudWatch, Logs Insights, Synthetics, X-Ray, OpenTelemetry, AgentCore Observability, CloudTrail e model invocation logging, Cost Explorer, Budgets, Cost Anomaly Detection, CUR, Compute Optimizer, IaC, CodePipeline e ECR. Os três registros diferentes que a auditoria pede e a instrumentação que não é reconstituível depois.',
  seoDesc: 'Observabilidade e FinOps de IA na AWS: CloudWatch, X-Ray, CloudTrail, invocation logging, Cost Explorer e Budgets com Amazon Bedrock — PT-BR.',
  keywords: 'observabilidade llm aws, model invocation logging bedrock, x-ray rastreamento ia, cost anomaly detection ia, budgets bedrock, iac guardrail versionado',
  prerequisites: ['bedrock-servicos-seguranca-conformidade'],
  nextSuggested: ['bedrock-servicos-canais-borda'],
  level: 'advanced',
}
```

**Tese:** sem instrumentação no dia 1 não existe segunda onda — o histórico não é
reconstituível, e a pergunta "quanto economizamos?" fica sem resposta defensável.

**Famílias e serviços:**

| Família | Serviços | Estruturais |
|---|---|---|
| Métrica e log | CloudWatch, Logs Insights, Synthetics | CloudWatch |
| Rastreamento | X-Ray, ADOT, AgentCore Observability | X-Ray |
| Auditoria | CloudTrail, model invocation logging | ambos |
| Custo | Cost Explorer, Budgets, Cost Anomaly Detection, CUR, Compute Optimizer | Cost Explorer, Budgets, Anomaly Detection |
| Entrega | CDK/CloudFormation/Terraform, CodePipeline/CodeBuild, ECR | IaC |

**Tratamento estendido:**
- **Os três registros** — migrar o `layer_stack` "Os três níveis de registro" e a
  `comparison_table` "Pergunta da auditoria / quem responde / se faltar".
- **Model invocation logging** — callout danger "é um passivo de privacidade".
- **CloudWatch** — migrar `code_block` `obs/telemetria.py` (publica `RazaoCache`).
- **Cost Anomaly Detection** — callout "Orçamento mensal avisa tarde demais".
- **IaC** — callout "Prompt e guardrail são artefatos versionados".

**Diagrama:** 4 grupos — *Aplicação instrumentada* / *Métrica e traço* /
*Auditoria* / *Custo*, com passos seguindo uma requisição até virar métrica,
trilha e linha de fatura atribuída ao squad.

**Checklist do dia 1** — itens 8 a 14 do módulo 19 (inference profile, alarme de
variação diária, métricas desde a primeira chamada, log estruturado separado do
conteúdo, prompt/guardrail versionados, rastreamento ligado, sonda sintética).

**Quizzes:**
1. Auditoria pergunta o conteúdo de 4 meses atrás com CloudTrail ligado → não
   responde; é o invocation logging, e não é reconstituível.
2. Qual camada roda em 100% do tráfego → a determinística (custo ~zero).
3. Laço descontrolado consumindo orçamento → Anomaly Detection pega no mesmo dia.

---

### M1 — `bedrock-servicos-canais-borda`

```ts
{
  slug: 'bedrock-servicos-canais-borda',
  title: 'Canais e borda: como o pedido chega até o modelo',
  icon: '🔌',
  xp: 80,
  readTime: 20,
  desc: 'Onde o humano encosta e por onde o pedido entra: Amazon Connect, Lex, Chime SDK, SES, End User Messaging, Amplify, as três variantes do API Gateway, AppSync, Function URL com streaming, ALB, CloudFront e Route 53. O timeout de borda, o orçamento de latência em voz e o passo a passo do streaming token a token.',
  seoDesc: 'Canais e borda para IA na AWS: Amazon Connect, Lex, API Gateway WebSocket, AppSync e CloudFront com Amazon Bedrock — guia PT-BR.',
  keywords: 'api gateway websocket streaming llm, amazon connect lex bedrock, timeout borda resposta llm, appsync subscription ia, function url response streaming',
  prerequisites: ['bedrock-servicos-observabilidade-finops'],
  nextSuggested: ['bedrock-servicos-compute-orquestracao'],
  level: 'advanced',
}
```

**Tese:** a borda decide se a sua arquitetura suporta resposta longa. Escolher
errado não dá erro no teste — quebra em produção justamente nas perguntas
difíceis, e trocar depois é refazer a camada inteira.

**Famílias e serviços:**

| Família | Serviços | Estruturais |
|---|---|---|
| Canais de atendimento | Amazon Connect, Lex, Chime SDK | Connect, Lex |
| Canais assíncronos | SES, End User Messaging | — |
| Borda HTTP | API Gateway REST, API Gateway HTTP, ALB, CloudFront, Route 53 | API Gateway REST |
| Borda com streaming | API Gateway WebSocket, AppSync, Lambda Function URL | WebSocket |
| Front | Amplify | — |

**Tratamento estendido:**
- **API GW WebSocket** — migrar `code_block` `borda/ws_conversa.py` e o
  `aws_diagram` "Streaming de token até o navegador" (9 nós / 10 arestas / 6 passos).
- **Timeout de borda** — migrar o callout danger "O erro nº 1 desta camada".
- **Connect + Lex** — migrar o `stack_flow` "Passo a passo de um atendimento por
  voz com IA" (7 passos) e o callout "Em voz, o orçamento de latência é somado".
- **Decisão de borda** — migrar o `decision_box` "Chat corporativo no navegador…".

**Diagrama:** reaproveitar o de streaming.

**Quizzes:**
1. Funciona no teste, quebra nas perguntas complexas → timeout de borda; streaming.
2. Campo com formato conhecido (nº de pedido, CPF) → Lex coleta sem gastar modelo.
3. Requisito de quota por área + streaming → WebSocket, não Function URL.

---

### M2 — `bedrock-servicos-compute-orquestracao`

```ts
{
  slug: 'bedrock-servicos-compute-orquestracao',
  title: 'Compute, orquestração e estado',
  icon: '⚙️',
  xp: 80,
  readTime: 22,
  desc: 'Onde o código roda e quem coordena os passos: Lambda, ECS/Fargate, EKS, EC2, Batch, AgentCore Runtime, Step Functions nos dois modos, EventBridge com Pipes e Scheduler, SQS, SNS — mais onde mora o estado da conversa (DynamoDB, ElastiCache, Aurora, AgentCore Memory). O teto de 15 minutos e a entrega ao-menos-uma-vez.',
  seoDesc: 'Compute e orquestração para IA na AWS: Lambda, Fargate, Step Functions, EventBridge, SQS e DynamoDB com Amazon Bedrock — guia PT-BR.',
  keywords: 'lambda teto 15 minutos agent, step functions bedrock pipeline, eventbridge sqs idempotência ia, dynamodb estado conversa ttl, agentcore runtime sessão longa',
  prerequisites: ['bedrock-servicos-canais-borda'],
  nextSuggested: ['bedrock-servicos-dados-retrieval'],
  level: 'advanced',
}
```

**Tese:** o teto de 15 minutos e a entrega ao-menos-uma-vez definem mais decisões
de arquitetura do que qualquer preferência de stack.

**Famílias e serviços:**

| Família | Serviços | Estruturais |
|---|---|---|
| Compute | Lambda, ECS/Fargate, EKS, EC2, Batch, AgentCore Runtime | Lambda, Fargate, AgentCore Runtime |
| Orquestração | Step Functions Standard, Step Functions Express | SFN Standard |
| Eventos e filas | EventBridge, Pipes, Scheduler, SQS, SNS | EventBridge, SQS |
| Estado | DynamoDB, ElastiCache/MemoryDB, Aurora Serverless, AgentCore Memory | DynamoDB |

**Tratamento estendido:**
- **Lambda** — migrar callout "O teto de 15 minutos e as três saídas".
- **SQS + EventBridge** — migrar `flow_diagram` "Pipeline assíncrono resiliente"
  (7 passos) e o callout danger dos três erros (invisibilidade, idempotência, DLQ).
- **DynamoDB** — migrar `code_block` `estado/sessao.py` e o callout "Histórico
  infinito é bug de custo".
- **Decisão de orquestrador** — migrar o `decision_box` "Processar 40 mil
  documentos por mês…".

**Diagrama:** 4 grupos — *Entrada de trabalho* / *Compute* / *Orquestração* /
*Estado*, com passos de um documento atravessando o pipeline assíncrono.

**Combinações que se repetem:** migrar o `matrix_diagram` "Qual combinação usar
em cada fluxo" (5 fluxos × borda/compute/orquestração/estado).

**Quizzes:**
1. Registros duplicados no destino → invisibilidade < processamento + idempotência.
2. Agent ultrapassando 15 min → quebrar em passos com Step Functions.
3. Custo crescendo com a conversa → histórico infinito; janela deslizante.

---

### M3 — `bedrock-servicos-dados-retrieval` *(escrever por último)*

```ts
{
  slug: 'bedrock-servicos-dados-retrieval',
  title: 'Dados, retrieval e conhecimento',
  icon: '🗄️',
  xp: 80,
  readTime: 20,
  desc: 'A camada que alimenta o modelo: S3 e suas classes, S3 Vectors, OpenSearch Serverless, Aurora pgvector, Neptune Analytics, Kendra, Athena, Glue, Redshift, Lake Formation, DataZone e Kinesis. Os vector stores comparados pelo critério que decide de verdade — quanto custam parados — e por que agregação é consulta, não retrieval.',
  seoDesc: 'Camada de dados e retrieval para IA na AWS: vector stores comparados, Kendra, Athena e Glue com Amazon Bedrock — guia PT-BR.',
  keywords: 'vector store aws comparação custo, opensearch serverless s3 vectors pgvector, kendra retriever bedrock, athena agregação rag, lake formation permissão rag',
  prerequisites: ['bedrock-servicos-compute-orquestracao'],
  nextSuggested: ['bedrock-rag-producao-padroes'],
  level: 'advanced',
}
```

**Tese:** a escolha do vector store é decisão de custo fixo, não de qualidade de
busca — e em piloto ela domina a conta inteira.

**Famílias e serviços:**

| Família | Serviços | Estruturais |
|---|---|---|
| Armazenamento | S3, S3 Intelligent-Tiering | S3 |
| Vector stores | S3 Vectors, OpenSearch Serverless, Aurora pgvector, Neptune Analytics | S3 Vectors, OpenSearch, pgvector |
| Busca gerenciada | Kendra | — |
| Consulta e lago | Athena, Glue, Redshift, Kinesis | Athena |
| Governança de dado | Lake Formation, DataZone | — |

**Tratamento estendido:**
- **Vector stores** — migrar a `comparison_table` com a coluna "Custa quando
  parado?", o `decision_box` do piloto e o callout "Confirme dois números antes
  de decidir".
- **Athena** — migrar o callout "Athena é a resposta certa para pergunta de
  agregação"; `code_block` de tool que roda SQL parametrizado.
- **S3** — versionamento como requisito de rastreabilidade (liga com o case de IDP).
- **Ingestão** — migrar o `stack_flow` "Da fonte ao índice, em sete passos" e o
  callout danger sobre metadado obrigatório.

**Diagrama:** migrar/adaptar o `node_graph` "Quem faz o quê na camada de dados"
para `aws_diagram` com 4 grupos: *Guardar* / *Preparar* / *Indexar e buscar* /
*Consultar*.

**Quizzes:**
1. Piloto caro com volume baixo → capacidade mínima do índice domina.
2. "Quantos contratos vencem no trimestre?" → tool com SQL, não RAG.
3. Domínio com códigos e siglas errando → busca híbrida exige índice léxico.

---

## 8. Etapa 7 — rewiring do currículo

Em `frontend/src/lib/curriculum.ts`, dentro de `trail-bedrock`:

1. **Remover** as três entradas: `bedrock-servicos-borda-orquestracao`,
   `bedrock-servicos-dados-midia`, `bedrock-servicos-seguranca-observabilidade`.
2. **Inserir** as seis novas entre `bedrock-claude-na-aws-ecossistema` (16) e
   `bedrock-rag-producao-padroes`, na ordem M4 → M5 → M6 → M1 → M2 → M3.
3. **Ajustar** `bedrock-claude-na-aws-ecossistema.nextSuggested` →
   `['bedrock-servicos-ia-especializada']`.
4. **Ajustar** `bedrock-rag-producao-padroes.prerequisites` →
   `['bedrock-servicos-dados-retrieval']`.
5. **Apagar** os três JSONs absorvidos em `scripts/seeds/articles/` **só depois**
   de confirmar que todo item da tabela de migração da seção 3 foi transplantado.
6. Atualizar `desc` da trilha e a `description` em
   `frontend/src/app/aws-bedrock/page.tsx` (hoje dizem "28 módulos").
7. Se necessário, adicionar os slugs removidos à `KNOWN_MISSING_ALLOWLIST` em
   `scripts/check-curriculum-seed-drift.mjs` — ou, melhor, garantir que não
   sobrem referências.

**Verificar a cadeia** (deve dar 31/31, sem órfão):

```bash
python3 - <<'EOF'
import re
src = open('frontend/src/lib/curriculum.ts').read()
blk = src[src.index("id: 'trail-bedrock'"):src.index("id: 'trail-anthropic-ai'")]
slugs = re.findall(r"slug: '([a-z0-9-]+)'", blk)
nxt = dict(re.findall(r"slug: '([a-z0-9-]+)'[\s\S]*?nextSuggested: \[([^\]]*)\]", blk))
cur, seen = slugs[0], []
while cur and cur not in seen:
    seen.append(cur); n = nxt.get(cur,'').strip().strip("'"); cur = n.split("'")[0] if n else None
print(f"{len(slugs)} módulos · cadeia {len(seen)} · órfãos: {[s for s in slugs if s not in seen] or 'nenhum'}")
EOF
```

---

## 9. Definição de pronto

- [ ] 16 ícones adicionados em `AwsIcon.tsx` **e** em `validate_bedrock_blocks.py`
- [ ] 6 artigos JSON com `validate_bedrock_blocks.py` → **0 erros**
- [ ] `validate_cobertura_servicos.py` → **0 erros e 0 avisos**
- [ ] 6 `aws_diagram`, um por módulo, com `steps`, máximo 4 grupos
- [ ] 18 quizzes, sem serviço repetido dentro do mesmo módulo
- [ ] Toda linha da tabela de migração (seção 3) transplantada e conferida
- [ ] 3 JSONs absorvidos removidos
- [ ] `curriculum.ts` religado: 31 módulos, cadeia sem órfão
- [ ] `desc` da trilha e metadata da landing atualizados
- [ ] `node scripts/check-curriculum-seed-drift.mjs` em sincronia
- [ ] `npx tsc --noEmit` · `npm run lint` · `npm test` limpos
- [ ] Revisão visual em `/dev-preview/<slug>` dos 6 módulos

---

## 10. Decisões em aberto

Precisam de resposta do dono do projeto antes ou durante a execução:

1. **Substituir ou empilhar?** Este plano assume substituir os módulos 17–19.
   O custo é reescrever conteúdo que hoje funciona e está validado. A alternativa
   — manter os três e só acrescentar os seis — resulta em trilha maior (34
   módulos) e com sobreposição. **Decisão pendente.**

2. **Ícones oficiais da AWS.** Hoje usamos glifos próprios por causa dos termos de
   uso da arte oficial. O repo já usa os shapes oficiais no `drawio-tools/` (uso
   interno). Embutir no bundle público é outra coisa. **Decisão pendente.**

3. **`trail-bedrock` fora do `hub-aws`.** Fica só em `hub-ia`, 12ª de 14, apesar
   de o CLAUDE.md posicioná-lo como ponte para o anel pago de certificações.
   Assunto separado, mas afeta descoberta.

4. **`article-mappings.json` desatualizado.** Não contém a trilha Bedrock; o
   gerador não está no CI. Não bloqueia esta série.

---

## Apêndice — a pauta de autoria, gerada

```bash
python3 scripts/validate_cobertura_servicos.py --pendente
```

Imprime, por módulo, cada serviço com prioridade e papel. É a lista de trabalho:
enquanto houver serviço `estrutural` ou `padrao` sem citação no conteúdo, o
validador falha. É assim que "falamos de todos" deixa de ser aspiração.
