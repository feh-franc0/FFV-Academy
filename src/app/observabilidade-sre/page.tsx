import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Observabilidade & SRE — FFV Academy',
  description:
    'Trilha de Observabilidade & SRE: pilares de observability, métricas RED/USE, OpenTelemetry end-to-end, logs estruturados, distributed tracing, SLOs + error budgets e incident response blameless.',
  keywords:
    'observabilidade, sre, opentelemetry, metricas red use, slo error budget, distributed tracing, logs estruturados, incident response, postmortem blameless',
};

export default function ObservabilidadeSREPage() {
  return <TrailBlogClient trail={CURRICULUM[10]} />;
}
