# CHANGELOG — Plataforma FFV Academy · maio 2026

> Documento de referência para todas as mudanças feitas na plataforma durante a jornada de **expansão do escopo (Profissional Digital)** + **redesign da home** + **sistema de ranking** + **News rebuscada** + **auditoria crítica e melhorias estruturais**.
>
> Este é um registro consolidado para que qualquer dev/agente possa entender o estado atual sem precisar reconstruir contexto.

---

## 🎯 Resumo executivo

A plataforma evoluiu de um portal de **engenharia + IA** para um portal de **Profissional Digital do Futuro** — cobrindo IA, AWS, engenharia, comunicação humana, carreira digital, criação de conteúdo, marketing digital e empreendedorismo digital. Em paralelo:

- Home redesenhada (16 → 8 seções, com prova social honesta + ranking)
- Sistema de ranking completo com 4 períodos (geral / anual / mensal / semanal)
- Página /news com design rebuscado (imagens reais + mesh gradient + magazine layout)
- Auditoria crítica + 19 ações executadas (quick wins + P0/P1/P2/P3)

---

## 📚 1) Expansão de currículo — Profissional Digital

### Trilhas adicionadas (5 novas, 29 módulos)

| Trail ID | Nome | Cor | Módulos |
|----------|------|-----|---------|
| `trail-comunicacao-humana` | Comunicação Humana | `#f472b6` | 7 |
| `trail-carreira-digital` | Carreira Digital | `#34d399` | 6 |
| `trail-criacao-conteudo` | Criação de Conteúdo | `#fb923c` | 6 |
| `trail-marketing-digital` | Marketing Digital | `#a78bfa` | 5 |
| `trail-empreendedorismo-digital` | Empreendedorismo Digital | `#fbbf24` | 5 |

### Trilha de Inglês completa (anterior, mantida)
9 módulos (`ingles-fase1-pronomes-to-be` até `ingles-fase7-verbos-modais` + `ingles-1000-palavras` + `ingles-1000-frases`).

### Padrão dos módulos novos
Todos seguem o template profissional com:
- 4 questões de quiz com explicações fundamentadas
- `LayerStack` para passos práticos
- `ComparisonTable` (X vs Y) com dados 2026
- `DecisionBox` com winner + alternativas
- `CodeBlock` quando aplicável (configs, scripts)
- `QAItem` para perguntas frequentes
- Take-aways consolidados ao final

### Páginas em /aprenda criadas (29)
**Comunicação Humana**: `comunicacao-falar-em-publico`, `comunicacao-reunioes`, `comunicacao-storytelling`, `comunicacao-feedback`, `comunicacao-escuta-ativa`, `comunicacao-networking`, `comunicacao-inteligencia-emocional`

**Carreira Digital**: `carreira-portfolio-digital`, `carreira-vagas-br`, `carreira-trabalho-remoto`, `carreira-freelance-br`, `carreira-crescimento-junior-senior`, `carreira-entrevista-br`

**Criação de Conteúdo**: `conteudo-setup-gravacao`, `conteudo-edicao-video`, `conteudo-tutorial-tecnico`, `conteudo-linkedin-criador`, `conteudo-youtube`, `conteudo-design-basico`

**Marketing Digital**: `marketing-personal-branding`, `marketing-conteudo-autoridade`, `marketing-seo-pessoal`, `marketing-email-newsletter`, `marketing-metricas`

**Empreendedorismo Digital**: `empreend-curso-online`, `empreend-produtos-digitais`, `empreend-freelance-clientes`, `empreend-side-project`, `empreend-financas-digital`

---

## 🏠 2) Home redesenhada (16 → 8 seções)

### Antes (16 seções)
Hero · SimuladosHero · ContinueCard · HabitDashboard · FirstVisitGuide · DailyModuleCard · StartingPointSection · FeaturedArticle · HubsSection · PlaylistsSection · TrailsSection · **AllPostsSection (570 cards renderizados)** · LearnGameSection · CommunityCard · AuthorSection · NewsletterSection · FinalCta

