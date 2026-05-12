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
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('grpo-deepseek-r1');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que torna o GRPO (Group Relative Policy Optimization) distinto do PPO?',
    options: [
      'GRPO usa um actor maior que o critic',
      'GRPO elimina o value network (critic). Para cada prompt, sample G respostas (group), computa rewards, e usa a vantagem normalizada dentro do grupo: A_i = (r_i − média_grupo) / std_grupo. Substitui V(s) por baseline empírico do grupo — economia massiva de memória e sem critic training',
      'GRPO usa SAC em vez de policy gradient',
      'GRPO requer reward model duas vezes maior que policy',
    ],
    correct: 1,
    explanation:
      'GRPO foi introduzido no paper DeepSeekMath (Shao et al., DeepSeek 2024) e popularizado no DeepSeek-R1 (Jan 2025, arxiv.org/abs/2501.12948). Idea central: dispensar value network calculando advantage relativo dentro de um grupo de G respostas (tipicamente G=16–64) ao mesmo prompt. A_i = (r_i − mean(r_1..G)) / std(r_1..G). Sem critic = ~50% memória economizada vs PPO + sem treino de value head.',
  },
  {
    question: 'Por que o DeepSeek-R1-Zero foi um marco histórico no início de 2025?',
    options: [
      'Foi o primeiro modelo a usar Mixture of Experts',
      'Foi o primeiro modelo público a desenvolver reasoning emergente (chain-of-thought, self-correction, aha-moments) treinado puramente via RL com reward simples baseado em regras (correctness do output + format) — sem SFT inicial, sem reward model neural, sem human feedback. Mostrou que reasoning emerge espontaneamente sob pressão de otimização suficiente',
      'Bateu GPT-4 em benchmarks com 1B parâmetros',
      'Foi treinado em uma única GPU',
    ],
    correct: 1,
    explanation:
      'DeepSeek-R1-Zero (paper jan/2025) treinou DeepSeek-V3-Base diretamente com GRPO usando reward rule-based (verificador de resposta correta + verificador de format <think></think>) — sem SFT, sem RM neural, sem feedback humano. Durante o treino, o modelo desenvolveu espontaneamente chains of thought longas, self-verification, "aha moments" onde reescreve seu próprio raciocínio. Resultado: AIME pass@1 saltou de 15% para 71%. Provou que reasoning emerge de pressão de otimização + reward verificável.',
  },
  {
    question: 'Por que a DeepSeek ainda lançou o R1 (não-Zero) com SFT inicial?',
    options: [
      'O R1-Zero não funcionava direito',
      'R1-Zero tinha dois problemas: (1) outputs frequentemente misturavam idiomas (chinês + inglês no mesmo CoT), (2) legibilidade ruim. O R1 (final) usou pipeline em 4 estágios: (1) cold-start SFT em CoTs curados, (2) GRPO reasoning-focused, (3) rejection sampling + SFT, (4) GRPO final all-scenarios. R1-Zero permanece relevante como prova de conceito',
      'Para reduzir o custo de inferência',
      'Por exigência regulatória chinesa',
    ],
    correct: 1,
    explanation:
      'O paper DeepSeek-R1 (jan/2025) descreve o pipeline em 4 etapas: (1) Cold-start SFT — alguns milhares de CoTs longos curados resolvem language mixing e legibilidade; (2) Reasoning-RL — GRPO com reward rule-based (math, code, logic verificáveis); (3) Rejection Sampling + SFT — gera CoTs do modelo pós-RL, filtra os corretos, mescla com dados de outras tasks para SFT amplo; (4) RL final — GRPO em todos os cenários incluindo helpfulness/harmlessness. R1-Zero é só a etapa 2 isolada.',
  },
  {
    question: 'Como Unsloth e Axolotl viabilizaram reprodução acessível de GRPO em 2025?',
    options: [
      'Removeram a necessidade de KL penalty',
      'Implementaram GRPO com otimizações de memória (gradient checkpointing agressivo, sequence packing, vLLM rollout), permitindo rodar GRPO em modelos 7B–14B numa única GPU H100 (80GB). Unsloth publicou notebooks com Qwen2.5-7B reproduzindo aha-moments em ~4h de treino',
      'Re-implementaram tudo em Rust',
      'Substituíram o tokenizer por byte-pair',
    ],
    correct: 1,
    explanation:
      'Unsloth (github.com/unslothai/unsloth) lançou em fev/2025 notebooks "GRPO from scratch" rodando Qwen2.5-7B em H100 80GB com vLLM para rollouts paralelos. Axolotl (github.com/OpenAccess-AI-Collective/axolotl) adicionou suporte nativo a GRPO via TRL backend. Combinadas com sequence packing e grouped rollouts (16 respostas/prompt amortizam KV-cache), trouxeram o custo de reprodução de "exclusivo de big lab" para "$50 cloud GPU".',
  },
  {
    question: 'Qual a função das tags <think></think> no DeepSeek-R1?',
    options: [
      'São apenas decorações de formato',
      'São separadores estruturais entre raciocínio interno e resposta final. Durante o treino, o reward de format verifica que a resposta tenha <think>...</think> antes do output final, forçando o modelo a expor seu CoT. Em inferência, permite ao usuário decidir mostrar/ocultar o thinking — paralelo direto com o "extended thinking" do Claude e os "reasoning tokens" do o1',
      'São limites de janela de contexto',
      'São tokens especiais que ativam GPU tensor cores',
    ],
    correct: 1,
    explanation:
      'Os tokens <think> e </think> no DeepSeek-R1 são estruturais: o reward de format do GRPO inclui uma verificação regex de que o output tenha exatamente um par <think>...</think> antes da resposta final. Durante o treino, o modelo aprende que respostas mal formatadas têm reward 0. Em inferência, isso permite mostrar ou ocultar o CoT — comportamento idêntico ao "reasoning_content" da API OpenAI o1 e ao "extended thinking" da Anthropic.',
  },
  {
    question: 'Por que o reward rule-based (sem RM neural) foi essencial pro R1-Zero?',
    options: [
      'Para reduzir custo computacional',
      'Reward neural treinado em preferências humanas é facilmente hackeável quando o modelo tem capacidade de reasoning longo — o modelo descobre padrões textuais que enganam o RM sem resolver o problema. Reward rule-based (output correto? sim/não via verificador determinístico) é não-hackeável: para receber reward, precisa realmente resolver. Isso forçou o modelo a internalizar reasoning real',
      'Porque GPUs chinesas não suportavam RM',
      'Por restrição de licenciamento',
    ],
    correct: 1,
    explanation:
      'O insight chave do R1-Zero: rewards rule-based (matemática verificável, código que passa testes, lógica formal) são determinísticos e não-hackeáveis. O modelo não pode ganhar reward inventando uma resposta plausível — precisa que a resposta seja literalmente correta. Sob essa pressão de otimização extrema + GRPO sem critic, reasoning emergiu. RMs neurais teriam sido hackeados muito antes do reasoning emergir.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="grpo-deepseek-r1"
      title="GRPO e DeepSeek-R1: o salto reasoning de 2025"
      icon="🚀"
      xp={80}
      readTime={16}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="reasoning-models-internals"
      nextTitle="Reasoning models por dentro: o1, o3, R1, Gemini Thinking"
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
        Em 20 de janeiro de 2025, a DeepSeek lançou o R1 — e a comunidade descobriu que o &quot;segredo&quot;
        do o1 da OpenAI não exigia bilhões em P&amp;D fechada. GRPO (Group Relative Policy Optimization)
        + reward rule-based + paciência computacional bastam para desbloquear reasoning emergente.
        Este módulo destrincha o algoritmo, o paper e como reproduzir em 2026.
      </p>

      <Section title="O paper que mudou o mercado" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning
          (DeepSeek-AI, jan 2025 — <InlineCode>arxiv.org/abs/2501.12948</InlineCode>). Pontos-chave:
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'R1-Zero', v: 'V3-Base + GRPO + reward rule-based. SEM SFT, SEM RM neural, SEM human feedback. AIME pass@1: 15% → 71%.' },
            { k: 'R1 (final)', v: 'Pipeline 4-estágios: cold SFT → GRPO reasoning → rejection sampling + SFT → GRPO all-scenarios.' },
            { k: 'Distilação', v: 'CoTs do R1 destilados para Qwen-7B, 14B, 32B; Llama-70B. Modelos pequenos chegam perto do R1 em math.' },
            { k: 'Open weights', v: 'Pesos publicados sob MIT license — primeira vez que reasoning state-of-the-art ficou acessível.' },
            { k: 'Custo de treino', v: 'Estimado em $5–6M, ordem(s) de magnitude menos que GPT-4-class.' },
          ]}
        />
      </Section>

      <Section title="GRPO: a equação central" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          GRPO foi formalizado em DeepSeekMath (Shao et al. 2024). Para cada prompt q, sample G
          respostas {'{o_1, ..., o_G}'} de π_old, compute rewards {'{r_1, ..., r_G}'}, normalize
          dentro do grupo, otimize loss PPO-like com KL penalty contra π_ref:
        </p>
        <AnnotatedFormula
          accent={ACCENT}
          title="GRPO Advantage (sem critic)"
          formula="A_i = (r_i − mean(r_1..r_G)) / std(r_1..r_G)"
          parts={[
            { text: 'A_i', annotation: 'advantage da resposta i no grupo', highlight: true },
            { text: 'mean/std', annotation: 'estatísticas do GRUPO (não buffer)' },
            { text: 'G', annotation: 'group size, 16–64 típico' },
          ]}
        />
        <AnnotatedFormula
          accent={ACCENT}
          title="GRPO Loss completa"
          formula="L_GRPO = E_q,{o_i}[ (1/G)·Σ min(r_i·A_i, clip(r_i, 1-ε, 1+ε)·A_i) − β·KL(π_θ || π_ref) ]"
          parts={[
            { text: 'r_i', annotation: 'ratio π_θ/π_old (PPO style)' },
            { text: 'clip ε', annotation: 'tipicamente 0.2', highlight: true },
            { text: 'β·KL', annotation: 'penalty contra referência' },
            { text: 'Σ/G', annotation: 'média sobre o grupo' },
          ]}
        />
        <Callout tone="info">
          A diferença vs PPO: sem L^VF (não há value head), sem GAE (advantage é direto do grupo).
          Em troca, exige G respostas por prompt — mas elas são processadas em paralelo (vLLM)
          amortizando KV-cache.
        </Callout>
      </Section>

      <Section title="Reward rule-based: o que é verificável" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Domínio', 'Verificador', 'Reward']}
          rows={[
            ['Math (AIME, MATH, GSM8K)', 'sympy parsing + comparação exata', '+1 se correto, 0 caso contrário'],
            ['Code (LiveCodeBench)', 'sandboxed execution + unit tests', '+1 se todos passam, 0 senão'],
            ['Lógica formal', 'theorem prover (Lean, Coq, Isabelle)', '+1 se prova é aceita'],
            ['Format', 'regex de tags <think></think>', '+0.1 se formato correto'],
            ['Helpfulness (R1 etapa 4)', 'RM neural treinado em preferences', 'score contínuo do RM'],
          ]}
        />
        <Callout tone="warn">
          Reward rule-based só funciona em domínios verificáveis. Para tasks subjetivas
          (criatividade, escrita, conversa), você precisa de RM neural — e aí volta o risco de
          reward hacking. R1 mistura: rule-based no reasoning, RM neural no SFT/etapa-4.
        </Callout>
      </Section>

      <Section title="Pipeline DeepSeek-R1 completo" accent={ACCENT}>
        <FlowDiagram
          accent={ACCENT}
          title="4 estágios do R1"
          orientation="vertical"
          steps={[
            { icon: '❄️', label: 'Stage 1 — Cold Start SFT', desc: 'Milhares de CoTs longos curados (resolve language mixing)' },
            { icon: '🧠', label: 'Stage 2 — Reasoning GRPO', desc: 'Math/code/logic com reward rule-based' },
            { icon: '🔁', label: 'Stage 3 — Rejection Sampling + SFT', desc: 'Modelo pós-RL gera, filtra CoTs corretos, SFT amplo' },
            { icon: '✨', label: 'Stage 4 — GRPO All-Scenarios', desc: 'Final RL incluindo helpfulness/harmlessness' },
          ]}
        />
        <StackFlow
          accent={ACCENT}
          title="Diferenças R1-Zero vs R1"
          items={[
            { label: 'R1-Zero', detail: 'Apenas Stage 2 isolado — prova de conceito, problemas de legibilidade e language mixing' },
            { label: 'R1', detail: 'Pipeline completo 4-estágios — qualidade de produção, mas mais complexo de reproduzir' },
            { label: 'R1-Distill-Qwen-7B', detail: 'Qwen2.5-7B fine-tuned em ~800k CoTs do R1 — sem RL, só SFT. Performance impressionante em math' },
            { label: 'R1-Distill-Llama-70B', detail: 'Llama-3.3-70B fine-tuned em CoTs do R1 — bate Llama-70B-Instruct nos benchmarks de math' },
          ]}
        />
      </Section>

      <Section title="Reproduzindo R1-Zero com Unsloth" accent={ACCENT}>
        <CodeBlock lang="python" filename="grpo_unsloth.py">{`# Reprodução R1-Zero estilo Qwen2.5-7B em H100 80GB
# Baseado em unsloth.ai/blog/r1-reasoning (fev/2025)

from unsloth import FastLanguageModel, PatchFastRL
PatchFastRL("GRPO", FastLanguageModel)

from datasets import load_dataset
from trl import GRPOConfig, GRPOTrainer
import re

# 1. Modelo base
model, tokenizer = FastLanguageModel.from_pretrained(
    "Qwen/Qwen2.5-7B-Instruct",
    max_seq_length=2048,
    load_in_4bit=False,
    fast_inference=True,           # habilita vLLM rollout
    max_lora_rank=64,
    gpu_memory_utilization=0.6,
)

# 2. Dataset matemático verificável (GSM8K)
dataset = load_dataset("openai/gsm8k", "main", split="train")

def format_prompt(example):
    return {
        "prompt": [
            {"role": "system", "content": "Responda em <think>...</think> seguido da resposta final."},
            {"role": "user", "content": example["question"]},
        ],
        "answer": example["answer"].split("####")[-1].strip(),
    }

dataset = dataset.map(format_prompt)

# 3. Reward functions (rule-based)
def correctness_reward(prompts, completions, answer, **kwargs):
    rewards = []
    for completion, ref in zip(completions, answer):
        text = completion[0]["content"]
        match = re.search(r"</think>\\s*(.+)", text, re.DOTALL)
        if match and match.group(1).strip() == ref:
            rewards.append(1.0)
        else:
            rewards.append(0.0)
    return rewards

def format_reward(completions, **kwargs):
    pattern = r"<think>.+?</think>.+"
    return [0.5 if re.search(pattern, c[0]["content"], re.DOTALL) else 0.0
            for c in completions]

# 4. GRPO config
config = GRPOConfig(
    output_dir="qwen-grpo",
    learning_rate=5e-6,
    num_generations=16,        # G do grupo
    max_prompt_length=512,
    max_completion_length=1024,
    per_device_train_batch_size=1,
    gradient_accumulation_steps=4,
    num_train_epochs=1,
    beta=0.04,                 # KL penalty
)

trainer = GRPOTrainer(
    model=model,
    reward_funcs=[correctness_reward, format_reward],
    args=config,
    train_dataset=dataset,
    tokenizer=tokenizer,
)
trainer.train()`}</CodeBlock>
        <Callout tone="info">
          Em ~4–8h numa H100, esse loop reproduz qualitativamente os &quot;aha moments&quot;:
          após algumas centenas de steps, o modelo começa a escrever CoTs mais longos, voltar
          atrás e reescrever, e o reward de correctness no GSM8K sobe de ~60% para ~85%+.
        </Callout>
      </Section>

      <Section title="DPO/PPO/GRPO — comparativo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'PPO (RLHF)', 'DPO', 'GRPO']}
          rows={[
            ['Reward Model', 'Neural, treinado', 'Implícito (sem RM)', 'Rule-based ou Neural'],
            ['Value/Critic', 'Sim (value head)', 'Não', 'Não (group baseline)'],
            ['Rollouts on-policy', 'Sim', 'Não (off-policy)', 'Sim (grupo de G)'],
            ['Memória relativa', '4× modelo', '2× modelo', '~2× modelo'],
            ['Hackeável?', 'Sim (RM hack)', 'Limitado', 'Não (se rule-based)'],
            ['Reasoning emergente', 'Não tipicamente', 'Não', 'Sim (R1-Zero)'],
            ['Custo total', 'Alto', 'Baixo', 'Médio'],
          ]}
        />
        <DecisionBox
          scenario="Você quer um modelo melhor em matemática/código. Tem GPUs e dataset verificável."
          winner="GRPO com reward rule-based"
          winnerColor={ACCENT}
          why="Domínios verificáveis (math, code, logic) são exatamente onde GRPO brilha. Reward não-hackeável + group advantage sem critic = reasoning emerge. Dispense PPO complexity."
          alternatives={[
            { name: 'SFT em CoTs do R1', note: 'Distilação direta — mais rápido, mas teto de capacidade limitado ao R1' },
            { name: 'DPO em pares (CoT bom vs CoT ruim)', note: 'Funciona mas exige curadoria pareada — caro' },
          ]}
        />
      </Section>

      <Section title="Linha do tempo" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Set 2024', label: 'OpenAI o1 lançado', detail: 'Primeira reasoning model pública — método fechado' },
            { when: 'Out 2024', label: 'DeepSeekMath (GRPO)', detail: 'Shao et al. — formalização do GRPO em math' },
            { when: 'Dez 2024', label: 'DeepSeek-V3', detail: 'Base model open-source 671B MoE (37B active)' },
            { when: 'Jan 2025', label: 'DeepSeek-R1 + R1-Zero', detail: 'Reasoning open-source SOTA — paper 2501.12948', highlight: true },
            { when: 'Fev 2025', label: 'Unsloth GRPO notebooks', detail: 'Reprodução em 1 GPU acessível para todos' },
            { when: 'Mar 2025', label: 'Open-R1 (HuggingFace)', detail: 'Reprodução comunitária completa do pipeline' },
            { when: 'Mai 2025', label: 'Qwen-QwQ, Kimi-k1.5', detail: 'Outros labs adotam GRPO + rule-based reward' },
            { when: '2026', label: 'GRPO mainstream', detail: 'Padrão da indústria para reasoning training' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="GRPO funciona em tasks sem verificador rule-based?"
          a="Sim, mas perde a vantagem principal. Com reward neural, GRPO ainda economiza memória (sem critic) e tem variance lower que PPO (group baseline). Mas você perde a propriedade não-hackeável e os 'aha moments' emergentes ficam mais raros."
        />
        <QAItem
          q="Por que group size = 16–64 e não 4 ou 256?"
          a="G muito pequeno (4): std do grupo tem alta variância, advantage estimate instável. G muito grande (256+): custo de rollout cresce linear, ganho marginal de variância pequeno. Sweet spot 16–64 balanceia variância vs custo. DeepSeek-R1 paper reportou G=16."
        />
        <QAItem
          q="GRPO precisa de SFT antes?"
          a="R1-Zero provou que NÃO precisa — mas pagou em legibilidade. Para produção, fazer cold-start SFT em milhares de CoTs curados (~$1k de annotators) resolve language mixing e melhora ergonomia do output. R1 (final) usa cold SFT."
        />
        <QAItem
          q="Existe limite teórico para reasoning emergente via GRPO?"
          a="Não claro ainda. Como toda emergência, parece depender de (1) capacidade do base model, (2) qualidade do reward signal, (3) compute budget. Modelos 7B com GRPO atingem ~80% AIME; 70B+ vão além de 90%. Limite parece superior a humano em domínios verificáveis."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'DeepSeek-R1', v: 'DeepSeek-AI. "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning". arXiv:2501.12948 (Jan 2025)' },
            { k: 'DeepSeekMath (GRPO)', v: 'Shao et al. "DeepSeekMath: Pushing the Limits of Mathematical Reasoning in Open Language Models". arXiv:2402.03300 (2024)' },
            { k: 'DeepSeek-V3', v: 'DeepSeek-AI. "DeepSeek-V3 Technical Report". arXiv:2412.19437 (Dez 2024)' },
            { k: 'Unsloth GRPO', v: 'unsloth.ai/blog/r1-reasoning — notebooks reprodução' },
            { k: 'Open-R1', v: 'github.com/huggingface/open-r1 — reprodução comunitária' },
            { k: 'TRL GRPO', v: 'github.com/huggingface/trl — GRPOTrainer oficial' },
            { k: 'Pesos abertos R1', v: 'huggingface.co/deepseek-ai/DeepSeek-R1 — licença MIT' },
          ]}
        />
      </Section>
    </div>
  );
}
