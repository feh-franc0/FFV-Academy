import { AbsoluteFill } from 'remotion';
import { ScreenFrame } from '../components/ScreenFrame';
import { TextOverlay } from '../components/TextOverlay';
import { COLORS } from '../styles/tokens';

/**
 * Cena 6 — CTA (62s–80s, 540 frames)
 * Beat emocional: urgencia suave → confianca → acao
 * 3 beats: URL → acao → closer
 * Respiro final de 90 frames (3s)
 */
export function CTAScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      {/* Background sutil: home blur com opacidade baixa */}
      <ScreenFrame
        screenshot="01-home-hero.png"
        kenBurns={[1.0, 1.02]}
        blur={12}
        opacity={0.12}
      />

      {/* Beat 1 — URL (frame 15, permanece ate o final) */}
      <TextOverlay
        text="fernandofrancovalle.com"
        fontSize={64}
        color={COLORS.blue}
        fontFamily="heading"
        fontWeight={700}
        frameIn={15}
        frameOut={540}
        enterDuration={15}
        exitDuration={0}
        animation="fade"
        verticalPosition={380}
      />

      {/* Beat 2 — Acao (frame 150, 5s depois) */}
      <TextOverlay
        text="Comece agora. De curioso a especialista."
        fontSize={44}
        color={COLORS.text}
        fontFamily="heading"
        fontWeight={500}
        frameIn={150}
        frameOut={540}
        enterDuration={15}
        exitDuration={0}
        animation="slide-up"
        verticalPosition={470}
      />

      {/* Beat 3 — Closer (frame 300, 10s depois) */}
      <TextOverlay
        text="100% gratuito · Sem cadastro · Comece em 10 segundos"
        fontSize={32}
        color={COLORS.green}
        fontFamily="body"
        fontWeight={400}
        frameIn={300}
        frameOut={540}
        enterDuration={15}
        exitDuration={0}
        animation="fade"
        verticalPosition={540}
        textShadow={false}
      />
    </AbsoluteFill>
  );
}
