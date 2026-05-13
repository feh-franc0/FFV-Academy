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
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('multi-agent-orchestration');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o padrão "planner-executor" e quando ele supera o ReAct monolítico?',
    options: [
      'Padrão de Java Enterprise',
      'Um agente Planner gera um plano completo upfront (lista de steps), outro agente Executor executa cada step sequencialmente, com feedback loop opcional para replanejar. Supera ReAct quando: (1) plano se beneficia de visão completa antes de agir, (2) Planner pode ser modelo mais caro (Opus) e Executor mais barato (Haiku), (3) plano é auditável e modificável por humano antes de executar',
      'Sinônimo de map-reduce',
      'Padrão exclusivo do AutoGen',
    ],
    correct: 1,
    explanation:
      'Planner-Executor (Wang et al. 2023, "Plan-and-Solve Prompting") separa planejamento de execução. Vantagens: (1) plano holístico antes de comprometer ações irreversíveis; (2) cost optimization — Planner = Opus (raciocínio caro 1×), Executor = Haiku (execução barata N×); (3) auditabilidade — humano vê o plano antes de aprovar; (4) replan loop quando step falha. Usado em Anthropic Computer Use e AutoGPT v2.',
  },
  {
    question: 'Qual a diferença entre "voting" e "debate" como padrões multi-agent?',
    options: [
      'São termos sinônimos',
      'Voting: N agentes independentes resolvem a mesma task em paralelo (sem ver respostas dos outros), depois um agregador faz voto majoritário ou consensus. Debate: agentes argumentam em rounds, vendo argumentos dos outros e refinando. Voting é estatístico e barato; Debate é dialético e caro, mas pode descobrir reasoning errors',
      'Voting é para classificação; Debate é para geração',
      'Voting precisa de blockchain; Debate não',
    ],
    correct: 1,
    explanation:
      'Voting (self-consistency Wang et al. 2023, ICLR) — N samples independentes, vote final. Custa N× tokens mas paralelo. Debate (Du et al. 2023, Liang et al. 2023) — agentes veem argumentos prévios em rounds, refinando. Custa N×R× tokens (R rounds) e é sequencial. Empiricamente: voting ganha em tasks com resposta única e verificável (math); debate ganha em tasks com nuance e potencial reasoning bug.',
  },
  {
    question: 'Qual a função do "router agent" em sistemas multi-agent?',
    options: [
      'Encaminha pacotes TCP/IP',
      'Um LLM que recebe a query inicial e decide qual agente especialista deve responder, sem participar da resposta final. Mais leve que supervisor: router não orquestra ciclos, só faz dispatch. Útil em customer support onde queries variam (billing vs technical vs sales) e cada domínio tem agente otimizado',
      'Faz cache de respostas',
      'É o componente de tracing',
    ],
    correct: 1,
    explanation:
      'Router agent é variante mais leve do supervisor: classifica a query e despacha para um único agente especialista, sem reentrada. Comum em chatbots de support (router → billing_agent OU tech_agent OU sales_agent). LangGraph add_conditional_edges com função classificadora; OpenAI Swarm handoffs implementam padrão. Diferença vs supervisor: router faz one-shot decision, supervisor coordena loop multi-turn.',
  },
  {
    question: 'Quando o padrão "hierarchical" (manager + workers) supera fluxo sequencial?',
    options: [
      'Sempre',
      'Quando há (1) decomposição dinâmica — quais subtasks chamar depende da query (não fixo), (2) paralelismo entre subtasks (manager despacha 3 workers paralelos), (3) feedback adaptativo — manager pode re-chamar worker com info refinada. Fluxo sequencial é melhor quando subtasks são fixos e ordenados (research → write → review sempre)',
      'Quando há mais de 1B de parâmetros',
      'Quando código está em TypeScript',
    ],
    correct: 1,
    explanation:
      'Hierarchical (LangGraph create_supervisor, CrewAI Process.hierarchical) brilha em decomposição dinâmica + paralelismo + adaptive feedback. Fluxo sequencial (CrewAI Process.sequential) é melhor para pipelines determinísticos com mesma ordem de subtasks. Anthropic propõe regra: "se o set de subtasks varia por query, hierárquico; se é fixo, sequencial".',
  },
  {
    question: 'O que é um "agent loop com self-critique" (Reflexion)?',
    options: [
      'Bug onde agente entra em loop infinito',
      'Padrão de Shinn et al. 2023 ("Reflexion: Language Agents with Verbal Reinforcement Learning"): agente executa task, um critic (mesmo ou outro modelo) avalia o resultado e gera critique verbal, agente refaz a task incorporando o critique. Iterativo até critic aprovar ou max_iterations. Funciona como mini-RLHF inference-time sem treino',
      'Padrão de retry exponencial',
      'Técnica de prompt injection defensiva',
    ],
    correct: 1,
    explanation:
      'Reflexion (Shinn, Cassano, Berman, Gopinath, Narasimhan, Yao — NeurIPS 2023, arxiv.org/abs/2303.11366) é self-critique loop: agente → critic → reflection → retry. Critic produz critique textual (não numérico) que vira parte do contexto da próxima tentativa. Empiricamente eleva accuracy em HumanEval (code) e ALFWorld (game) em 10–30%. Custo: N× tokens. LangGraph e CrewAI suportam idiomaticamente via add_conditional_edge.',
  },
  {
    question: 'Quando você NÃO deve usar multi-agent (a regra dos 80%)?',
    options: [
      'Quando o budget é alto',
      'Estimativa pragmática (Anthropic + OpenAI dev relations): ~80–90% dos casos onde devs reach for multi-agent, single agent com tools resolve melhor. Sinais de overengineering: (1) cada "agente" tem o mesmo prompt base, (2) "agents" se comunicam só via mensagens (poderia ser tool call), (3) latência multiplicada não compensa qualidade, (4) debug se torna pesadelo. Pergunte sempre: "isso poderia ser tool call?"',
      'Quando há mais de 10k usuários',
      'Em fim de semana',
    ],
    correct: 1,
    explanation:
      'A "regra dos 80%" — pragmática, não formal — diz que single agent + tools resolve melhor a maioria dos casos. Multi-agent é justificado quando: (1) genuíno paralelismo entre subtasks, (2) papéis com prompts e tools distintos, (3) debate/voting empiricamente eleva qualidade no seu eval, (4) separação de contexto (cada agente vê só seu subset). Antes de adicionar agente, pergunte: "isso pode ser uma tool do meu agente principal?" — frequentemente sim.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="multi-agent-orchestration"
      title="Multi-agent orchestration patterns avançados"
      icon="🎼"
      xp={70}
      readTime={14}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="agent-observability-langsmith"
      nextTitle="Agent observability: LangSmith, Helicone, Phoenix Arize"
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
        Multi-agent é a categoria mais hyped e mais mal-aplicada da era pós-ChatGPT. Este módulo
        cataloga os patterns que funcionam empiricamente em produção — supervisor/worker, debate,
        voting, planner-executor, router — com referências aos papers originais. E gasta tempo
        igual no que importa mais: <strong>quando NÃO usar multi-agent</strong>.
      </p>

      <Section title="Catálogo de patterns" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pattern', 'Quando usar', 'Custo', 'Latência']}
          rows={[
            ['Router', 'Despacho 1-shot por domínio', 'Baixo (1 LLM extra)', 'Baixa'],
            ['Supervisor/Worker', 'Decomposição dinâmica + paralelismo', 'Médio (M+N agents)', 'Média'],
            ['Sequential pipeline', 'Pipeline fixo determinístico', 'Médio (1× por step)', 'Alta (soma)'],
            ['Planner-Executor', 'Plan auditável antes de agir', 'Médio (1 Opus + N Haiku)', 'Média'],
            ['Debate (N round)', 'Reasoning com risco de error', 'Alto (N×R agents)', 'Alta'],
            ['Voting / Self-consistency', 'Resposta verificável, paralelo', 'Alto (N×) mas paralelo', 'Baixa'],
            ['Reflexion (self-critique)', 'Tasks iterativas com critic claro', 'Alto (iterativo)', 'Alta'],
            ['Tree of Thoughts', 'Search com backtracking', 'Muito alto', 'Muito alta'],
          ]}
        />
      </Section>

      <Section title="Supervisor / Worker em LangGraph" accent={ACCENT}>
        <CodeBlock lang="python" filename="supervisor_workers.py">{`from typing import TypedDict, Annotated, Literal
import operator
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import create_react_agent
from langchain_anthropic import ChatAnthropic
from langchain_core.tools import tool

# Tools dos workers
@tool
def search_arxiv(query: str) -> str:
    """Pesquisa papers no arXiv."""
    return f"3 papers encontrados sobre '{query}'"

@tool
def run_code(code: str) -> str:
    """Executa Python em sandbox."""
    return f"Output: {eval(code)}"  # NÃO faça isso em prod (use sandbox real)

llm = ChatAnthropic(model="claude-sonnet-4-7")

# Workers especialistas
researcher = create_react_agent(llm, tools=[search_arxiv])
coder = create_react_agent(llm, tools=[run_code])

# Supervisor: LLM com tool "delegate"
class State(TypedDict):
    messages: Annotated[list, operator.add]
    next: str

def supervisor(state: State) -> dict:
    sys = """Você coordena dois workers: 'researcher' (papers) e 'coder' (executa código).
    Decida qual chamar ou se a task está completa. Retorne JSON: {"next": "researcher"|"coder"|"FINISH"}"""
    response = llm.invoke([{"role": "system", "content": sys}] + state["messages"])
    import json
    decision = json.loads(response.content)
    return {"next": decision["next"]}

def call_researcher(state):
    result = researcher.invoke({"messages": state["messages"]})
    return {"messages": [result["messages"][-1]]}

def call_coder(state):
    result = coder.invoke({"messages": state["messages"]})
    return {"messages": [result["messages"][-1]]}

graph = StateGraph(State)
graph.add_node("supervisor", supervisor)
graph.add_node("researcher", call_researcher)
graph.add_node("coder", call_coder)
graph.add_edge(START, "supervisor")
graph.add_conditional_edges(
    "supervisor",
    lambda s: END if s["next"] == "FINISH" else s["next"],
)
graph.add_edge("researcher", "supervisor")  # supervisor decide next
graph.add_edge("coder", "supervisor")
app = graph.compile()`}</CodeBlock>
        <Callout tone="info">
          Cycle <InlineCode>worker → supervisor</InlineCode> é o padrão hierarchical canonical.
          Supervisor pode delegar várias vezes em sequência, agregando resultados, antes de FINISH.
        </Callout>
      </Section>

      <Section title="Debate pattern" accent={ACCENT}>
        <CodeBlock lang="python" filename="debate.py">{`# Adapted from Liang et al. 2023 — arxiv.org/abs/2305.19118
import asyncio
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-sonnet-4-7")

async def debate(question: str, n_agents: int = 3, n_rounds: int = 2) -> str:
    history = [[] for _ in range(n_agents)]

    # Round 0: cada agente responde independentemente
    for i in range(n_agents):
        response = await llm.ainvoke([{"role": "user", "content": question}])
        history[i].append(response.content)

    # Rounds 1..N: cada agente vê argumentos dos outros e refina
    for r in range(1, n_rounds + 1):
        new_responses = []
        for i in range(n_agents):
            others = [history[j][r - 1] for j in range(n_agents) if j != i]
            others_text = "\\n\\n".join(f"Argumento {k+1}: {a}" for k, a in enumerate(others))
            prompt = (
                f"Pergunta original: {question}\\n\\n"
                f"Outros agentes responderam:\\n{others_text}\\n\\n"
                f"Sua resposta anterior: {history[i][r-1]}\\n\\n"
                "Considere os argumentos. Refine sua resposta. Se mantiver, justifique."
            )
            response = await llm.ainvoke([{"role": "user", "content": prompt}])
            new_responses.append(response.content)
        for i in range(n_agents):
            history[i].append(new_responses[i])

    # Round final: judge agrega
    final_args = [h[-1] for h in history]
    judge_prompt = (
        f"Pergunta: {question}\\n\\n"
        + "\\n\\n".join(f"Agente {i+1}: {a}" for i, a in enumerate(final_args))
        + "\\n\\nComo juiz, dê a resposta consolidada e correta."
    )
    final = await llm.ainvoke([{"role": "user", "content": judge_prompt}])
    return final.content

# answer = asyncio.run(debate("Prove que sqrt(2) é irracional.", n_agents=3, n_rounds=2))`}</CodeBlock>
      </Section>

      <Section title="Voting / Self-consistency" accent={ACCENT}>
        <CodeBlock lang="python" filename="voting.py">{`# Self-consistency (Wang et al. 2023, ICLR — arxiv.org/abs/2203.11171)
import asyncio
from collections import Counter
from langchain_anthropic import ChatAnthropic

llm = ChatAnthropic(model="claude-sonnet-4-7", temperature=0.7)

async def self_consistency(question: str, n: int = 10) -> str:
    """N samples paralelos com temperatura > 0, vote majoritário."""
    # Paralelo via gather
    tasks = [llm.ainvoke([{"role": "user", "content": question}]) for _ in range(n)]
    responses = await asyncio.gather(*tasks)
    answers = [r.content for r in responses]

    # Normaliza (extrair "answer: X" — depende do domínio)
    # Para math: extrair último número
    import re
    extracted = []
    for ans in answers:
        m = re.search(r"\\\\boxed\\{(.+?)\\}|answer:?\\s*(\\S+)", ans, re.IGNORECASE)
        if m:
            extracted.append(m.group(1) or m.group(2))
    counts = Counter(extracted)
    most_common, _ = counts.most_common(1)[0]
    return most_common

# Custo: N× tokens. Latência: 1× (paralelo). Accuracy boost ~5–15% em math.`}</CodeBlock>
        <Callout tone="warn">
          Self-consistency assume task com resposta extraível. Para texto livre (escrita criativa),
          não aplica — você não consegue &quot;votar&quot; em narrativas. Use debate ou reflexion.
        </Callout>
      </Section>

      <Section title="Planner-Executor" accent={ACCENT}>
        <FlowDiagram
          accent={ACCENT}
          title="Planner-Executor com replan"
          orientation="vertical"
          steps={[
            { icon: '🎯', label: 'Query do usuário', desc: 'Task complexa multi-step' },
            { icon: '🧠', label: 'Planner (Opus)', desc: 'Gera plano: lista de steps detalhados' },
            { icon: '👁️', label: 'Human review (opcional)', desc: 'Auditoria do plano antes de agir' },
            { icon: '🔧', label: 'Executor (Haiku) step 1', desc: 'Executa step 1, retorna resultado' },
            { icon: '✅', label: 'Step succeeded?', desc: 'Se sim → step seguinte; se não → replan' },
            { icon: '🔁', label: 'Loop até DONE', desc: 'Todos os steps completos' },
          ]}
        />
        <Callout tone="info">
          Custo otimizado: Planner = Opus (1 chamada cara) + Executor = Haiku (N chamadas baratas).
          Reduz custo total em 60–80% vs Opus-only enquanto preserva qualidade do plano.
        </Callout>
      </Section>

      <Section title="Anti-pattern: usar multi-agent porque sim" accent={ACCENT}>
        <ArchFlow
          accent={ACCENT}
          title="Sinais de que você NÃO precisa de multi-agent"
          columns={[
            {
              header: 'Sinais de overengineering',
              items: [
                'Todos os "agents" têm o mesmo prompt base',
                'Agents só trocam strings de texto (poderia ser tool)',
                '"Agents" diferem só no system message (poderia ser único agent com tools de domínio)',
                'Latência multiplicada não melhora qualidade no eval',
                'Debug exige mapear N stack traces',
              ],
            },
            {
              header: 'Quando refatorar para single agent',
              items: [
                '"Specialist agents" → tools do agent principal',
                'Sequential pipeline curto → LCEL chain',
                'Decisão simples → conditional logic Python',
                'Voting com 1 modelo → temperature sampling',
                'Debate de 2 agents → self-critique loop',
              ],
            },
            {
              header: 'Quando multi-agent vale',
              items: [
                'Tools/permissions genuinamente isoladas (security)',
                'Paralelismo real entre subtasks independentes',
                'Eval mostra ganho mensurável vs single',
                'Contexto não cabe em uma janela',
                'Equipes humanas distintas mantêm cada agente',
              ],
            },
          ]}
        />
        <DecisionBox
          scenario="Você quer construir agente que pesquisa, escreve código e revisa. Cada parte tem prompt diferente."
          winner="Provavelmente single agent com 3 tools, NÃO 3 agents"
          winnerColor={ACCENT}
          why="Se os 'agents' diferem só em prompt + ferramentas, refatore para 1 agent com (research_tool, code_tool, review_tool) e instructions detalhadas. Mantém todo contexto, debug simples, latência baixa. Multi-agent só se cada parte exige modelo diferente, paralelismo real, ou permissions isoladas."
          alternatives={[
            { name: 'Multi-agent', note: 'Vale se Researcher = Haiku, Coder = Opus, Reviewer = Sonnet (modelos distintos) ou se há real paralelismo' },
            { name: 'Pipeline sequencial', note: 'CrewAI sequential se você quer estrutura visível e tracing por step' },
          ]}
        />
      </Section>

      <Section title="Timeline de patterns multi-agent" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Mar 2022', label: 'Self-consistency', detail: 'Wang et al. — voting paralelo' },
            { when: 'Out 2022', label: 'ReAct', detail: 'Yao et al. — think-act-observe loop single agent' },
            { when: 'Mar 2023', label: 'Reflexion', detail: 'Shinn et al. — self-critique loop', highlight: true },
            { when: 'Mai 2023', label: 'Multi-Agent Debate', detail: 'Du et al., Liang et al.' },
            { when: 'Mai 2023', label: 'Tree of Thoughts', detail: 'Yao et al. — search com BFS/DFS' },
            { when: 'Jul 2023', label: 'AutoGen v0.1', detail: 'Conversational multi-agent framework' },
            { when: 'Jan 2024', label: 'LangGraph + create_supervisor', detail: 'Pattern hierarchical idiomático' },
            { when: '2025', label: 'Critique do hype', detail: 'Anthropic/OpenAI publicam "use single agent first"' },
            { when: '2026', label: 'Maturidade', detail: 'Multi-agent reservado para casos justificados; tooling consolidado' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso combinar patterns?"
          a="Sim e frequentemente faz sentido. Exemplo real: Router → Supervisor → Workers, onde alguns workers usam Reflexion internamente. Camadas devem ser justificadas. Combinação canônica em prod 2026: outer LangGraph com router + supervisor, inner CrewAI para subprocessos lineares dentro de workers."
        />
        <QAItem
          q="Como evaluar multi-agent system?"
          a="Crítico: eval ponta-a-ponta (input final → output final) E eval por agente isoladamente. Sem o segundo, você não sabe qual agente é o gargalo. LangSmith captura ambos. Golden trajectories — sequências esperadas de chamadas — são valiosos."
        />
        <QAItem
          q="Latência: quanto adicional?"
          a="Por agente extra na cadeia sequencial: latência soma. Paralelos (debate, voting): max das latências individuais + agregação. Mediana em prod: single agent = 2–5s, multi-agent = 10–60s. Considere streaming progress ao usuário."
        />
        <QAItem
          q="Memória compartilhada entre agents?"
          a="Tipicamente via state TypedDict no LangGraph (lido por todos os nós). Em AutoGen, mensagens trafegadas. Em CrewAI, via context= das Tasks. Vector DB compartilhado é padrão para memória de longo prazo cross-agent."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'ReAct', v: 'Yao et al. "ReAct: Synergizing Reasoning and Acting". ICLR 2023' },
            { k: 'Reflexion', v: 'Shinn et al. "Reflexion: Language Agents with Verbal Reinforcement Learning". NeurIPS 2023. arXiv:2303.11366' },
            { k: 'Tree of Thoughts', v: 'Yao et al. "Tree of Thoughts: Deliberate Problem Solving with LLMs". NeurIPS 2023' },
            { k: 'Multi-Agent Debate', v: 'Liang et al. "Encouraging Divergent Thinking in LLMs through Multi-Agent Debate". arXiv:2305.19118 (2023)' },
            { k: 'Self-Consistency', v: 'Wang et al. "Self-Consistency Improves Chain of Thought Reasoning". ICLR 2023. arXiv:2203.11171' },
            { k: 'Plan-and-Solve', v: 'Wang et al. "Plan-and-Solve Prompting: Improving Zero-Shot Chain-of-Thought Reasoning". ACL 2023' },
            { k: 'Anthropic on Agents', v: 'anthropic.com/research/building-effective-agents (2024)' },
            { k: 'OpenAI Agents guide', v: 'platform.openai.com/docs/guides/agents-sdk' },
          ]}
        />
      </Section>
    </div>
  );
}
