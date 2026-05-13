# 📐 CMS Migration Plan — FFV Academy

> **Plano executivo + técnico** de migração de conteúdo do frontend (TSX hardcoded) para o backend (Postgres + blocos JSON estruturados), preservando 100% da consistência visual.

| Campo | Valor |
|---|---|
| **Status** | 🟡 PROPOSTA (aprovação pendente) |
| **Versão** | 1.0 |
| **Criado** | 2026-05-13 |
| **Owner** | Fernando Franco |
| **Prazo** | 8-10 semanas (parallel safe, zero downtime) |
| **Plano paralelo** | [`SECURITY_HARDENING_PLAN.md`](./SECURITY_HARDENING_PLAN.md) *(criar separadamente)* |

---

## 🚦 Como usar este documento

- Marque cada item com `[x]` ao concluir. Exemplo: `- [x] Item concluído`
- Atualize o **Dashboard de Progresso** abaixo a cada sprint
- Sempre commitar este arquivo junto com o trabalho que ele descreve
- Para mudanças no plano: bump da versão no topo + entrada em "Changelog"

---

## 📊 Dashboard de Progresso

| Sprint | Período | Status | % Concluído |
|---|---|---|---|
| **Sprint 1** — Schema + Foundation | Sem 1 | 🟡 Em progresso | 80% |
| **Sprint 2** — Blocos + Parser | Sem 2 | ⬜ Não iniciada | 0% |
| **Sprint 3** — Migração piloto | Sem 3 | ⬜ Não iniciada | 0% |
| **Sprint 4** — Wave 1 (100 módulos) | Sem 4 | ⬜ Não iniciada | 0% |
| **Sprint 5** — Wave 2 + Editor | Sem 5 | ⬜ Não iniciada | 0% |
| **Sprint 6** — Editor + MCP | Sem 6 | ⬜ Não iniciada | 0% |
| **Sprint 7-8** — Wave 3 (300 mod) + Curadoria | Sem 7-8 | ⬜ Não iniciada | 0% |
| **Sprint 9** — Finalização + SSR/ISR | Sem 9 | ⬜ Não iniciada | 0% |
| **Sprint 10** — Polish | Sem 10 | ⬜ Não iniciada | 0% |

**Status legenda**: ⬜ Não iniciada · 🟡 Em progresso · ✅ Concluída · 🔴 Bloqueada · ⏸️ Pausada

---

## 📝 SUMÁRIO EXECUTIVO

**Problema**: 915 módulos hardcoded como `page.tsx` no frontend (~450k linhas TSX). Deploy de 8k arquivos, edição requer rebuild, sem painel admin, sem métricas de conteúdo.

**Solução**: Conteúdo vira **blocos JSON estruturados no Postgres**, renderizados em runtime via `BlockRenderer` que mapeia para os **componentes React EXISTENTES** (sem reescrita visual). Editor admin web + MCP tools permite edição sem deploy.

**Garantias**:
- ✅ Consistência visual idêntica (primitives intocados, schema validado)
- ✅ Zero impacto no boot do backend (dados via seed/import script, NÃO migration)
- ✅ Migração progressiva paralela (dynamic + static coexistem)
- ✅ Rollback trivial em qualquer fase

**Não-objetivos**:
- ❌ Reescrever os componentes React
- ❌ Mudar visual da plataforma
- ❌ Big bang migration

---

# PARTE I — Diagnóstico do estado atual

## Inventário (já existe)

```
915 módulos               → src/app/aprenda/<slug>/page.tsx
15-20 primitives          → src/components/article/primitives.tsx
1 layout                  → src/components/article/ModuleLayout.tsx
8 hubs / 66 trilhas       → src/lib/curriculum.ts (5000 linhas)
0 conteúdo no banco       → tabela `articles` (migration 23) existe mas vazia
```

## Componentes que precisam virar "blocos"

| Primitive | Variantes | Complexidade | Prioridade | Status |
|---|---|---|---|---|
| `Section` | título + children | baixa | Sprint 1 | ⬜ |
| `Callout` | info/warning/danger/success | baixa | Sprint 1 | ⬜ |
| `CodeBlock` | 20+ langs, line highlights, filename | média | Sprint 1 | ⬜ |
| `Paragraph` | inline marks (bold/italic/link/code) | média | Sprint 1 | ⬜ |
| `ComparisonTable` | desktop table + mobile stacked | média | Sprint 2 | ⬜ |
| `DecisionBox` | tree-like de decisões | média | Sprint 2 | ⬜ |
| `Timeline` | events ordered | baixa | Sprint 2 | ⬜ |
| `Image` | src + alt + caption | baixa | Sprint 2 | ⬜ |
| `Quiz` | perguntas + respostas | média | Sprint 2 | ⬜ |
| `FlowDiagram` | nodes + edges | alta | Sprint 3 | ⬜ |
| `ArchFlow` | layers + flows | alta | Sprint 3 | ⬜ |
| `MatrixDiagram` | 2D grid | média | Sprint 3 | ⬜ |
| `StackFlow` | vertical stack | baixa | Sprint 3 | ⬜ |
| `NodeGraph` | graph genérico | alta | Sprint 3 | ⬜ |
| `AnnotatedFormula` | LaTeX + annotations | alta | Sprint 3 | ⬜ |

