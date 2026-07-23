'use client';

/**
 * KnowledgeBaseHome — TEMPLATE UNIVERSAL para a home de qualquer base de
 * conhecimento (tecnologia, medicina-veterinaria, e futuras).
 *
 * Ver `UNIFICATION_PLAN.md` na raiz do monorepo para o desenho completo.
 *
 * Estrutura fixa (a ordem é a mesma em TODAS as bases — editar aqui altera
 * em todas):
 *   1.  Hero (com ou sem GameDemo)
 *   2.  OnboardingWizard               — só pra logado com onboarded=false
 *   3.  DailyQuestionCard              — só pra logado com onboarded=true + flag
 *   4.  PreferenciasCTA (banner)       — fallback quando wizard não cabe
 *   5.  SocialProofBar
 *   6.  HowItWorks
 *   7.  Continue/Daily/Trilha/Quest    — só pra usuário com progresso
 *   8.  ComecarAqui                    — paths (hidden quando hasProgress)
 *   9.  Explorar (hubs + playlists)
 *   10. Trending                       — opcional via prop
 *   11. HomeRanking                    — opcional via prop hideRanking
 *   12. ComunidadeAutor                — opcional via prop hideComunidade
 *   13. FinalCta
 *   14. StreakRepairModal (overlay)
 *
 * Quem decide aparecer ou não é o gate INTERNO do bloco, não o backend.
 * Bases sem gamificação passam `hasGamificationWidgets={false}` e tudo que
 * depende de state/auth/preferences é suprimido.
 *
 * O tema é aplicado via override de CSS vars (--ffv-*) num wrapper, então as
 * sections continuam usando os mesmos var() — só mudam os valores.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

import type { BaseTheme } from '@/lib/bases/theme';
import { Hero, type HeroProps } from '@/components/home/Hero';
import { SocialProofBar } from '@/components/home/SocialProofBar';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ComecarAqui, type ComecarPath } from '@/components/home/ComecarAqui';
import { Explorar, type HubCardData, type PlaylistCardData } from '@/components/home/Explorar';
import { Trending } from '@/components/home/Trending';
import { HomeRanking } from '@/components/home/HomeRanking';
import { ComunidadeAutor } from '@/components/home/ComunidadeAutor';
import { FinalCta } from '@/components/home/FinalCta';

import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { ContinueCard } from '@/components/ContinueCard';
import { DailyModuleCard } from '@/components/DailyModuleCard';
// TrilhaDoDia removida da estrutura padrão (2026-05-21) — não fazia sentido
// pedagógico atualmente. Componente preservado em src/components/TrilhaDoDia.tsx
// para uso futuro mas não é mais renderizado na home das bases.
import { QuestPanel } from '@/components/QuestPanel';
import { SignupCTA } from '@/components/auth/SignupCTA';
import { DailyQuestionCard } from '@/components/daily/DailyQuestionCard';
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard';
import { StreakRepairModal } from '@/components/streak/StreakRepairModal';
import {
  detectStreakBreak,
  markRepairModalSeen,
  repairStreak,
  REPAIR_COST_XP,
} from '@/lib/streak-repair';
import { toast } from '@/lib/toast';
import { playXPCoin } from '@/lib/sounds';

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
  /**
   * Habilita TODOS os widgets de gamificação (OnboardingWizard,
   * DailyQuestionCard, Continue/Daily/Trilha/Quest, Trending, StreakRepairModal).
   * Default true — base sem gamificação passa false.
   */
  hasGamificationWidgets?: boolean;
  /** Esconde a section Trending (mesmo com gamificação ligada). */
  hideTrending?: boolean;
  /** Esconde SocialProofBar. */
  hideSocialProof?: boolean;
  /** Esconde HowItWorks. */
  hideHowItWorks?: boolean;
  /** Steps personalizados do HowItWorks pra base (default = texto neutro). */
  howItWorksSteps?: Parameters<typeof HowItWorks>[0] extends { steps?: infer S } ? S : never;
  /** Override do título do HowItWorks. */
  howItWorksHeading?: string;
  /** Override do subtítulo do HowItWorks. */
  howItWorksSubheading?: string;
  /** Heading do bloco "Hoje no FFV" (continue/daily/trilha/quest). */
  todayHeading?: string;
  todayKicker?: string;
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
  hasGamificationWidgets = true,
  hideTrending = false,
  hideSocialProof = false,
  hideHowItWorks = false,
  howItWorksSteps,
  howItWorksHeading,
  howItWorksSubheading,
  todayHeading = 'Hoje no FFV',
  todayKicker = 'Continue de onde parou',
}: KnowledgeBaseHomeProps) {
  const { state, refresh } = useGameState();
  const { isLoggedIn } = useAuth();
  const { preferences, status: prefStatus, refresh: refreshPrefs } = usePreferences();

  const hasProgress = hasGamificationWidgets
    && state !== null
    && state.completedModules.length > 0;

  // Streak Repair — 1x por dia, se streak quebrou ontem e usuário pode pagar.
  const [repairModal, setRepairModal] = useState<{ open: boolean; streak: number }>({
    open: false,
    streak: 0,
  });
  useEffect(() => {
    if (!hasGamificationWidgets || !state) return;
    const status = detectStreakBreak(state.streak, state.xp);
    if (status.eligible) {
      setRepairModal({ open: true, streak: status.brokenStreak });
    }
  }, [hasGamificationWidgets, state]);

  function handleRepairConfirm() {
    const res = repairStreak();
    if (res.ok) {
      playXPCoin();
      toast.streak(res.restoredStreak);
      setRepairModal({ open: false, streak: 0 });
      refresh();
    } else {
      toast.info('Não foi possível salvar a streak. Tente novamente mais tarde.');
      setRepairModal({ open: false, streak: 0 });
    }
  }

  function handleRepairDismiss() {
    markRepairModalSeen();
    setRepairModal({ open: false, streak: 0 });
  }

  // OnboardingWizard, DailyQuestion e PreferenciasCTA — só fazem sentido quando
  // a base tem gamificação ligada (caso contrário, não há preferências de
  // estudo a configurar).
  const showOnboardingWizard =
    hasGamificationWidgets && isLoggedIn && prefStatus === 'ready' && preferences?.onboarded === false;
  const showDailyQuestion =
    hasGamificationWidgets
    && isLoggedIn
    && preferences?.onboarded === true
    && preferences?.dailyQuestionEnabled;
  const showPreferencesCTA =
    hasGamificationWidgets && isLoggedIn && prefStatus === 'ready' && preferences?.onboarded === false;

  return (
    <div style={themeToCssVars(theme)}>
      <Hero {...hero} />

      {afterHero}

      {showOnboardingWizard && (
        <OnboardingWizard
          onComplete={async () => {
            await refreshPrefs();
          }}
        />
      )}

      {showDailyQuestion && (
        <section className="px-6 pt-10" aria-labelledby="daily-question-heading">
          <div className="max-w-6xl mx-auto">
            <h2 id="daily-question-heading" className="sr-only">Pergunta do Dia</h2>
            <DailyQuestionCard />
          </div>
        </section>
      )}

      {showPreferencesCTA && !showOnboardingWizard && (
        <section className="px-6 pt-8" aria-label="Configure suas preferências">
          <div
            className="max-w-6xl mx-auto p-5 rounded-2xl flex items-center gap-4 flex-wrap"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="text-2xl">✨</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold mb-0.5">Personalize sua experiência</p>
              <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                Conte o que você quer estudar pra recomendarmos conteúdo certo
              </p>
            </div>
            <Link
              href="/preferencias-aprendizado/"
              className="text-xs font-semibold px-4 py-2 rounded-xl"
              style={{ background: '#f78166', color: '#0d1117' }}
            >
              Configurar →
            </Link>
          </div>
        </section>
      )}

      {!hideSocialProof && <SocialProofBar />}
      {!hideHowItWorks && (
        <HowItWorks
          steps={howItWorksSteps}
          heading={howItWorksHeading}
          subheading={howItWorksSubheading}
        />
      )}

      {hasProgress && (
        <section className="px-6 py-12" style={{ borderTop: '1px solid var(--ffv-border)' }}>
          <div className="max-w-6xl mx-auto">
            <p
              className="font-mono uppercase tracking-widest text-xs mb-3"
              style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
            >
              {todayKicker}
            </p>
            <h2
              style={{
                fontSize: 'clamp(1.4rem, 2.5vw, 1.8rem)',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                marginBottom: 24,
                lineHeight: 1.2,
              }}
            >
              {todayHeading}
            </h2>
            {/*
              Antes era grid md:grid-cols-2 — quando um dos cards retornava
              null (ex.: ContinueCard ausente porque o usuário nunca terminou
              nada DA BASE), sobrava um gap vazio à direita. Agora os cards
              empilham e cada um ocupa 100% da largura. Os componentes têm
              <section> interno com max-w-5xl mx-auto, então centralizam.
            */}
            <ContinueCard />
            <DailyModuleCard />
            <div className="mt-4">
              <QuestPanel />
            </div>
          </div>
        </section>
      )}

      <ComecarAqui
        hidden={hasProgress}
        paths={paths}
        heading={comecarHeading}
        subheading={comecarSubheading}
      />

      <Explorar
        hubs={hubs}
        playlists={playlists}
        mapHref={mapHref}
        heading={explorarHeading}
        subheading={explorarSubheading}
      />

      {hasGamificationWidgets && !hideTrending && <Trending />}

      {!hideRanking && <HomeRanking />}
      {!hideComunidade && <ComunidadeAutor />}

      {/* CTA destacado de signup — só aparece pra visitante anônimo.
          Tracking automático de cta.click + ligação direta com o fluxo
          existente do LoginModal (magic link por email). */}
      <section className="px-6 py-10">
        <div className="max-w-5xl mx-auto">
          <SignupCTA
            ctaId="kb-home-pre-final-cta"
            variant="hero"
            reason="acompanhar seu progresso e ganhar XP"
            subtitle="Email + nome + telefone. Você recebe um código por email pra entrar. Sem senha, sem fricção. 100% gratuito."
          />
        </div>
      </section>

      <FinalCta {...(finalCta ?? {})} />

      {hasGamificationWidgets && (
        <StreakRepairModal
          open={repairModal.open}
          streak={repairModal.streak}
          cost={REPAIR_COST_XP}
          currentXP={state?.xp ?? 0}
          onConfirm={handleRepairConfirm}
          onDismiss={handleRepairDismiss}
        />
      )}
    </div>
  );
}
