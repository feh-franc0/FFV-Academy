import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('finops-cultura-e-time');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'FinOps Framework: Inform / Optimize / Operate — o que cada fase?',
    options: [
      'Só marketing',
      'Inform: visibility (tags, dashboards, allocation). Optimize: identificar + aplicar economia (rightsizing, commitments, cleanup). Operate: processes recorrentes (monthly review, accountability, KPIs, governance). Cada fase exige maturidade da anterior — pular Inform mata Optimize',
      'Iguais',
      'Só Optimize',
    ],
    correct: 1,
    explanation: 'Inform primeiro: sem cost allocation por time/produto, qualquer iniciativa de Optimize é chute. Optimize dá wins rápidos (rightsizing, SPs, cleanup). Operate torna sustainable — processes, KPIs, accountability distribuída. Maturidade em spiral: times reentram em Inform conforme escalam.',
  },
  {
    question: 'Showback vs Chargeback: trade-off?',
    options: [
      'Mesma coisa',
      'Showback mostra custo por time/produto sem billing interno (menos atrito, educacional). Chargeback faturas reais passadas pra budget do time (mais accountability, mais atrito político). Começar com showback, evoluir pra chargeback quando cultura amadurece + tagging é confiável',
      'Só chargeback funciona',
      'Só showback',
    ],
    correct: 1,
    explanation: 'Chargeback sem cultura/tagging gera guerra política ("meu custo está errado, me cobraram do time vizinho"). Showback educa times sem risco imediato ao budget — cultura forma antes de aplicar bill interno. Gradualmente chargeback em areas maduras (ex: times de produto) enquanto shared services fica em showback.',
  },
  {
    question: 'Central FinOps team vs embedded: qual modelo?',
    options: [
      'Só central',
      'Híbrido ganha em escala: time central define framework, tools, standards, dashboards, executive reporting. FinOps embedded (ou champions) em cada engineering team aplica dia-a-dia, justifica spend, otimiza localmente. Central sem embedded = oversight disconnected',
      'Só embedded',
      'Nenhum funciona',
    ],
    correct: 1,
    explanation: 'Central-only: time pequeno analisando 100 teams, vira gargalo e percebido como "policia do custo". Embedded-only: inconsistência entre times, sem alavanca de negociação com vendors. Híbrido: central é platform + strategy; embedded é operação local. Champions/ambassadors em cada eng team escalam sem headcount massivo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="finops-cultura-e-time"
      title="FinOps cultura: team accountability + processes"
      icon="🤝"
      xp={50}
      readTime={12}
      trailName="FinOps & Cost Engineering"
      trailColor={accent}
      nextSlug="observability-de-custo"
      nextTitle="Observability de custo: tags, allocation, dashboards"
      quiz={quiz}
    >
      <Section title="FinOps Framework (FinOps Foundation)" accent={accent}>
        <CodeBlock lang="yaml">{`Fases (ciclicamente, por workload/team):

Inform:
  - Cost visibility, allocation por time/produto
  - Tagging strategy + enforcement
  - Dashboards compartilhados
  - Forecasting baseline

Optimize:
  - Rightsizing (Compute Optimizer)
  - Commitments (SPs, RIs)
  - Spot onde cabe
  - Architecture review (Graviton, serverless, caching)
  - Cleanup automation

Operate:
  - Monthly cost review com times
  - KPIs por engineering team (cost/request, gross margin)
  - Governance (tag policy, SCP, quotas)
  - Incidents cost-related tratados como incident tradicional

Princípios FinOps Foundation:
  1. Teams need to collaborate
  2. Decisions are driven by business value
  3. Everyone takes ownership for cloud usage
  4. FinOps reports accessible + timely
  5. A centralized team drives FinOps
  6. Take advantage of variable cost model`}</CodeBlock>
      </Section>

      <Section title="KPIs por engineering team" accent={accent}>
        <p>
          Cada team owner precisa de KPIs relevantes pra sua área: cost per active user (produto), cost per request (API), gross margin (line of business), efficiency (requests/dollar), commitment coverage %. Reportados mensalmente em FinOps review + dashboards auto-atualizados. Meta: tendência, não número absoluto.
        </p>
        <CodeBlock lang="yaml">{`KPIs típicos em SaaS B2B 2026:

Product teams:
  cost_per_active_user    (trend month-over-month)
  gross_margin_per_tier   (free, starter, pro, enterprise)

Platform teams:
  efficiency_index        (requests per dollar)
  commitment_coverage     (% spend coberto por SP/RI)

ML teams:
  cost_per_inference      ($ / 1k requests)
  training_cost_per_model  (baseline experiment custo)

Data teams:
  cost_per_query          (Athena/Redshift)
  storage_hot_cold_ratio  (% em Standard vs IA/Glacier)`}</CodeBlock>
      </Section>

      <Section title="Processes que funcionam" accent={accent}>
        <p>
          Monthly FinOps review (1h, cada team owner reporta KPIs + anomalies + planos), quarterly planning (negociar coverage de commitment vs flexibilidade), cost incident response (spike &gt; $X vira incident com postmortem), budget approval workflow (resource novo &gt; $Y exige justificativa). Tudo documentado em runbook vivo, não PDF morto.
        </p>
        <Callout tone="success" icon="✅">
          FinOps cultura emerge de processes sustentáveis, não de slide deck. Dashboards visíveis, KPIs em OKR, review recorrente, embedded champions, central platform team. Em 12-18 meses, "como está o custo do meu serviço" vira pergunta natural no stand-up — não depende de FinOps central pra responder.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
