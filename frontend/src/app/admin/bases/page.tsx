'use client';

/**
 * /admin/bases — KPIs por base de conhecimento.
 *
 * Permite responder rápido: "qual base tem mais views nos últimos 7d?",
 * "quantos usuários únicos por base?", "quais % vêm logados vs anônimos?".
 *
 * Dados de `GET /api/v1/admin/metrics/overview?days={7|30}` que agrega
 * `module_views` por base+kind no período.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAdminMetricsOverview, type MetricsOverview } from '@/lib/admin-api';

const PERIODS: { days: number; label: string }[] = [
  { days: 1, label: '24h' },
  { days: 7, label: '7d' },
  { days: 30, label: '30d' },
];

function baseDisplayName(slug: string): string {
  if (slug === 'tecnologia') return '💻 Tecnologia';
  if (slug === 'medicina-veterinaria') return '🐾 Medicina Veterinária';
  if (slug === '(sem base)') return '🌐 Páginas globais';
  return slug;
}

function pct(part: number, total: number): string {
  if (total <= 0) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export default function AdminBasesPage() {
  const [data, setData] = useState<MetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  useEffect(() => {
    setLoading(true);
    fetchAdminMetricsOverview(days)
      .then(setData)
      .finally(() => setLoading(false));
  }, [days]);

  return (
    <div>
      <header className="mb-6 flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold">Bases de Conhecimento</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ffv-muted)' }}>
            KPIs por base — agregados a partir de pageviews identificados.
          </p>
        </div>
        <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          {PERIODS.map(p => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className="px-3 py-1 rounded-md text-xs font-semibold"
              style={{
                background: days === p.days ? 'var(--ffv-blue)' : 'transparent',
                color: days === p.days ? 'white' : 'var(--foreground)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      {/* Totais globais */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <KPI title="Acessos totais" value={data?.viewsTotal ?? 0} loading={loading} />
        <KPI title="De usuários logados" value={data?.viewsLogged ?? 0}
             hint={data ? pct(data.viewsLogged, data.viewsTotal) + ' do total' : ''}
             loading={loading} />
        <KPI title="De anônimos" value={data?.viewsAnon ?? 0}
             hint={data ? pct(data.viewsAnon, data.viewsTotal) + ' do total' : ''}
             loading={loading} />
      </section>

      {/* Distribuição por kind */}
      {data?.byKind && data.byKind.length > 0 && (
        <section className="mb-6 p-4 rounded-xl"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <h2 className="text-sm font-bold mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Distribuição por tipo
          </h2>
          <div className="flex flex-wrap gap-2">
            {data.byKind.map(k => (
              <span key={k.kind} className="px-3 py-1.5 rounded-md text-xs"
                style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}>
                <strong>{k.kind}</strong> · {k.count.toLocaleString('pt-BR')}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Cards por base */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(data?.byBase ?? []).map(b => (
          <article key={b.baseSlug}
            className="p-5 rounded-xl flex flex-col gap-3"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-bold">{baseDisplayName(b.baseSlug)}</h3>
              {b.baseSlug !== '(sem base)' && (
                <Link href={`/admin/views?base=${b.baseSlug}`}
                  className="text-xs underline" style={{ color: 'var(--ffv-blue)' }}>
                  ver acessos →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <Metric label="Acessos" value={b.viewsTotal} />
              <Metric label="Usuários únicos" value={b.uniqueUsers} />
              <Metric label="Visitantes anon" value={b.uniqueVisitors} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-xs"
              style={{ color: 'var(--ffv-muted)' }}>
              <span>{b.viewsLogged} logados</span>
              <span>{b.viewsAnon} anônimos</span>
              <span>{b.uniqueSessions} sessões</span>
            </div>
            {b.topModule && (
              <div className="mt-2 pt-3 text-xs"
                style={{ borderTop: '1px solid var(--ffv-border)' }}>
                <span style={{ color: 'var(--ffv-muted)' }}>Top módulo: </span>
                <strong style={{ color: 'var(--ffv-blue)' }}>{b.topModule}</strong>
                <span style={{ color: 'var(--ffv-muted)' }}> ({b.topModuleViews} views)</span>
              </div>
            )}
          </article>
        ))}
        {!loading && (data?.byBase?.length ?? 0) === 0 && (
          <p className="col-span-full p-6 text-center text-sm"
            style={{ color: 'var(--ffv-muted)' }}>
            Sem dados de acesso no período. Páginas precisam ser visitadas
            pra aparecer aqui (PageTracker já está rodando em toda navegação).
          </p>
        )}
      </section>

      {data?.generatedAt && (
        <p className="text-xs mt-6" style={{ color: 'var(--ffv-muted)' }}>
          Atualizado em {new Date(data.generatedAt).toLocaleString('pt-BR')}
          {' · '}
          janela: {new Date(data.since).toLocaleString('pt-BR')} → {new Date(data.until).toLocaleString('pt-BR')}
        </p>
      )}
    </div>
  );
}

function KPI({ title, value, hint, loading }: { title: string; value: number; hint?: string; loading?: boolean }) {
  return (
    <div className="p-4 rounded-xl"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
      <p className="text-xs font-semibold uppercase tracking-wide"
        style={{ color: 'var(--ffv-muted)' }}>{title}</p>
      <p className="text-3xl font-bold mt-1 tabular-nums">
        {loading ? '…' : value.toLocaleString('pt-BR')}
      </p>
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>{hint}</p>}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span className="text-xl font-bold tabular-nums">{value.toLocaleString('pt-BR')}</span>
      <span className="text-[10px] uppercase tracking-wide" style={{ color: 'var(--ffv-muted)' }}>{label}</span>
    </div>
  );
}
