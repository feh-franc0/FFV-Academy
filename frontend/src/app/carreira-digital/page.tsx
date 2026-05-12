import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-carreira-digital')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description:
    'Carreira Digital no Brasil em 2026: portfólio, vagas, trabalho remoto, freelance, crescimento júnior→sênior e entrevistas técnicas. 6 módulos com táticas validadas no mercado.',
  alternates: { canonical: 'https://fernandofrancovalle.com/carreira-digital' },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
