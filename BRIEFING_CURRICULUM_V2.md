# Briefing: Expansão do Currículo FFV Academy para Ciclo Completo

**Destinatário:** Contexto novo do Claude Code que vai implementar as mudanças.
**Origem:** Fernando Franco Valle — dono do FFV Academy.
**Data:** 2026-04-19.
**Objetivo:** Expandir o currículo atual (171 módulos, 18 trilhas, 4 hubs) para um ciclo de conhecimento COMPLETO — do básico ao avançado — que prepara um programador para a era AI-native. Sem gaps conceituais, com prerequisites encadeados, capstones hands-on e funil de certificação.

---

## 1. Contexto do projeto (leia antes de tudo)

**FFV Academy** — blog técnico gamificado em português, 100% estático (Next.js 16 + `output: "export"`), hospedado na Hostinger, zero backend. Estado 100% em `localStorage` (`ffv_academy`).

**Filosofia editorial:** zero hype, zero clickbait. Cada artigo ensina internals, trade-offs reais, com quiz de 3 questões que dá XP. Pedagogia séria para devs — não conteúdo raso.

**Leia ANTES de começar:**
- `CLAUDE.md` na raiz (regras de ouro — TS + testes + build validados antes de "pronto").
- `src/lib/curriculum.ts` (fonte da verdade do currículo).
- `src/lib/constants.ts` (níveis, XP, badges).
- `src/components/ModuleLayout.tsx` + `src/components/article/primitives.tsx` (template de artigo).
- Artigos existentes em `src/app/aprenda/<slug>/page.tsx` para referência de tom e profundidade.

**Regras inegociáveis:**
- Idioma: português brasileiro em TODO conteúdo.
- Slugs são IDs permanentes em `localStorage` — **nunca renomear** sem migration plan.
- Rodar `npx tsc --noEmit && npm test && npm run build` antes de declarar qualquer trilha pronta.
- Adicionar rota nova → atualizar array em `scripts/deploy-hostinger.sh`.
- Nada hardcoded — usar `var(--ffv-*)` em CSS, `STORAGE_KEYS` em storage, `GAME_CONFIG` em números mágicos.
- Quizzes com distratores realistas e `explanations` que ensinam (não só "a resposta é X").

---

## 2. Estado atual do currículo

**18 trilhas · 171 módulos · 4 hubs:**

| Hub | Trilhas | Módulos |
|---|---|---|
| IA | Trail 1, 2, 3, 9 | 28 |
| AWS | Trail 4, 5 | 37 |
| Engenharia | Trail 7, 8, 10, 11 | 28 |
| Claude/Anthropic | Trail 13, 17, 18 | 35 |
| **Órfãs (sem hub)** | Trail 12, 14, 15, 16 | 39 |
| **Outros** | — | 4 (vários soltos) |

Features ativas: badges (50+), níveis (12), SRS, daily module, simulados pagos (3), playlists (5+), certificados, glossário, referral.

**Páginas soltas (não-trilha):** `/cheatsheet`, `/playlists`, `/simulados`, `/claude-code-vs-cursor`, `/melhores-ferramentas-ia-codigo-2026`.

---

## 3. Modelo mental: 9 camadas do dev moderno

Para "fechar o ciclo", o currículo precisa cobrir as 9 camadas abaixo. Esta é a lente de análise — marcamos cobertura atual e gap.

| # | Camada | Por quê | Cobertura atual | Gap |
|---|---|---|---|---|
| 1 | **Fundamentos de Computação** | Sem isso, todo o resto é cargo cult | ✅ Trails 12/15/16 | 5º hub "Fundamentos" inexistente — trilhas órfãs |
| 2 | **Programação & Algoritmos** | Linguagem profunda, DS&A, paradigmas | ❌ **TOTAL AUSÊNCIA** | Crítico — não há trilha de linguagem nem DS&A |
| 3 | **Dados & Persistência** | SQL + NoSQL + cache + search | ⚠️ Trail 14 (SQL) só | Falta NoSQL/Cache/Search + Data Engineering |
| 4 | **Construção de Sistemas** | APIs, frontend, mobile, protocolos | ⚠️ Parcial | API Design ausente; frontend ausente |
| 5 | **Arquitetura & Distribuídos** | CAP, padrões, event-driven | ✅ Trail 10 | Falta Clean/DDD/Hexagonal + streaming (Kafka) |
| 6 | **Operação & Confiabilidade** | DevOps, SRE, Security | ✅ Trails 7/11 | Security Engineering como disciplina ausente |
| 7 | **Cloud (AWS)** | Amplitude + profundidade + certs | ⚠️ CLF + SAA | DVA, SAP, Specialties ausentes |
| 8 | **IA Moderna** | LLMs, RAG, agents, evals, fine-tune | ✅ Trails 1/2/9 | Fine-tuning, Evals pro, Safety, Multimodal ausentes |
| 9 | **IA Aplicada ao Dev** | Claude Code, harness, SDK | ✅ Trails 3/13/17/18 | Forte — só aprofundar comparativos |
| 10 | **Produto & Liderança Técnica** | FinOps, decisões, soft skills | ❌ **AUSENTE** | Zero conteúdo |

