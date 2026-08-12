'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { BackButton } from '@/components/BackButton';
import { useRouter } from 'next/navigation';
import { getSimulado } from '@/lib/simulados';
import {
  startOrResumeAttempt,
  answerQuestion as apiAnswerQuestion,
  toggleFlag as apiToggleFlag,
  finishAttempt as apiFinishAttempt,
  type AttemptDTO,
  type QuestionDTO,
} from '@/lib/simulados-api';
import { stashResult } from '@/lib/simulado-result-bridge';
import { hasBackend } from '@/lib/api-client';
import { useAuth } from '@/hooks/useAuth';
import { idFromSlug } from '@/components/SimuladoCard';

interface Props {
  slug: string;
}

// Máquina de estados explícita — closes achado P0-F/UX-1: antes, "não
// logado", "carregando", "indisponível" e "falha ao carregar" colapsavam
// todos na mesma frase "Carregando questões…", sem saída para o caso de erro.
type ViewState =
  | { kind: 'loading' }
  | { kind: 'not-logged' }
  | { kind: 'unavailable' }
  | { kind: 'no-backend' }
  | { kind: 'error'; message: string }
  | { kind: 'ready' };

export function SimuladoRunner({ slug }: Props) {
  const router = useRouter();
  const { isLoggedIn, requireLogin } = useAuth();
  const simuladoId = idFromSlug(slug);
  // O banco Postgres usa outro id (`aws-clf`, não `simulado-aws-practitioner`).
  // Consultar a API com o id do catálogo devolve zero linhas SEM erro — foi
  // exatamente o defeito que deixou o fluxo cronometrado sem questões.
  const simulado = getSimulado(simuladoId);
  const dbBankId = simulado?.dbBankId ?? simuladoId;

  const [view, setView] = useState<ViewState>({ kind: 'loading' });
  const [attempt, setAttempt] = useState<AttemptDTO | null>(null);
  const [questions, setQuestions] = useState<QuestionDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});
  const [reviewFlags, setReviewFlags] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [finishing, setFinishing] = useState(false);
  // finalize() é chamado tanto pelo timer quanto pelo botão — trava contra
  // disparo duplo (achado 3.8: dois cliques/estouro simultâneo do timer).
  const finalizingRef = useRef(false);

  // Gate inicial: precisa estar logado.
  useEffect(() => {
    if (!isLoggedIn) {
      setView({ kind: 'not-logged' });
      requireLogin('fazer o simulado').catch(() => router.push(`/simulados/${slug}`));
      return;
    }
    if (!hasBackend()) {
      // A prova cronometrada é server-authoritative por design — sem
      // backend real não há como sortear/pontuar com integridade. Não faz
      // sentido simular isso localmente (seria reintroduzir o problema que
      // este componente existe para fechar).
      setView({ kind: 'no-backend' });
      return;
    }
    if (!simulado) {
      setView({ kind: 'unavailable' });
      return;
    }
    if (simulado.comingSoon) {
      setView({ kind: 'unavailable' });
      return;
    }

    let cancelled = false;
    startOrResumeAttempt(dbBankId)
      .then(res => {
        if (cancelled) return;
        setAttempt(res.attempt);
        setQuestions(res.attempt.questions ?? []);
        setAnswers(res.attempt.answers ?? {});
        setReviewFlags(new Set(res.attempt.flagged ?? []));
        const initialConfirmed: Record<string, boolean> = {};
        for (const qid of Object.keys(res.attempt.answers ?? {})) initialConfirmed[qid] = true;
        setConfirmed(initialConfirmed);
        setTimeLeft(res.attempt.timeLeftSec);
        setView({ kind: 'ready' });
      })
      .catch(err => {
        if (cancelled) return;
        console.error('SimuladoRunner: falha ao iniciar/retomar tentativa', err);
        setView({ kind: 'error', message: err instanceof Error ? err.message : 'Falha desconhecida' });
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, simuladoId]);

  // Tick do timer — server-authoritative: o deadline vem do servidor
  // (attempt.deadlineAt / timeLeftSec no início), o cliente só conta pra
  // baixo visualmente. finalize() sempre lê o estado ATUAL (via refs
  // implícitos do closure de render, não um snapshot congelado na
  // hidratação) — é a correção do P0 em que estourar o tempo pontuava
  // com um conjunto de respostas desatualizado.
  useEffect(() => {
    if (view.kind !== 'ready') return;
    const id = window.setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          window.clearInterval(id);
          finalize();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.kind]);

  async function finalize() {
    if (!attempt || finalizingRef.current) return;
    finalizingRef.current = true;
    setFinishing(true);
    try {
      const { score, weakTopics } = await apiFinishAttempt(attempt.id);
      stashResult(simuladoId, {
        attemptId: attempt.id,
        simuladoId,
        score,
        weakTopics,
        questionIds: questions.map(q => q.id),
        answers,
        finishedAt: new Date().toISOString(),
      });
      router.push(`/simulados/${slug}/resultado`);
    } catch (err) {
      console.error('SimuladoRunner: falha ao finalizar tentativa', err);
      finalizingRef.current = false;
      setFinishing(false);
      setView({ kind: 'error', message: 'Não foi possível finalizar a prova. Tente novamente.' });
    }
  }

  // ─── Estados de carga/erro (achado P0-F: antes, um só "Carregando…" pra tudo) ───

  if (view.kind === 'not-logged' || view.kind === 'loading' && !isLoggedIn) {
    return (
      <div className="px-6 py-20 text-center">
        <p style={{ color: 'var(--ffv-muted)' }}>Faça login para continuar.</p>
      </div>
    );
  }
  if (view.kind === 'no-backend') {
    return (
      <div className="px-6 py-20 text-center max-w-md mx-auto">
        <p className="mb-2">A prova cronometrada precisa do servidor real.</p>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Use o <Link href={`/simulados/${slug}`} style={{ color: 'var(--ffv-blue)' }}>modo de estudo</Link> enquanto isso.
        </p>
      </div>
    );
  }
  if (view.kind === 'unavailable') {
    return <p className="px-6 py-20 text-center">Este simulado ainda não está disponível.</p>;
  }
  if (view.kind === 'error') {
    return (
      <div className="px-6 py-20 text-center max-w-md mx-auto">
        <p className="mb-4">Não conseguimos carregar a prova agora.</p>
        <p className="text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>{view.message}</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)' }}
          >
            Tentar novamente
          </button>
          <Link href={`/simulados/${slug}`} className="px-4 py-2 rounded-lg text-sm" style={{ color: 'var(--ffv-muted)' }}>
            Voltar ao catálogo
          </Link>
        </div>
      </div>
    );
  }
  if (view.kind === 'loading' || !simulado || !attempt || questions.length === 0) {
    return (
      <div className="px-6 py-20 text-center" role="status" aria-live="polite" aria-label="Carregando prova">
        <p style={{ color: 'var(--ffv-muted)' }}>Carregando questões…</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const accent = '#f78166';
  const answered = !!answers[currentQuestion.id];

  function selectOption(optionId: string) {
    if (!attempt || confirmed[currentQuestion.id]) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
    apiAnswerQuestion(attempt.id, currentQuestion.id, optionId).catch(err =>
      console.error('SimuladoRunner: falha ao registrar resposta', err)
    );
  }

  function confirmAnswer() {
    if (!answers[currentQuestion.id]) return;
    setConfirmed(prev => ({ ...prev, [currentQuestion.id]: true }));
  }

  function toggleReview() {
    if (!attempt) return;
    const next = new Set(reviewFlags);
    if (next.has(currentQuestion.id)) next.delete(currentQuestion.id);
    else next.add(currentQuestion.id);
    setReviewFlags(next);
    apiToggleFlag(attempt.id, currentQuestion.id).catch(err =>
      console.error('SimuladoRunner: falha ao marcar revisão', err)
    );
  }

  function goTo(idx: number) {
    if (idx >= 0 && idx < questions.length) setCurrentIndex(idx);
  }

  const mm = Math.floor(timeLeft / 60);
  const ss = timeLeft % 60;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <BackButton href={`/simulados/${slug}`} className="inline-flex items-center gap-1.5 text-xs">
            Sair
          </BackButton>
          <h1 className="text-base font-bold">{simulado.title}</h1>
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

      <div className="grid md:grid-cols-[1fr_280px] gap-6">
        {/* Painel esquerdo — questão */}
        <section>
          <div className="mb-5">
            <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--ffv-muted)' }}>
              Questão {currentIndex + 1} de {questions.length} · {currentQuestion.topic}
            </p>
            <p className="text-base md:text-lg font-semibold leading-relaxed">{currentQuestion.stem}</p>
          </div>

          <div className="flex flex-col gap-2 mb-5">
            {currentQuestion.options.map(opt => {
              const selected = answers[currentQuestion.id] === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => selectOption(opt.id)}
                  disabled={confirmed[currentQuestion.id]}
                  className="text-left px-4 py-3 rounded-lg text-sm transition-all disabled:cursor-default"
                  style={{
                    background: selected ? `${accent}20` : 'var(--ffv-bg2)',
                    border: `1px solid ${selected ? accent : 'var(--ffv-border)'}`,
                    color: 'var(--foreground)',
                  }}
                >
                  <b>{opt.id}.</b> {opt.text}
                </button>
              );
            })}
          </div>

          {/* Sem gabarito nem explicação aqui de propósito: a prova é
              server-authoritative e a correção só é revelada depois do
              finish, na tela de resultado. */}
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
            <button
              onClick={() => goTo(currentIndex + 1)}
              disabled={currentIndex >= questions.length - 1}
              className="w-full py-3 rounded-xl font-semibold text-sm disabled:opacity-40"
              style={{ background: accent, color: '#0d1117' }}
            >
              {currentIndex < questions.length - 1 ? 'Próxima →' : 'Última questão — use a navegação ao lado'}
            </button>
          )}
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
                const isAnswered = !!answers[q.id];
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
              disabled={finishing}
              className="w-full text-xs font-semibold px-3 py-2 rounded-lg disabled:opacity-50"
              style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
            >
              {finishing ? 'Finalizando…' : 'Finalizar simulado'}
            </button>

            <div className="mt-4 text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
              <p>🟢 Respondida · 🟡 Atual · 🔴 Marcada</p>
              <p className="mt-1">Progresso salvo no servidor a cada resposta.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
