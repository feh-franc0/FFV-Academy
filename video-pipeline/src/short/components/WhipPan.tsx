import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASE } from '../styles/easing';

interface Props {
  /** Direcao do whip */
  direction?: 'left' | 'right' | 'up' | 'down';
  /** Duracao total */
  duration?: number;
  /** Intensidade do blur */
  blurAmount?: number;
  children: React.ReactNode;
}

/**
 * Whip pan: elemento entra com motion blur direcional forte.
 * Usado em transicoes entre beats do Demo Fire.
 */
export function WhipPan({ direction = 'right', duration = 12, blurAmount = 30, children }: Props) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const eased = EASE.outExpo(progress);

  const distance = 100; // % da tela
  let translateX = 0;
  let translateY = 0;
  let blurDir = 'horizontal';

  if (direction === 'right') {
    translateX = (1 - eased) * distance * -1; // comeca fora a esquerda
    blurDir = 'horizontal';
  } else if (direction === 'left') {
    translateX = (1 - eased) * distance;
    blurDir = 'horizontal';
  } else if (direction === 'down') {
    translateY = (1 - eased) * distance * -1;
    blurDir = 'vertical';
  } else if (direction === 'up') {
    translateY = (1 - eased) * distance;
    blurDir = 'vertical';
  }

  const blur = (1 - eased) * blurAmount;

  return (
    <AbsoluteFill
      style={{
        transform: `translate(${translateX}%, ${translateY}%)`,
        filter: `blur(${blurDir === 'horizontal' ? `${blur}px 0` : `0 ${blur}px`})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
