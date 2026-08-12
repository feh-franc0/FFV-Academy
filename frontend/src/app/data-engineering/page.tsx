import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail24')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Data engineering profissional em PT-BR: batch vs stream, dbt como transformação declarativa, orchestração (Airflow/Dagster/Prefect), DuckDB e Polars (revolução in-process), data lake/lakehouse/warehouse, CDC com Debezium, Kafka fundamentos, Iceberg/Delta/Hudi, qualidade de dados com Great Expectations. Capstone de pipeline end-to-end.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/data-engineering` },
  ...social({ titulo: `Data Engineering Moderna — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/data-engineering' }),
  title: 'Data Engineering Moderna',
  description: DESCRICAO_CARTAO,
  keywords:
    'data engineering, dbt, airflow dagster prefect, duckdb polars, kafka cdc debezium, iceberg delta hudi, great expectations, data pipeline',
};

export default function DataEngineeringPage() {
  return <TrailBlogClient trail={trail} />;
}
