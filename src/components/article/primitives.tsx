import { Fragment, type ReactNode } from 'react';
import { highlight } from 'sugar-high';

type Tone = 'info' | 'warn' | 'danger' | 'success' | 'neutral';

const TONE: Record<Tone, { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: 'rgba(88,166,255,0.08)',  border: 'rgba(88,166,255,0.25)',  color: 'var(--ffv-blue)',   icon: '💡' },
  warn:    { bg: 'rgba(255,166,87,0.08)',  border: 'rgba(255,166,87,0.25)',  color: 'var(--ffv-orange)', icon: '⚠️' },
  danger:  { bg: 'rgba(247,129,102,0.10)', border: 'rgba(247,129,102,0.30)', color: 'var(--ffv-red)',    icon: '🚨' },
  success: { bg: 'rgba(63,185,80,0.08)',   border: 'rgba(63,185,80,0.25)',   color: 'var(--ffv-green)',  icon: '✅' },
  neutral: { bg: 'var(--ffv-bg2)',         border: 'var(--ffv-border)',      color: 'var(--ffv-muted)',  icon: '📌' },
};

/** Slugify a section title into an id-friendly, stable anchor. */
export function sectionId(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function Section({ title, accent = 'var(--ffv-blue)', id, children }: {
  title: string;
  accent?: string;
  id?: string;
  children: ReactNode;
}) {
  const anchor = id ?? sectionId(title);
  return (
    <section id={anchor} data-section-title={title} style={{ scrollMarginTop: 80 }}>
      <h2 className="text-base font-bold mb-3 flex items-center gap-2">
        <span className="w-1 h-4 rounded-full inline-block" style={{ background: accent }} />
        {title}
      </h2>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

export function Callout({ tone = 'info', icon, children }: {
  tone?: Tone;
  icon?: string;
  children: ReactNode;
}) {
  const t = TONE[tone];
  return (
    <div className="p-4 rounded-xl flex gap-3" style={{ background: t.bg, border: `1px solid ${t.border}` }}>
      <span className="text-xl flex-shrink-0">{icon ?? t.icon}</span>
      <div className="text-sm leading-6" style={{ color: 'var(--foreground)' }}>{children}</div>
    </div>
  );
}

export function CodeBlock({ lang, children }: { lang?: string; children: ReactNode }) {
  const code = typeof children === 'string' ? children : String(children ?? '');
  const highlighted = highlight(code);
  return (
    <div className="rounded-lg overflow-hidden sh-codeblock" style={{ border: '1px solid var(--ffv-border)' }}>
      {lang && (
        <div className="text-[10px] px-3 py-1 uppercase tracking-wider" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-muted)', fontFamily: 'var(--font-roboto-mono)' }}>
          {lang}
        </div>
      )}
      <pre className="p-4 text-xs overflow-x-auto whitespace-pre-wrap" style={{ background: 'var(--ffv-bg2)', fontFamily: 'var(--font-roboto-mono)' }}>
        <code dangerouslySetInnerHTML={{ __html: highlighted }} />
      </pre>
    </div>
  );
}

export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)', color: 'var(--ffv-orange)', fontFamily: 'var(--font-roboto-mono)' }}>
      {children}
    </code>
  );
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="px-1.5 py-0.5 text-[10px] rounded" style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)', fontFamily: 'var(--font-roboto-mono)', boxShadow: '0 1px 0 var(--ffv-border)' }}>
      {children}
    </kbd>
  );
}

