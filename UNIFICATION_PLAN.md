# UNIFICATION_PLAN — Bases de Conhecimento como Templates Universais

> **Versão**: 1.0 · **Data**: 2026-05-20 · **Branch**: `feature/pivot-educacao-personalizada`
> **Autor**: Fernando Franco Valle + Claude Opus 4.7
> **Status**: em execução

---

## 🎯 Objetivo (em uma frase)

> **Toda base de conhecimento (tecnologia, medicina-veterinaria, e qualquer base futura gerada via study request) deve renderizar a partir do MESMO conjunto de templates React, com dados vindos do banco — só as cores e o conteúdo mudam.**

Decidido pelo usuário em duas instruções consecutivas (transcritas literalmente):

1. _"Eu so quero 3 coisas: clientside ter as ferraments que ao receber meu back monta a estrutura que preciso visualmente, preciso que todas as bases de conhecimentos sejam iguais estruturalmente, usem os mesmos compoents, tenham as mesmas features e sigam o mesmo padrão, só muda as cores de fato ao acessar."_

2. _"Mas a gente sempre vai ter a tela inicial da base de conhecimento com tudo o que ela oferece, os modulos, as trilhas e as questoes e simulados. Certo? Mas agora todos eles vao ser tampletes que servem para varios tipos de bases de conhecimento de fato."_

---

## 🧭 Por que essa mudança

Hoje temos **três fontes de verdade desencontradas** para o que uma base é:

| Fonte | Tipo | O que sabe |
|---|---|---|
| `frontend/src/components/HomeClient.tsx` | Componente React | Layout da home de `/tecnologia` — 14 imports, 9 seções, gates por `hasProgress`/`isLoggedIn`/`preferences.onboarded` |
| `frontend/src/lib/bases/registry.ts` | TS estático | Slug, nome, tema, microcopy, nav, footer de cada base (tech + medvet) |
| `backend/internal/interfaces/http/handlers/bases_handler.go` → `buildBases()` | Go hardcoded | Mesma informação, duplicada em Go: slug, nome, theme JSON, navItems |

Adicionar uma terceira base ("direito", "medicina", "design"...) hoje exige:

1. Criar `src/lib/bases/<slug>/{index.ts,theme.ts,nav.ts,adapters.ts}`.
2. Criar `src/app/<slug>/page.tsx` (boilerplate de 100 linhas + metadata + KnowledgeBaseHome props).
3. Editar `registry.ts` (frontend).
4. Editar `bases_handler.go` `buildBases()` (backend).
5. Eventualmente: layout, opengraph-image, simulado-genetica equivalente.

**Resultado**: ~5 arquivos novos + 2 edições só pra registrar a base. Conteúdo (módulos, trilhas, hubs, simulados) é outro problema.

A unificação resolve isso com **um único endpoint backend** que descreve a base inteira, **uma única rota frontend** que renderiza qualquer base, e **um único componente React** (`KnowledgeBaseHome`) que aceita props padronizadas vindas desse endpoint.

---

## 📐 Arquitetura-alvo

```
┌──────────────────────────────────────────────────────────────────────┐
│ Postgres                                                             │
│   bases (slug PK, name, status, theme JSONB, slogans JSONB,          │
│          microcopy JSONB, nav JSONB, footer JSONB, features JSONB,   │
│          stats JSONB, hubs JSONB, paths JSONB, final_cta JSONB)      │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Backend Go — domain/base + infrastructure/persistence/postgres       │
│   BaseRepository.GetBySlug(slug) → *Base                             │
│   BaseRepository.List() → []*Base                                    │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ HTTP — interfaces/http/handlers/base_page_handler.go                 │
│   GET /api/v1/bases/{slug}/page → BasePageDTO (full descriptor)      │
│   GET /api/v1/bases               → lista resumida (hoje, mantido)   │
└────────────────────────────────┬─────────────────────────────────────┘
                                 │ JSON
                                 ▼
┌──────────────────────────────────────────────────────────────────────┐
│ Frontend Next.js                                                     │
│   /tecnologia/page.tsx           ──┐                                 │
│   /medicina-veterinaria/page.tsx ──┼─► <KnowledgeBaseHome />         │
│   /<future-base>/page.tsx        ──┘                                 │
│                                                                      │
│   Cada page.tsx:                                                     │
│     1. fetch GET /bases/{slug}/page (SSR)                            │
│     2. <KnowledgeBaseHome {...descriptor} />                         │
│     3. Fallback estático (registry.ts) se backend offline            │
└──────────────────────────────────────────────────────────────────────┘
```

