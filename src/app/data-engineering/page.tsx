import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail24')!;

export const metadata: Metadata = {
  title: 'Data Engineering Moderna — FFV Academy',
  description:
    'Data engineering profissional em PT-BR: batch vs stream, dbt como transformação declarativa, orchestração (Airflow/Dagster/Prefect), DuckDB e Polars (revolução in-process), data lake/lakehouse/warehouse, CDC com Debezium, Kafka fundamentos, Iceberg/Delta/Hudi, qualidade de dados com Great Expectations. Capstone de pipeline end-to-end.',
  keywords:
    'data engineering, dbt, airflow dagster prefect, duckdb polars, kafka cdc debezium, iceberg delta hudi, great expectations, data pipeline',
};

export default function DataEngineeringPage() {
  return <TrailBlogClient trail={trail} />;
}
