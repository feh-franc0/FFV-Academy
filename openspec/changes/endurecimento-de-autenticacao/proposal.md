## Why

A camada de autenticação tem um bypass total ligado por **default de configuração** e um
rate-limit contornável com um header. Ambos confirmados por leitura do código na auditoria
de 10/ago/2026.

| # | Defeito | Evidência | Sev |
|---|---|---|---|
| 1 | **Bypass `000000` ligado por default.** `APP_ENV` tem `default:"development"`; nesse modo o código `000000` autentica qualquer e-mail — inclusive `role=admin` — sem passar pelo Redis. Se a env se perder (container novo, `.env` revertido), o default abre a porta. Única barreira: `vps-setup.sh` gravar `APP_ENV=production` — operacional, não de código. Agravante: `magicMaxAttempts=999` no mesmo modo. | `config.go:45`; `verify_magic_link.go:119-120`; `main.go:178-192` | **P0** |
| 2 | **Rate-limit e auditoria forjáveis via `X-Forwarded-For`.** O nginx **anexa** o XFF do cliente; o Go confia no primeiro elemento quando o `RemoteAddr` é da rede docker. `curl -H "X-Forwarded-For: $RANDOM"` zera o contador. O IP gravado em `audit_logs` (`clientIPFromRequest`) confia no XFF sem nenhuma checagem. | `ratelimit.go:95-110`; `dto.go:20-33`; `nginx/conf.d/api.conf:59` | **P1** |
| 3 | **Rate limiter fail-open em erro de Redis.** Combinado com #2 e com o limite por e-mail (também no Redis), derrubar o Redis remove todas as defesas de aplicação de uma vez. | `ratelimit.go:43-49` | **P2** |
| 4 | **Código errado queima o token e a UI mente.** `Consume` é GETDEL: um dígito errado apaga o código correto do Redis, mas a UI diz "tente novamente" — e não há botão de reenviar. Também permite DoS de login de um alvo conhecido. | `magic_token_store.go:58-76`; `LoginModal.tsx:136` | **P1** |
| 5 | **Enumeração de usuários por design.** `request-token` devolve `isNewUser` a endpoint público. | `request_magic_link.go:144-156` | **P2** |
| 6 | **Dados de cadastro descartados em silêncio** se o e-mail já existe (`findOrCreate` ignora `Registration`). | `verify_magic_link.go:234-237` | **P2** |
| 7 | **`AdminLayout` não observa `carregando`** e pisca "acesso restrito" em URL direta antes de a sessão restaurar. | `admin/layout.tsx:27,34,58` | **P2** |
| 8 | **Rotação de refresh sem detecção de reuso.** Token revogado reapresentado devolve 401, mas não invalida a família — cenário clássico de token roubado passa. | `get_profile.go:326-376` | **P3** |

## What Changes

- Trocar o gatilho do bypass dev por uma flag dedicada (`AUTH_DEV_BYPASS_ENABLED`, default `false`) e **falhar o startup** se ela for `true` com `APP_ENV != development`. O default nunca abre a porta.
- Confiar em IP não forjável: `proxy_set_header X-Forwarded-For $remote_addr` no nginx e, no Go, usar `X-Real-IP` (sobrescrito pelo nginx) ou o último elemento do XFF — inclusive em `clientIPFromRequest` (auditoria).
- Fail-closed nas rotas de custo (auth, tutor) quando o Redis erra; fail-open no resto.
- Reordenar `Matches` antes do `Consume` (ou usar um consumo que não apague em palpite errado) e adicionar "reenviar código" no modal.
- Parar de vazar `isNewUser` no endpoint público; unificar a resposta.
- Aplicar `Registration` no login de e-mail existente, ou recusar explicitamente.
- `AdminLayout` observa `carregando` como o `RequireAuth`.
- Detecção de reuso de refresh: reapresentar um token revogado invalida a família.

## Fora de escopo

- Migrar de OTP para senha ou OAuth.
- Redesenho do fluxo de login além do "reenviar código" e dos estados.

## Impact

- Backend: `config.go` (validação de startup), `verify_magic_link.go`, `request_magic_link.go`, `ratelimit.go`, `dto.go`, `get_profile.go`; `deployments/nginx/conf.d/api.conf`; `cmd/api/main.go`.
- Frontend: `LoginModal.tsx`, `admin/layout.tsx`.
- Risco: a flag de bypass e a mudança de XFF tocam o boot e o proxy — testar o deploy num ambiente descartável antes de produção.
- Achados cobertos: B-P0-1/#1, #2, #13, 1.1–1.8, #18.
