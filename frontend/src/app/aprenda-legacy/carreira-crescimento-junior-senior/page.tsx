import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('carreira-crescimento-junior-senior');

const ACCENT = '#34d399';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre um dev pleno e um sênior?',
    options: [
      'Sênior conhece mais tecnologias e escreve código mais rápido',
      'Sênior resolve problemas de negócio, não só problemas técnicos. Ele questiona o que deve ser construído, antecipa riscos, mentora o time, e seu impacto se multiplica além do seu próprio código',
      'A diferença é apenas tempo de experiência — 5+ anos vira sênior automaticamente',
      'Sênior é quem conhece todas as camadas da stack, do front ao infra',
    ],
    correct: 1,
    explanation:
      'A virada de pleno para sênior é qualitativa, não quantitativa. Pleno executa bem tarefas definidas. Sênior define quais tarefas devem existir, questiona requisitos vagos, propõe trade-offs de arquitetura, e seu impacto é medido pelo time, não pelo código individual. O indicador mais claro: sênior faz as pessoas ao redor produzirem melhor.',
  },
  {
    question: 'Por que muitos bons programadores ficam estagnados na carreira?',
    options: [
      'Porque não estudam tecnologias suficientes para avançar',
      'Porque focam apenas em habilidades técnicas e negligenciam: comunicação com stakeholders, capacidade de influenciar sem autoridade, visibilidade do próprio trabalho, e desenvolvimento de outros — as habilidades que diferenciam pleno de sênior',
      'Porque não fazem entrevistas suficientes para negociar aumentos',
      'Porque o mercado brasileiro não valoriza profissionais técnicos',
    ],
    correct: 1,
    explanation:
      'O "teto técnico" é real: você pode ser excelente em código e não avançar porque falta o segundo conjunto de habilidades — o que algumas empresas chamam de "skills de staff". Comunicar trade-offs para não-técnicos, influenciar decisões de produto, tornar outros mais produtivos, e ter visibilidade estratégica são as habilidades que destravam sênior e staff engineer.',
  },
  {
    question: 'Como acelerar a progressão de júnior para pleno em menos de 2 anos?',
    options: [
      'Fazer o máximo de cursos online possível e ter o maior número de certificações',
      'Entregar consistentemente (nunca perder prazo), pedir e agir em cima de feedback explicitamente, assumir problemas difíceis voluntariamente, e documentar aprendizados publicamente — visibilidade acelera reconhecimento',
      'Trabalhar mais horas — demonstrar dedicação acima da média é o caminho mais rápido',
      'Mudar de emprego a cada 6 meses para obter promoções mais rápidas',
    ],
    correct: 1,
    explanation:
      'A aceleração vem de trabalho em problemas de alta visibilidade + feedback loop curto. Táticas concretas: (1) nunca perder um prazo sem avisar com antecedência; (2) fazer perguntas de qualidade, não quantidade; (3) documentar soluções para outros não repetirem o mesmo problema; (4) pedir 1:1 mensal com sênior ou gestor com pergunta específica de desenvolvimento. Quem faz isso chega a pleno em 18 meses vs média de 3-4 anos.',
  },
  {
    question: 'O que é o "shadow board" e como usar para crescer em empresa grande?',
    options: [
      'Um grupo informal de programadores sênior que reviewam código sem ser solicitados',
      'Participar voluntariamente de iniciativas cross-time, comitês, ou projetos estratégicos além das suas responsabilidades diretas — cria visibilidade com liderança sênior e demonstra interesse além do escopo do seu cargo',
      'Criar um grupo no Slack para discutir tecnologias novas sem aprovação da liderança',
      'Fazer pair programming com sêniors sem agenda formal para aprender mais rápido',
    ],
    correct: 1,
    explanation:
      'Em empresas com mais de 100 pessoas, promoções raramente acontecem sem visibilidade com tomadores de decisão além do seu gestor imediato. Participar de guild de arquitetura, comitê de entrevistas, iniciativa de diversidade ou grupo de trabalho estratégico coloca você em contato com decisores. Não é política — é construir contexto e ser visto contribuindo além do seu escopo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="carreira-crescimento-junior-senior"
      title="Crescimento Junior a Sênior: o que ninguém te conta"
      icon="📈"
      xp={75}
      readTime={13}
      trailName="Carreira Digital"
      trailColor={ACCENT}
      nextSlug="carreira-entrevista-br"
      nextTitle="Entrevistas no Brasil: como se preparar e performar"
      relatedSlugs={['carreira-portfolio-digital', 'comunicacao-feedback', 'comunicacao-inteligencia-emocional']}
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
        A diferença entre junior, pleno, sênior e staff não é apenas tempo ou tecnologias dominadas.
        É uma mudança qualitativa de como você pensa e impacta. Este módulo mapeia o que realmente
        diferencia cada nível e quais ações concretas aceleram essa progressão — com base em como
        empresas tech brasileiras e internacionais fazem promoções de verdade.
      </p>

      <Section title="O mapa real dos níveis de carreira tech" accent={ACCENT}>
        <LayerStack
          title="Progressão de carreira técnica — o que muda em cada nível"
          accent={ACCENT}
          separatorLabel="amplifica impacto →"
          layers={[
            { label: 'Júnior', content: 'Aprende fazendo, precisa de direção clara, entrega tarefas bem definidas', note: '0-2 anos', tone: 'default' },
            { label: 'Pleno', content: 'Executa com autonomia, resolve problemas técnicos, quebra tarefas grandes em pequenas', note: '2-5 anos', tone: 'writable' },
            { label: 'Sênior', content: 'Define o que deve ser construído, multiplica o time, questiona requisitos', note: '5+ anos ou acelerado', tone: 'writable' },
            { label: 'Staff/Principal', content: 'Impacta múltiplos times, define padrões técnicos da empresa, resolve ambiguidade', tone: 'writable' },
            { label: 'Distinguished/Fellow', content: 'Impacto em nível de indústria, raramente explícito em startups BR', note: 'excepcional', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Dimensão', 'Pleno', 'Sênior']}
          rows={[
            ['Escopo', 'Feature ou componente', 'Produto ou sistema inteiro'],
            ['Autonomia', 'Com tasks definidas', 'Define as tasks a partir de objetivo'],
            ['Comunicação', 'Com time técnico', 'Com PM, design, stakeholders de negócio'],
            ['Código', 'Escreve bem', 'Decide quando NÃO escrever'],
            ['Time', 'Contribui individualmente', 'Multiplica produtividade do time'],
            ['Ambiguidade', 'Precisa de requisitos claros', 'Trabalha bem com problema vago'],
          ]}
        />
      </Section>

      <Section title="Aceleração: o que realmente funciona" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Prática', 'Por que funciona', 'Como implementar']}
          rows={[
            ['Pegar problemas difíceis', 'Crescimento acontece fora da zona de conforto', 'Voluntariar-se para bugs críticos ou refactors temidos'],
            ['Documentar e compartilhar', 'Visibilidade + reputação de "quem sabe"', 'Post interno ou externo após resolver problema complexo'],
            ['Feedback estruturado mensal', 'Correção de curso antes de virar padrão', '"O que devo fazer diferente para avançar para sênior?"'],
            ['Mentorar juniores', 'Ensinar solidifica conhecimento + sinal de sênior', 'Pair programming, code review com explicação'],
            ['Comunicar impacto explicitamente', 'Gestores não sabem o que não é contado', 'Update semanal com "fiz X que resultou em Y"'],
          ]}
        />
        <DecisionBox
          scenario="Está há 3 anos como pleno e não recebeu proposta de promoção"
          winner="Conversa direta com gestor + plano de desenvolvimento escrito"
          winnerColor={ACCENT}
          why="Muitos gestores evitam essa conversa proativamente. Iniciar a conversa com 'quero entender o que preciso demonstrar para sênior nos próximos 6 meses' força clareza de ambos os lados e cria accountability."
          alternatives={[
            { name: 'Processo seletivo externo', note: 'Oferta externa é o argumento mais eficaz para promoção — mas tenha cuidado com contraoferta' },
            { name: 'Mudar de empresa', note: 'Estudos mostram 20-30% de aumento salarial em mudança vs 5-10% em promoção interna — às vezes é a melhor opção' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Vale mais mudar de empresa ou esperar promoção interna?"
          a={<>Dados de 2024: promoção interna média no Brasil aumenta salário em 8-15%. Mudança de empresa para nível acima: 20-40% de aumento. Para sênior, a mudança tem ROI financeiro claro. O contrapeso: conhecimento do produto/time tem valor real e nova empresa tem curva de aprendizado de 3-6 meses. Estratégia recomendada: tente promoção interna primeiro com prazo definido (6 meses). Se não acontecer, o processo seletivo externo é legítimo e também serve de termômetro de mercado.</>}
        />
        <QAItem
          q="Como ser sênior técnico sem querer virar gestor?"
          a={<>A trilha técnica (Individual Contributor) é a alternativa à gestão em empresas maduras. Staff Engineer, Principal Engineer, Distinguished Engineer são cargos de alto impacto sem responsabilidade de gestão de pessoas. Em startups brasileiras os títulos variam, mas o conceito existe: o tech lead que não gerencia diretamente é comum. Se sua empresa não tem essa trilha, isso é informação importante sobre seu teto de crescimento lá.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Sênior resolve problemas de negócio, não só técnicos — essa é a
        virada qualitativa. Estagnação em pleno geralmente é por falta de visibilidade e comunicação,
        não falta de habilidade técnica. Pegue problemas difíceis voluntariamente. Documente e compartilhe
        soluções. Converse explicitamente com gestor sobre o que falta para a próxima promoção. Promoção
        interna: 8-15% de aumento. Mudança de empresa: 20-40% — tenha isso como referência.
      </Callout>
    </div>
  );
}
