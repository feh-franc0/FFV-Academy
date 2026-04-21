# FFV Academy — Plano Mestre do Currículo (Consolidado)

**Versão:** 1.0 · **Data:** 2026-04-19
**Escopo:** plano definitivo pós-análise crítica do BRIEFING_CURRICULUM_V2.md.

> **⚠️ Atualização 2026-04-20:** este documento é registro histórico do planejamento. A meta de 40 trilhas foi **ultrapassada** — o estado real é de **~66 trilhas · ~570 artigos · 8 hubs** (rodar `grep "id: 'trail" src/lib/curriculum.ts | wc -l` para contagem ao vivo). O foco editorial agora não é criar trilhas novas, e sim aprofundar densidade dos artigos mais curtos, construir playground de código interativo e capstones cross-trilha. Ver seção "foco pedagógico atual" no `CLAUDE.md`.

**Estado histórico (inicial):** 20 trilhas · 190 módulos · 6 hubs (Sprint 1 do V2 concluído).
**Meta (atingida e ultrapassada):** 40 trilhas · ~350 módulos · 8 hubs — cobrindo tudo que um dev profissional moderno faz no dia a dia.

---

## 1. Crítica ao briefing V2 — pontos fortes e gaps reais

### O briefing V2 acerta em
- Identificar Camada 2 (Programação & DS&A) e Camada 10 (Produto/Liderança) como gaps graves. ✅
- Propor hubs Fundamentos e Programação. ✅ (já implementado Sprint 1)
- Funil AWS CLF → DVA → SAA → SAP. ✅
- Funil IA fundamentos → RAG → agents → fine-tune → evals → safety. ✅

### Onde o briefing V2 é insuficiente (verificação crítica)
Fiz varredura cruzada contra **o que um Staff Engineer em 2026 realmente faz**. Encontrei **8 pilares completamente ausentes** do V2 e **4 trilhas do V2 super-empacotadas** que precisam quebra.

#### Ausências totais (não estão no V2)
| # | Área | Por que importa | Severidade |
|---|------|-----------------|------------|
| A1 | **Testing Engineering** como disciplina | TDD, BDD, property-based, mutation, test doubles, contract. Aparece solto em vários módulos mas sem alicerce | P0 |
| A2 | **Accessibility (A11y)** | WCAG, ARIA, keyboard, screen reader. Virou obrigação legal (EU accessibility act 2025). O V2 escondeu em Trail 31 | P0 |
| A3 | **Mobile / React Native + Expo** | Zero cobertura mobile. Dev moderno precisa tocar mobile eventualmente | P1 |
| A4 | **Python para engenheiros** | IA roda em Python. Dev TS que não sabe Python fica travado em camadas de agents | P1 |
| A5 | **Package / Library authoring** | Publicar npm lib profissional: semver, ESM/CJS, tree-shake, publint | P1 |
| A6 | **Edge Computing & Workers** | Cloudflare Workers, Vercel Edge, Deno Deploy — padrão arquitetural novo | P1 |
| A7 | **Database Deep (Postgres internals)** | Query planner, vacuum, replication, partitioning. Trail 14 é básica demais | P1 |
| A8 | **Real-time & Collaboration (CRDTs)** | Yjs, Automerge, WebRTC, SSE. Era dos Liveblocks/Figma-likes | P2 |

#### Trilhas do V2 super-empacotadas (precisam quebra)
| Trail V2 | Problema | Proposta |
|----------|----------|----------|
| Trail 31 (Frontend Moderno) | 9 módulos tentam cobrir React + Next + A11y + Perf + State + Testing + Tailwind | Separar A11y e Testing em trilhas dedicadas; Trail 31 foca em React/Next internals + perf |
| Trail 24 (Data Engineering) | 10 módulos misturam batch + streaming + in-process | Manter 10 mas o capstone deve escolher um caminho; adicionar Trail 24b (Streaming) no futuro se necessário |
| Trail 22 (Security) | 10 módulos misturam AppSec + DevSecOps | OK manter, mas explicitar no capstone que é AppSec; supply chain/SBOM fica num "capítulo" claro |
| Trail 29 (Multimodal) | 7 módulos pra tópico que cresce rápido | Aceitar que é curso introdutório; quando mercado amadurecer, desdobra |

