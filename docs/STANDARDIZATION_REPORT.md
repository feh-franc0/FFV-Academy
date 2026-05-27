# Standardization Report — Hubs, Trilhas e Módulos

> **Data:** 2026-05-26
> **Status:** Diagnóstico completo. Refactor adiado pra alinhar com **Fase 3 DB-driven**.
> **Autor:** auditoria 3-em-1 (3 análises Explore em paralelo, ver `git log` 8e1f0a7...).

---

## Sumário executivo

3 análises independentes convergiram no **mesmo score 4/10** pra cada nível:

| Nível | Score | Causa raiz |
|-------|-------|-----------|
| Hubs | 4/10 | 3 shapes de dados (Tech `trailIds`, MedVet `moduleSlugs`, Profissional via wrapper) |
| Trilhas | 4/10 | 3 shapes (`Trail`, `TrilhaEspelho`, `BaseTrail`) com campos divergentes |
| Módulos | 4/10 | 2 padrões (`/aprenda` DB-driven vs `/<base>/<slug>` hardcoded TS) |

**Diagnóstico convergente:** o problema raiz é **schema fragmentado**. Sem unificação de tipos no DB, a UI continua precisando de 3+ renderizadores condicionais — o oposto de DB-driven.

---

## 1. Diagnóstico — Hubs

### Inventário (~31 rotas de hub)

| Base | Rota | Componente | Status |
|------|------|-----------|--------|
| Tecnologia | `/ia`, `/aws`, `/engenharia`, `/claude-anthropic`, `/fundamentos`, `/programacao`, `/dados`, `/construcao`, `/seguranca-hardware-hacking` | `HubPageClient` | 9 rotas estáticas |
| Profissional | `/carreira`, `/comunicacao`, `/marketing`, `/conteudo`, `/empreendedorismo`, `/ingles` | `ProfissionalBaseHome` (wrapper de `KnowledgeBaseHome`) | 6 rotas estáticas |
| MedVet | `/medicina-veterinaria/hub/[slug]` | `BaseHubPageClient` | Dinâmica |
| Neurociência | `/neurociencia/hub/[slug]` | `BaseHubPageClient` | Dinâmica |

### Divergências críticas

**Hub.shape:**
```typescript
// Tecnologia (curriculum.ts:37-48)
interface Hub {
  id, slug, name, shortName, href,
  color, icon, tagline,
  desc,
  trailIds: string[],   // ← trilhas indiretas
}

// MedVet/Neuro (bases/types.ts:56-69)
interface BaseHub {
  slug, name, icon, description,
  colorIndex,           // ← índice, não cor hex direto
  moduleSlugs: string[], // ← módulos diretos, sem trilha intermediária
}
```

**Renderização** (3 padrões diferentes):
- `HubPageClient` (Tech): 8 elementos — breadcrumb / hero rich / 4 stats (incl. XP) / progress bar inline / lista de **trilhas** / cards densos
- `BaseHubPageClient` (MedVet/Neuro): 7 elementos — breadcrumb 3-nível / hero simples / 2 stats / lista de **módulos** numerados / footer "voltar"
- `ProfissionalBaseHome`: 13+ elementos via `KnowledgeBaseHome` — Hero / ContinueCard / Paths / Explorar / EndOfContextCta

### Poluição visual residual

- `HubPageClient` mostra XP em stats grid + em cada trail card (redundante, não ensina)
- Progress bar inline ocupa espaço de conteúdo (deveria estar em /progresso)
- 4 padrões de stats grid (Tech 2x2, MedVet inline, Profissional 1x4, etc.)
- Sem indicação visual de pré-requisitos / dificuldade / tempo total

---

## 2. Diagnóstico — Trilhas (203 no total)

### Inventário

| Tipo | Quantidade | Componente | Rota |
|------|------------|-----------|------|
| Curriculum (Tech + Profissional) | 173 | `TrailBlogClient` | 87 rotas fixas + dinâmica em `/aprenda/<slug>` |
| Trilhas Espelho | 5 (3 live, 2 incubating) | `TrilhaEspelhoClient` | `/trilhas-espelho/[slug]` |
| Base Embedded | 3 (MedVet 2, Neuro 1) | `KnowledgeBaseHome` | `/medicina-veterinaria`, `/neurociencia` |

### Shape divergente (impossível DB-driven sem unificar)

| Campo | Trail (curriculum) | TrilhaEspelho | BaseTrail (medvet) |
|-------|--------------------|----|----|
| identificador | `id` | `slug` | `slug` |
| nome | `name` | `examName` | `title` |
| descrição | `desc` | `pitch` | `description` |
| ícone | ✅ | ❌ | ✅ |
| cor | ✅ hex | ❌ (amber fixa) | ❌ (tema da base) |
| Module.desc | `desc` | `summary` | `summary` |
| Module.readTime | ✅ | `estimatedMin` | `estimatedMin` |
| Module.xp | ✅ 40-60 | ❌ | ❌ |
| Module.icon | ✅ | ❌ | ✅ |
| Module.prerequisites | ✅ opcional | ❌ | ❌ |
| Module.nextSuggested | ✅ opcional | ❌ | ❌ |
| Module.level | ✅ enum | ❌ | ❌ |
| Trail.prerequisites | ✅ opcional | ❌ | ❌ |

