# Branch protection — main

Configuração manual no GitHub UI (Settings → Branches → Add rule para `main`).
Documentado aqui para reprodutibilidade caso o repo seja recriado.

## Regras obrigatórias

### Status checks
- [x] **Require status checks to pass before merging**
- [x] **Require branches to be up to date before merging**
- Checks requeridos (apenas o gate consolidado, NUNCA os jobs individuais):
  - `CI success` (job `ci-success` em `.github/workflows/ci.yml`)
  - `Gitleaks (secret scanning)`
  - `Lighthouse Audit` (opcional — pode ficar como advisory)

> **Por que só o `ci-success`?** Jobs individuais (`frontend`, `backend`, `e2e`)
> são gateados por path filter e podem ficar em "skipped". GitHub trata
> "skipped" como "pendente" se marcado como required → bloqueia merge para
> sempre. O job `ci-success` roda com `if: always()` e consolida o resultado,
> então nunca fica skipped.

### Histórico
- [x] **Require linear history** (sem merge commits — só rebase ou squash)
- [x] **Do not allow bypassing the above settings** (até admins respeitam)

### Pushes
- [ ] Require pull request reviews — **deixar OFF** enquanto for dev solo
      (re-ativar quando houver time, com `required_approving_review_count: 1`)
- [x] **Require signed commits** (recomendado — GPG ou SSH signing)
- [x] **Restrict who can push to matching branches** — só `@feh-franc0`
- [x] **Block force pushes**
- [x] **Block deletions**

### Pós-merge
- [x] **Automatically delete head branches** (Settings → General → Pull Requests)

## Regras opcionais
- [ ] Require deployments to succeed before merging — só faz sentido se o
      ambiente `production` virar required (não é o caso atual).
- [ ] Lock branch — bloqueia QUALQUER mudança. Útil para freeze pré-release.

## Auditoria
Para verificar a configuração atual via API:

```bash
gh api repos/feh-franc0/fernandofrancovalledotcom/branches/main/protection
```
