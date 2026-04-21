import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, ComparisonTable, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cloudformation-sam-cdk');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'O que CDK faz por baixo dos panos?',
    options: [
      'Chama APIs direto',
      'Sintetiza pra CloudFormation template. Você escreve em TS/Python/Java/Go/C#, cdk synth gera YAML/JSON, cdk deploy sobe via CFN',
      'Provisiona direto',
      'Replace CFN',
    ],
    correct: 1,
    explanation: 'CDK = abstração sobre CFN. Benefícios: código real (loops, funções, reuso), constructs de alto nível (L2, L3), bundling nativo (Lambda code build automático). Por trás: CFN ainda é o executor — vê como ChangeSet no console.',
  },
  {
    question: 'Qual é a feature principal do SAM?',
    options: [
      'Só uma CLI',
      'Transform: :AWS::Serverless-2016-10-31 expande primitives concisas (AWS::Serverless::Function) em vários recursos CFN completos (Lambda + Role + LogGroup + etc). Boilerplate reduzido',
      'Substitui CFN',
      'Só Python',
    ],
    correct: 1,
    explanation: 'SAM é macro CFN pra serverless. Escreve ~10 linhas de YAML, expande pra 50. sam local start-api roda API Gateway local. sam deploy sobe via CFN. Em 2026 muitos times preferem CDK mas SAM é perfeito pra projetos 100% serverless pequenos.',
  },
  {
    question: 'O que é drift detection em CFN?',
    options: [
      'Bug',
      'Detecta mudanças feitas FORA do stack (alguém editou no console) — compara estado real com template. Detect drift não corrige, só alerta',
      'Deprecated',
      'Substitui Terraform',
    ],
    correct: 1,
    explanation: 'Problema real: admin edita manualmente no console, stack desalinha. Drift detection mostra diff. Terraform plan faz equivalente. Boa prática: alertas automáticos + política "só IaC muda infra" (SCP pode impor).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cloudformation-sam-cdk"
      title="IaC: CloudFormation vs SAM vs CDK"
      icon="📜"
      xp={55}
      readTime={12}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="simulado-dva-c02"
      nextTitle="Capstone: simulado DVA-C02 comentado (15 questões)"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Feature', 'CFN', 'SAM', 'CDK']}
          rows={[
            ['Linguagem', 'YAML/JSON', 'YAML (macro)', 'TS/Python/Java/Go/C#'],
            ['Abstração', 'Raw', 'Serverless primitives', 'L1/L2/L3 constructs'],
            ['Loops/condicionais', 'Limitado (Fn::If)', 'Como CFN', 'Código real'],
            ['Typings/IDE', 'Fraco', 'Fraco', 'Forte'],
            ['Multi-cloud', 'Não', 'Não', 'Não (use Terraform/Pulumi)'],
            ['Curva', 'Média', 'Baixa (serverless)', 'Alta inicial, vale'],
          ]}
        />
      </Section>

      <Section title="Exemplo comparativo: Lambda + API GW" accent={accent}>
        <CodeBlock lang="typescript">{`// CDK (TypeScript)
const fn = new lambda.Function(this, 'MyFn', {
  runtime: lambda.Runtime.NODEJS_20_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset('src'),
});
const api = new apigw.LambdaRestApi(this, 'MyApi', { handler: fn });
// 5 linhas. CFN equivalente: ~60 linhas YAML.`}</CodeBlock>
      </Section>

      <Section title="StackSets (multi-account)" accent={accent}>
        <Callout tone="info" icon="💡">
          StackSets aplicam stack em múltiplas accounts/regions de uma vez (Organizations). Ideal pra bootstrap (baseline security, guardrails) em empresas com 100+ accounts.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
