# FFV Academy — Monorepo

---

## 🎯 O QUE É A FFV ACADEMY

**FFV Academy é a escola de engenharia para a era da IA — gratuita, gamificada e sem hype.**

Enquanto o mercado vende cursos de "use o ChatGPT para ganhar dinheiro", a FFV Academy ensina como as coisas funcionam por dentro: transformers, sistemas distribuídos, RAG, MVCC no Postgres, CloudFlare Workers internals, SRE, LLMOps, context engineering — conteúdo que engenheiros sênior escrevem e que engineers aspirantes precisam para virar seniors de verdade.

### Proposta de valor em uma frase
> **"Aprenda IA, AWS e Engenharia de Software como engenheiro — não como consumidor de hype. Gamificado, gratuito e com revisão espaçada real."**

---

## 🏆 DIFERENCIAIS COMPETITIVOS

### 1. Profundidade técnica real
Não são tutoriais de surface-level. Cada módulo explica o *porquê* por baixo: como o attention mechanism funciona matematicamente, por que o PostgreSQL usa MVCC em vez de locking, o que acontece dentro do kernel quando você faz um `syscall`. **Profundidade que a concorrência não tem coragem de oferecer.**

### 2. Gamificação completa e coerente
Não é um "badge pelo bem da gamificação". É um sistema com:
- **XP + Níveis** (16 níveis, de Iniciante a Lendário)
- **128+ badges** com lógica real de desbloqueio (ex: "Especialista em RAG" = completar 5 módulos de RAG)
- **Streak diário** com sistema de freeze (proteção de streak para dias offline)
- **Revisão Espaçada (SM-2)** — os quizzes viram flashcards com algoritmo SM-2 real
- **Ranking** com 4 períodos (geral, anual, mensal, semanal)
- **Meta diária** customizável (1–10 módulos/dia)
- **Sons de feedback** (XP coin, level up, badge) via Web Audio API

### 3. SRS (Spaced Repetition System) real
Após cada quiz, as perguntas entram numa fila de revisão espaçada com algoritmo SM-2 (o mesmo do Anki). O sistema recalcula intervalo baseado na dificuldade — não é "marque como pronto", é memorização científica de longo prazo.

### 4. 100% gratuito, sem paywall de conteúdo
Cada artigo, trilha, quiz, badge e ranking é gratuito. Monetização é via simulados de certificação (AWS, etc.) — não via paywalls em conteúdo educacional.

### 5. Currículo estruturado em hubs
8 hubs temáticos (IA, AWS, Engenharia, Claude & Anthropic, Fundamentos, Programação, Dados, Profissional Digital) com 66+ trilhas e 900+ módulos. Hierarquia: Hub → Trilha → Módulo. Usuário sabe exatamente onde está e para onde vai.

### 6. PWA — funciona como app
Instalável como PWA no iOS/Android. Service worker com cache. Reading progress bar, bookmarks, modo de leitura focado.

---

## 🆚 POSICIONAMENTO vs CONCORRENTES

| | FFV Academy | Duolingo | Khan Academy | Brilliant.org | Udemy |
|--|--|--|--|--|--|
| Conteúdo técnico profundo | ✅ | ❌ (superficial) | 🟡 (médio) | 🟡 (médio) | ✅ |
| Gratuito | ✅ | 🟡 (freemium) | ✅ | ❌ ($$$) | ❌ ($$$) |
| Gamificação completa | ✅ | ✅ | 🟡 | 🟡 | ❌ |
| SRS / Revisão espaçada | ✅ | ✅ | ❌ | ❌ | ❌ |
| Ranking público | ✅ | ✅ | ❌ | ❌ | ❌ |
| Certificados verificáveis | 🟡 (simulados) | ❌ | 🟡 | ❌ | ✅ |
| Foco em devs brasileiros | ✅ | ❌ | ❌ | ❌ | 🟡 |
| PWA / Offline | ✅ | ✅ | ✅ | ❌ | 🟡 |
| Conteúdo em PT-BR | ✅ | ❌ | ❌ | ❌ | 🟡 |

