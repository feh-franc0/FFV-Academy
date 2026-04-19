import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import { EASE } from '../styles/easing';

interface ClickEvent {
  /** Tempo em frames (local ao Sequence) em que o clique ocorre */
  atFrame: number;
  /** Posicao 0-1 */
  x: number;
  y: number;
}

interface Props {
  clicks?: ClickEvent[];
  color: string;
  /** Path do cursor (0-1 pos relativo); default: drift aleatorio orgânico */
  path?: { atFrame: number; x: number; y: number }[];
  size?: number;
}

/**
 * Cursor animado com trail + ripple nos cliques.
 * Se `path` for fornecido, o cursor viaja pelos pontos com easing cinematico.
 * Em cada click do `clicks[]`, dispara ripple expansivo.
 */
export function CursorTrail({ clicks = [], color, path, size = 36 }: Props) {
  const frame = useCurrentFrame();

  // Posicao default: hover central-baixo com drift
  const defaultPath = [
    { atFrame: 0, x: 0.5, y: 0.6 },
    { atFrame: 30, x: 0.55, y: 0.55 },
    { atFrame: 60, x: 0.5, y: 0.5 },
  ];
  const p = path && path.length ? path : (clicks.length ? clicks.map((c, i) => ({ atFrame: c.atFrame - 10 + i, x: c.x, y: c.y })) : defaultPath);

  const pos = lerpPath(p, frame);

  // Trail: ultimos 10 frames
  const trailPositions = Array.from({ length: 8 }, (_, i) => lerpPath(p, frame - (i + 1) * 2));

  return (
    <AbsoluteFill style={{ pointerEvents: 'none' }}>
      {/* Trail */}
      {trailPositions.map((tp, i) => (
        <div
          key={`trail-${i}`}
          style={{
            position: 'absolute',
            left: `${tp.x * 100}%`,
            top: `${tp.y * 100}%`,
            width: size * 0.6,
            height: size * 0.6,
            borderRadius: '50%',
            background: color,
            opacity: (1 - i / 8) * 0.35,
            transform: 'translate(-50%, -50%)',
            filter: `blur(${i * 1.5}px)`,
          }}
        />
      ))}

      {/* Ripples dos cliques */}
      {clicks.map((click, i) => {
        const elapsed = frame - click.atFrame;
        if (elapsed < 0 || elapsed > 40) return null;
        const progress = elapsed / 40;
        const scale = 0.5 + 3.5 * EASE.outExpo(progress);
        const opacity = 1 - progress;
        return (
          <div
            key={`ripple-${i}`}
            style={{
              position: 'absolute',
              left: `${click.x * 100}%`,
              top: `${click.y * 100}%`,
              width: size * 3,
              height: size * 3,
              borderRadius: '50%',
              border: `4px solid ${color}`,
              transform: `translate(-50%, -50%) scale(${scale})`,
              opacity,
              boxShadow: `0 0 40px ${color}`,
            }}
          />
        );
      })}

      {/* Cursor (seta estilizada) */}
      <div
        style={{
          position: 'absolute',
          left: `${pos.x * 100}%`,
          top: `${pos.y * 100}%`,
          transform: 'translate(-20%, -10%)',
          width: size,
          height: size,
          filter: `drop-shadow(0 4px 12px rgba(0,0,0,0.6)) drop-shadow(0 0 12px ${color})`,
        }}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
          <path
            d="M4 2 L4 20 L10 14 L14 22 L17 20.5 L13 13 L20 13 Z"
            fill="#ffffff"
            stroke={color}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
}

function lerpPath(path: { atFrame: number; x: number; y: number }[], frame: number): { x: number; y: number } {
  if (frame <= path[0].atFrame) return { x: path[0].x, y: path[0].y };
  if (frame >= path[path.length - 1].atFrame) return { x: path[path.length - 1].x, y: path[path.length - 1].y };
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    if (frame >= a.atFrame && frame <= b.atFrame) {
      const t = (frame - a.atFrame) / (b.atFrame - a.atFrame);
      const eased = EASE.inOutCubic(t);
      return {
        x: a.x + (b.x - a.x) * eased,
        y: a.y + (b.y - a.y) * eased,
      };
    }
  }
  return { x: 0.5, y: 0.5 };
}
