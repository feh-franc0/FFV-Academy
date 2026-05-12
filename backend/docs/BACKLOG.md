# BACKLOG — Backend Go API

Itens organizados por prioridade. Cada item tem contexto técnico suficiente para ser implementado sem lembrar desta conversa.

---

## Fase 1 — Curto prazo

### [B-01] Adicionar migration `users.updated_at`
**Área:** migrations/  
**Problema:** Migration 000001 cria `users.created_at` mas não `updated_at`. `UserRepo.Save` espera a coluna e certos testes de integração pulam por causa disso (ver `test/integration/helpers.go`).  
**Fix:** Nova migration `000025_add_users_updated_at.sql` com `ALTER TABLE users ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()` + trigger para auto-atualizar.  
**Esforço:** ~1h

---

### [B-02] Contract tests para handlers de Auth
**Área:** `test/contract/`  
**Problema:** Só `health_test.go` existe. Todos os 13 handlers não têm cobertura de contrato HTTP.  
**O que criar** (usando `httptest.NewRecorder`):
- `auth_test.go` → RequestToken (rate-limit header, body validation), VerifyMagicLink (sucesso, token inválido, expirado), Refresh (cookie ausente, token revogado), Logout, LogoutAll
- `simulado_test.go` → StartAttempt (paywall, attempt duplicada), AnswerQuestion, ToggleReviewFlag, FinishAttempt (score no response), CancelAttempt, ReportQuestion  
- `certificate_test.go` → IssueCertificate, VerifyCertificate (hash inexistente), ListCertificates  
- `progress_test.go` → Push (LWW conflict 409), Pull  
- `billing_test.go` → CreateCheckout (URL no response), StripeWebhook (assinatura inválida 401)  
- `tutor_test.go` → AskTutor (rate-limited, cache hit)  
- `curriculum_test.go` → List, Search, GetBySlug, admin CRUD  
**Esforço:** ~10h

---

### [B-03] Streak atual sempre retorna 0
**Área:** `internal/application/identity/user_stats.go`  
**Problema:** `StreakCurrent: 0, // stub até existir daily-xp dedicado` — o campo sempre retorna zero no endpoint `GET /api/v1/me/stats`.  
**Fix necessário:**
1. Migration `000026_daily_xp.sql` — tabela `daily_xp(user_id, date DATE, xp_gained INT, PRIMARY KEY(user_id, date))`  
2. Domain aggregate `internal/domain/progress/daily_xp.go` com `ComputeStreak(entries []DailyXP, today time.Time) int`  
3. Port `DailyXPRepository` em `internal/domain/progress/`  
4. Repo `internal/infrastructure/persistence/postgres/daily_xp_repo.go`  
5. Atualizar `UserStatsUseCase` para injetar o repo e calcular streak  
6. Gravar `daily_xp` ao finalizar attempt (`FinishAttemptUseCase`) com XP = `score.Value`  
**Esforço:** ~6h

---

### [B-04] Loglevel de erros no shutdown de telemetria
**Área:** `cmd/api/main.go`  
**Problema:** `defer telemetryShutdown(ctx) //nolint:errcheck` ignora erros de flush de traces ao desligar o servidor. Perda silenciosa de spans em deploys.  
**Fix:** Trocar `defer telemetryShutdown(ctx)` por:
```go
defer func() {
    if err := telemetryShutdown(ctx); err != nil {
        slog.Error("telemetry flush failed", "err", err)
    }
}()
```
**Esforço:** ~15min

---

## Fase 2 — Médio prazo

### [B-05] Integrar SMS (Twilio) no fluxo de magic token
**Área:** `internal/infrastructure/sms/`, `internal/application/identity/`, `internal/interfaces/http/handlers/`  
**Problema:** `TwilioClient` existe mas nenhum use case ou handler o chama. Usuários só recebem token por email.  
**O que fazer:**
1. Adicionar campo `Channel string` (`"email"` | `"sms"`) em `RequestMagicLinkCommand`  
2. No `RequestMagicLinkUseCase`: se `channel == "sms"` e `user.Phone != nil`, chamar `smsSender.SendMagicToken(phone, token)` em vez de email  
3. Atualizar `POST /api/v1/auth/request-token` para aceitar `"channel"` no body  
4. Adicionar contrato no OpenAPI  
**Detalhe:** rate-limit de 20 req/min já cobre o endpoint; não precisa de novo limite.  
**Esforço:** ~5h

---

### [B-06] Ligar o circuit breaker ao pool Postgres
**Área:** `cmd/api/main.go`, `internal/infrastructure/persistence/postgres/circuit_breaker.go`  
**Problema:** `CircuitBreaker` está implementado (closed/open/half-open, thread-safe, thresholds configuráveis) mas nunca é instanciado nem wired em `main.go`. Falhas consecutivas no Postgres não abrem o circuito.  
**Fix:**
1. Em `main.go`, criar `cb := postgres.NewCircuitBreaker(postgres.DefaultConfig())`  
2. Passar `cb` para os repos que fazem queries críticas (UserRepo, AttemptRepo)  
3. Envolver chamadas `pool.QueryRow` / `pool.Exec` com `cb.Execute(func() error {...})`  
4. Expor estado do CB em `/readyz` (ex.: `"db_circuit": "closed"`)  
**Esforço:** ~4h

---

