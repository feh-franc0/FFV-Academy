import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

export const metadata: Metadata = {
  title: 'SQL & Databases — JOINs, índices, EXPLAIN, transações — FFV Academy',
  description: 'SQL real com PostgreSQL: JOINs avançados, window functions, índices B-tree/GIN, EXPLAIN ANALYZE, transações ACID e modelagem de dados.',
};

export default function SqlDatabasesPage() {
  return <TrailBlogClient trail={CURRICULUM[13]} />;
}
