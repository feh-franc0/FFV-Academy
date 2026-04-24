# CLAUDE.md

## Plano canônico do currículo

**`CURRICULUM_MASTER_PLAN.md` na raiz** é a fonte de verdade histórica do roadmap editorial. **Estado real hoje (pós-Sprint 1–6):**
- **~66 trilhas implementadas · 8 hubs · ~570 artigos** (ver `src/lib/curriculum.ts` — constante `CURRICULUM`).
- Meta original era 40 trilhas/350 módulos; foi ultrapassada.
- Hubs atuais: `hub-ia`, `hub-aws`, `hub-engenharia`, `hub-claude-anthropic`, `hub-fundamentos`, `hub-programacao`, `hub-dados`, `hub-construcao`.
- Trilhas cobrem 10 camadas do Staff/Principal engineer: fundamentos, programação (TS/Python/Go/Rust/Java/C#/C++/C), DS&A, APIs, security, testing, A11y, sistemas distribuídos, SRE/observability, AWS (CLF/DVA/SAA/SAP/FinOps), IA moderna (fundamentos, RAG, agents, fine-tuning, evals, multimodal, safety), Claude/Anthropic, data eng, search/IR, Postgres internals, edge computing, platform eng, performance, crypto, real-time, chaos, product eng, tech leadership, technical writing, system design interview, career.

**Ao descobrir que CLAUDE.md está defasado:** investigue primeiro o estado real via `grep "id: 'trail" src/lib/curriculum.ts` e `ls src/app/aprenda/ | wc -l`, depois atualize este arquivo. Não confie em contagens antigas.

Ao implementar trilha nova: abrir master plan → seguir checklist da seção 9 → apender entrada em `CHANGELOG_CURRICULUM_V2.md`. O `BRIEFING_CURRICULUM_V2.md` permanece como registro histórico do reasoning.

### Onde o foco pedagógico está agora (pós-Sprint 6)

Gap não é mais criar trilha nova — é **densidade e infra pedagógica**:
1. Auditoria de densidade nos artigos mais curtos (<150 linhas) de trilhas técnicas core.
2. Playground de código interativo (Monaco + Pyodide/esbuild-wasm) para TS/Python.
3. Capstones cross-trilha (ex: "RAG Production-Grade" cobre Trail 1+17+39+54+22+11).
4. Glossário auto-linkado inline nos artigos.
5. News (`/news`, `src/data/news.json`) — curadoria editorial manual, zero API, zero custo.

---

## Regra de ouro — VALIDAÇÃO OBRIGATÓRIA antes de declarar "pronto"

**Nunca** declare uma mudança como completa sem rodar:

```bash
npx tsc --noEmit   # 0 erros
npm test           # 100% dos testes (unit + integration + security) passando
npm run build      # build estático limpo
```

Se algum passo falhar, não é pronto. Não prossiga para outra tarefa até resolver.

### O que verificar em cada categoria

- **Unit tests** (`src/tests/unit/`): funções puras — engine, badges, storage, schemas, srs, dailyModule, referral, playlists.
- **Integration tests** (`src/tests/integration/`): fluxos end-to-end em camada de domínio (quiz flow, export/import, SRS review).
- **Security tests** (`src/tests/security/`): **sempre rode**. Cobrem XSS em `?ref=`, prototype pollution em `importState`, URL injection em `getMyReferralLink`, tamper de localStorage, Unicode confusable. Qualquer mudança em `referral.ts`, `engine.ts`, `schemas.ts` ou componentes que lidam com input do usuário exige re-rodar testes de segurança.

### Quando adicionar testes novos

- **Nova função no domínio** (engine, lib/*): teste unitário em `tests/unit/`.
- **Novo fluxo de usuário** (quiz, share, import): teste de integração em `tests/integration/`.
- **Novo campo que aceita input externo** (URL param, arquivo, localStorage): teste de segurança em `tests/security/` — cobrir payloads XSS, SQLi-like, oversize, prototype pollution.

### Padrão de cobertura mínimo

- 100% das funções exportadas de `src/lib/*.ts` têm pelo menos 1 teste.
- Todo boundary de input (URL param, JSON import, form input) tem whitelist/Zod + teste negativo.
- Toda função que muta `GameState` tem teste verificando idempotência.

---

## Visão Geral

**FFV Academy** — Blog técnico gamificado sobre IA, AWS, engenharia de software e Claude/Anthropic.
Site: https://fernandofrancovalle.com · Autor: Fernando Franco Valle.

**Conceito:** Conteúdo editorial (artigos, trilhas, hubs, playlists, glossário) é **gratuito e sem cadastro**. Produtos transacionais (simulados de certificação, certificados verificados) exigem **login mágico email+SMS** e podem ter gate de pagamento. Zero hype, zero dark patterns, zero popup dentro do conteúdo.

---

## Stack & Comandos

- **Next.js 16** (App Router, Turbopack) + **TypeScript** + **Tailwind CSS v4**
- **shadcn/ui sobre `@base-ui/react/*`** (NÃO é Radix — ver Gotchas)
- **`output: "export"`** → site 100% estático (HTML/CSS/JS) hospedado na Hostinger
- **localStorage** (`ffv_academy`) — todo estado do usuário é client-side

```bash
npm run dev        # dev server localhost:3000
npm run build      # build estático em out/
npm run lint       # ESLint
npm test           # vitest run (unit + integration + security)
npm run test:watch # vitest watch
```

**Gotcha: processos órfãos** — se dev server tiver comportamento estranho:
```bash
pkill -f "next-server"; rm -rf .next && npm run dev
```

---

## Deploy (Hostinger)

Quando o usuário disser **"quero o zip"**, **"gera o zip"** ou variação — execute sem pedir confirmação:

```bash
npm run build && bash scripts/deploy-hostinger.sh
```

O script `scripts/deploy-hostinger.sh` converte `out/` → `hostinger/` (Next.js gera `rota.html`, Hostinger precisa de `rota/index.html`) e gera `ffv-academy-hostinger.zip`.

**Upload manual:** File Manager → `public_html` → deletar tudo → upload zip → extrair → mover conteúdo de `hostinger/` para raiz → limpar.

**Ao adicionar nova rota de página**, atualize o array `for route in ...` dentro do `scripts/deploy-hostinger.sh`.

---

## Arquitetura

### Rotas

```
/                         → Home (editorial: hero, hábito, featured, hubs, trilhas, posts)
/ia | /aws | /engenharia | /claude-anthropic         → Hubs temáticos
/fundamentos | /programacao | /dados | /construcao   → Hubs adicionais
/news                     → Portal de notícias curadas (20 mais quentes da semana)
/progresso                → Dashboard do usuário (XP, streak, badges, por hub/trilha)
/<trilha-slug>            → Listagem de artigos da trilha (TrailBlogClient)
/aprenda/<artigo-slug>    → Artigo + quiz + XP (ModuleLayout)
/revisar                  → Fila SRS (revisão espaçada card-by-card)
/simulados                → Simulados pagos com tutor IA (AWS certs)
/preferencias             → Conta + export LGPD
```

### Hubs (8 hubs ativos em `HUBS` de `curriculum.ts`)

| Hub | Rota | Cor | Conteúdo |
|-----|------|-----|----------|
| Inteligência Artificial | `/ia` | `#58a6ff` | trail1, 2, 3, 9, 25, 26, 29, 30, 50, 51, 55 |
| AWS Cloud | `/aws` | `#ff9900` | trail4, 23, 5, 27, 28 |
| Engenharia de Software | `/engenharia` | `#e3b341` | trail7, 8, 10, 11, 21, 22, 33, 34, 40, 42, 52, 53, 59, 60, 61, 63, 66 |
| Claude & Anthropic | `/claude-anthropic` | `#cc785c` | trail13, 17, 18 |
| Fundamentos Técnicos | `/fundamentos` | `#8b949e` | trail12, 14, 15, 16 |
| Programação & Algoritmos | `/programacao` | `#3178c6` | trail19, 20, 36, 43, 44, 45, 46, 47, 48, 49 |
| Dados | `/dados` | `#10b981` | trail24, 38, 39, 54, 62 |
| Construção & Clientes | `/construcao` | `#ec4899` | trail31, 35, 37, 56, 57, 58 |

O GameHUD (desktop) mostra os 4 hubs primários + News + Simulados + Progresso. MobileNav (mobile) mostra 4 hubs primários + News + "Mais" (drawer com hubs extras, simulados, progresso, revisar, preferências). CommandPalette (Cmd/Ctrl+K) navega por tudo.

### Currículo

**Fonte da verdade:** `src/lib/curriculum.ts` — constante `CURRICULUM` (array de `Trail` com `modules`). **Não duplique slugs/títulos aqui** — leia do código.

**~66 trilhas ativas, ~570 artigos.** Cada módulo tem `slug`, `title`, `icon`, `xp`, `readTime`, `desc`, `seoDesc`, `keywords`.

**Slugs são IDs permanentes no localStorage** — nunca renomear sem migração.

---

## Gamificação

Estado em `localStorage` sob chave `ffv_academy` (interface `GameState` em `useGameState.ts`).

**Níveis:** Curioso (0) → Aprendiz (100) → Praticante (250) → Desenvolvedor (500) → Especialista (800) → Arquiteto (1200) → Mestre (1800+)

**SRS:** SM-2 simplificado em `src/lib/srs.ts` (funções puras). Cards criados no quiz, revisados em `/revisar`. Quality: again(0) hard(3) good(4) easy(5). XP por review: again(0) hard(1) good(2) easy(4).

**Streak freeze:** ganhado em `streak % 7 === 0` (máx 2), consumido automaticamente antes de quebrar streak.

### Arquivos-chave

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/curriculum.ts` | Currículo completo (trilhas, módulos, hubs, helpers) |
| `src/lib/engine.ts` | Orquestra XP/streak/completeModule/reviews — persistência via storage adapter |
| `src/lib/badges.ts` | Motor declarativo de badges (regras puras, testáveis isoladas) |
| `src/lib/storage.ts` | **Única porta** para localStorage. Nunca chamar `localStorage.*` fora daqui |
| `src/lib/schemas.ts` | Validação Zod para boundaries (import/export, URLs, forms) |
| `src/lib/constants.ts` | Config única: XP ratios, thresholds de badges, STORAGE_KEYS |
| `src/lib/srs.ts` | SM-2 puro (sem deps de localStorage) |
| `src/lib/auth.ts` | Auth mockado (MVP). Em produção vira HTTP. `TODO(backend):` marcadores |
| `src/lib/simulados.ts` + `simulados-catalog.ts` | Modelo + catálogo de simulados pagos |
| `src/lib/tutor-responses.ts` | Respostas mockadas do tutor IA. Trocar por Claude API |
| `src/lib/certificates.ts` | Emissão + lookup de certificados (hash SHA-256 trunc) |
| `src/lib/news.ts` + `src/data/news.json` | News curada: schema Zod + helpers. 20 itens editorial no JSON |
| `src/hooks/useAuth.ts` | Context de auth (`user`, `requireLogin`) |
| `src/hooks/useGameState.ts` | Hook React para estado do jogo |
| `src/hooks/useTheme.ts` | Toggle dark/light |
| `src/components/ModuleLayout.tsx` | Template de artigo com quiz + TOC |
| `src/components/article/primitives.tsx` | Section, Callout, CodeBlock, ComparisonTable, DecisionBox |
| `src/components/GameHUD.tsx` | HUD fixo (nav, XP, streak, badges, tema) |
| `src/components/HomeClient.tsx` | Home completa (editorial) |
| `src/components/TrailBlogClient.tsx` | Listagem de artigos por trilha |
| `src/components/HubPageClient.tsx` | Página de hub |
| `src/components/ProgressoClient.tsx` | Dashboard `/progresso` |
| `src/components/CommandPalette.tsx` | Palette global Cmd/Ctrl+K |
| `src/components/MobileNav.tsx` | Rodapé mobile com 5 primários + drawer "Mais" pros hubs/atividade extras |
| `src/components/SiteFooter.tsx` | Footer profissional em todas as páginas (hubs, conteúdo, sobre, redes) |
| `src/components/news/NewsClient.tsx` + `NewsCard.tsx` | `/news` com filtros (período/categoria/fonte), cards gradiente de marca |
| `src/components/article/CodePlayground.tsx` | Editor de código client-side. Python (Pyodide CDN) + TS (esbuild-wasm CDN) + JS. Zero backend. Lazy-load de runtime |
| `src/components/article/PrintLayout.tsx` | Elementos print-only: capa, gabarito comentado, colofão. Ativados via `@media print` + `.ffv-printing` |

---

## PDF profissional (material de estudo)

Todo artigo tem botão **PDF** em `ModuleActions` que dispara `window.print()` com CSS específico em `@media print` (ver `globals.css`). O PDF gerado tem estrutura editorial de verdade:

1. **Capa** — ribbon da cor da trilha + logo FFV Academy + título grande + meta grid (tempo/XP/nível) + "Como usar este material". Implementado em `src/components/article/PrintLayout.tsx::PrintCover`.
2. **Conteúdo** — páginas com cabeçalho/rodapé via `@page` + `string()`/CSS dinâmico. `@top-left: FFV Academy`, `@top-right: NOME DA TRILHA`, `@bottom-left: título do módulo`, `@bottom-right: Página N de M`.
3. **Gabarito comentado** — quiz interativo escondido em print, substituído por versão imprimível com respostas marcadas em verde + explicação em amber (`PrintQuizAnswerKey`).
4. **Colofão** — última página com brand, URL canônica, data de geração e licença.

O CSS de print força light mode (overrides das CSS vars), preserva syntax highlight em code blocks, força tabelas a renderizarem em layout desktop (não o stacked mobile), oculta MobileNav/HUD/TOC. **Nunca adicione `hostinger/` nem `ffv-academy-hostinger.zip` ao git** — são build output e já estão no `.gitignore`.

---

## Playground de código interativo

Componente `CodePlayground` (`src/components/article/CodePlayground.tsx`) permite rodar código client-side dentro de artigos. Três linguagens suportadas:

- **`python`** — via Pyodide (CDN jsdelivr). Primeiro uso carrega ~10MB de WASM, depois fica cacheado em `window`. stdout/stderr capturados no output panel.
- **`ts`** — via esbuild-wasm (CDN esm.sh) pra transpilar TS→JS, depois `new Function(console, jsCode)` com console capturado.
- **`js`** — eval direto com console capturado.

**Zero dep npm nova**: tudo carregado sob demanda via CDN. **Zero backend**. Uso em artigo:

```tsx
import { CodePlayground } from '@/components/article/CodePlayground';

<CodePlayground
  lang="python"
  title="Título opcional do experimento"
  accent={accent}
  initial={`print("hello")`}
/>
```

UX: ⌘/Ctrl+Enter pra rodar, Tab = 2 espaços, botão Resetar. Output colorido por tipo (log/info/error). Escalar uso em mais artigos é trivial — só importar o componente.

---

## Tema Dark/Claro

Persistente via `localStorage.ffv_theme`. Script inline no `<head>` (layout.tsx) aplica `data-theme` antes do React → zero FOUC. Vars CSS em `globals.css`.

**Regras:**
- Sempre use `var(--ffv-*)` — nunca hardcode hex
- Para transparência: `color-mix(in srgb, var(--ffv-blue) 12%, transparent)`
- `<html>` tem `suppressHydrationWarning` por causa do script inline

---

## Como adicionar artigo

1. Adicionar módulo em `src/lib/curriculum.ts` (dentro da trilha correta)
2. Criar `src/app/aprenda/<slug>/page.tsx` usando `ModuleLayout` + primitivos
3. Quiz com 3 perguntas (distratores realistas, explanations que ensinam)

## Como adicionar trilha

1. `curriculum.ts` — novo `Trail` no `CURRICULUM` + badge `trailN_done` no `BADGES_DEF`
2. `HomeClient.tsx` — atualizar `hrefByTrailId` (mapa hardcoded trail.id → rota)
3. `src/app/<rota>/page.tsx` — wrapper com `TrailBlogClient trail={CURRICULUM[N]}`
4. `scripts/deploy-hostinger.sh` — adicionar rota no array `for route in ...`
5. Se for novo hub: atualizar `HUBS` em `curriculum.ts` + criar página com `HubPageClient`

---

## Convenções

- **Idioma:** Português brasileiro em todo conteúdo e UI
- **Fontes:** Inter (corpo) · Poppins (títulos) · Roboto Mono (código)
- **Não usar `next/image`** — desabilitado para export estático
- **Trilhas abertas** — sem bloqueio entre trilhas
- **SEO:** cada módulo tem `seoDesc` e `keywords`

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
Nunca ler localStorage em componentes server. Usar `useEffect` + `mounted` state. Padrão em `useTheme.ts` e `useGameState.ts`.

### 3. TrailCard → rota hardcoded
`HomeClient.tsx` tem `hrefByTrailId` que mapeia `trail.id` → rota. **Sempre atualizar ao adicionar trilha.**

### 4. Índices do CURRICULUM
Rotas de trilha usam `CURRICULUM[N]`. Ao remover/inserir trilha, todos os índices subsequentes mudam — verificar todas as páginas de trilha.

### 5. Nunca chamar localStorage direto
Todo acesso passa por `src/lib/storage.ts` (`getRaw`, `setRaw`, `getJSON`, `setJSON`, `clearAll`). Chaves ficam em `STORAGE_KEYS` de `constants.ts`. Motivo: preparação para backend futuro — swap = trocar 1 arquivo.

### 6. Input externo sempre validado em Zod
Qualquer dado vindo de URL, arquivo importado ou localStorage legacy passa pelos schemas em `src/lib/schemas.ts`. `safeParseJSON()` aceita `maxBytes` para bloquear DoS. `GameStateSchema` é `.strict()` — rejeita campos desconhecidos, bloqueando prototype pollution.

### 7. Referral ID é whitelist-only
`GAME_CONFIG.REFERRAL_ID_REGEX = /^[a-z0-9]{3,32}$/`. Nada que escape disso entra em localStorage. Teste isso ao mexer em `referral.ts`.

### 8. Badges idempotentes
`awardBadge()` e `evaluateModuleBadges()` são idempotentes — seguro chamar múltiplas vezes. Componentes ainda usam `useRef` para evitar re-fire em StrictMode dev.

### 9. DNA editorial — nunca colocar login/paywall em conteúdo editorial
Artigos, hubs, trilhas, playlists, glossário: **sempre grátis, sem cadastro, sem popup**. Login só aparece ao tentar ação transacional (simulado, certificado, /preferencias). Se aparecer dúvida se algo deve exigir login — default é **não**.

### 10. Callout tone é "warn", não "warning"
O tipo aceita apenas: `'info' | 'warn' | 'danger' | 'success' | 'neutral'`. Copy-paste de outras libs às vezes traz `tone="warning"` — quebra compile.

### 11. Trilhas novas — append-only no CURRICULUM
Adicionar ao final do array. Páginas de trilha (`src/app/<rota>/page.tsx`) devem usar `CURRICULUM.find(t => t.id === 'trailN')` — não `CURRICULUM[N]`. Quem usar índices fixos se quebra ao inserir trail no meio.

### 12. Capstone final em cada trilha
Padrão pedagógico da FFV: toda trilha termina com `capstone-<nome>` — artigo-projeto hands-on que consolida. 70–80 XP, 16–20 min, sem `nextSuggested` (fim da trilha). Conteúdo: spec → código comentado → teste → release.

---

## Produtos pagos (MVP mockado)

Esta seção documenta a infra transacional que hoje é 100% client-side.
Quando o backend chegar, substituir exatamente os pontos marcados `TODO(backend):`.

### Auth

- **`src/lib/auth.ts`** — adapter mockado. Em produção, as funções `requestToken` e `verifyToken` viram chamadas HTTP. O restante (getCurrentUser, logout, isPaidFor, grantProduct) lê do storage adapter normalmente.
- **Token mágico MVP:** fixo em `000000` (exportado como `MOCK_TOKEN`). Qualquer outro valor é rejeitado em `verifyToken`. O banner `🧪 Modo experimento · token 000000` aparece visível no LoginModal — deve ser removido ao ligar backend.
- **`src/hooks/useAuth.ts` + `src/components/auth/AuthProvider.tsx`** — context global que expõe `user`, `isLoggedIn`, `requireLogin(reason): Promise<UserProfile>`. `requireLogin` abre o LoginModal e resolve quando o usuário conclui; rejeita em cancelamento. Usado antes de ações protegidas (fazer simulado, emitir certificado, abrir /preferencias).
- **`src/components/auth/LoginModal.tsx`** — modal 2-step (form → código 6 dígitos). Validação Zod em email/telefone antes de chamar `requestToken`. Checkbox de marketing **nunca** pré-marcado (LGPD).

### Pagamento (mock)

- **`grantProduct(productId)`** em `auth.ts` — marca produto como pago no UserProfile. Hoje é chamado direto do client em `SimuladoDetailClient` e `PaywallCard`. Em produção, NUNCA confiar nesse flow — substituir por Stripe Checkout → webhook → grantProduct server-side.

### Simulados

- **`src/lib/simulados.ts`** — modelo de dados + helpers puros (scoreAttempt, getWeakTopics, isQuestionAccessible).
- **`src/lib/simulados-catalog.ts`** — catálogo estático. Cada questão tem `explanation` densa em estilo tutor (por que a certa é certa, por que cada distrator erra). Novos simulados: adicionar neste array.
- **Gate de 10 grátis:** `FREE_QUESTIONS_LIMIT = 10`. As 10 primeiras questões de qualquer simulado são acessíveis sem pagar; da 11ª em diante abre `<PaywallCard>`.
- **`SimuladoRunner`** (`src/components/simulado/SimuladoRunner.tsx`) — engine split-pane. Timer persistido em `STORAGE_KEYS.SIMULADO_TIMER` como deadline wall-clock (sobrevive refresh). Progresso salvo automaticamente em `STORAGE_KEYS.SIMULADO_ATTEMPTS`.

### Tutor IA

- **`src/lib/tutor-responses.ts`** — map manual de respostas pra questões selecionadas. `TODO(backend):` substituir por chamada Claude API com prompt caching (system = ementa da certificação; user message = enunciado + tipo de pergunta: por que / analogia / exemplo). Streaming nativo do SDK.
- UI atual simula "digitando…" com setTimeout de 800ms — trocar por streaming real quando backend vier.

### Certificados

- **`src/lib/certificates.ts`** — emissão + lookup client-side. Hash SHA-256 truncado (32 hex) de `email|simuladoId|issuedAt` via `crypto.subtle`.
- **Verificação limitada:** `/verificar?h=HASH` só funciona no dispositivo que emitiu o certificado. Em produção, hash vira lookup no backend (`GET /api/certificates/:hash`).
- PDF é gerado via Canvas → `toDataURL('image/png')` → download. Evita dep extra de @react-pdf/renderer. Formato PNG 1200×780.

### Preferências + LGPD

- **`/preferencias`** — dashboard do usuário logado. Dados pessoais, toggle de consent, lista de produtos pagos, export JSON, excluir conta (clearAll).
- Acesso via avatar no GameHUD (`AuthBadge` com iniciais do usuário).

### Rotas transacionais (em `scripts/deploy-hostinger.sh`)

- `/simulados` (landing)
- `/simulados/<slug>/` (detalhe)
- `/simulados/<slug>/fazer/` (engine)
- `/simulados/<slug>/resultado/` (resultado)
- `/preferencias/`
- `/verificar/` (query string `?h=HASH`)

### Contrato testado (`src/tests/`)

- `unit/auth.test.ts` — request/verify/grant/logout/paidProducts
- `unit/simulados.test.ts` — scoring, weak topics, paywall gate, storage
- `integration/simulado-flow.test.ts` — login → 10 grátis → paywall → paga → finaliza → certificado
- `integration/auth-gate.test.ts` — gate de paidProducts sem login
- `security/auth-security.test.ts` — token brute force (só 000000), XSS em email/phone/name, LGPD consent default false
- `security/simulado-tamper.test.ts` — Zod rejeita tamper em UserProfile e import

Rodar sempre: `npx tsc --noEmit && npm test && npm run build` antes de declarar "pronto".
