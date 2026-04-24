# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Documentação complementar

- `api/openapi.yaml` — contrato OpenAPI 3.1 (todas as rotas, schemas, errors).
- `docs/ARCHITECTURE.md` — camadas DDD, fluxos críticos (auth, finish→cert, webhook), decisões-chave.
- `docs/RUNBOOK.md` — setup local, migrations em prod, rotação de secrets, webhook travado, backup, SLOs.
- `docs/TESTING.md` — pirâmide de testes, comandos, coverage targets, exemplos por camada.
- `docs/SECURITY.md` — threat model STRIDE, controles, checklist de PR review, política de secrets.

## Commands

```bash
# Build & Run
make build          # Compila para bin/api
go build ./...      # Verifica se compila (zero saída = ok)
make run            # go run ./cmd/api
make run-watch      # air (hot reload)

# Tests
make test           # Todos os testes (120s timeout)
make test-unit      # Domain + Application (sem Docker)
make test-contract  # HTTP contract tests (sem Docker)
make test-integration  # Requer Docker (testcontainers)
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
make migrate-reset  # Drop + aplica tudo
make migrate-status # Versão atual

# Docker (local dev)
make docker-up      # Sobe postgres + redis + mailhog
make docker-down
make docker-build   # Builda imagem ffv-api:latest

# CI local
make ci             # lint + test-unit + test-cover
```

## Architecture

**Clean Architecture + DDD** — dependências sempre apontam para dentro (domínio não importa infra).

```
cmd/api/main.go          ← Composition Root (único lugar com deps concretas)
internal/
  domain/                ← Regras de negócio puras (zero imports de infra)
    shared/              ← Typed IDs, Clock interface, sentinel errors, DomainError
    identity/            ← User (aggregate), Email, Phone (VOs), MagicToken, Role, RefreshToken
    simulado/            ← Attempt (aggregate), Simulado, Score (VO), Scorer (domain service), PaywallPolicy
    certificate/         ← Certificate (aggregate, hash SHA-256 determinístico)
    billing/             ← Purchase (aggregate), status machine, PaymentProvider port
    progress/            ← ProgressSnapshot (JSONB blob, LWW policy)
    leaderboard/         ← RankEntry, WeekStart()
    tutor/               ← Query, TutorResponse (só ports, sem aggregate)
  application/           ← Use cases (orquestram domain + ports)
    identity/            ← RequestMagicLink, VerifyMagicLink, Refresh, Logout, GetProfile, UpdateProfile, DeleteAccount
    simulado/            ← StartAttempt, AnswerQuestion, ToggleReviewFlag, FinishAttempt, ResumeAttempt, ListAttempts
    billing/             ← CreateCheckout, HandleStripeWebhook
    progress/            ← SyncPush, SyncPull
    certificate/         ← IssueCertificate, GetCertificate, ListCertificates
    leaderboard/         ← GetWeeklyRanking, GetMyRank
    tutor/               ← AskTutor
    admin/               ← GetStats
  infrastructure/        ← Implementações concretas
    persistence/postgres/← user_repo, attempt_repo, certificate_repo, purchase_repo, etc.
    persistence/redis/   ← token_store (magic tokens), tutor_cache
    auth/                ← JWTService (access + refresh tokens)
    ai/                  ← ClaudeClient (anthropic-sdk-go v1.37)
    catalog/             ← StaticCatalogProvider (//go:embed catalog.json)
    email/               ← ResendClient
    sms/                 ← TwilioClient
    payment/             ← StripeClient
  interfaces/http/
    handlers/            ← Um handler por bounded context
    middleware/          ← RequestID, Logger, Recover, CORS, SecurityHeaders, Authenticate, RequireAdmin
    httputil/            ← WriteError/WriteJSON/ProblemJSON (evita import cycle)
    router.go            ← chi.Router com todas as rotas
    server.go            ← http.Server com graceful shutdown
  config/                ← envconfig (12-factor, fail-fast em startup)
  platform/logger/       ← slog (JSON em prod, text em dev)
migrations/              ← SQL files (golang-migrate, numerados 000001-)
```

## API Routes

