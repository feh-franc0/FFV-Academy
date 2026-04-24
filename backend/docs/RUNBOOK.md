# RUNBOOK — FFV Academy Backend

Guia operacional. Deve ser suficiente para alguém de plantão executar as tarefas mais comuns sem ter contexto prévio.

## 1. Setup local

Pré-requisitos: Docker, Go 1.25, `make`.

```bash
cd backend
make docker-up                           # postgres + redis + mailhog
export DATABASE_URL=postgres://ffv:ffv@localhost:5432/ffv_dev?sslmode=disable
export REDIS_URL=redis://localhost:6379/0
make migrate                             # aplica todas as migrations
make run                                 # servidor em :8080
```

Variáveis obrigatórias para boot (fail-fast em `config.Load()`): ver `backend/CLAUDE.md` seção "Environment Variables". Em desenvolvimento use o `.env.example` como template; secrets reais NUNCA no repo.

Smoke test:
```bash
curl -sf http://localhost:8080/healthz
curl -sf http://localhost:8080/readyz
curl -sf http://localhost:8080/api/v1/simulados | jq
```

## 2. Migrations

Todas as migrations ficam em `backend/migrations/` (formato `golang-migrate`, numeração zero-padded 6 dígitos).

### Dry-run (verificar pendentes)
```bash
make migrate-status
```

### Forward em produção
```bash
# 1. Exporte DATABASE_URL apontando para o DB de produção (use credenciais read-write).
# 2. Faça backup antes (ver seção 5).
# 3. Aplique:
make migrate
# 4. Confirme versão final:
make migrate-status
```

### Rollback
`make migrate-down` reverte apenas 1 versão. Para vários passos, executar repetidamente. ATENÇÃO: migrations que dropam colunas ou fazem DML são irreversíveis de fato — sempre tenha o backup da seção 5 antes.

### Convenções ao criar migration
- Sempre criar par `up.sql` + `down.sql`.
- Operações destrutivas (drop column/table) devem vir em migration separada, depois do deploy da versão que parou de usar a coluna.
- Adicionar `CREATE INDEX CONCURRENTLY` em produção — não bloquear tabela.

## 3. Rotação de secrets

### `JWT_SECRET`

Trocar o secret invalida **todos os access tokens** imediatamente (bom — é o efeito desejado em incidente). Refresh tokens **continuam válidos** pois são armazenados hashados com SHA-256 no DB, independentes do JWT secret.

Passos:
1. Gerar novo secret (`openssl rand -hex 32`).
2. Atualizar secret no gerenciador (Doppler/Vault/env do PaaS).
3. Redeploy da API (rolling; durante a janela, clientes com access token antigo receberão 401 e farão refresh automático).
4. Monitorar taxa de 401 e volume em `/auth/refresh` — spike controlado é esperado por ~15min (até `JWT_ACCESS_TTL` expirar naturalmente).

### `STRIPE_WEBHOOK_SECRET`
1. Criar novo endpoint no Dashboard do Stripe (ou rotar via "Roll secret").
2. Durante janela de corte: aceitar ambos os secrets (não temos isso hoje — gap conhecido). Estratégia atual: atualizar env e aceitar perda momentânea de webhooks (Stripe retry resolve — até 3 dias).
3. Atualizar env e redeploy.
4. Reprocessar retries pendentes no Dashboard do Stripe se algum evento falhou durante a janela.

### `ANTHROPIC_API_KEY`, `RESEND_API_KEY`, `TWILIO_AUTH_TOKEN`
Rotação simples: novo secret no provedor → atualizar env → redeploy. Impacto zero para clientes autenticados.

### `DATABASE_URL`
Rotar senha via `ALTER USER ffv PASSWORD '...'`, atualizar secret, redeploy. Janela de conexões ativas com senha antiga: drop no pool após redeploy.

## 4. Webhook Stripe travado — diagnóstico

Sintoma: compra paga no Stripe mas `user_products` não atualizou.

Passos:
1. **Dashboard do Stripe** → Developers → Webhooks → endpoint de prod. Ver "Recent deliveries" — olhar response body e status code.
2. Se status não é 200: ler body da resposta (Problem+JSON). Causas comuns:
   - `401 invalid-signature`: `STRIPE_WEBHOOK_SECRET` errado no env.
   - `400 bad-request`: payload malformado (raro — normalmente bug do nosso lado no `extractWebhookEvent`).
   - `500 internal-error`: erro de DB/infra. Olhar logs da API por `request_id`.
3. Query de idempotência — verificar se evento já foi marcado como processado:
   ```sql
   SELECT stripe_event_id, type, processed_at
   FROM stripe_events
   WHERE stripe_event_id = 'evt_xxx';
   ```
   Se `processed_at` existe mas `user_products` não atualizou, houve erro entre `MarkProcessed` e commit — é um bug; investigar logs.
4. Verificar purchase correspondente:
   ```sql
   SELECT id, user_id, product_id, status, stripe_session_id
   FROM purchases WHERE stripe_session_id = 'cs_xxx';
   ```
5. **Replay manual**: no Dashboard do Stripe, clicar em "Resend" no evento. Idempotência garante que double-processing não duplica produto.

## 5. Backup / Restore Postgres

MVP usa `pg_dump` agendado via cron no host do PaaS (ou backup automático do provedor).

### Backup manual (antes de migration de risco)
```bash
pg_dump "$DATABASE_URL" --format=custom --file=backup-$(date +%Y%m%d-%H%M).dump
```

### Restore
```bash
# 1. Criar DB vazio novo (não sobrescreva prod direto).
createdb ffv_restore
# 2. Restaurar:
pg_restore --dbname=ffv_restore --no-owner --no-acl backup-YYYYMMDD-HHMM.dump
# 3. Validar dados, depois swap via DNS/connection string.
```

## 6. SLOs / SLIs propostos

| Métrica | SLO | Janela | Como medir |
|--------|-----|--------|------------|
| Disponibilidade `/healthz` | 99.5% | 30d rolling | uptime check externo |
| p95 latência rotas públicas | < 500ms | 7d rolling | `http_request_duration_seconds` (histograma por rota) |
| p95 latência `/tutor/ask` (miss de cache) | < 4s | 7d | mesmo acima |
| Error rate 5xx | < 1% | 7d | `http_requests_total{status=~"5.."}` / total |
| Webhook Stripe success | 100% em 24h | janela diária | Stripe dashboard + `stripe_events.processed_at` |

Alertas sugeridos (não implementado ainda — gap):
- Burn rate > 2x do SLO por 1h → page.
- 5xx rate > 5% por 5min → page.
- `/readyz` falhou em 3 checks seguidos → page.

## 7. Deploy

Fluxo padrão (GitHub Actions já configurado em `.github/workflows/ci.yml` — não editável por este agente):
1. PR passa em `make ci` (lint + unit + coverage).
2. Merge em `main` → build de imagem Docker.
3. Deploy rolling (zero-downtime): o PaaS troca instâncias respeitando `/readyz`.

Pre-deploy manual para migrations schema-breaking:
1. Aplicar migration **antes** do deploy de código (compatível com ambas versões).
2. Deploy de código.
3. Em release posterior, migration de limpeza (drop de coluna/tabela).

## 8. Runbook de incidente rápido

1. Cliente reporta erro → pedir `X-Request-ID` (header da resposta ou devtools).
2. Buscar no log estruturado por esse ID → achar sequência completa da request.
3. Classificar: infra (db/redis down — `/readyz` 503?) vs bug (stack trace no log).
4. Mitigação: rollback do último deploy (via PaaS) é quase sempre a primeira opção se começou depois de release.
