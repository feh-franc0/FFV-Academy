import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('cargo-ecosystem-perf');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que são "features" no Cargo?',
    options: [
      'Versões da linguagem',
      'Flags de compilação opcionais que ativam código condicional (cfg(feature = "x")) e dependências opcionais. Permitem um mesmo crate expor API mínima (sem async, sem serde) ou completa, sem que o usuário pague por código que não usa. Chave para manter crates leves',
      'Bugs conhecidos',
      'Sinônimo de edition',
    ],
    correct: 1,
    explanation: 'Features são condicionais de build-time. reqwest tem features como "json", "rustls-tls", "blocking" — o usuário escolhe só o que precisa. Default features podem ser desativadas com default-features = false. É como você consome tokio com só as partes que importam (net, fs, macros) em vez do "full".',
  },
  {
    question: 'O que muda entre editions (2015/2018/2021/2024)?',
    options: [
      'Nada',
      'Edition permite mudanças de sintaxe e semântica que quebrariam código antigo, mantendo compat via opt-in por crate. Cada crate declara edition no Cargo.toml; editions diferentes compilam juntas. 2018 trouxe NLL default e módulos simplificados; 2021 disjoint closure captures; 2024 consolidou async closures, let chains e outros',
      'Uma edition é um release',
      'Muda tudo do zero',
    ],
    correct: 1,
    explanation: 'Edition resolve a tensão entre "linguagem estável" e "evolução". O compilador entende todas as editions simultaneamente — você pode ter crate 2018 dependendo de crate 2024. Cargo new em 2026 gera edition = "2024" por default. Rust 1.75+ é a toolchain recomendada em 2026, com releases a cada 6 semanas (rolling stable).',
  },
  {
    question: 'Para benchmark sério em Rust, qual ferramenta?',
    options: [
      'println! com Instant::now()',
      'criterion.rs — roda warm-up, estatísticas (mediana, desvio, outliers), detecta regressões entre runs, gera gráficos HTML. Amostra N vezes cada função, aplica análise estatística real. println! + Instant é estimativa grosseira; criterion é medição científica',
      'Nada funciona',
      'time no shell',
    ],
    correct: 1,
    explanation: 'criterion é o gold standard em Rust bench. Roda N iterações com warm-up, calcula intervalos de confiança, compara com run anterior e grita regressão. Para profiling (CPU hot path), usa-se flamegraph (via perf) ou cachegrind. Benchmark sério sem warm-up + statistics é teatro.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="cargo-ecosystem-perf"
      title="Cargo, crates.io, perf real + versões"
      icon="📦"
      xp={55}
      readTime={13}
      trailName="Rust Profissional"
      trailColor={accent}
      nextSlug="capstone-rust-cli-axum"
      nextTitle="Capstone: CLI + API HTTP com Axum"
      quiz={quiz}
    >
      <Section title="Cargo: build system + package manager num binário só" accent={accent}>
        <p>
          Cargo é invejado por outras linguagens. Um único binário resolve: download de deps, build, test, bench, doc, publish, cross-compile, lint (clippy), format (rustfmt). Reproduzível via <code>Cargo.lock</code>. Sem webpack, sem Makefile, sem pip+setup.py+tox+poetry rivais.
        </p>
        <CodeBlock lang="bash">{'cargo new app --bin          # cria projeto\ncargo build                  # debug build\ncargo build --release        # com otimização LLVM\ncargo test                   # roda testes (unit + integration + doctest)\ncargo bench                  # benchmarks (criterion)\ncargo clippy -- -D warnings  # linter estrito\ncargo fmt                    # format canônico\ncargo doc --open             # gera e abre docs HTML\ncargo publish                # publica em crates.io'}</CodeBlock>
      </Section>

      <Section title="Workspaces: monorepo nativo" accent={accent}>
        <CodeBlock lang="toml">{'# Cargo.toml na raiz\n[workspace]\nresolver = "2"\nmembers = ["crates/core", "crates/cli", "crates/server"]\n\n[workspace.dependencies]\ntokio   = { version = "1", features = ["full"] }\nserde   = { version = "1", features = ["derive"] }\nthiserror = "1"\n\n# crates/cli/Cargo.toml herda deps do workspace\n[dependencies]\ntokio  = { workspace = true }\nserde  = { workspace = true }\ncore   = { path = "../core" }'}</CodeBlock>
        <p>
          Workspace compartilha <code>target/</code> (build cache), resolução de deps e lockfile entre múltiplos crates. Ideal para lib + CLI + server num mesmo repo (padrão que você vai ver no capstone).
        </p>
      </Section>

      <Section title="Features: API escalonada" accent={accent}>
        <CodeBlock lang="toml">{'# Cargo.toml\n[features]\ndefault   = ["json"]\njson      = ["serde", "serde_json"]\nasync     = ["tokio"]\npostgres  = ["sqlx", "sqlx/postgres"]\n\n[dependencies]\nserde      = { version = "1", optional = true }\nserde_json = { version = "1", optional = true }\ntokio      = { version = "1", optional = true }\nsqlx       = { version = "0.7", optional = true, default-features = false }'}</CodeBlock>
        <CodeBlock lang="rust">{'#[cfg(feature = "json")]\npub fn to_json<T: serde::Serialize>(v: &T) -> String {\n    serde_json::to_string(v).unwrap()\n}'}</CodeBlock>
      </Section>

      <Section title="Editions: evolução sem quebrar" accent={accent}>
        <CodeBlock lang="bash">{'2015 — baseline de Rust 1.0, ainda suportado\n2018 — NLL default, módulos simplificados (sem extern crate), async/await\n2021 — disjoint closure captures, IntoIterator para arrays, Cargo resolver v2\n2024 — async closures, let chains, gen blocks, outras ergonomias'}</CodeBlock>
        <Callout tone="info" icon="💡">
          Em 2026, a toolchain estável recomendada é Rust 1.75+ com rolling stable (release a cada 6 semanas). MSRV (minimum supported Rust version) é convenção saudável: libs sérias declaram MSRV (ex: 1.70) e testam em CI.
        </Callout>
      </Section>

      <Section title="crates.io: 150k+ crates e como escolher" accent={accent}>
        <CodeBlock lang="bash">{'# critérios saudáveis ao escolher dependência\n- download count no crates.io\n- última release recente + actividade no repo\n- MSRV declarado + CI verde\n- docs em docs.rs com exemplos\n- feature flags para tirar peso morto\n- audit: cargo audit (CVEs conhecidas) + cargo deny (licenças/dups)'}</CodeBlock>
        <p>
          Ecosistema canônico 2026: <strong>tokio</strong> (async runtime), <strong>serde</strong> (serialização), <strong>reqwest</strong> (HTTP client), <strong>axum</strong> (HTTP server), <strong>sqlx</strong>/<strong>sea-orm</strong>/<strong>diesel</strong> (DB), <strong>clap</strong> (CLI args), <strong>thiserror</strong>/<strong>anyhow</strong> (erros), <strong>tracing</strong> (observabilidade), <strong>criterion</strong> (bench).
        </p>
      </Section>

      <Section title="Perf real: criterion, flamegraph, cachegrind" accent={accent}>
        <CodeBlock lang="rust">{'// benches/parse.rs\nuse criterion::{black_box, criterion_group, criterion_main, Criterion};\n\nfn parse(input: &str) -> u64 { input.parse().unwrap_or(0) }\n\nfn bench_parse(c: &mut Criterion) {\n    c.bench_function("parse u64", |b| {\n        b.iter(|| parse(black_box("9876543210")))\n    });\n}\n\ncriterion_group!(benches, bench_parse);\ncriterion_main!(benches);'}</CodeBlock>
        <CodeBlock lang="bash">{'cargo bench                          # roda, compara com baseline, reporta regressões\ncargo flamegraph --bin app           # flamegraph via perf (Linux)\nvalgrind --tool=cachegrind ./target/release/app  # cache misses, branch prediction'}</CodeBlock>
        <Callout tone="success" icon="📊">
          Regra básica de perf: meça antes de otimizar. criterion dá signal estatístico, flamegraph mostra onde o tempo realmente vai, cachegrind revela hot paths de memória. Perfil primeiro, refactor depois.
        </Callout>
      </Section>

      <Section title="Cross-compile: binário para qualquer lugar" accent={accent}>
        <CodeBlock lang="bash">{'rustup target add aarch64-unknown-linux-musl\ncargo build --release --target aarch64-unknown-linux-musl\n\n# ou via cross (Docker-based, zero setup)\ncargo install cross\ncross build --release --target x86_64-pc-windows-gnu'}</CodeBlock>
        <p>
          Rust compila para ARM, x86, WASM, RISC-V, embedded (no_std). Musl estático permite binário Linux sem libc dinâmica — Docker image final pode ter só o binário (FROM scratch, &lt;10MB).
        </p>
      </Section>
    </ModuleLayout>
  );
}
