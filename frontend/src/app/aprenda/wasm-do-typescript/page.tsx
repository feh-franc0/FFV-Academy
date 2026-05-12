import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  KeyValue,
  FlowDiagram,
  Timeline,
  DecisionBox,
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('wasm-do-typescript');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Quando WebAssembly é uma vitória clara sobre JavaScript otimizado?',
    options: [
      'Sempre — WASM é mais rápido que JS',
      'Em CPU-bound, deterministic, hot code com tipos numéricos: image filters, codecs, crypto, físicas, parsers, ML inference. Para código “normal” (DOM, async I/O), JS otimizado pelo V8 frequentemente bate WASM',
      'Em código que precisa muito acesso ao DOM',
      'Em handlers de evento UI',
    ],
    correct: 1,
    explanation:
      'WASM brilha onde JS sofre: aritmética intensa, sem GC pressure, memória linear que cabe em CPU caches. Lin Clark (Mozilla) e Surma têm benchmarks mostrando casos: Photoshop Web (compute-heavy), Figma (renderização de vetores), AutoCAD Web. Para 90% de “websites”, JS é o caminho certo. WASM tem overhead de chamada JS↔WASM e cópia para passar dados.',
  },
  {
    question: 'Como Rust+wasm-bindgen passa objetos complexos entre JS e WASM?',
    options: [
      'Compartilha memória diretamente como ponteiro',
      'wasm-bindgen gera glue JS que serializa/desserializa entre tipos JS e Rust via memória linear compartilhada. Strings, objects, Vec, etc. funcionam transparentemente. Para grandes dados (Uint8Array), usa view direto sem copy',
      'Apenas tipos primitivos podem cruzar a fronteira',
      'Usa JSON.stringify automaticamente',
    ],
    correct: 1,
    explanation:
      'wasm-bindgen é o ponto-chave do Rust→Web. Gera bindings que escondem o boilerplate: você anota funções com #[wasm_bindgen] e usa do JS como funções normais. wasm-pack empacota tudo. Para 100MB de dados, evite cópia: aloque dentro do WASM e exponha como Uint8Array (view de wasm.memory.buffer).',
  },
  {
    question: 'TinyGo vs Go oficial para WASM — qual a diferença?',
    options: [
      'TinyGo é mais antigo',
      'Go oficial gera ~2MB de WASM para um hello world (runtime+GC inteiros). TinyGo (baseado em LLVM) gera ~30KB, mais rápido para iniciar, ideal para edge functions. Trade-off: TinyGo suporta subset menor de pacotes stdlib',
      'TinyGo só funciona em embedded',
      'São idênticos, marca registrada',
    ],
    correct: 1,
    explanation:
      'Go oficial empacota runtime + GC + reflection — bom para apps complexas, ruim para edge. TinyGo usa LLVM backend, sem reflection completo, GC simplificado. Cloudflare Workers, Fastly Compute@Edge usam TinyGo+WASI. Trade-off: alguns pacotes (encoding/json complexo, net) não funcionam ou têm versões alternativas.',
  },
  {
    question: 'O que WASI traz que WASM “base” não tem?',
    options: [
      'Suporte a TypeScript',
      'WebAssembly System Interface — POSIX-like APIs (file I/O, env vars, clock, args) para WASM rodar fora do browser de forma portável. Permite mesma binary rodar em Node/Bun/Deno/Cloudflare Workers/Wasmer',
      'Suporte a CSS',
      'Apenas um marketing rename do WASM',
    ],
    correct: 1,
    explanation:
      'WASM “base” não tem syscalls — é puramente compute. WASI define interface padrão para que runtimes server-side ofereçam capabilities (file read, network, env). Componentização nova (WASI 0.2, 2024) com Component Model permite módulos WASM se interconectarem com interfaces tipadas (WIT). Ver wasi.dev e bytecodealliance.org.',
  },
  {
    question: 'Por que Figma escolheu WASM em 2017?',
    options: [
      'Por causa do Chrome ter melhor suporte',
      'Renderização vetorial em tempo real de canvases gigantes (centenas de objetos editáveis) precisava de performance de C++. Antes era asm.js (precursor). WASM trouxe binary mais compacto, parse instantâneo, mesma performance. Eric Bidelman e Evan Wallace publicaram o detalhamento técnico',
      'Por exigência de patente do Sketch',
      'Para suportar plugins JavaScript',
    ],
    correct: 1,
    explanation:
      'Figma virou case-study canônico. Engine de renderização escrita em C++ compilada para WASM. Editor JS chama em milhões de operações por segundo. Evan Wallace (cofounder, autor do esbuild) escreveu o post seminal em figma.com/blog. AutoCAD Web seguiu padrão similar (compilou code-base C++ legacy). Photoshop Web (2023) idem.',
  },
  {
    question: 'Para um time TypeScript que quer ganhar perf em hot path, qual escolha tem MELHOR custo/benefício em 2026?',
    options: [
      'Reescrever tudo em Rust com wasm-bindgen',
      'Identificar HOT functions específicas via profiling, reescrever só elas em Rust ou AssemblyScript, manter resto do code-base em TS. Adopt incremental, valida ganho real',
      'Migrar tudo para C++ por consistência com Figma',
      'Reescrever em Go com TinyGo',
    ],
    correct: 1,
    explanation:
      'Migração total quase sempre falha. Padrão correto: profile → identifique hot function (ex: parsing JSON gigante, filtro de imagem, hash) → reescreva ela em Rust+wasm-bindgen → exponha como módulo → consuma do TS. Valide ganho real (frequentemente é menor que esperado por overhead de cruzar fronteira). AssemblyScript é alternativa para times sem expertise Rust — sintaxe TS-like.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="wasm-do-typescript"
      title="WebAssembly do dev TypeScript: Rust, Go, AssemblyScript"
      icon="🦀"
      xp={70}
      readTime={14}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="webgpu-fundamentos"
      nextTitle="WebGPU: a sucessão de WebGL, GPU compute no browser"
      quiz={quiz}
    >
      <Content />
    </ModuleLayout>
  );
}

