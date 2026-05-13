# 🏗️ ARCHITECTURE BLUEPRINT — FFV Academy

> **Documento de referência arquitetural** mostrando estado **atual** vs estado **alvo** após migração CMS-driven.
>
> Fontes da verdade:
> - [`MIGRATION_PLAN_CONTENT_TO_DB.md`](./MIGRATION_PLAN_CONTENT_TO_DB.md) — plano executivo (10 sprints, checkboxes)
> - [`BACKLOG.md`](./BACKLOG.md) — pendências do humano
> - Este documento — **estrutura técnica de pastas + banco**

| Campo | Valor |
|---|---|
| Versão | 1.0 |
| Data | 2026-05-13 |
| Owner | Fernando Franco |
| Status | Aprovação pendente para Sprint 1 |

---

# 📂 PARTE 1 — Estrutura de pastas

## 1.1 Backend (estado atual)

```
backend/
├── cmd/
│   └── api/                        ← único binário hoje
│       └── main.go
│
├── internal/
│   ├── application/                ← use cases (1 por bounded context)
│   │   ├── billing/
│   │   ├── certificate/
│   │   ├── curriculum/             ← já existe (operações em articles)
│   │   ├── event/
│   │   ├── identity/
│   │   ├── leaderboard/
│   │   ├── progress/
│   │   ├── referral/
│   │   ├── simulado/
│   │   └── tutor/
│   │
│   ├── config/                     ← envconfig (12-factor)
│   ├── domain/
│   │   ├── audit/
│   │   ├── billing/
│   │   ├── certificate/
│   │   ├── curriculum/             ← já existe (Article basico)
│   │   ├── identity/
│   │   ├── leaderboard/
│   │   ├── progress/
│   │   ├── referral/
│   │   ├── shared/
│   │   ├── simulado/
│   │   └── tutor/
│   │
│   ├── infrastructure/
│   │   ├── ai/
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── catalog/
│   │   ├── email/
│   │   ├── payment/
│   │   ├── persistence/
│   │   │   ├── postgres/
│   │   │   │   ├── attempt_repo.go
│   │   │   │   ├── audit_log_repo.go
│   │   │   │   ├── circuit_breaker.go
│   │   │   │   ├── curriculum_repo.go      ← já existe
│   │   │   │   ├── db.go
│   │   │   │   ├── export_adapters.go
│   │   │   │   ├── other_repos.go
│   │   │   │   ├── queries/
│   │   │   │   ├── question_report_repo.go
│   │   │   │   └── user_repo.go
│   │   │   └── redis/
│   │   └── sms/
│   │
│   ├── interfaces/
│   │   └── http/
│   │       ├── handlers/
│   │       │   ├── admin_handler.go
│   │       │   ├── auth_handler.go
│   │       │   ├── billing_handler.go
│   │       │   ├── certificate_handler.go
│   │       │   ├── curriculum_handler.go   ← já existe
│   │       │   ├── ...
│   │       │   └── stats_handler.go
│   │       ├── httputil/
│   │       ├── middleware/
│   │       ├── router.go
│   │       └── server.go
│   │
│   └── platform/
│       ├── logger/
│       └── telemetry/
│
├── migrations/                     ← 25 migrations atuais (000001-000025)
└── test/
    ├── contract/
    ├── integration/
    ├── security/
    └── load/
```

## 1.2 Backend (estado alvo após Sprint 1-10)

Mudanças marcadas com `← NEW` ou `← EXTENDER`:

