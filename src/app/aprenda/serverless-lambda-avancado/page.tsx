import type { Metadata } from 'next';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, InlineCode, ComparisonTable, DecisionBox, ArchDiagram, QAItem, ExamDomainBadge } from '@/components/article/primitives';

export const metadata: Metadata = {
  title: 'Serverless Avançado: Lambda, API GW e Step Functions — FFV Academy',
  description: 'Lambda deep dive (concurrency, cold start, layers), API Gateway REST vs HTTP, Step Functions e workflows serverless para SAA-C03.',
};

const ACCENT = '#146eb4';

const quiz: QuizQuestion[] = [
  {
    question: 'Uma Lambda crítica sofre latência de 3s em cold starts. Como reduzir sem mudar o código?',
    options: [
      'Aumentar memory allocation para 10 GB',
      'Habilitar Provisioned Concurrency',
      'Usar API Gateway cache',
      'Aumentar timeout',
    ],
    correct: 1,
    explanation: 'Provisioned Concurrency mantém N environments Lambda warm e prontos — elimina cold start. Custa extra ($ por GB-hora provisioned), mas garante latência consistente. Aumentar memória melhora ligeiramente, mas não elimina cold start. API GW cache não ajuda com latência da Lambda.',
  },
  {
    question: 'Qual diferença entre API Gateway REST API e HTTP API?',
    options: [
      'HTTP API é mais novo, mais barato, mas tem menos features (sem API keys, usage plans, WAF nativo)',
      'REST API é deprecated',
      'HTTP API suporta apenas HTTP, REST suporta HTTPS',
      'REST API só funciona com Lambda',
    ],
    correct: 0,
    explanation: 'HTTP API (lançado 2019) é ~70% mais barato que REST, menor latência, e tem Cognito/JWT nativo. Mas falta API Keys, Usage Plans, Request Validation, Caching, WAF. REST API tem tudo isso + EDGE endpoint. Escolha baseado nas features — não no preço sozinho.',
  },
  {
    question: 'Uma empresa precisa orquestrar um workflow: Lambda1 → check em DynamoDB → se ok chama Lambda2, senão espera 10min e tenta novamente. Qual serviço?',
    options: [
      'EventBridge',
      'SQS',
      'Step Functions',
      'CloudWatch Events',
    ],
    correct: 2,
    explanation: 'Step Functions é orquestrador de estados (state machine). Suporta branches (Choice), wait, parallel, retry, catch. Visual workflow. EventBridge dispara eventos mas não orquestra fluxos complexos. SQS é fila.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="serverless-lambda-avancado"
      title="Serverless Avançado: Lambda, API GW, Step Functions"
      icon="⚡"
      xp={80}
      readTime={15}
      trailName="AWS Solutions Architect Associate"
      trailColor={ACCENT}
      nextSlug="s3-avancado"
      nextTitle="S3 Profundo: Classes, Lifecycle, Replication"
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
        Serverless é tema central do SAA-C03. Lambda isolado é fácil — a prova testa quando usar Lambda vs Fargate vs ECS, como combinar com API Gateway, quando orquestrar com Step Functions, e como lidar com cold start, concurrency, VPC, event sources.
      </p>

      <Section title="Onde isso entra no exame" accent={ACCENT}>
        <ExamDomainBadge domain="Domains 2 + 3 — Resilient & High-Performing" weight="50%" color={ACCENT} />
        <p>
          Serverless aparece como alternativa a quase qualquer arquitetura baseada em EC2. Espere questões de &ldquo;menor esforço operacional&rdquo; — a resposta geralmente envolve Lambda + API GW + DynamoDB.
        </p>
      </Section>

      <Section title="Lambda — limites e fundamentos" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Limite / Config', 'Valor']}
          rows={[
            ['Memory', '128 MB a 10.240 MB (10 GB), em steps de 1 MB'],
            ['vCPU', 'Proporcional à memória (10 GB = 6 vCPUs)'],
            ['Timeout', '1s a 900s (15 min)'],
            ['Deployment package', '50 MB zipped (direto) / 250 MB unzipped / 10 GB (container image)'],
            ['/tmp storage', '512 MB default, até 10 GB configurável'],
            ['Environment variables', '4 KB total'],
            ['Concurrent executions', '1.000 default (soft limit, pode aumentar)'],
            ['Burst concurrency', '500 a 3000 (depende da região) por minuto'],
            ['Payload sync', '6 MB request/response'],
            ['Payload async', '256 KB'],
          ]}
        />
      </Section>

      <Section title="Event Sources — como Lambda é disparada" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Modelo', 'Exemplos']}
          rows={[
            ['Synchronous (push)', 'Caller espera resposta', 'API GW, ALB, Cognito, SDK invoke'],
            ['Asynchronous (push)', 'Lambda recebe evento, AWS retry com DLQ/OnFailure', 'S3, SNS, EventBridge, CloudWatch Events'],
            ['Poll-based (event source mapping)', 'Lambda faz polling do stream/queue', 'SQS, Kinesis, DynamoDB Streams, MSK'],
          ]}
        />
        <Callout tone="info">
          <strong>Retry behavior por modelo:</strong> sync → caller decide (sem retry automático). Async → Lambda retry 2x com exponential backoff; depois DLQ/OnFailure. Event source mapping → depende do source (SQS reenfileira, Kinesis retry até expirar).
        </Callout>
      </Section>

      <Section title="Cold Start e Concurrency" accent={ACCENT}>
        <ArchDiagram title="Ciclo de vida de uma execution environment" accent={ACCENT}>{`
   INIT (cold start)
   ├── Download código                 ]
   ├── Start runtime (JVM, Node, etc.) ] ~200-3000 ms
   ├── Executar código de init         ]
   │
   INVOKE (warm)
   ├── Executar handler                 ~1-100 ms
   │
   (reutilizado para próximas invocations até ~15 min idle)
   │
   SHUTDOWN
`}</ArchDiagram>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia', 'Efeito']}
          rows={[
            ['Provisioned Concurrency', 'Mantém N envs warm, cold start = 0, custa extra'],
            ['SnapStart (Java)', 'Snapshot do env, cold start 10x mais rápido, grátis'],
            ['Aumentar memory', 'Mais vCPU, init mais rápido, custa mais'],
            ['Dep size menor', 'Menos código = cold start menor'],
            ['Compiled runtime (Go/Rust)', 'Inicializa mais rápido que JVM/Python'],
          ]}
        />
      </Section>

      <Section title="Lambda em VPC" accent={ACCENT}>
        <p>
          Por padrão Lambda roda fora da sua VPC (internet via NAT AWS). Quando precisa acessar RDS/ElastiCache em subnet privada, configura VPC em <InlineCode>Lambda → VPC settings</InlineCode>. Lambda cria Hyperplane ENI compartilhada por várias Lambdas da mesma VPC.
        </p>
        <Callout tone="warn">
          <strong>Armadilhas VPC:</strong> Lambda em VPC PRECISA de NAT Gateway para acessar serviços AWS fora da VPC (S3, DynamoDB) — a menos que você configure VPC Endpoints. Sem isso, chamadas a S3 pendem indefinidamente.
        </Callout>
      </Section>

      <Section title="Lambda Layers, Versions, Aliases" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Layers</strong> — código compartilhado entre Lambdas (libs, binários). Até 5 layers por Lambda.</li>
          <li>• <strong>Version</strong> — snapshot imutável da Lambda (código + config). Referência por ARN com :N.</li>
          <li>• <strong>Alias</strong> — ponteiro mutável para version (ex: prod → v5, staging → v6). Permite routing por %.</li>
          <li>• <strong>Canary deploy</strong> — alias com weight split: 90% v5 / 10% v6, ajusta gradualmente.</li>
        </ul>
      </Section>

      <Section title="Lambda Destinations e DLQ" accent={ACCENT}>
        <p>
          Para Lambdas async, você define o que acontece pós-execução:
        </p>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>OnSuccess destination</strong> — envia resultado para SNS/SQS/Lambda/EventBridge</li>
          <li>• <strong>OnFailure destination</strong> — mesmo para falhas (após retries)</li>
          <li>• <strong>DLQ</strong> (legacy) — só falhas, envia evento original para SQS/SNS</li>
        </ul>
      </Section>

      <Section title="API Gateway — REST API vs HTTP API vs WebSocket API" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Feature', 'REST API', 'HTTP API', 'WebSocket API']}
          rows={[
            ['Preço', '$3,50/M requests', '$1,00/M requests', '$1,00/M requests + $0,25/M minutes'],
            ['Lançamento', '2015', '2019', '2018'],
            ['Latência', 'Alta', 'Baixa', 'Média'],
            ['Cognito/JWT', 'Cognito', 'Cognito + JWT genérico', 'Cognito'],
            ['API Keys / Usage Plans', '✅', '❌', '❌'],
            ['Request/Response transformation', '✅', '❌', '❌'],
            ['Caching', '✅', '❌', '❌'],
            ['WAF', '✅', '❌ (precisa CloudFront)', '❌'],
            ['Edge endpoint', '✅', '❌ (regional only)', 'Regional'],
            ['Private endpoint', '✅', '❌', '❌'],
            ['Uso', 'Enterprise APIs com features avançadas', 'APIs modernas simples/rápidas', 'Chat, real-time'],
          ]}
        />
      </Section>

      <Section title="API Gateway — integrações e features" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>Integration types</strong> — Lambda Proxy, Lambda non-proxy, HTTP (VPC Link), AWS service (ex: Step Functions), Mock</li>
          <li>• <strong>Stages</strong> — dev, staging, prod (cada uma deploy separado)</li>
          <li>• <strong>Custom authorizers</strong> — Lambda que valida token (JWT, custom)</li>
          <li>• <strong>Usage Plans + API Keys</strong> — quotas por cliente (só REST API)</li>
          <li>• <strong>Throttling</strong> — account-level e per-method rate limiting</li>
          <li>• <strong>CORS</strong> — configurável por stage/resource</li>
          <li>• <strong>Canary deployment</strong> — % do tráfego em nova version (REST)</li>
        </ul>
      </Section>

      <Section title="Step Functions — orquestração" accent={ACCENT}>
        <p>
          State machine serverless. Define workflow em Amazon States Language (ASL, JSON). Cada state é uma etapa: Task (invoca serviço), Choice (branch), Wait, Parallel, Map (iterar sobre array), Pass, Succeed, Fail.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Uso', 'Execução']}
          rows={[
            ['Standard Workflow', 'Workflows longos (até 1 ano), com histórico', 'Paga por state transition ($0,025/1k)'],
            ['Express Workflow', 'Alta volume, <5 min, sem histórico detalhado', 'Paga por request + duração (muito mais barato)'],
          ]}
        />
        <ArchDiagram title="Exemplo: order processing" accent={ACCENT}>{`
  [Start] → ValidateOrder (Lambda)
             │
             ├─ fraudulent? → Choice ─┬─ yes → NotifyFraud → End
             │                         └─ no  → ChargeCard (Lambda)
             │
             ↓
           Parallel:
             ├─ UpdateInventory (DynamoDB)
             └─ SendConfirmation (SES)
             │
             ↓
           ShipOrder (SQS → EC2 worker)
             │
             ↓
           [End]
`}</ArchDiagram>
      </Section>

      <Section title="EventBridge (CloudWatch Events v2)" accent={ACCENT}>
        <p>
          Event bus serverless que roteia eventos por pattern matching. Schema registry, custom buses, SaaS partners (Shopify, PagerDuty), scheduled rules (cron).
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Tipo', 'Uso']}
          rows={[
            ['Default bus', 'Eventos AWS automáticos (EC2 state change, etc.)'],
            ['Custom bus', 'Suas apps publicam eventos customizados'],
            ['Partner bus', 'SaaS 3rd party (Zendesk, MongoDB Atlas)'],
            ['Pipes', 'Conecta source (SQS/Kinesis) → filter → enrich → target (Lambda/Step Functions)'],
            ['Scheduler', 'Cron centralizado (substitui CloudWatch Events rules para schedules)'],
          ]}
        />
      </Section>

      <Section title="SAM e CDK — deploy serverless" accent={ACCENT}>
        <ul className="flex flex-col gap-1 text-xs pl-4">
          <li>• <strong>AWS SAM</strong> — extensão de CloudFormation para serverless (YAML com shortcuts)</li>
          <li>• <strong>AWS CDK</strong> — infra em Python/TypeScript/Java/.NET/Go (gera CloudFormation)</li>
          <li>• <strong>Serverless Framework</strong> — 3rd party multi-cloud (YAML)</li>
        </ul>
      </Section>

      <Section title="Cenários de decisão" accent={ACCENT}>
        <DecisionBox
          scenario="API REST simples com 10k req/dia, backend lógica de negócio"
          winner="API Gateway HTTP API + Lambda + DynamoDB"
          winnerColor={ACCENT}
          why="HTTP API ($1/M) + Lambda + DynamoDB on-demand. Custo ~$0 em Free Tier. Escala automaticamente. Sem gestão de server."
        />
        <DecisionBox
          scenario="App enterprise com 50 parceiros que precisam de API keys, throttling diferente por tier, request validation"
          winner="API Gateway REST API + Lambda + Usage Plans"
          winnerColor={ACCENT}
          why="REST API tem API keys, usage plans, request validation, caching — HTTP API não. Custo maior ($3,50/M) é justificado pelas features."
        />
        <DecisionBox
          scenario="Processo de onboarding com múltiplos steps (validate → create account → send email → notify CRM), com retry customizado"
          winner="Step Functions Standard Workflow + Lambda tasks"
          winnerColor={ACCENT}
          why="State machine com Retry/Catch em cada Task. Visual flow. Histórico de execuções. Lambda sozinho exigiria orquestração em código (frágil)."
        />
        <DecisionBox
          scenario="Lambda crítica com p99 latency spike de 3s por cold start"
          winner="Provisioned Concurrency"
          winnerColor={ACCENT}
          why="PC mantém N envs warm. Extra cost mas latência consistente. Alternativa: Lambda SnapStart (Java only, grátis)."
        />
        <DecisionBox
          scenario="Worker que processa 1M mensagens SQS/dia, lógica média"
          winner="Lambda com event source mapping a SQS"
          winnerColor={ACCENT}
          why="Lambda polling SQS automaticamente. Escala com backlog. Batch size configurável. Free tier + spot pricing torna extremamente barato vs EC2 worker."
        />
      </Section>

      <Callout tone="warn">
        <strong>Pegadinhas serverless no SAA:</strong>
        <ul className="flex flex-col gap-1 mt-1">
          <li>• <strong>Lambda + RDS</strong> — cada invocation abre nova conexão; pode estourar max_connections. Use <strong>RDS Proxy</strong> para connection pooling.</li>
          <li>• <strong>Lambda sync de 6 MB</strong> — payload maior precisa upload/download via S3 (event contém S3 key).</li>
          <li>• <strong>VPC cold start</strong> agora é &lt;1s graças a Hyperplane ENIs (melhoria 2019).</li>
          <li>• <strong>Reserved concurrency ≠ Provisioned concurrency</strong> — Reserved limita máximo; Provisioned mantém warm.</li>
          <li>• <strong>API Gateway resource policies</strong> permitem/negam IPs/VPCs.</li>
          <li>• <strong>Step Functions Express</strong> é mais barato para alta volume curta; Standard para workflows longos/auditoria.</li>
        </ul>
      </Callout>

      <Section title="Perguntas típicas (Q&A)" accent={ACCENT}>
        <QAItem
          q="Como permitir que API Gateway invoque Lambda?"
          a={<>Dois caminhos: (1) API GW cria permission (<InlineCode>lambda:InvokeFunction</InlineCode>) automaticamente no console; (2) Explicitamente via resource-based policy da Lambda. Lambda execution role define o que a Lambda pode fazer — não quem pode chamá-la.</>}
        />
        <QAItem
          q="Minha Lambda precisa acessar RDS Aurora em VPC. O que fazer?"
          a={<>Configurar VPC settings da Lambda (subnets privadas + SG). Adicionar <strong>RDS Proxy</strong> entre Lambda e DB para connection pooling. Se precisa acesso a S3 também, adicionar VPC Endpoint Gateway para S3 ou NAT GW.</>}
        />
        <QAItem
          q="Como fazer deploy canário em API Gateway REST?"
          a={<>API GW REST tem canary nativo: <InlineCode>canarySettings</InlineCode> no stage com <InlineCode>percentTraffic</InlineCode>. Roteia X% para nova deployment. Combinado com CloudWatch alarms, promove ou roll back.</>}
        />
        <QAItem
          q="SQS + Lambda — o que acontece se Lambda falha?"
          a={<>SQS reenfileira. Configurar <strong>redrive policy</strong> na queue para mover mensagens falhadas N vezes para DLQ. Visibility timeout &gt; Lambda timeout (senão mensagem reaparece antes da Lambda terminar).</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways:</strong> Lambda: 128 MB-10 GB, 15 min max, sync (6 MB) / async (256 KB) / poll-based. Cold start mitigável com Provisioned Concurrency / SnapStart / memory. Lambda em VPC precisa NAT/VPC Endpoint para AWS services. API GW: REST (features completas) vs HTTP (barato e rápido) vs WebSocket. Step Functions orquestram workflows (Standard longo, Express curto). EventBridge roteia eventos por pattern. SAM/CDK para deploy. Serverless resolve "menor esforço operacional" — frase-chave no exame.
      </Callout>
    </div>
  );
}