### Depois (8 seções)
1. **Hero** — outcome promise ("Vire um dos profissionais mais qualificados da nova era da IA no digital") + 1 CTA primário + `<GameDemo />` à direita
2. **SocialProofBar** — count real do banco com fallback honesto ("Primeira leva de devs estudando")
3. **HowItWorks** — 3 steps (Escolha → Aprenda + XP → Ranking)
4. **Continue/Hoje** (returning users) — `ContinueCard` + `DailyModuleCard` lado a lado
5. **ComecarAqui** (first-visit) — 6 caminhos diagnósticos
6. **Explorar** — Hubs + Playlists em duas linhas claras + link para `/mapa`
7. **HomeRanking** — pódio top 3 + lista 4-7 com tabs de período (👑 Geral, 📅 Ano, 🗓️ Mês, ⚡ Semana)
8. **ComunidadeAutor** — visão da plataforma + Newsletter
9. **FinalCta** — CTA único com radial glow

### Componentes home modulares criados em `src/components/home/`
- `Hero.tsx` (com StatusBadge)
- `GameDemo.tsx` (animações CSS-only: XP subindo, badge piscando, streak pulsando)
- `SocialProofBar.tsx` (avatar stack + fallback honesto)
- `HowItWorks.tsx`
- `ComecarAqui.tsx`
- `Explorar.tsx`
- `HomeRanking.tsx` (com tabs de período)
- `ComunidadeAutor.tsx`
- `FinalCta.tsx`

### Removidos da home
- `AllPostsSection` (570 cards) → link para `/explorar`
- `TrailsSection` standalone (redundante com Hubs)
- `LearnGameSection` (consolidado em HowItWorks)
- `NewsletterSection` standalone → integrada em ComunidadeAutor
- `HomeClientLegacy.tsx` (1692 linhas mortas) — DELETADO

---

## 🏆 3) Sistema de ranking completo

### Backend Go

**Domínio (`internal/domain/leaderboard/leaderboard.go`)**
- Tipo `Period` enum: `weekly | monthly | yearly | all-time`
- `IsValidPeriod(p string) bool`
- `PeriodWindow(p, now) (start, end)` — calcula janela em UTC
- `Repository` ganhou métodos:
  - `GetByPeriod(ctx, period, now, limit) ([]RankEntry, error)`
  - `GetUserRankByPeriod(ctx, userID, period, now) (rank, xp, error)`

**Repository Postgres (`internal/infrastructure/persistence/postgres/other_repos.go`)**
- Implementação SQL com `SUM()` agregando weeks dentro da janela
- Helper `nullableTime(t)` para janela aberta no all-time

**Handlers HTTP (`internal/interfaces/http/handlers/`)**
- `stats_handler.go` — NOVO. `GetPublic` retorna `totalUsers`, `activeWeekly`, `totalXpAwarded`. Cache 60s.
- `leaderboard_handler.go` — `GetPublic` aceita `?period=...&limit=N` (público); `GetMyRankAll` (autenticado, 4 períodos).

**Rotas registradas em `router.go`**
- `GET /api/v1/stats` (público)
- `GET /api/v1/leaderboard/public?period=...&limit=N` (público)
- `GET /api/v1/leaderboard/me/all` (autenticado)

### Frontend

**`/ranking`** (NOVA página) — `src/app/ranking/`
- Header com gradient dourado
- 4 tabs (👑 Geral, 📅 Anual, 🗓️ Mensal, ⚡ Semanal)
- Pódio top 3 (glow ouro/prata/bronze, animação)
- Lista de até 100 com destaque para top 10
- Card "Sua posição" se autenticado
- Label dinâmica do período ("MAIO 2026", "Semana 04/05–11/05")
- CTA inferior dourado

**`MyRankCard`** (NOVO) — `src/components/MyRankCard.tsx`
- Mostrado em `/progresso`
- 4 grids coloridos com rank em cada janela

