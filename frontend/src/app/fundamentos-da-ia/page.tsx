import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Do zero ao LLM. Aprenda o que é IA, Machine Learning, Redes Neurais, Tokens e Transformers — com XP e quiz em cada artigo.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/fundamentos-da-ia` },
  ...social({ titulo: `Fundamentos da IA — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/fundamentos-da-ia' }),
  title: 'Fundamentos da IA',
  description: DESCRICAO_CARTAO,
};

export default function FundamentosPage() {
  const trail = getTrailByHref('/fundamentos-da-ia');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
