'use client';

import { useEffect, useState } from 'react';
import { HUBS } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';

type Step = 'intro' | 'q-level' | 'q-goal' | 'choose';

type Level = 'beginner' | 'intermediate' | 'advanced';
type Goal = 'ia' | 'aws' | 'engenharia' | 'claude';

function recommendHub(level: Level | null, goal: Goal | null): string | null {
  if (!goal) return null;
  // Goal already maps cleanly to hub slug
  const hubByGoal: Record<Goal, string> = {
    ia: level === 'advanced' ? 'ia' : 'ia',
    aws: 'aws',
    engenharia: 'engenharia',
    claude: 'claude-anthropic',
  };
  return hubByGoal[goal];
}

const LEVEL_OPTIONS: { value: Level; label: string; desc: string; icon: string }[] = [
  { value: 'beginner', label: 'Iniciante', desc: 'Pouco ou nenhum contato com IA, cloud ou sistemas distribuídos.', icon: '🌱' },
  { value: 'intermediate', label: 'Desenvolvedor', desc: 'Já programa, usa ferramentas de IA no dia a dia, quer ir mais fundo.', icon: '⚡' },
  { value: 'advanced', label: 'Sênior / Arquiteto', desc: 'Projeta sistemas, quer dominar LLMOps, distributed systems e AI-native.', icon: '🏗️' },
];

const GOAL_OPTIONS: { value: Goal; label: string; desc: string; icon: string; hub: string }[] = [
  { value: 'ia', label: 'Entender IA de verdade', desc: 'LLMs, transformers, RAG, agents — a fundo, sem hype.', icon: '🤖', hub: 'ia' },
  { value: 'aws', label: 'Dominar a AWS', desc: 'Cloud Practitioner, Solutions Architect — certificações e arquitetura real.', icon: '☁️', hub: 'aws' },
  { value: 'engenharia', label: 'Ser engenheiro de software melhor', desc: 'DevOps, sistemas distribuídos, SRE, engenharia moderna.', icon: '🔧', hub: 'engenharia' },
  { value: 'claude', label: 'Dominar o Claude & Anthropic', desc: 'Claude Code, API, agents, MCP, skills — o ecossistema completo para devs.', icon: '⊕', hub: 'claude-anthropic' },
];

