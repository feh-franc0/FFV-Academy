import type { Metadata } from 'next';
import { SimuladoRunner } from '@/components/base/SimuladoRunner';
import {
  SIMULADO_NEUROMARKETING,
  SIMULADO_META,
} from '@/lib/bases/neurociencia/simulado-neuromarketing';

export const metadata: Metadata = {
  title: 'Simulado de Neuromarketing · 100 questões — FFV Academy',
  description:
    'Simulado completo de Neurociência aplicada ao Marketing — 100 questões cobrindo cérebro triuno, sistemas 1/2 de Kahneman, atenção, memória, dopamina, vieses de Cialdini, design visual e pricing. Sem timer.',
  alternates: {
    canonical: 'https://fernandofrancovalle.com/neurociencia/simulado-neuromarketing',
  },
};

export default function SimuladoNeuromarketingPage() {
  return (
    <SimuladoRunner
      slug="neurociencia-neuromarketing-100"
      questions={SIMULADO_NEUROMARKETING}
      meta={SIMULADO_META}
      basePath="/neurociencia"
      baseName="Neurociência"
    />
  );
}