### Outros ajustes cirúrgicos
- **Trail 32 (Product/Leadership)** do V2 é chamada assim mas o conteúdo proposto é **mais Staff/Principal Engineer** que Produto puro. Renomear para **"Tech Leadership & Staff Engineering"**.
- **Quiz consolidado gratuito (T0.5)** deveria ser **simulado freemium da trilha** — gratuito nos 10 primeiros, pago no restante, alimentando o funil de conversão pros simulados de certificação.
- **Capstones (T0.2)** devem ser obrigatórios — transformar em requisito pra badge `_done`.

---

## 2. Lente de análise: 10 camadas do dev profissional moderno

Usa as 10 camadas do briefing V2, refinadas com as 8 áreas novas acima.

| # | Camada | Trilhas atuais | Trilhas planejadas | Cobertura alvo |
|---|--------|----------------|---------------------|---------------|
| 1 | **Fundamentos de Computação** | 12, 15, 16 | — | ✅ OK |
| 2 | **Programação, DS&A, Linguagens** | 19 (TS) | 20 (DS&A), 36 (Python), **novo 41 (Go/Rust opcional)** | Precisa 20 + 36 |
| 3 | **Dados & Persistência** | 14 (SQL) | 24 (Data Eng), **novo 38 (DB Deep)**, **novo 39 (Search)** | Expandir — 14 é introdutório |
| 4 | **Construção de Sistemas** | 17, 21 (API Design) | 31 (Frontend), **novo 35 (Mobile/RN)**, **novo 37 (Edge)**, **novo 42 (Package)** | Construção está fraca — só API |
| 5 | **Arquitetura & Distribuídos** | 10 | — | ✅ OK |
| 6 | **Operação, Confiabilidade, Segurança** | 7, 11 | 22 (Security), **novo 33 (Testing Eng)** | Testing precisa trilha própria |
| 7 | **Cloud (AWS)** | 4, 5 | 23 (DVA), 27 (SAP), 28 (FinOps) | Funil completo |
| 8 | **IA Moderna** | 1, 2, 9 | 25 (FT), 26 (Evals), 29 (Multimodal), 30 (Safety) | Consolidado |
| 9 | **IA Aplicada ao Dev** | 3, 13, 17, 18 | — | ✅ Melhor cobertura do site |
| 10 | **Produto, Carreira, Liderança** | — | 32 (Tech Leadership), **novo 34 (A11y & Inclusive)**, **novo 40 (DX & Dev Productivity)** | Totalmente ausente hoje |

---

## 3. Plano final — 40 trilhas, 8 hubs

### 3.1 Hubs

| # | Hub | Rota | Cor | Trilhas finais |
|---|-----|------|-----|----------------|
| 1 | Fundamentos Técnicos | `/fundamentos` | `#8b949e` | 12, 14, 15, 16 |
| 2 | Programação & Algoritmos | `/programacao` | `#3178c6` | 19, 20, 36, 41* |
| 3 | Engenharia de Software | `/engenharia` | `#e3b341` | 7, 8, 21, 10, 11, **22**, **33**, **34**, **42**, **40** |
| 4 | Dados | `/dados` **(NOVO)** | `#10b981` | 24, **38**, **39** |
| 5 | Construção & Clientes | `/construcao` **(NOVO)** | `#ec4899` | 31, **35**, **37** |
| 6 | AWS Cloud | `/aws` | `#ff9900` | 4, 5, 23, 27, 28 |
| 7 | Inteligência Artificial | `/ia` | `#58a6ff` | 1, 2, 9, 25, 26, 29, 30 |
| 8 | Claude & Anthropic | `/claude-anthropic` | `#cc785c` | 13, 17, 18 |

