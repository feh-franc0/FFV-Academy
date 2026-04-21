import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dva-c02-intro');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Quantas questões e minutos tem o exame AWS DVA-C02?',
    options: [
      '100 questões, 180 min',
      '65 questões, 130 minutos, passing 720/1000',
      '50 questões, 90 min',
      '80 questões, 120 min',
    ],
    correct: 1,
    explanation: 'DVA-C02: 65 questões (scored + 15 unscored de research, você não sabe quais), 130 minutos, $150 USD, passing score 720 em escala 100-1000. Resultado não é % direto — AWS balanceia dificuldade.',
  },
  {
    question: 'Qual é o domínio com MAIOR peso no DVA-C02?',
    options: [
      'Troubleshooting (18%)',
      'Development with AWS Services (32%)',
      'Security (26%)',
      'Deployment (24%)',
    ],
    correct: 1,
    explanation: 'Dev (32%) > Security (26%) > Deployment (24%) > Troubleshooting (18%). Domina Lambda + DynamoDB + API Gateway profundo e você tem ~40% do exame. Security é IAM/KMS/Cognito/encryption. Deployment é CI/CD + IaC. Troubleshooting é X-Ray + CloudWatch.',
  },
  {
    question: 'Se você tem CLF-C02, qual é o gap pra DVA-C02?',
    options: [
      'Só mais studying',
      'CLF: overview de services, business. DVA: PROFUNDIDADE em Lambda, DynamoDB, API Gateway, CI/CD + IaC + integração entre services. Precisa de código hands-on (SAM, CDK), não só teoria',
      'Mesmo exame',
      'DVA é mais fácil',
    ],
    correct: 1,
    explanation: 'CLF é 900 nível executivo. DVA exige saber: handler Lambda, buildspec.yml, CDK em TS/Python, troubleshoot 500 em API Gateway, choose entre SQS e SNS, etc. Código real. Faça labs (AWS Skill Builder, ACloudGuru) — passa não só lendo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dva-c02-intro"
      title="DVA-C02: domínios, pesos e estratégia de estudo"
      icon="🎯"
      xp={40}
      readTime={10}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="lambda-profundo"
      nextTitle="Lambda profundo: cold start, layers e provisioned concurrency"
      quiz={quiz}
    >
      <Section title="Domínios e pesos" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Domínio', 'Peso', 'Foco']}
          rows={[
            ['1. Development with AWS Services', '32%', 'Lambda, API GW, DynamoDB, S3, Step Functions'],
            ['2. Security', '26%', 'IAM, Cognito, KMS, Secrets Manager, encryption'],
            ['3. Deployment', '24%', 'CI/CD, CloudFormation, SAM, CDK'],
            ['4. Troubleshooting & Optimization', '18%', 'CloudWatch, X-Ray, logging'],
          ]}
        />
      </Section>

      <Section title="Calendário sugerido (4 semanas)" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Semana 1</strong>: Lambda + API Gateway + DynamoDB — core 50% dos pts. Hands-on lab com SAM.</li>
          <li><strong>Semana 2</strong>: S3 + Step Functions + EventBridge/SQS/SNS. Build fan-out pattern.</li>
          <li><strong>Semana 3</strong>: Security stack (Cognito + KMS + Secrets). CI/CD (CodeBuild/Deploy/Pipeline). CFN + SAM + CDK.</li>
          <li><strong>Semana 4</strong>: X-Ray + troubleshooting + ECS Fargate. Simulados oficiais (Tutorials Dojo é referência). Capstone com questões comentadas.</li>
        </ul>
      </Section>

      <Section title="Recursos recomendados" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Oficial AWS</strong>: Exam Prep Enhanced Course (Skill Builder, free).</li>
          <li><strong>Simulados</strong>: Tutorials Dojo (Jon Bonso) é o padrão-ouro.</li>
          <li><strong>Hands-on</strong>: AWS Workshops (workshops.aws) — labs gratuitos.</li>
          <li><strong>Vídeos</strong>: Stephane Maarek (Udemy) ou Adrian Cantrill (CBT).</li>
          <li><strong>FAQs</strong>: leia FAQ oficial de Lambda, DynamoDB, S3 e API Gateway. Muita questão sai daí.</li>
        </ul>
        <Callout tone="info" icon="💡">
          DVA é cert mais "code-heavy" do track Associate. Se você só decorar sem tocar código, fica entre 700-720 (no limite). Labs são o que fazem diferença na cauda.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
