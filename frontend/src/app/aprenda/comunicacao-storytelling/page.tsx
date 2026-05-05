import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('comunicacao-storytelling');

const ACCENT = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que fatos em histórias são lembrados muito mais do que fatos isolados?',
    options: [
      'Porque histórias são mais longas e repetem os fatos mais vezes',
      'Porque histórias ativam amígdala e hipocampo (emoção e memória) além do neocórtex racional. Fatos sozinhos ativam só processamento lógico — retenção de 5% após 10 min. Fatos em história: 65% (pesquisa Chip Heath)',
      'Porque histórias usam vocabulário mais simples',
      'Porque histórias têm início, meio e fim e o cérebro prefere sequências ordenadas',
    ],
    correct: 1,
    explanation:
      'Neural coupling (Uri Hasson, Princeton) mostra que ao ouvir uma história, as mesmas regiões cerebrais do narrador ativam no ouvinte. Isso inclui as áreas emocionais e de memória — não apenas as de processamento de linguagem. Dados sem contexto narrativo ficam no neocórtex e evaporam. Dados dentro de história ficam ancorados em emoção.',
  },
  {
    question: 'Qual é a estrutura dos 3 atos aplicada a contexto profissional?',
    options: [
      'Problema, solução, chamada para ação',
      'O mundo antes (contexto do problema) → a virada (conflito, ação, dificuldades) → o mundo depois (resultado e impacto). Aplicável a qualquer narrativa: entrevista de emprego, apresentação para executivos, defesa de ideia',
      'Situação, tarefa, resultado',
      'Introdução, desenvolvimento, conclusão',
    ],
    correct: 1,
    explanation:
      'A estrutura de 3 atos é universal porque mapeia como o cérebro processa mudança. Ato 1 cria o status quo e o problema. Ato 2 é onde a ação acontece — com dificuldade real, não caminho linear. Ato 3 mostra o contraste com o mundo antes. O Ato 2 é onde a maioria falha: omite as dificuldades por medo de parecer fraco, mas são as dificuldades que criam tensão e tornam a história real.',
  },
  {
    question: 'Como apresentar um resultado de 200ms de redução de latência para uma audiência não-técnica?',
    options: [
      'Mostrar gráfico de linha com a métrica ao longo do tempo',
      '"A página carrega tão rápido agora que os usuários não percebem a espera" — traduz o número técnico em experiência vivida pelo ouvinte. Técnica de ancoragem: compare com algo familiar ao invés de dar a unidade técnica',
      'Converter para percentual: "reduzimos latência em X%"',
      'Explicar o que são milissegundos antes de apresentar o número',
    ],
    correct: 1,
    explanation:
      'Números técnicos são percebidos diferente por audiências diferentes. 200ms é irrelevante para um CEO, mas "a página que demorava o suficiente para o usuário perceber agora parece instantânea" é compreensível por qualquer pessoa. Ancoragem em experiência familiar é a técnica mais eficaz para traduzir métricas técnicas sem infantilizar a audiência.',
  },
  {
    question: 'Qual estrutura de post no LinkedIn tem maior engajamento?',
    options: [
      'Começar com uma conquista para provar credibilidade antes de dar o conteúdo',
      '"Eu costumava acreditar que [X]. Então aconteceu [Y]. Aprendi que [Z]" — começa com um problema ou crença errada que o leitor também já teve, cria identificação antes de qualquer credencial',
      'Listas numeradas de dicas rápidas com emojis em cada item',
      'Perguntas retóricas que provoquem reflexão',
    ],
    correct: 1,
    explanation:
      'O post de maior engajamento no LinkedIn começa com tensão ou problema real — não com conquista. Quando você abre com uma crença que estava errada, qualquer leitor que também a teve se identifica imediatamente. Depois vem a virada (o que aconteceu) e o aprendizado (o que mudou). Isso é narrativa de 3 atos comprimida em 150 palavras.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comunicacao-storytelling"
      title="Storytelling profissional: contar histórias que convencem"
      icon="📖"
      xp={55}
      readTime={14}
      trailName="Comunicação Humana"
      trailColor={ACCENT}
      nextSlug="comunicacao-feedback"
      nextTitle="Dar e receber feedback"
      relatedSlugs={['comunicacao-falar-em-publico', 'comunicacao-reunioes', 'marketing-personal-branding']}
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
        Dados convencem o neocórtex. Histórias convencem o ser humano inteiro. O profissional que domina storytelling
        não é aquele que "conta bem" — é aquele que{' '}
        <strong>estrutura informação para que ela seja lembrada e gere ação</strong>. Essa é uma habilidade técnica,
        não um talento nato.
      </p>

      <Section title="Por que o cérebro responde a histórias" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Neural coupling é o fenômeno pelo qual, ao ouvir uma história, as mesmas regiões cerebrais do narrador
          ativam no ouvinte. Você não apenas processa a informação — você a vive. Isso explica por que histórias
          criam empatia e memória onde dados sozinhos falham.
        </p>
        <Callout tone="info">
          Pesquisa de Chip Heath (Stanford): em experimento com estudantes, fatos são lembrados por 5% das pessoas
          após 10 minutos. Fatos apresentados dentro de uma história: lembrados por 65%. A estrutura narrativa multiplica
          retenção por 13 — sem adicionar nenhuma informação nova.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Formato', 'Regiões ativadas', 'Retenção média (10 min)', 'Resposta emocional']}
          rows={[
            ['Fatos isolados', 'Neocórtex (processamento lógico)', '5%', 'Baixa'],
            ['Dados com contexto narrativo', 'Neocórtex + amígdala + hipocampo', '65%', 'Alta'],
            ['História com dado ancora', 'Todas + cortex motor (simulação de ação)', '{'>'}70%', 'Alta + motivação para agir'],
          ]}
        />
      </Section>

      <Section title="A estrutura narrativa de 3 atos no trabalho" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A estrutura de 3 atos é universal porque mapeia mudança — e mudança é o que toda comunicação profissional
          precisa provocar: mudar a perspectiva, mudar uma decisão, mudar um comportamento.
        </p>
        <LayerStack
          title="Os 3 atos aplicados ao contexto profissional"
          accent={ACCENT}
          separatorLabel="NARRATIVA"
          layers={[
            { label: 'Ato 1 — O mundo antes', content: 'Contexto: como as coisas eram, qual era o problema. Dê ao ouvinte referência do ponto de partida.', note: '← sem contexto, o resultado não tem peso', tone: 'default' },
            { label: 'Ato 2 — A virada', content: 'O que aconteceu, o que foi feito, as dificuldades reais. Este é onde a maioria falha — omite as dificuldades por medo de parecer fraco.', note: '← dificuldades são o que torna a história real', tone: 'writable' },
            { label: 'Ato 3 — O mundo depois', content: 'O que mudou, o impacto real. O contraste com o Ato 1 é o que dá peso ao resultado.', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'Como aplicar os 3 atos']}
          rows={[
            ['Resposta "me conte sobre um desafio" em entrevista', 'Ato 1: situação e problema real. Ato 2: o que você fez + dificuldades. Ato 3: resultado mensurável + aprendizado'],
            ['Apresentação de resultado para executivos', 'Ato 1: contexto anterior (baseline). Ato 2: o que foi feito + obstáculos. Ato 3: impacto no negócio em número ou comparação clara'],
            ['Defender uma ideia impopular', 'Ato 1: situação atual e por que é problemática. Ato 2: o que outros tentaram + por que não funcionou. Ato 3: como sua proposta resolve diferente'],
          ]}
        />
      </Section>

      <Section title="O framework STAR aprimorado" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          STAR é o framework mais usado em entrevistas comportamentais — e também o mais mal aplicado. A versão
          aprimorada adiciona o "So What" que transforma resposta técnica em comunicação que conecta com o ouvinte.
        </p>
        <LayerStack
          title="STAR + So What"
          accent={ACCENT}
          separatorLabel="ESTRUTURA"
          layers={[
            { label: 'S — Situation', content: 'Contexto específico. "Em 2024, no projeto de migração de pagamentos..."', note: '← específico, não genérico', tone: 'default' },
            { label: 'T — Task', content: 'Qual era seu papel ou responsabilidade específica nessa situação', tone: 'default' },
            { label: 'A — Action', content: 'O que você fez — com foco nas suas decisões, não nas do time. Use "eu", não "a gente"', note: '← ação sua, não coletiva', tone: 'writable' },
            { label: 'R — Result', content: 'Resultado mensurável: número, percentual, tempo, dinheiro, impacto em usuários', note: '← sempre quantificado se possível', tone: 'writable' },
            { label: 'SW — So What', content: 'Por que isso importa para o ouvinte? "Isso nos deu capacidade de X, o que significa que agora podemos Y"', tone: 'success' },
          ]}
        />
        <Callout tone="warn">
          O erro mais comum no STAR: a Action descreve o que "a gente fez" sem deixar claro o que você especificamente
          decidiu e fez. Em entrevista, o entrevistador quer avaliar você — não o time. Use "eu" deliberadamente.
        </Callout>
      </Section>

      <Section title="Como contar números de forma que as pessoas entendam" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Métricas técnicas são invisíveis para quem não vive no contexto. A tradução de número para experiência é a
          habilidade que separa quem apresenta resultados de quem realmente os comunica.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Versão técnica', 'Versão comunicada', 'Técnica usada']}
          rows={[
            ['Reduzimos latência em 200ms', '"A página carrega tão rápido que usuários não percebem a espera"', 'Tradução para experiência vivida'],
            ['Processamos 50TB por dia', '"Equivale a armazenar a coleção completa de todas as bibliotecas públicas do Brasil, todo dia"', 'Ancoragem em referência familiar'],
            ['Taxa de conversão subiu 0.3%', '"Com 10 milhões de usuários, isso é 30 mil clientes adicionais por mês — R$900k em receita incremental"', 'Escalar o número para impacto real'],
            ['Reduzimos incidentes em 70%', '"O time passou de apagar incêndio toda semana para um incidente a cada dois meses"', 'Tradução para frequência de vida real'],
          ]}
        />
        <Callout tone="info">
          Para audiências não-técnicas: nunca assuma que um número fala por si. Sempre adicione: "O que isso significa
          na prática é..." Isso não é infantilizar — é respeitar que o ouvinte não vive no mesmo contexto que você.
        </Callout>
      </Section>

      <Section title="Storytelling no LinkedIn e conteúdo digital" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          LinkedIn em 2026 é o maior canal profissional do Brasil — e a maioria das pessoas o usa errado: posts de
          conquista sem contexto, listas genéricas de "dicas" ou celebrações de aprovações. O que funciona é o oposto.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Post genérico', 'Post com história', 'Diferença']}
          rows={[
            ['"5 dicas para ser um dev melhor"', '"Fui demitido depois de 3 anos. O que aprendi sobre o que realmente importa"', 'Identificação emocional imediata vs lista sem contexto'],
            ['"Feliz em anunciar que fui promovido a Senior!"', '"Por 2 anos achei que promoção era sobre trabalhar mais. Estava errado. Veja o que mudou."', 'Tensão narrativa vs anúncio unilateral'],
            ['"O mercado de IA está crescendo muito"', '"Mandei 47 mensagens no LinkedIn sem resposta. Na 48a, mudei uma coisa. Funcionou."', 'Especificidade e aprendizado vs abstração'],
          ]}
        />
        <Callout tone="success">
          A estrutura que mais funciona no LinkedIn: <strong>"Eu costumava acreditar que [X]. Então aconteceu [Y].
          Aprendi que [Z]."</strong> — começa com crença errada que o leitor também já teve (identificação), passa
          pela virada (tensão), termina no aprendizado (valor). Três atos em três frases.
        </Callout>
        <LayerStack
          title="Como contar uma falha como história de crescimento"
          accent={ACCENT}
          separatorLabel="ESTRUTURA"
          layers={[
            { label: 'Contexto sem drama', content: 'Descreva o que aconteceu factualmente, sem auto-flagelação', note: '← objetividade cria credibilidade', tone: 'default' },
            { label: 'O que você pensava antes', content: 'Qual era a crença ou decisão que levou à falha — sem justificativas', tone: 'default' },
            { label: 'O momento de virada', content: 'Quando você percebeu que estava errado e o que fez diferente', tone: 'writable' },
            { label: 'Aprendizado específico', content: 'O que você faz diferente hoje — concreto, não platitudes', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Storytelling não é manipulação?"
          a={<>Estrutura narrativa é uma forma de organizar informação que respeita como o cérebro humano processa e retém. Manipulação usa emoção para enganar — você apresenta informações falsas ou omite contexto relevante. Storytelling com dados reais e contexto honesto é o oposto: você aumenta a probabilidade de que informações verdadeiras sejam compreendidas e lembradas.</>}
        />
        <QAItem
          q="Como contar história quando os resultados foram ruins?"
          a={<>Os melhores casos de storytelling profissional incluem falhas, não as ocultam. A chave é: Ato 1 (o que você esperava), Ato 2 (o que aconteceu diferente e o que foi feito sob essa condição), Ato 3 (o que foi salvo ou aprendido). Um projeto que fracassou mas gerou aprendizado que mudou a abordagem seguinte é uma boa história — desde que você seja específico sobre o aprendizado.</>}
        />
        <QAItem
          q="Quanto tempo leva para desenvolver storytelling profissional?"
          a={<>Competência básica em 30 dias com prática deliberada: 1 STAR por semana escrito e revisado, 1 post LinkedIn por quinzena, 1 apresentação de resultado por mês com estrutura de 3 atos. Fluência natural em 3-6 meses de uso regular. A principal aceleração é feedback — gravar apresentações e ter alguém dar feedback específico encurta o ciclo significativamente.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Fatos em histórias têm 13x mais retenção que fatos isolados — é neurociência, não
        estilo. A estrutura de 3 atos funciona para entrevista, apresentação executiva e post no LinkedIn. STAR +
        "So What" é o framework de entrevista que conecta resultado técnico ao interesse do ouvinte. Números precisam
        ser traduzidos em experiência, não apenas apresentados. Dificuldades no Ato 2 são o que tornam a história
        real — não as omita.
      </Callout>
    </div>
  );
}
