'use client';

import { useEffect, useState } from 'react';
import { toast as sonnerToast } from 'sonner';

const BADGE_DURATION  = 7000;
const STREAK_DURATION = 5000;
const LEVEL_DURATION  = 6000;
const FADE_OUT_BEFORE = 700; // ms antes do dismiss, começa fade-out

function useToastFade(duration: number) {
  const [phase, setPhase] = useState<'enter' | 'show' | 'exit'>('enter');
  useEffect(() => {
    const toShow  = requestAnimationFrame(() => setPhase('show'));
    const toExit  = setTimeout(() => setPhase('exit'), duration - FADE_OUT_BEFORE);
    return () => { cancelAnimationFrame(toShow); clearTimeout(toExit); };
  }, [duration]);
  return phase;
}

function CelebToast({
  emoji,
  title,
  desc,
  accent,
  duration,
}: {
  emoji: string;
  title: string;
  desc: string;
  accent: string;
  duration: number;
}) {
  const phase = useToastFade(duration);

  return (
    <div
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${accent} 15%, var(--ffv-bg2, #1e2330)), var(--ffv-bg2, #1e2330))`,
        border: `1px solid color-mix(in srgb, ${accent} 50%, transparent)`,
        borderRadius: 14,
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minWidth: 260,
        boxShadow: `0 8px 32px -8px color-mix(in srgb, ${accent} 32%, transparent)`,
        opacity: phase === 'show' ? 1 : 0,
        transform: phase === 'enter'
          ? 'translateY(-6px) scale(0.94)'
          : phase === 'exit'
            ? 'translateY(-4px) scale(0.97)'
            : 'translateY(0) scale(1)',
        transition: phase === 'exit'
          ? 'opacity 650ms ease, transform 650ms ease'
          : 'opacity 320ms cubic-bezier(0.34,1.56,0.64,1), transform 380ms cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <span
        style={{
          fontSize: 28,
          lineHeight: 1,
          filter: `drop-shadow(0 2px 8px color-mix(in srgb, ${accent} 55%, transparent))`,
          flexShrink: 0,
        }}
      >
        {emoji}
      </span>
      <div>
        <p style={{ fontWeight: 700, fontSize: 13, color: accent, marginBottom: 3, letterSpacing: '-0.01em' }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: 'var(--ffv-muted, #8b949e)', margin: 0 }}>
          {desc}
        </p>
      </div>
    </div>
  );
}

/**
 * Wrapper sobre sonner com presets temáticos do FFV Academy.
 *
 * Uso:
 *   import { toast } from '@/lib/toast';
 *   toast.success('Módulo completo! +75 XP');
 *   toast.badge('Especialista em RAG');
 *   toast.streak(12);
 *   toast.levelUp(5);
 */
export const toast = {
  success(message: string, description?: string) {
    sonnerToast.success(message, { description });
  },

  error(message: string, description?: string) {
    sonnerToast.error(message, { description });
  },

  info(message: string, description?: string) {
    sonnerToast(message, { description });
  },

  warn(message: string, description?: string) {
    sonnerToast.warning(message, { description });
  },

  /** XP ganho — visual celebrativo. */
  xp(amount: number, moduleName: string) {
    sonnerToast.success(`+${amount} XP`, {
      description: `Módulo "${moduleName}" completado.`,
      duration: 5000,
    });
  },

  /** Badge desbloqueada — card customizado com visual celebrativo. */
  badge(name: string) {
    sonnerToast.custom(
      () => (
        <CelebToast
          emoji="🏆"
          title="Badge desbloqueada!"
          desc={`"${name}"`}
          accent="#f0c040"
          duration={BADGE_DURATION}
        />
      ),
      { duration: BADGE_DURATION, unstyled: true },
    );
  },

  /** Streak milestone. */
  streak(days: number) {
    sonnerToast.custom(
      () => (
        <CelebToast
          emoji="🔥"
          title={`${days} dias seguidos!`}
          desc="Continue assim para manter o ritmo."
          accent="#f78166"
          duration={STREAK_DURATION}
        />
      ),
      { duration: STREAK_DURATION, unstyled: true },
    );
  },

  /** Level up. */
  levelUp(newLevel: number) {
    sonnerToast.custom(
      () => (
        <CelebToast
          emoji="⭐"
          title={`Nível ${newLevel}!`}
          desc="Continue evoluindo."
          accent="#58a6ff"
          duration={LEVEL_DURATION}
        />
      ),
      { duration: LEVEL_DURATION, unstyled: true },
    );
  },
};
