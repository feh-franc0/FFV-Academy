import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail37')!;

export const metadata: Metadata = {
  title: 'Edge Computing & Workers — FFV Academy',
  description:
    'Edge de verdade em PT-BR: Cloudflare Workers, Durable Objects, D1, KV, R2, streaming em edge, WebSocket no edge e quando usar edge vs origin. Latência baixa, modelo de execução V8 isolates e custos reais em produção.',
  keywords:
    'edge computing, cloudflare workers, durable objects, d1 database, kv store, r2 storage, v8 isolates, edge vs origin, workers production',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
