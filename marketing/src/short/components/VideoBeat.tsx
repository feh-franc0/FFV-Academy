import { OffthreadVideo, staticFile } from 'remotion';
import type { BeatRef, Device } from '../config/types';

interface Props {
  beat: BeatRef;
  device: Device;
}

/**
 * Renderiza um beat gravado. O path e resolvido baseado no device:
 *   beats/hero-<device>/<id>.mp4
 */
export function VideoBeat({ beat, device }: Props) {
  const fps = 30;
  const startFrom = beat.trimStart ? Math.round(beat.trimStart * fps) : 0;
  const endAt = beat.trimEnd ? Math.round(beat.trimEnd * fps) : undefined;
  const src = `beats/hero-${device}/${beat.id}.mp4`;

  return (
    <OffthreadVideo
      src={staticFile(src)}
      volume={0}
      playbackRate={beat.playbackRate ?? 1}
      startFrom={startFrom}
      endAt={endAt}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
      }}
    />
  );
}
