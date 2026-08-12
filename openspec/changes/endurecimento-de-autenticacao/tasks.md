## 1. Bypass dev com flag dedicada

- [x] 1.1 Nova env `AUTH_DEV_BYPASS_ENABLED` (default false); o bypass `000000` passa a depender dela, não de `APP_ENV`
      — `internal/config/config.go` (`FeaturesConfig.AuthDevBypassEnabled`); `cmd/api/main.go` usa a flag (não `cfg.App.Env=="development"`) para decidir `devMode`.
- [x] 1.2 `config.validate()` falha o boot se a flag for true com `APP_ENV != development`
      — regra em `config.go:validate()`. Travado por `Test_Config_Validate_RejectsDevBypassOutsideDevelopment` (novo, cobre production/staging/test/vazio) e `Test_Config_Validate_AllowsDevBypassInDevelopment`.
- [x] 1.3 `magicMaxAttempts` alto também condicionado à flag, não a `APP_ENV`
      — `cmd/api/main.go`: `magicMaxAttempts` só vira 999 quando `cfg.Features.AuthDevBypassEnabled`, senão fica em 5.
- [x] 1.4 Teste: boot recusado no combo proibido; bypass só ativo em dev
      — **gap encontrado na verificação final e corrigido**: os testes existentes (`feature_flag_bypass_test.go` etc.) cobriam o COMPORTAMENTO do bypass, mas não havia nenhum teste unitário de `config.validate()` em si. Novo `internal/config/config_test.go` (6 casos, incluindo o combo proibido em 4 valores de `APP_ENV`).

## 2. Identidade de rede não forjável

- [x] 2.1 nginx: `proxy_set_header X-Forwarded-For $remote_addr` (sobrescreve, não anexa)
      — `backend/deployments/nginx/conf.d/api.conf`.
- [x] 2.2 Go: rate-limit e `clientIPFromRequest` usam `X-Real-IP`/último elemento confiável
      — `middleware/ratelimit.go` (`ClientIP`, exportada) + `handlers/dto.go` (`clientIPFromRequest` delega para `middleware.ClientIP`, uma implementação só).
- [x] 2.3 Fail-closed no Redis para rotas de auth e tutor
      — `NewRateLimiterFailClosed`; `router.go` usa fail-closed nos limiters de auth/tutor, mantém fail-open no resto (rotas de leitura barata).
- [x] 2.4 Teste: XFF variável não zera o contador; auditoria grava o IP real
      — **mesmo gap de 1.4**: `ClientIP`/`isTrustedProxy` tinham zero teste direto. Novo `internal/interfaces/http/middleware/ratelimit_test.go` (5 casos): proxy não confiável ignora headers forjados, proxy confiável prefere X-Real-IP, cai para o ÚLTIMO elemento de XFF, fallback sem headers, e a prova direta do item — variar X-Forwarded-For de um IP não confiável sempre resolve pro mesmo RemoteAddr.

## 3. Token e cadastro

- [x] 3.1 `Matches` antes de consumir o token (ou consumo que não apague em palpite errado)
      — `magic_token_store.go` ganhou `Peek()` (GET simples, não destrutivo); `verify_magic_link.go` faz Peek→Matches antes de `Consume()` (GETDEL).
- [x] 3.2 "Reenviar código" no `LoginModal`
      — fluxo redesenhado (code-first, registro só quando `registrationRequired`, reenvio de código).
- [x] 3.3 `request-token` deixa de revelar `isNewUser`
      — `auth_handler.go` `RequestToken` não retorna mais o campo; `frontend/src/lib/auth.ts` atualizado.
- [x] 3.4 Aplicar `Registration` no login de e-mail existente, ou recusar explicitamente
      — sentinel `ErrRegistrationRequired` (`domain/shared/errors.go`), mapeado para 400/`type:registration-required` em `handlers/errors.go`; `verify_magic_link.go` checa "precisa de registro" ANTES de consumir o token (preserva o código pra reenvio).
- [x] 3.5 Detecção de reuso de refresh token invalida a família
      — `RefreshTokenUseCase`: reuso de token revogado dispara `RevokeAllForUser`.

## 4. UI e travar

- [x] 4.1 `AdminLayout` observa `carregando` como o `RequireAuth`
      — `frontend/src/app/admin/layout.tsx` ganhou o guard de `carregando`.
- [x] 4.2 Rodar `make test-security` e conferir que a suíte cobre os novos casos (XFF, bypass)
      — `make test-security` verde (3 testes de rate-limit pulam por falta de Redis local neste ambiente — skip explícito, não fallback silencioso). Cobertura de XFF/bypass complementada pelos testes novos de 1.4/2.4.
- [x] 4.3 Atualizar `backend/CLAUDE.md` (tabela de env) e `PENDENCIAS.md`
      — `backend/CLAUDE.md`: linha de `AUTH_DEV_BYPASS_ENABLED` na tabela de env vars, com a regra do `validate()` documentada.

Verificado nesta sessão: `go build ./...`, `go vet ./...` (default), `gofmt -l` limpo (exceto 1 arquivo pré-existente não relacionado, `test/integration/curriculum_importer_test.go`, defeito de formatação de comentário anterior a esta mudança), `go test ./...` — tudo verde.
