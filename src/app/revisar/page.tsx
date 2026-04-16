import type { Metadata } from 'next';
import { ReviewClient } from '@/components/ReviewClient';

export const metadata: Metadata = {
  title: 'Revisar — FFV Academy',
  description: 'Revisão espaçada dos conceitos que você já aprendeu. Ciência do aprendizado aplicada: retenção de longo prazo com SRS (SM-2).',
};

export default function Page() {
  return <ReviewClient />;
}
