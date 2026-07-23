# Plano de migração: currículo DB-driven (Base → Hub → Trilha → Módulo → Questão)

> **Objetivo:** mover toda a estrutura de currículo do `frontend/src/lib/curriculum.ts` (hardcoded 5800+ linhas) e do `backend/internal/infrastructure/catalog/catalog.json` (embedded) para o banco PostgreSQL, com encadeamento por FK e refletir no front via snapshot.
>
> **Princípios:**
> 1. **Zero downtime** — sistema está LIVE em produção.
> 2. **Toda migration idempotente e reversível** — `IF NOT EXISTS`, `ON CONFLICT DO UPDATE`, `down.sql` testado.
> 3. **Cada fase entrega valor independente** — não precisa esperar o todo para usar parte.
> 4. **Fallback de 60 dias** — `curriculum.ts` permanece como rede de segurança até soak completo.
> 5. **Testes travam regressão** — CI roda a cada commit, 1180+ testes precisam continuar verdes.

---

## Estrutura final (estado-alvo, pós-execução)

### Tabelas (schema completo)

```
bases (slug PK)
  ├── hubs (id PK, base_slug FK NOT NULL)
  │     └── trails (id PK, hub_id FK NOT NULL)
  │           └── curriculum_articles  (slug PK, trail_id FK NOT NULL, hub_id FK NOT NULL)
  │                 ├── module_blocks (article_slug FK CASCADE)
  │                 ├── module_quizzes (module_slug FK CASCADE)
  │                 ├── module_prerequisites (M:N self)
  │                 ├── module_next_suggested (M:N self ordenado)
  │                 └── module_quiz_attempts (user_id, quiz_id, SM-2 state)
  └── simulados (id PK, base_slug FK NOT NULL)
        └── questions (id PK, simulado_id FK NOT NULL,
                       related_module_slug FK NULLABLE)

base_stats (MATERIALIZED VIEW, refresh 5min via cron)
```

### Endpoints REST (estado-alvo)

| Método | Path | Cache | Notas |
|--------|------|-------|-------|
| GET | `/api/v1/bases` | 60s | + `?include=stats` JOIN base_stats |
| GET | `/api/v1/bases/{slug}` | 300s | Metadata pura |
| GET | `/api/v1/bases/{slug}/page` | 300s | View-model home (existente) |
| GET | `/api/v1/bases/{slug}/hubs` | 60s | Hubs da base + counters |
| GET | `/api/v1/hubs/{id}` | 60s | Hub + trails preload |
| GET | `/api/v1/trails/{id}` | 60s | Trail + módulos (sem content_md) |
| GET | `/api/v1/curriculum/{slug}` | 60s | Módulo metadata |
| GET | `/api/v1/curriculum/{slug}/blocks` | 60s | Módulo + blocks (existente) |
| GET | `/api/v1/modules/{slug}/quizzes` | 0 | Quizzes SRS (auth-aware) |
| GET | `/api/v1/simulados` | 300s | Lista (refactor: DB-driven) |
| GET | `/api/v1/simulados/{id}` | 300s | Detalhe |
| GET | `/api/v1/simulados/{id}/questions` | 300s | Questões (sem `correct_id` para user) |
| GET | `/api/v1/curriculum/snapshot` | 60s + ETag | **Crítico**: árvore inteira em 1 query |

### Frontend (estado-alvo)

- `src/lib/curriculum.generated.ts` — gerado no build via `npm run fetch-curriculum`
- `src/lib/curriculum.ts` — fallback estático, gerado uma única vez no commit final da Fase 3
- Imports trocados: `from './curriculum'` → `from './curriculum.generated'` em 60+ arquivos
- Componentes não mudam — API idêntica, só fonte muda

### Admin CMS (estado-alvo)

- `POST /api/v1/admin/hubs`
- `POST /api/v1/admin/trails`
- `POST /api/v1/admin/modules` (já existe parcial)
- `POST /api/v1/admin/simulados`
- `POST /api/v1/admin/questions` (já existe)
- UI `/admin/curriculum/*` com forms — pattern do `admin_questions.go`

---

## Cronograma — 5 fases (~6 semanas calendário, ~25 dias de trabalho)

### Fase 0 — Preparação (1 dia)

**Objetivo:** ambiente pronto, decisões finais, backup.

**Deliverables:**
- [ ] Backup do Postgres prod (`pg_dump`)
- [ ] Branch `feat/db-driven-curriculum` criada
- [ ] `docs/MIGRATION_PLAN_DB_DRIVEN_CURRICULUM.md` (este arquivo) merged em main
- [ ] Mapeamento canônico Hub → Base aprovado (seção abaixo)

