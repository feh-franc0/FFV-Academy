import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail65')!;

export const metadata: Metadata = {
  title: 'Career Engineering — FFV Academy',
  description:
    'Carreira tech como sistema em PT-BR: resume que converte, LinkedIn sem hype, behavioral interview (STAR + brag doc), negotiation, promo docs, portfolio técnico público. Baseado em Levels.fyi, Gergely Orosz, Haseeb.',
  keywords:
    'career engineering, resume tech, linkedin developer, behavioral interview star, negotiation salario engenheiro, promo doc, portfolio tecnico',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
