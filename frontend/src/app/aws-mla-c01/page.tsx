import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha completa para a certificação AWS Machine Learning Engineer Associate (MLA-C01). Cobre os 4 domínios oficiais com cenário real: preparação de dados, desenvolvimento do modelo, os quatro modos de inferência e pipelines, e monitoramento de deriva com segurança.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/aws-mla-c01` },
  ...social({
    titulo: 'AWS ML Engineer Associate (MLA-C01) — FFV Academy',
    descricao: DESCRICAO_CARTAO,
    caminho: '/aws-mla-c01',
  }),
  title: 'AWS ML Engineer Associate (MLA-C01)',
  description: DESCRICAO_CARTAO,
  keywords:
    'mla-c01, aws machine learning engineer associate, certificacao aws ml, sagemaker certificacao, dominios mla c01, simulado mla c01',
};

export default function AwsMlaC01Page() {
  const trail = CURRICULUM.find(t => t.id === 'trail-mla');
  if (!trail) return null;
  return <TrailBlogClient trail={trail} />;
}
