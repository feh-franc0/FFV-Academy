# CLAUDE.md — Backend (Go API)

## 🎯 O que é o produto (linguagem de aluno)

Sabe quando o aluno precisa estudar alguma coisa — apostila, livro, vídeo de aula, artigo, foto do quadro — e bate o desespero de *"por onde começo?"* e *"como vou lembrar na prova?"* **A FFV resolve isso.**

Ele joga o material lá (PDF, foto, link, áudio, vídeo). Em 2-3 minutos recebe: **resumo**, **mapinha de conceitos**, **dicionário dos termos difíceis**, **100 perguntas** sempre (do básico ao difícil), **revisão espaçada** que lembra nos dias certos, e **simulado cronometrado** tipo prova. Vira aluno daquele conteúdo: estuda 30min/dia, ganha pontos, streak, ranking, certificado pro LinkedIn.

**O conteúdo é do aluno** — não é a FFV empurrando aula pronta. Gratuito, em português. Pro $7/mês destrava uso ilimitado.

> **Em uma frase:** o aluno joga o material dele lá, a FFV transforma em aprendizado que gruda na cabeça.
>
> **Este backend é o motor invisível que faz essa promessa existir** — recebe os arquivos, orquestra extração/estruturação/geração das 100Q, agenda a revisão espaçada, distribui pontos/badges/streak, gera certificados, cuida da assinatura. Tudo o que o aluno **não** vê.

---

## 🎯 Foco real do produto (pós-pivot mai/2026)

A FFV é **plataforma de user-generated learning**: aluno sobe conteúdo → backend ingere/extrai/estrutura → gera 100 questões calibradas por Bloom → cria cards SRS. Doc canônico do método: [`../TEACHING_METHOD.md`](../TEACHING_METHOD.md).

**Implicação prática pro backend:**

- **Novo domínio crítico:** `ingest/` (extração: PDF, OCR, Whisper, Readability, yt-dlp) + `module-generator/` (Bloom-calibrated 100Q via Claude API) + `srs/` (já existe, integrar com módulos gerados).
- **Endpoints novos prioritários** (ver `STRATEGY.md §9` — dias 3-14):
  - `POST /api/v1/upload` — recebe arquivo, salva em R2, dispara worker
  - `GET /api/v1/modules/{id}/status` — polling do processamento
  - `GET /api/v1/modules/{id}` — módulo completo (resumo, mapa, glossário, 100Q)
  - `POST /api/v1/modules/{id}/simulate` — submete tentativa do simulado
- **Workers em background** (Asynq/Redis): ingestão custa 30-180s; HTTP request não pode bloquear.
- **Validador automático (2º modelo):** segundo LLM revisa as 100Q antes de entregar — gabarito único, alternativas plausíveis, distribuição Bloom ±2.
- **Métricas P0:** custo LLM por upload (alvo <$0.15), % uploads que viram módulo (>95%), latência média processamento.

## Documentação complementar

- `api/openapi.yaml` — contrato OpenAPI 3.1 (rotas, schemas, errors, servidores).
- `docs/ARCHITECTURE.md` — camadas DDD, fluxos críticos (auth, finish→cert, webhook).
- `docs/RUNBOOK.md` — setup local, migrations em prod, rotação de secrets, webhook travado, backup, SLOs.
- `docs/TESTING.md` — pirâmide de testes, comandos, coverage targets, exemplos por camada.
- `docs/SECURITY.md` — threat model STRIDE, controles, checklist de PR review, política de secrets.
- `../TEACHING_METHOD.md` — método pedagógico (Bloom, distribuição 100Q, anti-padrões).
- `../STRATEGY.md` — concorrentes (NotebookLM, Quizlet, ChatGPT Study Mode), SWOT, gaps que estamos preenchendo.

---

## Commands

