import { AbsoluteFill } from 'remotion';
import { ScreenFrame } from '../components/ScreenFrame';
import { SceneTransition } from '../components/SceneTransition';
import { TextOverlay } from '../components/TextOverlay';
import { COLORS } from '../styles/tokens';

/**
 * Cena 3 — Revelacao (18s–30s, 360 frames)
 * Beat emocional: descoberta → encantamento
 * Zoom-from-black revelando a home hero
 */
export function RevealScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <SceneTransition
        type="zoom-from-black"
        enterDuration={30}
        exitDuration={12}
        durationInFrames={330}
      >
        <ScreenFrame
          screenshot="01-home-hero.png"
          kenBurns={[1.0, 1.08]}
          overlayGradient
          overlayOpacity={0.7}
        />

        {/* Label FFV ACADEMY */}
        <TextOverlay
          text="FFV ACADEMY"
          fontSize={24}
          color={COLORS.blue}
          fontFamily="heading"
          fontWeight={700}
          frameIn={60}
          frameOut={330}
          enterDuration={15}
          animation="slide-up"
          verticalPosition={720}
          letterSpacing="0.1em"
          uppercase
        />

        {/* Headline principal */}
        <TextOverlay
          text="Aprenda tecnologia real. Evolua de verdade."
          fontSize={56}
          color={COLORS.text}
          fontFamily="heading"
          fontWeight={700}
          frameIn={75}
          frameOut={330}
          enterDuration={15}
          animation="slide-up"
          verticalPosition={760}
          textAlign="left"
          paddingHorizontal={100}
        />
      </SceneTransition>
    </AbsoluteFill>
  );
}
