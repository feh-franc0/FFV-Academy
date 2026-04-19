import { AbsoluteFill, Sequence } from 'remotion';
import type { HeroConfig, Device, Format } from '../config/types';
import { SCENES, COLORS } from '../styles/short-tokens';
import { SceneBeats } from './SceneBeats';
import { BeatMarker } from '../components/BeatMarker';
import { ParticleField } from '../components/ParticleField';
import { ColorGrade } from '../components/ColorGrade';
import { QuickCaption } from '../components/QuickCaption';

interface Props { config: HeroConfig; device: Device; format: Format; includeText?: boolean; }

/**
 * Demo Fire — 8 beats em mockup entrando de direcoes alternadas.
 * Zero texto. Motion design apenas: cursor nos cliques + highlight rings + flashes.
 */
export function FeatureFireScene({ config, device, format, includeText = false }: Props) {
  const demoBeats = config.beats.filter(b => b.slot === 'demo');
  const triggers: number[] = [];
  let cursor = 0;
  const explicitTotal = demoBeats.reduce((acc, b) => acc + (b.durationFrames ?? 0), 0);
  const implicitCount = demoBeats.filter(b => !b.durationFrames).length;
  const remaining = Math.max(0, SCENES.demo.duration - explicitTotal);
  const share = implicitCount > 0 ? Math.floor(remaining / implicitCount) : 0;
  for (let i = 0; i < demoBeats.length - 1; i++) {
    cursor += demoBeats[i].durationFrames ?? share;
    triggers.push(cursor);
  }

  // Alterna entrada dos 8 beats: esquerda/direita/cima/baixo
  const entryPattern: Array<'left' | 'right' | 'top' | 'bottom'> = [
    'right', 'left', 'right', 'left', 'top', 'bottom', 'right', 'left',
  ];

  return (
    <ColorGrade mood="vibrantDemo" intensity={0.35}>
      <AbsoluteFill style={{ background: COLORS.bg }}>
        <ParticleField color={config.accentColor} count={30} intensity={0.5} seed="demo" />

        <SceneBeats
          slot="demo"
          slotDurationFrames={SCENES.demo.duration}
          beats={config.beats}
          accentColor={config.accentColor}
          device={device}
          format={format}
          useMockup={true}
          entryPattern={entryPattern}
        />

        {/* Overlays de UIHighlight/CursorTrail removidos: coordenadas hardcoded
            nao casam com o layout real dos beats gravados (caixas em "CONTINUE
            LENDO" em vez de XP, em barra de XP em vez de streak). Motion + BeatMarker
            + captions carregam o demo sem risco de overlay no vazio. */}

        {/* Feature titles (text mode) — 1 por beat */}
        {includeText && FEATURE_CAPTIONS.map((text, i) => (
          <Sequence key={`feat-${i}`} from={i * 112 + 8} durationInFrames={96}>
            <QuickCaption
              format={format}
              accentColor={i < 4 ? config.accentColor : COLORS.accentGold}
              caption={{
                text,
                slot: 'demo',
                style: 'feature',
                enter: i % 2 === 0 ? 'slideUp' : 'punch',
                position: 'top',
                durationFrames: 96,
              }}
            />
          </Sequence>
        ))}

        <BeatMarker triggerFrames={triggers} />
      </AbsoluteFill>
    </ColorGrade>
  );
}

const FEATURE_CAPTIONS = [
  'INTELIGÊNCIA ARTIFICIAL',
  'AWS CLOUD',
  'ENGENHARIA DE SOFTWARE',
  'CLAUDE · ANTHROPIC',
  'ARTIGOS TÉCNICOS',
  'QUIZ · XP',
  'STREAK · BADGES',
  'REVISÃO SM-2',
];
