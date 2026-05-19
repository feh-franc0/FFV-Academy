# PERSONALIZATION_PLAN.md — Fase 3+4 (FFV Academy)

> Companheiro de [`ARCHITECTURE_BASES_MODULAR.md`](./ARCHITECTURE_BASES_MODULAR.md). Detalha as Fases 3 (preferências editáveis) e 4 (engagement tracking + admin) com regras concretas, migrations, endpoints e plano de PRs.

---

## 1) DADOS COLETADOS DO USUÁRIO

### Extensões em `user_preferences` (migration 000045)

| Campo | Tipo | Origem | Default |
|---|---|---|---|
| `interested_bases` | `TEXT[]` (slug do `BaseRegistry`) | onboarding | `{}` |
| `home_base` | `TEXT` nullable (slug) | onboarding | `NULL` |
| `learning_goals` | `TEXT` livre (≤280 chars) | onboarding step 3 | `''` |
| `topic_tags` | `TEXT[]` | onboarding step 4 + perfil | `{}` |
| `frequency_kind` | `TEXT` (`daily \| weekly \| specific_days`) | onboarding | `weekly` |
| `frequency_payload` | `JSONB` (`{daysPerWeek}` ou `{weekdays:[0..6]}`) | onboarding | `{"daysPerWeek":3}` |
| `preferred_materials` | `TEXT[]` (`video\|text\|quiz\|srs\|cheatsheet`) | onboarding step 5 | `{text,quiz}` |
| `visited_bases` | `TEXT[]` | inferido | `{}` |
| `last_seen_per_base` | `JSONB` (`slug → ISO`) | inferido | `{}` |

### Sinais inferidos (rollup, não em `user_preferences`)
- `modules_opened`, `modules_completed` por base
- `inferred_interest_score = 0.5*norm(opens) + 0.3*norm(completes) + 0.2*recency`
- `material_kind_preferido_inferido` (agrega bloco predominante em `complete_module`)
- `topic_tags_inferred` (top-5 tags dos módulos mais completados)

---

## 2) UX DO ONBOARDING + PERFIL EDITÁVEL

### Onboarding v3 (refactor do `OnboardingModal.tsx` — 5 telas, ≤90s)
1. *"O que te trouxe aqui?"* → multi-select `interestedBases` (cards visuais com mascote + cor).
2. *"Qual será sua casa?"* → single-select entre os escolhidos → `homeBase`. Copy: *"Vamos te levar direto pra lá."* Opção "Sem preferência" (= `NULL`).
3. *"O que você quer dominar?"* → textarea opcional + chips de tags pré-sugeridas pela base.
4. *"Com que frequência?"* → radios `Todo dia` / `X dias/semana` slider / `Dias específicos` seg-dom.
5. *"Como você aprende melhor?"* → multi-select chips (vídeo/texto/quiz/SRS/cheatsheet).

Botão "Pular" desde tela 2. Progress bar 5 passos. Telemetria: `onboarding_step_completed{step, skipped}`.

### Perfil editável (canonical: `/perfil`)
- `/preferencias` vira **301** → `/perfil#preferencias` (bookmarks antigos não quebram).
- `ProfilePreferencesForm.tsx` com 4 seções `<details>` colapsáveis:
  - Bases e foco · Metas e tags · Ritmo · Material favorito
- Cada seção tem botão "Salvar" (debounce 800ms autosave + toast).
- Banner topo: *"Quanto mais a gente te conhece, melhor a recomendação. Hoje você desbloqueou X de 4 sinais."*

---

## 3) REGRAS DE MODELAGEM — como o portal se molda

**a) Roteamento da home (`app/page.tsx`):**
- Com `homeBase`: server reading cookie/JWT faz `redirect(basePath)`, salvo `?nohome=1`.
- Sem `homeBase` mas com `interestedBases`: reordena `Explorar` (preferidos no topo).
- Header global ganha "Minha base: X" como atalho permanente.

**b) Ordenação de hubs (`rankHubs` em `lib/personalization/rank.ts`):**

```
score(hub) =
  3.0 * (hub.tags ∩ user.topicTags > 0 ? 1 : 0)
  + 2.0 * normalize(engagement.openedByHub[hub.slug])
  + 1.0 * (user.preferredMaterials includes hub.dominantKind ? 1 : 0)
  + 0.5 * recencyBoost(engagement.lastAccessByHub[hub.slug])
```
Ordem decrescente, empate alfabético (estável).

**c) `Explorar.tsx` global:** mesmo ranker. Prop `personalized?: boolean` controlada por flag `NEXT_PUBLIC_PERSONALIZED_DISCOVERY`.

**d) `RelatedArticles.tsx`:** desempata por `topicTags` (boost +0.3 se módulo tem tag em comum).

**e) `GameHUD.tsx`:** Hook novo `useStudyDayState()`. Se `frequency.kind=specific_days` e hoje não é dia: streak microcopy vira *"Streak congelado — descanso planejado"*.

