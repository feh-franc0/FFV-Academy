import { VerificarClient } from './VerificarClient';

export const metadata = {
  title: 'Verificação de certificado — FFV Academy',
  description: 'Verifique a autenticidade de um certificado emitido pela FFV Academy.',
  robots: { index: true, follow: true },
};

export default function VerificarPage() {
  return <VerificarClient />;
}