```bash
# Build & Run
make build          # Compila para bin/api
go build ./...      # Verifica se compila (zero saída = ok)
make run            # go run ./cmd/api
make run-watch      # air (hot reload — requer .air.toml)

# Tests
make test           # Todos os testes (120s timeout)
make test-unit      # Domain + Application (sem Docker)
make test-contract  # HTTP contract tests (sem Docker)
make test-integration  # Requer Docker (testcontainers-go)
make test-security  # Security-specific tests
make test-cover     # Gera coverage.html

# Rodar um único teste
go test ./internal/domain/simulado/... -run Test_Scorer -v

# Lint
make lint           # golangci-lint run ./...
make lint-fix       # golangci-lint run --fix ./...

# Migrations (requer DATABASE_URL no ambiente)
export DATABASE_URL=postgres://ffv:ffv@localhost:5432/ffv_dev?sslmode=disable
make migrate        # Aplica migrations pendentes
make migrate-down   # Reverte 1 migration
make migrate-reset  # Drop + aplica tudo do zero
make migrate-status # Exibe versão atual

# Docker (local dev — postgres + redis + mailhog)
make docker-up
make docker-down
make docker-build   # Builda imagem ffv-api:latest (multi-stage distroless)

# Code generation
make generate       # go generate ./...
make mocks          # Gera mocks para domain + application

# CI local
make ci             # lint + test-unit + test-cover
```

---

## Architecture

**Clean Architecture + DDD** — dependências sempre apontam para dentro (domínio não importa infra).

```
cmd/api/main.go              ← Composition Root (único lugar com deps concretas)
internal/
  domain/                    ← Regras de negócio puras (zero imports de infra)
    shared/                  ← Typed IDs, Clock interface, sentinel errors, DomainError
    identity/                ← User (aggregate), Email, Phone (VOs), MagicToken, Role, RefreshToken
    simulado/                ← Attempt (aggregate), Simulado, Score (VO), Scorer, PaywallPolicy
    certificate/             ← Certificate (aggregate, hash SHA-256 determinístico)
    billing/                 ← Purchase (aggregate), status machine, PaymentProvider port
    progress/                ← ProgressSnapshot (JSONB blob, LWW policy)
    leaderboard/             ← RankEntry, Period, WeekStart()
    tutor/                   ← Query, TutorResponse (só ports, sem aggregate)
    curriculum/              ← Article (slug, title, content, category), CurriculumRepository port
    referral/                ← Referral Value Object
    audit/                   ← Port: AuditService (HTTP mutations logging)
  application/               ← Use cases (orquestram domain + ports)
    identity/                ← RequestMagicLink, VerifyMagicLink, Refresh, Logout, LogoutAll,
                             ←   GetProfile, UpdateProfile, DeleteAccount, ExportUserData, UserStats
    simulado/                ← StartAttempt, AnswerQuestion, ToggleReviewFlag, FinishAttempt,
                             ←   ResumeAttempt, ListAttempts, CancelAttempt, ReportQuestion
    billing/                 ← CreateCheckout, HandleStripeWebhook
    progress/                ← SyncPush, SyncPull
    certificate/             ← IssueCertificate, VerifyCertificate, ListCertificates
    leaderboard/             ← GetWeeklyRanking, GetMyRank, GetByPeriod, GetUserRankByPeriod
    tutor/                   ← AskTutor (com rate-limit por tier)
    curriculum/              ← GetArticle, ListCurriculum, SearchCurriculum
    event/                   ← IngestEvent (analytics fire-and-forget)
    admin/                   ← GetStats, GetAuditLog
  infrastructure/            ← Implementações concretas
    persistence/postgres/    ← user_repo, attempt_repo, certificate_repo, purchase_repo,
                             ←   audit_log_repo, curriculum_repo, question_report_repo,
                             ←   circuit_breaker (PostgreSQL resiliência)
    persistence/redis/       ← magic_token_store (GETDEL atômico), tutor_cache, tutor_rate_limiter
    auth/                    ← JWTService (access + refresh tokens)
    ai/                      ← ClaudeClient (anthropic-sdk-go v1.37, prompt caching)
    catalog/                 ← StaticCatalogProvider (//go:embed catalog.json) — fallback temporário
    email/                   ← ResendClient
    sms/                     ← TwilioClient
    payment/                 ← StripeClient
    audit/                   ← PostgresAuditService (thread-safe, async)
  interfaces/http/
    handlers/                ← Um handler por bounded context (13+ handlers)
    middleware/              ← RequestID, Logger, Recover, CORS, SecurityHeaders,
                             ←   Authenticate, RequireAdmin, RateLimit, BodyLimit,
                             ←   AuditLog (async), Metrics (Prometheus), OTel tracing
    httputil/                ← WriteError/WriteJSON/ProblemJSON (evita import cycle)
    router.go                ← chi.Router com todas as rotas + body limits + rate-limits por grupo
    server.go                ← http.Server com graceful shutdown (ReadTimeout 15s, WriteTimeout 30s)
  config/                    ← envconfig (12-factor, fail-fast em startup)
  platform/
    logger/                  ← slog (JSON em prod, text em dev)
    telemetry/               ← OpenTelemetry (OTLP gRPC — NoopProvider se endpoint vazio)
migrations/                  ← SQL files (golang-migrate, numerados 000001-000063)
deployments/
  Dockerfile                 ← Multi-stage: golang:1.25-alpine → distroless/static-debian12:nonroot
  docker-compose.yml         ← Dev local: api + postgres + redis + mailhog
  docker-compose.prod.yml    ← Produção VPS: nginx + api + postgres + redis
  nginx/
    nginx.conf               ← Worker, gzip, rate-limit zones
    conf.d/api.conf          ← Virtual host HTTPS (TLS 1.2/1.3, HSTS, proxy para api:8080)
test/
  contract/                  ← httptest.NewRecorder — sem Docker
  integration/               ← testcontainers-go (Postgres + Redis reais)
  security/                  ← CORS, JWT tampering, magic token timing, IDOR
  load/                      ← Scripts k6 (smoke, auth, simulados, progress, tutor, certs)
```

