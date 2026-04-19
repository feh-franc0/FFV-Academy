import { AbsoluteFill, useCurrentFrame, spring, useVideoConfig, interpolate, random } from 'remotion';
import { FONTS } from '../styles/short-tokens';
import { EASE } from '../styles/easing';

interface Props {
  value: number;
  /** Se undefined ou vazio, numero aparece sem label (motion only) */
  label?: string;
  suffix?: string;
  countFrames?: number;
  color: string;
  icon?: string;
}

/**
 * Numero com explosao PRO:
 *  - Particle burst nos primeiros 20 frames
 *  - Shake ao entrar
 *  - Contagem ESTRITAMENTE MONOTONICA: 0 -> value (nunca overshoot, nunca regride)
 *  - Se suffix for '%', cap em 100 (nao existe mais que 100%)
 *  - Pulse continuo (scale, nao valor)
 *  - Label desce depois
 */
export function NumberExplosion({ value, label, suffix = '', countFrames = 35, color, icon }: Props) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Cap semantico: nunca exibir > 100 quando e percentual
  const targetValue = suffix === '%' ? Math.min(value, 100) : value;

  // Entry scale com overshoot visual (no SCALE, nao no numero)
  const entryProg = spring({ frame, fps, config: { damping: 6, stiffness: 200 } });
  const scale = 0.15 * (1 - entryProg) + entryProg * (1 + 0.1 * Math.sin(Math.min(frame / 3, 4)));

  // Shake intenso nos primeiros 10 frames
  const shakeActive = frame < 12;
  const shakeX = shakeActive ? (random(`shake-${Math.floor(frame / 2)}`) - 0.5) * 24 : 0;
  const shakeY = shakeActive ? (random(`shake-y-${Math.floor(frame / 2)}`) - 0.5) * 18 : 0;

  // Contagem monotonica 0 -> targetValue com ease-out (rapido no inicio, suaviza no fim)
  // Math.floor garante que nunca ultrapasse targetValue em frame intermediario
  let displayed: number;
  if (frame <= 0) {
    displayed = 0;
  } else if (frame >= countFrames) {
    displayed = targetValue;
  } else {
    const t = frame / countFrames;
    const eased = EASE.outExpo(t);
    displayed = Math.min(targetValue, Math.floor(targetValue * eased));
  }

  // Label entra depois
  const labelEnter = spring({ frame: frame - 12, fps, config: { damping: 10, stiffness: 160 } });

  // Flash radial
  const flashIntensity = interpolate(frame, [0, 4, 14], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Pulse sustentado
  const pulse = 1 + 0.06 * Math.sin(frame * 0.22);

  return (
    <AbsoluteFill style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {/* Flash radial */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `radial-gradient(circle at center, ${color}cc 0%, ${color}33 25%, transparent 55%)`,
          opacity: flashIntensity,
          mixBlendMode: 'screen',
        }}
      />

      {/* Particle burst — 18 raios */}
      {frame < 25 && Array.from({ length: 18 }).map((_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const dist = interpolate(frame, [0, 25], [0, 650], { extrapolateRight: 'clamp' });
        const opacity = interpolate(frame, [0, 8, 22], [0, 1, 0], { extrapolateRight: 'clamp' });
        const size = 12 + random(`p-${i}`) * 8;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        return (
          <div
            key={`ray-${i}`}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: size,
              height: size,
              borderRadius: '50%',
              background: color,
              transform: `translate(${x}px, ${y}px)`,
              opacity,
              boxShadow: `0 0 30px ${color}`,
            }}
          />
        );
      })}

      {/* Numero */}
      <div
        style={{
          position: 'relative',
          transform: `translate(${shakeX}px, ${shakeY}px) scale(${scale * pulse})`,
          textAlign: 'center',
        }}
      >
        {icon && (
          <div style={{ fontSize: 100, marginBottom: -20, filter: `drop-shadow(0 0 25px ${color})` }}>
            {icon}
          </div>
        )}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontWeight: 900,
            fontSize: 400,
            lineHeight: 0.88,
            color: '#fff',
            textShadow: `
              0 0 40px ${color},
              0 0 90px ${color},
              0 0 140px ${color}66,
              0 8px 0 rgba(0,0,0,0.5)
            `,
            letterSpacing: -12,
            WebkitTextStroke: `5px ${color}`,
          }}
        >
          {displayed.toLocaleString('pt-BR')}{suffix}
        </div>

        {/* Label (opcional — renderizado so se texto nao vazio) */}
        {label && (
          <div
            style={{
              marginTop: 20,
              fontFamily: FONTS.body,
              fontWeight: 900,
              fontSize: 78,
              color: '#fff',
              textTransform: 'uppercase',
              letterSpacing: 8,
              textShadow: `0 4px 24px rgba(0,0,0,0.95), 0 0 35px ${color}88`,
              opacity: labelEnter,
              transform: `translateY(${36 * (1 - labelEnter)}px)`,
            }}
          >
            {label}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
}
