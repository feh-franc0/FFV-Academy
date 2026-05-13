import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('organizations-control-tower');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o papel correto de SCP vs IAM policy?',
    options: [
      'SCP concede permissões',
      'SCP é guardrail negativo: define o teto máximo de permissões possíveis na conta. IAM policy concede permissão real dentro desse teto. Se SCP nega s3:DeleteBucket, nenhuma IAM policy consegue permitir — mesmo root da member account',
      'São iguais',
      'SCP só loga',
    ],
    correct: 1,
    explanation: 'SCP nunca concede — só limita. Padrão enterprise: SCP na OU de produção negando ações destrutivas fora de janela de manutenção, negando regiões não-autorizadas (compliance GDPR), negando desabilitar CloudTrail/Config. IAM policy dentro da conta opera abaixo desse teto.',
  },
  {
    question: 'Quando Control Tower é a escolha certa vs Organizations puro?',
    options: [
      'Sempre',
      'Control Tower é recomendado quando você quer landing zone opinionada com guardrails pré-configurados, account factory, baseline de CloudTrail/Config/SSO. Organizations puro serve quando já tem governance própria ou customizações fora do blueprint CT',
      'Nunca',
      'Só pra startups',
    ],
    correct: 1,
    explanation: 'Control Tower é "Landing Zone as managed service" — monta baseline em minutos. Mas cobra em customização: algumas orgs preferem CT + AFT (Account Factory for Terraform) pra ter IaC full. Organizations puro é pra quem tem time dedicado e quer controle total.',
  },
  {
    question: 'Qual é a mudança estratégica do IAM Identity Center (ex-SSO)?',
    options: [
      'Só renome',
      'Identity Center centraliza identidades (IdP externo: Okta/Azure AD ou diretório built-in) + permission sets aplicados como IAM roles nas contas member. Elimina IAM users por humano e tokens long-lived — login via SSO gera credenciais temporárias',
      'Substitui IAM',
      'É só MFA',
    ],
    correct: 1,
    explanation: 'Padrão 2026: zero IAM users humanos. Usuário faz SSO, assume permission set (= IAM role) na conta target, recebe credenciais temporárias (aws sso login + aws sso credential_process). CloudTrail loga o SSO identity → trilha de auditoria real. IAM users ficam só pra sistemas legados sem alternativa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="organizations-control-tower"
      title="Organizations, Control Tower e Landing Zone"
      icon="🏗️"
      xp={60}
      readTime={14}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="advanced-networking-sap"
      nextTitle="Advanced networking: RAM, Cloud WAN, Transit Gateway"
      quiz={quiz}
    >
      <Section title="Multi-account: por que, não se" accent={accent}>
        <p>
          Uma conta AWS por workload crítico é padrão em enterprise. Isolamento de blast radius (explosão de custo em dev não afeta prod), isolamento de IAM (roles de dev não têm chance em prod), billing claro (cada conta = linha no cost report), compliance (SOC2/PCI exige separação). Organizations é o eixo estrutural que gerencia essas contas.
        </p>
        <CodeBlock lang="yaml">{`Estrutura OU típica (landing zone):
  Root
  ├── Security OU
  │   ├── Log Archive (CloudTrail central + S3 WORM)
  │   └── Audit (Security Hub, GuardDuty master)
  ├── Infrastructure OU
  │   ├── Network (Transit Gateway, Route 53 hub)
  │   └── Shared Services (SSM, ECR, artifact repos)
  ├── Sandbox OU (contas pessoais descartáveis)
  ├── Workloads OU
  │   ├── Production OU
  │   │   ├── app-a-prod
  │   │   └── app-b-prod
  │   └── Non-production OU
  │       ├── app-a-dev
  │       └── app-a-staging
  └── Suspended OU (contas em decomissionamento)`}</CodeBlock>
      </Section>

      <Section title="SCPs: guardrails, não permissões" accent={accent}>
        <p>
          SCPs são policies aplicadas em OU ou conta que limitam o que IAM pode fazer. Herança é restritiva: se Root OU nega ec2:* na us-east-1, nada abaixo consegue liberar. SCPs não afetam o management account — nunca confie que SCP protegerá a conta payer.
        </p>
        <CodeBlock lang="yaml">{`Exemplos clássicos de SCP em produção:

DenyRegionsOutsideCompliance:
  Effect: Deny
  NotAction: [ "iam:*", "support:*", "route53:*" ]
  Resource: "*"
  Condition:
    StringNotEquals:
      aws:RequestedRegion: [ "us-east-1", "sa-east-1" ]

DenyRootUserActions:
  Effect: Deny
  Action: "*"
  Resource: "*"
  Condition:
    StringLike:
      aws:PrincipalArn: "arn:aws:iam::*:root"

DenyDisableSecurityServices:
  Effect: Deny
  Action:
    - cloudtrail:StopLogging
    - cloudtrail:DeleteTrail
    - config:DeleteConfigurationRecorder
    - guardduty:DeleteDetector
  Resource: "*"`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Nunca anexe SCP "Deny *" no Root OU durante teste — você pode se bloquear do management. Teste SCPs primeiro numa sandbox OU isolada.
        </Callout>
      </Section>

      <Section title="Control Tower + AFT: landing zone gerenciada" accent={accent}>
        <p>
          Control Tower faz deploy de landing zone com: Organizations estruturado, contas Log Archive + Audit, CloudTrail org-wide, Config rules mandatórias, IAM Identity Center, 20+ guardrails prontos (preventive via SCP, detective via Config). Account Factory cria contas novas pelo console. AFT (Account Factory for Terraform) adiciona camada IaC: cada conta nova é um PR em repo Git → CodePipeline aplica customizations.
        </p>
        <Callout tone="success" icon="✅">
          Padrão 2026 em enterprise AWS: Control Tower como base + AFT pra customization + Identity Center conectado a Okta/Azure AD + Organizations com OUs por ambiente. Dá governance sem reinventar roda.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
