# Platform Technical Audit — FFV Academy (2026-05-19)

Companheiro de [`UX_HEURISTIC_EVAL_2026-05.md`](./UX_HEURISTIC_EVAL_2026-05.md) e [`MARKET_REFRESH_2026-05.md`](./MARKET_REFRESH_2026-05.md). Síntese final em [`VALIDATION_REPORT_2026-05.md`](./VALIDATION_REPORT_2026-05.md).

20 issues técnicos catalogados por severity. **Sem recomendações — só relatório.** A síntese final escolhe prioridades.

---

## BLOCKERS

### 1. Hardcoded base references quebram a promessa modular
**Pattern: 3 paths afetados.**
- `frontend/src/app/meu-aprendizado/LearningMirrorClient.tsx:442` — `href="/tecnologia"` no EmptyState
- `frontend/src/components/LandingClient.tsx:810` — `href="/tecnologia"` no hub showcase
- `frontend/src/components/base/SimuladoRunner.tsx:163` — `href="/medicina-veterinaria"` hardcoded

**Impact:** Aluno medvet vendo Espelho vazio é empurrado pra Tecnologia. Qualquer base nova quebra esses CTAs.

### 2. Componentes >800 linhas bloqueiam manutenção
- `LandingClient.tsx` 1138 linhas — Hero + Battle + Pilares + Steps + Prova + FAQ + Form num único arquivo
- `article/primitives.tsx` 1139 — 13 primitivos misturados
- `ModuleLayout.tsx` 808 — quiz + metadata + toc + sidebar + nav
- `ProgressoClient.tsx` 828 — 5+ visualizações independentes
- `base/BaseModule.tsx` 1020 — trail context + sidebar + quiz lifecycle + nav

**Impact:** >40% dos refactors tocam esses arquivos. Testes ficam impossíveis. Onboarding de dev novo = friccão alta.

---

## HIGH

### 3. LearningMirrorClient EmptyState assume só tech
Mesmo path do item 1 (linha 442) — mas separado porque o problema arquitetural é: estado vazio precisa CTAs de TODAS as bases ativas.

### 4. BaseModule sem error handling pra base config inexistente
`BaseModule.tsx` assume `basePath` válido. Se slug antigo bate em base deletada, user vê página em branco em vez de 404.

### 5. ProfilePreferencesForm não valida sync com registry
`ProfilePreferencesForm.tsx:33` — `listBases()` é estático. User pode toggle base que está sendo migrada/removida.

### 6. TODOs visíveis pro usuário em produção
- `RankingClient.tsx` — string literal `'TODO O HISTÓRICO DA PLATAFORMA'` aparece no DOM
- `CommunityCard.tsx` — `TODO: substituir quando criar`
- `simulado/PaywallCard.tsx` — Stripe não conectado
- `simulado/TutorAsk.tsx` — `POST /api/v1/tutor/ask` esperado mas não consumido

---

## MEDIUM

### 7. Empty states sem CTAs multi-base
- `/meu-aprendizado` EmptyState só Tecnologia
- `/stats-publicas` valores hardcoded sem fallback de "atualizando…"
- `/perfil` sem empty state pra new user

### 8. Mobile UI fragility (sem testes de regressão)
- `BaseModule.tsx:83-91` — sidebar hidden mobile + FAB depende de JS
- `stats-publicas/page.tsx` — grid `sm:grid-cols-2 lg:grid-cols-3` sem breakpoint pra <375px
- `ProfilePreferencesForm.tsx` — 4 sections podem overflow iPhone SE

### 9. localStorage sem schema validation no read (ProfilePreferences)
`hooks/useUserPreferences.ts` — `loadPreferences()` tem zod, mas SimuladoRunner state e outras leituras de localStorage não.

### 10. SimuladoRunner race condition multi-tab
`SimuladoRunner.tsx:89-97` — 2 abas com mesmo simulado podem sobrescrever respostas. Last-write-wins sem timestamp.

### 11. `/stats-publicas` hardcoded sem endpoint backend
- `PublicStatsClient.tsx:20-65` — KPIs estáticos
- Comentário diz "V2 plugará em `GET /api/v1/public/stats`" mas endpoint não existe ainda
- Drift: backend tem `/api/v1/stats` (sem `/public` prefix)

### 16. Endpoint drift — `/api/v1/public/stats` vs `/api/v1/stats`
- Frontend referencia `/public/stats` no comentário
- Backend tem `/stats` (sem `/public`)
- Vai falhar em runtime quando ligar

### 17. Tutor endpoint incompleto
- Frontend tem `TODO: POST /api/v1/tutor/ask` em `TutorAsk.tsx`
- Backend CLAUDE.md menciona o endpoint mas implementação parcial
- Spec mismatch potencial: frontend espera SSE streaming, backend pode ter rate-limit estruturado

### 18. `/api/v1/leaderboard/public` no backend não consumido pelo front
Endpoint novo de mai/2026, frontend ainda usa o privado em Explorar/HomeRanking. Dead code backend até integrar.

---

## LOW

### 12. Potencial XSS em `dangerouslySetInnerHTML` (Shiki output)
`article/primitives.tsx:96` — confia que backend manda HTML seguro. Sem safelist de tags.

### 13. `console.log` em código de produção
- `curriculum-api.ts` — log de URL não-gated
- `article/BlockRenderer.tsx` — `console.warn()` sem gate

### 14. Componentes UI não usados
- `ui/ffv-button.tsx` exported, grep zero imports
- `ui/status-badge.tsx` similar
- Bundle weight desnecessário

### 15. Loading states ausentes
- `/stats-publicas` sem loading UI (vai precisar quando endpoint vier)
- `ProfilePreferencesForm` mostra "Carregando…" só até hydrated, depois renderiza stale

### 19. localStorage reads sem try/catch
`SearchClient.tsx:72-74` — `sessionStorage.getItem('ffv:lastSearchTrack')` sem guarda.

### 20. Slugs sem sanitização em ModuleRating
`ModuleRating.tsx` — `saveModuleRating(slug, rating)` sem checar se slug é URL-safe.

---

## Resumo executivo

- **20 issues** em 4 categorias
- **Top friction**: 5 componentes >500 linhas bloqueiam velocidade
- **Top risco arquitetural**: hardcodes de base quebram a promessa modular
- **Top débito visível**: TODOs em prod, drift backend/frontend, /stats hardcoded
- **Mobile QA pass urgente**: 3 fragilidades sem testes visuais

Síntese de ações em `VALIDATION_REPORT_2026-05.md`.
