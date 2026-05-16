# FFV Academy — Frontend

> **Ver `../CLAUDE.md` para proposta de valor, posicionamento, roadmap de funcionalidades e pitch completo.**

---

## Stack

- **Language**: TypeScript (strict)
- **Framework**: Next.js 16 App Router, React 19
- **Styling**: Tailwind v4 + CSS custom properties (`--ffv-*`)
- **Package manager**: npm
- **Tests**: Vitest + @testing-library/react — 62 arquivos, 562 testes
- **Deploy**: **SSR Docker** (`output: "standalone"`) → imagem `ghcr.io/feh-franc0/ffv-frontend` rodando na VPS Hostinger KVM (Boston). Servido por Nginx reverse proxy junto com a API. **⚠️ Migração DNS+SSL pendente** — ver seção [Deploy e Infraestrutura](#-deploy-e-infraestrutura) e [README raiz](../README.md#migração-dnsssl-pendente).

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

### SSR Docker (`output: "standalone"`)
- O bundle final é uma imagem Docker (`ffv-frontend`) que roda **Node.js 24/7** na VPS.
- `headers()` em `next.config.ts` **FUNCIONA** — CSP HTTP real é a fonte de verdade (ver bloco abaixo).
- `dynamic = 'force-dynamic'` e Server Actions funcionam.
- `generateStaticParams` continua sendo usado para pré-renderizar URLs estáticas no build (904 slugs de `/aprenda/[slug]`, simulados, etc.) — Next entrega HTML pronto no primeiro hit e troca pra dinâmico depois.
- Imagens externas precisam `images.unoptimized: true` (já configurado) **OU** configurar `images.remotePatterns`. Mantido `unoptimized: true` para evitar dependência do otimizador `sharp` no container.
- **`trailingSlash: true` ainda obrigatório** — alinha com URLs canônicas e mantém compatibilidade com bookmarks antigos do period FTP.

### RSC payloads em SSR
- Em `output: "standalone"`, os RSC payloads (`__next.*.txt`) são **gerados em runtime pelo Node** a cada navegação. Soft navigation entre páginas: **~80ms**.
- O ADR `docs/adr/0002-exclude-rsc-payloads-from-ftp-deploy.md` está marcado como **superseded** — só fazia sentido em static export FTP.

### CSP (Content Security Policy)
- **Fonte de verdade: HTTP header `Content-Security-Policy`** no `next.config.ts` (`async headers()`). Roda em todas as rotas em prod.
- Permite: `'self'`, Plausible (analytics), Stripe (`js.stripe.com`), `images.unsplash.com`, `*.googleusercontent.com`, `NEXT_PUBLIC_API_BASE_URL`.
- `frame-ancestors 'none'` (anti-clickjacking) — agora é efetivo via header HTTP (meta tag não suporta).

### Healthcheck endpoint
- `src/app/api/health/route.ts` expõe `GET /api/health` para o Docker `HEALTHCHECK CMD`.
- Retorna `{ status: "ok" }` 200. Usado pelo `docker-compose.prod.yml` (frontend service) para `start_period`/`restart`.

### Pre-renderização vs runtime
- Rotas com `generateStaticParams` **e** dados que mudam pouco (artigos `/aprenda/<slug>`): HTML pré-gerado no build, refresh a cada deploy.
- Rotas dinâmicas client-side (admin, simulados, ranking, news/cheatsheets/playlists/comments): shell vazio + `fetch` em runtime → SEMPRE atualizadas sem deploy.
- Para artigos atualizarem sem deploy (próxima sprint): adicionar `export const revalidate = 60` em `aprenda/[slug]/page.tsx` (ISR) + webhook do admin que dispara `revalidatePath('/aprenda/<slug>')` quando edita.

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
| **Provedor** | Hostinger — VPS KVM 2 (mesma máquina do backend) |
| **IP** | `72.60.28.82` |
| **Datacenter** | Estados Unidos — Boston (latência ~120ms BR; será mitigada por Cloudflare na próxima sprint) |
| **Domínio principal** | `fernandofrancovalle.com` + `www.fernandofrancovalle.com` |
| **Subdomínio API** | `api.fernandofrancovalle.com` (mesma VPS, rota Nginx host-based) |
| **Tipo de deploy** | Docker SSR (`next.config.ts` → `output: "standalone"`) — imagem `ghcr.io/feh-franc0/ffv-frontend` |
| **Servidor reverse proxy** | Nginx no docker-compose.prod.yml (TLS 1.2/1.3 + HSTS) |
| **Container** | Node 20 alpine runner, expõe `:3000`, healthcheck via `GET /api/health` |
| **Resource limits** | 512 MB RAM / 0.8 CPU |

### ⚠️ Migração DNS+SSL pendente

O domínio raiz ainda aponta pra Hostinger LiteSpeed antiga (build estático de 13/mai). Ver [README raiz — Migração DNS+SSL pendente](../README.md#migração-dnsssl-pendente) para o passo a passo completo. Resumo:

1. **Painel Hostinger DNS** → trocar registros A de `@` e `www` de `89.116.115.228` → `72.60.28.82`
2. **SSH na VPS** → `sudo certbot certonly --webroot -w /var/www/certbot -d fernandofrancovalle.com -d www.fernandofrancovalle.com`
3. **Reload Nginx** → `docker compose -f /opt/ffv/docker-compose.prod.yml exec nginx nginx -s reload`

Enquanto não for feito: o site público continua mostrando o build estático antigo da Hostinger, sem `/admin`, sem os refactors de simulado, sem as 1015 questões CLF-C02 conectadas via banco.

### Como o deploy funciona (automático)

```
git push main
  → CI passa (.github/workflows/ci.yml)
  → .github/workflows/deploy.yml dispara
      ├── build-push: Docker → ghcr.io/feh-franc0/ffv-api:sha-<hash>
      ├── build-push-frontend: Docker → ghcr.io/feh-franc0/ffv-frontend:sha-<hash>
      │     (NEXT_PUBLIC_API_BASE_URL injetado como build arg)
      └── deploy-backend (também deploya frontend):
            1. SCP: docker-compose.prod.yml + nginx conf + migrations → VPS /tmp/
            2. SSH: executa /opt/ffv/bin/deploy.sh na VPS
                a. docker pull das duas imagens novas
                b. migrate up (postgres) — inclui seed CLF idempotente
                c. docker compose up -d --scale api=2 api frontend
                d. health check ambos (até 120s)
                e. atualiza nginx
                f. rollback automático se health check falhar
```

**Não há downtime de backend** (réplicas com max_fails detectam queda e rotam). **Frontend tem ~5s de blip durante o swap** (container antigo para, novo sobe) — Cloudflare na frente (próxima sprint) elimina isso.

### Deploy manual (emergência)

```bash
# Compilar imagem frontend localmente e push pro GHCR
cd frontend
docker build -t ghcr.io/feh-franc0/ffv-frontend:emergency \
  --build-arg NEXT_PUBLIC_API_BASE_URL=https://api.fernandofrancovalle.com .
docker push ghcr.io/feh-franc0/ffv-frontend:emergency

# Na VPS, force pull + recreate
ssh deploy@72.60.28.82
FRONTEND_TAG=emergency docker compose -f /opt/ffv/docker-compose.prod.yml up -d --no-deps frontend
```

### GitHub Secrets necessários (Settings → Secrets → Actions)

| Secret | Valor |
|--------|-------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://api.fernandofrancovalle.com` |
| `VPS_HOST` | `72.60.28.82` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | chave privada ed25519 do usuário `deploy` |
| `VPS_PORT` | `22` |

> Secrets antigos do FTP (`HOSTINGER_FTP_SERVER`, etc.) **podem ser removidos** — não são mais usados desde o commit `845eddb`.

### Ativar deploy automático

Por padrão o deploy está **desativado** até a infra estar configurada.
Para ativar: GitHub → Settings → Variables → Actions → `DEPLOY_ENABLED` = `true`

---

## 📚 Referências cross-projeto

- [`../CLAUDE.md`](../CLAUDE.md) — **pitch completo, proposta de valor, roadmap, posicionamento**
- [`../CHANGELOG_PLATFORM_2026-05.md`](../CHANGELOG_PLATFORM_2026-05.md) — todas as mudanças de maio/2026
- [`../BACKEND_ROADMAP.md`](../BACKEND_ROADMAP.md) — features que dependem de backend
- [`../backend/CLAUDE.md`](../backend/CLAUDE.md) — deploy e infra do backend (VPS + Docker)
- [`../MELHORIAS.md`](../MELHORIAS.md) — roadmap pedagógico/visual
