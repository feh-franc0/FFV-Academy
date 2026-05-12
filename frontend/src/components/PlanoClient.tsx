'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import {
  generateStudyPlan,
  GOAL_LABELS,
  type GoalType,
  type PlanGoal,
  type StudyPlan,
  type WeekPlan,
} from '@/lib/learning-plan';

const PLAN_STORAGE_KEY = 'ffv_study_plan';

const GOAL_TYPES: GoalType[] = [
  'aws-clf',
  'aws-saa',
  'backend-senior',
  'ml-engineer',
  'fullstack',
  'devops-sre',
  'frontend-senior',
  'open',
];

// ---------- Generating animation ----------

const GENERATING_STEPS = [
  'Analisando seu progresso...',
  'Identificando lacunas...',
  'Otimizando sequência...',
  'Calculando carga semanal...',
  'Montando plano personalizado...',
];

function GeneratingAnimation() {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= GENERATING_STEPS.length - 1) return;
    const t = setTimeout(() => setStep(s => s + 1), 150);
    return () => clearTimeout(t);
  }, [step]);

  const pct = Math.round(((step + 1) / GENERATING_STEPS.length) * 100);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 px-6">
      <div
        className="w-16 h-16 rounded-full border-4 border-t-transparent animate-spin"
        style={{ borderColor: 'var(--ffv-blue)', borderTopColor: 'transparent' }}
      />
      <p className="text-lg font-medium" style={{ color: 'var(--foreground)' }}>
        {GENERATING_STEPS[step]}
      </p>
      <div
        className="w-64 h-2 rounded-full overflow-hidden"
        style={{ background: 'var(--ffv-bg3)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, background: 'var(--ffv-blue)' }}
        />
      </div>
      <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Baseado no seu histórico de estudo
      </p>
    </div>
  );
}

// ---------- Setup screen ----------

interface SetupScreenProps {
  onGenerate: (goal: PlanGoal) => void;
  hasSavedPlan: boolean;
  onResume: () => void;
}

