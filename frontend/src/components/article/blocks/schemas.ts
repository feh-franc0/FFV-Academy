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

// ─── Blocos básicos (Sprint 1) ──────────────────────────────────────────────

export const SectionSchema = z.object({
  title: z.string().min(1).max(200),
});

export const InlineNodeSchema = z.object({
  text: z.string(),
  bold: z.boolean().optional(),
  italic: z.boolean().optional(),
  code: z.boolean().optional(),
  link: z.string().url().optional(),
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
  src: z.string().url(),
  alt: z.string().min(1),
  caption: z.string().optional(),
});

// ─── Block (envelope com type discriminator) ────────────────────────────────

export const BlockTypeSchema = z.enum([
  'section', 'paragraph', 'callout', 'code_block',
  'comparison_table', 'decision_box', 'flow_diagram',
  'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
  'node_graph', 'annotated_formula', 'quiz', 'image',
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
