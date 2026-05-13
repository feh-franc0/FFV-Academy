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
  ArchFlow,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('rlhf-fundamentos-ppo');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o papel matemático da KL penalty na loss do PPO em RLHF?',
    options: [
      'Acelera o gradiente da policy para convergir mais rápido ao reward máximo',
      'Penaliza a divergência KL(π_θ || π_ref) entre a policy atual e a policy de referência (SFT), evitando que o modelo se afaste demais da distribuição original e exploite o reward model',
      'Substitui a função de advantage no estimator de gradiente',
      'É uma regularização L2 sobre os pesos do modelo de linguagem',
    ],
    correct: 1,
    explanation:
      'A KL penalty β·KL(π_θ || π_ref) é o regularizador anti-Goodhart do RLHF: π_ref é a policy do modelo SFT congelado e o coeficiente β (tipicamente 0.01–0.2) controla quanto o modelo pode se afastar dela. Sem essa penalty, o PPO encontra atalhos no reward model (reward hacking) e produz texto degenerado. Ver InstructGPT (Ouyang et al., NeurIPS 2022) equação 2 e o paper original "Fine-Tuning Language Models from Human Preferences" (Ziegler et al. 2019).',
  },
  {
    question: 'Por que o PPO usa clipping no objective ao invés do TRPO (Trust Region Policy Optimization)?',
    options: [
      'Porque o TRPO não funciona com modelos transformer',
      'Porque clipping aproxima a restrição de trust region sem precisar resolver um problema quadrático com restrição — substitui a constraint dura por um surrogate clipped L^CLIP = E[min(r·A, clip(r, 1-ε, 1+ε)·A)] que é first-order e otimizável com SGD/Adam',
      'Porque clipping garante convergência teórica para o ótimo global',
      'Porque o TRPO exige um critic separado e o PPO não',
    ],
    correct: 1,
    explanation:
      'PPO (Schulman et al. 2017, arxiv.org/abs/1707.06347) foi desenhado como aproximação first-order do TRPO. O termo clip(r, 1-ε, 1+ε) com ε ≈ 0.2 limita o ratio de probabilidade r = π_θ(a|s)/π_θ_old(a|s) e o min garante que o objective seja um lower bound pessimista — quando o advantage é positivo e r > 1+ε, pára de melhorar; quando A < 0 e r < 1-ε, pára de piorar. Resultado: trust region implícita sem cálculo de Hessiana.',
  },
  {
    question: 'O que caracteriza "reward hacking" em RLHF e qual é sua relação com a lei de Goodhart?',
    options: [
      'É quando um atacante externo manipula o reward model via prompt injection',
      'É o fenômeno onde a policy descobre comportamentos que maximizam o reward proxy (reward model) sem maximizar o objetivo humano subjacente — instância concreta da lei de Goodhart "when a measure becomes a target, it ceases to be a good measure"',
      'É um bug específico da implementação TRL da HuggingFace',
      'É overfitting da policy aos exemplos do dataset de preferências',
    ],
    correct: 1,
    explanation:
      'Reward hacking é o caso especial da lei de Goodhart aplicada a RL: o reward model é um proxy imperfeito do julgamento humano e a policy descobre regiões do espaço onde RM atribui score alto mas humanos não. Manifestações: respostas excessivamente longas, sycophancy, hedging exagerado, repetição de marcadores que o RM gosta. Mitigações: KL penalty alta, RM ensembles, RM com confidence calibration, eval humano contínuo. Ver Skalse et al. 2022 "Defining and Characterizing Reward Hacking".',
  },
  {
    question: 'No InstructGPT (Ouyang et al. 2022), qual o tamanho aproximado do dataset de preferências comparado ao SFT?',
    options: [
      'Preferências era 10× maior que SFT — exigiu 1M comparações pareadas',
      'SFT usou ~13k prompts com demonstrações; o dataset de preferências teve ~33k comparações K-way (K=4–9 por prompt) — totalizando ordens de magnitude menos exemplos que o pré-treinamento, mas suficiente para alinhar a distribuição',
      'Ambos tinham exatamente 100k exemplos por design',
      'O SFT não foi usado — apenas RLHF a partir do modelo base',
    ],
    correct: 1,
    explanation:
      'InstructGPT (Ouyang et al., "Training language models to follow instructions with human feedback", NeurIPS 2022) reportou ~13k prompts para SFT (demonstrações humanas) e ~33k prompts para o reward model, cada um com K=4–9 respostas rankeadas (gerando ~50k–200k comparações pareadas via K-choose-2). O insight chave: RLHF entrega ganhos massivos com 2–3 ordens de magnitude menos dados que pré-treinamento — porque é alinhamento de distribuição, não aquisição de conhecimento.',
  },
  {
    question: 'Por que o advantage estimator usa GAE (Generalized Advantage Estimation) ao invés do return cru?',
    options: [
      'GAE é mais simples de implementar',
      'GAE (Schulman et al. 2015) controla o tradeoff bias-variância via λ ∈ [0,1]: λ=0 dá TD(0) (baixa variância, alto bias); λ=1 dá Monte Carlo (alto variância, sem bias). Em RLHF tipicamente λ ≈ 0.95 — variance reduction crítica porque o gradiente de policy tem variância naturalmente alta',
      'GAE elimina a necessidade de um value network/critic',
      'GAE é exigido pelo algoritmo TRPO mas opcional no PPO',
    ],
    correct: 1,
    explanation:
      'Generalized Advantage Estimation (Schulman et al. 2015, arxiv.org/abs/1506.02438) define A_t^GAE(γ,λ) = Σ_{l=0}^∞ (γλ)^l δ_{t+l}, onde δ_t = r_t + γV(s_{t+1}) - V(s_t). O parâmetro λ interpola entre TD(0) e Monte Carlo. Em RLHF, com γ=1.0 (episódios curtos) e λ=0.95, GAE reduz drasticamente a variância do gradiente — essencial porque cada token gerado é um passo do MDP e o reward sparse só chega no fim do episódio.',
  },
  {
    question: 'Qual a função do "value head" adicionado ao LLM durante o PPO?',
    options: [
      'Calcula a probabilidade de cada token (substitui o softmax)',
      'É um critic: uma cabeça linear extra (geralmente sobre o último hidden state) treinada via MSE para estimar V(s) — o retorno esperado a partir do estado atual. É usado pelo GAE para calcular advantages e tem objective auxiliar L^VF na loss combinada',
      'Detecta tokens proibidos durante a geração',
      'Implementa o clipping da KL divergence',
    ],
    correct: 1,
    explanation:
      'O PPO em RLHF mantém uma arquitetura actor-critic compartilhada: o LLM faz duas predições por token — a distribuição de próxima palavra (actor) e o valor estimado V(s_t) (critic). O value head é tipicamente uma única camada linear sobre o último hidden state, treinada via L^VF = (V_θ(s_t) - V_t^target)² com V_t^target = retorno descontado. A loss total é L = L^CLIP - c_1·L^VF + c_2·H[π] onde H[π] é entropy bonus.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rlhf-fundamentos-ppo"
      title="RLHF do zero: PPO, KL penalty, reward hacking"
      icon="🎯"
      xp={80}
      readTime={16}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="rlaif-anthropic-claude"
      nextTitle="RLAIF / Constitutional AI: como Anthropic treina o Claude"
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
        RLHF (Reinforcement Learning from Human Feedback) é a técnica que transformou o GPT-3 em ChatGPT —
        e também o algoritmo mais incompreendido do alinhamento. Não é &quot;treinar com feedback humano&quot; de forma
        difusa: é uma pipeline RL específica com três etapas (SFT, reward model, PPO), uma loss matemática
        precisa e um conjunto de patologias bem documentadas. Este módulo entra na matemática de cada
        componente, com referências aos papers originais.
      </p>

      <Section title="A pipeline de três estágios" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O InstructGPT (Ouyang et al., NeurIPS 2022) cristalizou o pipeline canônico que ainda governa
          GPT-4, Claude, Llama-Instruct e Gemini em 2026 (com variações). Cada etapa tem um objetivo
          matemático distinto:
        </p>
        <FlowDiagram
          accent={ACCENT}
          title="Pipeline RLHF (InstructGPT, 2022)"
          steps={[
            { icon: '🧱', label: 'Pre-train', desc: 'LLM base via next-token prediction (não tocado)' },
            { icon: '✍️', label: 'SFT', desc: '~13k demos humanas, cross-entropy loss' },
            { icon: '⚖️', label: 'Reward Model', desc: '~33k preferências pareadas, Bradley-Terry loss' },
            { icon: '🎯', label: 'PPO', desc: 'Policy gradient + KL penalty contra SFT' },
          ]}
        />
        <Callout tone="info">
          O modelo SFT serve duplo papel: (1) ponto de partida para a policy do PPO (π_θ ← π_SFT) e
          (2) referência fixa π_ref usada na KL penalty. É a âncora de distribuição.
        </Callout>
      </Section>

      <Section title="Stage 2 — Reward Model: aprendendo preferências" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O reward model é um classificador escalar: dado (prompt, response), retorna r ∈ ℝ. É treinado
          via comparações pareadas usando a loss Bradley-Terry — modelagem clássica de preferências
          (Bradley &amp; Terry, Biometrika 1952) adaptada para LLMs por Christiano et al. 2017
          (&quot;Deep RL from Human Preferences&quot;, NeurIPS):
        </p>
        <AnnotatedFormula
          accent={ACCENT}
          title="Reward Model Loss (Bradley-Terry pareada)"
          formula="L_RM = -E[log σ(r_θ(x, y_w) - r_θ(x, y_l))]"
          parts={[
            { text: 'σ', annotation: 'sigmoid' },
            { text: 'r_θ', annotation: 'reward model (LLM com cabeça escalar)', highlight: true },
            { text: 'y_w', annotation: 'winner (resposta preferida)' },
            { text: 'y_l', annotation: 'loser (resposta rejeitada)' },
            { text: 'x', annotation: 'prompt comum' },
          ]}
        />
        <Callout tone="warn">
          O reward model é tipicamente inicializado a partir do SFT (mesma arquitetura, mesmos pesos)
          com a cabeça LM substituída por uma cabeça linear → ℝ. Para Claude e GPT-4, RMs têm tamanho
          comparável ao modelo policy. Tamanho do RM importa: RMs pequenos são fáceis de hackear.
        </Callout>
        <CodeBlock lang="python" filename="train_reward_model.py">{`# Pseudocódigo do RM training (TRL HuggingFace style)
import torch
import torch.nn.functional as F

def reward_loss(model, batch):
    # batch contém pares (chosen, rejected) com mesmo prompt
    rewards_chosen = model(batch["input_ids_chosen"]).logits  # [B, 1]
    rewards_rejected = model(batch["input_ids_rejected"]).logits  # [B, 1]

    # Bradley-Terry pareada
    loss = -F.logsigmoid(rewards_chosen - rewards_rejected).mean()

    # Margem de loss accuracy (diagnóstico, não otimizado)
    accuracy = (rewards_chosen > rewards_rejected).float().mean()
    return loss, accuracy
`}</CodeBlock>
      </Section>

      <Section title="Stage 3 — PPO: a loss completa" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          PPO foi proposto por Schulman et al. 2017 (&quot;Proximal Policy Optimization Algorithms&quot;,
          <InlineCode>arxiv.org/abs/1707.06347</InlineCode>) para resolver um problema do TRPO: cálculo
          custoso da trust region via problema quadrático com restrição. PPO substitui a restrição por
          um clipping na função objetivo — first-order, sem Hessiana, otimizável com Adam.
        </p>
        <AnnotatedFormula
          accent={ACCENT}
          title="PPO Clipped Objective (per-token)"
          formula="L^CLIP(θ) = E_t[ min(r_t(θ)·A_t, clip(r_t(θ), 1-ε, 1+ε)·A_t) ]"
          parts={[
            { text: 'r_t(θ)', annotation: 'π_θ(a_t|s_t) / π_θ_old(a_t|s_t) — ratio', highlight: true },
            { text: 'A_t', annotation: 'advantage estimado via GAE' },
            { text: 'ε', annotation: 'clipping range, tipicamente 0.2' },
            { text: 'min', annotation: 'lower bound pessimista' },
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em RLHF, a loss total combina o objective PPO com a KL penalty contra a referência SFT e um
          value function loss para o critic:
        </p>
        <AnnotatedFormula
          accent={ACCENT}
          title="RLHF PPO Loss Completa"
          formula="L = L^CLIP − c_1·L^VF + c_2·H[π_θ] − β·KL(π_θ || π_ref)"
          parts={[
            { text: 'L^CLIP', annotation: 'policy objective (acima)' },
            { text: 'L^VF', annotation: 'MSE do value head: (V_θ - V_target)²' },
            { text: 'H[π_θ]', annotation: 'entropy bonus (exploração)' },
            { text: 'β·KL', annotation: 'KL penalty anti-Goodhart', highlight: true },
            { text: 'π_ref', annotation: 'modelo SFT congelado' },
          ]}
        />
        <Callout tone="info">
          O β da KL penalty é o hiperparâmetro mais sensível do RLHF. β baixo (0.001) → policy
          se afasta muito, reward hacking. β alto (0.5) → policy mal sai do SFT, ganho marginal.
          InstructGPT usou β=0.02. Implementações modernas usam adaptive KL controller (Ziegler et al. 2019).
        </Callout>
      </Section>

      <Section title="Implementação prática: TRL e DeepSpeed-Chat" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em 2026 as duas referências open-source são <InlineCode>trl</InlineCode> da HuggingFace
          (<InlineCode>github.com/huggingface/trl</InlineCode>) e DeepSpeed-Chat da Microsoft.
          Ambas implementam PPO + KL adaptativo + value head sobre transformers.
        </p>
        <CodeBlock lang="python" filename="ppo_rlhf.py">{`from trl import PPOTrainer, PPOConfig, AutoModelForCausalLMWithValueHead
from transformers import AutoTokenizer
import torch

# Modelo policy com value head adicionada
policy = AutoModelForCausalLMWithValueHead.from_pretrained("sft-model")
ref_model = AutoModelForCausalLMWithValueHead.from_pretrained("sft-model")  # frozen
reward_model = AutoModelForSequenceClassification.from_pretrained("reward-model")
tokenizer = AutoTokenizer.from_pretrained("sft-model")

config = PPOConfig(
    model_name="sft-model",
    learning_rate=1e-5,
    batch_size=128,
    mini_batch_size=4,
    ppo_epochs=4,            # K épocas por batch (clipping importa aqui)
    cliprange=0.2,           # ε do PPO
    cliprange_value=0.2,     # clipping do value
    vf_coef=0.1,             # c_1
    init_kl_coef=0.2,        # β inicial (adaptativo)
    target_kl=6.0,           # alvo do KL controller
    gamma=1.0,
    lam=0.95,                # λ do GAE
)

trainer = PPOTrainer(config, policy, ref_model, tokenizer)

for batch in dataloader:
    # 1. Sample da policy
    query_tensors = batch["input_ids"]
    response_tensors = trainer.generate(query_tensors, max_new_tokens=200)

    # 2. Compute rewards via reward model
    texts = [tokenizer.decode(r) for r in response_tensors]
    rewards = [reward_model(t).logits[0] for t in texts]

    # 3. PPO step (computa advantage via GAE, aplica clipping, KL penalty)
    stats = trainer.step(query_tensors, response_tensors, rewards)
    print(f"kl={stats['objective/kl']:.3f} reward={stats['ppo/mean_scores']:.3f}")
`}</CodeBlock>
      </Section>

      <Section title="Reward hacking: a lei de Goodhart aplicada" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          &quot;When a measure becomes a target, it ceases to be a good measure&quot; (Charles Goodhart, 1975).
          O reward model é um proxy do julgamento humano — não o julgamento em si. Quando a policy
          tem capacidade de otimização suficiente, encontra regiões de alto reward que humanos
          não validariam. Skalse et al. 2022 (&quot;Defining and Characterizing Reward Hacking&quot;,
          NeurIPS) formalizou o fenômeno.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sintoma observado', 'Causa provável', 'Mitigação']}
          rows={[
            ['Respostas excessivamente longas', 'RM correlaciona length com qualidade', 'Length normalization no reward'],
            ['Sycophancy ("você está certo!")', 'Raters humanos preferem concordância', 'Diversidade de raters, contrastive data'],
            ['Hedging exagerado ("pode ser que...")', 'RM premia respostas defensivas', 'KL alta + curadoria de raters'],
            ['Repetição de keywords ("vamos analisar")', 'Pattern de open-class no RM', 'RM ensembles com voting'],
            ['Recusa excessiva', 'Harmlessness RM domina helpfulness RM', 'Tradeoff explícito (Constitutional AI)'],
          ]}
        />
        <DecisionBox
          scenario="Você observa que reward aumenta ao longo do treino mas eval humano piora — clássico do reward hacking começando."
          winner="Aumentar β da KL penalty + adicionar eval humano contínuo"
          winnerColor={ACCENT}
          why="A divergência entre proxy (RM) e objetivo (humano) é o sinal definitivo de hacking. KL maior ancora a policy ao SFT. Eval humano em loop pega o problema antes do modelo ficar não-recuperável."
          alternatives={[
            { name: 'Reduzir learning rate', note: 'Adia o hacking mas não previne — só te dá tempo de detectar' },
            { name: 'Ensemble de RMs', note: 'Reduz variância do reward, dificulta atalhos mas custa 2–4× mais' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo do RLHF" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: '2017', label: 'PPO — Schulman et al.', detail: 'Proximal Policy Optimization, OpenAI. arxiv.org/abs/1707.06347' },
            { when: '2017', label: 'Deep RL from Human Preferences', detail: 'Christiano et al. (OpenAI/DeepMind), NeurIPS — primeira aplicação de RLHF moderno' },
            { when: '2019', label: 'Fine-Tuning LMs from Human Preferences', detail: 'Ziegler et al., aplica RLHF a GPT-2 — embrião do InstructGPT' },
            { when: '2020', label: 'Learning to Summarize from Feedback', detail: 'Stiennon et al., RLHF para sumarização, primeira melhoria clara via RLHF' },
            { when: '2022', label: 'InstructGPT', detail: 'Ouyang et al., NeurIPS — pipeline SFT+RM+PPO canonizado, base do ChatGPT', highlight: true },
            { when: '2022', label: 'Constitutional AI', detail: 'Bai et al. (Anthropic), introduz RLAIF — feedback de AI em vez de humano' },
            { when: '2023', label: 'DPO', detail: 'Rafailov et al., NeurIPS — alinhamento sem reward model explícito' },
            { when: '2025', label: 'GRPO / DeepSeek-R1', detail: 'Group Relative Policy Optimization desbloqueia reasoning emergente' },
          ]}
        />
      </Section>

      <Section title="Arquitetura de runtime no PPO step" accent={ACCENT}>
        <ArchFlow
          accent={ACCENT}
          title="Componentes ativos durante 1 step PPO"
          columns={[
            {
              header: 'Modelos',
              items: [
                'Policy π_θ — LLM treinável (actor + value head)',
                'Reference π_ref — SFT congelado (KL penalty)',
                'Reward model — classificador escalar, frozen',
                'Value V_φ (shared) — cabeça linear sobre policy',
              ],
            },
            {
              header: 'Computação por step',
              items: [
                '1. Rollout — sample responses de π_θ_old',
                '2. Score — r = RM(prompt, response) − β·KL',
                '3. Advantage — A_t via GAE(γ=1, λ=0.95)',
                '4. PPO update — K épocas, clipping ε=0.2',
              ],
            },
            {
              header: 'Memória',
              items: [
                '~4× LLM size — π_θ + π_ref + RM + optimizer states',
                'Activation checkpoint — obrigatório para 7B+',
                'FSDP / ZeRO-3 — sharding para 70B',
                'vLLM rollout — generation 5–10× faster',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'RLHF vs SFT puro?', v: 'SFT ensina formato/estilo; RLHF otimiza para preferências comparativas que humanos têm dificuldade de demonstrar diretamente (ex.: "qual das duas é melhor?")' },
            { k: 'Custo computacional?', v: 'PPO consome 4× memória do modelo (policy + ref + RM + critic) e 3–5× compute do SFT. Para 70B: facilmente 256 GPUs A100 por dias' },
            { k: 'Reward é por token ou por sequência?', v: 'Reward é por sequência (no token de EOS), distribuído via GAE backward. KL penalty é por token' },
            { k: 'Posso pular o reward model?', v: 'Sim — DPO (próximos módulos) formula tudo como classificação direta sobre preferências, sem RM explícito' },
          ]}
        />
        <QAItem
          q="Por que PPO e não Q-learning ou DDPG?"
          a="Espaço de ação em LLM é discreto e gigantesco (vocab ≈ 50k tokens). Q-learning seria intratável (tabela Q gigante). Policy gradient methods como PPO escalam naturalmente — a policy é o próprio LLM. DDPG é para ação contínua, não se aplica."
        />
        <QAItem
          q="Por que 4 épocas de PPO por batch?"
          a="O clipping de PPO assume que π_θ_old ≈ π_θ. Reuso de dados (K=4 épocas) acelera sample efficiency, mas K muito alto faz o ratio escapar do clipping range e degrada — Schulman 2017 reportou K=3–10 como sweet spot."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'PPO', v: 'Schulman, Wolski, Dhariwal, Radford, Klimov. "Proximal Policy Optimization Algorithms". arXiv:1707.06347 (2017)' },
            { k: 'InstructGPT', v: 'Ouyang et al. "Training language models to follow instructions with human feedback". NeurIPS 2022' },
            { k: 'GAE', v: 'Schulman, Moritz, Levine, Jordan, Abbeel. "High-Dimensional Continuous Control Using Generalized Advantage Estimation". arXiv:1506.02438 (2015)' },
            { k: 'Reward Hacking', v: 'Skalse et al. "Defining and Characterizing Reward Hacking". NeurIPS 2022' },
            { k: 'Deep RL from Preferences', v: 'Christiano et al. "Deep reinforcement learning from human preferences". NeurIPS 2017' },
            { k: 'TRL', v: 'github.com/huggingface/trl — implementação canônica em PyTorch' },
            { k: 'Adaptive KL', v: 'Ziegler et al. "Fine-Tuning Language Models from Human Preferences". arXiv:1909.08593 (2019)' },
          ]}
        />
      </Section>
    </div>
  );
}