**Critério de aceite:** backup restaurável testado em local.

---

### Fase 1 — Fechar relacionamentos no DB (3-5 dias)

**Objetivo:** criar 9 migrations que estabelecem o encadeamento Base → Hub → Trilha → Módulo → Questão, **sem mexer no front ainda**.

**Migrations (cada uma com `.up.sql` + `.down.sql` testada):**

| # | Arquivo | O que faz |
|---|---------|-----------|
| **000055** | `add_base_slug_to_hubs.up.sql` | `ALTER TABLE hubs ADD COLUMN base_slug TEXT NOT NULL DEFAULT 'tecnologia' REFERENCES bases(slug) ON DELETE RESTRICT DEFERRABLE INITIALLY DEFERRED`. Backfill com mapeamento canônico (`hub-carreira` → `carreira`, etc.). Adiciona UNIQUE (base_slug, slug). |
| **000056** | `extend_trails_metadata.up.sql` | Adiciona `slug, tagline, color, href, status, level, position` em `trails`. UNIQUE (hub_id, slug). |
| **000057** | `extend_modules_metadata.up.sql` | Adiciona `keywords, seo_description, external_url, icon, level, position` em `curriculum_articles`. Cria `module_prerequisites` e `module_next_suggested`. |
| **000058** | `create_simulados.up.sql` | Cria tabela `simulados` com `base_slug FK`. |
| **000059** | `seed_simulados.up.sql` | INSERT 4 simulados (aws-clf, aws-aif, aws-dva, anthropic-ai) extraídos de `catalog.json`. |
| **000060** | `add_simulado_fk_to_questions.up.sql` | `ALTER TABLE questions ADD CONSTRAINT fk_questions_simulado FOREIGN KEY (simulado_id) REFERENCES simulados(id) DEFERRABLE`. Adiciona `related_module_slug` FK NULLABLE. |
| **000061** | `create_module_quizzes.up.sql` | Cria `module_quizzes`. Data migration: SELECT blocks WHERE block_type='quiz' → INSERT em `module_quizzes` → DELETE blocks. Remove 'quiz' do CHECK do `module_blocks.block_type`. |
| **000062** | `create_module_quiz_attempts.up.sql` | Cria `module_quiz_attempts(user_id, quiz_id, ease_factor, interval_days, last_seen_at, ...)` para SRS isolado de `simulado_attempts`. |
| **000063** | `create_base_stats_view.up.sql` | `CREATE MATERIALIZED VIEW base_stats`. Cria pg_cron job ou agendamento Go pra `REFRESH MATERIALIZED VIEW CONCURRENTLY` a cada 5min. |

**Aplica em local + dev primeiro:**
```bash
cd backend
make migrate-reset  # local
# rodar suite completa: go test ./... && make test-integration
```

**Critério de aceite:**
- Todas as 9 migrations aplicam limpo em DB vazio.
- Todas as 9 `down.sql` revertem sem erro.
- `go test ./...` passa (incluindo `test/integration`).
- `bases_handler_test.go` continua verde (não mudou nada no handler ainda).

---

### Fase 2 — Importer: `curriculum.ts` → DB (3-4 dias)

**Objetivo:** popular as tabelas DB com o conteúdo que vive hoje no `curriculum.ts`. Backend agora tem cópia fiel; front ainda não usa.

**Deliverables:**
- [ ] `backend/cmd/import-curriculum/main.go` — programa CLI
- [ ] `frontend/scripts/dump-curriculum.mjs` — gera `curriculum.snapshot.json` a partir do `.ts`
- [ ] Pipeline: `npm run dump-curriculum` → `curriculum.snapshot.json` → `go run ./cmd/import-curriculum` lê JSON e UPSERT em hubs/trails/modules

**Estratégia recomendada:** usar Node pra dumpar (`node --input-type=module -e 'import { HUBS, CURRICULUM } from ...; console.log(JSON.stringify({HUBS, CURRICULUM}))'`) — evita parsear TS no Go.

**Importer:**
1. Lê `curriculum.snapshot.json`
2. Para cada hub em `HUBS[]`:
   - Mapeia `hub.slug` → `base_slug` via lookup canônico (Carreira → carreira, IA → tecnologia, etc.)
   - `UPSERT INTO hubs (id, base_slug, slug, name, ...) VALUES (...) ON CONFLICT (id) DO UPDATE`
3. Para cada trilha em `CURRICULUM[]`:
   - Acha `hub_id` via lookup reverso (HUBS[*].trailIds)
   - `UPSERT INTO trails`
4. Para cada módulo:
   - `UPSERT INTO curriculum_articles` (atualiza metadata: title, desc, icon, xp, read_time, level, keywords, seo_description, status='published')