```
backend/
├── cmd/
│   ├── api/                        ← já existe
│   └── importer/                   ← NEW (Sprint 1)
│       └── main.go                 ← lê seeds JSON → UPSERT no DB
│
├── internal/
│   ├── application/
│   │   ├── curriculum/             ← EXTENDER (Sprint 1-6)
│   │   │   ├── get_article.go      ← NEW
│   │   │   ├── list_trails.go      ← NEW
│   │   │   ├── list_hubs.go        ← NEW
│   │   │   ├── create_module.go    ← NEW (admin, Sprint 5)
│   │   │   ├── update_blocks.go    ← NEW (admin)
│   │   │   ├── publish_module.go   ← NEW
│   │   │   └── revert_module.go    ← NEW (rollback de revisões)
│   │   ├── social/                 ← NEW (Sprint posterior — schema só, sem use cases agora)
│   │   └── moderation/             ← NEW (futuro)
│   │
│   ├── domain/
│   │   ├── curriculum/             ← EXTENDER (Sprint 1)
│   │   │   ├── article.go          ← EXTENDER (adicionar trail_id, status, etc)
│   │   │   ├── hub.go              ← NEW
│   │   │   ├── trail.go            ← NEW
│   │   │   ├── block.go            ← NEW
│   │   │   ├── block_types.go      ← NEW (15 structs Go validados)
│   │   │   ├── revision.go         ← NEW
│   │   │   └── repository.go       ← EXTENDER (interface ports)
│   │   ├── social/                 ← NEW dir, SÓ schema agora (Sprint 1)
│   │   │   ├── comment.go          ← struct definida, sem use case ainda
│   │   │   ├── rating.go
│   │   │   ├── bookmark.go
│   │   │   ├── enrollment.go
│   │   │   └── repository.go       ← interface, implementação só quando ativar
│   │   └── moderation/             ← NEW dir
│   │       └── content_report.go
│   │
│   ├── infrastructure/
│   │   └── persistence/postgres/
│   │       ├── curriculum_repo.go  ← EXTENDER (Sprint 1)
│   │       ├── block_repo.go       ← NEW (CTE recursivo + transações)
│   │       ├── hub_repo.go         ← NEW
│   │       ├── trail_repo.go       ← NEW
│   │       ├── revision_repo.go    ← NEW
│   │       └── ...
│   │
│   └── interfaces/
│       └── http/handlers/
│           ├── curriculum_handler.go        ← EXTENDER (GET retorna blocks)
│           ├── admin_curriculum_handler.go  ← NEW (Sprint 5)
│           └── ...
│
├── migrations/                     ← +11 NEW (000026 a 000036)
│   ├── 000001-000025...            ← já existem
│   ├── 000026_create_hubs.up.sql
│   ├── 000027_create_trails.up.sql
│   ├── 000028_extend_articles.up.sql
│   ├── 000029_create_module_blocks.up.sql
│   ├── 000030_create_module_revisions.up.sql
│   ├── 000031_create_comments.up.sql          ← preparado, sem handler
│   ├── 000032_create_comment_votes.up.sql
│   ├── 000033_create_article_ratings.up.sql
│   ├── 000034_create_article_bookmarks.up.sql
│   ├── 000035_create_trail_enrollments.up.sql
│   └── 000036_create_content_reports.up.sql
```

## 1.3 Frontend (estado atual)

```
frontend/
├── public/
├── src/
│   ├── app/
│   │   ├── aprenda/                ← 915 PASTAS, uma por módulo
│   │   │   ├── o-que-e-ia/page.tsx
│   │   │   ├── rag-fundamentos/page.tsx
│   │   │   └── ... (913 outros)
│   │   ├── ia/page.tsx             ← hub
│   │   ├── aws/page.tsx            ← hub
│   │   ├── explorar/page.tsx
│   │   ├── ranking/page.tsx
│   │   ├── progresso/page.tsx
│   │   └── ...
│   ├── components/
│   │   ├── article/
│   │   │   ├── primitives.tsx      ← Section, Callout, CodeBlock, FlowDiagram...
│   │   │   ├── ArticleToc.tsx
│   │   │   ├── ModuleLayout.tsx
│   │   │   ├── primitives.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   ├── home/
│   │   ├── GameHUD.tsx
│   │   └── ...
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   │   ├── auth.ts
│   │   ├── curriculum.ts           ← SINGLE SOURCE OF TRUTH (5000 linhas)
│   │   ├── engine.ts
│   │   ├── analytics.ts
│   │   └── ...
│   ├── tests/
│   └── types/
└── e2e/
```

## 1.4 Frontend (estado alvo após Sprint 1-10)