**Carreira** vira seção editorial em Home + Trail 32 (Tech Leadership) dentro de Engenharia — evita inflacionar para 9 hubs.

\* Trail 41 (Go/Rust intro) é opcional P3 — decidir se entra.

### 3.2 Tabela completa de trilhas planejadas

| ID | Nome | Hub | Status | Sprint | Módulos |
|----|------|-----|--------|--------|---------|
| 1 | Fundamentos da IA | IA | ✅ | — | 12 |
| 2 | IA Além do LLM | IA | ✅ | — | 6 |
| 3 | Ferramentas de IA para Código | IA | ✅ | — | 6 |
| 4 | AWS Cloud Practitioner (CLF-C02) | AWS | ✅ | — | 19 |
| 5 | AWS Solutions Architect (SAA-C03) | AWS | ✅ | — | 18 |
| 7 | DevOps & Containers | Engenharia | ✅ | — | 6 |
| 8 | Engenharia de Software Moderna | Engenharia | ✅ | — | 6 |
| 9 | Engenharia AI-Native | IA | ✅ | — | 10 |
| 10 | Sistemas Distribuídos | Engenharia | ✅ | — | 8 |
| 11 | Observabilidade & SRE | Engenharia | ✅ | — | 7 |
| 12 | Fundamentos Técnicos | Fundamentos | ✅ | — | 12 |
| 13 | Claude Code Masterclass | Claude | ✅ | — | 15 |
| 14 | SQL & Databases | Fundamentos | ✅ | — | 9 |
| 15 | Como o Computador Funciona | Fundamentos | ✅ | — | 9 |
| 16 | Redes & Web | Fundamentos | ✅ | — | 8 |
| 17 | Claude API & Agents | Claude | ✅ | — | 11 |
| 18 | Claude Code Pro (Harness Eng) | Claude | ✅ | — | 7 |
| **19** | **TypeScript Profissional** | **Programação** | ✅ | **Sprint 1** | **10** |
| 20 | Estruturas de Dados & Algoritmos | Programação | 🟦 | Sprint 2 | 9 |
| **21** | **API Design & Contratos** | **Engenharia** | ✅ | **Sprint 1** | **9** |
| 22 | Security Engineering | Engenharia | 🟦 | Sprint 2 | 10 |
| 23 | AWS Developer Associate (DVA-C02) | AWS | 🟦 | Sprint 2 | 15 |
| 24 | Data Engineering Moderna | Dados | 🟦 | Sprint 3 | 10 |
| 25 | Fine-tuning & Customização de LLMs | IA | 🟦 | Sprint 3 | 8 |
| 26 | LLM Evals Profissional | IA | 🟦 | Sprint 3 | 7 |
| 27 | AWS SAP-C03 | AWS | 🟨 | Sprint 4 | 18 |
| 28 | FinOps & Cost Engineering | Engenharia | 🟨 | Sprint 4 | 7 |
| 29 | Voice, Vision & Multimodal | IA | 🟨 | Sprint 4 | 7 |
| 30 | AI Safety, Red Teaming & Alinhamento | IA | 🟨 | Sprint 4 | 7 |
| 31 | Frontend Moderno (React/Next internals + Perf) | Construção | 🟨 | Sprint 4 | 8 |
| 32 | Tech Leadership & Staff Engineering | Engenharia | 🟨 | Sprint 4 | 7 |
| **33** | **Testing Engineering** | Engenharia | 🆕 | Sprint 3 | 8 |
| **34** | **Accessibility & Inclusive Engineering** | Engenharia | 🆕 | Sprint 3 | 7 |
| **35** | **Mobile para Devs Web (RN + Expo)** | Construção | 🆕 | Sprint 5 | 8 |
| **36** | **Python para Engenheiros (IA-ready)** | Programação | 🆕 | Sprint 2 | 8 |
| **37** | **Edge Computing & Workers** | Construção | 🆕 | Sprint 5 | 7 |
| **38** | **Database Deep — Postgres Internals** | Dados | 🆕 | Sprint 3 | 8 |
| **39** | **Search & Information Retrieval** | Dados | 🆕 | Sprint 5 | 7 |
| **40** | **DX & Developer Productivity** | Engenharia | 🆕 | Sprint 4 | 7 |
| **42** | **Library & Package Authoring** | Engenharia | 🆕 | Sprint 5 | 6 |