---

# PARTE II — Decisões arquiteturais críticas

## DECISÃO 1 — Conteúdo NÃO vai em migration SQL

**Por quê**: Migration deve ser RÁPIDA e idempotente. Inserir 915 módulos via migration:
- Lockaria tabela por minutos
- Backend não sobe enquanto migration roda
- Rollback é pesadelo
- Versionamento via git diff vira inviável (PR de 100MB)

**Solução**: separar SCHEMA de DATA

```
migrations/000025_create_module_blocks.sql    ← cria tabelas (rápido)
scripts/import-blocks/                         ← Go script standalone
  ├── main.go
  ├── parser_tsx.go                            ← lê page.tsx → JSON
  └── seeds/                                   ← JSONs commitados no repo
      ├── rag-fundamentos.json
      └── ... (915 arquivos)
```

Script roda **separadamente**, fora do path crítico de boot.

## DECISÃO 2 — Schema do banco (3 tabelas)

Detalhado na Parte III abaixo.

## DECISÃO 3 — Formato JSON dos blocos

Cada bloco tem `type` (discriminador) + `data` (props tipadas) + `children` opcional.

Detalhes em Parte IV.

## DECISÃO 4 — API contract

`GET /api/v1/curriculum/:slug` retorna artigo completo + blocks recursivos.

Detalhes em Parte V.

## DECISÃO 5 — Rendering strategy (SSG → SSR/ISR)

Fases progressivas:
1. **Hoje (estático)** — `output: export` lê do DB no build → gera HTMLs → FTP
2. **Migração Fase 1** — Mesmo, conteúdo do DB no build
3. **Migração Fase 2 (final)** — ISR + SSR + revalidate na VPS

## DECISÃO 6 — Migração progressiva (coexistência)

Rota dinâmica `/aprenda/[slug]` tenta DB primeiro, fallback pro estático se não encontrar. Migra 50-100 módulos por semana sem quebrar produção.

---

# PARTE III — Schema do banco

## Migration 25 — Criar tabelas

```sql
-- migrations/000025_create_module_blocks.up.sql

CREATE TABLE module_blocks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL REFERENCES articles(slug) ON DELETE CASCADE,
    position    INT  NOT NULL,
    block_type  TEXT NOT NULL,
    block_data  JSONB NOT NULL,
    parent_id   UUID REFERENCES module_blocks(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT block_type_valid CHECK (block_type IN (
        'section', 'paragraph', 'callout', 'code_block',
        'comparison_table', 'decision_box', 'flow_diagram',
        'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
        'node_graph', 'annotated_formula', 'quiz', 'image'
    ))
);

CREATE INDEX idx_module_blocks_slug_pos ON module_blocks(slug, position);
CREATE INDEX idx_module_blocks_parent ON module_blocks(parent_id);
```

## Migration 26 — Tabela de revisões

```sql
-- migrations/000026_create_module_revisions.up.sql

CREATE TABLE module_revisions (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug        TEXT NOT NULL,
    revision    INT NOT NULL,
    snapshot    JSONB NOT NULL,
    edited_by   UUID REFERENCES users(id),
    edited_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    note        TEXT,
    UNIQUE(slug, revision)
);

CREATE INDEX idx_module_revisions_slug ON module_revisions(slug, revision DESC);
```

## Migration 27 — Estender articles

```sql
-- migrations/000027_extend_articles.up.sql

ALTER TABLE articles
    ADD COLUMN status TEXT NOT NULL DEFAULT 'published'
        CHECK (status IN ('draft', 'published', 'archived')),
    ADD COLUMN hub_id TEXT,
    ADD COLUMN trail_id TEXT,
    ADD COLUMN xp_reward INT DEFAULT 10,
    ADD COLUMN reading_time_min INT,
    ADD COLUMN difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    ADD COLUMN cover_image_url TEXT,
    ADD COLUMN published_at TIMESTAMPTZ;
```

### Checklist Parte III

- [x] Migration 26 hubs (up + down) — feat/cms-sprint-1
- [x] Migration 27 trails (up + down)
- [x] Migration 28 extend curriculum_articles (up + down)
- [x] Migration 29 module_blocks (up + down)
- [x] Migration 30 module_revisions (up + down)
- [x] Migration 31 comments (up + down) — schema pronto, sem handler
- [x] Migration 32 comment_votes (up + down)
- [x] Migration 33 article_ratings (up + down)
- [x] Migration 34 article_bookmarks (up + down)
- [x] Migration 35 trail_enrollments (up + down)
- [x] Migration 36 content_reports (up + down)
- [ ] Migrations testadas localmente (up + down + up) — pendente Docker local
- [ ] Migrations aplicadas em staging
- [ ] Migrations aplicadas em produção

---

# PARTE IV — Catálogo de tipos de bloco

## Go structs (backend)

