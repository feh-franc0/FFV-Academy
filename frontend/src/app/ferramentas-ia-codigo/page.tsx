import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Claude Code, Codex, Cursor, GitHub Copilot, Amazon Q e Kiro. As diferenças reais entre os coding agents — técnica, arquitetura, filosofia.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/ferramentas-ia-codigo` },
  ...social({ titulo: `Ferramentas de IA para Código — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/ferramentas-ia-codigo' }),
  title: 'Ferramentas de IA para Código',
  description: DESCRICAO_CARTAO,
};

export default function FerramentasIaCodigoPage() {
  const trail = getTrailByHref('/ferramentas-ia-codigo');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
