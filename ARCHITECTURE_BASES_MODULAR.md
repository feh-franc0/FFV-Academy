# Arquitetura — FFV Academy: Plataforma Modular por Base de Conhecimento

> Documento vivo. Última revisão: 2026-05-19.
>
> Companheiros: [`COMPETITIVE_ANALYSIS_2026-05.md`](./COMPETITIVE_ANALYSIS_2026-05.md) (posicionamento) e [`MEDVET_AUDIT.md`](./MEDVET_AUDIT.md) (relatório da primeira base não-tech).

## Sumário

1. Princípio de modularização
2. Diagrama de arquitetura
3. Types & contracts (frontend + backend)
4. Componentes novos
5. Refatorações de componentes existentes
6. Migrations SQL
7. Plano de implementação em fases

---

## 1) Princípio de modularização

Toda **base de conhecimento** (tecnologia, medicina veterinária, direito, design...) compartilha o **mesmo layout, UX e components**. Variam apenas:

- **Cores** (CSS vars via `BaseThemeProvider`)
- **Conteúdo** (módulos, trilhas, simulados, questões — `Trail[]`)
- **Microcopy** (CTAs, vazios, slogans, unidade de XP — `BaseMicrocopy`)
- **Mascote/ícone** (`BaseMascot`)
- **Nav items** (links do header — `BaseNavItem[]`)
- **Footer** (links da base + versão mobile-compacta — `BaseFooterConfig`)
- **Features ligadas** (`{ gamification, srs, quizzes, community }`)

Tudo o mais — header, sidebar, drawer de trilha, modais, gamificação, ranking, SRS — é **um único componente compartilhado** que lê do `BaseProvider`.

**Imersão na base**: ao entrar em `/medicina-veterinaria/...`, o `BaseResolver` lê o prefixo do path, hidrata `BaseProvider` com a `BaseConfig` correta, e todos os componentes downstream consomem desse contexto. Mudar de base = trocar um único objeto raiz.

---

## 2) Diagrama de arquitetura

```
<html data-theme="light"> + CSS vars overridden por base
│
├─ AppChrome (client, decide chrome por rota)
│  ├─ isMarketingPath? → BaseThemeProvider(MARKETING_THEME) + LandingHeader/Footer
│  └─ App path → BaseResolver(pathname) → BaseConfig
│     │
│     └─ BaseProvider (config inteira da base)
│        ├─ BaseThemeProvider     (CSS vars)
│        ├─ BaseNavProvider       (hubNavItems, hide flags)
│        ├─ BaseCopyProvider      (microcopy, slogans, mascot)
│        ├─ UserPreferencesProvider — GET /api/v1/user/preferences (SWR)
│        ├─ TrailContext          (escopado por /<base>/<trail>/<mod>)
│        │   exposes: currentTrail, modules[], currentModuleIdx,
│        │   openDrawer(), drawerOpen, progress per module
│        └─ EngagementTracker     (fire-and-forget POST /events)
│
├─ GameHUD               (lê BaseNavContext + BaseCopy)
├─ TrailSummaryDrawer    (lê TrailContext — fixo desktop esq, drawer mob direito)
├─ FloatingTrailMenuButton (mobile-only, lê TrailContext)
├─ BaseAwareFooter       (responsivo, lê BaseConfig.footerLinks)
└─ MobileNav             (lê BaseNavContext)
```

### Backend

```
GET  /api/v1/bases                          (já existe — estende BaseDTO)
GET  /api/v1/bases/{slug}                   (NOVO — full BaseConfig)
GET  /api/v1/user/preferences               (NOVO)
PUT  /api/v1/user/preferences               (NOVO)
POST /api/v1/user/engagement-events         (NOVO — log de eventos)
GET  /api/v1/admin/users/{id}/engagement    (NOVO)
GET  /api/v1/admin/bases/{slug}/health      (NOVO)
```

---

## 3) Types & contracts