```go
// backend/internal/domain/curriculum/blocks/types.go
package blocks

type Block struct {
    ID       string          `json:"id"`
    Type     string          `json:"type"`
    Position int             `json:"position"`
    Data     json.RawMessage `json:"data"`
    Children []*Block        `json:"children,omitempty"`
}

type SectionData struct {
    Title string `json:"title" validate:"required,max=200"`
}

type CalloutData struct {
    Variant string `json:"variant" validate:"required,oneof=info warning danger success"`
    Title   string `json:"title" validate:"required,max=120"`
    Content string `json:"content" validate:"required"`
}

type CodeBlockData struct {
    Language       string `json:"language" validate:"required"`
    Code           string `json:"code" validate:"required"`
    Filename       string `json:"filename,omitempty"`
    HighlightLines []int  `json:"highlightLines,omitempty"`
    StartLine      int    `json:"startLine,omitempty"`
}

type FlowDiagramData struct {
    Nodes []FlowNode `json:"nodes" validate:"required,min=2,dive"`
    Edges []FlowEdge `json:"edges,omitempty,dive"`
}

type FlowNode struct {
    ID    string `json:"id" validate:"required"`
    Label string `json:"label" validate:"required"`
    Type  string `json:"type,omitempty" validate:"omitempty,oneof=input process output decision"`
}

type FlowEdge struct {
    From  string `json:"from" validate:"required"`
    To    string `json:"to" validate:"required"`
    Label string `json:"label,omitempty"`
}

// ... continua para todos os tipos
```

## Zod schemas (frontend)

```ts
// src/components/article/blocks/schemas.ts
import { z } from 'zod';

export const SectionSchema = z.object({
  title: z.string().min(1).max(200),
});

export const CalloutSchema = z.object({
  variant: z.enum(['info', 'warning', 'danger', 'success']),
  title: z.string().max(120),
  content: z.string(),
});

export const CodeBlockSchema = z.object({
  language: z.string(),
  code: z.string(),
  filename: z.string().optional(),
  highlightLines: z.array(z.number()).optional(),
  startLine: z.number().optional(),
});

// ... todos os tipos
```

### Checklist Parte IV

- [ ] Go structs para 15 tipos de bloco (Sprint 1-3)
- [ ] Validação Go com `validator.v10`
- [ ] Zod schemas equivalentes no frontend
- [ ] Testes unitários para cada schema (valid + invalid cases)
- [ ] Documentação inline (godoc + JSDoc)

---

# PARTE V — API contract

## Endpoint principal

```
GET /api/v1/curriculum/:slug

Response 200:
{
  "slug": "rag-fundamentos",
  "title": "Fundamentos de RAG",
  "hub_id": "ia",
  "trail_id": "rag-essential",
  "xp_reward": 15,
  "reading_time_min": 12,
  "difficulty": "intermediate",
  "status": "published",
  "published_at": "2026-05-13T01:00:00Z",
  "updated_at": "2026-05-13T10:30:00Z",
  "blocks": [
    {
      "id": "uuid-1",
      "type": "section",
      "position": 0,
      "data": { "title": "O que é RAG?" },
      "children": [
        {
          "id": "uuid-2",
          "type": "paragraph",
          "position": 0,
          "data": {
            "content": [
              { "text": "Retrieval-Augmented Generation é " },
              { "text": "uma técnica", "bold": true },
              { "text": " que..." }
            ]
          }
        }
      ]
    },
    {
      "id": "uuid-3",
      "type": "callout",
      "position": 1,
      "data": {
        "variant": "warning",
        "title": "Custo escala",
        "content": "Cuidado com chunks grandes..."
      }
    }
  ],
  "metadata": {
    "next_slug": "rag-vector-databases",
    "prev_slug": "embeddings-basicos",
    "related_slugs": ["rag-chunking", "rag-evaluation"]
  }
}

Cache headers:
  Cache-Control: public, max-age=3600, stale-while-revalidate=86400
  ETag: "v3-abc123"
```

## Endpoints admin (autenticação obrigatória + role admin)

```
GET    /api/v1/admin/curriculum                   listar com filtros
POST   /api/v1/admin/curriculum                   criar módulo + blocks
PATCH  /api/v1/admin/curriculum/:slug             editar metadata
DELETE /api/v1/admin/curriculum/:slug             soft delete
POST   /api/v1/admin/curriculum/:slug/blocks      reordenar/replace blocks
POST   /api/v1/admin/curriculum/:slug/publish     muda status draft→published
POST   /api/v1/admin/curriculum/:slug/revert/:rev rollback pra revisão N
GET    /api/v1/admin/curriculum/:slug/revisions   histórico
```

### Checklist Parte V

- [ ] Handler `GET /api/v1/curriculum/:slug` retornando blocks
- [ ] Repository pattern para fetch de blocks recursivos
- [ ] Cache Redis para responses (TTL 1h)
- [ ] Cache invalidation ao editar
- [ ] Handlers admin (`POST`, `PATCH`, `DELETE`, etc)
- [ ] Middleware `RequireAdmin` aplicado
- [ ] Contract tests cobrindo casos felizes + erros
- [ ] OpenAPI spec atualizado

---

# PARTE VI — Frontend BlockRenderer

