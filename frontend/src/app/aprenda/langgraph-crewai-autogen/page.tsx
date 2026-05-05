import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('langgraph-crewai-autogen');

const ACCENT = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a principal vantagem do LangGraph sobre LangChain chains para agentes com ciclos?',
    options: [
      'LangGraph é mais rápido em benchmarks de inferência para todos os tipos de pipeline',
      'LangGraph modela o agente como grafo de estado com suporte nativo a ciclos e branches condicionais — permite loops de retentativa, planos que se adaptam a resultados intermediários, e múltiplos caminhos de execução que LangChain chains lineares não conseguem expressar facilmente',
      'LangGraph é exclusivo para modelos GPT da OpenAI; LangChain suporta mais providers',
      'LangGraph tem melhor integração com vector stores que LangChain',
    ],
    correct: 1,
    explanation:
      'LangChain chains são DAGs (acíclicos). LangGraph é um grafo com ciclos — permite que nós retornem a estados anteriores. Isso habilita: retentativas quando uma ferramenta falha, planos de multi-step que se adaptam aos resultados, agentes com loop de observação/replanejamento, e múltiplos agentes coordenados como nós no grafo. O estado é explícito e tipado, facilitando debugging.',
  },
  {
    question: 'Como CrewAI organiza agentes e qual é o conceito central de "crew"?',
    options: [
      'Crew é apenas um nome alternativo para pipeline sequencial de LLM calls',
      'Uma crew é um time de agentes especializados com roles, goals e backstories distintos que colaboram em uma task compartilhada — cada agente tem ferramentas próprias e o CrewAI orquestra a colaboração (sequencial, paralela ou hierárquica)',
      'CrewAI só suporta agentes idênticos clonados em paralelo para processamento batch',
      'Crew se refere a um conjunto de prompts encadeados sem agentes independentes',
    ],
    correct: 1,
    explanation:
      'CrewAI modela times de agentes especializados. Um agente tem: role ("Senior Data Analyst"), goal ("encontrar insights nos dados"), backstory (contexto que molda o comportamento), e tools (ferramentas disponíveis). A crew define como os agentes colaboram: Process.sequential (um de cada vez, output vira input do próximo), Process.hierarchical (manager agent delega para workers). Simula como times humanos funcionam.',
  },
  {
    question: 'O que diferencia AutoGen de LangGraph e CrewAI em sua abordagem de comunicação?',
    options: [
      'AutoGen é o único que suporta modelos locais como Ollama',
      'AutoGen baseia-se em conversas multi-agente: agentes trocam mensagens em formato de chat, podem ser humanos ou LLMs, e a coordenação emerge da troca de mensagens em vez de grafo de estado explícito ou times com roles — mais flexível mas menos previsível',
      'AutoGen é apenas um wrapper de LangChain para facilitar o uso com GPT-4',
      'A diferença é apenas cosmética — todos os frameworks produzem os mesmos resultados',
    ],
    correct: 1,
    explanation:
      'AutoGen (Microsoft) modela agentes como participantes de uma conversa. GroupChat orquestra múltiplos agentes que se comunicam via mensagens. A coordenação é menos estruturada que LangGraph (sem grafo explícito) e menos prescritiva que CrewAI (sem roles rígidos). Isso dá flexibilidade para padrões emergentes mas torna o comportamento mais difícil de prever e debugar em produção. Ideal para experimentos e pesquisa.',
  },
  {
    question: 'Quando é melhor construir sem framework em vez de usar LangGraph/CrewAI/AutoGen?',
    options: [
      'Nunca — sempre use um framework estabelecido para qualquer sistema de agentes',
      'Quando o fluxo é simples e bem definido (pipeline determinístico, 2-3 ferramentas), quando você precisa de controle total sobre a lógica de retry/erro/custo, ou quando os frameworks adicionam abstração que dificulta debugging — código imperativo direto com os SDKs dos providers é mais previsível e manutenível',
      'Frameworks só devem ser evitados quando o time tem menos de 5 desenvolvedores',
      'Apenas quando o modelo LLM escolhido não é suportado pelo framework',
    ],
    correct: 1,
    explanation:
      'Frameworks introduzem abstrações que resolvem problemas genéricos mas podem obscurecer o que está acontecendo. Para um pipeline de 3 etapas fixas, um script Python de 100 linhas com calls diretos à API é mais transparente, mais fácil de debugar, e tem menos dependências que LangGraph. A regra: use framework quando o problema é genuinamente complexo (ciclos, múltiplos agentes, coordenação dinâmica). Para casos simples, o código imperativo vence.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="langgraph-crewai-autogen"
      title="LangGraph, CrewAI e AutoGen: frameworks de orquestração de agentes"
      icon="⚙️"
      xp={80}
      readTime={17}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="multi-agent-systems"
      nextTitle="Multi-Agent Systems: orquestração de agentes em escala"
      relatedSlugs={['multi-agent-systems', 'agentes-padroes', 'react-raciocinio-acao']}
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
        Em 2024-2025, o mercado de frameworks de orquestração de agentes explodiu. LangGraph, CrewAI e AutoGen
        se tornaram os três mais adotados, cada um com filosofia diferente. Escolher o framework errado para
        o problema errado é uma das causas mais comuns de projetos de agentes que nunca chegam a produção.
      </p>

      <Section title="Comparação de alto nível" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Framework', 'Modelo mental', 'Ponto forte', 'Ponto fraco']}
          rows={[
            ['LangGraph', 'Grafo de estado com ciclos', 'Controle explícito de fluxo, debugging', 'Curva de aprendizado, verboso'],
            ['CrewAI', 'Time de agentes especializados', 'Rapidez de prototipagem, roles claros', 'Menos controle fino, "mágica" interna'],
            ['AutoGen', 'Conversa multi-agente', 'Flexibilidade, humano-in-the-loop fácil', 'Imprevisibilidade, difícil de produtizar'],
            ['Sem framework', 'Código imperativo direto', 'Controle total, debugging trivial', 'Mais código para casos complexos'],
          ]}
        />
        <Callout tone="info">
          Nenhum framework é melhor em todos os casos. LangGraph domina em produção por seu controle explícito.
          CrewAI é o mais popular para prototipagem rápida. AutoGen é forte em pesquisa e experimentos.
          Para muitos casos de produção, código sem framework é a escolha mais sábia.
        </Callout>
      </Section>

      <Section title="LangGraph: grafo de estado com ciclos" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          LangGraph modela agentes como máquinas de estado. O estado é tipado, transições são explícitas,
          ciclos são suportados nativamente — ideal para agentes com loop de observação/replanejamento.
        </p>
        <CodeBlock lang="python">{`# pip install langgraph langchain-anthropic
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import BaseMessage, HumanMessage
from typing import TypedDict, Annotated
import operator

# 1. Definir estado do agente
class AgentState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]  # append
    attempts: int                                           # contador de tentativas

# 2. Definir ferramentas
from langchain_core.tools import tool

@tool
def search_database(query: str) -> str:
    """Busca informações no banco de dados interno."""
    # implementação real aqui
    return f"Resultados para '{query}': [dados simulados]"

@tool
def execute_query(sql: str) -> str:
    """Executa uma query SQL e retorna os resultados."""
    return f"Resultado da query: [dados simulados]"

tools = [search_database, execute_query]
tool_node = ToolNode(tools)

# 3. Definir LLM com tools
model = ChatAnthropic(model="claude-sonnet-4-6").bind_tools(tools)

# 4. Nó de decisão (call LLM)
def call_model(state: AgentState) -> dict:
    response = model.invoke(state["messages"])
    return {
        "messages": [response],
        "attempts": state["attempts"] + 1,
    }

# 5. Condicional: continuar ou finalizar?
def should_continue(state: AgentState) -> str:
    last_message = state["messages"][-1]

    # Verificar se há tool calls
    if hasattr(last_message, "tool_calls") and last_message.tool_calls:
        return "tools"  # → executar ferramentas

    # Limite de tentativas
    if state["attempts"] >= 10:
        return END

    return END  # → resposta final

# 6. Construir o grafo
graph = StateGraph(AgentState)

graph.add_node("agent", call_model)
graph.add_node("tools", tool_node)

graph.set_entry_point("agent")

graph.add_conditional_edges(
    "agent",
    should_continue,
    {"tools": "tools", END: END},
)
graph.add_edge("tools", "agent")  # ciclo: tools → agent → tools → ...

app = graph.compile()

# Usar
result = app.invoke({
    "messages": [HumanMessage(content="Quais clientes compraram mais de R$10k no último mês?")],
    "attempts": 0,
})`}</CodeBlock>

        <Callout tone="info">
          LangGraph suporta checkpointing — salvar o estado em cada nó para retomar após falha.
          <InlineCode>MemorySaver</InlineCode> para desenvolvimento; <InlineCode>PostgresSaver</InlineCode>
          para produção. Isso permite replayar execuções para debugging e continuar tarefas longas após
          interrupção.
        </Callout>
      </Section>

      <Section title="CrewAI: times de agentes especializados" accent={ACCENT}>
        <CodeBlock lang="python">{`# pip install crewai crewai-tools
from crewai import Agent, Task, Crew, Process
from crewai_tools import SerperDevTool, FileReadTool

# 1. Definir agentes com roles especializados
researcher = Agent(
    role="Senior Research Analyst",
    goal="Encontrar informações técnicas precisas e atualizadas sobre o tópico solicitado",
    backstory="""Você é um pesquisador sênior com 10 anos de experiência em tecnologia.
    É meticuloso, cita fontes, e distingue fatos de opiniões.""",
    tools=[SerperDevTool()],
    llm="claude-sonnet-4-6",
    verbose=True,
)

writer = Agent(
    role="Technical Content Writer",
    goal="Transformar pesquisa técnica em documentação clara e acionável para engenheiros sênior",
    backstory="""Você escreve documentação técnica para audiências de engenheiros sênior.
    Usa exemplos de código concretos, evita jargão desnecessário, e prioriza a aplicabilidade prática.""",
    llm="claude-sonnet-4-6",
)

reviewer = Agent(
    role="Quality Assurance Engineer",
    goal="Revisar conteúdo técnico para precisão, completude e qualidade",
    backstory="Revisor técnico com foco em precisão factual e identificação de gaps.",
    llm="claude-haiku-4-5-20251001",  # modelo barato para revisão
)

# 2. Definir tasks com contexto explícito
research_task = Task(
    description="Pesquise os melhores padrões de circuit breaker em microserviços em 2026. Inclua: bibliotecas populares, configurações recomendadas, e casos de uso reais.",
    expected_output="Relatório estruturado com seções: overview, bibliotecas, configuração, exemplos.",
    agent=researcher,
)

writing_task = Task(
    description="Com base na pesquisa, escreva um guia técnico de circuit breakers para engenheiros sênior. Inclua código em Python e Go.",
    expected_output="Guia técnico de 800-1200 palavras com exemplos de código.",
    agent=writer,
    context=[research_task],  # output do research_task é input aqui
)

review_task = Task(
    description="Revise o guia técnico. Verifique: precisão técnica, completude, clareza para engenheiros sênior.",
    expected_output="Guia revisado com lista de correções aplicadas.",
    agent=reviewer,
    context=[writing_task],
)

# 3. Criar crew e executar
crew = Crew(
    agents=[researcher, writer, reviewer],
    tasks=[research_task, writing_task, review_task],
    process=Process.sequential,  # ou Process.hierarchical para manager-worker
    verbose=True,
)

result = crew.kickoff(inputs={"topic": "circuit breakers in microservices"})`}</CodeBlock>
      </Section>

      <Section title="AutoGen: conversação multi-agente" accent={ACCENT}>
        <CodeBlock lang="python">{`# pip install pyautogen
import autogen

config = {
    "model": "claude-sonnet-4-6",
    "api_key": "...",
    "base_url": "https://api.anthropic.com/v1",  # usar com adaptador OpenAI-compat
}

# Agentes
user_proxy = autogen.UserProxyAgent(
    name="UserProxy",
    human_input_mode="NEVER",   # "ALWAYS" para human-in-the-loop
    max_consecutive_auto_reply=10,
    is_termination_msg=lambda x: "TAREFA_COMPLETA" in x.get("content", ""),
    code_execution_config={"work_dir": "sandbox", "use_docker": True},
)

analyst = autogen.AssistantAgent(
    name="DataAnalyst",
    llm_config={"config_list": [config]},
    system_message="""Você é um analista de dados. Analise dados, escreva código Python,
    e interprete resultados. Quando terminar, inclua TAREFA_COMPLETA.""",
)

critic = autogen.AssistantAgent(
    name="Critic",
    llm_config={"config_list": [config]},
    system_message="Você revisa análises de dados. Aponta erros, sugere melhorias, valida conclusões.",
)

# GroupChat: múltiplos agentes numa conversa
groupchat = autogen.GroupChat(
    agents=[user_proxy, analyst, critic],
    messages=[],
    max_round=15,
    speaker_selection_method="round_robin",
)

manager = autogen.GroupChatManager(groupchat=groupchat, llm_config={"config_list": [config]})

# Iniciar conversa
user_proxy.initiate_chat(
    manager,
    message="Analise o dataset sales.csv e identifique os 3 produtos com maior crescimento no Q3 vs Q2.",
)`}</CodeBlock>
      </Section>

      <Section title="Quando construir sem framework" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para muitos casos de produção, código imperativo direto com os SDKs dos providers é a melhor
          escolha — mais transparente, mais fácil de debugar, sem dependências desnecessárias.
        </p>
        <CodeBlock lang="python">{`# Pipeline simples sem framework — mais direto, mais fácil de manter
from anthropic import Anthropic
import json

client = Anthropic()

def research_and_write_pipeline(topic: str) -> str:
    """Pipeline de 3 etapas sem framework."""

    # Etapa 1: Pesquisa estruturada
    research = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=2048,
        system="Você é um pesquisador técnico. Responda com JSON: {findings: [], sources: [], gaps: []}",
        messages=[{"role": "user", "content": f"Pesquise sobre: {topic}"}],
    ).content[0].text

    # Etapa 2: Gerar conteúdo baseado na pesquisa
    content = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=4096,
        system="Você é um escritor técnico sênior. Escreva para engenheiros.",
        messages=[{
            "role": "user",
            "content": f"Com base nesta pesquisa:\\n{research}\\n\\nEscreva um guia técnico sobre: {topic}"
        }],
    ).content[0].text

    # Etapa 3: Revisão rápida
    reviewed = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=4096,
        system="Revise para precisão técnica. Retorne o conteúdo corrigido.",
        messages=[{"role": "user", "content": f"Revise:\\n{content}"}],
    ).content[0].text

    return reviewed`}</CodeBlock>

        <DecisionBox
          scenario="Escolher framework para pipeline de análise de código em repositório"
          winner="LangGraph com ciclos de retentativa"
          winnerColor={ACCENT}
          why="Análise de código pode exigir múltiplos rounds (erro de linting → corrigir → verificar → corrigir novamente). LangGraph modela ciclos explicitamente com estado tipado. Checkpointing permite retomar após falha em análises longas."
          alternatives={[
            { name: 'Sem framework', note: 'Para pipelines de 2-3 etapas fixas e lineares — mais simples' },
            { name: 'CrewAI', note: 'Para pesquisa + escrita colaborativa com roles claros' },
            { name: 'AutoGen', note: 'Para experimentos onde a colaboração emerge da conversa' },
          ]}
        />
        <QAItem
          q="LangGraph, CrewAI ou AutoGen funcionam com Claude?"
          a={<>Todos suportam Claude. LangGraph: use langchain-anthropic com ChatAnthropic. CrewAI: suporta Claude nativamente via llm="claude-sonnet-4-6". AutoGen: usa base_url da API Anthropic com adaptador OpenAI-compatible (claude-openai-compatible via api.anthropic.com). Em 2026, todos têm suporte de primeira classe aos modelos Anthropic.</>}
        />
        <QAItem
          q="Como depurar um agente LangGraph que está em loop?"
          a={<>LangGraph gera um trace de cada step. Use o LangSmith para visualizar o grafo de execução e ver em qual nó o agente está ciclando. Sem LangSmith: adicione logging explícito nos nós condicionais. O padrão mais comum de loop: should_continue retornando "tools" quando não deveria. Debug: imprima o last_message e verifique se tool_calls está vazio mas o condicional ainda retorna "tools".</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> LangGraph para produção com ciclos e controle explícito de fluxo.
        CrewAI para prototipagem rápida com times de agentes especializados. AutoGen para experimentos e
        cenários com humano-in-the-loop. Sem framework para pipelines lineares simples — código imperativo
        é mais transparente e manutenível. Em todos os casos, comece simples e adicione complexidade apenas
        quando necessário.
      </Callout>
    </div>
  );
}
