# FFV Academy — Frontend

> **Ver `../CLAUDE.md` para proposta de valor, posicionamento, roadmap de funcionalidades e pitch completo.**

---

## Stack

- **Language**: TypeScript (strict)
- **Framework**: Next.js 16 App Router, React 19
- **Styling**: Tailwind v4 + CSS custom properties (`--ffv-*`)
- **Package manager**: npm
- **Tests**: Vitest + @testing-library/react — 62 arquivos, 562 testes
- **Deploy**: static export (`output: "export"`) → Hostinger via `frontend/out/`

---

## Comandos

```bash
npm run dev    # dev server (Turbopack) → :3000
npm run build  # build estático → out/
npm run test   # vitest run (todos os testes)
npm run lint   # eslint src/ — zero warnings policy
```

---

## Convenções de desenvolvimento

- Sempre rodar `npm run test` após mudanças não-triviais.
- Sempre rodar `npm run lint` antes de finalizar; corrigir todos os erros.
- Preferir Server Components; usar `"use client"` só quando há interatividade.
- Data fetching em Server Components ou Route Handlers, não em client components.
- Não criar arquivo novo sem verificar se já existe algo similar.
- Funções com >40 linhas ou >1 responsabilidade → extrair.
- Testes no mesmo commit que a implementação.
- Ao adicionar campo em `GameState`: atualizar **obrigatoriamente** `engine.ts` + `schemas.ts` + `DEFAULT_STATE` + `migrateState()`.

---

## 🗺️ Mapa de áreas-chave

### Páginas (`src/app/`)

| Rota | Descrição |
|------|-----------|
| `/` | Home — 8 seções modulares em `src/components/home/` |
| `/aprenda/<slug>/` | 900+ módulos (cada um `page.tsx` com JSX + `ModuleLayout` + primitives) |
| `/progresso` | Dashboard pessoal — XP, streak, heatmap, rank, recomendações, bookmarks |
| `/revisar` | Sessão de revisão espaçada (SRS) — `ReviewClient.tsx` |
| `/ranking` | Leaderboard 4 períodos + MyRankCard com XP gap |
| `/mapa` | Grafo visual de trilhas |
| `/simulados` | Simulados de certificação com timer e certificado |
| `/news` | Curadoria com NewsCard (imagens reais + magazine layout) |
| `/search` | Busca real-time de módulos e trilhas |
| `/explorar` | Discovery por hub/trilha |
| `/comunidade` | Página de comunidade |
| `/newsletter` | Opt-in newsletter |
| `/sobre` | Sobre a plataforma |
| `/cheatsheets`, `/roadmaps`, `/playlists` | Recursos complementares |
| `/verificar` | Verificação de certificados |
| `/preferencias` | Configurações do usuário |

### Currículo (`src/lib/curriculum.ts`)
- **Single source of truth**: ~5000 linhas
- Exports: `CURRICULUM`, `HUBS`, `LEVELS`, `BADGES_DEF` + helpers (`getHubStats`, `getHubTrails`, etc.)
- **8 hubs**: IA, AWS, Engenharia, Claude & Anthropic, Fundamentos, Programação, Dados, Profissional Digital
- **66+ trilhas**, **900+ módulos**
- BACKLOG: quebrar em arquivos por trilha (arquivo único está pesado)

### Gamificação — sistema completo

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/lib/engine.ts` | XP, badges (128+), streak, level-up, freeze, SM-2 init. `CURRENT_SCHEMA = 3` |
| `src/lib/srs.ts` | Algoritmo SM-2 real — easeFactor, interval, repetition |
| `src/hooks/useGameState.ts` | Hook principal — loadAsync, saveAsync, markComplete, reviewOne, bookmark, rate |
| `src/lib/progress-sync.ts` | Pull/push backend `/api/v1/progress` (debounced 3s) |
| `src/lib/leaderboard-api.ts` | getPublicLeaderboard, getMyRankAll por período |
| `src/lib/sounds.ts` | Web Audio API — playXPCoin, playLevelUp, playBadge, playPop, unlockAudio |
| `src/lib/toast.tsx` | Toasts celebrativos customizados (badge 🏆, streak 🔥, level ⭐) com animação própria |
| `src/components/GameHUD.tsx` | Top bar fixa — XP com bump animation, streak, meta diária, due cards |
| `src/components/StudyHeatmap.tsx` | Heatmap GitHub-style de 91 dias |
| `src/components/MyRankCard.tsx` | Card de rank em /progresso — XP gap para posição acima |

**GameState (schema v3):**
```ts
{
  xp, level, streak, lastStudyDate, completedModules,
  quizScores, badges, totalStudyTime, startedAt,
  reviewCards, archivedCards, studyDays,
  freezes, dailyGoal, lastReviewDate, lastArticle,
  preferredHub, onboardedAt, articleProgress,
  perfectQuizStreak, earlyMorningDays, trailStartedAt,
  bookmarks, moduleRatings,              // adicionados v3
  schemaVersion: 3
}
```

**Ao adicionar campo ao GameState**, seguir em ordem:
1. `engine.ts` — interface + DEFAULT_STATE + migrateState() + CURRENT_SCHEMA bump
2. `schemas.ts` — GameStateSchema Zod (`.strict()` quebra se campo ausente)
3. `useGameState.ts` — expor no hook se necessário

### Auth
| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/components/auth/AuthProvider.tsx` | Pull progresso ao login, contexto global |
| `src/components/auth/LoginModal.tsx` | Magic link — email + phone BR |
| `src/components/auth/AuthBadge.tsx` | Botão login/logout no GameHUD |

