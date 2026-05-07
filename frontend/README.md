<div align="center">

# FFV Academy — Frontend

**A escola de engenharia para a era da IA. Gratuita, gamificada e sem hype.**

[![CI](https://img.shields.io/github/actions/workflow/status/feh-franc0/fernandofrancovalledotcom/ci.yml?branch=main&label=CI&logo=github)](https://github.com/feh-franc0/fernandofrancovalledotcom/actions/workflows/ci.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/537%20tests-passing-brightgreen)]()
[![Lint](https://img.shields.io/badge/lint-0%20warnings-brightgreen)]()

[fernandofrancovalle.com](https://fernandofrancovalle.com) · [Documentação técnica](./CLAUDE.md) · [Changelog](../CHANGELOG_PLATFORM_2026-05.md)

</div>

---

## O que é

O FFV Academy frontend é uma plataforma de aprendizagem técnica completa — **100% estática**, sem servidor Node em produção, com gamificação real, revisão espaçada cientificamente fundamentada e currículo de profundidade que a concorrência não tem coragem de oferecer.

> "Aprenda IA, AWS e Engenharia de Software como engenheiro — não como consumidor de hype."

---

## Currículo — 900+ módulos, todos gratuitos

**8 hubs temáticos + Profissional Digital:**

| Hub | Trilhas | Destaques de conteúdo |
|-----|---------|----------------------|
| IA & Machine Learning | 12+ | Transformers internals, RAG, LLMOps, embeddings |
| AWS | 10+ | Solutions Architect, Practitioner, CloudFront, IAM |
| Engenharia de Software | 10+ | MVCC, SRE, sistemas distribuídos, observabilidade |
| Claude & Anthropic | 8+ | Context engineering, prompt caching, tool use |
| Fundamentos | 8+ | Algoritmos, redes, sistemas operacionais, compiladores |
| Programação | 8+ | Go, TypeScript, Python, Rust internals |
| Dados | 6+ | Postgres internals, pipelines, streaming |
| Profissional Digital | 5 trilhas | Comunicação, carreira, conteúdo, marketing, empreendedorismo |

Cada módulo segue um template profissional com comparação X vs Y, passos práticos, quiz com explicações fundamentadas e take-aways consolidados. Não são tutoriais de surface-level — cada artigo explica o *porquê* por baixo.

---

## Gamificação — séria, não cosmética

A camada de aprendizagem é implementada em `src/lib/engine.ts` com mutações puras e estado persistido em IndexedDB + localStorage (compactado com lz-string).

### XP & Níveis
16 níveis com thresholds progressivos — de **Iniciante** a **Lendário**. XP distribuído 70% por leitura (tempo real no artigo) e 30% por quiz. Sons de feedback via Web Audio API (XP coin, level up, badge).

### Streak diário com freeze
Contador de dias consecutivos de estudo. A cada 7 dias, o usuário ganha um **freeze** (cap 2) — proteção automática para dias offline, consumido antes de quebrar o streak.

### 128+ badges com lógica real
Badges organizados em grupos (`MODULE`, `REVIEW`, `QUIZ`). Desbloqueio idempotente — não duplica. Exemplos reais: "Especialista em RAG" (5 módulos de RAG completos), "Maratonista" (streak de 30 dias), "Perfeccionista" (10 quizzes com 100%).

### SRS — Revisão Espaçada com algoritmo SM-2
Após cada quiz, as perguntas entram numa fila de revisão com o algoritmo SM-2 (o mesmo do Anki). O sistema recalcula intervalo baseado no `easeFactor` de cada resposta — não é "marque como pronto", é memorização de longo prazo cientificamente comprovada. Cards disponíveis em `/revisar`.

### Meta diária customizável
O usuário configura de 1 a 10 módulos por dia. O GameHUD exibe o progresso em tempo real durante a sessão.

### Leaderboard com 4 períodos
Ranking público com pódio animado (ouro/prata/bronze), lista de até 100 posições e destaque para top 10. Quatro janelas de tempo: **Geral**, **Anual**, **Mensal** e **Semanal**. Card "Sua posição" para usuários logados com XP gap para a posição acima.

---

## Páginas e rotas

| Rota | O que entrega |
|------|--------------|
| `/` | Hero + GameDemo animado + ranking ao vivo + 6 caminhos de entrada |
| `/aprenda/<slug>` | 900+ módulos com TOC sticky, quiz, XP, SRS e badges |
| `/<hub>` | Página de hub agrupando trilhas (8 hubs) |
| `/progresso` | Dashboard: XP, level, heatmap 91 dias, badges, rank nos 4 períodos |
| `/revisar` | Fila SRS com SM-2 — cards gerados automaticamente pelos quizzes |
| `/ranking` | Leaderboard completo com 4 períodos e pódio animado |
| `/simulados` | Simulados de certificação com timer server-authoritative + certificado |
| `/search` | Busca instantânea com scoring (título 3×, desc 2×, keywords 1×) e debounce 150ms |
| `/explorar` | Discovery de 600+ módulos por hub, trilha e dificuldade com paginação |
| `/news` | Curadoria editorial em magazine layout com imagens reais e mesh gradient |
| `/mapa` | Grafo visual de todas as trilhas |
| `/playlists` · `/roadmaps` · `/cheatsheets` | Conteúdo curado e estruturado |
| `/sobre` · `/comunidade` · `/newsletter` | Identidade da plataforma e comunidade |
| `/verificar` | Lookup público de certificado por hash SHA-256 — sem login |
| `/preferencias` | Perfil + export LGPD + soft-delete de conta |

---

## UX e experiência de leitura

- **Command palette** (`Cmd/Ctrl+K`) global com busca de módulos e trilhas
- **TOC sticky** em desktop com highlight de seção ativa via IntersectionObserver; bottom sheet em mobile
- **Reading progress bar** no topo (2px–4px, clamp responsivo)
- **Syntax highlighting com Shiki** (github-dark) — Server Component async, sem flash no hydrate
- **Bookmarks** por módulo com `BookmarkButton` e aria-pressed
- **Avaliação por módulo** (👍/👎) com persistência local
- **Onboarding modal** — 3 perguntas na primeira visita, recomenda hub e playlist personalizada
- **CelebrationOverlay** — overlay de badge/level-up/streak com animação e auto-dismiss 3.2s
- **Keyboard shortcuts** — modal `?` com 10 atalhos listados
- **SyncBanner** — lembra usuários sem conta que o progresso está só no navegador (dismiss 7d)
- **PWAInstallBanner** — install prompt mobile via `beforeinstallprompt` (dismiss 14d)

---

## PWA — funciona como app

Instalável como PWA no iOS e Android. Service worker com cache de assets. Funciona offline para leitura de módulos já visitados. O manifest já está configurado com ícones, theme color e display standalone.

---

## Performance e qualidade

### Build estático — zero servidor em produção
`output: "export"` — o site inteiro é um conjunto de arquivos estáticos. Deploy por FTP no Hostinger. Sem servidor Node, sem cold starts, sem TTFB de API em páginas de conteúdo.

### Lighthouse CI em todo PR
Thresholds configurados em `.github/workflows/lighthouse.yml`:
- Performance ≥ 80
- Acessibilidade ≥ 90
- Best practices ≥ 85
- SEO ≥ 85

### Bundle calibrado
`bundlesize.config.json` com limites medidos no build real: JS ≤ 400kB, CSS ≤ 100kB.

### SEO completo
- `sitemap.ts` dinâmico cobrindo todas as 900+ rotas
- `robots.ts` com regras explícitas para AI crawlers (GPTBot, ClaudeBot allowlisted)
- `ArticleJsonLd` Schema.org em todos os módulos
- OG images por módulo via `scripts/generate-og-images.mjs`
- Metadata tipada em `src/lib/metadata.ts`

### Analytics LGPD-ok
Plausible Analytics — sem cookies, sem dados pessoais, sem banner de consentimento necessário. `src/lib/analytics.ts` cataloga 13 eventos tipados: `module_completed`, `quiz_passed`, `level_up`, `badge_unlocked`, `search_performed`, e mais.

---

## Testes — 537 passando

| Categoria | Stack | Quantidade |
|-----------|-------|-----------|
| Unit (engine, SRS, scoring, schemas) | Vitest + happy-dom | ~150 |
| Integration (hooks, auth, sync) | Vitest | ~80 |
| Security (XSS, prototype pollution, CSP) | Vitest | ~40 |
| E2E (PWA banner, sync banner, ranking, busca) | Playwright Chromium | ~40 |

**Cobertura:** 80% lines / 70% branches enforced em CI. Pre-commit hook bloqueia commit se lint, tsc ou testes falharem.

Zero lint warnings — política estrita desde o início.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16.2 App Router, React 19 |
| Linguagem | TypeScript 5 strict |
| Estilo | Tailwind 4 + CSS custom properties (`--ffv-*`) |
| Componentes | `@base-ui/react` (acessível, sem Radix) |
| Highlighting | Shiki (github-dark) — Server Component |
| Gamificação | `engine.ts` puro + IndexedDB + lz-string |
| SRS | `srs.ts` — SM-2 com easeFactor e repetitions |
| Auth | Magic link por email + auto-refresh JWT 12min |
| Persistência | IndexedDB (idb) com fallback localStorage |
| Erros | Sentry (SSR-safe via globalThis) |
| Testes | Vitest 4 + Playwright 1.59 |
| CI | GitHub Actions + Lighthouse CI + bundlesize |
| Deploy | Build estático → Hostinger via FTP |

---

## Comandos

```bash
npm run dev            # dev server :3000 (Turbopack)
npm test               # 537 testes (unit + integration + security)
npm run test:coverage  # cobertura com thresholds
npm run e2e            # Playwright chromium
npm run build          # build estático → out/
npm run lint           # zero warnings policy
npm run generate-og    # gera OG images via Satori
```

---

## Arquitetura de pastas

```
src/
├── app/                     Rotas Next.js App Router
│   ├── aprenda/<slug>/      900+ módulos (cada um page.tsx)
│   ├── ranking/             Leaderboard 4 períodos
│   ├── search/              Busca instantânea
│   ├── explorar/            Discovery de módulos
│   └── ...                  Sobre, comunidade, newsletter, etc.
├── components/
│   ├── home/                9 componentes modulares da home
│   ├── article/             ModuleLayout, primitives, TOC, CodeBlock
│   ├── auth/                AuthProvider, LoginModal, AuthBadge
│   └── ...                  GameHUD, CelebrationOverlay, StudyHeatmap
├── lib/
│   ├── engine.ts            Gamificação — XP, badges, streak, SM-2 init
│   ├── srs.ts               Algoritmo SM-2 (easeFactor, interval, repetitions)
│   ├── curriculum.ts        Source of truth — 8 hubs, 66+ trilhas, 900+ módulos
│   ├── leaderboard-api.ts   getPublicLeaderboard, getMyRankAll por período
│   ├── analytics.ts         Plausible type-safe com 13 eventos
│   └── sounds.ts            Web Audio API — XP coin, level up, badge
└── hooks/
    └── useGameState.ts      Hook principal — load, save, markComplete, reviewOne
```

---

<div align="center">

Construído com **Next.js 16**, **TypeScript strict** e **537 testes falando a verdade**.

[fernandofrancovalle.com](https://fernandofrancovalle.com) · [@feh-franc0](https://github.com/feh-franc0)

</div>
