# CHANGELOG — FFV Academy

> Timeline unificada de mudanças significativas. Mais antigo no fim.
> Sucessor de CHANGELOG_PLATFORM_2026-05.md + CHANGELOG_CURRICULUM_V2.md.

## Convenções
- [PLATAFORMA] mudanças de produto/infra/frontend/backend
- [CURRÍCULO] mudanças de conteúdo, trilhas, módulos
- [BACKEND] mudanças isoladas de API/migrations
- [GAMIFICAÇÃO] mudanças de XP/badges/SRS

---

## 2026-05 — Mês de pivôs grandes (Plataforma)

### Maio/2026 (sem data específica)

#### Expansão de currículo — Profissional Digital
- [CURRÍCULO] Adicionadas 5 trilhas novas, 29 módulos: `trail-comunicacao-humana` (7), `trail-carreira-digital` (6), `trail-criacao-conteudo` (6), `trail-marketing-digital` (5), `trail-empreendedorismo-digital` (5).
- [CURRÍCULO] Trilha de Inglês mantida com 9 módulos (`ingles-fase1-pronomes-to-be` até `ingles-fase7-verbos-modais` + `ingles-1000-palavras` + `ingles-1000-frases`).
- [CURRÍCULO] Padrão dos módulos novos: 4 quizzes com explicações, `LayerStack`, `ComparisonTable`, `DecisionBox`, `CodeBlock`, `QAItem`, take-aways consolidados.
- [CURRÍCULO] 29 páginas novas em `/aprenda/<slug>` cobrindo Comunicação Humana, Carreira Digital, Criação de Conteúdo, Marketing Digital, Empreendedorismo Digital.

#### Home redesenhada (16 → 8 seções)
- [PLATAFORMA] Home reduzida de 16 para 8 seções: Hero, SocialProofBar, HowItWorks, Continue/Hoje, ComecarAqui, Explorar, HomeRanking, ComunidadeAutor, FinalCta.
- [PLATAFORMA] Hero ganhou outcome promise + CTA primário único + `<GameDemo />` lateral.
- [PLATAFORMA] SocialProofBar com count real do banco + fallback honesto.
- [PLATAFORMA] HomeRanking embutido com pódio top 3 + tabs de período (Geral/Ano/Mês/Semana).
- [PLATAFORMA] Componentes home modulares criados em `src/components/home/`: Hero, GameDemo, SocialProofBar, HowItWorks, ComecarAqui, Explorar, HomeRanking, ComunidadeAutor, FinalCta.
- [PLATAFORMA] Removidos: `AllPostsSection` (570 cards), `TrailsSection`, `LearnGameSection`, `NewsletterSection`, `HomeClientLegacy.tsx` (1692 linhas deletadas).

#### Sistema de ranking completo
- [BACKEND] Domínio `internal/domain/leaderboard/leaderboard.go` ganhou `Period` enum (weekly/monthly/yearly/all-time), `IsValidPeriod`, `PeriodWindow`.
- [BACKEND] Repository Postgres com `GetByPeriod` e `GetUserRankByPeriod` (SUM agregando weeks na janela).
- [BACKEND] Handler novo `stats_handler.go` com `GetPublic` (totalUsers, activeWeekly, totalXpAwarded, cache 60s).
- [BACKEND] Rotas registradas: `GET /api/v1/stats`, `GET /api/v1/leaderboard/public?period=...&limit=N`, `GET /api/v1/leaderboard/me/all`.
- [PLATAFORMA] Página `/ranking` nova com 4 tabs, pódio top 3 (glow ouro/prata/bronze), lista até 100, card "Sua posição", label dinâmica do período.
- [PLATAFORMA] `MyRankCard` novo em `/progresso` com 4 grids coloridos por janela.
- [PLATAFORMA] Lib `src/lib/leaderboard-api.ts` com `getPublicLeaderboard`, `getMyRankAll`, `getPlatformStats`.

#### /news rebuscada
- [PLATAFORMA] NewsCard reformulado com 5 camadas visuais: imagem real Unsplash, mesh gradient da marca, overlay escuro, noise SVG, sigla gigante decorativa.
- [PLATAFORMA] Hero featured em layout 100% width na primeira manchete.
- [PLATAFORMA] Filtros refinados com chips gradient azul-roxo no ativo.
- [PLATAFORMA] Header com H1 gradient triplo, grid pattern, badge de curadoria editorial com pulse.
- [PLATAFORMA] Schema `src/lib/news.ts` ganhou `imageUrl` opcional; hash determinístico em `news-imagery.ts`.

