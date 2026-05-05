import { getModuleMetadata } from '@/lib/metadata';
import { ModuleLayout } from '@/components/ModuleLayout';
import type { QuizQuestion } from '@/components/ModuleLayout';
import {
  Section,
  Callout,
  CodeBlock,
  InlineCode,
  ComparisonTable,
  DecisionBox,
  QAItem,
  LayerStack,
} from '@/components/article/primitives';

export const metadata = getModuleMetadata('quantizacao-llm');

const ACCENT = '#f59e0b';

const quiz: QuizQuestion[] = [
  {
    question: 'Qual é o principal trade-off ao quantizar um modelo de FP16 para INT4?',
    options: [
      'O modelo fica mais lento porque precisa desquantizar a cada operação',
      'Redução drástica de memória (até 4×) com possível degradação de qualidade em tarefas de raciocínio fino — modelos maiores toleram melhor a quantização agressiva que modelos pequenos',
      'A qualidade melhora porque o modelo fica menos propenso a overfitting nos pesos',
      'Não há trade-off relevante — INT4 é sempre superior ao FP16 em produção',
    ],
    correct: 1,
    explanation:
      'INT4 usa 4 bits por parâmetro vs 16 bits em FP16 — redução de 4× na memória. Um 7B em FP16 ocupa ~14 GB; em INT4, ~3.5 GB. O custo é degradação de qualidade, especialmente em matemática e raciocínio encadeado. Modelos maiores (70B+) toleram INT4 melhor — a capacidade excedente absorve a perda de precisão.',
  },
  {
    question: 'Qual a diferença fundamental entre GPTQ e AWQ?',
    options: [
      'São algoritmos idênticos com implementações diferentes',
      'GPTQ minimiza erro de reconstrução por camada via hessiana; AWQ identifica pesos "importantes" via ativações e os preserva com escala diferenciada — AWQ tende a ter melhor qualidade a INT4 com throughput similar',
      'GPTQ é exclusivo para GPU; AWQ funciona apenas em CPU',
      'AWQ exige fine-tuning adicional; GPTQ é puramente pós-treinamento',
    ],
    correct: 1,
    explanation:
      'GPTQ (Frantar et al. 2022) usa segunda derivada (hessiana) para minimizar erro de reconstrução por camada. AWQ (Lin et al. 2023) observa que 1% dos pesos têm impacto 100× maior (salient weights) e os protege aplicando scaling per-channel. AWQ é geralmente 1-3 pontos de perplexidade melhor que GPTQ a INT4 e mais eficiente no serving.',
  },
  {
    question: 'O que é o formato GGUF e por que domina o ecossistema de uso local?',
    options: [
      'É um formato proprietário da Google para treinar modelos de linguagem',
      'Formato padrão do llama.cpp: empacota metadados, tokenizer, vocabulário e pesos quantizados em um único arquivo portátil — permite rodar LLMs localmente em CPU ou GPU consumer sem infraestrutura especial',
      'GGUF é exclusivo para modelos da família GPT da OpenAI',
      'Formato apenas para Windows — não funciona em macOS ou Linux',
    ],
    correct: 1,
    explanation:
      'GGUF substituiu o GGML. Empacota tudo em um arquivo: metadados, tokenizer, vocabulário e pesos quantizados (Q4_K_M, Q5_K_M, Q8_0 etc.). O llama.cpp, base do Ollama e LM Studio, usa GGUF nativamente com suporte a offload parcial — parte dos layers em GPU, resto em RAM — tornando modelos grandes viáveis em hardware consumer.',
  },
  {
    question: 'Quando a quantização pós-treinamento (PTQ) NÃO é suficiente?',
    options: [
      'Nunca — PTQ com AWQ é sempre suficiente para qualquer caso de uso',
      'Quando você quantiza abaixo de 4 bits, em modelos pequenos (<3B), ou quando a task exige precisão extrema — QAT re-treina simulando quantização, recuperando qualidade que PTQ não consegue',
      'QAT é necessário apenas para modelos de visão computacional, não para LLMs de texto',
      'Apenas quando o hardware de destino é um microcontrolador ARM cortex-M',
    ],
    correct: 1,
    explanation:
      'QAT simula erros de quantização durante o treinamento — o modelo aprende a ser robusto a eles. PTQ aplica quantização depois, sem re-treino. PTQ funciona bem para 4-8 bits em modelos ≥7B. Para 2-3 bits, modelos pequenos (<3B) ou tasks de precisão (código, matemática), o gap de qualidade de PTQ torna-se inaceitável. QAT recupera 50-80% da qualidade perdida ao custo de re-treino.',
  },
];

