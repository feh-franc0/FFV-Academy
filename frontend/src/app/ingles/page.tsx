import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-ingles')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description:
    'Inglês para Brasileiros na Gringa: gramática essencial do zero ao intermediário, 1000 palavras mais usadas, 1000 frases prontas e 10 cenários do mundo real com 100 trocas cada — aeroporto, moradia, trabalho, médico, banco e mais.',
  alternates: { canonical: 'https://fernandofrancovalle.com/ingles' },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
