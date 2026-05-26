# ARCHITECTURE — FFV Academy

> Doc-mestre de arquitetura. Sucessor de `ARCHITECTURE_BLUEPRINT.md`, `ARCHITECTURE_BASES_MODULAR.md` e `UNIFICATION_PLAN.md`.
> Última atualização: 2026-05-26 · Owner: Fernando Franco

---

## 1. Big picture

```
                ┌────────────────────────────────────────────┐
                │  Cloudflare (CDN + DNS + R2 storage)       │
                └─────────────────┬──────────────────────────┘
                                  │
        ┌─────────────────────────┴─────────────────────────┐
        │                                                   │
┌───────▼────────────┐                          ┌───────────▼──────────┐
│  Next.js 16 (SSR)  │  HTTPS / JSON            │  Go 1.25 API (Chi)   │
│  frontend/         │ ───────────────────────► │  backend/cmd/api     │
│  - App Router      │                          │  - DDD layers        │
│  - KnowledgeBase   │ ◄─── /api/v1/bases/{}/page  - JWT auth          │
│    Home (template) │      /api/v1/articles/{}    - Audit middleware  │
│  - BlockRenderer   │      /api/v1/user/*         - Rate-limit        │
│  - BaseProvider    │      /api/v1/admin/*        - Allowlist admin   │
└────────────────────┘                          └───┬──────────┬───────┘
                                                    │          │
                                              ┌─────▼────┐  ┌──▼─────┐
                                              │ Postgres │  │ Redis  │
                                              │ (source  │  │ cache  │
                                              │ of truth)│  │ + ratelm│
                                              └──────────┘  └────────┘

   Adjacentes:   mcp/ (24 tools sobre o currículo)
                 video-pipeline/ (Remotion 4)
                 cmd/importer (seeds JSON → UPSERT no DB)
```

A plataforma roda como monolito modular: front Next.js servido como SSR/ISR, API Go por trás com Postgres + Redis. O front consome um descritor por base (`/api/v1/bases/{slug}/page`) e renderiza um template universal (`KnowledgeBaseHome`) — só cores e dados mudam por base. Arquivos de usuário ficam em Cloudflare R2 (S3-compatible).

---

## 2. Stack por camada

| Camada | Tech | Responsabilidade |
|---|---|---|
| Front web | Next.js 16 + TypeScript + Tailwind | SSR/ISR de páginas, App Router, gamificação cliente, PWA |
| Renderização de conteúdo | `BlockRenderer.tsx` + Zod schemas | Renderiza 15 tipos de bloco vindos do DB |
| Estado de UI por base | `BaseProvider` (theme/nav/copy/trail) | Contexto único derivado de `BaseConfig` |
| API REST | Go 1.25 + Chi + DDD (domain/application/interfaces/infrastructure) | Auth, currículo, leaderboard, certificados, billing |
| Persistência | Postgres 16 (JSONB) + migrations versionadas | Source-of-truth de currículo, usuários, social |
| Cache / fila | Redis | Sessões, rate-limit, cache de leaderboard |
| Storage de arquivos | Cloudflare R2 (S3 SDK v2) | Anexos de StudyRequest, uploads — zero egress fee |
| Auth | JWT (HMAC-SHA256) + magic-link via email | Role no DB + allowlist em env var |
| MCP server | Node 20 + MCP SDK | Expõe 24 tools do currículo ao Claude |
| Vídeos marketing | TypeScript + Remotion 4 + Playwright | Pipeline de geração + validação visual |
| Observabilidade | Audit logs (Postgres), structured logging | Trilha de mutations HTTP |

---

## 3. Modelo de dados

Hierarquia: **base → hub → trail → module (article) → block**.

```
users ──┐
        ├─► user_products, refresh_tokens, certificates, progress_snapshots
        ├─► user_preferences (interested_bases, home_base, frequency, materials)
        └─► user_base_engagement_events ──► rollup (matview)

bases (slug PK)              ◄─ source-of-truth pós-Fase 3 (CMS-driven)
  ├─ theme/slogans/microcopy/nav/footer/features/stats   JSONB
  ├─ hubs/paths/final_cta                                JSONB
  │
  ▼ 1:N
hubs (id PK, base_slug FK)
  │
  ▼ 1:N
trails (id PK, hub_id FK)
  │
  ▼ 1:N
articles (slug PK, trail_id FK)
  │   status: draft|published|archived · xp_reward · difficulty
  │
  ├─► module_blocks (id, parent_id self-FK, position, block_type, block_data JSONB)
  ├─► module_revisions (snapshot JSONB + edited_by/at)
  ├─► comments / article_ratings / article_bookmarks
  └─► trail_enrollments (last_seen_slug)
```