#### Auditoria + 19 melhorias executadas
- [PLATAFORMA] `/sobre` criada com 4 princípios + stats reais.
- [PLATAFORMA] Sitemap.xml dinâmico atualizado (`app/sitemap.ts`); `public/sitemap.xml` antigo removido.
- [PLATAFORMA] Robots.txt dinâmico com AI crawlers (GPTBot, ClaudeBot etc); `public/robots.txt` removido.
- [PLATAFORMA] Plausible analytics integrado com `lib/analytics.ts` catalogando 13 eventos type-safe.
- [PLATAFORMA] `SyncBanner` persistente — "Seu progresso está só no navegador".
- [PLATAFORMA] `/comunidade` com 6 canais (newsletter, Discord em breve, Twitter, LinkedIn, GitHub, YouTube).
- [PLATAFORMA] `/newsletter` com arquivo das 5 últimas edições + CTA Buttondown.
- [PLATAFORMA] `/explorar` com busca + filtros (hub, dificuldade) + paginação 60/clique sobre 600+ módulos.
- [PLATAFORMA] Sync de progresso P0: `pullProgress` no AuthProvider login + `schedulePush` em `saveAsync`.
- [PLATAFORMA] `/search` real com scoring (title 3x, desc 2x, keywords 1x), debounce 150ms, highlight, populares como atalho.
- [PLATAFORMA] Mobile polish: GameDemo aparece em mobile + `PWAInstallBanner` integrado.
- [PLATAFORMA] Infra de OG dinâmica completa via `scripts/generate-og-images.mjs`.

#### Infraestrutura
- [PLATAFORMA] Trilha "Search & Information Retrieval" movida de `/search` para `/search-trilha` para liberar `/search` para busca real.
- [PLATAFORMA] Links 404 corrigidos: `/explorar`, `/sobre`, `/comunidade` agora existem; `/profissional-digital` → `/aprenda/comunicacao-falar-em-publico`; `/playlists/${id}` → `/playlists`.

---

## 2026-04 — Expansão de currículo v2 (sprints 1-9)

### 2026-04-20 — Sprint 9: Backlog final (Language Enhancement + Extras)
- [CURRÍCULO] 5 módulos de história+compilador+diferencial adicionados ao início de C/C++/C#/Java/Go (Rust já tinha): `c-historia-compilador-diferencial`, `cpp-historia-compilador-diferencial`, `csharp-historia-compilador-diferencial`, `java-historia-compilador-diferencial`, `go-historia-compilador-diferencial`.
- [PLATAFORMA] Roadmaps por papel: total agora 9 (4 novos): `data-engineer-staff`, `platform-engineer`, `sre-incident-to-reliability`, `ai-safety-researcher`.
- [PLATAFORMA] Catálogo de simulados agora com 7 (4 novos): CKA, Terraform Associate 003, CompTIA Security+ SY0-701, Azure Fundamentals AZ-900 — cada questão com `explanation` estilo tutor.
- [PLATAFORMA] Nova rota `/cheatsheets` com 5 cheatsheets imprimíveis: Postgres, Git avançado, Kubernetes diário, Rust essencial, System Design prep. Componente `CheatsheetLayout` reutilizável.
- [PLATAFORMA] Glossário expandido de 27 para 45 termos (+18: tool-use, agent-harness, MCP, MoE, RAG evals, KV cache, speculative decoding, LoRA/QLoRA, DPO, constitutional AI, prompt injection, LLM-as-judge, golden set, ANN search, vector DB, agents, RLHF, inference).
- [PLATAFORMA] Playlists cross-hub: 5 → 11 (+6 novas: "Primeiros 90 dias como dev", "De júnior a pleno", "IA para devs backend", "Kubernetes zero → prod", "Staff Engineer path").
- [PLATAFORMA] Build estático: 685 páginas. Testes: 341 passando. ZIP Hostinger: 14MB.

### 2026-04-20 — Sprints 7-8: Tier 1 + Tier 2 (17 trilhas, 124 módulos)
- [CURRÍCULO] Tier 1 (Sprint 7): Trail 50 ML Clássico (8), Trail 51 MLOps (8), Trail 52 System Design Interview (10), Trail 53 Technical Writing & RFCs (7), Trail 54 NoSQL+Vector DBs (8).
- [CURRÍCULO] Tier 2 (Sprint 8): Trails 55 (CV), 56 (iOS Native Swift), 57 (Android Native Kotlin), 58 (GraphQL), 59 (Platform Eng & IDPs), 60 (Performance Eng), 61 (Cryptography Applied), 62 (Kafka Depth), 63 (Real-time Systems), 64 (Product Eng), 65 (Career Eng), 66 (Chaos Eng).
- [GAMIFICAÇÃO] +18 badges novos (`trail50_done` a `trail66_done`).
- [CURRÍCULO] Hub wiring: IA +trail50/51/55; Engenharia +trail52/53/58-66; Construção +trail56/57; Dados +trail54.
- [CURRÍCULO] 95 artigos agent-authored + 29 via `scripts/gen-articles.py` (template PT-BR com 3 sections + 3 quiz questions).
- [CURRÍCULO] Fix de integridade: `nextSuggested` quebrados em trail53 e trail61 corrigidos.
- [PLATAFORMA] Build estático: 662 páginas (521 → 662). ZIP Hostinger: 13MB.

