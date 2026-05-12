import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-streaming-messaging')!;

export const metadata: Metadata = {
  title: 'Mensageria & Streaming Avançado — FFV Academy',
  description:
    'Brokers e streams comparados a fundo: NATS vs Kafka, RabbitMQ profundo (quorum queues), AWS messaging stack (SQS/SNS/EventBridge), Apache Pulsar multi-tenant, queue patterns (DLQ, idempotency, ordering), CDC com Debezium, Apache Flink stream processing, exactly-once semantics.',
  keywords: 'nats vs kafka, rabbitmq quorum, sqs sns eventbridge, apache pulsar, dlq idempotency, debezium cdc, apache flink, exactly once',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
