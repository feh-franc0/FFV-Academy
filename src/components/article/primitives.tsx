import type { ReactNode } from 'react';

type Tone = 'info' | 'warn' | 'danger' | 'success' | 'neutral';

const TONE: Record<Tone, { bg: string; border: string; color: string; icon: string }> = {
  info:    { bg: 'rgba(88,166,255,0.08)',  border: 'rgba(88,166,255,0.25)',  color: 'var(--ffv-blue)',   icon: '💡' },
  warn:    { bg: 'rgba(255,166,87,0.08)',  border: 'rgba(255,166,87,0.25)',  color: 'var(--ffv-orange)', icon: '⚠️' },
  danger:  { bg: 'rgba(247,129,102,0.10)', border: 'rgba(247,129,102,0.30)', color: 'var(--ffv-red)',    icon: '🚨' },
  success: { bg: 'rgba(63,185,80,0.08)',   border: 'rgba(63,185,80,0.25)',   color: 'var(--ffv-green)',  icon: '✅' },
  neutral: { bg: 'var(--ffv-bg2)',         border: 'var(--ffv-border)',      color: 'var(--ffv-muted)',  icon: '📌' },
};

export function Section({ title, accent = 'var(--ffv-blue)', children }: {
  title: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <section>
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
  return (
    <div className="rounded-lg overflow-hidden" style={{ border: '1px solid var(--ffv-border)' }}>
      {lang && (
        <div className="text-[10px] px-3 py-1 uppercase tracking-wider" style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-muted)', fontFamily: 'var(--font-roboto-mono)' }}>
          {lang}
        </div>
      )}
      <pre className="p-4 text-xs overflow-x-auto whitespace-pre-wrap" style={{ background: 'var(--ffv-bg2)', color: 'var(--ffv-green)', fontFamily: 'var(--font-roboto-mono)' }}>
        {children}
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
    <div className="overflow-x-auto rounded-xl" style={{ border: '1px solid var(--ffv-border)' }}>
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
  );
}

export function DecisionBox({ scenario, winner, winnerColor = 'var(--ffv-blue)', why, alternatives }: {
  scenario: string;
  winner: string;
  winnerColor?: string;
  why: string;
  alternatives?: { name: string; note: string }[];
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
          {alternatives.map(alt => (
            <p key={alt.name} className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <span style={{ color: 'var(--ffv-border)' }}>Alt: </span>
              <span className="font-semibold">{alt.name}</span> — {alt.note}
            </p>
          ))}
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
      <pre className="p-5 text-xs overflow-x-auto whitespace-pre" style={{ color: 'var(--foreground)', fontFamily: 'var(--font-roboto-mono)', lineHeight: 1.6 }}>
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
