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

export const metadata = getModuleMetadata('llama-cpp-internals');

const ACCENT = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que é o ggml e por que llama.cpp não usa PyTorch?',
    options: [
      'ggml é um wrapper de PyTorch em C',
      'ggml é uma biblioteca de tensores em C puro (zero deps Python), com graph estático construído em runtime, kernels SIMD/Metal/CUDA escritos à mão e memory layout otimizado para mmap — permite distribuir um binário ~5MB sem cuDNN nem libtorch (~2GB)',
      'ggml é fork do TensorFlow Lite',
      'llama.cpp usa PyTorch internamente desde a v2.0',
    ],
    correct: 1,
    explanation:
      'ggml (Georgi Gerganov ML library) foi criada para inferência sem dependências. Tensor types embutidos (F32, F16, Q4_K, Q5_K, ...), graph builder, kernel dispatcher por backend. O resultado: llama-cli binário standalone, mmap direto do GGUF, pronto para rodar em Raspberry Pi a A100. PyTorch traria Python+CUDA runtime, inviabilizando edge.',
  },
  {
    question: 'O que é KV cache e por que ele domina a memória durante decoding longo?',
    options: [
      'É um cache em disco dos prompts mais comuns',
      'São os tensores Key e Value de cada token já processado, armazenados por layer × head para evitar recomputar attention nos tokens anteriores — cresce O(n·layers·heads·d_head·2·bytes) e em contextos de 128k tokens supera o tamanho dos pesos do próprio modelo',
      'É uma estrutura de dados que armazena os tokens gerados em uma fila circular',
      'KV cache é exclusivo do GPT-4, llama.cpp não usa',
    ],
    correct: 1,
    explanation:
      'Para Llama 3.1 8B (32 layers, 8 KV heads via GQA, d_head=128, FP16): cada token KV custa 32·8·128·2·2 = 131 KB. Em 128k tokens são ~16 GB só de KV cache — supera os 4.5 GB do modelo INT4. Por isso GQA (Grouped Query Attention) reduzindo KV heads é tão importante, e por isso KV cache também pode ser quantizado (Q8/Q4 cache).',
  },
  {
    question: 'Qual é a ideia central do FlashAttention-2 (Tri Dao, 2023)?',
    options: [
      'Substituir softmax por sigmoid',
      'Reorganizar o cálculo de attention em tiles que cabem em SRAM (memória rápida on-chip da GPU), evitando materializar a matriz N×N em HBM — calcula softmax incrementalmente com running max para estabilidade numérica, atingindo 2-4× speedup vs attention naive sem aproximação',
      'Eliminar o produto QKᵀ usando apenas Q',
      'Quantizar attention scores para INT4',
    ],
    correct: 1,
    explanation:
      'FlashAttention (Dao et al., NeurIPS 2022; v2 em 2023) é IO-aware: o gargalo de attention não é FLOPs, é memória HBM. Tilando Q, K, V em blocos que cabem em SRAM (~100KB por SM), faz attention exata sem nunca formar a matriz N×N completa. Llama.cpp implementa FA2 nos backends CUDA/Metal/CPU. Memória O(N) em vez de O(N²).',
  },
  {
    question: 'Como llama.cpp consegue rodar Llama 70B em hardware com 24GB de VRAM?',
    options: [
      'Comprimindo o modelo on-the-fly via gzip',
      'Split tensor: layers configurados via --n-gpu-layers ficam em VRAM, restante mmapped em RAM do host; KV cache pode ficar em RAM com penalty PCIe; o overhead é latência de tokens iniciais, não tokens/s sustentado (após warm-up cache fica quente)',
      'Não consegue — é impossível',
      'Usa swap em disco com I/O assíncrono',
    ],
    correct: 1,
    explanation:
      'O flag -ngl N (n-gpu-layers) determina quantas das 80 layers do 70B vão para GPU. Com Q4_K_M (~40GB) e RTX 4090 24GB, cabem ~40 layers em GPU; resto mmapped em RAM. PCIe 4.0 ~32 GB/s, suficiente para 5-10 tok/s sustentado. É lento vs serving puro em GPU, mas viabiliza modelos que de outra forma não rodariam.',
  },
  {
    question: 'O que é continuous batching e quando llama.cpp ativa?',
    options: [
      'Treinar continuamente em batches grandes',
      'Estratégia de scheduling onde requests novas entram no batch a cada step (não esperam o batch atual terminar), maximizando GPU utilization quando há mix de prompts curtos+longos — habilitado em llama.cpp via servidor com --parallel N e --cont-batching',
      'Cache que persiste entre invocações do binário',
      'Apenas um nome alternativo para gradient accumulation',
    ],
    correct: 1,
    explanation:
      'Em batching estático, requests rápidas esperam as lentas terminarem (head-of-line blocking). Continuous batching (popularizado por Orca/vLLM, replicado em llama.cpp server) preempta o batch a cada token: requests terminadas saem, novas entram. Em workloads de chat real (prompts heterogêneos), aumenta throughput 2-5×. O servidor llama.cpp ativa via --cont-batching.',
  },
  {
    question: 'Quantização do KV cache: vantagem e risco?',
    options: [
      'Sem vantagem — só piora qualidade',
      'Vantagem: reduzir o KV cache de FP16 para Q8_0 ou Q4_0 corta memória pela metade ou 4× (essencial em contextos longos). Risco: erros de quantização acumulam ao longo do decoding — Q4_0 cache pode degradar respostas após 8-16k tokens; Q8_0 é seguro até 128k',
      'É impossível quantizar KV cache em arquitetura transformer',
      'Quantizar KV cache torna o modelo determinístico',
    ],
    correct: 1,
    explanation:
      'Flags --cache-type-k e --cache-type-v controlam o tipo do KV cache. Q8_0 reduz pela metade com perda invisível em quase todos workloads. Q4_0 reduz 4× mas pode introduzir drift em contextos longos. Em modelos de 70B+ com 128k contexto, Q8_0 cache pode ser a diferença entre caber e não caber em 96GB de RAM unificada.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="llama-cpp-internals"
      title="llama.cpp internals: ggml, KV cache, FlashAttention"
      icon="⚙️"
      xp={75}
      readTime={15}
      trailName="Local LLMs & Edge AI"
      trailColor={ACCENT}
      nextSlug="ollama-production-deploy"
      nextTitle="Ollama em produção: model management, Docker, monitoring"
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
        llama.cpp é a infraestrutura silenciosa do ecossistema de LLMs locais. Por trás de Ollama, LM Studio,
        Jan, Faraday e dezenas de wrappers, está o mesmo binário em C++ puro de Georgi Gerganov — sem PyTorch,
        sem Python, com mmap, kernels SIMD/Metal/CUDA escritos à mão, FlashAttention-2 e continuous batching.
        Entender o que acontece dentro de <InlineCode>llama-cli</InlineCode> é o que separa quem usa o ecossistema
        de quem o domina.
      </p>

      <Section title="ggml: a biblioteca de tensores que ninguém vê" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          ggml é o coração do projeto. Uma library em C99 que implementa:{' '}
          <strong>tipos de tensor</strong> (F32, F16, BF16, Q2_K...Q8_0, IQ-quants),{' '}
          <strong>graph builder estático</strong> em runtime, <strong>kernel dispatcher</strong> por backend
          (CPU SIMD, CUDA, Metal, Vulkan, ROCm, SYCL, CANN para Ascend), e{' '}
          <strong>memory allocator</strong> com pools pré-alocados. Sem dependências Python. Sem libtorch. Binário
          final ~5MB.
        </p>
        <StackFlow
          title="Camadas internas de llama.cpp"
          accent={ACCENT}
          items={[
            { icon: '🧠', label: 'llama.cpp (model loader, sampling, chat templates)', sub: 'parser GGUF, KV cache mgmt, batched decoding, tokenizer (BPE/SentencePiece)' },
            { icon: '🧮', label: 'ggml-backend (dispatch layer)', sub: 'abstrai backend; mesma graph roda em CPU, CUDA, Metal' },
            { icon: '⚡', label: 'ggml-cuda / ggml-metal / ggml-vulkan / ggml-cpu', sub: 'kernels específicos — FlashAttention, GEMM quantizado, RoPE, RMSNorm' },
            { icon: '📐', label: 'ggml core (tensor types, graph, alloc)', sub: 'ggml_tensor, ggml_cgraph, ggml_context, ggml_gallocr' },
            { icon: '🔢', label: 'BLAS / cuBLAS / Accelerate (opcional)', sub: 'GEMM FP16/BF16 quando vale a pena chamar' },
          ]}
        />
        <CodeBlock lang="c">{`// ggml — exemplo minimal de graph (do source de llama.cpp)
struct ggml_context * ctx = ggml_init({ .mem_size = 16*1024*1024 });

// Tensores: pesos quantizados e input
struct ggml_tensor * w = ggml_new_tensor_2d(ctx, GGML_TYPE_Q4_K, n_in, n_out);
struct ggml_tensor * x = ggml_new_tensor_1d(ctx, GGML_TYPE_F32, n_in);

// Forward: y = w @ x  — kernel dispatch automático para backend
struct ggml_tensor * y = ggml_mul_mat(ctx, w, x);

// Build graph e compute
struct ggml_cgraph * gf = ggml_new_graph(ctx);
ggml_build_forward_expand(gf, y);
ggml_graph_compute_with_ctx(ctx, gf, /*n_threads=*/8);`}</CodeBlock>
        <Callout tone="info">
          A separação <strong>graph builder</strong> + <strong>backend dispatcher</strong> permite a mesma graph
          rodar em CPU AVX-512, GPU Metal de M3 Ultra e GPU CUDA de H100 sem mudar uma linha de código de modelo.
          Trocas via <InlineCode>ggml_backend_t</InlineCode>.
        </Callout>
      </Section>

      <Section title="KV cache: o monstro da memória" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Em cada step de decoding, o modelo precisa do K e V de TODOS os tokens anteriores para calcular
          attention. Recomputar a cada token seria O(n²) — em vez disso, cacheamos. KV cache é tipicamente o{' '}
          <strong>segundo maior consumidor de memória</strong> depois dos pesos, e em contextos longos vira o{' '}
          <strong>primeiro</strong>.
        </p>
        <AnnotatedFormula
          title="Tamanho do KV cache"
          accent={ACCENT}
          formula="bytes = 2 · n_layers · n_kv_heads · d_head · n_tokens · bytes_per_elem"
          parts={[
            { text: '2', annotation: 'K e V' },
            { text: 'n_layers', annotation: '32 em Llama 8B; 80 em 70B' },
            { text: 'n_kv_heads', annotation: 'GQA reduz: 8 em Llama 3', highlight: true },
            { text: 'd_head', annotation: '128 padrão' },
            { text: 'bytes', annotation: '2 (FP16), 1 (Q8), 0.5 (Q4)', highlight: true },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'Contexto', 'KV cache FP16', 'KV cache Q8_0', 'KV cache Q4_0']}
          rows={[
            ['Llama 3.1 8B (GQA-8)', '8k', '1.0 GB', '512 MB', '256 MB'],
            ['Llama 3.1 8B (GQA-8)', '128k', '16 GB', '8 GB', '4 GB'],
            ['Llama 3.1 70B (GQA-8)', '8k', '2.5 GB', '1.25 GB', '640 MB'],
            ['Llama 3.1 70B (GQA-8)', '128k', '40 GB', '20 GB', '10 GB'],
            ['Mistral 7B (MHA-32)', '32k', '16 GB', '8 GB', '4 GB'],
          ]}
        />
        <CodeBlock lang="bash">{`# llama.cpp — controle de KV cache
./llama-cli \\
    -m llama-3.1-70b-Q4_K_M.gguf \\
    --ctx-size 32768 \\
    --cache-type-k q8_0 \\           # quantiza K cache para INT8
    --cache-type-v q8_0 \\           # quantiza V cache para INT8
    --flash-attn \\                  # ativa FlashAttention-2 (CUDA/Metal)
    -ngl 80 \\                       # offload TODAS as 80 layers para GPU
    --temp 0.7 -p "Explique MVCC em PostgreSQL."`}</CodeBlock>
        <Callout tone="warn">
          <strong>Q4_0 cache</strong> pode causar drift em contextos longos (8k+) — erros de quantização
          acumulam ao longo de cada step. Default: Q8_0 K + Q8_0 V (invisível em qualidade). Se memória apertar,
          comece quantizando V (mais resiliente) antes de K.
        </Callout>
      </Section>

      <Section title="FlashAttention-2: attention IO-aware" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Tri Dao, Stanford (NeurIPS 2022 / arXiv:2307.08691 para v2)</strong> notou que attention não é
          compute-bound — é memory-bound. Em GPUs modernas, FLOPs sobram; o gargalo é mover tensores entre HBM
          (~2 TB/s) e SRAM on-chip (~20 TB/s). Attention naive materializa a matriz N×N (scores) em HBM, fazendo
          O(N²) reads/writes. FlashAttention nunca materializa essa matriz: tila Q, K, V em blocos que cabem em
          SRAM e computa softmax incrementalmente.
        </p>
        <FlowDiagram
          accent={ACCENT}
          title="FlashAttention-2 — algoritmo simplificado"
          orientation="vertical"
          steps={[
            { icon: '✂️', label: 'Tile Q em blocos Bᵣ, K/V em Bc', desc: 'tamanhos escolhidos para caber em SRAM (~100KB/SM)' },
            { icon: '🔁', label: 'Loop externo: cada bloco Q', desc: 'carrega Qᵢ em SRAM uma vez' },
            { icon: '🔁', label: 'Loop interno: cada bloco K/V', desc: 'Sᵢⱼ = Qᵢ·Kⱼᵀ; running max + soma para softmax estável' },
            { icon: '➕', label: 'Acumula Oᵢ incrementalmente', desc: 'rescale running com novo max via exp(m_old - m_new)' },
            { icon: '💾', label: 'Escreve Oᵢ em HBM uma vez', desc: 'sem nunca materializar S em HBM' },
          ]}
        />
        <AnnotatedFormula
          title="Online softmax (Milakov & Gimelshein 2018)"
          accent={ACCENT}
          formula="m_new = max(m_old, m_tile); ℓ_new = e^(m_old-m_new)·ℓ_old + Σ e^(s-m_new); O_new = (e^(m_old-m_new)·ℓ_old·O_old + Σ e^(s-m_new)·V) / ℓ_new"
          parts={[
            { text: 'm', annotation: 'running max para estabilidade' },
            { text: 'ℓ', annotation: 'soma do denominador softmax' },
            { text: 'rescale', annotation: 'corrige acumuladores antigos', highlight: true },
          ]}
        />
        <Callout tone="info">
          FlashAttention é <strong>matematicamente exato</strong> — não é aproximação. Mesmos resultados de
          attention naive até erros de ponto flutuante. O speedup é puro ganho de bandwidth. Em llama.cpp, ativar{' '}
          <InlineCode>--flash-attn</InlineCode> dá 1.5-3× em decoding longo (e habilita KV cache quantizado).
        </Callout>
      </Section>

      <Section title="Batched decoding e continuous batching" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Single-request decoding subutiliza a GPU: cada step gera 1 token usando todo o tensor de pesos. Batched
          decoding processa N requests em paralelo (pesos lidos 1 vez, N tokens emitidos). Mas batching estático
          sofre de head-of-line blocking: prompts curtos esperam os longos.
        </p>
        <NodeGraph
          accent={ACCENT}
          title="Static batching vs Continuous batching"
          columns={[
            {
              label: 'Static (clássico)',
              nodes: [
                { icon: '⏸️', label: 'Req A (curta)', sub: 'termina em 20 steps, espera 480 ociosos', tone: 'danger' },
                { icon: '⏸️', label: 'Req B (média)', sub: 'termina em 200 steps, espera 300', tone: 'muted' },
                { icon: '🏁', label: 'Req C (longa)', sub: '500 steps — todo o batch dura até ela acabar', tone: 'emphasis' },
              ],
            },
            {
              label: 'Continuous (Orca/vLLM/llama.cpp)',
              nodes: [
                { icon: '✅', label: 'Req A finaliza em 20', sub: 'sai do batch imediatamente', tone: 'success' },
                { icon: '🔄', label: 'Req D entra no slot livre', sub: 'sem esperar batch atual', tone: 'emphasis' },
                { icon: '🔄', label: 'Req E entra no slot livre', sub: 'GPU sempre saturada', tone: 'emphasis' },
                { icon: '📈', label: '2-5× throughput em workload real', sub: 'prompts heterogêneos', tone: 'success' },
              ],
            },
          ]}
          legend="Tokens curtos não bloqueiam tokens longos — preempção a cada step"
        />
        <CodeBlock lang="bash">{`# Servidor llama.cpp com continuous batching
./llama-server \\
    -m llama-3.1-8b-Q4_K_M.gguf \\
    --host 0.0.0.0 --port 8080 \\
    -ngl 32 \\
    --parallel 8 \\                    # até 8 requests concorrentes
    --cont-batching \\                 # preempção entre steps
    --ctx-size 16384 \\                # contexto TOTAL dividido entre slots
    --batch-size 512 \\                # prefill chunk size
    --flash-attn \\
    --cache-type-k q8_0 --cache-type-v q8_0

# A API REST é compatível com OpenAI:
# curl http://localhost:8080/v1/chat/completions \\
#   -d '{"model":"local","messages":[{"role":"user","content":"oi"}]}'`}</CodeBlock>
      </Section>

      <Section title="Sampling: como escolher o próximo token" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          O modelo gera logits sobre todo o vocab (~128k entradas). Sampling transforma logits em token. llama.cpp
          tem uma pipeline configurável de samplers aplicados em sequência: cada um filtra ou modifica a
          distribuição. Default 2026: <InlineCode>min_p</InlineCode> tornou-se preferido sobre top_p para chat
          factual.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Sampler', 'Como funciona', 'Quando usar']}
          rows={[
            ['greedy', 'argmax sobre logits', 'Tasks determinísticas (código, classificação)'],
            ['temperature', 'logits /= T antes de softmax', 'Controla criatividade; T=0.7 default chat'],
            ['top-k', 'mantém só k tokens com maior probabilidade', 'Limita o "long tail"; k=40 razoável'],
            ['top-p (nucleus)', 'mantém menor conjunto cuja soma ≥ p', 'Adaptativo; p=0.9 chat criativo'],
            ['min-p', 'mantém tokens com prob ≥ min_p × prob_max', 'Robust a diferentes ranges de logits; preferido 2026'],
            ['typical-p', 'baseado em entropia local', 'Reduz repetição em texto narrativo'],
            ['repetition penalty', 'penaliza tokens recentes', 'Combate loops; cuidado com falsos positivos'],
            ['DRY (don\'t repeat yourself)', 'detecta n-gram repetidos e penaliza', 'Default em chat 2026; mata loops sem afetar parágrafos legítimos'],
            ['logit_bias', 'soma viés a tokens específicos', 'Forçar formatos (JSON), banir palavras'],
          ]}
        />
        <CodeBlock lang="bash">{`# Sampling chain moderna (default em chat de qualidade)
./llama-cli -m model.gguf \\
    --temp 0.7 \\
    --min-p 0.05 \\           # filtra long tail adaptativamente
    --repeat-penalty 1.0 \\   # neutro — DRY já cuida de repetição
    --dry-multiplier 0.8 \\   # ativa DRY
    --dry-base 1.75 \\
    --dry-allowed-length 2 \\
    --top-k 0 --top-p 1.0 \\  # desativados, min_p assume`}</CodeBlock>
      </Section>

      <Section title="Hardware backends e onde llama.cpp brilha" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Backend', 'Hardware', 'Status 2026', 'Performance relativa']}
          rows={[
            ['CUDA', 'NVIDIA GPUs (Ampere+, Hopper, Blackwell)', 'Mainstream, mais maduro', '100% (referência)'],
            ['Metal', 'Apple Silicon M1-M4', 'Excelente — unified memory shines', '60-90% de CUDA equivalente'],
            ['Vulkan', 'AMD/Intel/qualquer GPU moderna', 'Estável, fallback universal', '50-70% de CUDA'],
            ['ROCm/HIP', 'AMD MI300, RX 7900', 'Bom mas exige toolchain AMD', '70-85% de CUDA'],
            ['SYCL', 'Intel Arc, Data Center GPU Max', 'OK; depende de oneAPI', '50-70%'],
            ['CANN', 'Huawei Ascend (China)', 'Estável; mercado regional', 'N/D'],
            ['CPU (AVX2/AVX-512)', 'Qualquer x86 moderno', 'Surpreendentemente bom para Q4_K_M', '5-15% de GPU'],
            ['CPU (ARM NEON/SVE)', 'Raspberry Pi, servidores Ampere', 'Estável; SVE2 em chips novos é forte', '3-10% de GPU'],
          ]}
        />
        <Callout tone="info">
          Em <strong>Mac Studio M3 Ultra (192GB unified)</strong>, llama.cpp roda Llama 3.1 405B em Q4_K_M
          (~200GB) — algo impossível em GPU consumer. Metal backend explora unified memory: pesos não copiam
          entre CPU/GPU. Tokens/s baixo (~3-5 tok/s) mas qualidade FP16-near em hardware de escritório.
        </Callout>
      </Section>

      <Section title="Speculative decoding em llama.cpp" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          llama.cpp suporta <strong>speculative decoding</strong> (módulo dedicado em sequência): um modelo
          "draft" pequeno e rápido gera N tokens candidatos, o modelo "target" grande valida em paralelo. Quando
          aceitos, ganha-se N×; rejeitados, paga-se o custo do draft. Funciona porque a maioria dos tokens é
          "fácil" (continuações óbvias).
        </p>
        <CodeBlock lang="bash">{`# Speculative com draft Llama 3.2 1B e target Llama 3.1 70B
./llama-speculative \\
    -m llama-3.1-70b-Q4_K_M.gguf \\
    -md llama-3.2-1b-Q8_0.gguf \\         # draft, mesmo tokenizer
    --draft 8 \\                          # propõe 8 tokens por step
    --gpu-layers 80 --gpu-layers-draft 16 \\
    -p "Explique consenso Raft." \\
    --temp 0.6

# Ganho típico: 1.8-2.5× tokens/s em texto técnico (alta previsibilidade)
# Ganho menor (1.2-1.5×) em código com baixa entropia local`}</CodeBlock>
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="llama.cpp suporta multi-GPU?"
          a={<>Sim. Em CUDA: <InlineCode>--tensor-split 1,1</InlineCode> divide tensores entre 2 GPUs (pipeline parallelism). Para 4 GPUs: <InlineCode>--tensor-split 1,1,1,1</InlineCode>. Latência aumenta vs single GPU (sync NCCL-free), mas viabiliza modelos enormes.</>}
        />
        <QAItem
          q="Como debugar performance ruim em llama.cpp?"
          a={<>Use <InlineCode>--log-disable</InlineCode> em prod para reduzir overhead; <InlineCode>--verbose</InlineCode> mostra timings por fase (prefill, decode, sampling). <InlineCode>llama-bench</InlineCode> roda micro-benchmarks padronizados. Métricas-chave: prefill tok/s, decode tok/s, KV cache reuse rate.</>}
        />
        <QAItem
          q="Posso treinar/fine-tunear em llama.cpp?"
          a={<>Não para fine-tune supervisionado moderno — llama.cpp é primariamente inferência. Existe <InlineCode>llama-finetune</InlineCode> experimental para LoRA, mas QLoRA via Transformers+bitsandbytes continua o caminho padrão. Após treinar, converta o modelo final para GGUF.</>}
        />
        <QAItem
          q="Como atualizar de um GGUF velho para a versão atual?"
          a={<>Releases de llama.cpp ocasionalmente bumpam o GGUF version (ex.: v2 → v3 quando adicionaram quant types novos). Use <InlineCode>gguf-fix-endianness</InlineCode> ou re-converta do HF original. Sempre que possível, regenere o GGUF — quants antigos (Q4_0, Q4_1) são piores que K-quants modernos.</>}
        />
      </Section>

      <Section title="Referências" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Repo', v: 'github.com/ggml-org/llama.cpp — Georgi Gerganov (~6000 commits, 70k stars)' },
            { k: 'FlashAttention', v: 'Dao et al., NeurIPS 2022; FlashAttention-2 arXiv:2307.08691' },
            { k: 'Online softmax', v: 'Milakov & Gimelshein, "Online normalizer calculation for softmax", arXiv:1805.02867' },
            { k: 'GQA paper', v: 'Ainslie et al., "GQA: Training Generalized Multi-Query Transformer Models", EMNLP 2023' },
            { k: 'Continuous batching', v: 'Yu et al., "Orca: A Distributed Serving System for Transformer-Based Generative Models", OSDI 2022' },
            { k: 'GGUF spec', v: 'github.com/ggml-org/ggml/blob/master/docs/gguf.md' },
          ]}
        />
      </Section>
    </div>
  );
}