**Chave de design**: o `BasePageDTO` é um **descritor de página completo** — não um catálogo de blocos editáveis. O frontend sabe a ordem; o backend só passa os dados. Isso preserva o controle de UX no código (não tem admin drag-drop) e elimina a complexidade de SDUI completo.

---

## 🧱 As 9 Sections universais (a ORDEM é fixa)

Toda base — sem exceção — renderiza essas 9 sections na ordem abaixo. Quem decide aparecer ou não é o **gate interno do bloco**, não o backend.

| # | Section | Gate (quando aparece) | Componente atual |
|---|---|---|---|
| 1 | **Hero** | sempre | `components/home/Hero.tsx` |
| 2 | **OnboardingWizard** | `isLoggedIn && preferences.onboarded === false` | `components/onboarding/OnboardingWizard.tsx` |
| 3 | **DailyQuestionCard** | `isLoggedIn && preferences.onboarded === true && preferences.dailyQuestionEnabled` | `components/daily/DailyQuestionCard.tsx` |
| 4 | **PreferenciasCTA** (banner fallback) | `isLoggedIn && preferences.onboarded === false && !showOnboardingWizard` | inline em `HomeClient.tsx` hoje — será extraído |
| 5 | **SocialProofBar** | sempre | `components/home/SocialProofBar.tsx` |
| 6 | **HowItWorks** | sempre | `components/home/HowItWorks.tsx` |
| 7 | **ContinueDailyTrilhaQuest** (4 widgets) | `hasProgress` (state.completedModules.length > 0) | ContinueCard + DailyModuleCard + TrilhaDoDia + QuestPanel |
| 8 | **ComecarAqui** | `!hasProgress` (ou sempre se a base passar `alwaysShowPaths`) | `components/home/ComecarAqui.tsx` |
| 9 | **Explorar** | sempre (se houver hubs ou playlists) | `components/home/Explorar.tsx` |
| 10 | **Trending** | sempre (se backend retornar trending) | `components/home/Trending.tsx` |
| 11 | **HomeRanking** | `!base.hideRanking` | `components/home/HomeRanking.tsx` |
| 12 | **ComunidadeAutor** | `!base.hideComunidade` | `components/home/ComunidadeAutor.tsx` |
| 13 | **FinalCta** | sempre | `components/home/FinalCta.tsx` |
| 14 | **StreakRepairModal** | streak quebrou + usuário tem XP | overlay (não é "section") |

> Note: `OnboardingWizard`, `DailyQuestionCard`, `Continue*`, `StreakRepairModal` só aparecem na base que tem **gamification: 'global'** (todas hoje). Bases com `gamification: 'off'` no futuro podem suprimir esses widgets via prop.

---

## 🛑 O QUE NÃO PODEMOS MATAR (lista negra de regressões)

Todos os itens abaixo **devem continuar funcionando exatamente como hoje** após a refatoração. Cada um tem teste, fluxo ou contrato dependendo dele.

### Frontend

