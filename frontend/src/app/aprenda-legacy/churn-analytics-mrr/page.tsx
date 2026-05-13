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
  AnnotatedFormula,
  DecisionBox,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('churn-analytics-mrr');

const accent = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre gross churn e net churn (net negative churn)?',
    options: [
      'São sinônimos — o mercado SaaS usa indistintamente',
      'Gross churn = MRR perdido (cancelamentos + downgrades) / MRR início do período. Net churn = (MRR perdido − MRR expansion) / MRR início. Net negative churn ocorre quando expansion (upgrades + add-ons) > churn — a base existente cresce sozinha, mesmo sem novos clientes. Empresas SaaS de elite (Snowflake, Datadog) operam com net negative churn em -10% a -20% (NRR > 110-120%), o santo graal.',
      'Gross é métrica trimestral, net é mensal',
      'Net churn é deprecated — só gross importa em 2026',
    ],
    correct: 1,
    explanation: 'Bessemer Cloud Index e Meritech publicam benchmarks: top SaaS B2B têm NRR (Net Revenue Retention) > 120% — significa que mesmo perdendo 100% dos novos clientes, a receita cresce 20% só por expansion. Modelos de expansion: seats (mais usuários), usage (mais consumo), upgrade tier (Pro → Business). Slack, Datadog, Snowflake são exemplos clássicos. Para solo SaaS, alcançar net negative é raro mas possível com modelo metered + upsell tier.',
  },
  {
    question: 'Por que cohort retention curves são essenciais para entender churn vs métricas mensais agregadas?',
    options: [
      'Cohort retention é só para apresentações bonitas — não dá insight novo',
      'Churn agregado (ex: 5%/mês) esconde dinâmica real: pode estar piorando, melhorando, ou estável dependendo da cohort. Cohort retention divide users por mês de signup e mede % ativos N meses depois. Permite ver: (1) is the product getting stickier? — cohorts mais novas devem reter melhor que velhas se você está iterando bem; (2) qual cohort foi anormal — ex: cohort de outubro churna 30% pq feature X quebrou; (3) terminal churn — depois de N meses, retention estabiliza (esse é o LTV real). Sem cohort, você voa cego.',
      'Cohort funciona só com mais de 10.000 customers',
      'Cohort retention é métrica de marketing, não de produto',
    ],
    correct: 1,
    explanation: 'Cohort analysis: cada coluna = mês de signup, cada linha = retention após N meses. Diagonal mostra evolução do produto. SaaS bom: retention curves convergem para um piso (ex: 60% no D90 e estável depois). SaaS ruim: curva continua caindo, indica churn não estancado. Ferramentas: Mixpanel/Amplitude/PostHog têm cohort built-in. ChartMogul/Baremetrics focam em MRR cohort especificamente.',
  },
  {
    question: 'O que é MRR movement e por que separar New + Expansion + Contraction + Churn é mais útil que olhar só Net New MRR?',
    options: [
      'MRR movement é métrica vaidade — só Net New importa',
      'Net New MRR = New + Expansion − Contraction − Churn. Olhar só o número composto esconde a saúde do negócio. Ex: $10k Net New pode ser: ($20k New − $10k Churn = saudável crescimento) OU ($30k New − $20k Churn = leaky bucket, gastando muito em aquisição). Decompor permite diagnosticar: alto Churn = problema produto/onboarding; baixo Expansion = falta de upsell; alto Contraction = downgrades sistemáticos sinalizam mismatch de pricing. ChartMogul e Baremetrics dashboardam exatamente essa decomposição.',
      'Movement é só relevante para empresas pré-IPO',
      'Em 2026 o padrão é olhar só ARR, não MRR',
    ],
    correct: 1,
    explanation: 'MRR movement (decomposição mensal): New MRR (clientes novos), Expansion MRR (upgrades de existentes), Contraction MRR (downgrades), Churn MRR (cancelados), Reactivation MRR (voltaram após cancelar). Soma algébrica = Net New MRR = MRR_end − MRR_start. Padrão SaaS sério: dashboard com 5 barras coloridas. ChartMogul popularizou esse format. Bessemer State of the Cloud usa para benchmarks.',
  },
  {
    question: 'Qual é a diferença entre revenue churn e logo churn, e quando uma é mais importante que a outra?',
    options: [
      'São idênticas — só nomes diferentes',
      'Logo churn = % de CUSTOMERS que cancelaram (cada cliente conta 1). Revenue churn = % de MRR perdido. Diferença importa em base heterogênea: 1 cliente enterprise de $50k cancelando = 1 logo, mas $50k de revenue. 100 small de $10/mês cancelando = 100 logos, $1k revenue. Para SaaS PLG/B2C: logo churn é o KPI principal (cada cliente vale parecido). Para SaaS Enterprise B2B com long tail: revenue churn (dollar churn) é o KPI principal — perder 1 grande > perder 100 pequenos.',
      'Logo só faz sentido para empresas com mais de $1M ARR',
      'Revenue churn substitui logo churn em 2026',
    ],
    correct: 1,
    explanation: 'Padrão: reporte AMBOS. SaaS com gross logo churn 5%/mês mas revenue churn 2%/mês = você está perdendo small accounts mas mantendo enterprise (bom sinal). Inverso é alarmante. Em pricing-power talk de Bessemer, revenue churn é o KPI norte porque conecta com financeiros. Em PLG, logo churn é viral (cada perda reduz spread).',
  },
  {
    question: 'Quando você deve usar ChartMogul vs Baremetrics vs build-your-own dashboard de SaaS metrics?',
    options: [
      'Sempre use ChartMogul — é o padrão',
      'ChartMogul (~$100+/mo): plug-and-play com Stripe/Recurly/Chargebee, dashboards completos (MRR, churn, cohorts, LTV), bom para SaaS faturando $5k-500k MRR onde o tempo de dev é caro. Baremetrics (~$129+/mo): similar, mais focado em B2C/freemium, "open metrics" pública (transparência). Build-your-own: vale quando você tem multi-currency, custom logic (Stripe + outros), ou >$1M ARR justifica analyst engineer dedicado. Para solo founder começando: ChartMogul ou Baremetrics — não perca tempo. Quando $100/mês doer = você está fazendo errado.',
      'Build-your-own sempre, paid tools são scam',
      'Baremetrics deprecated em 2025',
    ],
    correct: 1,
    explanation: 'ChartMogul vs Baremetrics são quase commodities (escolha por preferência de UI). Stripe Sigma+ Looker é alternativa power-user (gratis se você usa Sigma, mais custom). ProfitWell Metrics (now Paddle Studio) é GRATIS para Stripe — vale tentar primeiro. Build-your-own: 1-2 sprints de eng para fazer mal, 4-6 sprints para fazer bem. Justifica só quando custom logic (multi-product bundles, complex pricing) extrapola tools paid.',
  },
];

