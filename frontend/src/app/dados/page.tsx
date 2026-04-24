import type { Metadata } from 'next';
import { HubPageClient } from '@/components/HubPageClient';
import { getHubBySlug } from '@/lib/curriculum';

const hub = getHubBySlug('dados')!;

export const metadata: Metadata = {
  title: `${hub.name} — FFV Academy`,
  description:
    'Hub de Dados & Analytics Engineering: Postgres Internals profundo (MVCC, EXPLAIN ANALYZE, índices avançados, vacuum, partitioning) e Data Engineering Moderna (batch/stream, dbt, DuckDB/Polars, Kafka, CDC, Iceberg, qualidade de dados). Além do CRUD.',
  keywords:
    'data engineering, postgres internals, dbt, duckdb polars, kafka cdc debezium, iceberg delta, dagster airflow, analytics engineering',
};

export default function Page() {
  return <HubPageClient hub={hub} />;
}