**Diagnóstico honesto:** o site hoje ensina **IA + Cloud + operação muito bem**, mas **assume** que o leitor já sabe programar e conhece algoritmos. Isso é um gap enorme se a promessa é "ciclo completo". Também não fecha o topo (liderança/produto).

---

## 4. O que precisa ser criado — lista completa triangulada

### 4.1. Infraestrutura editorial (fazer ANTES das trilhas novas)

**T0.1 — Criar 5º hub "Fundamentos"**
- Adicionar `HUBS[4]` em `curriculum.ts` com slug `fundamentos`.
- Mover Trails 12, 14, 15, 16 para esse hub.
- Criar `/fundamentos/page.tsx` com `HubPageClient`.
- Atualizar `GameHUD` nav.

**T0.2 — Capstones em trilhas maduras**
Adicionar módulo final `capstone-<trail>` em cada uma de: 9, 10, 11, 13, 17, 18. É um artigo-projeto hands-on que consolida a trilha inteira num entregável (RAG com eval, Raft em TS, plugin Claude, etc.).

**T0.3 — Grafo de prerequisites navegável**
Página `/mapa` com SVG do grafo de dependências entre trilhas. Usa `prereq` que já existe no schema. Não-bloqueante mas visual.

**T0.4 — Roadmaps visuais (upgrade das playlists)**
Transformar `/playlists` em `/roadmaps` com:
- Jornada linear com % progresso por nó.
- Branching ("agora escolha: IA ou Cloud").
- 4 roadmaps iniciais: "Zero → Staff Eng em IA", "Zero → AWS Pro", "Claude Power User → Harness Eng", "Backend Dev tradicional → AI-Native".

**T0.5 — Quiz consolidado gratuito por trilha**
Cada trilha ganha um `/aprenda/<trail>-final` com 10–15 questões agregadas (fonte: `src/lib/simulados.ts` já tem a engine). Simulado pago vira upsell extenso.

---

### 4.2. Trilhas novas — 12 trilhas, ~110 módulos

Cada trilha abaixo tem: **nome, hub, nível, estimativa de módulos, por quê, esqueleto**. O outro contexto deve expandir cada esqueleto para módulos completos com `slug`, `title`, `icon`, `xp`, `readTime`, `desc`, `seoDesc`, `keywords` seguindo o padrão de `curriculum.ts`.

---

#### **P0 — Lacunas críticas (fazer primeiro)**

##### **Trail 19: Programação Profissional com TypeScript**
- **Hub:** novo hub "Programação" (ou Fundamentos)
- **Nível:** Intermediate
- **Módulos (10):**
  1. `typescript-como-mental-model` — tipos como prova matemática
  2. `narrowing-discriminated-unions` — o núcleo real do TS
  3. `generics-de-verdade` — variance, constraints, conditional types
  4. `tipos-utilitarios-e-quando-nao-usar`
  5. `type-safety-em-boundaries` — Zod, io-ts, validação runtime
  6. `async-await-sem-pegadinha` — promises, AbortController, cancelamento
  7. `erros-como-valores` — Result, neverthrow, por que `throw` quebra
  8. `performance-em-node` — event loop, streams, backpressure
  9. `monorepo-pnpm-turbo` — como times sérios estruturam código
  10. `capstone-cli-tool-ts` — construir CLI tipada end-to-end
- **Por quê:** Site inteiro é TS. Leitor usa TS. Nunca ensinamos TS de verdade. Fecha camada 2.

##### **Trail 20: Estruturas de Dados & Algoritmos para o Dia a Dia**
- **Hub:** novo "Programação"
- **Nível:** Intermediate
- **Módulos (9):**
  1. `big-o-sem-misticismo`
  2. `arrays-hashmaps-e-quando-importam`
  3. `arvores-que-voce-realmente-usa` — BST, heap, trie (sem AVL acadêmico)
  4. `grafos-na-pratica` — BFS/DFS, Dijkstra, quando aparecem em código real
  5. `recursao-e-dp-para-quem-odeia`
  6. `algoritmos-de-string` — substring, regex internals, fuzzy
  7. `sorting-real` — timsort, quickselect, por que lib padrão é suficiente 99%
  8. `estruturas-probabilisticas` — Bloom filter, HyperLogLog, count-min sketch
  9. `capstone-resolver-5-problemas-reais` — não LeetCode, problemas de produção
