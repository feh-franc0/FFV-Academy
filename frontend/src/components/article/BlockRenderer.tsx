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
import { QuizBlock } from './QuizBlock';
import { AwsDiagram } from './AwsDiagram';
import type { Block } from './blocks/schemas';
import { BLOCK_DATA_SCHEMAS } from './blocks/schemas';

// ─── Helper: extrai texto de qualquer formato ───────────────────────────────

function asText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(asText).join(' ');
  if (value && typeof value === 'object' && 'text' in value) return asText((value as { text: unknown }).text);
  return '';
}

/**
 * Primeiro campo com texto, entre vários nomes possíveis.
 *
 * ─── Por que isso existe ───
 *
 * Os primitives em `primitives.tsx` aceitam mais nomes de campo do que os
 * adapters entregavam. `ArchFlow` lê `header` e `footer`; `AnnotatedFormula` lê
 * `text` e `annotation`; `StackFlow` lê `sub`, `detail` e `icon`; `LayerStack` lê
 * `content`. Os adapters achatavam o dado para um subconjunto antes de passar
 * adiante, e o que ficava fora era descartado.
 *
 * Consequência medida em ago/2026, varrendo os 393 seeds: mais de 1.300 campos
 * escritos por autor não apareciam em nenhuma página, em 100+ módulos. O caso
 * mais grave era `annotated_formula`, onde 148 de 197 anotações saíam com os três
 * campos visíveis vazios — a página mostrava a fórmula e um bloco em branco
 * embaixo. Nada quebrava, nada logava: o bloco renderizava, só sem conteúdo.
 *
 * Nenhum gate pegava porque todos verificavam se o bloco é VÁLIDO, e ele era.
 * `scripts/validate_primitives_render.py` agora verifica se ele tem CONTEÚDO.
 */
