import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, DecisionBox, AnnotatedFormula, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lora-imagem-treino');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é LoRA (Low-Rank Adaptation) e por que é tão usado para fine-tune de modelos de imagem?',
    options: [
      'É uma técnica de quantização para reduzir VRAM',
      'LoRA (Hu et al. 2021) adiciona matrizes low-rank A·B ao lado de pesos congelados W, tal que ΔW = α·A·B. Só A e B são treinados (poucos params), permitindo fine-tune de SD/SDXL em GPU consumer (12-24 GB) em vez de exigir cluster',
      'É um substituto da U-Net',
      'É um text encoder otimizado',
      'É uma técnica de captioning automático',
    ],
    correct: 1,
    explanation:
      'Hu et al. 2021 ("LoRA: Low-Rank Adaptation of Large Language Models") originalmente para NLP. Em vez de treinar todos os W, congela-se W e treina W + α·(A·B) com rank r << dim. Reduz params treináveis em 100-1000×. Para SD/SDXL: instead de treinar 2.6B params, treina-se ~50-200M de LoRAs. Caber em 12-24 GB de VRAM é o que viabilizou a comunidade.',
  },
  {
    question: 'Quantas imagens são tipicamente necessárias para treinar um LoRA de personagem decente?',
    options: [
      '10000+',
      '10-30 imagens de qualidade alta, bem variadas (ângulos, expressões, fundos diferentes), com captioning consistente — qualidade > quantidade. Datasets maiores não ajudam se as imagens são repetitivas',
      '1 imagem é suficiente sempre',
      '1000-5000 — qualquer coisa menor não funciona',
      'Depende: 100 para personagem, 10000 para estilo',
    ],
    correct: 1,
    explanation:
      'Regra prática consolidada na comunidade (kohya_ss, civitai): 10-30 imagens 1024×1024+ para personagem; 30-100 para estilo; 5-15 para conceito. Variação importa: ângulos, expressões, fundos, iluminação diferentes. Captioning consistente (sempre usar o trigger word + descrição variável) é essencial. Mais que 100 imagens raramente melhora.',
  },
  {
    question: 'Qual o significado dos hiperparâmetros "rank" e "alpha" num LoRA?',
    options: [
      'Rank é a velocidade de aprendizado; alpha é a paciência',
      'Rank (r) é a dimensão do gargalo das matrizes A (d×r) e B (r×d) — controla capacity. Alpha (α) é um escalar que multiplica ΔW; tipicamente α=r ou α=r/2. Razão α/r é o "ganho" efetivo: rank alto + alpha equivalente = mais capacity para aprender detalhes finos',
      'Rank é o número de camadas; alpha é a taxa de dropout',
      'Rank é o batch size; alpha é o learning rate',
      'Rank e alpha são sinônimos',
    ],
    correct: 1,
    explanation:
      'LoRA: W_eff = W + (α/r) · A · B. Rank baixo (r=4-8) força a adaptação a viver num subespaço pequeno — bom para estilos simples ou para evitar overfitting. Rank alto (r=64-128) permite capturar detalhes finos como rosto específico ou estilo complexo. Alpha controla a magnitude da contribuição. Convenção comum: α = r (ganho 1) ou α = r/2 (atenuado).',
  },
  {
    question: 'O que indica uma curva de loss "descendo bonita" mas com qualidade visual péssima durante training de LoRA?',
    options: [
      'Loss numérica não é proxy direto para qualidade visual em diffusion — o modelo pode estar reconstruindo o ruído bem (loss baixa) mas perdendo coerência semântica/estética. Avaliação visual periódica em prompts de teste é obrigatória — não confie só na curva',
      'Sempre que loss desce, qualidade aumenta',
      'A loss está bugada',
      'Você precisa aumentar o learning rate',
      'É um caso de underfitting',
    ],
    correct: 0,
    explanation:
      'Diferente de classificadores onde accuracy ≈ loss, em diffusion o MSE no ruído pode descer enquanto a qualidade perceptual piora (overfitting visual, perda de diversidade, "estilo melado", repetição de fundos). Por isso ferramentas modernas (OneTrainer, ai-toolkit) salvam samples a cada N steps em prompts fixos de validação — você compara visualmente, não numericamente.',
  },
  {
    question: 'O que causa "overfitting visual" em treino de LoRA e como mitigar?',
    options: [
      'Causas comuns: rank alto demais para o tamanho do dataset, muitos epochs, learning rate alto, dataset com pouca variação. Mitigações: reduzir rank, aumentar regularization images, reduzir LR, usar técnicas como DoRA (Liu et al. 2024) ou DyLoRA, parar cedo via early stopping visual',
      'Não existe overfitting em LoRA',
      'Só acontece se você usar VAE errado',
      'Resolva sempre aumentando o batch size',
      'Adicione mais dropout no text encoder',
    ],
    correct: 0,
    explanation:
      'Overfitting em LoRA de imagem manifesta como: outputs com fundos sempre iguais aos do dataset; personagem aparecendo mesmo sem trigger word; perda de capacidade do modelo base (catastrophic forgetting); rosto deformado em poses diferentes. Mitigações práticas: reduzir rank (r=16→8), reduzir LR (1e-4→5e-5), usar "regularization images" (Kohya-style — imagens genéricas para preservar conceito amplo), early stopping com avaliação visual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lora-imagem-treino"
      title="LoRA de imagem: treinar style/character em 30 min"
      icon="🎓"
      xp={75}
      readTime={15}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="comfyui-engineering"
      nextTitle="ComfyUI engineering: workflow como código"
      quiz={quiz}
    >
      <Section title="Por que LoRA é a forma certa de personalizar diffusion" accent={accent}>
        <p>
          Antes de LoRA, personalizar SD significava treinar Dreambooth completo (atualiza todos os pesos do U-Net) — 24+ GB
          VRAM, checkpoints de 4-7 GB cada, lento para iterar. A entrada do LoRA (Hu et al. 2021, primeiro em NLP; portado para
          SD por kohya_ss em 2022) virou o jogo: arquivos de 50-200 MB, treino em GPU de consumidor, e composáveis (vários
          LoRAs ativos ao mesmo tempo).
        </p>
        <AnnotatedFormula
          accent={accent}
          title="A matemática do LoRA"
          formula="W_eff = W_pretrained + (α / r) · A · B ,    A ∈ ℝ^(d×r) , B ∈ ℝ^(r×k) , r ≪ d"
          parts={[
            { text: 'W_pretrained', annotation: 'pesos do U-Net (congelados)', highlight: true },
            { text: 'A · B', annotation: 'adaptação low-rank treinável', highlight: true },
            { text: 'r', annotation: 'rank (bottleneck)' },
            { text: 'α', annotation: 'escala (LoRA strength)' },
          ]}
        />
        <Callout tone="success" icon="🔑">
          A premissa empírica: <em>os gradientes da fine-tuning vivem num subespaço de baixa dimensão</em>. Ou seja, ΔW
          aprendido é "naturalmente low-rank". LoRA explora essa observação para reduzir parâmetros sem perder capacidade.
        </Callout>
      </Section>

      <Section title="Ferramentas — qual escolher" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'Foco', 'UX', 'Suporte', 'Quando usar']}
          rows={[
            ['kohya_ss', 'Geral (SD 1.5, SDXL, SD3, Flux)', 'GUI Gradio + CLI', '★★★★★', 'Padrão de fato; máxima customização'],
            ['OneTrainer', 'SD 1.5, SDXL, Flux', 'GUI desktop limpa', '★★★★', 'Iniciantes em LoRA SDXL'],
            ['ai-toolkit (Ostris)', 'Flux principalmente', 'CLI + YAML config', '★★★★', 'Estado da arte para Flux LoRAs'],
            ['SimpleTuner (bghira)', 'SDXL, SD3, Flux, Pixart', 'CLI + config', '★★★★', 'Pesquisa, multi-aspect ratio'],
            ['Replicate / Civitai trainer', 'SDXL principalmente', 'Web UI hospedado', '★★★', 'Sem GPU local; rápido'],
            ['Diffusers train_dreambooth_lora.py', 'Geral, baixo nível', 'Script Python', '★★★', 'Integração custom em pipeline'],
          ]}
        />
        <Callout tone="info" icon="🛠️">
          Recomendação prática 2024-25: <strong>ai-toolkit do Ostris para Flux</strong>; <strong>kohya_ss para SDXL/SD3</strong>;
          <strong> Replicate</strong> se não tem GPU.
        </Callout>
      </Section>

      <Section title="Dataset: o que importa de verdade" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Quantidade', v: 'Personagem: 10-30 imgs. Estilo: 30-100. Conceito/objeto: 5-15. Mais que isso raramente melhora.' },
            { k: 'Resolução', v: '1024×1024+ para SDXL/SD3/Flux. 512×512+ para SD1.5. Tools modernas suportam multi-aspect (bucketing).' },
            { k: 'Variação', v: 'Ângulos, expressões, fundos, iluminação. Sem variação → overfit ao fundo/pose dominante.' },
            { k: 'Qualidade', v: 'Sem JPEG artifacts, sem upscales fake. Imagens originais > screenshots comprimidas.' },
            { k: 'Captioning', v: 'Trigger word fixo + descrição variável. Ex: "ohwx style, a cat sitting on a wooden chair, soft lighting".' },
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          O erro mais comum de iniciante: 100 screenshots todas tiradas do mesmo jogo/personagem, mesma iluminação, mesma pose.
          O LoRA aprende isso (e só isso). Resultado: gera o personagem só naquela cenário específico. Diversidade do dataset é
          o que permite generalização.
        </Callout>
      </Section>

      <Section title="Captioning automático: WD14 / BLIP / Florence-2" accent={accent}>
        <p>
          Escrever captions à mão para 30 imagens dói. Por sorte existem auto-captioners maduros:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Captioner', 'Tipo de output', 'Quando usar']}
          rows={[
            ['WD14 Tagger (SmilingWolf)', 'Booru tags ("1girl, blue_eyes, sitting")', 'Anime/illustrations; SD 1.5 anime LoRAs'],
            ['BLIP-2 (Salesforce)', 'Frase natural ("a girl with blue eyes sitting on a chair")', 'Estilo realistic; SDXL e Flux'],
            ['Florence-2 (Microsoft)', 'Densa, multi-task (caption + bboxes + OCR)', 'Estado da arte 2024; flex'],
            ['JoyCaption (fancyfeast)', 'Captions detalhadas otimizadas para Flux', 'Flux LoRAs — qualidade superior'],
            ['LLaVA-Next / Cogvlm', 'Caption muito detalhado via VLM', 'Quando você quer captions ricas mas é lento'],
          ]}
        />
        <CodeBlock lang="python" filename="autocaption.py">{`# Exemplo: WD14 + trigger word injection
from PIL import Image
from wd14_tagger import WD14Tagger    # pseudocode

tagger = WD14Tagger("SmilingWolf/wd-v1-4-swinv2-tagger-v2")
trigger = "ohwx_character"

for img_path in glob("./dataset/*.png"):
    img = Image.open(img_path)
    tags = tagger.predict(img, threshold=0.35)   # ["1girl", "blue_eyes", ...]
    # Trigger word PRIMEIRO, sempre
    caption = f"{trigger}, " + ", ".join(tags)
    with open(img_path.replace(".png", ".txt"), "w") as f:
        f.write(caption)`}</CodeBlock>
        <Callout tone="info" icon="🏷️">
          Trigger word: invente algo único (ex: "ohwx", "myxch", "zxc7"). Use sempre — durante training e na inferência. Sem
          trigger word, o LoRA pode "vazar" no modelo base (qualquer mulher vira seu personagem).
        </Callout>
      </Section>

      <Section title="Config de treino: o que cada parâmetro faz" accent={accent}>
        <CodeBlock lang="yaml" filename="config.yaml (ai-toolkit style)">{`# Exemplo de config para LoRA de personagem em Flux Dev
job: extension
config:
  name: "myx_character_flux_v1"
  process:
    - type: 'sd_trainer'
      training_folder: "output"
      device: cuda:0
      trigger_word: "myxch"
      network:
        type: "lora"
        linear: 32           # rank — capacity da adaptação
        linear_alpha: 32     # alpha — ganho efetivo (α/r = 1.0)
      save:
        dtype: float16
        save_every: 500      # checkpoint periódico
        max_step_saves_to_keep: 4
      datasets:
        - folder_path: "./dataset"
          caption_ext: "txt"
          caption_dropout_rate: 0.05  # 5% dos steps sem caption — regulariza
          shuffle_tokens: false
          resolution: [1024]
      train:
        batch_size: 1
        steps: 2500          # ~2500 para 20 imgs; ajustar para tamanho dataset
        gradient_accumulation_steps: 1
        train_unet: true
        train_text_encoder: false   # economiza VRAM; geralmente OK
        gradient_checkpointing: true # troca tempo por VRAM
        noise_scheduler: "flowmatch"  # Flux usa rectified flow
        optimizer: "adamw8bit"
        lr: 1e-4             # típico: 1e-4 a 5e-4 para Flux
        ema_config:
          use_ema: true
          ema_decay: 0.99
        dtype: bf16
      model:
        name_or_path: "black-forest-labs/FLUX.1-dev"
        is_flux: true
        quantize: true       # NF4 quant para caber em 24GB
      sample:
        sampler: "flowmatch"
        sample_every: 250
        width: 1024
        height: 1024
        prompts:
          - "myxch character standing in a forest, cinematic lighting"
          - "myxch character portrait, neutral background"
          - "myxch character riding a bike in a city"`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'linear (rank)', v: '8-16 para estilo simples; 16-32 para personagem; 32-64 para conceitos complexos. Não passe de 128 sem motivo.' },
            { k: 'lr', v: 'SDXL: 1e-4 a 5e-4. Flux: 1e-4. Muito alto → instabilidade. Muito baixo → não converge.' },
            { k: 'steps', v: 'Regra prática: ~100-200 steps por imagem. 20 imgs × 125 = 2500 steps.' },
            { k: 'gradient_checkpointing', v: 'Troca ~30% de tempo por ~40% menos VRAM. Liga sempre que estiver no limite.' },
            { k: 'caption_dropout_rate', v: '5-15% — força o LoRA a aprender o conceito mesmo sem caption, melhora generalização.' },
          ]}
        />
      </Section>

      <Section title="Lendo a curva de loss (e o que ela NÃO diz)" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Diagnóstico de training run"
          steps={[
            { label: 'Loss cai rápido nos primeiros 200 steps', desc: 'Normal — está absorvendo a estatística do dataset' },
            { label: 'Plateau entre 500-1500 steps', desc: 'Loss estabiliza ~0.3-0.5 (Flux flow matching). Avalie samples a cada 250 steps' },
            { label: 'Samples ficam "rígidos" / sempre mesmo fundo', desc: 'Overfit — pare ou reduza rank. Não confie só na loss' },
            { label: 'Loss continua caindo mas qualidade visual piora', desc: 'Catastrophic forgetting do conceito amplo — pare antes' },
            { label: 'Loss flat desde o início', desc: 'LR baixo demais ou batch_size errado; aumente LR para 5e-4 e veja' },
            { label: 'Loss oscila violentamente', desc: 'LR alto demais ou batch=1 com dataset muito heterogêneo; reduza LR' },
          ]}
        />
        <Callout tone="warn" icon="👁️">
          Lei fundamental do LoRA training: <strong>sample, sample, sample</strong>. Configure <InlineCode>sample_every: 250</InlineCode>
          com 4-6 prompts de validação fixos (com e sem trigger word, em poses/contextos diferentes do dataset). A curva de loss
          é um indicador secundário.
        </Callout>
      </Section>

      <Section title="Variantes avançadas: DoRA, LoKr, LoHa" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Método', 'Ideia', 'Quando usar']}
          rows={[
            ['LoRA (Hu 2021)', 'ΔW = A·B (rank-r)', 'Padrão; sempre uma boa baseline'],
            ['DoRA (Liu 2024)', 'Decompõe ΔW em magnitude + direção; treina ambos separadamente. Liu et al. ICML 2024', 'Mais expressivo que LoRA para mesmo rank; ~10-20% melhor em benchmarks'],
            ['LoHa (Yeh et al. 2023)', 'Hadamard product de duas LoRAs — mais capacity', 'Quando rank baixo não basta mas você quer params controlados'],
            ['LoKr', 'Kronecker product — alta capacity, poucos params', 'Estilos complexos com poucas imagens'],
            ['LyCORIS', 'Família que engloba LoHa, LoKr, etc. + algoritmos novos', 'kohya_ss tem suporte nativo'],
          ]}
        />
      </Section>

      <Section title="Inferência: como usar o LoRA gerado" accent={accent}>
        <CodeBlock lang="python" filename="inference_lora.py">{`from diffusers import FluxPipeline
import torch

pipe = FluxPipeline.from_pretrained(
    "black-forest-labs/FLUX.1-dev",
    torch_dtype=torch.bfloat16,
).to("cuda")

# Carrega LoRA treinado
pipe.load_lora_weights("./output/myx_character_flux_v1/myx_character_flux_v1.safetensors")
pipe.fuse_lora(lora_scale=0.8)    # 0..1.5; 0.8-1.0 típico

img = pipe(
    prompt="myxch character in a snowy mountain, cinematic, 35mm film",
    num_inference_steps=28,
    guidance_scale=3.5,           # Flux usa CFG baixo
    width=1024, height=1024,
).images[0]
img.save("test.png")

# Opcional: combinar múltiplos LoRAs
pipe.load_lora_weights("./style_anime.safetensors", adapter_name="style")
pipe.set_adapters(["myx_character_flux_v1", "style"], adapter_weights=[1.0, 0.6])`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'lora_scale', v: '0.7-1.0 padrão. Acima de 1.2 satura. Abaixo de 0.5 quase não aplica.' },
            { k: 'Stacking', v: 'Personagem + estilo + concept LoRAs juntos. Ajuste pesos individualmente.' },
            { k: 'Conflito', v: 'LoRAs que treinam o mesmo conceito (2 personagens diferentes com mesmo trigger) conflitam. Use triggers únicos.' },
          ]}
        />
      </Section>

      <Section title="Decisão: LoRA vs Dreambooth vs Textual Inversion" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Você quer personalizar um modelo de imagem para um personagem específico"
          winner="LoRA (rank 16-32) com 15-25 imagens"
          why="Tem o melhor trade-off: qualidade próxima a Dreambooth full, arquivos pequenos (~150 MB), treinável em consumer GPU, composable com outros LoRAs. Estado da arte da comunidade desde 2022."
          alternatives={[
            { name: 'Dreambooth full' }, { name: 'Checkpoint 4-7 GB, mais VRAM no treino, não composable, raramente melhor que LoRA bem feito' }, { name: 'Textual Inversion' }, { name: 'Só treina embedding (5 KB) — limitado em capacidade; ok para conceitos simples, ruim para personagens detalhados' }, { name: 'ControlNet' }, { name: 'Não personaliza identidade; condiciona estrutura. Use junto, não no lugar' }, { name: 'IP-Adapter' }, { name: 'Subject reference leve, mas menos consistente que LoRA dedicado' }
          ]}
        />
      </Section>

      <Section title="Perguntas que sobram" accent={accent}>
        <QAItem
          q="Treinei um LoRA em SDXL — funciona em SD3 ou Flux?"
          a="Não. LoRAs são específicos da arquitetura — pesos têm shapes diferentes entre U-Net (SDXL) e DiT (SD3/Flux). Cada modelo base precisa de LoRA próprio. Felizmente as ferramentas (ai-toolkit, kohya_ss, OneTrainer) suportam todos."
        />
        <QAItem
          q="Por que recomendam não treinar o text encoder em LoRA de Flux?"
          a="O T5-XXL é grande (4.7B) e treinar afetá-lo aumenta VRAM e risco de catastrophic forgetting do entendimento textual. Para personagem/estilo, treinar só o U-Net/DiT já basta. Para conceitos novos que precisam de novo 'rótulo textual' (ex: nome de marca inventada), pode valer treinar text encoder — mas exige mais VRAM."
        />
        <QAItem
          q="Qual a melhor GPU para treinar Flux LoRA em casa?"
          a="RTX 3090/4090 (24 GB) é o ponto doce: roda Flux Dev com quantization NF4 + gradient_checkpointing. A6000 (48 GB) ou H100 são melhores se disponível. Em <24 GB você consegue treinar SDXL LoRA mas Flux fica apertado."
        />
        <QAItem
          q="Como precificar treino na nuvem (Replicate / RunPod)?"
          a="Replicate: ~$2-5 por LoRA Flux (h100 ~$0.001-0.002/s, 20-60 min). RunPod com h100 spot: ~$2-3/h, treino ~30 min = ~$1-1.5. Custos vão cair em 2026 conforme h200 e b100 ficam mainstream."
        />
      </Section>

      <Section title="Papers e tools" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'LoRA', v: 'Hu, Shen, Wallis, Allen-Zhu, Li, Wang, Wang, Chen 2021 — "LoRA: Low-Rank Adaptation of Large Language Models" (ICLR 2022).' },
            { k: 'DoRA', v: 'Liu, Wang, Chen et al. 2024 — "DoRA: Weight-Decomposed Low-Rank Adaptation" (ICML).' },
            { k: 'LyCORIS', v: 'Yeh et al. 2023 — repositório com LoHa, LoKr, LoCon e tudo mais.' },
            { k: 'kohya_ss', v: 'github.com/bmaltais/kohya_ss — GUI de referência, base da comunidade.' },
            { k: 'ai-toolkit', v: 'github.com/ostris/ai-toolkit — Flux LoRA, mantido por Ostris (estado da arte 2024).' },
            { k: 'OneTrainer', v: 'github.com/Nerogar/OneTrainer — GUI desktop limpa para SDXL/Flux.' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          Próximo: ComfyUI como engenharia de workflow — JSON versionável, custom nodes em Python, API server e ComfyUI Deploy
          para produção. Sai do "clica e arrasta" e entra em automação real.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
