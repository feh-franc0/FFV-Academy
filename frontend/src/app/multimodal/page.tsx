import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail29')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'IA multimodal em PT-BR: speech-to-text com Whisper, TTS moderno (ElevenLabs, Cartesia), Realtime APIs (GPT-4o voice), vision (Claude, GPT-4V, Gemini), OCR LLM-powered (Azure Doc Intelligence, LandingAI) e capstone de assistente de voz end-to-end com WebRTC e tool use.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/multimodal` },
  ...social({ titulo: `Voice, Vision & Multimodal — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/multimodal' }),
  title: 'Voice, Vision & Multimodal',
  description: DESCRICAO_CARTAO,
  keywords:
    'multimodal ai, whisper speech to text, elevenlabs tts, cartesia, gpt-4o realtime, claude vision, ocr llm, voice assistant, webrtc voice ai',
};

export default function MultimodalPage() {
  return <TrailBlogClient trail={trail} />;
}
