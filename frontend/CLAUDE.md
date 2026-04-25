# CLAUDE.md — Frontend (Next.js)

## Plano canônico do currículo

**`CURRICULUM_MASTER_PLAN.md` na raiz** é a fonte de verdade histórica do roadmap editorial. **Estado real hoje (pós-Sprint 1–6):**
- **~66 trilhas implementadas · 8 hubs · ~570 artigos** (ver `src/lib/curriculum.ts` — constante `CURRICULUM`).
- Meta original era 40 trilhas/350 módulos; foi ultrapassada.
- Hubs: `hub-ia`, `hub-aws`, `hub-engenharia`, `hub-claude-anthropic`, `hub-fundamentos`, `hub-programacao`, `hub-dados`, `hub-construcao`.

**Ao descobrir que CLAUDE.md está defasado:** verifique o estado real via:
```bash
grep "id: 'trail" src/lib/curriculum.ts | wc -l
ls src/app/aprenda/ | wc -l
```

Ao implementar trilha nova: abrir master plan → seguir checklist da seção 9 → apender entrada em `CHANGELOG_CURRICULUM_V2.md`.

---

## Regra de ouro — VALIDAÇÃO OBRIGATÓRIA antes de declarar "pronto"

**0 falhas é o único resultado aceitável. Qualquer teste vermelho = não está pronto.**

```bash
npx tsc --noEmit   # 0 erros de tipo
npm test           # TODOS os testes têm que passar — unit + integration + security
npm run build      # build estático limpo (sem erros)
```

O CI (`ci.yml`) impõe a mesma sequência. O deploy só acontece se o CI passar inteiro — um único teste falhando bloqueia o deploy.

### Categorias de teste — todas obrigatórias

| Categoria | Localização | O que cobre |
|-----------|-------------|-------------|
| **Unit** | `src/tests/unit/` | engine, badges, storage, schemas, srs, dailyModule, referral, playlists, auth, api-client, news |
| **Integration** | `src/tests/integration/` | quiz flow, export/import, SRS review, simulado flow, auth gate |
| **Security** | `src/tests/security/` | XSS em `?ref=`, prototype pollution em `importState`, URL injection, tamper de localStorage, Unicode confusable, auth brute force |
| **E2E** | `src/e2e/` | Playwright, chromium only, serial workers, baseURL `:3000` |

`npm test` (vitest) roda unit + integration + security juntos. E2E roda separado com `npm run e2e`.

### Quando adicionar testes

- Nova função exportada em `src/lib/`: teste unitário.
- Novo fluxo de usuário (quiz, share, import): teste de integração.
- Novo campo que aceita input externo (URL param, arquivo, localStorage): teste de segurança com payloads XSS, oversize, prototype pollution.

### Cobertura mínima

- 100% das funções exportadas de `src/lib/*.ts` com pelo menos 1 teste.
- Todo boundary de input tem Zod schema + teste negativo.
- Toda função que muta `GameState` tem teste de idempotência.

---

## Visão Geral

**FFV Academy** — Blog técnico gamificado sobre IA, AWS, engenharia de software e Claude/Anthropic.
Site: https://fernandofrancovalle.com · Autor: Fernando Franco Valle.

**Conceito:** Conteúdo editorial (artigos, trilhas, hubs, playlists, glossário) é **gratuito e sem cadastro**. Produtos transacionais (simulados, certificados) exigem login mágico email+SMS e podem ter gate de pagamento. Zero hype, zero dark patterns, zero popup dentro do conteúdo.

---

## Stack & Comandos

| Tecnologia | Versão | Nota |
|------------|--------|------|
| Next.js | 16.2.4 | App Router + `output: "export"` (100% estático) |
| React | 19.2.4 | — |
| TypeScript | ^5 | strict mode |
| Tailwind CSS | ^4 | com `@tailwindcss/postcss` |
| @base-ui/react | ^1.4.0 | NÃO é Radix — ver Gotchas |
| Vitest | ^4 | unit + integration + security |
| Playwright | ^1.59 | E2E (chromium only, serial) |
| @sentry/nextjs | ^10.50 | Error tracking |
| idb | ^8 | IndexedDB wrapper |
| lz-string | ^1.5 | Compressão de GameState |
| dompurify | ^3.4 | Sanitização HTML |
| zod | ^4.3 | Validação em boundaries |

