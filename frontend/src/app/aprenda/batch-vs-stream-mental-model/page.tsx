import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, ComparisonTable } from '@/components/article/primitives';

export const metadata = getModuleMetadata('batch-vs-stream-mental-model');

const accent = '#10b981';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença fundamental entre batch e stream?',
    options: [
      'Volume apenas',
      'Modelo de tempo: batch processa BOUNDED datasets em rodadas (ETL diário, hourly); stream processa UNBOUNDED stream contínuo com latency baixa (ms-segundos). Trade-off: batch simpler + recovery mais fácil; stream real-time + complexity operacional',
      'Stream é mais moderno',
      'Batch é deprecated',
    ],
    correct: 1,
    explanation: 'Batch: "processa todos os dados de ontem". Stream: "processa cada event conforme chega". Latency: batch em minutos/horas, stream em ms. Complexidade: batch 10x mais fácil (replay, test, debug). Só use stream quando negócio EXIGE real-time (fraud detection, pricing dinâmico).',
  },
  {
    question: 'O que é Lambda architecture (não confundir com AWS Lambda)?',
    options: [
      'AWS service',
      'Pattern (Nathan Marz, 2011): batch layer pra accuracy + speed layer pra real-time recent; serving layer combina. Complexo (mantém 2 codebases). Kappa (Jay Kreps, 2014) simplifica: só stream, replay histórico quando precisa',
      'Só teoria',
      'Deprecated',
    ],
    correct: 1,
    explanation: 'Lambda: resolvia problema de "stream recente + batch exato" com complexidade gigante. Kappa simplificou — stream processa tudo, replay do início pra reprocessar. Em 2026 com Kafka + Flink + Iceberg, Kappa é mais comum. Lambda sobrevive em legacy.',
  },
  {
    question: 'Qual cenário JUSTIFICA stream processing?',
    options: [
      'Report mensal',
      'Fraud detection (block transação em ms), real-time personalization, IoT sensor processing, inventory real-time, alerting em security events. Quando latency &lt; 1s é requisito DE NEGÓCIO, não nice-to-have',
      'ETL noturno',
      'Qualquer pipeline',
    ],
    correct: 1,
    explanation: 'Batch resolve 80% dos casos. Stream só quando business value depende de latency sub-segundo. Se "dados de ontem" é OK, batch é mais barato + simples. Stream tem custo operacional real (schema evolution, ordering, exactly-once, monitoring).',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="batch-vs-stream-mental-model"
      title="Batch vs stream: mental model e trade-offs reais"
      icon="⏱️"
      xp={50}
      readTime={12}
      trailName="Data Engineering Moderna"
      trailColor={accent}
      nextSlug="dbt-transformacao-como-codigo"
      nextTitle="dbt: transformação como código, testável"
      quiz={quiz}
    >
      <Section title="Comparação" accent={accent}>
        <ComparisonTable
          accent={accent}
          headers={['Aspecto', 'Batch', 'Stream']}
          rows={[
            ['Dataset', 'Bounded (conhecido)', 'Unbounded (contínuo)'],
            ['Latency', 'Minutos-horas', 'Milissegundos-segundos'],
            ['Ferramenta', 'Spark, dbt, DuckDB', 'Kafka Streams, Flink, Kinesis'],
            ['Accuracy', 'Total', 'Approximate (late data, windowing)'],
            ['Debug', 'Fácil (replay determinístico)', 'Difícil (state, ordering)'],
            ['Custo', 'Baixo (compute on-demand)', 'Alto (sempre rodando)'],
            ['Failure recovery', 'Rerun', 'Complexo (state checkpointing)'],
          ]}
        />
      </Section>

      <Section title="Quando escolher stream" accent={accent}>
        <Callout tone="info" icon="💡">
          Regra: latency real-time é REQUIREMENT do produto? Sim → stream. Não → batch. Não confunda &quot;interessante&quot; com &quot;necessário&quot;. Stream é 10x mais caro operar. Justifique.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
