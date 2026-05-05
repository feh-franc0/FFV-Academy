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

export const metadata = getModuleMetadata('comunicacao-reunioes');

const ACCENT = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o principal diferencial entre os 4 tipos de reunião?',
    options: [
      'O número de participantes',
      'O objetivo e o que cada um exige — sync (alinhamento rápido), decisão (debate + deliberação), brainstorming (divergência antes de convergência), 1:1 (relação bilateral). Confundir tipos gera reuniões que não entregam o resultado esperado',
      'A plataforma usada (Zoom, Meet, presencial)',
      'O cargo de quem convocou',
    ],
    correct: 1,
    explanation:
      'Cada tipo de reunião tem estrutura, facilitação e output esperados diferentes. Tratar uma reunião de decisão como sync resulta em nenhuma decisão tomada. Tratar um brainstorming como reunião de decisão mata a divergência criativa antes de florescer. Identificar o tipo antes de convocar é o primeiro passo para reuniões produtivas.',
  },
  {
    question: 'Como discordar em reunião sem parecer difícil ou obstrucionista?',
    options: [
      'Esperar a reunião terminar e enviar email depois',
      '"Eu entendo a lógica, e vejo um risco que não apareceu ainda: [X]. Como vocês pensam nisso?" — você valida a perspectiva do outro antes de apresentar a sua, o que reduz defensividade e mantém a discussão produtiva',
      'Votar contra na tomada de decisão formal',
      'Pedir mais tempo para avaliar antes de decidir',
    ],
    correct: 1,
    explanation:
      'Discordar produtivamente exige validar antes de divergir. A técnica "Yes, and" do teatro de improvisação aplicada a reuniões: primeiro você reconhece a validade da perspectiva do outro, depois adiciona sua visão. Isso evita que a discussão vire ego-versus-ego e mantém o foco no problema.',
  },
  {
    question: 'Como fechar uma reunião de forma que os próximos passos realmente aconteçam?',
    options: [
      'Enviar email de resumo no dia seguinte',
      'Recapitular em voz alta ao final: decisões tomadas + cada próximo passo com dono e prazo específicos. O que não tem dono e prazo não acontece — isso é fato empiricamente verificado em organizações',
      'Criar card no Jira durante a reunião',
      'Pedir que cada pessoa anote seus próprios próximos passos',
    ],
    correct: 1,
    explanation:
      'O fechamento verbal ao final da reunião é o momento de comprometimento explícito. Quando você lê os próximos passos em voz alta com nome e prazo, cada pessoa confirma (ou corrige) sua responsabilidade. Isso é muito mais eficaz do que email posterior, porque cria comprometimento público no momento da decisão.',
  },
  {
    question: 'O que fazer quando alguém desvia do assunto da reunião com um ponto legítimo mas fora do escopo?',
    options: [
      'Ignorar e continuar o assunto original',
      '"Ótimo ponto — vamos anotar para não perder. Para não perdermos o fio, precisamos resolver X primeiro." — você valida, preserva o ponto e protege o foco sem desrespeitar quem trouxe',
      'Pedir que a pessoa crie uma reunião separada para o assunto',
      'Votar se o grupo quer mudar o foco da reunião',
    ],
    correct: 1,
    explanation:
      'O parking lot (lista de pontos válidos fora do escopo) é uma ferramenta de facilitação clássica. Ao anotar explicitamente, você sinaliza que o ponto importa — mas que a reunião atual tem um objetivo que precisa ser protegido. Sem isso, reuniões viram conversas sobre tudo e não decidem nada.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comunicacao-reunioes"
      title="Comunicação em reuniões: se posicionar e ser ouvido"
      icon="🤝"
      xp={50}
      readTime={13}
      trailName="Comunicação Humana"
      trailColor={ACCENT}
      nextSlug="comunicacao-storytelling"
      nextTitle="Storytelling profissional"
      relatedSlugs={['comunicacao-falar-em-publico', 'comunicacao-storytelling', 'comunicacao-feedback']}
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
        71% das reuniões são consideradas improdutivas pelos participantes (Harvard Business Review, 2025). O{' '}
        <strong>profissional que sabe conduzir e se comunicar em reuniões</strong> é percebido automaticamente como
        mais sênior — independente do cargo. Reunião bem facilitada é produto, não overhead.
      </p>

      <Section title="Os 4 tipos de reunião e o que cada um exige" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Confundir o tipo de reunião é a causa raiz da maioria das reuniões improdutivas. Cada tipo tem objetivo,
          estrutura e facilitação diferentes — e misturá-los produz o pior de todos.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Objetivo', 'Duração ideal', 'Output esperado']}
          rows={[
            ['Sync (alinhamento)', 'O que mudou, o que está bloqueado', '15-30 min', 'Visibilidade compartilhada, desbloqueios'],
            ['Reunião de decisão', 'Debate estruturado + deliberação', '45-60 min', 'Decisão explícita com dono e prazo'],
            ['Brainstorming', 'Divergência antes de convergência', '60-90 min', 'Lista priorizada de ideias para avaliação'],
            ['1:1', 'Relação bilateral — crescimento, bloqueios, alinhamento', '30-60 min', 'Confiança, alinhamento, próximos passos do liderado'],
          ]}
        />
        <Callout tone="warn">
          1:1 não é status report. A agenda é de quem recebe a reunião, não de quem convoca. Perguntar "como estão as
          coisas?" é diferente de perguntar "quanto você entregou essa semana?". Líderes que usam 1:1 como cobrança
          destroem a segurança psicológica que faz o encontro ter valor.
        </Callout>
      </Section>

      <Section title="Como se posicionar sem dominar" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A voz mais alta na sala não é a mais influente. Quem posiciona uma ideia com clareza e estrutura antes da
          maioria tem vantagem — não quem fala mais.
        </p>
        <LayerStack
          title="Técnica Yes-And aplicada a reuniões"
          accent={ACCENT}
          separatorLabel="SEQUÊNCIA"
          layers={[
            { label: 'Escute de verdade', content: 'Antes de formular resposta, certifique-se de que entendeu o ponto do outro completamente', note: '← sem isso, discussão vira debate de surdos', tone: 'default' },
            { label: 'Valide a perspectiva', content: '"Faz sentido pensar assim considerando X..." ou "A lógica que você usou é válida para o cenário Y..."', note: '← reduz defensividade do outro', tone: 'default' },
            { label: 'Adicione sua visão', content: '"...e tem um ponto que ainda não apareceu: [X]"', note: '← você diverge sem invalidar', tone: 'writable' },
            { label: 'Convide para pensar junto', content: '"Como vocês veem isso?" — abre para o grupo, não você contra todos', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Comportamento', 'Percepção', 'Como corrigir']}
          rows={[
            ['Falar muito sem estrutura', 'Insegurança, enchimento', 'PREP antes de abrir a boca'],
            ['Nunca falar', 'Invisível, desengajado', 'Prepare 1 pergunta ou comentário antes de entrar'],
            ['Interromper', 'Dominador, sem escuta', 'Aguarde pausa natural, anote para não esquecer'],
            ['Jargão excessivo para audiência mista', 'Excluidor, arrogante', 'Calibre vocabulário para o nível da sala'],
            ['Checar celular ou notificações', 'Desrespeitoso, não comprometido', 'Telefone virado, notificações silenciadas'],
          ]}
        />
      </Section>

      <Section title="Facilitar reuniões que terminam com decisão" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Reunião sem decisão ou próximo passo claro é conversa de alto custo. Facilitar bem é uma habilidade, não um
          dom — e pode ser aprendida com estrutura.
        </p>
        <LayerStack
          title="Estrutura de reunião de decisão eficaz"
          accent={ACCENT}
          separatorLabel="MOMENTOS"
          layers={[
            { label: 'Abertura (2 min)', content: '"O objetivo desta reunião é X. Ao final, vamos decidir Y. Temos Z minutos."', note: '← nunca "bom, então..." — seja direto', tone: 'default' },
            { label: 'Contexto (5-10 min)', content: 'Apresentar os fatos relevantes, o que já foi tentado, qual é o trade-off', note: '← fatos, não opiniões ainda', tone: 'default' },
            { label: 'Discussão estruturada', content: 'Cada perspectiva importante ouvida, parking lot para desvios, facilitador protege o foco', note: '← 60% do tempo', tone: 'writable' },
            { label: 'Decisão explícita', content: 'Quem decide? Como? (consenso, voto, dono final?) Declare a decisão em voz alta', note: '← sem isso não é reunião de decisão', tone: 'writable' },
            { label: 'Fechamento (5 min)', content: 'Próximos passos + dono + prazo em voz alta. Confirmar que todos entenderam igual', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          Template de agenda eficaz: (1) Objetivo da reunião em 1 frase, (2) Contexto necessário para quem não está a
          par, (3) Questões a decidir numeradas, (4) Quem tem voto ou decisão final. Envie 24h antes — reunião sem
          agenda prévia é reunião de improviso.
        </Callout>
      </Section>

      <Section title="Reuniões remotas e híbridas" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Híbrido é o formato mais difícil: quem está no escritório tem vantagem de contexto, energia e linguagem
          corporal que o remoto não captura. Compensar isso requer intenção explícita.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que fazer', 'Por quê']}
          rows={[
            ['Câmera desligada em reunião importante', 'Ligar câmera se quer ser levado a sério', 'Presença visual afeta percepção de engajamento'],
            ['Único remoto em sala cheia', 'Pedir ao facilitador que priorize sua voz nas decisões', 'Remoto é invisível por padrão em híbrido'],
            ['Muitas reuniões de alinhamento', 'Substituir por Loom (vídeo assíncrono)', 'Loom de 5 min substitui reunião de 30 min'],
            ['Brainstorming remoto', 'Usar Miro ou FigJam com sticky notes digitais', 'Quadro branco digital nivela participação'],
            ['Reunião que poderia ser email', 'Converter em documento com comentários', 'Se não precisa de decisão síncrona, não precisa de call'],
          ]}
        />
        <Callout tone="success">
          Regra de ouro: se a reunião pode ser um email estruturado com comentários, não deveria ser reunião. Mas se
          vai ser reunião, seja 100% presente — metade-presente piora mais do que ausência com atualização assíncrona.
        </Callout>
      </Section>

      <Section title="Como lidar com padrões difíceis em reuniões" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Reuniões são sistemas sociais — e certos padrões se repetem independentemente da empresa ou cultura.
          Reconhecê-los e ter resposta preparada é diferencial de quem lidera bem.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Padrão', 'Como lidar', 'O que NÃO fazer']}
          rows={[
            ['Pessoa que domina e não deixa outros falarem', 'Abrir explicitamente: "Vamos ouvir quem ainda não falou sobre isso"', 'Ignorar — os outros desengajam permanentemente'],
            ['Tangentes frequentes', 'Parking lot em voz alta: "Ótimo ponto, anoto aqui para não perder"', 'Deixar o desvio dominar a reunião'],
            ['Decisão que não anda por falta de dono', 'Nomear dono explicitamente e confirmar aceitação na sala', 'Assumir que "o time vai decidir" sem dono'],
            ['Conflito pessoal disfarçado de debate técnico', 'Refocar no critério objetivo: "Qual é o critério que usamos para decidir?"', 'Deixar virar discussão de ego'],
            ['Reunião que sempre estoura o tempo', 'Guardar 10 min para fechamento, anunciar quando faltar 10 min', 'Deixar a reunião terminar sem próximos passos'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como participar de reunião em que fui incluído mas não tenho contribuição clara?"
          a={<>Duas opções: (1) antes da reunião, perguntar ao organizador qual é o papel esperado de você — se não há papel claro, talvez você não precisasse estar. (2) Se você foi e não tem contribuição óbvia, sua função pode ser aprender o contexto e fazer perguntas relevantes. Silêncio absoluto em toda reunião é pior que participar com perguntas.</>}
        />
        <QAItem
          q="Como conduzir reunião em que sou o mais júnior?"
          a={<>Preparação compensa hierarquia. Se você é o facilitador, você controla a estrutura — não o conteúdo. Abra com objetivo claro, gerencie o tempo, feche com próximos passos. Facilitação técnica competente é reconhecida independentemente de nível. Se não é o facilitador, contribua com 1 pergunta ou observação bem colocada — mais eficaz do que múltiplas contribuições dispersas.</>}
        />
        <QAItem
          q="Com que frequência 1:1 com meu gestor deveria acontecer?"
          a={<>Semanal é o padrão recomendado para a maioria das relações gestor-liderado. Quinzenal funciona quando a relação já tem alto nível de confiança e contexto. Mensal é insuficiente para acompanhamento real de carreira e bloqueios. Em períodos de mudança ou onboarding: semanal é mínimo.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Identifique o tipo de reunião antes de estruturá-la — cada tipo tem estrutura
        diferente. Discorde validando antes de divergir. Feche toda reunião com próximos passos + dono + prazo em voz
        alta. Híbrido exige intenção explícita para igualar presença. Facilitação competente é reconhecida
        independentemente de cargo.
      </Callout>
    </div>
  );
}
