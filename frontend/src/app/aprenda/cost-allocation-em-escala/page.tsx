import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cost-allocation-em-escala');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que ativar tags é só metade do trabalho?',
    options: [
      'É suficiente',
      'Sem tag policies + enforcement (SCP ou Config rule) recursos novos nascem sem tag e geram "untagged" gigante no Cost Explorer. Precisa: Tag Policies na Organization + Config rule required-tags + automação remediando tags faltantes',
      'Tags são opcionais',
      'Config é irrelevante',
    ],
    correct: 1,
    explanation: 'Tagging é tão bom quanto sua enforcement. Em org madura: Tag Policy define quais tags são mandatórias + valores permitidos (env: dev|staging|prod). Config rule marca non-compliant. SCP nega criação de recurso sem tag required. Caso contrário 30-50% do custo fica "untagged" = invisível.',
  },
  {
    question: 'Cost Categories resolvem qual problema?',
    options: [
      'Nenhum',
      'Agregar custo por dimensões de negócio (projeto, cliente, produto) que não cabem em tag única. Você define regras (ex: "todas contas da OU X + todo recurso com tag team=platform") e vira uma categoria no Cost Explorer + Budgets',
      'Substituem tags',
      'Só billing',
    ],
    correct: 1,
    explanation: 'Cost Categories são "tags computadas" — combinam múltiplas dimensões (tags + contas + serviços) via regras. Exemplo: "Cliente_Acme" = contas [111, 222] + recursos com tag customer=acme em conta shared. Essenciais pra showback/chargeback em arquitetura multi-tenant.',
  },
  {
    question: 'Como escalar Reserved Instances/Savings Plans em Organizations?',
    options: [
      'Cada conta compra sozinha',
      'Compra centralizada na conta payer (ou conta dedicada), com RI sharing habilitado na Organization — benefício se aplica automaticamente a qualquer conta que use o tipo de instância coberto. Evita lock-in local e maximiza utilização',
      'É impossível',
      'Só Spot',
    ],
    correct: 1,
    explanation: 'Com RI/Savings Plan sharing on, a hora de uso de EC2/Fargate/Lambda em qualquer conta consome commitment da pool central. Time A economiza RI não usando, time B aproveita. Desabilite sharing só pra contas "strategic" com compromisso próprio (ex: contas de cliente em SaaS).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cost-allocation-em-escala"
      title="Cost allocation tags em escala + Cost Categories"
      icon="💰"
      xp={50}
      readTime={12}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="well-architected-aplicado"
      nextTitle="Well-Architected Framework aplicado em review"
      quiz={quiz}
    >
      <Section title="Taxonomia de tags que funciona" accent={accent}>
        <p>
          Quatro dimensões cobrem 90% dos cenários: ambiente (env), ownership (team ou costcenter), aplicação (app ou service), ciclo de vida (managedby, criticality). Adicionar mais que 8-10 tags mandatórias na prática degrada — ninguém cumpre, enforcement falha.
        </p>
        <CodeBlock lang="yaml">{`Tag schema mandatório (exemplo enterprise):
  env:          [dev, staging, prod, sandbox]
  team:         [platform, data, mobile, checkout, ...]
  costcenter:   CCXXXX (4 dígitos, valida regex)
  app:          slug kebab-case do serviço
  managedby:    [terraform, cdk, manual, legacy]

Tag opcional mas recomendada:
  datasensitivity: [public, internal, confidential, pii]
  pmofficer:       email dono de compliance
  expiresat:       ISO date pra sandbox auto-destruct`}</CodeBlock>
      </Section>

      <Section title="Enforcement via Tag Policies + Config" accent={accent}>
        <CodeBlock lang="yaml">{`# Tag Policy na Organization (aplicada em Workloads OU)
{
  "tags": {
    "env": {
      "tag_key": { "@@assign": "env" },
      "tag_value": { "@@assign": ["dev","staging","prod","sandbox"] },
      "enforced_for": {
        "@@assign": ["ec2:instance","rds:db","s3:bucket","lambda:function"]
      }
    },
    "costcenter": {
      "tag_key": { "@@assign": "costcenter" },
      "enforced_for": { "@@assign": ["ec2:instance","rds:db"] }
    }
  }
}

# AWS Config rule que detecta non-compliant
required-tags:
  parameter tag1Key: env
  parameter tag2Key: costcenter
  parameter tag3Key: team

# SCP bloqueando criação sem tag (complementa Tag Policy)
DenyCreateWithoutTags:
  Effect: Deny
  Action: ["ec2:RunInstances","rds:CreateDBInstance"]
  Resource: "*"
  Condition:
    Null: { "aws:RequestTag/costcenter": "true" }`}</CodeBlock>
      </Section>

      <Section title="Cost Categories e Anomaly Detection" accent={accent}>
        <p>
          Depois de tags mandatórias, monte Cost Categories pra visões de negócio (por produto, cliente, unidade). Ative Cost Anomaly Detection com monitors por serviço e por linked account — ML da AWS aprende padrão sazonal e alerta por SNS/email quando custo diário desvia significativamente da baseline.
        </p>
        <CodeBlock lang="bash">{`# Cria anomaly monitor por serviço EC2 com threshold
aws ce create-anomaly-monitor --anomaly-monitor '{
  "MonitorName": "ec2-spend-monitor",
  "MonitorType": "DIMENSIONAL",
  "MonitorDimension": "SERVICE"
}'

aws ce create-anomaly-subscription --anomaly-subscription '{
  "SubscriptionName": "ec2-alerts",
  "MonitorArnList": ["arn:aws:ce::...:anomalymonitor/xxx"],
  "Subscribers": [{"Type":"EMAIL","Address":"finops@empresa.com"}],
  "Threshold": 100.0,
  "Frequency": "DAILY"
}'`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Combinação final: Tag Policies + Config + Cost Categories + Anomaly Detection + Budgets action-enabled (pode até parar recursos automaticamente) = FinOps visibility real em Organization de qualquer tamanho.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
