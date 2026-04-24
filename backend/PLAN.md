# PLAN.md — Backend FFV Academy (Go)

> Plano mestre para construção do backend em **Go** que suporta o frontend
> `fernandofrancovalledotcom`. Este documento é a fonte única de verdade:
> arquitetura, contratos, schema, testes e **backlog de tasks prontas para
> execução** (base para entregar ao agente executor — Sonnet).
>
> **Última atualização:** 2026-04-21

---

## 0. Princípio Norteador

> **"Toda linha de código deve poder ser justificada por um teste que falharia sem ela."**

- **TDD** estrito: Red → Green → Refactor. Nenhum PR é aceito sem teste novo (ou caso contrário, comentário `// @NO-TEST: <razão>` justificado e revisado).
- **SOLID** aplicado pragmaticamente (documentado nos comentários de cada struct/interface).
- **Clean Architecture** + **DDD** tático (bounded contexts → aggregate → entity → value object → repository).
- **Object Calisthenics** adaptado a Go (ver §10 para regras específicas e exceções).
- **Clean Code**: funções curtas, nomes expressivos, zero comentário redundante — **comentários existem para explicar POR QUE e QUAL PADRÃO**, nunca O QUE.

---

## 1. Visão Geral & Escopo

### 1.1 O que o backend **DEVE** fazer

| Contexto | Responsabilidade |
|---|---|
| **Identity** | Magic link (email+SMS), emissão de JWT, perfil do usuário, consentimento LGPD, logout, deleção de conta (LGPD/GDPR). |
| **Simulado** | Iniciar tentativa, salvar resposta parcial (onde parou), retomar, timer server-authoritative, finalizar, calcular score, paywall, flags de revisão, listar attempts. |
| **Progresso (Sync)** | Cloud sync do `GameState` (XP, streak, badges, SRS cards, study days) — localStorage continua autoritativo no cliente; servidor é backup + multi-device. |
| **Certificate** | Emitir certificado (hash determinístico), verificar hash publicamente, listar certificados do usuário. |
| **Billing** | Integração Stripe (PIX + Cartão BR), webhook `checkout.session.completed`, grant de `paid_products` server-side (nunca client-side). |
| **Tutor AI** | Proxy autenticado para Claude API (Anthropic SDK), rate-limit por usuário, cache por questionId. |
| **Referral** | Tracking real de indicações, contagem server-side, badge awards. |
| **Events / Analytics** | Endpoint de ingestão de eventos privados (complementa Plausible). |
| **Leaderboard** | Ranking semanal opt-in (Mon-Sun UTC), reset automático. |
| **Admin** | Endpoints protegidos por role: listar users, revogar produtos, ver métricas. |

### 1.2 O que o backend **NÃO** faz

- ❌ Criar/editar trilhas, módulos, artigos, questões. Conteúdo continua estático no repo do frontend (`curriculum.ts`, `simulados-catalog.ts`).
- ❌ Servir HTML/SSR. Frontend permanece `next export` estático na Hostinger.
- ❌ Armazenar o conteúdo dos artigos. Somente metadados referenciáveis por `slug`/`id`.

### 1.3 Premissas

- Frontend chama API via `fetch` com `Authorization: Bearer <jwt>`.
- JWT curto (15 min) + refresh token rotativo (30 dias) em cookie `HttpOnly` `Secure` `SameSite=Strict`.
- API versionada por path: `/api/v1/...`.
- Conteúdo estático do catálogo (questões, respostas corretas) **continua no frontend** — o servidor valida `answer.correctId` usando uma **cópia do catálogo** shippado junto com o backend (gerada via codegen a partir do repo frontend). Isso impede o cliente mentir a resposta correta sem duplicar schema manualmente. Ver §5.4.

---

## 2. Stack Tecnológica Definida

| Camada | Escolha | Justificativa |
|---|---|---|
| Linguagem | **Go 1.23+** | Performance, tipagem estática, concorrência nativa, deploy single-binary. |
| HTTP router | **chi v5** | `net/http` compatível, middleware idiomático, zero mágica, maduro. |
| DB | **PostgreSQL 16** | RLS, JSONB pra GameState, triggers, maduro. |
| DB client | **pgx v5** (driver) + **sqlc** (codegen) | Type-safe queries sem ORM; SQL é primeiro-classe. |
| Migrations | **golang-migrate** | Up/down versionado. |
| Cache/Rate-limit | **Redis 7** | Tokens de magic link (TTL 10min), rate-limit sliding window, cache tutor IA. |
| Auth tokens | **JWT (HS256)** via `github.com/golang-jwt/jwt/v5` | Stateless; refresh em cookie HttpOnly. |
| Validação | **`github.com/go-playground/validator/v10`** + custom rules | Espelha Zod do frontend. |
| Logs | **`log/slog`** (stdlib) + JSON handler | Observabilidade estruturada, zero-dep. |
| Tracing | **OpenTelemetry** (exportador OTLP) | Distributed tracing. |
| Métricas | **Prometheus** `/metrics` | Scraping padrão. |
| Testes | **`testing`** + **`testify`** (assert/require) + **`testcontainers-go`** (Postgres/Redis) + **`gomock`** (mocks) + **`httptest`** (contract) + **`k6`** (load) | Pirâmide completa. |
| Config | **`kelseyhightower/envconfig`** | 12-factor. |
| Email | **`resend.com`** (HTTP API) | Simples, BR-friendly. |
| SMS | **Twilio** | Padrão internacional. |
| Pagamentos | **Stripe** (PIX BR habilitado) | Webhooks + Checkout. |
| Claude API | **`github.com/anthropics/anthropic-sdk-go`** | SDK oficial. |
| CI | **GitHub Actions** | Lint + test + build. |
| Containerização | **Docker multi-stage** + `docker compose` local | Dev parity. |
| Deploy | **Fly.io** (primário) / Railway (backup) | Deploy rápido, região GRU disponível. |
| Lint | **`golangci-lint`** (config strict) | Consistência. |
| Secrets | **`.env`** local (gitignored) + **Fly secrets** prod | Padrão. |

---

## 3. Estrutura de Diretórios (Clean Arch + DDD)

