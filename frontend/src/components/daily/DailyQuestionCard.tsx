'use client';

/**
 * DailyQuestionCard — MVP da "Pergunta do Dia".
 *
 * Sorteia 1 pergunta diária do pool unificado (módulos visitados + simulados)
 * e renderiza um card interativo. Acerto soma 5 XP + atualiza SRS (good);
 * erro soma 1 XP + cria/marca card como again no SRS.
 *
 * Determinismo: a seed combina userId (ou 'anon') + today, então a mesma
 * pergunta aparece o dia inteiro mesmo com refresh.
 *
 * ## A amostra de simulado é buscada aqui, não lida do catálogo (ago/2026)
 *
 * Todo simulado com banco real guarda `questions: []` no catálogo — o banco
 * vive no Postgres. Sem buscar uma amostra pela API, o pool de um usuário SEM
 * nenhum `reviewCard` ainda (todo usuário novo) ficava vazio e o card inteiro
 * desaparecia da tela sem erro nenhum. Ver a nota completa em
 * `lib/random-question.ts`, em cima de `fetchSimuladoSample`.
 *
 * Cacheada em memória por dia — `fetchSimuladoSample` chama a API uma vez por
 * sessão de dia, não a cada render, e falha aberta (pool sem amostra, não card
 * quebrado) se o usuário não estiver logado ou a API estiver fora do ar.
 */

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { useAuth } from '@/hooks/useAuth';
import { buildPool, fetchSimuladoSample, pickDailyQuestion, type PoolQuestion } from '@/lib/random-question';
import { todayISO } from '@/lib/srs';

