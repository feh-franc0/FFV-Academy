import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ingles-fase6-preposicoes');

const ACCENT = '#22d3ee';

const quiz: QuizQuestion[] = [
  {
    question: 'Como dizer corretamente "Ela chegou ao Brasil"?',
    options: [
      'She arrived to Brazil.',
      'She arrived in Brazil.',
      'She arrived at Brazil.',
      'She arrived on Brazil.',
    ],
    correct: 1,
    explanation:
      'Com o verbo "arrive", usa-se "in" para cidades e países (lugares grandes): "She arrived in Brazil / in São Paulo." Usa-se "at" para locais específicos (edificações, pontos): "She arrived at the airport / at the hotel." ❌ "arrived to" é um erro clássico de falantes de português.',
  },
  {
    question: '"Vejo você na segunda-feira às 9h." — qual a preposição correta para cada parte?',
    options: [
      'in Monday at 9am',
      'on Monday at 9am',
      'at Monday on 9am',
      'in Monday in 9am',
    ],
    correct: 1,
    explanation:
      'Dias específicos usam "on": on Monday, on Friday, on Christmas Day. Horas exatas usam "at": at 9am, at noon, at midnight. "See you on Monday at 9am."',
  },
  {
    question: '"Eu moro aqui ___ 3 anos." — qual preposição usar?',
    options: [
      'since 3 years',
      'for 3 years',
      'during 3 years',
      'from 3 years',
    ],
    correct: 1,
    explanation:
      '"For" é usado com duração (um período de tempo): for 3 years, for 2 hours, for a long time. "Since" é usado com um ponto no tempo de início: since 2020, since Monday. "I have lived here for 3 years" (duração) vs "I have lived here since 2021" (ponto de início).',
  },
  {
    question: '"He is good ___ math." — qual preposição preenche o espaço?',
    options: [
      'in',
      'at',
      'for',
      'with',
    ],
    correct: 1,
    explanation:
      'A collocação correta é "good at + atividade/área": good at math, good at cooking, good at languages. Outros exemplos: bad at, terrible at, great at. "In" seria para "He has a degree in math" (área de estudo).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ingles-fase6-preposicoes"
      title="Fase 6 — Preposições essenciais em inglês"
      icon="📍"
      xp={45}
      readTime={12}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="ingles-fase7-verbos-modais"
      nextTitle="Fase 7 — Verbos modais"
      relatedSlugs={['ingles-fase5-gerundio', 'ingles-fase7-verbos-modais', 'ingles-fase2-perguntas']}
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
        Preposições são pequenas palavras com grande impacto. Em inglês, elas não seguem as mesmas regras do
        português — e por isso são fonte de muitos erros. Neste módulo você aprende as preposições de lugar e tempo
        mais usadas, os erros clássicos dos brasileiros e as combinações fixas (collocations) que todo falante
        intermediário precisa saber.
      </p>

      <Section title="In / On / At de lugar" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          As três preposições de lugar mais confusas — mas cada uma tem uma lógica clara:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Preposição', 'Uso', 'Exemplos']}
          rows={[
            ['IN', 'Espaços fechados, áreas grandes (país, cidade, bairro, cômodo)', 'in Brazil, in São Paulo, in the room, in the city center, in bed, in the car, in the box'],
            ['ON', 'Superfícies, linhas, meios de transporte públicos', 'on the table, on the wall, on the floor, on the street, on the bus, on the plane, on TV, on page 5'],
            ['AT', 'Pontos específicos, endereços, estabelecimentos como ponto de encontro', 'at the door, at the airport, at school, at home, at work, at the corner, at the top'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução', 'Preposição']}
          rows={[
            ['She is in Brazil.', 'Ela está no Brasil.', 'IN'],
            ['They live in Rio de Janeiro.', 'Eles moram no Rio de Janeiro.', 'IN'],
            ['The keys are in my bag.', 'As chaves estão na minha bolsa.', 'IN'],
            ['The book is on the desk.', 'O livro está na mesa.', 'ON'],
            ['There is a fly on the ceiling.', 'Há uma mosca no teto.', 'ON'],
            ["I'm on the bus right now.", 'Estou no ônibus agora.', 'ON'],
            ['Meet me at the entrance.', 'Me encontre na entrada.', 'AT'],
            ['She works at Google.', 'Ela trabalha no Google.', 'AT'],
            ['He is at home.', 'Ele está em casa.', 'AT'],
            ['I study at the university.', 'Estou estudando na universidade.', 'AT'],
            ["We're at the corner of Main Street.", 'Estamos na esquina da Main Street.', 'AT'],
            ['The cat is in the garden.', 'O gato está no jardim.', 'IN'],
            ['Put it on the shelf.', 'Coloque-o na prateleira.', 'ON'],
            ["Let's meet at the coffee shop.", 'Vamos nos encontrar no café.', 'AT'],
            ['She lives on the 3rd floor.', 'Ela mora no 3º andar.', 'ON'],
            ['He is in the office.', 'Ele está no escritório.', 'IN'],
            ['There is a note on the door.', 'Há um bilhete na porta.', 'ON'],
            ['The meeting is at the boardroom.', 'A reunião é na sala de reuniões.', 'AT'],
            ['They arrived in the city last night.', 'Eles chegaram à cidade ontem à noite.', 'IN'],
            ['Wait for me at the exit.', 'Espere por mim na saída.', 'AT'],
          ]}
        />
      </Section>

      <Section title="In / On / At de tempo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Preposição', 'Uso temporal', 'Exemplos']}
          rows={[
            ['IN', 'Períodos longos: meses, anos, estações, décadas, séculos, partes do dia', 'in January, in 2024, in summer, in the 21st century, in the morning, in the evening'],
            ['ON', 'Dias específicos: dias da semana, datas, feriados', 'on Monday, on June 5th, on my birthday, on Christmas Day, on New Year\'s Eve'],
            ['AT', 'Horas exatas e momentos específicos', "at 3pm, at noon, at midnight, at dawn, at night, at the moment, at Christmas (período)"],
          ]}
        />
        <Callout tone="info">
          <strong>Exceção AT night:</strong> "at night" (à noite, período escuro) usa AT. Mas "in the morning", "in
          the afternoon", "in the evening" usam IN. Pense: night é um ponto/momento, as outras partes do dia são
          períodos.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ['The meeting is at 2pm.', 'A reunião é às 14h.'],
            ['She was born in 1995.', 'Ela nasceu em 1995.'],
            ['I study in the morning.', 'Estudo de manhã.'],
            ['We met on a Friday.', 'Nos conhecemos numa sexta.'],
            ['Call me at noon.', 'Me ligue ao meio-dia.'],
            ['He works at night.', 'Ele trabalha à noite.'],
            ['The report is due on Monday.', 'O relatório vence na segunda.'],
            ['She graduated in June.', 'Ela se formou em junho.'],
            ['We travel in the summer.', 'Viajamos no verão.'],
            ['The store opens at 9am.', 'A loja abre às 9h.'],
          ]}
        />
      </Section>

      <Section title="For / Since / During / Ago" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Preposição', 'Uso', 'Exemplo', 'Tradução']}
          rows={[
            ['FOR', 'Duração de um período', 'I waited for 2 hours.', 'Esperei por 2 horas.'],
            ['SINCE', 'Ponto de início no tempo', 'I have lived here since 2020.', 'Moro aqui desde 2020.'],
            ['DURING', 'Ao longo de um período específico', 'I slept during the movie.', 'Dormi durante o filme.'],
            ['AGO', 'Tempo passado desde agora', 'She called 3 days ago.', 'Ela ligou há 3 dias.'],
          ]}
        />
        <Callout tone="info">
          <strong>For vs Since:</strong> FOR + período de tempo (for 3 years, for 2 hours). SINCE + ponto específico
          no tempo (since 2020, since Monday, since I was born). Since geralmente aparece com Present Perfect: "I
          have known her since 2015."
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ["I've been learning English for 2 years.", 'Estou aprendendo inglês há 2 anos.'],
            ["She's been working here since March.", 'Ela está trabalhando aqui desde março.'],
            ['They were quiet during the presentation.', 'Ficaram quietos durante a apresentação.'],
            ['I finished college 5 years ago.', 'Terminei a faculdade há 5 anos.'],
            ['We talked for hours.', 'Conversamos por horas.'],
            ['He has been sick since Monday.', 'Ele está doente desde segunda.'],
            ['I fell asleep during the lecture.', 'Adormeci durante a palestra.'],
            ['That happened a long time ago.', 'Isso aconteceu há muito tempo.'],
          ]}
        />
      </Section>

      <Section title="By / With / Without / About" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Preposição', 'Usos principais', 'Exemplos']}
          rows={[
            ['BY', 'Agente da ação; meio de transporte; prazo; proximidade', "written by Hemingway; by car/bus/plane; by Monday; sit by me"],
            ['WITH', 'Acompanhamento; instrumento; ingrediente', "come with me; write with a pen; coffee with milk; I agree with you"],
            ['WITHOUT', 'Ausência de algo/alguém', "without you; without money; don't do it without help"],
            ['ABOUT', 'Tema, assunto; aproximação', "talk about it; a book about history; about 50 people (aprox.)"],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ['This was created by a team.', 'Isso foi criado por uma equipe.'],
            ['She came by train.', 'Ela veio de trem.'],
            ['Please finish by Friday.', 'Por favor termine até sexta.'],
            ['He was sitting by the window.', 'Ele estava sentado perto da janela.'],
            ["I'll go with you.", 'Vou com você.'],
            ['She writes with her left hand.', 'Ela escreve com a mão esquerda.'],
            ["I can't do it without your help.", 'Não consigo fazer sem sua ajuda.'],
            ["Don't leave without saying goodbye.", 'Não vá embora sem se despedir.'],
            ["What is the movie about?", 'Sobre o que é o filme?'],
            ["There were about 200 people there.", 'Havia cerca de 200 pessoas lá.'],
          ]}
        />
      </Section>

      <Section title="Preposições com verbos e adjetivos (collocations)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em inglês, certas combinações verbo/adjetivo + preposição são fixas. Não há regra lógica — é preciso
          aprender como collocation (combinação). Estas são as mais importantes:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Combinação', 'Exemplo', 'Tradução']}
          rows={[
            ['interested IN', "I'm interested in learning.", 'Estou interessado em aprender.'],
            ['good AT', "She's good at math.", 'Ela é boa em matemática.'],
            ['afraid OF', "He's afraid of spiders.", 'Ele tem medo de aranhas.'],
            ['different FROM', 'English is different from Portuguese.', 'O inglês é diferente do português.'],
            ['depend ON', 'It depends on you.', 'Depende de você.'],
            ['look FOR', "I'm looking for my keys.", 'Estou procurando minhas chaves.'],
            ['wait FOR', "We're waiting for the bus.", 'Estamos esperando o ônibus.'],
            ['listen TO', 'Listen to me.', 'Me ouça.'],
            ['agree WITH', 'I agree with you.', 'Concordo com você.'],
            ['belong TO', 'This belongs to me.', 'Isso pertence a mim.'],
            ['apply FOR', 'She applied for the job.', 'Ela se candidatou para o emprego.'],
            ['responsible FOR', "I'm responsible for this.", 'Sou responsável por isso.'],
            ['proud OF', "I'm proud of you.", 'Estou orgulhoso de você.'],
            ['similar TO', "It's similar to that.", 'É parecido com aquilo.'],
            ['married TO', 'She is married to John.', 'Ela é casada com o John.'],
            ['worried ABOUT', "I'm worried about you.", 'Estou preocupado com você.'],
            ['think ABOUT', "I'm thinking about it.", 'Estou pensando nisso.'],
            ['talk ABOUT', 'Let\'s talk about it.', 'Vamos falar sobre isso.'],
            ['dream OF/ABOUT', 'I dream of traveling.', 'Sonho em viajar.'],
            ['congratulations ON', 'Congratulations on your promotion!', 'Parabéns pela promoção!'],
          ]}
        />
      </Section>

      <Section title="Os 10 erros mais comuns com preposições" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Errado ❌', 'Correto ✅', 'Explicação']}
          rows={[
            ['I arrived to Brazil.', 'I arrived in Brazil.', 'arrive + in (países e cidades), at (locais específicos)'],
            ['She is married with John.', 'She is married to John.', 'married TO (não with)'],
            ['Congratulations for your wedding.', 'Congratulations on your wedding.', 'congratulations ON (não for)'],
            ['Look at the mirror.', 'Look in the mirror.', 'Espelho: look IN (reflexo interno)'],
            ["Let's go to home.", "Let's go home.", 'home: sem preposição (go home, get home, arrive home)'],
            ['She depends of me.', 'She depends on me.', 'depend ON (não of)'],
            ["I'm different of you.", "I'm different from you.", 'different FROM (não of ou than)'],
            ['She is good in cooking.', 'She is good at cooking.', 'good AT (não in)'],
            ["I'm waiting you.", "I'm waiting for you.", 'wait FOR (sempre com for)'],
            ['Listen me!', 'Listen to me!', 'listen TO (sempre com to)'],
          ]}
        />
        <Callout tone="warn">
          <strong>Go home vs go to the park:</strong> "home" é uma das poucas palavras que vai sem preposição após
          verbos de movimento: go home, come home, arrive home, get home, drive home. Mas "at home" (estar em casa)
          usa preposição.
        </Callout>
      </Section>

      <Callout tone="success">
        <strong>Resumo da Fase 6.</strong> IN/ON/AT de lugar: IN para espaços fechados e grandes áreas, ON para
        superfícies, AT para pontos específicos. IN/ON/AT de tempo: IN para meses/anos/estações, ON para dias e
        datas, AT para horas. FOR para duração (for 3 years), SINCE para ponto de início (since 2020), DURING para ao
        longo de algo, AGO para tempo passado. Collocations: interested IN, good AT, afraid OF, different FROM,
        married TO. Erros clássicos: arrived in (não to), married to (não with), congratulations on (não for), go
        home (sem preposição). Próximo: verbos modais — can, could, should, must, will, would, may, might.
      </Callout>
    </div>
  );
}
