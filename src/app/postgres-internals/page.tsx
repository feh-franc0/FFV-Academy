import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail38')!;

export const metadata: Metadata = {
  title: 'Database Deep — Postgres Internals — FFV Academy',
  description:
    'Postgres profissional em PT-BR: MVCC e isolation levels reais, EXPLAIN ANALYZE ninja, índices avançados (B-tree/BRIN/GIN/GiST/partial/covering), vacuum + bloat, connection pooling (pgbouncer), replication streaming+logical, partitioning declarativo e sharding (Citus). Capstone: query 30s → 50ms.',
  keywords:
    'postgres internals, mvcc isolation levels, explain analyze, indices avancados postgres, vacuum autovacuum bloat, pgbouncer, replication patroni, partitioning citus',
};

export default function PostgresInternalsPage() {
  return <TrailBlogClient trail={trail} />;
}
