import { AbsoluteFill, useCurrentFrame, random } from 'remotion';

interface Props {
  color: string;
  count?: number;
  /** Intensidade (0-1) */
  intensity?: number;
  seed?: string;
}

/**
 * Campo de particulas flutuantes no fundo — drift suave + twinkle.
 * Dopaminergico sem ser invasivo.
 */
export function ParticleField({ color, count = 40, intensity = 1, seed = 'particles' }: Props) {
  const frame = useCurrentFrame();

  const particles = Array.from({ length: count }, (_, i) => {
    const r1 = random(`${seed}-${i}-x`);
    const r2 = random(`${seed}-${i}-y`);
    const r3 = random(`${seed}-${i}-size`);
    const r4 = random(`${seed}-${i}-speed`);
    const r5 = random(`${seed}-${i}-phase`);

    const baseX = r1 * 100;
    const baseY = r2 * 100;
    const size = 2 + r3 * 6;
    const speed = 0.15 + r4 * 0.35;
    const phase = r5 * Math.PI * 2;

    const driftY = (baseY + frame * speed * 0.08) % 105;
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(frame * 0.04 + phase));

    return (
      <div
        key={`p-${i}`}
        style={{
          position: 'absolute',
          left: `${baseX}%`,
          top: `${driftY}%`,
          width: size,
          height: size,
          borderRadius: '50%',
          background: color,
          opacity: twinkle * intensity * 0.6,
          boxShadow: `0 0 ${size * 3}px ${color}`,
          pointerEvents: 'none',
        }}
      />
    );
  });

  return <AbsoluteFill style={{ pointerEvents: 'none' }}>{particles}</AbsoluteFill>;
}