```
frontend/
├── src/
│   ├── app/
│   │   ├── aprenda/
│   │   │   └── [slug]/page.tsx     ← SUBSTITUI 915 page.tsx (Sprint 3)
│   │   │
│   │   ├── admin/                  ← NEW (Sprint 5-6)
│   │   │   ├── layout.tsx          ← guard admin role
│   │   │   ├── articles/
│   │   │   │   ├── page.tsx        ← lista módulos
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [slug]/edit/page.tsx
│   │   │   ├── trails/
│   │   │   ├── hubs/
│   │   │   ├── blocks/page.tsx     ← storybook visual
│   │   │   └── metrics/page.tsx    ← analytics admin
│   │   │
│   │   ├── ia/page.tsx             ← EXTENDER (busca trails do DB)
│   │   ├── aws/page.tsx            ← idem
│   │   └── ...
│   │
│   ├── components/
│   │   ├── article/
│   │   │   ├── primitives.tsx      ← INTOCADO (sagrado)
│   │   │   ├── BlockRenderer.tsx   ← NEW (Sprint 1) — coração da renderização
│   │   │   ├── LegacyArticleFallback.tsx  ← NEW (Sprint 3, durante migração)
│   │   │   ├── blocks/
│   │   │   │   ├── schemas.ts      ← NEW (Zod schemas)
│   │   │   │   └── types.ts        ← NEW (TypeScript types)
│   │   │   ├── ModuleLayout.tsx    ← já existe
│   │   │   └── ...
│   │   │
│   │   └── admin/                  ← NEW (Sprint 5)
│   │       ├── BlockEditor.tsx     ← editor por tipo de bloco
│   │       ├── BlockList.tsx       ← drag-drop reorder
│   │       ├── PreviewPane.tsx     ← preview side-by-side
│   │       └── RevisionHistory.tsx
│   │
│   ├── lib/
│   │   ├── curriculum.ts           ← reduzir (Sprint 9: remover dados, manter types)
│   │   ├── curriculum-api.ts       ← NEW (Sprint 1) — fetchArticle, fetchTrails
│   │   └── ...
│   │
│   └── docs/
│       └── adr/
│           ├── 0001-adr.md         ← já existe
│           ├── 0002-exclude-rsc-payloads-from-ftp-deploy.md    ← já existe
│           └── 0003-content-migration-to-db.md  ← NEW (criar quando começar Sprint 1)
│
└── e2e/
    └── cms.spec.ts                 ← NEW (Sprint 1) — testes E2E do conteúdo dinâmico
```

## 1.5 Repo root

```
fernandofrancovalledotcom/                  ← raiz
├── ARCHITECTURE_BLUEPRINT.md       ← este arquivo
├── BACKEND_ROADMAP.md              ← já existe
├── BACKLOG.md                      ← já existe
├── BRIEFING_CURRICULUM_V2.md       ← já existe (histórico)
├── CHANGELOG_PLATFORM_2026-05.md   ← já existe
├── CLAUDE.md                       ← já existe
├── CURRICULUM_MASTER_PLAN.md       ← já existe
├── MELHORIAS.md                    ← já existe
├── MIGRATION_PLAN_CONTENT_TO_DB.md ← já existe
├── README.md
│
├── backend/                        ← ver 1.1/1.2
├── frontend/                       ← ver 1.3/1.4
├── mcp/                            ← MCP server (Sprint 6 estender)
├── video-pipeline/
├── ai-codebase-toolkit/
├── drawio-tools/
│
├── scripts/                        ← shell scripts existentes
│   ├── check-deploy-status.sh
│   ├── deploy.sh
│   ├── install-git-hooks.sh
│   ├── pre-push-validate.sh
│   ├── smoke-test-frontend.sh
│   ├── vps-setup.sh
│   │
│   ├── seeds/                      ← NEW (Sprint 1) — JSONs commitados no repo
│   │   ├── hubs.json
│   │   ├── trails.json
│   │   └── articles/
│   │       ├── teste-cms.json      ← módulo de teste Sprint 1
│   │       ├── rag-fundamentos.json
│   │       └── ... (~915 arquivos)
│   │
│   └── import-blocks/              ← NEW (Sprint 2) — parser Node TSX→JSON
│       ├── package.json
│       ├── parser.ts
│       ├── transforms/
│       │   ├── section.ts
│       │   ├── callout.ts
│       │   ├── code_block.ts
│       │   └── ... (15 transforms)
│       ├── manual_review.ts
│       └── README.md
│
└── docs/
    ├── architecture/               ← já existe
    ├── BRANCH_PROTECTION.md
    └── CI.md
```

