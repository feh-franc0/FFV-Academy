import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ingles-fase5-gerundio');

const ACCENT = '#22d3ee';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a forma -ing correta de "swim"?',
    options: [
      'swiming',
      'swimming',
      'swimmed',
      'swims',
    ],
    correct: 1,
    explanation:
      '"Swim" segue a regra CVC (consoante-vogal-consoante) com sílaba tônica final: dobra-se a última consoante antes do -ing. swim → swimming. Outros exemplos: run → running, sit → sitting, begin → beginning.',
  },
  {
    question: 'Após o verbo "enjoy", o próximo verbo fica em qual forma?',
    options: [
      'Infinitivo com to (enjoy to swim)',
      'Forma -ing (enjoy swimming)',
      'Infinitivo sem to (enjoy swim)',
      'Passado (enjoy swam)',
    ],
    correct: 1,
    explanation:
      '"Enjoy" é um dos verbos que sempre pedem a forma -ing depois: enjoy swimming, enjoy cooking, enjoy reading. ❌ "I enjoy to swim" é incorreto. Outros verbos com o mesmo padrão: like, love, hate, finish, stop, mind, suggest.',
  },
  {
    question: '"He stopped smoking" vs "He stopped to smoke" — qual significa "ele parou de fumar"?',
    options: [
      'He stopped to smoke',
      'He stopped smoking',
      'Ambos significam a mesma coisa',
      'Nenhum dos dois',
    ],
    correct: 1,
    explanation:
      '"He stopped smoking" = ele parou de fumar (largou o hábito). "He stopped to smoke" = ele parou (o que estava fazendo) para fumar (uma pausa para acender um cigarro). Esta é uma das distinções mais importantes entre verb + -ing e verb + to infinitivo.',
  },
  {
    question: 'Por que não se diz "I am knowing the answer"?',
    options: [
      'Porque "know" é irregular',
      'Porque "know" é um stative verb — descreve estado mental, não ação em progresso',
      'Porque "am" não combina com -ing',
      'Porque seria "I am known"',
    ],
    correct: 1,
    explanation:
      '"Know" é um stative verb (verbo de estado) — descreve um estado mental, não uma ação acontecendo. Stative verbs geralmente não usam formas contínuas. ✅ "I know the answer". Outros statives: understand, believe, want, need, like, love, hate, see (estado), hear (estado).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ingles-fase5-gerundio"
      title="Fase 5 — Gerúndio e formas -ing"
      icon="🔄"
      xp={45}
      readTime={12}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="ingles-fase6-preposicoes"
      nextTitle="Fase 6 — Preposições essenciais"
      relatedSlugs={['ingles-fase4-futuro', 'ingles-fase6-preposicoes', 'ingles-fase2-perguntas']}
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
        O sufixo <strong>-ing</strong> é um dos mais versáteis do inglês. Aparece no Present Continuous (I am
        working), após certos verbos (I enjoy working), e como sujeito da frase (Working is fun). Entender quando e
        como usar o -ing elimina uma grande classe de erros.
      </p>

      <Section title="Present Continuous: ação acontecendo agora" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Estrutura:</strong> <InlineCode>am/is/are + verb-ing</InlineCode>. Usado para ações em progresso no
          momento da fala ou em um período atual (hoje, esta semana).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Marcador de tempo', 'Exemplo', 'Tradução']}
          rows={[
            ['now', "I'm studying now.", 'Estou estudando agora.'],
            ['right now', "She's calling right now.", 'Ela está ligando agora mesmo.'],
            ['at the moment', "He's working at the moment.", 'Ele está trabalhando no momento.'],
            ['currently', "We're currently hiring.", 'Estamos contratando atualmente.'],
            ['today', "I'm not feeling well today.", 'Não estou me sentindo bem hoje.'],
            ['this week', "She's traveling this week.", 'Ela está viajando esta semana.'],
            ['this year', "They're expanding this year.", 'Eles estão expandindo este ano.'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ["What are you doing?", 'O que você está fazendo?'],
            ["I'm reading a great book.", 'Estou lendo um livro ótimo.'],
            ["She's working from home today.", 'Ela está trabalhando de casa hoje.'],
            ["They're playing in the park.", 'Eles estão brincando no parque.'],
            ["It's raining outside.", 'Está chovendo lá fora.'],
            ["We're waiting for you!", 'Estamos esperando por você!'],
            ["He isn't listening.", 'Ele não está prestando atenção.'],
            ["Are you joking?", 'Você está brincando?'],
            ["The kids are sleeping.", 'As crianças estão dormindo.'],
            ["I'm not watching TV — I'm studying.", 'Não estou assistindo TV — estou estudando.'],
            ["She's getting better every day.", 'Ela está melhorando a cada dia.'],
            ["Look! It's starting to rain.", 'Olha! Está começando a chover.'],
            ["Why are you laughing?", 'Por que você está rindo?'],
            ["I'm trying my best.", 'Estou fazendo o meu melhor.'],
            ["He's growing so fast!", 'Ele está crescendo tão rápido!'],
          ]}
        />
      </Section>

      <Section title="Regras de formação do -ing" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Regra', 'Condição', 'Exemplos']}
          rows={[
            ['Add -ing normalmente', 'Maioria dos verbos', 'work→working, play→playing, talk→talking, read→reading'],
            ['Tira -e, add -ing', 'Verbo termina em -e', 'come→coming, make→making, live→living, have→having, write→writing'],
            ['Dobra consoante final', 'CVC curto (consoante-vogal-consoante), sílaba tônica', 'run→running, sit→sitting, swim→swimming, begin→beginning, stop→stopping'],
            ['Não dobra', 'CVC mas sílaba não é tônica final', 'open→opening, listen→listening, happen→happening'],
            ['-ie vira -ying', 'Verbo termina em -ie', 'lie→lying, die→dying, tie→tying'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Infinitivo', 'Forma -ing', 'Regra aplicada']}
          rows={[
            ['work', 'working', 'Normal'],
            ['play', 'playing', 'Normal'],
            ['come', 'coming', 'Tira -e'],
            ['make', 'making', 'Tira -e'],
            ['have', 'having', 'Tira -e'],
            ['write', 'writing', 'Tira -e'],
            ['run', 'running', 'Dobra (CVC tônico)'],
            ['sit', 'sitting', 'Dobra (CVC tônico)'],
            ['swim', 'swimming', 'Dobra (CVC tônico)'],
            ['begin', 'beginning', 'Dobra (última sílaba tônica)'],
            ['stop', 'stopping', 'Dobra (CVC tônico)'],
            ['plan', 'planning', 'Dobra (CVC tônico)'],
            ['open', 'opening', 'Não dobra (sílaba não tônica final)'],
            ['listen', 'listening', 'Não dobra'],
            ['lie', 'lying', '-ie → -ying'],
            ['die', 'dying', '-ie → -ying'],
            ['say', 'saying', 'Normal (vogal + y)'],
            ['buy', 'buying', 'Normal (vogal + y)'],
            ['go', 'going', 'Normal'],
            ['do', 'doing', 'Normal'],
            ['be', 'being', 'Normal'],
            ['eat', 'eating', 'Normal (termina em vogal-consoante-t, mas não CVC simples)'],
            ['walk', 'walking', 'Normal'],
            ['talk', 'talking', 'Normal'],
            ['learn', 'learning', 'Normal'],
            ['teach', 'teaching', 'Normal'],
            ['read', 'reading', 'Normal'],
            ['drive', 'driving', 'Tira -e'],
            ['ride', 'riding', 'Tira -e'],
            ['take', 'taking', 'Tira -e'],
          ]}
        />
      </Section>

      <Section title="Verb + gerúndio: verbos que sempre pedem -ing" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Após certos verbos, o próximo verbo <strong>sempre</strong> vem na forma -ing. Tente memorizar esses verbos
          em grupos.
        </p>
        <Callout tone="warn">
          ❌ "I enjoy to swim" → ✅ "I enjoy swimming"
          <br />
          ❌ "She finished to cook" → ✅ "She finished cooking"
          <br />
          ❌ "He suggested to go" → ✅ "He suggested going"
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Verbo', 'Exemplo com -ing', 'Tradução']}
          rows={[
            ['enjoy', 'I enjoy reading.', 'Eu gosto de ler.'],
            ['like', 'She likes swimming.', 'Ela gosta de nadar.'],
            ['love', 'He loves cooking.', 'Ele adora cozinhar.'],
            ['hate', 'I hate waking up early.', 'Odeio acordar cedo.'],
            ['finish', 'She finished working.', 'Ela terminou de trabalhar.'],
            ['stop', 'He stopped smoking.', 'Ele parou de fumar.'],
            ['suggest', 'I suggest trying again.', 'Sugiro tentar de novo.'],
            ['practice', 'She practices speaking English.', 'Ela pratica falar inglês.'],
            ['mind', "Do you mind waiting?", 'Você se importa em esperar?'],
            ['keep', 'Keep trying!', 'Continue tentando!'],
            ['avoid', 'She avoids eating sugar.', 'Ela evita comer açúcar.'],
            ['consider', "I'm considering changing jobs.", 'Estou considerando mudar de emprego.'],
            ['deny', 'He denied stealing it.', 'Ele negou ter roubado.'],
            ['imagine', 'Imagine living in Paris!', 'Imagine morar em Paris!'],
            ['miss', 'I miss living in São Paulo.', 'Sinto falta de morar em São Paulo.'],
            ["can't help", "I can't help laughing.", 'Não consigo deixar de rir.'],
            ['risk', 'Don\'t risk losing it.', 'Não arrisque perder.'],
            ['involve', 'The job involves traveling.', 'O trabalho envolve viajar.'],
            ['postpone', 'She postponed calling him.', 'Ela adiou ligar para ele.'],
            ['delay', "Don't delay starting.", 'Não adie começar.'],
          ]}
        />
      </Section>

      <Section title="Verb + to infinitivo vs verb + -ing" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Alguns verbos pedem <InlineCode>to + infinitivo</InlineCode> e outros pedem <InlineCode>-ing</InlineCode>.
          Alguns verbos mudam de significado dependendo da forma usada.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Verbos + to infinitivo', 'Exemplo', 'Tradução']}
          rows={[
            ['want', 'I want to go.', 'Quero ir.'],
            ['need', 'She needs to study.', 'Ela precisa estudar.'],
            ['decide', 'He decided to leave.', 'Ele decidiu partir.'],
            ['plan', "We're planning to move.", 'Planejamos nos mudar.'],
            ['hope', 'I hope to see you soon.', 'Espero ver você em breve.'],
            ['learn', 'She learned to drive.', 'Ela aprendeu a dirigir.'],
            ['manage', 'He managed to finish.', 'Ele conseguiu terminar.'],
            ['promise', 'I promise to help.', 'Prometo ajudar.'],
            ['refuse', 'She refused to sign.', 'Ela recusou assinar.'],
            ['seem', 'You seem to be tired.', 'Você parece estar cansado.'],
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Verbo', 'Com -ing', 'Com to infinitivo', 'Diferença']}
          rows={[
            ['stop', 'He stopped smoking. (parou de fumar)', 'He stopped to smoke. (parou para fumar)', 'Diferença de significado total'],
            ['remember', 'I remember seeing her. (lembro de ter visto)', 'Remember to call! (lembre-se de ligar)', 'Memória do passado vs obrigação futura'],
            ['forget', 'I forgot buying it. (esqueci que comprei)', "Don't forget to buy it. (não esqueça de comprar)", 'Esqueceu que fez vs esqueceu de fazer'],
            ['try', 'Try eating less sugar. (experimente comer menos)', 'Try to eat less. (tente comer menos)', 'Experimentar vs fazer esforço'],
            ['like', 'I like swimming. (gosto de nadar em geral)', "I'd like to swim now. (gostaria de nadar agora)", 'Gosto geral vs desejo específico'],
          ]}
        />
      </Section>

      <Section title="-ing como substantivo (sujeito da frase)" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em inglês, o gerúndio (-ing) pode funcionar como substantivo e ser o sujeito de uma frase. Em português,
          usaríamos o infinitivo ("Nadar é divertido"), mas em inglês o -ing é mais natural como sujeito.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Tradução']}
          rows={[
            ['Swimming is fun.', 'Nadar é divertido.'],
            ['Reading improves your vocabulary.', 'Ler melhora seu vocabulário.'],
            ['Learning English takes time.', 'Aprender inglês leva tempo.'],
            ['Traveling broadens the mind.', 'Viajar amplia a mente.'],
            ['Eating well is important.', 'Comer bem é importante.'],
            ['Running every day is challenging.', 'Correr todo dia é desafiador.'],
            ['Making mistakes is how you learn.', 'Errar é como se aprende.'],
            ['Waking up early is hard for me.', 'Acordar cedo é difícil pra mim.'],
            ['Cooking for others is a joy.', 'Cozinhar para os outros é uma alegria.'],
            ['Practicing speaking is essential.', 'Praticar a fala é essencial.'],
          ]}
        />
      </Section>

      <Section title="Stative verbs: verbos que NÃO usam -ing" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Stative verbs</strong> (verbos de estado) descrevem estados — sentimentos, percepções, posse,
          opiniões — não ações em progresso. Por isso, normalmente <strong>não se usam no continuous</strong>.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Categoria', 'Verbos', 'Exemplo correto']}
          rows={[
            ['Estado mental', 'know, understand, believe, think (opinião), remember, forget, mean', 'I know you. (não "I am knowing you")'],
            ['Emoção / desejo', 'want, need, like, love, hate, prefer, wish', 'She wants coffee. (não "she is wanting")'],
            ['Percepção (estado)', 'see, hear, smell, taste, feel (perceber)', 'It smells good. (não "it is smelling")'],
            ['Posse', 'have, own, belong, possess', 'They have a car. (não "they are having")'],
            ['Existência', 'be, exist, seem, appear, contain', 'He seems tired. (não "he is seeming")'],
          ]}
        />
        <Callout tone="info">
          <strong>Exceção importante:</strong> alguns stative verbs podem ser usados no continuous quando descrevem
          uma <em>ação</em>, não um estado.
          <br />
          <br />
          • "I have a car" (posse, estado) → correto
          <br />
          • "I'm having lunch" (ação de almoçar) → correto
          <br />
          • "She thinks it's wrong" (opinião) → correto
          <br />
          • "She's thinking about the problem" (processo de pensar, ação) → correto
          <br />
          • "I'm seeing a doctor tomorrow" (compromisso médico) → correto
          <br />• "I see the point" (entender, estado) → correto
        </Callout>
      </Section>

      <Callout tone="success">
        <strong>Resumo da Fase 5.</strong> Present Continuous: am/is/are + -ing para ações em progresso agora.
        Regras de formação: normal (-ing), tira -e (coming), dobra CVC (running), -ie→-ying (lying). Verb + -ing:
        enjoy, like, love, hate, finish, stop, mind, keep, avoid, consider. Verb + to: want, need, decide, plan,
        hope. Alguns verbos mudam de sentido: stop smoking vs stop to smoke. -ing como sujeito: "Swimming is fun".
        Stative verbs (know, want, need, love, believe) geralmente não usam -ing. Próximo: preposições — in, on, at,
        for, since, by, with e os erros que todo brasileiro comete.
      </Callout>
    </div>
  );
}
