import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, StackFlow, NodeGraph, DecisionBox, AnnotatedFormula, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('vae-unet-internals');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o Stable Diffusion roda diffusion no espaço latente do VAE em vez de pixels diretos?',
    options: [
      'Porque o VAE garante geração de imagens fotorrealistas mesmo sem U-Net',
      'Porque rodar diffusion em 512×512×3 = 786k dimensões é proibitivo em compute; o VAE comprime para 64×64×4 = 16k, reduzindo ~50× o custo de FLOPS por passo (Rombach et al. 2022)',
      'Porque o VAE adiciona ruído correlacionado, que treina melhor o modelo',
      'Porque pixels não admitem retropropagação em diffusion',
      'Por compatibilidade com PyTorch — VAE produz tensores que U-Net aceita',
    ],
    correct: 1,
    explanation:
      'Rombach et al. 2022 (Latent Diffusion Models, CVPR) mostraram que ~98% do detalhe perceptual de uma imagem pode ser preservado num latente 8× downsampled (512→64 em cada dimensão). Como diffusion é dominado pelo custo do U-Net por passo, comprimir antes de rodar o loop economiza ~50× FLOPS. O VAE faz o "trabalho perceptual"; o U-Net faz o "trabalho semântico" no latente.',
  },
  {
    question: 'Qual o papel da cross-attention dentro do U-Net do Stable Diffusion?',
    options: [
      'Liga tokens do prompt (chaves/valores) aos pixels do latente (queries), permitindo que cada região da imagem atenda à porção relevante do texto',
      'Comprime imagens antes do encoding — substitui o VAE',
      'Reduz o consumo de VRAM ao trocar self-attention por full-attention',
      'Faz a normalização entre canais — substitui GroupNorm',
      'Conecta camadas do encoder com o decoder via skip connections',
    ],
    correct: 0,
    explanation:
      'Cross-attention é onde o prompt entra no U-Net. Queries vêm do feature map do latente; keys/values vêm do embedding de texto (CLIP/T5). Para cada posição espacial do latente, calcula-se atenção sobre os tokens do prompt — assim "céu" e "azul" "iluminam" pixels específicos. Skip connections (com concatenação) ainda existem e são a marca do U-Net, mas elas ligam encoder→decoder, não texto→imagem.',
  },
  {
    question: 'Qual a diferença entre o text encoder do SD 1.5 e do SDXL?',
    options: [
      'SD 1.5 usa T5-XXL; SDXL usa CLIP-ViT-L apenas',
      'SD 1.5 usa CLIP-ViT-L/14 (768 dim); SDXL combina CLIP-ViT-L + OpenCLIP-ViT-bigG (concatenados para 2048 dim), permitindo melhor compreensão de prompt',
      'SDXL não usa text encoder — gera só a partir de imagem',
      'SD 1.5 e SDXL usam o mesmo encoder, só mudaram a U-Net',
      'SDXL usa GPT-2 como text encoder',
    ],
    correct: 1,
    explanation:
      'SD 1.5 = OpenAI CLIP-ViT-L/14 (768 dim). SDXL = CLIP-ViT-L/14 + OpenCLIP-ViT-bigG/14, concatenados para 2048 dim e fornecidos via cross-attention, mais um pooled embedding adicional para conditioning global. Já SD3 e Imagen usam T5-XXL para entender prompts longos e detalhados. Flux usa T5-XXL + CLIP-L.',
  },
  {
    question: 'Qual a função do timestep embedding no U-Net?',
    options: [
      'Informa ao U-Net em que nível de ruído está o latente atual, modulando GroupNorm via FiLM-like scale/shift (Perez et al. 2018)',
      'Indica o tempo de cada batch durante o treino para sincronizar GPUs',
      'É um vetor aleatório usado como dropout',
      'Substitui o cross-attention quando o prompt é vazio',
      'É a coordenada temporal de cada frame em geração de vídeo',
    ],
    correct: 0,
    explanation:
      'O U-Net precisa saber em que timestep está para decidir quanto ruído remover. O timestep t é convertido em um sinusoidal embedding (à la Transformer), passa por um MLP e é injetado em cada bloco residual como scale/shift sobre GroupNorm (estilo FiLM). Sem isso, o U-Net não saberia distinguir t=999 (quase ruído puro) de t=10 (quase imagem limpa).',
  },
  {
    question: 'Por que o U-Net foi escolhido como backbone original e não um ResNet plano?',
    options: [
      'Por exigência computacional do TPU',
      'Porque o U-Net (Ronneberger 2015, originalmente para segmentação biomédica) tem encoder-decoder simétrico com skip connections, permitindo combinar features de baixa frequência (decisões semânticas) com alta frequência (textura/detalhe) — essencial para denoising em múltiplas escalas',
      'Porque ResNet não suporta cross-attention',
      'Porque U-Net é menor que ResNet',
      'Por motivos históricos apenas — hoje sabidamente inferior',
    ],
    correct: 1,
    explanation:
      'O U-Net (Ronneberger, Fischer, Brox 2015 — MICCAI) tem caminho contrativo (downsample) e expansivo (upsample) com skip connections concatenativas em cada nível. Para denoising, isso é ideal: as decisões "essa região é céu" acontecem nos níveis baixos (resolução pequena, contexto grande); a textura fina é preservada via skip do nível alto. Diffusion herdou isso de Ho et al. 2020. O sucessor é DiT (Peebles & Xie 2023), tema do próximo módulo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vae-unet-internals"
      title="VAE + U-Net: arquitetura por trás do Stable Diffusion"
      icon="🏗️"
      xp={70}
      readTime={14}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="stable-diffusion-3-flux"
      nextTitle="Stable Diffusion 3.5 e Flux: MMDiT e DiT por dentro"
      quiz={quiz}
    >
      <Section title="Os três blocos que formam o Stable Diffusion" accent={accent}>
        <p>
          No módulo anterior você viu a matemática do diffusion: forward gaussian, reverse, score matching, DDIM, SDE/ODE. Mas
          essa matemática não roda em pixels diretos — seria caro demais. O Stable Diffusion (Rombach et al. 2022, CVPR — Latent
          Diffusion Models) materializa a teoria em três módulos distintos que trabalham em conjunto:
        </p>
        <NodeGraph
          accent={accent}
          title="Anatomia do Stable Diffusion"
          legend="Cada bloco tem peso próprio, é treinado separadamente, e pode ser substituído de forma independente"
          columns={[
            {
              label: 'Compressão perceptual',
              nodes: [
                { icon: '🗜️', label: 'VAE Encoder', sub: 'pixel 512×512×3 → latente 64×64×4', tone: 'emphasis' },
                { icon: '🎨', label: 'VAE Decoder', sub: 'latente 64×64×4 → pixel 512×512×3', tone: 'emphasis' },
              ],
            },
            {
              label: 'Denoising no latente',
              nodes: [
                { icon: '🧠', label: 'U-Net', sub: 'ε_θ(z_t, t, c) — remove ruído', tone: 'emphasis' },
                { icon: '⏱️', label: 'Timestep embed', sub: 'sinusoidal + MLP' },
              ],
            },
            {
              label: 'Condicionamento textual',
              nodes: [
                { icon: '📝', label: 'CLIP / T5 encoder', sub: 'prompt → embedding sequence', tone: 'emphasis' },
                { icon: '🎯', label: 'Cross-attention', sub: 'texto → spatial features' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Por que rodar diffusion no latente é a sacada toda" accent={accent}>
        <p>
          Imagine treinar e amostrar DDPM diretamente em 512×512×3 = 786.432 dimensões. Cada passo do U-Net processa um tensor
          dessa magnitude, e você precisa de ~20-50 passos. Com batch size razoável e VRAM finita, é inviável fora de cluster.
        </p>
        <p>
          A observação central de Rombach et al.: <strong>a redundância perceptual nos pixels é altíssima</strong>. Você pode
          comprimir 8× em cada dimensão espacial (preservando ~98% da fidelidade perceptual) com um simples autoencoder bem
          treinado. O <em>latente</em> resultante tem 64×64×4 = 16.384 dimensões — 48× menor.
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Métrica', 'Pixel-space diffusion (GLIDE, Imagen)', 'Latent diffusion (Stable Diffusion)']}
          rows={[
            ['Dimensão por passo', '512×512×3 = 786k', '64×64×4 = 16k'],
            ['VRAM em inferência (fp16)', '~16-24 GB para 1024px', '~4-8 GB para 1024px (SDXL)'],
            ['Passos típicos para FID competitivo', '50-100', '20-50'],
            ['Treino em consumer GPU', '❌ Inviável', '✅ Possível (1× 3090)'],
            ['Custo total inferência (1 imagem)', '~10× LDM', '1× (baseline)'],
            ['Qualidade visual no benchmark', 'Topo de FID em 2022', 'Topo de FID em 2022, e 50× mais barato'],
          ]}
        />
        <Callout tone="success" icon="💡">
          A democratização da geração de imagem (rodar em RTX 3060, Mac M-series, até em celular Snapdragon) é consequência
          direta dessa escolha arquitetural. O VAE não é apenas otimização — é o que permitiu Stable Diffusion existir como
          open weights.
        </Callout>
      </Section>

      <Section title="VAE: compressão com bottleneck contínuo" accent={accent}>
        <p>
          O VAE (Kingma & Welling 2013) usado no SD não é o VAE original probabilístico — é uma variante mais próxima de um
          autoencoder regularizado. Ele tem dois objetivos no treino:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Reconstrução perceptual', v: 'L1 + LPIPS (Zhang et al. 2018) — penaliza diferença perceptual, não pixel-wise.' },
            { k: 'Regularização KL', v: 'Força o latente a ter distribuição próxima de gaussiana — facilita que diffusion opere nele.' },
            { k: 'Discriminador (adversarial)', v: 'Um PatchGAN ajuda a evitar reconstrução borrada — herança de Esser et al. 2021 (VQGAN).' },
          ]}
        />
        <p>
          O resultado é um autoencoder convolucional com encoder E e decoder D tal que:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Loop completo do Stable Diffusion"
          formula="z = E(x) ;   z_T → loop de denoising → z_0 ;   x̂ = D(z_0)"
          parts={[
            { text: 'E', annotation: 'VAE encoder (treinado e congelado)', highlight: true },
            { text: 'loop', annotation: 'DDIM/DPM-Solver no latente', highlight: true },
            { text: 'D', annotation: 'VAE decoder' },
          ]}
        />
        <CodeBlock lang="python" filename="ldm_inference.py">{`# Inferência simplificada do Stable Diffusion
def generate(prompt, steps=30, cfg=7.5):
    # 1. Texto → embedding
    c = text_encoder(prompt)            # shape: [seq, dim]
    c_uncond = text_encoder("")         # para classifier-free guidance

    # 2. Inicia no latente (não no pixel!)
    z = torch.randn(1, 4, 64, 64)       # latente 64×64×4

    # 3. Loop de denoising no latente
    for t in scheduler.timesteps:       # 30 passos com DPM-Solver
        eps_cond   = unet(z, t, c)
        eps_uncond = unet(z, t, c_uncond)
        eps        = eps_uncond + cfg * (eps_cond - eps_uncond)
        z          = scheduler.step(eps, t, z)

    # 4. Decoder VAE devolve para pixel
    image = vae_decoder(z)              # shape: [1, 3, 512, 512]
    return image`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          O VAE é o ponto frequentemente esquecido: latentes diferentes (SD1.5 vs SDXL vs SD3 vs Flux) <strong>não são
          compatíveis</strong>. Trocar de VAE quebra o modelo. Existem "VAE substitutos" como o MSE-VAE da Stability (melhora
          coerência de faces) — eles funcionam porque foram fine-tuned com a mesma latent distribution.
        </Callout>
      </Section>

      <Section title="U-Net: o cérebro do denoising" accent={accent}>
        <p>
          A U-Net (Ronneberger, Fischer, Brox 2015 — MICCAI) tem um formato em "U" no fluxograma de dados: <strong>caminho
          contrativo</strong> (encoder) reduz resolução enquanto aumenta canais; <strong>caminho expansivo</strong> (decoder)
          faz o reverso; <strong>skip connections</strong> concatenam features simétricos para preservar detalhe espacial.
        </p>
        <StackFlow
          accent={accent}
          title="U-Net do SD 1.5 — blocos do encoder ao decoder"
          items={[
            { icon: '📥', label: 'Input', sub: '4×64×64', detail: 'Latente z_t + timestep t' },
            { icon: '⬇️', label: 'Down 1', sub: '320 ch · 64×64', detail: '2× ResBlocks; 1× CrossAttn', connector: 'AvgPool ×2' },
            { icon: '⬇️', label: 'Down 2', sub: '640 ch · 32×32', detail: '2× ResBlocks; 1× CrossAttn', connector: 'AvgPool ×2' },
            { icon: '⬇️', label: 'Down 3', sub: '1280 ch · 16×16', detail: '2× ResBlocks; 1× CrossAttn', connector: 'AvgPool ×2' },
            { icon: '⏸️', label: 'Mid', sub: '1280 ch · 8×8', detail: 'ResBlock + CrossAttn + ResBlock', connector: 'sem downsample' },
            { icon: '⬆️', label: 'Up 3', sub: '1280 ch · 16×16', detail: 'Concat com skip do Down 3; ResBlocks + CrossAttn', connector: 'Upsample ×2' },
            { icon: '⬆️', label: 'Up 2', sub: '640 ch · 32×32', detail: 'Concat com skip do Down 2', connector: 'Upsample ×2' },
            { icon: '⬆️', label: 'Up 1', sub: '320 ch · 64×64', detail: 'Concat com skip do Down 1', connector: 'Upsample ×2' },
            { icon: '📤', label: 'Output', sub: '4×64×64', detail: 'ε predito — mesmo shape do latente' },
          ]}
        />
        <Callout tone="info" icon="🔍">
          O SD 1.5 tem 859M params no U-Net. SDXL tem 2.6B. SD3 (8B) trocou U-Net por MMDiT. Flux.1 Dev (12B) usa DiT puro. A
          arquitetura U-Net cumpriu seu papel até ~2024, quando os transformers escalam melhor — tema do próximo módulo.
        </Callout>
      </Section>

      <Section title="ResBlock + Cross-Attention: o tijolo fundamental" accent={accent}>
        <p>
          Cada bloco do U-Net combina um <strong>ResBlock</strong> (com timestep injection) e um <strong>Spatial Transformer
          Block</strong> (que faz self-attention + cross-attention com o prompt). Em pseudocódigo:
        </p>
        <CodeBlock lang="python" filename="unet_block.py">{`class ResBlock(nn.Module):
    def __init__(self, ch_in, ch_out, time_dim):
        self.gn1   = GroupNorm(32, ch_in)
        self.conv1 = Conv2d(ch_in, ch_out, 3, padding=1)
        self.time  = Linear(time_dim, ch_out)      # FiLM-like
        self.gn2   = GroupNorm(32, ch_out)
        self.conv2 = Conv2d(ch_out, ch_out, 3, padding=1)
        self.skip  = Conv2d(ch_in, ch_out, 1) if ch_in != ch_out else nn.Identity()

    def forward(self, x, t_emb):
        h = self.conv1(F.silu(self.gn1(x)))
        h = h + self.time(F.silu(t_emb))[:, :, None, None]  # injeta t
        h = self.conv2(F.silu(self.gn2(h)))
        return h + self.skip(x)

class SpatialTransformer(nn.Module):
    def __init__(self, ch, n_heads, ctx_dim):
        self.norm = GroupNorm(32, ch)
        self.proj_in  = Conv2d(ch, ch, 1)
        self.attn_self  = MultiHeadAttention(ch, n_heads)            # tokens espaciais entre si
        self.attn_cross = MultiHeadAttention(ch, n_heads, ctx_dim)   # tokens espaciais ↔ texto
        self.ff   = FeedForward(ch)
        self.proj_out = Conv2d(ch, ch, 1)

    def forward(self, x, context):                # context = CLIP/T5 embedding
        B, C, H, W = x.shape
        h = self.proj_in(self.norm(x))
        h = h.reshape(B, C, H*W).transpose(1, 2)  # [B, HW, C] como tokens
        h = h + self.attn_self(h)                 # self-attn entre patches
        h = h + self.attn_cross(h, context)       # cross-attn com prompt
        h = h + self.ff(h)
        h = h.transpose(1, 2).reshape(B, C, H, W)
        return self.proj_out(h) + x`}</CodeBlock>
      </Section>

      <Section title="Cross-attention: como o prompt entra na imagem" accent={accent}>
        <p>
          É aqui que a mágica do prompt acontece. No bloco SpatialTransformer, cada posição (x, y) do feature map vira uma
          <em> query</em>; cada token do prompt vira <em>key</em> e <em>value</em>. A atenção calcula:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Cross-attention texto → imagem"
          formula="A(Q_img, K_text, V_text) = softmax( Q_img · K_text^T / √d ) · V_text"
          parts={[
            { text: 'Q_img', annotation: 'spatial features', highlight: true },
            { text: 'K_text', annotation: 'embedding tokens', highlight: true },
            { text: 'V_text', annotation: 'embedding values' },
          ]}
        />
        <p>
          Resultado: cada pixel "lê" do prompt o que é relevante para ele. Se você gerar "a red car next to a blue house",
          internamente os pixels da região do carro vão atender ao token "red"/"car" com peso alto, e os pixels da casa vão
          atender a "blue"/"house". Isso é visualizável em <em>attention maps</em> e é a base de técnicas como Prompt-to-Prompt
          (Hertz et al. 2022) e Attention-Refocusing.
        </p>
      </Section>

      <Section title="Text encoder: CLIP, OpenCLIP e T5" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Text encoder(s)', 'Dim total', 'Vantagem']}
          rows={[
            ['SD 1.5', 'CLIP-ViT-L/14 (OpenAI)', '768', 'Padrão histórico'],
            ['SD 2.x', 'OpenCLIP-ViT-H/14', '1024', 'Treino aberto (LAION)'],
            ['SDXL', 'CLIP-L + OpenCLIP-bigG (concat)', '2048 + pooled', 'Melhor coerência semântica'],
            ['SD 3 / 3.5', 'CLIP-L + CLIP-G + T5-XXL', '~4096', 'Prompts longos e detalhados via T5'],
            ['Flux.1', 'CLIP-L + T5-XXL', '~2k + T5', 'T5 melhora seguimento e texto em imagens'],
            ['Imagen', 'T5-XXL puro', 'T5 4096', 'Saari et al. mostraram que T5 supera CLIP em alinhamento'],
          ]}
        />
        <Callout tone="info" icon="🧠">
          CLIP é treinado contrastivamente com imagens; entende conceitos visuais bem mas trunca em 77 tokens. T5 é treinado em
          texto puro com objetivo de span corruption — entende ordem, negação, contagem, relações espaciais melhor. SD3 e Flux
          combinam os dois: CLIP para "look and feel", T5 para fidelidade textual.
        </Callout>
      </Section>

      <Section title="Decisões arquiteturais que importam" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Você está escolhendo um modelo de base para fine-tune"
          winner="SDXL ou SD3.5 / Flux.1 Dev — não SD 1.5"
          why="SD 1.5 (2022) tem U-Net 859M, OpenAI CLIP-L só, e foi treinado em LAION 5B com filtros leves. SDXL e SD3+ têm capacidade muito maior, melhor entendimento de prompt, e licenças permissivas (SDXL: OpenRAIL; SD3.5: Stability Community; Flux.1 Dev: non-commercial)."
          alternatives={[
            { name: 'SD 1.5' }, { name: 'Ainda popular por LoRAs, mas qualidade base inferior; texto em imagens quase ilegível' }, { name: 'Treinar do zero' }, { name: 'Custo ~$1M+ em compute; só faz sentido para players com infraestrutura' }
          ]}
        />
      </Section>

      <Section title="Como diagnosticar quando vai mal" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Debug visual de saída ruim"
          steps={[
            { label: 'Imagem está borrada', desc: 'Provável: VAE decoder ruim ou número de steps baixo demais (<15). Tente trocar VAE ou aumentar steps.' },
            { label: 'Prompt ignorado', desc: 'CFG baixo demais (<5) ou text encoder mal alinhado. Aumente CFG ou troque para SD3/Flux com T5.' },
            { label: 'Cores saturadas / "plastic look', desc: 'CFG muito alto (>12). Reduza para 7-9 em SDXL; 3-4 em Flux.' },
            { label: 'Anatomia bizarra (mãos/dedos)', desc: 'Limitação da resolução latente; tente upscale + img2img ou ControlNet de pose.' },
            { label: 'Texto em imagem ilegível', desc: 'SD 1.5/SDXL não fazem texto bem. Use SD3.5 ou Flux (T5 ajuda muito).' },
          ]}
        />
      </Section>

      <Section title="Perguntas que sobram" accent={accent}>
        <QAItem
          q="Posso trocar o VAE do SDXL pelo do SD1.5?"
          a="Não. Os latent spaces são incompatíveis — escalas, canais e distribuição estatística diferentes. Para usar um VAE diferente você precisaria retreinar (ou ao menos fine-tunar) o U-Net no novo espaço latente."
        />
        <QAItem
          q="Por que algumas implementações usam `--vae-precision fp32` mesmo com U-Net em fp16?"
          a="O VAE decoder tem operações sensíveis numericamente (especialmente em SDXL) que produzem artefatos em fp16 — manchas verdes ou roxas em sombras. Rodar VAE em fp32 ou bf16 resolve, com custo mínimo de tempo (VAE é único, U-Net roda N vezes)."
        />
        <QAItem
          q="O timestep embedding usa a mesma sinusoidal do Transformer original?"
          a="Sim, com pequenas adaptações. Em DDPM: timestep_emb(t) = [sin(t / 10000^(2i/d)), cos(t / 10000^(2i/d))]. Passa por um MLP de 2 layers para chegar à dim do feature map e é injetado via FiLM-like scale/shift em cada ResBlock."
        />
        <QAItem
          q="Por que pular do U-Net direto pra DiT funciona?"
          a="Porque a U-Net já fazia 'patch tokens' implicitamente via convoluções — DiT (Peebles & Xie 2023) explicita: patchifica o latente, trata como sequência, usa pure transformer. Escala melhor: dobrar params do DiT melhora FID monotonicamente; U-Net satura. Próximo módulo cobre isso."
        />
      </Section>

      <Section title="Leituras essenciais" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Latent Diffusion', v: 'Rombach, Blattmann, Lorenz, Esser, Ommer 2022 — CVPR — "High-Resolution Image Synthesis with Latent Diffusion Models".' },
            { k: 'U-Net', v: 'Ronneberger, Fischer, Brox 2015 — MICCAI — "U-Net: Convolutional Networks for Biomedical Image Segmentation".' },
            { k: 'SDXL paper', v: 'Podell et al. 2023 — "SDXL: Improving Latent Diffusion Models for High-Resolution Image Synthesis".' },
            { k: 'VQGAN (raízes do VAE do SD)', v: 'Esser, Rombach, Ommer 2021 — CVPR — "Taming Transformers for High-Resolution Image Synthesis".' },
            { k: 'CLIP', v: 'Radford et al. 2021 — ICML — "Learning Transferable Visual Models From Natural Language Supervision".' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          Próximo: o que substituiu U-Net. MMDiT (SD3.5) e DiT puro (Flux). Por que transformers escalam melhor, por que SD3 usa
          rectified flow, e o que o paper de Peebles & Xie 2023 mostrou que mudou o jogo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
