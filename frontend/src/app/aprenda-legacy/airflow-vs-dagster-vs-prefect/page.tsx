import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('airflow-vs-dagster-vs-prefect');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o principal diferencial do Dagster?',
    options: [
      'Mais ops',
      'Software-defined assets (vs task-centric do Airflow) — declara ASSETS (tabelas/dados) e deps entre eles; Dagster resolve "o que rodar pra materializar Asset X?". Mais alinhado com analytics engineering',
      'Só Python 2',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Airflow é task-oriented: DAG de operadores. Dagster é asset-oriented: @asset função declara o que produz. Backfill, re-materialização selectiva, lineage vem naturalmente. Integra nativamente com dbt (dbt models = assets). Em 2026 Dagster tá ganhando share em analytics teams.',
  },
  {
    question: 'Quando Prefect é boa escolha?',
    options: [
      'Sempre',
      'Time Python-first sem legacy, pipelines com flows dinâmicos (gerados em runtime, não DAG estático), DX importa. Prefect Cloud oferece managed tier. Mais moderno que Airflow, menos opinionated que Dagster',
      'Só em Java',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Prefect 2 (2022) repensou: flows como funções Python decoradas, tasks como sub-funções. Dynamic flows (ex: gerar N tasks baseado em input). Mais simple que Airflow, menos conceitual que Dagster. Se seu time é dev Python sem baggage, Prefect é pick.',
  },
  {
    question: 'Por que Airflow ainda domina em enterprise?',
    options: [
      'Melhor',
      'Maduro (2014+), ecossistema massivo (500+ operators — S3, BigQuery, Snowflake, dbt, Spark), community gigante, já instalado em legacy. DX ruim vs modernos mas inércia enterprise é real',
      'Mais fácil',
      'Só em gov',
    ],
    correct: 1,
    explanation: 'Airflow tem 12+ anos, 500+ operators, communities, cursos, docs. Enterprise não adota ferramenta nova sem ROI claro. Dagster/Prefect são melhores pra greenfield, mas migrar Airflow legacy = meses de trabalho. Apache Airflow 2.x modernizou muito (TaskFlow API).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="airflow-vs-dagster-vs-prefect"
      title="Airflow vs Dagster vs Prefect: qual orquestrador"
      icon="🎼"
      xp={55}
      readTime={13}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="duckdb-e-polars"
      nextTitle="DuckDB e Polars: a revolução in-process"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Airflow', 'Dagster', 'Prefect']}
          rows={[
            ['Maturity', '12 anos', '5 anos', '6 anos'],
            ['Paradigm', 'Task-centric DAGs', 'Asset-based', 'Flow-centric'],
            ['DX', 'Verbose', 'Opinionated (asset)', 'Python-first'],
            ['dbt integration', 'Airflow-dbt plugin', 'Nativo (assets)', 'prefect-dbt'],
            ['Scheduler', 'Built-in', 'Built-in', 'Built-in / Cloud'],
            ['Best for', 'Enterprise legacy', 'Analytics teams', 'Python devs greenfield'],
          ]}
        />
      </Section>

      <Section title="Decisão prática" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Já tem Airflow</strong>? Mantenha. Airflow 2.x TaskFlow API é OK.</li>
          <li><strong>Analytics engineering (dbt pesado)</strong>? Dagster — asset-based mata.</li>
          <li><strong>Time Python, greenfield, dynamic flows</strong>? Prefect.</li>
          <li><strong>Super simples (Node + Postgres)</strong>? Considere só cron + scripts. Orquestrador é overhead se não precisa.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Gotcha: orquestrador vira OPS burden real. Airflow webserver + scheduler + workers + DB + logs. Considere managed (Astronomer, MWAA, Prefect Cloud, Dagster Cloud) se time pequeno.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