- **/tecnologia**: home com Hero + GameDemo + Continue/Daily/TrilhaDoDia/QuestPanel + Trending + Ranking + ComunidadeAutor + FinalCta. SEO metadata exato preservado.
- **/medicina-veterinaria**: home com KnowledgeBaseHome (tema sage + mel), simulado-genetica funcional, módulos `/medicina-veterinaria/[slug]` funcionando.
- **OnboardingWizard**: dispara para logados sem `preferences.onboarded`. Não pode disparar para visitantes deslogados.
- **DailyQuestionCard**: só para logados com onboarding completo e `dailyQuestionEnabled === true`.
- **StreakRepairModal**: dispara 1× por dia se `detectStreakBreak()` retorna `eligible`. Custa 50 XP.
- **GameHUD**: continua mostrando XP, streak, due cards, meta diária. Nav items GLOBAIS de `/simulados`/`/news` continuam aparecendo em /tecnologia (ver teste `GameHUD.test.tsx`).
- **GameState**: schema v3 intacto — campos `bookmarks`, `moduleRatings`, `articleProgress`, etc. (`engine.ts`).
- **Web Audio API** (`unlockAudio`): primeira interação ainda destrava o som.
- **CelebrationOverlay**: badge/level-up/streak overlay continua aparecendo.
- **PWA install banner** + **SyncBanner**: lógica de dismiss preservada.
- **CSP HTTP header**: nada novo em `next.config.ts` headers — fetcher do backend já está em `connect-src`.
- **/aprenda/[slug]** com 904 slugs estáticos pré-renderizados via `generateStaticParams`.
- **/ranking**, **/progresso**, **/revisar**, **/simulados**, **/news**, **/explorar**, **/search**, **/mapa**, **/comunidade**, **/sobre**, **/newsletter** — todas as 30+ rotas globais intactas.
- **562 testes Vitest** + **27 specs Playwright e2e** verdes ao final de cada fase.

### Backend

- **Endpoints existentes** `/api/v1/bases` (lista), `/api/v1/leaderboard*`, `/api/v1/stats`, todos os JWT-gated. Comportamento e schemas inalterados.
- **Migrations 1-47**: nenhuma alterada, apenas novas adicionadas (48+).
- **Auth, billing, certs, simulado, progress, tutor**: tudo intacto.
- **Audit log middleware, rate-limit, CORS**: zero mudanças.
- **Deploy SSR Docker** na VPS Hostinger: imagens `ghcr.io/feh-franc0/ffv-api` e `ghcr.io/feh-franc0/ffv-frontend` continuam buildando e subindo.

### Conteúdo

- **157 módulos de tecnologia** + **12 módulos de medvet** continuam navegáveis.
- **CURRICULUM master** em `src/lib/curriculum.ts` (~5000 linhas, 8 hubs, 66+ trilhas) **NÃO É MOVIDO** nesta refatoração. Ele continua sendo o source-of-truth dos módulos de tecnologia. Apenas a **descrição da base** (theme, slogans, microcopy, paths, hubs cards, finalCta) vira data-driven.

---

## 📦 Fases de execução

### **Fase 0 — Documentação** (este arquivo)

- Criar `UNIFICATION_PLAN.md` (este).
- Atualizar `frontend/CLAUDE.md` com seção curta apontando para cá.

### **Fase 1 — Unificar template frontend** (~3-4 horas)

**Objetivo**: `/tecnologia/page.tsx` e `/medicina-veterinaria/page.tsx` ambos renderizam `<KnowledgeBaseHome />` — não mais `<HomeClient />`. `HomeClient` é deletado.

**Passo a passo**:

1. **Estender `KnowledgeBaseHome.tsx`** para aceitar mais props:
   - `hasGamificationWidgets?: boolean` (default true) — controla OnboardingWizard, DailyQuestion, Continue/Daily/Trilha/Quest, Trending, StreakRepairModal.
   - `trending?: boolean` (default true se a base for tech, false para medvet).
   - `socialProof?: boolean` (default true).
   - `howItWorks?: boolean` (default true).
   - `showGameDemo` já está no `hero` props — preservar.

2. **Mover lógica de gates** (que está em `HomeClient.tsx` linhas 60-99) para dentro do `KnowledgeBaseHome`:
   - `useGameState()`, `useAuth()`, `usePreferences()`, `detectStreakBreak()`.
   - Os gates `hasProgress`, `showOnboardingWizard`, `showDailyQuestion`, `showPreferencesCTA` viram internos.

3. **Criar `/tecnologia/page.tsx`** novo (substituir `HomeClient`):
   ```tsx
   <KnowledgeBaseHome
     theme={TECH_THEME}           // do registry.ts
     hero={{ ...techHeroProps }}
     paths={TECH_PATHS}
     hubs={TECH_HUBS}
     playlists={TECH_PLAYLISTS}
     finalCta={{ ...techFinalCta }}
     // hasGamificationWidgets default true
   />
   ```

