'use client';

/**
 * SimuladoRunner — runner genérico de simulado de base (sem timer).
 *
 * UX:
 *   - Lista todas as questões em sequência (1 por vez ou roladas em página única)
 *   - Usuário responde cada uma → seleciona uma opção
 *   - Submeter no final → mostra resultado, % de acerto e por tópico
 *   - Após submit: cada questão revela a resposta correta + explicação completa
 *
 * Salva progresso em localStorage (chave por simulado slug).
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

export interface SimuladoQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  /**
   * Dica opcional — aponta o conceito sem entregar a resposta. Usuário clica
   * em "💡 Pedir dica" pra revelar antes de marcar uma alternativa.
   */
  hint?: string;
}

export interface SimuladoMeta {
  title: string;
  description: string;
  totalQuestions: number;
  /** Score mínimo (em %) considerado "aprovado". */
  passingScore: number;
  estimatedMinutes: number;
}

interface Props {
  slug: string;
  questions: SimuladoQuestion[];
  meta: SimuladoMeta;
}

interface SimState {
  answers: Record<string, number>;   // qid -> option index
  /** IDs das questões cuja dica foi revelada (não some após responder). */
  hintsRevealed: string[];
  submitted: boolean;
  startedAt: string;
  finishedAt?: string;
}

function storageKey(slug: string) {
  return `ffv_sim_${slug}`;
}

function loadState(slug: string): SimState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(storageKey(slug));
    if (!raw) return null;
    return JSON.parse(raw) as SimState;
  } catch {
    return null;
  }
}

function saveState(slug: string, state: SimState) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(state));
  } catch {
    /* ignore quota */
  }
}

