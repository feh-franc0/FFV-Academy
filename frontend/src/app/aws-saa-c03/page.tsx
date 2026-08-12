import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha profissional para a certificação AWS Certified Solutions Architect Associate (SAA-C03). Arquitetura de soluções resilientes, seguras, performáticas e com otimização de custos — cobrindo os 4 domínios oficiais com simulado comentado.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws-saa-c03` },
  ...social({ titulo: `AWS Solutions Architect Associate (SAA-C03) — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/aws-saa-c03' }),
  title: 'AWS Solutions Architect Associate (SAA-C03)',
  description: DESCRICAO_CARTAO,
};

export default function AwsSaaC03Page() {
  const trail = getTrailByHref('/aws-saa-c03');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
