'use client';

/**
 * PublicStatsClient — KPIs públicos com dados reais do backend
 * (GET /api/v1/stats) + fallback estático honesto enquanto carrega
 * ou se a API estiver fora.
 *
 * V1 (mai/2026): consome `basesLive`, `studyRequestsTotal`,
 * `studyRequestsDelivered`. Derivações no client: SLA % a partir de
 * delivered/total. Cache HTTP 60s vem do backend.
 */

import { useEffect, useState } from 'react';
import { fetchPublicStats, deriveSlaPercentage, type PublicStats } from '@/lib/public-stats-api';

interface Kpi {
  label: string;
  value: string;
  unit?: string;
  trend?: 'good' | 'neutral' | 'warning';
  caveat?: string;
}

const LAST_UPDATE = '2026-05-19';

function buildKpis(stats: PublicStats | null): Kpi[] {
  const basesLive = stats?.basesLive ?? 2;
  const requestsTotal = stats?.studyRequestsTotal ?? 0;
  const requestsDelivered = stats?.studyRequestsDelivered ?? 0;
  const slaPct = stats ? deriveSlaPercentage(stats) : null;

  return [
    {
      label: 'Bases ativas',
      value: String(basesLive),
      unit: basesLive === 1 ? 'no ar' : 'no ar',
      trend: 'neutral',
      caveat: 'Tecnologia (157 módulos) + Medicina Veterinária (12 módulos + simulado).',
    },
    {
      label: 'Total de solicitações recebidas',
      value: String(requestsTotal),
      unit: requestsTotal === 1 ? 'pedido' : 'pedidos',
      trend: 'neutral',
      caveat: requestsTotal === 0
        ? 'Ainda zerado — você pode ser o primeiro a pedir.'
        : `${requestsDelivered} já entregues.`,
    },
    {
      label: 'SLA cumprido (24h)',
      value: slaPct !== null ? String(slaPct) : '—',
      unit: slaPct !== null ? '%' : 'aguardando amostra',
      trend: slaPct === null ? 'neutral' : slaPct >= 90 ? 'good' : 'warning',
      caveat: slaPct !== null
        ? `${requestsDelivered}/${requestsTotal} entregues no SLA.`
        : 'Mostramos % real quando tivermos ≥5 pedidos entregues (sem inflate).',
    },
    {
      label: 'Tempo médio de entrega',
      value: '~12',
      unit: 'h',
      trend: 'good',
      caveat: 'Estimativa preliminar. Será calculado do banco quando >10 entregas.',
    },
    {
      label: 'AB30 — meta',
      value: '35',
      unit: '%',
      trend: 'neutral',
      caveat: 'Bases com >50% de conclusão em 30d. Mediremos a partir da 1ª coorte fechada.',
    },
    {
      label: 'Custo médio por base',
      value: '<R$ 10',
      trend: 'good',
      caveat: 'API Claude + curadoria humana + storage. Honestidade prevalece sobre venda.',
    },
    {
      label: 'Material treinou IA?',
      value: 'Não',
      trend: 'good',
      caveat: 'Garantia política: nenhum modelo é treinado com o seu material enviado.',
    },
  ];
}

type FetchState =
  | { kind: 'loading' }
  | { kind: 'ready'; stats: PublicStats }
  | { kind: 'error' };

export function PublicStatsClient() {
  const [state, setState] = useState<FetchState>({ kind: 'loading' });

  useEffect(() => {
    const controller = new AbortController();
    fetchPublicStats(controller.signal)
      .then(stats => setState({ kind: 'ready', stats }))
      .catch(err => {
        // AbortError em unmount não vira UI de erro
        if ((err as Error)?.name === 'AbortError') return;
        setState({ kind: 'error' });
      });
    return () => controller.abort();
  }, []);

  const kpis = state.kind === 'ready' ? buildKpis(state.stats) : buildKpis(null);

  return (
    <div data-testid="public-stats-client">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map(kpi => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <p
          className="text-xs font-mono uppercase"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.08em' }}
        >
          Atualizado em {LAST_UPDATE} · próxima atualização: segunda-feira
        </p>
        {state.kind === 'loading' && (
          <span
            className="text-[10px] font-mono uppercase px-2 py-0.5 rounded"
            style={{
              background: 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)',
              color: 'var(--ffv-blue)',
              letterSpacing: '0.1em',
            }}
            aria-live="polite"
          >
            Sincronizando…
          </span>
        )}
        {state.kind === 'error' && (
          <span
            className="text-[10px] font-mono uppercase px-2 py-0.5 rounded"
            style={{
              background: 'color-mix(in srgb, var(--ffv-amber) 12%, transparent)',
              color: 'var(--ffv-amber)',
              letterSpacing: '0.1em',
            }}
            aria-live="polite"
          >
            Mostrando valores estimados — backend indisponível
          </span>
        )}
      </div>
    </div>
  );
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const trendColor =
    kpi.trend === 'good'
      ? 'var(--ffv-green)'
      : kpi.trend === 'warning'
        ? '#d97706'
        : 'var(--ffv-muted)';

  return (
    <article
      className="p-5 rounded-xl"
      style={{
        background: '#ffffff',
        border: '1px solid var(--ffv-border)',
        boxShadow: '0 4px 12px -6px rgba(28,25,23,0.06)',
      }}
    >
      <p
        className="font-mono uppercase text-[10px] mb-2"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em', fontWeight: 700 }}
      >
        {kpi.label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2rem, 3.4vw, 2.8rem)',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1,
          color: 'var(--ffv-ink)',
        }}
      >
        {kpi.value}
        {kpi.unit && (
          <span
            className="ml-1.5 text-sm font-semibold align-middle"
            style={{
              fontFamily: 'var(--font-inter)',
              color: trendColor,
              letterSpacing: 0,
            }}
          >
            {kpi.unit}
          </span>
        )}
      </p>
      {kpi.caveat && (
        <p
          className="text-xs mt-3"
          style={{ color: '#57534e', lineHeight: 1.5 }}
        >
          {kpi.caveat}
        </p>
      )}
    </article>
  );
}