| Método | Path | Auth | Handler |
|--------|------|------|---------|
| GET | `/healthz` | — | Health.Liveness |
| GET | `/readyz` | — | Health.Readiness |
| GET | `/api/v1/simulados` | — | Simulado.ListSimulados |
| GET | `/api/v1/simulados/{simuladoId}` | — | Simulado.GetSimulado |
| GET | `/api/v1/certificates/{hash}` | — | Certificate.VerifyCertificate |
| POST | `/api/v1/auth/request-token` | — | Auth.RequestToken |
| POST | `/api/v1/auth/verify` | — | Auth.Verify |
| POST | `/api/v1/auth/refresh` | — | Auth.Refresh |
| POST | `/api/v1/auth/logout` | JWT | Auth.Logout |
| GET | `/api/v1/me` | JWT | Auth.GetProfile |
| PATCH | `/api/v1/me` | JWT | Auth.UpdateProfile |
| DELETE | `/api/v1/me` | JWT | Auth.DeleteAccount |
| GET | `/api/v1/me/certificates` | JWT | Certificate.ListCertificates |
| POST | `/api/v1/simulados/{simuladoId}/attempts` | JWT | Simulado.StartAttempt |
| GET | `/api/v1/simulados/{simuladoId}/attempts/active` | JWT | Simulado.ResumeAttempt |
| GET | `/api/v1/attempts` | JWT | Simulado.ListAttempts |
| POST | `/api/v1/attempts/{attemptId}/answers` | JWT | Simulado.AnswerQuestion |
| POST | `/api/v1/attempts/{attemptId}/flags/{questionId}` | JWT | Simulado.ToggleReviewFlag |
| POST | `/api/v1/attempts/{attemptId}/finish` | JWT | Simulado.FinishAttempt |
| GET | `/api/v1/progress` | JWT | Progress.Pull |
| PUT | `/api/v1/progress` | JWT | Progress.Push |
| POST | `/api/v1/certificates` | JWT | Certificate.IssueCertificate |
| POST | `/api/v1/billing/checkout` | JWT | Billing.CreateCheckout |
| POST | `/api/v1/webhooks/stripe` | Stripe sig | Billing.StripeWebhook |
| POST | `/api/v1/tutor/ask` | JWT | Tutor.Ask |
| GET | `/api/v1/leaderboard` | JWT | Leaderboard.GetWeekly |
| GET | `/api/v1/leaderboard/me` | JWT | Leaderboard.GetMyRank |
| GET | `/api/v1/admin/stats` | JWT + admin | Admin.GetStats |

## Domain Invariants & Naming

### shared/
- Typed IDs: `UserID`, `AttemptID`, `CertificateHash`, `PurchaseID`, `ProductID`, `SimuladoID`, `QuestionID`, `ReferralID` — todos são `type X string`. Nunca usar string raw nas assinaturas de domínio.
- `shared.Clock` interface com `Now() time.Time`. Implementações: `RealClock{}` e `FixedClock{T: time.Time}`.
- Sentinel errors: `ErrNotFound`, `ErrUnauthorized`, `ErrForbidden`, `ErrConflict`, `ErrValidation`, `ErrRateLimited`. Usar `errors.Is()` para checar em qualquer camada.
- `DomainError{Err: sentinel, Message: string}` — para mensagens contextuais com `errors.Is()` funcionando.

### identity/
- Roles: `RoleUser = "user"`, `RoleAdmin = "admin"` (nunca `RoleStudent`).
- `NewUser(id, email, phone, name, marketingConsent, referralID, now)` retorna `(*User, UserCreatedEvent, error)`.
- `ReconstituteUser(...)` — função com nome qualificado para não colidir com `Reconstitute(...)` do `magic_token.go` (ambos no mesmo package `identity`).
- `user.PaidProducts()` — não `Products()`. Retorna `[]ProductEntry`.
- `user.HasProduct(productID)` para verificar acesso.
- `RefreshToken` tem campos públicos: `ID`, `UserID`, `TokenHash`, `ExpiresAt`, `CreatedAt`, `RevokedAt`.
- `MagicToken`: `GenerateMagicToken(ttl, now)` → 6 dígitos numéricos (crypto/rand). `Reconstitute(value, expiresAt)` para reconstrução. `token.Matches(input)` e `token.IsExpired(now)`.

