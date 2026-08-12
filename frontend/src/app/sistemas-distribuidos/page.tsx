import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Trilha de Sistemas Distribuídos: CAP, PACELC, consensus (Raft), idempotência, sagas, event sourcing, Postgres MVCC e rate limiting distribuído — a base que separa dev de engenheiro de sistemas.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/sistemas-distribuidos` },
  ...social({ titulo: `Sistemas Distribuídos — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/sistemas-distribuidos' }),
  title: 'Sistemas Distribuídos',
  description: DESCRICAO_CARTAO,
  keywords:
    'sistemas distribuidos, teorema cap, pacelc, raft consensus, event sourcing, cqrs, saga pattern, postgres mvcc, rate limiting',
};

export default function SistemasDistribuidosPage() {
  const trail = getTrailByHref('/sistemas-distribuidos');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