🟦 V2 original · 🆕 Adição minha · 🟨 V2 mas P2/P3

**Totais:**
- Já implementado: 20 trilhas / 190 módulos
- Meta final: **40 trilhas / ~350 módulos**
- Deltas: +20 trilhas / +160 módulos

---

## 4. Detalhe das 8 trilhas NOVAS (minhas adições)

### Trail 33 — Testing Engineering (8 módulos, Engenharia)
**Por quê:** testing aparece solto em vários módulos (RTL em Frontend, Vitest em TS, Pact em API) mas sem alicerce conceitual. Sem isso, dev escreve teste ruim, nunca faz TDD de verdade.
**Módulos:**
1. `test-pyramid-realista` — pyramid vs trophy vs diamond; trade-offs E2E vs unit
2. `tdd-bdd-quando-funcionam` — TDD clássico, red-green-refactor, BDD com cucumber
3. `test-doubles-rigorosos` — mock vs stub vs fake vs spy vs dummy (Meszaros)
4. `property-based-testing` — fast-check, Hypothesis, geradores, shrinking
5. `mutation-testing` — Stryker, PIT — testar os testes
6. `integration-vs-contract-vs-e2e` — quando usar cada, Pact (cobre em API Design), Playwright
7. `performance-testing` — load (k6, artillery), stress, soak tests, perf budgets
8. `capstone-harness-testes-produto-real` — construir pyramid completa pra um app

### Trail 34 — Accessibility & Inclusive Engineering (7 módulos, Engenharia)
**Por quê:** virou obrigação legal (EU AccessAct 2025, ADA em escalada no US). Escondido em Frontend é reducionismo; é disciplina própria.
**Módulos:**
1. `a11y-por-que-agora` — WCAG 2.2 / 3, POUR, legal landscape
2. `semantic-html-o-basico-que-todo-mundo-ignora` — landmarks, headings, labels
3. `aria-quando-usar-quando-nao` — rule of ARIA: "no ARIA is better than bad ARIA"
4. `keyboard-navigation-e-focus-management` — tabindex, focus trap, skip links
5. `screen-readers-na-pratica` — NVDA, JAWS, VoiceOver — testar de verdade
6. `automated-a11y-testing` — axe-core, Lighthouse, Pa11y, RTL a11y
7. `capstone-remediar-site-inacessivel` — tomar um app existente e trazer ao AA

### Trail 35 — Mobile para Devs Web (RN + Expo) (8 módulos, Construção)
**Por quê:** zero cobertura mobile no site hoje. Dev web moderno precisa tocar.
**Módulos:**
1. `rn-mental-model-diferenca-browser` — bridge, new architecture (Fabric/TurboModules)
2. `expo-e-quando-ejectar` — Expo Router, config plugins, development builds
3. `navegacao-moderna` — Expo Router / React Navigation, deep linking
4. `estado-e-async-em-rn` — React Query, Zustand em mobile
5. `native-modules-basicos` — quando precisa nativo, Kotlin/Swift mínimo
6. `build-e-deploy-ios-android` — EAS Build, TestFlight, Play Console, OTA updates
7. `performance-em-rn` — listas grandes (FlashList), memo, Hermes, profiling
8. `capstone-app-offline-first` — app completo com sync SQLite

