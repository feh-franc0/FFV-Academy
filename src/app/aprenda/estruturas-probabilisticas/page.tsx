import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode } from '@/components/article/primitives';

export const metadata = getModuleMetadata('estruturas-probabilisticas');

const accent = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'O que Bloom filter garante e o que NÃO garante?',
    options: [
      'Garante true/false sempre correto',
      'Garante: se retorna "NÃO contém", é 100% correto. NÃO garante: se retorna "contém", pode ser FALSO POSITIVO (prob. configurável). Nunca falso negativo',
      'Funciona só com strings',
      'É mais lento que hashmap',
    ],
    correct: 1,
    explanation: 'Bloom armazena só k bits por elemento (k hash functions). Pra checar: se QUALQUER bit é 0, nunca foi adicionado (seguro). Se todos 1, PODE ter sido adicionado (falso pos possível). Uso: cache miss check ("não está no cache, nem procure"), dedup em stream.',
  },
  {
    question: 'Quanto espaço HyperLogLog usa pra contar ~1 bilhão de elementos únicos com ~2% erro?',
    options: [
      '1 GB',
      '~1.5 KB — cardinalidade com precisão relativa ~2% usa apenas ~12KB independente do número real de elementos distintos',
      '1 MB',
      '100 MB',
    ],
    correct: 1,
    explanation: 'HLL mantém M "registers" (geralmente 2^14 = 16384). Cada register guarda leading zeros do hash. Magic: pra contar 1B uniques vs 1M uniques, usa o mesmo 12KB. Redis implementa PFCOUNT, PFADD com ~12KB por key.',
  },
  {
    question: 'Quando Count-Min sketch é a solução certa?',
    options: [
      'Sempre que quer contar',
      'Contagem APROXIMADA de FREQUÊNCIAS em stream de alto volume (qual termo aparece mais? top-K queries?) com memória muito menor que hashmap — trade-off: superestima um pouco',
      'Contagem exata',
      'Pra ordenar elementos',
    ],
    correct: 1,
    explanation: 'Count-Min: matriz de contadores, k hash functions. Add incrementa k posições; query retorna mínimo. Superestima nunca subestima. Uso: anomaly detection em stream de logs, top-K trending. Tamanho fixo independente de volume.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="estruturas-probabilisticas"
      title="Bloom, HyperLogLog, Count-Min: estruturas probabilísticas"
      icon="🎲"
      xp={55}
      readTime={13}
      trailName="Estruturas de Dados & Algoritmos"
      trailColor={accent}
      nextSlug="capstone-resolver-5-problemas-reais"
      nextTitle="Capstone: resolver 5 problemas reais (não-LeetCode)"
      quiz={quiz}
    >
      <Section title="Por que aceitar imprecisão?" accent={accent}>
        <p>
          Em escala de bilhões, guardar tudo exato é impraticável. Bloom/HLL/CMS trocam precisão por <strong>memória constante</strong>. Em observability/analytics/streaming, 1-2% de erro é invisível mas 100x economia de recurso é crítica.
        </p>
      </Section>

      <Section title="Bloom filter em TS" accent={accent}>
        <CodeBlock lang="typescript">{`import { BloomFilter } from 'bloom-filters';

// n expected elements, ~1% false positive rate
const filter = new BloomFilter(100_000, 0.01);

filter.add('user:123');
filter.add('user:456');

filter.has('user:123');  // true (correto)
filter.has('user:999');  // false (definitivo) OU true (falso positivo raro)

// Caso real: antes de checar DB "item existe?", pergunta Bloom
// Se Bloom diz NÃO → skip DB call (100% confiança)
// Se Bloom diz SIM → confirma no DB (raro falso positivo)`}</CodeBlock>
        <p>
          Postgres, Google Bigtable, Cassandra — todos usam Bloom pra evitar leituras desnecessárias de disco.
        </p>
      </Section>

      <Section title="HyperLogLog — unique visitors" accent={accent}>
        <CodeBlock lang="typescript">{`// Redis PFADD / PFCOUNT
import Redis from 'ioredis';
const r = new Redis();

// Adicionar visitors do dia
await r.pfadd('visits:2026-04-20', 'user:123', 'user:456', ...);

// Contagem aproximada (±2% erro)
const uniqueVisitors = await r.pfcount('visits:2026-04-20');

// Merge: uniques da semana a partir dos dias
await r.pfmerge('visits:week', ...dailyKeys);`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Cada chave HLL no Redis ocupa ~12KB. 10M páginas únicas com HLL = 120GB apenas de cardinalidade exata; com HLL, &lt; 1GB.
        </Callout>
      </Section>

      <Section title="Count-Min em detecção de anomalia" accent={accent}>
        <CodeBlock lang="typescript">{`import { CountMinSketch } from 'bloom-filters';

const cms = new CountMinSketch(2000, 7);  // width × depth

// Stream de logs com client IP
for await (const log of logStream) {
  cms.update(log.ip);
}

// Top suspects
for (const ip of suspiciousCandidates) {
  const count = cms.count(ip);
  if (count > THRESHOLD) alert(ip);
}

// Tamanho fixo 2000 × 7 × 4 bytes = 56KB
// Não importa se stream tem 1M ou 1B de entradas`}</CodeBlock>
      </Section>

      <Section title="Quando usar estrutura exata" accent={accent}>
        <ul className="list-disc pl-5 my-3 text-sm space-y-1">
          <li>Volume pequeno (&lt; 1M) — hashmap/Set é trivial.</li>
          <li>Aplicação legal/financeira onde 1% de erro não pode existir.</li>
          <li>Quando memória não é constraint.</li>
        </ul>
        <p>
          Em data analytics moderna (Snowflake APPROX_COUNT_DISTINCT, Redis PFCOUNT, Elasticsearch cardinality agg), as estruturas probabilísticas são o default.
        </p>
      </Section>
    </ModuleLayout>
  );
}
