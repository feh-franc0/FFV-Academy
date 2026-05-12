'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGameState } from '@/hooks/useGameState';
import { STORAGE_KEYS } from '@/lib/constants';
import {
  createTeam, joinTeam, getMyTeam, leaveTeam, exportTeamReport,
  type Team, type TeamMember,
} from '@/lib/teams';
import { CURRICULUM, getLevelInfo } from '@/lib/curriculum';

type View = 'home' | 'create' | 'join' | 'dashboard';

function buildSnapshot(state: NonNullable<ReturnType<typeof useGameState>['state']>, weeklyXp: number): Omit<TeamMember, 'id' | 'name' | 'role' | 'joinedAt'> {
  return {
    xp: state.xp,
    level: getLevelInfo(state.xp).level,
    completedModules: state.completedModules.length,
    streak: state.streak,
    badges: state.badges.length,
    weeklyXp,
  };
}

export function TimesClient() {
  const { state, weeklyStats } = useGameState();
  const [view, setView] = useState<View>('home');
  const [team, setTeam] = useState<Team | null>(null);
  // Create form
  const [teamName, setTeamName] = useState('');
  const [teamGoal, setTeamGoal] = useState('');
  const [creatorName, setCreatorName] = useState('');

  // Join form
  const [joinCode, setJoinCode] = useState('');
  const [joinerName, setJoinerName] = useState('');
  const [joinError, setJoinError] = useState('');

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const name = localStorage.getItem(STORAGE_KEYS.USER_NAME) ?? '';
    setCreatorName(name);
    setJoinerName(name);
    const existing = getMyTeam();
    if (existing) {
      setTeam(existing);
      setView('dashboard');
    }
  }, []);

  const handleCreate = useCallback(() => {
    if (!state || !teamName.trim() || !creatorName.trim()) return;
    const snapshot = buildSnapshot(state, weeklyStats.xp);
    const memberId = Math.random().toString(36).slice(2, 10);
    localStorage.setItem('ffv_team_member_id', memberId);
    const created = createTeam(teamName.trim(), creatorName.trim(), teamGoal.trim(), { ...snapshot, id: memberId, name: creatorName.trim(), role: 'admin', joinedAt: new Date().toISOString() });
    setTeam(created);
    setView('dashboard');
  }, [state, teamName, creatorName, teamGoal, weeklyStats.xp]);

  const handleJoin = useCallback(() => {
    if (!state || !joinCode.trim() || !joinerName.trim()) return;
    setJoinError('');
    const snapshot = buildSnapshot(state, weeklyStats.xp);
    const memberId = localStorage.getItem('ffv_team_member_id') ?? Math.random().toString(36).slice(2, 10);
    localStorage.setItem('ffv_team_member_id', memberId);
    const joined = joinTeam(joinCode.trim(), joinerName.trim(), { ...snapshot, id: memberId, name: joinerName.trim(), role: 'member', joinedAt: new Date().toISOString() });
    if (!joined) {
      setJoinError('Código inválido. Verifique e tente novamente.');
      return;
    }
    setTeam(joined);
    setView('dashboard');
  }, [state, joinCode, joinerName, weeklyStats.xp]);

  function handleLeave() {
    leaveTeam();
    setTeam(null);
    setView('home');
  }

  function handleCopyCode() {
    if (!team) return;
    navigator.clipboard.writeText(team.code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    if (!team) return;
    const text = exportTeamReport(team);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-${team.code}-relatorio.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalTrails = CURRICULUM.length;

  if (view === 'home') {
    return (
      <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)', minHeight: '100vh' }}>
        <section className="px-6 pt-16 pb-12 md:pt-24 md:pb-16 relative overflow-hidden">
          <div aria-hidden className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, color-mix(in srgb, var(--ffv-blue) 12%, transparent) 0%, transparent 60%)' }} />
          <div className="relative max-w-4xl mx-auto">
            <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70" style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}>
              ← VOLTAR PARA HOME
            </Link>
            <p className="font-mono uppercase tracking-widest text-xs mb-3" style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}>Times de estudo</p>
            <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.2rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: 16 }}>
              Aprenda mais rápido<br />em grupo.
            </h1>
            <p style={{ fontSize: 16, color: 'var(--ffv-muted)', maxWidth: 600, lineHeight: 1.7, marginBottom: 40 }}>
              Crie um time com sua equipe, turma ou grupo de amigos. Acompanhe o progresso de cada um, compare XP e se mantenham responsáveis juntos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setView('create')}
                className="px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
              >
                Criar time →
              </button>
              <button
                onClick={() => setView('join')}
                className="px-6 py-3 rounded-full font-bold text-sm transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)', color: 'var(--foreground)' }}
              >
                Entrar com código
              </button>
            </div>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6 pb-20">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '📊', title: 'Dashboard do time', desc: 'Leaderboard interno com XP semanal, módulos concluídos e streak de cada membro.' },
              { icon: '🔗', title: 'Código de convite', desc: 'Compartilhe um código de 6 letras. Qualquer pessoa com o código pode entrar no time.' },
              { icon: '📄', title: 'Relatório exportável', desc: 'Exporte o progresso do time em texto para enviar ao gestor ou líder de equipe.' },
            ].map(f => (
              <div key={f.title} className="p-6 rounded-2xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm" style={{ color: 'var(--ffv-muted)', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)', minHeight: '100vh' }}>
        <div className="max-w-lg mx-auto px-6 pt-16 pb-20">
          <button onClick={() => setView('home')} className="text-xs mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--ffv-muted)' }}>← Voltar</button>
          <h1 className="text-2xl font-bold mb-6">Criar time</h1>
          <div className="flex flex-col gap-4">
            <Field label="Seu nome" value={creatorName} onChange={setCreatorName} placeholder="Ex: Fernando" />
            <Field label="Nome do time" value={teamName} onChange={setTeamName} placeholder="Ex: Time Engenharia Backend" />
            <Field label="Objetivo (opcional)" value={teamGoal} onChange={setTeamGoal} placeholder="Ex: Passar na AWS SAA em 2 meses" />
            <button
              onClick={handleCreate}
              disabled={!teamName.trim() || !creatorName.trim() || !state}
              className="mt-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
            >
              Criar time →
            </button>
          </div>
          <p className="mt-4 text-xs" style={{ color: 'var(--ffv-muted)' }}>
            Seu progresso atual será compartilhado com o time. Você pode sair a qualquer momento.
          </p>
        </div>
      </div>
    );
  }

  if (view === 'join') {
    return (
      <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)', minHeight: '100vh' }}>
        <div className="max-w-lg mx-auto px-6 pt-16 pb-20">
          <button onClick={() => setView('home')} className="text-xs mb-8 hover:opacity-70 transition-opacity" style={{ color: 'var(--ffv-muted)' }}>← Voltar</button>
          <h1 className="text-2xl font-bold mb-6">Entrar em um time</h1>
          <div className="flex flex-col gap-4">
            <Field label="Seu nome" value={joinerName} onChange={setJoinerName} placeholder="Ex: Maria" />
            <Field
              label="Código do time"
              value={joinCode}
              onChange={v => { setJoinCode(v.toUpperCase()); setJoinError(''); }}
              placeholder="Ex: ABC123"
              mono
            />
            {joinError && <p className="text-sm" style={{ color: 'var(--ffv-red)' }}>{joinError}</p>}
            <button
              onClick={handleJoin}
              disabled={!joinCode.trim() || !joinerName.trim() || !state}
              className="mt-2 py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
            >
              Entrar no time →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard
  if (!team) return null;
  const sorted = [...team.members].sort((a, b) => b.weeklyXp - a.weeklyXp);
  const totalXp = team.members.reduce((s, m) => s + m.xp, 0);
  const totalModules = team.members.reduce((s, m) => s + m.completedModules, 0);
  const avgStreak = Math.round(team.members.reduce((s, m) => s + m.streak, 0) / team.members.length);

  return (
    <div style={{ background: 'var(--ffv-bg)', color: 'var(--foreground)', minHeight: '100vh' }}>
      <section className="max-w-4xl mx-auto px-6 pt-14 pb-6">
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono mb-6 transition-opacity hover:opacity-70" style={{ color: 'var(--ffv-muted)', letterSpacing: '0.06em' }}>
          ← HOME
        </Link>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono uppercase tracking-widest text-xs mb-1" style={{ color: 'var(--ffv-blue)', letterSpacing: '0.12em' }}>Time de estudos</p>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            {team.goal && <p className="text-sm mt-1" style={{ color: 'var(--ffv-muted)' }}>🎯 {team.goal}</p>}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}
            >
              {copied ? '✓ Copiado!' : `🔗 Código: ${team.code}`}
            </button>
            <button onClick={handleExport} className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              📄 Exportar
            </button>
          </div>
        </div>
      </section>

      {/* Team stats */}
      <section className="max-w-4xl mx-auto px-6 pb-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Membros', value: team.members.length, color: 'var(--ffv-blue)' },
            { label: 'XP total', value: totalXp.toLocaleString('pt-BR'), color: 'var(--ffv-yellow)' },
            { label: 'Módulos (soma)', value: totalModules, color: 'var(--ffv-green)' },
            { label: 'Streak médio', value: `${avgStreak}d`, color: 'var(--ffv-orange)' },
          ].map(s => (
            <div key={s.label} className="p-4 rounded-xl text-center" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
              <div className="text-2xl font-bold tabular-nums" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[10px] uppercase tracking-widest font-mono mt-1" style={{ color: 'var(--ffv-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Leaderboard */}
      <section className="max-w-4xl mx-auto px-6 pb-6">
        <p className="font-mono uppercase tracking-widest text-xs mb-4" style={{ color: 'var(--ffv-muted)', letterSpacing: '0.12em' }}>
          Ranking semanal
        </p>
        <div className="flex flex-col gap-2">
          {sorted.map((member, idx) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-4 rounded-xl"
              style={{
                background: idx === 0 ? 'color-mix(in srgb, var(--ffv-yellow) 8%, var(--ffv-bg2))' : 'var(--ffv-bg2)',
                border: `1px solid ${idx === 0 ? 'color-mix(in srgb, var(--ffv-yellow) 30%, transparent)' : 'var(--ffv-border)'}`,
              }}
            >
              <span className="font-bold w-6 text-center tabular-nums text-sm" style={{ color: idx === 0 ? 'var(--ffv-yellow)' : idx === 1 ? 'var(--ffv-muted)' : idx === 2 ? '#cd7f32' : 'var(--ffv-muted)' }}>
                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
              </span>
              <div
                className="flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'color-mix(in srgb, var(--ffv-blue) 20%, var(--ffv-bg3))', color: 'var(--ffv-blue)' }}
              >
                {member.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm flex items-center gap-2">
                  {member.name}
                  {member.role === 'admin' && <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono" style={{ background: 'color-mix(in srgb, var(--ffv-blue) 15%, transparent)', color: 'var(--ffv-blue)' }}>admin</span>}
                </div>
                <div className="text-xs flex items-center gap-3 mt-0.5" style={{ color: 'var(--ffv-muted)' }}>
                  <span>Nível {member.level}</span>
                  <span>·</span>
                  <span>{member.completedModules}/{totalTrails} trilhas</span>
                  <span>·</span>
                  <span>🔥 {member.streak}d</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold tabular-nums text-sm" style={{ color: 'var(--ffv-yellow)' }}>+{member.weeklyXp} XP</div>
                <div className="text-[10px]" style={{ color: 'var(--ffv-muted)' }}>esta semana</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Share invite */}
      <section className="max-w-4xl mx-auto px-6 pb-6">
        <div className="p-5 rounded-2xl" style={{ background: 'var(--ffv-bg2)', border: '1px solid var(--ffv-border)' }}>
          <p className="font-semibold mb-1">Convidar membros</p>
          <p className="text-sm mb-3" style={{ color: 'var(--ffv-muted)' }}>
            Compartilhe o código <strong style={{ color: 'var(--foreground)', fontFamily: 'monospace' }}>{team.code}</strong> ou envie o link:
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleCopyCode}
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'var(--ffv-blue)', color: '#0d1117' }}
            >
              {copied ? '✓ Copiado!' : '📋 Copiar código'}
            </button>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Estou estudando na FFV Academy e criei um time de estudos! Entre com o código ${team.code} em https://fernandofrancovalle.com/times 🎓`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'color-mix(in srgb, #1da1f2 15%, transparent)', border: '1px solid color-mix(in srgb, #1da1f2 40%, transparent)', color: '#1da1f2', textDecoration: 'none' }}
            >
              𝕏 Compartilhar
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`Entre no meu time de estudos na FFV Academy! Código: ${team.code} — acesse https://fernandofrancovalle.com/times`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-full text-sm font-semibold transition-all hover:opacity-90"
              style={{ background: 'color-mix(in srgb, #25d366 15%, transparent)', border: '1px solid color-mix(in srgb, #25d366 40%, transparent)', color: '#25d366', textDecoration: 'none' }}
            >
              WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 pb-20">
        <button
          onClick={handleLeave}
          className="text-xs hover:opacity-70 transition-opacity"
          style={{ color: 'var(--ffv-muted)' }}
        >
          Sair do time
        </button>
      </section>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, mono }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; mono?: boolean }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-widest font-mono" style={{ color: 'var(--ffv-muted)' }}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-3 rounded-xl text-sm outline-none transition-all"
        style={{
          background: 'var(--ffv-bg2)',
          border: '1px solid var(--ffv-border)',
          color: 'var(--foreground)',
          fontFamily: mono ? 'monospace' : undefined,
          letterSpacing: mono ? '0.1em' : undefined,
        }}
      />
    </div>
  );
}
