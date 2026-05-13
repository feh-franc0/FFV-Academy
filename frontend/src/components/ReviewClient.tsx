'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import type { ReviewCard } from '@/lib/srs';
import type { ReviewQuality } from '@/lib/srs';
import { playXPCoin, playPop, unlockAudio } from '@/lib/sounds';

type Phase = 'empty' | 'answering' | 'revealed' | 'finished';

interface SessionStats {
  total: number;
  correct: number;
  xpGained: number;
}

/**
 * ReviewClient props — configuração opcional para sessões customizadas
 * (ex.: Maratona). Sem props, comportamento padrão = todos os cards due
 * ordenados por dueDate.
 */
export interface ReviewClientProps {
  /** Limite de cards na sessão. null/undefined = ilimitado. */
  maxCards?: number;
  /** Restringe a cards cujo slug pertença à trilha indicada. */
  trailFilter?: string;
  /** Resolver slug → trailId. Necessário se trailFilter for usado. */
  slugToTrail?: (slug: string) => string | undefined;
}

export function ReviewClient(props: ReviewClientProps = {}) {
  const { state, dueCards, reviewOne } = useGameState();
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ total: 0, correct: 0, xpGained: 0 });
  const [queue, setQueue] = useState<ReviewCard[] | null>(null);

  useEffect(() => {
    if (queue !== null || !state) return;
    let pool = [...dueCards];
    if (props.trailFilter && props.slugToTrail) {
      pool = pool.filter(c => props.slugToTrail!(c.slug) === props.trailFilter);
    }
    pool.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    if (props.maxCards && props.maxCards > 0) {
      pool = pool.slice(0, props.maxCards);
    }
    setQueue(pool);
    // Initialize once when state first loads — intentionally omit dueCards from deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const currentCard: ReviewCard | null = queue && queue.length > 0 ? queue[0] : null;
  const phase: Phase = !state
    ? 'empty'
    : finished
      ? 'finished'
      : !currentCard
        ? 'empty'
        : revealed
          ? 'revealed'
          : 'answering';

  const progress = useMemo(() => {
    if (!state || queue === null) return { done: 0, total: 0, pct: 0 };
    const total = stats.total + queue.length;
    const done = stats.total;
    return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
  }, [state, queue, stats.total]);

  function handleSelect(idx: number) {
    if (revealed) return;
    unlockAudio();
    setSelected(idx);
    setRevealed(true);
    if (idx === currentCard?.correct) {
      playXPCoin();
    } else {
      playPop();
    }
  }

  function handleRate(outcome: ReviewQuality) {
    if (!currentCard) return;
    const result = reviewOne(currentCard.id, outcome);
    const isCorrect = outcome !== 'again';
    const nextStats = {
      total: stats.total + 1,
      correct: stats.correct + (isCorrect ? 1 : 0),
      xpGained: stats.xpGained + result.xpGained,
    };
    setStats(nextStats);
    const rest = (queue ?? []).slice(1);
    // If user rated "again", push card back 2 positions
    if (outcome === 'again' && rest.length > 0) {
      const insertAt = Math.min(2, rest.length);
      rest.splice(insertAt, 0, currentCard);
    }
    setQueue(rest);
    setSelected(null);
    setRevealed(false);
    if (rest.length === 0) setFinished(true);
  }

  if (phase === 'empty' && (!state || (state.reviewCards?.length ?? 0) === 0)) {
    return <EmptyStateNoCards />;
  }

  if (phase === 'empty') {
    return <EmptyStateZeroDue streak={state?.streak ?? 0} upcoming={state?.reviewCards?.length ?? 0} />;
  }

  if (phase === 'finished') {
    return <FinishedState stats={stats} />;
  }

  if (!currentCard) return null;

  return (
    <main className="max-w-2xl mx-auto px-6 pt-10 pb-20">
      {/* Top bar: progress + exit */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="text-xs px-3 py-1.5 rounded-full transition-colors hover:opacity-80"
          style={{ color: 'var(--ffv-muted)', border: '1px solid var(--ffv-border)' }}
        >
          Sair
        </Link>
        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--ffv-bg2)' }}>
          <div
            className="h-full transition-all"
            style={{ width: `${progress.pct}%`, background: 'var(--ffv-green)' }}
          />
        </div>
        <div className="text-xs tabular-nums" style={{ color: 'var(--ffv-muted)' }}>
          {progress.done}/{progress.total}
        </div>
      </div>

      {/* Context chip */}
      <div className="mb-6 flex items-center gap-2 flex-wrap">
        <span
          className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full"
          style={{ background: `${currentCard.trailColor}20`, color: currentCard.trailColor, border: `1px solid ${currentCard.trailColor}40` }}
        >
          {currentCard.title}
        </span>
        <span className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
          · revisão espaçada · próxima em {currentCard.interval > 0 ? `${currentCard.interval}d` : 'hoje'}
        </span>
      </div>

      {/* Question */}
      <h1 className="text-xl font-bold leading-snug mb-8">{currentCard.question}</h1>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentCard.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrectAnswer = idx === currentCard.correct;
          let bg = 'var(--ffv-bg2)';
          let border = 'var(--ffv-border)';
          let color = 'var(--foreground)';
          if (revealed) {
            if (isCorrectAnswer) {
              bg = 'rgba(63,185,80,0.12)';
              border = 'rgba(63,185,80,0.5)';
              color = 'var(--ffv-green)';
            } else if (isSelected && !isCorrectAnswer) {
              bg = 'rgba(247,129,102,0.12)';
              border = 'rgba(247,129,102,0.5)';
              color = 'var(--ffv-red)';
            }
          } else if (isSelected) {
            bg = `${currentCard.trailColor}20`;
            border = currentCard.trailColor;
            color = currentCard.trailColor;
          }
          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className="text-left px-4 py-3 rounded-lg text-sm transition-all disabled:cursor-default"
              style={{ background: bg, border: `1px solid ${border}`, color }}
            >
              <span className="font-semibold mr-2 opacity-70">{String.fromCharCode(65 + idx)}</span>
              {opt}
              {revealed && isCorrectAnswer && ' ✓'}
              {revealed && isSelected && !isCorrectAnswer && ' ✗'}
            </button>
          );
        })}
      </div>

      {/* Explanation + rating */}
      {revealed && (
        <div
          className="mt-8 p-5 rounded-xl"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          <p className="text-xs font-semibold mb-2" style={{ color: 'var(--ffv-muted)' }}>
            Por quê?
          </p>
          <p className="text-sm leading-relaxed mb-6">{currentCard.explanation}</p>

          <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Quão fácil foi lembrar disso?
          </p>
          <div className="grid grid-cols-4 gap-2">
            <RatingButton label="Errei" sublabel="+0 XP · reset" tone="#f78166" onClick={() => handleRate('again')} />
            <RatingButton label="Difícil" sublabel="+1 XP · 1d" tone="#e3b341" onClick={() => handleRate('hard')} />
            <RatingButton label="Bom" sublabel="+2 XP · 3d" tone="#3fb950" onClick={() => handleRate('good')} />
            <RatingButton label="Fácil" sublabel="+4 XP · longo" tone="#58a6ff" onClick={() => handleRate('easy')} />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
              Seja honesto — a fila só ajuda se você calibrar pelo esforço real.
            </p>
            <Link
              href={`/aprenda/${currentCard.slug}`}
              className="text-[11px] font-semibold shrink-0 ml-4 hover:opacity-70 transition-opacity"
              style={{ color: 'var(--ffv-blue)' }}
            >
              Reler artigo →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}

function RatingButton({ label, sublabel, tone, onClick }: { label: string; sublabel: string; tone: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 py-3 rounded-lg transition-all hover:opacity-90 active:scale-95"
      style={{ background: `${tone}15`, border: `1px solid ${tone}50`, color: tone }}
    >
      <span className="text-sm font-bold">{label}</span>
      <span className="text-[10px] opacity-80">{sublabel}</span>
    </button>
  );
}

function EmptyStateNoCards() {
  return (
    <main className="max-w-lg mx-auto px-6 pt-20 pb-20 text-center">
      <div className="text-6xl mb-6">🧠</div>
      <h1 className="text-2xl font-bold mb-3">Sua fila de revisão está vazia</h1>
      <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
        Conclua um quiz em qualquer artigo para que as perguntas virem cards de revisão espaçada.
        Quanto mais você aprende, mais inteligente fica a fila — ela te devolve na hora certa
        aquilo que você está prestes a esquecer.
      </p>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
      >
        Começar a estudar →
      </Link>
    </main>
  );
}

function EmptyStateZeroDue({ streak, upcoming }: { streak: number; upcoming: number }) {
  return (
    <main className="max-w-lg mx-auto px-6 pt-20 pb-20 text-center">
      <div className="text-6xl mb-6">✨</div>
      <h1 className="text-2xl font-bold mb-3">Fila zerada hoje</h1>
      <p className="text-sm mb-2 leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
        Você já revisou tudo o que estava devido. O algoritmo vai devolver seus cards no momento
        certo para fixar a memória de longo prazo.
      </p>
      <div className="flex items-center justify-center gap-6 my-8">
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--ffv-orange)' }}>🔥 {streak}</div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--ffv-muted)' }}>Streak de dias</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--ffv-blue)' }}>{upcoming}</div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--ffv-muted)' }}>Cards na fila</div>
        </div>
      </div>
      <Link
        href="/"
        className="inline-block px-6 py-3 rounded-full text-sm font-semibold transition-all hover:opacity-90"
        style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
      >
        Explorar artigos novos →
      </Link>
    </main>
  );
}

