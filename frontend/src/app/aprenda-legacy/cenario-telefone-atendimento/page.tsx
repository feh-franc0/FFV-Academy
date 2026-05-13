import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('cenario-telefone-atendimento');

const ACCENT = '#60a5fa';

const quiz: QuizQuestion[] = [
  {
    question: 'Você liga para uma empresa e o sistema automático (IVR) fala muito rápido. O que fazer?',
    options: [
      'Desligar e tentar mais tarde',
      'Apertar "0" ou dizer "operator" / "representative" repetidamente — a maioria dos IVRs americanos envia para um humano com essas palavras ou o número zero.',
      'Esperar em silêncio até o sistema repetir',
      'Falar "I don\'t understand" e o sistema vai mudar para português',
    ],
    correct: 1,
    explanation:
      'O "atalho" para falar com humano na maioria dos IVRs americanos: dizer "operator", "representative", "agent" ou apertar "0" (zero). Alguns sistemas modernos exigem mais tentativas. Se não funcionar após 3 tentativas, diga claramente "I need to speak with a representative, please" — sistemas de voz reconhecem essa frase.',
  },
  {
    question: 'Como cancelar uma assinatura por telefone de forma assertiva?',
    options: [
      '"I want to cancel maybe."',
      '"I am calling to cancel my account/subscription. I have made my decision and I do not need any retention offers." — claro, decisivo e fecha a porta para argumentos de retenção',
      '"Can you please maybe cancel my account if possible?"',
      '"I am thinking about canceling."',
    ],
    correct: 1,
    explanation:
      'Empresas americanas treinam atendentes de retenção para argumentar contra cancelamentos. A fórmula defensiva: (1) diga que quer cancelar de forma definitiva, (2) mencione que não precisa de ofertas ("I am not interested in any offers or discounts"), (3) se persistirem: "I understand, but my decision is final. Please proceed with the cancellation." Peça o número de confirmação ao final.',
  },
  {
    question: 'Você foi cobrado incorretamente no cartão. Qual frase abre a disputa corretamente?',
    options: [
      '"You charged me wrong!"',
      '"I am calling to dispute a charge on my account. On [data], I was charged [valor] for [item], which I did not authorize / did not receive." — específico, calmo e completo',
      '"There is a mistake in my bill."',
      '"I want my money back."',
    ],
    correct: 1,
    explanation:
      'Uma disputa eficaz inclui: data da cobrança, valor exato, motivo (não autorizado, serviço não recebido, produto devolvido). "I was charged [valor] for [item] which I did not authorize" é a linguagem que os sistemas de atendimento reconhecem. Tenha o número do cartão e os últimos 4 dígitos disponíveis — sempre pedem para verificar identidade.',
  },
  {
    question: 'O atendente falou muito rápido e você não entendeu. O que dizer?',
    options: [
      '"What?" (apenas)',
      '"I\'m sorry, could you please repeat that more slowly? English is not my first language." — honesto e educado, os atendentes estão acostumados',
      '"Speak slowly!" (sem "please")',
      '"I don\'t understand English."',
    ],
    correct: 1,
    explanation:
      'Atendentes de SAC americanos são treinados para lidar com não-nativos. "Could you please repeat that more slowly?" é completamente normal. Adicionar "English is not my first language" muitas vezes faz o atendente mudar o registro automaticamente. Também pode pedir: "Could you spell that for me?" para nomes ou códigos, ou "Could you put that in writing / email it to me?"',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cenario-telefone-atendimento"
      title="Cenário: Telefone, SAC e Atendimento ao Cliente"
      icon="📞"
      xp={70}
      readTime={18}
      trailName="Inglês para Brasileiros na Gringa"
      trailColor={ACCENT}
      nextSlug="ingles-1000-palavras"
      nextTitle="As 1000 palavras mais usadas do inglês"
      relatedSlugs={['cenario-banco-financas', 'cenario-situacoes-sociais', 'ingles-1000-frases']}
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
        Ligar para SAC americano é a situação que mais trava brasileiros na gringa: sistema
        automático rápido, sotaque difícil, siglas desconhecidas, e script de retenção agressivo.
        Este módulo cobre 100 trocas reais para você sair com o que precisa de qualquer ligação.
      </p>

      <Section title="Navegando o sistema automático (IVR)" accent={ACCENT}>
        <Callout tone="info">
          <strong>Atalho universal:</strong> dizer "operator", "representative" ou "agent", ou
          apertar "0" repetidamente — a maioria dos sistemas americanos transfere para humano.
          Se não funcionar: "I need to speak with a customer service representative, please."
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Pedir para falar com humano', '"Representative." / "Operator." / "Agent." — diga isso várias vezes'],
            ['Não entendeu o menu', '"I did not get that. Can you repeat the options?"'],
            ['Errou no menu', '"Main menu, please." / "Go back."'],
            ['Sistema não reconhece voz', 'Apertar "0" geralmente funciona quando o reconhecimento falha'],
            ['Tempo de espera longo', '"Your call is important to us" — significa: vai demorar. Tenha paciência'],
            ['Oferta de retorno de chamada', '"Yes, I would like a callback." — aceite quando oferecido, economiza tempo'],
            ['Verificação de identidade', '"My account number is... / My last 4 digits are... / My zip code is..."'],
            ['Verificação por senha', '"My PIN / password is..."'],
            ['Informar motivo da ligação', '"I am calling about [assunto]." — diga imediatamente ao conectar com humano'],
            ['Pedir número do protocolo', '"Can I get a confirmation number or case number?"'],
          ]}
        />
      </Section>

      <Section title="Abertura e apresentação da ligação" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Início da chamada com humano', '"Hi, I\'m calling about [assunto]. My name is [nome] and my account number is [número]."'],
            ['Pedir ao atendente para se identificar', '"Could I get your name and employee ID for my records?"'],
            ['Avisar sobre dificuldade com inglês', '"English is not my first language — could you please speak slowly?"'],
            ['Pedir para repetir', '"I\'m sorry, could you repeat that?" / "Could you say that again, please?"'],
            ['Pedir para soletrar', '"Could you spell that for me?"'],
            ['Confirmar que entendeu', '"So you are saying that... Is that correct?" — sempre confirme o que você entendeu'],
            ['Pedir confirmação por escrito', '"Could you send me a confirmation email?"'],
            ['Dificuldade de audição', '"I\'m having trouble hearing you. Could you speak up a bit?"'],
            ['Ligação caiu', '"We got disconnected. I was speaking with [nome] about [assunto]."'],
            ['Ser transferido', '"Before you transfer me, can you give me your direct extension?"'],
          ]}
        />
      </Section>

      <Section title="Cancelamento de serviços e assinaturas" accent={ACCENT}>
        <Callout tone="warn">
          <strong>Script de retenção:</strong> empresas americanas treinam atendentes para
          argumentar contra cancelamentos com ofertas, descontos e perguntas. Seja firme:
          "I appreciate the offer, but I have made my decision. Please proceed with the cancellation."
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Abrir pedido de cancelamento', '"I am calling to cancel my [serviço] account. Account number [número]."'],
            ['Recusar oferta de desconto', '"I appreciate the offer, but my decision is final."'],
            ['Recusar "pause" no lugar de cancelar', '"I do not want to pause — I want to cancel completely."'],
            ['Confirmar data efetiva', '"What is the effective cancellation date?"'],
            ['Confirmar sem cobrança futura', '"I will not be charged after [data], correct?"'],
            ['Pedir número de confirmação', '"Can I get a cancellation confirmation number?"'],
            ['Pedir confirmação por email', '"Can you send the cancellation confirmation to my email?"'],
            ['Contestar período de notificação', '"My contract says I need to give 30 days notice. Is that correct?"'],
            ['Cancelar com devolução de equipamento', '"When and where do I return the equipment?"'],
            ['Confirmar encerramento da conta', '"Is my account fully closed now?"'],
          ]}
        />
      </Section>

      <Section title="Disputar cobranças incorretas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Abrir disputa', '"I am calling to dispute a charge on my account."'],
            ['Especificar a cobrança', '"On [data], I was charged [valor] for [item] which I did not authorize."'],
            ['Cobrança por serviço não recebido', '"I was charged for a service I did not receive."'],
            ['Cobrança duplicada', '"I see a duplicate charge — I was billed twice for the same item."'],
            ['Produto devolvido', '"I returned this item on [data] and have not received the refund yet."'],
            ['Prazo do reembolso', '"How long will the refund take to process?"'],
            ['Provisório no cartão', '"I see a pending charge. Will that be released?"'],
            ['Escalar para supervisor', '"I would like to speak with a supervisor, please."'],
            ['Anotar número do protocolo', '"What is the dispute reference number?"'],
            ['Confirmar resolução', '"So the charge of [valor] will be reversed within [prazo]. Is that correct?"'],
          ]}
        />
      </Section>

      <Section title="Agendamentos e solicitações de serviço" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Agendar serviço', '"I would like to schedule an appointment for [tipo de serviço]."'],
            ['Confirmar disponibilidade', '"What is the earliest available appointment?"'],
            ['Preferência de horário', '"I prefer mornings / afternoons / weekends."'],
            ['Janela de chegada', '"What is the service window? Will someone call before arriving?"'],
            ['Confirmar endereço', '"The address is [endereço]. Do you have that on file?"'],
            ['Contato no dia', '"What number will the technician call from?"'],
            ['Reagendar', '"I need to reschedule my appointment. What are the available slots?"'],
            ['Cancelar agendamento', '"I need to cancel my appointment for [data / hora]."'],
            ['Confirmar pós-agendamento', '"Can you send a confirmation to my email?"'],
            ['Reclamar de no-show', '"The technician did not show up for my appointment. I need to reschedule and I would like a credit."'],
          ]}
        />
      </Section>

      <Section title="Situações difíceis: escaladas e reclamações" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Situação', 'O que dizer']}
          rows={[
            ['Pedir supervisor', '"I would like to speak with your supervisor, please."'],
            ['Atendente não consegue resolver', '"I understand you cannot resolve this — could you escalate it to someone who can?"'],
            ['Reclamar de atendimento', '"I have been a customer for [tempo] and this experience has been unacceptable."'],
            ['Ameaçar cancelamento por mau serviço', '"If this is not resolved, I will have to cancel my account."'],
            ['Registrar reclamação formal', '"I would like to file a formal complaint. Who do I contact?"'],
            ['Pedir callback de gerente', '"Can I have a manager call me back? When can I expect that call?"'],
            ['Resolver sem raiva', '"I am frustrated with this situation, but I know it is not your personal fault. I need this resolved."'],
            ['Encerrar mal-atendimento', '"I will call back when I can speak with someone who is authorized to help me."'],
            ['Registrar reclamação no BBB', '"I will file a complaint with the Better Business Bureau if this is not resolved."'],
            ['Disputa com cartão de crédito', '"If you cannot resolve this, I will dispute the charge with my credit card company."'],
          ]}
        />
        <Callout tone="info">
          <strong>Tom assertivo vs agressivo:</strong> "I am not satisfied and I need this resolved"
          (assertivo) funciona melhor do que "This is ridiculous!" (agressivo). Atendentes têm mais
          poder para ajudar quem é respeitoso. Mencionar cancelamento ou BBB são ferramentas legítimas
          para situações que realmente não foram resolvidas — use com moderação.
        </Callout>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="O sistema automático não entende meu sotaque. O que fazer?"
          a={<>Fale devagar e com clareza — sistemas de reconhecimento de voz modernos melhoraram muito mas ainda têm dificuldade com sotaques não-americanos. Alternativas: (1) aperte "0" para tentar ir direto ao operador; (2) fale palavras isoladas em vez de frases: "Cancel" em vez de "I want to cancel my subscription"; (3) muitos sistemas oferecem opção de teclado numérico como alternativa à voz — preferível quando disponível.</>}
        />
        <QAItem
          q="Como pedir que o atendente mude para português?"
          a={<>A maioria das grandes empresas americanas tem atendimento em espanhol (diga "Español"), mas raramente em português. Para português, algumas opções: (1) verificar se a empresa tem suporte por chat escrito no site — mais fácil para não-nativos; (2) Consulados brasileiros e muitos serviços voltados para imigrantes têm atendimento em português; (3) Aplicativos como 911 em cidades com grande comunidade brasileira (Framingham, MA; Pompano Beach, FL) têm intérpretes para português.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Para falar com humano: diga "representative" ou aperte "0".
        Cancele com decisão: "I have made my decision — please proceed." Disputas: data + valor
        + motivo específico. Peça SEMPRE o número de confirmação ao final de qualquer resolução.
        Tom assertivo mas respeitoso resolve mais do que raiva. Confirmação por email é seu
        comprovante — sempre peça.
      </Callout>
    </div>
  );
}
