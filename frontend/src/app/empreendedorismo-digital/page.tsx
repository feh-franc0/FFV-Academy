import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-empreendedorismo-digital')!;

export const metadata: Metadata = {
  title: `${trail.name} — FFV Academy`,
  description:
    'Empreendedorismo Digital no Brasil: curso online, produtos digitais, freelance e clientes, side project e finanças do profissional digital. 5 módulos com plataformas reais (Hotmart, Kiwify, MEI).',
  alternates: { canonical: 'https://fernandofrancovalle.com/empreendedorismo-digital' },
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