```tsx
// src/components/article/BlockRenderer.tsx

import { Section, Callout, CodeBlock, FlowDiagram, /* etc */ } from './primitives';
import { SectionSchema, CalloutSchema, /* etc */ } from './blocks/schemas';

const BLOCK_REGISTRY = {
  section:           { Component: Section,           schema: SectionSchema,           allowsChildren: true  },
  paragraph:         { Component: Paragraph,         schema: ParagraphSchema,         allowsChildren: false },
  callout:           { Component: Callout,           schema: CalloutSchema,           allowsChildren: false },
  code_block:        { Component: CodeBlock,         schema: CodeBlockSchema,         allowsChildren: false },
  comparison_table:  { Component: ComparisonTable,   schema: ComparisonTableSchema,   allowsChildren: false },
  decision_box:      { Component: DecisionBox,       schema: DecisionBoxSchema,       allowsChildren: false },
  flow_diagram:      { Component: FlowDiagram,       schema: FlowDiagramSchema,       allowsChildren: false },
  arch_flow:         { Component: ArchFlow,          schema: ArchFlowSchema,          allowsChildren: false },
  matrix_diagram:    { Component: MatrixDiagram,     schema: MatrixDiagramSchema,     allowsChildren: false },
  stack_flow:        { Component: StackFlow,         schema: StackFlowSchema,         allowsChildren: false },
  timeline:          { Component: Timeline,          schema: TimelineSchema,          allowsChildren: false },
  node_graph:        { Component: NodeGraph,         schema: NodeGraphSchema,         allowsChildren: false },
  annotated_formula: { Component: AnnotatedFormula,  schema: AnnotatedFormulaSchema,  allowsChildren: false },
  quiz:              { Component: QuizBlock,         schema: QuizSchema,              allowsChildren: false },
  image:             { Component: ImageBlock,        schema: ImageSchema,             allowsChildren: false },
} as const;

export function BlockRenderer({ block }: { block: Block }) {
  const entry = BLOCK_REGISTRY[block.type as keyof typeof BLOCK_REGISTRY];

  if (!entry) {
    console.warn(`Unknown block type: ${block.type}`);
    return process.env.NODE_ENV === 'development'
      ? <div className="border border-red-500 p-4">⚠️ Bloco desconhecido: {block.type}</div>
      : null;
  }

  const parsed = entry.schema.safeParse(block.data);
  if (!parsed.success) {
    console.error(`Invalid block data for ${block.type}:`, parsed.error);
    return null;
  }

  const { Component } = entry;
  const props = parsed.data;

  if (entry.allowsChildren && block.children) {
    return (
      <Component {...props}>
        {block.children.map(child => <BlockRenderer key={child.id} block={child} />)}
      </Component>
    );
  }

  return <Component {...props} />;
}
```

## Página de módulo (substitui 915 page.tsx)

```tsx
// src/app/aprenda/[slug]/page.tsx
export default async function ModulePage({ params }: { params: { slug: string } }) {
  const article = await fetchArticle(params.slug);
  if (!article) {
    // Fallback para conteúdo estático (durante migração)
    return <LegacyArticle slug={params.slug} />;
  }

  return (
    <ModuleLayout
      title={article.title}
      xpReward={article.xp_reward}
      readingTimeMin={article.reading_time_min}
      hubId={article.hub_id}
      trailId={article.trail_id}
    >
      {article.blocks.map(block => (
        <BlockRenderer key={block.id} block={block} />
      ))}
    </ModuleLayout>
  );
}
```

### Checklist Parte VI

- [ ] `BlockRenderer.tsx` implementado
- [ ] `BLOCK_REGISTRY` completo (15 tipos)
- [ ] Fallback gracioso para tipo desconhecido
- [ ] Validação Zod no client (defensive)
- [ ] Recursão para blocos com children
- [ ] Testes unitários do renderer
- [ ] Rota dinâmica `/aprenda/[slug]/page.tsx` com fallback legacy
- [ ] `fetchArticle()` com cache no client (React cache)

---

# PARTE VII — Storybook de blocos

Criar página `/admin/blocks` (acessível só pra admin) mostrando **todos os tipos** com 3-5 variantes cada.

```tsx
// src/app/admin/blocks/page.tsx
export default function BlocksStorybook() {
  const examples = [
    { type: 'callout', variant: 'info', data: { variant: 'info', title: 'Info', content: '...' } },
    { type: 'callout', variant: 'warning', data: { variant: 'warning', title: 'Aviso', content: '...' } },
    // ... todos os tipos × variantes
  ];

  return (
    <div className="grid grid-cols-1 gap-8">
      {examples.map(ex => (
        <section key={`${ex.type}-${ex.variant}`}>
          <h2>{ex.type} — variant: {ex.variant}</h2>
          <BlockRenderer block={ex} />
          <pre>{JSON.stringify(ex.data, null, 2)}</pre>
        </section>
      ))}
    </div>
  );
}
```

### Checklist Parte VII

- [ ] Página `/admin/blocks` criada
- [ ] Pelo menos 1 exemplo para cada tipo (15+)
- [ ] Visual regression tests via Playwright (1 snapshot por tipo×variante)
- [ ] Link no admin panel

---

# PARTE VIII — Script de import TSX → JSON

```
scripts/import-blocks/
├── package.json (TS + Babel parser)
├── parser.ts
├── transforms/
│   ├── section.ts
│   ├── callout.ts
│   ├── code_block.ts
│   └── ... (1 transform por primitive)
├── manual_review.ts (CLI interativo)
└── seeds_output/ (JSONs gerados, commitados)
```

## Fluxo do dev migrating

