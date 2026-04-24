import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('iceberg-delta-hudi');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'O que table formats (Iceberg/Delta/Hudi) adicionam em cima de Parquet?',
    options: [
      'Compressão melhor',
      'ACID transactions, time-travel (query estado de ontem), schema evolution (add/remove columns seguro), hidden partitioning, predicate pushdown otimizado. Parquet sozinho = só file format; table format = "banco de dados" em cima',
      'Nada novo',
      'Só metadata',
    ],
    correct: 1,
    explanation: 'Parquet: file columnar. Table format: camada de metadata (JSON/Avro) que lista quais files fazem parte da tabela + version. Permite: ACID (append novo snapshot atomic), time travel (read snapshot N), delete row (logical com delete files), schema evolution, compact small files sem downtime.',
  },
  {
    question: 'Qual é o diferencial do Apache Iceberg em 2026?',
    options: [
      'Mais velho',
      'Vendor-neutral (open, Netflix/Apple), dominante com suporte de AWS (S3 Tables), Google (BigLake), Snowflake (2024 adicionou Iceberg tables), Databricks UniForm. "Open table format" ganhou ecosystem — prefira Iceberg se quer portability',
      'Único open',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Iceberg virou standard de facto. 2024 AWS lançou S3 Tables (Iceberg gerenciado). Snowflake Iceberg Tables. Google BigLake. Databricks UniForm (Iceberg-compatible Delta). Lock-in evaporou — mesmo dado readável por Spark + Trino + Flink + Snowflake. Delta e Hudi ainda existem, mas Iceberg venceu mindshare.',
  },
  {
    question: 'Como time-travel funciona em table format?',
    options: [
      'Não funciona',
      'Cada commit cria novo snapshot (metadata.json referencia conjunto de files). Query AS OF VERSION N ou AS OF TIMESTAMP X lê snapshot histórico. Util pra debugging, reprodução, audit',
      'Só em Delta',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'SELECT * FROM orders VERSION AS OF 1234 (Iceberg) ou TIMESTAMP AS OF "2026-04-01". Retorna estado daquela versão. Retention configurável (expiração de snapshots antigos pra economizar storage). Uso: reproduce bug de production, audit compliance, roll-back lógico sem DELETE.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="iceberg-delta-hudi"
      title="Iceberg, Delta e Hudi: table formats abertos"
      icon="🧊"
      xp={60}
      readTime={14}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="qualidade-de-dados"
      nextTitle="Qualidade de dados: Great Expectations, dbt tests, Soda"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Format', 'Origem', 'Ecosystem 2026', 'Ponto forte']}
          rows={[
            ['Iceberg', 'Netflix/Apple (Apache)', 'Dominante, multi-engine', 'Portabilidade + schema evolution'],
            ['Delta Lake', 'Databricks (Linux Foundation)', 'Forte em Databricks/Spark', 'Time travel robusto, liquid clustering'],
            ['Hudi', 'Uber (Apache)', 'Nicho (upserts heavy)', 'Merge-on-read (updates frequentes)'],
          ]}
        />
      </Section>

      <Section title="Features comuns" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>ACID transactions</strong>: append, overwrite, merge atomically</li>
          <li><strong>Time travel</strong>: query snapshots antigos</li>
          <li><strong>Schema evolution</strong>: add/rename/drop column safely</li>
          <li><strong>Hidden partitioning</strong>: engine escolhe partition baseado em expression (Iceberg), sem user anotar em query</li>
          <li><strong>Compaction</strong>: merge small files em background</li>
          <li><strong>Deletes</strong>: logical (delete files) ou physical (rewrite)</li>
        </ul>
        <Callout tone="success" icon="✅">
          Recomendação 2026: **Iceberg**. Ecosystem forte, vendor-neutral, S3 Tables gerenciado. Migration de Delta/Hudi possível. Greenfield = Iceberg. Legacy Databricks = Delta continua OK (com UniForm pra Iceberg-compat).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
