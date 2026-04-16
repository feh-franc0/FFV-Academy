import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, DecisionBox, QAItem, ArchDiagram, StackFlow } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Hábito de Estudo Diário: o jogo longo — FFV Academy',
  description: 'Por que 15 min/dia vencem 4h no sábado. Habit stacking, gatilho-rotina-recompensa, streak, dose mínima, e como o Hub FFV estrutura hábito sem depender de motivação.',
};

const ACCENT = '#3fb950';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença entre "motivação" e "hábito" na prática?',
    options: [
      'Motivação é mental, hábito é físico',
      'Motivação é finita e variável (depende do humor); hábito é automático (independe). Sistemas baseados em motivação falham; baseados em hábito escalam',
      'Motivação vem de propósito, hábito vem de disciplina',
      'São sinônimos',
    ],
    correct: 1,
    explanation: 'Motivação é combustível que acaba. Hábito é infraestrutura: o cérebro cria um caminho neural de "gatilho → ação" que dispensa decisão. Todo dia decidir "vou estudar?" é exaustivo; hábito elimina a decisão.',
  },
  {
    question: 'O que é "habit stacking" (Clear, 2018)?',
    options: [
      'Empilhar vários hábitos no mesmo horário',
      'Conectar um novo hábito a um já existente: "Depois de [hábito âncora], eu [novo hábito]" — usa a ação antiga como gatilho confiável',
      'Fazer hábitos difíceis primeiro',
      'Quebrar hábitos ruins',
    ],
    correct: 1,
    explanation: 'Exemplo: "Depois de servir meu café da manhã, eu abro o Hub FFV e faço 5 cards". O hábito do café já é disparado todo dia — anexar algo novo a ele importa o gatilho existente. É o caminho mais previsível pra criar hábito novo.',
  },
  {
    question: 'Por que a "dose mínima" funciona melhor que "meta ambiciosa"?',
    options: [
      'Porque o cérebro prefere coisas fáceis',
      'Porque meta baixa (ex: "1 card/dia") é impossível de falhar, preserva o streak e a identidade; ambiciosa quebra na primeira semana ruim e você para de vez',
      'Porque não gasta dopamina',
      'Porque você progride mais rápido',
    ],
    correct: 1,
    explanation: 'Duolingo e Anki sabem: o mínimo existe pra proteger o hábito, não pra ser o objetivo. 1 card funciona como âncora ritual. Quase sempre você acaba fazendo mais. Quando não, pelo menos o streak continua — e amanhã você não começa do zero.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="habito-estudo-diario"
      title="Hábito de Estudo Diário: o jogo longo"
      icon="🌱"
      xp={50}
      readTime={9}
      trailName="Como Aprender"
      trailColor={ACCENT}
      nextSlug=""
      nextTitle=""
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
        Você pode saber tudo sobre recall ativo, SRS, Feynman, interleaving e deep work. Nada disso importa se você não <em>abrir o caderno hoje</em>.
        E amanhã. E depois de amanhã. A maior variável no aprendizado não é técnica — é <strong>frequência</strong>. A pesquisa mostra que estudar
        <strong> 15 min/dia durante 60 dias </strong>(15h total) produz mais retenção que <strong>4h num sábado</strong> durante o mesmo período (também
        15h total). Mesmo tempo, resultado brutalmente diferente. Esse módulo é sobre como construir o hábito — o mecanismo mais importante de todos.
      </p>

      <Section title="Por que o jogo longo vence o curto" accent={ACCENT}>
        <ArchDiagram title="Retenção acumulada: diário vs fim de semana" accent={ACCENT}>{`
  Conhecimento efetivo
   ▲
   │                               ●●●●●●●●●●●●●●
   │                           ●●●●               15min/dia
   │                       ●●●●
   │                   ●●●●
   │               ●●●●
   │           ●●●●
   │       ●●●●
   │   ●●●●
   │ ●●              ●      ●       ●       ●     4h/sábado
   │                                                (pico + queda)
   └─────────────────────────────────────────────→ Semanas
        `}</ArchDiagram>
        <p>
          Estudo diário aproveita <strong>spacing effect</strong> (revisão perto do esquecimento), <strong>consolidação de sono</strong> (memória fixa
          durante REM), e <strong>efeito de hábito</strong> (automático, não depende de humor). Estudo em batida única perde tudo isso — você releia o
          que esqueceu e empurra no curto prazo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', '15 min/dia × 60d', '4h/sábado × 15 semanas']}
          rows={[
            ['Tempo total', '15h', '15h'],
            ['Consolidação em sono', '60 noites = 60×', '15 noites = 15×'],
            ['Revisão espaçada', 'Natural e frequente', 'Espaçamento errado'],
            ['Dependência de motivação', 'Baixa (hábito)', 'Alta (precisa querer toda semana)'],
            ['Retenção estimada', '~75-85%', '~25-35%'],
          ]}
        />
      </Section>

      <Section title="Gatilho → Rotina → Recompensa: a engrenagem do hábito" accent={ACCENT}>
        <p>
          Charles Duhigg (&ldquo;O Poder do Hábito&rdquo;, 2012) popularizou o modelo clássico baseado em pesquisa do MIT: todo hábito é um loop de
          3 componentes. Engenheira os 3 e o hábito se cria. Ignore qualquer um e ele não pega.
        </p>
        <StackFlow
          title="O loop do hábito (Duhigg)"
          accent={ACCENT}
          items={[
            { icon: '🔔', label: 'Gatilho', sub: 'cue', detail: 'Sinal que dispara o hábito — hora, lugar, estado emocional, ação anterior.' },
            { icon: '🎯', label: 'Rotina', sub: 'habit', detail: 'A ação em si. Precisa ser pequena e reproduzível.' },
            { icon: '🏅', label: 'Recompensa', sub: 'reward', detail: 'Satisfaz o craving. Sem recompensa, o cérebro não grava o loop.' },
            { icon: '🔁', label: 'Craving', sub: 'reforço', detail: 'Antecipação da recompensa volta a acionar o gatilho — é assim que o hábito se automatiza.' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Componente', 'Pergunta', 'Exemplo pra estudo']}
          rows={[
            ['Gatilho', 'Quando/onde acontece?', 'Depois de servir o café, sentado à mesa'],
            ['Rotina', 'Qual é a ação?', 'Abrir o Hub FFV e revisar a fila (5 cards)'],
            ['Recompensa', 'O que eu ganho?', 'XP, streak ↑, sensação de progresso, checkmark'],
          ]}
        />
        <Callout tone="info">
          O FFV Academy foi projetado pros 3: o <strong>streak no HUD</strong> é pista visual diária (gatilho), a <strong>fila SRS</strong> é rotina
          clara e curta, o <strong>XP + badges + heatmap</strong> é recompensa imediata. Funciona porque não precisa de força de vontade — precisa
          aparecer.
        </Callout>
      </Section>

      <Section title="Habit stacking: a técnica mais poderosa" accent={ACCENT}>
        <p>
          James Clear, em <em>Atomic Habits</em> (2018), descreve <strong>habit stacking</strong>: conectar um hábito novo a um já estabelecido. A
          fórmula é &ldquo;Depois de [HÁBITO ANTIGO], eu [HÁBITO NOVO]&rdquo;. Usa a confiabilidade do ritual existente como motor do novo.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Hábito âncora (já tem)', 'Hábito novo (quer criar)']}
          rows={[
            ['Depois de tomar meu café da manhã', 'Abro o Hub FFV e revisei 5 cards'],
            ['Depois de entrar no ônibus/metrô', 'Abro um artigo do FFV Academy'],
            ['Depois de desligar o trabalho', 'Faço 1 pomodoro de estudo antes de cozinhar'],
            ['Depois de escovar os dentes à noite', 'Faço 3 cards (a dose mínima)'],
          ]}
        />
        <Callout tone="warn">
          <strong>Escolha um âncora confiável.</strong> &ldquo;Depois do meu café&rdquo; funciona se você sempre toma café. &ldquo;Depois do meu
          treino&rdquo; não funciona se você treina 3x por semana. Âncora deve acontecer <em>todo dia, mesmo horário, sem exceção</em>.
        </Callout>
      </Section>

      <Section title="Dose mínima: proteja o hábito, não o resultado" accent={ACCENT}>
        <p>
          Quando você define &ldquo;estudar 1 hora por dia&rdquo;, 80% das noites ruins quebram o sistema — você chega cansado, pula, quebra streak,
          perde identidade (&ldquo;não sou quem estuda todo dia&rdquo;). Quando define <strong>&ldquo;estudar 5 min por dia&rdquo;</strong>, quase
          nunca falha. 5 min existe sempre. E uma vez começado, muitas vezes você faz 30. Mas o que importa é o mínimo — porque ele protege o hábito.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Regra', 'Dose ambiciosa', 'Dose mínima']}
          rows={[
            ['Meta do dia', '60 min', '5 min'],
            ['Falha típica', 'Dia cheio, 0 min, streak zerado', 'Sempre rola ao menos 5 min'],
            ['Identidade que constrói', '"Tentei estudar 1h, falhei"', '"Sou alguém que estuda todo dia"'],
            ['Real tempo médio/dia', '0 (desistiu após 3 semanas)', '12-20 min (muitas vezes vira mais)'],
          ]}
        />
        <DecisionBox
          scenario="Quero começar a estudar AWS e preciso criar o hábito"
          winner="Meta: 5 cards/dia no Hub + 1 artigo novo/semana"
          winnerColor={ACCENT}
          why="5 cards = ~3 min. Vai rolar 90% dos dias. Em 90 dias, são ~450 cards internalizados. E muitas vezes você faz mais que 5. O 5 é o piso psicológico — garante que o hábito nunca quebre."
          alternatives={[{ name: '1 hora por dia', note: 'desmotiva em 2 semanas, vira zero.' }, { name: '1 artigo completo/dia', note: 'volume inflado demais, abandona no 4º.' }]}
        />
      </Section>

      <Section title="Streak, freeze e identidade" accent={ACCENT}>
        <p>
          O streak não é gameficação barata — é uma prova visível de identidade. Quando você chega no dia 30, <strong>quem você é</strong> mudou:
          &ldquo;sou alguém que estuda todo dia&rdquo;. Essa autoimagem é o combustível que sustenta o hábito depois que a novidade passou. Mas o
          streak tem um bug: 1 dia ruim quebra 60 dias construídos, e o colapso psicológico do reset é grande.
        </p>
        <Callout tone="info">
          Por isso o FFV Academy tem <strong>streak freeze</strong>: a cada 7 dias consecutivos você ganha 1 freeze (máx 2). Ele é consumido automaticamente
          se você pular 1 dia — seu streak sobrevive. Não é trapaça; é humanidade. Vida acontece. O hábito precisa aguentar imperfeição.
        </Callout>
      </Section>

      <Section title="O que fazer em dias ruins" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que muitos fazem', 'O que preserva o hábito']}
          rows={[
            ['Cansaço extremo', 'Pular o dia', 'Fazer só 1 card. É minúsculo mas MANTÉM a identidade'],
            ['Viagem/imprevisto', 'Esquecer', 'Abrir o app no carro/avião mesmo que só pra 30 seg'],
            ['Dia péssimo emocional', '"Não estou em condições"', 'Fazer 1 card e respirar. Muitas vezes vira 10'],
            ['Pulei 1 dia', '"Já quebrei, vou recomeçar segunda"', 'Fazer NO MESMO DIA (mesmo que tarde). Interromper a interrupção'],
          ]}
        />
        <Callout tone="success">
          <strong>Regra de ouro de James Clear:</strong> &ldquo;Nunca falte 2 dias em sequência.&rdquo; 1 dia é acidente. 2 dias é tendência. Volte
          imediatamente na menor dose possível — isso salva o sistema.
        </Callout>
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Quanto tempo leva pra virar hábito de verdade?"
          a={<>Depende. A média de Lally et al. (2010) foi <strong>66 dias</strong>, mas com variação enorme (18 a 254 dias). Depende da complexidade, do gatilho, da recompensa. Pra hábitos de estudo curtos (5-15 min), geralmente &lt; 60 dias.</>}
        />
        <QAItem
          q="Eu realmente preciso estudar TODO dia? Não pode ser 5x por semana?"
          a={<>Pode — mas é mais difícil. A irregularidade (&ldquo;toda segunda, quarta, sexta&rdquo;) obriga decidir toda vez. Hábito diário é <em>mais fácil</em> que hábito alternado porque elimina a pergunta &ldquo;é hoje?&rdquo;. Em compensação, dose diária precisa ser muito menor.</>}
        />
        <QAItem
          q="E se eu perder motivação depois de 90 dias?"
          a="Normal. Motivação cai; hábito persiste. Se chegou a 90 dias, o loop já está automático — você ABRE o app mesmo sem querer. O que some é o entusiasmo, não a ação. Continue mesmo morno; o resultado compõe por décadas."
        />
        <QAItem
          q="Estudo em 2 lugares (trabalho + faculdade). Misturo tudo no mesmo hábito?"
          a={<>Não. Hábitos compartimentalizados mantêm-se melhor. Tenha <strong>um ritual por contexto</strong>: &ldquo;de manhã, estudo AWS; à noite, reviso faculdade&rdquo;. Gatilhos diferentes, rotinas separadas, zero confusão mental.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> frequência &gt; intensidade · motivação é finita, hábito é infraestrutura · use habit stacking com um âncora
        confiável · dose mínima protege o sistema · nunca pule 2 dias seguidos · streak freeze é humanidade, não trapaça · 66 dias é a média pra virar
        automático. O FFV Academy é construído pra isso: você só precisa aparecer todo dia. Por favor, apareça.
      </Callout>
    </div>
  );
}
