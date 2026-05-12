import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';

const trail = CURRICULUM.find(t => t.id === 'trail-diffusion-multimodal')!;

export const metadata: Metadata = {
  title: 'Diffusion Models & Geração Multimodal — FFV Academy',
  description:
    'Stable Diffusion 3.5, Flux, Sora-like e geração 3D por dentro: score matching, VAE+U-Net, MMDiT/DiT architecture, ControlNet, LoRA de imagem, ComfyUI engineering, video generation (Sora/Runway/Kling/Veo), avaliação FID/CLIP, mesh do prompt.',
  keywords: 'stable diffusion 3.5, flux model, controlnet, lora imagem, comfyui, sora video, score matching diffusion, dit transformer, triposr 3d',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
