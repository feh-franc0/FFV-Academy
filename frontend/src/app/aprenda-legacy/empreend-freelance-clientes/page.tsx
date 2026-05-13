import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('empreend-freelance-clientes');

const ACCENT = '#fbbf24';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre prospecção ativa e inbound para freelas?',
    options: [
      'Prospecção ativa é ilegal no Brasil — apenas inbound é permitido',
      'Prospecção ativa: você vai até o cliente (mensagem direta, cold email, networking). Inbound: cliente vem até você (conteúdo, SEO, indicação). Iniciantes precisam de prospecção ativa; após 2 anos com conteúdo consistente, inbound supera ativa em qualidade de leads',
      'Inbound é mais eficaz para freelas iniciantes pois não exige relacionamento prévio',
      'São equivalentes — o canal não importa, apenas a qualidade do pitch',
    ],
    correct: 1,
    explanation:
      'Freelas que dependem exclusivamente de inbound ficam vulneráveis a sazonalidade. Os mais estáveis combinam: inbound de longo prazo (LinkedIn, conteúdo, SEO) + prospecção ativa para preencher lacunas de agenda. A proporção muda com o tempo: começo é 80% ativa / 20% inbound; depois de 2-3 anos de conteúdo consistente inverte para 20% ativa / 80% inbound.',
  },
  {
    question: 'O que é um "avatar de cliente ideal" e por que definir prejudica quem não define?',
    options: [
      'Um personagem fictício sem utilidade prática — foque nos clientes reais que aparecem',
      'Descrição específica do cliente que você quer atender: setor, porte, dores específicas, como decide comprar. Sem isso, você atrai qualquer cliente — inclusive os piores. Com isso, seu marketing, portfólio e pitch são cirúrgicos',
      'Apenas relevante para agências e não para freelas individuais',
      'Um template de proposta personalizado para cada tipo de cliente',
    ],
    correct: 1,
    explanation:
      'Freela sem ICP (Ideal Client Profile) pega todos os projetos que aparecem — incluindo os que pagam mal, atrasam pagamento, mudam escopo e consomem energia desproporcional. Com ICP definido, você reconhece o cliente ideal quando aparece e sabe recusar o que não encaixa. Critérios de ICP freela: setor que você domina ou quer dominar, porte (startup série B+ paga mais que pequeno negócio), ciclo de decisão curto, histórico de pagamento.',
  },
  {
    question: 'Como transformar cliente pontual em cliente recorrente?',
    options: [
      'Oferecer desconto em projetos futuros para fidelizar',
      'Ao final de cada projeto, identificar próxima necessidade do cliente e propor retainer ou projeto contínuo — manutenção, evolução, suporte. Custo de aquisição de cliente existente é zero; de novo cliente é alto',
      'Enviar newsletter mensal para clientes passados',
      'Recorrência não se aplica a freelas — é modelo de agência',
    ],
    correct: 1,
    explanation:
      'Retainer (contrato mensal fixo) é o Santo Graal do freela: receita previsível, custo de aquisição zero, e você fica dentro da empresa acompanhando novas necessidades. Pitch natural ao final de projeto: "Identifico que vocês vão precisar de X nos próximos meses — prefiro uma proposta de acompanhamento mensal ou me chamam projeto a projeto?" Frelas com 2+ retainers ativos têm stress de aquisição de cliente próximo de zero.',
  },
  {
    question: 'Como usar LinkedIn para gerar leads de clientes como freela?',
    options: [
      'Postar currículo e experiências profissionais regularmente',
      'Criar conteúdo sobre problemas que seus clientes ideais têm — não sobre o que você faz, mas sobre o que o cliente ganha. "3 erros em contrato de freela que custam R$10k/ano" atrai decisores que têm esse problema',
      'Enviar mensagem para todos os tomadores de decisão que você encontrar no LinkedIn',
      'LinkedIn não funciona para geração de clientes — foque em plataformas de freela',
    ],
    correct: 1,
    explanation:
      'Conteúdo orientado ao problema do cliente atrai quem tem aquele problema. "Desenvolvo sistemas em Go" não atrai cliente. "Como reduzir 80% do custo de infra de API com Go + caching estratégico" atrai CTOs e tech leads que têm problema de custo de infra. Esse conteúdo é também filtro de qualidade: quem lê e age é decisor com o problema que você resolve — lead quente sem cold outreach.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="empreend-freelance-clientes"
      title="Conseguir Clientes: atrair, converter e fidelizar como freela"
      icon="🎯"
      xp={70}
      readTime={12}
      trailName="Empreendedorismo Digital"
      trailColor={ACCENT}
      nextSlug="empreend-side-project"
      nextTitle="Side Project: do código ao produto com usuários"
      relatedSlugs={['carreira-freelance-br', 'marketing-personal-branding', 'comunicacao-networking']}
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
        Para freelas, o maior desafio não é a habilidade técnica — é a consistência de clientes. Quem
        depende de "esperar projeto aparecer" vive em montanha-russa de receita. Este módulo ensina
        como criar sistema de aquisição de clientes que funciona mesmo quando você está 100% ocupado
        com projetos atuais.
      </p>

      <Section title="Sistema de aquisição de clientes para freelas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Canal', 'Velocidade', 'Custo', 'Qualidade do lead']}
          rows={[
            ['Indicação de clientes atuais', 'Imediato', 'Zero', 'Muito alta'],
            ['Networking direto', 'Médio (1-4 semanas)', 'Tempo', 'Alta'],
            ['LinkedIn com conteúdo', 'Lento (3-6 meses)', 'Tempo', 'Alta — leads aquecem sozinhos'],
            ['Cold email personalizado', 'Rápido (1-2 semanas)', 'Baixo', 'Média'],
            ['Plataformas (Workana)', 'Imediato', 'Taxa da plataforma', 'Baixa — guerra de preço'],
            ['SEO/blog', 'Muito lento (6-12 meses)', 'Tempo', 'Alta — comprador já validado'],
          ]}
        />
        <Callout tone="info">
          <strong>Regra dos 30 dias vazios:</strong> toda vez que sua agenda tiver projeto por menos
          de 30 dias, ative prospecção ativa imediatamente — não espere o projeto terminar. Prospecção
          leva 2-4 semanas para converter. Começar quando já ficou sem projeto é tarde demais.
        </Callout>
      </Section>

      <Section title="Proposta e pitch que convertem" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Elemento', 'Proposta fraca', 'Proposta forte']}
          rows={[
            ['Abertura', '"Segue proposta conforme solicitado"', '"Entendi que vocês precisam de X porque Y impacta Z"'],
            ['Escopo', 'Lista de atividades', 'Entregáveis concretos com critério de aceite'],
            ['Preço', 'Valor único sem contexto', 'Três opções (básico/recomendado/premium) com diferença clara'],
            ['Prazo', '"Aproximadamente X semanas"', '"Início em DD/MM, entrega em DD/MM com marcos"'],
            ['Próximo passo', 'Nenhum', '"Para confirmar, preciso de aprovação e 50% upfront até DD/MM"'],
          ]}
        />
        <DecisionBox
          scenario="Freela sem clientes consistentes — como criar pipeline em 30 dias"
          winner="20 indicações pedidas + 10 cold emails personalizados + 1 post LinkedIn por dia"
          winnerColor={ACCENT}
          why="Combinação de canais quentes (indicação) e novos (LinkedIn) cobre velocidades diferentes. 20 indicações pedidas a clientes/ex-colegas gera 1-3 leads quentes em 1 semana. LinkedIn começa a gerar leads após 2-4 semanas de consistência."
          alternatives={[
            { name: 'Parceria com agência', note: 'Agências de desenvolvimento frequentemente precisam de devs como subcontratados — buscar agências locais' },
            { name: 'Desconto para ex-cliente', note: 'Reativar cliente antigo com proposta de novo projeto + 10% de desconto por fidelidade' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como lidar com cliente que quer negociar preço abaixo do seu mínimo?"
          a={<>Não reduza preço — reduza escopo. "Esse valor não consigo, mas por R$X posso entregar Y sem Z e W. Se o escopo completo for prioritário, o valor base é este." Isso mantém sua taxa horária implícita intacta e mostra profissionalismo. Se o cliente não aceitar nem a versão reduzida, o problema é orçamento, não você — e esse cliente provavelmente seria problemático durante o projeto. Clientes que não conseguem pagar seu mínimo não são seu mercado.</>}
        />
        <QAItem
          q="É melhor ter muitos clientes pequenos ou poucos clientes grandes?"
          a={<>Depende da fase. Começando: muitos clientes pequenos aceleram aprendizado, portfólio, e rede de indicações. Com mais experiência: 2-3 clientes grandes em retainer é mais eficiente (menos tempo de gestão, maior receita por hora, menor risco de calote). Regra: nenhum cliente deve representar mais de 40% da receita — isso protege de dependência e viés ao tomar decisões. O objetivo é ter 3-5 clientes médios em retainer que cobrem seus custos fixos, mais projetos pontuais para crescimento.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Sistema de aquisição: indicação (imediato) + LinkedIn com conteúdo
        (longo prazo) + prospecção ativa quando agenda está {'<'} 30 dias. Proposta com 3 opções converte
        melhor que preço único. Transforme projetos em retainers — custo zero de aquisição. Defina ICP
        e recuse clientes fora dele. Comece prospecção quando tem 30 dias de projeto — não quando ficou
        sem projeto.
      </Callout>
    </div>
  );
}
