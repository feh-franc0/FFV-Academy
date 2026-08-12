## Why

A auditoria (P-16) encontrou `CodePlayground.tsx` — um componente sem importadores em `src/` hoje — que
executa código do usuário via `new Function(...)` e carrega runtimes (pyodide, esbuild-wasm) de CDNs que não
estão na CSP (`script-src`/`connect-src`). Está latente: se algum módulo voltar a importá-lo, é execução de
código arbitrário no navegador do usuário fora da política de segurança declarada.

## What Changes

- Confirmar que `CodePlayground.tsx` não é importado por nenhuma rota ativa (grep de import).
- Se não for usado, remover do bundle de produção (o componente pode continuar no repositório como
  referência/rascunho, mas não deve compilar para o `out`/`.next` de produção) — decisão: mover para uma pasta
  não incluída no build, ou envolver a montagem por uma env flag explicitamente desligada em produção.
- Se algum uso legítimo for encontrado, documentar e isolar em iframe sandboxed com CSP própria antes de
  liberar — mas por padrão, tratar como código morto e removê-lo do caminho de build até haver decisão de
  produto de trazê-lo de volta com sandboxing adequado.

## Fora de escopo

- Não implementa sandboxing de verdade para o playground nesta mudança — só fecha a exposição enquanto ele
  está desconectado.

## Impact

- `frontend/src/components/article/CodePlayground.tsx`
- Achado coberto: P-16.