### 2026-04-19 — Sprint 6: Platform Features + Rust
- [PLATAFORMA] PDF Download: botão em ModuleLayout (header) e TrailBlogClient via `window.print()` + CSS `@media print` profissional (oculta nav/HUD/TOC, tipografia print-friendly, URLs expandidas, page breaks). Classe `ffv-printing` cross-browser.
- [PLATAFORMA] Modo Apresentação: botão em cada módulo/trilha, componente `PresentationMode` extrai sections via `data-section-title` e renderiza slide deck fullscreen com keyboard (setas, Space/PageDown, Home/End, F, ESC) + footer com dots clicáveis.
- [CURRÍCULO] Trail 49 — Rust Profissional (8 módulos no hub Programação): história, ownership/borrow, lifetimes, async tokio, macros, unsafe/FFI, cargo/perf, capstone CLI+Axum.
- [GAMIFICAÇÃO] Badge `trail49_done` (+325 XP) "Rustacean".
- [PLATAFORMA] Build estático: 521 páginas. Testes: 341.

### 2026-04-19 — Sprints 4-5-L: P2, P3 e Linguagens (17 trilhas, 135 módulos)
- [CURRÍCULO] Sprint 4 (P2, 7 trails): Trail 27 AWS SAP-C03 (18), 28 FinOps (7), 29 Multimodal (7), 30 AI Safety (7), 31 Frontend Moderno (8), 32 Tech Leadership (7), 40 DX & Productivity (7).
- [CURRÍCULO] Sprint 5 (P3, 4 trails): Trail 35 Mobile RN+Expo (8), 37 Edge Computing (7), 39 Search & IR (7), 42 Lib Authoring (6).
- [CURRÍCULO] Sprint L (Linguagens, 6 trails): Trail 43 C Moderno (8), 44 C++ Moderno (8), 45 C#/.NET (8), 46 Java Moderno (8), 47 Go Profissional (8), 48 Comparação de Linguagens (6).
- [CURRÍCULO] Hub novo "Construção & Clientes" (`/construcao`) agrupa trails 31, 35, 37, 42. Cor `#a855f7`, ícone construção.
- [CURRÍCULO] Wiring: IA +29/30; AWS +27/28; Engenharia +32/40; Programação +43-48.
- [GAMIFICAÇÃO] +18 badges (17 `trailN_done` + `simulado_aws_sap`).
- [PLATAFORMA] Trilhas ativas: 28 → 45. Módulos: 289 → 426 (+135). Hubs: 7 → 8. Testes: 288 → 334.
- [PLATAFORMA] Correções JSX parse em 6 arquivos pré-existentes (`core-web-vitals-perf`, `deno-deploy-bun`, `full-text-search-postgres`, `jailbreaks-prompt-injection`, `react-fiber-commit-phase`, `tree-shaking-de-verdade`).

### 2026-04-19 — Sprint 3B: Data Eng + Fine-tune + Evals + estrutural
- [CURRÍCULO] Trail 24 Data Engineering Moderna (10), Trail 25 Fine-tuning & Customização LLMs (8), Trail 26 LLM Evals Profissional (7).
- [CURRÍCULO] Hub novo Dados (`/dados`): Trail 24 + Trail 38 (DB Deep movida de Fundamentos). Cor `#10b981`, ícone fábrica.
- [CURRÍCULO] Fundamentos fica com 4 trails (12, 14, 15, 16). IA expande para 6 (1, 2, 3, 9, 25, 26).
- [PLATAFORMA] T0.3: Página `/mapa` com visão de trilhas por hub + progresso individual + legenda (SVG sem libs).
- [PLATAFORMA] T0.4: Página `/roadmaps` com 5 jornadas curadas (Zero→Staff IA, Dev Web→AWS SA Pro, Backend→Full-stack AI-Native, Claude Power User→Harness Eng, Iniciante→Eng Software Moderno). `src/lib/roadmaps.ts` com registry.
- [GAMIFICAÇÃO] +5 badges (3 trail_done + 2 estruturais).
- [PLATAFORMA] Trilhas: 27 → 29. Módulos: 262 → 287. Hubs: 6 → 7. Testes: 288/288.

