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

export const metadata = getModuleMetadata('carreira-entrevista-br');

const ACCENT = '#34d399';

const quiz: QuizQuestion[] = [
  {
    question: 'Como responder "me fale sobre você" de forma eficaz em entrevista tech?',
    options: [
      'Contar a história completa desde a infância até hoje — contexto humano é valorizado',
      'Estrutura de 90 segundos: [especialidade e stack atual] + [maior conquista recente com resultado] + [por que esta empresa especificamente]. Termina com gancho que convida a próxima pergunta',
      'Repetir o currículo cronologicamente — a entrevistadora pode ter esquecido os detalhes',
      'Focar apenas em habilidades técnicas — RH prefere dados objetivos a narrativa',
    ],
    correct: 1,
    explanation:
      'A pergunta "me fale sobre você" é uma armadilha de tempo e foco. Respostas longas e cronológicas sinalizam falta de clareza sobre o que é relevante. A fórmula de 90 segundos: "Sou [especialidade] com foco em [stack/domínio]. No último projeto, [conquista específica com número]. Fiquei interessado nessa vaga porque [algo específico sobre a empresa/produto que você pesquisou]." Isso demonstra autoconhecimento, resultado, e pesquisa prévia.',
  },
  {
    question: 'O que é o método STAR e como usá-lo em perguntas comportamentais?',
    options: [
      'Star é uma framework de avaliação de candidatos — não é do candidato usar',
      'Situation (contexto), Task (o que você precisava fazer), Action (o que você especificamente fez), Result (resultado mensurável). Estrutura respostas a "me conta uma vez que você..." com clareza e impacto',
      'É apenas para perguntas sobre conflitos — para outras situações use resposta livre',
      'STAR é específico para entrevistas de gestão — devs devem focar em perguntas técnicas',
    ],
    correct: 1,
    explanation:
      'Perguntas comportamentais ("me conta uma vez que você enfrentou um conflito", "me dê um exemplo de uma decisão técnica difícil") são projetadas para prever comportamento futuro. Respostas sem estrutura perdem o ponto. Com STAR: você dá contexto suficiente (S), clareza sobre seu papel (T), detalhes do que você fez (A, não "nós fizemos"), e resultado concreto (R com número sempre que possível). Prepare 5-7 histórias STAR antes de qualquer processo seletivo.',
  },
  {
    question: 'Como performar bem em desafio técnico ao vivo (live coding)?',
    options: [
      'Focar em resolver o mais rápido possível — velocidade demonstra competência',
      'Pensar em voz alta antes de digitar: repetir o problema com suas palavras, perguntar sobre edge cases, propor solução em pseudocódigo antes de implementar — o processo de raciocínio é tão avaliado quanto a solução',
      'Pedir para usar Google ou Stack Overflow — demonstra como você trabalha no dia a dia',
      'Começar pela solução ótima imediatamente — soluções simples sinalizam inexperiência',
    ],
    correct: 1,
    explanation:
      'Live coding avalia raciocínio, não só resultado. Entrevistadores treinados preferem candidatos que verbalizam o pensamento mesmo que a solução final seja mais simples. Sequência ideal: (1) repetir o problema com suas palavras para confirmar entendimento; (2) perguntar sobre constraints e edge cases; (3) propor abordagem em pseudocódigo; (4) implementar; (5) testar com exemplos antes de declarar pronto. Silêncio total enquanto digita é o pior sinal — não há como avaliar o raciocínio.',
  },
  {
    question: 'Como negociar salário em oferta de emprego no Brasil?',
    options: [
      'Aceitar a primeira oferta — negociar pode fazer a empresa desistir do candidato',
      'Pesquisar mercado antes (Glassdoor, LinkedIn Salary, conversas com pares), dar um número 15-20% acima do mínimo aceitável, e justificar com valor específico — não com necessidade pessoal. A empresa raramente desiste de candidato aprovado por tentativa de negociação respeitosa',
      'Dizer que tem outras ofertas mesmo sem ter — cria urgência artificial',
      'Negociar apenas quando a oferta está abaixo da expectativa — se for boa, aceite logo',
    ],
    correct: 1,
    explanation:
      'Negociação salarial é esperada e profissional. Empresas raramente retiram oferta por negociação — se retirassem, seria red flag grave. Pesquisa de mercado é obrigatória: Glassdoor, LinkedIn Salary, e conversas com pares em empresas similares. A resposta padrão ao receber oferta: "Obrigado pela oferta. Com base na pesquisa de mercado e na minha experiência em [X específico], esperava [15-20% acima]. Vocês têm flexibilidade?" Silêncio estratégico após o número — não preencha.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="carreira-entrevista-br"
      title="Entrevistas no Brasil: como se preparar e performar em 2026"
      icon="🎤"
      xp={70}
      readTime={12}
      trailName="Carreira Digital"
      trailColor={ACCENT}
      nextSlug="carreira-portfolio-digital"
      nextTitle="Portfólio Digital: presença que abre portas"
      relatedSlugs={['carreira-vagas-br', 'carreira-crescimento-junior-senior', 'comunicacao-falar-em-publico']}
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
        Processo seletivo tech no Brasil evoluiu: vai além de algoritmos e inclui system design, perguntas
        comportamentais, e avaliação de fit cultural. Empresas como Nubank, iFood, e PicPay têm processos
        de 4-6 etapas. Este módulo mapeia cada etapa, as armadilhas mais comuns, e como chegar preparado
        para cada fase.
      </p>

      <Section title="Mapa do processo seletivo tech brasileiro" accent={ACCENT}>
        <LayerStack
          title="Etapas típicas de processo seletivo em empresa de produto BR"
          accent={ACCENT}
          separatorLabel="avança →"
          layers={[
            { label: 'Triagem (RH)', content: 'Fit básico: stack, nível, expectativa salarial, disponibilidade', note: 'filtro de 15-30min', tone: 'default' },
            { label: 'Desafio técnico', content: 'Take-home (2-4h) ou live coding. Código, clareza, testes', tone: 'writable' },
            { label: 'Entrevista técnica', content: 'Live coding + system design + perguntas sobre decisões técnicas passadas', tone: 'writable' },
            { label: 'Entrevista comportamental', content: 'Perguntas STAR: conflitos, liderança, falhas, tomada de decisão', tone: 'writable' },
            { label: 'Entrevista com gestor/CTO', content: 'Visão de produto/tecnologia, expectativas de nível, fit cultural', tone: 'writable' },
            { label: 'Oferta e negociação', content: 'Salário + benefícios + equity (startups) + posição exata', note: 'negocie sempre', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Preparação por tipo de entrevista" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'O que é avaliado', 'Como preparar']}
          rows={[
            ['Live coding', 'Raciocínio verbalizado, Edge cases, Clean code', 'LeetCode easy/medium, praticar pensar em voz alta'],
            ['System design', 'Trade-offs, escalabilidade, comunicação de arquitetura', 'Estudar casos (URL shortener, chat, feed) — Grokking'],
            ['Comportamental (STAR)', 'Situações reais de conflito, liderança, falha', '5-7 histórias preparadas cobrindo conflito, decisão difícil, falha, liderança'],
            ['Take-home', 'Qualidade de código, testes, documentação, decisões', 'README explicando decisões, testes unitários, código limpo'],
            ['Culture fit', 'Valores, forma de trabalhar, motivação real', 'Pesquise os valores da empresa e conecte com suas experiências'],
          ]}
        />
        <Callout tone="info">
          <strong>System design:</strong> estude os seguintes casos antes de qualquer processo sênior:
          URL shortener, feed de redes sociais, sistema de notificações, rate limiter, e armazenamento
          de arquivos. Esses cobrem 80% dos cenários comuns.
        </Callout>
      </Section>

      <Section title="Armadilhas comuns e como evitar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Armadilha', 'Impacto', 'Como evitar']}
          rows={[
            ['Falar mal do empregador anterior', 'Red flag imediato', '"Aprendi muito, mas busco X que essa empresa oferece"'],
            ['Não pesquisar a empresa', 'Sinal de desinteresse', 'Ler blog técnico + produto + últimas notícias antes da call'],
            ['Aceitar a primeira oferta', 'Deixa dinheiro na mesa', 'Sempre agradecer e pedir 24-48h — depois negocie'],
            ['Silêncio no live coding', 'Sem como avaliar raciocínio', 'Verbalizar cada etapa do pensamento, mesmo incompleto'],
            ['Não perguntar nada no final', 'Sinal de desengajamento', 'Prepare 3 perguntas sobre o trabalho real da equipe'],
          ]}
        />
        <DecisionBox
          scenario="Recebeu oferta mas tem outra empresa em processo — como gerenciar o timing"
          winner="Comunicação transparente e solicitar prazo específico"
          winnerColor={ACCENT}
          why="Pedir 5-7 dias úteis para decidir é profissional e esperado. Se a empresa não aguarda, ela não quer você — quer alguém disponível imediatamente. Usar a oferta como leverage com a outra empresa ('recebi oferta, tenho processo com vocês em andamento — conseguem acelerar?') acelera 70% dos processos."
          alternatives={[
            { name: 'Aceitar e continuar buscando', note: 'Antiético e arriscado — reputação no mercado BR é pequena' },
            { name: 'Recusar e esperar a outra', note: 'Só se a diferença for significativa e você tiver alta convicção' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como negociar quando a empresa pergunta 'qual é a sua expectativa salarial' logo no início?"
          a={<>Evite dar número primeiro quando possível: "Estou mapeando o mercado — o que a empresa tem em mente para esse nível?" Se pressionado, dê uma faixa baseada em pesquisa: "Com base na minha pesquisa de mercado para [nível] com [stack] em [cidade/remoto], estou olhando R$X a R$Y. Mas quero entender melhor o que a posição envolve antes de finalizar." Isso ancora a conversa sem comprometer você cedo demais.</>}
        />
        <QAItem
          q="Vale a pena pedir feedback depois de reprovar no processo?"
          a={<>Sempre vale pedir — no Brasil, empresas raramente dão feedback detalhado por receio legal, mas algumas (especialmente startups) dão. Formato da pergunta: "Obrigado pela oportunidade. Há algo específico que eu poderia melhorar para futuras oportunidades?" Feedback real quando vem é ouro para a preparação. E a empresa lembra de você positivamente para próximas vagas — muitos profissionais são contratados na segunda tentativa em empresas que admiram.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Prepare 5-7 histórias STAR antes de qualquer processo. Em live
        coding: verbalize o raciocínio antes de digitar. No comportamental: contexto + SUA ação + resultado
        com número. Pesquise a empresa — blog técnico, produto, valores. Negocie sempre: empresa raramente
        desiste de candidato aprovado por negociação respeitosa. Pergunte no final: demonstra engajamento
        e pesquisa.
      </Callout>
    </div>
  );
}
