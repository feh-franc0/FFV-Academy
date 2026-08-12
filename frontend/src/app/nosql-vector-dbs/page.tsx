import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail54')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Além do Postgres em PT-BR: MongoDB, Redis avançado, DynamoDB single-table, ClickHouse OLAP, SQLite moderno 2026 (Turso, libSQL), vector DBs (pgvector/Pinecone/Weaviate/Qdrant). Polyglot persistence.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/nosql-vector-dbs` },
  ...social({ titulo: `NoSQL + Vector Databases — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/nosql-vector-dbs' }),
  title: 'NoSQL + Vector Databases',
  description: DESCRICAO_CARTAO,
  keywords:
    'mongodb producao, redis avancado, dynamodb single table, clickhouse, sqlite turso libsql, pgvector pinecone qdrant weaviate, vector database',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
