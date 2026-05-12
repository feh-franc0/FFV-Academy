'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { CURRICULUM, HUBS } from '@/lib/curriculum';
import type { ReviewCard } from '@/lib/srs';
import { getDueCards } from '@/lib/srs';
import { playXPCoin, playPop, unlockAudio } from '@/lib/sounds';

type Phase = 'config' | 'answering' | 'revealed' | 'finished';
type TimerOption = 15 | 30 | 60 | 0; // 0 = sem timer

interface SessionStats {
  total: number;
  correct: number;
  xpGained: number;
}

export function MaratonaClient() {
  const { state, reviewOne } = useGameState();
  const [phase, setPhase] = useState<Phase>('config');

  // Config
  const [trailFilter, setTrailFilter] = useState<string>('all');
  const [cardCount, setCardCount] = useState<number>(20);
  const [timerSecs, setTimerSecs] = useState<TimerOption>(0);

  // Session
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [stats, setStats] = useState<SessionStats>({ total: 0, correct: 0, xpGained: 0 });

  // Timer
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentCard = queue.length > 0 ? queue[0] : null;

  const filteredDue = useMemo(() => {
    if (!state) return [];
    const all = getDueCards(state.reviewCards);
    if (trailFilter === 'all') return all;
    const trail = CURRICULUM.find(t => t.id === trailFilter);
    if (!trail) return all;
    const slugs = new Set(trail.modules.map(m => m.slug));
    return all.filter(c => slugs.has(c.slug));
  }, [state, trailFilter]);

  const availableCount = filteredDue.length;
  const finalCount = cardCount === 0 ? availableCount : Math.min(cardCount, availableCount);

  function startSession() {
    const sorted = [...filteredDue].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    const selected = cardCount === 0 ? sorted : sorted.slice(0, cardCount);
    setQueue(selected);
    setStats({ total: 0, correct: 0, xpGained: 0 });
    setSelected(null);
    setRevealed(false);
    setPhase('answering');
    if (timerSecs > 0) startTimer(timerSecs);
  }

  function startTimer(secs: number) {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(secs);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          // auto-reveal on timeout
          setRevealed(true);
          setPhase('revealed');
          setSelected(-1); // -1 means timed out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function handleSelect(idx: number) {
    if (revealed || !currentCard) return;
    if (timerRef.current) clearInterval(timerRef.current);
    unlockAudio();
    setSelected(idx);
    setRevealed(true);
    setPhase('revealed');
    const isCorrect = idx === currentCard.correct;
    if (isCorrect) {
      playXPCoin();
    } else {
      playPop();
    }
  }

  function handleNext(quality: 'again' | 'hard' | 'good' | 'easy') {
    if (!currentCard) return;
    const isCorrect = selected === currentCard.correct;
    const xp = isCorrect ? 5 : 0;
    reviewOne(currentCard.id, quality);
    setStats(prev => ({
      total: prev.total + 1,
      correct: prev.correct + (isCorrect ? 1 : 0),
      xpGained: prev.xpGained + xp,
    }));
    const next = queue.slice(1);
    setQueue(next);
    setSelected(null);
    setRevealed(false);
    if (next.length === 0) {
      setPhase('finished');
    } else {
      setPhase('answering');
      if (timerSecs > 0) startTimer(timerSecs);
    }
  }

  if (!state) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <div className="text-4xl mb-4">⏳</div>
        <p style={{ color: 'var(--ffv-muted)' }}>Carregando…</p>
      </div>
    );
  }

  return (
    <div style={{ background: 'var(--ffv-bg)', minHeight: '100vh', color: 'var(--foreground)' }}>
      {/* Header */}
      <header className="px-6 pt-12 pb-6 max-w-2xl mx-auto">
        <Link
          href="/revisao-srs"
          className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}
        >
          ← REVISÃO SRS
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <span style={{ fontSize: 32 }}>🏃</span>
          <div>
            <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, letterSpacing: '-0.02em' }}>
              Maratona de Revisão
            </h1>
            <p style={{ fontSize: 13, color: 'var(--ffv-muted)' }}>Sessão SRS configurável — treino intensivo de memória</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-24">
        {phase === 'config' && (
          <ConfigPanel
            trails={CURRICULUM}
            trailFilter={trailFilter}
            setTrailFilter={setTrailFilter}
            cardCount={cardCount}
            setCardCount={setCardCount}
            timerSecs={timerSecs}
            setTimerSecs={setTimerSecs}
            availableCount={availableCount}
            finalCount={finalCount}
            onStart={startSession}
          />
        )}

        {(phase === 'answering' || phase === 'revealed') && currentCard && (
          <QuizCard
            card={currentCard}
            selected={selected}
            revealed={revealed}
            timeLeft={timerSecs > 0 ? timeLeft : null}
            timerMax={timerSecs}
            progress={{ done: stats.total, total: stats.total + queue.length, pct: stats.total + queue.length === 0 ? 0 : Math.round((stats.total / (stats.total + queue.length)) * 100) }}
            onSelect={handleSelect}
            onNext={handleNext}
          />
        )}

        {phase === 'finished' && (
          <FinishedPanel stats={stats} onRestart={() => setPhase('config')} />
        )}

        {phase === 'answering' && !currentCard && (
          <EmptyState onConfig={() => setPhase('config')} />
        )}
      </main>
    </div>
  );
}

