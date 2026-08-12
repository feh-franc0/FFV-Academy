/**
 * Schemas Zod dos blocos CMS-driven.
 *
 * Espelha os tipos validados no backend Go (internal/domain/curriculum/block.go).
 * Dupla validação: backend rejeita JSON inválido antes de persistir; frontend
 * re-valida antes de renderizar e cai em fallback gracioso se algo passar.
 *
 * Adicionar novo tipo de bloco:
 *   1. Adicionar struct Go em block_types.go (será criado em sprint futura)
 *   2. Adicionar CHECK constraint na migration
 *   3. Adicionar schema Zod aqui
 *   4. Adicionar entry em BlockRegistry (registry.ts)
 *   5. Adicionar transform no parser (scripts/import-blocks/)
 */

import { z } from 'zod';

// ─── URL helpers — defesa contra XSS por protocolo ──────────────────────────
//
// `z.string().url()` aceita `javascript:`, `data:`, `vbscript:`, `file:` etc.
// Permitir esses protocolos em `href` de `<a>` ou `src` de `<img>` abre XSS
// direto. Restringimos protocolos a um conjunto seguro (https, http, mailto)
// + paths relativos/internos (`/...`, `#...`).
//
// Para imagens, exigimos adicionalmente que o host esteja numa allowlist
// (espelha CSP `img-src` em app/layout.tsx). Bloqueia data:image/svg+xml
// (vetor clássico de XSS), trackers e exfiltração silenciosa.

const SAFE_PROTOCOLS = /^(https?:|\/|#|mailto:)/i;

export const safeUrl = () =>
  z.string().url().refine((u) => SAFE_PROTOCOLS.test(u), {
    message: 'Protocolo não permitido (use https, http, /, #, mailto:)',
  });

const IMG_HOST_ALLOWLIST = [
  'fernandofrancovalle.com',
  'images.unsplash.com',
  'lh3.googleusercontent.com',
  'avatars.githubusercontent.com',
];

export const safeImageUrl = () =>
  safeUrl().refine(
    (u) => {
      try {
        const url = new URL(u);
        return IMG_HOST_ALLOWLIST.some(
          (h) => url.hostname === h || url.hostname.endsWith('.' + h),
        );
      } catch {
        return false;
      }
    },
    { message: 'Origem de imagem não permitida (host fora da allowlist)' },
  );

// ─── Blocos básicos (Sprint 1) ──────────────────────────────────────────────

export const SectionSchema = z.object({
  title: z.string().min(1).max(200),
});

export const InlineNodeSchema = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  code: z.boolean().optional(),
  link: safeUrl().optional(),
});

export const ParagraphSchema = z.object({
  content: z.array(InlineNodeSchema).min(1),
});

export const CalloutSchema = z.object({
  variant: z.enum(['info', 'warning', 'danger', 'success']),
  title: z.string().max(120).optional().default(''),
  content: z.string().min(1),
});

export const CodeBlockSchema = z.object({
  language: z.string().min(1).max(40),
  code: z.string().min(1).max(50_000),
  filename: z.string().max(200).optional(),
  highlightLines: z.array(z.number().int().min(1)).optional(),
  startLine: z.number().int().min(1).optional(),
});

export const ComparisonTableSchema = z.object({
  title: z.string().max(200).optional(),
  // max 8: o desktop envolve a <table> em overflow-x-auto e o mobile vira cards
  // empilhados, então coluna extra rola em vez de estourar o layout. O cap de 6
  // anterior descartava silenciosamente tabelas legítimas (comparação de
  // modelos de embedding, specs de chip) — bloco inválido volta null no
  // BlockRenderer e a tabela simplesmente desaparecia da página.
  columns: z.array(z.string().min(1)).min(2).max(8),
  rows: z.array(z.array(z.string())).min(1),
});

