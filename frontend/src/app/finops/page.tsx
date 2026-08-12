import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail28')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'FinOps como disciplina em PT-BR: unit economics de software, cost anomaly detection, rightsizing sem medo, estratégia de commitments (Savings Plans, Reserved, Spot), cultura FinOps cross-team, observability de custo por tag e capstone de redução 30% em app real.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/finops` },
  ...social({ titulo: `FinOps & Cost Engineering — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/finops' }),
  title: 'FinOps & Cost Engineering',
  description: DESCRICAO_CARTAO,
  keywords:
    'finops, cost engineering cloud, unit economics saas, cost anomaly detection, rightsizing aws, savings plans reserved instances spot, showback chargeback, cost allocation tags, reducao custo cloud',
};

export default function FinopsPage() {
  return <TrailBlogClient trail={trail} />;
}
