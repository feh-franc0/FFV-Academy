import type { Metadata } from 'next';
import { ExplorarClient } from './ExplorarClient';

export const metadata: Metadata = {
  title: 'Explorar — todos os artigos · FFV Academy',
  description:
    'Navegue por todos os módulos da FFV Academy. Filtre por trilha, dificuldade, tempo de leitura e XP. 600+ artigos sobre IA, AWS, engenharia e produtos digitais.',
  alternates: { canonical: 'https://fernandofrancovalle.com/explorar' },
};

export default function ExplorarPage() {
  return <ExplorarClient />;
}
