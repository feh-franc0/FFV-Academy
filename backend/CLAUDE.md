# CLAUDE.md — Backend (Go API)

## Documentação complementar

- `api/openapi.yaml` — contrato OpenAPI 3.1 (rotas, schemas, errors, servidores).
- `docs/ARCHITECTURE.md` — camadas DDD, fluxos críticos (auth, finish→cert, webhook).
- `docs/RUNBOOK.md` — setup local, migrations em prod, rotação de secrets, webhook travado, backup, SLOs.
- `docs/TESTING.md` — pirâmide de testes, comandos, coverage targets, exemplos por camada.
- `docs/SECURITY.md` — threat model STRIDE, controles, checklist de PR review, política de secrets.

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
make test-load      # k6 load tests (requer k6 instalado)
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
make docker-logs

# Code generation
make generate       # go generate ./...
make mocks          # Gera mocks para domain + application
make gen-catalog    # Regenera catalog.json embebido

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
    leaderboard/             ← RankEntry, WeekStart()
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
    leaderboard/             ← GetWeeklyRanking, GetMyRank
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
    catalog/                 ← StaticCatalogProvider (//go:embed catalog.json)
    email/                   ← ResendClient
    sms/                     ← TwilioClient
    payment/                 ← StripeClient
    audit/                   ← PostgresAuditService (thread-safe, async)
  interfaces/http/
    handlers/                ← Um handler por bounded context (13 handlers)
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
migrations/                  ← SQL files (golang-migrate, numerados 000001-000024)
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
  e2e/                       ← Fluxos end-to-end
  load/                      ← Scripts k6 (smoke, auth, simulados, progress, tutor, certs)
```

---

## API Routes (completo)

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
| POST | `/api/v1/attempts/{attemptId}/claim-xp` | JWT | Simulado.ClaimXPCredit *(novo, ago/2026 — idempotência de crédito de XP no servidor via `xp_credited_at`, ver seção abaixo)* |
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
| GET | `/api/v1/leaderboard/me/all` | JWT | Leaderboard.GetMyRankAll *(novo, mai/2026)* |
| GET | `/api/v1/leaderboard/public` | público | Leaderboard.GetPublic *(novo, mai/2026 — query: `?period=weekly\|monthly\|yearly\|all-time&limit=N`)* |
| GET | `/api/v1/stats` | público | Stats.GetPublic *(novo, mai/2026 — totalUsers, activeWeekly, totalXpAwarded)* |
| GET | `/api/v1/admin/stats` | JWT + admin | Admin.GetStats |
| GET | `/api/v1/admin/audit` | JWT + admin | Admin.GetAuditLog |
| POST | `/api/v1/admin/curriculum/{slug}` | JWT + admin | Curriculum.Create |
| PATCH | `/api/v1/admin/curriculum/{slug}` | JWT + admin | Curriculum.Update |
| DELETE | `/api/v1/admin/curriculum/{slug}` | JWT + admin | Curriculum.Delete |

**Body limits por grupo de rotas:**
- auth: 10 KB
- profile: 64 KB
- simulado answers: 256 KB
- progress: 512 KB
- billing checkout: 4 KB · tutor ask: 8 KB *(achado P-09, ago/2026)*

**Rate-limits por IP (Redis-backed):**
- auth: 20 req/min (fail-closed)
- tutor: 60 req/min (fail-closed)
- cert verify: 120 req/min (fail-closed desde 11/ago/2026, achado P-09 — antes era fail-open, justo na rota que existe pra impedir enumeração de hash de certificado)
- webhook Stripe: sem rate-limit no Go, mas 300 req/min na borda do Nginx (`api_webhook`, achado P-10) — protege CPU do custo de validar HMAC sobre payload grande vindo de request anônimo; a assinatura já protege a lógica

---

## Domain Invariants & Naming

### shared/
- Typed IDs: `UserID`, `AttemptID`, `CertificateHash`, `PurchaseID`, `ProductID`, `SimuladoID`, `QuestionID`, `ReferralID` — todos `type X string`. Nunca usar string raw em assinaturas de domínio.
- `shared.Clock` interface com `Now() time.Time`. Implementações: `RealClock{}` e `FixedClock{T: time.Time}`.
- Sentinel errors: `ErrNotFound`, `ErrUnauthorized`, `ErrForbidden`, `ErrConflict`, `ErrValidation`, `ErrRateLimited`. Sempre usar `errors.Is()`.
- `DomainError{Err: sentinel, Message: string}` — mensagens contextuais com `errors.Is()` funcionando.

### identity/
- Roles: `RoleUser = "user"`, `RoleAdmin = "admin"` (nunca `RoleStudent`).
- `NewUser(id, email, phone, name, marketingConsent, referralID, now)` retorna `(*User, UserCreatedEvent, error)`.
- `ReconstituteUser(...)` — nome qualificado para não colidir com `Reconstitute(...)` do `magic_token.go`.
- `user.PaidProducts()` — não `Products()`. Retorna `[]ProductEntry`.
- `user.HasProduct(productID)` para verificar acesso.
- `RefreshToken` campos públicos: `ID`, `UserID`, `TokenHash`, `ExpiresAt`, `CreatedAt`, `RevokedAt`.
- `MagicToken`: `GenerateMagicToken(ttl, now)` → 6 dígitos numéricos (crypto/rand). `Reconstitute(value, expiresAt)`. `token.Matches(input)` e `token.IsExpired(now)`.

### simulado/
- `Attempt` aggregate: `StartAttempt(id, userID, simID, timeLimitMin, now)`, `attempt.AnswerQuestion(qID, optID, now)`, `attempt.ToggleReviewFlag(qID, now)`, `attempt.Finish(score, now)`, `attempt.Cancel(now)`.
- `attempt.Deadline()` — não `ExpiresAt()`.
- `attempt.Answers()` retorna `Answers` (collection). Métodos: `answers.ToMap()` e `answers.Count()` — não `All()` / `Len()`.
- `attempt.IsFinished()` bool.
- `Scorer{}.Calculate(sim, answers)` retorna `ScoreResult`. Campos: `Value` (int 0-100), `CorrectCount`, `TotalQuestions`, `Passed`, `ByTopic map[Topic]TopicCounts`.
- `NewScore(result)` → `Score`. Método `score.WeakTopics(threshold float64)` retorna `[]Topic`.
- Não há `Score.Percentage()`, `Score.Total()`, `Score.Correct()` — usar campos de `ScoreResult`.
- `PaywallPolicy.IsAccessible(index int, hasPaid bool)` — `FreeQuestionsLimit = 10` (índices 0–9 gratuitos).
- `QueryKind` válidos: `"por-que"`, `"analogia"`, `"exemplo"`.

### leaderboard/
- `RankEntry` campos: `DisplayName` (não `UserName`), `XPGained` (não `Score`).

### billing/
- Stripe webhook: `stripeEventRepo.MarkProcessed()` ANTES de processar. Se já existe, ignorar silenciosamente.
- `NewHandleStripeWebhookUseCase(purchaseRepo, stripeEventRepo, userRepo, clock)` — esta ordem exata.

---

## Key Design Decisions

**Import cycle solution**: `internal/interfaces/http/httputil/` contém `WriteError` e `WriteJSON`. Tanto `handlers/` quanto `middleware/` importam de `httputil`.

**Server-authoritative scoring**: `StartAttempt` sorteia e grava `question_ids` no servidor; `FinishAttempt` pontua essas questões contra o banco Postgres REAL (`QuestionRepository.FindByIDs`), não mais o catálogo estático embutido (`catalog.json` continua existindo só como fallback quando o Postgres não tem o simulado). O score nunca vem do cliente. `ExamQuestionDTO` (sem `correctId`/`explanation`) é o que o cliente recebe durante a prova; o gabarito só sai depois de `finish`.

**Crédito de XP idempotente por tentativa** (ago/2026): XP/badges/streak são um `GameState` de CLIENTE (localStorage, sync LWW) — não há ledger de XP no servidor. `POST /attempts/{attemptId}/claim-xp` (`ClaimXPCreditUseCase` → `AttemptRepo.ClaimXPCredit`) não calcula XP nenhum; grava `xp_credited_at` atomicamente (`UPDATE ... WHERE user_id=$2 AND finished_at IS NOT NULL AND xp_credited_at IS NULL`) e só a chamada que afeta a linha recebe `claimed:true`. O frontend só concede XP local quando `claimed:true` — fecha o caso de reabrir `/resultado` em outra aba/dispositivo e ganhar XP de novo, que uma chave em `sessionStorage` não cobria (não é compartilhada entre abas).

**Gabarito nunca sai enquanto há prova ativa** (achado P-01, auditoria de 11/ago/2026): `ExamQuestionDTO` no runner sempre esteve correto, mas três rotas LATERAIS (`GET .../study/random`, `GET .../questions`, `GET .../questions/batch?ids=`) serviam `correctId`/`explanation` pra qualquer autenticado, sem checar tentativa ativa nem ownership — o console do navegador durante a prova conseguia ler o gabarito via `fetch`. Corrigido com a função de pacote `hasActiveAttempt(r, attemptRepo, simuladoID)` (`study_handler.go`), usada nas três rotas: com tentativa ativa do simulado, todas devolvem `ExamQuestionDTO` (sem chave), não importa qual delas é chamada. Sem tentativa ativa, `questions/batch` ainda restringe por OWNERSHIP: só ids que pertencem a `QuestionIDs()` de alguma tentativa FINALIZADA do próprio usuário revelam gabarito — `AttemptRepository.ListFinishedByUserAndSimulado` (novo). `study/random`/`questions` sem tentativa ativa continuam plenos (é o modo estudo livre, sem paywall, por desenho). Toda ausência de `attemptRepo`/`userID` no contexto falha FECHADO (trata como "tem tentativa ativa"). Travado por `study_handler_test.go` + `simulado_handler_questions_test.go` (8 casos).

**Magic token**: Redis GETDEL para consumo atômico (anti-replay). TTL = 10 min, teto de 5 ações/email/janela de 10min (`ffv:magic_attempts:<hash>`, `IncrAttempts`/`GetAttempts`) — **compartilhado entre pedir código novo E verificar** (achado P-03, auditoria de 11/ago/2026: até então só `RequestMagicLinkUseCase` incrementava o contador; `VerifyMagicLinkUseCase` nunca chamava `IncrAttempts`, então um código de 6 dígitos era varrível por quem controlasse poucos IPs — o rate-limit de 20/min era por IP, não por email). `VerifyMagicLinkUseCase.WithMaxAttempts(n)` (default 5, `main.go` usa o mesmo `magicMaxAttempts` de `RequestMagicLinkUseCase`) recusa com `ErrRateLimited` ao atingir o teto — inclusive se o código enviado na tentativa que estourou o teto estiver CERTO.

**Refresh token rotation**: Hash SHA-256 no DB; raw token em cookie `ffv_refresh` (HttpOnly + Secure + SameSiteStrict). A cada `POST /auth/refresh` o token antigo é revogado.

**LWW Progress**: `SyncPushUseCase` compara `clientUpdatedAt` com `serverUpdatedAt`. Retorna `ErrConflict` se servidor é mais recente.

**Race condition em StartAttempt**: `UNIQUE (user_id, simulado_id, status)` no DB. Se `Save()` retorna `ErrConflict`, o UC busca a attempt ativa existente (retry otimista).

**Anthropic SDK v1.37**: `anthropic.NewClient()` retorna valor (não ponteiro). Sem `anthropic.F()` wrapper — usar atribuição direta. `System` é `[]anthropic.TextBlockParam{{Text: "..."}}`.

**Redis Pinger**: `*goredis.Client.Ping()` retorna `*StatusCmd`, não `error`. `redisPingerAdapter` em `main.go` adapta para `handlers.Pinger`.

**Audit log**: Middleware async que registra HTTP mutations (POST/PATCH/PUT/DELETE) sem bloquear o request path. Armazena actor, IP, path, status, latência. Inserção passa por um `auditWorker` — canal com capacidade 256 processado por UMA goroutine dedicada por instância do middleware (não uma goroutine nova por request); fila cheia descarta com log em vez de crescer sem limite (achado P-15, ago/2026). Por padrão só registra 2xx; `AuditLog(repo, AuditLogOptions{IncludeFailures: true})` também registra 4xx/5xx — usado em `/api/v1/auth/*` (tentativa de login falha) e no webhook Stripe (assinatura rejeitada), que até ago/2026 não tinham NENHUMA trilha porque ficam fora do grupo autenticado onde o `AuditLog` original rodava (achado P-13). `X-Request-ID` fornecido pelo cliente é validado por regex (`^[a-zA-Z0-9-]{1,64}$`) em `RequestID` antes de entrar no contexto — um valor com quebra de linha era log/audit injection contra consumidores de log em texto puro.

**Prometheus metrics**: `GET /metrics` exposto publicamente. Instrumentado via `MetricsMW` no router. Métricas: request count, duration histogram, inflight por handler. Label de rota usa `RoutePattern()` do chi (baixa cardinalidade); quando vem vazio (404 real, rota não casada) usa o valor fixo `"unmatched"`, nunca o path cru — path cru dava uma série temporal nova a cada sonda de bot (`/wp-admin`, `/.env`, achado P-15, ago/2026). ACL de rede em `172.16.0.0/12` no Nginx é mais larga que o necessário mas mantida — não há coletor Prometheus real rodando ainda; decisão documentada em `api.conf`.

**OpenTelemetry**: `telemetry.Setup()` em `main.go`. Exporta traces via OTLP gRPC para endpoint configurado. Se `OTEL_EXPORTER_OTLP_ENDPOINT` vazio → NoopProvider (zero overhead).

---

## Environment Variables

`required:"true"` causa panic em startup se ausente. Em testes use `config.LoadTest()`.

| Var | Required | Default | Descrição |
|-----|----------|---------|-----------|
| `DATABASE_URL` | ✓ | — | Postgres DSN completo |
| `REDIS_URL` | ✓ | — | Redis DSN |
| `JWT_SECRET` | ✓ | — | >= 32 chars (validado em startup) |
| `STRIPE_SECRET_KEY` | condicional | — | sk_live_... — obrigatório só quando `FEATURE_BILLING_ENABLED=true` (validado no boot; doc dizia "sempre obrigatório", código nunca exigiu — corrigido em ago/2026 fazendo o boot falhar de verdade quando a feature está ligada e o segredo ausente) |
| `STRIPE_WEBHOOK_SECRET` | condicional | — | whsec_... — mesma regra de `STRIPE_SECRET_KEY` |
| `RESEND_API_KEY` | ✓ | — | re_... |
| `TWILIO_ACCOUNT_SID` | — | — | AC... — sem enforcement no config; phone auth real depende de `FEATURE_PHONE_AUTH_ENABLED` |
| `TWILIO_AUTH_TOKEN` | — | — | — |
| `TWILIO_FROM_NUMBER` | — | — | E.164 format |
| `ANTHROPIC_API_KEY` | condicional | — | sk-ant-... — obrigatório só quando `FEATURE_TUTOR_AI_ENABLED=true` (mesma correção acima) |
| `APP_ENV` | — | `development` | `development`\|`production`\|`test` |
| `AUTH_DEV_BYPASS_ENABLED` | — | `false` | Liga o código fixo `000000` (autentica qualquer email sem Redis). **Nunca `true` fora de `APP_ENV=development`** — o boot recusa subir nessa combinação (`config.validate()`). Antes dependia implicitamente de `APP_ENV=="development"`, que é o próprio default de `APP_ENV` — corrigido em ago/2026 |
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

## Database Schema (24 migrations)

| Migration | Tabela / Alteração | Destaques |
|-----------|--------------------|-----------|
| 000001 | `users` | soft-delete `deleted_at`, UNIQUE email, UNIQUE `referral_id` |
| 000002 | `user_products` | PK `(user_id, product_id)`, N:M com purchases |
| 000003 | `refresh_tokens` | `token_hash` UNIQUE, `revoked_at` nullable |
| 000004 | `simulado_attempts` | JSONB answers/review_flags/score, UNIQUE `(user_id, simulado_id, status)` |
| 000005 | `progress_snapshots` | PK `user_id`, JSONB state, LWW via updated_at |
| 000006 | `certificates` | PK hash SHA-256, UNIQUE `attempt_id` |
| 000007 | `purchases` | UNIQUE `stripe_session_id`, status `pending→paid\|failed→refunded` |
| 000008 | `stripe_events` | PK `stripe_event_id` — idempotência de webhooks |
| 000009 | `referrals` | UNIQUE `(referrer_id, referred_id)` |
| 000010 | `leaderboard` | PK `(user_id, week_start)`, `week_start` = segunda-feira UTC |
| 000011 | `analytics_events` | JSONB payload, fire-and-forget |
| 000012 | `certificates` | Fix no schema de score |
| 000013 | `leaderboard_opt_ins` | Opt-in explícito no ranking |
| 000014 | alinhamento | `simulado_attempts` + `progress_snapshots` schema sync |
| 000015 | indexes | Performance indexes (FK, status, week_start) |
| 000016 | `audit_logs` | HTTP mutation trail: actor, IP, path, status, latência |
| 000017 | `question_reports` | Reporte de questões pelos usuários |
| 000018 | alinhamento | `users` + `stripe_events` schema sync |
| 000019 | `users` | Role default = `"user"` |
| 000020 | `users` | Google OAuth fields (google_id, avatar_url) |
| 000021 | `audit_logs` | Campos adicionais no audit trail |
| 000022 | indexes | Indexes de performance adicionais |
| 000023 | `articles` | Currículo persistido: slug, title, content, category, published_at |
| 000024 | `users` | UNIQUE constraint em `phone` |

---

## Test Patterns

**0 falhas é o único resultado aceitável.** O CI roda todos os tipos e bloqueia o deploy se qualquer um falhar. Load tests (`test/load/`) são a única exceção — rodam apenas localmente.

### Sequência obrigatória antes de declarar "pronto"

```bash
go build ./...                 # compila sem erro
make lint                      # 0 warnings
make test-unit                 # domain + application — sem Docker
make test-contract             # HTTP contract — sem Docker
make test-security             # CORS, JWT, timing, IDOR
go test ./test/integration/... -tags integration -timeout 180s  # requer Docker
make test-cover                # gera coverage.html
```

### Categorias

| Categoria | Localização | Requer Docker | O que cobre |
|-----------|-------------|:-------------:|-------------|
| **Unit** | `internal/domain/...` + `internal/application/...` | Não | Regras de negócio, mocks inline |
| **Contract** | `test/contract/` | Não | HTTP handlers via `httptest.NewRecorder()` |
| **Security** | `test/security/` | Não | CORS, JWT tampering, magic token timing, IDOR |
| **Integration** | `test/integration/` | **Sim** | Repos reais com testcontainers-go |
| **Load** | `test/load/` | Não (k6) | smoke, auth, simulados, progress, tutor — só local |

**Naming**: `Test_<Type>_<Method>_<Scenario>_<Expected>` — ex: `Test_Scorer_Calculate_AllCorrect_Returns100`.

**Unit tests**: inline mocks — struct implementa o port, sem gomock. Ver `internal/application/simulado/finish_attempt_test.go`.

**Config em testes**: `config.LoadTest()` — required fields preenchidos com dummies, sem env vars.

---

## CI/CD (GitHub Actions)

### Fluxo completo

```
git push main
  → .github/workflows/ci.yml (testes + lint + build)
  → .github/workflows/deploy.yml (se CI passou)
      ├── build-push:           Docker backend  → ghcr.io/feh-franc0/ffv-api:sha-<hash>
      ├── build-push-frontend:  Docker frontend → ghcr.io/feh-franc0/ffv-frontend:sha-<hash>
      └── deploy-backend (também deploya frontend): SCP files → SSH VPS → /opt/ffv/bin/deploy.sh
```

> Desde `845eddb` (15/mai), o frontend deixou de ser static export via FTP Hostinger e passou a ser SSR Docker rodando na mesma VPS do backend. Ver [`../frontend/CLAUDE.md`](../frontend/CLAUDE.md) e [README raiz](../README.md#migração-dnsssl-pendente).

### deploy.sh (roda na VPS)

1. Login no GHCR com `GHCR_TOKEN`
2. `docker pull ghcr.io/feh-franc0/ffv-api:$IMAGE_TAG` + (se `FRONTEND_TAG` setado) `docker pull ghcr.io/feh-franc0/ffv-frontend:$FRONTEND_TAG`
3. Salva tag atual em `/opt/ffv/.current_tag` (para rollback)
4. Sobe postgres + redis se não estiverem rodando
5. Roda migrations: `migrate -path /opt/ffv/migrations -database $DATABASE_URL up`
   - `DATABASE_URL` tem `@postgres:` trocado por `@localhost:` (loopback do host)
   - Inclui `000041_seed_clf_questions` e `000042_reseed_clf_questions_v2` (1015 questões CLF idempotentes via ON CONFLICT DO UPDATE)
6. `docker compose up -d --no-deps --pull never --scale api=2 api` + `up -d --no-deps frontend` (se `FRONTEND_TAG` setado)
7. Health check: aguarda `docker inspect --health.Status == healthy` para api e frontend (máx 120s cada)
8. Sucesso: atualiza nginx + prune de imagens antigas
9. Falha: rollback automático para tag anterior

### Gate de deploy — `DEPLOY_ENABLED`

O `deploy.yml` verifica `vars.DEPLOY_ENABLED` antes de qualquer coisa. Enquanto a VPS não estiver configurada, push para `main` roda o CI normalmente mas **pula o deploy sem erro**.

**Importante:** `DEPLOY_ENABLED` é uma **Repository Variable** (não secret) — por isso pode ser checada em condições `if:`. Secrets não podem ser usados em condições.

```
# Enquanto a infra não estiver pronta:
vars.DEPLOY_ENABLED  →  não setar (ou "false")   → CI passa, deploy ignorado

# Quando VPS + secrets estiverem configurados:
vars.DEPLOY_ENABLED  →  "true"                   → CI passa, deploy roda
```

Para ativar: GitHub → Settings → Variables → Actions → New repository variable → `DEPLOY_ENABLED` = `true`

### Secrets necessários no GitHub (Settings → Secrets → Actions)

```
VPS_HOST                 → IP da VPS Hostinger
VPS_USER                 → usuário SSH (ex: deploy)
VPS_SSH_KEY              → chave privada ed25519
VPS_PORT                 → 22
NEXT_PUBLIC_API_BASE_URL → https://api.fernandofrancovalle.com
HOSTINGER_FTP_SERVER     → servidor FTP Hostinger
HOSTINGER_FTP_USERNAME   → usuário FTP
HOSTINGER_FTP_PASSWORD   → senha FTP
HOSTINGER_FTP_DIR        → /public_html/
```

### Setup inicial da VPS

```bash
# Na VPS, como root (uma única vez):
bash scripts/vps-setup.sh

# Editar manualmente com os segredos reais:
nano /opt/ffv/.env
```

---

## Docker de Produção

**`deployments/docker-compose.prod.yml`** — 4 serviços:

- **nginx** (`:80` e `:443`) — proxy reverso, TLS 1.2/1.3, rate-limit, HSTS
- **api** — imagem `ghcr.io/feh-franc0/ffv-api:${IMAGE_TAG:-latest}`, healthcheck via `/api --healthcheck`
- **postgres** — exposto em `127.0.0.1:5432` apenas (loopback, para migrations do host)
- **redis** — com senha, `maxmemory 256mb allkeys-lru`

**Redes:**
- `proxy` — nginx ↔ api (com portas públicas)
- `data` (`internal: true`) — api ↔ postgres ↔ redis (sem acesso externo)

**`/opt/ffv/.env`** nunca entra no repositório. Criado manualmente na VPS com `vps-setup.sh`.

**Imagens base pinadas por digest** (achado P-12, ago/2026): `golang`, `gcr.io/distroless/static-debian12`, `node` (frontend), `nginx`, `postgres`, `redis` referenciam `@sha256:...`, não tag flutuante — Dependabot (`docker` ecosystem, `/backend/deployments` e `/frontend`) mantém o digest atualizado. `mailhog` (só dev) não é pinado.

**Nginx — três endurecimentos de ago/2026** (achado P-12): (1) `frontend.conf` passou a sobrescrever `X-Forwarded-For` com `$remote_addr`, igual a `api.conf` — antes usava `$proxy_add_x_forwarded_for`, que ANEXA ao valor do cliente; (2) `ssl_ciphers` trocou de `HIGH:!aNULL:!MD5` (lista aberta, muda com a versão do OpenSSL da imagem) para uma lista Mozilla "Intermediate" explícita nos dois vhosts; (3) `conf.d/default.conf` novo — `default_server` em 443 via `ssl_reject_handshake on` (rejeita na camada de SNI, sem cert dummy) e em 80 retornando 444, para Host/SNI não reconhecido. Sem isso o "vhost default" era uma função acidental da ordem alfabética de `include conf.d/*.conf` (api.conf antes de frontend.conf).

---

## Adding a New Endpoint

1. Defina port/interface em `internal/domain/<ctx>/repository.go`.
2. Implemente use case em `internal/application/<ctx>/`. Recebe Command struct, retorna Result struct + error.
3. Implemente infra em `internal/infrastructure/persistence/postgres/` (ou redis/).
4. Adicione método no handler em `internal/interfaces/http/handlers/<ctx>_handler.go`. Use `handlers.HandleDomainError(w, err)` para mapear erros de domínio → HTTP.
5. Registre rota em `internal/interfaces/http/router.go` (body limit + rate-limit se necessário).
6. Wire tudo em `cmd/api/main.go` (único lugar com injeção de dependência manual).

---

## Error Responses

RFC 7807 Problem+JSON. `httputil.WriteError(w, status, detail, type)` produz:
```json
{"type": "...", "title": "...", "status": 400, "detail": "..."}
```

`handlers.HandleDomainError(w, err)` mapeia automaticamente:
- `ErrNotFound` → 404
- `ErrUnauthorized` → 401
- `ErrForbidden` → 403
- `ErrConflict` → 409
- `ErrValidation` → 400
- `ErrRateLimited` → 429
- qualquer outro → 500

---

## 📌 Endpoints públicos novos (mai/2026)

Adicionados para suportar o redesign da home com social proof real e ranking público.

### `GET /api/v1/stats` (público, cache 60s)
Handler: `internal/interfaces/http/handlers/stats_handler.go`. Query Postgres direto (sem domain layer — é um stats simples). Retorna:
```json
{ "totalUsers": 0, "activeWeekly": 0, "totalXpAwarded": 0 }
```

### `GET /api/v1/leaderboard/public?period=weekly|monthly|yearly|all-time&limit=N` (público, cache 60s)
Top-N anonimizado (userID vazio). Default: weekly, 10 entradas, max 100. Retorna `periodStart` e `periodEnd` em RFC 3339 para o cliente exibir "ranking de maio".

### `GET /api/v1/leaderboard/me/all` (autenticado)
Rank do usuário em todos os 4 períodos:
```json
{ "ranks": [
  { "period": "weekly", "rank": 5, "xp": 320 },
  { "period": "monthly", "rank": 12, "xp": 1100 },
  { "period": "yearly", "rank": 28, "xp": 4500 },
  { "period": "all-time", "rank": 35, "xp": 6200 }
]}
```

### Domain `internal/domain/leaderboard/leaderboard.go`
- `Period` enum (`weekly`, `monthly`, `yearly`, `all-time`)
- `IsValidPeriod(s string) bool`
- `PeriodWindow(p, now) (start, end)` — janela em UTC
- `Repository` agora tem `GetByPeriod` e `GetUserRankByPeriod`

### Implementação SQL
- `GetByPeriod`: usa CTE com `SUM(xp_gained)` e `JOIN leaderboard_opt_ins`. Helper `nullableTime(t)` permite janela aberta no all-time.
- `GetUserRankByPeriod`: mesma CTE com `RANK() OVER (ORDER BY xp_total DESC)` em outer, filtro por user_id.

---

## 🚀 Deploy e Infraestrutura

### Onde o backend roda

| Item | Detalhe |
|------|---------|
| **Provedor** | Hostinger VPS KVM 2 |
| **IP público** | `72.60.28.82` |
| **Datacenter** | Estados Unidos — Boston (latência ~120ms para BR) |
| **OS** | Ubuntu 24.04 LTS |
| **Hostname** | `srv1660277` |
| **Recursos** | 2 vCPU / 8 GB RAM / 100 GB NVMe / 8 TB banda |
| **Domínio API** | `api.fernandofrancovalle.com` (DNS já apontado ✅) |
| **Domínio frontend (depois da migração DNS)** | `fernandofrancovalle.com` + `www.fernandofrancovalle.com` (mesma VPS, host-routing no Nginx) |
| **SSH** | `ssh deploy@72.60.28.82` (usuário `deploy`, chave ed25519) |

> **⚠️ Frontend Docker roda na MESMA VPS** desde `845eddb`. Nginx faz host-based routing: `api.*` → API Go; `www`/root → frontend Next standalone. **Migração DNS+SSL pendente** para o domínio raiz e www — ver [README raiz](../README.md#migração-dnsssl-pendente).

### Arquitetura Docker no VPS

```
Internet :443/:80
    │
  Nginx (container) — TLS Let's Encrypt, rate limiting, HSTS
    │
    ├── server_name api.fernandofrancovalle.com
    │     upstream api_backend (round-robin, max_fails=3, proxy_next_upstream)
    │     ├── api_1:8080  ← réplica 1 (healthcheck /healthz a cada 15s)
    │     └── api_2:8080  ← réplica 2 (healthcheck /healthz a cada 15s)
    │
    └── server_name fernandofrancovalle.com www.fernandofrancovalle.com
          upstream frontend_backend
          └── frontend:3000  ← Next.js standalone (healthcheck /api/health)
                              cache de /_next/static/ pelo Nginx

(rede data — internal: true, sem acesso externo)
    ├── postgres:5432  (exposto em 127.0.0.1:5432 pro migrate CLI)
    └── redis:6379

Volumes persistentes: postgres_data, redis_data, certbot_webroot
```

**Fault tolerance:** se uma réplica da API travar, Nginx detecta via `max_fails` e roteia 100% para a outra. Docker reinicia a réplica com problema automaticamente (`restart: unless-stopped`). Usuário não percebe.

**Resource limits por container:**
- API (×2): 512 MB / 0.8 CPU cada
- Postgres: 512 MB / 0.8 CPU
- Redis: 320 MB / 0.3 CPU
- Total: ~1.9 GB — dentro dos 8 GB do KVM 2

### Como o deploy funciona (automático)

```
git push main
  → CI passa (.github/workflows/ci.yml)
  → .github/workflows/deploy.yml dispara
      └── build-push:
            1. Docker build multi-stage (golang:1.25-alpine → distroless)
            2. Push para ghcr.io/feh-franc0/ffv-api:sha-<hash>
      └── deploy-backend:
            1. SCP: docker-compose.prod.yml + nginx conf + migrations → VPS /tmp/
            2. SSH: executa /opt/ffv/bin/deploy.sh na VPS
               a. docker pull nova imagem
               b. salva tag anterior (para rollback)
               c. sobe postgres + redis se necessário
               d. migrate -path /opt/ffv/migrations up
               e. docker compose up --scale api=2 --no-deps api
               f. health check (aguarda ≥1 réplica healthy, máx 120s)
               g. sucesso → atualiza nginx
               h. falha → rollback automático para tag anterior
```

### Setup inicial da VPS (roda UMA vez como root)

```bash
ssh root@72.60.28.82
bash scripts/vps-setup.sh
# Responde: domínio = api.fernandofrancovalle.com, email LE, usuário = deploy
nano /opt/ffv/.env   # preenche com valores reais (ver .env.template)
```

### Acesso SSH ao VPS

```bash
ssh deploy@72.60.28.82          # usuário de deploy (não-root)
ssh root@72.60.28.82            # root (só para setup inicial)
```

### Comandos úteis no VPS

```bash
# Ver logs da API em tempo real
docker compose -f /opt/ffv/docker-compose.prod.yml logs -f api

# Ver status de todos os containers
docker compose -f /opt/ffv/docker-compose.prod.yml ps

# Reiniciar API manualmente
docker compose -f /opt/ffv/docker-compose.prod.yml restart api

# Ver saúde das réplicas
docker compose -f /opt/ffv/docker-compose.prod.yml ps api

# Rollback manual para tag anterior
PREVIOUS=$(cat /opt/ffv/.current_tag)
IMAGE_TAG=$PREVIOUS docker compose -f /opt/ffv/docker-compose.prod.yml up -d --no-deps --scale api=2 api

# Rodar migration manualmente
source /opt/ffv/.env
migrate -path /opt/ffv/migrations -database "$DATABASE_URL" up
```

### GitHub Secrets necessários (Settings → Secrets → Actions)

| Secret | Valor |
|--------|-------|
| `VPS_HOST` | `72.60.28.82` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | chave privada ed25519 do usuário deploy |
| `VPS_PORT` | `22` |
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.fernandofrancovalle.com` |

> Secrets antigos do FTP (`HOSTINGER_FTP_SERVER`, `HOSTINGER_FTP_USERNAME`, `HOSTINGER_FTP_PASSWORD`, `HOSTINGER_FTP_DIR`) foram aposentados em `845eddb` e podem ser deletados do repo. O frontend agora é Docker SSR na VPS.

### Ativar deploy automático

Por padrão o deploy está **desativado** até a infra estar configurada.
Para ativar: GitHub → Settings → Variables → Actions → `DEPLOY_ENABLED` = `true`

### Arquivos de deploy no repositório

| Arquivo | Descrição |
|---------|-----------|
| `deployments/Dockerfile` | Multi-stage: golang:1.25-alpine → distroless/static-debian12:nonroot |
| `deployments/docker-compose.prod.yml` | Produção: nginx + api(×2) + postgres + redis |
| `deployments/docker-compose.yml` | Dev local: api + postgres + redis + mailhog |
| `deployments/nginx/nginx.conf` | Config base Nginx: gzip, rate-limit zones |
| `deployments/nginx/conf.d/api.conf` | Virtual host HTTPS + upstream com fault tolerance |
| `scripts/vps-setup.sh` | Setup inicial da VPS (roda uma vez) |
| `scripts/deploy.sh` | Deploy script (chamado pelo GitHub Actions via SSH) |

### Healthcheck do binário (`--healthcheck`)

O binário Go suporta a flag `--healthcheck`:
```bash
/api --healthcheck   # faz GET /healthz, sai com 0 (ok) ou 1 (falha)
```
Usado pelo Docker `HEALTHCHECK CMD` no Dockerfile e no docker-compose.
Necessário porque a imagem distroless não tem curl/wget/shell.

---

## 📚 Referências cross-projeto

- [`../CLAUDE.md`](../CLAUDE.md) — visão monorepo
- [`../CHANGELOG_PLATFORM_2026-05.md`](../CHANGELOG_PLATFORM_2026-05.md) — todas as mudanças de maio/2026 (frontend + backend)
- [`PLAN.md`](./PLAN.md) — plano detalhado de iteração da API
- [`../frontend/CLAUDE.md`](../frontend/CLAUDE.md) — deploy e infra do frontend (SSR Docker na mesma VPS)
- [`../README.md#migração-dnsssl-pendente`](../README.md#migração-dnsssl-pendente) — passo a passo da migração DNS+SSL pendente
