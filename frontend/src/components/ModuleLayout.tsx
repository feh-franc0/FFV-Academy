'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { Badge } from '@/components/ui/badge';
import { BADGES_DEF, CURRICULUM, getHubForTrail } from '@/lib/curriculum';
import { ArticleToc } from '@/components/article/ArticleToc';
import { BackToTop } from '@/components/article/BackToTop';
import { MobileToc } from '@/components/article/MobileToc';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { Prerequisites } from '@/components/article/Prerequisites';
import { NextSteps } from '@/components/article/NextSteps';
import { ArticleJsonLd } from '@/components/article/ArticleJsonLd';
import { CelebrationOverlay, type CelebrationEvent } from '@/components/CelebrationOverlay';
import { RelatedModules } from '@/components/article/RelatedModules';
import { ShareSocial } from '@/components/ShareSocial';
import { QuizWordleResult } from '@/components/QuizWordleResult';
import { ModuleActions } from '@/components/ModuleActions';
import { TrailCompletionModal } from '@/components/TrailCompletionModal';
import { PrintCover, PrintQuizAnswerKey, PrintColophon } from '@/components/article/PrintLayout';
import { isDailyModule, markDailyModuleCompleted } from '@/lib/dailyModule';
import { GAME_CONFIG } from '@/lib/constants';
import { BookmarkButton } from '@/components/BookmarkButton';
import { ModuleRating } from '@/components/ModuleRating';
import { TextSelectionShare } from '@/components/TextSelectionShare';
import { ArticleDiscussion } from '@/components/ArticleDiscussion';
import { PeerComparisonChip } from '@/components/peer/PeerComparisonChip';
import { calculatePeerPercentile } from '@/lib/peer-stats';
import { NextModuleCard } from '@/components/article/NextModuleCard';
import { PostReadSignupCta } from '@/components/cta/PostReadSignupCta';
import { useScrollMilestones } from '@/hooks/useScrollMilestones';