```bash
npm run dev          # dev server :3000 (Turbopack)
npm run build        # build estático → out/
npm run lint         # ESLint
npm test             # vitest run (todos os testes)
npm run test:watch   # vitest watch
npm run test:coverage# cobertura com thresholds
npm run e2e          # playwright test
npm run e2e:ui       # playwright UI mode
```

**Gotcha: processos órfãos:**
```bash
pkill -f "next-server"; rm -rf .next && npm run dev
```

---

## Deploy

### CI/CD (GitHub Actions — automático)

Todo `push main` que passar no CI dispara `.github/workflows/deploy.yml`:

1. **Build + push Docker** (apenas para o backend — o frontend é estático)
2. **Deploy frontend** — `npm run build` com `NEXT_PUBLIC_API_BASE_URL` → FTP para Hostinger
3. **Deploy backend** — SSH na VPS (ver `backend/CLAUDE.md`)

O frontend é reconstruído a cada deploy para garantir que `NEXT_PUBLIC_API_BASE_URL` seja injetado corretamente na build estática.

### Variáveis de ambiente (`.env.local`)

```
NEXT_PUBLIC_API_BASE_URL=          # URL do backend Go (vazio = modo mock)
NEXT_PUBLIC_SENTRY_DSN=            # DSN Sentry (vazio = desabilitado)
```

Em produção, esses valores ficam nos **GitHub Secrets**:
- `NEXT_PUBLIC_API_BASE_URL` → `https://api.fernandofrancovalle.com`
- `NEXT_PUBLIC_SENTRY_DSN` → DSN do projeto no Sentry

### Deploy manual (fallback)

```bash
# Gera out/ e depois envia para Hostinger via FTP
npm run build

# (Legado) zip manual para upload no File Manager:
bash scripts/deploy-hostinger.sh
```

O script `scripts/deploy-hostinger.sh` converte `out/` → `hostinger/` (Next.js gera `rota.html`, Hostinger precisa de `rota/index.html`).

**Ao adicionar nova rota,** atualize o array `for route in ...` no `scripts/deploy-hostinger.sh`.

---

## Arquitetura

### Rotas

```
/                         → Home (editorial: hero, hubs, trilhas, posts)
/ia | /aws | /engenharia | /claude-anthropic       → Hubs primários
/fundamentos | /programacao | /dados | /construcao → Hubs adicionais
/news                     → Portal de notícias curadas
/progresso                → Dashboard (XP, streak, badges, trilhas)
/<trilha-slug>            → Listagem de artigos da trilha (TrailBlogClient)
/aprenda/<artigo-slug>    → Artigo + quiz + XP (ModuleLayout)
/revisar                  → Fila SRS (card-by-card)
/simulados                → Landing + detalhe + runner + resultado
/preferencias             → Conta + export LGPD
/verificar                → Lookup certificado por hash
/playlists                → Playlists temáticas
/roadmaps                 → Roadmaps de carreira
/mapa                     → Mapa do currículo
```

### Hubs (8 ativos em `HUBS` de `curriculum.ts`)

