import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('kafka-streams-ksqldb');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a distinção conceitual entre KStream e KTable?',
    options: [
      'Só nome diferente',
      'KStream é um log imutável de eventos (insert semantics); KTable é uma visão materializada com semântica de upsert por key, onde a última mensagem por key substitui a anterior. Mesma partition, mesma key, a topologia diferente muda o processamento',
      'KTable é mais rápido',
      'KStream só funciona com Avro',
    ],
    correct: 1,
    explanation: 'KStream: cada record é um fato independente (ex: click, transação). KTable: changelog de um estado (ex: saldo atual, perfil). Join stream-table busca o valor atual; join table-table mantém coerência. Escolher a abstração errada gera bug de agregação sutil.',
  },
  {
    question: 'Por que janelas (tumbling/hopping/session) exigem grace period?',
    options: [
      'Para economizar memória',
      'Porque eventos chegam fora de ordem em sistemas distribuídos. Grace period mantém a janela aberta por X tempo após fechar formalmente, aceitando late events. Sem grace, late data seria descartado silenciosamente e a agregação ficaria errada',
      'Só no Flink',
      'Não exigem',
    ],
    correct: 1,
    explanation: 'Event time != processing time. Grace period (ex: Duration.ofMinutes(5) após window close) permite que eventos atrasados por lag de rede/consumer ainda atualizem a janela correta. Trade-off: grace maior aumenta state store e latência do resultado final. Streams 2.1+ força decisão explícita.',
  },
  {
    question: 'Quando Kafka Streams é melhor escolha que Flink?',
    options: [
      'Nunca',
      'Quando você já tem Kafka e quer processar stream como library embutida na JVM da aplicação, sem cluster separado. Streams roda no mesmo process, escala por partition, sem Jobmanager/Taskmanager. Flink ganha em workloads mais pesadas (ML, joins complexos, SQL com CEP, exactly-once cross-system)',
      'Sempre, é mais rápido',
      'Só com ksqlDB',
    ],
    correct: 1,
    explanation: 'Streams brilha em microservice stream-processing: zero cluster, deploy como app comum, scaling linear por partition. Flink é plataforma de stream processing completa, mais poderosa mas com ops pesada. Regra: se cabe em library Streams, use Streams; se precisa de CEP avançado ou workloads compartilhados, vá de Flink.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="kafka-streams-ksqldb"
      title="Kafka Streams + ksqlDB"
      icon="🧮"
      xp={55}
      readTime={13}
      trailName="Event Streaming / Kafka Depth"
      trailColor={accent}
      nextSlug="capstone-kafka-pipeline-real"
      nextTitle="Capstone: pipeline Kafka real"
      quiz={quiz}
    >
      <Section title="Stream processing como library, não cluster" accent={accent}>
        <p>
          Kafka Streams é uma library Java/Scala que roda dentro do seu microserviço. Sem JobManager, sem cluster separado. Escala por partition do input topic: mais instâncias = mais tasks. State local com RocksDB, backed por changelog topic para recovery.
        </p>
      </Section>

      <Section title="Topologia típica: KStream + join + agregação por janela" accent={accent}>
        <CodeBlock lang="java">{`StreamsBuilder b = new StreamsBuilder();

KStream<String, OrderEvent> orders = b.stream("orders",
  Consumed.with(Serdes.String(), orderSerde));

KTable<String, Customer> customers = b.table("customers",
  Consumed.with(Serdes.String(), customerSerde));

KStream<String, EnrichedOrder> enriched = orders
  .join(customers,
        (order, customer) -> new EnrichedOrder(order, customer),
        Joined.with(Serdes.String(), orderSerde, customerSerde));

KTable<Windowed<String>, Long> ordersPer5min = enriched
  .groupBy((k, v) -> v.getCustomer().getRegion(),
           Grouped.with(Serdes.String(), enrichedSerde))
  .windowedBy(TimeWindows.ofSizeAndGrace(Duration.ofMinutes(5), Duration.ofMinutes(1)))
  .count(Materialized.as("orders-per-region-5min"));

ordersPer5min.toStream().to("orders.agg.5min",
  Produced.with(WindowedSerdes.timeWindowedSerdeFrom(String.class), Serdes.Long()));

KafkaStreams app = new KafkaStreams(b.build(), props);
app.start();`}</CodeBlock>
      </Section>

      <Section title="State store + interactive queries" accent={accent}>
        <p>
          Materialized.as cria um state store consultável de dentro da aplicação (interactive queries). Útil para expor agregações via HTTP sem ir até o broker.
        </p>
        <CodeBlock lang="java">{`ReadOnlyWindowStore<String, Long> store = app.store(
  StoreQueryParameters.fromNameAndType(
    "orders-per-region-5min",
    QueryableStoreTypes.windowStore()));

Instant from = Instant.now().minus(Duration.ofHours(1));
Instant to   = Instant.now();
try (WindowStoreIterator<Long> it = store.fetch("SP", from, to)) {
  while (it.hasNext()) {
    KeyValue<Long, Long> kv = it.next();
    log.info("window {} = {}", Instant.ofEpochMilli(kv.key), kv.value);
  }
}`}</CodeBlock>
      </Section>

      <Section title="ksqlDB: SQL sobre streams" accent={accent}>
        <CodeBlock lang="sql">{`CREATE STREAM orders (order_id STRING KEY, user_id STRING, total_cents BIGINT, ts BIGINT)
  WITH (KAFKA_TOPIC='orders', VALUE_FORMAT='AVRO', TIMESTAMP='ts');

CREATE TABLE customers (user_id STRING PRIMARY KEY, region STRING, tier STRING)
  WITH (KAFKA_TOPIC='customers', VALUE_FORMAT='AVRO');

CREATE STREAM enriched_orders AS
  SELECT o.order_id, o.user_id, c.region, c.tier, o.total_cents
  FROM orders o
  LEFT JOIN customers c ON o.user_id = c.user_id
  EMIT CHANGES;

CREATE TABLE revenue_5min AS
  SELECT region, WINDOWSTART AS window_start, SUM(total_cents) AS total
  FROM enriched_orders
  WINDOW TUMBLING (SIZE 5 MINUTES, GRACE PERIOD 1 MINUTE)
  GROUP BY region EMIT CHANGES;`}</CodeBlock>
        <Callout tone="info">
          ksqlDB é stream processing sem código Java. Ótimo para data engineers e exploração rápida; internamente gera topologias Kafka Streams.
        </Callout>
      </Section>

      <Section title="Streams vs Flink vs Spark Streaming" accent={accent}>
        <CodeBlock lang="yaml">{`Kafka Streams:
  - library JVM, roda no seu app
  - scaling por partition, zero cluster extra
  - EOS v2 nativo
Flink:
  - plataforma completa, JobManager/TaskManager
  - CEP (complex event processing), SQL rico
  - conectores amplos (S3, JDBC, Kinesis)
  - melhor para workloads pesadas e multi-tenant
Spark Streaming (Structured):
  - micro-batches, latência 100ms+
  - ótimo se já tem Spark para batch e quer unificar`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Default pragmático: Streams para microservices que já são owners do stream. Flink quando o pipeline é plataforma compartilhada. Spark quando analytics manda.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
