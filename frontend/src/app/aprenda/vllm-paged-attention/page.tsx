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
  NodeGraph,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('vllm-paged-attention');

const ACCENT = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é a analogia central do PagedAttention (Kwon et al., SOSP 2023)?',
    options: [
      'Disco RAM com swap em SSD',
      'Memória virtual de sistemas operacionais: o KV cache é dividido em blocos físicos não-contíguos de tamanho fixo (16 tokens default), e uma "page table" por sequência mapeia tokens lógicos contíguos para blocos físicos arbitrários — elimina fragmentação interna/externa e permite compartilhamento de blocos entre sequências',
      'Cache de CPU L1/L2/L3',
      'Sharding de banco de dados por hash',
    ],
    correct: 1,
    explanation:
      'O paper de Woosuk Kwon et al. (SOSP 2023) traz literalmente a metáfora de virtual memory. Antes do vLLM, KV cache era alocado como tensor contíguo de [max_seq_len × hidden], causando 60-80% de waste por fragmentação. PagedAttention aloca blocos físicos sob demanda e usa block_tables para mapeamento lógico→físico. Resultado: 2-4× mais sequências concorrentes na mesma VRAM, base do throughput 10-24× do vLLM.',
  },
  {
    question: 'O que é continuous batching no vLLM e como difere de static batching?',
    options: [
      'Treinar continuamente',
      'A cada step de decoding, o scheduler reavalia: sequências que terminaram saem, novas requests entram nos slots livres — diferente de static batching que espera todo o batch terminar. Permite mix de prefill+decode no mesmo step (chunked prefill) maximizando utilização da GPU',
      'Bater tokens em GPU sem usar HBM',
      'Streaming dos tokens via WebSocket',
    ],
    correct: 1,
    explanation:
      'Continuous batching (originado no Orca, OSDI 2022; popularizado por vLLM) preempta o batch a cada token. Combinado com chunked prefill (vLLM v0.5+), prefills longos são fatiados e intercalados com decodes de outras requests, mantendo a GPU saturada. Em workloads heterogêneos reais, dá 5-20× throughput vs HuggingFace TGI estático antigo.',
  },
  {
    question: 'Como funciona prefix caching automático no vLLM?',
    options: [
      'Cache de respostas em Redis',
      'Os blocos de KV cache que correspondem a prefixos comuns (ex: system prompt repetido em todas requests) são content-addressed por hash do conteúdo lógico — quando uma nova request começa com o mesmo prefixo, vLLM reusa esses blocos sem recomputar prefill, economizando tempo proporcional ao tamanho do prefixo compartilhado',
      'Embeddings pré-computados de tokens',
      'Cache no client-side via cookie',
    ],
    correct: 1,
    explanation:
      'Ativado com --enable-prefix-caching. Cada bloco físico de 16 tokens é hashed pelo seu conteúdo lógico (tokens + prefix). Workloads com system prompt longo repetido (chatbots multi-tenant, RAG com mesmo contexto) ganham 30-80% redução de TTFT. Custo: ~constante de hashing, eviction LRU quando blocos cheios.',
  },
  {
    question: 'O que faz tensor parallelism (TP) no vLLM?',
    options: [
      'Treina o tensor em paralelo',
      'Particiona cada matriz de pesos do modelo (W_q, W_k, W_v, W_o, MLP) ao longo de uma dimensão entre N GPUs — cada GPU computa sua fatia, all-reduce sincroniza resultados; latência por step menor (paraleliza compute) ao custo de bandwidth NVLink/PCIe constante por step',
      'Roda múltiplas requests em paralelo',
      'Quantiza tensores em paralelo',
    ],
    correct: 1,
    explanation:
      'TP (Shoeybi et al., Megatron-LM 2019) split intra-layer. vLLM usa --tensor-parallel-size=N. Modelo de 70B em FP16 (140GB) cabe em 4× A100 80GB ou 2× H100 80GB com TP=4 ou TP=2. Exige NVLink (NVIDIA) ou interconnect rápido — em PCIe puro a comunicação domina. Pipeline parallelism (PP) é alternativa que troca compute por bandwidth.',
  },
  {
    question: 'Por que vLLM é compatível com OpenAI API e não inventa uma própria?',
    options: [
      'Lobby da OpenAI exige',
      'Decisão pragmática: o ecossistema (LangChain, instructor, openai SDK) já fala protocolo OpenAI; oferecer /v1/chat/completions, /v1/completions, /v1/embeddings drop-in significa que migrar de gpt-4o para self-hosted é trocar base_url — sem reescrever clients. vLLM serve mantém parity com endpoints/params da OpenAI',
      'Não é compatível',
      'É um sub-projeto da OpenAI',
    ],
    correct: 1,
    explanation:
      '`vllm serve` expõe /v1/* idêntico à OpenAI: stream=True, tools, response_format, logprobs. Você pode apontar `openai.OpenAI(base_url="http://localhost:8000/v1")` para vLLM e tudo funciona. Estratégia que tornou vLLM padrão de facto em self-hosted serving de produção 2024-2026.',
  },
  {
    question: 'Quando NÃO usar vLLM?',
    options: [
      'Sempre que possível',
      'CPU-only deployment (vLLM exige CUDA/ROCm/TPU); workloads single-user com 1-2 requests por minuto onde overhead de scheduler não compensa; edge devices; modelos minúsculos (<1B) onde llama.cpp é mais simples e batching ganha pouco',
      'Em servidores AMD',
      'Apenas para modelos OpenAI',
    ],
    correct: 1,
    explanation:
      'vLLM brilha em GPU + concorrência. Em CPU, llama.cpp domina. Em uma VPS pequena com 2 usuários, Ollama é mais simples. Em mobile/edge, ExecuTorch/MLX. vLLM já suporta AMD ROCm (MI300X) e Inferentia/TPU — não é exclusivo NVIDIA. Mas sem GPU não roda.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="vllm-paged-attention"
      title="vLLM e PagedAttention: serving high-throughput"
      icon="🚄"
      xp={75}
      readTime={15}
      trailName="Local LLMs & Edge AI"
      trailColor={ACCENT}
      nextSlug="speculative-decoding"
      nextTitle="Speculative decoding: 2-3x speedup grátis"
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
        Em setembro de 2023, Woosuk Kwon e equipe (Sky Computing Lab, UC Berkeley) publicaram{' '}
        <em>"Efficient Memory Management for Large Language Model Serving with PagedAttention"</em> no SOSP. O
        paper trouxe ao mundo de LLM serving uma técnica que sistemas operacionais usam há 50 anos: memória
        virtual paginada. O resultado — vLLM — entrega 10-24× mais throughput que HuggingFace TGI antigo e
        tornou-se a infraestrutura padrão para self-hosted serving em 2026.
      </p>

      <Section title="O problema: KV cache desperdiça memória" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em LLM serving tradicional, alocava-se KV cache como tensor contíguo de tamanho{' '}
          <InlineCode>[max_seq_len × n_heads × d_head]</InlineCode> por sequência. Problemas:
        </p>
        <NodeGraph
          accent={ACCENT}
          title="Tipos de waste em KV cache (pré-vLLM)"
          columns={[
            {
              label: 'Internal fragmentation',
              nodes: [
                { icon: '🗑️', label: 'Reserva 2048, usa 200', sub: '90% memória reservada não-utilizada', tone: 'danger' },
                { icon: '🗑️', label: 'Pior em outputs variáveis', sub: 'impossível prever quantos tokens vão sair', tone: 'danger' },
              ],
            },
            {
              label: 'External fragmentation',
              nodes: [
                { icon: '🧩', label: 'Buracos não-contíguos', sub: 'cada seq exige bloco contíguo grande', tone: 'danger' },
                { icon: '🧩', label: 'Cabe 4× 500MB mas não 1× 1.5GB', sub: 'memória total existe mas inutilizável', tone: 'danger' },
              ],
            },
            {
              label: 'Reservation overhead',
              nodes: [
                { icon: '📦', label: 'Pre-allocate max worst-case', sub: 'até 60-80% waste em workloads reais', tone: 'muted' },
              ],
            },
          ]}
        />
        <Callout tone="warn">
          Resultado prático: HuggingFace TGI v1 conseguia ~10 sequências concorrentes em uma A100 80GB com Llama
          13B em FP16. vLLM com PagedAttention atinge 50-80 sequências no mesmo hardware. <strong>5-8× mais
          throughput pela mesma memória.</strong>
        </Callout>
      </Section>

      <Section title="PagedAttention: KV cache em blocos" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          A inovação central: tratar KV cache como{' '}
          <strong>memória virtual paginada</strong>. Divide-se em <strong>blocos físicos</strong> de tamanho fixo
          (default 16 tokens). Cada sequência mantém uma <strong>block table</strong> mapeando posições lógicas
          (token 0..n) para blocos físicos arbitrários. Os blocos físicos não precisam ser contíguos na VRAM.
        </p>
        <FlowDiagram
          accent={ACCENT}
          title="Allocação PagedAttention"
          orientation="vertical"
          steps={[
            { icon: '🆕', label: 'Nova request com prompt 200 tokens', desc: 'precisa de ⌈200/16⌉ = 13 blocos' },
            { icon: '🎯', label: 'Allocator entrega 13 blocos físicos livres', desc: 'IDs arbitrários (ex: 47, 12, 99, 3, ...)' },
            { icon: '📋', label: 'Block table da seq A = [47, 12, 99, 3, ...]', desc: 'mapeamento lógico→físico' },
            { icon: '🔁', label: 'Decode: gera token 201', desc: 'precisa de novo bloco (16°). Allocator dá um livre.' },
            { icon: '🏁', label: 'Sequência termina', desc: 'libera 14 blocos para a pool — outras requests reusam' },
          ]}
        />
        <CodeBlock lang="python">{`# Pseudocódigo de PagedAttention CUDA kernel (simplificado)
# Cada thread block processa attention para 1 sequência, varrendo seus blocos físicos
def paged_attention_kernel(
    Q,                # [num_seqs, num_heads, head_dim]
    K_cache,          # [num_blocks, num_heads, head_dim, block_size]
    V_cache,          # idem
    block_tables,     # [num_seqs, max_num_blocks_per_seq] → physical block id
    seq_lens,         # [num_seqs]
):
    seq_idx = block_idx_x
    head_idx = block_idx_y

    q = Q[seq_idx, head_idx]                         # carrega Q em registradores
    block_table = block_tables[seq_idx]
    seq_len = seq_lens[seq_idx]

    # online softmax (FlashAttention-style)
    m = -inf; l = 0.0; o = 0.0

    for logical_block_idx in range(ceil(seq_len / block_size)):
        physical_block_id = block_table[logical_block_idx]
        K_block = K_cache[physical_block_id, head_idx]  # [head_dim, block_size]
        V_block = V_cache[physical_block_id, head_idx]

        scores = q @ K_block / sqrt(head_dim)         # [block_size]
        m_new = max(m, scores.max())
        l_new = exp(m - m_new) * l + sum(exp(scores - m_new))
        o = exp(m - m_new) * o + V_block @ exp(scores - m_new)
        m, l = m_new, l_new

    output[seq_idx, head_idx] = o / l`}</CodeBlock>
        <AnnotatedFormula
          title="Throughput ganho via menos waste"
          accent={ACCENT}
          formula="capacity_seqs = (VRAM_total - weights) / (avg_seq_len · KV_per_token)"
          parts={[
            { text: 'antes', annotation: 'avg_seq_len ≈ max_seq_len (reserva)', highlight: false },
            { text: 'depois', annotation: 'avg_seq_len = real (paginação)', highlight: true },
            { text: '~4× mais seqs', annotation: 'em workloads heterogêneos', highlight: true },
          ]}
        />
      </Section>

      <Section title="Continuous batching + chunked prefill" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          PagedAttention sozinho economiza memória. O segundo pilar do throughput é o{' '}
          <strong>scheduler</strong>: a cada step do GPU, o vLLM scheduler reavalia qual conjunto de sequências
          formar o próximo batch. Sequências que terminaram saem; novas entram; prefills longos são fatiados.
        </p>
        <StackFlow
          title="Scheduler vLLM por step"
          accent={ACCENT}
          items={[
            { icon: '📥', label: '1. Coleta requests pendentes', sub: 'da queue HTTP + retomadas (swap-out)' },
            { icon: '🧮', label: '2. Verifica orçamento de tokens', sub: 'max_num_batched_tokens (ex: 8192)' },
            { icon: '✂️', label: '3. Chunked prefill', sub: 'prefill de 10k tokens vira chunks de 2k intercalados com decodes' },
            { icon: '🚄', label: '4. Forma batch hetero (prefill+decode)', sub: 'maximiza FLOPs sem ultrapassar orçamento' },
            { icon: '🎯', label: '5. Executa step CUDA', sub: 'forward unificado prefill+decode' },
            { icon: '🔄', label: '6. Pós-step: decisão sobre swap', sub: 'se memória apertar, swap-out blocks de baixa prioridade' },
          ]}
        />
        <Callout tone="info">
          <strong>Chunked prefill</strong> (vLLM v0.5+, paper "Sarathi-Serve") evita que um prompt longo de 30k
          tokens bloqueie todo o batch durante seu prefill. O prefill é dividido em chunks de N tokens e cada
          chunk roda junto de decodes de outras sequências. Resultado: latência por token (decode) cai mesmo
          quando há prefills enormes na fila.
        </Callout>
      </Section>

      <Section title="Prefix caching: o segredo dos chatbots multi-tenant" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Ativar prefix caching
vllm serve meta-llama/Meta-Llama-3.1-70B-Instruct \\
    --tensor-parallel-size 4 \\
    --enable-prefix-caching \\
    --block-size 16 \\
    --max-model-len 32768 \\
    --gpu-memory-utilization 0.92`}</CodeBlock>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Cada bloco físico recebe um <strong>hash</strong> do seu conteúdo lógico (tokens + hash do bloco
          anterior). Duas sequências que começam com o mesmo prefixo apontam para os mesmos blocos físicos —
          prefill é pulado para a parte compartilhada. Workloads que beneficiam:
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Workload', 'Padrão de prefixo', 'Ganho típico TTFT']}
          rows={[
            ['Chatbot com system prompt 2k tokens', 'system prompt repetido em 100% das requests', '60-80% redução'],
            ['RAG com mesmo doc base (FAQ)', 'doc base repetido em 70% das requests', '40-60% redução'],
            ['Code assistant com prelúdio (linguagem, libs)', 'prelúdio repetido em sessions', '30-50% redução'],
            ['Chat multi-turn', 'histórico cresce; cada turn reusa anterior', '50-90% por turn'],
            ['Requests aleatórias sem prefixo comum', 'baixíssima reutilização', '~0% (overhead negligível)'],
          ]}
        />
      </Section>

      <Section title="Tensor parallelism para modelos gigantes" accent={ACCENT}>
        <CodeBlock lang="bash">{`# Llama 3.1 70B em 4× A100 80GB com TP=4
vllm serve meta-llama/Meta-Llama-3.1-70B-Instruct \\
    --tensor-parallel-size 4 \\
    --quantization awq_marlin \\           # INT4 AWQ + Marlin kernel
    --kv-cache-dtype fp8_e5m2 \\           # KV cache em FP8 (Hopper+)
    --max-model-len 32768 \\
    --max-num-seqs 128 \\
    --enable-prefix-caching \\
    --enable-chunked-prefill \\
    --gpu-memory-utilization 0.93 \\
    --port 8000

# Throughput esperado (chat tipico 256 in / 256 out):
# - sem otimizações: ~50 req/min
# - com PagedAttention + cont batching: ~600 req/min
# - + AWQ INT4 + FP8 KV + prefix cache: ~1200-1800 req/min`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['Estratégia paralelismo', 'Granularidade', 'Bandwidth crítica', 'Quando usar']}
          rows={[
            ['Tensor Parallelism (TP)', 'Split intra-layer', 'NVLink alto (300+ GB/s)', 'Single node multi-GPU, baixa latência'],
            ['Pipeline Parallelism (PP)', 'Split inter-layer', 'Inter-node OK (10-100 GB/s)', 'Multi-node, throughput-oriented'],
            ['Data Parallelism (DP)', 'Replica modelo, divide batch', 'Mínima (só gradients em training)', 'Múltiplas réplicas inferência'],
            ['Expert Parallelism (EP)', 'MoE experts em GPUs diferentes', 'All-to-all', 'Mixtral, DeepSeek-V3'],
            ['Sequence Parallelism', 'Split sequência longa', 'Inter-GPU', 'Long context (>128k)'],
          ]}
        />
      </Section>

      <Section title="OpenAI API compat e SDK" accent={ACCENT}>
        <CodeBlock lang="python">{`# Cliente OpenAI apontando para vLLM
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:8000/v1",
    api_key="not-needed",   # vLLM ignora; configure auth no proxy
)

resp = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3.1-70B-Instruct",
    messages=[
        {"role": "system", "content": "Você é tutor da FFV Academy."},
        {"role": "user", "content": "Explique PagedAttention em 3 bullets."},
    ],
    temperature=0.5,
    stream=True,
    extra_body={
        "min_p": 0.05,
        "repetition_penalty": 1.0,
        "use_beam_search": False,
    },
)
for chunk in resp:
    print(chunk.choices[0].delta.content or "", end="", flush=True)`}</CodeBlock>
        <Callout tone="info">
          Endpoints suportados (≈parity com OpenAI):{' '}
          <InlineCode>/v1/chat/completions</InlineCode>, <InlineCode>/v1/completions</InlineCode>,{' '}
          <InlineCode>/v1/embeddings</InlineCode>, <InlineCode>/v1/models</InlineCode>. Extras vLLM via{' '}
          <InlineCode>extra_body</InlineCode>: min_p, top_k, repetition_penalty, guided_json (JSON schema),
          guided_regex, guided_choice.
        </Callout>
      </Section>

      <Section title="Quando escolher cada serving engine" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Engine', 'Stack', 'Force', 'Use quando']}
          rows={[
            ['vLLM', 'Python + CUDA/ROCm/TPU', 'PagedAttn, prefix cache, multi-GPU TP', 'Self-hosted alta concorrência, throughput >100 req/s'],
            ['TensorRT-LLM', 'C++ + CUDA (NVIDIA)', 'Fused kernels, FP8 nativo', 'Datacenter NVIDIA, latência mínima absoluta'],
            ['TGI (HuggingFace)', 'Python + Rust + CUDA', 'Integração HF Hub, AMD ROCm', 'Quem já vive no ecossistema HF'],
            ['SGLang', 'Python + CUDA', 'RadixAttention (better prefix), constrained gen', 'Workloads agentes complexos, JSON-heavy'],
            ['Ollama', 'Go + llama.cpp', 'UX, multi-model, CPU/GPU consumer', 'Dev local, multi-model com baixo QPS'],
            ['llama.cpp', 'C++ puro', 'Edge, CPU-only, hardware misto', 'Edge devices, CPU-only, fallback universal'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="vLLM funciona em AMD ou só NVIDIA?"
          a={<>Sim, vLLM suporta AMD ROCm (MI300X) desde v0.4. Builds com <InlineCode>ROCM_VERSION=6.x</InlineCode>. Também suporta TPU (via PyTorch XLA), AWS Inferentia2, e CPU-only experimental. Mas NVIDIA continua o backend mais maduro e otimizado.</>}
        />
        <QAItem
          q="Posso quantizar KV cache no vLLM?"
          a={<>Sim, em Hopper+ (H100/H200/B200) com <InlineCode>--kv-cache-dtype fp8_e5m2</InlineCode> ou <InlineCode>fp8_e4m3</InlineCode>. Reduz pela metade vs FP16, sem perda mensurável em quase todos benchmarks. Em Ampere (A100) o FP8 cache também funciona mas via emulação.</>}
        />
        <QAItem
          q="Como ativar speculative decoding no vLLM?"
          a={<>v0.5+ via <InlineCode>--speculative-model llama-3.2-1b-instruct --num-speculative-tokens 5</InlineCode>. Target e draft devem compartilhar tokenizer. Ganho 1.5-2.5× em texto previsível. Coberto em detalhe no próximo módulo.</>}
        />
        <QAItem
          q="vLLM tem benchmark padrão para comparar?"
          a={<>Sim: <InlineCode>benchmarks/benchmark_serving.py</InlineCode> simula tráfego Poisson com prompts ShareGPT. Métricas: TTFT, ITL (inter-token latency), throughput (tokens/s server), request throughput. Use isso para comparar configs antes de prod, não LLMperf etc.</>}
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'PagedAttention paper', v: 'Kwon et al., "Efficient Memory Management for LLM Serving with PagedAttention", SOSP 2023, arXiv:2309.06180' },
            { k: 'Repo', v: 'github.com/vllm-project/vllm (Sky Computing Lab → comunidade vLLM)' },
            { k: 'Orca (continuous batching)', v: 'Yu et al., "Orca: A Distributed Serving System...", OSDI 2022' },
            { k: 'Chunked prefill / Sarathi-Serve', v: 'Agrawal et al., "Taming Throughput-Latency Tradeoff in LLM Inference", OSDI 2024' },
            { k: 'Megatron-LM (TP)', v: 'Shoeybi et al., "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism", arXiv:1909.08053' },
            { k: 'Marlin kernel', v: 'Frantar et al., "Marlin: Mixed-Precision Auto-Regressive Parallel Inference", IST Austria 2024' },
          ]}
        />
      </Section>
    </div>
  );
}