### [B-07] Tratar evento Stripe `charge.refunded`
**Área:** `internal/application/billing/handle_stripe_webhook.go`, `internal/infrastructure/payment/`  
**Problema:** Webhook só trata `checkout.session.completed`. Reembolsos (`charge.refunded`) não revertem `purchase.status` para `refunded` nem revogam `user_products`.  
**Fix:**
1. Adicionar case `"charge.refunded"` no switch do use case  
2. Extrair `charge.PaymentIntent` → buscar `Purchase` pelo `stripe_session_id`  
3. `purchase.Refund(now)` → `status = "refunded"`  
4. Revogar entradas em `user_products` para os products do purchase  
5. Idempotência: usar `stripeEventRepo.MarkProcessed` igual ao fluxo atual  
**Esforço:** ~4h

---

### [B-08] Índices faltando nas queries frequentes
**Área:** `migrations/`  
**Problema:** Queries do admin panel e soft-delete não têm índices.  
**Nova migration `000025_missing_indexes.sql`** (ou incorporar em B-01):
```sql
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_progress_snapshots_updated_at ON progress_snapshots(updated_at);
```
**Esforço:** ~1h

---

### [B-09] Testes de integração para repos sem cobertura
**Área:** `test/integration/`  
**Problema:** ProgressRepo, LeaderboardRepo, CurriculumRepo e AuditLogRepo não têm testes de integração com banco real (testcontainers-go).  
**O que criar:**
- `progress_repo_test.go` → SyncPush (create + update), SyncPull (not found), conflito LWW  
- `leaderboard_repo_test.go` → UpsertXP, GetWeekly (ranking ordenado), SetOptIn, GetMyRank  
- `curriculum_repo_test.go` → Create, GetBySlug, List (paginado), Search (full-text), Update, Delete  
- `audit_log_repo_test.go` → Insert async, ListByActor (filtros de data)  
**Esforço:** ~6h

---

## Fase 3 — Pós-MVP

### [B-10] Google OAuth (login com Google)
**Área:** migrations/ (000020 já adicionou `google_id`, `avatar_url`), nova infra, novo handler  
**O que falta:**
1. Infra `internal/infrastructure/auth/google_oauth.go` — troca `code` por `id_token`, valida JWT do Google, extrai `sub` + `email` + `picture`  
2. Port `OAuthProvider` em `internal/domain/identity/`  
3. Use case `AuthenticateWithGoogle` — upsert user (criar se não existe, vincular se já existe por email)  
4. Handler `POST /api/v1/auth/google` — recebe `{ "code": "...", "redirect_uri": "..." }`  
5. Retornar os mesmos tokens JWT do fluxo magic link  
**Esforço:** ~8h

---

### [B-11] Proteger `/metrics` em produção
**Área:** `internal/interfaces/http/handlers/metrics_handler.go`  
**Problema:** `// TODO pós-MVP: opcionalmente proteger com auth bearer/basic quando exposto fora da rede interna.` — endpoint público em produção expõe estrutura interna de handlers e labels.  
**Fix:** Adicionar variável de ambiente `METRICS_TOKEN`. Se definida, o handler exige `Authorization: Bearer <token>`. Se vazia, sem autenticação (compatível com scraping interno pelo Prometheus).  
**Esforço:** ~2h

---

### [B-12] Cenários E2E (test/e2e/ está vazio)
**Área:** `test/e2e/`  
**Problema:** Diretório existe mas vazio. Nenhum fluxo completo é testado end-to-end contra servidor real.  
**Cenários a implementar:**
1. **Auth flow**: `POST /auth/request-token` → ler token do Mailhog → `POST /auth/verify` → usar JWT → `POST /auth/refresh` → `POST /auth/logout`  
2. **Simulado flow**: autenticar → `POST /simulados/{id}/attempts` → responder todas as questões → `POST /attempts/{id}/finish` → `POST /certificates` → `GET /certificates/{hash}`  
3. **Billing flow**: autenticar → `POST /billing/checkout` → simular webhook Stripe com `stripe trigger checkout.session.completed` → verificar `user_products` atualizado  
**Pré-requisito:** Adicionar endpoint `POST /api/v1/dev/token` (somente em `APP_ENV=test`) para gerar JWT de teste sem Mailhog.  
**Esforço:** ~8h

---

### [B-13] Sistema de bônus por referral
**Área:** `internal/domain/referral/`, `internal/application/`  
**Problema:** `Referral.BonusGranted bool` existe no aggregate mas nenhuma lógica concede bônus. A conversão (`Convert()`) marca o referral como convertido mas não entrega nada ao referrer.  
**Decisão a tomar antes de implementar:** Qual é o bônus? (crédito, acesso temporário, XP?) — depende de regra de negócio não definida ainda.  
**O que fazer quando decidido:**
1. Definir `BonusType` no domínio  
2. Use case `GrantReferralBonus` chamado após `HandleStripeWebhook` (primeiro purchase do referred)  
3. Entregar bônus via `user_products` (acesso) ou `daily_xp` (XP)  
**Esforço:** ~5h (após decisão de negócio)

---

### [B-14] Log de queries lentas (> 500ms)
**Área:** `internal/infrastructure/persistence/postgres/`  
**Problema:** Sem instrumentação de latência por query. Problemas de performance no Postgres são invisíveis nos logs.  
**Fix:** Implementar `pgx.QueryTracer` customizado que emite log `slog.Warn("slow query", "sql", sql, "duration", d)` quando `d > 500ms` e span OTel com atributo `db.statement`.  
**Esforço:** ~4h

---

## Observações gerais

- **Nenhum bloqueador crítico** foi encontrado — todos os testes passam e a arquitetura está sólida.
- Os itens de maior valor imediato são **B-01** (dados inconsistentes), **B-02** (cobertura de contrato) e **B-03** (streak visível no produto).
- **B-05** (SMS) e **B-10** (Google OAuth) aumentam conversão de cadastro mas dependem de decisão de produto.
- **B-12** (E2E) e **B-14** (slow queries) são investimento em observabilidade de longo prazo.
