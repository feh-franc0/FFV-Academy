# Arquitetura de DB: Base → Hub → Trilha → Módulo → Questão

> Análise dirigida pelo PO: "Quero analisar qual seria a melhor estrutura de banco de dados para sempre termos `Base → Hub → Trilha → Módulo → Questões`. Esse é o core da aplicação. Quero essa estrutura refletida no front com uma arquitetura completa e perfeita."
>
> Status do sistema: **LIVE em produção**. Toda mudança precisa ser **idempotente, reversível e faseada**.

---

## TL;DR

O DB tem **5 das 6 peças**, mas elas não se conectam:
- ❌ Falta FK `hubs.base_slug` — hub não sabe a qual base pertence
- ❌ Não existe tabela `simulados` — vive como JSON embedded (`catalog.json`)
- ❌ Falta FK `questions.simulado_id` (hoje é string solta)
- ❌ Quizzes de fixação de módulo estão misturados como `block_type='quiz'` em vez de tabela própria

**Plano em 5 fases (~6 semanas):**
1. Fechar relacionamentos (1-2 sem) — migrations 055-061
2. Importer Go: `curriculum.ts` → DB (1 sem)
3. Snapshot endpoint para o front (1 sem) — Next consome do DB no build
4. CMS admin escreve no DB (1 sem)
5. Sunset gradual de `catalog.json` e `curriculum.ts` (30 dias soak)

**Decisão crítica:** questão de simulado e quiz de fixação são entidades distintas — não tente unificar.

---

## 1. Diagnóstico do estado atual

### As 4 disfunções estruturais

| # | Problema | Onde se manifesta | Impacto |
|---|----------|-------------------|---------|
| 1 | **Base não conecta com Hub** | `hubs` table sem `base_slug` FK | O relacionamento Base→Hub→Trilha→Módulo é INTENÇÃO, não REALIDADE no schema |
| 2 | **`curriculum.ts` vs `curriculum_articles`** | Front ignora DB (157 artigos) e lê do `.ts` | Divergência silenciosa. CMS admin não tem efeito visível |
| 3 | **Simulado é JSON+tabela** | `catalog.json` + `questions` table | Mudar passing score = redeploy. Mudar questão = migration SQL |
| 4 | **Questão sem ligação com Módulo** | `questions.related_module_slug` não existe | Não dá pra dizer "estuda o módulo X que explica essa questão errada" |

### Tabelas hoje (mapeamento por migration)

| Camada | Tabela | Migration | Forma | Problema |
|--------|--------|-----------|-------|----------|
| **Bases** | `bases` | 000048 | slug PK, JSONB para tudo, counters integer estáticos | Counters drift; sem FK para hubs/trails reais |
| **Hubs** | `hubs` | 000026 | id TEXT PK, sem FK para base | Hub não sabe sua base |
| **Trails** | `trails` | 000027 | hub_id FK ON DELETE CASCADE ✓ | OK estruturalmente |
| **Modules** | `curriculum_articles` | 000023 + 000028 | hub_id/trail_id FK DEFERRABLE ✓ + content_md + module_blocks | OK estruturalmente |
| **Module blocks** | `module_blocks` | 000029 | Árvore JSONB recursiva | OK |
| **Questions** | `questions` | 000040 | simulado_id TEXT mas SEM FK | String solta, sem integridade |
| **Simulados** | `catalog.json` (embedded) | — | JSON com //go:embed | Não está no DB |

---

## 2. Schema proposto

### 2.1 — `bases` (refactor: remover counters)

```sql
ALTER TABLE bases
    DROP COLUMN modules,
    DROP COLUMN trails,
    DROP COLUMN hubs;

CREATE MATERIALIZED VIEW base_stats AS
SELECT
    b.slug AS base_slug,
    COUNT(DISTINCT h.id) AS hubs_count,
    COUNT(DISTINCT t.id) AS trails_count,
    COUNT(DISTINCT ca.id) FILTER (WHERE ca.status='published') AS modules_count
FROM bases b
LEFT JOIN hubs h           ON h.base_slug = b.slug
LEFT JOIN trails t         ON t.hub_id    = h.id
LEFT JOIN curriculum_articles ca ON ca.trail_id = t.id
GROUP BY b.slug;
CREATE UNIQUE INDEX ON base_stats(base_slug);
-- REFRESH MATERIALIZED VIEW CONCURRENTLY base_stats; -- cron 5min
```

