## 1. CodePlayground

- [x] 1.1 Confirmado via `grep -rn "CodePlayground" src/` que não havia nenhum importador ativo — só a própria definição e uma menção em comentário de teste.
- [x] 1.2 Removido do caminho de build de produção: `git mv src/components/article/CodePlayground.tsx drafts/CodePlayground.tsx` — `drafts/` é sibling de `src/`, fora do `include` do Next e explicitamente adicionado ao `exclude` de `tsconfig.json` (junto de `marketing`, já excluído pelo mesmo motivo). Decisão de produto documentada em comentário no topo do arquivo movido: fica como rascunho/referência, não compila para `tsc`/`eslint`/`next build`.
- [x] 1.3 Requisito de sandboxing (iframe com CSP própria, hosts de CDN só na CSP do iframe) registrado em `PENDENCIAS.md`, item **F-2**, com os passos mínimos antes de religar.

## 2. Travar

- [x] 2.1 `npm run build` rodou limpo; `scripts/check-no-code-execution-cdns.mjs` (novo — varre `.next/static/chunks/**/*.js` procurando `cdn.jsdelivr.net/pyodide` e `esm.sh/esbuild-wasm`) confirma **0 de 74 chunks** com referência aos runtimes. Prova negativa feita: injetei um chunk fake com a URL do Pyodide, o gate falhou com a mensagem certa (exit 1), removi o chunk, gate voltou a passar — confirma que ele de fato pega regressão, não só a ausência atual. Wired em `package.json` (`npm run check:no-code-execution-cdns`) e no CI (`ci.yml`, logo após `bundle:check`) — mede o bundle real a cada push, não depende de ninguém lembrar de rodar manualmente.
- [x] 2.2 `npx tsc --noEmit`, `npm run lint` (1148 testes → sem relação, mas 1148/1148 passam via `npx vitest run`), `npx vitest run` — todos verdes. Bônus: mover o arquivo tirou um hex-de-tema-duplicado do `check-hex-in-style.mjs` (88 → 87 ocorrências); `TETO` descido pra 87 no mesmo commit, travando o ganho.
