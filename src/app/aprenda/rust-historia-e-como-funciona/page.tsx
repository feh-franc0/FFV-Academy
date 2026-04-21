import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('rust-historia-e-como-funciona');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a diferença prática entre "sem GC" e "zero-cost abstractions" em Rust?',
    options: [
      'São sinônimos',
      '"Sem GC" significa que memória é liberada por ownership em tempo de compilação (sem runtime scanner); "zero-cost abstractions" significa que iteradores, traits e async compilam para o mesmo assembly que você escreveria à mão em C — abstração não custa ciclos',
      'Zero-cost significa que é grátis',
      'GC é opcional em Rust',
    ],
    correct: 1,
    explanation: 'Rust não tem runtime GC — drop é inserido pelo compilador via análise estática de ownership. Zero-cost é a promessa de Bjarne Stroustrup aplicada com rigor: você não paga por abstração que não usa, e a que usa compila tão bem quanto código manual. Por isso iterator chains viram loops vetorizados no LLVM.',
  },
  {
    question: 'Por que AI infra (tokenizers HuggingFace, candle, polars, ruff) migrou para Rust em 2024-2026?',
    options: [
      'Hype',
      'Python é lento em hot loops (GIL, interpretação) e C++ tem footguns que travam o time. Rust dá perf de C com safety em compile-time, compila para lib nativa que Python/Node consomem via pyo3/napi-rs — você ganha 10-100x em parsing, vetorização e parallel sem memory bugs',
      'Rust é mais fácil que Python',
      'Por modinha de Twitter',
    ],
    correct: 1,
    explanation: 'Tokenizers (HF) é Rust com binding Python; polars substituiu pandas em muitos pipelines por ser 5-30x mais rápido; ruff reescreveu pylint/flake8/isort em Rust e ficou 100x mais rápido; candle (HF) é inference framework Rust puro. O padrão: core hot-path em Rust, API em Python. Sem GIL, sem segfault.',
  },
  {
    question: 'O que acontece entre source code .rs e binário final?',
    options: [
      'Compila direto para asm',
      'rustc faz lex/parse → HIR (high-level IR, tipo-checado) → MIR (mid-level IR, onde borrow checker roda) → LLVM IR → otimizações LLVM → assembly → link. Cada nível existe por razão: MIR foi criado em 2016 exatamente para rodar borrow checker em CFG simplificado',
      'Usa GCC',
      'Interpreta como Python',
    ],
    correct: 1,
    explanation: 'O pipeline multi-IR é fundamental. HIR preserva estrutura do código fonte para erros bons; MIR é CFG desugared onde ownership/lifetimes são verificados; LLVM IR recebe o peso das otimizações (inlining, vectorização, LTO). Entender isso ajuda a ler erros de borrow checker e a confiar em por que Rust é rápido.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="rust-historia-e-como-funciona"
      title="Rust: história, filosofia e como funciona de verdade"
      icon="🦀"
      xp={50}
      readTime={12}
      trailName="Rust Profissional"
      trailColor={accent}
      nextSlug="ownership-borrow-mental-model"
      nextTitle="Ownership & borrow checker: mental model"
      quiz={quiz}
    >
      <Section title="De projeto pessoal a linguagem de infra" accent={accent}>
        <p>
          Rust começou em 2006 como side project de Graydon Hoare, engenheiro da Mozilla. A motivação era pragmática: navegadores travavam por use-after-free, data races e buffer overflows em C++. Mozilla adotou o projeto em 2010, escreveu o Servo (engine experimental) como prova de conceito e chegou a Rust 1.0 em 15 de maio de 2015. Em 2021, com a saída de engenheiros da Mozilla, a linguagem passou para a <strong>Rust Foundation</strong> (AWS, Google, Microsoft, Meta, Huawei como founding members) — sinal de que deixou de ser aposta para virar infraestrutura crítica.
        </p>
        <p>
          Em 2026, Rust aparece em kernel Linux (módulos de driver), Windows (partes do kernel), Android (Binder reescrito), Chrome (Rust em componentes críticos), Cloudflare (proxy Pingora), Discord (serviços de estado), e em praticamente todo o stack moderno de AI infra.
        </p>
      </Section>

      <Section title="A filosofia em três linhas" accent={accent}>
        <Callout tone="info" icon="🎯">
          <strong>Safety + speed + ergonomics.</strong> Escolha dois de três costumava ser o tradeoff (C/C++ = speed sem safety, Go/Java = safety com GC, Python = ergonomics sem speed). Rust aposta que dá para ter os três com type system rigoroso + borrow checker em compile-time.
        </Callout>
        <p>
          Traduzindo: zero runtime GC, zero data race em código safe, abstrações de alto nível (iterators, traits, async) que compilam para código tão eficiente quanto C manual. O preço é que você paga na curva de aprendizado — o borrow checker rejeita código que compila em C++ mas teria UAF em prod.
        </p>
      </Section>

      <Section title="Como o código vira binário" accent={accent}>
        <CodeBlock lang="bash">{'# pipeline de compilação\nmain.rs\n  |-- lex/parse --> AST\n  |-- desugar    --> HIR (High-level IR, type-checked)\n  |-- lower      --> MIR (Mid-level IR, CFG desugared)\n  |                   ^ borrow checker roda AQUI\n  |-- codegen    --> LLVM IR\n  |-- LLVM opt   --> assembly (x86_64, aarch64, wasm, riscv...)\n  |-- link       --> binário nativo (sem runtime, sem GC)'}</CodeBlock>
        <p>
          O MIR foi introduzido em 2016 justamente para dar ao borrow checker um CFG limpo para analisar. Antes disso, o checker rodava em AST e tinha falsos positivos frequentes. Hoje o NLL (non-lexical lifetimes, 2018) e o Polonius (borrow checker de próxima geração) rodam em MIR e aceitam código muito mais natural.
        </p>
      </Section>

      <Section title="Zero-cost abstractions na prática" accent={accent}>
        <CodeBlock lang="rust">{'// high-level: iterator chain\nlet total: i32 = (1..=1000)\n    .filter(|n| n % 2 == 0)\n    .map(|n| n * n)\n    .sum();\n\n// compila para loop inlined equivalente ao que você escreveria em C:\n// let mut total = 0; for n in 1..=1000 { if n % 2 == 0 { total += n*n; } }\n// LLVM ainda vetoriza o loop com SIMD quando a arch permite.'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Abstração não é overhead. Você escreve código declarativo e o compilador entrega código imperativo otimizado — sem virtual dispatch, sem heap, sem runtime penalty.
        </Callout>
      </Section>

      <Section title="Por que AI infra virou Rust em 2024-2026" accent={accent}>
        <p>
          Python domina a camada de modelagem, mas a infraestrutura em volta (tokenização, dataframes, linters, build tools, serving) migrou para Rust por três razões concretas:
        </p>
        <CodeBlock lang="bash">{'tokenizers (HuggingFace) — Rust core, binding Python via pyo3\npolars                  — DataFrame Rust, 5-30x vs pandas\nruff                    — linter Python em Rust, ~100x vs pylint\ncandle (HF)             — inference framework Rust puro\nqdrant / meilisearch    — vector/search DBs em Rust\npydantic-core (v2)      — Rust core + Python API\nuv / rye                — package managers Python em Rust'}</CodeBlock>
        <p>
          O padrão é sempre o mesmo: hot path em Rust, API ergonômica em Python. Você mantém a produtividade científica do ecosistema Python e ganha throughput real sem lidar com GIL nem com segfault de C++.
        </p>
      </Section>

      <Section title="O que esperar desta trilha" accent={accent}>
        <Callout tone="neutral" icon="🗺️">
          Próximos módulos: ownership como mental model (não é sintaxe, é <em>como você pensa</em>), lifetimes sem mágica, traits idiomáticos, async com tokio em produção, macros declarativos e procedurais, unsafe com contrato, cargo ecosystem e perf real, e um capstone com CLI + Axum + sqlx + Docker multi-stage.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