```
api_fernandofrancovalledotcom/
├── cmd/
│   └── api/
│       └── main.go                    # Wire + bootstrap. Único ponto com dependências concretas.
├── internal/
│   ├── domain/                        # DDD: coração do sistema. ZERO deps externas.
│   │   ├── identity/                  # Bounded Context: Identity & Access
│   │   │   ├── user.go                # Aggregate root: User
│   │   │   ├── email.go               # Value Object: Email (self-validating)
│   │   │   ├── phone.go               # Value Object: Phone (BR)
│   │   │   ├── magic_token.go         # Value Object: MagicToken
│   │   │   ├── events.go              # Domain events: UserRegistered, UserLoggedIn
│   │   │   ├── repository.go          # Interface (Port): UserRepository
│   │   │   └── service.go             # Domain service: MagicLinkIssuer (interface)
│   │   ├── simulado/
│   │   │   ├── attempt.go             # Aggregate root: Attempt
│   │   │   ├── answer.go              # Value Object: Answer (questionID + optionID)
│   │   │   ├── timer.go               # Value Object: Timer (server-authoritative)
│   │   │   ├── score.go               # Value Object: Score
│   │   │   ├── simulado.go            # Entity: Simulado (read-only; vem do catálogo)
│   │   │   ├── catalog.go             # Port: CatalogProvider (lookup only)
│   │   │   ├── events.go              # Domain events: AttemptStarted, AttemptFinished
│   │   │   └── repository.go          # Port: AttemptRepository
│   │   ├── progress/
│   │   │   ├── game_state.go          # Aggregate root: GameState (blob versionado)
│   │   │   ├── sync_policy.go         # Domain service: last-write-wins vs CRDT
│   │   │   └── repository.go
│   │   ├── certificate/
│   │   │   ├── certificate.go         # Aggregate root
│   │   │   ├── hash.go                # VO: Hash (SHA-256 determinístico)
│   │   │   └── repository.go
│   │   ├── billing/
│   │   │   ├── product.go
│   │   │   ├── purchase.go            # Aggregate root
│   │   │   ├── provider.go            # Port: PaymentProvider (Stripe impl fica na infra)
│   │   │   └── repository.go
│   │   ├── tutor/
│   │   │   ├── query.go               # VO
│   │   │   ├── answer.go              # VO
│   │   │   └── provider.go            # Port: TutorProvider (Claude impl na infra)
│   │   ├── referral/
│   │   │   ├── referral.go            # Aggregate root
│   │   │   └── repository.go
│   │   ├── leaderboard/
│   │   │   ├── ranking.go             # Aggregate
│   │   │   └── repository.go
│   │   └── shared/
│   │       ├── id.go                  # VO: ID tipado (UserID, AttemptID, etc)
│   │       ├── clock.go               # Port: Clock (testável)
│   │       └── errors.go              # Sentinel errors do domínio
│   │
│   ├── application/                   # Use cases (orquestração). Depende apenas de /domain.
│   │   ├── identity/
│   │   │   ├── request_magic_link.go  # UC: emitir + enviar token
│   │   │   ├── verify_magic_link.go   # UC: validar + emitir JWT
│   │   │   ├── get_profile.go
│   │   │   ├── update_profile.go
│   │   │   └── delete_account.go      # LGPD
│   │   ├── simulado/
│   │   │   ├── start_attempt.go
│   │   │   ├── answer_question.go     # Salva onde parou
│   │   │   ├── toggle_review_flag.go
│   │   │   ├── resume_attempt.go      # Retoma com timer correto
│   │   │   ├── finish_attempt.go      # Calcula score server-side
│   │   │   ├── list_attempts.go
│   │   │   └── ports.go               # Interfaces cross-UC
│   │   ├── progress/
│   │   │   ├── sync_push.go
│   │   │   └── sync_pull.go
│   │   ├── certificate/
│   │   │   ├── issue.go
│   │   │   └── verify.go
│   │   ├── billing/
│   │   │   ├── create_checkout.go
│   │   │   └── handle_webhook.go      # Idempotente
│   │   ├── tutor/
│   │   │   └── ask.go
│   │   ├── referral/
│   │   │   ├── record_visit.go
│   │   │   └── count_referrals.go
│   │   ├── leaderboard/
│   │   │   ├── get_weekly.go
│   │   │   └── opt_in.go
│   │   └── event/
│   │       └── ingest.go
│   │
│   ├── interfaces/                    # Adaptadores de entrada (driving adapters).
│   │   └── http/
│   │       ├── server.go              # Bootstrap chi + middleware chain
│   │       ├── router.go              # Route table
│   │       ├── middleware/
│   │       │   ├── auth.go            # JWT extraction
│   │       │   ├── ratelimit.go       # Sliding window (Redis)
│   │       │   ├── logger.go          # slog request logger
│   │       │   ├── recover.go         # panic → 500
│   │       │   ├── cors.go
│   │       │   ├── requestid.go
│   │       │   └── tracing.go         # OTEL
│   │       ├── handlers/
│   │       │   ├── auth_handler.go
│   │       │   ├── simulado_handler.go
│   │       │   ├── progress_handler.go
│   │       │   ├── certificate_handler.go
│   │       │   ├── billing_handler.go
│   │       │   ├── tutor_handler.go
│   │       │   ├── referral_handler.go
│   │       │   ├── leaderboard_handler.go
│   │       │   ├── admin_handler.go
│   │       │   ├── health_handler.go
│   │       │   └── errors.go          # Problem+JSON (RFC 7807)
│   │       └── dto/
│   │           ├── auth_dto.go        # Request/Response DTOs com validate tags
│   │           └── ...
│   │
│   ├── infrastructure/                # Adaptadores de saída (driven adapters).
│   │   ├── persistence/
│   │   │   ├── postgres/
│   │   │   │   ├── db.go              # pgxpool setup
│   │   │   │   ├── user_repo.go       # Implementa identity.UserRepository
│   │   │   │   ├── attempt_repo.go
│   │   │   │   ├── progress_repo.go
│   │   │   │   ├── certificate_repo.go
│   │   │   │   ├── purchase_repo.go
│   │   │   │   ├── referral_repo.go
│   │   │   │   ├── leaderboard_repo.go
│   │   │   │   ├── event_repo.go
│   │   │   │   └── queries/           # .sql files (sqlc input)
│   │   │   │       ├── user.sql
│   │   │   │       └── ...
│   │   │   ├── redis/
│   │   │   │   ├── client.go
│   │   │   │   ├── magic_token_store.go
│   │   │   │   ├── ratelimit_store.go
│   │   │   │   └── tutor_cache.go
│   │   │   └── sqlc/                  # Generated code (read-only)
│   │   ├── email/
│   │   │   └── resend_client.go
│   │   ├── sms/
│   │   │   └── twilio_client.go
│   │   ├── payment/
│   │   │   └── stripe_client.go
│   │   ├── ai/
│   │   │   └── claude_client.go
│   │   ├── catalog/
│   │   │   ├── static_catalog.go      # Carrega JSON gerado do frontend
│   │   │   └── generated_catalog.go   # //go:embed catalog.json
│   │   └── clock/
│   │       └── system_clock.go
│   │
│   ├── config/
│   │   └── config.go                  # envconfig struct
│   │
│   └── platform/
│       ├── logger/
│       ├── tracing/
│       └── server/                    # graceful shutdown
│
├── migrations/
│   ├── 0001_users.up.sql
│   ├── 0001_users.down.sql
│   └── ...
├── scripts/
│   ├── gen-catalog.sh                 # Extrai catálogo do frontend repo → catalog.json
│   ├── gen-sqlc.sh
│   └── migrate.sh
├── test/
│   ├── integration/                   # Usa testcontainers
│   ├── contract/                      # Valida DTOs vs OpenAPI
│   ├── e2e/                           # http black-box
│   ├── load/                          # k6 scripts
│   └── fixtures/
├── docs/
│   ├── openapi.yaml                   # Spec canônica
│   ├── adr/                           # Architecture Decision Records
│   │   ├── 0001-why-chi.md
│   │   ├── 0002-why-ddd.md
│   │   └── ...
│   └── runbook.md
├── deployments/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── fly.toml
├── .github/workflows/
│   ├── ci.yml
│   └── deploy.yml
├── Makefile
├── go.mod
├── go.sum
├── .env.example
├── .golangci.yml
├── .gitignore
├── README.md
└── PLAN.md                            # Este arquivo
```