### Module rendering (`src/components/article/`)

| Arquivo | Responsabilidade |
|---------|-----------------|
| `ModuleLayout.tsx` | Wrapper de toda página /aprenda — quiz, streak, badges, TOC |
| `primitives.tsx` | Section, Callout, CodeBlock (Shiki), ComparisonTable, DecisionBox, FlowDiagram, ArchFlow, MatrixDiagram, StackFlow, Timeline, NodeGraph, AnnotatedFormula |
| `ArticleToc.tsx` | TOC sticky desktop — IntersectionObserver, highlight ativo |
| `MobileToc.tsx` | TOC mobile — bottom sheet, trigger FAB |
| `BackToTop.tsx` | Botão flutuante (>50% scroll), z-index acima do MobileToc |
| `ReadingProgressBar.tsx` | Barra de progresso no topo (clamp 2px–4px) |
| `CopyButton.tsx` | Copy em CodeBlock — focus-visible, ffv-no-print |
| `RelatedArticles.tsx`, `Prerequisites.tsx`, `NextSteps.tsx` | Navegação contextual |

**Primitives — notas importantes:**
- `CodeBlock` é async Server Component (Shiki)
- `whitespace-pre` no CodeBlock — scrollbar visível via `scrollbar-width: thin`
- `ComparisonTable` tem 2 versões: desktop (table) + mobile (stacked cards)
- `ArchDiagram` (ASCII puro) — **EVITAR** para novos módulos, preferir `ArchFlow`/`FlowDiagram`/`StackFlow`

### Home (`src/components/home/`)
`Hero`, `GameDemo`, `SocialProofBar`, `HowItWorks`, `ComecarAqui`, `Explorar`, `HomeRanking`, `ComunidadeAutor`, `FinalCta`

- `Hero.tsx` — personalizado para usuários com `lastArticle`: mostra "Continuar: [título]" em vez de "Começar agora"

### Analytics
- Plausible em `app/layout.tsx` (sem cookies, LGPD-ok)
- `src/lib/analytics.ts` — `track('event_name', { props })` — 13 eventos catalogados

### Componentes de engajamento
| Componente | Descrição |
|-----------|-----------|
| `OnboardingModal.tsx` | Primeira visita — 3 perguntas, recomenda hub/playlist personalizada |
| `SyncBanner.tsx` | Visitante com progresso → "logue para sincronizar" (dismiss 7d) |
| `PWAInstallBanner.tsx` | `beforeinstallprompt` — mobile (dismiss 14d) |
| `KeyboardShortcuts.tsx` | Modal "?" com 10 shortcuts listados |
| `BookmarkButton.tsx` | Toggle bookmark com aria-pressed |
| `ModuleRating.tsx` | 👍/👎 por módulo |
| `CelebrationOverlay.tsx` | Overlay de badge/level-up/streak com auto-dismiss 3.2s |

### SEO
- `src/app/sitemap.ts` — gerado dinâmico (CURRICULUM + HUBS + páginas)
- `src/app/robots.ts` — AI crawlers explícitos (GPTBot, ClaudeBot allowlisted)
- `src/lib/metadata.ts` — `getModuleMetadata(slug)` com OG por módulo
- `scripts/generate-og-images.mjs` — gera OG PNG por slug (rodar após build)

---

## ⚠️ Gotchas críticos

### Static export (`output: "export"`)
- `headers()` no `next.config.ts` **NÃO funciona** — configurar CSP via Caddy/Hostinger
- Não usar `dynamic = 'force-dynamic'` em route handlers
- `runtime = 'edge'` só funciona se gerar imagem estática no build
- Imagens externas precisam `images.unoptimized: true` (já configurado)

### CSP (Content Security Policy)
- Em `app/layout.tsx` — só aplicado em prod (`process.env.NODE_ENV !== 'development'`)
- `https://images.unsplash.com` e `https://*.googleusercontent.com` já na lista
- Plausible já allowed em `script-src` e `connect-src`
- Stripe já allowed em `script-src` e `frame-src`

