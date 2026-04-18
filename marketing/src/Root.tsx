import { AbsoluteFill, Sequence } from 'remotion';
import { HookScene } from './scenes/HookScene';
import { ProblemScene } from './scenes/ProblemScene';
import { RevealScene } from './scenes/RevealScene';
import { FeaturesScene } from './scenes/FeaturesScene';
import { ProofScene } from './scenes/ProofScene';
import { CTAScene } from './scenes/CTAScene';
import { SCENES, COLORS } from './styles/tokens';

/**
 * Composicao principal do video promocional FFV Academy
 * 90 segundos, 30fps, 1920x1080
 *
 * Arco narrativo:
 * Hook → Problema → Revelacao → Features (expandido) → Prova → CTA
 */
export function PromoVideo() {
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.bg }}>

      {/* Cena 1 — Hook (0s–8s) */}
      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.duration}>
        <HookScene />
      </Sequence>

      {/* Cena 2 — Problema (8s–18s) */}
      <Sequence from={SCENES.problem.from} durationInFrames={SCENES.problem.duration}>
        <ProblemScene />
      </Sequence>

      {/* Cena 3 — Revelacao (18s–30s) */}
      <Sequence from={SCENES.reveal.from} durationInFrames={SCENES.reveal.duration}>
        <RevealScene />
      </Sequence>

      {/* Cena 4 — Features (30s–52s) */}
      <Sequence from={SCENES.features.from} durationInFrames={SCENES.features.duration}>
        <FeaturesScene />
      </Sequence>

      {/* Cena 5 — Prova / Numeros (52s–62s) */}
      <Sequence from={SCENES.proof.from} durationInFrames={SCENES.proof.duration}>
        <ProofScene />
      </Sequence>

      {/* Cena 6 — CTA (62s–80s) */}
      <Sequence from={SCENES.cta.from} durationInFrames={SCENES.cta.duration}>
        <CTAScene />
      </Sequence>
    </AbsoluteFill>
  );
}
