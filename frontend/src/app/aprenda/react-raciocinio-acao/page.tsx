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

export const metadata = getModuleMetadata('react-raciocinio-acao');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia ReAct de um agente de tool use sem raciocínio explícito?',
    options: [
      'ReAct usa mais tokens, o que sempre resulta em melhor qualidade',
      'ReAct intercala Thought (raciocínio sobre o que fazer) antes de cada Action — esse raciocínio explícito melhora a escolha de ferramentas, permite auto-correção ao observar resultados inesperados, e cria um trace auditável das decisões',
      'ReAct só funciona com APIs que suportam function calling nativo',
      'A diferença é apenas de formatação — a qualidade do resultado é idêntica',
    ],
    correct: 1,
    explanation:
      'Yao et al. (2022) demonstraram que o loop Thought → Action → Observation, com raciocínio explícito antes de cada ação, supera tanto CoT puro (sem ações) quanto agentes de ação pura (sem raciocínio). O Thought permite que o modelo interprete observações inesperadas, mude de estratégia, e produza um trace compreensível por humanos para debugging e auditoria.',
  },
  {
    question: 'No ciclo ReAct, o que é uma "Observation" e quem a gera?',
    options: [
      'É a resposta final do agente ao usuário, gerada pelo LLM',
      'É o resultado retornado pela ferramenta/ambiente após uma Action — gerada pelo sistema (código externo), não pelo LLM. O LLM recebe a Observation no contexto e gera o próximo Thought',
      'É uma avaliação do modelo sobre a qualidade de sua própria resposta anterior',
      'É um step de reflexão intermediário gerado pelo LLM para verificar consistência',
    ],
    correct: 1,
    explanation:
      'O ciclo ReAct: (1) LLM gera Thought (raciocínio), (2) LLM gera Action (qual ferramenta chamar e com que parâmetros), (3) Sistema executa a ferramenta e retorna Observation (resultado real), (4) Observation é adicionada ao contexto, (5) LLM gera próximo Thought. A Observation é gerada pelo ambiente externo — banco de dados, API, calculadora, browser — não pelo LLM.',
  },
  {
    question: 'Qual é a principal limitação do ReAct em produção?',
    options: [
      'ReAct não funciona com mais de 2 ferramentas simultaneamente',
      'O contexto cresce linearmente a cada ciclo (Thought + Action + Observation × N iterações) — em agentes com muitas iterações, o contexto pode estourar ou se tornar caro. Além disso, o modelo pode alucinar Actions que não existem nas ferramentas disponíveis',
      'ReAct só funciona com modelos acima de 100B parâmetros',
      'ReAct não suporta ferramentas que retornam dados estruturados (JSON)',
    ],
    correct: 1,
    explanation:
      'Em loops longos, cada ciclo adiciona ~200-500 tokens ao contexto. 20 ciclos = 4-10k tokens acumulados de trace. Mitigações: compactação do histórico antigo, limite de iterações com fallback, scratchpad separado do histórico de mensagens. Alucinação de Actions (o modelo inventa uma ferramenta que não existe) também é um problema real — mitigate com validação da Action antes de executar.',
  },
  {
    question: 'Quando usar ReAct vs um pipeline fixo de tool calling?',
    options: [
      'Sempre use ReAct — é sempre superior a pipelines fixos',
      'Use ReAct quando a sequência de ferramentas a chamar é desconhecida a priori e depende dos resultados intermediários. Use pipeline fixo quando a sequência é determinística e conhecida — é mais rápido, barato e confiável',
      'ReAct é para protótipos; pipeline fixo é apenas para sistemas legacy',
      'Pipeline fixo só é possível com código procedural; ReAct é o único modo de usar LLMs',
    ],
    correct: 1,
    explanation:
      'Pipeline fixo (DAG de calls): sequência conhecida, confiável, barato. Ex: "sempre busca no vector store, depois sumariza, depois gera resposta". ReAct: sequência dinâmica baseada em observações. Ex: "pesquisa sobre X, se não encontrar tenta Y, se resultado incoerente re-busca". ReAct tem overhead de tokens e risco de loops. Use pipeline fixo sempre que possível, ReAct quando a lógica adaptativa é genuinamente necessária.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="react-raciocinio-acao"
      title="ReAct: raciocínio e ação intercalados em agentes"
      icon="🔄"
      xp={80}
      readTime={15}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="agentes-padroes"
      nextTitle="Padrões de Agentes: arquiteturas para sistemas autônomos"
      relatedSlugs={['agentes-padroes', 'chain-of-thought', 'tool-calling']}
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
        ReAct (Reasoning + Acting) é a arquitetura fundacional de agentes LLM com ferramentas. O insight central:
        intercalar raciocínio explícito (Thought) com chamadas de ferramentas (Action) e resultados (Observation)
        produz agentes mais precisos, auditáveis e que conseguem se auto-corrigir — em comparação a agentes que
        simplesmente chamam ferramentas sem raciocinar sobre os resultados.
      </p>

      <Section title="O ciclo Thought → Action → Observation" accent={ACCENT}>
        <LayerStack
          title="Ciclo ReAct completo"
          accent={ACCENT}
          separatorLabel="loop até finalização"
          layers={[
            { label: 'Query do usuário', content: '"Quais são os bugs abertos com prioridade P0 no projeto X?"', tone: 'default' },
            { label: 'Thought 1', content: 'Preciso buscar as issues abertas no repositório com label P0', note: 'gerado pelo LLM', tone: 'default' },
            { label: 'Action 1', content: 'search_issues(repo="project-x", state="open", label="P0")', note: 'LLM decide ferramenta + params', tone: 'writable' },
            { label: 'Observation 1', content: '[Issue #234: null pointer crash, Issue #237: auth bypass]', note: 'resultado real da ferramenta', tone: 'writable' },
            { label: 'Thought 2', content: 'Encontrei 2 P0s. Preciso buscar detalhes de cada um para resposta completa', tone: 'default' },
            { label: 'Action 2 → Observation 2', content: 'get_issue_details(...) → detalhes dos 2 bugs', tone: 'writable' },
            { label: 'Final Answer', content: 'Síntese: 2 bugs P0 abertos — #234 (crash) e #237 (security)', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          O Thought não é opcional — é o que transforma tool use em raciocínio adaptativo. Sem Thought, o agente
          não consegue interpretar Observations inesperadas ("a busca retornou vazia — devo tentar outra query"),
          não tem trace auditável, e não consegue mudar de estratégia dinamicamente.
        </Callout>
      </Section>

      <Section title="Implementação ReAct do zero" accent={ACCENT}>
        <CodeBlock lang="python">{`from anthropic import Anthropic
import json
from typing import Callable

client = Anthropic()

# Definir ferramentas disponíveis
TOOLS = [
    {
        "name": "search_web",
        "description": "Busca informações na web sobre um tópico",
        "input_schema": {
            "type": "object",
            "properties": {
                "query": {"type": "string", "description": "Termo de busca"},
                "num_results": {"type": "integer", "default": 5},
            },
            "required": ["query"],
        },
    },
    {
        "name": "execute_python",
        "description": "Executa código Python e retorna o resultado",
        "input_schema": {
            "type": "object",
            "properties": {
                "code": {"type": "string", "description": "Código Python para executar"},
            },
            "required": ["code"],
        },
    },
    {
        "name": "read_file",
        "description": "Lê o conteúdo de um arquivo",
        "input_schema": {
            "type": "object",
            "properties": {
                "path": {"type": "string", "description": "Caminho do arquivo"},
            },
            "required": ["path"],
        },
    },
]

# Implementações reais das ferramentas
def search_web(query: str, num_results: int = 5) -> str:
    # Integração real com Serper API, Tavily, etc.
    return f"[Resultados de busca simulados para: {query}]"

def execute_python(code: str) -> str:
    import subprocess
    result = subprocess.run(
        ["python", "-c", code],
        capture_output=True, text=True, timeout=10
    )
    return result.stdout or result.stderr

def read_file(path: str) -> str:
    with open(path) as f:
        return f.read()[:2000]  # truncar para evitar contexto enorme

TOOL_REGISTRY: dict[str, Callable] = {
    "search_web": search_web,
    "execute_python": execute_python,
    "read_file": read_file,
}

def react_agent(
    user_query: str,
    max_iterations: int = 10,
    verbose: bool = True,
) -> str:
    """Agente ReAct com Anthropic tool use."""
    messages = [{"role": "user", "content": user_query}]

    for iteration in range(max_iterations):
        response = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=2048,
            tools=TOOLS,
            messages=messages,
        )

        # Adicionar resposta ao histórico
        messages.append({"role": "assistant", "content": response.content})

        if verbose:
            for block in response.content:
                if hasattr(block, "text"):
                    print(f"[Thought] {block.text}")
                elif hasattr(block, "name"):
                    print(f"[Action] {block.name}({block.input})")

        # Verificar se o agente terminou
        if response.stop_reason == "end_turn":
            # Extrair texto final
            for block in response.content:
                if hasattr(block, "text"):
                    return block.text
            return "Task completa."

        # Processar tool calls (Actions)
        if response.stop_reason == "tool_use":
            tool_results = []
            for block in response.content:
                if block.type == "tool_use":
                    # Executar a ferramenta
                    tool_fn = TOOL_REGISTRY.get(block.name)
                    if tool_fn:
                        try:
                            observation = tool_fn(**block.input)
                        except Exception as e:
                            observation = f"Erro ao executar {block.name}: {e}"
                    else:
                        observation = f"Ferramenta '{block.name}' não encontrada"

                    if verbose:
                        print(f"[Observation] {observation[:200]}...")

                    tool_results.append({
                        "type": "tool_result",
                        "tool_use_id": block.id,
                        "content": str(observation),
                    })

            # Adicionar observações ao contexto
            messages.append({"role": "user", "content": tool_results})

    return "Limite de iterações atingido."

# Uso
result = react_agent(
    "Qual a soma dos primeiros 100 números primos? Calcule usando Python.",
    verbose=True,
)`}</CodeBlock>
      </Section>

      <Section title="Padrões de Thought eficazes" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A qualidade do raciocínio no Thought determina muito da performance do agente. Você pode induzir
          padrões de Thought específicos via system prompt.
        </p>
        <CodeBlock lang="python">{`REACT_SYSTEM_PROMPT = """Você é um agente que resolve tarefas usando ferramentas disponíveis.

Para cada etapa, siga este padrão de raciocínio:

1. ANALYZE: O que preciso descobrir/fazer para avançar?
2. PLAN: Qual ferramenta usar e com quais parâmetros? Por quê?
3. VERIFY: O resultado faz sentido? Precisei ajustar minha estratégia?

Regras de raciocínio:
- Se uma busca retornar vazia, tente termos alternativos antes de desistir
- Se uma ferramenta retornar erro, informe o usuário e tente uma abordagem alternativa
- Nunca chame a mesma ferramenta com os mesmos parâmetros duas vezes
- Quando tiver informação suficiente, sintetize e responda — não faça calls desnecessários
- Seja específico nos parâmetros das ferramentas — queries vagas retornam resultados vagos

Ao finalizar, forneça uma resposta clara e estruturada baseada nos fatos obtidos."""`}</CodeBlock>

        <ComparisonTable
          accent={ACCENT}
          headers={['Padrão de Thought', 'Quando usar', 'Exemplo']}
          rows={[
            ['Análise progressiva', 'Pesquisa com múltiplas fontes', '"Encontrei X. Isso sugere que devo buscar também por Y"'],
            ['Verificação de consistência', 'Cálculos e dados numéricos', '"O resultado 42 é razoável? Ordem de grandeza correta?"'],
            ['Decomposição de task', 'Problemas complexos', '"Vou dividir em: 1) obter dados, 2) filtrar, 3) agregar"'],
            ['Detecção de erro', 'Após Observation inesperada', '"Retornou vazio — a query pode estar muito específica. Vou tentar..."'],
            ['Síntese final', 'Última iteração', '"Tenho todos os dados necessários. A resposta é..."'],
          ]}
        />
      </Section>

      <Section title="Limitações e mitigações em produção" accent={ACCENT}>
        <CodeBlock lang="python">{`# Problema 1: Contexto cresce indefinidamente
# Mitigação: compactar histórico antigo quando atingir threshold

def compact_react_history(messages: list[dict], max_tokens: int = 50_000) -> list[dict]:
    """Remove Thought/Action/Observation antigas, mantém apenas as recentes."""
    total = sum(estimate_tokens(m) for m in messages)
    if total < max_tokens * 0.7:
        return messages

    # Sempre manter: primeira mensagem (query) + últimas 3 iterações
    first = messages[:1]       # query original
    recent = messages[-6:]     # últimas 3 iterações (2 msg por iteração)

    # Summarizar o meio
    middle = messages[1:-6]
    if middle:
        summary = summarize_trace(middle)  # LLM barato para sumarizar
        summary_msg = {
            "role": "user",
            "content": f"[Resumo das ações anteriores: {summary}]"
        }
        return first + [summary_msg] + recent

    return first + recent

# Problema 2: Loop infinito — mesmo action repetida
# Mitigação: detectar e interromper

def detect_loop(messages: list[dict]) -> bool:
    """Retorna True se o agente está repetindo as mesmas actions."""
    actions = []
    for msg in messages:
        if isinstance(msg.get("content"), list):
            for block in msg["content"]:
                if isinstance(block, dict) and block.get("type") == "tool_use":
                    actions.append((block["name"], str(block["input"])))

    if len(actions) < 4:
        return False

    last_4 = actions[-4:]
    # Se as últimas 4 ações têm 2 ou menos únicas, está em loop
    return len(set(last_4)) <= 2`}</CodeBlock>

        <DecisionBox
          scenario="Agente para pesquisa em base de conhecimento interna com múltiplas etapas"
          winner="ReAct com Claude tool use + system prompt otimizado"
          winnerColor={ACCENT}
          why="ReAct permite adaptar a estratégia de busca baseado nos resultados intermediários — impossível em pipeline fixo. O trace de Thoughts é auditável para debugging. Claude tool use garante Actions estruturadas."
          alternatives={[
            { name: 'Pipeline fixo (busca → reranking → geração)', note: 'Preferível quando a sequência é sempre a mesma — mais rápido e confiável' },
            { name: 'LangGraph com nós explícitos', note: 'Mais controle sobre o grafo de estados — melhor para fluxos complexos com branches' },
            { name: 'Agente simples sem Thought', note: 'Menos auditável, sem auto-correção — não recomendado para produção' },
          ]}
        />
        <QAItem
          q="Como depurar um agente ReAct que está tomando decisões erradas?"
          a={<>O trace de Thoughts é seu melhor aliado. Inspecione: (1) Thought antes da Action errada — o raciocínio estava correto? Se não, melhore o system prompt; (2) Observation — a ferramenta retornou o que devia? Se não, é bug na ferramenta; (3) Thought depois de Observation — o modelo interpretou corretamente? Se não, a Observation pode estar mal formatada ou ambígua. Adicione logging de cada Thought/Action/Observation em produção.</>}
        />
        <QAItem
          q="ReAct é adequado para sistemas de produção com SLA agressivo?"
          a={<>Depende. ReAct com 3-5 iterações costuma ter latência de 3-10s — aceitável para muitos casos. Para SLA de &lt;500ms, use pipeline fixo. Para 1-5s, ReAct com número máximo de iterações baixo (2-3) e ferramentas rápidas. Para tasks assíncronas (relatórios, análises), ReAct sem restrição de latência. Meça o p95 de latência por número de iterações no seu caso de uso específico.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> ReAct = Thought (raciocínio) + Action (ferramenta) + Observation (resultado),
        em loop. O Thought é o que diferencia de tool use cego — permite auto-correção e gera trace auditável.
        Implemente com Anthropic tool use ou function calling do OpenAI — o framework faz o loop. Cuide do
        crescimento do contexto em loops longos. Detecte loops infinitos. Use pipeline fixo quando a sequência
        é determinística — ReAct tem overhead desnecessário nesses casos.
      </Callout>
    </div>
  );
}
