'use client';

/**
 * HomeClient — nova estrutura (2026-05).
 *
 * Reduzimos de 16 para 8 seções para reduzir sobrecarga cognitiva e dar
 * narrativa clara ao visitante. Versão antiga preservada em
 * HomeClientLegacy.tsx caso precisemos voltar atrás.
 *
 * Sequência:
 *   1. Hero — outcome promise + CTA único + GameDemo animado
 *   2. SocialProofBar — count real do banco com fallback honesto
 *   3. HowItWorks — 3 steps explicando a gamificação
 *   4. ContinueDaily — só para quem já tem progresso (Continue + Daily)
 *   5. ComecarAqui — só para new visitors (caminhos diagnósticos)
 *   6. Explorar — Hubs + Playlists num bloco visual limpo
 *   7. HomeRanking — top 3 em pódio + lista (gamificação focal)
 *   8. ComunidadeAutor — autor + comunidade
 *   9. FinalCta — CTA final único
 *
 * AllPostsSection (570 cards) foi removida — link "Ver todos" leva a /explorar.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
// Índice leve, não o barril completo — só contamos módulos/trilhas aqui, e a
// home é a rota de maior tráfego do site. `CURRICULUM` traria os ~92 KB gz de
// `desc`/`keywords` de todo o currículo só para dois `.length`.
import { CURRICULO_LEVE } from '@/lib/curriculum/indice-leve';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import { ContinueCard } from '@/components/ContinueCard';
import { DailyModuleCard } from '@/components/DailyModuleCard';
import { TrilhaDoDia } from '@/components/TrilhaDoDia';
import { QuestPanel } from '@/components/QuestPanel';
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

import { Hero } from '@/components/home/Hero';
import { Reveal } from '@/components/home/Reveal';
import { SocialProofBar } from '@/components/home/SocialProofBar';
import { TopicMarquee } from '@/components/home/TopicMarquee';
import { HowItWorks } from '@/components/home/HowItWorks';
import { BedrockDestaque } from '@/components/home/BedrockDestaque';
import { LeadCaptureSection } from '@/components/home/LeadCaptureSection';
import { ComecarAqui } from '@/components/home/ComecarAqui';
import { Explorar } from '@/components/home/Explorar';
import { Trending } from '@/components/home/Trending';
import { HomeRanking } from '@/components/home/HomeRanking';
import { ComunidadeAutor } from '@/components/home/ComunidadeAutor';
import { FinalCta } from '@/components/home/FinalCta';

const TOTAL_ARTICLES = CURRICULO_LEVE.flatMap(t => t.modules).length;
const TOTAL_TRAILS = CURRICULO_LEVE.length;

export function HomeClient() {
  const { state, refresh } = useGameState();
  const { isLoggedIn } = useAuth();
  const { preferences, status: prefStatus, refresh: refreshPrefs } = usePreferences();
  const hasProgress = state !== null && state.completedModules.length > 0;

  // Streak Repair — 1x por dia, se streak quebrou ontem e usuário pode pagar
  const [repairModal, setRepairModal] = useState<{ open: boolean; streak: number }>({ open: false, streak: 0 });
  useEffect(() => {
    if (!state) return;
    const status = detectStreakBreak(state.streak, state.xp);
    if (status.eligible) {
      setRepairModal({ open: true, streak: status.brokenStreak });
    }
  }, [state]);

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
  // Card da Pergunta do Dia: SÓ pra usuário LOGADO com PREFERÊNCIAS configuradas.
  // Home pública (deslogado) é pura landing — sem gamificação no topo.
  // Logado mas sem onboarding completo → mostra CTA "Configure preferências"
  // (fallback discreto que não polui a home pra quem está sem o wizard ainda).
  const showOnboardingWizard = isLoggedIn && prefStatus === 'ready' && preferences?.onboarded === false;
  const showDailyQuestion = isLoggedIn && preferences?.onboarded === true && preferences?.dailyQuestionEnabled;
  const showPreferencesCTA = isLoggedIn && prefStatus === 'ready' && preferences?.onboarded === false;

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <Hero totalArticles={TOTAL_ARTICLES} totalTrails={TOTAL_TRAILS} />

      {showOnboardingWizard && (
        <OnboardingWizard
          onComplete={async () => {
            await refreshPrefs();
          }}
        />
      )}

      {showDailyQuestion && (
        <section
          className="px-6 pt-10"
          aria-labelledby="daily-question-heading"
        >
          <div className="max-w-6xl mx-auto">
            <h2 id="daily-question-heading" className="sr-only">Pergunta do Dia</h2>
            <DailyQuestionCard />
          </div>
        </section>
      )}

      {showPreferencesCTA && !showOnboardingWizard && (
        <section className="px-6 pt-8" aria-label="Configure suas preferências">
          <div className="max-w-6xl mx-auto p-5 rounded-2xl flex items-center gap-4 flex-wrap"
               style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
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
      <SocialProofBar />
      <TopicMarquee />
      <Reveal><HowItWorks /></Reveal>
      <Reveal><BedrockDestaque /></Reveal>
      <Reveal><LeadCaptureSection /></Reveal>

      {hasProgress && (
        <section
          className="px-6 py-12"
          style={{ borderTop: '1px solid var(--ffv-border)' }}
        >
          <div className="max-w-6xl mx-auto">
            <p
              className="font-mono uppercase tracking-widest text-xs mb-3"
              style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}
            >
              Continue de onde parou
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
              Hoje no FFV
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <ContinueCard />
              <DailyModuleCard />
            </div>
            <div className="mt-4">
              <TrilhaDoDia />
            </div>
            <div className="mt-4">
              <QuestPanel />
            </div>
          </div>
        </section>
      )}

      <Reveal><ComecarAqui hidden={hasProgress} /></Reveal>
      <Reveal><Explorar /></Reveal>
      <Reveal><Trending /></Reveal>
      <Reveal><HomeRanking /></Reveal>
      <Reveal><ComunidadeAutor /></Reveal>
      <Reveal><FinalCta /></Reveal>

      <StreakRepairModal
        open={repairModal.open}
        streak={repairModal.streak}
        cost={REPAIR_COST_XP}
        currentXP={state?.xp ?? 0}
        onConfirm={handleRepairConfirm}
        onDismiss={handleRepairDismiss}
      />
    </div>
  );
}
