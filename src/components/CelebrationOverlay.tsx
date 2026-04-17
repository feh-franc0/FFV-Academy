'use client';

import { useEffect, useMemo, useState } from 'react';
import { BADGES_DEF, LEVELS } from '@/lib/curriculum';

export type CelebrationEvent =
  | { kind: 'badge'; badgeId: string }
  | { kind: 'level'; level: number }
  | { kind: 'streak'; days: number };

interface Props {
  events: CelebrationEvent[];
  onDismiss: () => void;
}

const CONFETTI_COLORS = [
  '#58a6ff',
  '#3fb950',
  '#d2a8ff',
  '#ffa657',
  '#f78166',
  '#e3b341',
];

export function CelebrationOverlay({ events, onDismiss }: Props) {
  const [idx, setIdx] = useState(0);
  const current = events[idx];

  // Auto-dismiss each after ~2.4s (unless many stacked, user clicks to advance)
  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => {
      if (idx < events.length - 1) setIdx(i => i + 1);
      else onDismiss();
    }, 2600);
    return () => clearTimeout(t);
  }, [idx, events.length, current, onDismiss]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 400,
        duration: 1400 + Math.random() * 1200,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 8,
        drift: (Math.random() - 0.5) * 140,
        rotate: Math.random() * 720,
      })),
    // regenerate per event
    [current],
  );

  if (!current) return null;

  const content = renderContent(current);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Conquista"
      onClick={() => {
        if (idx < events.length - 1) setIdx(i => i + 1);
        else onDismiss();
      }}
      className="fixed inset-0 z-[110] flex items-center justify-center px-4 overflow-hidden"
      style={{
        background: 'color-mix(in srgb, #000 55%, transparent)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        cursor: 'pointer',
      }}
    >
      <style>{`
        @keyframes ffv-confetti-fall {
          0% { transform: translate3d(0, -60px, 0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translate3d(var(--ffv-drift, 0px), 110vh, 0) rotate(var(--ffv-rot, 360deg)); opacity: 1; }
        }
        @keyframes ffv-pop {
          0% { transform: scale(0.6); opacity: 0; }
          55% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ffv-badge-shine {
          0%, 100% { box-shadow: 0 0 40px color-mix(in srgb, ${content.color} 45%, transparent); }
          50% { box-shadow: 0 0 80px color-mix(in srgb, ${content.color} 70%, transparent); }
        }
      `}</style>

      {/* Confetti pieces */}
      <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map(c => (
          <span
            key={c.id}
            style={{
              position: 'absolute',
              top: 0,
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 0.4,
              background: c.color,
              borderRadius: 2,
              // CSS custom props so the keyframe can read them
              ['--ffv-drift' as never]: `${c.drift}px`,
              ['--ffv-rot' as never]: `${c.rotate}deg`,
              animation: `ffv-confetti-fall ${c.duration}ms cubic-bezier(0.2, 0.4, 0.3, 1) ${c.delay}ms forwards`,
              opacity: 0,
            }}
          />
        ))}
      </div>

      {/* Celebration card */}
      <div
        className="relative rounded-3xl text-center"
        style={{
          padding: '40px 36px 34px',
          background: 'var(--ffv-bg)',
          border: `1px solid color-mix(in srgb, ${content.color} 50%, transparent)`,
          minWidth: 300,
          maxWidth: 400,
          animation: 'ffv-pop 0.45s cubic-bezier(0.2, 0.9, 0.3, 1.15) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div
          className="mx-auto flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: `radial-gradient(circle, color-mix(in srgb, ${content.color} 40%, transparent), transparent 70%)`,
            fontSize: 56,
            animation: 'ffv-badge-shine 1.8s ease-in-out infinite',
            marginBottom: 18,
          }}
        >
          {content.icon}
        </div>
        <div
          className="font-mono uppercase"
          style={{
            fontSize: 10,
            letterSpacing: '0.18em',
            color: content.color,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          {content.label}
        </div>
        <h2
          style={{
            fontSize: '1.5rem',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: 'var(--foreground)',
            marginBottom: 6,
          }}
        >
          {content.title}
        </h2>
        {content.subtitle && (
          <p style={{ fontSize: 13, color: 'var(--ffv-muted)', lineHeight: 1.6 }}>{content.subtitle}</p>
        )}
        <div
          className="font-mono mt-5"
          style={{ fontSize: 10, color: 'var(--ffv-muted)', letterSpacing: '0.1em' }}
        >
          {events.length > 1 ? `${idx + 1} / ${events.length} · ` : ''}TOQUE PARA CONTINUAR
        </div>
      </div>
    </div>
  );
}

function renderContent(ev: CelebrationEvent): {
  icon: string;
  label: string;
  title: string;
  subtitle?: string;
  color: string;
} {
  if (ev.kind === 'badge') {
    const b = BADGES_DEF.find(x => x.id === ev.badgeId);
    return {
      icon: b?.icon ?? '🏅',
      label: 'BADGE DESBLOQUEADA',
      title: b?.name ?? 'Nova conquista',
      subtitle: b ? `${b.desc} · +${b.xpBonus} XP bônus` : undefined,
      color: '#e3b341',
    };
  }
  if (ev.kind === 'level') {
    const lvl = LEVELS.find(l => l.level === ev.level) ?? LEVELS[0];
    return {
      icon: lvl.icon,
      label: 'LEVEL UP',
      title: `Agora você é ${lvl.name}`,
      subtitle: `Nível ${lvl.level} · novas trilhas esperando`,
      color: lvl.color,
    };
  }
  return {
    icon: '🔥',
    label: 'STREAK',
    title: `${ev.days} dias seguidos!`,
    subtitle: 'Consistência é o segredo. Continue.',
    color: '#ffa657',
  };
}
