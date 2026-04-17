'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { Badge } from '@/components/ui/badge';
import { BADGES_DEF, CURRICULUM, getHubForTrail } from '@/lib/curriculum';
import { ArticleToc } from '@/components/article/ArticleToc';
import { ReadingProgressBar } from '@/components/article/ReadingProgressBar';
import { RelatedArticles } from '@/components/article/RelatedArticles';
import { Prerequisites } from '@/components/article/Prerequisites';
import { NextSteps } from '@/components/article/NextSteps';
import { ArticleJsonLd } from '@/components/article/ArticleJsonLd';
import { CelebrationOverlay, type CelebrationEvent } from '@/components/CelebrationOverlay';

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
}: ModuleLayoutProps) {
  const { state, markComplete, submitQuiz, trackVisit, trackProgress } = useGameState();
  const [quizStarted, setQuizStarted] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(quiz.map(() => null));
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<{ xpGained: number; newBadges: string[]; leveledUp: boolean; newLevel: number; cardsAdded: number } | null>(null);
  const [celebrations, setCelebrations] = useState<CelebrationEvent[]>([]);

  const isCompleted = state?.completedModules.includes(slug) ?? false;
  const quizScore = state?.quizScores[slug];

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
    const r = markComplete({ slug, title, trailColor, readTime, quiz, quizScore });
    setResult(r);
    setSubmitted(true);

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

  return (
    <article className="max-w-2xl mx-auto px-6 pb-20" data-article-root>
      {seoDesc && <ArticleJsonLd title={title} description={seoDesc} slug={slug} readTime={readTime} />}
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

      {/* Prerequisites */}
      <Prerequisites slug={slug} accent={trailColor} />

      {/* Content */}
      <div className="prose-ffv" data-article-content>{children}</div>

      {/* Quiz section */}
      <section className="mt-14">
        <div className="h-px mb-10" style={{ background: 'var(--ffv-border)' }} />

        {!quizStarted && !submitted ? (
          <div
            className="p-8 rounded-xl text-center"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="text-3xl mb-3">🧩</div>
            <h2 className="text-lg font-bold mb-2">Quiz rápido</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
              {quiz.length} perguntas · Acerte tudo e ganhe o badge 🎯 Gabarito
            </p>
            <button
              onClick={() => setQuizStarted(true)}
              className="px-6 py-2.5 rounded-full font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
              style={{ background: trailColor, color: '#0d1117' }}
            >
              Começar quiz
            </button>
          </div>
        ) : !submitted ? (
          <div>
            <h2 className="text-lg font-bold mb-6">🧩 Quiz</h2>
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

            {/* Answer review */}
            <h2 className="text-base font-bold mb-4">Revisão das respostas</h2>
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
      <RelatedArticles currentSlug={slug} />

      {celebrations.length > 0 && (
        <CelebrationOverlay
          events={celebrations}
          onDismiss={() => setCelebrations([])}
        />
      )}
    </article>
  );
}
