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

export const metadata = getModuleMetadata('comunicacao-escuta-ativa');

const ACCENT = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o principal erro na escuta ativa que a maioria das pessoas comete?',
    options: [
      'Fazer anotações enquanto o interlocutor fala',
      'Preparar a resposta enquanto o outro ainda está falando — você para de processar o conteúdo e começa a formular a sua réplica, perdendo informação crítica',
      'Manter contato visual constante durante toda a conversa',
      'Perguntar mais de uma vez para confirmar entendimento',
    ],
    correct: 1,
    explanation:
      'O cérebro não consegue escutar com atenção plena e formular resposta simultaneamente. Quando você começa a pensar na resposta, você processa apenas ~30% do que o interlocutor diz depois disso. A solução: confie que você conseguirá formular uma boa resposta DEPOIS que o outro terminar. Silêncio de 2-3 segundos antes de responder é sinal de qualidade, não fraqueza.',
  },
  {
    question: 'O que é paráfrase reflexiva e quando usá-la?',
    options: [
      'Repetir palavra por palavra o que o outro disse para mostrar que você ouviu',
      'Reformular em suas próprias palavras o que o outro disse, incluindo o sentimento implícito — "se entendi, você está preocupado que X". Valida que você entendeu e dá chance de correção',
      'Fazer perguntas abertas para extrair mais informação do interlocutor',
      'Resumir os principais pontos apenas ao final de reuniões longas',
    ],
    correct: 1,
    explanation:
      'A paráfrase reflexiva tem três camadas: conteúdo (o que foi dito), sentimento (como a pessoa parece estar se sentindo), e implicação (o que isso significa para a situação). "Então você está dizendo que o prazo atual é inviável e isso está gerando pressão na equipe — é isso?" Isso acelera alinhamento, reduz mal-entendidos e faz o interlocutor se sentir realmente ouvido.',
  },
  {
    question: 'Qual a diferença entre escuta empática e escuta para resolver?',
    options: [
      'Escuta empática é mais lenta e menos eficiente em contextos profissionais',
      'Escuta para resolver foca em identificar o problema e propor solução. Escuta empática foca em entender a perspectiva e sentimento do outro — muitas vezes o interlocutor não quer solução, quer ser compreendido primeiro',
      'São equivalentes — qualquer boa escuta resolve o problema do interlocutor',
      'Escuta empática é para contextos pessoais; escuta para resolver é para contextos profissionais',
    ],
    correct: 1,
    explanation:
      'Pular para soluções antes de validar a perspectiva do outro frequentemente cria resistência ("você nem entendeu o que eu disse"). A sequência correta: escuta empática primeiro (valida, parafraseou, o outro se sentiu ouvido), depois escuta para resolver (identifica causa raiz, propõe solução). Em reuniões de feedback e 1:1 isso faz diferença crítica.',
  },
  {
    question: 'Como sinais não-verbais afetam a qualidade da escuta percebida?',
    options: [
      'Sinais não-verbais são irrelevantes em chamadas de vídeo e trabalho remoto',
      'Inclinação do corpo para frente, cabeça levemente inclinada, acenos ocasionais e expressão facial congruente com o conteúdo — esses sinais comunicam "estou aqui" e encorajam o interlocutor a compartilhar mais profundamente',
      'Manter expressão neutra demonstra profissionalismo e imparcialidade',
      'O mais importante é evitar interromper — sinais não-verbais são secundários',
    ],
    correct: 1,
    explanation:
      'Estudos de comunicação mostram que ~55% da mensagem é transmitida por linguagem corporal. Em escuta ativa, seus sinais não-verbais dizem ao interlocutor se pode continuar com profundidade ou se deve abreviar. Em vídeo: câmera na altura dos olhos, boa iluminação facial e microfone de qualidade compensam a perda de sinais presenciais. Olhar para a câmera (não para a tela) simula contato visual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comunicacao-escuta-ativa"
      title="Escuta Ativa: a habilidade que multiplica sua influência"
      icon="👂"
      xp={60}
      readTime={10}
      trailName="Comunicação Humana"
      trailColor={ACCENT}
      nextSlug="comunicacao-networking"
      nextTitle="Networking Estratégico: construir conexões reais"
      relatedSlugs={['comunicacao-feedback', 'comunicacao-reunioes', 'comunicacao-inteligencia-emocional']}
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
        Escuta ativa é a habilidade mais subestimada do profissional digital. Em um mundo de notificações
        e multitarefa, dar atenção genuína é raro — e por isso é poderoso. Quem escuta bem resolve
        problemas mais rápido, influencia sem autoridade e constrói relações de confiança que aceleram carreiras.
      </p>

      <Section title="Por que a maioria das pessoas não escuta de verdade" accent={ACCENT}>
        <LayerStack
          title="Níveis de escuta — do mais comum ao mais eficaz"
          accent={ACCENT}
          separatorLabel="mais profundo →"
          layers={[
            { label: 'Escuta fingida', content: 'Você parece estar ouvindo mas está pensando em outra coisa', note: 'mais comum do que parece', tone: 'default' },
            { label: 'Escuta seletiva', content: 'Você ouve apenas partes que confirmam o que já pensa', tone: 'default' },
            { label: 'Escuta atenta', content: 'Você processa o conteúdo verbal com atenção', tone: 'writable' },
            { label: 'Escuta ativa', content: 'Você processa conteúdo, emoção e contexto — e reflete de volta', tone: 'writable' },
            { label: 'Escuta empática', content: 'Você entra no quadro de referência do outro, suspendendo julgamento', note: 'máxima conexão', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Comportamento', 'Escuta passiva', 'Escuta ativa']}
          rows={[
            ['Enquanto o outro fala', 'Prepara resposta', 'Processa e observa'],
            ['Após o outro terminar', 'Responde imediatamente', 'Pausa 2-3s, parafraseou'],
            ['Quando não entende', 'Assume ou ignora', 'Pergunta para clarificar'],
            ['Sinais não-verbais', 'Neutros ou distraídos', 'Engajados e congruentes'],
            ['Resultado típico', 'Mal-entendidos frequentes', 'Alinhamento na primeira conversa'],
          ]}
        />
      </Section>

      <Section title="Técnicas de escuta ativa para usar hoje" accent={ACCENT}>
        <Callout tone="info">
          <strong>Paráfrase reflexiva:</strong> "Se entendi bem, você está dizendo que [conteúdo] e isso
          está gerando [sentimento/impacto] — é isso?" Essa técnica única reduz 80% dos mal-entendidos
          em reuniões de alinhamento.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Como fazer', 'Quando usar']}
          rows={[
            ['Paráfrase reflexiva', 'Reformule em suas palavras incluindo sentimento', 'Após ponto complexo ou emocional'],
            ['Perguntas abertas', '"Como isso impacta seu time?" não "Isso é problema?"', 'Para aprofundar entendimento'],
            ['Silêncio intencional', 'Pause 2-3s após o outro terminar', 'Sempre — dá tempo para processar'],
            ['Validação emocional', '"Faz sentido você estar preocupado com isso"', 'Antes de propor qualquer solução'],
            ['Resumo de fechamento', '"Para resumir o que conversamos: X, Y, Z — correto?"', 'Ao final de qualquer reunião importante'],
          ]}
        />
      </Section>

      <Section title="Escuta ativa em contextos digitais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Canal', 'Desafio específico', 'Solução']}
          rows={[
            ['Videochamada', 'Delay de áudio, câmera travada', 'Câmera na altura dos olhos, olhar para câmera não tela'],
            ['Slack/texto', 'Perda de tom emocional', 'Confirmar interpretação antes de responder'],
            ['Reunião híbrida', 'Remotos ficam invisíveis', 'Incluir remotos explicitamente por nome'],
            ['1:1 assíncrono', 'Sem sinais não-verbais', 'Fazer mais perguntas abertas que afirmações'],
          ]}
        />
        <DecisionBox
          scenario="Como melhorar escuta em 1:1s semanais com seu gestor ou liderados"
          winner="Paráfrase reflexiva + perguntas abertas"
          winnerColor={ACCENT}
          why="Valida entendimento, demonstra atenção genuína e aprofunda a conversa. Gestores que usam essas técnicas têm equipes com 40% mais engajamento (Gallup 2024)."
          alternatives={[
            { name: 'Anotações em tempo real', note: 'Ajuda memória mas pode sinalizar distração visual' },
            { name: 'Gravação com permissão', note: 'Permite revisitar detalhes mas muda dinâmica da conversa' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="É possível melhorar escuta ativa de forma deliberada?"
          a={<>Sim, com prática estruturada. Exercício: nas próximas 5 conversas, proíba-se de falar antes de parafrasear o que o outro disse. "Só para confirmar, você está dizendo que..." Inicialmente é desconfortável. Após 2 semanas torna-se natural. Segundo pesquisa da Harvard Business School, líderes que praticam escuta ativa durante 30 dias reportam 25% menos retrabalho por mal-entendidos.</>}
        />
        <QAItem
          q="Como escutar bem quando o outro está sendo repetitivo ou impreciso?"
          a={<>Use perguntas de clarificação estruturadas: "Quando você diz X, você quer dizer A ou B?" e "Qual seria um exemplo concreto disso?" Isso redireciona sem interromper abruptamente. Para pessoas repetitivas: valide o ponto principal e pergunte o próximo passo — isso avança a conversa sem invalidar o interlocutor.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Pare de formular respostas enquanto o outro fala — isso é o erro
        mais comum. Use paráfrase reflexiva para confirmar entendimento antes de responder. Pause 2-3
        segundos após o interlocutor terminar. Valide emocionalmente antes de propor soluções. Em
        ambientes digitais: câmera na altura dos olhos, olhe para a câmera. Pratique de forma deliberada
        nas próximas 5 conversas.
      </Callout>
    </div>
  );
}
