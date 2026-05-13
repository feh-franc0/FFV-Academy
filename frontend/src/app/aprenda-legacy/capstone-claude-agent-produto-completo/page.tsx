import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-claude-agent-produto-completo');
const accent = '#a78bfa';

const quiz: QuizQuestion[] = [
  {
    question: 'O que prompt caching reduz concretamente?',
    options: [
      'Latência só',
      'Cost (até 90% do prefix cacheado) + latency (não re-processa contexto grande). Combinado com system prompt grande + knowledge base, economia brutal em cargas repetitivas',
      'Bugs',
      'Nada',
    ],
    correct: 1,
    explanation: 'Anthropic prompt caching: marca blocks do prompt com cache_control. Primeira req constrói cache (5min TTL). Requests subsequentes com mesmo prefix reusam, custam 10% dos tokens cacheados. Economia gigante em RAG ou agents com system prompt pesado.',
  },
  {
    question: 'Por que MCP (Model Context Protocol)?',
    options: [
      'Feature de marketing',
      'Protocolo padronizado pra conectar LLM a fontes de dados (DB, APIs, files) via servers MCP plugáveis. Desacopla LLM de integrations — qualquer cliente (Claude, outros) fala com qualquer MCP server',
      'Replace API',
      'Só pra Claude',
    ],
    correct: 1,
    explanation: 'MCP (Anthropic, open protocol) define interface LLM ↔ tools/data. Servers expõem resources, tools, prompts. Clients (Claude Desktop, IDEs) consomem. Ecossistema de MCP servers cresce (GitHub, Slack, Linear, Postgres, etc) — one protocol fits all.',
  },
  {
    question: 'Por que feature flag pra agent?',
    options: [
      'Nenhum',
      'Rollout controlado — 5% users testa nova versão do agent (prompt/tools/modelo), mede qualidade + cost, rollback instantâneo se regride. Essencial porque eval nunca cobre tudo',
      'Moda',
      'Substitui teste',
    ],
    correct: 1,
    explanation: 'Agent em produção é frágil: prompt novo pode regressar em casos invisíveis. Feature flag (LaunchDarkly, Statsig) expõe nova versão a % user. Compara métricas (completion rate, cost, feedback score). Rollback = flag off em 1 segundo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-claude-agent-produto-completo"
      title="Capstone: agent Claude em produto real"
      icon="🏁"
      xp={95}
      readTime={20}
      trailName="API Claude & Agents"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Projeto" accent={accent}>
        <p>
          Construa um agent Claude que resolve problema real (escolha: triage de issues, revisor de PR, CS assistant). Entregue em produção com usuários reais.
        </p>
      </Section>

      <Section title="Stack" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Claude API</strong> com prompt caching em system prompt + context</li>
          <li><strong>Tool use</strong>: 3+ tools custom (DB query, API call, write action)</li>
          <li><strong>MCP servers</strong>: conecta a fontes relevantes (Linear/GitHub/Slack)</li>
          <li><strong>Memory</strong>: session em Redis com TTL</li>
          <li><strong>Observability</strong>: Langfuse (traces, feedback, cost/query)</li>
          <li><strong>Eval harness</strong>: golden set + LLM judge + regression em CI</li>
          <li><strong>Rate limit graceful</strong>: backoff exponencial, queue em overflow</li>
          <li><strong>Feature flag</strong>: canary por versão do agent</li>
        </ul>
        <Callout tone="success" icon="🎓">
          Entregável: URL de produção, métricas de 7+ dias de uso real, repo com eval harness rodando em CI, retrospective do que aprendeu. Portfolio real.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