function FinishedState({ stats }: { stats: SessionStats }) {
  const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
  return (
    <main className="max-w-lg mx-auto px-6 pt-20 pb-20 text-center">
      <div className="text-6xl mb-6">🎯</div>
      <h1 className="text-2xl font-bold mb-3">Sessão concluída!</h1>
      <p className="text-sm mb-8 leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
        Cada card revisado aqui é um pouco de conhecimento fixado na memória de longo prazo.
      </p>
      <div
        className="grid grid-cols-3 gap-4 p-6 rounded-2xl mb-8"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <div>
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--ffv-muted)' }}>Cards</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--ffv-green)' }}>{accuracy}%</div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--ffv-muted)' }}>Acerto</div>
        </div>
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--ffv-blue)' }}>+{stats.xpGained}</div>
          <div className="text-[10px] tracking-wider uppercase" style={{ color: 'var(--ffv-muted)' }}>XP</div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="px-5 py-2.5 rounded-full text-sm transition-all hover:opacity-90"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
        >
          Voltar ao hub
        </Link>
        <Link
          href="/revisar"
          onClick={() => { if (typeof window !== 'undefined') window.location.reload(); }}
          className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:opacity-90"
          style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
        >
          Revisar de novo
        </Link>
      </div>
    </main>
  );
}
