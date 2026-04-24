# SECURITY — FFV Academy Backend

Threat model resumido (STRIDE) por bounded context, controles atualmente implementados e checklist de review.

## 1. Threat model (STRIDE curto)

### identity/ (auth)
- **S (Spoofing):** request-token com email arbitrário. **Controle:** magic token de 6 dígitos via email+SMS; sem enumeration (resposta 202 sempre).
- **T (Tampering):** manipulação de JWT. **Controle:** JWT assinado HS256 com `JWT_SECRET` ≥ 32 chars.
- **R (Repudiation):** usuário nega login. **Controle:** `refresh_tokens` mantém histórico (`revoked_at` auditável).
- **I (Info disclosure):** leak de email → existência de conta. **Controle:** `/auth/request-token` sempre 202.
- **D (DoS):** flood de magic tokens. **Controle:** rate-limit por email + IP (5/janela) e TTL curto (10min).
- **E (Elevation):** usuário comum vira admin. **Controle:** middleware `RequireAdmin` valida claim `role=admin`; claim emitida só pelo servidor.

### simulado/ (attempts)
- **T:** cliente envia score falso. **Controle:** server-authoritative — score calculado em `FinishAttemptUseCase` a partir do catálogo embedded.
- **T:** cliente estende deadline. **Controle:** `Deadline()` derivada de `StartedAt + TimeLimit` no server; client-side timer é só UX.
- **E (paywall bypass):** responder questão além do free tier sem pagar. **Controle:** `PaywallPolicy.IsAccessible(index, hasPaid)` enforçado em `AnswerQuestionUseCase`.
- **I:** vazamento de gabarito via tutor. **Controle:** `AskTutor` não recebe `optionId` correto; Claude recebe só enunciado + opções via contexto curado.

### billing/
- **S:** requisição falsa ao webhook. **Controle:** valida `Stripe-Signature` com `STRIPE_WEBHOOK_SECRET` antes de processar.
- **T:** replay de evento pago. **Controle:** `stripe_events` PK em `stripe_event_id` — `MarkProcessed` antes de processar; se já existe, ignora.
- **D:** body enorme. **Controle:** `io.LimitReader(1<<20)` (1MB).

### certificate/
- **T:** forjar hash de certificado. **Controle:** hash é `SHA-256(userID|simuladoID|attemptID|issuedAt)` calculado no server; verify busca por hash exato (não verifica assinatura, mas colisão SHA-256 é infeasível).
- **R:** repudiar autoria. **Controle:** certificado guarda `attempt_id` UNIQUE com FK auditável.

### progress/
- **T:** client envia state antigo sobrepondo progresso. **Controle:** LWW via `client_updated_at` vs `server_updated_at` — servidor retorna 409 se mais recente.

### tutor/
- **D:** chamadas caras ao Claude. **Controle:** rate-limit no use case, cache Redis por `(simuladoID, questionID, kind)`, limite por plano (`IsPro`).
- **I:** prompt injection via questão do usuário. **Status:** não aplicável — usuário não envia texto livre, só IDs.

## 2. Controles transversais

| Controle | Implementação | Arquivo-chave |
|---------|---------------|---------------|
| Magic token comparação constant-time | `subtle.ConstantTimeCompare` em `MagicToken.Matches` | `internal/domain/identity/magic_token.go` |
| Consumo atômico do token | Redis `GETDEL` (anti-replay) | `internal/infrastructure/persistence/redis/token_store.go` |
| Rate limit por email+IP | Redis INCR+EXPIRE por chave composta | use case `RequestMagicLink` |
| Refresh rotation | novo refresh emitido + antigo revogado a cada `/auth/refresh` | `internal/application/identity/refresh.go` |
| Refresh no DB | apenas hash SHA-256 (raw token nunca persistido) | migration `000003_refresh_tokens` |
| JWT TTL curto | 15min access + 30d refresh | `config.JWTAccessTTL`, `JWTRefreshTTL` |
| Cookie de refresh | HttpOnly + Secure + SameSite=Strict + Path=/api/v1/auth | `auth_handler.setRefreshCookie` |
| Stripe signature | `webhook.ConstructEvent` do stripe-go | `internal/infrastructure/payment/stripe_client.go` |
| Webhook idempotente | `stripe_events` PK | `HandleStripeWebhookUseCase` |
| Soft-delete LGPD | `users.deleted_at` + repo filtra `IS NULL` | migration `000001_users` |
| Problem+JSON | RFC 7807 em todas as respostas de erro | `httputil.WriteError` |
| Sem leak de stack trace | `HandleDomainError` mapeia `default` → "erro interno" | `handlers/errors.go` |
| CORS allowlist | `CORS_ALLOWED_ORIGINS` espaço-separado | middleware `CORS` |
| Security headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, CSP | middleware `SecurityHeaders` |
| Request ID | UUID injetado por middleware → header + log | middleware `RequestID` |
| Panic recovery | `Recover` escreve 500 Problem+JSON | middleware `Recover` |
| Body size limit | webhook 1MB explícito | `billing_handler.StripeWebhook` |

## 3. Checklist de review de PR

Todo PR deve passar por esses 8 pontos antes de merge:

- [ ] **Sem import de infra em domain** — `internal/domain/**` só importa stdlib + `shared`.
- [ ] **Sem `time.Now()` em domain/application** — uso obrigatório de `shared.Clock`.
- [ ] **Erros novos usam sentinels** — retornar `shared.ErrX` (ou wrappar via `DomainError`), nunca string opaca. Handler vai mapear corretamente.
- [ ] **DTOs desacoplados do aggregate** — nunca serializar aggregate direto. Adicionar/atualizar em `handlers/dto.go`.
- [ ] **Nenhum segredo no código** — sem token, chave, URL com credencial. Config sempre via env (`config.Load`).
- [ ] **Novos endpoints têm contract test** — ao menos happy path + um erro (ex: 401).
- [ ] **Migrations reversíveis** — `up.sql` + `down.sql`; operações destrutivas em migration separada do deploy que remove uso.
- [ ] **Coverage não regrediu** — CI exigirá; se fez mexida em domain, adicionar/ajustar unit test.

## 4. Política de secrets

### Onde ficam
- **Dev:** env vars locais (opção via `direnv` / `.envrc` — git-ignored).
- **CI:** GitHub Secrets (não legíveis nos logs).
- **Prod:** secret manager do PaaS (Doppler, Fly secrets, Railway variables — depende do host).

**Nunca** no `.env` commitado, nunca em logs, nunca em mensagens de erro.

### Rotação (ver também RUNBOOK §3)
- **Rotineira:** trimestral para `JWT_SECRET`, anual para outros.
- **Reativa:** imediata se qualquer suspeita de vazamento (fork público do repo com env leakado, ex-membro do time, dump de DB).

### Auditoria
Acesso a secrets só via gerenciador (audit log automático). Nunca enviar por Slack/email.

## 5. Dependências

- Atualizar `go.mod` regularmente; `go list -m -u all` para detectar updates.
- Acompanhar CVEs (Stripe SDK, anthropic-sdk-go, go-chi, crypto libs). GitHub Dependabot habilitado via `.github/` (fora do escopo deste doc).

## 6. Gaps conhecidos (não resolvidos)

- Sem dual-secret durante rotação do `STRIPE_WEBHOOK_SECRET` (aceita uma pequena janela de retries do Stripe).
- Sem CAPTCHA em `/auth/request-token` — rate limit mitiga, mas não bloqueia bot dedicado.
- Admin stats (`/admin/stats`) é stub — sem query real ainda.
- Sem rotação automática de `JWT_SECRET` (manual via redeploy).
