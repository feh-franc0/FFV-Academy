import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';

type TransitionType = 'fade' | 'slide-left' | 'slide-right' | 'zoom-from-black' | 'crossfade';

interface SceneTransitionProps {
  type: TransitionType;
  /** Duracao da transicao de entrada (frames) */
  enterDuration?: number;
  /** Duracao da transicao de saida (frames) */
  exitDuration?: number;
  /** Duracao total do conteudo (frames do Sequence pai) */
  durationInFrames: number;
  children: React.ReactNode;
}

export function SceneTransition({
  type,
  enterDuration = 15,
  exitDuration = 15,
  durationInFrames,
  children,
}: SceneTransitionProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calcula propriedades de animacao baseado no tipo
  let opacity = 1;
  let translateX = 0;
  let translateY = 0;
  let scale = 1;

  const exitStart = durationInFrames - exitDuration;

  switch (type) {
    case 'fade': {
      opacity = interpolate(
        frame,
        [0, enterDuration, exitStart, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      break;
    }

    case 'slide-left': {
      // Entra da direita, sai pela esquerda
      translateX = interpolate(
        frame,
        [0, enterDuration, exitStart, durationInFrames],
        [1920, 0, 0, -1920],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      opacity = interpolate(
        frame,
        [0, Math.min(5, enterDuration), exitStart, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      break;
    }

    case 'slide-right': {
      // Entra da esquerda, sai pela direita
      translateX = interpolate(
        frame,
        [0, enterDuration, exitStart, durationInFrames],
        [-1920, 0, 0, 1920],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      opacity = interpolate(
        frame,
        [0, Math.min(5, enterDuration), exitStart, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      break;
    }

    case 'zoom-from-black': {
      // Spring para sensacao organica
      const springVal = spring({
        fps,
        frame,
        config: { damping: 12, stiffness: 80 },
        durationInFrames: enterDuration * 2,
      });
      scale = interpolate(springVal, [0, 1], [0.5, 1]);
      opacity = interpolate(
        frame,
        [0, enterDuration, exitStart, durationInFrames],
        [0, 1, 1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      break;
    }

    case 'crossfade': {
      opacity = interpolate(
        frame,
        [0, enterDuration],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
      );
      break;
    }
  }

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform: `translateX(${translateX}px) translateY(${translateY}px) scale(${scale})`,
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** Barra inferior com gradiente para texto sobre screenshots */
export function BottomBar({
  height = 120,
  children,
}: {
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <AbsoluteFill
      style={{
        top: 'auto',
        bottom: 0,
        height,
        background: 'linear-gradient(to top, rgba(13,17,23,0.85) 0%, rgba(13,17,23,0.4) 70%, transparent 100%)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '0 60px',
      }}
    >
      {children}
    </AbsoluteFill>
  );
}
