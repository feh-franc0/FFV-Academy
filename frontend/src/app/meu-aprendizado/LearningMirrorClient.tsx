'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useGameState } from '@/hooks/useGameState';

/**
 * LearningMirrorClient — UI do Espelho de Aprendizado.
 *
 * Lê do GameState (hook useGameState) e calcula 4 blocos:
 *  1. Hero personalizado — saudação + métrica chave
 *  2. "O que você consolidou esta semana" — módulos completados ≤7d
 *  3. "Memória de longo prazo" — archived cards (SM-2 interval>90, ease>3)
 *  4. "Próxima revisão" — quantos cards due hoje + amanhã
 *  5. "Pontos cegos" — quizzes com score < 60% (sinaliza pra revisar)
 *  6. Shareable card visual (sem export pra imagem ainda — V2)
 */

export function LearningMirrorClient() {
  const { state, levelInfo, dueCards } = useGameState();

  const hasProgress =
    !!state &&
    ((state.completedModules?.length ?? 0) > 0 ||
      (state.reviewCards?.length ?? 0) > 0 ||
      (state.xp ?? 0) > 0);

  const stats = useMemo(() => {
    if (!state) return null;
    const now = Date.now();
    const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

    // Módulos consolidados última semana: usar studyDays como proxy
    const recentDays = (state.studyDays ?? []).filter(
      d => new Date(d.date).getTime() >= weekAgo,
    );
    const recentXp = recentDays.reduce((sum, d) => sum + d.xpEarned, 0);
    const recentModules = recentDays.reduce((sum, d) => sum + d.modulesCompleted, 0);

    // Memória de longo prazo: cards arquivados (SM-2 maduros) + completados
    const longTermCards = state.archivedCards?.length ?? 0;
    const totalMastered = (state.completedModules?.length ?? 0);

    // Pontos cegos: quizzes com score < 60%
    const weakQuizzes = Object.entries(state.quizScores ?? {})
      .filter(([, score]) => score.total > 0 && score.score / score.total < 0.6)
      .map(([slug, score]) => ({
        slug,
        pct: Math.round((score.score / score.total) * 100),
      }))
      .slice(0, 5);

    // Próxima revisão
    const tomorrow = now + 24 * 60 * 60 * 1000;
    const dueTomorrow = (state.reviewCards ?? []).filter(c => {
      const due = new Date(c.dueDate).getTime();
      return due > now && due <= tomorrow;
    }).length;

    return {
      recentXp,
      recentModules,
      longTermCards,
      totalMastered,
      weakQuizzes,
      dueTomorrow,
      dueNow: dueCards.length,
      streak: state.streak ?? 0,
      level: state.level ?? 1,
      totalXp: state.xp ?? 0,
      perfectStreak: state.perfectQuizStreak ?? 0,
    };
  }, [state, dueCards.length]);

  // Estado vazio — usuário sem progresso ainda
  if (!hasProgress || !stats) {
    return <EmptyState />;
  }

  return (
    <div
      style={{
        background: 'var(--ffv-paper)',
        color: 'var(--ffv-ink)',
        minHeight: '100vh',
        paddingTop: 'clamp(72px, 9vw, 112px)',
        paddingBottom: 'clamp(72px, 9vw, 112px)',
      }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        {/* Hero personalizado */}
        <header className="mb-12">
          <p
            className="font-mono uppercase text-[11px] mb-3"
            style={{ color: 'var(--ffv-amber)', letterSpacing: '0.16em', fontWeight: 700 }}
          >
            Seu espelho de aprendizado
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'clamp(2rem, 4.5vw, 3.6rem)',
              lineHeight: 1.05,
              letterSpacing: '-0.025em',
              marginBottom: 14,
            }}
          >
            {stats.totalMastered > 0 ? (
              <>
                Você consolidou{' '}
                <em
                  style={{
                    fontStyle: 'italic',
                    background: 'linear-gradient(135deg, var(--ffv-amber), #c2410c)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stats.totalMastered} {stats.totalMastered === 1 ? 'módulo' : 'módulos'}
                </em>
                .
              </>
            ) : (
              <>Você acabou de começar. Volta amanhã pra ver o crescimento.</>
            )}
          </h1>
          <p
            className="max-w-2xl"
            style={{
              fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
              color: '#44403c',
              lineHeight: 1.65,
            }}
          >
            ChatGPT esquece você no dia seguinte. NotebookLM não lembra do que você leu na semana
            passada. Aqui é diferente — a FFV sabe o que você aprendeu de verdade, o que precisa
            revisar e onde estão suas dúvidas reais.
          </p>
        </header>

        {/* Grid de 4 KPIs principais */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          <MirrorKpi
            label="Esta semana"
            value={String(stats.recentModules)}
            unit={stats.recentModules === 1 ? 'módulo' : 'módulos'}
            caption={`+${stats.recentXp} XP em 7 dias`}
            tone="amber"
          />
          <MirrorKpi
            label="Memória de longo prazo"
            value={String(stats.longTermCards)}
            unit="cards maduros"
            caption="Já consolidados pelo SRS (SM-2)"
            tone="sage"
          />
          <MirrorKpi
            label="Streak atual"
            value={String(stats.streak)}
            unit={stats.streak === 1 ? 'dia' : 'dias'}
            caption={
              levelInfo?.name
                ? `Nível ${stats.level} · ${levelInfo.name}`
                : `Nível ${stats.level}`
            }
            tone="blue"
          />
          <MirrorKpi
            label="Pra revisar hoje"
            value={String(stats.dueNow)}
            unit={stats.dueNow === 1 ? 'card' : 'cards'}
            caption={
              stats.dueTomorrow > 0
                ? `${stats.dueTomorrow} chegam até amanhã`
                : 'Próxima leva: até amanhã'
            }
            tone="purple"
          />
        </div>

        {/* Pontos cegos */}
        {stats.weakQuizzes.length > 0 && (
          <section
            className="mb-12 p-6 rounded-2xl"
            style={{
              background: '#ffffff',
              border: '1px solid var(--ffv-border)',
              boxShadow: '0 8px 24px -12px rgba(28,25,23,0.08)',
            }}
          >
            <p
              className="font-mono uppercase text-[10px] mb-3"
              style={{ color: 'var(--ffv-amber)', letterSpacing: '0.14em', fontWeight: 700 }}
            >
              Pontos cegos identificados
            </p>
            <h2
              style={{
                fontWeight: 800,
                fontSize: 'clamp(1.2rem, 2vw, 1.6rem)',
                marginBottom: 12,
                letterSpacing: '-0.02em',
              }}
            >
              {stats.weakQuizzes.length === 1
                ? 'Tem 1 conceito que você ainda não cravou.'
                : `Tem ${stats.weakQuizzes.length} conceitos que você ainda não cravou.`}
            </h2>
            <p className="text-sm mb-5" style={{ color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
              Quizzes onde você ficou abaixo de 60%. Esses entram automaticamente na fila de
              revisão espaçada — você não precisa lembrar de revisar.
            </p>
            <ul className="flex flex-col gap-2 list-none p-0">
              {stats.weakQuizzes.map(q => (
                <li key={q.slug}>
                  <Link
                    href={`/aprenda/${q.slug}`}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg transition-colors"
                    style={{
                      background: 'var(--ffv-bg)',
                      border: '1px solid var(--ffv-border)',
                      color: 'var(--foreground)',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="text-sm font-medium truncate">{q.slug.replace(/-/g, ' ')}</span>
                    <span
                      className="text-xs font-mono"
                      style={{
                        color: q.pct < 40 ? '#dc2626' : '#d97706',
                        fontWeight: 700,
                      }}
                    >
                      {q.pct}% acerto
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Shareable card (visual placeholder — V2 vira OG image gerado) */}
        <section
          className="p-8 lg:p-10 rounded-2xl mb-10"
          style={{
            background: 'linear-gradient(135deg, var(--ffv-ink) 0%, #292524 100%)',
            color: '#faf7f2',
          }}
        >
          <p
            className="font-mono uppercase text-[10px] mb-4"
            style={{ color: '#fbbf24', letterSpacing: '0.16em', fontWeight: 700 }}
          >
            Compartilhar
          </p>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'clamp(1.5rem, 3vw, 2.4rem)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 18,
            }}
          >
            Meu espelho{' '}
            <em
              style={{
                fontStyle: 'italic',
                color: '#fbbf24',
              }}
            >
              da FFV Academy
            </em>
          </h2>
          <ul
            className="grid sm:grid-cols-2 gap-4 mb-7 list-none p-0"
            style={{ color: '#d6d3d1' }}
          >
            <li className="flex items-start gap-3">
              <span aria-hidden style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700 }}>✦</span>
              <span>{stats.totalMastered} {stats.totalMastered === 1 ? 'módulo dominado' : 'módulos dominados'}</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700 }}>✦</span>
              <span>{stats.longTermCards} cards consolidados no SRS (SM-2)</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700 }}>✦</span>
              <span>{stats.streak}-dia streak {stats.streak >= 7 ? '🔥' : ''}</span>
            </li>
            <li className="flex items-start gap-3">
              <span aria-hidden style={{ color: '#fbbf24', fontSize: 18, fontWeight: 700 }}>✦</span>
              <span>{stats.totalXp.toLocaleString('pt-BR')} XP acumulado</span>
            </li>
          </ul>
          <p className="text-xs" style={{ color: '#a8a29e', lineHeight: 1.55 }}>
            ChatGPT esquece. NotebookLM resume. <strong style={{ color: '#faf7f2' }}>A FFV
            lembra do que você aprendeu — e o que você esqueceu.</strong>
          </p>
        </section>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link
            href="/revisar"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: 'var(--ffv-ink)',
              color: '#fff',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Revisar agora
            <span aria-hidden style={{ fontSize: 12 }}>→</span>
          </Link>
          <Link
            href="/progresso"
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
            style={{
              background: 'transparent',
              border: '1px solid var(--ffv-ink)',
              color: 'var(--ffv-ink)',
              borderRadius: 10,
              textDecoration: 'none',
            }}
          >
            Ver progresso completo
          </Link>
        </div>
      </div>
    </div>
  );
}

interface KpiProps {
  label: string;
  value: string;
  unit: string;
  caption: string;
  tone: 'amber' | 'sage' | 'blue' | 'purple';
}

function MirrorKpi({ label, value, unit, caption, tone }: KpiProps) {
  const colors = {
    amber: 'var(--ffv-amber, #b45309)',
    sage: 'var(--ffv-green, #15803d)',
    blue: 'var(--ffv-blue, #1e3a8a)',
    purple: 'var(--ffv-purple, #7c3aed)',
  };
  return (
    <article
      className="p-5 rounded-xl"
      style={{
        background: '#ffffff',
        border: '1px solid var(--ffv-border)',
        boxShadow: '0 4px 12px -6px rgba(28,25,23,0.06)',
      }}
    >
      <p
        className="font-mono uppercase text-[10px] mb-2"
        style={{ color: 'var(--ffv-muted)', letterSpacing: '0.14em', fontWeight: 700 }}
      >
        {label}
      </p>
      <p
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2.2rem, 3.4vw, 2.8rem)',
          fontWeight: 700,
          letterSpacing: '-0.025em',
          lineHeight: 1,
          color: 'var(--ffv-ink)',
        }}
      >
        {value}
        <span
          className="ml-1.5 text-xs font-semibold align-middle"
          style={{
            fontFamily: 'var(--font-inter)',
            color: colors[tone],
            letterSpacing: 0,
          }}
        >
          {unit}
        </span>
      </p>
      <p className="text-xs mt-2.5" style={{ color: '#57534e', lineHeight: 1.5 }}>
        {caption}
      </p>
    </article>
  );
}