**`HomeRanking`** atualizado com tabs de período + botão dourado para `/ranking` completo

**Lib `src/lib/leaderboard-api.ts`**
- `getPublicLeaderboard(period, limit)`
- `getMyRankAll()`
- `getPlatformStats()` (em `src/lib/platform-stats.ts`)

---

## 📰 4) /news rebuscada

### NewsCard com 5 camadas visuais
1. Imagem real de fundo (Unsplash curado por categoria) com `object-cover` + zoom no hover
2. Mesh gradient da marca (multiply blend) — radial blurs colorindo a foto
3. Overlay escuro inferior — legibilidade
4. Noise editorial via SVG filter
5. Sigla gigante decorativa da source

### Hero featured
Primeira manchete em layout 100% width, fonte 1.5–2.4rem, tags visíveis.

### Filtros refinados
Chips com gradient azul-roxo no estado ativo.

### Header da página
H1 com gradient triplo (azul→roxo→dourado), grid pattern sutil, badge de "curadoria editorial" com pulse.

### Schema atualizado (`src/lib/news.ts`)
Adicionado campo opcional `imageUrl: string` para futuras notícias com imagem própria. Hash determinístico em `news-imagery.ts` escolhe imagem estável por slug.

---

## 🔍 5) Auditoria + 19 melhorias executadas

### Quick Wins (8)
- ✅ `/sobre` — visão da plataforma (4 princípios + stats reais)
- ✅ Sitemap.xml dinâmico atualizado com rotas novas
- ✅ Robots.txt com regras + AI crawlers (GPTBot, ClaudeBot, etc)
- ✅ Skip to content + focus rings (já existiam — verificado)
- ✅ HomeClientLegacy.tsx removido (1692 linhas mortas)
- ✅ Plausible analytics — helper `lib/analytics.ts` com 13 eventos catalogados
- ✅ `SyncBanner` — banner persistente "Seu progresso está só no navegador"
- ✅ Schema.org Article — já existia via `ArticleJsonLd`
- ✅ `/comunidade` — 6 canais (newsletter, Discord em breve, Twitter, LinkedIn, GitHub, YouTube)
- ✅ `/newsletter` — arquivo das últimas 5 edições + CTA Buttondown
- ✅ `/explorar` — busca + filtros (hub, dificuldade) + paginação 60/clique sobre 600+ módulos

### P0 — Críticos
- ✅ **Sync de progresso** — `pullProgress` no AuthProvider login + `schedulePush` em `saveAsync`
- ✅ **Search real `/search`** — busca instantânea com scoring (title 3x, desc 2x, keywords 1x), debounce 150ms, query do URL, highlight de matches, populares como atalho
- ✅ **Search global** — já em GameHUD via `CommandPaletteTrigger` (Cmd+K)

### P1 — Alto impacto
- ✅ **TOC sticky** — já existia (`ArticleToc` + `MobileToc`)
- 📝 **Onboarding v2** — backlog (deep refactor de 3a pergunta + playlist)
- ✅ **Mobile polish** — GameDemo agora aparece em mobile + `PWAInstallBanner` integrado

### P2 — Qualidade
- 📝 **Design tokens** — já existem em globals.css; documentação dedicada em backlog
- ✅ **OG dinâmica** — infra completa (`scripts/generate-og-images.mjs`); rodar `npm run generate-og` após build

### P3 — Polimento
- ✅ **Newsletter archive** — entregue em `/newsletter`