---

## ⚡ PRINCÍPIO FUNDAMENTAL — SISTEMA MOLDÁVEL (ZERO DADOS ESTÁTICOS)

Todo hub, trilha, módulo, questão e simulado vem do banco. O sistema é um **gerador**:
admin cria um hub no CMS → zero código novo → front reflete automaticamente via snapshot.

- ❌ Switch cases com slugs de hub/base hardcoded — não existem no código
- ❌ Listas de simulado_ids ou hub_ids fixas em handlers
- ✅ Todo dado de currículo: `hubs`, `trails`, `curriculum_articles`, `simulados`, `questions` — via tabelas com FK encadeadas
- ✅ `base_slug` de hub vem do campo na tabela `hubs.base_slug` — não de lógica Go
- ✅ `catalog.json` é fallback temporário (sunset na Fase 5) — novos simulados via tabela `simulados`
- ✅ `buildHardcodedBases()` em bases_handler.go é fallback temporário (sunset na Fase 5)

Quando criar endpoint novo para currículo: lê do DB, nunca de arquivo Go/JSON embutido.

---

## API Routes

| Método | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/healthz` | — | Health.Liveness |
| GET | `/readyz` | — | Health.Readiness |
| GET | `/metrics` | — | Metrics.Prometheus |
| GET | `/api/v1/simulados` | — | Simulado.ListSimulados |
| GET | `/api/v1/simulados/{simuladoId}` | — | Simulado.GetSimulado |
| GET | `/api/v1/certificates/{hash}` | rate-limit | Certificate.VerifyCertificate |
| GET | `/api/v1/curriculum` | — | Curriculum.List |
| GET | `/api/v1/curriculum/search` | — | Curriculum.Search |
| GET | `/api/v1/curriculum/{slug}` | — | Curriculum.GetBySlug |
| POST | `/api/v1/auth/request-token` | rate-limit | Auth.RequestToken |
| POST | `/api/v1/auth/verify` | rate-limit | Auth.Verify |
| POST | `/api/v1/auth/refresh` | — | Auth.Refresh |
| POST | `/api/v1/auth/logout` | JWT | Auth.Logout |
| POST | `/api/v1/auth/logout-all` | JWT | Auth.LogoutAll |
| GET | `/api/v1/me` | JWT | Auth.GetProfile |
| PATCH | `/api/v1/me` | JWT | Auth.UpdateProfile |
| DELETE | `/api/v1/me` | JWT | Auth.DeleteAccount |
| GET | `/api/v1/me/export` | JWT | Auth.ExportData |
| GET | `/api/v1/me/stats` | JWT | Auth.UserStats |
| GET | `/api/v1/me/certificates` | JWT | Certificate.ListCertificates |
| POST | `/api/v1/simulados/{simuladoId}/attempts` | JWT | Simulado.StartAttempt |
| GET | `/api/v1/simulados/{simuladoId}/attempts/active` | JWT | Simulado.ResumeAttempt |
| GET | `/api/v1/attempts` | JWT | Simulado.ListAttempts |
| POST | `/api/v1/attempts/{attemptId}/answers` | JWT | Simulado.AnswerQuestion |
| POST | `/api/v1/attempts/{attemptId}/flags/{questionId}` | JWT | Simulado.ToggleReviewFlag |
| POST | `/api/v1/attempts/{attemptId}/finish` | JWT | Simulado.FinishAttempt |
| DELETE | `/api/v1/attempts/{attemptId}` | JWT | Simulado.CancelAttempt |
| POST | `/api/v1/attempts/{attemptId}/report` | JWT | Simulado.ReportQuestion |
| GET | `/api/v1/progress` | JWT | Progress.Pull |
| PUT | `/api/v1/progress` | JWT | Progress.Push |
| POST | `/api/v1/certificates` | JWT | Certificate.IssueCertificate |
| POST | `/api/v1/billing/checkout` | JWT | Billing.CreateCheckout |
| POST | `/api/v1/webhooks/stripe` | Stripe sig | Billing.StripeWebhook |
| POST | `/api/v1/tutor/ask` | JWT + rate-limit | Tutor.Ask |
| POST | `/api/v1/events` | JWT | Event.Ingest |
| GET | `/api/v1/leaderboard` | JWT | Leaderboard.GetWeekly |
| GET | `/api/v1/leaderboard/me` | JWT | Leaderboard.GetMyRank |
| GET | `/api/v1/leaderboard/me/all` | JWT | Leaderboard.GetMyRankAll |
| GET | `/api/v1/leaderboard/public` | público | Leaderboard.GetPublic (`?period=weekly\|monthly\|yearly\|all-time&limit=N`) |
| GET | `/api/v1/stats` | público | Stats.GetPublic (cache 60s) |
| GET | `/api/v1/admin/stats` | JWT + admin | Admin.GetStats |
| GET | `/api/v1/admin/audit` | JWT + admin | Admin.GetAuditLog |
| POST | `/api/v1/admin/curriculum/{slug}` | JWT + admin | Curriculum.Create |
| PATCH | `/api/v1/admin/curriculum/{slug}` | JWT + admin | Curriculum.Update |
| DELETE | `/api/v1/admin/curriculum/{slug}` | JWT + admin | Curriculum.Delete |

**Body limits:** auth 10 KB · profile 64 KB · simulado answers 256 KB · progress 512 KB

**Rate-limits por IP (Redis-backed):** auth 20 req/min · tutor 60 req/min · cert verify 120 req/min

---

## Domain Invariants — Gotchas críticos

### shared/
- Typed IDs: `UserID`, `AttemptID`, `CertificateHash`, `PurchaseID`, `SimuladoID`, `QuestionID` — todos `type X string`. Nunca string raw em assinaturas de domínio.
- Sentinel errors: `ErrNotFound`, `ErrUnauthorized`, `ErrForbidden`, `ErrConflict`, `ErrValidation`, `ErrRateLimited`. Sempre `errors.Is()`.

### identity/
- Roles: `RoleUser = "user"`, `RoleAdmin = "admin"` — nunca `RoleStudent`.
- `RefreshToken` campos públicos: `ID`, `UserID`, `TokenHash`, `ExpiresAt`, `CreatedAt`, `RevokedAt`.
- `ReconstituteUser(...)` — nome qualificado, não colide com `Reconstitute(...)` do `magic_token.go`.

### simulado/
- `attempt.Answers()` retorna `Answers` (collection). Métodos: `answers.ToMap()` e `answers.Count()` — **não** `All()` / `Len()`.
- `Scorer{}.Calculate(sim, answers)` → `ScoreResult`. Campos: `Value` (int 0-100), `CorrectCount`, `TotalQuestions`, `Passed`, `ByTopic map[Topic]TopicCounts`. **Não há** `Score.Percentage()`, `Score.Total()`, `Score.Correct()` — usar campos de `ScoreResult`.
- `attempt.Deadline()` — **não** `ExpiresAt()`.

### leaderboard/
- `RankEntry` campos: `DisplayName` (não `UserName`), `XPGained` (não `Score`).
- `Period` enum (`weekly`, `monthly`, `yearly`, `all-time`). `PeriodWindow(p, now)` retorna janela UTC.

### billing/
- Stripe webhook: `stripeEventRepo.MarkProcessed()` **antes** de processar. Se já existe, ignorar silenciosamente.

---

## Key Design Decisions

**Import cycle solution**: `internal/interfaces/http/httputil/` contém `WriteError` e `WriteJSON`. Tanto `handlers/` quanto `middleware/` importam de `httputil`.

**Server-authoritative scoring**: catálogo embebido via `//go:embed catalog.json` (fallback). O score nunca vem do cliente. Novos simulados vêm da tabela `simulados` no DB.

