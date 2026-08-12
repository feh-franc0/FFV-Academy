## Why

A auditoria (P-05, P-06, P-07) encontrou três defeitos relacionados de defesa em profundidade no frontend:

1. **CSP permissiva**: `script-src` inclui `'unsafe-eval'`, `data:` e `blob:` — `data:` em `script-src` anula
   boa parte do valor da política. Headers de segurança (incluindo CSP) só são aplicados em produção
   (`next.config.ts:27`), então o achado nunca é visível localmente. Um sink de JSON-LD
   (`src/app/jornada/page.tsx`) usa `JSON.stringify` cru em vez de `safeJsonLd`. O sink de markdown de
   cheatsheets depende só de um escaper artesanal, sem DOMPurify como reforço.
2. **`/admin` e conteúdo pago são gate só client-side**: o backend já enforça `RequireAdmin` corretamente em
   toda rota `/api/v1/admin*` (confirmado — não é o achado principal), mas o frontend não tem NENHUM controle
   server-side para renderizar o shell `/admin` — um usuário que edite `role` no `localStorage` vê a interface
   completa (as ações reais continuam bloqueadas pelo backend, mas a superfície de UI é desnecessária).
3. **Bypass de mock-auth presente no bundle**: `MOCK_TOKEN='000000'` é aceito quando
   `NEXT_PUBLIC_E2E_TESTING=true` e não há backend configurado. Confirmado que a flag não entra no build de
   produção hoje (não é build-arg em `deploy.yml` nem ENV no Dockerfile) — mas o caminho existe no bundle e
   depende de duas condições de runtime não se alinharem, em vez de eliminação em tempo de build.

## What Changes

- CSP: remove `'unsafe-eval'` e `data:`/`blob:` de `script-src`; migra o script inline de tema
  (`layout.tsx`) para nonce ou hash.
- `jornada/page.tsx` passa a usar `safeJsonLd` como os outros 13 sites de JSON-LD.
- Sink de markdown de cheatsheets ganha DOMPurify como reforço sobre o escaper existente.
- `/admin/layout.tsx` ganha uma verificação server-side (Route Handler ou fetch de `/api/v1/me` antes de
  renderizar o shell) além do gate client-side existente.
- Caminho de mock-auth (`000000`) é eliminado de builds de produção por guarda de compilação
  (`process.env.NODE_ENV`/dead-code elimination), não só por condição de runtime dupla.

## Fora de escopo

- Não muda a política de que conteúdo educacional é 100% gratuito (estudo livre continua sem paywall).
- Não redesenha o admin — só adiciona uma camada de verificação antes do shell renderizar.

## Impact

- `frontend/next.config.ts`, `frontend/src/app/layout.tsx`, `frontend/src/app/jornada/page.tsx`
- `frontend/src/app/cheatsheets/[slug]/page.tsx`, `frontend/src/lib/markdown.ts`, `frontend/src/lib/sanitize.ts`
- `frontend/src/app/admin/layout.tsx`, `frontend/src/lib/auth.ts`
- Achados cobertos: P-05, P-06, P-07.
