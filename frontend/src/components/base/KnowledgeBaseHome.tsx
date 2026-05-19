'use client';

/**
 * KnowledgeBaseHome — orquestrador único da página índice de uma base de
 * conhecimento. Compõe as MESMAS sections que /tecnologia usa, parametrizadas
 * via props. Outras bases (/medicina-veterinaria, /direito, ...) renderizam
 * este componente com seus próprios dados + tema.
 *
 * Estrutura (mesma em TODAS as bases — editar aqui = altera em todas):
 *   1. Hero (com ou sem GameDemo)
 *   2. SocialProofBar
 *   3. HowItWorks
 *   4. ComecarAqui (caminhos diagnósticos)
 *   5. Explorar (hubs + playlists)
 *   6. HomeRanking (global — ranking é único da plataforma)
 *   7. ComunidadeAutor
 *   8. FinalCta
 *
 * O tema é aplicado via override de CSS vars (--ffv-*) num wrapper, então as
 * sections continuam usando os mesmos var() — só mudam os valores.
 */

import type { BaseTheme } from '@/lib/bases/theme';
import { Hero, type HeroProps } from '@/components/home/Hero';
import { SocialProofBar } from '@/components/home/SocialProofBar';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ComecarAqui, type ComecarPath } from '@/components/home/ComecarAqui';
import { Explorar, type HubCardData, type PlaylistCardData } from '@/components/home/Explorar';
import { HomeRanking } from '@/components/home/HomeRanking';
import { ComunidadeAutor } from '@/components/home/ComunidadeAutor';
import { FinalCta } from '@/components/home/FinalCta';

interface KnowledgeBaseHomeProps {
  /** Tema da base — overrides de CSS vars aplicados num wrapper. */
  theme?: BaseTheme;
  /** Props do Hero. */
  hero: HeroProps;
  /** Hubs pro Explorar. Default: HUBS de tecnologia. */
  hubs?: HubCardData[];
  /** Playlists pro Explorar. Default: PLAYLISTS de tecnologia. */
  playlists?: PlaylistCardData[];
  /** Onde "Ver mapa completo" leva. Default: /mapa. */
  mapHref?: string;
  /** Override do título/subtítulo do Explorar. */
  explorarHeading?: string;
  explorarSubheading?: string;
  /** Caminhos pro ComecarAqui. Default: paths de tecnologia. */
  paths?: ComecarPath[];
  comecarHeading?: string;
  comecarSubheading?: string;
  /** Slot extra logo após o Hero (ex.: dashboard de gamificação da tech). */
  afterHero?: React.ReactNode;
  /** Props do FinalCta. */
  finalCta?: {
    kicker?: string;
    title?: React.ReactNode;
    description?: string;
    ctaHref?: string;
    ctaLabel?: string;
    footnote?: string;
  };
  /** Esconde sections que não fazem sentido pra uma base específica. */
  hideRanking?: boolean;
  hideComunidade?: boolean;
}

/**
 * Converte BaseTheme → CSS var overrides para o wrapper.
 * Sections existentes usam `var(--ffv-blue)`, `var(--ffv-bg2)`, etc. — então
 * sobrescrever esses vars no escopo da página inteira aplica o tema sem mexer
 * em nenhum estilo dentro das sections.
 */
function themeToCssVars(theme: BaseTheme | undefined): React.CSSProperties {
  if (!theme) return {};
  return {
    '--background': theme.paper,
    '--foreground': theme.ink,
    '--ffv-bg': theme.paper,
    '--ffv-bg2': theme.cream,
    '--ffv-border': theme.border,
    '--ffv-muted': theme.muted,
    '--ffv-blue': theme.accent,
    '--ffv-green': theme.success,
    '--ffv-hero-glow': `color-mix(in srgb, ${theme.accent} 10%, transparent)`,
  } as React.CSSProperties;
}

export function KnowledgeBaseHome({
  theme,
  hero,
  hubs,
  playlists,
  mapHref,
  explorarHeading,
  explorarSubheading,
  paths,
  comecarHeading,
  comecarSubheading,
  afterHero,
  finalCta,
  hideRanking = false,
  hideComunidade = false,
}: KnowledgeBaseHomeProps) {
  return (
    <div style={themeToCssVars(theme)}>
      <Hero {...hero} />
      {afterHero}
      <SocialProofBar />
      <HowItWorks />
      <ComecarAqui paths={paths} heading={comecarHeading} subheading={comecarSubheading} />
      <Explorar
        hubs={hubs}
        playlists={playlists}
        mapHref={mapHref}
        heading={explorarHeading}
        subheading={explorarSubheading}
      />
      {!hideRanking && <HomeRanking />}
      {!hideComunidade && <ComunidadeAutor />}
      <FinalCta {...(finalCta ?? {})} />
    </div>
  );
}
