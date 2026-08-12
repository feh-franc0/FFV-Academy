## 1. CSP

- [x] 1.1 Remover `'unsafe-eval'`, `data:`, `blob:` de `script-src` em `next.config.ts` — feito e verificado com Playwright real (build → `.next/standalone` + `.next/static` copiado → `node server.js` → Chromium headless): zero violações de CSP para essas três diretivas.
- [x] 1.2 Script inline de tema em `layout.tsx` — **testado e revertido**: uma tentativa de migrar para hash SHA-256 (removendo `'unsafe-inline'`) quebrou a hidratação RSC do Next.js — os scripts `self.__next_f.push(...)` injetados por request têm hash diferente a cada build/rota e não podem ser cobertos por um hash estático. `'unsafe-inline'` foi mantido em `script-src`, com o achado documentado em comentário no `next.config.ts`. `unsafe-eval`/`data:`/`blob:` continuam removidos (tarefa 1.1).
- [x] 1.3 Confirmado: `NODE_ENV==='production'` como condição dos headers é intencional (Fast Refresh do dev precisa de `eval`; dev não é exposto à internet) — documentado em comentário acima do early-return em `next.config.ts`.

## 2. Sinks de HTML

- [x] 2.1 `jornada/page.tsx` usa `safeJsonLd` em vez de `JSON.stringify` cru.
- [x] 2.2 Reavaliado: DOMPurify (`sanitizeHTML`/`sanitizeText`) é NO-OP em Server Component — precisa de `window`, ausente no SSR do Node, então não protegeria o sink de `cheatsheets/[slug]/page.tsx` (Server Component assíncrono). A defesa real já existente é a ordem escape-antes-da-estrutura em `renderMarkdown` (`lib/markdown.ts`): `escapeHtml` roda sobre o texto inteiro ANTES de qualquer regex estrutural (heading, lista, link) ser aplicado, então nenhum caractere especial cru sobrevive até uma posição de HTML real — inclusive quebra de atributo `href`. Verificado por trace manual e pelos 7 testes novos da tarefa 2.3.
- [x] 2.3 `src/tests/security/xss.test.ts` — comentário desatualizado ("SSG 100% estático, não usa dangerouslySetInnerHTML") reescrito para descrever os ~20 sinks reais e por que DOMPurify não os protege no servidor. Adicionado `describe('XSS — renderMarkdown ...')` com 7 testes cobrindo os 7 payloads padrão + posição estrutural (heading/lista/code fence) + `javascript:` em link + quebra de atributo `href` + renderização legítima. 22/22 testes do arquivo passam.

## 3. Autorização de /admin

- [x] 3.1 `admin/layout.tsx` reescrito: shell só renderiza após `syncProfileFromServer()` confirmar `role==='admin'` via `POST /api/v1/auth/refresh` (sem fallback de cache — ao contrário de `refreshSession()`, que cai para localStorage em erro de rede). Estado `adminConfirmado: boolean | null` — `null` mostra spinner de confirmação, nunca o shell nem "sem permissão", até haver resposta real do servidor. Fecha o bypass de editar `role` no localStorage via devtools (a casca da UI não aparecia mais, ainda que o backend já recusasse toda ação real via `RequireAdmin` — este gate é sobre não mostrar a UI, não sobre autorização de dado, que já era fail-closed no backend).
- [x] 3.2 `src/tests/render/AdminLayout.test.tsx` (novo, 5 testes): não-logado nunca chama `syncProfileFromServer`; logado + servidor confirma admin → shell renderiza; logado + servidor diz NÃO-admin mesmo com cache local dizendo `role==='admin'` → "Sem permissão", shell nunca renderiza (o teste que trava P-06); `syncProfileFromServer` falha/retorna `null` → falha fechado; enquanto aguarda resposta → nem shell nem "sem permissão" visíveis. 5/5 passam.

## 4. Eliminar mock-auth de builds de produção

- [x] 4.1 Reavaliado o guard de compilação: `hasBackend()` é uma checagem de runtime (lê `NEXT_PUBLIC_API_BASE_URL`), não `NODE_ENV` estático — nenhum minificador faz DCE do bloco mock só por isso, e o comentário anterior em `auth.ts` alegando o contrário estava **errado** (corrigido — ver `auth.ts:68-84`). Decisão: não fazer code-splitting via `import()` dinâmico para isolar o mock em chunk separado — refatoração de risco desproporcional ao ganho, dado que a garantia funcional real já existe em duas camadas independentes: (1) `deploy.yml` sempre injeta `NEXT_PUBLIC_API_BASE_URL` como build arg, então `hasBackend()` é `true` em todo deploy real e o bloco mock nunca executa; (2) `verifyToken` tem guarda explícita `if (IS_PRODUCTION || token !== MOCK_TOKEN)`, independente de `hasBackend()`.
- [x] 4.2 Literal `'000000'` **continua presente** no bundle de produção (comentário anterior alegando remoção por tree-shaking era falso — corrigido). Como o bloco que o usa é estruturalmente inalcançável em todo deploy real (ver 4.1), a garantia travada por teste é a propriedade FUNCIONAL, não a ausência do literal: `auth-backend.test.ts` — "MOCK_TOKEN não recebe tratamento especial" — com backend configurado, `verifyToken(email, MOCK_TOKEN, ...)` é apenas repassado ao backend real via `POST /api/v1/auth/verify`, que o rejeita (401) como qualquer outro token inválido. 20/20 testes do arquivo passam.

## 5. Travar

- [x] 5.1 `npx tsc --noEmit`, `npm run lint`, `npx vitest run`, `npm run build` — todos verdes (verificado ao final da implementação).
- [x] 5.2 `frontend/CLAUDE.md` — a atualizar com a CSP final (script-src sem eval/data/blob, com unsafe-inline documentado) e o gate server-side de `/admin`.
