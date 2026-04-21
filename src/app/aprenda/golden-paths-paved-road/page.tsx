import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('golden-paths-paved-road');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que caracteriza um golden path bem feito?',
    options: [
      'Documentação extensa',
      '"Easy to do the right thing": novo serviço em 1 comando, inclui stack opinionada (runtime, CI, observability, SLO, deploy) já conectada. Off-path é permitido mas sem suporte e com custo de ownership total. O dev segue o path porque é mais fácil, não porque é obrigatório',
      'Proibir alternativas',
      'Auditar tudo',
    ],
    correct: 1,
    explanation: 'Netflix paved road, Spotify golden path, Google/Uber equivalentes: o caminho pavimentado oferece tanto valor (CI pronta, SLO dashboard, on-call integrado, deploy em 1 click) que virar off-path fica caro. Coerção via obrigação gera resistência; coerção via conveniência gera adoção.',
  },
  {
    question: 'Por que permitir off-path em vez de forçar o golden path?',
    options: [
      'Devs odeiam padrão',
      'Inovação acontece fora do path — next golden path nasce de um off-path que funciona. Forçar mata experimentação e cria shadow IT. Modelo: off-path ok, mas time assume 100% do custo de operação, observability, compliance e toil',
      'Padrão é ruim',
      'Nao importa',
    ],
    correct: 1,
    explanation: 'Platform como produto significa que sua plataforma compete em DX contra alternativas. Se um time acha que Go + bespoke stack resolve melhor que o Java paved road, deixa. Se funcionar bem e vários times seguirem, vira próximo golden path. Central + experimentação convivem.',
  },
  {
    question: 'Quais métricas validam um golden path?',
    options: [
      'Número de docs',
      'Tempo do commit vazio ao primeiro deploy em prod do serviço novo (idealmente minutos, não dias), taxa de adoção (% novos serviços criados via template), tempo de onboarding de dev novo até primeiro PR, incidentes por config drift (caindo após paved road)',
      'NPS genérico',
      'Estrela no Git',
    ],
    correct: 1,
    explanation: 'Métricas quantitativas e ligadas ao problema. Netflix monitora "time to first deploy" e "time to recovery" como KPIs da platform. Adoção baixa sinaliza que o path não resolve dor real — iterar ou descontinuar. Platform sem métrica vira teatro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="golden-paths-paved-road"
      title="Golden paths / paved road"
      icon="🛤️"
      xp={50}
      readTime={12}
      trailName="Platform Engineering & IDPs"
      trailColor={accent}
      nextSlug="self-service-infra"
      nextTitle="Self-service infra via UI/API"
      quiz={quiz}
    >
      <Section title="A ideia central" accent={accent}>
        <p>
          Golden path (Spotify) ou paved road (Netflix): um caminho pavimentado, opinionado, documentado, pelo
          qual 80% dos casos fluem sem atrito. O dev que segue ganha CI pronta, observability default, SLO
          dashboard, deploy automatizado, on-call integrado. Quem quer off-path pode, mas assume custo de
          ownership total.
        </p>
      </Section>

      <Section title="Anatomia de um paved road" accent={accent}>
        <CodeBlock lang="yaml">{`# Paved road: Node.js service (acme-paved-road-node)
stack:
  runtime: Node 22 LTS
  framework: Fastify + Zod
  db_default: Postgres via Crossplane claim
  cache: Redis shared cluster
  mq: NATS JetStream
ci_cd:
  pipeline: GitHub Actions reusable workflow
  deploy: ArgoCD ApplicationSet por environment
  progressive: Argo Rollouts canary 10% -> 50% -> 100%
observability:
  metrics: OpenTelemetry + Prometheus (auto-instrumented)
  logs: structured JSON to Loki
  traces: OTLP to Tempo
  dashboards: Grafana auto-provisioned (service + SLO panels)
slo_defaults:
  availability: 99.9%
  latency_p99: 300ms
  error_budget_policy: freeze releases if burn > 2x
on_call:
  pagerduty_service: auto-created from scaffolder
  runbook_template: docs/runbooks/{{service}}.md (seeded)`}</CodeBlock>
      </Section>

      <Section title="Experiência do dev" accent={accent}>
        <p>
          Do zero ao primeiro deploy em produção em menos de 30 minutos. O Backstage scaffolder prompta nome,
          owner, tier; gera repo, pipeline, infra, dashboard, runbook stub, catalog entry. Primeiro PR com
          health endpoint faz deploy canary. O dev percebe que divergir do path custa dias; seguir custa minutos.
        </p>
        <Callout tone="info" icon="🛤️">
          Regra Netflix: "make it easy to do the right thing and hard to do the wrong thing". Hard não é
          proibir — é tornar o caminho certo 10x mais conveniente. Compliance segue grátis.
        </Callout>
      </Section>

      <Section title="Quando retirar ou evoluir" accent={accent}>
        <p>
          Golden path vira dívida se não evoluir. Review trimestral: métricas de adoção, tickets, feedback.
          Runtime velho, framework deprecated, métricas que não atendem — deprecate com migration path claro.
          Um paved road que parou no tempo é pior que nenhum.
        </p>
        <Callout tone="warn" icon="⚠️">
          Não crie 10 paved roads simultâneos. 2 ou 3 stacks bem cuidados valem mais que catálogo inchado.
          Regra: um novo path entra quando 3+ times já pediram ou quando uma categoria nova de workload
          aparece (ex.: streaming data, ML serving).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