> **Regra de dependência (Clean Arch):**
> `interfaces` → `application` → `domain` ← `infrastructure`
> Nunca o inverso. `domain` não importa NADA de `application`, `interfaces` ou `infrastructure`. Enforce via `golangci-lint` rule `depguard`.

---

## 4. Princípios & Convenções de Código (com comentários-padrão)

Todo arquivo/struct/função importante deve ter um header explicando **qual padrão foi aplicado e por quê**. Modelo:

```go
// Package identity implementa o bounded context "Identity & Access".
//
// PADRÕES:
//   - DDD: agregado User protege invariantes; VOs (Email, Phone) self-validate.
//   - Clean Arch: este package é domain puro — nenhuma dep de infra/framework.
//   - SOLID/DIP: UserRepository é interface (port); impl concreta vive em
//     infrastructure/persistence/postgres.
//   - Object Calisthenics: um nível de indentação por método; nunca primitivos
//     em assinaturas públicas (usar VOs).
package identity
```

### 4.1 SOLID — como aparece no código

- **S (Single Responsibility):** cada use case tem **uma** struct com **um** método `Execute(ctx, cmd) (result, error)`. Comentar: `// SRP: orquestra apenas o fluxo de X`.
- **O (Open/Closed):** extensão via novas implementações de ports (interfaces), nunca editando structs existentes. Comentar em pontos de extensão: `// OCP: adicionar novos providers implementando PaymentProvider`.
- **L (Liskov):** interfaces pequenas; sem `panic("not implemented")` em mocks de produção.
- **I (Interface Segregation):** interfaces com 1-3 métodos. Se um repo cresce, quebrar em `Reader` + `Writer`. Comentar: `// ISP: consumidor só precisa de Reader`.
- **D (Dependency Inversion):** use cases dependem de interfaces do domínio; `main.go` é o único lugar que faz wiring concreto. Comentar: `// DIP: depende da port, não da impl`.

### 4.2 DDD — vocabulário no código

Cada arquivo-chave começa com um bloco que declara o papel DDD:

```go
// AGGREGATE ROOT: Attempt
// INVARIANTES:
//   1. não pode responder questão após finishedAt
//   2. timer é server-authoritative; client não pode estender deadline
//   3. score só existe quando finishedAt != nil
//   4. answers[qID] ∈ {A,B,C,D,E}
type Attempt struct { ... }
```

### 4.3 Clean Code — regras práticas

- Funções ≤ 20 linhas, ≤ 3 parâmetros (use struct command).
- Retornar sempre `(T, error)` — nunca `error` silencioso.
- Zero `panic` fora de `main.go`/init.
- Nomes em inglês no código; comentários em português permitidos (o dono fala PT-BR).
- Sem `util.go`, `helpers.go`, `common.go` — nomear por responsabilidade.

### 4.4 Object Calisthenics (adaptação a Go)

Lista canônica (Jeff Bay), **anotada com exceções pragmáticas**:

1. **Um nível de indentação por método.** ✅ Hard rule. Exceção: loops de leitura de resultset.
2. **Não use `else`.** ✅ Early return sempre.
3. **Envolva primitivos e strings.** ✅ Em assinaturas públicas do domínio (use `Email`, não `string`). Exceção: valores de config.
4. **Coleções de primeira classe.** ✅ `Answers` (não `map[string]string`), `Topics`, etc.
5. **Um ponto por linha (Law of Demeter).** ⚠️ Flexível em Go pelo estilo de chaining do stdlib. Aplicar em domínio, relaxar em handlers.
6. **Não abrevie.** ✅ `ctx`, `id`, `req`, `res`, `err`, `db` permitidos; resto expandido.
7. **Mantenha entidades pequenas.** ✅ Struct ≤ 50 linhas, pacote ≤ 300 linhas.
8. **Máximo 2 campos de instância por classe.** ❌ **Regra desrespeitada**: em Go, aggregates legítimos têm 5-10 campos. Seguir **≤ 8 campos**.
9. **Sem getters/setters.** ✅ Expor comportamento; se precisar ler, expor método que retorna VO. Exceção: DTOs (são burros por design).

Cada exceção aplicada deve ser comentada: `// OC#8 relaxado: aggregate root naturalmente tem mais campos`.

### 4.5 Estilo de comentários

- **Bloco de cabeçalho**: padrão, responsabilidade, invariantes.
- **Inline**: apenas para o **porquê** não óbvio (regra de negócio, limitação de lib, workaround, decisão de design).
- **Proibido**: comentário que repete o nome da função. Ex.: `// GetUser retorna um user` → DELETAR.
- **TODO** sempre com dono e issue: `// TODO(@fernando, #42): migrar para RLS`.

---

## 5. Modelo de Domínio (resumo por BC)

### 5.1 Identity & Access

```go
// Aggregate Root: User
// Invariantes: email único; phone único; paidProducts apenas via domain event
// BillingPurchased (nunca setado diretamente).
type User struct {
    id               UserID
    email            Email           // VO
    phone            Phone           // VO
    name             Name            // VO (1-120 chars)
    createdAt        time.Time
    marketingConsent bool
    paidProducts     ProductSet      // coleção de primeira classe
    referralID       ReferralID      // VO
}

// VO: MagicToken
// Ciclo: gerado → armazenado em Redis com TTL 10 min → verificado → consumido.
// Proteção: 5 tentativas/10min por email antes de bloqueio temporário.
type MagicToken struct {
    value     string   // 6 dígitos
    expiresAt time.Time
}
```

