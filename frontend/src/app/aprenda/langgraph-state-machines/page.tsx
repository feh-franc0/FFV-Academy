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

export const metadata = getModuleMetadata('langgraph-state-machines');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que o LangGraph adotou o modelo de state machine ao invés de DAG (como Airflow)?',
    options: [
      'Porque DAG é deprecated em sistemas modernos',
      'Agentes precisam de CICLOS — retry, refinement, debate, ReAct loops. DAG (grafo acíclico) proíbe ciclos por definição. State machines permitem nós retornarem ao mesmo estado, condicionais, e iteração até critério de parada. Airflow/Prefect são para data pipelines batch determinísticos; LangGraph é para agentes adaptativos',
      'State machines são mais rápidos computacionalmente',
      'Por compatibilidade com Erlang/OTP',
    ],
    correct: 1,
    explanation:
      'A motivação técnica do LangGraph (lançado jan/2024 como spin-off do LangChain) foi explicitamente cycles: agentes ReAct precisam loops (think → act → observe → repeat), refinement precisa "tentar de novo", debate precisa multi-round. DAGs do Airflow proíbem ciclos. State machines (formalmente: cyclic directed graphs) permitem qualquer topologia + condicionais explícitos. Docs: langchain-ai.github.io/langgraph.',
  },
  {
    question: 'O que é um StateGraph no LangGraph e qual seu objeto central?',
    options: [
      'É um wrapper sobre PyTorch Tensor',
      'É a abstração principal: define nós (funções que transformam estado) e arestas (transições, possivelmente condicionais). O estado é tipado (TypedDict ou Pydantic) e cada nó retorna uma atualização parcial — LangGraph faz merge automático usando reducers (operator.add para listas, last-write-wins para escalares por default)',
      'É uma classe que herda de nx.DiGraph do NetworkX',
      'É um proxy para Redis Streams',
    ],
    correct: 1,
    explanation:
      'StateGraph é a abstração central. Estado é TypedDict (ou Pydantic BaseModel). Nós são funções: state → partial_state_update. Arestas são .add_edge("a", "b") ou .add_conditional_edges("a", router_fn) onde router_fn retorna o nome do próximo nó. Reducers em Annotated[list, operator.add] dizem como mergear atualizações. .compile() produz um objeto Runnable executável.',
  },
  {
    question: 'O que é "checkpointing" em LangGraph e por que é crítico para human-in-loop?',
    options: [
      'Salva o modelo em S3 periodicamente',
      'Persiste o estado completo do grafo a cada nó executado (em SQLite, Postgres, Redis, ou memory). Permite (1) pausar execução em qualquer nó e retomar depois — base do human-in-loop, (2) "time travel" — voltar a um estado anterior e reexecutar, (3) crash recovery — retomar de onde parou após falha. Cada checkpoint tem thread_id (identifica conversação) + checkpoint_id (identifica ponto no tempo)',
      'Salva apenas o último output do LLM',
      'Otimização de cache para reduzir custo de inferência',
    ],
    correct: 1,
    explanation:
      'LangGraph checkpointers (MemorySaver, SqliteSaver, PostgresSaver, RedisSaver) persistem o estado completo após cada nó. Possibilita: (1) human-in-loop — interrupt_before=["node_x"] pausa antes de executar, humano aprova/edita state, depois resume; (2) time travel — list_state_history e update_state em pontos anteriores; (3) crash recovery; (4) multi-turn conversas com thread_id. É a feature killer do LangGraph para produção.',
  },
  {
    question: 'O que é um subgraph no LangGraph?',
    options: [
      'Um grafo menor que é executado em GPU separada',
      'Um StateGraph compilado que pode ser usado como UM nó de outro StateGraph. Permite composição hierárquica — ex.: o nó "research" do grafo principal é internamente um subgrafo com 5 nós que coordena research. Estados podem ser compartilhados parcialmente (mesmos keys) ou totalmente isolados. Essencial para sistemas grandes',
      'Um sub-rotina em CUDA',
      'Sinônimo de subprocesso Python',
    ],
    correct: 1,
    explanation:
      'Subgraphs são StateGraphs compilados usados como nós de outro StateGraph. Permitem hierarquia limpa: parent_graph coordena fluxo geral, subgrafos encapsulam lógica de áreas específicas (research, code, review). Estado é compartilhado via keys com mesmo nome no schema parent e child, isolado caso contrário. Padrão: supervisor parent + worker subgraphs especializados.',
  },
  {
    question: 'Como o LangGraph implementa human-in-the-loop tecnicamente?',
    options: [
      'Via websocket que pausa o backend até user responder',
      'Via interrupt_before/interrupt_after no compile() — quando o engine chega no nó marcado, salva checkpoint e retorna controle ao caller. O backend code fica livre. Quando o human aprova, código chama graph.invoke(None, config) com mesmo thread_id — engine retoma do checkpoint, executa nó pausado e continua. Stateless do ponto de vista do servidor',
      'Via threading com Event/Condition',
      'Via daemon process em background',
    ],
    correct: 1,
    explanation:
      'interrupt_before/interrupt_after=["node_name"] no compile() faz o engine pausar antes/depois desses nós. Implementação: ao chegar no nó, salva checkpoint via checkpointer, retorna controle. O server pode responder à request HTTP "aguardando aprovação". Quando humano aprova (ex.: outro endpoint), código chama graph.invoke(None, {"configurable": {"thread_id": tid}}) que carrega checkpoint e retoma. Padrão stateless escalável.',
  },
  {
    question: 'Por que a LangChain abandonou LCEL (LangChain Expression Language) em favor do LangGraph?',
    options: [
      'LCEL era mais lento',
      'LCEL (RunnableSequence | RunnableParallel) é elegante para pipelines lineares mas inadequado para fluxos com cycles, condicionais complexos, state mutation explícita e human-in-loop. Em 2024, LangChain anunciou: pipelines simples continuam em LCEL, agentes vão para LangGraph. LangGraph não é replacement do LangChain core, é a nova camada de orquestração para casos complexos',
      'LCEL não suportava OpenAI',
      'Por exigência regulatória do EU AI Act',
    ],
    correct: 1,
    explanation:
      'LCEL permanece útil para pipelines simples (chain = prompt | llm | parser). LangGraph é o sucessor para agentic workflows complexos. Anúncio oficial em blog.langchain.dev: "for complex agentic flows, prefer LangGraph". Não é deprecation — é divisão de responsabilidades: LCEL para composição declarativa simples, LangGraph para state machines com cycles, conditionals e persistence.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="langgraph-state-machines"
      title="LangGraph: agentes como state machines (com cycles)"
      icon="🕸️"
      xp={75}
      readTime={15}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="multi-agent-orchestration"
      nextTitle="Multi-agent orchestration patterns avançados"
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
        Quando um agente precisa de loops (ReAct), human-in-loop, persistência de estado entre
        sessões e cycles condicionais, o paradigma DAG (Airflow, Prefect, Dagster) é insuficiente.
        LangGraph (lançado jan/2024 pela LangChain) trouxe state machines explícitas para LLMs:
        nós, arestas, reducers, checkpointers e time travel — vocabulário inspirado em XState e
        Erlang/OTP mas adaptado para o cenário de agentes.
      </p>

      <Section title="O que LangGraph traz que LCEL não tinha" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Necessidade', 'LCEL (RunnableSequence)', 'LangGraph (StateGraph)']}
          rows={[
            ['Pipeline linear', 'Idiomático: a | b | c', 'Funciona mas verbose'],
            ['Cycles (ReAct loop)', 'Impossível', 'Nativo: add_edge("act", "think")'],
            ['Conditional routing', 'RunnableBranch (limitado)', 'add_conditional_edges()'],
            ['State mutation explícita', 'Estado passa via chains', 'TypedDict + reducers'],
            ['Human-in-the-loop', 'Manual', 'interrupt_before/after'],
            ['Persistência entre requests', 'Manual', 'Checkpointer (Sqlite/Postgres/Redis)'],
            ['Time travel', 'Não', 'get_state_history + update_state'],
            ['Subgraphs/hierarquia', 'Composição funcional', 'Subgraphs como nós'],
            ['Observabilidade', 'LangSmith básico', 'LangSmith com hierarquia full'],
          ]}
        />
      </Section>

      <Section title="Hello LangGraph — agente ReAct mínimo" accent={ACCENT}>
        <CodeBlock lang="python" filename="react_agent.py">{`from typing import TypedDict, Annotated, Sequence
import operator
from langgraph.graph import StateGraph, START, END
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage, ToolMessage
from langchain_core.tools import tool

# 1. State schema
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], operator.add]  # reducer: concat

# 2. Tools
@tool
def get_weather(city: str) -> str:
    """Retorna a temperatura atual da cidade."""
    return f"Em {city}: 22°C, ensolarado"

tools = [get_weather]
model = ChatAnthropic(model="claude-sonnet-4-7").bind_tools(tools)

# 3. Nodes
def call_model(state: AgentState) -> dict:
    response = model.invoke(state["messages"])
    return {"messages": [response]}

def call_tool(state: AgentState) -> dict:
    last_message = state["messages"][-1]
    tool_calls = last_message.tool_calls
    outputs = []
    for tc in tool_calls:
        tool_fn = {t.name: t for t in tools}[tc["name"]]
        result = tool_fn.invoke(tc["args"])
        outputs.append(ToolMessage(content=str(result), tool_call_id=tc["id"]))
    return {"messages": outputs}

# 4. Conditional router
def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]
    if not last_message.tool_calls:
        return END
    return "tools"

# 5. Build graph
graph = StateGraph(AgentState)
graph.add_node("agent", call_model)
graph.add_node("tools", call_tool)
graph.add_edge(START, "agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")  # ⬅️ CICLO — volta ao agente após tool

app = graph.compile()

result = app.invoke({"messages": [HumanMessage("Qual a temperatura em São Paulo?")]})
for m in result["messages"]:
    print(f"{m.type}: {m.content[:80]}")`}</CodeBlock>
        <Callout tone="info">
          O ciclo <InlineCode>tools → agent</InlineCode> é o coração do ReAct. O agente pode chamar
          tools quantas vezes precisar antes de decidir responder ao usuário. DAG proibiria isso.
        </Callout>
      </Section>

      <Section title="Checkpointing e time travel" accent={ACCENT}>
        <CodeBlock lang="python" filename="checkpointing.py">{`from langgraph.checkpoint.postgres import PostgresSaver

# Checkpointer persiste estado a cada nó
checkpointer = PostgresSaver.from_conn_string("postgresql://localhost/langgraph")
checkpointer.setup()

app = graph.compile(checkpointer=checkpointer)

# thread_id identifica a conversa
config = {"configurable": {"thread_id": "user-42-conv-1"}}

# Primeira mensagem
app.invoke({"messages": [HumanMessage("Olá")]}, config=config)

# Segunda mensagem — engine carrega estado anterior
app.invoke({"messages": [HumanMessage("Continuando: temperatura em SP?")]}, config=config)

# Time travel — listar histórico
for snapshot in app.get_state_history(config):
    print(f"Step {snapshot.metadata['step']}: next={snapshot.next}")
    print(f"  Messages: {len(snapshot.values['messages'])}")

# Voltar a um estado específico e bifurcar
target = list(app.get_state_history(config))[3]   # snapshot de 3 steps atrás
new_config = app.update_state(target.config, {"messages": [HumanMessage("Pergunta diferente")]})
app.invoke(None, new_config)   # executa a partir do snapshot bifurcado`}</CodeBlock>
        <Callout tone="warn">
          Time travel cria thread_id implícitos novos quando você bifurca. Em produção, isso explode
          rapidamente se não houver TTL/cleanup. Postgres com partitioning por thread_id é o padrão.
        </Callout>
      </Section>

      <Section title="Human-in-the-loop" accent={ACCENT}>
        <CodeBlock lang="python" filename="human_in_loop.py">{`# Cenário: agente sugere ação destrutiva, humano precisa aprovar
from langgraph.graph import StateGraph
from langgraph.checkpoint.memory import MemorySaver

class State(TypedDict):
    messages: Annotated[list, operator.add]
    pending_action: dict | None

def plan(state):
    # LLM propõe ação destrutiva (ex.: deletar arquivo)
    return {"pending_action": {"type": "delete", "target": "/tmp/important.db"}}

def execute(state):
    action = state["pending_action"]
    # Em produção: subprocess.run / API call etc.
    return {"messages": [AIMessage(f"Executado: {action}")]}

graph = StateGraph(State)
graph.add_node("plan", plan)
graph.add_node("execute", execute)
graph.add_edge(START, "plan")
graph.add_edge("plan", "execute")
graph.add_edge("execute", END)

# 🛑 PAUSAR antes de "execute" para esperar aprovação
app = graph.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["execute"],
)

config = {"configurable": {"thread_id": "req-1"}}
result = app.invoke({"messages": [], "pending_action": None}, config)
print("Pausado em:", app.get_state(config).next)
# > Pausado em: ('execute',)

# Backend retorna ao usuário: "Aprovar deletar /tmp/important.db?"
# Frontend mostra modal, usuário clica em "Aprovar"

# Resume — invoke com None continua do checkpoint
app.invoke(None, config)`}</CodeBlock>
      </Section>

      <Section title="Arquitetura interna do StateGraph" accent={ACCENT}>
        <ArchFlow
          accent={ACCENT}
          title="Componentes de um LangGraph deployment"
          columns={[
            {
              header: 'Definição',
              items: [
                'StateGraph(SchemaTypedDict)',
                'add_node(name, fn)',
                'add_edge(a, b) — estática',
                'add_conditional_edges(a, router)',
                '.compile(checkpointer, interrupts)',
              ],
            },
            {
              header: 'Runtime',
              items: [
                'Pregel-inspired engine',
                'BSP-style step (parallel nodes)',
                'Reducer merge automático',
                'Conditional routing após cada step',
                'Stream events para observability',
              ],
            },
            {
              header: 'Persistência',
              items: [
                'MemorySaver (dev/test)',
                'SqliteSaver (single-node)',
                'PostgresSaver (produção)',
                'RedisSaver (latência crítica)',
                'AsyncCheckpointer para alta concorrência',
              ],
            },
            {
              header: 'Deploy',
              items: [
                'LangGraph Cloud (managed)',
                'LangGraph Server (self-hosted)',
                'FastAPI wrapper custom',
                'Stream via SSE/Websocket',
                'LangSmith integration nativa',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Fluxo de decisão: quando usar LangGraph" accent={ACCENT}>
        <DecisionBox
          scenario="Você precisa de um agente que pesquisa, propõe um plano, espera aprovação humana, depois executa em múltiplas etapas com retry em falhas."
          winner="LangGraph com interrupt_before + PostgresSaver"
          winnerColor={ACCENT}
          why="Os 4 requisitos (multi-step, human approval, persistência entre requests, retry com cycles) são exatamente o caso de uso primário. LCEL não suporta human-in-loop nativo; CrewAI não tem cycles + retry idiomático; AutoGen funciona mas é overkill para sequência linear com 1 interrupt."
          alternatives={[
            { name: 'CrewAI hierarchical', note: 'Funciona se cycles forem raros e human-in-loop pode ser hack via tool' },
            { name: 'AutoGen v0.4', note: 'Excessivo para 1 thread de execução — actor model agrega complexidade' },
            { name: 'Lógica custom + LCEL', note: 'Possível mas você reimplementa checkpointer e time travel' },
          ]}
        />
        <FlowDiagram
          accent={ACCENT}
          title="Árvore de decisão"
          orientation="vertical"
          steps={[
            { icon: '🔄', label: 'Precisa de cycles ou conditionals?', desc: 'Se não → LCEL basta' },
            { icon: '⏸️', label: 'Precisa human-in-loop?', desc: 'Se sim → LangGraph wins' },
            { icon: '💾', label: 'Precisa estado entre requests?', desc: 'Se sim → LangGraph com checkpointer' },
            { icon: '🌐', label: 'Precisa distribuição cross-host?', desc: 'AutoGen v0.4 supera aqui' },
            { icon: '👥', label: 'Múltiplos papéis especializados?', desc: 'CrewAI mais idiomático' },
          ]}
        />
      </Section>

      <Section title="Timeline do LangGraph" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Out 2022', label: 'LangChain v0.0', detail: 'Harrison Chase — primeira versão' },
            { when: 'Set 2023', label: 'LCEL', detail: 'LangChain Expression Language — composição via pipe' },
            { when: 'Jan 2024', label: 'LangGraph 0.1', detail: 'StateGraph + checkpointer — spin-off para agentes', highlight: true },
            { when: 'Mai 2024', label: 'LangGraph Cloud', detail: 'Managed deployment com long-running threads' },
            { when: 'Out 2024', label: 'LangGraph Studio', detail: 'Visual debugging IDE — time travel UI' },
            { when: '2025', label: 'create_react_agent unified', detail: 'High-level API replicando ReAct em uma chamada' },
            { when: '2025', label: 'Subgraphs maduros', detail: 'Composição hierárquica como padrão de produção' },
            { when: '2026', label: 'MCP integration', detail: 'Tools MCP-native, padronizando com Anthropic/OpenAI' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="LangGraph requer LangChain?"
          a="Você pode usar LangGraph sem cadeias LCEL — só StateGraph + funções Python puras. Mas a maioria dos exemplos usa ChatModels da LangChain por conveniência. Tools podem ser plain Python functions decoradas com @tool ou objetos da LangChain."
        />
        <QAItem
          q="Como observar/debugar?"
          a="LangSmith é integração first-class — toda chamada de nó vira span. Sem LangSmith, app.stream() emite events de cada step e você loga manualmente. LangGraph Studio (Electron app gratuito) dá visualização de grafo com time travel."
        />
        <QAItem
          q="Latência em produção?"
          a="Checkpointer add ~10–50ms por nó. PostgresSaver com pgbouncer + connection pool é o padrão para alta carga. Se latência é crítica, RedisSaver é ~10× mais rápido mas requer cleanup explícito (sem TTL nativo para checkpoints)."
        />
        <QAItem
          q="Posso ter centenas de threads concorrentes?"
          a="Sim. Thread_id é a unidade de isolamento. Postgres com particionamento por thread_id escala para milhares concorrentes. LangGraph Cloud gerencia isso automaticamente. Para self-hosted, async checkpointer + uvloop é setup recomendado."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'LangGraph docs', v: 'langchain-ai.github.io/langgraph' },
            { k: 'LangGraph GitHub', v: 'github.com/langchain-ai/langgraph' },
            { k: 'LCEL → LangGraph migration', v: 'blog.langchain.dev/langgraph (jan 2024 launch post)' },
            { k: 'Pregel paper', v: 'Malewicz et al. "Pregel: A System for Large-Scale Graph Processing". SIGMOD 2010 — inspiração do engine' },
            { k: 'ReAct', v: 'Yao et al. "ReAct: Synergizing Reasoning and Acting in Language Models". ICLR 2023' },
            { k: 'LangGraph Studio', v: 'github.com/langchain-ai/langgraph-studio' },
            { k: 'Persistência', v: 'langchain-ai.github.io/langgraph/concepts/persistence' },
          ]}
        />
      </Section>
    </div>
  );
}
