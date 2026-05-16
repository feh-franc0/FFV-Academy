'use client';

/**
 * Tela `/preferencias-aprendizado` — edição standalone das preferências
 * pedagógicas. Refletem instantaneamente no DailyQuestionCard e nas
 * recomendações do dashboard ao salvar.
 *
 * Não confundir com `/preferencias` (privacidade/LGPD). Esta tela é só
 * sobre conteúdo educacional.
 *
 * Estrutura: 4 seções colapsáveis na mesma tela (sem stepper) — UX de tela
 * de configurações tradicional, não de onboarding.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { usePreferences } from '@/hooks/usePreferences';
import {
  HUB_OPTIONS,
  CERTIFICATION_OPTIONS,
  OBJECTIVE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
  type Objective,
  type SkillLevel,
} from '@/lib/preferences-api';

export function PreferenciasAprendizadoClient() {
  const router = useRouter();
  const { isLoggedIn, requireLogin } = useAuth();
  const { preferences, status, update } = usePreferences();

  const [objectives, setObjectives] = useState<Objective[]>([]);
  const [hubIds, setHubIds] = useState<string[]>([]);
  const [certificationIds, setCertificationIds] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState<SkillLevel>('');
  const [dailyQuestionEnabled, setDailyQuestionEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) {
      requireLogin('editar preferências de aprendizado').catch(() => router.push('/'));
    }
  }, [isLoggedIn, requireLogin, router]);

  useEffect(() => {
    if (preferences) {
      setObjectives(preferences.objectives);
      setHubIds(preferences.hubIds);
      setCertificationIds(preferences.certificationIds);
      setSkillLevel(preferences.skillLevel);
      setDailyQuestionEnabled(preferences.dailyQuestionEnabled);
    }
  }, [preferences]);

  function toggle<T extends string>(list: T[], item: T): T[] {
    return list.includes(item) ? list.filter(i => i !== item) : [...list, item];
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await update({
        objectives,
        hubIds,
        certificationIds,
        skillLevel,
        dailyQuestionEnabled,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'erro ao salvar');
    } finally {
      setSaving(false);
    }
  }

  if (!isLoggedIn || status === 'loading') {
    return (
      <main className="max-w-3xl mx-auto px-6 py-12 text-sm" style={{ color: 'var(--ffv-muted)' }}>
        Carregando preferências…
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <nav className="text-xs mb-6" style={{ color: 'var(--ffv-muted)' }}>
        <Link href="/" style={{ color: 'var(--ffv-muted)' }}>FFV Academy</Link>
        <span className="mx-1">/</span>
        <span style={{ color: 'var(--foreground)' }}>Preferências de aprendizado</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">Preferências de aprendizado</h1>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Estas escolhas controlam a Pergunta do Dia, recomendações de trilhas e simulados em destaque.
          Você pode mudar a qualquer momento — salvar é instantâneo.
        </p>
      </header>

      {/* Objetivos */}
      <section className="mb-8 p-5 rounded-2xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-1">🎯 Objetivos</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>Marque um ou mais.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {OBJECTIVE_OPTIONS.map(opt => {
            const active = objectives.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setObjectives(toggle(objectives, opt.id))}
                aria-pressed={active}
                className="text-left p-3 rounded-xl transition-all"
                style={{
                  background: active ? 'rgba(247,129,102,0.12)' : 'var(--ffv-bg)',
                  border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                }}
              >
                <span className="text-lg mr-2">{opt.icon}</span>
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Hubs */}
      <section className="mb-8 p-5 rounded-2xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-1">📚 Hubs de interesse</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>O que você quer estudar.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
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
                  background: active ? 'rgba(247,129,102,0.12)' : 'var(--ffv-bg)',
                  border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                }}
              >
                <span className="text-lg mr-2">{opt.icon}</span>
                <span className="text-sm font-semibold">{opt.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Certificações */}
      <section className="mb-8 p-5 rounded-2xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-1">🏅 Certificações que vai estudar</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>Direciona Pergunta do Dia e simulados em destaque.</p>
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
                  background: active ? 'rgba(247,129,102,0.18)' : 'var(--ffv-bg)',
                  border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                  color: active ? '#f78166' : 'var(--foreground)',
                }}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Nível */}
      <section className="mb-8 p-5 rounded-2xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <h2 className="text-lg font-bold mb-1">📊 Nível atual</h2>
        <p className="text-xs mb-4" style={{ color: 'var(--ffv-muted)' }}>Calibra dificuldade do conteúdo recomendado.</p>
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
                  background: active ? 'rgba(247,129,102,0.12)' : 'var(--ffv-bg)',
                  border: `1px solid ${active ? '#f78166' : 'var(--ffv-border)'}`,
                }}
              >
                <p className="text-sm font-semibold">{opt.label}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--ffv-muted)' }}>
                  {opt.description}
                </p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Toggle Pergunta do Dia */}
      <section className="mb-8 p-5 rounded-2xl flex items-center gap-4" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-bold mb-1">❓ Pergunta do Dia no dashboard</h2>
          <p className="text-xs" style={{ color: 'var(--ffv-muted)' }}>
            Mostrar uma questão por dia das suas certificações na home logada.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setDailyQuestionEnabled(v => !v)}
          aria-pressed={dailyQuestionEnabled}
          className="relative w-12 h-7 rounded-full transition-colors shrink-0"
          style={{ background: dailyQuestionEnabled ? '#f78166' : 'var(--ffv-border)' }}
        >
          <span
            className="absolute top-0.5 w-6 h-6 rounded-full transition-transform"
            style={{
              background: '#fff',
              transform: dailyQuestionEnabled ? 'translateX(22px)' : 'translateX(2px)',
            }}
          />
        </button>
      </section>

      {error && (
        <p className="mb-4 text-xs px-3 py-2 rounded-lg" role="alert"
           style={{ background: 'rgba(248,81,73,0.1)', color: '#f85149', border: '1px solid rgba(248,81,73,0.3)' }}>
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 sticky bottom-6 z-10">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
          style={{ background: '#f78166', color: '#0d1117' }}
        >
          {saving ? 'Salvando…' : saved ? '✓ Salvo!' : 'Salvar preferências'}
        </button>
        <Link
          href="/"
          className="px-5 py-3 rounded-xl text-sm font-semibold"
          style={{ background: 'var(--ffv-bg2)', color: 'var(--foreground)', border: '1px solid var(--ffv-border)' }}
        >
          Voltar
        </Link>
      </div>
    </main>
  );
}