function primeiroTexto(fonte: unknown, ...chaves: string[]): string {
  if (!fonte || typeof fonte !== 'object') return '';
  const obj = fonte as Record<string, unknown>;
  for (const k of chaves) {
    const v = asText(obj[k]);
    if (v.trim()) return v;
  }
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
      // overflowWrap: identificador longo sem espaço não tem onde quebrar e
      // empurra a página lateralmente no mobile — um nome de finding do
      // GuardDuty tem 56 caracteres corridos. Só age em token que já não
      // caberia; texto normal continua quebrando por palavra.
      return (
        <p
          className="text-base leading-relaxed mb-4"
          style={{ color: 'var(--foreground)', overflowWrap: 'anywhere' }}
        >
          {content.map((node: any, i: number) => {
            const text = node?.text ?? '';
            let el: ReactNode = text;
            {/* `overflow-wrap: anywhere` porque identificador longo em code
                inline não tem espaço para quebrar e empurra a página lateralmente
                no mobile: `SageMakerVariantInvocationsPerInstance` mede 373px
                num viewport de 375px. Sem isto, 19 artigos rolavam de lado. */}
            if (node?.code) el = (
              <code
                key={i}
                className="px-1 rounded"
                style={{ background: 'var(--ffv-bg2)', overflowWrap: 'anywhere' }}
              >
                {el}
              </code>
            );
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
        {/*
          `scrollable-region-focusable`, a mesma correção que o `arch_diagram`
          recebeu em ago/2026 e que ficou sem generalizar. `overflow-x-auto` sem
          `tabIndex` deixa o conteúdo à direita inalcançável por teclado — e num
          bloco de código o que fica à direita costuma ser o fim do comando,
          justamente a parte que se copia.

          Alcance medido em 07/ago/2026: **136 dos 427 módulos** têm ao menos um
          `code_block` com linha acima de 88 caracteres, de 1.089 blocos de código
          na base. O axe só flagra onde o elemento realmente rola, então o defeito
          aparecia por página e nenhuma das 20 rotas auditadas o exercia.

          `role="group"` e não `region`: `region` é landmark, e nove blocos de
          código numa página produziriam nove landmarks de ruído no leitor de
          tela. `group` aceita nome acessível e não entra na lista de landmarks.
        */}
        <pre
          tabIndex={0}
          role="group"
          aria-label={data?.filename ? `Código: ${asText(data.filename)}` : `Bloco de código${data?.language ? ` em ${asText(data.language)}` : ''}`}
          className="p-4 overflow-x-auto text-sm font-mono focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ffv-blue)]"
          style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}
        >
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
          // `label` e `note` são os nomes usados na maior parte do conteúdo
          // existente; sem eles, 286 de 355 alternativas saíam sem a desvantagem
          // — que é justamente o que a caixa de decisão serve para mostrar.
          name: primeiroTexto(a, 'name', 'label'),
          downside: primeiroTexto(a, 'downside', 'note', 'when'),
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
          steps={steps.map((s: any) => (typeof s === 'string' ? s : {
            label: primeiroTexto(s, 'label', 'title', 'text'),
            desc: primeiroTexto(s, 'desc', 'body', 'subtitle', 'detail'),
            // O primitive desenha o ícone acima do rótulo; 47 dos 436 passos
            // trazem um, e o adapter não o passava.
            icon: primeiroTexto(s, 'icon') || undefined,
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
          items={items.map((s: any) => {
            if (typeof s === 'string') return s;
            const rotulo = primeiroTexto(s, 'label', 'layer', 'title');
            // O corpo do card no primitive é `detail` — NÃO `text`. O adapter
            // antigo passava só `{label, text}`, e como o StackFlow usa `text`
            // apenas como fallback de label, o texto do card não aparecia em 282
            // de 367 itens. `sub`, `icon` e `connector` eram descartados junto.
            const corpo = primeiroTexto(s, 'detail', 'text', 'body', 'desc', 'description');
            return {
              // Sem rótulo próprio, o corpo assume o rótulo — card com título e
              // sem texto lê melhor que card sem título. E evita repetir o mesmo
              // texto nas duas posições.
              label: rotulo || corpo,
              detail: rotulo ? corpo : '',
              icon: primeiroTexto(s, 'icon') || undefined,
              sub: primeiroTexto(s, 'sub', 'tech') || undefined,
              connector: primeiroTexto(s, 'connector') || undefined,
            };
          })}
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
            // 86 das 121 colunas usam `header`; o primitive lê os dois, o adapter
            // lia só `title`. `footer` e `useCases` eram descartados inteiros.
            title: primeiroTexto(c, 'title', 'header'),
            header: primeiroTexto(c, 'header') || undefined,
            headerColor: primeiroTexto(c, 'headerColor') || undefined,
            footer: primeiroTexto(c, 'footer') || undefined,
            items: Array.isArray(c?.items) ? c.items.map(asText) : [],
            useCases: Array.isArray(c?.useCases) ? c.useCases.map(asText) : undefined,
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
            // `label` é o nome usado em 126 das 141 colunas do conteúdo; sem ele
            // a coluna aparecia sem cabeçalho.
            title: primeiroTexto(c, 'title', 'label'),
            nodes: Array.isArray(c?.nodes) ? c.nodes.map((n: any) => (
              typeof n === 'string' ? n : {
                label: primeiroTexto(n, 'label', 'title'),
                // O primitive renderiza `sub`, não `note` — e 279 dos 318 nós do
                // conteúdo usam `sub`. O adapter passava só `note`, então o
                // subtítulo do nó não aparecia em nenhum diagrama de nó.
                sub: primeiroTexto(n, 'sub', 'note') || undefined,
                icon: primeiroTexto(n, 'icon') || undefined,
                tone: typeof n?.tone === 'string' ? n.tone : undefined,
              }
            )) : [],
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
          // `instruction` e `content` são slots DIFERENTES no primitive (um é a
          // orientação, o outro o corpo em mono). O adapter só passava
          // `instruction`, e 42 das 60 camadas do conteúdo usam `content` — a
          // camada aparecia com o rótulo e nada embaixo.
          layers={layers.map((l: any) => ({
            label: primeiroTexto(l, 'label', 'title'),
            instruction: primeiroTexto(l, 'instruction', 'body'),
            content: primeiroTexto(l, 'content') || undefined,
            note: primeiroTexto(l, 'note', 'badge'),
            tone: typeof l?.tone === 'string' ? l.tone : undefined,
            separatorAfter: l?.separatorAfter === true,
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
          // O adapter mapeava para `symbol`/`description`/`color` — campos que o
          // primitive NÃO tem. Ele renderiza `text`, `label`, `name`,
          // `annotation`, `note` e `highlight`. Resultado: 148 das 197 anotações
          // saíam com todos os campos visíveis vazios, e 19 módulos mostravam a
          // fórmula seguida de uma caixa em branco.
          parts={parts.map((p: any) => ({
            text: primeiroTexto(p, 'text', 'symbol'),
            label: primeiroTexto(p, 'label') || undefined,
            name: primeiroTexto(p, 'name') || undefined,
            annotation: primeiroTexto(p, 'annotation', 'description') || undefined,
            note: primeiroTexto(p, 'note') || undefined,
            highlight: p?.highlight === true,
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

  /**
   * Diagrama de arquitetura com ícones. `arch_diagram` é o canônico.
   *
   * `aws_diagram` continua registrado abaixo como alias: sem ele, todo seed que
   * ainda usasse o tipo antigo cairia em "no schema for block type" e o bloco
   * desapareceria da página sem erro — a falha mais perigosa desta base.
   */
  arch_diagram: {
    allowsChildren: false,
    render: (data) => {
      const groups = Array.isArray(data?.groups) ? data.groups : [];
      if (groups.length === 0) return null;

      // Só arestas e passos que referenciam nós existentes: id errado vira
      // aresta invisível apontando para lugar nenhum, que confunde mais que ajuda.
      const ids = new Set<string>();
      const cleanGroups = groups.map((g: any) => ({
        label: g?.label ? asText(g.label) : undefined,
        kind: ['account', 'vpc', 'region', 'plain'].includes(g?.kind) ? g.kind : 'plain',
        nodes: (Array.isArray(g?.nodes) ? g.nodes : []).map((n: any) => {
          const id = asText(n?.id);
          if (id) ids.add(id);
          return {
            id,
            service: asText(n?.service),
            label: n?.label ? asText(n.label) : undefined,
            note: n?.note ? asText(n.note) : undefined,
          };
        }).filter((n: any) => n.id && n.service),
      })).filter((g: any) => g.nodes.length > 0);

      const edges = (Array.isArray(data?.edges) ? data.edges : [])
        .map((e: any) => ({
          from: asText(e?.from),
          to: asText(e?.to),
          label: e?.label ? asText(e.label) : undefined,
          style: e?.style === 'dashed' ? 'dashed' as const : 'solid' as const,
        }))
        .filter((e: any) => ids.has(e.from) && ids.has(e.to));

      const steps = (Array.isArray(data?.steps) ? data.steps : []).map((s: any) => ({
        label: asText(s?.label),
        detail: s?.detail ? asText(s.detail) : undefined,
        nodes: Array.isArray(s?.nodes) ? s.nodes.map(asText).filter((i: string) => ids.has(i)) : undefined,
        edges: Array.isArray(s?.edges) ? s.edges.map(asText) : undefined,
      })).filter((s: any) => s.label);

      return (
        <AwsDiagram
          title={asText(data?.title)}
          caption={data?.caption ? asText(data.caption) : undefined}
          groups={cleanGroups}
          edges={edges}
          steps={steps}
        />
      );
    },
  },
  aws_diagram: {
    allowsChildren: false,
    render: (data) => {
      const groups = Array.isArray(data?.groups) ? data.groups : [];
      if (groups.length === 0) return null;

      // Só arestas e passos que referenciam nós existentes: id errado vira
      // aresta invisível apontando para lugar nenhum, que confunde mais que ajuda.
      const ids = new Set<string>();
      const cleanGroups = groups.map((g: any) => ({
        label: g?.label ? asText(g.label) : undefined,
        kind: ['account', 'vpc', 'region', 'plain'].includes(g?.kind) ? g.kind : 'plain',
        nodes: (Array.isArray(g?.nodes) ? g.nodes : []).map((n: any) => {
          const id = asText(n?.id);
          if (id) ids.add(id);
          return {
            id,
            service: asText(n?.service),
            label: n?.label ? asText(n.label) : undefined,
            note: n?.note ? asText(n.note) : undefined,
          };
        }).filter((n: any) => n.id && n.service),
      })).filter((g: any) => g.nodes.length > 0);

      const edges = (Array.isArray(data?.edges) ? data.edges : [])
        .map((e: any) => ({
          from: asText(e?.from),
          to: asText(e?.to),
          label: e?.label ? asText(e.label) : undefined,
          style: e?.style === 'dashed' ? 'dashed' as const : 'solid' as const,
        }))
        .filter((e: any) => ids.has(e.from) && ids.has(e.to));

      const steps = (Array.isArray(data?.steps) ? data.steps : []).map((s: any) => ({
        label: asText(s?.label),
        detail: s?.detail ? asText(s.detail) : undefined,
        nodes: Array.isArray(s?.nodes) ? s.nodes.map(asText).filter((i: string) => ids.has(i)) : undefined,
        edges: Array.isArray(s?.edges) ? s.edges.map(asText) : undefined,
      })).filter((s: any) => s.label);

      return (
        <AwsDiagram
          title={asText(data?.title)}
          caption={data?.caption ? asText(data.caption) : undefined}
          groups={cleanGroups}
          edges={edges}
          steps={steps}
        />
      );
    },
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
    render: (data) => <QuizBlock data={data} />,
  },

  image: {
    allowsChildren: false,
    render: (data) => (
      <figure className="my-4">
        {/* eslint-disable-next-line @next/next/no-img-element -- imagem do CMS sem width/height conhecidos em build-time; next/image exige dimensões fixas */}
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

  // Defesa em profundidade: revalida `block.data` com o schema Zod do tipo
  // ANTES de renderizar. Bloqueia payloads maliciosos que possam ter
  // contornado a validação do backend (ex: `link: "javascript:..."` em
  // paragraph, `src: "data:..."` em image). Se não há schema registrado,
  // log warning mas renderiza (retrocompatibilidade com tipos novos).
  const schema = BLOCK_DATA_SCHEMAS[block.type];
  let safeData: unknown = block.data;
  if (schema) {
    const parsed = schema.safeParse(block.data);
    if (!parsed.success) {
      console.warn(
        '[BlockRenderer] validation failed — block dropped',
        block.type,
        parsed.error.issues,
      );
      return null;
    }
    safeData = parsed.data;
  } else {
    console.warn('[BlockRenderer] no schema for block type, rendering raw', block.type);
  }

  // NOTA: erros em runtime de um bloco específico devem ser capturados por
  // ErrorBoundary no parent (ModuleLayout), não try/catch aqui — React não
  // garante captura de erros assíncronos via try/catch em JSX.
  if (adapter.allowsChildren && block.children && block.children.length > 0) {
    return (
      <>
        {adapter.render(
          safeData,
          block.children.map(c => <BlockRenderer key={c.id} block={c} />)
        )}
      </>
    );
  }
  return <>{adapter.render(safeData)}</>;
}

export function BlockTree({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map(b => <BlockRenderer key={b.id} block={b} />)}
    </>
  );
}
