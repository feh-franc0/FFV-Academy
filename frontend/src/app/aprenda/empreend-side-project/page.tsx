import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('empreend-side-project');

const ACCENT = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença crítica entre um side project que vira produto e um que morre na gaveta?',
    options: [
      'Tecnologia escolhida — projetos com tech moderna têm mais chance de sucesso',
      'Validação com usuários reais antes de construir features demais. Projetos que morrem na gaveta são construídos em segredo até estarem "perfeitos" — e nenhum usuário real os validou. Projetos que viram produto falam com usuários na semana 1',
      'Tempo dedicado — side projects sem dedicação de 20h/semana raramente evoluem',
      'Ter co-founder técnico — projetos solos raramente chegam a produto',
    ],
    correct: 1,
    explanation:
      'O ciclo de morte do side project: ideia → construir por meses → lançar → zero usuários → abandono. O ciclo de sucesso: ideia → conversar com 10 pessoas que teriam o problema → construir o mínimo para resolver UMA coisa → mostrar para esses 10 → iterar com feedback. A diferença está em quando você fala com usuários — antes ou depois de construir.',
  },
  {
    question: 'O que é um MVP e qual é o equívoco mais comum sobre ele?',
    options: [
      'MVP é a versão mais simples possível do produto — deve ter apenas o botão principal',
      'MVP (Minimum Viable Product) é o mínimo necessário para aprender se o produto resolve o problema. O equívoco: "mínimo" é sobre aprendizado, não sobre esforço mínimo. Um MVP pode ser uma planilha manual, uma landing page sem produto, ou uma call de vendas antes de construir qualquer coisa',
      'MVP deve ter todas as features principais, mas com design simples',
      'MVP é apenas para startups — side projects devem lançar já com produto completo',
    ],
    correct: 1,
    explanation:
      'O MVPs mais famosos: Airbnb começou com fotos de um apartamento e um site simples. Dropbox validou com um vídeo antes de construir o produto. No Brasil, muitos fundadores confundem MVP com "produto ruim" — na verdade MVP é a forma mais barata de validar a hipótese central do negócio. Para side project tech: a menor coisa que permite um usuário real ter o resultado prometido.',
  },
  {
    question: 'Como escolher em qual problema trabalhar no side project?',
    options: [
      'Problema com maior mercado potencial — TAM define o potencial de crescimento',
      'Problema que você mesmo tem, que outras pessoas claramente também têm, e que está disposto a explorar por 2+ anos — sustentabilidade vem de interesse genuíno, não de análise de mercado fria',
      'Problema sem concorrência — nichos sem players estabelecidos têm mais chance',
      'Problema mais fácil tecnicamente — começar rápido é mais importante que escolha',
    ],
    correct: 1,
    explanation:
      'Paul Graham chama de "solve your own problem" — você é o usuário mais acessível e honesto. Mas é necessário que outros também tenham o problema. Teste: identifique 10 pessoas com o mesmo problema. Se você não consegue encontrar 10 em 1 semana de busca, o problema pode ser muito nichado para sustentar um negócio. Se encontra 100 facilmente, há mercado real.',
  },
  {
    question: 'Como balancear side project com trabalho CLT sem se esgotar?',
    options: [
      'Trabalhar nos fins de semana inteiros e nas madrugadas — sacrifício total é necessário',
      'Definir blocos fixos e pequenos (1-2h/dia) em horários protegidos, ter meta semanal específica (não "trabalhar no projeto"), e aceitar progresso incremental — consistência de 10h/semana por 1 ano supera sprints de 50h/semana por 2 meses',
      'Só começar side project quando estiver desempregado ou ter muito tempo livre',
      'Trabalhar no projeto apenas nos fins de semana para proteger a semana de trabalho',
    ],
    correct: 1,
    explanation:
      'A armadilha do entusiasmo inicial: sprint intenso de 2 semanas → esgotamento → abandono. Sustentabilidade vem de rotina: 1h antes do trabalho ou 1.5h após jantar, 5 dias por semana = 7.5h/semana. Em 6 meses são 180h — suficiente para MVP e primeiros usuários. Meta semanal específica ("implementar autenticação" vs "trabalhar no projeto") mantém foco e sensação de progresso.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="empreend-side-project"
      title="Side Project: do código ao produto com usuários reais"
      icon="🚀"
      xp={70}
      readTime={12}
      trailName="Empreendedorismo Digital"
      trailColor={ACCENT}
      nextSlug="empreend-financas-digital"
      nextTitle="Finanças do Profissional Digital: MEI, impostos e investimento"
      relatedSlugs={['empreend-produtos-digitais', 'empreend-curso-online', 'carreira-freelance-br']}
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
        Side projects são o laboratório de experimentação mais valioso para profissionais digitais.
        Você aprende a construir produto, encontra clientes, e potencialmente cria uma renda alternativa
        — tudo com risco limitado por ter renda principal. Este módulo cobre o ciclo completo: da ideia
        ao primeiro usuário pagante.
      </p>

      <Section title="O ciclo de desenvolvimento de side project" accent={ACCENT}>
        <LayerStack
          title="Da ideia ao primeiro usuário pagante"
          accent={ACCENT}
          separatorLabel="valida antes de construir →"
          layers={[
            { label: 'Identificar o problema (semana 1)', content: 'Problema que você tem + outras 10 pessoas claramente têm', note: 'não pule esta etapa', tone: 'writable' },
            { label: 'Validar com conversas (semana 1-2)', content: 'Falar com 10 pessoas que têm o problema — entender a dor, não vender', tone: 'writable' },
            { label: 'MVP mínimo (semana 2-4)', content: 'Menor coisa que entrega o resultado principal — pode ser manual', tone: 'writable' },
            { label: 'Primeiros 5 usuários (semana 4-6)', content: 'Cobrar desde o início — pagamento valida que o problema é real', note: 'pode ser R$1 — o pagamento é o sinal', tone: 'writable' },
            { label: 'Iterar com feedback (contínuo)', content: 'Falar com usuários toda semana — construir o que eles pedem, não o que você acha', note: 'ciclo permanente', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Stack e ferramentas para side project solo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Categoria', 'Opção rápida', 'Por que']}
          rows={[
            ['Backend', 'Supabase ou PlanetScale', 'Auth, DB e API em horas — sem DevOps'],
            ['Frontend', 'Next.js + Vercel', 'Deploy em 1 comando, preview automático'],
            ['Pagamentos BR', 'Stripe ou PagSeguro', 'Stripe: melhor DX; PagSeguro: boleto/PIX nativo'],
            ['Email', 'Resend ou SendGrid', 'Resend: DX excelente para devs, free tier generoso'],
            ['Analytics', 'Plausible ou Umami', 'Simples, LGPD-friendly, não precisa de cookie banner'],
            ['Hospedagem', 'Vercel (front) + Railway (back)', 'Free tier suficiente para side project em crescimento'],
          ]}
        />
        <Callout tone="info">
          Para side project solo, otimize para velocidade de iteração, não para escala. Supabase +
          Next.js + Vercel permite ir do zero ao deploy em menos de 4 horas. Escale a infraestrutura
          quando o problema de scale se tornar real.
        </Callout>
      </Section>

      <Section title="Estratégia de go-to-market para side project" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Canal', 'Para quem', 'Como usar']}
          rows={[
            ['Comunidade do problema', 'Qualquer nicho', 'Participar primeiro, depois mostrar solução'],
            ['Product Hunt', 'Audiência tech global', 'Lançar às terças ou quartas, preparar com 2 semanas de antecedência'],
            ['Twitter/X build in public', 'Audiência tech', 'Documentar o processo de construção — cria audiência antes de lançar'],
            ['LinkedIn', 'Produto B2B', 'Content sobre o problema que o produto resolve'],
            ['Hacker News (Show HN)', 'Devs e early adopters', '"Show HN: construí X porque Y" — comunidade honesta'],
          ]}
        />
        <DecisionBox
          scenario="Lado oscuro: quando abandonar o side project vs quando persistir"
          winner="Abandone se não houver pagamento após 30 usuários experimentando"
          winnerColor={ACCENT}
          why="30 usuários reais que experimentaram o produto e zero pagantes é sinal claro de que o problema não é urgente o suficiente para pagar. Nesse ponto, pivotar ou abandonar é mais inteligente do que insistir. Se há pagantes mas poucos, o problema é distribuição — não o produto."
          alternatives={[
            { name: 'Pivotar o público-alvo', note: 'Mesmo produto, ICP diferente — às vezes o produto é certo mas o mercado errado' },
            { name: 'Pivotar o modelo', note: 'Grátis para B2C, pago para B2B com as mesmas features' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale registrar CNPJ ou marca antes de ter usuários pagantes?"
          a={<>Não. Registre CNPJ (MEI) quando começar a receber pagamentos. Registrar marca custa ~R$400-500 na INPI e leva 18-24 meses — faça isso quando o negócio tiver tração real. Antes disso, é custo e burocracia desnecessários. O que você deve fazer antes de ter clientes: validar que o problema existe e que pessoas pagariam. CNPJ e marca são detalhes operacionais, não validação de negócio.</>}
        />
        <QAItem
          q="Devo construir em público (build in public) desde o início?"
          a={<>Build in public tem prós e contras. Prós: cria audiência durante construção, gera feedback antecipado, cria accountability público. Contras: pode atrair cópia antes de ter produto no mercado, gera pressão de audiência que pode distorcer decisões de produto. Recomendação: comece a documentar no Twitter/X ou LinkedIn quando tiver primeiros usuários reais e feedback — antes disso, foque em construir e falar com usuários.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Fale com 10 pessoas que têm o problema antes de escrever código.
        MVP é sobre aprendizado, não sobre produto mínimo. Cobrar desde o início — pagamento valida
        o problema. 1-2h/dia consistentes superam sprints esporádicos de fim de semana. Abandone
        se 30 usuários experimentaram e zero pagaram. Stack para solo: Supabase + Next.js + Vercel.
        Build in public quando tiver usuários reais, não antes.
      </Callout>
    </div>
  );
}