### Zod + GameStateSchema (`.strict()`)
- `GameStateSchema` usa `.strict()` — **qualquer campo não declarado causa rejeição**
- Ao adicionar campo em `GameState`: adicionar como `.optional()` em `schemas.ts`
- Caso contrário, `importState` e testes de export/import **quebram silenciosamente**

### JSX em strings
- Em arrays de options: `['...> 5']` — JSX `{'>'}` NÃO funciona dentro de strings, use `>` direto
- Em JSX text content: `<>{'>'}5</>` — usar `{'>'}` é correto
- Backticks em CodeBlock template literal — escapar como `` \` ``

### Conflitos `public/`
- `public/sitemap.xml` ou `public/robots.txt` causam **erro 500** (conflito com `app/sitemap.ts`)
- REMOVIDOS — **nunca recriar**

### `/search` vs `/search-trilha`
- `/search` = busca real (criada maio/2026)
- A trilha "Search & Information Retrieval" foi movida de `/search` para `/search-trilha`

### Sonner toast animations
- `toast.badge()`, `toast.streak()`, `toast.levelUp()` usam `toast.custom()` + `unstyled: true`
- Animação de enter/exit controlada **internamente** no componente via `useToastFade()` hook
- `globals.css` tem overrides de `[data-sonner-toast]` para animações mais fluidas globalmente
- **Não** usar `toast.custom()` com `unstyled: true` esperando as transitions do Sonner — não funcionam

### Audio (Web Audio API)
- `unlockAudio()` **deve ser chamado** num evento de clique do usuário antes de qualquer som
- GameHUD chama `unlockAudio()` no primeiro clique do header
- ReviewClient chama `unlockAudio()` em `handleSelect()`

---

## 🚀 Deploy e Infraestrutura

### Onde o frontend roda

| Item | Detalhe |
|------|---------|
| **Provedor** | Hostinger — plano Business (hospedagem compartilhada) |
| **Datacenter** | Brasil (latência ~10ms para usuários BR) |
| **Domínio** | `fernandofrancovalle.com` |
| **Tipo de deploy** | Static export (`next.config.ts` → `output: "export"`) → pasta `frontend/out/` |
| **Upload** | FTP automático via GitHub Actions (`SamKirkland/FTP-Deploy-Action`) |
| **Diretório no servidor** | `/public_html/` (configurado em `HOSTINGER_FTP_DIR`) |

### Como o deploy funciona (automático)

```
git push main
  → CI passa (.github/workflows/ci.yml)
  → .github/workflows/deploy.yml dispara
      └── deploy-frontend:
            1. npm ci
            2. npm run build  (usa NEXT_PUBLIC_API_BASE_URL do secret)
            3. FTP sync incremental: frontend/out/ → /public_html/
               (só envia arquivos que mudaram — compara hash)
```

**Não há downtime**: o FTP sync é incremental. Arquivos novos sobem sem derrubar os existentes.

### Deploy manual (emergência)

```bash
cd frontend
NEXT_PUBLIC_API_BASE_URL=https://api.fernandofrancovalle.com npm run build
# Faz upload manual da pasta out/ via FTP ou painel da Hostinger
```

### GitHub Secrets necessários (Settings → Secrets → Actions)

| Secret | Valor |
|--------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.fernandofrancovalle.com` |
| `HOSTINGER_FTP_SERVER` | servidor FTP da Hostinger (ex: `ftp.fernandofrancovalle.com`) |
| `HOSTINGER_FTP_USERNAME` | usuário FTP do painel Hostinger |
| `HOSTINGER_FTP_PASSWORD` | senha FTP do painel Hostinger |
| `HOSTINGER_FTP_DIR` | `/public_html/` |

### Ativar deploy automático

Por padrão o deploy está **desativado** até a infra estar configurada.
Para ativar: GitHub → Settings → Variables → Actions → `DEPLOY_ENABLED` = `true`

### Onde encontrar o FTP da Hostinger

Painel Hostinger → Sites → `fernandofrancovalle.com` → Painel de controle → FTP Accounts.
Cria um usuário FTP dedicado para o CI (não usa o principal).

---

## 📚 Referências cross-projeto

- [`../CLAUDE.md`](../CLAUDE.md) — **pitch completo, proposta de valor, roadmap, posicionamento**
- [`../CHANGELOG_PLATFORM_2026-05.md`](../CHANGELOG_PLATFORM_2026-05.md) — todas as mudanças de maio/2026
- [`../BACKEND_ROADMAP.md`](../BACKEND_ROADMAP.md) — features que dependem de backend
- [`../backend/CLAUDE.md`](../backend/CLAUDE.md) — deploy e infra do backend (VPS + Docker)
- [`../MELHORIAS.md`](../MELHORIAS.md) — roadmap pedagógico/visual
