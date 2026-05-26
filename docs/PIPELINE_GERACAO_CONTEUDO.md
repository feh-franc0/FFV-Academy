# 🧬 Pipeline de Geração de Conteúdo — PDF → Hub/Trilha/Módulo no DB

> **Objetivo:** todo material que o cliente envia (PDF, DOCX, slides, planilhas, imagens, texto livre) vira automaticamente um módulo completo de estudo dentro de um hub existente — ou cria um hub novo se necessário. Trilha + módulo + blocos pedagógicos + quiz, tudo persistido no banco.

> **Princípio:** o cliente nunca escreve markdown nem JSON. Ele só envia o material. **A IA + esse pipeline transformam em conteúdo navegável, gamificado e com SRS no formato canônico FFV Academy.**

---

## 📦 Sumário

1. [Fluxo end-to-end](#fluxo-end-to-end)
2. [Entrada: o que o cliente envia](#entrada)
3. [Análise: o que a IA extrai](#analise)
4. [Decisão: criar hub novo ou usar existente?](#decisao)
5. [Tabelas do banco — schema completo](#tabelas)
6. [Tipos de bloco suportados (15 tipos)](#blocos)
7. [Prompt master pra IA](#prompt)
8. [Validações pré-import](#validacoes-pre)
9. [Importer Go — como rodar](#importer)
10. [Validações pós-import](#validacoes-pos)
11. [Caso de uso: Lara — Genética Vet](#caso-lara)
12. [⭐ Padrão obrigatório: 100 questões por hub](#simulado-100q)

---

<a id="fluxo-end-to-end"></a>
## 1. Fluxo end-to-end

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENTE (form público em /)                                    │
│  Envia: nome, email, área, tema, descrição, arquivos (PDF, etc) │
└────────────────────────────┬────────────────────────────────────┘
                             │ POST /api/v1/study-requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND — gravação                                              │
│  • DB: study_requests + study_request_attachments                │
│  • R2: arquivos físicos em ffv-uploads/<request_id>/             │
│  • Email: confirmação + alerta admin                             │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN — /admin/study-requests/[id]                              │
│  1. Clica "🛠 Iniciar curadoria" → status=in_production          │
│  2. Clica "⬇ Baixar tudo (.zip)" → recebe ZIP com:               │
│       • solicitacao.json (todos os dados do form)                │
│       • solicitacao.txt (versão legível)                         │
│       • anexos/<arquivos físicos>                                │
└────────────────────────────┬────────────────────────────────────┘
                             │ admin alimenta IA local com o ZIP
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  IA — análise + geração                                          │
│  • Lê: PDF text + solicitacao.json + descrição livre             │
│  • Aplica: PROMPT MASTER (seção 7 deste doc)                     │
│  • Gera: arquivos JSON estruturados pro importer                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  SEEDS — scripts/seeds/articles/<slug>.json                      │
│  + (opcional) scripts/seeds/hubs.json, trails.json se novos      │
└────────────────────────────┬────────────────────────────────────┘
                             │ go run ./cmd/importer
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  POSTGRES — populado idempotente                                 │
│  • bases, hubs, trails, curriculum_articles, module_blocks       │
│  • module_quizzes + module_quiz_attempts (SRS)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND — renderiza automaticamente                            │
│  • /<base-slug>/<hub>/<trail>/<module>                           │
│  • Sem mudança em código frontend — DB-driven                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN — finaliza                                                │
│  1. Cola URL do módulo no campo "URL DA TRILHA GERADA"           │
│  2. Clica "🎉 Finalizar + enviar email com link"                 │
│  3. Cliente recebe email celebrativo com CTA grande              │
└─────────────────────────────────────────────────────────────────┘
```

---

<a id="entrada"></a>
## 2. Entrada: o que o cliente envia

Tudo capturado no formulário público da landing (`StudyRequestForm.tsx`) e persistido em `study_requests`.

| Campo | Tipo | Obrigatório | Limite |
|-------|------|-------------|--------|
| `name` | TEXT | ✅ | 100 chars |
| `email` | TEXT | ✅ | 254 chars, lowercased, validado |
| `phone` | TEXT | — | 30 chars (WhatsApp BR) |
| `study_area` | TEXT | ✅ | slug da base — ex: `medicina-veterinaria`, `tecnologia` |
| `institution` | TEXT | — | 200 chars — opcional (universidade, curso) |
| `subject` | TEXT | ✅ | 200 chars — tema livre — ex: "Genética" |
| `goal` | TEXT | — | 500 chars — ex: "Passar na prova" |
| `description` | TEXT | ✅ | 5.000 chars — descrição livre |
| `marketing_consent` | BOOL | — | default false |
| **anexos** | binário | — | até 10 arquivos × 25 MiB cada |

**MIMEs aceitos** (whitelist em `backend/internal/domain/studyrequest/study_request.go:89`):

```
application/pdf
application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document   (DOC/DOCX)
application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet   (XLS/XLSX)
application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation  (PPT/PPTX)
text/plain, text/markdown, text/csv
image/png, image/jpeg, image/webp, image/gif
```

---

<a id="analise"></a>
## 3. Análise: o que a IA extrai do material

Pra cada material recebido, a IA produz um **dossiê estruturado** em JSON com:

```yaml
# Saída da fase de análise (entrada do gerador):
metadata:
  source_type: "pdf"               # pdf | docx | xlsx | pptx | image | text
  source_filename: "Aula 13 - Métodos de seleção e Testes.pdf"
  page_count: 12
  detected_language: "pt-BR"
  estimated_density: "low|medium|high"  # quantos conceitos por página
  contains_images: true
  contains_formulas: false
  contains_tables: true

topics:                             # tópicos discretos detectados
  - id: "metodos-selecao-unitario"
    title: "Método Unitário ou Tandem"
    summary: "Seleção que foca em 1 característica por vez"
    pages: [3, 4]
    importance: 0.9                # 0-1
    prerequisites_inferred: []
  - id: "metodos-selecao-niveis"
    title: "Níveis independentes de eliminação"
    summary: "..."
    pages: [5]
  - id: "metodos-selecao-indice"
    title: "Índice de Seleção"
    pages: [6, 7]

key_terms:                          # glossário extraído
  - term: "Tandem"
    definition: "Método de seleção sequencial focando em uma característica por vez"
  - term: "Índice de Seleção"
    definition: "Combina múltiplas características em um único score ponderado"

practical_examples:                 # exemplos detectados
  - context: "Bovinos de corte"
    situation: "Seleção pra ganho de peso (tandem)"
  
formulas_or_diagrams:               # imagens/fórmulas importantes
  - page: 4
    type: "diagram"
    description: "Comparação visual entre métodos de seleção"

target_audience_inferred:
  level: "graduate"                 # undergrad | graduate | professional
  prior_knowledge: ["Mendel", "genética básica"]
  course: "Genética e Melhoramento Animal"

learning_objectives:
  - "Diferenciar 3 métodos de seleção: Tandem, Níveis Independentes, Índice"
  - "Identificar vantagens/desvantagens de cada método"
  - "Aplicar conceito em cenários práticos de melhoramento animal"
```

---

<a id="decisao"></a>
## 4. Decisão: criar hub novo ou usar existente?

Antes de gerar conteúdo, a IA **consulta o catálogo da base** e decide:

```sql
-- Query que a IA roda (ou recebe de input) para descobrir o que já existe:
SELECT
  b.slug          AS base_slug,
  b.name          AS base_name,
  h.id            AS hub_id,
  h.slug          AS hub_slug,
  h.name          AS hub_name,
  h.tagline       AS hub_tagline,
  t.id            AS trail_id,
  t.slug          AS trail_slug,
  t.title         AS trail_title,
  ca.slug         AS module_slug,
  ca.title        AS module_title
FROM bases b
LEFT JOIN hubs h               ON h.base_slug = b.slug
LEFT JOIN trails t             ON t.hub_id = h.id
LEFT JOIN curriculum_articles ca ON ca.trail_id = t.id
WHERE b.slug = $1                 -- ex: 'medicina-veterinaria'
  AND ca.deleted_at IS NULL
ORDER BY h.position, t.pos, ca.pos;
```

A partir disso, a IA toma 1 das 3 decisões:

| Cenário | Decisão | Ação |
|---------|---------|------|
| Tema **encaixa em hub+trilha existente** | Adicionar módulo | Insert em `curriculum_articles` + `module_blocks` |
| Tema **encaixa em hub mas trilha nova** | Criar trilha | Insert em `trails` + module(s) |
| Tema **não encaixa em nenhum hub** | Criar hub | Insert em `hubs` + `trails` + module(s) |

**Heurística de matching:** embedding cosine similarity entre `subject` (input) e `hub.tagline + trail.title`. Threshold sugerido: ≥ 0.75 = encaixa.

---

<a id="tabelas"></a>
## 5. Tabelas do banco — schema completo que o pipeline popula

Migrations relevantes: `000023, 000029, 000055-000063`.

### 5.1 `bases` — base de conhecimento (raiz)

```sql
CREATE TABLE bases (
  slug          TEXT PRIMARY KEY,                  -- 'medicina-veterinaria'
  name          TEXT NOT NULL,                     -- 'Medicina Veterinária'
  area_label    TEXT,                              -- 'Genética · Reprodução · ...'
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'preview',   -- 'live' | 'preview' | 'draft'
  theme         JSONB,                             -- {primary, accent, mascot, ...}
  nav           JSONB,                             -- {hubNavItems[], footer{}, ...}
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**O pipeline NÃO cria bases novas automaticamente** — adição de base é decisão estratégica (mudaria nav/mascot/microcopy). Se `study_area` aponta pra base não-existente, a solicitação é rejeitada com aviso ao admin.

### 5.2 `hubs` — categorias dentro de uma base

```sql
CREATE TABLE hubs (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL,                     -- 'melhoramento'
  base_slug    TEXT NOT NULL REFERENCES bases(slug) ON DELETE CASCADE,
  name         TEXT NOT NULL,                     -- 'Melhoramento Genético'
  tagline      TEXT,                              -- frase curta de hero
  icon         TEXT,                              -- emoji ou ícone
  description  TEXT,
  position     INT NOT NULL DEFAULT 0,            -- ordem de exibição
  color_hex    TEXT,                              -- '#8a9b7e'
  status       TEXT NOT NULL DEFAULT 'live',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (base_slug, slug)                        -- slugs únicos por base
);
```

**Quando criar hub novo:**
```sql
INSERT INTO hubs (slug, base_slug, name, tagline, icon, description, position, color_hex)
VALUES (
  'genetica-aplicada',
  'medicina-veterinaria',
  'Genética Aplicada',
  'Da molécula ao rebanho — onde a teoria vira manejo.',
  '🧬',
  'Aplicações práticas de genética em medicina veterinária...',
  5,                                    -- após os 4 hubs existentes
  '#a07775'
)
ON CONFLICT (base_slug, slug) DO UPDATE
  SET name = EXCLUDED.name,
      tagline = EXCLUDED.tagline,
      updated_at = now();
```

### 5.3 `trails` — agrupamentos dentro do hub

```sql
CREATE TABLE trails (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT NOT NULL,                     -- 'metodos-selecao'
  hub_id       UUID NOT NULL REFERENCES hubs(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,                     -- 'Métodos de Seleção'
  tagline      TEXT,
  color        TEXT,
  href         TEXT,                              -- '/aprenda/...' opcional
  level        TEXT,                              -- 'beginner' | 'intermediate' | 'advanced'
  status       TEXT NOT NULL DEFAULT 'live',
  pos          INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (hub_id, slug)
);
```

### 5.4 `curriculum_articles` — módulos (1 artigo = 1 módulo navegável)

```sql
-- migration 000023 + extensões 000057
CREATE TABLE curriculum_articles (
  slug              TEXT PRIMARY KEY,                          -- 'metodos-selecao-genetica-vet'
  title             TEXT NOT NULL,
  content           TEXT,                                      -- legacy markdown (deprecated — use blocks)
  category          TEXT,                                      -- legacy
  published_at      TIMESTAMPTZ,
  deleted_at        TIMESTAMPTZ,                               -- soft delete
  -- 000057 estendeu:
  trail_id          UUID REFERENCES trails(id) ON DELETE SET NULL,
  hub_id            UUID REFERENCES hubs(id) ON DELETE SET NULL,
  keywords          TEXT[],
  seo_description   TEXT,
  external_url      TEXT,
  icon              TEXT,
  level             TEXT,
  pos               INT NOT NULL DEFAULT 0,
  estimated_min     INT,                                       -- tempo de leitura
  xp_reward         INT DEFAULT 30,                            -- 30-60 base
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

### 5.5 `module_blocks` — corpo do módulo (árvore JSONB)

```sql
-- migration 000029
CREATE TABLE module_blocks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_slug  TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
  parent_id     UUID REFERENCES module_blocks(id) ON DELETE CASCADE,  -- aninhamento até 3 níveis
  position      INT NOT NULL,                                          -- ordem dentro do parent
  block_type    TEXT NOT NULL,                                         -- ver lista §6
  block_data    JSONB NOT NULL,                                        -- props do componente React
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT module_blocks_type_valid CHECK (block_type IN (
    'section', 'paragraph', 'callout', 'code_block',
    'comparison_table', 'decision_box', 'flow_diagram',
    'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
    'node_graph', 'annotated_formula', 'quiz', 'image'
  ))
);
```

### 5.6 `module_quizzes` + `module_quiz_attempts` — quiz com SM-2

```sql
-- migration 000061
CREATE TABLE module_quizzes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug     TEXT NOT NULL REFERENCES curriculum_articles(slug) ON DELETE CASCADE,
  stem            TEXT NOT NULL,                       -- enunciado
  options         JSONB NOT NULL,                      -- [{id:'a', text:'...'}, ...]
  correct_id      TEXT NOT NULL,                       -- 'b'
  explanation     TEXT NOT NULL,
  difficulty      TEXT NOT NULL DEFAULT 'medium',      -- easy | medium | hard
  position        INT NOT NULL DEFAULT 0
);

-- migration 000062 — estado SRS por user
CREATE TABLE module_quiz_attempts (
  user_id         TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  quiz_id         UUID NOT NULL REFERENCES module_quizzes(id) ON DELETE CASCADE,
  ease_factor     REAL NOT NULL DEFAULT 2.5,
  interval_days   INT NOT NULL DEFAULT 0,
  repetitions     INT NOT NULL DEFAULT 0,
  next_review_at  TIMESTAMPTZ,
  last_answer     TEXT,
  last_correct    BOOLEAN,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, quiz_id)
);
```

### 5.7 Relações resumidas

```
bases (1) ─┬─ hubs (N) ─┬─ trails (N) ─┬─ curriculum_articles (N) ─┬─ module_blocks (N, árvore)
           │            │              │                            └─ module_quizzes (N)
           │            │              │
   FK: base_slug   FK: hub_id    FK: trail_id
```

---

<a id="blocos"></a>
## 6. Tipos de bloco suportados

Cada `block_type` mapeia 1:1 a um componente React em `frontend/src/components/article/primitives.tsx`. **A IA pode usar qualquer um.**

| `block_type` | Componente React | Quando usar |
|--------------|------------------|-------------|
| `section` | `<Section>` | Container raiz — agrupa parágrafos + callouts + diagramas relacionados |
| `paragraph` | `<p>` com inline marks | Texto corrido (bold, italic, link via marks) |
| `callout` | `<Callout tone="info/warning/highlight/note">` | Destaque pra "atenção" ou "armadilha comum" |
| `code_block` | `<CodeBlock>` (Shiki highlight) | Código (raro em medicina veterinária) |
| `comparison_table` | `<ComparisonTable>` | Tabela X vs Y vs Z — desktop tabular, mobile cards |
| `decision_box` | `<DecisionBox>` | "Quando usar A?" → árvore de decisão simples |
| `flow_diagram` | `<FlowDiagram>` | Fluxo sequencial (A → B → C) |
| `arch_flow` | `<ArchFlow>` | Arquitetura em camadas (frontend → API → DB) |
| `matrix_diagram` | `<MatrixDiagram>` | Matriz 2×2 ou 3×3 (ex: Punnett square em genética!) |
| `stack_flow` | `<StackFlow>` | Empilhamento vertical com ícones |
| `timeline` | `<Timeline>` | Linha do tempo histórica |
| `node_graph` | `<NodeGraph>` | Grafo com nodes + edges (relações entre genes, etc) |
| `annotated_formula` | `<AnnotatedFormula>` | Fórmula matemática com explicações por símbolo |
| `quiz` | `<QuizBlock>` | **NÃO usar aqui** — use tabela `module_quizzes` |
| `image` | `<NextImage>` | Imagem com legenda — URL em block_data |

### Exemplo de `block_data` para `comparison_table`:

```json
{
  "caption": "Métodos de seleção em melhoramento animal",
  "headers": ["Método", "Características", "Vantagem", "Desvantagem"],
  "rows": [
    ["Tandem", "1 por vez", "Máximo progresso genético", "Caro"],
    ["Níveis independentes", "Várias com mínimos", "Rápido e barato", "Descarta animais superiores"],
    ["Índice de seleção", "Todas ponderadas", "Mais correto", "Não usado no Brasil"]
  ]
}
```

### Exemplo de `block_data` para `callout`:

```json
{
  "tone": "warning",
  "title": "Armadilha comum",
  "body": "O método tandem maximiza o ganho na característica selecionada, MAS pode regredir em outras. Em rebanho leiteiro, focar só em produção pode comprometer fertilidade ao longo das gerações."
}
```

---

<a id="prompt"></a>
## 7. Prompt master pra IA

Esse é o prompt que o admin alimenta com o ZIP da solicitação. Cole esse texto inteiro + o conteúdo do PDF (extraído como texto) + `solicitacao.json`.

> Salvo separado em `docs/prompts/MASTER_GENERATE_MODULE.md` pra reuso.

```text
Você é um curador pedagógico do FFV Academy. Sua tarefa é transformar o material
enviado pelo cliente em UM MÓDULO COMPLETO de estudo no formato canônico da
plataforma, pronto para importar no banco de dados PostgreSQL.

═══════════════════════════════════════════════════════════════════════════
CONTEXTO DA SOLICITAÇÃO
═══════════════════════════════════════════════════════════════════════════

Estudante: {{name}}
Email: {{email}}
Área (base): {{studyArea}}
Tema: {{subject}}
Objetivo: {{goal}}
Descrição livre: {{description}}

Anexos:
{{#each attachments}}
- {{fileName}} ({{contentType}}, {{sizeBytes}} bytes)
{{/each}}

═══════════════════════════════════════════════════════════════════════════
CATÁLOGO ATUAL DA BASE (resultado da query da seção 4)
═══════════════════════════════════════════════════════════════════════════

{{db_catalog_for_base}}

═══════════════════════════════════════════════════════════════════════════
CONTEÚDO DO MATERIAL
═══════════════════════════════════════════════════════════════════════════

{{pdf_text_extracted}}

═══════════════════════════════════════════════════════════════════════════
SUA TAREFA — EM 5 FASES
═══════════════════════════════════════════════════════════════════════════

FASE 1 — ANÁLISE
─────────────────
Identifique:
- Quais conceitos discretos o material cobre (tópicos)
- Qual o nível pedagógico (graduação, especialização, profissional)
- Pré-requisitos implícitos (o que o aluno PRECISA saber antes)
- Termos-chave que merecem entrar no glossário
- Exemplos práticos mencionados
- Imagens/diagramas/fórmulas relevantes

FASE 2 — DECISÃO DE ESTRUTURA
──────────────────────────────
Olhe o catálogo da base e responda:

a) Existe HUB que encaixa o tema? Se sim → use o hub existente. Se não →
   proponha hub novo com slug, name, tagline, icon, color_hex.

b) Existe TRILHA dentro desse hub que encaixa? Se sim → use. Se não →
   proponha trilha nova com slug, title, tagline, level.

c) O conteúdo cabe em UM módulo (12-20 min de leitura) ou precisa de 2-3
   módulos sequenciais? Justifique.

FASE 3 — ESBOÇO DO MÓDULO
──────────────────────────
Para cada módulo proposto, produza:
- slug (kebab-case, descritivo, único na base — verifique no catálogo)
- title
- summary (1 frase explicando o que o aluno vai aprender)
- icon (1 emoji)
- estimated_min (tempo realista pra leitura + quiz)
- xp_reward (30 = fácil, 45 = médio, 60 = denso)
- level (beginner | intermediate | advanced)
- pos (posição na trilha — incrementa do último existente)
- keywords (5-10 palavras pra SEO/busca)
- seo_description (155 chars max)

FASE 4 — CORPO DO MÓDULO (blocks)
──────────────────────────────────
Estruture seguindo o padrão pedagógico FFV:

1. INTRO (1 section + 1-2 paragraph)
   "Por que isso importa? Qual problema resolve?"

2. CONCEITOS (N sections, cada uma com:
   - 1-3 paragraph explicando o conceito
   - 1 callout (info|warning|highlight) com a "sacada" ou armadilha
   - opcional: comparison_table OU matrix_diagram OU flow_diagram
)

3. EXEMPLOS PRÁTICOS (1-2 sections)
   Aplicação real no contexto da área (ex: medicina-vet → "em rebanho leiteiro...")

4. RESUMO (1 section com paragraph compacto)
   3-5 bullets do que levar embora

Use TIPOS DE BLOCO da seção 6 deste pipeline. Aninhe parágrafos/callouts
dentro de sections via parent_id (limite 3 níveis).

FASE 5 — QUIZ
──────────────
Gere 5-10 questões inseridas em `module_quizzes`:
- stem (enunciado claro, contextual — não decoreba)
- options (4 alternativas em formato [{"id":"a","text":"..."}, ...])
- correct_id (id da correta)
- explanation (POR QUE a correta está certa E por que cada errada está
  errada — esse texto aparece pro aluno depois de responder)
- difficulty (easy|medium|hard)
- position (ordem)

Mix de dificuldades: ~30% easy, ~50% medium, ~20% hard.
Toda questão deve testar APLICAÇÃO, não memorização.

═══════════════════════════════════════════════════════════════════════════
FORMATO DE SAÍDA — JSON ESTRUTURADO
═══════════════════════════════════════════════════════════════════════════

Devolva UM JSON com 3 seções:

{
  "decision": {
    "create_hub": false,
    "create_trail": true,
    "module_count": 1,
    "rationale": "..."
  },

  "seeds": {
    "hubs": [],         // array de hubs novos (ou vazio se reusou)
    "trails": [...],    // array de trilhas novas
    "articles": [       // array de módulos (1 ou mais)
      {
        "slug": "...",
        "title": "...",
        "summary": "...",
        "icon": "🧬",
        "estimated_min": 15,
        "xp_reward": 45,
        "level": "intermediate",
        "pos": 3,
        "keywords": ["...", "..."],
        "seo_description": "...",
        "blocks": [
          {
            "type": "section",
            "position": 0,
            "data": { "title": "Introdução: por que selecionar?" },
            "children": [
              {
                "type": "paragraph",
                "position": 0,
                "data": { "text": "..." }
              },
              { "type": "callout", "position": 1, "data": {...} }
            ]
          },
          // ... mais sections
        ],
        "quizzes": [
          {
            "stem": "...",
            "options": [{"id":"a","text":"..."}, ...],
            "correct_id": "b",
            "explanation": "...",
            "difficulty": "medium",
            "position": 0
          }
        ]
      }
    ]
  },

  "validation_checklist": {
    "all_block_types_valid": true,
    "all_slugs_unique": true,
    "quiz_count_per_module": [7],
    "estimated_total_min": 15,
    "warnings": []
  }
}

═══════════════════════════════════════════════════════════════════════════
REGRAS HARD
═══════════════════════════════════════════════════════════════════════════

1. PT-BR formal mas humano. Sem "olá aluno" — escreva como quem ensina.
2. Zero markdown direto — TUDO via blocks. `paragraph.data.text` é texto puro.
3. Slug do módulo NUNCA repete na base inteira — verifique catálogo.
4. Quiz sempre tem 4 alternativas (a, b, c, d). Nunca 2 ou 5.
5. NÃO invente fatos. Se o material não disser X, não afirme X.
   Se algo precisar de pesquisa adicional, sinalize em `validation_checklist.warnings`.
6. Imagens/fórmulas: extraia descrição em texto. Se o PDF tem diagrama em
   página N, descreva o que está nele e proponha um `matrix_diagram` ou
   `flow_diagram` equivalente.
7. Toda question explanation tem que ensinar — não só dizer "alternativa b está correta".

═══════════════════════════════════════════════════════════════════════════
EXEMPLO DE BLOCO BEM FORMATADO
═══════════════════════════════════════════════════════════════════════════

{
  "type": "section",
  "position": 1,
  "data": { "title": "Método Tandem (Unitário)" },
  "children": [
    {
      "type": "paragraph",
      "position": 0,
      "data": {
        "text": "O método tandem foca em UMA característica por vez. Selecionamos animais com o melhor desempenho naquela característica até atingir o nível desejado — depois passamos pra próxima."
      }
    },
    {
      "type": "callout",
      "position": 1,
      "data": {
        "tone": "warning",
        "title": "Trade-off econômico",
        "body": "Tandem maximiza ganho na característica selecionada, mas é CARO: cada geração trabalha em uma só característica, então melhorar 4 critérios pode levar 8-12 anos em bovinos."
      }
    },
    {
      "type": "comparison_table",
      "position": 2,
      "data": {
        "caption": "Tandem vs alternativas",
        "headers": ["Critério", "Tandem", "Níveis Independentes", "Índice"],
        "rows": [
          ["Características simultâneas", "1", "Várias com mínimos", "Todas, ponderadas"],
          ["Velocidade", "Lenta", "Rápida", "Rápida"],
          ["Custo", "Alto", "Baixo", "Médio"],
          ["Risco de regressão", "Alto", "Médio", "Baixo"]
        ]
      }
    }
  ]
}
```

---

<a id="validacoes-pre"></a>
## 8. Validações pré-import

Antes de rodar o importer, valide o JSON gerado pela IA. Idealmente via script Node ou Go.

### 8.1 Checklist hard (fail-fast)

```bash
# 1. JSON é válido
jq . < generated.json > /dev/null || echo "❌ JSON inválido"

# 2. Slugs únicos
jq '.seeds.articles | map(.slug) | length == (unique | length)' generated.json

# 3. block_type permitido (validar contra a lista de §6)
jq '.seeds.articles[].blocks | flatten | map(.type) | unique' generated.json

# 4. Quizzes têm exatamente 4 opções
jq '.seeds.articles[].quizzes[].options | length == 4' generated.json

# 5. correct_id existe em options
# (requer script — não dá pra fazer só com jq)
```

### 8.2 Validações soft (warnings)

- Cada módulo tem 5-10 quizzes
- `estimated_min` entre 8 e 30
- `xp_reward` entre 20 e 80
- Cada seção tem pelo menos 1 paragraph
- Existem pelo menos 2 callouts no módulo inteiro
- Mix de difficulty: pelo menos 1 easy e 1 hard

---

<a id="importer"></a>
## 9. Importer Go — como rodar

O importer existente em `backend/cmd/importer/main.go` consome arquivos JSON e popula `curriculum_articles` + `module_blocks`. Vamos estendê-lo pra também processar **hubs/trails/quizzes** se vierem no JSON.

### 9.1 Localização dos seeds

```
scripts/seeds/
├── hubs.json                    # mirror do CURRICULUM (todos os hubs)
├── trails.json                  # mirror das trilhas
├── articles/
│   ├── metodos-selecao-genetica-vet.json   ← gerado pra Lara
│   └── ...
└── quizzes/
    └── metodos-selecao-genetica-vet.json   ← gerado pra Lara (opcional separado)
```

### 9.2 Comando

```bash
# Dev local:
cd backend
DATABASE_URL=postgres://ffv:ffv@localhost:5432/ffv_dev?sslmode=disable \
  go run ./cmd/importer --seeds=../scripts/seeds --verbose

# Produção (na VPS):
docker compose -f /opt/ffv/docker-compose.prod.yml exec api \
  /api --import-seeds=/app/scripts/seeds
```

### 9.3 Idempotência

O importer faz UPSERT em todas as tabelas — você pode rodar quantas vezes quiser sem duplicar. Detalhes:

- `hubs`: `INSERT ... ON CONFLICT (base_slug, slug) DO UPDATE`
- `trails`: `INSERT ... ON CONFLICT (hub_id, slug) DO UPDATE`
- `curriculum_articles`: `INSERT ... ON CONFLICT (slug) DO UPDATE`
- `module_blocks`: `DELETE FROM module_blocks WHERE article_slug = $1` + `INSERT` (recria árvore)
- `module_quizzes`: `INSERT ... ON CONFLICT (id) DO UPDATE` (id estável via UUID v5 do `module_slug + position`)

---

<a id="validacoes-pos"></a>
## 10. Validações pós-import

Depois do importer rodar com sucesso, valide no DB:

```sql
-- 1. Módulo apareceu?
SELECT slug, title, trail_id, xp_reward, estimated_min
FROM curriculum_articles
WHERE slug = 'metodos-selecao-genetica-vet';

-- 2. Blocos foram gravados?
SELECT block_type, COUNT(*) AS qtd
FROM module_blocks
WHERE article_slug = 'metodos-selecao-genetica-vet'
GROUP BY block_type
ORDER BY qtd DESC;

-- 3. Árvore está bem-formada?
WITH RECURSIVE tree AS (
  SELECT id, parent_id, block_type, position, 1 AS depth
  FROM module_blocks
  WHERE article_slug = 'metodos-selecao-genetica-vet' AND parent_id IS NULL
  UNION ALL
  SELECT b.id, b.parent_id, b.block_type, b.position, t.depth + 1
  FROM module_blocks b
  JOIN tree t ON b.parent_id = t.id
)
SELECT MAX(depth) AS profundidade_max FROM tree;
-- Esperado: ≤ 3 (limite da camada de aplicação)

-- 4. Quizzes foram criados?
SELECT difficulty, COUNT(*) AS qtd
FROM module_quizzes
WHERE module_slug = 'metodos-selecao-genetica-vet'
GROUP BY difficulty;
-- Esperado: 5-10 total, mix de difficulties

-- 5. URL navegável?
-- Frontend resolve via getBaseSlugForModule(slug) → trilha → hub → base.
-- Testar: curl https://api.fernandofrancovalle.com/api/v1/curriculum/metodos-selecao-genetica-vet
```

### 10.1 Smoke test visual

1. Abre `https://fernandofrancovalle.com/aprenda/<slug-do-modulo>`
2. Confere que:
   - Header mostra cor da base medicina-veterinária (sage green)
   - Mascote correto da base
   - Breadcrumb: `Medicina Veterinária / Melhoramento / Métodos de Seleção`
   - TOC sticky com seções
   - Quiz aparece no fim
   - Quiz registra no SRS quando responder

---

<a id="caso-lara"></a>
## 11. Caso de uso completo: Lara — Genética Vet

Aplicando esse pipeline ao caso real da solicitação `72b23dd7-1a40-4a01-afc5-086bd009192b`:

### 11.1 Decisão de estrutura

| Pergunta | Resposta |
|----------|----------|
| Base já existe? | ✅ `medicina-veterinaria` (live) |
| Hub encaixa? | ✅ `melhoramento` (já tem 2 módulos: introdução + endogamia) |
| Trilha existe? | ⚠️ Trilha única `genetica-medicina-veterinaria` ainda monolítica — recomendo criar trilha nova `metodos-selecao-melhoramento` ou adicionar ao existente |
| Módulo já existe? | ❌ Não existe módulo de "Métodos de Seleção" |

### 11.2 Decisão final

**Criar 1 novo módulo no hub `melhoramento`**:

```yaml
hub_slug: melhoramento                          # já existe — reusar
trail_slug: metodos-selecao-melhoramento        # criar nova trilha dedicada
module:
  slug: metodos-de-selecao-em-melhoramento-animal
  title: "Métodos de Seleção em Melhoramento Animal"
  icon: "🎯"
  level: intermediate
  estimated_min: 18
  xp_reward: 45
  pos: 3                                        # depois dos 2 existentes
```

### 11.3 Estrutura do módulo (baseado nas 5 páginas do PDF)

```
section: "Por que precisamos escolher um método?"
  paragraph: contexto — múltiplas características importantes em rebanho
  callout(info): "O dilema do melhorista"

section: "Método 1: Unitário ou Tandem"
  paragraph: definição
  callout(warning): trade-off custo vs progresso
  comparison_table: vantagens vs desvantagens

section: "Método 2: Níveis Independentes de Eliminação"
  paragraph: como funciona — múltiplos mínimos simultâneos
  paragraph: por que é mais rápido e barato
  callout(warning): "Pode descartar animais geneticamente superiores"

section: "Método 3: Índice de Seleção"
  paragraph: combinação ponderada — definição
  callout(highlight): "Tecnicamente o mais correto"
  callout(note): "Por que não é usado no Brasil"

section: "Comparativo Final"
  comparison_table: 3 métodos × 4 critérios
  decision_box: "Como escolher na prática?"

section: "Resumo"
  paragraph: 4 bullets do que levar embora

quizzes (7):
  1. easy   — Definição de tandem
  2. medium — Identificar o método dado um cenário
  3. medium — Vantagem do índice de seleção
  4. hard   — Caso prático: rebanho leiteiro com 4 critérios
  5. easy   — Por que níveis independentes é mais barato
  6. medium — Identificar desvantagem do índice (no Brasil)
  7. hard   — Cenário onde tandem é a melhor escolha
```

### 11.4 Comandos de execução

```bash
# 1. Admin baixa o ZIP (ja feito):
#    /Users/fernandofranco/Downloads/solicitacao-72b23dd7-2/

# 2. Admin alimenta a IA local com:
#    - O texto do PDF (extraído via pdftotext ou similar)
#    - solicitacao.json
#    - Catálogo da base (query SQL da §4)
#    - PROMPT MASTER (§7 deste doc)

# 3. IA devolve generated.json — admin salva em:
mv generated.json scripts/seeds/articles/metodos-de-selecao-em-melhoramento-animal.json

# 4. Validação:
node scripts/validate-seed.mjs scripts/seeds/articles/metodos-de-selecao-em-melhoramento-animal.json

# 5. Import local pra teste:
cd backend
DATABASE_URL=postgres://ffv:ffv@localhost:5432/ffv_dev?sslmode=disable \
  go run ./cmd/importer --seeds=../scripts/seeds --verbose

# 6. Smoke local:
open http://localhost:3000/aprenda/metodos-de-selecao-em-melhoramento-animal

# 7. Se OK, commit + push:
git add scripts/seeds/articles/metodos-de-selecao-em-melhoramento-animal.json
git commit -m "feat(curriculum): módulo Métodos de Seleção em Genética Vet"
git push origin main

# 8. Deploy automático aplica o seed em produção via CI/CD.

# 9. Admin retorna ao /admin/study-requests/{lara-id}:
#    - Cola URL: https://fernandofrancovalle.com/aprenda/metodos-de-selecao-em-melhoramento-animal
#    - Clica "🎉 Finalizar + enviar email com link"
#    - Lara recebe email celebrativo.
```

---

<a id="simulado-100q"></a>
## 12. ⭐ Padrão obrigatório: 100 questões por hub

> **Decisão fixa do PO (mai/2026):** toda base de conhecimento gerada DEVE ter um simulado de **100 questões** cobrindo o hub/trilha principal — não é opcional, faz parte da entrega mínima.

### 12.1 Por quê

O simulado de 100 questões é o que SEPARA uma base "de verdade" de uma "vitrine". Quem estuda os 8-16 módulos da trilha precisa de:

1. **Aferição real do que aprendeu** — quiz inline de cada módulo (5-8 questões) é insuficiente pra simular prova.
2. **Revisão cross-módulo** — só simulado tipo prova testa transferência entre conceitos de módulos diferentes.
3. **Sensação de "graduação"** — 70% de acerto em 100 questões vira certificado emocional concreto.
4. **Conteúdo evergreen** — simulado bem feito é o ativo mais reutilizado da base (gera ranking, cards SRS, segunda passada antes de prova real).

Existem 2 referências internas vivas que SEGUEM o padrão:
- `frontend/src/lib/bases/medvet/simulado-genetica.ts` (16 módulos · 100q)
- `frontend/src/lib/bases/neurociencia/simulado-neuromarketing.ts` (8 módulos · 100q)

### 12.2 Distribuição obrigatória

| Item | Regra |
|------|-------|
| **Total** | **100 questões EXATAS** — nem 95, nem 110. 100. |
| **Por hub** | Distribuir proporcionalmente: 4 hubs = 25 cada; 5 hubs = 20 cada; etc. |
| **Por módulo dentro do hub** | Distribuir proporcionalmente aos módulos. Hub de 2 módulos = ~12-13 questões/módulo. |
| **Difficulty mix** | ~25% easy · ~50% medium · ~25% hard. **Nunca** 100% easy ou 100% hard. |
| **Sem timer** | UX da plataforma é estudo, não corrida — sem cronômetro. |
| **Passing score** | 70% (70/100 corretas) como padrão. |
| **Tempo estimado** | ~180 min (1,8 min/questão em média). |

### 12.3 Schema obrigatório de cada questão

```ts
interface SimuladoQuestion {
  id: string;                // 'q001', 'q002', ..., 'q100' — zero-padded, sequencial
  question: string;          // Enunciado completo. SEM markdown, SEM markup HTML.
  options: string[];         // SEMPRE 4 alternativas. Nunca 2, nunca 5.
  correct: number;           // Índice 0-3 da correta.
  explanation: string;       // OBRIGATÓRIO — explica POR QUE a correta está certa
                             //   E por que cada uma das erradas está errada.
                             //   Esse texto vira o "ensinamento" pós-resposta.
  topic: string;             // Tópico/módulo de origem (pra heatmap de fraquezas).
  difficulty: 'easy' | 'medium' | 'hard';
  hint?: string;             // Opcional MAS RECOMENDADO — aponta o conceito
                             //   sem entregar a resposta. Usuário pode "pedir dica".
}
```

### 12.4 Regras hard sobre conteúdo das questões

1. **APLICAÇÃO, não decoreba.** Toda questão testa ENTENDIMENTO — não memorização de definição.
   - ❌ "O que significa a sigla LTV?"
   - ✅ "Uma marca tem CAC R$ 50 e LTV R$ 200. Qual a interpretação correta dessa razão 1:4 pra decisão de investimento em marketing?"

2. **Cenários reais.** Use casos do dia a dia da disciplina (vacas leiteiras, anúncio de Black Friday, pricing de SaaS, embalagem na prateleira).

3. **Distratores plausíveis.** Cada alternativa errada deve ser uma confusão CRÍVEL, não absurdo óbvio.
   - ❌ "A) Plutão · B) Cérebro Reptiliano · C) Vermelho · D) Quesadilha"
   - ✅ Quatro respostas que um estudante razoável poderia confundir, todas no campo conceitual da pergunta.

4. **Explanation pedagógica.** A explicação NÃO É "alternativa B está correta". Ela DEVE:
   - Explicar POR QUE a correta está certa (mecanismo, princípio, autor original).
   - Explicar POR QUE as outras estão erradas (qual confusão típica cada uma representa).
   - Fornecer 1 reference acadêmica quando aplicável (Kahneman 2011, Cialdini 1984, etc.).

5. **Hint útil.** Quando incluir hint, ela aponta o CAMINHO (qual princípio aplicar, qual estrutura cerebral pensar) sem dar a resposta literal.

### 12.5 Arquivo e estrutura

```
frontend/src/lib/bases/<base-slug>/simulado-<topico>.ts
```

Exporta:
- `SIMULADO_<TOPICO>: SimuladoQuestion[]` (array de 100)
- `SIMULADO_META = { title, description, totalQuestions: 100, passingScore: 70, estimatedMinutes: 180 }`

Página: `frontend/src/app/<base-slug>/simulado-<topico>/page.tsx` (usa `<SimuladoRunner>`).

### 12.6 Wiring obrigatório no BaseConfig

No `frontend/src/lib/bases/registry.ts`, a base DEVE declarar:

```ts
const <BASE>_CONFIG: BaseConfig = {
  // ... outros campos ...
  nav: {
    hubNavItems: [
      { href: '/<base>/simulado-<topico>', label: 'Simulado', color: '...', iconName: 'target' },
    ],
    hideGlobalContentNav: true,
  },
  footer: {
    // ... mobilePrimary inclui o simulado ...
    mobilePrimary: [
      { label: 'Trilha',   href: '/<base>' },
      { label: 'Simulado', href: '/<base>/simulado-<topico>' },
      { label: 'Progresso', href: '/progresso' },
      { label: 'Revisar',  href: '/revisar' },
    ],
  },
  simulados: [
    {
      slug: 'simulado-<topico>',
      title: 'Simulado 100 questões de <Tópico>',
      href: '/<base>/simulado-<topico>',
    },
  ],
};
```

E na home da base (`src/app/<base>/page.tsx`), o CTA secundário do hero é "Simulado 100 questões":

```tsx
ctas: [
  { href: firstModuleHref, label: 'Começar pelo módulo 01 →', variant: 'primary' },
  { href: '/<base>/simulado-<topico>', label: 'Simulado 100 questões', variant: 'secondary' },
],
stats: [
  { value: `${TOTAL_MODULES}`, label: 'módulos' },
  { value: '100', label: 'questões' },        // ⭐ DESTACAR o simulado
  { value: `${TOTAL_HUBS}`, label: 'hubs' },
  { value: 'R$ 0', label: 'custo' },
],
```

### 12.7 Checklist de aceite

Antes de fechar PR com nova base:

- [ ] Arquivo `simulado-<topico>.ts` com exatamente 100 questões
- [ ] Mix de difficulty: pelo menos 20 easy, 40-60 medium, 20+ hard
- [ ] Distribuição proporcional por hub/módulo (sem hub negligenciado)
- [ ] Toda questão tem `explanation` que ENSINA (não só "é B")
- [ ] Pelo menos 80% das questões têm `hint` opcional
- [ ] Cada questão tem 4 alternativas, `correct` apontando pra índice válido
- [ ] Distratores plausíveis (não absurdos óbvios)
- [ ] Página `app/<base>/simulado-<topico>/page.tsx` registrada
- [ ] `BaseConfig.nav.hubNavItems` aponta pro simulado
- [ ] `BaseConfig.simulados[]` declara entry
- [ ] Home da base mostra CTA "Simulado 100 questões" + stat "100 questões"

### 12.8 Volume real esperado

Pra cada base nova, a IA + curadoria humana entrega:
- 8-16 módulos com 5-8 quizzes inline (total: ~80-130 quizzes inline)
- **+** 1 simulado de 100 questões cobrindo todos os hubs
- **= 180-230 questões** por base na entrega mínima

É volume substancial. Por isso a geração é em ondas:
1. **Onda 1 (1-2 dias):** módulos + quizzes inline + 100q do simulado
2. **Onda 2 (1 semana depois):** revisão pedagógica + correções
3. **Onda 3 (1 mês depois):** expansão pra simulados por hub se demanda justificar

---

## 📎 Apêndices

### A. Onde estão os arquivos relevantes

| Caminho | O que é |
|---------|---------|
| `backend/internal/domain/studyrequest/study_request.go` | Domain — invariantes da solicitação |
| `backend/internal/interfaces/http/handlers/study_request_admin_handler.go` | Handler admin (ZIP + workflow) |
| `backend/cmd/importer/main.go` | Importer Go que consome seeds |
| `backend/migrations/000023, 000029, 000055-000063` | Schema de currículo DB-driven |
| `scripts/seeds/hubs.json` + `trails.json` | Mirror canônico do CURRICULUM |
| `scripts/seeds/articles/*.json` | Módulos (1 por arquivo) |
| `frontend/src/lib/bases/medvet/` | Base TS fallback enquanto migration completa |
| `frontend/src/components/article/primitives.tsx` | Componentes React 1:1 com block_types |
| `docs/PIPELINE_GERACAO_CONTEUDO.md` | **Este documento** |

### B. Pendências conhecidas

- ❌ `cmd/migrate-uploads-to-s3` não implementado (RUNBOOK §8)
- ❌ Validador de seeds Node script não existe — criar `scripts/validate-seed.mjs`
- ❌ Importer atual não cria trilhas/hubs novos automaticamente — só `curriculum_articles` + `module_blocks`. Extensão necessária pra suportar pipeline completo.
- ⚠️ medvet ainda é frontend-only — primeira execução desse pipeline força migration completa pra DB

### C. Próximos passos recomendados

1. **Extender importer** pra ler `hubs.json`/`trails.json` adicionais (não só artigos)
2. **Migrar medvet pra DB**: gerar seeds dos 12 módulos atuais + migrar para `curriculum_articles`
3. **Criar `scripts/validate-seed.mjs`** com as validações da §8
4. **Automatizar a query da §4** num endpoint `GET /api/v1/admin/catalog/:base_slug` pra o admin alimentar a IA mais fácil
5. **Template de prompt em arquivo separado**: `docs/prompts/MASTER_GENERATE_MODULE.md`

---

**Versão:** 1.0 (mai/2026)
**Autor:** FFV Engineering
**Status:** 🟢 Pronto para uso operacional