5. Para cada módulo com `prerequisites` ou `nextSuggested`:
   - `INSERT INTO module_prerequisites` / `module_next_suggested` (idempotente via PK composto)

**Critério de aceite:**
- `SELECT COUNT(*) FROM hubs` = 15 (todos os hubs do `curriculum.ts`)
- `SELECT COUNT(*) FROM trails` = ~66
- `SELECT COUNT(*) FROM curriculum_articles WHERE status='published'` ≥ 900
- Reimportar não muda counts nem duplica (idempotência).
- `bases_handler.go` continua respondendo igual (não mudou nada no front).

---

### Fase 3 — Snapshot endpoint + front consome do DB (4-5 dias)

**Objetivo:** o frontend para de ler `curriculum.ts` e começa a ler do banco via snapshot.

**Backend deliverables:**
- [ ] `GET /api/v1/curriculum/snapshot` — handler com 1 query JSONB aggregation retornando árvore inteira
- [ ] Cache em Redis (5min TTL) + invalidação via pub/sub quando admin escreve
- [ ] ETag para o navegador

**Frontend deliverables:**
- [ ] `scripts/fetch-curriculum.mjs` — fetch do endpoint snapshot, transforma em TS export, escreve `src/lib/curriculum.generated.ts`
- [ ] `package.json` ganha `prebuild` script que roda `fetch-curriculum` antes de `next build`
- [ ] `src/lib/curriculum.generated.ts` mesma API que `curriculum.ts` (mesmos types: `HUBS`, `CURRICULUM`, `getHubBySlug`, `getHubTrails`, ...)
- [ ] Trocar imports em todos os 60+ arquivos: `from './curriculum'` → `from './curriculum.generated'`
- [ ] Fallback: se fetch falhar, copia `curriculum.ts` cachado (warn no CI mas não falha build)
- [ ] `curriculum.ts` continua existindo como fallback — não é deletado nessa fase

**Critério de aceite:**
- `npm run build` funciona em rede ON (fetch real) e em rede OFF (fallback `.ts`)
- Página `/aprenda/comunicacao-feedback` renderiza igual antes
- `/explorar` mostra os mesmos 15 hubs
- Lighthouse score igual ou melhor
- Testes 1180+ passam
- 7-day soak em prod antes de Fase 4 (zero incidente de currículo)

---

### Fase 4 — Admin CMS write-through (4-5 dias)

**Objetivo:** admin pode criar/editar hubs, trails, módulos, simulados, questões pela UI — escreve no DB, dispara revalidation, front reflete.

**Backend deliverables:**
- [ ] `POST/PATCH/DELETE /api/v1/admin/hubs/{id}` — CRUD
- [ ] `POST/PATCH/DELETE /api/v1/admin/trails/{id}` — CRUD
- [ ] `POST/PATCH/DELETE /api/v1/admin/modules/{slug}` — já parcial em `admin_curriculum.go`, expandir
- [ ] `POST/PATCH/DELETE /api/v1/admin/simulados/{id}` — CRUD
- [ ] `POST/PATCH/DELETE /api/v1/admin/questions/{id}` — já existe
- [ ] Cada write dispara `POST /api/revalidate?path=/...` no Next via webhook
- [ ] Refresh `base_stats` view após write em hub/trail/module

**Frontend deliverables:**
- [ ] `/admin/curriculum/hubs` — listagem + form CRUD
- [ ] `/admin/curriculum/trails` — idem
- [ ] `/admin/curriculum/modules` — já existe parcial em `/admin/curriculum/edit`, expandir
- [ ] `/admin/curriculum/simulados` — idem
- [ ] Pattern dos componentes existentes (`admin_questions`) reaproveitado

**Critério de aceite:**
- Admin cria um hub `produto-management` → aparece em `/explorar` em <1 min (revalidation)
- Admin edita desc de um módulo → reflete em `/aprenda/<slug>` em <1 min
- Permissões: só user com `role='admin'` consegue acessar `/admin/*`
- Audit log registra todas as mudanças (já tem infra)

---

### Fase 5 — Sunset gradual (30-45 dias soak)

**Objetivo:** remover `catalog.json` e `curriculum.ts` da árvore depois de soak completo.

**Triggers (esperar ambos):**
- 30 dias desde a Fase 3 em prod sem incidente de currículo
- Todos os simulados estão em `simulados` + `questions` (já estão na tabela `questions`, falta migrar a definição do `catalog.json` pra `simulados` — feito na Fase 1)

