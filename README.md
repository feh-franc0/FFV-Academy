<div align="center">

# FFV Academy

**Plataforma de educação técnica gamificada — blog, currículo, simulados e certificação.**

Monorepo full-stack com frontend estático (Next.js 16), API em Go 1.25, pipeline de vídeo com Remotion + Playwright e tooling de diagramas AWS auto-corrigíveis.

[![CI](https://img.shields.io/github/actions/workflow/status/feh-franc0/fernandofrancovalledotcom/ci.yml?branch=main&label=CI&logo=github)](https://github.com/feh-franc0/fernandofrancovalledotcom/actions/workflows/ci.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/feh-franc0/fernandofrancovalledotcom/security.yml?branch=main&label=Security&logo=github)](https://github.com/feh-franc0/fernandofrancovalledotcom/actions/workflows/security.yml)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go)](https://go.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-504%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-80%25%2B-brightgreen)]()

[Demo](https://fernandofrancovalle.com) · [Documentação](./CLAUDE.md) · [Roadmap](./BACKEND_ROADMAP.md) · [Currículo](./CURRICULUM_MASTER_PLAN.md)

</div>

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Destaques](#destaques)
- [Arquitetura](#arquitetura)
- [Stack tecnológica](#stack-tecnológica)
- [Estrutura do monorepo](#estrutura-do-monorepo)
- [Quick start](#quick-start)
- [Subprojetos](#subprojetos)
  - [Frontend](#frontend--nextjs-16--tailwind-4--vitest)
  - [Backend](#backend--go-125--chi--postgres--redis)
  - [Video Pipeline](#video-pipeline--remotion--playwright)
  - [Draw.io Tools](#drawio-tools--validador-iterativo-de-diagramas-aws)
- [API REST](#api-rest)
- [Gamificação](#gamificação)
- [Testes & qualidade](#testes--qualidade)
- [CI/CD & Deploy](#cicd--deploy)
- [Segurança](#segurança)
- [Observabilidade](#observabilidade)
- [Documentação adicional](#documentação-adicional)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)
- [Autor & licença](#autor--licença)

---

## Sobre o projeto

**FFV Academy** é uma plataforma de educação técnica em português para desenvolvedores e profissionais de tecnologia, organizada em **8 hubs temáticos** (IA, AWS, Engenharia de Software, Claude/Anthropic, Fundamentos, Programação, Dados e Construção & Clientes), **66 trilhas** e mais de **570 artigos** — todos gratuitos, sem cadastro obrigatório.

A plataforma combina um **blog técnico denso e pedagógico** com uma camada de **aprendizagem gamificada** (XP, streak, badges, repetição espaçada e certificados verificáveis) e **simulados pagos** com correção server-authoritative.

**Para quem é:** desenvolvedores intermediários a sêniores que querem internalizar fundamentos sem o ruído de cursos genéricos. Cada artigo aborda mecanismos internos, contraste com alternativas e armadilhas reais — não tutoriais "happy path".

**Diferenciais:**

- **Conteúdo aberto, paywall só em simulados** — o blog é DNA gratuito; só certificação cobra.
- **Gamificação séria, não cosmética** — XP por leitura *e* quiz, SRS (SM-2 simplificado) automatizado a partir do quiz, badges idempotentes, leaderboard semanal.
- **Tutor IA integrado** com prompt caching (Claude Sonnet 4.6) e rate-limit por plano.
- **Certificados verificáveis** (SHA-256 truncado) com lookup público sem login.
- **Server-authoritative scoring** — o cliente não calcula nota de simulado.
- **LGPD by design** — export de dados (`GET /me/export`) e soft-delete no `DELETE /me`.

---

## Destaques

| Métrica                | Valor                                                                       |
| ---------------------- | --------------------------------------------------------------------------- |
| **Linhas de código**   | ~102.500 (TypeScript 862 arquivos, Go 132 arquivos, Python 4, Bash 9)       |
| **Rotas frontend**     | 96 (8 hubs + 66 trilhas + páginas transacionais)                            |
| **Endpoints API**      | 39 rotas REST (`/api/v1/`)                                                  |
| **Migrations**         | 48 (`v000001` → `v000048`)                                                  |
| **Testes**             | **504** — 461 Vitest (unit/integration/security/E2E) + 43 Go                |
| **Coverage threshold** | 80% lines / 70% branches (frontend), reportado em HTML (backend)            |
| **Workflows CI/CD**    | 3 (ci, deploy, security) + Dependabot semanal em 4 ecossistemas             |

---

## Arquitetura

```
                          ┌─────────────────────────────┐
                          │       fernandofrancovalle.com │
                          │     (Hostinger — estático)   │
                          └──────────────┬──────────────┘
                                         │ HTTPS
                                         ▼
                ┌──────────────────────────────────────────────┐
                │  Frontend — Next.js 16 (output: "export")     │
                │  • 96 rotas pré-renderizadas                  │
                │  • Gamificação client-side (engine.ts)        │
                │  • localStorage + IndexedDB fallback (lz)     │
                │  • Sentry, base-ui, Tailwind 4                │
                └──────────────┬───────────────────────────────┘
                               │ NEXT_PUBLIC_API_BASE_URL
                               ▼
        ┌────────────────────────────────────────────────────────┐
        │  Backend — Go 1.25 + Chi (DDD: domain → app → infra)    │
        │                                                         │
        │   HTTP layer ──► Application ──► Domain (puro)          │
        │       │              │              │                   │
        │       │              ▼              ▼                   │
        │       │         Infrastructure (adapters)               │
        │       │              │                                  │
        │       └──── middleware: JWT, rate-limit (Redis),        │
        │             logger (slog), metrics (Prometheus),        │
        │             OTel tracing (OTLP gRPC)                    │
        └──────┬─────────────┬────────────┬─────────────┬─────────┘
               │             │            │             │
          ┌────▼────┐   ┌────▼────┐  ┌────▼────┐  ┌─────▼─────┐
          │Postgres │   │  Redis  │  │ Stripe  │  │  Claude    │
          │   16    │   │    7    │  │ Webhook │  │ (Anthropic)│
          └─────────┘   └─────────┘  └─────────┘  └────────────┘
                                          │
                                     ┌────▼────┐  ┌──────────┐
                                     │ Resend  │  │  Twilio   │
                                     │ (email) │  │   (SMS)   │
                                     └─────────┘  └──────────┘
```

**Princípios:**

- **Frontend estático** (`output: "export"`) — zero servidor Node em produção, deploy por FTP no Hostinger.
- **Backend hexagonal/DDD** — `domain/` é puro, `application/` orquestra ports, `infrastructure/` traz adapters concretos.
- **Server-authoritative** — scoring de simulado, emissão de certificado e XP final calculados no servidor.
- **LWW conflict resolution** em `progress_snapshots` (`updated_at`).
- **Idempotência** em webhooks Stripe (tabela `stripe_events`) e em `awardBadge()` no cliente.

---

## Stack tecnológica

### Frontend

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.59-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Sentry](https://img.shields.io/badge/Sentry-10.50-362D59?logo=sentry&logoColor=white)](https://sentry.io/)

### Backend

[![Go](https://img.shields.io/badge/Go-1.25-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Chi](https://img.shields.io/badge/Chi-v5.2-00ADD8)](https://github.com/go-chi/chi)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![Anthropic](https://img.shields.io/badge/Anthropic-SDK%20v1.37-D97757)](https://github.com/anthropics/anthropic-sdk-go)
[![Stripe](https://img.shields.io/badge/Stripe-v82-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)
[![OpenTelemetry](https://img.shields.io/badge/OTel-v1.41-425CC7)](https://opentelemetry.io/)

### Video Pipeline

[![Remotion](https://img.shields.io/badge/Remotion-4-FF5C8D)](https://www.remotion.dev/)
[![Playwright](https://img.shields.io/badge/Playwright-1.48-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)

### Tooling & Infra

[![Docker](https://img.shields.io/badge/Docker-multi--stage-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?logo=githubactions&logoColor=white)](https://github.com/features/actions)
[![Husky](https://img.shields.io/badge/Husky-9-1A1A1A)](https://typicode.github.io/husky/)
[![Dependabot](https://img.shields.io/badge/Dependabot-weekly-025E8C)](https://docs.github.com/en/code-security/dependabot)

---

## Estrutura do monorepo

```
fernandofrancovalledotcom/
├── frontend/              Next.js 16 — blog + plataforma gamificada (estático)
├── backend/               Go 1.25 — API REST + workers (DDD hexagonal)
├── video-pipeline/        Remotion + Playwright — vídeos de marketing
├── drawio-tools/          Python + Bash — validador iterativo de diagramas AWS
├── docs/                  Documentação de projeto (CI, decisões)
├── deploy/                Artefatos estáticos para Hostinger (build)
├── scripts/               deploy.sh, vps-setup.sh
├── .github/
│   ├── workflows/         ci.yml, deploy.yml, security.yml
│   └── dependabot.yml     Atualizações semanais (gomod, npm, actions, docker)
├── .husky/                pre-commit: lint + test + go build + go test
├── CLAUDE.md              Documentação canônica para agentes (start here)
├── BACKEND_ROADMAP.md     Próximas features do backend
├── CURRICULUM_MASTER_PLAN.md  Roadmap editorial (66 trilhas, 570+ artigos)
├── BRIEFING_CURRICULUM_V2.md  Estratégia editorial e DNA do conteúdo
├── CHANGELOG_CURRICULUM_V2.md Histórico de adições ao currículo
├── WALKTHROUGH.md         Setup + deploy para o maintainer
└── MELHORIAS.md           Backlog priorizado de UX/infra
```

---

## Quick start

**Pré-requisitos:** Node 20+, Go 1.25+, Docker, `golang-migrate`.

```bash
git clone https://github.com/feh-franc0/fernandofrancovalledotcom.git
cd fernandofrancovalledotcom
```

**1) Subir infra local (Postgres + Redis + Mailhog):**

```bash
cd backend && make docker-up
```

**2) Rodar a API:**

```bash
cd backend && cp .env.example .env   # preencher secrets
make migrate
make run                              # http://localhost:8080
```

**3) Rodar o frontend (em outro terminal):**

```bash
cd frontend && npm install
npm run dev                           # http://localhost:3000
```

Pronto — o frontend já fala com a API local via `NEXT_PUBLIC_API_BASE_URL=http://localhost:8080`. Se essa variável estiver vazia, o frontend roda em **modo mock** (sem backend, dados em memória).

---

## Subprojetos

### Frontend — Next.js 16 + Tailwind 4 + Vitest

> **Pasta:** `frontend/` · **Detalhes:** [`frontend/CLAUDE.md`](./frontend/CLAUDE.md)

Blog técnico + plataforma de aprendizagem **100% estático** (`output: "export"`), servido pelo Hostinger.

**Highlights:**

- **96 rotas pré-renderizadas** (8 hubs + 66 trilhas + transacionais).
- **Component library:** `@base-ui/react` (acessível via render props — *não* Radix/`asChild`).
- **Gamificação client-side completa** em `src/lib/engine.ts` (~696 linhas, mutations puras).
- **Persistência híbrida:** `localStorage` (compactado com `lz-string`) + fallback `IndexedDB` (`idb`).
- **Validação Zod** em todo input externo (URL params, importação, localStorage legacy).
- **DOMPurify** para sanitização de HTML em quizzes/artigos.
- **Code playground interativo** com Pyodide + esbuild-wasm.
- **Command palette** (Cmd/Ctrl+K) global.
- **Sentry** para erros + performance, **OG images** geradas via Satori.

**Páginas principais:**

| Rota               | O que faz                                               |
| ------------------ | ------------------------------------------------------- |
| `/`                | Hero + grid de hubs + últimas trilhas + portal de news  |
| `/<hub>`           | Página de hub agrupando trilhas (8 hubs)                |
| `/<trilha>`        | Listagem de artigos da trilha                           |
| `/aprenda/<slug>`  | Artigo + TOC + quiz + concessão de XP                   |
| `/progresso`       | Dashboard: XP, level, badges, trilhas em andamento      |
| `/revisar`         | Fila SRS (SM-2) com cards gerados pelos quizzes         |
| `/simulados`       | Catálogo + runner + paywall + resultado + certificado   |
| `/preferencias`    | Perfil + export LGPD + soft-delete de conta             |
| `/verificar`       | Lookup público de certificado por hash SHA-256          |
| `/playlists` · `/roadmaps` · `/mapa` · `/cheatsheets` · `/news` | Conteúdo curado |

**Scripts:**

```bash
npm run dev            # dev server :3000 (Turbopack)
npm test               # unit + integration + security (Vitest)
npm run test:coverage  # cobertura com thresholds
npm run e2e            # Playwright (chromium serial)
npm run build          # build estático → out/
npm run generate-og    # gera OG images via Satori
```

---

### Backend — Go 1.25 + Chi + Postgres + Redis

> **Pasta:** `backend/` · **Detalhes:** [`backend/CLAUDE.md`](./backend/CLAUDE.md) · [`backend/api/openapi.yaml`](./backend/api/openapi.yaml)

API REST + workers organizada em **arquitetura hexagonal/DDD** estrita: `domain/` puro (sem I/O), `application/` orquestra ports, `infrastructure/` traz adapters (Postgres, Redis, Stripe, Resend, Twilio, Anthropic).

**Bounded contexts:** `identity`, `simulado`, `certificate`, `billing`, `progress`, `leaderboard`, `tutor`, `curriculum`, `referral`, `audit`.

**Highlights:**

- **39 endpoints REST** versionados em `/api/v1/`.
- **48 migrations** versionadas (`golang-migrate`).
- **Auth magic-link email + SMS** (verificação 2-step), JWT access + refresh com rotação obrigatória.
- **Anti-replay** em magic tokens via Redis `GETDEL` atômico.
- **Race-free `StartAttempt`** via `UNIQUE (user_id, simulado_id, status)`.
- **Webhook Stripe idempotente** (tabela `stripe_events`).
- **Tutor IA** com `anthropic-sdk-go` v1.37 + prompt caching, rate-limit por plano (60/min free, 300/dia pro).
- **Audit trail** assíncrono (writes não bloqueiam request).
- **Server-authoritative scoring** — o cliente nunca calcula nota.
- **OpenTelemetry** (OTLP gRPC) e métricas Prometheus em `/metrics`.

**Estrutura:**

```
backend/
├── cmd/api/                   composition root
├── internal/
│   ├── domain/                lógica pura (User, Attempt, Score, Certificate...)
│   ├── application/           use cases (RequestMagicLink, FinishAttempt...)
│   ├── infrastructure/        Postgres, Redis, Stripe, Resend, Twilio, Anthropic
│   ├── interfaces/http/       handlers, middleware, router (Chi)
│   ├── platform/              logger (slog), telemetry (OTel)
│   └── config/                12-factor, fail-fast
├── migrations/                48 SQL files
├── test/{contract,integration,security,e2e,load}/
├── deployments/               Dockerfile multi-stage + docker-compose + nginx
└── docs/                      ARCHITECTURE.md, RUNBOOK.md, TESTING.md, SECURITY.md
```

**Scripts (`make`):**

```bash
make run                # go run ./cmd/api
make run-watch          # hot reload (air)
make test-unit          # domain + application (sem Docker)
make test-contract      # HTTP contracts via httptest
make test-integration   # Postgres + Redis reais (testcontainers-go)
make test-security      # CORS, JWT tampering, IDOR, timing
make lint               # golangci-lint
make migrate            # aplica pending migrations
make docker-up          # sobe postgres + redis + mailhog locais
```

---

### Video Pipeline — Remotion + Playwright

> **Pasta:** `video-pipeline/` · **Detalhes:** [`video-pipeline/docs/`](./video-pipeline/docs/)

Pipeline de geração de **vídeos de marketing** (hero videos para landing + shorts para redes sociais) combinando **Playwright** (grava beats reais de navegação) com **Remotion** (overlay React por cima do recording).

**4 variantes** por vídeo: horizontal (16:9), vertical (9:16), com mockup de phone e mockup de desktop.

**Documentado em 7 fases** (de discovery de USP a entrega de 8 hero videos), uma decisão por reunião.

**Scripts:**

```bash
npm run preview      # Remotion studio (editor visual)
npm run record-all   # grava todas as variantes via Playwright
npm run render-all   # renderiza todos os vídeos
npm run pipeline     # record + render
```

---

### Draw.io Tools — validador iterativo de diagramas AWS

> **Pasta:** `drawio-tools/`

Pipeline de **scoring numérico (0–100)** + **auto-fix** para diagramas AWS em `.drawio`. Itera em loop fechado até atingir o threshold ou esgotar tentativas.

**Rubrica:** 7 dimensões (labels, ícones, agrupamento, arestas, cores, opacidade, completude arquitetural). Cada issue recebe `fix_type` (`AUTO`, `GENERATE`, `ALERT`) e o orquestrador `drawio-iter.sh` aplica fixes seguros sem remover conteúdo.

| Versão | Score XML | Score visual |
| ------ | --------- | ------------ |
| v0     | 77        | 58           |
| v4     | 100       | 93           |

---

## API REST

**Base:** `/api/v1/` · **Contrato completo:** [`backend/api/openapi.yaml`](./backend/api/openapi.yaml)

### Autenticação

| Método | Path                          | Descrição                                  |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/auth/request-token`         | Solicita magic link (rate-limited)         |
| POST   | `/auth/verify`                | Valida código SMS (6 dígitos)              |
| POST   | `/auth/refresh`               | Rotação de refresh token                   |
| POST   | `/auth/logout` · `/logout-all` | Revoga sessão (atual ou todas)             |

### Perfil & LGPD

| Método | Path                  | Descrição                                       |
| ------ | --------------------- | ----------------------------------------------- |
| GET    | `/me`                 | Perfil do usuário                               |
| PATCH  | `/me`                 | Atualiza nome/telefone                          |
| DELETE | `/me`                 | Soft-delete + export assíncrono (LGPD art. 18)  |
| GET    | `/me/export`          | Export JSON de todos os dados (LGPD art. 20)    |
| GET    | `/me/stats`           | XP, level, streak, badges                       |

### Simulados

| Método | Path                                  | Descrição                       |
| ------ | ------------------------------------- | ------------------------------- |
| GET    | `/simulados` · `/simulados/{id}`      | Catálogo / detalhe              |
| POST   | `/simulados/{id}/attempts`            | Inicia tentativa (race-free)    |
| GET    | `/simulados/{id}/attempts/active`     | Retoma tentativa em andamento   |
| POST   | `/attempts/{id}/answers`              | Responde questão                |
| POST   | `/attempts/{id}/flags/{qid}`          | Marca questão p/ revisão        |
| POST   | `/attempts/{id}/finish`               | Finaliza + emite certificado    |

### Currículo · Progresso · Tutor · Billing · Leaderboard · Eventos · Admin

> Ver tabela completa no [relatório de auditoria](./CLAUDE.md) ou no OpenAPI. Resumo: 39 endpoints cobrindo curriculum read/search, progress sync (LWW), tutor IA com prompt caching, Stripe checkout + webhook idempotente, leaderboard semanal, ingestão analytics fire-and-forget, painéis admin com audit log.

**Body limits:** `auth=10KB`, `profile=64KB`, `answers=256KB`, `progress=512KB`.
**Rate-limits (Redis):** auth 20/min, tutor 60/min (free) · 300/dia (pro), cert verify 120/min.

---

## Gamificação

Implementada inteiramente em `frontend/src/lib/engine.ts` com sincronização opcional via backend (`/progress`).

| Sistema           | Como funciona                                                                          |
| ----------------- | -------------------------------------------------------------------------------------- |
| **XP & Levels**   | 70% leitura + 30% quiz. 7 níveis: Curioso → Aprendiz → Praticante → ... → Mestre.       |
| **Streak**        | Contador diário. Ganha 1 freeze a cada 7 dias (cap 2). Auto-consumido ao quebrar.       |
| **Badges**        | 30+ badges em 3 grupos (`MODULE`, `REVIEW`, `QUIZ`). `awardBadge()` é idempotente.       |
| **SRS**           | SM-2 simplificado. Cards criados automaticamente no quiz, revisados em `/revisar`.       |
| **Daily Challenge** | 1 card aleatório por dia com **3× XP**.                                                |
| **Referral**      | Código com whitelist regex `[a-z0-9]{3,32}`. Bônus para referrer e referido.            |
| **Leaderboard**   | Ranking semanal (week_start = segunda UTC). PK composta `(user_id, week_start)`.        |
| **Certificados**  | SHA-256 truncado (32 hex). Lookup público em `/verificar` sem auth.                     |

---

## Testes & qualidade

**504 testes** distribuídos em 4 categorias e 5 frameworks:

| Camada              | Quantidade | Stack             | Roda em CI       |
| ------------------- | ---------- | ----------------- | ---------------- |
| Frontend unit       | ~150       | Vitest + happy-dom | sempre          |
| Frontend integration| ~80        | Vitest             | sempre           |
| Frontend security   | ~40        | Vitest             | sempre           |
| Frontend E2E        | ~40        | Playwright         | sob demanda      |
| Backend unit        | ~25        | `testing` + testify | sempre           |
| Backend contract    | ~8         | `httptest`          | sempre           |
| Backend integration | ~5         | testcontainers-go   | sempre (CI tem Postgres+Redis services) |
| Backend security    | ~5         | `testing`           | sempre           |

**Testes de segurança** cobrem: XSS em parâmetros (`?ref=`), prototype pollution, IDOR, JWT tampering, timing attacks, Unicode confusables, CSP, CORS.

**Comandos de validação:**

```bash
# Frontend
cd frontend && npx tsc --noEmit && npm test && npm run build

# Backend
cd backend && go build ./... && make lint && make test-unit && make test-contract
```

**Pre-commit hook** (`.husky/pre-commit`) bloqueia commit se qualquer dessas etapas falhar.

---

## CI/CD & Deploy

3 workflows GitHub Actions em `.github/workflows/`:

### `ci.yml` — Frontend + Backend

Roda em todo `push main` e `pull_request → main` com **concurrency cancel-in-progress**:

- **Frontend:** Node 20 → `npm ci` → ESLint → `tsc` → Vitest → `npm run build` → upload `out/` (7d).
- **Backend:** Go 1.25 + Postgres 16 + Redis 7 (services) → `go build` → `golangci-lint` → migrations → `make test-unit` → `make test-contract` → coverage → upload HTML (14d).

### `deploy.yml` — Backend (VPS) + Frontend (Hostinger)

Disparado quando o CI passa em `main`. Gated por `vars.DEPLOY_ENABLED=true`.

- **Build & Push:** Docker multi-stage (`golang:1.25` → `distroless/static:nonroot`) → `ghcr.io/feh-franc0/ffv-api:sha-<hash>`.
- **Deploy backend:** SCP + SSH para VPS → `/opt/ffv/bin/deploy.sh` aplica migrations, faz health-check e **rollback automático** em caso de falha.
- **Deploy frontend:** `npm run build` (com `NEXT_PUBLIC_API_BASE_URL` injetado) → upload incremental via FTP no Hostinger.

### `security.yml` — varredura semanal + por PR

- **Backend:** `gosec` (SARIF → GitHub Code Scanning) + `govulncheck` (bloqueia se vulnerabilidade real é alcançável).
- **Frontend:** `npm audit --audit-level=high`.

### Dependabot

Atualizações **semanais** (segunda 04:00 UTC) em 4 ecossistemas: `gomod`, `npm`, `github-actions`, `docker`. PRs agrupados por categoria, sem auto-merge.

---

## Segurança

- **STRIDE threat model** documentado em [`backend/docs/SECURITY.md`](./backend/docs/SECURITY.md).
- **OWASP top 10** coberto: input validation com Zod (frontend) e structs+validators (backend); proteção XSS via DOMPurify; SQL injection prevenida por `pgx` parametrizado; CSRF via SameSite + tokens.
- **Rate-limiting Redis-backed** em rotas sensíveis.
- **JWT rotação obrigatória** + revogação granular (`/logout-all` invalida todos os refresh tokens).
- **Body limits por rota** (anti-DoS).
- **Magic tokens anti-replay** via `GETDEL` atômico no Redis.
- **Webhook Stripe idempotente** (tabela `stripe_events`).
- **Soft-delete + export LGPD** assíncronos.
- **Distroless container** (sem shell, non-root) + nginx com TLS.
- **Pre-commit hooks** + `gosec` + `govulncheck` + `npm audit` em CI.

---

## Observabilidade

- **Logs estruturados:** `slog` JSON em produção, texto em dev. Request ID propagado via middleware.
- **Métricas Prometheus** em `/metrics` (latência, status code, in-flight, custom).
- **Distributed tracing:** OpenTelemetry com export OTLP gRPC (vazio = noop).
- **Health checks:** `/healthz` (liveness) e `/readyz` (readiness com checks Postgres + Redis).
- **Sentry** no frontend para erros + performance + replays.

---

## Documentação adicional

| Arquivo                                                          | O que cobre                                                                                |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| [`CLAUDE.md`](./CLAUDE.md)                                       | Overview do monorepo (canônico para agentes/devs novos)                                    |
| [`frontend/CLAUDE.md`](./frontend/CLAUDE.md)                     | Arquitetura editorial, componentes, gamificação, gotchas                                   |
| [`backend/CLAUDE.md`](./backend/CLAUDE.md)                       | DDD, ports, invariantes, deploy                                                            |
| [`backend/docs/ARCHITECTURE.md`](./backend/docs/ARCHITECTURE.md) | Camadas DDD, fluxos críticos, decisões                                                     |
| [`backend/docs/RUNBOOK.md`](./backend/docs/RUNBOOK.md)           | Setup local, migrations em produção, troubleshooting                                       |
| [`backend/docs/TESTING.md`](./backend/docs/TESTING.md)           | Pirâmide de testes, exemplos                                                               |
| [`backend/docs/SECURITY.md`](./backend/docs/SECURITY.md)         | STRIDE threat model, controls, checklist                                                   |
| [`backend/api/openapi.yaml`](./backend/api/openapi.yaml)         | Contrato OpenAPI 3.1 (todas as rotas, schemas, erros)                                       |
| [`docs/CI.md`](./docs/CI.md)                                     | Detalhes dos workflows e troubleshooting de CI                                              |
| [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md)                     | Próximas features do backend                                                                 |
| [`CURRICULUM_MASTER_PLAN.md`](./CURRICULUM_MASTER_PLAN.md)       | Roadmap editorial das 66 trilhas                                                             |
| [`BRIEFING_CURRICULUM_V2.md`](./BRIEFING_CURRICULUM_V2.md)       | DNA editorial, posicionamento, target                                                        |
| [`CHANGELOG_CURRICULUM_V2.md`](./CHANGELOG_CURRICULUM_V2.md)     | Histórico de adições ao currículo                                                            |
| [`WALKTHROUGH.md`](./WALKTHROUGH.md)                             | Setup + deploy passo a passo (maintainer)                                                    |
| [`MELHORIAS.md`](./MELHORIAS.md)                                 | Backlog priorizado de UX/infra                                                               |

---

## Roadmap

**Curto prazo (em andamento):**

- Ativar `DEPLOY_ENABLED` após finalizar provisionamento da VPS.
- Tutor IA: trocar mock do frontend por chamada real ao backend (`POST /tutor/ask`).
- Implementar painel de leaderboard no frontend (backend já expõe).

**Médio prazo (ver [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md)):**

- Webhooks externos (analytics, eventos para CRM).
- Dashboard administrativo de métricas editoriais.
- Integração com calendário de revisão SRS via push notifications (PWA).

**Longo prazo:**

- Internacionalização (atualmente 100% pt-BR).
- App mobile nativo (compartilhando o engine de gamificação).
- Marketplace de simulados de terceiros.

---

## Contribuindo

Este é um projeto pessoal mantido por [@feh-franc0](https://github.com/feh-franc0), mas issues e PRs são bem-vindos.

**Padrões:**

- Branches: `feat/`, `fix/`, `chore/`, `docs/` + descrição curta em kebab-case.
- Commits: imperativo curto na primeira linha (`fix: corrige race em StartAttempt`).
- Antes de abrir PR: rode `npm test` e `make test-unit` (o pre-commit hook já força isso).
- Sem comentários óbvios — código deve se explicar; comente apenas o **porquê** não-óbvio.
- Não introduza dependências sem justificativa (medir bundle/binary impact).

---

## Autor & licença

**Fernando Franco Valle** — desenvolvedor sênior, focado em internals e pedagogia técnica séria.

- **Email:** fernandofv1110@gmail.com
- **Site:** [fernandofrancovalle.com](https://fernandofrancovalle.com)
- **GitHub:** [@feh-franc0](https://github.com/feh-franc0)

> Este repositório ainda não possui licença pública declarada. Todos os direitos reservados até a inclusão de um arquivo `LICENSE`. Para uso, contato direto pelo email acima.

---

<div align="center">

Construído com cuidado em **Next.js**, **Go** e **PostgreSQL** · CI verde, testes falando a verdade.

</div>
