'use client';

/**
 * OnboardingWizard — modal bloqueante exibido após o primeiro login,
 * coleta as preferências pedagógicas em 3 passos curtos:
 *
 *   1. Objetivo principal (certificações, evolução, hobby, troca de área)
 *   2. Hubs de interesse (multi-select)
 *   3. Nível autodeclarado + certificação atual (opcional)
 *
 * Salva tudo numa única chamada PUT /api/v1/me/preferences ao final.
 * O backend marca onboarded_at automaticamente. UI reflete na próxima
 * renderização via refresh() do hook do parent.
 *
 * UX:
 *   - Stepper visual no topo (1/2/3)
 *   - "Voltar" + "Próximo" / "Salvar"
 *   - Mostra erro inline se PUT falhar
 *   - Dispensável apenas ao terminar — não tem X de fechar (intencional).
 */

import { useRef, useState } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import {
  updatePreferences,
  HUB_OPTIONS,
  CERTIFICATION_OPTIONS,
  OBJECTIVE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  type Objective,
  type SkillLevel,
  type Preferences,
} from '@/lib/preferences-api';

interface Props {
  onComplete: (prefs: Preferences) => void | Promise<void>;
}

type Step = 1 | 2 | 3;

export function OnboardingWizard({ onComplete }: Props) {
  const [step, setStep] = useState<Step>(1);
  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [hubIds, setHubIds] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('');
  const [certificationIds, setCertificationIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true);

  function toggle<T extends string>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  }

  const canAdvance =
    (step === 1 && objectives.length > 0) ||
    (step === 2 && hubIds.length > 0) ||
    (step === 3 && skillLevel !== '');

  async function handleSubmit() {
    setSaving(true);
    setError(null);
    try {
      const prefs = await updatePreferences({
        objectives,
        hubIds,
        skillLevel,
        certificationIds,
      });
      await onComplete(prefs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar preferências');
      setSaving(false);
    }
  }

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{ background: 'var(--ffv-bg)', border: '1px solid var(--ffv-border)' }}
      >
        {/* Header com stepper */}
        <header className="px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--ffv-border)' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-mono uppercase tracking-widest" style={{ color: '#f78166' }}>
              Bem-vindo · {step}/3
            </p>
            <div className="flex gap-1.5">
              {[1, 2, 3].map(s => (
                <span
                  key={s}
                  className="w-8 h-1 rounded-full transition-colors"
                  style={{ background: s <= step ? '#f78166' : 'var(--ffv-border)' }}
                />
              ))}
            </div>
          </div>
          <h2 id="onboarding-title" className="text-xl md:text-2xl font-bold">
            {step === 1 && 'Qual seu objetivo principal?'}
            {step === 2 && 'O que você quer estudar?'}
            {step === 3 && 'Conte um pouco sobre você'}
          </h2>
          <p className="text-xs mt-1" style={{ color: 'var(--ffv-muted)' }}>
            {step === 1 && 'Escolha 1 ou mais — vamos personalizar o app pra você'}
            {step === 2 && 'Pode marcar quantos hubs quiser. Recomendaremos trilhas com base nessas escolhas'}
            {step === 3 && 'Isso ajuda a calibrar a dificuldade do conteúdo recomendado'}
          </p>
        </header>

        {/* Body */}
        <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {OBJECTIVE_OPTIONS.map(opt => {
                const active = objectives.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setObjectives(toggle(objectives, opt.id))}
                    aria-pressed={active}
                    className="text-left p-4 rounded-xl transition-all"
                    style={{
                      background: active ? 'rgba(247,129,102,0.12)' : 'var(--ffv-bg2)',
                      border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{opt.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold mb-0.5">{opt.label}</p>
                        <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {HUB_OPTIONS.map(opt => {
                const active = hubIds.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setHubIds(toggle(hubIds, opt.id))}
                    aria-pressed={active}
                    className="text-left p-3 rounded-xl transition-all"
                    style={{
                      background: active ? 'rgba(247,129,102,0.12)' : 'var(--ffv-bg2)',
                      border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                    }}
                  >
                    <div className="flex items-start gap-2.5">
                      <span className="text-xl shrink-0">{opt.icon}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold mb-0.5 leading-tight">{opt.label}</p>
                        <p className="text-[11px] leading-snug" style={{ color: 'var(--ffv-muted)' }}>
                          {opt.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--ffv-muted)' }}>
                  Nível atual
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {SKILL_LEVEL_OPTIONS.map(opt => {
                    const active = skillLevel === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setSkillLevel(opt.id)}
                        aria-pressed={active}
                        className="text-left p-3 rounded-xl transition-all"
                        style={{
                          background: active ? 'rgba(247,129,102,0.12)' : 'var(--ffv-bg2)',
                          border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                        }}
                      >
                        <p className="text-sm font-semibold mb-0.5">{opt.label}</p>
                        <p className="text-[11px]" style={{ color: 'var(--ffv-muted)' }}>
                          {opt.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-2" style={{ color: 'var(--ffv-muted)' }}>
                  Certificações que vai estudar <span className="opacity-60">(opcional)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATION_OPTIONS.map(opt => {
                    const active = certificationIds.includes(opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setCertificationIds(toggle(certificationIds, opt.id))}
                        aria-pressed={active}
                        className="text-xs px-3 py-2 rounded-full transition-all"
                        style={{
                          background: active ? 'rgba(247,129,102,0.18)' : 'var(--ffv-bg2)',
                          border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                          color: active ? '#f78166' : 'var(--foreground)',
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {error && (
            <p
              className="mt-4 text-xs px-3 py-2 rounded-lg"
              role="alert"
              style={{
                background: 'rgba(248,81,73,0.1)',
                color: '#f85149',
                border: '1px solid rgba(248,81,73,0.3)',
              }}
            >
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 flex items-center justify-between gap-3" style={{ borderTop: '1px solid var(--ffv-border)' }}>
          <button
            type="button"
            onClick={() => setStep(prev => (prev > 1 ? ((prev - 1) as Step) : prev))}
            disabled={step === 1 || saving}
            className="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-30"
            style={{ background: 'var(--ffv-bg2)', color: 'var(--ffv-muted)', border: '1px solid var(--ffv-border)' }}
          >
            ← Voltar
          </button>

          {step < 3 ? (
            <button
              type="button"
              onClick={() => setStep(prev => ((prev + 1) as Step))}
              disabled={!canAdvance || saving}
              className="flex-1 max-w-[200px] py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background: '#f78166', color: '#0d1117' }}
            >
              Próximo →
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canAdvance || saving}
              className="flex-1 max-w-[240px] py-2.5 rounded-lg text-sm font-bold disabled:opacity-40"
              style={{ background: '#f78166', color: '#0d1117' }}
            >
              {saving ? 'Salvando…' : 'Finalizar e começar 🚀'}
            </button>
          )}
        </footer>
      </div>
    </div>
  );
}
