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

export const metadata: Metadata = {
  title: 'Medicina Veterinária — Base de conhecimento — FFV Academy',
  description:
    'Base de Medicina Veterinária com 12 módulos de Genética: leis de Mendel, alelismo múltiplo, genes letais, padrões de herança, Hardy-Weinberg, melhoramento genético e mais.',
  alternates: { canonical: 'https://fernandofrancovalle.com/medicina-veterinaria' },
};

const firstModule = MEDVET_BASE.trails[0]?.modules[0];
const firstModuleHref = firstModule ? `/medicina-veterinaria/${firstModule.slug}` : '/medicina-veterinaria';

export default function MedicinaVeterinariaPage() {
  return (
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
  );
}
