import type { Metadata } from 'next';
import { CertPrepClient } from '@/components/CertPrepClient';
import { BASE, social } from '@/lib/metadata-social';

export const metadata: Metadata = {
  // Análise das lacunas DO usuário, cruzando erro de simulado com módulo e fila
  // de revisão. Sem sessão não há nada para mostrar — fora do índice pelo mesmo
  // princípio de `/progresso`.
  robots: { index: false, follow: false },
  title: 'Prep para Certificações',
  description:
    'Identifique lacunas no seu preparo para certificações AWS e Kubernetes. Análise de domínios, módulos recomendados, plano semanal e integração com revisão espaçada.',
  keywords:
    'prep certificacao aws, clf-c02 preparacao, saa-c03 estudo, dva-c02 prep, cka kubernetes certificacao, lacunas estudo aws',
  alternates: { canonical: `${BASE}/certificacoes` },
  ...social({
    titulo: 'Prep para Certificações — FFV Academy',
    descricao:
      'Feche o loop entre erros no simulado, lacunas de módulo e revisão espaçada para certificações AWS e Kubernetes.',
    caminho: '/certificacoes',
  }),
};

export default function CertificacoesPage() {
  return <CertPrepClient />;
}
