import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha completa para a certificação AWS Certified AI Practitioner (AIF-C01). Cobre os 5 domínios oficiais: AI/ML fundamentos, Generative AI, Foundation Models, Aplicações responsáveis e Segurança/Governança — com Bedrock, SageMaker, RAG, Agents e Guardrails.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws-aif-c01` },
  ...social({ titulo: `AWS AI Practitioner (AIF-C01) — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/aws-aif-c01' }),
  title: 'AWS AI Practitioner (AIF-C01)',
  description: DESCRICAO_CARTAO,
};

export default function AwsAifC01Page() {
  const trail = CURRICULUM.find(t => t.id === 'trail-aws-aif');
  if (!trail) return null;
  return <TrailBlogClient trail={trail} />;
}