**Síntese**: A FFV Academy é a única plataforma que combina **profundidade técnica real** + **gamificação completa** + **SRS** + **gratuito** + **PT-BR**. É o ponto de intersecção que nenhuma outra preenche.

---

## 🗺️ ROADMAP DE FUNCIONALIDADES

### 🔥 TIER 1 — Próximas sprints (alto impacto, baixo esforço)

1. **Leaderboard por trilha** — ranking dentro de cada trilha específica, não só global
2. **Certificado por trilha** — PDF/PNG verificável ao completar 100% de uma trilha (reutilizar Certificate.tsx)
3. **Próximo artigo inteligente** — ao concluir módulo, card direto para o próximo na sequência
4. **Estatísticas de performance por trilha** — % de acerto por trilha, tempo médio, tendência semanal
5. **Maratona de revisão** — configurar sessão SRS (qtd de cards, trilha específica, timer)
6. **Email semanal de progresso** — resumo automático: XP, streak, badges, recomendação

### ⚡ TIER 2 — Médio prazo (alto impacto, médio esforço)

7. **Amigos / grupos de estudo** — leaderboard privado entre amigos via código de grupo
8. **Trilha do Dia** — 1-3 módulos recomendados diariamente pelo algoritmo
9. **Quests diárias/semanais** — "revise 3 cards", "complete 1 módulo", "atinja 80% no quiz"
10. **Power-ups consumíveis** — XP 2x por sessão, freeze extra, skip SRS card (desbloqueados por badges raros)
11. **Dev card compartilhável** — `/devcard/@username` com badges, XP, streak (viral no LinkedIn/Twitter)
12. **Trending modules** — top 10 módulos da semana na home (por completions + rating)

### 🌱 TIER 3 — Roadmap estratégico

13. **Discussão por artigo** — comentários com markdown por módulo (reduz fricção de dúvidas)
14. **Export Anki** — gerar `.apkg` com os cards SRS de uma trilha
15. **LLM-powered learning path** — Claude API analisa erros nos quizzes e recomenda próximos passos
16. **AI quiz generator** — gerar 5 quizzes extras por artigo via Claude API
17. **Certificados de trilha verificáveis no backend** — QR code + endpoint de validação
18. **Multi-idioma (EN/ES)** — internacionalização via next-intl para expansão global

---

## 📁 ESTRUTURA DO MONOREPO

| Pasta | O que é | Stack |
|-------|---------|-------|
| `frontend/` | App web Next.js (artigos, simulados, gamificação, ranking) | Next.js 16, TypeScript, Tailwind, Vitest |
| `backend/` | API REST + workers (auth, sync, leaderboard, certificados, billing) | Go 1.25, Chi, PostgreSQL, Redis |
| `video-pipeline/` | Pipeline de geração de vídeos de marketing | TypeScript, Remotion 4, Playwright |
| `mcp/` | MCP server — expõe o currículo FFV ao Claude (24 tools) | TypeScript, Node 20, MCP SDK |
| `drawio-tools/` | Scripts para diagramas de arquitetura AWS | Python, Bash, draw.io |
| `legacy-site/` | Site estático HTML/CSS/JS anterior | HTML/CSS/JS puro |
| `docs/` | Decisões de projeto e planejamento | Markdown |

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Frontend
cd frontend && npm install && npm run dev   # dev server :3000
cd frontend && npm test                     # 62 test files, 562 tests
cd frontend && npm run build                # build estático → frontend/out/
cd frontend && npm run lint                 # zero warnings policy

# Backend
cd backend && go run ./cmd/api             # servidor local :8080
cd backend && go test ./...                # todos os testes Go
cd backend && make migrate                 # rodar migrations

