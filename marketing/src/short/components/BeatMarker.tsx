import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { RHYTHM } from '../styles/short-tokens';

/**
 * Flash branco de 2 frames (pattern break entre cortes de beat).
 * Recebe em quais frames (locais a Sequence) o flash deve aparecer.
 */
interface Props {
  triggerFrames: number[];
}

export function BeatMarker({ triggerFrames }: Props) {
  const frame = useCurrentFrame();
  const active = triggerFrames.some(f => frame >= f && frame < f + RHYTHM.BEAT_MARKER_FRAMES);

  if (!active) return null;

  return (
    <AbsoluteFill
      style={{
        background: '#ffffff',
        opacity: 0.85,
        pointerEvents: 'none',
        zIndex: 40,
      }}
    />
  );
}
