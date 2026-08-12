import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha completa para a certificação AWS Certified Cloud Practitioner (CLF-C02). Cobre 100% dos 4 domínios oficiais: Cloud Concepts, Security, Technology e Billing — com comparações, decision boxes e simulado comentado.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws-cloud-practitioner` },
  ...social({ titulo: `AWS Cloud Practitioner (CLF-C02) — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/aws-cloud-practitioner' }),
  title: 'AWS Cloud Practitioner (CLF-C02)',
  description: DESCRICAO_CARTAO,
};

export default function AwsCloudPractitionerPage() {
  const trail = getTrailByHref('/aws-cloud-practitioner');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