### simulado/
- `Attempt` aggregate: `StartAttempt(id, userID, simID, timeLimitMin, now)`, `attempt.AnswerQuestion(qID, optID, now)`, `attempt.ToggleReviewFlag(qID, now)`, `attempt.Finish(score, now)`.
- `attempt.Deadline()` — não `ExpiresAt()`.
- `attempt.Answers()` retorna `Answers` (collection). Métodos: `answers.ToMap()` e `answers.Count()` — não `All()` / `Len()`.
- `attempt.IsFinished()` bool — o campo `status` do DB é derivado disso.
- `Scorer{}.Calculate(sim, answers)` retorna `ScoreResult`. Campos: `Value` (int 0-100), `CorrectCount`, `TotalQuestions`, `Passed`, `ByTopic map[Topic]TopicCounts`.
- `NewScore(result)` → `Score`. Método `score.WeakTopics(threshold float64)` retorna `[]Topic`.
- Não há `Score.Percentage()`, `Score.Total()`, `Score.Correct()` — usar `ScoreResult.Value`, `ScoreResult.TotalQuestions()`, `ScoreResult.CorrectCount()`.
- `PaywallPolicy.IsAccessible(index int, hasPaid bool)` — `FreeQuestionsLimit = 10` (índices 0–9 são gratuitos).
- `QueryKind` válidos: `"por-que"`, `"analogia"`, `"exemplo"` (não `explain_correct`/`hint`).

### leaderboard/
- `RankEntry` campos: `DisplayName` (não `UserName`), `XPGained` (não `Score`). Sem campo `SimuladoID`.

### billing/
- Stripe webhook idempotência: `stripeEventRepo.MarkProcessed()` ANTES de processar. Se já existe, ignorar silenciosamente.
- `NewHandleStripeWebhookUseCase(purchaseRepo, stripeEventRepo, userRepo, clock)` — esta ordem exata.

## Key Design Decisions

**Import cycle solution**: `internal/interfaces/http/httputil/` contém `WriteError` e `WriteJSON`. Tanto `handlers/` quanto `middleware/` importam de `httputil` em vez de um do outro.

**Server-authoritative scoring**: catálogo embebido via `//go:embed catalog.json` em `infrastructure/catalog/`. O score nunca vem do cliente — sempre calculado em `FinishAttemptUseCase`.

**Magic token**: Redis GETDEL para consumo atômico (anti-replay). TTL = 10 min, rate limit = 5 tentativas/email/janela.

**Refresh token rotation**: Hash SHA-256 guardado na DB; raw token vai para cookie `ffv_refresh` (HttpOnly + Secure + SameSiteStrict). A cada `POST /auth/refresh` o token antigo é revogado e um novo é emitido.

**LWW Progress**: `SyncPushUseCase` compara `clientUpdatedAt` com `serverUpdatedAt`. Retorna `ErrConflict` se servidor é mais recente.

**Race condition em StartAttempt**: `UNIQUE (user_id, simulado_id, status)` no DB. Se `Save()` retorna `ErrConflict`, o UC busca a attempt ativa existente (retry otimista).

**Anthropic SDK v1.37**: `anthropic.NewClient()` retorna valor (não ponteiro). Sem `anthropic.F()` wrapper — usar atribuição direta de campos em `MessageNewParams`. `System` é `[]anthropic.TextBlockParam{{Text: "..."}}`.

**Redis Pinger**: `*goredis.Client.Ping()` retorna `*StatusCmd`, não `error`. Em `main.go` há `redisPingerAdapter` que adapta para a interface `handlers.Pinger`.

## Environment Variables

Campos marcados como `required:"true"` causam panic em startup se ausentes. Em testes use `config.LoadTest()`.

