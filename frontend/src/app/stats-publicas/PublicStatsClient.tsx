'use client';

/**
 * PublicStatsClient — grid de KPIs públicos.
 *
 * V1 hardcoded com valores honestos da fase inicial. Marcado como
 * "estimativa preliminar" pra deixar claro que cresce com volume real.
 * V2 plugará em GET /api/v1/public/stats que deriva do rollup de
 * engagement (ver PERSONALIZATION_PLAN Fase 4).
 */

interface Kpi {
  label: string;
  value: string;
  unit?: string;
  trend?: 'good' | 'neutral' | 'warning';
  caveat?: string;
}

// Dados V1 — atualizar manualmente até endpoint /stats existir.
// LastUpdate é exibido pro usuário; reflete operações da semana atual.
const LAST_UPDATE = '2026-05-19';

const KPIS: Kpi[] = [
  {
    label: 'Bases entregues até hoje',
    value: '2',
    unit: 'no ar',
    trend: 'neutral',
    caveat: 'Tecnologia (157 módulos) + Medicina Veterinária (12 módulos + simulado).',
  },
  {
    label: 'SLA cumprido (24h)',
    value: '100',
    unit: '%',
    trend: 'good',
    caveat: 'V1 — bases entregues 100% no SLA. Mostraremos % real assim que o volume crescer.',
  },
  {
    label: 'Tempo médio de entrega',
    value: '~12',
    unit: 'h',
    trend: 'good',
    caveat: 'Estimativa preliminar. Estabiliza conforme o pipeline matura.',
  },
  {
    label: 'AB30 — meta',
    value: '35',
    unit: '%',
    trend: 'neutral',
    caveat: 'Bases com >50% de conclusão em 30d. Mediremos a partir da 1ª coorte de 30 dias.',
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

export function PublicStatsClient() {
  return (
    <div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map(kpi => (
          <KpiCard key={kpi.label} kpi={kpi} />
        ))}
      </div>

      <p
        className="mt-5 text-xs font-mono uppercase"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.08em' }}
      >
        Atualizado em {LAST_UPDATE} · próxima atualização: segunda-feira
      </p>
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
