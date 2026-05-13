import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ab-testing-de-prompt-em-producao');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual métrica primária pra A/B de LLM em produção?',
    options: [
      'Apenas accuracy',
      'Depende do produto: completion rate, user satisfaction (thumbs), task success proxy (e-commerce: purchase após assistant help), cost/request. Múltiplas métricas pra triangulate — single metric = gaming',
      'Só latency',
      'Só cost',
    ],
    correct: 1,
    explanation: 'Single metric é antipattern. Stack recomendado: (1) task-specific (completion rate, thumbs up%), (2) cost per request, (3) latency p95, (4) safety (harmful refusal), (5) user retention 7-day. Trade-offs entre métricas são decisões business — não só "accuracy up".',
  },
  {
    question: 'Como garantir statistical significance em A/B de LLM?',
    options: [
      'Rodar 1 semana',
      'Sample size calculator ANTES: effect size esperado, alpha=0.05, power=0.8. Tipicamente 1000-5000 users por variant pra detectar 2-5% diff. Sem isso, conclusions são ruído',
      'Feel it',
      'Não precisa',
    ],
    correct: 1,
    explanation: 'A/B sem sample size calc = fake science. Use z-test calculator (GrowthBook, Statsig, Optimizely built-in). Pequeno change (+1%) needs larger sample; big change (+10%) less. Stop early quando significance alcançada — mas com sequential correction (SPRT) pra evitar peeking bias.',
  },
  {
    question: 'Como lidar com "bad version" em A/B prod rapidamente?',
    options: [
      'Wait out',
      'Guard rails automáticos: se variant nova tem error rate spike OR user complaint spike, auto-rollback em minutos. Feature flag SDK (LaunchDarkly, Statsig) suportam safeguards nativamente',
      'Email me',
      'Nada',
    ],
    correct: 1,
    explanation: 'LLM A/B pode quebrar produção em horas. Guard rails: threshold alerts (error rate &gt; N%, thumbs down rate &gt; X%), auto-shutoff de variant ruim, email alert to team. Essencial pra rollout seguro de 5% → 50% → 100%. Sem guard rails, pequena bug vira incident.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ab-testing-de-prompt-em-producao"
      title="A/B testing de prompt em produção"
      icon="🔀"
      xp={55}
      readTime={13}
      trailName="LLM Evals Profissional"
      trailColor={accent}
      nextSlug="regression-testing-para-agents"
      nextTitle="Regression testing pra agents: evitar regredir por mudança"
      quiz={quiz}
    >
      <Section title="Stack A/B recomendada" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>Feature flag SDK</strong>: LaunchDarkly, Statsig (free tier), Unleash (open), GrowthBook (open)</li>
          <li><strong>Traffic split</strong>: 5% canary → 25% → 50% → 100% se métricas OK</li>
          <li><strong>Sticky assignment</strong>: same user sempre mesma variant (user_id hash)</li>
          <li><strong>Métricas</strong>: tracked em Amplitude/Mixpanel + Langfuse (LLM-specific)</li>
          <li><strong>Guard rails</strong>: SDK auto-disable variant em spike de error/complaint</li>
          <li><strong>Statistical engine</strong>: built-in nos SDKs modernos</li>
        </ul>
      </Section>

      <Section title="Código exemplo (Statsig)" accent={accent}>
        <CodeBlock lang="typescript">{`import { Statsig } from 'statsig-node';
await Statsig.initialize(process.env.STATSIG_SECRET!);

export async function generateResponse(user: User, query: string) {
  const variant = await Statsig.getExperiment(user, 'assistant_prompt_v2');
  const promptVersion = variant.get('version', 'v1');

  const systemPrompt = promptVersion === 'v2' ? PROMPT_V2 : PROMPT_V1;
  const start = Date.now();
  const response = await claude.messages.create({
    model: 'claude-sonnet-4',
    system: systemPrompt,
    messages: [{ role: 'user', content: query }],
  });

  // Log metrics
  await Statsig.logEvent(user, 'llm_request', {
    variant: promptVersion,
    latency_ms: Date.now() - start,
    input_tokens: response.usage.input_tokens,
    output_tokens: response.usage.output_tokens,
  });

  return response;
}`}</CodeBlock>
      </Section>

      <Section title="Retry loop" accent={accent}>
        <Callout tone="info" icon="💡">
          LLM A/B vira loop contínuo: hipótese → variant → 1-2 semanas prod → decide promote/rollback → próxima hipótese. Organizações maduras rodam 5-20 A/Bs concorrentes. Cultura: &quot;toda mudança de prompt é variant&quot; — não merge main sem A/B ship.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
