import { Audio, staticFile } from 'remotion';

interface Props {
  src: string;
  volume?: number;
}

/**
 * Trilha de fundo do short (royalty-free). Volume baixo porque TikTok/Reels
 * muitas vezes e consumido em mute — captions carregam o conteudo.
 */
export function BackgroundTrack({ src, volume = 0.25 }: Props) {
  return <Audio src={staticFile(src)} volume={volume} />;
}
