# ARCHITECTURE — FFV Academy Backend

Clean Architecture + DDD. Este documento mostra como as camadas se relacionam e três fluxos críticos de ponta-a-ponta.

## 1. Camadas e direção de dependências

```
                 ┌───────────────────────────────────────┐
                 │       interfaces/http (handlers,      │
                 │       middleware, router)             │
                 └───────────────────────────────────────┘
                               │ depende ↓
                 ┌───────────────────────────────────────┐
                 │            application                │
                 │       (use cases orquestram ports)    │
                 └───────────────────────────────────────┘
                               │ depende ↓
                 ┌───────────────────────────────────────┐
                 │              domain                   │
                 │  (aggregates, value objects, ports)   │
                 └───────────────────────────────────────┘
                               ↑ implementa
                 ┌───────────────────────────────────────┐
                 │           infrastructure              │
                 │  (postgres, redis, stripe, claude,    │
                 │   resend, twilio, catalog)            │
                 └───────────────────────────────────────┘

                 cmd/api/main.go  ← composition root
                 (único lugar que junta tudo)
```

**Regra de ouro:** setas sempre apontam **para dentro**. `domain` não importa nada de `application`, `infrastructure` ou `interfaces`. `application` só importa `domain`. `infrastructure` implementa ports declarados em `domain`. `interfaces/http` pode importar `application` (para chamar use cases) e `domain` (para tipos de retorno / errors).

**Por que importa:** permite testar domain/application sem tocar em DB/HTTP; permite trocar Postgres por outro storage sem mudar regra de negócio; evita ciclos de import.

## 2. Fluxo genérico de uma request

```
HTTP request
    │
    ▼
┌──────────────────────────────┐
│ chi.Router                   │
│  ├─ RequestID                │  middleware
│  ├─ Logger                   │
│  ├─ Recover                  │
│  ├─ SecurityHeaders          │
│  ├─ CORS                     │
│  └─ Authenticate (se JWT)    │
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ handler.XxxHandler.Method    │  decode body → Command struct
└──────────────────────────────┘  chama use case
    │
    ▼
┌──────────────────────────────┐
│ application.XxxUseCase.Run   │  orquestra ports:
│                              │   - carrega aggregate (repo)
│                              │   - aplica regra (domain)
│                              │   - persiste (repo)
│                              │   - dispara side effects (email, event)
└──────────────────────────────┘
    │
    ▼
┌──────────────────────────────┐
│ domain.Aggregate.Method      │  regra pura, retorna novo estado
└──────────────────────────────┘
    │
    ▼  (se precisar persistir)
┌──────────────────────────────┐
│ infrastructure.Postgres/Redis│  SQL / pipeline
└──────────────────────────────┘
    │
    ▼
handler serializa DTO + WriteJSON (ou HandleDomainError)
```

`HandleDomainError` mapeia sentinels (`ErrNotFound`/`ErrUnauthorized`/...) para status + Problem+JSON — evita leak de stack e padroniza.

## 3. Fluxo: Auth (magic token + refresh rotation)

```
┌─────────┐                                                             ┌────────┐
│ client  │                                                             │ email  │
└────┬────┘                                                             └────┬───┘
     │                                                                       │
     │ POST /auth/request-token {email}                                      │
     ├──────────────────▶ handler.RequestToken                               │
     │                    ├─ RequestMagicLinkUC                              │
     │                    │   ├─ rate-limit check (redis INCR by email+IP)   │
     │                    │   ├─ GenerateMagicToken (6 dígitos, crypto/rand) │
     │                    │   ├─ token_store.Set (TTL 10min)                 │
     │                    │   └─ emailClient.SendMagicLink ─────────────────▶│
     │ 202 Accepted                                                          │
     │◀────────────────                                                      │
     │                                                                       │
     │ POST /auth/verify {email, token, name?, phone?}                       │
     ├──────────────────▶ handler.Verify                                     │
     │                    ├─ VerifyMagicLinkUC                               │
     │                    │   ├─ token_store.ConsumeToken (Redis GETDEL)     │
     │                    │   ├─ ConstantTime compare                        │
     │                    │   ├─ userRepo.FindByEmail (cria se new)          │
     │                    │   ├─ JWT access token (15min)                    │
     │                    │   └─ refresh_tokens.Save(hash SHA-256, 30d)      │
     │ 200 + Set-Cookie ffv_refresh (HttpOnly, Secure, SameSite=Strict)      │
     │◀────────────────                                                      │
     │                                                                       │
     │ ...15min depois...                                                    │
     │ POST /auth/refresh (com cookie)                                       │
     ├──────────────────▶ handler.Refresh                                    │
     │                    └─ RefreshTokenUC                                  │
     │                        ├─ FindByHash (lookup pelo SHA-256 do cookie)  │
     │                        ├─ revoke old (set revoked_at)                 │
     │                        ├─ issue new refresh + access                  │
     │ 200 + novo Set-Cookie                                                 │
     │◀────────────────                                                      │
```

