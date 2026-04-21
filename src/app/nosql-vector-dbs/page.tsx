import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail54')!;

export const metadata: Metadata = {
  title: 'NoSQL + Vector Databases — FFV Academy',
  description:
    'Além do Postgres em PT-BR: MongoDB, Redis avançado, DynamoDB single-table, ClickHouse OLAP, SQLite moderno 2026 (Turso, libSQL), vector DBs (pgvector/Pinecone/Weaviate/Qdrant). Polyglot persistence.',
  keywords:
    'mongodb producao, redis avancado, dynamodb single table, clickhouse, sqlite turso libsql, pgvector pinecone qdrant weaviate, vector database',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
