'use client';

/**
 * ClaudeTerminal — visual do hero: uma sessão real do Claude Code, com o comando
 * sendo digitado e a resposta aparecendo em streaming. Dois selos de gamificação
 * (XP/badge + streak) flutuam por cima, mantendo a narrativa da plataforma.
 *
 * Credibilidade de engenheiro (terminal/mono, como Stripe/Vercel/Linear) +
 * on-brand (Claude no centro). Respeita prefers-reduced-motion e SSR/test.
 */

import { useEffect, useState } from 'react';

const COMMAND = 'crie um endpoint de RAG com citations';

type Line = { text: string; color?: string; dim?: boolean; bold?: boolean };

const LINES: Line[] = [
  { text: '● Analisando o projeto…', color: 'var(--ffv-blue)' },
  { text: '  ✓ src/rag.ts           +48', color: 'var(--ffv-green)' },
  { text: '  ✓ src/embeddings.ts    novo', color: 'var(--ffv-green)' },
  { text: '  ✓ src/rag.test.ts      +31', color: 'var(--ffv-green)' },
  { text: '● Rodando testes…', color: 'var(--ffv-blue)' },
  { text: '  ✓ 12 passando · 0 falhas', color: 'var(--ffv-green)' },
  { text: 'Pronto — /rag no ar com citations. 🎉', bold: true },
];

export function ClaudeTerminal() {
  const [typed, setTyped] = useState('');
  const [lineCount, setLineCount] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setTyped(COMMAND);
      setLineCount(LINES.length);
      setTypingDone(true);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    let i = 0;
    const typeTick = () => {
      i += 1;
      setTyped(COMMAND.slice(0, i));
      if (i < COMMAND.length) {
        timers.push(setTimeout(typeTick, 40));
      } else {
        setTypingDone(true);
        LINES.forEach((_, idx) => {
          timers.push(setTimeout(() => setLineCount(idx + 1), 380 + idx * 300));
        });
      }
    };
    timers.push(setTimeout(typeTick, 550));
    return () => timers.forEach(t => clearTimeout(t));
  }, []);

  return (
    <div className="relative">
      <style>{`
        @keyframes ffv-caret { 0%,49% { opacity: 1; } 50%,100% { opacity: 0; } }
        @keyframes ffv-term-line { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
        @media (prefers-reduced-motion: reduce) {
          .ffv-caret, .ffv-term-line { animation: none !important; }
        }
      `}</style>

      {/* Janela do terminal */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #12161d, #0e1218)',
          border: '1px solid var(--ffv-border)',
          boxShadow:
            '0 40px 90px -30px color-mix(in srgb, var(--ffv-blue) 32%, transparent), 0 2px 0 0 rgba(255,255,255,0.03) inset',
        }}
      >
        {/* Title bar */}
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid var(--ffv-border)', background: 'rgba(255,255,255,0.02)' }}
        >
          <span className="flex gap-1.5">
            <Dot color="#ff5f57" />
            <Dot color="#febc2e" />
            <Dot color="#28c840" />
          </span>
          <span className="flex items-center gap-1.5 mx-auto font-mono text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
            <span className="w-2 h-2 rounded-full" style={{ background: '#cc785c', boxShadow: '0 0 6px #cc785c' }} />
            rag-service — claude
          </span>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ color: 'var(--ffv-green)', background: 'color-mix(in srgb, var(--ffv-green) 14%, transparent)' }}>
            ● conectado
          </span>
        </div>

        {/* Corpo */}
        <div
          className="px-5 py-4 font-mono leading-relaxed"
          style={{ fontSize: 12.5, minHeight: 268 }}
        >
          {/* Prompt + comando digitando */}
          <div className="flex items-start gap-2" style={{ color: 'var(--foreground)' }}>
            <span style={{ color: 'var(--ffv-purple)', fontWeight: 700 }}>›</span>
            <span className="break-words">
              {typed}
              {!typingDone && <Caret />}
            </span>
          </div>

          {/* Resposta em streaming */}
          <div className="mt-3 space-y-1">
            {LINES.slice(0, lineCount).map((l, idx) => (
              <div
                key={idx}
                className="ffv-term-line break-words"
                style={{
                  animation: 'ffv-term-line 0.28s ease both',
                  color: l.bold ? 'var(--foreground)' : l.color ?? 'var(--ffv-muted)',
                  fontWeight: l.bold ? 700 : 400,
                }}
              >
                {highlight(l)}
              </div>
            ))}
            {typingDone && lineCount >= LINES.length && (
              <div className="flex items-center gap-2 pt-1" style={{ color: 'var(--ffv-muted)' }}>
                <span style={{ color: 'var(--ffv-purple)', fontWeight: 700 }}>›</span>
                <Caret />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selo flutuante: badge + XP (canto superior direito) */}
      <div
        className="absolute -top-4 -right-3 sm:-right-5 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl"
        style={{
          background: 'color-mix(in srgb, var(--ffv-purple) 14%, #12161d)',
          border: '1px solid color-mix(in srgb, var(--ffv-purple) 40%, transparent)',
          boxShadow: '0 16px 40px -12px color-mix(in srgb, var(--ffv-purple) 45%, transparent)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span
          className="w-8 h-8 rounded-full flex items-center justify-center text-base ffv-glow-pulse"
          style={{ background: 'linear-gradient(135deg, var(--ffv-purple), var(--ffv-blue))' }}
        >
          🏆
        </span>
        <span className="leading-tight">
          <span className="block text-xs font-bold" style={{ color: 'var(--foreground)' }}>+75 XP</span>
          <span className="block text-[10px]" style={{ color: 'var(--ffv-muted)' }}>Especialista em RAG</span>
        </span>
      </div>

      {/* Selo flutuante: streak (canto inferior esquerdo) */}
      <div
        className="absolute -bottom-4 -left-3 sm:-left-5 flex items-center gap-2 px-3.5 py-2.5 rounded-xl"
        style={{
          background: 'color-mix(in srgb, var(--ffv-orange) 14%, #12161d)',
          border: '1px solid color-mix(in srgb, var(--ffv-orange) 40%, transparent)',
          boxShadow: '0 16px 40px -12px color-mix(in srgb, var(--ffv-orange) 40%, transparent)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <span className="text-lg">🔥</span>
        <span className="leading-tight">
          <span className="block text-xs font-bold" style={{ color: 'var(--foreground)' }}>12 dias</span>
          <span className="block text-[10px]" style={{ color: 'var(--ffv-muted)' }}>de streak</span>
        </span>
      </div>
    </div>
  );
}

function Caret() {
  return (
    <span
      className="ffv-caret inline-block align-middle"
      style={{
        width: 8, height: 16, marginLeft: 2, borderRadius: 1,
        background: 'var(--ffv-blue)', animation: 'ffv-caret 1.05s step-end infinite',
      }}
    />
  );
}

function Dot({ color }: { color: string }) {
  return <span className="w-3 h-3 rounded-full" style={{ background: color }} />;
}

/** Destaca o ✓ verde e sufixos (+48, novo) em módulos de arquivo. */
function highlight(l: Line) {
  if (l.text.includes('✓')) {
    const rest = l.text.replace('✓', '');
    return (
      <>
        <span style={{ color: 'var(--ffv-green)' }}>  ✓</span>
        <span style={{ color: 'var(--foreground)' }}>{rest.replace(/^\s+/, ' ')}</span>
      </>
    );
  }
  return l.text;
}
