import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import { Section, Callout, CodeBlock, InlineCode, ComparisonTable, FlowDiagram, Timeline, DecisionBox, StackFlow, QAItem } from '@/components/article/primitives';

export const metadata = getModuleMetadata('webgpu-fundamentos');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Por que WebGPU é o sucessor do WebGL e não “WebGL 3”?',
    options: [
      'Apenas rebranding',
      'WebGL é wrapper em OpenGL ES (state machine 2000s). WebGPU é API moderna desenhada sobre Vulkan/Metal/DirectX 12 — explicit pipelines, command buffers, compute shaders nativos, multi-threading API design. Não é incremento; é repensar',
      'WebGPU só funciona em GPUs NVIDIA',
      'WebGL ainda é mais rápido',
    ],
    correct: 1,
    explanation:
      'WebGL herdou state machine de OpenGL (era 2000s) — global state, bind antes de draw, bugs de state leak. WebGPU é design moderno: command buffers explícitos, pipelines pré-compiladas, descriptor sets, compute shaders first-class. Inspirado em Vulkan/Metal/DX12 que dominaram desktop gaming dos 2010s+. Spec: gpuweb.github.io.',
  },
  {
    question: 'O que é WGSL e por que existe?',
    options: [
      'WebGL Shading Language — versão legacy',
      'WebGPU Shading Language — novo shader language inspirado em Rust syntax, compilado para SPIR-V/MSL/HLSL conforme platform. Existe porque GLSL (WebGL) era OpenGL-only e nenhum dos shading languages existentes (HLSL/MSL/SPIR-V) era ideal para web',
      'Linguagem deprecated em favor de TypeScript',
      'É só JSON',
    ],
    correct: 1,
    explanation:
      'WGSL (W3C spec) tem sintaxe limpa, type system tipo Rust, semantics explícitas. Implementations compilam WGSL → SPIR-V (Vulkan), MSL (Metal), HLSL (DirectX) conforme backend. Decisão polêmica vs adotar SPIR-V direto — política e tooling. Hoje WGSL é o padrão de fato em browser.',
  },
  {
    question: 'O que são compute shaders em WebGPU?',
    options: [
      'Shaders que rodam só na CPU',
      'GPU programs para computação geral (não-gráfica): paralelismo massivo em GPU para ML, image filters, físicas, simulações. Dispatch com workgroup size, acesso a storage buffers, sem render pipeline',
      'Versão otimizada de vertex shader',
      'Apenas para mineração de cripto',
    ],
    correct: 1,
    explanation:
      'WebGL nunca teve compute shaders “de verdade” (apenas trucagem com fragment shaders e textures). WebGPU traz @compute @workgroup_size — dispatch puro, sem precisar atravessar pipeline de render. transformers.js usa para acelerar matmuls. tfjs-backend-webgpu, ONNX Runtime Web aproveitam. WebLLM (Wenhu Yu et al, MLC) roda Llama no browser via WebGPU compute.',
  },
  {
    question: 'Qual é o status de WebGPU em 2026 em browsers?',
    options: [
      'Apenas Chrome, experimental',
      'Chrome 113 estável (2023), Safari 18 (set 2024), Firefox 121 (em flag por padrão; estável em Nightly). Cross-browser viável em 2026 com feature detection',
      'Deprecated em favor de WebGL',
      'Só em sistemas com GPU dedicada',
    ],
    correct: 1,
    explanation:
      'Chrome shipou estável em maio 2023 (v113). Safari trouxe em Safari 18 + macOS 15 (set 2024). Firefox shipou em 121 (dez 2023) em Windows; outras platforms ganharam ao longo de 2024-25. Em 2026 é viável produção com feature detection (`navigator.gpu`) + fallback para WebGL onde indisponível.',
  },
  {
    question: 'Por que rodar LLM no browser via WebGPU?',
    options: [
      'Performance — sempre mais rápido que server',
      'Privacidade (dados nunca saem do device), latência baixa (sem round-trip de rede), zero custo de inference para o provedor. WebLLM, transformers.js v3, ONNX Runtime Web mostram Phi-3, Llama 3.2 1B/3B rodando aceitavelmente em GPU consumidor',
      'Para SEO',
      'Apenas demos, não produção',
    ],
    correct: 1,
    explanation:
      'Casos reais 2024-26: GitHub Models Playground roda alguns small models in-browser, transformers.js v3 oficial Hugging Face suporta WebGPU acceleration, WebLLM (mlc.ai) roda Llama 3.1 8B em RTX 3060+ desktop. Trade-offs: tempo de download de pesos (centenas de MB → GB), VRAM exigida, quality vs server-side modelos maiores. Mas privacidade é diferencial real.',
  },
  {
    question: 'Como WebGPU lida com paralelismo (workgroups)?',
    options: [
      'GPU executa serial',
      'Dispatch invoca milhares de threads agrupadas em workgroups. Threads dentro de um workgroup podem compartilhar memory (workgroup shared memory) e sincronizar (workgroupBarrier). Cada thread recebe IDs (local_invocation_id, global_invocation_id)',
      'Cada draw call é uma thread',
      'Apenas suporta single-threaded',
    ],
    correct: 1,
    explanation:
      'GPU é SIMT (Single Instruction, Multiple Threads). Workgroup = grupo de threads que rodam em mesmo CU (compute unit). @workgroup_size(64) declara que cada workgroup tem 64 threads. dispatch(width/64, 1, 1) invoca múltiplos workgroups. Threads dentro do workgroup compartilham var<workgroup> memory e podem workgroupBarrier(). Mental model: nested loops, mas todos rodam paralelos.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="webgpu-fundamentos"
      title="WebGPU: a sucessão de WebGL, GPU compute no browser"
      icon="🎮"
      xp={75}
      readTime={15}
      trailName="Browser & Web Internals Profundo"
      trailColor={ACCENT}
      nextSlug="webrtc-pratica"
      nextTitle="WebRTC: peer-to-peer, signaling, STUN/TURN"
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
        WebGPU não é uma versão melhor do WebGL — é uma API totalmente nova, inspirada em
        Vulkan/Metal/DirectX 12. Trouxe compute shaders first-class para o browser, e com
        isso destravou ML inference local sério: Whisper rodando offline, Llama 3 no Chrome,
        Stable Diffusion no Safari. Em 2026 é cross-browser viável.
      </p>

      <Section title="Por que WebGPU em vez de continuar WebGL" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['', 'WebGL 2', 'WebGPU']}
          rows={[
            ['Modelo', 'State machine (gl.bindBuffer, gl.use)', 'Command buffers explícitos'],
            ['Baseado em', 'OpenGL ES 3.0 (2012)', 'Vulkan / Metal / DirectX 12 (2015+)'],
            ['Shading language', 'GLSL ES', 'WGSL (W3C spec própria)'],
            ['Compute shaders', 'Hack via fragment + framebuffer', 'First-class @compute'],
            ['Multi-thread API', 'Não — chamadas seriais', 'Sim — command buffers podem ser gravados em workers'],
            ['Pipeline state', 'Implicit (state global)', 'Explicit (pre-compiled GPUPipeline objects)'],
            ['Error handling', 'Silent — checar gl.getError', 'Async com Promise + validation layer'],
            ['Tipo de uso', 'Render 2D/3D, alguma compute trucada', 'Render + compute geral (ML, sims, image processing)'],
          ]}
        />
        <Callout tone="info" icon="📚">
          Spec: <InlineCode>gpuweb.github.io/gpuweb</InlineCode>. WGSL spec separada:{' '}
          <InlineCode>gpuweb.github.io/gpuweb/wgsl</InlineCode>. Tutorial: “Your first WebGPU app”
          (Codelab Google), e WebGPU Samples em{' '}
          <InlineCode>webgpu.github.io/webgpu-samples</InlineCode>.
        </Callout>
      </Section>

      <Section title="Anatomia de uma app WebGPU" accent={ACCENT}>
        <StackFlow
          title="Setup mínimo de WebGPU"
          accent={ACCENT}
          items={[
            { icon: '1️⃣', label: 'Adapter', sub: 'Hardware físico', detail: 'navigator.gpu.requestAdapter() — escolhe GPU (high-performance ou low-power)', connector: 'request' },
            { icon: '2️⃣', label: 'Device', sub: 'Handle lógica', detail: 'adapter.requestDevice() — instância para criar resources', connector: 'create' },
            { icon: '3️⃣', label: 'Buffers / Textures', sub: 'Recursos GPU', detail: 'device.createBuffer(), createTexture() — memória GPU', connector: 'usar em' },
            { icon: '4️⃣', label: 'Pipeline', sub: 'Shader + state', detail: 'createComputePipeline ou createRenderPipeline — compila WGSL', connector: 'submit' },
            { icon: '5️⃣', label: 'Command Encoder', sub: 'Gravar comandos', detail: 'commandEncoder.beginComputePass / beginRenderPass → dispatch / draw', connector: 'queue' },
            { icon: '6️⃣', label: 'Queue.submit', sub: 'Executar na GPU', detail: 'device.queue.submit([commandBuffer]) — GPU processa async' },
          ]}
        />
      </Section>

      <Section title="Hello compute — somar dois arrays" accent={ACCENT}>
        <CodeBlock lang="typescript" filename="compute.ts">{`// 1. Adapter + device
const adapter = await navigator.gpu?.requestAdapter();
if (!adapter) throw new Error('WebGPU não suportado');
const device = await adapter.requestDevice();

// 2. Buffers
const N = 1024 * 1024;
const a = new Float32Array(N).map(() => Math.random());
const b = new Float32Array(N).map(() => Math.random());

const bufferA = device.createBuffer({
  size: a.byteLength,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(bufferA, 0, a);

const bufferB = device.createBuffer({
  size: b.byteLength,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
});
device.queue.writeBuffer(bufferB, 0, b);

const bufferOut = device.createBuffer({
  size: N * 4,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
});

// 3. Shader WGSL
const shader = device.createShaderModule({
  code: \`
    @group(0) @binding(0) var<storage, read> a: array<f32>;
    @group(0) @binding(1) var<storage, read> b: array<f32>;
    @group(0) @binding(2) var<storage, read_write> out: array<f32>;

    @compute @workgroup_size(64)
    fn main(@builtin(global_invocation_id) gid: vec3u) {
      let i = gid.x;
      if (i >= arrayLength(&a)) { return; }
      out[i] = a[i] + b[i];
    }
  \`,
});

// 4. Pipeline + bindings
const pipeline = device.createComputePipeline({
  layout: 'auto',
  compute: { module: shader, entryPoint: 'main' },
});

const bindGroup = device.createBindGroup({
  layout: pipeline.getBindGroupLayout(0),
  entries: [
    { binding: 0, resource: { buffer: bufferA } },
    { binding: 1, resource: { buffer: bufferB } },
    { binding: 2, resource: { buffer: bufferOut } },
  ],
});

// 5. Encode + dispatch
const encoder = device.createCommandEncoder();
const pass = encoder.beginComputePass();
pass.setPipeline(pipeline);
pass.setBindGroup(0, bindGroup);
pass.dispatchWorkgroups(Math.ceil(N / 64));
pass.end();

// readback (real apps tentam evitar ler de volta CPU)
const readBuffer = device.createBuffer({
  size: N * 4,
  usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
});
encoder.copyBufferToBuffer(bufferOut, 0, readBuffer, 0, N * 4);
device.queue.submit([encoder.finish()]);

await readBuffer.mapAsync(GPUMapMode.READ);
const result = new Float32Array(readBuffer.getMappedRange().slice(0));
console.log('Done:', result[0]);`}</CodeBlock>
        <Callout tone="warn" icon="⚠️">
          Readback CPU é caro. Apps reais mantêm dados na GPU entre operações — só leem CPU
          no final (display, upload network). transformers.js executa toda inference na GPU,
          só lê tokens decodificados.
        </Callout>
      </Section>

      <Section title="ML inference no browser" accent={ACCENT}>
        <p>
          O caso de uso que justifica investir em WebGPU em 2026 é local AI. As três stacks
          principais:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Stack', 'Cobertura', 'Quando usar']}
          rows={[
            ['transformers.js (Hugging Face)', '300+ modelos: BERT, Whisper, BART, Phi, Llama 3.2 small', 'Pipeline alto nível, pipeline() API similar ao Python'],
            ['ONNX Runtime Web', 'Qualquer modelo exportado para ONNX', 'Quando você tem modelo customizado treinado em PyTorch/TF'],
            ['WebLLM / MLC', 'LLMs grandes (Llama 3.1 8B, Phi-3.5)', 'Chat local. Modelos compilados via TVM Unity'],
            ['tfjs-backend-webgpu', 'TensorFlow.js models', 'Apps já em TF.js querendo speedup'],
          ]}
        />
        <CodeBlock lang="typescript" filename="local-ai.ts">{`// transformers.js v3 com WebGPU
import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline(
  'sentiment-analysis',
  'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
  { device: 'webgpu', dtype: 'q8' }  // quantizado 8-bit para reduzir VRAM
);

const result = await classifier('I love this movie');
// → [{ label: 'POSITIVE', score: 0.999 }]

// Whisper local — STT no browser
const transcriber = await pipeline(
  'automatic-speech-recognition',
  'Xenova/whisper-tiny.en',
  { device: 'webgpu' }
);
const audio = await loadAudio(file);
const text = await transcriber(audio);`}</CodeBlock>
        <Callout tone="success" icon="🎯">
          Privacidade real: dado do usuário nunca sai do device. Latência baixa (sem network).
          Zero custo de inference para sua app. Trade-off: download de pesos (centenas de MB),
          VRAM exigida, qualidade menor que GPT-4 server-side.
        </Callout>
      </Section>

      <Section title="Render: triangle clássico em WebGPU" accent={ACCENT}>
        <CodeBlock lang="typescript" filename="triangle.ts">{`const canvas = document.querySelector('canvas')!;
const context = canvas.getContext('webgpu')!;
const format = navigator.gpu.getPreferredCanvasFormat();
context.configure({ device, format, alphaMode: 'premultiplied' });

const shader = device.createShaderModule({
  code: \`
    @vertex
    fn vs(@builtin(vertex_index) i: u32) -> @builtin(position) vec4f {
      var pos = array<vec2f, 3>(
        vec2f( 0.0,  0.5),
        vec2f(-0.5, -0.5),
        vec2f( 0.5, -0.5),
      );
      return vec4f(pos[i], 0.0, 1.0);
    }

    @fragment
    fn fs() -> @location(0) vec4f {
      return vec4f(1.0, 0.6, 0.1, 1.0);
    }
  \`,
});

const pipeline = device.createRenderPipeline({
  layout: 'auto',
  vertex: { module: shader, entryPoint: 'vs' },
  fragment: { module: shader, entryPoint: 'fs', targets: [{ format }] },
  primitive: { topology: 'triangle-list' },
});

function frame() {
  const encoder = device.createCommandEncoder();
  const pass = encoder.beginRenderPass({
    colorAttachments: [{
      view: context.getCurrentTexture().createView(),
      clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1 },
      loadOp: 'clear', storeOp: 'store',
    }],
  });
  pass.setPipeline(pipeline);
  pass.draw(3);
  pass.end();
  device.queue.submit([encoder.finish()]);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);`}</CodeBlock>
      </Section>

      <Section title="Timeline WebGPU" accent={ACCENT}>
        <Timeline
          accent={ACCENT}
          events={[
            { when: '2017', label: 'W3C GPU for the Web group', detail: 'Início da spec, com Apple, Google, Mozilla, Microsoft' },
            { when: '2021', label: 'Origin Trials Chrome', detail: 'Primeiros sites testando em produção controlada' },
            { when: '2023-05', label: 'Chrome 113 ship', detail: 'Estável em Chrome/Edge desktop. Marca histórica.', highlight: true },
            { when: '2024-09', label: 'Safari 18 ship', detail: 'macOS 15, iOS/iPadOS 18 — finalmente cross-Apple', highlight: true },
            { when: '2024', label: 'transformers.js v3', detail: 'Hugging Face oficial passa a aproveitar WebGPU em 300+ models' },
            { when: '2024-12', label: 'Firefox 121 ship Windows', detail: 'Firefox shipou em Windows; macOS/Linux seguem em 2025' },
            { when: '2025', label: 'WebGPU em Android', detail: 'Chrome Android estável, fechando o quadrado mobile' },
          ]}
        />
      </Section>

      <Section title="Decisão prática" accent={ACCENT}>
        <DecisionBox
          scenario="Você quer adicionar Whisper STT em uma app de notas, sem mandar audio para server"
          winner="transformers.js v3 com device: 'webgpu' + fallback WASM"
          winnerColor={ACCENT}
          why="transformers.js abstrai a complexidade do WebGPU. Detecta capability, faz fallback automático para WASM em browsers/devices sem GPU. Whisper-tiny.en (~40MB) cabe no orçamento de PWA."
          alternatives={[
            { name: 'WebGPU raw shaders', when: 'Você tem modelo customizado e VRAM budget apertado' },
            { name: 'ONNX Runtime Web', when: 'Modelo já em ONNX (PyTorch.onnx.export)' },
            { name: 'Server-side', when: 'Acuracia crítica — mais pesos disponíveis no server' },
          ]}
        />
        <FlowDiagram
          title="Fallback chain prática"
          accent={ACCENT}
          orientation="vertical"
          steps={[
            { icon: '🚀', label: 'WebGPU disponível?', desc: 'navigator.gpu + canPassPipelineCheck' },
            { icon: '🧵', label: 'WASM SIMD threads', desc: 'Cross-origin isolated + SAB ok' },
            { icon: '⚙️', label: 'WASM SIMD', desc: 'Sem threads, mas SIMD' },
            { icon: '🐢', label: 'WASM puro', desc: 'Fallback final' },
            { icon: '☁️', label: 'API server', desc: 'Última opção — quebra promessa de privacidade' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="WebGPU funciona em iPhone?"
          a={
            <span>
              Sim em iOS 18+ (set 2024). Antes precisava flag “WebGPU” no Safari Settings →
              Advanced → Feature Flags.
            </span>
          }
        />
        <QAItem
          q="WGSL vs SPIR-V?"
          a={
            <span>
              WGSL é o que você escreve em apps web. Browser compila WGSL para SPIR-V (Vulkan),
              MSL (Metal) ou HLSL (DirectX) conforme platform. Sem precisar lidar com SPIR-V
              direto.
            </span>
          }
        />
        <QAItem
          q="Posso usar WebGPU em Service Worker?"
          a={
            <span>
              Não atualmente — WebGPU não é exposto em ServiceWorkerGlobalScope. Funciona em
              Window e Dedicated Worker. Discussion ongoing no spec group.
            </span>
          }
        />
        <QAItem
          q="Como debugar WebGPU?"
          a={
            <span>
              Chrome DevTools tem GPU panel. Para profundidade, use{' '}
              <InlineCode>chrome://gpu</InlineCode> + extensões como Spector.js (com
              limitações em WebGPU vs WebGL). Validation layer (default em dev) ajuda muito.
            </span>
          }
        />
      </Section>

      <Callout tone="success" icon="✅">
        Próximo: comunicação peer-to-peer real entre browsers, sem server na ponta — WebRTC.
        Veja <InlineCode>webrtc-pratica</InlineCode>.
      </Callout>
    </div>
  );
}
