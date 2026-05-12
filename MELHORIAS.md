# MELHORIAS.md — Roadmap Pedagógico + Visual do FFV Academy

> Documento de referência para deixar o sistema de aprendizado **incrivelmente bom**. Escrito pela perspectiva combinada de engenheiro de software sênior + psicólogo educacional. Cada item tem impacto estimado, esforço, e critério de aceitação.

---

## 1. PROBLEMA VISUAL CRÍTICO — ArchDiagram com ASCII Art

### O problema
O componente `ArchDiagram` (em `src/components/article/primitives.tsx`, linhas 194–224) renderiza conteúdo dentro de uma tag `<pre>` com fonte monoespaçada. Isso era aceitável para fluxos simples, mas **46 artigos** usam ArchDiagram com caracteres de box-drawing Unicode (┌─┐│└─┘) para criar diagramas de hierarquia, fluxo e arquitetura.

**Em browser real ficou comprovado:** o visual é ruim. Caracteres de box-drawing têm alinhamento frágil, renderização varia entre fontes, e a experiência não condiz com um site de ensino premium com Tailwind e componentes React completos.

### Solução: nova família de componentes visuais

Criar componentes CSS/React que substituam os casos de uso mais comuns do ArchDiagram ASCII. Estes componentes ficam em `src/components/article/primitives.tsx` ao lado dos existentes.

---

#### Componente 1: `HierarchyDiagram` — caixas aninhadas

**Substitui:** diagramas de hierarquia como "IA > ML > Deep Learning > LLMs"

```tsx
// Uso:
<HierarchyDiagram
  accent={accent}
  levels={[
    {
      label: 'INTELIGÊNCIA ARTIFICIAL',
      desc: 'Sistemas que realizam tarefas inteligentes',
      color: '#58a6ff',
    },
    {
      label: 'MACHINE LEARNING',
      desc: 'Sistemas que aprendem a partir de dados',
      color: '#58a6ff',
    },
    {
      label: 'DEEP LEARNING',
      desc: 'ML com redes neurais profundas',
      color: '#58a6ff',
    },
    {
      label: 'LLMs',
      desc: 'Deep Learning em texto massivo',
      color: '#58a6ff',
    },
  ]}
/>
```

**Implementação visual:** caixas CSS nested com `padding` crescente e `border` colorida. Efeito de "matryoshka" visual. Fundo `--ffv-bg2` com gradiente sutil.

---

#### Componente 2: `FlowDiagram` — setas A → B → C

**Substitui:** diagramas de pipeline e fluxo sequencial

```tsx
// Uso:
<FlowDiagram
  accent={accent}
  steps={[
    { icon: '📥', label: 'Input', desc: 'Texto do usuário' },
    { icon: '🔢', label: 'Tokenização', desc: 'Texto → IDs numéricos' },
    { icon: '🧠', label: 'Forward Pass', desc: 'Transformer processa' },
    { icon: '📤', label: 'Output', desc: 'Probabilidades por token' },
  ]}
  // orientation?: 'horizontal' | 'vertical'  (default: horizontal)
/>
```

**Implementação visual:** caixas com `flex-row` e setas CSS (`::after` com border-trick ou SVG inline). Responsivo: colapsa para vertical em mobile.

---

#### Componente 3: `ComparisonFlow` — dois fluxos paralelos com rótulo

**Substitui:** "Programação Tradicional vs ML" — dois blocos lado a lado com setas

```tsx
// Uso:
<ComparisonFlow
  accent={accent}
  left={{
    label: 'PROGRAMAÇÃO TRADICIONAL',
    steps: ['REGRAS (humano escreve)', 'DADOS', 'RESULTADO'],
  }}
  right={{
    label: 'MACHINE LEARNING',
    steps: ['DADOS', 'RESULTADOS (esperados)', 'REGRAS (modelo aprende)'],
  }}
/>
```

---

#### Componente 4: `MatrixDiagram` — tabela de atenção / scores

**Substitui:** diagramas de atenção Q/K/V e matrizes de softmax do artigo de Transformers

```tsx
// Uso:
<MatrixDiagram
  accent={accent}
  title="Attention Weights após softmax"
  rowLabels={['O', 'gato', 'sentou']}
  colLabels={['O', 'gato', 'sentou']}
  data={[
    [1.00, 0.00, 0.00],
    [0.29, 0.71, 0.00],
    [0.05, 0.60, 0.35],
  ]}
  highlightThreshold={0.5}  // células acima disso ficam com fundo colorido
/>
```