```ts
// src/lib/bases/types.ts (estende o atual — additive)

export interface BaseMicrocopy {
  ctaPrimary: string;          // "Começar trilha" / "Iniciar caso clínico"
  ctaSecondary: string;
  emptyState: string;
  searchPlaceholder: string;
  rankingTitle: string;        // "Top devs" / "Top vets"
  xpUnitSingular: string;      // "XP" / "ponto clínico"
  xpUnitPlural: string;
  moduleNoun: string;          // "módulo" / "caso"
  trailNoun: string;           // "trilha" / "protocolo"
}

export interface BaseMascot {
  emoji: string;               // "🐾"
  imageUrl?: string;
  name: string;                // "Lupa"
  greeting: string;            // "Oi! Bora estudar genética?"
}

export interface FooterLinkItem { label: string; href: string; external?: boolean }

export interface BaseFooterConfig {
  hubColumnTitle: string;
  hubLinks: FooterLinkItem[];
  contentColumnTitle: string;
  contentLinks: FooterLinkItem[];
  socialLinks?: FooterLinkItem[];
  mobilePrimary: FooterLinkItem[]; // 3-4 itens pra footer compacto
  copyright?: string;
}

export interface BaseConfig extends Base {
  basePath: string;            // "/medicina-veterinaria"
  status: 'live' | 'queued' | 'in_production';
  theme: BaseTheme;
  mascot: BaseMascot;
  microcopy: BaseMicrocopy;
  slogans: { hero: string; sub: string; cta: string };
  nav: { hubNavItems: BaseNavItem[]; hideGlobalContentNav: boolean };
  footer: BaseFooterConfig;
  simulados?: { slug: string; title: string; href: string }[];
  features: {
    gamification: 'global' | 'scoped' | 'off';
    srs: boolean;
    quizzes: boolean;
    community: boolean;
  };
}

// ---- User Preferences ----
export type StudyFrequency =
  | { kind: 'daily' }
  | { kind: 'weekly'; daysPerWeek: number }
  | { kind: 'specific_days'; weekdays: number[] };

export type MaterialKind = 'video' | 'text' | 'quiz' | 'srs' | 'cheatsheet';

export interface UserPreferences {
  userId: string;
  interestedBases: string[];
  homeBase: string | null;
  learningGoals: string;
  topicTags: string[];
  frequency: StudyFrequency;
  preferredMaterials: MaterialKind[];
  visitedBases: string[];
  lastSeenPerBase: Record<string, string>;
  engagement: Record<string, BaseEngagement>;
  // herdados de user_preferences atual:
  hubIds: string[];
  certificationIds: string[];
  objectives: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | null;
  dailyQuestionEnabled: boolean;
  onboardedAt: string | null;
  updatedAt: string;
}

export interface BaseEngagement {
  baseSlug: string;
  modulesOpened: number;
  modulesCompleted: number;
  trailCompletionPct: Record<string, number>;
  avgTimePerModuleSec: number;
  lastAccess: string;
  inferredInterestScore: number;
}
```

---

## 4) Componentes novos

