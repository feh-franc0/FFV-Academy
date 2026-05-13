import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, Timeline, DecisionBox, AnnotatedFormula, QAItem, NodeGraph } from '@/components/article/primitives';

export const metadata = getModuleMetadata('video-generation-sora');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'Como o Sora (OpenAI) representa vídeo internamente?',
    options: [
      'Como uma sequência de imagens independentes',
      'Como "spacetime patches": um VAE temporal comprime o vídeo em latente 3D (T × H × W × C), que é patchificado em cubelets pequenos (ex: 1×16×16 ou 2×16×16) e tratado como sequência de tokens por um Diffusion Transformer (DiT) — exatamente como ViT trata imagem, mas estendido para espaço-tempo',
      'Como frames raw em GPU memory',
      'Como uma cadeia de Markov sobre pixels',
      'Como um GAN temporal',
    ],
    correct: 1,
    explanation:
      'Technical report do Sora (OpenAI, fev 2024 — "Video generation models as world simulators"): o pipeline é VAE temporal → latente 3D → patchify em "spacetime patches" → DiT processa sequência → unpatchify → VAE decode → vídeo. A escolha de tratar tempo como dimensão extra do patchify é o que permite Sora escalar como um modelo de NLP grande.',
  },
  {
    question: 'Qual a função do VAE temporal em geradores de vídeo?',
    options: [
      'Adicionar ruído gaussiano nos frames',
      'Comprimir vídeo (T frames × H × W × 3) para um latente 3D menor (T\' × H/8 × W/8 × C\'), tipicamente reduzindo 4× no tempo e 8× em cada dimensão espacial — tornando o diffusion no latente tratável computacionalmente. Sem isso, processar 30 segundos de vídeo em pixel space é proibitivo',
      'Substituir o codec H.264',
      'Detectar cenas',
      'Fazer upscale do vídeo gerado',
    ],
    correct: 1,
    explanation:
      'Mesma lógica do VAE espacial do Stable Diffusion, agora estendido para tempo. Para um vídeo 5s @ 24fps em 1024×1024×3 = ~370M valores; com VAE temporal 4× temporal + 8× spatial = ~5.8M valores latentes. ~60× compressão. CogVideoX, Mochi, LTX-Video, Hunyuan Video, Sora — todos usam VAE temporal (alguns chamados "3D VAE").',
  },
  {
    question: 'Por que coerência temporal é o maior desafio de geração de vídeo (vs imagem)?',
    options: [
      'Não é difícil — é quase trivial',
      'O modelo precisa manter identidade de objetos (mesmo rosto), continuidade de iluminação, dinâmica plausível (objetos não teletransportam), física aproximada (gravidade, oclusões), interação consistente — tudo isso enquanto integra a SDE/ODE no espaço-tempo. Falhas: "flicker" temporal, morphing de identidade, objetos que somem/aparecem',
      'É difícil só porque vídeo tem mais pixels',
      'Apenas o áudio é o desafio',
      'O problema é só o tamanho do dataset',
    ],
    correct: 1,
    explanation:
      'Imagem boa = um único frame coerente. Vídeo bom = N frames consistentes ENTRE SI, com dinâmica plausível. O DiT temporal precisa atender across-time-and-space simultaneously. Erros típicos: faces que mudam de pessoa a pessoa, dedos que aparecem/somem, objetos que "transmorfam". Sora 2024 reduziu drasticamente esses erros via attention em janelas grandes de spacetime + dataset escalado.',
  },
  {
    question: 'Quais os limites práticos da geração de vídeo em 2025-2026?',
    options: [
      'Já gera filmes inteiros sem limite',
      'Duração: 5-30 segundos em uma única passada (limite de VRAM/compute na attention 3D); resolução: 720p-1080p comum, 4K em desenvolvimento; consistência: bom em close-up, frágil em movimento de câmera complexo; controle: pose/depth/IP-Adapter para vídeo ainda imaturos vs imagem',
      'Só funciona com fundo preto',
      'Limitado a 30fps no máximo',
      'Apenas vídeos em preto e branco',
    ],
    correct: 1,
    explanation:
      'Em 2026: Sora 2 (OpenAI), Veo 3 (Google), Kling 2.0 (Kuaishou), Runway Gen-4 atingem ~10-20s @ 1080p com qualidade impressionante. Mas: (1) longer-form ainda exige stitching de chunks; (2) prompts de movimento complexo (camera tracking dinâmico, ação multi-personagem) ainda quebram; (3) edição posterior (in-paint vídeo, manter consistência entre clipes) é onde a indústria está empurrando; (4) custo permanece alto (~$0.50-$2 por clipe 10s).',
  },
  {
    question: 'O que o paper técnico do Sora (OpenAI 2024) implica sobre "world simulators"?',
    options: [
      'Apenas marketing — não há nada de novo',
      'A tese: modelos escalados de geração de vídeo aprendem representações implícitas das leis físicas e dinâmicas do mundo (iluminação, oclusão, gravidade aparente, interação de objetos) — sem serem ensinados explicitamente. É uma observação empírica: ao escalar compute e dados, o modelo emerge propriedades de "simulação". Análogo às capabilities emergentes em LLMs',
      'Eles substituem motores físicos como Unreal',
      'Foram treinados com dados de simulador',
      'Sora roda Unreal Engine internamente',
    ],
    correct: 1,
    explanation:
      'O relatório do Sora ("Video generation models as world simulators", fev 2024) é mais um position paper técnico que um paper acadêmico. Afirma: ao escalar DiT em vídeo, o modelo emerge a capacidade de simular física, oclusões, iluminação volumétrica, interações de objetos — propriedades que NÃO foram ensinadas explicitamente. Tese controversa mas influente: a comunidade discute se isso é "compreensão" real ou padrão estatístico sofisticado. Indiscutível: ferramentas de criação visual mudaram para sempre.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="video-generation-sora"
      title="Video generation: Sora, Runway Gen-4, Kling, Veo"
      icon="🎬"
      xp={70}
      readTime={14}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="api-replicate-fal"
      nextTitle="APIs de geração: Replicate, fal.ai, RunPod, Modal"
      quiz={quiz}
    >
      <Section title="De imagem para vídeo: a próxima ordem de magnitude" accent={accent}>
        <p>
          A geração de vídeo é geração de imagem com uma dimensão extra — e essa dimensão muda tudo. Coerência temporal,
          continuidade de identidade, plausibilidade física, custo computacional crescendo proporcional ao número de frames.
          Em janeiro de 2024 a OpenAI apresentou o Sora ao mundo com vídeos de 60 segundos que pareciam impossíveis no ano
          anterior. A indústria correu atrás.
        </p>
        <p>
          Este módulo cobre: (1) como esses modelos funcionam por dentro (DiT temporal + VAE temporal); (2) quem está no jogo
          em 2026 (Sora 2, Veo 3, Kling 2.0, Runway Gen-4, Pika, Luma); (3) onde estão os limites práticos e por quê.
        </p>
      </Section>

      <Section title="O pipeline: VAE temporal + DiT 3D" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="horizontal"
          title="Pipeline conceitual de Sora-like models"
          steps={[
            { label: 'Texto + opcional image/video init', desc: 'Prompt em T5/CLIP; opcional: frame inicial ou vídeo curto' },
            { label: 'VAE 3D Encoder', desc: 'Vídeo TxHxWx3 → latente T\'xH\'xW\'xC\' (compressão 4x temporal + 8x spatial)' },
            { label: 'Patchify spacetime', desc: 'Latente 3D → sequência de tokens (cubelets ex. 1×2×2 ou 2×2×2)' },
            { label: 'DiT 3D', desc: 'denoising loop — Transformer com attention sobre tokens spacetime; cross-attn com texto. Iterado em N passos' },
            { label: 'Unpatchify', desc: 'Tokens denoised → latente 3D' },
            { label: 'VAE 3D Decoder', desc: 'Latente → vídeo TxHxWx3' },
            { label: 'Postproc opcional', desc: 'Upscale (Topaz Video, RealESRGAN-T), audio (ElevenLabs, Suno)' },
          ]}
        />
      </Section>

      <Section title="Spacetime patches: a sacada que escala" accent={accent}>
        <p>
          ViT (Dosovitskiy et al. 2020) ensinou que imagem pode ser sequência de patches. DiT (Peebles & Xie 2023) aplicou ao
          diffusion. Sora estendeu para vídeo: <strong>patches em espaço-tempo</strong>.
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Spacetime patch tokenization"
          formula="patch = z[t : t+p_t, h : h+p_h, w : w+p_w, :]  → token ∈ ℝ^(p_t · p_h · p_w · C')"
          parts={[
            { text: 'p_t', annotation: 'patch temporal (1 ou 2)', highlight: true },
            { text: 'p_h, p_w', annotation: 'patch espacial (2 ou 4)', highlight: true },
            { text: 'C\'', annotation: 'canais latentes (~16)' },
          ]}
        />
        <Callout tone="info" icon="🧊">
          Cubelets típicos: 1×2×2 (alta granularidade temporal, mais tokens) ou 2×4×4 (compressão maior, menos tokens). Trade-off
          óbvio: mais tokens = mais qualidade temporal fina, custo de memória sobe quadrático na attention.
        </Callout>
      </Section>

      <Section title="Attention 3D: o gargalo de compute" accent={accent}>
        <p>
          Se um latente 3D é T\'×H\'×W\' = 32 × 64 × 64 = 131k tokens, attention puro custa O(N²) = 17 bilhões de ops por
          camada. Inviável. Por isso modelos modernos usam variantes:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Estratégia', 'Como', 'Trade-off']}
          rows={[
            ['Full 3D attention', 'Todos tokens ↔ todos tokens', 'Qualidade máxima; custo O(N²) proibitivo'],
            ['Factorized (spatial + temporal)', 'Alterna self-attn espacial e temporal', 'Custo linear em uma dim; perde interações cruzadas'],
            ['Window attention', 'Attention em janelas locais 3D', 'Eficiente; precisa de shifted windows para conectividade'],
            ['Linear / Flash attention', 'Reformulação algorítmica O(N)', 'FlashAttention 3 + tricks; padrão prático'],
            ['Sparse 3D', 'Esparso baseado em routing aprendido', 'Pesquisa ativa (Mixture-of-Depths-style)'],
          ]}
        />
      </Section>

      <Section title="Os players em 2026" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Empresa', 'Open weights?', 'Forças', 'Limites']}
          rows={[
            ['Sora / Sora 2', 'OpenAI', '❌ API only', 'Coerência temporal extrema, prompts longos', 'Acesso limitado, custo alto'],
            ['Veo 2 / Veo 3', 'Google DeepMind', '❌ API (Vertex/Gemini)', 'Físca plausível, integração Gemini', 'Filtros agressivos'],
            ['Kling 2.0 / 2.5', 'Kuaishou (China)', '❌ API', 'Excelente em ação dinâmica, baixa latência', 'Filtros chineses, geo-restrições'],
            ['Runway Gen-4', 'Runway ML', '❌ API + app', 'Ferramentas de edição integradas (motion brush, camera control)', 'Qualidade ligeiramente abaixo de Sora 2'],
            ['Pika 2.x', 'Pika Labs', '❌ API + app', 'Bom para social/short-form, fácil de usar', 'Resolução menor'],
            ['Luma Dream Machine / Ray 2', 'Luma Labs', '❌ API + app', 'Image2video forte, prompts curtos OK', 'Variação de qualidade'],
            ['Hunyuan Video', 'Tencent', '✅ Open weights (13B)', 'Maior open-weights até 2025; qualidade competitiva', 'Roda em 60GB+ VRAM'],
            ['Mochi 1', 'Genmo', '✅ Open weights', 'Open + bom para fine-tune', 'Limitado em duração'],
            ['LTX-Video', 'Lightricks', '✅ Open weights', 'Real-time generation (segundos por segundo de vídeo)', 'Qualidade menor que modelos grandes'],
            ['CogVideoX 5B', 'Zhipu AI / Tsinghua', '✅ Open weights', 'Bom baseline open, suporta image2video', 'Resolução/duração limitadas'],
            ['Wan 2.1 / 2.5 (Alibaba)', 'Alibaba Tongyi', '✅ Open weights', 'Forte concorrente em 2025-26', 'Documentação irregular'],
          ]}
        />
        <Callout tone="success" icon="🎯">
          Open-weights sério em vídeo é uma realidade nova (Hunyuan Video, Wan, Mochi). Antes de fim-de-2024 só havia
          AnimateDiff (motion modules sobre SD). Em 2026 a brecha entre open e closed é ~6 meses, não anos.
        </Callout>
      </Section>

      <Section title="Image-to-video vs Text-to-video" accent={accent}>
        <NodeGraph
          accent={accent}
          title="Dois modos de operação"
          columns={[
            {
              label: 'Text-to-Video (T2V)',
              nodes: [
                { icon: '📝', label: 'Apenas prompt', sub: 'sem âncora visual' },
                { icon: '🎲', label: 'Maior variabilidade', sub: 'modelo escolhe tudo' },
                { icon: '⚠️', label: 'Identidade frágil', sub: 'rostos podem mudar', tone: 'danger' },
              ],
            },
            {
              label: 'Image-to-Video (I2V)',
              nodes: [
                { icon: '🖼️', label: 'Frame inicial fixo', sub: 'âncora forte' },
                { icon: '✅', label: 'Identidade preservada', sub: 'mesmo rosto/objeto', tone: 'success' },
                { icon: '🎬', label: 'Motion brush / cam control', sub: 'controle direcional (Gen-4)' },
              ],
            },
            {
              label: 'V2V / Restyle',
              nodes: [
                { icon: '🎞️', label: 'Vídeo entrada + prompt', sub: 'restyling, animação' },
                { icon: '🎨', label: 'Style transfer temporal', sub: 'consistente entre frames' },
                { icon: '🛠️', label: 'Ainda imaturo', sub: 'flicker comum', tone: 'muted' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Uso prático: gerando 10s de vídeo no Hunyuan Video (open)" accent={accent}>
        <CodeBlock lang="python" filename="hunyuan_video.py">{`# Pseudocódigo — diffusers já tem pipeline para vários modelos
from diffusers import HunyuanVideoPipeline
import torch

pipe = HunyuanVideoPipeline.from_pretrained(
    "tencent/HunyuanVideo",
    torch_dtype=torch.bfloat16,
).to("cuda")
pipe.enable_model_cpu_offload()       # 60GB VRAM → 24GB caber

video = pipe(
    prompt="a samurai walking through a bamboo forest at dawn, mist, soft sunlight, cinematic",
    height=720, width=1280,
    num_frames=129,                    # ~5.4s @ 24fps
    num_inference_steps=30,
    guidance_scale=6.0,
    generator=torch.Generator(device="cuda").manual_seed(42),
).frames[0]

from diffusers.utils import export_to_video
export_to_video(video, "samurai.mp4", fps=24)`}</CodeBlock>
        <Callout tone="warn" icon="💸">
          Custo computacional real: gerar 5s @ 720p em Hunyuan Video toma ~5-8 minutos em H100 (cerca de $0.50-$1 em on-demand
          pricing). Em consumer 4090 com offload é ~25-40 minutos. Sora 2 / Veo 3 não publicam tempo de inferência mas
          inferência por API custa ~$0.50-$2 por clipe de 10s.
        </Callout>
      </Section>

      <Section title="Onde quebra: limites reais em 2026" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Duração coerente', v: '10-30s estado da arte por geração única. Acima disso: stitching de chunks com técnicas de keyframe + outpainting temporal.' },
            { k: 'Movimento complexo', v: 'Camera tracking lateral + objeto em movimento + interação multi-personagem — quebra frequentemente.' },
            { k: 'Texto em vídeo', v: 'Texto estável entre frames é frágil; "OPEN" pode virar "OPEN", "OPNE", "ONEP" entre frames.' },
            { k: 'Edição preservando consistência', v: 'In-paint num frame específico mantendo coerência com outros frames — pesquisa ativa.' },
            { k: 'Áudio sincronizado', v: 'Apenas Veo 3 (Gemini) gera vídeo com áudio nativo. Outros: gere vídeo, gere áudio separado via ElevenLabs/Suno, sincronize.' },
            { k: 'Custo', v: '$0.10-$2 por clipe ~10s no melhor da feira. Para produção de série/filme, ainda é proibitivo em volume.' },
            { k: 'Lipsync', v: 'Hedra, Sieve Sync, Sync.so fazem lipsync sobre vídeo gerado. Não é parte do core.' },
          ]}
        />
      </Section>

      <Section title="Timeline da explosão de video gen" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2022', label: 'Imagen Video, Make-A-Video', detail: 'Google e Meta mostram protótipos; não lançam ao público.' },
            { when: '2023', label: 'AnimateDiff', detail: 'Motion modules sobre Stable Diffusion — primeira ferramenta open viável.' },
            { when: '2023 set', label: 'Runway Gen-2', detail: 'Primeiro produto T2V comercial mainstream.' },
            { when: '2024 fev', label: 'Sora (OpenAI)', detail: 'Salto qualitativo grande. Vídeos de 60s impressionam.', highlight: true },
            { when: '2024 jun', label: 'Kling 1.0', detail: 'Kuaishou (China) lança modelo competitivo com Sora antes mesmo do Sora abrir ao público.' },
            { when: '2024 dez', label: 'Sora público + Veo 2', detail: 'OpenAI libera Sora ao público; Google responde com Veo 2 (Vertex AI).' },
            { when: '2024 dez', label: 'Hunyuan Video (Tencent)', detail: 'Open weights 13B — referência open.', highlight: true },
            { when: '2025', label: 'Veo 3', detail: 'Vídeo + áudio sincronizado nativo (Gemini API).' },
            { when: '2025', label: 'Runway Gen-4', detail: 'Edição visual + camera control + character reference.' },
            { when: '2025', label: 'Wan 2.1 (Alibaba) + Mochi 1', detail: 'Mais open weights competitivos.' },
            { when: '2026', label: 'Sora 2 + Kling 2.5', detail: 'Geração quase real-time para clipes curtos; integração com edição.', highlight: true },
          ]}
        />
      </Section>

      <Section title="Decisão: qual usar para qual caso" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Você precisa gerar vídeos curtos para marketing/redes sociais com qualidade máxima"
          winner="Sora 2 (OpenAI) ou Veo 3 (Google) via API"
          why="Qualidade visual e coerência são o topo do mercado em 2026. Custo $0.50-$2/clipe é aceitável para marketing onde uma peça boa vale muito mais. Veo 3 ganha se você precisa de áudio nativo."
          alternatives={[
            { name: 'Runway Gen-4' }, { name: 'Ótimo para edição mas qualidade ligeiramente abaixo' }, { name: 'Kling 2.5' }, { name: 'Excelente, mas geo-restrições e filtros chineses podem bloquear conteúdo' }, { name: 'Hunyuan Video' }, { name: 'Open weights mas exige H100 self-hosted, ops sem brincadeira' }
          ]}
        />
        <DecisionBox
          winnerColor={accent}
          scenario="Você quer construir um produto que gera vídeo on-demand para usuários, sem depender de OpenAI"
          winner="Hunyuan Video ou LTX-Video self-hosted (Replicate/fal hospeda)"
          why="Open weights eliminam vendor lock-in. Hunyuan Video tem qualidade próxima a closed-source. LTX-Video é mais rápido (real-time-ish) com qualidade um pouco menor."
          alternatives={[
            { name: 'API closed' }, { name: 'Margem fica com OpenAI/Google; risco de mudanças de pricing' }
          ]}
        />
      </Section>

      <Section title="Perguntas que sobram" accent={accent}>
        <QAItem
          q="Sora realmente 'entende física'?"
          a="Polêmico. O paper técnico afirma que escalar DiT em vídeo emerge representações implícitas de física. Críticos argumentam que são padrões estatísticos sofisticados — modelo gera vídeos plausíveis porque viu padrões similares no treino, não porque tem modelo causal interno. Verdade prática: para a maioria das cenas comuns, a 'física aparente' está bem; cenas adversariais quebram (fluidos, fumaça turbulenta, colisões complexas)."
        />
        <QAItem
          q="Posso treinar um LoRA de personagem para vídeo?"
          a="Sim, em modelos open como Hunyuan Video. Funciona análogo a LoRA de imagem: dataset de imagens/clipes curtos do personagem + treino. Resultado: o personagem aparece com consistência razoável em vídeos gerados. Closed-source (Sora, Veo): impossível — só via 'character reference' nativo do modelo (Gen-4, Kling)."
        />
        <QAItem
          q="Como gerar vídeos longos (>30s)?"
          a="Estratégias: (1) Chunking — gerar clipes de 5-10s e fazer stitch via outpainting temporal ou keyframe matching; (2) Modelos com autoregressive temporal extension (Wan, LTX); (3) Edit-based: gere keyframes e interpole com modelos de interpolação (FILM, EMA-VFI); (4) Espere modelos de 60-120s nativos chegarem (2026-27)."
        />
        <QAItem
          q="O custo vai cair?"
          a="Sim, mas devagar. Compute por segundo de vídeo gerado tem caído ~3-5× ao ano. Quantization NF4/FP8, distillation (clones de 1-step), modelos menores (LTX-Video em vez de Sora), e H200/B100 ajudam. Estima-se que em 2027-28 gerar 30s de vídeo HD esteja na faixa de $0.05-$0.20."
        />
      </Section>

      <Section title="Recursos" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Sora technical report', v: 'OpenAI 2024 — "Video generation models as world simulators".' },
            { k: 'Hunyuan Video', v: 'github.com/Tencent/HunyuanVideo + paper técnico.' },
            { k: 'Mochi 1', v: 'github.com/genmoai/models — Genmo AI.' },
            { k: 'LTX-Video', v: 'github.com/Lightricks/LTX-Video.' },
            { k: 'Wan 2.x', v: 'Alibaba — wanxai.com / huggingface.co/Wan-AI.' },
            { k: 'Runway Research', v: 'runwayml.com/research — blog técnico.' },
            { k: 'Pika docs', v: 'pika.art/api — API e técnicas.' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          Próximo: como integrar tudo isso via APIs em produção. Replicate, fal.ai, RunPod, Modal — preços, latências,
          fallbacks, rate limits.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
