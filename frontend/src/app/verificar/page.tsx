import type { Metadata } from 'next';
import { VerificarClient } from './VerificarClient';
import { BASE, social } from '@/lib/metadata-social';

const DESCRICAO_CARTAO =
  'Verifique a autenticidade de um certificado emitido pela FFV Academy.';

export const metadata: Metadata = {
  // Sem sufixo de marca: o template `'%s — FFV Academy'` do layout raiz o aplica.
  title: 'Verificação de certificado',
  description: DESCRICAO_CARTAO,
  robots: { index: true, follow: true },
  alternates: { canonical: `${BASE}/verificar` },
  ...social({
    titulo: 'Verificação de certificado — FFV Academy',
    descricao: DESCRICAO_CARTAO,
    caminho: '/verificar',
  }),
};

export default function VerificarPage() {
  return <VerificarClient />;
}