| Componente | Path | Responsabilidade |
|---|---|---|
| `BaseProvider` | `src/components/base/BaseProvider.tsx` | Context raiz; engloba BaseTheme/Nav/Copy |
| `BaseCopyProvider` | `src/components/base/BaseCopyProvider.tsx` | Microcopy + mascot + slogans |
| `useBaseConfig` | `src/hooks/useBaseConfig.ts` | Retorna `BaseConfig` corrente |
| `BaseResolver` | `src/lib/bases/resolver.ts` | Map pathname → `BaseConfig` |
| `BaseRegistry` | `src/lib/bases/registry.ts` | Map slug → `BaseConfig` (única fonte de verdade) |
| `TrailContext` | `src/components/base/TrailContext.tsx` | Expõe módulos, progresso, drawer state |
| `TrailSummaryDrawer` | `src/components/base/TrailSummaryDrawer.tsx` | Sidebar fixa desktop + drawer mobile direita |
| `FloatingTrailMenuButton` | `src/components/base/FloatingTrailMenuButton.tsx` | FAB burger canto inferior direito (mobile) |
| `BaseAwareFooter` | `src/components/BaseAwareFooter.tsx` | Footer responsivo |
| `MobileFooterCompact` | `src/components/footer/MobileFooterCompact.tsx` | 3-4 chips + bottom sheet |
| `ProfilePreferencesForm` | `src/components/profile/ProfilePreferencesForm.tsx` | Perfil editável |
| `useUserPreferences` | `src/hooks/useUserPreferences.ts` | GET/PUT preferences |
| `EngagementTracker` | `src/components/base/EngagementTracker.tsx` | Fire-and-forget event log |
| `AdminUserEngagementPanel` | `src/app/admin/users/[id]/engagement/page.tsx` | Engagement por usuário |
| `AdminBaseHealthDashboard` | `src/app/admin/bases/[slug]/health/page.tsx` | Saúde por base |

---

## 5) Refatorações

1. **`AppChrome.tsx`** — remover `getBaseChromeForPath` hardcoded; usar `resolveBaseConfig(pathname)`. Substituir os 2 providers por `BaseProvider` único.
2. **`SiteFooter.tsx`** → renomear pra `BaseAwareFooter`, ler links do `BaseProvider`, integrar `MobileFooterCompact` em `<md`.
3. **`BaseNavContext.tsx`** — continuar existindo, alimentado pelo `BaseProvider`.
4. **`BaseModule.tsx`** — sidebar de módulos passa a viver no `TrailContext`; sidebar fixa em `≥lg`, drawer em mobile.
5. **`MEDVET_BASE` + `TECH_BASE`** — passar a exportar `BaseConfig` completo (additive, retrocompatível).
6. **`GameHUD.tsx`** — usar `useBaseCopy()` pra microcopy de XP/streak ("ponto clínico" no medvet futuramente).
7. **`OnboardingModal.tsx`** — persistir preferências via `useUserPreferences`.
8. **`/app/perfil/page.tsx`** — renderizar `ProfilePreferencesForm`.
9. **`bases_handler.go`** — estender `BaseDTO` com microcopy/mascot/footer; adicionar `GET /bases/{slug}`.
10. **`MobileNav.tsx`** — ler `hubNavItems` do `BaseProvider`.

---

## 6) Migrations backend

```sql
-- 000045_extend_user_preferences.up.sql
ALTER TABLE user_preferences
  ADD COLUMN interested_bases     TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN home_base            TEXT,
  ADD COLUMN learning_goals       TEXT        NOT NULL DEFAULT '',
  ADD COLUMN topic_tags           TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN frequency_kind       TEXT        NOT NULL DEFAULT 'weekly',
  ADD COLUMN frequency_payload    JSONB       NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN preferred_materials  TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN visited_bases        TEXT[]      NOT NULL DEFAULT '{}',
  ADD COLUMN last_seen_per_base   JSONB       NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX idx_user_preferences_interested_bases
  ON user_preferences USING GIN (interested_bases);

-- 000046_create_user_base_engagement.up.sql
CREATE TABLE user_base_engagement_events (
  id            BIGSERIAL PRIMARY KEY,
  user_id       TEXT        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  base_slug     TEXT        NOT NULL,
  kind          TEXT        NOT NULL,
  trail_slug    TEXT,
  module_slug   TEXT,
  duration_ms   INTEGER,
  metadata      JSONB       NOT NULL DEFAULT '{}'::jsonb,
  occurred_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT engagement_kind_valid CHECK (
    kind IN ('visit_base','open_trail','open_module','complete_module',
             'open_simulado','finish_simulado','open_review','rate_module')
  )
);
CREATE INDEX idx_engagement_user_base ON user_base_engagement_events (user_id, base_slug);
CREATE INDEX idx_engagement_base_time ON user_base_engagement_events (base_slug, occurred_at DESC);
CREATE INDEX idx_engagement_module    ON user_base_engagement_events (module_slug)
  WHERE module_slug IS NOT NULL;

-- 000047_create_user_base_engagement_rollup.up.sql
CREATE MATERIALIZED VIEW user_base_engagement_rollup AS
SELECT user_id, base_slug,
       COUNT(*) FILTER (WHERE kind='open_module')     AS modules_opened,
       COUNT(*) FILTER (WHERE kind='complete_module') AS modules_completed,
       MAX(occurred_at)                               AS last_access,
       AVG(duration_ms) FILTER (WHERE kind='open_module' AND duration_ms IS NOT NULL)
         AS avg_module_ms
  FROM user_base_engagement_events
 GROUP BY user_id, base_slug;
CREATE UNIQUE INDEX idx_engagement_rollup
  ON user_base_engagement_rollup (user_id, base_slug);
```

