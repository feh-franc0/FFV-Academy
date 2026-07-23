'use client';

import { useUserPreferences } from '@/hooks/useUserPreferences';
import { listBases } from '@/lib/bases/registry';
import { countSignals, type MaterialKind } from '@/lib/user-preferences';

/**
 * ProfilePreferencesForm — perfil de aprendizado editável.
 *
 * Aderente à Fase 3 do PERSONALIZATION_PLAN.md: 4 seções (Bases,
 * Metas, Ritmo, Materiais). Cada mudança autosave no localStorage
 * (V1). Banner motivacional mostra "X/4 sinais desbloqueados" —
 * não bloqueante.
 *
 * Estratégico (do EXECUTIVE_PLAN_2026-05.md): o portal se moldar ao
 * aluno é o nosso moat vs NotebookLM/ChatGPT — quanto mais o aluno
 * usa, mais aderente fica a base. Coletar essa intent é o primeiro
 * sinal.
 */

const MATERIAL_OPTIONS: { value: MaterialKind; label: string; emoji: string }[] = [
  { value: 'video',      label: 'Vídeo',         emoji: '🎬' },
  { value: 'text',       label: 'Texto longo',   emoji: '📄' },
  { value: 'quiz',       label: 'Quiz interativo', emoji: '✏️' },
  { value: 'srs',        label: 'Cards de revisão', emoji: '🧠' },
  { value: 'cheatsheet', label: 'Cheat sheets',  emoji: '📋' },
];

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function ProfilePreferencesForm() {
  const { prefs, update, hydrated } = useUserPreferences();
  const bases = listBases();
  const signals = countSignals(prefs);

  function toggleBase(slug: string) {
    const set = new Set(prefs.interestedBases);
    if (set.has(slug)) set.delete(slug);
    else set.add(slug);
    const next = Array.from(set);
    // Se removeu a homeBase, limpa
    const homeBase = prefs.homeBase && set.has(prefs.homeBase) ? prefs.homeBase : null;
    update({ interestedBases: next, homeBase });
  }

  function toggleMaterial(kind: MaterialKind) {
    const set = new Set(prefs.preferredMaterials);
    if (set.has(kind)) set.delete(kind);
    else set.add(kind);
    update({ preferredMaterials: Array.from(set) });
  }

  // Não renderiza valores reais até hidratar — evita flash de SSR vs client.
  if (!hydrated) {
    return (
      <div
        className="rounded-2xl p-6"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          minHeight: 240,
        }}
        aria-busy="true"
      >
        <p className="text-sm" style={{ color: 'var(--ffv-muted)' }}>
          Carregando suas preferências…
        </p>
      </div>
    );
  }

  return (
    <section
      data-testid="profile-preferences-form"
      className="rounded-2xl p-6 md:p-8 flex flex-col gap-7"
      style={{
        background: 'var(--ffv-bg2)',
        border: '1px solid var(--ffv-border)',
      }}
    >
      <header>
        <p
          className="font-mono uppercase text-[11px] mb-2"
          style={{ color: 'var(--ffv-amber)', letterSpacing: '0.14em', fontWeight: 700 }}
        >
          Perfil de aprendizado
        </p>
        <h2
          style={{
            fontWeight: 800,
            fontSize: 'clamp(1.3rem, 2.4vw, 1.7rem)',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 8,
          }}
        >
          Conte o que combina com você.
        </h2>
        <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.55 }}>
          Quanto mais a gente sabe, melhor a plataforma fica.{' '}
          <strong style={{ color: 'var(--foreground)' }}>
            Sinais desbloqueados: {signals}/4
          </strong>{' '}
          — tudo salva sozinho.
        </p>
        <div
          className="mt-3 h-1.5 rounded-full overflow-hidden"
          style={{ background: 'var(--ffv-bg)' }}
          role="progressbar"
          aria-valuenow={signals}
          aria-valuemin={0}
          aria-valuemax={4}
        >
          <div
            style={{
              width: `${(signals / 4) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--ffv-amber), #c2410c)',
              transition: 'width 320ms ease',
            }}
          />
        </div>
      </header>

      {/* Seção 1 — Bases de interesse */}
      <details open className="group">
        <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          1. Bases de conhecimento que te interessam
        </summary>
        <p className="text-xs mt-2 mb-3" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
          Marque as áreas que quer estudar. Bases marcadas como &ldquo;na fila&rdquo; aparecem aqui
          quando entrarem no ar.
        </p>
        <ul className="grid sm:grid-cols-2 gap-2 list-none p-0">
          {bases.map(base => {
            const checked = prefs.interestedBases.includes(base.slug);
            const isHome = prefs.homeBase === base.slug;
            return (
              <li key={base.slug}>
                <button
                  type="button"
                  onClick={() => toggleBase(base.slug)}
                  aria-pressed={checked}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors"
                  style={{
                    background: checked ? 'color-mix(in srgb, var(--ffv-amber) 8%, transparent)' : 'var(--ffv-bg)',
                    border: checked
                      ? '1px solid var(--ffv-amber)'
                      : '1px solid var(--ffv-border)',
                    color: 'var(--foreground)',
                  }}
                >
                  <span style={{ fontSize: 20 }} aria-hidden>{base.icon}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium block truncate">{base.name}</span>
                    <span className="text-xs block truncate" style={{ color: 'var(--ffv-muted)' }}>
                      {base.area}
                    </span>
                  </div>
                  {checked && (
                    <span
                      className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded"
                      style={{
                        background: 'var(--ffv-amber)',
                        color: '#fff',
                        letterSpacing: '0.08em',
                      }}
                    >
                      {isHome ? 'home' : 'on'}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </details>

      {/* Seção 2 — Home base */}
      {prefs.interestedBases.length > 0 && (
        <details open>
          <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            2. Qual é sua &ldquo;casa&rdquo;?
          </summary>
          <p className="text-xs mt-2 mb-3" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
            Vamos te levar direto pra base escolhida sempre que você abrir o portal.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => update({ homeBase: null })}
              aria-pressed={prefs.homeBase === null}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: prefs.homeBase === null ? 'var(--ffv-ink)' : 'var(--ffv-bg)',
                color: prefs.homeBase === null ? '#fff' : 'var(--foreground)',
                border: '1px solid var(--ffv-border)',
              }}
            >
              Sem preferência
            </button>
            {bases
              .filter(b => prefs.interestedBases.includes(b.slug))
              .map(b => (
                <button
                  key={b.slug}
                  type="button"
                  onClick={() => update({ homeBase: b.slug })}
                  aria-pressed={prefs.homeBase === b.slug}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    background: prefs.homeBase === b.slug ? 'var(--ffv-amber)' : 'var(--ffv-bg)',
                    color: prefs.homeBase === b.slug ? '#fff' : 'var(--foreground)',
                    border: '1px solid var(--ffv-border)',
                  }}
                >
                  {b.icon} {b.name}
                </button>
              ))}
          </div>
        </details>
      )}

      {/* Seção 3 — Metas */}
      <details open>
        <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          3. O que você quer dominar?
        </summary>
        <p className="text-xs mt-2 mb-3" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
          Texto livre, até 280 caracteres. A gente usa isso pra priorizar trilhas e revisão.
        </p>
        <textarea
          value={prefs.learningGoals}
          onChange={e => update({ learningGoals: e.target.value.slice(0, 280) })}
          rows={3}
          placeholder="Ex.: Passar na prova de Genética em 4 semanas / dominar transformers até o final do ano / OAB 2ª fase de Direito Civil"
          className="w-full px-3 py-2 rounded-lg text-sm"
          style={{
            background: 'var(--ffv-bg)',
            border: '1px solid var(--ffv-border)',
            color: 'var(--foreground)',
            outline: 'none',
            resize: 'vertical',
            minHeight: 84,
          }}
          maxLength={280}
        />
        <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--ffv-muted)' }}>
          {prefs.learningGoals.length}/280
        </p>
      </details>

      {/* Seção 4 — Ritmo */}
      <details open>
        <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          4. Com que frequência?
        </summary>
        <p className="text-xs mt-2 mb-3" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
          A gente respeita o ritmo declarado — streak congela em dias de descanso planejado.
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {(['daily', 'weekly', 'specific_days'] as const).map(kind => (
            <button
              key={kind}
              type="button"
              onClick={() =>
                update({
                  frequency:
                    kind === 'daily'
                      ? { kind: 'daily' }
                      : kind === 'weekly'
                        ? { kind: 'weekly', daysPerWeek: 3 }
                        : { kind: 'specific_days', weekdays: [1, 3, 5] },
                })
              }
              aria-pressed={prefs.frequency.kind === kind}
              className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
              style={{
                background: prefs.frequency.kind === kind ? 'var(--ffv-blue)' : 'var(--ffv-bg)',
                color: prefs.frequency.kind === kind ? '#fff' : 'var(--foreground)',
                border: '1px solid var(--ffv-border)',
              }}
            >
              {kind === 'daily' && 'Todo dia'}
              {kind === 'weekly' && 'X dias por semana'}
              {kind === 'specific_days' && 'Dias específicos'}
            </button>
          ))}
        </div>
        {prefs.frequency.kind === 'weekly' && (
          <label className="flex items-center gap-3 text-sm">
            <input
              type="range"
              min={1}
              max={6}
              step={1}
              value={prefs.frequency.daysPerWeek}
              onChange={e =>
                update({ frequency: { kind: 'weekly', daysPerWeek: Number(e.target.value) } })
              }
              className="flex-1"
            />
            <span className="font-mono" style={{ color: 'var(--ffv-blue)', fontWeight: 700 }}>
              {prefs.frequency.daysPerWeek} dia{prefs.frequency.daysPerWeek > 1 ? 's' : ''}/semana
            </span>
          </label>
        )}
        {prefs.frequency.kind === 'specific_days' && (
          <div className="flex flex-wrap gap-1.5">
            {WEEKDAY_LABELS.map((lbl, i) => {
              const active =
                prefs.frequency.kind === 'specific_days' && prefs.frequency.weekdays.includes(i);
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
                    update({ frequency: { kind: 'specific_days', weekdays: Array.from(set).sort() } });
                  }}
                  className="px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: active ? 'var(--ffv-blue)' : 'var(--ffv-bg)',
                    color: active ? '#fff' : 'var(--foreground)',
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
      </details>

      {/* Seção 5 — Materiais favoritos */}
      <details open>
        <summary className="cursor-pointer text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
          5. Como você aprende melhor?
        </summary>
        <p className="text-xs mt-2 mb-3" style={{ color: 'var(--ffv-muted)', lineHeight: 1.5 }}>
          Marque tudo que se aplica. A gente prioriza esses formatos na sua trilha.
        </p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_OPTIONS.map(opt => {
            const active = prefs.preferredMaterials.includes(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => toggleMaterial(opt.value)}
                aria-pressed={active}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                style={{
                  background: active ? 'color-mix(in srgb, var(--ffv-amber) 12%, transparent)' : 'var(--ffv-bg)',
                  color: 'var(--foreground)',
                  border: active ? '1px solid var(--ffv-amber)' : '1px solid var(--ffv-border)',
                }}
              >
                {opt.emoji} {opt.label}
              </button>
            );
          })}
        </div>
      </details>

      <footer
        className="pt-4 text-xs"
        style={{ borderTop: '1px solid var(--ffv-border)', color: 'var(--ffv-muted)' }}
      >
        💾 Tudo salva sozinho no seu dispositivo. Quando você logar, a gente sincroniza com sua conta — sem cobrar nada.
      </footer>
    </section>
  );
}
