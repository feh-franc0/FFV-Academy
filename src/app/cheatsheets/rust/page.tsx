import type { Metadata } from 'next';
import { CheatsheetLayout } from '@/components/CheatsheetLayout';

export const metadata: Metadata = {
  title: 'Cheatsheet Rust essencial — FFV Academy',
  description: 'Rust referência rápida: ownership, borrow rules, lifetimes, traits canônicos, cargo, error handling.',
  keywords: 'cheatsheet rust, rust ownership, rust lifetimes, rust traits, cargo cheat, rust error handling',
};

export default function Page() {
  return (
    <CheatsheetLayout
      title="Rust essencial"
      subtitle="O que você precisa lembrar pra não brigar com o borrow checker."
      accent="#b7410e"
      emoji="🦀"
    >
      <section>
        <h2>Ownership — as 3 regras</h2>
        <pre><code>{`// 1. Cada valor tem UM dono.
// 2. Só pode haver um dono por vez.
// 3. Quando o dono sai de escopo, o valor é dropado.

let s = String::from("olá");   // s é dono
let s2 = s;                     // MOVE — s invalidado, s2 dono
// println!("{}", s);           // compile error: value used after move

let s3 = String::from("ola");
let s4 = s3.clone();            // clone explícito — ambos válidos
println!("{} {}", s3, s4);

// Tipos Copy (i32, bool, char, tuples de Copy): copy, não move.`}</code></pre>
      </section>

      <section>
        <h2>Borrow rules</h2>
        <pre><code>{`// Ou N references imutáveis &T, OU 1 reference mutável &mut T — nunca ambos.

let mut v = vec![1, 2, 3];
let r1 = &v;       // ok
let r2 = &v;       // ok — múltiplas imutáveis
// let r3 = &mut v; // ERRO: mutável enquanto existem imutáveis
println!("{:?} {:?}", r1, r2);

let r3 = &mut v;   // ok agora (r1, r2 não usadas mais)
r3.push(4);

// Dangling reference? Compile error. Rust prova em compile time.`}</code></pre>
      </section>

      <section>
        <h2>Lifetimes</h2>
        <pre><code>{`// Lifetime diz: "essa ref vive pelo menos enquanto X vive".
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}

// Struct com referência precisa anotar lifetime
struct Wrapper<'a> {
    inner: &'a str,
}

// 'static: dura o programa inteiro (string literals)
let s: &'static str = "hello";

// Elision: em muitos casos o compilador deduz. Escrever explícito só quando necessário.`}</code></pre>
      </section>

      <section>
        <h2>Traits canônicos</h2>
        <pre><code>{`#[derive(Debug, Clone, PartialEq, Eq, Hash)]
struct User { id: u64, name: String }

// Debug → {:?} println, Display → {}
impl std::fmt::Display for User {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "User({})", self.name)
    }
}

// From/Into — conversões idiomáticas
impl From<&str> for User {
    fn from(s: &str) -> Self { User { id: 0, name: s.to_string() } }
}
let u: User = "Ana".into();

// Iterator: método mais poderoso da stdlib
let sum: i32 = (1..=10).filter(|n| n % 2 == 0).sum();`}</code></pre>
      </section>

      <section>
        <h2>Error handling</h2>
        <pre><code>{`use std::num::ParseIntError;

fn parse(s: &str) -> Result<i32, ParseIntError> {
    s.parse::<i32>()
}

// ? propaga error
fn double(s: &str) -> Result<i32, ParseIntError> {
    let n = parse(s)?;
    Ok(n * 2)
}

// anyhow para apps, thiserror para libs
// use anyhow::{Result, Context};
// let config = read_file("config.toml").context("failed to read config")?;

// Option::ok_or, Result::map_err convertem entre eles`}</code></pre>
      </section>

      <section>
        <h2>Cargo — comandos que você usa</h2>
        <pre><code>{`cargo new myproj           # bin
cargo new --lib mylib
cargo build                # debug
cargo build --release      # otimizado
cargo run                  # build + run
cargo test                 # unit + integration + doc tests
cargo test -- --nocapture  # mostra println em tests
cargo bench                # benchmarks (nightly ou criterion)
cargo clippy               # linter rigoroso — AMIGO
cargo fmt                  # rustfmt
cargo doc --open           # gera docs HTML
cargo add serde --features derive
cargo update               # atualiza Cargo.lock
cargo tree                 # árvore de deps
cargo expand               # expande macros
cargo clean                # deleta target/`}</code></pre>
      </section>

      <section>
        <h2>Concurrency</h2>
        <pre><code>{`use std::sync::{Arc, Mutex};
use std::thread;

// Arc = Atomic RC (multi-thread). Clone dá mais refs, compartilha dados.
let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];
for _ in 0..10 {
    let c = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        let mut num = c.lock().unwrap();
        *num += 1;
    }));
}
for h in handles { h.join().unwrap(); }

// Async com tokio:
// #[tokio::main] async fn main() { ... }
// let r = tokio::join!(task_a(), task_b());`}</code></pre>
      </section>
    </CheatsheetLayout>
  );
}