- **Por quê:** Entrevista exige; engenharia real também. Tom anti-LeetCode: aplicação prática.

##### **Trail 21: API Design & Contratos**
- **Hub:** Engenharia
- **Nível:** Intermediate
- **Módulos (9):**
  1. `rest-maduro` — níveis Richardson, idempotência, HATEOAS raramente
  2. `versionamento-sem-dor` — URL, header, sunset headers
  3. `graphql-quando-faz-sentido` — N+1, dataloader, federation
  4. `grpc-e-protobuf` — RPC tipado, streaming bidirecional
  5. `openapi-como-contrato-vivo` — codegen, mock server, contract testing
  6. `paginacao-filtros-ordenacao` — cursor vs offset, padrões
  7. `idempotency-keys-e-webhooks` — exactly-once na prática
  8. `rate-limiting-e-quotas-em-api` — token bucket, leaky bucket
  9. `capstone-api-rest-produto-completo`
- **Por quê:** Todo backend passa por aqui. Gap absurdo.

##### **Trail 22: Security Engineering**
- **Hub:** Engenharia
- **Nível:** Advanced
- **Módulos (10):**
  1. `threat-modeling-stride`
  2. `authn-vs-authz` — diferença real, armadilhas
  3. `oauth2-oidc-do-zero` — fluxos, PKCE, device code
  4. `jwt-paseto-sessions` — quando JWT não presta
  5. `password-hashing-moderno` — argon2, bcrypt, peppers
  6. `owasp-top-10-com-exemplo-em-codigo`
  7. `secrets-management` — Vault, SOPS, AWS SM
  8. `supply-chain-security` — SBOM, sigstore, dependency confusion
  9. `zero-trust-e-mTLS`
  10. `capstone-pentest-em-app-proprio`
- **Por quê:** Segurança é disciplina própria, não subtópico de Trail 8.

##### **Trail 23: AWS Developer Associate (DVA-C02)**
- **Hub:** AWS
- **Nível:** Intermediate (prereq: Trail 4)
- **Módulos (15):**
  1. `dva-c02-intro`
  2. `lambda-profundo` — cold start, layers, provisioned concurrency
  3. `api-gateway-rest-http-ws`
  4. `dynamodb-para-dev` — partition key, GSI, DynamoDB Streams
  5. `s3-dev-features` — presigned URLs, multipart, event notifications
  6. `step-functions-workflows`
  7. `eventbridge-sqs-sns-para-dev`
  8. `cognito-fluxos` — user pools, identity pools
  9. `kms-encryption-dev`
  10. `cicd-aws-nativo` — CodeBuild, CodeDeploy, CodePipeline
  11. `x-ray-observability`
  12. `secrets-parameter-store`
  13. `ecs-fargate-para-dev`
  14. `cloudformation-sam-cdk`
  15. `simulado-dva-c02`
- **Por quê:** Elo perdido entre CLF e SAA.

---

#### **P1 — Aprofundamento IA & Cloud (próxima onda)**

##### **Trail 24: Data Engineering Moderna**
- **Hub:** novo hub "Dados" ou Engenharia
- **Nível:** Advanced
- **Módulos (10):**
  1. `batch-vs-stream-mental-model`
  2. `dbt-transformacao-como-codigo`
  3. `airflow-vs-dagster-vs-prefect`
  4. `duckdb-e-polars` — a revolução in-process
  5. `data-lake-lakehouse-warehouse`
  6. `cdc-com-debezium`
  7. `kafka-fundamentos` — partições, consumer groups, exactly-once
  8. `iceberg-delta-hudi` — table formats abertos
  9. `qualidade-de-dados` — Great Expectations, tests em SQL
  10. `capstone-pipeline-analytics-completo`

##### **Trail 25: Fine-tuning & Customização de LLMs**
- **Hub:** IA
- **Nível:** Advanced (prereq: Trail 2 ou 9)
- **Módulos (8):**
  1. `quando-fine-tune-vs-rag-vs-prompt`
  2. `sft-supervised-fine-tuning`
  3. `lora-qlora-peft`
  4. `dpo-rlhf-simplificado`
  5. `datasets-para-fine-tuning` — curadoria, dedup, contaminação
  6. `avaliando-fine-tune` — golden set, regression
  7. `deploy-modelo-customizado` — vLLM, TGI, Bedrock custom
  8. `capstone-fine-tune-modelo-especialista`

