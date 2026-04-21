import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail52')!;

export const metadata: Metadata = {
  title: 'System Design Interview Prep — FFV Academy',
  description:
    'System design interview em PT-BR: framework estruturado, back-of-envelope, cases canônicos (URL shortener, Twitter feed, rate limiter, chat, search, notification, cache) e templates de whiteboard. Nível sênior/staff.',
  keywords:
    'system design interview, sd framework, url shortener design, twitter timeline design, distributed cache, chat system design, staff engineer interview',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
