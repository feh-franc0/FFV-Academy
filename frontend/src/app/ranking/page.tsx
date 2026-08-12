import type { Metadata } from 'next';
import { RankingClient } from './RankingClient';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Ranking dos profissionais que mais estudam na FFV Academy. Veja o pódio semanal, mensal, anual e geral. XP é ganho ao completar artigos, simulados e manter streak diário.';

export const metadata: Metadata = {
  title: 'Ranking',
  description: DESCRICAO_CARTAO,
  alternates: { canonical: `${BASE}/ranking` },
  ...social({ titulo: `Ranking — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/ranking' }),
};

export default function RankingPage() {
  return <RankingClient />;
}
