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

export const metadata = getModuleMetadata('carreira-trabalho-remoto');

const ACCENT = '#34d399';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual o maior risco de carreira específico para quem trabalha remoto?',
    options: [
      'Produtividade reduzida — home office tem mais distrações que escritório',
      '"Out of sight, out of mind" — profissionais remotos são preteridos em promoções por falta de visibilidade. A solução é visibilidade intencional: updates regulares, presença ativa em canais onde decisões são tomadas, e documentar impacto de forma explícita',
      'Dificuldade de colaboração — código remoto tem qualidade inferior',
      'Custo de equipamento — home office exige investimento alto',
    ],
    correct: 1,
    explanation:
      'Pesquisa da Stanford (2024) mostrou que trabalhadores remotos têm 50% menos chance de promoção comparado a presenciais com performance equivalente. A causa: viés de proximidade — gestores tendem a lembrar mais de quem viram fisicamente. Solução: relatório semanal de impacto para gestor, participação ativa em reuniões (câmera ligada, contribuições explícitas), e projetos de alta visibilidade.',
  },
  {
    question: 'Como estruturar comunicação assíncrona de alta qualidade em times remotos?',
    options: [
      'Comunicação assíncrona reduz qualidade — prefira reuniões síncronas sempre que possível',
      'Mensagens com contexto completo (o que, por que, o que precisa de resposta e até quando), documentação em local único e pesquisável, e separação clara entre urgente (síncrono) e não urgente (assíncrono)',
      'Responder mensagens em até 5 minutos para mostrar disponibilidade e comprometimento',
      'Usar video para tudo — comunicação por texto causa muito mal-entendido',
    ],
    correct: 1,
    explanation:
      'Comunicação assíncrona bem feita é mais eficiente que síncrona para a maioria das tarefas. Princípio: cada mensagem deve conter contexto suficiente para ser respondida sem pergunta de follow-up. "Preciso de ajuda" é ruim. "Estou implementando X, encontrei problema Y, tentei A e B sem sucesso, preciso de input sobre C — pode responder até amanhã?" é bom. Reduz reuniões em 40% e aumenta qualidade das decisões.',
  },
  {
    question: 'Qual é o setup mínimo para trabalho remoto profissional de alta qualidade?',
    options: [
      'Notebook básico + Wi-Fi são suficientes — ferramentas não importam, resultado importa',
      'Câmera 1080p ou superior, microfone dedicado (não do notebook), iluminação frontal, e conexão estável (cabo Ethernet ou 5G backup). Esses 4 itens eliminam 90% das percepções negativas em videochamadas',
      'Monitor externo grande é o único investimento que realmente muda produtividade',
      'Setup só importa para quem faz apresentações — devs que ficam no código não precisam de investimento',
    ],
    correct: 1,
    explanation:
      'Áudio ruim é o maior killer de credibilidade em reuniões remotas. Microfone de R$150-300 (Blue Snowball, HyperX SoloCast) muda completamente a percepção. Câmera boa (Logitech C920 ~R$400) + iluminação de anel (~R$80) eliminam "cara de câmera de notebook". Total do setup básico: R$600-800. Payback em 1-2 meses se você tem reuniões frequentes com clientes ou gestores.',
  },
  {
    question: 'Como negociar trabalho remoto em empresa que é híbrida ou presencial?',
    options: [
      'Não vale a pena negociar — empresas que não oferecem remoto nunca vão mudar',
      'Propor com prova: "Posso trabalhar remotamente X dias por semana — vou medir minha produtividade com métricas claras e revisamos em 30 dias." Proposta baseada em resultado é mais difícil de recusar que pedido baseado em preferência',
      'Pedir remoto na entrevista é sinal de falta de comprometimento — espere a contratação',
      'Ameaçar pedir demissão é a única forma eficaz de conseguir remoto',
    ],
    correct: 1,
    explanation:
      'Negociação baseada em dados supera negociação baseada em preferência. Antes de pedir: identifique as métricas que provam sua produtividade (tickets fechados, código deployed, projetos entregues), proponha período de teste com revisão explícita, e mostre que você tem setup profissional. No Brasil, 30% dos trabalhadores tech já têm alguma modalidade remota (IPEA 2025) — referência de mercado fortalece o argumento.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="carreira-trabalho-remoto"
      title="Trabalho Remoto: produtividade, visibilidade e setup profissional"
      icon="🏠"
      xp={65}
      readTime={12}
      trailName="Carreira Digital"
      trailColor={ACCENT}
      nextSlug="carreira-freelance-br"
      nextTitle="Freelance no Brasil: como começar e cobrar bem"
      relatedSlugs={['carreira-vagas-br', 'carreira-crescimento-junior-senior', 'comunicacao-reunioes']}
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
        30% do mercado de trabalho brasileiro tem alguma modalidade remota em 2025 (IPEA). Para profissionais
        tech, o percentual é muito maior — e cresce. Mas trabalho remoto tem armadilhas invisíveis: do
        isolamento ao risco de promoção. Este módulo cobre setup, produtividade, visibilidade e como
        construir carreira sólida trabalhando de qualquer lugar.
      </p>

      <Section title="Setup profissional: o investimento que se paga" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Item', 'Custo aprox.', 'Impacto']}
          rows={[
            ['Microfone USB (HyperX SoloCast)', 'R$180-250', 'Elimina voz abafada/ecoante — credibilidade imediata'],
            ['Câmera full HD (Logitech C920)', 'R$380-450', 'Imagem clara e estável vs câmera de notebook'],
            ['Anel de luz LED', 'R$60-120', 'Elimina sombras no rosto, iluminação profissional'],
            ['Suporte para notebook (eleva tela)', 'R$80-150', 'Câmera na altura dos olhos vs ângulo de baixo para cima'],
            ['Headset para foco', 'R$120-300', 'Deep work sem distração — ROI em produtividade'],
            ['Ethernet (se Wi-Fi instável)', 'R$30-50 (cabo)', 'Zero drops em calls — elimina maior frustração remoto'],
          ]}
        />
        <Callout tone="info">
          Prioridade: microfone primeiro, depois câmera. Áudio ruim é mais prejudicial para percepção
          profissional que vídeo ruim. Total do setup mínimo profissional: R$300-400.
        </Callout>
      </Section>

      <Section title="Produtividade e estrutura de dia remoto" accent={ACCENT}>
        <LayerStack
          title="Estrutura de dia remoto de alta performance"
          accent={ACCENT}
          separatorLabel="sequência →"
          layers={[
            { label: 'Ritual de início (15min)', content: 'Mesma hora todos os dias, revisar prioridades do dia, comunicar disponibilidade', note: 'cria separação psicológica casa/trabalho', tone: 'writable' },
            { label: 'Blocos de foco profundo (2-3h)', content: 'Notificações off, tarefa única, Pomodoro ou blocos de 90min', tone: 'writable' },
            { label: 'Comunicação em janelas (3x/dia)', content: 'Slack/e-mail em horários fixos — não continuamente', tone: 'writable' },
            { label: 'Stand-up assíncrono (5min)', content: 'O que fez, o que vai fazer, bloqueios — Loom ou texto', tone: 'writable' },
            { label: 'Ritual de fechamento (10min)', content: 'Lista do que foi feito, desligar notificações — separação psicológica', note: 'fundamental para saúde mental', tone: 'success' },
          ]}
        />
      </Section>

      <Section title="Visibilidade intencional: o antídoto para 'out of sight, out of mind'" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Prática', 'Frequência', 'Por que funciona']}
          rows={[
            ['Update semanal de impacto para gestor', 'Sexta-feira', 'Mantém gestor informado sem precisar perguntar'],
            ['Câmera ligada em reuniões importantes', 'Sempre', 'Presença visual aumenta lembrança e percepção de contribuição'],
            ['Compartilhar aprendizados em canal público', '1-2x/semana', 'Visibilidade de expertise para toda a empresa'],
            ['Participar de canais de decisão', 'Quando relevante', 'Estar onde decisões acontecem — não apenas no canal da equipe'],
            ['Check-in proativo com gestor', '1x/mês', 'Conversa de carreira além das entregas imediatas'],
          ]}
        />
        <DecisionBox
          scenario="Conseguir promoção trabalhando 100% remoto em empresa com cultura presencial"
          winner="Visibilidade intencional + documentação de impacto"
          winnerColor={ACCENT}
          why="Pesquisa Stanford: remotos têm 50% menos chances de promoção. Solução: criar visibilidade que compensas a ausência física. Updates de impacto semanais + participação ativa em canais estratégicos + projetos cross-time."
          alternatives={[
            { name: 'Dias presenciais estratégicos', note: 'Se possível: aparecer em dias de decisão importante vale mais que presença constante' },
            { name: 'Pedir feedback explícito sobre visibilidade', note: '"O que eu poderia fazer diferente para ter mais impacto visível?" — pergunta direta ao gestor' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Como lidar com isolamento e falta de interação social no remoto?"
          a={<>Isolamento é o problema de saúde mental mais comum em remotos (67% reportam algum nível, Buffer 2024). Estratégias: (1) coworking 1-2 dias por semana — espaços como WeWork e Regus têm planos flexíveis a partir de R$300/mês; (2) calls sociais com colegas sem pauta de trabalho — 15 min de "café virtual"; (3) comunidades locais de tech — meetups mensais são fundamentais para pertencimento; (4) rotina de exercício físico em horário fixo — saúde física e mental estão diretamente conectadas.</>}
        />
        <QAItem
          q="Como separar vida pessoal e profissional quando trabalha em casa?"
          a={<>Separação física ajuda mas não é obrigatória. O que realmente funciona é separação ritualística e temporal: rituais claros de início e fim de trabalho (já descrito acima), notificações de trabalho completamente desligadas fora do horário, e comunicar horários de trabalho explicitamente à equipe ("estou disponível das 9h às 18h, mensagens fora disso responderei no próximo dia"). Sem esses rituais, trabalho remoto vira trabalho 24/7 — o oposto do que se quer.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Setup mínimo: microfone dedicado + câmera decente + iluminação
        (~R$400). Visibilidade intencional é obrigatória — remotos têm 50% menos promoções sem ela.
        Update semanal de impacto para gestor é a prática mais importante. Comunicação assíncrona boa
        reduz reuniões em 40%. Rituais de início/fim protegem saúde mental e produtividade. Isolamento
        é real — coworking e comunidades locais são antídotos.
      </Callout>
    </div>
  );
}
