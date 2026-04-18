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
  '#79c0ff',
  '#ff7eb6',
];

export function CelebrationOverlay({ events, onDismiss }: Props) {
  const [idx, setIdx] = useState(0);
  const current = events[idx];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => {
      if (idx < events.length - 1) setIdx(i => i + 1);
      else onDismiss();
    }, 3200);
    return () => clearTimeout(t);
  }, [idx, events.length, current, onDismiss]);

  // Confetti with varied shapes
  const confetti = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 500,
        duration: 1600 + Math.random() * 1400,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 5 + Math.random() * 9,
        drift: (Math.random() - 0.5) * 180,
        rotate: Math.random() * 900,
        shape: i % 3, // 0 = rect, 1 = circle, 2 = diamond
      })),
    [current],
  );

  // Burst particles from center
  const burst = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        angle: (i / 12) * 360,
        distance: 80 + Math.random() * 60,
        delay: Math.random() * 100,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 4 + Math.random() * 4,
      })),
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
        animation: 'ffv-overlay-in 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes ffv-overlay-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes ffv-confetti-fall {
          0% { transform: translate3d(0, -60px, 0) rotate(0deg); opacity: 0; }
          8% { opacity: 1; }
          100% { transform: translate3d(var(--ffv-drift, 0px), 110vh, 0) rotate(var(--ffv-rot, 360deg)); opacity: 0.6; }
        }
        @keyframes ffv-pop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.06); opacity: 1; }
          70% { transform: scale(0.97); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ffv-icon-pulse {
          0% { transform: scale(0); }
          50% { transform: scale(1.2); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); }
        }
        @keyframes ffv-badge-shine {
          0%, 100% { box-shadow: 0 0 40px color-mix(in srgb, ${content.color} 35%, transparent); }
          50% { box-shadow: 0 0 80px color-mix(in srgb, ${content.color} 60%, transparent); }
        }
        @keyframes ffv-burst {
          0% { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--bx), var(--by)) scale(0); opacity: 0; }
        }
        @keyframes ffv-ring {
          0% { transform: scale(0.3); opacity: 0.8; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes ffv-label-in {
          0% { transform: translateY(8px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
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
              height: c.shape === 1 ? c.size : c.size * 0.4,
              background: c.color,
              borderRadius: c.shape === 1 ? '50%' : c.shape === 2 ? 0 : 2,
              transform: c.shape === 2 ? 'rotate(45deg)' : undefined,
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
          animation: 'ffv-pop 0.5s cubic-bezier(0.2, 0.9, 0.3, 1.15) forwards',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Expanding ring behind icon */}
        <div
          aria-hidden
          className="absolute"
          style={{
            top: 40,
            left: '50%',
            width: 96,
            height: 96,
            marginLeft: -48,
            borderRadius: '50%',
            border: `2px solid color-mix(in srgb, ${content.color} 40%, transparent)`,
            animation: 'ffv-ring 0.8s ease-out 0.2s forwards',
            opacity: 0,
          }}
        />

        {/* Burst particles */}
        <div
          aria-hidden
          className="absolute"
          style={{
            top: 88,
            left: '50%',
            width: 0,
            height: 0,
          }}
        >
          {burst.map(b => {
            const rad = (b.angle * Math.PI) / 180;
            const bx = Math.cos(rad) * b.distance;
            const by = Math.sin(rad) * b.distance;
            return (
              <span
                key={b.id}
                style={{
                  position: 'absolute',
                  width: b.size,
                  height: b.size,
                  borderRadius: '50%',
                  background: b.color,
                  ['--bx' as never]: `${bx}px`,
                  ['--by' as never]: `${by}px`,
                  animation: `ffv-burst 0.6s ease-out ${200 + b.delay}ms forwards`,
                }}
              />
            );
          })}
        </div>

        {/* Icon with pulse */}
        <div
          className="mx-auto flex items-center justify-center"
          style={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            background: `radial-gradient(circle, color-mix(in srgb, ${content.color} 40%, transparent), transparent 70%)`,
            fontSize: 56,
            animation: 'ffv-icon-pulse 0.6s cubic-bezier(0.2, 0.9, 0.3, 1.2) 0.15s both, ffv-badge-shine 1.8s ease-in-out 0.8s infinite',
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
            animation: 'ffv-label-in 0.3s ease-out 0.35s both',
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
            animation: 'ffv-label-in 0.3s ease-out 0.4s both',
          }}
        >
          {content.title}
        </h2>
        {content.subtitle && (
          <p
            style={{
              fontSize: 13,
              color: 'var(--ffv-muted)',
              lineHeight: 1.6,
              animation: 'ffv-label-in 0.3s ease-out 0.5s both',
            }}
          >
            {content.subtitle}
          </p>
        )}
        <div
          className="font-mono mt-5"
          style={{
            fontSize: 10,
            color: 'var(--ffv-muted)',
            letterSpacing: '0.1em',
            animation: 'ffv-label-in 0.3s ease-out 0.6s both',
          }}
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
