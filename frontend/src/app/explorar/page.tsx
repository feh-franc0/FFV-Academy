import type { Metadata } from 'next';
import { ExplorarClient } from './ExplorarClient';
import { BASE, social } from '@/lib/metadata-social';

export const metadata: Metadata = {
  // Sem "FFV Academy": o template do layout raiz aplica o sufixo.
  title: 'Explorar — todos os módulos por trilha e nível',
  description:
    'Navegue por todos os módulos da FFV Academy. Filtre por trilha, dificuldade, tempo de leitura e XP. 490 módulos sobre IA na AWS, arquitetura de solução e engenharia de produção.',
  alternates: { canonical: `${BASE}/explorar` },
  ...social({
    titulo: 'Explorar — todos os módulos · FFV Academy',
    descricao: 'Filtre 490 módulos por trilha, dificuldade, tempo de leitura e XP.',
    caminho: '/explorar',
  }),
};

export default function ExplorarPage() {
  return <ExplorarClient />;
}