| Hub | Rota | Cor | Trails |
|-----|------|-----|--------|
| Inteligência Artificial | `/ia` | `#58a6ff` | trail1, 2, 3, 9, 25, 26, 29, 30, 50, 51, 55 |
| AWS Cloud | `/aws` | `#ff9900` | trail4, 23, 5, 27, 28 |
| Engenharia de Software | `/engenharia` | `#e3b341` | trail7, 8, 10, 11, 21, 22, 33, 34, 40, 42, 52, 53, 59, 60, 61, 63, 66 |
| Claude & Anthropic | `/claude-anthropic` | `#cc785c` | trail13, 17, 18 |
| Fundamentos Técnicos | `/fundamentos` | `#8b949e` | trail12, 14, 15, 16 |
| Programação & Algoritmos | `/programacao` | `#3178c6` | trail19, 20, 36, 43, 44, 45, 46, 47, 48, 49 |
| Dados | `/dados` | `#10b981` | trail24, 38, 39, 54, 62 |
| Construção & Clientes | `/construcao` | `#ec4899` | trail31, 35, 37, 56, 57, 58 |

GameHUD (desktop) mostra 4 hubs primários + News + Simulados + Progresso. MobileNav (mobile) mostra 4 primários + "Mais" (drawer com hubs extras, simulados, progresso, revisar, preferências). CommandPalette (Cmd/Ctrl+K) navega por tudo.

---

## Gamificação

Estado em `localStorage['ffv_academy']` (interface `GameState` — comprimida com `lz-string`, fallback no IndexedDB via `idb`).

**Níveis:** Curioso (0) → Aprendiz (100) → Praticante (250) → Desenvolvedor (500) → Especialista (800) → Arquiteto (1200) → Mestre (1800+)

**XP:** 70% pela leitura (`XP_BASE_RATIO = 0.7`) + 30% proporcional ao quiz (`XP_QUIZ_BONUS_RATIO = 0.3`).

**SRS:** SM-2 simplificado em `src/lib/srs.ts`. Cards criados no quiz, revisados em `/revisar`. Quality: `again(0)` `hard(3)` `good(4)` `easy(5)`. GC de cards com `easeFactor > 3.0 && interval > 90d` → `archivedCards`.

**Streak freeze:** ganho a cada `streak % 7 === 0` (máx 2), consumido automaticamente ao quebrar streak.

**Daily challenge:** 1 card aleatório por dia com 3× XP. `getDailyChallenge()` em `engine.ts`.

---

## Arquivos-chave

### Lib (domínio client-side)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/curriculum.ts` | Currículo completo (`CURRICULUM` array + `HUBS` + helpers) |
| `src/lib/engine.ts` | Orquestra XP/streak/badges/SRS — 696 linhas, todas as mutations do GameState |
| `src/lib/badges.ts` | Motor declarativo de badges — regras puras, 3 grupos: MODULE, REVIEW, QUIZ |
| `src/lib/storage.ts` | **Única porta** para localStorage. Nunca chamar `localStorage.*` fora daqui |
| `src/lib/schemas.ts` | Validação Zod em todos os boundaries (import/export, URL, forms) |
| `src/lib/constants.ts` | `GAME_CONFIG` (XP ratios, thresholds) + `STORAGE_KEYS` |
| `src/lib/srs.ts` | SM-2 puro (sem deps de localStorage) |
| `src/lib/auth.ts` | Auth adapter — mock em dev, HTTP em produção. `TODO(backend):` marcadores |
| `src/lib/api-client.ts` | HTTP client com retry exponencial, bearer token, Sentry span |
| `src/lib/billing.ts` | Integração Stripe Checkout client-side |
| `src/lib/certificates.ts` | Emissão SHA-256 + lookup (client ou backend) |
| `src/lib/simulados.ts` + `simulados-catalog.ts` | Modelo + catálogo estático de simulados |
| `src/lib/simulados-api.ts` | Endpoints do backend para simulados |
| `src/lib/tutor-api.ts` | Chamadas ao tutor IA (backend) |
| `src/lib/tutor-responses.ts` | Respostas mockadas do tutor (substitui por backend) |
| `src/lib/progress-sync.ts` | Sync bidirecional com `PUT/GET /api/v1/progress` |
| `src/lib/game-state-storage.ts` | Wrapper IndexedDB (fallback `localStorage`) |
| `src/lib/dailyModule.ts` | Lógica do "módulo do dia" |
| `src/lib/referral.ts` | Sistema de referral com bonus XP |
| `src/lib/news.ts` + `src/data/news.json` | News curada: schema Zod + 20 itens editorial |
| `src/lib/playlists.ts` | Modelo de playlists |
| `src/lib/roadmaps.ts` | Roadmaps temáticos de carreira |
| `src/lib/glossary.ts` | Termos + auto-link inline nos artigos |
| `src/lib/sanitize.ts` | DOMPurify wrapper (usado antes de innerHTML) |
| `src/lib/metadata.ts` | Helpers de SEO (title, description, OG) |
| `src/lib/leaderboard-api.ts` | Ranking via backend |
| `src/lib/utils.ts` | Helpers gerais (cn, formatters, etc.) |

