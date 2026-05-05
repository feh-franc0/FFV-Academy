import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ingles-fase3-passado');

const ACCENT = '#22d3ee';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o Simple Past do verbo "go"?',
    options: [
      'goed',
      'went',
      'gone',
      'goes',
    ],
    correct: 1,
    explanation:
      '"Go" é um verbo irregular: go / went / gone. O Simple Past é "went". "Gone" é o particípio passado (usado em Present Perfect: "I have gone"). "Goed" não existe — nunca adicione -ed a verbos irregulares.',
  },
  {
    question: 'Como negar corretamente "I went to school"?',
    options: [
      'I not went to school.',
      "I didn't go to school.",
      "I didn't went to school.",
      'I was not go to school.',
    ],
    correct: 1,
    explanation:
      'A negativa no Simple Past usa "did not" (didn\'t) + verbo no infinitivo. Quando "did" aparece, o verbo principal SEMPRE volta ao infinitivo: "I didn\'t GO" (não "went"). ❌ "I didn\'t went" é o erro mais comum.',
  },
  {
    question: 'Qual é o Simple Past de "study"?',
    options: [
      'studyed',
      'studied',
      'studed',
      'studying',
    ],
    correct: 1,
    explanation:
      'Verbos terminados em consoante + y: troca-se o -y por -ied. study → studied. Outros exemplos: try → tried, carry → carried. Mas se termina em vogal + y, apenas adiciona -ed: play → played, stay → stayed.',
  },
  {
    question: '"Did she work yesterday?" — qual é a resposta curta correta?',
    options: [
      'Yes, she did work.',
      'Yes, she did.',
      'Yes, she worked.',
      'Yes, did she.',
    ],
    correct: 1,
    explanation:
      'Short answers no Simple Past usam "did/didn\'t": "Yes, she did." ou "No, she didn\'t." Nunca se repete o verbo principal na resposta curta.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ingles-fase3-passado"
      title="Fase 3 — O passado em inglês (Simple Past)"
      icon="⏮️"
      xp={50}
      readTime={14}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="ingles-fase4-futuro"
      nextTitle="Fase 4 — O futuro em inglês"
      relatedSlugs={['ingles-fase2-perguntas', 'ingles-fase4-futuro', 'ingles-fase7-verbos-modais']}
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
        O <strong>Simple Past</strong> (passado simples) é usado para ações que aconteceram e terminaram no passado.
        Em inglês, a maioria dos verbos forma o passado adicionando <InlineCode>-ed</InlineCode>, mas há dezenas de
        verbos irregulares que precisam ser memorizados. Neste módulo você aprende os dois grupos e as regras de
        negativa e interrogativa.
      </p>

      <Section title="Simple Past: verbos regulares (-ed)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para a maioria dos verbos, o passado simples é formado adicionando <InlineCode>-ed</InlineCode> ao
          infinitivo. A forma é a <strong>mesma para todos os pronomes</strong> (sem -s na 3ª pessoa!).
        </p>
        <Callout tone="info">
          <strong>Regras ortográficas do -ed:</strong>
          <br />
          • Normal: add -ed → work → worked, play → played
          <br />
          • Termina em -e: só add -d → live → lived, like → liked
          <br />
          • CVC curto (consoante-vogal-consoante, sílaba tônica): dobra a última consoante → stop → stopped, plan →
          planned
          <br />
          • Termina em consoante + y: -y vira -ied → study → studied, try → tried
          <br />• Termina em vogal + y: só add -ed → play → played, stay → stayed
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Infinitivo', 'Simple Past', 'Tradução', 'Exemplo']}
          rows={[
            ['work', 'worked', 'trabalhar', 'I worked all day.'],
            ['play', 'played', 'jogar/tocar', 'She played guitar.'],
            ['watch', 'watched', 'assistir', 'We watched a movie.'],
            ['talk', 'talked', 'conversar', 'They talked for hours.'],
            ['walk', 'walked', 'caminhar', 'He walked to school.'],
            ['call', 'called', 'ligar', 'I called my mom.'],
            ['ask', 'asked', 'perguntar', 'She asked a question.'],
            ['help', 'helped', 'ajudar', 'He helped me a lot.'],
            ['want', 'wanted', 'querer', 'I wanted more time.'],
            ['live', 'lived', 'morar/viver', 'They lived in Paris.'],
            ['love', 'loved', 'amar', 'She loved that place.'],
            ['use', 'used', 'usar', 'We used the car.'],
            ['stop', 'stopped', 'parar', 'He stopped smoking.'],
            ['plan', 'planned', 'planejar', 'We planned a trip.'],
            ['run', 'ran', 'correr', '— (irregular, ver abaixo)'],
            ['study', 'studied', 'estudar', 'I studied hard.'],
            ['try', 'tried', 'tentar', 'She tried the dish.'],
            ['carry', 'carried', 'carregar', 'He carried the box.'],
            ['cook', 'cooked', 'cozinhar', 'She cooked dinner.'],
            ['clean', 'cleaned', 'limpar', 'We cleaned the house.'],
            ['open', 'opened', 'abrir', 'He opened the door.'],
            ['close', 'closed', 'fechar', 'She closed the window.'],
            ['start', 'started', 'começar', 'The class started late.'],
            ['finish', 'finished', 'terminar', 'I finished the project.'],
            ['move', 'moved', 'mover/mudar', 'We moved to a new city.'],
            ['visit', 'visited', 'visitar', 'They visited us.'],
            ['wait', 'waited', 'esperar', 'I waited for an hour.'],
            ['arrive', 'arrived', 'chegar', 'She arrived at noon.'],
            ['decide', 'decided', 'decidir', 'He decided to leave.'],
            ['happen', 'happened', 'acontecer', 'What happened?'],
          ]}
        />
      </Section>

      <Section title="Was / Were: To Be no passado" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O verbo To Be tem formas especiais no passado: <InlineCode>was</InlineCode> e <InlineCode>were</InlineCode>.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pronome', 'Passado', 'Negativa', 'Interrogativa']}
          rows={[
            ['I', 'was', "wasn't", 'Was I...?'],
            ['He', 'was', "wasn't", 'Was he...?'],
            ['She', 'was', "wasn't", 'Was she...?'],
            ['It', 'was', "wasn't", 'Was it...?'],
            ['You', 'were', "weren't", 'Were you...?'],
            ['We', 'were', "weren't", 'Were we...?'],
            ['They', 'were', "weren't", 'Were they...?'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Português']}
          rows={[
            ['I was at home yesterday.', 'Eu estava em casa ontem.'],
            ['She was a great teacher.', 'Ela era uma ótima professora.'],
            ['The movie was amazing.', 'O filme foi incrível.'],
            ['They were very tired.', 'Eles estavam muito cansados.'],
            ['We were in London in 2019.', 'Estávamos em Londres em 2019.'],
            ["It wasn't raining this morning.", 'Não estava chovendo esta manhã.'],
            ['Where were you last night?', 'Onde você estava ontem à noite?'],
            ['Was the food good?', 'A comida estava boa?'],
            ["I wasn't ready.", 'Eu não estava pronto.'],
            ['Were they at the party?', 'Eles estavam na festa?'],
          ]}
        />
      </Section>

      <Section title="Os 50 verbos irregulares mais usados" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Verbos irregulares não seguem o padrão -ed. Cada um tem sua forma própria. Estes são os 50 que mais
          aparecem no inglês cotidiano — aprenda 5 por dia em contexto.
        </p>
        <Callout tone="info">
          Estratégia: não tente memorizar a lista de uma só vez. Leia os exemplos em voz alta, crie frases pessoais e
          revise com espaçamento. Em 2 semanas de 5/dia, você tem todos.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Infinitivo', 'Simple Past', 'Particípio', 'Tradução']}
          rows={[
            ['be', 'was/were', 'been', 'ser/estar'],
            ['have', 'had', 'had', 'ter'],
            ['do', 'did', 'done', 'fazer'],
            ['say', 'said', 'said', 'dizer'],
            ['go', 'went', 'gone', 'ir'],
            ['get', 'got', 'gotten/got', 'pegar/ficar/obter'],
            ['make', 'made', 'made', 'fazer/criar'],
            ['know', 'knew', 'known', 'saber/conhecer'],
            ['think', 'thought', 'thought', 'pensar'],
            ['take', 'took', 'taken', 'pegar/levar'],
            ['see', 'saw', 'seen', 'ver'],
            ['come', 'came', 'come', 'vir'],
            ['want', 'wanted', 'wanted', 'querer (regular)'],
            ['look', 'looked', 'looked', 'olhar (regular)'],
            ['use', 'used', 'used', 'usar (regular)'],
            ['find', 'found', 'found', 'encontrar'],
            ['give', 'gave', 'given', 'dar'],
            ['tell', 'told', 'told', 'contar/dizer'],
            ['feel', 'felt', 'felt', 'sentir'],
            ['become', 'became', 'become', 'tornar-se'],
            ['leave', 'left', 'left', 'partir/sair/deixar'],
            ['put', 'put', 'put', 'colocar'],
            ['mean', 'meant', 'meant', 'significar/querer dizer'],
            ['keep', 'kept', 'kept', 'manter/guardar'],
            ['let', 'let', 'let', 'deixar/permitir'],
            ['begin', 'began', 'begun', 'começar'],
            ['show', 'showed', 'shown', 'mostrar'],
            ['hear', 'heard', 'heard', 'ouvir'],
            ['run', 'ran', 'run', 'correr'],
            ['bring', 'brought', 'brought', 'trazer'],
            ['write', 'wrote', 'written', 'escrever'],
            ['sit', 'sat', 'sat', 'sentar'],
            ['stand', 'stood', 'stood', 'ficar de pé'],
            ['lose', 'lost', 'lost', 'perder'],
            ['pay', 'paid', 'paid', 'pagar'],
            ['meet', 'met', 'met', 'encontrar/conhecer'],
            ['read', 'read', 'read', 'ler (pron. "red" no passado)'],
            ['build', 'built', 'built', 'construir'],
            ['fall', 'fell', 'fallen', 'cair'],
            ['cut', 'cut', 'cut', 'cortar'],
            ['sell', 'sold', 'sold', 'vender'],
            ['speak', 'spoke', 'spoken', 'falar'],
            ['spend', 'spent', 'spent', 'gastar/passar (tempo)'],
            ['send', 'sent', 'sent', 'enviar'],
            ['drive', 'drove', 'driven', 'dirigir'],
            ['buy', 'bought', 'bought', 'comprar'],
            ['grow', 'grew', 'grown', 'crescer'],
            ['break', 'broke', 'broken', 'quebrar'],
            ['choose', 'chose', 'chosen', 'escolher'],
            ['catch', 'caught', 'caught', 'pegar/capturar'],
          ]}
        />
      </Section>

      <Section title="Negativa e interrogativa no Simple Past" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para negar e perguntar no Simple Past (com verbos que não são To Be), usamos o auxiliar{' '}
          <InlineCode>did</InlineCode>. A regra mais importante: quando <strong>did</strong> aparece, o verbo
          principal <strong>sempre volta ao infinitivo</strong>.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Afirmativo', 'Negativo', 'Interrogativo']}
          rows={[
            ['I went to the party.', "I didn't go to the party.", 'Did I go to the party?'],
            ['She called him.', "She didn't call him.", 'Did she call him?'],
            ['They won the game.', "They didn't win the game.", 'Did they win the game?'],
            ['He bought a car.', "He didn't buy a car.", 'Did he buy a car?'],
            ['We saw the movie.', "We didn't see the movie.", 'Did we see the movie?'],
            ['You knew the answer.', "You didn't know the answer.", 'Did you know the answer?'],
          ]}
        />
        <Callout tone="warn">
          <strong>O erro mais comum do mundo:</strong> ❌ "Did you went?" → ✅ "Did you go?" — com "did", o verbo
          SEMPRE fica no infinitivo. O "did" já marca o tempo passado, então o verbo não precisa também ser passado.
          <br />
          <br />
          ❌ "I didn't went" → ✅ "I didn't go"
          <br />
          ❌ "Did she bought?" → ✅ "Did she buy?"
        </Callout>
      </Section>

      <Section title="Expressões de tempo do passado" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Estas expressões de tempo ajudam a situar a ação no passado. Use-as para tornar suas frases mais completas.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Expressão', 'Tradução', 'Exemplo']}
          rows={[
            ['yesterday', 'ontem', 'I called you yesterday.'],
            ['last night', 'ontem à noite', 'We went out last night.'],
            ['last week', 'semana passada', 'She traveled last week.'],
            ['last month', 'mês passado', 'They moved last month.'],
            ['last year', 'ano passado', 'He graduated last year.'],
            ['two days ago', 'dois dias atrás', 'I saw him two days ago.'],
            ['a week ago', 'uma semana atrás', 'She called a week ago.'],
            ['in 2020', 'em 2020', 'We started the project in 2020.'],
            ['when I was young', 'quando eu era jovem', 'When I was young, I played soccer.'],
            ['in the morning', 'de manhã', 'It happened in the morning.'],
            ['the other day', 'outro dia', 'I saw her the other day.'],
            ['once', 'uma vez', 'I tried it once.'],
            ['at that time', 'naquela época', 'At that time, things were different.'],
            ['before', 'antes', 'I had never done that before.'],
            ['the day before yesterday', 'anteontem', 'He left the day before yesterday.'],
          ]}
        />
      </Section>

      <Section title="Micro-história para praticar" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Leia a história abaixo. Identifique todos os verbos no Simple Past e observe como verbos regulares e
          irregulares se misturam naturalmente.
        </p>
        <CodeBlock lang="text">{`Yesterday was a busy day for Ana.
Ontem foi um dia agitado para a Ana.

She woke up early and made coffee.
Ela acordou cedo e fez café.

Then she took the subway to work.
Depois ela pegou o metrô para o trabalho.

At the office, she had three meetings and wrote two reports.
No escritório, ela teve três reuniões e escreveu dois relatórios.

During lunch, she met a friend from college.
Durante o almoço, ela encontrou um amigo da faculdade.

They talked for a long time and laughed a lot.
Eles conversaram por muito tempo e riram bastante.

After work, she went to the gym and ran for 30 minutes.
Depois do trabalho, ela foi à academia e correu por 30 minutos.

When she got home, she cooked dinner and called her mother.
Quando chegou em casa, ela cozinhou o jantar e ligou para a mãe.

She read a few pages of her book before she fell asleep.
Ela leu algumas páginas do livro antes de adormecer.

It was a good day.
Foi um bom dia.`}</CodeBlock>
      </Section>

      <Callout tone="success">
        <strong>Resumo da Fase 3.</strong> Simple Past de verbos regulares: add -ed (com exceções ortográficas:
        live→lived, stop→stopped, study→studied). To Be no passado: I/He/She/It was; You/We/They were. Verbos
        irregulares: os 50 mais usados — aprenda em contexto. Negativa: didn't + infinitivo (nunca "didn't went").
        Interrogativa: Did + sujeito + infinitivo ("Did she go?"). Short answers: Yes, she did. / No, she didn't.
        Próximo: o futuro em inglês — will vs going to vs present continuous.
      </Callout>
    </div>
  );
}