### Trail 36 — Python para Engenheiros (IA-ready) (8 módulos, Programação)
**Por quê:** IA roda em Python. Dev TS que não sabe Python fica bloqueado em camadas avançadas (Trail 25/26/29/30 precisam disso).
**Módulos:**
1. `python-pra-dev-ts` — diferenças críticas TS↔Python
2. `uv-e-python-moderno` — uv, pyproject.toml, ambientes isolados
3. `type-hints-rigorosos` — PEP 695, TypedDict, Protocol, generics
4. `pydantic-v2-serio` — modelos, validação, serialização, settings
5. `async-em-python` — asyncio, trio, trade-offs vs Node
6. `fastapi-na-pratica` — routers, dependency injection, auth
7. `jupyter-pra-engenharia` — notebook sério, papermill, reprodutibilidade
8. `capstone-agent-python-completo` — agent com Pydantic AI / LangChain / Claude SDK Python

### Trail 37 — Edge Computing & Workers (7 módulos, Construção)
**Por quê:** padrão arquitetural novo. Cloudflare/Vercel/Deno dominam border hoje.
**Módulos:**
1. `edge-vs-cloud-mental-model` — por que edge, latência real, cold start
2. `cloudflare-workers-profundo` — runtime, KV, D1, R2, Durable Objects
3. `vercel-edge-functions` — middleware, edge runtime, ISR
4. `deno-deploy-e-bun` — alternativas, trade-offs
5. `lambda-edge-e-cloudfront-functions` — AWS way
6. `patterns-edge-first` — HTML streaming, data collocation, state at edge
7. `capstone-api-edge-global` — API < 50ms p99 mundial

### Trail 38 — Database Deep (Postgres Internals) (8 módulos, Dados)
**Por quê:** Trail 14 é introdutória. DBs na produção quebram por falta de entender internals.
**Módulos:**
1. `mvcc-e-isolation-levels-de-verdade` — snapshot, serializable vs RR vs RC
2. `query-planner-e-explain-analyze-ninja` — nested loop, hash, merge, custs reais
3. `indices-avançados` — B-tree, BRIN, GIN, GiST, partial, covering, expressão
4. `vacuum-autovacuum-bloat` — mau atendido é #1 causa de DB morrendo
5. `connection-pooling` — pgbouncer, transaction vs session pooling, serverless trap
6. `replication-primary-replica` — sync, async, failover, split-brain
7. `particionamento-e-sharding` — declarative partitioning, Citus, trade-offs
8. `capstone-tuning-de-workload-real` — pegar query de 30s, baixar pra 50ms

### Trail 39 — Search & Information Retrieval (7 módulos, Dados)
**Por quê:** toda aplicação séria tem busca. FTS, BM25, vector — briefing só menciona solto em RAG.
**Módulos:**
1. `busca-o-que-importa` — precision vs recall, F1, NDCG
2. `full-text-search-em-postgres` — tsvector, GIN, ranking
3. `elasticsearch-opensearch-basico` — quando sair de Postgres, inverted index
4. `bm25-tf-idf-sem-misticismo` — scoring real
5. `vector-search-profundo` — HNSW, IVF, distance (parte aparece em trail 9)
6. `hybrid-search-reranking-de-verdade` — RRF, learned ranking
7. `capstone-search-multimodal` — search de produtos com filtro + FTS + vetor

### Trail 40 — DX & Developer Productivity (7 módulos, Engenharia)
**Por quê:** ambientes, dotfiles, shells, devcontainers — o "chão" invisível da produtividade.
**Módulos:**
1. `shell-zsh-bash-serios` — POSIX, starship, aliases, funções
2. `dotfiles-reproduziveis` — chezmoi, stow, GNU Stow
3. `devcontainers-e-codespaces` — dev env efêmero, Containerfile
4. `makefiles-e-task-runners` — make, just, taskfile
5. `editor-produtividade` — VSCode power, Neovim rápido, LSP
6. `terminal-multiplexers` — tmux, zellij — persistir sessões
7. `capstone-dev-setup-do-zero` — novo notebook rodando em 20min

