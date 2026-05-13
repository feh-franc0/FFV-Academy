import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('eval-frameworks');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual framework é open-source + CI-friendly?',
    options: [
      'Braintrust',
      'Promptfoo — YAML-driven, open (MIT), runs em CI (GitHub Actions), pairwise LLM-judge built-in, ótimo pra regression suite. Braintrust/Langfuse são SaaS (tier free disponível)',
      'Langfuse',
      'Inspect',
    ],
    correct: 1,
    explanation: 'Promptfoo (2023+) é standard pra eval YAML em CI. Define assertions, datasets, providers (multi-model). Runs headless. Graceful em CI pipeline. Complemento a Langfuse (observability em prod) — evals em dev/CI com Promptfoo, produção monitorada com Langfuse.',
  },
  {
    question: 'Quando escolher Braintrust?',
    options: [
      'Nunca',
      'Enterprise sério em eval operations: UI premium pra human review, comparison side-by-side, scorers customizados fortes, tracking version. Pago mas investido em DX de eval team',
      'Só startup',
      'Open source',
    ],
    correct: 1,
    explanation: 'Braintrust (2023, Elon Musk investor) é plataforma paga focada em eval. UI top (humans review, labeled data, prompt playground). Ideal pra time ML/eval team-oriented. Competitor: HoneyHive, Langsmith (LangChain). Pra startups: Langfuse open source cobre ~80% do valor gratuitamente.',
  },
  {
    question: 'O que Inspect (UK AI Safety Institute) diferencia?',
    options: [
      'Comercial',
      'Research-grade framework open — padrão em publicações acadêmicas, solvers complexos (multi-turn, tool use, adversarial), scoring rigoroso. Ideal pra safety evals + research, overkill pra CRUD LLM app',
      'Só Windows',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Inspect é da UK AI Safety Institute (government lab). Focus: rigorous research-grade. Solvers permitem agentic scenarios complex. Custom scorers. Usado em papers safety/alignment. Production LLM apps comuns: overkill. Mas se você roda capability evaluations sérias, Inspect é pick.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="eval-frameworks"
      title="Eval frameworks: Braintrust, Langfuse, Inspect, Promptfoo"
      icon="🧰"
      xp={55}
      readTime={13}
      trailName="LLM Evals Profissional"
      trailColor={accent}
      nextSlug="ab-testing-de-prompt-em-producao"
      nextTitle="A/B testing de prompt em produção"
      quiz={quiz}
    >
      <Section title="Frameworks comparados" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Tool', 'Tipo', 'Quando usar']}
          rows={[
            ['Promptfoo', 'Open, YAML, CLI', 'CI/dev evals, regression, open-first'],
            ['Langfuse', 'Open-source + SaaS', 'Observability prod + evals combinados'],
            ['Braintrust', 'SaaS pago (free tier)', 'Enterprise eval team, UI premium'],
            ['Inspect AI', 'Open, research-grade', 'Safety evals, research, agentic complex'],
            ['LangSmith', 'LangChain SaaS', 'Já em LangChain ecosystem'],
            ['HoneyHive', 'SaaS', 'Prod-focused alternative'],
          ]}
        />
      </Section>

      <Section title="Promptfoo setup rápido" accent={accent}>
        <Callout tone="info" icon="💡">
          <code>npx promptfoo init</code> → YAML com prompts + tests + providers → <code>npx promptfoo eval</code>. Assertions: contains, regex, factuality (LLM judge), similar, cost. CI: exits non-zero se regression. Dashboards HTML auto. Tier free + open.
        </Callout>
      </Section>

      <Section title="Pipeline recomendado" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Dev local</strong>: Promptfoo em CLI pra iterar prompts</li>
          <li><strong>CI/PR</strong>: Promptfoo como gate — regression fail = blocked</li>
          <li><strong>Staging</strong>: Langfuse captura traces, human review sample</li>
          <li><strong>Production</strong>: Langfuse observability + feedback loop → golden set</li>
          <li><strong>Quarterly</strong>: evaluation deep com Braintrust/Inspect</li>
        </ul>
      </Section>
    </ModuleLayout>
  );
}
