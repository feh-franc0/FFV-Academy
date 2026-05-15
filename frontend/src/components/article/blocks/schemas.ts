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
  columns: z.array(z.string().min(1)).min(2).max(6),
  rows: z.array(z.array(z.string())).min(1),
});

// ─── Blocos avançados (placeholders — implementação completa em sprints futuras) ─

export const DecisionBoxSchema = z.object({
  prompt: z.string().min(1),
  options: z.array(z.object({
    label: z.string().min(1),
    outcome: z.string(),
    recommended: z.boolean().optional(),
  })).min(2),
});

export const FlowDiagramSchema = z.object({
  nodes: z.array(z.object({
    id: z.string().min(1),
    label: z.string().min(1),
    type: z.enum(['input', 'process', 'output', 'decision']).optional(),
  })).min(2),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
    label: z.string().optional(),
  })).optional().default([]),
});

export const ArchFlowSchema = z.object({
  layers: z.array(z.object({
    name: z.string(),
    components: z.array(z.string()).min(1),
  })).min(1),
});

export const MatrixDiagramSchema = z.object({
  xAxis: z.string(),
  yAxis: z.string(),
  cells: z.array(z.object({
    x: z.string(),
    y: z.string(),
    label: z.string(),
  })).min(1),
});

export const StackFlowSchema = z.object({
  items: z.array(z.string()).min(1),
});

export const TimelineSchema = z.object({
  events: z.array(z.object({
    date: z.string(),
    title: z.string(),
    description: z.string().optional(),
  })).min(1),
});

export const NodeGraphSchema = z.object({
  nodes: z.array(z.object({
    id: z.string(),
    label: z.string(),
  })).min(1),
  edges: z.array(z.object({
    from: z.string(),
    to: z.string(),
  })).optional().default([]),
});

export const AnnotatedFormulaSchema = z.object({
  formula: z.string().min(1),
  annotations: z.array(z.object({
    target: z.string(),
    explanation: z.string(),
  })).optional().default([]),
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
]);

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
  // Tipos sem schema estrito ainda: aceita qualquer objeto. Renderer faz
  // asText() defensivo e BlockRenderer escapa via JSX (atributos não-URL
  // são seguros por padrão no React).
  qa_item: PassthroughObject,
  key_value: PassthroughObject,
  list: PassthroughObject,
  decision_box: PassthroughObject,
  flow_diagram: PassthroughObject,
  arch_flow: PassthroughObject,
  matrix_diagram: PassthroughObject,
  stack_flow: PassthroughObject,
  timeline: PassthroughObject,
  node_graph: PassthroughObject,
  annotated_formula: PassthroughObject,
  hierarchy_diagram: PassthroughObject,
  comparison_flow: PassthroughObject,
  split_flow: PassthroughObject,
  layer_stack: PassthroughObject,
  mind_map: PassthroughObject,
  exam_domain_badge: PassthroughObject,
};
