import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, DecisionBox, QAItem, StackFlow } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Técnica Feynman: se não explica, não entendeu — FFV Academy',
  description: 'Técnica Feynman em 4 passos: explicar como se fosse pra criança, achar os buracos, simplificar, revisar. A ferramenta definitiva para expor o que você só acha que sabe.',
};

const ACCENT = '#3fb950';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o núcleo da Técnica Feynman?',
    options: [
      'Decorar definições técnicas até saber de cor',
      'Explicar o conceito em linguagem simples, como se fosse para uma criança ou leigo — e identificar onde você trava',
      'Ler o mesmo texto várias vezes com concentração',
      'Fazer resumos cada vez mais curtos até caber num post-it',
    ],
    correct: 1,
    explanation: 'A base é transformar jargão em linguagem comum. Se você precisa esconder atrás de termo técnico, não entendeu — só decorou. Onde a explicação trava é onde está o buraco no seu conhecimento.',
  },
  {
    question: 'Por que "explicar para uma criança" funciona melhor que "explicar para um colega da área"?',
    options: [
      'Porque crianças fazem menos perguntas',
      'Porque você não pode usar jargão como muleta — precisa reconstruir o conceito com palavras primitivas, expondo o modelo mental real',
      'Porque é mais rápido',
      'Porque a memória de curto prazo fica mais ativa',
    ],
    correct: 1,
    explanation: 'Explicar para um par permite usar termos como "regressão", "gradiente" ou "LLM" — o jargão cobre lacunas. Para uma criança, cada termo precisa virar analogia concreta. Se você não consegue, você não entende — você reconhece palavras.',
  },
  {
    question: 'Qual é o passo mais importante da Técnica Feynman?',
    options: [
      'Passo 1 (escolher o conceito)',
      'Passo 2 (tentar explicar em linguagem simples)',
      'Passo 3 (voltar pra fonte quando travar e achar a resposta)',
      'Passo 4 (simplificar ainda mais e usar analogia)',
    ],
    correct: 2,
    explanation: 'Os passos 1, 2 e 4 já existem em outras técnicas. O poder do Feynman está no passo 3: travar é informação de ouro — mostra onde está o buraco. Ir buscar exatamente aquilo (e só aquilo) é estudo cirúrgico, não leitura passiva.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="tecnica-feynman"
      title="Técnica Feynman: se não explica, não entendeu"
      icon="👨‍🏫"
      xp={40}
      readTime={7}
      trailName="Como Aprender"
      trailColor={ACCENT}
      nextSlug="interleaving"
      nextTitle="Interleaving: por que misturar tópicos é melhor"
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
        Richard Feynman ganhou o Nobel de Física em 1965 e era famoso por uma coisa estranha pra um gênio: explicar quântica como se estivesse no bar
        conversando com o vizinho. Ele dizia que <strong>se você não consegue explicar algo em palavras simples, você não entende</strong>. O que virou
        &ldquo;Técnica Feynman&rdquo; é o método que ele usava pra estudar qualquer coisa nova: <em>escolha um conceito, tente ensinar pra uma criança,
        identifique onde trava, volte pra fonte, simplifique</em>. Quatro passos. É a ferramenta mais honesta que existe — porque ela expõe implacavelmente
        o que você só <em>acha</em> que sabe.
      </p>

      <Section title="Os 4 passos, visualmente" accent={ACCENT}>
        <StackFlow
          title="O ciclo Feynman"
          accent={ACCENT}
          items={[
            {
              icon: '🎯',
              label: '1. ESCOLHE conceito',
              sub: '1 por vez',
              detail: 'Pegue um único conceito que você leu recentemente e acha que entendeu. Escopo pequeno: um tópico por ciclo.',
              connector: 'explica',
            },
            {
              icon: '🗣️',
              label: '2. EXPLICA',
              sub: 'voz alta ou papel',
              detail: 'Explique em palavras simples, como se fosse para uma criança de 10 anos. Proibido usar jargão que ela não entenderia.',
              connector: 'travou?',
            },
            {
              icon: '🕳️',
              label: '3. TRAVOU?',
              sub: 'diagnóstico',
              detail: 'Sim → volta à fonte, busca SÓ a parte que travou (estudo cirúrgico). Não → segue para o passo 4. Ficar no buraco é o trabalho real.',
              connector: 'simplifica',
            },
            {
              icon: '✨',
              label: '4. SIMPLIFICA',
              sub: 'analogia concreta',
              detail: 'Reescreve a explicação com analogia concreta (bloquinho de notas, receita de bolo, etc.). Repete até sair fluida e sem jargão.',
            },
          ]}
        />
        <Callout tone="info">
          Note: o passo 3 é onde quase ninguém tem coragem de ficar. A maioria tenta &ldquo;driblar&rdquo; o buraco mudando de palavra. <strong>Ficar no
          buraco é o trabalho real.</strong>
        </Callout>
      </Section>

      <Section title="Por que &ldquo;explicar pra criança&rdquo; é o truque central" accent={ACCENT}>
        <p>
          Cada área do conhecimento tem um dicionário próprio que funciona como atalho. Um engenheiro explica pra outro engenheiro e diz &ldquo;é só
          regressão logística com regularização L2&rdquo; — e todo mundo balança a cabeça. Mas nessa frase estão empacotados pelo menos 6 conceitos que o
          interlocutor presume já saber: o que é regressão, o que é probabilidade, o que é função de perda, o que é overfitting, o que significa
          penalizar peso, o que é norma L2. Se qualquer um deles for nebuloso, você nunca vai perceber — porque o jargão cobriu tudo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Explicando para...', 'O que acontece', 'Valor pra aprender']}
          rows={[
            ['Colega da área', 'Usa jargão, clichês, frases montadas', 'Baixo — você só reorganiza o que já sabe'],
            ['Pessoa leiga adulta', 'Usa analogias, mas ainda pula conceitos "óbvios"', 'Médio — pega alguns buracos'],
            ['Criança de 10 anos', 'Precisa construir do zero, todo termo vira palavra primitiva', 'Altíssimo — expõe TODOS os buracos'],
            ['Você mesmo do passado', 'Melhor dos dois mundos: honesto + exato', 'Alto e sustentável'],
          ]}
        />
        <Callout tone="warn">
          <strong>Armadilha:</strong> explicar mentalmente não conta — o cérebro pula buracos sem avisar. <strong>Fale em voz alta ou escreva.</strong> Só
          quando a explicação toma forma externa é que o buraco aparece.
        </Callout>
      </Section>

      <Section title="Exemplo prático: explicando &ldquo;KV Cache&rdquo;" accent={ACCENT}>
        <p>
          Suponha que você acabou de ler sobre KV Cache em LLMs. Sua cabeça acha que entendeu. Vamos aplicar Feynman:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tentativa', 'Resultado']}
          rows={[
            ['"KV Cache guarda keys e values do attention pra não recalcular"', '❌ Usou 3 jargões pra esconder: o que é K, V, attention e por que recalcular custa'],
            ['"Quando o modelo gera texto palavra por palavra, ele cacheia os cálculos antigos pra não refazer"', '⚠️ Melhor, mas ainda vago — o que cacheia exatamente?'],
            ['"Imagine escrever uma frase letra por letra. A cada nova letra o modelo precisaria reler TUDO que já escreveu. O KV Cache é o bloquinho de notas onde ele salva o que processou de cada letra anterior, pra só olhar o novo"', '✅ Aí sim — analogia concreta + causa/efeito exposto'],
          ]}
        />
        <Callout tone="success">
          O momento em que você escreveu &ldquo;o que cacheia exatamente?&rdquo; é o ouro da Feynman. Voltar pra fonte e responder <em>só isso</em> é
          5 minutos. Sem Feynman, você seguiria acreditando que entendeu e passaria mês tropeçando na mesma lacuna.
        </Callout>
      </Section>

      <Section title="Feynman + recall + SRS: o stack completo" accent={ACCENT}>
        <p>
          Feynman sozinho é caro — toma tempo, exige foco. Mas ele tem um papel único: <strong>detecta onde está o buraco</strong>. Depois disso, o que
          fixa é outra coisa. O fluxo ótimo:
        </p>
        <StackFlow
          title="Stack Feynman → Recall → SRS"
          accent={ACCENT}
          items={[
            {
              icon: '🔬',
              label: 'FEYNMAN',
              sub: 'diagnóstico',
              detail: 'Expõe os buracos. 1× por tópico novo, logo após a leitura inicial. Mostra exatamente o que você não entendeu.',
              connector: 'feche buracos',
            },
            {
              icon: '🧠',
              label: 'RECALL',
              sub: 'prática',
              detail: 'Reconstrói a memória várias vezes. Quiz ativo, Anki, explicar de novo. Fortalece a trace de memória.',
              connector: 'fixa',
            },
            {
              icon: '🔁',
              label: 'SRS',
              sub: 'manutenção',
              detail: 'Mantém de longo prazo indefinidamente. Cards voltam em intervalos exponenciais. Custo marginal baixíssimo.',
            },
          ]}
        />
        <DecisionBox
          scenario="Estudando arquitetura serverless na AWS pela primeira vez"
          winner="Feynman pra descobrir buracos + recall + SRS pra fixar"
          winnerColor={ACCENT}
          why="Feynman expõe rapidamente que você não sabe a diferença entre invocação síncrona/assíncrona do Lambda. Aí volta, estuda só isso, e SRS mantém. Sem Feynman, você decoraria definições sem notar o buraco."
          alternatives={[{ name: 'Só ler a documentação', note: 'ilusão de domínio, buracos persistem.' }, { name: 'Só fazer quiz', note: 'fixa o que sabe, mas não acha o que não sabe.' }]}
        />
      </Section>

      <Section title="Como aplicar no dia-a-dia (3 formatos)" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Formato', 'Quando usar', 'Esforço']}
          rows={[
            ['Caderno Feynman — escreva a explicação', 'Conceito denso, quer deixar pra revisar depois', 'Médio'],
            ['Áudio — grave você explicando em voz alta', 'No carro, caminhando, sem papel à mão', 'Baixo'],
            ['Ensinar para alguém real (parceiro, colega)', 'Vai pro próximo nível — protégé effect ativado', 'Alto (mas o mais denso)'],
          ]}
        />
        <Callout tone="info">
          Eu (Fernando) uso variação: abro o ChatGPT e digito &ldquo;explica o que você entendeu sobre X&rdquo;, depois me forço a responder. Se eu não
          conseguir escrever sem consultar, o buraco tá ali — escancarado.
        </Callout>
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="E se eu travar em TUDO e não souber por onde começar a explicar?"
          a="Sinal de que você não leu/estudou o suficiente ainda. Feynman é filtro pós-exposição — serve pra achar lacunas, não pra aprender do zero. Estude 1x primeiro, aplique Feynman na 2ª passagem."
        />
        <QAItem
          q="Quanto tempo gasto em cada ciclo Feynman?"
          a={<>Tópico pequeno (um conceito): <strong>5-10 min</strong>. Tópico médio (um capítulo): <strong>20-30 min</strong>. Evite Feynman em escopos gigantes — fatia e faça várias sessões curtas.</>}
        />
        <QAItem
          q="Posso usar o ChatGPT/Claude pra fazer o papel da criança?"
          a={<>SIM, é excelente. Diga &ldquo;faça perguntas de uma criança de 10 anos sobre o que eu vou explicar agora&rdquo;. A IA não aceita jargão e faz contra-perguntas honestas. Reduz a barreira psicológica de &ldquo;não tenho pra quem explicar&rdquo;.</>}
        />
        <QAItem
          q="Feynman vale pra coisas procedimentais (código, atalhos, dirigir)?"
          a="Menos. Habilidades procedimentais pedem prática distribuída, não explicação. Feynman brilha em conhecimento declarativo: conceitos, arquitetura, por que algo funciona. Pra procedimental, use interleaving + reps."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> se não explica, não entendeu · travar é o ouro, não o fracasso · voz alta ou papel — mentalmente pula buracos ·
        analogia concreta &gt; definição técnica · combine com recall + SRS pra fixar o que Feynman expôs. Em uma frase: Feynman é o raio-X do
        conhecimento — mostra exatamente onde você não sabe.
      </Callout>
    </div>
  );
}
