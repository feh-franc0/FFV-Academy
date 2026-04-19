import { AbsoluteFill, useCurrentFrame, random, interpolate } from 'remotion';

interface Props {
  /** Duracao do glitch em frames */
  duration?: number;
  /** Intensidade (0-1) */
  intensity?: number;
  children: React.ReactNode;
}

/**
 * Efeito glitch: RGB split + chromatic aberration + flicker.
 * Usado em hooks para criar tensao cognitiva.
 */
export function GlitchReveal({ duration = 20, intensity = 1, children }: Props) {
  const frame = useCurrentFrame();
  const active = frame < duration;

  if (!active) return <>{children}</>;

  const i = intensity;
  const flicker = random(`flicker-${Math.floor(frame / 2)}`);
  const splitR = 6 + random(`split-r-${Math.floor(frame / 3)}`) * 14;
  const splitB = 6 + random(`split-b-${Math.floor(frame / 3)}`) * 14;
  const sliceY = random(`slice-${Math.floor(frame / 4)}`) * 100;

  const fadeOut = interpolate(frame, [duration - 5, duration], [1, 0], {
    extrapolateRight: 'clamp',
    extrapolateLeft: 'clamp',
  });

  return (
    <AbsoluteFill style={{ opacity: flicker > 0.1 ? 1 : 0.3 }}>
      {/* RGB red channel */}
      <AbsoluteFill
        style={{
          transform: `translate(-${splitR * i}px, ${(random(`rgb-r-y-${frame}`) - 0.5) * 10}px)`,
          filter: 'hue-rotate(0deg) saturate(2)',
          mixBlendMode: 'screen',
          opacity: 0.85 * fadeOut,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: '#ff0040', mixBlendMode: 'multiply' }} />
        {children}
      </AbsoluteFill>

      {/* RGB blue channel */}
      <AbsoluteFill
        style={{
          transform: `translate(${splitB * i}px, ${(random(`rgb-b-y-${frame}`) - 0.5) * 10}px)`,
          mixBlendMode: 'screen',
          opacity: 0.85 * fadeOut,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, background: '#00d4ff', mixBlendMode: 'multiply' }} />
        {children}
      </AbsoluteFill>

      {/* Base */}
      <AbsoluteFill style={{ opacity: 1 - 0.3 * fadeOut }}>{children}</AbsoluteFill>

      {/* Slice horizontal glitch */}
      <div
        style={{
          position: 'absolute',
          top: `${sliceY}%`,
          left: 0,
          right: 0,
          height: 8,
          background: 'rgba(255,255,255,0.25)',
          opacity: fadeOut * 0.7,
          mixBlendMode: 'screen',
        }}
      />

      {/* Scanlines */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)',
          opacity: fadeOut * 0.4,
          pointerEvents: 'none',
        }}
      />
    </AbsoluteFill>
  );
}