function EmptyState() {
  return (
    <div
      style={{
        background: 'var(--ffv-paper)',
        color: 'var(--ffv-ink)',
        minHeight: '100vh',
        paddingTop: 'clamp(72px, 9vw, 112px)',
        paddingBottom: 'clamp(72px, 9vw, 112px)',
      }}
    >
      <div className="max-w-3xl mx-auto px-6 lg:px-10 text-center">
        <p
          className="font-mono uppercase text-[11px] mb-3"
          style={{ color: 'var(--ffv-amber)', letterSpacing: '0.16em', fontWeight: 700 }}
        >
          Espelho de aprendizado
        </p>
        <h1
          style={{
            fontFamily: 'var(--font-serif)',
            fontWeight: 700,
            fontSize: 'clamp(2rem, 4vw, 3rem)',
            lineHeight: 1.1,
            letterSpacing: '-0.02em',
            marginBottom: 18,
          }}
        >
          Sem espelho ainda.
        </h1>
        <p
          className="max-w-xl mx-auto"
          style={{
            fontSize: 'clamp(1rem, 1.25vw, 1.15rem)',
            color: '#44403c',
            lineHeight: 1.65,
            marginBottom: 28,
          }}
        >
          Comece um módulo, faça o quiz e volte aqui. A FFV vai te mostrar o que ficou na sua
          memória de longo prazo, o que precisa revisar, e onde estão suas dúvidas reais.{' '}
          <strong>Algo que ChatGPT e NotebookLM não fazem.</strong>
        </p>
        <Link
          href="/tecnologia"
          className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold transition-colors"
          style={{
            background: 'var(--ffv-ink)',
            color: '#fff',
            borderRadius: 10,
            textDecoration: 'none',
          }}
        >
          Explorar a base de Tecnologia →
        </Link>
      </div>
    </div>
  );
}