### 5.2 Simulado

```go
// Aggregate Root: Attempt
// Invariantes:
//   - Uma attempt ativa por (userID, simuladoID)
//   - finishedAt ∈ [startedAt, startedAt + timeLimit]
//   - answers só podem ser alteradas antes de finishedAt
//   - reviewFlags ⊆ question IDs do simulado
type Attempt struct {
    id           AttemptID
    userID       UserID
    simuladoID   SimuladoID
    startedAt    time.Time
    finishedAt   *time.Time
    deadline     time.Time          // server-authoritative
    answers      Answers
    reviewFlags  QuestionIDSet
    score        *Score
}

// VO: Score — imutável, produzido apenas pelo scoring service.
type Score struct {
    value        int              // 0-100
    passed       bool
    byTopic      map[Topic]Counts
    correctCount int
    total        int
}
```

### 5.3 Progress (Cloud Sync)

`GameState` é persistido como **JSONB versionado** — não modelamos cada campo em Go. O servidor valida apenas:
- `schemaVersion` está na whitelist.
- Tamanho ≤ 2 MB.
- Campos obrigatórios presentes.
- `updatedAt` do cliente > último registrado (last-write-wins).

Regra: frontend é dono do modelo; backend é cofre.

### 5.4 Catálogo Estático

O backend **não edita** simulados, mas precisa conhecer o gabarito para pontuar. Solução:

1. Script `scripts/gen-catalog.sh` lê `/Users/fernandofranco/Developer/fernandofrancovalledotcom/src/lib/simulados-catalog.ts`, extrai via AST parser (TypeScript) → JSON canônico (`catalog.json`).
2. Arquivo embebido via `//go:embed catalog.json`.
3. CI falha se o hash do catálogo no backend diverge do frontend sem PR explícito.

---

## 6. Contratos de API (OpenAPI resumido)

> Spec completa em `docs/openapi.yaml`. Esta seção documenta os endpoints críticos.

### 6.1 Autenticação

#### `POST /api/v1/auth/request-token`
```json
// Request
{ "email": "user@example.com", "phone": "+5511987654321" }
// Response 202
{ "ok": true, "expiresIn": 600 }
// Erros: 400 invalid, 429 rate-limited
```
Emite token de 6 dígitos, persiste em Redis (TTL 10min), envia por email (Resend) + SMS (Twilio).

#### `POST /api/v1/auth/verify`
```json
// Request (primeiro login)
{
  "email": "user@example.com",
  "token": "123456",
  "registration": {
    "name": "Fernando",
    "phone": "+5511987654321",
    "marketingConsent": false
  }
}
// Response 200
{
  "accessToken": "eyJ...",
  "user": { /* UserProfile */ }
}
// Set-Cookie: refresh=<token>; HttpOnly; Secure; SameSite=Strict; Path=/api/v1/auth
```

#### `POST /api/v1/auth/refresh`
Lê cookie, rotaciona, devolve novo `accessToken`.

#### `POST /api/v1/auth/logout`
Invalida refresh (tabela `revoked_refresh_tokens`).

#### `GET /api/v1/me`
Retorna UserProfile atual.

#### `PATCH /api/v1/me`
Campos editáveis: `name`, `phone`, `marketingConsent`.

#### `DELETE /api/v1/me`
LGPD: soft-delete + job de purga em 30 dias. Retorna export JSON completo.

### 6.2 Simulado

#### `POST /api/v1/simulados/{slug}/attempts`
Inicia nova attempt (ou retorna a ativa). Resposta inclui `deadline` ISO.

#### `GET /api/v1/simulados/{slug}/attempts/active`
Retorna attempt ativa (ou 404). Usado para retomar `onde parou`.

#### `PUT /api/v1/simulados/{slug}/attempts/{attemptId}/answers/{questionId}`
```json
{ "optionId": "B" }
```
Salva resposta. Idempotente. Atualiza `updatedAt`.

#### `PUT /api/v1/simulados/{slug}/attempts/{attemptId}/review-flags/{questionId}`
```json
{ "flagged": true }
```

#### `POST /api/v1/simulados/{slug}/attempts/{attemptId}/finish`
Finaliza, calcula score server-side, retorna `ScoredAttempt`.

#### `GET /api/v1/simulados/attempts`
Lista todas attempts do usuário (para histórico).

### 6.3 Progresso (Sync)

#### `PUT /api/v1/progress`
```json
{
  "schemaVersion": 3,
  "updatedAt": "2026-04-21T10:00:00Z",
  "state": { /* blob do GameState */ }
}
```
Last-write-wins baseado em `updatedAt`. Retorna 409 se servidor tem versão mais nova.

#### `GET /api/v1/progress`
Retorna blob atual + `updatedAt`.

### 6.4 Certificados

#### `POST /api/v1/certificates`
Pré-condição: attempt finalizada com `passed=true` (validado server-side).
```json
{ "attemptId": "..." }
```
Retorna certificado + hash + URL pública.

#### `GET /api/v1/certificates/{hash}` (público, sem auth)
Retorna `{ name, simuladoTitle, score, issuedAt }` ou 404. Usado em `/verificar?h=`.

#### `GET /api/v1/certificates` (auth)
Lista certificados do usuário.

### 6.5 Billing

#### `POST /api/v1/billing/checkout`
```json
{ "productId": "simulado-aws-practitioner" }
```
Retorna URL do Stripe Checkout.

#### `POST /api/v1/billing/webhook` (sem auth, validação por `Stripe-Signature`)
Handler idempotente: `checkout.session.completed` → `grantProduct`.

### 6.6 Tutor AI

#### `POST /api/v1/tutor/ask`
```json
{
  "simuladoId": "aws-clf",
  "questionId": "clf-q1",
  "kind": "por-que" | "analogia" | "exemplo"
}
```
Rate limit: 50 req/mês free, 1000 pro. Cache Redis por `(questionId, kind)` com TTL 7 dias.

### 6.7 Referral

- `POST /api/v1/referrals/visits` — registra hit com `?ref=xxx`.
- `GET /api/v1/referrals/stats` — retorna contagem do usuário autenticado.

### 6.8 Leaderboard

- `POST /api/v1/leaderboard/opt-in` — toggle.
- `GET /api/v1/leaderboard/weekly` — top 20 + posição do user.

### 6.9 Events