**Deliverables:**
- [ ] Migration **000064** `drop_bases_counter_columns.up.sql` — `ALTER TABLE bases DROP COLUMN modules, trails, hubs` (substituídos por base_stats view)
- [ ] Remover `frontend/src/lib/curriculum.ts` (substituído por `.generated.ts`)
- [ ] Remover `backend/internal/infrastructure/catalog/catalog.json`
- [ ] Remover `//go:embed catalog.json` em `provider.go`
- [ ] Remover fallback hardcoded em `bases_handler.go` (`buildHardcodedBases()`)
- [ ] Atualizar `CLAUDE.md` documentando que tudo é DB-driven

**Critério de aceite:**
- `git grep curriculum.ts` zerado (exceto `.generated.ts`)
- `git grep catalog.json` zerado
- Sistema funciona idêntico em prod
- Deploy de novo conteúdo via admin UI funciona end-to-end

---

## Mapeamento canônico Hub → Base (LOCK-IN, não muda)

| Hub (slug em curriculum.ts) | Base (slug em bases) |
|-----------------------------|----------------------|
| ia | tecnologia |
| aws | tecnologia |
| engenharia | tecnologia |
| claude-anthropic | tecnologia |
| fundamentos | tecnologia |
| programacao | tecnologia |
| dados | tecnologia |
| construcao | tecnologia |
| seguranca-hardware-hacking | tecnologia |
| carreira | carreira |
| comunicacao | comunicacao |
| marketing | marketing |
| conteudo | conteudo |
| empreendedorismo | empreendedorismo |
| ingles | ingles |

**Medvet:** os módulos de Medicina Veterinária vivem em `lib/bases/medvet/` separados, não em `curriculum.ts`. Importer **não toca** neles na Fase 2. Migração de medvet pra mesma arquitetura é Fase 6+ (fora desse plano).

---

## Riscos e mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Migration 064 quebra prod ao dropar counters | Média | Alto | Esperar 30 dias soak. Backup pré-migration. Down.sql testado. |
| Importer parsear TS é frágil | Alta | Médio | Usar dump via Node (`node -e`) → JSON, importer Go lê JSON simples. |
| Snapshot endpoint lento (>500ms) | Baixa | Médio | JSON aggregation no Postgres é rápida. Cache Redis 5min mitiga. |
| Frontend SSG quebra se fetch falhar no build | Alta | Alto | Fallback `.ts` cachado por 60 dias. Warn no CI, não erro. |
| Admin UI introduz bug de write inválido | Média | Médio | Validação Zod no frontend + CHECK constraints no DB + audit log. |
| Falta de áudio para módulos novos de Inglês (Trilha Pronúncia) | Alta | Baixo | Fora do escopo desse plano — separar. |

---

## Decisões já travadas (não revisar)

1. ✅ **Questão de simulado ≠ quiz de fixação** — duas tabelas (`questions` e `module_quizzes`)
2. ✅ **hub_id mantém TEXT** (não vira UUID) — URLs legíveis
3. ✅ **slug é imutável** — primary key e usado em FKs em 8+ tabelas
4. ✅ **Materialized view para stats** — counters denormalizados são proibidos
5. ✅ **curriculum.ts mantido como fallback 60 dias** — não deletar antes do soak
6. ✅ **Conteúdo do módulo: Markdown E Blocks coexistem** — sunset Markdown gradual (fora deste plano)

---

## Como verificar progresso (dashboard mental)

```
[ ] Fase 0 — Preparação              ████████████████ 0/4 deliverables
[ ] Fase 1 — Relacionamentos no DB   ████████████████ 0/9 migrations
[ ] Fase 2 — Importer                ████████████████ 0/3 deliverables
[ ] Fase 3 — Snapshot + front        ████████████████ 0/7 deliverables
[ ] Fase 4 — Admin CMS               ████████████████ 0/9 deliverables
[ ] Fase 5 — Sunset                  ████████████████ 0/7 deliverables
```

---

## Custo estimado (calendário)

| Fase | Trabalho efetivo | Calendário (com soaks/buffers) |
|------|------------------|-------------------------------|
| 0 | 1 dia | 1 dia |
| 1 | 3-5 dias | 1 semana |
| 2 | 3-4 dias | 1 semana |
| 3 | 4-5 dias | 1 semana + 7 dias soak |
| 4 | 4-5 dias | 1 semana |
| 5 | 1-2 dias | 30-45 dias soak |
| **Total** | **~22 dias** | **~9-11 semanas** |

Comprimível pra **3-4 semanas calendário** se pular soaks (não recomendado em prod).

---

## Próximo passo

Ver `docs/SONNET_EXECUTION_PROMPT.md` — prompt mestre self-contained que delega a execução para o Sonnet 4.6 autonomamente.
