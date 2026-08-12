import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail23')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha oficial DVA-C02 em PT-BR: Lambda profundo (cold start, layers, SnapStart), API Gateway (REST/HTTP/WS), DynamoDB, S3 features, Step Functions, EventBridge/SQS/SNS, Cognito, KMS, CI/CD AWS nativo, X-Ray, Secrets Manager, ECS Fargate, CloudFormation/SAM/CDK. Capstone com simulado comentado.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws-developer-associate` },
  ...social({ titulo: `AWS Developer Associate (DVA-C02) — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/aws-developer-associate' }),
  title: 'AWS Developer Associate (DVA-C02)',
  description: DESCRICAO_CARTAO,
  keywords:
    'aws dva c02, aws developer associate, lambda cold start, dynamodb gsi, api gateway, step functions, eventbridge, cognito, kms, ecs fargate, cdk, simulado dva',
};

export default function AwsDvaPage() {
  return <TrailBlogClient trail={trail} />;
}
