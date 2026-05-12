import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-criacao-conteudo')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description:
    'Criação de Conteúdo para profissionais técnicos: setup de gravação, edição de vídeo, tutorial técnico, LinkedIn criador, YouTube e design básico (Canva/Figma). 6 módulos práticos com ferramentas reais.',
  alternates: { canonical: 'https://fernandofrancovalle.com/criacao-conteudo' },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
