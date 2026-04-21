# Changelog — Expansão Curriculum v2 · Sprint 1

**Data:** 2026-04-19 · **Referência:** `BRIEFING_CURRICULUM_V2.md`.

## O que foi entregue neste sprint

### Infraestrutura editorial
- **Hub 5 — Fundamentos Técnicos** criado (`/fundamentos`). Agrupa as trilhas órfãs 12, 14, 15, 16. Cor `#8b949e`, ícone 🧱.
- **Hub 6 — Programação & Algoritmos** criado (`/programacao`). Contém Trail 19 (TypeScript Profissional). Cor `#3178c6`, ícone 💻.
- **Trail 21 (API Design & Contratos)** adicionada ao Hub Engenharia, entre trails 8 e 10.

### Trilhas novas

#### Trail 19 — TypeScript Profissional (10 módulos, ~565 XP)
Rota: `/typescript-profissional`. Badge: `trail19_done` (+250 XP). Hub: Programação.

| # | Slug | Tópico |
|---|---|---|
| 1 | `typescript-como-mental-model` | Tipos como prova, estrutural vs nominal |
| 2 | `narrowing-discriminated-unions` | Narrowing, tagged unions, exhaustiveness |
| 3 | `generics-de-verdade` | Variance, constraints, conditional types, infer |
| 4 | `tipos-utilitarios-e-quando-nao-usar` | Partial/Pick/Omit/Record e armadilhas |
| 5 | `type-safety-em-boundaries` | Zod, Valibot, runtime validation |
| 6 | `async-await-sem-pegadinha` | AbortController, Promise.all vs allSettled |
| 7 | `erros-como-valores` | Result, neverthrow, railway-oriented |
| 8 | `performance-em-node` | Event loop, streams, backpressure, workers |
| 9 | `monorepo-pnpm-turbo` | pnpm workspaces, Turbo pipeline, shared configs |
| 10 | `capstone-cli-tool-ts` | Capstone: CLI tipada end-to-end com Zod + vitest + changesets |

#### Trail 21 — API Design & Contratos (9 módulos, ~485 XP)
Rota: `/api-design`. Badge: `trail21_done` (+250 XP). Hub: Engenharia.

| # | Slug | Tópico |
|---|---|---|
| 1 | `rest-maduro` | Richardson levels, idempotência, status codes |
| 2 | `versionamento-sem-dor` | URL vs header, Sunset, estratégia de migração |
| 3 | `graphql-quando-faz-sentido` | N+1, DataLoader, Federation |
| 4 | `grpc-e-protobuf` | RPC tipado, schema evolution, 4 modos streaming |
| 5 | `openapi-como-contrato-vivo` | Spec-first, codegen, mock server, Pact |
| 6 | `paginacao-filtros-ordenacao` | Cursor vs offset, keyset, filter DSL |
| 7 | `idempotency-keys-e-webhooks` | Stripe-style, HMAC, retry+DLQ |
| 8 | `rate-limiting-e-quotas-em-api` | Token bucket em Redis+Lua, headers padronizados |
| 9 | `capstone-api-rest-produto-completo` | Tasks API: OpenAPI, JWT, cursor, idempotency, Pact |

### Infraestrutura técnica
- `CURRICULUM` em `src/lib/curriculum.ts` estendido com Trail 19 e Trail 21 (apêndice — sem mexer em índices existentes).
- `BADGES_DEF` ampliado com `trail19_done` e `trail21_done`.
- `HUBS` atualizados: Engenharia agora inclui `trail21`; Fundamentos e Programação novos.
- `scripts/deploy-hostinger.sh` registra novas rotas: `fundamentos`, `programacao`, `typescript-profissional`, `api-design`.
- `src/app/fundamentos/page.tsx`, `src/app/programacao/page.tsx`, `src/app/typescript-profissional/page.tsx`, `src/app/api-design/page.tsx` — páginas de hub e trilha.
- 19 novos `src/app/aprenda/<slug>/page.tsx` usando `ModuleLayout` + primitivos.

## Validação

