import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cicd-aws-nativo');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual arquivo define o build em CodeBuild?',
    options: [
      'Dockerfile',
      'buildspec.yml — phases (install, pre_build, build, post_build), artifacts, cache, env',
      'package.json',
      '.github/workflows/*',
    ],
    correct: 1,
    explanation: 'buildspec.yml (raiz ou especificado) é a "receita" do build. Similar a GitHub Actions workflow mas AWS-nativo. cache.paths acelera builds. artifacts files viram output do stage.',
  },
  {
    question: 'Quais estratégias de deploy CodeDeploy suporta?',
    options: [
      'Só in-place',
      'In-place, blue/green (ECS/Lambda/EC2), canary (linear/all-at-once), rolling. AppSpec.yml define hooks (BeforeAllowTraffic, etc.) pra test durante deploy',
      'Nenhuma',
      'Só blue/green',
    ],
    correct: 1,
    explanation: 'Blue/green: cria ambiente novo, switch traffic. Canary: 10% por N min, depois 100%. Linear: incrementos iguais. Hooks executam scripts em pontos chave (health check, smoke test). Lambda: aliases + weighted routing.',
  },
  {
    question: 'Qual serviço AWS encadeia build → deploy multi-stage?',
    options: [
      'Lambda',
      'CodePipeline — stages sequenciais (Source → Build → Test → Deploy-dev → Manual Approval → Deploy-prod) com integration com CodeCommit/GitHub, CodeBuild, CodeDeploy, CFN, Lambda',
      'CloudFormation',
      'EventBridge',
    ],
    correct: 1,
    explanation: 'CodePipeline orquestra. Cada stage tem actions em paralelo/sequencial. Manual Approval action pausa pra revisão humana. Sources modernas: GitHub via CodeStar Connection, CodeCommit (AWS native), S3.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cicd-aws-nativo"
      title="CI/CD AWS-nativo: CodeBuild, CodeDeploy e CodePipeline"
      icon="🚀"
      xp={55}
      readTime={12}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="x-ray-observability"
      nextTitle="X-Ray: tracing distribuído na AWS"
      quiz={quiz}
    >
      <Section title="buildspec.yml exemplo" accent={accent}>
        <CodeBlock lang="yaml">{`version: 0.2
phases:
  install:
    runtime-versions: { nodejs: 20 }
    commands:
      - npm ci
  pre_build:
    commands:
      - npm run lint
  build:
    commands:
      - npm run test
      - npm run build
  post_build:
    commands:
      - aws s3 sync dist/ s3://$BUCKET/
artifacts:
  files:
    - '**/*'
  base-directory: dist
cache:
  paths:
    - 'node_modules/**/*'`}</CodeBlock>
      </Section>

      <Section title="Estratégias de deploy" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Estratégia', 'Downtime', 'Rollback', 'Custo']}
          rows={[
            ['In-place', 'Sim (parcial)', 'Redeploy versão antiga', 'Baixo'],
            ['Blue/green', 'Zero', 'Switch instantâneo', 'Alto (2x infra)'],
            ['Canary 10% then all', 'Zero', 'Instantâneo nos 10%', 'Médio'],
            ['Linear 10%/5min', 'Zero', 'Graceful', 'Médio'],
          ]}
        />
      </Section>

      <Section title="Quando sair do AWS-native" accent={accent}>
        <Callout tone="info" icon="💡">
          Em 2026, muitos times usam GitHub Actions em vez de CodePipeline (DX melhor, mesmo repo). CodePipeline ganha quando: deploy cross-account complexo, compliance exige ferramentas AWS-only, ou integração profunda com AWS Config/Systems Manager.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
