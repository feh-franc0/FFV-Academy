import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-kafka-pipeline-real');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual arquitetura de pipeline demonstra mais maturidade em um capstone Kafka portfolio-grade?',
    options: [
      'Microserviço publish direto no Kafka',
      'Postgres OLTP → Debezium (CDC + outbox SMT) → Kafka (schemas Avro no registry) → Flink/Streams (enriquecimento, window aggregates) → ClickHouse OLAP + materialized views, com EOS habilitado e benchmark de throughput documentado',
      'Kafka direto no front-end',
      'REST API com polling',
    ],
    correct: 1,
    explanation: 'Capstone sênior exige: fonte de verdade OLTP (Postgres), propagação confiável via CDC+outbox (elimina dual-write), contrato formalizado (Avro+registry), processamento stateful (Streams/Flink) e sink analítico (ClickHouse com MV). EOS + benchmark + observability comprovam que você roda isso de verdade.',
  },
  {
    question: 'O que diferencia benchmark publicável de "rodei localmente"?',
    options: [
      'Só volume',
      'Setup documentado (HW, versões, configs), metodologia (warmup, duração, percentis p50/p95/p99, não só média), cenários (load normal, burst, failure injection), e análise honesta (gargalos identificados, custo por milhão de eventos)',
      'Rodar uma vez',
      'Gráfico bonito',
    ],
    correct: 1,
    explanation: 'Recruiter sênior reconhece benchmark sério: p99 importa mais que média, warmup evita JIT skew, failure injection (matar broker) mostra resiliência real, custo por M eventos (EUR/M) dá noção de viabilidade econômica. Sem isso, é demo, não engineering.',
  },
  {
    question: 'Qual entregável de writeup vale mais para um recrutador técnico?',
    options: [
      'Repo com README de 3 linhas',
      'README + diagrama de arquitetura + runbook (como subir, failure modes, recovery) + decisões registradas (ADRs: por que outbox vs dual write, por que Avro vs Proto, por que Streams vs Flink) + benchmarks reprodutíveis + dashboard observability live',
      'Só Docker compose',
      'PDF longo',
    ],
    correct: 1,
    explanation: 'Senior hiring bar é thought process documentado. ADRs mostram trade-off analysis; runbook mostra operabilidade; benchmarks reprodutíveis mostram rigor; dashboard live mostra que sobrevive em ambiente real. Código puro sem writeup é metade do sinal.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-kafka-pipeline-real"
      title="Capstone: pipeline Kafka real"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Event Streaming / Kafka Depth"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto proposto" accent={accent}>
        <p>
          Construa um pipeline end-to-end que saia de um OLTP Postgres (sistema transacional de pedidos), propague mudanças confiavelmente via CDC + outbox, processe em tempo real com Kafka Streams e sirva dashboards analíticos em ClickHouse. Benchmarks publicáveis, EOS habilitado, observability real.
        </p>
      </Section>

      <Section title="Arquitetura alvo" accent={accent}>
        <CodeBlock lang="yaml">{`OLTP:
  Postgres 16 (orders, order_items, outbox)
  - schemas criados com migrations (Flyway/Atlas)
  - outbox table alimentada na mesma TX do write de negócio
CDC:
  Debezium 2.x (Kafka Connect cluster dedicado)
  - PostgresConnector + EventRouter SMT
  - heartbeat 10s, incremental snapshot
Streaming Platform:
  Kafka 3.7 em KRaft mode (3 brokers + 3 controllers)
  - topics: events.order, orders.enriched, orders.agg.5min
  - tiered storage habilitado para retention 30d
  - Schema Registry (Avro) com BACKWARD_TRANSITIVE
Processing:
  Kafka Streams app (Java 21)
  - EOS_V2 habilitado
  - join com KTable customers (enrichment)
  - tumbling windows 5min (grace 1min)
Sink:
  ClickHouse 24.x
  - Kafka engine + materialized view
  - tabela orders_analytics particionada por dia
Observability:
  - Prometheus + Grafana (metrics Kafka, consumer lag, streams state)
  - OpenTelemetry traces Debezium → Streams → ClickHouse
  - Alertas: consumer lag &gt; 1min, ISR &lt; 2, disk &gt; 80%`}</CodeBlock>
      </Section>

      <Section title="Esquema de domínio" accent={accent}>
        <CodeBlock lang="sql">{`CREATE TABLE orders (
  id            UUID PRIMARY KEY,
  user_id       UUID NOT NULL,
  total_cents   BIGINT NOT NULL,
  currency      TEXT NOT NULL,
  status        TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE outbox (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type  TEXT NOT NULL,
  aggregate_id    TEXT NOT NULL,
  event_type      TEXT NOT NULL,
  payload         JSONB NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);`}</CodeBlock>
      </Section>

      <Section title="ClickHouse sink" accent={accent}>
        <CodeBlock lang="sql">{`CREATE TABLE kafka_orders (
  order_id String, user_id String, region String, tier String,
  total_cents Int64, created_at DateTime64(3)
) ENGINE = Kafka
SETTINGS kafka_broker_list = 'b1:9092,b2:9092,b3:9092',
         kafka_topic_list  = 'orders.enriched',
         kafka_group_name  = 'ch-orders',
         kafka_format      = 'AvroConfluent';

CREATE TABLE orders_analytics (
  order_id String, user_id String, region LowCardinality(String),
  tier LowCardinality(String), total_cents Int64, created_at DateTime64(3)
) ENGINE = MergeTree
PARTITION BY toYYYYMMDD(created_at)
ORDER BY (region, created_at);

CREATE MATERIALIZED VIEW orders_mv TO orders_analytics
AS SELECT * FROM kafka_orders;`}</CodeBlock>
      </Section>

      <Section title="Entregáveis do capstone" accent={accent}>
        <CodeBlock lang="yaml">{`1. Repo monorepo:
   - /infra (docker-compose + terraform dev)
   - /oltp-service (Postgres migrations + API de pedidos)
   - /streams-app (Kafka Streams EOS)
   - /clickhouse (schemas + MVs)
   - /bench (k6 e kafka-producer-perf-test)

2. Benchmarks publicados:
   - throughput sustentado (events/s)
   - latência end-to-end p50/p95/p99 (OLTP commit → CH queryable)
   - custo simulado por 1M eventos (tiered storage on/off)

3. Failure injection documentada:
   - mata 1 broker: ISR recovery, lag
   - mata Debezium: resume from LSN
   - mata Streams instance: rebalance cooperative-sticky

4. ADRs:
   - outbox vs dual write
   - Avro vs Protobuf
   - Streams vs Flink
   - ClickHouse vs Druid vs Pinot

5. Writeup + dashboard Grafana público`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Esse capstone entregue com rigor diferencia engenheiro de dados/streaming em processos seletivos senior+. Recruiter lê o writeup, abre o dashboard, reproduz o benchmark com docker-compose e entende que você roda isso em produção de verdade.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
