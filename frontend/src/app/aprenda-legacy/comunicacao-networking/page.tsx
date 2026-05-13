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

export const metadata = getModuleMetadata('comunicacao-networking');

const ACCENT = '#f472b6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o maior erro no networking profissional brasileiro?',
    options: [
      'Usar LinkedIn ao invés de encontros presenciais',
      'Focar em acumular conexões em vez de construir relacionamentos — networking é sobre valor mútuo, não volume. Uma conexão com conversa real vale mais que 500 adicionados sem interação',
      'Não ter foto profissional no perfil do LinkedIn',
      'Abordar pessoas de cargo muito superior ao seu',
    ],
    correct: 1,
    explanation:
      'O erro fundamental é tratar networking como coleta de cartões ou conexões. Relacionamentos profissionais duradouros são construídos em torno de valor mútuo — você ajuda, aprende, compartilha. No Brasil, onde o mercado de trabalho é fortemente baseado em indicações (62% das contratações passam por networking, FGV 2024), quem investe em relacionamentos reais tem vantagem sistêmica.',
  },
  {
    question: 'Como fazer uma abordagem eficaz no LinkedIn para alguém que você não conhece?',
    options: [
      'Enviar convite sem mensagem — é menos intrusivo',
      'Mensagem personalizada referenciando algo específico da pessoa (post, empresa, projeto) + motivo claro do contato + proposta de valor mútuo — sem pedir favor direto na primeira mensagem',
      'Apresentar seu currículo completo para mostrar credenciais',
      'Perguntar diretamente se há vagas na empresa da pessoa',
    ],
    correct: 1,
    explanation:
      'A fórmula de mensagem fria eficaz: (1) contexto — por que você está chegando a essa pessoa específica, (2) valor — o que você trouxe, aprendeu, ou pode contribuir, (3) próximo passo leve — uma pergunta aberta ou pedido de feedback, não um favor. Mensagens genéricas têm taxa de resposta ~3%. Mensagens com referência específica ao trabalho da pessoa chegam a 40-60% de resposta.',
  },
  {
    question: 'Qual é a diferença entre networking reativo e networking estratégico?',
    options: [
      'Networking estratégico é apenas para quem está procurando emprego',
      'Networking reativo acontece quando você precisa de algo (emprego, cliente, parceiro). Networking estratégico é contínuo — você mantém relacionamentos mesmo sem necessidade imediata, e quando precisa, já tem capital social',
      'Networking reativo é mais eficiente pois é focado em objetivos específicos',
      'Não há diferença real — o resultado é o mesmo a longo prazo',
    ],
    correct: 1,
    explanation:
      'Networking estratégico segue a regra dos "2 check-ins por trimestre": para suas 20-30 conexões mais relevantes, interaja com conteúdo deles, compartilhe algo útil, ou envie mensagem breve sem pedir nada. Quando você precisar de algo, a relação já existe. Quem só aparece quando precisa é percebido como oportunista — e o capital social cai rapidamente.',
  },
  {
    question: 'Como medir se seu networking está gerando resultados reais?',
    options: [
      'Número de conexões no LinkedIn e seguidores nas redes',
      'Quantidade de conversas com profundidade (não apenas curtidas), oportunidades recebidas por indicação, e qualidade das informações privilegiadas que você recebe antes do mercado saber',
      'Número de eventos presenciais que você frequenta por mês',
      'Taxa de resposta nas mensagens que você envia',
    ],
    correct: 1,
    explanation:
      'Os indicadores reais de networking eficaz são: (1) você recebe oportunidades antes de elas serem públicas, (2) suas conexões te indicam espontaneamente, (3) você tem acesso a informações de mercado que não estão publicadas. Esses são sinais de que você construiu capital social real, não apenas volume de conexões.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="comunicacao-networking"
      title="Networking Estratégico: construir conexões reais no Brasil digital"
      icon="🤝"
      xp={65}
      readTime={11}
      trailName="Comunicação Humana"
      trailColor={ACCENT}
      nextSlug="comunicacao-inteligencia-emocional"
      nextTitle="Inteligência Emocional: a base de tudo"
      relatedSlugs={['comunicacao-escuta-ativa', 'carreira-portfolio-digital', 'carreira-vagas-br']}
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
        62% das contratações no Brasil passam por networking — não por aplicação direta em vagas (FGV 2024).
        No mercado digital, onde reputação e indicações valem mais que currículo, quem constrói relacionamentos
        reais tem vantagem sistêmica. Este módulo ensina como fazer networking sem ser aquela pessoa que
        só aparece quando precisa de algo.
      </p>

      <Section title="A estrutura de um networking que funciona" accent={ACCENT}>
        <LayerStack
          title="Pirâmide de relacionamentos profissionais"
          accent={ACCENT}
          separatorLabel="mais estratégico →"
          layers={[
            { label: 'Conexões frias (500+)', content: 'LinkedIn, eventos — sem interação real', note: 'volume sem valor', tone: 'default' },
            { label: 'Conhecidos (50-100)', content: 'Rostos conhecidos, troca casual ocasional', tone: 'default' },
            { label: 'Contatos ativos (20-30)', content: 'Interação regular, valor mútuo reconhecido', tone: 'writable' },
            { label: 'Aliados estratégicos (5-10)', content: 'Indicam você proativamente, acesso privilegiado', tone: 'writable' },
            { label: 'Mentores/sponsors (1-3)', content: 'Investem ativamente no seu crescimento', note: 'alvo real', tone: 'success' },
          ]}
        />
        <Callout tone="info">
          Foque energia nos 20-30 contatos ativos: interaja com conteúdo deles, compartilhe algo útil
          2x por trimestre. Isso é mais valioso do que adicionar 200 pessoas novas por mês.
        </Callout>
      </Section>

      <Section title="Como abordar pessoas de forma eficaz" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo de abordagem', 'Taxa de resposta', 'Exemplo']}
          rows={[
            ['Genérica ("adorei seu perfil")', '~3%', '"Oi, adorei seu perfil, posso adicionar?"'],
            ['Com contexto específico', '25-35%', '"Vi seu post sobre X — tive exatamente esse problema e resolvi com Y"'],
            ['Valor primeiro', '40-60%', '"Compartilhei seu artigo com meu time — gerou discussão sobre Z. Algum recurso extra?"'],
            ['Pedido direto (1a msg)', '{'<'}5%', '"Preciso de indicação na sua empresa"'],
          ]}
        />
        <Callout tone="info">
          <strong>Fórmula de mensagem fria:</strong> [Contexto específico por que essa pessoa] + [o
          que você trouxe/aprendeu] + [pergunta aberta leve]. Sem pedir favor na primeira mensagem.
          Sem copiar/colar mensagem genérica.
        </Callout>
      </Section>

      <Section title="Networking digital vs presencial no Brasil" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Canal', 'Ponto forte', 'Como usar bem']}
          rows={[
            ['LinkedIn', 'Alcance e contexto profissional', 'Postar 2-3x/semana, comentar com substância, não apenas curtir'],
            ['Twitter/X', 'Comunidade técnica ativa', 'Threads com aprendizados reais, responder especialistas com valor'],
            ['Eventos presenciais', 'Conexão mais profunda mais rápida', 'Meta: 3 conversas de 10min, não 30 de 1min'],
            ['Comunidades (Discord/Slack)', 'Acesso a nicho específico', 'Responder dúvidas antes de fazer perguntas'],
            ['Indicação direta', 'Mais eficaz no Brasil', 'Pedir indicação específica: "Você conhece alguém em X que faz Y?"'],
          ]}
        />
        <DecisionBox
          scenario="Como construir networking do zero saindo da faculdade ou mudando de área"
          winner="Contribuição pública + comunidades de nicho"
          winnerColor={ACCENT}
          why="Sem histórico profissional, a melhor moeda é aprendizado público. Post sobre projeto pessoal, contribuição em comunidade Discord/Slack, resposta bem elaborada em fórum. Cria prova de competência antes de ter experiência formal."
          alternatives={[
            { name: 'Eventos e meetups', note: 'Excelente para primeiras conexões — São Paulo tem GDG, AWS UG, Python SP mensais' },
            { name: 'Programa de mentoria', note: 'ADPList, Impulso Network — acesso a mentores sênior sem precisar de conexão prévia' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como manter relacionamentos sem parecer interesseiro?"
          a={<>A chave é dar antes de pedir. Compartilhe artigo relevante para a área da pessoa sem pedir nada em troca. Comente com substância no post de alguém. Conecte duas pessoas que deveriam se conhecer. Quando você eventualmente pedir algo, o capital social já existe e o pedido é natural, não oportunista. Regra prática: para cada favor pedido, você já deu 3-5 contribuições ao longo do tempo.</>}
        />
        <QAItem
          q="Vale a pena participar de eventos pagos de networking?"
          a={<>Depende do custo de oportunidade. Eventos presenciais de qualidade (conferências técnicas, eventos de associações de setor) têm ROI alto — você encontra pessoas que já passaram pelo filtro de interesse e investimento. Eventos genéricos de networking muitas vezes são cheios de pessoas também procurando, não oferecendo. Melhor critério: o organizador ou palestrante é alguém que você já quer conhecer? Se sim, vale.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Networking é valor mútuo, não coleta de conexões. Foque em 20-30
        contatos ativos, não 500 frios. Mensagens personalizadas com contexto específico têm 15x mais
        resposta que mensagens genéricas. Dê antes de pedir: compartilhe, responda, conecte. No Brasil,
        62% das contratações passam por indicação — invista em relacionamentos contínuos, não só quando
        precisa de algo.
      </Callout>
    </div>
  );
}
