'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AwsIcon, CATEGORY, serviceDef, type AwsCategory } from './AwsIcon';

/**
 * Diagrama de arquitetura AWS com ícones, agrupamentos, arestas direcionadas
 * e navegação passo a passo.
 *
 * As arestas são medidas no DOM (refs + ResizeObserver) e desenhadas num SVG
 * sobreposto — é o que permite layout responsivo sem coordenadas fixas.
 * Sem passos declarados, o diagrama é estático (e não vira client-side inútil:
 * o HTML dos nós já sai do servidor).
 */

export interface AwsNode {
  id: string;
  service: string;
  label?: string;
  note?: string;
}

export interface AwsGroup {
  label?: string;
  kind?: 'account' | 'vpc' | 'region' | 'plain';
  nodes: AwsNode[];
}

export interface AwsEdge {
  from: string;
  to: string;
  label?: string;
  style?: 'solid' | 'dashed';
}

export interface AwsStep {
  label: string;
  detail?: string;
  nodes?: string[];
  edges?: string[]; // "from>to"
}

const GROUP_STYLE: Record<NonNullable<AwsGroup['kind']>, { border: string; badge: string }> = {
  account: { border: 'var(--ffv-orange)', badge: 'Conta AWS' },
  vpc:     { border: '#8C4FFF',           badge: 'VPC' },
  region:  { border: 'var(--ffv-blue)',   badge: 'Região' },
  plain:   { border: 'var(--ffv-border)', badge: '' },
};

interface Box { x: number; y: number; w: number; h: number }

function pathBetween(a: Box, b: Box): string {
  const aMidY = a.y + a.h / 2;
  const bMidY = b.y + b.h / 2;
  const aMidX = a.x + a.w / 2;
  const bMidX = b.x + b.w / 2;

  // Alvo à direita: saída pela direita, entrada pela esquerda.
  if (b.x > a.x + a.w + 6) {
    const x1 = a.x + a.w, x2 = b.x;
    const c = Math.max(24, (x2 - x1) / 2);
    return `M ${x1} ${aMidY} C ${x1 + c} ${aMidY}, ${x2 - c} ${bMidY}, ${x2} ${bMidY}`;
  }
  // Alvo à esquerda: rota por baixo para não cruzar os nós.
  if (a.x > b.x + b.w + 6) {
    const x1 = a.x, x2 = b.x + b.w;
    const c = Math.max(24, (x1 - x2) / 2);
    return `M ${x1} ${aMidY} C ${x1 - c} ${aMidY}, ${x2 + c} ${bMidY}, ${x2} ${bMidY}`;
  }
  // Empilhados: vertical.
  if (b.y > a.y + a.h + 4) {
    const y1 = a.y + a.h, y2 = b.y;
    const c = Math.max(16, (y2 - y1) / 2);
    return `M ${aMidX} ${y1} C ${aMidX} ${y1 + c}, ${bMidX} ${y2 - c}, ${bMidX} ${y2}`;
  }
  const y1 = a.y, y2 = b.y + b.h;
  const c = Math.max(16, (y1 - y2) / 2);
  return `M ${aMidX} ${y1} C ${aMidX} ${y1 - c}, ${bMidX} ${y2 + c}, ${bMidX} ${y2}`;
}