export function DailyQuestionCard() {
  const { state, answerDaily } = useGameState();
  const { user, isLoggedIn } = useAuth();
  const today = todayISO();

  const [simuladoSample, setSimuladoSample] = useState<PoolQuestion[]>([]);

  useEffect(() => {
    if (!isLoggedIn) return;
    let ativo = true;
    fetchSimuladoSample().then(sample => {
      if (ativo) setSimuladoSample(sample);
    });
    return () => {
      ativo = false;
    };
    // Refaz a busca uma vez por dia (chave `today` na dependência) — o mesmo
    // dia não deve reamostrar a cada remontagem do componente.
  }, [isLoggedIn, today]);

  const pool = useMemo(
    () => buildPool(state?.reviewCards, simuladoSample),
    [state?.reviewCards, simuladoSample],
  );
  const question = useMemo(() => {
    if (!state) return null;
    return pickDailyQuestion(state, pool, today, user?.id || user?.email || 'anon');
  }, [state, pool, today, user]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!state || !question) return null;

  const alreadyAnswered = state.dailyQuestion?.date === today && !!state.dailyQuestion?.answeredId;
  const displayAnsweredId = alreadyAnswered ? state.dailyQuestion!.answeredId! : (submitted ? selectedId : null);
  const displayCorrect = alreadyAnswered ? state.dailyQuestion!.correct : (submitted ? selectedId === question.correctId : null);
  const locked = alreadyAnswered || submitted;

  function handleSubmit() {
    if (!selectedId || submitted) return;
    setSubmitted(true);
    answerDaily({
      questionId: question!.id,
      answeredId: selectedId,
      correctId: question!.correctId,
      source: question!.source,
      hubId: question!.hubId,
      moduleSlug: question!.moduleSlug,
      stem: question!.stem,
      options: question!.options.map(o => o.text),
      correctIndex: question!.options.findIndex(o => o.id === question!.correctId),
      explanation: question!.explanation,
      topic: question!.topic,
    });
  }

  const difficultyLabel = { easy: 'Fácil', medium: 'Médio', hard: 'Difícil' }[question.difficulty];
  const difficultyColor = { easy: '#3fb950', medium: '#d29922', hard: '#f85149' }[question.difficulty];

  return (
    <div
      className="rounded-2xl overflow-hidden relative"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
        boxShadow: '0 8px 32px -12px rgba(247,129,102,0.18), 0 0 0 1px rgba(247,129,102,0.08)',
      }}
    >
      {/* Glow gradient no topo do card — destaca a seção sem deixá-la "pesada". */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(247,129,102,0.5), transparent)',
        }}
      />
      <div
        className="px-5 py-4 flex items-center justify-between"
        style={{
          borderBottom: '1px solid var(--ffv-border)',
          background: 'linear-gradient(180deg, rgba(247,129,102,0.06) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 20 }} aria-hidden>❓</span>
          <span className="font-bold text-sm">Pergunta do Dia</span>
          {(state.dailyQuestionStreak ?? 0) > 0 && (
            <span
              className="font-mono text-xs px-2 py-0.5 rounded-full"
              style={{
                background: 'color-mix(in srgb, var(--ffv-orange, #f85149) 14%, transparent)',
                color: 'var(--ffv-orange, #f85149)',
                border: '1px solid color-mix(in srgb, var(--ffv-orange, #f85149) 30%, transparent)',
              }}
            >
              🔥 {state.dailyQuestionStreak}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="font-mono uppercase text-[10px] px-2 py-0.5 rounded-full"
            style={{
              color: difficultyColor,
              border: `1px solid color-mix(in srgb, ${difficultyColor} 40%, transparent)`,
            }}
          >
            {difficultyLabel}
          </span>
          <span className="text-xs opacity-70 hidden sm:inline">{question.topic}</span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        <p className="text-sm leading-relaxed font-medium">{question.stem}</p>

        <div className="space-y-2">
          {question.options.map(opt => {
            const isSelected = displayAnsweredId === opt.id;
            const isCorrectOpt = opt.id === question.correctId;
            const showResult = locked;
            let border = '1px solid var(--ffv-border)';
            let bg = 'transparent';
            if (showResult) {
              if (isCorrectOpt) {
                border = '1px solid #3fb950';
                bg = 'color-mix(in srgb, #3fb950 10%, transparent)';
              } else if (isSelected && !isCorrectOpt) {
                border = '1px solid #f85149';
                bg = 'color-mix(in srgb, #f85149 10%, transparent)';
              }
            } else if (selectedId === opt.id) {
              border = '1px solid var(--ffv-blue)';
              bg = 'color-mix(in srgb, var(--ffv-blue) 8%, transparent)';
            }
            return (
              <button
                key={opt.id}
                type="button"
                disabled={locked}
                onClick={() => setSelectedId(opt.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors disabled:cursor-default"
                style={{ border, background: bg }}
              >
                <span className="font-mono opacity-60 mr-2">{opt.id}.</span>
                {opt.text}
              </button>
            );
          })}
        </div>

        {!locked && (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selectedId}
            className="w-full px-4 py-2 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-50"
            style={{
              background: 'var(--ffv-blue)',
              color: 'var(--ffv-bg)',
            }}
          >
            Confirmar resposta
          </button>
        )}

        {locked && (
          <div
            className="rounded-lg p-3 text-sm space-y-2"
            style={{
              background: displayCorrect
                ? 'color-mix(in srgb, #3fb950 8%, transparent)'
                : 'color-mix(in srgb, #f85149 8%, transparent)',
              border: `1px solid ${displayCorrect ? '#3fb950' : '#f85149'}`,
            }}
          >
            <div className="flex items-center gap-2 font-semibold">
              <span aria-hidden>{displayCorrect ? '✅' : '❌'}</span>
              <span>
                {displayCorrect ? 'Você acertou! +5 XP' : 'Não foi dessa vez. +1 XP + flashcard adicionado'}
              </span>
            </div>
            <p className="opacity-80 leading-relaxed text-xs">{question.explanation}</p>
            <div className="flex items-center justify-between gap-3 pt-1">
              {question.relatedSlug ? (
                <Link
                  href={`/aprenda/${question.relatedSlug}`}
                  className="text-xs font-mono underline opacity-80 hover:opacity-100"
                >
                  Estudar este tópico →
                </Link>
              ) : <span />}
              <span className="text-xs opacity-60">Próxima pergunta amanhã</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
