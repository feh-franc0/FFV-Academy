import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('observability-de-custo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Tag policies + Config rule + SCP: por que todos os três?',
    options: [
      'Redundância',
      'Tag Policy define o schema esperado (chaves, valores permitidos). Config rule detecta recursos non-compliant (detective). SCP nega criação de recurso sem tag obrigatória (preventive). Juntos formam defense in depth — sem algum, o esquema furando',
      'Só tag policy',
      'Só SCP',
    ],
    correct: 1,
    explanation: 'Tag Policy sozinha não bloqueia criação sem tag — ela apenas define schema. SCP bloqueia preventivamente. Config detecta recursos legados pré-enforcement. Esses três juntos garantem que 100% dos recursos novos nascem tagged e legados são reparados via remediation automation.',
  },
  {
    question: 'Cost allocation tags AWS: user-defined vs AWS-generated?',
    options: [
      'Igual',
      'User-defined tags são criadas por você (env, team, app) e precisam ser ativadas em Billing console pra aparecer em CUR/Cost Explorer. AWS-generated tags (ex: aws:createdBy) são automáticas mas cobrem menos dimensões de negócio. Ambas ativadas em paralelo',
      'Só user-defined',
      'Só AWS',
    ],
    correct: 1,
    explanation: 'AWS-generated dão contexto técnico (quem criou) mas não representam negócio. User-defined refletem organização: env, team, app, costcenter, product. Ativar ambas em Billing → Cost allocation tags. Delay de 24h pra aparecer em Cost Explorer após ativação pela primeira vez.',
  },
  {
    question: 'Dashboard de custo acionável — quais componentes?',
    options: [
      'Só total',
      'Top 10 serviços/contas, trend mês-a-mês, anomaly score, cost per team/product, coverage por commitment, forecast próximo mês, ações pendentes (rightsizing, cleanup). Drill-down por tag até resource granular. Tudo atualizado diariamente',
      'Só gráfico',
      'Planilha',
    ],
    correct: 1,
    explanation: 'Dashboard que vira ação vs dashboard decorativo: primeiro mostra estado atual + delta + action items. Team owner abre e sabe: "meu serviço cresceu 8% MoM, 3 EBS órfãos pra limpar, coverage abaixo do target". Sem drill-down e context, é só número bonito.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="observability-de-custo"
      title="Observability de custo: tags, allocation, dashboards"
      icon="🔍"
      xp={50}
      readTime={12}
      trailName="FinOps & Cost Engineering"
      trailColor={accent}
      nextSlug="capstone-reducao-de-30-custo"
      nextTitle="Capstone: redução de 30% de custo em app real"
      quiz={quiz}
    >
      <Section title="Taxonomia de tags mínima viável" accent={accent}>
        <CodeBlock lang="yaml">{`Tags mandatórias (enforced por Tag Policy + SCP):
  env:          dev | staging | prod | sandbox
  team:         slug do time owner
  costcenter:   código de centro de custo (4 dígitos)
  app:          slug kebab-case do serviço
  managedby:    terraform | cdk | manual | legacy

Tags opcionais (recomendadas):
  datasensitivity: public | internal | confidential | pii
  expiresat:       ISO date (sandbox auto-destruct)
  product:         produto de negócio
  customer:        customer slug (SaaS multi-tenant)

Ativar em Billing:
  Console → Billing → Cost allocation tags
  → ativar cada chave pra aparecer em CE/CUR
  Delay: 24h primeira ativação`}</CodeBlock>
      </Section>

      <Section title="Enforcement pipeline" accent={accent}>
        <CodeBlock lang="yaml">{`# Tag Policy (Organization level)
{
  "tags": {
    "env": {
      "tag_key": {"@@assign": "env"},
      "tag_value": {"@@assign": ["dev","staging","prod","sandbox"]},
      "enforced_for": {"@@assign": ["ec2:instance","rds:db","s3:bucket"]}
    },
    "costcenter": {
      "tag_key": {"@@assign": "costcenter"},
      "enforced_for": {"@@assign": ["ec2:instance","rds:db"]}
    }
  }
}

# SCP preventive: block criação sem tag requerida
DenyCreateWithoutCostCenter:
  Effect: Deny
  Action: ["ec2:RunInstances","rds:CreateDBInstance"]
  Resource: "*"
  Condition:
    Null: {"aws:RequestTag/costcenter": "true"}

# Config rule: detective sobre legados
RequiredTags:
  Source: AWS::Config::ManagedRule::REQUIRED_TAGS
  InputParameters:
    tag1Key: costcenter
    tag2Key: env
    tag3Key: team`}</CodeBlock>
      </Section>

      <Section title="Dashboards que viram ação" accent={accent}>
        <p>
          Camadas de dashboard: (1) executive view — total, trend, savings realizadas; (2) team view — cost por serviço/app do team, KPIs próprios, action items; (3) engineer view — cost por recurso, rightsizing candidatos, cleanup queue. Cada um consome dados por tag sem precisar explicar tag schema a cada nível.
        </p>
        <CodeBlock lang="sql">{`-- Athena query sobre CUR (Cost & Usage Report)
-- Custo por team com trend mensal
SELECT
  resource_tags_user_team              AS team,
  DATE_TRUNC('month', line_item_usage_start_date) AS month,
  SUM(line_item_unblended_cost)        AS cost_usd
FROM my_cur_table
WHERE line_item_usage_start_date >= DATE '2026-01-01'
  AND resource_tags_user_team IS NOT NULL
GROUP BY 1, 2
ORDER BY team, month;

-- Recursos untagged (buraco de observability)
SELECT
  line_item_product_code,
  line_item_resource_id,
  SUM(line_item_unblended_cost) AS cost
FROM my_cur_table
WHERE resource_tags_user_costcenter IS NULL
  AND line_item_usage_start_date >= CURRENT_DATE - INTERVAL '30' DAY
GROUP BY 1, 2
ORDER BY cost DESC
LIMIT 50;`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Stack pragmático: Tag Policy + SCP + Config rule enforcement → CUR em S3 → Athena + QuickSight/Grafana dashboards → Cost Categories pra visões de negócio → Anomaly Detection pra spike alerting. Com 1 eng FinOps, cobre org de 500 contas.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
