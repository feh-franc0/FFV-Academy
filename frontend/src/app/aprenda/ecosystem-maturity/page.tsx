import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('ecosystem-maturity');
const accent = '#84cc16';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que "número de pacotes" é métrica enganosa?',
    options: [
      'É precisa',
      'Mede quantidade, não qualidade — npm lidera em volume com muita duplicação e leftpad-like packages; pip e crates têm menos pacotes mas melhor curadoria em media. Importa é cobertura do seu caso de uso',
      'Mede qualidade',
      'É a única métrica',
    ],
    correct: 1,
    explanation: 'npm com 2M+ pacotes inclui centenas de "left-pad". Rust crates.io (~150k) é menor mas tem menos bagunça. O que importa: existe lib madura para meu caso (driver Postgres, HTTP client, gRPC)? Em 2026 todas as top linguagens cobrem o básico — a decisão é mais sobre tooling e IDE.',
  },
  {
    question: 'O que diferencia tooling de Go/Rust do de JS/Python?',
    options: [
      'Nada',
      'Go e Rust trazem build, test, format, lint e dependency resolve em uma única ferramenta oficial (go, cargo) — JS e Python dependem de combinar várias (npm/pnpm, vitest/jest, prettier, eslint, pip, poetry, pytest, black) com config grande',
      'JS é mais simples',
      'Python não tem tooling',
    ],
    correct: 1,
    explanation: 'go test, go build, go fmt, go vet, go mod são uma suite oficial coerente. cargo faz o mesmo em Rust (cargo test, build, fmt, clippy, update). JS e Python sofrem de proliferation: decidir entre npm/pnpm/yarn/bun, jest/vitest, prettier, eslint, tsc. Não é drama, mas é custo cognitivo real.',
  },
  {
    question: 'Quando maturity não é suficiente para escolher uma linguagem?',
    options: [
      'Nunca',
      'Quando o time não tem expertise — uma linguagem com ecosystem menor que o time já domina é melhor que uma linguagem "mais madura" que ninguém conhece. Hiring e ramp-up custam mais que biblioteca',
      'Nunca, maturity decide',
      'Sempre decide',
    ],
    correct: 1,
    explanation: 'Adotar Rust num time de Node pode ser armadilha: 6 meses de ramp-up para ganhar 20% de perf que talvez nem importe. Escolha linguagem por combinação de maturity + expertise do time + hiring local + longevidade do produto. Tecnologia vence com pessoas que a dominam.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="ecosystem-maturity"
      title="Ecosystem maturity: libraries, tooling, community"
      icon="🌳"
      xp={50}
      readTime={12}
      trailName="Comparação de Linguagens: Escolha Certa"
      trailColor={accent}
      nextSlug="quando-escolher-cada"
      nextTitle="Quando escolher cada: matriz de decisão"
      quiz={quiz}
    >
      <Section title="Ecosystem é meia-escolha" accent={accent}>
        <p>
          Você não escolhe só a linguagem — escolhe o ecosystem. Se o driver maduro para seu banco não existe, se a lib de telemetria tem 5 forks abandonados, se o IDE não tem completion decente — o charme da linguagem evapora. Maturity é o multiplicador invisível.
        </p>
      </Section>

      <Section title="Dimensões concretas" accent={accent}>
        <CodeBlock lang="bash">{`1. Package manager
   npm, pnpm, yarn (JS)  |  cargo (Rust)  |  go mod (Go)
   pip, poetry, uv (Py)  |  maven, gradle (Java)  |  nuget (C#)

2. Build + test + format unificados
   Go e Rust: sim (ferramenta oficial)
   JS, Python, Java, C#: composição de tools

3. IDE support
   TS + VS Code, Java + IntelliJ, C# + Rider/VS, Rust + rust-analyzer
   Go + Goland, Python + PyCharm
   Todos com LSP servers maduros em 2026

4. Documentação canônica
   Go: pkg.go.dev + tour.golang.org (oficial, excelente)
   Rust: docs.rs + book (excelente)
   Java: JavaDoc por dep + guides Baeldung
   Python: docs.python.org + PyPI projetos variados
   JS/TS: MDN + blog posts espalhados

5. Hiring pool
   JS/TS, Python, Java, C#: abundante
   Go, C++: bom em mercado sênior
   Rust: crescendo, ainda escasso
   Haskell, OCaml, Elixir: nicho`}</CodeBlock>
      </Section>

      <Section title="Tooling unificado vs fragmentado" accent={accent}>
        <CodeBlock lang="bash">{`# Go: tudo oficial
go mod init / go test / go build / go fmt / go vet / go tool pprof

# Rust: tudo via cargo
cargo new / cargo test / cargo build / cargo fmt / cargo clippy

# TypeScript: combinação
pnpm + vitest + prettier + eslint + tsc + tsup/vite

# Python: combinação
uv (ou poetry) + pytest + black + ruff + mypy

# Java: gradle/maven + jUnit + checkstyle/spotbugs
# C#: dotnet cli (unificado!) + xunit`}</CodeBlock>
        <Callout tone="info" icon="💡">
          Fragmentação não é defeito fatal — é custo cognitivo. TS e Python têm ecosystem rico mas exigem decisões de tooling em cada projeto. Go e Rust eliminam esse atrito.
        </Callout>
      </Section>

      <Section title="Long-term stability" accent={accent}>
        <CodeBlock lang="bash">{`Go: compromisso forte de compat (Go 1 promise)
Java: LTS 17/21, Jakarta migration é exceção
C#/.NET: bom em LTS
Rust: edições anuais, migration automática via cargo fix
TypeScript: quebras raras mas existem (strict-mode opts)
Python: 2→3 foi traumático, 3.x é estável
Node: LTS + mudanças de ESM/CJS ainda irritam`}</CodeBlock>
      </Section>

      <Section title="Community e ritmo" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          JS tem mais material novo por semana do que você consegue ler. Python tem enorme ecossistema de ML. Go é quieto (pouco hype) mas consistente. Rust tem comunidade ativa e pragmática em 2026. Haskell/OCaml são acadêmicos por design. Isso afeta velocidade de solução de problemas em Stack Overflow / Discord / GitHub.
        </Callout>
      </Section>

      <Section title="Antes de escolher" accent={accent}>
        <Callout tone="success" icon="✅">
          Liste 10 libs que você precisa (driver DB, HTTP client, JSON, validação, cache, métricas, tracing, queue, config, logger). Se 9 são maduras na linguagem candidata, ok. Se 5 são abandonadas ou forks, fuja. Esse checklist rápido evita compromisso de 2 anos com ecosystem imaturo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
