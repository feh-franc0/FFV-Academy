import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail63')!;

export const metadata: Metadata = {
  title: 'Real-time Systems — FFV Academy',
  description:
    'Real-time moderno em PT-BR: WebSockets produção, SSE, WebRTC (voice/video/data), CRDTs (Yjs/Automerge) para colaboração, presence systems, LiveKit/mediasoup (SFU). Quando WS vs SSE vs polling.',
  keywords:
    'real time systems, websockets producao, server sent events sse, webrtc, crdt yjs automerge, presence system, livekit mediasoup sfu',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
