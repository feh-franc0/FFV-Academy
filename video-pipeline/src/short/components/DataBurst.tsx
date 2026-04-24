import { AbsoluteFill, useCurrentFrame, interpolate, random } from 'remotion';
import { EASE } from '../styles/easing';
import { FONTS } from '../styles/short-tokens';

type BurstKind = 'streakDots' | 'xpBar' | 'progressRing';

interface Props {
  kind: BurstKind;
  color: string;
  /** Valor final (ex: 21 dias de streak, 1250 XP, 75% progresso) */
  value: number;
  /** Valor maximo (para bar/ring) */
  max?: number;
  /** Duracao em frames */
  duration?: number;
  /** Posicao central (0-1) */
  x?: number;
  y?: number;
  /** Label embaixo */
  label?: string;
}

/**
 * Data viz cinematica — streak dots acendendo em sequencia, XP bar enchendo,
 * progress ring desenhando. Usado pra dar vida a numeros antes do NumberExplosion.
 */
export function DataBurst({ kind, color, value, max, duration = 90, x = 0.5, y = 0.5, label }: Props) {
  if (kind === 'streakDots') return <StreakDots value={value} color={color} duration={duration} x={x} y={y} label={label} />;
  if (kind === 'xpBar') return <XpBar value={value} max={max ?? value * 1.5} color={color} duration={duration} x={x} y={y} label={label} />;
  return <ProgressRing value={value} max={max ?? 100} color={color} duration={duration} x={x} y={y} label={label} />;
}

function StreakDots({ value, color, duration, x, y, label }: any) {
  const frame = useCurrentFrame();
  const totalDots = Math.min(value, 30);

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        {/* Grid 7 colunas x N linhas (calendario) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12 }}>
          {Array.from({ length: totalDots }).map((_, i) => {
            const lightDelay = i * 3;
            const prog = interpolate(frame - lightDelay, [0, 10], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
            const scale = EASE.outBack(prog);
            const active = prog > 0.5;
            return (
              <div
                key={i}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: active ? color : '#30363d',
                  boxShadow: active ? `0 0 20px ${color}, 0 0 40px ${color}66` : 'none',
                  transform: `scale(${scale})`,
                  transition: 'none',
                }}
              />
            );
          })}
        </div>
        {label && (
          <div style={{ marginTop: 30, fontFamily: FONTS.body, fontSize: 48, fontWeight: 800, color: '#fff', textShadow: `0 0 20px ${color}`, textTransform: 'uppercase', letterSpacing: 3 }}>
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}

function XpBar({ value, max, color, duration, x, y, label }: any) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, duration * 0.7], [0, 1], { extrapolateRight: 'clamp' });
  const eased = EASE.outExpo(progress);
  const fillPercent = (value / max) * eased * 100;
  const displayValue = Math.round(value * eased);

  // Particulas disparando ao enchimento
  const particles = Array.from({ length: 16 }).map((_, i) => {
    const delay = i * 2;
    const pFrame = frame - delay - 10;
    if (pFrame < 0 || pFrame > 30) return null;
    const pProg = pFrame / 30;
    const angle = random(`xp-p-${i}`) * Math.PI * 2;
    const dist = 200 + random(`xp-d-${i}`) * 200;
    const px = Math.cos(angle) * dist * pProg;
    const py = Math.sin(angle) * dist * pProg - 100 * pProg;
    const opacity = 1 - pProg;
    return { i, px, py, opacity };
  }).filter(Boolean);

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%, -50%)', width: '70%', maxWidth: 900, textAlign: 'center' }}>
        <div style={{ fontFamily: FONTS.heading, fontSize: 180, fontWeight: 900, color: '#fff', letterSpacing: -6, textShadow: `0 0 40px ${color}, 0 6px 0 rgba(0,0,0,0.5)` }}>
          {displayValue} XP
        </div>
        {/* Bar background */}
        <div style={{ position: 'relative', marginTop: 30, height: 48, background: '#30363d', borderRadius: 24, overflow: 'hidden', border: `2px solid ${color}55` }}>
          {/* Bar fill */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${fillPercent}%`,
              background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
              boxShadow: `0 0 20px ${color}`,
              borderRadius: 24,
            }}
          />
          {/* Shine travelling */}
          <div
            style={{
              position: 'absolute',
              left: `${fillPercent - 10}%`,
              top: 0,
              bottom: 0,
              width: 40,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              opacity: progress < 1 ? 1 : 0,
            }}
          />
        </div>
        {label && (
          <div style={{ marginTop: 30, fontFamily: FONTS.body, fontSize: 36, fontWeight: 700, color: '#fff', textTransform: 'uppercase', letterSpacing: 3 }}>
            {label}
          </div>
        )}
        {/* Particulas */}
        {particles.map(p => p && (
          <div
            key={p.i}
            style={{
              position: 'absolute',
              left: `${fillPercent}%`,
              top: '50%',
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: color,
              transform: `translate(${p.px}px, ${p.py}px)`,
              opacity: p.opacity,
              boxShadow: `0 0 15px ${color}`,
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
}

function ProgressRing({ value, max, color, duration, x, y, label }: any) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [0, duration * 0.7], [0, 1], { extrapolateRight: 'clamp' });
  const eased = EASE.outExpo(progress);
  const percent = (value / max) * eased;
  const displayValue = Math.round(value * eased);
  const radius = 180;
  const circ = 2 * Math.PI * radius;

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
      <div style={{ position: 'absolute', left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
        <svg width={radius * 2 + 40} height={radius * 2 + 40} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={radius + 20} cy={radius + 20} r={radius} stroke="#30363d" strokeWidth={24} fill="none" />
          <circle
            cx={radius + 20}
            cy={radius + 20}
            r={radius}
            stroke={color}
            strokeWidth={24}
            fill="none"
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - percent)}
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 20px ${color})` }}
          />
        </svg>
        <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', fontFamily: FONTS.heading, fontSize: 140, fontWeight: 900, color: '#fff', textShadow: `0 0 30px ${color}` }}>
          {displayValue}%
        </div>
        {label && (
          <div style={{ marginTop: 20, fontFamily: FONTS.body, fontSize: 36, fontWeight: 800, color: '#fff', textTransform: 'uppercase', letterSpacing: 3 }}>
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