```bash
$ npm run migrate:module -- rag-fundamentos

→ Parseando src/app/aprenda/rag-fundamentos/page.tsx
→ Encontrados 12 blocos:
  ✓ section (3)
  ✓ callout (2)
  ✓ code_block (4)
  ⚠ flow_diagram (1) — REQUER REVISÃO MANUAL
  ✓ comparison_table (2)
→ Gerado: scripts/seeds/rag-fundamentos.json
→ Preview disponível em http://localhost:3000/admin/preview/rag-fundamentos

[Aprovar? y/n/edit]
```

### Checklist Parte VIII

- [ ] Setup do projeto Node `scripts/import-blocks/`
- [ ] Parser AST básico funcionando
- [ ] Transforms para 5 primeiros tipos (Sprint 2)
- [ ] CLI de review manual
- [ ] Modo `--dry-run` mostrando JSON sem salvar
- [ ] Modo `--bulk` processando trilha inteira
- [ ] Documentação dos transforms

---

# PARTE IX — Importer Go (seeds → DB)

```
backend/cmd/importer/main.go
```

```go
// Comando: ./importer --source=/opt/ffv/seeds/ --batch-size=10
//
// Lê JSONs em seeds/, valida schema, INSERT no DB.
// Idempotente (UPSERT por slug).
// Pode rodar em prod sem downtime.
```

### Checklist Parte IX

- [ ] Comando `importer` em `backend/cmd/importer/`
- [ ] Flag `--source` para diretório de seeds
- [ ] Validação Go strict antes de insert
- [ ] Transação por módulo (rollback se falhar)
- [ ] Logs estruturados (slug + nº blocos importados)
- [ ] Dry-run mode
- [ ] Testes unitários

---

# PARTE X — Editor admin (frontend)

```
src/app/admin/articles/
├── page.tsx              # lista de módulos
├── [slug]/
│   ├── page.tsx          # view do módulo
│   └── edit/
│       └── page.tsx      # editor
└── new/page.tsx          # criar novo
```

## Wireframe do editor

```
┌──────────────────────────────────────────────────────────────────────┐
│ /admin/articles/rag-fundamentos/edit                       [Publicar]│
├──────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┬─────────────────────────────────────────┐   │
│  │ EDITOR              │ PREVIEW (live)                          │   │
│  │                     │                                         │   │
│  │ Title: [_______]    │  ┌─────────────────────────────────┐   │   │
│  │                     │  │ # Fundamentos de RAG            │   │   │
│  │ Blocks:             │  │ ## O que é RAG?                 │   │   │
│  │ ┌─────────────────┐ │  │ Retrieval-Augmented...          │   │   │
│  │ │+ Section        │ │  │ ⚠️ Custo escala                 │   │   │
│  │ │  ├─ Paragraph   │ │  │ Cuidado com chunks...           │   │   │
│  │ │+ Callout: warn..│ │  │ ```python                       │   │   │
│  │ │+ CodeBlock: py..│ │  │ def embed(text): ...            │   │   │
│  │ │ [+ Adicionar]   │ │  │ ```                             │   │   │
│  │ └─────────────────┘ │  └─────────────────────────────────┘   │   │
│  └─────────────────────┴─────────────────────────────────────────┘   │
│                                                                       │
│  Status: [Draft ▾]  Última edição: há 2 min  v.12                    │
└──────────────────────────────────────────────────────────────────────┘
```

Stack: React + react-dnd (reorder) + Tiptap (rich text dentro de paragraph) + react-hook-form + zod resolver.

### Checklist Parte X

- [ ] Lista de módulos `/admin/articles`
- [ ] Filtros (status, hub, trail)
- [ ] Editor block-by-block com reorder drag-drop
- [ ] Form por tipo de bloco (auto-gerado do schema Zod)
- [ ] Preview side-by-side ao vivo
- [ ] Save draft (autosave a cada 30s)
- [ ] Publish flow com confirmação
- [ ] Histórico de revisões + rollback 1-click
- [ ] Permissões role-based (só admin)

---

# PARTE XI — MCP integration

```ts
// mcp/src/tools/curriculum.ts

export const curriculumTools = [
  {
    name: 'curriculum_create_module',
    description: 'Cria novo módulo na plataforma',
    // ...
  },
  {
    name: 'curriculum_update_block',
    description: 'Atualiza bloco específico',
    // ...
  },
  {
    name: 'curriculum_publish',
    description: 'Publica (draft → published)',
    // ...
  },
  {
    name: 'curriculum_search',
    description: 'Busca módulos',
    // ...
  },
  {
    name: 'news_publish',
    description: 'Publica notícia/post no feed',
    // ...
  }
];
```

### Checklist Parte XI

- [ ] Tool `curriculum_create_module`
- [ ] Tool `curriculum_update_block`
- [ ] Tool `curriculum_publish`
- [ ] Tool `curriculum_search`
- [ ] Tool `curriculum_revert`
- [ ] Tool `news_publish`
- [ ] Audit log de todas operações via MCP
- [ ] Token MCP separado (não admin total)
- [ ] Rate limit por token MCP
- [ ] Dry-run mode em todas as tools

---

# PARTE XII — Backend boot performance

**Sua preocupação foi explícita: backend não pode demorar pra subir.**

