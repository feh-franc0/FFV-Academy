import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('kafka-fundamentos');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o unit de paralelismo em Kafka?',
    options: [
      'Topic',
      'Partition — cada partition de um topic é um log ordenado; consumer group distribui partitions entre consumers. Ordem GARANTIDA dentro de partition, NÃO entre partitions',
      'Broker',
      'Consumer',
    ],
    correct: 1,
    explanation: 'Topic dividido em N partitions (config). Producer com mesma key vai pra mesma partition (ordem preservada pra aquela key). Consumer group com K consumers processa N partitions em paralelo (1 consumer por partition max). Mais partitions = mais paralelismo + overhead de metadata.',
  },
  {
    question: 'Como Kafka garante exactly-once?',
    options: [
      'Impossível',
      'Idempotent producer (dedup por producer_id + sequence) + transactional writes (commit atômico cross-partition). "Exactly-once effectively" — não literal distributed (impossível), mas pratico',
      'Só com ZooKeeper',
      'Não garante',
    ],
    correct: 1,
    explanation: 'Kafka 0.11+ (2017) adicionou transactional producer. isolation.level="read_committed" no consumer pula messages não-committed. Combined com idempotent producer (enable.idempotence=true), exactly-once across topics é pratico. Distributed exactly-once perfeito é impossible theorem — Kafka faz "effectively" via fence off partial writes.',
  },
  {
    question: 'Qual é o trade-off de aumentar número de partitions?',
    options: [
      'Nenhum',
      'Mais paralelismo MAS: mais overhead (file handles, metadata), rebalance mais lento, replication custo, memory producer. Regra: partition count &gt; max consumers esperados, mas não explode (1000+ partitions/topic é sign de smell)',
      'Sempre melhor',
      'Sempre pior',
    ],
    correct: 1,
    explanation: 'Kafka recomendação: 2x número esperado de consumer parallelism. 50 consumers = ~100 partitions. Muito alto: ZooKeeper/KRaft pressure, file handle limits, slower rebalance. Muito baixo: gargalo. Ajustar é pain (topicos existentes precisa reshuffle). Planeje upfront.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="kafka-fundamentos"
      title="Kafka fundamentos: partições, consumer groups, exactly-once"
      icon="📨"
      xp={65}
      readTime={15}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="iceberg-delta-hudi"
      nextTitle="Iceberg, Delta e Hudi: table formats abertos"
      quiz={quiz}
    >
      <Section title="Kafka mental model" accent={accent}>
        <CodeBlock lang="text">{`Topic "orders" dividido em 4 partitions:
  Partition 0: [event1][event5][event9][...]
  Partition 1: [event2][event6][event10][...]
  Partition 2: [event3][event7][event11][...]
  Partition 3: [event4][event8][event12][...]

Producer com key = user_id:
  hash(user_id) % 4 → partition fixa
  → ordem preservada para aquele user

Consumer group "analytics" com 2 consumers:
  Consumer A: partitions 0, 2
  Consumer B: partitions 1, 3
  → cada event processado EXATAMENTE UMA VEZ no grupo

Consumer group "ml-feature" com 4 consumers:
  cada consumer pega 1 partition → max paralelismo`}</CodeBlock>
      </Section>

      <Section title="Retention e compaction" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li><strong>Time-based retention</strong>: delete eventos &gt; N dias (default 7). Event-sourcing quer infinite — configure.</li>
          <li><strong>Size-based retention</strong>: delete quando topic &gt; N bytes.</li>
          <li><strong>Log compaction</strong>: preserva última version por key. Ideal pra state stream (user profiles, cache — último valor importa).</li>
          <li><strong>Tombstone</strong>: value=null sinaliza delete em compacted topic.</li>
        </ul>
      </Section>

      <Section title="Kafka Streams vs Flink" accent={accent}>
        <Callout tone="info" icon="💡">
          Kafka Streams: JVM library embed no app, simples, limited. Flink: cluster separado, stateful streaming heavy-duty (windowing, joins complexos, CEP). Em 2026 Flink ganhou mindshare forte pra stream processing "serio". Kafka Streams OK pra simples.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