### Hooks

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/hooks/useGameState.ts` | Hook React para GameState — sync entre abas via `storage` event, debounce 300ms |
| `src/hooks/useAuth.ts` | Context de auth (`user`, `isLoggedIn`, `requireLogin`, `refresh`, `logout`) |
| `src/hooks/useTheme.ts` | Toggle dark/light com zero FOUC |

### Componentes principais

| Componente | Localização | Responsabilidade |
|------------|-------------|-----------------|
| `GameHUD` | `components/GameHUD.tsx` | HUD fixo desktop: nav, XP bar, streak, badges, tema |
| `MobileNav` | `components/MobileNav.tsx` | Footer mobile + drawer "Mais" |
| `CommandPalette` | `components/CommandPalette.tsx` | Busca global Cmd/Ctrl+K |
| `HomeClient` | `components/HomeClient.tsx` | Home editorial completa |
| `ModuleLayout` | `components/ModuleLayout.tsx` | Template artigo + quiz + TOC + print |
| `TrailBlogClient` | `components/TrailBlogClient.tsx` | Listagem artigos por trilha |
| `HubPageClient` | `components/HubPageClient.tsx` | Página de hub |
| `ProgressoClient` | `components/ProgressoClient.tsx` | Dashboard /progresso |
| `ReviewClient` | `components/ReviewClient.tsx` | Fila SRS /revisar |
| `OnboardingModal` | `components/OnboardingModal.tsx` | Onboarding de primeiro acesso |
| `HabitDashboard` | `components/HabitDashboard.tsx` | Hábitos e streak calendar |
| `LeaderboardWidget` | `components/LeaderboardWidget.tsx` | Ranking semanal |
| `SimuladoRunner` | `components/simulado/SimuladoRunner.tsx` | Engine split-pane do simulado |
| `PaywallCard` | `components/simulado/PaywallCard.tsx` | Gate de pagamento após 10 questões |
| `LoginModal` | `components/auth/LoginModal.tsx` | Modal 2-step email → código 6 dígitos |
| `AuthProvider` | `components/auth/AuthProvider.tsx` | Context global de auth |
| `CodePlayground` | `components/article/CodePlayground.tsx` | Python (Pyodide) + TS (esbuild-wasm) + JS inline |
| `PrintLayout` | `components/article/PrintLayout.tsx` | Capa + gabarito + colofão para PDF |
| `SiteFooter` | `components/SiteFooter.tsx` | Footer profissional |

---

## PDF profissional (material de estudo)

Botão **PDF** em `ModuleActions` dispara `window.print()` com CSS em `@media print` (ver `globals.css`):

1. **Capa** — ribbon da cor da trilha + logo + título + meta grid. `PrintLayout.tsx::PrintCover`.
2. **Conteúdo** — cabeçalho/rodapé via `@page` + `string()` CSS. Trail no topo, paginação no rodapé.
3. **Gabarito comentado** — quiz substituído por versão imprimível com respostas marcadas + explicação.
4. **Colofão** — URL canônica, data de geração, licença.

CSS força light mode no print, preserva syntax highlight, oculta MobileNav/HUD/TOC.

---

## Playground de código interativo

`CodePlayground` (`src/components/article/CodePlayground.tsx`) — zero backend, zero dep nova:

- **`python`** — Pyodide CDN (~10 MB WASM, cacheado em `window`). stdout/stderr capturados.
- **`ts`** — esbuild-wasm CDN para transpilar TS→JS, depois `new Function()` com console capturado.
- **`js`** — eval direto com console capturado.

```tsx
<CodePlayground lang="python" accent={accent} initial={`print("hello")`} />
```

UX: ⌘/Ctrl+Enter para rodar, Tab = 2 espaços, botão Resetar. Output colorido por tipo.

---

## Tema Dark/Claro

Persistente via `localStorage.ffv_theme`. Script inline no `<head>` (em `layout.tsx`) aplica `data-theme` antes do React → zero FOUC.

**Regras:**
- Usar `var(--ffv-*)` — nunca hardcode hex.
- Para transparência: `color-mix(in srgb, var(--ffv-blue) 12%, transparent)`.
- `<html>` tem `suppressHydrationWarning` por causa do script inline.

---

## Como adicionar artigo

1. Adicionar módulo em `src/lib/curriculum.ts` (dentro da trilha correta).
2. Criar `src/app/aprenda/<slug>/page.tsx` usando `ModuleLayout` + primitivos.
3. Quiz com 3 perguntas (distratores realistas, explanations que ensinam).

## Como adicionar trilha

1. `curriculum.ts` — novo `Trail` no final do `CURRICULUM` array (append-only).
2. `HomeClient.tsx` — atualizar `hrefByTrailId` (mapa hardcoded trail.id → rota).
3. `src/app/<rota>/page.tsx` — wrapper com `TrailBlogClient trail={CURRICULUM.find(t => t.id === 'trailN')}`.
4. `scripts/deploy-hostinger.sh` — adicionar rota no array `for route in ...`.
5. Se for novo hub: atualizar `HUBS` em `curriculum.ts` + criar página com `HubPageClient`.

---

## Convenções

- **Idioma:** Português brasileiro em todo conteúdo e UI.
- **Fontes:** Inter (corpo) · Poppins (títulos) · Roboto Mono (código).
- **Não usar `next/image`** — desabilitado para export estático.
- **Trilhas abertas** — sem bloqueio entre trilhas.
- **SEO:** cada módulo tem `seoDesc` e `keywords`.
- **Capstone:** toda trilha termina com `capstone-<nome>` — hands-on, 70–80 XP, 16–20 min, sem `nextSuggested`.

---

## Gotchas

### 1. base-ui, não Radix
```tsx
// ❌ asChild não existe (Radix)
<TooltipTrigger asChild><button>...</button></TooltipTrigger>

