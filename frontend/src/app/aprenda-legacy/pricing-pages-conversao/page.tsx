import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, KeyValue } from '@/components/article/primitives';

export const metadata = getModuleMetadata('pricing-pages-conversao');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  { question: 'Por que a maioria das pricing pages tem 3 tiers?', options: ['Tradição', 'Anchoring + decoy effect — middle tier "destacado" vira default psicológico; tier alto faz middle parecer barato; tier baixo justifica existência do middle. 3 é o sweet spot cognitivo', '3 é mágico', 'Limite técnico'], correct: 1, explanation: '3-tier é o padrão por boas razões: simples de comparar, decoy effect funciona, middle tier vira "escolha óbvia" para a maioria. 2 = falta opção; 4+ = paralisia de escolha (Hick\'s law).' },
  { question: 'Value metric correto:', options: ['Sempre seats', 'Métrica que escala com o valor entregue ao cliente. SaaS B2B: seats (Slack, Notion), API calls (Stripe, OpenAI), data volume (Datadog, Snowflake), MAU (analytics). Errado: cobra mais sem dar mais valor', 'Tempo de uso', 'Random'], correct: 1, explanation: 'Value metric alinha cobrança com valor entregue. Slack cobra por user ativo — quando empresa cresce em uso, paga mais. Datadog por host monitorado — escala com infra do cliente. Genial: cliente cresce → você cresce.' },
  { question: 'Monthly vs Annual toggle padrão:', options: ['Só monthly', 'Annual default destacado, com desconto típico de 15-20%; toggle para mostrar mensal. Annual reduz churn (compromisso), melhora cash flow, justifica desconto. Default monthly = perde rev e cash', 'Só annual', 'Não importa'], correct: 1, explanation: 'Annual billing é o "easy win" de SaaS. Reduz churn 30-50% (commitment effect), traz cash upfront. Desconto 15-20% compensa. Linear/Notion/Vercel — todos default annual com toggle visível.' },
  { question: 'Por que esconder enterprise pricing ("Contact Us"):', options: ['Preguiça', 'Permite price discrimination — empresa com 5000 funcionários paga muito mais que startup. Negotiation custom captura willingness-to-pay. Trade-off: friction adicional + perceived opacity', 'Random', 'Apenas legal'], correct: 1, explanation: 'Enterprise sales é negociado. Mostrar preço fixo cap o que você pode cobrar. "Contact Us" sinaliza "preço discutível" e permite captura de WTP. Friction é design intencional — só players sérios marcam reunião.' },
  { question: 'Free tier — quando faz sentido?', options: ['Sempre', 'Quando: produto tem network effect (Notion, Figma — colaborador free trai upgrade do colega), virality natural (Slack — convidado free), low marginal cost (SaaS digital), upsell óbvio. Não faz sentido em B2B com sales motion enterprise', 'Nunca', 'Em fintech'], correct: 1, explanation: 'Free tier brilha em produtos com network effect ou virality embutida. Notion/Figma — free gera demand para a equipe inteira. Stripe/Twilio — pay-as-you-go com primeiro X grátis. Enterprise SaaS sem virality = free só queima.' },
];

export default function Page() {
  return (
    <ModuleLayout slug="pricing-pages-conversao" title="Pricing pages: psicologia, anchoring, value metric" icon="💰" xp={55} readTime={11}
      trailName="Solo SaaS / Indie Hacker Stack" trailColor={accent} nextSlug="customer-io-loops-resend" nextTitle="Email engineering" quiz={quiz}>
      <Section title="A página mais importante" accent={accent}>
        <p className="text-sm leading-6">Pricing page tem mais conversion leverage que homepage. Visitante chega → pricing → decide. Cada elemento (tier count, ordering, anchoring, value metric, toggle) move conversão mensurável. Os melhores SaaS fazem A/B test contínuo aqui.</p>
      </Section>
      <Section title="O padrão 3-tier reverse-engineered" accent={accent}>
        <ComparisonTable accent={accent} headers={['Tier', 'Função estratégica', 'Visual']} rows={[
          ['Tier 1 (Free/Starter)', 'Lower bound, gera leads, ancora "barato"', 'Subtle, sem CTA agressivo'],
          ['Tier 2 (Pro/Team)', 'O default que QUEREM que escolha — maior margem', 'Destacado: borda, "MAIS POPULAR", cor primária'],
          ['Tier 3 (Enterprise)', 'Anchor superior; faz Pro parecer barato', '"Contact Us" — preço escondido, captura WTP'],
        ]} />
      </Section>
      <Section title="Value metric — exemplos reais" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Slack', v: 'Active users por mês (não seats provisionados — pague pelo uso real)' },
          { k: 'Notion', v: 'Seats com cobrança per-user' },
          { k: 'Stripe', v: '% transacionado + por API call (Stripe Connect)' },
          { k: 'Datadog', v: 'Host monitorado + log volume + APM spans' },
          { k: 'OpenAI / Anthropic', v: 'Tokens (input/output separados)' },
          { k: 'Linear', v: 'Members por workspace' },
          { k: 'Vercel', v: 'Mistura: seats + bandwidth + function invocations' },
        ]} />
      </Section>
      <Section title="Anchoring + decoy effect" accent={accent}>
        <p className="text-sm leading-6">Behavioral economics aplicado: tier alto faz tier médio parecer "razoável". Tier baixo "tira o medo" mas é projetado para incentivar upgrade rápido (limites baixos). O middle vira default psicológico — taxa de escolha em 3-tier típico: ~20% free, ~60% middle, ~20% enterprise.</p>
      </Section>
      <Section title="Elementos críticos da página" accent={accent}>
        <KeyValue accent={accent} items={[
          { k: 'Annual/Monthly toggle', v: 'Annual default com badge "save 20%"' },
          { k: 'Currency localization', v: 'Mostrar R$ para BR (cobrança real ainda em USD se LLC)' },
          { k: 'Feature comparison table', v: 'Abaixo dos tiers — features por tier, "Sim" claro' },
          { k: 'Logos sociais', v: 'Logos de clientes/empresas usando — reduz risco percebido' },
          { k: 'FAQ', v: 'Endereça objeções comuns (cancel anytime, billing change, refund)' },
          { k: 'CTA principal', v: '"Start Free Trial" > "Buy Now" para SaaS (reduz friction)' },
          { k: 'Sem fricção em trial', v: 'Sem cartão para trial pequeno; cartão para trial enterprise' },
        ]} />
      </Section>
      <Section title="Casos reverse-engineered" accent={accent}>
        <ComparisonTable accent={accent} headers={['Empresa', 'Estratégia notável']} rows={[
          ['Linear', '3 tiers limpos, annual default, free generous, business com CTA "Contact"'],
          ['Notion', 'Free com 1 workspace pessoal; team paid; Enterprise contact'],
          ['Vercel', 'Free hobby; Pro (per seat); Enterprise (negotiated). Métricas usage transparent'],
          ['Stripe', 'Pay-as-you-go, sem free tier — preço público (2.9% + R$0.30)'],
          ['Cursor', '$20 individual; $40 business; Enterprise contact. Limites de "fast requests"'],
          ['Anthropic API', 'Per-token pricing, com prompt caching descontos transparentes'],
        ]} />
      </Section>
      <Callout tone="warn">A/B test pricing page é deliciosamente eficaz e perigosamente impactante. Sempre meça conversão E ARPU pós-mudança — você pode aumentar conversão e baixar ARPU médio (move pra tier mais barato), o que é regressão.</Callout>
    </ModuleLayout>
  );
}