# MCP
cd mcp && npm install && npm run build     # compila → dist/index.js
cd mcp && npm test                         # 77 testes (100% linhas/funções)
```

---

## 📌 ESTADO ATUAL (maio 2026)

A plataforma evoluiu de "portal de IA + engenharia" para **escola completa do Profissional Digital do Futuro**: IA, AWS, engenharia, comunicação humana, carreira, conteúdo, marketing e empreendedorismo digital.

**Mudanças grandes recentes** — ver [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md):
- 5 trilhas novas (29 módulos do Profissional Digital)
- Home redesenhada (16 → 8 seções com prova social honesta)
- Sistema de ranking com 4 períodos (geral / anual / mensal / semanal)
- Páginas novas: `/sobre`, `/comunidade`, `/explorar`, `/newsletter`, `/search`, `/ranking`
- Backend Go com endpoints públicos `/api/v1/stats` e `/api/v1/leaderboard/public`
- Gamificação: sons Web Audio API, heatmap de estudo, metas diárias, recomendações
- UX: 26 fixes de mobile/a11y, animations fluidas, CodeBlock com scrollbar visível

**Sempre que fizer mudanças grandes**, criar novo changelog incremental (`CHANGELOG_PLATFORM_YYYY-MM.md`).

---

## 🧱 REGRA FIXA — ISOLAMENTO DE BASE DE CONHECIMENTO

> **Cada base de conhecimento é uma ilha. O usuário NUNCA pode ver chrome,
> hub, simulado, nav ou link de outra base enquanto estiver dentro de uma.**

A plataforma é multi-base (Tecnologia, Medicina Veterinária, Carreira,
Comunicação, Marketing, Conteúdo, Empreendedorismo, Inglês — e futuras
como Direito, Design, Medicina, etc). Cada base tem seu próprio mundo
visual e de navegação.

### O que TEM que ser isolado por base

Quando você cria/edita uma base, GARANTA que tem todos esses elementos
próprios (e referenciando SÓ a própria base):

| Elemento | Onde vive | O que tem que ser próprio |
|----------|-----------|--------------------------|
| **Base home** | `src/app/<base-slug>/page.tsx` | Hero, descrição, paths, hubs, playlists só da base |
| **Header / nav** | `BaseConfig.nav.hubNavItems` | Links dos hubs DESSA base — nunca tech hubs em base não-tech |
| **Footer** | `BaseConfig.footer` | hubLinks, contentLinks, mobilePrimary — todos da própria base |
| **Mascot** | `BaseConfig.mascot` | Emoji + nome + greeting contextualizados |
| **Microcopy** | `BaseConfig.microcopy` | CTAs, placeholder de busca, ranking title, moduleNoun |
| **Slogans** | `BaseConfig.slogans` | Hero, sub, cta da própria área |
| **Tema** | `BaseConfig.theme` | accent, accentLight, hubColors da paleta da base |
| **Simulados** | `BaseConfig.simulados[]` | Só os simulados da base (nunca cross-base) |
| **Trilhas e módulos** | `CURRICULUM` + filtro por base | Aprenda/<slug>/ resolve só pra módulos da base |
| **Hubs** | Filtrados em `lib/bases/<base>/index.ts` | Lista de hubs filtrada — nunca importa `HUBS` cru |
| **Questões / banco de questões** | DB com `base_slug` | Cada questão pertence a uma base |
| **Ranking / leaderboard** | Pode ser global, mas filtrado por base se a base quiser | `features.gamification: 'global'` ou `'scoped'` |
| **News / cheatsheets / playlists** | Globais OU filtrados por base se relevante | A base decide o que mostrar |
| **basePath** | `BaseConfig.basePath` | `/<base-slug>` — uso exclusivo |
| **resolver.ts** | `lib/bases/resolver.ts` | Cada rota volta para SUA base, nunca para "tecnologia" como atalho |

### O que CONTINUA global (não isolar)

| Elemento | Por quê |
|----------|---------|
| Perfil único do usuário | `/perfil`, `/preferencias` — um login só |
| Gamificação cross-base | XP/streak/level — global por padrão (`gamification: 'global'`) |
| Marketing (`/`, `/sobre`, `/comunidade`, `/bases`, `/newsletter`) | Vendem a plataforma toda |
| Dashboards globais | `/progresso`, `/ranking`, `/revisar` — agregam todas as bases |
| Verificação de certificados | `/verificar` |

### Checklist obrigatório ao adicionar uma base nova

1. **Backend**: migration SQL inserindo na tabela `bases` com `status='live'`,
   `url`, `modules`, `trails`, `hubs`, `theme` JSONB, `nav_items` JSONB,
   `sort_order`. Mirror em `buildHardcodedBases()` de `bases_handler.go`
   pro fallback.
2. **Frontend `BASE_REGISTRY`**: nova entrada com BaseConfig **completo**
   (theme, mascot, microcopy, slogans, nav, footer, features). NÃO copia
   nav de tecnologia — cria a nav própria.
3. **Frontend resolver**: pathname `/<base-slug>` → resolve pra ESSA base,
   NÃO pra tecnologia.
4. **Frontend page**: `src/app/<base-slug>/page.tsx` renderiza
   `KnowledgeBaseHome` com hubs/paths/playlists da base.
5. **Isolation tests**: `lib/bases/__tests__/isolation.test.ts` e
   `route-isolation.test.ts` passam automaticamente pra qualquer base
   registrada — só registrar é suficiente.

### Anti-padrões proibidos

- ❌ Hub não-tech apontando para `basePath: '/tecnologia'` ou
  resolvendo para `'tecnologia'` no resolver (chrome vaza).
- ❌ Footer ou nav de uma base com `href` de outra base.
- ❌ Importar `HUBS` cru em uma base (sempre filtrar pelo slug
  da base — ver `TECH_HUB_SLUGS` em `lib/bases/tecnologia/index.ts`).
- ❌ Reusar `TECH_PATHS`, `TECH_HUBS`, `TECH_PLAYLISTS` em outra base.
- ❌ Página `/<base-slug>` renderizando `HubPageClient` quando deveria
  renderizar `KnowledgeBaseHome` (a primeira é pra hubs dentro de tech;
  a segunda é a home oficial de qualquer base).
- ❌ Tradição "eu já registrei como /xxx-legacy em resolver, então pode
  ficar dentro de tecnologia" — se é base nova, ela tem que ter
  identidade própria.
- ❌ **Módulos em `/aprenda/<slug>` herdando chrome de `tecnologia` por
  default.** Cada módulo PERTENCE a uma trilha → hub → base. O resolver
  tem que consultar `getBaseSlugForModule(slug)` em `lib/bases/module-base-resolver.ts`
  ANTES de cair em "tecnologia". Sem isso, ler um artigo de Comunicação
  mostra header com IA/AWS/Engenharia/Claude (bug reportado pelo PO,
  mai/2026). Testes em `isolation.test.ts` travam essa regra com casos
  canônicos — não remova.

### Como o resolver decide a base de uma rota

Ordem de precedência em `lib/bases/resolver.ts → detectBaseSlug()`:

1. **Match exato com `BASE_REGISTRY[*].basePath`** — ex.: `/comunicacao`
   resolve para a base `comunicacao` (basePath dela).
2. **`/aprenda/<slug>` → módulo → trilha → hub → base** via
   `getBaseSlugForModule(slug)`. Esta é a etapa CRÍTICA pra módulos
   nunca herdarem chrome errado. Módulo desconhecido cai em `tecnologia`
   como último recurso (preserva URLs antigas).
3. **Legacy tech prefixes** (`/ia`, `/aws`, `/simulados`, `/engenharia`…)
   resolvem para `tecnologia`. Não adicione nada não-técnico aqui.
4. **Marketing paths** (`/`, `/sobre`, `/bases`…) → `null` + `isMarketing=true`.
5. **App-global** (`/progresso`, `/ranking`, `/revisar`…) → base default
   mas `isAppGlobal=true` (componentes ignoram microcopy da base).

### Se descumprir, o que acontece

- Usuário entra em /carreira e vê header "IA / AWS / Engenharia / Claude" → quebra de confiança.
- Footer com links de outra base → confusão de navegação.
- Métricas e gamificação misturadas → impossível medir tração por área.
- A promessa "cada base é uma jornada completa de estudo" da `/bases` vira mentira.

**Antes de fechar PR que envolve base nova ou mudança em base existente,
abre o app, navega para a rota e CONFIRMA que header + footer + nav só
mostram conteúdo da própria base.** Se não confirmou, não está pronto.

---

## 🔭 PONTOS DE ATENÇÃO OPERACIONAIS (revisado mai/2026)

> Coisas conhecidas que podem morder em desenvolvimento. Lê antes de tocar
> em base/hub/módulo. Atualize aqui quando descobrir mais uma.

### Estado atual do isolamento de bases (mai/2026)

8 bases live em produção: `tecnologia`, `medicina-veterinaria`, `carreira`,
`comunicacao`, `marketing`, `conteudo`, `empreendedorismo`, `ingles`.
Cada uma com `BaseConfig` próprio, chrome isolado e endpoint backend
`/api/v1/bases/<slug>/page` retornando 200.

### Como o chrome certo é escolhido (precedência)

Para cada pathname o resolver de `lib/bases/resolver.ts` faz, nesta ordem:

1. Match exato com `BaseConfig.basePath` (ex.: `/comunicacao` → base comunicacao).
2. `/aprenda/<slug>` → consulta `getBaseSlugForModule(slug)` (módulo → trilha → hub → base via `module-base-resolver.ts`).
3. Href de trilha (ex.: `/carreira-digital`, `/technical-writing`) → consulta `getBaseSlugForTrailHref(path)` derivado do CURRICULUM.
4. Rota legacy tech (`/ia`, `/aws`, `/simulados`, `/engenharia`…) → `tecnologia`.
5. Marketing (`/`, `/sobre`, `/bases`…) → `null` + `isMarketing=true`.
6. App-global (`/progresso`, `/ranking`, `/revisar`…) → base default + `isAppGlobal=true`.

**Se alguém ver chrome errado**, em 99% dos casos o erro está em uma destas 6 etapas — começa investigando por #1.

### Componentes de chrome SEM fallback default (NÃO recriar)

- `SiteFooter` antes tinha `hubLinks ?? HUBS.map(...)` que vazava tech em qualquer base que não passasse props. **Hoje é `?? []`**. NÃO recolocar fallback baseado em `HUBS` cru. O caller (`AppChrome`) é obrigado a injetar do `BaseConfig` ativo.
- `MobileNav` e `GameHUD` só renderizam itens globais (`/simulados`, `/news`, `/playlists`) quando `BaseConfig.nav.hideGlobalContentNav === false`. Tecnologia é a única base com isso `false` hoje.

### Pendências conhecidas (low priority)

| Item | Onde | Por que adiar |
|------|------|---------------|
| `OnboardingModal` só sugere 4 hubs tech (`ia`, `aws`, `engenharia`, `claude`) | `src/components/OnboardingModal.tsx:11` | UX flow só para devs iniciantes; expandir quando tiver dados sobre uso das novas bases |
| `StudyRequestForm` lista 11 áreas "queued" hardcoded sem incluir as 6 profissionais | `src/components/home/StudyRequestForm.tsx:35-45` | Form é pra pedir bases que **não existem**; as 6 já são live, então não precisam estar lá. Avaliar incluir "Marketing", "Inglês" etc. caso usuários pedirem expansão dentro dessas bases |
| Módulos das 6 bases não têm JSONs em `scripts/seeds/articles/` | check-curriculum-seed-drift.mjs | Trilhas servidas pelo frontend; produção de conteúdo em ondas. Já está na allowlist via slugs de hub |

### Testes que travam regressões (NÃO REMOVER)

- `frontend/src/lib/bases/__tests__/isolation.test.ts`:
  - `Module routing — /aprenda/<slug> resolve para a base do módulo` (11 casos canônicos)
  - `Trail URL routing — /<trail-href> resolve para a base do hub da trilha` (10 casos)
  - `selectTotalModulesForBase` (6 casos das bases profissionais)
- `frontend/src/lib/bases/__tests__/state-selectors.test.ts`:
  - `selectRecommendationsForBase NUNCA vaza tech recs em medvet` e variantes
- `frontend/src/tests/render/SiteFooter.test.tsx`:
  - `sem props: NÃO renderiza links cross-base`

### Checklist rápido antes de mexer em base/hub/módulo

1. **Mudou hub em curriculum.ts?** Mirror em `scripts/seeds/hubs.json` SEMPRE.
2. **Adicionou base nova?** Migration SQL (`backend/migrations/`) + `BASE_REGISTRY` (frontend) + `buildHardcodedBases()` fallback (backend) + page em `src/app/<slug>/page.tsx` com `<BaseStructuredData />` + canonical.
3. **Adicionou trilha nova?** Coloca em `HUBS[*].trailIds` (caso contrário órfã). Adiciona o `href` da trilha pra que o resolver capte (deriva auto via `getBaseSlugForTrailHref`).
4. **Adicionou módulo novo?** Vai pra trilha → vai pra hub → vai pra base via mapping. Verifica `getBaseSlugForModule(slug)` resolve certo.
5. **Antes de fechar PR**: testa cada URL afetada com `curl | grep href` para confirmar que só linka pra base correta. CI tem isolation tests, mas teste visual no browser também (header certo, cores, mascote).

---

## 🚀 PROTOCOLO DE COMMIT + PUSH + CI (regra fixa do PO)

Sempre que o usuário pedir "commit e push" (ou variantes: "manda pra main", "sobe pra prod",
"deploy"), seguir EXATAMENTE este fluxo, sem improvisar:

### 1. Antes do commit
- `git status --short` + `git diff --stat HEAD` pra mapear o que muda.
- Verificar que não há `.env`, credenciais ou tokens no diff.
- Sanity: `go build ./...` + `npx tsc --noEmit` + `npm run lint`. Se houver pre-commit hook
  exigindo `gofmt -w .` (atual padrão deste repo), rodar ANTES do commit.

### 2. Commit
- Mensagem **em português**, no estilo do `git log` recente (`feat:`, `fix:`, `chore:`).
- HEREDOC com seções claras quando o commit cobre múltiplas áreas.
- SEMPRE incluir `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

