import { AbsoluteFill, useCurrentFrame, Sequence } from 'remotion';
import type { HeroConfig, Device, Format } from '../config/types';
import { SCENES, COLORS } from '../styles/short-tokens';
import { SceneBeats } from './SceneBeats';
import { ParticleField } from '../components/ParticleField';
import { ColorGrade } from '../components/ColorGrade';
import { LiquidWipe } from '../components/LiquidWipe';
import { KineticText } from '../components/KineticText';

interface Props { config: HeroConfig; device: Device; format: Format; includeText?: boolean; }

export function PainScene({ config, device, format, includeText = false }: Props) {
  const frame = useCurrentFrame();
  const pulse = 0.3 + 0.25 * Math.sin(frame * 0.15);
  const baseSize = format === 'horizontal' ? 120 : 100;

  return (
    <ColorGrade mood="warmWarning" intensity={0.65}>
      <AbsoluteFill style={{ background: COLORS.gradientPain }}>
        <ParticleField color={COLORS.accentHot} count={30} intensity={0.6} seed="pain" />
        <SceneBeats
          slot="pain"
          slotDurationFrames={SCENES.pain.duration}
          beats={config.beats}
          accentColor={COLORS.accentHot}
          device={device}
          format={format}
          useMockup={true}
          entryPattern={['right']}
        />
        {includeText && (
          <>
            <Sequence from={0} durationInFrames={40}>
              <KineticText
                format={format}
                color={COLORS.accentHot}
                position="bottom"
                baseSize={baseSize}
                words={[
                  { text: 'SEM', color: COLORS.accentHot },
                  { text: 'curso', emphasis: true, color: '#fff' },
                  { text: 'de', color: '#fff' },
                  { text: '2k', emphasis: true, color: COLORS.accentGold },
                ]}
              />
            </Sequence>
            <Sequence from={40} durationInFrames={40}>
              <KineticText
                format={format}
                color={COLORS.accentHot}
                position="middle"
                baseSize={baseSize + 15}
                words={[
                  { text: 'SEM', color: COLORS.accentHot },
                  { text: 'paywall', emphasis: true, color: '#fff' },
                ]}
              />
            </Sequence>
            <Sequence from={80} durationInFrames={40}>
              <KineticText
                format={format}
                color={COLORS.accentHot}
                position="top"
                baseSize={baseSize + 15}
                words={[
                  { text: 'SEM', color: COLORS.accentHot },
                  { text: 'enrolação', emphasis: true, color: '#fff' },
                ]}
              />
            </Sequence>
          </>
        )}
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            background: `radial-gradient(ellipse at center, transparent 25%, rgba(80, 20, 0, ${pulse}) 100%)`,
          }}
        />
        <LiquidWipe color={config.accentColor} startFrame={100} duration={25} mode="enter" direction="right" />
      </AbsoluteFill>
    </ColorGrade>
  );
}