| Var | Required | Default | Descrição |
|-----|----------|---------|-----------|
| `DATABASE_URL` | ✓ | — | postgres DSN |
| `REDIS_URL` | ✓ | — | redis DSN |
| `JWT_SECRET` | ✓ | — | >= 32 chars |
| `STRIPE_SECRET_KEY` | ✓ | — | sk_live_... |
| `STRIPE_WEBHOOK_SECRET` | ✓ | — | whsec_... |
| `RESEND_API_KEY` | ✓ | — | re_... |
| `TWILIO_ACCOUNT_SID` | ✓ | — | AC... |
| `TWILIO_AUTH_TOKEN` | ✓ | — | — |
| `TWILIO_FROM_NUMBER` | ✓ | — | E.164 |
| `ANTHROPIC_API_KEY` | ✓ | — | sk-ant-... |
| `APP_ENV` | — | `development` | `development`\|`production`\|`test` |
| `HTTP_PORT` | — | `8080` | — |
| `JWT_ACCESS_TTL` | — | `15m` | — |
| `JWT_REFRESH_TTL` | — | `720h` | 30 dias |
| `ANTHROPIC_MODEL` | — | `claude-sonnet-4-6` | — |
| `STRIPE_SIMULADO_PRICE_ID` | — | `price_placeholder` | Stripe price ID |
| `CORS_ALLOWED_ORIGINS` | — | `https://fernandofrancovalle.com` | Espaço-separado |

## Database Schema (migrations/)

| Migration | Tabela | Destaques |
|-----------|--------|-----------|
| 000001 | `users` | soft-delete via `deleted_at`, UNIQUE email, UNIQUE `referral_id` |
| 000002 | `user_products` | PK `(user_id, product_id)`, relação N:M com purchases |
| 000003 | `refresh_tokens` | `token_hash` UNIQUE, `revoked_at` nullable |
| 000004 | `simulado_attempts` | JSONB `answers`/`review_flags`/`score`, UNIQUE `(user_id, simulado_id, status)` |
| 000005 | `progress_snapshots` | PK `user_id`, JSONB `state`, `client_updated_at` vs `server_updated_at` |
| 000006 | `certificates` | PK é o hash SHA-256, UNIQUE `attempt_id` |
| 000007 | `purchases` | UNIQUE `stripe_session_id`, status `pending→paid|failed→refunded` |
| 000008 | `stripe_events` | PK `stripe_event_id` — log de idempotência de webhooks |
| 000009 | `referrals` | UNIQUE `(referrer_id, referred_id)` |
| 000010 | `leaderboard` | PK `(user_id, week_start)`, `week_start` = segunda-feira UTC |
| 000011 | `analytics_events` | JSONB `payload`, fire-and-forget |

## Test Patterns

**Naming**: `Test_<Type>_<Method>_<Scenario>_<Expected>` — ex: `Test_Scorer_Calculate_AllCorrect_Returns100`.

**Unit tests** (domain + application): inline mocks — struct que implementa o port, sem gomock. Ver `internal/application/simulado/finish_attempt_test.go` como referência.

**Contract tests**: `test/contract/` — `httptest.NewRecorder()` + stub que implementa interface. Sem Docker, sem DB.

**Integration tests**: `test/integration/` — tag `//go:build integration`, usa `testcontainers-go` para Postgres + Redis reais.

**Config em testes**: usar `config.LoadTest()` — campos required preenchidos com dummies, sem precisar de env vars.

## Adding a New Endpoint

1. Defina port/interface em `internal/domain/<ctx>/repository.go` (se precisar de infra).
2. Implemente use case em `internal/application/<ctx>/`. Recebe Command struct, retorna Result struct + error.
3. Implemente infra em `internal/infrastructure/persistence/postgres/` (ou redis/).
4. Adicione método no handler em `internal/interfaces/http/handlers/<ctx>_handler.go`. Para erros use `handlers.HandleDomainError(w, err)` — mapeia automaticamente para status HTTP + Problem+JSON.
5. Registre rota em `internal/interfaces/http/router.go`.
6. Wire tudo em `cmd/api/main.go` (único lugar com injeção de dependência manual).

## Error Responses

Todas as respostas de erro seguem RFC 7807 (Problem+JSON). `httputil.WriteError(w, status, detail, type)` produz:
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