function SetupScreen({ onGenerate, hasSavedPlan, onResume }: SetupScreenProps) {
  const [selectedGoal, setSelectedGoal] = useState<GoalType | null>(null);
  const [hours, setHours] = useState(5);
  const [weeks, setWeeks] = useState(12);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedGoal) return;
    onGenerate({ type: selectedGoal, hoursPerWeek: hours, weeksAvailable: weeks });
  }

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-12"
      style={{ color: 'var(--foreground)' }}
    >
      <div className="text-center mb-10">
        <h1
          className="text-3xl sm:text-4xl font-bold mb-3"
          style={{ color: 'var(--foreground)' }}
        >
          Seu plano de estudos personalizado
        </h1>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Gerado com base no seu progresso atual — gratuito, sem hype.
        </p>
        {hasSavedPlan && (
          <button
            type="button"
            onClick={onResume}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            style={{
              background: 'var(--ffv-bg3)',
              color: 'var(--ffv-blue)',
              border: '1px solid var(--ffv-border)',
            }}
          >
            ↩ Retomar plano anterior
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-8">
        {/* Goal selector */}
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--ffv-muted)' }}>
            Qual é o seu objetivo?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOAL_TYPES.map(g => {
              const meta = GOAL_LABELS[g];
              const isSelected = selectedGoal === g;
              return (
                <button
                  key={g}
                  type="button"
                  onClick={() => setSelectedGoal(g)}
                  className="text-left p-4 rounded-xl border transition-all"
                  style={{
                    background: isSelected ? 'color-mix(in srgb, var(--ffv-blue) 12%, transparent)' : 'var(--ffv-bg2)',
                    borderColor: isSelected ? 'var(--ffv-blue)' : 'var(--ffv-border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <div className="text-2xl mb-2">{meta.icon}</div>
                  <div className="font-semibold text-sm">{meta.title}</div>
                  <div className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
                    {meta.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Hours slider */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--ffv-muted)' }}>
              Horas disponíveis por semana
            </h2>
            <span className="text-lg font-bold" style={{ color: 'var(--ffv-blue)' }}>
              {hours}h
            </span>
          </div>
          <input
            type="range"
            min={1}
            max={20}
            value={hours}
            onChange={e => setHours(Number(e.target.value))}
            className="w-full accent-blue-400"
            style={{ accentColor: 'var(--ffv-blue)' }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
            <span>1h</span>
            <span>20h</span>
          </div>
        </section>

        {/* Weeks slider */}
        <section>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold uppercase tracking-widest" style={{ color: 'var(--ffv-muted)' }}>
              Semanas até o objetivo
            </h2>
            <span className="text-lg font-bold" style={{ color: 'var(--ffv-blue)' }}>
              {weeks} sem.
            </span>
          </div>
          <input
            type="range"
            min={4}
            max={52}
            value={weeks}
            onChange={e => setWeeks(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: 'var(--ffv-blue)' }}
          />
          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
            <span>4 sem.</span>
            <span>52 sem.</span>
          </div>
        </section>

        <button
          type="submit"
          disabled={!selectedGoal}
          className="w-full py-4 rounded-xl text-base font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: selectedGoal ? 'var(--ffv-blue)' : 'var(--ffv-bg3)',
            color: selectedGoal ? '#fff' : 'var(--ffv-muted)',
          }}
        >
          Gerar plano →
        </button>

        <p className="text-center text-xs" style={{ color: 'var(--ffv-muted)' }}>
          Gerado com base no seu progresso atual — 100% local, sem conta necessária
        </p>
      </form>
    </div>
  );
}

// ---------- Milestone timeline ----------

function MilestoneTimeline({ milestones }: { milestones: StudyPlan['keyMilestones'] }) {
  if (milestones.length === 0) return null;

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-4 min-w-max px-1 py-2">
        {milestones.map((m, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 min-w-[120px] max-w-[160px]"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--ffv-blue)', color: '#fff' }}
            >
              S{m.week}
            </div>
            {i < milestones.length - 1 && (
              <div
                className="absolute h-0.5 w-12 mt-4 ml-8"
                style={{ background: 'var(--ffv-border)' }}
              />
            )}
            <p
              className="text-xs text-center leading-tight"
              style={{ color: 'var(--ffv-muted)' }}
            >
              {m.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Week card ----------

function WeekCard({ week, defaultOpen }: { week: WeekPlan; defaultOpen: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  const completedCount = week.modules.filter(m => m.isCompleted).length;

  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: 'var(--ffv-border)', background: 'var(--ffv-bg2)' }}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
            style={{ background: 'var(--ffv-bg3)', color: 'var(--ffv-blue)', border: '2px solid var(--ffv-blue)' }}
          >
            {week.weekNumber}
          </div>
          <div>
            <div className="font-semibold text-sm" style={{ color: 'var(--foreground)' }}>
              Semana {week.weekNumber} — {week.theme}
            </div>
            <div className="text-xs mt-0.5 flex gap-3" style={{ color: 'var(--ffv-muted)' }}>
              <span>{week.modules.length} módulos</span>
              <span>~{week.estimatedMinutes}min</span>
              <span>{week.srsSessionsTarget} sessão{week.srsSessionsTarget !== 1 ? 'ões' : ''} SRS</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {week.milestone && (
            <span
              className="hidden sm:inline-block text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'color-mix(in srgb, var(--ffv-green) 15%, transparent)', color: 'var(--ffv-green)', border: '1px solid var(--ffv-green)' }}
            >
              🎯 Marco
            </span>
          )}
          {completedCount > 0 && (
            <span className="text-xs" style={{ color: 'var(--ffv-green)' }}>
              {completedCount}/{week.modules.length} ✓
            </span>
          )}
          <span style={{ color: 'var(--ffv-muted)' }}>{open ? '▲' : '▼'}</span>
        </div>
      </button>

      {/* Milestone badge */}
      {open && week.milestone && (
        <div
          className="mx-5 mb-3 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2"
          style={{
            background: 'color-mix(in srgb, var(--ffv-green) 10%, transparent)',
            color: 'var(--ffv-green)',
            border: '1px solid color-mix(in srgb, var(--ffv-green) 30%, transparent)',
          }}
        >
          🎯 {week.milestone}
        </div>
      )}

      {/* Module list */}
      {open && (
        <div className="px-5 pb-5 flex flex-col gap-2">
          {week.modules.map(mod => (
            <Link
              key={mod.slug}
              href={`/aprenda/${mod.slug}`}
              className="flex items-start gap-3 p-3 rounded-lg transition-colors hover:opacity-80"
              style={{ background: 'var(--ffv-bg3)', border: '1px solid var(--ffv-border)' }}
            >
              {/* Trail color chip */}
              <div
                className="w-1.5 self-stretch rounded-full shrink-0 mt-0.5"
                style={{ background: mod.trailColor }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: `${mod.trailColor}22`,
                      color: mod.trailColor,
                      border: `1px solid ${mod.trailColor}44`,
                    }}
                  >
                    {mod.trailName}
                  </span>
                  {mod.isCompleted && (
                    <span className="text-xs" style={{ color: 'var(--ffv-green)' }}>✓ Concluído</span>
                  )}
                </div>
                <div
                  className="text-sm font-medium mt-1"
                  style={{ color: mod.isCompleted ? 'var(--ffv-muted)' : 'var(--foreground)' }}
                >
                  {mod.title}
                </div>
                <div className="text-xs mt-1 flex gap-3" style={{ color: 'var(--ffv-muted)' }}>
                  <span>{mod.readTime}min leitura</span>
                  <span>+{mod.xp} XP</span>
                  <span className="italic">{mod.reason}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- Plan view ----------

interface PlanViewProps {
  plan: StudyPlan;
  onRegenerate: () => void;
}

function PlanView({ plan, onRegenerate }: PlanViewProps) {
  const goalMeta = GOAL_LABELS[plan.goal.type];
  const completedInPlan = plan.weeks
    .flatMap(w => w.modules)
    .filter(m => m.isCompleted).length;
  const totalInPlan = plan.weeks.flatMap(w => w.modules).length;
  const pct = totalInPlan > 0 ? Math.round((completedInPlan / totalInPlan) * 100) : 0;

  function handlePrint() {
    window.print();
  }

  return (
    <div
      className="max-w-3xl mx-auto px-4 py-10"
      style={{ color: 'var(--foreground)' }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{goalMeta.icon}</span>
            <h1 className="text-2xl font-bold">{goalMeta.title}</h1>
          </div>
          <p style={{ color: 'var(--ffv-muted)' }} className="text-sm">
            {plan.goal.weeksAvailable} semanas · {plan.goal.hoursPerWeek}h/semana · {plan.weeks.length} semanas planejadas
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--ffv-muted)' }}>
            {plan.summary}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={onRegenerate}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors border"
            style={{
              background: 'var(--ffv-bg2)',
              borderColor: 'var(--ffv-border)',
              color: 'var(--foreground)',
            }}
          >
            ↻ Regenerar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-colors border"
            style={{
              background: 'var(--ffv-bg2)',
              borderColor: 'var(--ffv-border)',
              color: 'var(--foreground)',
            }}
          >
            ⬇ Exportar PDF
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs mb-1.5" style={{ color: 'var(--ffv-muted)' }}>
          <span>Progresso do plano</span>
          <span>{completedInPlan}/{totalInPlan} módulos ({pct}%)</span>
        </div>
        <div
          className="h-2.5 rounded-full overflow-hidden"
          style={{ background: 'var(--ffv-bg3)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'var(--ffv-green)' }}
          />
        </div>
      </div>

      {/* Key milestones */}
      {plan.keyMilestones.length > 0 && (
        <section className="mb-8">
          <h2
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: 'var(--ffv-muted)' }}
          >
            Marcos do plano
          </h2>
          <MilestoneTimeline milestones={plan.keyMilestones} />
        </section>
      )}

      {/* Week cards */}
      <section>
        <h2
          className="text-xs font-semibold uppercase tracking-widest mb-4"
          style={{ color: 'var(--ffv-muted)' }}
        >
          Semana a semana
        </h2>
        <div className="flex flex-col gap-3">
          {plan.weeks.map((week, i) => (
            <WeekCard key={week.weekNumber} week={week} defaultOpen={i === 0} />
          ))}
        </div>
      </section>

      <div
        className="mt-8 text-center text-xs"
        style={{ color: 'var(--ffv-muted)' }}
      >
        Plano gerado em {new Date(plan.generatedAt).toLocaleDateString('pt-BR')} ·{' '}
        <button
          type="button"
          onClick={onRegenerate}
          className="underline hover:no-underline"
        >
          gerar novo plano
        </button>
      </div>
    </div>
  );
}

// ---------- Main component ----------

type Screen = 'setup' | 'generating' | 'plan';

export function PlanoClient() {
  const { state } = useGameState();
  const [screen, setScreen] = useState<Screen>('setup');
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [hasSavedPlan, setHasSavedPlan] = useState(false);

  // Load persisted plan on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StudyPlan;
        if (parsed?.weeks?.length > 0) {
          setHasSavedPlan(true);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const handleResume = useCallback(() => {
    try {
      const raw = localStorage.getItem(PLAN_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as StudyPlan;
      setPlan(parsed);
      setScreen('plan');
    } catch {
      // ignore
    }
  }, []);

  const handleGenerate = useCallback((goal: PlanGoal) => {
    setScreen('generating');

    // 800ms animation delay before generating
    setTimeout(() => {
      const completedModules = state?.completedModules ?? [];
      const quizScores = state?.quizScores ?? {};
      const studyDays = (state?.studyDays ?? []).map(d => ({ date: d.date, minutes: d.minutes }));

      const newPlan = generateStudyPlan(goal, completedModules, quizScores, studyDays);

      try {
        localStorage.setItem(PLAN_STORAGE_KEY, JSON.stringify(newPlan));
        setHasSavedPlan(true);
      } catch {
        // storage full or unavailable — continue without persistence
      }

      setPlan(newPlan);
      setScreen('plan');
    }, 800);
  }, [state]);

  const handleRegenerate = useCallback(() => {
    setPlan(null);
    setScreen('setup');
  }, []);

  return (
    <main
      className="min-h-screen"
      style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)' }}
    >
      {screen === 'setup' && (
        <SetupScreen
          onGenerate={handleGenerate}
          hasSavedPlan={hasSavedPlan}
          onResume={handleResume}
        />
      )}
      {screen === 'generating' && <GeneratingAnimation />}
      {screen === 'plan' && plan && (
        <PlanView plan={plan} onRegenerate={handleRegenerate} />
      )}
    </main>
  );
}