export function AwsDiagram({
  title, groups, edges = [], steps = [], caption,
}: {
  title?: string;
  groups: AwsGroup[];
  edges?: AwsEdge[];
  steps?: AwsStep[];
  caption?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [size, setSize] = useState({ w: 0, h: 0 });
  // -1 = "ver tudo" (nada atenuado)
  const [step, setStep] = useState(-1);

  const setNodeRef = useCallback((id: string) => (el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  const measure = useCallback(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const base = wrap.getBoundingClientRect();
    const next: Record<string, Box> = {};
    nodeRefs.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next[id] = { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height };
    });
    setBoxes(next);
    setSize({ w: wrap.scrollWidth, h: wrap.scrollHeight });
  }, []);

  useEffect(() => {
    measure();
    const wrap = wrapRef.current;
    if (!wrap || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    nodeRefs.current.forEach(el => ro.observe(el));
    return () => ro.disconnect();
  }, [measure, groups]);

  const active = steps[step];
  const activeNodes = useMemo(
    () => (active?.nodes ? new Set(active.nodes) : null),
    [active],
  );
  const activeEdges = useMemo(
    () => (active?.edges ? new Set(active.edges) : null),
    [active],
  );

  const isNodeOn = (id: string) => !activeNodes || activeNodes.has(id);
  const isEdgeOn = (e: AwsEdge) => {
    if (!active) return true;
    if (activeEdges) return activeEdges.has(`${e.from}>${e.to}`);
    if (activeNodes) return activeNodes.has(e.from) && activeNodes.has(e.to);
    return true;
  };

  const usedCats = useMemo(() => {
    const s = new Set<AwsCategory>();
    groups.forEach(g => g.nodes.forEach(n => s.add(serviceDef(n.service).cat)));
    return [...s];
  }, [groups]);

  return (
    <figure data-ffv-visual="ArchDiagram" className="ffv-awsdiag not-prose my-7">
      {title && (
        <figcaption className="mb-3 text-[0.95rem] font-semibold text-[var(--ffv-text)]">
          {title}
        </figcaption>
      )}

      {steps.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5" role="group" aria-label="Passos do fluxo">
          <button
            type="button"
            onClick={() => setStep(-1)}
            aria-pressed={step === -1}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
              step === -1
                ? 'border-[var(--ffv-blue)] bg-[var(--ffv-blue)]/15 text-[var(--ffv-blue)]'
                : 'border-[var(--ffv-border)] text-[var(--ffv-muted)] hover:text-[var(--ffv-text)]'
            }`}
          >
            Ver tudo
          </button>
          {steps.map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStep(i)}
              aria-pressed={step === i}
              title={s.label}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                step === i
                  ? 'border-[var(--ffv-blue)] bg-[var(--ffv-blue)]/15 text-[var(--ffv-blue)]'
                  : 'border-[var(--ffv-border)] text-[var(--ffv-muted)] hover:text-[var(--ffv-text)]'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/*
        `scrollable-region-focusable`: o diagrama é mais largo que a coluna de
        leitura e rola na horizontal. Sem `tabIndex`, quem navega por teclado não
        consegue rolá-lo — o conteúdo à direita fica inalcançável sem mouse. Foi
        o axe-core que achou, em 06/ago/2026, dez ocorrências por página nos
        módulos de arquitetura.

        `role="region"` + rótulo dão ao leitor de tela o que é essa área; sem
        rótulo, ela é anunciada como "região" e nada mais.
      */}
      <div
        tabIndex={0}
        role="region"
        aria-label={title ? `Diagrama: ${title}` : 'Diagrama de arquitetura'}
        className="overflow-x-auto rounded-xl border border-[var(--ffv-border)] bg-[var(--ffv-bg2)] p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ffv-blue)]"
      >
        <div ref={wrapRef} className="relative flex min-w-max flex-wrap items-start gap-4 md:flex-nowrap">
          {/* Arestas: SVG sobreposto, medido no DOM */}
          {size.w > 0 && (
            <svg
              className="pointer-events-none absolute inset-0"
              width={size.w}
              height={size.h}
              aria-hidden="true"
              style={{ overflow: 'visible' }}
            >
              <defs>
                <marker id="ffv-arrow" viewBox="0 0 10 10" refX="9" refY="5"
                        markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
                </marker>
              </defs>
              {edges.map((e, i) => {
                const a = boxes[e.from];
                const b = boxes[e.to];
                if (!a || !b) return null;
                const on = isEdgeOn(e);
                return (
                  <g key={i} style={{ color: on ? 'var(--ffv-blue)' : 'var(--ffv-border)', opacity: on ? 1 : 0.35, transition: 'opacity .18s' }}>
                    <path
                      d={pathBetween(a, b)}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={on ? 1.9 : 1.2}
                      strokeDasharray={e.style === 'dashed' ? '5 4' : undefined}
                      markerEnd="url(#ffv-arrow)"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {groups.map((g, gi) => {
            const kind = g.kind ?? 'plain';
            const gs = GROUP_STYLE[kind];
            return (
              <div
                key={gi}
                className="relative z-[1] flex min-w-[190px] flex-1 flex-col gap-2.5 rounded-lg p-3"
                style={{
                  border: `1px ${kind === 'plain' ? 'solid' : 'dashed'} color-mix(in srgb, ${gs.border} 55%, transparent)`,
                  background: 'color-mix(in srgb, var(--ffv-bg) 60%, transparent)',
                }}
              >
                {(g.label || gs.badge) && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-wide" style={{ color: gs.border }}>
                      {g.label ?? gs.badge}
                    </span>
                    {g.label && gs.badge && (
                      <span className="text-[0.62rem] uppercase tracking-wide text-[var(--ffv-muted)]">{gs.badge}</span>
                    )}
                  </div>
                )}

                {g.nodes.map(n => {
                  const def = serviceDef(n.service);
                  const on = isNodeOn(n.id);
                  return (
                    <div
                      key={n.id}
                      ref={setNodeRef(n.id)}
                      className="flex items-start gap-2.5 rounded-lg border p-2.5 transition-opacity"
                      style={{
                        borderColor: on
                          ? `color-mix(in srgb, ${CATEGORY[def.cat].color} 40%, transparent)`
                          : 'var(--ffv-border)',
                        background: 'var(--ffv-bg2)',
                        opacity: on ? 1 : 0.32,
                      }}
                    >
                      <AwsIcon service={n.service} />
                      <span className="min-w-0">
                        <span className="block text-[0.82rem] font-semibold leading-tight text-[var(--ffv-text)]">
                          {n.label ?? def.label}
                        </span>
                        {n.note && (
                          <span className="mt-0.5 block text-[0.72rem] leading-snug text-[var(--ffv-muted)]">
                            {n.note}
                          </span>
                        )}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Rótulos das arestas: lidos em qualquer largura, sem depender do SVG */}
      {edges.some(e => e.label) && (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-[var(--ffv-muted)]">
          {edges.filter(e => e.label).map((e, i) => (
            <li key={i} style={{ opacity: isEdgeOn(e) ? 1 : 0.4 }}>
              <span className="text-[var(--ffv-blue)]">→</span> {e.label}
            </li>
          ))}
        </ul>
      )}

      {active && (
        <p className="mt-3 rounded-lg border border-[var(--ffv-blue)]/30 bg-[var(--ffv-blue)]/[0.07] p-3 text-[0.85rem] leading-relaxed text-[var(--ffv-text)]">
          <strong className="text-[var(--ffv-blue)]">Passo {step + 1}. {active.label}</strong>
          {active.detail && <> — {active.detail}</>}
        </p>
      )}

      {/* Legenda de categorias */}
      <ul className="mt-3 flex flex-wrap gap-x-3.5 gap-y-1 text-[0.7rem] text-[var(--ffv-muted)]">
        {usedCats.map(c => (
          <li key={c} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: CATEGORY[c].color }} />
            {CATEGORY[c].label}
          </li>
        ))}
      </ul>

      {caption && (
        <p className="mt-2 text-[0.78rem] leading-relaxed text-[var(--ffv-muted)]">{caption}</p>
      )}

      {/* Descrição textual do fluxo — leitores de tela e impressão */}
      {steps.length > 0 && (
        <ol className="sr-only">
          {steps.map((s, i) => (
            <li key={i}>{s.label}{s.detail ? `. ${s.detail}` : ''}</li>
          ))}
        </ol>
      )}
    </figure>
  );
}