---

# 🗄️ PARTE 2 — Estrutura de banco de dados

## 2.1 Tabelas ATUAIS (25 migrations)

| # | Migration | Tabela | Conteúdo | Status |
|---|---|---|---|---|
| 001 | create_users | `users` | Email, name, phone, role, paid_products | ✅ ativa |
| 002 | create_user_products | `user_products` | N:N user × product | ✅ ativa |
| 003 | create_refresh_tokens | `refresh_tokens` | Hash, revoked_at | ✅ ativa |
| 004 | create_simulado_attempts | `simulado_attempts` | JSONB answers, score | ✅ ativa |
| 005 | create_progress_snapshots | `progress_snapshots` | JSONB state per user | ✅ ativa |
| 006 | create_certificates | `certificates` | Hash SHA-256, verifiable | ✅ ativa |
| 007 | create_purchases | `purchases` | Stripe session, status | ✅ ativa |
| 008 | create_stripe_events | `stripe_events` | Idempotência webhook | ✅ ativa |
| 009 | create_referrals | `referrals` | Referrer → referred | ✅ ativa |
| 010 | create_leaderboard | `leaderboard` | XP por week | ✅ ativa |
| 011 | create_analytics_events | `analytics_events` | JSONB payload | ✅ ativa |
| 012-15 | fixes/realign | (alterações) | — | ✅ ativa |
| 016 | create_audit_logs | `audit_logs` | HTTP mutations trail | ✅ ativa |
| 017 | create_question_reports | `question_reports` | Report de questões | ✅ ativa |
| 018-22 | fixes/perf | (alterações) | — | ✅ ativa |
| **023** | **add_curriculum** | **`articles`** | **Slug, title, content, category** | ✅ **ativa (vazia)** |
| 024 | phone_unique | (ALTER users) | — | ✅ ativa |
| 025 | remove_google_oauth | (ALTER users) | — | ✅ ativa |

**Tabela `articles` já existe** (criada em migration 023), mas está **vazia** — vamos popular e estender ela.

## 2.2 Tabelas NOVAS (a criar — migrations 026-036)

### Bloco A — Currículo (Sprint 1, ATIVO desde já)

| # | Migration | Tabela | Propósito |
|---|---|---|---|
| 026 | create_hubs | `hubs` | 8 hubs canônicos (IA, AWS, Engenharia...) |
| 027 | create_trails | `trails` | 66 trilhas (pertencem a 1 hub) |
| 028 | extend_articles | (ALTER `articles`) | Adicionar trail_id, status, xp_reward, difficulty, etc |
| 029 | create_module_blocks | `module_blocks` | Blocos JSON estruturados (15 tipos) |
| 030 | create_module_revisions | `module_revisions` | Histórico de edições + rollback |

### Bloco B — Social (Sprint 1, SCHEMA PRONTO, handlers depois)

| # | Migration | Tabela | Propósito |
|---|---|---|---|
| 031 | create_comments | `comments` | Comentários em article/trail/block |
| 032 | create_comment_votes | `comment_votes` | Upvote/downvote (PK composta) |
| 033 | create_article_ratings | `article_ratings` | Nota 1-5 + feedback opcional |
| 034 | create_article_bookmarks | `article_bookmarks` | Favoritos |
| 035 | create_trail_enrollments | `trail_enrollments` | Quem iniciou cada trilha + onde parou |

### Bloco C — Moderação (Sprint 1, SCHEMA PRONTO, handlers depois)

