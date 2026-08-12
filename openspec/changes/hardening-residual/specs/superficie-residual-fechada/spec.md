## ADDED Requirements

### Requirement: Componentes que executam código arbitrário não compilam para produção sem sandboxing

Nenhum componente que execute código do usuário via `new Function`/`eval` PODE (MUST NOT) estar no bundle de
produção sem estar isolado em um contexto sandboxed (iframe com CSP própria) e coberto pela CSP declarada do
site.

#### Scenario: build de produção
- **WHEN** `npm run build` roda para produção
- **THEN** nenhum chunk gerado carrega runtimes de execução de código (pyodide, esbuild-wasm) de hosts fora da CSP declarada
