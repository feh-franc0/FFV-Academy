# FFV Academy — Monorepo

---

## 🎯 O QUE É A FFV ACADEMY

**FFV Academy é a escola de engenharia para a era da IA — gratuita, gamificada e sem hype.**

> **"Aprenda IA, AWS e Engenharia de Software como engenheiro — não como consumidor de hype. Gamificado, gratuito e com revisão espaçada real."**

**Diferenciais**: profundidade técnica real (internals de transformers, MVCC, syscalls) + gamificação completa (XP/níveis/badges/streak/SM-2/ranking) + 100% gratuito + PT-BR + PWA. É o ponto de intersecção que nenhuma outra plataforma preenche.

---

## 🚫 REGRA ABSOLUTA — SISTEMA 100% MOLDÁVEL (ZERO DADOS ESTÁTICOS)

> **Nenhum switch/case, if/else chain ou lista hardcoded pode existir com slugs de hub, base, trilha ou módulo.**
> Todo dado de currículo vem do banco de dados. O sistema é um gerador — o usuário cria pelo admin e o front reflete automaticamente.

### O que é vetado

- ❌ `hubBaseSlug(slug)` como switch/case — **foi removido do `cmd/importer`**, NÃO recriar em lugar nenhum.
- ❌ `TECH_HUB_SLUGS` como `Set` hardcoded em `lib/bases/tecnologia/index.ts` — candidato a remoção (Fase 3); usar query do DB.
- ❌ Constantes de slugs em código fonte (exceto mapeamentos de fallback **explicitamente documentados como temporários**).
- ❌ Switch derivando `base_slug` de slug de hub — o importer lê `base_slug` do JSON seed diretamente.
- ❌ Código novo necessário quando o admin cria um hub/trilha/módulo no CMS — zero código, só dados no DB.

### Estado das migrações DB-driven (mai/2026)

| Fase | Migrations | Status |
|------|-----------|--------|
| Fase 1 — schema base→hub→trail→module via FK | 000055–000063 | ✅ Concluídas |
| Fase 2 — importer lê `base_slug` do JSON, sem switch | — | ✅ Concluído |
| Fase 3 — `BASE_REGISTRY` frontend gerado de DB snapshot | — | 🔄 Pendente |

**`BASE_REGISTRY` no frontend ainda tem dados estáticos** — na Fase 3 será gerado de snapshot do DB. Por ora, é um `BaseConfig` que descreve chrome/tema/microcopy (não slugs de currículo).

### Regra de ouro
> Se você está escrevendo `case "ia":`, `case "aws":`, `case "engenharia":` ou equivalente para derivar a base de um slug — **PARE**. Essa lógica pertence ao DB via FK `hubs.base_slug`.

---

## 🗺️ ROADMAP DE FUNCIONALIDADES

### 🔥 TIER 1 — Próximas sprints
1. **Leaderboard por trilha** — ranking dentro de cada trilha específica
2. **Certificado por trilha** — PDF/PNG verificável ao completar 100% (reutilizar Certificate.tsx)
3. **Próximo artigo inteligente** — ao concluir módulo, card direto para o próximo
4. **Estatísticas de performance por trilha** — % de acerto, tempo médio, tendência semanal
5. **Maratona de revisão** — sessão SRS configurável (qtd de cards, trilha, timer)
6. **Email semanal de progresso** — resumo automático: XP, streak, badges, recomendação

### ⚡ TIER 2 — Médio prazo
7. **Amigos / grupos de estudo** — leaderboard privado via código de grupo
8. **Trilha do Dia** — 1-3 módulos recomendados diariamente
9. **Quests diárias/semanais** — "revise 3 cards", "complete 1 módulo", "atinja 80%"
10. **Dev card compartilhável** — `/devcard/@username` (viral no LinkedIn/Twitter)
11. **Trending modules** — top 10 módulos da semana na home

### 🌱 TIER 3 — Estratégico
12. **Export Anki** — `.apkg` com cards SRS de uma trilha
13. **LLM-powered learning path** — Claude API analisa erros e recomenda próximos passos
14. **AI quiz generator** — 5 quizzes extras por artigo via Claude API
15. **Multi-idioma (EN/ES)** — internacionalização via next-intl

---

## 📁 ESTRUTURA DO MONOREPO

| Pasta | O que é | Stack |
|-------|---------|-------|
| `frontend/` | App web Next.js (artigos, simulados, gamificação, ranking) | Next.js 16, TypeScript, Tailwind, Vitest |
| `backend/` | API REST + workers (auth, sync, leaderboard, certificados, billing) | Go 1.25, Chi, PostgreSQL, Redis |
| `video-pipeline/` | Pipeline de geração de vídeos de marketing | TypeScript, Remotion 4, Playwright |
| `mcp/` | MCP server — expõe o currículo FFV ao Claude (24 tools) | TypeScript, Node 20, MCP SDK |
| `drawio-tools/` | Scripts para diagramas de arquitetura AWS | Python, Bash, draw.io |
| `docs/` | Decisões de projeto e planejamento | Markdown |

---

