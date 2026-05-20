import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';
import { BaseStructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Tecnologia — Base completa gratuita · 157 módulos · IA, AWS, Engenharia',
  description:
    'Base de conhecimento completa de tecnologia: IA aplicada, AWS, engenharia de software, sistemas distribuídos, frontend, backend e dados. 157 módulos com teoria + quiz + revisão espaçada SM-2. Gamificação completa, gratuito em PT-BR. Trilha pronta gerada e curada pela FFV Academy.',
  keywords: [
    'curso de tecnologia gratuito',
    'curso de IA gratuito português',
    'aws cloud practitioner gratis',
    'aws solutions architect estudos',
    'engenharia de software trilha',
    'transformers atenção arquitetura',
    'RAG retrieval augmented generation curso',
    'sistemas distribuídos gratuito',
    'postgres internals MVCC',
    'curso programação português',
    'revisão espaçada anki SM-2',
    'gamificação estudo XP badges',
  ],
  alternates: { canonical: 'https://fernandofrancovalle.com/tecnologia' },
  openGraph: {
    title: 'Tecnologia — Base completa gratuita · 157 módulos · IA, AWS, Engenharia',
    description:
      'IA aplicada, AWS, engenharia de software, sistemas distribuídos. 157 módulos com revisão espaçada SM-2. Curadoria humana, gratuito em PT-BR.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/tecnologia',
    locale: 'pt_BR',
  },
};

// /tecnologia é a primeira "base de conhecimento" gerada pela plataforma.
// A home pública (/) é a landing de vendas do gerador; aqui dentro está a
// experiência completa de estudo — trilhas, módulos, ranking, gamificação —
// que cada base entrega ao estudante depois que a IA + curadoria a gera.
export default function TecnologiaPage() {
  return (
    <>
      <BaseStructuredData
        slug="tecnologia"
        name="Tecnologia — Engenharia para a era da IA"
        description="Base completa de tecnologia: IA, AWS, engenharia de software, sistemas distribuídos, dados, frontend e backend. 157 módulos com revisão espaçada SM-2 e gamificação."
        url="https://fernandofrancovalle.com/tecnologia"
        modules={157}
        workloadHours={200}
        teaches="Programação · IA · AWS · Engenharia de Software · Sistemas Distribuídos · Dados"
      />
      <HomeClient />
    </>
  );
}
