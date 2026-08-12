import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha completa de engenharia de soluções de IA sobre o Amazon Bedrock: Converse API, multimodal, o ecossistema de serviços AWS que somam ao Bedrock, RAG de produção (busca híbrida, contextual retrieval, reranking), tool use profissional, padrões agênticos, evals, playbook de redução de custo, arquitetura de referência corporativa e cases reais por setor. 32 módulos em PT-BR, atualizados para meados de 2026.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws-bedrock` },
  ...social({ titulo: `AWS Bedrock — GenAI em Produção — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/aws-bedrock' }),
  title: 'AWS Bedrock — GenAI em Produção',
  description: DESCRICAO_CARTAO,
};

export default function AwsBedrockPage() {
  const trail = CURRICULUM.find(t => t.id === 'trail-bedrock');
  if (!trail) return null;
  return <TrailBlogClient trail={trail} />;
}
