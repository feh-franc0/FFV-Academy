import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail28')!;

export const metadata: Metadata = {
  title: 'FinOps & Cost Engineering — FFV Academy',
  description:
    'FinOps como disciplina em PT-BR: unit economics de software, cost anomaly detection, rightsizing sem medo, estratégia de commitments (Savings Plans, Reserved, Spot), cultura FinOps cross-team, observability de custo por tag e capstone de redução 30% em app real.',
  keywords:
    'finops, cost engineering cloud, unit economics saas, cost anomaly detection, rightsizing aws, savings plans reserved instances spot, showback chargeback, cost allocation tags, reducao custo cloud',
};

export default function FinopsPage() {
  return <TrailBlogClient trail={trail} />;
}
