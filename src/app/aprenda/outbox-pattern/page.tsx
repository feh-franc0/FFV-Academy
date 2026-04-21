import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('outbox-pattern');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a invariante central do outbox pattern?',
    options: [
      'Kafka é mais rápido',
      'O evento é escrito na mesma transação de DB que a mudança de estado. Commit atômico no DB garante que o evento existe se e somente se o estado mudou; um publisher separado (CDC ou poller) propaga para Kafka depois, com retries seguros',
      'Nunca usar transações',
      'Evento vem antes do DB',
    ],
    correct: 1,
    explanation: 'A transação do negócio e a escrita do evento são o mesmo commit. Sem race: ou ambos existem, ou nenhum. O publish para Kafka é eventual (Debezium lê outbox ou worker com SELECT FOR UPDATE SKIP LOCKED). Consumer fica idempotente para tolerar redelivery.',
  },
  {
    question: 'Por que SELECT FOR UPDATE SKIP LOCKED é útil no poller-based outbox?',
    options: [
      'É decoração',
      'Permite N workers pegarem batches de eventos paralelos sem bloquear uns aos outros: cada worker trava as linhas que vai processar e pula as já travadas por outros, escalando horizontalmente o publish sem duplicar',
      'Nada, é pior que LOCK TABLE',
      'Só funciona em MySQL',
    ],
    correct: 1,
    explanation: 'SKIP LOCKED (Postgres, MySQL 8+, Oracle) é o truque clássico para work queues em SQL. Worker A trava rows 1-100, worker B tenta e pula para 101-200. Sem SKIP LOCKED, o segundo worker bloquearia até o primeiro terminar, matando paralelismo.',
  },
  {
    question: 'Por que o consumer downstream precisa ser idempotente mesmo com outbox?',
    options: [
      'Não precisa',
      'Porque o publish para Kafka pode duplicar (at-least-once do publisher, retry após crash antes de commitar o delete da outbox). Idempotência no receiver via dedup por event_id ou upsert garante que duplicata não corrompe estado',
      'Só por performance',
      'Consumer não tem controle',
    ],
    correct: 1,
    explanation: 'Qualquer publisher de outbox é at-least-once: ele pode republicar o mesmo evento se crash entre publish e marcar row como enviada. Receiver idempotente (dedup table por event_id ou upserts naturais) é requisito inegociável do pattern.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="outbox-pattern"
      title="Outbox pattern: write reliable"
      icon="📤"
      xp={55}
      readTime={13}
      trailName="Event Streaming / Kafka Depth"
      trailColor={accent}
      nextSlug="kafka-streams-ksqldb"
      nextTitle="Kafka Streams + ksqlDB"
      quiz={quiz}
    >
      <Section title="O problema do dual write" accent={accent}>
        <p>
          Um serviço que faz UPDATE no DB e depois chama producer.send() para Kafka não é transacional: crash entre os dois, timeout de rede, GC pause, tudo gera estado divergente. Em volume alto você observa ~0,1%-10% de eventos faltando ou duplicados dependendo de failure mode. Outbox resolve transformando o publish em detalhe interno.
        </p>
      </Section>

      <Section title="Tabela outbox" accent={accent}>
        <CodeBlock lang="sql">{`CREATE TABLE outbox (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type  TEXT NOT NULL,   -- "order", "payment"
  aggregate_id    TEXT NOT NULL,   -- key de particionamento no Kafka
  event_type      TEXT NOT NULL,   -- "OrderPaid", "OrderCancelled"
  payload         JSONB NOT NULL,
  headers         JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX outbox_created_at_idx ON outbox(created_at);`}</CodeBlock>
      </Section>

      <Section title="Write atômico no serviço" accent={accent}>
        <CodeBlock lang="ts">{`await db.tx(async (t) =&gt; {
  await t.query(
    'UPDATE orders SET status=$1, paid_at=now() WHERE id=$2',
    ['PAID', orderId]);

  await t.query(
    \`INSERT INTO outbox (aggregate_type, aggregate_id, event_type, payload)
     VALUES ($1,$2,$3,$4)\`,
    ['order', orderId, 'OrderPaid', { orderId, paidAt: new Date().toISOString() }]);
});
// Se qualquer insert falhar, tudo rollback. Nada sai para Kafka sem o estado.`}</CodeBlock>
      </Section>

      <Section title="Publisher opção A: Debezium + SMT" accent={accent}>
        <CodeBlock lang="json">{`{
  "name": "outbox-router",
  "config": {
    "connector.class": "io.debezium.connector.postgresql.PostgresConnector",
    "table.include.list": "public.outbox",
    "transforms": "outbox",
    "transforms.outbox.type": "io.debezium.transforms.outbox.EventRouter",
    "transforms.outbox.route.by.field": "aggregate_type",
    "transforms.outbox.route.topic.replacement": "events.\${routedByValue}",
    "transforms.outbox.table.field.event.key": "aggregate_id",
    "transforms.outbox.table.field.event.payload": "payload"
  }
}`}</CodeBlock>
        <Callout tone="info">
          EventRouter SMT do Debezium foi desenhado exatamente para isso. Uma tabela outbox, N topics de destino roteados por aggregate_type. Zero código de publisher no seu serviço.
        </Callout>
      </Section>

      <Section title="Publisher opção B: worker SQL com SKIP LOCKED" accent={accent}>
        <CodeBlock lang="sql">{`-- Cada worker roda em loop
BEGIN;
WITH batch AS (
  SELECT id, aggregate_type, aggregate_id, event_type, payload
    FROM outbox
    ORDER BY created_at
    FOR UPDATE SKIP LOCKED
    LIMIT 200
)
DELETE FROM outbox WHERE id IN (SELECT id FROM batch)
RETURNING *;
-- worker publica o batch para Kafka
-- se publish falhar, ROLLBACK e o evento volta para a fila
COMMIT;`}</CodeBlock>
        <Callout tone="warn">
          Opção B é mais simples quando não dá para operar Debezium, mas exige cuidado com idempotência: um crash entre publish Kafka e COMMIT do DELETE re-publica. Receiver idempotente é obrigatório.
        </Callout>
      </Section>

      <Section title="Consumer idempotente do lado de lá" accent={accent}>
        <CodeBlock lang="sql">{`CREATE TABLE processed_events (
  event_id UUID PRIMARY KEY,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Ao processar: INSERT ... ON CONFLICT DO NOTHING
-- Se conflito, evento já foi processado, ignora lógica de negócio`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Outbox + CDC + consumer idempotente é o trinômio que entrega effectively-once end-to-end em sistemas heterogêneos (Postgres + Kafka + serviços externos).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
