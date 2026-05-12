import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue, AnnotatedFormula } from '@/components/article/primitives';

export const metadata = getModuleMetadata('metricas-cac-ltv');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  { question: 'LTV:CAC ratio saudável para SaaS:', options: ['1:1', '3:1 ou mais — significa que cada R$1 gasto em aquisição retorna R$3 em lifetime value. Abaixo de 3 = unit economics frágil; acima de 5 pode indicar undermarketing (deveria gastar mais)', '10:1', '0.5:1'], correct: 1, explanation: 'Bessemer Venture Partners e a indústria SaaS convergem em LTV:CAC ≥ 3 como saudável. Muito baixo = unit economics ruim; muito alto = deveria investir mais em growth.' },
  { question: 'CAC Payback Period saudável:', options: ['24 meses', '< 12 meses (idealmente 6-12) — tempo para recuperar o CAC via MRR do cliente. Acima de 18-24 = capital intensive, exige funding pesado; SMB target < 12, enterprise < 18', '5 anos', '3 meses sempre'], correct: 1, explanation: 'Payback < 12 meses = self-funded growth viável (você reinveste o cash gerado). > 24 meses geralmente exige VC funding contínuo. Enterprise tolera mais por ARR maior.' },
  { question: 'Rule of 40:', options: ['Idade do CEO', 'Growth rate (%) + EBITDA margin (%) deveria somar ≥ 40 para SaaS público maduro. Permite trade-off: pode crescer 50% com -10% margin, ou crescer 10% com 30% margin', 'Tamanho do time', 'Burn rate'], correct: 1, explanation: 'Rule of 40 (originated em VC analysis) é o "teste" de SaaS sustentável. Pode estar -EBITDA se cresce muito (justifica investment), ou pouco growth com alta margin (cash machine).' },
  { question: 'Magic Number (sales efficiency):', options: ['Não existe', '(ARR added in Q × 4) / Sales+Marketing spend in Q. > 1.0 = saudável, > 1.5 = deveria acelerar gasto, < 0.75 = motor frágil', '5', 'Random'], correct: 1, explanation: 'Magic Number da Scale Venture. Mede "para cada $1 em S&M, quanto de ARR novo geramos?". > 1 = eficiente. Os MELHORES SaaS público fazem 1.5+. Indicador de se pisar fundo ou frear.' },
  { question: 'Net Negative Churn (NNC):', options: ['Impossível', 'Quando expansion revenue (upsell + cross-sell + upgrade) supera o churn — sua base atual CRESCE em receita mesmo sem novos clientes. Holy grail SaaS B2B', 'Apenas em fintech', 'Default para todos'], correct: 1, explanation: 'NNC = churn negativo líquido. Cliente médio gasta MAIS no ano 2 que ano 1. Modelos consumption-based (Snowflake, Datadog) facilitam. Indicador de produto sticky + expansion playbook funcionando.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="metricas-cac-ltv" title="CAC, LTV, payback period: as 5 métricas que importam" icon="📊" xp={60} readTime={12}
      trailName="Solo SaaS / Indie Hacker Stack" trailColor={accent} nextSlug="pricing-pages-conversao" nextTitle="Pricing pages" quiz={quiz}>
      <Section title="As 5 métricas que importam de verdade" accent={accent}>
        <p className="text-sm leading-6">SaaS tem dezenas de métricas. Estas 5 separam o operacional do estratégico: <b>CAC</b>, <b>LTV</b>, <b>Payback Period</b>, <b>Magic Number</b>, <b>Net Revenue Retention</b>. Investidor olha; você precisa entender.</p>
      </Section>
      <Section title="CAC (Customer Acquisition Cost)" accent={accent}>
        <AnnotatedFormula title="CAC Blended" formula="CAC = (S&M_q) / (Customers_added_q)" accent={accent} parts={[
          { text: 'CAC', highlight: true, annotation: 'Custo médio por cliente' },
          { text: '=' },
          { text: '(S&M_q)', annotation: 'Sales + Marketing spend no trimestre' },
          { text: '/' },
          { text: '(Customers_added_q)', annotation: 'Novos clientes no trimestre' },
        ]} />
        <KeyValue accent={accent} items={[
          { k: 'Blended vs Paid CAC', v: 'Blended inclui orgânico. Paid CAC isola channels pagos — melhor para otimização' },
          { k: 'CAC por segmento', v: 'SMB vs Mid-Market vs Enterprise — wildly different' },
          { k: 'Fully-loaded', v: 'Inclui salários de S&M, tools, contratações — não só ads' },
        ]} />
      </Section>
      <Section title="LTV (Lifetime Value)" accent={accent}>
        <AnnotatedFormula title="LTV simplificado" formula="LTV = ARPU × Gross Margin / Churn rate" accent={accent} parts={[
          { text: 'LTV', highlight: true, annotation: 'Valor por cliente ao longo da vida' },
          { text: '=' },
          { text: 'ARPU', annotation: 'Average Revenue Per User mensal' },
          { text: '×' },
          { text: 'Gross Margin', annotation: 'Margem bruta (% após COGS)' },
          { text: '/' },
          { text: 'Churn rate', annotation: 'Taxa mensal de cancelamento' },
        ]} />
        <Callout tone="info">Exemplo: ARPU R$100/mês, GM 80%, churn 2%/mês. LTV = 100 × 0.8 / 0.02 = R$4.000.</Callout>
      </Section>
      <Section title="As 5 em produção — alvos por estágio" accent={accent}>
        <ComparisonTable accent={accent} headers={['Métrica', 'Early ($0-1M ARR)', 'Growth ($1-10M)', 'Scale ($10M+)']} rows={[
          ['LTV:CAC', '≥ 3', '≥ 3 + improving', '≥ 3 sustentável'],
          ['CAC Payback', '< 18m', '< 12m', '< 12m'],
          ['Gross Margin', '> 70%', '> 75%', '> 80%'],
          ['Net Revenue Retention', '> 100%', '> 110%', '> 120% (best-in-class)'],
          ['Rule of 40', 'Pode ser negativo', '> 20', '> 40'],
          ['Magic Number', '> 0.75', '> 1.0', '> 1.0'],
        ]} />
      </Section>
      <Section title="Pitfalls comuns" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'LTV com churn anual em modelo mensal', v: 'Confunde unit. Calcule consistente' },
          { k: 'Esquecer gross margin', v: 'LTV sem GM é receita, não valor. Sempre desconte COGS' },
          { k: 'CAC excluindo salários', v: 'Cost of S&M FTE é S&M. Fully-loaded.' },
          { k: 'Cohort vs blended', v: 'Métricas blended escondem deterioração. Olhe por cohort' },
          { k: 'Vanity metrics', v: 'Tráfego do site, downloads, MAU se não converte = ruído' },
        ]} />
      </Section>
    </ModuleLayout>
  );
}