##### **Trail 26: LLM Evals Profissional**
- **Hub:** IA
- **Nível:** Advanced
- **Módulos (7):**
  1. `evals-como-disciplina` — por que "testar LLM" é diferente
  2. `golden-sets-curadoria`
  3. `llm-as-judge-armadilhas`
  4. `eval-frameworks` — Braintrust, Langfuse, Inspect, Promptfoo
  5. `ab-testing-de-prompt-em-producao`
  6. `regression-testing-para-agents`
  7. `capstone-eval-harness-completo`

##### **Trail 27: AWS Solutions Architect Professional (SAP-C03)**
- **Hub:** AWS
- **Nível:** Expert (prereq: Trail 5)
- **Módulos (18):** estrutura paralela à Trail 5 mas cobrindo Organizations, Control Tower, multi-account, Landing Zone, advanced networking (RAM, Cloud WAN), complex migration strategies, cost allocation tags em escala, simulado SAP-C03 comentado.

##### **Trail 28: FinOps & Cost Engineering**
- **Hub:** Engenharia
- **Nível:** Intermediate
- **Módulos (7):**
  1. `unit-economics-em-software`
  2. `cost-anomaly-detection`
  3. `rightsizing-sem-medo`
  4. `reservas-savings-plans-spot`
  5. `finops-cultura-e-time`
  6. `observability-de-custo` — tags, allocation
  7. `capstone-reducao-de-30-custo`

---

#### **P2 — Diferencial editorial e extensões**

##### **Trail 29: Voice, Vision & Multimodal**
- **Hub:** IA
- **Nível:** Intermediate
- **Módulos (7):** Whisper, TTS (ElevenLabs/OpenAI), Realtime APIs, vision models, OCR moderno, vídeo generation, capstone assistente de voz.

##### **Trail 30: AI Safety, Red Teaming & Alinhamento**
- **Hub:** IA
- **Nível:** Advanced
- **Módulos (7):** jailbreaks, prompt injection, data exfiltration via tools, constitutional AI, guardrails (NeMo, Llama Guard), red team playbook, capstone red team de agent próprio.

##### **Trail 31: Frontend Moderno de Alto Nível**
- **Hub:** Engenharia
- **Nível:** Intermediate
- **Módulos (9):** React reativo de verdade (fiber, commit phase), Next.js App Router internals, server components, Tailwind além do básico, acessibilidade (WCAG, ARIA), performance web (Core Web Vitals), state management (Zustand, Jotai, TanStack Query), testing frontend (RTL, Playwright), capstone app completo.

##### **Trail 32: Product & Tech Leadership para Engenheiros**
- **Hub:** novo "Carreira" ou Engenharia
- **Nível:** Intermediate-Advanced
- **Módulos (7):** ADRs e decisões reversíveis, mentoria técnica, code review como ferramenta pedagógica, estimativas sem mentir, lidando com legacy, carreira técnica vs gestão, capstone ADR completo.

---

### 4.3. Páginas de suporte a criar

- `/fundamentos` — 5º hub.
- `/programacao` — possível 6º hub (ou dentro de Fundamentos).
- `/dados` — possível 7º hub (ou dentro de Engenharia).
- `/carreira` — possível 8º hub (ou dentro de Engenharia).
- `/mapa` — grafo interativo de prerequisites.
- `/roadmaps` — upgrade de `/playlists`.

**Decisão pendente:** criar 8 hubs ou consolidar em 5? Recomendação: **6 hubs** — Fundamentos, Programação, Engenharia (inclui Dados + Carreira), Cloud/AWS, IA, Claude/Anthropic.

---

## 5. Ordem de execução sugerida (roadmap de 90 dias)

### Sprint 1 (semanas 1–3) — infraestrutura e gaps críticos P0
1. T0.1 — Criar hub Fundamentos (mover Trails 12/14/15/16).
2. Trail 19 — TypeScript Profissional (10 mód).
3. Trail 21 — API Design (9 mód).
4. T0.5 — Quiz consolidado gratuito em 6 trilhas prioritárias.

### Sprint 2 (semanas 4–6) — carreira & cert
5. Trail 20 — DS&A (9 mód).
6. Trail 22 — Security Engineering (10 mód).
7. Trail 23 — AWS DVA-C02 (15 mód).
8. T0.2 — Capstones nas 6 trilhas maduras.