### 2026-04-19 — Sprint 3A: Testing + A11y + DB Deep
- [CURRÍCULO] Trail 33 Testing Engineering (8): test pyramid/trophy/diamond, TDD/BDD, test doubles, property-based (fast-check), mutation (Stryker), integration/contract/e2e, k6, capstone.
- [CURRÍCULO] Trail 34 Accessibility & Inclusive Eng (7): EAA 2025/ADA, semantic HTML, ARIA, keyboard/focus, NVDA/VoiceOver, axe/Lighthouse, capstone remediação AA.
- [CURRÍCULO] Trail 38 Database Deep — Postgres Internals (8): MVCC + isolation, EXPLAIN ANALYZE, índices avançados (B-tree/BRIN/GIN/GiST), vacuum/bloat, pgbouncer + RDS Proxy, replication, partitioning + Citus, capstone tuning 30s→50ms.
- [PLATAFORMA] 3 páginas de trilha: `/testing-engineering`, `/acessibilidade`, `/postgres-internals`.
- [GAMIFICAÇÃO] +3 badges.
- [PLATAFORMA] Trilhas: 24 → 27. Módulos: 239 → 262. Testes: 270/270 (+14 em `curriculum-v2-sprint3a.test.ts`).
- [PLATAFORMA] Fix colateral: test `srsReviewFlow` (timezone UTC vs local) agora determinístico.

### 2026-04-19 — Sprint 2: P0 master plan + capstones T0.2
- [CURRÍCULO] Trail 20 Estruturas de Dados & Algoritmos (9, Programação), Trail 22 Security Engineering (10, Engenharia), Trail 23 AWS DVA-C02 (15, AWS), Trail 36 Python para Engenheiros (8, Programação).
- [CURRÍCULO] Capstones obrigatórios (T0.2) em 7 trilhas maduras: trail7 (DevOps EKS+ArgoCD), 8 (refactor legacy ADR), 9 (RAG produção hybrid search+canary), 10 (saga+outbox), 11 (SLO multi-burn-rate), 13 (Claude Code team playbook), 17 (Claude agent com prompt caching+MCP+FF).
- [PLATAFORMA] Simulado pago `simulado-aws-developer` (R$ 67, 15 questões) + badge `simulado_aws_developer` (+250 XP).
- [GAMIFICAÇÃO] +5 badges em `BADGES_DEF`.
- [PLATAFORMA] 4 páginas de trilha: `/ds-algoritmos`, `/security-engineering`, `/aws-developer-associate`, `/python-engenheiros`.
- [PLATAFORMA] Trilhas: 20 → 24. Módulos: 190 → 239 (+49 = 42 novos + 7 capstones). Badges: 60 → 65.

### 2026-04-19 — Sprint 1: TS Profissional + API Design + Fundamentos/Programação
- [CURRÍCULO] Hub 5 Fundamentos Técnicos criado (`/fundamentos`, cor `#8b949e`) — agrupa trails órfãs 12/14/15/16.
- [CURRÍCULO] Hub 6 Programação & Algoritmos criado (`/programacao`, cor `#3178c6`) — recebe Trail 19.
- [CURRÍCULO] Trail 19 TypeScript Profissional (10 módulos, ~565 XP, `/typescript-profissional`): mental model, narrowing/unions, generics, utility types, Zod/Valibot, async/AbortController, Result errors, perf Node, monorepo pnpm/Turbo, capstone CLI tipada.
- [CURRÍCULO] Trail 21 API Design & Contratos (9 módulos, ~485 XP, `/api-design`, hub Engenharia): REST maduro/Richardson, versionamento, GraphQL/DataLoader, gRPC/proto, OpenAPI/Pact, paginação cursor, idempotency keys, rate limiting Redis+Lua, capstone Tasks API.
- [GAMIFICAÇÃO] Badges `trail19_done` e `trail21_done` (+250 XP cada).
- [PLATAFORMA] 4 páginas novas (`/fundamentos`, `/programacao`, `/typescript-profissional`, `/api-design`) + 19 páginas em `/aprenda/<slug>`.
- [PLATAFORMA] Trilhas: 18 → 20. Módulos: 171 → 190. Hubs: 4 → 6. Badges: 58 → 60. Testes: 229/229.

---

## Próximos passos

Para roadmap detalhado de trilhas pendentes e iniciativas estruturais, ver `BACKEND_ROADMAP.md`, `MELHORIAS.md` e `CURRICULUM_MASTER_PLAN.md`. Tier 1 do roadmap atual (mai/2026) está em `CLAUDE.md` §"Roadmap de funcionalidades".

Novas grandes mudanças → adicionar entrada no topo deste arquivo com data ISO `YYYY-MM-DD` e tag apropriada.
