import type { Metadata } from 'next';
import { KnowledgeBaseHome } from '@/components/base/KnowledgeBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import {
  TECH_HUBS,
  TECH_PATHS,
  TECH_PLAYLISTS,
  TECH_TOTAL_HUBS,
  TECH_TOTAL_MODULES,
  TECH_TOTAL_TRAILS,
} from '@/lib/bases/tecnologia';
import { DEFAULT_THEME } from '@/lib/bases/theme';
import { fetchBasePage } from '@/lib/bases-api';

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

// Tema da Tecnologia — navy + cream + amber. Espelha o backend bases_handler
// e o registry.ts. Usado como FALLBACK estático quando o endpoint
// /api/v1/bases/tecnologia/page falha (backend offline, build sem API, etc.).
const TECH_THEME_FALLBACK = {
  ...DEFAULT_THEME,
  accent: '#1e3a8a',
  accentLight: '#3b82f6',
} as const;

// /tecnologia é a primeira "base de conhecimento" gerada pela plataforma.
// A home pública (/) é a landing de vendas do gerador; aqui dentro está a
// experiência completa de estudo — trilhas, módulos, ranking, gamificação —
// que cada base entrega ao estudante depois que a IA + curadoria a gera.
//
// Esta página renderiza o TEMPLATE UNIVERSAL `KnowledgeBaseHome`, o mesmo
// que /medicina-veterinaria usa — só mudam os dados (paths/hubs/playlists)
// e as cores (theme). Ver UNIFICATION_PLAN.md.
//
// Estratégia de dados: tenta `fetchBasePage('tecnologia')` no SSR; se o
// backend responde, usa o tema/flags do banco; se falha, cai no fallback
// estático (preserva SSR resiliente — testes Playwright sem API, build no
// CI sem rede, etc.).
export default async function TecnologiaPage() {
  const dto = await fetchBasePage('tecnologia');

  const theme = dto?.theme
    ? { ...TECH_THEME_FALLBACK, ...dto.theme, hubColors: dto.theme.hubColors as [string, string, string, string] }
    : TECH_THEME_FALLBACK;

  return (
    <>
      <BaseStructuredData
        slug="tecnologia"
        name="Tecnologia — Engenharia para a era da IA"
        description="Base completa de tecnologia: IA, AWS, engenharia de software, sistemas distribuídos, dados, frontend e backend. 157 módulos com revisão espaçada SM-2 e gamificação."
        url="https://fernandofrancovalle.com/tecnologia"
        modules={TECH_TOTAL_MODULES}
        workloadHours={200}
        teaches="Programação · IA · AWS · Engenharia de Software · Sistemas Distribuídos · Dados"
      />
      <KnowledgeBaseHome
        theme={theme}
        hero={{
          // Stats reais do CURRICULUM — fonte de verdade do conteúdo de tech
          // continua sendo o TS (Fase 4 futura: mover pra Postgres).
          totalArticles: TECH_TOTAL_MODULES,
          totalTrails: TECH_TOTAL_TRAILS,
          stats: [
            { value: `${TECH_TOTAL_MODULES}+`, label: 'módulos' },
            { value: `${TECH_TOTAL_TRAILS}`, label: 'trilhas' },
            { value: `${TECH_TOTAL_HUBS}`, label: 'hubs' },
            { value: 'R$ 0', label: 'custo' },
          ],
          // GameDemo (MÓDULO ATUAL card) removido em 2026-05-26 — poluição
          // visual sem valor pedagógico claro.
          showGameDemo: false,
        }}
        paths={TECH_PATHS}
        hubs={TECH_HUBS}
        playlists={TECH_PLAYLISTS}
        mapHref="/mapa"
        hideComunidade={dto?.flags.hideComunidade ?? false}
        hasGamificationWidgets
      />
    </>
  );
}