#### `POST /api/v1/events`
```json
{ "type": "simulado_started", "payload": {...}, "occurredAt": "..." }
```
Fire-and-forget; retorna 202.

### 6.10 Admin (role=admin, protegido)

- `GET /api/v1/admin/users`
- `POST /api/v1/admin/users/{id}/products` (grant manual)
- `GET /api/v1/admin/metrics`

### 6.11 Health

- `GET /healthz` — liveness.
- `GET /readyz` — readiness (checa DB + Redis).
- `GET /metrics` — Prometheus (interno).

### 6.12 Padrão de erro (RFC 7807)

```json
{
  "type": "https://api.ffv/errors/invalid-token",
  "title": "token inválido",
  "status": 401,
  "detail": "token expirado ou incorreto",
  "requestId": "...",
  "traceId": "..."
}
```

---

## 7. Schema de Banco (Postgres)

> Migrations numeradas em `migrations/`. Toda tabela tem `id` UUID, `created_at`, `updated_at`.

```sql
-- 0001_users.up.sql
CREATE TABLE users (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email             CITEXT NOT NULL UNIQUE,
  phone             TEXT   NOT NULL UNIQUE,
  name              TEXT   NOT NULL CHECK (length(name) BETWEEN 1 AND 120),
  marketing_consent BOOLEAN NOT NULL DEFAULT FALSE,
  referral_id       TEXT    NOT NULL UNIQUE CHECK (referral_id ~ '^[a-z0-9]{3,32}$'),
  role              TEXT    NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  deleted_at        TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 0002_magic_tokens_audit.up.sql (tokens vivem em Redis; apenas auditoria aqui)
CREATE TABLE magic_token_attempts (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      CITEXT NOT NULL,
  ip         INET,
  success    BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON magic_token_attempts (email, created_at DESC);

-- 0003_refresh_tokens.up.sql
CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON refresh_tokens (user_id, revoked_at);

-- 0004_user_products.up.sql
CREATE TABLE user_products (
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id  TEXT NOT NULL CHECK (product_id ~ '^[a-z0-9-]{1,80}$'),
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  purchase_id UUID,
  PRIMARY KEY (user_id, product_id)
);

-- 0005_purchases.up.sql
CREATE TABLE purchases (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID NOT NULL REFERENCES users(id),
  product_id            TEXT NOT NULL,
  amount_cents          INT  NOT NULL,
  currency              TEXT NOT NULL DEFAULT 'BRL',
  stripe_session_id     TEXT UNIQUE,
  stripe_payment_intent TEXT UNIQUE,
  status                TEXT NOT NULL CHECK (status IN ('pending','paid','failed','refunded')),
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at               TIMESTAMPTZ
);

-- 0006_stripe_events.up.sql (idempotência)
CREATE TABLE stripe_events (
  id         TEXT PRIMARY KEY,         -- stripe event id
  type       TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 0007_simulado_attempts.up.sql
CREATE TABLE simulado_attempts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  simulado_id   TEXT NOT NULL,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline      TIMESTAMPTZ NOT NULL,
  finished_at   TIMESTAMPTZ,
  answers       JSONB NOT NULL DEFAULT '{}'::JSONB,
  review_flags  JSONB NOT NULL DEFAULT '[]'::JSONB,
  score         SMALLINT CHECK (score BETWEEN 0 AND 100),
  passed        BOOLEAN,
  score_details JSONB,                -- { byTopic, correctCount, total }
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX one_active_attempt_per_simulado
  ON simulado_attempts (user_id, simulado_id)
  WHERE finished_at IS NULL;

-- 0008_progress.up.sql
CREATE TABLE progress_snapshots (
  user_id        UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  schema_version INT NOT NULL,
  state          JSONB NOT NULL,
  state_size     INT  NOT NULL,
  client_updated_at TIMESTAMPTZ NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (state_size <= 2097152)       -- 2MB
);

-- 0009_certificates.up.sql
CREATE TABLE certificates (
  hash         TEXT PRIMARY KEY CHECK (hash ~ '^[a-f0-9]{16,128}$'),
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  simulado_id  TEXT NOT NULL,
  attempt_id   UUID NOT NULL REFERENCES simulado_attempts(id),
  name         TEXT NOT NULL,
  score        SMALLINT NOT NULL CHECK (score BETWEEN 0 AND 100),
  issued_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON certificates (user_id);

-- 0010_referrals.up.sql
CREATE TABLE referrals (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referred_id     UUID REFERENCES users(id) ON DELETE SET NULL,
  visitor_token   TEXT,                -- hit anônimo antes de signup
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  converted_at    TIMESTAMPTZ,
  bonus_granted   BOOLEAN NOT NULL DEFAULT FALSE,
  UNIQUE (referrer_id, referred_id)
);

-- 0011_events.up.sql
CREATE TABLE events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  type       TEXT NOT NULL,
  payload    JSONB NOT NULL DEFAULT '{}'::JSONB,
  occurred_at TIMESTAMPTZ NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ON events (type, occurred_at DESC);
CREATE INDEX ON events (user_id, occurred_at DESC);

-- 0012_leaderboard.up.sql
CREATE TABLE leaderboard_opt_ins (
  user_id    UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  opted_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Weekly XP snapshot materializado por cron
CREATE TABLE leaderboard_weekly (
  week_start DATE NOT NULL,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  xp_gained  INT  NOT NULL,
  rank       INT,
  PRIMARY KEY (week_start, user_id)
);

-- 0013_rls.up.sql (Row Level Security em tabelas sensíveis)
ALTER TABLE progress_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulado_attempts  ENABLE ROW LEVEL SECURITY;
-- Policies aplicadas via role autenticado no pool; app passa current_user_id via SET LOCAL.
```

---

## 8. Estratégia de Testes (pirâmide completa)

| Nível | Ferramenta | Cobertura alvo | O que testa |
|---|---|---|---|
| **Unit (domain)** | `testing` + `testify` | ≥ 95% | VOs, invariantes de agregados, domain services puros. TDD estrito. |
| **Unit (application)** | idem + `gomock` | ≥ 90% | Use cases com ports mockadas. |
| **Integration** | `testcontainers-go` (PG + Redis) | ≥ 80% | Repositórios reais contra Postgres real. |
| **Contract** | `httptest` + schema OpenAPI | 100% dos endpoints | Request/Response conformam com spec. |
| **E2E** | Docker compose + black-box HTTP | fluxos críticos | Login → start simulado → answer → finish → certificate. |
| **Property-based** | `gopter` ou `rapid` | VOs críticos | Ex: `Score(answers).value ∈ [0,100]` para qualquer input. |
| **Mutation** | `gremlins` | alvos críticos (scoring, paywall) | Garante que testes pegam bugs reais. |
| **Security** | `gosec`, `nancy` (deps) | CI obrigatório | SAST + CVE de dependências. |
| **Load** | `k6` | pré-prod | 1000 VUs, p99 < 200ms em `POST /auth/verify`. |
| **Fuzzing** | `go test -fuzz` | parsers (JWT, webhook sig) | Entrada mal-formada não quebra. |

