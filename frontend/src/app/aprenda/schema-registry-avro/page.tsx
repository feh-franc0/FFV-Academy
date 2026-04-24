import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('schema-registry-avro');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é compatibility BACKWARD no Confluent Schema Registry?',
    options: [
      'Consumers novos leem dados antigos',
      'A nova versão do schema consegue ler dados produzidos com a versão anterior — ou seja, consumidores podem atualizar primeiro, depois producers. É o default e protege rolling upgrade do consumer',
      'Nada muda nunca',
      'Producers leem do futuro',
    ],
    correct: 1,
    explanation: 'BACKWARD: new schema reads old data. Permite upgrade do consumer antes do producer (caso mais comum). FORWARD: old schema reads new data (upgrade producer primeiro). FULL: ambos. NONE: sem garantia. Em sistema grande, BACKWARD_TRANSITIVE evita surpresa ao pular versões intermediárias.',
  },
  {
    question: 'Avro vs Protobuf vs JSON Schema — quando escolher Avro?',
    options: [
      'Sempre, é superior',
      'Avro brilha em Kafka + data lake (Parquet, Iceberg): schema embutido no próprio arquivo, suporte first-class em Confluent Registry, evolução rica com defaults e aliases. Protobuf ganha em polyglot RPC; JSON Schema ganha em APIs externas legíveis',
      'Para APIs REST públicas',
      'Nunca',
    ],
    correct: 1,
    explanation: 'Avro é o default do ecosystem Kafka+data (Confluent, Flink, Iceberg) porque o schema é auto-descritivo e evolui bem. Protobuf domina gRPC e mobile (eficiência bytecode, cross-language). JSON Schema é pragmático quando o produto já é JSON e legibilidade importa mais que compactação.',
  },
  {
    question: 'Por que schema id vai no header binário da mensagem Kafka (magic byte + 4 bytes)?',
    options: [
      'Decoração',
      'Para o consumer resolver qual schema usar no deserialize sem ter que adivinhar versão. Primeiro byte é magic (0), próximos 4 bytes são o schema id inteiro no registry; consumer faz lookup cacheado e deserializa. Permite evolução sem quebrar in-flight',
      'Criptografia',
      'Compression',
    ],
    correct: 1,
    explanation: 'Wire format Confluent: [magic:1][schemaId:4][payload avro]. Consumer lê o id, busca schema no registry (com cache), deserializa payload conforme reader/writer schemas resolvidos pelas regras de compatibility. Sem isso, toda mensagem precisaria carregar o schema inteiro (desperdício).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="schema-registry-avro"
      title="Schema registry: Avro, Protobuf, JSON Schema"
      icon="📋"
      xp={55}
      readTime={13}
      trailName="Event Streaming / Kafka Depth"
      trailColor={accent}
      nextSlug="cdc-debezium-avancado"
      nextTitle="CDC com Debezium avançado"
      quiz={quiz}
    >
      <Section title="Por que schema matters em streaming" accent={accent}>
        <p>
          Topic Kafka vive por anos; producers e consumers evoluem em ritmos diferentes. Sem contrato formal, qualquer mudança de campo quebra consumer silenciosamente em produção. Schema registry resolve isso com: (1) schema versionado por subject, (2) regras de compatibility checadas em publish, (3) id binário no wire format.
        </p>
      </Section>

      <Section title="Schema Avro típico de order event" accent={accent}>
        <CodeBlock lang="json">{`{
  "type": "record",
  "name": "OrderCreated",
  "namespace": "com.ffv.orders.v1",
  "fields": [
    { "name": "orderId", "type": "string" },
    { "name": "userId", "type": "string" },
    { "name": "totalCents", "type": "long" },
    { "name": "currency", "type": { "type": "enum", "name": "Currency", "symbols": ["BRL", "USD", "EUR"] } },
    { "name": "createdAt", "type": { "type": "long", "logicalType": "timestamp-millis" } },
    { "name": "couponCode", "type": ["null", "string"], "default": null }
  ]
}`}</CodeBlock>
        <Callout tone="info">
          O default null em couponCode é o que torna esse campo BACKWARD-compatible: consumer novo consegue ler evento antigo que não tinha o campo.
        </Callout>
      </Section>

      <Section title="Regras de compatibility em prática" accent={accent}>
        <CodeBlock lang="bash">{`# Set compatibility do subject
curl -X PUT http://registry:8081/config/orders-value \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \\
  -d '{"compatibility":"BACKWARD_TRANSITIVE"}'

# Publish new schema version (CI valida antes de merge)
curl -X POST http://registry:8081/subjects/orders-value/versions \\
  -H "Content-Type: application/vnd.schemaregistry.v1+json" \\
  -d @schemas/order-created-v2.json`}</CodeBlock>
        <Callout tone="warn">
          Remover campo sem default ou adicionar campo required sem default quebra BACKWARD. Rode o check no CI; bloqueia PR antes de chegar em prod.
        </Callout>
      </Section>

      <Section title="Producer Java com Avro + Registry" accent={accent}>
        <CodeBlock lang="java">{`props.put("key.serializer",   KafkaAvroSerializer.class.getName());
props.put("value.serializer", KafkaAvroSerializer.class.getName());
props.put("schema.registry.url", "http://registry:8081");
props.put("auto.register.schemas", false);   // CI registra, app só publica
props.put("use.latest.version",    true);

OrderCreated ev = OrderCreated.newBuilder()
  .setOrderId(id).setUserId(uid).setTotalCents(12990L)
  .setCurrency(Currency.BRL).setCreatedAt(Instant.now().toEpochMilli())
  .build();

prod.send(new ProducerRecord<>("orders", id, ev));`}</CodeBlock>
      </Section>

      <Section title="Avro vs Protobuf vs JSON Schema" accent={accent}>
        <CodeBlock lang="yaml">{`Avro:
  - schema self-describing no arquivo (data lake friendly)
  - evolução rica (defaults, aliases, unions)
  - default do Kafka + Iceberg + Flink
Protobuf:
  - compactação e cross-language (Java, Go, Python, Swift)
  - gRPC nativo, ecossistema Google
  - evolução por field numbers (imutáveis)
JSON Schema:
  - human readable, debug trivial
  - APIs externas e webhooks
  - maior overhead de bytes`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Default pragmático: Avro para Kafka + analytics, Protobuf para RPC interno polyglot, JSON Schema para bordas externas do sistema.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
