'use client';

/**
 * TutorAsk — modal para o usuário fazer perguntas livres sobre uma questão.
 *
 * Diferente do `TutorChat`, este componente é livre (sem variants fixos):
 * - Sugestões clicáveis vindas de `question.explanation.tutorSeeds` (quando
 *   o schema rico estiver presente)
 * - Textarea para pergunta arbitrária
 * - Histórico Q&A persistido em localStorage por questionId (cap em 5)
 *
 * Endpoint backend esperado: POST /api/v1/tutor/ask (mesmo do TutorChat).
 * Quando FEATURES.tutorAI === false ou !hasBackend, cai em fallback local com
 * mensagem orientativa.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SimuladoQuestion, OptionId } from '@/lib/simulados';
import { hasBackend } from '@/lib/api-client';
import { FEATURES } from '@/lib/features';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { getJSON, setJSON } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

interface RichExplanation {
  summary?: string;
  whyCorrect?: string;
  whyWrong?: Partial<Record<OptionId, string>>;
  keyConcept?: string;
  compareWith?: string[];
  commonMistakes?: string[];
  tutorSeeds?: string[];
}

interface Props {
  question: SimuladoQuestion;
  userAnswer?: OptionId;
  open: boolean;
  onClose: () => void;
}

interface QA {
  q: string;
  a: string;
  ts: number;
}

const MAX_HISTORY_PER_QUESTION = 5;

function loadHistory(questionId: string): QA[] {
  const all = getJSON<Record<string, QA[]>>(STORAGE_KEYS.TUTOR_ASK_HISTORY, {});
  return all[questionId] ?? [];
}

function saveHistory(questionId: string, history: QA[]): void {
  const all = getJSON<Record<string, QA[]>>(STORAGE_KEYS.TUTOR_ASK_HISTORY, {});
  all[questionId] = history.slice(-MAX_HISTORY_PER_QUESTION);
  setJSON(STORAGE_KEYS.TUTOR_ASK_HISTORY, all);
}

function getRich(question: SimuladoQuestion): RichExplanation | null {
  if (typeof question.explanation === 'string') return null;
  return question.explanation as unknown as RichExplanation;
}

const FALLBACK_ANSWER =
  'Explicação ampliada vem do tutor IA. Por enquanto, releia a "Por que está errado" da opção que você escolheu e o "Conceito-chave" da questão — esses dois blocos costumam fechar a dúvida em 80% dos casos.';

export function TutorAsk({ question, userAnswer, open, onClose }: Props) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<QA[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (open) setHistory(loadHistory(question.id));
  }, [open, question.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const ask = useCallback(async (userQuestion: string) => {
    const trimmed = userQuestion.trim();
    if (!trimmed || loading) return;
    setLoading(true);

    let answer = FALLBACK_ANSWER;

    if (FEATURES.tutorAI && hasBackend()) {
      try {
        const base = (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) || '';
        const res = await fetch(`${base}/api/v1/tutor/ask`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionId: question.id,
            optionUserPicked: userAnswer ?? null,
            userQuestion: trimmed,
            contextStem: question.stem,
            contextOptions: question.options,
            contextExplanation: question.explanation,
          }),
        });
        if (res.ok) {
          const data = await res.json().catch(() => null) as { answer?: string } | null;
          if (data?.answer) answer = data.answer;
        }
      } catch {
        // Mantém fallback
      }
    } else {
      // TODO: backend endpoint POST /api/v1/tutor/ask (Q&A livre, não SSE)
      //       quando FEATURES.tutorAI estiver ON. Por enquanto, fallback local.
      console.info('[TutorAsk] tutor IA off — usando fallback local. Configure NEXT_PUBLIC_FEATURE_TUTOR_AI_ENABLED=true e backend para ativar.');
    }

    const next: QA[] = [...history, { q: trimmed, a: answer, ts: Date.now() }].slice(-MAX_HISTORY_PER_QUESTION);
    setHistory(next);
    saveHistory(question.id, next);
    setInput('');
    setLoading(false);
  }, [loading, question, userAnswer, history]);

  if (!open) return null;

  const rich = getRich(question);
  const seeds = rich?.tutorSeeds ?? [
    'Por que essa opção está certa?',
    'Me dá um exemplo prático.',
    'Onde costuma cair em prova?',
  ];

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Tire sua dúvida com o tutor"
      tabIndex={-1}
      className="fixed inset-0 z-[90] flex justify-end"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <aside
        className="w-full md:max-w-md h-full flex flex-col"
        style={{ background: 'var(--ffv-bg)', borderLeft: '1px solid var(--ffv-border)' }}
      >
        <header className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
          <div>
            <h3 className="text-sm font-bold">Tire sua dúvida</h3>
            <p className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
              Questão {question.id} · {question.topic}
            </p>
          </div>
          <button onClick={onClose} aria-label="Fechar" className="text-sm" style={{ color: 'var(--ffv-muted)' }}>✕</button>
        </header>

        {(!FEATURES.tutorAI || !hasBackend()) && (
          <div className="px-4 py-2 text-[10px] font-mono" style={{ background: 'rgba(255,193,7,0.08)', color: '#ffc107', borderBottom: '1px solid rgba(255,193,7,0.2)' }}>
            Tutor IA em breve — respostas em modo fallback.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 && (
            <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
              Escolha uma sugestão ou escreva sua pergunta. O tutor considera o contexto desta questão e da sua resposta.
            </p>
          )}

          {history.map((qa, i) => (
            <div key={i} className="space-y-2">
              <div
                className="rounded-xl p-3 text-sm ml-auto"
                style={{
                  background: 'color-mix(in srgb, var(--ffv-red) 13%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--ffv-red) 25%, transparent)',
                  maxWidth: '92%',
                }}
              >
                {qa.q}
              </div>
              <div
                className="rounded-xl p-3 text-sm leading-relaxed"
                style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', maxWidth: '92%' }}
              >
                {qa.a}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--ffv-border)' }}>
          <div className="flex flex-wrap gap-2">
            {seeds.map((seed, i) => (
              <button
                key={i}
                onClick={() => ask(seed)}
                disabled={loading}
                className="text-[11px] px-2 py-1 rounded-full transition-colors hover:opacity-90 disabled:opacity-40"
                style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
              >
                {seed}
              </button>
            ))}
          </div>

          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Escreva sua pergunta..."
            rows={2}
            disabled={loading}
            aria-label="Sua pergunta"
            className="w-full text-sm p-2 rounded-lg resize-none"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
          />

          <button
            onClick={() => ask(input)}
            disabled={loading || input.trim().length === 0}
            className="text-sm px-4 py-2 rounded-lg font-medium transition-opacity disabled:opacity-40"
            style={{ background: 'var(--ffv-red)', color: 'var(--primary-foreground)' }}
          >
            {loading ? 'Perguntando...' : 'Perguntar'}
          </button>
        </div>
      </aside>
    </div>
  );
}
