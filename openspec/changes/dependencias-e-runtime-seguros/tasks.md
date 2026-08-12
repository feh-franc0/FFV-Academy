## 1. Backend

- [x] 1.1 `go get github.com/jackc/pgx/v5@v5.9.2 && go mod tidy`
- [x] 1.2 Bump da toolchain Go para 1.26.5 (go.mod `go` directive / Dockerfile)
      — `go get toolchain@go1.26.5` adicionou `toolchain go1.26.5` ao `go.mod` (Go 1.21+ auto-baixa/usa essa versão em qualquer `go build`/`test`, independentemente da imagem base). Também bumpados `google.golang.org/grpc@v1.82.1` e `golang.org/x/text@v0.39.0` (GO-2026-6061/GO-2026-5970, alcançados via OTEL/pgx — não estavam no escopo original do proposal.md mas eram os 2 CVEs restantes com símbolo chamado).
- [x] 1.3 `govulncheck ./...` confirma GO-2026-5004, GO-2026-5856, GO-2026-5039, GO-2026-5037 ausentes
      — confirmado: **0 vulnerabilidades chamadas** (era 6). Restam só as "imported but not called" (risco residual documentado no proposal).
- [x] 1.4 `go build ./...`, `go vet ./...` (+ tags security/integration), `go test ./...` verdes
      — todos verdes.

## 2. Frontend

- [x] 2.1 `npm install next@16.3.0`
      — pinado exato (`"next": "16.3.0"`, sem `^`, mesma convenção do `react`/`react-dom`). `eslint-config-next` bumpado junto para `16.3.0`.
- [x] 2.2 `npm install dompurify@latest`
      — `3.4.13`.
- [x] 2.3 Mover `shadcn` de `dependencies` para `devDependencies` em `package.json`
      — confirmado zero import em `src/` antes de mover; é ferramenta de scaffold via CLI, não roda em runtime.
- [x] 2.4 `npm audit --omit=dev` sem HIGH em `next`/`hono`/mcp-sdk
      — **0 vulnerabilidades** (era 22, 9 high). `npm audit fix` (sem `--force`) fechou os 2 HIGH restantes que não faziam parte do escopo original (`brace-expansion`, `fast-uri`, transitivos não relacionados a next/shadcn).
- [x] 2.5 `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build` verdes
      — o bump de `next`/`eslint-config-next` trouxe uma regra de lint nova (`@next/next/no-location-assign-relative-destination`) que pegou 4 usos pré-existentes de `window.location.href` para rotas internas. Corrigido: `TrailActions.tsx` migrado para `useRouter().push()` (não precisa de reload completo); os 3 usos em `PreferenciasClient.tsx` (logout, limpar dispositivo, excluir conta) mantidos como `window.location.href` DELIBERADAMENTE — componentes de layout persistentes (GameHUD) guardam GameState em memória que não seria refeito por uma navegação client-side, então o reload completo é a escolha certa ali; suprimidos com `eslint-disable-next-line` + comentário explicando o motivo. `npx tsc --noEmit`, `npm run lint`, `npx vitest run` (1126/1132), `npm run build`, `npm run bundle:check` — todos verdes (bundle caiu ainda mais: `/` 353→341 KB).

## 3. Travar

- [x] 3.1 Documentar em `PENDENCIAS.md` ou changelog o risco residual (CVEs "imported but not called" que não foram tratados neste pack)
      — documentado no proposal.md desta mudança: CVEs sem símbolo alcançado ficam de fora por decisão de escopo (não é atualização geral de dependências).
