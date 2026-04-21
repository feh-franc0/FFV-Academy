import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dynamodb-para-dev');

const accent = '#ff9900';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é "hot partition" em DynamoDB?',
    options: [
      'Temperatura alta',
      'Uma partition recebendo tráfego desproporcional por má escolha de partition key — throttled a 3000 RCU / 1000 WCU por partition, independente de capacity total da tabela',
      'Tipo especial de tabela',
      'Sinônimo de GSI',
    ],
    correct: 1,
    explanation: 'DynamoDB divide dados em partitions por hash da PK. Se 80% do tráfego é pra uma PK ("user#admin"), aquela partition vira hot → ProvisionedThroughputExceeded. Fix: randomizar PK (suffix), write sharding, DynamoDB Streams + aggregation.',
  },
  {
    question: 'Qual a diferença entre LSI e GSI?',
    options: [
      'Mesma coisa',
      'LSI: mesma PK da table, SK diferente. Criada na criação da table, max 5, compartilha throughput. GSI: PK E SK podem ser diferentes, criada quando quiser (max 20), tem throughput próprio, eventually consistent',
      'LSI é deprecated',
      'GSI é cara de usar',
    ],
    correct: 1,
    explanation: 'Local Secondary Index: mesma hash, sort alternativa. Global Secondary Index: totalmente nova projection. GSI é MUITO mais usado (flexível) mas eventually consistent. LSI é strongly consistent mas restrito.',
  },
  {
    question: 'O que DynamoDB Streams captura?',
    options: [
      'Nada',
      'CDC (Change Data Capture): toda mudança em items por 24h — pode trigger Lambda, replicate pra outra region, update cache, integrar com Kinesis',
      'Só deletes',
      'Apenas em tabelas small',
    ],
    correct: 1,
    explanation: 'Streams emite events: INSERT, MODIFY, REMOVE com NEW_AND_OLD_IMAGES. Lambda trigger é o uso #1: replicate pra Elasticsearch pra full-text search, materialize views, notify outras services. Event-driven architecture nativa.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dynamodb-para-dev"
      title="DynamoDB pra dev: partition key, GSI e Streams"
      icon="🗃️"
      xp={65}
      readTime={15}
      trailName="AWS Developer Associate (DVA-C02)"
      trailColor={accent}
      nextSlug="s3-dev-features"
      nextTitle="S3 features pra dev: presigned URLs, multipart e events"
      quiz={quiz}
    >
      <Section title="Single-Table Design (Rick Houlihan)" accent={accent}>
        <p>
          Padrão profissional: <strong>todos</strong> os "objetos" numa tabela. PK/SK overloaded. Ex: PK = <InlineCode>USER#123</InlineCode>, SK varia por tipo (<InlineCode>PROFILE</InlineCode>, <InlineCode>ORDER#789</InlineCode>, <InlineCode>ADDRESS#1</InlineCode>). Acesso: query por PK retorna tudo relacionado. Access patterns definem schema — design começa por queries, não entidades.
        </p>
      </Section>

      <Section title="Operações críticas" accent={accent}>
        <CodeBlock lang="typescript">{`import { DynamoDB } from '@aws-sdk/client-dynamodb';

// Conditional write — optimistic locking
await ddb.updateItem({
  TableName: 'orders',
  Key: { id: 'o1' },
  UpdateExpression: 'SET #status = :new',
  ConditionExpression: '#status = :old AND version = :v',
  ExpressionAttributeNames: { '#status': 'status' },
  ExpressionAttributeValues: {
    ':new': 'paid', ':old': 'pending', ':v': 3,
  },
});

// TransactWriteItems — ACID em até 100 items
await ddb.transactWriteItems({
  TransactItems: [
    { Put: { TableName: 'orders', Item: newOrder } },
    { Update: { TableName: 'users', ... } },
  ],
});

// BatchGetItem — 100 items em paralelo
await ddb.batchGetItem({ RequestItems: { orders: { Keys: [...] } } });`}</CodeBlock>
      </Section>

      <Section title="Capacity modes" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-2">
          <li><strong>On-Demand</strong>: escala automático, paga por request, default moderno pra carga variável.</li>
          <li><strong>Provisioned</strong>: RCU/WCU fixos, mais barato em carga previsível constante. Auto Scaling possível.</li>
          <li>TTL: <InlineCode>ttl</InlineCode> attribute como epoch — DynamoDB deleta ±48h após expiry grátis. Ideal pra session, cache, events antigos.</li>
        </ul>
        <Callout tone="info" icon="💡">
          Regra prática: comece On-Demand. Se volume alto e constante por meses, considere migrar pra Provisioned+Auto Scaling pra economizar 30-70%.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