### 8.1 Disciplina TDD

- Ciclo **Red → Green → Refactor** explicitado em commits: `test(simulado): add failing test for score calc`, `feat(simulado): implement score to pass test`, `refactor(simulado): extract topic aggregation`.
- PRs com código de produção sem teste novo são rejeitados no CI (verificação com `go test -coverprofile` + delta ≥ 0).
- Pair test/code naming: `attempt.go` ⇆ `attempt_test.go`, obrigatório.

### 8.2 Exemplo canônico (guia para todas as tasks)

```go
// attempt_test.go
//
// TDD: cada teste nasce vermelho. Nomeado no padrão:
//   Test_<TipoOuFunção>_<CenárioEspecífico>_<ResultadoEsperado>
//
// PADRÃO: table-driven tests para maximizar cobertura com mínimo de ruído.

func Test_Attempt_AnswerQuestion_AfterFinish_Rejects(t *testing.T) {
    t.Parallel()
    a := mustStartAttempt(t, fakeClock)
    require.NoError(t, a.Finish(fakeClock.Now()))

    err := a.Answer(QuestionID("q1"), OptionID("B"))

    require.ErrorIs(t, err, ErrAttemptAlreadyFinished)
}
```

---

## 9. Segurança, Observabilidade & Operações

### 9.1 Segurança (checklist obrigatório por PR)

- [ ] Input validado via DTO + validator tags.
- [ ] Toda query usa placeholders (pgx `$1,$2`), zero string concat.
- [ ] JWT: HS256 com segredo de ≥ 32 bytes; `aud`, `iss`, `sub`, `exp`, `iat`.
- [ ] Refresh em cookie HttpOnly+Secure+SameSite=Strict; rotação obrigatória.
- [ ] Rate limit por IP **e** por email em `/auth/request-token` (5 req/10min).
- [ ] CORS whitelist: apenas `https://fernandofrancovalle.com`.
- [ ] Headers: CSP, HSTS, X-Content-Type-Options, X-Frame-Options DENY.
- [ ] Webhook Stripe valida assinatura antes de qualquer side-effect.
- [ ] Secrets via env, nunca no repo. `.env.example` com placeholders.
- [ ] Dependências escaneadas (`govulncheck`, `nancy`) no CI.
- [ ] SAST (`gosec`) no CI, severidade HIGH falha build.
- [ ] Logs **não** contêm PII (email, phone) — usar hash/ID.
- [ ] Deleção de conta (LGPD) testada ponta-a-ponta.

### 9.2 Observabilidade

- **Logs**: slog JSON com `request_id`, `trace_id`, `user_id` (quando aplicável).
- **Tracing**: OTEL em todos os handlers + repos (spans SQL via pgx hook).
- **Métricas**: histogramas por handler (`http_request_duration_seconds{handler,status}`), contadores de domínio (`simulado_attempts_finished_total{passed}`).
- **Dashboards**: Grafana via Prometheus. Pré-criados: latência, erros, taxa de pagamento, TTF magic link entregue.
- **Alertas**: 5xx > 1% em 5min; latência p99 > 500ms; fila Stripe webhook travada.

### 9.3 Deploy & Runtime

- **Fly.io**, região `gru` (São Paulo).
- Dockerfile multi-stage, imagem final `gcr.io/distroless/static:nonroot`, < 30 MB.
- Graceful shutdown (`context.Cancel` em 30s).
- Zero-downtime: `fly deploy` com rolling strategy.
- DB: Postgres gerenciado (Supabase ou Neon); backup diário + PITR.
- Redis: Upstash (serverless).

---

## 10. Definition of Done (por task)

Uma task só é **DONE** quando **TODOS** os itens abaixo forem verdadeiros:

- [ ] Código compilando (`go build ./...`).
- [ ] Lint limpo (`golangci-lint run`).
- [ ] Cobertura delta ≥ 0 (`go test -cover`).
- [ ] Testes unitários escritos ANTES do código (commits em ordem TDD).
- [ ] Testes integração (se a task toca infra) passam em testcontainer.
- [ ] Contrato OpenAPI atualizado (se API mudou).
- [ ] ADR criada se a decisão alterou arquitetura.
- [ ] Código comentado com padrão aplicado (DDD role, SOLID letter, OC rule).
- [ ] Sem TODOs órfãos (`TODO:` sem issue referenciada falha CI).
- [ ] README/runbook atualizado se impactou operação.

---

## 11. BACKLOG DE TASKS (ordem de execução)

> Cada task é **atômica, independente e verificável**. Prefixos: `F` (fase), `T` (task).
> Estimativas em pomodoros de 25min.

### ═══════════════════════════════════════════════
### F0 — FUNDAÇÃO (infra do projeto)
### ═══════════════════════════════════════════════

**T0.1 — Bootstrap do repositório Go**
*Por quê*: ponto de partida reproduzível.
- `go mod init github.com/fernandofranco/api_fernandofrancovalledotcom`
- Criar `.gitignore`, `.golangci.yml` (config strict + depguard enforcing Clean Arch layers), `.editorconfig`, `Makefile` (targets: `test`, `lint`, `run`, `migrate`, `gen`, `build`, `cover`).
- Criar estrutura de diretórios do §3 com `.gitkeep` nos vazios.
- **DoD**: `make lint && make test` retorna OK (zero testes ok).

**T0.2 — Config (envconfig) + `.env.example`**
- `internal/config/config.go` com struct única agrupando DB, Redis, JWT, Stripe, Resend, Twilio, Anthropic, CORS, Log.
- Validação obrigatória em `Load()`: todos os campos `required` presentes.
- Teste: config parse válido / inválido.

**T0.3 — Logger (`slog`) + middleware request-id/tracing stub**
- `internal/platform/logger/logger.go` — factory.
- Middleware `requestid` (UUIDv7) e `logger` integrados.
- Teste: handler fake gera log com request_id correto.

**T0.4 — Docker + docker-compose local (Postgres + Redis)**
- `deployments/Dockerfile` multi-stage.
- `docker-compose.yml`: api, postgres, redis, mailhog (dev smtp).
- `make dev` sobe tudo.

