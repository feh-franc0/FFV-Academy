import { AbsoluteFill, Sequence } from 'remotion';
import type { HeroConfig, Device, Format } from '../config/types';
import { COLORS, SCENES } from '../styles/short-tokens';
import { NumberExplosion } from '../components/NumberExplosion';
import { ParticleField } from '../components/ParticleField';
import { SceneBeats } from './SceneBeats';
import { ColorGrade } from '../components/ColorGrade';
import { DataBurst } from '../components/DataBurst';

interface Props { config: HeroConfig; device: Device; format: Format; includeText?: boolean; }

export function ProofScene({ config, device, format, includeText = false }: Props) {
  return (
    <ColorGrade mood="goldSuccess" intensity={0.55}>
      <AbsoluteFill style={{ background: COLORS.gradientProof }}>
        {/* Video mockup ao fundo com opacidade reduzida (contexto visual) */}
        <AbsoluteFill style={{ opacity: 0.18 }}>
          <SceneBeats
            slot="proof"
            slotDurationFrames={SCENES.proof.duration}
            beats={config.beats}
            captions={[]}
            accentColor={config.accentColor}
            device={device}
            format={format}
            useMockup={true}
          />
        </AbsoluteFill>

        <ParticleField color={COLORS.accentGold} count={100} intensity={1} seed="proof" />

        {/* 4 numbers com explosao — offsets em hero.ts sao 0/75/150/225 */}
        {config.numbers.map((num, i) => (
          <Sequence
            key={`num-${i}`}
            from={num.offsetFrames}
            durationInFrames={num.durationFrames}
          >
            <NumberExplosion
              value={num.value}
              label={includeText ? num.label : undefined}
              suffix={num.suffix}
              countFrames={num.countFrames}
              color={num.color ?? config.accentColor}
              icon={num.icon}
            />
          </Sequence>
        ))}
      </AbsoluteFill>
    </ColorGrade>
  );
}
