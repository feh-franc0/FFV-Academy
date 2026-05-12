# CI/CD Pipeline — FFV Academy

Este documento descreve a pipeline de Integração Contínua do monorepo e como
depurar cada etapa localmente.

## Visão geral

| Workflow | Arquivo | Gatilhos | O que roda |
|----------|---------|----------|------------|
| CI | `.github/workflows/ci.yml` | `push` em `main`, `pull_request` para `main` | Path-filter → frontend, e2e, backend (matrix Go 1.26), gate `ci-success` |
| Deploy | `.github/workflows/deploy.yml` | `workflow_run` de CI verde em `main`, `workflow_dispatch` | Build Docker → GHCR → Trivy scan → SSH deploy → smoke tests → notify |
| PR Checks | `.github/workflows/pr-checks.yml` | `pull_request` | Auto-label, coverage diff (comment), bundle size |
| Security | `.github/workflows/security.yml` | PR, push em main, cron semanal (seg 04:00 UTC), `workflow_dispatch` | gosec, govulncheck, npm audit, gitleaks, OSV-Scanner, CodeQL (Go + JS/TS) |
| Lighthouse | `.github/workflows/lighthouse.yml` | `pull_request` | Audit do frontend buildado |
| Dependabot | `.github/dependabot.yml` | Semanal (seg 04:00 UTC) | Bumps de gomod, npm, github-actions, docker |

Tudo roda em `ubuntu-latest` (free tier). Nenhum runner self-hosted necessário.

## Composite actions reusáveis

| Action | Path | O que faz |
|--------|------|-----------|
| `setup-go` | `.github/actions/setup-go/action.yml` | Setup Go via `go.mod`, restaura cache de `~/.cache/go-build` e `go mod download` |
| `setup-node` | `.github/actions/setup-node/action.yml` | Setup Node, `npm ci`, cache de Vite/Vitest, opcionalmente Playwright browsers |

Usadas em ci.yml, deploy.yml, security.yml, pr-checks.yml. Mudou setup → muda
em um lugar só.

## Diagrama do pipeline

```
push/PR ─► ci.yml ───────────────────────────────────────────────────► ci-success (gate)
            │                                                                  │
            ├─ changes (paths-filter)                                          │
            ├─ frontend (lint+test+build)  ──┐                                 │
            ├─ e2e (playwright) ◄────────────┘                                 │
            └─ backend (Go matrix [1.26], coverage gate 25%)                   │
                                                                               │
PR ─► pr-checks.yml ─► labeler + coverage-diff (sticky comment) + bundle-size  │
PR ─► security.yml ──► gosec + govulncheck + gitleaks + osv + codeql           │
PR ─► lighthouse.yml ► audit frontend                                          │
                                                                               ▼
                                                          (merge → main) ──► deploy.yml
                                                                               │
                                                          check (DEPLOY_ENABLED)
                                                                               │
                                                          build-push (GHCR + Trivy)
                                                                               │
                                                ┌──────────────┴──────────────┐
                                                ▼                              ▼
                                         deploy-backend                deploy-frontend
                                         (SCP+SSH→VPS)                 (FTP→Hostinger)
                                                │
                                                ▼
                                        smoke-test-backend
                                                │
                                                ▼
                                              notify (webhook opcional)
```

## Required checks (branch protection)

Marcar **apenas** `ci-success` como required check. Ver `docs/BRANCH_PROTECTION.md`
para detalhes — em resumo, jobs gateados por path filter podem ficar "skipped"
e GitHub trata isso como "pendente"; o gate `ci-success` roda com `if: always()`
e consolida o resultado.

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

YAML básico (sintaxe):
```bash
for f in .github/workflows/*.yml .github/dependabot.yml; do
  python3 -c "import yaml; yaml.safe_load(open('$f')); print('ok: $f')"
done
```

Validação semântica completa (recomendado antes de push):
```bash
# Instalar uma vez
go install github.com/rhysd/actionlint/cmd/actionlint@latest

# Lint dos workflows (composite actions são detectadas como "não-workflow"
# e dão falso-positivo; lint só os workflows reais)
~/go/bin/actionlint .github/workflows/*.yml
```

## Debugar uma falha de CI

1. Abra o run em `Actions` tab.
2. O job que falhou tem expand step + log. Procure `::error::` (anotações).
3. Se for backend: baixe o artifact `backend-coverage-<sha>-go<ver>` e abra
   `coverage.html` para ver onde o teste passa/falha.
4. Se for frontend: baixe `ffv-academy-build-<sha>` (ou `playwright-report-<sha>`
   se foi e2e) para inspeção local.
5. Para reproduzir: `bash scripts/pre-push-validate.sh` espelha a maior parte
   do que a CI roda.
6. Para rodar a action localmente, [act](https://github.com/nektos/act) suporta
   maior parte (não suporta service containers nem secrets reais).