// ─── Blocos avançados ────────────────────────────────────────────────────────
//
// ⚠️ ESTES SCHEMAS FORAM REESCRITOS EM AGO/2026, E O MOTIVO IMPORTA.
//
// Até então eles eram placeholders que descreviam formas **que nenhum adapter
// consumia**. O de `decision_box`, por exemplo, declarava `prompt`/`options`,
// enquanto o adapter em `BlockRenderer.tsx` lê
// `scenario`/`winner`/`why`/`alternatives`. Como o tipo estava registrado em
// `BLOCK_DATA_SCHEMAS` como `PassthroughObject`, escrever um bloco na forma
// declarada aqui NÃO era rejeitado: ele renderizava a caixa com todos os campos
// vazios. Falha silenciosa, sem erro no console, no arquivo onde qualquer autor
// vai procurar o contrato.
//
// Aconteceu de verdade: um módulo desta plataforma foi escrito contra o schema
// declarado e só não entrou vazio porque o gate de conteúdo acusou.
//
// Agora os schemas descrevem o que o adapter lê, e estão REGISTRADOS de fato — a
// forma errada passou a falhar no gate em vez de virar bloco vazio. Foi seguro
// porque a forma real é uniforme nos 9.400+ blocos existentes: `decision_box`
// 265/265 iguais, `flow_diagram` 86/86, `arch_flow` 33/33, `node_graph` 45/45,
// `matrix_diagram` 15/15, `annotated_formula` 52/52.
//
// REGRA DE MANUTENÇÃO: mudou o adapter, mude o schema no mesmo commit. Schema que
// descreve outra coisa é pior que schema ausente.

/** Item de lista que aceita string ou objeto — vários primitives fazem isso. */
const TextoOuObjeto = z.union([z.string(), z.record(z.string(), z.unknown())]);

export const DecisionBoxSchema = z.object({
  scenario: z.string().min(1),
  winner: z.string().min(1),
  why: z.string().min(1),
  alternatives: z.array(z.object({
    // O adapter lê `name` com fallback para `label`, e `downside` com fallback
    // para `note`/`when` — os três nomes existem no conteúdo produzido.
    name: z.string().optional(),
    label: z.string().optional(),
    downside: z.string().optional(),
    note: z.string().optional(),
    when: z.string().optional(),
  })).default([]),
});

export const FlowDiagramSchema = z.object({
  title: z.string().max(200).optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
  steps: z.array(z.union([z.string(), z.object({
    label: z.string().optional(),
    title: z.string().optional(),
    text: z.string().optional(),
    desc: z.string().optional(),
    body: z.string().optional(),
    subtitle: z.string().optional(),
    detail: z.string().optional(),
    icon: z.string().optional(),
  })])).min(1),
});

export const ArchFlowSchema = z.object({
  title: z.string().max(200).optional(),
  columns: z.array(z.object({
    // `header` é o nome usado na maior parte do conteúdo; `title` também é lido.
    header: z.string().optional(),
    title: z.string().optional(),
    headerColor: z.string().optional(),
    footer: z.string().optional(),
    items: z.array(z.string()).default([]),
    useCases: z.array(z.string()).optional(),
  })).min(1),
});

export const MatrixDiagramSchema = z.object({
  title: z.string().max(200).optional(),
  rowLabels: z.array(z.string()).default([]),
  colLabels: z.array(z.string()).default([]),
  // Número E string, porque o primitive trata os dois de propósito: célula
  // numérica vira heatmap com intensidade proporcional ao valor (é assim que o
  // módulo `transformers` desenha pesos de atenção), célula de texto é matriz
  // comparativa, onde cor não codificaria nada.
  //
  // Ao registrar este schema eu o escrevi como `string` apenas, e ele derrubou 3
  // blocos legítimos de `transformers` no teste — o que é o comportamento
  // desejado do gate, e a prova de que a forma tem de sair do primitive e não da
  // suposição de quem escreve o schema.
  matrix: z.array(z.array(z.union([z.string(), z.number()]))).min(1),
});

