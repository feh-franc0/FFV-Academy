import { Sequence } from 'remotion';
import type { BeatRef, CaptionRef, SceneSlot, Device, Format } from '../config/types';
import { VideoBeat } from '../components/VideoBeat';
import { DeviceMockup } from '../components/DeviceMockup';

interface Props {
  slot: SceneSlot;
  slotDurationFrames: number;
  beats: BeatRef[];
  captions?: CaptionRef[];  // ignorado — sem texto narrativo
  accentColor: string;
  device: Device;
  format: Format;
  useMockup?: boolean;
  /** Direcoes de entrada por indice de beat (alterna left/right se nao fornecido) */
  entryPattern?: ('left' | 'right' | 'top' | 'bottom' | 'scale' | 'none')[];
}

/**
 * Renderiza beats do slot em sequencia. O mockup INTEIRO entra com slide-in
 * (sem zoom no conteudo). Zero captions — motion design apenas.
 */
export function SceneBeats({ slot, slotDurationFrames, beats, accentColor, device, format, useMockup = false, entryPattern }: Props) {
  const slotBeats = beats.filter(b => b.slot === slot);

  const explicitTotal = slotBeats.reduce((acc, b) => acc + (b.durationFrames ?? 0), 0);
  const implicitCount = slotBeats.filter(b => !b.durationFrames).length;
  const remaining = Math.max(0, slotDurationFrames - explicitTotal);
  const sharePerImplicit = implicitCount > 0 ? Math.floor(remaining / implicitCount) : 0;

  let cursor = 0;
  const beatTimings = slotBeats.map(b => {
    const dur = b.durationFrames ?? sharePerImplicit;
    const t = { from: cursor, duration: dur, beat: b };
    cursor += dur;
    return t;
  });

  const defaultEntries: Array<'left' | 'right' | 'scale'> = ['scale', 'right', 'left', 'right', 'left', 'right', 'left', 'right', 'left'];

  return (
    <>
      {beatTimings.map(({ from, duration, beat }, i) => {
        const entryFrom = entryPattern?.[i] ?? defaultEntries[i % defaultEntries.length];
        const videoNode = <VideoBeat beat={beat} device={device} />;
        return (
          <Sequence key={`${beat.id}-${i}`} from={from} durationInFrames={duration}>
            {useMockup ? (
              <DeviceMockup
                device={device}
                format={format}
                tilt={3}
                float={true}
                entryFrom={entryFrom}
                entryDuration={18}
              >
                {videoNode}
              </DeviceMockup>
            ) : (
              videoNode
            )}
          </Sequence>
        );
      })}
    </>
  );
}
