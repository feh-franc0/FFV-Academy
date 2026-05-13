import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-api-rest-produto-completo');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que começar por OpenAPI antes de codar?',
    options: [
      'É exigência de ISO',
      'Design visível força decisões antes de commit (shape de erro, pagination, auth). Time alinha, frontend começa com mock, backend valida contra spec — baixo custo de retrabalho',
      'Acelera build',
      'É regra de SemVer',
    ],
    correct: 1,
    explanation: 'Spec-first descobre problemas em 30min que em code-first descobriria em sprint 3 (ex: "errror shape é diferente entre endpoints, cliente não consegue handler genérico"). Ferramentas modernas (Stoplight, Swagger Editor) dão feedback em tempo real.',
  },
  {
    question: 'Em capstones de API, o que geralmente fica pra "sprint 2" dentro do escopo deste módulo?',
    options: [
      'Auth',
      'Webhooks + DLQ completo — são sistema complexo com infra própria; preview cobre o conceito',
      'Validação com Zod',
      'Endpoint de health check',
    ],
    correct: 1,
    explanation: 'Webhooks com retry, DLQ, monitoring e dashboard de delivery exigem infra robusta (queue, worker, UI admin). Capstone MVP cobre a origem (enviar signed event) e deixa recebimento/DLQ em docs como extensão. Honest scope > feature bloat.',
  },
  {
    question: 'O que NUNCA deve faltar em uma API pensada pra produção, mesmo num capstone?',
    options: [
      'UI bonita',
      'Logs estruturados com request_id propagado + métricas básicas (rate, error, duration) + health check — os 3 mínimos pra operar',
      'GraphQL',
      'Cache agressivo',
    ],
    correct: 1,
    explanation: 'Sem request_id no log, impossível correlacionar. Sem RED metrics (rate, errors, duration), impossível saber se está funcionando. Sem /healthz, impossível load balancer. Esses 3 são não-negociáveis — mesmo em MVP.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-api-rest-produto-completo"
      title="Capstone: API REST completa de um produto real"
      icon="🏁"
      xp={75}
      readTime={16}
      trailName="API Design & Contratos"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O produto: Tasks API" accent={accent}>
        <p>
          Vamos construir uma API de gestão de tarefas (estilo Todoist leve) aplicando tudo da trilha. Stack: Node + Hono + Zod + Drizzle + Postgres + Redis. 80% do valor em 20% do escopo.
        </p>
      </Section>

      <Section title="1. Spec-first: OpenAPI" accent={accent}>
        <CodeBlock lang="yaml">{`openapi: 3.1.0
info: { label: Tasks API, version: 1.0.0 }
servers: [{ url: https://api.example.com/v1 }]
components:
  securitySchemes:
    BearerAuth: { type: http, scheme: bearer, bearerFormat: JWT }
  schemas:
    Task:
      type: object
      required: [id, title, status]
      properties:
        id: { type: string, format: uuid }
        title: { type: string, maxLength: 200 }
        status: { type: string, enum: [open, done] }
        dueDate: { type: string, format: date-time, nullable: true }
    Error:
      type: object
      required: [code, message, requestId]
      properties:
        code: { type: string }
        message: { type: string }
        requestId: { type: string }
paths:
  /tasks:
    get:
      parameters:
        - in: query, name: limit, schema: { type: integer, default: 20, maximum: 100 }
        - in: query, name: after, schema: { type: string }
      responses:
        '200': { description: OK }
  /tasks/{id}:
    get:
      parameters: [{in: path, name: id, required: true, schema: {type: string}}]`}</CodeBlock>
      </Section>

      <Section title="2. Auth JWT + middleware" accent={accent}>
        <CodeBlock lang="typescript">{`// Hono example
import { jwt } from 'hono/jwt';
app.use('/v1/*', jwt({ secret: process.env.JWT_SECRET! }));

// Inner handlers recebem payload tipado
app.get('/v1/tasks', (c) => {
  const user = c.get('jwtPayload') as { sub: string };
  // ... queries filtradas por user.sub
});`}</CodeBlock>
      </Section>

      <Section title="3. Paginação cursor" accent={accent}>
        <CodeBlock lang="typescript">{`const TaskListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  after: z.string().optional(), // base64 cursor
});

app.get('/v1/tasks', async (c) => {
  const q = TaskListQuery.parse(c.req.query());
  const cursor = q.after ? decodeCursor(q.after) : null;
  const tasks = await db.query.tasks.findMany({
    where: and(
      eq(schema.tasks.userId, user.sub),
      cursor ? or(
        lt(schema.tasks.createdAt, cursor.at),
        and(eq(schema.tasks.createdAt, cursor.at), lt(schema.tasks.id, cursor.id)),
      ) : undefined,
    ),
    orderBy: [desc(schema.tasks.createdAt), desc(schema.tasks.id)],
    limit: q.limit + 1,
  });
  const hasMore = tasks.length > q.limit;
  const items = tasks.slice(0, q.limit);
  return c.json({ items, nextCursor: hasMore ? encodeCursor(items.at(-1)) : null });
});`}</CodeBlock>
      </Section>

      <Section title="4. Idempotency em POST" accent={accent}>
        <CodeBlock lang="typescript">{`app.post('/v1/tasks', async (c) => {
  const key = c.req.header('Idempotency-Key');
  if (key) {
    const cached = await redis.get(\`idem:\${key}\`);
    if (cached) return c.json(JSON.parse(cached), 201, { 'Idempotent-Replay': 'true' });
  }

  const body = CreateTaskSchema.parse(await c.req.json());
  const task = await db.insert(schema.tasks).values({ ...body, userId: user.sub }).returning();

  if (key) await redis.set(\`idem:\${key}\`, JSON.stringify(task[0]), 'EX', 86400);
  return c.json(task[0], 201);
});`}</CodeBlock>
      </Section>

      <Section title="5. Rate limit + headers" accent={accent}>
        <CodeBlock lang="typescript">{`import { Ratelimit } from '@upstash/ratelimit';
const limiter = new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, '1 m') });

app.use('*', async (c, next) => {
  const tenant = c.get('jwtPayload')?.sub ?? c.req.header('x-forwarded-for');
  const { success, remaining, reset } = await limiter.limit(tenant);
  c.header('RateLimit-Remaining', String(remaining));
  c.header('RateLimit-Reset', String(reset));
  if (!success) {
    c.header('Retry-After', String(Math.ceil((reset - Date.now()) / 1000)));
    return c.json({ code: 'rate_limit', message: 'slow down' }, 429);
  }
  await next();
});`}</CodeBlock>
      </Section>

      <Section title="6. Observabilidade mínima" accent={accent}>
        <CodeBlock lang="typescript">{`app.use('*', async (c, next) => {
  const requestId = c.req.header('x-request-id') ?? crypto.randomUUID();
  c.set('requestId', requestId);
  c.header('x-request-id', requestId);
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info({ requestId, method: c.req.method, path: c.req.path, status: c.res.status, ms });
  metrics.histogram('http_request_duration_ms', ms, { path: c.req.path, method: c.req.method });
});`}</CodeBlock>
      </Section>

      <Section title="7. Contract test com Pact" accent={accent}>
        <CodeBlock lang="bash">{`# Frontend publica contract
npx pact publish ./pacts --consumer-app-version=1.0.0 --broker-url=...

# Backend verifica no CI
npx pact-provider-verifier \\
  --provider-base-url=http://localhost:3000 \\
  --pact-broker-url=... \\
  --provider-app-version=$(git rev-parse HEAD)

# Se contrato quebra, CI falha`}</CodeBlock>
        <Callout tone="success" icon="🎓">
          Você aplicou: REST maduro, versionamento URL, auth JWT, cursor pagination, idempotency, rate limit com headers padronizados, logs estruturados, contract testing. Isso é API pronta pra produção — não toy project.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
