import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, ComparisonTable, KeyValue, FlowDiagram, ArchFlow } from '@/components/article/primitives';

export const metadata = getModuleMetadata('agent-evaluation-prod');

const accent = '#06b6d4';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença fundamental entre avaliar um LLM single-turn e avaliar um agente?',
    options: [
      'Não há diferença — basta rodar MMLU',
      'Agente tem trajetória multi-step (planner → tool → observação → próximo passo); a métrica final pode estar certa por caminhos errados (chega na resposta certa mas chamou 20 tools desnecessárias). Precisa avaliar trajetória inteira',
      'Agente sempre tem resposta certa',
      'Agente não pode ser avaliado',
    ],
    correct: 1,
    explanation: 'Em LLM single-turn você compara output com gold. Em agente, você precisa avaliar a trajetória (sequência de calls + reasoning) — golden trajectories são o equivalente correto.',
  },
  {
    question: 'O que é "LLM-as-judge" e qual seu principal pitfall?',
    options: [
      'Usar um LLM (geralmente mais forte que o produto) para avaliar saídas de outro LLM — pitfall: viés do juiz para escolher respostas verbosas, similares ao seu próprio estilo, ou da mesma família',
      'Pedir para o usuário avaliar',
      'É proibido pela OpenAI',
      'Substitui qualquer eval humano',
    ],
    correct: 0,
    explanation: 'LLM-as-judge é poderoso e barato, mas tem viés conhecido: (1) position bias (favorece a primeira opção), (2) length bias (verbosity wins), (3) self-bias (Claude-judge prefere outputs Claude-style). Mitigações: swap de posição, pairwise + ties, calibragem humana periódica.',
  },
  {
    question: 'Sobre regression eval em CI para agentes:',
    options: [
      'Não é viável por custo',
      'É essencial: cada PR roda subset de golden trajectories e o pipeline falha se métrica cair > X%. Como teste unitário, mas para reasoning. Custo controlado via cache + subset estratificado',
      'Deve rodar 100% do golden set em todo commit',
      'Só deve rodar uma vez por release',
    ],
    correct: 1,
    explanation: 'Regression eval em CI é estado da arte 2026. Sem ele, você só descobre que o agente piorou depois de subir. Stack típica: LangSmith / Phoenix / Braintrust faz dispatch de subset (~20-50 trajectories) por PR, falha se MRR cai >3%.',
  },
  {
    question: 'O que NÃO é uma métrica útil para avaliar agente em produção?',
    options: [
      'Task success rate (concluiu o objetivo final)',
      'Trajectory efficiency (passos para completar vs. ótimo)',
      'Tempo de resposta de cada tool call',
      'Quantidade de tokens TOTAIS gerados — sem contexto de tarefa, não diz nada sobre qualidade',
    ],
    correct: 3,
    explanation: 'Tokens totais é vanity metric. Um agente que resolve em 500 tokens vs 5000 tokens é melhor — mas tokens isolados não medem qualidade. Métricas úteis: task success, trajectory efficiency (steps), tool error rate, p95 latency por step, custo por task.',
  },
  {
    question: 'Quando human eval ainda é insubstituível?',
    options: [
      'Nunca, em 2026 LLM-as-judge é suficiente',
      'Para domínio especializado (médico, legal, financeiro), para casos onde subjective quality importa (tom, empatia), para calibrar o juiz LLM periodicamente, e para final acceptance test antes de release maior',
      'Apenas para fine-tune',
      'Quando o agente erra',
    ],
    correct: 1,
    explanation: 'Em 2026 o gap LLM-judge vs human-judge fechou em muitos domínios genéricos. Mas: domínio especializado, julgamento estético/empático, e calibragem do próprio juiz precisam de humano. Padrão: 5-10% das amostras vão para human review como ground truth ongoing.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="agent-evaluation-prod"
      title="Agent evaluation em produção: golden sets vs LLM-as-judge"
      icon="📏"
      xp={70}
      readTime={14}
      trailName="AI Engineering Avançado"
      trailColor={accent}
      nextSlug="agent-cost-optimization"
      nextTitle="Custo de agente: $/action e cascade routing"
      quiz={quiz}
    >
      <Section title="Por que avaliar agente é mais difícil que avaliar LLM" accent={accent}>
        <p className="text-sm leading-6">
          Avaliar um chat single-turn: você tem prompt → resposta → compara com gold. Avaliar um agente: planejou? escolheu a tool certa? interpretou o resultado? executou o número correto de passos? recuperou de erro intermediário? <b>Avaliar agente = avaliar trajetória inteira</b>, não só o output final.
        </p>
        <Callout tone="warn">
          Um agente pode chegar na resposta certa por caminhos errados — usando 20 chamadas redundantes a APIs externas, gastando 10x o orçamento, vazando dados pra contextos errados. Output correto ≠ trajetória correta.
        </Callout>
      </Section>

      <Section title="Os 3 níveis de avaliação" accent={accent}>
        <ArchFlow
          title="Pirâmide de eval — do unitário ao end-to-end"
          accent={accent}
          columns={[
            {
              header: 'Component-level',
              items: ['Prompt isolado', 'Tool call isolada', 'Retrieval isolado'],
              footer: 'Rápido, barato, alta cobertura',
            },
            {
              header: 'Trajectory-level',
              headerColor: '#f59e0b',
              items: ['Sequência de calls', 'Reasoning entre steps', 'Tool selection', 'Error recovery'],
              footer: 'O coração da eval de agente',
            },
            {
              header: 'End-to-end / Outcome',
              headerColor: '#10b981',
              items: ['Task success', 'User satisfaction', 'Business metric impactada'],
              footer: 'Lento, caro, mais real',
            },
          ]}
        />
      </Section>

      <Section title="Golden trajectories — o que é e como construir" accent={accent}>
        <p className="text-sm leading-6">
          Golden trajectory é a trajetória <i>esperada</i> de um agente: prompt inicial + sequência canônica de (thought → action → observation) + output final. Você cura ~50-200 dessas amostras para cobrir cenários críticos (happy path + edge cases + failure modes).
        </p>
        <CodeBlock lang="python">{`# Exemplo simplificado — golden trajectory para agente de e-commerce
{
  "id": "track_order_happy_path",
  "input": "Onde está meu pedido #12345?",
  "expected_trajectory": [
    {"step": 1, "action": "tool:order_lookup", "args": {"order_id": "12345"}},
    {"step": 2, "action": "tool:tracking_lookup", "args": {"tracking_id": "BR123ABC"}},
    {"step": 3, "action": "respond", "args": {"message_pattern": "Seu pedido .* está em (trânsito|preparação|entregue)"}}
  ],
  "expected_outcome": "user_informed_with_status",
  "max_steps": 5,
  "max_cost_usd": 0.05
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Origem das trajetórias', v: 'Logs reais de produção (curados) + casos sintéticos para edge cases' },
            { k: 'Tamanho recomendado', v: '50-200 trajetórias para CI/regression, 500-2000 para release acceptance' },
            { k: 'Versionamento', v: 'Git — trajectories são código. Mudanças passam por PR' },
            { k: 'Atualização', v: 'Mensal: revisar drift entre golden e produção real' },
          ]}
        />
      </Section>

      <Section title="LLM-as-judge — o trade-off prático" accent={accent}>
        <p className="text-sm leading-6">
          A ideia de Zheng et al (NeurIPS 2023, "MT-Bench"): use um LLM forte (Claude Opus, GPT-4) como árbitro de respostas geradas por um LLM menor. Velocidade humano-like sem o custo. Mas vem com vieses:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Viés conhecido', 'Como mitigar']}
          rows={[
            ['Position bias', 'Avaliar (A, B) e (B, A); reportar só se ambas concordam'],
            ['Length bias (favorece verbose)', 'Normalizar por length na rubrica explícita'],
            ['Self-bias (mesma família vence)', 'Usar juiz de família diferente do produto avaliado'],
            ['Sycophancy', 'Pedir crítica explícita; rubrica que penaliza ambiguidade'],
            ['Calibragem ao longo do tempo', 'Re-validar com 5-10% human eval semanal'],
          ]}
        />
      </Section>

      <Section title="Regression eval em CI — stack moderna" accent={accent}>
        <FlowDiagram
          title="Pipeline de PR com eval gating"
          accent={accent}
          orientation="vertical"
          steps={[
            { icon: '🔁', label: 'PR aberto', desc: 'Mudança em prompt, tool, modelo ou RAG' },
            { icon: '🎯', label: 'CI dispara subset', desc: '20-50 golden trajectories estratificadas' },
            { icon: '📊', label: 'Métricas computadas', desc: 'Task success, trajectory edit distance, custo, latência' },
            { icon: '🚧', label: 'Gating', desc: 'Falha se métrica principal cai > limiar (ex: -3%)' },
            { icon: '👀', label: 'Diff visual', desc: 'LangSmith/Braintrust mostra antes/depois lado a lado' },
            { icon: '✅', label: 'Merge', desc: 'Após review humano dos diffs' },
          ]}
        />
        <Callout tone="info">
          O subset estratificado é a chave do custo controlado: pegue trajetórias de cada categoria (auth, search, checkout, support) e do cada nível de dificuldade. ~30 trajetórias bem escolhidas detectam 80% das regressões.
        </Callout>
      </Section>

      <Section title="Frameworks 2026 — qual usar" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'Foco', 'Quando escolher']}
          rows={[
            ['LangSmith', 'Trace + eval + dataset, integração LangChain/LangGraph nativa', 'Já usa LangChain stack'],
            ['Phoenix Arize', 'Open-source, tracing OpenTelemetry, RAG-eval forte', 'Quer self-host + OTel'],
            ['Braintrust', 'DX moderna, scoring custom, diff visual entre runs', 'Time pequeno, foco em iteração rápida'],
            ['Langfuse', 'OSS, self-host friendly, prompts versionados', 'Self-host + EU/LGPD-friendly'],
            ['Promptfoo', 'CLI-first, ótimo pra CI', 'Pipelines simples, eval declarativa em YAML'],
            ['Helicone', 'Mais sobre observabilidade que eval', 'Visibilidade rápida sem instrumentação pesada'],
          ]}
        />
      </Section>

      <Section title="Métricas que realmente importam" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Task success rate', v: 'Binário ou rubrica — concluiu o objetivo? (a métrica norte)' },
            { k: 'Trajectory efficiency', v: 'Passos reais ÷ passos do golden ideal. Próximo de 1.0 é ótimo.' },
            { k: 'Tool error rate', v: '% de tool calls que retornaram erro — saúde do ambiente' },
            { k: 'Recovery rate', v: 'Quando tool falha, agente se recupera? Critical para production' },
            { k: 'p50/p95 latency end-to-end', v: 'O usuário sente p95, não a média' },
            { k: 'Cost per task', v: 'US$ médio para concluir uma tarefa (depende de tokens + tool fees)' },
            { k: 'Hallucination rate', v: 'Fração de respostas com claim factual incorreta (precisa rubric)' },
          ]}
        />
      </Section>

      <Section title="Agent Arena — comparação head-to-head" accent={accent}>
        <p className="text-sm leading-6">
          Padrão emergente em 2026: <b>agent arenas</b> (LMArena-style para agentes) — duas versões do agente respondem em paralelo, usuário/juiz vota qual foi melhor, Elo score acumula. Bom para evolução contínua entre versões; ruim para acceptance gates absolutos.
        </p>
      </Section>

      <Section title="Quando voltar para human eval" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Domínio especializado', v: 'Médico, legal, financeiro, regulatório' },
            { k: 'Qualidade subjetiva', v: 'Tom, empatia, criatividade — métrica difícil de formalizar' },
            { k: 'Release maior', v: 'Final acceptance antes de empurrar para 100% dos usuários' },
            { k: 'Calibragem do juiz LLM', v: '5-10% das amostras vão pra humano como ground truth ongoing' },
            { k: 'Casos de falha crítica', v: 'Toda falha de segurança/safety vai pra revisão humana detalhada' },
          ]}
        />
      </Section>
    </ModuleLayout>
  );
}
