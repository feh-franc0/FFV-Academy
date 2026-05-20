import type { Metadata } from 'next';
import { MEDVET_BASE } from '@/lib/bases/medvet';
import { MEDVET_THEME } from '@/lib/bases/medvet/theme';
import {
  MEDVET_HUBS,
  MEDVET_PATHS,
  MEDVET_TOTAL_MODULES,
  MEDVET_TOTAL_TRAILS,
  MEDVET_TOTAL_HUBS,
} from '@/lib/bases/medvet/adapters';
import { KnowledgeBaseHome } from '@/components/base/KnowledgeBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';

export const metadata: Metadata = {
  title: 'Medicina Veterinária — Genética Animal · 12 módulos gratuitos',
  description:
    'Trilha completa de Genética Veterinária: das Leis de Mendel ao melhoramento animal. 12 módulos sequenciais com teoria + 100 questões de simulado + revisão espaçada SM-2. Alelismo múltiplo, genes letais, padrões de herança, Hardy-Weinberg, endogamia e exogamia. Gratuito em PT-BR.',
  keywords: [
    'genética veterinária gratuito',
    'leis de mendel veterinária',
    'hardy weinberg genética animal',
    'melhoramento genético animal',
    'alelismo múltiplo gatos',
    'pelagem mamíferos genética',
    'endogamia exogamia veterinária',
    'simulado genética 100 questões',
    'curso veterinária online gratuito',
    'estudo veterinária PT-BR',
    'profa rafaella olivieri',
  ],
  alternates: { canonical: 'https://fernandofrancovalle.com/medicina-veterinaria' },
  openGraph: {
    title: 'Medicina Veterinária — Genética Animal · 12 módulos gratuitos',
    description:
      'Trilha completa de Genética: Mendel, alelismo, Hardy-Weinberg, melhoramento. 12 módulos + simulado de 100 questões + revisão espaçada. Gratuito.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/medicina-veterinaria',
    locale: 'pt_BR',
  },
};

const firstModule = MEDVET_BASE.trails[0]?.modules[0];
const firstModuleHref = firstModule ? `/medicina-veterinaria/${firstModule.slug}` : '/medicina-veterinaria';

export default function MedicinaVeterinariaPage() {
  return (
    <>
      <BaseStructuredData
        slug="medicina-veterinaria"
        name="Medicina Veterinária — Genética Animal"
        description="Trilha completa de Genética Veterinária: das Leis de Mendel ao melhoramento animal. 12 módulos sequenciais com teoria, exercícios, simulado de 100 questões e revisão espaçada SM-2."
        url="https://fernandofrancovalle.com/medicina-veterinaria"
        modules={MEDVET_TOTAL_MODULES}
        workloadHours={30}
        teaches="Genética Veterinária · Leis de Mendel · Hardy-Weinberg · Melhoramento Animal"
      />
      <KnowledgeBaseHome
      theme={MEDVET_THEME}
      hero={{
        kicker: 'Medicina Veterinária · Base de conhecimento',
        badgeText: 'BASE DE MEDICINA VETERINÁRIA · NO AR',
        title: (
          <>
            Aprenda Genética e Melhoramento Animal{' '}
            <span style={{ color: 'var(--ffv-blue)' }}>com profundidade real — não decoreba de prova.</span>
          </>
        ),
        description: MEDVET_BASE.description,
        ctas: [
          { href: firstModuleHref, label: 'Começar pelo módulo 01 →', variant: 'primary' },
          { href: '/medicina-veterinaria/simulado-genetica', label: 'Simulado 100 questões', variant: 'secondary' },
        ],
        stats: [
          { value: `${MEDVET_TOTAL_MODULES}`, label: 'módulos' },
          { value: `${MEDVET_TOTAL_TRAILS}`, label: 'trilha' },
          { value: `${MEDVET_TOTAL_HUBS}`, label: 'hubs' },
          { value: 'R$ 0', label: 'custo' },
        ],
        // GameDemo é só pra tecnologia (mostra questão de IA) — não cabe aqui
        showGameDemo: false,
      }}
      paths={MEDVET_PATHS}
      comecarHeading="Escolha o hub que faz sentido pra você"
      comecarSubheading="Cada hub agrupa módulos por tema. Você pode trocar a qualquer momento — todo o conteúdo fica disponível."
      hubs={MEDVET_HUBS}
      playlists={[]}
      mapHref={firstModuleHref}
      explorarHeading={`${MEDVET_TOTAL_HUBS} hubs temáticos, ${MEDVET_TOTAL_MODULES} módulos`}
      explorarSubheading="Hubs agrupam módulos da trilha de Genética por área de afinidade — atalho ideal quando você já sabe o tema que quer estudar."
      hideComunidade
      hideRanking={false}
      finalCta={{
        kicker: 'Não é sua área?',
        title: (
          <>
            Sua área pode ser a{' '}
            <span
              style={{
                background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-purple))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              próxima a entrar no ar.
            </span>
          </>
        ),
        description:
          'Em até 24 horas geramos a sua jornada — no mesmo padrão das bases existentes: trilhas, módulos, quiz e revisão espaçada.',
        ctaHref: '/#solicitar-base',
        ctaLabel: 'Criar minha base →',
        footnote: 'IA + curadoria humana · 100% gratuito na V1',
      }}
      />
    </>
  );
}
