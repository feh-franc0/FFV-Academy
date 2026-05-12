'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Copy, Share2, Check, Pencil, X } from 'lucide-react';
import { useGameState } from '@/hooks/useGameState';
import { BADGES_DEF, CURRICULUM, getLevelInfo, getTrailProgress } from '@/lib/curriculum';
import { getRaw, setRaw } from '@/lib/storage';
import { STORAGE_KEYS } from '@/lib/constants';

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatMemberSince(isoDate: string | null | undefined): string {
  if (!isoDate) return 'Recém chegou';
  const d = new Date(isoDate);
  return d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}min` : `${h}h`;
}

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .map(w => w[0]?.toUpperCase() ?? '')
    .slice(0, 2)
    .join('');
}

// ─── sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children, color = 'var(--ffv-blue)' }: { children: React.ReactNode; color?: string }) {
  return (
    <span
      className="font-mono uppercase"
      style={{ fontSize: 10, letterSpacing: '0.14em', color, fontWeight: 700 }}
    >
      {children}
    </span>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        background: 'var(--ffv-bg2)',
        border: `1px solid color-mix(in srgb, ${accent} 20%, transparent)`,
      }}
    >
      <div
        className="font-mono uppercase"
        style={{ fontSize: 10, color: accent, letterSpacing: '0.12em', fontWeight: 700 }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginTop: 4 }}>
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4 }}>{sub}</div>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────────────────────

export function DevProfileClient() {
  const { state, levelInfo, weeklyStats } = useGameState();
  const [name, setName] = useState<string>('');
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [copied, setCopied] = useState(false);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    const stored = getRaw(STORAGE_KEYS.USER_NAME) ?? '';
    setName(stored);
    setNameInput(stored);
  }, []);

  function handleSaveName() {
    const trimmed = nameInput.trim();
    setName(trimmed);
    setRaw(STORAGE_KEYS.USER_NAME, trimmed);
    setEditingName(false);
  }

  function handleCancelEdit() {
    setNameInput(name);
    setEditingName(false);
  }

  async function handleCopyLink() {
    const url = typeof window !== 'undefined' ? window.location.href : 'https://ffv.academy/perfil';
    await navigator.clipboard.writeText(url).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleLinkedIn() {
    if (!state) return;
    const li = getLevelInfo(state.xp);
    const text = `Meu perfil dev na FFV Academy — Nível ${state.level} (${li.name}), ${state.xp.toLocaleString('pt-BR')} XP, ${state.completedModules.length} módulos concluídos. Aprenda IA, AWS e Engenharia de Software como engenheiro: ffv.academy`;
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://ffv.academy/perfil')}&summary=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'noopener');
  }

  // ── loading / empty states ──────────────────────────────────────────────────

  if (!state) {
    return (
      <div style={{ background: 'var(--ffv-bg)', minHeight: '100vh', color: 'var(--foreground)' }}>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div style={{ fontSize: 40, marginBottom: 12 }}>👤</div>
          <p style={{ color: 'var(--ffv-muted)' }}>Carregando perfil…</p>
        </div>
      </div>
    );
  }

  // ── derived data ────────────────────────────────────────────────────────────

  const li = levelInfo ?? getLevelInfo(state.xp);
  const displayName = name || 'Dev';
  const initials = getInitials(displayName);

  // XP progress within the current level
  const levelPct = Math.min(
    100,
    li.xpMax === li.xpMin
      ? 100
      : Math.round(((state.xp - li.xpMin) / (li.xpMax - li.xpMin)) * 100)
  );

  const totalModules = CURRICULUM.reduce((a, t) => a + t.modules.length, 0);
  const overallPct = totalModules === 0 ? 0 : Math.round((state.completedModules.length / totalModules) * 100);

  // Quiz accuracy
  const quizEntries = Object.values(state.quizScores);
  const totalAnswered = quizEntries.reduce((a, s) => a + s.total, 0);
  const totalCorrect = quizEntries.reduce((a, s) => a + s.score, 0);
  const quizAvg = totalAnswered === 0 ? null : Math.round((totalCorrect / totalAnswered) * 100);

  // Trails with any progress
  const trailsWithProgress = CURRICULUM.map(t => ({
    ...t,
    ...getTrailProgress(t.modules, state.completedModules),
  })).filter(t => t.done > 0);

  // Badges
  const earnedBadges = BADGES_DEF.filter(b => state.badges.includes(b.id));
  const unearnedBadges = BADGES_DEF.filter(b => !state.badges.includes(b.id));
  const visibleBadges = showAllBadges
    ? [...earnedBadges, ...unearnedBadges]
    : [...earnedBadges, ...unearnedBadges].slice(0, 20);

  // Study stats
  const allDays = state.studyDays;
  const avgXpPerDay =
    allDays.length === 0
      ? 0
      : Math.round(allDays.reduce((a, d) => a + d.xpEarned, 0) / allDays.length);

  // Quiz performance per trail (for bar chart)
  const trailQuizData = CURRICULUM.map(t => {
    const slugs = t.modules.map(m => m.slug);
    const scores = slugs.filter(s => state.quizScores[s]).map(s => state.quizScores[s]);
    const answered = scores.reduce((a, s) => a + s.total, 0);
    const correct = scores.reduce((a, s) => a + s.score, 0);
    const pct = answered === 0 ? null : Math.round((correct / answered) * 100);
    return { id: t.id, name: t.name, icon: t.icon, color: t.color, pct };
  }).filter(t => t.pct !== null);

  // Empty state
  if (state.completedModules.length === 0) {
    return (
      <div style={{ background: 'var(--ffv-bg)', minHeight: '100vh', color: 'var(--foreground)' }}>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌱</div>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 8 }}>
            Seu perfil está esperando por você
          </h1>
          <p style={{ color: 'var(--ffv-muted)', maxWidth: 420, margin: '0 auto 24px' }}>
            Complete módulos, ganhe XP e desbloqueie badges para construir seu perfil de desenvolvedor.
          </p>
          <Link
            href="/explorar"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            style={{
              background: 'var(--ffv-blue)',
              color: '#fff',
              textDecoration: 'none',
            }}
          >
            Começar a aprender →
          </Link>
        </div>
      </div>
    );
  }

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <div style={{ background: 'var(--ffv-bg)', minHeight: '100vh', color: 'var(--foreground)' }}>

      {/* HERO */}
      <section
        className="relative px-6 pt-14 pb-12"
        style={{ borderBottom: '1px solid var(--ffv-border)' }}
      >
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse 80% 55% at 50% 0%, color-mix(in srgb, ${li.color} 18%, transparent) 0%, transparent 70%)`,
          }}
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Back nav */}
          <Link
            href="/progresso"
            className="inline-flex items-center gap-1 text-xs font-mono mb-8 transition-opacity hover:opacity-70"
            style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em', textDecoration: 'none' }}
          >
            ← PROGRESSO
          </Link>

          <div className="flex items-start gap-6 flex-wrap">
            {/* Avatar */}
            <div
              className="relative flex-shrink-0 flex items-center justify-center"
              style={{
                width: 80,
                height: 80,
                borderRadius: 22,
                background: `color-mix(in srgb, ${li.color} 16%, var(--ffv-bg2))`,
                border: `2px solid color-mix(in srgb, ${li.color} 45%, transparent)`,
                fontSize: 26,
                fontWeight: 800,
                color: li.color,
              }}
            >
              {initials || '?'}
            </div>

            {/* Name + level */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={nameInput}
                      onChange={e => setNameInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') handleSaveName();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      placeholder="Seu nome..."
                      autoFocus
                      className="px-3 py-1.5 rounded-lg text-sm"
                      style={{
                        background: 'var(--ffv-bg2)',
                        border: '1px solid var(--ffv-border)',
                        color: 'var(--foreground)',
                        width: 200,
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleSaveName}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'var(--ffv-blue)', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="p-1.5 rounded-lg"
                      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', cursor: 'pointer', color: 'var(--ffv-muted)' }}
                      aria-label="Cancelar edição"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <h1
                      style={{
                        fontSize: 'clamp(1.4rem, 3vw, 2rem)',
                        fontWeight: 800,
                        letterSpacing: '-0.02em',
                        lineHeight: 1.2,
                      }}
                    >
                      {displayName}
                    </h1>
                    <button
                      type="button"
                      onClick={() => { setNameInput(name); setEditingName(true); }}
                      className="p-1.5 rounded-lg transition-opacity hover:opacity-80"
                      style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', cursor: 'pointer', color: 'var(--ffv-muted)' }}
                      aria-label="Editar nome"
                    >
                      <Pencil size={13} />
                    </button>
                  </>
                )}
              </div>

              {/* Level badge */}
              <div className="flex items-center gap-2 flex-wrap mt-2">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: `color-mix(in srgb, ${li.color} 16%, transparent)`,
                    border: `1px solid color-mix(in srgb, ${li.color} 40%, transparent)`,
                    color: li.color,
                  }}
                >
                  {li.icon} Nível {state.level} · {li.name}
                </span>

                {state.streak > 0 && (
                  <span
                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                    style={{
                      background: 'color-mix(in srgb, var(--ffv-orange) 12%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--ffv-orange) 35%, transparent)',
                      color: 'var(--ffv-orange)',
                    }}
                  >
                    🔥 {state.streak} dias
                  </span>
                )}

                <span style={{ fontSize: 12, color: 'var(--ffv-muted)' }}>
                  Membro desde {formatMemberSince(state.startedAt)}
                </span>
              </div>

              {/* XP bar */}
              <div className="mt-4" style={{ maxWidth: 480 }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontSize: 12, color: 'var(--ffv-muted)' }}>
                    {state.xp.toLocaleString('pt-BR')} XP
                  </span>
                  <span style={{ fontSize: 11, color: li.color, fontWeight: 700 }}>
                    {levelPct}% do nível
                  </span>
                </div>
                <div style={{ height: 6, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${levelPct}%`,
                      height: '100%',
                      background: `linear-gradient(90deg, ${li.color}, color-mix(in srgb, ${li.color} 60%, white))`,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="max-w-4xl mx-auto px-6 py-10">
        <SectionLabel>VISÃO GERAL</SectionLabel>
        <div className="grid gap-4 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <StatCard
            label="Módulos"
            value={`${state.completedModules.length}`}
            sub={`de ${totalModules} · ${overallPct}%`}
            accent="var(--ffv-blue)"
          />
          <StatCard
            label="Badges"
            value={`${state.badges.length}`}
            sub={`de ${BADGES_DEF.length} conquistas`}
            accent="var(--ffv-yellow)"
          />
          <StatCard
            label="Horas estudadas"
            value={formatHours(state.totalStudyTime)}
            sub={`${allDays.length} sessões`}
            accent="var(--ffv-green)"
          />
          {quizAvg !== null && (
            <StatCard
              label="Precisão nos quizzes"
              value={`${quizAvg}%`}
              sub={`${totalAnswered} questões respondidas`}
              accent={quizAvg >= 80 ? 'var(--ffv-green)' : quizAvg >= 50 ? 'var(--ffv-yellow)' : 'var(--ffv-red)'}
            />
          )}
        </div>
      </section>

      {/* THIS WEEK */}
      {weeklyStats.activeDays > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-10">
          <SectionLabel>ESTA SEMANA</SectionLabel>
          <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))' }}>
            {[
              { icon: '📅', value: `${weeklyStats.activeDays}d`, label: 'dias ativos', color: 'var(--ffv-blue)' },
              { icon: '⚡', value: weeklyStats.xp.toLocaleString('pt-BR'), label: 'XP ganhos', color: 'var(--ffv-yellow)' },
              { icon: '⏱', value: formatHours(weeklyStats.minutes), label: 'estudando', color: 'var(--ffv-green)' },
              { icon: '🧠', value: `${weeklyStats.cards}`, label: 'cards revisados', color: 'var(--ffv-orange)' },
            ].map(s => (
              <div
                key={s.label}
                className="rounded-xl p-3 flex items-center gap-3"
                style={{
                  background: `color-mix(in srgb, ${s.color} 8%, var(--ffv-bg2))`,
                  border: `1px solid color-mix(in srgb, ${s.color} 22%, transparent)`,
                }}
              >
                <span style={{ fontSize: 20 }}>{s.icon}</span>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em' }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STUDY STATS */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <SectionLabel>ESTATÍSTICAS DE ESTUDO</SectionLabel>
        <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--ffv-blue)', letterSpacing: '0.12em', fontWeight: 700 }}>
              Sessões totais
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{allDays.length}</div>
            <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4 }}>dias de estudo</div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--ffv-green)', letterSpacing: '0.12em', fontWeight: 700 }}>
              XP médio/dia
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{avgXpPerDay}</div>
            <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4 }}>pontos por sessão</div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--ffv-orange)', letterSpacing: '0.12em', fontWeight: 700 }}>
              Cards SRS
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>{state.reviewCards.length}</div>
            <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4 }}>
              {state.archivedCards.length} arquivados
            </div>
          </div>
          <div
            className="rounded-xl p-4"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            <div className="font-mono uppercase" style={{ fontSize: 10, color: 'var(--ffv-yellow)', letterSpacing: '0.12em', fontWeight: 700 }}>
              Quiz perfeitos
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, marginTop: 4 }}>
              {Object.values(state.quizScores).filter(s => s.perfect).length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--ffv-muted)', marginTop: 4 }}>
              de {Object.keys(state.quizScores).length} quiz{Object.keys(state.quizScores).length !== 1 ? 'zes' : ''}
            </div>
          </div>
        </div>
      </section>

      {/* TRAIL PROGRESS */}
      {trailsWithProgress.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-10">
          <SectionLabel>TRILHAS EM PROGRESSO</SectionLabel>
          <div className="grid gap-3 mt-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {trailsWithProgress.map(t => (
              <div
                key={t.id}
                className="rounded-xl p-4"
                style={{
                  background: `color-mix(in srgb, ${t.color} 8%, var(--ffv-bg2))`,
                  border: `1px solid color-mix(in srgb, ${t.color} 28%, transparent)`,
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="flex-shrink-0 flex items-center justify-center"
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: `color-mix(in srgb, ${t.color} 16%, transparent)`,
                      border: `1px solid color-mix(in srgb, ${t.color} 35%, transparent)`,
                      fontSize: 17,
                    }}
                  >
                    {t.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{t.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--ffv-muted)' }}>
                      {t.done}/{t.total} módulos
                    </p>
                  </div>
                  <span
                    className="font-mono font-bold flex-shrink-0"
                    style={{ fontSize: 12, color: t.color }}
                  >
                    {t.pct}%
                  </span>
                </div>
                <div style={{ height: 4, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${t.pct}%`,
                      height: '100%',
                      background: t.color,
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>
                {t.pct === 100 && (
                  <p style={{ fontSize: 11, color: t.color, marginTop: 6, fontWeight: 700 }}>
                    ✓ Trilha concluída!
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* QUIZ PERFORMANCE CHART */}
      {trailQuizData.length > 0 && (
        <section className="max-w-4xl mx-auto px-6 pb-10">
          <SectionLabel>DESEMPENHO NOS QUIZZES</SectionLabel>
          <div
            className="mt-4 rounded-2xl overflow-hidden"
            style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
          >
            {trailQuizData.map((t, i) => (
              <div
                key={t.id}
                className="flex items-center gap-4 px-5 py-3"
                style={{ borderTop: i === 0 ? undefined : '1px solid var(--ffv-border)' }}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{t.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium text-sm truncate" style={{ maxWidth: 200 }}>{t.name}</span>
                    <span
                      className="font-mono font-bold text-xs flex-shrink-0 ml-2"
                      style={{
                        color:
                          (t.pct ?? 0) >= 80
                            ? 'var(--ffv-green)'
                            : (t.pct ?? 0) >= 50
                            ? 'var(--ffv-yellow)'
                            : 'var(--ffv-red)',
                      }}
                    >
                      {t.pct}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--ffv-bg3)', borderRadius: 999, overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${t.pct}%`,
                        height: '100%',
                        background:
                          (t.pct ?? 0) >= 80
                            ? 'var(--ffv-green)'
                            : (t.pct ?? 0) >= 50
                            ? 'var(--ffv-yellow)'
                            : 'var(--ffv-red)',
                        transition: 'width 0.4s ease',
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* BADGES */}
      <section className="max-w-4xl mx-auto px-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <SectionLabel>
            BADGES — {state.badges.length}/{BADGES_DEF.length}
          </SectionLabel>
        </div>

        {earnedBadges.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--ffv-muted)' }}>
            Nenhum badge ainda. Complete módulos e quizzes para desbloquear conquistas.
          </p>
        ) : (
          <>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {visibleBadges.map(b => {
                const owned = state.badges.includes(b.id);
                return (
                  <div
                    key={b.id}
                    className="p-4 rounded-xl"
                    style={{
                      background: owned
                        ? 'color-mix(in srgb, var(--ffv-yellow) 10%, transparent)'
                        : 'var(--ffv-bg2)',
                      border: owned
                        ? '1px solid color-mix(in srgb, var(--ffv-yellow) 35%, transparent)'
                        : '1px solid var(--ffv-border)',
                      opacity: owned ? 1 : 0.45,
                    }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ fontSize: 20 }}>{b.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{b.name}</span>
                    </div>
                    <p style={{ fontSize: 11, color: 'var(--ffv-muted)', lineHeight: 1.5 }}>{b.desc}</p>
                    {owned && (
                      <span
                        className="font-mono uppercase"
                        style={{ fontSize: 9, color: 'var(--ffv-yellow)', letterSpacing: '0.1em', marginTop: 6, display: 'inline-block' }}
                      >
                        desbloqueada · +{b.xpBonus} XP
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {BADGES_DEF.length > 20 && (
              <button
                type="button"
                onClick={() => setShowAllBadges(v => !v)}
                className="mt-4 text-xs font-semibold px-4 py-2 rounded-lg transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--ffv-bg2)',
                  border: '1px solid var(--ffv-border)',
                  color: 'var(--ffv-blue)',
                  cursor: 'pointer',
                }}
              >
                {showAllBadges ? `Mostrar menos ↑` : `Ver todos os ${BADGES_DEF.length} badges ↓`}
              </button>
            )}
          </>
        )}
      </section>

      {/* SHARE */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <SectionLabel>COMPARTILHAR PERFIL</SectionLabel>
        <div
          className="mt-4 rounded-2xl p-6"
          style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
        >
          <p style={{ fontSize: 13, color: 'var(--ffv-muted)', marginBottom: 16 }}>
            Compartilhe seu progresso com colegas ou no LinkedIn.
          </p>
          <div className="flex gap-3 flex-wrap">
            <button
              type="button"
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
              style={{
                background: copied
                  ? 'color-mix(in srgb, var(--ffv-green) 16%, transparent)'
                  : 'var(--ffv-bg)',
                border: copied
                  ? '1px solid color-mix(in srgb, var(--ffv-green) 40%, transparent)'
                  : '1px solid var(--ffv-border)',
                color: copied ? 'var(--ffv-green)' : 'var(--foreground)',
                cursor: 'pointer',
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Link copiado!' : 'Copiar link do perfil'}
            </button>

            <button
              type="button"
              onClick={handleLinkedIn}
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
              style={{ background: '#0a66c2', color: '#fff', border: 'none', cursor: 'pointer' }}
            >
              <Share2 size={16} />
              Compartilhar no LinkedIn
            </button>

            <Link
              href="/devcard"
              className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm"
              style={{
                background: 'color-mix(in srgb, var(--ffv-blue) 14%, transparent)',
                border: '1px solid color-mix(in srgb, var(--ffv-blue) 35%, transparent)',
                color: 'var(--ffv-blue)',
                textDecoration: 'none',
              }}
            >
              🃏 Gerar Dev Card PNG
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