### 3. Push + acompanhamento de CI (OBRIGATÓRIO desde 2026-05-21)
- `git push origin main`.
- Imediatamente: `gh run list --limit 3 --branch main` pra capturar o run ID.
- Acompanhar com `gh run watch <run-id>` OU `gh run view <run-id> --log-failed` quando ele
  terminar.
- **Reportar para o usuário**: status final (✅ passou / ❌ falhou), e SE falhou, os logs do
  job que quebrou já filtrados em `--log-failed`. O usuário NÃO deve precisar tirar print
  do GitHub Actions — tudo via gh CLI.
- Se `gh` não estiver autenticado, pedir `! gh auth login` UMA vez e prosseguir.

### 4. Se CI quebrar
- Diagnosticar pelo log (`gh run view <id> --log-failed`).
- Corrigir localmente, rodar mesmo teste/lint que quebrou, commitar novo `fix:` e repushar.
- Repetir até CI verde. Nunca usar `--no-verify` para escapar de hook.

### 5. Anti-padrões proibidos
- ❌ Push sem watch (deixa o usuário descobrir por print).
- ❌ Force push (`--force`, `--force-with-lease`) sem autorização explícita.
- ❌ `git commit --amend` em commit já pushed.
- ❌ Skipar pre-commit hooks com `--no-verify`.

---

## 📚 DOCUMENTOS DE REFERÊNCIA

| Doc | Quando consultar |
|-----|------------------|
| [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md) | Estado atual após maio/2026 — leia primeiro |
| [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md) | Iniciativas que dependem de backend |
| [`MELHORIAS.md`](./MELHORIAS.md) | Roadmap pedagógico/visual |
| [`CURRICULUM_MASTER_PLAN.md`](./CURRICULUM_MASTER_PLAN.md) | Plano mestre do currículo |
| [`backend/PLAN.md`](./backend/PLAN.md) | Plano detalhado da API Go |
| `frontend/CLAUDE.md` | Arquitetura frontend, gotchas, mapa de componentes |
