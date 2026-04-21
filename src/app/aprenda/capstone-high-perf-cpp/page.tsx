import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-high-perf-cpp');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual evidência demonstra competência em C++ moderno no capstone?',
    options: [
      'Linhas de código',
      'Zero new/delete explícitos; RAII em toda aquisição de recurso; concepts restringindo templates; ranges em pipelines; sanitizers limpos no CI; benchmark reprodutível comparando contra baseline reconhecido; README com trade-offs declarados',
      'Só funcionar',
      'C++11 clássico',
    ],
    correct: 1,
    explanation: 'Sênior C++ em 2026 demonstra domínio de idiomas modernos e rigor operacional. Novos projetos em C++11-style com new/delete e iteradores brutos sinalizam falta de atualização. Sanitizers + benchmarks são provas objetivas; trade-offs documentados mostram thinking além de implementação.',
  },
  {
    question: 'Como estruturar benchmark honesto de parser JSON?',
    options: [
      'Só cronometrar main',
      'Google Benchmark: fixture com arquivo real (>= 1MB), aquecer cache (>= 3 runs warm-up), medir steady state (100+ iterations), comparar contra simdjson/nlohmann/rapidjson na mesma máquina. Reportar p50/p95 + desvio',
      'Cronometrar 1x',
      'Usar Date.now',
    ],
    correct: 1,
    explanation: 'Microbenchmark precisa controlar variáveis: mesma máquina, mesma entrada, warm-up para cache/branch predictor, múltiplas iterações para reduzir jitter. Google Benchmark automatiza. Comparar contra referências estabelecidas (simdjson é benchmark reference para JSON) dá sinal honesto — nunca só "meu código roda em X ms".',
  },
  {
    question: 'Qual a armadilha mais comum em thread pool feito do zero?',
    options: [
      'Não tem',
      'Locks largos em fila global: workers disputam o mesmo mutex e serializam. Fixes: work-stealing por worker, lock-free queue (moodycamel), ou múltiplas filas com sharding. Também: shutdown racing com submit em flight',
      'Usar std::thread',
      'Mutex',
    ],
    correct: 1,
    explanation: 'Thread pool ingênuo tem 1 mutex + cond var em fila central. 16 workers disputam = contenção. Padrões reais: work-stealing deques (TBB, taskflow), ou MPMC lock-free (moodycamel::ConcurrentQueue). Shutdown: drain + join bem definido evita use-after-free. Benchmark sob TSan detecta races escondidos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-high-perf-cpp"
      title="Capstone: utility high-perf em C++ moderno"
      icon="🏁"
      xp={90}
      readTime={20}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="Missão" accent={accent}>
        <p>
          Escolha um projeto self-contained com métrica de performance clara. Entregue repo polido, build CMake portátil, benchmark reprodutível e análise de trade-offs.
        </p>
      </Section>

      <Section title="Opção A: parser JSON otimizado" accent={accent}>
        <CodeBlock lang="cpp">{`// API proposta
namespace myjson {
    struct Value;   // variant: null, bool, number, string, array, object

    std::expected<Value, ParseError> parse(std::string_view input);
    std::string serialize(const Value& v);
}`}</CodeBlock>
        <p>
          Implemente parser recursive-descent com zero-copy sobre string_view quando possível. Benchmark contra <code>nlohmann::json</code> (referência popular) e <code>simdjson</code> (state-of-the-art). Documente onde você perde e por quê — honestidade vale.
        </p>
      </Section>

      <Section title="Opção B: thread pool" accent={accent}>
        <CodeBlock lang="cpp">{`class ThreadPool {
public:
    explicit ThreadPool(size_t threads);
    ~ThreadPool();   // join + drain

    template <typename F, typename... Args>
    auto submit(F&& f, Args&&... args)
        -> std::future<std::invoke_result_t<F, Args...>>;

    void shutdown();   // opcional: explicit
};`}</CodeBlock>
        <p>
          Versões: (1) MPMC simples com <code>std::mutex</code> + <code>condition_variable</code>. (2) Work-stealing com deque por worker. Benchmark de <code>fib(30)</code> paralelizado — work-stealing deve vencer contenção.
        </p>
      </Section>

      <Section title="Opção C: embedded KV store" accent={accent}>
        <p>
          Mapa persistente append-only em arquivo binário, com index em memória (hash map). API: <code>put(k,v)</code>, <code>get(k)</code>, <code>del(k)</code>, <code>compact()</code>. Inspiração: Bitcask. Foco: durabilidade (fsync), recuperação em crash, throughput em leituras.
        </p>
      </Section>

      <Section title="Entregáveis comuns" accent={accent}>
        <CodeBlock lang="bash">{`repo/
├── CMakeLists.txt          # C++20, options: ENABLE_ASAN/UBSAN/TSAN
├── vcpkg.json              # deps: fmt, catch2, benchmark
├── README.md               # quickstart, API, benchmarks, trade-offs
├── docs/design.md          # arquitetura, decisões
├── include/mylib/*.hpp     # API pública (modules opcional)
├── src/*.cpp
├── tests/                  # catch2 ou gtest
├── bench/                  # Google Benchmark
└── .github/workflows/ci.yml</code>`}</CodeBlock>
      </Section>

      <Section title="CMake baseline" accent={accent}>
        <CodeBlock lang="cmake">{`cmake_minimum_required(VERSION 3.24)
project(capstone CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

find_package(fmt CONFIG REQUIRED)
find_package(Catch2 3 CONFIG REQUIRED)
find_package(benchmark CONFIG REQUIRED)

add_library(mylib src/parser.cpp src/tree.cpp)
target_include_directories(mylib PUBLIC include)
target_link_libraries(mylib PUBLIC fmt::fmt)
target_compile_options(mylib PRIVATE
    -Wall -Wextra -Wpedantic -Werror)

add_subdirectory(tests)
add_subdirectory(bench)`}</CodeBlock>
      </Section>

      <Section title="Relatório de benchmark" accent={accent}>
        <CodeBlock lang="bash">{`# Exemplo de saída honesta no README

Benchmarks (Ryzen 7 7700X, GCC 14, -O3 -march=native):

parse_citm_catalog (1.7MB JSON)
  myjson:       12.3 ms  (1.0x baseline)
  nlohmann:     28.7 ms  (2.3x slower)
  simdjson:      1.2 ms  (0.10x, 10x faster)

Análise: nossa implementação supera nlohmann por zero-copy em strings,
mas fica 10x atrás de simdjson que usa SIMD + lazy parsing. Trade-off
consciente: priorizamos simplicidade (sub-1000 LOC) sobre perf máxima.`}</CodeBlock>
      </Section>

      <Section title="Checklist final" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) CI verde em ASan/UBSan/TSan. (2) clang-tidy zero warning. (3) Cobertura de testes &gt; 80% nas APIs públicas. (4) README com benchmarks reproduzíveis (<code>cmake --build build --target bench &amp;&amp; ./build/bench</code>). (5) design.md explicando escolhas. (6) Tag v0.1.0. (7) Demo executável em &lt;30s de setup.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