function Content() {
  return (
    <div className="flex flex-col gap-8 text-sm leading-7">
      <p className="text-base leading-8" style={{ color: 'var(--ffv-muted)' }}>
        WebAssembly não vai matar JavaScript — mas resolve casos em que o V8, mesmo perfeito,
        bate no teto: aritmética intensa sem GC pressure, parsers tipados, criptografia,
        codecs, ML inference local. Para um dev TS que quer ganhar performance específica, o
        caminho é Rust + wasm-bindgen, AssemblyScript ou TinyGo — cada um com seu trade-off.
      </p>

      <Section title="O que WASM realmente é" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Binary format', v: '.wasm — bytecode compacto, parseado em ms (~30× JS parsing)' },
            { k: 'Stack machine', v: 'Instruções operam em stack tipado, sem registers' },
            { k: 'Linear memory', v: 'ArrayBuffer único, sem GC, mutável em JS' },
            { k: 'Sandbox', v: 'Sem syscalls por default. Browser controla capacidades' },
            { k: 'Portable', v: 'Compila Rust/C/Go/AssemblyScript/Zig → mesma .wasm' },
            { k: 'Performance', v: 'Próximo de native em CPU-bound; perde para JS em DOM-heavy' },
          ]}
        />
        <Callout tone="info" icon="📚">
          Spec: <InlineCode>webassembly.github.io/spec</InlineCode>. Excelente tour: “WebAssembly:
          a new world of native exploits on the browser” (não, leia o oficial:{' '}
          <InlineCode>webassembly.org/docs/high-level-goals</InlineCode>). Para arquitetura de
          implementação: Lin Clark “Cartoon Intro to WebAssembly”
          (hacks.mozilla.org/2017/02/a-cartoon-intro-to-webassembly).
        </Callout>
      </Section>

      <Section title="Rust + wasm-bindgen — o caminho dominante" accent={ACCENT}>
        <CodeBlock lang="bash" filename="setup.sh">{`# Pré-requisitos
rustup target add wasm32-unknown-unknown
cargo install wasm-pack

# Criar lib
cargo new --lib my-wasm-lib
cd my-wasm-lib

# Cargo.toml
# [lib]
# crate-type = ["cdylib"]
# [dependencies]
# wasm-bindgen = "0.2"

# Build para web
wasm-pack build --target web
# Gera pkg/ com .wasm + .js glue + .d.ts`}</CodeBlock>
        <CodeBlock lang="rust" filename="src/lib.rs">{`use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub fn fibonacci(n: u32) -> u32 {
    if n <= 1 { n } else { fibonacci(n-1) + fibonacci(n-2) }
}

#[wasm_bindgen]
pub fn process_image(pixels: &mut [u8], width: u32, height: u32) {
    // grayscale in-place — recebe Uint8Array view, modifica direto
    for chunk in pixels.chunks_exact_mut(4) {
        let r = chunk[0] as u32;
        let g = chunk[1] as u32;
        let b = chunk[2] as u32;
        let gray = ((r * 299 + g * 587 + b * 114) / 1000) as u8;
        chunk[0] = gray; chunk[1] = gray; chunk[2] = gray;
    }
}

#[wasm_bindgen]
pub struct Engine {
    state: Vec<f32>,
}

#[wasm_bindgen]
impl Engine {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Engine { Engine { state: Vec::with_capacity(1000) } }

    pub fn add(&mut self, v: f32) { self.state.push(v); }
    pub fn sum(&self) -> f32 { self.state.iter().sum() }
}`}</CodeBlock>
        <CodeBlock lang="typescript" filename="app.ts">{`// Consumir no TS — wasm-pack já gerou .d.ts!
import init, { fibonacci, process_image, Engine } from './pkg/my_wasm_lib';

await init();  // baixa e instancia .wasm

console.log(fibonacci(40));  // CPU-bound — bate JS aqui

// Processar imagem sem copy
const canvas = document.querySelector('canvas')!;
const ctx = canvas.getContext('2d')!;
const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
process_image(imageData.data, canvas.width, canvas.height);  // mutação in-place
ctx.putImageData(imageData, 0, 0);

// Classe Rust-side
const engine = new Engine();
engine.add(1.5);
engine.add(2.7);
console.log(engine.sum());`}</CodeBlock>
      </Section>

      <Section title="AssemblyScript — TS-like para quem não quer Rust" accent={ACCENT}>
        <p>
          AssemblyScript é um subset estrito de TypeScript que compila direto para WASM.
          Sintaxe familiar, sem precisar aprender Rust/ownership.
        </p>
        <CodeBlock lang="typescript" filename="assembly/index.ts">{`// AssemblyScript — parece TS mas tipos são todos estáticos
export function fibonacci(n: i32): i32 {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

export function sumArray(ptr: usize, len: i32): f64 {
  let total: f64 = 0;
  for (let i = 0; i < len; i++) {
    total += load<f64>(ptr + (i * 8) as usize);
  }
  return total;
}`}</CodeBlock>
        <Callout tone="tip" icon="💡">
          AssemblyScript é ótimo para times sem expertise em Rust/C. Trade-off: comunidade
          menor, GC próprio (não Rust ownership), performance ligeiramente inferior a
          Rust+wasm-bindgen. Ver <InlineCode>assemblyscript.org</InlineCode>.
        </Callout>
      </Section>

      <Section title="Go com TinyGo" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['', 'Go oficial', 'TinyGo']}
          rows={[
            ['Tamanho .wasm', '~2MB (runtime + GC inteiros)', '~30KB (stripped LLVM)'],
            ['Compile speed', 'Rápido', 'Mais lento (LLVM)'],
            ['Stdlib', 'Completa', 'Subset (encoding/json sim, mas net limitado)'],
            ['Use case', 'Apps grandes Go já existentes', 'Edge functions, microserviços leves'],
            ['Edge runtimes', 'Pesado', 'Cloudflare Workers, Fastly Compute@Edge usam TinyGo'],
          ]}
        />
        <CodeBlock lang="bash" filename="tinygo-build.sh">{`# Instalar TinyGo
brew install tinygo  # ou conforme OS

# Compilar Go → WASM
tinygo build -o app.wasm -target wasm ./main.go

# Para servir: incluir wasm_exec.js do TinyGo (não do Go oficial!)`}</CodeBlock>
      </Section>

      <Section title="Casos reais que viraram canônicos" accent={ACCENT}>
        <StackFlow
          title="WASM em produção (2018→2026)"
          accent={ACCENT}
          items={[
            {
              icon: '🎨',
              label: 'Figma',
              sub: '2017',
              detail: 'Pioneiro. Editor JS, render engine C++→WASM. Performance de Sketch desktop no browser. Evan Wallace publicou detalhamento técnico no blog da Figma.',
            },
            {
              icon: '📐',
              label: 'AutoCAD Web',
              sub: '2018',
              detail: 'Codebase C++ de 35+ anos compilado para WASM. Permitiu trazer DWG editor para o browser sem reescrita.',
            },
            {
              icon: '🖼️',
              label: 'Photoshop Web',
              sub: '2023',
              detail: 'Adobe trouxe Photoshop para o browser via WASM (com WebGPU para filtros). Live em photoshop.adobe.com.',
            },
            {
              icon: '🎮',
              label: 'Unity / Unreal',
              sub: 'Ongoing',
              detail: 'Engines de jogos compilam para WASM via Emscripten. Microsoft Flight Simulator demo em 2023 rodou no browser.',
            },
            {
              icon: '🤖',
              label: 'transformers.js / ONNX Runtime Web',
              sub: '2023→',
              detail: 'ML inference local no browser. BERT, Whisper, embedding models. WASM SIMD + WebGPU para acelerar matmuls.',
            },
          ]}
        />
      </Section>

      <Section title="Timeline WASM" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: '2013', label: 'asm.js (Mozilla)', detail: 'Subset de JS otimizável a velocidade native. Precursor do WASM.' },
            { when: '2017', label: 'WASM MVP', detail: 'Suporte em todos os browsers majores. Compilação Rust/C/C++ via Emscripten/wasm-bindgen.', highlight: true },
            { when: '2019', label: 'WASI 0.1', detail: 'WebAssembly System Interface — POSIX-like para rodar fora do browser.' },
            { when: '2020', label: 'SIMD', detail: 'Vector instructions para acelerar matmuls, image processing.' },
            { when: '2022', label: 'Threads (atomics)', detail: 'Shared memory entre módulos. Requer COOP/COEP.' },
            { when: '2024', label: 'WASI 0.2 + Component Model', detail: 'Interfaces tipadas (WIT) para módulos se interconectarem com type safety.', highlight: true },
            { when: '2025–26', label: 'WASM GC', detail: 'GC nativo para reduzir tamanho de runtime de linguagens como Kotlin, Java, Dart.' },
          ]}
        />
      </Section>

      <Section title="Quando NÃO usar WASM" accent={ACCENT}>
        <DecisionBox
          scenario="Você quer “acelerar” seu app React com WASM"
          winner="Provavelmente NÃO"
          winnerColor={ACCENT}
          why="React render é dominado por reconciliation, hooks, virtual DOM diffing — código onde o V8 já é excelente. WASM ajuda apenas em hot functions específicas (parsers, image processing). Comece com profiling, não com WASM como solução procurando problema."
          alternatives={[
            { name: 'Hot loop específico', when: 'Sim, vale considerar — mas profile antes' },
            { name: 'Code-base C++/Rust legacy', when: 'WASM é caminho natural — Figma/AutoCAD case' },
            { name: 'ML inference', when: 'transformers.js / ONNX Runtime Web já fazem isso' },
            { name: 'Game engine', when: 'Sim — Unity, Unreal já compilam para WASM' },
          ]}
        />
        <FlowDiagram
          title="Decisão WASM em 5 passos"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '1️⃣', label: 'Profile', desc: 'DevTools Performance — hot function clara?' },
            { icon: '2️⃣', label: 'CPU-bound?', desc: 'Não é I/O, não é DOM, é compute puro?' },
            { icon: '3️⃣', label: 'Mediu V8 ceiling?', desc: 'Otimizou JS primeiro (monomorphic, etc)?' },
            { icon: '4️⃣', label: 'Vale custo de bridge?', desc: 'JS↔WASM tem overhead. Hot path deve compensar' },
            { icon: '5️⃣', label: 'Reescreva só essa', desc: 'Rust+wasm-bindgen ou AssemblyScript' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="WASM funciona em workers?"
          a={
            <span>
              Sim — e é o padrão recomendado para CPU-bound longo: WASM dentro de um Dedicated
              Worker isola o thread main. ML inference local quase sempre é assim.
            </span>
          }
        />
        <QAItem
          q="Streaming compilation — vale o esforço?"
          a={
            <span>
              <InlineCode>WebAssembly.instantiateStreaming(fetch(url))</InlineCode> compila
              enquanto baixa — TTI mais cedo. Requer servidor enviar{' '}
              <InlineCode>Content-Type: application/wasm</InlineCode>. Sempre use em produção.
            </span>
          }
        />
        <QAItem
          q="WASM dá acesso a GPU?"
          a={
            <span>
              Não diretamente. Via WebGPU/WebGL JS APIs sim — WASM expõe dados, JS faz draw
              calls. Em 2026, propostas de “GPU buffers shared com WASM” em andamento, mas
              ainda não shipped.
            </span>
          }
        />
        <QAItem
          q="Como debugar WASM?"
          a={
            <span>
              Chrome DevTools suporta DWARF source maps — você vê seu .rs/.go original no
              debugger, com breakpoints. Compile com{' '}
              <InlineCode>--debug</InlineCode> e <InlineCode>-Cdebuginfo=2</InlineCode> em
              Rust.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo: a próxima geração de compute no browser — WebGPU, com compute shaders e ML
        inference acelerada. Veja <InlineCode>webgpu-fundamentos</InlineCode>.
      </Callout>
    </div>
  );
}
