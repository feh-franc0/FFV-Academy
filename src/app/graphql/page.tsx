import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail58')!;

export const metadata: Metadata = {
  title: 'GraphQL completo — FFV Academy',
  description:
    'GraphQL além do hype em PT-BR: schema design, resolvers sem N+1, DataLoader, Apollo server/client, subscriptions real-time, federation multi-time. Quando GraphQL bate REST e quando não.',
  keywords:
    'graphql completo, graphql schema design, dataloader n+1, apollo server client, graphql subscriptions, graphql federation apollo 2',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
