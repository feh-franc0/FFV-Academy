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

export const metadata = getModuleMetadata('modelos-de-raciocinio');

const ACCENT = '#818cf8';

const quiz: QuizQuestion[] = [
  {
    question: 'O que fundamentalmente diferencia modelos de raciocínio (o1, DeepSeek-R1) de LLMs padrão?',
    options: [
      'Modelos de raciocínio têm mais parâmetros e mais dados de treinamento',
      'Modelos de raciocínio dedicam tokens de "thinking" antes da resposta final — o modelo realiza Chain-of-Thought interno extenso via RLHF/MCTS, explorando múltiplos caminhos de raciocínio antes de comprometer com uma resposta',
      'A diferença é apenas de velocidade — modelos de raciocínio são mais lentos por design',
      'Modelos de raciocínio usam uma arquitetura diferente (não-transformer)',
    ],
    correct: 1,
    explanation:
      'LLMs padrão mapeiam diretamente prompt → resposta. Modelos de raciocínio (o1, o3, DeepSeek-R1, Claude Extended Thinking) treinam o modelo para realizar CoT longo internamente via RL (GRPO, PPO) ou MCTS. O modelo aprende a "pensar" antes de responder — explorando, retrocedendo, verificando. O thinking pode ter 1k-50k tokens de raciocínio antes de 100 tokens de resposta final. Isso explica o custo muito maior.',
  },
  {
    question: 'Como o DeepSeek-R1 foi treinado e por que é significativo?',
    options: [
      'DeepSeek-R1 foi treinado com o mesmo método que o o1 da OpenAI — não há diferença',
      'DeepSeek-R1 usou GRPO (Group Relative Policy Optimization) puro em um modelo base, sem SFT de partida — emergência de CoT longo apenas via RL com feedback de correção. É significativo por ser open weights (Apache 2.0), custo de treinamento ~6M USD, e performance comparável ao o1 da OpenAI',
      'DeepSeek-R1 é apenas uma versão quantizada do GPT-4 da OpenAI',
      'DeepSeek-R1 usa um banco de dados externo para verificar respostas durante a geração',
    ],
    correct: 1,
    explanation:
      'DeepSeek-R1 (Jan 2025) demonstrou que raciocínio extenso emerge via RL puro sem SFT de cold-start, embora a versão final use SFT como warmup. Treinou em DeepSeek-V3 (671B MoE) com GRPO. O custo de ~$6M impressionou pelo resultado — comparável ao o1 em math/code benchmarks. Mais importante: é open weights (Apache 2.0), destilados disponíveis (DeepSeek-R1-Distill-Llama-8B e 70B) que trazem capacidade de raciocínio para hardware consumer.',
  },
  {
    question: 'O que é Claude Extended Thinking e como ativar?',
    options: [
      'Extended Thinking é simplesmente um System Prompt mais longo no Claude',
      'É o modo de raciocínio do Claude que dedica tokens de thinking antes da resposta — ativado via budget_tokens no parâmetro thinking. O thinking é visível como bloco separado, permitindo inspecionar o raciocínio. Budget de 1k-64k thinking tokens; custo conta como tokens de output (mais caros)',
      'Extended Thinking requer um plano especial da Anthropic não disponível via API pública',
      'É uma feature exclusiva do Claude Code que não está disponível na Messages API',
    ],
    correct: 1,
    explanation:
      'Claude Extended Thinking (claude-3-7-sonnet e claude-opus-4) é ativado com thinking: {"type": "enabled", "budget_tokens": N}. O thinking apareçe como um bloco content separado do tipo "thinking". Características: (1) thinking tokens são cobrados como output (mais caros que input); (2) O thinking interno pode explorar múltiplos caminhos; (3) Você pode inspecionar o raciocínio para debugging; (4) Budget de 1k a 64k tokens de thinking para calibrar custo vs qualidade.',
  },
  {
    question: 'Quando modelos de raciocínio valem o custo adicional?',
    options: [
      'Sempre — modelos de raciocínio são superiores em todos os casos',
      'Em tasks que requerem busca sistemática no espaço de soluções: matemática avançada (provas, olimpíadas), código complexo (debugging de algoritmos, design de sistemas), lógica formal com múltiplas restrições, e pesquisa científica. Para tasks diretas (Q&A factual, sumarização, classificação), LLMs padrão têm custo 10-100× menor com qualidade similar',
      'Apenas quando o usuário paga um plano premium — não há diferença técnica para usuários gratuitos',
      'Modelos de raciocínio são melhores apenas em tarefas de programação em Python',
    ],
    correct: 1,
    explanation:
      'Modelos de raciocínio têm custo 5-50× maior que LLMs padrão (thinking tokens + resposta). Valem o custo em: (1) Problemas com solução verificável onde o raciocínio pode ser validado (matemática, código que passa em testes); (2) Tasks onde erro é caro (decisões financeiras, diagnóstico); (3) Problemas de planejamento complexo. Não valem: sumarização, Q&A simples, geração criativa, classificação — use GPT-4o mini ou Haiku para esses.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="modelos-de-raciocinio"
      title="Modelos de Raciocínio: o1, DeepSeek-R1 e chain-of-thought longa"
      icon="🤔"
      xp={90}
      readTime={18}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="chain-of-thought"
      nextTitle="Chain-of-Thought: raciocínio passo a passo em LLMs"
      relatedSlugs={['chain-of-thought', 'tree-of-thoughts', 'constitutional-ai-rlhf']}
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
        Em setembro de 2024, OpenAI lançou o o1 e redefiniu o que LLMs podem fazer em matemática, código
        e ciência. Em vez de responder diretamente, o modelo "pensa" — dedica tokens de raciocínio antes
        de responder, explorando múltiplos caminhos. Em janeiro de 2025, DeepSeek-R1 demonstrou que o mesmo
        é possível com open weights. Em 2026, entender quando e como usar esses modelos é decisão técnica
        crítica.
      </p>

      <Section title="A diferença fundamental: test-time compute" accent={ACCENT}>
        <LayerStack
          title="LLM padrão vs Modelo de raciocínio"
          accent={ACCENT}
          separatorLabel="uso de compute"
          layers={[
            { label: 'LLM padrão', content: 'Prompt → (forward pass único) → Resposta', note: 'tokens fixos, custo fixo', tone: 'default' },
            { label: 'CoT manual', content: 'Prompt + "pense passo a passo" → raciocínio explícito → resposta', note: 'CoT no prompt, não no treino', tone: 'default' },
            { label: 'Modelo de raciocínio', content: 'Prompt → [thinking: 1k-64k tokens internos de CoT longo] → Resposta', note: 'test-time compute escalável', tone: 'success' },
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          A intuição central: LLMs padrão têm compute fixo por resposta. Modelos de raciocínio trocam
          latência/custo por qualidade — mais thinking tokens = mais compute = melhor resposta (até um limite).
          Isso é chamado de "test-time compute scaling" e complementa o "training-time scaling".
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Aspecto', 'GPT-4o / Claude Sonnet', 'o1 / DeepSeek-R1 / Extended Thinking']}
          rows={[
            ['Mecanismo de raciocínio', 'Resposta direta (CoT se pedido)', 'Thinking interno extenso antes da resposta'],
            ['Custo por query', '$0.01-0.15 por 1k tokens', '$0.15-3.00 por 1k tokens (com thinking)'],
            ['Latência típica', '1-5s', '10-120s dependendo do budget'],
            ['Matemática avançada (AIME)', '~30% accuracy', 'o3: >90% accuracy'],
            ['Código complexo (SWE-bench)', '~50%', 'o3: ~70%+'],
            ['Q&A factual simples', 'Excelente', 'Excelente (mas caro desnecessariamente)'],
          ]}
        />
      </Section>

      <Section title="Como funciona: RLHF, GRPO e MCTS" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O treinamento de modelos de raciocínio usa Reinforcement Learning para ensinar o modelo a realizar
          CoT longo de alta qualidade — em vez de apenas imitar CoT de humanos.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Como funciona', 'Modelos que usam']}
          rows={[
            ['RLHF com CoT', 'Human feedback em cadeias de raciocínio', 'o1 (parcialmente)'],
            ['GRPO (Group Relative)', 'Gera N raciocínios, recompensa os corretos, penaliza os errados', 'DeepSeek-R1'],
            ['Process Reward Model', 'Recompensa passos intermediários corretos, não só a resposta final', 'Melhora todos os acima'],
            ['MCTS + LLM', 'Monte Carlo Tree Search guia a busca de raciocínio', 'AlphaProof, pesquisa'],
            ['Extended Thinking (Anthropic)', 'Treinamento de CoT longo via RL interno', 'Claude 3.7 Sonnet'],
          ]}
        />
        <CodeBlock lang="python">{`# GRPO simplificado — conceito central do DeepSeek-R1
import torch
from typing import Callable

def grpo_step(
    model,
    prompt: str,
    n_samples: int = 8,   # gera N raciocínios por prompt
    verifier: Callable[[str, str], float] = None,  # verifica se a resposta está correta
):
    """
    Group Relative Policy Optimization (simplificado).
    Gera N raciocínios, calcula advantage relativa ao grupo.
    """
    # 1. Amostrar N raciocínios completos (thinking + resposta)
    completions = []
    for _ in range(n_samples):
        output = model.generate(prompt, temperature=0.7, max_tokens=4096)
        completions.append(output)

    # 2. Verificar cada raciocínio (reward 1.0 = correto, 0.0 = errado)
    rewards = []
    for completion in completions:
        answer = extract_final_answer(completion)
        reward = verifier(prompt, answer) if verifier else float(answer_is_correct(answer))
        rewards.append(reward)

    # 3. Calcular advantage relativa ao grupo (GRPO vs PPO)
    # PPO: advantage = reward - baseline (modelo de valor separado)
    # GRPO: advantage = reward - média_do_grupo (sem modelo de valor)
    mean_reward = sum(rewards) / len(rewards)
    advantages = [r - mean_reward for r in rewards]

    # 4. Policy gradient: aumentar probabilidade dos raciocínios com advantage > 0
    for completion, advantage in zip(completions, advantages):
        tokens = model.tokenize(completion)
        log_probs = model.log_probs(prompt, tokens)
        loss = -advantage * log_probs.sum()  # policy gradient simplificado
        loss.backward()

    return sum(rewards) / len(rewards)  # accuracy média`}</CodeBlock>
      </Section>

      <Section title="Claude Extended Thinking: uso prático" accent={ACCENT}>
        <CodeBlock lang="python">{`import anthropic

client = anthropic.Anthropic()

def ask_with_extended_thinking(
    question: str,
    budget_tokens: int = 10000,  # tokens de thinking (1k-64k)
    show_thinking: bool = True,
) -> dict:
    """
    Usa Extended Thinking do Claude para raciocínio profundo.
    """
    response = client.messages.create(
        model="claude-opus-4-5",   # ou claude-3-7-sonnet-20250219
        max_tokens=16000,           # deve ser > budget_tokens
        thinking={
            "type": "enabled",
            "budget_tokens": budget_tokens,  # tokens de thinking
        },
        messages=[{
            "role": "user",
            "content": question,
        }],
    )

    result = {"answer": "", "thinking": ""}
    for block in response.content:
        if block.type == "thinking":
            result["thinking"] = block.thinking  # raciocínio interno
        elif block.type == "text":
            result["answer"] = block.text

    if show_thinking:
        print(f"=== THINKING ({len(result['thinking'])} chars) ===")
        print(result["thinking"][:2000] + "..." if len(result["thinking"]) > 2000 else result["thinking"])
        print("=== ANSWER ===")
    print(result["answer"])

    return result

# Usar para task difícil
result = ask_with_extended_thinking(
    """Prove que a soma dos ângulos internos de qualquer triângulo é 180°
    usando apenas os axiomas de Euclides.""",
    budget_tokens=16000,
)

# Para calibrar budget — testar com diferentes valores
for budget in [1000, 5000, 10000, 20000]:
    r = ask_with_extended_thinking(
        "Resolva: encontre todos os inteiros x,y tais que x² + y² = 2026",
        budget_tokens=budget,
        show_thinking=False,
    )
    print(f"Budget {budget}: {r['answer'][:100]}")`}</CodeBlock>

        <Callout tone="info">
          O thinking do Extended Thinking é visível na API — você pode inspecionar para debugging.
          O thinking não pode ser prefill (não é possível forçar o início do raciocínio). Budget de
          thinking tokens impacta diretamente o custo: tokens de thinking custam como output tokens
          (~3-15× mais caros que input tokens dependendo do modelo).
        </Callout>
      </Section>

      <Section title="DeepSeek-R1: open weights e destilados" accent={ACCENT}>
        <CodeBlock lang="python">{`# DeepSeek-R1 via API oficial
from openai import OpenAI  # API compatível com OpenAI

client = OpenAI(
    api_key="your-deepseek-key",
    base_url="https://api.deepseek.com",
)

response = client.chat.completions.create(
    model="deepseek-reasoner",   # R1 completo
    messages=[{
        "role": "user",
        "content": "Implemente quicksort in Python com análise de complexidade."
    }],
)

# R1 expõe o reasoning_content separado
print("REASONING:", response.choices[0].message.reasoning_content[:500])
print("ANSWER:", response.choices[0].message.content)

# DeepSeek-R1 Distill — roda localmente
# Distilados disponíveis: 1.5B, 7B, 8B, 14B, 32B, 70B
# Baseados em Qwen 2.5 e Llama 3 com capacidade de raciocínio destilada

# Via Ollama (local)
# ollama run deepseek-r1:8b
# ollama run deepseek-r1:32b  (melhor qualidade, precisa de mais VRAM)`}</CodeBlock>

        <CodeBlock lang="python">{`# Comparando o1-mini vs DeepSeek-R1-Distill-8B para benchmark
import time

def benchmark_reasoning_model(client, model: str, problem: str) -> dict:
    start = time.time()
    response = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": problem}],
    )
    latency = time.time() - start

    return {
        "model": model,
        "latency": latency,
        "tokens_used": response.usage.total_tokens,
        "answer": response.choices[0].message.content[:200],
    }

math_problem = """
Encontre todos os pares de inteiros positivos (a, b) tais que:
a² + b² = 1000 e mmc(a, b) = 10
"""

# Compare diferentes modelos de raciocínio na mesma task
results = [
    benchmark_reasoning_model(openai_client, "o1-mini", math_problem),
    benchmark_reasoning_model(openai_client, "o3-mini", math_problem),
    benchmark_reasoning_model(deepseek_client, "deepseek-reasoner", math_problem),
]
for r in results:
    print(f"{r['model']}: {r['latency']:.1f}s, {r['tokens_used']} tokens")`}</CodeBlock>
      </Section>

      <Section title="Calibrando budget de tokens de thinking" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Nem todo problema precisa do máximo de budget de thinking. Calibrar o budget baseado na
          dificuldade da task é fundamental para controlar custos.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de task', 'Budget thinking recomendado', 'Justificativa']}
          rows={[
            ['Q&A factual direta', '0 (não usar Extended Thinking)', 'Não há raciocínio a fazer'],
            ['Análise de texto simples', '0-1k tokens', 'Organização do pensamento mínima'],
            ['Código de complexidade média', '4k-8k tokens', 'Planejar abordagem, checar edge cases'],
            ['Matemática (olimpíadas, provas)', '16k-32k tokens', 'Exploração de múltiplos caminhos'],
            ['Problemas de pesquisa / design', '32k-64k tokens', 'Raciocínio profundo e iterativo'],
          ]}
        />
        <DecisionBox
          scenario="Resolver problemas de matemática discreta para geração de questões de prova"
          winner="Claude Extended Thinking com budget 16k-32k tokens"
          winnerColor={ACCENT}
          why="Matemática discreta requer exploração sistemática e verificação de casos — exatamente o que Extended Thinking faz. Claude mostra o raciocínio (debugging), garante respostas verificáveis, e o budget pode ser ajustado por dificuldade da questão."
          alternatives={[
            { name: 'OpenAI o3', note: 'Performance similar ou superior — choice depende de custo e acesso' },
            { name: 'DeepSeek-R1 via API', note: 'Open source, menor custo — boa alternativa para math' },
            { name: 'CoT few-shot com GPT-4o', note: 'Para problemas menos difíceis — 10× mais barato' },
          ]}
        />
        <QAItem
          q="Vale a pena sempre usar modelo de raciocínio para evitar erros?"
          a={<>Não. Modelos de raciocínio têm custo 5-50× maior. Para tasks onde LLMs padrão já têm ≥95% de accuracy, o ganho é marginal. A heurística: use modelo de raciocínio quando (1) a task tem resposta verificável (pode checar se está correta), (2) o erro tem consequência séria, (3) benchmarks mostram que o problema está no regime onde test-time compute ajuda (math, código, lógica). Para texto, sumarização, escrita — use GPT-4o ou Haiku.</>}
        />
        <QAItem
          q="Como saber se o thinking do Extended Thinking está sendo útil?"
          a={<>Inspecione o thinking content visível na API. Sinais de thinking útil: (1) O modelo explora múltiplos caminhos e descarta os incorretos; (2) Há verificação explícita ("vou checar se X é correto..."); (3) Backtracking ("essa abordagem não funciona, vou tentar..."). Sinais de thinking inútil: (1) Repetição de contexto sem progressão; (2) Afirmações sem verificação; (3) Raciocínio circular. Se o thinking é inútil, reduza o budget ou use modelo padrão.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Modelos de raciocínio dedicam tokens de thinking internos via RL —
        test-time compute scaling. o3 (OpenAI), Claude Extended Thinking, DeepSeek-R1 são os principais
        em 2026. DeepSeek-R1 é open weights (Apache 2.0) com destilados que rodam localmente. Use para:
        matemática avançada, código complexo, lógica com restrições múltiplas, pesquisa. Calibre o budget
        de thinking por dificuldade da task — não use max budget em tudo. Para tasks simples, LLMs padrão
        são 10-50× mais baratos com qualidade similar.
      </Callout>
    </div>
  );
}
