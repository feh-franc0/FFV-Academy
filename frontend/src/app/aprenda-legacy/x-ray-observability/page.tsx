import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('x-ray-observability');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual unidade compõe um trace em X-Ray?',
    options: [
      'Log lines',
      'Segment (service) contém subsegments (chamadas a downstream: DB, HTTP, outro Lambda). Trace = conjunto de segments correlacionados por trace_id',
      'Metric',
      'Alarm',
    ],
    correct: 1,
    explanation: 'Segment: boundary de service (Lambda, EC2, ECS task). Subsegment: operação interna (DB query, HTTP call, custom code). Service map visualiza relações. Sampling rule decide qual % capturar (default 1 req/s + 5% restante).',
  },
  {
    question: 'O que ADOT substitui?',
    options: [
      'Nada',
      'AWS Distro for OpenTelemetry (ADOT) é drop-in substituto do X-Ray SDK. Instrumenta com OTel standard, exporta pra X-Ray (ou Honeycomb/Datadog/etc). Futuro é OTel, não X-Ray SDK legacy',
      'CloudWatch',
      'Apenas Lambda',
    ],
    correct: 1,
    explanation: 'X-Ray SDK é legacy. ADOT (AWS Distro for OTel) é a evolução: OpenTelemetry spec padrão, plug em X-Ray mas portable pra qualquer backend. Lambda tem ADOT Layer oficial. Em novo projeto, prefira ADOT.',
  },
  {
    question: 'Quanto custa X-Ray?',
    options: [
      'Grátis',
      'Free tier: 100k traces recorded + 1M retrieved/mês. Depois $5/M traces recorded, $0.50/M retrieved. Cheap pra maioria dos apps',
      '$100/mês fixo',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'X-Ray preço baixo. Mas sampling é crítico em escala — 100% sampling pra API de alta volume vai custar. Rules permitem sample por path, service, method. Head sampling (decide antes) vs tail sampling (decide após — Honeycomb/Grafana Tempo fazem; X-Ray é head).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="x-ray-observability"
      title="X-Ray: tracing distribuído na AWS"
      icon="🔭"
      xp={45}
      readTime={10}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="secrets-parameter-store"
      nextTitle="Secrets Manager vs Parameter Store: escolha"
      quiz={quiz}
    >
      <Section title="Integração" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Lambda</strong>: Active tracing checkbox, sem código extra pro entrypoint. Pra subsegments custom, SDK.</li>
          <li><strong>API Gateway</strong>: X-Ray checkbox em stage. Propaga trace_id pros downstreams via header.</li>
          <li><strong>ECS/EC2</strong>: X-Ray daemon sidecar.</li>
          <li><strong>SDK</strong>: auto-instrumenta http, aws-sdk. Segment custom pra bloco crítico.</li>
        </ul>
      </Section>

      <Section title="Sampling" accent={accent}>
        <Callout tone="info" icon="💡">
          Rules: reservoir (N traces/segundo garantidos) + fixed rate (%) do excedente. Ex: "reservoir 1/s, fixed 5%". Custom rules por URL/service. Pra debug: 100% em staging; em prod use padrão.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