### Pedagogia oculta

- Campos `prerequisites[]`, `level`, `nextSuggested[]` **existem mas 0% renderizados**
- Nenhuma trilha tem campo `learningOutcomes[]` (nem schema)
- Difficulty crescente nunca visualizada
- Tempo total não é somado em `TrailBlogClient` (só `estimatedHours()` em `TrilhaEspelho`)

---

## 3. Diagnóstico — Módulos

### Inventário

| Rota | Componente | Fonte de dados | Módulos |
|------|-----------|------|---------|
| `/aprenda/<slug>` | `ModuleLayout` (~789 linhas) | DB-driven via `/api/v1/curriculum/<slug>/blocks` | ~816 (Tech) |
| `/medicina-veterinaria/<slug>` | `BaseModule` (~1.105 linhas) | Hardcoded TS (`MEDVET_BASE.trails[].modules[]`) | 16 |
| `/neurociencia/<slug>` | `BaseModule` (~1.105 linhas) | Hardcoded TS (`NEUROCIENCIA_BASE.trails[].modules[]`) | 8 |

### 11 features faltantes em `BaseModule` vs `ModuleLayout`

| Feature | ModuleLayout (Tech) | BaseModule (MedVet/Neuro) |
|---------|---------------------|---------------------------|
| Difficulty badge | ✅ | ❌ |
| BookmarkButton | ✅ | ❌ |
| ModuleActions (print/Anki) | ✅ | ❌ |
| ArticleToc desktop | ✅ | ❌ (só TrailSummaryDrawer) |
| Prerequisites visual | ✅ | ❌ |
| XP reward post-quiz | ✅ | ❌ (hardcoded `xp=0`) |
| ModuleRating | ✅ | ❌ |
| LoginNudgeInline | ✅ | ❌ |
| ReadingProgressBar | ✅ | ❌ |
| RelatedArticles | ✅ | ❌ |
| TimeAttack mode | ✅ | ❌ |
| CelebrationOverlay (badges) | ✅ | ❌ |
| TrailCompletionModal | ✅ | ❌ |
| Print layout | ✅ | ❌ |
| PeerComparisonChip | ✅ | ❌ |
| **Cards SRS gerados** | ✅ | ❌ (gamificação OFF) |

**Implicação prática**: aluno em MedVet acerta 100% no quiz e não ganha **nada** — sem XP, sem badge, sem card SRS gerado. Mesma plataforma, experiências divergentes.

### Poluição em `ModuleLayout`

6 seções de "navegação/descoberta" pós-conteúdo, em sequência:
1. NextSteps
2. NextModuleCard
3. RelatedModules
4. RelatedArticles
5. EndOfContextCta
6. ArticleDiscussion

Plus 3 indicadores de progresso durante leitura (ReadingProgressBar + ArticleToc + scroll milestones) — mesmo em módulos curtos (<10min).

---

## 4. Solução proposta — Schema unificado

```typescript
// lib/unified-types.ts (criar quando começar Fase 3)

interface UnifiedHub {
  id, slug, baseSlug, name, shortName?, icon, color,
  tagline, description,
  type: 'trail-based' | 'module-based',
  trailIds?: string[],        // se trail-based
  moduleSlugs?: string[],     // se module-based
  prerequisites?: string[],   // hub IDs que vêm antes
  difficulty?: Level,
  estimatedHours: number,
  status: 'live' | 'experimental' | 'deprecated',
}

interface UnifiedTrail {
  id, slug, baseSlug, name, description, icon, color,
  type: 'curriculum' | 'mirror' | 'embedded',
  learningOutcomes: string[],
  prerequisites: { trailId: string, reason: string }[],
  difficulty: Level,
  estimatedHours: number,
  modules: UnifiedTrailModule[],
  metadata?: {
    // espelho-only
    examName?, examEdition?, contributorCount?, status?,
  },
}

interface UnifiedModule {
  id, slug, baseSlug, trailSlug,
  title, icon, description, num?,
  difficulty?: Level,
  prerequisites?: string[],
  nextSuggested?: string[],
  estimatedMin: number,
  xp?: number,                     // 0 desativa display de XP
  blocks?: ContentBlock[],         // CMS-driven (Tech)
  sections?: Section[],            // hardcoded fallback (Medvet)
  keyTerms?: KeyTerm[],            // Medvet-style glossário
  quiz: QuizQuestion[],            // shape comum
  learningOutcomes?: string[],
}
```

### Componentes unificados

```
UnifiedHubPage      → atende 31 rotas de hub (9 Tech + 6 Profissional + N MedVet/Neuro)
UnifiedTrailPage    → atende 203 trilhas (173 curriculum + 27 espelho + 3 embutidas)
UnifiedModuleRenderer → atende 840 módulos (816 Tech + 24 MedVet/Neuro)
```

Renderização condicional baseada em **dados**, não em componente. Feature flags por base (ex: MedVet ativa XP/SRS quando estiverem prontos no schema).

