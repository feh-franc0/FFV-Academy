import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASE } from '../styles/easing';

interface Props {
  color: string;
  /** Frame de inicio da transicao (local ao Sequence) */
  startFrame?: number;
  /** Duracao total */
  duration?: number;
  /** Direcao: entra ou sai */
  mode?: 'enter' | 'exit';
  /** Direcao da onda */
  direction?: 'left' | 'right' | 'top' | 'bottom';
}

/**
 * Transicao liquida: blob organico com curvas bezier que varre a tela.
 * Implementado com SVG path animado. Padrao cinematographic wipe.
 */
export function LiquidWipe({ color, startFrame = 0, duration = 25, mode = 'enter', direction = 'right' }: Props) {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0) return null;
  if (localFrame > duration) return mode === 'enter' ? null : null;

  const progress = interpolate(localFrame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = EASE.inOutQuint(progress);

  // Deforma de 0% a 100% com bulge sinusoidal
  const sweepPercent = mode === 'enter' ? eased * 100 : 100 - eased * 100;
  const bulge = Math.sin(eased * Math.PI) * 15; // bulge maximo no meio da transicao

  let path = '';

  if (direction === 'right') {
    const mainX = sweepPercent;
    path = `
      M 0 0
      L ${mainX} 0
      C ${mainX + bulge} 25, ${mainX + bulge} 75, ${mainX} 100
      L 0 100
      Z
    `;
  } else if (direction === 'left') {
    const mainX = 100 - sweepPercent;
    path = `
      M 100 0
      L ${mainX} 0
      C ${mainX - bulge} 25, ${mainX - bulge} 75, ${mainX} 100
      L 100 100
      Z
    `;
  } else if (direction === 'bottom') {
    const mainY = sweepPercent;
    path = `
      M 0 0
      L 0 ${mainY}
      C 25 ${mainY + bulge}, 75 ${mainY + bulge}, 100 ${mainY}
      L 100 0
      Z
    `;
  } else {
    const mainY = 100 - sweepPercent;
    path = `
      M 0 100
      L 0 ${mainY}
      C 25 ${mainY - bulge}, 75 ${mainY - bulge}, 100 ${mainY}
      L 100 100
      Z
    `;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
        <defs>
          <linearGradient id={`liquid-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.8" />
          </linearGradient>
        </defs>
        <path d={path} fill={color} filter={`drop-shadow(0 0 40px ${color})`} />
      </svg>
    </AbsoluteFill>
  );
}
