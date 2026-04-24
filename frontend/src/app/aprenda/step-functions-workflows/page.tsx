import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('step-functions-workflows');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual a diferença entre Standard e Express workflows?',
    options: [
      'Só nome',
      'Standard: até 1 ano de duração, exactly-once, $25/M transitions — pra ETL longos. Express: até 5min, at-least-once, $1/M — pra high-volume short tasks (IoT, APIs)',
      'Standard é beta',
      'Express só em us-east-1',
    ],
    correct: 1,
    explanation: 'Standard: durável, auditável, caro mas OK pra jobs/approval flows. Express: synchronous ou asynchronous mode, mais rápido/barato pra processar events em volume. Use Synchronous Express pra API Gateway integration.',
  },
  {
    question: 'O que é "callback pattern" em Step Functions?',
    options: [
      'Callback hell',
      'State tipo "waitForTaskToken" pausa workflow até TOKEN ser enviado de volta — permite esperar aprovação humana, external system callback, etc. Sem polling',
      'Impossível',
      'Só com Lambda',
    ],
    correct: 1,
    explanation: 'Workflow para com um token, external system processa, chama SendTaskSuccess(token). Step Functions acorda e continua. Clássico: aprovação via email (link manda POST pra API GW que chama SendTaskSuccess). Sem Step Functions, você reimplementaria isso com DB+polling.',
  },
  {
    question: 'Qual state usa pra paralelismo em Step Functions?',
    options: [
      'Choice',
      'Map (iterate array em paralelo) ou Parallel (branches fixas em paralelo). Ambos acumulam results. Use Map com ItemReader pra processar 1000s de S3 objects',
      'Wait',
      'Pass',
    ],
    correct: 1,
    explanation: 'Map: "pra cada item no array, rode esta sub-workflow". Default concurrency 40, ajustável. Parallel: N branches fixas rodam em paralelo. Map distributed: até 10k items concorrentes com ItemReader de S3.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="step-functions-workflows"
      title="Step Functions: orquestração de workflows"
      icon="🔀"
      xp={55}
      readTime={12}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="eventbridge-sqs-sns-para-dev"
      nextTitle="EventBridge, SQS e SNS: qual, quando, como combinar"
      quiz={quiz}
    >
      <Section title="States essenciais" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['State', 'Uso']}
          rows={[
            ['Task', 'Chama um service (Lambda, DynamoDB, ECS, etc)'],
            ['Choice', 'Branch condicional baseado em input'],
            ['Parallel', 'Branches paralelas fixas, join no fim'],
            ['Map', 'Iterate array processando em paralelo'],
            ['Wait', 'Pausa N segundos ou até timestamp'],
            ['Succeed / Fail', 'Termina workflow'],
            ['Pass', 'Passa input pro próximo (debug, transform)'],
          ]}
        />
      </Section>

      <Section title="Retries e Catch" accent={accent}>
        <Callout tone="info" icon="💡">
          Cada Task state suporta Retry (com backoff exponencial, max attempts) e Catch (redirecionar pra state de error handling). Essencial pra workflows production: DB falhou? Retry 3x com 5/25/125s. Still fail? Vai pra fallback state que notifica Slack.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