**Magic token**: Redis GETDEL para consumo atômico (anti-replay). TTL = 10 min, rate limit = 5/email/janela.

**Refresh token rotation**: Hash SHA-256 no DB; raw token em cookie `ffv_refresh` (HttpOnly + Secure + SameSiteStrict). A cada `POST /auth/refresh` o token antigo é revogado.

**LWW Progress**: `SyncPushUseCase` compara `clientUpdatedAt` com `serverUpdatedAt`. Retorna `ErrConflict` se servidor é mais recente.

**Race condition em StartAttempt**: `UNIQUE (user_id, simulado_id, status)` no DB. Se `Save()` retorna `ErrConflict`, o UC busca a attempt ativa existente (retry otimista).

**Anthropic SDK v1.37**: `anthropic.NewClient()` retorna valor (não ponteiro). Sem `anthropic.F()` wrapper — usar atribuição direta. `System` é `[]anthropic.TextBlockParam{{Text: "..."}}`.

**Redis Pinger**: `*goredis.Client.Ping()` retorna `*StatusCmd`, não `error`. `redisPingerAdapter` em `main.go` adapta para `handlers.Pinger`.

**Audit log**: Middleware async que registra HTTP mutations (POST/PATCH/PUT/DELETE) sem bloquear o request path.

**Leaderboard multi-período**: `GetByPeriod` usa CTE com `SUM(xp_gained)` e `JOIN leaderboard_opt_ins`. `GetUserRankByPeriod` usa `RANK() OVER (ORDER BY xp_total DESC)` filtrado por user_id.