| # | Migration | Tabela | Propósito |
|---|---|---|---|
| 036 | create_content_reports | `content_reports` | Denúncias de spam/abuso |

## 2.3 ER Diagram completo (estado alvo)

```
┌──────────────────────────────────────────────────────────────────────────┐
│ BLOCO A — CURRÍCULO                                                       │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│    ┌──────────┐                                                           │
│    │   hubs   │  PK: id (TEXT)                                            │
│    │──────────│                                                           │
│    │ id       │ 'ia', 'aws', 'engenharia'                                 │
│    │ name     │                                                           │
│    │ icon     │                                                           │
│    │ color    │                                                           │
│    │ position │                                                           │
│    └────┬─────┘                                                           │
│         │ 1                                                               │
│         │                                                                 │
│         │ N                                                               │
│    ┌────▼─────────┐                                                       │
│    │    trails    │  PK: id (TEXT)                                        │
│    │──────────────│                                                       │
│    │ id           │ 'rag-essential', 'aws-cloud-practitioner'             │
│    │ hub_id       │ FK → hubs                                             │
│    │ name         │                                                       │
│    │ difficulty   │                                                       │
│    │ est_hours    │                                                       │
│    │ position     │                                                       │
│    └──────┬───────┘                                                       │
│           │ 1                                                             │
│           │                                                               │
│           │ N                                                             │
│    ┌──────▼───────────┐                                                   │
│    │    articles      │  PK: slug (TEXT)                                  │
│    │──────────────────│  (existe desde migration 023, estender)           │
│    │ slug             │ 'rag-fundamentos'                                 │
│    │ trail_id         │ FK → trails (NEW)                                 │
│    │ title            │                                                   │
│    │ status           │ 'draft'/'published'/'archived' (NEW)              │
│    │ xp_reward        │ NEW                                               │
│    │ difficulty       │ NEW                                               │
│    │ reading_time_min │ NEW                                               │
│    │ position_in_trail│ NEW                                               │
│    │ published_at     │ NEW                                               │
│    └──────┬───────────┘                                                   │
│           │ 1                                                             │
│           │                                                               │
│           │ N                                                             │
│    ┌──────▼────────────┐                                                  │
│    │  module_blocks    │  PK: id (UUID)                                   │
│    │───────────────────│                                                  │
│    │ id                │                                                  │
│    │ article_slug      │ FK → articles                                    │
│    │ parent_id         │ FK → module_blocks (self, p/ Section→Callout)    │
│    │ position          │ ordem dentro do parent/article                   │
│    │ block_type        │ 'section'/'callout'/'code_block'/...             │
│    │ block_data        │ JSONB (validado por tipo)                        │
│    └───────────────────┘                                                  │
│                                                                           │
│    ┌──────────────────────┐                                               │
│    │  module_revisions    │  PK: id (UUID)                                │
│    │──────────────────────│                                               │
│    │ id                   │                                               │
│    │ article_slug         │ FK → articles                                 │
│    │ revision             │ INT (1,2,3...)                                │
│    │ snapshot             │ JSONB (artigo + blocks completos)             │
│    │ edited_by            │ FK → users                                    │
│    │ edited_at            │                                               │
│    └──────────────────────┘                                               │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ BLOCO B — SOCIAL (schema pronto, handlers em sprint futura)               │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│    ┌──────────────────┐                                                   │
│    │    comments      │  PK: id (UUID)                                    │
│    │──────────────────│                                                   │
│    │ id               │                                                   │
│    │ user_id          │ FK → users                                        │
│    │ target_type      │ 'article'/'trail'/'block'                         │
│    │ target_id        │ slug ou UUID-string (polimórfico)                 │
│    │ parent_id        │ FK → comments (threads/replies)                   │
│    │ content          │ TEXT (limite 4000 chars)                          │
│    │ status           │ 'visible'/'hidden'/'flagged'/'deleted'            │
│    │ edited           │ BOOL                                              │
│    └────────┬─────────┘                                                   │
│             │ 1                                                           │
│             │                                                             │
│             │ N                                                           │
│    ┌────────▼──────────┐                                                  │
│    │  comment_votes    │  PK: (comment_id, user_id)                       │
│    │───────────────────│                                                  │
│    │ comment_id        │ FK → comments                                    │
│    │ user_id           │ FK → users                                       │
│    │ vote              │ SMALLINT (-1 ou +1)                              │
│    └───────────────────┘                                                  │
│                                                                           │
│    ┌─────────────────────┐                                                │
│    │  article_ratings    │  PK: (user_id, article_slug)                   │
│    │─────────────────────│                                                │
│    │ user_id             │ FK → users                                     │
│    │ article_slug        │ FK → articles                                  │
│    │ rating              │ SMALLINT 1-5                                   │
│    │ feedback            │ TEXT opcional                                  │
│    └─────────────────────┘                                                │
│                                                                           │
│    ┌─────────────────────┐                                                │
│    │ article_bookmarks   │  PK: (user_id, article_slug)                   │
│    │─────────────────────│                                                │
│    │ user_id             │ FK → users                                     │
│    │ article_slug        │ FK → articles                                  │
│    │ created_at          │                                                │
│    └─────────────────────┘                                                │
│                                                                           │
│    ┌─────────────────────┐                                                │
│    │ trail_enrollments   │  PK: (user_id, trail_id)                       │
│    │─────────────────────│                                                │
│    │ user_id             │ FK → users                                     │
│    │ trail_id            │ FK → trails                                    │
│    │ started_at          │                                                │
│    │ completed_at        │ NULLABLE                                       │
│    │ last_seen_slug      │ FK → articles (onde parou)                     │
│    └─────────────────────┘                                                │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────┐
│ BLOCO C — MODERAÇÃO (schema pronto, handlers em sprint futura)            │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│    ┌──────────────────────┐                                               │
│    │  content_reports     │  PK: id (UUID)                                │
│    │──────────────────────│                                               │
│    │ id                   │                                               │
│    │ reporter_user_id     │ FK → users                                    │
│    │ target_type          │ 'comment'/'article'/'user'                    │
│    │ target_id            │                                               │
│    │ reason               │ 'spam'/'abuse'/'off-topic'/'plagiarism'/...   │
│    │ description          │ TEXT                                          │
│    │ status               │ 'open'/'reviewed'/'dismissed'/'acted'         │
│    │ resolved_by          │ FK → users (admin)                            │
│    │ resolved_at          │                                               │
│    └──────────────────────┘                                               │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

## 2.4 Convenções de nomes

- **PKs**: `id` (UUID) ou `slug`/`code` (TEXT estável)
- **FKs**: `<tabela_singular>_id` ou `<tabela_singular>_slug`
- **Status enums**: sempre via `CHECK (status IN (...))` no DDL
- **Timestamps**: `created_at`, `updated_at`, `published_at`, `deleted_at` (soft delete onde aplicável)
- **JSONB**: para dados polimórficos (`block_data`, `snapshot`)
- **Cascade**: `ON DELETE CASCADE` quando o filho não faz sentido sem o pai (blocks sem article)
- **Set null**: `ON DELETE SET NULL` quando filho pode existir (article sem trail_id é "draft solto")

## 2.5 Volumes estimados

| Tabela | Linhas estimadas (1 ano) | Crescimento |
|---|---|---|
| hubs | 8 | ~0 |
| trails | 66 → 100 | lento |
| articles | 915 → 500 (após curadoria) | lento |
| module_blocks | ~50k (500 × 100 avg) | médio |
| module_revisions | ~5k | médio |
| comments | 10k+ | alto (depende de tração) |
| comment_votes | 30k+ | alto |
| article_ratings | 5k+ | médio |
| article_bookmarks | 10k+ | médio |
| trail_enrollments | 1k-5k | médio |
| content_reports | <100 | baixo |

**Storage estimado**: ~500MB total no primeiro ano (postgres é eficiente em JSONB).

---

# 🔄 PARTE 3 — Estratégia de migração

## 3.1 Sequenciamento

```
SPRINT 1 (semana 1)
   ↓ migrations 026-036 (todas de uma vez)
   ↓ Go structs + repositories (curriculum block A)
   ↓ Frontend BlockRenderer + 5 tipos básicos
   ↓ Importer Go
   ↓ Módulo teste-cms (prova de conceito)

