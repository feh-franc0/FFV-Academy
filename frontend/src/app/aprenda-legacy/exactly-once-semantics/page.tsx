import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('exactly-once-semantics');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'Em Kafka, "exactly-once" aplica-se integralmente a qual cenário?',
    options: [
      'Qualquer side effect, inclusive chamar API externa',
      'Apenas ao pipeline read-process-write dentro do próprio Kafka: consumir de um topic, processar, publicar em outro topic e commitar offsets, tudo na mesma transação. Side effects externos (HTTP, email) seguem sendo at-least-once e exigem idempotência no destinatário',
      'Só em single-broker clusters',
      'Só com Flink',
    ],
    correct: 1,
    explanation: 'EOS do Kafka cobre: idempotent producer + transactions que atomicamente publicam records e commitam offsets de consumo. Isso dá exactly-once dentro do Kafka. Fora do Kafka (DB externo, HTTP, push notification) não há two-phase commit — você precisa tornar o receiver idempotente ou usar outbox + CDC.',
  },
  {
    question: 'O que transactional.id resolve no producer?',
    options: [
      'Nada, é só log',
      'Permite zumbi fencing: se um producer velho tentar publicar depois que uma nova instância assumiu o mesmo transactional.id, o broker rejeita com ProducerFenced. Isso evita que um processo que pausou em GC e "voltou à vida" corrompa a transação nova',
      'Criptografia de mensagem',
      'Compression',
    ],
    correct: 1,
    explanation: 'transactional.id é estável por instância lógica. initTransactions() incrementa o producer epoch; qualquer producer com epoch antigo é fenced. Resolve o problema clássico de split-brain após GC pause, sem isso dois producers "vivos" poderiam duplicar writes.',
  },
  {
    question: 'read_committed no consumer faz o quê?',
    options: [
      'Lê só a primeira mensagem',
      'O consumer ignora records de transações abortadas e só expõe records de transações commitadas, respeitando LSO (last stable offset). Sem isso, o consumer leria mensagens "sujas" que depois foram rollbackadas',
      'Força TLS',
      'Descarta duplicados automaticamente',
    ],
    correct: 1,
    explanation: 'Por default isolation.level=read_uncommitted, consumer vê tudo (inclusive de transações abortadas). read_committed espera a transação commitar antes de entregar, garantindo que processamento downstream só veja dados válidos. Pré-requisito em qualquer pipeline EOS.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="exactly-once-semantics"
      title="Exactly-once semantics"
      icon="1️⃣"
      xp={55}
      readTime={13}
      trailName="Event Streaming / Kafka Depth"
      trailColor={accent}
      nextSlug="outbox-pattern"
      nextTitle="Outbox pattern: write reliable"
      quiz={quiz}
    >
      <Section title="Três semânticas de entrega" accent={accent}>
        <CodeBlock lang="yaml">{`at-most-once: pode perder, nunca duplica (fire-and-forget)
at-least-once: nunca perde, pode duplicar (default prático)
exactly-once:  nunca perde, nunca duplica (dentro do Kafka, com EOS)`}</CodeBlock>
        <Callout tone="warn">
          Exactly-once end-to-end em sistema distribuído com side effects externos é impossível sem cooperação do destinatário. O que Kafka oferece é EOS dentro do próprio Kafka + idempotent producer.
        </Callout>
      </Section>

      <Section title="Idempotent producer: o primeiro pilar" accent={accent}>
        <p>
          enable.idempotence=true faz o broker atribuir producer id (PID) e sequence number por partition. Retry de rede não duplica porque o broker rejeita sequence repetido. Obrigatório para EOS e para evitar duplicata em cenário normal de retry.
        </p>
      </Section>

      <Section title="Transactions: read-process-write atômico" accent={accent}>
        <CodeBlock lang="java">{`props.put("transactional.id", "payments-processor-1");
props.put("enable.idempotence", true);
KafkaProducer<String,String> prod = new KafkaProducer<>(props);
prod.initTransactions();

consumer.subscribe(List.of("payments.raw"));
// isolation.level=read_committed no consumer
while (running) {
  ConsumerRecords<String,String> recs = consumer.poll(Duration.ofMillis(200));
  if (recs.isEmpty()) continue;

  prod.beginTransaction();
  try {
    for (ConsumerRecord<String,String> r : recs) {
      String out = transform(r.value());
      prod.send(new ProducerRecord<>("payments.enriched", r.key(), out));
    }
    Map<TopicPartition,OffsetAndMetadata> offsets = offsetsFrom(recs);
    prod.sendOffsetsToTransaction(offsets, consumer.groupMetadata());
    prod.commitTransaction();
  } catch (Exception e) {
    prod.abortTransaction();
  }
}`}</CodeBlock>
        <Callout tone="info">
          sendOffsetsToTransaction é o que fecha o ciclo: offsets de consumo vão para o mesmo transaction log dos writes. Commit atômico de ambos; nada pela metade.
        </Callout>
      </Section>

      <Section title="Kafka Streams: EOS por default" accent={accent}>
        <CodeBlock lang="java">{`Properties p = new Properties();
p.put(StreamsConfig.APPLICATION_ID_CONFIG, "fraud-scorer");
p.put(StreamsConfig.PROCESSING_GUARANTEE_CONFIG, StreamsConfig.EXACTLY_ONCE_V2);
// v2: 1 producer por thread, muito mais barato que v1 (1 por task)`}</CodeBlock>
      </Section>

      <Section title="Side effects externos: idempotência no receiver" accent={accent}>
        <p>
          Pipeline que chama API de pagamento, envia email ou grava em DB fora do Kafka não ganha EOS automático. O padrão correto é:
        </p>
        <CodeBlock lang="ts">{`// Deduplicação no consumer por (topic, partition, offset) ou event id
async function handle(event: PaymentEvent) {
  const exists = await db.query(
    'SELECT 1 FROM processed_events WHERE event_id = $1', [event.id]);
  if (exists.rowCount &gt; 0) return; // já processado, ignora

  await db.tx(async t =&gt; {
    await t.query('INSERT INTO processed_events(event_id) VALUES($1)', [event.id]);
    await t.query('UPDATE balances SET amount = amount + $1 WHERE user_id = $2',
                  [event.amountCents, event.userId]);
  });
}`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          EOS dentro do Kafka + idempotência no receiver externo = effectively-once end-to-end. É o máximo realista e é o que sistemas financeiros reais entregam.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