---

## Environment Variables

`required:"true"` causa panic em startup se ausente. Em testes use `config.LoadTest()`.

| Var | Required | Default | Descrição |
|-----|----------|---------|-----------|
| `DATABASE_URL` | ✓ | — | Postgres DSN completo |
| `REDIS_URL` | ✓ | — | Redis DSN |
| `JWT_SECRET` | ✓ | — | >= 32 chars (validado em startup) |
| `STRIPE_SECRET_KEY` | ✓ | — | sk_live_... |
| `STRIPE_WEBHOOK_SECRET` | ✓ | — | whsec_... |
| `RESEND_API_KEY` | ✓ | — | re_... |
| `TWILIO_ACCOUNT_SID` | ✓ | — | AC... |
| `TWILIO_AUTH_TOKEN` | ✓ | — | — |
| `TWILIO_FROM_NUMBER` | ✓ | — | E.164 format |
| `ANTHROPIC_API_KEY` | ✓ | — | sk-ant-... |
| `APP_ENV` | — | `development` | `development`\|`production`\|`test` |
| `HTTP_PORT` | — | `8080` | — |
| `JWT_ACCESS_TTL` | — | `15m` | — |
| `JWT_REFRESH_TTL` | — | `720h` | 30 dias |
| `ANTHROPIC_MODEL` | — | `claude-sonnet-4-6` | — |
| `ANTHROPIC_MAX_TOKENS` | — | `1024` | — |
| `ANTHROPIC_RATE_LIMIT_FREE` | — | `10` | req/hora tier free |
| `ANTHROPIC_RATE_LIMIT_PRO` | — | `60` | req/hora tier pago |
| `STRIPE_SIMULADO_PRICE_ID` | — | `price_placeholder` | — |
| `STRIPE_SUCCESS_URL` | — | — | Redirect pós-checkout |
| `STRIPE_CANCEL_URL` | — | — | Redirect em cancelamento |
| `CORS_ALLOWED_ORIGINS` | — | `https://fernandofrancovalle.com` | Espaço-separado |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | — | `""` | OTLP gRPC endpoint; vazio = noop |
| `OTEL_EXPORTER_OTLP_INSECURE` | — | `false` | true em dev local com OTLP |

