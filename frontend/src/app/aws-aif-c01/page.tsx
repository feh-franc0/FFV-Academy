import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'AWS AI Practitioner (AIF-C01) — FFV Academy',
  description: 'Trilha completa para a certificação AWS Certified AI Practitioner (AIF-C01). Cobre os 5 domínios oficiais: AI/ML fundamentos, Generative AI, Foundation Models, Aplicações responsáveis e Segurança/Governança — com Bedrock, SageMaker, RAG, Agents e Guardrails.',
};

export default function AwsAifC01Page() {
  const trail = CURRICULUM.find(t => t.id === 'trail-aws-aif');
  if (!trail) return null;
  return <TrailBlogClient trail={trail} />;
}
