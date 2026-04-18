import { AbsoluteFill } from 'remotion';
import { TextOverlay } from '../components/TextOverlay';
import { COLORS } from '../styles/tokens';

/**
 * Cena 2 — Problema (8s–18s, 300 frames)
 * Beat emocional: identificacao → dor suave
 * Fundo escuro, texto puro, 1.5s de tela preta no final (expectativa)
 */
export function ProblemScene() {
  // Frames relativos a esta Sequence (0-300)
  // Texto aparece frame 15, desaparece frame 240
  // Frames 255-300 (1.5s): tela 100% preta antes da revelacao

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>
      <TextOverlay
        text="Tutoriais rasos. Cursos caros. Conteúdo em inglês."
        fontSize={64}
        color={COLORS.text}
        fontFamily="heading"
        fontWeight={700}
        frameIn={15}
        frameOut={240}
        enterDuration={15}
        exitDuration={15}
        animation="fade"
        verticalPosition="center"
      />
      <TextOverlay
        text="Você merece mais do que isso."
        fontSize={36}
        color={COLORS.blue}
        fontFamily="body"
        fontWeight={400}
        frameIn={45}
        frameOut={240}
        enterDuration={10}
        exitDuration={15}
        animation="slide-up"
        verticalPosition={580}
      />
    </AbsoluteFill>
  );
}
