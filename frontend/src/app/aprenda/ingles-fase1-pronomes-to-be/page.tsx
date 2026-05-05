import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  InlineCode,
  ComparisonTable,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('ingles-fase1-pronomes-to-be');

const ACCENT = '#22d3ee';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a forma correta para "Ela é médica"?',
    options: [
      'She are a doctor',
      'She is a doctor',
      'She am a doctor',
      'Her is a doctor',
    ],
    correct: 1,
    explanation:
      'Com He/She/It, o verbo To Be é sempre "is". "She is a doctor" é a forma correta. "She are" e "She am" são erros muito comuns para falantes de português.',
  },
  {
    question: 'Como se nega corretamente "He is tired"?',
    options: [
      'He not is tired',
      'He is not tired / He isn\'t tired',
      'He are not tired',
      'He doesn\'t tired',
    ],
    correct: 1,
    explanation:
      'Para negar com To Be, basta adicionar "not" após o verbo: "He is not tired" ou a contração "He isn\'t tired". Nunca use "doesn\'t" com To Be — esse auxiliar é para outros verbos.',
  },
  {
    question: 'Para que serve o pronome "It" em inglês?',
    options: [
      'Somente para animais',
      'Para objetos, animais (gênero desconhecido) e fenômenos naturais como clima',
      'Para pessoas desconhecidas',
      'É sinônimo de "They"',
    ],
    correct: 1,
    explanation:
      '"It" é o pronome neutro em inglês. Usado para objetos (It is a book), animais cujo sexo é desconhecido (It is a dog), e fenômenos naturais (It is raining / It is hot). Quando o sexo do animal é conhecido, pode-se usar he/she.',
  },
  {
    question: '"Are you Brazilian?" — qual é a resposta curta correta?',
    options: [
      'Yes, I\'m.',
      'Yes, I am.',
      'Yes, you are.',
      'Yes, am I.',
    ],
    correct: 1,
    explanation:
      'Short answers com To Be repetem o auxiliar: "Yes, I am." (não se usa contração em respostas curtas afirmativas) ou "No, I\'m not." para negar. "Yes, I\'m." sozinho sem nada depois não é correto.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ingles-fase1-pronomes-to-be"
      title="Fase 1 — Pronomes pessoais e verbo To Be"
      icon="👤"
      xp={40}
      readTime={12}
      trailName="Inglês Prático"
      trailColor={ACCENT}
      nextSlug="ingles-fase2-perguntas"
      nextTitle="Fase 2 — Como fazer perguntas em inglês"
      relatedSlugs={['ingles-fase2-perguntas', 'ingles-fase3-passado', 'ingles-fase4-futuro']}
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
        Antes de qualquer coisa em inglês, você precisa dominar dois elementos: os <strong>pronomes pessoais</strong>{' '}
        (quem está fazendo a ação) e o verbo <strong>To Be</strong> (ser/estar). Com eles, você já consegue se
        apresentar, descrever pessoas e falar sobre o mundo ao redor. É a base de tudo.
      </p>

      <Section title="Os pronomes pessoais" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em inglês existem 7 pronomes pessoais de sujeito. Eles substituem os nomes e indicam quem realiza a ação.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pronome', 'Tradução', 'Observação']}
          rows={[
            ['I', 'Eu', 'Sempre maiúsculo em inglês'],
            ['You', 'Você / Vocês', '"You" serve tanto singular quanto plural'],
            ['He', 'Ele', 'Para pessoas e animais masculinos'],
            ['She', 'Ela', 'Para pessoas e animais femininos'],
            ['It', 'Isso / Ele / Ela (neutro)', 'Objetos, animais (sexo desconhecido), clima'],
            ['We', 'Nós', 'Inclui o falante'],
            ['They', 'Eles / Elas', 'Plural de he, she e it'],
          ]}
        />
        <Callout tone="info">
          <strong>Atenção com "You":</strong> diferente do português, o inglês não distingue "você" (singular) de
          "vocês" (plural) — ambos são <InlineCode>you</InlineCode>. O contexto indica o número. Também não existe
          mais o "thou" (arcaico) no inglês moderno.
        </Callout>
        <Callout tone="info">
          <strong>"It" para clima e fenômenos:</strong> em inglês, para falar de tempo e fenômenos naturais, usa-se
          obrigatoriamente "it": <InlineCode>It is raining</InlineCode> (Está chovendo),{' '}
          <InlineCode>It is hot today</InlineCode> (Está quente hoje). Em português não tem sujeito, mas em inglês sim.
        </Callout>
      </Section>

      <Section title="O verbo To Be: am / is / are" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O verbo <strong>To Be</strong> (ser/estar) tem três formas no presente: <InlineCode>am</InlineCode>,{' '}
          <InlineCode>is</InlineCode> e <InlineCode>are</InlineCode>. Cada pronome usa uma forma específica.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pronome', 'To Be', 'Contração', 'Exemplo']}
          rows={[
            ['I', 'am', "I'm", "I'm Fernando. (Eu sou o Fernando.)"],
            ['You', 'are', "You're", "You're a student. (Você é estudante.)"],
            ['He', 'is', "He's", "He's a doctor. (Ele é médico.)"],
            ['She', 'is', "She's", "She's from Brazil. (Ela é do Brasil.)"],
            ['It', 'is', "It's", "It's cold today. (Está frio hoje.)"],
            ['We', 'are', "We're", "We're engineers. (Nós somos engenheiros.)"],
            ['They', 'are', "They're", "They're happy. (Eles estão felizes.)"],
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Usos principais do To Be:</strong>
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Uso', 'Exemplo', 'Tradução']}
          rows={[
            ['Identificação (nome)', 'I am Fernando.', 'Eu sou o Fernando.'],
            ['Origem (nacionalidade)', 'She is Brazilian.', 'Ela é brasileira.'],
            ['Profissão', 'He is a developer.', 'Ele é desenvolvedor.'],
            ['Qualidade / adjetivo', "It's amazing!", 'É incrível!'],
            ['Estado emocional', "We're excited.", 'Estamos animados.'],
            ['Localização', "They're at home.", 'Eles estão em casa.'],
            ['Clima / temperatura', "It's raining.", 'Está chovendo.'],
          ]}
        />
      </Section>

      <Section title="Forma negativa: am not / isn't / aren't" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para negar com To Be, basta adicionar <InlineCode>not</InlineCode> após o verbo. Existem contrações para
          tornar a fala mais natural.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pronome', 'Forma negativa', 'Contração', 'Exemplo']}
          rows={[
            ['I', 'am not', "I'm not", "I'm not tired. (Não estou cansado.)"],
            ['You', 'are not', "aren't / you're not", "You aren't late. (Você não está atrasado.)"],
            ['He', 'is not', "isn't / he's not", "He isn't here. (Ele não está aqui.)"],
            ['She', 'is not', "isn't / she's not", "She isn't a teacher. (Ela não é professora.)"],
            ['It', 'is not', "isn't / it's not", "It isn't cold. (Não está frio.)"],
            ['We', 'are not', "aren't / we're not", "We aren't ready. (Nós não estamos prontos.)"],
            ['They', 'are not', "aren't / they're not", "They aren't Brazilian. (Eles não são brasileiros.)"],
          ]}
        />
        <Callout tone="warn">
          <strong>Atenção:</strong> <InlineCode>I'm not</InlineCode> NÃO tem contração alternativa — não existe{' '}
          <InlineCode>I amn't</InlineCode>. Apenas "I'm not" ou "I am not".
        </Callout>
        <p style={{ color: 'var(--ffv-muted)' }}>Exemplos práticos com tradução:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Português']}
          rows={[
            ["I'm not from São Paulo.", 'Não sou de São Paulo.'],
            ["You aren't a student here.", 'Você não é estudante aqui.'],
            ["He isn't married.", 'Ele não é casado.'],
            ["She isn't at work.", 'Ela não está no trabalho.'],
            ["It isn't broken.", 'Não está quebrado.'],
            ["We aren't ready yet.", 'Ainda não estamos prontos.'],
            ["They aren't coming.", 'Eles não estão vindo.'],
            ["The coffee isn't hot.", 'O café não está quente.'],
          ]}
        />
      </Section>

      <Section title="Forma interrogativa: perguntas com To Be" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para fazer perguntas com To Be, basta <strong>inverter a ordem</strong>: o verbo vem antes do sujeito.
          Diferente do português que pode subir o tom de voz, em inglês a inversão é obrigatória.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pergunta', 'Tradução', 'Resposta curta sim', 'Resposta curta não']}
          rows={[
            ['Am I late?', 'Estou atrasado?', 'Yes, you are.', "No, you aren't."],
            ['Are you Brazilian?', 'Você é brasileiro?', 'Yes, I am.', "No, I'm not."],
            ['Is he a doctor?', 'Ele é médico?', 'Yes, he is.', "No, he isn't."],
            ['Is she at home?', 'Ela está em casa?', 'Yes, she is.', "No, she isn't."],
            ['Is it raining?', 'Está chovendo?', 'Yes, it is.', "No, it isn't."],
            ['Are we late?', 'Estamos atrasados?', 'Yes, we are.', "No, we aren't."],
            ['Are they students?', 'Eles são estudantes?', 'Yes, they are.', "No, they aren't."],
            ['Is the meeting today?', 'A reunião é hoje?', 'Yes, it is.', "No, it isn't."],
          ]}
        />
        <Callout tone="info">
          <strong>Short answers (respostas curtas):</strong> em inglês é muito comum responder com apenas "Yes, I am"
          ou "No, I'm not" em vez de repetir a frase toda. Em respostas afirmativas curtas, NÃO se usa contração:{' '}
          <InlineCode>Yes, he is.</InlineCode> (nunca <InlineCode>Yes, he's.</InlineCode>)
        </Callout>
      </Section>

      <Section title="Praticando: 20 frases do dia a dia" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Veja como o To Be aparece em situações reais. Estude cada frase, preste atenção na estrutura e tente criar
          variações com seu próprio nome, profissão e cidade.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Inglês', 'Português']}
          rows={[
            ['My name is Ana.', 'Meu nome é Ana.'],
            ["I'm 28 years old.", 'Tenho 28 anos.'],
            ["I'm a software engineer.", 'Sou engenheira de software.'],
            ["I'm from Rio de Janeiro.", 'Sou do Rio de Janeiro.'],
            ["I'm not married.", 'Não sou casada.'],
            ["He's my brother.", 'Ele é meu irmão.'],
            ["She's very smart.", 'Ela é muito inteligente.'],
            ["They're my colleagues.", 'Eles são meus colegas.'],
            ["It's a beautiful day.", 'É um dia bonito.'],
            ["We're in a meeting.", 'Estamos em uma reunião.'],
            ["The coffee is ready.", 'O café está pronto.'],
            ["The office is on the 5th floor.", 'O escritório fica no 5º andar.'],
            ["Are you okay?", 'Você está bem?'],
            ["Is this your bag?", 'Esta é sua bolsa?'],
            ["Where are you from?", 'De onde você é?'],
            ["What is your name?", 'Qual é o seu nome?'],
            ["How old are you?", 'Quantos anos você tem?'],
            ["It's nice to meet you.", 'Prazer em conhecê-lo(a).'],
            ["I'm so tired today.", 'Estou muito cansado hoje.'],
            ["They are always on time.", 'Eles estão sempre no horário.'],
          ]}
        />
      </Section>

      <Section title="Erros comuns a evitar" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Errado ❌', 'Correto ✅', 'Por quê']}
          rows={[
            ['I is a student.', 'I am a student.', '"I" sempre usa "am"'],
            ['She are happy.', 'She is happy.', '"She" sempre usa "is"'],
            ['It are cold.', 'It is cold.', '"It" sempre usa "is"'],
            ['He are my friend.', 'He is my friend.', '"He" sempre usa "is"'],
            ['They is from Spain.', 'They are from Spain.', '"They" sempre usa "are"'],
            ['Are I late?', 'Am I late?', 'Pergunta com "I" usa "Am"'],
            ['Yes, he\'s.', 'Yes, he is.', 'Short answer afirmativa nunca usa contração'],
            ['I amn\'t ready.', "I'm not ready.", '"I am not" — não existe "amn\'t"'],
          ]}
        />
        <Callout tone="success">
          <strong>Mnemônico para memorizar:</strong> pense em "I AM the captain" (Eu SOU o capitão) — só "I" usa
          "am". Todos os outros: he/she/it usam "is", e you/we/they usam "are". Uma dica visual: <strong>am</strong>{' '}
          tem só <strong>1 letra de vogal no meio</strong> = só para 1 pronome (I). <strong>is</strong> = 1 sílaba =
          pronomes singulares (he/she/it). <strong>are</strong> = plural e you.
        </Callout>
      </Section>

      <Callout tone="success">
        <strong>Resumo da Fase 1.</strong> Pronomes: I, You, He, She, It, We, They. To Be presente: I am / You are /
        He-She-It is / We are / They are. Negativa: not após o verbo (isn't, aren't, am not). Interrogativa: inverte
        o verbo com o sujeito. Short answers: Yes/No + pronome + verbo (sem contração no afirmativo). Com isso você
        já consegue se apresentar, descrever pessoas, falar sobre o clima e responder perguntas básicas. Próximo:
        como fazer qualquer tipo de pergunta em inglês com do/does e as palavras interrogativas wh-.
      </Callout>
    </div>
  );
}