export const StackFlowSchema = z.object({
  title: z.string().max(200).optional(),
  items: z.array(TextoOuObjeto).min(1),
});

export const TimelineSchema = z.object({
  title: z.string().max(200).optional(),
  events: z.array(z.object({
    // `when` é o nome real no conteúdo; `date` é aceito como alias.
    when: z.string().optional(),
    date: z.string().optional(),
    label: z.string().optional(),
    title: z.string().optional(),
    detail: z.string().optional(),
    body: z.string().optional(),
    description: z.string().optional(),
    highlight: z.boolean().optional(),
  })).min(1),
});

export const NodeGraphSchema = z.object({
  title: z.string().max(200).optional(),
  columns: z.array(z.object({
    label: z.string().optional(),
    title: z.string().optional(),
    nodes: z.array(TextoOuObjeto).default([]),
  })).min(1),
  legend: z.union([
    z.string(),
    z.array(z.object({ label: z.string(), color: z.string().optional() })),
  ]).optional(),
});

export const AnnotatedFormulaSchema = z.object({
  title: z.string().max(200).optional(),
  formula: z.string().min(1),
  // O primitive renderiza text/label/name/annotation/note/highlight. O adapter
  // antigo mandava symbol/description/color, que ele nem tem — daí 148 de 197
  // anotações saírem em branco.
  parts: z.array(z.object({
    text: z.string().optional(),
    symbol: z.string().optional(),
    label: z.string().optional(),
    name: z.string().optional(),
    annotation: z.string().optional(),
    description: z.string().optional(),
    note: z.string().optional(),
    highlight: z.boolean().optional(),
  })).default([]),
});

export const QuizSchema = z.object({
  question: z.string().min(1),
  options: z.array(z.string()).min(2).max(8),
  correctIndex: z.number().int().min(0),
  explanation: z.string().optional(),
});

