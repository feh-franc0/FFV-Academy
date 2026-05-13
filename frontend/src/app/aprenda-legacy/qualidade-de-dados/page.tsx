import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('qualidade-de-dados');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Quais são as 6 dimensões clássicas de data quality?',
    options: [
      'Só tamanho',
      'Completeness (nada faltando), Uniqueness (sem duplicate), Validity (formato correto), Consistency (cross-source bate), Timeliness (freshness), Accuracy (reflete realidade)',
      'Only 2',
      'Só performance',
    ],
    correct: 1,
    explanation: 'Dimensions industry-standard (DMBoK, DAMA). Exemplos: completeness — 0 nulls em required fields. Uniqueness — 0 duplicate orders. Validity — emails parseam. Consistency — total_revenue do dashboard = SUM(orders) do DB. Timeliness — dashboard ≤ 2h atrás. Accuracy — difícil medir direto, proxy via reconciliation.',
  },
  {
    question: 'Qual ferramenta popular pra data quality declarativa?',
    options: [
      'pytest',
      'Great Expectations (open, Python) — expectations declarativas (expect_column_values_to_not_be_null, _to_be_between, _to_match_regex). Soda Core é alternativa. dbt tests nativo resolve 80% se já usa dbt',
      'Ninguém',
      'Só SQL',
    ],
    correct: 1,
    explanation: 'Great Expectations declara "data deve ser assim" em YAML/Python, valida, gera "data docs" (site HTML auto com resultados). Soda Core: similar, YAML-driven, mais leve. dbt tests: embutido se você já usa dbt. Para workflow alto volume: combine — dbt tests em transformação + GE em boundaries críticos.',
  },
  {
    question: 'O que é "circuit breaker" em pipelines de data?',
    options: [
      'Elétrica',
      'Se upstream falha data quality test, BLOQUEIA downstream pra não propagar dados ruins. Ex: daily orders table com 0 rows → pipeline de revenue não roda → dashboard preserva ontem. Previne "garbage in, garbage out"',
      'Deprecated',
      'Só em Kafka',
    ],
    correct: 1,
    explanation: 'Sem circuit breaker, bug upstream = dashboard errado = decisão de negócio errada. Com: test FALHA, downstream não inicia, alerta time. Dagster: asset checks + dependencies respeitam failures. Airflow: ShortCircuitOperator. dbt: error_severity config. Pattern: fail loud, não fail silent.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="qualidade-de-dados"
      title="Qualidade de dados: Great Expectations, dbt tests, Soda"
      icon="✅"
      xp={50}
      readTime={12}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="capstone-pipeline-analytics-completo"
      nextTitle="Capstone: pipeline analytics end-to-end"
      quiz={quiz}
    >
      <Section title="Great Expectations exemplo" accent={accent}>
        <CodeBlock lang="python">{`import great_expectations as gx

context = gx.get_context()
datasource = context.sources.add_pandas('my_source')
asset = datasource.add_dataframe_asset(name='orders', dataframe=df)

# Create expectation suite
suite = context.add_expectation_suite('orders_suite')

# Add expectations
validator = context.get_validator(
    batch_request=asset.build_batch_request(),
    expectation_suite=suite,
)
validator.expect_column_values_to_not_be_null('id')
validator.expect_column_values_to_be_unique('id')
validator.expect_column_values_to_be_between('total', 0, 1_000_000)
validator.expect_column_values_to_match_regex('email', r'^[^@]+@[^@]+$')

# Run + get result
result = validator.validate()
if not result.success:
    raise Exception(f"Data quality failed: {result.results}")`}</CodeBlock>
      </Section>

      <Section title="Data observability — next level" accent={accent}>
        <Callout tone="info" icon="💡">
          Ferramentas comerciais (Monte Carlo, Bigeye, Anomalo, Metaplane) detectam anomalias AUTOMATICAMENTE sem você escrever test — ML em metadata. Valor quando dataset é grande/dinâmico demais pra curar testes manuais. Open-source: Elementary (dbt-based) e Re_data.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
