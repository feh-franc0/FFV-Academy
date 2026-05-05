import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ingles-fase2-perguntas');

const ACCENT = '#22d3ee';

const quiz: QuizQuestion[] = [
  {
    question: 'Como traduzir "Ela trabalha aqui?" para o inglês?',
    options: [
      'She works here?',
      'Does she work here?',
      'Does she works here?',
      'Is she work here?',
    ],
    correct: 1,
    explanation:
      'Para perguntas no Present Simple com he/she/it, usa-se "Does" + sujeito + verbo no infinitivo (sem -s). O -s que estava em "works" vai para o does. "Does she work here?" é a forma correta.',
  },
  {
    question: 'Qual palavra interrogativa Wh- se usa para perguntar sobre lugar?',
    options: [
      'What',
      'Where',
      'When',
      'Which',
    ],
    correct: 1,
    explanation:
      '"Where" é usado para perguntar sobre lugar e localização. "What" = o quê/qual, "When" = quando, "Which" = qual (entre opções). Exemplos: "Where do you live?" (Onde você mora?), "Where is the bathroom?" (Onde fica o banheiro?).',
  },
  {
    question: 'Qual é a diferença entre "How many" e "How much"?',
    options: [
      'São sinônimos',
      '"How many" é para substantivos contáveis (people, books), "How much" é para não-contáveis (water, money)',
      '"How many" é formal, "how much" é informal',
      '"How much" é para tempo, "how many" é para quantidade',
    ],
    correct: 1,
    explanation:
      '"How many" + substantivo contável (How many students? How many books?). "How much" + substantivo não-contável (How much water? How much money?). "How much" também é usado para preço de forma geral: "How much is it?" (Quanto custa?)',
  },
  {
    question: 'Qual é a question tag correta para "You like pizza"?',
    options: [
      'isn\'t it?',
      'don\'t you?',
      'do you?',
      'aren\'t you?',
    ],
    correct: 1,
    explanation:
      'Question tags seguem a regra: frase no Present Simple com do → tag usa don\'t/doesn\'t. Frase afirmativa → tag negativa. "You like pizza, don\'t you?" (Você gosta de pizza, né?). Se fosse negativo: "You don\'t like pizza, do you?"',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ingles-fase2-perguntas"
      title="Fase 2 — Como fazer perguntas em inglês"
      icon="❓"
      xp={45}
      readTime={13}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="ingles-fase3-passado"
      nextTitle="Fase 3 — O passado em inglês"
      relatedSlugs={['ingles-fase1-pronomes-to-be', 'ingles-fase3-passado', 'ingles-fase6-preposicoes']}
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
        Fazer perguntas em inglês segue um padrão diferente do português. Enquanto em português podemos apenas subir
        o tom de voz ("Você trabalha aqui?"), em inglês é obrigatório usar auxiliares e inverter a ordem das palavras.
        Dominar esse padrão abre toda a conversação.
      </p>

      <Section title="Yes/No questions com To Be" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para perguntas de sim/não com o verbo To Be, basta <strong>inverter a posição</strong> do sujeito e do
          verbo. O verbo vai para antes do sujeito.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Afirmativo', 'Interrogativo', 'Tradução']}
          rows={[
            ['You are busy.', 'Are you busy?', 'Você está ocupado?'],
            ['She is a nurse.', 'Is she a nurse?', 'Ela é enfermeira?'],
            ['He is at home.', 'Is he at home?', 'Ele está em casa?'],
            ['They are ready.', 'Are they ready?', 'Eles estão prontos?'],
            ['It is expensive.', 'Is it expensive?', 'É caro?'],
            ['We are late.', 'Are we late?', 'Estamos atrasados?'],
            ['The store is open.', 'Is the store open?', 'A loja está aberta?'],
            ['Your friends are here.', 'Are your friends here?', 'Seus amigos estão aqui?'],
            ['The meeting is today.', 'Is the meeting today?', 'A reunião é hoje?'],
            ['You are from São Paulo.', 'Are you from São Paulo?', 'Você é de São Paulo?'],
          ]}
        />
      </Section>

      <Section title="Do / Does para o Present Simple" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para perguntas com verbos que não são To Be, usamos os auxiliares <InlineCode>do</InlineCode> e{' '}
          <InlineCode>does</InlineCode>. A regra de uso:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pronome', 'Auxiliar', 'Exemplo']}
          rows={[
            ['I', 'Do', 'Do I need to sign?'],
            ['You', 'Do', 'Do you live here?'],
            ['We', 'Do', 'Do we have a meeting?'],
            ['They', 'Do', 'Do they speak English?'],
            ['He', 'Does', 'Does he work here?'],
            ['She', 'Does', 'Does she like coffee?'],
            ['It', 'Does', 'Does it work?'],
          ]}
        />
        <Callout tone="warn">
          <strong>Regra crucial:</strong> quando usamos <InlineCode>does</InlineCode>, o verbo principal volta ao
          infinitivo (perde o -s). O "s" da 3ª pessoa foi "absorvido" pelo does.
          <br />
          <br />
          Afirmativo: She <strong>work</strong>s here. → Interrogativo: Does she <strong>work</strong> here? (não
          "works")
          <br />
          ❌ "Does she works here?" → ✅ "Does she work here?"
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Afirmativo', 'Interrogativo', 'Negativo', 'Tradução']}
          rows={[
            ['I work here.', 'Do I work here?', "I don't work here.", 'Eu trabalho aqui?'],
            ['You drink coffee.', 'Do you drink coffee?', "You don't drink coffee.", 'Você bebe café?'],
            ['She likes music.', 'Does she like music?', "She doesn't like music.", 'Ela gosta de música?'],
            ['He plays guitar.', 'Does he play guitar?', "He doesn't play guitar.", 'Ele toca violão?'],
            ['They live in Curitiba.', 'Do they live in Curitiba?', "They don't live in Curitiba.", 'Eles moram em Curitiba?'],
            ['It rains a lot here.', 'Does it rain a lot here?', "It doesn't rain a lot here.", 'Chove muito aqui?'],
            ['We study English.', 'Do we study English?', "We don't study English.", 'Nós estudamos inglês?'],
            ['She works on weekends.', 'Does she work on weekends?', "She doesn't work on weekends.", 'Ela trabalha nos fins de semana?'],
            ['He knows the answer.', 'Does he know the answer?', "He doesn't know the answer.", 'Ele sabe a resposta?'],
            ['You understand me.', 'Do you understand me?', "You don't understand me.", 'Você me entende?'],
          ]}
        />
      </Section>

      <Section title="Wh- Questions: as 7 palavras interrogativas" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          As palavras interrogativas Wh- são usadas para fazer perguntas abertas (não apenas sim/não). A estrutura é:{' '}
          <strong>Wh- word + auxiliar + sujeito + verbo</strong>.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Wh- word', 'Uso', 'Exemplo', 'Tradução']}
          rows={[
            ['What', 'O quê / Qual', 'What is your name?', 'Qual é o seu nome?'],
            ['Where', 'Onde / Aonde', 'Where do you live?', 'Onde você mora?'],
            ['When', 'Quando', 'When does the class start?', 'Quando a aula começa?'],
            ['Who', 'Quem', 'Who is your manager?', 'Quem é seu gerente?'],
            ['Why', 'Por quê', 'Why are you late?', 'Por que você está atrasado?'],
            ['Which', 'Qual (entre opções)', 'Which do you prefer?', 'Qual você prefere?'],
            ['How', 'Como / De que forma', 'How do you do that?', 'Como você faz isso?'],
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>Exemplos com cada palavra interrogativa:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pergunta', 'Tradução']}
          rows={[
            ['What do you do for a living?', 'O que você faz da vida? (profissão)'],
            ['What time is it?', 'Que horas são?'],
            ['Where is the nearest pharmacy?', 'Onde fica a farmácia mais próxima?'],
            ['Where did you grow up?', 'Onde você cresceu?'],
            ['When is your birthday?', 'Quando é seu aniversário?'],
            ['When do we leave?', 'Quando partimos?'],
            ['Who called you?', 'Quem te ligou?'],
            ['Who is responsible for this?', 'Quem é responsável por isso?'],
            ['Why does he look sad?', 'Por que ele parece triste?'],
            ['Why are you studying English?', 'Por que você está estudando inglês?'],
            ['Which option is better?', 'Qual opção é melhor?'],
            ['Which team do you support?', 'Qual time você torce?'],
            ['How do you spell that?', 'Como se soletra isso?'],
            ['How are you feeling?', 'Como você está se sentindo?'],
          ]}
        />
      </Section>

      <Section title="How + adjetivo: variações essenciais" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <InlineCode>How</InlineCode> combina com adjetivos e advérbios para criar perguntas muito específicas.
          Estas são algumas das mais usadas:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Expressão', 'Pergunta sobre', 'Exemplo', 'Tradução']}
          rows={[
            ['How much', 'Quantidade não-contável / preço', 'How much does it cost?', 'Quanto custa?'],
            ['How many', 'Quantidade contável', 'How many people are coming?', 'Quantas pessoas vêm?'],
            ['How long', 'Duração / comprimento', 'How long does it take?', 'Quanto tempo leva?'],
            ['How far', 'Distância', 'How far is the hotel?', 'Qual é a distância até o hotel?'],
            ['How often', 'Frequência', 'How often do you exercise?', 'Com que frequência você se exercita?'],
            ['How old', 'Idade', 'How old are you?', 'Quantos anos você tem?'],
            ['How tall', 'Altura', 'How tall is he?', 'Qual é a altura dele?'],
            ['How fast', 'Velocidade', 'How fast can you type?', 'Quão rápido você digita?'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Pergunta', 'Tradução']}
          rows={[
            ['How much water do you drink per day?', 'Quanta água você bebe por dia?'],
            ['How many languages do you speak?', 'Quantos idiomas você fala?'],
            ['How long have you lived here?', 'Há quanto tempo você mora aqui?'],
            ['How far is it from here to the center?', 'Qual é a distância daqui ao centro?'],
            ['How often do you travel?', 'Com que frequência você viaja?'],
            ['How old is your company?', 'Há quanto tempo existe sua empresa?'],
            ['How much time do we have?', 'Quanto tempo temos?'],
            ['How many hours do you sleep?', 'Quantas horas você dorme?'],
            ['How fast does it go?', 'Qual a velocidade máxima?'],
            ['How far can you run?', 'Qual distância você consegue correr?'],
            ['How long is the movie?', 'Qual é a duração do filme?'],
            ['How old is your car?', 'Qual o ano do seu carro?'],
          ]}
        />
      </Section>

      <Section title="Question tags: isn't it? don't you?" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Question tags são mini-perguntas adicionadas ao final de uma afirmação para pedir confirmação ou concordância.
          É equivalente ao "né?", "não é?", "certo?" do português.
        </p>
        <Callout tone="info">
          <strong>Regra básica:</strong> frase afirmativa → tag negativa. Frase negativa → tag positiva. A tag usa o
          mesmo auxiliar da frase principal.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Afirmação', 'Question tag', 'Tradução']}
          rows={[
            ["You work here,", "don't you?", 'Você trabalha aqui, né?'],
            ["She likes coffee,", "doesn't she?", 'Ela gosta de café, não é?'],
            ["They are Brazilian,", "aren't they?", 'Eles são brasileiros, não são?'],
            ["He isn't coming,", "is he?", 'Ele não está vindo, está?'],
            ["You don't smoke,", "do you?", 'Você não fuma, fuma?'],
            ["It's a great idea,", "isn't it?", 'É uma ótima ideia, não é?'],
            ["We can do this,", "can't we?", 'Nós podemos fazer isso, não podemos?'],
            ["She won't be late,", "will she?", 'Ela não vai se atrasar, vai?'],
          ]}
        />
      </Section>

      <Section title="50 perguntas essenciais para conversação" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Memorize estas perguntas — elas cobrem 80% das situações sociais e profissionais do dia a dia.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Português']}
          rows={[
            ['What is your name?', 'Qual é o seu nome?'],
            ['Where are you from?', 'De onde você é?'],
            ['How old are you?', 'Quantos anos você tem?'],
            ['What do you do for a living?', 'O que você faz da vida?'],
            ['Where do you work?', 'Onde você trabalha?'],
            ['Do you speak English?', 'Você fala inglês?'],
            ['How are you?', 'Como você está?'],
            ["How's it going?", 'Como vai?'],
            ['What time is it?', 'Que horas são?'],
            ['Where is the bathroom?', 'Onde fica o banheiro?'],
            ['Can you help me?', 'Você pode me ajudar?'],
            ['How much does it cost?', 'Quanto custa?'],
            ['What do you recommend?', 'O que você recomenda?'],
            ['Where can I find a taxi?', 'Onde posso encontrar um táxi?'],
            ['Do you have this in another size?', 'Você tem isso em outro tamanho?'],
            ['What are your working hours?', 'Qual é o seu horário de trabalho?'],
            ['Are you free tomorrow?', 'Você está livre amanhã?'],
            ['Can we reschedule?', 'Podemos remarcar?'],
            ['What is the WiFi password?', 'Qual é a senha do WiFi?'],
            ['How long does it take?', 'Quanto tempo leva?'],
            ['Where do you live?', 'Onde você mora?'],
            ['Do you like your job?', 'Você gosta do seu trabalho?'],
            ['What is your phone number?', 'Qual é o seu número de telefone?'],
            ['Can you speak more slowly?', 'Você pode falar mais devagar?'],
            ['What does that mean?', 'O que isso significa?'],
            ['Could you repeat that?', 'Você poderia repetir?'],
            ['Where are you going?', 'Para onde você vai?'],
            ['What are you doing?', 'O que você está fazendo?'],
            ['Are you married?', 'Você é casado(a)?'],
            ['Do you have children?', 'Você tem filhos?'],
            ['What kind of music do you like?', 'Que tipo de música você gosta?'],
            ['Have you been to Brazil?', 'Você já foi ao Brasil?'],
            ['What do you do in your free time?', 'O que você faz no seu tempo livre?'],
            ['Why are you learning English?', 'Por que você está aprendendo inglês?'],
            ['How did you get here?', 'Como você chegou aqui?'],
            ['What is the best way to get there?', 'Qual é a melhor forma de chegar lá?'],
            ['Is this seat taken?', 'Este lugar está ocupado?'],
            ['Do you mind if I sit here?', 'Você se importa se eu sentar aqui?'],
            ['What would you like to eat?', 'O que você gostaria de comer?'],
            ['Can I have the check, please?', 'Pode trazer a conta, por favor?'],
            ['What time does the store close?', 'A que horas a loja fecha?'],
            ['Is there a pharmacy nearby?', 'Há uma farmácia perto?'],
            ['Do you accept credit cards?', 'Vocês aceitam cartão de crédito?'],
            ['What is your email address?', 'Qual é o seu endereço de e-mail?'],
            ['Can you send me the file?', 'Você pode me enviar o arquivo?'],
            ['When is the deadline?', 'Qual é o prazo?'],
            ['Who is responsible for this?', 'Quem é responsável por isso?'],
            ['Why is this taking so long?', 'Por que isso está demorando tanto?'],
            ['What do you think?', 'O que você acha?'],
            ['Are you sure about that?', 'Você tem certeza disso?'],
          ]}
        />
      </Section>

      <Callout tone="success">
        <strong>Resumo da Fase 2.</strong> Yes/No questions com To Be: inverta sujeito e verbo. Present Simple com
        outros verbos: use Do/Does antes do sujeito (Does she work? — o verbo perde o -s). Wh- questions: What,
        Where, When, Who, Why, Which, How + auxiliar + sujeito + verbo. How + adjetivo: How much (incontável), How
        many (contável), How long (duração), How far (distância), How often (frequência). Question tags: frase
        positiva → tag negativa (don't you?). Com essas estruturas, você já consegue conduzir uma conversa básica.
      </Callout>
    </div>
  );
}
