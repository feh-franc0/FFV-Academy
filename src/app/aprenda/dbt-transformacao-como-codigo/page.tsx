import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dbt-transformacao-como-codigo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'O que dbt transforma em workflow de dados?',
    options: [
      'Python batch processing',
      'SQL → SQL versionado + testável. Cada model = SELECT statement que vira table/view. dbt run executa DAG de dependências; dbt test roda data quality. Trata SQL como código (Git, PR, CI)',
      'Kafka streaming',
      'Substitui warehouse',
    ],
    correct: 1,
    explanation: 'dbt (data build tool) revolutionou analytics engineering (2018+). Antes: SQL em Airflow, sem testes, spaghetti. Depois: models em arquivos, refs entre eles (dbt resolve DAG), testes nativos, docs auto-geradas, lineage visual. Code review cobre transformação.',
  },
  {
    question: 'Como dbt resolve dependências entre models?',
    options: [
      'Manual',
      '{{ ref("other_model") }} — Jinja macro que dbt compila pra nome full da tabela + adiciona como dependência no DAG. Ordem de execução calculada automaticamente',
      'Alphabetical',
      'Random',
    ],
    correct: 1,
    explanation: 'dbt parse refs → DAG → topological sort → execute. Beleza: refactor de model names, só renomeia em um lugar. Schema prefix muda por environment (dev schema vs prod). Zero ordem manual. Compare com Airflow DAG Python verbose.',
  },
  {
    question: 'Quais tests dbt vem built-in?',
    options: [
      'Nenhum',
      'unique, not_null, accepted_values, relationships (foreign-key-like). Mais via packages (dbt_utils) e tests custom (SELECT que retorna rows violando condition)',
      'Só schema',
      'Apenas em Cloud tier',
    ],
    correct: 1,
    explanation: 'dbt tests são queries que DEVEM retornar ZERO rows. not_null: SELECT * WHERE col IS NULL. unique: SELECT col FROM t GROUP BY col HAVING COUNT(*) > 1. Relationships: SELECT FROM child WHERE parent_id NOT IN parent. dbt_utils adiciona: expression_is_true, equal_rowcount, etc.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dbt-transformacao-como-codigo"
      title="dbt: transformação como código, testável"
      icon="🔧"
      xp={60}
      readTime={14}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="airflow-vs-dagster-vs-prefect"
      nextTitle="Airflow vs Dagster vs Prefect: qual orquestrador"
      quiz={quiz}
    >
      <Section title="Estrutura de projeto dbt" accent={accent}>
        <CodeBlock lang="bash">{`models/
  staging/              # raw → cleaned (1:1)
    stg_users.sql
    stg_orders.sql
  marts/                # business logic
    finance/
      orders_daily.sql
    growth/
      user_cohorts.sql
schema.yml              # tests + docs
sources.yml             # declara raw tables
dbt_project.yml
`}</CodeBlock>
      </Section>

      <Section title="Model exemplo" accent={accent}>
        <CodeBlock lang="sql">{`-- models/marts/finance/orders_daily.sql
{{ config(materialized='table') }}

SELECT
  DATE_TRUNC('day', o.created_at) AS day,
  COUNT(*) AS orders,
  SUM(o.total) AS revenue,
  COUNT(DISTINCT u.id) AS unique_users
FROM {{ ref('stg_orders') }} o
JOIN {{ ref('stg_users') }} u ON o.user_id = u.id
WHERE o.status = 'paid'
GROUP BY 1

-- schema.yml
version: 2
models:
  - name: orders_daily
    columns:
      - name: day
        tests: [unique, not_null]
      - name: revenue
        tests:
          - dbt_utils.expression_is_true:
              expression: ">= 0"`}</CodeBlock>
      </Section>

      <Section title="Materializations" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>view</strong> (default): não persiste, re-executa em query</li>
          <li><strong>table</strong>: materializa full rebuild</li>
          <li><strong>incremental</strong>: só processa dados novos (configurar unique_key + where)</li>
          <li><strong>ephemeral</strong>: CTE inline (não cria objeto no DB)</li>
        </ul>
        <Callout tone="info" icon="💡">
          Core (CLI open) vs Cloud (web IDE, scheduler, lineage, alerts). Cloud é pago mas vale pra times não-dev (analistas). Core roda em Airflow/Dagster/GitHub Actions com cron.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
