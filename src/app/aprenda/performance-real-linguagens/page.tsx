import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('performance-real-linguagens');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que techempower é útil mas limitado?',
    options: [
      'É inútil',
      'Mede caso sintético de framework HTTP (plaintext, JSON, DB query) em hardware controlado — bom para sanity check, ruim para extrapolar comportamento de app real com cache, ORM, negócio e 100 deps',
      'Só mede CPU',
      'Não roda',
    ],
    correct: 1,
    explanation: 'Techempower dá ordem de grandeza: "framework X entrega 500k rps em plaintext" sinaliza runtime competente. Mas seu serviço real não faz plaintext em loop — faz autenticação, chamada a outro serviço, transação DB e lógica de negócio. O ranking não prediz sua latência em produção.',
  },
  {
    question: 'Qual a ordem de magnitude em CPU-bound entre C++, Java e Python?',
    options: [
      'Todas iguais',
      'C++/Rust ~1x baseline, Java/C# 1–2x após warmup JIT, Go 1.5–2x, JS/TS 2–5x (V8), Python 20–50x em pure-Python (sem numpy) — essas são ordens de grandeza em hot loop puro',
      'Python é mais rápido',
      'Java é 100x mais lento',
    ],
    correct: 1,
    explanation: 'Em CPU-bound puro (loop com aritmética), a hierarquia é estável há uma década: C++/Rust definem 1x, Java com C2 e C# com RyuJIT chegam em 1–2x em steady state, Go fica 1.5–2x (GC e compilador menos agressivo), JS ~3x, Python puro 20–50x. Mas I/O-bound nivela quase tudo — rede domina.',
  },
  {
    question: 'O que empurra Python/JS para serem "lentos" em CPU e "rápidos" em prática?',
    options: [
      'Magia',
      'Extensions nativas (numpy, torch, V8 optimizations, sharp/pillow) delegam hot path para C/Rust — Python puro é lento, mas a maior parte do ecosystem importante já chama código nativo por baixo',
      'Compilação AOT',
      'GPU apenas',
    ],
    correct: 1,
    explanation: 'numpy.dot roda LAPACK em C/Fortran. PyTorch chama CUDA. Node.js usa V8 (C++), sharp usa libvips (C). Python/JS são cola de orquestração — o trabalho pesado não é em Python. Por isso ML em Python empata com C++ em benchmark de matriz: o trabalho está em BLAS, não em loop Python.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="performance-real-linguagens"
      title="Performance real: benchmarks honestos"
      icon="⚡"
      xp={55}
      readTime={13}
      trailName="Comparação de Linguagens: Escolha Certa"
      trailColor={accent}
      nextSlug="ecosystem-maturity"
      nextTitle="Ecosystem maturity: libraries, tooling, community"
      quiz={quiz}
    >
      <Section title="Cuidado com ranking sem contexto" accent={accent}>
        <p>
          "Rust é 10x mais rápido que Go" é uma frase sem sentido sozinha. Rápido em quê? Workload CPU-bound? I/O-bound? Startup? Steady state? Cada resposta é diferente. O único benchmark que importa é o seu caso de uso no seu hardware com sua lógica.
        </p>
      </Section>

      <Section title="Dimensões reais de performance" accent={accent}>
        <CodeBlock lang="bash">{`1. CPU-bound em hot loop       → C/C++/Rust > Java/C# > Go > JS > Python
2. I/O-bound latência p99       → quase empatam (rede e disco dominam)
3. Startup time                 → Go/Rust binário > Java nativo > C# > Java JIT > Python
4. Memória footprint            → C/Rust > Go > Java/C# > Python/Node
5. Throughput concorrente       → Go/Java 21/Erlang > Node async > Python thread
6. Tempo até "hello world"      → Python > Node > Ruby > Go > Java > C#`}</CodeBlock>
      </Section>

      <Section title="Techempower como sanity check" accent={accent}>
        <p>
          Útil para ver se um framework é competente (top 20 em composite), para filtrar opções ridículas, e para entender ordem de grandeza. Inútil para predizer sua latência real em produção, que depende 80% do seu código e das suas dependências externas.
        </p>
      </Section>

      <Section title="CPU-bound: ordem de grandeza" accent={accent}>
        <CodeBlock lang="rust">{`// Fibonacci recursivo puro, n=40, ordem de grandeza em laptop moderno 2025
Rust  / C++ : 0.3–0.5 s   (baseline 1x)
Java  / C#  : 0.5–0.9 s   (~1.5x após warmup)
Go          : 0.6–1.0 s   (~2x)
Node (V8)   : 1.2–2.0 s   (~3x)
Python puro : 25–40 s     (~60x)
PyPy        : 1–2 s       (~3x — JIT da Python)`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Python puro perde feio em CPU loop. Por isso workload intensivo em Python chama C (numpy, torch, polars). O ecosystem absorveu o problema.
        </Callout>
      </Section>

      <Section title="I/O-bound: tudo empata" accent={accent}>
        <CodeBlock lang="bash">{`# Endpoint HTTP simples fazendo 1 query Postgres:
# Todas as opções top entregam < 5 ms de p50 em hardware moderno
# A diferença entre Node e Java é < 1 ms
# O gargalo é o banco, não a linguagem

# O que importa em I/O-bound:
# - Connection pool dimensionado
# - Query otimizada (índices, plan)
# - Network round trip
# - TLS overhead
# A linguagem explica < 10% da variância.`}</CodeBlock>
      </Section>

      <Section title="Startup e memória (importante em serverless)" accent={accent}>
        <CodeBlock lang="bash">{`                        Cold start    RAM idle
Go binário              ~20 ms         10–20 MB
Rust binário            ~20 ms         5–15 MB
Java GraalVM nativo     ~50 ms         40–80 MB
Java tradicional        ~1–3 s         150–300 MB
C# AOT                  ~60 ms         30–60 MB
Node                    ~200 ms        35–60 MB
Python                  ~150 ms        20–40 MB`}</CodeBlock>
      </Section>

      <Section title="Regra de decisão honesta" accent={accent}>
        <Callout tone="success" icon="✅">
          Se 80% do seu tempo é I/O, diferença entre Node, Go e Java é marginal — escolha pelo ecosystem e pelo time. Se há hot path CPU-bound real, meça antes: muitas vezes otimizar a query ou cachear resolve mais do que trocar de linguagem. Reescrita por perf só vence quando você tem perfil mostrando a linguagem como gargalo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