### 2.2 — `hubs` (adicionar FK para base)

```sql
ALTER TABLE hubs
    ADD COLUMN base_slug TEXT NOT NULL DEFAULT 'tecnologia'
        REFERENCES bases(slug) ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED,
    ADD COLUMN tagline    TEXT NOT NULL DEFAULT '',
    ADD COLUMN slug       TEXT;

UPDATE hubs SET slug = id WHERE slug IS NULL;
ALTER TABLE hubs
    ALTER COLUMN slug SET NOT NULL,
    ADD CONSTRAINT hubs_slug_per_base_unique UNIQUE (base_slug, slug);

CREATE INDEX idx_hubs_base_position ON hubs(base_slug, position);
```

### 2.3 — `trails` (campos faltantes)

```sql
ALTER TABLE trails
    ADD COLUMN slug      TEXT,
    ADD COLUMN tagline   TEXT NOT NULL DEFAULT '',
    ADD COLUMN color     TEXT NOT NULL DEFAULT '',
    ADD COLUMN href      TEXT,
    ADD COLUMN status    TEXT NOT NULL DEFAULT 'published',
    ADD CONSTRAINT trails_status_valid CHECK (status IN ('draft','published','archived'));

UPDATE trails SET slug = id WHERE slug IS NULL;
ALTER TABLE trails
    ALTER COLUMN slug SET NOT NULL,
    ADD CONSTRAINT trails_slug_per_hub_unique UNIQUE (hub_id, slug);
```

### 2.4 — `curriculum_articles` (adicionar metadata + relações)

```sql
ALTER TABLE curriculum_articles
    ADD COLUMN keywords        TEXT NOT NULL DEFAULT '',
    ADD COLUMN seo_description TEXT NOT NULL DEFAULT '',
    ADD COLUMN external_url    TEXT,
    ADD COLUMN icon            TEXT NOT NULL DEFAULT '',
    ADD COLUMN level           TEXT;

CREATE TABLE module_prerequisites (
    module_slug         TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    prerequisite_slug   TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    PRIMARY KEY (module_slug, prerequisite_slug),
    CONSTRAINT no_self_prereq CHECK (module_slug <> prerequisite_slug)
);

CREATE TABLE module_next_suggested (
    module_slug TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    next_slug   TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    position    INT  NOT NULL DEFAULT 0,
    PRIMARY KEY (module_slug, next_slug)
);
CREATE INDEX idx_module_next_suggested_order ON module_next_suggested(module_slug, position);
```

> Mantém o nome físico `curriculum_articles`. Refactor de rename custaria atualizar 8+ repos.

### 2.5 — `simulados` (criar — extrair de catalog.json)

```sql
CREATE TABLE simulados (
    id              TEXT PRIMARY KEY,
    base_slug       TEXT NOT NULL REFERENCES bases(slug) ON DELETE RESTRICT,
    certification   TEXT NOT NULL,
    title           TEXT NOT NULL,
    description     TEXT NOT NULL DEFAULT '',
    price_cents     INT  NOT NULL DEFAULT 0,
    question_count  INT  NOT NULL,
    time_limit_min  INT  NOT NULL,
    passing_score   INT  NOT NULL,
    topics          JSONB NOT NULL DEFAULT '[]',
    status          TEXT NOT NULL DEFAULT 'active',
    position        INT  NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT simulados_status_valid CHECK (status IN ('active','coming_soon','archived')),
    CONSTRAINT simulados_passing_score_valid CHECK (passing_score BETWEEN 0 AND 100)
);
CREATE INDEX idx_simulados_base ON simulados(base_slug, position);
```

### 2.6 — `questions` (promover FK + ligação opcional com módulo)

