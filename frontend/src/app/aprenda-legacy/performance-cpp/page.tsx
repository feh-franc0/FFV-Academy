import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('performance-cpp');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que SoA (struct of arrays) frequentemente supera AoS (array of structs) em hot loops?',
    options: [
      'Só estética',
      'Cache locality: quando o loop itera só em um campo, SoA coloca esses valores contíguos (linha de cache densa). AoS intercala outros campos, desperdiçando banda. Também habilita vetorização SIMD automática. Trade-off: APIs ficam mais verbosas',
      'Sempre mais rápido',
      'Só em GPU',
    ],
    correct: 1,
    explanation: 'CPU lê 64 bytes por miss de cache. Se seu loop soma só .x de vec3, AoS traz x,y,z,x,y,z... e 2/3 da banda é desperdício. SoA traz só xs contíguos → prefetch eficiente, unrolling natural, compilador emite SIMD. Padrão em game engines e ML. Custo: APIs menos diretas, refactor não trivial.',
  },
  {
    question: 'Como `constexpr` ajuda performance?',
    options: [
      'Só compilação',
      'Força/permite avaliação em tempo de compilação. Constantes e lookup tables ficam inlinadas com zero custo runtime. `if constexpr` elimina branches. C++23 amplia: if consteval, constexpr containers, constexpr cmath',
      'Nada',
      'Só em templates',
    ],
    correct: 1,
    explanation: 'constexpr int table[] = {...}; viaja no binário pronto. Funções constexpr avaliadas em tempo de compile para argumentos conhecidos. Combinado com if constexpr em templates, elimina dead code. C++20/23 expandiu radicalmente — std::vector agora pode ser constexpr. Menos runtime, mais compilador trabalhando.',
  },
  {
    question: 'O que é branch prediction e como escrever código que coopera?',
    options: [
      'Nada útil',
      'CPU especula o caminho do if com base em histórico; acerto = pipeline cheio, erro = flush caro (~15 cycles). Padrões previsíveis (ordenação por chave antes do loop) melhoram hit. [[likely]]/[[unlikely]] (C++20) hinta mas raramente supera o heurístico do branch predictor',
      'Só em JIT',
      'Obsoleto',
    ],
    correct: 1,
    explanation: 'Famoso benchmark "ordenar antes do loop melhora 3x" vem de branch prediction — loop com 50/50 de if deseja eliminar imprevisibilidade. Ordenar agrupa "true, true, ..., false, false" e o predictor acerta quase sempre. [[likely]] só ajuda em paths realmente enviesados (error handling). profiler-driven optimization (PGO) bate hint manual.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="performance-cpp"
      title="Performance C++: cache, branch, SIMD"
      icon="⚡"
      xp={60}
      readTime={14}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="cpp-best-practices-moderno"
      nextTitle="C++ best practices: Core Guidelines + tools"
      quiz={quiz}
    >
      <Section title="Mentalidade" accent={accent}>
        <Callout tone="info" icon="💡">
          Otimização sem profile é chute. Primeira regra: medir (perf, Intel VTune, Tracy, flamegraph). Só gaste engenharia onde profile aponta. Premature optimization destrói legibilidade e quase nunca ganha o que se esperava.
        </Callout>
      </Section>

      <Section title="Cache locality" accent={accent}>
        <p>
          CPU moderna tem L1 (~32KB, ~1ns), L2 (~1MB, ~4ns), L3 (~30MB, ~12ns), RAM (~100ns). Um cache miss custa ~100 instruções perdidas. Otimizar locality é geralmente o maior ganho.
        </p>
        <CodeBlock lang="cpp">{`// AoS — pode desperdiçar banda em hot loops
struct Particle { float x, y, z, vx, vy, vz, mass; };
std::vector<Particle> particles;

// SoA — cada campo contíguo, cache-friendly
struct Particles {
    std::vector<float> x, y, z, vx, vy, vz, mass;
};`}</CodeBlock>
      </Section>

      <Section title="constexpr e compile-time" accent={accent}>
        <CodeBlock lang="cpp">{`constexpr int fib(int n) {
    return n < 2 ? n : fib(n-1) + fib(n-2);
}

constexpr int F20 = fib(20);   // avaliado em compile-time

template <int N>
void process() {
    if constexpr (N > 100) { /* branch A removida em compile */ }
    else                   { /* branch B removida em compile */ }
}`}</CodeBlock>
      </Section>

      <Section title="SIMD: vetorização real" accent={accent}>
        <p>
          Instruções vetoriais (SSE, AVX, AVX-512) operam em 4/8/16 floats simultâneos. Compilador moderno auto-vetoriza loops simples; para controle fino, use intrinsics ou <code>std::experimental::simd</code>.
        </p>
        <CodeBlock lang="cpp">{`#include <immintrin.h>

// soma 8 floats por iteração com AVX
void add_vec(const float* a, const float* b, float* out, size_t n) {
    size_t i = 0;
    for (; i + 8 <= n; i += 8) {
        __m256 va = _mm256_loadu_ps(a + i);
        __m256 vb = _mm256_loadu_ps(b + i);
        _mm256_storeu_ps(out + i, _mm256_add_ps(va, vb));
    }
    for (; i < n; i++) out[i] = a[i] + b[i];   // tail
}`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Antes de escrever intrinsics, teste se <code>-O3 -march=native</code> já vetoriza. Verifique com <code>-fopt-info-vec</code> (GCC) ou em godbolt.org. Intrinsics quebram portabilidade e devem ser último recurso.
        </Callout>
      </Section>

      <Section title="Branch prediction" accent={accent}>
        <CodeBlock lang="cpp">{`// Dica semântica em C++20
if (err) [[unlikely]] { log_error(err); return; }
if (valid) [[likely]] { process(); }`}</CodeBlock>
        <p>
          Use com parcimônia — apenas em paths fortemente enviesados. PGO (profile-guided optimization) supera hints manuais.
        </p>
      </Section>

      <Section title="Profiling em prática" accent={accent}>
        <CodeBlock lang="bash">{`# Linux perf
perf record -g ./app
perf report

# flamegraph
perf record -F 99 -g ./app
perf script | ~/FlameGraph/stackcollapse-perf.pl | ~/FlameGraph/flamegraph.pl > fg.svg

# Google Benchmark para microbenchmark
g++ -std=c++20 -O2 bench.cpp -lbenchmark -lpthread
./a.out`}</CodeBlock>
      </Section>

      <Section title="Regras pragmáticas" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) Meça primeiro. (2) Cache locality vence branch optimization. (3) SIMD só quando profile mostra CPU-bound. (4) constexpr em constantes sempre. (5) <code>-O2 -march=native -flto</code> + PGO é baseline para release.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
