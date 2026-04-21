import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cdc-debezium-avancado');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que CDC via binlog/WAL é preferível a polling SELECT em 2026?',
    options: [
      'Polling é mais simples',
      'Binlog/WAL captura toda mudança (INSERT, UPDATE, DELETE) em ordem, com latência de milissegundos e sem carga extra no DB. Polling perde DELETEs, perde updates intermediários, exige coluna updated_at confiável e gera scan constante na tabela',
      'Nenhuma diferença real',
      'Polling é transacional',
    ],
    correct: 1,
    explanation: 'Polling por updated_at perde DELETEs (linha some), perde updates rápidos entre pollings e gera load na tabela. Binlog (MySQL) ou WAL logical replication (Postgres) captura a ordem real de commits, incluindo deletes, com latência sub-segundo e overhead pequeno no DB. É o padrão correto desde Debezium 1.x.',
  },
  {
    question: 'O que é snapshot inicial no Debezium e por que importa?',
    options: [
      'Backup do disco',
      'Leitura consistente da tabela inteira antes de começar a streamar mudanças incrementais. Garante que o consumer tenha o estado completo atual; sem snapshot, só veria mudanças futuras e perderia linhas históricas',
      'Um ponto do binlog aleatório',
      'Só funciona em Mongo',
    ],
    correct: 1,
    explanation: 'Debezium inicia com snapshot: bloqueia posição do binlog/LSN, lê a tabela em SELECT consistente (ou paralelo em 2.x), emite cada linha como evento READ, depois segue o binlog a partir da posição capturada. Sem isso você só teria o delta futuro. Incremental snapshot (DBZ 1.6+) faz isso sem lock, por chunks.',
  },
  {
    question: 'Por que o problema de dual write (app escreve DB + publica Kafka manualmente) falha silenciosamente em produção?',
    options: [
      'É rápido demais',
      'Não há transação distribuída entre Postgres e Kafka: se o DB commit passa e o publish falha (ou vice-versa), o sistema fica inconsistente. Falha real em ~10% dos casos em volume alto (crashes, timeouts, GC pause). Solução é outbox pattern + CDC ou Debezium direto',
      'Kafka é lento',
      'Nunca falha',
    ],
    correct: 1,
    explanation: 'Dual write tem race inerente: crash entre write DB e publish Kafka deixa estado divergente. Soluções corretas: (a) outbox table escrita no mesmo commit do DB, Debezium lê outbox e publica; (b) event sourcing (DB é derivado). Publicar Kafka "depois" do commit é sempre bug latente.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cdc-debezium-avancado"
      title="CDC com Debezium avançado"
      icon="🔁"
      xp={55}
      readTime={13}
      trailName="Event Streaming / Kafka Depth"
      trailColor={accent}
      nextSlug="exactly-once-semantics"
      nextTitle="Exactly-once semantics"
      quiz={quiz}
    >
      <Section title="CDC: ler o log de transações, não a tabela" accent={accent}>
        <p>
          Change Data Capture lê o log interno do banco (MySQL binlog, Postgres WAL via logical replication, Mongo oplog, SQL Server CDC, Oracle LogMiner) para capturar toda mudança em ordem. Debezium é um conjunto de Kafka Connect source connectors que transforma esses logs em eventos Avro/JSON.
        </p>
        <Callout tone="warn">
          CDC não é "query com filtro updated_at". Polling perde DELETE, perde updates rápidos e sobrecarrega a tabela. Binlog/WAL é o único caminho correto em produção.
        </Callout>
      </Section>

      <Section title="Connector Postgres típico" accent={accent}>
        <CodeBlock lang="json">{`{
  "name": "orders-pg-source",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "database.hostname": "pg.internal",
    "database.port": "5432",
    "database.user": "debezium",
    "database.password": "\${file:/secrets/pg.pass}",
    "database.dbname": "orders",
    "plugin.name": "pgoutput",
    "slot.name": "debezium_orders",
    "publication.name": "dbz_pub",
    "topic.prefix": "pg.orders",
    "table.include.list": "public.orders,public.order_items,public.outbox",
    "snapshot.mode": "initial",
    "heartbeat.interval.ms": "10000",
    "tombstones.on.delete": "true",
    "key.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter": "io.confluent.connect.avro.AvroConverter",
    "value.converter.schema.registry.url": "http://registry:8081"
  }
}`}</CodeBlock>
        <Callout tone="info">
          Heartbeat é crítico em Postgres: sem movimento no WAL em tabelas watched, o slot não avança e o WAL enche o disco. Heartbeat força progresso periódico.
        </Callout>
      </Section>

      <Section title="Envelope de evento CDC" accent={accent}>
        <CodeBlock lang="json">{`{
  "op": "u",
  "ts_ms": 1713528000123,
  "source": {
    "db": "orders", "schema": "public", "table": "orders",
    "lsn": 281474976710899, "txId": 98123
  },
  "before": { "id": "o-42", "status": "PENDING", "totalCents": 12990 },
  "after":  { "id": "o-42", "status": "PAID",    "totalCents": 12990 }
}`}</CodeBlock>
        <p>
          op: c (create), u (update), d (delete), r (read do snapshot). before/after permitem reconstruir diff sem ambiguidade.
        </p>
      </Section>

      <Section title="Schema changes: não podem quebrar consumer" accent={accent}>
        <p>
          ALTER TABLE em produção propaga via binlog. Debezium emite evento de schema change; seu pipeline precisa de compatibility BACKWARD no registry e consumers tolerantes a campos novos. Drop column é o caso perigoso: trate como deprecation gradual (stop writes, wait retention, drop).
        </p>
      </Section>

      <Section title="Dual write é bug; outbox é a resposta" accent={accent}>
        <CodeBlock lang="sql">{`-- Na mesma transação do write de negócio
BEGIN;
UPDATE orders SET status = 'PAID' WHERE id = 'o-42';
INSERT INTO outbox (id, aggregate_type, aggregate_id, event_type, payload)
VALUES (gen_random_uuid(), 'order', 'o-42', 'OrderPaid',
        '{"orderId":"o-42","paidAt":"2026-04-19T12:00:00Z"}'::jsonb);
COMMIT;
-- Debezium lê outbox; SMT ExtractNewRecordState roteia para topic orders.events`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Essa é a base do próximo capítulo (outbox). Commit atômico no DB, Kafka recebe via CDC. Zero dual write, zero inconsistência silenciosa.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