## ⚡ COMANDOS RÁPIDOS

```bash
# Frontend
cd frontend && npm install && npm run dev   # dev server :3000
cd frontend && npm test                     # Vitest
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

## 📌 ESTADO ATUAL (mai/2026)

8 bases live: `tecnologia`, `medicina-veterinaria`, `carreira`, `comunicacao`, `marketing`, `conteudo`, `empreendedorismo`, `ingles`.

**Mudanças grandes recentes** — ver [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md):
- Fase 1 do plano DB-driven concluída (migrations 000055–000063): schema base→hub→trail→module via FK, importer sem switch hardcoded
- 5 trilhas novas (29 módulos do Profissional Digital)
- Home redesenhada (16 → 8 seções), ranking com 4 períodos (geral/anual/mensal/semanal)
- Páginas novas: `/sobre`, `/comunidade`, `/explorar`, `/newsletter`, `/search`, `/ranking`
- Backend Go com endpoints `/api/v1/stats` e `/api/v1/leaderboard/public`
- Gamificação: sons Web Audio API, heatmap de estudo, metas diárias

**Sempre que fizer mudanças grandes**, criar novo changelog incremental (`CHANGELOG_PLATFORM_YYYY-MM.md`).

---

## 🧱 REGRA FIXA — ISOLAMENTO DE BASE DE CONHECIMENTO

> **Cada base de conhecimento é uma ilha. O usuário NUNCA pode ver chrome, hub, simulado, nav ou link de outra base enquanto estiver dentro de uma.**

### O que TEM que ser isolado por base

| Elemento | O que tem que ser próprio |
|----------|--------------------------|
| **Base home** `src/app/<base-slug>/page.tsx` | Hero, descrição, paths, hubs, playlists só da base |
| **Header/nav** `BaseConfig.nav.hubNavItems` | Links dos hubs DESSA base — nunca tech hubs em base não-tech |
| **Footer** `BaseConfig.footer` | hubLinks, contentLinks, mobilePrimary — todos da própria base |
| **Mascot/Microcopy/Slogans/Tema** | Contextualizados para a base, paleta própria |
| **Simulados** `BaseConfig.simulados[]` | Só os simulados da base (nunca cross-base) |
| **Trilhas e módulos** | `CURRICULUM` filtrado por base; `/aprenda/<slug>` resolve só pra módulos da base |
| **Hubs** | Filtrados em `lib/bases/<base>/index.ts` — nunca importa `HUBS` cru |

### O que CONTINUA global

Perfil/preferências, XP/streak/level (gamificação cross-base), marketing (`/`, `/sobre`, `/bases`), dashboards globais (`/progresso`, `/ranking`, `/revisar`), verificação de certificados.

### Checklist ao adicionar base nova

1. **Backend**: migration SQL + tabela `bases` com `status='live'`, JSONB de theme/nav. Mirror em `buildHardcodedBases()` pro fallback.
2. **Frontend `BASE_REGISTRY`**: BaseConfig completo (theme, mascot, microcopy, slogans, nav, footer). NÃO copiar nav de tecnologia.
3. **Frontend resolver**: `/<base-slug>` → resolve pra ESSA base.
4. **Frontend page**: `src/app/<base-slug>/page.tsx` renderiza `KnowledgeBaseHome`.
5. **Isolation tests**: passam automaticamente ao registrar — só registrar é suficiente.

### Anti-padrões proibidos

- ❌ Hub não-tech resolvendo para `'tecnologia'` no resolver.
- ❌ Footer ou nav de uma base com `href` de outra base.
- ❌ Importar `HUBS` cru (sempre filtrar pelo slug da base).
- ❌ Reusar `TECH_PATHS`, `TECH_HUBS`, `TECH_PLAYLISTS` em outra base.
- ❌ `/<base-slug>` renderizando `HubPageClient` em vez de `KnowledgeBaseHome`.
- ❌ Módulos em `/aprenda/<slug>` herdando chrome de `tecnologia` por default — o resolver DEVE consultar `getBaseSlugForModule(slug)` em `lib/bases/module-base-resolver.ts` antes de cair em tecnologia.

### Como o resolver decide a base (precedência)

Em `lib/bases/resolver.ts → detectBaseSlug()`:

1. Match exato com `BaseConfig.basePath` (ex.: `/comunicacao` → base comunicacao).
2. `/aprenda/<slug>` → `getBaseSlugForModule(slug)` (módulo → trilha → hub → base). Módulo desconhecido cai em `tecnologia` como fallback.
3. Href de trilha → `getBaseSlugForTrailHref(path)` derivado do CURRICULUM.
4. Legacy tech prefixes (`/ia`, `/aws`, `/simulados`, `/engenharia`…) → `tecnologia`.
5. Marketing (`/`, `/sobre`, `/bases`…) → `null` + `isMarketing=true`.
6. App-global (`/progresso`, `/ranking`, `/revisar`…) → base default + `isAppGlobal=true`.

**Se alguém ver chrome errado**, começa investigando por #1.

---

## 🔭 PONTOS DE ATENÇÃO OPERACIONAIS (mai/2026)

### Componentes de chrome SEM fallback default (NÃO recriar)

- `SiteFooter`: fallback é `?? []`, NÃO `?? HUBS.map(...)`. O caller (`AppChrome`) injeta do `BaseConfig` ativo.
- `MobileNav` e `GameHUD`: só renderizam itens globais quando `BaseConfig.nav.hideGlobalContentNav === false`. Apenas `tecnologia` tem isso `false`.

### Alertas sobre dados hardcoded removidos

- `hubBaseSlug()` switch em `cmd/importer` foi **removido** — não recriar. O importer agora lê `base_slug` do JSON seed.
- `TECH_HUB_SLUGS` Set em `lib/bases/tecnologia/index.ts` é **candidato a remoção** na Fase 3 (substituído por query do DB). Não ampliar nem replicar em outras bases.
- `BASE_REGISTRY` frontend ainda tem dados estáticos de chrome (theme, microcopy) — ok por ora. Dados de currículo (hubs, trilhas, módulos) devem vir do DB.

### Pendências conhecidas (low priority)

| Item | Onde | Por que adiar |
|------|------|---------------|
| `OnboardingModal` só sugere 4 hubs tech | `src/components/OnboardingModal.tsx:11` | Expandir quando tiver dados de uso das novas bases |
| `StudyRequestForm` lista áreas "queued" sem incluir bases profissionais já live | `src/components/home/StudyRequestForm.tsx:35-45` | Avaliar quando usuários pedirem expansão |
| Módulos das 6 bases não têm JSONs em `scripts/seeds/articles/` | check-curriculum-seed-drift.mjs | Produção de conteúdo em ondas; já na allowlist |

### Testes que travam regressões (NÃO REMOVER)

- `frontend/src/lib/bases/__tests__/isolation.test.ts`: module routing (11 casos), trail URL routing (10 casos), `selectTotalModulesForBase` (6 casos)
- `frontend/src/lib/bases/__tests__/state-selectors.test.ts`: `selectRecommendationsForBase` nunca vaza tech recs em outras bases
- `frontend/src/tests/render/SiteFooter.test.tsx`: sem props, NÃO renderiza links cross-base

### Checklist rápido antes de mexer em base/hub/módulo

1. **Mudou hub em curriculum.ts?** Mirror em `scripts/seeds/hubs.json` SEMPRE.
2. **Base nova?** Migration SQL + `BASE_REGISTRY` + `buildHardcodedBases()` + page `src/app/<slug>/page.tsx` + `<BaseStructuredData />` + canonical.
3. **Trilha nova?** Coloca em `HUBS[*].trailIds`. Resolver deriva `getBaseSlugForTrailHref` automaticamente.
4. **Módulo novo?** Verifica que `getBaseSlugForModule(slug)` resolve certo via trilha → hub → base.
5. **Antes de fechar PR**: testa URLs afetadas visualmente no browser (header certo, cores, mascote).

---

## 🚀 PROTOCOLO DE COMMIT + PUSH + CI (regra fixa do PO)

### 1. Antes do commit
- `git status --short` + `git diff --stat HEAD` pra mapear o que muda.
- Verificar que não há `.env`, credenciais ou tokens no diff.
- Sanity: `go build ./...` + `npx tsc --noEmit` + `npm run lint`. Rodar `gofmt -w .` se pre-commit hook exigir.

### 2. Commit
- Mensagem **em português**, estilo do `git log` recente (`feat:`, `fix:`, `chore:`).
- HEREDOC com seções claras quando cobre múltiplas áreas.
- SEMPRE incluir `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.

