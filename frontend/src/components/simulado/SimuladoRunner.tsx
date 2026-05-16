'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  type SimuladoAttempt,
  type SimuladoQuestion,
  getSimulado,
  getAttempt,
  saveAttempt,
  getExplanationText,
  scoreAttempt,
} from '@/lib/simulados';
import { fetchRandomQuestions } from '@/lib/clf-bank';
import { useAuth } from '@/hooks/useAuth';
import { idFromSlug } from '@/components/SimuladoCard';
import { TutorChat } from './TutorChat';
import { FEATURES } from '@/lib/features';
import { STORAGE_KEYS } from '@/lib/constants';
import { getJSON, setJSON, removeKey } from '@/lib/storage';
import { SimuladoTimerSchema } from '@/lib/schemas';

interface Props {
  slug: string;
}

type Mode = 'prova' | 'estudo';

// Chave dinâmica de localStorage para o conjunto de questões sorteadas de um
// simulado em andamento. Não cabe no enum `StorageKey` (literal union), então
// é tratada via cast — fora do registro de chaves conhecidas.
const simQsKey = (id: string) => `ffv_sim_qs_${id}` as unknown as import('@/lib/constants').StorageKey;

export function SimuladoRunner({ slug }: Props) {
  const router = useRouter();
  const { isLoggedIn, requireLogin } = useAuth();
  const simuladoId = idFromSlug(slug);
  const simulado = getSimulado(simuladoId);

  const [attempt, setAttempt] = useState<SimuladoAttempt | null>(null);
  const [questions, setQuestions] = useState<SimuladoQuestion[]>([]);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState<Mode>('estudo');
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [reviewFlags, setReviewFlags] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [showTutor, setShowTutor] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Gate inicial: precisa estar logado
  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin('fazer o simulado').catch(() => router.push(`/simulados/${slug}`));
    }
  }, [isLoggedIn, requireLogin, router, slug]);

  // Hidrata ou cria attempt + hidrata timer persistido
  useEffect(() => {
    if (!simulado || !isLoggedIn) return;
    let current = getAttempt(simuladoId);
    if (!current || current.finishedAt) {
      // Nova attempt: limpa questões sorteadas anteriores para novo sorteio
      removeKey(simQsKey(simuladoId));
      current = {
        simuladoId,
        startedAt: new Date().toISOString(),
        answers: {},
      };
      saveAttempt(current);
    }
    setAttempt(current);
    setReviewFlags(new Set(current.reviewFlags ?? []));
    const initialConfirmed: Record<string, boolean> = {};
    for (const qid of Object.keys(current.answers)) initialConfirmed[qid] = true;
    setConfirmed(initialConfirmed);

    // Timer: usa deadline persistido se existir e for válido
    const raw = getJSON<unknown>(STORAGE_KEYS.SIMULADO_TIMER, null);
    const parsed = SimuladoTimerSchema.safeParse(raw);
    if (parsed.success && parsed.data.simuladoId === simuladoId) {
      const remaining = Math.max(0, Math.floor((parsed.data.deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
    } else {
      const deadline = Date.now() + simulado.timeLimitMin * 60 * 1000;
      setJSON(STORAGE_KEYS.SIMULADO_TIMER, { simuladoId, deadline });
      setTimeLeft(simulado.timeLimitMin * 60);
    }
    setHydrated(true);
  }, [simulado, simuladoId, isLoggedIn]);

  // Carrega questões do banco Postgres — server sorteia N e devolve.
  useEffect(() => {
    if (!simulado || !isLoggedIn) return;

    async function load() {
      const storedIds = getJSON<string[] | null>(simQsKey(simuladoId), null);
      try {
        if (storedIds && storedIds.length > 0) {
          // Retoma attempt em andamento: busca exatamente os IDs já sorteados.
          const { fetchQuestionsByIds } = await import('@/lib/clf-bank');
          const fetched = await fetchQuestionsByIds(storedIds, simuladoId);
          if (fetched.length > 0) {
            setQuestions(fetched);
            return;
          }
        }
        // Nova attempt: backend sorteia N questões via ORDER BY RANDOM().
        const fresh = await fetchRandomQuestions({
          simuladoId,
          count: simulado!.questionCount,
        });
        if (fresh.length === 0) {
          throw new Error('banco vazio — rode o seed-questions no backend');
        }
        setJSON(simQsKey(simuladoId), fresh.map(q => q.id));
        setQuestions(fresh);
      } catch (err) {
        console.error('SimuladoRunner: falha ao carregar questões do backend', err);
        // Sem fallback estático — questões são autoridade do banco.
        setQuestions([]);
      } finally {
        setQuestionsReady(true);
      }
    }

    load();
  }, [simulado, simuladoId, isLoggedIn]);

  // Tick do timer — wall-clock based
  useEffect(() => {
    if (!hydrated) return;
    const raw = getJSON<unknown>(STORAGE_KEYS.SIMULADO_TIMER, null);
    const parsed = SimuladoTimerSchema.safeParse(raw);
    if (!parsed.success) return;
    const deadline = parsed.data.deadline;
    const id = window.setInterval(() => {
      const remaining = Math.max(0, Math.floor((deadline - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        window.clearInterval(id);
        finalize();
      }
    }, 500);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  if (!simulado) {
    return <p className="px-6 py-20 text-center">Simulado não encontrado.</p>;
  }
  if (!isLoggedIn || !attempt || !questionsReady || questions.length === 0) {
    return <p className="px-6 py-20 text-center">Carregando questões…</p>;
  }
  if (simulado.comingSoon) {
    return <p className="px-6 py-20 text-center">Este simulado ainda não está disponível.</p>;
  }

  const currentQuestion = questions[currentIndex];

  function selectOption(optionId: string) {
    if (!attempt || confirmed[currentQuestion.id]) return;
    const next: SimuladoAttempt = {
      ...attempt,
      answers: { ...attempt.answers, [currentQuestion.id]: optionId },
    };
    setAttempt(next);
    saveAttempt(next);
  }

  function confirmAnswer() {
    if (!attempt || !attempt.answers[currentQuestion.id]) return;
    setConfirmed(prev => ({ ...prev, [currentQuestion.id]: true }));
  }

  function toggleReview() {
    const next = new Set(reviewFlags);
    if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
    else next.add(currentQuestion.id);
    setReviewFlags(next);
    if (attempt) {
      const withFlags: SimuladoAttempt = { ...attempt, reviewFlags: Array.from(next) };
      setAttempt(withFlags);
      saveAttempt(withFlags);
    }
  }

  function goTo(idx: number) {
    if (idx >= 0 && idx < questions.length) setCurrentIndex(idx);
  }

  function finalize() {
    if (!attempt) return;
    const sim = { ...simulado!, questions };
    const { score, passed } = scoreAttempt(sim, attempt);
    const finished: SimuladoAttempt = {
      ...attempt,
      finishedAt: new Date().toISOString(),
      score,
      passed,
    };
    saveAttempt(finished);
    removeKey(STORAGE_KEYS.SIMULADO_TIMER);
    router.push(`/simulados/${slug}/resultado`);
  }

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;
  const accent = '#f78166';
  const showExplanation = mode === 'estudo' && confirmed[currentQuestion.id];
  const answered = !!attempt.answers[currentQuestion.id];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href={`/simulados/${slug}`} className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
            ← Sair
          </Link>
          <h1 className="text-base font-bold">{simulado.title}</h1>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center gap-1 text-xs rounded-full p-0.5"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            {(['estudo', 'prova'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className="px-3 py-1 rounded-full"
                style={{
                  background: mode === m ? accent : 'transparent',
                  color: mode === m ? '#0d1117' : 'var(--ffv-muted)',
                  fontWeight: mode === m ? 700 : 400,
                }}
              >
                {m === 'estudo' ? '📘 Estudo' : '🎯 Prova'}
              </button>
            ))}
          </div>
          <div
            className="text-sm font-mono font-bold tabular-nums px-3 py-1 rounded-full"
            style={{
              background: timeLeft <= 60 ? 'rgba(247,129,102,0.18)' : 'var(--ffv-bg2)',
              color: timeLeft <= 60 ? 'var(--ffv-red)' : 'var(--foreground)',
              border: '1px solid var(--ffv-border)',
            }}
          >
            ⏱ {String(mm).padStart(2, '0')}:{String(ss).padStart(2, '0')}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        {/* Painel esquerdo — questão */}
        <section>
          <>
            <div className="mb-5">
                <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--ffv-muted)' }}>
                  Questão {currentIndex + 1} de {questions.length} · {currentQuestion.topic}
                </p>
                <p className="text-base md:text-lg font-semibold leading-relaxed">{currentQuestion.stem}</p>
              </div>

              <div className="flex flex-col gap-2 mb-5">
                {currentQuestion.options.map(opt => {
                  const selected = attempt.answers[currentQuestion.id] === opt.id;
                  const isCorrect = showExplanation && opt.id === currentQuestion.correctId;
                  const isWrongSelected = showExplanation && selected && opt.id !== currentQuestion.correctId;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => selectOption(opt.id)}
                      disabled={confirmed[currentQuestion.id]}
                      className="text-left px-4 py-3 rounded-lg text-sm transition-all disabled:cursor-default"
                      style={{
                        background:
                          isCorrect ? 'rgba(63,185,80,0.14)'
                          : isWrongSelected ? 'rgba(247,129,102,0.14)'
                          : selected ? `${accent}20`
                          : 'var(--ffv-bg2)',
                        border: `1px solid ${
                          isCorrect ? 'rgba(63,185,80,0.4)'
                          : isWrongSelected ? 'rgba(247,129,102,0.4)'
                          : selected ? accent
                          : 'var(--ffv-border)'
                        }`,
                        color: isCorrect ? 'var(--ffv-green)' : isWrongSelected ? 'var(--ffv-red)' : 'var(--foreground)',
                      }}
                    >
                      <b>{opt.id}.</b> {opt.text}
                      {isCorrect && ' ✓'}
                    </button>
                  );
                })}
              </div>

              {/* Ações */}
              {!confirmed[currentQuestion.id] ? (
                <button
                  onClick={confirmAnswer}
                  disabled={!answered}
                  className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
                  style={{ background: accent, color: '#0d1117' }}
                >
                  {answered ? 'Confirmar resposta' : 'Selecione uma alternativa'}
                </button>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  <button
                    onClick={() => goTo(currentIndex + 1)}
                    className="flex-1 py-3 rounded-xl font-semibold text-sm"
                    style={{ background: accent, color: '#0d1117' }}
                  >
                    {currentIndex < questions.length - 1 ? 'Próxima →' : 'Revisar tudo'}
                  </button>
                  {FEATURES.tutorAI ? (
                    <button
                      onClick={() => setShowTutor(true)}
                      className="px-4 py-3 rounded-xl font-semibold text-sm"
                      style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
                    >
                      💬 Pergunte ao tutor
                    </button>
                  ) : (
                    <button
                      disabled
                      title="Em breve"
                      className="px-4 py-3 rounded-xl font-semibold text-sm opacity-50 cursor-not-allowed"
                      style={{ background: 'var(--ffv-bg2)', color: 'var(--ffv-muted)', border: '1px solid var(--ffv-border)' }}
                    >
                      💬 Tutor IA (em breve)
                    </button>
                  )}
                </div>
              )}

              {/* Explicação (modo estudo) */}
              {showExplanation && (
                <div
                  className="mt-6 p-5 rounded-xl"
                  style={{
                    background: 'color-mix(in srgb, var(--ffv-blue) 8%, var(--ffv-bg2))',
                    border: '1px solid color-mix(in srgb, var(--ffv-blue) 30%, transparent)',
                  }}
                >
                  <p className="text-xs font-bold mb-2" style={{ color: 'var(--ffv-blue)' }}>
                    💡 Explicação do tutor
                  </p>
                  <p className="text-sm leading-relaxed">{getExplanationText(currentQuestion.explanation)}</p>
                </div>
              )}
          </>
        </section>

        {/* Painel direito — grid + flag */}
        <aside className="md:border-l md:pl-6" style={{ borderColor: 'var(--ffv-border)' }}>
          <div className="sticky top-20">
            <p className="text-xs font-semibold mb-3" style={{ color: 'var(--ffv-muted)' }}>
              Navegação
            </p>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {questions.map((q, i) => {
                const isCurrent = i === currentIndex;
                const isAnswered = !!attempt.answers[q.id];
                const isFlagged = reviewFlags.has(q.id);
                let bg = 'var(--ffv-bg2)';
                let border = 'var(--ffv-border)';
                let color = 'var(--ffv-muted)';
                if (isFlagged) {
                  bg = 'rgba(247,129,102,0.15)'; border = 'rgba(247,129,102,0.4)'; color = accent;
                } else if (isAnswered) {
                  bg = 'rgba(63,185,80,0.15)'; border = 'rgba(63,185,80,0.4)'; color = 'var(--ffv-green)';
                }
                if (isCurrent) {
                  bg = accent; border = accent; color = '#0d1117';
                }
                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(i)}
                    className="text-xs font-mono w-9 h-9 rounded-md transition-all font-semibold"
                    style={{ background: bg, border: `1px solid ${border}`, color }}
                    aria-label={`Questão ${i + 1}`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={toggleReview}
              className="w-full text-xs px-3 py-2 rounded-lg mb-2"
              style={{
                background: reviewFlags.has(currentQuestion.id) ? `${accent}18` : 'var(--ffv-bg2)',
                color: reviewFlags.has(currentQuestion.id) ? accent : 'var(--foreground)',
                border: `1px solid ${reviewFlags.has(currentQuestion.id) ? accent + '40' : 'var(--ffv-border)'}`,
              }}
            >
              {reviewFlags.has(currentQuestion.id) ? '🚩 Remover marca' : '🚩 Marcar para revisão'}
            </button>

            <button
              onClick={finalize}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg"
              style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
            >
              Finalizar simulado
            </button>

            <div className="mt-4 text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
              <p>🟢 Respondida · 🟡 Atual · 🔴 Marcada</p>
              <p className="mt-1">Progresso salvo automaticamente.</p>
            </div>
          </div>
        </aside>
      </div>

      {showTutor && FEATURES.tutorAI && (
        <TutorChat
          question={currentQuestion}
          onClose={() => setShowTutor(false)}
        />
      )}
    </div>
  );
}
