/**
 * /admin — Dashboard com métricas reais do produto.
 *
 * Consome GET /api/v1/admin/stats (cache 30s no backend). Mostra:
 *   - Cards principais (users / DAU-WAU-MAU / XP / views)
 *   - Top 10 trilhas mais acessadas (últimos 30d)
 *   - Top 10 módulos mais lidos (últimos 30d)
 */
'use client';

import { useEffect, useState } from 'react';
import {
  fetchAdminStats,
  fetchAdminGrowth,
  type AdminStatsResponse,
  type AdminGrowthResponse,
} from '@/lib/admin-api';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

function StatCard({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div
      className="p-4 rounded-xl"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="text-xs uppercase tracking-widest font-semibold mb-1" style={{ color: 'var(--ffv-muted)' }}>
        {label}
      </div>
      <div className="text-3xl font-bold" style={{ color: 'var(--foreground)' }}>
        {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
      </div>
      {hint && (
        <div className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// Formata "2026-05-01" → "01/05"
function formatDateShort(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}/${parts[1]}`;
}

export default function AdminDashboard() {
  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [growth, setGrowth] = useState<AdminGrowthResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([fetchAdminStats(), fetchAdminGrowth(30)])
      .then(([statsRes, growthRes]) => {
        if (cancelled) return;
        if (!statsRes) setError('Não foi possível carregar as métricas agora. Tente novamente em instantes.');
        else setData(statsRes);
        setGrowth(growthRes);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>Carregando…</p>;
  if (error) return <p className="text-sm" style={{ color: 'var(--ffv-red, #dc2626)' }}>{error}</p>;
  if (!data) return null;

  const s = data.stats;

  return (
    <div className="flex flex-col gap-6 max-w-6xl">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Snapshot gerado em {new Date(s.generatedAt).toLocaleString('pt-BR')}
        </p>
      </header>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Usuários
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Total" value={s.totalUsers} />
          <StatCard label="Novos 7d" value={s.usersLast7Days} />
          <StatCard label="Novos 30d" value={s.usersLast30Days} />
          <StatCard label="XP total" value={s.totalXpAwarded} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Atividade
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="DAU" value={s.activeDaily} hint="ativos nas últimas 24h" />
          <StatCard label="WAU" value={s.activeWeekly} hint="ativos nos últimos 7d" />
          <StatCard label="MAU" value={s.activeMonthly} hint="ativos nos últimos 30d" />
          <StatCard label="Views 7d" value={s.viewsLast7Days} hint={`${s.viewsLast30Days.toLocaleString('pt-BR')} em 30d`} />
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Conteúdo
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="Artigos" value={s.totalArticles} />
          <StatCard label="Blocks" value={s.totalBlocks} />
          <StatCard label="Simulado attempts" value={s.totalAttempts} />
          <StatCard label="Certificados" value={s.totalCertificates} />
        </div>
      </section>

      {/* Growth charts */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
          Crescimento (30d)
        </h2>
        {!growth ? (
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Backend offline — gráficos indisponíveis
          </p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>
                Cadastros / dia
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={growth.userSignups.map(p => ({ date: formatDateShort(p.date), count: p.count }))}>
                  <defs>
                    <linearGradient id="signupsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ffv-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--ffv-muted)' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--ffv-muted)' }} allowDecimals={false} width={30} />
                  <Tooltip
                    contentStyle={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', fontSize: 12 }}
                    labelStyle={{ color: 'var(--ffv-muted)' }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Cadastros"
                    stroke="#60a5fa"
                    fill="url(#signupsGrad)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
            >
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>
                Simulado attempts / dia
              </p>
              <ResponsiveContainer width="100%" height={160}>
                <AreaChart data={growth.simuladoAttempts.map(p => ({ date: formatDateShort(p.date), count: p.count }))}>
                  <defs>
                    <linearGradient id="attemptsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f78166" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f78166" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--ffv-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--ffv-muted)' }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--ffv-muted)' }} allowDecimals={false} width={30} />
                  <Tooltip
                    contentStyle={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', fontSize: 12 }}
                    labelStyle={{ color: 'var(--ffv-muted)' }}
                    itemStyle={{ color: '#f78166' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="count"
                    name="Attempts"
                    stroke="#f78166"
                    fill="url(#attemptsGrad)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Top 10 trilhas (30d)
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ffv-border)' }}>
            {data.topTrails.length === 0 && (
              <p className="p-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
                Nenhuma view registrada ainda. Visite alguns módulos pra popular.
              </p>
            )}
            {data.topTrails.map((t, i) => (
              <div
                key={t.trailId}
                className="flex items-center justify-between px-4 py-2 text-sm"
                style={{
                  borderBottom: i < data.topTrails.length - 1 ? '1px solid var(--ffv-border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
                }}
              >
                <span className="font-mono">{t.trailId}</span>
                <span className="font-semibold">{t.views.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Top 10 módulos (30d)
          </h2>
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--ffv-border)' }}>
            {data.topModules.length === 0 && (
              <p className="p-4 text-sm" style={{ color: 'var(--ffv-muted)' }}>
                Sem dados ainda.
              </p>
            )}
            {data.topModules.map((m, i) => (
              <div
                key={m.slug}
                className="flex items-center justify-between px-4 py-2 text-sm gap-3"
                style={{
                  borderBottom: i < data.topModules.length - 1 ? '1px solid var(--ffv-border)' : 'none',
                  background: i % 2 === 0 ? 'transparent' : 'var(--ffv-bg2)',
                }}
              >
                <a href={`/aprenda/${m.slug}/`} className="truncate underline" style={{ color: 'var(--ffv-blue)' }}>
                  {m.title || m.slug}
                </a>
                <span className="font-semibold flex-shrink-0">{m.views.toLocaleString('pt-BR')}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