/* ─── Config Panel ─── */

function ConfigPanel({
  trails,
  trailFilter,
  setTrailFilter,
  cardCount,
  setCardCount,
  timerSecs,
  setTimerSecs,
  availableCount,
  finalCount,
  onStart,
}: {
  trails: typeof CURRICULUM;
  trailFilter: string;
  setTrailFilter: (v: string) => void;
  cardCount: number;
  setCardCount: (v: number) => void;
  timerSecs: TimerOption;
  setTimerSecs: (v: TimerOption) => void;
  availableCount: number;
  finalCount: number;
  onStart: () => void;
}) {
  const countOptions = [10, 20, 50, 0];
  const timerOptions: { value: TimerOption; label: string }[] = [
    { value: 0, label: 'Sem timer' },
    { value: 15, label: '15 seg' },
    { value: 30, label: '30 seg' },
    { value: 60, label: '60 seg' },
  ];

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--foreground)' }}>
          1. Escolha a trilha
        </h2>
        <select
          value={trailFilter}
          onChange={e => setTrailFilter(e.target.value)}
          className="w-full px-4 py-3 rounded-xl text-sm font-medium"
          style={{
            background: 'var(--ffv-bg)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
            cursor: 'pointer',
          }}
        >
          <option value="all">Todas as trilhas ({availableCount} cards disponíveis)</option>
          {HUBS.map(h => (
            <optgroup key={h.id} label={`${h.icon} ${h.name}`}>
              {trails
                .filter(t => h.trailIds.includes(t.id))
                .map(t => (
                  <option key={t.id} value={t.id}>
                    {t.icon} {t.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--foreground)' }}>
          2. Quantidade de cards
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {countOptions.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setCardCount(c)}
              className="py-2.5 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: cardCount === c ? 'var(--ffv-blue)' : 'var(--ffv-bg)',
                border: `1px solid ${cardCount === c ? 'var(--ffv-blue)' : 'var(--ffv-border)'}`,
                color: cardCount === c ? '#fff' : 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              {c === 0 ? 'Todos' : c}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <h2 className="font-bold text-base mb-4" style={{ color: 'var(--foreground)' }}>
          3. Timer por card
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {timerOptions.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setTimerSecs(opt.value)}
              className="py-2.5 rounded-xl font-semibold text-xs transition-all"
              style={{
                background: timerSecs === opt.value ? '#f78166' : 'var(--ffv-bg)',
                border: `1px solid ${timerSecs === opt.value ? '#f78166' : 'var(--ffv-border)'}`,
                color: timerSecs === opt.value ? '#fff' : 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className="rounded-2xl p-5 flex items-center justify-between gap-4"
        style={{
          background: 'color-mix(in srgb, var(--ffv-blue) 8%, var(--ffv-bg2))',
          border: '1px solid color-mix(in srgb, var(--ffv-blue) 25%, transparent)',
        }}
      >
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--foreground)' }}>
            {finalCount === 0 ? 'Nenhum card disponível' : `${finalCount} card${finalCount === 1 ? '' : 's'} prontos`}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--ffv-muted)' }}>
            {availableCount} no total · {cardCount === 0 ? 'todos' : `top ${cardCount} por urgência`}
          </p>
        </div>
        <button
          type="button"
          onClick={onStart}
          disabled={finalCount === 0}
          className="px-6 py-3 rounded-xl font-bold text-sm transition-all"
          style={{
            background: finalCount === 0 ? 'var(--ffv-bg3)' : 'var(--ffv-blue)',
            color: finalCount === 0 ? 'var(--ffv-muted)' : '#fff',
            cursor: finalCount === 0 ? 'not-allowed' : 'pointer',
            border: 'none',
          }}
        >
          Iniciar maratona →
        </button>
      </div>

      {finalCount === 0 && (
        <div
          className="rounded-2xl p-6 text-center"
          style={{ background: 'var(--ffv-bg2)', border: '1px dashed var(--ffv-border)' }}
        >
          <div className="text-4xl mb-3">🎉</div>
          <p className="font-bold mb-1">Nenhum card para revisar!</p>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Você está em dia com todas as revisões. Volte amanhã ou leia novos artigos.
          </p>
          <Link
            href="/mapa"
            className="inline-block mt-4 px-5 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'var(--ffv-blue)', color: '#fff' }}
          >
            Explorar trilhas →
          </Link>
        </div>
      )}
    </div>
  );
}

/* ─── Quiz Card ─── */

function QuizCard({
  card,
  selected,
  revealed,
  timeLeft,
  timerMax,
  progress,
  onSelect,
  onNext,
}: {
  card: ReviewCard;
  selected: number | null;
  revealed: boolean;
  timeLeft: number | null;
  timerMax: number;
  progress: { done: number; total: number; pct: number };
  onSelect: (idx: number) => void;
  onNext: (q: 'again' | 'hard' | 'good' | 'easy') => void;
}) {
  const timedOut = selected === -1;

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex-1" style={{ height: 4, background: 'var(--ffv-bg2)', borderRadius: 999, overflow: 'hidden' }}>
          <div
            style={{
              width: `${progress.pct}%`,
              height: '100%',
              background: card.trailColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <span className="font-mono text-xs flex-shrink-0" style={{ color: 'var(--ffv-muted)' }}>
          {progress.done}/{progress.total}
        </span>
      </div>

      {/* Timer */}
      {timeLeft !== null && timerMax > 0 && (
        <div className="flex items-center justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center font-mono text-xl font-bold"
            style={{
              background: timeLeft <= 5 ? 'color-mix(in srgb, #f78166 15%, transparent)' : 'var(--ffv-bg2)',
              border: `2px solid ${timeLeft <= 5 ? '#f78166' : 'var(--ffv-border)'}`,
              color: timeLeft <= 5 ? '#f78166' : 'var(--foreground)',
              transition: 'all 0.3s',
            }}
          >
            {timeLeft}
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'var(--ffv-bg2)',
          border: `1px solid ${card.trailColor}40`,
          boxShadow: `0 8px 32px -8px ${card.trailColor}25`,
        }}
      >
        <div
          className="px-6 py-5"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${card.trailColor} 12%, transparent), transparent)`,
            borderBottom: '1px solid var(--ffv-border)',
          }}
        >
          <p className="text-xs font-mono mb-2" style={{ color: card.trailColor, letterSpacing: '0.08em', fontWeight: 700 }}>
            {card.title}
          </p>
          <p className="font-bold text-base leading-snug">{card.question}</p>
        </div>

        <div className="px-6 py-4 space-y-2">
          {card.options.map((opt, i) => {
            const isChosen = selected === i;
            const isCorrect = i === card.correct;
            let bg = 'var(--ffv-bg)';
            let border = 'var(--ffv-border)';
            let textColor = 'var(--foreground)';

            if (revealed) {
              if (isCorrect) {
                bg = 'color-mix(in srgb, var(--ffv-green) 12%, transparent)';
                border = 'var(--ffv-green)';
                textColor = 'var(--ffv-green)';
              } else if (isChosen && !isCorrect) {
                bg = 'color-mix(in srgb, #f78166 12%, transparent)';
                border = '#f78166';
                textColor = '#f78166';
              }
            } else if (isChosen) {
              bg = `color-mix(in srgb, ${card.trailColor} 12%, transparent)`;
              border = card.trailColor;
            }

            return (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(i)}
                disabled={revealed}
                className="w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all"
                style={{
                  background: bg,
                  border: `1px solid ${border}`,
                  color: textColor,
                  cursor: revealed ? 'default' : 'pointer',
                  opacity: revealed && !isCorrect && !isChosen ? 0.5 : 1,
                }}
              >
                <span className="font-mono mr-2.5" style={{ color: textColor, opacity: 0.6, fontSize: 11 }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {revealed && (
          <div
            className="px-6 py-4"
            style={{ borderTop: '1px solid var(--ffv-border)', background: 'var(--ffv-bg)' }}
          >
            {timedOut ? (
              <p className="text-sm mb-3" style={{ color: '#f78166' }}>⏱ Tempo esgotado!</p>
            ) : selected === card.correct ? (
              <p className="text-sm mb-3" style={{ color: 'var(--ffv-green)' }}>✓ Correto! +5 XP</p>
            ) : (
              <p className="text-sm mb-3" style={{ color: '#f78166' }}>✗ Errou.</p>
            )}
            <p className="text-xs mb-4 leading-relaxed" style={{ color: 'var(--ffv-muted)' }}>
              {card.explanation}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['again', 'hard', 'good', 'easy'] as const).map(q => (
                <button
                  key={q}
                  type="button"
                  onClick={() => onNext(q)}
                  className="py-2 rounded-lg font-semibold text-xs transition-all hover:opacity-90"
                  style={{
                    background: q === 'again' ? '#f78166' : q === 'hard' ? '#e3b341' : q === 'good' ? 'var(--ffv-blue)' : 'var(--ffv-green)',
                    color: '#fff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {q === 'again' ? '↩ Errei' : q === 'hard' ? '😓 Difícil' : q === 'good' ? '✓ Bem' : '⚡ Fácil'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Finished Panel ─── */

function FinishedPanel({
  stats,
  onRestart,
}: {
  stats: SessionStats;
  onRestart: () => void;
}) {
  const accuracy = stats.total === 0 ? 0 : Math.round((stats.correct / stats.total) * 100);
  return (
    <div className="text-center space-y-6">
      <div
        className="rounded-2xl p-8"
        style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      >
        <div className="text-5xl mb-4">{accuracy >= 80 ? '🏆' : accuracy >= 50 ? '💪' : '📚'}</div>
        <h2 className="text-2xl font-bold mb-2">Maratona concluída!</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>
          Sessão de {stats.total} cards finalizada.
        </p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-xl p-4" style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--ffv-blue)' }}>{stats.total}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>Cards revisados</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--ffv-green)' }}>{accuracy}%</div>
            <div className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>Precisão</div>
          </div>
          <div className="rounded-xl p-4" style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}>
            <div className="text-2xl font-bold" style={{ color: 'var(--ffv-gold)' }}>+{stats.xpGained}</div>
            <div className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>XP ganho</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="px-6 py-3 rounded-xl font-bold text-sm"
            style={{ background: 'var(--ffv-blue)', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            Nova sessão →
          </button>
          <Link
            href="/progresso"
            className="px-6 py-3 rounded-xl font-bold text-sm inline-block"
            style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          >
            Ver progresso
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ onConfig }: { onConfig: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-xl font-bold mb-2">Todos revisados!</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--ffv-muted)' }}>Nenhum card restante nesta configuração.</p>
      <button
        type="button"
        onClick={onConfig}
        className="px-6 py-3 rounded-xl font-bold text-sm"
        style={{ background: 'var(--ffv-blue)', color: '#fff', border: 'none', cursor: 'pointer' }}
      >
        Nova configuração
      </button>
    </div>
  );
}
