import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-browser-internals')!;

export const metadata: Metadata = {
  title: 'Browser & Web Internals Profundo — FFV Academy',
  description:
    'O que separa front-end pleno de sênior: V8 JIT (Ignition/TurboFan), GC Orinoco, event loop com microtasks, rendering pipeline, Web Workers + SharedArrayBuffer, Service Workers offline-first, WebAssembly, WebGPU, WebRTC, View Transitions API, OPFS.',
  keywords: 'v8 jit turbofan, event loop microtask, rendering pipeline browser, web workers, webassembly, webgpu, webrtc, view transitions',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
