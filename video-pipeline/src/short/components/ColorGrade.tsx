import { AbsoluteFill } from 'remotion';

type Mood = 'coldCyan' | 'warmWarning' | 'neutralBright' | 'vibrantDemo' | 'goldSuccess' | 'brandPeak';

interface Props {
  mood: Mood;
  /** Intensidade 0-1 — controla opacity do overlay */
  intensity?: number;
  children: React.ReactNode;
}

/**
 * Color grade por cena — aplica overlay com mix-blend + filter CSS.
 * Aproxima LUTs profissionais via gradient + hue/saturate/contrast.
 */
export function ColorGrade({ mood, intensity = 0.6, children }: Props) {
  const grades: Record<Mood, { overlay: string; filter: string; blend: string }> = {
    coldCyan: {
      overlay: 'linear-gradient(180deg, rgba(12, 90, 138, 0.4) 0%, rgba(30, 41, 59, 0.5) 100%)',
      filter: 'hue-rotate(10deg) saturate(1.1) contrast(1.08)',
      blend: 'multiply',
    },
    warmWarning: {
      overlay: 'radial-gradient(circle at 50% 40%, rgba(247, 129, 102, 0.3) 0%, rgba(40, 10, 0, 0.4) 100%)',
      filter: 'hue-rotate(-8deg) saturate(0.95) contrast(1.12)',
      blend: 'overlay',
    },
    neutralBright: {
      overlay: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 50%, rgba(0,0,0,0.08) 100%)',
      filter: 'saturate(1.3) contrast(1.1) brightness(1.05)',
      blend: 'overlay',
    },
    vibrantDemo: {
      overlay: 'linear-gradient(135deg, rgba(88, 166, 255, 0.08) 0%, rgba(210, 168, 255, 0.08) 100%)',
      filter: 'saturate(1.4) contrast(1.1)',
      blend: 'screen',
    },
    goldSuccess: {
      overlay: 'radial-gradient(circle at 50% 45%, rgba(227, 179, 65, 0.22) 0%, rgba(20, 15, 0, 0.3) 100%)',
      filter: 'hue-rotate(5deg) saturate(1.35) contrast(1.08) brightness(1.05)',
      blend: 'overlay',
    },
    brandPeak: {
      overlay: 'radial-gradient(circle at 50% 50%, rgba(88, 166, 255, 0.25) 0%, rgba(10, 20, 40, 0.35) 100%)',
      filter: 'saturate(1.5) contrast(1.12) brightness(1.03)',
      blend: 'screen',
    },
  };
  const g = grades[mood];

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ filter: g.filter }}>{children}</AbsoluteFill>
      <AbsoluteFill
        style={{
          background: g.overlay,
          mixBlendMode: g.blend as React.CSSProperties['mixBlendMode'],
          opacity: intensity,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
