import { useCurrentFrame, useVideoConfig } from 'remotion';

interface Props {
  accentColor: string;
}

/**
 * Barra fina de progresso no topo (psicologia de retencao: reforco visual de avanco).
 */
export function ProgressBar({ accentColor }: Props) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const progress = Math.min(frame / durationInFrames, 1);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 6,
        background: 'rgba(255,255,255,0.15)',
        zIndex: 50,
      }}
    >
      <div
        style={{
          width: `${progress * 100}%`,
          height: '100%',
          background: accentColor,
          boxShadow: `0 0 12px ${accentColor}`,
          transition: 'none',
        }}
      />
    </div>
  );
}
