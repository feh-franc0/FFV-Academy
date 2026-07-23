'use client';

/**
 * OnboardingV3Modal — substitui o onboarding tech-only por um wizard
 * multi-base alinhado ao PERSONALIZATION_PLAN_2026-05.md (Fase 3).
 *
 * 5 telas:
 *   1. Intro — propósito + skip
 *   2. Bases de interesse (multi-select, mínimo 1)
 *   3. Base "home" (single-select dos selecionados, opcional)
 *   4. Frequência declarada (daily / X dias por semana / dias específicos)
 *   5. Materiais favoritos (multi, mín 1)
 *
 * Persistência: useUserPreferences.update() — sincroniza local + backend
 * via SWR optimistic. Visitante anônimo continua funcionando (fallback local).
 *
 * Critério pra abrir: GameState antigo sem onboardedAt E user sem preferences
 * customizadas (interestedBases vazio). Se já preencheu via /perfil, não
 * abre. Pulado/concluído marca GameState.onboardedAt pra não reabrir.
 */

import { useEffect, useState } from 'react';
import { useGameState } from '@/hooks/useGameState';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { listBases } from '@/lib/bases/registry';
import { useActiveBase } from '@/components/base/ActiveBaseContext';
import { countSignals, type MaterialKind, type StudyFrequency } from '@/lib/user-preferences';

type Step = 'intro' | 'bases' | 'home' | 'frequency' | 'materials' | 'done';

const STEP_TITLES: Record<Step, string> = {
  intro:     'BEM-VINDO',
  bases:     'PASSO 1 DE 4',
  home:      'PASSO 2 DE 4',
  frequency: 'PASSO 3 DE 4',
  materials: 'PASSO 4 DE 4',
  done:      'TUDO PRONTO',
};