Convenções:
- PK: `id` UUID OU slug/code TEXT estável.
- FK nomeada `<tabela_singular>_id` ou `_slug`.
- Enums via `CHECK (status IN (...))`.
- Soft-delete via `deleted_at` quando aplicável.
- JSONB para polimorfismo (`block_data`, `snapshot`, theme).
- `ON DELETE CASCADE` quando filho não existe sem pai (blocks→article); `SET NULL` em vínculos opcionais (article.trail_id).

15 tipos de bloco canônicos (Section, Callout, CodeBlock, FlowDiagram, ...) — schemas em `frontend/src/components/article/blocks/schemas.ts` espelhados como structs Go em `internal/domain/curriculum/block_types.go`.

---

## 4. Modularização por base

Cada base de conhecimento (`tecnologia`, `medicina-veterinaria`, `carreira`, `comunicacao`, `marketing`, `conteudo`, `empreendedorismo`, `ingles`) é uma **ilha**: o usuário nunca vê chrome, hub, simulado, nav ou link de outra base enquanto está dentro de uma.

### O que é isolado por base

| Elemento | Onde |
|---|---|
| Home da base | `src/app/<slug>/page.tsx` renderiza `KnowledgeBaseHome` |
| Header / nav | `BaseConfig.nav.hubNavItems` |
| Footer | `BaseConfig.footer` (`hubLinks`, `contentLinks`, `mobilePrimary`) |
| Mascot / microcopy / slogans / theme | `BaseConfig.{mascot,microcopy,slogans,theme}` |
| Simulados | `BaseConfig.simulados[]` |
| Hubs / trilhas / módulos | Filtrados por base via `lib/bases/<slug>/index.ts` (nunca importa `HUBS` cru) |

### O que continua global

Perfil/preferências, XP/streak/level (gamificação cross-base), marketing (`/`, `/sobre`, `/bases`), dashboards (`/progresso`, `/ranking`, `/revisar`), verificação de certificados.

### Resolver — precedência

`lib/bases/resolver.ts → detectBaseSlug(pathname)`:

1. Match exato com `BaseConfig.basePath` (`/comunicacao` → comunicacao).
2. `/aprenda/<slug>` → `getBaseSlugForModule(slug)` (módulo → trilha → hub → base; fallback `tecnologia`).
3. Href de trilha → `getBaseSlugForTrailHref(path)` derivado do CURRICULUM.
4. Legacy tech prefixes (`/ia`, `/aws`, `/simulados`, `/engenharia`…) → `tecnologia`.
5. Marketing → `null` + `isMarketing=true`.
6. App-global (`/progresso`, `/ranking`, …) → base default + `isAppGlobal=true`.

### Providers no App Router

```
AppChrome
└─ BaseResolver(pathname) → BaseConfig
   └─ BaseProvider
      ├─ BaseThemeProvider   (CSS vars overridden)
      ├─ BaseNavProvider     (hubNavItems, hideGlobalContentNav)
      ├─ BaseCopyProvider    (microcopy, slogans, mascot)
      ├─ UserPreferencesProvider  (SWR /api/v1/user/preferences)
      ├─ TrailContext        (módulos, drawer state, progress)
      └─ EngagementTracker   (fire-and-forget /events)
```

`SiteFooter`, `MobileNav` e `GameHUD` **NÃO têm fallback default** para tecnologia — eles leem só o que o `BaseProvider` ativo injeta (`?? []`). Só `tecnologia` tem `hideGlobalContentNav=false`.

---

## 5. Templates universais de base

> Toda base — atual ou futura gerada via study request — renderiza pelo mesmo `<KnowledgeBaseHome />`. Mudam apenas: cores (CSS vars), conteúdo (`Trail[]`), microcopy, mascot, nav e features ligadas.

### As 14 sections universais (ordem fixa)

| # | Section | Gate (quando aparece) |
|---|---|---|
| 1 | Hero | sempre |
| 2 | OnboardingWizard | logado && !preferences.onboarded |
| 3 | DailyQuestionCard | logado && onboarded && dailyQuestionEnabled |
| 4 | PreferenciasCTA | logado && !onboarded && !wizardVisible |
| 5 | SocialProofBar | sempre |
| 6 | HowItWorks | sempre |
| 7 | ContinueDailyTrilhaQuest | hasProgress |
| 8 | ComecarAqui | !hasProgress (ou `alwaysShowPaths`) |
| 9 | Explorar | hubs ou playlists presentes |
| 10 | Trending | backend retornou trending |
| 11 | HomeRanking | `!base.hideRanking` |
| 12 | ComunidadeAutor | `!base.hideComunidade` |
| 13 | FinalCta | sempre |
| 14 | StreakRepairModal | streak quebrado + XP suficiente (overlay) |

