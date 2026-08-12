import type { Metadata } from 'next';
import { ReviewClient } from '@/components/ReviewClient';

export const metadata: Metadata = {
  // sessão de revisão pessoal — fora do índice de propósito.
  robots: { index: false, follow: false },
  title: 'Revisar',
  description: 'Revisão espaçada dos conceitos que você já aprendeu. Ciência do aprendizado aplicada: retenção de longo prazo com SRS (SM-2).',
};

export default function Page() {
  return <ReviewClient />;
}
