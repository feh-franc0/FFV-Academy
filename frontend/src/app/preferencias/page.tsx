import { PreferenciasClient } from './PreferenciasClient';

export const metadata = {
  title: 'Preferências',
  description: 'Gerencie seus dados, consentimentos e produtos pagos.',
  robots: { index: false, follow: false },
};

export default function PreferenciasPage() {
  return <PreferenciasClient />;
}