export function SimuladoRunner({ slug, questions, meta }: Props) {
  const [state, setState] = useState<SimState>(() => ({
    answers: {},
    hintsRevealed: [],
    submitted: false,
    startedAt: new Date().toISOString(),
  }));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const loaded = loadState(slug);
    if (loaded) setState({ ...loaded, hintsRevealed: loaded.hintsRevealed ?? [] });
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (hydrated) saveState(slug, state);
  }, [state, slug, hydrated]);

  const answeredCount = Object.keys(state.answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const score = useMemo(() => {
    if (!state.submitted) return null;
    let correct = 0;
    const byTopic: Record<string, { correct: number; total: number }> = {};
    for (const q of questions) {
      byTopic[q.topic] ??= { correct: 0, total: 0 };
      byTopic[q.topic].total += 1;
      if (state.answers[q.id] === q.correct) {
        correct += 1;
        byTopic[q.topic].correct += 1;
      }
    }
    const pct = Math.round((correct / questions.length) * 100);
    return { correct, total: questions.length, pct, byTopic };
  }, [state, questions]);

  function selectAnswer(qid: string, idx: number) {
    if (state.submitted) return;
    setState(s => ({ ...s, answers: { ...s.answers, [qid]: idx } }));
  }

  function revealHint(qid: string) {
    if (state.hintsRevealed.includes(qid)) return;
    setState(s => ({ ...s, hintsRevealed: [...s.hintsRevealed, qid] }));
  }

  function submit() {
    if (answeredCount < questions.length) {
      const ok = confirm(
        `Você respondeu ${answeredCount}/${questions.length} questões. As não respondidas serão contadas como erradas. Submeter mesmo assim?`,
      );
      if (!ok) return;
    }
    setState(s => ({ ...s, submitted: true, finishedAt: new Date().toISOString() }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function reset() {
    if (!confirm('Recomeçar o simulado? Suas respostas atuais serão apagadas.')) return;
    const fresh: SimState = {
      answers: {},
      hintsRevealed: [],
      submitted: false,
      startedAt: new Date().toISOString(),
    };
    setState(fresh);
    saveState(slug, fresh);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  return (
    <div
      className="min-h-screen px-6 lg:px-10"
      style={{
        background: 'var(--ffv-bg)',
        paddingTop: 'clamp(96px, 12vw, 144px)',
        paddingBottom: 'clamp(80px, 10vw, 128px)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <Link
          href="/medicina-veterinaria"
          className="inline-flex items-center gap-1.5 text-xs font-mono mb-6"
          style={{ color: 'var(--ffv-muted)', letterSpacing: '0.08em', textDecoration: 'none' }}
        >
          ← VOLTAR PARA MEDICINA VETERINÁRIA
        </Link>

        <header className="mb-10">
          <p
            className="font-mono uppercase text-[11px] mb-3"
            style={{ color: 'var(--ffv-blue)', letterSpacing: '0.16em', fontWeight: 700 }}
          >
            Simulado · sem timer · {meta.totalQuestions} questões
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontWeight: 700,
              fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)',
              letterSpacing: '-0.022em',
              lineHeight: 1.1,
              color: 'var(--foreground)',
              marginBottom: 12,
            }}
          >
            {meta.title}
          </h1>
          <p style={{ fontSize: '1.02rem', color: 'var(--ffv-muted)', lineHeight: 1.65, maxWidth: 680 }}>
            {meta.description}
          </p>
          <p
            className="mt-4 text-xs italic"
            style={{ color: 'var(--ffv-muted)', fontFamily: 'var(--font-serif)' }}
          >
            Estimativa: ~{meta.estimatedMinutes} min. Aprovação: {meta.passingScore}% de acerto.
          </p>
        </header>

        {/* Resultado */}
        {state.submitted && score && (
          <section
            className="mb-12 p-6 rounded-2xl"
            style={{
              background: 'var(--ffv-bg2)',
              border: `2px solid ${score.pct >= meta.passingScore ? 'var(--ffv-green)' : 'var(--ffv-orange)'}`,
            }}
          >
            <p
              className="font-mono uppercase text-[11px] mb-2"
              style={{
                color: score.pct >= meta.passingScore ? 'var(--ffv-green)' : 'var(--ffv-orange)',
                letterSpacing: '0.16em',
                fontWeight: 700,
              }}
            >
              {score.pct >= meta.passingScore ? '✓ Aprovado' : '✗ Reprovado'} · {score.pct}%
            </p>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontWeight: 700,
                fontSize: '1.6rem',
                letterSpacing: '-0.018em',
                color: 'var(--foreground)',
                marginBottom: 16,
              }}
            >
              {score.correct} de {score.total} acertos
            </h2>
            <div className="grid sm:grid-cols-2 gap-3 mb-5">
              {Object.entries(score.byTopic).map(([topic, t]) => {
                const pct = Math.round((t.correct / t.total) * 100);
                return (
                  <div
                    key={topic}
                    className="p-3 text-sm"
                    style={{
                      background: 'var(--ffv-bg)',
                      border: '1px solid var(--ffv-border)',
                      borderLeft: `3px solid ${pct >= 70 ? 'var(--ffv-green)' : 'var(--ffv-orange)'}`,
                      borderRadius: 8,
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{topic}</span>
                      <span className="font-mono text-xs" style={{ color: 'var(--ffv-muted)' }}>
                        {t.correct}/{t.total} · {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={reset}
              className="text-xs font-semibold px-4 py-2"
              style={{
                background: 'transparent',
                border: '1px solid var(--ffv-border)',
                borderRadius: 8,
                color: 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              Recomeçar simulado
            </button>
          </section>
        )}

        {/* Barra de progresso (durante o simulado) */}
        {!state.submitted && (
          <div className="sticky top-[56px] z-10 py-3 mb-6" style={{ background: 'var(--ffv-bg)' }}>
            <div
              className="flex items-center justify-between text-xs mb-2"
              style={{ color: 'var(--ffv-muted)' }}
            >
              <span className="font-mono uppercase" style={{ letterSpacing: '0.08em' }}>
                Progresso
              </span>
              <span style={{ fontWeight: 600, color: 'var(--foreground)' }}>
                {answeredCount} / {questions.length} · {Math.round(progress)}%
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--ffv-bg2)' }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: 'linear-gradient(90deg, var(--ffv-blue), var(--ffv-green))',
                  borderRadius: 999,
                  transition: 'width 200ms ease',
                }}
              />
            </div>
          </div>
        )}

        {/* Lista de questões */}
        <ol className="flex flex-col gap-6 list-none p-0">
          {questions.map((q, qIdx) => {
            const userAnswer = state.answers[q.id];
            const isAnswered = userAnswer !== undefined;
            return (
              <li
                key={q.id}
                className="p-6"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: '1px solid var(--ffv-border)',
                  borderRadius: 12,
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <p
                    className="font-mono text-[10px] uppercase"
                    style={{ color: 'var(--ffv-blue)', letterSpacing: '0.14em' }}
                  >
                    Questão {String(qIdx + 1).padStart(3, '0')} · {q.topic}
                  </p>
                  <span
                    className="font-mono text-[9px] uppercase px-2 py-0.5 rounded"
                    style={{
                      background: 'var(--ffv-bg)',
                      color: 'var(--ffv-muted)',
                      letterSpacing: '0.08em',
                    }}
                  >
                    {q.difficulty}
                  </span>
                </div>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    letterSpacing: '-0.012em',
                    color: 'var(--foreground)',
                    lineHeight: 1.4,
                    marginBottom: 14,
                  }}
                >
                  {q.question}
                </h3>

                {/* Dica (opcional, clicável) */}
                {q.hint && (
                  <div className="mb-4">
                    {!state.hintsRevealed.includes(q.id) ? (
                      <button
                        type="button"
                        onClick={() => revealHint(q.id)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 transition-colors"
                        style={{
                          background: 'transparent',
                          border: '1px dashed var(--ffv-border)',
                          color: 'var(--ffv-muted)',
                          borderRadius: 6,
                          cursor: 'pointer',
                        }}
                        onMouseOver={e => {
                          e.currentTarget.style.borderColor = 'var(--ffv-blue)';
                          e.currentTarget.style.color = 'var(--foreground)';
                        }}
                        onMouseOut={e => {
                          e.currentTarget.style.borderColor = 'var(--ffv-border)';
                          e.currentTarget.style.color = 'var(--ffv-muted)';
                        }}
                      >
                        💡 Pedir dica
                      </button>
                    ) : (
                      <div
                        className="p-3 text-sm"
                        style={{
                          background: 'color-mix(in srgb, var(--ffv-blue) 6%, transparent)',
                          borderLeft: '3px solid var(--ffv-blue)',
                          borderRadius: 6,
                          color: 'var(--foreground)',
                          lineHeight: 1.65,
                        }}
                      >
                        <p
                          className="font-bold text-xs uppercase mb-1"
                          style={{ color: 'var(--ffv-blue)', letterSpacing: '0.08em' }}
                        >
                          💡 Dica
                        </p>
                        {q.hint}
                      </div>
                    )}
                  </div>
                )}

                <ul className="flex flex-col gap-2 mb-3">
                  {q.options.map((opt, idx) => {
                    const isSelected = userAnswer === idx;
                    const isCorrect = state.submitted && idx === q.correct;
                    const isWrongPicked = state.submitted && isSelected && idx !== q.correct;
                    return (
                      <li key={idx}>
                        <button
                          type="button"
                          onClick={() => selectAnswer(q.id, idx)}
                          disabled={state.submitted}
                          className="w-full text-left flex items-start gap-3 px-4 py-3 transition-colors"
                          style={{
                            background: isCorrect
                              ? 'color-mix(in srgb, var(--ffv-green) 10%, transparent)'
                              : isWrongPicked
                                ? 'color-mix(in srgb, var(--ffv-orange) 10%, transparent)'
                                : isSelected
                                  ? 'var(--ffv-bg)'
                                  : 'transparent',
                            border: '1px solid',
                            borderColor: isCorrect
                              ? 'var(--ffv-green)'
                              : isWrongPicked
                                ? 'var(--ffv-orange)'
                                : isSelected
                                  ? 'var(--foreground)'
                                  : 'var(--ffv-border)',
                            borderRadius: 8,
                            cursor: state.submitted ? 'default' : 'pointer',
                          }}
                        >
                          <span
                            className="font-mono text-xs font-bold flex-shrink-0 mt-0.5"
                            style={{ color: 'var(--ffv-muted)', minWidth: 18 }}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span
                            style={{ fontSize: 14, color: 'var(--foreground)', lineHeight: 1.55, flex: 1 }}
                          >
                            {opt}
                          </span>
                          {isCorrect && (
                            <span style={{ color: 'var(--ffv-green)', fontWeight: 800 }} aria-hidden>
                              ✓
                            </span>
                          )}
                          {isWrongPicked && (
                            <span style={{ color: 'var(--ffv-orange)', fontWeight: 800 }} aria-hidden>
                              ×
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
                {state.submitted && (
                  <div
                    className="mt-3 p-4 text-sm"
                    style={{
                      background:
                        userAnswer === q.correct
                          ? 'color-mix(in srgb, var(--ffv-green) 7%, transparent)'
                          : 'color-mix(in srgb, var(--ffv-orange) 7%, transparent)',
                      borderLeft: `3px solid ${userAnswer === q.correct ? 'var(--ffv-green)' : 'var(--ffv-orange)'}`,
                      borderRadius: 8,
                      color: 'var(--foreground)',
                      lineHeight: 1.7,
                    }}
                  >
                    <p
                      className="font-bold mb-1.5"
                      style={{ color: userAnswer === q.correct ? 'var(--ffv-green)' : 'var(--ffv-orange)' }}
                    >
                      {userAnswer === q.correct
                        ? '✓ Correto'
                        : userAnswer === undefined
                          ? '× Não respondida'
                          : '× Resposta incorreta'}
                    </p>
                    {q.explanation}
                  </div>
                )}
                {!isAnswered && !state.submitted && (
                  <p
                    className="text-xs mt-2 italic"
                    style={{ color: 'var(--ffv-muted)' }}
                  >
                    Selecione uma alternativa.
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        {/* Botão submeter */}
        {!state.submitted && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={submit}
              className="inline-flex items-center gap-2 px-8 py-4 text-sm font-bold"
              style={{
                background: 'var(--foreground)',
                color: 'var(--ffv-bg)',
                borderRadius: 12,
                cursor: 'pointer',
                boxShadow: '0 10px 28px -8px color-mix(in srgb, var(--foreground) 35%, transparent)',
              }}
            >
              Submeter simulado ({answeredCount}/{questions.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
