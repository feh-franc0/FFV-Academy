import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail29')!;

export const metadata: Metadata = {
  title: 'Voice, Vision & Multimodal — FFV Academy',
  description:
    'IA multimodal em PT-BR: speech-to-text com Whisper, TTS moderno (ElevenLabs, Cartesia), Realtime APIs (GPT-4o voice), vision (Claude, GPT-4V, Gemini), OCR LLM-powered (Azure Doc Intelligence, LandingAI) e capstone de assistente de voz end-to-end com WebRTC e tool use.',
  keywords:
    'multimodal ai, whisper speech to text, elevenlabs tts, cartesia, gpt-4o realtime, claude vision, ocr llm, voice assistant, webrtc voice ai',
};

export default function MultimodalPage() {
  return <TrailBlogClient trail={trail} />;
}
