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
  StackFlow,
  FlowDiagram,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('agentes-padroes');

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a essência do padrão ReAct?',
    options: [
      'Um framework JavaScript',
      'Um loop "Thought → Action → Observation" em que o LLM intercala raciocínio (pensamento em linguagem natural) com chamadas de ferramenta. A trace explícita de raciocínio melhora a decisão de qual tool chamar e reduz alucinação em tarefas multi-step',
      'Um tipo de embedding',
      'Um algoritmo de reranking',
    ],
    correct: 1,
    explanation:
      'ReAct (Yao et al. 2022) foi o primeiro padrão a mostrar que intercalar raciocínio verbal com ações (tool calls) é melhor que só tool calls (opaco) ou só chain-of-thought (sem ação). Em produção, quase todo agent moderno é ReAct por baixo — Claude, OpenAI function-calling e LangChain agents implementam essa estrutura.',
  },
  {
    question: 'Quando Reflexion (self-critique loop) vale o custo extra?',
    options: [
      'Sempre',
      'Em tarefas onde há sinal claro de sucesso/falha (testes passam? resposta bate com gabarito?). O agent executa, observa o resultado, critica o próprio trabalho e re-tenta com a crítica no contexto. Sem sinal externo, o self-critique vira "parecer concordar consigo mesmo"',
      'Só para escrever código',
      'Nunca, é caro',
    ],
    correct: 1,
    explanation:
      'Reflexion (Shinn et al. 2023) brilha em coding, bug-fix, SWE-bench — tarefas com teste automático. O agent falha, lê o erro, reflete, tenta de novo. Sem verificação externa, o loop de reflexão tende a convergir para confiança sem precisão. Use quando tiver oracle; pule quando não tiver.',
  },
  {
    question: 'Tree of Thoughts (ToT) vs Chain of Thought (CoT) — quando ToT vence?',
    options: [
      'Sempre que possível',
      'Em problemas com espaço de busca largo e avaliação intermediária possível (Game of 24, crosswords, planning). ToT expande múltiplos "galhos" de raciocínio e poda por score. Custo típico: 10-100× CoT. Em tarefas lineares, CoT simples ganha por ser bem mais barato',
      'Em respostas de FAQ',
      'Só com GPT-4',
    ],
    correct: 1,
    explanation:
      'ToT (Yao et al. 2023) é busca em árvore com o LLM como heurística. Brilha em problemas onde um "passo errado" no meio condena tudo e onde você consegue avaliar estados intermediários. Custo é o calcanhar: dezenas de chamadas por query. Em 2026, a maioria dos "ToT" de produção virou variantes enxutas (best-of-N + self-consistency).',
  },
  {
    question: 'Qual a regra prática para escolher entre agent loop e pipeline fixo?',
    options: [
      'Agent sempre vence',
      'Se a tarefa tem passos previsíveis e verificáveis, pipeline fixo (workflow) é mais barato, determinístico e debuggável. Agent loop só vale quando o caminho não é conhecido a priori — precisa decidir ferramentas e ordem dinamicamente. Agent é caro em tokens e imprevisível',
      'Pipeline é antigo',
      'Depende do modelo',
    ],
    correct: 1,
    explanation:
      'Regra do Anthropic "Building Effective Agents" (2024): comece com workflow; só suba para agent quando a variância de caminho justifique. Agent dá flexibilidade ao custo de previsibilidade. Em produção, a maioria das "coisas de IA" são workflows com 1-2 decisões, não agents em loop aberto. Saber diferenciar economiza dinheiro e bug.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="agentes-padroes"
      title="Agent Patterns: ReAct, Reflexion e Tree of Thoughts"
      icon="🤖"
      xp={90}
      readTime={18}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="multi-agent-systems"
      nextTitle="Multi-Agent Systems: orchestrator-worker, swarms e handoffs"
      relatedSlugs={['multi-agent-systems','claude-code-primeiros-passos','mcp-servers']}
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
        "Agent" virou palavra-ônibus — engloba desde um loop ReAct simples até swarms hierárquicos com dezenas de
        nós. Este módulo organiza os padrões que se consolidaram entre 2022 e 2026: <strong>ReAct</strong>,
        <strong> Reflexion</strong>, <strong>Plan-and-Execute</strong>, <strong>Tree of Thoughts</strong>,
        <strong> Router</strong>. Para cada um: como funciona, quando brilha, quando é overkill.
      </p>

      <Section title="Agent vs Workflow: a pergunta antes da pergunta" accent={ACCENT}>
        <Callout tone="info">
          <strong>Definições (Anthropic, "Building Effective Agents", 2024):</strong>
          <br />
          <strong>Workflow</strong> = LLM(s) encadeados em ordem fixa, determinada pelo código.
          <br />
          <strong>Agent</strong> = LLM decide dinamicamente próximos passos e tools, em loop, até atingir objetivo ou
          limite.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Atributo', 'Workflow', 'Agent']}
          rows={[
            ['Controle de fluxo', 'Código fixo', 'LLM decide'],
            ['Previsibilidade', 'Alta', 'Baixa'],
            ['Custo por execução', 'Previsível', 'Variável, pode estourar'],
            ['Debug', 'Direto — cada passo é código', 'Mais difícil — trace do modelo'],
            ['Quando usar', '80% dos casos reais', 'Tarefa com caminho desconhecido a priori'],
          ]}
        />
        <Callout tone="warn">
          <strong>Anti-padrão comum:</strong> transformar tudo em "agent" porque soa moderno. Um pipeline de extrair
          dados + resumir + mandar e-mail é workflow — não precisa de loop ReAct. Agent só quando a sequência de
          tools não é conhecida.
        </Callout>
      </Section>

      <Section title="ReAct: o padrão fundacional" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          ReAct (Reasoning + Acting) foi o paper que legitimou o LLM como agente. A estrutura é um loop onde o modelo
          alterna <strong>Thought</strong> (raciocínio em NL), <strong>Action</strong> (tool call) e{' '}
          <strong>Observation</strong> (resultado da tool).
        </p>
        <StackFlow
          title="ReAct loop"
          accent={ACCENT}
          items={[
            { icon: '💬', label: 'User Query', sub: 'entrada do usuário' },
            { icon: '🧠', label: 'Thought', sub: '"Preciso do preço atual. Vou buscar no sistema de cotação."', connector: 'raciocínio' },
            { icon: '🔧', label: 'Action', sub: 'get_price(ticker="PETR4")', connector: 'tool call' },
            { icon: '👁️', label: 'Observation', sub: '38.21 — resultado da ferramenta', connector: 'observação' },
            { icon: '🧠', label: 'Thought', sub: '"Tenho o preço. Falta o histórico. Vou chamar hist_price."', connector: 'raciocínio' },
            { icon: '🔧', label: 'Action', sub: 'hist_price(ticker="PETR4", days=30)', connector: 'tool call' },
            { icon: '✅', label: 'Final Answer', sub: 'Observation → Thought → … → resposta ao usuário' },
          ]}
        />
        <CodeBlock lang="python">{`# ReAct canônico com tool_use do Anthropic (estrutura idêntica em OpenAI)
from anthropic import Anthropic

client = Anthropic()

TOOLS = [
    {
        "name": "get_price",
        "description": "Retorna preço atual de um ticker.",
        "input_schema": {
            "type": "object",
            "properties": {"ticker": {"type": "string"}},
            "required": ["ticker"],
        },
    },
    {
        "name": "hist_price",
        "description": "Retorna histórico de preços.",
        "input_schema": {
            "type": "object",
            "properties": {
                "ticker": {"type": "string"},
                "days":   {"type": "integer"},
            },
            "required": ["ticker", "days"],
        },
    },
]

def react_agent(user_query: str, max_steps: int = 8) -> str:
    messages = [{"role": "user", "content": user_query}]
    for _ in range(max_steps):
        r = client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            tools=TOOLS,
            messages=messages,
        )
        if r.stop_reason == "end_turn":
            return r.content[0].text           # resposta final
        if r.stop_reason == "tool_use":
            tool_block = next(b for b in r.content if b.type == "tool_use")
            result = execute_tool(tool_block.name, tool_block.input)
            messages.append({"role": "assistant", "content": r.content})
            messages.append({
                "role": "user",
                "content": [{
                    "type": "tool_result",
                    "tool_use_id": tool_block.id,
                    "content": str(result),
                }],
            })
    raise RuntimeError("max_steps atingido — agent não convergiu")`}</CodeBlock>
        <Callout tone="success">
          Sempre limite <InlineCode>max_steps</InlineCode>. Loops infinitos de tool call são a causa #1 de estouro de
          budget em produção — seja porque o modelo entrou em loop, seja porque uma tool está devolvendo dado
          inútil que ele re-tenta.
        </Callout>
      </Section>

      <Section title="Reflexion: self-critique com memória" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Reflexion adiciona uma fase de <strong>crítica verbal</strong> após falha, armazenada em memória, que
          entra no contexto da próxima tentativa. Funciona bem em tarefas com sinal claro de sucesso (testes,
          verificadores).
        </p>
        <CodeBlock lang="python">{`# Reflexion — versão didática com oracle (rodar_testes)
def reflexion_solve(task: str, oracle, max_attempts: int = 3) -> str:
    memory: list[str] = []          # lições aprendidas entre tentativas
    for attempt in range(max_attempts):
        prompt = (
            f"Tarefa: {task}\\n\\n"
            f"Lições de tentativas anteriores:\\n" +
            "\\n".join(f"- {m}" for m in memory) +
            "\\n\\nProduza solução."
        )
        solution = llm_call(prompt)
        passed, feedback = oracle(solution)      # ex: rodar testes
        if passed:
            return solution

        # Reflexão: LLM critica a tentativa à luz do feedback
        reflection = llm_call(
            f"Tarefa: {task}\\nSolução tentada: {solution}\\n"
            f"Feedback do oracle: {feedback}\\n\\n"
            "Em 1-2 frases, o que deu errado e o que fazer diferente na próxima tentativa?"
        )
        memory.append(reflection)
    return solution   # última tentativa, mesmo se falhou`}</CodeBlock>
        <DecisionBox
          scenario="Agent escreve código — testes unitários existem"
          winner="Reflexion"
          winnerColor={ACCENT}
          why="Oracle (testes) dá sinal discreto. Reflexion vira um loop de debug assistido — lê traceback, reflete, corrige. Papers mostram ganho de 10-30pp em SWE-bench vs ReAct puro."
        />
        <DecisionBox
          scenario="Agent responde pergunta subjetiva (ex: resumo)"
          winner="ReAct puro ou best-of-N"
          winnerColor={ACCENT}
          why="Sem oracle confiável, self-critique vira concordar consigo mesmo. Melhor amostrar N respostas e usar LLM-as-judge (ou heurística) para escolher a melhor."
        />
      </Section>

      <Section title="Plan-and-Execute: planejador separado do executor" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em tarefas longas, misturar planejamento e execução na mesma chamada polui o contexto. Plan-and-Execute
          divide: um LLM (forte) cria o plano, um LLM (barato) executa passo a passo. Reduz custo e melhora
          robustez em tarefas de 5+ passos.
        </p>
        <FlowDiagram
          title="Plan-and-Execute"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '💬', label: 'User Query', desc: 'entrada do usuário' },
            { icon: '🧠', label: 'Planner LLM', desc: 'Opus/GPT-5 — caro, alta qualidade. Cria plan[1..N]' },
            { icon: '⚡', label: 'Executor LLM + Tools', desc: 'Haiku/menor — barato. Executa step 1, 2, 3… com tools específicas' },
            { icon: '🔄', label: 'Replan on Fail?', desc: 'Se passo falha, planner revisita com contexto do erro' },
            { icon: '✅', label: 'Final Answer', desc: 'resposta consolidada ao usuário' },
          ]}
        />
        <Callout tone="info">
          Plano explícito é auditável: você pode mostrar ao usuário o que o agente vai fazer antes de executar. Em
          fluxos com ações irreversíveis (enviar email, fechar ticket), plan + approval humano antes de execute é
          padrão de segurança.
        </Callout>
      </Section>

      <Section title="Tree of Thoughts (ToT): busca em árvore" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          ToT trata raciocínio como busca. Em cada nó, o LLM propõe K próximos passos; um avaliador (outro LLM ou
          heurística) pontua cada galho; mantém os top-B por nível (beam search). Custo explode — só vale em
          problemas de busca com estado avaliável.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Chamadas por query', 'Ganho típico']}
          rows={[
            ['Zero-shot', '1', 'baseline'],
            ['Chain of Thought', '1 (mais tokens)', '+10-20pp'],
            ['Self-consistency (N=5)', '5', '+3-8pp sobre CoT'],
            ['Best-of-N + judge', '5-10', '+5-12pp sobre CoT'],
            ['Tree of Thoughts (B=5, D=3)', '30-100+', '+10-30pp em problemas de busca'],
          ]}
        />
        <Callout tone="warn">
          Em 2026 o padrão prático virou <strong>best-of-N + judge</strong> ou <strong>self-consistency</strong> —
          captura 80% do ganho do ToT com 10% do custo. ToT canônico sobrou em benchmarks de pesquisa.
        </Callout>
      </Section>

      <Section title="Router: o padrão mais subestimado" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Router = classificador LLM barato que manda a query para o sub-pipeline certo. Em produtos reais, 60-80%
          das queries são "simples" (FAQ, saudação, help básico) e não precisam de agent caro. Router separa.
        </p>
        <CodeBlock lang="python">{`# Router barato com Haiku 4.5 (ou gpt-4o-mini) decidindo rota
from anthropic import Anthropic
client = Anthropic()

ROUTES = ["faq", "search_rag", "math_code", "book_meeting", "refuse"]

def route(query: str) -> str:
    r = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=30,
        system=(
            "Classifique a intenção do usuário em UMA das rotas: " +
            ", ".join(ROUTES) +
            ". Responda apenas com a palavra da rota."
        ),
        messages=[{"role": "user", "content": query}],
    )
    choice = r.content[0].text.strip().lower()
    return choice if choice in ROUTES else "search_rag"

# Dispatch
def handle(query: str) -> str:
    route_name = route(query)
    match route_name:
        case "faq":          return answer_from_faq_cache(query)
        case "search_rag":   return rag_pipeline(query)
        case "math_code":    return code_agent(query)
        case "book_meeting": return tool_chain_booking(query)
        case "refuse":       return "Não posso ajudar com isso."`}</CodeBlock>
      </Section>

      <Section title="Reliability patterns: o que não aparece nos papers" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Padrão', 'Problema que resolve', 'Custo']}
          rows={[
            ['max_steps + budget de tokens', 'Loops infinitos, estouro de custo', 'Zero — é só um contador'],
            ['Tool result truncation', 'Tool devolve 100k tokens e estoura contexto', 'Um slice do resultado'],
            ['Retry com backoff em tool', 'Flakiness de APIs externas', '1-2 tentativas extra'],
            ['Human-in-the-loop em ações irreversíveis', 'Agent manda email errado ou deleta dados', 'UX de confirmação'],
            ['Trace estruturado (LangSmith, Langfuse)', 'Debug do raciocínio em falhas raras', 'Infra de observability'],
            ['Prompt caching da system prompt+tools', 'Custo alto em agents com muitas tools', 'Config; reduz custo em ~90%'],
          ]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Preciso de LangChain/LlamaIndex para fazer agent?"
          a={<>Não. SDKs nativos (Anthropic, OpenAI) já entregam tool_use com poucas linhas. Frameworks ajudam em orquestração de multi-agent, mas adicionam camada que pode esconder bugs. Para agent simples, comece com SDK nativo + 50 linhas de loop próprio. Suba para framework quando sentir a fricção.</>}
        />
        <QAItem
          q="Agent com 20 tools funciona?"
          a={<>Em modelos fortes (Opus, GPT-5), sim — mas a precisão na escolha cai com número de tools. Mitigação: agrupe tools em "categorias" e use um router de 2 níveis (categoria → tool específica), ou use MCP server que expõe só as tools relevantes à task.</>}
        />
        <QAItem
          q="Como testar um agent?"
          a={<>Três camadas: (1) unit em cada tool (função pura), (2) integração em trajectories canônicas (mock tool results, checa passos), (3) end-to-end em golden set de tasks reais com oracle quando possível. Framework: pytest + snapshot das trajectories para detectar drift.</>}
        />
        <QAItem
          q="Agent pode ser determinístico?"
          a={<>Em temperature=0, quase — mas ordering de tool_use e variações de cache ainda causam drift. Para fluxos que exigem determinismo, use workflow. Se precisa de agent, aceite variância e meça distribuição (p50/p95 de custo/passos), não caso único.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Antes de "é agent", pergunte "é workflow?" — 80% das vezes workflow cobre. ReAct
        é a base; Reflexion brilha com oracle; Plan-and-Execute para tarefas longas; ToT é caro e especializado;
        Router é o ganho barato que todo mundo esquece. Reliability (max_steps, retry, truncation, HIL) não é
        opcional em produção. Próximo: multi-agent e orchestrator-worker — quando dividir a tarefa entre vários
        agents vale.
      </Callout>
    </div>
  );
}