### Trail 42 — Library & Package Authoring (6 módulos, Engenharia)
**Por quê:** muitos devs acabam criando libs internas; poucos fazem certo. Semver, ESM/CJS, tree-shake, publint.
**Módulos:**
1. `lib-vs-app-mentalidade` — decisões que divergem
2. `esm-cjs-dual-package` — package.json exports map, publint
3. `tree-shaking-de-verdade` — sideEffects, pure-annotations
4. `semver-pragmatico-e-changelog` — changesets, release-please
5. `typings-como-produto` — bundled types, types-package-json
6. `capstone-publicar-lib-popular` — lib com 1.0 release, docs, exemplos

---

## 5. Iniciativas estruturais (além das trilhas)

### T0.1 ✅ Hubs Fundamentos + Programação (Sprint 1)
### T0.2 Capstones obrigatórios (Sprint 2)
Adicionar capstone nas trilhas maduras sem: 7, 8, 9, 10, 11, 13, 17. Formato: spec→código→test→release.
**Modificação:** badge `_done` da trilha exige o capstone completo (não só os módulos anteriores).

### T0.3 Grafo `/mapa` (Sprint 3)
Página com SVG interativo mostrando dependências. Usa campo `prerequisites` que já existe.
**Stack:** `@xyflow/react` (React Flow) — leve, acessível.

### T0.4 `/roadmaps` — upgrade de `/playlists` (Sprint 3)
Upgrade visual com: jornada linear com % progresso, branching, 5 roadmaps iniciais:
- "Zero → Staff Engineer em IA"
- "Zero → AWS Solutions Architect Pro"
- "Dev Web → Full-stack AI-Native"
- "Claude Power User → Harness Engineer"
- "Iniciante → Engenheiro de Software Moderno"

### T0.5 Simulado freemium por trilha (Sprint 4)
Adaptação da engine `src/lib/simulados.ts` que já existe pra aceitar **simulado consolidado de trilha** — 15 questões selecionadas dos módulos, grátis primeiras 10, pago restante. Vira funil de conversão entre conteúdo editorial grátis e produtos pagos.

### T0.6 🆕 Biblioteca de `learning loops` (Sprint 5)
Cada capstone vira template baixável (`.zip`) — estrutura inicial, testes, CI. Dev clona e vai preenchendo. Consolidação prática.

### T0.7 🆕 `/benchmarks` (opcional Sprint 6)
Página com comparativos atualizados: LLMs (Sonnet vs GPT vs Gemini), SDKs (Claude vs OpenAI), cloud providers, frameworks web. Vive editorial mas refletindo dados reais — zero benchmark manipulado.

---

## 6. Roadmap de execução — 6 sprints, 18–24 semanas

### ✅ Sprint 1 (concluído) — Ciclo bloqueador P0
- T0.1 Hubs Fundamentos + Programação
- Trail 19 (TS Profissional) · Trail 21 (API Design)

### Sprint 2 (3 semanas) — Ciclo de gaps críticos restantes
- Trail 20 (DS&A) · Trail 36 (Python para Engenheiros) · Trail 22 (Security)
- Trail 23 (AWS DVA-C02)
- T0.2 Capstones obrigatórios em trilhas maduras

### Sprint 3 (3 semanas) — Aprofundamento dados e IA + estrutural
- Trail 24 (Data Eng) · Trail 38 (DB Deep)
- Trail 25 (Fine-tuning) · Trail 26 (LLM Evals Pro)
- Trail 33 (Testing Eng) · Trail 34 (A11y)
- T0.3 `/mapa` · T0.4 `/roadmaps`

