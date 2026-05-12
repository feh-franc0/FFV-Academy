import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, Timeline, DecisionBox, ArchFlow, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('agent-observability-langsmith');

const ACCENT = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é um "span hierárquico" em tracing de agentes?',
    options: [
      'Um span CSS para destacar texto',
      'Cada chamada LLM, tool call ou subgrafo vira um span (intervalo de tempo) e os spans aninham — span do "supervisor" contém spans dos "workers", que contêm spans de tool calls. Padrão OpenTelemetry adaptado. Permite visualizar a árvore de execução: latência por nível, custos agregados, parent-child relations, propagação de errors',
      'Sinônimo de batch',
      'Métrica de uptime',
    ],
    correct: 1,
    explanation:
      'Spans hierárquicos são o equivalente de distributed tracing (Dapper, OpenTelemetry) adaptado para LLMs. Cada agente, tool, ou call LLM = 1 span. Spans aninham: parent_span_id liga child a parent. Permite visualizar tree de execução com timing, custos, inputs/outputs. LangSmith, Helicone, Phoenix, Langfuse implementam esse modelo. Crítico para debugar multi-agent — sem isso, multi-agent é caixa preta.',
  },
  {
    question: 'Quais as diferenças filosóficas entre LangSmith e Helicone?',
    options: [
      'Idênticos com nomes diferentes',
      'LangSmith (LangChain) — integrado nativamente com LangChain/LangGraph via callbacks, captura semantics de "Chain", "Tool", "Agent". Helicone (YC W23) — proxy HTTP intermediário entre app e provider (OpenAI, Anthropic, etc). Não exige código framework-específico. LangSmith ganha quando você usa LangChain; Helicone ganha em stack agnóstico ou multi-framework',
      'LangSmith é gratuito; Helicone é pago',
      'LangSmith é só self-hosted; Helicone só SaaS',
    ],
    correct: 1,
    explanation:
      'LangSmith (smith.langchain.com) é deeply integrated com LangChain/LangGraph — capture automático de Chain, Tool, Agent, Retriever semantics. Helicone (helicone.ai) é proxy: você muda base_url para api.helicone.ai/v1, ele intercepta calls, captura tudo, repassa ao provider real. Framework-agnostic. Trade-off: LangSmith = riqueza semântica + lock-in LangChain; Helicone = simplicidade + neutro.',
  },
  {
    question: 'O que é prompt versioning e por que importa?',
    options: [
      'Salvar o prompt no Git',
      'Ferramenta de observability armazena cada versão de prompt (com hash), associa a runs e métricas, permite comparar performance entre versões A vs B em datasets de teste, e roll-back em produção. LangSmith Hub, Langfuse Prompts, Helicone Prompts. Crítico porque mudanças em prompts são as mudanças mais frequentes em LLM apps e quebram silenciosamente',
      'Versionamento de modelos no HuggingFace',
      'Diff de respostas entre temperaturas',
    ],
    correct: 1,
    explanation:
      'Prompt versioning = sistema de versão para prompts (não para código). Plataformas permitem: (1) salvar prompts como recursos com hash; (2) fetch em runtime via SDK; (3) associar versão à run capturada; (4) comparar metrics entre versões em datasets; (5) rollback. Sem isso, mudar prompt = deploy de código, sem A/B test, sem rollback granular. LangSmith Hub é o canonical; Langfuse Prompts excelente em open-source.',
  },
  {
    question: 'Como funciona "dataset capture" para evaluation?',
    options: [
      'Faz scraping da web',
      'A ferramenta captura inputs+outputs reais de produção (com PII filtering), permite anotar (humano marca qual run foi boa/ruim) e converte em dataset de eval reusável. Esse dataset é executado contra versões novas do agente em CI antes de deploy, garantindo que mudanças não regridem qualidade em casos reais. Ciclo: prod → captura → anotação → eval set → CI',
      'Faz download de datasets do HuggingFace',
      'Gera dados sintéticos via LLM',
    ],
    correct: 1,
    explanation:
      'Dataset capture é feature crítica: a plataforma observa runs em produção, permite ao usuário (ou regra automática) marcar runs como "exemplos de eval", e os agrega em datasets persistentes. Quando você muda prompt/modelo/código, roda contra esses datasets em CI antes de deploy. Padrão de prod 2026. LangSmith Datasets, Langfuse Datasets, Phoenix Evals.',
  },
  {
    question: 'Por que Phoenix (Arize) tem aposta diferente?',
    options: [
      'É escrito em Rust',
      'Phoenix é open-source, self-hostable, OpenTelemetry-native — usa OTel spans diretamente em vez de SDK proprietário. Tem foco forte em embeddings/RAG observability (visualizações UMAP/t-SNE de embedding drift, retrieval relevance scores). Para times que já têm stack OTel (Datadog, Honeycomb, Jaeger), Phoenix integra naturalmente',
      'Só funciona com modelos open-source',
      'Não suporta tracing',
    ],
    correct: 1,
    explanation:
      'Arize Phoenix (github.com/Arize-ai/phoenix) é open-source, OTel-native — instrumentation via openinference que produz spans OTel padrão, exportáveis para qualquer backend OTel. Diferenciador: forte em RAG/embedding evals (cluster visualizations de embeddings, retrieval relevance metrics, drift detection ao longo do tempo). Para teams com OTel stack existente, integra sem lock-in.',
  },
  {
    question: 'Como Langfuse se posiciona vs LangSmith/Helicone?',
    options: [
      'É um clone exato do LangSmith',
      'Langfuse (langfuse.com, open-source) combina o melhor: instrumentation via SDK (semantically rich como LangSmith), framework-agnostic (sem lock-in LangChain), self-hostable (não força SaaS), tem prompt management + dataset capture + LLM-as-judge. É a opção preferida em 2026 para teams que querem features full sem lock-in de vendor',
      'Tem foco apenas em RAG',
      'Só funciona com Anthropic',
    ],
    correct: 1,
    explanation:
      'Langfuse (lançado 2023, open-source MIT) capturou mindshare em 2024–2026 por: (1) SDK rich como LangSmith, (2) framework-agnostic — funciona com qualquer stack, (3) self-hostable em Docker/k8s, (4) features completas (tracing + prompts + datasets + evals + LLM-as-judge), (5) Cloud SaaS opcional para quem não quer host. Tornou-se padrão de fato para teams non-LangChain.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="agent-observability-langsmith"
      title="Agent observability: LangSmith, Helicone, Phoenix Arize"
      icon="🔭"
      xp={65}
      readTime={13}
      trailName="AI Engineering Avançado: RLHF & Agents em Produção"
      trailColor={ACCENT}
      nextSlug="agent-evaluation-prod"
      nextTitle="Agent evaluation em produção: golden sets vs LLM-as-judge"
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
        Você não pode debugar o que não vê. Multi-agent + tool use + reasoning models + RAG geram
        cascatas de chamadas LLM com latências, custos e modos de falha que stack tradicional
        (APM, logs) não captura. Em 2026, observability LLM tem 4 jogadores principais: LangSmith
        (LangChain-native), Helicone (proxy agnóstico), Phoenix (OTel + RAG-focused), Langfuse
        (open-source full-stack). Este módulo compara cada um e mostra setups práticos.
      </p>

      <Section title="O que precisa ser observado num agente" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Traces hierárquicos', v: 'Cada call LLM, tool, sub-agent vira span aninhado — visualiza árvore de execução' },
            { k: 'Latência por nível', v: 'P50/P95/P99 por nó, por tool, por modelo — identifica gargalos' },
            { k: 'Custo por trace', v: 'Tokens × preço, agregado por user/feature/version — controla burn rate' },
            { k: 'Errors estruturadas', v: 'Tool failures, parse errors, max_iterations, rate limits — não logs ASCII soltos' },
            { k: 'Prompt versioning', v: 'Que prompt rodou quando, com que parâmetros — compara A vs B' },
            { k: 'Dataset capture', v: 'Runs reais → eval datasets → CI regression' },
            { k: 'Online evals (LLM-as-judge)', v: 'Score automático de runs em prod para detectar degradação' },
            { k: 'PII filtering', v: 'Captura sem armazenar dados sensíveis — LGPD/GDPR compliance' },
          ]}
        />
      </Section>

      <Section title="LangSmith — integrado ao LangChain" accent={ACCENT}>
        <CodeBlock lang="python" filename="langsmith_setup.py">{`# Setup: variáveis de ambiente + uso automático
import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_API_KEY"] = "lsv2_..."
os.environ["LANGCHAIN_PROJECT"] = "ffv-agente-prod"

from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph

# Toda call LLM e nó LangGraph é tracked automaticamente
llm = ChatAnthropic(model="claude-sonnet-4-7")
response = llm.invoke("Olá")
# → aparece em smith.langchain.com com latência, tokens, custo, prompt, response

# Decorators para custom code
from langsmith import traceable

@traceable(name="custom-retrieval", run_type="retriever")
def my_retrieval(query: str) -> list[str]:
    # Sua lógica de retrieval — vira span filho do trace pai
    return search_db(query)

# Prompt versioning via Hub
from langchain import hub
prompt = hub.pull("my-team/research-agent:v3")  # versão pinada
response = llm.invoke(prompt.format(question="..."))`}</CodeBlock>
      </Section>

      <Section title="Helicone — proxy agnóstico" accent={ACCENT}>
        <CodeBlock lang="python" filename="helicone_setup.py">{`# Setup: muda base_url para Helicone — não exige callbacks/framework
import openai
import anthropic

# OpenAI via Helicone
openai_client = openai.OpenAI(
    base_url="https://oai.helicone.ai/v1",
    default_headers={
        "Helicone-Auth": f"Bearer {os.environ['HELICONE_API_KEY']}",
        "Helicone-User-Id": "user-42",
        "Helicone-Property-Feature": "research",      # custom properties
    },
)

# Anthropic via Helicone
anthropic_client = anthropic.Anthropic(
    base_url="https://anthropic.helicone.ai",
    default_headers={
        "Helicone-Auth": f"Bearer {os.environ['HELICONE_API_KEY']}",
        "Helicone-Cache-Enabled": "true",             # cache built-in
        "Helicone-Rate-Limit-Policy": "1000;w=60",    # 1000 req/min
    },
)

# Toda call passa pelo proxy — captura automática + features extras:
# - Cache de responses repetidos
# - Rate limiting per user
# - Cost tracking per property
# - Prompt management via Helicone Prompts`}</CodeBlock>
        <Callout tone="info">
          O fato de ser proxy traz feature exclusiva: cache de response (configurável por header).
          Identidade de prompt repetido = mesma resposta retornada sem chamar o provider.
          Reduz drasticamente custos em apps com prompts cacheáveis.
        </Callout>
      </Section>

      <Section title="Phoenix (Arize) — OTel-native + RAG" accent={ACCENT}>
        <CodeBlock lang="python" filename="phoenix_setup.py">{`# Phoenix self-host (Docker) + auto-instrumentation via openinference
import phoenix as px
from phoenix.otel import register
from openinference.instrumentation.openai import OpenAIInstrumentor
from openinference.instrumentation.langchain import LangChainInstrumentor

# Inicia UI local ou aponta para servidor remoto
px.launch_app()  # http://localhost:6006

# Configura tracer OTel — exports para Phoenix ou qualquer OTel backend
tracer_provider = register(
    project_name="ffv-agente",
    endpoint="http://localhost:6006/v1/traces",
)

# Auto-instrument SDKs
OpenAIInstrumentor().instrument(tracer_provider=tracer_provider)
LangChainInstrumentor().instrument(tracer_provider=tracer_provider)

# Specialty: embedding visualizations
# Phoenix mostra UMAP/t-SNE de embeddings, detecta drift entre prod/eval datasets
# Ideal para RAG observability — visualiza queries que retornam docs irrelevantes`}</CodeBlock>
      </Section>

      <Section title="Langfuse — open-source full stack" accent={ACCENT}>
        <CodeBlock lang="python" filename="langfuse_setup.py">{`from langfuse import Langfuse
from langfuse.decorators import observe

langfuse = Langfuse(
    public_key=os.environ["LANGFUSE_PUBLIC_KEY"],
    secret_key=os.environ["LANGFUSE_SECRET_KEY"],
    host="https://cloud.langfuse.com",   # ou self-host
)

@observe()
def research_agent(query: str) -> str:
    # Trace é criado automaticamente — child spans capturam calls LLM internas
    prompt = langfuse.get_prompt("research-system", version=3)
    messages = [{"role": "system", "content": prompt.compile()}]
    messages.append({"role": "user", "content": query})

    response = anthropic_client.messages.create(
        model="claude-sonnet-4-7",
        messages=messages,
        max_tokens=2000,
    )

    # Captura score (eval feedback ou LLM-as-judge)
    langfuse.score(
        trace_id=langfuse.get_current_trace_id(),
        name="relevance",
        value=0.85,
        comment="LLM-as-judge: relevância da resposta",
    )

    return response.content[0].text`}</CodeBlock>
      </Section>

      <Section title="Comparativo direto" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'LangSmith', 'Helicone', 'Phoenix', 'Langfuse']}
          rows={[
            ['Modelo', 'SDK callback', 'HTTP proxy', 'OTel SDK', 'SDK + decorators'],
            ['Framework-agnostic', 'Limitado', '✅ Total', '✅ OTel', '✅ Total'],
            ['Self-hostable', '⚠️ Enterprise', '⚠️ Enterprise', '✅', '✅'],
            ['Open-source', '❌', '⚠️ Parcial', '✅', '✅'],
            ['Prompt versioning', '✅ (Hub)', '✅', '⚠️', '✅'],
            ['Dataset capture', '✅', '✅', '✅', '✅'],
            ['LLM-as-judge', '✅', '⚠️', '✅', '✅'],
            ['Cache built-in', '❌', '✅ (proxy)', '❌', '❌'],
            ['Sweet spot', 'LangChain stacks', 'Multi-framework, cache', 'OTel-native, RAG', 'OSS full-stack'],
          ]}
        />
      </Section>

      <Section title="Arquitetura: como capturas hierárquicos funcionam" accent={ACCENT}>
        <ArchFlow
          accent={ACCENT}
          title="Anatomia de um trace de agente multi-step"
          columns={[
            {
              header: 'Trace level',
              items: [
                'Trace ID — sessão completa',
                'Início ao fim da request',
                'Metadata: user, version, feature',
              ],
            },
            {
              header: 'Span level',
              items: [
                'Supervisor span (parent)',
                '↳ Worker A span',
                '   ↳ Tool call span',
                '   ↳ LLM call span',
                '↳ Worker B span',
                '   ↳ LLM call span',
              ],
            },
            {
              header: 'Per-span data',
              items: [
                'Input/output JSON',
                'Latency ms',
                'Token usage + cost',
                'Errors + stack traces',
                'Custom metadata',
              ],
            },
            {
              header: 'Aggregations',
              items: [
                'P50/P95/P99 por feature',
                'Cost per user/day',
                'Error rate per tool',
                'Token volume trends',
                'Eval scores rolling',
              ],
            },
          ]}
        />
      </Section>

      <Section title="Decisão prática" accent={ACCENT}>
        <DecisionBox
          scenario="Time de 5 devs usa LangChain + LangGraph + Anthropic + alguns scripts Python diretos com OpenAI."
          winner="LangSmith (primário) + considere Langfuse OSS"
          winnerColor={ACCENT}
          why="Time é LangChain-first: LangSmith integra zero-config nos casos centrais. Para os scripts ad-hoc com OpenAI direto, decorators @traceable capturam. Se time quer evitar lock-in ou self-host, Langfuse OSS cobre 90% das features com instrumentation similar."
          alternatives={[
            { name: 'Helicone', note: 'Vence se você quer cache de response e abstração proxy — mas perde semantics LangChain' },
            { name: 'Phoenix', note: 'Vence se você já tem OTel collector e backend tipo Datadog/Honeycomb' },
            { name: 'Langfuse OSS', note: 'Vence se compliance/self-host é mandatório — features full-stack' },
          ]}
        />
        <FlowDiagram
          accent={ACCENT}
          title="Árvore de decisão"
          orientation="vertical"
          steps={[
            { icon: '🦜', label: 'Stack é LangChain/LangGraph?', desc: 'Sim → LangSmith é zero-config' },
            { icon: '🔒', label: 'Self-host é obrigatório?', desc: 'Sim → Phoenix ou Langfuse OSS' },
            { icon: '🌐', label: 'Multi-framework + quer cache?', desc: 'Helicone (proxy)' },
            { icon: '📡', label: 'Já tem OTel collector?', desc: 'Phoenix integra nativamente' },
            { icon: '💼', label: 'Default 2026', desc: 'Langfuse OSS — features full-stack, agnóstico' },
          ]}
        />
      </Section>

      <Section title="Timeline" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: 'Jul 2023', label: 'LangSmith beta', detail: 'LangChain — primeiro observability SaaS para LLMs' },
            { when: 'Set 2023', label: 'Helicone GA', detail: 'YC W23 — proxy approach' },
            { when: 'Out 2023', label: 'Langfuse v1', detail: 'Open-source MIT, full-stack OSS' },
            { when: 'Jan 2024', label: 'Arize Phoenix', detail: 'OTel-native, foco em RAG/embeddings' },
            { when: 'Mai 2024', label: 'OpenLLMetry standard', detail: 'OTel semantic conventions para LLM workloads', highlight: true },
            { when: 'Set 2024', label: 'OpenInference', detail: 'Arize publica semantics conventions LLM-specific' },
            { when: '2025', label: 'LangSmith Enterprise self-host', detail: 'LangChain entra em prod compliance-heavy' },
            { when: '2026', label: 'Padrão OTel consolidado', detail: 'Maioria das plataformas exporta OTel; vendor-neutral é default' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso usar 2 ferramentas ao mesmo tempo?"
          a="Sim — comum em times grandes. Exemplo: LangSmith para dev (rich semantics), Phoenix para SRE (OTel native + dashboards Grafana). Custo: overhead negligível, complexidade de manutenção real."
        />
        <QAItem
          q="LGPD/GDPR: como tratar PII em traces?"
          a="Todas as ferramentas suportam filtros: regex de remoção (CPF, email, telefone), denylist de keys de input/output, self-host on-prem. Em prod, sempre filtrar antes de enviar; auditar amostras. Anthropic Bedrock também suporta logging filtering server-side."
        />
        <QAItem
          q="Latência adicionada?"
          a="Helicone (proxy): +10–50ms por call (latência de rede extra). LangSmith/Langfuse/Phoenix (SDK): +1–5ms por span, async (não bloqueia request). Negligível em prod tipicamente."
        />
        <QAItem
          q="Custo?"
          a="LangSmith SaaS: $0.0005/trace + tiers. Helicone: free até 100k req/month. Langfuse Cloud: free até 50k events/month. Self-host: só infra. Volume alto (1M+ requests/month) → considere self-host (Langfuse/Phoenix) por custo."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'LangSmith', v: 'smith.langchain.com — docs: docs.smith.langchain.com' },
            { k: 'Helicone', v: 'helicone.ai — docs: docs.helicone.ai' },
            { k: 'Phoenix (Arize)', v: 'github.com/Arize-ai/phoenix — docs.arize.com/phoenix' },
            { k: 'Langfuse', v: 'langfuse.com — github.com/langfuse/langfuse (MIT)' },
            { k: 'OpenInference', v: 'github.com/Arize-ai/openinference — OTel semantic conventions para LLM' },
            { k: 'OpenLLMetry', v: 'github.com/traceloop/openllmetry — OTel para LLM stack' },
            { k: 'Dapper paper', v: 'Sigelman et al. "Dapper, a Large-Scale Distributed Systems Tracing Infrastructure". Google 2010 — origem de distributed tracing' },
          ]}
        />
      </Section>
    </div>
  );
}