**T0.5 — Migrations infra (golang-migrate)**
- Script `scripts/migrate.sh` (up/down/version).
- Migration `0001_users` criada e aplicada.
- Teste: target `make migrate-up && make migrate-down` é idempotente.

**T0.6 — sqlc configurado**
- `sqlc.yaml` mapeando `queries/*.sql` → `internal/infrastructure/persistence/sqlc/`.
- Gera stub para `users` (CRUD básico).
- Target `make gen`.

**T0.7 — CI (GitHub Actions)**
- Workflow: lint → test (unit + integration com services postgres/redis) → govulncheck → gosec → build.
- PRs bloqueados se qualquer etapa falhar.

**T0.8 — Script de codegen de catálogo**
- `scripts/gen-catalog.sh`: usa `tsx` para executar um script TS que importa `simulados-catalog.ts` do repo frontend e emite `catalog.json`.
- `//go:embed catalog.json` em `infrastructure/catalog/generated_catalog.go`.
- Teste: loader carrega N simulados sem erro.

### ═══════════════════════════════════════════════
### F1 — IDENTITY & ACCESS
### ═══════════════════════════════════════════════

**T1.1 — VOs Email, Phone, Name, ReferralID, UserID (TDD)**
- Testes primeiro: aceita válidos, rejeita inválidos (tabela com ≥ 10 casos cada).
- Implementação com `NewEmail(s string) (Email, error)`.

**T1.2 — Aggregate User**
- Construtor + eventos `UserRegistered`, `MarketingConsentChanged`, `ProductGranted`.
- Invariantes testadas.

**T1.3 — Port `UserRepository` + `MagicTokenStore`**
- Interfaces no domínio.
- Mocks gerados com `gomock` (`make gen-mocks`).

**T1.4 — Use case `RequestMagicLink`**
- Teste: gera token 6 dígitos, armazena em store com TTL, envia via `EmailSender` + `SmsSender` (portas), registra tentativa no audit log.
- Rate limit (5/10min por email) aplicado.

**T1.5 — Use case `VerifyMagicLink`**
- Casos: token correto primeiro login (cria user), token correto login retorno, token errado, token expirado, muitas tentativas.

**T1.6 — JWT service (gerar + validar)**
- Access (15min) + Refresh (30d).
- Claims: `sub`, `email_hash`, `role`, `aud`, `iss`, `exp`, `iat`, `jti`.
- Teste: assinatura válida, expiração, chave errada rejeita.

**T1.7 — Infra: `postgres.UserRepo` (testcontainers)**
- Implementação + teste integração com `testcontainers-go`.
- Inclui `FindByEmail`, `Save`, `SoftDelete`.

**T1.8 — Infra: `redis.MagicTokenStore`**
- Put com TTL, consume (GETDEL), count attempts.

**T1.9 — Infra: Resend email + Twilio SMS (adapters)**
- Templates simples, testes com httptest stubbing os HTTP remotos.

**T1.10 — Handler `POST /auth/request-token`**
- DTO + validator + handler + contract test (OpenAPI).

**T1.11 — Handler `POST /auth/verify`**
- Retorna access + set-cookie refresh.

**T1.12 — Handler `POST /auth/refresh` + `POST /auth/logout`**
- Rotação de refresh em DB.

**T1.13 — Middleware `auth` (JWT extraction)**
- Testa: token válido injeta `userID` no ctx; inválido → 401.

**T1.14 — Handlers `GET/PATCH/DELETE /me`**
- DELETE inicia soft-delete + job agendado.

**T1.15 — E2E auth happy path**
- Sobe stack compose, realiza fluxo completo.

### ═══════════════════════════════════════════════
### F2 — SIMULADO (core do produto)
### ═══════════════════════════════════════════════

**T2.1 — VOs Answers, QuestionID, OptionID, Topic, Score**
- Validação de optionId ∈ {A..E}; Score imutável.

**T2.2 — Aggregate Attempt + invariantes**
- Métodos: `Answer`, `ToggleFlag`, `Finish`, `IsExpired`.
- Tabela de testes cobrindo cada invariante do §5.2.

**T2.3 — Catalog provider (read-only do embed)**
- `CatalogProvider.GetSimulado(id)` → `Simulado` ou `ErrNotFound`.

**T2.4 — Domain service `Scorer`**
- Puro. Testes com property-based: score sempre em [0,100], passed = score ≥ passing.

**T2.5 — Policy `PaywallPolicy`**
- `IsAccessible(index, hasPaid) bool` — regra replica frontend.
- Teste: Q11+ sem paidProducts → false; com paidProducts → true.

**T2.6 — UC `StartAttempt`**
- Se já existe ativa → retorna.
- Senão cria com deadline = now + timeLimit.
- Emite evento `AttemptStarted`.

**T2.7 — UC `AnswerQuestion`**
- Idempotente. Aplica Paywall. Rejeita após `Finish`. Rejeita após expirado.

**T2.8 — UC `ToggleReviewFlag`**

**T2.9 — UC `ResumeAttempt`**
- Retorna attempt ativa + tempo restante computado server-side.

**T2.10 — UC `FinishAttempt`**
- Chama Scorer, persiste `score`, `passed`, `score_details`, `finished_at`.
- Idempotente (se já finalizado, retorna o resultado).

**T2.11 — UC `ListAttempts`**
- Paginado, ordenado por `started_at DESC`.

**T2.12 — Infra `postgres.AttemptRepo` (integração)**
- Teste da constraint `one_active_attempt_per_simulado`.

**T2.13 — Handlers HTTP do simulado (todos os endpoints §6.2)**

**T2.14 — E2E fluxo simulado completo**
- Start → answer 3 → pause → resume (valida deadline preservado) → finish → certifica score.

### ═══════════════════════════════════════════════
### F3 — PROGRESS (cloud sync)
### ═══════════════════════════════════════════════

**T3.1 — Validator de GameState blob (schema versionado)**
- JSON Schema embedded; rejeita versões desconhecidas; rejeita > 2MB.

**T3.2 — Aggregate `ProgressSnapshot` + política last-write-wins**

**T3.3 — UCs `SyncPush` (PUT) e `SyncPull` (GET)**
- Push retorna 409 se server tem `updatedAt` mais recente (inclui payload servidor).

**T3.4 — Infra `postgres.ProgressRepo`**

**T3.5 — Handlers + testes contract + E2E sync multi-device**

### ═══════════════════════════════════════════════
### F4 — BILLING
### ═══════════════════════════════════════════════

**T4.1 — Product registry (embed JSON sincronizado com frontend)**

