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

export const metadata = getModuleMetadata('marketing-email-newsletter');

const ACCENT = '#a78bfa';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que email/newsletter é considerado o canal de marketing mais valioso em 2026?',
    options: [
      'Porque tem custo zero — ferramentas são gratuitas',
      'Você é dono da lista — não depende de algoritmo de plataforma. ROI médio: US$36-42 por US$1 investido (DMA 2024). Open rate 25-45% vs 1-3% de redes sociais. E-mail vai direto para a caixa do leitor — quando ele decide ler',
      'Porque é o único canal restante após o fim das redes sociais',
      'Porque emails ranqueiam no Google',
    ],
    correct: 1,
    explanation:
      'Newsletter é o último canal "owned" — você possui o relacionamento direto. Instagram pode mudar algoritmo amanhã e zerar seu alcance. LinkedIn pode banir conta. Email é tecnologia distribuída — sua lista vai com você para qualquer ferramenta. Por isso criadores sérios em 2026 priorizam construir lista de email mesmo tendo grande presença nas redes. Métricas: 25-45% open rate (vs 1-3% no Insta), 3-8% click rate (muito alto vs outros canais).',
  },
  {
    question: 'Qual ferramenta de newsletter tem melhor custo-benefício para começar em 2026?',
    options: [
      'Mailchimp — sempre foi o padrão',
      'Beehiiv (gratuito até 2.500 assinantes) — interface moderna, monetização nativa via ads, e analytics avançadas. Substack se quer simplicidade total. ConvertKit/Kit (gratuito até 10k) se já tem audiência maior',
      'Apenas serviços pagos profissionais como Klaviyo',
      'Plataforma própria com SendGrid',
    ],
    correct: 1,
    explanation:
      'Beehiiv (beehiiv.com) emergiu como melhor opção em 2024-2025: gratuito até 2.500 assinantes, monetização nativa via ads boost (você pode vender ads em sua newsletter), templates modernos, analytics profundas, e referral program built-in. Substack é mais simples mas sem customização. ConvertKit/Kit é mais profissional para quem quer automações complexas. Mailchimp ficou caro e datado em 2026.',
  },
  {
    question: 'Como construir lista de assinantes do zero?',
    options: [
      'Pop-up agressivo no site pedindo email logo na entrada',
      'Lead magnet de valor real (e-book, template, mini-curso, planilha) em troca do email + landing page específica + redirecionar tráfego de redes sociais para a landing. 5-15% de conversão de visitante para assinante é meta saudável',
      'Comprar listas de email de fornecedores',
      'Apenas mencionar nas redes sociais sem incentivo',
    ],
    correct: 1,
    explanation:
      'Lead magnet = troca de valor: você dá algo útil, leitor dá email + permissão. Templates testados: "Guia completo de X" (PDF), "Template de Y" (Notion/Figma), "Mini-curso de Z" (5 emails), "Planilha de W". Conversion rate por contexto: 2-5% em homepage geral, 10-30% em landing page específica do lead magnet. Anti-padrão: pedir email "para receber novidades" — ninguém quer mais novidades. Padrão eficaz: "ganhe [coisa específica] em troca do email".',
  },
  {
    question: 'O que torna uma newsletter altamente engajada vs uma que perde assinantes?',
    options: [
      'Frequência alta de envio',
      'Voz pessoal e consistência. Newsletter eficaz parece email de amigo inteligente — não corporativa. Cadência regular (semanal ou quinzenal). 1 ideia central por edição. Open rate cresce quando assinante ANTECIPA seu email',
      'Designs visuais elaborados em cada email',
      'Subject lines com emojis e clickbait',
    ],
    correct: 1,
    explanation:
      'Newsletters que crescem têm: (1) voz humana e específica — assinante reconhece o estilo; (2) valor consistente em cada edição (1 ideia bem desenvolvida supera 5 superficiais); (3) cadência previsível (toda terça-feira, por exemplo); (4) subject line que promete valor específico, não clickbait; (5) chamada para ação clara e única. Anti-padrão comum: tentar ser "newsletter da empresa" em vez de "newsletter pessoal" — perde voz e fica esquecível.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="marketing-email-newsletter"
      title="Email & Newsletter: o canal de relacionamento mais valioso"
      icon="📧"
      xp={70}
      readTime={12}
      trailName="Marketing Digital"
      trailColor={ACCENT}
      nextSlug="marketing-metricas"
      nextTitle="Métricas que Importam: o que medir e ignorar"
      relatedSlugs={['marketing-conteudo-autoridade', 'marketing-personal-branding', 'empreend-curso-online']}
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
        Email não está morto — está mais vivo que nunca. Em 2026, com algoritmos das redes sociais
        cada vez mais imprevisíveis, profissionais sérios constroem audiência via email. ROI médio
        de US$36-42 por dólar investido. Esta aula mostra como criar newsletter que cresce, engaja
        e gera receita real.
      </p>

      <Section title="Plataformas: comparação direta para criadores 2026" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Plataforma', 'Free tier', 'Pago a partir', 'Para quem']}
          rows={[
            ['Beehiiv', '2.500 assinantes', 'US$39/mês', 'Padrão 2026 — moderna + monetização nativa'],
            ['Substack', 'Ilimitado', '10% das assinaturas pagas', 'Simplicidade + audience built-in'],
            ['ConvertKit/Kit', '10.000 assinantes', 'US$25/mês', 'Automação avançada para creators'],
            ['Buttondown', '100 assinantes', 'US$9/mês', 'Minimalista, dev-friendly, markdown'],
            ['Ghost', 'Self-host grátis', 'US$11/mês cloud', 'Site + newsletter integrados'],
            ['Mailchimp', '500 assinantes', 'US$13/mês', 'Datado em 2026 — evite'],
            ['MailerLite', '1.000 assinantes', 'US$9/mês', 'Boa relação custo-benefício para BR'],
          ]}
        />
        <Callout tone="info">
          <strong>Recomendação 2026:</strong> Comece com Beehiiv (grátis até 2.500). Migre para
          ConvertKit/Kit se cresce além e precisa de automações complexas. Substack se prefere
          simplicidade absoluta e quer aproveitar a audiência da plataforma (Substack Discover).
        </Callout>
      </Section>

      <Section title="Lead magnets que convertem (com exemplos)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Exemplo concreto', 'Tempo para criar']}
          rows={[
            ['Cheat Sheet (PDF)', '"Atalhos de Vim que economizam 1h/dia"', '2-4h'],
            ['Template (Notion/Figma)', '"Sistema de notas Zettelkasten para devs"', '4-8h'],
            ['Mini-curso (5 emails)', '"Aprenda Postgres em 5 dias"', '8-15h'],
            ['Planilha (Excel/Sheets)', '"Calculadora de freelance"', '4-8h'],
            ['Guia profundo (e-book)', '"Guia completo de carreira em backend"', '20-40h'],
            ['Vídeo gravado (workshop)', '"Workshop de 30min sobre X"', '4-8h'],
            ['Checklist específica', '"Checklist de code review profissional"', '2-3h'],
          ]}
        />
        <DecisionBox
          scenario="Criar primeiro lead magnet para começar lista de newsletter"
          winner="Cheat Sheet PDF de 5-10 páginas sobre tópico específico"
          winnerColor={ACCENT}
          why="Tempo de criação 2-4h. Valor percebido alto (PDF entregável). Fácil de promover. Específico ('atalhos para X' converte mais que 'guia completo de tudo'). Conversão típica: 15-25% em landing page específica vs 2-5% em homepage."
          alternatives={[
            { name: 'Mini-curso por email (5 dias)', note: 'Engagement maior — 5 toques na primeira semana criam hábito de abrir seus emails' },
            { name: 'Template/planilha', note: 'Para públicos práticos — alta conversão e usado constantemente, mantendo lembrança de você' },
          ]}
        />
      </Section>

      <Section title="Anatomia de newsletter de alta retenção" accent={ACCENT}>
        <CodeBlock lang="markdown">{`# Subject line (50-60 chars)
"O bug que custou R$200k em produção"

# Pre-header (preview no inbox, 100 chars)
"Como uma migration aparentemente simples
derrubou nossa API por 4 horas — e o que aprendemos"

# Abertura (2-3 linhas)
"Sexta-feira, 16h. O time está animado para começar
o final de semana. Mas a migration que vai pra prod
em 5 minutos vai mudar tudo."

# Corpo (1 ideia central, 600-1500 palavras)
[História + lições + framework aplicável]

# Take-aways (bullet pontual)
- Lição 1...
- Lição 2...
- Lição 3...

# Próxima edição (gancho)
"Na próxima terça: como evitar esse erro
com observabilidade básica."

# CTA único e claro
"Achou útil? Compartilhe com outro dev que precisa
saber: [link de share]"

# Assinatura humana
Abraços,
Fernando

PS — Responda este email se já viveu situação parecida.
Leio todas as respostas.`}</CodeBlock>
      </Section>

      <Section title="Crescimento de lista: do 0 a 1000 assinantes" accent={ACCENT}>
        <LayerStack
          title="Estratégias de growth para newsletter (em ordem)"
          accent={ACCENT}
          separatorLabel="adiciona próximo →"
          layers={[
            { label: 'Lead magnet em landing page', content: 'Página dedicada com promessa específica + form de email', note: 'fundação', tone: 'writable' },
            { label: 'CTAs nas redes sociais', content: 'Final de cada post: "ganhe [lead magnet] em [link na bio]"', tone: 'writable' },
            { label: 'Cross-promo com outros criadores', content: '"Eu indico newsletter X, fulano indica a minha"', tone: 'writable' },
            { label: 'Programas de referral', content: 'Beehiiv tem nativo: "indique 3 amigos = ganhe X"', tone: 'writable' },
            { label: 'Convidado em podcasts', content: 'Mencione newsletter como CTA — converte muito bem', tone: 'writable' },
            { label: 'Substack/Beehiiv Discover', content: 'Algoritmo da plataforma promove newsletters de qualidade', note: 'crescimento orgânico', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Métricas que importam (e as que não importam)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Métrica', 'O que medir', 'Meta saudável']}
          rows={[
            ['Open rate', '% que abre o email', '25-45% (boa) / 50%+ (excelente)'],
            ['Click rate', '% que clica em link', '2-5% (boa) / 7%+ (excelente)'],
            ['Reply rate', '% que responde', '0.5-2% — sinal forte de conexão'],
            ['Unsubscribe rate', '% que descadastra por edição', '< 0.5% (sustentável)'],
            ['Spam complaint', '% marcado como spam', '< 0.1% — acima disso, problemas'],
            ['Forward rate', '% que reencaminha', '0.5%+ é viral orgânico'],
            ['Growth rate', 'Novos assinantes/mês', '+10-30% MoM nos primeiros 12 meses'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso fazer email marketing para lista comprada ou raspada do LinkedIn?"
          a={<>Não. (1) Legalmente: LGPD no Brasil exige consentimento explícito — listas compradas violam isso e geram multa de 2% do faturamento (até R$50M). (2) Tecnicamente: sua reputação de remetente é destruída — emails vão direto para spam mesmo de assinantes legítimos. (3) Eticamente: isso é spam. Use apenas listas opt-in (pessoas que se inscreveram explicitamente). Construir orgânico leva mais tempo mas é sustentável e legal. ConvertKit, Beehiiv e similares banem contas que importam listas suspeitas.</>}
        />
        <QAItem
          q="Com que frequência enviar newsletter sem cansar a audiência?"
          a={<>Cadência ideal varia, mas regras gerais: (1) consistência {'>'} frequência — toda terça é melhor que "às vezes 3x/semana"; (2) semanal funciona para 90% dos casos — assinante cria hábito sem se sentir bombardeado; (3) quinzenal para conteúdo profundo onde semanal seria diluído; (4) diário só para conteúdo curto e específico (Daily.dev, Tldr). Anti-padrão: variar muito ("uma vez por mês ou quando der") — assinante esquece e abandona. Comece semanal, ajuste conforme feedback de open rates.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Email é o canal owned mais valioso — você não depende de algoritmo.
        ROI médio US$36-42 por dólar investido. Beehiiv é a plataforma padrão 2026 (grátis até 2.500).
        Lead magnet específico converte 5-10x mais que opt-in genérico. Open rate 25-45% saudável.
        Cadência consistente {'>'} alta frequência. Voz humana e específica é o que retém. LGPD é
        séria — apenas opt-in real. Reply rate {'>'} 1% é sinal de newsletter viva.
      </Callout>
    </div>
  );
}
