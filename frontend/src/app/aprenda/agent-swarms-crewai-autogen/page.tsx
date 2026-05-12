import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, Timeline, DecisionBox, StackFlow, NodeGraph, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('agent-swarms-crewai-autogen');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a filosofia de design distinta do CrewAI?',
    options: [
      'Implementar agentes como threads do sistema operacional',
      'Hierárquica baseada em papéis (roles): cada agente tem role explícito (ex.: "Senior Engineer", "QA Specialist"), goal, backstory e ferramentas próprias. Crews orquestram agentes via Manager (delegação) ou Process sequencial — abstração inspirada em equipes humanas reais. Indica para tasks com papéis bem definidos',
      'Baseada em mensagens assíncronas estilo Erlang/Akka',
      'Implementa agentes como Python coroutines puras sem framework',
    ],
    correct: 1,
    explanation:
      'CrewAI (github.com/crewAIInc/crewAI, Lemos 2023+) foi desenhado com analogia de equipes humanas: Agents (com role/goal/backstory/tools), Tasks (descritas em linguagem natural), Crew (orquestrador). Suporta Process.sequential (cada agente passa pro próximo) e Process.hierarchical (Manager LLM delega tasks). Filosofia: "modele a equipe como você faria com humanos" — produto mais opinativo que AutoGen.',
  },
  {
    question: 'Qual a inovação do AutoGen v0.4 em relação a versões anteriores?',
    options: [
      'Migrou de Python para Rust',
      'Reescreveu a arquitetura sobre actor model assíncrono distribuído. Antes era request/response síncrono entre agentes (limitado). Agora cada agente é um actor independente com mailbox, suporta orquestração distribuída via gRPC, e separa Core (mensagens/actor) de AgentChat (high-level patterns). Permite swarms verdadeiramente paralelos e cross-host',
      'Adicionou suporte a quantum computing',
      'Eliminou completamente o uso de LLMs',
    ],
    correct: 1,
    explanation:
      'AutoGen v0.4 (Microsoft Research, lançado set/2024 — microsoft.github.io/autogen) foi reescrito do zero. Arquitetura agora baseada em actor model (inspirado Akka/Erlang): autogen-core fornece runtime de actors com mensagens tipadas; autogen-agentchat traz patterns high-level (RoundRobinGroupChat, SelectorGroupChat); autogen-ext integra LLMs/tools. Permite agents distribuídos via gRPC, durabilidade via streams.',
  },
  {
    question: 'Qual a proposta do OpenAI Swarm e por que é diferente?',
    options: [
      'É um framework comercial caro para empresas',
      'É um framework educacional minimalista (~300 linhas Python) que evita abstrações pesadas. Foco em dois primitivos: Agent (LLM + tools + instructions) e Handoff (um agente transfere conversa para outro retornando o próximo agente). Stateless, sem orchestrator central — ideal para protótipos e para entender o padrão sem framework lock-in',
      'É o sucessor direto do CrewAI',
      'Implementa agentes em GPU via CUDA',
    ],
    correct: 1,
    explanation:
      'OpenAI Swarm (github.com/openai/swarm) foi lançado em out/2024 como projeto educacional. Pequeno (~300 linhas), stateless, sem orchestrator. Dois primitivos: Agent (system_prompt + tools + model) e o conceito de handoff (uma tool retorna outro Agent, sinalizando transferência de conversa). Não é production-ready oficialmente — Microsoft/OpenAI evoluíram pra "OpenAI Agents SDK" em 2025 com features de produção.',
  },
  {
    question: 'Qual padrão multi-agent é o "supervisor / worker"?',
    options: [
      'Um sistema operacional gerencia agentes',
      'Um agente Supervisor (LLM com tools que listam outros agentes) recebe a task, decide qual agente especialista chamar, delega via tool call, recebe resultado, decide se chama outro, e finalmente responde. Workers são agentes especialistas (ex.: ResearcherAgent, CoderAgent, ReviewerAgent). Padrão dominante em LangGraph e CrewAI hierárquico',
      'Cada agente roda em container Docker próprio',
      'Implementação de Mutex para evitar race conditions',
    ],
    correct: 1,
    explanation:
      'Supervisor/worker (também chamado hierarchical, manager/workers) é o padrão multi-agent mais comum em produção. O supervisor é um LLM com prompt do tipo "você tem acesso aos seguintes agentes: [lista com descrições]. Decida qual chamar para a task". Os workers são agentes especialistas. LangGraph create_supervisor() implementa nativamente; CrewAI Process.hierarchical é versão idiomática; AutoGen SelectorGroupChat similar.',
  },
  {
    question: 'O que é o padrão "debate" em multi-agent?',
    options: [
      'Dois agentes votam entre opções',
      'Dois (ou mais) agentes adversariais argumentam pontos opostos sobre a mesma question, em rounds. Um agente final (judge) ou consenso decide a resposta. Liang et al. 2023 ("Encouraging Divergent Thinking in LLMs through Multi-Agent Debate") mostrou que debate melhora reasoning em ~10% vs single agent. Útil quando há ambiguidade ou risco de hallucination — adversarial setup força evidências',
      'Modelo decide entre dois prompts diferentes',
      'Sistema de votação majoritária de N modelos',
    ],
    correct: 1,
    explanation:
      'Multi-agent debate (Liang et al. 2023 — arxiv.org/abs/2305.19118, Du et al. 2023) é padrão onde N agentes (tipicamente 2–4) argumentam adversariamente. Cada round vê argumentos anteriores e responde. Após K rounds, judge decide ou agentes convergem. Empíricamente eleva accuracy em math/reasoning. Custo: K × N × tokens. CrewAI suporta via Tasks com context cruzado; LangGraph via subgraphs paralelos.',
  },
  {
    question: 'Quando você NÃO deve usar multi-agent?',
    options: [
      'Quando o dataset é pequeno',
      'Quando a task pode ser feita por single agent com tools — ~80–90% dos casos. Multi-agent adiciona latência (N× LLM calls), custo (N× tokens), fragilidade (cada handoff é ponto de falha) e dificuldade de debug. Use multi-agent só quando: (1) papéis são genuinamente independentes, (2) tasks paralelas e composáveis, (3) debate/voting agrega valor mensurável, (4) team complexity > single context window',
      'Quando você usa Python',
      'Quando há GPU disponível',
    ],
    correct: 1,
    explanation:
      'Antipattern comum em 2024–2025: usar multi-agent porque é hype. Realidade: single agent com bons tools resolve a maioria. Multi-agent vale quando há paralelização real (research + code + review em paralelo), separação de contexto (cada agente vê só seu subset), ou benefício empírico de debate. Antes de multi-agent, pergunte: "isso poderia ser uma tool call do agente principal?".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="agent-swarms-crewai-autogen"
      title="Agent swarms: CrewAI, AutoGen, OpenAI Swarm"
      icon="🐝"
      xp={70}
      readTime={14}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="langgraph-state-machines"
      nextTitle="LangGraph: agentes como state machines (com cycles)"
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
        Em 2026, três frameworks dominam orquestração multi-agent: CrewAI (hierarchical por papéis),
        AutoGen v0.4 (actor model assíncrono) e OpenAI Swarm (minimalista educacional).
        Cada um faz aposta filosófica distinta. Este módulo compara, mostra código real e — mais
        importante — explica quando NÃO usar multi-agent.
      </p>

      <Section title="O zoológico de frameworks" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Framework', 'Filosofia', 'Sweet spot', 'Limitação']}
          rows={[
            ['CrewAI', 'Papéis hierárquicos (role-based)', 'Equipes com responsabilidades claras', 'Opinativo, hard para padrões custom'],
            ['AutoGen v0.4', 'Actor model assíncrono', 'Sistemas distribuídos, paralelismo', 'Curva de aprendizado'],
            ['OpenAI Swarm', 'Minimal, handoff-based', 'Protótipos, ensino, handoffs simples', 'Não production-ready oficial'],
            ['LangGraph', 'State machines com cycles', 'Workflows com human-in-loop', 'Sintaxe verbosa (próximo módulo)'],
            ['Anthropic claude-agent-sdk', 'Linha única, tool use first', 'Agentes simples + reasoning', 'Não multi-agent nativo'],
            ['OpenAI Agents SDK', 'Successor do Swarm, production', 'Handoffs + guardrails + tracing', 'Lock-in OpenAI'],
          ]}
        />
      </Section>

      <Section title="CrewAI: agentes como equipe humana" accent={ACCENT}>
        <CodeBlock lang="python" filename="crew_research_pipeline.py">{`from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, WebsiteSearchTool

# Definir agentes com papéis explícitos
researcher = Agent(
    role="Senior Research Analyst",
    goal="Encontrar informação atualizada e factual sobre tecnologia",
    backstory="Veterano de 15 anos em research técnico, especialista em fact-checking",
    tools=[SerperDevTool(), WebsiteSearchTool()],
    llm="claude-sonnet-4-7",
    verbose=True,
)

writer = Agent(
    role="Technical Writer",
    goal="Escrever artigos técnicos claros e bem estruturados",
    backstory="Editor sênior, escreve para developers há 10 anos",
    llm="claude-sonnet-4-7",
    verbose=True,
)

reviewer = Agent(
    role="QA Specialist",
    goal="Revisar conteúdo técnico para precisão e clareza",
    backstory="Engenheira sênior com olho para erros sutis",
    llm="claude-opus-4-7",
    verbose=True,
)

# Tasks descrevem objetivos em linguagem natural
research_task = Task(
    description="Pesquise: estado atual de reasoning models em 2026",
    expected_output="Lista de 5 modelos com features, custos e benchmarks",
    agent=researcher,
)

write_task = Task(
    description="Escreva artigo de 800 palavras baseado no research",
    expected_output="Artigo em markdown com seções e citações",
    agent=writer,
    context=[research_task],
)

review_task = Task(
    description="Revise o artigo para precisão técnica e clareza",
    expected_output="Artigo final com correções aplicadas",
    agent=reviewer,
    context=[write_task],
)

crew = Crew(
    agents=[researcher, writer, reviewer],
    tasks=[research_task, write_task, review_task],
    process=Process.sequential,    # ou Process.hierarchical com manager
    verbose=True,
)

result = crew.kickoff()
print(result)`}</CodeBlock>
        <Callout tone="info">
          CrewAI brilha em pipelines lineares com papéis claros (research → write → review). Para
          fluxos com loops, condicionais, human-in-loop, LangGraph é melhor.
        </Callout>
      </Section>

      <Section title="AutoGen v0.4: actor model" accent={ACCENT}>
        <CodeBlock lang="python" filename="autogen_actor_swarm.py">{`# AutoGen v0.4 (Microsoft, set/2024+)
import asyncio
from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import SelectorGroupChat
from autogen_agentchat.conditions import TextMentionTermination, MaxMessageTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

async def main():
    model_client = OpenAIChatCompletionClient(model="gpt-4o")

    planner = AssistantAgent(
        name="Planner",
        system_message="Você é o planejador. Decomponha tasks complexas em subtasks claras.",
        model_client=model_client,
    )

    coder = AssistantAgent(
        name="Coder",
        system_message="Você escreve Python. Use ferramentas para executar e validar.",
        model_client=model_client,
        tools=[execute_python],
    )

    critic = AssistantAgent(
        name="Critic",
        system_message="Revise o código. Quando aprovado, diga 'TERMINATE'.",
        model_client=model_client,
    )

    # SelectorGroupChat: LLM escolhe próximo agente baseado no contexto
    termination = TextMentionTermination("TERMINATE") | MaxMessageTermination(10)

    team = SelectorGroupChat(
        participants=[planner, coder, critic],
        model_client=model_client,
        termination_condition=termination,
    )

    result = await team.run(task="Calcule o 100º número primo")
    print(result)

asyncio.run(main())`}</CodeBlock>
        <Callout tone="warn">
          AutoGen v0.4 é totalmente async — não há mais APIs síncronas. Migração de v0.2 exige
          reescrita. Trade-off: paralelismo nativo e distribuição via autogen-core gRPC.
        </Callout>
      </Section>

      <Section title="OpenAI Swarm: minimal e didático" accent={ACCENT}>
        <CodeBlock lang="python" filename="swarm_triage.py">{`# OpenAI Swarm — github.com/openai/swarm
from swarm import Swarm, Agent

client = Swarm()

def transfer_to_billing():
    return billing_agent

def transfer_to_technical():
    return technical_agent

triage_agent = Agent(
    name="Triage",
    instructions="Determine se o usuário precisa de billing ou suporte técnico. "
                 "Use as funções de transfer.",
    functions=[transfer_to_billing, transfer_to_technical],
)

billing_agent = Agent(
    name="Billing",
    instructions="Você é especialista em billing. Ajude com cobranças e refunds.",
)

technical_agent = Agent(
    name="Technical",
    instructions="Você é engenheiro de suporte técnico. Ajude com bugs e configuração.",
)

response = client.run(
    agent=triage_agent,
    messages=[{"role": "user", "content": "Fui cobrado duas vezes esse mês"}],
)
# Triage detecta billing, chama transfer_to_billing() que retorna billing_agent.
# Swarm internamente substitui agent ativo e continua.
print(response.messages[-1]["content"])
print(f"Agente final: {response.agent.name}")`}</CodeBlock>
        <Callout tone="info">
          A genialidade do Swarm: handoff é apenas uma função que retorna outro Agent. Sem
          orquestrador externo, sem estado central. Em ~300 linhas você entende padrão multi-agent.
          Para produção em 2026, OpenAI Agents SDK é o sucessor oficial.
        </Callout>
      </Section>

      <Section title="Padrões multi-agent canônicos" accent={ACCENT}>
        <NodeGraph
          accent={ACCENT}
          title="Padrões e relações"
          columns={[
            {
              label: 'Estruturais',
              nodes: [
                { label: 'Supervisor/Worker', sub: 'Manager LLM delega' },
                { label: 'Sequential', sub: 'A → B → C linear' },
                { label: 'Parallel fan-out', sub: 'A → {B,C,D} paralelo' },
              ],
            },
            {
              label: 'Cognitivos',
              nodes: [
                { label: 'Debate', sub: '2 agentes adversariais' },
                { label: 'Voting/Consensus', sub: 'N agentes votam' },
                { label: 'Planner-Executor', sub: 'Plan + execute separados' },
              ],
            },
            {
              label: 'Reativos',
              nodes: [
                { label: 'ReAct', sub: 'Think → Act → Observe loop' },
                { label: 'Reflexion', sub: 'Self-critique loop' },
                { label: 'Tree of Thoughts', sub: 'Branching com search' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Decisão: qual framework escolher" accent={ACCENT}>
        <DecisionBox
          scenario="Você precisa montar pipeline de criação de conteúdo: research, escrita, fact-check, edição. Papéis bem definidos, fluxo majoritariamente sequencial."
          winner="CrewAI"
          winnerColor={ACCENT}
          why="Papéis explícitos e fluxo sequencial são o sweet spot do CrewAI. Process.sequential com 4 agentes (Researcher, Writer, FactChecker, Editor) é idiomático. Custo cognitivo mínimo, código legível."
          alternatives={[
            { name: 'LangGraph', note: 'Mais flexível mas verbose para pipeline linear' },
            { name: 'AutoGen', note: 'Vale quando há paralelismo real entre subtasks' },
          ]}
        />
        <DecisionBox
          scenario="Você está construindo sistema distribuído com agents em hosts diferentes que se comunicam por mensagens, alta concorrência."
          winner="AutoGen v0.4"
          winnerColor={ACCENT}
          why="autogen-core é actor model nativo com gRPC transport. Único framework com cross-host real em 2026. CrewAI e Swarm são in-process."
          alternatives={[
            { name: 'LangGraph + custom', note: 'Possível mas você implementa transport sozinho' },
          ]}
        />
      </Section>

      <Section title="Timeline dos frameworks" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Jul 2023', label: 'LangChain agents', detail: 'Primeiro framework popular — ReAct, function calling' },
            { when: 'Set 2023', label: 'AutoGen v0.1 (Microsoft)', detail: 'Wu et al. — agentic conversation framework' },
            { when: 'Nov 2023', label: 'CrewAI', detail: 'Lemos — role-based abstraction' },
            { when: 'Jan 2024', label: 'LangGraph', detail: 'LangChain spin-off para state machines' },
            { when: 'Out 2024', label: 'OpenAI Swarm', detail: 'Educational release' },
            { when: 'Set 2024', label: 'AutoGen v0.4', detail: 'Reescrita actor model', highlight: true },
            { when: '2025', label: 'OpenAI Agents SDK', detail: 'Sucessor production-ready do Swarm' },
            { when: '2025', label: 'Anthropic Computer Use', detail: 'Claude controla mouse/teclado — paradigma agente novo' },
            { when: '2026', label: 'Convergência', detail: 'MCP padroniza tool interface; A2A protocol surge' },
          ]}
        />
      </Section>

      <Section title="Stack mental para multi-agent" accent={ACCENT}>
        <StackFlow
          accent={ACCENT}
          title="Antes de codar, decida:"
          items={[
            { label: '1. Multi-agent é realmente necessário?', detail: '80% dos casos: single agent + tools resolve. Question every additional agent' },
            { label: '2. Padrão arquitetural', detail: 'Supervisor? Sequential? Debate? Padrão errado → frágil' },
            { label: '3. Estado compartilhado', detail: 'Como agentes compartilham contexto? Memory store? Database? Mensagens?' },
            { label: '4. Failure handling', detail: 'Quando agente falha, retry, skip, ou cascade? Defina explícito' },
            { label: '5. Observabilidade', detail: 'LangSmith/Helicone capturando trace cross-agent é não-negociável' },
            { label: '6. Custo previsto', detail: '$ por execução completa do pipeline. Pode subir 5–20× vs single agent' },
            { label: '7. Latência aceitável', detail: 'Agents sequenciais somam latências. 30s + 30s + 30s = 90s — UX OK?' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso combinar frameworks? CrewAI + LangGraph?"
          a="Sim — em produção é comum. CrewAI para subprocessos lineares dentro de nodos LangGraph (que gere o fluxo geral). Ou AutoGen para subsystems distribuídos dentro de orquestração LangGraph. Cuidado com tracing fragmentado."
        />
        <QAItem
          q="Latência: paralelo realmente acelera?"
          a="Depende. Se workers são independentes (research APIs distintas), sim — pode dividir tempo por N. Se há dependências (Writer precisa do output do Researcher), latência total = soma. AutoGen e LangGraph permitem fan-out explícito; CrewAI tem Process.parallel limitado."
        />
        <QAItem
          q="MCP (Model Context Protocol) substitui frameworks?"
          a="Não. MCP padroniza interface de tools (servers expõem tools/resources/prompts), mas não orquestra agentes. Pense MCP como o 'USB-C de tools' — agnóstico de framework. CrewAI/AutoGen/LangGraph podem consumir MCP servers como tools."
        />
        <QAItem
          q="Multi-agent é o futuro ou hype?"
          a="Ambos. Para tasks com paralelismo real ou debate empiricamente valioso, é futuro. Para 'usar multi-agent porque sim', é hype. A próxima fronteira (2026+) é agentes de longa duração (long-running, stateful, dias/semanas) — distinta de swarms reativos."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'CrewAI', v: 'github.com/crewAIInc/crewAI — docs: docs.crewai.com' },
            { k: 'AutoGen v0.4', v: 'microsoft.github.io/autogen — paper: Wu et al. arXiv:2308.08155 (2023)' },
            { k: 'OpenAI Swarm', v: 'github.com/openai/swarm — educational' },
            { k: 'OpenAI Agents SDK', v: 'openai.github.io/openai-agents-python — successor production' },
            { k: 'Multi-Agent Debate', v: 'Liang et al. "Encouraging Divergent Thinking in LLMs through Multi-Agent Debate". arXiv:2305.19118 (2023)' },
            { k: 'ReAct', v: 'Yao et al. "ReAct: Synergizing Reasoning and Acting in Language Models". ICLR 2023' },
            { k: 'Tree of Thoughts', v: 'Yao et al. "Tree of Thoughts: Deliberate Problem Solving with LLMs". NeurIPS 2023' },
            { k: 'MCP', v: 'modelcontextprotocol.io — Anthropic open spec, dez/2024' },
          ]}
        />
      </Section>
    </div>
  );
}
