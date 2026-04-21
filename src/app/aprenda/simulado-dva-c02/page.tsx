import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout } from '@/components/article/primitives';

export const metadata = getModuleMetadata('simulado-dva-c02');

const accent = '#ff9900';

// Capstone = simulado de 3 questões amostra (expansão paga em /simulados)
const quiz: QuizQuestion[] = [
  {
    question: 'Lambda conectada em VPC está tendo cold start de 10s. Qual é a principal causa e mitigação?',
    options: [
      'Handler lento',
      'ENI attachment em VPC (AWS criava ENI nova a cada cold start). Desde 2019 há Hyperplane ENI mantida por service — cold start reduziu. Ainda: verificar security groups, subnet com ENI warm, usar VPC só se necessário',
      'Memória baixa',
      'Runtime Python',
    ],
    correct: 1,
    explanation: 'Antes (2018) VPC = +10s cold start. Desde Hyperplane (2019) é ~1s. Se ainda alto: verificar subnets com capacity de ENI, NAT Gateway latency, downstream chamado pelo INIT. Saída: Lambda fora de VPC quando não precisa (use VPC endpoints pra DynamoDB/S3 sem VPC).',
  },
  {
    question: 'Você precisa processar 100 mensagens SQS em paralelo em Lambda. Como configurar?',
    options: [
      'Impossível',
      'Event source mapping com BatchSize 10 (Lambda recebe batch de 10 msgs por invocation), MaximumConcurrency até 1000 (controla concurrent Lambdas processando). SQS pode ter DLQ após MaxReceiveCount',
      'Usar SNS',
      'Lambda não suporta SQS',
    ],
    correct: 1,
    explanation: 'BatchSize agrupa msgs em uma invocation. MaximumConcurrency (2022) limita Lambdas concorrentes lendo SQS — evita overwhelm de downstream. PartialBatchResponse permite report de msgs individuais falhadas sem retry de batch inteiro. DLQ captura msgs que falharam N vezes.',
  },
  {
    question: 'CodeDeploy faz canary 10% de tráfego pra nova versão Lambda. Como implementar?',
    options: [
      'Impossível',
      'Alias com weighted routing: alias "prod" aponta pra versão $LATEST com 10% e versão N com 90%. CodeDeploy gerencia shift gradual (Canary10Percent5Minutes). Rollback automático se CloudWatch alarm trigger',
      'Só blue/green',
      'Manual',
    ],
    correct: 1,
    explanation: 'Lambda suporta alias weighted. CodeDeploy presets: Canary10Percent5Minutes, Canary10Percent15Minutes, Linear10PercentEvery1Minute, AllAtOnce. AppSpec hooks (BeforeAllowTraffic) pra smoke test antes do shift. Rollback via CW alarm.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="simulado-dva-c02"
      title="Capstone: simulado DVA-C02 comentado (amostra)"
      icon="🏁"
      xp={80}
      readTime={18}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Sobre este capstone" accent={accent}>
        <p>
          Estas 3 questões são <strong>amostra</strong> do estilo real do exame. Para o simulado completo (65 questões, tempo real, breakdown por domínio, explicações completas, certificado de prep), veja a aba <strong>/simulados</strong>.
        </p>
        <Callout tone="info" icon="💡">
          Dica de exam day: leia ENUNCIADO INTEIRO antes das options (50% das perguntas tentam te distrair com &quot;chave palavra&quot; no início). Eliminate distratores antes de escolher — dá pra chegar a 2 opções plausíveis em 80% dos casos.
        </Callout>
      </Section>

      <Section title="Checklist pré-exame" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>☐ Lambda: cold start, layers, VPC ENI, concurrency types, destinations, SnapStart</li>
          <li>☐ DynamoDB: single-table, hot partition, LSI/GSI, Streams, TTL, transactions</li>
          <li>☐ API Gateway: HTTP vs REST vs WS, authorizer types, WAF, caching, throttling</li>
          <li>☐ S3: presigned, multipart, events, lifecycle, replication, encryption</li>
          <li>☐ Step Functions: Standard vs Express, Map, Parallel, callback</li>
          <li>☐ EventBridge/SQS/SNS: fan-out, visibility timeout, DLQ, FIFO vs Standard</li>
          <li>☐ Cognito: User vs Identity Pool, authorizer nativo, custom auth triggers</li>
          <li>☐ KMS: envelope, CMK vs AWS-managed, key policy + IAM interaction</li>
          <li>☐ CodePipeline/Build/Deploy: buildspec, appspec, deployment strategies</li>
          <li>☐ X-Ray: segments, sampling, ADOT</li>
          <li>☐ Secrets Manager vs Parameter Store</li>
          <li>☐ ECS Fargate: Task Def, Service, ALB, Spot</li>
          <li>☐ CFN/SAM/CDK: quando escolher, drift, StackSets</li>
        </ul>
      </Section>

      <Section title="Simulado completo" accent={accent}>
        <p>
          Acesse <strong>/simulados</strong> pra fazer o simulado DVA-C02 com 65 questões (10 grátis, desbloqueio completo R$ 67). Timer de 130 min, breakdown por domínio, explicações do tutor IA por questão.
        </p>
      </Section>
    </ModuleLayout>
  );
}
