/**
 * ProfissionalBaseHome — wrapper de KnowledgeBaseHome especializado para as
 * 6 bases do Profissional Digital (carreira, comunicação, marketing, conteúdo,
 * empreendedorismo, inglês).
 *
 * Por que existe: essas bases compartilham forma (1 hub, 1-2 trilhas) e
 * precisam ter a MESMA experiência visual de /tecnologia e /medicina-veterinaria
 * — hero épico, paths de início, stats. Antes dessa abstração, /ingles caía
 * direto em TrailBlogClient (sem hero) e as outras 5 caíam em HubPageClient
 * (também sem hero); usuários reclamavam que "não tem tela principal".
 *
 * Recebe o `hub` da curriculum.ts e o tema da base; deriva o resto.
 */
import { KnowledgeBaseHome } from '@/components/base/KnowledgeBaseHome';
import { DEFAULT_THEME } from '@/lib/bases/theme';
import type { Hub } from '@/lib/curriculum';
import { getHubTrails } from '@/lib/curriculum';
import type { ComecarPath } from '@/components/home/ComecarAqui';
import type { HubCardData } from '@/components/home/Explorar';

interface ProfissionalBaseHomeProps {
  hub: Hub;
  /** Subtítulo do hero — frase com destaque opcional (segundo ½). */
  heroHighlight?: string;
}

export function ProfissionalBaseHome({ hub, heroHighlight }: ProfissionalBaseHomeProps) {
  const trails = getHubTrails(hub);
  const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
  const xpTotal = trails.reduce(
    (acc, t) => acc + t.modules.reduce((s, m) => s + m.xp, 0),
    0,
  );

  // CTA primário: começar pelo primeiro módulo da primeira trilha (mais
  // ergonômico que mandar o usuário escolher trilha numa base que tem 1 ou 2).
  const firstModule = trails[0]?.modules[0];
  const firstModuleHref = firstModule ? `/aprenda/${firstModule.slug}` : hub.href;

  // Tema com accent/accentLight da paleta do hub. hubColors uniformes — bases
  // de 1 hub não precisam de paleta multi-cor.
  const theme = {
    ...DEFAULT_THEME,
    accent: hub.color,
    accentLight: hub.color,
    hubColors: [hub.color, hub.color, hub.color, hub.color] as [string, string, string, string],
  };

  // Paths = cada trilha vira um cartão de "começar aqui". Para uma base com
  // 1 só trilha, fica um cartão só (centralizado). Para 2 trilhas, 2 cartões
  // lado a lado.
  const paths: ComecarPath[] = trails.map((trail) => {
    const first = trail.modules[0];
    return {
      icon: trail.icon ?? '📚',
      title: trail.name,
      desc: trail.desc,
      href: first ? `/aprenda/${first.slug}` : trail.href ?? hub.href,
      cta: `Começar ${trail.name}`,
      color: hub.color,
    };
  });

  // Hubs no Explorar = mostra o próprio hub como 1 cartão. Isso dá ao usuário
  // um atalho visual com cor/ícone da base. Não tem cross-sell entre bases.
  const hubsForExplore: HubCardData[] = [
    {
      id: hub.id,
      name: hub.name,
      icon: hub.icon,
      color: hub.color,
      tagline: hub.tagline,
      href: hub.href,
      trailCount: trails.length,
      moduleCount: modulesCount,
    },
  ];

  return (
    <KnowledgeBaseHome
      theme={theme}
      hero={{
        kicker: `${hub.name} · Base de conhecimento`,
        badgeText: `BASE DE ${hub.shortName.toUpperCase()} · NO AR`,
        title: heroHighlight ? (
          <>
            {hub.tagline.split(heroHighlight)[0]}
            <span style={{ color: hub.color }}>{heroHighlight}</span>
            {hub.tagline.split(heroHighlight)[1] ?? ''}
          </>
        ) : (
          hub.tagline
        ),
        description: hub.desc,
        ctas: firstModule
          ? [
              { href: firstModuleHref, label: `Começar pelo módulo 01 →`, variant: 'primary' as const },
              { href: hub.href, label: 'Ver todos os módulos', variant: 'secondary' as const },
            ]
          : [{ href: hub.href, label: 'Explorar', variant: 'primary' as const }],
        stats: [
          { value: `${modulesCount}`, label: modulesCount === 1 ? 'módulo' : 'módulos' },
          { value: `${trails.length}`, label: trails.length === 1 ? 'trilha' : 'trilhas' },
          { value: `${xpTotal}`, label: 'XP' },
          { value: 'R$ 0', label: 'custo' },
        ],
        showGameDemo: false,
      }}
      paths={paths}
      comecarHeading={trails.length > 1 ? 'Escolha por onde começar' : 'Comece aqui'}
      comecarSubheading={
        trails.length > 1
          ? 'Cada trilha cobre um pilar da base. Você pode percorrer na ordem ou pular para o que faz mais sentido.'
          : 'Trilha sequencial: cada módulo constrói sobre o anterior.'
      }
      hubs={hubsForExplore}
      playlists={[]}
      mapHref={hub.href}
      explorarHeading={`${trails.length} ${trails.length === 1 ? 'trilha' : 'trilhas'} · ${modulesCount} módulos`}
      explorarSubheading="Conteúdo completo desta base."
      hideRanking={false}
      hideComunidade
      hasGamificationWidgets
      finalCta={{
        kicker: 'Sua área não é essa?',
        title: (
          <>
            Sua área pode ser a{' '}
            <span style={{ color: hub.color, fontStyle: 'italic' }}>próxima a entrar no ar.</span>
          </>
        ),
        description:
          'Em até 24 horas geramos a sua jornada — mesmo padrão das bases existentes: trilhas, módulos, quiz e revisão espaçada.',
        ctaHref: '/#solicitar-base',
        ctaLabel: 'Criar minha base →',
        footnote: 'IA + curadoria humana · 100% gratuito na V1',
      }}
    />
  );
}