export function ComparisonTable({ headers, rows, accent = 'var(--ffv-blue)' }: {
  headers: string[];
  rows: (string | ReactNode)[][];
  accent?: string;
}) {
  return (
    <>
      {/* Desktop: table layout */}
      <div className="hidden sm:block overflow-x-auto rounded-xl" style={{ border: '1px solid var(--ffv-border)' }}>
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--ffv-bg2)' }}>
              {headers.map((h, i) => (
                <th
                  key={i}
                  className="text-left px-3 py-2 font-semibold"
                  style={{ color: i === 0 ? accent : 'var(--foreground)', borderBottom: '1px solid var(--ffv-border)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: ri % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)' }}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className="px-3 py-2 align-top"
                    style={{
                      color: ci === 0 ? 'var(--foreground)' : 'var(--ffv-muted)',
                      borderBottom: ri === rows.length - 1 ? 'none' : '1px solid var(--ffv-border)',
                      fontWeight: ci === 0 ? 600 : 400,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: stacked cards */}
      <div className="sm:hidden flex flex-col gap-3">
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="rounded-xl p-3"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            {row.map((cell, ci) => (
              <div
                key={ci}
                className="flex items-start gap-2 text-xs"
                style={{ marginBottom: ci < row.length - 1 ? 6 : 0 }}
              >
                <span
                  className="flex-shrink-0 font-semibold"
                  style={{ color: accent, minWidth: 80 }}
                >
                  {headers[ci]}
                </span>
                <span style={{ color: ci === 0 ? 'var(--foreground)' : 'var(--ffv-muted)', fontWeight: ci === 0 ? 600 : 400 }}>
                  {cell}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

export function DecisionBox({ scenario, winner, winnerColor = 'var(--ffv-blue)', why, alternatives }: {
  scenario: string;
  winner: string;
  winnerColor?: string;
  why: string;
  alternatives?: { name?: string; label?: string; note?: string; when?: string }[];
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${winnerColor}25` }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>📋 {scenario}</p>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${winnerColor}18`, color: winnerColor }}>
          ✓ {winner}
        </span>
      </div>
      <p className="text-xs mb-2" style={{ color: 'var(--ffv-muted)' }}>{why}</p>
      {alternatives && alternatives.length > 0 && (
        <div className="flex flex-col gap-1">
          {alternatives.map((alt, i) => {
            const altName = alt.name ?? alt.label ?? '';
            const altNote = alt.note ?? alt.when ?? '';
            return (
              <p key={altName || i} className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                <span style={{ color: 'var(--ffv-border)' }}>Alt: </span>
                <span className="font-semibold">{altName}</span> — {altNote}
              </p>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function MindMap({ root, branches, accent = 'var(--ffv-blue)' }: {
  root: string;
  branches: { title: string; items: string[] }[];
  accent?: string;
}) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
      <p className="text-sm font-bold mb-3" style={{ color: accent }}>🧠 {root}</p>
      <div className="flex flex-col gap-3">
        {branches.map((b, i) => (
          <div key={i} className="pl-3" style={{ borderLeft: `2px solid ${accent}30` }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--foreground)' }}>{b.title}</p>
            <ul className="flex flex-col gap-0.5">
              {b.items.map((it, j) => (
                <li key={j} className="text-xs flex items-start gap-2" style={{ color: 'var(--ffv-muted)' }}>
                  <span style={{ color: accent }}>→</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ArchDiagram({ title, children, accent = 'var(--ffv-blue)' }: {
  title?: string;
  children: ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <pre
        className="overflow-x-auto whitespace-pre"
        style={{
          color: 'var(--foreground)',
          fontFamily: 'var(--font-roboto-mono), ui-monospace, "SF Mono", Menlo, Consolas, monospace',
          fontSize: '13px',
          lineHeight: 1.45,
          letterSpacing: '0',
          padding: '24px 20px',
          background: `linear-gradient(180deg, color-mix(in srgb, ${accent} 4%, var(--ffv-bg2)) 0%, var(--ffv-bg2) 100%)`,
          fontVariantLigatures: 'none',
          tabSize: 2,
        }}
      >
        {children}
      </pre>
    </div>
  );
}

export function QAItem({ q, a }: { q: string; a: ReactNode }) {
  return (
    <div className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
      <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ffv-blue)' }}>❓ {q}</p>
      <div className="text-xs leading-6" style={{ color: 'var(--ffv-muted)' }}>{a}</div>
    </div>
  );
}

// ─── Visual diagram components (replace ASCII ArchDiagram) ──────────────────

/** Nested boxes hierarchy — IA > ML > Deep Learning > LLMs */
export function HierarchyDiagram({ title, levels, accent = 'var(--ffv-blue)' }: {
  title?: string;
  levels: { label: string; desc?: string }[];
  accent?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-5">
        {levels.map((level, i) => {
          const depth = i;
          const opacity = Math.max(0.08, 0.18 - depth * 0.02);
          return (
            <div
              key={i}
              className="rounded-lg p-3"
              style={{
                marginLeft: `${depth * 20}px`,
                marginBottom: i < levels.length - 1 ? '0' : undefined,
                border: `1px solid ${accent}${Math.round((0.35 - depth * 0.05) * 255).toString(16).padStart(2, '0')}`,
                background: `color-mix(in srgb, ${accent} ${Math.round(opacity * 100)}%, var(--ffv-bg2))`,
                marginTop: i > 0 ? '-1px' : undefined,
                position: 'relative',
                zIndex: levels.length - i,
              }}
            >
              <span className="text-xs font-bold uppercase tracking-wide" style={{ color: accent }}>
                {level.label}
              </span>
              {level.desc && (
                <span className="text-xs ml-2" style={{ color: 'var(--ffv-muted)' }}>
                  — {level.desc}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Sequential flow with arrows — A → B → C → D */
export function FlowDiagram({ title, steps, orientation = 'horizontal', accent = 'var(--ffv-blue)' }: {
  title?: string;
  steps: { icon?: string; label: string; desc?: string }[];
  orientation?: 'horizontal' | 'vertical';
  accent?: string;
}) {
  const isHorizontal = orientation === 'horizontal';
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div
        className={isHorizontal ? 'flex flex-row flex-wrap items-center gap-0 p-5' : 'flex flex-col gap-0 p-5'}
        style={{ background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 4%, var(--ffv-bg2)) 0%, var(--ffv-bg2) 100%)` }}
      >
        {steps.map((step, i) => (
          <Fragment key={i}>
            <div
              className="flex flex-col items-center text-center rounded-lg p-3 min-w-[100px]"
              style={{
                border: `1px solid ${accent}35`,
                background: `color-mix(in srgb, ${accent} 10%, var(--ffv-bg2))`,
                flex: isHorizontal ? '1 1 0' : undefined,
              }}
            >
              {step.icon && <span className="text-xl mb-1">{step.icon}</span>}
              <span className="text-xs font-bold" style={{ color: accent }}>{step.label}</span>
              {step.desc && (
                <span className="text-[11px] mt-1 leading-4" style={{ color: 'var(--ffv-muted)' }}>{step.desc}</span>
              )}
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex items-center justify-center font-bold text-base shrink-0 ${isHorizontal ? 'px-1' : 'py-1 self-center'}`}
                style={{ color: `${accent}90` }}
              >
                {isHorizontal ? '→' : '↓'}
              </div>
            )}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

/** Two parallel flows side by side — Traditional Programming vs ML */
export function ComparisonFlow({ title, left, right, accent = 'var(--ffv-blue)' }: {
  title?: string;
  left: { label: string; steps: string[] };
  right: { label: string; steps: string[] };
  accent?: string;
}) {
  const renderFlow = (flow: { label: string; steps: string[] }, color: string) => (
    <div className="flex-1 flex flex-col gap-2">
      <div
        className="rounded-lg px-3 py-2 text-center text-[10px] font-bold uppercase tracking-widest"
        style={{ background: `color-mix(in srgb, ${color} 18%, var(--ffv-bg2))`, color, border: `1px solid ${color}40` }}
      >
        {flow.label}
      </div>
      {flow.steps.map((step, i) => (
        <Fragment key={i}>
          <div
            className="rounded-lg px-3 py-2 text-center text-xs"
            style={{ background: `color-mix(in srgb, ${color} 8%, var(--ffv-bg2))`, color: 'var(--foreground)', border: `1px solid ${color}25` }}
          >
            {step}
          </div>
          {i < flow.steps.length - 1 && (
            <div className="text-center text-base" style={{ color: `${color}70` }}>↓</div>
          )}
        </Fragment>
      ))}
    </div>
  );

  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-5 flex gap-4">
        {renderFlow(left, accent)}
        <div className="flex items-center justify-center text-2xl shrink-0" style={{ color: 'var(--ffv-muted)' }}>⟺</div>
        {renderFlow(right, 'var(--ffv-green)')}
      </div>
    </div>
  );
}

/** Multi-column architecture diagram — Encoder-only vs Decoder-only vs Encoder-Decoder */
export function ArchFlow({ title, columns, accent = 'var(--ffv-blue)' }: {
  title?: string;
  columns: {
    header: string;
    headerColor?: string;
    items: string[];
    footer?: string;
    useCases?: string[];
  }[];
  accent?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-5 grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
        {columns.map((col, i) => {
          const color = col.headerColor ?? accent;
          return (
            <div
              key={i}
              className="flex flex-col rounded-lg overflow-hidden"
              style={{ border: `1px solid ${color}35` }}
            >
              <div
                className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide"
                style={{ background: `color-mix(in srgb, ${color} 20%, var(--ffv-bg2))`, color }}
              >
                {col.header}
              </div>
              <div className="flex-1 flex flex-col gap-1 p-3" style={{ background: `color-mix(in srgb, ${color} 5%, var(--ffv-bg2))` }}>
                {col.items.filter(Boolean).map((item, j) => (
                  <div key={j} className="text-[11px] leading-5 py-1 px-2 rounded" style={{ color: 'var(--foreground)', background: `color-mix(in srgb, ${color} 8%, var(--ffv-bg2))`, border: `1px solid ${color}20` }}>
                    {item}
                  </div>
                ))}
              </div>
              {col.footer && (
                <div className="px-3 py-2 text-center text-[10px] font-semibold" style={{ background: `color-mix(in srgb, ${color} 12%, var(--ffv-bg2))`, color, borderTop: `1px solid ${color}25` }}>
                  {col.footer}
                </div>
              )}
              {col.useCases && col.useCases.length > 0 && (
                <div className="px-3 py-2" style={{ borderTop: `1px solid ${color}20`, background: 'var(--ffv-bg2)' }}>
                  <div className="text-[10px] font-semibold mb-1" style={{ color: 'var(--ffv-muted)' }}>CASOS DE USO</div>
                  {col.useCases.map((uc, j) => (
                    <div key={j} className="text-[11px] leading-5" style={{ color: 'var(--ffv-muted)' }}>• {uc}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** Attention weight matrix — colored cells by intensity */
export function MatrixDiagram({ title, rowLabels, colLabels, data, highlightThreshold = 0.5, accent = 'var(--ffv-blue)' }: {
  title?: string;
  rowLabels: string[];
  colLabels: string[];
  data: number[][];
  highlightThreshold?: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-5 overflow-x-auto">
        <table className="w-full border-collapse text-center text-xs" style={{ tableLayout: 'auto' }}>
          <thead>
            <tr>
              <th className="p-2" style={{ color: 'var(--ffv-muted)', fontWeight: 400 }}></th>
              {colLabels.map((col, i) => (
                <th key={i} className="p-2 font-bold text-[11px]" style={{ color: accent }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((row, ri) => (
              <tr key={ri}>
                <td className="p-2 font-bold text-[11px] text-left" style={{ color: accent }}>{row}</td>
                {data[ri]?.map((val, ci) => {
                  const intensity = Math.round(val * 60);
                  const isHigh = val >= highlightThreshold;
                  return (
                    <td
                      key={ci}
                      className="p-2 rounded"
                      style={{
                        background: isHigh
                          ? `color-mix(in srgb, ${accent} ${intensity}%, var(--ffv-bg2))`
                          : `color-mix(in srgb, ${accent} ${Math.max(4, intensity / 3)}%, var(--ffv-bg2))`,
                        color: isHigh ? 'var(--foreground)' : 'var(--ffv-muted)',
                        fontWeight: isHigh ? 600 : 400,
                        border: `1px solid ${accent}20`,
                        fontSize: '11px',
                      }}
                    >
                      {val.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ExamDomainBadge({ domain, weight, color = 'var(--ffv-orange)' }: {
  domain: string;
  weight?: string;
  color?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px]" style={{ background: `${color}15`, border: `1px solid ${color}40`, color }}>
      <span className="font-semibold uppercase tracking-wider">📘 {domain}</span>
      {weight && <span style={{ opacity: 0.8 }}>· {weight}</span>}
    </div>
  );
}

export function StackFlow({ title, items, accent = 'var(--ffv-blue)' }: {
  title?: string;
  items: {
    icon?: string;
    label: string;
    sub?: string;
    detail?: ReactNode;
    connector?: string;
    color?: string;
  }[];
  accent?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-4 sm:p-6 flex flex-col items-center gap-0">
        {items.map((it, i) => {
          const cardColor = it.color ?? accent;
          return (
            <div key={i} className="w-full flex flex-col items-center">
              <div
                className="w-full max-w-lg rounded-xl px-4 py-3.5"
                style={{
                  background: `color-mix(in srgb, ${cardColor} 12%, var(--ffv-bg))`,
                  border: `1px solid color-mix(in srgb, ${cardColor} 55%, transparent)`,
                  boxShadow: `0 1px 0 ${cardColor}25`,
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  {it.icon && <span className="text-lg leading-none">{it.icon}</span>}
                  <span className="text-sm font-bold" style={{ color: cardColor }}>{it.label}</span>
                  {it.sub && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full ml-auto font-medium uppercase tracking-wider" style={{ background: `color-mix(in srgb, ${cardColor} 15%, transparent)`, color: cardColor, border: `1px solid color-mix(in srgb, ${cardColor} 40%, transparent)` }}>
                      {it.sub}
                    </span>
                  )}
                </div>
                {it.detail && (
                  <div className="text-[11.5px] leading-relaxed" style={{ color: 'var(--foreground)' }}>{it.detail}</div>
                )}
              </div>
              {i < items.length - 1 && (
                <div className="flex flex-col items-center py-1">
                  <div className="w-px h-4" style={{ background: `${accent}55` }} />
                  {it.connector && (
                    <span
                      className="text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider font-semibold my-0.5"
                      style={{ background: 'var(--ffv-bg)', color: accent, border: `1px solid ${accent}45`, fontFamily: 'var(--font-roboto-mono)' }}
                    >
                      {it.connector}
                    </span>
                  )}
                  <div className="w-px h-4" style={{ background: `${accent}55` }} />
                  <span className="text-sm leading-none" style={{ color: accent, marginTop: -4 }}>▼</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SplitFlow({ title, left, right, center, accent = 'var(--ffv-blue)' }: {
  title?: string;
  left: { label: string; items: { icon?: string; label: string; sub?: string }[] };
  right: { label: string; items: { icon?: string; label: string; sub?: string }[] };
  center?: string;
  accent?: string;
}) {
  const renderColumn = (col: typeof left, side: 'left' | 'right') => (
    <div className="flex-1 flex flex-col gap-2">
      <div
        className="text-[10px] uppercase tracking-widest font-bold text-center py-1.5 rounded-md"
        style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}40` }}
      >
        {col.label}
      </div>
      {col.items.map((it, i) => (
        <div
          key={i}
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{
            background: `color-mix(in srgb, ${accent} 8%, var(--ffv-bg))`,
            border: `1px solid ${accent}35`,
          }}
        >
          {it.icon && <span className="text-sm">{it.icon}</span>}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{it.label}</div>
            {it.sub && <div className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>{it.sub}</div>}
          </div>
          {side === 'left' && <span className="text-xs" style={{ color: accent }}>→</span>}
          {side === 'right' && <span className="text-xs" style={{ color: accent }}>←</span>}
        </div>
      ))}
    </div>
  );
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-4 flex items-stretch gap-3">
        {renderColumn(left, 'left')}
        {center && (
          <div className="flex items-center justify-center px-2">
            <div className="text-center">
              <div className="text-[10px] font-mono px-2 py-1 rounded" style={{ background: `${accent}20`, color: accent, border: `1px solid ${accent}50` }}>
                {center}
              </div>
            </div>
          </div>
        )}
        {renderColumn(right, 'right')}
      </div>
    </div>
  );
}

export function LayerStack({ title, accent = 'var(--ffv-blue)', layers, separatorLabel, variant = 'default' }: {
  title?: string;
  accent?: string;
  separatorLabel?: string;
  variant?: 'default' | 'compact';
  layers: {
    label: string;
    instruction?: string;
    content?: string;
    note?: string;
    tone?: 'writable' | 'default' | 'base' | 'danger' | 'success';
    separatorAfter?: boolean;
  }[];
}) {
  const toneStyles = (tone: string | undefined) => {
    switch (tone) {
      case 'writable':
        return {
          bg: 'color-mix(in srgb, var(--ffv-orange) 14%, var(--ffv-bg))',
          border: 'color-mix(in srgb, var(--ffv-orange) 55%, transparent)',
          label: 'var(--ffv-orange)',
        };
      case 'base':
        return {
          bg: 'var(--ffv-bg3)',
          border: 'var(--ffv-border)',
          label: 'var(--ffv-muted)',
        };
      case 'danger':
        return {
          bg: 'color-mix(in srgb, var(--ffv-red) 14%, var(--ffv-bg))',
          border: 'color-mix(in srgb, var(--ffv-red) 55%, transparent)',
          label: 'var(--ffv-red)',
        };
      case 'success':
        return {
          bg: 'color-mix(in srgb, var(--ffv-green) 14%, var(--ffv-bg))',
          border: 'color-mix(in srgb, var(--ffv-green) 55%, transparent)',
          label: 'var(--ffv-green)',
        };
      default:
        return {
          bg: `color-mix(in srgb, ${accent} 12%, var(--ffv-bg))`,
          border: `color-mix(in srgb, ${accent} 50%, transparent)`,
          label: accent,
        };
    }
  };
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-4 sm:p-5 flex flex-col gap-2">
        {layers.map((l, i) => {
          const ts = toneStyles(l.tone);
          if (variant === 'compact') {
            return (
              <Fragment key={i}>
                <div
                  className="rounded-md px-3 py-2 flex items-center gap-2"
                  style={{ background: ts.bg, border: `1px solid ${ts.border}` }}
                >
                  <span className="text-[10px] font-bold uppercase tracking-wider flex-shrink-0" style={{ color: ts.label }}>
                    {l.label}
                  </span>
                  <div className="flex-1 min-w-0 flex flex-col">
                    {l.instruction && (
                      <code className="text-[11px] truncate" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-roboto-mono)' }}>
                        {l.instruction}
                      </code>
                    )}
                    {l.content && (
                      <div className="text-[11px] truncate" style={{ color: 'var(--foreground)' }}>
                        {l.content}
                      </div>
                    )}
                    {l.note && (
                      <div className="text-[9px] italic" style={{ color: 'var(--ffv-muted)' }}>
                        {l.note}
                      </div>
                    )}
                  </div>
                </div>
                {l.separatorAfter && (
                  <div className="flex items-center gap-2 py-0.5">
                    <div className="flex-1 border-t border-dashed" style={{ borderColor: `${accent}55` }} />
                    {separatorLabel && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--ffv-bg)', color: accent, border: `1px solid ${accent}40` }}>
                        {separatorLabel}
                      </span>
                    )}
                    <div className="flex-1 border-t border-dashed" style={{ borderColor: `${accent}55` }} />
                  </div>
                )}
              </Fragment>
            );
          }
          return (
            <Fragment key={i}>
              <div className="flex items-stretch gap-3">
                <div className="w-24 sm:w-28 flex-shrink-0 flex flex-col justify-center items-end gap-0.5 text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ts.label }}>
                    {l.label}
                  </span>
                  {l.note && (
                    <span className="text-[9px] italic" style={{ color: 'var(--ffv-muted)' }}>
                      {l.note}
                    </span>
                  )}
                </div>
                <div className="flex items-center text-sm" style={{ color: ts.label }}>→</div>
                <div
                  className="flex-1 rounded-md px-3 py-2 flex flex-col gap-0.5"
                  style={{ background: ts.bg, border: `1px solid ${ts.border}` }}
                >
                  {l.instruction && (
                    <code className="text-xs" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-roboto-mono)' }}>
                      {l.instruction}
                    </code>
                  )}
                  {l.content && (
                    <div className="text-[11px]" style={{ color: l.instruction ? 'var(--ffv-muted)' : 'var(--foreground)', fontFamily: l.instruction ? 'inherit' : 'var(--font-roboto-mono)' }}>
                      {l.content}
                    </div>
                  )}
                </div>
              </div>
              {l.separatorAfter && (
                <div className="flex items-center gap-3 py-0.5">
                  <div className="w-24 sm:w-28 flex-shrink-0" />
                  <div className="w-4" />
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 border-t border-dashed" style={{ borderColor: `${accent}55` }} />
                    {separatorLabel && (
                      <span className="text-[9px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full" style={{ background: 'var(--ffv-bg)', color: accent, border: `1px solid ${accent}40` }}>
                        {separatorLabel}
                      </span>
                    )}
                    <div className="flex-1 border-t border-dashed" style={{ borderColor: `${accent}55` }} />
                  </div>
                </div>
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

export function NodeGraph({ title, accent = 'var(--ffv-blue)', columns, legend }: {
  title?: string;
  accent?: string;
  legend?: string;
  columns: {
    label: string;
    nodes: {
      icon?: string;
      label: string;
      sub?: string;
      tone?: 'default' | 'emphasis' | 'muted' | 'danger' | 'success';
    }[];
  }[];
}) {
  const nodeStyles = (tone: string | undefined) => {
    switch (tone) {
      case 'emphasis':
        return {
          bg: `color-mix(in srgb, ${accent} 18%, var(--ffv-bg))`,
          border: `color-mix(in srgb, ${accent} 60%, transparent)`,
          label: accent,
        };
      case 'muted':
        return { bg: 'var(--ffv-bg3)', border: 'var(--ffv-border)', label: 'var(--ffv-muted)' };
      case 'danger':
        return {
          bg: 'color-mix(in srgb, var(--ffv-red) 14%, var(--ffv-bg))',
          border: 'color-mix(in srgb, var(--ffv-red) 55%, transparent)',
          label: 'var(--ffv-red)',
        };
      case 'success':
        return {
          bg: 'color-mix(in srgb, var(--ffv-green) 14%, var(--ffv-bg))',
          border: 'color-mix(in srgb, var(--ffv-green) 55%, transparent)',
          label: 'var(--ffv-green)',
        };
      default:
        return {
          bg: `color-mix(in srgb, ${accent} 10%, var(--ffv-bg))`,
          border: `color-mix(in srgb, ${accent} 45%, transparent)`,
          label: 'var(--foreground)',
        };
    }
  };
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          🗺️ {title}
        </div>
      )}
      <div className="p-4 sm:p-5">
        <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${columns.length}, minmax(0, 1fr))` }}>
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-2">
              <div
                className="text-[10px] uppercase tracking-widest font-bold text-center py-1.5 rounded-md"
                style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}40` }}
              >
                {col.label}
              </div>
              {col.nodes.map((n, ni) => {
                const ns = nodeStyles(n.tone);
                return (
                  <div
                    key={ni}
                    className="rounded-lg px-3 py-2 flex items-start gap-2"
                    style={{ background: ns.bg, border: `1px solid ${ns.border}` }}
                  >
                    {n.icon && <span className="text-sm leading-tight">{n.icon}</span>}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold" style={{ color: ns.label }}>{n.label}</div>
                      {n.sub && (
                        <div className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--ffv-muted)' }}>{n.sub}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        {legend && (
          <p className="text-[10px] mt-3 text-center italic" style={{ color: 'var(--ffv-muted)' }}>
            {legend}
          </p>
        )}
      </div>
    </div>
  );
}

export function Timeline({ title, accent = 'var(--ffv-blue)', events }: {
  title?: string;
  accent?: string;
  events: { when: string; label: string; detail?: string; highlight?: boolean }[];
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          📅 {title}
        </div>
      )}
      <div className="p-4 sm:p-5">
        <div className="relative flex flex-col gap-3 pl-6">
          <div className="absolute left-2 top-1.5 bottom-1.5 w-px" style={{ background: `${accent}40` }} />
          {events.map((e, i) => (
            <div key={i} className="relative flex items-start gap-3">
              <div
                className="absolute -left-6 top-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{
                  background: e.highlight ? accent : 'var(--ffv-bg)',
                  border: `2px solid ${accent}`,
                }}
              >
                {e.highlight && <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--ffv-bg)' }} />}
              </div>
              <div className="text-[11px] font-bold font-mono w-14 flex-shrink-0" style={{ color: accent, fontFamily: 'var(--font-roboto-mono)' }}>
                {e.when}
              </div>
              <div className="flex-1">
                <div className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{e.label}</div>
                {e.detail && (
                  <div className="text-[11px] mt-0.5" style={{ color: 'var(--ffv-muted)' }}>{e.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function KeyValue({ items, accent = 'var(--ffv-blue)' }: {
  items: { k: string; v: ReactNode }[];
  accent?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {items.map((it, i) => (
        <div key={i} className="flex items-start gap-3 text-xs">
          <span className="font-semibold flex-shrink-0" style={{ color: accent, minWidth: 140 }}>{it.k}</span>
          <span style={{ color: 'var(--ffv-muted)' }}>{it.v}</span>
        </div>
      ))}
    </div>
  );
}

/** Annotated mathematical formula — shows formula parts with tooltips/annotations */
export function AnnotatedFormula({ title, formula, parts, accent = 'var(--ffv-blue)' }: {
  title?: string;
  formula?: string;
  parts: { text: string; annotation?: string; highlight?: boolean }[];
  accent?: string;
}) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${accent}30`, background: 'var(--ffv-bg2)' }}>
      {title && (
        <div className="px-4 py-2 text-[10px] uppercase tracking-widest font-semibold" style={{ background: `${accent}12`, color: accent, borderBottom: `1px solid ${accent}30` }}>
          ƒ {title}
        </div>
      )}
      <div className="p-5">
        {formula && (
          <div className="text-sm font-mono mb-4 p-3 rounded-lg text-center" style={{ background: 'var(--ffv-bg)', border: `1px solid ${accent}25`, color: 'var(--foreground)' }}>
            {formula}
          </div>
        )}
        <div className="flex flex-wrap gap-2 justify-center">
          {parts.map((part, i) => (
            part.annotation ? (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="px-2 py-1 rounded text-sm font-mono font-semibold"
                  style={{
                    background: part.highlight ? `color-mix(in srgb, ${accent} 20%, var(--ffv-bg2))` : 'var(--ffv-bg)',
                    border: `1px solid ${part.highlight ? accent : 'var(--ffv-border)'}40`,
                    color: part.highlight ? accent : 'var(--foreground)',
                  }}
                >
                  {part.text}
                </div>
                <div className="text-[10px] text-center max-w-[120px] leading-tight" style={{ color: 'var(--ffv-muted)' }}>
                  {part.annotation}
                </div>
              </div>
            ) : (
              <div key={i} className="flex items-center px-1 text-sm font-mono" style={{ color: 'var(--ffv-muted)' }}>
                {part.text}
              </div>
            )
          ))}
        </div>
      </div>
    </div>
  );
}
