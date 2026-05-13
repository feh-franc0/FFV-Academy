import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock } from '@/components/article/primitives';

export const metadata = getModuleMetadata('unsafe-ffi-interop');
const accent = '#b7410e';

const quiz: QuizQuestion[] = [
  {
    question: 'O que exatamente unsafe desliga?',
    options: [
      'Todas as verificações',
      'Apenas 5 superpoderes específicos: deref raw pointer, chamar unsafe fn, acessar/modificar mutable static, implementar unsafe trait, acessar campo de union. Borrow checker, type checker, lifetimes continuam ativos. Unsafe NÃO é "modo C" — é "eu prometo manualmente este contrato que o compilador não consegue verificar"',
      'Tudo, vira C',
      'Só o borrow checker',
    ],
    correct: 1,
    explanation: 'Erro comum: achar que unsafe é escapatória geral. Não é. São 5 operações específicas desbloqueadas, e mesmo dentro do bloco você continua sujeito a type system, ownership, lifetimes. O que muda: certas responsabilidades de soundness passam de compilador para programador. Você deve documentar o invariante em // SAFETY: comment.',
  },
  {
    question: 'Quando usar FFI (extern "C")?',
    options: [
      'Sempre que possível',
      'Quando precisa interoperar com lib existente em C/C++ (libjpeg, sqlite, ffmpeg), expor Rust para outras linguagens (Python via pyo3, Node via napi-rs, Swift/Kotlin), ou integrar com SDK do SO. ABI "C" é o mínimo denominador comum estável entre linguagens',
      'Quando quer aprender C',
      'Nunca',
    ],
    correct: 1,
    explanation: 'FFI = Foreign Function Interface. extern "C" define ABI estável. bindgen gera bindings Rust automaticamente a partir de headers C. O padrão moderno: escrever core em Rust, expor via extern "C" + header C, consumir em Python/Node/Swift. É exatamente como tokenizers (HF), polars, pydantic-core funcionam.',
  },
  {
    question: 'Para que serve Miri?',
    options: [
      'Nada',
      'Interpretador MIR que detecta undefined behavior em tempo de execução de testes: uso de memória não-inicializada, violação de alignment, aliasing UB, out-of-bounds em raw pointer. Essencial para validar blocos unsafe. Roda em cargo +nightly miri test',
      'Um debugger',
      'Um compilador alternativo',
    ],
    correct: 1,
    explanation: 'Miri simula o MIR com checks de soundness que o compilador otimizado não pode fazer (seria caro em prod). Em código unsafe, é a melhor defesa contra UB silencioso. Bibliotecas sérias (stdlib, tokio, crossbeam) rodam seus test suites sob Miri em CI.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="unsafe-ffi-interop"
      title="Unsafe com responsabilidade + FFI"
      icon="⚠️"
      xp={55}
      readTime={13}
      trailName="Rust Profissional"
      trailColor={accent}
      nextSlug="cargo-ecosystem-perf"
      nextTitle="Cargo, crates.io, perf real + versões"
      quiz={quiz}
    >
      <Section title="Unsafe é contrato, não escapatória" accent={accent}>
        <p>
          A palavra <code>unsafe</code> confunde iniciantes. Não é "desliga todo o safety". É um marcador explícito: aqui existem invariantes que o compilador não consegue verificar sozinho e que o programador promete manter. Dentro do bloco, borrow checker, tipos, lifetimes continuam ativos. O que muda: cinco superpoderes específicos ficam disponíveis.
        </p>
        <CodeBlock lang="rust">{'// Os 5 superpoderes de unsafe\n// 1. Dereferenciar raw pointer (*const T, *mut T)\n// 2. Chamar fn marcada unsafe\n// 3. Acessar ou modificar static mut\n// 4. Implementar unsafe trait (Send, Sync em tipos custom)\n// 5. Acessar campo de union\n\nlet mut x = 10;\nlet p: *mut i32 = &mut x;\nunsafe {\n    *p = 42;           // deref de raw pointer\n}\nassert_eq!(x, 42);'}</CodeBlock>
      </Section>

      <Section title="Toda função unsafe pede SAFETY comment" accent={accent}>
        <CodeBlock lang="rust">{'/// Lê um u32 pequeno-endian de um ponteiro\n///\n/// # Safety\n/// - `ptr` deve ser válido para leitura de 4 bytes\n/// - `ptr` deve estar alinhado em 4 bytes\n/// - Os 4 bytes não podem ser mutados por outra thread durante a leitura\nunsafe fn read_u32_le(ptr: *const u8) -> u32 {\n    let bytes = std::ptr::read_unaligned(ptr as *const [u8; 4]);\n    u32::from_le_bytes(bytes)\n}\n\nfn caller() {\n    let buf = [0x01, 0x00, 0x00, 0x00];\n    // SAFETY: buf é válido por 4 bytes, vive pelo escopo, não há outra thread\n    let v = unsafe { read_u32_le(buf.as_ptr()) };\n    assert_eq!(v, 1);\n}'}</CodeBlock>
        <Callout tone="info" icon="💡">
          Toda chamada a unsafe fn ou todo bloco unsafe merece um comentário // SAFETY: que documenta POR QUE aquele código respeita o contrato. É a forma de tornar auditável.
        </Callout>
      </Section>

      <Section title={'FFI: extern "C" para interoperar'} accent={accent}>
        <CodeBlock lang="rust">{'// Chamar libc do sistema\nextern "C" {\n    fn abs(input: i32) -> i32;\n}\n\nfn main() {\n    unsafe {\n        println!("abs(-5) = {}", abs(-5));\n    }\n}\n\n// Expor uma função Rust com ABI C (consumível de C, Python, Node...)\n#[no_mangle]\npub extern "C" fn fibonacci(n: u32) -> u64 {\n    match n {\n        0 => 0,\n        1 => 1,\n        _ => {\n            let (mut a, mut b) = (0u64, 1u64);\n            for _ in 2..=n { let t = a + b; a = b; b = t; }\n            b\n        }\n    }\n}'}</CodeBlock>
      </Section>

      <Section title="bindgen: gerar bindings de .h automaticamente" accent={accent}>
        <CodeBlock lang="toml">{'# Cargo.toml\n[build-dependencies]\nbindgen = "0.69"\n\n# build.rs gera src/bindings.rs a partir de header.h\n# bindgen::Builder::default().header("wrapper.h").generate()?.write_to_file("src/bindings.rs")?'}</CodeBlock>
        <p>
          bindgen lê headers C/C++ e gera os <code>extern &quot;C&quot;</code> + structs equivalentes automaticamente. É como você consome libjpeg, sqlite, ffmpeg, CUDA SDK a partir de Rust sem escrever cada assinatura manualmente.
        </p>
      </Section>

      <Section title="pyo3: expor Rust para Python" accent={accent}>
        <CodeBlock lang="rust">{'use pyo3::prelude::*;\n\n#[pyfunction]\nfn tokenize(text: &str) -> Vec<String> {\n    text.split_whitespace().map(String::from).collect()\n}\n\n#[pymodule]\nfn fast_tokenizer(_py: Python, m: &PyModule) -> PyResult<()> {\n    m.add_function(wrap_pyfunction!(tokenize, m)?)?;\n    Ok(())\n}\n\n// build com maturin: maturin develop\n// no Python:\n// >>> import fast_tokenizer\n// >>> fast_tokenizer.tokenize("olá mundo")\n// [\'olá\', \'mundo\']'}</CodeBlock>
        <Callout tone="success" icon="🔬">
          Esse é o padrão que faz tokenizers (HuggingFace), pydantic-core e polars funcionarem. Core crítico em Rust + API pythônica. Performance de C, segurança de Rust, ergonomia de Python.
        </Callout>
      </Section>

      <Section title="napi-rs: expor Rust para Node.js" accent={accent}>
        <CodeBlock lang="rust">{'use napi_derive::napi;\n\n#[napi]\npub fn sum(a: i32, b: i32) -> i32 { a + b }\n\n#[napi]\nasync fn fetch_status(url: String) -> napi::Result<String> {\n    let r = reqwest::get(&url).await.map_err(|e| napi::Error::from_reason(e.to_string()))?;\n    Ok(r.status().to_string())\n}\n\n// build com @napi-rs/cli: napi build\n// no Node:\n// const { sum, fetchStatus } = require(\'./index.node\');\n// console.log(sum(2, 3)); // 5'}</CodeBlock>
      </Section>

      <Section title="Miri: detector de UB em testes" accent={accent}>
        <CodeBlock lang="bash">{'# instalar\nrustup +nightly component add miri\n\n# rodar teste sob o interpretador MIR\ncargo +nightly miri test\n\n# Miri detecta: uso de memória não-inicializada, aliasing UB (Stacked Borrows),\n# out-of-bounds em raw pointer, data race em Sync, alignment errado.'}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Se você escreveu unsafe, rodar Miri no test suite não é opcional — é o que separa biblioteca sound de bomba-relógio. Crates sérias (tokio, crossbeam, bytes) passam Miri em CI.
        </Callout>
      </Section>
    </ModuleLayout>
  );
}
