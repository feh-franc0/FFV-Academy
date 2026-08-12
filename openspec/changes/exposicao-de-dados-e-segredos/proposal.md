## Why

Um conjunto de exposições pequenas e independentes, cada uma confirmada por leitura na
auditoria de 10/ago/2026. Nenhuma é catastrófica sozinha; juntas formam uma superfície que
não condiz com uma plataforma que trata dado de aluno.

| # | Defeito | Evidência | Sev |
|---|---|---|---|
| 1 | **`STRIPE_WEBHOOK_SECRET` com default vazio, não validado no boot.** Com billing ligado e a var ausente, um webhook forjado pode disparar `GrantProduct`. O `CLAUDE.md` documenta como `required`; o código não. Mesma classe: `STRIPE_SECRET_KEY`, `ANTHROPIC_API_KEY`, `TWILIO_*`. | `config.go:88,244-249`; `stripe_client.go` | **P1** |
| 2 | **Artigos não publicados são legíveis publicamente.** `FindBySlug` filtra só `deleted_at`, não `published`; rascunhos vazam por slug adivinhado. | `curriculum_repo.go:33-38` | **P2** |
| 3 | **Ranking de trilha expõe nome real sem opt-in.** O adapter de trilha não faz o `JOIN leaderboard_opt_ins` que os outros rankings fazem, nem filtra soft-delete. | `trail_leaderboard_adapter.go:19-33` | **P2** |
| 4 | **`/readyz` público vaza detalhe de infraestrutura** (host/porta/DSN no `err.Error()`), sem auth e sem rate-limit. | `health_handler.go` | **P2** |
| 5 | **`/metrics` Prometheus exposto na internet** — o nginx faz proxy de tudo, contrariando a premissa de "rede interna". | `router.go:98-100`; `api.conf:88-91` | **P2** |
| 6 | **`GET /leaderboard` autenticado devolve `userId` de terceiros** (a versão pública anonimiza; a autenticada não). | `leaderboard_handler.go:33-38` | **P2** |
| 7 | **CORS sem `Vary: Origin`** com `Allow-Credentials: true` incondicional e `Cache-Control: public` em várias respostas — cache intermediário pode servir o ACAO de outra origem. | `common.go:127-144` | **P2** |
| 8 | **Detalhe interno de camada devolvido em 4xx** (`err.Error()` encadeado com `%w`) — revela nomes de repositório/uso. | `errors.go:53-57` | **P3** |
| 9 | **Chave Redis do magic token contém o e-mail em claro** — um dump do Redis expõe a base de e-mails. | `magic_token_store.go:34-39` | **P3** |
| 10 | **`backend/.env` local com chaves reais e permissão 0644** (não versionado; risco local). O template de produção faz `chmod 600`. | `ls -l backend/.env` | **P3** |
| 11 | **nginx da VPS vaza `Server: nginx/1.24.0 (Ubuntu)`** na porta 80 (server_tokens não desligado no host atual). | `curl -I http://…` em 11/ago | **P3** |

## What Changes

- `config.validate()` exige os segredos correspondentes quando a feature está ligada (billing → Stripe; tutor → Anthropic).
- `FindBySlug` público filtra `published = TRUE`; variante interna para o admin.
- Ranking de trilha aplica `JOIN leaderboard_opt_ins` + filtro `deleted_at`, ou anonimiza.
- `/readyz` responde só `"unhealthy"` no corpo e loga o detalhe; `/metrics` restrito por rede no nginx (`deny all`/`allow 172.16/12`).
- `/leaderboard` autenticado anonimiza `userId` de terceiros (devolve o próprio, se necessário).
- `Vary: Origin` sempre; `Allow-Credentials` só quando a origem casa.
- 4xx devolve mensagem estável ao cliente e loga o detalhe encadeado.
- Chave Redis do token por hash do e-mail; `chmod 600` no `.env` local documentado; `server_tokens off` no nginx.

## Fora de escopo

- Rotação das chaves atuais (recomendação operacional ao dono, registrada em riscos).
- Redesenho do modelo de auditoria.

## Impact

- Backend: `config.go`, `curriculum_repo.go`, `trail_leaderboard_adapter.go`, `health_handler.go`, `leaderboard_handler.go`, `common.go`, `errors.go`, `magic_token_store.go`; `deployments/nginx/conf.d/api.conf`.
- Risco: filtrar `published` pode esconder conteúdo que hoje aparece por acidente — conferir o que depende disso antes.
- Achados cobertos: backend #3, #8–#12, #14, #15, #19, #25, e o vazamento de versão do nginx (auditoria própria).
