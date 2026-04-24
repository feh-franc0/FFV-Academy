# Load Testing — FFV Academy Backend

Suite de testes de carga baseada em [k6](https://k6.io/) (OSS, gratuito) para validar
SLOs, proteções de rate-limit e comportamento sob carga do backend Go.

> **AVISO**: nunca rode esses scripts contra produção sem autorização explícita.
> Eles geram tráfego sintético pesado e podem disparar alarmes, travar rate limits
> reais ou poluir métricas. O alvo padrão é `http://localhost:8080`.

## O que é k6?

k6 é uma ferramenta de load test escrita em Go, com scripts em JavaScript (ES6).
Não precisa rodar como dependência do projeto Go — o binário é standalone.

## Instalação

**macOS (Homebrew):**
```bash
brew install k6
```

**Linux (Debian/Ubuntu):**
```bash
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg \
  --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" \
  | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

**Docker:**
```bash
docker run --rm -i --network host grafana/k6 run - < smoke.js
```

## Como rodar local

1. Suba dependências e a API:
   ```bash
   cd backend
   make docker-up          # postgres + redis + mailhog
   make migrate            # aplica schema
   make run                # API em :8080
   ```

2. Em outro terminal, execute a suite:
   ```bash
   cd backend/test/load
   ./run-local.sh          # roda smoke + todos os cenários
   ```

   Ou um cenário individual:
   ```bash
   k6 run smoke.js
   k6 run --out json=reports/simulados-list.json simulados-list.js
   ```

3. Rotas autenticadas exigem JWT. Veja seção **Autenticação** abaixo.

## Cenários

| Script | Perfil | O que valida |
|--------|--------|--------------|
| `smoke.js` | 1 VU / 30s | Sanity: `/healthz` e `/readyz` respondem 200 |
| `simulados-list.js` | 50 VUs / 2min | Cache/performance de rota pública — p95 < 200ms |
| `auth-request-token.js` | 100 VUs / 1min | Rate-limit em `/auth/request-token` e validação rápida de email inválido |
| `certificates-verify.js` | 200 VUs / 2min | Lookup de certificado inválido (404) não degrada |
| `tutor-ask-capped.js` | 20 VUs / 1min | Cache de perguntas repetidas + rate limit no tutor (AI) |
| `progress-sync.js` | 30 VUs / 1min | PUT `/progress` com payloads pequenos — p95 < 300ms |

## SLOs alvo (thresholds)

| Tipo de rota | p95 | p99 | Erro |
|--------------|-----|-----|------|
| Health / readiness | < 50ms | < 100ms | 0% |
| CRUD público (listagens, lookups) | < 200ms | < 500ms | < 1% |
| CRUD autenticado | < 500ms | < 1s | < 1% |
| AI / tutor (Anthropic) | < 3s | < 8s | < 5% |
| Auth (email inválido, sem IO) | < 50ms | < 150ms | — |

Cada script define `options.thresholds` e falha o comando se violado.

## Como interpretar os resultados

k6 imprime um sumário com:

- `http_req_duration` — latência total (inclui TLS/DNS/etc). Olhe `p(95)` e `p(99)`.
- `http_req_failed` — taxa de erros. Deve ser próxima de 0%.
- `checks` — assertions que você escreveu (status 200, body contém x). % de sucesso.
- `iterations` / `vus` — throughput.

Exemplo de output saudável:
```
✓ status is 200
http_req_duration..............: avg=82ms   p(95)=190ms  p(99)=410ms
http_req_failed................: 0.12% ✓ 3    ✗ 2497
```

Se um threshold falhar, o comando sai com código != 0 — útil em CI.

## Autenticação em testes

Os scripts que exigem JWT leem a variável de ambiente `TEST_JWT`:

```bash
export TEST_JWT="eyJhbGciOi..."
k6 run tutor-ask-capped.js
```

Como obter um token de teste? Três caminhos (todos em aberto hoje — veja TODOs em `lib/auth.js`):

1. **TODO**: endpoint `/api/v1/dev/token` só habilitado em `APP_ENV=test` que gera JWT
   para um user fake, pulando magic link. Ainda não existe — candidato a PR.
2. **TODO**: CLI `go run ./cmd/api/tools/token --email foo@bar.com` que minta um JWT
   reutilizando o `JWTService` da infra. Ainda não existe.
3. **Manual**: rodar o fluxo real — `POST /auth/request-token` + verificar Mailhog (:8025)
   para pegar o código de 6 dígitos + `POST /auth/verify` para trocar por JWT.
   Exporte o `access_token` em `TEST_JWT`.

Scripts que **não precisam** de `TEST_JWT`: `smoke.js`, `simulados-list.js`,
`auth-request-token.js`, `certificates-verify.js`.

Scripts que **precisam** de `TEST_JWT`: `tutor-ask-capped.js`, `progress-sync.js`.
Eles abortam no `setup()` com mensagem clara se a variável estiver vazia.

## Stripe / Anthropic

Os scripts usam placeholders — não tocam em Stripe checkout real nem disparam
requisições pagas à Anthropic em volume. `tutor-ask-capped.js` usa um pool pequeno
de perguntas repetidas, justamente para testar cache Redis. Se o cache estiver
desligado, o custo pode escalar — monitore.

## Relatórios

`run-local.sh` salva JSON em `reports/`:

```
reports/
  smoke-2026-04-24T1200.json
  simulados-list-2026-04-24T1200.json
  ...
```

Você pode gerar HTML com [k6-reporter](https://github.com/benc-uk/k6-reporter)
ou enviar para Grafana Cloud k6 (free tier) se preferir dashboards.
