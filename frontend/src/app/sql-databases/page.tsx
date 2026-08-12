import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { getTrailByHref } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'SQL real com PostgreSQL: JOINs avançados, window functions, índices B-tree/GIN, EXPLAIN ANALYZE, transações ACID e modelagem de dados.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/sql-databases` },
  ...social({ titulo: `SQL & Databases — JOINs, índices, EXPLAIN, transações — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/sql-databases' }),
  title: 'SQL & Databases — JOINs, índices, EXPLAIN, transações',
  description: DESCRICAO_CARTAO,
};

export default function SqlDatabasesPage() {
  const trail = getTrailByHref('/sql-databases');
  // trilha removida do currículo → 404 honesto, em vez de renderizar a
  // trilha que caiu nesta posição do array (era o bug do índice numérico)
  if (!trail) notFound();
  return <TrailBlogClient trail={trail} />;
}