Bases com `gamification: 'off'` suprimem widgets de gamificação via prop. A **ordem é fixa em código** — não há admin drag-drop. Backend só passa dados; front sabe a ordem.

### Checklist ao adicionar base nova

1. Backend: migration SQL + tabela `bases` com `status='live'`, JSONB de theme/nav. Mirror em `buildHardcodedBases()` pro fallback SSR.
2. Frontend `BASE_REGISTRY`: BaseConfig completo (theme, mascot, microcopy, slogans, nav, footer). NUNCA copiar nav de tecnologia.
3. Resolver: `/<base-slug>` → resolve pra essa base.
4. Page: `src/app/<slug>/page.tsx` renderiza `KnowledgeBaseHome`.
5. Isolation tests passam automaticamente ao registrar.

---

## 6. Estado da migração DB-driven

| Fase | Objetivo | Migrations | Status |
|---|---|---|---|
| **Fase 1** | Schema base→hub→trail→module via FK | 000055–000063 | ✅ Concluída |
| **Fase 2** | Importer Go lê `base_slug` do JSON seed (sem switch hardcoded) | — | ✅ Concluída |
| **Fase 3** | `BASE_REGISTRY` frontend gerado de snapshot do DB | — | 🔄 Pendente |
| Fase 3b | Endpoint `/api/v1/bases/{slug}/page` + frontend fetcher | 000048–000049 | ✅ Concluída (Rodada 3 validada) |
| Sprint social | Schemas prontos (comments/votes/ratings/bookmarks/enrollments/reports) | 000031–000036 | ✅ Schema · ❌ Handlers |
| Sprint admin CMS | `/admin/articles`, editor de blocks, revisões | — | 🔄 Em planejamento |

### Coexistência durante migração

Rota híbrida em `/aprenda/[slug]`:

```tsx
const article = await fetchFromAPI(slug);
return article?.status === 'published'
  ? <DynamicArticle article={article} />
  : <LegacyArticleFallback slug={slug} />;
```

Curadoria editorial: migra todos primeiro (`status='published'`), arquiva (`status='archived'`) na curadoria final. Rollback fácil.

---

## 7. Princípios não-negociáveis

1. **Zero dados estáticos de currículo no código.** Slugs de hub/base/trilha/módulo vivem no DB. Nada de switch/case derivando base de slug — `hubs.base_slug` é a FK.
2. **Isolamento de base é regra de domínio.** Componente que renderiza fora de contexto não pode default-ar pra tecnologia. Fallback é `?? []`, nunca `?? HUBS.map(...)`.
3. **Templates universais.** Toda base usa `KnowledgeBaseHome` + 14 sections fixas. Só cores e dados variam.
4. **DB é source-of-truth.** Frontend tem fallback estático (`registry.ts`) só pra SSR resiliente quando API offline. Em produção, dados vêm de Postgres.
5. **Admin tem 3 camadas independentes.** Role no DB + claim JWT + allowlist em env var (`ADMIN_EMAIL_ALLOWLIST`). Comprometer uma sozinha não escala privilégio.
6. **Arquivos de usuário em R2.** Postgres guarda só metadata + `s3://bucket/key`. Nunca BYTEA, nunca disco local em produção.
7. **DDD no backend.** `domain/` (puro) → `application/` (use cases) → `interfaces/http/` (handlers) → `infrastructure/` (repos, adapters). Não importar nada de `infrastructure` em `domain`.
8. **Migrations são append-only e idempotentes.** Nunca editar migration aplicada — criar nova.
9. **Push sempre com `gh run watch`.** O usuário não tira print do GitHub Actions. CI quebrado é incidente prioritário.
10. **Co-Authored-By Claude Opus 4.7 em todo commit.**

---

## 8. Anti-padrões proibidos

