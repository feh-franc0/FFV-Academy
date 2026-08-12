'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { CURRICULUM, HUBS, type Module, type Trail } from '@/lib/curriculum';
import { useGameState } from '@/hooks/useGameState';
import { recordArticleVisit } from '@/lib/engine';
import { useFocusTrap } from '@/hooks/useFocusTrap';

type Step = 'intro' | 'q-level' | 'q-goal' | 'q-time' | 'choose';

type Level = 'beginner' | 'intermediate' | 'advanced';
type Goal = 'ia' | 'aws' | 'engenharia' | 'ia-aws';

interface TimeOption {
  value: number; // daily goal (modules/day)
  label: string;
  desc: string;
  icon: string;
}

const TIME_OPTIONS: TimeOption[] = [
  { value: 1, label: '5 min/dia', desc: '1 módulo por dia — ritmo leve, sem pressão.', icon: '☕' },
  { value: 3, label: '15 min/dia', desc: '2 a 3 módulos — bom equilíbrio diário.', icon: '⏱️' },
  { value: 5, label: '30 min/dia', desc: '5 módulos por dia — sério e consistente.', icon: '🚀' },
  { value: 10, label: '60+ min/dia', desc: '10 módulos por dia — modo intensivo.', icon: '🔥' },
];

function recommendHub(level: Level | null, goal: Goal | null): string | null {
  if (!goal) return null;
  const hubByGoal: Record<Goal, string> = {
    // Quem quer IA e já é avançado é mandado para a junção, não para os
    // fundamentos: `ia-aws` é onde a teoria vira arquitetura sobre serviço.
    ia: level === 'advanced' ? 'ia-aws' : 'ia',
    aws: 'aws',
    engenharia: 'engenharia',
    'ia-aws': 'ia-aws',
  };
  return hubByGoal[goal];
}

/**
 * Gera playlist personalizada de 5-10 módulos do hub recomendado, ordenada por nível
 * (foundational → beginner → intermediate → advanced) e respeitando o nível do usuário.
 *
 * - Iniciantes começam por foundational/beginner.
 * - Intermediários priorizam beginner + intermediate.
 * - Avançados começam direto em intermediate/advanced.
 */
function buildPersonalizedPlaylist(hubSlug: string | null, level: Level | null, max = 8): Module[] {
  if (!hubSlug) return [];
  const hub = HUBS.find(h => h.slug === hubSlug);
  if (!hub) return [];

  const trails: Trail[] = hub.trailIds
    .map(id => CURRICULUM.find(t => t.id === id))
    .filter((t): t is Trail => !!t);

  const levelRank: Record<string, number> = { foundational: 0, beginner: 1, intermediate: 2, advanced: 3 };

  const allModules: Array<Module & { _trailRank: number }> = [];
  trails.forEach(t => {
    const tRank = levelRank[t.level ?? 'beginner'] ?? 1;
    t.modules.forEach(m => allModules.push({ ...m, _trailRank: tRank }));
  });

  // Filtra por nível alvo
  const wantedLevels = level === 'advanced'
    ? ['intermediate', 'advanced']
    : level === 'intermediate'
      ? ['beginner', 'intermediate']
      : ['foundational', 'beginner'];

  const filtered = allModules.filter(m => {
    const mLvl = m.level ?? 'beginner';
    return wantedLevels.includes(mLvl);
  });

  const ordered = (filtered.length >= 5 ? filtered : allModules).slice().sort((a, b) => {
    const aRank = levelRank[a.level ?? 'beginner'] ?? a._trailRank;
    const bRank = levelRank[b.level ?? 'beginner'] ?? b._trailRank;
    if (aRank !== bRank) return aRank - bRank;
    return a._trailRank - b._trailRank;
  });

  return ordered.slice(0, max);
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
  { value: 'ia-aws', label: 'Colocar IA em produção na AWS', desc: 'Bedrock, Knowledge Bases, agents e AgentCore — da primeira chamada à arquitetura.', icon: '◈', hub: 'ia-aws' },
];

