import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('lambda-profundo');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é Provisioned Concurrency em Lambda?',
    options: [
      'Habilitar concurrent executions',
      'Mantém N instâncias sempre "warm" (init phase já rodou) — zero cold start pro N primeiro requests concorrentes. Paga pelo provisionamento',
      'Limite por conta',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'PC paga por "warm instances" 24/7 — aceita quando p99 cold start é inaceitável (Lambda em caminho crítico). Auto Scaling permite curva (escalar PC conforme tráfego). SnapStart (Java/Python) é alternativa barata mas mais limitada.',
  },
  {
    question: 'Qual é o max timeout de Lambda?',
    options: [
      '5 min',
      '15 min (900s)',
      '1 hora',
      '24 horas',
    ],
    correct: 1,
    explanation: '15 min é limit hard. Pra workloads maiores: Step Functions (orquestra vários Lambdas), ECS Fargate (até ilimitado), Batch. Limit pros demais: 10GB memória, 512MB /tmp (ou EFS mount), 250MB unzipped (ou container image até 10GB).',
  },
  {
    question: 'Como reduzir cold start no Lambda?',
    options: [
      'Impossível',
      'Runtime menor (Node, Python), memória maior = CPU mais rápido = init mais rápido, Lambda Layers pra deps compartilhadas, Provisioned Concurrency, SnapStart (Java/Python), evitar VPC se possível (ENI init é lento)',
      'Usar EC2',
      'Apenas eliminando Lambda',
    ],
    correct: 1,
    explanation: 'Táticas: código mínimo (sem framework pesado), empacotar smart, increase memory (vincula CPU), SnapStart pra Java reduz 10x, PC pra zero. VPC Lambda: ENI warmup é bottleneck, evite se não precisar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="lambda-profundo"
      title="Lambda profundo: cold start, layers e provisioned concurrency"
      icon="⚡"
      xp={60}
      readTime={14}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="api-gateway-rest-http-ws"
      nextTitle="API Gateway: REST vs HTTP vs WebSocket"
      quiz={quiz}
    >
      <Section title="Execution lifecycle" accent={accent}>
        <CodeBlock lang="text">{`1. INIT phase (cold start):
   - Baixa código + layers
   - Inicia runtime (Node/Python/etc)
   - Executa código FORA do handler (import, DB pool setup)
   Duração típica: 200-500ms (sem VPC), 1-10s (com VPC + Java)

2. INVOKE phase:
   - Executa handler (seu código)
   - Paga por duração × memória

3. Container reuse ("warm"):
   - Mesmo container pode servir múltiplas requests
   - State em memória PERSISTE (útil pra connection pool)
   - Após ~5-15min idle, AWS deallocates`}</CodeBlock>
      </Section>

      <Section title="Connection pool pattern" accent={accent}>
        <CodeBlock lang="typescript">{`// DB connection FORA do handler — reusa entre invocations (warm)
import { Pool } from 'pg';
const pool = new Pool({ connectionString: process.env.DB_URL });

export const handler = async (event) => {
  const client = await pool.connect();
  try {
    return await client.query(...);
  } finally {
    client.release();
  }
};
// Cold start paga o setup uma vez. Warm invocations reusam.`}</CodeBlock>
      </Section>

      <Section title="Layers" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Pacote ZIP compartilhado entre funções (até 5 layers por função).</li>
          <li>Deps comuns (Axios, Pandas), binários (ffmpeg), shared libs.</li>
          <li>Reduz package size → cold start menor.</li>
          <li>Versionado: layer v1, v2 — função pina versão específica.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Container Image (até 10GB) virou alternativa ao ZIP + Layers em 2020. Se deps são grandes (ML models), container image é mais prático.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
