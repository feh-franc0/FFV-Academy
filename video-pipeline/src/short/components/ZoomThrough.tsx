import { AbsoluteFill, useCurrentFrame, interpolate, useVideoConfig } from 'remotion';
import { EASE } from '../styles/easing';

interface Props {
  /** Frame de inicio (local ao Sequence) */
  startFrame?: number;
  /** Duracao do zoom */
  duration?: number;
  /** Ponto focal (0-1) para onde a camera "entra" */
  focusX?: number;
  focusY?: number;
  /** Escala maxima atingida */
  maxScale?: number;
  children: React.ReactNode;
}

/**
 * Camera punches forward — simula "entrar" num elemento, ideal para transicao Reveal → Demo
 * ou Proof → CTA. Acumula motion blur no pico.
 */
export function ZoomThrough({ startFrame = 0, duration = 20, focusX = 0.5, focusY = 0.5, maxScale = 4, children }: Props) {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return <>{children}</>;

  const progress = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = EASE.inOutCubic(progress);

  const scale = 1 + (maxScale - 1) * eased;
  const opacity = 1 - eased * 0.3;
  const blur = eased * 8;

  return (
    <AbsoluteFill
      style={{
        transform: `scale(${scale})`,
        transformOrigin: `${focusX * 100}% ${focusY * 100}%`,
        opacity,
        filter: `blur(${blur}px)`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
