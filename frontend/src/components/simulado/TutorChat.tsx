'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { SimuladoQuestion } from '@/lib/simulados';
import { askTutor, type TutorKind } from '@/lib/tutor-api';
import { hasBackend } from '@/lib/api-client';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface Props {
  question: SimuladoQuestion;
  onClose: () => void;
}

const VARIANTS: { kind: TutorKind; label: string; prompt: string }[] = [
  { kind: 'por-que', label: 'Por que essa é a certa?', prompt: 'Por que a resposta correta é a correta?' },
  { kind: 'analogia', label: 'Explique com analogia', prompt: 'Me explique isso com uma analogia do dia a dia.' },
  { kind: 'exemplo', label: 'Me dá um exemplo real', prompt: 'Me dá um exemplo prático / case real.' },
];

interface Message {
  role: 'user' | 'tutor';
  text: string;
  streaming?: boolean;
}

export function TutorChat({ question, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'tutor',
      text: 'Sobre esta questão, o que você gostaria de entender melhor? Posso explicar por que uma alternativa é a certa, trazer uma analogia ou um exemplo real.',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const ask = useCallback(async (variant: (typeof VARIANTS)[number]) => {
    if (loading) return;
    setLoading(true);

    setMessages(prev => [
      ...prev,
      { role: 'user', text: variant.prompt },
      { role: 'tutor', text: '', streaming: true },
    ]);

    try {
      await askTutor(
        {
          questionId: question.id,
          kind: variant.kind,
          questionStem: question.stem,
          correctOptionText: question.options.find(o => o.id === question.correctId)?.text,
        },
        delta => {
          setMessages(prev => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last?.role === 'tutor') {
              next[next.length - 1] = { ...last, text: last.text + delta, streaming: true };
            }
            return next;
          });
        },
      );
      // Marca como concluído (remove indicador de streaming)
      setMessages(prev => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.role === 'tutor') next[next.length - 1] = { ...last, streaming: false };
        return next;
      });
    } catch {
      setMessages(prev => {
        const next = [...prev];
        next[next.length - 1] = {
          role: 'tutor',
          text: 'Não consegui gerar a resposta agora. Tente novamente.',
        };
        return next;
      });
    } finally {
      setLoading(false);
    }
  }, [loading, question]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Chat com tutor"
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
            <h3 className="text-sm font-bold">💬 Tutor IA</h3>
            <p className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>
              Contexto: questão {question.id} · tópico {question.topic}
            </p>
          </div>
          <button onClick={onClose} className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
            ✕
          </button>
        </header>

        {!hasBackend() && (
          <div className="px-4 py-2 text-[10px] font-mono" style={{ background: 'rgba(255,193,7,0.08)', color: '#ffc107', borderBottom: '1px solid rgba(255,193,7,0.2)' }}>
            🧪 Tutor em modo demo — respostas pré-escritas.
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className="rounded-xl p-3 text-sm leading-relaxed"
              style={{
                background: m.role === 'user' ? '#f7816620' : 'var(--ffv-bg2)',
                border: `1px solid ${m.role === 'user' ? '#f7816640' : 'var(--ffv-border)'}`,
                marginLeft: m.role === 'user' ? 'auto' : 0,
                maxWidth: '92%',
              }}
            >
              {m.streaming && m.text === '' ? (
                <span style={{ color: 'var(--ffv-muted)' }}>Pensando<span className="animate-pulse">...</span></span>
              ) : (
                <>
                  {m.text}
                  {m.streaming && <span className="animate-pulse">▋</span>}
                </>
              )}
            </div>
          ))}
        </div>

        <div className="p-4 flex flex-col gap-2" style={{ borderTop: '1px solid var(--ffv-border)' }}>
          {VARIANTS.map(v => (
            <button
              key={v.kind}
              onClick={() => ask(v)}
              disabled={loading}
              className="text-xs px-3 py-2 rounded-lg text-left transition-colors hover:opacity-90 disabled:opacity-40"
              style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
            >
              💭 {v.label}
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
