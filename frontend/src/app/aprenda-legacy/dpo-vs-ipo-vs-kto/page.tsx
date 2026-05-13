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

export const metadata = getModuleMetadata('dpo-vs-ipo-vs-kto');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a insight matemática central do DPO (Rafailov et al., NeurIPS 2023)?',
    options: [
      'É possível treinar um reward model menor que o policy model',
      'A política ótima do RLHF tem forma fechada em função do reward e da política de referência (π*(y|x) ∝ π_ref(y|x)·exp(r(x,y)/β)). Invertendo essa equação, o reward pode ser expresso em termos da política e da referência — eliminando o reward model explícito. A loss DPO é classificação binária direta sobre preferências',
      'PPO converge mais rápido se substituirmos o critic por um valor constante',
      'A loss de Bradley-Terry pode ser substituída por hinge loss sem perda de performance',
    ],
    correct: 1,
    explanation:
      'O paper DPO (Rafailov, Sharma, Mitchell, Ermon, Manning, Finn — NeurIPS 2023) provou que a política ótima do objetivo RLHF (max_π E[r] - β·KL) é π*(y|x) = (1/Z(x))·π_ref(y|x)·exp(r(x,y)/β). Resolvendo para r: r(x,y) = β·log(π*(y|x)/π_ref(y|x)) + β·log Z(x). Substituindo na loss Bradley-Terry, o log Z(x) cancela entre y_w e y_l. Resultado: loss puramente em termos de probabilidades da política — sem RM, sem PPO, sem rollouts.',
  },
  {
    question: 'Por que o IPO (Azar et al. 2023) foi proposto como melhoria sobre DPO?',
    options: [
      'IPO é mais rápido de treinar',
      'IPO observou que DPO assume preferências determinísticas no limite (P(y_w > y_l) → 1), levando a overfitting quando preferências reais são ruidosas. IPO usa "Identity Preference Optimization" — substitui a sigmoid log da BT por uma loss MSE que regulariza naturalmente, evitando colapso quando o dataset tem preferências contraditórias ou ruidosas',
      'IPO usa menos memória GPU',
      'IPO funciona em modelos sem cabeça value',
    ],
    correct: 1,
    explanation:
      'IPO (Azar, Rowland, Piot, Calandriello, Valko, Geist, Munos — DeepMind 2023, arxiv.org/abs/2310.12036) identificou que o DPO sobre-estima preferências em direção a 0/1 quando dados são ruidosos, levando o modelo a colocar probabilidade quase nula em respostas rejeitadas. IPO substitui o objective por (log(π_w/π_ref_w) - log(π_l/π_ref_l) - τ)² — minimiza distância L2 a uma margem fixa τ, regularizando naturalmente.',
  },
  {
    question: 'O que motivou o KTO (Ethayarajh et al. 2024)?',
    options: [
      'O KTO é uma versão acelerada do DPO',
      'KTO ("Kahneman-Tversky Optimization") observou que (1) preferências pareadas são caras de coletar, e (2) a teoria prospect de Kahneman & Tversky (Nobel 2002) mostra que humanos têm aversão a perdas — peso maior em outcomes negativos. KTO usa apenas labels binárias por exemplo (good / bad, não pares), com loss assimétrica que penaliza mais o "bad" que recompensa o "good"',
      'KTO é mais rápido em GPUs Hopper',
      'KTO substitui PPO em RL clássico',
    ],
    correct: 1,
    explanation:
      'KTO (Ethayarajh, Xu, Muennighoff, Jurafsky, Kiela — Stanford/ContextualAI 2024, arxiv.org/abs/2402.01306) tem dois motivadores: (1) Prática — datasets reais frequentemente têm labels point-wise ("essa resposta foi boa? sim/não") em vez de pareadas; (2) Teoria — humanos avaliam ganhos e perdas assimetricamente (Prospect Theory, Kahneman & Tversky 1979). KTO incorpora aversão à perda na loss, com hiperparâmetros λ_D (desirable) e λ_U (undesirable).',
  },
  {
    question: 'Em que situação o DPO supera KTO claramente?',
    options: [
      'Quando o dataset é muito pequeno',
      'Quando você tem dataset pareado de alta qualidade (mesmas escolhas pareadas que treinariam RM) — DPO é teoricamente equivalente a RLHF nesse caso e tem variância menor que KTO porque exemplo carrega 2 sinais simultaneamente. KTO ganha quando você só tem point-wise data ou quando o dataset é desbalanceado (90% positivos / 10% negativos)',
      'Quando o modelo tem mais de 70B parâmetros',
      'Quando há GPU AMD em vez de NVIDIA',
    ],
    correct: 1,
    explanation:
      'Ethayarajh et al. 2024 mostrou que em datasets pareados balanceados (UltraFeedback, AlpacaFarm), DPO ≈ KTO em performance. KTO vence em (1) datasets desbalanceados (ex.: 90% thumbs-up), (2) datasets point-wise (logs de produção com👍/👎 não-pareados), (3) datasets ruidosos. DPO vence em (1) datasets pareados curados, (2) tasks com clara hierarquia de preferência.',
  },
  {
    question: 'Como o TRL da HuggingFace implementa esses três algoritmos?',
    options: [
      'Cada um tem trainer separado e código duplicado',
      'TRL unificou via DPOTrainer com parâmetro loss_type aceitando "sigmoid" (DPO clássico), "ipo" (Identity), "kto_pair" (KTO simétrica) e "hinge", "sppo_hard", entre outros. Mesmo loop de treino, troca apenas a função de loss — facilita ablation studies',
      'TRL só suporta DPO; IPO/KTO precisam de fork',
      'IPO/KTO requerem AlignmentTrainer separado, distinto do DPOTrainer',
    ],
    correct: 1,
    explanation:
      'A TRL (github.com/huggingface/trl) padronizou em torno do DPOTrainer com loss_type configurável. Em 2026, suporta: "sigmoid" (DPO Rafailov), "hinge" (SLiC, Zhao et al. 2023), "ipo" (Azar et al.), "kto_pair" (KTO pareado), "bco_pair", "sppo_hard", "robust" (Chowdhury et al. 2024). Mesmo training loop, swap de função de loss — permite ablation studies sistemáticos no mesmo dataset.',
  },
  {
    question: 'Qual o problema fundamental do DPO em distribuições muito diferentes do SFT?',
    options: [
      'DPO precisa de PPO como fallback',
      'DPO assume implicitamente que π_ref tem suporte sobre os exemplos do dataset — se o SFT nunca geraria as respostas y_w ou y_l, o termo log(π_w/π_ref) explode numericamente e o gradiente fica ruidoso. Solução em 2024+: rejection sampling com π_ref antes de coletar preferências, ou Online DPO (Guo et al. 2024) que regenera respostas durante o treino',
      'DPO não funciona com modelos quantizados',
      'DPO requer batch_size ≥ 256',
    ],
    correct: 1,
    explanation:
      'DPO é uma loss off-policy: usa o dataset fixo. Se y_w ou y_l estão fora do suporte de π_ref, log(π_θ(y)/π_ref(y)) tem π_ref(y) ≈ 0 — divergência numérica + estimativas pobres. Online DPO (Guo et al., DeepMind 2024) regenera responses durante o treino mantendo-as on-policy, com judge AI escolhendo entre elas — combina DPO simplicidade + PPO on-policy.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dpo-vs-ipo-vs-kto"
      title="DPO vs IPO vs KTO: alinhamento sem reward model"
      icon="⚖️"
      xp={75}
      readTime={15}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="grpo-deepseek-r1"
      nextTitle="GRPO e DeepSeek-R1: o salto reasoning de 2025"
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
        Em 2023, Rafailov et al. provaram um resultado surpreendente: o reward model do RLHF é
        desnecessário. A política ótima tem forma fechada que permite expressar reward em termos
        da própria política — colapsando três modelos (policy, reference, RM) e um algoritmo RL
        (PPO) numa única loss de classificação. Esse paper (DPO) reabriu o pipeline e em dois anos
        IPO, KTO, SLiC, SPPO, ORPO e outros nasceram. Este módulo é o mapa do novo terreno.
      </p>

      <Section title="A derivação que tornou o RM dispensável" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O RLHF maximiza um objective com KL penalty: <InlineCode>max_π E_x,y[r(x,y)] - β·KL(π || π_ref)</InlineCode>.
          Esse problema tem solução fechada (lagrangiano + KKT):
        </p>
        <AnnotatedFormula
          accent={ACCENT}
          title="Política ótima do RLHF (forma fechada)"
          formula="π*(y|x) = (1/Z(x)) · π_ref(y|x) · exp(r(x,y) / β)"
          parts={[
            { text: 'π*', annotation: 'política ótima', highlight: true },
            { text: 'π_ref', annotation: 'política de referência (SFT)' },
            { text: 'r(x,y)', annotation: 'reward (ainda implícito)' },
            { text: 'β', annotation: 'coef. da KL penalty' },
            { text: 'Z(x)', annotation: 'partition function (constante em y)' },
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          Invertendo para isolar o reward: <InlineCode>r(x,y) = β·log(π*(y|x)/π_ref(y|x)) + β·log Z(x)</InlineCode>.
          Substituindo na loss Bradley-Terry (que treina o RM), <InlineCode>log Z(x)</InlineCode> cancela
          entre y_w e y_l (mesmo x). Resultado: loss puramente em probabilidades da política:
        </p>
        <AnnotatedFormula
          accent={ACCENT}
          title="DPO Loss (Rafailov et al., NeurIPS 2023)"
          formula="L_DPO = -E[log σ(β·log(π_θ(y_w)/π_ref(y_w)) − β·log(π_θ(y_l)/π_ref(y_l)))]"
          parts={[
            { text: 'σ', annotation: 'sigmoid (vem da BT)' },
            { text: 'π_θ', annotation: 'política treinável', highlight: true },
            { text: 'π_ref', annotation: 'SFT congelado (frozen)' },
            { text: 'y_w / y_l', annotation: 'winner / loser do par' },
          ]}
        />
        <Callout tone="info">
          Geometricamente: DPO aumenta a probabilidade de y_w e diminui a de y_l, mas
          normalizado pela referência (não pode fugir muito de π_ref). É treinamento de
          classificação binária — sem rollouts, sem RM, sem KL penalty explícita (a KL está
          implícita na razão log(π/π_ref)).
        </Callout>
      </Section>

      <Section title="DPO em código (TRL)" accent={ACCENT}>
        <CodeBlock lang="python" filename="train_dpo.py">{`from trl import DPOTrainer, DPOConfig
from transformers import AutoModelForCausalLM, AutoTokenizer
from datasets import load_dataset

# Dataset com colunas: prompt, chosen, rejected
dataset = load_dataset("HuggingFaceH4/ultrafeedback_binarized", split="train_prefs")

model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B-Instruct")
ref_model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B-Instruct")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B-Instruct")

config = DPOConfig(
    output_dir="./dpo-llama3",
    beta=0.1,                  # β da equação — controla a "rigidez" do KL implícito
    loss_type="sigmoid",       # DPO clássico. Alternativas: ipo, hinge, kto_pair, robust
    learning_rate=5e-7,        # MUITO menor que SFT — DPO é sensível
    per_device_train_batch_size=4,
    gradient_accumulation_steps=4,
    num_train_epochs=1,        # >1 epoch frequentemente piora
    max_length=2048,
    max_prompt_length=1024,
)

trainer = DPOTrainer(
    model=model,
    ref_model=ref_model,
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)
trainer.train()`}</CodeBlock>
        <Callout tone="warn">
          β baixo (0.01) → DPO se afasta muito do SFT, pode degradar capacidades.
          β alto (0.5+) → mal sai do SFT, ganho marginal. β = 0.1–0.3 é típico.
        </Callout>
      </Section>

      <Section title="IPO: regularizando preferências ruidosas" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Azar et al. 2023 (DeepMind, <InlineCode>arxiv.org/abs/2310.12036</InlineCode>) observou:
          DPO via Bradley-Terry assume preferências determinísticas no limite (P(y_w &gt; y_l) → 1).
          Quando dataset é ruidoso (preferências contraditórias), DPO empurra modelo a colocar
          probabilidade quase nula em y_l — overfit. IPO substitui a loss:
        </p>
        <AnnotatedFormula
          accent={ACCENT}
          title="IPO Loss (Identity Preference Optimization)"
          formula="L_IPO = E[(β·log(π_θ(y_w)/π_ref(y_w)) − β·log(π_θ(y_l)/π_ref(y_l)) − τ)²]"
          parts={[
            { text: '(·)²', annotation: 'MSE em vez de sigmoid log', highlight: true },
            { text: 'τ', annotation: 'margem fixa (alvo da diferença)' },
            { text: 'β·log(...)', annotation: 'mesma quantidade do DPO' },
          ]}
        />
        <Callout tone="info">
          A MSE com margem fixa τ regulariza: o modelo busca diferença τ entre y_w e y_l,
          não diferença infinita. Resultado: menos overfit em datasets ruidosos.
          Empíricamente IPO é mais robusto, DPO converge mais rápido em datasets limpos.
        </Callout>
      </Section>

      <Section title="KTO: aversão à perda na loss" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          KTO (Ethayarajh et al., Stanford/ContextualAI 2024 — <InlineCode>arxiv.org/abs/2402.01306</InlineCode>)
          parte de duas premissas: (1) datasets reais são point-wise (👍/👎), não pareados; (2) Prospect Theory
          (Kahneman &amp; Tversky 1979 — Nobel 2002) diz que humanos pesam perdas mais que ganhos.
          Loss assimétrica:
        </p>
        <CodeBlock lang="python" filename="kto_loss.py">{`# KTO loss (simplificada — Ethayarajh et al. 2024)
import torch
import torch.nn.functional as F

def kto_loss(policy_logps, ref_logps, is_desirable,
              beta=0.1, lambda_D=1.0, lambda_U=1.0):
    """
    policy_logps: log-probs do modelo treinável para o exemplo (não pareado)
    ref_logps:    log-probs do modelo de referência
    is_desirable: True se o exemplo é "good" (👍), False se é "bad" (👎)
    """
    # Reward implícito: log-ratio com referência
    rewards = beta * (policy_logps - ref_logps)

    # KL baseline (estimado em batch — não é par a par)
    kl = (policy_logps - ref_logps).mean().detach().clamp(min=0)

    if is_desirable:
        # Valor positivo se reward > kl
        value = lambda_D * (1 - torch.sigmoid(rewards - kl))
    else:
        # Aversão à perda: penaliza fortemente se reward > kl
        value = lambda_U * (1 - torch.sigmoid(kl - rewards))

    return value`}</CodeBlock>
        <Callout tone="warn">
          λ_D e λ_U controlam o tradeoff. Defaults λ_D = λ_U = 1 são neutros. Em datasets
          desbalanceados (90% positivos), usar λ_U &gt; λ_D para evitar que o modelo
          ignore os negativos minoritários.
        </Callout>
      </Section>

      <Section title="Comparação direta dos três" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'DPO', 'IPO', 'KTO']}
          rows={[
            ['Formato dataset', 'Pareado (chosen/rejected)', 'Pareado', 'Point-wise (good/bad)'],
            ['Loss base', 'log σ (BT)', 'MSE com margem', 'Asymmetric Prospect Theory'],
            ['Robustez a ruído', 'Baixa', 'Alta (regularizado)', 'Média (depende de λ)'],
            ['Velocidade convergência', 'Rápida', 'Média', 'Média'],
            ['Hiperparâmetros', 'β', 'β, τ', 'β, λ_D, λ_U'],
            ['Quando vence', 'Pareado limpo', 'Pareado ruidoso', 'Point-wise / desbalanceado'],
            ['Paper', 'Rafailov NeurIPS 2023', 'Azar 2023', 'Ethayarajh 2024'],
          ]}
        />
        <DecisionBox
          scenario="Você tem logs de produção com 👍/👎 dos usuários (não pareado), 85% positivos."
          winner="KTO com λ_U = 2.0, λ_D = 1.0"
          winnerColor={ACCENT}
          why="Dataset point-wise + desbalanceado é o cenário canônico do KTO. λ_U > λ_D faz o modelo prestar atenção aos 15% de negativos. DPO/IPO exigiriam pareamento sintético (caro e introduz vieses)."
          alternatives={[
            { name: 'Pareamento sintético + DPO', note: 'Funciona se você sintetizar pares de qualidade (good vs LLM-generated bad), mas custo extra' },
            { name: 'BCO ou SLiC-HF', note: 'Variantes mais novas, ainda menos testadas em produção' },
          ]}
        />
      </Section>

      <Section title="Família estendida em 2026" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Mai 2023', label: 'DPO', detail: 'Rafailov et al. NeurIPS 2023 — arxiv.org/abs/2305.18290', highlight: true },
            { when: 'Jul 2023', label: 'SLiC-HF', detail: 'Zhao et al., Google — hinge loss alternative' },
            { when: 'Out 2023', label: 'IPO', detail: 'Azar et al., DeepMind — arxiv.org/abs/2310.12036' },
            { when: 'Fev 2024', label: 'KTO', detail: 'Ethayarajh et al. — arxiv.org/abs/2402.01306' },
            { when: 'Mar 2024', label: 'ORPO', detail: 'Hong et al. — SFT + alignment numa loss só' },
            { when: 'Mai 2024', label: 'SimPO', detail: 'Meng et al. — sem referência (ref-free)' },
            { when: 'Set 2024', label: 'SPPO', detail: 'Wu et al. — self-play preference optimization' },
            { when: '2025', label: 'Online DPO', detail: 'Guo et al. DeepMind — DPO + on-policy regeneration' },
            { when: '2026', label: 'TRL unificou tudo', detail: 'DPOTrainer com loss_type configurável' },
          ]}
        />
      </Section>

      <Section title="Fluxo de decisão prático" accent={ACCENT}>
        <FlowDiagram
          accent={ACCENT}
          title="Qual algoritmo escolher?"
          orientation="vertical"
          steps={[
            { icon: '📊', label: 'Você tem dataset pareado?', desc: 'chosen/rejected separados' },
            { icon: '🔵', label: 'Sim, limpo → DPO', desc: 'Convergência rápida, simples' },
            { icon: '🟡', label: 'Sim, ruidoso → IPO', desc: 'MSE regulariza overfit' },
            { icon: '🟢', label: 'Não, point-wise → KTO', desc: 'Aversão à perda implícita' },
            { icon: '🟣', label: 'Online/agentic → Online DPO', desc: 'Regeneração on-policy' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso pular o SFT e ir direto pro DPO no modelo base?"
          a="Não recomendado. O paper original DPO mostrou que SFT inicial é necessário — sem ele, a referência π_ref tem suporte muito largo (modelo base aceita qualquer continuação) e a loss não converge. SFT funciona como 'pré-aquecimento' que ancora a distribuição."
        />
        <QAItem
          q="DPO 'duas vezes' funciona? (DPO → DPO com novo dataset)"
          a="Funciona, mas com cuidado: na segunda iteração, π_ref deve ser o modelo pós-primeiro-DPO, não o SFT original. Senão você está empurrando contra um SFT que já foi superado. Padrão Anthropic/OpenAI: iterative DPO com π_ref atualizada a cada round."
        />
        <QAItem
          q="DPO funciona com LoRA?"
          a="Sim, e é prática comum. LoRA adapter no policy, π_ref pode usar o modelo base congelado (sem LoRA). Reduz memória de 4× modelo (DPO) para ~1.2× modelo. TRL DPOTrainer + PEFT suporta nativamente."
        />
        <QAItem
          q="Existe DPO sem ref_model?"
          a="Sim — SimPO (Meng et al. 2024) eliminou π_ref usando length-normalized log-probs. Reduz memória pela metade. Trade-off: sem ancoragem do SFT, mais propenso a degradação de capabilities."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'DPO', v: 'Rafailov, Sharma, Mitchell, Ermon, Manning, Finn. "Direct Preference Optimization". NeurIPS 2023. arXiv:2305.18290' },
            { k: 'IPO', v: 'Azar et al. (DeepMind). "A General Theoretical Paradigm to Understand Learning from Human Preferences". arXiv:2310.12036 (2023)' },
            { k: 'KTO', v: 'Ethayarajh, Xu, Muennighoff, Jurafsky, Kiela. "KTO: Model Alignment as Prospect Theoretic Optimization". arXiv:2402.01306 (2024)' },
            { k: 'Prospect Theory', v: 'Kahneman & Tversky. "Prospect Theory: An Analysis of Decision under Risk". Econometrica 47:263–291 (1979)' },
            { k: 'TRL', v: 'github.com/huggingface/trl — DPOTrainer com loss_type configurável' },
            { k: 'SimPO', v: 'Meng et al. "SimPO: Simple Preference Optimization with a Reference-Free Reward". arXiv:2405.14734 (2024)' },
            { k: 'Online DPO', v: 'Guo et al. (DeepMind). "Direct Language Model Alignment from Online AI Feedback". arXiv:2402.04792 (2024)' },
          ]}
        />
      </Section>
    </div>
  );
}
