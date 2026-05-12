import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-comunicacao-humana')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description:
    'Comunicação Humana para profissionais digitais: falar em público, reuniões eficazes, storytelling, feedback, escuta ativa, networking e inteligência emocional. 7 módulos práticos com frameworks aplicáveis.',
  alternates: { canonical: 'https://fernandofrancovalle.com/comunicacao-humana' },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
