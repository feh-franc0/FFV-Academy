'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { Badge } from '@/components/ui/badge';
import { BADGES_DEF, CURRICULUM, getHubForTrail } from '@/lib/curriculum';
import { ArticleToc } from '@/components/article/ArticleToc';
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
import { PrintCover, PrintQuizAnswerKey, PrintColophon } from '@/components/article/PrintLayout';
import { isDailyModule, markDailyModuleCompleted } from '@/lib/dailyModule';
import { GAME_CONFIG } from '@/lib/constants';

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
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ xpGained: number; newBadges: string[]; leveledUp: boolean; newLevel: number; cardsAdded: number } | null>(null);
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);
  const [timeAttack, setTimeAttack] = useState(false);
  const [timeAttackFailed, setTimeAttackFailed] = useState(false);
  const [timeAttackDeadline, setTimeAttackDeadline] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

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
    setAnswers(prev => prev.map((a, i) => (i === qi ? ai : a)));
  }

  function handleSubmit() {
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
  }

  const allAnswered = answers.every(a => a !== null);
  const score = submitted ? answers.filter((a, i) => a === quiz[i].correct).length : 0;
  const perfect = submitted && score === quiz.length;

  // Helper pra level do módulo (usado na capa print)
  const trail = CURRICULUM.find(t => t.modules.some(m => m.slug === slug));
  const moduleLevel = trail?.modules.find(m => m.slug === slug)?.level ?? trail?.level;

  function escapeCss(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  }

  return (
    <article className="max-w-2xl mx-auto px-6 pb-20" data-article-root>
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
          <div>
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
          <div className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
            Leve este módulo pra qualquer lugar
          </div>
          <ModuleActions title={title} slug={slug} accent={trailColor} trailName={trailName} />
        </div>
        <div className="h-px" style={{ background: 'var(--ffv-border)' }} />
      </header>

      {/* Floating TOC on wide screens */}
      <aside
        aria-hidden={false}
        className="hidden xl:block"
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

      {/* Prerequisites */}
      <Prerequisites slug={slug} accent={trailColor} />

      {/* Content */}
      <div className="prose-ffv" data-article-content>{children}</div>

      {/* Social share — antes do quiz, encoraja share mid-article */}
      <div className="mt-10">
        <ShareSocial slug={slug} title={title} accent={trailColor} />
      </div>

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
            <p className="text-sm mb-4" style={{ color: 'var(--ffv-muted)' }}>
              {quiz.length} perguntas · Acerte tudo e ganhe o badge 🎯 Gabarito
            </p>

            <label
              className="inline-flex items-center gap-2 text-xs mb-5 cursor-pointer select-none"
              style={{ color: 'var(--ffv-muted)' }}
            >
              <input
                type="checkbox"
                checked={timeAttack}
                onChange={e => setTimeAttack(e.target.checked)}
              />
              ⚡ <b>Time Attack</b> — {TIME_ATTACK_SECONDS_PER_Q}s por pergunta · +{TIME_ATTACK_BONUS_XP} XP se 100% no tempo
            </label>

            <div>
              <button
                onClick={() => {
                  if (timeAttack) {
                    const deadline = Date.now() + quiz.length * TIME_ATTACK_SECONDS_PER_Q * 1000;
                    setTimeAttackDeadline(deadline);
                    setTimeLeft(quiz.length * TIME_ATTACK_SECONDS_PER_Q);
                  }
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
              <h2 className="text-lg font-bold">🧩 Quiz</h2>
              {timeAttack && timeLeft !== null && !timeAttackFailed && (
                <span
                  className="text-sm font-bold px-3 py-1 rounded-full font-mono tabular-nums"
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
              {quiz.map((q, qi) => (
                <div key={qi}>
                  <p className="font-semibold text-sm mb-3">
                    <span style={{ color: 'var(--ffv-muted)' }}>{qi + 1}. </span>
                    {q.question}
                  </p>
                  <div className="flex flex-col gap-2">
                    {q.options.map((opt, ai) => (
                      <button
                        key={ai}
                        onClick={() => handleAnswer(qi, ai)}
                        className="text-left px-4 py-3 rounded-lg text-sm transition-all"
                        style={{
                          background: answers[qi] === ai ? `${trailColor}20` : 'var(--ffv-bg2)',
                          border: `1px solid ${answers[qi] === ai ? trailColor : 'var(--ffv-border)'}`,
                          color: answers[qi] === ai ? trailColor : 'var(--foreground)',
                        }}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={handleSubmit}
              disabled={!allAnswered}
              className="mt-8 w-full py-3 rounded-xl font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: trailColor, color: '#0d1117' }}
            >
              {allAnswered ? 'Enviar respostas' : `Responda todas (${answers.filter(a => a !== null).length}/${quiz.length})`}
            </button>
          </div>
        ) : (
          /* Results */
          <div>
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
                    <p className="font-semibold text-sm mb-3">
                      {isCorrect ? '✅' : '❌'} {q.question}
                    </p>
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

            {/* Next module */}
            <div className="mt-10 flex items-center justify-between gap-4 flex-wrap">
              <Link href="/" className="text-sm transition-colors hover:text-white" style={{ color: 'var(--ffv-muted)' }}>
                ← Voltar ao roadmap
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
    </article>
  );
}
