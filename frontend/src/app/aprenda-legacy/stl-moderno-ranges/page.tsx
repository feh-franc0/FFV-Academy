import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('stl-moderno-ranges');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual vantagem central de views::filter | views::transform sobre algoritmos clássicos?',
    options: [
      'Só sintaxe bonita',
      'Lazy evaluation: nenhum vetor intermediário é materializado. A composição é avaliada elemento a elemento quando iterada. Resultado: pipelines legíveis com custo equivalente ou menor ao for manual',
      'Sempre mais rápido',
      'Multi-thread automático',
    ],
    correct: 1,
    explanation: 'Ranges views são lazy: views::filter só testa predicado quando o iterador avança; views::transform aplica função on-demand. Zero alocação intermediária. Compilador inlinha tudo. É a resposta C++ para map/filter idiomático sem custo de alocar containers intermediários.',
  },
  {
    question: 'Diferença entre std::ranges::sort e std::sort?',
    options: [
      'Nenhuma',
      'ranges::sort aceita o range direto (não precisa de begin/end), tem constraints via concepts (erros legíveis), suporta projection (ordenar por campo sem lambda de comparação completa). Semântica igual à std::sort clássica',
      'Mais lento',
      'Single-thread',
    ],
    correct: 1,
    explanation: 'std::ranges::sort(v, std::less{}, &Person::age) ordena vector de Person por idade — projection extrai o campo. Versão clássica pediria lambda [](const P& a, const P& b){return a.age<b.age;}. Menos boilerplate, mesmo big-O. Todos os <algorithm> têm versão ranges::.',
  },
  {
    question: 'Por que std::format substitui iostream e printf?',
    options: [
      'Cosmético',
      'Type-safe como iostream (sem risco de %d com float), conciso como printf, mais rápido que iostream em geral, suporta posicionais, width/precisão em {:.2f}, localização controlada. C++23 adiciona std::print/println',
      'Imprime em HTML',
      'Só em Windows',
    ],
    correct: 1,
    explanation: 'std::format("{:>10} = {:.2f}%", name, value) combina legibilidade Python-like com safety do compilador. iostream é verboso e lento, printf não é type-safe. C++23 adiciona std::print que vai direto para stdout sem ostream overhead. Padrão moderno para logging e CLI output.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="stl-moderno-ranges"
      title="STL moderno: ranges (C++20) e algorithms"
      icon="🔗"
      xp={60}
      readTime={14}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="modules-coroutines"
      nextTitle="Modules e Coroutines (C++20)"
      quiz={quiz}
    >
      <Section title="Iterator pairs → ranges" accent={accent}>
        <CodeBlock lang="cpp">{`// C++17: verboso
std::sort(v.begin(), v.end());

// C++20: direto
std::ranges::sort(v);`}</CodeBlock>
      </Section>

      <Section title="Views: composição lazy" accent={accent}>
        <CodeBlock lang="cpp">{`#include <ranges>
#include <vector>
#include <iostream>

int main() {
    std::vector<int> v{1,2,3,4,5,6,7,8,9,10};
    auto pipeline = v
        | std::views::filter([](int x){ return x % 2 == 0; })
        | std::views::transform([](int x){ return x * x; })
        | std::views::take(3);

    for (int x : pipeline) std::cout << x << ' ';
    // Saída: 4 16 36
}`}</CodeBlock>
        <p>
          Nenhum vetor intermediário é alocado. Cada elemento flui pelo pipeline sob demanda.
        </p>
      </Section>

      <Section title="Materialização explícita" accent={accent}>
        <CodeBlock lang="cpp">{`// C++23: ranges::to
auto vec = v | std::views::filter(...) | std::ranges::to<std::vector>();

// C++20: manual
std::vector<int> vec;
for (int x : pipeline) vec.push_back(x);`}</CodeBlock>
      </Section>

      <Section title="Projections em algoritmos" accent={accent}>
        <CodeBlock lang="cpp">{`struct Person { std::string name; int age; };
std::vector<Person> people = { /*...*/ };

std::ranges::sort(people, {}, &Person::age);
// projection extrai age; comparador default é std::less`}</CodeBlock>
        <p>
          Projections eliminam lambdas triviais em <code>sort</code>, <code>find_if</code>, <code>min_element</code>.
        </p>
      </Section>

      <Section title="std::format e std::print" accent={accent}>
        <CodeBlock lang="cpp">{`#include <format>
#include <print>   // C++23

int count = 42;
double rate = 0.9876;

std::string s = std::format("{} itens, {:.2%} sucesso", count, rate);
std::println("{} itens, {:.2%} sucesso", count, rate);   // C++23`}</CodeBlock>
        <p>
          Especificadores herdados de Python (<code>:.2f</code>, <code>:&gt;10</code>, <code>:#x</code>). Type-safe — compilador checa formato vs argumentos em C++23 com <code>std::format_string</code>.
        </p>
      </Section>

      <Section title="std::span: view sobre contíguos" accent={accent}>
        <CodeBlock lang="cpp">{`void process(std::span<const int> data) {
    for (int x : data) /* ... */;
}

int arr[5] = {1,2,3,4,5};
std::vector<int> v = {1,2,3};
process(arr);  // OK
process(v);    // OK — aceita qualquer contíguo`}</CodeBlock>
        <p>
          <code>span</code> substitui pares ptr+size em APIs. Non-owning, barato, não copia. Em C++ moderno, função que antes recebia <code>const std::vector&amp;</code> pode receber <code>std::span&lt;const T&gt;</code> e aceitar mais tipos sem cópia.
        </p>
      </Section>

      <Section title="std::expected (C++23)" accent={accent}>
        <CodeBlock lang="cpp">{`std::expected<int, std::string> parse(std::string_view s) {
    if (s.empty()) return std::unexpected("vazio");
    // ... parse ...
    return 42;
}

auto r = parse("123");
if (r) use(*r);
else   log_error(r.error());`}</CodeBlock>
        <p>
          Alternativa a exceção para operações que falham frequentemente. Semelhante a <code>Result</code> de Rust.
        </p>
      </Section>

      <Section title="Impacto prático" accent={accent}>
        <Callout tone="success" icon="✅">
          Código C++ moderno é 30-50% menos linhas que C++17 equivalente. Ranges + format + span eliminam boilerplate histórico. Adoção incremental: comece por <code>std::format</code> e <code>std::span</code> em APIs novas.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