## 4. Fluxo: Simulado finish → certificate

```
POST /attempts/{id}/finish
     │
     ▼
handler.FinishAttempt ─▶ FinishAttemptUC.Execute
                         │
                         ├─ attemptRepo.FindByID(attemptID)
                         ├─ AUTH CHECK: attempt.UserID == caller
                         ├─ catalog.GetSimulado(attempt.SimuladoID)
                         │   (catalog = //go:embed catalog.json — server-authoritative)
                         │
                         ├─ Scorer{}.Calculate(sim, attempt.Answers())
                         │   └─ result: Value (0-100), Passed, ByTopic
                         │
                         ├─ attempt.Finish(NewScore(result), now)
                         ├─ attemptRepo.Save(attempt)
                         │
                         ├─ if result.Passed:
                         │    eventBus.Publish(AttemptPassedEvent{attemptID, userID, ...})
                         │    └─▶ handler async em worker → IssueCertificateUC
                         │        ├─ hash = SHA256(userID|simID|attemptID|issuedAt)
                         │        ├─ certRepo.Save
                         │        └─ emailClient.SendCertificate
                         │
                         └─ returns: {attempt (com score), weakTopics}
```

Score nunca vem do client. Catálogo embebido na binária — impossível adulterar em runtime.

## 5. Fluxo: Billing webhook (idempotente)

```
  Stripe                            API                              Postgres
    │                                │                                  │
    │ POST /webhooks/stripe          │                                  │
    │ Stripe-Signature: t=...,v1=... │                                  │
    ├───────────────────────────────▶│                                  │
    │                                │ io.LimitReader 1MB               │
    │                                │ ValidateWebhookSignature          │
    │                                │   (stripe-go webhook.ConstructEvent)
    │                                │                                  │
    │                                │ HandleStripeWebhookUC            │
    │                                │  ├─ stripeEventRepo.MarkProcessed│
    │                                │  │   (PK stripe_event_id)        │
    │                                ├──┼─────────────────────────────▶│
    │                                │  │  UNIQUE violation?           │
    │                                │  │◀──── já processado → return  │
    │                                │  │                              │
    │                                │  ├─ case "checkout.session.completed":
    │                                │  │    purchaseRepo.FindBySession│
    │                                │  │    purchase.MarkPaid()       │
    │                                │  │    purchaseRepo.Save         │
    │                                │  │    userRepo.AddProduct(userID, productID)
    │                                │  │                              │
    │ 200 OK                         │                                  │
    │◀───────────────────────────────┤                                  │
```

Se qualquer passo falhar depois de `MarkProcessed`, o Stripe faz retry e nosso handler retorna cedo (já processado) — ou seja, em caso de falha parcial o evento pode ficar marcado sem produto liberado. **Gap:** isolar `MarkProcessed` + efeitos em uma transação SQL (uma única TX). Atualmente está comentado como "processar antes" por simplicidade — ver RUNBOOK §4 para diagnóstico manual.

## 6. Decisões-chave

### Por que JWT access curto + refresh cookie rotacionado
- Access token sem estado permite scale horizontal sem sessão compartilhada.
- TTL curto (15min) limita dano em caso de vazamento.
- Refresh rotation detecta roubo: se o token antigo for usado após rotação, é sinal de comprometimento (o ideal seria revogar família toda — gap).
- Cookie HttpOnly+SameSite=Strict impede XSS + CSRF de extrair/usar o refresh.

### Por que LWW em progress
- GameState sincroniza entre múltiplos dispositivos do mesmo usuário. Conflito real é raro (mesma pessoa).
- Merge seria complexo (o blob é JSON arbitrário). LWW resolve 95% dos casos com código trivial.
- Quando há conflito real (409), client decide: sobrescreve, merge manual, ou descarta.

### Por que catálogo embedded (`//go:embed catalog.json`)
- Simulados mudam devagar (certificação AWS não muda todo dia).
- Embedded = **zero latência**, **impossível adulterar em runtime**, build reproducible.
- Server-authoritative scoring obriga server a ter o gabarito; ter no binary elimina fetch de DB em hot path.
- Trade-off: atualizar catálogo requer deploy. Aceitável para MVP.

### Por que Problem+JSON em vez de JSON ad-hoc
- RFC 7807 é standard; clients sabem lidar.
- `type` curto permite i18n no cliente sem parse de `detail`.
- Padronização via `HandleDomainError` evita leak de stack no `default` case.

### Por que use cases recebem Command structs (não args soltos)
- Novas opções não quebram assinatura.
- Fácil de serializar para log/replay.
- Handler só preenche struct a partir do body — quase zero lógica.

### Por que `shared.Clock` em vez de `time.Now()`
- Testabilidade: `FixedClock` torna qualquer lógica temporal determinística.
- Evita flakiness em testes de deadline/expiração.
