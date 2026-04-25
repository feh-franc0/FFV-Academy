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

**Rate-limits por IP (Redis-backed):**
- auth: 20 req/min
- tutor: 60 req/min
- cert verify: 120 req/min

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

**Server-authoritative scoring**: catálogo embebido via `//go:embed catalog.json`. O score nunca vem do cliente.

**Magic token**: Redis GETDEL para consumo atômico (anti-replay). TTL = 10 min, rate limit = 5/email/janela.

**Refresh token rotation**: Hash SHA-256 no DB; raw token em cookie `ffv_refresh` (HttpOnly + Secure + SameSiteStrict). A cada `POST /auth/refresh` o token antigo é revogado.

**LWW Progress**: `SyncPushUseCase` compara `clientUpdatedAt` com `serverUpdatedAt`. Retorna `ErrConflict` se servidor é mais recente.

**Race condition em StartAttempt**: `UNIQUE (user_id, simulado_id, status)` no DB. Se `Save()` retorna `ErrConflict`, o UC busca a attempt ativa existente (retry otimista).

**Anthropic SDK v1.37**: `anthropic.NewClient()` retorna valor (não ponteiro). Sem `anthropic.F()` wrapper — usar atribuição direta. `System` é `[]anthropic.TextBlockParam{{Text: "..."}}`.

**Redis Pinger**: `*goredis.Client.Ping()` retorna `*StatusCmd`, não `error`. `redisPingerAdapter` em `main.go` adapta para `handlers.Pinger`.

**Audit log**: Middleware async que registra HTTP mutations (POST/PATCH/PUT/DELETE) sem bloquear o request path. Armazena actor, IP, path, status, latência.

**Prometheus metrics**: `GET /metrics` exposto publicamente. Instrumentado via `MetricsMW` no router. Métricas: request count, duration histogram, inflight por handler.

**OpenTelemetry**: `telemetry.Setup()` em `main.go`. Exporta traces via OTLP gRPC para endpoint configurado. Se `OTEL_EXPORTER_OTLP_ENDPOINT` vazio → NoopProvider (zero overhead).

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
      ├── build-push: Docker → ghcr.io/feh-franc0/ffv-api:sha-<hash>
      ├── deploy-backend: SCP files → SSH VPS → /opt/ffv/bin/deploy.sh
      └── deploy-frontend: npm build → FTP Hostinger
```

### deploy.sh (roda na VPS)

1. Login no GHCR com `GHCR_TOKEN`
2. `docker pull ghcr.io/feh-franc0/ffv-api:$IMAGE_TAG`
3. Salva tag atual em `/opt/ffv/.current_tag` (para rollback)
4. Sobe postgres + redis se não estiverem rodando
5. Roda migrations: `migrate -path /opt/ffv/migrations -database $DATABASE_URL up`
   - `DATABASE_URL` tem `@postgres:` trocado por `@localhost:` (loopback do host)
6. `docker compose up -d --no-deps api` (pull never — usa imagem já baixada)
7. Health check: aguarda `docker inspect --health.Status == healthy` (máx 120s)
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
