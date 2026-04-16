import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable, DecisionBox, QAItem, ArchDiagram } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Deep Work + Pomodoro: foco real em mundo distraído — FFV Academy',
  description: 'Deep work (Cal Newport), Pomodoro (Cirillo) e o custo de troca de contexto. Como estruturar blocos de foco de verdade em 2026 com notificação em tudo.',
};

const ACCENT = '#3fb950';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "attention residue" e por que importa?',
    options: [
      'É o cansaço físico depois de concentrar muito',
      'É o fenômeno (Sophie Leroy, 2009) de que parte da atenção fica "presa" na tarefa anterior por 10-25 min após trocar — cada interrupção custa caro em tempo perdido',
      'É a dopamina liberada ao terminar uma tarefa',
      'É um sinônimo de procrastinação',
    ],
    correct: 1,
    explanation: 'Leroy mostrou que checar email/Slack no meio de um trabalho profundo não custa só os 30s da checagem — custa mais 10-25 min pra atenção voltar 100% à tarefa original. Em um dia com 20 interrupções, você perde 3-5h produtivas.',
  },
  {
    question: 'Por que 25 min (Pomodoro) é um bom tamanho de bloco?',
    options: [
      'É o tempo médio de um vídeo do YouTube',
      'Abaixo do limite de fadiga atencional (~40-50 min pra maioria) e acima do custo de setup (precisa focar >15 min pra entrar em estado produtivo)',
      'Francesco Cirillo tinha um timer de cozinha de 25 min',
      'É arbitrário, qualquer número funciona',
    ],
    correct: 1,
    explanation: 'A resposta é dupla: Cirillo realmente usou um timer tomate (pomodoro) de 25 min, MAS a duração funciona porque está dentro da janela "longo o bastante pra entrar em flow, curto o bastante pra não fatigar". Para tarefas mais profundas, blocos de 45-90 min (deep work) batem Pomodoro.',
  },
  {
    question: 'Qual é a diferença prática entre Deep Work e Pomodoro?',
    options: [
      'São sinônimos',
      'Deep Work (Cal Newport) foca em blocos LONGOS (60-120 min+) de concentração intensa — Pomodoro (Cirillo) usa blocos CURTOS (25 min) com pausas. Deep Work é pra produção criativa, Pomodoro pra execução disciplinada',
      'Deep Work é pra quem tem TDAH, Pomodoro pra quem não tem',
      'Pomodoro foi criado por Cal Newport também',
    ],
    correct: 1,
    explanation: 'Pomodoro é uma disciplina cognitivo-comportamental: força você a começar (25 min é pouco). Deep Work é uma filosofia: blocos longos porque skills cognitivos complexos (programar, escrever, matemática) levam 15-30 min só pra entrar em flow, então 25 min desperdiça metade. Use Pomodoro pra vencer procrastinação, Deep Work pra produzir.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="deep-work-pomodoro"
      title="Deep Work + Pomodoro: foco real em mundo distraído"
      icon="🎧"
      xp={40}
      readTime={7}
      trailName="Como Aprender"
      trailColor={ACCENT}
      nextSlug="habito-estudo-diario"
      nextTitle="Hábito de Estudo Diário: o jogo longo"
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
        Você tem as melhores técnicas do mundo — recall ativo, SRS, Feynman. Mas de nada adiantam se você não consegue sentar por 30 min sem checar o
        celular. A produção de conhecimento de verdade depende de <strong>foco profundo</strong>, e foco profundo é uma habilidade que o ambiente de
        2026 conspira contra. Slack, WhatsApp, email, notificações de aplicativo, IA ligada o tempo todo. Esse módulo é sobre duas ferramentas
        complementares: <em>Pomodoro</em> (a que te faz começar) e <em>Deep Work</em> (a que te faz produzir). Uma pra vencer procrastinação, outra pra
        entrar em flow.
      </p>

      <Section title="O custo invisível da interrupção" accent={ACCENT}>
        <p>
          Sophie Leroy (2009) cunhou o termo <strong>attention residue</strong>. Quando você interrompe uma tarefa cognitiva complexa pra checar algo
          aparentemente pequeno, parte do seu cérebro continua processando a tarefa anterior em background — por 10 a 25 min. Durante esse período, seu
          desempenho na nova tarefa é significativamente pior. Se você checa Slack 20 vezes por dia, o custo somado chega fácil a <strong>3-5 horas
          perdidas</strong> — não na checagem em si, mas na reentrada.
        </p>
        <ArchDiagram title="Produtividade ao longo do dia: foco vs interrupção" accent={ACCENT}>{`
  Output
   ▲
   │       ╭──── Deep Work (90 min contíguo)
   │      ╱
   │     ╱
   │    ╱  ← 20 min pra entrar em flow
   │   ╱
   │  ╱___________  Interrompido (checou Slack aos 25 min)
   │                ←── reset ──→ nunca chega no flow
   │
   └──────────────────────────→ Tempo
        `}</ArchDiagram>
        <Callout tone="warn">
          O problema não é perder 2 minutos no Slack. É perder o que estava prestes a surgir <em>depois</em> dos 2 min — a insight complexa que só
          emerge após 30 min de imersão.
        </Callout>
      </Section>

      <Section title="Pomodoro: a ferramenta pra começar" accent={ACCENT}>
        <p>
          Criado por Francesco Cirillo nos anos 80. Estrutura simples: <strong>25 min de foco + 5 min de pausa</strong>. A cada 4 pomodoros, pausa
          longa de 15-30 min. A mágica não é o número 25 — é o <em>contrato</em> de 25 min. Você não precisa prometer 3 horas. Só 25.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Passo', 'O que fazer']}
          rows={[
            ['1. Escolha 1 tarefa', 'Só uma. Se vaga demais ("estudar AWS"), fatie ("ler capítulo 3 de VPC")'],
            ['2. Timer em 25 min', 'Celular no modo avião ou em outro cômodo. App dedicado > navegador'],
            ['3. Foca sem trocar', 'Se vier pensamento de distração, anota numa folha e volta'],
            ['4. 5 min de pausa real', 'Levanta, bebe água, olha janela. NÃO celular (quebra o benefício)'],
            ['5. Repete 3x + pausa longa', 'Depois de 4 pomodoros: 15-30 min pra comer, caminhar, descansar'],
          ]}
        />
        <Callout tone="info">
          Use Pomodoro quando a barreira é <strong>começar</strong>. &ldquo;Só 25 min&rdquo; derruba a inércia psicológica. Uma vez aquecido, muitas
          vezes você emenda 3-4 pomodoros sem dor.
        </Callout>
      </Section>

      <Section title="Deep Work: a ferramenta pra produzir" accent={ACCENT}>
        <p>
          Cal Newport (2016) argumentou que trabalho cognitivo complexo exige blocos de 60-120 min <strong>sem interrupção</strong>. Programar,
          escrever, provar teorema matemático, projetar arquitetura — todos compartilham uma curva lenta de entrada em flow. Pomodoro (25 min) é muito
          curto pra esse tipo de tarefa: quando você finalmente entrou no problema, o timer toca.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Pomodoro', 'Deep Work']}
          rows={[
            ['Duração do bloco', '25 min', '60-120+ min'],
            ['Melhor pra', 'Tarefas de execução, estudo com fadiga fácil', 'Programar, escrever, resolver problema'],
            ['Barreira que resolve', 'Procrastinação / inércia', 'Distração / superficialidade'],
            ['Pausa', 'A cada 25 min', 'Só ao fim do bloco'],
            ['Pra quem começou agora', 'Muito bom', 'Difícil — comece com Pomodoro'],
            ['Pra quem já foca bem', 'Pode ser limitante', 'O padrão ouro'],
          ]}
        />
        <DecisionBox
          scenario="Quero estudar 2 horas hoje, mas estou travado em procrastinação"
          winner="Pomodoro: 4 ciclos de 25 min (2h total)"
          winnerColor={ACCENT}
          why="Você não sabe se tem 2h de foco dentro de você — só sabe que tem 25 min. A baixa barreira de entrada é o que importa. Depois, o momento te carrega."
          alternatives={[{ name: 'Bloco único de 2h', note: 'pode travar na hora de começar, 0 produtividade.' }]}
        />
        <DecisionBox
          scenario="Preciso escrever um relatório técnico de 15 páginas"
          winner="Deep Work: 2 blocos de 90 min, celular em outro cômodo"
          winnerColor={ACCENT}
          why="Escrever exige segurar argumento, estrutura, transições — 25 min corta pensamento antes de amadurecer. Precisa de continuidade."
          alternatives={[{ name: 'Pomodoros de 25 min', note: 'timer interrompe no meio do raciocínio, frustra.' }, { name: '4h contínuas', note: 'fadiga cognitiva excede benefício — 2 blocos de 90 min > 1 bloco de 3h.' }]}
        />
      </Section>

      <Section title="Setup prático — como desativar as distrações" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Distração', 'Contramedida', 'Eficácia']}
          rows={[
            ['Celular (WhatsApp, Insta)', 'Modo avião + em outro cômodo (não só "silencioso")', '🏆 Essencial'],
            ['Slack/Teams', 'Fechar app, definir status "focado até X"', 'Alta'],
            ['Email', 'Checagem agendada (2x/dia) — nunca abrir livre', 'Alta'],
            ['Abas do navegador', 'Fechar tudo. Se precisa pesquisar, anota e busca na pausa', 'Média'],
            ['Notificação de sistema', 'Modo Foco do macOS/iOS (agenda recorrente)', 'Alta'],
            ['Pensamentos internos ("ah, tenho que responder X")', 'Folha ao lado: anota e segue', 'Alta — externaliza sem ação'],
          ]}
        />
        <Callout tone="warn">
          <strong>Armadilha da &ldquo;pausa produtiva&rdquo;:</strong> usar a pausa de 5 min do Pomodoro pra checar Instagram anula todo o benefício.
          Dopamina de scroll infinito recarrega o mesmo circuito que você acabou de disciplinar. Pausa deve ser cerebralmente vazia — água, janela,
          caminhar.
        </Callout>
      </Section>

      <Section title="Estrutura semanal sugerida" accent={ACCENT}>
        <ArchDiagram title="Semana com Deep Work blocks" accent={ACCENT}>{`
  Segunda      Terça       Quarta      Quinta      Sexta
  ───────────────────────────────────────────────────────────
  09-11  DEEP │ 09-11  DEEP │ 09-11 SRS │ 09-11 DEEP │ 09-11 DEEP
  pomodoros  │              │ + leitura │            │
  (aquece)   │  bloco forte │ (misturar)│            │
  ───────────┼──────────────┼───────────┼────────────┼───────────
  11-12 email│ 11-12 tasks  │ 11-12     │  idem      │ flex
  ───────────────────────────────────────────────────────────
  Tarde: reuniões, shallow work, responder, organizar
        `}</ArchDiagram>
        <p>
          Deep Work na manhã aproveita ciclo circadiano (pico cognitivo ~2-4h após acordar). SRS/revisão espaçada no meio — exige foco, mas menos do que
          conteúdo novo. Tarde: tudo que pode ser interrompido. Noite: prática distribuída leve (ex: 5 cards de SRS).
        </p>
      </Section>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Preciso de app/ferramenta especial?"
          a="Não. Timer do celular (em modo avião, aberto só pra timer) resolve. Se quiser algo mais bonito: Pomofocus, Forest, Flow. Mas timer de cozinha de verdade ainda é o mais honesto — fica na sua mesa, funciona sem estar online."
        />
        <QAItem
          q="Não consigo 25 min seguidos — o que fazer?"
          a={<>Comece com <strong>10 min</strong>. Sim, dez. Por 1 semana. Depois 15. Depois 20. Focar é músculo. Ninguém que corre maratona começou correndo 42km. Aceite a pequena dose e aumente gradualmente.</>}
        />
        <QAItem
          q="E se eu for interrompido sem querer (filho chora, entrega chega)?"
          a={<>Cirillo dizia: &ldquo;se interrompido, o pomodoro não conta&rdquo;. Recomeça. O ponto não é punição — é proteger o <em>hábito</em> de só marcar pomodoros que foram de verdade. Com o tempo você descobre que é mais fácil recomeçar do que desistir.</>}
        />
        <QAItem
          q="Deep Work exige vida sem filhos, chefe exigente, 2h livres por dia. E se eu não tiver?"
          a="Cal Newport chama isso de &ldquo;Deep Work Rhythmic&rdquo; — 1h de manhã cedo (5h30-6h30) antes da casa acordar, ou 1h na hora do almoço. Mesmo 45 min/dia de deep work, 5 dias por semana = 3,75h por semana = mais que quem tenta 5h corridas no sábado (e falha)."
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> attention residue tira 3-5h/dia invisíveis · Pomodoro vence procrastinação (25 min é pouco, você topa) · Deep Work
        produz trabalho criativo (60-120 min, sem interrupção) · celular no modo avião em outro cômodo {'>'} qualquer app · melhor dose por 90 dias que
        ambição por 5. Comece com 10 min hoje — não amanhã.
      </Callout>
    </div>
  );
}