```sql
ALTER TABLE questions
    ADD CONSTRAINT fk_questions_simulado
        FOREIGN KEY (simulado_id) REFERENCES simulados(id)
        ON DELETE RESTRICT
        DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE questions
    ADD COLUMN related_module_slug TEXT
        REFERENCES curriculum_articles(slug)
        ON DELETE SET NULL;
CREATE INDEX idx_questions_related_module
    ON questions(related_module_slug)
    WHERE related_module_slug IS NOT NULL;
```

### 2.7 — `module_quizzes` (NOVA — questões DE módulo, separadas de simulado)

```sql
CREATE TABLE module_quizzes (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_slug     TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
    position        INT  NOT NULL DEFAULT 0,
    stem            TEXT NOT NULL,
    options         JSONB NOT NULL,
    correct_id      TEXT NOT NULL,
    explanation     TEXT NOT NULL DEFAULT '',
    difficulty      TEXT NOT NULL DEFAULT 'medium',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT module_quizzes_correct_valid CHECK (correct_id IN ('A','B','C','D','E')),
    CONSTRAINT module_quizzes_difficulty_valid CHECK (difficulty IN ('easy','medium','hard'))
);
CREATE INDEX idx_module_quizzes_module ON module_quizzes(module_slug, position);
```

### 2.8 — Hierarquia visual final

```
bases (slug PK)
  ├── hubs (id PK, base_slug FK)
  │     ├── trails (id PK, hub_id FK)
  │     │     ├── curriculum_articles (slug UNIQUE, trail_id FK, hub_id FK)
  │     │     │     ├── module_blocks (article_slug FK)
  │     │     │     ├── module_quizzes (module_slug FK)    ← Q&A SRS por módulo
  │     │     │     ├── module_prerequisites (M:N self)
  │     │     │     └── module_next_suggested (M:N self ordenado)
  └── simulados (id PK, base_slug FK)
        └── questions (id PK, simulado_id FK, related_module_slug FK opcional)
```

---

## 3. Decisões críticas

### 3.1 — Questão pertence ao Módulo ou ao Simulado? **→ AOS DOIS (entidades separadas)**

| Opção | Pros | Contras |
|-------|------|---------|
| A. Questão filha do módulo (1:N) | SRS natural | Simulado mistura múltiplos módulos |
| B. Standalone + junção M:N | Reutilizável | Complexo demais p/ caso real |
| **C. Duas tabelas distintas** ✅ | Domínios separados, semântica clara | Schema duplicado (stem/options/correct_id) |

**Por que C:** Questões de simulado são *certification-grade* (CLF-C02, AIF-C01: blueprint domain, scenario_type, source). Questões de módulo são *fixação leve para SRS pós-leitura*. Misturar gera campos opcionais inúteis em metade dos registros.

**Ponte opcional:** `questions.related_module_slug` permite "estuda o módulo X que explica essa questão errada".

### 3.2 — Bases têm counters? **→ NÃO, materialized view**

Toda vez que admin cria/deleta módulo, alguém esquece de decrementar. **Use `base_stats` materializada** com refresh cron 5min. Frontend lê transparente via JOIN.

### 3.3 — `hub_id` é text slug ou UUID? **→ MANTER TEXT**

Já decidido em `migrations/000026:6`: legível em URLs e versionável em git. URLs do tipo `/aprenda?hub=ia` são limpos. Não mudar.

### 3.4 — Conteúdo do módulo: Markdown OU Blocks? **→ MANTER OS DOIS, deprecar Markdown gradualmente**

Hoje `curriculum_articles.content_md` (legado) e `module_blocks` (novo CMS) coexistem. Frontend lê o que existir. Novos módulos só usam blocks; sunset Markdown em 6 meses.

### 3.5 — `curriculum.ts` no front: deletar ou manter? **→ MANTER 60 dias como fallback de build-time**

`.ts` permite SSG sem depender do backend up. Estratégia: backend expõe `/api/v1/curriculum/snapshot.json` que é dumpado no build do Next. Se backend cair durante build, fallback no `.ts` cachado.

---

## 4. Migration plan faseado

### Fase 0 — Preparação (1 dia)
- Criar migrations 055-063
- Backup do prod antes de cada uma
- Cada migration testada com `make migrate-reset` em dev

