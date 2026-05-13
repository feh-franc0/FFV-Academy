import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, StackFlow, NodeGraph, Timeline, DecisionBox, AnnotatedFormula, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('stable-diffusion-3-flux');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o MMDiT do Stable Diffusion 3 e como ele difere do DiT de Peebles & Xie?',
    options: [
      'MMDiT é só uma U-Net com self-attention extra',
      'MMDiT (Multimodal Diffusion Transformer, Esser et al. 2024) usa streams paralelos de tokens de imagem e tokens de texto que interagem via joint attention em cada bloco — diferente do DiT original, que só processava tokens de imagem com cross-attention para texto',
      'MMDiT roda em pixels diretamente, sem VAE',
      'MMDiT é versão menor do DiT, otimizada para mobile',
      'MMDiT não usa attention, apenas convoluções',
    ],
    correct: 1,
    explanation:
      'Esser et al. 2024 ("Scaling Rectified Flow Transformers for High-Resolution Image Synthesis", paper técnico do SD3) propuseram o MM-DiT: ambos os modais (texto e imagem) são tratados como sequências de tokens com pesos separados, mas concatenados na operação de attention. Resultado: o texto pode "puxar" features da imagem e vice-versa em cada bloco, melhorando alinhamento prompt-imagem significativamente.',
  },
  {
    question: 'Por que DiT (Diffusion Transformer) escala melhor que U-Net?',
    options: [
      'Porque DiT usa menos parâmetros para a mesma qualidade',
      'Porque Peebles & Xie 2023 mostraram que dobrar compute em DiT (mais layers/heads/dim) diminui FID monotonicamente, enquanto U-Net satura — a "lei de escala" de transformers se aplica também a diffusion',
      'Porque DiT é mais rápido em GPU consumidoras',
      'Porque DiT elimina o VAE',
      'Porque transformers convergem em menos epochs sempre',
    ],
    correct: 1,
    explanation:
      'Peebles & Xie 2023 ("Scalable Diffusion Models with Transformers", ICCV) varreram DiT-S (33M), DiT-B (130M), DiT-L (458M) e DiT-XL/2 (675M) com mesmos hiperparâmetros e mostraram que FID melhora monotonicamente com compute. U-Net tende a saturar a partir de ~2-3B params. Essa scalability é a razão pela qual SD3 (8B), Flux (12B) e Sora foram para transformers — segue a mesma trajetória de NLP em 2018-2020.',
  },
  {
    question: 'O que é Rectified Flow e por que SD3/Flux usam em vez do DDPM clássico?',
    options: [
      'Rectified Flow (Liu et al. 2022) reparametriza o caminho ruído→imagem como uma linha reta, permitindo amostragem em 4-20 passos com qualidade similar a DDPM 50+, e simplifica o objetivo de treino para "prever a velocidade do fluxo"',
      'É um sampler novo equivalente a DPM-Solver++ 2M',
      'É a regularização L1 do treino',
      'É uma versão do CFG sem prompt negativo',
      'É o nome do schedule cosine do SDXL',
    ],
    correct: 0,
    explanation:
      'Rectified Flow (Liu, Gong, Liu 2022 — "Flow Straight and Fast", NeurIPS) parte do framework de Flow Matching (Lipman et al. 2023) e força as trajetórias do fluxo a serem quase retas. Ganhos: menos passos para amostrar, objetivo de treino mais simples (v-prediction sobre o vector field), e melhor extrapolação. SD3 e Flux usam essa formulação. Pode ser visto como uma especialização da probability flow ODE com trajetórias retas.',
  },
  {
    question: 'Qual a principal diferença prática entre Flux.1 Schnell e Flux.1 Dev?',
    options: [
      'Schnell é melhor em texto; Dev é melhor em fotorrealismo',
      'Schnell foi distilled para gerar em 1-4 passos (licença Apache 2.0); Dev usa 20-50 passos (não-comercial) e tem qualidade superior, especialmente em coerência e detalhe',
      'Schnell roda em CPU; Dev exige GPU',
      'Schnell é o modelo grande; Dev é o pequeno',
      'Não há diferença além do nome',
    ],
    correct: 1,
    explanation:
      'Black Forest Labs lançou Flux.1 em três variantes (agosto 2024): Pro (API, não open weights), Dev (12B, licença non-commercial, ~20-50 passos), Schnell (12B distilled para 1-4 passos via timestep distillation, licença Apache 2.0). Schnell prioriza velocidade; Dev prioriza qualidade.',
  },
  {
    question: 'Por que SD3 e Flux conseguem renderizar texto dentro de imagens muito melhor que SDXL?',
    options: [
      'Porque usam OCR como pós-processamento',
      'Combinação de fatores: T5-XXL como text encoder (entende sequências longas e ortografia), MMDiT/DiT com mais capacity, datasets de treino com mais sintética legendada cuidadosamente, e training com aug específica para texto',
      'Porque foram treinados com 100× mais dados',
      'Porque adicionaram um modelo de linguagem ao decoder',
      'Porque proibiram a geração de imagens sem texto durante o treino',
    ],
    correct: 1,
    explanation:
      'O culpado principal é o text encoder: CLIP-L tem só 77 tokens e foi treinado contrastivamente sem foco em ortografia. T5-XXL (4096 dim, contexto longo, treinado em texto puro) entende perfeitamente como uma palavra é soletrada — essencial para gerar "OPEN" e não "ÔPÊN". Some isso à arquitetura DiT/MMDiT com mais capacity e training data limpo, e text rendering decola.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="stable-diffusion-3-flux"
      title="Stable Diffusion 3.5 e Flux: MMDiT e DiT por dentro"
      icon="⚡"
      xp={75}
      readTime={15}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="controlnet-condicionamento"
      nextTitle="ControlNet: condicionamento espacial preciso"
      quiz={quiz}
    >
      <Section title="A virada: por que U-Net não escala mais" accent={accent}>
        <p>
          De 2020 a 2023 a U-Net foi a arquitetura padrão. Funcionou em SD 1.5 (859M), SD 2.x e até SDXL (2.6B). Mas a partir de
          ~3B de parâmetros, U-Net começou a apresentar diminishing returns: mais compute não melhorava FID na mesma taxa.
        </p>
        <p>
          Em janeiro de 2023, Peebles & Xie (ICCV — "Scalable Diffusion Models with Transformers") publicaram o DiT (Diffusion
          Transformer). A tese era simples: substituir completamente U-Net por um transformer puro patchificando o latente, e a
          escala se comportaria como NLP.
        </p>
        <NodeGraph
          accent={accent}
          title="DiT em uma frase"
          columns={[
            {
              label: 'Entrada',
              nodes: [
                { icon: '📥', label: 'Latente z_t', sub: '64×64×4 (ex: SD)' },
                { icon: '🔪', label: 'Patchify', sub: 'patches 2×2 → tokens', tone: 'emphasis' },
              ],
            },
            {
              label: 'Processamento',
              nodes: [
                { icon: '🧱', label: 'N × Transformer blocks', sub: 'self-attention + adaLN(t,c)', tone: 'emphasis' },
                { icon: '⏱️', label: 'Conditioning', sub: 't_emb + c_emb via adaLN-Zero' },
              ],
            },
            {
              label: 'Saída',
              nodes: [
                { icon: '🧵', label: 'Unpatchify', sub: 'tokens → 64×64×4' },
                { icon: '📤', label: 'ε predito', sub: 'mesmo shape do latente', tone: 'success' },
              ],
            },
          ]}
        />
        <Callout tone="info" icon="📊">
          Resultado central do paper: dobrar compute em DiT diminui FID quase linearmente em log-log até 675M params. O U-Net
          satura. A diferença prática vira óbvia em modelos &gt; 3B — daí o uso em Sora, SD3, Flux, Stable Video.
        </Callout>
      </Section>

      <Section title="adaLN-Zero: a injeção de condicionamento que DiT inventou" accent={accent}>
        <p>
          U-Net injeta timestep via FiLM em GroupNorm. DiT usa <strong>adaLN-Zero</strong> (Adaptive Layer Norm com pesos
          inicializados em zero):
        </p>
        <CodeBlock lang="python" filename="adaln_zero.py">{`class DiTBlock(nn.Module):
    def __init__(self, dim, heads, mlp_ratio=4):
        self.norm1 = nn.LayerNorm(dim, elementwise_affine=False)
        self.attn  = MultiHeadAttention(dim, heads)
        self.norm2 = nn.LayerNorm(dim, elementwise_affine=False)
        self.mlp   = FeedForward(dim, mlp_ratio * dim)

        # adaLN-Zero: 6 modulações (γ, β, α) × 2 (attn, mlp)
        self.modulation = nn.Sequential(
            nn.SiLU(),
            nn.Linear(dim, 6 * dim, bias=True),
        )
        # CRÍTICO: pesos zerados na inicialização → bloco vira identidade no início
        nn.init.zeros_(self.modulation[-1].weight)
        nn.init.zeros_(self.modulation[-1].bias)

    def forward(self, x, c):     # c = t_emb + class/text_emb
        shift1, scale1, gate1, shift2, scale2, gate2 = self.modulation(c).chunk(6, dim=-1)
        # Attention com modulação
        x = x + gate1.unsqueeze(1) * self.attn(modulate(self.norm1(x), shift1, scale1))
        # MLP com modulação
        x = x + gate2.unsqueeze(1) * self.mlp(modulate(self.norm2(x), shift2, scale2))
        return x

def modulate(x, shift, scale):
    return x * (1 + scale.unsqueeze(1)) + shift.unsqueeze(1)`}</CodeBlock>
        <Callout tone="success" icon="🔑">
          A escolha de inicializar com zero é deliberada — no início do treino, cada bloco vira identidade (não atrapalha), e
          gradativamente aprende a modular. Reduz instabilidade em modelos profundos. É hoje padrão em DiT, MMDiT, Sora.
        </Callout>
      </Section>

      <Section title="MMDiT: a contribuição do SD3" accent={accent}>
        <p>
          Esser, Kulal, Lorenz et al. 2024 (paper técnico do Stable Diffusion 3) propuseram uma evolução: dois streams paralelos
          de tokens — um para imagem, outro para texto — que se misturam via <strong>joint attention</strong> em cada bloco.
        </p>
        <StackFlow
          accent={accent}
          title="Bloco MMDiT (SD3)"
          items={[
            { icon: '📝', label: 'Stream Texto', sub: 'T5-XXL tokens', detail: 'LayerNorm separado, modulação separada — pesos próprios para texto' },
            { icon: '🖼️', label: 'Stream Imagem', sub: 'Patches do latente', detail: 'LayerNorm separado, modulação separada — pesos próprios para imagem', connector: 'concat de Q/K/V' },
            { icon: '🤝', label: 'Joint Attention', sub: 'attention sobre tokens concatenados', detail: 'Q = [Q_text ; Q_img]; K = [K_text ; K_img]; V = [V_text ; V_img]. softmax(Q·Kᵀ) faz texto e imagem se misturarem em cada bloco', connector: 'split de volta' },
            { icon: '📝', label: 'MLP texto', sub: 'pesos próprios', detail: 'Cada modal mantém capacidade de processamento próprio' },
            { icon: '🖼️', label: 'MLP imagem', sub: 'pesos próprios', detail: 'Saídas independentes por modal' },
          ]}
        />
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'DiT (Peebles & Xie)', 'MMDiT (SD3)']}
          rows={[
            ['Streams', 'Único (imagem)', 'Dois (imagem + texto)'],
            ['Texto entra via', 'adaLN-Zero (vetor pooled)', 'Token sequence em joint attention'],
            ['Capacity para texto', 'Limitada (vetor único)', 'Plena (tokens com pesos próprios)'],
            ['Custo computacional', 'Menor', '~1.3-1.5× (tokens extras)'],
            ['Qualidade prompt-image alignment', 'Boa', 'Melhor — especialmente prompts complexos'],
          ]}
        />
      </Section>

      <Section title="Rectified Flow: o objetivo de treino" accent={accent}>
        <p>
          SD3 e Flux abandonaram o ε-prediction do DDPM em favor de Rectified Flow (Liu et al. 2022) / Flow Matching (Lipman et
          al. 2023). A intuição:
        </p>
        <p>
          Em vez de pensar em "ruído sendo removido", pense em um <strong>fluxo</strong> que transporta uma amostra de ruído
          z₁ ~ N(0, I) até uma amostra de dado z₀ ~ p_data ao longo do tempo t ∈ [0, 1]. O caminho mais simples é a interpolação
          linear:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Interpolação linear (rectified flow)"
          formula="z_t = (1 − t) · z_0 + t · z_1"
          parts={[
            { text: 'z_0', annotation: 'amostra real (dado)', highlight: true },
            { text: 'z_1', annotation: 'ruído puro' },
            { text: 't ∈ [0,1]', annotation: 'tempo no fluxo' },
          ]}
        />
        <p>
          O <strong>vector field alvo</strong> ao longo dessa trajetória é simplesmente v(z_t, t) = z_1 − z_0 (derivada da
          interpolação). O modelo aprende:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Loss do Rectified Flow"
          formula="L(θ) = E_{t, z_0, z_1} [ ‖ v_θ(z_t, t) − (z_1 − z_0) ‖² ]"
          parts={[
            { text: 'v_θ', annotation: 'rede neural prevê velocidade', highlight: true },
            { text: '(z_1 − z_0)', annotation: 'velocidade alvo (constante na linha)' },
          ]}
        />
        <p>Para amostrar, integra-se a ODE inversa partindo de z_1 ~ N(0, I):</p>
        <CodeBlock lang="python" filename="rectified_flow_sample.py">{`def sample(model, n_steps=20):
    z = torch.randn(1, 4, 64, 64)               # z_1 ~ N(0, I)
    timesteps = torch.linspace(1, 0, n_steps + 1)
    for i in range(n_steps):
        t = timesteps[i]; t_next = timesteps[i + 1]
        v = model(z, t)                          # predição de velocidade
        z = z + (t_next - t) * v                 # Euler step
    return z                                     # z ≈ z_0 (latente da imagem)`}</CodeBlock>
        <Callout tone="success" icon="🚀">
          Como a trajetória é quase reta, Euler simples com 20 passos basta. Para distillation extrema (Flux Schnell, SDXL
          Turbo) dá pra chegar em 1-4 passos com adversarial distillation por cima.
        </Callout>
      </Section>

      <Section title="Os players principais hoje" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Modelo', 'Arquitetura', 'Params', 'Text encoder', 'Licença', 'Destaque']}
          rows={[
            ['SD 1.5', 'U-Net', '859M', 'CLIP-L', 'OpenRAIL', 'Padrão de fine-tune comunitário'],
            ['SDXL', 'U-Net (maior)', '2.6B', 'CLIP-L + bigG', 'OpenRAIL', 'Última geração U-Net forte'],
            ['SD 3 / 3.5', 'MMDiT', '2B–8B', 'CLIP-L + CLIP-G + T5-XXL', 'Stability Community', 'Text rendering excelente'],
            ['Flux.1 Pro', 'DiT (proprietário)', '~12B', 'CLIP-L + T5-XXL', 'API only', 'Topo de qualidade em 2024-25'],
            ['Flux.1 Dev', 'DiT', '12B', 'CLIP-L + T5-XXL', 'Non-commercial', 'Open weights, 20-50 steps'],
            ['Flux.1 Schnell', 'DiT distilled', '12B', 'CLIP-L + T5-XXL', 'Apache 2.0', '1-4 steps; livre comercial'],
            ['Ideogram 2.0', 'Proprietário', 'N/A', 'N/A', 'API', 'Best-in-class para texto em imagem'],
            ['Imagen 3 (Google)', 'DiT-like + T5', 'N/A', 'T5-XXL', 'API only', 'Topo em alinhamento textual'],
          ]}
        />
      </Section>

      <Section title="Por que o ecossistema migrou para Flux" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Novembro 2024: você precisa escolher um modelo open weights para um produto comercial"
          winner="Flux.1 Schnell (Apache 2.0)"
          why="Schnell tem qualidade quase igual a Dev, gera em 4 passos (latência baixa), e licença totalmente livre — único 'big' modelo open com licença permissiva em fim de 2024. SDXL ainda funciona mas qualidade visivelmente inferior. SD3 Medium tem licença Stability Community (gratuita só para receita ≤$1M)."
          alternatives={[
            { name: 'SDXL' }, { name: 'Qualidade inferior em 2024+; ecosystem ainda forte mas em declínio' }, { name: 'Flux Dev' }, { name: 'Licença non-commercial — só prototipagem' }, { name: 'SD 3.5 Large' }, { name: 'Boa licença mas qualidade ligeiramente abaixo de Flux Pro/Dev em geral' }
          ]}
        />
      </Section>

      <Section title="Timeline da transição U-Net → DiT" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2020', label: 'DDPM (U-Net)', detail: 'Ho et al. estabelece o padrão.' },
            { when: '2022', label: 'Latent Diffusion / SD 1.x', detail: 'U-Net + VAE no latente democratiza o acesso.', highlight: true },
            { when: '2022', label: 'Flow Matching (Lipman et al.)', detail: 'Generalização do objetivo de diffusion para vector fields.' },
            { when: '2022', label: 'Rectified Flow (Liu et al.)', detail: 'Trajetórias retas → poucos passos.' },
            { when: '2023', label: 'SDXL', detail: 'Último U-Net forte da Stability AI.' },
            { when: '2023', label: 'DiT (Peebles & Xie)', detail: 'ICCV — Diffusion Transformer puro.', highlight: true },
            { when: '2024 jan', label: 'Sora (OpenAI)', detail: 'Vídeo com DiT — confirma escalabilidade da arquitetura.', highlight: true },
            { when: '2024 fev', label: 'SD3 / MMDiT', detail: 'Esser et al. — dual stream com joint attention.', highlight: true },
            { when: '2024 ago', label: 'Flux.1 (Black Forest Labs)', detail: 'Time ex-Stability lança DiT 12B com qualidade topo.', highlight: true },
            { when: '2024 out', label: 'SD 3.5 Large', detail: 'Stability rebate com modelo melhorado.' },
            { when: '2025', label: 'Flow-based padrão', detail: 'Quase todos os modelos novos usam Flow Matching / Rectified Flow.' },
          ]}
        />
      </Section>

      <Section title="Patchify e position embedding" accent={accent}>
        <p>
          Detalhe importante: o latente 64×64×4 vira sequência de tokens via patchify. Patches 2×2 produzem 32×32 = 1024 tokens
          de dim 16 (=2·2·4). DiT-XL/2 usa patches 2×2 (n_patches=256 num latente 32×32). SD3 usa esquema similar mas com
          patches menores em alta resolução.
        </p>
        <p>
          Position embeddings: DiT original usa sinusoidal 2D (mesma do ViT). MMDiT e Flux usam <strong>RoPE 2D</strong>
          (Rotary Position Embedding extendido para grade), seguindo Su et al. 2021. RoPE é mais bem-comportado para
          extrapolação para resoluções maiores que o treino.
        </p>
        <Callout tone="info" icon="🔍">
          RoPE multiplica Q e K por uma matriz de rotação dependente de posição — preserva produto interno relativo. Permite a
          Flux gerar em 1024×1024 mesmo se treinado majoritariamente em resoluções menores, sem retreinar position embeddings.
        </Callout>
      </Section>

      <Section title="Perguntas que sobram" accent={accent}>
        <QAItem
          q="Por que SD3 demorou tanto para sair depois do SDXL?"
          a="Stability AI passou por reorganizações internas e perda de talentos (vários core researchers saíram para fundar Black Forest Labs, criando o Flux). Quando SD3 saiu (fev 2024), Flux já estava em desenvolvimento adiantado. Houve sobreposição de equipes e expertise."
        />
        <QAItem
          q="Posso fazer fine-tune em Flux Dev como faço em SDXL?"
          a="Sim, com cuidado: LoRA funciona (tools como kohya_ss, ai-toolkit, SimpleTuner suportam Flux). Full fine-tune exige bem mais VRAM (~80GB para 12B em bf16). Atenção à licença: fine-tune de Flux Dev permanece non-commercial; Flux Schnell permite uso comercial mas é distilled — fine-tunes podem perder a propriedade de poucos passos."
        />
        <QAItem
          q="DiT funciona para vídeo igual para imagem?"
          a="Sim, e foi exatamente o que Sora demonstrou: estende o patchify para espaço-tempo (cubelets ao invés de patches 2D). DiT 3D processa sequências (frames × patches espaciais). Veo, Kling e Runway Gen-4 usam variantes desse mesmo princípio."
        />
        <QAItem
          q="MMDiT é compatível com ControlNet?"
          a="Sim — existem ControlNets para SD3 e para Flux, embora demoraram alguns meses para emergir após o lançamento dos modelos base. A integração é arquiteturalmente similar à de U-Net (zero-init em camadas paralelas), mas precisa adaptar aos blocos de transformer em vez de blocos convolucionais."
        />
      </Section>

      <Section title="Papers que você precisa ler" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'DiT', v: 'Peebles & Xie 2023 — "Scalable Diffusion Models with Transformers" (ICCV).' },
            { k: 'SD3 / MMDiT', v: 'Esser, Kulal, Lorenz et al. 2024 — "Scaling Rectified Flow Transformers for High-Resolution Image Synthesis".' },
            { k: 'Rectified Flow', v: 'Liu, Gong, Liu 2022 — "Flow Straight and Fast: Learning to Generate and Transfer Data with Rectified Flow" (NeurIPS).' },
            { k: 'Flow Matching', v: 'Lipman, Chen, Ben-Hamu, Nickel, Le 2023 — "Flow Matching for Generative Modeling" (ICLR).' },
            { k: 'Sora technical report', v: 'OpenAI 2024 — "Video generation models as world simulators" (blog/relatório técnico).' },
            { k: 'RoPE', v: 'Su, Lu, Pan, Murtadha, Wen, Liu 2021 — "RoFormer: Enhanced Transformer with Rotary Position Embedding".' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          Próximo: como controlar de verdade essas máquinas. ControlNet (Zhang & Agrawala 2023, ICCV best paper) adiciona
          condicionamento espacial preciso — canny, depth, pose, scribble. Vamos ver o truque do zero-conv e por que ele se
          mantém o estado da arte.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
