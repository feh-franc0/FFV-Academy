import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { ScreenFrame, DarkOverlay } from '../components/ScreenFrame';
import { COLORS, FONTS } from '../styles/tokens';

/**
 * Cena 5 — Prova / Numeros (52s–62s, 300 frames)
 * Beat emocional: confianca → credibilidade
 * Dashboard desfocado ao fundo + numeros animados (contagem)
 */
export function ProofScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Background: dashboard com blur + overlay */}
      <ScreenFrame
        screenshot="18-progresso-hero.png"
        kenBurns={[1.0, 1.03]}
        blur={8}
        opacity={0.3}
      />
      <DarkOverlay opacity={0.5} />

      {/* Grid de numeros 2×2 */}
      <AbsoluteFill
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 80,
            maxWidth: 1200,
          }}
        >
          <AnimatedNumber value={168} label="artigos técnicos" color={COLORS.text} startFrame={30} />
          <AnimatedNumber value={16} label="trilhas estruturadas" color={COLORS.text} startFrame={60} />
          <AnimatedNumber value={36} label="horas de conteúdo" color={COLORS.text} suffix="h" startFrame={90} />
          <AnimatedNumber value={100} label="gratuito" color={COLORS.green} suffix="%" startFrame={120} />
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}

function AnimatedNumber({
  value,
  label,
  color,
  suffix = '',
  startFrame,
}: {
  value: number;
  label: string;
  color: string;
  suffix?: string;
  startFrame: number;
}) {
  const frame = useCurrentFrame();
  const countDuration = 45;

  // Contagem de 0 ate value
  const currentValue = Math.round(
    interpolate(
      frame,
      [startFrame, startFrame + countDuration],
      [0, value],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
    )
  );

  // Fade-in do label (aparece depois da contagem)
  const labelOpacity = interpolate(
    frame,
    [startFrame + countDuration, startFrame + countDuration + 10],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Opacity geral (fade-in)
  const opacity = interpolate(
    frame,
    [startFrame, startFrame + 5],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: 400,
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.heading,
          fontSize: 96,
          fontWeight: 800,
          color,
          lineHeight: 1,
          textShadow: '0 2px 30px rgba(0,0,0,0.6)',
        }}
      >
        {currentValue}{suffix}
      </div>
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 28,
          fontWeight: 400,
          color: COLORS.muted,
          marginTop: 8,
          opacity: labelOpacity,
        }}
      >
        {label}
      </div>
    </div>
  );
}