---

## Database Schema (63 migrations)

### Migrations 000001–000024 — base do sistema

| Migration | Tabela / Alteração |
|-----------|--------------------|
| 000001 | `users` — soft-delete `deleted_at`, UNIQUE email, UNIQUE `referral_id` |
| 000002 | `user_products` — PK `(user_id, product_id)` |
| 000003 | `refresh_tokens` — `token_hash` UNIQUE, `revoked_at` nullable |
| 000004 | `simulado_attempts` — JSONB answers/review_flags/score, UNIQUE `(user_id, simulado_id, status)` |
| 000005 | `progress_snapshots` — PK `user_id`, JSONB state, LWW via updated_at |
| 000006 | `certificates` — PK hash SHA-256, UNIQUE `attempt_id` |
| 000007 | `purchases` — UNIQUE `stripe_session_id`, status machine |
| 000008 | `stripe_events` — PK `stripe_event_id`, idempotência de webhooks |
| 000009 | `referrals` — UNIQUE `(referrer_id, referred_id)` |
| 000010 | `leaderboard` — PK `(user_id, week_start)`, `week_start` = segunda-feira UTC |
| 000011 | `analytics_events` — JSONB payload, fire-and-forget |
| 000012–000015 | Fixes de schema + indexes de performance |
| 000016 | `audit_logs` — HTTP mutation trail: actor, IP, path, status, latência |
| 000017 | `question_reports` — reporte de questões pelos usuários |
| 000018–000022 | Schema sync + indexes adicionais |
| 000023 | `articles` — currículo persistido: slug, title, content, category, published_at |
| 000024 | `users` — UNIQUE constraint em `phone` |

### Migrations 000025–000054 — currículo DB-driven e gamificação

Cobrem: tabelas `hubs`, `trails`, `curriculum_articles` com FK encadeadas; `leaderboard_opt_ins`; campos de gamificação em `users` (xp, level, streak); seeds de questões CLF (000041–000042, 1015 questões idempotentes via `ON CONFLICT DO UPDATE`); períodos de leaderboard (weekly/monthly/yearly/all-time).

### Migrations 000055–000063 — Fase 1 DB-driven (sistema moldável)

| Migration | Arquivo | O que faz |
|-----------|---------|-----------|
| 000055 | `add_base_slug_to_hubs` | `hubs.base_slug TEXT NOT NULL FK→bases(slug)` + `hubs.slug NOT NULL` + `hubs.tagline`. Backfill canônico (11 hubs → tecnologia). Index `idx_hubs_base_position`. |
| 000056 | `extend_trails_metadata` | `trails.slug NOT NULL`, `tagline`, `color`, `href`, `status`, `level`, `pos`. Unique `(hub_id, slug)`. |
| 000057 | `extend_modules_metadata` | `curriculum_articles`: `keywords`, `seo_description`, `external_url`, `icon`, `level`, `pos`. Cria `module_prerequisites` (M:N self) e `module_next_suggested` (M:N ordered). |
| 000058 | `create_simulados` | Nova tabela `simulados(id PK, base_slug FK, certification, title, price_cents, question_count, time_limit_min, passing_score, topics JSONB, status, position)`. |
| 000059 | `seed_simulados` | INSERT idempotente dos 3 simulados (`aws-clf`, `aws-aif`, `anthropic-ai`) extraídos do `catalog.json`. |
| 000060 | `add_simulado_fk_to_questions` | `questions.simulado_id` promovido de TEXT solto para FK real → `simulados(id)` DEFERRABLE. Adiciona `questions.related_module_slug FK→curriculum_articles(slug) ON DELETE SET NULL`. |
| 000061 | `create_module_quizzes` | Nova tabela `module_quizzes(uuid PK, module_slug FK, stem, options JSONB, correct_id, explanation, difficulty)`. Migra blocos `block_type='quiz'` para ela. Remove `'quiz'` do CHECK de `module_blocks`. |
| 000062 | `create_module_quiz_attempts` | Estado SM-2 por usuário: `(user_id TEXT FK, quiz_id UUID FK)` UNIQUE + `ease_factor`, `interval_days`, `repetitions`, `next_review_at`. |
| 000063 | `create_base_stats_view` | `CREATE MATERIALIZED VIEW base_stats` — contagem de hubs/trails/modules por base via JOIN. Unique index em `base_slug`. Primeiro `REFRESH` incluso. |

