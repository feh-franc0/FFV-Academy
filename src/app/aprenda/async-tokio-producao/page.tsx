import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('async-tokio-producao');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que async fn desugar vira de verdade?',
    options: [
      'Uma thread nova',
      'Uma state machine que implementa Future — cada await é um ponto de suspensão onde o compilador salva o estado local no heap (uma vez, na primeira poll). O executor (tokio) chama poll() quando o recurso está pronto. Zero-cost: sem thread extra, sem alocação por suspensão',
      'Uma callback JS',
      'Uma promise',
    ],
    correct: 1,
    explanation: 'async desugar é compile-time: o compilador gera uma enum com variants para cada await point + dados locais. O executor move por essas variants via poll(). Isso difere fundamentalmente de callback hell e de goroutines — você paga uma stack-alocação para o future inteiro, não uma stack-per-task.',
  },
  {
    question: 'Qual a diferença entre tokio multi-thread e current-thread runtime?',
    options: [
      'Nenhuma',
      'multi-thread distribui tasks em N worker threads com work-stealing (default, bom para servers com CPU disponível); current-thread roda tudo em 1 thread (útil para embedded, CLIs, ou quando você já faz sharding manual). Tasks em multi-thread precisam ser Send; em current-thread podem ser !Send',
      'Current-thread é mais rápido sempre',
      'Multi-thread não existe',
    ],
    correct: 1,
    explanation: 'Escolha com critério: servers de alto throughput pedem multi-thread + spawn; CLIs ou code que pinga dados não-Send (Rc, RefCell) pedem current-thread. A restrição Send existe porque uma task pode migrar entre threads — se ela guarda Rc<T> (não thread-safe), o tipo é rejeitado.',
  },
  {
    question: 'Quando usar join! vs select! vs spawn?',
    options: [
      'São sinônimos',
      'join! espera TODAS as futures terminarem (paralelo, mesmo task); select! espera a PRIMEIRA terminar (race, útil para timeout); spawn dispara task INDEPENDENTE (fire-and-forget, roda em outra task com seu próprio agendamento)',
      'spawn é síncrono',
      'join! é serial',
    ],
    correct: 1,
    explanation: 'join!/try_join! roda futures concorrentemente na MESMA task (sem overhead de spawn). select! é essencial para timeout, cancellation, first-to-finish. spawn é quando você quer vida independente — request handler, background worker. Usar errado = perder paralelismo ou vazar tasks.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="async-tokio-producao"
      title="Async Rust + tokio em produção"
      icon="⚡"
      xp={65}
      readTime={15}
      trailName="Rust Profissional"
      trailColor={accent}
      nextSlug="macros-rust"
      nextTitle="Macros declarativos e procedurais"
      quiz={quiz}
    >
      <Section title="Futures são state machines, não threads" accent={accent}>
        <p>
          Em Rust, async não é thread, não é callback, não é promise. async fn desugar em uma struct que implementa <code>Future</code> — uma state machine enumerada onde cada <code>.await</code> é um estado de suspensão. O executor (tokio, async-std, smol) chama <code>poll()</code> até retornar <code>Poll::Ready</code>. Zero thread por task, zero alocação por suspensão.
        </p>
        <CodeBlock lang="rust">{'// você escreve assim:\nasync fn fetch(url: &str) -> String {\n    let r = reqwest::get(url).await.unwrap();\n    r.text().await.unwrap()\n}\n\n// compilador gera (conceitualmente):\n// enum FetchFuture {\n//   Start { url: &str },\n//   WaitingResponse { fut: ReqwestFut },\n//   WaitingBody      { fut: TextFut },\n//   Done,\n// }\n// impl Future for FetchFuture { fn poll(...) -> Poll<String> { ... } }'}</CodeBlock>
      </Section>

      <Section title="Tokio: o runtime de facto" accent={accent}>
        <CodeBlock lang="rust">{'// Cargo.toml\n// [dependencies]\n// tokio = { version = "1", features = ["full"] }\n\n#[tokio::main]\nasync fn main() {\n    let r = fetch("https://api.exemplo.com/status").await;\n    println!("{}", r);\n}\n\n// current-thread (CLIs, embedded)\n#[tokio::main(flavor = "current_thread")]\nasync fn cli_main() { /* ... */ }'}</CodeBlock>
        <p>
          Tokio multi-thread é work-stealing: N workers (default = num_cpus) compartilham uma fila global + filas locais. Task pode migrar entre workers (por isso precisa ser <code>Send + &apos;static</code> quando usa spawn).
        </p>
      </Section>

      <Section title="join!, select!, spawn — concorrência correta" accent={accent}>
        <CodeBlock lang="rust">{'use tokio::{join, select, time::{sleep, Duration}};\n\nasync fn request_a() -> u32 { sleep(Duration::from_millis(200)).await; 1 }\nasync fn request_b() -> u32 { sleep(Duration::from_millis(300)).await; 2 }\n\n#[tokio::main]\nasync fn main() {\n    // join!: ambas em paralelo, mesmo task — total ~300ms, não 500ms\n    let (a, b) = join!(request_a(), request_b());\n    println!("join: {} {}", a, b);\n\n    // select!: primeira a responder ganha (race / timeout)\n    select! {\n        r = request_a() => println!("a ganhou: {}", r),\n        r = request_b() => println!("b ganhou: {}", r),\n        _ = sleep(Duration::from_millis(100)) => println!("timeout"),\n    }\n\n    // spawn: fire-and-forget, nova task independente\n    let handle = tokio::spawn(async { request_a().await });\n    let v = handle.await.unwrap();\n    println!("spawn: {}", v);\n}'}</CodeBlock>
      </Section>

      <Section title="Axum: server HTTP em produção" accent={accent}>
        <CodeBlock lang="rust">{'use axum::{Router, routing::get, extract::State, Json};\nuse serde::Serialize;\nuse std::sync::Arc;\n\n#[derive(Clone)]\nstruct AppState { version: &\'static str }\n\n#[derive(Serialize)]\nstruct Health { ok: bool, version: String }\n\nasync fn health(State(s): State<Arc<AppState>>) -> Json<Health> {\n    Json(Health { ok: true, version: s.version.to_string() })\n}\n\n#[tokio::main]\nasync fn main() {\n    let state = Arc::new(AppState { version: "1.0.0" });\n    let app = Router::new()\n        .route("/health", get(health))\n        .with_state(state);\n\n    let listener = tokio::net::TcpListener::bind("0.0.0.0:3000").await.unwrap();\n    axum::serve(listener, app).await.unwrap();\n}'}</CodeBlock>
        <Callout tone="success" icon="✅">
          Axum é a stack HTTP padrão Rust em 2026: baseada em tower (middleware), hyper (http core), tokio (runtime). Typed extractors dão compile-time safety em handlers. Sem Spring, sem Express — types fazem o trabalho.
        </Callout>
      </Section>

      <Section title="Backpressure e structured concurrency" accent={accent}>
        <CodeBlock lang="rust">{'// canais mpsc com buffer fixo = backpressure automático\nuse tokio::sync::mpsc;\n\n#[tokio::main]\nasync fn main() {\n    let (tx, mut rx) = mpsc::channel::<u32>(100); // buffer 100\n\n    // producer roda mais rápido que consumer? send().await bloqueia\n    tokio::spawn(async move {\n        for i in 0..10_000 {\n            tx.send(i).await.unwrap(); // aplica backpressure\n        }\n    });\n\n    while let Some(v) = rx.recv().await {\n        processar(v).await;\n    }\n}\nasync fn processar(_v: u32) { /* trabalho lento */ }'}</CodeBlock>
        <Callout tone="info" icon="💡">
          Structured concurrency em Rust ainda é pattern emergente (crate <code>tokio-util::task::JoinSet</code>, <code>futures::stream::FuturesUnordered</code>). A ideia: tasks filhas não sobrevivem ao escopo do pai — diferente de spawn solto, que pode vazar.
        </Callout>
      </Section>

      <Section title="Armadilhas comuns em produção" accent={accent}>
        <Callout tone="warn" icon="⚠️">
          <strong>Blocking dentro de async fn.</strong> Chamar <code>std::fs::read</code> ou <code>std::thread::sleep</code> dentro de uma task async trava o worker inteiro. Use <code>tokio::fs</code>, <code>tokio::time::sleep</code>, ou envolva com <code>tokio::task::spawn_blocking</code> quando for CPU-bound.
        </Callout>
        <Callout tone="danger" icon="🚨">
          <strong>Cancel-safety.</strong> Quando você cancela um future (select! que escolheu outro branch, timeout), o future é dropado no meio. Certifique-se que seus futures são cancel-safe — não deixar lock pendurado, não metade de escrita em arquivo.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
