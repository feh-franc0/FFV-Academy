import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('diffusion-score-matching-math');

const accent = '#ec4899';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a intuição central do forward process num modelo de difusão (DDPM)?',
    options: [
      'A imagem é projetada num espaço latente fixo e o modelo aprende a inverter essa projeção',
      'A imagem recebe ruído gaussiano em T passos até virar amostra de N(0, I); o modelo aprende o reverso desse processo',
      'O modelo gera pixel a pixel da esquerda para a direita usando autoregressão como num PixelCNN',
      'A imagem é tokenizada em patches discretos e tratada como sequência por um transformer',
    ],
    correct: 1,
    explanation:
      'Ho et al. 2020 (DDPM) definem q(x_t | x_{t-1}) = N(x_t; sqrt(1-β_t) x_{t-1}, β_t I). Após T passos a distribuição se aproxima de N(0, I). O modelo aprende p_θ(x_{t-1} | x_t), estimando o ruído ε adicionado em cada passo via uma rede neural (U-Net). Por linearidade gaussiana, x_t = sqrt(ᾱ_t) x_0 + sqrt(1 - ᾱ_t) ε, permitindo treinar em qualquer t sem rodar a cadeia inteira.',
  },
  {
    question: 'O que é a score function ∇_x log p(x) e por que ela aparece no contexto de diffusion?',
    options: [
      'É o gradiente da loss durante o treino do modelo — controla learning rate',
      'É a derivada da densidade em x; ela indica a direção em que a probabilidade cresce, permitindo amostrar via Langevin dynamics (Song & Ermon 2019)',
      'É o gradiente do modelo discriminador num GAN — substitui o feedback adversarial',
      'É o produto escalar entre prompt embedding e image embedding usado para guiar a geração',
      'Score function é só outro nome para a função de loss reconstrutiva do VAE',
    ],
    correct: 1,
    explanation:
      'A score function s(x) = ∇_x log p(x) aponta para regiões de maior densidade. Song & Ermon 2019 (NCSN) treinaram redes para estimar a score em diversos níveis de ruído e mostraram que amostrar via Langevin dynamics ( x_{t+1} = x_t + (η/2) s(x_t) + sqrt(η) z ) recupera amostras realistas. A equivalência DDPM ↔ score matching foi formalizada em Song et al. 2021 (Score SDE): a rede que estima ruído ε_θ é equivalente a estimar a score (a menos de um fator de escala).',
  },
  {
    question: 'Qual a diferença prática entre DDPM e DDIM no momento de gerar uma imagem?',
    options: [
      'DDPM gera em 1 passo; DDIM precisa de 1000 passos',
      'DDPM é estocástico e exige ~1000 passos; DDIM é determinístico (η=0) e gera com 20–50 passos com qualidade similar',
      'DDPM gera em RGB; DDIM só funciona em latentes',
      'DDIM substitui o U-Net por um transformer; DDPM mantém U-Net',
      'DDIM precisa de mais memória e roda mais devagar por passo',
    ],
    correct: 1,
    explanation:
      'Song et al. 2021 (DDIM — Denoising Diffusion Implicit Models) reformulou o reverso como um processo não-Markoviano. Com η=0 a amostragem vira determinística: dado o mesmo ruído inicial e prompt, a imagem é reproduzível. Como o caminho é determinístico e suave, dá para pular passos (subset de timesteps) e ainda chegar a uma amostra coerente. Isso permite gerar com 20–50 passos em vez de 1000, mantendo FID competitivo.',
  },
  {
    question: 'Por que a formulação SDE/ODE (Song et al. 2021) unifica DDPM, DDIM e score matching?',
    options: [
      'Porque substitui o U-Net por uma EDO ordinária mais simples',
      'Porque mostra que tanto o forward quanto o reverse process são casos discretos de SDEs contínuas; a solução determinística (probability flow ODE) corresponde a DDIM e a estocástica a DDPM',
      'Porque elimina a necessidade de treinar a rede neural — basta integrar a ODE',
      'Porque transforma diffusion em GAN equivalente',
      'Porque resolve a equação em forma fechada sem amostragem iterativa',
    ],
    correct: 1,
    explanation:
      'Score SDE (Song, Sohl-Dickstein, Kingma, Kumar, Ermon, Poole 2021) escreve o forward process como uma SDE: dx = f(x,t) dt + g(t) dw. O reverse é também uma SDE: dx = [f(x,t) − g(t)² s_θ(x,t)] dt + g(t) dw̃. Para η=0 (sem termo estocástico) vira a probability flow ODE — equivalente a DDIM. Isso unifica score matching, DDPM e DDIM sob o mesmo arcabouço contínuo e permite usar solvers de ODE (Heun, RK45, DPM-Solver) para amostragem mais eficiente.',
  },
  {
    question: 'Qual destas afirmações sobre Classifier-Free Guidance (CFG) é falsa?',
    options: [
      'CFG treina o mesmo modelo condicional e incondicional (drop do prompt com prob p≈10%)',
      'A predição guiada é ε̂ = ε_uncond + w · (ε_cond − ε_uncond), com w controlando força',
      'CFG muito alto (>15) tende a saturar cores e gerar artefatos',
      'CFG só funciona em modelos discretos autoregressivos como Parti',
      'CFG é ortogonal a DDIM/DDPM e pode ser combinado com qualquer schedule de amostragem',
    ],
    correct: 3,
    explanation:
      'Ho & Salimans 2022 (Classifier-Free Diffusion Guidance) introduziu CFG justamente para modelos de diffusion contínuos como DDPM. Não é exclusivo de autoregressivos — pelo contrário, é a técnica padrão em Stable Diffusion, Imagen, DALL·E 2, Flux. As demais afirmações são verdadeiras: drop condicional ~10%, fórmula linear, e CFG alto satura/cria artefatos (skin plástico, contraste irreal).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="diffusion-score-matching-math"
      title="Diffusion math: score matching e SDE/ODE"
      icon="🧮"
      xp={80}
      readTime={16}
      trailName="Diffusion & Geração Multimodal"
      trailColor={accent}
      nextSlug="vae-unet-internals"
      nextTitle="VAE + U-Net: arquitetura por trás do Stable Diffusion"
      quiz={quiz}
    >
      <Section title="Por que você precisa da matemática (e não só de prompts)" accent={accent}>
        <p>
          Você pode rodar Stable Diffusion ou Flux sem entender uma única equação. O resultado vai sair, e até bonito. Mas no
          momento em que algo dá errado — imagem borrada, prompt ignorado, CFG instável, sampler ruim — você fica refém de
          chutar valores no <InlineCode>cfg_scale</InlineCode> e trocar de sampler até funcionar. Saber a matemática transforma
          esse processo num diagnóstico: <em>por que</em> 50 passos de Euler com CFG 12 saturam? <em>Por que</em> DPM-Solver++ 2M
          converge melhor que DDPM em 20 passos? <em>Por que</em> a probability flow ODE permite editar latentes de forma
          determinística?
        </p>
        <p>
          Este módulo cobre o núcleo: forward gaussian process, reverse process, score function, equivalência ruído↔score, DDPM
          (Ho et al. 2020), DDIM (Song et al. 2021), e a formulação SDE/ODE contínua (Song, Sohl-Dickstein et al. 2021). É o
          background mínimo para ler papers de SD3, Flux, DiT e entender debates atuais sobre Flow Matching e Rectified Flow.
        </p>
        <Callout tone="info" icon="📚">
          Pré-requisitos honestos: cálculo univariado, probabilidade básica (gaussianas, esperança), álgebra linear (produto
          interno, normas), nada além de cálculo de variáveis aleatórias. EDOs/SDEs ajudam mas a intuição funciona sem.
        </Callout>
      </Section>

      <Section title="A intuição geral em três frases" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Forward', v: 'Pegue uma imagem real x₀ e adicione ruído gaussiano em T passos até virar puro N(0, I).' },
            { k: 'Reverse', v: 'Aprenda a desfazer cada passo — dado x_t ruidoso, prever x_{t-1} um pouco menos ruidoso.' },
            { k: 'Geração', v: 'Amostre ε ~ N(0, I) e aplique o reverso T vezes. O resultado é uma amostra da distribuição de imagens.' },
          ]}
        />
        <p>
          A grande sacada do DDPM (Ho, Jain, Abbeel — NeurIPS 2020) foi mostrar que o reverso, apesar de envolver uma integral
          intratável sobre todos os x₀ possíveis, pode ser aproximado por uma rede neural treinada com uma loss simples de MSE
          sobre o ruído adicionado. Sem adversarial training, sem reparametrization complicada, sem balanceamento delicado de
          GANs.
        </p>
      </Section>

      <Section title="Forward process: cadeia de Markov gaussiana" accent={accent}>
        <p>
          Defina um schedule de variâncias β₁, ..., β_T ∈ (0, 1) (linear, cosine, sigmoide — qualquer um monotônico crescente).
          A cada passo t você adiciona ruído gaussiano:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Transição de um passo (forward)"
          formula="q(x_t | x_{t-1}) = N( x_t ; √(1 − β_t) · x_{t-1} , β_t · I )"
          parts={[
            { text: 'x_t', annotation: 'estado ruidoso no passo t', highlight: true },
            { text: 'β_t', annotation: 'variância no passo t', highlight: true },
            { text: '√(1−β_t) · x_{t-1}', annotation: 'média encolhida' },
            { text: 'β_t · I', annotation: 'covariância isotrópica' },
          ]}
        />
        <p>
          Aplicando recursivamente e usando linearidade de gaussianas, dá pra pular direto de x₀ até x_t em uma única expressão
          fechada — essencial para treinar eficientemente:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Marginal direta (qualquer t a partir de x_0)"
          formula="x_t = √(ᾱ_t) · x_0 + √(1 − ᾱ_t) · ε ,    ε ~ N(0, I)"
          parts={[
            { text: 'α_t = 1 − β_t', annotation: 'fator de retenção', highlight: true },
            { text: 'ᾱ_t = Π_{s=1..t} α_s', annotation: 'produto cumulativo', highlight: true },
            { text: 'ε', annotation: 'ruído amostrado' },
          ]}
        />
        <Callout tone="success" icon="✅">
          Isso é ouro: para treinar você não precisa simular a cadeia inteira. Sorteia t ∈ {`{1,...,T}`} uniforme, amostra ε, monta
          x_t pela fórmula direta, e treina a rede para prever ε a partir de x_t e t. Custo: O(1) por amostra.
        </Callout>
      </Section>

      <Section title="Reverse process: a parte que precisa de aprendizado" accent={accent}>
        <p>
          O verdadeiro reverso q(x_{`{t-1}`} | x_t) é intratável (depende de p(x_0)). Mas <strong>condicionado em x_0</strong> ele
          é gaussiano e analítico:
        </p>
        <CodeBlock lang="text">{`q(x_{t-1} | x_t, x_0) = N(x_{t-1}; μ̃_t(x_t, x_0), β̃_t · I)

μ̃_t(x_t, x_0) = (√ᾱ_{t-1} · β_t / (1 − ᾱ_t)) · x_0
              + (√α_t · (1 − ᾱ_{t-1}) / (1 − ᾱ_t)) · x_t

β̃_t = ((1 − ᾱ_{t-1}) / (1 − ᾱ_t)) · β_t`}</CodeBlock>
        <p>
          O modelo p_θ(x_{`{t-1}`} | x_t) aproxima esse alvo. Em vez de aprender μ̃ diretamente, Ho et al. mostraram que prever o
          ruído ε é mais estável. Substituindo x_0 = (x_t − √(1 − ᾱ_t) · ε) / √ᾱ_t na expressão de μ̃, chega-se à parametrização
          ε-prediction:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Parametrização ε-prediction (DDPM)"
          formula="μ_θ(x_t, t) = (1/√α_t) · ( x_t − ( β_t / √(1 − ᾱ_t) ) · ε_θ(x_t, t) )"
          parts={[
            { text: 'ε_θ(x_t, t)', annotation: 'rede neural (U-Net)', highlight: true },
            { text: 'x_t', annotation: 'estado atual' },
            { text: 't', annotation: 'timestep embedding' },
          ]}
        />
      </Section>

      <Section title="A loss que faz tudo funcionar" accent={accent}>
        <p>
          A ELBO (Evidence Lower Bound) original do DDPM se decompõe em termos KL por timestep. Ho et al. mostraram que a versão
          <strong> simplificada </strong>(ignorando pesos do KL e usando apenas MSE no ruído) treina melhor na prática:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Loss simplificada do DDPM (L_simple)"
          formula="L_simple(θ) = E_{t, x_0, ε} [ ‖ ε − ε_θ( √ᾱ_t x_0 + √(1−ᾱ_t) ε , t ) ‖² ]"
          parts={[
            { text: 'E_t', annotation: 't ~ Uniform{1..T}', highlight: true },
            { text: 'E_{x_0}', annotation: 'imagem do dataset' },
            { text: 'E_ε', annotation: 'ruído N(0,I)' },
            { text: 'ε_θ', annotation: 'predição da U-Net', highlight: true },
          ]}
        />
        <p>
          Em pseudocódigo Pythonesco — quase tão simples quanto treinar um classificador:
        </p>
        <CodeBlock lang="python" filename="ddpm_train_step.py">{`# DDPM training step (Ho et al. 2020, Algorithm 1)
def train_step(x0, model, alphas_bar, T):
    B = x0.shape[0]
    t = torch.randint(0, T, (B,), device=x0.device)        # timestep uniforme
    eps = torch.randn_like(x0)                              # ruído gaussiano
    a_bar = alphas_bar[t].view(B, 1, 1, 1)                 # ᾱ_t
    x_t = a_bar.sqrt() * x0 + (1 - a_bar).sqrt() * eps      # forward "fechado"
    eps_pred = model(x_t, t)                                # ε_θ(x_t, t)
    loss = F.mse_loss(eps_pred, eps)                        # L_simple
    return loss`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Note que não há discriminador, não há reparametrização variacional, nem KL. Apenas MSE no ruído. Essa elegância é
          parte do motivo de diffusion ter ganho dos GANs em escala — treino estável, sem mode collapse.
        </Callout>
      </Section>

      <Section title="Amostragem DDPM (Algorithm 2)" accent={accent}>
        <FlowDiagram
          accent={accent}
          title="Loop de amostragem"
          orientation="vertical"
          steps={[
            { label: 'Init', desc: 'x_T ~ N(0, I)' },
            { label: 'Para t = T, T−1, ..., 1', desc: 'z ~ N(0, I) se t>1; senão z = 0' },
            { label: 'Predição', desc: 'ε̂ = ε_θ(x_t, t)' },
            { label: 'Média', desc: 'μ = (1/√α_t) · ( x_t − (β_t/√(1−ᾱ_t)) · ε̂ )' },
            { label: 'Sample', desc: 'x_{t-1} = μ + √β̃_t · z' },
            { label: 'Output', desc: 'x_0 final é a imagem' },
          ]}
        />
        <p>
          Custo por imagem: T forwards da U-Net (~1000 no paper original). Esse é o gargalo prático que motivou DDIM.
        </p>
      </Section>

      <Section title="Score matching: o outro caminho que chega no mesmo lugar" accent={accent}>
        <p>
          Hyvärinen 2005 propôs estimar densidades aprendendo a <strong>score function</strong> s(x) = ∇_x log p(x). A intuição
          física: a score é um campo vetorial que aponta para regiões de maior densidade — se você seguir o gradiente em
          pequenos passos com ruído (Langevin), eventualmente cai numa amostra típica da distribuição.
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Langevin dynamics"
          formula="x_{k+1} = x_k + (η/2) · s(x_k) + √η · z_k ,    z_k ~ N(0, I)"
          parts={[
            { text: 's(x)', annotation: '∇ log p(x)', highlight: true },
            { text: 'η', annotation: 'step size' },
            { text: 'z_k', annotation: 'ruído browniano' },
          ]}
        />
        <p>
          Song & Ermon (NeurIPS 2019, NCSN — Noise Conditional Score Networks) notaram um problema: regiões de baixa densidade
          têm score mal estimada. A solução: perturbe os dados com múltiplos níveis de ruído e treine uma <em>score-network
          condicional</em> s_θ(x, σ) que estima a score em cada nível. Comece amostrando com ruído alto (cobre todo o espaço) e
          vá diminuindo σ progressivamente — annealed Langevin dynamics.
        </p>
        <Callout tone="info" icon="🔗">
          A equivalência ε ↔ score é direta: para x_t = √ᾱ_t x_0 + √(1−ᾱ_t) ε, vale ∇_{`{x_t}`} log p(x_t) ≈ − ε_θ(x_t, t) /
          √(1 − ᾱ_t). Quem prevê ruído implicitamente está prevendo a score (a menos de um fator). Por isso DDPM e score
          matching são primos próximos.
        </Callout>
      </Section>

      <Section title="DDIM: amostragem determinística em poucos passos" accent={accent}>
        <p>
          Song, Meng, Ermon (ICLR 2021) reformularam o reverso como um processo <strong>não-Markoviano</strong>: o estado
          x_{`{t-1}`} depende explicitamente de x_t e de x_0 predito, sem precisar passar por todos os intermediários. Isso
          quebra a obrigatoriedade do schedule original e permite saltar passos.
        </p>
        <CodeBlock lang="text">{`x_{t-1} = √ᾱ_{t-1} · x̂_0(x_t)
        + √(1 − ᾱ_{t-1} − σ_t²) · ε_θ(x_t, t)
        + σ_t · z

x̂_0(x_t) = (x_t − √(1 − ᾱ_t) · ε_θ(x_t, t)) / √ᾱ_t

σ_t = η · √( (1 − ᾱ_{t-1}) / (1 − ᾱ_t) ) · √(1 − α_t / α_{t-1})`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'η = 1', v: 'Equivale ao DDPM original (estocástico)' },
            { k: 'η = 0', v: 'DDIM determinístico — σ_t = 0, nenhum z; dado mesmo x_T e prompt, mesma imagem' },
            { k: 'Subset de passos', v: 'Subsample [1, T] em 20–50 timesteps; integra como ODE discreta' },
            { k: 'Inversão', v: 'Como é determinístico, dá pra mapear x_0 → x_T (DDIM inversion) e editar' },
          ]}
        />
      </Section>

      <Section title="A formulação contínua: SDE/ODE (Song et al. 2021)" accent={accent}>
        <p>
          O passo conceitual mais importante depois do DDPM. Song, Sohl-Dickstein, Kingma, Kumar, Ermon & Poole (ICLR 2021)
          mostraram que tudo isso é a discretização de uma SDE estocástica contínua no tempo:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Forward SDE (geral)"
          formula="dx = f(x, t) dt + g(t) dw"
          parts={[
            { text: 'f(x,t)', annotation: 'drift', highlight: true },
            { text: 'g(t)', annotation: 'diffusion coeff', highlight: true },
            { text: 'dw', annotation: 'browniano' },
          ]}
        />
        <p>Duas escolhas canônicas:</p>
        <ComparisonTable
          accent={accent}
          headers={['SDE', 'Drift / diffusion', 'Limite t→T', 'Equivalência discreta']}
          rows={[
            ['VP-SDE (variance preserving)', 'f = −½ β(t) x ; g = √β(t)', 'N(0, I)', 'DDPM (Ho et al. 2020)'],
            ['VE-SDE (variance exploding)', 'f = 0 ; g = √(dσ²/dt)', 'N(0, σ²_max I)', 'NCSN (Song & Ermon 2019)'],
            ['sub-VP', 'mistura controlada', 'N(0, I) com variância menor', 'Variante numericamente estável'],
          ]}
        />
        <p>
          Pelo teorema de Anderson (1982), toda SDE forward admite uma <strong>SDE reversa</strong> com score:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Reverse SDE"
          formula="dx = [ f(x, t) − g(t)² · ∇_x log p_t(x) ] dt + g(t) dw̃"
          parts={[
            { text: '∇ log p_t(x)', annotation: 'score (rede neural)', highlight: true },
            { text: 'dw̃', annotation: 'browniano reverso' },
          ]}
        />
        <p>
          E o pulo do gato: existe uma <strong>probability flow ODE</strong> determinística com mesma distribuição marginal:
        </p>
        <AnnotatedFormula
          accent={accent}
          title="Probability flow ODE"
          formula="dx/dt = f(x, t) − ½ · g(t)² · ∇_x log p_t(x)"
          parts={[
            { text: 'sem dw', annotation: 'totalmente determinístico', highlight: true },
            { text: 'score', annotation: 's_θ(x,t)' },
          ]}
        />
        <Callout tone="success" icon="🎯">
          DDIM (η=0) é exatamente a discretização desta ODE para a VP-SDE. Por isso DDIM é determinístico, permite inversão e
          aceita solvers de ODE de alta ordem — DPM-Solver, Heun, RK4, UniPC — que convergem em poucos passos.
        </Callout>
      </Section>

      <Section title="Timeline: papers que você precisa conhecer" accent={accent}>
        <Timeline
          accent={accent}
          events={[
            { when: '2015', label: 'Sohl-Dickstein et al.', detail: 'Primeiro artigo de diffusion para densidade — "Deep Unsupervised Learning using Nonequilibrium Thermodynamics" (ICML 2015). Ignorado por anos.' },
            { when: '2019', label: 'Song & Ermon — NCSN', detail: 'Score matching com múltiplos níveis de ruído + annealed Langevin. NeurIPS 2019.', highlight: true },
            { when: '2020', label: 'Ho, Jain, Abbeel — DDPM', detail: 'Loss simplificada com MSE no ruído; primeiros resultados competitivos com BigGAN em CIFAR-10. NeurIPS 2020.', highlight: true },
            { when: '2021 jan', label: 'Song, Meng, Ermon — DDIM', detail: 'Amostragem determinística em 20–50 passos. ICLR 2021.', highlight: true },
            { when: '2021 mar', label: 'Song et al. — Score SDE', detail: 'Unifica DDPM, NCSN e DDIM via SDEs contínuas + probability flow ODE. ICLR 2021 (best paper award).', highlight: true },
            { when: '2021 mai', label: 'Dhariwal & Nichol', detail: '"Diffusion Models Beat GANs on Image Synthesis" — classifier guidance + ablações de arquitetura.' },
            { when: '2022', label: 'Ho & Salimans — CFG', detail: 'Classifier-Free Guidance: substituiu classifier guidance, é o padrão até hoje.' },
            { when: '2022', label: 'Rombach et al. — LDM', detail: 'Latent Diffusion (base do Stable Diffusion). Roda diffusion no latente do VAE, não no pixel. CVPR 2022.', highlight: true },
            { when: '2022', label: 'Lu et al. — DPM-Solver', detail: 'Solver de ODE específico para diffusion. Converge em 10–20 passos com qualidade DDPM.' },
            { when: '2023', label: 'Lipman et al. — Flow Matching', detail: 'Generalização: aprender o vector field diretamente. Base do Flux e SD3.' },
          ]}
        />
      </Section>

      <Section title="Por que importa para SD3, Flux e além" accent={accent}>
        <DecisionBox
          winnerColor={accent}
          scenario="Você está implementando uma feature em cima de Flux/SD3 e precisa decidir entre samplers"
          winner="Conheça a base matemática"
          why="Flux usa rectified flow (Liu et al. 2022) — é uma reparametrização da probability flow ODE com trajetórias quase retas. SD3 usa MMDiT com rectified flow também. Saber a base te permite ler os papers diretamente e prever qual sampler funciona."
          alternatives={[
            { name: 'Ficar trocando samplers no chute' }, { name: 'Sem entender o solver, você não consegue diagnosticar quando converge mal' }, { name: 'Confiar só em defaults da lib' }, { name: 'Defaults mudam, e cada modelo (SD1.5, SDXL, SD3, Flux) tem comportamento diferente' }
          ]}
        />
      </Section>

      <Section title="Perguntas que sobram" accent={accent}>
        <QAItem
          q="Se DDPM precisa de 1000 passos, como Stable Diffusion roda em 20?"
          a="DDIM/DPM-Solver/UniPC quebraram o vínculo entre T (passos de treino) e número de passos de amostragem. Treina-se com T=1000 mas amostra-se com 20–50 passos de um solver de ODE de alta ordem. A qualidade fica próxima do DDPM completo."
        />
        <QAItem
          q="Por que prever ruído é mais estável que prever x_0 diretamente?"
          a="No início (t alto, x_t ≈ ruído puro), prever x_0 a partir de quase nada é arbitrário; já o ruído ε ainda é a coisa em si. No final (t baixo), a sensibilidade se inverte. Salimans & Ho 2022 propuseram v-prediction (ε e x_0 ponderados) para equilibrar — usado em SDXL e Imagen 2."
        />
        <QAItem
          q="A score function existe analiticamente para uma distribuição arbitrária?"
          a="Não — só para mistura de gaussianas e algumas famílias tratáveis. Por isso a rede neural é necessária: ela aproxima a score na variedade de imagens. Score matching funciona porque você só precisa estimar bem em torno dos dados (e em torno dos dados ruidificados, daí condicionar em t)."
        />
        <QAItem
          q="Qual o link entre Flow Matching (Flux) e diffusion clássico?"
          a="Flow Matching aprende diretamente o campo de velocidades u_θ(x, t) tal que a trajetória dx/dt = u(x, t) transporta N(0, I) para a distribuição dos dados. Rectified Flow força essas trajetórias a serem quase retas, reduzindo passos. Pode ser visto como uma generalização da probability flow ODE."
        />
      </Section>

      <Section title="O que ler depois" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'DDPM', v: 'Ho, Jain, Abbeel 2020 — "Denoising Diffusion Probabilistic Models" (NeurIPS).' },
            { k: 'Score SDE', v: 'Song, Sohl-Dickstein, Kingma, Kumar, Ermon, Poole 2021 — "Score-Based Generative Modeling through SDEs" (ICLR best paper).' },
            { k: 'DDIM', v: 'Song, Meng, Ermon 2021 — "Denoising Diffusion Implicit Models" (ICLR).' },
            { k: 'NCSN', v: 'Song & Ermon 2019 — "Generative Modeling by Estimating Gradients of the Data Distribution" (NeurIPS).' },
            { k: 'CFG', v: 'Ho & Salimans 2022 — "Classifier-Free Diffusion Guidance" (NeurIPS workshop).' },
            { k: 'Latent Diffusion', v: 'Rombach et al. 2022 — "High-Resolution Image Synthesis with Latent Diffusion Models" (CVPR).' },
            { k: 'Flow Matching', v: 'Lipman, Chen, Ben-Hamu, Nickel, Le 2023 — "Flow Matching for Generative Modeling" (ICLR).' },
          ]}
        />
        <Callout tone="info" icon="➡️">
          No próximo módulo: como esse arcabouço matemático é encarnado em hardware — VAE comprime imagem em latente, U-Net
          denoise com cross-attention, CLIP/T5 fornece o condicionamento textual. É a arquitetura que faz Stable Diffusion
          rodar numa GPU de consumidor.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