**Novas tabelas:** `simulados`, `module_quizzes`, `module_quiz_attempts`, `module_prerequisites`, `module_next_suggested` + view `base_stats`.

---

## Test Patterns

**0 falhas é o único resultado aceitável.**

```bash
go build ./...                 # compila sem erro
make lint                      # 0 warnings
make test-unit                 # domain + application — sem Docker
make test-contract             # HTTP contract — sem Docker
make test-security             # CORS, JWT, timing, IDOR
go test ./test/integration/... -tags integration -timeout 180s  # requer Docker
make test-cover                # gera coverage.html
```

| Categoria | Localização | Requer Docker | O que cobre |
|-----------|-------------|:-------------:|-------------|
| **Unit** | `internal/domain/...` + `internal/application/...` | Não | Regras de negócio, mocks inline |
| **Contract** | `test/contract/` | Não | HTTP handlers via `httptest.NewRecorder()` |
| **Security** | `test/security/` | Não | CORS, JWT tampering, magic token timing, IDOR |
| **Integration** | `test/integration/` | **Sim** | Repos reais com testcontainers-go |
| **Load** | `test/load/` | Não (k6) | smoke, auth, simulados, progress, tutor — só local |

**Naming**: `Test_<Type>_<Method>_<Scenario>_<Expected>` — ex: `Test_Scorer_Calculate_AllCorrect_Returns100`.

**Unit tests**: inline mocks — struct implementa o port, sem gomock.

---

## Adding a New Endpoint

1. Defina port/interface em `internal/domain/<ctx>/repository.go`.
2. Implemente use case em `internal/application/<ctx>/`. Recebe Command struct, retorna Result struct + error.
3. Implemente infra em `internal/infrastructure/persistence/postgres/` (ou redis/).
4. Adicione método no handler. Use `handlers.HandleDomainError(w, err)` para mapear erros de domínio → HTTP.
5. Registre rota em `internal/interfaces/http/router.go` (body limit + rate-limit se necessário).
6. Wire em `cmd/api/main.go` (único lugar com injeção de dependência manual).

**Regra para endpoints de currículo**: sempre lê de tabelas DB (`hubs`, `trails`, `curriculum_articles`, `simulados`, `questions`). Nunca hardcode slugs, IDs ou listas em Go. Se precisar de dado estático temporariamente, use migration SQL com seed — não constante Go.

---

## CI/CD

```
git push main
  → .github/workflows/ci.yml (lint + test + build)
  → .github/workflows/deploy.yml (se CI passou e DEPLOY_ENABLED=true)
      ├── build-push:  Docker backend  → ghcr.io/feh-franc0/ffv-api:sha-<hash>
      ├── build-push-frontend: Docker frontend → ghcr.io/feh-franc0/ffv-frontend:sha-<hash>
      └── deploy-backend: SCP files → SSH VPS → /opt/ffv/bin/deploy.sh
```

`DEPLOY_ENABLED` é uma **Repository Variable** (não secret) — por isso pode ser usada em `if:`.
Para ativar: GitHub → Settings → Variables → Actions → `DEPLOY_ENABLED` = `true`

### deploy.sh na VPS

1. Login no GHCR → `docker pull` nova imagem
2. Salva tag atual em `/opt/ffv/.current_tag` (para rollback)
3. Sobe postgres + redis se necessário
4. `migrate -path /opt/ffv/migrations up` (inclui seeds CLF idempotentes)
5. `docker compose up --scale api=2 --no-deps api`
6. Health check: aguarda `healthy` por até 120s
7. Sucesso → atualiza nginx | Falha → rollback automático