### Fase 1 — Fechar relacionamento Base→Hub→Trail

| # | Arquivo | Conteúdo |
|---|---------|----------|
| 000055 | `add_base_slug_to_hubs.up.sql` | `ALTER TABLE hubs ADD COLUMN base_slug ... DEFAULT 'tecnologia'`. Backfill |
| 000056 | `extend_trails_metadata.up.sql` | Adiciona `slug, tagline, color, href, status`. Backfill via importer |
| 000057 | `extend_modules_metadata.up.sql` | Adiciona `keywords, seo_description, external_url, icon, level`. Cria junctions |
| 000058 | `create_simulados.up.sql` | Cria tabela `simulados` |
| 000059 | `seed_simulados.up.sql` | INSERT 4 simulados (aws-clf, aws-aif, aws-dva, anthropic-ai) extraindo de `catalog.json` |
| 000060 | `add_simulado_fk_to_questions.up.sql` | FK + `related_module_slug` |
| 000061 | `create_module_quizzes.up.sql` | Cria `module_quizzes`. Migrate blocks WHERE block_type='quiz' → tabela. Remove `'quiz'` do CHECK |
| 000062 | `create_base_stats_view.up.sql` | Materialized view + cron refresh 5min |
| 000063 | `drop_bases_counter_columns.up.sql` | **30 dias depois.** Drop `bases.modules/trails/hubs` |

### Fase 2 — Importer Go: `curriculum.ts` → tabelas

