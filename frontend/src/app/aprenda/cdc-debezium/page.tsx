import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, CodeBlock, KeyValue, FlowDiagram } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cdc-debezium');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  { question: 'CDC (Change Data Capture) significa:', options: ['Copiar tabela', 'Capturar mudanças (INSERT/UPDATE/DELETE) em tempo real de um banco source e stream para downstream (Kafka, data warehouse, search index). Reage a eventos sem polling', 'Backup', 'Schema migration'], correct: 1, explanation: 'CDC é a fundação de arquiteturas event-driven sobre bancos relacionais legados. Em vez de polling (caro, atrasado), você lê o log de transações (WAL no Postgres, binlog MySQL) e emite eventos para downstream.' },
  { question: 'Debezium usa qual mecanismo no Postgres?', options: ['Trigger', 'Logical decoding via plugin wal2json ou pgoutput — lê o WAL (Write-Ahead Log) e decodifica em events. Não precisa de trigger. Requer wal_level = logical no postgresql.conf', 'Polling', 'View'], correct: 1, explanation: 'Logical replication slot do Postgres é a mágica. Debezium se conecta como um réplica lógica e recebe events ordenados. Zero impacto perceptível no source database (a não ser pelo slot ocupando WAL).' },
  { question: 'MySQL CDC via Debezium usa:', options: ['Trigger', 'Binlog (row-based) — MySQL binlog em modo ROW (não STATEMENT). Debezium parse direto. Requer permissões REPLICATION SLAVE, REPLICATION CLIENT', 'Slow log', 'Audit table'], correct: 1, explanation: 'Binlog ROW captura cada row change individualmente — o que CDC precisa. STATEMENT mode (apenas SQL) não basta. Configure binlog_format = ROW no MySQL.' },
  { question: 'Outbox pattern resolve qual problema?', options: ['Lentidão', 'Dual-write — quando você precisa atualizar DB e publicar evento atomicamente. Sem outbox, transações em DB e mensageria não são atômicas (uma pode falhar, outra não). Outbox: escreva evento em tabela TX-local; Debezium CDC stream da outbox para Kafka. Atomicidade garantida via transação DB', 'Latência', 'Cache'], correct: 1, explanation: 'Outbox pattern (Chris Richardson, microservices.io) — INSERT na tabela de domínio + INSERT na outbox table na mesma transação. CDC stream da outbox → Kafka. Se TX falha, nem domínio nem evento. Atômico, sem 2PC distribuído.' },
  { question: 'Schema Registry serve para:', options: ['Backup', 'Versionar e validar schemas Avro/Protobuf/JSON Schema dos events em Kafka. Producer registra schema, consumer pega para deserializar. Garante compatibilidade backward/forward em evolução de schema', 'Logging', 'ACL'], correct: 1, explanation: 'Confluent Schema Registry (open-source variants: Karapace, Apicurio). Sem ele, consumer quebra quando producer evolui schema. Compatibility modes: BACKWARD (consumer com schema novo lê eventos velhos), FORWARD, FULL.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="cdc-debezium" title="CDC com Debezium: Postgres → Kafka em tempo real" icon="🔄" xp={75} readTime={15}
      trailName="Mensageria & Streaming" trailColor={accent} nextSlug="flink-stream-processing" nextTitle="Apache Flink stream processing" quiz={quiz}>
      <Section title="Por que CDC mudou data engineering" accent={accent}>
        <p className="text-sm leading-6">Antes: ETL batch noturno copiando tabelas. Latência: 24h. Depois do CDC: stream de mudanças real-time para Kafka, data warehouse, search index, cache, ML feature store. Latência: segundos. <b>Debezium</b> (Red Hat, agora projeto independente) é o padrão de fato para CDC em 2026.</p>
      </Section>
      <Section title="Como funciona no Postgres" accent={accent}>
        <FlowDiagram title="Pipeline CDC Debezium → Kafka" accent={accent} orientation="vertical" steps={[
          { icon: '✍️', label: 'App escreve no Postgres', desc: 'INSERT INTO orders ...' },
          { icon: '📝', label: 'Postgres registra no WAL', desc: 'Write-Ahead Log local' },
          { icon: '🔌', label: 'Debezium connector lê WAL', desc: 'Via logical replication slot' },
          { icon: '📨', label: 'Emite evento Kafka', desc: 'Topic dbserver1.public.orders' },
          { icon: '🎯', label: 'Downstream consumers', desc: 'Flink / search / DW / cache' },
        ]} />
      </Section>
      <Section title="Setup Postgres + Debezium" accent={accent}>
        <CodeBlock lang="ini">{`# postgresql.conf
wal_level = logical
max_wal_senders = 10
max_replication_slots = 10`}</CodeBlock>
        <CodeBlock lang="bash">{`# Criar role + permissões
CREATE ROLE debezium WITH LOGIN PASSWORD 'xxx' REPLICATION;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO debezium;
GRANT USAGE ON SCHEMA public TO debezium;
ALTER TABLE orders REPLICA IDENTITY FULL;`}</CodeBlock>
        <CodeBlock lang="json">{`// Debezium connector config (REST endpoint do Kafka Connect)
{
  "name": "orders-connector",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "tasks.max": "1",
    "database.hostname": "postgres",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "xxx",
    "database.dbname": "shop",
    "topic.prefix": "shop",
    "table.include.list": "public.orders,public.customers",
    "plugin.name": "pgoutput",
    "publication.autocreate.mode": "filtered"
  }
}`}</CodeBlock>
      </Section>
      <Section title="Evento CDC emitido" accent={accent}>
        <CodeBlock lang="json">{`{
  "schema": { /* Avro schema do payload */ },
  "payload": {
    "before": null,                          // null em INSERT
    "after": {                                // estado após mudança
      "id": 42,
      "customer_id": 100,
      "total": "199.90",
      "status": "PENDING",
      "created_at": "2026-05-23T14:30:00Z"
    },
    "source": {                               // metadata
      "version": "2.7.0.Final",
      "connector": "postgresql",
      "name": "shop",
      "ts_ms": 1716480000000,
      "snapshot": "false",
      "db": "shop",
      "schema": "public",
      "table": "orders",
      "lsn": 12345678
    },
    "op": "c",                                // c=create, u=update, d=delete, r=read (snapshot)
    "ts_ms": 1716480000100
  }
}`}</CodeBlock>
      </Section>
      <Section title="Outbox pattern" accent={accent}>
        <CodeBlock lang="sql">{`-- Tabela outbox
CREATE TABLE outbox (
  id UUID PRIMARY KEY,
  aggregate_type VARCHAR(50),
  aggregate_id VARCHAR(50),
  event_type VARCHAR(50),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- App: dentro da TX
BEGIN;
  UPDATE orders SET status = 'PAID' WHERE id = 42;
  INSERT INTO outbox (id, aggregate_type, aggregate_id, event_type, payload)
  VALUES (gen_random_uuid(), 'order', '42', 'OrderPaid', '{"orderId":42,"total":199.90}');
COMMIT;

-- Debezium configurado com Outbox SMT (Single Message Transformation)
-- transforma row da outbox em evento Kafka com routing correto`}</CodeBlock>
      </Section>
      <Section title="Pitfalls operacionais" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'WAL retention', v: 'Replication slot impede WAL recycling. Connector lento = WAL cresce → disco enche. Monitor com pg_replication_slots' },
          { k: 'Snapshot inicial', v: 'Primeira run lê tabela inteira. Tabela grande = horas. Use incremental snapshot mode em Debezium 2.x' },
          { k: 'Schema evolution', v: 'ALTER TABLE muda schema do evento. Configure Schema Registry para handle compatible' },
          { k: 'Re-snapshot', v: 'Connector reinicia do zero ocasionalmente. Tenha estratégia (drop topic? compactar?)' },
          { k: 'TOAST values', v: 'Columns muito grandes no Postgres podem virar TOAST. REPLICA IDENTITY FULL captura; senão default só PK + colunas alteradas' },
        ]} />
      </Section>
    </ModuleLayout>
  );
}
