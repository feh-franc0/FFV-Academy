/**
 * BlockRenderer — converte uma árvore de blocos JSON em componentes React.
 *
 * Mapeia cada `block.type` para um componente em primitives.tsx, validando
 * `block.data` antes de renderizar. Suporta os 22 tipos do CMS-driven content.
 *
 * Princípio: primitives.tsx NUNCA é modificado. Adapters inline aqui traduzem
 * o schema "neutro" do CMS para as props reais de cada primitive.
 *
 * NOTA: este arquivo usa `any` deliberadamente porque os adapters fazem
 * tradução entre 2 contratos (JSON dinâmico do DB vs props tipadas dos
 * primitives) — type assertions seriam mais ruidosas. asText() normaliza
 * qualquer formato pra string segura antes de chegar nos primitives.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ReactNode } from 'react';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
  KeyValue,
  FlowDiagram,
  StackFlow,
  ArchFlow,
  NodeGraph,
  Timeline,
  HierarchyDiagram,
  ComparisonFlow,
  SplitFlow,
  LayerStack,
  MatrixDiagram,
  AnnotatedFormula,
  ExamDomainBadge,
  MindMap,
} from './primitives';
import type { Block } from './blocks/schemas';

// ─── Helper: extrai texto de qualquer formato ───────────────────────────────

function asText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(asText).join(' ');
  if (value && typeof value === 'object' && 'text' in value) return asText((value as { text: unknown }).text);
  return '';
}

// ─── Adapters por tipo ─────────────────────────────────────────────────────

interface AdapterEntry {
  render: (data: any, children?: ReactNode) => ReactNode;
  allowsChildren: boolean;
}

const ADAPTERS: Record<string, AdapterEntry> = {
  // Container
  section: {
    allowsChildren: true,
    render: (data, children) => (
      <Section title={data?.title ?? ''}>{children}</Section>
    ),
  },

  // Texto
  paragraph: {
    allowsChildren: false,
    render: (data) => {
      const content = Array.isArray(data?.content) ? data.content : [];
      return (
        <p className="text-base leading-relaxed mb-4" style={{ color: 'var(--foreground)' }}>
          {content.map((node: any, i: number) => {
            const text = node?.text ?? '';
            let el: ReactNode = text;
            if (node?.code) el = <code key={i} className="px-1 rounded" style={{ background: 'var(--ffv-bg2)' }}>{el}</code>;
            if (node?.bold) el = <strong key={i}>{el}</strong>;
            if (node?.italic) el = <em key={i}>{el}</em>;
            if (node?.link) el = <a key={i} href={node.link} className="underline" style={{ color: 'var(--ffv-blue)' }}>{el}</a>;
            return <span key={i}>{el}</span>;
          })}
        </p>
      );
    },
  },

  // Callout (variant → tone)
  callout: {
    allowsChildren: false,
    render: (data) => {
      const map: Record<string, 'info' | 'warn' | 'danger' | 'success' | 'tip' | 'neutral'> = {
        info: 'info', warning: 'warn', danger: 'danger', success: 'success',
      };
      const tone = map[data?.variant as string] ?? 'info';
      return (
        <Callout tone={tone}>
          {data?.title ? <p className="font-bold mb-1">{data.title}</p> : null}
          <p>{asText(data?.content)}</p>
        </Callout>
      );
    },
  },

  code_block: {
    allowsChildren: false,
    render: (data) => (
      <div className="my-4 rounded-lg overflow-hidden" style={{ border: '1px solid var(--ffv-border)' }}>
        {data?.filename ? (
          <div className="px-3 py-1 text-xs font-mono" style={{ background: 'var(--ffv-bg2)', color: 'var(--ffv-muted)' }}>
            {data.filename}
          </div>
        ) : null}
        <pre className="p-4 overflow-x-auto text-sm font-mono" style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
          <code data-language={data?.language ?? 'text'}>{asText(data?.code)}</code>
        </pre>
      </div>
    ),
  },

  comparison_table: {
    allowsChildren: false,
    render: (data) => {
      const headers = Array.isArray(data?.columns) ? data.columns : [];
      const rows = Array.isArray(data?.rows) ? data.rows : [];
      if (headers.length === 0 || rows.length === 0) return null;
      return <ComparisonTable headers={headers} rows={rows} />;
    },
  },

  // Tipos avançados — todos os primitives reais

  qa_item: {
    allowsChildren: false,
    render: (data) => (
      <QAItem q={asText(data?.question)} a={asText(data?.answer)} />
    ),
  },

  decision_box: {
    allowsChildren: false,
    render: (data) => (
      <DecisionBox
        scenario={asText(data?.scenario)}
        winner={asText(data?.winner)}
        why={asText(data?.why)}
        alternatives={(data?.alternatives ?? []).map((a: any) => ({
          name: asText(a?.name),
          downside: asText(a?.downside ?? ''),
        }))}
      />
    ),
  },

  key_value: {
    allowsChildren: false,
    render: (data) => {
      const items = Array.isArray(data?.items) ? data.items : [];
      return <KeyValue items={items.map((i: any) => ({ k: asText(i?.k ?? i?.key), v: asText(i?.v ?? i?.value) }))} />;
    },
  },

  list: {
    allowsChildren: false,
    render: (data) => {
      const items = Array.isArray(data?.items) ? data.items : [];
      const ordered = !!data?.ordered;
      const Tag = (ordered ? 'ol' : 'ul') as 'ol' | 'ul';
      return (
        <Tag className={`my-4 ${ordered ? 'list-decimal' : 'list-disc'} ml-6 space-y-1`}>
          {items.map((it: any, i: number) => <li key={i}>{asText(it)}</li>)}
        </Tag>
      );
    },
  },

  flow_diagram: {
    allowsChildren: false,
    render: (data) => {
      const steps = Array.isArray(data?.steps) ? data.steps : [];
      if (steps.length === 0) return null;
      return (
        <FlowDiagram
          title={asText(data?.title)}
          orientation={(data?.orientation === 'vertical' ? 'vertical' : 'horizontal') as 'horizontal' | 'vertical'}
          steps={steps.map((s: any) => ({
            // Primitive aceita {label, desc} — adapter aceita também title/body.
            label: asText(s?.label ?? s?.title),
            desc: asText(s?.desc ?? s?.body ?? s?.subtitle ?? ''),
          }))}
        />
      );
    },
  },

  stack_flow: {
    allowsChildren: false,
    render: (data) => {
      const items = Array.isArray(data?.items) ? data.items : [];
      if (items.length === 0) return null;
      return (
        <StackFlow
          title={asText(data?.title)}
          items={items.map((s: any) => ({
            label: asText(s?.label ?? s?.title),
            text: asText(s?.text ?? s?.body ?? ''),
          }))}
        />
      );
    },
  },

  arch_flow: {
    allowsChildren: false,
    render: (data) => {
      const columns = Array.isArray(data?.columns) ? data.columns : [];
      if (columns.length === 0) return null;
      return (
        <ArchFlow
          title={asText(data?.title)}
          columns={columns.map((c: any) => ({
            title: asText(c?.title),
            items: Array.isArray(c?.items) ? c.items.map(asText) : [],
          }))}
        />
      );
    },
  },

  node_graph: {
    allowsChildren: false,
    render: (data) => {
      const columns = Array.isArray(data?.columns) ? data.columns : [];
      const legend = Array.isArray(data?.legend) ? data.legend : [];
      if (columns.length === 0) return null;
      return (
        <NodeGraph
          title={asText(data?.title)}
          columns={columns.map((c: any) => ({
            title: asText(c?.title),
            nodes: Array.isArray(c?.nodes) ? c.nodes.map((n: any) => ({
              label: asText(n?.label),
              note: asText(n?.note ?? ''),
            })) : [],
          }))}
          legend={legend.map((l: any) => ({ label: asText(l?.label), color: asText(l?.color ?? '') }))}
        />
      );
    },
  },

  timeline: {
    allowsChildren: false,
    render: (data) => {
      const events = Array.isArray(data?.events) ? data.events : [];
      if (events.length === 0) return null;
      return (
        <Timeline
          title={asText(data?.title)}
          events={events.map((e: any) => ({
            when: asText(e?.when ?? e?.date),
            label: asText(e?.label ?? e?.title),
            detail: asText(e?.detail ?? e?.body ?? e?.description ?? ''),
          }))}
        />
      );
    },
  },

  hierarchy_diagram: {
    allowsChildren: false,
    render: (data) => {
      const levels = Array.isArray(data?.levels) ? data.levels : [];
      if (levels.length === 0) return null;
      return (
        <HierarchyDiagram
          title={asText(data?.title)}
          levels={levels.map((l: any) => ({
            label: asText(l?.label),
            // Primitive espera {label, desc}. nodes (array) é colapsado em string.
            desc: Array.isArray(l?.nodes)
              ? l.nodes.map(asText).join(', ')
              : asText(l?.desc ?? ''),
          }))}
        />
      );
    },
  },

  comparison_flow: {
    allowsChildren: false,
    render: (data) => {
      // ComparisonFlow espera { label, steps: [{label, instruction?}] } em left/right
      const normalize = (x: any) => ({
        label: asText(x?.label ?? x?.title ?? 'Etapa'),
        steps: Array.isArray(x?.steps)
          ? x.steps.map((s: any) => ({ label: asText(s?.label ?? s?.title), instruction: asText(s?.instruction ?? s?.body ?? '') }))
          : [{ label: asText(x?.title ?? x?.label ?? ''), instruction: asText(x?.body ?? '') }],
      });
      const left = (Array.isArray(data?.left) ? data.left : []).map(normalize);
      const right = (Array.isArray(data?.right) ? data.right : []).map(normalize);
      // ComparisonFlow recebe left e right como ARRAY (várias colunas)
      // mas a versão atual aceita 1 só. Pegamos o primeiro.
      if (left.length === 0 || right.length === 0) return null;
      return (
        <ComparisonFlow
          title={asText(data?.title)}
          left={left[0]}
          right={right[0]}
        />
      );
    },
  },

  split_flow: {
    allowsChildren: false,
    render: (data) => {
      // SplitFlow espera { label, items: [{ label, sub? }] } em left/right.
      // O parser ingestor pode mandar arrays ou objetos — normalizamos.
      const normalizeCol = (raw: any): { label: string; items: { label: string; sub?: string }[] } => {
        if (Array.isArray(raw)) {
          return {
            label: '',
            items: raw.map((s: any) => ({ label: asText(s?.label ?? s?.title), sub: asText(s?.sub ?? s?.body ?? '') })),
          };
        }
        return {
          label: asText(raw?.label ?? raw?.title ?? ''),
          items: Array.isArray(raw?.items)
            ? raw.items.map((s: any) => ({ label: asText(s?.label ?? s?.title), sub: asText(s?.sub ?? s?.body ?? '') }))
            : [],
        };
      };
      return (
        <SplitFlow
          title={asText(data?.title)}
          center={asText(data?.center)}
          left={normalizeCol(data?.left)}
          right={normalizeCol(data?.right)}
        />
      );
    },
  },

  layer_stack: {
    allowsChildren: false,
    render: (data) => {
      const layers = Array.isArray(data?.layers) ? data.layers : [];
      if (layers.length === 0) return null;
      return (
        <LayerStack
          title={asText(data?.title)}
          separatorLabel={asText(data?.separatorLabel ?? '')}
          variant={(data?.variant === 'compact' ? 'compact' : 'default') as 'default' | 'compact'}
          layers={layers.map((l: any) => ({
            label: asText(l?.label ?? l?.title),
            instruction: asText(l?.instruction ?? l?.body ?? ''),
            note: asText(l?.note ?? l?.badge ?? ''),
          }))}
        />
      );
    },
  },

  matrix_diagram: {
    allowsChildren: false,
    render: (data) => {
      const rowLabels = Array.isArray(data?.rowLabels) ? data.rowLabels.map(asText) : [];
      const colLabels = Array.isArray(data?.colLabels) ? data.colLabels.map(asText) : [];
      const matrix = Array.isArray(data?.matrix) ? data.matrix : [];
      if (matrix.length === 0) return null;
      return (
        <MatrixDiagram
          title={asText(data?.title)}
          rowLabels={rowLabels}
          colLabels={colLabels}
          data={matrix}
        />
      );
    },
  },

  annotated_formula: {
    allowsChildren: false,
    render: (data) => {
      const parts = Array.isArray(data?.parts) ? data.parts : [];
      return (
        <AnnotatedFormula
          title={asText(data?.title)}
          formula={asText(data?.formula)}
          parts={parts.map((p: any) => ({
            symbol: asText(p?.symbol),
            name: asText(p?.name),
            color: asText(p?.color ?? 'var(--ffv-blue)'),
            description: asText(p?.description ?? ''),
          }))}
        />
      );
    },
  },

  exam_domain_badge: {
    allowsChildren: false,
    render: (data) => (
      <ExamDomainBadge domain={asText(data?.domain)} weight={asText(data?.weight)} />
    ),
  },

  mind_map: {
    allowsChildren: false,
    render: (data) => {
      const branches = Array.isArray(data?.branches) ? data.branches : [];
      return (
        <MindMap
          root={asText(data?.root)}
          branches={branches.map((b: any) => ({
            // Primitive espera {title, items: string[]}. Adapter aceita
            // ambos os formatos (label ou title, children ou items).
            title: asText(b?.title ?? b?.label),
            items: Array.isArray(b?.items)
              ? b.items.map(asText)
              : Array.isArray(b?.children)
                ? b.children.map(asText)
                : [],
          }))}
        />
      );
    },
  },

  quiz: {
    allowsChildren: false,
    render: () => null, // Quiz é gerenciado pelo ModuleLayout, não inline
  },

  image: {
    allowsChildren: false,
    render: (data) => (
      <figure className="my-4">
        <img src={asText(data?.src)} alt={asText(data?.alt)} className="rounded-lg max-w-full" />
        {data?.caption ? <figcaption className="text-sm text-center mt-2" style={{ color: 'var(--ffv-muted)' }}>{asText(data.caption)}</figcaption> : null}
      </figure>
    ),
  },
};

// ─── Renderer recursivo ──────────────────────────────────────────────────────

export function BlockRenderer({ block }: { block: Block }) {
  const adapter = ADAPTERS[block.type];
  if (!adapter) {
    // Em produção, blocos desconhecidos viram null silenciosamente.
    return null;
  }

  // NOTA: erros em runtime de um bloco específico devem ser capturados por
  // ErrorBoundary no parent (ModuleLayout), não try/catch aqui — React não
  // garante captura de erros assíncronos via try/catch em JSX.
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

export function BlockTree({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map(b => <BlockRenderer key={b.id} block={b} />)}
    </>
  );
}
