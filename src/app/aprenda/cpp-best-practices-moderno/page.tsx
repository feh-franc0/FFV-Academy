import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cpp-best-practices-moderno');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'O que C++ Core Guidelines recomendam sobre passagem de parâmetros?',
    options: [
      'Tudo por referência',
      'Pequeno e trivially copyable (int, pointer, struct curto): por valor. Caro a copiar + não modifica: const T&. Modifica: T& ou T*. Sink (consumido pelo callee, move): T&& ou T (com move). Span<T> para visão de contíguo sem cópia',
      'Só por ponteiro',
      'Sempre T&&',
    ],
    correct: 1,
    explanation: 'Core Guidelines F.15-F.21 formalizam: passar int, double, std::pair<int,int> por valor (fits em registrador). std::string, std::vector, objetos pesados: const T& se read-only. T& para out-params (preferir retornar por valor quando viável). Rule of thumb: "passe como você pensaria em Python + anotação de mutação".',
  },
  {
    question: 'O que clang-tidy oferece além de warnings do compilador?',
    options: [
      'Nada novo',
      'Checks ricos: bugprone (UAF, dangling, use-after-move), performance (unnecessary-copy, move-const-arg), modernize (auto, nullptr, loop, smart-ptr), readability (identifiers, implicit-conversion), cppcoreguidelines. Auto-fix com --fix',
      'Só formatação',
      'Só no Windows',
    ],
    correct: 1,
    explanation: 'clang-tidy é linter semântico com dezenas de grupos de check. modernize-use-auto converte código legado, bugprone-use-after-move pega bug sutis de move, readability-identifier-naming normaliza convenção. Com --fix aplica automático. CI com clang-tidy+warning=error em PR é padrão moderno.',
  },
  {
    question: 'Para que serve vcpkg ou Conan?',
    options: [
      'Só build',
      'Package manager C++: resolvem dependências transitivas, compilam com flags consistentes, integram com CMake (find_package direto). Evita "clone submodule + build manual" para cada lib. vcpkg (Microsoft, binary caching), Conan (JFrog, mais flexível)',
      'Substituem CMake',
      'Só para Windows',
    ],
    correct: 1,
    explanation: 'C++ historicamente não tinha package manager; cada projeto buildava deps na mão. vcpkg e Conan trouxeram o equivalente a npm/pip: vcpkg install fmt spdlog e CMake find_package funciona direto. Binary caching (CI), versionamento, toolchains consistentes. Adoção é evidência de time maduro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cpp-best-practices-moderno"
      title="C++ best practices: Core Guidelines + tools"
      icon="📖"
      xp={50}
      readTime={12}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="capstone-high-perf-cpp"
      nextTitle="Capstone: utility high-perf em C++ moderno"
      quiz={quiz}
    >
      <Section title="C++ Core Guidelines" accent={accent}>
        <p>
          Documento mantido por Bjarne Stroustrup e Herb Sutter (<code>isocpp/CppCoreGuidelines</code>). Não é "mais um style guide" — é a referência para o que "C++ moderno bem feito" significa. Cada regra tem justificativa, exemplos corretos/incorretos e enforcement automatizável.
        </p>
        <Callout tone="info" icon="💡">
          Navegue pelos grupos: F (functions), C (classes), R (resources), ES (expressions/statements), Per (performance), CP (concurrency), T (templates). Ler as 50 primeiras cobre 80% das decisões diárias.
        </Callout>
      </Section>

      <Section title="Regras mais influentes" accent={accent}>
        <CodeBlock lang="cpp">{`// F.16 — passe parâmetro barato por valor
void print(int x);               // OK
void print(char c);              // OK

// F.16 — caro não-sink: const T&
void log(const std::string& s);

// F.20 — prefira retorno por valor
std::vector<int> build();        // NRVO cuida

// R.10-11 — nunca new/delete em código cliente
auto p = std::make_unique<T>();

// ES.5 — scopes curtos, inicialização próxima do uso
for (int i = 0; i < n; ++i) { /* ... */ }`}</CodeBlock>
      </Section>

      <Section title="Toolchain mínima em 2026" accent={accent}>
        <CodeBlock lang="bash">{`# Formatter: clang-format
clang-format -i src/**/*.cpp include/**/*.hpp

# Linter: clang-tidy
clang-tidy src/*.cpp \\
    -checks='-*,bugprone-*,performance-*,modernize-*,readability-*' \\
    -- -std=c++20 -Iinclude

# Include-what-you-use: reduz includes transitivos
iwyu_tool -p build src/

# Dependency manager: vcpkg
vcpkg install fmt spdlog boost-asio

# Em CMake:
find_package(fmt CONFIG REQUIRED)
target_link_libraries(app PRIVATE fmt::fmt)`}</CodeBlock>
      </Section>

      <Section title="Sanitizers como política" accent={accent}>
        <CodeBlock lang="cmake">{`# CMake option idiomática
option(ENABLE_ASAN "AddressSanitizer" OFF)
option(ENABLE_UBSAN "UBSanitizer" OFF)
option(ENABLE_TSAN "ThreadSanitizer" OFF)

if(ENABLE_ASAN)
    add_compile_options(-fsanitize=address -fno-omit-frame-pointer)
    add_link_options(-fsanitize=address)
endif()`}</CodeBlock>
        <p>
          CI matrix: um job por sanitizer. Qualquer violação quebra o build.
        </p>
      </Section>

      <Section title="Convenções de naming" accent={accent}>
        <CodeBlock lang="cpp">{`namespace my_lib {                       // snake_case
class HttpClient {                       // PascalCase
    std::string base_url_;               // trailing underscore
public:
    void set_timeout(std::chrono::milliseconds ms);  // snake_case
    static constexpr int MAX_RETRIES = 3;            // SCREAMING
};
}   // namespace my_lib`}</CodeBlock>
        <p>
          A STL usa snake_case; Google style também. PascalCase para tipos, snake_case para funções/variáveis, <code>_</code> trailing em campos privados. Padronize com <code>.clang-tidy</code>.
        </p>
      </Section>

      <Section title="Testes: catch2 ou gtest" accent={accent}>
        <CodeBlock lang="cpp">{`#include <catch2/catch_test_macros.hpp>

TEST_CASE("Buffer copy", "[buffer]") {
    Buffer src{"hello"};
    Buffer dst = src;
    REQUIRE(dst.size() == src.size());
    REQUIRE(dst.data() != src.data());   // deep copy
}`}</CodeBlock>
      </Section>

      <Section title="Checklist de código pronto" accent={accent}>
        <Callout tone="success" icon="✅">
          (1) <code>-Wall -Wextra -Wpedantic -Werror</code>. (2) clang-format + clang-tidy em pre-commit. (3) Sanitizers em CI matrix. (4) Smart pointers + STL containers — zero new/delete. (5) Testes cobrindo APIs públicas. (6) vcpkg/Conan para deps. (7) CMake moderno baseado em targets. (8) C++20/23 com fallback declarado para C++17 se lib pública.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