**T4.2 — UC `CreateCheckoutSession`**
- Chama Stripe via port.

**T4.3 — UC `HandleStripeWebhook` (idempotente)**
- Valida assinatura.
- Persiste em `stripe_events` antes de processar (idempotência).
- Em `checkout.session.completed`: cria purchase, grantProduct.

**T4.4 — Infra `stripe.Client`**

**T4.5 — Handlers + contract test com payloads reais do Stripe (fixtures)**

**T4.6 — E2E: stripe CLI replay → produto aparece no user**

### ═══════════════════════════════════════════════
### F5 — CERTIFICATE
### ═══════════════════════════════════════════════

**T5.1 — VO `Hash` (SHA-256 de `user_id|simulado_id|attempt_id|score`)**

**T5.2 — UC `IssueCertificate`**
- Pré-condição: attempt pertence ao user, finalizada, `passed=true`.
- Idempotente por attempt_id.

**T5.3 — UC `VerifyCertificate` (público)**

**T5.4 — Repo + handlers + E2E**

### ═══════════════════════════════════════════════
### F6 — TUTOR AI
### ═══════════════════════════════════════════════

**T6.1 — Port `TutorProvider` + adapter Claude**
- Prompt template versionado em `internal/infrastructure/ai/prompts/`.
- Modelo padrão: `claude-sonnet-4-6` (custo/qualidade).

**T6.2 — UC `Ask` com cache Redis (TTL 7d) + rate limit por plano**

**T6.3 — Handler + contract test com mock Claude**

### ═══════════════════════════════════════════════
### F7 — REFERRAL, LEADERBOARD, EVENTS
### ═══════════════════════════════════════════════

**T7.1 — Referral (tracking + counts + badges triggers)**
- `POST /referrals/visits` recebe `refId`; associa `referred_id` em signup.

**T7.2 — Leaderboard opt-in + snapshot semanal (cron)**
- Job: toda segunda 00:00 UTC, materializa semana anterior.

**T7.3 — Events ingest (`POST /events`) — 202 + persist async**

### ═══════════════════════════════════════════════
### F8 — ADMIN, OBSERVABILIDADE, HARDENING
### ═══════════════════════════════════════════════

**T8.1 — Middleware role=admin + handlers admin**

**T8.2 — Métricas Prometheus + endpoint `/metrics`**

**T8.3 — OpenTelemetry tracing (OTLP exporter)**

**T8.4 — Security audit pass: CSP, HSTS, CORS, headers**

**T8.5 — Load test k6 para fluxo auth + simulado**
- Gate: p99 < 200ms @ 1000 VUs.

**T8.6 — Fuzzing: JWT parser, webhook sig, URL params**

**T8.7 — Deploy Fly.io (GRU) + DNS + TLS**

**T8.8 — Runbook (`docs/runbook.md`) com cenários: DB down, Redis down, webhook Stripe atrasado, rotação de JWT secret**

### ═══════════════════════════════════════════════
### F9 — INTEGRAÇÃO COM FRONTEND (handoff)
### ═══════════════════════════════════════════════

**T9.1 — OpenAPI → client TypeScript gerado**
- `openapi-typescript` consome `docs/openapi.yaml` → `src/api/generated.ts` no repo frontend.

**T9.2 — Substituir `requestToken/verifyToken` mock no frontend**
- PR no repo frontend apontando para a API.

**T9.3 — Ativar cloud sync no frontend (flag `NEXT_PUBLIC_API_URL`)**

**T9.4 — Smoke test ponta-a-ponta em staging**

---

## 12. ADRs Planejadas

Criar no início de cada fase; guardam o **porquê** das decisões:

- `0001-why-chi-over-fiber-echo.md`
- `0002-why-ddd-and-clean-arch.md`
- `0003-why-sqlc-instead-of-orm.md`
- `0004-why-jwt-plus-refresh-cookie.md`
- `0005-why-lww-for-game-state-sync.md`
- `0006-why-embed-catalog-in-backend.md`
- `0007-why-fly-io-gru.md`
- `0008-magic-link-email-plus-sms-rationale.md`

---

## 13. Riscos & Mitigações

| Risco | Impacto | Mitigação |
|---|---|---|
| Divergência de catálogo frontend/backend | Score errado | CI bloqueia merge se hash diferente sem bump explícito. |
| Abuso de magic-link (spam) | Custo + reputação | Rate-limit por IP+email + CAPTCHA após 3 falhas. |
| Webhook Stripe duplicado | Produto concedido 2x | Tabela `stripe_events` como idempotency key. |
| Vazamento de JWT secret | Auth quebrado | Rotação documentada; chaves por ambiente; Fly secrets. |
| Client mente `passed=true` para certificar | Certificado inválido | Score recalculado server-side a partir do catálogo embebido. |
| LGPD: dados residuais após delete | Compliance | Job de purga 30d + teste E2E de deleção completa. |
| Tutor AI custo descontrolado | $$$ | Rate-limit por plano + cache Redis + circuit breaker em custo mensal. |

---

## 14. Entregáveis Finais

Ao concluir F0-F9, o repo deve ter:

1. API Go funcional em produção (`api.fernandofrancovalle.com`).
2. OpenAPI spec canônica (`docs/openapi.yaml`).
3. Cobertura de testes ≥ 85% global, ≥ 95% no `domain/`.
4. ADRs cobrindo todas as decisões arquiteturais.
5. Runbook operacional (`docs/runbook.md`).
6. Dashboards Grafana + alertas configurados.
7. Frontend integrado, mocks removidos, flag `NEXT_PUBLIC_API_URL` em prod.
8. Pipeline CI/CD verde.
9. README com quickstart (≤ 5 comandos para rodar local).
10. Este `PLAN.md` com tasks marcadas `[x]` à medida que concluídas.

---

## 15. Convenção para Sonnet executar

Quando este plano for entregue ao agente executor:

1. **Sempre iniciar pela F0** e avançar sequencialmente. Dentro de uma fase, tasks podem paralelizar quando independentes.
2. **Cada task** gera: commit(s) TDD ordenados, PR (se workflow de PR estiver ativo), atualização do checkbox aqui no `PLAN.md`.
3. **Nenhum atalho**: se um teste precisa de infra (Postgres), usar `testcontainers-go`, nunca mockar banco em teste de repositório.
4. **Comentários obrigatórios**: todo arquivo novo começa com o header de padrões (§4).
5. **Ao concluir cada fase**, rodar pipeline completa e gerar ADR se houve decisão não prevista.
6. **Dúvidas de escopo**: parar e perguntar; nunca presumir.

---

**FIM DO PLANO — pronto para execução.**
