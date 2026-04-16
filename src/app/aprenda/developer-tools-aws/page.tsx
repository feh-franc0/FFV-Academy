import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, CodeBlock, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Developer Tools AWS: CodePipeline, CDK, CloudFormation e SAM — FFV Academy',
  description: 'Os serviços de CI/CD, IaC e observabilidade de aplicações na AWS: CodeCommit, CodeBuild, CodeDeploy, CodePipeline, CloudFormation, CDK, SAM, Amplify e X-Ray.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o serviço de IaC (Infrastructure as Code) nativo da AWS que permite descrever toda a infra em um template YAML/JSON?',
    options: [
      'AWS Config',
      'AWS CloudFormation',
      'AWS CDK',
      'AWS Systems Manager',
    ],
    correct: 1,
    explanation: 'CloudFormation é o serviço de IaC nativo e gratuito da AWS — você paga só pelos recursos que ele cria. CDK é um wrapper que gera CloudFormation a partir de código (TypeScript, Python, Java). Config é compliance/auditoria. Systems Manager é operações (patches, inventário).',
  },
  {
    question: 'Uma equipe quer um pipeline CI/CD totalmente gerenciado que detecte push no repositório, rode testes, builde e faça deploy automático. Qual serviço orquestra isso?',
    options: [
      'AWS CodeBuild',
      'AWS CodeDeploy',
      'AWS CodePipeline',
      'AWS CodeCommit',
    ],
    correct: 2,
    explanation: 'CodePipeline é o orquestrador — ele dispara stages (Source → Build → Deploy). Dentro do pipeline, CodeBuild roda build/testes e CodeDeploy aplica o deploy. CodeCommit é o repo Git gerenciado (source).',
  },
  {
    question: 'O que é AWS SAM (Serverless Application Model)?',
    options: [
      'Um novo serviço serverless concorrente do Lambda',
      'Uma extensão do CloudFormation com sintaxe simplificada para aplicações serverless (Lambda, API GW, DynamoDB)',
      'Uma IDE da AWS',
      'Um framework de ML',
    ],
    correct: 1,
    explanation: 'SAM é shorthand sobre CloudFormation. Escreve-se menos YAML para criar Lambda + API Gateway + DynamoDB. Tem CLI própria (sam build, sam deploy, sam local invoke) e converte internamente em CloudFormation puro ao deployar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="developer-tools-aws"
      title="Developer Tools: CodePipeline, CDK, CloudFormation e SAM"
      icon="🛠️"
      xp={45}
      readTime={9}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="simulado-practitioner"
      nextTitle="Simulado CLF-C02 Comentado"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        &ldquo;Tudo como código&rdquo; não é slogan — é exigência operacional. Infraestrutura descrita em arquivo, pipeline automatizado, deploy versionado.
        A AWS tem uma família inteira de serviços Code* pra CI/CD, e duas vertentes de IaC: a declarativa (CloudFormation/SAM) e a imperativa (CDK). O
        CLF-C02 espera que você saiba quem faz o quê.
      </p>

      <ExamDomainBadge domain="Technology" weight="~34% do CLF-C02" color={ACCENT} />

      <Section title="Pipeline CI/CD na AWS" accent={ACCENT}>
        <ArchDiagram title="Fluxo típico com os serviços Code*" accent={ACCENT}>{`
  ┌─────────────┐   ┌────────────┐   ┌────────────┐   ┌────────────┐
  │ CodeCommit  │→ │ CodePipeline │→ │ CodeBuild  │→ │ CodeDeploy │
  │ (git repo)  │   │ (orquestra)  │   │ (build+test)│  │ (deploy)  │
  └─────────────┘   └────────────┘   └────────────┘   └────────────┘
     ▲ push              │                │                │
     │                   ▼                ▼                ▼
    dev               SNS/EventBridge    S3 artifact       EC2/ECS/Lambda
                       notificações      CloudWatch Logs   Blue/Green · Canary
        `}</ArchDiagram>
      </Section>

      <Section title="Serviços Code* um a um" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Função', 'Analogias externas']}
          rows={[
            ['CodeCommit', 'Repositório Git gerenciado e privado', 'GitHub · GitLab · Bitbucket'],
            ['CodeBuild', 'Executa build e testes em containers gerenciados', 'Jenkins · CircleCI · GitHub Actions runner'],
            ['CodeDeploy', 'Deploy automatizado em EC2, Lambda, ECS (Blue/Green, Canary, Rolling)', 'Argo CD · Spinnaker'],
            ['CodePipeline', 'Orquestra stages (source → build → test → deploy)', 'Jenkins Pipeline · GitHub Actions workflows'],
            ['CodeArtifact', 'Repositório de dependências (npm, pip, Maven, NuGet)', 'Artifactory · Nexus'],
            ['CodeStar', 'DEPRECATED em 2024 — não aparece mais no CLF-C02 novo', '—'],
          ]}
        />
        <Callout tone="warn">
          A AWS anunciou em julho/2024 o <strong>deprecation do CodeCommit</strong> e CodeStar para novos clientes. No exame CLF-C02 atualizado você
          pode ver &ldquo;qual serviço <em>era</em> o repo git da AWS&rdquo; — a resposta ainda é CodeCommit, mas a tendência é migrar pra GitHub.
        </Callout>
      </Section>

      <Section title="Infraestrutura como Código (IaC)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'Estilo', 'Quando usar']}
          rows={[
            ['CloudFormation', 'Declarativo (YAML/JSON)', 'Qualquer infra AWS · gratuito (paga recursos criados)'],
            ['AWS SAM', 'Declarativo (extensão do CloudFormation)', 'Aplicações serverless (Lambda + API GW + DynamoDB)'],
            ['AWS CDK', 'Imperativo (TypeScript, Python, Java, C#, Go)', 'Times que preferem linguagem de programação sobre YAML'],
            ['Terraform (terceiros)', 'Declarativo (HCL)', 'Multi-cloud · comunidade grande'],
          ]}
        />
        <Callout tone="info">
          CDK internamente <strong>gera CloudFormation</strong>. Ele é um wrapper de alto nível — você escreve TypeScript e o CDK sintetiza o template YAML
          que o CloudFormation aplica.
        </Callout>
        <CodeBlock lang="typescript">{`// CDK — cria um bucket S3 com versionamento em 3 linhas
import { Bucket } from 'aws-cdk-lib/aws-s3';

new Bucket(this, 'MyBucket', {
  versioned: true,
  encryption: BucketEncryption.S3_MANAGED,
});`}</CodeBlock>
      </Section>

      <Section title="AWS SAM em profundidade" accent={ACCENT}>
        <p>
          SAM é uma extensão do CloudFormation com sintaxe mais curta pra serverless. Tem CLI própria (<InlineCode>sam build</InlineCode>,
          <InlineCode>sam deploy</InlineCode>, <InlineCode>sam local invoke</InlineCode>) que <strong>simula Lambda localmente</strong> com Docker.
        </p>
        <CodeBlock lang="yaml">{`# template.yaml (SAM)
Transform: AWS::Serverless-2016-10-31
Resources:
  HelloFunction:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: ./src
      Handler: app.handler
      Runtime: nodejs20.x
      Events:
        Api:
          Type: Api
          Properties: { Path: /hello, Method: get }`}</CodeBlock>
      </Section>

      <Section title="Amplify e X-Ray" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Serviço', 'Para quê']}
          rows={[
            ['AWS Amplify', 'Hosting + CI/CD para apps web/mobile (React, Vue, Flutter). Gera GraphQL/REST API + auth + storage com poucos comandos'],
            ['AWS X-Ray', 'Distributed tracing — mostra latência e erros entre microserviços Lambda/ECS/EC2. Instrumentação via SDK'],
          ]}
        />
        <Callout tone="info">
          X-Ray se integra com CloudWatch e App Mesh. Aparece no pilar <strong>Operational Excellence</strong> do Well-Architected.
        </Callout>
      </Section>

      <Section title="Cenários" accent={ACCENT}>
        <DecisionBox
          scenario="Criar uma stack com VPC + EC2 + RDS + S3 que você possa recriar 100% em outra conta AWS"
          winner="CloudFormation (ou CDK se o time prefere TypeScript)"
          winnerColor={ACCENT}
          why="CloudFormation descreve infra declarativamente e cria/atualiza/apaga tudo de forma atômica. CDK é alternativa imperativa que acaba gerando CloudFormation."
          alternatives={[{ name: 'Terraform', note: 'se precisa multi-cloud.' }, { name: 'Scripts CLI manuais', note: 'não recomendado — quebra idempotência.' }]}
        />
        <DecisionBox
          scenario="Construir pipeline CI/CD que, a cada push, builda, testa e deploya em 3 contas (dev/staging/prod)"
          winner="CodePipeline + CodeBuild + CodeDeploy"
          winnerColor={ACCENT}
          why="CodePipeline orquestra stages com manual approval entre ambientes. CodeBuild roda build isolado em container. CodeDeploy faz Blue/Green no EC2/ECS/Lambda."
          alternatives={[{ name: 'GitHub Actions + AWS CLI', note: 'muito flexível, mais trabalho de IAM.' }, { name: 'Jenkins self-hosted', note: 'trabalho operacional alto.' }]}
        />
        <DecisionBox
          scenario="Debugar latência alta em arquitetura Lambda → DynamoDB → outra Lambda"
          winner="AWS X-Ray"
          winnerColor={ACCENT}
          why="X-Ray traça a request de ponta a ponta mostrando onde o tempo foi gasto. Integra nativamente com Lambda, API Gateway, SDK AWS."
          alternatives={[{ name: 'CloudWatch Logs Insights', note: 'bom para logs, ruim pra tracing.' }, { name: 'OpenTelemetry self-managed', note: 'overhead alto.' }]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual a diferença entre CloudFormation e CDK?"
          a={<>CloudFormation é declarativo (YAML/JSON). CDK é imperativo — você escreve código em linguagem de programação (TypeScript, Python, etc.) que o CDK sintetiza em template CloudFormation. CDK oferece loops, condicionais e reuso de componentes; CloudFormation é mais verboso mas universal.</>}
        />
        <QAItem
          q="CodeDeploy suporta qual tipo de deploy?"
          a={<><strong>In-place</strong> (rolling), <strong>Blue/Green</strong> (troca completa entre duas frotas) e <strong>Canary</strong> (10% primeiro, depois 100%). Para Lambda e ECS, é Blue/Green nativo.</>}
        />
        <QAItem
          q="CloudFormation é pago?"
          a={<>O <strong>serviço em si é gratuito</strong>. Você paga só pelos recursos que o template cria (EC2, S3, RDS, etc.). Há um pequeno custo para recursos de terceiros e modules extensions.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> CodeCommit = repo · CodeBuild = build · CodeDeploy = deploy · CodePipeline = orquestra · CloudFormation = IaC nativo ·
        CDK = IaC imperativo (gera CloudFormation) · SAM = CloudFormation simplificado pra serverless · Amplify = full-stack frontend · X-Ray = tracing
        distribuído.
      </Callout>
    </div>
  );
}
