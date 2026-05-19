import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';

export const metadata: Metadata = {
  title: 'Tecnologia · Base de conhecimento — FFV Academy',
  description:
    'Base completa de tecnologia gerada pela FFV Academy: IA, AWS, engenharia de software, dados, frontend, backend, sistemas distribuídos. Trilhas, módulos, questões e revisão espaçada.',
  alternates: { canonical: 'https://fernandofrancovalle.com/tecnologia' },
};

// /tecnologia é a primeira "base de conhecimento" gerada pela plataforma.
// A home pública (/) é a landing de vendas do gerador; aqui dentro está a
// experiência completa de estudo — trilhas, módulos, ranking, gamificação —
// que cada base entrega ao estudante depois que a IA + curadoria a gera.
export default function TecnologiaPage() {
  return <HomeClient />;
}
