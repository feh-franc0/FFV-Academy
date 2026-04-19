import { AbsoluteFill } from 'remotion';
import type { HeroConfig, Device, Format } from '../config/types';
import { SCENES, COLORS } from '../styles/short-tokens';
import { SceneBeats } from './SceneBeats';
import { GlitchReveal } from '../components/GlitchReveal';
import { ParticleField } from '../components/ParticleField';
import { ColorGrade } from '../components/ColorGrade';
import { KineticText } from '../components/KineticText';

interface Props { config: HeroConfig; device: Device; format: Format; includeText?: boolean; }

export function HookScene({ config, device, format, includeText = false }: Props) {
  return (
    <ColorGrade mood="coldCyan" intensity={0.55}>
      <AbsoluteFill style={{ background: COLORS.gradientHook }}>
        <ParticleField color={config.accentColor} count={45} intensity={1} seed="hook" />
        <GlitchReveal duration={14} intensity={0.9}>
          <SceneBeats
            slot="hook"
            slotDurationFrames={SCENES.hook.duration}
            beats={config.beats}
            accentColor={config.accentColor}
            device={device}
            format={format}
            useMockup={true}
            entryPattern={['scale']}
          />
        </GlitchReveal>
        {includeText && (
          <KineticText
            format={format}
            color={config.accentColor}
            position="middle"
            stagger={5}
            words={[
              { text: 'QUER' },
              { text: 'APRENDER' },
              { text: 'IA', emphasis: true, color: config.accentColor },
              { text: 'DE' },
              { text: 'VERDADE?', emphasis: true, color: '#ffffff' },
            ]}
          />
        )}
      </AbsoluteFill>
    </ColorGrade>
  );
}