**Implementação:** grid CSS com células coloridas por intensidade usando `color-mix(in srgb, accent N%, transparent)`.

---

#### Componente 5: `ArchFlow` — diagrama de arquitetura multi-layer

**Substitui:** diagramas de encoder/decoder do Transformer, RAG pipeline, etc.

```tsx
// Uso:
<ArchFlow
  accent={accent}
  title="Encoder-only vs Decoder-only vs Encoder-Decoder"
  columns={[
    {
      header: 'ENCODER-ONLY',
      headerColor: '#58a6ff',
      items: ['Self-Attention BIDIRECIONAL', 'Vê tokens passados e futuros', ''],
      footer: 'BERT, RoBERTa, Embeddings',
      useCases: ['Classificação', 'NER', 'Embeddings'],
    },
    {
      header: 'DECODER-ONLY',
      headerColor: '#d2a8ff',
      items: ['Masked Self-Attention', 'CAUSAL (só passado ←)', ''],
      footer: 'GPT, Claude, Llama',
      useCases: ['Geração de texto', 'Chat', 'Código'],
    },
    {
      header: 'ENCODER-DECODER',
      headerColor: '#3fb950',
      items: ['Encoder: bidirecional', 'Decoder: causal', 'Cross-Attention entre os dois'],
      footer: 'T5, BART, Whisper',
      useCases: ['Tradução', 'Sumarização', 'Speech-to-text'],
    },
  ]}
/>
```

---

#### Componente 6: `AnnotatedFormula` — fórmula matemática com anotações visuais

**Substitui:** fórmulas como `Attention(Q, K, V) = softmax(Q·Kᵀ/√dₖ) · V` com explicação de cada parte

```tsx
<AnnotatedFormula
  accent={accent}
  parts={[
    { text: 'softmax(', annotation: '' },
    { text: 'Q · Kᵀ', annotation: 'compatibilidade query-key', highlight: true },
    { text: ' / √dₖ', annotation: 'normalização para estabilidade numérica', highlight: true },
    { text: ')', annotation: '' },
    { text: ' · V', annotation: 'valores ponderados pelas atenções', highlight: true },
  ]}
/>
```

---

### Inventário de artigos para migrar (46 arquivos)

**Prioridade P0 (artigos mais lidos, Trilhas 1–2):**

| Arquivo | Diagramas ASCII | Componente ideal |
|---------|-----------------|------------------|
| `o-que-e-ia` | Hierarquia IA>ML>DL>LLMs; Tradicional vs ML | `HierarchyDiagram`, `ComparisonFlow` |
| `transformers` | Q/K/V, matrizes, multi-head, encoder/decoder, máscara causal | `FlowDiagram`, `MatrixDiagram`, `ArchFlow`, `AnnotatedFormula` |
| `o-que-e-llm` | Pipeline de treinamento, context window | `FlowDiagram`, `ArchFlow` |
| `redes-neurais` | Backprop, camadas, funções de ativação | `FlowDiagram`, `HierarchyDiagram` |
| `kv-cache` | Cache crescendo token a token | `FlowDiagram` |
| `mixture-of-experts` | Router + experts | `ArchFlow` |
| `tool-calling` | Loop de agente com tools | `FlowDiagram` |
| `ia-alem-do-llm` | Harness completo | `ArchFlow` |

**Prioridade P1 (Trilhas 9–11, conteúdo avançado):**

| Arquivo | Uso |
|---------|-----|
| `rag-fundamentos` | Pipeline RAG |
| `multi-agent-systems` | Orchestrator-worker |
| `consensus-raft` | Raft state machine |
| `cap-pacelc` | CAP theorem |
| `sagas-2pc` | Saga vs 2PC |
| `event-sourcing-cqrs` | Fluxo CQRS |
| `opentelemetry-stack` | Instrumentação ponta a ponta |
| `slos-error-budgets` | SLO budget burndown |

**Prioridade P2 (demais trilhas):**
Todos os outros 38 arquivos. Migrar após P0 e P1.

---

### Critério de aceitação para ArchDiagram
- [ ] `HierarchyDiagram`, `FlowDiagram`, `ComparisonFlow`, `ArchFlow` implementados em `primitives.tsx`
- [ ] `MatrixDiagram` e `AnnotatedFormula` implementados (para conteúdo matemático)
- [ ] Todos os 8 artigos P0 migrados — zero `ArchDiagram` com box-drawing ASCII
- [ ] Build passa (`npm run build`) sem erros
- [ ] Componentes respondem ao tema claro/escuro via `var(--ffv-*)` (zero hardcode)

