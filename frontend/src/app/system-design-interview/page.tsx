import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail52')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'System design interview em PT-BR: framework estruturado, back-of-envelope, cases canônicos (URL shortener, Twitter feed, rate limiter, chat, search, notification, cache) e templates de whiteboard. Nível sênior/staff.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/system-design-interview` },
  ...social({ titulo: `System Design Interview Prep — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/system-design-interview' }),
  title: 'System Design Interview Prep',
  description: DESCRICAO_CARTAO,
  keywords:
    'system design interview, sd framework, url shortener design, twitter timeline design, distributed cache, chat system design, staff engineer interview',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
