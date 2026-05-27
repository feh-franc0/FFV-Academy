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

export function ProfissionalBaseHome({ hub, heroHighlight: _heroHighlight }: ProfissionalBaseHomeProps) {
  const trails = getHubTrails(hub);
  const modulesCount = trails.reduce((acc, t) => acc + t.modules.length, 0);
  // Workload em horas — somatório de readTime (minutos) de cada módulo,
  // arredondado pra cima pra não cair em "0h" em bases pequenas.
  const workloadMin = trails.reduce(
    (acc, t) => acc + t.modules.reduce((s, m) => s + m.readTime, 0),
    0,
  );
  const workloadHours = Math.max(1, Math.round(workloadMin / 60));

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

  // Hubs no Explorar = cada TRILHA da base vira um cartão. Linkar pra
  // /<base-slug> (próprio hub) era self-link inútil — usuário clicava e
  // nada acontecia. Mostrando trilhas, o clique leva para a página da
  // trilha (ex.: /carreira-digital, /career-engineering, /technical-writing).
  //
  // Cuidado especial: se `trail.href === hub.href` (caso /ingles, onde a
  // única trilha usa o mesmo path da base), cair no fallback `/aprenda/<slug>`
  // pra não criar self-link.
  const hubsForExplore: HubCardData[] = trails.map((trail) => {
    const trailHref = trail.href && trail.href !== hub.href ? trail.href : null;
    const fallback = trail.modules[0] ? `/aprenda/${trail.modules[0].slug}` : hub.href;
    return {
      id: trail.id,
      name: trail.name,
      icon: trail.icon ?? hub.icon,
      color: trail.color ?? hub.color,
      tagline: trail.desc,
      href: trailHref ?? fallback,
      trailCount: 1,
      moduleCount: trail.modules.length,
    };
  });

  return (
    <KnowledgeBaseHome
      theme={theme}
      hero={{
        kicker: `${hub.name} · Base de conhecimento`,
        badgeText: `BASE DE ${hub.shortName.toUpperCase()} · NO AR`,
        // 2026-05-26: removido <span style={{ color, fontStyle: italic }}>
        // inline pra ficar consistente com tec/medvet/neuro (que usam título
        // simples). Cor do destaque ainda vem via accent do tema do hub.
        title: hub.tagline,
        description: hub.desc,
        // CTA secundário: aponta para o blog da PRIMEIRA trilha (em vez de
        // `hub.href` que é self-link na home da base). Pular o secundário
        // se a trilha não tem href OU se coincide com basePath (caso /ingles,
        // onde trail.href === hub.href — viraria self-link).
        ctas: firstModule
          ? trails[0]?.href && trails[0].href !== hub.href
            ? [
                { href: firstModuleHref, label: `Começar pelo módulo 01 →`, variant: 'primary' as const },
                { href: trails[0].href, label: `Ver todos os módulos de ${trails[0].name}`, variant: 'secondary' as const },
              ]
            : [{ href: firstModuleHref, label: `Começar pelo módulo 01 →`, variant: 'primary' as const }]
          : [{ href: '/explorar', label: 'Explorar todo o catálogo', variant: 'primary' as const }],
        // 2026-05-26: stats padronizados entre TODAS as 9 bases.
        // Formato unificado: módulos / trilhas / horas de estudo / custo.
        stats: [
          { value: `${modulesCount}`, label: modulesCount === 1 ? 'módulo' : 'módulos' },
          { value: `${trails.length}`, label: trails.length === 1 ? 'trilha' : 'trilhas' },
          { value: `${workloadHours}h`, label: 'estudo' },
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
      mapHref="/mapa"
      explorarHeading={`${trails.length} ${trails.length === 1 ? 'trilha' : 'trilhas'} · ${modulesCount} módulos`}
      explorarSubheading={
        trails.length === 1
          ? 'Trilha completa desta base — clique para abrir o blog com todos os módulos.'
          : 'Cada trilha cobre uma área dentro da base. Clique para ver o blog com todos os módulos.'
      }
      hideComunidade
      hasGamificationWidgets
      // finalCta removido — <FinalCta /> não renderiza mais (substituído por
      // <EndOfContextCta /> no rodapé do KnowledgeBaseHome).
    />
  );
}