---

## 2. MELHORIAS PEDAGÓGICAS — Resultado da Auditoria

> Dimensões de avaliação: D1 Densidade · D2 Progressão · D3 Andaimento · D4 Quiz · D5 Profundidade técnica · D6 Costura · D7 Aplicabilidade

### 2.1 Artigos com quiz fraco (D4 < 3.5)

**`qual-coding-agent-usar` (D4 = 3.0) — P0**

O quiz atual apresenta opções de escolha óbvias — alternativas absurdas que nenhum leitor real escolheria. Recall ativo exige que todas as opções erradas sejam plausíveis.

Reescrever as 3 perguntas para testar:
1. Quando preferir Claude Code vs Cursor para uma tarefa específica (cenário concreto)
2. Por que Claude Code tem benchmarks SWE-bench mais altos que IDE-based agents (resposta técnica, não de "marca")
3. Qual a desvantagem real de usar Copilot para refactoring de codebase grande

**`como-avaliar-modelos` (D6 = 3.5 costura) — P1**

O artigo termina sem bridge forte para a próxima trilha. Adicionar:
- Seção "O que avaliar em produção vs benchmark"
- Callout final direcionando para `rag-evaluation` (Trilha 9) e `llmops-drift-canary` (Trilha 9)

---

### 2.2 Artigos de síntese sem ponto de partida claro

**Problema transversal:** artigos que comparam opções (ex: `qual-coding-agent-usar`, `relacional-vs-nao-relacional`) apresentam todos os cenários com peso igual. Leitores iniciantes ficam sem saber "mas no meu caso, qual?"

**Solução padrão:** adicionar `DecisionBox` no início da seção de comparação com 3 perguntas de diagnóstico que levam o leitor à resposta certa para seu contexto:

```tsx
<DecisionBox
  accent={accent}
  title="Qual escolher?"
  options={[
    {
      condition: 'Você trabalha principalmente no terminal/CLI',
      recommendation: 'Claude Code',
      reason: 'Projetado para ser seu co-piloto no shell'
    },
    {
      condition: 'Você já usa VS Code e quer assistência in-editor',
      recommendation: 'Cursor ou Copilot',
      reason: 'Integração nativa com o IDE que você já conhece'
    },
    // ...
  ]}
/>
```

---

### 2.3 Migrar primitivos legados — `mixture-of-experts`

**`src/app/aprenda/mixture-of-experts/page.tsx`** ainda define `Section` e `Callout` inline em vez de importar de `@/components/article/primitives`.

Checklist:
- [ ] Remover definições inline de `Section`, `Callout`
- [ ] Adicionar import de `@/components/article/primitives`
- [ ] Verificar se ArchDiagram usa ASCII → migrar para `ArchFlow`
- [ ] Build passa

---

### 2.4 Reescrita profunda das Trilhas 1 e 2 (12 artigos)

**Problema:** artigos com 144–178 linhas (média 160). Trilhas 9–11 têm 440–822 linhas. Gap de 3–5×.

**Trilha 1 — os 7 artigos que precisam de expansão:**

| Slug | Foco da reescrita | Meta de linhas |
|------|-------------------|----------------|
| `redes-neurais` | Backprop passo a passo, loss functions (MSE/cross-entropy com fórmula), regularização L1/L2/dropout, batch norm | ~500 |
| `o-que-e-llm` | Pipeline completo pré-treino→fine-tune→RLHF→inferência, context window real (8k vs 200k), temperature/top-p/top-k | ~450 |
| `transformers` | Já em 400+ linhas — o mais completo. Revisar se diagramas ASCII substituídos por componentes visuais | ~450 |
| `tokens` | BPE passo a passo, tiktoken em Python real, custo por token com calculadora | ~350 |
| `como-ia-aprende` | Função de custo, gradiente descendente com vizualização ASCII→FlowDiagram, learning rate | ~450 |
| `dados-o-combustivel` | Data leakage, class imbalance, augmentation, train/val/test split, pipelines reais | ~400 |
| `o-que-e-ia` | História honesta (Winters→Transformer), AGI vs ANI, aplicações com números reais | ~350 |

**Trilha 2 — os 5 artigos:**

