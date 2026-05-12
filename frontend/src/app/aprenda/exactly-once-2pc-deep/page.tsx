import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('exactly-once-2pc-deep');

const accent = '#3b82f6';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que exactly-once em sistemas distribuídos é fundamentalmente difícil?',
    options: [
      'Porque a rede é confiável',
      'Porque qualquer side effect externo (HTTP, email, DB fora do broker) não participa do two-phase commit do broker — o melhor que se consegue é at-least-once com idempotência no receiver',
      'Porque CPUs modernas não suportam',
      'Porque TCP não garante ordem',
    ],
    correct: 1,
    explanation: 'O teorema FLP e a prática mostram: sem cooperação do destinatário (idempotency key, dedupe table), nenhum protocolo single-side garante exactly-once para side effects externos. Kafka/Flink resolvem EOS dentro de si mesmos via 2PC; fora dali é problema do receiver.',
  },
  {
    question: 'O que Flink 2PC sink garante?',
    options: [
      'Nada além de at-least-once',
      'Durante o checkpoint do Flink, o sink faz pre-commit (escreve dados temporariamente) e só commita de verdade quando todos os operadores confirmam o checkpoint global. Em caso de falha, restaura do último checkpoint e descarta pre-commits órfãos',
      'Compressão dos dados',
      'Apenas log local',
    ],
    correct: 1,
    explanation: 'TwoPhaseCommitSinkFunction do Flink integra com Chandy-Lamport checkpointing. Pre-commit reserva recursos no sink (ex: transação aberta no Kafka producer); commit final só após barrier global. É como 2PC distribuído cooperativo, não bloqueante.',
  },
  {
    question: 'idempotent producer + transactions resolvem tudo?',
    options: [
      'Sim, exactly-once global',
      'Não — resolvem duplicação dentro do Kafka. Para o resto da arquitetura você ainda precisa: consumer com isolation.level=read_committed, receivers externos idempotentes (event_id + dedupe table) e cuidado com retries em side effects não-transacionais',
      'Só em Kafka 0.10 e abaixo',
      'Só em clusters single-node',
    ],
    correct: 1,
    explanation: 'EOS do Kafka é uma fundação, não uma bala de prata. Sem read_committed no consumer, ele lê transações abortadas; sem idempotência no receiver externo, retries duplicam side effects. A "verdade" é: effectively-once exige cooperação de TODOS os elos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="exactly-once-2pc-deep"
      title="Exactly-once: a verdade técnica (e os limites)"
      icon="🎯"
      xp={70}
      readTime={14}
      trailName="Mensageria & Streaming"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="A mentira de marketing — e a verdade" accent={accent}>
        <p>
          &quot;Exactly-once&quot; vende cursos e gera tweets, mas o que existe na prática é &quot;effectively-once end-to-end&quot;:
          EOS dentro do broker + idempotência no receiver. Quem promete mais está vendendo abstração que vaza.
        </p>
        <Callout tone="warn">
          O teorema FLP de Fischer-Lynch-Paterson (1985) já estabeleceu o limite: em sistemas assíncronos com falhas,
          não há protocolo determinístico que resolva consenso. Exactly-once para side effects externos cai no mesmo balde.
        </Callout>
      </Section>

      <Section title="Os 3 níveis reais de garantia" accent={accent}>
        <CodeBlock lang="yaml">{`at-most-once:     fire-and-forget; perde em falha. Throughput máximo. Logs não críticos.
at-least-once:    default prático; nunca perde, duplica em retry. Exige idempotência no receiver.
exactly-once:     dentro do Kafka/Flink via 2PC. Fora deles, vira at-least-once + dedupe.`}</CodeBlock>
      </Section>

      <Section title="Two-Phase Commit no Kafka 0.11+" accent={accent}>
        <p>
          O producer idempotente garante que retries de rede não dupliquem dentro de uma partition.
          Transactions vão além: agrupam writes a múltiplas partitions + commit de offsets de consumo em UMA transação atômica.
        </p>
        <CodeBlock lang="java">{`prod.initTransactions(); // 1x no startup, faz fencing por epoch
while (running) {
  ConsumerRecords<String,String> recs = consumer.poll(Duration.ofMillis(200));
  prod.beginTransaction();
  try {
    for (ConsumerRecord<String,String> r : recs)
      prod.send(new ProducerRecord<>("out", r.key(), transform(r.value())));
    prod.sendOffsetsToTransaction(offsetsFrom(recs), consumer.groupMetadata());
    prod.commitTransaction(); // commit atômico: writes + offsets
  } catch (Exception e) { prod.abortTransaction(); }
}`}</CodeBlock>
      </Section>

      <Section title="Flink 2PC sinks: o padrão mais elegante" accent={accent}>
        <p>
          Flink integra 2PC com checkpointing Chandy-Lamport. O sink faz pre-commit ao receber o barrier de checkpoint,
          e só commita após o coordenador confirmar o checkpoint global. Em falha, restaura do último checkpoint
          e descarta pre-commits órfãos.
        </p>
        <Callout tone="info">
          KafkaSink, FileSink e JdbcSink do Flink já implementam TwoPhaseCommitSinkFunction. Para sinks customizados,
          você herda essa classe e implementa pre-commit/commit/abort.
        </Callout>
      </Section>

      <Section title="Onde o castelo cai: side effects externos" accent={accent}>
        <p>
          Chamou Stripe API, enviou push notification, gravou em DynamoDB fora da transação Kafka? Não há 2PC.
          O receiver precisa ser idempotente. Padrão Stripe: idempotency-key no header, dedupe table do lado server.
        </p>
        <Callout tone="success" icon="🎯">
          A regra é: EOS resolve dentro do broker; do broker para fora, o receiver decide. Tratar isso como problema
          do receiver (não do producer) é o mindset correto.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
