import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('marketing-metricas');

const ACCENT = '#a78bfa';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia métricas de vaidade de métricas de negócio?',
    options: [
      'Métricas de vaidade são as gratuitas e métricas de negócio são pagas',
      'Métricas de vaidade fazem você se sentir bem mas não correlacionam com resultados (likes, seguidores totais, views). Métricas de negócio se correlacionam com receita, oportunidades e impacto real (CTR, conversão, LTV, NPS, CAC, MRR)',
      'Métricas de vaidade são internas e métricas de negócio são públicas',
      'Não há diferença prática — todas servem para análise',
    ],
    correct: 1,
    explanation:
      'Likes e seguidores são "vaidade" porque podem ser comprados, viralizar sem trazer resultado, ou inflar sem significar nada. CTR (click-through rate), CR (conversion rate), CAC (customer acquisition cost), LTV (lifetime value) e MRR (monthly recurring revenue) são "north star metrics" — se sobem, negócio cresce. Erro clássico: criador celebra 100k seguidores enquanto vendas estagnam. Profissional sério acompanha métricas de fundo de funil (vendas, leads qualificados), não topo (impressões).',
  },
  {
    question: 'Qual ferramenta de analytics é a mais importante em 2026 para criadores e profissionais digitais?',
    options: [
      'Google Analytics 4 — mais completo do mercado',
      'Google Analytics 4 (gratuito) + Plausible/Umami se prioridade é privacidade. GA4 é padrão para análise web; nas redes sociais use analytics nativos (LinkedIn Analytics, Instagram Insights, YouTube Studio). Hotjar/Microsoft Clarity (grátis) para entender comportamento real',
      'Apenas analytics nativos das redes sociais',
      'Mixpanel é obrigatório para qualquer análise séria',
    ],
    correct: 1,
    explanation:
      'Stack 2026: GA4 (gratuito, padrão) ou Plausible/Umami (gratuito self-host, privacy-first) para web. Microsoft Clarity (gratuito sem limite) para heatmaps e session recordings. Analytics nativos: LinkedIn (Page/Profile Analytics), YouTube Studio (Channel Analytics), Beehiiv (newsletter analytics). Mixpanel/Amplitude são para produtos SaaS sérios — overkill para criadores. Plausible (US$9/mês) ganhou popularidade por ser GDPR/LGPD-compliant sem cookie banner.',
  },
  {
    question: 'O que é a "north star metric" e como definir uma para seu projeto?',
    options: [
      'Métrica que aparece em todos os dashboards da empresa',
      'Métrica única que melhor representa valor entregue ao usuário/cliente. Para SaaS: MRR ou ARR. Para creator: receita recorrente. Para newsletter: assinantes engajados (não apenas total). Tudo que você faz deveria mover essa métrica',
      'Apenas para empresas grandes — não se aplica a profissionais individuais',
      'Métrica de marketing apenas — não inclui produto',
    ],
    correct: 1,
    explanation:
      'North Star Metric (NSM) é a métrica que melhor reflete sucesso do negócio. Para Spotify: weekly listening hours. Para Airbnb: nights booked. Para criador: dependendo do modelo — receita mensal recorrente, alunos engajados, leads qualificados. NSM deve ser: (1) representativa de valor entregue; (2) acionável (você pode influenciar); (3) lagging um pouco (resultado, não atividade). Erro: ter 10 north stars = ter zero. Escolha uma e priorize.',
  },
  {
    question: 'Como calcular CAC (Custo de Aquisição de Cliente) para um criador/freela?',
    options: [
      'Apenas o custo de ferramentas e softwares utilizados',
      'CAC = (custos de marketing + tempo investido × seu valor/h) ÷ novos clientes pagantes. Exemplo: R$200 em ferramentas + 40h × R$150/h ÷ 4 clientes = R$1.550 de CAC. Compare com LTV para saber se o canal é sustentável',
      'CAC só se aplica para empresas com equipe de vendas',
      'Custo total da empresa dividido pelo número de clientes',
    ],
    correct: 1,
    explanation:
      'CAC mais preciso inclui tempo investido — se você gasta 40h/mês criando conteúdo, isso tem custo de oportunidade. Fórmula: CAC = (R$ direto gasto + horas × valor/h) / clientes adquiridos. Compare com LTV (Lifetime Value): se LTV/CAC > 3, canal é sustentável; < 1, está perdendo dinheiro. Exemplo: curso de R$497, repete 1.5x = LTV R$745. Com CAC R$1.550, canal não compensa. Soluções: aumentar LTV (upsell, recorrência) ou reduzir CAC (canal mais eficiente).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="marketing-metricas"
      title="Métricas que Importam: o que medir e o que ignorar"
      icon="📊"
      xp={70}
      readTime={12}
      trailName="Marketing Digital"
      trailColor={ACCENT}
      nextSlug="empreend-curso-online"
      nextTitle="Curso Online: criar, lançar e escalar"
      relatedSlugs={['marketing-personal-branding', 'marketing-conteudo-autoridade', 'marketing-email-newsletter']}
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Você não pode melhorar o que não mede. Mas medir tudo é pior que medir nada — gera ruído e
        decisões erradas. Esta aula mostra o framework de métricas que importam para criadores e
        profissionais digitais em 2026: o que medir, com qual ferramenta, qual meta saudável, e
        quando ignorar.
      </p>

      <Section title="O framework AARRR (métricas de funil)" accent={ACCENT}>
        <LayerStack
          title="AARRR — Pirate Metrics adaptadas para criadores"
          accent={ACCENT}
          separatorLabel="próximo estágio →"
          layers={[
            { label: 'Acquisition', content: 'Quantas pessoas chegam? Tráfego, impressões, alcance', note: 'topo do funil', tone: 'writable' },
            { label: 'Activation', content: 'Tiveram primeira experiência boa? Click rate, time on page', tone: 'writable' },
            { label: 'Retention', content: 'Voltaram? Open rate de newsletter, retorno ao site', tone: 'writable' },
            { label: 'Referral', content: 'Recomendaram? Forward rate, NPS, shares orgânicos', tone: 'writable' },
            { label: 'Revenue', content: 'Pagaram? MRR, conversão, LTV — a métrica que importa', note: 'fundo do funil', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Métricas por canal: o que medir e ferramentas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Canal', 'Métricas-chave', 'Ferramenta']}
          rows={[
            ['Website/Blog', 'Sessões, bounce rate, conversão, fontes', 'GA4 ou Plausible'],
            ['LinkedIn', 'Engagement rate, dwell time, follower growth', 'LinkedIn Analytics + Shield'],
            ['YouTube', 'CTR, AVD, retention curve, subscribers growth', 'YouTube Studio + vidIQ'],
            ['Newsletter', 'Open rate, click rate, unsubs, growth', 'Beehiiv/ConvertKit nativo'],
            ['Instagram', 'Reach, saves, shares, profile visits', 'Instagram Insights'],
            ['TikTok', 'AVD, completion rate, shares, profile clicks', 'TikTok Analytics'],
            ['Twitter/X', 'Impressions, engagement rate, profile clicks', 'Twitter Analytics nativo'],
          ]}
        />
        <Callout tone="info">
          <strong>Stack mínimo profissional 2026:</strong> GA4 ou Plausible (web) + Microsoft Clarity
          (heatmaps grátis) + analytics nativos das redes que você usa + planilha de tracking semanal.
          Total: R$0/mês para começar. Plausible (US$9/mês) se prioridade é privacy-first sem cookie banner.
        </Callout>
      </Section>

      <Section title="Métricas de negócio: para criadores que vendem" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'Fórmula', 'Meta saudável']}
          rows={[
            ['Conversion rate', 'Compras ÷ Visitantes', '1-3% (cold), 5-15% (warm)'],
            ['CAC', 'Custo total marketing ÷ Novos clientes', 'LTV/CAC > 3 = sustentável'],
            ['LTV', 'Receita média × tempo de retenção', 'Crescente ao longo do tempo'],
            ['MRR (recorrente)', 'Soma de receitas mensais recorrentes', 'Crescimento +10-30% MoM'],
            ['Churn rate', '% que cancela por mês', '< 5% (saudável SaaS)'],
            ['NPS', 'Promoters - Detractors', '50+ é excelente'],
            ['ROAS (Return on Ad Spend)', 'Receita ÷ Gasto em ads', '> 4:1 sustentável'],
          ]}
        />
        <CodeBlock lang="markdown">{`# Exemplo de cálculo financeiro mensal — criador de curso

## Receita
- Curso 1 (R$297): 30 vendas = R$8.910
- Curso 2 (R$497): 12 vendas = R$5.964
- Mentoria (R$2k/mês × 4 alunos) = R$8.000
TOTAL: R$22.874

## Custos
- Plataforma Hotmart (10%): R$2.287
- Ads Meta (gasto): R$3.500
- Ferramentas (Beehiiv, Notion, Canva): R$300
- Tempo investido (80h × R$200): R$16.000 (custo de oportunidade)
TOTAL: R$22.087

## Análise
LUCRO REAL: R$787 (cuidado: está apertado)
ROAS: R$22.874 / R$3.500 = 6.5x (saudável)
CAC orgânico: R$300 ÷ 30 = R$10 (excelente)
CAC pago: R$3.500 ÷ 12 = R$291 (LTV/CAC = ?)
LTV (curso + mentoria): variável — calcular!`}</CodeBlock>
      </Section>

      <Section title="Dashboard semanal — o que olhar toda segunda" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'Frequência', 'Onde olhar']}
          rows={[
            ['Receita semanal', 'Toda segunda', 'Plataforma de venda + planilha'],
            ['Novos assinantes newsletter', 'Toda segunda', 'Beehiiv/ConvertKit'],
            ['Novos seguidores LinkedIn', 'Toda segunda', 'LinkedIn Analytics'],
            ['Top 3 posts da semana', 'Toda segunda', 'Insights de cada plataforma'],
            ['Conversões do site', 'Toda segunda', 'GA4 ou Plausible'],
            ['Calls/leads qualificados', 'Toda segunda', 'CRM ou planilha'],
            ['NPS/feedbacks recebidos', 'Mensal', 'Pesquisas + DMs'],
          ]}
        />
        <DecisionBox
          scenario="Criador iniciante perdido em qual métrica priorizar"
          winner="3 métricas: 1 de topo (alcance), 1 de meio (lista de email), 1 de fundo (vendas)"
          winnerColor={ACCENT}
          why="Acompanhar 20 métricas paralisa. Acompanhar 3 que cobrem o funil completo dá visão clara. Topo: impressions ou reach. Meio: novos assinantes na newsletter (ativo). Fundo: receita ou clientes novos. Se uma trava, você sabe onde mexer. Outras métricas viram secundárias — só olhe quando uma das 3 falhar."
          alternatives={[
            { name: 'NSM única', note: 'Ainda mais radical: só receita recorrente. Bom para focado, ruim para diagnosticar problemas' },
            { name: 'Dashboard completo (10+ métricas)', note: 'Para profissional experiente que sabe diagnosticar — overkill para iniciante' },
          ]}
        />
      </Section>

      <Section title="Quando ignorar métricas (o paradoxo de Goodhart)" accent={ACCENT}>
        <Callout tone="info">
          <strong>Lei de Goodhart:</strong> "Quando uma métrica vira meta, ela deixa de ser boa
          métrica." Exemplo: virar obcecado por seguidores faz você criar conteúdo viral mas raso.
          Vira meta de open rate alto faz você usar clickbait que destrói confiança. Métricas
          existem para diagnóstico, não para perseguição cega.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sintoma', 'Métrica vira armadilha', 'Solução']}
          rows={[
            ['Crescimento de seguidores estagnado', 'Vira virais clickbait', 'Olhe engagement rate, não total'],
            ['Vendas baixas', 'Desconto agressivo destrói margem', 'Aumente LTV, não baixe preço'],
            ['Open rate caindo', 'Subject lines ficam clickbait', 'Volte a entregar valor real'],
            ['CTR baixo no YouTube', 'Thumbnails ficam exagerados', 'Foco em CTR + AVD juntos'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale a pena pagar Plausible/Fathom em vez de GA4 gratuito?"
          a={<>Para 90% dos casos, GA4 grátis é suficiente. Pague Plausible (US$9/mês) ou Fathom (US$15/mês) se: (1) prioridade é compliance LGPD/GDPR — Plausible/Fathom não usam cookies, não precisam de banner; (2) você valoriza simplicidade — interface 10x mais limpa que GA4; (3) site é orientado a privacidade dos visitantes (alinhamento com valores). Para análise técnica profunda (funis complexos, eventos custom), GA4 ainda lidera. Comece com GA4 grátis, migre depois se necessário.</>}
        />
        <QAItem
          q="Como saber se uma campanha de marketing pago vale a pena?"
          a={<>Equação simples: ROAS (Return on Ad Spend) = Receita gerada ÷ Gasto em ads. Sustentável: ROAS {'>'} 3x para produtos digitais (margem ~70%); {'>'} 4x para físicos. Considere também LTV/CAC: se ROAS é 2x mas o cliente compra 3x ao longo do tempo, é viável. Para começar: invista R$500-1k em test, meça por 2 semanas, decida se escala. Plataformas: Meta Ads (Facebook/Instagram) tem melhor segmentação. Google Ads tem melhor intenção. LinkedIn Ads para B2B premium. TikTok Ads para audiência jovem.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Vaidade ≠ Negócio. Likes não pagam contas; conversões pagam.
        Stack mínimo: GA4 ou Plausible + analytics nativos das redes + Microsoft Clarity. Acompanhe
        3 métricas: topo (alcance), meio (lista), fundo (receita) — não 20. North Star Metric única
        força foco. CAC vs LTV: se LTV/CAC {'>'} 3, canal é sustentável. Lei de Goodhart: métricas
        viram armadilhas quando viram meta cega. Dashboard semanal toda segunda mantém você no controle.
      </Callout>
    </div>
  );
}