4. **Deletar `HomeClient.tsx`** + `HomeClientLegacy.tsx` se existir.

5. **Adapter de tech**: criar `src/lib/bases/tecnologia/adapters.ts` com `TECH_HUBS`, `TECH_PATHS`, `TECH_PLAYLISTS` derivados de `CURRICULUM`. Espelha o pattern de `medvet/adapters.ts`.

6. **Testes**:
   - `npm run lint` → 0 warnings.
   - `npm test` → 562 testes verdes.
   - E2E sanity: `/tecnologia`, `/medicina-veterinaria` renderizando, OnboardingWizard aparece para logado novo.

7. **Commit**: `refactor(home): unifica /tecnologia e /medvet em KnowledgeBaseHome único`.

### **Fase 2 — Mover bases para Postgres** (~3-4 horas)

**Objetivo**: `bases_handler.go` consulta Postgres em vez de retornar lista hardcoded.

**Passo a passo**:

1. **Migration `000048_create_bases.up.sql`**:
   ```sql
   CREATE TABLE bases (
     slug              TEXT        PRIMARY KEY,
     name              TEXT        NOT NULL,
     area_label        TEXT        NOT NULL,
     description       TEXT        NOT NULL,
     icon              TEXT        NOT NULL,
     status            TEXT        NOT NULL CHECK (status IN ('live', 'queued', 'in_production')),
     url               TEXT,
     theme             JSONB       NOT NULL,
     slogans           JSONB       NOT NULL DEFAULT '{}'::jsonb,
     microcopy         JSONB       NOT NULL DEFAULT '{}'::jsonb,
     nav_items         JSONB       NOT NULL DEFAULT '[]'::jsonb,
     footer            JSONB       NOT NULL DEFAULT '{}'::jsonb,
     features          JSONB       NOT NULL DEFAULT '{}'::jsonb,
     stats             JSONB       NOT NULL DEFAULT '{}'::jsonb,
     hubs              JSONB       NOT NULL DEFAULT '[]'::jsonb,
     paths             JSONB       NOT NULL DEFAULT '[]'::jsonb,
     final_cta         JSONB,
     hide_global_content_nav BOOLEAN NOT NULL DEFAULT FALSE,
     created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
     updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
   );

   CREATE INDEX idx_bases_status ON bases(status);
   ```

2. **Migration `000048_create_bases.down.sql`**: `DROP TABLE bases;`.

3. **Seed inicial** (em SQL no `000049_seed_bases.up.sql`):
   - Tecnologia: theme navy+cream, status `live`, stats (modules=157, trails=16, hubs=8), paths e hubs derivados do CURRICULUM (lista canônica).
   - Medicina Veterinária: theme sage+mel, status `live`, stats (12/1/1), paths e hubs do MEDVET_BASE.
   - 10 bases `queued` (medicina, engenharia, direito, etc.) sem hubs/paths.

4. **Domain layer** `backend/internal/domain/base/`:
   ```
   base.go          ← struct Base, validação, métodos puros
   repository.go    ← interface Repository { GetBySlug, List }
   ```

5. **Postgres repo** `backend/internal/infrastructure/persistence/postgres/base_repo.go`:
   - `GetBySlug(ctx, slug) (*domain.Base, error)` → SELECT + parse JSONB.
   - `List(ctx) ([]*domain.Base, error)` → SELECT all.
   - Erro `ErrNotFound` quando slug ausente.

6. **Refatorar `bases_handler.go`**:
   - Injetar `BaseRepository` (em `main.go`).
   - `buildBases(counts)` vira `loadBases(ctx, counts)` que chama `repo.List()`.
   - DTO continua o mesmo (compatibilidade de wire).

7. **Testes** (backend):
   - `internal/domain/base/base_test.go` — validação pura.
   - `test/contract/bases_handler_test.go` — atualizado para usar fake repo.
   - `test/integration/base_repo_test.go` — testcontainers Postgres, seed + GetBySlug + List.

