import type { Metadata } from 'next';
import { MapaClient } from './MapaClient';
import { BASE, social } from '@/lib/metadata-social';

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Grafo visual de todas as trilhas do FFV Academy com dependências e sugestões de caminho. Entenda a ordem recomendada por hub.';

export const metadata: Metadata = {
  title: 'Mapa de Trilhas',
  description: DESCRICAO_CARTAO,
  alternates: { canonical: `${BASE}/mapa` },
  ...social({ titulo: `Mapa de Trilhas — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/mapa' }),
};

export default function MapaPage() {
  return <MapaClient />;
}
