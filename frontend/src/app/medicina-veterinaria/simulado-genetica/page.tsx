import type { Metadata } from 'next';
import { SimuladoRunner } from '@/components/base/SimuladoRunner';
import { SIMULADO_GENETICA, SIMULADO_META } from '@/lib/bases/medvet/simulado-genetica';

export const metadata: Metadata = {
  title: 'Simulado de Genética Veterinária · 100 questões — FFV Academy',
  description:
    'Simulado completo de Genética Veterinária — 100 questões cobrindo Mendel, alelismo, genes letais, padrões de herança, Hardy-Weinberg, melhoramento e endogamia. Sem timer.',
  alternates: { canonical: 'https://fernandofrancovalle.com/medicina-veterinaria/simulado-genetica' },
};

export default function SimuladoGeneticaPage() {
  return (
    <SimuladoRunner
      slug="medvet-genetica-100"
      questions={SIMULADO_GENETICA}
      meta={SIMULADO_META}
      basePath="/medicina-veterinaria"
      baseName="Medicina Veterinária"
    />
  );
}