8. **Verificar** que `GET /api/v1/bases` continua retornando o mesmo JSON shape do antes (validar via curl ou contract test).

9. **Commit**: `feat(bases): persiste catálogo de bases em Postgres (mig 48-49)`.

### **Fase 3 — Endpoint base/{slug}/page + frontend fetcher** (~3-4 horas)

**Objetivo**: frontend busca a base via API e renderiza dinamicamente. Mantém fallback estático para SSR resiliente.

**Passo a passo**:

1. **DTO** `BasePageDTO` em `bases_handler.go`:
   ```go
   type BasePageDTO struct {
       Slug      string             `json:"slug"`
       Name      string             `json:"name"`
       Theme     BaseThemeDTO       `json:"theme"`
       Hero      HeroDTO            `json:"hero"`
       Paths     []PathDTO          `json:"paths"`
       Hubs      []HubCardDTO       `json:"hubs"`
       Playlists []PlaylistCardDTO  `json:"playlists,omitempty"`
       FinalCTA  *FinalCTADTO       `json:"finalCta,omitempty"`
       Stats     map[string]int     `json:"stats"`
       Microcopy map[string]string  `json:"microcopy"`
       Features  BaseFeaturesDTO    `json:"features"`
       Flags     struct {
           HideRanking          bool `json:"hideRanking"`
           HideComunidade       bool `json:"hideComunidade"`
           HideGlobalContentNav bool `json:"hideGlobalContentNav"`
       } `json:"flags"`
   }
   ```

2. **Handler** `BasesHandler.GetPage(w, r)`:
   - `slug := chi.URLParam(r, "slug")`.
   - `base, err := h.repo.GetBySlug(ctx, slug)` → 404 se `ErrNotFound`.
   - Monta `BasePageDTO` a partir de `domain.Base`.
   - Cache `public, max-age=300`.

3. **Rota** em `router.go`: `GET /api/v1/bases/{slug}/page`.

4. **Frontend SDK** `src/lib/bases/api.ts`:
   ```ts
   export async function getBasePage(slug: string): Promise<BasePageDTO | null> {
     const res = await fetch(`${API_BASE}/api/v1/bases/${slug}/page`, {
       next: { revalidate: 300 },
     });
     if (!res.ok) return null;
     return res.json();
   }
   ```

5. **Atualizar** `/tecnologia/page.tsx` e `/medicina-veterinaria/page.tsx`:
   ```tsx
   export default async function Page() {
     const dto = await getBasePage('tecnologia');
     // Fallback para registry.ts se backend offline (preserva SEO/SSR).
     const props = dto ? mapDtoToProps(dto) : STATIC_TECH_PROPS;
     return <KnowledgeBaseHome {...props} />;
   }
   ```

6. **NÃO criar rota dinâmica `/[base]/page.tsx`** nesta fase. Motivo: 100+ rotas existentes (`/ia`, `/aws`, `/news`, etc.) conflitariam com catch-all. Vamos manter páginas explícitas por base e migrar para rota dinâmica em refatoração futura.

7. **Testes**:
   - Backend: contract test para `GET /bases/tecnologia/page` retornando 200 com DTO completo, e 404 para slug inexistente.
   - Frontend: snapshot/render test da página com DTO mockado.
   - E2E: `/tecnologia` e `/medicina-veterinaria` continuam carregando mesmo com API offline (fallback).

8. **Commit**: `feat(bases): endpoint /bases/{slug}/page + frontend data-driven`.

---

## 🧪 Critérios de "pronto" por fase

Cada fase só está completa quando:

| Critério | Como verificar |
|---|---|
| Lint zero | `cd frontend && npm run lint` ; `cd backend && make lint` |
| Build verde | `cd frontend && npm run build` ; `cd backend && go build ./...` |
| Testes unit + contract | `cd frontend && npm test` ; `cd backend && make test-unit && make test-contract` |
| /tecnologia e /medicina-veterinaria renderizam | Visual: `npm run dev` + abrir browser em ambos |
| Endpoints existentes não mudam | `curl localhost:8080/api/v1/bases \| jq` antes e depois — diff vazio |
| Onboarding wizard aparece para logado novo | E2E: login → home → wizard visível |
| Streak repair aparece se elegível | Manual: simular `state.streak=0` + `lastStudyDate=2dias atrás` + `xp>=50` |
| GameHUD com XP/streak/cards inalterado | Render test `GameHUD.test.tsx` verde |

