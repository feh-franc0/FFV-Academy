import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('unit-economics-em-software');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que engenharia precisa entender CAC e LTV?',
    options: [
      'Não precisa',
      'Decisões arquiteturais impactam gross margin e scaling economics diretamente. Escolher Lambda vs ECS, região cara vs barata, caching agressivo vs origin hits — cada decisão muda cost per request e consequentemente margem por cliente. Eng sênior discute arquitetura em termos de impacto econômico',
      'É coisa de CFO',
      'Só marketing',
    ],
    correct: 1,
    explanation: 'CAC/LTV/gross margin são linguagem de negócio e eng sênior precisa falar. "Reduzi cold start Lambda em 300ms" vale pouco. "Reduzi cost per active user em $0.08/mês, melhorando gross margin em 3pp" vale promoção. Conectar decisão técnica a unit economics é o que separa staff engineer de senior.',
  },
  {
    question: 'Cost per request: como calcular e usar?',
    options: [
      'Não dá',
      'Soma todos os custos do serviço (compute + DB + egress + observability) por mês, divide pelo total de requests. Permite: comparar iterações (v2 cost/req vs v1), comparar serviços entre si, projetar custo de escala (1M requests → X dólares), detectar regressão de eficiência',
      'Só infra',
      'Só marketing',
    ],
    correct: 1,
    explanation: 'Cost per request vira KPI acionável. Exemplo: serviço search custa $12k/mês, faz 60M requests → $0.0002/request. Time propõe reranker LLM → +$0.00015/request (75% mais caro). Vale? Depende: se aumenta conversão 10% e cada conversion vale $5, sim. Sem esse math, é chute — unit economics força discipline.',
  },
  {
    question: 'Gross margin de SaaS: faixa saudável?',
    options: [
      '10%',
      '70-85% é saudável pra SaaS B2B típico. Abaixo de 60% sinaliza ou problema (overprovision, arquitetura ineficiente) ou produto intensivo em compute (ML inference) — nesse caso foca em reduzir COGS via rightsizing, commitments, architecture optimization',
      '95%',
      '20%',
    ],
    correct: 1,
    explanation: 'SaaS B2B clássico tem gross margin 75-85% (Snowflake 65%, Datadog 80%, Salesforce 78%). SaaS com ML heavy (Runway, Jasper) pode ficar em 50-65% — acceptable mas pressiona unit economics. Se margem é &lt; 50%, tem problema sério: ou cloud cost muito alto, ou arquitetura ineficiente, ou preço muito baixo. FinOps ataca COGS.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="unit-economics-em-software"
      title="Unit economics em software: CAC, LTV, cost per request"
      icon="📊"
      xp={45}
      readTime={11}
      trailName="FinOps & Cost Engineering"
      trailColor={accent}
      nextSlug="cost-anomaly-detection"
      nextTitle="Cost anomaly detection: quando alertar"
      quiz={quiz}
    >
      <Section title="Vocabulário essencial" accent={accent}>
        <CodeBlock lang="yaml">{`CAC (Customer Acquisition Cost):
  Quanto custa adquirir 1 cliente
  = (marketing + vendas) / novos clientes
  Saúde B2B SaaS: CAC payback < 12 meses

LTV (Lifetime Value):
  Receita total esperada de 1 cliente até churn
  = ARPU × gross_margin / churn_rate
  Regra: LTV/CAC >= 3x para negócio saudável

ARPU (Average Revenue Per User):
  Receita mensal / usuários ativos

COGS (Cost of Goods Sold):
  Infra cloud, licenças, 3rd-party APIs, support básico
  Tudo que escala com volume de uso

Gross Margin:
  (Revenue - COGS) / Revenue
  Saudável SaaS: 70-85%

Cost per request (ou per user, per tenant):
  Soma COGS do serviço / volume processado
  KPI que engenharia controla diretamente

Burn rate / runway:
  Cash queimado/mês vs disponível
  Influencia apetite de risco arquitetural`}</CodeBlock>
      </Section>

      <Section title="Engenharia impacta economics em 3 lugares" accent={accent}>
        <p>
          <strong>1. COGS direto:</strong> escolha de compute, região, storage tier, observability custo. Um refactor de Lambda overprovisioned pra rightsized pode cortar 40% dos custos do serviço.
        </p>
        <p>
          <strong>2. Escala não-linear:</strong> cache hit rate, database índice, algoritmo O(n log n) vs O(n²). Sem hit cache, serviço vira ruim ao 10x o tráfego. Com cache, custo cresce sublinear.
        </p>
        <p>
          <strong>3. Time-to-market:</strong> velocidade de feature impacta revenue. Trade-off real: investir em plataforma hoje (reduz COGS no futuro) vs ship feature (reduz CAC via conversão).
        </p>
        <CodeBlock lang="python">{`# Simulador simples: impacto de reranker no gross margin
baseline_cogs_per_req = 0.0002   # $ por request
reranker_extra        = 0.00015  # +75%
conversion_baseline   = 0.03     # 3%
conversion_with_rank  = 0.034    # 3.4% (estimated)
arpu                  = 50        # $ / conv

baseline_margin = (arpu * conversion_baseline) - baseline_cogs_per_req
new_cost         = baseline_cogs_per_req + reranker_extra
new_margin       = (arpu * conversion_with_rank) - new_cost

print('baseline margin per req:', baseline_margin)
print('new margin per req:',      new_margin)
print('delta per req:',            new_margin - baseline_margin)
# Se delta > 0, reranker vale. Senão, não.`}</CodeBlock>
      </Section>

      <Section title="Dashboards de unit economics" accent={accent}>
        <p>
          Dashboard padrão FinOps-Eng inclui: cost per active user (tendência), cost per request por serviço (identificar outliers), gross margin por linha de produto, top 10 consumidores internos de custo, efficiency metric (requests/dollar) trend. Atualização diária; review mensal com time.
        </p>
        <Callout tone="success" icon="✅">
          Engenheiro sênior em 2026 discute PR em termos de impacto em unit economics, não só em latência/throughput. "Essa otimização reduz cost per request em 20%, liberando $40k/ano pra investir em X" é frase que move executivos.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
