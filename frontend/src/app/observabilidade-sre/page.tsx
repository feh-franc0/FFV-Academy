import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha de Observabilidade & SRE: pilares de observability, métricas RED/USE, OpenTelemetry end-to-end, logs estruturados, distributed tracing, SLOs + error budgets e incident response blameless.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/observabilidade-sre` },
  ...social({ titulo: `Observabilidade & SRE — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/observabilidade-sre' }),
  title: 'Observabilidade & SRE',
  description: DESCRICAO_CARTAO,
  keywords:
    'observabilidade, sre, opentelemetry, metricas red use, slo error budget, distributed tracing, logs estruturados, incident response, postmortem blameless',
};

export default function ObservabilidadeSREPage() {
  const trail = getTrailByHref('/observabilidade-sre');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
