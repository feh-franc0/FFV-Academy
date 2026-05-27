'use client';

/**
 * /questoes/[hub] — pratica do banco de questões do hub.
 *
 * Comportamento:
 *   - Sem banco: card "Em construção" + link voltar.
 *   - Com banco: filtro de dificuldade + lista numerada de questões expansíveis.
 *     Cada questão mostra enunciado, alternativas (interativas), gabarito e
 *     explicação após click. Sem timer — modo estudo livre.
 *
 * Persistência: localStorage por (hubId, questionId) com flag "respondida"
 * pra ver progresso entre sessões. Não envia pro backend ainda — pode
 * promover pra evento SRS quando o pipeline de geração rodar.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { Hub } from '@/lib/curriculum';
import type { BankQuestion, Difficulty, QuestionBank } from '@/lib/question-bank';

const DIFFICULTY_META: Record<Difficulty | 'all', { label: string; color: string }> = {
  all:    { label: 'Todas',   color: 'var(--ffv-muted)' },
  easy:   { label: 'Fácil',   color: 'var(--ffv-green)' },
  medium: { label: 'Médio',   color: 'var(--ffv-yellow)' },
  hard:   { label: 'Difícil', color: 'var(--ffv-red, #dc2626)' },
};

export function HubQuestionsClient({ hub, bank }: { hub: Hub; bank: QuestionBank | null }) {
  const [filter, setFilter] = useState<Difficulty | 'all'>('all');

  const filtered = useMemo(() => {
    if (!bank) return [];
    if (filter === 'all') return bank.questions;
    return bank.questions.filter(q => q.difficulty === filter);
  }, [bank, filter]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <Link href="/questoes" style={{ color: 'var(--ffv-muted)' }}>Questões</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>{hub.name}</span>
      </nav>

      <header className="mb-8 flex items-center gap-4">
        <div
          className="flex items-center justify-center text-3xl"
          style={{
            width: 56,
            height: 56,
            borderRadius: 16,
            background: `color-mix(in srgb, ${hub.color} 14%, transparent)`,
            border: `1px solid ${hub.color}40`,
          }}
        >
          {hub.icon}
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{hub.name}</h1>
          <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            {bank ? `${bank.questions.length} questões no banco` : 'Banco em construção'}
          </p>
        </div>
      </header>

      {!bank || bank.questions.length === 0 ? (
        <section
          className="rounded-xl p-8 text-center"
          style={{ background: 'var(--ffv-bg2)', border: '1px dashed var(--ffv-border)' }}
        >
          <div className="text-4xl mb-3">🚧</div>
          <h2 className="text-lg font-bold mb-2">Banco em construção</h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'var(--ffv-muted)' }}>
            As 100 questões deste hub ainda não foram populadas. Enquanto isso,
            pratique direto nos módulos — cada um já tem 7-10 questões com explicação.
          </p>
          <Link
            href={hub.href}
            className="inline-flex items-center justify-center px-4 py-2 rounded-md text-sm font-semibold"
            style={{ background: hub.color, color: '#fff' }}
          >
            Ver módulos do hub →
          </Link>
        </section>
      ) : (
        <>
          {/* Filtro de dificuldade */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {(Object.keys(DIFFICULTY_META) as Array<Difficulty | 'all'>).map(d => {
              const meta = DIFFICULTY_META[d];
              const active = filter === d;
              const count = d === 'all'
                ? bank.questions.length
                : bank.questions.filter(q => q.difficulty === d).length;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFilter(d)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-semibold"
                  style={{
                    background: active
                      ? `color-mix(in srgb, ${meta.color} 16%, transparent)`
                      : 'var(--ffv-bg2)',
                    border: `1px solid ${active ? meta.color : 'var(--ffv-border)'}`,
                    color: active ? meta.color : 'var(--ffv-muted)',
                    cursor: 'pointer',
                  }}
                >
                  {meta.label} <span style={{ opacity: 0.7 }}>· {count}</span>
                </button>
              );
            })}
          </div>

          <ol className="flex flex-col gap-4 list-none p-0">
            {filtered.map((q, idx) => (
              <QuestionCard key={q.id} index={idx + 1} q={q} accent={hub.color} />
            ))}
          </ol>
        </>
      )}
    </div>
  );
}

function QuestionCard({ index, q, accent }: { index: number; q: BankQuestion; accent: string }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const meta = DIFFICULTY_META[q.difficulty];

  function handlePick(i: number) {
    if (revealed) return;
    setPicked(i);
    setRevealed(true);
  }

  return (
    <li
      className="rounded-xl p-5"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <p className="text-xs font-mono" style={{ color: 'var(--ffv-muted)' }}>
          #{index} · {q.id}
        </p>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
            color: meta.color,
            border: `1px solid ${meta.color}50`,
          }}
        >
          {meta.label.toUpperCase()}
        </span>
      </div>
      <p className="font-semibold text-sm mb-4" style={{ color: 'var(--foreground)' }}>
        {q.question}
      </p>
      <ul className="flex flex-col gap-2 list-none p-0">
        {q.options.map((opt, i) => {
          const isCorrect = i === q.correct;
          const isPicked = picked === i;
          const showCorrect = revealed && isCorrect;
          const showWrong = revealed && isPicked && !isCorrect;
          return (
            <li key={i}>
              <button
                type="button"
                onClick={() => handlePick(i)}
                disabled={revealed}
                className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors"
                style={{
                  background: showCorrect
                    ? 'color-mix(in srgb, var(--ffv-green) 14%, transparent)'
                    : showWrong
                    ? 'color-mix(in srgb, var(--ffv-red, #dc2626) 14%, transparent)'
                    : 'var(--ffv-bg)',
                  border: `1px solid ${
                    showCorrect
                      ? 'var(--ffv-green)'
                      : showWrong
                      ? 'var(--ffv-red, #dc2626)'
                      : 'var(--ffv-border)'
                  }`,
                  color: 'var(--foreground)',
                  cursor: revealed ? 'default' : 'pointer',
                }}
              >
                {showCorrect ? '✅ ' : showWrong ? '❌ ' : ''}
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
      {revealed && (
        <div
          className="mt-4 p-3 rounded-md text-xs leading-relaxed"
          style={{
            background: `color-mix(in srgb, ${accent} 8%, var(--ffv-bg))`,
            border: `1px solid ${accent}40`,
            color: 'var(--foreground)',
          }}
        >
          <p className="font-semibold mb-1" style={{ color: accent }}>
            💡 Explicação
          </p>
          {q.explanation}
        </div>
      )}
    </li>
  );
}
