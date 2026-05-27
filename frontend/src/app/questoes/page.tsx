import type { Metadata } from 'next';
import { QuestoesClient } from './QuestoesClient';

export const metadata: Metadata = {
  title: 'Questões — FFV Academy',
  description:
    'Banco de 100 questões por hub (fácil/médio/difícil) pra praticar além dos quizzes dos módulos. Cada questão com explicação completa — não decora, entende.',
  alternates: { canonical: 'https://fernandofrancovalle.com/questoes' },
};

export default function QuestoesPage() {
  return <QuestoesClient />;
}