### Sprint 4 (3 semanas) — Topo da carreira + DX + AWS avançado
- Trail 27 (AWS SAP) · Trail 28 (FinOps)
- Trail 29 (Multimodal) · Trail 30 (AI Safety)
- Trail 31 (Frontend) · Trail 32 (Tech Leadership)
- Trail 40 (DX & Dev Productivity)
- T0.5 Simulado freemium por trilha

### Sprint 5 (3 semanas) — Construção e dados restantes
- Trail 35 (Mobile RN) · Trail 37 (Edge Computing)
- Trail 39 (Search & IR)
- Trail 42 (Lib Authoring)
- T0.6 learning loops `.zip`

### Sprint 6 (opcional, 2 semanas) — Diferencial
- Trail 41 (Go/Rust intro) — se decisão de entrar
- Real-time & Collaboration (CRDTs, WebRTC) — se decisão de entrar
- T0.7 `/benchmarks`

---

## 7. Critérios de sucesso

Mensuráveis em **Sprint 5 completo**:

1. **Cobertura por camada**: todas as 10 camadas com ≥ 1 trilha; nenhuma camada com gap crítico.
2. **Funil AWS completo**: CLF → DVA → SAA → SAP com simulados em cada.
3. **Funil IA completo**: fundamentos → LLM → RAG → agents → fine-tune → evals → safety → multimodal.
4. **Jornada "zero ao profissional"**: existe pelo menos 1 roadmap visual onde dev iniciante sai do zero ao nível Staff em IA sem precisar de conteúdo externo pra fundamentos.
5. **Cada trilha ≥ 5 módulos + capstone** (capstone é requisito pro badge `_done`).
6. **Cobertura de testes**: `npm test` passa com ≥ 250 testes cobrindo 100% das funções exportadas de `src/lib/*.ts`.
7. **Build limpo**: `npx tsc --noEmit && npm test && npm run build` zero erros em cada commit.
8. **Conteúdo editorial**: nenhum módulo com `readTime < 6 min` (mínimo de densidade).
9. **SEO**: cada módulo com `seoDesc` (155 char ideal) + `keywords` (5–10).
10. **Gamificação**: badge dedicado pra cada trilha + 10+ easter eggs transversais.

---

## 8. Políticas editoriais consolidadas (inegociáveis)

1. **Zero hype, zero clickbait**. Escrita técnica séria, internals, trade-offs, links pra research quando cabível.
2. **Distratores de quiz realistas** — coisas que alguém de verdade erraria, com explicação didática em cada.
3. **Capstone hands-on obrigatório** — abstração sem produto entregue não é capstone.
4. **Português brasileiro em 100%** do conteúdo e UI. Termos técnicos em inglês preservados quando idiomáticos (`event loop`, `tree-shaking`).
5. **Conteúdo editorial é SEMPRE grátis**. Paywall só em simulados e certificados. Never popup em artigo.
6. **Cross-links entre trilhas** — se módulo X de trilha A depende de conceito de módulo Y de trilha B, linkar explicitamente.
7. **Atualização ativa** — módulos que citam versões (Node 22, Postgres 17, Claude 4.x) revisados trimestralmente.

---

## 9. Checklist de execução por trilha (operacional)

Ao implementar cada trilha nova:

### Catálogo (`src/lib/curriculum.ts`)
- [ ] Novo `Trail` apendado ao final (append-only).
- [ ] `id: 'trail<N>'`, `slug` unique, `color`, `icon`, `desc`, `level`, `prerequisites`, `href`.
- [ ] Cada módulo com `slug`, `title`, `icon`, `xp` (20–80), `readTime`, `desc`, `seoDesc`, `keywords`, `prerequisites`, `nextSuggested`, `level`.

### Badges
- [ ] `trail<N>_done` em `BADGES_DEF`.
- [ ] Se trilha tem certificação externa correspondente, considerar badge de "mastery" extra.

