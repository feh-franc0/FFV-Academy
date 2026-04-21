import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail23')!;

export const metadata: Metadata = {
  title: 'AWS Developer Associate (DVA-C02) — FFV Academy',
  description:
    'Trilha oficial DVA-C02 em PT-BR: Lambda profundo (cold start, layers, SnapStart), API Gateway (REST/HTTP/WS), DynamoDB, S3 features, Step Functions, EventBridge/SQS/SNS, Cognito, KMS, CI/CD AWS nativo, X-Ray, Secrets Manager, ECS Fargate, CloudFormation/SAM/CDK. Capstone com simulado comentado.',
  keywords:
    'aws dva c02, aws developer associate, lambda cold start, dynamodb gsi, api gateway, step functions, eventbridge, cognito, kms, ecs fargate, cdk, simulado dva',
};

export default function AwsDvaPage() {
  return <TrailBlogClient trail={trail} />;
}
