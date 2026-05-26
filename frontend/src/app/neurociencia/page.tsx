import type { Metadata } from 'next';
import { NEUROCIENCIA_BASE } from '@/lib/bases/neurociencia';
import { NEUROCIENCIA_THEME } from '@/lib/bases/neurociencia/theme';
import {
  NEUROCIENCIA_HUBS,
  NEUROCIENCIA_PATHS,
  NEUROCIENCIA_TOTAL_MODULES,
  NEUROCIENCIA_TOTAL_HUBS,
} from '@/lib/bases/neurociencia/adapters';
import { KnowledgeBaseHome } from '@/components/base/KnowledgeBaseHome';
import { BaseStructuredData } from '@/components/seo/StructuredData';
import { fetchBasePage } from '@/lib/bases-api';

export const metadata: Metadata = {
  title: 'Neurociência aplicada ao Marketing — 8 módulos gratuitos · FFV Academy',
  description:
    'Como o cérebro humano decide comprar — trilha completa de 8 módulos cobrindo cérebro triuno (MacLean), sistemas 1 e 2 de Kahneman, atenção, memória, dopamina, vieses de Cialdini, neuromarketing visual e neuropricing. Com exemplos do dia a dia, analogias lúdicas e exercícios. PT-BR, gratuito.',
  keywords: [
    'neurociência aplicada marketing',
    'neuromarketing curso gratuito',
    'kahneman sistema 1 sistema 2',
    'cialdini influência princípios',
    'dopamina marketing',
    'pain of paying',
    'eye-tracking neuromarketing',
    'charm pricing',
    'vieses cognitivos marketing',
    'puc neurociência marketing',
    'curso neurociência PT-BR',
  ],
  alternates: { canonical: 'https://fernandofrancovalle.com/neurociencia' },
  openGraph: {
    title: 'Neurociência aplicada ao Marketing — 8 módulos gratuitos',
    description:
      'Trilha completa de Neuromarketing: cérebro triuno, sistemas 1/2, atenção, memória, dopamina, vieses, design visual e pricing — com analogias lúdicas e exercícios. Gratuito em PT-BR.',
    type: 'website',
    url: 'https://fernandofrancovalle.com/neurociencia',
    locale: 'pt_BR',
  },
};

const firstModule = NEUROCIENCIA_BASE.trails[0]?.modules[0];
const firstModuleHref = firstModule ? `/neurociencia/${firstModule.slug}` : '/neurociencia';

// Mesmo padrão do /tecnologia e /medicina-veterinaria: tenta hidratar tema/flags
// do banco via fetchBasePage. Cai no NEUROCIENCIA_THEME estático se backend
// ainda não tem registro (caso normal antes da Fase 3 do plano DB-driven).
export default async function NeurocienciaPage() {
  const dto = await fetchBasePage('neurociencia');
  const theme = dto?.theme
    ? {
        ...NEUROCIENCIA_THEME,
        ...dto.theme,
        hubColors: dto.theme.hubColors as readonly string[],
      }
    : NEUROCIENCIA_THEME;
  return (
    <>
      <BaseStructuredData
        slug="neurociencia"
        name="Neurociência aplicada ao Marketing"
        description="Trilha completa de Neuromarketing — cérebro triuno, sistemas 1/2 de Kahneman, atenção, memória, dopamina, vieses, design visual e pricing. 8 módulos sequenciais com exemplos do dia a dia, analogias infantis e exercícios pra fixar."
        url="https://fernandofrancovalle.com/neurociencia"
        modules={NEUROCIENCIA_TOTAL_MODULES}
        workloadHours={3}
        teaches="Neurociência · Neuromarketing · Decisão de Compra · Sistema 1/2 · Cialdini · Pricing"
      />
      <KnowledgeBaseHome
        theme={theme}
        hero={{
          kicker: 'Neurociência · Base de conhecimento',
          badgeText: 'BASE DE NEUROCIÊNCIA · NO AR',
          title: (
            <>
              Como o cérebro humano decide comprar —{' '}
              <span style={{ color: 'var(--ffv-accent)' }}>com profundidade real, sem hype.</span>
            </>
          ),
          description: NEUROCIENCIA_BASE.description,
          ctas: [
            { href: firstModuleHref, label: 'Começar pelo módulo 01 →', variant: 'primary' },
            { href: '/neurociencia/simulado-neuromarketing', label: 'Simulado 100 questões', variant: 'secondary' },
          ],
          stats: [
            { value: `${NEUROCIENCIA_TOTAL_MODULES}`, label: 'módulos' },
            { value: '100', label: 'questões' },
            { value: `${NEUROCIENCIA_TOTAL_HUBS}`, label: 'hubs' },
            { value: 'R$ 0', label: 'custo' },
          ],
          showGameDemo: false,
        }}
        paths={NEUROCIENCIA_PATHS}
        comecarHeading="Por onde começar?"
        comecarSubheading="Quatro hubs temáticos — comece pelo que faz mais sentido pra você. Pode trocar a qualquer momento; todo o conteúdo fica disponível."
        hubs={NEUROCIENCIA_HUBS}
        playlists={[]}
        mapHref={firstModuleHref}
        explorarHeading={`${NEUROCIENCIA_TOTAL_HUBS} hubs temáticos, ${NEUROCIENCIA_TOTAL_MODULES} módulos sequenciais`}
        explorarSubheading="Hubs agrupam módulos da trilha de Neuromarketing por afinidade — atalho ideal quando você já sabe o tema que quer estudar."
        hideComunidade
        finalCta={{
          kicker: 'Não é sua área?',
          title: (
            <>
              Sua área pode ser a{' '}
              <span
                style={{
                  background: 'linear-gradient(90deg, #7c3aed, #ec4899)',
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
