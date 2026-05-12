import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, Timeline, DecisionBox, ArchFlow, StackFlow, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('reasoning-models-internals');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "test-time compute" e por que ele mudou o paradigma de scaling em 2024–2025?',
    options: [
      'É o tempo gasto compilando o modelo antes do deploy',
      'É a quantidade de compute gasta DURANTE a inferência (não treino) — gerando reasoning tokens, samples paralelos, ou árvores de busca. OpenAI o1 paper (set/2024) mostrou que o gráfico de accuracy vs log(compute de inferência) é tão linear quanto accuracy vs log(compute de treino). Compute na hora da resposta vale tanto quanto compute no pre-train',
      'É o tempo de carregar o modelo na GPU',
      'É latência percebida pelo usuário em segundos',
    ],
    correct: 1,
    explanation:
      'OpenAI o1 (set/2024) revelou a "second scaling law": accuracy em raciocínio escala log-linear com compute de inferência (reasoning tokens, branches paralelos, búsqueda). Antes, compute era gasto majoritariamente em pre-train. Agora, modelos como o1, o3, R1, Claude com extended thinking gastam ordens de magnitude mais compute por query — gerando milhares a milhões de tokens internos antes de responder.',
  },
  {
    question: 'O que são "hidden reasoning tokens" e por que a OpenAI os esconde no o1?',
    options: [
      'São tokens que o modelo gera mas o usuário pode acessar via flag',
      'São tokens internos de chain-of-thought que o modelo gera para si mesmo antes da resposta final. OpenAI não expõe o conteúdo (apenas o número via reasoning_tokens) por dois motivos: (1) segurança contra extração de capacidades por competidores, (2) liberdade do modelo escrever raciocínio "messy" sem ser otimizado para legibilidade humana. Cobra pelos tokens mesmo escondidos',
      'São tokens de instruções de sistema',
      'São tokens de embedding interno do transformer',
    ],
    correct: 1,
    explanation:
      'No o1/o3, OpenAI gera reasoning tokens internamente — visíveis apenas como contagem em `usage.completion_tokens_details.reasoning_tokens`. Justificativa pública: (1) competitive moat — competidores não podem extrair traces para destilar, (2) modelo livre para raciocinar sem performatividade. Anthropic optou pelo oposto: extended thinking expõe o thinking via parâmetro thinking.budget_tokens e retorna como bloco visível na resposta.',
  },
  {
    question: 'Como o Claude implementa extended thinking de forma diferente do o1?',
    options: [
      'Claude usa exatamente a mesma arquitetura que o o1',
      'Claude (3.7 Sonnet, 4 Opus, 4.7 em 2026) expõe extended thinking via parâmetro thinking={"type":"enabled","budget_tokens":N}. O conteúdo do raciocínio é retornado em bloco {"type":"thinking"} antes do bloco {"type":"text"} da resposta. Cobrado como tokens de output normais. Permite ao usuário ver o thinking, citar partes dele e controlar budget',
      'Claude só faz thinking em domínio de matemática',
      'Claude requer modelo separado para thinking',
    ],
    correct: 1,
    explanation:
      'A API Anthropic implementa extended thinking via parâmetro thinking explícito (docs em docs.anthropic.com/en/docs/build-with-claude/extended-thinking). O modelo retorna o raciocínio em content block {"type":"thinking","thinking":"..."} ANTES do {"type":"text"}. Budget tokens controla quanto o modelo pode pensar (1k–64k típico). É visível, citável e cobrado como output. Tradeoff filosófico: transparência (Claude) vs proteção competitiva (OpenAI).',
  },
  {
    question: 'O que distingue arquiteturalmente uma "reasoning model" de um LLM padrão?',
    options: [
      'Reasoning models usam transformer arquitetura diferente',
      'Pouco distingue arquiteturalmente — em geral, a arquitetura transformer é a mesma. A diferença está em (1) RL pós-SFT focado em reasoning com reward verificável (GRPO ou PPO), (2) treino com CoTs longos no SFT, (3) special tokens estruturais (<think>...</think> em R1, reasoning blocks em Claude), (4) parâmetros de inferência que permitem geração longa antes do output final',
      'Reasoning models são sempre Mixture of Experts',
      'Reasoning models têm mais cabeças de atenção',
    ],
    correct: 1,
    explanation:
      'Arquiteturalmente, reasoning models (o1, R1, Claude thinking, Gemini Thinking, QwQ) são transformers padrão. As diferenças são (1) data — treinados com CoTs longos curados; (2) RL — GRPO ou PPO com reward verificável em math/code/logic; (3) tokens estruturais — <think>/</think> ou system messages que delimitam reasoning; (4) inference settings — max output tokens muito maior (32k–128k para acomodar reasoning longo).',
  },
  {
    question: 'O que é "budget control" em reasoning models?',
    options: [
      'Limite de gastos da API',
      'Parâmetros que permitem ao usuário controlar quantos tokens de reasoning o modelo pode gerar antes da resposta final. OpenAI o1 expõe reasoning_effort ("low"/"medium"/"high"). Claude expõe budget_tokens (1k–64k). Gemini Thinking expõe thinking_budget. Permite tradeoff explícito: mais budget = melhor accuracy + maior latência + maior custo',
      'Limite de uso de GPU memory',
      'Restrição de quais tokens o modelo pode emitir',
    ],
    correct: 1,
    explanation:
      'Budget control é o knob que expõe o tradeoff accuracy ↔ custo/latência. OpenAI: reasoning_effort low/medium/high (mapped internamente a budget de reasoning tokens). Anthropic: thinking.budget_tokens número exato (mínimo ~1k, máximo ~64k em Claude 4.7). Google: thinking_budget no Gemini 2.0 Thinking. DeepSeek: max_tokens controla geração total. Default tipicamente "medium" — sufficient para maioria, sub-otimal para hard tasks.',
  },
  {
    question: 'Por que Claude 4 mostra tool use INTERCALADO com thinking, diferente de outros reasoning models?',
    options: [
      'Para reduzir latência',
      'Claude pode chamar tools (functions) DURANTE o processo de reasoning, não só antes ou depois. Permite "search & think" loops onde o modelo pensa, busca informação externa, pensa mais, busca de novo. Outros reasoning models (o1, R1) tendem a separar: thinking puro → resposta final → tools só após. Claude integra ambos no fluxo de thinking',
      'Por exigência regulatória',
      'Para usar Web Audio API',
    ],
    correct: 1,
    explanation:
      'Claude 4 (Opus 4, Sonnet 4) introduziu "interleaved thinking" — blocos {"type":"thinking"} e {"type":"tool_use"} podem aparecer alternados antes do {"type":"text"} final. Permite raciocínio agentivo: pensa → busca web → pensa sobre resultados → busca outra fonte → conclui. o1 e R1 tipicamente fazem reasoning monolítico antes de qualquer tool call. Ver docs.anthropic.com/en/docs/build-with-claude/extended-thinking#interleaved-thinking.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="reasoning-models-internals"
      title="Reasoning models por dentro: o1, o3, R1, Gemini Thinking"
      icon="🧠"
      xp={70}
      readTime={14}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="agent-swarms-crewai-autogen"
      nextTitle="Agent swarms: CrewAI, AutoGen, OpenAI Swarm"
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
        Em setembro de 2024, a OpenAI lançou o o1 e quebrou um paradigma: scaling não termina no
        pre-train, continua na hora da inferência. Em janeiro de 2025, DeepSeek-R1 reproduziu a
        técnica em open-weights. Em 2026, &quot;reasoning model&quot; virou categoria estabelecida: o1, o3,
        o3-pro, Claude extended thinking, Gemini Thinking, DeepSeek-R1, Qwen-QwQ. Mesma família de
        arquitetura — diferenças sutis e estratégicas que importam para escolher e operar.
      </p>

      <Section title="A segunda lei de scaling" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O paper original do o1 (OpenAI Learning to Reason with LLMs, set/2024) revelou o gráfico
          que mudou tudo: accuracy em AIME (math olympiad) é log-linear em (a) pretrain compute e
          também em (b) test-time compute. Duas leis de scaling independentes que combinam.
        </p>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Scaling law 1 (clássica)', v: 'Loss ∝ Compute^(-α) — Hoffmann et al. Chinchilla 2022, Kaplan et al. 2020' },
            { k: 'Scaling law 2 (test-time)', v: 'Accuracy reasoning ∝ log(inference compute) — emergente em o1/R1' },
            { k: 'Implicação prática', v: 'Modelo médio + muito thinking ≈ modelo gigante + thinking baixo. Custo se desloca de capex (treino) para opex (inferência)' },
            { k: 'Limite atual', v: 'Em 2026, modelos top reportam 50k–256k tokens de reasoning por query hard. o3-pro chega a 1M' },
          ]}
        />
        <Callout tone="info">
          Implicação econômica: data centers de inferência viraram tão grandes quanto data centers
          de treino. AWS Trainium2, NVIDIA Blackwell B200, TPU v6 — toda esta geração foi
          desenhada para inference compute.
        </Callout>
      </Section>

      <Section title="Comparativo arquitetural dos 4 grandes" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Quem', 'Reasoning visível?', 'Budget control', 'Tool intercalado?']}
          rows={[
            ['o1 / o3 / o3-pro', 'OpenAI', 'Não (oculto)', 'reasoning_effort low/med/high', 'Não (em 2026)'],
            ['Claude extended thinking', 'Anthropic', 'Sim (block thinking)', 'thinking.budget_tokens', 'Sim (interleaved)'],
            ['Gemini 2.0/2.5 Thinking', 'Google DeepMind', 'Sim (configurable)', 'thinking_budget', 'Parcial'],
            ['DeepSeek-R1', 'DeepSeek', 'Sim (<think> tags)', 'max_tokens + temperature', 'Não (single-pass)'],
            ['Qwen-QwQ', 'Alibaba', 'Sim', 'max_thinking_tokens', 'Não'],
            ['Kimi-k1.5', 'Moonshot', 'Sim', 'thinking_mode', 'Parcial'],
          ]}
        />
        <Callout tone="warn">
          Visibilidade do reasoning é decisão de produto, não capability. Anthropic publicou que
          extended thinking visível ajuda usuários a confiar e debugar. OpenAI argumenta que
          esconder protege contra destilação por competidores. Ambos têm casos legítimos.
        </Callout>
      </Section>

      <Section title="API: como chamar reasoning models" accent={ACCENT}>
        <CodeBlock lang="python" filename="claude_extended_thinking.py">{`# Claude 4.7 Opus com extended thinking
import anthropic

client = anthropic.Anthropic()

message = client.messages.create(
    model="claude-opus-4-7",
    max_tokens=16000,
    thinking={
        "type": "enabled",
        "budget_tokens": 8000,   # 1k mínimo, 64k máximo
    },
    messages=[{
        "role": "user",
        "content": "Prove que sqrt(2) é irracional usando contradição.",
    }]
)

# Resposta contém blocos:
# [{"type": "thinking", "thinking": "Hmm, deixa eu pensar..."},
#  {"type": "text", "text": "Demonstração:..."}]
for block in message.content:
    if block.type == "thinking":
        print("=== THINKING ===")
        print(block.thinking)
    elif block.type == "text":
        print("=== RESPOSTA ===")
        print(block.text)`}</CodeBlock>
        <CodeBlock lang="python" filename="openai_o3.py">{`# OpenAI o3 (sem visibility do thinking)
from openai import OpenAI

client = OpenAI()

response = client.chat.completions.create(
    model="o3",
    reasoning_effort="high",     # low/medium/high
    messages=[{
        "role": "user",
        "content": "Prove que sqrt(2) é irracional usando contradição.",
    }]
)

# Não há acesso ao conteúdo do reasoning
print(response.choices[0].message.content)
print(f"Reasoning tokens: {response.usage.completion_tokens_details.reasoning_tokens}")
print(f"Output tokens: {response.usage.completion_tokens}")
# reasoning_tokens são cobrados mesmo invisíveis`}</CodeBlock>
        <CodeBlock lang="bash" filename="deepseek_r1.sh">{`# DeepSeek-R1 via API ou local
curl https://api.deepseek.com/chat/completions \\
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "deepseek-reasoner",
    "messages": [{"role": "user", "content": "Prove sqrt(2) irracional."}],
    "max_tokens": 8000
  }'

# Resposta contém "reasoning_content" + "content"
# reasoning_content tem o <think>...</think> expandido`}</CodeBlock>
      </Section>

      <Section title="Arquitetura runtime de uma reasoning model" accent={ACCENT}>
        <ArchFlow
          accent={ACCENT}
          title="Inference pipeline (Claude extended thinking)"
          columns={[
            {
              header: 'Input',
              items: [
                'System + messages — contexto + histórico',
                'thinking.budget_tokens — quanto thinking permitir',
                'tools[] — functions disponíveis',
              ],
            },
            {
              header: 'Generation',
              items: [
                'Block: thinking — modelo raciocina até EOS interno',
                'Block: tool_use — se decidir chamar tool (Claude)',
                'Block: thinking 2 — pensar sobre resultado da tool',
                'Block: text — resposta final ao usuário',
              ],
            },
            {
              header: 'Output',
              items: [
                'content[] — array de blocks tipados',
                'usage.thinking_tokens — cobrado como output',
                'stop_reason — end_turn / tool_use / max_tokens',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Quando usar reasoning model vs LLM padrão" accent={ACCENT}>
        <DecisionBox
          scenario="Você está construindo um agente de análise de código que detecta bugs sutis em pull requests."
          winner="Claude extended thinking (alto budget) ou o3"
          winnerColor={ACCENT}
          why="Detecção de bug sutil é raciocínio multi-step: rastrear data flow, verificar invariants, considerar edge cases. Reasoning model com thinking longo permite ao modelo simular execução, voltar atrás, considerar alternativas. LLM padrão tende a hallucinar análise plausível mas superficial."
          alternatives={[
            { name: 'GPT-4o ou Claude Sonnet (sem thinking)', note: 'Mais barato/rápido mas perde bugs sutis em códigos complexos' },
            { name: 'Ensemble: Sonnet primeiro filtra, o3 analisa profundo', note: 'Cascade — custo intermediário' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Task', 'Modelo padrão', 'Reasoning model']}
          rows={[
            ['Chat casual', '✅ Ideal', '❌ Overkill, lento'],
            ['Sumarização', '✅ Ideal', '⚠️ Talvez excesso'],
            ['Math olympiad', '❌ Insuficiente', '✅ Crítico'],
            ['Code debugging complexo', '⚠️ Marginal', '✅ Brilha'],
            ['Análise jurídica', '⚠️ Marginal', '✅ Ideal'],
            ['RAG simple', '✅ Ideal', '❌ Custa caro'],
            ['Multi-step planning', '❌ Falha', '✅ Brilha'],
            ['Tool use simples', '✅ Ideal', '❌ Overhead'],
          ]}
        />
      </Section>

      <Section title="Custo e latência: o tradeoff" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          title="Custos relativos (estimativa 2026)"
          items={[
            { label: 'Claude Haiku 4', detail: '$0.25/$1.25 (input/output 1M tokens) — sem thinking, fastest' },
            { label: 'Claude Sonnet 4.7', detail: '$3/$15 (1M) — thinking opcional, balanced' },
            { label: 'Claude Opus 4.7 thinking', detail: '$15/$75 (1M) + thinking tokens contam como output' },
            { label: 'OpenAI o3', detail: '~$15/$60 (1M) + reasoning_tokens cobrados como output' },
            { label: 'o3-pro', detail: '~$200/$800 (1M) — alta latência, alta qualidade' },
            { label: 'DeepSeek-R1', detail: '~$0.55/$2.19 (1M) — cheapest reasoning model open' },
          ]}
        />
        <Callout tone="warn">
          Latência: reasoning model pode levar 10–120 segundos por query. Para UX interativo,
          considere streaming do thinking (Claude/Gemini suportam) para mostrar progresso, ou
          cache de thinking para queries similares.
        </Callout>
      </Section>

      <Section title="Linha do tempo das reasoning models" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Set 2024', label: 'OpenAI o1-preview', detail: 'Primeira reasoning model pública' },
            { when: 'Dez 2024', label: 'o1 full + o1-pro', detail: 'GA, reasoning_effort exposto' },
            { when: 'Jan 2025', label: 'DeepSeek-R1', detail: 'Reasoning open-source SOTA — MIT license', highlight: true },
            { when: 'Fev 2025', label: 'Gemini 2.0 Flash Thinking', detail: 'Google entra na corrida com modelo rápido' },
            { when: 'Mar 2025', label: 'Claude 3.7 Sonnet thinking', detail: 'Anthropic estréia extended thinking visível' },
            { when: 'Abr 2025', label: 'o3 + o3-mini', detail: 'OpenAI segundo geração, code-focused' },
            { when: 'Set 2025', label: 'Claude 4 Opus thinking interleaved', detail: 'Tool use intercalado com thinking' },
            { when: 'Jan 2026', label: 'o3-pro + Gemini 2.5 Thinking', detail: '1M reasoning tokens budget' },
            { when: 'Mai 2026', label: 'Claude 4.7 (1M)', detail: 'Context window 1M, thinking budget 64k' },
          ]}
        />
      </Section>

      <Section title="Reasoning model como agente" accent={ACCENT}>
        <FlowDiagram
          accent={ACCENT}
          title="Loop agentivo com Claude extended thinking + tools"
          orientation="vertical"
          steps={[
            { icon: '🎯', label: 'User: pergunta complexa', desc: 'Ex.: "analise esse repo e proponha refactor"' },
            { icon: '🧠', label: 'Thinking block 1', desc: 'Modelo planeja estratégia' },
            { icon: '🔧', label: 'Tool: read_files()', desc: 'Modelo lê código' },
            { icon: '🧠', label: 'Thinking block 2', desc: 'Analisa o que leu, decide próximo passo' },
            { icon: '🔧', label: 'Tool: grep_codebase()', desc: 'Procura padrões específicos' },
            { icon: '🧠', label: 'Thinking block 3', desc: 'Sintetiza findings' },
            { icon: '💬', label: 'Text block: resposta', desc: 'Refactor proposal estruturado' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Reasoning model alucina menos?"
          a="Em domínios verificáveis (math, code), sim — reasoning permite self-check antes de responder. Em domínios não-verificáveis (história, opinião), não necessariamente — pode alucinar com mais confiança porque o thinking 'racionaliza' a alucinação."
        />
        <QAItem
          q="Posso fine-tunar reasoning model?"
          a="Em 2026: OpenAI não permite fine-tune do o1/o3. Anthropic permite via vertex/bedrock para Sonnet. DeepSeek-R1 é open-weights, fine-tune livre via TRL/Unsloth — comum destilar R1 em modelos menores."
        />
        <QAItem
          q="Reasoning model é melhor que CoT prompting?"
          a="Sim, drasticamente. CoT prompting (Wei et al. 2022) instrui o LLM a 'think step by step' — funciona mas é shallow. Reasoning model foi RL-trained para reasoning longo (50k–256k tokens) com self-correction. Diferença não é gradual — é qualitativa."
        />
        <QAItem
          q="Como debugar quando reasoning model erra?"
          a="Em modelos com thinking visível (Claude, R1, Gemini): leia o thinking block, identifique onde o raciocínio descarrila. Em o1/o3 (invisível): apenas pode aumentar reasoning_effort, dar contexto adicional, ou trocar de modelo."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'OpenAI o1', v: 'openai.com/index/learning-to-reason-with-llms (Set 2024)' },
            { k: 'DeepSeek-R1', v: 'arXiv:2501.12948 — open-source reasoning model SOTA' },
            { k: 'Claude extended thinking', v: 'docs.anthropic.com/en/docs/build-with-claude/extended-thinking' },
            { k: 'Gemini Thinking', v: 'ai.google.dev/gemini-api/docs/thinking' },
            { k: 'CoT prompting (origem)', v: 'Wei et al. "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models". NeurIPS 2022' },
            { k: 'Test-time compute scaling', v: 'Snell et al. (DeepMind). "Scaling LLM Test-Time Compute Optimally". arXiv:2408.03314 (2024)' },
            { k: 'Self-consistency', v: 'Wang et al. "Self-Consistency Improves Chain of Thought Reasoning in Language Models". ICLR 2023' },
          ]}
        />
      </Section>
    </div>
  );
}
