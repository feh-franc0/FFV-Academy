import { AbsoluteFill, useCurrentFrame, interpolate } from 'remotion';
import type { HeroConfig, Device, Format } from '../config/types';
import { SCENES, COLORS } from '../styles/short-tokens';
import { SceneBeats } from './SceneBeats';
import { LogoFormation } from '../components/LogoFormation';
import { ParticleField } from '../components/ParticleField';
import { SpotlightBeam } from '../components/SpotlightBeam';
import { ColorGrade } from '../components/ColorGrade';
import { LiquidWipe } from '../components/LiquidWipe';
import { FONTS, safeZoneFor } from '../styles/short-tokens';

interface Props { config: HeroConfig; device: Device; format: Format; includeText?: boolean; }

/** 7-11s: mockup desce ao fundo, flash, spotlight, LogoFormation emerge. */
export function RevealScene({ config, device, format, includeText = false }: Props) {
  const frame = useCurrentFrame();
  const flash = interpolate(frame, [0, 4, 12], [0, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <ColorGrade mood="neutralBright" intensity={0.35}>
      <AbsoluteFill style={{ background: COLORS.gradientReveal }}>
        {/* Liquid wipe entrando (continuidade com Pain) */}
        <LiquidWipe color={config.accentColor} startFrame={0} duration={15} mode="exit" direction="right" />

        <ParticleField color={config.accentColor} count={85} intensity={1} seed="reveal" />

        {/* Mockup ao fundo em baixa opacidade */}
        <AbsoluteFill style={{ opacity: 0.5 }}>
          <SceneBeats
            slot="reveal"
            slotDurationFrames={SCENES.reveal.duration}
            beats={config.beats}
            accentColor={config.accentColor}
            device={device}
            format={format}
            useMockup={true}
            entryPattern={['bottom']}
          />
        </AbsoluteFill>

        <SpotlightBeam color={config.accentColor} direction="lr" intensity={0.5} />

        {flash > 0 && (
          <AbsoluteFill style={{ background: '#fff', opacity: flash, zIndex: 30 }} />
        )}

        {/* Logo formation no centro */}
        <LogoFormation
          color={config.accentColor}
          topPercent={includeText ? 42 : 50}
          fontSize={format === 'horizontal' ? 240 : 190}
        />

        {/* Sub-linha (text mode) */}
        {includeText && frame > 60 && (
          <div
            style={{
              position: 'absolute',
              left: safeZoneFor(format).sides,
              right: safeZoneFor(format).sides,
              bottom: safeZoneFor(format).bottom,
              textAlign: 'center',
              fontFamily: FONTS.body,
              fontSize: format === 'horizontal' ? 56 : 48,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: -0.5,
              textShadow: '0 4px 24px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,1)',
              opacity: interpolate(frame - 60, [0, 15], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            }}
          >
            a plataforma gratuita para devs sérios
          </div>
        )}
      </AbsoluteFill>
    </ColorGrade>
  );
}