| Slug | Foco da reescrita | Meta de linhas |
|------|-------------------|----------------|
| `kv-cache` | Por que atenção é O(n²) sem cache, PagedAttention (vLLM), custos de memória | ~400 |
| `mixture-of-experts` | Remover legado + reescrever router em detalhe, load balancing, DeepSeek v3/Mixtral | ~400 |
| `tool-calling` | JSON schema de tool, parallel tool calls, error handling, retry, Anthropic+OpenAI comparados | ~400 |
| `ia-alem-do-llm` | Harness completo: loop, contexto, subagentes, permissões, cost tracking | ~400 |
| `como-avaliar-modelos` | Benchmarks (MMLU, HumanEval, SWE-bench), LLM-as-judge, eval próprio | ~400 |

**Padrão obrigatório em cada reescrita:**
- Briefing 2–3 parágrafos com contexto histórico ou técnico real
- Pré-requisitos declarados no topo (até implementar componente formal)
- 4–6 `Section` com accent da trilha
- Mínimo 1 `ComparisonTable`
- Mínimo 1 componente visual (novo — não ASCII)
- 2–3 `QAItem`
- Quiz de 3 perguntas com opções todas plausíveis
- Callout `success` de take-aways
- Link para próximos artigos no Callout final

---

## 3. INFRA PEDAGÓGICA — Fase 0 (não implementada)

### 3.1 Sitemap + robots.txt automáticos

**`src/app/sitemap.ts`** — gera sitemap.xml automaticamente a partir de `CURRICULUM`:

```ts
import { MetadataRoute } from 'next'
import { CURRICULUM } from '@/lib/curriculum'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://fernandofrancovalle.com'
  const articles = CURRICULUM.flatMap(trail =>
    trail.modules.map(mod => ({
      url: `${base}/aprenda/${mod.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    }))
  )
  const trails = CURRICULUM.map(trail => ({
    url: `${base}/${trail.id.replace('trail', '')}`, // precisa do mapa de rotas
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))
  return [
    { url: base, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${base}/progresso`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/revisar`, changeFrequency: 'weekly', priority: 0.7 },
    ...trails,
    ...articles,
  ]
}
```

**`src/app/robots.ts`** — simples:
```ts
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://fernandofrancovalle.com/sitemap.xml',
  }
}
```

---

### 3.2 JSON-LD Schema.org/Article

Componente `<ArticleJsonLd />` em `src/components/article/ArticleJsonLd.tsx`:

```tsx
export function ArticleJsonLd({ title, description, slug }: Props) {
  const json = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description,
    author: { '@type': 'Person', name: 'Fernando Franco Valle' },
    publisher: {
      '@type': 'Organization',
      name: 'FFV Academy',
      url: 'https://fernandofrancovalle.com',
    },
    url: `https://fernandofrancovalle.com/aprenda/${slug}`,
    inLanguage: 'pt-BR',
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(json) }}
    />
  )
}
```

Injetar em `ModuleLayout.tsx` no `<head>` via `generateMetadata` ou diretamente no JSX.

**Impacto SEO:** rich snippets no Google; artigos podem aparecer como "Article" com autor e thumbnail. Ganho real, implementação ~30 min.

---

### 3.3 Componentes `<Prerequisites />` e `<NextSteps />`

**Por que importam (psicologia educacional):** pesquisa em cognitive load theory mostra que explicitar pré-requisitos reduz frustração de 40% dos aprendizes. Sem isso, o leitor bate numa parede e abandona — e não sabe *por que*.

**`src/components/article/Prerequisites.tsx`**:
- Lê `prerequisites[]` do módulo em `CURRICULUM`
- Para cada pré-req: ícone de check (verde se completado, círculo vazio se não)
- Usa `useGameState()` para `completedModules`
- Visual: callout azul-claro no topo do artigo

**`src/components/article/NextSteps.tsx`**:
- Lê `nextSuggested[]` do módulo
- Renderiza 2–3 cards com título, trilha e motivo
- Usa componente visual similar ao `TrailCard` da home

**Schema necessário em `curriculum.ts`:**
```ts
interface Module {
  // existentes
  slug: string;
  title: string;
  icon: string;
  xp: number;
  readTime: number;
  desc: string;
  // NOVOS
  prerequisites?: string[];    // slugs que deveriam ser lidos antes
  nextSuggested?: string[];    // slugs recomendados após
  level?: 'foundational' | 'beginner' | 'intermediate' | 'advanced';
}
```

**Backfill de pré-requisitos:** após criar o schema, adicionar `prerequisites` e `nextSuggested` em todos os módulos. Prioridade: Trilhas 1-3 primeiro (mais usadas).

---

## 4. HOME — Seção "Por onde começar?"

### O problema
A home mostra todas as trilhas com peso igual. Um iniciante absoluto fica perdido. Um dev sênior que "só quer aprender IA" também fica sem direção.

### Solução: diagnóstico condicional baseado em estado

Em `HomeClient.tsx`, adicionar bloco `HeroRoutingSection` entre HeroMetrics e FeaturedArticle:

```tsx
// Lógica:
const { xp, completedModules } = useGameState()