export function OnboardingModal() {
  const { state, finishOnboarding, updateDailyGoal } = useGameState();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('intro');
  const [selectedLevel, setSelectedLevel] = useState<Level | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open);

  useEffect(() => {
    if (!state) return;
    if (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('skipOnboarding') === '1') {
      return;
    }
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

  function handleChooseHub(slug: string) {
    finishOnboarding(slug);
    setOpen(false);
  }

  function handleChoosePlaylistFirst(slug: string, hubSlug: string) {
    // Salva hub preferido + persiste primeiro módulo da playlist como lastArticle
    // pra Continue Card retomar de onde o onboarding parou.
    finishOnboarding(hubSlug);
    const m = playlist.find(p => p.slug === slug) ?? playlist[0];
    if (m) {
      const trail = CURRICULUM.find(t => t.modules.some(mod => mod.slug === m.slug));
      try {
        recordArticleVisit({
          slug: m.slug,
          title: m.title,
          icon: m.icon,
          trailName: trail?.name ?? '',
          trailColor: trail?.color ?? 'var(--ffv-blue)',
          readTime: m.readTime,
          xp: m.xp,
          href: `/aprenda/${m.slug}`,
        });
      } catch {
        // não bloqueia o onboarding se o storage falhar
      }
    }
    setOpen(false);
  }

  function handleFinishTime() {
    if (selectedTime !== null) {
      updateDailyGoal(selectedTime);
    }
    setStep('choose');
  }

  const recommendedSlug = recommendHub(selectedLevel, selectedGoal);
  const playlist = useMemo(
    () => buildPersonalizedPlaylist(recommendedSlug, selectedLevel, 8),
    [recommendedSlug, selectedLevel]
  );

  if (!open) return null;

  const STEP_TITLES: Record<Step, string> = {
    'intro': 'BEM-VINDO',
    'q-level': 'DIAGNÓSTICO · 1 DE 3',
    'q-goal': 'DIAGNÓSTICO · 2 DE 3',
    'q-time': 'DIAGNÓSTICO · 3 DE 3',
    'choose': 'SUA TRILHA PERSONALIZADA',
  };

  const recommendedHub = recommendedSlug ? HUBS.find(h => h.slug === recommendedSlug) : null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label="Boas-vindas ao FFV Academy"
      tabIndex={-1}
      className="fixed inset-x-0 bottom-0 z-[90] flex items-center justify-center px-4"
      style={{
        top: 'calc(56px + env(safe-area-inset-top, 0px))',
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
          maxHeight: '92vh',
          overflowY: 'auto',
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
          {step === 'q-time' && (
            <>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 8 }}>
                Quanto tempo por dia você consegue dedicar?
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                Isso define sua meta diária. Constância vence intensidade.
              </p>
            </>
          )}
          {step === 'choose' && (
            <>
              <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 8 }}>
                Sua Trilha Personalizada — começamos por aqui
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>
                {playlist.length > 0 && recommendedHub
                  ? `${playlist.length} módulos em ${recommendedHub.name}, ordenados pelo seu nível.`
                  : 'Por onde você quer começar?'}
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
                  style={{ background: 'var(--ffv-blue)', color: 'var(--primary-foreground)', fontSize: 14 }}
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
                  onClick={() => setStep('q-time')}
                  disabled={!selectedGoal}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{
                    background: selectedGoal ? 'var(--ffv-blue)' : 'var(--ffv-bg3)',
                    color: selectedGoal ? '#0d1117' : 'var(--ffv-muted)',
                    fontSize: 14,
                    cursor: selectedGoal ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {step === 'q-time' && (
            <div className="flex flex-col gap-2.5">
              {TIME_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
                  style={{
                    background: selectedTime === opt.value
                      ? 'color-mix(in srgb, var(--ffv-blue) 10%, var(--ffv-bg2))'
                      : 'var(--ffv-bg2)',
                    border: selectedTime === opt.value
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
                  {selectedTime === opt.value && (
                    <span style={{ color: 'var(--ffv-blue)', fontWeight: 700 }}>✓</span>
                  )}
                </button>
              ))}
              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setStep('q-goal')}
                  className="px-4 py-3 rounded-xl font-medium"
                  style={{ background: 'transparent', color: 'var(--ffv-muted)', fontSize: 13, border: '1px solid var(--ffv-border)' }}
                >
                  ← Voltar
                </button>
                <button
                  type="button"
                  onClick={handleFinishTime}
                  disabled={selectedTime === null}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{
                    background: selectedTime !== null ? 'var(--ffv-blue)' : 'var(--ffv-bg3)',
                    color: selectedTime !== null ? '#0d1117' : 'var(--ffv-muted)',
                    fontSize: 14,
                    cursor: selectedTime !== null ? 'pointer' : 'not-allowed',
                  }}
                >
                  Ver minha trilha →
                </button>
              </div>
            </div>
          )}

          {step === 'choose' && (
            <div className="flex flex-col gap-2.5">
              {playlist.length > 0 && recommendedHub ? (
                <>
                  {playlist.map((m, idx) => (
                    <button
                      key={m.slug}
                      type="button"
                      onClick={() => handleChoosePlaylistFirst(m.slug, recommendedHub.slug)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl text-left"
                      style={{
                        background: idx === 0
                          ? `color-mix(in srgb, ${recommendedHub.color} 10%, var(--ffv-bg2))`
                          : 'var(--ffv-bg2)',
                        border: idx === 0
                          ? `1px solid color-mix(in srgb, ${recommendedHub.color} 55%, transparent)`
                          : '1px solid var(--ffv-border)',
                        cursor: 'pointer',
                      }}
                    >
                      <div
                        className="flex items-center justify-center flex-shrink-0 font-mono ffv-acento-texto"
                        style={{
                          width: 28, height: 28, borderRadius: 8,
                          background: `color-mix(in srgb, ${recommendedHub.color} 14%, transparent)`,
                          '--ffv-acento': recommendedHub.color,
                          fontSize: 12, fontWeight: 700,
                        } as React.CSSProperties}
                      >
                        {idx + 1}
                      </div>
                      <span style={{ fontSize: 18 }}>{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--foreground)' }}>{m.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 2 }}>
                          {m.readTime} min · +{m.xp} XP
                          {m.level && <> · {m.level}</>}
                        </div>
                      </div>
                      {idx === 0 && (
                        <span
                          className="font-mono uppercase ffv-acento-texto"
                          style={{ fontSize: 9, letterSpacing: '0.12em', '--ffv-acento': recommendedHub.color, fontWeight: 700 } as React.CSSProperties}
                        >
                          Começar
                        </span>
                      )}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-2 py-2.5 rounded-xl font-medium"
                    style={{ background: 'transparent', color: 'var(--ffv-muted)', fontSize: 12, border: '1px solid var(--ffv-border)' }}
                  >
                    Ainda não sei — me mostra tudo
                  </button>
                </>
              ) : (
                <>
                  {HUBS.map(h => (
                    <button
                      key={h.slug}
                      type="button"
                      onClick={() => handleChooseHub(h.slug)}
                      className="w-full flex items-center gap-3 p-3.5 rounded-xl text-left"
                      style={{
                        background: 'var(--ffv-bg2)',
                        border: `1px solid color-mix(in srgb, ${h.color} 22%, transparent)`,
                        cursor: 'pointer',
                      }}
                    >
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
                      <span className="ffv-acento-texto" style={{ '--ffv-acento': h.color, fontSize: 16, fontWeight: 700 } as React.CSSProperties}>→</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="mt-2 py-3 rounded-xl font-medium"
                    style={{ background: 'transparent', color: 'var(--ffv-muted)', fontSize: 13, border: '1px solid var(--ffv-border)' }}
                  >
                    Ainda não sei — me mostra tudo
                  </button>
                </>
              )}
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