### Rotas
- [ ] `src/app/<rota>/page.tsx` com `TrailBlogClient trail={CURRICULUM.find(...)}` — nunca índice fixo.
- [ ] Adicionar nome da rota em `scripts/deploy-hostinger.sh` no array do for.
- [ ] Atualizar `src/app/sitemap.ts` com URL da trilha.

### Artigos
- [ ] Cada módulo com `src/app/aprenda/<slug>/page.tsx`.
- [ ] Import de `ModuleLayout`, `QuizQuestion`, primitivos (`Section`, `Callout`, `CodeBlock`, `InlineCode`, `ComparisonTable`).
- [ ] Callout com `tone` só dos valores aceitos: `'info' | 'warn' | 'danger' | 'success' | 'neutral'`.
- [ ] Quiz com 3 questões mínimo, distratores realistas, explicações didáticas.
- [ ] ≥ 3 seções; pelo menos um code block ou diagrama se tema técnico.

### Validação
- [ ] `npx tsc --noEmit` → 0 erros.
- [ ] `npm test` → 100%.
- [ ] `npm run build` → build estático limpo, todas as rotas prerendered.
- [ ] Review editorial: tom FFV, sem raso, sem typos.

### Hub
- [ ] Adicionar `trailId` no hub correto em `HUBS`.
- [ ] Atualizar `desc` do hub pra mencionar a nova trilha.

### Changelog
- [ ] Entrada no `CHANGELOG_CURRICULUM_V2.md` com tabela de módulos, decisões, métricas.

---

## 10. Ordem de prioridade (caso precise cortar)

Se tempo/orçamento for limitado, **execute nesta ordem**:

### Tier P0 (imperativo — Sprint 2)
- Trail 20 (DS&A), Trail 22 (Security), Trail 36 (Python), Trail 23 (AWS DVA)
- T0.2 Capstones obrigatórios

### Tier P1 (alto impacto — Sprints 3–4)
- Trails 24 (Data Eng), 25 (FT), 26 (Evals), 38 (DB Deep), 33 (Testing Eng), 34 (A11y)
- T0.3 `/mapa`, T0.4 `/roadmaps`, T0.5 simulado freemium

### Tier P2 (diferencial — Sprints 4–5)
- Trails 27 (SAP), 28 (FinOps), 29 (Multimodal), 30 (Safety), 31 (Frontend), 32 (Leadership), 40 (DX)
- Trails 35 (Mobile), 37 (Edge), 39 (Search), 42 (Lib Authoring)

### Tier P3 (opcional)
- Trail 41 (Go/Rust intro)
- Real-time & Collaboration (CRDTs)
- T0.7 `/benchmarks`

---

## 11. O que NÃO vamos fazer (explicitamente)

- **Blockchain/Web3** — fora do foco do site.
- **Embedded/IoT puro** — nichos demais.
- **Game dev como trilha** — interessante mas não no DNA "dev moderno produtivo".
- **Carreira ladder de FAANG específica** — Leveled ou similar fica em Trail 32 de forma genérica.
- **Cursos de interview puros** — Leetcode grind. DS&A (Trail 20) ensina pragmaticamente mas não é "cracking the coding interview".
- **Reviews de ferramentas fechadas sem uso real** — tipo "o melhor IDE de 2026" baseado em marketing.

---

## 12. Próxima ação concreta

**Iniciar Sprint 2** com Trail 20 (DS&A) + Trail 36 (Python) + Trail 22 (Security) + Trail 23 (AWS DVA) + T0.2 capstones obrigatórios.

Estimativa: ~3 semanas de trabalho focado de 1 dev sênior + Claude harness, seguindo o checklist operacional da seção 9 e os padrões do Sprint 1 já concluído.

---

**Fim.** Este documento substitui `BRIEFING_CURRICULUM_V2.md` como fonte canônica de planejamento — briefing V2 continua como registro histórico do reasoning original.
