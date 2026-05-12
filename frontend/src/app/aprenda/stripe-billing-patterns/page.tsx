import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  ArchFlow,
  StackFlow,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('stripe-billing-patterns');

const accent = '#635bff'; // Stripe brand purple

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre `licensed` e `metered` pricing no Stripe Billing?',
    options: [
      'licensed cobra mensalmente, metered cobra anualmente',
      'licensed cobra um valor fixo pela `quantity` definida na subscription (seats, plans), avaliado no início do ciclo. metered cobra com base em `UsageRecord` reportados durante o ciclo — Stripe agrega (sum, last_during_period, max) e fatura no fim. Você muda `quantity` direto no licensed; no metered, você só envia `usage_records` (POST /subscription_items/{si}/usage_records).',
      'licensed é só para SaaS B2B, metered é só para B2C',
      'metered é deprecated desde 2024 — Stripe recomenda apenas licensed',
    ],
    correct: 1,
    explanation: 'Na API do Stripe, `recurring.usage_type` no Price define o modelo: "licensed" (default, quantity-based) ou "metered" (usage-based). Para metered, você usa `aggregate_usage` (sum, last_during_period, last_ever, max) para definir como Stripe agrega os UsageRecords antes de gerar o invoice. Importante: você não pode atualizar `quantity` em um item metered — só reportar uso. Stripe Docs: docs.stripe.com/products-prices/pricing-models.',
  },
  {
    question: 'O que `proration_behavior` controla ao fazer upgrade/downgrade de uma subscription no meio do ciclo?',
    options: [
      'controla apenas se o invoice será enviado por email',
      'controla como Stripe ajusta o invoice quando você muda o plano no meio do ciclo. `create_prorations` (default) cria invoice items de débito (novo plano) e crédito (plano antigo) proporcionais ao tempo restante. `none` ignora — usuário paga o novo plano só no próximo ciclo. `always_invoice` cria as prorations E gera invoice imediato (cobra hoje a diferença). Crítico para upgrades: `always_invoice` cobra na hora; `create_prorations` adia para próximo ciclo.',
      'é um flag interno do Stripe e não tem efeito no comportamento de cobrança',
      'controla apenas a moeda usada na fatura (BRL vs USD)',
    ],
    correct: 1,
    explanation: 'Na prática SaaS: para upgrades (mais caro), use `always_invoice` ou `create_prorations` + invoice manual. Para downgrades, geralmente `none` ou `create_prorations` (cliente fica com crédito para próximo ciclo, evita reembolso). Stripe calcula proration usando `period_start` e `period_end` do subscription item. Ver: docs.stripe.com/billing/subscriptions/prorations.',
  },
  {
    question: 'O que é Smart Retries no Stripe e por que é melhor que retries manuais?',
    options: [
      'É um sistema de cache que evita cobrar duas vezes o mesmo cartão',
      'Smart Retries usa ML treinado em bilhões de transações Stripe para decidir QUANDO retry um pagamento que falhou (insufficient_funds, do_not_honor). Em vez de retry fixo a cada 3 dias, escolhe horário do dia + dia da semana com maior probabilidade de sucesso para aquele BIN/issuer. Recupera 38%+ de payments que iriam churnar (vs ~15-20% de retries manuais). Configurável em Dashboard > Settings > Subscriptions > Manage failed payments.',
      'É um produto separado que custa 1% extra por transação',
      'Smart Retries só funciona para cartões americanos',
    ],
    correct: 1,
    explanation: 'Cards declinam por motivos sazonais (saldo, limite renovado, fim de mês, fraude flag). Smart Retries cruza issuer + BIN + timing histórico + score de risco. Combinado com Card Account Updater (Stripe atualiza número de cartão expirado automaticamente via Visa/MC), reduz involuntary churn drasticamente. Para SaaS, involuntary churn é 20-40% do churn total — Smart Retries ataca isso.',
  },
  {
    question: 'Por que o Stripe Customer Portal é a forma recomendada de o cliente gerenciar a subscription?',
    options: [
      'Porque tem um design bonito que os usuários gostam',
      'Porque você não precisa construir UI nem gerenciar PCI compliance para upgrade/downgrade/cancel/update card. Stripe hospeda o portal (sessions via /v1/billing_portal/sessions), você configura quais ações o cliente pode fazer (Dashboard > Settings > Customer portal): trocar plano, cancelar, baixar invoice, atualizar payment method, atualizar billing info. Stripe garante PCI compliance, atualiza dados via webhook (customer.subscription.updated). Você só precisa redirecionar para a URL retornada.',
      'Porque é gratuito enquanto a API regular tem cobrança extra',
      'Porque é o único jeito de aceitar Pix no Brasil',
    ],
    correct: 1,
    explanation: 'Custom portal seria meses de trabalho + PCI DSS audit. Stripe Customer Portal: 5 linhas de código, criar session, redirecionar. Configurável: products (quais planos cliente pode mudar), features (cancel, pause, update card, invoice history). Funciona com webhooks — você escuta customer.subscription.updated, customer.subscription.deleted, invoice.paid e sincroniza seu banco. Docs: docs.stripe.com/customer-management.',
  },
  {
    question: 'O que é Stripe Tax e quando vale ativar para um SaaS solo brasileiro vendendo internacional?',
    options: [
      'Stripe Tax é só para empresas físicas — SaaS não precisa',
      'Stripe Tax calcula automaticamente sales tax / VAT / GST baseado na localização do customer (IP, billing address, payment method country) e adiciona ao invoice. Para SaaS digital com clientes na UE (VAT), UK (VAT), Austrália (GST), EUA (sales tax por estado), você é OBRIGADO a coletar e remeter. Stripe Tax adiciona 0.5% por transação mas: calcula taxas, gera relatórios para filing, monitora nexus thresholds (quando você passa do limite e precisa se registrar no estado/país). Para solo founder, vale 100% — alternativa é contratar firma de tax compliance que custa $$$.',
      'Stripe Tax só funciona se você tiver LLC americana',
      'Stripe Tax é deprecated em 2026, foi substituído por TaxJar',
    ],
    correct: 1,
    explanation: 'Sem Stripe Tax, você arrisca: (1) não cobrar VAT de cliente UE e pagar do próprio bolso depois; (2) ultrapassar nexus em Texas/Califórnia e tomar multa retroativa; (3) compliance manual com 50+ jurisdições. Com Stripe Tax: ativo em Dashboard, define tax codes nos products (ex: "txcd_10000000" para SaaS), Stripe coleta + reporta. Filing ainda é seu (ou via Stripe Tax Filing em US). Para BR vendendo gringa, geralmente NÃO precisa coletar VAT no início — Stripe Tax avisa quando passar threshold (€10k UE/ano, US$100k Califórnia, etc.).',
  },
  {
    question: 'Qual webhook do Stripe é o "source of truth" para você saber se uma subscription está ativa, e por que confiar nele em vez de `subscription.status`?',
    options: [
      'customer.created — basta saber que o customer existe',
      'invoice.paid + customer.subscription.updated são os críticos. `invoice.paid` confirma que o pagamento entrou (não basta status=active — pode estar em `trialing`, `past_due`, `incomplete`). `customer.subscription.updated` te avisa de mudança de plano, cancelamento agendado (cancel_at_period_end), atualização de quantity. Você processa o webhook, atualiza seu DB (status, current_period_end, plan_id) e libera/bloqueia features baseado nisso. Nunca consulte a API Stripe a cada request — cache no seu DB e atualize via webhook.',
      'charge.succeeded — chega antes do invoice.paid',
      'Não precisa de webhook — basta polling a cada 1 hora',
    ],
    correct: 1,
    explanation: 'Padrão: tabela `subscriptions` no seu Postgres com colunas: stripe_subscription_id, status, current_period_end, cancel_at_period_end, plan_id. Webhook handler atualiza essas colunas. Middleware checa `current_period_end > now() AND status IN (active, trialing)` para liberar features. Polling = race conditions, latência, rate limits. Use idempotency: cada webhook tem `event.id` único — guarde em tabela `webhook_events` e ignore duplicatas. Stripe re-envia webhooks que falharam por até 3 dias.',
  },
];

