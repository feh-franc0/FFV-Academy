import { registerRoot, Composition } from 'remotion';
import { HeroRoot } from './HeroRoot';
import { FPS, TOTAL_FRAMES, dimsFor } from './styles/short-tokens';
import { hero } from './config/hero';

import '@remotion/google-fonts/Poppins';
import '@remotion/google-fonts/Inter';

const H = dimsFor('horizontal');
const V = dimsFor('vertical');

/**
 * 8 compositions = 1 config × (2 formats) × (2 devices) × (2 text modes).
 */
export const RemotionShortRoot: React.FC = () => (
  <>
    {/* 4 sem texto (motion puro) */}
    <Composition
      id="Hero-H-Phone"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={H.width}
      height={H.height}
      defaultProps={{ config: hero, device: 'phone' as const, format: 'horizontal' as const, includeText: false }}
    />
    <Composition
      id="Hero-H-Computer"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={H.width}
      height={H.height}
      defaultProps={{ config: hero, device: 'computer' as const, format: 'horizontal' as const, includeText: false }}
    />
    <Composition
      id="Hero-V-Phone"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={V.width}
      height={V.height}
      defaultProps={{ config: hero, device: 'phone' as const, format: 'vertical' as const, includeText: false }}
    />
    <Composition
      id="Hero-V-Computer"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={V.width}
      height={V.height}
      defaultProps={{ config: hero, device: 'computer' as const, format: 'vertical' as const, includeText: false }}
    />

    {/* 4 com texto (copy-driven) */}
    <Composition
      id="Hero-H-Phone-Text"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={H.width}
      height={H.height}
      defaultProps={{ config: hero, device: 'phone' as const, format: 'horizontal' as const, includeText: true }}
    />
    <Composition
      id="Hero-H-Computer-Text"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={H.width}
      height={H.height}
      defaultProps={{ config: hero, device: 'computer' as const, format: 'horizontal' as const, includeText: true }}
    />
    <Composition
      id="Hero-V-Phone-Text"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={V.width}
      height={V.height}
      defaultProps={{ config: hero, device: 'phone' as const, format: 'vertical' as const, includeText: true }}
    />
    <Composition
      id="Hero-V-Computer-Text"
      component={HeroRoot}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={V.width}
      height={V.height}
      defaultProps={{ config: hero, device: 'computer' as const, format: 'vertical' as const, includeText: true }}
    />
  </>
);

registerRoot(RemotionShortRoot);
