import type { Metadata } from 'next';
import { ModuleLayout, type QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  ComparisonTable,
  DecisionBox,
  QAItem,
  ExamDomainBadge,
  KeyValue,
} from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Otimização de Custos: RI, Savings Plans, Spot — SAA-C03',
  description: 'Cost optimization para SAA-C03: Reserved Instances, Savings Plans Compute vs EC2, Spot Instances, Trusted Advisor, Cost Explorer, Budgets, Cost Allocation Tags e padrões de redução de custo em arquiteturas.',
  keywords: 'Reserved Instances, Savings Plans, Spot, cost optimization, Trusted Advisor, Cost Explorer, Budgets, SAA-C03',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Seu batch de processamento roda 200 instâncias EC2 por 6h/dia, tolera interrupção, e pode reiniciar de checkpoint. Qual modelo de compra tem maior desconto?',
    options: [
      'Standard Reserved Instances 3 anos',
      'Compute Savings Plans 1 ano',
      'Spot Instances',
      'On-Demand com Auto Scaling',
    ],
    correct: 2,
    explanation: 'Spot Instances dão até 90% de desconto vs On-Demand — o maior desconto disponível. Adequado quando workload tolera interrupção (AWS pode recuperar a capacidade com aviso de 2min). RIs e Savings Plans dão até 72% mas exigem commit. On-Demand é o mais caro.',
  },
  {
    question: 'Qual a principal diferença entre Compute Savings Plans e EC2 Instance Savings Plans?',
    options: [
      'Compute SP só cobre EC2; EC2 SP cobre EC2 + Fargate + Lambda',
      'Compute SP cobre EC2 + Fargate + Lambda em qualquer região/família; EC2 SP cobre apenas uma família/região específica mas com desconto maior',
      'EC2 SP tem commit de 3 anos; Compute SP de 1 ano apenas',
      'São idênticos; nomes marketing diferentes',
    ],
    correct: 1,
    explanation: 'Compute Savings Plans dão flexibilidade total (cross-family, cross-region, cobre Fargate e Lambda) mas desconto até 66%. EC2 Instance Savings Plans amarram a uma família específica (ex: m5) em uma região específica, mas dão desconto até 72%. Escolha depende de previsibilidade do workload.',
  },
  {
    question: 'Qual ferramenta recomenda simplesmente "você pode economizar $X migrando de gp2 para gp3"?',
    options: [
      'Cost Explorer',
      'Trusted Advisor',
      'Compute Optimizer',
      'AWS Budgets',
    ],
    correct: 2,
    explanation: 'Compute Optimizer analisa métricas de CloudWatch e recomenda rightsizing para EC2, EBS, Lambda, ASG. Trusted Advisor tem checks genéricos (idle resources, unused EIPs) mas menos granular. Cost Explorer visualiza custos históricos. Budgets alerta quando excede limite. Compute Optimizer é a ferramenta específica para "que tipo/tamanho ideal".',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cost-optimization-saa"
      title="Otimização de Custos: RI, Savings Plans, Spot"
      icon="💰"
      xp={60}
      readTime={12}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="analytics-bigdata"
      nextTitle="Analytics: Athena, EMR, Kinesis, Glue, Redshift"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        Cost-Optimized é 20% do SAA-C03. O exame testa se você sabe escolher o modelo de compra certo (RI, SP, Spot),
        identificar over-provisioning (Compute Optimizer), usar ferramentas de monitoramento (Cost Explorer, Budgets,
        Trusted Advisor) e aplicar padrões arquiteturais que <em>economizam</em> sem sacrificar resiliência.
      </p>

      <div className="flex flex-wrap gap-2">
        <ExamDomainBadge domain="Cost-Optimized" weight="20%" color={ACCENT} />
      </div>

      <Section title="Modelos de compra de EC2 — o espectro completo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Desconto vs On-Demand', 'Commit', 'Flexibilidade', 'Caso']}
          rows={[
            ['On-Demand', '0%', 'Nenhum', 'Total', 'Dev/test, spikes imprevisíveis'],
            ['Compute Savings Plans', 'Até 66%', '1 ou 3 anos', 'Alta: cross-family, cross-region, Lambda/Fargate', 'Workloads estáveis mas que podem mudar tipo'],
            ['EC2 Instance Savings Plans', 'Até 72%', '1 ou 3 anos', 'Família + região fixas', 'Workloads muito previsíveis em família específica'],
            ['Standard RI', 'Até 72%', '1 ou 3 anos', 'Baixa: troca em mesma família', 'Legado, substituído por Savings Plans na maioria dos casos'],
            ['Convertible RI', 'Até 54%', '1 ou 3 anos', 'Média: pode trocar família', 'Quando precisa de RI específica (Windows BYOL)'],
            ['Spot', 'Até 90%', 'Nenhum', 'Tolera interrupção (2min aviso)', 'Batch, ML training, containers stateless'],
            ['Dedicated Host', 'Variável', '1 ou 3 anos ou On-Demand', 'Host físico dedicado', 'Licenças BYOL, compliance'],
            ['Capacity Reservation', 'Sem desconto extra', 'Flexível', 'Garante capacity em AZ específica', 'Eventos críticos, DR'],
          ]}
        />
        <Callout tone="info">
          <strong>Recomendação atual da AWS:</strong> Savings Plans sobre RIs para novos commits. Mais flexíveis e
          desconto equivalente em Compute SP vs Standard RI. RIs ainda existem para workloads herdados.
        </Callout>
      </Section>

      <Section title="Quando cada um ganha — decisão rápida" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Web app roda 24/7 com 20 EC2 m5.xlarge há 2 anos, crescendo lentamente"
          winner="Compute Savings Plans 3 anos"
          why="Carga previsível + tamanho estável = commit de 3 anos. Compute SP (não EC2 SP) porque se a empresa migrar para m6g Graviton, o SP cobre igual."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Renderização de filmes 8h por noite, 500 EC2 c5.24xlarge, tolera instância morrer e reiniciar"
          winner="Spot Instances com diversificação de instance types"
          why="Spot dá até 90% off. Diversificar em vários types reduz risco de interrupção simultânea. Checkpoint em S3 permite resume."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Workload roda em Lambda + Fargate + EC2, com proporção variando mensalmente"
          winner="Compute Savings Plans"
          why="Único SP que cobre Lambda e Fargate. Mistura de compute changes over time — Compute SP absorve."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Oracle DB legado precisa rodar em hardware dedicado por licença BYOL"
          winner="Dedicated Host"
          why="Licença Oracle exige core tracking. Dedicated Host expõe sockets/cores para compliance. Dedicated Instance não serve (não expõe hardware).' }"
        />
      </Section>

      <Section title="Spot Instances — detalhes críticos" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Interruption Notice', v: '2 minutos via instance metadata (/latest/meta-data/spot/termination-time) ou CloudWatch event.' },
            { k: 'Spot Fleet', v: 'Provisiona pool de múltiplos instance types em múltiplas AZs. Reduz risco de interrupção em massa.' },
            { k: 'EC2 Fleet', v: 'Evolução — mistura Spot + On-Demand + RI em único request.' },
            { k: 'Spot Blocks (descontinuado)', v: 'Reservava Spot por 1–6h sem interrupção. AWS descontinuou em 2021.' },
            { k: 'Hibernate on interruption', v: 'Estado em memória salvo em EBS; resume quando capacity volta.' },
            { k: 'Bad fit', v: 'Aplicações single-master sensíveis à interrupção (bancos, sessões não replicadas).' },
          ]}
        />
      </Section>

      <Section title="Ferramentas de visibilidade e controle" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Ferramenta', 'Função']}
          rows={[
            ['Cost Explorer', 'Visualização histórica + forecast. Drill-down por serviço/tag/account.'],
            ['AWS Budgets', 'Alertas quando custo/uso excede threshold. Pode disparar ação (SNS, Lambda).'],
            ['AWS Cost Categories', 'Agrupamentos customizados (ex: "time-A", "produto-X") para relatórios.'],
            ['Cost Allocation Tags', 'Tags ativadas para aparecer em relatórios. Base de FinOps.'],
            ['Trusted Advisor', '5 pilares (cost, performance, security, fault tolerance, service limits). Cost checks: idle EC2, unused EIPs, RI/SP opportunity.'],
            ['Compute Optimizer', 'ML recomenda rightsizing para EC2, EBS, ASG, Lambda baseado em CloudWatch.'],
            ['AWS Pricing Calculator', 'Estimativa de custo pré-deploy.'],
            ['CUR (Cost & Usage Report)', 'Dump granular em S3 (hora por hora, recurso por recurso). Analisado com Athena/QuickSight.'],
          ]}
        />
      </Section>

      <Section title="Padrões arquiteturais que economizam" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Auto Scaling', v: 'Reduz compute fora de horário de pico. Combine com schedule scaling (desliga à noite).' },
            { k: 'S3 Lifecycle', v: 'Mova objetos frios para IA/Glacier automaticamente.' },
            { k: 'CloudFront', v: 'Reduz egress de S3/EC2 (tráfego do POP para o cliente é mais barato que direto).' },
            { k: 'VPC Endpoints', v: 'Gateway endpoints para S3/DynamoDB são GRÁTIS. Evitam custo de NAT Gateway para tráfego intra-AWS.' },
            { k: 'Reserved Capacity em DynamoDB/ElastiCache/RDS', v: 'Mesma lógica de RIs em outros serviços.' },
            { k: 'gp3 sobre gp2', v: 'gp3 é ~20% mais barato na mesma configuração (e desacopla IOPS).' },
            { k: 'Graviton (Arm)', v: 'm6g/c6g dão 20–40% melhor price/performance vs x86 equivalente.' },
            { k: 'Fargate Spot / EC2 Spot em EKS', v: 'Economia para workloads batch em containers.' },
          ]}
        />
      </Section>

      <Section title="Cenários de SAA" accent={ACCENT}>
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Conta com 150 EC2 e 20TB EBS gp2, consultor recomenda economizar"
          winner="Compute Optimizer para rightsizing + migrar EBS gp2→gp3 + comprar Compute SP 1 ano"
          why="Compute Optimizer identifica over-provisioning. gp3 reduz 20% do EBS. SP 1 ano captura ~30% sem commit longo."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="NAT Gateway cobrando $5.000/mês; tráfego é 90% para S3 e DynamoDB"
          winner="Substitua por VPC Gateway Endpoints para S3 e DynamoDB"
          why="Gateway Endpoints são grátis e rotam tráfego internamente. NAT Gateway só paga para os 10% restantes."
        />
        <DecisionBox
          winnerColor={ACCENT}
          scenario="Análise ad-hoc precisa processar 10TB de logs em S3 mensalmente"
          winner="Athena (serverless SQL, paga por TB scanned) + Parquet + Partitioning"
          why="Athena não cobra compute idle. Parquet colunar reduz scan. Partitioning por data limita scope. Alternativa EMR cobraria cluster idle."
        />
      </Section>

      <Section title="Q&A estilo exame" accent={ACCENT}>
        <QAItem
          q="Como alocar custo de infra compartilhada entre 3 departamentos?"
          a={
            <span>
              Cost Allocation Tags obrigatórias via SCP/IAM. Ative no Billing Console. Relatório no Cost Explorer por
              tag &ldquo;department&rdquo;. Use Cost Categories para agrupar contas/serviços em buckets lógicos.
            </span>
          }
        />
        <QAItem
          q="Budget alerta em $10k mas conta continua gastando. O Budget faz enforcement?"
          a={
            <span>
              Não por padrão — Budgets apenas notifica. Para forçar corte, configure action: desanexar IAM policies
              restritivas, parar EC2 específicas via SSM, ou desabilitar serviços. &ldquo;Budget Actions&rdquo; é o feature
              para enforcement ativo.
            </span>
          }
        />
        <QAItem
          q="Vale trocar x86 por Graviton (Arm)?"
          a={
            <span>
              Na maioria dos casos sim — 20–40% melhor price/performance. Mas exige binários compatíveis. Node.js, Python,
              Go, Java (JVM moderna) funcionam nativo. Código com dependências x86 nativas (.so específicas) requer rebuild.
            </span>
          }
        />
        <QAItem
          q="Compute SP vale mais que EC2 SP quando?"
          a={
            <span>
              Sempre que você NÃO tem certeza de estabilidade em família/região. EC2 SP dá mais desconto (até 72% vs 66%)
              mas você perde todo o desconto se trocar para outra família. Em dúvida, Compute SP é o hedge certo.
            </span>
          }
        />
      </Section>

      <Callout tone="warn">
        <strong>Armadilhas:</strong> (1) RI/SP são pagamento garantido — se não usar, paga igual; (2) Spot pode morrer a
        qualquer momento, não rode sessão stateful; (3) gp2 ainda é default em muitos templates — trocar para gp3
        economiza sem esforço; (4) NAT Gateway é um dos maiores ofensores de custo em VPC mal planejada; (5)
        data transfer OUT é caro (especialmente cross-region e para internet).
      </Callout>

      <Callout tone="success">
        <strong>Take-aways:</strong> mapa mental — On-Demand (default), Savings Plans (estável), Spot (interruptível),
        RI (legado). Use Compute Optimizer para rightsizing, Budgets para guardrails, Cost Explorer para visibility,
        CUR para análise profunda. Arquitetura bem desenhada economiza mais que qualquer desconto de compra.
      </Callout>
    </div>
  );
}
