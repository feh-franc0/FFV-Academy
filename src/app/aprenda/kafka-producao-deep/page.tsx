import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('kafka-producao-deep');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que o KRaft mode (Kafka 3.3+ GA, default 2024+) muda em relação ao Zookeeper legacy?',
    options: [
      'Só renomeia o binário',
      'Elimina o cluster Zookeeper: os próprios brokers elegem um controller quorum via Raft, reduzindo operação (um stack a menos), melhorando tempo de failover do controller e suportando clusters bem maiores (milhões de partitions)',
      'Força usar TLS sempre',
      'Remove o conceito de partition',
    ],
    correct: 1,
    explanation: 'KRaft (Kafka Raft) substitui o Zookeeper por um quorum Raft rodando nos próprios brokers (ou nodes dedicados controllers). Ganhos: operação (sem cluster ZK separado), metadata escalável (Zookeeper era gargalo a partir de ~200k partitions), controller failover em milissegundos. Desde 3.3 GA, default em 3.5+, Zookeeper removido em 4.0.',
  },
  {
    question: 'Producer com acks=all e enable.idempotence=true garante o quê?',
    options: [
      'Exactly-once end-to-end sem mais nada',
      'Que o record fica commitado em todas as réplicas do ISR antes do ack, e que retries do producer não geram duplicatas no mesmo producer session (sequence number por partition). Não é exactly-once end-to-end, é idempotent produce',
      'Latência menor',
      'Descarte automático de mensagens antigas',
    ],
    correct: 1,
    explanation: 'acks=all espera ISR (in-sync replicas) inteiro fsync. enable.idempotence=true faz o broker deduplicar por producer id + sequence number, eliminando duplicatas causadas por retries de rede. Isso protege produção, mas exactly-once consumer-side ainda exige transactions (read-process-write) ou consumer idempotente.',
  },
  {
    question: 'Tiered storage (KIP-405) resolve qual problema?',
    options: [
      'Criptografia em trânsito',
      'Storage caro: hot data fica em disco local rápido do broker, cold data (retention longa, TB+) é offloaded para S3/GCS. Permite retention de meses/anos sem explodir custo de SSD e reduz tempo de rebalance (menos dado no broker)',
      'Latência de producer',
      'Compression',
    ],
    correct: 1,
    explanation: 'Pré-tiered, retention longa forçava escolher: SSD caríssimo ou reduzir retention. Tiered storage mantém segments recentes locais (leitura quente rápida) e move segments antigos para object storage. Rebalance fica muito mais rápido porque o broker novo só replica a porção local. Confluent Cloud e Kafka 3.6+ já suportam.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="kafka-producao-deep"
      title="Kafka em produção: arquitetura profunda"
      icon="🌊"
      xp={55}
      readTime={13}
      trailName="Event Streaming / Kafka Depth"
      trailColor={accent}
      nextSlug="schema-registry-avro"
      nextTitle="Schema registry: Avro, Protobuf, JSON Schema"
      quiz={quiz}
    >
      <Section title="Anatomia de um cluster 2026" accent={accent}>
        <p>
          Um cluster Kafka moderno tem brokers (storage + serve), controller quorum (KRaft, substituindo Zookeeper) e clients (producers, consumers). Cada topic é particionado; cada partition tem um leader e N-1 followers. ISR (in-sync replicas) é o conjunto que está caught-up o suficiente para assumir como leader sem perda.
        </p>
        <Callout tone="info">
          Regra prática: replication.factor=3, min.insync.replicas=2, acks=all. Tolera 1 broker caído sem perder write. Menos que isso é aceitar perda de dado silenciosa em partition failure.
        </Callout>
      </Section>

      <Section title="KRaft: controller sem Zookeeper" accent={accent}>
        <p>
          Desde Kafka 3.3 GA, o controller roda um consenso Raft entre nodes dedicados (ou combined com brokers em dev). O metadata log vira um topic interno replicado. Resultado: menos um stack para operar, failover em milissegundos e escala para milhões de partitions.
        </p>
        <CodeBlock lang="bash">{`# Bootstrap KRaft cluster (controllers dedicados)
kafka-storage.sh format -t $(kafka-storage.sh random-uuid) \\
  -c config/kraft/controller.properties

# server.properties (broker)
process.roles=broker
node.id=1
controller.quorum.voters=100@ctrl1:9093,101@ctrl2:9093,102@ctrl3:9093
listeners=PLAINTEXT://:9092
inter.broker.listener.name=PLAINTEXT`}</CodeBlock>
      </Section>

      <Section title="Producer: idempotence, acks e batching" accent={accent}>
        <CodeBlock lang="java">{`Properties p = new Properties();
p.put("bootstrap.servers", "b1:9092,b2:9092,b3:9092");
p.put("key.serializer", "org.apache.kafka.common.serialization.StringSerializer");
p.put("value.serializer", "org.apache.kafka.common.serialization.StringSerializer");
p.put("acks", "all");
p.put("enable.idempotence", true);
p.put("max.in.flight.requests.per.connection", 5);
p.put("compression.type", "zstd");
p.put("linger.ms", 20);
p.put("batch.size", 65536);

try (KafkaProducer<String,String> prod = new KafkaProducer<>(p)) {
  prod.send(new ProducerRecord<>("orders", orderId, json), (meta, err) -> {
    if (err != null) log.error("send failed", err);
  });
}`}</CodeBlock>
        <Callout tone="warn">
          acks=1 (só leader) parece mais rápido mas perde dado se leader cair antes de replicar. Em 2026 com zstd+linger, a perda de throughput de acks=all é pequena e o risco de perda silenciosa não compensa.
        </Callout>
      </Section>

      <Section title="Consumer groups e rebalance" accent={accent}>
        <p>
          Consumer group distribui partitions entre N consumers. Qualquer join/leave dispara rebalance: stop-the-world que pausa consumo. Use cooperative-sticky assignor (default 3.0+) para rebalance incremental — só as partitions que trocam de dono param, o resto continua consumindo.
        </p>
        <CodeBlock lang="java">{`props.put("partition.assignment.strategy",
  "org.apache.kafka.clients.consumer.CooperativeStickyAssignor");
props.put("session.timeout.ms", 45000);
props.put("max.poll.interval.ms", 300000);
props.put("isolation.level", "read_committed");`}</CodeBlock>
      </Section>

      <Section title="Tiered storage: retention sem explodir custo" accent={accent}>
        <p>
          KIP-405 permite offload de segments antigos para S3/GCS. Hot data em NVMe local, cold data em object storage a 1/10 do custo. Rebalance fica ordens de magnitude mais rápido.
        </p>
        <CodeBlock lang="yaml">{`# Topic com tiered storage habilitado
remote.storage.enable: true
local.retention.ms: 86400000       # 1 dia local
retention.ms: 2592000000           # 30 dias total (29 em S3)
remote.log.storage.manager.class.name: org.apache.kafka.server.log.remote.storage.RemoteLogManager`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Para auditoria/compliance com retention de 1 ano+, tiered storage transforma Kafka em sistema viável economicamente. Antes exigia offload manual para data lake.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