## Como garantir startup < 3s mesmo com 915 módulos no DB

1. **Sem eager loading no boot** — blocks são fetch on-demand
2. **Schema migrations rápidas** — só DDL, sem DATA
3. **Import é processo separado** — `/opt/ffv/bin/importer` standalone
4. **Index `CONCURRENTLY`** — não trava tabela
5. **Healthcheck `/readyz` não toca em conteúdo**

### Checklist Parte XII

- [ ] Benchmark de boot time antes da mudança (baseline)
- [ ] Benchmark depois das migrations (deve ser <3s)
- [ ] `/readyz` não faz query de blocks
- [ ] Importer documentado no RUNBOOK.md
- [ ] Index criados com `CONCURRENTLY` em prod

---

# PARTE XIII — Cache strategy

```
Browser → Cloudflare → Nginx → Next.js → API Go → Redis → Postgres
   ↑          ↑          ↑       ↑        ↑       ↑
 1h         1h        no-cache  ISR     5min   source

Cache invalidation pipeline (ao editar):
  API Go invalida: Redis(slug) + Cloudflare(/aprenda/slug) + Next.js revalidatePath
  Próxima request hits Postgres → re-cache em cascata
```

### Checklist Parte XIII

- [ ] Redis caching no backend Go (TTL 1h)
- [ ] ETag header com hash do conteúdo
- [ ] Cache invalidation on edit
- [ ] Cloudflare Cache Rules configurado
- [ ] Next.js `revalidatePath` ao publicar
- [ ] Métrica: cache hit ratio em Grafana

---

# 🏃 SPRINTS DETALHADOS

## Sprint 1 — Schema + Foundation (Semana 1)

**Status**: ⬜ Não iniciada

### Objetivos
- Schema do DB pronto e migrado
- 5 tipos de bloco implementados ponta a ponta
- 1 módulo de teste renderizando 100% do DB

### Tarefas
- [x] **Migrations 026-036** (11 arquivos up + 11 down) — em `feat/cms-sprint-1`
- [x] Testes de migration (up + down + up) — aplicadas no Postgres local Docker
- [x] Aplicar migrations em local (Docker compose dev) ✅
- [ ] Aplicar migrations em staging
- [ ] Aplicar migrations em produção
- [x] Go structs Block + 15 tipos válidos (constantes BlockType*)
- [x] Repository `curriculum_repo.go` com `FindBlocksBySlug` (árvore reconstruída em Go) + `SaveBlocks` (transacional)
- [x] Endpoint `GET /api/v1/curriculum/:slug/blocks` retornando blocks ✅
- [x] ETag + Cache-Control no handler
- [x] OpenAPI documentado + Swagger UI funcional em http://localhost:8090
- [ ] Cache Redis no handler (TTL 1h) — adiar para Sprint 2
- [ ] Contract tests do endpoint — adiar para Sprint 2
- [x] Zod schemas no frontend para 15 tipos (5 ativos, 10 placeholders)
- [x] `BlockRenderer.tsx` com 5 tipos ativos no registry + adapters inline
- [x] Fallback gracioso (unknown type, invalid data, PlaceholderBlock)
- [ ] Testes unitários do renderer — adiar para Sprint 2
- [ ] Página `/admin/blocks` (storybook básico) — Sprint 2
- [ ] Visual regression tests dos 5 tipos — Sprint 2
- [x] **Seed inicial**: 1 hub + 1 trilha + 3 módulos reais (19 blocks)
- [x] Rota dinâmica `/aprenda-dynamic/[slug]/` paralela criada
- [x] Renderizado e validado em http://localhost:3000/aprenda-dynamic/o-que-e-ia/
- [ ] Comparar visual com módulo equivalente estático — pendente revisão Fernando

**Validações ponta-a-ponta concluídas (2026-05-13):**
- ✅ Backend Go rodando em `:8080`
- ✅ Postgres + Redis via docker compose
- ✅ Swagger UI em `:8090` executando endpoint com sucesso (200 OK)
- ✅ Frontend Next.js em `:3000` SSR consumindo backend
- ✅ Conteúdo do banco renderizado pelo BlockRenderer no browser

### Deliverable Sprint 1
✅ 1 módulo de teste renderizando 100% do DB, indistinguível dos estáticos.

---

## Sprint 2 — Mais blocos + Parser (Semana 2)

**Status**: ⬜ Não iniciada

### Objetivos
- +5 tipos de bloco
- Parser TSX → JSON funcional
- Pipeline completo: parser → seed → importer → DB → render

### Tarefas
- [ ] Go structs + Zod schemas: DecisionBox, Timeline, Image, Quiz, FlowDiagram
- [ ] BlockRenderer atualizado com novos tipos
- [ ] Storybook completo (10 tipos)
- [ ] Visual regression tests pra todos
- [ ] Setup do projeto `scripts/import-blocks/` (Node + TS + Babel parser)
- [ ] Parser AST básico (lê page.tsx e identifica primitives)
- [ ] Transforms: Section, Paragraph, Callout, CodeBlock, ComparisonTable
- [ ] CLI `npm run migrate:module -- <slug>`
- [ ] Dry-run mode no parser
- [ ] Importer Go `backend/cmd/importer/main.go`
- [ ] Importer com transação por módulo
- [ ] Testes do importer
- [ ] Documentação: como rodar parser + importer

