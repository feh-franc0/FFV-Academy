import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-situacoes-sociais');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'Americano pergunta "How are you?" de passagem. O que ele espera como resposta?',
    options: [
      'Uma resposta longa sobre como você está se sentindo',
      '"Good, thanks! How about you?" — é uma saudação social, não uma pergunta real sobre seu estado. A resposta deve ser curta e positiva, com retorno da pergunta.',
      '"I am feeling a bit tired actually, I have been very busy lately..."',
      '"Fine."',
    ],
    correct: 1,
    explanation:
      '"How are you?" nos EUA é funcionalmente equivalente a "oi" — é uma saudação, não uma pergunta genuína sobre seu bem-estar. A resposta padrão é curta: "Good, thanks! How about you?" ou "Pretty good! And you?" Responder com detalhes sobre sua vida vai surpreender o interlocutor.',
  },
  {
    question: 'Você está numa festa e não conhece ninguém. Qual é a melhor forma de se apresentar?',
    options: [
      'Esperar alguém te abordar',
      '"Hi! I\'m [nome]. How do you know [anfitrião]?" — se apresentar + pergunta sobre o contexto comum cria conversa imediatamente',
      '"Hello, I am [nome], I am from Brazil and I am here for tourism and I am learning English."',
      '"Nice party, right?" apenas',
    ],
    correct: 1,
    explanation:
      'A formula mais eficaz em festas americanas: nome + pergunta que estabelece contexto comum. "How do you know [anfitrião]?" abre conversa naturalmente — todo mundo tem uma resposta e isso gera tópico. Apresentações longas ou timidez prolongada tornam o social mais difícil.',
  },
  {
    question: 'Como recusar educadamente um convite que você não quer aceitar?',
    options: [
      '"No, I don\'t want to go."',
      '"That sounds fun, but I already have plans." ou "I wish I could, but I\'m not feeling well." — recusa educada com razão plausível, sem ferir sentimentos',
      '"Maybe." — e depois não aparecer',
      '"No thanks, that\'s not really my thing."',
    ],
    correct: 1,
    explanation:
      'A formula americana para recusa educada: expressão de interesse ("That sounds fun!") + razão curta ("but I already have plans" / "but I have a prior commitment") + alternativa opcional ("Maybe another time?"). "Maybe" sem intenção é considerado grosseiro porque cria expectativa falsa. Dizer "no" com razão plausível é mais respeitoso.',
  },
  {
    question: 'O que é "small talk" e por que é importante na cultura americana?',
    options: [
      'Conversa sobre assuntos sérios como política e religião',
      'Conversa superficial sobre clima, esportes, fim de semana — é a forma americana de estabelecer rapport antes de entrar em assuntos reais. Pular o small talk é visto como frio ou agressivo.',
      'Uma conversa curta de menos de 1 minuto',
      'Conversa apenas com desconhecidos — com amigos não é necessário',
    ],
    correct: 1,
    explanation:
      'Small talk é a cola social americana. Tópicos seguros: clima ("Nice weather today!"), fim de semana ("Did you have a good weekend?"), esportes ("Did you watch the game?"), trabalho ("How\'s work going?"). Evite: política, religião, renda, peso/aparência física. Brasileiros às vezes são vistos como "diretos demais" por pular o small talk — dominar isso muda como você é percebido.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-situacoes-sociais"
      title="Cenário: Situações Sociais e Fazer Amigos"
      icon="🤝"
      xp={70}
      readTime={18}
      trailName="Inglês para Brasileiros na Gringa"
      trailColor={ACCENT}
      nextSlug="cenario-telefone-atendimento"
      nextTitle="Cenário: Telefone, SAC e Atendimento ao Cliente"
      relatedSlugs={['cenario-trabalho-escritorio', 'ingles-1000-frases', 'cenario-transporte-direcoes']}
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
        O inglês social que os cursos ignoram: festas, small talk, perguntas que americanos fazem
        (e como responder), fazer amigos como adulto, entender humor e sarcasmo americano. Dominar
        as convenções sociais transforma a experiência na gringa de isolamento para conexão real.
      </p>

      <Section title="Saudações e small talk" accent={ACCENT}>
        <Callout tone="info">
          <strong>Regra cultural:</strong> "How are you?" nos EUA é uma saudação, não uma pergunta real.
          Responda sempre com algo positivo e curto, e retorne a pergunta. Iniciar reclamações após
          essa pergunta é culturalmente desconfortável — guarde para amigos próximos.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['"How are you?" (de passagem)', '"Good, thanks! How about you?" / "Pretty good! And you?"'],
            ['Clima como tópico', '"Nice weather today, isn\'t it?" / "Can you believe this rain?"'],
            ['Fim de semana', '"Did you have a good weekend?" / "Any fun plans for the weekend?"'],
            ['Esportes', '"Did you catch the game last night?" / "Are you a [time] fan?"'],
            ['Trabalho como tópico leve', '"How\'s work going?" / "Busy week?"'],
            ['Volta das férias', '"How was your vacation? Did you go anywhere fun?"'],
            ['Feriado recente', '"How was your Thanksgiving / Christmas?" (conforme a época)'],
            ['Elogio espontâneo', '"I love your shirt!" / "You look great!" — americanos dão elogios com frequência'],
            ['Responder elogio', '"Thank you, that\'s so kind!" / "Oh thanks, I appreciate that!"'],
            ['Encerrar conversa casual', '"Well, it was great talking to you! Enjoy your day!"'],
          ]}
        />
      </Section>

      <Section title="Apresentações e conhecer pessoas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Apresentar-se numa festa', '"Hi! I\'m [nome]. How do you know [anfitrião]?"'],
            ['Apresentar-se no trabalho', '"Hi, I\'m [nome]. I just started in [departamento]."'],
            ['Apresentar outra pessoa', '"This is my friend [nome]. We met through [contexto]."'],
            ['Perguntar de onde a pessoa é', '"Where are you from originally?" / "Are you from around here?"'],
            ['Explicar que é brasileiro', '"I\'m from Brazil. I\'ve been here for [tempo]."'],
            ['Perguntar o que faz', '"What do you do?" — frase padrão americana para profissão'],
            ['Responder o que faz', '"I\'m a [profissão]. I work in [área / empresa]."'],
            ['Mostrar interesse genuíno', '"That\'s interesting — what does that involve?"'],
            ['Trocar contato', '"It was great meeting you! Can I add you on LinkedIn?"'],
            ['Agendar encontro futuro', '"We should grab coffee sometime! What\'s the best way to reach you?"'],
          ]}
        />
      </Section>

      <Section title="Em festas e eventos sociais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Aceitar convite', '"That sounds great! I would love to come."'],
            ['Recusar convite educadamente', '"That sounds fun, but I already have plans. Maybe next time?"'],
            ['Confirmar horário e local', '"What time does it start? And what is the address?"'],
            ['Perguntar o que levar', '"Can I bring anything? Wine, snacks?"'],
            ['Chegar atrasado', '"Sorry I\'m late! Traffic was terrible." / "Thanks for having me!"'],
            ['Elogiar a festa / casa', '"You have a beautiful home!" / "This party is amazing!"'],
            ['Recusar bebida alcoólica', '"No thanks, I\'m good with water." — sem precisar dar explicações'],
            ['Pedidos alimentares especiais', '"I\'m vegetarian — is there anything without meat?"'],
            ['Sair da festa', '"I hate to leave, but I have an early morning. Thanks so much for having me!"'],
            ['Foto de grupo', '"Can we take a photo? Do you mind taking one of us?"'],
          ]}
        />
        <Callout tone="info">
          <strong>Pontualidade cultural:</strong> Em eventos americanos, "7 PM" geralmente significa
          7-7:30 PM. Em jantares, chegue 10-15 min depois da hora marcada. Em festas maiores, até
          30 min depois. Em eventos de trabalho ou cerimônias formais, chegue 5-10 min antes.
        </Callout>
      </Section>

      <Section title="Humor, sarcasmo e expressões idiomáticas sociais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Expressão', 'O que significa']}
          rows={[
            ['"I\'m just kidding!" / "Just joking!"', '"Estava brincando!" — americanos usam muito, não leve tudo a sério'],
            ['"No kidding!"', '"Sério mesmo?!" / "Que coisa!" — surpresa ou ênfase'],
            ['"Tell me about it."', '"Nem me fala." / Concordância intensa — não é pedido de explicação'],
            ['"Right?"', '"Né?" — pedindo confirmação ou concordância'],
            ['"You\'re telling me."', '"Você não precisa me dizer isso." / Concordância enfática'],
            ['"Tell me about it!" (com ênfase)', '"Nem me fala, eu sei demais disso!"'],
            ['"Give me a break."', '"Me deixa quieto." / "Que absurdo."'],
            ['"Are you serious right now?"', '"Você está falando sério?" — surpresa, às vezes irônico'],
            ['"That\'s what she said."', '"Foi o que ela disse." — piada de duplo sentido, sitcom humor'],
            ['"I can\'t even."', '"Eu não consigo nem..." — tão absurdo/engraçado que não tem palavras'],
          ]}
        />
        <Callout tone="warn">
          <strong>Sarcasmo americano:</strong> É comum e nem sempre óbvio. Se não tiver certeza se
          a pessoa está sendo séria, um simples "Wait, are you serious?" funciona sem constrangimento.
          Brasileiros às vezes tomam piadas a sério ou ficam em silêncio quando deveriam rir — ok
          dizer "I\'m still learning American humor!"
        </Callout>
      </Section>

      <Section title="Fazer amigos como adulto nos EUA" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Propor atividade', '"Would you be interested in [atividade] sometime?"'],
            ['Sugerir café', '"We should grab coffee / a drink sometime. Are you free this week?"'],
            ['Após encontro bem-sucedido', '"That was really fun. We should do this again!"'],
            ['Adicionar nas redes', '"I\'ll add you on Instagram / LinkedIn if that\'s okay."'],
            ['Mensagem após o encontro', '"Hey, it was great meeting you last night! That [tópico] you mentioned was really interesting."'],
            ['Convidar para grupo', '"A few of us are getting together on Saturday. Would you want to join?"'],
            ['Reagendar cancelamento', '"I\'m so sorry, I need to cancel. Can we do it next week instead?"'],
            ['Manter contato quando distante', '"Thinking of you! Hope everything is going well."'],
            ['Felicitar conquista', '"Congratulations on [conquista]! That is huge!"'],
            ['Oferecer ajuda', '"If you ever need anything while you\'re settling in, please reach out."'],
          ]}
        />
        <Callout tone="info">
          <strong>Realidade cultural:</strong> Americanos são amigáveis mas levam mais tempo para
          desenvolver amizades profundas do que brasileiros. A primeira camada (small talk, café) é
          fácil. A segunda camada (confiança, abertura) leva meses. Isso não é frieza — é ritmo
          cultural diferente. Seja consistente e proativo.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Por que americanos dizem 'We should hang out sometime' mas nunca marcam nada?"
          a={<>"We should hang out sometime" é frequentemente uma frase social de cortesia — equivalente ao "a gente tem que se encontrar" brasileiro que raramente se concretiza. Se você quer que aconteça, tome a iniciativa: "I would love that — are you free this Saturday?" Uma resposta concreta à proposta vaga é o que transforma intenção em plano real. Americanos geralmente respondem positivamente a quem toma a iniciativa.</>}
        />
        <QAItem
          q="Como lidar com perguntas que me deixam sem palavras?"
          a={<>Compre tempo com estas frases: "That's a good question — let me think." (boa pergunta, deixe-me pensar), "Hmm, I'm not sure how to put this..." (não tenho certeza como expressar isso), "How do I explain this..." (como explicar...). São completamente naturais em inglês e te dão 5-10 segundos para organizar os pensamentos. Silêncio prolongado é mais desconfortável do que essas frases de transição.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> "How are you?" é saudação — responda curto e positivo.
        Small talk: clima, fim de semana, esportes — nunca política ou religião com desconhecidos.
        Apresentação em festa: nome + "How do you know [anfitrião]?" Para recusar convite:
        "That sounds fun, but I already have plans." Para criar amizade: seja proativo — "We
        should grab coffee — are you free this week?"
      </Callout>
    </div>
  );
}
