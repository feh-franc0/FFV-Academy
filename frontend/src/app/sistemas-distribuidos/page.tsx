import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'Sistemas Distribuídos — FFV Academy',
  description:
    'Trilha de Sistemas Distribuídos: CAP, PACELC, consensus (Raft), idempotência, sagas, event sourcing, Postgres MVCC e rate limiting distribuído — a base que separa dev de engenheiro de sistemas.',
  keywords:
    'sistemas distribuidos, teorema cap, pacelc, raft consensus, event sourcing, cqrs, saga pattern, postgres mvcc, rate limiting',
};

export default function SistemasDistribuidosPage() {
  return <TrailBlogClient trail={CURRICULUM[8]} />;
}
