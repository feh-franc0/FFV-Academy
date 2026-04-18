import { AbsoluteFill } from 'remotion';
import { TextOverlay } from '../components/TextOverlay';
import { COLORS } from '../styles/tokens';

/**
 * Cena 1 — Hook (0s–8s, 240 frames)
 * Beat emocional: provocacao → curiosidade
 * Fundo escuro, texto puro, sem screenshot
 */
export function HookScene() {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TextOverlay
        text="Estudar tecnologia deveria te transformar."
        fontSize={72}
        color={COLORS.text}
        fontFamily="heading"
        fontWeight={700}
        frameIn={0}
        frameOut={210}
        enterDuration={10}
        exitDuration={10}
        animation="fade"
        verticalPosition="center"
      />
      <TextOverlay
        text="Não só te informar."
        fontSize={40}
        color={COLORS.muted}
        fontFamily="body"
        fontWeight={400}
        frameIn={25}
        frameOut={210}
        enterDuration={10}
        exitDuration={10}
        animation="fade"
        verticalPosition={580}
      />
    </AbsoluteFill>
  );
}
