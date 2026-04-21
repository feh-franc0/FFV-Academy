import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('capstone-rust-cli-axum');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que separar lib + CLI + server em crates distintos dentro de um workspace?',
    options: [
      'Mais arquivos é melhor',
      'A lib concentra a lógica de domínio sem I/O; CLI e server são apenas fronts que chamam a lib. Isso permite testar o core isoladamente, reutilizar a mesma lógica em dois transports, publicar a lib no crates.io sem arrastar tokio/axum, e evoluir cada binário independentemente',
      'Cargo exige',
      'Nenhum motivo',
    ],
    correct: 1,
    explanation: 'Hexagonal / ports & adapters aplicado em Rust. Core = lib (puro, testável, sem I/O forte). Adapters = CLI (clap) e server (axum). Troca de HTTP framework, adição de gRPC, exposição via WebSocket — tudo encaixa sem tocar na lib. É a arquitetura que sustenta projetos de 50k+ linhas.',
  },
  {
    question: 'Por que Dockerfile multi-stage com FROM scratch?',
    options: [
      'Só estética',
      'Stage de build tem toolchain Rust + musl + deps (~2GB); stage final copia só o binário estático num FROM scratch (kernel-only). Resultado: imagem &lt;20MB, zero libc dinâmica, superfície de ataque mínima, cold start instantâneo em k8s/lambda',
      'Para ser lento',
      'Docker exige',
    ],
    correct: 1,
    explanation: 'Multi-stage build separa "o que precisa para construir" de "o que precisa para rodar". Rust com target musl gera binário 100% estático (sem glibc). FROM scratch é literalmente zero bytes de SO — só seu binário. Zero deps dinâmicas = zero CVE de libc para se preocupar. k8s adora.',
  },
  {
    question: 'O que diferencia um capstone "portfolio-grade" de um projeto toy?',
    options: [
      'Tamanho',
      'Observabilidade (tracing + métricas), testes em três níveis (unit + integration + e2e), benchmark contínuo com regressão em CI, migrations versionadas, config via env com validação, healthcheck + readiness, build reprodutível, README com decisões arquiteturais justificadas',
      'Muitas linhas',
      'UI bonita',
    ],
    correct: 1,
    explanation: 'Recruiter sênior vê em 3 minutos se você fez projeto real ou tutorial ampliado. Sinais: trace id propagado, métricas Prometheus, migrations SQL versionadas (sqlx migrate), config validada (serde + env), 80%+ coverage, criterion bench em CI comparando PR vs main, README que justifica trade-offs. Isso é o que diferencia júnior de sênior em 2026.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="capstone-rust-cli-axum"
      title="Capstone: CLI + API HTTP com Axum"
      icon="🏁"
      xp={85}
      readTime={20}
      trailName="Rust Profissional"
      trailColor={accent}
      quiz={quiz}
    >
      <Section title="O projeto" accent={accent}>
        <p>
          Construa um <strong>gerenciador de tarefas com API + CLI + Postgres</strong> em um único cargo workspace. Não é TODO toy: é o scaffold mínimo que um serviço real de produção teria — auth JWT, migrations versionadas, tracing, Docker multi-stage, benchmark em CI. Objetivo: peça portfolio que um staff engineer olha e reconhece como "esse cara sabe o que faz".
        </p>
      </Section>

      <Section title="Layout do workspace" accent={accent}>
        <CodeBlock lang="bash">{'ffv-tasks/\n├── Cargo.toml              (workspace root)\n├── crates/\n│   ├── core/               (lib: domínio puro, sem I/O)\n│   │   ├── src/task.rs\n│   │   ├── src/error.rs\n│   │   └── tests/\n│   ├── cli/                (bin: clap subcommands)\n│   │   └── src/main.rs\n│   └── server/             (bin: axum + sqlx + jwt)\n│       ├── src/main.rs\n│       ├── src/auth.rs\n│       ├── src/routes/\n│       └── migrations/\n├── benches/                (criterion)\n├── Dockerfile              (multi-stage)\n├── docker-compose.yml      (postgres local)\n├── .github/workflows/      (CI: test + bench + build)\n└── README.md               (decisões arquiteturais)'}</CodeBlock>
      </Section>

      <Section title="core: domínio puro" accent={accent}>
        <CodeBlock lang="rust">{'// crates/core/src/task.rs\nuse serde::{Serialize, Deserialize};\nuse uuid::Uuid;\nuse time::OffsetDateTime;\n\n#[derive(Debug, Clone, Serialize, Deserialize)]\npub struct Task {\n    pub id: Uuid,\n    pub title: String,\n    pub done: bool,\n    pub created_at: OffsetDateTime,\n}\n\nimpl Task {\n    pub fn new(title: impl Into<String>) -> Self {\n        Self { id: Uuid::new_v4(), title: title.into(), done: false, created_at: OffsetDateTime::now_utc() }\n    }\n    pub fn complete(&mut self) { self.done = true; }\n}'}</CodeBlock>
      </Section>

      <Section title="cli: clap com subcommands" accent={accent}>
        <CodeBlock lang="rust">{'// crates/cli/src/main.rs\nuse clap::{Parser, Subcommand};\n\n#[derive(Parser)]\n#[command(version, about = "FFV Tasks CLI")]\nstruct Cli { #[command(subcommand)] cmd: Cmd }\n\n#[derive(Subcommand)]\nenum Cmd {\n    Add { title: String },\n    List,\n    Done { id: String },\n}\n\nfn main() -> anyhow::Result<()> {\n    let cli = Cli::parse();\n    match cli.cmd {\n        Cmd::Add { title } => { let t = core::Task::new(title); println!("{}", serde_json::to_string(&t)?); }\n        Cmd::List => { /* chama API via reqwest */ }\n        Cmd::Done { id } => { /* PATCH /tasks/:id */ }\n    }\n    Ok(())\n}'}</CodeBlock>
      </Section>

      <Section title="server: axum + sqlx + jwt" accent={accent}>
        <CodeBlock lang="rust">{'// crates/server/src/main.rs\nuse axum::{Router, routing::{get, post}, extract::{State, Path}, Json};\nuse sqlx::PgPool;\nuse std::sync::Arc;\n\n#[derive(Clone)]\nstruct AppState { db: PgPool, jwt_secret: Arc<String> }\n\nasync fn list_tasks(State(s): State<AppState>) -> Json<Vec<core::Task>> {\n    let rows = sqlx::query_as::<_, core::Task>("SELECT id, title, done, created_at FROM tasks ORDER BY created_at DESC")\n        .fetch_all(&s.db).await.unwrap();\n    Json(rows)\n}\n\n#[tokio::main]\nasync fn main() -> anyhow::Result<()> {\n    tracing_subscriber::fmt::init();\n    let db = PgPool::connect(&std::env::var("DATABASE_URL")?).await?;\n    sqlx::migrate!("./migrations").run(&db).await?;\n\n    let state = AppState { db, jwt_secret: Arc::new(std::env::var("JWT_SECRET")?) };\n    let app = Router::new()\n        .route("/health", get(|| async { "ok" }))\n        .route("/tasks", get(list_tasks).post(create_task))\n        .route("/tasks/:id", get(get_task).patch(update_task))\n        .with_state(state);\n\n    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await?;\n    axum::serve(listener, app).await?;\n    Ok(())\n}\n\nasync fn create_task() {}\nasync fn get_task(Path(_id): Path<String>) {}\nasync fn update_task(Path(_id): Path<String>) {}'}</CodeBlock>
      </Section>

      <Section title="Migrations versionadas com sqlx" accent={accent}>
        <CodeBlock lang="bash">{'# crates/server/migrations/20260101000000_init.sql\nCREATE TABLE tasks (\n  id          UUID PRIMARY KEY,\n  title       TEXT NOT NULL,\n  done        BOOLEAN NOT NULL DEFAULT FALSE,\n  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()\n);\nCREATE INDEX idx_tasks_created_at ON tasks(created_at DESC);\n\n# sqlx-cli\ncargo install sqlx-cli\nsqlx migrate add init\nsqlx migrate run   # aplica\nsqlx migrate info  # status'}</CodeBlock>
      </Section>

      <Section title="Dockerfile multi-stage (&lt;20MB final)" accent={accent}>
        <CodeBlock lang="bash">{'# ---- stage 1: build ----\nFROM rust:1.78-alpine AS builder\nRUN apk add --no-cache musl-dev\nWORKDIR /build\nCOPY . .\nRUN cargo build --release --target x86_64-unknown-linux-musl --bin server\n\n# ---- stage 2: runtime ----\nFROM scratch\nCOPY --from=builder /build/target/x86_64-unknown-linux-musl/release/server /server\nEXPOSE 3000\nENTRYPOINT ["/server"]\n\n# build: docker build -t ffv-tasks .\n# imagem final: ~12MB, zero deps dinâmicas, zero shell, zero CVE de userland'}</CodeBlock>
      </Section>

      <Section title="CI: test + bench + regression" accent={accent}>
        <CodeBlock lang="bash">{'# .github/workflows/ci.yml\nname: ci\non: [push, pull_request]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    services:\n      postgres:\n        image: postgres:16\n        env: { POSTGRES_PASSWORD: test }\n        ports: ["5432:5432"]\n    steps:\n      - uses: actions/checkout@v4\n      - uses: dtolnay/rust-toolchain@stable\n      - run: cargo clippy -- -D warnings\n      - run: cargo fmt --check\n      - run: cargo test --workspace\n      - run: cargo bench --no-fail-fast -- --save-baseline pr\n      # compare com baseline main, falhe se regressão > 10%'}</CodeBlock>
      </Section>

      <Section title="Entregáveis finais do capstone" accent={accent}>
        <Callout tone="success" icon="🏁">
          Repo público com: (1) workspace core + cli + server, (2) migrations sqlx, (3) JWT auth real, (4) Dockerfile multi-stage com imagem &lt;20MB, (5) tracing + métricas Prometheus, (6) criterion bench em benches/, (7) CI completo (clippy + fmt + test + bench), (8) README com diagrama de arquitetura e trade-offs, (9) CHANGELOG.md e LICENSE. Deploy opcional em Fly.io/Railway para link vivo.
        </Callout>
        <Callout tone="info" icon="🎯">
          Esse é o nível que recruiter sênior olha e pensa "esse dev está pronto pra sistema real". Combina Rust idiomático, arquitetura hexagonal, observabilidade e DevOps moderno — sinal de staff engineer em 2026.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
