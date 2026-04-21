import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cicd-enterprise-sap');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que CDK Pipelines > CodePipeline YAML manual em Organizations?',
    options: [
      'Só hype',
      'CDK Pipelines expressa o pipeline como código TypeScript/Python, com self-mutation (pipeline atualiza a si mesmo no próximo deploy). Cross-account trivial via addStage com env diferente. Evita drift entre código infra e YAML de pipeline que ninguém mantém',
      'É mais caro',
      'Só funciona em dev',
    ],
    correct: 1,
    explanation: 'Self-mutation: commit muda definição do pipeline + mudança de infra juntas, pipeline detecta e reaplica a si mesmo antes dos stages. Cross-account via CDK bootstrap bem feito + addStage(new ProdStage(app, "Prod", { env: { account, region } })). YAML tradicional exige sincronia manual entre .yaml e stacks — drifta.',
  },
  {
    question: 'Manual approval gates: quando obrigatório?',
    options: [
      'Nunca',
      'Deploys em produção regulada (PCI, HIPAA, SOX), janelas de mudança formais, release com risco de reversão difícil (migration de schema). Pode combinar: auto até staging → manual approval → prod. Boas práticas: approval assíncrono via email/Slack, logged em CloudTrail, expiração',
      'Sempre',
      'Só dev',
    ],
    correct: 1,
    explanation: 'Manual approval não é atraso — é gate de compliance. Obrigatório em segmentos regulados. Evite em CI diário (mata velocity) mas mantenha em deploy prod significativo. Ferramentas: CodePipeline Approval action + SNS, GitHub Environments com required reviewers, ServiceNow Change Management integrado.',
  },
  {
    question: 'Blue/green em escala enterprise: quais componentes?',
    options: [
      'Só DNS switch',
      'CodeDeploy com BlueGreenDeployment type (ECS/Lambda alias/EC2 com ELB), health checks graduais, automated rollback em CloudWatch alarm, traffic shifting (canary 10% → 50% → 100%), hooks de pre/post traffic pra smoke tests. E infra-as-code pra reproducibilidade',
      'Só DNS',
      'Backup',
    ],
    correct: 1,
    explanation: 'Blue/green maduro = nova versão recebe tráfego gradual com health checks por estágio. Rollback automático se erro 5xx > threshold. CodeDeploy orquestra em ECS/Lambda/EC2. Canary (10% por 5 min → 50% → 100%) é padrão. Pre-traffic hook valida smoke, post-traffic valida métricas. Blue/green sem automation = fake blue/green.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cicd-enterprise-sap"
      title="CI/CD enterprise multi-account com CDK Pipelines"
      icon="🚀"
      xp={60}
      readTime={14}
      trailName="AWS Solutions Architect Professional (SAP-C03)"
      trailColor={accent}
      nextSlug="governance-compliance-sap"
      nextTitle="Governance e compliance: Config, Audit Manager, Artifact"
      quiz={quiz}
    >
      <Section title="Arquitetura cross-account padrão" accent={accent}>
        <CodeBlock lang="yaml">{`Accounts envolvidas:
  tools-account:     CodePipeline + CodeBuild + ECR + artifacts
  dev-account:       stacks de dev (auto-deploy)
  staging-account:   stacks de staging (auto-deploy)
  prod-account:      stacks de prod (manual approval)

Bootstrap CDK:
  Em cada conta-alvo, 'cdk bootstrap aws://ACCOUNT/REGION
  --trust TOOLS_ACCOUNT --cloudformation-execution-policies ...'
  cria IAM role que tools-account pode assumir pra deploy.

Pipeline (CDK):
  1. Source: CodeCommit/GitHub via CodeStar Connection
  2. Build: CodeBuild cdk synth → artifact cloud assembly
  3. SelfMutate: pipeline atualiza a si mesmo
  4. DevStage: deploy em dev-account (auto)
  5. IntegrationTests: CodeBuild smoke tests
  6. StagingStage: deploy em staging-account (auto)
  7. ManualApproval: SNS notifica team, espera aprovação
  8. ProdStage: deploy em prod-account
  9. PostProdValidation: CodeBuild valida + alarmes`}</CodeBlock>
      </Section>

      <Section title="CDK Pipelines mínimo" accent={accent}>
        <CodeBlock lang="ts">{`import { Stack, StackProps, Stage, StageProps } from 'aws-cdk-lib';
import { CodePipeline, CodePipelineSource, ShellStep, ManualApprovalStep } from 'aws-cdk-lib/pipelines';

class AppStage extends Stage {
  constructor(scope: Construct, id: string, props: StageProps) {
    super(scope, id, props);
    new AppStack(this, 'AppStack', props);
  }
}

export class PipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      pipelineName: 'app-pipeline',
      synth: new ShellStep('Synth', {
        input: CodePipelineSource.connection('org/repo', 'main', {
          connectionArn: 'arn:aws:codestar-connections:...',
        }),
        commands: ['npm ci', 'npm test', 'npx cdk synth'],
      }),
      crossAccountKeys: true,
    });

    pipeline.addStage(new AppStage(this, 'Dev', {
      env: { account: '111111111111', region: 'us-east-1' },
    }));

    pipeline.addStage(new AppStage(this, 'Staging', {
      env: { account: '222222222222', region: 'us-east-1' },
    }));

    pipeline.addStage(new AppStage(this, 'Prod', {
      env: { account: '333333333333', region: 'us-east-1' },
    }), {
      pre: [new ManualApprovalStep('PromoteToProd')],
    });
  }
}`}</CodeBlock>
      </Section>

      <Section title="Artifact signing e rollback" accent={accent}>
        <p>
          Assinar artifacts com AWS Signer garante supply chain integrity — container images e Lambda packages assinados, verificados no deploy, rejeitados se tampered. Rollback estratégico: CodeDeploy automatic rollback em CloudWatch alarm, blue/green ECS com deployment circuit breaker, Lambda alias shifting reversível em minutos, RDS point-in-time recovery como safety net em migrations.
        </p>
        <Callout tone="success" icon="✅">
          Checklist CI/CD enterprise: CDK Pipelines com self-mutation, multi-account via trust bootstrap, integration tests como stage, manual approval pra prod, artifact signing, blue/green em ECS/Lambda, rollback automático por alarm, audit trail em CloudTrail. Esse stack é alvo em 20-30% das questões de Continuous Improvement no SAP.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
