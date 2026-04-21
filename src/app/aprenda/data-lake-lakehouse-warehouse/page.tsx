import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('data-lake-lakehouse-warehouse');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença arquitetural entre warehouse e lake?',
    options: [
      'Nome',
      'Warehouse: compute + storage acoplados, dados em formato proprietário, load-first (ETL). Lake: storage S3 com arquivos (Parquet), compute separado (roda onde quiser), schema-on-read (ELT)',
      'São iguais',
      'Deprecated ambos',
    ],
    correct: 1,
    explanation: 'Warehouse tradicional (Teradata, Redshift): compute + storage pegos juntos (vertical scale). Lake (S3 + Parquet): separa compute (EMR, Athena) de storage (S3). Você paga pelo que usa. Lakehouse (Databricks/Iceberg) converge — lake com ACID = best of both.',
  },
  {
    question: 'O que torna Snowflake tão popular vs Redshift?',
    options: [
      'Só marketing',
      'Decoupled compute/storage, multi-cluster auto-scaling (vários warehouses paralelos sem contenção), zero-copy cloning (dev environment sem duplicar dados), data sharing cross-account, pricing consumption',
      'Mesma coisa',
      'Gratuito',
    ],
    correct: 1,
    explanation: 'Snowflake (2014 IPO 2020) revolucionou: storage S3 + compute separado (cluster pode parar quando idle). Multi-cluster: analyst job não contende com pipeline write. Zero-copy clone: dev db em segundos sem custo de storage. Consumption pricing. Competitor atual: BigQuery (GCP) e Databricks SQL.',
  },
  {
    question: 'Quando Lakehouse ganha de warehouse tradicional?',
    options: [
      'Nunca',
      'ML/AI-heavy workloads (data scientist prefere Parquet acessível direto), unstructured data (images, logs), budget consciente (S3 barato), cross-engine flexibility (Spark + Trino + Presto + Python no mesmo storage)',
      'Só no cloud',
      'Warehouse é sempre melhor',
    ],
    correct: 1,
    explanation: 'Lakehouse (Databricks popularizou termo, Iceberg/Delta infra) brilha em: ML (DS usa PyTorch direto em Parquet), flexibility (Trino pra BI + Spark pra ML no mesmo data), cost (S3 é 10x barato que Snowflake storage), open format (sem lock-in). Warehouse ainda vence em: low-latency dashboard, BI analyst DX, governance.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="data-lake-lakehouse-warehouse"
      title="Data lake vs lakehouse vs warehouse"
      icon="🏛️"
      xp={55}
      readTime={13}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="cdc-com-debezium"
      nextTitle="CDC com Debezium: change data capture sério"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Warehouse', 'Lake', 'Lakehouse']}
          rows={[
            ['Storage', 'Proprietário', 'S3 Parquet', 'S3 + table format (Iceberg/Delta)'],
            ['Compute', 'Coupled', 'Decoupled', 'Decoupled'],
            ['Schema', 'on-write (ETL)', 'on-read (ELT)', 'Flexível'],
            ['ACID', 'Sim', 'Não', 'Sim (Iceberg/Delta)'],
            ['ML-friendly', 'Limitado', 'Bom', 'Excelente'],
            ['BI-friendly', 'Excelente', 'OK (Athena/Trino)', 'Bom'],
            ['Exemplo', 'Snowflake, Redshift, BigQuery', 'S3 + Athena', 'Databricks, Iceberg + Trino'],
            ['Cost', 'Alto', 'Baixo', 'Médio'],
          ]}
        />
      </Section>

      <Section title="Decisão" accent={accent}>
        <Callout tone="info" icon="💡">
          <strong>Simples BI + analyst team</strong>: Snowflake/BigQuery — pagar pela DX. <strong>ML-heavy + time técnico</strong>: Lakehouse (Iceberg + Trino/Spark + Databricks SQL). <strong>Volume pequeno</strong>: DuckDB + S3 Parquet pode ser suficiente — &quot;data lake caseiro&quot; sem Databricks.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