**f) Notificações:** `/me/preferences` expõe `should_remind_today`. Cron de digest fora deste escopo.

**g) Onboarding inferido:** após 7 `visit_base` numa base não-declarada → toast 1x "Marcar como interesse?".

---

## 4) MÉTRICAS PRO ADMIN

### Eventos disparados pelo `EngagementTracker`
`visit_base | open_trail | open_module | complete_module | open_simulado | finish_simulado | open_review | rate_module | bookmark_toggle | search_query`

Payload: `{kind, baseSlug, trailSlug?, moduleSlug?, durationMs?, metadata?}`. Cliente faz batch (5s ou 10 eventos), localStorage queue offline. POST `/me/engagement-events` retorna 202.

### Dashboards
- **`/admin/users/[id]/engagement`**:
  - Preferências declaradas vs inferidas (chips lado-a-lado com badge "inferido")
  - Stacked area: eventos/dia 30d, coloridos por base
  - Tabela por base: `modulesOpened/Completed`, `avgTimeMin`, `lastAccess`, `inferredScore`
  - Gap: tags declaradas e nunca tocadas (texto vermelho)
- **`/admin/bases/[slug]/health`**:
  - WAU/MAU por base, retention 7d, completion rate
  - Funil: visitas → trilha → módulo → completo → simulado
  - Top 10 módulos por views; bottom 10 por completion %
  - Sankey: tags declaradas vs visitadas

### Agregações SQL
- Materialized view `user_base_engagement_rollup` (refresh noturno 03:00 UTC).
- View `base_health_30d` (não materializada).

---

## 5) MIGRATIONS + ENDPOINTS

### Migrations
- `000045_extend_user_preferences.up.sql` — colunas novas (Seção 1).
- `000046_create_user_base_engagement.up.sql` — tabela `user_base_engagement_events` + 3 índices.
- `000047_create_user_base_engagement_rollup.up.sql` — materialized view.
- `000048_extend_user_preferences_topic_tags_tracking.up.sql` — triggers PL/pgSQL que populam `visited_bases` e `last_seen_per_base` automaticamente a partir do INSERT no event log.

### Endpoints Go
```
GET  /api/v1/me/preferences          (estender DTO)
PUT  /api/v1/me/preferences          (aceitar novos campos)
POST /api/v1/me/engagement-events    NOVO  Body: {events:[...]} → 202 (async insert)
GET  /api/v1/me/recommendations      NOVO  → {hubs, modules, reason[]}
GET  /api/v1/admin/users/{id}/engagement  NOVO  admin only
GET  /api/v1/admin/bases/{slug}/health    NOVO  admin only
GET  /api/v1/admin/bases/{slug}/engagement NOVO  top users + modules
```

### Camadas Go novas
- `internal/domain/preferences/` — VOs `Frequency`, `MaterialKind`, métodos `WithHomeBase`, `WithFrequency`.
- `internal/domain/engagement/` (NOVO bounded context) — `Event` aggregate, ports `EventRepository`, `RollupRepository`.
- `internal/application/{preferences,engagement}/`.
- `internal/infrastructure/persistence/postgres/engagement_repo.go` — `BulkInsert` com `pgx.CopyFrom`.
- `internal/interfaces/http/handlers/{engagement_handler,admin_engagement_handler}.go`.

---

## 6) PLANO DE EXECUÇÃO — 8 PRs (~44h)

| # | PR | Entrega | Dep | Horas |
|---|---|---|---|---|
| 1 | **migrations-preferences-engagement** | SQL 000045-000048 + integration tests. | — | 4h |
| 2 | **backend-preferences-extended** | VOs Frequency/MaterialKind, repo, handler GET/PUT atualizado. Retrocompat. | 1 | 6h |
| 3 | **frontend-preferences-provider** | `UserPreferencesProvider` + `useUserPreferences` (SWR), tipos em `types.ts`. Sem UI nova. | 2 | 5h |
| 4 | **frontend-onboarding-v3-profile** | 5 telas, `/perfil` canonical, redirect `/preferencias`. Tests Vitest. | 3 | 6h |
| 5 | **frontend-personalization-rules** | `rank.ts` puro + integração em `KnowledgeBaseHome`, `Explorar`, `RelatedArticles`, `app/page.tsx`, `useStudyDayState`. | 3 | 6h |
| 6 | **backend-engagement-ingest** | Bounded context `engagement`, POST `/me/engagement-events` async batch worker pool. | 1 | 6h |
| 7 | **frontend-engagement-tracker** | `EngagementTracker` client + queue localStorage + instrumentação em `BaseModule`, `SimuladoRunner`, `BaseProvider`. | 6 | 5h |
| 8 | **admin-dashboards-engagement** | Endpoints admin + páginas `/admin/users/[id]/engagement`, `/admin/bases/[slug]/health`, cron noturno do rollup. | 6 | 6h |

PRs 3-5 paralelizáveis com 6 após 3 merged. 7-8 fecham o ciclo.
