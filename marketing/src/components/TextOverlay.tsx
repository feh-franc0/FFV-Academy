import { AbsoluteFill, interpolate, useCurrentFrame, spring, useVideoConfig } from 'remotion';
import { COLORS, FONTS } from '../styles/tokens';

type Animation = 'fade' | 'slide-up' | 'none';

interface TextOverlayProps {
  text: string;
  fontSize?: number;
  color?: string;
  fontFamily?: 'heading' | 'body';
  fontWeight?: number;
  /** Frame (relativo ao Sequence pai) em que o texto aparece */
  frameIn: number;
  /** Frame (relativo ao Sequence pai) em que o texto desaparece */
  frameOut: number;
  /** Duracao da animacao de entrada em frames */
  enterDuration?: number;
  /** Duracao da animacao de saida em frames */
  exitDuration?: number;
  animation?: Animation;
  /** Posicao vertical: 'center' | 'top' | 'bottom' | numero (px do topo) */
  verticalPosition?: 'center' | 'top' | 'bottom' | number;
  /** Alinhamento horizontal */
  textAlign?: 'center' | 'left' | 'right';
  /** Padding lateral */
  paddingHorizontal?: number;
  /** Sombra de texto para legibilidade sobre screenshots */
  textShadow?: boolean;
  /** Letra-spacing */
  letterSpacing?: string;
  /** Transform uppercase */
  uppercase?: boolean;
}

export function TextOverlay({
  text,
  fontSize = 48,
  color = COLORS.text,
  fontFamily = 'heading',
  fontWeight = 700,
  frameIn,
  frameOut,
  enterDuration = 15,
  exitDuration = 10,
  animation = 'fade',
  verticalPosition = 'center',
  textAlign = 'center',
  paddingHorizontal = 200,
  textShadow = true,
  letterSpacing,
  uppercase = false,
}: TextOverlayProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Nao renderiza fora do range
  if (frame < frameIn - 1 || frame > frameOut + exitDuration) return null;

  // Opacity: fade in → hold → fade out
  // Ensure strictly monotonically increasing inputRange
  const fadeOutEnd = Math.max(frameOut + exitDuration, frameOut + 1);
  const opacity = interpolate(
    frame,
    [frameIn, frameIn + enterDuration, frameOut, fadeOutEnd],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Slide-up: translateY de 30px a 0 na entrada
  let translateY = 0;
  if (animation === 'slide-up') {
    translateY = interpolate(
      frame,
      [frameIn, frameIn + enterDuration],
      [30, 0],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    );
  }

  const verticalStyle = (): React.CSSProperties => {
    if (verticalPosition === 'center') return { justifyContent: 'center' };
    if (verticalPosition === 'top') return { justifyContent: 'flex-start', paddingTop: 100 };
    if (verticalPosition === 'bottom') return { justifyContent: 'flex-end', paddingBottom: 100 };
    return { justifyContent: 'flex-start', paddingTop: verticalPosition };
  };

  const font = fontFamily === 'heading' ? FONTS.heading : FONTS.body;

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        alignItems: textAlign === 'center' ? 'center' : textAlign === 'left' ? 'flex-start' : 'flex-end',
        ...verticalStyle(),
        paddingLeft: paddingHorizontal,
        paddingRight: paddingHorizontal,
        opacity,
        transform: `translateY(${translateY}px)`,
      }}
    >
      <div
        style={{
          fontFamily: font,
          fontSize,
          fontWeight,
          color,
          textAlign,
          lineHeight: 1.2,
          textShadow: textShadow ? '0 2px 20px rgba(0,0,0,0.8), 0 0 40px rgba(0,0,0,0.5)' : 'none',
          letterSpacing: letterSpacing || (fontFamily === 'heading' ? '-0.02em' : 'normal'),
          textTransform: uppercase ? 'uppercase' : 'none',
          maxWidth: 1520, // 1920 - 2*200
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
}