export default function StripeBillingPatternsPage() {
  return (
    <ModuleLayout
      slug="stripe-billing-patterns"
      title="Stripe billing: subscriptions, usage, metered, prorations"
      icon="💳"
      xp={70}
      readTime={14}
      trailName="Solo SaaS / Indie Hacker Stack 2026"
      trailColor={accent}
      nextSlug="multi-tenancy-saas"
      nextTitle="Multi-tenancy SaaS: pool vs silo vs hybrid"
      quiz={quiz}
    >
      <Section title="O Stripe Billing não é só checkout" accent={accent}>
        <p>
          Quase todo solo SaaS começa achando que &quot;Stripe é só checkout&quot; — uma sessão de Checkout,
          um webhook, fim. Em 6 meses, você descobre que o problema real não é cobrar — é{' '}
          <strong>cobrar de novo</strong>: lidar com upgrade, downgrade, trial, pausa, prorations,
          dunning (recuperação de payment falho), customer portal, taxas internacionais. O <em>billing</em>{' '}
          é onde escalam ou morrem os SaaS — e onde Stripe é, em 2026, basicamente a única escolha
          adulta.
        </p>
        <p>
          Este módulo cobre a Stripe Billing API a sério: os modelos (licensed vs metered), prorations,
          Smart Retries, Customer Portal e Stripe Tax. A documentação oficial está em{' '}
          <InlineCode>docs.stripe.com/billing</InlineCode>.
        </p>
        <Callout tone="info" icon="💡">
          <strong>Princípio fundador:</strong> o Stripe Dashboard é o seu painel de billing. Seu banco
          guarda apenas <em>cache</em> da realidade no Stripe, sincronizado via webhooks. Nunca dispute
          o source of truth.
        </Callout>
      </Section>

      <Section title="Modelos de cobrança: licensed vs metered vs híbrido" accent={accent}>
        <p>
          Antes de qualquer linha de código, escolha o modelo. No Stripe, isso é o campo{' '}
          <InlineCode>recurring.usage_type</InlineCode> do <InlineCode>Price</InlineCode>:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['', 'Licensed (per-seat)', 'Metered (usage-based)', 'Híbrido']}
          rows={[
            ['Como cobra', 'price × quantity, no início do ciclo', 'price × Σ usage_records, no fim', 'Base licensed + overage metered'],
            ['Exemplo', 'Linear: $8/user/mês', 'OpenAI: $0.002 / 1k tokens', 'Vercel: $20 base + bandwidth overage'],
            ['API field', 'usage_type: "licensed"', 'usage_type: "metered"', '2 prices na mesma subscription'],
            ['Quantity', 'Você define via API', 'Stripe agrega usage_records', 'Combinado'],
            ['Quando usar', 'Seats, plans fixos', 'API calls, GB, MAU', 'Plano + variável (Notion AI)'],
          ]}
        />
        <Callout tone="warn" icon="⚠️">
          Não dá para misturar <InlineCode>usage_type</InlineCode> no mesmo SubscriptionItem. Para
          híbrido, você cria <strong>dois Prices</strong> na mesma <InlineCode>Subscription</InlineCode>:
          um licensed (a base) e um metered (o overage). Cada um é um SubscriptionItem separado.
        </Callout>
      </Section>

      <Section title="Anatomia da Stripe Billing API" accent={accent}>
        <ArchFlow
          accent={accent}
          title="Hierarquia de objetos Stripe Billing"
          columns={[
            {
              title: 'Catálogo',
              items: [
                'Product — O que você vende ("Pro Plan")',
                'Price — Quanto custa ("$20/mo BRL")',
              ],
            },
            {
              title: 'Cliente',
              items: [
                'Customer — Pessoa/empresa que paga',
                'PaymentMethod — Cartão, Pix, boleto vinculado',
              ],
            },
            {
              title: 'Cobrança',
              items: [
                'Subscription — Liga Customer ↔ Price',
                'SubscriptionItem — Cada Price na sub (multi-item)',
                'Invoice — Fatura gerada por ciclo',
                'PaymentIntent — Tentativa de cobrança',
              ],
            },
          ]}
        />
        <p>
          Em código, criar uma subscription é literalmente isso:
        </p>
        <CodeBlock lang="ts">{`// Backend Node.js + stripe-node
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// 1. Cria customer (uma vez por user no seu DB)
const customer = await stripe.customers.create({
  email: user.email,
  metadata: { user_id: user.id }, // sempre coloque seu ID interno aqui
});

// 2. Cria subscription com 1 price (licensed) + 1 metered (overage)
const sub = await stripe.subscriptions.create({
  customer: customer.id,
  items: [
    { price: 'price_base_pro_mo' },          // licensed, qty=1
    { price: 'price_overage_per_seat' },     // metered
  ],
  payment_behavior: 'default_incomplete',     // só ativa após pagamento
  expand: ['latest_invoice.payment_intent'],  // para retornar client_secret
  trial_period_days: 14,
});

// 3. Front-end completa o PaymentIntent via stripe.js (3DS, SCA)
return { clientSecret: sub.latest_invoice.payment_intent.client_secret };`}</CodeBlock>
        <Callout tone="success" icon="✅">
          <strong>Por que <InlineCode>default_incomplete</InlineCode>:</strong> a subscription só vira
          <InlineCode>active</InlineCode> após o pagamento confirmar (incluindo 3DS / SCA na UE).
          Antes disso fica <InlineCode>incomplete</InlineCode>. Evita o bug clássico de &quot;assinatura
          criada mas nunca foi paga&quot;.
        </Callout>
      </Section>

      <Section title="Trial logic: o que ninguém te conta" accent={accent}>
        <p>
          Trial parece simples (<InlineCode>trial_period_days: 14</InlineCode>) mas tem 5 decisões
          importantes:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Trial sem cartão (no-CC)', v: 'Maior conversão de signup, MENOR conversão de paid (~3-5%). Bom para top-of-funnel B2C, ruim para B2B sério.' },
            { k: 'Trial com cartão (CC)', v: 'Menor signup, MAIOR conversão de paid (15-30%). Padrão em B2B SaaS desde 2018.' },
            { k: 'Trial reverso', v: 'Cobra primeiro, libera reembolso em N dias. Aumenta percepção de valor — Linear faz isso parcialmente.' },
            { k: 'Trial extension', v: 'Cliente pediu mais tempo? subscription.update com trial_end=ts. Use com parcimônia.' },
            { k: 'Webhook trial_will_end', v: 'Stripe dispara 3 dias antes — momento de mandar email "seu trial acaba em 3 dias".' },
          ]}
        />
        <CodeBlock lang="ts">{`// Estender trial em 7 dias quando cliente pedir
await stripe.subscriptions.update(sub.id, {
  trial_end: Math.floor(Date.now() / 1000) + 7 * 86400,
  proration_behavior: 'none', // não cobre nada extra
});

// Webhook: cliente prestes a ser cobrado
// event.type === 'customer.subscription.trial_will_end'
// → enviar email "trial acaba em 3 dias, garanta seu acesso"`}</CodeBlock>
      </Section>

      <Section title="Metered billing: usage records na prática" accent={accent}>
        <p>
          Metered billing é onde 80% dos solo SaaS erram. O fluxo correto:
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Fluxo de metered billing"
          steps={[
            { label: '1. Customer dispara evento', desc: 'API call, MB transferido, AI token consumido' },
            { label: '2. Backend chama Stripe', desc: 'POST /subscription_items/{si}/usage_records { quantity: 1, timestamp: now, action: "increment" }' },
            { label: '3. Stripe agrega', desc: 'Soma todos usage_records do ciclo, baseado em aggregate_usage do price' },
            { label: '4. Invoice no fim do ciclo', desc: 'Stripe fecha o invoice com price × usage_total' },
            { label: '5. Webhook invoice.paid', desc: 'Você libera o próximo ciclo, zera contador local' },
          ]}
        />
        <CodeBlock lang="ts">{`// Cliente fez 1 inferência LLM — você reporta 1 unit (= 1k tokens)
await stripe.subscriptionItems.createUsageRecord(
  subscriptionItemId,
  {
    quantity: 1,
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment', // 'increment' soma; 'set' substitui o valor do timestamp
  },
);

// IMPORTANTE: rate limit Stripe é ~25 req/s por account.
// Se seu evento é alto-volume (>100/s), agregue localmente
// (Redis INCR por subscription_item + flush a cada 1min com batch).`}</CodeBlock>
        <Callout tone="warn" icon="🚨">
          <strong>Gotcha:</strong> usage_records com <InlineCode>timestamp</InlineCode> fora do ciclo
          atual são rejeitados. Se seu sistema atrasa o report (queue), o usage pode cair no próximo
          invoice. Solução: sempre usar timestamp da hora do evento, não do report; deixar buffer de
          1h antes do fim do ciclo.
        </Callout>
      </Section>

      <Section title="Prorations: o pesadelo dos upgrades" accent={accent}>
        <p>
          Cliente está no Pro ($20/mo), no dia 15 do ciclo pede upgrade para Business ($50/mo). O que
          fazer? Stripe oferece 3 comportamentos via <InlineCode>proration_behavior</InlineCode>:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Valor', 'O que acontece', 'Quando usar']}
          rows={[
            [
              'create_prorations (default)',
              'Stripe cria invoice_items: crédito de -$10 (15 dias restantes do Pro) e débito de +$25 (15 dias de Business). Saldo: +$15 cobrado no PRÓXIMO invoice.',
              'Você quer evitar invoice imediato — diferimento natural.',
            ],
            [
              'always_invoice',
              'Cria prorations E gera invoice imediato cobrando os $15 hoje. Cliente paga no ato.',
              'Upgrades onde você quer cash flow imediato e o cliente espera ser cobrado.',
            ],
            [
              'none',
              'Não calcula nada. Cliente paga o novo valor no próximo ciclo.',
              'Downgrades — evita refund/credit complicado, plano antigo dura até o fim.',
            ],
          ]}
        />
        <CodeBlock lang="ts">{`// Upgrade Pro → Business, cobra a diferença HOJE
await stripe.subscriptions.update(sub.id, {
  items: [{ id: itemId, price: 'price_business_mo' }],
  proration_behavior: 'always_invoice',
  proration_date: Math.floor(Date.now() / 1000),
});

// Downgrade Business → Pro: aguarda fim do ciclo (cliente já pagou)
await stripe.subscriptions.update(sub.id, {
  items: [{ id: itemId, price: 'price_pro_mo' }],
  proration_behavior: 'none',
});`}</CodeBlock>
        <DecisionBox
          scenario="Cliente pede upgrade no meio do mês — qual proration_behavior usar?"
          winner="always_invoice"
          winnerColor={accent}
          why="Upgrade = cliente quer acesso AGORA. always_invoice cobra a diferença na hora (R$25), libera Business imediatamente, cliente vê valor cobrado. create_prorations adiaria para o próximo mês e geraria invoice maior — confunde."
          alternatives={[
            { name: 'create_prorations' }, { name: 'OK se cliente já tem boa relação e você prefere uniformidade. Risco: surpresa no próximo invoice.' }, { name: 'none' }, { name: 'Quase nunca em upgrade — cliente pagaria preço antigo até fim do ciclo, sem incentivo a upgradar cedo.' }
          ]}
        />
      </Section>

      <Section title="Failed payments e Smart Retries" accent={accent}>
        <p>
          <strong>Involuntary churn</strong> (cartão expirou, recusado, sem saldo) é 20-40% do churn
          total de SaaS. Smart Retries + Card Account Updater do Stripe atacam isso sem você fazer
          nada além de ativar.
        </p>
        <Timeline
          accent={accent}
          title="Vida útil de um payment falho"
          events={[
            { when: 'D+0', label: 'invoice.payment_failed', detail: 'Stripe tenta primeira cobrança. Cartão recusa (insufficient_funds). Webhook dispara — você pode mandar email "payment falhou, atualize cartão".' },
            { when: 'D+0 a D+7', label: 'Smart Retries', detail: 'Stripe usa ML pra escolher horários ideais. Geralmente 4 retries em janela de 1-2 semanas (configurável em Dashboard).' },
            { when: 'D+3', label: 'Card Account Updater', detail: 'Stripe consulta Visa/MC: se o número mudou (renovação anual), atualiza automaticamente. Cliente nem percebe.' },
            { when: 'D+14', label: 'subscription.status = past_due', detail: 'Stripe atualiza status. Você decide: degrada features ou ainda confia (dunning grace period).' },
            { when: 'D+21', label: 'subscription.status = canceled', detail: 'Stripe desiste. Webhook customer.subscription.deleted dispara. Você corta acesso.' },
          ]}
        />
        <Callout tone="info" icon="📊">
          Stripe publicou em 2024 que Smart Retries + Card Updater recuperam ~38% dos payments
          falhos. Para um SaaS com $50k MRR e 5% involuntary churn ($2.5k/mo), isso recupera ~$950/mo
          de pure profit, automaticamente. Liga essa porra.
        </Callout>
      </Section>

      <Section title="Customer Portal: NÃO construa o seu" accent={accent}>
        <p>
          A pior decisão de um solo founder é construir UI de billing customizada. PCI compliance,
          cancel flows, edge cases (downgrade com prorations, pause, refund) — meses de trabalho. O
          Stripe Customer Portal resolve 99% dos casos em 5 linhas:
        </p>
        <CodeBlock lang="ts">{`// /api/billing/portal — backend route
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  const { customerId } = await req.json();
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: 'https://app.seusaas.com/settings',
  });
  return Response.json({ url: session.url });
}

// Frontend: botão "Gerenciar assinatura"
async function openPortal() {
  const { url } = await fetch('/api/billing/portal', {
    method: 'POST',
    body: JSON.stringify({ customerId: user.stripeCustomerId }),
  }).then(r => r.json());
  window.location.href = url;
}`}</CodeBlock>
        <KeyValue
          accent={accent}
          items={[
            { k: 'O que o cliente pode fazer', v: 'Trocar plano (subset que você define), cancelar (immediate ou end-of-period), atualizar cartão, baixar invoices, mudar billing address, ativar/desativar produtos.' },
            { k: 'Branding', v: 'Logo + cores no Dashboard > Settings > Customer portal. Não é o seu domínio — é billing.stripe.com.' },
            { k: 'Sync com seu DB', v: 'Cliente cancela no portal → webhook customer.subscription.updated dispara → você atualiza status no Postgres.' },
            { k: 'i18n', v: 'Portal aparece automaticamente no idioma do browser do cliente (pt-BR incluso).' },
          ]}
        />
      </Section>

      <Section title="Webhooks: o coração de tudo" accent={accent}>
        <p>
          Sem webhooks, seu app está sempre desatualizado em relação ao Stripe. Os eventos críticos
          para um SaaS solo:
        </p>
        <ComparisonTable
          accent={accent}
          headers={['Evento', 'Quando dispara', 'O que fazer']}
          rows={[
            ['checkout.session.completed', 'Cliente terminou Checkout', 'Criar/atualizar user, marcar trial_active'],
            ['customer.subscription.created', 'Subscription nova', 'Salvar stripe_subscription_id no user'],
            ['customer.subscription.updated', 'Mudança (plan, status, cancel_at_period_end)', 'Sincronizar plan_id, status, period_end no DB'],
            ['customer.subscription.deleted', 'Cancelado de fato', 'Marcar status=canceled, cortar acesso'],
            ['invoice.paid', 'Pagamento entrou', 'Liberar acesso para próximo ciclo, zerar contador metered local'],
            ['invoice.payment_failed', 'Pagamento falhou', 'Email "atualize cartão" + grace period'],
            ['customer.subscription.trial_will_end', '3 dias antes do trial acabar', 'Email "trial acaba em 3 dias"'],
          ]}
        />
        <CodeBlock lang="ts">{`// app/api/webhooks/stripe/route.ts (Next.js)
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const body = await req.text();
  const sig = (await headers()).get('stripe-signature')!;
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body, sig, process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (err) {
    return new Response('Bad signature', { status: 400 });
  }

  // Idempotência: garante que mesmo evento não processa 2x
  const seen = await db.webhookEvents.upsert({
    where: { eventId: event.id },
    create: { eventId: event.id },
    update: {},
  });
  if (seen.processed) return new Response('OK', { status: 200 });

  switch (event.type) {
    case 'customer.subscription.updated':
    case 'customer.subscription.created':
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      await db.subscriptions.upsert({
        where: { stripeId: sub.id },
        create: {
          stripeId: sub.id,
          customerId: sub.customer,
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          priceId: sub.items.data[0].price.id,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
        update: {
          status: sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000),
          priceId: sub.items.data[0].price.id,
          cancelAtPeriodEnd: sub.cancel_at_period_end,
        },
      });
      break;
    }
    // ...outros casos
  }

  await db.webhookEvents.update({
    where: { eventId: event.id },
    data: { processed: true },
  });
  return new Response('OK', { status: 200 });
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          <strong>Idempotência é não-negociável.</strong> Stripe re-envia webhooks que falharam por
          até 3 dias. Mesmo evento pode chegar 5 vezes. Tabela <InlineCode>webhook_events</InlineCode>{' '}
          com unique constraint em <InlineCode>event.id</InlineCode> + flag{' '}
          <InlineCode>processed</InlineCode> resolve.
        </Callout>
      </Section>

      <Section title="Stripe Tax: VAT/GST/sales tax sem firma de contabilidade" accent={accent}>
        <p>
          Para um solo founder BR vendendo no exterior, tax compliance é o maior pesadelo
          burocrático. Stripe Tax cobra 0.5% por transação tax-eligible mas:
        </p>
        <StackFlow
          accent={accent}
          title="O que Stripe Tax faz por você"
          items={[
            '1. Determina onde cobrar — Cruzando billing address, IP, payment method country e business location. Identifica nexus em US states, VAT na UE, GST no AU/UK/IN.',
            '2. Calcula tax correto — Por jurisdição. SaaS é taxado em CA/NY/TX/WA/etc. nos EUA, 22% VAT em PT, 19% em DE, 20% UK, 25% SE.',
            '3. Adiciona ao invoice — Linha "VAT (PT) — €22.00" abaixo do subtotal. Automaticamente no Checkout/Invoice/Portal.',
            '4. Alerta nexus thresholds — Quando você passar de US$100k em CA ou €10k UE/ano, Dashboard avisa para se registrar (você ainda registra manual).',
            '5. Gera relatórios para filing — CSV/PDF com tax coletado por jurisdição. Você (ou seu contador) usa para declarar.',
          ]}
        />
        <Callout tone="info" icon="🇧🇷">
          <strong>Realidade brasileira:</strong> faturando como LLC americana (próximo módulo
          também), você cobra VAT/sales tax dos seus clientes internacionais via Stripe Tax e remete
          ao tesouro deles. No Brasil, o dinheiro que entra na sua LLC é tributado quando você
          repatria (ver módulo sobre LLC). Stripe Tax não cobre Brazil ISS — para vender pra
          brasileiros, você precisa de PJ no BR ou aceitar que vai pagar ISS extra do bolso.
        </Callout>
      </Section>

      <Section title="Padrões SaaS reais: o que Linear, Notion e Vercel fazem" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['SaaS', 'Modelo', 'Stripe pattern']}
          rows={[
            ['Linear', '$8/user/mês licensed', 'subscription.items[0].quantity = seats. Customer Portal completo. Sem metered.'],
            ['Notion', '$10/user + addon AI metered', '2 SubscriptionItems: licensed (seats) + metered (AI requests). Aggregate "sum".'],
            ['Vercel', '$20 base + bandwidth/edge', 'Hybrid: $20 licensed Pro + 4-5 metered prices (bandwidth, function executions, builds). Custom dashboard, NÃO Customer Portal padrão.'],
            ['OpenAI API', '100% metered + prepay credits', 'Customer balance via Stripe + custom dashboard. Não usa Subscription — usa Invoice Items diretos.'],
            ['Anthropic API', 'Prepay credits + metered', 'Similar OpenAI. PaymentIntent off-session quando saldo baixa.'],
            ['ChartMogul (eat-your-dogfood)', 'Tiered subscriptions com seats', 'Subscription quantity-based, prorations create_prorations.'],
          ]}
        />
      </Section>

      <Section title="Anti-patterns que matam SaaS solo" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Construir UI de cancelamento custom', v: 'Customer Portal cobre. Construa só se tem retention flow específico (Audible-style "what if pause?").' },
            { k: 'Polling em vez de webhook', v: 'Você bate na API Stripe a cada request → rate limit, latência. Use webhook + cache local sempre.' },
            { k: 'Ignorar 3DS / SCA na UE', v: 'PSD2 obriga 3DS em pagamentos UE. Sem default_incomplete + client_secret, a UE recusa silenciosamente.' },
            { k: 'Hardcode preços no código', v: 'Crie no Dashboard Stripe, referencie via price_id em env var ou tabela plans. Permite A/B test de preço sem deploy.' },
            { k: 'Não testar webhook em dev', v: 'Use stripe-cli: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`. Dispara eventos reais no seu localhost.' },
            { k: 'Esquecer idempotência', v: 'Webhook duplicado vira double-charge de feature ou double-XP. Sempre upsert em tabela de events processados.' },
            { k: 'Não logar event.id e request.id', v: 'Quando o suporte Stripe te perguntar "qual request?", você precisa ter o request_id retornado em cada API call no log.' },
          ]}
        />
      </Section>

      <Section title="Checklist: do dia 0 ao primeiro $" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Sequência mínima para começar a faturar"
          steps={[
            { label: '1. Conta Stripe verificada', desc: 'Como LLC: stripe.com/atlas integra Atlas. Como PJ BR: cadastro Stripe Brasil (aceita CNPJ).' },
            { label: '2. Criar Products + Prices', desc: 'No Dashboard. Pelo menos um Pro mensal + anual (anual = 2 meses grátis = retention).' },
            { label: '3. Webhook endpoint + secret', desc: 'Stripe Dashboard > Webhooks > Add endpoint. Salve o signing secret no env.' },
            { label: '4. Checkout Sessions ou Billing API', desc: 'Para começar: Checkout (UI hospedada, 1 dia). Para escala: Billing API custom (semanas).' },
            { label: '5. Customer Portal ativo', desc: 'Configure no Dashboard. Implemente 1 endpoint /api/billing/portal.' },
            { label: '6. Smart Retries + Card Updater', desc: 'Dashboard > Settings > Subscriptions > Manage failed payments. Ative tudo.' },
            { label: '7. Stripe Tax', desc: 'Dashboard > Tax > Activate. Define tax codes nos Products (SaaS = txcd_10000000).' },
            { label: '8. Test mode → Live mode', desc: 'Toggle no Dashboard. Re-cria webhook endpoint para live (secret diferente!). Re-cria Products (test ≠ live).' },
          ]}
        />
      </Section>

      <Section title="Perguntas que aparecem na prática" accent={accent}>
        <QAItem
          q="Como eu testo um upgrade com prorations sem cobrar de verdade?"
          a={
            <>
              Use Test Mode + cartão <InlineCode>4242 4242 4242 4242</InlineCode>. O fluxo é
              idêntico ao live. Para simular falhas, use{' '}
              <InlineCode>4000 0000 0000 9995</InlineCode> (insufficient_funds). Lista completa:
              docs.stripe.com/testing.
            </>
          }
        />
        <QAItem
          q="Quanto cobra Stripe no Brasil?"
          a="3.99% + R$0.39 por transação cartão BR. 1.0% adicional se for cartão internacional. 4.99% para pagamento parcelado (até 12x). Pix: 1.99%. É caro vs gateways nacionais (Pagar.me ~2.5%) — você paga pela DX e produto. Para SaaS faturando em USD via LLC, custo cai para 2.9% + $0.30."
        />
        <QAItem
          q="Stripe aceita Pix?"
          a="Sim, desde 2023, para Brazilian Stripe accounts. Charge type 'pix' via PaymentIntent. Mas Pix não funciona para subscriptions recorrentes (Pix é one-shot). Para SaaS recorrente no BR, você precisa: cartão (recurring nativo) OU boleto recorrente (via gateway BR) OU billing manual via Pix (link de pagamento por mês)."
        />
        <QAItem
          q="Preciso de PCI compliance?"
          a="Não se usar Stripe Elements / Checkout / Payment Element — você nunca toca no número do cartão. Stripe é PCI DSS Level 1, te coloca em SAQ A (formulário de 22 perguntas, sem audit). Se construir form custom passando cartão pelo seu servidor → SAQ D + audit anual. Nunca faça isso."
        />
        <QAItem
          q="Como migrar de outro gateway para Stripe sem perder customers?"
          a="Use Stripe PAN Migration (gratis, requer compliance review): você manda CSV criptografado de PANs antigos, Stripe importa pra Vault e te devolve PaymentMethod IDs. Customers continuam ativos com o mesmo cartão. Alternativa: cobrar de novo no Stripe, esperar customer voluntariamente atualizar (péssimo, ~30% churn na migração)."
        />
      </Section>

      <Section title="Referências oficiais (Stripe Docs 2026)" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'docs.stripe.com/billing', v: 'Hub de Billing API — subscriptions, invoicing, prorations.' },
            { k: 'docs.stripe.com/billing/subscriptions/usage-based', v: 'Metered billing completo, incluindo aggregate_usage.' },
            { k: 'docs.stripe.com/billing/subscriptions/prorations', v: 'Proration math + exemplos de upgrade/downgrade.' },
            { k: 'docs.stripe.com/customer-management', v: 'Customer Portal config + customization.' },
            { k: 'docs.stripe.com/tax', v: 'Stripe Tax setup, tax codes, nexus monitoring.' },
            { k: 'docs.stripe.com/webhooks', v: 'Webhook signing, idempotency, retry logic.' },
            { k: 'stripe.com/atlas', v: 'Constituição LLC Delaware (próximo módulo da trilha).' },
          ]}
        />
      </Section>

      <Section title="Resumo executivo" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="A equação fundamental do billing SaaS"
          formula="MRR = Σ (active_subscription.price × quantity) + Σ (metered_usage × unit_price) − involuntary_churn × (1 − smart_retries_recovery)"
          parts={[
            { text: 'active_subscription', annotation: 'status IN (active, trialing). Você lê do seu DB, atualizado por webhook.' },
            { text: 'metered_usage', annotation: 'Sum dos usage_records do ciclo. Você reporta via API, Stripe agrega.' },
            { text: 'involuntary_churn', annotation: 'Payment failures por cartão. Smart Retries + Card Updater recuperam ~38%.' },
            { text: 'smart_retries_recovery', annotation: 'Você não controla — Stripe ML decide. Ative no Dashboard e deixe rodar.' },
          ]}
        />
        <Callout tone="success" icon="🎯">
          <strong>Próximo módulo:</strong> agora que você sabe cobrar, precisa decidir como separar
          dados de clientes. Multi-tenancy SaaS — pool vs silo vs hybrid (AWS Well-Architected SaaS
          Lens) — é o que define se seu SaaS escala para 100 ou 100.000 customers.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