export default function ChurnAnalyticsMrrPage() {
  return (
    <ModuleLayout
      slug="churn-analytics-mrr"
      title="Churn analytics: cohort, retention, MRR movement"
      icon="📉"
      xp={65}
      readTime={13}
      trailName="Solo SaaS / Indie Hacker Stack 2026"
      trailColor={accent}
      nextSlug="metricas-cac-ltv"
      nextTitle="CAC, LTV, payback period: as 5 métricas que importam"
      quiz={quiz}
    >
      <Section title="A matemática brutal do SaaS" accent={accent}>
        <p>
          SaaS é o melhor modelo de negócio inventado <strong>se</strong> e <strong>somente
          se</strong> você não tem leaky bucket. Adquirir clientes a US$1k cada não importa se 30%
          churnam em 90 dias — você está alimentando um balde furado.
        </p>
        <p>
          Churn analytics não é &quot;ver gráfico bonito&quot;. É <em>diagnóstico</em>: descobrir{' '}
          <strong>qual</strong> tipo de churn (involuntary, voluntary, contraction), <strong>quando</strong>{' '}
          ocorre (D1, D30, D90), <strong>quem</strong> churna (qual cohort, plano, persona), e{' '}
          <strong>por quê</strong> (sinal antes do cancelamento).
        </p>
        <Callout tone="warn" icon="🪣">
          <strong>Regra de ouro:</strong> antes de gastar $1 em ads ou growth, conserte churn.
          Bessemer Cloud Index mostra que SaaS de elite têm gross churn anual &lt;10%. SaaS médios
          25-40%. Diferença explica 90% da disparidade de valuation.
        </Callout>
      </Section>

      <Section title="MRR movement: a equação fundadora" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="A equação do MRR movement"
          formula="MRR_end = MRR_start + New + Expansion + Reactivation − Contraction − Churn"
          parts={[
            { text: 'New MRR', annotation: 'Subscriptions novas no período. Sinal de funnel/sales.' },
            { text: 'Expansion MRR', annotation: 'Upgrades de plano + add-ons + mais seats em customers existentes.' },
            { text: 'Reactivation MRR', annotation: 'Customer que cancelou e voltou. Sinal de produto melhor ou win-back.' },
            { text: 'Contraction MRR', annotation: 'Downgrades (Pro → Free), redução de seats. Sinal de mismatch de valor.' },
            { text: 'Churn MRR', annotation: 'Cancelamentos. Voluntary (cliente quis) + Involuntary (payment failure).' },
          ]}
        />
        <FlowDiagram
          accent={accent}
          orientation="horizontal"
          title="Visualização clássica MRR Movement (5 barras)"
          steps={[
            { label: '+ New', desc: 'Verde' },
            { label: '+ Expansion', desc: 'Verde escuro' },
            { label: '+ Reactivation', desc: 'Verde claro' },
            { label: '− Contraction', desc: 'Amarelo' },
            { label: '− Churn', desc: 'Vermelho' },
          ]}
        />
        <Callout tone="info" icon="📊">
          Esse gráfico vive no dashboard executivo de toda SaaS séria. ChartMogul, Baremetrics, e
          Stripe Sigma todos o produzem. Para solo: implemente no PostHog ou Metabase com queries
          SQL em cima da tabela de subscriptions.
        </Callout>
      </Section>

      <Section title="Gross vs Net Churn (e NRR)" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Métrica', 'Fórmula', 'Benchmark SaaS B2B (Bessemer)']}
          rows={[
            ['Gross Revenue Churn', '(Contraction + Churn) / MRR_start', '< 10%/ano excelente, 10-20% bom, > 25% problema'],
            ['Net Revenue Churn', '(Contraction + Churn − Expansion) / MRR_start', '< 0% (net negative) excelente; 0-10% saudável'],
            ['Net Revenue Retention (NRR)', '1 − Net Revenue Churn', '> 120% elite, 100-120% bom, < 100% problema'],
            ['Gross Logo Churn', '# canceled / # customers_start', '< 1%/mês B2B; < 5%/mês B2C'],
            ['Net Logo Churn', 'Não comum — logos não expandem', '—'],
          ]}
        />
        <AnnotatedFormula
          accent={accent}
          title="NRR: a métrica que VCs olham primeiro"
          formula="NRR = (MRR_start + Expansion − Contraction − Churn) / MRR_start"
          parts={[
            { text: 'NRR > 100%', annotation: 'A base existente cresce sozinha (net negative churn). Snowflake teve 165% no IPO.' },
            { text: 'NRR = 100%', annotation: 'Expansion exatamente compensa churn. Saudável mas não excitante.' },
            { text: 'NRR < 100%', annotation: 'Você precisa adquirir novos clientes só para manter receita. Leaky bucket.' },
          ]}
        />
      </Section>

      <Section title="Voluntary vs Involuntary Churn" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Voluntary churn', v: 'Cliente cancelou ativamente. Sinal de problema de produto, valor ou pricing. Fix: melhorar produto, win-back campaigns, downgrade option.' },
            { k: 'Involuntary churn', v: 'Cartão expirou, recusado, sem saldo. NÃO é problema de produto. Fix: Stripe Smart Retries + Card Account Updater + email "atualize cartão" + grace period.' },
            { k: 'Proporção típica', v: '40-60% do churn em SaaS é INVOLUNTARY. Ataque esse primeiro — é o low-hanging fruit.' },
            { k: 'Diferenciar é crítico', v: 'Sem essa segmentação, você desperdiça energia "melhorando produto" quando o problema é Stripe config. Ative dunning antes de retrabalhar feature.' },
          ]}
        />
        <Callout tone="success" icon="💰">
          Stripe publicou em 2024: Smart Retries + Card Updater recuperam ~38% dos involuntary
          churns. Para SaaS com $50k MRR e 4% involuntary, isso é US$760/mo de revenue retido
          automaticamente.
        </Callout>
      </Section>

      <Section title="Cohort retention curves: a verdade sobre o produto" accent={accent}>
        <p>
          Churn agregado mensal mente. Cohort retention curves não. O setup:
        </p>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Como construir uma cohort retention table"
          steps={[
            { label: '1. Agrupe customers por mês de signup', desc: 'Cohort Jan-2026, Feb-2026, etc.' },
            { label: '2. Para cada cohort, mede % ativos após N meses', desc: 'Cohort Jan tinha 100 customers. Em Fev: 90 ativos (90%). Em Mar: 85 (85%). Etc.' },
            { label: '3. Plot heatmap', desc: 'Linhas = cohort (mês de signup). Colunas = mês após signup (M+1, M+2, ...). Cores = % retenção.' },
            { label: '4. Compare diagonais', desc: 'Cohorts mais novas devem ter retention igual ou melhor que velhas no mesmo offset. Se piorou, o produto regrediu.' },
            { label: '5. Identifique floor', desc: 'Após N meses, retention estabiliza num piso (ex: 60%). Esse é o "terminal retention" — base do LTV.' },
          ]}
        />
        <CodeBlock lang="sql">{`-- Cohort retention em SQL puro (Postgres)
WITH cohorts AS (
  SELECT
    user_id,
    DATE_TRUNC('month', signup_date) AS cohort_month
  FROM users
),
activity AS (
  SELECT
    s.user_id,
    c.cohort_month,
    DATE_TRUNC('month', s.period_start) AS active_month
  FROM subscriptions s
  JOIN cohorts c USING (user_id)
  WHERE s.status IN ('active', 'trialing')
),
retention AS (
  SELECT
    cohort_month,
    active_month,
    EXTRACT(MONTH FROM AGE(active_month, cohort_month)) AS months_since_signup,
    COUNT(DISTINCT user_id) AS active_users
  FROM activity
  GROUP BY 1, 2, 3
),
cohort_size AS (
  SELECT cohort_month, COUNT(DISTINCT user_id) AS total
  FROM cohorts
  GROUP BY 1
)
SELECT
  r.cohort_month,
  r.months_since_signup,
  ROUND(100.0 * r.active_users / c.total, 1) AS retention_pct
FROM retention r
JOIN cohort_size c USING (cohort_month)
ORDER BY r.cohort_month, r.months_since_signup;`}</CodeBlock>
        <Callout tone="info" icon="💡">
          PostHog, Mixpanel, Amplitude, ChartMogul, Baremetrics — todos têm cohort built-in. Para
          solo SaaS pequeno: PostHog free aguenta tudo. Para SaaS faturando: ChartMogul resolve.
        </Callout>
      </Section>

      <Section title="A curva de retenção saudável vs problema" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Padrão', 'Diagnóstico', 'O que fazer']}
          rows={[
            ['Cai rápido D1-D7, estabiliza alto', 'Onboarding ruim, mas quem fica é fiel', 'Foque first-mile do onboarding (módulo anterior)'],
            ['Cai constante, sem floor', 'Produto não retém — problema sério de valor', 'Pause growth. Entreviste churned users. Pivota se preciso.'],
            ['Cai devagar, depois cai muito em D90', 'Trial expira/grandes contratos vencendo', 'Renewal campaign agressiva, customer success outreach'],
            ['Cohorts novas piores que velhas', 'Produto regrediu (bug, mudança ruim)', 'Compare features lançadas. Reverter ou consertar.'],
            ['Cohorts novas melhores que velhas', 'Você está iterando bem — sinal verde', 'Continue. Scale acquisition.'],
            ['Retention "smile curve" (sobe após cair)', 'Reactivation funcionando (win-back)', 'Documente e escale a estratégia de win-back'],
          ]}
        />
      </Section>

      <Section title="Quick Ratio: o teste rápido de saúde" accent={accent}>
        <AnnotatedFormula
          accent={accent}
          title="SaaS Quick Ratio (Mamoon Hamid, Social Capital)"
          formula="Quick Ratio = (New MRR + Expansion MRR) / (Contraction MRR + Churn MRR)"
          parts={[
            { text: '> 4', annotation: 'Excelente — você está crescendo rápido e segurando bem' },
            { text: '2 a 4', annotation: 'Saudável crescimento' },
            { text: '1 a 2', annotation: 'Crescimento marginal — atenção' },
            { text: '< 1', annotation: 'Encolhendo — pare e conserte' },
          ]}
        />
        <Callout tone="info" icon="🚀">
          Quick Ratio é o &quot;BMI do SaaS&quot; — número único que aponta saúde. Para early-stage
          (até $10k MRR) pode oscilar, mas após $50k MRR estabilize acima de 2 ou pause growth.
        </Callout>
      </Section>

      <Section title="Sinais antes do churn (leading indicators)" accent={accent}>
        <p>
          Quando o cliente cancela, já é tarde. Churn é <em>lagging indicator</em>. Leading
          indicators dão chance de intervir:
        </p>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Drop em DAU/WAU', v: 'Customer ativo virou inativo por N dias. Trigger: email "sentimos sua falta" ou outreach humano se enterprise.' },
            { k: 'Decrease in feature usage', v: 'Ex: customer usava feature core diariamente, agora 1x/semana. Detecta engagement quebrando.' },
            { k: 'Support ticket spike', v: 'Customer aumentou tickets 3x em 30 dias. Frustração subindo. Alerte CS.' },
            { k: 'NPS / CSAT baixo', v: 'Pesquisa periódica. Detratores (NPS 0-6) churnan 3-5x mais.' },
            { k: 'Payment method próximo de expirar', v: 'Cartão expira em 30 dias. Email proativo "atualize antes do próximo billing".' },
            { k: 'Login mas zero feature use', v: 'Customer abre app mas não faz nada. Sinal de confusão ou dúvida.' },
            { k: 'Downgrade voluntário', v: 'Antes de cancelar, customer baixa plano. Win-back pode evitar churn total.' },
          ]}
        />
        <CodeBlock lang="sql">{`-- Identificar customers em risco
SELECT
  u.id,
  u.email,
  s.plan,
  s.mrr,
  MAX(e.created_at) AS last_event,
  COUNT(DISTINCT DATE(e.created_at)) FILTER (
    WHERE e.created_at > now() - interval '14 days'
  ) AS active_days_14d,
  COUNT(DISTINCT DATE(e.created_at)) FILTER (
    WHERE e.created_at BETWEEN now() - interval '28 days' AND now() - interval '14 days'
  ) AS active_days_prev_14d
FROM users u
JOIN subscriptions s ON s.user_id = u.id AND s.status = 'active'
LEFT JOIN events e ON e.user_id = u.id
GROUP BY u.id, u.email, s.plan, s.mrr
HAVING
  -- ativos antes, não agora
  COUNT(DISTINCT DATE(e.created_at)) FILTER (WHERE e.created_at > now() - interval '14 days') < 3
  AND COUNT(DISTINCT DATE(e.created_at)) FILTER (
    WHERE e.created_at BETWEEN now() - interval '28 days' AND now() - interval '14 days'
  ) >= 7
ORDER BY s.mrr DESC; -- prioriza customers de maior MRR`}</CodeBlock>
      </Section>

      <Section title="Win-back: salvando o que ia ser perdido" accent={accent}>
        <FlowDiagram
          accent={accent}
          orientation="vertical"
          title="Estratégias de win-back por momento"
          steps={[
            { label: '1. Antes de cancelar (predict)', desc: 'Detecte sinais de risco. CS reachout, ofereça pausa, tutorial extra, ou desconto temporário.' },
            { label: '2. No fluxo de cancelamento', desc: 'Cancel flow não é "1 clique e tchau". Ofereça: pause subscription, downgrade, desconto 50% por 3 meses, agendar call com founder.' },
            { label: '3. Imediato pós-cancel', desc: 'Email humano "lamentamos. Por que? Posso ajudar?". Resposta rate ~10-15% — alguns voltam.' },
            { label: '4. 30-90 dias depois (win-back campaign)', desc: 'Lançamos features X, Y, Z que você pediu. Volte com 50% off por 3 meses." Funciona em ~3-7% dos cancelados.' },
            { label: '5. Revenue inicial extracted', desc: 'Mesmo win-back de 5% é grande — você já recuperou CAC. Reativação tem 0 CAC adicional.' },
          ]}
        />
      </Section>

      <Section title="Métricas para o dashboard do dia-a-dia" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Frequência', 'Métricas', 'Para quem']}
          rows={[
            ['Diária', 'New MRR, Churn MRR, Active subs, signups', 'Founder/CEO — pulse'],
            ['Semanal', 'Cohort retention curve atualizada, Quick Ratio, Logo churn', 'Founder + growth/CS'],
            ['Mensal', 'NRR, GRR, MRR movement chart, LTV:CAC, payback period', 'Investors, board, financial planning'],
            ['Trimestral', 'Quarterly cohort deep dive, expansion analysis, persona segmentation', 'Estratégia anual'],
          ]}
        />
      </Section>

      <Section title="Tools: ChartMogul vs Baremetrics vs build-your-own" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['', 'ChartMogul', 'Baremetrics', 'ProfitWell Metrics (Paddle)', 'Build-your-own']}
          rows={[
            ['Preço', '$100+/mo (free <$10k MRR)', '$129+/mo', 'Grátis com Paddle/Stripe', '$0 dinheiro + 50-200h eng'],
            ['Setup', '10 min (Stripe connect)', '10 min', '5 min', 'Semanas'],
            ['Stripe direto', '✅', '✅', '✅', '✅'],
            ['Multi-currency', '✅', '✅', '🟡', 'Você implementa'],
            ['Custom logic', 'Limitado', 'Limitado', 'Limitado', 'Total'],
            ['Public dashboard', 'Opcional', 'Sim (signature feature)', '✅', '✅'],
            ['Cohort analysis', '✅', '✅', '✅', '✅'],
            ['Recomendação', 'Padrão da indústria', 'Bom para transparência', 'Vale tentar grátis', '> $1M ARR com analyst'],
          ]}
        />
        <DecisionBox
          scenario="Solo SaaS com $5k MRR, quer dashboard de métricas SaaS sem perder semanas"
          winner="ProfitWell Metrics (gratis com Stripe)"
          winnerColor={accent}
          why="Free, plug com Stripe em 5 minutos, dá MRR movement + cohort + churn dashboard. Não tem custo, sem trade-off. Se ficar limitante depois, migra para ChartMogul."
          alternatives={[
            { name: 'ChartMogul (free abaixo de $10k MRR)' }, { name: 'Também free no seu range. Vale testar lado-a-lado.' }, { name: 'Build-your-own' }, { name: 'Não vale o tempo. Foque no produto.' }
          ]}
        />
      </Section>

      <Section title="Perguntas que aparecem na prática" accent={accent}>
        <QAItem
          q="Como calculo MRR de subscription anual?"
          a={
            <>
              Divida o valor anual por 12. Cliente paga R$1200/ano? MRR = R$100. ARR = R$1200. NÃO
              conte os R$1200 como New MRR do mês de signup — distribui ao longo do ano. ChartMogul
              e Baremetrics fazem isso automaticamente. Em SQL: <InlineCode>annual_amount / 12</InlineCode>{' '}
              e marcar período de 12 meses.
            </>
          }
        />
        <QAItem
          q="Customer pausou subscription (vacation hold). Conta como churn?"
          a="Não. Pause é estado intermediário — status='paused' no Stripe. MRR vai a zero durante pause mas customer não é churned (não some das cohorts). Quando voltar, MRR retorna. Algumas ferramentas tratam como contraction temporária, outras ignoram. Padrão: tratar pause como contraction temporária."
        />
        <QAItem
          q="Annual customer cancelou no mês 6 — quando registra churn?"
          a="Depende se ele teve reembolso pro-rata ou continua acessando até fim do ano. Se sem reembolso (mais comum em anual): customer continua active até cancel_at_period_end, churn registra no mês 12. Se com reembolso: churn registra agora, refund vai para Contraction MRR. Stripe webhook customer.subscription.deleted te avisa o momento exato."
        />
        <QAItem
          q="Como segmentar churn por persona/plano?"
          a="Adicione dimensões nas suas tabelas: subscription.plan, subscription.persona (do signup), subscription.acquisition_channel. Compute churn agrupando por essas dimensões. Insights típicos: 'plano Free churna 30% mas Pro só 5%' (ok, normal); 'channel Google Ads churna 2x mais que organic' (alarmante — você está atraindo wrong fit)."
        />
        <QAItem
          q="O que é uma 'good' churn rate para SaaS solo bootstrapped?"
          a="Depende ARR. Bessemer benchmarks: < $1k ACV (consumer/SMB) — gross 5-7%/mês aceitável. $1k-10k ACV (SMB B2B) — 1-2%/mês. > $10k ACV (mid-market/enterprise) — < 1%/mês. Solo SaaS PLG (típico ARR $100-500/customer): mire 3-5%/mês como saudável."
        />
      </Section>

      <Section title="Referências canônicas" accent={accent}>
        <KeyValue
          accent={accent}
          items={[
            { k: 'Bessemer State of the Cloud', v: 'bvp.com/atlas/state-of-the-cloud — relatório anual com benchmarks de NRR, growth, etc.' },
            { k: 'ChartMogul SaaS Metrics Guide', v: 'chartmogul.com/resources — bíblia gratuita de SaaS metrics.' },
            { k: 'David Skok — For Entrepreneurs', v: 'forentrepreneurs.com — fundador da Matrix Partners. CAC, LTV, Quick Ratio canonical.' },
            { k: 'Tomasz Tunguz blog', v: 'tomtunguz.com — Redpoint VC, posts diários com data SaaS.' },
            { k: 'Mamoon Hamid Quick Ratio', v: 'Social Capital framework, popularizou Quick Ratio como single-number health.' },
            { k: 'ProfitWell research', v: 'profitwell.com (now Paddle Studio) — relatórios públicos sobre retention.' },
            { k: 'PostHog cohort docs', v: 'posthog.com/docs/product-analytics/retention — free tier funcional para solo SaaS.' },
          ]}
        />
        <Callout tone="success" icon="➡️">
          <strong>Próximo módulo:</strong> com churn entendido, agora as outras métricas que
          decidem o destino do SaaS: CAC, LTV, payback period, Rule of 40.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