### Deliverable Sprint 2
✅ Parser converte 5 módulos de teste TSX → JSON → DB → render perfeito.

---

## Sprint 3 — Migração piloto (Semana 3)

**Status**: ⬜ Não iniciada

### Objetivos
- +5 tipos restantes (ArchFlow, MatrixDiagram, StackFlow, NodeGraph, AnnotatedFormula)
- 20 módulos piloto migrados
- Rota dinâmica em prod com fallback legacy

### Tarefas
- [ ] Implementar 5 tipos restantes (Go + Zod + render)
- [ ] Storybook 100% completo (15 tipos)
- [ ] Transforms parser para 10 tipos restantes
- [ ] Selecionar 20 módulos piloto (variados em complexidade)
- [ ] Migrar 20 módulos com review manual
- [ ] Commit dos 20 seeds JSON
- [ ] Importer roda em staging com os 20
- [ ] Rota `/aprenda/[slug]/page.tsx` dinâmica com fallback
- [ ] Deploy em prod
- [ ] A/B test invisível: 20 módulos via DB, 895 via static
- [ ] Métricas: time-to-render, cache hit, erros

### Deliverable Sprint 3
✅ 20/915 módulos (2%) em prod via DB, sem regressão visual.

---

## Sprint 4 — Wave 1 (Semana 4)

**Status**: ⬜ Não iniciada

### Objetivos
- 100 módulos migrados (Trilhas IA fundamentais)
- Refinamento do parser

### Tarefas
- [ ] Listar trilhas-alvo: Trilhas 1, 2, 3 (~100 módulos)
- [ ] Migrar lote de 10 módulos por dia
- [ ] Resolver casos edge do parser conforme aparecem
- [ ] Performance review: SQL slow queries, cache hits
- [ ] Smoke tests automatizados por módulo migrado
- [ ] Commit + deploy progressivos

### Deliverable Sprint 4
✅ 120/915 módulos (13%) em prod via DB.

---

## Sprint 5 — Wave 2 + Editor MVP (Semana 5)

**Status**: ⬜ Não iniciada

### Objetivos
- +150 módulos migrados (Trilhas AWS, Engenharia)
- Editor admin MVP funcional

### Tarefas
- [ ] Migrar 150 módulos
- [ ] Layout do `/admin/articles` (lista)
- [ ] Editor `/admin/articles/:slug/edit`
- [ ] Form auto-gerado por tipo de bloco (zod-resolver)
- [ ] Drag-drop pra reorder blocks
- [ ] Preview side-by-side
- [ ] Save draft (autosave 30s)
- [ ] Publish action
- [ ] Permissões: middleware admin

### Deliverable Sprint 5
✅ 270/915 (29%), editor admin funcional, edita módulos em prod sem deploy.

---

## Sprint 6 — Editor avançado + MCP (Semana 6)

**Status**: ⬜ Não iniciada

### Objetivos
- +100 módulos (Trilhas Profissional Digital)
- MCP tools em produção
- Versionamento + rollback

### Tarefas
- [ ] Migrar 100 módulos
- [ ] Histórico de revisões na UI
- [ ] Rollback 1-click pra revisão N
- [ ] MCP tool `curriculum_create_module`
- [ ] MCP tool `curriculum_update_block`
- [ ] MCP tool `curriculum_publish`
- [ ] MCP tool `curriculum_search`
- [ ] MCP tool `news_publish`
- [ ] Audit log de operações via MCP
- [ ] Token MCP com scopes limitados

### Deliverable Sprint 6
✅ 370/915 (40%), MCP em prod, Claude consegue criar/editar módulos via chat.

---

## Sprint 7-8 — Wave 3 + Curadoria (Semanas 7-8)

**Status**: ⬜ Não iniciada

### Objetivos
- +300 módulos (Programação, Dados, Claude)
- **Curadoria editorial**: cortar 30-40% sem encaixe no pitch

### Tarefas
- [ ] Migrar 300 módulos
- [ ] **Auditoria editorial**: revisar TODOS os módulos vs pitch
- [ ] Marcar pra DELETE módulos sem fit
- [ ] Marcar pra CONSOLIDATE módulos redundantes
- [ ] Aprovação editorial (você decide)
- [ ] Deletar/consolidar (soft delete via status='archived')
- [ ] Dashboard `/admin/metrics`: views, completions, ratings por módulo

### Deliverable Sprint 7-8
✅ 670/915 migrados → após curadoria ~500 efetivos focados no pitch.

---

## Sprint 9 — Finalização + SSR/ISR (Semana 9)

**Status**: ⬜ Não iniciada

### Objetivos
- 100% migrado
- Deletar legacy
- Migrar pra SSR/ISR na VPS

### Tarefas
- [ ] Migrar últimos módulos
- [ ] Confirmar zero regressão visual
- [ ] Deletar todos `/aprenda/<slug>/page.tsx` legacy
- [ ] Criar `frontend/Dockerfile`
- [ ] Adicionar `nextjs-frontend` no docker-compose.prod.yml
- [ ] Configurar nginx upstream pra frontend
- [ ] Trocar `output: export` → `output: 'standalone'`
- [ ] Adicionar Cloudflare na frente (CDN)
- [ ] Cache invalidation API → Cloudflare
- [ ] Smoke tests pós-migração SSR