### Sprint 3 (semanas 7–9) — aprofundamento IA
9. Trail 24 — Data Engineering (10 mód).
10. Trail 25 — Fine-tuning (8 mód).
11. Trail 26 — LLM Evals Pro (7 mód).
12. T0.3 — Grafo `/mapa`.
13. T0.4 — `/roadmaps` visuais.

### Sprint 4 (semanas 10–13) — diferencial
14. Trails 27, 28, 29, 30, 31, 32 conforme bandwidth.

---

## 6. Padrões técnicos a seguir (checklist para cada trilha)

### 6.1 Ao adicionar trilha no `curriculum.ts`
- [ ] Novo `Trail` com `id: 'trail<N>'`, `slug` kebab-case único, `title`, `desc`, `icon` (emoji), `color`, `level`, `prereq` (array de trail IDs).
- [ ] Novo badge `trail<N>_done` em `BADGES_DEF` de `badges.ts`.
- [ ] Adicionar no `HUBS` correto em `curriculum.ts`.
- [ ] Atualizar `hrefByTrailId` em `HomeClient.tsx`.
- [ ] Criar `src/app/<rota>/page.tsx` com `TrailBlogClient trail={CURRICULUM[N]}` — CUIDADO com reindexação de `CURRICULUM[N]` se inserir no meio.
- [ ] Adicionar rota no array `for route in ...` de `scripts/deploy-hostinger.sh`.
- [ ] Atualizar `src/app/sitemap.ts`.

### 6.2 Ao adicionar módulo
- [ ] Entry completo em `curriculum.ts`: `slug`, `title`, `icon`, `xp` (20–60), `readTime` (string "X min"), `desc`, `seoDesc` (155 chars ideal), `keywords` (array 5–10).
- [ ] `src/app/aprenda/<slug>/page.tsx` usando `ModuleLayout` + primitivos de `article/primitives.tsx`.
- [ ] Quiz com 3 perguntas, distratores realistas, `explanation` didática.
- [ ] Tom: internals, trade-offs, dados reais — zero clickbait.
- [ ] Callouts, code blocks, comparison tables onde couber.

### 6.3 Testes obrigatórios ao fim
```bash
npx tsc --noEmit
npm test
npm run build
```
Nenhum erro. 100% verde. Se falhar, não é pronto.

---

## 7. Critérios de sucesso (como medir que fechou o ciclo)

1. **Cobertura por camada:** todas as 10 camadas da seção 3 com ≥ 1 trilha.
2. **Funil AWS completo:** CLF → DVA → SAA → SAP com simulados em cada.
3. **Funil IA completo:** fundamentos → LLM → RAG → agents → fine-tune → evals → safety.
4. **Jornada "zero à profissional":** roadmap existente onde um dev iniciante consegue sair de nada até nível staff em IA sem precisar de conteúdo externo para os fundamentos.
5. **Cada trilha ≥ 5 módulos + capstone.**
6. **`npm test` passa** com testes cobrindo 100% das funções exportadas em `src/lib/*.ts`.

---

## 8. O que NÃO fazer

- **Não** criar conteúdo raso/listicle — o editorial do site é técnico sério.
- **Não** renomear slugs existentes (quebra localStorage dos usuários).
- **Não** duplicar conteúdo entre trilhas — se um módulo já existe em outra trilha, linkar.
- **Não** usar `next/image` (export estático).
- **Não** chamar `localStorage` direto — só via `src/lib/storage.ts`.
- **Não** hardcodar cores — usar `var(--ffv-*)`.
- **Não** usar `asChild` (base-ui, não Radix).
- **Não** pular os 3 comandos de validação antes de dizer "pronto".

---

## 9. Entregável final esperado

Ao fim da execução, o outro contexto deve entregar:
1. Currículo expandido de **171 → ~280 módulos**, **18 → 30 trilhas**, **4 → 6 hubs**.
2. Páginas `/mapa` e `/roadmaps` funcionando.
3. Capstones nas 6 trilhas maduras iniciais.
4. Quiz consolidado gratuito em trilhas prioritárias.
5. Build estático limpo, TS sem erros, todos os testes verdes.
6. `scripts/deploy-hostinger.sh` atualizado com todas as rotas novas.
7. Um `CHANGELOG_CURRICULUM_V2.md` listando tudo o que mudou e qualquer decisão que desviou deste briefing (com justificativa).

---

**Fim do briefing.** Qualquer dúvida estrutural, priorizar o que está marcado P0 e validar com o dono antes de avançar para P1/P2.
