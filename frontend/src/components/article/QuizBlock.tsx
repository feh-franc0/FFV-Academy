/**
 * QuizBlock — quiz interativo single-question pra blocos do CMS.
 *
 * Renderizado pelo BlockRenderer na rota dinâmica `/aprenda/[slug]`. A versão
 * legacy (`ModuleLayout`) tem um quiz multi-pergunta agregado no fim do módulo
 * com XP, badges e time-attack — pesado demais pra um bloco isolado. Aqui o
 * objetivo é: usuário lê o bloco quiz inline, marca a opção, vê o feedback
 * (correto/errado) com a explicação. Sem state global de XP — esse fica para
 * o nível módulo (a rota dinâmica ainda não tem agregação multi-quiz).
 *
 * Schema: ver `QuizSchema` em `blocks/schemas.ts`.
 *   { question, options: string[], correctIndex: number, explanation? }
 *
 * Acessibilidade: usa `role="radiogroup"` com `radio`/`aria-checked` para
 * leitores de tela. `aria-live="polite"` no feedback. Foco visível default.
 */

'use client';

import { useState } from 'react';

export interface QuizBlockData {
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export function QuizBlock({ data }: { data: QuizBlockData }) {
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const question = data?.question ?? '';
  const options = Array.isArray(data?.options) ? data.options : [];
  const correctIndex = typeof data?.correctIndex === 'number' ? data.correctIndex : 0;
  const explanation = data?.explanation ?? '';

  if (!question || options.length < 2) return null;

  const isCorrect = submitted && selected === correctIndex;

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function handleReset() {
    setSelected(null);
    setSubmitted(false);
  }

  return (
    <section
      className="my-6 p-5 rounded-xl"
      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
      aria-label="Quiz"
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl" aria-hidden>🧩</span>
        <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'var(--ffv-muted)' }}>
          Quiz rápido
        </h3>
      </div>

      <p className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>{question}</p>

      <div role="radiogroup" aria-label={question} className="flex flex-col gap-2">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isAnswer = submitted && i === correctIndex;
          const isWrongPick = submitted && isSelected && i !== correctIndex;

          let background = 'var(--ffv-bg)';
          let borderColor = 'var(--ffv-border)';
          let color = 'var(--foreground)';
          if (isAnswer) {
            background = 'rgba(63,185,80,0.15)';
            borderColor = 'rgba(63,185,80,0.5)';
            color = 'var(--ffv-green)';
          } else if (isWrongPick) {
            background = 'rgba(247,129,102,0.15)';
            borderColor = 'rgba(247,129,102,0.5)';
            color = 'var(--ffv-red)';
          } else if (isSelected) {
            background = 'rgba(88,166,255,0.12)';
            borderColor = 'rgba(88,166,255,0.5)';
            color = 'var(--ffv-blue)';
          }

          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={submitted}
              onClick={() => setSelected(i)}
              className="text-left px-4 py-3 rounded-lg text-sm transition-all disabled:cursor-not-allowed"
              style={{ background, border: `1px solid ${borderColor}`, color }}
            >
              {opt}
              {isAnswer && <span aria-hidden> ✓</span>}
              {isWrongPick && <span aria-hidden> ✗</span>}
            </button>
          );
        })}
      </div>

      {!submitted ? (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={selected === null}
          className="mt-4 px-5 py-2 rounded-full font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
        >
          Responder
        </button>
      ) : (
        <div className="mt-4" aria-live="polite">
          <p className="text-sm font-semibold mb-1" style={{ color: isCorrect ? 'var(--ffv-green)' : 'var(--ffv-red)' }}>
            {isCorrect ? '✅ Resposta correta!' : '❌ Não foi dessa vez'}
          </p>
          {explanation && (
            <p className="text-xs italic mb-3" style={{ color: 'var(--ffv-muted)' }}>{explanation}</p>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold underline hover:opacity-70"
            style={{ color: 'var(--ffv-blue)' }}
          >
            Tentar de novo
          </button>
        </div>
      )}
    </section>
  );
}
