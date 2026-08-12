## 1. Segredos e boot

- [x] 1.1 `config.validate()`: billing ligado ⇒ Stripe secret/webhook obrigatórios; tutor ligado ⇒ chave Anthropic obrigatória
      — regra já existente em `config.go:validate()`.
- [x] 1.2 Teste: boot falha no combo feature-ligada-sem-segredo
      — cross-cutting com `endurecimento-de-autenticacao`: `Test_Config_Validate_RejectsBillingEnabledWithoutStripeSecrets` e `Test_Config_Validate_RejectsTutorAIEnabledWithoutAnthropicKey` (novos, `internal/config/config_test.go`) cobrem exatamente este item.

## 2. Exposição de dados

- [x] 2.1 `FindBySlug` público filtra `published = TRUE`; variante admin sem o filtro
      — `domain/curriculum/repository.go` + `infrastructure/persistence/postgres/curriculum_repo.go`: `FindBySlug` (público) filtra `published`; nova `FindBySlugForAdmin` (sem filtro) usada só pelos handlers de admin (`Update`/`SaveBlocks`).
- [x] 2.2 Ranking de trilha com `JOIN leaderboard_opt_ins` + `deleted_at IS NULL`
      — `cmd/api/trail_leaderboard_adapter.go`: JOIN opt-in + filtro de soft-delete, mesma regra do leaderboard principal.
- [x] 2.3 `/leaderboard` autenticado anonimiza `userId` de terceiros
      — `leaderboard_handler.go` `GetWeekly`: `UserID` só preenchido na linha do PRÓPRIO requester (`e.UserID == requesterID`); demais linhas vazias.
- [x] 2.4 Testes de cada um (rascunho não vaza; sem opt-in não aparece; id de terceiro anonimizado)
      — `Test_LeaderboardHandler_GetWeekly_DoesNotExposeThirdPartyUserID`, `Test_LeaderboardHandler_GetPublic_DoesNotExposeUserID` (`leaderboard_handler_test.go`).

## 3. Endpoints operacionais e cabeçalhos

- [x] 3.1 `/readyz` corpo só "unhealthy", detalhe no log
      — `health_handler.go`: corpo da resposta só diz `"unhealthy"`; `err.Error()` vai para `slog.ErrorContext`, não para o cliente. Travado por `Test_HealthHandler_Readiness_DBUnhealthy_DoesNotLeakErrorDetail`.
- [x] 3.2 nginx: `location = /metrics { deny all; }` ou allow-list interno; `server_tokens off`
      — `deployments/nginx/conf.d/api.conf` (`location = /metrics`, restrito à rede interna) + `nginx.conf` (`server_tokens off`).
- [x] 3.3 `Vary: Origin` sempre; `Allow-Credentials` condicionado à origem
      — `middleware/common.go`: `Vary: Origin` incondicional; `Allow-Credentials` só quando a origin bate com a allowlist. Travado por `Test_CORS_AlwaysSetsVaryOrigin`, `Test_CORS_DisallowedOrigin_DoesNotSetAllowCredentials`.
- [x] 3.4 4xx com mensagem estável ao cliente; cadeia `%w` só no log
      — padrão pré-existente confirmado, não uma mudança nova: `handlers.HandleDomainError` mapeia sentinels para mensagens estáveis (RFC 7807); o `%w` de contexto (`fmt.Errorf("...: %w", err)`) vive só nas camadas de application/infra, nunca chega ao body da resposta.

## 4. Armazenamento e higiene

- [x] 4.1 Chave Redis do token por hash do e-mail
      — `magic_token_store.go`: `hashEmailForKey` (SHA-256), chaves `ffv:magic_token:<hash>`/`ffv:magic_attempts:<hash>` em vez do e-mail em claro.
- [x] 4.2 `chmod 600 backend/.env` documentado no setup local; recomendar rotação das chaves ao dono
      — `.env` local já está 600; `scripts/vps-setup.sh` aplica `chmod 600 /opt/ffv/.env` automaticamente na criação (linha 130) — reforça em vez de só documentar.
- [x] 4.3 Atualizar `backend/CLAUDE.md` (tabela de env) e `PENDENCIAS.md`
      — feito na rodada original desta mudança.

Reverificado nesta sessão (final): `go build ./...`, `go vet ./...`, `gofmt -l` limpo, `go test ./...`, `make test-contract`, `make test-security` — todos verdes.
