import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cdc-com-debezium');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Como Debezium captura changes em Postgres?',
    options: [
      'Triggers',
      'Lê logical replication slot (decoded WAL) — zero overhead na tabela (não trigger, não polling). Cada INSERT/UPDATE/DELETE vira event no Kafka. Assegura ordering + exactly-once com Kafka Connect',
      'Polling',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Debezium consome replication slot. Postgres: pgoutput plugin. MySQL: binlog. MongoDB: oplog. Decode em JSON/Avro, publica Kafka topic (um por tabela). Zero load na aplicação; Postgres já produz WAL pra replication — Debezium só lê. Muito melhor que trigger-based CDC.',
  },
  {
    question: 'Qual é o use case #1 de CDC?',
    options: [
      'Backup',
      'OLTP → OLAP pipeline — replicar transações de Postgres prod pra warehouse (BigQuery/Snowflake) em quase-real-time, sem rodar batch ETL pesado que trava prod',
      'Monitoring',
      'Random',
    ],
    correct: 1,
    explanation: 'ETL tradicional: SELECT * FROM orders WHERE updated_at > yesterday — pesado, carga em prod. CDC: Debezium puxa deltas in-stream, quase zero impact. Fluxo moderno: Postgres → Debezium → Kafka → Iceberg/warehouse. Também: outbox pattern, cache invalidation, audit log, search index sync.',
  },
  {
    question: 'O que são "tombstones" em CDC?',
    options: [
      'Campos null',
      'Eventos de DELETE em Kafka — payload { key: id, value: null }. Kafka compaction preserva último event por key; null sinaliza delete e limpa. Crítico pra downstream saber que row foi removida',
      'Deprecated',
      'Só em Kafka',
    ],
    correct: 1,
    explanation: 'Kafka log compaction: preserva apenas última version por chave. INSERT/UPDATE: value = row. DELETE: value = null (tombstone). Após retention, tombstone removido e key some. Downstream (warehouse sync) precisa entender tombstone = remover row lá. Sem isso, dados fantasmas.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cdc-com-debezium"
      title="CDC com Debezium: change data capture sério"
      icon="🔄"
      xp={55}
      readTime={13}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="kafka-fundamentos"
      nextTitle="Kafka fundamentos: partições, consumer groups, exactly-once"
      quiz={quiz}
    >
      <Section title="Setup Debezium + Postgres" accent={accent}>
        <CodeBlock lang="bash">{`# 1. Enable logical replication no Postgres
# postgresql.conf:
wal_level = logical
max_replication_slots = 4
max_wal_senders = 4

# 2. Create publication
CREATE PUBLICATION debezium_pub FOR ALL TABLES;

# 3. Criar replication slot (Debezium faz automático, ou manual)
SELECT pg_create_logical_replication_slot('debezium_slot', 'pgoutput');

# 4. Debezium config (Kafka Connect)
{
  "name": "pg-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "postgres",
    "database.dbname": "mydb",
    "plugin.name": "pgoutput",
    "slot.name": "debezium_slot",
    "publication.name": "debezium_pub",
    "topic.prefix": "pg-prod",
    "table.include.list": "public.orders,public.users"
  }
}`}</CodeBlock>
      </Section>

      <Section title="Event exemplo" accent={accent}>
        <CodeBlock lang="json">{`// Topic: pg-prod.public.orders
{
  "before": null,                      // INSERT (null) / UPDATE (pre) / DELETE (pre)
  "after": { "id": 1, "total": 100 },  // INSERT/UPDATE (post) / DELETE (null)
  "source": {
    "ts_ms": 1735689600000,
    "db": "mydb",
    "schema": "public",
    "table": "orders",
    "lsn": 123456789
  },
  "op": "c",                           // c=create, u=update, d=delete, r=read(snapshot)
  "ts_ms": 1735689600050
}`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Alternativas gerenciadas: AWS DMS (mais limitado), Fivetran (SaaS caro), Airbyte (open source, menos features que Debezium mas mais DX). Debezium é padrão-ouro pra auto-hosted serious.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
