import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail62')!;

export const metadata: Metadata = {
  title: 'Event Streaming / Kafka Depth — FFV Academy',
  description:
    'Kafka sério 2026 em PT-BR: KRaft controller, schema registry (Avro/Protobuf), CDC com Debezium, exactly-once, outbox pattern, Kafka Streams + ksqlDB, alternativas (Redpanda, Pulsar).',
  keywords:
    'kafka producao, kraft kafka, schema registry avro protobuf, debezium cdc, exactly once semantics, outbox pattern, kafka streams ksqldb, redpanda pulsar',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
