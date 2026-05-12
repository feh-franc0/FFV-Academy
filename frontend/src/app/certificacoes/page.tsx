import type { Metadata } from 'next';
import { CertPrepClient } from '@/components/CertPrepClient';

export const metadata: Metadata = {
  title: 'Prep para Certificações — FFV Academy',
  description:
    'Identifique lacunas no seu preparo para certificações AWS e Kubernetes. Análise de domínios, módulos recomendados, plano semanal e integração com revisão espaçada.',
  keywords:
    'prep certificacao aws, clf-c02 preparacao, saa-c03 estudo, dva-c02 prep, cka kubernetes certificacao, lacunas estudo aws',
  alternates: { canonical: 'https://fernandofrancovalle.com/certificacoes' },
  openGraph: {
    title: 'Prep para Certificações — FFV Academy',
    description:
      'Feche o loop entre erros no simulado, lacunas de módulo e revisão espaçada para certificações AWS e Kubernetes.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/certificacoes',
  },
};

export default function CertificacoesPage() {
  return <CertPrepClient />;
}
