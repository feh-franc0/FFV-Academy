## Why

A auditoria de 11/ago/2026 rodou `govulncheck` (backend) e `npm audit` (frontend) e encontrou vulnerabilidades
com símbolo **efetivamente alcançado** pelo código, não só presentes no grafo de dependências:

| # | Achado | Pacote | De → Para |
|---|---|---|---|
| P-02 | SQLi (GO-2026-5004), chamado via `LeaderboardRepo.GetByPeriod` | `jackc/pgx/v5` | v5.9.0 → v5.9.2 |
| P-04 | ~22 advisories (SSRF, cache poisoning, DoS), dep direta | `next` | 16.2.4 → 16.3.0 |
| P-08 | `dompurify` com bypass de sanitizer conhecido, dep direta não aplicada | `dompurify` | ≤3.4.12 → patch |
| P-08 | `shadcn` (CLI de scaffold) em `dependencies` arrasta `hono`+MCP SDK (~21 advisories) pro bundle de produção | `shadcn` | mover para `devDependencies` |
| P-12 | 3 CVEs stdlib alcançados (`crypto/tls`, `crypto/x509`, `net/textproto`) | toolchain Go | 1.26.3 → 1.26.5 |

## What Changes

- Bump de `pgx`, `next`, `dompurify`, toolchain Go — todos non-major, baixo risco de quebra.
- Mover `shadcn` para `devDependencies` (ferramenta de scaffold, não roda em runtime).
- Re-rodar `govulncheck`/`npm audit` após cada bump e confirmar o achado específico desaparece.

## Fora de escopo

- Bumps não relacionados a um achado desta auditoria (não é atualização geral de dependências).
- CVEs cujo símbolo não é alcançado pelo código (reportados por `govulncheck` como "imported but not called") — ficam de fora deste pack, risco residual documentado.

## Impact

- `backend/go.mod`, `backend/go.sum`
- `frontend/package.json`, `frontend/package-lock.json`
- `go.work`/toolchain do ambiente de build (CI + Dockerfile `golang:1.26-alpine` — mesma minor, sem bump de imagem necessário se o patch vier do `go.mod`/toolchain directive)
- Achados cobertos: P-02, P-04, P-08, parte de P-12 (toolchain).
