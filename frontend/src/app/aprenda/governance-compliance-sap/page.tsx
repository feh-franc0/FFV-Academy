import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('governance-compliance-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'AWS Config faz o quê exatamente?',
    options: [
      'Backup',
      'Grava configuration snapshots + histórico de mudanças de recursos AWS. Rules (managed ou custom Lambda) avaliam compliance (ex: "todos S3 têm encryption", "todos SG não permitem 0.0.0.0/0 na 22"). Integra com Security Hub e dispara remediation',
      'Só IAM',
      'Só VPC',
    ],
    correct: 1,
    explanation: 'Config é a memória da infra: "estado do RDS-X em 10/03 às 14h era single-AZ, mudou pra multi-AZ em 11/03". Histórico queryável, timeline visual. Rules rodam em cada mudança + periódicas. Conformance Packs agrupam rules por framework (PCI, HIPAA). Auto-remediation via SSM Automation fecha o loop.',
  },
  {
    question: 'Audit Manager acelera compliance como?',
    options: [
      'Só relatório',
      'Coleta automática de evidence (Config snapshots, CloudTrail logs, Security Hub findings, IAM policies) mapeada a frameworks (SOC 2, PCI DSS, HIPAA, GDPR). Auditor recebe relatório já estruturado com attestation links. Reduz semanas de prep pra dias',
      'Substitui auditor',
      'Só blueprint',
    ],
    correct: 1,
    explanation: 'Audit Manager cria "assessment" mapeado a control framework, coleta evidence automaticamente conforme workload opera, gera package ZIP pronto pra auditor. Tempo de audit cai drasticamente. Não substitui auditor humano — mas elimina trabalho braçal de print de screen/CSV manual.',
  },
  {
    question: 'Service Catalog resolve qual problema?',
    options: [
      'Shopping',
      'Governance de provisioning: ops define produtos (CloudFormation templates) com parâmetros restritos (só types específicos, encryption mandatória, tags obrigatórias), usuários finais lançam self-service sem permissão direta pra recursos. Evita sprawl e garante compliance',
      'É o Cost Explorer',
      'Marketing',
    ],
    correct: 1,
    explanation: 'Service Catalog permite "dev cria RDS" sem dar rds:* ao dev. Ops publica produto "RDS-Postgres-Prod" com params restritos (multi-AZ ON, encryption ON, backup 14 dias, tag cost-center obrigatória). Dev lança o produto, não o recurso. Governance robusta sem friction.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="governance-compliance-sap"
      title="Governance e compliance: Config, Audit Manager, Artifact"
      icon="📋"
      xp={50}
      readTime={12}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="observability-enterprise"
      nextTitle="Observability enterprise: CloudWatch, X-Ray, OpenSearch"
      quiz={quiz}
    >
      <Section title="Stack de governance" accent={accent}>
        <CodeBlock lang="yaml">{`AWS Config:
  Configuration recorder em cada account
  Aggregator central na conta Audit
  Managed rules + Custom Lambda rules
  Conformance Packs (PCI, HIPAA, NIST, Security Best Practices)
  Auto-remediation via SSM Automation

AWS Organizations + SCPs:
  Tier 1: preventive (nega criação fora de padrão)
  Tier 2: detective (via Config)

AWS Artifact:
  Portal de compliance reports (SOC 1/2/3, ISO, PCI DSS)
  Download sob NDA pra auditoria
  Accept AWS BAA (HIPAA), MSA

Audit Manager:
  Assessment templates (SOC 2, HIPAA, PCI, GDPR, NIST 800-53)
  Evidence collection automática
  Report bundle pra auditor

Service Catalog:
  Produtos (CloudFormation) com guardrails
  Portfolios compartilhados via Organization
  Provisioning self-service com compliance built-in

License Manager:
  Tracking de licenças BYOL (Microsoft, Oracle, SAP)
  License rules bloqueando lançamento sem licença disponível`}</CodeBlock>
      </Section>

      <Section title="Config rule + auto-remediation" accent={accent}>
        <CodeBlock lang="yaml">{`# Config rule: S3 buckets precisam ter default encryption
Rule:
  ConfigRuleName: s3-bucket-server-side-encryption-enabled
  Source:
    Owner: AWS
    SourceIdentifier: S3_BUCKET_SERVER_SIDE_ENCRYPTION_ENABLED

# Remediation action (SSM Automation document)
RemediationConfiguration:
  ConfigRuleName: s3-bucket-server-side-encryption-enabled
  TargetType: SSM_DOCUMENT
  TargetId: AWS-EnableS3BucketEncryption
  Parameters:
    BucketName:
      ResourceValue: { Value: RESOURCE_ID }
    SSEAlgorithm:
      StaticValue: { Values: ['AES256'] }
  Automatic: true
  MaximumAutomaticAttempts: 3`}</CodeBlock>
      </Section>

      <Section title="Arquitetura de compliance" accent={accent}>
        <p>
          Maturidade: preventive (SCPs) + detective (Config + Security Hub) + corrective (auto-remediation) + evidence (Audit Manager) + reports (Artifact). Service Catalog fecha o loop do provisioning garantindo que recursos nascem compliant. License Manager evita surpresas com software tradicional trazido pra cloud.
        </p>
        <Callout tone="success" icon="✅">
          Em prova SAP: "empresa precisa comprovar SOC 2 pra cliente enterprise" → Audit Manager (framework template) + Security Hub (standards) + Config (evidence automática) + Artifact (subprocessors reports). "Dev precisa RDS sem ter permission IAM direta" → Service Catalog produto com params restritos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
