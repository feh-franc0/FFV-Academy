import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('inferencia-otimizacao');

const ACCENT = '#f97316';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é continuous batching e por que melhora throughput vs static batching?',
    options: [
      'Continuous batching processa um único token por vez para maximizar precisão',
      'Static batching aguarda o request mais lento antes de liberar o batch inteiro. Continuous batching (iteration-level scheduling) libera slots para novas requisições quando qualquer request termina — a GPU nunca fica ociosa esperando requests lentos, aumentando throughput 10-30× em workloads com variação de comprimento',
      'Continuous batching é uma técnica de quantização que reduz latência de prefill',
      'A diferença é apenas de nomenclatura — ambos produzem o mesmo throughput',
    ],
    correct: 1,
    explanation:
      'Static batching: batch de N requests só finaliza quando o mais longo termina — slots ficam ociosos. Continuous batching (Orca, Yu et al. 2022): em cada iteração, slots libertos por requests completos são imediatamente preenchidos com novos requests. Resultado: GPU quase sempre ativa. vLLM implementa continuous batching nativamente e é a razão do seu throughput 10-24× superior ao transformers naive em benchmarks de serving.',
  },
  {
    question: 'Como funciona Speculative Decoding e qual seu benefício?',
    options: [
      'Speculative Decoding usa múltiplas GPUs em paralelo para geração de tokens',
      'Um modelo draft (pequeno e rápido) gera B tokens em sequência; o modelo target (grande) verifica todos os B tokens em paralelo em um único forward pass — aceita os corretos e rejeita a partir do primeiro errado. Em média, 2-4 tokens aceitos por forward pass do target',
      'Speculative Decoding é uma técnica de quantização para reduzir uso de memória',
      'O modelo faz look-ahead no input para prever quais tokens virão depois',
    ],
    correct: 1,
    explanation:
      'Speculative Decoding (Leviathan et al. 2022): draft model (ex: Llama-68M) gera γ tokens sequencialmente (barato). Target model (ex: Llama-70B) verifica todos os γ+1 tokens em 1 forward pass (o custo de verificar N tokens ≈ custo de gerar 1 no target). Se os primeiros k tokens do draft concordam com o target, todos são aceitos; a partir do primeiro divergente, o token correto do target é usado. Speedup: 2-4× sem alterar qualidade.',
  },
  {
    question: 'O que é Flash Attention e qual problema específico resolve?',
    options: [
      'Flash Attention é uma técnica de quantização que reduz precisão dos pesos de atenção',
      'Flash Attention reescreve o cálculo de self-attention para ser IO-aware: em vez de materializar a matriz de atenção NxN na HBM (GPU DRAM), faz tiling nos SRAM (muito mais rápido) e funde operações QK^T/softmax/V em um único kernel CUDA — reduz consumo de memória de O(N²) para O(N) e acelera 2-4× especialmente em sequências longas',
      'Flash Attention é um scheduler de batching para reduzir latência de prefill',
      'Flash Attention reduz o número de camadas de atenção necessárias em transformers',
    ],
    correct: 1,
    explanation:
      'Flash Attention (Dao et al. 2022) observou que o bottleneck do attention não é compute (FLOPs) mas IO — mover dados entre HBM e SRAM. Solução: tiling da matriz de atenção para caber em SRAM, fusão de operações em um único kernel (sem materializar NxN na HBM). Flash Attention 2 e 3 (2024) adicionam otimizações para H100 e hardware moderno. Implementado em PyTorch como sdpa (scaled_dot_product_attention).',
  },
  {
    question: 'O que é PagedAttention (vLLM) e como resolve o problema de gerenciamento de KV cache?',
    options: [
      'PagedAttention é uma técnica de paginação de disco para modelos que não cabem em GPU',
      'PagedAttention gerencia o KV cache como memória virtual paginada: aloca memória em blocos não contíguos (como páginas de OS) em vez de alocações contíguas. Elimina fragmentação interna (~50% do KV cache desperdiçado em implementações naive) e permite servir muito mais requests concorrentemente',
      'PagedAttention divide o modelo entre múltiplas GPUs automaticamente',
      'PagedAttention é apenas um nome alternativo para continuous batching',
    ],
    correct: 1,
    explanation:
      'Implementações naive alocam KV cache contíguo e reservam o máximo de tokens ao criar a sequência — enorme fragmentação. PagedAttention (Kwon et al. 2023) usa blocos de tamanho fixo (ex: 16 tokens) alocados dinamicamente, similar a páginas de memória virtual em OS. Benefícios: fragmentação ~0%, compartilhamento de KV cache entre requests com prefixo comum (ex: system prompt), e aumento de 2-4× no número de requests concorrentes no mesmo hardware.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="inferencia-otimizacao"
      title="Otimização de Inferência: batching, speculative decoding e flash attention"
      icon="🚀"
      xp={90}
      readTime={18}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="quantizacao-llm"
      nextTitle="Quantização de LLMs: INT4, INT8, GGUF e impacto em qualidade"
      relatedSlugs={['quantizacao-llm', 'kv-cache', 'transformers']}
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
        Um modelo de 70B em FP16 faz ~140 GB de parâmetros e precisa de 2× mais para os gradientes e KV cache
        em produção. Servir LLMs de forma eficiente — alto throughput, baixa latência, baixo custo — exige
        entender continuous batching, speculative decoding, Flash Attention e PagedAttention. Cada técnica
        ataca um bottleneck diferente no pipeline de inferência.
      </p>

      <Section title="O pipeline de inferência e seus bottlenecks" accent={ACCENT}>
        <LayerStack
          title="Fases da inferência de LLM"
          accent={ACCENT}
          separatorLabel="prefill → decode"
          layers={[
            { label: 'Prefill', content: 'Processar todos os tokens do prompt em paralelo — compute-bound', note: 'latência: 0.5-5s para 1k tokens', tone: 'default' },
            { label: 'KV Cache Store', content: 'Armazenar Key-Value de cada camada para evitar recomputação', note: 'memória: 2×d_model×n_layers por token', tone: 'default' },
            { label: 'Decode (autoregressive)', content: 'Gerar 1 token por forward pass — memory-bandwidth-bound', note: 'throughput: 20-100 tokens/s por request', tone: 'writable' },
            { label: 'Sampling', content: 'Temperatura, top-p, top-k sobre logits para selecionar próximo token', tone: 'writable' },
            { label: 'Output', content: 'Token adicionado ao contexto → próximo forward pass (loop)', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica', 'Bottleneck que resolve', 'Ganho típico', 'Onde está']}
          rows={[
            ['Continuous batching', 'GPU ociosa em static batching', '10-30× throughput', 'vLLM, TGI, TensorRT-LLM'],
            ['Flash Attention', 'IO entre HBM e SRAM no attention', '2-4× memória + speedup', 'PyTorch (sdpa), Flash-Attn lib'],
            ['PagedAttention', 'Fragmentação de KV cache', '2-4× mais requests concorrentes', 'vLLM'],
            ['Speculative Decoding', 'Latência do decode autoregressive', '2-4× speedup end-to-end', 'vLLM, TGI'],
            ['Quantização (INT4)', 'Memória e bandwidth de pesos', '4× menos memória, 1.5-2× throughput', 'todos'],
          ]}
        />
      </Section>

      <Section title="Continuous Batching com vLLM" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          vLLM implementa continuous batching + PagedAttention e é o servidor de inferência open source
          mais adotado em produção. API compatível com OpenAI facilita migração.
        </p>
        <CodeBlock lang="bash">{`# Instalar e iniciar servidor vLLM
pip install vllm

# Servidor com modelo Llama 3.1 8B
python -m vllm.entrypoints.openai.api_server \
  --model meta-llama/Meta-Llama-3.1-8B-Instruct \
  --port 8000 \
  --tensor-parallel-size 1 \
  --gpu-memory-utilization 0.90 \
  --max-model-len 32768 \
  --max-num-seqs 256 \        # max requests concorrentes
  --enable-prefix-caching      # ativar prefix caching (system prompt)

# Com quantização AWQ
python -m vllm.entrypoints.openai.api_server \
  --model TheBloke/Llama-3-8B-Instruct-AWQ \
  --quantization awq \
  --dtype float16 \
  --max-num-seqs 512           # mais requests com modelo menor`}</CodeBlock>

        <CodeBlock lang="python">{`from vllm import LLM, SamplingParams
import time

# Benchmark: static vs continuous batching
llm = LLM(
    model="meta-llama/Meta-Llama-3.1-8B-Instruct",
    gpu_memory_utilization=0.90,
    max_num_seqs=256,
)

# Benchmark com requests de tamanhos variados
prompts = [
    "Explique em 1 frase o que é TCP.",                          # output curto
    "Escreva um ensaio de 500 palavras sobre sistemas distribuídos.",  # output longo
    "Liste 5 vantagens do Kubernetes.",                           # médio
] * 50  # 150 requests

params = SamplingParams(temperature=0.1, max_tokens=512)

start = time.time()
outputs = llm.generate(prompts, params)
elapsed = time.time() - start

total_tokens = sum(len(o.outputs[0].token_ids) for o in outputs)
print(f"Throughput: {total_tokens/elapsed:.0f} tokens/s")
print(f"Latência média: {elapsed/len(prompts)*1000:.0f}ms por request")`}</CodeBlock>
      </Section>

      <Section title="Flash Attention: IO-aware attention" accent={ACCENT}>
        <CodeBlock lang="python">{`import torch
import torch.nn.functional as F
import time

# Comparar: attention naive vs Flash Attention
batch_size = 2
n_heads = 32
seq_len = 4096
d_head = 128

q = torch.randn(batch_size, n_heads, seq_len, d_head, dtype=torch.float16, device="cuda")
k = torch.randn_like(q)
v = torch.randn_like(q)

# Attention naive — materializa matriz NxN
def naive_attention(q, k, v):
    scale = d_head ** -0.5
    attn = (q @ k.transpose(-2, -1)) * scale   # (B, H, N, N) — N²=16M floats!
    attn = torch.softmax(attn, dim=-1)
    return attn @ v

# Flash Attention via PyTorch sdpa
def flash_attention(q, k, v):
    # PyTorch usa Flash Attention automaticamente quando possível
    return F.scaled_dot_product_attention(q, k, v, dropout_p=0.0)

# Benchmark
with torch.cuda.amp.autocast():
    # Naive
    start = time.time()
    for _ in range(10):
        out_naive = naive_attention(q, k, v)
    torch.cuda.synchronize()
    naive_time = (time.time() - start) / 10

    # Flash Attention
    start = time.time()
    for _ in range(10):
        out_flash = flash_attention(q, k, v)
    torch.cuda.synchronize()
    flash_time = (time.time() - start) / 10

print(f"Naive: {naive_time*1000:.1f}ms")
print(f"Flash: {flash_time*1000:.1f}ms")
print(f"Speedup: {naive_time/flash_time:.1f}x")`}</CodeBlock>

        <Callout tone="info">
          Flash Attention 3 (2024) adiciona otimizações específicas para H100: warp specialization,
          pipeline de compute e IO, e suporte a FP8. Para H100, Flash Attention 3 atinge 75% da
          peak TFLOPs teóricas de GEMM — quase o máximo físico possível.
        </Callout>
      </Section>

      <Section title="Speculative Decoding" accent={ACCENT}>
        <CodeBlock lang="python">{`# Speculative Decoding via vLLM
from vllm import LLM, SamplingParams

# Target: modelo grande (alto qualidade)
# Draft: modelo pequeno e rápido (mesmo vocabulário)
llm = LLM(
    model="meta-llama/Meta-Llama-3.1-70B-Instruct",
    speculative_model="meta-llama/Meta-Llama-3.2-1B-Instruct",  # draft
    num_speculative_tokens=5,    # quantos tokens o draft propõe por vez
    use_v2_block_manager=True,
    tensor_parallel_size=4,      # 70B precisa de múltiplas GPUs
)

params = SamplingParams(temperature=0.0, max_tokens=512)
outputs = llm.generate(["Explique MVCC em PostgreSQL em detalhes."], params)

# Monitorar métricas de speculative decoding
# Acceptance rate = quantos tokens do draft o target aceita
# Bom: >0.7 (70% dos tokens do draft aceitos = speedup real)
# Ruim: <0.5 (draft e target muito diferentes em distribuição)`}</CodeBlock>

        <CodeBlock lang="python">{`# Implementação manual simplificada de speculative decoding
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

class SpeculativeDecoder:
    def __init__(self, target_model_name, draft_model_name, gamma=4):
        self.target = AutoModelForCausalLM.from_pretrained(target_model_name, dtype=torch.float16)
        self.draft = AutoModelForCausalLM.from_pretrained(draft_model_name, dtype=torch.float16)
        self.tokenizer = AutoTokenizer.from_pretrained(target_model_name)
        self.gamma = gamma   # tokens propostos pelo draft por round

    @torch.no_grad()
    def generate(self, prompt: str, max_new_tokens: int = 200) -> str:
        input_ids = self.tokenizer.encode(prompt, return_tensors="pt")
        generated = input_ids.clone()

        while generated.shape[1] - input_ids.shape[1] < max_new_tokens:
            # 1. Draft gera gamma tokens especulativos
            draft_tokens = []
            draft_probs = []
            draft_ids = generated.clone()

            for _ in range(self.gamma):
                draft_out = self.draft(draft_ids)
                logits = draft_out.logits[:, -1, :]
                probs = torch.softmax(logits, dim=-1)
                next_token = torch.argmax(probs, dim=-1)
                draft_tokens.append(next_token)
                draft_probs.append(probs[0, next_token.item()].item())
                draft_ids = torch.cat([draft_ids, next_token.unsqueeze(0)], dim=-1)

            # 2. Target verifica gamma+1 tokens em 1 forward pass
            verification_input = torch.cat(
                [generated] + [t.unsqueeze(0) for t in draft_tokens], dim=-1
            )
            target_out = self.target(verification_input)
            target_probs = torch.softmax(target_out.logits, dim=-1)

            # 3. Aceitar/rejeitar com rejection sampling
            n_accepted = 0
            for i, (draft_tok, draft_prob) in enumerate(zip(draft_tokens, draft_probs)):
                target_prob = target_probs[0, generated.shape[1] + i - 1, draft_tok.item()].item()
                accept_prob = min(1.0, target_prob / max(draft_prob, 1e-6))

                if torch.rand(1).item() < accept_prob:
                    generated = torch.cat([generated, draft_tok.unsqueeze(0)], dim=-1)
                    n_accepted += 1
                else:
                    break

            # 4. Adicionar 1 token do target (onde draft divergiu ou todos aceitos)
            last_logits = target_probs[0, generated.shape[1] - 1, :]
            bonus_token = torch.argmax(last_logits).unsqueeze(0).unsqueeze(0)
            generated = torch.cat([generated, bonus_token], dim=-1)

        return self.tokenizer.decode(generated[0], skip_special_tokens=True)`}</CodeBlock>
      </Section>

      <Section title="KV Cache e prefix caching" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Técnica de KV Cache', 'Benefício', 'Implementação']}
          rows={[
            ['PagedAttention', '2-4× mais requests concorrentes', 'Nativo no vLLM'],
            ['Prefix caching', 'System prompt processado 1× por TTL', 'vLLM --enable-prefix-caching'],
            ['Quantização de KV cache', '2-4× menos memória para KV', 'fp8 KV cache (vLLM experimental)'],
            ['KV cache offload para CPU', 'Serve modelos maiores que a VRAM', 'vLLM --cpu-offload-gb'],
          ]}
        />
        <DecisionBox
          scenario="Serving de LLM 70B com 100 requests/s e SLA de p95 <2s"
          winner="vLLM + PagedAttention + AWQ INT4 + multi-GPU tensor parallel"
          winnerColor={ACCENT}
          why="Continuous batching maximiza utilização de GPU. PagedAttention elimina fragmentação de KV cache. AWQ INT4 reduz memória 4× — mais requests cabem. Tensor parallel distribui o modelo entre GPUs para caber e aumentar throughput."
          alternatives={[
            { name: 'TensorRT-LLM', note: 'Throughput ainda maior em NVIDIA H100 — setup mais complexo' },
            { name: 'TGI (Hugging Face)', note: 'Mais simples de operar, ligeiramente menor throughput que vLLM' },
            { name: 'llama.cpp server', note: 'Para hardware sem GPU de datacenter — menor throughput' },
          ]}
        />
        <QAItem
          q="Como medir e monitorar a eficiência de serving em produção?"
          a={<>Métricas essenciais: (1) TTFT (Time to First Token) — latência percebida pelo usuário; (2) TPOT (Time Per Output Token) — velocidade de geração; (3) Throughput (tokens/s) por GPU; (4) GPU utilization — deve estar {'>'} 80% com continuous batching; (5) KV cache usage — hit rate do prefix cache; (6) Acceptance rate do speculative decoding. Todas disponíveis no endpoint /metrics do vLLM (formato Prometheus).</>}
        />
        <QAItem
          q="Qual o impacto real de Flash Attention vs implementação naive em modelos de produção?"
          a={<>Em modelos de produção com batch de requests concorrentes e seq_len de 4k-32k tokens: Flash Attention reduz uso de memória para KV em ~50-70% (elimina materialização da matriz NxN) e acelera o paso de attention 2-4×. Para seq_len curto (≤512), o ganho é menor. O impacto total no throughput end-to-end é menor que os números de attention isolada — prefill e decode são bottlenecks diferentes. O maior ganho é no suporte a janelas de contexto maiores no mesmo hardware.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Continuous batching (vLLM) é o maior ganho único em throughput —
        10-30× vs static batching. Flash Attention resolve IO-bound do attention — 2-4× memória e speedup,
        essencial para contextos longos. PagedAttention elimina fragmentação do KV cache — 2-4× mais
        requests concorrentes. Speculative Decoding reduz latência de decode 2-4× sem alterar qualidade.
        Stack recomendado 2026: vLLM + Flash Attention + PagedAttention + AWQ INT4 + continuous batching.
      </Callout>
    </div>
  );
}
