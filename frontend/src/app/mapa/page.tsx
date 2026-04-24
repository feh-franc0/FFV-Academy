import type { Metadata } from 'next';
import { MapaClient } from './MapaClient';

export const metadata: Metadata = {
  title: 'Mapa de Trilhas — FFV Academy',
  description:
    'Grafo visual de todas as trilhas do FFV Academy com dependências e sugestões de caminho. Entenda a ordem recomendada por hub.',
  alternates: { canonical: 'https://fernandofrancovalle.com/mapa' },
};

export default function MapaPage() {
  return <MapaClient />;
}