### Arquivos novos criados
| Arquivo | Função |
|---------|--------|
| `app/sobre/page.tsx` | Visão da plataforma |
| `app/comunidade/page.tsx` | Canais oficiais |
| `app/newsletter/page.tsx` | Arquivo + CTA |
| `app/explorar/page.tsx` + `ExplorarClient.tsx` | Browser de 600+ módulos |
| `app/search/page.tsx` + `SearchClient.tsx` | Busca instantânea |
| `app/ranking/page.tsx` + `RankingClient.tsx` | Ranking completo 4 períodos |
| `lib/analytics.ts` | Helper Plausible type-safe |
| `lib/platform-stats.ts` | Client para `/api/v1/stats` |
| `lib/news-imagery.ts` | Imagens Unsplash curadas por categoria |
| `components/SyncBanner.tsx` | Banner login persistente |
| `components/PWAInstallBanner.tsx` | Install prompt mobile |
| `components/MyRankCard.tsx` | Card de rank no /progresso |
| `components/home/*.tsx` | 9 componentes modulares da nova home |

---

## 🔧 6) Mudanças de infraestrutura

### Endpoint `/search` re-rotado
A trilha "Search & Information Retrieval" mudou de `/search` para `/search-trilha` (`src/app/search-trilha/page.tsx`) para liberar `/search` para a busca real.

### Conflitos public/ resolvidos
Removidos `public/sitemap.xml` e `public/robots.txt` (estáticos antigos) — agora gerados dinamicamente via `app/sitemap.ts` e `app/robots.ts`.

### Links 404 corrigidos
- `/explorar` (4× usos) → `/mapa` (na home), agora `/explorar` existe de verdade
- `/sobre` removido como link (página agora existe)
- `/comunidade` agora existe
- `/profissional-digital` (não existia) → `/aprenda/comunicacao-falar-em-publico`
- `/playlists/${id}` (404) → `/playlists`

### Schema.org Article via `ArticleJsonLd`
Já existente, verificado funcional em `ModuleLayout.tsx`.

### Plausible Analytics
Já integrado no `layout.tsx` (linha 181). Helper `lib/analytics.ts` cataloga 13 eventos: `module_started`, `module_completed`, `quiz_passed`, `quiz_failed`, `signup_clicked`, `login_completed`, `search_performed`, `playlist_started`, `certificate_downloaded`, `streak_broken`, `streak_milestone`, `level_up`, `badge_unlocked`, `cta_clicked`.

---

## ⚠️ 7) Backlog priorizado (não foi feito ainda)

### P1 — Próximo sprint
- **Onboarding v2** — adicionar 3a pergunta ("quanto tempo por dia?") + gerar playlist personalizada após onboarding
- **Mobile experience completo** — audit do pódio em mobile, scroll horizontal de filtros, swipe back gestures
- **Hook automático no postbuild** — `postbuild`: `npm run generate-og` para gerar 624 OG images

### P2 — Médio prazo
- **Cleanup `curriculum.ts`** — quebrar arquivo de 4894 linhas em `src/lib/curriculum/trails/<id>.ts`
- **Test coverage de componentes** — HomeClient, MobileNav, OnboardingModal, MyRankCard, HomeRanking, SyncBanner, PWAInstallBanner
- **Design system documentation** — `/sistema-design` interno com tokens unificados
- **Migrar imagens Unsplash para `public/news/`** — download das 50 curadas em build time

### P3 — Polimento
- **Acessibilidade** — só 24/71 componentes têm aria-*. Lighthouse audit + fix focused.
- **Dynamic OG images** — converter `/aprenda/[slug]` para rota dinâmica permite OG por request
- **Trail overview pages** — criar `/comunicacao-humana`, `/carreira-digital`, etc (hoje as novas trilhas não têm hub-level page)
- **Discord real** — substituir placeholder de "em breve"

---

## ✅ 8) Validação

### TypeScript
Zero erros em todo o frontend (validado via `npx tsc --noEmit --skipLibCheck`).

### ESLint
Zero warnings em arquivos novos e modificados.

### Backend Go
Zero erros em `go build ./...` e `go vet ./...`.

### Rotas testadas (HTTP 200)
`/`, `/sobre`, `/comunidade`, `/explorar`, `/newsletter`, `/search`, `/search-trilha`, `/ranking`, `/progresso`, `/news`, `/mapa`, `/sitemap.xml`, `/robots.txt`, `/playlists`, `/aprenda/comunicacao-falar-em-publico`, `/ia`, `/aws`, `/claude-anthropic`, `/fundamentos`, `/programacao`, `/dados`, `/construcao`.

