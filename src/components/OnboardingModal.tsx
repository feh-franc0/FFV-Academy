'use client';

import { useEffect, useState } from 'react';
import { HUBS } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

export function OnboardingModal() {
  const { state, finishOnboarding } = useGameState();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'intro' | 'choose'>('intro');

  useEffect(() => {
    if (!state) return;
    // Show once: never onboarded AND no activity yet (avoid bothering returning users)
    const neverOnboarded = !state.onboardedAt;
    const noActivity = state.completedModules.length === 0 && state.xp === 0 && !state.lastArticle;
    if (neverOnboarded && noActivity) {
      // Small delay so the page settles first
      const t = setTimeout(() => setOpen(true), 450);
      return () => clearTimeout(t);
    }
  }, [state]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        handleSkip();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function handleSkip() {
    finishOnboarding(null);
    setOpen(false);
  }

  function handleChoose(slug: string) {
    finishOnboarding(slug);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Boas-vindas ao FFV Academy"
      className="fixed inset-0 z-[90] flex items-center justify-center px-4"
      style={{
        background: 'color-mix(in srgb, #000 62%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) handleSkip();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: 'var(--ffv-bg)',
          border: '1px solid var(--ffv-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        <div
          style={{
            padding: '28px 28px 20px',
            background: 'radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, var(--ffv-blue) 14%, transparent), transparent 70%)',
            borderBottom: '1px solid var(--ffv-border)',
          }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              color: 'var(--ffv-blue)',
              fontWeight: 700,
              marginBottom: 10,
            }}
          >
            {step === 'intro' ? 'BEM-VINDO' : 'SEU PONTO DE PARTIDA'}
          </div>
          {step === 'intro' ? (
            <>
              <h2
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                  marginBottom: 10,
                }}
              >
                Um blog que funciona como um jogo.
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
                Cada artigo dá XP, tem quiz e alimenta uma fila de revisão espaçada. Sem cadastro — seu progresso fica salvo no navegador.
              </p>
            </>
          ) : (
            <>
              <h2
                style={{
                  fontSize: '1.35rem',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  lineHeight: 1.25,
                  marginBottom: 8,
                }}
              >
                Por onde você quer começar?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                Isso personaliza sua home. Você pode mudar depois — todas as trilhas ficam abertas o tempo todo.
              </p>
            </>
          )}
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {step === 'intro' ? (
            <div className="flex flex-col gap-3">
              <Row icon="📖" title="Leia artigos técnicos" desc="Sem hype, arquitetura real, exemplos em código." />
              <Row icon="🧩" title="Responda quizzes" desc="Vira XP na hora e card na fila de revisão espaçada." />
              <Row icon="🔥" title="Mantenha o streak" desc="Consistência é o segredo real. Ganha freezes a cada 7 dias." />
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep('choose')}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{
                    background: 'var(--ffv-blue)',
                    color: 'var(--primary-foreground)',
                    fontSize: 14,
                  }}
                >
                  Vamos lá →
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-5 py-3 rounded-xl font-medium"
                  style={{
                    background: 'transparent',
                    color: 'var(--ffv-muted)',
                    fontSize: 13,
                    border: '1px solid var(--ffv-border)',
                  }}
                >
                  Pular
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              {HUBS.map(h => (
                <button
                  key={h.slug}
                  type="button"
                  onClick={() => handleChoose(h.slug)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
                  style={{
                    background: 'var(--ffv-bg2)',
                    border: `1px solid color-mix(in srgb, ${h.color} 22%, transparent)`,
                    transition: 'all 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => {
                    e.currentTarget.style.borderColor = `color-mix(in srgb, ${h.color} 65%, transparent)`;
                    e.currentTarget.style.background = `color-mix(in srgb, ${h.color} 6%, var(--ffv-bg2))`;
                  }}
                  onMouseOut={e => {
                    e.currentTarget.style.borderColor = `color-mix(in srgb, ${h.color} 22%, transparent)`;
                    e.currentTarget.style.background = 'var(--ffv-bg2)';
                  }}
                >
                  <div
                    className="flex items-center justify-center flex-shrink-0"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: `color-mix(in srgb, ${h.color} 14%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${h.color} 30%, transparent)`,
                      fontSize: 20,
                    }}
                  >
                    {h.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{h.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--ffv-muted)', marginTop: 2 }}>{h.tagline}</div>
                  </div>
                  <span style={{ color: h.color, fontSize: 16, fontWeight: 700 }}>→</span>
                </button>
              ))}
              <button
                type="button"
                onClick={handleSkip}
                className="mt-2 py-3 rounded-xl font-medium"
                style={{
                  background: 'transparent',
                  color: 'var(--ffv-muted)',
                  fontSize: 13,
                  border: '1px solid var(--ffv-border)',
                }}
              >
                Ainda não sei — me mostra tudo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ffv-muted)', marginTop: 2, lineHeight: 1.55 }}>{desc}</div>
      </div>
    </div>
  );
}
