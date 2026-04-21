import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cpp-historia-compilador-diferencial');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'O que Bjarne Stroustrup quis dizer com "zero-overhead abstractions" e por que isso diferencia C++?',
    options: [
      'Que C++ é grátis de usar',
      'Que você não paga pelo que não usa e, o que você usa, não poderia ser escrito à mão de forma mais eficiente. Templates, RAII, smart pointers, lambdas e ranges compilam para o mesmo assembly que o equivalente manual em C — a abstração some em tempo de compilação',
      'Que não existe overhead em nenhuma linguagem moderna',
      'Que o compilador remove todo código não utilizado automaticamente',
    ],
    correct: 1,
    explanation: 'Zero-overhead é o princípio que C++ herdou de C e levou adiante: features de alto nível (templates, destrutores, std::unique_ptr) existem, mas têm custo apenas em compile-time. Um std::sort monomorfizado com lambda compila para código tão rápido quanto um qsort escrito à mão — e frequentemente mais rápido, porque o compilador inlina o comparador. É o que permite C++ continuar em games, HFT e engines de navegador.',
  },
  {
    question: 'Como o pipeline de compilação de C++ difere do de C?',
    options: [
      'Não difere em nada',
      'A estrutura (pré-processador → compilador → assembler → linker) é a mesma, mas cada etapa é mais pesada: templates exigem monomorfização antes de gerar código, name mangling codifica tipos no símbolo para overloading, e o linker precisa lidar com inline/template instantiations duplicadas e vtables. C++20 modules quebram com o modelo de #include para acelerar a compilação',
      'C++ interpreta o código como Python',
      'C++ gera bytecode para uma VM própria',
    ],
    correct: 1,
    explanation: 'A cadeia é a mesma, mas o tempo de compilação em C++ é notoriamente alto por três razões: preâmbulos gigantescos via #include (solução: precompiled headers, agora modules), monomorfização de templates (cada instanciação gera código), e name mangling por overloading/namespaces. Por isso o movimento de C++20 com modules é estruturalmente importante — muda o modelo de build pela primeira vez desde 1979.',
  },
  {
    question: 'Qual versão de C++ é o patamar realista em produção em 2026?',
    options: [
      'C++98 é o padrão em todo lugar',
      'C++17 é o mínimo pragmático em produção (suporte universal em GCC/Clang/MSVC, std::optional, std::variant, structured bindings, if constexpr). C++20 entra firme em código novo (concepts e ranges são os game-changers), mas modules e coroutines ainda têm quirks de toolchain. C++23 é bleeding-edge: std::expected e std::print chegam primeiro em compiladores mais novos',
      'Todo código novo já é C++23',
      'C++11 é suficiente para qualquer projeto moderno',
    ],
    correct: 1,
    explanation: 'C++17 é o "moderno seguro" em 2026: suporte completo em toolchains maduras, features essenciais (structured bindings, CTAD, if constexpr, std::optional, std::variant, filesystem). C++20 adiciona concepts (que substituem SFINAE hell) e ranges (que substituem iteradores feios), mas modules têm adoção desigual. C++23 traz std::expected e std::print, mas ainda é early-adopter. Projetos grandes como LLVM e Chromium mantêm C++17 como mínimo.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cpp-historia-compilador-diferencial"
      title="C++: história, compilador e diferencial técnico"
      icon="➕"
      xp={50}
      readTime={12}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="raii-smart-pointers"
      nextTitle="RAII e smart pointers: o fundamento C++ moderno"
      quiz={quiz}
    >
      <Section title="C with Classes, 1979: quando o Unix precisou de abstração" accent={accent}>
        <p>
          C++ começou em 1979 como <strong>C with Classes</strong>, experimento de <strong>Bjarne Stroustrup</strong> nos Bell Labs. A motivação foi pragmática: Stroustrup havia feito doutorado com Simula 67 (a linguagem que inventou classes e herança) e sentiu falta desses mecanismos ao voltar para C. Renomeado para C++ em 1983, ganhou primeiro livro (<em>The C++ Programming Language</em>) em 1985 e padronização ISO em 1998.
        </p>
        <p>
          Marcos de padronização: <strong>C++98</strong> (1998, primeira ISO), <strong>C++03</strong> (2003, bugfixes), <strong>C++11</strong> (2011, aqui começa o C++ moderno — auto, lambdas, move semantics, smart pointers), <strong>C++14</strong> (2014, refinamentos), <strong>C++17</strong> (2017, structured bindings, std::optional, filesystem), <strong>C++20</strong> (2020, concepts, ranges, modules, coroutines — maior salto desde C++11), <strong>C++23</strong> (2023, std::expected, std::print, deducing this).
        </p>
      </Section>

      <Section title="Filosofia: zero-overhead + múltiplos paradigmas" accent={accent}>
        <Callout tone="info" icon="🎯">
          <strong>Você não paga pelo que não usa.</strong> E o que usa não poderia ser escrito à mão de forma mais eficiente. Este é o contrato de Stroustrup, e é o que diferencia C++ de Java, C# ou Swift: abstrações têm custo apenas em compile-time.
        </Callout>
        <p>
          C++ é deliberadamente multiparadigma — procedural, OO, genérico (templates), funcional (lambdas + ranges). Isso é força (flexibilidade) e fraqueza (complexidade cognitiva). Por isso existem as <strong>C++ Core Guidelines</strong> (Stroustrup + Herb Sutter): subset pragmático que a indústria adotou como norma.
        </p>
      </Section>

      <Section title="Como o .cpp vira binário" accent={accent}>
        <CodeBlock lang="bash">{'# pipeline (mesmo esqueleto de C, mas cada passo faz mais trabalho)\nmain.cpp\n  |-- cpp         --> main.ii  (pre-processado: #includes expandidos)\n  |-- cc1plus     --> main.s   (asm; templates monomorfizados aqui)\n  |-- as          --> main.o   (object; simbolos name-mangled)\n  |-- ld (+libstdc++) --> app  (executavel; resolve vtables, dedup templates)\n\n# name mangling codifica tipos:\n#   void foo(int, double)  -->  _Z3fooid   (Itanium ABI, gcc/clang)\n# use c++filt pra decodificar:\necho _Z3fooid | c++filt\n\n# C++20 modules mudam esse modelo:\n# em vez de #include (copia textual), voce importa BMI pre-compilado\ng++ -std=c++20 -fmodules-ts -c meu_modulo.cppm\ng++ -std=c++20 -fmodules-ts main.cpp meu_modulo.o -o app'}</CodeBlock>
        <p>
          Compiladores em 2026: <strong>GCC g++ 14</strong>, <strong>Clang++ 18</strong> (LLVM, melhor diagnóstico), <strong>MSVC</strong> (mais rápido no Windows, primeiro com C++20 modules em produção). Suporte a C++23 varia: consulte cppreference e o compiler support chart. Para cross-compilation embedded: arm-none-eabi-g++, IAR, Keil.
        </p>
      </Section>

      <Section title="Versões que importam até 2026" accent={accent}>
        <CodeBlock lang="cpp">{'// C++98 / C++03: base historica. Templates, STL, exceptions, RTTI.\n\n// C++11 (2011): onde C++ moderno comeca\n// - auto, range-based for, nullptr\n// - lambdas, std::function\n// - rvalue references + move semantics\n// - smart pointers (unique_ptr, shared_ptr, weak_ptr)\n// - std::thread, std::mutex, std::atomic\n// - variadic templates, constexpr (basico)\n\n// C++14: refinamentos\n// - generic lambdas (auto parametros)\n// - return type deduction em funcoes\n// - std::make_unique\n\n// C++17: moderno pragmatico\n// - structured bindings: auto [k, v] = pair;\n// - if constexpr (template branching)\n// - std::optional, std::variant, std::any\n// - std::filesystem\n// - CTAD (class template argument deduction)\n\n// C++20: salto maior desde C++11\n// - concepts (substitui SFINAE): template<typename T> requires ...\n// - ranges: views::filter | views::transform | views::take\n// - modules: import std; (substitui #include)\n// - coroutines: co_await, co_yield, co_return\n// - std::format (substitui printf/cout)\n// - three-way comparison: operator<=> (spaceship)\n\n// C++23: refinamentos de C++20\n// - std::expected<T, E> (alternativa a exceptions)\n// - std::print / std::println (ergonomia)\n// - deducing this (explicit object parameter)\n// - std::flat_map, std::mdspan'}</CodeBlock>
      </Section>

      <Section title="Diferencial técnico: o que só C++ entrega" accent={accent}>
        <p>
          Três atributos combinados fazem C++ insubstituível em 2026 em games, HFT, browsers e libs numéricas:
        </p>
        <CodeBlock lang="cpp">{'// 1. RAII: destrutores deterministicos\n// Recurso eh liberado quando o objeto sai de escopo — sem GC, sem finalize.\n{\n    std::lock_guard<std::mutex> lock(m);  // trava aqui\n    std::ofstream f("log.txt");           // abre arquivo\n    // ... trabalho ...\n}  // destrutores rodam em ordem reversa: fecha arquivo, libera mutex\n\n// 2. Templates monomorfizados: generic sem virtual call\n// std::sort com lambda inlina comparador — codigo assembly identico\n// ao loop manual. Sem interface dispatch, sem boxing.\nstd::ranges::sort(v, [](auto a, auto b) { return a.price < b.price; });\n\n// 3. Controle total de layout de memoria\n// struct packing, alignas, SIMD intrinsics, allocators custom.\n// Usado em game engines (ECS), trading (cache lines), ML (SIMD kernels).\nalignas(64) struct HotData { /* fits in single cache line */ };'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Em 2026, C++ é a linguagem default em: game engines (Unreal, Godot runtime), browsers (V8, Blink, Gecko), trading e HFT, bibliotecas numéricas e ML (Eigen, PyTorch C++, TensorFlow core, OpenCV), CAD/DCC (Blender, AutoCAD), bancos embarcados (Parquet/Arrow), e drivers de GPU (CUDA hosts).
        </Callout>
      </Section>

      <Section title="Versão mais usada no mercado em 2026" accent={accent}>
        <Callout tone="neutral" icon="🧭">
          <strong>C++17 é o mínimo pragmático</strong> na maioria dos projetos grandes — LLVM, Chromium, Unreal, Qt. <strong>C++20</strong> entra rapidamente em código novo pelos concepts e ranges, que tornam templates legíveis pela primeira vez na história. <strong>C++23</strong> é bleeding-edge — use quando seu compilador e todo o time topam. Codebases legadas em HFT e jogos às vezes travadas em C++14 por razões de build farm e portabilidade.
        </Callout>
        <p>
          Flags mínimas recomendadas em 2026: <code>-std=c++20 -Wall -Wextra -Wpedantic -Wconversion -O2 -g -fsanitize=address,undefined</code>, com <code>clang-tidy</code> e <code>cppcheck</code> em CI. Para dependências: vcpkg ou Conan — acabou a era do "copia header no repo".
        </p>
      </Section>

      <Section title="O que esperar desta trilha" accent={accent}>
        <Callout tone="info" icon="🗺️">
          Próximos módulos: RAII e smart pointers (fundamento sem escape), move semantics e rvalue refs, templates com concepts (C++20), STL moderno com ranges, modules e coroutines, perf (cache, SIMD, constexpr), Core Guidelines + tooling, e capstone de utility high-perf.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
