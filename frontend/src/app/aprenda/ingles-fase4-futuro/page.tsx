import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ingles-fase4-futuro');

const ACCENT = '#22d3ee';

const quiz: QuizQuestion[] = [
  {
    question:
      'Você olha pela janela, vê nuvens escuras e decide levar o guarda-chuva. Qual forma usar?',
    options: [
      "I'm going to take the umbrella (going to — plano feito antes)",
      "I'll take the umbrella (will — decisão espontânea baseada em evidência visual)",
      "I take the umbrella (presente simples)",
      "I would take the umbrella (condicional)",
    ],
    correct: 1,
    explanation:
      'Quando você vê uma evidência visual (nuvens escuras) e toma uma decisão na hora, usa-se "will" para a decisão espontânea. "Going to" seria mais adequado se você já tivesse planejado levar o guarda-chuva antes. Na prática, nessa situação ambos são aceitáveis, mas o instinto nativo é "will" para a decisão no momento.',
  },
  {
    question: 'Você planejou visitar seus pais no fim de semana passado. Qual forma usar?',
    options: [
      "I'll visit my parents this weekend",
      "I'm going to visit my parents this weekend",
      'I visit my parents this weekend',
      'I would visit my parents this weekend',
    ],
    correct: 1,
    explanation:
      '"Going to" é usado para planos feitos anteriormente à conversa. "I\'m going to visit my parents this weekend" indica que isso já estava decidido. "Will" seria para uma decisão tomada no momento da fala.',
  },
  {
    question: '"I\'m having dinner with Maria tomorrow" — que tipo de futuro é esse?',
    options: [
      'Will — decisão espontânea',
      'Present Continuous — agenda/compromisso marcado',
      'Going to — plano geral',
      'Simple Present — rotina',
    ],
    correct: 1,
    explanation:
      'O Present Continuous (am/is/are + -ing) é usado para expressar futuros já agendados — compromissos que têm hora e lugar definidos na sua agenda. "I\'m having dinner with Maria tomorrow" implica que o encontro está marcado, confirmado.',
  },
  {
    question: 'Qual é a forma negativa de "She will go to the concert"?',
    options: [
      "She will not going to the concert",
      "She won't go to the concert",
      "She doesn't will go to the concert",
      "She willn't go to the concert",
    ],
    correct: 1,
    explanation:
      'A negativa de "will" é "will not" ou a contração "won\'t" (pronuncia-se "wount"). "She won\'t go to the concert." A estrutura é sempre: sujeito + won\'t + verbo no infinitivo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ingles-fase4-futuro"
      title="Fase 4 — O futuro em inglês: will vs going to"
      icon="⏭️"
      xp={50}
      readTime={13}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="ingles-fase5-gerundio"
      nextTitle="Fase 5 — Gerúndio e formas -ing"
      relatedSlugs={['ingles-fase3-passado', 'ingles-fase5-gerundio', 'ingles-fase7-verbos-modais']}
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
        Em inglês existem três formas principais de expressar o futuro, e cada uma tem um uso distinto:{' '}
        <strong>will</strong> (decisão espontânea, previsão, promessa), <strong>going to</strong> (plano decidido,
        evidência visual) e <strong>present continuous</strong> (agenda/compromisso). Entender a diferença é o que
        separa o inglês travado do inglês natural.
      </p>

      <Section title="Will: decisão espontânea, previsão e promessa" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Estrutura:</strong> <InlineCode>will + infinitivo</InlineCode> (sem "to"). A forma é a mesma para
          todos os pronomes — sem -s na 3ª pessoa.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Uso', 'Situação', 'Exemplo', 'Tradução']}
          rows={[
            ['Decisão espontânea', 'Você decide na hora da conversa', "A: I'm hungry. B: I'll make a sandwich.", 'Vou fazer um sanduíche (agora que ouvi).'],
            ['Previsão sem evidência', 'Opinião, crença sobre o futuro', 'I think it will rain tomorrow.', 'Acho que vai chover amanhã.'],
            ['Promessa', 'Comprometimento com alguém', "I promise I'll call you back.", 'Prometo que vou te ligar de volta.'],
            ['Oferta', 'Oferecer ajuda espontaneamente', "I'll help you with that.", 'Vou te ajudar com isso.'],
            ['Ameaça / aviso', 'Consequência que você prevê', "If you do that, you'll regret it.", 'Se fizer isso, vai se arrepender.'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ["I'll have the pasta, please.", 'Vou querer o macarrão, por favor. (decisão no restaurante)'],
            ["Don't worry, I'll finish it today.", 'Não se preocupe, vou terminar hoje. (promessa)'],
            ["I think she'll like the gift.", 'Acho que ela vai gostar do presente. (previsão)'],
            ["I'll get the door.", 'Eu abro a porta. (oferta espontânea)'],
            ['It will be a great year.', 'Vai ser um ótimo ano. (previsão otimista)'],
            ["We'll figure it out.", 'A gente resolve. (confiança no futuro)'],
            ["She'll probably be late.", 'Ela provavelmente vai se atrasar. (previsão)'],
            ["I won't tell anyone.", 'Não vou contar para ninguém. (promessa negativa)'],
            ['Will you marry me?', 'Você vai casar comigo? (pedido/proposta)'],
            ["He won't change his mind.", 'Ele não vai mudar de ideia.'],
            ["Don't worry, it'll be fine.", 'Não se preocupe, vai ficar tudo bem.'],
            ["I'll be there at 8.", 'Estarei lá às 8.'],
          ]}
        />
      </Section>

      <Section title="Going to: plano decidido e evidência visual" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Estrutura:</strong>{' '}
          <InlineCode>am/is/are + going to + infinitivo</InlineCode>. Usado quando o plano já existia antes da conversa
          ou quando você vê uma evidência clara de algo que vai acontecer.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Uso', 'Situação', 'Exemplo', 'Tradução']}
          rows={[
            ['Plano anterior', 'Decisão tomada antes da conversa', "I'm going to visit my parents this weekend.", 'Vou visitar meus pais esse fim de semana (já planejei).'],
            ['Intenção firme', 'Algo que você decidiu fazer', "She's going to quit her job.", 'Ela vai pedir demissão (já decidiu).'],
            ['Evidência visual', 'Você vê sinais claros do que vai acontecer', "Look at those clouds — it's going to rain.", 'Olha essas nuvens — vai chover.'],
            ['Previsão com base', 'Baseado em tendência ou dado', 'Brazil is going to win.', 'O Brasil vai ganhar (baseado em algo).'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ["I'm going to start a new diet on Monday.", 'Vou começar uma nova dieta na segunda. (plano)'],
            ["She's going to have a baby.", 'Ela vai ter um bebê. (plano/evidência)'],
            ["They're going to buy a house.", 'Eles vão comprar uma casa. (intenção)'],
            ["He's going to fail if he doesn't study.", 'Ele vai reprovar se não estudar. (evidência)'],
            ["I'm not going to eat fast food anymore.", 'Não vou mais comer fast food. (decisão firme)'],
            ["We're going to need a bigger place.", 'Vamos precisar de um lugar maior. (evidência óbvia)'],
            ['Are you going to come to the party?', 'Você vai vir para a festa?'],
            ['Is she going to accept the offer?', 'Ela vai aceitar a oferta?'],
          ]}
        />
      </Section>

      <Section title="Will vs Going to: tabela de decisão" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'Will', 'Going to', 'Exemplo']}
          rows={[
            ['Decisão na hora', '✅', '❌', "A: We have no bread. B: I'll buy some."],
            ['Plano feito antes', '❌', '✅', "I'm going to visit my friend tomorrow."],
            ['Previsão sem evidência', '✅', '❌ (menos comum)', "I think she'll love it."],
            ['Previsão com evidência', '❌', '✅', "Look! It's going to fall!"],
            ['Promessa / oferta', '✅', '❌', "I'll help you, I promise."],
            ['Intenção firme', '❌ (menos comum)', '✅', "I'm going to lose 10kg this year."],
          ]}
        />
        <Callout tone="info">
          <strong>Regra mnemônica:</strong> pense em <strong>WILL</strong> como o pensamento do momento (você decide
          enquanto fala) e <strong>GOING TO</strong> como um plano que já estava na sua cabeça (você sabia antes de
          começar a conversa). Se você puder dizer "eu já tinha pensado nisso", use going to. Se a decisão nasceu
          agora, use will.
        </Callout>
        <p style={{ color: 'var(--ffv-muted)' }}>Exemplos ambíguos resolvidos:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Will ou Going to?', 'Por quê']}
          rows={[
            ["Don't worry. I'll help you.", 'Will', 'Oferta espontânea — você acabou de ouvir o problema'],
            ["I'm going to help you — I've been planning this.", 'Going to', 'Você planejou ajudar antes da conversa'],
            ['It will be cold tomorrow.', 'Will', 'Previsão/opinião sem evidência concreta agora'],
            ["Look at her run! She's going to win!", 'Going to', 'Evidência visual clara'],
            ["I'll see what I can do.", 'Will', 'Promessa/tentativa no momento'],
            ["I'm going to try something new.", 'Going to', 'Intenção firme já decidida'],
          ]}
        />
      </Section>

      <Section title="Present Continuous para futuro agendado" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O <strong>Present Continuous</strong> (<InlineCode>am/is/are + verb-ing</InlineCode>) também pode expressar
          o futuro quando se trata de um compromisso específico já marcado na agenda.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução', 'Observação']}
          rows={[
            ["I'm meeting John at 3pm tomorrow.", 'Vou encontrar o João amanhã às 15h.', 'Compromisso marcado'],
            ["She's flying to London next week.", 'Ela vai voar para Londres semana que vem.', 'Passagem comprada, confirmado'],
            ["We're having dinner with them on Friday.", 'Vamos jantar com eles na sexta.', 'Reserva feita'],
            ["They're getting married in June.", 'Eles vão se casar em junho.', 'Data marcada'],
            ["I'm starting a new job on Monday.", 'Começo num novo emprego na segunda.', 'Já assinado'],
            ["He's visiting his family next month.", 'Ele vai visitar a família mês que vem.', 'Planejado e confirmado'],
          ]}
        />
        <Callout tone="info">
          <strong>Dica prática:</strong> se você já sabe <em>quando</em> e <em>com quem</em> — algo está "na sua
          agenda" — o Present Continuous é a escolha mais natural. Expressões de tempo como{' '}
          <InlineCode>tonight</InlineCode>, <InlineCode>tomorrow</InlineCode>, <InlineCode>next week</InlineCode>,{' '}
          <InlineCode>on Monday</InlineCode> são pistas de que pode ser agenda.
        </Callout>
      </Section>

      <Section title="Negativa e perguntas com will" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Forma', 'Estrutura', 'Exemplo', 'Tradução']}
          rows={[
            ['Afirmativo', 'will + infinitivo', "I'll be there.", 'Estarei lá.'],
            ['Negativo', "won't + infinitivo", "I won't be there.", 'Não estarei lá.'],
            ['Interrogativo', 'Will + sujeito + infinitivo', 'Will you be there?', 'Você estará lá?'],
            ['Short answer sim', 'Yes, + pronome + will', 'Yes, I will.', 'Sim, estarei.'],
            ['Short answer não', 'No, + pronome + won\'t', "No, I won't.", 'Não, não estarei.'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ["She won't accept that.", 'Ela não vai aceitar isso.'],
            ["They won't be able to come.", 'Eles não vão poder vir.'],
            ['Will you help me?', 'Você vai me ajudar?'],
            ['Will she be at the meeting?', 'Ela vai estar na reunião?'],
            ["Will it take long? No, it won't.", 'Vai demorar? Não, não vai.'],
            ["I promise I won't forget.", 'Prometo que não vou esquecer.'],
          ]}
        />
      </Section>

      <Section title="Expressões de tempo do futuro" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Expressão', 'Tradução', 'Exemplo']}
          rows={[
            ['tomorrow', 'amanhã', "I'll call you tomorrow."],
            ['the day after tomorrow', 'depois de amanhã', "She's leaving the day after tomorrow."],
            ['tonight', 'esta noite', "We're going out tonight."],
            ['next week', 'semana que vem', "I'm going to start next week."],
            ['next month', 'mês que vem', "They'll move next month."],
            ['next year', 'ano que vem', "She's going to graduate next year."],
            ['in 2 hours', 'em 2 horas', "I'll be ready in 2 hours."],
            ['in a few days', 'em alguns dias', "He'll be back in a few days."],
            ['soon', 'em breve', "I'll finish soon."],
            ['later', 'mais tarde', "I'll do it later."],
            ['in the future', 'no futuro', "Things will be different in the future."],
            ['eventually', 'eventualmente', "She'll learn eventually."],
            ['by Monday', 'até segunda-feira', "I'll have it ready by Monday."],
            ['this weekend', 'esse fim de semana', "We're going to the beach this weekend."],
            ['at 3pm', 'às 15h', "The meeting will start at 3pm."],
          ]}
        />
      </Section>

      <Callout tone="success">
        <strong>Resumo da Fase 4.</strong> WILL: decisão na hora, previsão sem evidência, promessa, oferta. GOING TO:
        plano já decidido antes, evidência visual. PRESENT CONTINUOUS: agenda/compromisso marcado. Negativa de will:
        won't + infinitivo. Perguntas: Will + sujeito + infinitivo. Short answers: Yes, I will. / No, I won't. A
        chave é pensar: "eu já tinha esse plano?" (going to) ou "estou decidindo agora?" (will). Próximo: gerúndio e
        formas -ing — o -ing que aparece em tudo.
      </Callout>
    </div>
  );
}
