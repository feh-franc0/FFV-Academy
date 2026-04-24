import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dora-space-metricas');

const accent = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'Quais são as 4 DORA keys e o que cada uma representa?',
    options: [
      'Bugs, LOC, PRs, commits',
      'Deployment Frequency (quantas vezes deploy em prod), Lead Time for Changes (do commit ao prod), Change Failure Rate (% de deploys que causam incidente/rollback), Time to Restore Service (MTTR). Elite teams: on-demand deploy, LT menos de 1 dia, CFR abaixo de 15%, TTR abaixo de 1 hora',
      'Só velocidade',
      'Uptime only',
    ],
    correct: 1,
    explanation: 'DORA State of DevOps Report (Google/DORA) correlaciona essas 4 com performance organizacional. Elite e High performers dominam em todas as 4, não trade-off. Lead time alto + failure rate baixo é suspeito (gated demais). Deploy frequency alto + TTR alto é imprudente (rápido mas sem resiliência).',
  },
  {
    question: 'Por que o SPACE framework complementa DORA?',
    options: [
      'Substitui',
      'DORA mede throughput/stability. SPACE adiciona dimensões humanas: Satisfaction (well-being, burnout), Performance, Activity, Communication/Collaboration, Efficiency/Flow. Um time com métricas DORA ótimas mas equipe esgotada não é sustentável — SPACE captura esse risco',
      'Só para Scrum',
      'Nao ajuda',
    ],
    correct: 1,
    explanation: 'SPACE (Forsgren, Storey, Maddila, Zimmermann 2021) reconhece que developer productivity é multidimensional. Medir só throughput leva a otimizações tóxicas (mais PRs, menos qualidade). Combinar DORA + SPACE dá leitura completa: rápido, estável e sustentável.',
  },
  {
    question: 'Que anti-patterns medir produtividade de dev tem?',
    options: [
      'Nenhum',
      'LOC (incentiva inchaço), PR count (incentiva quebra artificial), hours worked (incentiva burnout performativo), commits por dia (incentiva pollution), story points (subjetivo), tickets closed (ignora qualidade). Métricas devem ser outcome (business value, user impact), não output',
      'Story points perfeitos',
      'LOC é ouro',
    ],
    correct: 1,
    explanation: 'Goodhart law: "when a measure becomes a target, it ceases to be a good measure". Qualquer proxy mensurável de productividade vira gaming. Única defesa: medir outcome (feature shipped, bug reduzido, perf ganha) e trust + coach no nível individual. Métricas agregadas servem time, não performance review individual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dora-space-metricas"
      title="Métricas: DORA + SPACE"
      icon="📊"
      xp={50}
      readTime={12}
      trailName="Platform Engineering & IDPs"
      trailColor={accent}
      nextSlug="capstone-ipd-completo"
      nextTitle="Capstone: IDP end-to-end"
      quiz={quiz}
    >
      <Section title="DORA 4 keys" accent={accent}>
        <p>
          Deployment Frequency, Lead Time for Changes, Change Failure Rate, Time to Restore Service. Validado
          em uma década de State of DevOps Report com dezenas de milhares de respondentes. Times elite
          dominam nas 4; trade-offs são mito.
        </p>
        <CodeBlock lang="yaml">{`# Thresholds (DORA 2023)
elite:
  deployment_frequency: on-demand (multiplos por dia)
  lead_time: menos de 1 dia
  change_failure_rate: 0-15%
  time_to_restore: menos de 1 hora

high:
  deployment_frequency: entre 1/dia e 1/semana
  lead_time: entre 1 dia e 1 semana
  change_failure_rate: 16-30%
  time_to_restore: menos de 1 dia

medium:
  deployment_frequency: entre 1/semana e 1/mes
  lead_time: entre 1 semana e 1 mes

low:
  deployment_frequency: entre 1/mes e 1/6-meses
  lead_time: maior que 6 meses`}</CodeBlock>
      </Section>

      <Section title="Como instrumentar" accent={accent}>
        <p>
          Deployment Frequency: contador de deploys em prod (webhook do ArgoCD, GitHub Actions, pipeline).
          Lead Time: timestamp do primeiro commit no PR vs timestamp do deploy que o contém. CFR: deploys que
          geraram incidente/rollback sobre total deploys. TTR: tempo do alerta ao resolved no PagerDuty/Incident.
        </p>
        <Callout tone="info" icon="💡">
          Ferramentas prontas: Google Four Keys (open source), LinearB, Swarmia, Jellyfish. Self-host com
          Grafana + Postgres também funciona. Instrumentação é barata; a parte cara é não gaming.
        </Callout>
      </Section>

      <Section title="SPACE framework" accent={accent}>
        <CodeBlock lang="yaml">{`SPACE:
  Satisfaction:
    - developer experience survey trimestral
    - eNPS, burnout indicator
  Performance:
    - outcome (feature adoption, bug rate)
    - code quality signals
  Activity:
    - PRs, reviews, deploys (com cuidado - nao target)
  Communication:
    - review latency, knowledge sharing
    - incident collaboration quality
  Efficiency_flow:
    - interruption frequency
    - time spent waiting (CI, review, approval)
    - context switches per day`}</CodeBlock>
        <p>
          SPACE exige survey qualitativo + dados quantitativos. Combine: DORA no dashboard, SPACE no diagnóstico
          semestral. Platform team usa as duas para priorizar — se developers reclamam de CI lento na survey e
          Lead Time está subindo, prioridade clara.
        </p>
      </Section>

      <Section title="Anti-patterns" accent={accent}>
        <Callout tone="danger" icon="🚨">
          Nunca use DORA/SPACE para performance review individual. Métricas são do time/sistema. Individual é
          lagging indicator de contexto (tools, incidents, handoffs). Ranking individual por métrica destrói
          colaboração e gaming vira inevitável (Goodhart).
        </Callout>
        <p>
          Outros anti-patterns: dashboards que ninguém olha, métricas sem baseline, reviews que só miram verde
          (ignora red que indica aprendizado), comparação cross-team sem contexto.
        </p>
      </Section>
    </ModuleLayout>
  );
}