| Check | Status |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npm test` | ✅ 229/229 (21 arquivos) |
| `npm run build` | ✅ todas as 19 novas rotas `/aprenda/*` prerendered + 4 páginas novas |

## Estado do currículo após Sprint 1

- **Trilhas:** 18 → 20 (+2) — trails 19 e 21 inclusos.
- **Módulos:** 171 → 190 (+19) — todos com quiz de 3 perguntas, explicações didáticas, 2–5 sections, code blocks/callouts.
- **Hubs:** 4 → 6 (+2) — Fundamentos e Programação criados; trilhas órfãs 12/14/15/16 ganharam casa.
- **Badges:** 58 → 60 (+2).
- **Rotas estáticas novas:** 23 (4 páginas + 19 artigos).

## Decisões que desviaram do briefing

1. **Ordem executada:** Sprint 1 foi T0.1 + Trail 19 + Trail 21 (não incluiu T0.5 quiz consolidado). Motivo: escopo realístico de uma sessão; T0.5 depende de engine existente de simulados e é melhor executar como sprint próprio.
2. **Hub Programação** criado como hub dedicado (em vez de subpasta de Fundamentos). Motivo: Trail 19 é grande (10 módulos) e Trail 20 (DS&A) virá depois — ficariam apertados juntos de Fundamentos.
3. **Trail 21 foi pra Engenharia** (como estava no briefing), não pra hub próprio. Correto.

## O que fica pra sprints seguintes (fora desta entrega)

### Sprint 2 (prioridade alta)
- **Trail 20 — Estruturas de Dados & Algoritmos** (9 módulos, hub Programação).
- **Trail 22 — Security Engineering** (10 módulos, hub Engenharia).
- **Trail 23 — AWS DVA-C02** (15 módulos, hub AWS).
- **T0.2 — Capstones** nas trilhas maduras (9, 10, 11, 13, 17, 18).

### Sprint 3
- **Trail 24 — Data Engineering** (10 módulos).
- **Trail 25 — Fine-tuning de LLMs** (8 módulos).
- **Trail 26 — LLM Evals Pro** (7 módulos).
- **T0.3 — Grafo `/mapa`** navegável.
- **T0.4 — `/roadmaps`** visuais.

### Sprint 4
- Trails 27 (AWS SAP), 28 (FinOps), 29 (Multimodal), 30 (AI Safety), 31 (Frontend Moderno), 32 (Product/Leadership).
- **T0.5 — Quiz consolidado gratuito** por trilha (depende de engine de simulados já existente — adaptação).

## Métricas finais do Sprint 1

- Linhas de código adicionadas: ~3.400 (19 artigos × ~150 linhas + catálogo + hub pages).
- Tempo médio de leitura total adicionado: ~245 min (~4h de conteúdo editorial novo).
- XP total disponível nas 2 trilhas novas: ~1.050 XP (sem contar badges).

---

**Próxima ação sugerida:** começar Sprint 2 com Trail 22 (Security) — tem maior impacto em SEO e também completa a camada de Operação/Confiabilidade, que hoje tem gap entre trail 7 (DevOps) e trail 11 (SRE).

---

## Sprint 2 — 2026-04-19

Tier P0 do master plan executado + T0.2 capstones obrigatórios.

### Trilhas novas (4)
| ID | Nome | Hub | Módulos | Badge |
|----|------|-----|---------|-------|
| 20 | Estruturas de Dados & Algoritmos | Programação | 9 | `trail20_done` (+250 XP) |
| 22 | Security Engineering | Engenharia | 10 | `trail22_done` (+300 XP) |
| 23 | AWS Developer Associate (DVA-C02) | AWS | 15 | `trail23_done` (+275 XP) |
| 36 | Python para Engenheiros | Programação | 8 | `trail36_done` (+250 XP) |

**Total Sprint 2**: 42 artigos novos, ~1850 XP.

### Capstones obrigatórios (T0.2) — 7 artigos
Trilhas maduras ganharam capstone final hands-on:
- Trail 7 (DevOps) → `capstone-devops-plataforma-completa` (EKS + ArgoCD + ESO + cert-manager)
- Trail 8 (Eng Software) → `capstone-engenharia-software-refactor` (refactor legacy com ADR/fitness fns)
- Trail 9 (AI-Native) → `capstone-ai-native-rag-producao` (hybrid search + eval + canary)
- Trail 10 (Distribuídos) → `capstone-sistemas-distribuidos-saga` (saga + outbox + compensation)
- Trail 11 (SRE) → `capstone-sre-slo-runbook` (multi-burn-rate + gameday)
- Trail 13 (Claude Code) → `capstone-claude-code-team-playbook` (CLAUDE.md + skills + hooks time)
- Trail 17 (API & Agents) → `capstone-claude-agent-produto-completo` (prompt caching + MCP + FF)

### Simulado pago DVA-C02
Adicionado em `src/lib/simulados-catalog.ts`:
- `simulado-aws-developer` — R$ 67, 15 questões reais estilo exam, explicações densas
- Badge `simulado_aws_developer` (+250 XP) concedido ao passar

### Infra
- `HUBS` atualizados: Programação inclui 20+36; Engenharia inclui 22; AWS inclui 23.
- 5 badges novos em `BADGES_DEF`.
- 4 páginas de trilha: `/ds-algoritmos`, `/security-engineering`, `/aws-developer-associate`, `/python-engenheiros`.
- `scripts/deploy-hostinger.sh` registra 4 rotas novas.
- `src/app/sitemap.ts` atualizado.
- `src/lib/engine.ts` mapa `passedMap` atualizado com `simulado-aws-developer`.

### Estado do currículo após Sprint 2
- **Trilhas ativas**: 20 → 24 (+4)
- **Módulos**: 190 → 239 (+49 = 42 novos módulos + 7 capstones)
- **Hubs**: 6 (estável)
- **Badges**: 60 → 65 (+5)
- **Rotas estáticas novas**: +53 (4 páginas de trilha + 42 módulos + 7 capstones)

### Roadmap next
- Sprint 3 (P1): Trails 24 (Data Eng), 25 (FT), 26 (LLM Evals), 33 (Testing Eng), 34 (A11y), 38 (DB Deep). T0.3 /mapa. T0.4 /roadmaps.
- Sprint 4 (P2): Trails 27 (SAP), 28 (FinOps), 29 (Multimodal), 30 (Safety), 31 (Frontend), 32 (Leadership), 40 (DX). T0.5 simulado freemium.

---

## Sprint 3A — 2026-04-19

Executada parte de alto valor imediato do tier P1 do master plan. Sprint 3B fica com Data Eng, Fine-tuning, LLM Evals, /mapa, /roadmaps.

### Trilhas novas (3, +23 módulos)
| ID | Nome | Hub | Módulos | Badge |
|----|------|-----|---------|-------|
| 33 | Testing Engineering | Engenharia | 8 | `trail33_done` (+275 XP) |
| 34 | Accessibility & Inclusive Eng | Engenharia | 7 | `trail34_done` (+275 XP) |
| 38 | Database Deep — Postgres Internals | Fundamentos | 8 | `trail38_done` (+300 XP) |

### Conteúdo editorial
- **Testing Eng**: test pyramid/trophy/diamond, TDD/BDD, test doubles (Meszaros), property-based (fast-check), mutation testing (Stryker), integration/contract/e2e, performance (k6) + capstone harness.
- **A11y**: legal landscape (EAA 2025, ADA), semantic HTML, ARIA rule (quando usar e quando NÃO), keyboard + focus, screen readers (NVDA/VoiceOver), automated (axe/Lighthouse) + capstone de remediação AA.
- **DB Deep**: MVCC + isolation levels, EXPLAIN ANALYZE, índices avançados (B-tree/BRIN/GIN/GiST/partial/covering), vacuum + bloat, connection pooling (pgbouncer + RDS Proxy), replication (streaming/logical), partitioning + sharding (Citus) + capstone tuning 30s→50ms.

### Infra
- 3 páginas de trilha: `/testing-engineering`, `/acessibilidade`, `/postgres-internals`.
- `HUBS` atualizados: Engenharia inclui 22/33/34; Fundamentos inclui trail38 (próximo a trail14 SQL).
- 3 badges novos.
- `scripts/deploy-hostinger.sh` + `src/app/sitemap.ts` com 3 rotas novas.

### Validação
- `npx tsc --noEmit`: ✅ 0 erros
- `npm test`: ✅ **270/270** (23 arquivos, +14 novos testes em `curriculum-v2-sprint3a.test.ts`)
- `npm run build`: ✅ export estático limpo
- Fix colateral: test `srsReviewFlow` (timezone UTC vs local — pre-existing flaky, agora determinístico)

### Estado após Sprint 3A
- **Trilhas ativas**: 24 → 27 (+3)
- **Módulos**: 239 → 262 (+23)
- **Hubs**: 6 (estável)
- **Badges**: 65 → 68 (+3)
- **Rotas novas**: +26 (3 páginas + 23 módulos)

### Sprint 3B (pendente, próxima sessão)
- Trail 24 (Data Engineering) — 10 módulos + Hub Dados quando 24+38+39 estiverem juntos
- Trail 25 (Fine-tuning) — 8 módulos
- Trail 26 (LLM Evals Pro) — 7 módulos
- T0.3 — Página `/mapa` (grafo de prerequisites)
- T0.4 — Página `/roadmaps` (upgrade de `/playlists`)

---

## Sprint 3B — 2026-04-19

P1 do master plan concluído. Fecha expansion de IA + Dados + estrutural (mapa + roadmaps).

### Trilhas novas (3, +25 módulos)
| ID | Nome | Hub | Módulos | Badge |
|----|------|-----|---------|-------|
| 24 | Data Engineering Moderna | **Dados (novo)** | 10 | `trail24_done` (+300 XP) |
| 25 | Fine-tuning & Customização LLMs | IA | 8 | `trail25_done` (+300 XP) |
| 26 | LLM Evals Profissional | IA | 7 | `trail26_done` (+275 XP) |

### Hub novo
- **Hub Dados** (`/dados`): contém Trail 24 (Data Eng) + Trail 38 (DB Deep — movida de Fundamentos). Cor `#10b981`, ícone 🏭.
- Fundamentos fica com 4 trails (12, 14, 15, 16) — original clean de SQL/Linux/rede/CPU.
- IA expande pra 6 trails (1, 2, 3, 9, 25, 26) com Fine-tuning e LLM Evals.

### Páginas estruturais
- **`/mapa`** (T0.3): visão de trilhas por hub com progresso individual e legenda. SVG simples sem libs extras.
- **`/roadmaps`** (T0.4): 5 jornadas curadas com stages, outcomes, progress tracking. Upgrade conceitual das playlists:
  1. **Zero → Staff Engineer em IA** (60 semanas)
  2. **Dev Web → AWS Solutions Architect Pro** (32 semanas)
  3. **Backend Dev → Full-stack AI-Native** (40 semanas)
  4. **Claude Power User → Harness Engineer** (20 semanas)
  5. **Iniciante → Engenheiro de Software Moderno** (48 semanas)
- `src/lib/roadmaps.ts` — registry + helpers `resolveRoadmap`, `getRoadmap`.

### Infra
- 5 badges novos (3 trail_done + 2 estruturais).
- 6 rotas novas: `/dados`, `/data-engineering`, `/fine-tuning`, `/llm-evals`, `/mapa`, `/roadmaps`.
- `scripts/deploy-hostinger.sh` + `src/app/sitemap.ts` atualizados.
- Hub IA + Dados com descriptions expandidas.
- Teste Sprint 3A ajustado (trail38 moveu pra Dados).

### Validação
- `npx tsc --noEmit`: ✅ 0 erros
- `npm test`: ✅ **288/288** (24 arquivos)
- `npm run build`: ✅ export estático limpo

### Estado após Sprint 3B
- **Trilhas ativas**: 27 → 29 (+3 — 24/25/26; trail38 moveu de hub mas permanece em CURRICULUM)
- **Módulos**: 262 → 287 (+25)
- **Hubs**: 6 → 7 (+Dados)
- **Badges**: 68 → 71 (+3)
- **Rotas novas**: +31 (4 páginas de trilha + 1 hub + 2 estruturais + 25 módulos)

### Roadmap P2 (pendente — Sprint 4)
- Trails 27 (AWS SAP), 28 (FinOps), 29 (Multimodal), 30 (AI Safety), 31 (Frontend Moderno), 32 (Tech Leadership), 40 (DX & Dev Productivity)
- T0.5 simulado freemium por trilha
- Trails 35 (Mobile RN), 37 (Edge), 39 (Search), 42 (Lib Authoring) — Sprint 5

---

# Sprint 4-5-L — Trilhas P2, P3 e Linguagens

**Data:** 2026-04-19

## O que foi entregue

### Sprint 4 — P2 (7 trilhas)

| Trail | Slug / Rota | Módulos | Badge |
|-------|-------------|---------|-------|
| 27 | AWS Solutions Architect Professional (SAP-C03) — `/aws-sap-c03` | 18 | `trail27_done` (+400 XP) |
| 28 | FinOps & Cost Engineering — `/finops` | 7 | `trail28_done` (+275 XP) |
| 29 | Voice, Vision & Multimodal — `/multimodal` | 7 | `trail29_done` (+275 XP) |
| 30 | AI Safety, Red Teaming & Alinhamento — `/ai-safety` | 7 | `trail30_done` (+300 XP) |
| 31 | Frontend Moderno (HTML/CSS/JS/React) — `/frontend-moderno` | 8 | `trail31_done` (+275 XP) |
| 32 | Tech Leadership & Staff Engineering — `/tech-leadership` | 7 | `trail32_done` (+300 XP) |
| 40 | DX & Developer Productivity — `/dx-productivity` | 7 | `trail40_done` (+275 XP) |

### Sprint 5 — P3 (4 trilhas)

| Trail | Slug / Rota | Módulos | Badge |
|-------|-------------|---------|-------|
| 35 | Mobile para Devs Web (React Native + Expo) — `/mobile-rn` | 8 | `trail35_done` (+275 XP) |
| 37 | Edge Computing & Workers — `/edge-computing` | 7 | `trail37_done` (+275 XP) |
| 39 | Search & Information Retrieval — `/search` | 7 | `trail39_done` (+275 XP) |
| 42 | Library & Package Authoring — `/lib-authoring` | 6 | `trail42_done` (+275 XP) |

### Sprint L — Linguagens de Programação (6 trilhas)

| Trail | Slug / Rota | Módulos | Badge |
|-------|-------------|---------|-------|
| 43 | C Moderno: Systems Programming — `/c-programming` | 8 | `trail43_done` (+300 XP) |
| 44 | C++ Moderno (C++20/23) — `/cpp-moderno` | 8 | `trail44_done` (+300 XP) |
| 45 | C# & .NET Moderno — `/csharp-dotnet` | 8 | `trail45_done` (+275 XP) |
| 46 | Java Moderno (17/21 LTS) — `/java-moderno` | 8 | `trail46_done` (+275 XP) |
| 47 | Go Profissional — `/go-profissional` | 8 | `trail47_done` (+275 XP) |
| 48 | Comparação de Linguagens: Escolha Certa — `/linguagens-comparadas` | 6 | `trail48_done` (+250 XP) |

### Hub novo — Construção & Clientes (`/construcao`)

Agrupa trilhas 31 (Frontend Moderno), 35 (Mobile RN), 37 (Edge), 42 (Lib Authoring). Cor `#a855f7`, ícone 🏗️.

### Wiring de hubs existentes

- **IA** (`/ia`): + trail29, trail30
- **AWS** (`/aws`): + trail27, trail28
- **Engenharia** (`/engenharia`): + trail32, trail40
- **Programação & Algoritmos** (`/programacao`): + trail43, trail44, trail45, trail46, trail47, trail48

### Badges

18 badges novos: 17 `trailN_done` + `simulado_aws_sap`.

## Métricas finais

- **Trilhas ativas:** 45 (28 → 45, +17)
- **Módulos totais:** 426 (289 → 426, +135 módulos novos com conteúdo real em PT-BR)
- **Hubs:** 8 (7 → 8)
- **Artigos novos em `/aprenda/<slug>/`:** 135
- **Trail landing pages:** 17 novas em `/src/app/<rota>/page.tsx`
- **Testes:** 334 passando (288 → 334, +46 smoke tests no arquivo `curriculum-v2-sprint45L.test.ts`)
- **Build estático:** limpo

## Validação

```bash
npx tsc --noEmit   # 0 erros
npm test           # 334 / 334 passando
npm run build      # export estático limpo
```

## Arquivos tocados

- `src/lib/curriculum.ts` — 17 trails + hub Construção + 18 badges
- `src/app/<rota>/page.tsx` — 17 landing pages novas + 1 hub page (`/construcao`)
- `src/app/aprenda/<slug>/page.tsx` — 135 artigos novos
- `scripts/deploy-hostinger.sh` — rotas novas no array de export
- `src/tests/unit/curriculum-v2-sprint45L.test.ts` — 46 smoke tests novos

## Correções aplicadas durante validação

Quatro arquivos pré-existentes tinham JSX parse errors (template literal/brace unescaping). Corrigidos:
- `src/app/aprenda/core-web-vitals-perf/page.tsx` — `<code>` com expressões JS precisava wrap em template literal string
- `src/app/aprenda/deno-deploy-bun/page.tsx` — backticks aninhados em `CodeBlock` quebravam o template literal externo
- `src/app/aprenda/full-text-search-postgres/page.tsx` — `>` solto no texto era interpretado como tag JSX
- `src/app/aprenda/jailbreaks-prompt-injection/page.tsx` — mesmo padrão de backticks aninhados
- `src/app/aprenda/react-fiber-commit-phase/page.tsx` — `{index}` em texto virava JSX expression
- `src/app/aprenda/tree-shaking-de-verdade/page.tsx` — `{ foo }` em texto virava JSX expression

## Próximos passos (opcionais)

- Adicionar simulados freemium por trilha (T0.5 do roadmap)
- Criar roadmaps curados que combinem trilhas por papel (Staff Full-stack, AI Engineer, Platform Engineer etc.)
- Playlists temáticas atravessando hubs

---

# Sprint 6 — Platform Features + Rust

**Data:** 2026-04-19

## Platform Features

### PDF Download (task 63-65 ✅)
- Botão 📄 PDF em todo ModuleLayout (header) e TrailBlogClient
- CSS `@media print` profissional: oculta nav/HUD/TOC/quiz interativo, tipografia print-friendly, code blocks com wrap, URLs expandidas em links, page breaks em headings
- Estratégia zero-dep: `window.print()` + browser "Salvar como PDF" → saída profissional editorial
- Classe `ffv-printing` aplicada durante print pra garantir ocultação cross-browser
- PDF por trilha usa mesmo mecanismo com `TrailActions`

### Modo Apresentação (task 66-67 ✅)
- Botão 🖥️ Apresentar em cada módulo e cada trilha
- Componente `PresentationMode` extrai seções do DOM (`data-section-title`) e renderiza fullscreen slide deck
- Keyboard: ← → setas navegam, Space/PageDown avança, Home/End, F fullscreen nativo, ESC sai
- Footer com dots de progresso clicáveis
- Slide cover automático com título + nome da trilha
- Apresentar trilha = inicia pelo primeiro módulo com query param

## Trail 49 — Rust Profissional (tasks 68 ✅)

Nova trilha completa no hub Programação & Algoritmos.

| # | Slug | Foco |
|---|------|------|
| 1 | `rust-historia-e-como-funciona` | Graydon Hoare 2006 → Mozilla → Rust Foundation 2021. Source → HIR → MIR → LLVM → asm. Por que AI infra adotou (tokenizers, candle, polars) |
| 2 | `ownership-borrow-mental-model` | Move vs copy, &T vs &mut T, borrow checker em compile-time |
| 3 | `lifetimes-sem-medo` | Elision rules, 'static, traits canônicos (From/Into/Display/Iterator) |
| 4 | `async-tokio-producao` | Futures zero-cost, tokio runtime, Axum, structured concurrency |
| 5 | `macros-rust` | macro_rules! vs proc_macro, serde derive, hygiene |
| 6 | `unsafe-ffi-interop` | Unsafe como contrato, FFI extern "C", pyo3, napi-rs, Miri |
| 7 | `cargo-ecosystem-perf` | Workspaces, features, editions 2015/2018/2021/2024, criterion bench |
| 8 | `capstone-rust-cli-axum` | Capstone: workspace lib+CLI(clap)+Axum+sqlx+JWT, Docker multi-stage |

Badge: `trail49_done` (+325 XP) "Rustacean" 🦀.

## Métricas finais

- **Trilhas ativas:** 46 (45 → 46)
- **Módulos:** 434 (426 → 434)
- **Testes:** 341 (340 → 341)
- **Build estático:** 521 páginas geradas com sucesso
- **Rotas novas:** `/rust-profissional` + 8 artigos em `/aprenda/<slug>/`

## Validação

```bash
npx tsc --noEmit   # 0 erros
npm test           # 341/341
npm run build      # 521 páginas estáticas
```

## Backlog criado (tasks 69-95 — roadmap Sprints 7+)

Planejamento para sessões futuras:
- **Sprint 7 (Tier 1):** MLOps, ML Clássico, System Design Interview, Technical Writing, NoSQL+Vector DBs
- **Sprint 8 (Tier 2):** Computer Vision, iOS Native, Android Native, GraphQL, Platform Engineering, Performance Engineering, Cryptography Applied, Event Streaming Kafka depth, Real-time Systems, Product Engineering, Career Engineering, Chaos Engineering
- **Sprint 9 (enhancements):** Adicionar 4 seções canônicas em cada trail de linguagem (como-funciona-de-verdade + história + evolução por versão até 2026 + diferencial técnico + lançamentos mais usados no mercado)
- **Sprint 10 (extras):** Roadmaps por papel, simulados novos (CKA, Terraform, Security+, Azure), cheatsheets (Postgres/Git/K8s/Rust/System Design), glossário AI 2026 expandido, playlists temáticas
- **Sprint 11 (backend):** Tutor IA real Claude API (substitui mock)
- **Tier 3 opcional:** Embedded/IoT, Kotlin JVM server, Game Dev, OS Internals, Compiladores, Data Viz dedicado, Blockchain/Web3, Robotics/ROS, Reverse Engineering, Mainframes

---

# Sprint 7-8 — Tier 1 (5 trails) + Tier 2 (12 trails) = 17 trails novas

**Data:** 2026-04-20

## Novas trilhas (124 módulos novos)

### Tier 1 (Sprint 7):
- **Trail 50** Machine Learning Clássico (8) — `/machine-learning`
- **Trail 51** MLOps (8) — `/mlops`
- **Trail 52** System Design Interview Prep (10) — `/system-design-interview`
- **Trail 53** Technical Writing & RFCs (7) — `/technical-writing`
- **Trail 54** NoSQL + Vector Databases (8) — `/nosql-vector-dbs`

### Tier 2 (Sprint 8):
- **Trail 55** Computer Vision Clássico (7) — `/computer-vision`
- **Trail 56** iOS Native Swift+SwiftUI (7) — `/ios-native`
- **Trail 57** Android Native Kotlin+Compose (7) — `/android-native`
- **Trail 58** GraphQL completo (7) — `/graphql`
- **Trail 59** Platform Engineering & IDPs (7) — `/platform-engineering`
- **Trail 60** Performance Engineering (7) — `/performance-engineering`
- **Trail 61** Cryptography Applied (7) — `/cryptography-applied`
- **Trail 62** Event Streaming / Kafka Depth (7) — `/kafka-streaming`
- **Trail 63** Real-time Systems (7) — `/real-time-systems`
- **Trail 64** Product Engineering & Experimentation (7) — `/product-engineering`
- **Trail 65** Career Engineering (7) — `/career-engineering`
- **Trail 66** Chaos Engineering (6) — `/chaos-engineering`

## Badges: +18 novos (trail50_done a trail66_done).

## Hub wiring atualizado:
- IA: +trail50, trail51, trail55
- Engenharia: +trail52, 53, 58, 59, 60, 61, 62, 63, 64, 65, 66
- Construção: +trail56, 57
- Dados: +trail54

## Geração de artigos (estratégia mista):
- **95 artigos** escritos por agents (Tier 1 + trail55/60/61/66) — conteúdo denso, exemplos reais de código
- **29 artigos** gerados programaticamente via `scripts/gen-articles.py` como fallback (trails 56/57/58/59/62/63/64/65) — template PT-BR derivado do desc/seoDesc/keywords do catálogo com 3 Sections + 3 quiz questions, substancial mas menos idiomático que agent-authored

Todos os 124 passaram `tsc --noEmit` e renderizam em build. Fix JSX: `ios-concurrency-actors` tinha `{ ... }` em texto (JSX expression conflict), corrigido com wrap em `<code>`.

## Fix de integridade
Dois `nextSuggested` quebrados detectados pelo teste de integridade e corrigidos:
- trail53 `tw-readme-editorial → tw-docs-api-vivas` (slug inexistente) → `capstone-tech-writing-rfc`
- trail61 `jwt-vs-paseto-sessions → mtls-zero-trust` (slug inexistente) → `mtls-zero-trust-pratica`

## Métricas finais

- **Trilhas ativas:** 63 (46 → 63, +17)
- **Módulos:** ~558 (434 → 558, +124)
- **Hubs:** 8
- **Build estático:** **662 páginas geradas** (521 → 662)
- **Testes:** 341 passando
- **ZIP Hostinger:** 13MB

## Validação final

```bash
npx tsc --noEmit   # 0 erros
npm test           # 341/341
npm run build      # 662 páginas
bash scripts/deploy-hostinger.sh  # ZIP 13MB
```

---

# Sprint 9 — Backlog Final (Language Enhancement + Extras)

**Data:** 2026-04-20

## Language enhancement (#69)
5 módulos "história + compilador + diferencial + versões-chave 2026" adicionados ao INÍCIO das trails de C/C++/C#/Java/Go (Rust já tinha via `rust-historia-e-como-funciona`):
- `c-historia-compilador-diferencial` (1972, Bell Labs, GCC 14/Clang 18, C99/C11/C17/C23, kernel Linux + embedded)
- `cpp-historia-compilador-diferencial` (1979, Stroustrup, GCC g++/Clang++/MSVC, C++11/17/20/23, games + browsers + HFT)
- `csharp-historia-compilador-diferencial` (2000, Hejlsberg, CLR/Roslyn/AOT .NET 8, C#2 gen/C#3 LINQ/C#5 async/C#8 nullable/C#12, enterprise backend)
- `java-historia-compilador-diferencial` (1995, Gosling/Sun, JVM HotSpot JIT + ZGC, Java 8/11/17/21 LTS, virtual threads, Android)
- `go-historia-compilador-diferencial` (2007, Google Pike/Thompson/Griesemer, compilador gc, 1.11 modules / 1.18 generics / 1.22+, DevOps tooling)

Conteúdo: agent-authored com 4 seções canônicas em cada artigo (história/filosofia, pipeline de compilação real, versões que importam até 2026, diferencial + versão mais usada no mercado).

## Roadmaps por papel (#90)
Total agora **9 roadmaps**. Adicionados 4 novos:
- `data-engineer-staff` — SQL → Postgres internals → DE moderna → Kafka depth → ML/MLOps
- `platform-engineer` — DevOps → distribuídos → Platform Eng IDPs → Edge/Chaos/Perf
- `sre-incident-to-reliability` — sistemas → SRE → chaos+crypto → perf+career
- `ai-safety-researcher` — IA fundamentos → agents+evals → fine-tune+multimodal → safety+crypto

## Simulados novos (#91)
Catálogo agora com **7 simulados**. Adicionados 4:
- CKA (Kubernetes Administrator) — 10 questões: workloads, storage, networking, troubleshooting, RBAC
- Terraform Associate 003 — 10 questões: state, modules, workspaces, variables, TFC
- CompTIA Security+ SY0-701 — 10 questões: attacks, crypto, zero-trust, MFA, GDPR/LGPD
- Azure Fundamentals AZ-900 — 10 questões: IaaS/PaaS/SaaS, ARM, Entra ID, Policy, Blob tiers

Cada questão com `explanation` no estilo tutor (por que certa é certa, por que distratores erram).

## Cheatsheets (#92)
Nova rota `/cheatsheets` com índice + 5 cheatsheets profissionais imprimíveis:
- **Postgres** essencial — índices, EXPLAIN ANALYZE, MVCC/VACUUM, transações, backup/restore, replicação
- **Git avançado** — rebase interativo, reflog, bisect, worktree, cherry-pick, hooks, submodules, config úteis
- **Kubernetes diário** — kubectl essencial, Deployment/Service/Ingress/NetworkPolicy YAML, troubleshooting, RBAC
- **Rust essencial** — ownership 3 regras, borrow rules, lifetimes, traits canônicos, error handling, cargo, concurrency
- **System Design prep** — framework FRAME, números de latência, back-of-envelope, padrões canônicos, cases

Botão 📄 PDF em cada cheatsheet (usa CSS @media print do sistema de PDF).

Componente `CheatsheetLayout` reutilizável com breadcrumb, print, accent por tema.

## Glossário expandido (#93)
**27 → 45 termos** (+18). Novos: tool-use, agent-harness, MCP, MoE, RAG evals, KV cache, speculative decoding, LoRA/QLoRA, DPO, constitutional AI, prompt injection, LLM-as-judge, golden set, ANN search, vector DB, agents, RLHF, inference.

## Playlists cross-hub (#94)
**5 → 11 playlists** (+6). Novas: "Primeiros 90 dias como dev", "De júnior a pleno", "IA para devs backend", "Kubernetes zero → prod", "Staff Engineer path".

## Trail48 Comparação de linguagens (#70)
Trail já tinha conteúdo prático adequado no módulo `quando-escolher-cada` (matriz de decisão com exemplos por domínio). Requisito atendido.

## Tasks deletadas

- **#89** Tier 3 opcional — decisão editorial: não entrega volume suficiente para justificar investimento
- **#95** Tutor IA backend Claude API — requer infraestrutura server-side fora do escopo do site estático (Hostinger). Fica como TODO(backend) no código

## Métricas finais do projeto

- **Trilhas ativas:** 63 + 5 novos módulos de história de linguagens no início das trails existentes = 63 trilhas · **~563 módulos**
- **Hubs:** 8
- **Roadmaps:** 9 (5 → 9)
- **Simulados:** 7 (3 → 7)
- **Cheatsheets:** 5 + 1 antigo = 6
- **Playlists:** 11
- **Glossário:** 45 termos
- **Build estático:** **685 páginas geradas**
- **Testes:** 341 passando
- **ZIP Hostinger:** 14MB

## Validação final Sprint 9

```bash
npx tsc --noEmit   # 0 erros
npm test           # 341/341
npm run build      # 685 páginas
bash scripts/deploy-hostinger.sh  # ZIP 14MB
```
