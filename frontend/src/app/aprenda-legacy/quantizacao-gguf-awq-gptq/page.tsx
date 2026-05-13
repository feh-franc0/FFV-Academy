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
  DecisionBox,
  StackFlow,
  AnnotatedFormula,
  QAItem,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('quantizacao-gguf-awq-gptq');

const ACCENT = '#14b8a6';

const quiz: QuizQuestion[] = [
  {
    question: 'O que diferencia GGUF de safetensors/PyTorch state_dict?',
    options: [
      'GGUF é apenas uma compressão zip dos pesos originais',
      'GGUF é um container binário portátil que empacota metadados, tokenizer, vocabulário e pesos quantizados (mistos por camada via K-quants) em um único arquivo — desenhado para mmap e inferência em CPU/GPU mista, enquanto safetensors carrega apenas tensores brutos',
      'GGUF só funciona com modelos da Meta (Llama)',
      'safetensors é mais novo que GGUF e o substituiu em 2025',
    ],
    correct: 1,
    explanation:
      'GGUF (GGML Universal Format) é o formato do llama.cpp. Empacota tudo necessário para rodar o modelo (tokenizer.model, vocab, chat template, pesos quantizados com esquema misto por camada). Suporta mmap — o sistema operacional carrega páginas sob demanda, viabilizando modelos maiores que a RAM. Safetensors é um container puro de tensores, sem metadados de runtime.',
  },
  {
    question: 'Qual a inovação central do AWQ (Lin et al., MIT 2023) sobre GPTQ?',
    options: [
      'AWQ usa redes neurais para predizer os pesos',
      'AWQ identifica ~1% de pesos salientes via magnitude das ATIVAÇÕES (não dos pesos) e aplica per-channel scaling antes da quantização, protegendo esses canais — GPTQ minimiza erro de reconstrução por camada via inverso da hessiana',
      'AWQ exige fine-tuning supervisionado para quantizar',
      'AWQ só funciona para modelos abaixo de 7B parâmetros',
    ],
    correct: 1,
    explanation:
      'AWQ (Activation-aware Weight Quantization) parte da observação de que ativações têm distribuição muito mais skewed que pesos. Os canais com ativações de grande magnitude amplificam erros. AWQ escala esses canais para reduzir o range efetivo antes de quantizar, sem treinar nada. Resultado: melhor preservação de perplexity que GPTQ a INT4, kernel GEMM otimizado, sem overhead de hessiana.',
  },
  {
    question: 'O que é a importance matrix (imatrix) usada por k-quants do llama.cpp?',
    options: [
      'Uma matriz de pesos pré-treinada substituindo o modelo original',
      'Estatísticas de ativação coletadas em texto de calibração, usadas para distribuir bits de forma não-uniforme entre tensores e dentro de blocos — pesos com ativações maiores ganham mais bits efetivos, recuperando 1-3 pontos de perplexity em quants agressivas (Q2/Q3)',
      'A matriz de atenção do último layer congelada',
      'Um índice de pesquisa para busca vetorial dentro do GGUF',
    ],
    correct: 1,
    explanation:
      'imatrix é coletada com `llama-imatrix` rodando o modelo FP16 sobre texto representativo (wiki, C4). Para cada bloco de 32 pesos, soma-se |activation|² — os blocos com soma alta recebem grids de quantização com mais resolução. Em Q2_K_S e Q3_K_M a melhoria de PPL é notável (até -10%). Sem imatrix, o k-quant trata todos blocos como iguais.',
  },
  {
    question: 'Por que NF4 (NormalFloat 4) do bitsandbytes funciona bem para QLoRA?',
    options: [
      'NF4 é treinado com gradiente descendente para cada modelo',
      'NF4 usa quantis da distribuição normal (não grid uniforme) — como pesos pré-treinados são aproximadamente N(0,σ), os 16 níveis NF4 alocam mais resolução onde a densidade de pesos é maior, minimizando expectation-error sob a hipótese gaussiana',
      'NF4 armazena pesos como float32 e simula INT4',
      'NF4 só funciona em GPUs Ampere e mais novas',
    ],
    correct: 1,
    explanation:
      'NF4 (Dettmers et al., QLoRA 2023) é information-theoretically optimal sob distribuição normal: os 15 níveis vêm dos quantis Φ⁻¹(k/16) da N(0,1), simétricos em torno de 0. Combinado com double quantization (quantizar as próprias escalas) e paged optimizers, viabiliza fine-tuning de 65B em uma única A100 80GB.',
  },
  {
    question: 'Quando GPTQ pode ser pior que AWQ na prática de serving?',
    options: [
      'Nunca — GPTQ é estritamente melhor',
      'Quando `desc_act=True` é necessário para preservar qualidade — desc_act reordena colunas por importância de ativação, mas quebra coalesced memory access e custa 20-40% de throughput; AWQ não tem esse trade-off porque protege canais via scaling sem reordenação',
      'GPTQ só funciona em CPU',
      'GPTQ não suporta modelos com KV cache',
    ],
    correct: 1,
    explanation:
      'GPTQ tem dois modos: act_order=False (rápido, qualidade menor) e desc_act=True (qualidade boa, lento por reordenar colunas e perder coalesced access em GEMM). AWQ atinge qualidade comparable a desc_act mantendo memory access pattern padrão — vence em throughput puro. Em vLLM, AWQ + Marlin kernel costuma bater GPTQ desc_act em até 2× tokens/s.',
  },
  {
    question: 'Calibration dataset: por que importa e qual o pitfall comum?',
    options: [
      'Não importa — qualquer texto serve',
      'O dataset de calibração induz o erro de quantização a se concentrar nas direções menos vistas; usar Wikipedia para calibrar um modelo que servirá código gera degradação alta em HumanEval — calibre com texto representativo do domínio de produção (mix de natural language + código + chat formats reais)',
      'Calibração só serve para modelos de visão',
      'O dataset precisa ter exatamente 1024 amostras, nem mais nem menos',
    ],
    correct: 1,
    explanation:
      'GPTQ, AWQ e imatrix usam ~128-512 sequências para estimar estatísticas de ativação. Esses exemplos definem em quais direções o erro de quantização é tolerável. Pitfall clássico: calibrar com Wikipedia EN e servir um chatbot PT-BR de código — o degrade é silencioso e só aparece em produção. Use sample do tráfego real (anonimizado) sempre que possível.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="quantizacao-gguf-awq-gptq"
      title="Quantização: GGUF, AWQ, GPTQ, INT8/INT4 explicados"
      icon="📐"
      xp={70}
      readTime={14}
      trailName="Local LLMs & Edge AI"
      trailColor={ACCENT}
      nextSlug="llama-cpp-internals"
      nextTitle="llama.cpp internals: ggml, KV cache, FlashAttention"
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
        Quantização é o que transforma um modelo de 70B parâmetros — 140 GB em FP16, fora do alcance de qualquer
        hardware consumer — em um arquivo de 35 GB rodando em um Mac Studio. Mas reduzir 16 bits para 4 bits sem
        destruir a qualidade exige algoritmos não-triviais: GPTQ usa segunda derivada da loss, AWQ analisa
        ativações para proteger pesos salientes, GGUF mistura precisões por camada com importance matrix, NF4
        explora a distribuição gaussiana dos pesos pré-treinados. Este módulo dissecciona cada técnica, os papers
        originais e quando escolher cada uma.
      </p>

      <Section title="O problema fundamental: 16 bits por peso é muito" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Modelos modernos armazenam pesos em <InlineCode>bfloat16</InlineCode> (16 bits cada). Llama 3.1 8B tem
          8.03 bilhões de parâmetros — 16 GB de VRAM só para pesos, antes de KV cache, ativações, otimizador.
          Quantização reduz a representação de cada peso para 8, 4, 3 ou até 2 bits, multiplicando por 2-8× o
          throughput de memória e diminuindo a pegada de VRAM proporcionalmente.
        </p>
        <AnnotatedFormula
          title="Quantização linear simétrica"
          accent={ACCENT}
          formula="w_q = round(w / s) · s,  s = max(|w|) / (2^(b-1) - 1)"
          parts={[
            { text: 'w', annotation: 'peso original FP16' },
            { text: 's', annotation: 'escala (scale)', highlight: true },
            { text: 'b', annotation: 'bits (ex: 4)' },
            { text: 'w_q', annotation: 'peso reconstruído', highlight: true },
          ]}
        />
        <Callout tone="info">
          Quantização <strong>simétrica</strong> mapeia [-max, +max] para [-2^(b-1), 2^(b-1)-1]. A{' '}
          <strong>assimétrica</strong> adiciona um zero-point e mapeia [min, max] → [0, 2^b-1] — melhor para
          distribuições skewed (ativações pós-ReLU), pior para pesos quase-gaussianos. LLMs costumam usar simétrica
          para pesos e assimétrica para ativações.
        </Callout>
        <ComparisonTable
          accent={ACCENT}
          headers={['Precisão', 'Bits/peso', 'Llama 3 8B', 'Llama 3 70B', 'Hardware típico']}
          rows={[
            ['FP32', '32', '32 GB', '280 GB', 'A100/H100 datacenter'],
            ['BF16/FP16', '16', '16 GB', '140 GB', 'RTX 4090 24GB (só 8B cabe)'],
            ['INT8', '8', '8 GB', '70 GB', '2× RTX 4090 ou A6000'],
            ['INT4 (AWQ/GPTQ)', '~4.25', '4.5 GB', '35 GB', 'RTX 3060 12GB / M-series 36GB+'],
            ['Q3_K_M (GGUF)', '~3.5', '3.8 GB', '30 GB', 'M2 Pro 32GB'],
            ['Q2_K_S (GGUF imatrix)', '~2.6', '2.8 GB', '22 GB', 'M1 Max 32GB (com perda)'],
          ]}
        />
      </Section>

      <Section title="GPTQ: quantização guiada por hessiana" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Frantar et al., 2022</strong> (paper:{' '}
          <InlineCode>arXiv:2210.17323</InlineCode>) propuseram GPTQ como evolução do OBQ (Optimal Brain
          Quantization). A intuição: ao quantizar um peso w_i, podemos compensar o erro ajustando os pesos não-
          quantizados restantes via inverso da hessiana da loss. Processa-se uma coluna por vez, propagando
          correções para colunas futuras.
        </p>
        <FlowDiagram
          accent={ACCENT}
          title="Pipeline GPTQ por layer"
          orientation="vertical"
          steps={[
            { icon: '📥', label: 'Forward pass calibração', desc: '128-512 sequências; coleta ativações X de cada layer' },
            { icon: '🧮', label: 'Hessiana H = 2·XᵀX', desc: 'computada uma vez por layer; H⁻¹ via Cholesky' },
            { icon: '🔀', label: 'Quantize coluna i', desc: 'wᵢ_q = round(wᵢ/sᵢ)·sᵢ' },
            { icon: '➖', label: 'Compensa colunas i+1..n', desc: 'W[:,i+1:] -= (wᵢ - wᵢ_q) · H⁻¹[i,i+1:] / H⁻¹[i,i]' },
            { icon: '✅', label: 'Salva W_q + scales', desc: 'safetensors com metadado quant_config' },
          ]}
        />
        <CodeBlock lang="python">{`# AutoGPTQ — quantização INT4 com calibração de domínio
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from transformers import AutoTokenizer
from datasets import load_dataset

MODEL_ID = "meta-llama/Meta-Llama-3.1-8B-Instruct"
OUT_DIR  = "llama-3.1-8b-gptq-int4"

tok = AutoTokenizer.from_pretrained(MODEL_ID)

cfg = BaseQuantizeConfig(
    bits=4,
    group_size=128,        # 128 pesos compartilham mesma escala
    desc_act=False,        # True = +qualidade, -20% throughput em serving
    damp_percent=0.01,     # regularização do Cholesky
    sym=True,              # simétrico para pesos
    true_sequential=True,  # quantiza camada-a-camada respeitando dependências
)

# Calibração DEVE refletir distribuição de produção
calib = load_dataset("HuggingFaceH4/ultrachat_200k", split="train_sft[:256]")
examples = [
    tok(ex["messages"][0]["content"] + ex["messages"][1]["content"],
        return_tensors="pt", max_length=2048, truncation=True)
    for ex in calib
]

model = AutoGPTQForCausalLM.from_pretrained(MODEL_ID, cfg, torch_dtype="auto")
model.quantize(examples)   # ~3h em RTX 4090 para 8B
model.save_quantized(OUT_DIR, use_safetensors=True)`}</CodeBlock>
        <Callout tone="warn">
          <strong>desc_act</strong> reordena colunas por norma de ativação antes de quantizar — preserva mais
          qualidade mas força memory access não-coalesced em kernels GEMM. Em vLLM/TGI, modelos GPTQ com
          <InlineCode>desc_act=True</InlineCode> são 20-40% mais lentos. Decida pelo perfil: chat geral →
          desc_act=False; código/matemática → desc_act=True.
        </Callout>
      </Section>

      <Section title="AWQ: proteja os pesos salientes" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Lin et al., MIT 2023</strong> (paper:{' '}
          <InlineCode>arXiv:2306.00978</InlineCode>) observaram que apenas ~1% dos pesos são responsáveis pela
          maior parte da capacidade do modelo — e esses pesos podem ser identificados pela{' '}
          <strong>magnitude das ativações</strong> nos canais correspondentes, não pelos próprios pesos. AWQ aplica
          per-channel scaling para deslocar o range dos canais salientes antes da quantização uniforme.
        </p>
        <AnnotatedFormula
          title="AWQ — scaling per-channel"
          accent={ACCENT}
          formula="Y = (X / s) · Q(W · s),  s_i = mean(|x_i|)^α"
          parts={[
            { text: 'X', annotation: 'ativações' },
            { text: 's_i', annotation: 'escala por canal', highlight: true },
            { text: 'Q(·)', annotation: 'quantização uniforme INT4' },
            { text: 'α', annotation: 'hiperparâmetro [0,1] — busca em grid' },
          ]}
        />
        <p style={{ color: 'var(--ffv-muted)' }}>
          Matematicamente, Y é invariante sob a transformação. Mas Q(W·s) sofre menos erro porque os canais
          dominantes foram amplificados antes de quantizar (mais bits efetivos na faixa que importa). A escolha
          de α é por search: avalia perda de reconstrução em 32 amostras de calibração.
        </p>
        <CodeBlock lang="python">{`# AWQ — autoawq library
from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

MODEL = "Qwen/Qwen2.5-7B-Instruct"
OUT   = "qwen2.5-7b-awq-int4"

tok = AutoTokenizer.from_pretrained(MODEL, trust_remote_code=True)
model = AutoAWQForCausalLM.from_pretrained(MODEL, device_map="auto", trust_remote_code=True)

quant_cfg = {
    "zero_point": True,
    "q_group_size": 128,
    "w_bit": 4,
    "version": "GEMM",   # GEMM = batch grande; GEMV = decoding token a token
}

# AWQ usa pileval (default) ou seu próprio dataset
model.quantize(tok, quant_config=quant_cfg, calib_data="pileval", n_parallel_calib_samples=32)
model.save_quantized(OUT)
tok.save_pretrained(OUT)

# Loading em vLLM
# vllm serve qwen2.5-7b-awq-int4 --quantization awq_marlin --dtype half`}</CodeBlock>
        <DecisionBox
          scenario="Escolha entre AWQ e GPTQ para serving de chat 7B"
          winner="AWQ + Marlin kernel"
          winnerColor={ACCENT}
          why="AWQ preserva 0.3-0.8 PPL melhor que GPTQ act_order=False, e ~paridade com GPTQ desc_act=True — sem o custo de 20-40% de throughput. Marlin kernel (vLLM) é state-of-the-art para INT4 GEMM em Ampere/Hopper."
          alternatives={[
            { name: 'GPTQ desc_act=True: prefira em tasks de código/matemática se +1% de accuracy compensa -25% throughput' }, { name: 'GGUF Q4_K_M: prefira para deploy em CPU/Mac ou hardware misto' }, { name: 'bitsandbytes NF4: só para fine-tuning QLoRA, não para serving (lento)' }
          ]}
        />
      </Section>

      <Section title="GGUF e k-quants: precisão mista por camada" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          GGUF é o formato do <strong>llama.cpp</strong> (Georgi Gerganov). Não é um algoritmo de quantização — é
          um container que pode armazenar pesos em diversos esquemas (Q4_0 legacy, Q4_K_M, Q5_K_S, Q8_0, etc.). O
          diferencial dos <strong>k-quants</strong> é misturar precisões DENTRO do mesmo modelo: layers
          sensíveis (attention.output, ffn.down) ganham mais bits; outros ganham menos.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Esquema', 'Bits efetivos', 'Estratégia', 'PPL Llama 7B (wiki)', 'Uso recomendado']}
          rows={[
            ['Q8_0', '8.5', 'INT8 uniforme + scale per-bloc de 32', '~5.79 (≈FP16)', 'CPU rápido, baseline'],
            ['Q6_K', '6.56', 'Mix 6-bit majority + 8-bit em layers críticos', '5.81', 'Quase indistinguível de FP16'],
            ['Q5_K_M', '5.69', 'Mix 5/6-bit, balanceado', '5.85', 'Default para qualidade'],
            ['Q4_K_M', '4.83', 'Mix 4/5/6-bit, attn.v + ffn.down em 5/6', '5.95', 'Sweet spot 2026'],
            ['Q4_K_S', '4.58', 'Q4_K_M sem upgrade em layers críticos', '6.02', 'Memória apertada'],
            ['Q3_K_M', '3.91', 'Mix 3/4-bit + imatrix', '6.30', 'Modelos grandes em RAM consumer'],
            ['Q2_K_S', '2.63', 'Mix 2/3-bit + imatrix obrigatória', '7.20', 'Última fronteira; perda visível'],
          ]}
        />
        <CodeBlock lang="bash">{`# llama.cpp — pipeline completo de quantização
# 1. Converter HF safetensors → GGUF FP16
python convert_hf_to_gguf.py meta-llama/Meta-Llama-3.1-8B-Instruct \\
    --outfile llama-3.1-8b-f16.gguf --outtype f16

# 2. Coletar importance matrix em texto representativo
./llama-imatrix \\
    -m llama-3.1-8b-f16.gguf \\
    -f calibration_pt-br.txt \\        # mix PT-BR + código + chat real
    -o imatrix-llama8b.dat \\
    --chunks 128

# 3. Quantizar com imatrix → Q4_K_M
./llama-quantize \\
    --imatrix imatrix-llama8b.dat \\
    llama-3.1-8b-f16.gguf \\
    llama-3.1-8b-Q4_K_M.gguf \\
    Q4_K_M

# 4. Validar perplexity
./llama-perplexity -m llama-3.1-8b-Q4_K_M.gguf -f wikitext-2-raw/wiki.test.raw`}</CodeBlock>
        <StackFlow
          title="Anatomia de um arquivo GGUF"
          accent={ACCENT}
          items={[
            { icon: '🪪', label: 'Magic + version header', sub: 'GGUF + uint32 version (atual: 3)' },
            { icon: '🗂️', label: 'Metadata KV pairs', sub: 'general.architecture, general.name, tokenizer.ggml.model, chat_template, ...' },
            { icon: '🔤', label: 'Tokenizer embarcado', sub: 'vocab + merges + special tokens — sem dependência de Python' },
            { icon: '📐', label: 'Tensor info table', sub: 'name, dims, ggml_type (Q4_K, Q6_K, F16...), offset' },
            { icon: '💾', label: 'Tensor data (alinhado 32B)', sub: 'pesos quantizados; mmap-friendly, page-aligned' },
          ]}
        />
      </Section>

      <Section title="bitsandbytes e NF4: a magia do QLoRA" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          <strong>Dettmers et al., 2023</strong> (QLoRA paper: <InlineCode>arXiv:2305.14314</InlineCode>) provaram
          que dá para fine-tunear Llama 65B em uma única A100 80GB combinando:{' '}
          <strong>NF4</strong> (NormalFloat 4-bit), <strong>double quantization</strong> (quantizar as escalas) e{' '}
          <strong>paged optimizers</strong> (offload do estado Adam para CPU). NF4 é desenhado especificamente
          para a distribuição empírica dos pesos pré-treinados.
        </p>
        <AnnotatedFormula
          title="NF4 — quantis da N(0,1)"
          accent={ACCENT}
          formula="q_k = Φ⁻¹((k + 0.5) / 16),  k ∈ {0..15}"
          parts={[
            { text: 'Φ⁻¹', annotation: 'inversa da CDF normal' },
            { text: 'k', annotation: 'índice 4-bit' },
            { text: '16 níveis', annotation: 'simétricos, info-óptimos sob N(0,1)', highlight: true },
          ]}
        />
        <CodeBlock lang="python">{`# QLoRA setup com bitsandbytes — fine-tune 8B em RTX 4090
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
import torch

bnb_cfg = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",          # NormalFloat-4
    bnb_4bit_use_double_quant=True,     # quantiza escalas → -0.4 bits/peso
    bnb_4bit_compute_dtype=torch.bfloat16,
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3.1-8B-Instruct",
    quantization_config=bnb_cfg,
    device_map="auto",
)
model = prepare_model_for_kbit_training(model)

lora = LoraConfig(
    r=16, lora_alpha=32,
    target_modules=["q_proj","k_proj","v_proj","o_proj","gate_proj","up_proj","down_proj"],
    lora_dropout=0.05, bias="none", task_type="CAUSAL_LM",
)
model = get_peft_model(model, lora)
# ~0.5% dos params são treináveis; base em NF4 fica congelada`}</CodeBlock>
        <Callout tone="warn">
          NF4 é <strong>excelente para fine-tuning</strong> (QLoRA) mas <strong>subótimo para serving</strong>{' '}
          puro. Para inferência de produção, prefira AWQ ou GPTQ — kernels GEMM otimizados (Marlin, Machete)
          superam bitsandbytes em 2-4× tokens/s.
        </Callout>
      </Section>

      <Section title="Como escolher: árvore de decisão" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'Serving GPU produção (vLLM/TGI)', v: 'AWQ-INT4 + Marlin kernel. Fallback: GPTQ desc_act=False.' },
            { k: 'Serving GPU + tasks de código/matemática', v: 'GPTQ desc_act=True ou FP8 (H100+).' },
            { k: 'Uso local (Mac, Linux consumer)', v: 'GGUF Q4_K_M com imatrix. Q5_K_M se sobrar RAM.' },
            { k: 'CPU-only (servidor sem GPU)', v: 'GGUF Q4_K_M + AVX2/AVX512. Llama.cpp continuous batching.' },
            { k: 'Mobile / embarcado', v: 'GGUF Q4_K_S ou ExecuTorch INT4 (módulo separado).' },
            { k: 'Fine-tuning com pouca VRAM', v: 'QLoRA com NF4 + double quant. Não use AWQ/GPTQ para treinar.' },
            { k: 'Modelo muito grande (>70B) em hardware limitado', v: 'GGUF Q3_K_M ou Q2_K_S com imatrix. Aceite o trade-off.' },
            { k: 'Precisão crítica (não pode degradar)', v: 'INT8 (SmoothQuant) ou FP8. Evite INT4.' },
          ]}
        />
      </Section>

      <Section title="Validação: perplexity ≠ qualidade de tarefa" accent={ACCENT}>
        <Callout tone="info">
          Perplexity em WikiText mede modelagem geral de linguagem. <strong>Não correlaciona perfeitamente</strong>{' '}
          com performance em tarefas específicas. Um Q4_K_M com ΔPPL=+0.16 pode perder 3 pontos em GSM8K
          (matemática) e 5 em HumanEval (código). Sempre valide quantização no <strong>seu</strong> benchmark de
          produção, não só em perplexity.
        </Callout>
        <CodeBlock lang="bash">{`# Bateria mínima de avaliação pós-quantização
# 1. PPL geral
./llama-perplexity -m model-Q4_K_M.gguf -f wiki.test.raw

# 2. lm-evaluation-harness — MMLU, GSM8K, HumanEval, IFEval
lm_eval --model hf --model_args pretrained=./awq-int4-model,trust_remote_code=True \\
        --tasks mmlu,gsm8k,humaneval,ifeval --batch_size 8

# 3. Seu próprio eval set (golden examples de produção)
python eval_production.py --model-path ./awq-int4-model --testset ./golden.jsonl`}</CodeBlock>
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'MMLU FP16', 'MMLU AWQ-INT4', 'GSM8K FP16', 'GSM8K AWQ-INT4', 'Δ aceito?']}
          rows={[
            ['Llama 3.1 8B', '68.4', '67.8', '84.5', '82.1', 'Sim (-0.6 / -2.4)'],
            ['Llama 3.1 70B', '83.6', '83.2', '95.1', '94.6', 'Sim (-0.4 / -0.5)'],
            ['Qwen 2.5 7B', '74.2', '73.5', '85.4', '82.0', 'Aceitável'],
            ['Phi-4 14B', '84.8', '83.1', '91.2', '85.4', 'Marginal — preferir INT8'],
            ['Llama 3.2 3B', '58.0', '54.6', '76.7', '69.1', 'Não — modelo pequeno demais para INT4'],
          ]}
        />
      </Section>

      <Section title="Perguntas frequentes" accent={ACCENT}>
        <QAItem
          q="Posso quantizar um modelo já fine-tunado, ou tenho que quantizar a base e re-treinar?"
          a={<>Pode (e deve) quantizar o modelo já fine-tunado. AWQ/GPTQ/GGUF são pós-treinamento (PTQ). Se você fez QLoRA com NF4, faça <InlineCode>merge_and_unload()</InlineCode> primeiro para fundir LoRA com base FP16, depois rode AWQ/GPTQ sobre o resultado.</>}
        />
        <QAItem
          q="Por que minha quantização AWQ deu PPL pior que esperado?"
          a="Causas comuns: (1) calibração com dataset fora do domínio, (2) group_size pequeno demais (use 128, não 32), (3) zero_point=False em distribuições assimétricas, (4) sequence length de calibração curta (use ≥2048). Re-calibre com 256+ amostras de produção real."
        />
        <QAItem
          q="GGUF roda em GPU ou só CPU?"
          a={<>llama.cpp tem backends CUDA, Metal (Apple), Vulkan, ROCm e SYCL — GGUF roda em GPU desde 2023. O flag <InlineCode>-ngl N</InlineCode> offloada N camadas para GPU. Você pode rodar Llama 70B Q4_K_M com 30 layers em RTX 4090 + resto em RAM (split tensor).</>}
        />
        <QAItem
          q="FP8 já substituiu INT4?"
          a="Em H100/H200 e Blackwell, FP8 (E4M3, E5M2) é mais rápido que INT4 com qualidade próxima de BF16 — TensorRT-LLM e vLLM suportam. Mas FP8 ocupa 2× mais memória que INT4. Para serving onde memória é o gargalo, INT4 ainda vence. Para latência pura em datacenter, FP8 é o caminho."
        />
      </Section>

      <Section title="Referências canônicas" accent={ACCENT}>
        <KeyValue
          accent={ACCENT}
          items={[
            { k: 'GPTQ paper', v: 'Frantar et al., "GPTQ: Accurate Post-Training Quantization for GPT Models", arXiv:2210.17323 (2022)' },
            { k: 'AWQ paper', v: 'Lin et al., "AWQ: Activation-aware Weight Quantization", MIT 2023, arXiv:2306.00978' },
            { k: 'QLoRA + NF4', v: 'Dettmers et al., "QLoRA: Efficient Finetuning of Quantized LLMs", arXiv:2305.14314 (2023)' },
            { k: 'SmoothQuant', v: 'Xiao et al., "SmoothQuant: Accurate and Efficient PTQ for LLMs", ICML 2023' },
            { k: 'GGUF spec', v: 'github.com/ggml-org/ggml/blob/master/docs/gguf.md (Georgi Gerganov, llama.cpp)' },
            { k: 'Marlin kernel', v: 'Frantar et al., "Marlin: Mixed-Precision Auto-Regressive Parallel Inference", IST Austria 2024' },
          ]}
        />
      </Section>
    </div>
  );
}
