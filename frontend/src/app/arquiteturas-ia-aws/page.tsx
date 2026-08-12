import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Cem problemas reais resolvidos com IA na AWS, cada um com a arquitetura desenhada e percorrível: grupos, serviços, arestas rotuladas e cinco passos que reconstroem a decisão. Dez famílias — atendimento, documento, busca, agentes, copiloto interno, dados, mídia, risco, plataforma e operação — em PT-BR, com a origem de cada solução rotulada.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/arquiteturas-ia-aws` },
  ...social({ titulo: `100 Arquiteturas de IA na AWS — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/arquiteturas-ia-aws' }),
  title: '100 Arquiteturas de IA na AWS',
  description: DESCRICAO_CARTAO,
};

export default function ArquiteturasIaAwsPage() {
  const trail = CURRICULUM.find(t => t.id === 'trail-arq-ia-aws');
  if (!trail) return null;
  return <TrailBlogClient trail={trail} />;
}
