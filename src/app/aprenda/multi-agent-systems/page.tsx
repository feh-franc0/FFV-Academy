import type { Metadata } from 'next';
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
  ArchDiagram,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Multi-Agent Systems: orchestrator-worker, swarms e handoffs — FFV Academy',
  description:
    'Padrões de multi-agent: orchestrator-worker, swarm com handoffs (OpenAI Swarm / Agents SDK), CrewAI, hierarquias. Quando múltiplos agents valem o custo e quando só duplicam o desperdício.',
};

const ACCENT = '#ff7eb6';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando multi-agent supera um único agent forte?',
    options: [
      'Sempre — mais agents é melhor',
      'Quando (a) a tarefa se decompõe em sub-tarefas verdadeiramente paralelas, (b) sub-tarefas exigem personas/contexts distintos que poluiriam o contexto único, ou (c) há ganho real de especialização (research + writing + review). Em tarefa linear e sequencial, single-agent quase sempre ganha em custo e latência',
      'Só com modelos pequenos',
      'Em tarefas de FAQ',
    ],
    correct: 1,
    explanation:
      'Multi-agent não é gratuito — cada handoff custa tokens de resumo + perda de contexto. Só vence quando paralelismo real existe (research agent buscando 5 fontes em paralelo) ou quando especialização reduz poluição de contexto. "Mais agents" por default é anti-padrão; prove o ganho.',
  },
  {
    question: 'Qual a diferença essencial entre orchestrator-worker e swarm?',
    options: [
      'Nomes diferentes para o mesmo padrão',
      'Em orchestrator-worker, um agent central distribui e coleta; workers não se falam. Em swarm, agents se transferem controle entre si (handoffs) seguindo o fluxo da tarefa — não há centro fixo. Orchestrator é mais auditável; swarm é mais flexível e acoplado',
      'Swarm só funciona com GPT',
      'Orchestrator precisa de GPU',
    ],
    correct: 1,
    explanation:
      'Orchestrator-worker é topologia estrela: central manda, workers respondem, central agrega. Swarm (OpenAI Swarm / Agents SDK) é topologia de handoff: "transfer_to_billing_agent" muda a conversa de agent. Orchestrator é melhor quando você quer paralelismo e controle; swarm é melhor quando a conversa naturalmente muda de papel (triage → specialist).',
  },
  {
    question: 'Por que "compressão no handoff" é o problema de engenharia central em multi-agent?',
    options: [
      'Por latência',
      'Porque cada transição de agent perde contexto: o próximo agent só recebe o que foi resumido/passado, não o histórico completo. Resumo ruim = informação crítica perdida, que aparece só quando a resposta final sai errada sem trace óbvia. Handoff design é onde multi-agent quebra em produção',
      'Por custo de GPU',
      'Por licenciamento',
    ],
    correct: 1,
    explanation:
      'A ilusão é que multi-agent "compartilha" contexto. Na prática, cada agent tem sua janela própria, e handoff é uma mensagem estruturada com o que você escolheu passar. Perde o "como ele chegou lá". Em produção séria, handoff inclui: task, constraints, observações relevantes e critério de aceitação — não só "me ajuda com X".',
  },
  {
    question: 'Em 2026, qual framework é o mais direto para multi-agent em produção?',
    options: [
      'Qualquer um',
      'OpenAI Agents SDK (evolução do Swarm) e Anthropic com subagents + Task tool são os mais enxutos e production-ready. CrewAI é popular para prototipagem rápida mas adiciona abstrações que escondem bugs. LangGraph é poderoso para fluxos complexos mas tem curva de aprendizado alta. A escolha depende da topologia que você realmente precisa',
      'Só LangChain',
      'Só AutoGen',
    ],
    correct: 1,
    explanation:
      'OpenAI Agents SDK substitui o Swarm experimental e estabilizou a API de handoffs. Claude usa subagents com Task tool (padrão Anthropic). CrewAI prototipa rápido mas em prod custo/latência tende a estourar. LangGraph é state-machine explícita — poderoso mas verboso. Regra: comece no mais simples do seu stack; suba quando a complexidade justificar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="multi-agent-systems"
      title="Multi-Agent Systems: orchestrator-worker, swarms e handoffs"
      icon="🕸️"
      xp={85}
      readTime={17}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="context-engineering"
      nextTitle="Context Engineering: prompt caching, subagents e skills"
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
        Multi-agent soa maduro, vende bem em slide — e quebra mais vezes do que os artigos contam. Este módulo é o
        mapa dos padrões reais: <strong>orchestrator-worker</strong>, <strong>swarm com handoffs</strong>,
        <strong> hierarquias</strong>, <strong>panel of experts</strong>. E, mais importante, os critérios honestos
        para decidir se multi-agent vale a pena — ou se single-agent + tools é o certo.
      </p>

      <Section title="A pergunta antes da topologia" accent={ACCENT}>
        <Callout tone="warn">
          <strong>Regra-base (Anthropic, 2024):</strong> a maioria das "aplicações de IA" são single-agent com tools.
          Multi-agent entra quando paralelismo real ou especialização distinta justificam o custo de handoff. Se sua
          tarefa é sequencial e cabe no contexto de um agent, multi-agent só adiciona latência.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sinal', 'Single-agent', 'Multi-agent']}
          rows={[
            ['Sub-tarefas paralelizáveis', 'Pouco ganho', 'Ganho real em latência'],
            ['Contextos distintos (research vs coding)', 'Contexto polui', 'Especialização ajuda'],
            ['Tarefa sequencial curta', 'Ideal', 'Overhead desnecessário'],
            ['Necessidade de auditoria por etapa', 'Difícil rastrear', 'Cada agent tem trace claro'],
            ['Custo é crítico', 'Menor', 'Handoffs dobram/triplicam tokens'],
            ['Debug por suporte', 'Simples', 'Rastrear handoffs vira projeto'],
          ]}
        />
      </Section>

      <Section title="Orchestrator-Worker: o padrão mais comum em produção" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Um agent central (orchestrator) decompõe a tarefa, delega sub-tarefas a workers em paralelo, agrega os
          resultados. Workers não se comunicam entre si. Topologia simples, auditável, boa para pesquisa, análise
          multi-fonte e geração multi-secção.
        </p>
        <ArchDiagram title="Orchestrator-Worker" accent={ACCENT}>{`
                ┌─────────────────┐
                │  Orchestrator   │
                │  (plan + merge) │
                └────────┬────────┘
                         │ delega sub-tasks em paralelo
          ┌──────────────┼───────────────┐
          ▼              ▼               ▼
    ┌──────────┐   ┌──────────┐    ┌──────────┐
    │ Worker 1 │   │ Worker 2 │    │ Worker 3 │
    │ research │   │ research │    │ summariz │
    └────┬─────┘   └────┬─────┘    └────┬─────┘
         │              │                │
         └──────────────┼────────────────┘
                        │ retornos
                        ▼
                 Orchestrator agrega
                        │
                        ▼
                   Resposta final
`}</ArchDiagram>
        <CodeBlock lang="python">{`# Orchestrator-worker — versão minimal em Python
import asyncio
from anthropic import AsyncAnthropic
client = AsyncAnthropic()

async def worker(role: str, task: str) -> str:
    r = await client.messages.create(
        model="claude-haiku-4-5-20251001",        # workers no modelo barato
        max_tokens=800,
        system=f"Você é um {role}. Responda objetivo, máx 400 palavras.",
        messages=[{"role": "user", "content": task}],
    )
    return r.content[0].text

async def orchestrate(user_query: str) -> str:
    # 1) Planner decide sub-tarefas (modelo forte para planejar)
    plan = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=500,
        system=(
            "Decomponha a pergunta em 2-4 sub-tarefas independentes em JSON: "
            "[{role, task}]. Cada sub-tarefa deve ser executável em paralelo."
        ),
        messages=[{"role": "user", "content": user_query}],
    )
    import json
    sub_tasks = json.loads(plan.content[0].text)

    # 2) Workers em paralelo
    results = await asyncio.gather(*[
        worker(st["role"], st["task"]) for st in sub_tasks
    ])

    # 3) Orchestrator agrega
    synthesis = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1200,
        messages=[{
            "role": "user",
            "content": (
                f"Pergunta original: {user_query}\\n\\n"
                f"Resultados dos workers:\\n\\n" +
                "\\n\\n---\\n\\n".join(results) +
                "\\n\\nSintetize uma resposta coerente, citando resultados quando útil."
            ),
        }],
    )
    return synthesis.content[0].text`}</CodeBlock>
        <Callout tone="success">
          Planejador (modelo forte) + workers (modelo barato) é o combo econômico. Paralelismo real com asyncio corta
          latência de N×T para max(T). Em pesquisa multi-fonte, isso pode ser 3-5× mais rápido que single-agent
          sequencial.
        </Callout>
      </Section>

      <Section title="Swarm / Handoffs: o padrão de conversa que muda de papel" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em vez de um central delegar, cada agent pode <em>transferir</em> o controle para outro agent quando
          detecta que a próxima ação está fora do seu escopo. É o padrão de atendimento: triage → specialist →
          billing → escalation.
        </p>
        <ArchDiagram title="Swarm com handoffs" accent={ACCENT}>{`
  User
   │
   ▼
 ┌──────────────┐   handoff:
 │  Triage      │──► "é billing"
 │  agent       │
 └──────┬───────┘
        │ (usuário claramente pergunta conta)
        ▼
 ┌──────────────┐   handoff:
 │  Billing     │──► "precisa de human"
 │  agent       │
 └──────┬───────┘
        │
        ▼
 ┌──────────────┐
 │  Human       │
 │  agent (HITL)│
 └──────────────┘
`}</ArchDiagram>
        <CodeBlock lang="python">{`# OpenAI Agents SDK — handoffs nativos
from agents import Agent, Runner, handoff

triage_agent = Agent(
    name="Triage",
    instructions=(
        "Identifique a intenção do usuário e transfira para o agent certo. "
        "Se não tem certeza, peça esclarecimento."
    ),
)

billing_agent = Agent(
    name="Billing",
    instructions=(
        "Você cuida de cobrança, fatura e plano. Tem acesso a tools "
        "get_invoice, update_payment. Se o usuário precisar de refund "
        "acima de US$50, transfira para Human."
    ),
    tools=[get_invoice, update_payment],
)

human_agent = Agent(
    name="Human",
    instructions="Abra ticket crítico para um humano resolver.",
    tools=[open_ticket],
)

# Wire handoffs
triage_agent.handoffs = [billing_agent]
billing_agent.handoffs = [human_agent]

# Run
result = await Runner.run(triage_agent, "Meu cartão não passou na renovação")
# Triage → Billing → (resolve ou) → Human`}</CodeBlock>
        <DecisionBox
          scenario="Chatbot de atendimento com áreas distintas (vendas, suporte, billing)"
          winner="Swarm / handoffs"
          winnerColor={ACCENT}
          why="Modelo mental natural: a conversa muda de 'especialista' conforme a intenção. Cada agent tem instruções, tools e policies próprias — mais limpo que um super-prompt misturando tudo."
          alternatives={[
            { name: 'Single-agent com router + system prompts', note: 'mais simples, mas perde isolamento de tools e instruções' },
            { name: 'Orchestrator-worker', note: 'overkill — não há paralelismo real, é conversação sequencial' },
          ]}
        />
      </Section>

      <Section title="Hierarquias: orchestrator que delega a outros orchestrators" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em tarefas grandes (escrever relatório de 50 páginas, auditar codebase inteiro), uma camada só de workers
          não basta. Orchestrator delega a sub-orchestrators, cada um coordenando workers em seu domínio.
        </p>
        <ArchDiagram title="Hierarquia de 3 níveis" accent={ACCENT}>{`
                    ┌──────────────────┐
                    │  Top orchestrator│
                    │  (plano macro)   │
                    └────────┬─────────┘
                             │
               ┌─────────────┼─────────────┐
               ▼             ▼             ▼
        ┌──────────┐  ┌──────────┐  ┌──────────┐
        │ Research │  │ Analysis │  │ Writing  │
        │  coord.  │  │  coord.  │  │  coord.  │
        └────┬─────┘  └────┬─────┘  └────┬─────┘
             │             │             │
        [W][W][W]      [W][W][W]    [W][W][W]
`}</ArchDiagram>
        <Callout tone="warn">
          Hierarquia &gt; 2 níveis multiplica custo de handoff e erros de compressão. Em 95% dos produtos, 2 níveis
          (orchestrator → workers) é suficiente. Hierarquias profundas são território de deep-research agents e
          pesquisa autônoma.
        </Callout>
      </Section>

      <Section title="Panel of experts: agents paralelos + judge" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em decisões onde qualidade &gt; custo (ex: resposta médica, revisão de código crítico), rode N agents
          independentes, cada um com persona/abordagem diferente, e um judge agrega ou escolhe.
        </p>
        <CodeBlock lang="python">{`# Panel of 3 experts + LLM judge escolhendo
import asyncio

PERSONAS = [
    "Você é um engenheiro sênior focado em segurança.",
    "Você é um engenheiro sênior focado em performance.",
    "Você é um engenheiro sênior focado em legibilidade.",
]

async def expert_review(persona: str, code: str) -> str:
    r = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        system=persona,
        messages=[{"role": "user", "content": f"Revise:\\n\\n{code}"}],
    )
    return r.content[0].text

async def panel_review(code: str) -> str:
    reviews = await asyncio.gather(*[expert_review(p, code) for p in PERSONAS])
    judge = await client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": (
                "Três revisões de código. Consolide em uma revisão única, "
                "resolvendo conflitos e priorizando severidade:\\n\\n" +
                "\\n\\n---\\n\\n".join(reviews)
            ),
        }],
    )
    return judge.content[0].text`}</CodeBlock>
      </Section>

      <Section title="Frameworks: quando cada um vale em 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Framework', 'Forte em', 'Fraco em']}
          rows={[
            ['Anthropic subagents (Task tool)', 'Delegação dentro do Claude Code; integração MCP', 'Não é lib standalone'],
            ['OpenAI Agents SDK', 'Handoffs, guardrails, tracing built-in', 'Amarrado ao ecossistema OpenAI'],
            ['CrewAI', 'Prototipagem rápida de crews com role/goal/backstory', 'Abstrações escondem custos; menos controle em prod'],
            ['LangGraph', 'State-machine explícita, fluxos complexos e ciclos', 'Verboso; curva de aprendizado alta'],
            ['AutoGen (Microsoft)', 'Conversational multi-agent, coding especializado', 'Output menos determinístico; menos usado em 2026'],
            ['Roll your own (SDK + asyncio)', 'Controle total, zero dependência', 'Você reimplementa retry, tracing, handoff etc.'],
          ]}
        />
        <DecisionBox
          scenario="Primeira versão de multi-agent em produto existente"
          winner="SDK nativo do seu modelo + asyncio"
          winnerColor={ACCENT}
          why="Você entende exatamente o que acontece. Debugging é ler seu código. Adicione framework quando a complexidade (5+ agents, state machine com ciclos, múltiplos providers) justificar."
          alternatives={[
            { name: 'OpenAI Agents SDK', note: 'se já estiver 100% no ecossistema OpenAI' },
            { name: 'LangGraph', note: 'quando o fluxo vira state-machine complexa com reentrância' },
          ]}
        />
      </Section>

      <Section title="Reliability em multi-agent: o que realmente quebra" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Problema', 'Causa raiz', 'Mitigação']}
          rows={[
            ['Contexto explodindo', 'Cada handoff copia histórico crescente', 'Compressão/summary explícito a cada handoff'],
            ['Custo 10× do esperado', 'Loops de handoff (A→B→A→B)', 'max_handoffs, trace de topologia'],
            ['Resposta final perde info', 'Worker relatou, orchestrator resumiu mal', 'Schemas estruturados (JSON) em vez de prosa livre'],
            ['Deadlock (tudo aguardando)', 'Handoff circular sem terminal', 'Sempre ter agent terminal que responde ao user'],
            ['Debug impossível', 'Trace de conversação em N agents', 'Tracing estruturado (Langfuse, LangSmith, OTel)'],
            ['Erro de guardrail', 'Worker viola policy definida no orchestrator', 'Guardrails por agent, validação no judge'],
          ]}
        />
      </Section>

      <Section title="Perguntas típicas" accent={ACCENT}>
        <QAItem
          q="Multi-agent é sempre pior em latência?"
          a={<>Não. Orchestrator-worker com workers paralelos pode ser muito mais rápido que single-agent sequencial — N requests em paralelo = max(T) em vez de sum(T). O que costuma ser pior é swarm sequencial, onde a conversa passa por vários agents em série.</>}
        />
        <QAItem
          q="Posso misturar modelos diferentes em um sistema multi-agent?"
          a={<>Pode e costuma ser ótimo. Planner em Opus/GPT-5 (qualidade), workers em Haiku/gpt-4o-mini (custo), judge em modelo de família diferente do gerador (reduzir viés). O único cuidado é validar que tools funcionam em todos (tool_use tem sutilezas entre providers).</>}
        />
        <QAItem
          q="Como faço trace/observability em multi-agent?"
          a={<>OpenTelemetry com semantic conventions de LLM (spans para cada chamada, atributos de modelo/tokens), ou ferramentas prontas (Langfuse, LangSmith, Phoenix). Estruture trace hierárquico: run → agent → chamada. Sem isso, debug em prod é pesadelo.</>}
        />
        <QAItem
          q="Quando devo fugir de multi-agent e voltar para workflow?"
          a={<>Quando você observa: (a) erros recorrentes em handoff (info perdida), (b) custo 3×+ do esperado, (c) latência p95 estourando SLO, (d) time gasta mais debugando agents que entregando features. Workflow com 2-3 LLM calls costuma resolver 80% dos casos sem essas dores.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Multi-agent não é upgrade automático — é trade-off. Orchestrator-worker para
        paralelismo real; swarm/handoffs para conversas que mudam de papel; hierarquia só quando 2 níveis não bastam;
        panel-of-experts para qualidade &gt; custo. Handoff design (o que passa, em que schema) é onde multi-agent
        quebra. Frameworks ajudam mas escondem — comece no SDK nativo. Próximo: context engineering — como extrair
        máximo de cada janela e agent sem pagar preço absurdo.
      </Callout>
    </div>
  );
}
