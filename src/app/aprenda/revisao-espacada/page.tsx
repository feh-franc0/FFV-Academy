import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, QAItem, ArchDiagram, StackFlow } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Revisão Espaçada: a técnica mais eficaz do mundo — FFV Academy',
  description: 'Revisão espaçada SM-2 e FSRS: a técnica com maior evidência científica para retenção de longo prazo. Forgetting curve de Ebbinghaus, Anki e como o Hub FFV aplica.',
};

const ACCENT = '#3fb950';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que revisar um conceito 1 dia, 3 dias e 7 dias depois de aprender é mais eficiente que revisar 3 vezes no mesmo dia?',
    options: [
      'É a mesma coisa, só distribui o esforço',
      'Revisar logo antes de esquecer força o cérebro a reconstruir a memória, criando uma trace mais forte que a consolidação múltipla imediata',
      'Porque você fica cansado se estudar tudo no mesmo dia',
      'Porque ninguém tem paciência para estudar 3x num dia só',
    ],
    correct: 1,
    explanation: 'O efeito é chamado de spacing effect (Ebbinghaus, 1885). Revisar no limiar do esquecimento ativa reconsolidação — o cérebro reconstrói a memória com mais força. Revisar repetidamente no mesmo dia gera ilusão de domínio (reconhecimento ≠ recall).',
  },
  {
    question: 'O que o algoritmo SM-2 faz quando você acerta um card com facilidade?',
    options: [
      'Aumenta o intervalo para a próxima revisão e bumpa o ease factor',
      'Remove o card da fila permanentemente',
      'Mostra o card de novo em 1 minuto para fixar',
      'Adiciona 3 cards novos aleatórios',
    ],
    correct: 0,
    explanation: 'SM-2 (SuperMemo-2) calcula `próximo_intervalo = intervalo_atual × ease_factor`. Acertar fácil aumenta o ease (memória estável), então o próximo retorno é muito mais distante. Errar reseta o intervalo para 1 dia e reduz o ease.',
  },
  {
    question: 'A "curva do esquecimento" de Ebbinghaus descreve:',
    options: [
      'Que quanto mais velho você fica, pior a memória',
      'Que memória decai exponencialmente com o tempo, a menos que haja reforço via recuperação',
      'Que dormir apaga a memória',
      'Que grifar com marca-texto fixa melhor',
    ],
    correct: 1,
    explanation: 'Hermann Ebbinghaus (1885) mostrou experimentalmente que retenção cai de ~100% para ~40% em 24h sem reforço. Cada revisão bem-sucedida achata a curva — a próxima queda é mais lenta. É a base matemática de toda SRS.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="revisao-espacada"
      title="Revisão Espaçada: a técnica mais eficaz do mundo"
      icon="🔁"
      xp={50}
      readTime={9}
      trailName="Como Aprender"
      trailColor={ACCENT}
      nextSlug="recall-ativo"
      nextTitle="Recall Ativo: por que reler é quase inútil"
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
        Em 1885 um psicólogo alemão decorou 2.000 sílabas sem sentido e mediu quantas lembrava ao longo dos dias. A curva que ele desenhou — o
        <em> forgetting curve</em> — virou a base de toda a ciência moderna do aprendizado. Ebbinghaus mostrou uma coisa desconfortável: <strong>você
        esquece 70% do que aprende em 24 horas</strong> se não fizer nada. Mas mostrou algo bonito também: <strong>revisar no momento certo achata a
        curva</strong>. Uma revisão bem cronometrada transforma memória volátil em memória de longo prazo. Esse é o truque que o seu Hub aplica automaticamente.
      </p>

      <Section title="A curva do esquecimento, visualizada" accent={ACCENT}>
        <ArchDiagram title="Retenção vs. tempo, com e sem revisão" accent={ACCENT}>{`
  Retenção (%)
  100 ┤●
      │ ╲
   80 ┤  ╲___________  ← 1ª revisão (dia 1)
      │   ╲            ╲
   60 ┤    ╲            ╲___________  ← 2ª revisão (dia 3)
      │     ╲                        ╲
   40 ┤      ╲___  (sem revisão)       ╲___________  ← 3ª (dia 7)
      │          ╲___                              ╲___
   20 ┤              ╲___                               ╲___
      │                  ╲___                                ╲___
    0 ┼──────┬────────┬─────╲──┬────────┬──────────┬──────────────→ dias
      0      1        3       7       14          30
        `}</ArchDiagram>
        <p>
          Cada revisão no momento certo <em>achata</em> a curva seguinte. O segredo: revisar <strong>um pouco antes de esquecer</strong> — não cedo
          demais (desperdício), não tarde demais (recomeçou do zero).
        </p>
      </Section>

      <Section title="SM-2: o algoritmo que move o seu Hub" accent={ACCENT}>
        <p>
          Piotr Wozniak criou o SuperMemo-2 em 1987 pra responder uma pergunta simples: <em>qual é o intervalo ótimo entre revisões?</em> O algoritmo
          mantém dois números por card: <InlineCode>interval</InlineCode> (dias até próxima revisão) e <InlineCode>ease</InlineCode> (quão fácil o
          card é pra você — default 2.5, mínimo 1.3).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sua resposta', 'O que o SM-2 faz', 'Exemplo com ease=2.5']}
          rows={[
            ['Errei', 'repetition = 0 · interval = 1 · ease -= 0.2', 'Card volta amanhã'],
            ['Difícil (acertei com esforço)', 'interval atual mantido, ease ajustado', 'Volta em ~1 dia'],
            ['Bom (acertei bem)', 'interval = interval × ease', 'Volta em ~3, 7, 17 dias...'],
            ['Fácil (lembrei na hora)', 'interval × ease + bônus', 'Volta em ~7, 17, 40 dias...'],
          ]}
        />
        <Callout tone="info">
          O <strong>ease factor</strong> se ajusta por card — perguntas que você sempre acerta rapidinho viram cards com ease 3.5+ que só voltam a cada
          meses. Isso é o que faz SRS escalar: 10.000 cards na fila, mas só 30-50 devidos por dia.
        </Callout>
      </Section>

      <Section title="Por que funciona — a neurociência em 1 parágrafo" accent={ACCENT}>
        <p>
          Quando você recupera uma memória, o cérebro entra em <strong>reconsolidação</strong>: a memória é momentaneamente desestabilizada e então
          gravada de novo, mais forte. Quanto mais difícil foi recuperar (sem chegar a esquecer), maior o ganho — é o conceito de <em>desirable
          difficulty</em> do Robert Bjork. A revisão espaçada é o único cronograma que mantém você <em>sempre</em> nesse ponto ótimo entre &ldquo;lembro
          facilmente&rdquo; (sem ganho) e &ldquo;esqueci totalmente&rdquo; (começou do zero).
        </p>
      </Section>

      <Section title="Comparação: reler vs revisar com SRS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Esforço mental', 'Retenção 30 dias', 'Eficiência']}
          rows={[
            ['Reler o texto', 'Baixo (passivo)', '~25%', 'Ruim — cria ilusão de domínio'],
            ['Grifar / marca-texto', 'Baixo', '~30%', 'Ruim por si só, útil só como prep'],
            ['Revisar 3× no mesmo dia', 'Médio', '~35%', 'Meh — spacing effect quase zero'],
            ['Quiz + SRS (SM-2)', 'Alto (recall ativo)', '~85-95%', '🏆 mais eficiente já medido'],
          ]}
        />
      </Section>

      <Section title="Como o Hub aplica tudo isso automaticamente" accent={ACCENT}>
        <StackFlow
          title="O fluxo completo"
          accent={ACCENT}
          items={[
            {
              icon: '✅',
              label: 'Dia 0 · você completa o quiz',
              sub: 'auto',
              detail: '3 perguntas do módulo X geram 3 cards com intervalo inicial de 1 dia.',
              connector: 'cards criados',
            },
            {
              icon: '🔔',
              label: 'Dia 1 · cards ainda não vencidos',
              sub: '0 devidos',
              detail: 'Hub mostra 0 cards na fila. Você continua estudando coisa nova sem pressão.',
              connector: 'vencem à meia-noite',
            },
            {
              icon: '🎯',
              label: 'Dia 2 · você abre /revisar',
              sub: '3 devidos',
              detail: 'Fila traz as 3 perguntas. Você acerta com auto-avaliação "good".',
              connector: 'SM-2 recalcula',
            },
            {
              icon: '📅',
              label: 'Próxima revisão reagendada',
              sub: 'SM-2',
              detail: 'Card 1 → 3 dias · Card 2 → 3 dias · Card 3 → 3 dias. Intervalo cresce exponencialmente se você continuar acertando.',
            },
          ]}
        />
        <p>
          Você não agenda nada. Não pensa em quando revisar. Só abre <InlineCode>/revisar</InlineCode>, a fila mostra o que está pronto
          pra voltar, e o algoritmo cuida de quando cada card retorna. Nos bastidores é SM-2 simplificado (sem quality 1-2, só binário acerto/erro + modulação
          por auto-avaliação).
        </p>
      </Section>

      <Section title="Cenários de uso" accent={ACCENT}>
        <DecisionBox
          scenario="Preciso decorar 200 conceitos AWS para o CLF-C02 em 30 dias"
          winner="Fila SRS diária, 15 min/dia"
          winnerColor={ACCENT}
          why="15 min × 30 dias = 7,5h distribuídas. Cada conceito volta no momento de máxima dificuldade desejável. Retenção ≥ 85% no dia da prova vs ~35% se você 'estudasse tudo' na véspera."
          alternatives={[{ name: 'Cramming 8h na véspera', note: 'retém 30-40%, fadiga alta, não escala.' }, { name: 'Reler o livro 3x', note: 'ilusão de domínio sem recall.' }]}
        />
        <DecisionBox
          scenario="Quero reter conceitos de um livro que li ano passado"
          winner="Criar cards dos pontos-chave e rodar no Anki ou Hub"
          winnerColor={ACCENT}
          why="Conteúdo que você já estudou uma vez + SRS = retenção vitalícia com custo marginal de minutos/semana."
          alternatives={[{ name: 'Reler o livro inteiro', note: '10h vs 10min SRS — mesmo ganho final.' }]}
        />
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Posso simplesmente usar Anki em vez do Hub?"
          a={<>Pode, e é ótimo. Mas Anki exige você <strong>criar os cards</strong> — trabalho que muitos desistem. O Hub automatiza isso: cada quiz que você responde vira cards, e você só precisa revisar. Pense no Anki como um canivete suíço e no Hub como um caminho feito pra você.</>}
        />
        <QAItem
          q="E se eu acumular 500 cards atrasados?"
          a="Acontece. A recomendação é limitar novos cards (não fazer muitos módulos seguidos), e se atrasar, revisar em sessões de 20-30 cards por vez. A fila se estabiliza em dias. Nunca deleta — deleta seu progresso."
        />
        <QAItem
          q="SRS funciona para tudo ou só pra memorizar fatos?"
          a={<>Funciona melhor pra conhecimento declarativo (fatos, conceitos, vocabulário). Pra habilidades procedimentais (codar, dirigir), o análogo é <strong>prática distribuída</strong>: vários micro-exercícios ao longo dos dias {'>'} um maratona.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Ebbinghaus mostrou em 1885 que memória decai exponencialmente. SM-2 calcula o intervalo ótimo pra revisar logo
        antes de esquecer. Retenção com SRS fica ~3× maior que reler/grifar. O Hub FFV já aplica tudo isso — você só precisa abrir <InlineCode>/revisar</InlineCode> todo
        dia e ser honesto na auto-avaliação.
      </Callout>
    </div>
  );
}
