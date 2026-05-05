import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('geracao-imagens-ia');

const ACCENT = '#e879f9';

const quiz: QuizQuestion[] = [
  {
    question: 'Como funciona o processo de difusão em diffusion models para geração de imagens?',
    options: [
      'O modelo aprende a desenhar imagens pixel por pixel da esquerda para a direita',
      'O forward process adiciona ruído gaussiano progressivamente à imagem até virar ruído puro. O modelo aprende o reverse process: dado ruído + prompt, denoisa passo a passo — cada passo remove um pouco de ruído guiado pelo texto até obter a imagem final',
      'O modelo cria imagens interpolando exemplos do dataset de treinamento',
      'O processo de difusão comprime o prompt em um vetor latente e expande para imagem',
    ],
    correct: 1,
    explanation:
      'Diffusion models (Ho et al. 2020 DDPM): forward process destrói a imagem com T passos de ruído gaussiano até ruído puro N(0,I). O modelo (U-Net ou Transformer) aprende o reverse process: estimar o ruído adicionado em cada passo. Na geração: começa de ruído puro, e o modelo remove ruído passo a passo, condicionado no texto via cross-attention. DDIM (Song et al.) acelerou para 20-50 passos (vs 1000 do DDPM original).',
  },
  {
    question: 'O que é ControlNet e qual problema resolve na geração de imagens?',
    options: [
      'ControlNet é um sistema de controle de acesso para APIs de geração de imagens',
      'ControlNet adiciona controle estrutural preciso à geração — você fornece um mapa de borda, pose de esqueleto, mapa de profundidade ou segmentação, e o modelo gera a imagem preservando exatamente essa estrutura. Resolve o problema de falta de controle posicional/estrutural nos modelos de difusão base',
      'ControlNet é uma técnica de quantização específica para modelos de geração de imagens',
      'ControlNet é um firewall de segurança para bloquear geração de imagens inapropriadas',
    ],
    correct: 1,
    explanation:
      'ControlNet (Zhang et al. 2023) congela os pesos do modelo de difusão base e adiciona camadas de controle que processam um "hint" estrutural (Canny edges, OpenPose esqueleto, mapa de profundidade, scribble). O hint é processado via encoder separado e injetado nas camadas do U-Net via soma zerada ("zero convolutions"). Resultado: você controla exatamente a composição, pose ou estrutura da imagem enquanto o modelo aplica o estilo artístico.',
  },
  {
    question: 'Qual a principal diferença arquitetural entre Stable Diffusion XL (SDXL) e Flux?',
    options: [
      'SDXL usa GAN (generative adversarial network); Flux usa diffusion puro',
      'SDXL usa U-Net como backbone de denoising. Flux (Black Forest Labs, 2024) usa um transformer puro (DiT — Diffusion Transformer) para o processo de denoising — permite escalar melhor, melhor coerência de prompt e qualidade superior especialmente em texto dentro de imagens',
      'SDXL gera 1024px; Flux só gera imagens de 512px por limitação arquitetural',
      'A diferença é apenas de resolução — ambos usam a mesma arquitetura U-Net',
    ],
    correct: 1,
    explanation:
      'SDXL usa U-Net + VAE, com dois encoders de texto (CLIP + OpenCLIP). Flux (2024) usa Flow Matching (variante de diffusion) com um Diffusion Transformer (DiT) — pesos compartilhados entre as condições de texto e imagem via "rectified flow". Flux.1 Dev e Schnell são open weights. Vantagens do Flux: melhor seguimento de prompt, texto dentro de imagens legível, composição mais complexa, escala com mais parâmetros.',
  },
  {
    question: 'Como a técnica CFG (Classifier-Free Guidance) influencia a geração?',
    options: [
      'CFG é uma técnica de compressão que reduz o tamanho do modelo de geração',
      'CFG escala a diferença entre as predições condicionada no prompt e não condicionada — valores altos (7-12) forçam maior aderência ao prompt mas reduzem diversidade e podem causar artefatos. CFG baixo (1-3) é mais criativo mas menos fiel ao prompt',
      'CFG controla apenas a resolução final da imagem gerada',
      'CFG substitui o encoder de texto quando o prompt é muito longo',
    ],
    correct: 1,
    explanation:
      'Classifier-Free Guidance (Ho & Salimans 2022): o modelo é treinado tanto com (prompt) quanto sem (null prompt). Na geração, a predição é: guided = uncond + CFG_scale × (cond - uncond). CFG_scale=1 é equivalente a sem guidance; CFG_scale=7 empurra a imagem forte na direção do prompt; CFG_scale=20 começa a saturar e criar artefatos. Valores típicos: 7-12 para SDXL, 3-5 para Flux (que usa different guidance internamente).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="geracao-imagens-ia"
      title="Geração de Imagens com IA: Diffusion, SDXL, Flux e APIs"
      icon="🎨"
      xp={85}
      readTime={17}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="vision-models-claude-gpt"
      nextTitle="Vision Models: Claude, GPT-4V e análise de imagens"
      relatedSlugs={['transformers', 'vision-models-claude-gpt', 'redes-neurais']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Diffusion models transformaram a geração de imagens de nicho acadêmico para capacidade de produto
        mainstream em 2022-2024. Entender como funcionam — do processo de difusão ao papel do VAE, CLIP,
        e ControlNet — é essencial para integrar geração de imagens em produtos reais e escolher entre
        SDXL, Flux e as principais APIs.
      </p>

      <Section title="Como funcionam os diffusion models" accent={ACCENT}>
        <LayerStack
          title="Processo de difusão: forward e reverse"
          accent={ACCENT}
          separatorLabel="forward (treino) ←→ reverse (geração)"
          layers={[
            { label: 'Imagem original', content: 'x₀ — imagem nítida do dataset', tone: 'default' },
            { label: 'Forward process', content: 'Adiciona ruído gaussiano em T passos progressivos até x_T ~ N(0,I)', note: 'treino apenas', tone: 'default' },
            { label: 'Ruído puro', content: 'x_T — ruído gaussiano sem estrutura', tone: 'writable' },
            { label: 'Reverse process (U-Net/DiT)', content: 'Modelo prevê o ruído adicionado em cada passo, condicionado no texto via cross-attention', note: 'geração: T → 0', tone: 'writable' },
            { label: 'Imagem gerada', content: 'x₀ reconstruída guiada pelo prompt de texto', tone: 'success' },
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          Na prática, os modelos operam em espaço latente (LDM — Latent Diffusion Models): um VAE comprimi
          a imagem de 1024×1024 para um latente de 128×128, a difusão acontece no latente (muito mais
          eficiente), e o decoder do VAE expande de volta para a imagem final.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Função', 'Tecnologia']}
          rows={[
            ['VAE (encoder)', 'Comprimir imagem para espaço latente 8×', 'Convolucional + KL loss'],
            ['Text encoder', 'Converter prompt em embedding de texto', 'CLIP, T5, ou CLIP+OpenCLIP (SDXL)'],
            ['U-Net / DiT', 'Denoising backbone — remove ruído passo a passo', 'SDXL: U-Net; Flux: DiT'],
            ['Scheduler', 'Controla como ruído é removido em N passos', 'DDIM, DPM++, PNDM, Euler'],
            ['VAE (decoder)', 'Expandir latente para imagem pixel-space', 'Convolucional'],
          ]}
        />
      </Section>

      <Section title="SDXL vs Flux: escolhendo o backbone" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'Stable Diffusion XL (SDXL)', 'Flux.1 Dev/Schnell']}
          rows={[
            ['Arquitetura', 'U-Net + CLIP + OpenCLIP', 'DiT (Diffusion Transformer) + rectified flow'],
            ['Parâmetros', '~3.5B', '~12B (Dev), ~12B (Schnell)'],
            ['Resolução nativa', '1024×1024', '1024×1024 (qualquer AR)'],
            ['Texto em imagens', 'Fraco', 'Muito melhor — legível frequentemente'],
            ['Seguimento de prompt', 'Bom', 'Excelente — mais fiel a descrições complexas'],
            ['Velocidade (20 steps)', '~5s em RTX 4090', 'Dev: ~15s; Schnell: ~3s (4 steps)'],
            ['Licença', 'Open weights (CreativeML)', 'Flux Dev: non-commercial; Schnell: Apache 2.0'],
            ['Ecossistema', 'Enorme — LoRA, ControlNet, ComfyUI', 'Crescendo rápido — ControlNet em 2025'],
          ]}
        />
        <Callout tone="info">
          Para projetos comerciais em 2026: Flux.1 Schnell (Apache 2.0) para geração rápida e de alta
          qualidade. SDXL para máxima flexibilidade de customização (LoRA, ControlNet, inpainting) com
          ecossistema maduro. Para API sem gerenciar infraestrutura, Replicate e fal.ai servem ambos.
        </Callout>
      </Section>

      <Section title="APIs de geração: Replicate, fal.ai, Stability AI" accent={ACCENT}>
        <CodeBlock lang="python">{`# Replicate — multi-model, pay-per-second
import replicate

# SDXL via Replicate
output = replicate.run(
    "stability-ai/sdxl:latest",
    input={
        "prompt": "astronaut riding a horse on Mars, photorealistic, 8k, golden hour",
        "negative_prompt": "blurry, low quality, distorted",
        "width": 1024,
        "height": 1024,
        "num_inference_steps": 25,
        "guidance_scale": 7.5,
        "scheduler": "DPMSolverMultistep",
    }
)
# output é lista de URLs de imagem

# Flux.1 Dev via Replicate
flux_output = replicate.run(
    "black-forest-labs/flux-dev:latest",
    input={
        "prompt": "professional product photo of a minimalist coffee mug, white background, studio lighting",
        "num_inference_steps": 28,
        "guidance": 3.5,   # Flux usa guidance diferente de CFG clássico
        "output_format": "webp",
        "output_quality": 90,
    }
)`}</CodeBlock>

        <CodeBlock lang="python">{`# fal.ai — baixa latência, foco em real-time
import fal_client

# Flux Schnell — geração ultra-rápida (4 steps)
result = fal_client.subscribe(
    "fal-ai/flux/schnell",
    arguments={
        "prompt": "luxury watch product photo, macro lens, bokeh background",
        "image_size": "landscape_4_3",
        "num_inference_steps": 4,
        "num_images": 1,
        "enable_safety_checker": True,
    },
)
print(result["images"][0]["url"])  # URL da imagem gerada

# SDXL com LoRA customizado
result_lora = fal_client.subscribe(
    "fal-ai/sdxl",
    arguments={
        "prompt": "foto de produto [v1] estilo minimalista",
        "loras": [
            {
                "path": "https://storage.exemplo.com/meu-lora-produto.safetensors",
                "scale": 0.8,
            }
        ],
        "num_inference_steps": 30,
        "guidance_scale": 7.0,
    }
)`}</CodeBlock>

        <CodeBlock lang="python">{`# Stability AI — Stable Image Ultra / Core
import requests, base64

def generate_stable_image(prompt: str, aspect_ratio: str = "1:1") -> bytes:
    response = requests.post(
        "https://api.stability.ai/v2beta/stable-image/generate/ultra",
        headers={
            "authorization": f"Bearer {STABILITY_API_KEY}",
            "accept": "image/*",
        },
        files={"none": ""},
        data={
            "prompt": prompt,
            "negative_prompt": "blurry, low quality, ugly",
            "aspect_ratio": aspect_ratio,
            "output_format": "webp",
            "seed": 0,  # 0 = random
        },
    )
    response.raise_for_status()
    return response.content  # bytes da imagem`}</CodeBlock>
      </Section>

      <Section title="ControlNet e controle estrutural" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          ControlNet permite controlar a composição, pose e estrutura da imagem gerada — essencial para
          produtos onde a posição dos elementos importa (moda, arquitetura, storyboards).
        </p>
        <CodeBlock lang="python">{`# ControlNet via diffusers (local)
from diffusers import ControlNetModel, StableDiffusionXLControlNetPipeline
from diffusers.utils import load_image
import torch
import cv2
import numpy as np

# Carregar ControlNet Canny (bordas)
controlnet = ControlNetModel.from_pretrained(
    "diffusers/controlnet-canny-sdxl-1.0",
    torch_dtype=torch.float16,
)
pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    controlnet=controlnet,
    torch_dtype=torch.float16,
).to("cuda")

# Preparar imagem de controle (Canny edges)
def get_canny_edges(image_path: str) -> np.ndarray:
    img = np.array(load_image(image_path).convert("RGB"))
    edges = cv2.Canny(img, threshold1=100, threshold2=200)
    return np.stack([edges, edges, edges], axis=2)

control_image = get_canny_edges("produto_referencia.jpg")

# Gerar com controle estrutural
result = pipe(
    prompt="foto de produto, relógio de luxo, fundo branco, iluminação de estúdio profissional",
    negative_prompt="sombras duras, fundo colorido, baixa qualidade",
    image=control_image,
    controlnet_conditioning_scale=0.8,  # força do controle (0-1)
    num_inference_steps=30,
    guidance_scale=7.5,
).images[0]`}</CodeBlock>

        <DecisionBox
          scenario="Gerar imagens de produto para e-commerce com controle de composição"
          winner="Flux.1 Dev via fal.ai API + ControlNet para composição"
          winnerColor={ACCENT}
          why="Flux.1 Dev tem melhor qualidade de produto e seguimento de prompt. API fal.ai entrega em <3s. ControlNet garante que a composição do produto respeita a imagem de referência. Sem infraestrutura para gerenciar."
          alternatives={[
            { name: 'SDXL + LoRA customizado', note: 'Melhor para manter estilo de marca consistente com fine-tuning específico' },
            { name: 'DALL-E 3 / Imagen API', note: 'Mais simples mas menor controle sobre estilo e sem ControlNet nativo' },
            { name: 'Rodar local com ComfyUI', note: 'Controle total mas requer GPU servidor e manutenção de infra' },
          ]}
        />
        <QAItem
          q="Como fazer prompt engineering para modelos de imagem?"
          a={<>Técnicas: (1) Seja específico sobre estilo: "photorealistic", "oil painting", "vector art", "watercolor"; (2) Mencione qualidade: "8k", "highly detailed", "professional photography", "award winning"; (3) Iluminação importa: "golden hour", "studio lighting", "soft diffused light"; (4) Negative prompts são poderosos: liste o que você não quer ("blurry, distorted, low quality, ugly, watermark"); (5) Iteração: gere 4 variações (seed diferente), escolha a melhor e refine o prompt.</>}
        />
        <QAItem
          q="Como integrar geração de imagens com moderação de conteúdo?"
          a={<>Camadas de moderação: (1) Input: filtrar prompts com lista de termos proibidos + classifier LLM para conteúdo sensível; (2) Output: passar imagem gerada por modelo de safe content (SafeClip, ou APIs da Stability/OpenAI que retornam flag de conteúdo); (3) Infraestrutura: habilitar safety_checker dos modelos diffusers; (4) Rate limiting por usuário para evitar abuse; (5) Logging de todos os prompts para auditoria retroativa.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Diffusion models: forward process adiciona ruído, reverse process
        remove guiado pelo prompt via cross-attention. VAE comprime imagem para latente. Flux.1 (DiT)
        supera SDXL (U-Net) em qualidade e seguimento de prompt. Para produção: fal.ai ou Replicate
        para não gerenciar GPU. ControlNet para controle estrutural preciso. CFG scale 7-12 para
        SDXL. Negative prompts são essenciais para qualidade consistente.
      </Callout>
    </div>
  );
}