export default function Page() {
  return (
    <ModuleLayout
      slug="quantizacao-llm"
      title="Quantização de LLMs: INT4, INT8, GGUF e impacto em qualidade"
      icon="⚡"
      xp={80}
      readTime={16}
      trailName="Engenharia AI-Native"
      trailColor={ACCENT}
      nextSlug="lora-qlora-peft"
      nextTitle="LoRA, QLoRA e PEFT: fine-tuning eficiente"
      relatedSlugs={['transformers', 'lora-qlora-peft', 'small-language-models']}
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
        Um modelo de 70B parâmetros em FP16 ocupa ~140 GB de VRAM — fora do alcance de qualquer hardware consumer.
        Quantização reduz a precisão numérica dos pesos, comprimindo o modelo para caber em hardware acessível com
        perda de qualidade controlada. Entender INT4, INT8, GPTQ, AWQ e GGUF é fundamental para decisões de deploy
        realistas em 2026.
      </p>

      <Section title="O que é quantização e por que importa" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          LLMs armazenam pesos como números de ponto flutuante. FP32 usa 32 bits por peso; FP16/BF16 usa 16; INT8
          usa 8; INT4 usa 4. A quantização mapeia pesos contínuos para uma grade discreta com menos bits, reduzindo
          memória e acelerando operações matriciais — a custo de precisão numérica.
        </p>
        <LayerStack
          title="Formatos de precisão numérica em LLMs"
          accent={ACCENT}
          separatorLabel="menor precisão → menor memória"
          layers={[
            { label: 'FP32', content: '32 bits/peso — precisão máxima, padrão de treinamento', note: '4× mais memória que INT8', tone: 'default' },
            { label: 'BF16 / FP16', content: '16 bits/peso — padrão de inferência em GPU modernas', note: 'baseline de produção', tone: 'default' },
            { label: 'INT8', content: '8 bits/peso — 2× menos memória que FP16', note: 'quase sem perda de qualidade', tone: 'writable' },
            { label: 'INT4 / NF4', content: '4 bits/peso — 4× menos memória que FP16', note: 'perda moderada, viável para ≥7B', tone: 'writable' },
            { label: 'INT2 / Q2', content: '2 bits/peso — 8× compressão máxima', note: 'perda severa, exige QAT', tone: 'success' },
          ]}
        />
        <ComparisonTable
          accent={ACCENT}
          headers={['Modelo', 'FP16 (GB VRAM)', 'INT8 (GB)', 'INT4 (GB)', 'Hardware viável em INT4']}
          rows={[
            ['Llama 3.1 8B', '16 GB', '8 GB', '4 GB', 'RTX 3060 12GB, M1/M2 8GB'],
            ['Llama 3.1 70B', '140 GB', '70 GB', '35 GB', '2× RTX 4090, Mac Studio M2 Ultra'],
            ['Llama 3.1 405B', '810 GB', '405 GB', '~200 GB', 'Cluster 8× H100 ou Q4 em 128GB RAM'],
            ['Mistral 7B v0.3', '14 GB', '7 GB', '3.5 GB', 'RTX 3060, M1 Pro 16GB'],
            ['Phi-4 (14B)', '28 GB', '14 GB', '7 GB', 'RTX 4080, M2 Pro 32GB'],
          ]}
        />
        <Callout tone="info">
          Regra prática: INT4 divide por 4 a memória vs FP16. INT8 divide por 2. Para modelos ≥13B, a degradação
          de INT4 costuma ser aceitável para a maioria das tasks. Para modelos menores (≤3B), INT4 pode comprometer
          tasks exigentes — prefira INT8 nesses casos.
        </Callout>
      </Section>

      <Section title="Algoritmos de quantização: GPTQ, AWQ e bitsandbytes" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Quantizar ingenuamente (arredondar pesos para a grade mais próxima) é simples mas sub-ótimo. Algoritmos
          modernos minimizam o erro de reconstrução de forma inteligente, preservando as ativações que mais impactam
          a qualidade final.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Algoritmo', 'Estratégia principal', 'Qualidade INT4', 'Tempo de prep', 'Uso principal']}
          rows={[
            ['bitsandbytes NF4', 'Quantização dinâmica por bloco, NormalFloat4', 'Boa', 'Instantâneo (em runtime)', 'Fine-tuning QLoRA'],
            ['GPTQ', 'Minimiza erro via hessiana por camada (OBQ)', 'Muito boa', '1–4h para 7B', 'Serving de inferência GPU'],
            ['AWQ', 'Preserva salient weights via magnitude de ativações', 'Excelente', '20–60min para 7B', 'Serving alta qualidade'],
            ['GGUF k-quants', 'Quantização mista por importância de camada', 'Muito boa', 'Rápido (conversão)', 'Uso local, CPU/GPU consumer'],
            ['SmoothQuant', 'Redistribui dificuldade peso↔ativação antes de INT8', 'Excelente para INT8', 'Rápido', 'INT8 em GPUs datacenter'],
          ]}
        />
        <CodeBlock lang="python">{`# AWQ — quantizar modelo para INT4
from awq import AutoAWQForCausalLM
from transformers import AutoTokenizer

model_path = "meta-llama/Meta-Llama-3.1-8B-Instruct"
quant_path  = "llama-3.1-8b-instruct-awq-int4"

model = AutoAWQForCausalLM.from_pretrained(model_path, device_map="auto")
tokenizer = AutoTokenizer.from_pretrained(model_path)

quant_config = {
    "zero_point": True,
    "q_group_size": 128,   # tamanho do grupo para quantização por bloco
    "w_bit": 4,             # INT4
    "version": "GEMM",      # kernel otimizado para inferência
}

# AWQ usa amostras de calibração para identificar salient weights
model.quantize(tokenizer, quant_config=quant_config)
model.save_quantized(quant_path)
tokenizer.save_pretrained(quant_path)

# Carregar para inferência com kernels fundidos
from awq import AutoAWQForCausalLM
model = AutoAWQForCausalLM.from_quantized(quant_path, fuse_layers=True)
# fuse_layers=True ativa GEMM/GEMV fundidos → 1.5–2× throughput vs unfused`}</CodeBlock>

        <CodeBlock lang="python">{`# GPTQ com AutoGPTQ
from auto_gptq import AutoGPTQForCausalLM, BaseQuantizeConfig
from transformers import AutoTokenizer
from datasets import load_dataset

tokenizer = AutoTokenizer.from_pretrained("mistralai/Mistral-7B-v0.1")

quant_config = BaseQuantizeConfig(
    bits=4,           # INT4
    group_size=128,   # grupo menor = melhor qualidade, mais memória
    desc_act=False,   # True melhora qualidade mas torna serving mais lento
)

model = AutoGPTQForCausalLM.from_pretrained("mistralai/Mistral-7B-v0.1", quant_config)

# Dataset de calibração: deve ser representativo do seu domínio
calib = load_dataset("wikitext", "wikitext-2-raw-v1", split="train[:128]")
examples = [tokenizer(t["text"], return_tensors="pt") for t in calib]

model.quantize(examples)  # ~2-4h em RTX 4090 para 7B
model.save_quantized("mistral-7b-gptq-4bit", use_safetensors=True)`}</CodeBlock>

        <Callout tone="warn">
          Modelos GPTQ e AWQ exigem engines de serving compatíveis. vLLM suporta ambos nativamente com
          <InlineCode>quantization="awq"</InlineCode> ou <InlineCode>quantization="gptq"</InlineCode>. llama.cpp
          usa exclusivamente GGUF. Valide compatibilidade antes de escolher o algoritmo.
        </Callout>
      </Section>

      <Section title="GGUF e o ecossistema llama.cpp / Ollama" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          GGUF é o formato dominante para uso local e on-device. O llama.cpp é escrito em C++ puro com otimizações
          SIMD/Metal/CUDA, rodando em praticamente qualquer hardware — do Raspberry Pi à GPU server. O Ollama
          envolve llama.cpp com UX simples e API HTTP compatível com OpenAI.
        </p>
        <ComparisonTable
          accent={ACCENT}
          headers={['Quantização GGUF', 'Bits efetivos/peso', 'Memória 7B', 'Qualidade relativa a FP16']}
          rows={[
            ['Q2_K', '~2.6 bits', '~2.8 GB', 'Baixa — só para exploração rápida'],
            ['Q4_0', '4.5 bits', '~3.8 GB', 'Boa — mais simples, ligeiramente pior que K_M'],
            ['Q4_K_M', '~4.8 bits', '~4.1 GB', 'Boa — ponto ideal custo/qualidade para maioria'],
            ['Q5_K_M', '~5.7 bits', '~4.8 GB', 'Muito boa — preferível se couber na VRAM'],
            ['Q6_K', '~6.6 bits', '~5.5 GB', 'Excelente — próximo de FP16 na prática'],
            ['Q8_0', '8 bits', '~7.0 GB', 'Quase idêntico a FP16 — pouca vantagem'],
          ]}
        />
        <CodeBlock lang="bash">{`# Instalar Ollama (macOS/Linux)
curl -fsSL https://ollama.ai/install.sh | sh

# Baixar e rodar modelo (Q4_K_M por padrão)
ollama run llama3.1:8b

# Ver modelos disponíveis com tamanho
ollama list

# Criar modelo personalizado com Modelfile
cat > Modelfile <<'EOF'
FROM llama3.1:8b

PARAMETER temperature 0.1
PARAMETER num_ctx 32768
PARAMETER num_predict 2048

SYSTEM """Você é um arquiteto de software sênior especializado em sistemas distribuídos.
Responda sempre em português, com exemplos concretos e foco em trade-offs reais."""
EOF

ollama create arquiteto-sr -f Modelfile
ollama run arquiteto-sr "Explique as diferenças entre Saga orquestrada e coreografada"

# API compatível com OpenAI
curl http://localhost:11434/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"model": "llama3.1:8b", "messages": [{"role": "user", "content": "Olá"}]}'`}</CodeBlock>

        <CodeBlock lang="python">{`# llama-cpp-python: controle fino sobre GPU offload e contexto
from llama_cpp import Llama

llm = Llama(
    model_path="./llama-3.1-8b-instruct-q4_k_m.gguf",
    n_gpu_layers=-1,   # -1 = todos os layers na GPU disponível
    n_ctx=32768,        # janela de contexto
    n_batch=512,        # batch de tokens para prompt processing
    n_threads=8,        # threads CPU (para offload parcial)
    verbose=False,
)

output = llm.create_chat_completion(
    messages=[
        {"role": "system", "content": "Você é engenheiro sênior de backend."},
        {"role": "user",   "content": "Como implementar idempotência em APIs REST?"},
    ],
    max_tokens=1024,
    temperature=0.1,
    stream=True,        # streaming token a token
)

for chunk in output:
    delta = chunk["choices"][0]["delta"].get("content", "")
    print(delta, end="", flush=True)`}</CodeBlock>
      </Section>

      <Section title="Quantização no serving de produção: vLLM e TensorRT-LLM" accent={ACCENT}>
        <p style={{ color: 'var(--ffv-muted)' }}>
          Para serving de alta performance em GPU server, vLLM e TensorRT-LLM suportam GPTQ e AWQ com throughput
          significativamente superior ao HuggingFace transformers puro, graças a continuous batching e PagedAttention.
        </p>
        <CodeBlock lang="python">{`# vLLM offline inference com modelo AWQ
from vllm import LLM, SamplingParams

llm = LLM(
    model="TheBloke/Mistral-7B-Instruct-v0.2-AWQ",
    quantization="awq",           # ou "gptq" para GPTQ
    dtype="float16",
    gpu_memory_utilization=0.90,  # 90% da VRAM disponível
    max_model_len=32768,
    tensor_parallel_size=1,       # GPUs em paralelo (para modelos que não cabem em 1)
)

params = SamplingParams(
    temperature=0.1,
    max_tokens=512,
    top_p=0.95,
)

prompts = [
    "Explique PagedAttention em 3 parágrafos.",
    "Qual a diferença entre RLHF e DPO?",
]
outputs = llm.generate(prompts, params)
for out in outputs:
    print(out.outputs[0].text)

# vLLM como servidor OpenAI-compatible
# python -m vllm.entrypoints.openai.api_server \
#   --model TheBloke/Mistral-7B-Instruct-v0.2-AWQ \
#   --quantization awq \
#   --port 8000`}</CodeBlock>

        <DecisionBox
          scenario="Escolher engine de serving para modelo quantizado INT4 em produção"
          winner="vLLM com AWQ INT4"
          winnerColor={ACCENT}
          why="Melhor combinação de throughput (continuous batching + PagedAttention) com qualidade (AWQ preserva salient weights). Open source, suporte a múltiplos modelos no mesmo servidor, API compatível com OpenAI."
          alternatives={[
            { name: 'llama.cpp / Ollama', note: 'Excelente para dev local, edge ou hardware sem GPU server-grade' },
            { name: 'TensorRT-LLM', note: 'Throughput máximo em NVIDIA H100/A100 — setup mais complexo' },
            { name: 'bitsandbytes NF4', note: 'Ideal para fine-tuning QLoRA, não para serving de alta concorrência' },
          ]}
        />

        <Callout tone="info">
          Métricas-chave para avaliar quantização: perplexidade (quanto menor, melhor), benchmarks específicos
          da task (MMLU, HumanEval, GSM8K para raciocínio), e throughput (tokens/s) + latência p95. Nunca avalie
          só perplexidade — modelo com boa perplexidade pode falhar em matemática com INT4.
        </Callout>
      </Section>

      <Section title="QAT e bitsandbytes: casos especiais" accent={ACCENT}>
        <ComparisonTable
          accent={ACCENT}
          headers={['Característica', 'PTQ (GPTQ/AWQ/GGUF)', 'QAT', 'bitsandbytes NF4']}
          rows={[
            ['Re-treino', 'Não', 'Sim (1–5% dados)', 'Não (quantização em runtime)'],
            ['Custo', 'Horas (calibração)', 'Dias a semanas', 'Zero (dinâmico)'],
            ['Melhor cenário', 'INT4–INT8 em ≥7B', 'INT2–INT4 em <3B ou tasks críticas', 'Fine-tuning QLoRA'],
            ['Perda vs FP16', '1–5 pts em benchmarks', '<1 pt com re-treino correto', 'Variável por task'],
            ['Frameworks', 'auto-gptq, llm-awq, llama.cpp', 'LLM Compressor (Neural Magic)', 'bitsandbytes + PEFT'],
          ]}
        />
        <CodeBlock lang="python">{`# bitsandbytes NF4 para fine-tuning QLoRA (não para serving)
from transformers import AutoModelForCausalLM, BitsAndBytesConfig
import torch

bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,  # aninha quantização para economizar mais
    bnb_4bit_quant_type="nf4",       # NormalFloat4 — melhor para pesos normais
    bnb_4bit_compute_dtype=torch.bfloat16,  # computa em BF16 internamente
)

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3.1-70B",
    quantization_config=bnb_config,
    device_map="auto",               # distribui entre GPUs disponíveis
)
# 70B em NF4 cabe em ~35GB — 2 GPUs de 24GB`}</CodeBlock>
        <QAItem
          q="Qual a diferença entre INT4 e NF4 (NormalFloat4)?"
          a={<>INT4 distribui os 16 níveis de quantização uniformemente no intervalo. NF4 distribui os 16 níveis de forma que cada nível tenha igual probabilidade sob uma distribuição normal — alinhado com a distribuição real de pesos de LLMs treinados com SGD. Resultado: NF4 tem menor erro de quantização para pesos normalmente distribuídos. GPTQ e AWQ usam INT4 com técnicas de compensação de erro em vez de NF4 diretamente.</>}
        />
        <QAItem
          q="Como meço o impacto real da quantização no meu caso de uso?"
          a={<>Monte um eval harness com 50–200 exemplos representativos da sua task. Compare FP16 baseline, INT8, INT4 GPTQ e INT4 AWQ. Métricas: accuracy/F1 na task, latência p50/p95, throughput (tokens/s). O ponto de inflexão costuma ser INT4 AWQ — se a degradação for aceitável, use INT4; se não, INT8. Nunca confie apenas em perplexidade.</>}
        />
        <QAItem
          q="Quantização afeta igualmente todos os tipos de tasks?"
          a={<>Não. Tasks mais sensíveis: matemática precisa, código complexo, raciocínio multi-step encadeado. Tasks mais robustas: sumarização, tradução, classificação, Q&A factual. Avalie com um eval harness na sua task específica — benchmarks genéricos podem mascarar degradação grave em casos de uso reais.</>}
        />
      </Section>

      <Callout tone="success">
        <strong>Take-aways.</strong> Quantização é a principal alavanca para democratizar LLMs. INT8 com bitsandbytes
        é quase lossless para a maioria das tasks. INT4 com AWQ é o ponto ideal para produção — 4× menos memória
        com degradação controlada. GGUF Q4_K_M + Ollama para uso local zero-setup. Para serving de alta performance:
        vLLM + AWQ. QAT só vale para casos extremos (modelos pequenos, ≤3 bits, tasks críticas). Sempre valide
        no seu eval harness — degradação varia muito por task.
      </Callout>
    </div>
  );
}