export const ImageSchema = z.object({
  src: safeImageUrl(),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

/**
 * Diagrama de arquitetura. Estrito de propósito: um id de nó errado numa aresta
 * some silenciosamente no render, então falhar cedo é melhor.
 *
 * Chamava-se AwsDiagramSchema quando o bloco só desenhava topologia AWS. O
 * componente sempre foi agnóstico (nós, grupos, arestas, passos) — só o nome e o
 * catálogo de ícones limitavam. Renomeado para servir também às trilhas de IA e
 * produção, onde o objeto é RLHF, HNSW, consenso e feature store.
 */
export const ArchDiagramSchema = z.object({
  title: z.string().max(200).optional(),
  caption: z.string().max(600).optional(),
  groups: z.array(z.object({
    label: z.string().max(120).optional(),
    kind: z.enum(['account', 'vpc', 'region', 'plain']).optional(),
    nodes: z.array(z.object({
      id: z.string().min(1).max(60),
      service: z.string().min(1).max(60),
      label: z.string().max(120).optional(),
      note: z.string().max(200).optional(),
    })).min(1),
  })).min(1).max(8),
  edges: z.array(z.object({
    from: z.string().min(1),
    to: z.string().min(1),
    label: z.string().max(160).optional(),
    style: z.enum(['solid', 'dashed']).optional(),
  })).optional().default([]),
  steps: z.array(z.object({
    label: z.string().min(1).max(160),
    detail: z.string().max(500).optional(),
    nodes: z.array(z.string()).optional(),
    edges: z.array(z.string()).optional(),
  })).max(12).optional().default([]),
});

// ─── Block (envelope com type discriminator) ────────────────────────────────

export const BlockTypeSchema = z.enum([
  // Sprint 1-2
  'section', 'paragraph', 'callout', 'code_block',
  'comparison_table', 'decision_box', 'flow_diagram',
  'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
  'node_graph', 'annotated_formula', 'quiz', 'image',
  // Sprint 2.5 (todos os primitives)
  'qa_item', 'key_value', 'list',
  'hierarchy_diagram', 'comparison_flow', 'split_flow',
  'layer_stack', 'mind_map', 'exam_domain_badge',
  // Diagrama de arquitetura com ícones. 'arch_diagram' é o canônico;
  // 'aws_diagram' segue aceito porque seeds antigos podem usá-lo — remover o
  // alias antes de migrar todos fazia 96 blocos desaparecerem em silêncio.
  'arch_diagram',
  'aws_diagram',
]);

/** @deprecated use ArchDiagramSchema — mantido para import existente. */
export const AwsDiagramSchema = ArchDiagramSchema;

export type BlockType = z.infer<typeof BlockTypeSchema>;

export interface Block {
  id: string;
  type: BlockType;
  position: number;
  data: unknown;
  children?: Block[];
}

// Schema do envelope completo (recursivo) — validação básica antes do registry
// resolver o type específico e validar `data` com o schema certo.
export const BlockSchema: z.ZodType<Block> = z.lazy(() => z.object({
  id: z.string(),
  type: BlockTypeSchema,
  position: z.number().int().min(0),
  data: z.unknown(),
  children: z.array(BlockSchema).optional(),
}));

// ─── Article + Blocks (resposta completa da API) ────────────────────────────

export const ArticleWithBlocksSchema = z.object({
  slug: z.string(),
  title: z.string(),
  trail_id: z.string(),
  hub_id: z.string(),
  xp: z.number(),
  read_time: z.number(),
  difficulty: z.string(),
  order: z.number(),
  updated_at: z.string(),
  blocks: z.array(BlockSchema),
});

export type ArticleWithBlocks = z.infer<typeof ArticleWithBlocksSchema>;

// ─── Map type → data schema (usado no BlockRenderer pra safeParse em runtime)
//
// Cobertura mínima: os tipos que renderizam URLs (paragraph com `link`, image
// com `src`) usam schemas estritos com `safeUrl`/`safeImageUrl`. Os demais
// usam um schema permissivo (passthrough) — bloqueamos só os vetores de XSS
// já conhecidos. Tipos sem entrada caem em "permitir mas logar".

const PassthroughObject = z.object({}).passthrough();

export const BLOCK_DATA_SCHEMAS: Record<string, z.ZodTypeAny> = {
  section: SectionSchema,
  paragraph: ParagraphSchema,
  callout: CalloutSchema,
  code_block: CodeBlockSchema,
  comparison_table: ComparisonTableSchema,
  image: ImageSchema,
  quiz: QuizSchema,
  arch_diagram: ArchDiagramSchema,
  aws_diagram: ArchDiagramSchema, // alias legado — mesmo schema
  // Reescritos e REGISTRADOS em ago/2026 (ver o comentário longo acima): antes
  // eram PassthroughObject com um schema declarado que ninguém consumia, o que
  // fazia a forma errada renderizar bloco vazio em vez de falhar. Agora a forma
  // errada falha — no gate e no teste, antes de chegar à página.
  decision_box: DecisionBoxSchema,
  flow_diagram: FlowDiagramSchema,
  arch_flow: ArchFlowSchema,
  matrix_diagram: MatrixDiagramSchema,
  stack_flow: StackFlowSchema,
  timeline: TimelineSchema,
  node_graph: NodeGraphSchema,
  annotated_formula: AnnotatedFormulaSchema,
  // Tipos sem schema estrito ainda: aceita qualquer objeto. Renderer faz
  // asText() defensivo e BlockRenderer escapa via JSX (atributos não-URL
  // são seguros por padrão no React).
  qa_item: PassthroughObject,
  key_value: PassthroughObject,
  list: PassthroughObject,
  hierarchy_diagram: PassthroughObject,
  comparison_flow: PassthroughObject,
  split_flow: PassthroughObject,
  layer_stack: PassthroughObject,
  mind_map: PassthroughObject,
  exam_domain_badge: PassthroughObject,
};
