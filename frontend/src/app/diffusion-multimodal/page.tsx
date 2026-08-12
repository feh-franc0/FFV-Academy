import type { Metadata } from 'next';
import { TrailBlogClient } from '@/components/TrailBlogClient';
import { CURRICULUM } from '@/lib/curriculum';
import { BASE, social } from '@/lib/metadata-social';

const trail = CURRICULUM.find(t => t.id === 'trail-diffusion-multimodal')!;

/** Uma definição só: serve à meta description e ao cartão social. */
const DESCRICAO_CARTAO =
  'Stable Diffusion 3.5, Flux, Sora-like e geração 3D por dentro: score matching, VAE+U-Net, MMDiT/DiT architecture, ControlNet, LoRA de imagem, ComfyUI engineering, video generation (Sora/Runway/Kling/Veo), avaliação FID/CLIP, mesh do prompt.';

export const metadata: Metadata = {
  alternates: { canonical: `${BASE}/diffusion-multimodal` },
  ...social({ titulo: `Diffusion Models & Geração Multimodal — FFV Academy`, descricao: DESCRICAO_CARTAO, caminho: '/diffusion-multimodal' }),
  title: 'Diffusion Models & Geração Multimodal',
  description: DESCRICAO_CARTAO,
  keywords: 'stable diffusion 3.5, flux model, controlnet, lora imagem, comfyui, sora video, score matching diffusion, dit transformer, triposr 3d',
};

export default function Page() {
  return <TrailBlogClient trail={trail} />;
}
