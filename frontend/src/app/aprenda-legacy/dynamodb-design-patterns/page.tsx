import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('dynamodb-design-patterns');

const accent = '#0ea5e9';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é single-table design em DynamoDB?',
    options: [
      'Usar só uma coluna',
      'Armazenar múltiplas entidades (User, Order, Product) na mesma tabela usando PK/SK sintéticos. Ex: PK=USER#42, SK=PROFILE ou PK=USER#42, SK=ORDER#2026-04-19. Permite recuperar entidades relacionadas com uma Query, reduzindo custo e latência',
      'Ter uma tabela por usuário',
      'Desnormalizar tudo em uma coluna JSON',
    ],
    correct: 1,
    explanation: 'Dynamo não faz joins. Para evitar N round-trips, você modela access patterns primeiro e cria PK/SK que permitem uma Query retornar tudo que você precisa junto. Ex: PK=USER#42 agrupa perfil + pedidos + endereços. É inversão total do pensamento relacional — começa pela query, termina no schema. O livro de referência é The DynamoDB Book (Alex DeBrie).',
  },
  {
    question: 'Para que serve um GSI (Global Secondary Index)?',
    options: [
      'Backup',
      'Permite query por chave alternativa sem varrer a tabela. Ex: tabela tem PK=USER#id, mas preciso buscar por email. Crio GSI com PK=EMAIL#x. Cada GSI é uma projeção replicada — custa escrita extra e storage, então limite a 2-3 por tabela',
      'Cache em memória',
      'Autenticação',
    ],
    correct: 1,
    explanation: 'GSI é uma tabela paralela indexada por outra chave, mantida assíncrona pela AWS. Cada write na tabela base vira write no GSI (custa RCU/WCU separadas). Use para access patterns secundários (login por email, listar por status). LSI (Local) compartilha PK mas só pode ser criado na criação da tabela — raramente vale a pena em 2026.',
  },
  {
    question: 'Qual é o anti-pattern mais comum em DynamoDB?',
    options: [
      'Usar índice',
      'Scan operations em produção e hot partitions. Scan lê a tabela inteira (custa todo o RCU), e partition key de baixa cardinalidade (ex: status="active" para 99% dos itens) concentra tráfego numa partição só, gerando throttling mesmo com capacidade sobrando',
      'Criar tabela',
      'Usar IAM',
    ],
    correct: 1,
    explanation: 'DynamoDB particiona por hash da PK. Se 99% dos itens têm a mesma PK ("active"), toda a carga vai para uma única partição física (limite ~3000 RCU / 1000 WCU por partição). Solução: sharding sintético (status#bucket0..9) ou mudar modelo. Scan é custoso porque consome RCU proporcional ao tamanho da tabela inteira — use Query sempre.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="dynamodb-design-patterns"
      title="DynamoDB: design patterns"
      icon="⚡"
      xp={60}
      readTime={14}
      trailName="NoSQL + Vector Databases"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="DynamoDB pensa ao contrário" accent={accent}>
        <p>
          Em Postgres você modela entidades e descobre as queries depois. Em DynamoDB você lista todas as access patterns primeiro e modela as chaves para que cada padrão seja Query (nunca Scan). Isso exige disciplina e quebra a intuição relacional.
        </p>
        <Callout tone="info" icon="💡">
          Se você não sabe listar os 5-10 access patterns do seu domínio antes de criar a tabela, ainda não está pronto para DynamoDB. Volte ao whiteboard.
        </Callout>
      </Section>

      <Section title="Single-table design: exemplo real" accent={accent}>
        <p>
          Domínio: e-commerce com User, Order e OrderItem. Access patterns: (1) perfil do user, (2) pedidos do user ordenados por data, (3) itens de um pedido, (4) login por email.
        </p>
        <CodeBlock lang="json">{`// Mesma tabela "App", PK e SK sinteticos

// User profile
{ "PK": "USER#42", "SK": "PROFILE",         "email": "fe@x.com", "name": "Fernando" }

// Pedidos do user (ordenados por data via SK)
{ "PK": "USER#42", "SK": "ORDER#2026-04-19#o123", "total": 199.0, "status": "paid" }
{ "PK": "USER#42", "SK": "ORDER#2026-04-20#o124", "total":  89.5, "status": "paid" }

// Itens do pedido (PK = ORDER#id)
{ "PK": "ORDER#o123", "SK": "ITEM#sku-001", "qty": 2, "price": 49.9 }
{ "PK": "ORDER#o123", "SK": "ITEM#sku-042", "qty": 1, "price": 99.2 }

// GSI por email (GSI1PK = EMAIL#...)
{ "PK": "USER#42", "SK": "PROFILE", "GSI1PK": "EMAIL#fe@x.com", "GSI1SK": "USER#42" }`}</CodeBlock>
      </Section>

      <Section title="Queries correspondentes" accent={accent}>
        <CodeBlock lang="ts">{`import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// 1) Perfil + ultimos 10 pedidos em UMA query
const r = await ddb.send(new QueryCommand({
  TableName: 'App',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk)',
  ExpressionAttributeValues: {
    ':pk': 'USER#42',
    ':sk': 'ORDER#'
  },
  ScanIndexForward: false,  // mais recentes primeiro
  Limit: 10
}));

// 2) Login por email (usa GSI1)
const login = await ddb.send(new QueryCommand({
  TableName: 'App',
  IndexName: 'GSI1',
  KeyConditionExpression: 'GSI1PK = :e',
  ExpressionAttributeValues: { ':e': 'EMAIL#fe@x.com' }
}));

// 3) Itens do pedido o123
const items = await ddb.send(new QueryCommand({
  TableName: 'App',
  KeyConditionExpression: 'PK = :pk AND begins_with(SK, :it)',
  ExpressionAttributeValues: { ':pk': 'ORDER#o123', ':it': 'ITEM#' }
}));`}</CodeBlock>
      </Section>

      <Section title="Hot partition: o assassino silencioso" accent={accent}>
        <Callout tone="danger" icon="🚨">
          DynamoDB particiona por hash(PK). Limite físico: ~3000 RCU / 1000 WCU por partição. Se sua PK tem baixa cardinalidade (status, tenant_id de cliente gigante), você sofre throttling mesmo pagando capacity alta. Solução: <strong>write sharding</strong> — adicione sufixo aleatório (<code>status#0</code>..<code>status#9</code>) e faça fan-out na leitura.
        </Callout>
        <CodeBlock lang="ts">{`// Antes (hot)
PK = 'STATUS#active'

// Depois (sharded em 10 buckets)
PK = 'STATUS#active#' + (hash(itemId) % 10)

// Leitura: faz 10 queries em paralelo e merge
const buckets = await Promise.all(
  Array.from({ length: 10 }, (_, i) => query('STATUS#active#' + i))
);`}</CodeBlock>
      </Section>

      <Section title="Quando NÃO usar DynamoDB" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          Access patterns evolutivos (startup fase 0): você não sabe como vai consultar. Relatórios ad-hoc. Analytics agregando tabela inteira. Joins frequentes entre entidades não relacionadas. Nesses casos, Postgres ganha. DynamoDB brilha quando a escala é massiva e o acesso é previsível.
        </Callout>
        <Callout tone="success" icon="✅">
          DynamoDB bem modelado entrega latência p99 &lt; 10ms em qualquer escala por custo previsível. Mal modelado, vira inferno de operação e custo explosivo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
