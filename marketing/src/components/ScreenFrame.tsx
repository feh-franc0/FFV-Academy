import { AbsoluteFill, Img, interpolate, useCurrentFrame, staticFile } from 'remotion';

interface ScreenFrameProps {
  /** Nome do arquivo em assets/screenshots/ */
  screenshot: string;
  /** Ken Burns: scale inicial e final (ex: [1.0, 1.08]) */
  kenBurns?: [number, number];
  /** Overlay gradiente inferior para legibilidade de texto */
  overlayGradient?: boolean;
  /** Opacidade do overlay (0-1) */
  overlayOpacity?: number;
  /** Blur no screenshot (px) */
  blur?: number;
  /** Opacidade geral do screenshot */
  opacity?: number;
}

export function ScreenFrame({
  screenshot,
  kenBurns = [1.0, 1.08],
  overlayGradient = false,
  overlayOpacity = 0.7,
  blur = 0,
  opacity = 1,
}: ScreenFrameProps) {
  const frame = useCurrentFrame();

  // Ken Burns: zoom lento ao longo de toda a duracao do Sequence pai
  // Usamos um range grande (0-1000 frames) e clamp para funcionar em qualquer duracao
  const scale = interpolate(
    frame,
    [0, 1000],
    kenBurns,
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill>
      {/* Screenshot com Ken Burns */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
          opacity,
        }}
      >
        <Img
          src={staticFile(`screenshots/${screenshot}`)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${scale})`,
            filter: blur > 0 ? `blur(${blur}px)` : 'none',
          }}
        />
      </AbsoluteFill>

      {/* Overlay gradiente inferior */}
      {overlayGradient && (
        <AbsoluteFill
          style={{
            background: `linear-gradient(to top, rgba(13,17,23,${overlayOpacity}) 0%, rgba(13,17,23,${overlayOpacity * 0.5}) 40%, transparent 100%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
}

/** Overlay escuro uniforme (para cena de prova/numeros) */
export function DarkOverlay({ opacity = 0.7 }: { opacity?: number }) {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: `rgba(13,17,23,${opacity})`,
      }}
    />
  );
}