SPRINT 2-3 (semanas 2-3)
   ↓ +10 tipos de bloco
   ↓ Parser TSX→JSON
   ↓ Rota /aprenda/[slug] dinâmica com fallback legacy
   ↓ 20 módulos piloto migrados

SPRINT 4-7 (semanas 4-7)
   ↓ Migração em massa (50-100 mod/semana)
   ↓ Editor admin /admin/articles
   ↓ MCP tools curriculum_*

SPRINT 8 (semana 8)
   ↓ Curadoria editorial (cortar 30-40%)

SPRINT 9-10 (semanas 9-10)
   ↓ Migrar pra SSR/ISR na VPS
   ↓ Cloudflare CDN
   ↓ Painel admin completo + analytics

[FUTURO — Sprint 11+]
   ↓ Ativar handlers sociais (comments, ratings, bookmarks)
   ↓ Frontend de comentários
   ↓ Notificações
```

## 3.2 Coexistência durante migração

Durante todas as Sprints 3-9, o frontend usa **rota híbrida**:

```tsx
const article = await fetchFromAPI(slug);
return article && article.status === 'published'
  ? <DynamicArticle article={article} />   // novo (DB)
  : <LegacyArticleFallback slug={slug} />; // antigo (TSX)
```

Migra **50-100 módulos por semana**. Nunca quebra produção. Quando todos migrados, deleta o fallback.

## 3.3 Curadoria editorial (Sprint 8 — opção B confirmada)

Decisão tomada: **migrar TODOS primeiro, arquivar depois**.

- Sprints 3-7: tudo vira `status='published'` no DB
- Sprint 8: você revisa módulo a módulo
- Marca como `status='archived'` via admin/SQL os que não se encaixam
- Frontend já filtra `status='published'` na rota dinâmica
- Conteúdo arquivado fica preservado (rollback fácil)

## 3.4 Tabelas sociais (opção A confirmada)

Decisão tomada: **schema pronto, handlers depois**.

- Sprint 1: cria todas as 6 tabelas sociais (comments, votes, ratings, bookmarks, enrollments, reports)
- Sprint 1: cria structs Go em `internal/domain/social/` SEM use cases
- Sprint 1: SEM frontend para essas features
- Sprint 11+ (futuro): implementar handlers + UI quando decidir ativar

**Vantagem**: zero refatoração quando ativar. Schema já testado em produção.

---

# 📋 PARTE 4 — Mapa de dependências entre tabelas

```
Camada 0 (raiz, sem deps):
  users, hubs

Camada 1 (deps de raiz):
  trails (→ hubs)
  refresh_tokens (→ users)

Camada 2 (deps de trails/users):
  articles (→ trails opcional)
  trail_enrollments (→ users + trails)
  content_reports (→ users)

Camada 3 (deps de articles):
  module_blocks (→ articles, self)
  module_revisions (→ articles + users)
  comments (→ users + targets variados)
  article_ratings (→ users + articles)
  article_bookmarks (→ users + articles)

Camada 4 (deps de comments):
  comment_votes (→ comments + users)
```

**Implicação**: ordem de aplicação das migrations e ordem de seed/import precisa respeitar isso. Hubs antes de Trails, Trails antes de Articles, etc.

---

# 🔚 ESTE DOCUMENTO É VIVO

- Atualizado a cada Sprint conforme a estrutura evolui
- Quando adicionar tabela, atualize seção 2.2 + ER diagram
- Quando adicionar pasta, atualize seção 1.2/1.4
- Sempre commitar este arquivo junto com mudanças estruturais

| Versão | Data | Mudanças |
|---|---|---|
| 1.0 | 2026-05-13 | Versão inicial — estrutura alvo para Sprint 1-10 |