### 3. Push + acompanhamento de CI (OBRIGATÓRIO)
- `git push origin main`.
- `gh run list --limit 3 --branch main` pra capturar o run ID.
- `gh run watch <run-id>` OU `gh run view <run-id> --log-failed` quando terminar.
- **Reportar**: status final (passou/falhou) + logs filtrados se falhou. O usuário NÃO deve precisar tirar print do GitHub Actions.

### 4. Se CI quebrar
- Diagnosticar com `gh run view <id> --log-failed`. Corrigir, commitar `fix:`, repushar. Repetir até verde.

### 5. Anti-padrões proibidos
- ❌ Push sem watch. ❌ Force push sem autorização. ❌ `--amend` em commit já pushed. ❌ `--no-verify`.

---

## 📚 DOCUMENTOS DE REFERÊNCIA

| Doc | Quando consultar |
|-----|------------------|
| [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md) | Estado atual após mai/2026 — leia primeiro |
| [`BACKEND_ROADMAP.md`](./BACKEND_ROADMAP.md) | Iniciativas que dependem de backend |
| [`MELHORIAS.md`](./MELHORIAS.md) | Roadmap pedagógico/visual |
| [`CURRICULUM_MASTER_PLAN.md`](./CURRICULUM_MASTER_PLAN.md) | Plano mestre do currículo |
| [`backend/PLAN.md`](./backend/PLAN.md) | Plano detalhado da API Go |
| `frontend/CLAUDE.md` | Arquitetura frontend, gotchas, mapa de componentes |