---

## 7) Plano de implementação em fases

### Fase 1 — Fundação do BaseConfig (16h, sem dependências)

- Tipos `BaseConfig`, `BaseMicrocopy`, `BaseMascot`, `BaseFooterConfig` em `types.ts`
- `BaseRegistry` + `BaseResolver` em `lib/bases/`
- `BaseProvider` único (engloba theme/nav/copy)
- Refactor `AppChrome` (elimina `getBaseChromeForPath`)
- Estender `MEDVET_BASE` e `TECH_BASE` com novos campos
- Backend: `BaseDTO` recebe microcopy/mascot/footer + `GET /bases/{slug}`
- **Saída:** zero quebra visível, conhecimento central de bases consolidado num único knob.

### Fase 2 — Trail Drawer + Footer adaptativo (14h, depende F1)

- `TrailContext`
- `TrailSummaryDrawer` (mobile drawer direita + desktop sidebar)
- `FloatingTrailMenuButton` (FAB inferior direito)
- `BaseAwareFooter` substituindo `SiteFooter`
- `MobileFooterCompact` com bottom-sheet
- Testes Vitest dos 3 componentes
- **Saída:** burger + drawer funcionando em ambas as bases; footer responsivo por base.

### Fase 3 — User Preferences (18h, depende F1)

- Migration 000045
- `UserPreferencesProvider`, `useUserPreferences`
- `ProfilePreferencesForm` em `/perfil`
- Handlers Go `GET/PUT /api/v1/user/preferences`
- `BaseResolver` usa `homeBase` como redirect default no `/`
- Onboarding salva em backend
- **Saída:** usuário edita preferências e elas persistem.

### Fase 4 — Engagement tracking + Admin (22h, depende F3)

- Migrations 000046/000047
- `EngagementTracker` no `BaseProvider` (fire-and-forget)
- Handler Go `POST /user/engagement-events` (async insert)
- Endpoints admin
- Páginas `AdminUserEngagementPanel` e `AdminBaseHealthDashboard` com recharts
- Heurística de interesses inferidos (top 3 bases últimos 30d)
- Cron noturno de refresh do materialized view
- **Saída:** admin enxerga quem usa o quê, e quais bases têm tração.

---

## Notas estratégicas (do `COMPETITIVE_ANALYSIS_2026-05.md`)

- **Ameaça principal: NotebookLM** (Google) — gera resumo de PDFs em 30s, free, marca. Nossa vantagem **não é** gerar de PDF (commodity), é entregar **trilha estruturada + SRS real + gamificação + curadoria humana**.
- **Posicionamento de uma frase:** *"NotebookLM te dá um resumo. ChatGPT te responde. A FFV pega seu material e te devolve uma escola — em 24h, com trilha, SRS real e gamificação, gratuita."*
- **Próximas features de impacto** (pós-F4): chat RAG sobre a base do aluno; pré-trilha automática em <5min; export Anki `.apkg`; "pergunte de novo em outro ângulo" no card SRS.