- ❌ `switch (slug) { case "ia": return "tecnologia"; ... }` — qualquer derivação de base via switch.
- ❌ `Set` hardcoded de slugs tipo `TECH_HUB_SLUGS` em código novo (existente é candidato a remoção na Fase 3).
- ❌ Hub não-tech resolvendo para `'tecnologia'` no resolver.
- ❌ Footer ou nav de uma base com `href` apontando pra outra base.
- ❌ Importar `HUBS` cru sem filtrar pelo slug da base.
- ❌ Reusar `TECH_PATHS` / `TECH_HUBS` / `TECH_PLAYLISTS` em base não-tech.
- ❌ `/<base-slug>` renderizando `HubPageClient` em vez de `KnowledgeBaseHome`.
- ❌ Endpoint HTTP que mude `users.role` (não existir = não pode ser exploitado).
- ❌ Auto-promoção "primeiro user vira admin" (race-condition).
- ❌ Allowlist de admin hardcoded em código (use env var).
- ❌ Logar JWT inteiro (vaza email).
- ❌ Salvar binários no Postgres (campos BYTEA).
- ❌ Uploads em `/opt/ffv/uploads/` em produção (esse path é só fallback de emergência).
- ❌ Commitar `.env` ou reutilizar tokens R2 entre dev/staging/prod.
- ❌ Push sem `gh run watch`; force push em main; `--amend` em commit já pushed; `--no-verify`.
- ❌ Admin drag-drop de blocks na home da base — ordem das 14 sections é fixa em código.

---

## 9. Pontos de atenção operacionais (mai/2026)

### Componentes sem fallback default (não recriar)

- `SiteFooter`: fallback é `?? []`. O caller (`AppChrome`) injeta do `BaseConfig` ativo.
- `MobileNav` e `GameHUD`: só renderizam itens globais quando `BaseConfig.nav.hideGlobalContentNav === false`. Apenas `tecnologia` tem isso `false`.

### Hardcoded removido (não recriar)

- `hubBaseSlug()` switch em `cmd/importer` — **removido**. Importer agora lê `base_slug` do JSON seed.
- `getBaseChromeForPath` em `AppChrome` — **removido**. Resolver decide via `resolveBaseConfig(pathname)`.

### Hardcoded candidato a remoção (Fase 3)

- `TECH_HUB_SLUGS` em `lib/bases/tecnologia/index.ts` — será substituído por query do DB. Não ampliar nem replicar em outras bases.
- `BASE_REGISTRY` frontend ainda tem dados estáticos de chrome (theme, microcopy) — ok por ora, vira snapshot do DB na Fase 3.

### Pendências conhecidas (low priority)

| Item | Onde | Motivo de adiamento |
|---|---|---|
| `OnboardingModal` só sugere 4 hubs tech | `src/components/OnboardingModal.tsx:11` | Expandir quando houver dados de uso das novas bases |
| `StudyRequestForm` lista só áreas "queued" sem bases live profissionais | `src/components/home/StudyRequestForm.tsx:35-45` | Avaliar com demanda de usuários |
| Módulos das 6 bases novas sem JSONs em `scripts/seeds/articles/` | check-curriculum-seed-drift.mjs | Produção de conteúdo em ondas |

### Testes que travam regressões (NÃO REMOVER)

- `frontend/src/lib/bases/__tests__/isolation.test.ts` — module routing (11), trail URL routing (10), `selectTotalModulesForBase` (6).
- `frontend/src/lib/bases/__tests__/state-selectors.test.ts` — `selectRecommendationsForBase` nunca vaza tech recs em outras bases.
- `frontend/src/tests/render/SiteFooter.test.tsx` — sem props, NÃO renderiza links cross-base.
- `backend/test/contract/bases_handler_test.go` — 12 cenários incluindo Content-Type RFC 7807, theme completeness, paridade seed↔fallback.

### Volumes esperados (1 ano)

| Tabela | Linhas | Crescimento |
|---|---|---|
| hubs | 8 | ~0 |
| trails | 66 → 100 | lento |
| articles | 915 → ~500 (pós-curadoria) | lento |
| module_blocks | ~50k | médio |
| comments | 10k+ | alto |
| article_ratings/bookmarks | 5-10k | médio |

Storage total estimado: ~500MB em Postgres no 1º ano.

### Checklist antes de mexer em base/hub/módulo

1. Mudou hub em curriculum.ts? Mirror em `scripts/seeds/hubs.json` SEMPRE.
2. Base nova? Migration SQL + `BASE_REGISTRY` + `buildHardcodedBases()` + page + `<BaseStructuredData />` + canonical.
3. Trilha nova? Coloca em `HUBS[*].trailIds`. Resolver deriva `getBaseSlugForTrailHref` automaticamente.
4. Módulo novo? Verifica `getBaseSlugForModule(slug)` via trilha → hub → base.
5. Antes do PR: testa URLs afetadas no browser (header certo, cores, mascote).

---

## Histórico

| Versão | Data | Mudança |
|---|---|---|
| 1.0 | 2026-05-26 | Consolidação inicial — sucede `ARCHITECTURE_BLUEPRINT.md`, `ARCHITECTURE_BASES_MODULAR.md`, `UNIFICATION_PLAN.md` |
