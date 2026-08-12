import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail38')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Postgres profissional em PT-BR: MVCC e isolation levels reais, EXPLAIN ANALYZE ninja, índices avançados (B-tree/BRIN/GIN/GiST/partial/covering), vacuum + bloat, connection pooling (pgbouncer), replication streaming+logical, partitioning declarativo e sharding (Citus). Capstone: query 30s → 50ms.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/postgres-internals` },
  ...social({ titulo: `Database Deep — Postgres Internals — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/postgres-internals' }),
  title: 'Database Deep — Postgres Internals',
  description: DESCRICAO_CARTAO,
  keywords:
    'postgres internals, mvcc isolation levels, explain analyze, indices avancados postgres, vacuum autovacuum bloat, pgbouncer, replication patroni, partitioning citus',
};

export default function PostgresInternalsPage() {
  return <TrailBlogClient trail={trail} />;
}
