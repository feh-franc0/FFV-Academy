import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('duckdb-e-polars');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que DuckDB é chamado "SQLite pra analytics"?',
    options: [
      'Marketing',
      'Embedded (biblioteca, não server), zero config, arquivo único — MAS colunar (OLAP optimized) em vez de row-oriented (OLTP). Roda análises de GB em laptop, lê Parquet direto, integra Pandas 0-copy',
      'Syntaxe igual',
      'SQLite fork',
    ],
    correct: 1,
    explanation: 'DuckDB (2019, CWI) embedded columnar OLAP. SQL full (window functions, CTEs, joins). Lê Parquet/CSV/JSON diretamente. 0-copy com Pandas/Arrow. 10-100x mais rápido que Pandas em agregações. Laptop &lt; 100GB datasets = DuckDB vence cluster Spark.',
  },
  {
    question: 'O que Polars oferece vs pandas?',
    options: [
      'Nada novo',
      'Escrito em Rust, lazy evaluation (otimiza query plan), multithreaded nativo, Arrow-backed, 10-100x mais rápido em dataset grande, API similar a pandas + SQL mode. Zero GIL (Python) issue',
      'Deprecated',
      'Só CSV',
    ],
    correct: 1,
    explanation: 'Polars (Ritchie Vink, 2020) é pandas killer. Pandas single-threaded + eager + 10x memória do dataset. Polars Rust parallel + lazy (optimizer aplica predicate pushdown, projection) + Arrow zero-copy. Migração: sintaxe ~similar, ganho brutal em datasets médios-grandes.',
  },
  {
    question: 'Quando NÃO usar DuckDB/Polars (precisa Spark/BigQuery)?',
    options: [
      'Nunca precisa',
      'Datasets &gt; 1TB, processing distribuído entre nodes, shared compute team-wide, existing cluster. Em single-node até ~500GB, DuckDB/Polars são melhores. Jordan Tigani: "big data is dead" pros 90%',
      'Sempre',
      'Só em Python',
    ],
    correct: 1,
    explanation: 'Hardware moderno: 256GB RAM + NVMe em laptop/VM single-node. DuckDB processa dataset de 500GB com ease. Spark cluster vale pra &gt; 1TB real. Jordan Tigani (ex-BigQuery) 2023: maioria das companies não tem big data de verdade — paga cluster por medo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="duckdb-e-polars"
      title="DuckDB e Polars: a revolução in-process"
      icon="🦆"
      xp={55}
      readTime={12}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="data-lake-lakehouse-warehouse"
      nextTitle="Data lake vs lakehouse vs warehouse"
      quiz={quiz}
    >
      <Section title="DuckDB exemplo" accent={accent}>
        <CodeBlock lang="sql">{`-- Ler Parquet diretamente do S3
SELECT country, COUNT(*), SUM(revenue)
FROM 's3://bucket/orders/*.parquet'
WHERE date >= '2026-01-01'
GROUP BY country
ORDER BY 3 DESC;

-- JOIN com CSV local
SELECT u.name, COUNT(o.id)
FROM 'users.csv' u
JOIN 'orders.csv' o ON o.user_id = u.id
GROUP BY u.name;

-- Em Python: 0-copy com pandas
import duckdb, pandas as pd
df = pd.read_csv('orders.csv')
result = duckdb.sql('SELECT country, COUNT(*) FROM df GROUP BY country').df()`}</CodeBlock>
      </Section>

      <Section title="Polars exemplo" accent={accent}>
        <CodeBlock lang="python">{`import polars as pl

# Lazy evaluation — optimizer aplica predicate pushdown
df = (
    pl.scan_parquet('orders/*.parquet')  # lazy, não lê ainda
    .filter(pl.col('date') >= '2026-01-01')
    .group_by('country')
    .agg([
        pl.count().alias('orders'),
        pl.col('revenue').sum().alias('revenue'),
    ])
    .sort('revenue', descending=True)
    .collect()  # execute agora
)

# SQL mode também disponível
ctx = pl.SQLContext(orders=df)
result = ctx.execute('SELECT country, SUM(revenue) FROM orders GROUP BY country').collect()`}</CodeBlock>
      </Section>

      <Section title="Quando usar cada" accent={accent}>
        <Callout tone="info" icon="💡">
          <strong>DuckDB</strong>: workflow SQL-first, integração com Parquet, notebooks analíticos. <strong>Polars</strong>: workflow DataFrame Python, ML preprocessing, data science. Os dois combinam: DuckDB pra query complexa, Polars pra transformação Pythonic. Ambos 10-100x pandas em dataset médio.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