---

## Deploy e Infraestrutura

| Item | Detalhe |
|------|---------|
| **Provedor** | Hostinger VPS KVM 2 |
| **IP** | `72.60.28.82` |
| **OS** | Ubuntu 24.04 LTS |
| **Recursos** | 2 vCPU / 8 GB RAM / 100 GB NVMe |
| **Domínio API** | `api.fernandofrancovalle.com` |
| **SSH** | `ssh deploy@72.60.28.82` (chave ed25519) |

### Arquitetura Docker na VPS

```
Internet :443/:80
    │
  Nginx — TLS Let's Encrypt, rate limiting, HSTS
    ├── api.fernandofrancovalle.com → api_1:8080 + api_2:8080 (round-robin)
    └── fernandofrancovalle.com    → frontend:3000 (Next.js standalone)

(rede data — internal: true)
    ├── postgres:5432  (exposto em 127.0.0.1:5432 pro migrate CLI)
    └── redis:6379
```

**Resource limits:** API (×2) 512 MB / 0.8 CPU cada · Postgres 512 MB · Redis 320 MB.

### Comandos úteis na VPS

```bash
# Logs em tempo real
docker compose -f /opt/ffv/docker-compose.prod.yml logs -f api

# Status
docker compose -f /opt/ffv/docker-compose.prod.yml ps

# Rollback manual
PREVIOUS=$(cat /opt/ffv/.current_tag)
IMAGE_TAG=$PREVIOUS docker compose -f /opt/ffv/docker-compose.prod.yml up -d --no-deps --scale api=2 api

# Migration manual
source /opt/ffv/.env && migrate -path /opt/ffv/migrations -database "$DATABASE_URL" up
```

### GitHub Secrets necessários

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `72.60.28.82` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | chave privada ed25519 |
| `VPS_PORT` | `22` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.fernandofrancovalle.com` |

> Secrets antigos do FTP (`HOSTINGER_FTP_*`) foram aposentados — podem ser deletados do repo.

### Arquivos de deploy

| Arquivo | Descrição |
|---------|-----------|
| `deployments/Dockerfile` | Multi-stage: golang:1.25-alpine → distroless/static-debian12:nonroot |
| `deployments/docker-compose.prod.yml` | Produção: nginx + api(×2) + postgres + redis |
| `deployments/docker-compose.yml` | Dev local: api + postgres + redis + mailhog |
| `deployments/nginx/nginx.conf` | Config base Nginx |
| `deployments/nginx/conf.d/api.conf` | Virtual host HTTPS + upstream com fault tolerance |
| `scripts/vps-setup.sh` | Setup inicial da VPS (roda uma vez como root) |
| `scripts/deploy.sh` | Deploy script (chamado pelo GitHub Actions via SSH) |

O binário Go suporta `--healthcheck` flag: faz `GET /healthz`, sai com 0 (ok) ou 1 (falha). Necessário porque a imagem distroless não tem curl/wget/shell.

---

## Error Responses

RFC 7807 Problem+JSON. `httputil.WriteError(w, status, detail, type)`:
```json
{"type": "...", "title": "...", "status": 400, "detail": "..."}
```

`handlers.HandleDomainError(w, err)` mapeia automaticamente:
- `ErrNotFound` → 404 · `ErrUnauthorized` → 401 · `ErrForbidden` → 403
- `ErrConflict` → 409 · `ErrValidation` → 400 · `ErrRateLimited` → 429 · qualquer outro → 500

---

## Referências cross-projeto

- [`../CLAUDE.md`](../CLAUDE.md) — visão monorepo e regras de isolamento de bases
- [`../CHANGELOG_PLATFORM_2026-05.md`](../CHANGELOG_PLATFORM_2026-05.md) — mudanças de maio/2026
- [`PLAN.md`](./PLAN.md) — plano detalhado de iteração da API
- [`../frontend/CLAUDE.md`](../frontend/CLAUDE.md) — deploy e infra do frontend (SSR Docker na mesma VPS)
