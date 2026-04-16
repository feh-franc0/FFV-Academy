import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Precificação AWS, Free Tier e Planos de Suporte — FFV Academy',
  description: 'Pricing models, Free Tier, Cost Explorer, Budgets, Savings Plans, Reserved Instances, AWS Organizations e os 4 planos de suporte AWS.',
};

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual plano de suporte AWS inclui Technical Account Manager (TAM) dedicado e acesso a concierge de faturamento?',
    options: [
      'Basic',
      'Developer',
      'Business',
      'Enterprise',
    ],
    correct: 3,
    explanation: 'Enterprise é o único plano que inclui TAM dedicado, concierge de faturamento, suporte 24/7 por telefone/chat/ticket, IEM (Infrastructure Event Management), Well-Architected Reviews. Também é o mais caro ($15k/mês mínimo).',
  },
  {
    question: 'Uma empresa tem 10 contas AWS e quer gerenciar cobrança consolidada, aplicar políticas centrais e negociar volume discounts. Qual serviço usar?',
    options: [
      'AWS Budgets',
      'AWS Cost Explorer',
      'AWS Organizations',
      'AWS Trusted Advisor',
    ],
    correct: 2,
    explanation: 'AWS Organizations permite multi-account management, consolidated billing (que soma volumes para discounts), Service Control Policies (SCPs) para governance, e integração com Control Tower. Budgets e Cost Explorer são ferramentas de análise.',
  },
  {
    question: 'Qual ferramenta permite visualizar e prever gastos AWS de forma gráfica com breakdown por serviço, tag e conta?',
    options: [
      'AWS Budgets',
      'AWS Cost Explorer',
      'AWS Cost and Usage Report (CUR)',
      'AWS Pricing Calculator',
    ],
    correct: 1,
    explanation: 'Cost Explorer tem interface gráfica no console para análise de custos históricos (13 meses) e previsão. Budgets define alertas de gastos. CUR é dump detalhado em S3 para BI. Pricing Calculator estima custo ANTES de consumir.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="precificacao-suporte"
      title="Precificação, Free Tier e Planos de Suporte"
      icon="💰"
      xp={50}
      readTime={10}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="migracao-aws-servicos"
      nextTitle="Migração: Migration Hub, DMS, MGN e DataSync"
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
        Nenhum domínio gera mais surpresa em clientes novos da AWS do que o pagamento. O modelo pay-as-you-go é flexível, mas pode gerar faturas inesperadas. O CLF-C02 cobra os fundamentos de pricing, as ferramentas de análise de custos, e os <strong>4 planos de suporte AWS</strong> — especialmente os limites de cada um.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 4 — Billing, Pricing, and Support" weight="12%" color={ACCENT} />
        <p>
          Menor domínio em peso (12%) mas alta densidade de decoreba: planos de suporte, ferramentas de billing, free tier. As questões são geralmente objetivas ("qual ferramenta para X?", "qual plano inclui Y?").
        </p>
      </Section>

      <Section title="Os 3 pilares do pricing AWS" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Pilar', 'Descrição']}
          rows={[
            ['Compute', 'Hora/segundo de EC2, Lambda invocações + duração, Fargate vCPU+GB'],
            ['Storage', 'GB-mês de S3/EBS/EFS, requisições S3, transferência entre classes'],
            ['Data Transfer', 'OUT para internet (é o que mais surpreende). IN quase sempre grátis. Entre AZs na mesma Região: pago.'],
          ]}
        />
        <Callout tone="warn">
          <strong>Pegadinha de custo:</strong> transferir dados OUT (para internet) custa. Transferir entre AZs dentro da Região também custa (≈$0.01/GB). Transferir entre Regiões é mais caro. Dados IN (internet → AWS) quase sempre são grátis.
        </Callout>
      </Section>

      <Section title="AWS Free Tier — 3 tipos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Duração', 'Exemplo']}
          rows={[
            ['12-month free', '12 meses a partir da abertura da conta', '750h/mês de t2.micro ou t3.micro EC2, 5 GB S3'],
            ['Always free', 'Eterno (dentro de limites)', '1M invocações Lambda/mês, 25 GB DynamoDB'],
            ['Short-term trials', 'Por serviço específico', 'Amazon Inspector 90 dias, QuickSight 60 dias'],
          ]}
        />
        <p>
          Muitos serviços têm Free Tier. Alguns notáveis: Lambda, DynamoDB, CloudWatch (10 custom metrics + 1M API requests), SNS (1M publishes), SQS (1M requests). Verifique sempre <InlineCode>aws.amazon.com/free</InlineCode>.
        </p>
      </Section>

      <Section title="Modelos de compra e economia" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Desconto', 'Uso ideal']}
          rows={[
            ['On-Demand', 'Nenhum', 'Cargas imprevisíveis'],
            ['Savings Plans (Compute)', 'Até 66%', 'Compromisso $/h por 1 ou 3 anos — flexível entre EC2/Lambda/Fargate'],
            ['Savings Plans (EC2 Instance)', 'Até 72%', 'Mesma família em uma região'],
            ['Reserved Instances', 'Até 72%', 'Instância específica, região, 1 ou 3 anos'],
            ['Spot Instances', 'Até 90%', 'Batch tolerante a falha'],
            ['Dedicated Hosts', 'Varia', 'BYOL Windows Server / compliance'],
          ]}
        />
      </Section>

      <Section title="Ferramentas de billing e cost management" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'O que faz']}
          rows={[
            ['AWS Pricing Calculator', 'Estima custo ANTES de usar (comparar arquiteturas)'],
            ['AWS Cost Explorer', 'Analisa custos históricos (13 meses) + previsão, com gráficos e filtros'],
            ['AWS Budgets', 'Define alertas de custo/uso (ex: avisar se passar $500 no mês)'],
            ['AWS Cost and Usage Report (CUR)', 'Dump detalhado em S3 (linha-a-linha) para BI/Athena'],
            ['AWS Trusted Advisor', 'Recomendações em 5 áreas (incluindo custo: idle EC2, low util RDS)'],
            ['Cost Allocation Tags', 'Tags em recursos para breakdown por projeto/team/env'],
            ['Billing Conductor', 'Simula faturamento customizado para revendedores/MSPs'],
            ['Compute Optimizer', 'ML recomenda right-sizing de EC2, Lambda, EBS, ASG'],
          ]}
        />
      </Section>

      <Section title="AWS Organizations e Consolidated Billing" accent={ACCENT}>
        <p>
          <InlineCode>AWS Organizations</InlineCode> permite gerenciar múltiplas contas AWS como uma única unidade. Benefícios:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Consolidated Billing</strong> — uma fatura única para todas as contas</li>
          <li>• <strong>Volume discounts</strong> — soma de uso entre contas aumenta descontos por tier</li>
          <li>• <strong>Reserved Instance / Savings Plans sharing</strong> — RIs compradas em uma conta beneficiam outras</li>
          <li>• <strong>Service Control Policies (SCPs)</strong> — limites máximos de permissões em nível de OU/conta</li>
          <li>• Integração com Control Tower (landing zone) e SSO</li>
        </ul>
      </Section>

      <Section title="Os 4 planos de suporte AWS — decore as diferenças" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'Basic', 'Developer', 'Business', 'Enterprise On-Ramp', 'Enterprise']}
          rows={[
            ['Preço mensal', 'Grátis', '$29 ou 3% uso', '$100 ou 10% uso', '$5.500 min', '$15.000 min'],
            ['Acesso ao canal', 'Só docs + comunidade', 'Business hours via email', '24/7 (email, chat, phone)', '24/7', '24/7'],
            ['Trusted Advisor checks', '6 básicos', '6 básicos', 'Todos (~120)', 'Todos', 'Todos'],
            ['Tempo de resposta P1 (sistema down)', 'N/A', 'N/A', '< 1 hora', '< 30 min', '< 15 min'],
            ['Technical Account Manager', '❌', '❌', '❌', 'Pool (não dedicado)', '✅ Dedicado'],
            ['Well-Architected Reviews', '❌', '❌', '❌', '✅', '✅'],
            ['Infrastructure Event Management', '❌', '❌', 'Pago extra', '✅', '✅'],
            ['Third-party software support (OS/DB)', '❌', '❌', '✅', '✅', '✅'],
          ]}
        />
      </Section>

      <Section title="AWS Abuse e outros contatos grátis" accent={ACCENT}>
        <p>
          Algumas operações não exigem plano pago:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>AWS Abuse</InlineCode> — reportar abuso de IP AWS (phishing, malware)</li>
          <li>• <InlineCode>AWS Trust &amp; Safety</InlineCode> — questões legais</li>
          <li>• Questões de faturamento — todos os planos podem abrir ticket</li>
          <li>• Suporte Basic cobre: disponibilidade de serviços AWS, questões de conta e billing</li>
        </ul>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Startup com MVP rodando $1k/mês, quer alertas quando passar de $1.5k"
          winner="AWS Budgets + SNS email alert"
          winnerColor={ACCENT}
          why="Budgets é grátis para os 2 primeiros e notifica via SNS. Cost Explorer é análise retroativa; Budgets é proativo."
        />
        <DecisionBox
          scenario="Empresa com 30 contas AWS, cada time compra RI separadamente"
          winner="AWS Organizations + Consolidated Billing + RI/Savings Plans sharing"
          winnerColor={ACCENT}
          why="Consolida cobrança, aumenta volume discount, permite RIs compradas em qualquer conta beneficiarem outras. Economia imediata."
        />
        <DecisionBox
          scenario="Banco com SLA de 15 min para P1, suporte 24/7 e acesso a TAM dedicado"
          winner="Enterprise Support Plan"
          winnerColor={ACCENT}
          why="Único plano com TAM dedicado e SLA &lt;15min para P1. $15k/mês mínimo. Inclui WAR Reviews ilimitadas."
          alternatives={[
            { name: 'Enterprise On-Ramp', note: 'TAM em pool (não dedicado), SLA 30 min — ~1/3 do custo' },
          ]}
        />
        <DecisionBox
          scenario="Devs internos testando AWS, querem suporte técnico via email em horário comercial"
          winner="Developer Support ($29/mês ou 3% do uso)"
          winnerColor={ACCENT}
          why="Atende times de dev/teste. Para produção crítica, upgrade para Business."
        />
      </Section>

      <Callout tone="info">
        <strong>Dica forte para o exame:</strong> decore o <strong>menor plano</strong> que inclui cada feature. TAM dedicado = só Enterprise. 24/7 = Business+. Todos os Trusted Advisor checks = Business+. Third-party software (OS/DB) support = Business+. Well-Architected Reviews = Enterprise On-Ramp+.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Qual ferramenta estima o custo de uma arquitetura antes de provisioná-la?"
          a={<><strong>AWS Pricing Calculator</strong>. Selecione serviços, configure, compartilhe link. Ideal para apresentações e aprovações orçamentárias.</>}
        />
        <QAItem
          q="Em qual plano de suporte aparece AWS IQ e API de suporte?"
          a={<>Developer em diante. IQ conecta clientes a experts independentes da AWS. API de suporte (acesso programático a tickets) está em Business+.</>}
        />
        <QAItem
          q="Quem é dono da conta pagadora em AWS Organizations?"
          a={<>A <strong>Management Account</strong> (antes chamada "Master Account"). É a conta que recebe a fatura consolidada e tem privilégios superiores (inclui criar SCPs). Não deve rodar workloads de produção.</>}
        />
        <QAItem
          q="Qual é o plano de suporte da conta Basic e por quanto tempo?"
          a={<>Basic é grátis e eterno. Inclui acesso a documentação, whitepapers, fóruns da comunidade, 6 Trusted Advisor checks básicos e Personal Health Dashboard. Não inclui suporte técnico humano.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Compute + Storage + Data Transfer OUT são os 3 custos principais. Free Tier tem 12 meses, always-free e trials. Savings Plans &gt; RIs para maioria (mais flexível). Organizations = multi-account + consolidated billing + volume discounts. 4 planos de suporte: Basic (grátis) / Developer ($29) / Business ($100+) / Enterprise ($15k+), e o Enterprise On-Ramp entre os dois últimos. TAM dedicado só Enterprise. Budgets (proativo) + Cost Explorer (retrospectivo) + Pricing Calculator (pre-emptivo).
      </Callout>
    </div>
  );
}
