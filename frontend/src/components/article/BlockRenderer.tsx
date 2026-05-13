/**
 * BlockRenderer — converte uma árvore de blocos JSON em componentes React.
 *
 * Mapeia cada `block.type` para um componente em primitives.tsx, validando
 * `block.data` contra o schema Zod correspondente antes de renderizar. Se
 * algum bloco vier malformado, loga e cai em fallback gracioso (não quebra
 * a página inteira).
 *
 * Adapters inline traduzem o schema "neutro" do CMS para as props reais dos
 * primitives existentes (ex: schema usa `variant`, primitive usa `tone`).
 * Isso permite mudar o nome de campos no schema sem refatorar os primitives.
 *
 * NÃO mexer nos componentes em primitives.tsx — eles são a fonte da verdade
 * visual. Toda diferença vira adapter aqui.
 */

import type { ReactNode } from 'react';
import {
  Section,
  Callout,
  ComparisonTable,
} from './primitives';
import {
  SectionSchema,
  ParagraphSchema,
  CalloutSchema,
  CodeBlockSchema,
  ComparisonTableSchema,
  type Block,
} from './blocks/schemas';

// ─── Adapters por tipo ─────────────────────────────────────────────────────

interface AdapterEntry {
  /** Valida `data` e retorna ReactNode renderizado, ou null se inválido. */
  render: (data: unknown, children?: ReactNode) => ReactNode;
  /** Se true, o bloco pode ter children (Section, etc). */
  allowsChildren: boolean;
}

const ADAPTERS: Record<string, AdapterEntry> = {
  // Section: container com title + children.
  section: {
    allowsChildren: true,
    render: (data, children) => {
      const parsed = SectionSchema.safeParse(data);
      if (!parsed.success) {
        console.warn('[BlockRenderer] section inválido:', parsed.error.message);
        return null;
      }
      return <Section title={parsed.data.title}>{children}</Section>;
    },
  },

  // Paragraph: texto inline com marks (bold/italic/link/code).
  paragraph: {
    allowsChildren: false,
    render: (data) => {
      const parsed = ParagraphSchema.safeParse(data);
      if (!parsed.success) {
        console.warn('[BlockRenderer] paragraph inválido:', parsed.error.message);
        return null;
      }
      return (
        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--foreground)' }}>
          {parsed.data.content.map((node, i) => {
            let el: ReactNode = node.text;
            if (node.code) el = <code key={i} className="px-1 rounded" style={{ background: 'var(--ffv-bg2)' }}>{el}</code>;
            if (node.bold) el = <strong key={i}>{el}</strong>;
            if (node.italic) el = <em key={i}>{el}</em>;
            if (node.link) el = <a key={i} href={node.link} className="underline" style={{ color: 'var(--ffv-blue)' }}>{el}</a>;
            return <span key={i}>{el}</span>;
          })}
        </p>
      );
    },
  },

  // Callout: caixa de destaque. Mapeia variant→tone (legacy do primitive).
  callout: {
    allowsChildren: false,
    render: (data) => {
      const parsed = CalloutSchema.safeParse(data);
      if (!parsed.success) {
        console.warn('[BlockRenderer] callout inválido:', parsed.error.message);
        return null;
      }
      const variantToTone: Record<string, 'info' | 'warn' | 'danger' | 'success'> = {
        info: 'info',
        warning: 'warn',
        danger: 'danger',
        success: 'success',
      };
      const tone = variantToTone[parsed.data.variant];
      return (
        <Callout tone={tone}>
          {parsed.data.title && (
            <p className="font-bold mb-1">{parsed.data.title}</p>
          )}
          <p>{parsed.data.content}</p>
        </Callout>
      );
    },
  },

  // CodeBlock: bloco de código com linguagem. CodeBlock é async (Shiki), então
  // renderizamos um <pre> simples client-side. Sprint futura: SSR Shiki.
  code_block: {
    allowsChildren: false,
    render: (data) => {
      const parsed = CodeBlockSchema.safeParse(data);
      if (!parsed.success) {
        console.warn('[BlockRenderer] code_block inválido:', parsed.error.message);
        return null;
      }
      return (
        <div className="my-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--ffv-border)' }}>
          {parsed.data.filename && (
            <div className="px-3 py-1 text-xs font-mono" style={{ background: 'var(--ffv-bg2)', color: 'var(--ffv-muted)' }}>
              {parsed.data.filename}
            </div>
          )}
          <pre className="p-4 overflow-x-auto text-sm font-mono" style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
            <code data-language={parsed.data.language}>{parsed.data.code}</code>
          </pre>
        </div>
      );
    },
  },

  // ComparisonTable: tabela de comparação. Schema { columns, rows } → primitive { headers, rows }.
  comparison_table: {
    allowsChildren: false,
    render: (data) => {
      const parsed = ComparisonTableSchema.safeParse(data);
      if (!parsed.success) {
        console.warn('[BlockRenderer] comparison_table inválido:', parsed.error.message);
        return null;
      }
      return <ComparisonTable headers={parsed.data.columns} rows={parsed.data.rows} />;
    },
  },

  // ─── Tipos avançados — placeholder. Implementação completa em sprints futuras.
  // Por enquanto renderizam JSON para debug (vamos voltar e adicionar adapter real).
  flow_diagram: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="flow_diagram" />,
  },
  decision_box: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="decision_box" />,
  },
  arch_flow: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="arch_flow" />,
  },
  matrix_diagram: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="matrix_diagram" />,
  },
  stack_flow: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="stack_flow" />,
  },
  timeline: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="timeline" />,
  },
  node_graph: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="node_graph" />,
  },
  annotated_formula: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="annotated_formula" />,
  },
  quiz: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="quiz" />,
  },
  image: {
    allowsChildren: false,
    render: () => <PlaceholderBlock type="image" />,
  },
};

function PlaceholderBlock({ type }: { type: string }) {
  return (
    <div className="my-4 p-3 rounded-lg text-sm" style={{
      background: 'var(--ffv-bg2)',
      border: '1px dashed var(--ffv-border)',
      color: 'var(--ffv-muted)',
    }}>
      [bloco <code className="font-mono">{type}</code> ainda não implementado no BlockRenderer — Sprint 2-3]
    </div>
  );
}

// ─── Renderer recursivo ──────────────────────────────────────────────────────

export function BlockRenderer({ block }: { block: Block }) {
  const adapter = ADAPTERS[block.type];
  if (!adapter) {
    console.warn(`[BlockRenderer] tipo desconhecido: ${block.type}`);
    return null;
  }

  if (adapter.allowsChildren && block.children && block.children.length > 0) {
    return (
      <>
        {adapter.render(
          block.data,
          block.children.map(c => <BlockRenderer key={c.id} block={c} />)
        )}
      </>
    );
  }

  return <>{adapter.render(block.data)}</>;
}

// ─── Helper: renderiza array de blocos ───────────────────────────────────────

export function BlockTree({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map(b => <BlockRenderer key={b.id} block={b} />)}
    </>
  );
}
