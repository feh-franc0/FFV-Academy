import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'KV Cache, Mixture of Experts, Tool Calling e arquitetura de agentes. Como os modelos funcionam em produção.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/ia-alem-do-llm` },
  ...social({ titulo: `IA Além do LLM — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/ia-alem-do-llm' }),
  title: 'IA Além do LLM',
  description: DESCRICAO_CARTAO,
};

export default function IaAlemDoLLMPage() {
  const trail = getTrailByHref('/ia-alem-do-llm');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
