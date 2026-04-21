import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('observability-enterprise');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'CloudWatch Logs Insights vs OpenSearch: quando cada?',
    options: [
      'Mesma coisa',
      'Logs Insights é query on-demand sobre Logs retidos (pay-per-query $0.005/GB scanned). Ideal pra ad-hoc troubleshooting. OpenSearch é cluster rodando 24/7 com indexação full-text — ideal pra dashboards em tempo real, busca pesada de logs, retenção longa com query rápida',
      'Logs sempre',
      'OpenSearch é só search',
    ],
    correct: 1,
    explanation: 'Logs Insights é cheap pra query esporádica mas fica caro em uso intenso (GB scanned vezes queries/dia). OpenSearch tem custo fixo de cluster mas query é instantânea. Decisão de scale: &lt; 10 queries/dia → Logs Insights; dashboards operacionais + busca intensiva → OpenSearch. Firehose pode rotear Logs pra OpenSearch automaticamente.',
  },
  {
    question: 'X-Ray traces: onde agrega valor?',
    options: [
      'Só Lambda',
      'Sistemas distribuídos com múltiplos serviços — rastrea request end-to-end (API Gateway → Lambda → DynamoDB → SQS → Lambda worker). Service map mostra latência por hop + errors, identifica bottleneck específico. Sem traces, debug distribuído é arqueologia',
      'Só erro',
      'Igual a log',
    ],
    correct: 1,
    explanation: 'X-Ray instrumenta request ID através de hops e agrega em Service Map visual. Você vê "API Gateway → Lambda A (p99 200ms) → DynamoDB (p99 5ms) → Lambda B (p99 1200ms ←)" e identifica o offending service. Alternativas open-source: OpenTelemetry + AWS Distro. Logs não substituem traces — são dimensões complementares.',
  },
  {
    question: 'Application Insights vs Container Insights?',
    options: [
      'Iguais',
      'Application Insights auto-detecta patterns em workloads (SQL Server, SAP, .NET) e configura monitoring automático. Container Insights coleta métricas + logs de ECS/EKS (CPU/mem/rede por pod/task) com dashboards prontos. Usadas em paralelo em arquiteturas híbridas',
      'Só legacy',
      'Só K8s',
    ],
    correct: 1,
    explanation: 'Application Insights reduz setup manual pra apps tradicionais (detecta log paths, métricas relevantes, configura alarmes). Container Insights é observability K8s/ECS nativa — precisa de GameDay pra tunar thresholds mas resolve 80% do painel operacional. ServiceLens combina Application Insights + X-Ray em uma view.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="observability-enterprise"
      title="Observability enterprise: CloudWatch, X-Ray, OpenSearch"
      icon="🔭"
      xp={55}
      readTime={13}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="cost-optimization-sap"
      nextTitle="Cost optimization avançado: rightsizing, purchasing, monitoring"
      quiz={quiz}
    >
      <Section title="Três pilares: metrics, logs, traces" accent={accent}>
        <CodeBlock lang="yaml">{`Metrics (what):
  CloudWatch Metrics (managed + custom)
  CloudWatch Metric Streams → Kinesis → Datadog/Grafana
  Amazon Managed Prometheus (AMP)
  CloudWatch Dashboards / Managed Grafana

Logs (why):
  CloudWatch Logs (ingest + retenção + Insights)
  Subscription filter → Firehose → S3/OpenSearch
  OpenSearch Service (indexed, dashboard full-text)
  S3 + Athena pra archival + query SQL

Traces (how):
  AWS X-Ray (SDK per runtime)
  OpenTelemetry + ADOT (AWS Distro for OpenTelemetry)
  Service Map pra visualização
  Correlação com métricas via ServiceLens

Cross-cutting:
  Application Insights (auto-detect apps tradicionais)
  Container Insights (ECS/EKS)
  Lambda Insights (runtime metrics profundas)
  Synthetics (canaries HTTP externos)
  RUM (Real User Monitoring browser/mobile)`}</CodeBlock>
      </Section>

      <Section title="Pipeline padrão de logs em escala" accent={accent}>
        <CodeBlock lang="yaml">{`App Lambda / ECS / EC2
   │
   ▼ CloudWatch Logs (retention 7d, custo baixo)
   │
   ├─► Subscription filter (pattern ERROR|WARN)
   │    │
   │    ▼ Kinesis Data Firehose
   │    │   ├─► S3 (archival parquet, Athena query)
   │    │   └─► OpenSearch Service (indexed, dashboards)
   │
   └─► Metric Filter (count ERROR/min)
        │
        ▼ CloudWatch Metric + Alarm → SNS → PagerDuty

Retenção:
  CloudWatch Logs: 7 dias (hot)
  OpenSearch: 30 dias (warm, searchable)
  S3 Standard: 90 dias
  S3 Glacier Deep Archive: 7 anos (compliance)`}</CodeBlock>
      </Section>

      <Section title="Observability que paga o próprio custo" accent={accent}>
        <p>
          Stack maduro inclui SLOs definidos (ex: p99 latency &lt; 500ms, error rate &lt; 0.1%), alarmes só em violação de SLO (elimina alert fatigue), dashboards por serviço padronizados (golden signals: latência, tráfego, erros, saturação), correlação traces+logs+metrics via request ID, auto-remediation em incidentes conhecidos.
        </p>
        <Callout tone="success" icon="✅">
          Regra: sem observability, DR é fake, autoscaling é chute, SLA é promessa. Investimento de 2-5% do gasto total em CloudWatch + OpenSearch + AMP paga em MTTR reduzido e postmortems acionáveis.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
