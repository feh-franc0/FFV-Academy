import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, CodeBlock, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('flink-stream-processing');

const accent = '#ef4444';

const quiz: QuizQuestion[] = [
  { question: 'Flink vs Spark Streaming:', options: ['Idênticos', 'Flink: true streaming (event-by-event), latência ms; Spark Streaming: micro-batch (mini batches a cada N ms, ainda mais lento). Para latência baixa, Flink ganha. Para batch + stream unificado, Spark Structured Streaming chegou perto', 'Spark sempre vence', 'Flink só batch'], correct: 1, explanation: 'Flink processa cada evento individualmente em pipeline DAG. Spark Streaming (RDD-based) faz micro-batches (typically 200-500ms). Spark Structured Streaming melhorou — continuous processing mode aproxima Flink mas com gaps. Para latency-critical, Flink continua referência.' },
  { question: 'Watermarks no Flink servem para:', options: ['Marca d\'água visual', 'Lidar com eventos out-of-order — marker que diz "todo evento com timestamp < W já chegou". Permite fechar windows de event-time corretamente mesmo com atraso na rede. Configurável: bounded lateness, periodic, punctuated', 'Logging', 'Audit'], correct: 1, explanation: 'Streams reais têm out-of-order events (network delay, retry). Watermark é a abstração que permite computar agregações por event-time confiáveis. Mal configurado = ou perde dados (watermark muito agressiva) ou trava (muito conservadora).' },
  { question: 'Event-time vs processing-time:', options: ['Iguais', 'Event-time: timestamp NO EVENTO (quando aconteceu na fonte). Processing-time: quando o Flink viu. Event-time é o correto para semântica de negócio (analytics, billing), tolera replay/atraso; processing-time é simples mas determinístico só com dados in-order', 'Apenas event-time existe', 'Apenas processing-time existe'], correct: 1, explanation: 'Esse é o conceito-chave. Janela "vendas por minuto" baseada em processing-time conta diferente de event-time. Negócio quase sempre precisa event-time. Flink suporta ambos; processing-time é fallback.' },
  { question: 'State backend RocksDB:', options: ['Apenas memory', 'Backend de state que armazena em SSD via RocksDB (LSM tree) — permite state GIGANTE (TB+) que não cabe na heap JVM. Trade-off: serialization overhead vs heap state (rápido mas limitado por RAM)', 'Não funciona', 'Para Spark apenas'], correct: 1, explanation: 'Flink stateful jobs (aggregations, joins) precisam state local. HeapStateBackend (rápido, limited by RAM); EmbeddedRocksDBStateBackend (em disco SSD, escala para TBs, serialization custo). Padrão produção: RocksDB.' },
  { question: 'Exactly-once em Flink:', options: ['Impossível', 'Garantido via two-phase commit em sinks transacionais (Kafka transactional producer, JDBC com 2PC), checkpoint coordination, e source rewind. End-to-end requer source idempotent + sink transactional', 'Sem garantias', 'Apenas at-most-once'], correct: 1, explanation: 'Flink Coordinator faz checkpoint distribuído (Chandy-Lamport algorithm). Em failure, restaura state + rewind source. Sinks transacionais (Kafka 0.11+, JDBC 2PC) garantem que outputs duplicados são abortados. Exactly-once efetivo.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="flink-stream-processing" title="Apache Flink: stream processing real (não micro-batch)" icon="🌊" xp={75} readTime={15}
      trailName="Mensageria & Streaming" trailColor={accent} nextSlug="exactly-once-semantics" nextTitle="Exactly-once semantics" quiz={quiz}>
      <Section title="Por que Flink existe" accent={accent}>
        <p className="text-sm leading-6">Spark Streaming foi a primeira tentativa séria de stream sobre batch infra. Funciona, mas micro-batches limitam latência. Flink (Apache, originado da TU Berlin + Stratosphere) foi desenhado <i>nativamente streaming</i>: event-by-event, stateful, exactly-once. Em 2026 é o padrão para casos sérios — Netflix Keystone, Uber AthenaX, Stripe, Alibaba.</p>
      </Section>
      <Section title="Os pilares" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'True streaming', v: 'Cada evento processado individualmente, latência ms' },
          { k: 'Stateful', v: 'Operators mantêm state local (RocksDB), permite joins, aggregations, sessions' },
          { k: 'Event-time semantics', v: 'Watermarks lidam com out-of-order' },
          { k: 'Exactly-once', v: '2PC + checkpoint distribuído' },
          { k: 'Sources & Sinks', v: 'Kafka, Kinesis, Pulsar, JDBC, Elasticsearch, S3, custom' },
          { k: 'APIs', v: 'DataStream (low-level), Table API + Flink SQL (declarativo)' },
        ]} />
      </Section>
      <Section title="Flink SQL — o jeito moderno" accent={accent}>
        <CodeBlock lang="sql">{`-- Source: Kafka topic com eventos JSON
CREATE TABLE orders (
  order_id STRING,
  customer_id STRING,
  total DECIMAL(10,2),
  event_time TIMESTAMP(3),
  WATERMARK FOR event_time AS event_time - INTERVAL '5' SECOND
) WITH (
  'connector' = 'kafka',
  'topic' = 'orders',
  'properties.bootstrap.servers' = 'kafka:9092',
  'format' = 'json'
);

-- Sink: Postgres aggregations
CREATE TABLE daily_revenue (
  day DATE,
  revenue DECIMAL(15,2),
  PRIMARY KEY (day) NOT ENFORCED
) WITH ('connector' = 'jdbc', 'url' = 'jdbc:postgresql://...');

-- Job: tumbling window de 1 dia
INSERT INTO daily_revenue
SELECT
  CAST(TUMBLE_START(event_time, INTERVAL '1' DAY) AS DATE) AS day,
  SUM(total) AS revenue
FROM orders
GROUP BY TUMBLE(event_time, INTERVAL '1' DAY);`}</CodeBlock>
      </Section>
      <Section title="Watermarks visualizado" accent={accent}>
        <CodeBlock lang="text">{`Tempo →
Eventos chegando:  [E1 t=10s] [E3 t=12s] [E2 t=11s] [E4 t=15s]
                                          ↑ out-of-order!

Watermark "minus 5s lateness":
T=10s:  W=5s   (não fecha nenhuma window ainda)
T=12s:  W=7s
T=15s:  W=10s  (window [0-10s) pode fechar — todo evento < 10s já chegou)

E1, E2, E3 cabem em [0-10s) e [10-20s) — placement por event-time correto.`}</CodeBlock>
      </Section>
      <Section title="Stateful — exemplo de sessão" accent={accent}>
        <CodeBlock lang="java">{`// Detectar sessions de usuário (inatividade > 30 min = nova sessão)
DataStream<Event> events = ...;

DataStream<SessionSummary> sessions = events
    .keyBy(Event::getUserId)
    .window(EventTimeSessionWindows.withGap(Time.minutes(30)))
    .aggregate(new SessionAggregator());

// SessionAggregator mantém state por usuário,
// emite quando 30min de silêncio passar`}</CodeBlock>
      </Section>
      <Section title="Operação em produção" accent={accent}>
        <ComparisonTable accent={accent} headers={['Aspecto', 'Recomendação']} rows={[
          ['Cluster mode', 'K8s operator (Flink Kubernetes Operator) ou EMR/Confluent Cloud'],
          ['Resource', 'TaskManager memory dimensionada para state local + buffer'],
          ['Checkpoints', 'Intervalo 30s-2min, storage em S3/GCS, exactly-once mode'],
          ['Savepoints', 'Antes de deploy/upgrade — permite cancelar e rerodar de ponto exato'],
          ['Backpressure', 'Monitor via Flink UI; lag em sources sinal de subdimensionamento'],
          ['Metrics', 'Prometheus + Grafana — record rate, watermark lag, checkpoint duration'],
        ]} />
      </Section>
      <Section title="Quando NÃO usar Flink" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Volume baixo', v: 'Kafka Streams (lib em vez de cluster) é mais simples' },
          { k: 'Batch puro', v: 'Spark / dbt continuam melhores; Flink batch existe mas não é forte' },
          { k: 'Time muito pequeno', v: 'Operar Flink em produção exige expertise. Considere Confluent Flink managed ou Aiven' },
          { k: 'Stateless transformação simples', v: 'Kafka Streams ou até kSQL pode bastar' },
        ]} />
      </Section>
    </ModuleLayout>
  );
}
