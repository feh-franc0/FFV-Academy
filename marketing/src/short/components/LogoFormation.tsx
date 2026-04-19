import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, random } from 'remotion';
import { FONTS } from '../styles/short-tokens';

interface Props {
  color: string;
  /** Posicao vertical: porcentagem 0-100 */
  topPercent?: number;
  /** Tamanho da fonte base */
  fontSize?: number;
  /** Se true, aparece em uma linha; false = duas linhas */
  oneLine?: boolean;
}

/**
 * "FFV ACADEMY" formando letra por letra a partir de fragmentos que convergem.
 * Efeito cinematico — letras viajam do fora da tela ate a posicao final com bounce.
 */
export function LogoFormation({ color, topPercent = 40, fontSize = 200, oneLine = false }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const text = oneLine ? 'FFV ACADEMY' : ['FFV', 'ACADEMY'];
  const letters = Array.isArray(text) ? text.flatMap(l => l.split('')) : text.split('');

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: `${topPercent}%`,
          transform: 'translateY(-50%)',
          textAlign: 'center',
          fontFamily: FONTS.heading,
          fontWeight: 900,
          fontSize,
          letterSpacing: -8,
          color: '#fff',
          lineHeight: 0.88,
          textShadow: `0 0 60px ${color}, 0 0 120px ${color}66, 0 8px 0 rgba(0,0,0,0.4)`,
        }}
      >
        {Array.isArray(text) ? (
          text.map((line, li) => (
            <div key={`line-${li}`}>
              {line.split('').map((ch, ci) => (
                <Letter key={`${li}-${ci}`} char={ch} index={li * 10 + ci} frame={frame} fps={fps} color={color} />
              ))}
            </div>
          ))
        ) : (
          letters.map((ch, i) => (
            <Letter key={i} char={ch} index={i} frame={frame} fps={fps} color={color} />
          ))
        )}
      </div>
    </AbsoluteFill>
  );
}

function Letter({ char, index, frame, fps, color }: { char: string; index: number; frame: number; fps: number; color: string }) {
  const delay = index * 3;
  const prog = spring({
    frame: frame - delay,
    fps,
    config: { damping: 10, stiffness: 180 },
  });

  // Letra entra vinda de uma direcao aleatoria com rotacao
  const dirX = (random(`lx-${index}`) - 0.5) * 600;
  const dirY = (random(`ly-${index}`) - 0.5) * 400;
  const rot = (random(`rot-${index}`) - 0.5) * 90;
  const scale = interpolate(prog, [0, 1], [0, 1]);
  const opacity = interpolate(prog, [0, 0.3, 1], [0, 1, 1]);
  const tx = dirX * (1 - prog);
  const ty = dirY * (1 - prog);
  const rotation = rot * (1 - prog);

  // Flash quando a letra "aterrissa" (frames delay+8 a delay+14)
  const flash = interpolate(frame, [delay + 6, delay + 10, delay + 14], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  if (char === ' ') return <span style={{ display: 'inline-block', width: '0.4em' }} />;

  return (
    <span
      style={{
        display: 'inline-block',
        transform: `translate(${tx}px, ${ty}px) rotate(${rotation}deg) scale(${scale})`,
        opacity,
        textShadow: flash > 0
          ? `0 0 40px ${color}, 0 0 80px ${color}, 0 0 120px #fff`
          : `0 0 60px ${color}, 0 0 120px ${color}66, 0 8px 0 rgba(0,0,0,0.4)`,
      }}
    >
      {char}
    </span>
  );
}
