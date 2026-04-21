import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('clickhouse-analytics');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que ClickHouse é rápido em analytics?',
    options: [
      'Magia',
      'Storage colunar + compressão por coluna + vectorized execution + primary key sparse index. Queries analíticas leem só as colunas necessárias, em blocos comprimidos, processados em SIMD. Agregar bilhões de rows leva segundos',
      'Porque usa GPU',
      'Porque é escrito em Rust',
    ],
    correct: 1,
    explanation: 'ClickHouse é C++ altamente otimizado. Armazenamento colunar: cada coluna é arquivo separado com compressão específica (LZ4 default, ZSTD para texto, DoubleDelta para timestamps). Vectorized execution processa blocos de ~65k rows por vez em SIMD. Queries do tipo SUM/COUNT/GROUP BY em tabelas de trilhões de rows rodam em segundos num nó único — coisa que Postgres faria em horas.',
  },
  {
    question: 'Qual engine usar para tabela principal de eventos analytics?',
    options: [
      'Memory',
      'MergeTree (ou suas variantes: ReplacingMergeTree, AggregatingMergeTree, SummingMergeTree). É a engine padrão para analytics: sorted by primary key, particionada (tipicamente por mês), com merges em background que compactam. Replicated* versions para HA',
      'Log',
      'TinyLog',
    ],
    correct: 1,
    explanation: 'MergeTree é a família core do ClickHouse. Dados são escritos em parts ordenados pela PK, e em background o engine faz merge de parts menores em maiores (daí o nome). PARTITION BY (geralmente toYYYYMM ou toDate) permite drop de partitions antigas em O(1). ReplacingMergeTree deduplica por PK em merge, AggregatingMergeTree mantém agregações materializadas, SummingMergeTree soma colunas numéricas. Memory/Log/TinyLog são só para teste.',
  },
  {
    question: 'Por que não usar ClickHouse como OLTP?',
    options: [
      'Funciona igual',
      'UPDATE e DELETE são async via mutations (mutations reescrevem parts inteiros, caro). Transações multi-row foram adicionadas recentemente mas são limitadas. Writes pequenos e frequentes destroem performance — ClickHouse espera inserts em batch de 10k+ rows. Design é read-heavy analytics, não OLTP',
      'É proibido',
      'Não tem SQL',
    ],
    correct: 1,
    explanation: 'ClickHouse otimiza para inserts grandes e queries analíticas. Single-row insert gera um part, e muitos parts pequenos sobrecarregam o merger (too many parts error). UPDATEs são mutations que reescrevem o part afetado — custoso. Para OLTP: Postgres. Para analytics sobre dados copiados do OLTP: ClickHouse via CDC (Debezium) com buffer ou Kafka.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="clickhouse-analytics"
      title="ClickHouse para analytics"
      icon="📊"
      xp={55}
      readTime={13}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Por que ClickHouse existe" accent={accent}>
        <p>
          Postgres é row-oriented: uma row vive junta em disco. Excelente para OLTP (ler/atualizar 1 row inteira). Péssimo para analytics (SELECT SUM(x) em 1B rows lê todas as colunas, mesmo usando só x). ClickHouse inverte: colunar. Cada coluna é um arquivo comprimido. Query agregada lê só as colunas necessárias.
        </p>
      </Section>

      <Section title="Schema real: eventos de analytics" accent={accent}>
        <CodeBlock lang="sql">{`CREATE TABLE events
(
    event_time  DateTime64(3) CODEC(DoubleDelta, LZ4),
    event_name  LowCardinality(String),
    user_id     UInt64,
    session_id  UUID,
    country     LowCardinality(FixedString(2)),
    device      LowCardinality(String),
    url         String CODEC(ZSTD(3)),
    referrer    String CODEC(ZSTD(3)),
    properties  Map(String, String)
)
ENGINE = MergeTree
PARTITION BY toYYYYMM(event_time)
ORDER BY (event_name, event_time, user_id)
TTL event_time + INTERVAL 18 MONTH
SETTINGS index_granularity = 8192;`}</CodeBlock>
        <Callout tone="info" icon="💡">
          <strong>LowCardinality</strong> é dicionário automático para colunas com &lt; 10k valores únicos (event_name, country). Reduz tamanho em 10x. <strong>CODEC(DoubleDelta, LZ4)</strong> em timestamp aproveita que eventos são quase sequenciais — compressão 50x+. Essas decisões de schema têm impacto brutal em custo.
        </Callout>
      </Section>

      <Section title="Query analítica real" accent={accent}>
        <CodeBlock lang="sql">{`-- Top 10 paginas por unique users nos ultimos 7 dias,
-- com conversion rate, segmentado por pais
SELECT
    url,
    country,
    uniqExact(user_id)                                     AS unique_users,
    countIf(event_name = 'page_view')                      AS views,
    countIf(event_name = 'purchase')                       AS purchases,
    round(purchases / unique_users * 100, 2)               AS conversion_pct
FROM events
WHERE event_time >= now() - INTERVAL 7 DAY
  AND country IN ('BR', 'US', 'PT')
GROUP BY url, country
HAVING unique_users > 100
ORDER BY conversion_pct DESC
LIMIT 10
SETTINGS max_threads = 8;`}</CodeBlock>
        <p>
          Em tabela de 2 bilhões de rows, essa query roda em ~3-5s num nó de 8 cores. Postgres mesmo com índices levaria minutos.
        </p>
      </Section>

      <Section title="Materialized views para rollups" accent={accent}>
        <CodeBlock lang="sql">{`-- Rollup diario por pais (atualiza em tempo real)
CREATE MATERIALIZED VIEW events_daily
ENGINE = SummingMergeTree
PARTITION BY toYYYYMM(day)
ORDER BY (day, country, event_name)
AS SELECT
    toDate(event_time) AS day,
    country,
    event_name,
    count()            AS events,
    uniqState(user_id) AS users_state
FROM events
GROUP BY day, country, event_name;

-- Query sobre o rollup (instantanea)
SELECT day, country, sum(events) AS total
FROM events_daily
WHERE day >= today() - 30
GROUP BY day, country
ORDER BY day DESC;`}</CodeBlock>
        <Callout tone="neutral" icon="📌">
          Materialized view em ClickHouse é trigger: cada insert na tabela base alimenta a MV. Diferente de Postgres, onde MV precisa REFRESH.
        </Callout>
      </Section>

      <Section title="Ingestion: sempre em batch" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Nunca faça single-row INSERT em ClickHouse em produção. Mínimo ~10k rows por batch, idealmente 100k+. Use Kafka engine, Buffer tables, ou aplicação com buffering em memória. Single inserts geram too-many-parts e matam a performance.
        </Callout>
        <Callout tone="success" icon="✅">
          ClickHouse é a resposta quando Postgres gasta horas numa query analítica. Mas não é substituto — é complemento via CDC. OLTP fica no Postgres, analytics vai para ClickHouse.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
