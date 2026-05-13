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

export const metadata = getModuleMetadata('comunicacao-falar-em-publico');

const ACCENT = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que a estrutura PREP significa?',
    options: [
      'Prepare, Repeat, Execute, Polish',
      'Point, Reason, Example, Point — tese + justificativa + exemplo concreto + reafirmação. Escala de uma resposta de 30 segundos a uma apresentação de 1h sem mudar a estrutura',
      'Pause, Relax, Engage, Proceed',
      'Plan, Research, Express, Pause',
    ],
    correct: 1,
    explanation:
      'PREP é a estrutura mais versátil para comunicação oral. Começa pela tese (Point), justifica com argumento (Reason), ancora com exemplo real (Example) e reafirma a tese para fixar na memória do ouvinte. Funciona em Q&A de reunião, resposta a executivo, pitch de ideia ou palestra de 45 min.',
  },
  {
    question: 'Por que pausas são poderosas na oratória?',
    options: [
      'Porque preenchem o tempo quando você esquece o que dizer',
      'Porque transmitem confiança e dão tempo para o ouvinte processar — quem sabe o que está dizendo não precisa preencher todo o silêncio. Pausas após pontos importantes aumentam retenção da informação',
      'Porque reduzem o ritmo e cansam menos a voz',
      'Porque parecem mais naturais do que falar continuamente',
    ],
    correct: 1,
    explanation:
      'A pausa intencional é diferente do silêncio por esquecimento. Feita após um ponto forte, sinaliza confiança e dá ao ouvinte tempo para absorver. Palestrantes experientes usam pausas de 2-3 segundos depois de afirmações importantes — algo que parece longo para quem fala é confortável para quem ouve.',
  },
  {
    question: 'Qual erro transforma oratória em leitura de slide?',
    options: [
      'Usar muitos slides com imagens',
      'Colocar texto completo nos slides e ler — o ouvinte lê mais rápido que você fala, e o slide deixa de ser suporte para virar script. Isso sinaliza que você não domina o conteúdo',
      'Ter slides demais para o tempo disponível',
      'Usar fonte pequena nos slides',
    ],
    correct: 1,
    explanation:
      'Slides devem suportar a fala, não substituí-la. Quando há texto completo, o ouvinte lê enquanto você fala — atenção dividida, retenção zero. Regra prática: se o slide faz sentido sem você falando, está errado. Slides ideais têm palavra-chave, número ou imagem que você amplifica com a fala.',
  },
  {
    question: 'Como lidar com perguntas que você não sabe responder em público?',
    options: [
      'Inventar uma resposta plausível para não perder credibilidade',
      '"Não sei agora, vou verificar e te respondo até amanhã" — honestidade estruturada. Admitir desconhecimento com compromisso de retorno aumenta credibilidade, não diminui',
      'Redirecionar a pergunta para outra pessoa na sala',
      'Dizer que a pergunta está fora do escopo da apresentação',
    ],
    correct: 1,
    explanation:
      'Tentar responder algo que você não sabe é muito mais arriscado do que admitir. Profissionais experientes distinguem o que sabem do que não sabem. A fórmula é simples: reconheça a pergunta como boa, admita que não tem a resposta agora, dê um prazo concreto para retornar. Isso demonstra integridade e organização.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comunicacao-falar-em-publico"
      title="Falar em público sem travar"
      icon="🎤"
      xp={55}
      readTime={14}
      trailName="Comunicação Humana"
      trailColor={ACCENT}
      nextSlug="comunicacao-reunioes"
      nextTitle="Comunicação em reuniões"
      relatedSlugs={['comunicacao-reunioes', 'comunicacao-storytelling', 'comunicacao-inteligencia-emocional']}
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
        Em 2026, reuniões híbridas, apresentações de produto e entrevistas por vídeo tornaram falar bem uma{' '}
        <strong>vantagem competitiva mensurável</strong>. Pesquisas mostram que profissionais com boa oratória ganham
        em média 25% mais que pares com habilidade técnica equivalente. A diferença não está no talento — está na
        prática estruturada.
      </p>

      <Section title="O nervosismo não é o problema" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A maioria das pessoas tenta eliminar o nervosismo. Essa é a abordagem errada. O cortisol antes de uma
          apresentação é fisiologicamente idêntico ao que você sente antes de uma atividade esportiva que ama — a
          diferença está no significado que você atribui.
        </p>
        <Callout tone="info">
          Estudo de Amy Cuddy (Harvard): power pose de 2 minutos antes de uma apresentação reduz cortisol em 25% e
          aumenta testosterona. Não é placebo — é fisiologia. Fique de pé, ombros abertos, mãos no quadril por 2
          minutos antes de entrar na sala ou ligar a câmera.
        </Callout>
        <LayerStack
          title="Protocolo anti-nervosismo (30 minutos antes)"
          accent={ACCENT}
          separatorLabel="SEQUÊNCIA"
          layers={[
            { label: 'Preparação física', content: 'Power pose 2 min, respiração 4-7-8 (inhale 4s, hold 7s, exhale 8s)', note: '← ativa parassimpático', tone: 'default' },
            { label: 'Reframe cognitivo', content: 'Substituir "estou nervoso" por "estou animado" — mesma fisiologia, significado diferente', note: '← pesquisa de Alison Wood Brooks, Harvard', tone: 'default' },
            { label: 'Revisão de estrutura', content: 'Revisar apenas os pontos principais, não o texto completo — evita modo de memorização', note: '← 5 min máximo', tone: 'writable' },
            { label: 'Checagem técnica', content: 'Slides, microfone, câmera, internet — eliminar surpresas técnicas', note: '← 10 min antes', tone: 'writable' },
            { label: 'Presença', content: 'Chegue ou entre no call 2 min antes — não inicie já no limite', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="A estrutura PREP: a mais simples que funciona" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Comunicação oral sem estrutura é informação sem destino. PREP é a estrutura mínima viável que funciona em
          qualquer escala: resposta de 30 segundos em reunião ou apresentação de 1 hora. A lógica é sempre a mesma.
        </p>
        <LayerStack
          title="Estrutura PREP"
          accent={ACCENT}
          separatorLabel="FLUXO"
          layers={[
            { label: 'P — Point', content: 'Sua tese em 1 frase. "Precisamos mudar a arquitetura de monólito para microsserviços."', note: '← diga primeiro, não construa até lá', tone: 'default' },
            { label: 'R — Reason', content: 'Por que isso é verdade. "Porque o time de 8 deploys por semana está bloqueado por dependência de código."', tone: 'default' },
            { label: 'E — Example', content: 'Exemplo concreto e específico. "Em março, o deploy do módulo de pagamento atrasou 3 semanas por conflito no checkout."', tone: 'writable' },
            { label: 'P — Point', content: 'Reafirme a tese. "Por isso, a migração para microsserviços é a decisão certa para escalar velocity."', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['PREP', 'Sem estrutura']}
          rows={[
            ['Ouvinte entende a tese no primeiro segundo', 'Ouvinte não sabe para onde vai até o final'],
            ['Fácil de seguir mesmo em inglês técnico denso', 'Requer atenção máxima o tempo todo'],
            ['Funciona em 30s ou em 1h com a mesma lógica', 'Varia completamente com o tempo disponível'],
            ['Fácil de resumir e lembrar depois', 'Difícil de destilar em ação concreta'],
          ]}
        />
      </Section>

      <Section title="Voz, ritmo e pausas" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O conteúdo importa, mas a entrega decide se ele chega. Dois palestrantes com o mesmo conteúdo são percebidos
          de forma completamente diferente dependendo do ritmo, tom e uso de pausas.
        </p>
        <Callout tone="warn">
          <strong>Upspeak</strong> (subir o tom no final de toda frase como se fosse pergunta) é o maior destruidor de
          credibilidade em apresentações profissionais. Pratique terminar afirmações com tom descendente — sinaliza
          convicção.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Elemento', 'O que transmite', 'Como praticar']}
          rows={[
            ['Pausa após ponto forte (2-3s)', 'Confiança, dá tempo de processar', 'Gravar e assistir — onde você pulou pausas?'],
            ['Ritmo lento e deliberado', 'Domínio do conteúdo, autoridade', 'Falar 20% mais devagar que o natural'],
            ['Tom descendente no final', 'Afirmação, convicção', 'Praticar frases curtas em voz alta'],
            ['Volume diafragmático', 'Presença, energia', 'Projetar voz como se alcançasse a parede do fundo'],
            ['Contato visual distribuído', 'Conexão com audiência', 'Mover olhar a cada 3-4 segundos entre pessoas'],
          ]}
        />
        <Callout tone="success">
          A ferramenta de prática mais eficaz e mais evitada: gravar a si mesmo por 3 minutos e assistir. Desconfortável
          na primeira vez, transformador na décima. Você percebe padrões que nunca notou: o "éééé" de preenchimento, o
          upspeak, o ritmo acelerado nos momentos de nervosismo.
        </Callout>
      </Section>

      <Section title="Preparação para não depender da memória" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A diferença entre decorar e internalizar: quando você decora, uma interrupção faz você perder o fio. Quando
          você internaliza, você consegue retomar de qualquer ponto, responder perguntas no meio e adaptar o ritmo.
        </p>
        <LayerStack
          title="Como preparar uma apresentação (do zero ao delivery)"
          accent={ACCENT}
          separatorLabel="ETAPAS"
          layers={[
            { label: 'Ideias principais', content: 'Escreva 5-7 bullet points sem pensar em slides — qual é a estrutura de argumento?', note: '← etapa 1', tone: 'default' },
            { label: 'Fale em voz alta', content: 'Apresente apenas com os bullets, sem slides. Se travar, o problema é na estrutura de argumento, não nos slides', note: '← etapa 2 — mais importante', tone: 'default' },
            { label: 'Adicione slides como suporte', content: 'Slides são suporte visual do que você já domina em voz, não roteiro', note: '← etapa 3', tone: 'writable' },
            { label: 'Pratique handovers', content: 'Transições entre seções são onde a maioria trava — pratique especificamente essas transições', note: '← etapa 4', tone: 'writable' },
            { label: 'Delivery real', content: 'Apresente para pelo menos uma pessoa antes do evento real — audiência muda a performance', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          <strong>Técnica Feynman aplicada:</strong> explique o conceito para uma pessoa que nunca estudou a área. Se
          você usa jargão que não consegue definir sem jargão, não internalizou o suficiente para apresentar com
          confiança. A simplificação força clareza — e clareza gera confiança.
        </Callout>
      </Section>

      <Section title="Falar em contextos específicos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Contexto', 'O que muda', 'Erro mais comum']}
          rows={[
            ['Reunião 1:1', 'Tom conversacional, mais interação, menos estrutura formal', 'Monologar em vez de dialogar'],
            ['Team meeting', 'Objetividade, respeito ao tempo de todos, decisão clara ao final', 'Não terminar com próximos passos concretos'],
            ['All-hands / apresentação para diretoria', 'Contexto executivo: impacto no negócio, não detalhes técnicos', 'Entrar direto no "como" sem o "porquê"'],
            ['Apresentação externa (cliente, evento)', 'Abertura com problema, não com "meu nome é X e vou falar sobre"', 'Começar com apresentação do apresentador'],
            ['Entrevista por vídeo', '"Me fale sobre você" em 90s: cargo atual + problema que resolve + resultado + próximo objetivo', 'Cronologia de vida, não posicionamento profissional'],
          ]}
        />
        <Callout tone="warn">
          Para apresentações técnicas: <strong>nunca abra com "Então hoje eu vou falar sobre X"</strong>. Abra com o
          problema que você resolve. "Em 2025, nossa plataforma processava 500 requisições por segundo. Esse número era
          o gargalo que impedia crescimento. Hoje vou mostrar como chegamos a 50 mil." — isso é abertura que prende
          atenção.
        </Callout>
      </Section>

      <Section title="Plano de prática de 30 dias" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Oratória é habilidade física e cognitiva — melhora com repetição deliberada, não com leitura sobre oratória.
          Este plano é minimalista e exige no máximo 20 minutos por dia.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Semana', 'Prática diária', 'Meta']}
          rows={[
            ['Semana 1', 'Gravar 3 min sobre qualquer assunto técnico, assistir e anotar 1 ponto de melhoria', 'Criar consciência dos próprios padrões'],
            ['Semana 2', 'Explicar um conceito técnico para alguém fora da área (familiar, amigo)', 'Desenvolver clareza e calibração de audiência'],
            ['Semana 3', 'Pedir para falar por 2-3 min em reunião de time real — compartilhar um update ou aprendizado', 'Experiência com audiência real de baixo risco'],
            ['Semana 4', 'Preparar e apresentar um projeto ou resultado em formato PREP completo (10 min)', 'Integrar estrutura, voz e presença em contexto real'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="E se eu travar no meio da apresentação?"
          a={<>Pausa intencional — não tente recuperar correndo. Beba água se tiver disponível. Volte para o último ponto que estava claro: "Estava falando sobre X, e o ponto seguinte é..." Travar acontece com todo mundo. A diferença é como você responde — e recuperação calma é vista como profissionalismo, não fraqueza.</>}
        />
        <QAItem
          q="Quanto de improvisação é aceitável?"
          a={<>Estrutura preparada com detalhes improvisados é o modelo ideal. Você conhece os pontos principais e as transições — o "como você vai chegar lá" pode variar com base na audiência e no tempo. Cem por cento decorado quebra sob qualquer variação. Cem por cento improvisado é inconsistente. A combinação dá flexibilidade com confiança.</>}
        />
        <QAItem
          q="Vale a pena contratar coach de oratória?"
          a={<>Sim, se você apresenta mais de 2 vezes por mês ou se sua carreira depende de apresentações de alto valor (vendas, liderança, palestras). Um bom coach identifica padrões que você não consegue ver sozinho em semanas do que levaria meses. Para a maioria, prática deliberada auto-conduzida com gravação chega a 80% do resultado a zero custo.</>}
        />
        <QAItem
          q="Como lidar com perguntas hostis ou provocativas?"
          a={<>Não reaja emocionalmente — isso valida a provocação. Técnica: parafraseie a pergunta de forma neutra antes de responder ("A pergunta é se a solução é escalável — excelente ponto"). Isso ganha 5 segundos para pensar, neutraliza o tom, e demonstra que você ouviu. Responda a pergunta refraseada, não ao tom original.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Nervosismo é energia — redirecione, não elimine. PREP é a estrutura que escala do
        30 segundos à hora sem mudar a lógica. Pausas transmitem confiança mais do que velocidade. Preparação real é
        falar em voz alta, não ler slides. Gravar-se por 3 minutos e assistir é o maior atalho de melhoria disponível.
        Próximo módulo: como se comunicar e se posicionar em reuniões.
      </Callout>
    </div>
  );
}
