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
import { CURRICULUM } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';
import { ContinueCard } from '@/components/ContinueCard';
import { DailyModuleCard } from '@/components/DailyModuleCard';
import { TrilhaDoDia } from '@/components/TrilhaDoDia';
import { DailyQuestionCard } from '@/components/daily/DailyQuestionCard';
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
import { SocialProofBar } from '@/components/home/SocialProofBar';
import { HowItWorks } from '@/components/home/HowItWorks';
import { ComecarAqui } from '@/components/home/ComecarAqui';
import { Explorar } from '@/components/home/Explorar';
import { Trending } from '@/components/home/Trending';
import { HomeRanking } from '@/components/home/HomeRanking';
import { ComunidadeAutor } from '@/components/home/ComunidadeAutor';
import { FinalCta } from '@/components/home/FinalCta';

const TOTAL_ARTICLES = CURRICULUM.flatMap(t => t.modules).length;
const TOTAL_TRAILS = CURRICULUM.length;

export function HomeClient() {
  const { state, refresh } = useGameState();
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
  // Card da Pergunta do Dia: aparece pra qualquer user que já interagiu
  // (totalXP > 0) — evita mostrar pra visitante totalmente novo.
  const showDailyQuestion = state !== null && state.xp > 0;

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}>
      <Hero totalArticles={TOTAL_ARTICLES} totalTrails={TOTAL_TRAILS} />
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
      <SocialProofBar />
      <HowItWorks />

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
          </div>
        </section>
      )}

      <ComecarAqui hidden={hasProgress} />
      <Explorar />
      <Trending />
      <HomeRanking />
      <ComunidadeAutor />
      <FinalCta />

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