Script `cmd/import-curriculum/main.go`:
1. Parsea `frontend/src/lib/curriculum.ts` (via `tsc --outDir tmp` + reflexão, OU `node -e "console.log(JSON.stringify(...))"` — preferir #2)
2. UPSERT em `hubs` (com `base_slug` mapeado: hub-carreira → carreira, etc.)
3. UPSERT em `trails`
4. UPSERT em `curriculum_articles` (atualiza metadata)
5. INSERT em junction tables (`module_prerequisites`, `module_next_suggested`)

### Fase 3 — Frontend lê do backend (CMS-driven)

1. Criar endpoint `GET /api/v1/curriculum/snapshot` (1 query JSON aggregation)
2. `next.config.ts`: prebuild step `npm run fetch-curriculum` → `src/lib/curriculum.generated.ts`
3. Trocar imports `from './curriculum'` → `from './curriculum.generated'` em 60+ lugares
4. Manter `curriculum.ts` como fallback se fetch falhar (warn CI)

### Fase 4 — Admin escreve no DB (CMS real)

- `POST /api/v1/admin/hubs`
- `POST /api/v1/admin/trails`
- `POST /api/v1/admin/simulados`
- UI `/admin/curriculum` com forms

### Fase 5 — Sunset

Após 30 dias do snapshot rodando estável: deletar `catalog.json` + `curriculum.ts`. 100% DB.

---

## 5. Endpoints REST e como o front consome

### Endpoints

| Método | Path | Cache | Notas |
|--------|------|-------|-------|
| GET | `/api/v1/bases` | 60s | Já existe. Adicionar `?include=stats` JOIN base_stats |
| GET | `/api/v1/bases/{slug}` | 300s | NOVO. Metadata pura |
| GET | `/api/v1/bases/{slug}/page` | 300s | Já existe. View-model home |
| GET | `/api/v1/bases/{slug}/hubs` | 60s | NOVO |
| GET | `/api/v1/hubs/{id}` | 60s | NOVO. Hub + trails preload |
| GET | `/api/v1/trails/{id}` | 60s | NOVO. Trail + módulos (sem content_md) |
| GET | `/api/v1/curriculum/{slug}` | 60s | Já existe |
| GET | `/api/v1/modules/{slug}/quizzes` | 0 (auth) | NOVO. Quizzes SRS |
| GET | `/api/v1/simulados` | 300s | Já existe. Refactor: ler de table |
| GET | `/api/v1/simulados/{id}/questions` | 300s | NOVO. Sem `correct_id` p/ user comum |
| GET | `/api/v1/curriculum/snapshot` | 60s + ETag | NOVO crítico. Build do Next consome |

### Caching

| Camada | TTL | Invalidação |
|--------|-----|-------------|
| Backend response | 60-300s | TTL |
| Redis (futuro) | 5min | PUB/SUB on admin write |
| Next.js `revalidate` | 3600s | Edge revalidation por path no admin |
| `curriculum.generated.ts` | ∞ | Re-build a cada deploy |

**Regra de ouro:** admin escreve → evento → invalida Redis + revalida Next via webhook. Sem isso, leva até 1h.

---

## 6. Riscos e perguntas em aberto

### Riscos técnicos

1. **Migration 063 destrutiva.** Janela de manutenção ou flag de transição.
2. **Importer parsear TS.** Alternativa: gerar JSON snapshot do front e importer consome JSON.
3. **`curriculum_articles.slug` PK em 8+ tabelas.** Slug imutável (já documentado).
4. **Bases queued com 0 hubs.** View precisa LEFT JOIN correto.

### Perguntas de produto (PRECISA DECISÃO ANTES DE CODAR)

1. **Hub pode pertencer a múltiplas Bases?** Recomendação: 1 hub canônico (FK simples). Reaproveitar conteúdo via `hub_aliases` separado se for o caso.
2. **Trilha pode atravessar Hubs?** Hoje no `curriculum.ts` cada trilha vive em 1 hub. Algumas (ex.: "Python para Engenheiros") fazem sentido em IA E Programação. Recomendação: 1 hub canônico + tabela `hub_trail_features` opcional pra "trilhas em destaque em outros hubs".
3. **Simulado é por Base ou global?** Recomendação: `simulados.base_slug` FK obrigatório.
4. **`module_quiz_attempts` separada?** Sim — não misturar com `simulado_attempts`. SM-2 separado.
5. **Mapeamento Hub→Base canônico (a definir):**
   - hub-ia, hub-aws, hub-engenharia, hub-claude-anthropic, hub-fundamentos, hub-programacao, hub-dados, hub-construcao, hub-seguranca-hardware → base **tecnologia**
   - hub-carreira → base **carreira**
   - hub-comunicacao → base **comunicacao**
   - hub-marketing → base **marketing**
   - hub-conteudo → base **conteudo**
   - hub-empreendedorismo → base **empreendedorismo**
   - hub-ingles → base **ingles**

### Riscos operacionais

- Sistema em prod. Migrations idempotentes + reversíveis.
- CI 1180+ testes. Importer Go com teste de integração.
- Frontend SSG quebra se importer falhar no build. Fallback `.ts` por 60 dias após Fase 3.

---

## Arquivos relevantes

- `backend/migrations/000048_create_bases.up.sql` — schema bases (a refatorar)
- `backend/migrations/000026_create_hubs.up.sql` — hubs (sem base_slug)
- `backend/migrations/000027_create_trails.up.sql` — trails (OK estruturalmente)
- `backend/migrations/000028_extend_curriculum_articles.up.sql` — articles com FK hub/trail
- `backend/migrations/000029_create_module_blocks.up.sql` — blocks tree
- `backend/migrations/000040_create_questions.up.sql` — questions sem FK pra simulado
- `backend/internal/infrastructure/catalog/catalog.json` — fonte legada simulados
- `backend/internal/interfaces/http/handlers/bases_handler.go` — handler com fallback hardcoded
- `frontend/src/lib/curriculum.ts` — 5885 linhas, fonte de verdade real do front

---

## Próximas decisões esperadas do PO

1. ✅ Aceitar as **5 fases** propostas (1-2 sem, 1 sem, 1 sem, 1 sem, 30 dias)?
2. ✅ Confirmar mapeamento canônico Hub → Base (seção 6)?
3. ✅ Confirmar decisão: **questão de simulado e quiz de fixação são entidades separadas**?
4. ⏳ Quem vai escrever o importer Go (`cmd/import-curriculum`)? Pode ser feito por agente Claude.
5. ⏳ Quando aplicar Fase 4 (admin CMS)? Tem urgência ou pode esperar?
