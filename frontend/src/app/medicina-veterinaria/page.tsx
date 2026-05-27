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
import { fetchBasePage } from '@/lib/bases-api';

export const metadata: Metadata = {
  title: 'Medicina Veterinária — Genética & Melhoramento · 16 módulos gratuitos',
  description:
    'Duas trilhas completas: Genética Veterinária (12 módulos) e Métodos de Seleção & Testes (4 módulos). Das Leis de Mendel ao melhoramento animal, com cálculos de CPP, CPT, Pedigree e Progênie. 16 módulos sequenciais + 100 questões de simulado + revisão espaçada SM-2. Alelismo múltiplo, genes letais, padrões de herança, Hardy-Weinberg, endogamia, exogamia. Gratuito em PT-BR.',
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
    title: 'Medicina Veterinária — Genética & Melhoramento · 16 módulos gratuitos',
    description:
      'Duas trilhas de Genética Veterinária + Métodos de Seleção: Mendel, Hardy-Weinberg, CPP, CPT, Pedigree, Progênie. 16 módulos + simulado de 100 questões + revisão espaçada. Gratuito.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/medicina-veterinaria',
    locale: 'pt_BR',
  },
};

const firstModule = MEDVET_BASE.trails[0]?.modules[0];
const firstModuleHref = firstModule ? `/medicina-veterinaria/${firstModule.slug}` : '/medicina-veterinaria';

// Como /tecnologia: tenta GET /api/v1/bases/medicina-veterinaria/page para
// puxar tema/flags do banco; cai no MEDVET_THEME estático se falhar.
// Ver UNIFICATION_PLAN.md.
export default async function MedicinaVeterinariaPage() {
  const dto = await fetchBasePage('medicina-veterinaria');
  const theme = dto?.theme
    ? { ...MEDVET_THEME, ...dto.theme, hubColors: dto.theme.hubColors as [string, string, string, string] }
    : MEDVET_THEME;
  return (
    <>
      <BaseStructuredData
        slug="medicina-veterinaria"
        name="Medicina Veterinária — Genética Animal"
        description="Duas trilhas (Genética e Métodos de Seleção): das Leis de Mendel a CPP/CPT/Pedigree/Progênie. 16 módulos sequenciais com teoria, exercícios resolvidos, simulado de 100 questões e revisão espaçada SM-2."
        url="https://fernandofrancovalle.com/medicina-veterinaria"
        modules={MEDVET_TOTAL_MODULES}
        workloadHours={30}
        teaches="Genética Veterinária · Leis de Mendel · Hardy-Weinberg · Melhoramento Animal"
      />
      <KnowledgeBaseHome
      theme={theme}
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
        // Stats padronizados em TODAS as 9 bases (2026-05-26):
        // módulos / trilhas / horas de estudo / custo.
        stats: [
          { value: `${MEDVET_TOTAL_MODULES}`, label: 'módulos' },
          { value: `${MEDVET_TOTAL_TRAILS}`, label: MEDVET_TOTAL_TRAILS === 1 ? 'trilha' : 'trilhas' },
          { value: '24h', label: 'estudo' },
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
