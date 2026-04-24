# CI/CD Pipeline — FFV Academy

Este documento descreve a pipeline de Integração Contínua do monorepo e como
depurar cada etapa localmente.

## Visão geral

| Workflow | Arquivo | Gatilhos | O que roda |
|----------|---------|----------|------------|
| CI | `.github/workflows/ci.yml` | `push` em `main`, `pull_request` para `main` | Lint, type-check, testes unit+contract+coverage, build |
| Security | `.github/workflows/security.yml` | `pull_request`, cron semanal (seg 04:00 UTC), `workflow_dispatch` | gosec (SARIF → Code Scanning), govulncheck, npm audit |
| Dependabot | `.github/dependabot.yml` | Semanal (seg 04:00 UTC) | Bumps de gomod, npm, github-actions, docker |

Tudo roda em `ubuntu-latest` (free tier). Nenhum runner self-hosted necessário.

## Job: Frontend (Next.js)

**Working dir:** `frontend/`

| Step | Comando | Falha se… |
|------|---------|-----------|
| Install | `npm ci` | `package-lock.json` fora de sincronia com `package.json` |
| Lint | `npm run lint` | ESLint encontra erro (não warning) |
| Type-check | `npx tsc --noEmit` | Erro de tipos em TypeScript |
| Test | `npm test` | Algum teste (unit/integration/security) falha |
| Build | `npm run build` | Build estático do Next.js quebra |
| Upload | `actions/upload-artifact` → `out/` | — (retenção: 7 dias) |

**Rodar localmente:**
```bash
cd frontend
npm ci
npm run lint
npx tsc --noEmit
npm test
npm run build
```

## Job: Backend (Go)

**Working dir:** `backend/`

**Services** (containers do runner):
- `postgres:16` — `DATABASE_URL=postgres://ffv:ffv@localhost:5432/ffv_test?sslmode=disable`
- `redis:7` — `REDIS_URL=redis://localhost:6379/0`

| Step | Comando | Falha se… |
|------|---------|-----------|
| Setup Go | via `backend/go.mod` | Versão de Go incompatível |
| Build | `go build ./...` | Código não compila |
| Migrate | `make migrate` (golang-migrate CLI) | SQL inválido ou migrations fora de ordem |
| Lint | `golangci/golangci-lint-action@v6` | Violação de regra ativa (veja `backend/.golangci.yml`) |
| Unit tests | `make test-unit` | Teste em `internal/domain/...` ou `internal/application/...` quebra |
| Contract tests | `make test-contract` | HTTP contract em `test/contract/` quebra |
| Coverage | `make test-cover` | Gera `coverage.out` + `coverage.html`, upload como artifact (14 dias) |
| Integration (opt) | `go test ./test/integration/... -tags integration` | `continue-on-error: true` — informativo |

**Rodar localmente:**
```bash
cd backend
make docker-up                       # sobe postgres + redis
export DATABASE_URL=postgres://ffv:ffv@localhost:5432/ffv_dev?sslmode=disable
make migrate
make lint                            # requer golangci-lint instalado
make test-unit
make test-contract
make test-cover                      # abre coverage.html
```

## Workflow: Security

### Backend
1. **gosec** — `gosec -fmt sarif -out gosec.sarif -exclude=G401,G501 ./...`
   - Resultado vai para **Code Scanning** (aba *Security* do repo).
   - `G401`/`G501` excluídos (ver justificativa em `backend/.golangci.yml`).
   - `continue-on-error: true` — a falha não bloqueia PR; inspecione SARIF.
2. **govulncheck** — `govulncheck ./...`
   - **Bloqueia** PR se vulnerabilidade *real* (código afetado) for encontrada.
   - Se só o módulo está vulnerável mas sua função não é chamada, não falha.

### Frontend
- `npm audit --audit-level=high` — só avisa (não bloqueia).
- Dependabot abre PRs automáticos para bumps.

## Interpretando falhas

| Falha | Onde olhar | Como corrigir |
|-------|------------|---------------|
| `migrate: dirty database` | Log do step Migrate | Alguma migration falhou em execução anterior; localmente rode `make migrate-reset` |
| `golangci-lint`: `errcheck` | Log do step Lint | Checar `err` retornado ou usar `_ = fn()` com comentário |
| `gosec G101` (credentials) | Code Scanning SARIF | Nunca commitar secret; mover para env |
| `govulncheck GO-YYYY-NNNN` | Log do step govulncheck | Bump da dependência via Dependabot ou `go get -u <mod>` |
| Frontend `tsc` erro | Log do step Type-check | Rodar `npx tsc --noEmit` local |
| Build artifact missing | Action `upload-artifact` | Verificar se `frontend/out/` foi gerado |

## Secrets & rotação

Nenhum secret é lido pela pipeline atual (testes usam `config.LoadTest()` com
dummies). Se algum dia for necessário:

- `GITHUB_TOKEN` — gerado automaticamente por workflow, escopo `contents: read`
  + `security-events: write` (para upload SARIF). Não precisa rotar.
- Secrets de runtime (Stripe, Resend, Twilio, Anthropic) vivem no ambiente de
  produção — **não** são usados em CI. Rotação via provedor → atualizar
  `Settings › Secrets and variables › Actions` se algum dia forem adicionados.

## Dependabot

PRs semanais (segunda 04:00 UTC), agrupados por ecosystem:
- `gomod` em `/backend`
- `npm` em `/frontend` e `/video-pipeline`
- `github-actions` em `/`
- `docker` em `/backend/deployments`

Reviewers **não** estão configurados (repo single-maintainer, `@feh-franc0`
revê todos os PRs). Adicionar `reviewers:` em `.github/dependabot.yml` quando
houver time.

## Validação local dos YAMLs

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml')); print('ok')"
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/security.yml')); print('ok')"
python3 -c "import yaml; yaml.safe_load(open('.github/dependabot.yml')); print('ok')"
```
