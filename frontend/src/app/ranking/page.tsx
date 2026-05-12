import type { Metadata } from 'next';
import { RankingClient } from './RankingClient';

export const metadata: Metadata = {
  title: 'Ranking — FFV Academy',
  description:
    'Ranking dos profissionais que mais estudam na FFV Academy. Veja o pódio semanal, mensal, anual e geral. XP é ganho ao completar artigos, simulados e manter streak diário.',
  alternates: { canonical: 'https://fernandofrancovalle.com/ranking' },
};

export default function RankingPage() {
  return <RankingClient />;
}
