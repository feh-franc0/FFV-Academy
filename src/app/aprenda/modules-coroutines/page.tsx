import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('modules-coroutines');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que modules C++20 melhoram tempo de build vs #include?',
    options: [
      'Só sintaxe',
      'Compilam apenas uma vez e são importados como interface pré-processada — sem re-parse de headers em cada TU. Em projeto grande, 2-10x speedup. Além disso encapsulam: `export` explícito em vez de vazar #define/macros',
      'Mais pequenos',
      'Multi-thread',
    ],
    correct: 1,
    explanation: 'Header é reprocessado integralmente em cada TU que o inclui — <string> tem ~30k linhas após preprocessamento. Module é compilado uma vez em BMI (binary module interface) e reimportado como símbolo. Além disso: macros não vazam, só o que está export. MSVC/Clang/GCC têm suporte estável em 2024+.',
  },
  {
    question: 'O que distingue coroutine de thread?',
    options: [
      'Nada',
      'Coroutine é stackless, cooperativa: co_await suspende a execução sem bloquear thread e retoma quando evento chega. Uma thread pode multiplexar milhares de coroutines. Thread é preemptiva pelo SO, cada uma consome ~1MB stack',
      'Mais rápida sempre',
      'Só em Windows',
    ],
    correct: 1,
    explanation: 'Coroutine cabe em ~100 bytes de heap, sem stack separada. Usada em servidores high-throughput (net services, game engines). Thread de SO tem custo alto para criar e mudar contexto. Modelo assíncrono com syntax direta (co_await future) em vez de cadeias de callback — código parece síncrono, roda assíncrono.',
  },
  {
    question: 'Por que C++20 coroutines não têm biblioteca padrão de task/generator?',
    options: [
      'Esquecimento',
      'Comitê especificou apenas o mecanismo de linguagem (promise_type, awaiter, co_await/co_yield/co_return). A biblioteca (tipos Task, Generator, Scheduler) virá em C++26. Enquanto isso: cppcoro, libunifex, Boost.Cobalt, ou implementar promise_type próprio',
      'Não funciona',
      'Só em embedded',
    ],
    correct: 1,
    explanation: 'C++20 pavimentou a base. Task/Generator genéricos exigem política (executor, allocator, cancellation) que o comitê quis iterar antes. std::generator chegou em C++23. Task type ainda em discussão para C++26 via P2300 (sender/receiver). Projetos em produção usam cppcoro ou folly::coro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="modules-coroutines"
      title="Modules e Coroutines (C++20)"
      icon="📦"
      xp={60}
      readTime={14}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="performance-cpp"
      nextTitle="Performance C++: cache, branch, SIMD"
      quiz={quiz}
    >
      <Section title="Modules: o fim do #include eterno" accent={accent}>
        <CodeBlock lang="cpp">{`// arquivo: math.ixx (ou math.cppm)
export module math;

export int add(int a, int b) { return a + b; }

int helper() { return 42; }   // interno, não exportado`}</CodeBlock>
        <CodeBlock lang="cpp">{`// arquivo: main.cpp
import math;
import std;   // C++23: biblioteca padrão como módulo

int main() {
    std::println("{}", add(2, 3));
}`}</CodeBlock>
      </Section>

      <Section title="Benefícios reais" accent={accent}>
        <Callout tone="info" icon="💡">
          (1) Build 2-10x mais rápido em projetos grandes. (2) Macros não vazam entre módulos. (3) Ordem de includes irrelevante. (4) Ferramentas podem analisar interfaces sem reexecutar preprocessamento. Desvantagem: ecossistema ainda adaptando (clangd, bibliotecas) — em 2026 já é praticável em GCC 14, Clang 18, MSVC 17.9.
        </Callout>
      </Section>

      <Section title="Coroutines: a gramática" accent={accent}>
        <p>
          Uma função vira coroutine se contém <code>co_await</code>, <code>co_yield</code> ou <code>co_return</code>. O tipo de retorno precisa especializar <code>std::coroutine_traits</code> e fornecer <code>promise_type</code>.
        </p>
        <CodeBlock lang="cpp">{`// Generator de números pares — usando std::generator (C++23)
#include <generator>

std::generator<int> pares(int n) {
    for (int i = 0; i < n; i += 2) {
        co_yield i;
    }
}

int main() {
    for (int x : pares(10)) std::print("{} ", x);
    // 0 2 4 6 8
}`}</CodeBlock>
      </Section>

      <Section title="co_await: async sem callback" accent={accent}>
        <CodeBlock lang="cpp">{`// Pseudo-código usando lib externa (cppcoro / libunifex)
cppcoro::task<std::string> fetch(std::string url) {
    auto resp = co_await http_get(url);
    co_return resp.body;
}

cppcoro::task<int> total_bytes() {
    auto a = co_await fetch("https://a/");
    auto b = co_await fetch("https://b/");
    co_return a.size() + b.size();
}`}</CodeBlock>
        <p>
          Código parece síncrono; a runtime suspende/retoma a coroutine. Zero callbacks aninhados, zero <code>.then()</code>. Semelhante a <code>async/await</code> do C#/JS, mas zero-overhead quando inlinado.
        </p>
      </Section>

      <Section title="Promise type e customização" accent={accent}>
        <CodeBlock lang="cpp">{`template <typename T>
struct Task {
    struct promise_type {
        T value;
        Task get_return_object() { return {}; }
        std::suspend_never initial_suspend() { return {}; }
        std::suspend_always final_suspend() noexcept { return {}; }
        void return_value(T v) { value = std::move(v); }
        void unhandled_exception() { std::terminate(); }
    };
};`}</CodeBlock>
        <p>
          Você raramente escreve isso — usa biblioteca. Mas entender o contrato ajuda a debugar leaks de coroutine frame e exceptions.
        </p>
      </Section>

      <Section title="Limitações em 2026" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          (1) Alocação do coroutine frame pode ir para heap — verifique com profiler. (2) Debug de coroutines ainda é imaturo em alguns debuggers. (3) Sem biblioteca padrão completa, cada projeto escolhe cppcoro/folly/libunifex. (4) Interoperabilidade com threads precisa de executor — P2300 (sender/receiver) ainda não standard.
        </Callout>
      </Section>

      <Section title="Quando adotar" accent={accent}>
        <Callout tone="success" icon="✅">
          Modules: projeto novo, GCC 14+/Clang 18+/MSVC 17.9+, build-time é dor. Coroutines: serviço com muita I/O concorrente (HTTP server, game server, DB driver). Para lib simples ou legacy, esperar C++26 é defensável.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