### Deliverable Sprint 9
✅ 100% dinâmico, deploy de conteúdo via DB (sem rebuild frontend), Cloudflare CDN.

---

## Sprint 10 — Polish (Semana 10)

**Status**: ⬜ Não iniciada

### Objetivos
- Plataforma CMS-driven madura

### Tarefas
- [ ] Painel admin completo (drafts, scheduling, A/B variants)
- [ ] Analytics avançado (heatmap por bloco, dropoff)
- [ ] Bulk operations (publicar/arquivar em lote)
- [ ] Importação OneOff (Markdown, Notion export)
- [ ] Documentação completa em `docs/CMS.md`
- [ ] Runbook de operação editorial
- [ ] Treinamento (você + futuros editores)

### Deliverable Sprint 10
✅ Plataforma CMS profissional + processo editorial sustentável.

---

# 📋 RISK REGISTER

| ID | Risco | Probabilidade | Impacto | Mitigation | Owner | Status |
|---|---|---|---|---|---|---|
| R1 | Parser TSX falha em casos exóticos | Alta | Baixo | Review manual obrigatório | Dev | ⬜ |
| R2 | Schema muda durante migração | Média | Alto | Versionar `block_version` em cada record | Dev | ⬜ |
| R3 | Editor admin tem bug e quebra módulo | Média | Médio | `module_revisions` = rollback 1-click | Dev | ⬜ |
| R4 | Performance degrada com 915 mod | Baixa | Alto | Cache Redis + Cloudflare. Index | Dev | ⬜ |
| R5 | Visual regression em algum bloco | Média | Alto | Playwright visual tests por tipo | QA | ⬜ |
| R6 | MCP edita coisa errada | Média | Médio | Audit log + dry-run + approval flow | Dev | ⬜ |
| R7 | Concorrência (2 editores mesmo mod) | Baixa | Médio | Optimistic locking | Dev | ⬜ |
| R8 | Conteúdo legacy tem nuance única | Média | Médio | Bloco genérico `custom_html` fallback | Dev | ⬜ |
| R9 | Backend boot fica lento | Baixa | Alto | Benchmark contínuo, fetch on-demand | DevOps | ⬜ |
| R10 | Hostinger não aguenta SSR | Média | Alto | Pre-validar VPS, plano B Cloudflare Pages | DevOps | ⬜ |

---

# 📊 MÉTRICAS DE SUCESSO

## Durante migração
- [ ] 0 incidentes de visual regression em prod
- [ ] 0 módulos quebrados após migração
- [ ] Coverage de testes mantido >25% (ratchet ativo)
- [ ] Build time mantido <5 min
- [ ] Backend boot mantido <3s
- [ ] P99 latency `/curriculum/:slug` <100ms

## Ao final
- [ ] 100% conteúdo no DB (915 → ~500 após curadoria)
- [ ] Tempo edit→prod: 1h → 10s
- [ ] Cache hit ratio: >85% em prod
- [ ] Editor admin usado 10+x por semana
- [ ] 1+ módulo criado via MCP por mês
- [ ] Deploy de conteúdo NÃO requer mais rebuild frontend

---

# 🔄 PLANO DE ROLLBACK (por sprint)

| Fase | Como reverter |
|---|---|
| Sprint 1 (schema) | Migration down: drop tables. Nada em prod usa ainda. |
| Sprint 2 (renderer) | BlockRenderer não invocado. Rota dynamic usa só fallback. |
| Sprint 3-8 (migração) | Por módulo: `UPDATE articles SET status='archived'` → fallback estático. |
| Sprint 9 (delete legacy) | `git checkout HEAD~10 -- src/app/aprenda/`. |
| Sprint 10 (SSR VPS) | Voltar `output: export`, reverter docker-compose. |

**Em nenhum momento você fica sem possibilidade de voltar atrás.**

---

# 📚 LINKS E REFERÊNCIAS

- ADR `0002-exclude-rsc-payloads-from-ftp-deploy.md` — solução temporária do FTP
- BACKEND_ROADMAP.md — outras iniciativas de backend
- MELHORIAS.md — roadmap pedagógico/visual
- CURRICULUM_MASTER_PLAN.md — currículo canônico
- frontend/CLAUDE.md — gotchas, gotchas, gotchas
- backend/CLAUDE.md — arquitetura backend

---

# 📝 CHANGELOG

| Versão | Data | Autor | Mudanças |
|---|---|---|---|
| 1.0 | 2026-05-13 | Fernando + Claude | Versão inicial após sessão de planejamento |

---

# 🎯 PRÓXIMO PASSO IMEDIATO

Quando aprovar este plano:

1. Marcar **Sprint 1** como 🟡 Em progresso no dashboard
2. Criar branch `feat/cms-sprint-1`
3. Começar pela primeira tarefa não-marcada da Sprint 1
4. Marcar `[x]` em cada item conforme conclui
5. PR ao final da sprint atualizando este documento
6. Mergear, marcar Sprint 1 como ✅ Concluída, começar Sprint 2

**Lembre**: este documento é a fonte da verdade. Sempre atualize aqui antes de fechar uma sprint.