if (xp === 0 && completedModules.length === 0) {
  // Iniciante total
  return <RouterCard
    title="Nunca programou de verdade?"
    cta="Começar pelos Fundamentos"
    href="/fundamentos-tecnicos"
    reason="Linux, Git, HTTP e SSH — a base que ninguém te ensinou mas todo mundo usa"
  />
}

if (xp > 0 && completedModules.some(s => s.startsWith('fundamentos-tecnicos'))) {
  // Já passou pelos fundamentos
  return <RouterCard
    title="Próximo passo: Python profissional"
    ...
  />
}
```

Três caminhos de roteamento:
1. **Iniciante total** → `fundamentos-tecnicos`
2. **Sabe programar, quer IA** → `fundamentos-da-ia`
3. **Sabe IA, quer infra/cloud** → `aws-cloud-practitioner` ou `sistemas-distribuidos`

---

## 5. NOVAS TRILHAS — Status de Implementação

### O que já existe no currículo (`curriculum.ts`) mas ainda não tem artigos:

| Trilha | Rota | Status | Artigos |
|--------|------|--------|---------|
| Fundamentos Técnicos (T12) | `/fundamentos-tecnicos` | ✅ Rota existe | Precisa criar 11 artigos |
| SQL & Databases (T14) | `/sql-databases` | ✅ Rota existe | Precisa criar 10 artigos |
| Como o Computador Funciona (T15) | `/como-computador-funciona` | ✅ Rota existe | Precisa criar 9 artigos |
| Redes & Web (T16) | `/redes-web` | ✅ Rota existe | Precisa criar 9 artigos |

> **Nota:** Trilha Python Profundo foi substituída pela Trilha 13 (Claude & Anthropic). A Python Profundo ainda está no plano como trilha futura possível.

### Prioridade de criação:
1. **Fundamentos Técnicos** (T12) — desbloqueador de tudo. Quem não sabe CLI não vai longe em AWS, containers ou IA.
2. **SQL & Databases** (T14) — pré-req real de AWS (RDS), Sistemas Distribuídos (MVCC), qualquer backend.
3. **Redes & Web** (T16) — pré-req de AWS Networking, HTTP/TLS, CORS/CSRF.
4. **Como o Computador Funciona** (T15) — mais profundo, pode esperar. Pré-req de Containers, I/O assíncrono, performance.

---

## 6. MELHORIAS VISUAIS MENORES

### 6.1 GameHUD — navegação por hubs
O HUD atual mostra links de hub (IA, AWS, Engenharia). Quando as novas trilhas fizerem parte de um hub, atualizar `GameHUD.tsx` para incluí-las.

Trilhas 12-16 podem ir em um hub "Fundamentos":
```
Hub: Fundamentos Técnicos
├── /fundamentos-tecnicos (T12)
├── /sql-databases (T14)
├── /como-computador-funciona (T15)
└── /redes-web (T16)
```

### 6.2 CommandPalette (Cmd+K)
Já indexa `CURRICULUM` dinamicamente — novas trilhas aparecem automaticamente quando adicionadas ao currículo. Verificar após adicionar novos artigos.

### 6.3 `ProgressoClient` — novos hubs
Adicionar os novos hubs à tela de progresso quando forem criados. Hoje mostra apenas IA, AWS, Engenharia, Como Aprender.

---

## 7. RESUMO EXECUTIVO — Prioridades

### P0 — Fazer agora (máximo impacto, fundamento do resto)
1. **Criar componentes visuais** (`HierarchyDiagram`, `FlowDiagram`, `ComparisonFlow`, `ArchFlow`) em `primitives.tsx`
2. **Migrar artigos P0** (Trilhas 1-2, 8 artigos) de ASCII para componentes visuais
3. **Corrigir quizzes fracos** — `qual-coding-agent-usar` (D4=3.0)
4. **Migrar primitivos legados** de `mixture-of-experts`

### P1 — Próxima sprint
5. **Reescrita densa** das Trilhas 1 e 2 (12 artigos → ~400 linhas cada)
6. **Sitemap + robots.txt** (30 min, ganho SEO imediato)
7. **ArticleJsonLd** (1h, ganho SEO real)
8. **Migrar artigos P1** (Trilhas 9-11, 8 artigos) de ASCII para componentes visuais

### P2 — Quando houver ciclos
9. **`Prerequisites` e `NextSteps`** components + backfill de pré-requisitos
10. **Seção "Por onde começar?"** na home
11. **Criar artigos** das Trilhas 12, 14 (desbloqueadores de currículo)
12. **Migrar artigos P2** (38 restantes com ArchDiagram ASCII)

### P3 — Futuro
13. **Criar artigos** das Trilhas 15 e 16
14. **Hub "Fundamentos"** no GameHUD e ProgressoClient
15. **Página `/mapa`** — grafo visual de todas as trilhas e dependências

---

## 8. CRITÉRIO DE DEFINIÇÃO DE "PRONTO"

Um artigo está **pronto** quando:
- [ ] 300–550 linhas de conteúdo JSX
- [ ] Zero `ArchDiagram` com caracteres de box-drawing ASCII (usa componentes visuais)
- [ ] Mínimo 1 `ComparisonTable`
- [ ] Quiz com 3 perguntas onde todas as opções erradas são plausíveis
- [ ] Callout final com take-aways + próximo passo explícito
- [ ] Build passa sem erros TypeScript

Uma **trilha** está pronta quando:
- [ ] Todos os artigos atendem aos critérios acima
- [ ] O primeiro artigo tem "pré-requisitos" declarados no topo (mesmo que textual até componente existir)
- [ ] O último artigo tem bridge explícita para próxima trilha recomendada

O **sistema de aprendizado** está pronto quando:
- [x] Trilhas 1-2 reescritas com densidade equivalente às Trilhas 9-11
- [ ] Todos os componentes visuais implementados e usados *(ArchDiagram ainda em uso)*
- [x] Sitemap + JSON-LD ativos (SEO baseline)
- [ ] `Prerequisites`/`NextSteps` funcionando com progresso real do usuário
- [x] Seção "Por onde começar?" na home ativa

---

## 🔄 Atualização — maio/2026

### Itens completados após esta auditoria
Várias melhorias deste documento foram parcial ou totalmente endereçadas na **jornada de maio/2026** (ver detalhes em [`CHANGELOG_PLATFORM_2026-05.md`](./CHANGELOG_PLATFORM_2026-05.md)):

- ✅ **Sitemap dinâmico** — `app/sitemap.ts`
- ✅ **JSON-LD baseline** — `ArticleJsonLd` ativo
- ✅ **"Por onde começar?" ativa** — `ComecarAqui` na home (6 caminhos)
- ✅ **Currículo expandido** — 5 trilhas novas (Profissional Digital), 29 módulos
- ✅ **Home redesenhada** — 16 → 8 seções, com prova social honesta
- ✅ **Sistema de ranking** — 4 períodos, página dedicada `/ranking`
- ✅ **`/news` rebuscada** — imagens reais + magazine layout

### Itens ainda em backlog (deste documento)
- ⏳ **ArchDiagram → componentes visuais** (HierarchyDiagram, FlowDiagram, etc) — não migrados
- ⏳ **Prerequisites/NextSteps com progresso real** — implementação parcial

### Novos itens identificados (auditoria mai/2026)
- **P1** Onboarding v2 — 3a pergunta ("quanto tempo por dia?") + playlist personalizada
- **P1** Mobile experience completo — pódio mobile, filtros, swipe gestures
- **P2** Cleanup `curriculum.ts` (4894 linhas) — quebrar em arquivos por trilha
- **P2** Test coverage de componentes — HomeClient, MobileNav, OnboardingModal, MyRankCard
- **P2** Hook automático `npm run generate-og` no postbuild
- **P3** Trail overview pages das 5 trilhas novas (`/comunicacao-humana`, `/carreira-digital`, etc)
- **P3** Migrar imagens Unsplash para `public/news/` em build time
- **P3** Acessibilidade — só 24/71 componentes têm aria-* (Lighthouse audit)

*Atualização: 04/05/2026 — após redesign da home + ranking + news + auditoria crítica.*

---

*Última atualização: 17/04/2026. Baseado na auditoria pedagógica das Trilhas 1-3 + análise transversal do currículo completo.*
