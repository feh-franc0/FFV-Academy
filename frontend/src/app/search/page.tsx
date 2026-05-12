import type { Metadata } from 'next';
import { SearchClient } from './SearchClient';

export const metadata: Metadata = {
  title: 'Buscar — FFV Academy',
  description:
    'Busca instantânea em todos os 600+ artigos da FFV Academy. IA, AWS, engenharia, comunicação, carreira e produtos digitais.',
  alternates: { canonical: 'https://fernandofrancovalle.com/search' },
};

export default function SearchPage() {
  return <SearchClient />;
}
