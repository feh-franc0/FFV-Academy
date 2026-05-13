import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, KeyValue, FlowDiagram, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('agent-cost-optimization');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o desconto que o prompt caching da Anthropic aplica em tokens cacheados (cache hit)?',
    options: ['10%', '50%', 'Aproximadamente 90% no preço dos tokens de input cacheados (cache read)', '99%'],
    correct: 2,
    explanation: 'Anthropic prompt caching cobra ~10% do preço normal por tokens lidos do cache (cache_read_input_tokens). Há um custo extra de "cache write" (~25% acima do normal) na primeira criação. Net positive para qualquer prompt reutilizado ≥3 vezes.',
  },
  {
    question: 'O que é "cascade routing" no contexto de redução de custo?',
    options: [
      'Sempre usar o modelo mais barato',
      'Rotear cada query para o modelo mais barato suficiente; só escalar para modelo maior quando a confiança/qualidade for insuficiente. Ex: Haiku tenta primeiro, se confidence < threshold, escala para Sonnet, depois Opus se necessário',
      'Usar dois modelos em paralelo',
      'Trocar de modelo aleatoriamente',
    ],
    correct: 1,
    explanation: 'Cascade routing é o pattern que mais corta custo em produção. 70-90% das queries são triviais (Haiku/Gemini Flash resolvem). Só as difíceis sobem na escada. Frameworks: RouteLLM, Martian, AdaptiveLLM.',
  },
  {
    question: 'Qual é a estrutura típica de tokens em uma conversa com agente que torna caching MUITO efetivo?',
    options: [
      'System prompt + tools schema (estável) → conversation history (cresce) → user message (varia). System + tools podem ser cacheados; histórico estável pode ser cacheado em snapshots',
      'Tudo varia a cada mensagem',
      'Apenas a primeira mensagem',
      'Apenas mensagens longas',
    ],
    correct: 0,
    explanation: 'O lead estável (system prompt + tool schemas + few-shot examples) é exatamente o que precisa ser igual byte-a-byte para hit no cache. Bem orquestrado, um agente loga 80%+ cache hit rate.',
  },
  {
    question: 'Sobre context compression para reduzir tokens:',
    options: [
      'Não funciona em 2026',
      'Várias técnicas: sumarização incremental de turns antigos, "rolling window" (descartar mensagens antigas que não influenciam mais), retrieval-on-demand (RAG no histórico) e usar modelo menor especializado em compressão',
      'Apenas serve para imagens',
      'Reduz qualidade sempre 50%',
    ],
    correct: 1,
    explanation: 'Em conversas longas (50+ turns), context compression é obrigatório. Stack típica: turns recentes em texto completo, turns intermediários sumarizados (200 tokens cada), turns antigos só indexados em vector store. Anthropic publicou contexto compactado em 2024.',
  },
  {
    question: 'Qual modelo de custo é o MAIS revelador para um agente em produção?',
    options: [
      'Custo total por mês',
      'Custo por usuário ativo',
      'Custo médio por task completada (com p50 e p95) — atrela custo a valor entregue',
      'Custo total de tokens',
    ],
    correct: 2,
    explanation: 'Custo por task captura o trade-off: agente caro que resolve em 1 passo pode ser melhor que agente barato que precisa de 10. p50 vs p95 expõe outliers (uma query "estranha" pode custar 50x a mediana). Métrica de Bessemer/Tomasz Tunguz para SaaS AI 2026.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="agent-cost-optimization"
      title="Custo de agente: $/action, prompt cache, cascade routing"
      icon="💸"
      xp={60}
      readTime={12}
      trailName="AI Engineering Avançado"
      trailColor={accent}
      nextSlug="agent-security-prompt-injection"
      nextTitle="Agent security: prompt injection e jailbreak"
      quiz={quiz}
    >
      <Section title="O choque do primeiro mês de produção" accent={accent}>
        <p className="text-sm leading-6">
          Você lança o agente em beta. Tracking inicial: <InlineCode>US$0.12 por conversa</InlineCode>. "Tranquilo." Duas semanas depois, com 10k usuários ativos, a fatura mensal Anthropic vem <b>US$45.000</b>. Ninguém previu. O CFO te chama.
        </p>
        <p className="text-sm leading-6">
          O cálculo era certo no individual, errado no escalonamento. Tokens crescem com (a) tamanho do prompt × (b) chamadas por turn × (c) turns por conversa × (d) conversas por usuário × (e) usuários. Cada um desses cresce, e a multiplicação fica cruel.
        </p>
      </Section>

      <Section title="A fórmula do custo real por task" accent={accent}>
        <AnnotatedFormula
          title="Custo unitário"
          formula="cost_per_task = Σ_step (input_tokens × P_in + output_tokens × P_out)"
          accent={accent}
          parts={[
            { text: 'cost_per_task', annotation: 'A métrica que importa', highlight: true },
            { text: '=' },
            { text: 'Σ_step', annotation: 'Soma sobre cada chamada' },
            { text: '(' },
            { text: 'input_tokens', annotation: 'Inclui system + tools + history' },
            { text: '×' },
            { text: 'P_in', annotation: 'Preço de input ($/MTok)' },
            { text: '+' },
            { text: 'output_tokens', annotation: 'Tokens gerados pelo modelo' },
            { text: '×' },
            { text: 'P_out', annotation: 'Preço de output (~5x input)' },
            { text: ')' },
          ]}
        />
      </Section>

      <Section title="Alavanca #1 — Prompt caching (até 90% off)" accent={accent}>
        <p className="text-sm leading-6">
          Anthropic prompt caching: o prefixo estável do prompt (system + tools + few-shot) é cacheado no servidor por ~5 minutos (ou 1h em <i>extended</i>). Cache hit cobra <b>~10%</b> do preço normal do input. Cache write custa ~25% acima do normal — pago uma vez, amortiza em ~3 hits.
        </p>
        <CodeBlock lang="typescript">{`import Anthropic from '@anthropic-ai/sdk';
const client = new Anthropic();

const response = await client.messages.create({
  model: 'claude-sonnet-4-5',
  max_tokens: 1024,
  system: [
    {
      type: 'text',
      text: '<long system prompt with tool definitions + few-shot examples>',
      cache_control: { type: 'ephemeral' },  // ← marca o cache point
    },
  ],
  messages: [
    { role: 'user', content: 'Última pergunta do usuário (varia)' },
  ],
});

// usage.cache_creation_input_tokens — primeira chamada (custou 1.25x)
// usage.cache_read_input_tokens     — chamadas subsequentes (custaram 0.1x)`}</CodeBlock>
        <Callout tone="success">
          Para um agente com system prompt de 3000 tokens chamado 1000 vezes/dia: sem cache, US$9/dia em input. Com cache, US$1/dia. Em um ano, US$2.900 economizados <i>de um único cache point</i>.
        </Callout>
      </Section>

      <Section title="Alavanca #2 — Cascade routing" accent={accent}>
        <FlowDiagram
          title="Pipeline cascade — escalar só quando preciso"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🪙', label: 'Tier 1 — Haiku 4.5 / Gemini Flash', desc: '70-90% das queries triviais. ~$0.001/query' },
            { icon: '⚖️', label: 'Roteador checa confidence', desc: 'Score do output, validation rule, tipo de tarefa' },
            { icon: '💪', label: 'Tier 2 — Sonnet 4.6', desc: 'Queries médias. ~$0.01/query' },
            { icon: '🧠', label: 'Tier 3 — Opus 4.7 / GPT-5', desc: 'Apenas tarefas complexas. ~$0.10/query' },
          ]}
        />
        <CodeBlock lang="typescript">{`async function cascadeAnswer(query: string) {
  // Tier 1: rápido e barato
  const haiku = await call('claude-haiku-4-5', query);
  if (haiku.confidence > 0.85 && validateOutput(haiku)) return haiku;

  // Tier 2: maior, ainda barato
  const sonnet = await call('claude-sonnet-4-6', query);
  if (sonnet.confidence > 0.7 || requiresSimpleReasoning(query)) return sonnet;

  // Tier 3: pesado, só quando precisa
  return await call('claude-opus-4-7', query);
}`}</CodeBlock>
      </Section>

      <Section title="Alavanca #3 — Context compression em conversas longas" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Técnica', 'Custo de implementação', 'Redução típica']}
          rows={[
            ['Rolling window (descartar > N turns)', 'Trivial', '30-50%, perda de contexto distante'],
            ['Summarização incremental', 'Médio (chamar LLM extra)', '60-80%, preserva ideia geral'],
            ['Retrieval no histórico (RAG)', 'Médio-alto', '70-90%, melhor para sessions muito longas'],
            ['Pruning baseado em relevância (importance score)', 'Alto (avaliar cada turn)', '50-70%, melhor preservação'],
            ['Anthropic compaction nativo', 'Trivial — params da API', '50%+, sem código'],
          ]}
        />
      </Section>

      <Section title="Alavanca #4 — Reduzir output tokens" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Limite max_tokens agressivo', v: 'Output é 4-5x mais caro que input. Cada token a menos paga.' },
            { k: 'Structured output / JSON Schema', v: 'Forçar formato compacto evita prosa redundante' },
            { k: 'Prefixo "no preamble"', v: '"Responda diretamente, sem explicação." reduz prosa decorativa' },
            { k: 'Reasoning mode controlado', v: 'Anthropic extended thinking — orçar budget; sem orçamento, modelos pensam demais' },
            { k: 'Caching de outputs idênticos (LLM Gateway)', v: 'Para queries deterministicas (FAQ-like), cache local no app' },
          ]}
        />
      </Section>

      <Section title="Métricas de custo que você DEVE monitorar" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Cost per task (p50 e p95)', v: 'A norte. p95 expõe queries patológicas que dominam a fatura.' },
            { k: 'Cost per active user / month', v: 'Compare com ARPU; se cost > 30% do ARPU, model unsustainable' },
            { k: 'Cache hit rate', v: 'Saúde do prompt caching — alvo > 70% após estabilização' },
            { k: 'Tier distribution (cascade)', v: '% de queries em Haiku/Sonnet/Opus — drift indica regressão' },
            { k: 'Token cost trend (semana × semana)', v: 'Alerta se subir > 20% sem aumento de uso' },
            { k: 'Cost per resolved support ticket (agente de support)', v: 'Métrica direta de ROI vs humano' },
          ]}
        />
      </Section>

      <Section title="O alarme financeiro — antes da fatura" accent={accent}>
        <CodeBlock lang="typescript">{`// Middleware que mata loops com gasto desconfortável
const BUDGET_USD_PER_TASK = 0.50;
let taskCost = 0;

for (const step of agentSteps()) {
  const result = await runStep(step);
  taskCost += estimateCost(result.usage);

  if (taskCost > BUDGET_USD_PER_TASK) {
    log.warn({ taskId, taskCost }, 'budget exceeded, halting agent');
    return { status: 'budget_exceeded', partial: result };
  }
}`}</CodeBlock>
        <Callout tone="danger">
          Sem limite por task, um agente em loop infinito pode consumir <b>US$ centenas</b> antes do humano acordar. Budget gating é o cinto de segurança financeiro.
        </Callout>
      </Section>

      <Section title="Quando o problema NÃO é custo" accent={accent}>
        <p className="text-sm leading-6">
          Cenário comum: você corta 70% do custo, mas o churn subiu 5% porque o agente está pior. Custo é restrição, não objetivo. Em 2026 a régua é: <b>custo por task × qualidade × latência</b>. Otimizar um sozinho destrói os outros.
        </p>
      </Section>
    </ModuleLayout>
  );
}