---

## 5. Plano de migração (5-6 semanas)

Execução faseada, alinhada com `T0.1` (pipeline UGL) do `ROADMAP.md`:

| Semana | Entrega | Risco |
|--------|---------|-------|
| **1-2** | `lib/unified-types.ts` + adapters (`adaptCurriculum/Mirror/Base → Unified`) + `UnifiedModuleRenderer` com feature flag OFF | Baixo |
| **3-4** | Migrar `/medvet/<slug>` + `/neuro/<slug>` pra UnifiedModuleRenderer. **Ganho imediato**: XP/badges/SRS funcionam em MedVet/Neuro pela 1ª vez. | Baixo |
| **4** | Backend: endpoint `/api/v1/curriculum/<slug>/quiz`. Quiz sai do TS hardcoded, vai pro DB. | Médio |
| **5** | Migrar `/aprenda/<slug>` pra UnifiedModuleRenderer. Mesmo componente pra tudo. | Médio |
| **6** | Migrar hub/trilha pra UnifiedHubPage + UnifiedTrailPage. Deprecar componentes legados (HubPageClient, BaseHubPageClient, ProfissionalBaseHome wrapper, TrailBlogClient, BaseModule). | Médio |

### Saída esperada

- 1 componente por nível (hub, trilha, módulo) — fim de 7 shapes diferentes
- Conteúdo 100% do DB — front zerado de hardcode TS
- Pedagogia visível: difficulty badges + prerequisites banners + learningOutcomes em toda trilha
- Mesma experiência de gamificação em todas as 9 bases

---

## 6. O que JÁ foi feito (rastreio)

Commits relevantes desta sessão de padronização (de mai/2026):

| Commit | Item |
|--------|------|
| `a543d71` | Removeu 6 componentes de poluição (QuizWordleResult, TextSelectionShare, BackToTop, PostReadSignupCta, HubCrossSell, Daily Module banner) |
| `d26e9d5` | Removeu 5 seções poluentes (Trending, ComunidadeAutor, FinalCta, SignupCTA pre-final, GameDemo MÓDULO ATUAL) |
| `8e1f0a7` | 7 ajustes finais (SocialProofBar, stats padronizados, italic span removido, finalCta deprecated, StreakRepair toast, OnboardingWizard off, cap 6 hubs no Explorar) |
| `cec56c6` | Passos 3+5: `BaseHubPageClient` (MedVet/Neuro deixam de copiar 217 linhas cada) + layouts com `BaseThemeProvider` nas 9 bases |
| (este doc) | Diagnóstico 4/10 nos 3 níveis + plano de unificação |

**Total**: ~3.000 linhas de poluição/duplicação eliminadas. Score subiu de ~5/10 pra ~7/10 visual mas continua **4/10 estrutural** porque os shapes de dados não foram unificados ainda — é a parte do refactor que precisa esperar a Fase 3.

---

## 7. Decisão atual

**Refactor adiado pra Fase 3** (DB-driven). Motivos:

1. Pivot UGL (`T0.1`) é prioridade — ROI maior que refactor de UI
2. Migrar pro DB **resolve naturalmente** a fragmentação de schema (DB força um shape único)
3. Fazer refactor agora + refazer quando DB chegar = trabalho duplicado

**Mantido como dívida documentada**. Quando Fase 3 começar, este documento é o ponto de partida.

---

## 8. Arquivos-chave referenciados

### Hubs
- `frontend/src/components/HubPageClient.tsx` (478 linhas)
- `frontend/src/components/base/BaseHubPageClient.tsx` (215 linhas)
- `frontend/src/components/base/ProfissionalBaseHome.tsx` (146 linhas)
- `frontend/src/components/base/KnowledgeBaseHome.tsx` (299 linhas)
- `frontend/src/lib/curriculum.ts:37-48` (interface Hub)
- `frontend/src/lib/bases/types.ts:56-69` (interface BaseHub)

### Trilhas
- `frontend/src/components/TrailBlogClient.tsx` (211 linhas)
- `frontend/src/app/trilhas-espelho/[slug]/TrilhaEspelhoClient.tsx` (287 linhas)
- `frontend/src/lib/curriculum.ts:21-35` (interface Trail)
- `frontend/src/lib/trilhas-espelho.ts` (interface TrilhaEspelho)
- `frontend/src/lib/bases/types.ts` (interface BaseTrail)
- `frontend/src/lib/bases/medvet/index.ts` (MEDVET_BASE)
- `frontend/src/lib/bases/neurociencia/index.ts` (NEUROCIENCIA_BASE)

### Módulos
- `frontend/src/components/ModuleLayout.tsx` (~789 linhas)
- `frontend/src/components/base/BaseModule.tsx` (~1.105 linhas)
- `frontend/src/app/aprenda/[slug]/page.tsx`
- `frontend/src/app/medicina-veterinaria/[slug]/page.tsx`
- `frontend/src/app/neurociencia/[slug]/page.tsx`
- `frontend/src/lib/curriculum.ts:3-19` (interface Module)
- `frontend/src/lib/bases/types.ts` (interface BaseTrailModule)