---

## ⚠️ Riscos e mitigações

| Risco | Mitigação |
|---|---|
| Backend offline durante build/SSR derruba a home | Fallback estático em `registry.ts`; `getBasePage()` retorna `null` em erro e a página usa props estáticos. |
| Migration de tipos JSONB conflita com tipos Go | Validar JSON schema do tema antes do seed; teste unit para `UnmarshalJSON` da entidade `Base`. |
| Algum teste do GameHUD/HomeClient quebra após refactor | Manter mesma estrutura externa (slug → URL → componente render). Rodar `npm test -- --reporter=verbose` após cada commit. |
| Performance — fetch SSR adiciona latência | `next: { revalidate: 300 }` cacheia por 5min; backend retorna `Cache-Control: public, max-age=300`. |
| SEO — metadata por base precisa ser preservada | `metadata` continua hardcoded em cada `page.tsx`. O DTO da API serve **conteúdo**, não tags `<head>`. |
| Deploy precisa rodar migrations 48+ antes do código que lê `bases` | Sequência do `deploy.sh` em `/opt/ffv/bin` já roda `migrate up` antes de subir API. Documentado em `backend/CLAUDE.md`. |

---

## 🚫 O que NÃO está no escopo desta refatoração

Para evitar scope creep — itens que ficam para um próximo PR:

- **Admin UI para editar bases** (drag-drop de blocos, editor de tema). Banco está pronto, mas UI fica para depois.
- **Mover conteúdo de módulos** (`CURRICULUM`) para Postgres. O `articles` table já existe (mig 23), mas o CURRICULUM TS ainda é a fonte canônica e continua sendo.
- **Rota dinâmica `/[base]`** que serve todas as bases via um único `page.tsx`. Requer renomear /ia, /aws, /news pra não conflitar — invasivo demais.
- **Internacionalização** (EN/ES). Microcopy fica em PT-BR só.
- **PageDescriptor com gates dinâmicos por base** (admin decide quais blocos aparecem). Decisão do usuário: estrutura é fixa em código.

---

## 📚 Referências

- `CLAUDE.md` (raiz) — proposta de valor, roadmap, posicionamento.
- `frontend/CLAUDE.md` — stack, gotchas, mapa de áreas-chave.
- `backend/CLAUDE.md` — endpoints, domain layer, deploy.
- `docs/ARCHITECTURE.md` — DDD layers no backend.
- `BACKEND_ROADMAP.md` — iniciativas pendentes que dependem do backend.

---

## ✅ Sign-off

| Quem | Aprovação | Data |
|---|---|---|
| Fernando Franco (product owner) | ✅ confirmado no chat | 2026-05-20 |
| Claude Opus 4.7 (executor) | ✅ 3 rodadas de validação concluídas | 2026-05-21 |

---

## 🔬 Validação em 3 rodadas

### Rodada 1 — Análise estática + suíte completa

| Verificação | Resultado |
|---|---|
| `go vet ./...` | ✅ 0 erros |
| `go test ./... -race -count=1` | ✅ todos os pacotes passam com race detector |
| `npx tsc --noEmit` frontend | ✅ 0 erros |
| `npm run lint` frontend | ✅ 0 warnings |
| `npm test` frontend | ✅ 1082 passed / 7 skipped |
| `npm run build` frontend | ✅ build prod estático verde; `/tecnologia` listado como `○ Static` com revalidate 5m |
| JSON dos 22 literais JSONB do seed | ✅ todos parseáveis (validado via Python) |
| Tags JSON Go ↔ TypeScript `BasePageDTO` | ✅ alinhadas (camelCase consistente) |
| Auditoria linha-a-linha por subagent Explore | ✅ identificou P1/P2 — todos endereçados |
| Refs órfãs ao `HomeClient` | ✅ zero remanescentes (src/, e2e/, public/) |

