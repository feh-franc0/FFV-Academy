import { AbsoluteFill, Sequence } from 'remotion';
import type { HeroConfig, Device, Format } from './config/types';
import { SCENES, COLORS } from './styles/short-tokens';
import { HookScene } from './scenes/HookScene';
import { PainScene } from './scenes/PainScene';
import { RevealScene } from './scenes/RevealScene';
import { FeatureFireScene } from './scenes/FeatureFireScene';
import { ProofScene } from './scenes/ProofScene';
import { CTAScene } from './scenes/CTAScene';
import { ProgressBar } from './components/ProgressBar';
import { BackgroundTrack } from './components/BackgroundTrack';

/**
 * HeroRoot — 60s comercial FFV Academy parametrizado por device + format.
 *
 * Arco:
 *   0-3s   HOOK      gancho + glitch reveal + particulas
 *   3-7s   PAIN      dor + vignette pulsante
 *   7-11s  REVEAL    flash + logo formation + spotlight
 *   11-41s DEMO FIRE 8 features em mockup 3D + cortes agressivos
 *   41-51s PROOF     numeros com explosao + particulas
 *   51-60s CTA       logo + URL pulsante + tagline hard
 */
export function HeroRoot({
  config,
  device,
  format,
  includeText = false,
}: {
  config: HeroConfig;
  device: Device;
  format: Format;
  includeText?: boolean;
}) {
  return (
    <AbsoluteFill style={{ background: COLORS.bg }}>
      <Sequence from={SCENES.hook.from} durationInFrames={SCENES.hook.duration}>
        <HookScene config={config} device={device} format={format} includeText={includeText} />
      </Sequence>

      <Sequence from={SCENES.pain.from} durationInFrames={SCENES.pain.duration}>
        <PainScene config={config} device={device} format={format} includeText={includeText} />
      </Sequence>

      <Sequence from={SCENES.reveal.from} durationInFrames={SCENES.reveal.duration}>
        <RevealScene config={config} device={device} format={format} includeText={includeText} />
      </Sequence>

      <Sequence from={SCENES.demo.from} durationInFrames={SCENES.demo.duration}>
        <FeatureFireScene config={config} device={device} format={format} includeText={includeText} />
      </Sequence>

      <Sequence from={SCENES.proof.from} durationInFrames={SCENES.proof.duration}>
        <ProofScene config={config} device={device} format={format} includeText={includeText} />
      </Sequence>

      <Sequence from={SCENES.cta.from} durationInFrames={SCENES.cta.duration}>
        <CTAScene config={config} device={device} format={format} includeText={includeText} />
      </Sequence>

      <ProgressBar accentColor={config.accentColor} />
      <BackgroundTrack src={config.track} volume={config.trackVolume ?? 0.22} />
    </AbsoluteFill>
  );
}