function getNextModule(slug: string) {
  for (const trail of CURRICULUM) {
    const idx = trail.modules.findIndex(m => m.slug === slug);
    if (idx !== -1 && idx < trail.modules.length - 1) {
      return { module: trail.modules[idx + 1], trail };
    }
  }
  return null;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

interface ModuleLayoutProps {
  slug: string;
  title: string;
  icon: string;
  xp: number;
  readTime: number;
  trailName: string;
  trailColor: string;
  nextSlug?: string;
  nextTitle?: string;
  quiz: QuizQuestion[];
  children: React.ReactNode;
  seoDesc?: string;
  relatedSlugs?: string[];
}

export function ModuleLayout({
  slug,
  title,
  icon,
  xp,
  readTime,
  trailName,
  trailColor,
  nextSlug,
  nextTitle,
  quiz,
  children,
  seoDesc,
  relatedSlugs,
}: ModuleLayoutProps) {
  const { state, markComplete, submitQuiz, trackVisit, trackProgress } = useGameState();

  // Ref pro <article> root — usado por useScrollMilestones (telemetria de
  // profundidade) e PostReadSignupCta (gatilho de 75% scroll). Ambos
  // funcionam de forma passiva, sem afetar UX.
  const articleRef = useRef<HTMLElement>(null);
  useScrollMilestones({ moduleSlug: slug, contentRef: articleRef });

  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ xpGained: number; newBadges: string[]; leveledUp: boolean; newLevel: number; cardsAdded: number } | null>(null);
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);
  const [trailCompletion, setTrailCompletion] = useState<{
    trail: typeof CURRICULUM[number];
    totalXp: number;
    newBadges: string[];
  } | null>(null);
  const [timeAttack, setTimeAttack] = useState(false);
  const [timeAttackFailed, setTimeAttackFailed] = useState(false);
  const [timeAttackDeadline, setTimeAttackDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  // hintUsed[qi] = eliminated wrong option index, or null
  const [hintUsed, setHintUsed] = useState<(number | null)[]>(quiz.map(() => null));
  // retry mode: null = full quiz, or array of wrong question indices
  const [retryIndices, setRetryIndices] = useState<number[] | null>(null);
  // Track time spent per question (in seconds) — set when question is answered
  const [questionTimes, setQuestionTimes] = useState<number[]>(quiz.map(() => 0));
  const questionStartRef = useRef<number | null>(null);

  const isCompleted = state?.completedModules.includes(slug) ?? false;
  const quizScore = state?.quizScores[slug];
  const [isDaily, setIsDaily] = useState(false);
  const DAILY_BONUS_XP = GAME_CONFIG.DAILY_MODULE_BONUS_XP;
  const TIME_ATTACK_BONUS_XP = GAME_CONFIG.TIME_ATTACK_BONUS_XP;
  const TIME_ATTACK_SECONDS_PER_Q = GAME_CONFIG.TIME_ATTACK_SECONDS_PER_QUESTION;

  useEffect(() => {
    setIsDaily(isDailyModule(slug));
  }, [slug]);

  /**
   * Timer do time-attack baseado em wall-clock (Date.now()) — robusto a:
   * - Tab inativa (setInterval com delay maior)
   * - DevTools pausado
   * - Throttling do navegador
   * Atualiza display a cada 250ms pra UI suave sem drift cumulativo.
   */
  useEffect(() => {
    if (!quizStarted || submitted || !timeAttack || timeAttackDeadline === null) return;

    const tick = () => {
      const remainingMs = timeAttackDeadline - Date.now();
      const remainingSec = Math.max(0, Math.ceil(remainingMs / 1000));
      setTimeLeft(remainingSec);
      if (remainingMs <= 0) setTimeAttackFailed(true);
    };
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [quizStarted, submitted, timeAttack, timeAttackDeadline]);

  // Hub ancestry for breadcrumb
  const hub = useMemo(() => {
    const trail = CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
    return trail ? getHubForTrail(trail.id) : undefined;
  }, [slug]);

  // Track visit on mount
  useEffect(() => {
    trackVisit({
      slug,
      title,
      icon,
      trailName,
      trailColor,
      readTime,
      xp,
      href: `/aprenda/${slug}`,
    });
  }, [slug, title, icon, trailName, trailColor, readTime, xp, trackVisit]);

  function handleAnswer(qi: number, ai: number) {
    if (submitted) return;
    // Record time for this question if not yet answered
    if (answers[qi] === null && questionStartRef.current !== null) {
      const elapsed = Math.round((Date.now() - questionStartRef.current) / 1000);
      setQuestionTimes(prev => prev.map((t, i) => (i === qi ? elapsed : t)));
    }
    // Start timer for next unanswered question
    questionStartRef.current = Date.now();
    setAnswers(prev => prev.map((a, i) => (i === qi ? ai : a)));
  }

  function handleHint(qi: number) {
    if (hintUsed[qi] !== null || answers[qi] !== null) return;
    const q = quiz[qi];
    const wrongOptions = q.options
      .map((_, i) => i)
      .filter(i => i !== q.correct);
    const toEliminate = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
    setHintUsed(prev => prev.map((h, i) => (i === qi ? toEliminate : h)));
  }

  function handleSubmit() {
    // In retry mode, just show results — don't re-award XP
    if (retryIndices) {
      setSubmitted(true);
      setResult(null);
      return;
    }
    const score = answers.filter((a, i) => a === quiz[i].correct).length;
    submitQuiz(slug, score, quiz.length);
    const quizScore = quiz.length > 0 ? score / quiz.length : 1;
    const applyDailyBonus = isDaily && !isCompleted;
    const timeAttackWin = timeAttack && !timeAttackFailed && score === quiz.length && !isCompleted;
    let bonusXp = 0;
    if (applyDailyBonus) bonusXp += DAILY_BONUS_XP;
    if (timeAttackWin) bonusXp += TIME_ATTACK_BONUS_XP;
    const r = markComplete({
      slug, title, trailColor, readTime, quiz, quizScore,
      bonusXp,
    });
    if (applyDailyBonus) markDailyModuleCompleted(slug);
    setResult(r);
    setSubmitted(true);

    // Plausible analytics — evento de conclusão de quiz
    try {
      window.plausible?.('quiz-complete', {
        props: { module: slug, score: `${score}/${quiz.length}`, perfect: score === quiz.length },
      });
    } catch { /* analytics opcional */ }

    // Build celebration queue: level up first, then each new badge
    const events: CelebrationEvent[] = [];
    if (r.leveledUp) events.push({ kind: 'level', level: r.newLevel });
    for (const badgeId of r.newBadges) {
      events.push({ kind: 'badge', badgeId });
    }
    if (events.length > 0) {
      // Small delay so the user sees the score result first
      setTimeout(() => setCelebrations(events), 400);
    }

    // Trail completion detection: o último módulo desta trilha acaba de ser completado?
    const moduleTrail = CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
    if (moduleTrail) {
      const stateNow = state;
      // completedModules ainda pode não conter o slug atual no closure, então simulamos
      const completedAfter = new Set(stateNow?.completedModules ?? []);
      completedAfter.add(slug);
      const allDone = moduleTrail.modules.every(m => completedAfter.has(m.slug));
      const wasIncomplete = !moduleTrail.modules.every(m => (stateNow?.completedModules ?? []).includes(m.slug));
      if (allDone && wasIncomplete) {
        const totalXp = moduleTrail.modules.reduce((acc, m) => acc + m.xp, 0);
        setTimeout(() => {
          setTrailCompletion({
            trail: moduleTrail,
            totalXp,
            newBadges: r.newBadges,
          });
        }, 900);
      }
    }
  }

  // In retry mode, only check answers for the retry questions
  const activeQuizIndices = retryIndices ?? quiz.map((_, i) => i);
  const allAnswered = activeQuizIndices.every(i => answers[i] !== null);
  const score = submitted ? answers.filter((a, i) => a === quiz[i].correct).length : 0;
  const perfect = submitted && score === quiz.length;

  // Helper pra level do módulo (usado na capa print)
  const trail = CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
  const moduleLevel = trail?.modules.find(m => m.slug === slug)?.level ?? trail?.level;

  function escapeCss(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  return (
    <article ref={articleRef} className="max-w-2xl mx-auto px-4 sm:px-6 pb-20" data-article-root>
      {/* Print-only: capa, renderizada apenas em PDF */}
      <PrintCover
        title={title}
        slug={slug}
        icon={icon}
        trailName={trailName}
        trailColor={trailColor}
        hubName={hub?.name ?? hub?.shortName}
        readTime={readTime}
        xp={xp}
        level={moduleLevel}
      />
      {/* CSS dinâmico para cabeçalho/rodapé do PDF com trail name e título */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
@media print {
  @page {
    @top-right { content: "${escapeCss(trailName.toUpperCase())}" !important; }
    @bottom-left { content: "${escapeCss(title)}" !important; }
  }
  @page :first {
    @top-right { content: none !important; }
    @bottom-left { content: none !important; }
  }
}`,
        }}
      />
      {seoDesc && (
        <ArticleJsonLd
          title={title}
          description={seoDesc}
          slug={slug}
          readTime={readTime}
          trailName={trailName}
          trailHref={CURRICULUM.find(t => t.modules.some(m => m.slug === slug))?.href}
          hubName={hub?.shortName ?? hub?.name}
          hubHref={hub?.href}
        />
      )}
      <ReadingProgressBar
        containerSelector="[data-article-content]"
        color={trailColor}
        onProgress={p => trackProgress(slug, p)}
      />

      {/* Breadcrumb — FFV / Hub / Trail / Article */}
      <nav
        className="flex items-center gap-1.5 text-xs pt-8 mb-8 flex-wrap"
        style={{ color: 'var(--ffv-muted)' }}
        aria-label="Migalha de pão"
      >
        <Link
          href="/"
          className="transition-colors"
          style={{ color: 'var(--ffv-muted)' }}
          onMouseOver={e => { e.currentTarget.style.color = 'var(--foreground)'; }}
          onMouseOut={e => { e.currentTarget.style.color = 'var(--ffv-muted)'; }}
        >
          FFV Academy
        </Link>
        <span aria-hidden>/</span>
        {hub && (
          <>
            <Link
              href={hub.href}
              className="transition-colors"
              style={{ color: hub.color }}
            >
              {hub.shortName ?? hub.name}
            </Link>
            <span aria-hidden>/</span>
          </>
        )}
        <span style={{ color: trailColor }}>{trailName}</span>
        <span aria-hidden>/</span>
        <span style={{ color: 'var(--foreground)' }}>{title}</span>
      </nav>

      {/* Daily Module banner */}
      {isDaily && !isCompleted && (
        <div
          className="mb-6 flex items-center gap-3 p-4 rounded-xl flex-wrap"
          style={{
            background: `color-mix(in srgb, ${trailColor} 10%, var(--ffv-bg2))`,
            border: `1px solid ${trailColor}40`,
          }}
        >
          <span className="text-xl">🌅</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: trailColor }}>
              Módulo do Dia
            </div>
            <div className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Complete hoje e ganhe <b style={{ color: 'var(--ffv-yellow)' }}>+{DAILY_BONUS_XP} XP bônus</b>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold">{title}</h1>
              {isCompleted && (
                <Badge style={{ background: 'rgba(63,185,80,0.15)', color: 'var(--ffv-green)', border: '1px solid rgba(63,185,80,0.3)' }}>
                  ✓ Completo
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--ffv-muted)' }}>
              <span>⏱ {readTime} min de leitura</span>
              <span>·</span>
              <span style={{ color: trailColor }}>+{xp} XP</span>
              {quizScore && <span>· Quiz: {quizScore.score}/{quizScore.total}{quizScore.perfect ? ' 🎯' : ''}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <BookmarkButton slug={slug} size={15} />
            <span className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Leve este módulo pra qualquer lugar
            </span>
          </div>
          <ModuleActions title={title} slug={slug} accent={trailColor} trailName={trailName} />
        </div>
        <div className="h-px" style={{ background: 'var(--ffv-border)' }} />
      </header>

      {/* Floating TOC on wide screens */}
      <aside
        aria-hidden={false}
        className="hidden lg:block"
        style={{
          position: 'fixed',
          top: 80,
          right: 'max(24px, calc((100vw - 672px) / 2 - 260px))',
          width: 220,
          zIndex: 10,
        }}
      >
        <ArticleToc containerSelector="[data-article-content]" accent={trailColor} />
      </aside>

      {/* Bottom-sheet TOC on mobile/tablet */}
      <MobileToc containerSelector="[data-article-content]" accent={trailColor} />

      {/* Floating "back to top" após 50% scroll */}
      <BackToTop />

      {/* Prerequisites */}
      <Prerequisites slug={slug} accent={trailColor} />

      {/* Content */}
      <div className="prose-ffv" data-article-content>{children}</div>

      {/* Social share — antes do quiz, encoraja share mid-article */}
      <div className="mt-10">
        <ShareSocial slug={slug} title={title} accent={trailColor} />
      </div>

      {/* Convite de signup pós-leitura — gatilho neurocientífico (pico-fim).
          Aparece SÓ pra anônimo, após 75% scroll + 30s + 3s idle, 1x por
          sessão, cooldown 72h. Ver docs/PROMPT_DESIGN_NEUROCIENCIA.md. */}
      <PostReadSignupCta moduleSlug={slug} contentRef={articleRef} />

      {/* Quiz section (interativo, escondido em PDF) */}
      <section className="mt-14 ffv-no-print" data-quiz-interactive>
        <div className="h-px mb-10" style={{ background: 'var(--ffv-border)' }} />

        {!quizStarted && !submitted ? (
          <div
            className="p-8 rounded-xl text-center"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="text-3xl mb-3">🧩</div>
            <h2 className="text-lg font-bold mb-2">Quiz rápido</h2>
            <div className="flex items-center justify-center gap-2 flex-wrap mb-4">
              <span className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                {quiz.length} pergunta{quiz.length !== 1 ? 's' : ''} · Acerte tudo e ganhe o badge 🎯 Gabarito
              </span>
              {moduleLevel && (
                <span
                  className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full"
                  style={{
                    background: moduleLevel === 'foundational' ? 'rgba(63,185,80,0.12)' : moduleLevel === 'beginner' ? 'rgba(88,166,255,0.12)' : moduleLevel === 'intermediate' ? 'rgba(227,179,65,0.12)' : 'rgba(247,129,102,0.12)',
                    color: moduleLevel === 'foundational' ? 'var(--ffv-green)' : moduleLevel === 'beginner' ? 'var(--ffv-blue)' : moduleLevel === 'intermediate' ? 'var(--ffv-yellow)' : 'var(--ffv-red)',
                  }}
                >
                  {moduleLevel === 'foundational' ? 'Fundamentos' : moduleLevel === 'beginner' ? 'Iniciante' : moduleLevel === 'intermediate' ? 'Intermediário' : 'Avançado'}
                </span>
              )}
            </div>
            {/* Prerequisites incomplete warning */}
            {(() => {
              if (!state) return null;
              const prereqs = state.completedModules;
              const mod = CURRICULUM.flatMap(t => t.modules).find(m => m.slug === slug);
              const missing = (mod?.prerequisites ?? []).filter(p => !prereqs.includes(p));
              return missing.length > 0 ? (
                <div
                  className="text-xs px-4 py-2 rounded-lg mb-4 inline-flex items-center gap-2"
                  style={{ background: 'rgba(227,179,65,0.1)', border: '1px solid rgba(227,179,65,0.3)', color: 'var(--ffv-yellow)' }}
                >
                  ⚠️ {missing.length} pré-requisito{missing.length > 1 ? 's' : ''} não concluído{missing.length > 1 ? 's' : ''} — você pode tentar assim mesmo
                </div>
              ) : null;
            })()}

            <label
              className="inline-flex items-center gap-2 text-xs mb-5 cursor-pointer select-none"
              style={{ color: 'var(--ffv-muted)' }}
            >
              <input
                type="checkbox"
                checked={timeAttack}
                onChange={e => setTimeAttack(e.target.checked)}
                aria-describedby="time-attack-desc"
              />
              ⚡ <b>Time Attack</b> — {TIME_ATTACK_SECONDS_PER_Q}s por pergunta · +{TIME_ATTACK_BONUS_XP} XP se 100% no tempo
            </label>
            <span id="time-attack-desc" className="sr-only">
              Modo cronometrado: você tem {TIME_ATTACK_SECONDS_PER_Q} segundos por pergunta. Se acertar tudo dentro do tempo, ganha {TIME_ATTACK_BONUS_XP} XP de bônus.
            </span>

            <div>
              <button
                onClick={() => {
                  if (timeAttack) {
                    const deadline = Date.now() + quiz.length * TIME_ATTACK_SECONDS_PER_Q * 1000;
                    setTimeAttackDeadline(deadline);
                    setTimeLeft(quiz.length * TIME_ATTACK_SECONDS_PER_Q);
                  }
                  questionStartRef.current = Date.now();
                  setQuizStarted(true);
                }}
                className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: trailColor, color: '#0d1117' }}
              >
                {timeAttack ? '⚡ Começar Time Attack' : 'Começar quiz'}
              </button>
            </div>
          </div>
        ) : !submitted ? (
          <div>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-lg font-bold">
                {retryIndices ? `🔄 Refazendo ${retryIndices.length} errada${retryIndices.length > 1 ? 's' : ''}` : '🧩 Quiz'}
              </h2>
              {timeAttack && timeLeft !== null && !timeAttackFailed && (
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full font-mono tabular-nums"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`Tempo restante: ${Math.floor(timeLeft / 60)} minutos e ${timeLeft % 60} segundos`}
                  style={{
                    background: timeLeft <= 10 ? 'rgba(247,129,102,0.18)' : 'var(--ffv-bg2)',
                    color: timeLeft <= 10 ? 'var(--ffv-red)' : trailColor,
                    border: `1px solid ${timeLeft <= 10 ? 'rgba(247,129,102,0.4)' : trailColor + '40'}`,
                  }}
                >
                  ⚡ {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
              )}
              {timeAttack && timeAttackFailed && (
                <span className="text-xs font-semibold" style={{ color: 'var(--ffv-red)' }}>
                  ⏱ Tempo esgotado — quiz sem bônus
                </span>
              )}
            </div>
            <div className="flex flex-col gap-8">
              {activeQuizIndices.map((qi) => {
                const q = quiz[qi];
                return (
                <div key={qi} role="group" aria-label={`Questão ${qi + 1} de ${quiz.length}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <p className="font-semibold text-sm">
                      <span style={{ color: trailColor, opacity: 0.8 }}>{qi + 1}. </span>
                      {q.question}
                    </p>
                    {hintUsed[qi] === null && answers[qi] === null && (
                      <button
                        onClick={() => handleHint(qi)}
                        className="shrink-0 text-[11px] px-2 py-1 rounded-full transition-all hover:opacity-80"
                        style={{ color: 'var(--ffv-yellow)', border: '1px solid var(--ffv-yellow)30', background: 'rgba(227,179,65,0.08)' }}
                        title="Eliminar uma opção errada"
                      >
                        💡 Dica
                      </button>
                    )}
                    {hintUsed[qi] !== null && (
                      <span className="shrink-0 text-[11px]" style={{ color: 'var(--ffv-muted)' }}>💡 usado</span>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, ai) => {
                      const isEliminated = hintUsed[qi] === ai;
                      return (
                        <button
                          key={ai}
                          onClick={() => !isEliminated && handleAnswer(qi, ai)}
                          aria-pressed={answers[qi] === ai}
                          disabled={isEliminated}
                          className="text-left px-4 py-3.5 rounded-lg text-sm transition-all disabled:cursor-not-allowed"
                          style={{
                            background: isEliminated ? 'transparent' : answers[qi] === ai ? `${trailColor}20` : 'var(--ffv-bg2)',
                            border: `1px solid ${isEliminated ? 'var(--ffv-border)' : answers[qi] === ai ? trailColor : 'var(--ffv-border)'}`,
                            color: isEliminated ? 'var(--ffv-muted)' : answers[qi] === ai ? trailColor : 'var(--foreground)',
                            opacity: isEliminated ? 0.4 : 1,
                            textDecoration: isEliminated ? 'line-through' : 'none',
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
                );
              })}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: trailColor, color: '#0d1117' }}
            >
              {allAnswered
                ? (retryIndices ? 'Ver resultado da revisão' : 'Enviar respostas')
                : `Responda todas (${activeQuizIndices.filter(i => answers[i] !== null).length}/${activeQuizIndices.length})`}
            </button>
          </div>
        ) : (
          /* Results */
          <div>
            {/* Retry mode results — simplified, no XP */}
            {retryIndices && (
              <div
                className="p-6 rounded-xl mb-6 text-center"
                style={{ background: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)' }}
              >
                {(() => {
                  const corrected = retryIndices.filter(i => answers[i] === quiz[i].correct).length;
                  return (
                    <>
                      <div className="text-3xl mb-2">{corrected === retryIndices.length ? '✅' : '📖'}</div>
                      <p className="font-bold text-lg mb-1">
                        {corrected === retryIndices.length ? 'Todas corretas desta vez!' : 'Continue revisando'}
                      </p>
                      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                        {corrected}/{retryIndices.length} corretas na revisão · XP já contabilizado
                      </p>
                      <button
                        onClick={() => { setRetryIndices(null); setAnswers(quiz.map(() => null)); setHintUsed(quiz.map(() => null)); setSubmitted(true); setResult(null); }}
                        className="mt-4 text-sm font-semibold hover:opacity-70 transition-opacity underline"
                        style={{ color: 'var(--ffv-blue)' }}
                      >
                        Ver gabarito completo
                      </button>
                    </>
                  );
                })()}
              </div>
            )}
            {/* XP reward */}
            {result && (
              <div
                className="p-6 rounded-xl mb-6 text-center"
                style={{ background: 'rgba(88,166,255,0.08)', border: '1px solid rgba(88,166,255,0.2)' }}
              >
                <div className="text-3xl mb-2">{perfect ? '🎯' : score >= quiz.length / 2 ? '💪' : '📖'}</div>
                <p className="font-bold text-lg mb-1">
                  {perfect ? 'Perfeito!' : score >= quiz.length / 2 ? 'Bom trabalho!' : 'Continue estudando!'}
                </p>
                <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                  {score}/{quiz.length} corretas · +{result.xpGained} XP ganhos
                </p>
                {(() => {
                  const scorePct = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;
                  const peer = calculatePeerPercentile(scorePct, slug);
                  return <PeerComparisonChip score={peer.score} percentile={peer.percentile} />;
                })()}
                {timeAttack && !timeAttackFailed && perfect && (
                  <p className="mt-1 text-xs font-semibold" style={{ color: 'var(--ffv-yellow)' }}>
                    ⚡ Time Attack · +{TIME_ATTACK_BONUS_XP} XP bônus
                  </p>
                )}
                {result.leveledUp && (
                  <p className="mt-2 font-semibold" style={{ color: 'var(--ffv-yellow)' }}>
                    🎉 Level up! Você é agora Nível {result.newLevel}!
                  </p>
                )}
                {result.newBadges.length > 0 && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
                    {result.newBadges.map(id => {
                      const b = BADGES_DEF.find(d => d.id === id);
                      return b ? (
                        <span key={id} className="text-sm font-medium px-3 py-1 rounded-full" style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)' }}>
                          {b.icon} {b.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                {result.cardsAdded > 0 && (
                  <p className="mt-3 text-xs" style={{ color: 'var(--ffv-muted)' }}>
                    🧠 {result.cardsAdded} {result.cardsAdded === 1 ? 'card adicionado' : 'cards adicionados'} à sua fila de revisão espaçada —
                    <Link href="/revisar" className="ml-1 underline" style={{ color: trailColor }}>revisar agora</Link>
                  </p>
                )}
              </div>
            )}

            {/* Module rating */}
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--ffv-border)' }}>
              <ModuleRating slug={slug} />
            </div>

            {/* Wordle-style share card */}
            <QuizWordleResult
              slug={slug}
              title={title}
              results={quiz.map((q, i) => answers[i] === q.correct)}
              accent={trailColor}
            />

            {/* Answer review */}
            <h2 className="text-base font-bold mb-4 mt-8">Revisão das respostas</h2>
            <div className="flex flex-col gap-6">
              {quiz.map((q, qi) => {
                const userAnswer = answers[qi];
                const correct = q.correct;
                const isCorrect = userAnswer === correct;
                return (
                  <div key={qi} className="p-4 rounded-xl" style={{ background: 'var(--ffv-bg2)', border: `1px solid ${isCorrect ? 'rgba(63,185,80,0.3)' : 'rgba(247,129,102,0.3)'}` }}>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <p className="font-semibold text-sm">
                        {isCorrect ? '✅' : '❌'} {q.question}
                      </p>
                      {questionTimes[qi] > 0 && (
                        <span className="shrink-0 text-[10px] tabular-nums" style={{ color: 'var(--ffv-muted)' }}>
                          ⏱ {questionTimes[qi]}s
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      {q.options.map((opt, ai) => (
                        <div
                          key={ai}
                          className="px-3 py-2 rounded-lg text-xs"
                          style={{
                            background: ai === correct
                              ? 'rgba(63,185,80,0.15)'
                              : ai === userAnswer && !isCorrect
                              ? 'rgba(247,129,102,0.15)'
                              : 'transparent',
                            color: ai === correct
                              ? 'var(--ffv-green)'
                              : ai === userAnswer && !isCorrect
                              ? 'var(--ffv-red)'
                              : 'var(--ffv-muted)',
                          }}
                        >
                          {opt}
                          {ai === correct && ' ✓'}
                        </div>
                      ))}
                    </div>
                    <p className="mt-3 text-xs italic" style={{ color: 'var(--ffv-muted)' }}>{q.explanation}</p>
                  </div>
                );
              })}
            </div>

            {/* Retry wrong answers */}
            {(() => {
              const wrongIdxs = quiz.map((q, i) => answers[i] !== q.correct ? i : -1).filter(i => i >= 0);
              return wrongIdxs.length > 0 && wrongIdxs.length < quiz.length ? (
                <button
                  onClick={() => {
                    setRetryIndices(wrongIdxs);
                    setAnswers(quiz.map(() => null));
                    setHintUsed(quiz.map(() => null));
                    setSubmitted(false);
                    setResult(null);
                    setQuizStarted(true);
                  }}
                  className="mt-6 w-full py-2.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: 'rgba(247,129,102,0.12)', border: '1px solid rgba(247,129,102,0.3)', color: 'var(--ffv-red)' }}
                >
                  Refazer {wrongIdxs.length} pergunta{wrongIdxs.length > 1 ? 's' : ''} errada{wrongIdxs.length > 1 ? 's' : ''} →
                </button>
              ) : null;
            })()}

            {/* Next module */}
            <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
              <Link href="/tecnologia" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--ffv-muted)' }}>
                ← Voltar para Tecnologia
              </Link>
              {nextSlug && nextTitle && (
                <Link
                  href={`/aprenda/${nextSlug}`}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90"
                  style={{ background: trailColor, color: '#0d1117' }}
                >
                  Próximo: {nextTitle} →
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {(submitted || isCompleted) && (() => {
        const next = getNextModule(slug);
        return next ? (
          <NextModuleCard module={next.module} trail={next.trail} />
        ) : null;
      })()}

      <ArticleDiscussion slug={slug} title={title} accentColor={trailColor} />

      <NextSteps slug={slug} />
      {relatedSlugs && relatedSlugs.length > 0 && <RelatedModules slugs={relatedSlugs} />}
      <RelatedArticles currentSlug={slug} />

      {/* Print-only: gabarito do quiz como material de revisão */}
      <PrintQuizAnswerKey quiz={quiz} title={title} trailColor={trailColor} />

      {/* Print-only: colofão (última página do PDF) */}
      <PrintColophon title={title} slug={slug} trailName={trailName} trailColor={trailColor} />

      {celebrations.length > 0 && (
        <CelebrationOverlay
          events={celebrations}
          onDismiss={() => setCelebrations([])}
        />
      )}

      {trailCompletion && (
        <TrailCompletionModal
          trail={trailCompletion.trail}
          totalXp={trailCompletion.totalXp}
          newBadges={trailCompletion.newBadges}
          onClose={() => setTrailCompletion(null)}
        />
      )}

      <TextSelectionShare articleSlug={slug} articleTitle={title} />
    </article>
  );
}