// ✅ Usar render prop (base-ui)
<TooltipTrigger render={<button type="button" onClick={fn} />}>
  {children}
</TooltipTrigger>
```

### 2. Hidratação e localStorage
Nunca ler localStorage em componentes server ou fora de `useEffect`. Padrão em `useTheme.ts` e `useGameState.ts`.

### 3. TrailCard → rota hardcoded
`HomeClient.tsx` tem `hrefByTrailId`. **Sempre atualizar ao adicionar trilha.**

### 4. CURRICULUM — append-only
Adicionar ao final do array. Usar `CURRICULUM.find(t => t.id === 'trailN')` — nunca `CURRICULUM[N]`.

### 5. Nunca chamar localStorage direto
Todo acesso passa por `src/lib/storage.ts`. Chaves em `STORAGE_KEYS` de `constants.ts`.

### 6. Input externo sempre em Zod
URL param, arquivo importado, localStorage legacy → `src/lib/schemas.ts`. `safeParseJSON()` tem `maxBytes` (DoS prevention). `GameStateSchema` é `.strict()` (prototype pollution blocker).

### 7. Referral ID é whitelist-only
`GAME_CONFIG.REFERRAL_ID_REGEX = /^[a-z0-9]{3,32}$/`. Testar ao mexer em `referral.ts`.

### 8. Badges idempotentes
`awardBadge()` e `evaluateModuleBadges()` são idempotentes. Componentes usam `useRef` para evitar re-fire em StrictMode.

### 9. DNA editorial — conteúdo sempre grátis
Artigos, hubs, trilhas, playlists, glossário: **sem cadastro, sem popup**. Login só em ação transacional (simulado, certificado, /preferencias). Dúvida → default é **não**.

### 10. Callout tone
Aceita: `'info' | 'warn' | 'danger' | 'success' | 'neutral'`. Não `'warning'`.

### 11. Modo mock vs modo real
`NEXT_PUBLIC_API_BASE_URL` vazio → modo mock (token `000000`, `grantProduct` client-side).
`NEXT_PUBLIC_API_BASE_URL` preenchido → modo real (HTTP calls para o backend Go).

---

## Produtos pagos (MVP → Backend)

### Auth

- **`src/lib/auth.ts`** — adapter mockado. Em produção, `requestToken`/`verifyToken` viram HTTP.
- **Token mágico MVP:** fixo em `000000`. Banner `🧪 Modo experimento · token 000000` aparece no LoginModal — remover ao ligar backend.
- **`requireLogin(reason)`** — abre LoginModal e resolve quando usuário conclui; rejeita em cancelamento.

### Pagamento

- **`grantProduct(productId)`** — mock client-side. Em produção: Stripe Checkout → webhook → grant server-side (NUNCA confiar no client).
- **`src/lib/billing.ts`** — cria sessão Stripe Checkout e parseia webhook events.

### Simulados

- **Gate de 10 grátis:** `FREE_QUESTIONS_LIMIT = 10`. Da 11ª em diante abre `<PaywallCard>`.
- **Timer:** persistido em `STORAGE_KEYS.SIMULADO_TIMER` como deadline wall-clock (sobrevive refresh).
- **`SimuladoRunner`** — engine split-pane. Progresso salvo automaticamente.

### Tutor IA

- **`src/lib/tutor-responses.ts`** — map manual de respostas mock. `TODO(backend):` substituir por Claude API com prompt caching + streaming.
- Simula "digitando…" com setTimeout 800ms — trocar por streaming real.

### Certificados

- **`src/lib/certificates.ts`** — emissão hash SHA-256 trunc (32 hex) via `crypto.subtle`.
- **Verificação limitada:** `/verificar?h=HASH` só funciona no dispositivo que emitiu. Em produção → `GET /api/v1/certificates/{hash}`.
- **`src/lib/progress-sync.ts`** — sincroniza `GameState.completedModules` com `PUT /api/v1/progress`.

### LGPD / Preferências

- **`/preferencias`** — dados pessoais, toggle de consent, lista de produtos, export JSON, excluir conta.
- `MARKETING_CONSENT` default = `false` sempre. Nunca pré-marcar checkbox.

---

## Contrato testado (`src/tests/`)

```
unit/auth.test.ts              → request/verify/grant/logout/paidProducts
unit/simulados.test.ts         → scoring, weak topics, paywall gate, storage
unit/engine.test.ts            → XP, streak, badges, SRS lifecycle
unit/badges.test.ts            → todas as regras de badge (module/review/quiz)
unit/schemas.test.ts           → validação Zod, safeParseJSON maxBytes
unit/storage.test.ts           → localStorage adapter, SSR safety
unit/referral.test.ts          → whitelist, bonus XP, regex
unit/curriculum-integrity-full → slugs únicos, módulos sem órfãos
integration/simulado-flow      → login → 10 grátis → paywall → paga → finaliza → cert
integration/auth-gate          → gate de paidProducts sem login
security/auth-security         → token brute force, XSS em email/phone/name, LGPD default
security/importState           → prototype pollution, oversize, tamper
security/csp.test.ts           → Content-Security-Policy headers
```

Rodar sempre antes de declarar "pronto":
```bash
npx tsc --noEmit && npm test && npm run build
```
