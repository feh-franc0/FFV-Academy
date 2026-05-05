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

export const metadata = getModuleMetadata('geracao-video-ia');

const ACCENT = '#ef4444';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a principal diferença arquitetural entre modelos de geração de vídeo e de imagem?',
    options: [
      'Modelos de vídeo simplesmente repetem a geração de imagem N vezes em sequência',
      'Modelos de vídeo precisam modelar coerência espaço-temporal — os tokens de atenção se estendem tanto pelo espaço (pixels) quanto pelo tempo (frames), exigindo arquiteturas como 3D attention ou DiT com eixo temporal explícito para manter consistência entre frames',
      'A diferença é apenas de resolução — modelos de vídeo geram imagens menores mais rapidamente',
      'Modelos de vídeo usam GANs porque diffusion é lento demais para múltiplos frames',
    ],
    correct: 1,
    explanation:
      'Gerar vídeo coerente exige que cada frame seja consistente com os anteriores — personagens não mudam de aparência, objetos mantêm física realista. Para isso, os modelos estendem a atenção para o eixo temporal: 3D attention (espaço × tempo), ou separação em spatial attention + temporal attention (Temporal Self-Attention). Sora usa "spacetime patches" — trata vídeo como sequência de patches 4D (x, y, z_frame, t).',
  },
  {
    question: 'O que é o modelo Sora da OpenAI e qual sua contribuição arquitetural?',
    options: [
      'Sora é um modelo que concatena imagens existentes para criar animações',
      'Sora usa um Video DiT (Diffusion Transformer) que opera em spacetime patches — compressa vídeos em patches 4D e usa um transformer puro para denoising, permitindo geração de vídeos de duração variável com alta coerência temporal e física',
      'Sora é uma API para converter texto em slides de apresentação animados',
      'Sora usa apenas image diffusion com optical flow para criar a sensação de movimento',
    ],
    correct: 1,
    explanation:
      'Sora (OpenAI, 2024) introduziu Video DiT com spacetime patches: divide vídeos em patches 4D (como ViT divide imagens em patches 2D), aplica um transformer puro para denoising, e usa conditioning de texto via cross-attention. Habilita: durações variáveis, aspectos variáveis (16:9, 9:16, 1:1), coerência espaço-temporal longa (~1 min), e física emergente (como objetos caem, agua flui). Não é open source.',
  },
  {
    question: 'Quais são as principais limitações dos modelos de geração de vídeo em 2026?',
    options: [
      'Modelos de vídeo em 2026 são indistinguíveis de vídeos reais em todos os cenários',
      'Limitações persistem: física inconsistente em interações complexas, personagens mudam de aparência em vídeos longos, mãos e faces degradam em closeups, texto dentro de vídeo ilegível, duração máxima limitada (<60s na maioria), e custo de geração muito alto ($0.5-5 por segundo de vídeo)',
      'A única limitação é resolução — todos os modelos geram em até 720p no máximo',
      'Modelos de vídeo só funcionam com texto em inglês como prompt',
    ],
    correct: 1,
    explanation:
      'Em 2026, limitações reais: (1) Física: objetos podem flutuar ou atravessar superfícies; (2) Consistência de personagem: em vídeos >5s, faces e roupas derivam; (3) Mãos: ainda problemáticas em close; (4) Texto: letras em placas ou telas costumam ser illegíveis; (5) Duração: maioria dos modelos gera 5-10s de alta qualidade; (6) Custo: $0.50-$5.00 por segundo dependendo da qualidade; (7) Latência: 30s-5min por geração.',
  },
  {
    question: 'Qual a diferença entre text-to-video, image-to-video e video-to-video?',
    options: [
      'São termos equivalentes — todos produzem o mesmo tipo de output',
      'Text-to-video: gera vídeo inteiramente a partir de prompt textual. Image-to-video: usa uma imagem como primeiro frame e anima ela (mais coerente). Video-to-video: transforma um vídeo existente (change style, motion transfer) — mais controlável pois parte de movimento real',
      'A diferença é apenas de resolução de output — não muda o processo de geração',
      'Image-to-video e video-to-video são impossíveis com diffusion models',
    ],
    correct: 1,
    explanation:
      'Cada modalidade tem trade-offs: T2V oferece máxima criatividade mas física e coerência podem falhar. I2V garante que o primeiro frame corresponde exatamente à imagem — mais controlável para usar uma referência visual. V2V transforma vídeo existente preservando o movimento temporal — ideal para mudar estilo artístico de filmagens reais. Runway, Kling e Veo 2 suportam todas as três modalidades em 2026.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="geracao-video-ia"
      title="Geração de Vídeo com IA: Sora, Veo, Kling e o estado da arte"
      icon="🎬"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="geracao-imagens-ia"
      nextTitle="Geração de Imagens com IA: Diffusion, SDXL, Flux e APIs"
      relatedSlugs={['geracao-imagens-ia', 'transformers', 'multimodal-mental-model']}
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
        Geração de vídeo por IA saiu de clips de 1-2s em 2023 para vídeos de 60s com física emergente em
        2026. Sora, Veo 2, Kling e Runway redefiniu o que é possível — mas as limitações ainda são
        significativas. Entender as arquiteturas, o que funciona bem e os trade-offs de cada plataforma
        é essencial para tomar decisões técnicas realistas.
      </p>

      <Section title="Evolução da geração de vídeo" accent={ACCENT}>
        <LayerStack
          title="Linha do tempo: text-to-video"
          accent={ACCENT}
          separatorLabel="evolução de capacidade"
          layers={[
            { label: '2022-2023: Image-to-Video', content: 'Animação de imagens fixas, 2-4s, 256px, pouca coerência temporal', tone: 'default' },
            { label: '2023: Text-to-Video v1', content: 'ModelScope, AnimateDiff — 4-8s, 512px, movimento limitado', tone: 'default' },
            { label: 'Fev/2024: Sora', content: 'OpenAI demonstra 60s, 1080p, física emergente, spacetime patches DiT', note: 'marco histórico', tone: 'writable' },
            { label: '2024: Runway Gen-3, Kling', content: 'APIs comerciais de alta qualidade, 10-30s, I2V e T2V', tone: 'writable' },
            { label: '2025: Veo 2, Sora acesso público', content: 'Google Veo 2 para YouTube, física melhorada, personagens mais coerentes', tone: 'writable' },
            { label: '2026: Estado atual', content: 'Veo 3 com áudio, Kling 2.0, Sora via API — coerência até 60s, limitações persistem', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Arquiteturas: Video DiT e 3D Attention" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O avanço central dos modelos modernos é tratar vídeo como uma sequência de patches 4D (x, y, frame,
          temporal) em vez de frames independentes, permitindo que a atenção opere espaço-temporalmente.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Abordagem', 'Como funciona', 'Modelos', 'Trade-off']}
          rows={[
            ['U-Net 3D', 'Convoluções 3D + inflação temporal', 'AnimateDiff, SVD', 'Eficiente, coerência limitada em vídeos longos'],
            ['Temporal Attention', 'Spatial attention + temporal attention separados', 'ModelScope, Zeroscope', 'Balanceado — modularidade'],
            ['Video DiT (spacetime patches)', 'Transformer puro com patches 4D (x,y,z,t)', 'Sora, Veo, Mochi', 'Melhor qualidade, muito mais compute'],
            ['Flow Matching 3D', 'Rectified flow com trajetórias retas no espaço 4D', 'Wan 2.1, CogVideoX', 'Mais rápido convergência, open source'],
          ]}
        />
        <CodeBlock lang="python">{`# Conceito: como vídeo é tokenizado para Video DiT (Sora-like)
import torch

def tokenize_video_for_vdit(
    video: torch.Tensor,   # shape: (B, T, C, H, W) — batch, frames, channels, height, width
    patch_size: int = 2,   # tamanho do patch espacial
    temporal_patch: int = 2,  # tamanho do patch temporal
) -> torch.Tensor:
    """
    Divide vídeo em spacetime patches para input do Video DiT.
    Similar ao que Sora faz internamente.
    """
    B, T, C, H, W = video.shape

    # Dividir em patches espaço-temporais
    # (B, T//tp, tp, C, H//ps, ps, W//ps, ps)
    tp, ps = temporal_patch, patch_size
    video = video.reshape(B, T//tp, tp, C, H//ps, ps, W//ps, ps)

    # Reorganizar para (B, N_patches, patch_dim)
    # onde N_patches = (T//tp) × (H//ps) × (W//ps)
    video = video.permute(0, 1, 4, 6, 2, 3, 5, 7)
    B, nt, nh, nw, tp_, C_, ps_h, ps_w = video.shape
    n_patches = nt * nh * nw
    patch_dim = tp_ * C_ * ps_h * ps_w

    tokens = video.reshape(B, n_patches, patch_dim)
    return tokens  # → input para transformer DiT`}</CodeBlock>
      </Section>

      <Section title="APIs e plataformas em 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Plataforma', 'Modelo', 'Duração max', 'Resolução', 'Preço (aprox)', 'API?']}
          rows={[
            ['Sora (OpenAI)', 'Sora', '60s', '1080p', '$0.10-0.20/s', 'Sim (beta)'],
            ['Veo 3 (Google)', 'Veo 3 + áudio', '60s', '4K', 'Variável', 'Vertex AI'],
            ['Kling (Kuaishou)', 'Kling 2.0', '30s', '1080p', '$0.02-0.05/s', 'Sim'],
            ['Runway Gen-3', 'Gen-3 Alpha', '10s', '1080p', '$0.05/s', 'Sim'],
            ['Wan 2.1', 'Wan 2.1 (OS)', '20s', '1080p', 'Self-hosted', 'Open weights'],
            ['CogVideoX', 'CogVideoX-5B', '10s', '720p', 'Self-hosted', 'Open weights'],
          ]}
        />
        <CodeBlock lang="python">{`# Kling via API (fal.ai)
import fal_client
import time

def generate_video_kling(
    prompt: str,
    duration: int = 5,   # 5 ou 10 segundos
    aspect_ratio: str = "16:9",
) -> str:
    """Gera vídeo com Kling via fal.ai — retorna URL do vídeo."""
    result = fal_client.subscribe(
        "fal-ai/kling-video/v2/master/text-to-video",
        arguments={
            "prompt": prompt,
            "negative_prompt": "low quality, blurry, artifacts, distorted",
            "duration": str(duration),
            "aspect_ratio": aspect_ratio,
        },
        with_logs=True,
    )
    return result["video"]["url"]

def generate_video_from_image_kling(
    prompt: str,
    image_url: str,
    duration: int = 5,
) -> str:
    """Image-to-video: anima uma imagem existente."""
    result = fal_client.subscribe(
        "fal-ai/kling-video/v2/master/image-to-video",
        arguments={
            "prompt": prompt,
            "image_url": image_url,
            "duration": str(duration),
        },
    )
    return result["video"]["url"]

# Uso
video_url = generate_video_kling(
    "astronaut floating in space, slowly rotating, Earth visible in background, photorealistic",
    duration=5,
)
print(f"Vídeo gerado: {video_url}")`}</CodeBlock>

        <CodeBlock lang="python">{`# CogVideoX open source (self-hosted)
# pip install diffusers accelerate transformers
from diffusers import CogVideoXPipeline, CogVideoXDPMScheduler
import torch

pipe = CogVideoXPipeline.from_pretrained(
    "THUDM/CogVideoX-5b",
    torch_dtype=torch.bfloat16,
).to("cuda")

pipe.scheduler = CogVideoXDPMScheduler.from_config(pipe.scheduler.config)
pipe.enable_sequential_cpu_offload()
pipe.vae.enable_slicing()

video_frames = pipe(
    prompt="Uma gota de chuva cai em câmera lenta em uma superfície de água, criando ondas simétricas, macro fotografia, alta definição",
    num_videos_per_prompt=1,
    num_inference_steps=50,
    num_frames=49,    # ~6s a 8fps
    guidance_scale=6,
    generator=torch.Generator("cuda").manual_seed(42),
).frames[0]

# Exportar como MP4
from diffusers.utils import export_to_video
export_to_video(video_frames, "output.mp4", fps=8)`}</CodeBlock>
      </Section>

      <Section title="Limitações reais e como mitigar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Limitação', 'Manifestação', 'Mitigação prática']}
          rows={[
            ['Inconsistência de personagem', 'Rosto ou roupa muda entre frames', 'I2V com imagem de referência; vídeos curtos (<5s)'],
            ['Física irrealista', 'Objetos flutuam, líquidos se comportam errado', 'Evitar cenas com física complexa; checar manualmente'],
            ['Mãos e dedos', 'Número errado de dedos, formas estranhas', 'Evitar closeups de mãos; usar negative prompts'],
            ['Texto ilegível', 'Letras em placas são gibberish', 'Adicionar texto por edição de vídeo pós-geração'],
            ['Duração limitada', 'Degradação em vídeos >10-15s', 'Shot-by-shot: gerar clips de 5s e editar'],
            ['Transições bruscas', 'Jump cuts em long videos', 'Gerar vídeos curtos e usar I2V para continuidade'],
          ]}
        />
        <DecisionBox
          scenario="Gerar trailers de produto curtos (5-10s) para e-commerce"
          winner="Kling 2.0 via fal.ai (T2V ou I2V)"
          winnerColor={ACCENT}
          why="Kling tem melhor qualidade para produtos físicos e movimento natural. fal.ai oferece API simples com latência razoável (~30-60s). Para I2V usando foto do produto, Kling mantém o produto coerente melhor que concorrentes."
          alternatives={[
            { name: 'Runway Gen-3', note: 'Excelente qualidade artística mas mais caro e limitado a 10s' },
            { name: 'Wan 2.1 self-hosted', note: 'Open source, sem custo por geração — requer GPU A100 ou superior' },
            { name: 'Sora', note: 'Melhor qualidade geral mas latência alta e custo elevado' },
          ]}
        />
        <QAItem
          q="Como integrar geração de vídeo em um pipeline de produção de conteúdo?"
          a={<>Pipeline típico: (1) Roteiro → LLM quebra em shot descriptions; (2) Para cada shot: gera prompt de vídeo otimizado (LLM) → gera clip de 5-10s (API de vídeo); (3) Voiceover: TTS (ElevenLabs, Google TTS) sincronizado com cada clip; (4) Edição: FFmpeg ou Remotion para concatenar clips + adicionar audio + texto; (5) QA automático: VLM analisa cada clip para artefatos graves. Custo típico por minuto de conteúdo: $5-$20 em 2026.</>}
        />
        <QAItem
          q="Vídeo gerado por IA tem problemas de direitos autorais?"
          a={<>Área em evolução legal. Orientações práticas em 2026: (1) Evite pedir "no estilo de [artista vivo]" — risco de infração; (2) Para conteúdo comercial, use plataformas com termos claros de IP (Kling, Runway têm termos que cedem IP ao usuário); (3) Sora/Veo têm restrições sobre conteúdo de pessoas reais; (4) Vídeo gerado de imagens com pessoas pode violar LGPD/GDPR (deepfake territory); (5) Consulte jurídico para uso comercial em campanhas.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Video DiT com spacetime patches é a arquitetura dominante (Sora, Veo).
        Coerência temporal exige atenção espaço-temporal — não é só image diffusion repetido. APIs
        recomendadas: Kling (preço/qualidade), Runway (artístico), CogVideoX/Wan para self-hosted.
        Limitações persistem em 2026: física inconsistente, personagens que derivam, mãos problemáticas.
        Estratégia de produção: clips curtos de 5-10s + edição — não tente gerar 60s de uma vez.
      </Callout>
    </div>
  );
}
