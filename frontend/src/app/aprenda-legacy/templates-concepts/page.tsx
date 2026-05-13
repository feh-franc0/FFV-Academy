import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('templates-concepts');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'O que Concepts (C++20) resolvem em relação ao SFINAE clássico?',
    options: [
      'Só sintaxe',
      'Substitui enable_if/declval/void_t por requires legível; mensagens de erro citam o predicado que falhou em vez de 50 linhas de substituição de template; permite overload/partial specialization com constraints nomeadas',
      'Performance',
      'Threading',
    ],
    correct: 1,
    explanation: 'Templates SFINAE tradicionais produziam mensagens de erro ilegíveis (1000+ linhas de template instantiation). Concepts dão nomes a predicados (std::integral, std::ranges::range) e o compilador emite erro citando o concept que falhou. Legibilidade e diagnóstico melhoram 10x. Overloads viram naturais.',
  },
  {
    question: 'O que é um abbreviated function template?',
    options: [
      'Macro',
      'Função com parâmetro tipo `auto` (ou `concept auto`) — o compilador infere o tipo, funcionalmente equivalente a template<typename T> sem a sintaxe. Limpa boilerplate em funções pequenas e algoritmos',
      'Função inline',
      'Código deprecated',
    ],
    correct: 1,
    explanation: 'void f(auto x) é açúcar para template<typename T> void f(T x). Com concept: void f(std::integral auto x) restringe aos tipos inteiros. Útil em lambdas, templates simples, helpers genéricos. Reduz ruído visual sem perder type safety.',
  },
  {
    question: 'Como checar que um tipo é hashable em C++20?',
    options: [
      'Tentativa e erro',
      'requires(T t) { std::hash<T>{}(t); }; ou concept Hashable = requires(T t) { { std::hash<T>{}(t) } -> std::convertible_to<size_t>; }. Checa existência de std::hash<T> com a assinatura esperada',
      'macro _Generic',
      'Não dá',
    ],
    correct: 1,
    explanation: 'requires expression permite testar síntese/semântica: chamada existe, tipo de retorno é compatível, não lança etc. Com -> std::convertible_to<X> você restringe o tipo de retorno. Base pra escrever concepts de biblioteca que rejeitam tipos incompatíveis com erro amigável.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="templates-concepts"
      title="Templates com Concepts (C++20)"
      icon="📐"
      xp={65}
      readTime={15}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="stl-moderno-ranges"
      nextTitle="STL moderno: ranges (C++20) e algorithms"
      quiz={quiz}
    >
      <Section title="Antes: SFINAE hell" accent={accent}>
        <CodeBlock lang="cpp">{`// C++17 — só aceita tipos inteiros
template <typename T,
          typename = std::enable_if_t<std::is_integral_v<T>>>
T add(T a, T b) { return a + b; }

// Erro em chamada com float: cascata de 300 linhas`}</CodeBlock>
      </Section>

      <Section title="Agora: requires + concepts" accent={accent}>
        <CodeBlock lang="cpp">{`#include <concepts>

template <std::integral T>
T add(T a, T b) { return a + b; }

// Erro amigável: "note: because 'std::integral<double>' is not satisfied"`}</CodeBlock>
      </Section>

      <Section title="Definindo concepts próprios" accent={accent}>
        <CodeBlock lang="cpp">{`template <typename T>
concept Printable = requires(T t, std::ostream& os) {
    { os << t } -> std::same_as<std::ostream&>;
};

template <Printable T>
void log(const T& value) {
    std::cout << "[log] " << value << '\\n';
}`}</CodeBlock>
        <p>
          <code>requires</code> express pode conter: chamadas válidas, tipos de retorno esperados, e subexpressões que precisam ser <code>noexcept</code>.
        </p>
      </Section>

      <Section title="Sintaxes de aplicação" accent={accent}>
        <CodeBlock lang="cpp">{`// 1. Como prefixo de typename
template <std::integral T> void f(T);

// 2. Cláusula requires posicionada
template <typename T>
    requires std::integral<T>
void g(T);

// 3. Trailing requires
template <typename T>
void h(T) requires std::integral<T>;

// 4. Abbreviated
void k(std::integral auto x);`}</CodeBlock>
      </Section>

      <Section title="Overloading com concepts" accent={accent}>
        <CodeBlock lang="cpp">{`void format(std::integral auto x) {
    std::print("{:d}\\n", x);
}

void format(std::floating_point auto x) {
    std::print("{:.2f}\\n", x);
}

void format(std::ranges::range auto const& r) {
    for (auto const& e : r) format(e);
}`}</CodeBlock>
        <p>
          Overloads antes exigiam tag dispatch ou <code>if constexpr</code>. Concepts selecionam no resolvedor de overload com prioridade natural (mais restrito &gt; menos restrito).
        </p>
      </Section>

      <Section title="Standard concepts úteis" accent={accent}>
        <CodeBlock lang="cpp">{`std::integral, std::floating_point, std::signed_integral
std::same_as<T, U>, std::convertible_to<From, To>
std::derived_from<Base>, std::constructible_from<Args...>
std::equality_comparable, std::totally_ordered
std::regular, std::semiregular
std::ranges::range, std::ranges::random_access_range
std::invocable<F, Args...>, std::predicate<F, Args...>`}</CodeBlock>
      </Section>

      <Section title="if constexpr continua útil" accent={accent}>
        <p>
          Dentro de template, <code>if constexpr</code> elimina branches em compile time. Combinado com concepts, faz código genérico legível sem overload explosion.
        </p>
        <CodeBlock lang="cpp">{`template <typename T>
std::string show(const T& v) {
    if constexpr (std::integral<T>)        return std::to_string(v);
    else if constexpr (std::is_enum_v<T>)  return std::to_string(int(v));
    else                                    return std::format("{}", v);
}`}</CodeBlock>
      </Section>

      <Section title="Resultado prático" accent={accent}>
        <Callout tone="success" icon="✅">
          Códigos-chave que eram 5 linhas de SFINAE viram 1 linha com concept. Mensagens de erro do compilador viram úteis. Library authors ganham ferramenta para expressar requisitos com precisão (ex: std::ranges reconstruiu STL inteira sobre concepts).
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
