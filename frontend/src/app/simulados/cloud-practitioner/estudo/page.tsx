import type { Metadata } from 'next';
import { EstudoClient } from '@/components/simulado/EstudoClient';

export const metadata: Metadata = {
  title: 'Estudo livre — AWS Cloud Practitioner | FFV Academy',
  description:
    'Modo de estudo livre para a certificação AWS Cloud Practitioner (CLF-C02). 335+ questões reais sorteadas do banco com distribuição oficial do blueprint, explicações ricas (por que está certo, por que cada distrator erra) e tutor IA para tirar dúvidas. Gratuito, sem timer.',
  alternates: { canonical: 'https://fernandofrancovalle.com/simulados/cloud-practitioner/estudo' },
  openGraph: {
    title: 'Estudo livre — AWS Cloud Practitioner',
    description: 'Treine para o CLF-C02 no seu ritmo: banco completo, explicações ricas e tutor IA.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/simulados/cloud-practitioner/estudo',
  },
};

export default function EstudoCloudPractitionerPage() {
  return <EstudoClient />;
}
