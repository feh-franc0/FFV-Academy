import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASE } from '../styles/easing';

interface Props {
  /** Posicao em 0-1 do centro do highlight */
  x: number;
  y: number;
  /** Largura/altura do highlight (px) */
  width: number;
  height: number;
  color: string;
  /** Tipo: box (retangular) ou circle */
  shape?: 'box' | 'circle';
  /** Offset de entrada em frames */
  startFrame?: number;
  /** Duracao total visivel */
  duration?: number;
  /** Label opcional proximo ao highlight */
  label?: string;
  labelPosition?: 'above' | 'below' | 'right' | 'left';
}

/**
 * Destaca um elemento da UI com box/circle pulsante.
 * Usado pra "puxar o olho" pra uma feature especifica — XP, streak, badge, etc.
 */
export function UIHighlight({
  x, y, width, height, color, shape = 'box', startFrame = 0, duration = 60, label, labelPosition = 'above',
}: Props) {
  const frame = useCurrentFrame();
  const localFrame = frame - startFrame;

  if (localFrame < 0 || localFrame > duration) return null;

  // Entry: scale de 1.3 pra 1 com overshoot
  const entryProgress = interpolate(localFrame, [0, 15], [0, 1], { extrapolateRight: 'clamp' });
  const entryScale = 1.3 - 0.3 * EASE.outBack(entryProgress);

  // Pulse continuo
  const pulse = 1 + 0.06 * Math.sin(localFrame * 0.25);

  // Exit
  const exitStart = duration - 12;
  const exitOpacity = interpolate(localFrame, [exitStart, duration], [1, 0], { extrapolateRight: 'clamp' });

  const finalScale = entryScale * pulse;

  // Label offset
  const labelOffset = {
    above:  { top: -60, left: 0, translateY: '-100%' },
    below:  { top: height + 20, left: 0, translateY: '0' },
    right:  { top: 0, left: width + 20, translateY: '0' },
    left:   { top: 0, left: -20, translateY: '0', translateXExtra: '-100%' },
  }[labelPosition];

  const ringStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${x * 100}%`,
    top: `${y * 100}%`,
    width,
    height,
    transform: `translate(-50%, -50%) scale(${finalScale})`,
    border: `4px solid ${color}`,
    borderRadius: shape === 'circle' ? '50%' : 12,
    boxShadow: `0 0 40px ${color}, inset 0 0 20px ${color}44`,
    opacity: entryProgress * exitOpacity,
    pointerEvents: 'none',
  };

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      <div style={ringStyle} />

      {/* Label */}
      {label && (
        <div
          style={{
            position: 'absolute',
            left: `${x * 100}%`,
            top: `${y * 100}%`,
            transform: 'translate(-50%, -50%)',
            width: 0,
            height: 0,
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: labelOffset.top,
              left: labelOffset.left,
              transform: `translate(${(labelOffset as any).translateXExtra ?? '-50%'}, ${labelOffset.translateY})`,
              padding: '14px 24px',
              background: color,
              color: '#0d1117',
              fontSize: 28,
              fontWeight: 900,
              borderRadius: 999,
              whiteSpace: 'nowrap',
              boxShadow: `0 8px 30px rgba(0,0,0,0.5), 0 0 30px ${color}88`,
              opacity: entryProgress * exitOpacity,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            {label}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
}
