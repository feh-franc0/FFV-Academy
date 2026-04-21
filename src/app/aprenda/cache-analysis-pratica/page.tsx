import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cache-analysis-pratica');

const accent = '#eab308';

const quiz: QuizQuestion[] = [
  {
    question: 'Quais latências típicas da hierarquia de memória x86 moderna?',
    options: [
      'Tudo igual',
      'L1 ~1ns (4 ciclos), L2 ~3ns (12 ciclos), L3 ~12ns (40 ciclos), DRAM ~100ns (300+ ciclos), SSD NVMe ~100us, disco HDD ~10ms. Ordem de magnitude: cada nível é 3-10x mais lento que o anterior',
      'RAM é mais rápida que L1',
      'Cache é opcional',
    ],
    correct: 1,
    explanation: 'Números aproximados (Jeff Dean numbers, atualizados). O salto DRAM -&gt; SSD é 1000x, por isso page faults destroem latência. Entender essa hierarquia guia design: estruturas cache-friendly (struct of arrays vs array of structs), prefetch manual, alinhamento a cache line.',
  },
  {
    question: 'O que é false sharing?',
    options: [
      'Bug de compilador',
      'Duas threads modificam variáveis DIFERENTES que caem na MESMA cache line (64B). Cada write invalida a linha na outra CPU (MESI), forçando bounce via L3/memory. Performance cai 10-100x sem motivo óbvio',
      'Dois processos lendo mesmo arquivo',
      'Overhead de sync normal',
    ],
    correct: 1,
    explanation: 'Caso clássico: array de contadores por thread, counters[N] onde N = num threads. Se counters são int (4B), 16 cabem em 64B e todas as threads pingam a mesma linha. Fix: pad struct para alinhamento de 64B (alignas(64) em C++, #[repr(align(64))] em Rust, CACHELINE_PAD no kernel). Diagnostica com perf c2c.',
  },
  {
    question: 'Qual comando dá IPC, cache misses e branch mispredicts de um processo?',
    options: [
      'top',
      'perf stat — coleta contadores de hardware. IPC (instructions per cycle) mostra se CPU está stalling; cache-misses alto = working set não cabe; branch-misses alto = código com if imprevisíveis',
      'htop',
      'vmstat',
    ],
    correct: 1,
    explanation: 'perf stat -d rodando sobre seu binário revela eficiência real. IPC abaixo de 1.0 em workload CPU-bound é sinal de stalls (memory, branch). cache-misses / cache-references mostra hit rate. branch-misses / branches alto sugere reescrever hot loop com branch predictor em mente. Ferramenta #1 antes de micro-otimizar.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cache-analysis-pratica"
      title="Cache analysis: L1/L2/L3, branch prediction"
      icon="🧠"
      xp={55}
      readTime={13}
      trailName="Performance Engineering"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Por que cache domina performance moderna" accent={accent}>
        <p>
          CPU multiplicou clock ~10x desde 2000; DRAM mal dobrou de velocidade. O gap &quot;memory wall&quot; é real: acesso à DRAM custa 300+ ciclos, tempo suficiente para executar 1200 instruções em 3 IPC. Código cache-friendly ganha 10-100x sem mexer em algoritmo. Ignorar cache = deixar hardware moderno na mesa.
        </p>
        <Callout tone="info" icon="💡">
          Jeff Dean &quot;Numbers Every Programmer Should Know&quot; (2009, atualizado pela comunidade): L1 ~1ns, L2 ~3ns, L3 ~12ns, DRAM ~100ns, SSD ~100us, rede DC ~500us, cross-continent ~150ms.
        </Callout>
      </Section>

      <Section title="perf stat: o primeiro termômetro" accent={accent}>
        <p>
          perf stat -d mostra contadores de hardware — IPC, cache misses, branch mispredicts. É o primeiro passo antes de micro-otimizar.
        </p>
        <CodeBlock lang="bash">{`# Rodar binário sob perf stat
perf stat -d ./meu_app

# Saída típica:
#    12,345,678,901      cycles
#     8,234,567,890      instructions              #  0.67 IPC   &lt;- baixo, stalls
#       234,567,890      cache-references
#        45,678,901      cache-misses              # 19.5% miss rate &lt;- alto
#     2,345,678,901      branches
#       123,456,789      branch-misses             #  5.3% miss rate &lt;- revisar

# Mais detalhe por cache level
perf stat -e L1-dcache-loads,L1-dcache-load-misses,LLC-loads,LLC-load-misses ./meu_app

# Top-down analysis (Intel): classifica stalls em frontend/backend/bad-spec/retiring
perf stat -M TopdownL1 ./meu_app`}</CodeBlock>
      </Section>

      <Section title="Cache lines e false sharing" accent={accent}>
        <p>
          Cache line x86 = 64 bytes. Todo acesso traz 64B juntos. Duas threads escrevendo em variáveis próximas pagam ping-pong MESI mesmo sem compartilhar dado. Diagnóstico via perf c2c.
        </p>
        <CodeBlock lang="c">{`// RUIM: false sharing entre threads
struct Counters {
    long t0; long t1; long t2; long t3;  // 4 longs = 32B, cabem na mesma linha
};
// cada thread incrementa seu counter, mas invalida linha das outras

// BOM: pad para 64B
#include &lt;stdalign.h&gt;
struct CountersPadded {
    alignas(64) long t0;
    alignas(64) long t1;
    alignas(64) long t2;
    alignas(64) long t3;
};

// Diagnóstico com perf c2c
// $ sudo perf c2c record ./meu_app
// $ sudo perf c2c report
// Mostra HITM (Hit Modified in other cache) — assinatura de false sharing.`}</CodeBlock>
      </Section>

      <Section title="Layout de dado: AoS vs SoA" accent={accent}>
        <p>
          Array of Structs (AoS) é natural para OO mas ruim quando loop só lê um campo. Struct of Arrays (SoA) lê só o necessário, maximizando cache line utility.
        </p>
        <CodeBlock lang="rust">{`// AoS — ruim para loop que só lê idade
struct Pessoa { nome: String, idade: u32, email: String }
let v: Vec&lt;Pessoa&gt; = ...;
let soma: u32 = v.iter().map(|p| p.idade).sum();  // cada load traz struct inteira

// SoA — cada campo em seu vetor, cache-friendly
struct Pessoas {
    nomes: Vec&lt;String&gt;,
    idades: Vec&lt;u32&gt;,
    emails: Vec&lt;String&gt;,
}
let soma: u32 = pessoas.idades.iter().sum();  // streaming de u32 puro`}</CodeBlock>
      </Section>

      <Section title="Branch prediction e código sem ramo" accent={accent}>
        <p>
          Branch predictor moderno acerta ~95%, mas o 5% custa 15-20 ciclos por miss. Em loop hot com if imprevisível, vale reescrever branchless (cmov, SIMD mask).
        </p>
        <CodeBlock lang="c">{`// Código ramificado — predictor sofre com dado aleatório
int count = 0;
for (int i = 0; i &lt; n; i++) {
    if (a[i] &gt; 128) count++;     // miss se dado é unpredictable
}

// Branchless equivalente
int count = 0;
for (int i = 0; i &lt; n; i++) {
    count += (a[i] &gt; 128);       // compilador emite cmov/setcc, sem branch
}

// Clássico: ordenar array antes do loop melhora 4-6x (predictor acerta todas)
// Stack Overflow famoso: "Why is it faster to process a sorted array than unsorted?"`}</CodeBlock>
      </Section>

      <Section title="Prefetching manual (quando vale)" accent={accent}>
        <p>
          Hardware prefetcher já pega padrões sequenciais. Prefetch manual ajuda em travessia de estrutura ponteirada (linked list, tree) onde endereço próximo não é sequencial.
        </p>
        <CodeBlock lang="c">{`// Travessia de linked list com prefetch do próximo nó
for (Node *n = head; n != NULL; n = n-&gt;next) {
    __builtin_prefetch(n-&gt;next, 0, 0);  // hint: próximo nó em breve
    process(n-&gt;data);
}
// Pode dar 20-40% em workload dominated por pointer chasing.`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Prefetch errado piora: polui cache e gasta bandwidth. Meça antes/depois com perf stat. Se hit rate de L1 já estava alto, prefetch manual não ajuda.
        </Callout>
      </Section>

      <Section title="Referências" accent={accent}>
        <p>
          &quot;What Every Programmer Should Know About Memory&quot; (Ulrich Drepper, 2007) continua canônico. &quot;Algorithms for Modern Hardware&quot; (Sergey Slotin) é o update moderno. Intel Architecture Optimization Reference Manual para detalhes x86. &quot;Hennessy &amp; Patterson&quot; para fundamentos.
        </p>
      </Section>
    </ModuleLayout>
  );
}
