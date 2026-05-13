import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('eventbridge-sqs-sns-para-dev');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a principal diferença entre SQS e SNS?',
    options: [
      'São iguais',
      'SQS é FILA (pull, 1 consumer pega, message processada uma vez). SNS é TÓPICO PUB/SUB (push, todos subscribers recebem cada message). Combinam em fan-out: SNS → múltiplos SQS',
      'SQS é deprecated',
      'SNS é só pra email',
    ],
    correct: 1,
    explanation: 'SQS = queue (message processada por 1 consumer). SNS = pub/sub (fan-out pra N subscribers). Fan-out pattern: 1 SNS topic com N SQS subscribers — cada SQS processa independentemente, retry isolado. Padrão clássico AWS.',
  },
  {
    question: 'O que é visibility timeout em SQS?',
    options: [
      'Tempo de vida da fila',
      'Tempo que message fica "invisível" depois de recebida (default 30s). Durante esse período, outros consumers não veem. Se consumer não deletar antes do timeout, message reaparece — garante que nenhuma some se consumer crashar',
      'TTL',
      'Rate limit',
    ],
    correct: 1,
    explanation: 'Visibility timeout = tempo pra processar a msg. Se maior que processing real → gargalo aparente. Se menor → duplicate delivery. Configure baseado em p99 do processing. Consumer deleta message explicitamente após success.',
  },
  {
    question: 'O que EventBridge oferece além de SNS?',
    options: [
      'Mesma coisa',
      'Schema registry (auto-descoberta), filter rules avançadas (content-based), SaaS partners (Datadog, Shopify events), archive + replay, scheduler (substitui CloudWatch Events), event buses multi-account',
      'Só pra eventos AWS',
      'Substitui Lambda',
    ],
    correct: 1,
    explanation: 'EventBridge (antigo CloudWatch Events) é o evolução pub/sub moderno. Events como JSON tipado, schema auto-generated, pattern matching rico, integrates com 100+ SaaS. Se você começa hoje, EventBridge > SNS em quase todos casos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="eventbridge-sqs-sns-para-dev"
      title="EventBridge, SQS e SNS: qual, quando, como combinar"
      icon="📮"
      xp={55}
      readTime={12}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="cognito-fluxos"
      nextTitle="Cognito: user pools vs identity pools"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Feature', 'SQS', 'SNS', 'EventBridge']}
          rows={[
            ['Modelo', 'Queue (pull)', 'Pub/Sub (push)', 'Event bus (pattern match)'],
            ['Ordem', 'FIFO opcional', 'Sem', 'Sem'],
            ['Durabilidade', 'Até 14 dias', 'Transient', 'Transient + archive 365d'],
            ['Fan-out', 'Não', 'Sim, trivial', 'Sim, com filters'],
            ['Filtros', 'Não', 'Basic attributes', 'Content-based rico'],
            ['Schema', 'N/A', 'N/A', 'Registry + codegen'],
            ['Preço', '$0.40/M', '$0.50/M', '$1.00/M'],
            ['Use case', 'Decouple async processing', 'Notificações simples', 'Event-driven moderno'],
          ]}
        />
      </Section>

      <Section title="Fan-out pattern" accent={accent}>
        <Callout tone="info" icon="💡">
          Publisher → SNS topic → múltiplas SQS subscribers. Cada consumer processa independente, retry/DLQ isolado. Padrão clássico pra compound effects em event (user signup → email + analytics + CRM sync, cada um em fila separada).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