---

## 📁 Mapa de arquivos novos / modificados

### Frontend — novos
```
src/app/sobre/page.tsx
src/app/comunidade/page.tsx
src/app/newsletter/page.tsx
src/app/explorar/page.tsx
src/app/explorar/ExplorarClient.tsx
src/app/search/page.tsx
src/app/search/SearchClient.tsx
src/app/ranking/page.tsx
src/app/ranking/RankingClient.tsx
src/app/aprenda/<slug>/page.tsx (29 módulos novos do Profissional Digital)

src/components/MyRankCard.tsx
src/components/SyncBanner.tsx
src/components/PWAInstallBanner.tsx
src/components/home/Hero.tsx
src/components/home/GameDemo.tsx
src/components/home/SocialProofBar.tsx
src/components/home/HowItWorks.tsx
src/components/home/ComecarAqui.tsx
src/components/home/Explorar.tsx
src/components/home/HomeRanking.tsx
src/components/home/ComunidadeAutor.tsx
src/components/home/FinalCta.tsx

src/lib/analytics.ts
src/lib/platform-stats.ts
src/lib/news-imagery.ts
```

### Frontend — modificados
```
src/components/HomeClient.tsx               (refatorado completo, 1692→60 linhas)
src/components/news/NewsCard.tsx            (5 camadas visuais com imagens reais)
src/components/news/NewsClient.tsx          (hero featured + grids)
src/app/news/page.tsx                       (header editorial novo)
src/components/auth/AuthProvider.tsx        (pull progress no login)
src/hooks/useGameState.ts                   (schedulePush em saveAsync)
src/lib/leaderboard-api.ts                  (período + getMyRankAll)
src/lib/news.ts                             (campo imageUrl)
src/lib/curriculum.ts                       (5 trilhas novas + trail39 href→/search-trilha)
src/lib/metadata.ts                         (comentário sobre OG dinâmica)
src/app/layout.tsx                          (SyncBanner + PWAInstallBanner)
src/app/sitemap.ts                          (rotas novas)
src/app/robots.ts                           (AI crawlers + regras)
```

### Frontend — deletados
```
src/components/HomeClientLegacy.tsx (1692 linhas)
public/sitemap.xml                  (conflitava com app/sitemap.ts)
public/robots.txt                   (conflitava com app/robots.ts)
```

### Backend — novos
```
internal/interfaces/http/handlers/stats_handler.go
```

### Backend — modificados
```
internal/domain/leaderboard/leaderboard.go        (Period, PeriodWindow, novos métodos do Repository)
internal/infrastructure/persistence/postgres/other_repos.go  (GetByPeriod, GetUserRankByPeriod)
internal/interfaces/http/handlers/leaderboard_handler.go     (GetPublic com period, GetMyRankAll)
internal/interfaces/http/router.go                (Stats handler + leaderboard public + me/all)
cmd/api/main.go                                    (statsH wired)
```

---

## 🎓 Notas de continuidade

Este documento é a **fonte de verdade** para o estado atual da plataforma após maio de 2026. Próximas iterações devem:

1. **Ler este changelog primeiro** antes de propor mudanças que possam conflitar
2. **Atualizar o backlog (seção 7)** quando itens forem completados
3. **Criar novos changelogs incrementais** quando outras grandes mudanças acontecerem (formato `CHANGELOG_PLATFORM_YYYY-MM.md`)
4. **Não duplicar info em múltiplas MDs** — referenciem este arquivo

Para arquitetura detalhada do backend Go: ver `backend/CLAUDE.md` e `backend/PLAN.md`.
Para roadmap pedagógico/visual: ver `MELHORIAS.md`.
Para iniciativas que dependem de backend: ver `BACKEND_ROADMAP.md`.