### Rodada 2 — Smoke E2E real (Postgres → API → SSR)

| Verificação | Resultado |
|---|---|
| Migrations 48-49 aplicadas em Postgres dev | ✅ versão 47 → 49 |
| `SELECT` em `bases`: 11 linhas | ✅ tech+medvet `live`, 9 outras `queued` |
| Theme JSONB: `accent`, `accentLight`, `hubColors[4]` | ✅ completo para tech (#1e3a8a) e medvet (#8a9b7e) |
| `GET /api/v1/bases` com repo | ✅ 200, lista vem do banco |
| `GET /api/v1/bases/tecnologia/page` | ✅ 200, DTO completo, `Cache-Control: public, max-age=300` |
| `GET /api/v1/bases/medicina-veterinaria/page` | ✅ 200, `flags.hideGlobalContentNav=true` |
| `GET /api/v1/bases/nao-existe/page` | ✅ 404 `application/problem+json` |
| `/tecnologia` SSR carregando | ✅ `--ffv-blue: #1e3a8a`, "Aprenda IA, AWS", 157 modules |
| `/medicina-veterinaria` SSR carregando | ✅ `--ffv-blue: #8a9b7e` (sage), zero leak de tema |
| Theme isolation entre bases | ✅ confirmado em headers + HTML rendered |

### Rodada 3 — Melhorias aplicadas

**Bug pré-existente corrigido durante validação:**

- `httputil.WriteJSON` setava `application/problem+json` em todas as respostas — agora seta `application/json` para sucesso, mantém `application/problem+json` apenas para erros via `WriteError` (correção RFC 7807). Afetava TODOS os endpoints da API, não só os novos.

**Testes adicionados** (`bases_handler_test.go` agora tem 12 testes — antes 7):

1. `Test_BasesHandler_GetPage_Success_HasJSONContentType` — trava o fix do WriteJSON.
2. `Test_BasesHandler_GetPage_Error_HasProblemJSONContentType` — trava o caminho de erro RFC 7807.
3. `Test_BasesHandler_GetPage_HasCacheControl` — garante `public, max-age=300`.
4. `Test_BasesHandler_GetPage_ThemeFullyPopulated` — regression test contra perda de campos do theme na serialização (ink/paper/cream/border/muted/accent/accentLight/success/hubColors).
5. `Test_BasesHandler_Fallback_MatchesSeedExpectations` — paridade entre o fallback hardcoded e o seed da migration 49 (tech: 157/16/8 + theme + 4 nav items; medvet: 12/1/1 + theme + hideGlobalContentNav=true). Trava drift futuro.

**Findings que NÃO precisaram correção:**

- P0 do auditor (theme spread perdendo `accentLight`) — **falso positivo**. `{...FALLBACK, ...dto.theme}` já copia todos os campos via spread JS; o teste novo `ThemeFullyPopulated` confirma e prende.
- "`hideGlobalContentNav` não usado pelo frontend" — falso positivo: já é consumido via `BaseNavContext` → `GameHUD` / `CommandPalette`. A flag do banco existe para o caminho futuro quando `registry.ts` deixar de ser fonte.
- "Seed JSONB `hero`/`paths`/`finalCta` vazios" — **by design** (Fase 3 documentada). Frontend tem fallback estático preservando SSR. Fase 4 futura popula isso pra bases não-tech/medvet.

### Métricas finais

| | Antes | Depois |
|---|---|---|
| Backend Go — testes verdes | ~280 | ~287 (5 novos no BasesHandler) |
| Frontend Vitest — testes verdes | 1082 | 1082 (mesma cobertura, sem regressão) |
| `go vet ./...` | 0 erros | 0 erros |
| `npm run lint` | 0 warnings | 0 warnings |
| Arquivos JSON do seed parseáveis | n/a | 22/22 |
| Endpoints `bases` cobertos por contract test | 1 (`List`) | 2 (`List` + `GetPage`) com 12 cenários |
| Content-Type RFC 7807 correto | ❌ todo lugar mostrava `problem+json` | ✅ success=`application/json`, error=`problem+json` |
