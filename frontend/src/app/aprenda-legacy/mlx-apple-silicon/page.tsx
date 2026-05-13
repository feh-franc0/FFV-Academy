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
  StackFlow,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('mlx-apple-silicon');

const ACCENT = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é unified memory em Apple Silicon e por que importa para LLMs?',
    options: [
      'RAM compartilhada entre apps',
      'CPU, GPU e Neural Engine acessam a MESMA memória física (não há VRAM separada). Pesos do modelo são alocados uma única vez e visíveis a qualquer compute unit, sem cópia PCIe — viabiliza rodar Llama 70B (35GB INT4) ou 405B (200GB INT4) em hardware de escritório com 128-192GB unified',
      'Memória virtual paginada',
      'Cache L3 compartilhado',
    ],
    correct: 1,
    explanation:
      'Em uma RTX 4090, VRAM (24GB) é separada de RAM do sistema — modelos maiores que 24GB exigem split tensor com PCIe penalty. Mac Studio M3 Ultra tem 192GB unified: o mesmo silício serve CPU e GPU, sem cópia. É a única arquitetura que permite Llama 405B em hardware single-box consumer.',
  },
  {
    question: 'O que é "lazy evaluation" em MLX e como difere de PyTorch eager?',
    options: [
      'MLX é mais lento por default',
      'Em MLX, operações sobre arrays são gravadas em um grafo computacional mas não executadas imediatamente — somente quando mx.eval() ou um .item() força avaliação. Permite fusão de ops, otimização de memory layout e reuso de buffers que PyTorch eager não consegue',
      'Lazy = thread pool',
      'Apenas para inferência',
    ],
    correct: 1,
    explanation:
      'MLX foi desenhado lazy por padrão. mx.matmul(a,b) retorna um array "não computado". A próxima op pode fundir com a anterior. mx.eval(x) materializa. Padrão semelhante ao JAX (também da Apple-influenced lineage). Em training, eval ocorre no backward; em inferência, ao chamar .item() ou print. Permite otimizações que PyTorch eager não pode fazer.',
  },
  {
    question: 'O que é mlx-lm e como difere de mlx puro?',
    options: [
      'mlx-lm é proprietário e pago',
      'mlx-lm é uma layer em cima do MLX core voltada para LLMs: model loaders (Llama, Mistral, Qwen, Phi, Gemma, DeepSeek, etc.), conversão automática de pesos HuggingFace, quantização (INT4/INT8 nativo MLX), generate() de alto nível com sampling, servidor compatível OpenAI API',
      'É outro nome para mlx',
      'mlx-lm só suporta Llama',
    ],
    correct: 1,
    explanation:
      'mlx é o "PyTorch para Apple Silicon" — primitives genéricas. mlx-lm é a camada de produtividade: `from mlx_lm import load, generate`. Repositório mlx-community no HF tem ~2000 modelos já convertidos para MLX format (.safetensors com config). `mlx_lm.server` expõe API compatível OpenAI.',
  },
  {
    question: 'Como funciona a quantização nativa do MLX?',
    options: [
      'É só wrapper sobre bitsandbytes',
      'MLX tem quantização per-group (group_size=64 default) em INT4 e INT8 implementada em Metal Shading Language com kernels otimizados para AMX (Apple Matrix coprocessor) e GPU shaders — formato proprietário .safetensors com scales/biases separados, conversão via mlx_lm.convert',
      'Apenas FP16',
      'Quantização só no Neural Engine',
    ],
    correct: 1,
    explanation:
      'mlx.core.quantize() converte FP16 → INT4/8 com group quantization. Os scales são FP16 separados. Kernels Metal dedicados fazem GEMM quantizado. Em M3 Max/Ultra explora AMX (Apple Matrix eXtension) — coprocessor dedicado a matmul. Resultado: Llama 70B 4-bit roda 15-25 tok/s em M3 Ultra, próximo do que vLLM dá em RTX 4090.',
  },
  {
    question: 'Por que MLX é especialmente bom para fine-tuning LoRA local?',
    options: [
      'É proibido na nuvem',
      'Unified memory + quantização INT4 nativa + LoRA com Apple Neural Engine integrado: dá para fine-tunear LoRA em Llama 3.1 70B INT4 com base congelada em um Mac Studio M3 Ultra usando ~50GB de RAM total (vs 4× A100 80GB em FP16) — sem PCIe bottleneck, sem datacenter',
      'MLX é mais preciso',
      'É o único que suporta LoRA',
    ],
    correct: 1,
    explanation:
      'mlx-lm tem `mlx_lm.lora` builtin: base em INT4 congelada, adapters em FP16 treináveis. Em M3 Ultra 192GB, dá para fine-tunear modelos de 70B usando QLoRA-style. Loss curves são equivalentes às de QLoRA em CUDA. Trade-off: lento vs A100 (1 epoch que demora 2h em A100 leva 8-12h em M3 Ultra), mas sem custo de cloud.',
  },
  {
    question: 'Quando MLX NÃO é a escolha certa?',
    options: [
      'Sempre é melhor',
      'Quando você precisa multi-GPU além de um Mac (não há cluster Mac otimizado), workloads que precisam Triton/CUDA-specific kernels, training de modelos do zero acima de ~30B (M3 Ultra brilha em fine-tune e inferência, não em pre-training), ou serving production com 100+ req/s onde vLLM em H100 vence',
      'Apenas em iPad',
      'Apenas em iPhone',
    ],
    correct: 1,
    explanation:
      'MLX é ótimo para: prototipagem rápida, inferência local de modelos grandes, fine-tune LoRA, edge/desktop deployment. Não é ótimo para: cluster training, serving alta concorrência, workloads que dependem de bibliotecas CUDA específicas (FlashAttention-2 oficial, xformers, Triton kernels custom). Ecossistema está crescendo mas ainda é Apple-only.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="mlx-apple-silicon"
      title="MLX: rodar LLM nativo em M3/M4 Apple Silicon"
      icon="🍎"
      xp={65}
      readTime={13}
      trailName="Local LLMs & Edge AI"
      trailColor={ACCENT}
      nextSlug="on-device-inference-mobile"
      nextTitle="On-device inference mobile: ExecuTorch, MediaPipe, Core ML"
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
        Em dezembro de 2023, Apple Machine Learning Research lançou silenciosamente o <strong>MLX</strong> — um
        framework de arrays inspirado em NumPy/JAX/PyTorch, mas desenhado do zero para Apple Silicon. Em 2026, com
        chips M3 Ultra (192GB unified memory, 800 GB/s bandwidth) e M4 Max, o MLX se tornou a maneira de rodar
        modelos gigantes em hardware de escritório: Llama 405B INT4 cabe em um Mac Studio que cabe na sua mesa.
      </p>

      <Section title="O diferencial Apple Silicon: unified memory" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em arquiteturas tradicionais (PC + dGPU NVIDIA/AMD), CPU e GPU têm memórias separadas, conectadas por
          PCIe (até ~64 GB/s em PCIe 5.0). Carregar um modelo grande exige cópias entre RAM e VRAM. Em Apple
          Silicon, <strong>tudo é uma memória só</strong> — fisicamente compartilhada entre CPU, GPU, Neural
          Engine e AMX, com até 800 GB/s de bandwidth no M3 Ultra.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Chip', 'CPU cores', 'GPU cores', 'Neural Engine', 'Memory', 'Bandwidth', 'Llama 70B INT4 tok/s']}
          rows={[
            ['M2 Max', '12 (8P + 4E)', '38', '16-core', '32-96 GB', '400 GB/s', '~12-15'],
            ['M2 Ultra', '24 (16P + 8E)', '76', '32-core', '64-192 GB', '800 GB/s', '~18-22'],
            ['M3 Max', '16 (12P + 4E)', '40', '16-core', '36-128 GB', '400 GB/s', '~14-18'],
            ['M3 Ultra', '32 (24P + 8E)', '80', '32-core', '96-192 GB', '800 GB/s', '~22-28'],
            ['M4 Pro', '14 (10P + 4E)', '20', '16-core', '24-64 GB', '273 GB/s', '~8-10 (45B INT4)'],
            ['M4 Max', '16 (12P + 4E)', '40', '16-core', '36-128 GB', '546 GB/s', '~16-20'],
          ]}
        />
        <Callout tone="info">
          Para comparar: <strong>RTX 4090 24GB</strong> tem 1008 GB/s de bandwidth mas só 24GB. Roda Llama 8B
          INT4 em 80-120 tok/s — mais rápido que qualquer Mac em modelos pequenos. <strong>Mas não roda Llama
          70B+ sem multi-GPU.</strong> A unified memory do M3 Ultra é a única forma de rodar 70B-405B em
          hardware single-box até hoje.
        </Callout>
      </Section>

      <Section title="MLX core: arrays lazy + automatic differentiation" accent={ACCENT}>
        <CodeBlock lang="python">{`# MLX core — NumPy-like com lazy evaluation
import mlx.core as mx
import mlx.nn as nn

# Arrays não são materializados até mx.eval()
a = mx.random.normal(shape=(1024, 1024))
b = mx.random.normal(shape=(1024, 1024))
c = a @ b                       # lazy: grafo construído
d = mx.exp(c) + a               # lazy: fusão potencial
# Nenhum cálculo ainda

mx.eval(d)                      # materializa — agora computa
print(d.shape)                  # (1024, 1024)

# Diferenciação automática
def loss_fn(W, x, y):
    return mx.mean((x @ W - y) ** 2)

grad_fn = mx.grad(loss_fn)
W = mx.random.normal((10, 1))
x = mx.random.normal((100, 10))
y = mx.random.normal((100, 1))

dW = grad_fn(W, x, y)           # gradiente vs primeiro arg

# Composability: gradients of gradients
hessian_diag = mx.grad(mx.grad(loss_fn))(W, x, y)`}</CodeBlock>
        <StackFlow
          title="Pilha MLX"
          accent={ACCENT}
          items={[
            { icon: '📦', label: 'mlx_lm / mlx_vlm / mlx_whisper', sub: 'aplicações de alto nível (LLM, VLM, ASR)' },
            { icon: '🧰', label: 'mlx.nn, mlx.optimizers', sub: 'camadas (Linear, Attention, RMSNorm), Adam, SGD' },
            { icon: '🧮', label: 'mlx.core — arrays + autograd', sub: 'API NumPy-like; lazy eval; mx.grad, mx.vmap' },
            { icon: '⚙️', label: 'Metal Performance Shaders + AMX', sub: 'GEMM, attention, conv via Metal shaders + AMX coprocessor' },
            { icon: '🔌', label: 'Apple Silicon hardware', sub: 'CPU + GPU + ANE + AMX, unified memory' },
          ]}
        />
      </Section>

      <Section title="mlx-lm: LLMs de produção em uma linha" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Instalação
pip install mlx-lm

# Download e geração — modelo já quantizado em INT4
python -m mlx_lm.generate \\
    --model mlx-community/Meta-Llama-3.1-70B-Instruct-4bit \\
    --prompt "Explique PagedAttention em 3 bullets." \\
    --max-tokens 500 \\
    --temp 0.5

# Conversão própria de HF → MLX INT4
python -m mlx_lm.convert \\
    --hf-path meta-llama/Meta-Llama-3.1-8B-Instruct \\
    --mlx-path ./Llama-3.1-8B-Instruct-mlx-q4 \\
    --quantize \\
    -q --q-bits 4 --q-group-size 64

# Servidor compatível com OpenAI API
python -m mlx_lm.server \\
    --model mlx-community/Qwen2.5-72B-Instruct-4bit \\
    --port 8080 \\
    --temp 0.5

# curl http://localhost:8080/v1/chat/completions \\
#   -d '{"model":"mlx","messages":[{"role":"user","content":"oi"}]}'`}</CodeBlock>
        <CodeBlock lang="python">{`# API Python idiomática
from mlx_lm import load, generate, stream_generate

model, tokenizer = load("mlx-community/Meta-Llama-3.1-8B-Instruct-4bit")

prompt = tokenizer.apply_chat_template(
    [{"role": "user", "content": "O que é unified memory em M3 Ultra?"}],
    tokenize=False,
    add_generation_prompt=True,
)

# Generation simples
response = generate(model, tokenizer, prompt=prompt, max_tokens=500, temp=0.5)
print(response)

# Streaming
for tok in stream_generate(model, tokenizer, prompt=prompt, max_tokens=500):
    print(tok.text, end="", flush=True)

# Speculative decoding nativo
from mlx_lm import generate
draft_model, _ = load("mlx-community/Llama-3.2-1B-Instruct-4bit")

response = generate(
    model, tokenizer, prompt=prompt, max_tokens=500,
    draft_model=draft_model, num_draft_tokens=5,
)`}</CodeBlock>
      </Section>

      <Section title="Fine-tune LoRA local — 70B em um Mac Studio" accent={ACCENT}>
        <CodeBlock lang="bash">{`# mlx_lm.lora — QLoRA-style em hardware Apple
python -m mlx_lm.lora \\
    --model mlx-community/Meta-Llama-3.1-70B-Instruct-4bit \\
    --train \\
    --data ./data_jsonl \\          # JSONL com {"prompt":..., "completion":...}
    --iters 1000 \\
    --batch-size 2 \\
    --lora-layers 16 \\             # quantos layers receber LoRA (top N)
    --learning-rate 1e-5 \\
    --adapter-path ./ffv-tutor-lora \\
    --save-every 200

# Fundir LoRA com base
python -m mlx_lm.fuse \\
    --model mlx-community/Meta-Llama-3.1-70B-Instruct-4bit \\
    --adapter-path ./ffv-tutor-lora \\
    --save-path ./ffv-tutor-70b-fused-mlx

# Servir o modelo fundido
python -m mlx_lm.server --model ./ffv-tutor-70b-fused-mlx`}</CodeBlock>
        <Callout tone="info">
          Em <strong>M3 Ultra 192GB</strong>: Llama 70B INT4 (~35GB) + LoRA adapters (~500MB) + ativações + KV
          cache ≈ 50GB total. Sobra muita RAM para batch maior. 1000 iters de fine-tune em dataset de 10k
          exemplos: 4-8 horas. Mesma carga em 4× A100 80GB: 1-2h, mas custa ~$15-30 na AWS — o Mac Studio paga
          em alguns ciclos.
        </Callout>
      </Section>

      <Section title="mlx-vlm: visão multimodal" accent={ACCENT}>
        <CodeBlock lang="python">{`# Modelos multimodais (VLMs) no MLX
from mlx_vlm import load, generate

model, processor = load("mlx-community/Qwen2.5-VL-7B-Instruct-4bit")

response = generate(
    model, processor,
    image="https://example.com/diagram.png",
    prompt="Descreva o diagrama de arquitetura.",
    max_tokens=500,
    temp=0.3,
)

# Suportados:
# - LLaVA family (1.5, 1.6, NeXT)
# - Qwen2-VL, Qwen2.5-VL
# - Llama 3.2 Vision (11B, 90B)
# - Phi-3-vision, Phi-3.5-vision
# - InternVL2
# - Idefics3`}</CodeBlock>
      </Section>

      <Section title="Comparativo de performance real" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'M3 Ultra 192GB', 'M4 Max 128GB', 'RTX 4090 24GB', 'A100 80GB']}
          rows={[
            ['Llama 3.1 8B INT4', '~70 tok/s', '~50 tok/s', '~120 tok/s (vLLM)', '~180 tok/s'],
            ['Llama 3.1 70B INT4', '~24 tok/s', '~18 tok/s (cabe apertado)', 'Não cabe (split)', '~60 tok/s'],
            ['Llama 3.1 405B INT4', '~5-7 tok/s', 'Não cabe', 'Não cabe', 'Não cabe (single GPU)'],
            ['Qwen 2.5 72B INT4', '~22 tok/s', '~17 tok/s', 'Não cabe', '~55 tok/s'],
            ['Phi-4 14B INT4', '~55 tok/s', '~45 tok/s', '~95 tok/s', '~150 tok/s'],
            ['Whisper Large v3', 'Real-time 5×', 'Real-time 4×', 'Real-time 10×', 'Real-time 15×'],
          ]}
        />
        <FlowDiagram
          accent={ACCENT}
          title="Quando escolher MLX vs vLLM/CUDA"
          orientation="vertical"
          steps={[
            { icon: '🍎', label: 'MLX', desc: 'Modelos 30B-405B local, fine-tune LoRA, prototipagem, devs Mac, edge deploy' },
            { icon: '🟢', label: 'vLLM/CUDA', desc: 'Serving produção 100+ req/s, training do zero, ecossistema CUDA (FA2, Triton)' },
            { icon: '🤝', label: 'Híbrido', desc: 'Dev local em Mac (MLX) → deploy prod em GPU (vLLM). Mesmos modelos GGUF compartilháveis' },
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="MLX roda em iPhone/iPad?"
          a={<>MLX core compila para iOS/iPadOS desde 2024. Bibliotecas como <InlineCode>mlx-swift</InlineCode> permitem rodar Llama 3B em iPhone 15+ (8GB). Mas modelos grandes (8B+) exigem Mac. Apple Intelligence usa MLX internamente nos modelos on-device do iOS 26+.</>}
        />
        <QAItem
          q="Como faço o MLX usar Neural Engine (ANE)?"
          a="MLX usa GPU Metal por default (mais flexível). Para usar ANE, geralmente é via Core ML — caminho de conversão diferente. O ANE é ótimo para inferência fixa em modelos otimizados (vision, ASR), menos ideal para LLM general. Em workloads LLM, GPU Metal + AMX ganha do ANE."
        />
        <QAItem
          q="Onde achar modelos prontos para MLX?"
          a={<>HuggingFace org <InlineCode>mlx-community</InlineCode> (huggingface.co/mlx-community) — ~2000 modelos convertidos por voluntários. Inclui Llama, Mistral, Qwen, Phi, Gemma, DeepSeek, Yi, Falcon, Mixtral, Command-R, etc. Padrão de nome: <InlineCode>{`<model>-{4bit,8bit}`}</InlineCode>.</>}
        />
        <QAItem
          q="MLX tem equivalente ao DeepSpeed/FSDP?"
          a="Distribuído ainda é o ponto fraco. MLX 0.20+ adicionou mlx.distributed com all-reduce sobre Thunderbolt para clusters Mac. Funciona mas é nicho. Para training distribuído de verdade (multi-node), CUDA + DeepSpeed/FSDP/Megatron continua a escolha — MLX brilha em single-machine."
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Repo MLX', v: 'github.com/ml-explore/mlx — Apple Machine Learning Research' },
            { k: 'mlx-lm', v: 'github.com/ml-explore/mlx-examples/tree/main/llms — model loaders, server, LoRA' },
            { k: 'mlx-community', v: 'huggingface.co/mlx-community — modelos convertidos' },
            { k: 'Apple Silicon arch', v: 'developer.apple.com/documentation/apple-silicon' },
            { k: 'AMX (Apple Matrix)', v: 'github.com/corsix/amx — documentação engenharia reversa' },
            { k: 'Metal Performance Shaders', v: 'developer.apple.com/metal/' },
          ]}
        />
      </Section>
    </div>
  );
}
