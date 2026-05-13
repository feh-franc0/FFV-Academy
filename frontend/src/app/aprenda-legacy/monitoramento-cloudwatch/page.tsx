import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, DecisionBox, NodeGraph, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata = getModuleMetadata('monitoramento-cloudwatch');

const ACCENT = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual serviço é a fonte de verdade para saber "quem fez a chamada de API para terminar esta EC2 e quando"?',
    options: [
      'Amazon CloudWatch',
      'AWS CloudTrail',
      'AWS Config',
      'AWS Trusted Advisor',
    ],
    correct: 1,
    explanation: 'CloudTrail audita TODAS as chamadas de API na conta AWS: quem (IAM user/role), quando (timestamp), de onde (IP), o quê (API call + parameters). CloudWatch monitora métricas de performance; Config monitora mudanças em configurações de recursos.',
  },
  {
    question: 'Uma EC2 está com CPU acima de 80% por 15 minutos. Qual mecanismo pode disparar automaticamente uma ação (ex: SNS notification, Auto Scaling)?',
    options: [
      'CloudTrail Event',
      'CloudWatch Alarm',
      'AWS Config Rule',
      'Trusted Advisor Alert',
    ],
    correct: 1,
    explanation: 'CloudWatch Alarm monitora métricas e dispara ações (SNS, Auto Scaling, EC2 Actions) quando thresholds são atingidos. Config Rules avaliam configurações (não métricas). CloudTrail registra API calls.',
  },
  {
    question: 'Uma auditoria exige saber se todos os buckets S3 na conta têm versioning habilitado. Qual serviço atende isso?',
    options: [
      'AWS CloudTrail',
      'Amazon CloudWatch',
      'AWS Config + Config Rules',
      'AWS Trusted Advisor',
    ],
    correct: 2,
    explanation: 'AWS Config monitora o estado de configurações e avalia continuamente contra Config Rules (ex: s3-bucket-versioning-enabled). Gera dashboard de compliance e histórico de mudanças. Ideal para auditoria contínua.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="monitoramento-cloudwatch"
      title="Monitoramento: CloudWatch, CloudTrail, Config"
      icon="📊"
      xp={45}
      readTime={9}
      trailName="AWS Cloud Practitioner"
      trailColor={ACCENT}
      nextSlug="well-architected-framework"
      nextTitle="Well-Architected: os 6 Pilares"
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
        Observabilidade na AWS se apoia em 3 pilares: <strong>métricas</strong> (CloudWatch), <strong>auditoria de API</strong> (CloudTrail) e <strong>estado de configuração</strong> (Config). Cada um responde a uma pergunta diferente. Misturá-los é um dos erros mais comuns no CLF-C02.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domain 3 — Cloud Technology and Services" weight="34%" color={ACCENT} />
        <p>
          Monitoramento aparece em cerca de 15% do domínio 3, geralmente em formato "qual serviço respondo para esta pergunta". Decore: métrica/log → CloudWatch; API call → CloudTrail; drift de config → Config.
        </p>
      </Section>

      <Section title="A trindade da observabilidade" accent={ACCENT}>
        <NodeGraph
          title="Qual serviço responde qual pergunta"
          accent={ACCENT}
          columns={[
            {
              label: 'CloudWatch',
              nodes: [
                { icon: '📊', label: '"Como a EC2 está performando?"', sub: 'Métricas + Logs + Alarms + Dashboards', tone: 'emphasis' },
                { icon: '🗓️', label: 'Retenção', sub: 'Até 15 meses (pago); logs podem ir para S3', tone: 'emphasis' },
              ],
            },
            {
              label: 'CloudTrail',
              nodes: [
                { icon: '🕵️', label: '"Quem deletou a EC2 ontem?"', sub: 'Log de API calls: quem / quando / onde / o quê' },
                { icon: '🗓️', label: 'Retenção', sub: '90 dias grátis (Event history); indefinido se enviar para S3' },
              ],
            },
            {
              label: 'Config',
              nodes: [
                { icon: '🧾', label: '"O bucket tinha versioning on?"', sub: 'Histórico de configurações dos recursos' },
                { icon: '🗓️', label: 'Retenção', sub: 'Até 7 anos (Config Recorder + S3)' },
              ],
            },
          ]}
        />
      </Section>

      <Section title="Amazon CloudWatch" accent={ACCENT}>
        <p>Três sub-serviços principais:</p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sub-serviço', 'O que coleta', 'Uso típico']}
          rows={[
            ['Metrics', 'Pontos numéricos ao longo do tempo', 'CPU, disk, network, latência ALB, throttling Lambda'],
            ['Logs', 'Linhas de log de apps / serviços', 'Logs do Lambda, CloudTrail, VPC Flow Logs'],
            ['Events / EventBridge', 'Eventos em tempo real (ex: EC2 state change)', 'Triggers para Lambda, SQS, Step Functions'],
          ]}
        />
        <p><strong>Outros componentes:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Alarms</InlineCode> — thresholds em métricas disparam ações</li>
          <li>• <InlineCode>Dashboards</InlineCode> — visualização customizada</li>
          <li>• <InlineCode>Logs Insights</InlineCode> — query SQL-like em logs (pay-per-query)</li>
          <li>• <InlineCode>Container Insights</InlineCode> — métricas para ECS/EKS</li>
          <li>• <InlineCode>Lambda Insights</InlineCode> — métricas estendidas para Lambda</li>
          <li>• <InlineCode>Synthetics</InlineCode> — canários que simulam requisições de usuário</li>
          <li>• <InlineCode>RUM (Real User Monitoring)</InlineCode> — telemetria de navegadores reais</li>
        </ul>
      </Section>

      <Section title="Métricas detalhadas vs básicas" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Intervalo', 'Custo', 'Uso']}
          rows={[
            ['Basic (padrão)', '5 minutos', 'Grátis', 'Workloads com mudança lenta'],
            ['Detailed Monitoring', '1 minuto', 'Pago', 'Cargas com picos rápidos, Auto Scaling responsivo'],
            ['High-resolution custom metrics', '1 segundo', 'Pago', 'APM, apps críticas'],
          ]}
        />
        <Callout tone="info">
          <strong>Exame:</strong> EC2 só publica métricas de <strong>fora da instância</strong> (CPU, network, disk I/O). Para métricas <strong>internas</strong> (memória, disk usage real), você instala o <InlineCode>CloudWatch Agent</InlineCode>.
        </Callout>
      </Section>

      <Section title="AWS CloudTrail" accent={ACCENT}>
        <p>
          Todas as chamadas de API na conta são registradas: quem (IAM principal), quando, IP de origem, o que foi chamado, com quais parâmetros, o resultado. Por padrão, <strong>Event History</strong> mantém 90 dias grátis.
        </p>
        <p><strong>Para retenção longa e queries avançadas:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• Criar um <InlineCode>Trail</InlineCode> que entrega eventos a S3 (retenção ilimitada)</li>
          <li>• Habilitar <InlineCode>Log File Validation</InlineCode> (SHA-256 de integridade)</li>
          <li>• Integrar com CloudWatch Logs para alertas em tempo real</li>
          <li>• Usar <InlineCode>CloudTrail Lake</InlineCode> para queries SQL em eventos históricos</li>
        </ul>
        <p><strong>Tipos de evento:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Management Events</InlineCode> — operações no control plane (create/delete recursos). Habilitado por padrão.</li>
          <li>• <InlineCode>Data Events</InlineCode> — operações no data plane (S3 GetObject, Lambda Invoke). Desabilitado por padrão (custo).</li>
          <li>• <InlineCode>Insights Events</InlineCode> — detecta atividade incomum via ML.</li>
        </ul>
      </Section>

      <Section title="AWS Config" accent={ACCENT}>
        <p>
          Registra o <strong>estado de configuração</strong> de cada recurso ao longo do tempo. Permite responder: "como estava esta Security Group em 15/abril às 14:00?". Integra com regras (Config Rules) que avaliam compliance continuamente.
        </p>
        <p><strong>Componentes:</strong></p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <InlineCode>Configuration Recorder</InlineCode> — captura snapshots de recursos</li>
          <li>• <InlineCode>Configuration Items (CIs)</InlineCode> — snapshots versionados</li>
          <li>• <InlineCode>Config Rules</InlineCode> — managed (AWS) ou custom (Lambda) que avaliam compliance</li>
          <li>• <InlineCode>Remediation Actions</InlineCode> — ações automáticas para corrigir drift (ex: habilitar versioning)</li>
          <li>• <InlineCode>Conformance Packs</InlineCode> — coleções de rules (ex: PCI-DSS, HIPAA)</li>
          <li>• <InlineCode>Aggregators</InlineCode> — consolidam dados de múltiplas contas/Regiões</li>
        </ul>
      </Section>

      <Section title="VPC Flow Logs" accent={ACCENT}>
        <p>
          Registram metadata de todo tráfego que passa por uma VPC, subnet ou ENI. Entregues a CloudWatch Logs ou S3. Úteis para troubleshooting de conectividade, forensics e análise de custos de transferência.
        </p>
        <CodeBlock lang="exemplo de linha VPC Flow Log">{`2 123456789012 eni-abc 10.0.1.5 54.210.x.x 443 49152 6 20 4500 1711456789 1711456819 ACCEPT OK`}</CodeBlock>
      </Section>

      <Section title="X-Ray — tracing distribuído" accent={ACCENT}>
        <p>
          Para apps microservices/serverless, X-Ray traceia uma requisição passando por vários serviços (API GW → Lambda → RDS), identificando latência e erros em cada salto. Integra com SDKs Java, Python, Node, Go, etc.
        </p>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="Alertar em Slack se latência da ALB ultrapassar 500ms por 2 min"
          winner="CloudWatch Alarm → SNS → Lambda → Slack webhook"
          winnerColor={ACCENT}
          why="Alarm avalia métrica ALB.TargetResponseTime. SNS notifica assinantes. Lambda formata payload para Slack."
        />
        <DecisionBox
          scenario="Descobrir quem deletou um IAM Role crítico 3 dias atrás"
          winner="CloudTrail Event History (ou Trail em S3)"
          winnerColor={ACCENT}
          why="CloudTrail registra quem (ARN do caller), quando e de onde a chamada DeleteRole foi feita. Event History grátis cobre 90 dias."
        />
        <DecisionBox
          scenario="Garantir que todos os buckets S3 tenham criptografia default sempre ligada"
          winner="AWS Config + Rule s3-bucket-server-side-encryption-enabled + Remediation"
          winnerColor={ACCENT}
          why="Config detecta drift e a remediation action pode automaticamente habilitar encryption. Avaliação contínua em vez de snapshot pontual."
        />
        <DecisionBox
          scenario="Troubleshoot: API em Lambda lenta e não sei se o gargalo é DynamoDB, Lambda ou API GW"
          winner="AWS X-Ray"
          winnerColor={ACCENT}
          why="X-Ray rastreia a requisição em todos os saltos, mostrando o tempo em cada segmento. Visual timeline identifica o verdadeiro gargalo."
        />
      </Section>

      <Section title="Exemplos de CLI" accent={ACCENT}>
        <CodeBlock lang="bash">{`# CloudWatch — criar alarme de CPU
aws cloudwatch put-metric-alarm \\
  --alarm-name high-cpu \\
  --metric-name CPUUtilization \\
  --namespace AWS/EC2 \\
  --statistic Average --period 60 \\
  --threshold 80 --comparison-operator GreaterThanThreshold \\
  --evaluation-periods 3 \\
  --alarm-actions arn:aws:sns:...:avisos \\
  --dimensions Name=InstanceId,Value=i-abc123

# CloudTrail — criar trail
aws cloudtrail create-trail \\
  --name meu-trail \\
  --s3-bucket-name meu-bucket-trails

# Config — status do recorder
aws configservice describe-configuration-recorders`}</CodeBlock>
      </Section>

      <Callout tone="warn">
        <strong>Pegadinha:</strong> CloudWatch Events foi <strong>renomeado</strong> para <strong>EventBridge</strong> (funcionalmente o mesmo + mais features, como schema registry e custom event buses). O exame pode mencionar os dois nomes.
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="CloudWatch Logs pode receber logs de quê?"
          a={<>Lambda (auto), EC2 (via CloudWatch Agent), VPC Flow Logs, CloudTrail, Route 53 (DNS queries), RDS (enhanced monitoring), ECS/EKS, e qualquer app via SDK ou API.</>}
        />
        <QAItem
          q="Como a AWS garante que os logs de CloudTrail não foram adulterados?"
          a={<><InlineCode>Log File Validation</InlineCode> — CloudTrail gera hash SHA-256 de cada arquivo de log e assina digitalmente. Você valida com <InlineCode>aws cloudtrail validate-logs</InlineCode>.</>}
        />
        <QAItem
          q="Qual serviço dispara uma Lambda quando uma EC2 muda de estado para 'running'?"
          a={<><strong>EventBridge (antes CloudWatch Events)</strong>. Regra que matcha pattern de EC2 state change e invoca Lambda como target.</>}
        />
        <QAItem
          q="Como visualizar custos por tag?"
          a={<><strong>AWS Cost Explorer</strong> + <strong>Cost Allocation Tags</strong> ativadas. Não é CloudWatch. Para detalhes granulares, use <strong>AWS Cost and Usage Report (CUR)</strong> no S3.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> CloudWatch = métricas + logs + alarms. CloudTrail = audit de API calls (90 dias grátis, ilimitado no S3). Config = estado de configuração + rules de compliance + remediation. VPC Flow Logs = tráfego de rede. X-Ray = tracing distribuído. EventBridge = reage a eventos em tempo real. Para memória/disk interno EC2 = CloudWatch Agent.
      </Callout>
    </div>
  );
}
