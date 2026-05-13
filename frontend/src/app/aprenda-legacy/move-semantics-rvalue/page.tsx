import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('move-semantics-rvalue');
const accent = '#0369a1';

const quiz: QuizQuestion[] = [
  {
    question: 'O que `std::move` realmente faz?',
    options: [
      'Move dados',
      'Nada em runtime: é cast estático para rvalue reference, permitindo que o compilador escolha overloads de move (move ctor/assign) em vez de copy. Toda a "mudança" acontece no move ctor que você define',
      'Aloca memória',
      'Destrói o objeto',
    ],
    correct: 1,
    explanation: 'std::move é apenas static_cast<T&&>(x). A transferência real (roubar ponteiro interno, zerar origem) é implementada no move ctor do tipo. Para tipos RAII padrão (string, vector, unique_ptr), o compilador gera automaticamente. std::move(x) depois de usar x = "marcar como lixo aceitável" para o leitor.',
  },
  {
    question: 'Por que `f(std::move(s))` invalida s?',
    options: [
      'Não invalida',
      'Após move, s fica em "valid but unspecified state" — ainda destruível e atribuível, mas não assuma conteúdo. Para strings/vectors: geralmente vazio, mas não garantido. Acessar valor é bug de linguagem corrente',
      'Deixa intacto',
      'Crasha sempre',
    ],
    correct: 1,
    explanation: 'Padrão C++: após move, objeto está em estado válido mas não especificado. Você pode destruir (destrutor roda), atribuir (recebe novo valor), ou checar com operações que não dependem do valor. Ler o conteúdo é UB do ponto de vista do contrato. Linters modernos (clang-tidy misc-move-after-move) flagam.',
  },
  {
    question: 'Quando usar perfect forwarding com `std::forward`?',
    options: [
      'Sempre',
      'Em templates que recebem T&& (forwarding reference, aka universal reference) e precisam repassar mantendo categoria de valor. std::forward<T>(arg) preserva lvalue/rvalue — diferente de std::move que força rvalue',
      'Em qualquer função',
      'Em destrutor',
    ],
    correct: 1,
    explanation: 'Forwarding reference (template T com T&&) captura qualquer coisa. std::forward<T>(arg) devolve rvalue se entrou como rvalue, lvalue se entrou como lvalue. Essencial em factory/emplace/wrappers. std::move força rvalue sempre — errado aqui porque perderia l-values.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="move-semantics-rvalue"
      title="Move semantics e rvalue references"
      icon="🏃"
      xp={60}
      readTime={14}
      trailName="C++ Moderno (C++20/23)"
      trailColor={accent}
      nextSlug="templates-concepts"
      nextTitle="Templates com Concepts (C++20)"
      quiz={quiz}
    >
      <Section title="Problema: copy é caro" accent={accent}>
        <p>
          <code>std::string</code> com 10MB copiada é 10MB duplicados. Na maioria dos fluxos de dados, o objeto original morre logo depois — a cópia é desperdício. Move semantics permite "transferir tripas" em vez de duplicar.
        </p>
      </Section>

      <Section title="lvalue vs rvalue: categoria de valor" accent={accent}>
        <CodeBlock lang="cpp">{`std::string s = "hello";      // s é lvalue
std::string t = s;            // usa copy ctor (s ainda precisa existir)
std::string u = std::string{"tmp"};   // rvalue temporário → move
std::string v = std::move(s); // força rvalue → move; s fica vazio`}</CodeBlock>
        <p>
          Lvalue: tem nome e endereço estável. Rvalue: temporário sem nome (ou marcado como tal). Compilador usa categoria para decidir entre copy e move.
        </p>
      </Section>

      <Section title="Move ctor idiomático" accent={accent}>
        <CodeBlock lang="cpp">{`class MyBuffer {
    char *data_;
    size_t n_;
public:
    MyBuffer(MyBuffer&& other) noexcept
        : data_(other.data_), n_(other.n_) {
        other.data_ = nullptr;    // rouba tripas
        other.n_ = 0;
    }
    MyBuffer& operator=(MyBuffer&& other) noexcept {
        if (this != &other) {
            delete[] data_;
            data_ = std::exchange(other.data_, nullptr);
            n_ = std::exchange(other.n_, 0);
        }
        return *this;
    }
    ~MyBuffer() { delete[] data_; }   // safe se data_ == nullptr
};`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Move ctor/assign deve ser <code>noexcept</code>. Sem isso, <code>std::vector</code> não usa move ao crescer — copia tudo. Anotação é não-negociável.
        </Callout>
      </Section>

      <Section title="Return by value já é eficiente" accent={accent}>
        <CodeBlock lang="cpp">{`std::vector<int> make_big() {
    std::vector<int> v(1'000'000);
    // ... preenche ...
    return v;   // NRVO ou move — zero copia
}

auto result = make_big();  // sem overhead`}</CodeBlock>
        <p>
          Não retorne por <code>unique_ptr</code> "para evitar cópia" — <code>std::vector</code> já é cheap por move. Nem use <code>std::move</code> no return (mata NRVO).
        </p>
      </Section>

      <Section title="Forwarding reference e perfect forwarding" accent={accent}>
        <CodeBlock lang="cpp">{`template <typename T, typename... Args>
std::unique_ptr<T> my_make_unique(Args&&... args) {
    return std::unique_ptr<T>(new T(std::forward<Args>(args)...));
}

// std::forward preserva lvalue/rvalue de cada argumento
// diferente de std::move que força rvalue`}</CodeBlock>
        <p>
          Regra prática: <code>std::move</code> quando você *sabe* que quer mover (variável concreta), <code>std::forward</code> dentro de template com <code>T&amp;&amp;</code>.
        </p>
      </Section>

      <Section title="Armadilhas comuns" accent={accent}>
        <Callout tone="danger" icon="🚨">
          (1) <code>return std::move(x)</code> inibe NRVO — quase sempre errado. (2) Usar <code>x</code> depois de <code>std::move(x)</code> é bug silencioso. (3) Esquecer <code>noexcept</code> em move ctor mata performance de containers. (4) <code>const T&amp;&amp;</code> é inútil — não move nem forwarda.
        </Callout>
      </Section>

      <Section title="Sanity test com clang-tidy" accent={accent}>
        <CodeBlock lang="bash">{`clang-tidy src/*.cpp \\
    -checks='performance-move-const-arg,
             bugprone-use-after-move,
             performance-unnecessary-value-param'`}</CodeBlock>
        <Callout tone="success" icon="✅">
          Em PR, clang-tidy pega 80% dos erros de move. CI com warning-as-error em bugprone-use-after-move vale ouro.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
