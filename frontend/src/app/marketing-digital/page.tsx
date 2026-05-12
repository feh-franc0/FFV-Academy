import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-marketing-digital')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description:
    'Marketing Digital para profissionais técnicos: personal branding, conteúdo de autoridade, SEO pessoal, email/newsletter e métricas que importam. 5 módulos com ferramentas e dados de 2026.',
  alternates: { canonical: 'https://fernandofrancovalle.com/marketing-digital' },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
