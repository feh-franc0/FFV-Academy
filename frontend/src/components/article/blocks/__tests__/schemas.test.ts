/**
 * Schemas Zod — validação de entrada para blocos CMS-driven.
 *
 * Garante que payloads do backend são rejeitados na fronteira antes de
 * chegar no BlockRenderer (defesa em profundidade, espelha CHECK constraints
 * do Postgres).
 */
import { describe, it, expect } from 'vitest';
import {
  SectionSchema,
  ParagraphSchema,
  CalloutSchema,
  CodeBlockSchema,
  ComparisonTableSchema,
  ImageSchema,
  BlockSchema,
  BlockTypeSchema,
  ArticleWithBlocksSchema,
} from '../schemas';

describe('SectionSchema', () => {
  it('aceita title não-vazio', () => {
    expect(SectionSchema.safeParse({ title: 'oi' }).success).toBe(true);
  });
  it('rejeita title vazio', () => {
    expect(SectionSchema.safeParse({ title: '' }).success).toBe(false);
  });
  it('rejeita title > 200 chars', () => {
    expect(SectionSchema.safeParse({ title: 'x'.repeat(201) }).success).toBe(false);
  });
});

describe('ParagraphSchema', () => {
  it('aceita content com pelo menos 1 inline node', () => {
    const r = ParagraphSchema.safeParse({ content: [{ text: 'olá' }] });
    expect(r.success).toBe(true);
  });
  it('rejeita content vazio', () => {
    expect(ParagraphSchema.safeParse({ content: [] }).success).toBe(false);
  });
  it('aceita marks bold/italic/code e link URL', () => {
    const r = ParagraphSchema.safeParse({
      content: [{ text: 'x', bold: true, italic: true, code: true, link: 'https://x.com' }],
    });
    expect(r.success).toBe(true);
  });
  it('rejeita link que não é URL válida', () => {
    const r = ParagraphSchema.safeParse({ content: [{ text: 'x', link: 'nao-eh-url' }] });
    expect(r.success).toBe(false);
  });
});

describe('CalloutSchema', () => {
  it('aceita variant info/warning/danger/success', () => {
    for (const v of ['info', 'warning', 'danger', 'success'] as const) {
      expect(CalloutSchema.safeParse({ variant: v, content: 'x' }).success).toBe(true);
    }
  });
  it('rejeita variant inválida', () => {
    expect(CalloutSchema.safeParse({ variant: 'tip', content: 'x' }).success).toBe(false);
  });
  it('default title=""', () => {
    const r = CalloutSchema.parse({ variant: 'info', content: 'x' });
    expect(r.title).toBe('');
  });
  it('rejeita content vazio', () => {
    expect(CalloutSchema.safeParse({ variant: 'info', content: '' }).success).toBe(false);
  });
});

describe('CodeBlockSchema', () => {
  it('aceita language + code', () => {
    expect(CodeBlockSchema.safeParse({ language: 'ts', code: 'x' }).success).toBe(true);
  });
  it('rejeita code maior que 50.000 chars', () => {
    expect(CodeBlockSchema.safeParse({ language: 'ts', code: 'x'.repeat(50_001) }).success).toBe(false);
  });
  it('rejeita language vazio', () => {
    expect(CodeBlockSchema.safeParse({ language: '', code: 'x' }).success).toBe(false);
  });
});

describe('ComparisonTableSchema', () => {
  it('aceita 2-6 columns + ≥1 row', () => {
    const r = ComparisonTableSchema.safeParse({
      columns: ['a', 'b'],
      rows: [['x', 'y']],
    });
    expect(r.success).toBe(true);
  });
  it('rejeita menos de 2 colunas', () => {
    const r = ComparisonTableSchema.safeParse({ columns: ['a'], rows: [['x']] });
    expect(r.success).toBe(false);
  });
  it('rejeita mais de 6 colunas', () => {
    const r = ComparisonTableSchema.safeParse({
      columns: ['a', 'b', 'c', 'd', 'e', 'f', 'g'],
      rows: [['1', '2', '3', '4', '5', '6', '7']],
    });
    expect(r.success).toBe(false);
  });
});

describe('ImageSchema', () => {
  it('aceita src URL + alt não-vazio', () => {
    expect(ImageSchema.safeParse({ src: 'https://x.com/a.png', alt: 'desc' }).success).toBe(true);
  });
  it('rejeita src que não é URL', () => {
    expect(ImageSchema.safeParse({ src: 'a.png', alt: 'd' }).success).toBe(false);
  });
});

describe('BlockTypeSchema', () => {
  it('aceita os 23 tipos válidos', () => {
    const tipos = [
      'section', 'paragraph', 'callout', 'code_block',
      'comparison_table', 'decision_box', 'flow_diagram',
      'arch_flow', 'matrix_diagram', 'stack_flow', 'timeline',
      'node_graph', 'annotated_formula', 'quiz', 'image',
      'qa_item', 'key_value', 'list',
      'hierarchy_diagram', 'comparison_flow', 'split_flow',
      'layer_stack', 'mind_map', 'exam_domain_badge',
    ];
    for (const t of tipos) {
      expect(BlockTypeSchema.safeParse(t).success, t).toBe(true);
    }
  });
  it('rejeita tipo desconhecido', () => {
    expect(BlockTypeSchema.safeParse('xpto').success).toBe(false);
  });
});

describe('BlockSchema (envelope recursivo)', () => {
  it('aceita bloco sem children', () => {
    expect(
      BlockSchema.safeParse({
        id: 'a', type: 'paragraph', position: 0,
        data: { content: [{ text: 'x' }] },
      }).success,
    ).toBe(true);
  });

  it('aceita árvore aninhada', () => {
    const r = BlockSchema.safeParse({
      id: 'root', type: 'section', position: 0, data: { title: 't' },
      children: [
        { id: 'c1', type: 'paragraph', position: 0, data: { content: [{ text: 'x' }] } },
      ],
    });
    expect(r.success).toBe(true);
  });

  it('rejeita position negativa', () => {
    expect(
      BlockSchema.safeParse({ id: 'a', type: 'paragraph', position: -1, data: {} }).success,
    ).toBe(false);
  });

  it('rejeita type fora do enum', () => {
    expect(
      BlockSchema.safeParse({ id: 'a', type: 'foo', position: 0, data: {} }).success,
    ).toBe(false);
  });
});

describe('ArticleWithBlocksSchema', () => {
  const valid = {
    slug: 's', title: 't', trail_id: 'tr', hub_id: 'h',
    xp: 10, read_time: 5, difficulty: 'beginner', order: 1,
    updated_at: '2026-05-12T00:00:00Z', blocks: [],
  };

  it('aceita payload completo válido', () => {
    expect(ArticleWithBlocksSchema.safeParse(valid).success).toBe(true);
  });

  it('rejeita quando falta campo obrigatório', () => {
    const partial = { ...valid } as Record<string, unknown>;
    delete partial.slug;
    expect(ArticleWithBlocksSchema.safeParse(partial).success).toBe(false);
  });

  it('rejeita xp como string', () => {
    expect(ArticleWithBlocksSchema.safeParse({ ...valid, xp: '10' }).success).toBe(false);
  });
});
