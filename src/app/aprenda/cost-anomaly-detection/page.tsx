import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cost-anomaly-detection');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Threshold fixo vs ML-based: por que o segundo ganha em escala?',
    options: [
      'Marketing',
      'Threshold fixo ("alert se > $1000/dia") ignora sazonalidade (Black Friday, end of month batch), gera alert fatigue em baseline que cresce naturalmente. ML aprende baseline por serviço/account, detecta desvio estatístico e ignora padrões esperados. AWS Cost Anomaly Detection usa isso',
      'São iguais',
      'Fixed é melhor',
    ],
    correct: 1,
    explanation: 'Em org com 50+ contas e centenas de serviços, threshold fixo gera 80% falsos positivos ("dev subiu carga de teste", "processo legítimo de mês"). ML identifica "spike real fora de padrão esperado", alertando só quando vale olhar. Datadog Cloud Cost, Vantage, CloudZero — todos usam abordagem similar.',
  },
  {
    question: 'Alert fatigue em cost: sintoma e tratamento?',
    options: [
      'Alertar mais',
      'Sintoma: time ignora alerts de custo rotineiramente. Tratamento: reduzir volume (só anomalias significativas, não desvios pequenos), rotear por dono (team X recebe alerts do serviço X, não todos), tier por severidade (>$10k/dia = pager, >$1k/dia = email async). Quantitative sem fatigue > alarming geral',
      'Mais ferramentas',
      'Ignorar',
    ],
    correct: 1,
    explanation: 'Alert de custo que ninguém lê é pior que sem alerta — gera falsa sensação de segurança. Regra: alert só dispara quando ação é necessária e owner identificado sabe tratar. Thresholds calibrados com dados históricos. Revisão trimestral do volume — se time ignora 80% dos alerts, está errado.',
  },
  {
    question: 'Quando Vantage/CloudZero/Datadog Cloud Cost agregam a AWS nativo?',
    options: [
      'Nunca',
      'Multi-cloud (AWS + GCP + Azure unificado), breakdown por feature/customer/endpoint (requer integrar com code), showback automatizado pra engineering teams, recomendações acionáveis priorizadas, melhor UX que Cost Explorer. Em org com 1 cloud pequena, AWS nativo basta',
      'Só Azure',
      'Só legacy',
    ],
    correct: 1,
    explanation: '3rd-party agregam quando: multi-cloud, escala (50+ times), granularidade além de tags AWS (per-feature, per-tenant tracking), ou cultura de self-service onde times veem o próprio custo sem depender de FinOps central. Em startup single-cloud, CE + Budgets + Cost Anomaly Detection bastam.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cost-anomaly-detection"
      title="Cost anomaly detection: quando alertar"
      icon="🚨"
      xp={50}
      readTime={12}
      trailName="FinOps & Cost Engineering"
      trailColor={accent}
      nextSlug="rightsizing-sem-medo"
      nextTitle="Rightsizing sem medo: metodologia de cortar sem quebrar"
      quiz={quiz}
    >
      <Section title="Stack de ferramentas" accent={accent}>
        <CodeBlock lang="yaml">{`Nativo AWS (baseline grátis):
  AWS Cost Anomaly Detection   # ML sobre usage data
  AWS Budgets + Budgets Actions # threshold alert + auto-action
  Cost Explorer                 # exploração ad-hoc
  CUR (Cost & Usage Report)     # raw data em S3

3rd-party (escala multi-cloud / granularidade):
  Vantage          # UX rico + alerts granulares, multi-cloud
  CloudZero        # per-feature/customer tracking
  Datadog Cloud Cost   # integra com APM, per-service real-time
  CloudHealth      # enterprise-grade governance

Integração com observability:
  OpenTelemetry + Prometheus custom metrics
  Cost por span/trace (link cost a request IDs)
  Dashboards Grafana combinando cost + performance`}</CodeBlock>
      </Section>

      <Section title="Arquitetura de alerting saudável" accent={accent}>
        <CodeBlock lang="yaml">{`Tier 1 — Pager (>$10k/dia desvio):
  AWS Cost Anomaly Detection HIGH severity
  → SNS → PagerDuty
  Ações: team lead, FinOps, potencial incident

Tier 2 — Async notification (>$1k/dia desvio):
  → SNS → Slack channel #cost-alerts
  Review diária async pelo time owner

Tier 3 — Dashboard apenas (noise-level):
  Visível em Grafana/Datadog, sem push
  Review semanal em FinOps meeting

Routing:
  Por tag team/service (detectar dono do recurso)
  Cost Categories definem "cost center" lógico
  Fallback: default channel FinOps`}</CodeBlock>
      </Section>

      <Section title="Configuração concreta" accent={accent}>
        <p>
          AWS Cost Anomaly Detection tem 3 tipos de monitor: AWS services (cada serviço monitored isolado), linked accounts (per account), cost categories (por agrupamento lógico). Recomendado: monitor AWS services globais + um por linked account crítico. Thresholds: $ absolute ou % de desvio. Frequency: daily melhor que weekly (reação mais rápida).
        </p>
        <CodeBlock lang="bash">{`# Cria anomaly monitor por serviço + subscription diária
aws ce create-anomaly-monitor --anomaly-monitor '{
  "MonitorName": "all-services-monitor",
  "MonitorType": "DIMENSIONAL",
  "MonitorDimension": "SERVICE"
}'

aws ce create-anomaly-subscription --anomaly-subscription '{
  "SubscriptionName": "team-alerts",
  "MonitorArnList": ["arn:aws:ce::...:anomalymonitor/xxx"],
  "Subscribers": [{"Type":"SNS","Address":"arn:aws:sns:...:cost-alerts"}],
  "ThresholdExpression": {
    "Dimensions": {
      "Key": "ANOMALY_TOTAL_IMPACT_ABSOLUTE",
      "Values": ["1000"],
      "MatchOptions": ["GREATER_THAN_OR_EQUAL"]
    }
  },
  "Frequency": "DAILY"
}'`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Regra de ouro: cada alert deve ter owner identificado e ação esperada. Se o alert dispara e ninguém sabe o que fazer, o alert está mal configurado. Revisão trimestral ajusta thresholds conforme baseline evolui.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
