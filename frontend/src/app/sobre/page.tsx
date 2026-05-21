import type { Metadata } from 'next';
import { SobreClient } from './SobreClient';

export const metadata: Metadata = {
  title: 'Sobre — FFV Academy',
  description:
    'Por que a FFV Academy existe: transformar conteúdo de estudo em uma jornada real e organizada — para qualquer área.',
  alternates: { canonical: 'https://fernandofrancovalle.com/sobre' },
};

// Server Component fino — só pra preservar metadata SEO/structured data.
// A página em si vive em SobreClient.tsx (motion premium: aurora, word-reveal,
// stagger cinema nos princípios, tilt 3D nos cards, shimmer no CTA final).
export default function SobrePage() {
  return <SobreClient />;
}