export function OnboardingModal() {
  const { state, finishOnboarding } = useGameState();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('intro');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);

  useEffect(() => {
    if (!state) return;
    const neverOnboarded = !state.onboardedAt;
    const noActivity = state.completedModules.length === 0 && state.xp === 0 && !state.lastArticle;
    if (neverOnboarded && noActivity) {
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

  function handleFinishDiagnostic() {
    const rec = recommendHub(selectedLevel, selectedGoal);
    if (rec) {
      handleChoose(rec);
    } else {
      setStep('choose');
    }
  }

  if (!open) return null;

  const STEP_TITLES: Record<Step, string> = {
    'intro': 'BEM-VINDO',
    'q-level': 'DIAGNÓSTICO · 1 DE 2',
    'q-goal': 'DIAGNÓSTICO · 2 DE 2',
    'choose': 'SEU PONTO DE PARTIDA',
  };

  const recommendedSlug = recommendHub(selectedLevel, selectedGoal);

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
        {/* Header */}
        <div
          style={{
            padding: '28px 28px 20px',
            background: 'radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, var(--ffv-blue) 14%, transparent), transparent 70%)',
            borderBottom: '1px solid var(--ffv-border)',
          }}
        >
          <div
            className="font-mono uppercase"
            style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--ffv-blue)', fontWeight: 700, marginBottom: 10 }}
          >
            {STEP_TITLES[step]}
          </div>

          {step === 'intro' && (
            <>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 10 }}>
                Um blog que funciona como um jogo.
              </h2>
              <p style={{ fontSize: 13.5, color: 'var(--ffv-muted)', lineHeight: 1.7 }}>
                Cada artigo dá XP, tem quiz e alimenta uma fila de revisão espaçada. Sem cadastro — seu progresso fica salvo no navegador.
              </p>
            </>
          )}
          {step === 'q-level' && (
            <>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 8 }}>
                Qual é o seu nível de experiência?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                Isso personaliza o ponto de entrada recomendado — sem travar trilhas.
              </p>
            </>
          )}
          {step === 'q-goal' && (
            <>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 8 }}>
                Qual é o seu foco principal?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                Você pode mudar depois — todas as trilhas ficam abertas o tempo todo.
              </p>
            </>
          )}
          {step === 'choose' && (
            <>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 8 }}>
                Por onde você quer começar?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                Isso personaliza sua home. Você pode mudar depois.
              </p>
            </>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 24px' }}>
          {step === 'intro' && (
            <div className="flex flex-col gap-3">
              <Row icon="📖" title="Leia artigos técnicos" desc="Sem hype, arquitetura real, exemplos em código." />
              <Row icon="🧩" title="Responda quizzes" desc="Vira XP na hora e card na fila de revisão espaçada." />
              <Row icon="🔥" title="Mantenha o streak" desc="Consistência é o segredo real. Ganha freezes a cada 7 dias." />
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep('q-level')}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{ background: 'var(--ffv-blue)', color: '#0d1117', fontSize: 14 }}
                >
                  Vamos lá →
                </button>
                <button
                  type="button"
                  onClick={handleSkip}
                  className="px-5 py-3 rounded-xl font-medium"
                  style={{ background: 'transparent', color: 'var(--ffv-muted)', fontSize: 13, border: '1px solid var(--ffv-border)' }}
                >
                  Pular
                </button>
              </div>
            </div>
          )}

          {step === 'q-level' && (
            <div className="flex flex-col gap-2.5">
              {LEVEL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedLevel(opt.value)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
                  style={{
                    background: selectedLevel === opt.value
                      ? 'color-mix(in srgb, var(--ffv-blue) 10%, var(--ffv-bg2))'
                      : 'var(--ffv-bg2)',
                    border: selectedLevel === opt.value
                      ? '1px solid color-mix(in srgb, var(--ffv-blue) 60%, transparent)'
                      : '1px solid var(--ffv-border)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ffv-muted)', marginTop: 2, lineHeight: 1.5 }}>{opt.desc}</div>
                  </div>
                  {selectedLevel === opt.value && (
                    <span style={{ color: 'var(--ffv-blue)', fontWeight: 700 }}>✓</span>
                  )}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setStep('q-goal')}
                disabled={!selectedLevel}
                className="mt-1 py-3 rounded-xl font-semibold"
                style={{
                  background: selectedLevel ? 'var(--ffv-blue)' : 'var(--ffv-bg3)',
                  color: selectedLevel ? '#0d1117' : 'var(--ffv-muted)',
                  fontSize: 14,
                  cursor: selectedLevel ? 'pointer' : 'not-allowed',
                }}
              >
                Continuar →
              </button>
            </div>
          )}

          {step === 'q-goal' && (
            <div className="flex flex-col gap-2.5">
              {GOAL_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedGoal(opt.value)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
                  style={{
                    background: selectedGoal === opt.value
                      ? 'color-mix(in srgb, var(--ffv-blue) 10%, var(--ffv-bg2))'
                      : 'var(--ffv-bg2)',
                    border: selectedGoal === opt.value
                      ? '1px solid color-mix(in srgb, var(--ffv-blue) 60%, transparent)'
                      : '1px solid var(--ffv-border)',
                    cursor: 'pointer',
                  }}
                >
                  <span style={{ fontSize: 24 }}>{opt.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: 'var(--ffv-muted)', marginTop: 2, lineHeight: 1.5 }}>{opt.desc}</div>
                  </div>
                  {selectedGoal === opt.value && (
                    <span style={{ color: 'var(--ffv-blue)', fontWeight: 700 }}>✓</span>
                  )}
                </button>
              ))}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setStep('q-level')}
                  className="px-4 py-3 rounded-xl font-medium"
                  style={{ background: 'transparent', color: 'var(--ffv-muted)', fontSize: 13, border: '1px solid var(--ffv-border)' }}
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={handleFinishDiagnostic}
                  disabled={!selectedGoal}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{
                    background: selectedGoal ? 'var(--ffv-blue)' : 'var(--ffv-bg3)',
                    color: selectedGoal ? '#0d1117' : 'var(--ffv-muted)',
                    fontSize: 14,
                    cursor: selectedGoal ? 'pointer' : 'not-allowed',
                  }}
                >
                  Ver recomendação →
                </button>
              </div>
            </div>
          )}

          {step === 'choose' && (
            <div className="flex flex-col gap-2.5">
              {HUBS.map(h => {
                const isRecommended = h.slug === recommendedSlug;
                return (
                  <button
                    key={h.slug}
                    type="button"
                    onClick={() => handleChoose(h.slug)}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left relative"
                    style={{
                      background: isRecommended
                        ? `color-mix(in srgb, ${h.color} 8%, var(--ffv-bg2))`
                        : 'var(--ffv-bg2)',
                      border: `1px solid ${isRecommended
                        ? `color-mix(in srgb, ${h.color} 55%, transparent)`
                        : `color-mix(in srgb, ${h.color} 22%, transparent)`}`,
                      transition: 'all 0.15s ease',
                      cursor: 'pointer',
                    }}
                    onMouseOver={e => {
                      e.currentTarget.style.borderColor = `color-mix(in srgb, ${h.color} 65%, transparent)`;
                    }}
                    onMouseOut={e => {
                      e.currentTarget.style.borderColor = isRecommended
                        ? `color-mix(in srgb, ${h.color} 55%, transparent)`
                        : `color-mix(in srgb, ${h.color} 22%, transparent)`;
                    }}
                  >
                    {isRecommended && (
                      <span
                        className="absolute top-2 right-2 font-mono uppercase"
                        style={{ fontSize: 9, letterSpacing: '0.12em', color: h.color, fontWeight: 700 }}
                      >
                        Recomendado
                      </span>
                    )}
                    <div
                      className="flex items-center justify-center flex-shrink-0"
                      style={{
                        width: 40, height: 40, borderRadius: 12,
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
                );
              })}
              <button
                type="button"
                onClick={handleSkip}
                className="mt-2 py-3 rounded-xl font-medium"
                style={{ background: 'transparent', color: 'var(--ffv-muted)', fontSize: 13, border: '1px solid var(--ffv-border)' }}
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