const MATERIAL_LABELS: { value: MaterialKind; label: string; emoji: string }[] = [
  { value: 'video',      label: 'Vídeo',           emoji: '🎬' },
  { value: 'text',       label: 'Texto longo',     emoji: '📄' },
  { value: 'quiz',       label: 'Quiz interativo', emoji: '✏️' },
  { value: 'srs',        label: 'Cards de revisão', emoji: '🧠' },
  { value: 'cheatsheet', label: 'Cheat sheets',    emoji: '📋' },
];

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function OnboardingV3Modal() {
  const { state, finishOnboarding } = useGameState();
  const { prefs, update, hydrated } = useUserPreferences();
  const { base: activeBase, isPathnameDerived } = useActiveBase();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('intro');

  // Critério de abertura:
  //  - GameState sem onboarded
  //  - preferences vazias
  //  - sem ?skipOnboarding=1
  //  - **e** o usuário não veio de uma rota DENTRO de uma base
  //
  // Se ele entrou direto em /medicina-veterinaria (deep link, share),
  // já sinalizou interesse — não interrompemos com modal de "qual base
  // te interessa?". Ativamos silenciosamente: registramos a base como
  // home + interested e marcamos onboarded. Ele pode customizar depois
  // em /perfil.
  useEffect(() => {
    if (!state || !hydrated) return;
    if (typeof window !== 'undefined' &&
        new URLSearchParams(window.location.search).get('skipOnboarding') === '1') {
      return;
    }
    const neverOnboarded = !state.onboardedAt;
    const noPrefs = prefs.interestedBases.length === 0 && !prefs.homeBase;
    const noActivity = state.completedModules.length === 0 && state.xp === 0;
    if (!(neverOnboarded && noPrefs && noActivity)) return;

    // Deep link em uma base: silent-onboard pra essa base, sem modal.
    if (isPathnameDerived) {
      update({
        interestedBases: [activeBase.slug],
        homeBase: activeBase.slug,
      });
      finishOnboarding(null);
      return;
    }

    const t = setTimeout(() => setOpen(true), 450);
    return () => clearTimeout(t);
  }, [state, hydrated, prefs.interestedBases.length, prefs.homeBase, isPathnameDerived, activeBase.slug, update, finishOnboarding]);

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

  function handleFinish() {
    finishOnboarding(prefs.homeBase ?? null);
    setStep('done');
    // Mantém aberto 2s na tela "done" como feedback positivo
    setTimeout(() => setOpen(false), 1800);
  }

  function toggleBase(slug: string) {
    const set = new Set(prefs.interestedBases);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    const homeBase = prefs.homeBase && set.has(prefs.homeBase) ? prefs.homeBase : null;
    update({ interestedBases: Array.from(set), homeBase });
  }

  function setFrequency(freq: StudyFrequency) {
    update({ frequency: freq });
  }

  function toggleMaterial(kind: MaterialKind) {
    const set = new Set(prefs.preferredMaterials);
    if (set.has(kind)) set.delete(kind);
    else set.add(kind);
    update({ preferredMaterials: Array.from(set) });
  }

  if (!open || !hydrated) return null;

  const bases = listBases();
  const liveBases = bases.filter(b => b.status === 'live');
  const queuedBases = bases.filter(b => b.status === 'queued');
  const signals = countSignals(prefs);
  const canProceedFromBases = prefs.interestedBases.length >= 1;
  const canProceedFromMaterials = prefs.preferredMaterials.length >= 1;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Onboarding FFV Academy"
      data-testid="onboarding-v3-modal"
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
            padding: '24px 24px 18px',
            background:
              'radial-gradient(ellipse 80% 100% at 50% 0%, color-mix(in srgb, var(--ffv-amber) 14%, transparent), transparent 70%)',
            borderBottom: '1px solid var(--ffv-border)',
          }}
        >
          <div
            className="font-mono uppercase"
            style={{
              fontSize: 10, letterSpacing: '0.18em',
              color: 'var(--ffv-amber)', fontWeight: 700, marginBottom: 10,
            }}
          >
            {STEP_TITLES[step]}
          </div>

          {step === 'intro' && (
            <>
              <h2 style={{ fontSize: '1.45rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.2, marginBottom: 8 }}>
                A plataforma se adapta a você — não o contrário.
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.65 }}>
                4 perguntas (≤90s). Quanto mais você nos contar, melhor a trilha. Tudo
                salva sozinho — pode editar depois em <strong style={{ color: 'var(--foreground)' }}>/perfil</strong>.
              </p>
            </>
          )}

          {step === 'bases' && (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 6 }}>
                Em qual área você quer estudar?
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                Marque tudo que se aplica — até as &ldquo;na fila&rdquo; (avisamos quando entrarem).
              </p>
            </>
          )}

          {step === 'home' && (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 6 }}>
                Qual será sua &ldquo;casa&rdquo;?
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                Quando você abrir o portal, te levamos direto pra essa base. Pode pular se ainda não decidiu.
              </p>
            </>
          )}

          {step === 'frequency' && (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 6 }}>
                Com que frequência você estuda?
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                Streak congela em dias de descanso planejado — sem culpa.
              </p>
            </>
          )}

          {step === 'materials' && (
            <>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 6 }}>
                Como você aprende melhor?
              </h2>
              <p style={{ fontSize: 12.5, color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                A gente prioriza esses formatos na sua trilha.
              </p>
            </>
          )}

          {step === 'done' && (
            <>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25, marginBottom: 6 }}>
                Tudo certo! 🎯
              </h2>
              <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
                {signals}/4 sinais desbloqueados. Mais detalhes você ajusta em /perfil.
              </p>
            </>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '18px 22px 22px' }}>
          {step === 'intro' && (
            <div className="flex flex-col gap-3">
              <Row icon="🎯" title="Trilha que faz sentido pra você" desc="Bases certas, ritmo certo, formato certo." />
              <Row icon="🏠" title="Sua base é sua home" desc="O portal abre na área que importa pra você." />
              <Row icon="🔁" title="Streak respeita seu ritmo" desc="Descansa em dias planejados sem perder progresso." />
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => setStep('bases')}
                  className="flex-1 py-3 rounded-xl font-semibold"
                  style={{ background: 'var(--ffv-amber)', color: '#0d1117', fontSize: 14 }}
                >
                  Começar →
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
          )}

          {step === 'bases' && (
            <div className="flex flex-col gap-2">
              {liveBases.map(base => {
                const active = prefs.interestedBases.includes(base.slug);
                return (
                  <BaseRow
                    key={base.slug}
                    icon={base.icon}
                    name={base.name}
                    area={base.area}
                    badge="No ar"
                    badgeTone="live"
                    active={active}
                    onClick={() => toggleBase(base.slug)}
                  />
                );
              })}
              {queuedBases.slice(0, 6).map(base => {
                const active = prefs.interestedBases.includes(base.slug);
                return (
                  <BaseRow
                    key={base.slug}
                    icon={base.icon}
                    name={base.name}
                    area={base.area}
                    badge="Na fila"
                    badgeTone="queued"
                    active={active}
                    onClick={() => toggleBase(base.slug)}
                  />
                );
              })}
              <NavFooter
                onBack={() => setStep('intro')}
                onNext={() => setStep('home')}
                onSkip={handleSkip}
                canProceed={canProceedFromBases}
                nextLabel="Continuar →"
                disabledReason={canProceedFromBases ? undefined : 'Escolha pelo menos uma'}
              />
            </div>
          )}

          {step === 'home' && (
            <div className="flex flex-col gap-2">
              {prefs.interestedBases.length === 0 ? (
                <p
                  className="text-sm text-center py-6"
                  style={{ color: 'var(--ffv-muted)' }}
                >
                  Você não selecionou bases — pode pular essa etapa.
                </p>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => update({ homeBase: null })}
                    aria-pressed={prefs.homeBase === null}
                    className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                    style={{
                      background: prefs.homeBase === null
                        ? 'color-mix(in srgb, var(--ffv-amber) 10%, var(--ffv-bg2))'
                        : 'var(--ffv-bg2)',
                      border: prefs.homeBase === null
                        ? '1px solid var(--ffv-amber)'
                        : '1px solid var(--ffv-border)',
                    }}
                  >
                    <span style={{ fontSize: 22 }} aria-hidden>✨</span>
                    <div className="flex-1 min-w-0">
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>
                        Sem preferência (descobrir tudo)
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--ffv-muted)', marginTop: 2 }}>
                        Você acessa cada base manualmente, sem redirect.
                      </div>
                    </div>
                    {prefs.homeBase === null && (
                      <span style={{ color: 'var(--ffv-amber)', fontWeight: 700 }}>✓</span>
                    )}
                  </button>
                  {bases
                    .filter(b => prefs.interestedBases.includes(b.slug))
                    .map(base => {
                      const isHome = prefs.homeBase === base.slug;
                      return (
                        <button
                          key={base.slug}
                          type="button"
                          onClick={() => update({ homeBase: base.slug })}
                          aria-pressed={isHome}
                          className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
                          style={{
                            background: isHome
                              ? 'color-mix(in srgb, var(--ffv-amber) 10%, var(--ffv-bg2))'
                              : 'var(--ffv-bg2)',
                            border: isHome
                              ? '1px solid var(--ffv-amber)'
                              : '1px solid var(--ffv-border)',
                          }}
                        >
                          <span style={{ fontSize: 22 }} aria-hidden>{base.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>
                              {base.name}
                            </div>
                            <div style={{ fontSize: 12, color: 'var(--ffv-muted)', marginTop: 2 }}>
                              Vai abrir aqui sempre que entrar.
                            </div>
                          </div>
                          {isHome && (
                            <span style={{ color: 'var(--ffv-amber)', fontWeight: 700 }}>✓</span>
                          )}
                        </button>
                      );
                    })}
                </>
              )}
              <NavFooter
                onBack={() => setStep('bases')}
                onNext={() => setStep('frequency')}
                onSkip={handleSkip}
                canProceed={true}
                nextLabel="Continuar →"
              />
            </div>
          )}

          {step === 'frequency' && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap gap-2">
                <FrequencyChip
                  active={prefs.frequency.kind === 'daily'}
                  onClick={() => setFrequency({ kind: 'daily' })}
                  label="Todo dia"
                />
                <FrequencyChip
                  active={prefs.frequency.kind === 'weekly'}
                  onClick={() => setFrequency({ kind: 'weekly', daysPerWeek: 3 })}
                  label="X dias / semana"
                />
                <FrequencyChip
                  active={prefs.frequency.kind === 'specific_days'}
                  onClick={() => setFrequency({ kind: 'specific_days', weekdays: [1, 3, 5] })}
                  label="Dias específicos"
                />
              </div>

              {prefs.frequency.kind === 'weekly' && (
                <label className="flex items-center gap-3 text-sm mt-1">
                  <input
                    type="range"
                    min={1}
                    max={6}
                    step={1}
                    value={prefs.frequency.daysPerWeek}
                    onChange={e =>
                      setFrequency({ kind: 'weekly', daysPerWeek: Number(e.target.value) })
                    }
                    className="flex-1"
                    aria-label="Dias por semana"
                  />
                  <span className="font-mono" style={{ color: 'var(--ffv-amber)', fontWeight: 700 }}>
                    {prefs.frequency.daysPerWeek} dia{prefs.frequency.daysPerWeek > 1 ? 's' : ''}/semana
                  </span>
                </label>
              )}

              {prefs.frequency.kind === 'specific_days' && (
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {WEEKDAY_LABELS.map((lbl, i) => {
                    const active =
                      prefs.frequency.kind === 'specific_days' &&
                      prefs.frequency.weekdays.includes(i);
                    return (
                      <button
                        key={lbl}
                        type="button"
                        aria-pressed={active}
                        onClick={() => {
                          if (prefs.frequency.kind !== 'specific_days') return;
                          const set = new Set(prefs.frequency.weekdays);
                          if (set.has(i)) set.delete(i);
                          else set.add(i);
                          setFrequency({
                            kind: 'specific_days',
                            weekdays: Array.from(set).sort(),
                          });
                        }}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                        style={{
                          background: active ? 'var(--ffv-amber)' : 'var(--ffv-bg2)',
                          color: active ? '#0d1117' : 'var(--foreground)',
                          border: '1px solid var(--ffv-border)',
                          minWidth: 44,
                        }}
                      >
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              )}

              <NavFooter
                onBack={() => setStep('home')}
                onNext={() => setStep('materials')}
                onSkip={handleSkip}
                canProceed={true}
                nextLabel="Continuar →"
              />
            </div>
          )}

          {step === 'materials' && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {MATERIAL_LABELS.map(opt => {
                  const active = prefs.preferredMaterials.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleMaterial(opt.value)}
                      aria-pressed={active}
                      className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                      style={{
                        background: active
                          ? 'color-mix(in srgb, var(--ffv-amber) 14%, transparent)'
                          : 'var(--ffv-bg2)',
                        color: 'var(--foreground)',
                        border: active
                          ? '1px solid var(--ffv-amber)'
                          : '1px solid var(--ffv-border)',
                      }}
                    >
                      {opt.emoji} {opt.label}
                    </button>
                  );
                })}
              </div>
              <NavFooter
                onBack={() => setStep('frequency')}
                onNext={handleFinish}
                onSkip={handleSkip}
                canProceed={canProceedFromMaterials}
                nextLabel="Finalizar 🎯"
                disabledReason={canProceedFromMaterials ? undefined : 'Escolha pelo menos um'}
              />
            </div>
          )}

          {step === 'done' && (
            <div className="text-center py-4">
              <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
                Te levando pro portal...
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Sub-componentes ────────────────────────────────────────────────────

function Row({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3">
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--foreground)' }}>{title}</div>
        <div style={{ fontSize: 12.5, color: 'var(--ffv-muted)', marginTop: 2, lineHeight: 1.55 }}>
          {desc}
        </div>
      </div>
    </div>
  );
}

function BaseRow({
  icon,
  name,
  area,
  badge,
  badgeTone,
  active,
  onClick,
}: {
  icon: string;
  name: string;
  area: string;
  badge: string;
  badgeTone: 'live' | 'queued';
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors"
      style={{
        background: active
          ? 'color-mix(in srgb, var(--ffv-amber) 10%, var(--ffv-bg2))'
          : 'var(--ffv-bg2)',
        border: active
          ? '1px solid var(--ffv-amber)'
          : '1px solid var(--ffv-border)',
      }}
    >
      <span style={{ fontSize: 22 }} aria-hidden>{icon}</span>
      <div className="flex-1 min-w-0">
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--foreground)' }}>{name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ffv-muted)', marginTop: 2 }} className="truncate">
          {area}
        </div>
      </div>
      <span
        className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
        style={{
          background: badgeTone === 'live'
            ? 'color-mix(in srgb, var(--ffv-green) 18%, transparent)'
            : 'color-mix(in srgb, var(--ffv-muted) 18%, transparent)',
          color: badgeTone === 'live' ? 'var(--ffv-green)' : 'var(--ffv-muted)',
          letterSpacing: '0.08em',
          fontWeight: 700,
        }}
      >
        {badge}
      </span>
      {active && (
        <span style={{ color: 'var(--ffv-amber)', fontWeight: 700 }}>✓</span>
      )}
    </button>
  );
}

function FrequencyChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className="px-3 py-2 rounded-full text-xs font-medium transition-colors"
      style={{
        background: active ? 'var(--ffv-amber)' : 'var(--ffv-bg2)',
        color: active ? '#0d1117' : 'var(--foreground)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      {label}
    </button>
  );
}

function NavFooter({
  onBack,
  onNext,
  onSkip,
  canProceed,
  nextLabel,
  disabledReason,
}: {
  onBack: () => void;
  onNext: () => void;
  onSkip: () => void;
  canProceed: boolean;
  nextLabel: string;
  disabledReason?: string;
}) {
  return (
    <div className="flex gap-2 mt-2 items-center">
      <button
        type="button"
        onClick={onBack}
        className="px-3 py-2.5 rounded-lg font-medium"
        style={{
          background: 'transparent',
          color: 'var(--ffv-muted)',
          fontSize: 12.5,
          border: '1px solid var(--ffv-border)',
        }}
      >
        ←
      </button>
      <button
        type="button"
        onClick={onSkip}
        className="px-3 py-2.5 rounded-lg font-medium"
        style={{
          background: 'transparent',
          color: 'var(--ffv-muted)',
          fontSize: 12,
          border: '1px solid var(--ffv-border)',
        }}
      >
        Pular
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed}
        title={disabledReason}
        className="flex-1 py-2.5 rounded-lg font-semibold"
        style={{
          background: canProceed ? 'var(--ffv-amber)' : 'var(--ffv-bg3, var(--ffv-bg2))',
          color: canProceed ? '#0d1117' : 'var(--ffv-muted)',
          fontSize: 14,
          cursor: canProceed ? 'pointer' : 'not-allowed',
        }}
      >
        {nextLabel}
      </button>
    </div>
  );
}
