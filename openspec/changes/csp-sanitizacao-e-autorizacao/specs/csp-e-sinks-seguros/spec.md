## ADDED Requirements

### Requirement: CSP não permite execução de script arbitrário

`script-src` NÃO PODE (MUST NOT) incluir `'unsafe-eval'`, `data:` ou `blob:`.

#### Scenario: header CSP servido em produção
- **WHEN** o HTML é servido em produção
- **THEN** o header `Content-Security-Policy` não contém `'unsafe-eval'` nem `data:`/`blob:` em `script-src`

### Requirement: Todo sink de conteúdo dinâmico é sanitizado ou escapado

Conteúdo vindo de CMS/banco renderizado via `dangerouslySetInnerHTML` DEVE (MUST) passar por escaping (JSON-LD)
ou sanitização (DOMPurify) antes de chegar ao DOM.

#### Scenario: JSON-LD da jornada
- **WHEN** a página `/jornada` renderiza seu JSON-LD
- **THEN** o conteúdo passa por `safeJsonLd`, como as demais páginas

#### Scenario: markdown de cheatsheet
- **WHEN** um cheatsheet do CMS é renderizado
- **THEN** a saída passa por DOMPurify além do escaper de markdown

### Requirement: /admin tem verificação server-side antes de renderizar

O shell administrativo NÃO PODE (MUST NOT) renderizar para um usuário sem uma verificação de `role==='admin'`
contra o backend.

#### Scenario: role forjado no localStorage
- **WHEN** um usuário sem sessão de admin válida edita `role` no localStorage para `'admin'`
- **THEN** o shell `/admin` não é renderizado, porque a verificação server-side falha

### Requirement: Caminho de mock-auth não existe em build de produção

O código que aceita `MOCK_TOKEN` NÃO PODE (MUST NOT) estar presente no bundle JavaScript de um build de
produção.

#### Scenario: bundle de produção
- **WHEN** `npm run build` roda com `NODE_ENV=production`
- **THEN** o literal `'000000'` (MOCK_TOKEN) não aparece em nenhum chunk gerado
