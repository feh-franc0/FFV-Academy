import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, StackFlow, DecisionBox, AnnotatedFormula, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('controlnet-condicionamento');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "zero convolution" no ControlNet e por que é central para o método?',
    options: [
      'É uma conv 1×1 com bias zerado para reduzir overhead',
      'É uma camada de convolução com pesos e bias inicializados em zero, que conecta a cópia treinável do encoder ao U-Net congelado — garante que no início do treino o ControlNet seja idempotente (não altera o modelo base), evitando catastrophic forgetting (Zhang & Agrawala 2023)',
      'É uma técnica de pruning durante o treino',
      'É a primeira camada de qualquer ControlNet, normaliza o hint',
      'É só um nome para residual connection',
    ],
    correct: 1,
    explanation:
      'Zhang & Agrawala 2023 (ICCV best paper, "Adding Conditional Control to Text-to-Image Diffusion Models") propuseram zero-conv: 1×1 conv com pesos e biases inicializados em zero. Como a saída inicial é zero, somar com o U-Net congelado dá o mesmo resultado do U-Net puro. Durante treino, o gradiente flui pela cópia treinável (warm start) sem destruir o conhecimento do modelo base. Princípio similar ao adaLN-Zero do DiT.',
  },
  {
    question: 'Qual a diferença entre ControlNet "Canny edges" e "OpenPose"?',
    options: [
      'Canny gera imagens em preto e branco; OpenPose em cor',
      'Canny condiciona a geração em um mapa de bordas extraído com o algoritmo Canny (silhuetas, contornos); OpenPose condiciona em um esqueleto de poses humanas (keypoints) extraído com o detector OpenPose — útil para gerar pessoas em poses específicas',
      'São o mesmo, mudou só o nome',
      'OpenPose roda só em vídeo',
      'Canny é mais novo e melhor que OpenPose',
    ],
    correct: 1,
    explanation:
      'O paper original mostrou ControlNet com 8 condicionamentos: Canny (bordas), HED soft edges, depth (MiDaS), normal map, segmentation map, M-LSD (linhas retas), scribble, e OpenPose (keypoints de pessoa). Cada um é um ControlNet treinado separadamente. Hoje a comunidade tem dezenas: QR code, tile (upscale), reference_only, IP-Adapter (style), etc.',
  },
  {
    question: 'O que é IP-Adapter e como difere do ControlNet "estilo"?',
    options: [
      'IP-Adapter (Ye et al. 2023) é um adaptador que injeta features de uma imagem de referência via cross-attention paralela, permitindo "style transfer" / "subject reference" leve sem treinar um ControlNet específico — usa CLIP/SigLIP vision encoder para condicionar',
      'IP-Adapter é só outro nome para ControlNet Reference',
      'IP-Adapter substitui o text encoder completamente',
      'IP-Adapter é um modelo de upscale',
      'IP-Adapter é um VAE alternativo',
    ],
    correct: 0,
    explanation:
      'Ye, Yang, Zhang, Liu, Wang 2023 ("IP-Adapter: Text Compatible Image Prompt Adapter for Text-to-Image Diffusion Models") propuseram um adaptador leve (~22M params para SD1.5, ~50-100M para SDXL) que pega uma imagem de referência via vision encoder (CLIP) e injeta as features via cross-attention adicional em paralelo ao cross-attention de texto. Mais leve que ControlNet, ideal para style/character reference.',
  },
  {
    question: 'Por que copiar o encoder do U-Net é a estratégia do ControlNet, em vez de treinar do zero?',
    options: [
      'Para reduzir uso de VRAM',
      'Porque o encoder do U-Net já aprendeu representações fortes do espaço latente — copiar e fine-tunar com hint adicional é mais sample-efficient do que treinar uma rede paralela do zero; explora o conhecimento prévio (transfer learning estrutural)',
      'Por exigência da licença OpenAI',
      'Porque é mais rápido em runtime',
      'Porque o decoder original não permite condicionamento',
    ],
    correct: 1,
    explanation:
      'A "trainable copy" do encoder começa com os mesmos pesos do U-Net original (transferência). Isso dá um warm start importante: o feature extractor já é bom; o que muda é incorporar o hint. Treinar do zero exigiria muito mais dados e tempo, com risco de overfit ao hint específico.',
  },
  {
    question: 'Qual a principal limitação prática do ControlNet em SDXL/SD3/Flux comparado ao SD 1.5?',
    options: [
      'Eles não funcionam em modelos pós-SD 1.5',
      'Para U-Nets maiores (SDXL) e principalmente para arquiteturas DiT (SD3, Flux), o ControlNet ocupa muita VRAM (cópia do encoder ~1-6 GB) e o ecossistema de checkpoints é menos maduro — menos variantes treinadas, qualidade variável; alternativas como T2I-Adapter e técnicas de "control" embarcado no modelo competem',
      'ControlNet só funciona com CFG=1',
      'Só roda em GPU NVIDIA',
      'Não suporta múltiplas condições simultâneas',
    ],
    correct: 1,
    explanation:
      'A cópia do encoder cresce com o tamanho do modelo base. Para SDXL, o ControlNet pesa ~5 GB. Para Flux (12B), cópias parciais ainda são pesadas. Além disso, comunidade levou tempo para portar e treinar boas variantes — ControlNets de Flux só amadureceram ~6 meses após o lançamento do modelo. T2I-Adapter (Mou et al. 2023) é uma alternativa mais leve (~70M) com performance similar em muitos casos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="controlnet-condicionamento"
      title="ControlNet: condicionamento espacial preciso"
      icon="🎛️"
      xp={70}
      readTime={14}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="lora-imagem-treino"
      nextTitle="LoRA de imagem: treinar style/character em 30 min"
      quiz={quiz}
    >
      <Section title="O problema que ControlNet resolve" accent={accent}>
        <p>
          Diffusion + prompt textual é mágico, mas tem um teto: você não consegue ditar <em>onde</em> as coisas vão. "Um homem
          de óculos em pé" gera mil composições aleatórias. Se você precisa de uma pose específica, um layout específico de
          arquitetura, uma silhueta de produto — o prompt sozinho não basta.
        </p>
        <p>
          Antes do ControlNet, o estado da arte era img2img com strength baixa (preserva composição mas perde fidelidade) ou
          inpaint manual. Nada satisfatório para fluxos profissionais. Zhang & Agrawala (ICCV 2023, "Adding Conditional Control
          to Text-to-Image Diffusion Models" — best paper) mudaram isso ao introduzir um mecanismo de condicionamento espacial
          plug-and-play que <strong>não destrói o modelo base</strong>.
        </p>
        <Callout tone="success" icon="🎯">
          A inovação central não é o conceito de "usar um hint extra" — é <em>como</em> integrar esse hint sem catastrophic
          forgetting. A resposta foi zero-conv + trainable copy do encoder.
        </Callout>
      </Section>

      <Section title="A arquitetura em uma figura" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="ControlNet plugado num U-Net (SD 1.5)"
          steps={[
            { label: 'Hint (ex: Canny edges 64×64)', desc: 'Mapa estrutural extraído da imagem de referência' },
            { label: 'Pequeno encoder de hint', desc: 'Conv stack que projeta hint para feature space do U-Net' },
            { label: 'Trainable copy do encoder do U-Net', desc: 'Cópia dos pesos do encoder original — vai aprender a integrar o hint' },
            { label: 'Zero-convolutions', desc: 'Conexões zero-init entre cada bloco da cópia treinável e o decoder do U-Net congelado' },
            { label: 'U-Net base CONGELADO', desc: 'Encoder e decoder do modelo original; pesos não mudam — preserva qualidade' },
            { label: 'Soma no decoder', desc: 'Decoder do U-Net recebe (skip do encoder original) + (zero-conv da cópia)' },
            { label: 'ε predito', desc: 'Saída final do U-Net + ControlNet — respeita o hint espacial' },
          ]}
        />
      </Section>

      <Section title="Por que zero-conv funciona" accent={accent}>
        <p>
          Considere um bloco do decoder do U-Net no momento de combinar features:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Combinação no decoder (com ControlNet)"
          formula="h_out = U_dec(h_in) + Z( C_enc( h_in, hint ) )"
          parts={[
            { text: 'U_dec', annotation: 'decoder do U-Net (congelado)', highlight: true },
            { text: 'C_enc', annotation: 'cópia treinável do encoder' },
            { text: 'Z', annotation: '1×1 conv com pesos zero', highlight: true },
            { text: 'hint', annotation: 'mapa Canny/depth/pose/...' },
          ]}
        />
        <p>
          No início do treino, Z = 0, logo h_out = U_dec(h_in) — exatamente como o U-Net original. O gradiente da loss flui de
          h_out pra Z (∂L/∂Z ≠ 0 imediatamente, mesmo que Z tenha pesos zero, porque a entrada ≠ 0). Z aprende a "abrir" o canal
          gradualmente, e C_enc segue ajustando seus pesos para passar features úteis.
        </p>
        <Callout tone="info" icon="🔬">
          A genialidade: você nunca tem um momento de "transição traumática". O modelo base nunca degrada, e a integração é
          suave. Mesmo princípio do adaLN-Zero do DiT — virou padrão para conditioning.
        </Callout>
      </Section>

      <Section title="Tipos de condicionamento (do paper original e extensões)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tipo', 'Hint extraído por', 'Caso de uso']}
          rows={[
            ['Canny edges', 'Algoritmo Canny clássico (OpenCV)', 'Preserva contornos exatos (produtos, arquitetura)'],
            ['HED soft edges', 'Holistically-Nested Edge Detection (Xie & Tu 2015)', 'Edges mais suaves, "artistic"'],
            ['Depth map', 'MiDaS (Ranftl et al. 2020) ou DPT', 'Composição 3D, profundidade plausível'],
            ['Normal map', 'BAE-Net / Omnidata', 'Iluminação coerente, superfícies'],
            ['Semantic segmentation', 'ADE20K / Mask2Former', 'Layout de cena ("céu aqui, prédio ali")'],
            ['OpenPose', 'OpenPose keypoints / DWPose (Yang et al. 2023)', 'Pose humana precisa'],
            ['M-LSD lines', 'M-LSD (Gu et al. 2022)', 'Linhas retas, arquitetura, interiores'],
            ['Scribble', 'Desenho manual / sketch sintético', 'Composição rápida a partir de rascunho'],
            ['Tile (upscale)', 'A imagem original (downsample)', 'Upscale com adição de detalhes'],
            ['QR code', 'QR code renderizado', 'QR codes "artísticos" que ainda escaneiam'],
            ['Reference-only', 'A imagem inteira (via attention)', 'Style/composição sem hint estrutural'],
            ['IP-Adapter', 'CLIP/SigLIP vision encoder', 'Style + subject reference, leve (~50M)'],
          ]}
        />
      </Section>

      <Section title="ControlNet na prática: ComfyUI / diffusers" accent={accent}>
        <CodeBlock lang="python" filename="controlnet_canny.py">{`from diffusers import StableDiffusionXLControlNetPipeline, ControlNetModel
from diffusers.utils import load_image
import torch, cv2, numpy as np

# 1. Carrega base + ControlNet
controlnet = ControlNetModel.from_pretrained(
    "diffusers/controlnet-canny-sdxl-1.0",
    torch_dtype=torch.float16,
)
pipe = StableDiffusionXLControlNetPipeline.from_pretrained(
    "stabilityai/stable-diffusion-xl-base-1.0",
    controlnet=controlnet,
    torch_dtype=torch.float16,
    variant="fp16",
).to("cuda")

# 2. Extrai Canny da imagem de referência
ref = load_image("reference.png").resize((1024, 1024))
img = np.array(ref)
edges = cv2.Canny(img, 100, 200)               # threshold low/high
edges = np.stack([edges] * 3, axis=-1)          # 3 canais para o ControlNet
control_image = Image.fromarray(edges)

# 3. Geração condicionada
out = pipe(
    prompt="cyberpunk neon city, ultra-detailed, 8k",
    image=control_image,
    controlnet_conditioning_scale=0.7,           # 0..2 — força do condicionamento
    num_inference_steps=30,
    guidance_scale=7.5,
).images[0]
out.save("controlnet_out.png")`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'controlnet_conditioning_scale', v: '0 = sem influência do hint; 1.0 = padrão; >1.5 satura/quebra. Tipicamente 0.5-0.9.' },
            { k: 'control_guidance_start/end', v: 'Aplicar ControlNet só em parte dos timesteps (ex: 0.0-0.7) — bordas firmes no início, liberdade no fim.' },
            { k: 'Canny thresholds', v: 'Low/high do Canny clássico — controlam densidade de bordas. Imagens limpas: 100/200; complexas: 50/150.' },
            { k: 'Stacking', v: 'Múltiplos ControlNets juntos (pose + depth, canny + tile). Custo: somam VRAM e tempo.' },
          ]}
        />
      </Section>

      <Section title="IP-Adapter: style transfer leve" accent={accent}>
        <p>
          IP-Adapter (Ye et al. 2023) ataca o problema "estilo/subject reference" sem treinar um ControlNet pesado. A ideia:
          adicionar uma cross-attention paralela ao cross-attention de texto, condicionada num embedding da imagem de
          referência produzido por CLIP vision encoder.
        </p>
        <StackFlow
          accent={accent}
          title="Cross-attention paralelo (IP-Adapter)"
          items={[
            { icon: '🖼️', label: 'Imagem ref', sub: 'CLIP-ViT-H/14', detail: 'Vision encoder produz embedding global + tokens', connector: 'projeção MLP' },
            { icon: '📝', label: 'Prompt texto', sub: 'CLIP-text encoder', detail: 'Embedding usual do prompt', connector: '+' },
            { icon: '🔀', label: 'Dois cross-attentions paralelos', sub: 'em cada bloco do U-Net', detail: 'attn_text + λ · attn_image — λ controla peso da referência (0..1)' },
            { icon: '📤', label: 'Saída', sub: 'imagem que respeita prompt + estilo da ref', detail: 'Pesos do U-Net base permanecem congelados' },
          ]}
        />
        <Callout tone="success" icon="⚡">
          Vantagens: ~22M params (SD 1.5) a ~50M (SDXL), treina em horas, integra suavemente com ControlNet. Variantes:
          IP-Adapter-FaceID (subject consistente para retratos), IP-Adapter-Plus (mais fidelidade).
        </Callout>
      </Section>

      <Section title="Decisão: quando usar o quê" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Você precisa gerar variações de um produto preservando a silhueta exata"
          winner="ControlNet Canny (ou MLSD para linhas retas)"
          why="Canny extrai contornos com precisão; em conjunto com strength alto (0.8-1.0) preserva a forma do produto. Combinar com prompt criativo gera variações de cenário/iluminação sem mudar o produto."
          alternatives={[
            { name: 'img2img puro' }, { name: 'Strength baixo preserva mas degrada qualidade; strength alto perde a silhueta' }, { name: 'IP-Adapter' }, { name: 'Bom para style reference mas não preserva contornos com precisão' }, { name: 'ControlNet Depth' }, { name: 'Preserva profundidade 3D mas não contornos exatos' }
          ]}
        />
        <DecisionBox
          winnerColor={accent}
          scenario="Você quer gerar várias imagens com o mesmo personagem em poses diferentes"
          winner="IP-Adapter-FaceID + ControlNet OpenPose"
          why="FaceID mantém o rosto consistente; OpenPose define a pose. Combinação é o flow padrão para 'consistent character'. Alternativamente, treine um LoRA do personagem (próximo módulo) para máxima consistência."
          alternatives={[
            { name: 'Só ControlNet OpenPose' }, { name: 'Mantém a pose mas o rosto/identidade varia' }, { name: 'Só IP-Adapter' }, { name: 'Identidade ok mas pose continua aleatória' }
          ]}
        />
      </Section>

      <Section title="ControlNet em SD3 e Flux" accent={accent}>
        <p>
          Para arquiteturas MMDiT/DiT, "copiar o encoder" não é tão simples — não há U-Net contrativo. As implementações para
          SD3 e Flux usam variantes:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'SD3 ControlNet', v: 'Cópia de N blocos iniciais do MMDiT, com zero-init na saída de cada um. Stability lançou Canny, Tile, Pose, Depth oficiais.' },
            { k: 'Flux ControlNet (X-Labs, InstantX)', v: 'Várias famílias comunitárias — Canny, Depth, Pose, HED, Tile. X-Labs e InstantX dominam.' },
            { k: 'Flux Tools (Black Forest Labs)', v: 'Lançamento oficial nov 2024 — Fill (inpaint), Canny, Depth, Redux (image variation). Integrados ao modelo, qualidade superior aos comunitários.' },
            { k: 'T2I-Adapter', v: 'Alternativa leve (~70M) que injeta features via residuais em vez de cópia inteira — funciona em SDXL/SD3. Custo menor, qualidade similar para canny/depth/pose.' },
          ]}
        />
      </Section>

      <Section title="Perguntas que sobram" accent={accent}>
        <QAItem
          q="Posso treinar meu próprio ControlNet?"
          a="Sim — repos como kohya_ss e diffusers têm scripts. Precisa de dataset (imagem, hint) pareado (5k-50k pares para qualidade decente) e ~24-48h em A100. Custo prático: comece com um ControlNet existente + LoRA por cima, é mais barato."
        />
        <QAItem
          q="ControlNet conflita com LoRA?"
          a="Não — eles operam em superfícies diferentes (LoRA modifica pesos do U-Net base via low-rank; ControlNet adiciona stream paralelo). Você pode combinar: ControlNet Canny + LoRA de estilo + IP-Adapter ao mesmo tempo. Cuidado apenas com VRAM e com pesos somados (controlnet_scale × lora_scale × cfg pode saturar)."
        />
        <QAItem
          q="Por que controlnet_scale > 1 dá artefatos?"
          a="Forçar o hint demais empurra o modelo para fora do manifold de imagens naturais que ele aprendeu. Acima de ~1.2 começa a ter blocagem, texturas estranhas, contornos repetidos. Solução: control_guidance_end < 1.0 para liberar os passos finais."
        />
        <QAItem
          q="Existe um ControlNet 'universal' que aceita qualquer hint?"
          a="Não exatamente, mas Uni-ControlNet (Zhao et al. 2023) e ControlNet++ propõem encoders multi-hint compartilhados. Na prática a comunidade prefere modelos específicos — qualidade por hint é maior."
        />
      </Section>

      <Section title="Papers e código" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'ControlNet', v: 'Zhang, Rao, Agrawala 2023 — ICCV best paper — "Adding Conditional Control to Text-to-Image Diffusion Models".' },
            { k: 'IP-Adapter', v: 'Ye, Yang, Zhang, Liu, Wang 2023 — "IP-Adapter: Text Compatible Image Prompt Adapter for Text-to-Image Diffusion Models".' },
            { k: 'T2I-Adapter', v: 'Mou, Wang, Xie, Liu, Zhang, Wang, Shi 2023 — "T2I-Adapter: Learning Adapters to Dig out More Controllable Ability for T2I Diffusion Models".' },
            { k: 'DWPose', v: 'Yang, Zeng, Wang, Liu 2023 — pose estimator mais preciso que OpenPose, popular como pré-processador.' },
            { k: 'Uni-ControlNet', v: 'Zhao et al. 2023 — multi-hint num único modelo.' },
            { k: 'Repos', v: 'github.com/lllyasviel/ControlNet (paper original), github.com/tencent-ailab/IP-Adapter, github.com/XLabs-AI/x-flux (Flux ControlNets).' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          Próximo: treinar um LoRA de estilo/personagem em 30 minutos. Vamos ver kohya_ss, OneTrainer, ai-toolkit (Ostris),
          captioning automático, e como interpretar curvas de loss para identificar overfitting visual.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
